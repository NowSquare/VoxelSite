import assert from 'node:assert/strict';
import { test } from 'node:test';
import { webcrypto } from 'node:crypto';

globalThis.crypto ??= webcrypto;
globalThis.window = {};
globalThis.localStorage = { getItem: () => null, setItem() {} };
const stored = new Map();
globalThis.sessionStorage = { getItem: key => stored.get(key) ?? null, setItem: (key,value) => stored.set(key,value), removeItem: key => stored.delete(key) };
const { readAuthoringFile, saveAuthoringFile, captureAuthoringList, createAuthoringFile, deleteAuthoringFile, compileAuthoringStyles } = await import('../ui/src/authoring-workspace.js');
const response = data => ({ status:200, json:async()=>({ok:true,data}) });
const success = () => response({ content_sha256:'b'.repeat(64),draft_version:'draft:3',operation:{status:'succeeded',result:{}} });
test('Source writes never fetch a new precondition and preserve the displayed version', async()=>{
  const calls=[];
  globalThis.fetch=async(url,options)=>{calls.push({url,...options});return success();};
  await saveAuthoringFile({path:'index.php',content:'changed'}, {content_sha256:'a'.repeat(64),draft_version:'draft:1'});
  assert.equal(calls.length,1);const body=JSON.parse(calls[0].body);
  assert.equal(body.expected_content_sha256,'a'.repeat(64));assert.equal(body.base_draft_version,'draft:1');assert.match(body.operation_id,/^website_/);
});
test('A later read cannot replace a visual transformation’s captured source hash',async()=>{
  globalThis.fetch=async()=>response({path:'about.php',content:'first',content_sha256:'c'.repeat(64),draft_version:'draft:4'});
  const first=await readAuthoringFile('about.php');
  globalThis.fetch=async()=>response({path:'about.php',content:'second',content_sha256:'d'.repeat(64),draft_version:'draft:5'});
  await readAuthoringFile('about.php');let sent;
  globalThis.fetch=async(url,options)=>{sent=JSON.parse(options.body);return success();};
  await saveAuthoringFile({path:'about.php',content:'local'},first.data);
  assert.equal(sent.base_draft_version,'draft:4');assert.equal(sent.expected_content_sha256,'c'.repeat(64));
});
test('Lost source response keeps identity without persisting source contents',async()=>{
  const calls=[];globalThis.fetch=async(url,options)=>{calls.push(JSON.parse(options.body));if(calls.length===1)throw Error('Lost response');return success();};
  const source={content_sha256:'e'.repeat(64),draft_version:'draft:6'};const body={path:'lost.php',content:'private-local-source'};
  assert.equal((await saveAuthoringFile(body,source)).ok,false);
  assert.equal([...stored.values()].join('').includes('private-local-source'),false);
  assert.equal((await saveAuthoringFile(body,source)).ok,true);
  assert.equal(calls[0].operation_id,calls[1].operation_id);assert.deepEqual(calls[0],calls[1]);
});
test('File creation deletion and compilation retain their displayed inventory version',async()=>{
  const calls=[];globalThis.fetch=async(url,options)=>{calls.push(JSON.parse(options.body));return success();};
  captureAuthoringList({draft_version:'draft:7',files:[{path:'delete.js',content_sha256:'f'.repeat(64)}]});
  await createAuthoringFile('assets/js/new.js','draft:7');await deleteAuthoringFile('delete.js');await compileAuthoringStyles('draft:7');
  assert.deepEqual(calls.map(x=>x.base_draft_version),['draft:7','draft:7','draft:7']);assert.equal(calls[0].expected_content_sha256,null);assert.equal(calls[1].expected_content_sha256,'f'.repeat(64));
});
test('A missing captured source fails before sending a request',async()=>{
  globalThis.fetch=async()=>{throw Error('Unexpected request');};
  assert.equal((await saveAuthoringFile({path:'missing.php',content:'unsafe'})).error.code,'content_conflict');
  assert.equal((await createAuthoringFile('new.php')).error.code,'content_conflict');
});
