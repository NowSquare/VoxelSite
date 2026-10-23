import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';
import { createFormsActionsApi } from '../ui/src/forms-actions-workspace.js';
globalThis.crypto ||= webcrypto;
const hash = char => char.repeat(64);
function fixture() {
  const values = new Map(), calls = []; let getResult = {}, writeResult = { ok: true, data: {} }, actor = 1;
  const base = { get: async (url) => ({ ok: true, data: typeof getResult === 'function' ? getResult(url) : getResult }) };
  for (const method of ['put','post','delete']) base[method] = async (url, body) => { calls.push({method,url,body:structuredClone(body)}); return writeResult; };
  const storage = {getItem:k=>values.get(k), setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const options = { actor:()=>actor,storage }; const api = createFormsActionsApi(base, options);
  return {api,base,options,calls,values,get(value){getResult=value;},write(value){writeResult=value;},actor(value){actor=value;}};
}
test('displayed record version is exact and missing versions fail closed', async () => {
  const f=fixture(); const path='/forms/contact/submissions/7';
  assert.equal((await f.api.put(path,{notes:'draft'})).ok,false);assert.equal(f.calls.length,0);
  f.get({submissions:[{id:7,form_id:'contact',version:hash('a')}]});await f.api.get('/forms/contact/submissions');await f.api.put(path,{notes:'draft'});
  assert.equal(f.calls[0].body.version,hash('a'));assert.match(f.calls[0].body.request_id,/^studio_[a-f0-9]{32}$/);
});
test('lost responses replay exactly without storing private body text',async()=>{
  const f=fixture();f.get({submissions:[{id:7,form_id:'contact',version:hash('a')}]});await f.api.get('/forms/contact/submissions');f.write({ok:false,error:{code:'network_error'}});
  await f.api.put('/forms/contact/submissions/7',{notes:'PRIVATE_SENTINEL'});const first=f.calls[0].body;
  assert(!JSON.stringify([...f.values.values()]).includes('PRIVATE_SENTINEL'));
  const reloaded=createFormsActionsApi(f.base,f.options);await reloaded.put('/forms/contact/submissions/7',{notes:'PRIVATE_SENTINEL'});assert.deepEqual(f.calls[1].body,first);
  assert.equal((await reloaded.put('/forms/contact/submissions/7',{notes:'different'})).ok,false);assert.equal(f.calls.length,2);
});
test('background reads cannot bless overwriting a changed record',async()=>{
  const f=fixture();f.get({records:[{id:9,action_id:'contact',version:hash('a')}]});await f.api.get('/agentic/actions/contact/records');f.get({records:[{id:9,action_id:'contact',version:hash('b')}]});await f.api.get('/agentic/actions/contact/records');await f.api.put('/agentic/actions/contact/records/9',{status:'completed'});assert.equal(f.calls[0].body.version,hash('a'));
});
test('confirmed transactional versions advance subsequent edits',async()=>{
  const f=fixture();f.get({submissions:[{id:7,form_id:'contact',version:hash('a')}]});await f.api.get('/forms/contact/submissions');f.write({ok:true,data:{changed_records:[{kind:'form',entity_id:'contact',record_id:7,version:hash('b')}]}});await f.api.put('/forms/contact/submissions/7',{status:'read'});await f.api.put('/forms/contact/submissions/7',{notes:'note'});assert.equal(f.calls[1].body.version,hash('b'));assert.notEqual(f.calls[0].body.request_id,f.calls[1].body.request_id);
});
test('Action changes use captured configuration and retain exact replay',async()=>{
  const f=fixture();f.get({actions:[{id:'contact'}],configuration_version:hash('a')});await f.api.get('/agentic/actions');f.write({ok:false,error:{code:'network_error'}});await f.api.delete('/agentic/actions/contact');await f.api.delete('/agentic/actions/contact');assert.equal(f.calls[0].body.configuration_version,hash('a'));assert.deepEqual(f.calls[0].body,f.calls[1].body);
});
test('bulk changes carry exact displayed record IDs and versions',async()=>{
  const f=fixture();f.get({records:[{id:9,action_id:'contact',version:hash('a')},{id:10,action_id:'contact',version:hash('b')}]});await f.api.get('/agentic/actions/contact/records');await f.api.post('/agentic/actions/contact/records/bulk',{record_ids:[10,9],status:'cancelled'});assert.deepEqual(f.calls[0].body.records,[{record_id:10,version:hash('b')},{record_id:9,version:hash('a')}]);
});
test('purge retains reviewed cutoff and bounded exact set after network loss',async()=>{
  const f=fixture();f.get({records:[{id:9,action_id:'contact',version:hash('a')}],total:140});f.write({ok:false,error:{code:'network_error'}});await f.api.post('/agentic/actions/contact/records/purge',{older_than_days:90});f.get({records:[{id:10,action_id:'contact',version:hash('b')}],total:141});await f.api.post('/agentic/actions/contact/records/purge',{older_than_days:90});assert.deepEqual(f.calls[0].body,f.calls[1].body);assert.equal(f.calls[0].body.more,true);
});
test('account changes invalidate cached record authority',async()=>{
  const f=fixture();f.get({records:[{id:9,action_id:'contact',version:hash('a')}]});await f.api.get('/agentic/actions/contact/records');f.actor(2);assert.equal((await f.api.put('/agentic/actions/contact/records/9',{status:'cancelled'})).ok,false);assert.equal(f.calls.length,0);
});
test('account changes discard an in-flight private read and its versions',async()=>{
  const f=fixture();let finish;f.base.get=()=>new Promise(resolve=>{finish=resolve;});
  const pending=f.api.get('/agentic/actions/contact/records');f.actor(2);
  finish({ok:true,data:{records:[{id:9,action_id:'contact',version:hash('a'),notes:'private'}]}});
  assert.equal((await pending).ok,false);
  assert.equal((await f.api.put('/agentic/actions/contact/records/9',{status:'cancelled'})).ok,false);assert.equal(f.calls.length,0);
});
test('account changes discard a completed mutation result and block delayed dispatch',async()=>{
  const f=fixture();f.get({records:[{id:9,action_id:'contact',version:hash('a')}]});await f.api.get('/agentic/actions/contact/records');
  const pending=f.api.put('/agentic/actions/contact/records/9',{status:'cancelled'});f.actor(2);
  assert.equal((await pending).ok,false);assert.equal(f.calls.length,0);
});

test('bar migration saves the displayed settings with its captured version and exact retry identity', async()=>{
  const f=fixture();const settings={theme:'minimal-pill',visibility:'all-pages',pages:[],color_scheme:'dark',brand_color:'#123456'};
  f.get({settings,version:hash('a'),migration_required:true});await f.api.get('/agentic/actions/bar-settings');
  f.write({ok:false,error:{code:'network_error'}});await f.api.put('/agentic/actions/bar-settings',settings);await f.api.put('/agentic/actions/bar-settings',settings);
  assert.deepEqual(f.calls[1].body,f.calls[0].body);assert.equal(f.calls[0].body.configuration_version,hash('a'));assert.equal(f.calls[0].body.theme,'minimal-pill');
  f.write({ok:true,data:{operation:{version:hash('b'),effect:'draft_write',public_effects_immediate:false}}});await f.api.put('/agentic/actions/bar-settings',settings);
  await f.api.put('/agentic/actions/bar-settings',{theme:'floating-fab'});assert.equal(f.calls[3].body.configuration_version,hash('b'));
});
