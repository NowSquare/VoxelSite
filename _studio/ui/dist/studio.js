(()=>{var tr=e=>{throw TypeError(e)};var ji=(e,t,s)=>t.has(e)||tr("Cannot "+s);var xe=(e,t,s)=>(ji(e,t,"read from private field"),s?s.call(e):t.get(e)),lt=(e,t,s)=>t.has(e)?tr("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),It=(e,t,s,n)=>(ji(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),Ut=(e,t,s)=>(ji(e,t,"access private method"),s);var Vt,Wt,Ds,Gt,Tn,qi,Oi=class{constructor(t={}){lt(this,Tn);lt(this,Vt,new Map);lt(this,Wt,new Map);lt(this,Ds,!1);lt(this,Gt,new Map);for(let[s,n]of Object.entries(t))xe(this,Vt).set(s,n)}get(t,s=void 0){return xe(this,Vt).has(t)?xe(this,Vt).get(t):s}set(t,s){let n=xe(this,Vt).get(t);n!==s&&(xe(this,Vt).set(t,s),xe(this,Ds)?xe(this,Gt).has(t)?xe(this,Gt).get(t).newValue=s:xe(this,Gt).set(t,{newValue:s,oldValue:n}):Ut(this,Tn,qi).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return xe(this,Wt).has(t)||xe(this,Wt).set(t,new Set),xe(this,Wt).get(t).add(s),()=>{var n;(n=xe(this,Wt).get(t))==null||n.delete(s)}}batch(t){if(xe(this,Ds)){t();return}It(this,Ds,!0),xe(this,Gt).clear();try{t()}finally{It(this,Ds,!1);for(let[s,{newValue:n,oldValue:o}]of xe(this,Gt))Ut(this,Tn,qi).call(this,s,n,o);xe(this,Gt).clear()}}toJSON(){return Object.fromEntries(xe(this,Vt))}};Vt=new WeakMap,Wt=new WeakMap,Ds=new WeakMap,Gt=new WeakMap,Tn=new WeakSet,qi=function(t,s,n){let o=xe(this,Wt).get(t);if(o)for(let a of o)try{a(s,n)}catch(r){console.error(`[state] Error in "${t}" listener:`,r)}let i=xe(this,Wt).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(r){console.error("[state] Error in wildcard listener:",r)}};var P=new Oi({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});P.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});P.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Mn,Qs,en,tn,sn,nn,Kt,Ro,zi,Fi=class{constructor(){lt(this,Kt);lt(this,Mn,[]);lt(this,Qs,null);lt(this,en,!1);lt(this,tn,null);lt(this,sn,null);lt(this,nn,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return xe(this,Mn).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return It(this,Qs,t),this}beforeEach(t){return It(this,tn,t),this}start(){xe(this,en)||(It(this,en,!0),window.addEventListener("hashchange",()=>Ut(this,Kt,Ro).call(this)),Ut(this,Kt,Ro).call(this))}navigate(t){window.location.hash=`/${t}`}refresh(){It(this,sn,null),Ut(this,Kt,Ro).call(this)}get current(){return Ut(this,Kt,zi).call(this)}};Mn=new WeakMap,Qs=new WeakMap,en=new WeakMap,tn=new WeakMap,sn=new WeakMap,nn=new WeakMap,Kt=new WeakSet,Ro=async function(){if(xe(this,nn))return;let t=Ut(this,Kt,zi).call(this),s=xe(this,sn);if(!(t===s&&xe(this,en))){if(xe(this,tn)&&s!==null){It(this,nn,!0);try{if(await xe(this,tn).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{It(this,nn,!1)}}It(this,sn,t);for(let n of xe(this,Mn)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,r)=>{i[a]=decodeURIComponent(o[r+1])}),P.batch(()=>{P.set("route",n.pattern),P.set("routeParams",i)}),n.handler(i);return}}xe(this,Qs)?(P.set("route","404"),xe(this,Qs).call(this,t)):this.navigate("chat")}},zi=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var dt=new Fi;var nr="/_studio/api/router.php",cs=0;function uc(e,t){var s;t||["POST","PUT","DELETE"].includes(e)&&(cs++,cs===1&&((s=window.__vsSetGlobalStatus)==null||s.call(window,"saving")))}function Do(e,t,s){var n,o;s||["POST","PUT","DELETE"].includes(e)&&(cs=Math.max(0,cs-1),cs===0&&(t?(n=window.__vsSetGlobalStatus)==null||n.call(window,"saved"):(o=window.__vsSetGlobalStatus)==null||o.call(window,"error")))}async function Ho(e,t,s=null,n={}){var l;let{silent:o=!1,...i}=n,a={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let d=or();d&&(a["X-VS-Token"]=d)}s!==null&&(a["Content-Type"]="application/json");let r={method:e,headers:a,credentials:"same-origin",...i};s!==null&&(r.body=JSON.stringify(s)),uc(e,o);try{let[d,u]=t.split("?"),p=`${nr}?_path=${encodeURIComponent(d)}${u?"&"+u:""}`,c=await fetch(p,r),v=await c.json();return c.status===401?(P.get("user")&&P.set("user",null),Do(e,!1,o),v!=null&&v.error?{ok:!1,error:v.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!v.ok&&v.error?(v.error.code==="demo_mode"?(window.showToast&&window.showToast(v.error.message||"Demo mode \u2014 this action is disabled.","warning"),!o&&["POST","PUT","DELETE"].includes(e)&&(cs=Math.max(0,cs-1),cs===0&&((l=window.__vsSetGlobalStatus)==null||l.call(window,"idle")))):Do(e,!1,o),{ok:!1,error:v.error}):(Do(e,!0,o),{ok:!0,data:v.data||v})}catch{return Do(e,!1,o),{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var E={get:(e,t)=>Ho("GET",e,null,t),post:(e,t,s)=>Ho("POST",e,t,s),put:(e,t,s)=>Ho("PUT",e,t,s),delete:(e,t,s)=>Ho("DELETE",e,t,s)};async function Hs(e,t,s={}){var $,w;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onPromptId:a=()=>{},onFile:r=()=>{},onDone:l=()=>{},onEvaluation:d=()=>{},onWarning:u=()=>{},onError:p=()=>{},signal:c=null}=s,v=or(),m={"Content-Type":"application/json",Accept:"text/event-stream"};v&&(m["X-VS-Token"]=v);let g=!1,y=0,f=0,h=t.conversation_id||null;try{let de=function(J){if(!J.trim())return;let H="";for(let F of J.split(`
`))F.startsWith(":")||F.startsWith("data: ")&&(H+=F.slice(6));if(!H)return;let L;try{L=JSON.parse(H)}catch{return}switch(L.type||"message"){case"token":f++,n(L.content||"");break;case"status":o(L);break;case"conversation":h=L.conversation_id||h,i(L.conversation_id||"");break;case"prompt_id":a(L.prompt_id||0);break;case"file_complete":y++,r(L);break;case"done":g=!0,l(L);break;case"evaluation":d(L);break;case"warning":u(L.message||"");break;case"error":p(L);break}},k={method:"POST",headers:m,credentials:"same-origin",body:JSON.stringify(t)};c&&(k.signal=c);let[T,_]=e.split("?"),D=`${nr}?_path=${encodeURIComponent(T)}${_?"&"+_:""}`,q=await fetch(D,k);if(!q.ok){let J=await q.json().catch(()=>null);p({code:(($=J==null?void 0:J.error)==null?void 0:$.code)||"http_error",message:((w=J==null?void 0:J.error)==null?void 0:w.message)||`Server error (${q.status})`});return}let Q=q.body.getReader(),X=new TextDecoder,O="";for(;;){let{done:J,value:H}=await Q.read();if(J)break;O+=X.decode(H,{stream:!0});let L=O.split(`

`);O=L.pop();for(let N of L)de(N)}if(O.trim()&&de(O),!g){let J=h;J?(o("Waiting for server to finish..."),await sr(J,{onDone:l,onError:p,onFile:r,onStatus:o})):(y>0||f>0)&&l({files_modified:[],message:"",soft_close:!0})}}catch(k){if(k.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(y>0||f>0){let T=h;T?(o("Server is still generating \u2014 waiting for completion..."),await sr(T,{onDone:l,onError:p,onFile:r,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else p({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function sr(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var r;let a=0;for(let l=0;l<120;l++){await new Promise(d=>setTimeout(d,3e3));try{let{ok:d,data:u}=await E.get(`/ai/conversations/${e}`);if(!d||!((r=u==null?void 0:u.conversation)!=null&&r.prompts))continue;let p=u.conversation.prompts,c=p[p.length-1];if(!c)continue;let v=c.files_modified?JSON.parse(c.files_modified):[];if(v.length>a){for(let m=a;m<v.length;m++)n({path:v[m],action:"write"});a=v.length}if(c.status==="streaming"){let m=Math.round((Date.now()-new Date(c.created_at).getTime())/1e3);o(`Server is still generating... (${m}s)`);continue}c.status==="success"?t({message:c.ai_message||"",files_modified:v,revision_id:c.revision_id||null,polled:!0}):c.status==="partial"?t({message:c.ai_message||"",files_modified:v,partial:!0,polled:!0}):s({code:"generation_failed",message:c.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function or(){return P.get("sessionToken")}var vc="data-theme",Ui="dark";function ir(){let e=P.get("theme")||localStorage.getItem("vs-theme")||Ui;return ar(e),e}function ar(e){let t=e||Ui;return document.documentElement.setAttribute(vc,t),localStorage.setItem("vs-theme",t),P.set("theme",t),t}function No(){let e=P.get("theme")||Ui;return ar(e==="dark"?"light":"dark")}var rr=typeof document<"u"?document.createElement("span"):null;function b(e){return e?(rr.textContent=e,rr.innerHTML):""}function ge(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var mc={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function In(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(mc))if(t.endsWith(s))return n;return"plaintext"}function Vi(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function Bn(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),r=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:r===1?"Yesterday":r<30?`${r} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function _n(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function An(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function Pn(e,t=40){if(!e)return"";let s=e.replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/+$/,"");return s.length>t&&(s=s.substring(0,t-1)+"\u2026"),s}function we(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function ke(e,t){let s=null;e.addEventListener("mousedown",n=>{s=n.target}),e.addEventListener("click",n=>{n.target===e&&s===e&&t(n)})}function Ce({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var u,p;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let r=document.createElement("div");r.id="vs-confirm-overlay",r.className="vs-modal-overlay",r.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${b(e)}</h2>
          <p class="vs-modal-desc">${b(t)}</p>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">${b(n)}</button>
          <button id="vs-confirm-ok" class="vs-btn ${o?"vs-btn-danger":"vs-btn-primary"} vs-btn-sm" type="button">${b(s)}</button>
        </div>
      </div>
    `;let l=c=>{c.key==="Escape"&&(c.preventDefault(),d(!1))},d=c=>{document.removeEventListener("keydown",l),we(r),i(c)};document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible")),ke(r,()=>d(!1)),(u=document.getElementById("vs-confirm-cancel"))==null||u.addEventListener("click",()=>d(!1)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>d(!0)),document.addEventListener("keydown",l),setTimeout(()=>{var c;return(c=document.getElementById("vs-confirm-ok"))==null?void 0:c.focus()},220)})}function lr({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:r="",inputPattern:l=""}){return new Promise(d=>{var y,f;let u=document.getElementById("vs-prompt-overlay");u&&u.remove();let p=document.createElement("div");p.id="vs-prompt-overlay",p.className="vs-modal-overlay";let c=l?` pattern="${b(l)}"`:"",v=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${b(n)}" style="resize: vertical;">${b(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${b(n)}" value="${b(o)}"${c}>`;p.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${b(e)}</h2>
          ${t?`<p class="vs-modal-desc">${b(t)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${b(s)}</label>`:""}
          ${v}
          ${r?`<p class="text-xs text-vs-text-ghost" style="margin-top: 6px;">${b(r)}</p>`:""}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${b(i)}</button>
        </div>
      </div>
    `;let m=h=>{we(p),d(h)};document.body.appendChild(p),requestAnimationFrame(()=>p.classList.add("is-visible"));let g=p.querySelector("#vs-prompt-input");setTimeout(()=>g==null?void 0:g.focus(),220),ke(p,()=>m(null)),(y=p.querySelector("#vs-prompt-cancel"))==null||y.addEventListener("click",()=>m(null)),(f=p.querySelector("#vs-prompt-ok"))==null||f.addEventListener("click",()=>{m(((g==null?void 0:g.value)||"").trim())}),g==null||g.addEventListener("keydown",h=>{a==="textarea"?h.key==="Enter"&&(h.metaKey||h.ctrlKey)&&(h.preventDefault(),m(((g==null?void 0:g.value)||"").trim())):h.key==="Enter"&&(h.preventDefault(),m(((g==null?void 0:g.value)||"").trim())),h.key==="Escape"&&(h.preventDefault(),m(null))})})}var gc=new Set(["page","partial","component"]),fc=new Set(["partial","component"]),Wi={unsafe:"Contains dynamic PHP. Use the Code Editor for full control."};function Ns(e){if(!e||typeof e!="object")return{sourceFile:"",sourceKind:"unsafe",nodeKey:"",includeChain:[],instanceKey:"",editable:!1};let t=typeof e.sourceFile=="string"?e.sourceFile:"",s=typeof e.sourceKind=="string"?e.sourceKind:"unsafe",n=typeof e.nodeKey=="string"?e.nodeKey:"",o=e.editable===!0||e.editable==="true",i=[];Array.isArray(e.includeChain)?i=e.includeChain:typeof e.includeChain=="string"&&e.includeChain&&(i=e.includeChain.split(",").map(r=>r.trim()).filter(Boolean));let a=[t,s,n].filter(Boolean).join("::");return{sourceFile:t,sourceKind:s,nodeKey:n,includeChain:i,instanceKey:a,editable:o}}function jo(e){return e?gc.has(e.sourceKind)&&e.editable:!1}function dr(e){return e?jo(e)?null:e.sourceKind==="unsafe"&&!e.sourceFile?"Could not determine the source file. Changes cannot be saved safely.":Wi[e.sourceKind]||Wi.unsafe:Wi.unsafe}function cr(e){return e?fc.has(e.sourceKind):!1}var x={archive:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',database:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',inbox:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',panelLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',palette:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',mic:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>',micOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M16.95 16.95A7 7 0 0 1 5 12v-2"/><path d="M18.89 13.23A7 7 0 0 0 19 12v-2"/><path d="m2 2 20 20"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/></svg>',puzzle:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/></svg>',paintbrush:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>',penTool:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/></svg>'};var pr={success:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'},ur='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',vr=["success","error","warning","info"];function mr(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function Rn(e){e._dismissed||(e._dismissed=!0,e._autoTimer&&(clearTimeout(e._autoTimer),e._autoTimer=null),e.classList.add("vs-toast-exit"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>{e.parentNode&&e.remove()},250))}function I(e,t="success",s=3200){var a;if(!e)return;let n=mr(),o=vr.includes(t)?t:"success",i=document.createElement("div");i.className=`vs-toast vs-toast-${o}`,i.innerHTML=`
    <span class="vs-toast-icon">${pr[o]}</span>
    <span class="vs-toast-message">${b(String(e))}</span>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${ur}</button>
    <div class="vs-toast-progress" style="animation-duration: ${s}ms;"></div>
  `,(a=i.querySelector(".vs-toast-dismiss"))==null||a.addEventListener("click",r=>{r.stopPropagation(),Rn(i)}),n.appendChild(i),i._autoTimer=setTimeout(()=>Rn(i),s)}window.showToast=I;function Dn(e,t,s,n="success"){var l,d;if(!e)return;let o=mr(),i=vr.includes(n)?n:"success",a=8e3,r=document.createElement("div");r.className=`vs-toast vs-toast-${i}`,r.style.cursor="default",r.innerHTML=`
    <span class="vs-toast-icon">${pr[i]}</span>
    <span class="vs-toast-message">${b(String(e))}</span>
    <button type="button" class="vs-toast-action">${b(t)}</button>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${ur}</button>
    <div class="vs-toast-progress" style="animation-duration: ${a}ms;"></div>
  `,(l=r.querySelector(".vs-toast-action"))==null||l.addEventListener("click",u=>{u.stopPropagation(),s(),Rn(r)}),(d=r.querySelector(".vs-toast-dismiss"))==null||d.addEventListener("click",u=>{u.stopPropagation(),Rn(r)}),o.appendChild(r),r._autoTimer=setTimeout(()=>Rn(r),a)}var Hn=null;function gr(){return`
    <div class="vs-editor-layout">
      <!-- File Tree Sidebar -->
      <div id="editor-sidebar" class="vs-editor-sidebar" style="position: relative; display: flex; flex-direction: column;${(()=>{try{let e=JSON.parse(sessionStorage.getItem("vs-editor-state"));return e!=null&&e.sidebarWidth?` width: ${e.sidebarWidth}px;`:""}catch{return""}})()}">
        <div class="vs-editor-sidebar-header">
          <span class="vs-editor-sidebar-title">Explorer</span>
          <div style="display:flex;gap:2px;">
            <button id="editor-new-file" class="vs-btn vs-btn-ghost vs-btn-icon" title="New file" style="width:28px;height:28px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>
            </button>
            <button id="editor-refresh-tree" class="vs-btn vs-btn-ghost vs-btn-icon" title="Refresh file list" style="width:28px;height:28px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>
        </div>
        <div style="flex: 1; overflow-y: auto;">
          <!-- SITE FILES -->
          <div class="vs-explorer-section">
            <div class="vs-explorer-section-header" data-section="site">
              <svg class="vs-explorer-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span>SITE FILES</span>
            </div>
            <div id="editor-tree" class="vs-editor-tree" style="padding-bottom: 8px;">
              <div class="text-xs text-vs-text-ghost py-4 text-center">Loading files\u2026</div>
            </div>
          </div>
          <!-- SEO & AI -->
          <div class="vs-explorer-section">
            <div class="vs-explorer-section-header" data-section="config">
              <svg class="vs-explorer-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span>SEO & AI</span>
            </div>
            <div id="editor-tree-config" class="vs-editor-tree" style="padding-bottom: 8px;">
            </div>
          </div>
          <!-- SYSTEM PROMPTS -->
          <div class="vs-explorer-section">
            <div class="vs-explorer-section-header" data-section="prompts">
              <svg class="vs-explorer-caret" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span>SYSTEM PROMPTS</span>
            </div>
            <div id="editor-tree-prompts" class="vs-editor-tree" style="padding-bottom: 8px;">
            </div>
          </div>
        </div>
        <div id="editor-sidebar-resize" class="vs-editor-resize"></div>
      </div>

      <!-- Main Editor Area -->
      <div class="vs-editor-main">
        <!-- Editor Topbar -->
        <div class="vs-editor-topbar" style="display: flex; align-items: stretch; justify-content: space-between; border-bottom: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface); height: 44px;">
          <!-- Tab Bar Wrapper -->
          <div style="flex: 1; display: flex; align-items: stretch; min-width: 0; position: relative;">
            <!-- Scroll Left Button -->
            <button id="editor-tab-scroll-left" class="vs-tab-scroll-btn" style="display: none; position: absolute; left: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(to right, var(--vs-bg-surface) 60%, transparent); border: none; align-items: center; justify-content: flex-start; padding-left: 4px; z-index: 10; cursor: pointer; color: var(--vs-text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <!-- Tab Bar -->
            <div id="editor-tab-bar" class="vs-editor-tabs" style="flex: 1; min-width: 0; scroll-behavior: auto;">
              <div class="vs-editor-tab-empty"></div>
            </div>
            <!-- Scroll Right Button -->
            <button id="editor-tab-scroll-right" class="vs-tab-scroll-btn" style="display: none; position: absolute; right: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(to left, var(--vs-bg-surface) 60%, transparent); border: none; align-items: center; justify-content: flex-end; padding-right: 4px; z-index: 10; cursor: pointer; color: var(--vs-text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <!-- Editor Controls -->
          <div class="vs-editor-controls" style="display: flex; align-items: center; gap: 6px; padding: 0 12px; flex-shrink: 0;">
            <button id="editor-word-wrap-btn" class="vs-btn vs-btn-ghost vs-btn-icon" title="Toggle Word Wrap" style="width: 28px; height: 28px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16-3 3 3 3"/><path d="M3 12h14.5a1 1 0 0 1 0 7H13"/><path d="M3 19h6"/><path d="M3 5h18"/></svg>
            </button>
            <select id="editor-font-size-select" class="vs-input" title="Editor Text Size" style="height: 28px; font-size: 11px; padding: 0 24px 0 8px; width: auto; min-width: 60px; background-size: 12px; background-position: right 6px center;">
              <option value="11">11px</option>
              <option value="12">12px</option>
              <option value="13">13px</option>
              <option value="14">14px</option>
              <option value="15">15px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
            </select>
          </div>
        </div>

        <!-- Editor Host -->
        <div id="editor-host" class="vs-editor-host" style="position: relative;">
          <div id="editor-empty-state" class="vs-editor-empty">
            <div class="vs-empty-state-inner">
              <div class="vs-empty-state-icon">${x.fileCode}</div>
              <p class="vs-empty-state-title">No file open</p>
              <p class="vs-empty-state-desc">Select a file from the explorer to start editing,<br>or create a new file.</p>
            </div>
          </div>
          <div id="editor-monaco-container" style="width:100%;height:100%;display:none;"></div>
        </div>

        <!-- Editor Footer -->
        <div class="vs-editor-footer">
          <div id="editor-file-info" class="vs-code-meta">No file open</div>
          <div class="vs-editor-footer-actions">
            <span id="editor-status" class="vs-code-status" data-state="muted">Ready</span>
            <button id="editor-save-btn" class="vs-btn vs-btn-ghost vs-btn-xs" disabled>Saved</button>
          </div>
        </div>
      </div>
    </div>
  `}async function fr(){var ne;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,sidebarWidth:(e==null?void 0:e.sidebarWidth)||null,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(C=>C.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(C=>C.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,sidebarWidth:t.sidebarWidth,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)},reconcileMove:async(C,B)=>{if(t.disposed)return;let S=t.openTabs.find(G=>G.path===C);if(!S)return;S.path=B,t.activeTab===C&&(t.activeTab=B);let{ok:A,data:R}=await E.get(`/files/content?path=${encodeURIComponent(B)}`);A&&typeof(R==null?void 0:R.content)=="string"&&(S.baseline=R.content,S._buffer=R.content,S.dirty=!1,t.activeTab===B&&t.monacoInstance&&j(R.content,B)),await M(),q(),D(),me(),ye(),s()},reconcileDelete:async C=>{if(t.disposed)return;let B=t.openTabs.findIndex(S=>S.path===C);if(B!==-1){if(t.openTabs.splice(B,1),t.activeTab===C){let S=t.openTabs[Math.min(B,t.openTabs.length-1)];S?await F(S.path):(t.activeTab=null,oe(),me(),ye())}await M(),q(),D(),s()}}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),r=document.getElementById("editor-host"),l=document.getElementById("editor-empty-state"),d=document.getElementById("editor-monaco-container"),u=document.getElementById("editor-file-info"),p=document.getElementById("editor-status"),c=document.getElementById("editor-save-btn"),v=document.getElementById("editor-refresh-tree"),m=document.getElementById("editor-new-file"),g=document.getElementById("editor-sidebar"),y=document.getElementById("editor-sidebar-resize"),f=document.getElementById("editor-font-size-select"),h=document.getElementById("editor-word-wrap-btn");f&&(f.value=t.fontSize);let $=()=>{h&&(t.wordWrap?(h.style.color="var(--vs-accent)",h.style.backgroundColor="var(--vs-accent-dim)"):(h.style.color="var(--vs-text-ghost)",h.style.backgroundColor="transparent"))};$();let w=(C,B="muted")=>{p&&(p.textContent=C,p.dataset.state=B)},k=C=>{let B=t.files.find(S=>S.path===C);return(B==null?void 0:B.readonly)===!0},T=C=>{let B=C.toLowerCase();return B.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':B.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':B.endsWith(".js")||B.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},_=(C,B="")=>{let S=[],A={},R=Y=>{if(A[Y])return A[Y];let z=Y.split("/"),W=z[z.length-1],Z=z.slice(0,-1).join("/"),ve=B?B+Y:Y,re={name:W,path:ve,type:"folder",children:[]};return A[Y]=re,Z?R(Z).children.push(re):S.push(re),re};for(let Y of C){let W=(B&&Y.path.startsWith(B)?Y.path.substring(B.length):Y.path).split("/");if(W.length===1)S.push({name:W[0],path:Y.path,type:"file",meta:Y});else{let Z=W.slice(0,-1).join("/");R(Z).children.push({name:W[W.length-1],path:Y.path,type:"file",meta:Y})}}let G=Y=>{Y.sort((z,W)=>z.type!==W.type?z.type==="folder"?-1:1:z.name.localeCompare(W.name));for(let z of Y)z.type==="folder"&&G(z.children)};return G(S),S},D=()=>{if(!n)return;let C=(G,Y=0)=>G.map(z=>{var ie,Me;if(z.type==="folder"){let _e=t.expandedFolders.has(z.path);return`
            <div class="vs-tree-item" data-folder="${b(z.path)}" style="--tree-indent: ${Y};">
              <span class="vs-tree-folder-toggle" data-expanded="${_e}">${x.chevronRight}</span>
              <span class="vs-tree-item-icon">${_e?x.folderOpen||x.folder:x.folder}</span>
              <span class="vs-tree-item-name">${b(z.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${b(z.path)}" data-collapsed="${!_e}">
              ${C(z.children,Y+1)}
            </div>
          `}let W=t.activeTab===z.path,Z=t.openTabs.find(_e=>_e.path===z.path),ve=Z!=null&&Z.dirty?" \u2022":"",$e=k(z.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",be=((ie=z.meta)==null?void 0:ie.custom)===!0,Te=((Me=z.meta)==null?void 0:Me.protected)===!0,he="";return z.path==="assets/css/tailwind.css"?he=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:Te?be&&(he=`
            <button class="vs-tree-item-restore" data-restore-file="${b(z.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):he=`
            <button class="vs-tree-item-delete" data-delete-file="${b(z.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${b(z.path)}" data-active="${W}" style="--tree-indent: ${Y};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${T(z.path)}</span>
            <span class="vs-tree-item-name">${b(z.name)}${$e}${ve}</span>
            ${he}
          </div>
        `}).join(""),B=(G,Y,z)=>{let W=z.querySelector(".vs-explorer-caret");t.expandedSections.has(G)?(Y.style.display="block",z.classList.add("is-expanded")):(Y.style.display="none",z.classList.remove("is-expanded"))},S=document.querySelector('[data-section="site"]'),A=document.querySelector('[data-section="config"]'),R=document.querySelector('[data-section="prompts"]');S&&B("site",n,S),A&&o&&B("config",o,A),R&&i&&B("prompts",i,R),n.innerHTML=C(t.treeData.site),o&&(o.innerHTML=C(t.treeData.config)),i&&(i.innerHTML=C(t.treeData.prompts)),Tt()},q=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(C=>{let B=C.path===t.activeTab,S=C.path.split("/").pop(),R=k(C.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${b(C.path)}" data-active="${B}" data-dirty="${C.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${b(S)}${R}</span>
          <button class="vs-editor-tab-close" data-close-tab="${b(C.path)}" title="Close">${x.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',Mt(),de()}},Q=null,X=C=>{if(!a)return;let B=8,S=()=>{a.scrollLeft+=C==="left"?-B:B,de()};S(),Q=setInterval(S,16)},O=()=>{Q&&(clearInterval(Q),Q=null)},de=()=>{let C=document.getElementById("editor-tab-scroll-left"),B=document.getElementById("editor-tab-scroll-right");if(!a||!C||!B)return;let S=a.scrollLeft>0,A=a.scrollLeft<a.scrollWidth-a.clientWidth-1;C.style.display=S?"flex":"none",B.style.display=A?"flex":"none"};a&&(a.addEventListener("scroll",de,{passive:!0}),window.addEventListener("resize",de,{passive:!0}));let J=document.getElementById("editor-tab-scroll-left"),H=document.getElementById("editor-tab-scroll-right");J&&(J.addEventListener("mousedown",()=>X("left")),J.addEventListener("mouseup",O),J.addEventListener("mouseleave",O)),H&&(H.addEventListener("mousedown",()=>X("right")),H.addEventListener("mouseup",O),H.addEventListener("mouseleave",O));let L=()=>{l&&(l.style.display="none"),d&&(d.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},N=async C=>{if(t.disposed)return;let B=t.openTabs.find(Y=>Y.path===C);if(B){await F(C);return}w("Loading\u2026");let{ok:S,data:A,error:R}=await E.get(`/files/content?path=${encodeURIComponent(C)}`);if(!S){I((R==null?void 0:R.message)||"Could not load file.","error"),w("Load failed","error");return}let G=typeof(A==null?void 0:A.content)=="string"?A.content:"";B={path:C,baseline:G,dirty:!1},t.openTabs.push(B),L(),await F(C),j(G,C),w("Ready"),s()},F=async C=>{if(t.disposed)return;let B=t.openTabs.find(A=>A.path===t.activeTab);B&&t.monacoInstance&&(B._buffer=t.monacoInstance.getValue()),t.activeTab=C;let S=t.openTabs.find(A=>A.path===C);if(S&&t.monacoInstance){let A=S._buffer!==void 0?S._buffer:S.baseline;j(A,C)}me(),ye(),q(),setTimeout(()=>{if(a){let A=a.querySelector('.vs-editor-tab[data-active="true"]');if(A){let R=A.getBoundingClientRect(),G=a.getBoundingClientRect();R.left<G.left?a.scrollBy({left:R.left-G.left,behavior:"smooth"}):R.right>G.right&&a.scrollBy({left:R.right-G.right,behavior:"smooth"})}}},10),D(),s()},V=async C=>{let B=t.openTabs.find(A=>A.path===C);if(B!=null&&B.dirty&&!await Ce({title:"Discard unsaved changes?",description:`"${C}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let S=t.openTabs.findIndex(A=>A.path===C);if(S!==-1){if(t.openTabs.splice(S,1),t.activeTab===C){let A=t.openTabs[Math.min(S,t.openTabs.length-1)];A?await F(A.path):(t.activeTab=null,oe(),me(),ye())}q(),D(),s()}},te=async C=>{var Y,z;if((Y=window.demoGuard)!=null&&Y.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let B=C.split("/").pop();if(!await Ce({title:"Delete file?",description:`Are you sure you want to permanently delete "${B}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;w("Deleting\u2026");let{ok:A,error:R}=await E.delete(`/files?path=${encodeURIComponent(C)}`);if(!A){I((R==null?void 0:R.message)||"Could not delete file.","error"),w("Delete failed","error");return}let G=t.openTabs.findIndex(W=>W.path===C);if(G!==-1){if(t.openTabs.splice(G,1),t.activeTab===C){let W=t.openTabs[Math.min(G,t.openTabs.length-1)];W?await F(W.path):(t.activeTab=null,oe(),me(),ye())}q()}await M(),s(),I(`Deleted ${B}`,"success"),w("Ready")},ee=async C=>{var Y,z;if((Y=window.demoGuard)!=null&&Y.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let B=C.split("/").pop();if(!await Ce({title:"Reset system prompt?",description:`Are you sure you want to reset "${B}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;w("Resetting\u2026");let{ok:A,error:R}=await E.delete(`/files?path=${encodeURIComponent(C)}`);if(!A){I((R==null?void 0:R.message)||"Could not reset file.","error"),w("Reset failed","error");return}let G=t.openTabs.findIndex(W=>W.path===C);if(G!==-1){let{ok:W,data:Z}=await E.get(`/files/content?path=${encodeURIComponent(C)}`);if(W&&typeof(Z==null?void 0:Z.content)=="string"){let ve=t.openTabs[G];ve.baseline=Z.content,ve.dirty=!1,ve._buffer=Z.content,t.activeTab===C&&j(Z.content,C)}}ye(),await M(),s(),I(`Reset ${B} to default`,"success"),w("Ready")},j=(C,B)=>{var A;if(!t.monacoInstance||!t.monaco)return;let S=t.monacoInstance.getModel();S&&(t.monacoInstance.setValue(C),t.monaco.editor.setModelLanguage(S,In(B)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((A=window.canWrite)!=null&&A.call(window))||k(B)}))},oe=()=>{l&&(l.style.display=""),d&&(d.style.display="none")},me=()=>{if(!u)return;if(!t.activeTab){u.textContent="No file open";return}let C=t.openTabs.find(R=>R.path===t.activeTab),B=t.files.find(R=>R.path===t.activeTab),S=B!=null&&B.size?`${(Number(B.size)/1024).toFixed(1)} KB`:"",A=In(t.activeTab).toUpperCase();u.textContent=[t.activeTab,A,S].filter(Boolean).join(" \u2022 ")},ye=()=>{var S;if(!c)return;let C=t.openTabs.find(A=>A.path===t.activeTab);if(t.activeTab?k(t.activeTab)||!((S=window.canWrite)!=null&&S.call(window)):!1){c.disabled=!0,c.textContent="Read-Only",c.classList.remove("vs-btn-primary"),c.classList.add("vs-btn-ghost");return}if(!C||!C.dirty){c.disabled=!0,c.textContent="Saved",c.classList.remove("vs-btn-primary"),c.classList.add("vs-btn-ghost");return}c.disabled=!1,c.textContent="Save",c.classList.remove("vs-btn-ghost"),c.classList.add("vs-btn-primary")},tt=()=>{let C=t.openTabs.find(A=>A.path===t.activeTab);if(!C||!t.monacoInstance)return;let B=t.monacoInstance.getValue(),S=C.dirty;C.dirty=B!==C.baseline,S!==C.dirty&&(ye(),q(),C.dirty?w("Unsaved changes","warning"):w("Ready"))},rt=async()=>{var G,Y,z,W,Z;if((G=window.demoGuard)!=null&&G.call(window)||(Y=window.viewerGuard)!=null&&Y.call(window))return;let C=t.openTabs.find(ve=>ve.path===t.activeTab);if(!C||!C.dirty||!t.monacoInstance)return;let B=t.monacoInstance.getValue();c.disabled=!0,c.textContent="Saving\u2026",w("Saving\u2026");let{ok:S,error:A}=await E.put("/files/content",{path:C.path,content:B});if(!S){c.disabled=!1,c.textContent="Save",I((A==null?void 0:A.message)||"Could not save file.","error"),w("Save failed","error");return}C.baseline=B,C.dirty=!1,C._buffer=B,ye(),q(),D(),w(`${C.path}`,"muted"),C.path.toLowerCase().endsWith(".css")?(z=window.sendPreviewMessage)==null||z.call(window,"voxelsite:reload-css"):(W=window.sendPreviewMessage)==null||W.call(window,"voxelsite:reload"),setTimeout(()=>{var ve;return(ve=window.refreshPreview)==null?void 0:ve.call(window)},400),(Z=window.refreshPublishState)==null||Z.call(window,{silent:!0});let R=t.openTabs.find(ve=>ve.path==="assets/css/tailwind.css");R&&C.path!=="assets/css/tailwind.css"&&E.get("/files/content?path=assets/css/tailwind.css").then(({ok:ve,data:re})=>{ve&&typeof(re==null?void 0:re.content)=="string"&&(R.baseline=re.content,R._buffer=re.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(re.content))})},Tt=()=>{let C=B=>{B&&(B.querySelectorAll("[data-file]").forEach(S=>{S.addEventListener("click",A=>{A.target.closest("[data-delete-file]")||N(S.dataset.file)})}),B.querySelectorAll("[data-delete-file]").forEach(S=>{S.addEventListener("click",A=>{A.stopPropagation(),te(S.dataset.deleteFile)})}),B.querySelectorAll("[data-restore-file]").forEach(S=>{S.addEventListener("click",A=>{A.stopPropagation(),ee(S.dataset.restoreFile)})}),B.querySelectorAll("[data-compile-tailwind]").forEach(S=>{S.addEventListener("click",async A=>{var ve,re;if(A.stopPropagation(),(ve=window.demoGuard)!=null&&ve.call(window)||(re=window.viewerGuard)!=null&&re.call(window))return;S.style.opacity="0.4",S.style.pointerEvents="none",w("Compiling Tailwind\u2026");let{ok:R,data:G,error:Y}=await E.post("/files/compile-tailwind");if(S.style.opacity="",S.style.pointerEvents="",!R){I((Y==null?void 0:Y.message)||"Tailwind compilation failed.","error"),w("Compile failed","error");return}let z="assets/css/tailwind.css",W=t.openTabs.find($e=>$e.path===z);W&&(W.baseline=G.content,W.dirty=!1,t.activeTab===z&&t.monacoInstance&&t.monacoInstance.setValue(G.content));let Z=G.class_count??0;I(`Tailwind CSS recompiled \u2014 ${Z} utilities.`,"success"),w("Compiled")})}),B.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(S=>{S.addEventListener("click",A=>{A.stopPropagation();let R=S.closest(".vs-tree-item"),G=R.dataset.folder;if(!G)return;let Y=t.expandedFolders.has(G);Y?t.expandedFolders.delete(G):t.expandedFolders.add(G);let z=!Y,W=R.querySelector(".vs-tree-folder-toggle");W&&W.setAttribute("data-expanded",String(z));let Z=R.nextElementSibling;Z&&Z.classList.contains("vs-tree-folder-children")&&(Z.setAttribute("data-collapsed",String(!z)),Z.style.display=z?"":"none");let ve=R.querySelector(".vs-tree-item-icon");ve&&(ve.innerHTML=z?x.folderOpen||x.folder:x.folder),s()})}))};C(n),C(o),C(i),document.querySelectorAll(".vs-explorer-section-header").forEach(B=>{B.dataset.bound||(B.dataset.bound="true",B.addEventListener("click",()=>{let S=B.dataset.section,A=B.closest(".vs-explorer-section"),R=A==null?void 0:A.querySelector(".vs-editor-tree");!A||!R||(t.expandedSections.has(S)?(t.expandedSections.delete(S),B.classList.remove("is-expanded"),R.style.display="none"):(t.expandedSections.add(S),B.classList.add("is-expanded"),R.style.display="block"),s())}))})},Mt=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(C=>{C.addEventListener("click",B=>{B.target.closest("[data-close-tab]")||F(C.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(C=>{C.addEventListener("click",B=>{B.stopPropagation(),V(C.dataset.closeTab)})}))};if(y&&g){let C=!1;y.addEventListener("mousedown",B=>{B.preventDefault(),C=!0,y.classList.add("is-dragging");let S=R=>{if(!C)return;let G=Math.min(400,Math.max(200,R.clientX));g.style.width=G+"px"},A=()=>{C=!1,y.classList.remove("is-dragging"),document.removeEventListener("mousemove",S),document.removeEventListener("mouseup",A),t.sidebarWidth=g.offsetWidth,s()};document.addEventListener("mousemove",S),document.addEventListener("mouseup",A)})}c==null||c.addEventListener("click",rt),f==null||f.addEventListener("change",C=>{let B=parseInt(C.target.value,10);t.fontSize=B,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:B}),s()}),h==null||h.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,$(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),v==null||v.addEventListener("click",()=>M()),m==null||m.addEventListener("click",async()=>{var Y,z,W;if((Y=window.demoGuard)!=null&&Y.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let C=await lr({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!C||!C.trim())return;let B=C.trim(),S=(W=B.split(".").pop())==null?void 0:W.toLowerCase(),A=["php","css","js","json"];if(!S||!A.includes(S)){I(`Only ${A.join(", ")} files can be created.`,"warning");return}w("Creating\u2026");let{ok:R,error:G}=await E.post("/files/create",{path:B});if(!R){I((G==null?void 0:G.message)||"Could not create file.","error"),w("Create failed","error");return}await M(),await N(B),I(`Created ${B}`,"success")});let As=C=>{if(t.disposed){document.removeEventListener("keydown",As);return}(C.metaKey||C.ctrlKey)&&C.key==="s"&&(C.preventDefault(),rt())};document.addEventListener("keydown",As);let M=async()=>{var A;let{ok:C,data:B,error:S}=await E.get("/files");if(!C||!((A=B==null?void 0:B.files)!=null&&A.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=B.files,t.treeData={site:_(B.files.filter(R=>!R.path.startsWith("_prompts/")&&!R.path.startsWith("_root/"))),config:_(B.files.filter(R=>R.path.startsWith("_root/")),"_root/"),prompts:_(B.files.filter(R=>R.path.startsWith("_prompts/")),"_prompts/")},D()},U=async()=>{if(!d)return;let C;try{C=await Oo()}catch{I("Monaco editor is not available.","warning");return}t.monaco=C;let B=js();C.editor.setTheme(B);let S=C.editor.create(d,{value:"",language:"php",theme:B,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=S,S.onDidChangeModelContent(()=>tt()),S.addCommand(C.KeyMod.CtrlCmd|C.KeyCode.KeyK,async()=>{var Ie;if(t.monacoInstance.getOption(C.editor.EditorOption.readOnly)){I("Cannot use inline AI on a read-only file.","warning");return}let R=t.activeTab;if(!R)return;let G=t.monacoInstance.getModel(),Y=t.monacoInstance.getSelection(),z=G.getValueInRange(Y);if(!z||z.trim()===""){let ie=t.monacoInstance.getPosition(),Me=G.getLineContent(ie.lineNumber);if(Me.trim()===""){I("Highlight a block of code to edit.","warning");return}z=Me,t.monacoInstance.setSelection(new C.Range(ie.lineNumber,1,ie.lineNumber,G.getLineMaxColumn(ie.lineNumber)))}let W=await A(R);if(!W)return;let Z=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let ve=new AbortController,re=0,$e=Date.now(),be=document.createElement("div");be.className="vs-inline-ai-overlay",be.innerHTML=`
        <div class="vs-inline-ai-card">
          <div class="vs-inline-ai-spinner"></div>
          <div class="vs-inline-ai-status">
            <span class="vs-inline-ai-timer" id="ai-gen-timer">0s</span>
            <span class="vs-inline-ai-dot">\xB7</span>
            <span class="vs-inline-ai-step" id="ai-gen-step">Reading your site\u2026</span>
            <span class="vs-inline-ai-dot" id="ai-gen-token-dot" style="display:none;">\xB7</span>
            <span class="vs-inline-ai-tokens" id="ai-gen-tokens"></span>
          </div>
          <button class="vs-inline-ai-stop" id="ai-gen-stop">Stop</button>
        </div>
      `,document.body.appendChild(be),requestAnimationFrame(()=>be.classList.add("is-visible"));let Te=be.querySelector("#ai-gen-timer"),he=setInterval(()=>{let ie=Math.floor((Date.now()-$e)/1e3);Te&&(Te.textContent=`${ie}s`)},1e3);(Ie=be.querySelector("#ai-gen-stop"))==null||Ie.addEventListener("click",()=>{ve.abort()}),w("AI is editing...","muted");try{await Hs("/ai/prompt",{user_prompt:W,action_type:"inline_edit",action_data:{path:R,selection:z}},{signal:ve.signal,onStatus:ie=>{let Me=be.querySelector("#ai-gen-step"),_e=typeof ie=="string"?ie:ie.message||"Generating\u2026";Me&&(Me.textContent=_e)},onToken:()=>{re++;let ie=be.querySelector("#ai-gen-tokens"),Me=be.querySelector("#ai-gen-token-dot");ie&&(ie.textContent=`${re} tokens`),Me&&(Me.style.display="")},onFile:()=>{let ie=be.querySelector("#ai-gen-step");ie&&(ie.textContent="Applying changes\u2026")},onError:ie=>{I(ie.message||"Generation failed","error")},onDone:async ie=>{var _e;if(ie.cancelled){I("Generation cancelled","info");return}if((_e=ie.files_modified)==null?void 0:_e.some(Xe=>(typeof Xe=="string"?Xe:(Xe==null?void 0:Xe.path)||"").replace(/^\//,"")===R.replace(/^\//,""))){let{ok:Xe,data:le}=await E.get(`/files/content?path=${encodeURIComponent(R)}&_t=${Date.now()}`);if(Xe&&(le!=null&&le.content)){let Ae=le.content;await E.put("/files/content",{path:R,content:Z}),t.monacoInstance.getModel().setValue(Ae);let zt=t.openTabs.find(it=>it.path===R);zt&&(zt._buffer=Ae,zt.baseline=Z),tt(),I("Review changes and save.","success")}}else ie.partial||I("Complete (No changes made to this file)","info")}})}finally{clearInterval(he),t.monacoInstance.updateOptions({readOnly:!1}),be.classList.remove("is-visible"),setTimeout(()=>be.remove(),300),w("Ready","muted")}});function A(R){return new Promise(G=>{var Te;let Y=document.getElementById("vs-inline-ai-prompt-overlay");Y&&Y.remove();let z=R.split("/").pop(),W=document.createElement("div");W.id="vs-inline-ai-prompt-overlay",W.className="vs-modal-overlay",W.innerHTML=`
          <div class="vs-inline-ai-prompt">
            <div class="vs-inline-ai-prompt-header">
              <svg class="vs-inline-ai-prompt-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span class="vs-inline-ai-prompt-title">Edit with AI</span>
              <span class="vs-inline-ai-prompt-subtitle" title="${R}">${z}</span>
            </div>
            <div class="vs-inline-ai-prompt-body">
              <div class="vs-inline-ai-input-wrap">
                <textarea id="vs-inline-ai-input" class="vs-inline-ai-prompt-input" rows="1" placeholder="Describe your changes\u2026" spellcheck="false"></textarea>
                <button id="vs-inline-ai-go" class="vs-inline-ai-send" type="button" title="Generate (\u2318\u21B5)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                </button>
              </div>
              <div class="vs-inline-ai-prompt-footer">
                <span class="vs-inline-ai-prompt-hint"><kbd>\u2318</kbd><kbd>\u21B5</kbd> to generate \xB7 <kbd>Esc</kbd> to cancel</span>
              </div>
            </div>
          </div>
        `;let Z=he=>{document.removeEventListener("keydown",ve),we(W),G(he)},ve=he=>{he.key==="Escape"&&(he.preventDefault(),Z(null))};document.body.appendChild(W),requestAnimationFrame(()=>W.classList.add("is-visible"));let re=W.querySelector("#vs-inline-ai-input"),$e=()=>{re.style.height="auto",re.style.height=Math.min(re.scrollHeight,160)+"px"};re.addEventListener("input",$e),setTimeout(()=>re==null?void 0:re.focus(),200);let be=null;W.addEventListener("mousedown",he=>{be=he.target}),W.addEventListener("click",he=>{he.target===W&&be===W&&Z(null)}),(Te=W.querySelector("#vs-inline-ai-go"))==null||Te.addEventListener("click",()=>{let he=((re==null?void 0:re.value)||"").trim();he&&Z(he)}),re==null||re.addEventListener("keydown",he=>{if(he.key==="Enter"&&(he.metaKey||he.ctrlKey)){he.preventDefault();let Ie=((re==null?void 0:re.value)||"").trim();Ie&&Z(Ie)}}),document.addEventListener("keydown",ve)})}};if(await Promise.all([M(),U()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:C,active:B}=t._pendingRestore;t._pendingRestore=null;for(let S of C){if(!t.files.some(G=>G.path===S))continue;let{ok:A,data:R}=await E.get(`/files/content?path=${encodeURIComponent(S)}`);A&&typeof(R==null?void 0:R.content)=="string"&&t.openTabs.push({path:S,baseline:R.content,dirty:!1})}if(t.openTabs.length>0){let S=B&&t.openTabs.find(A=>A.path===B)?B:t.openTabs[0].path;L(),await F(S),j(((ne=t.openTabs.find(A=>A.path===S))==null?void 0:ne.baseline)||"",S),w("Ready")}}}function js(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function Oo(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:Hn||(Hn=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,r){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw Hn=null,t}),Hn)}async function Nn(e=""){var Q,X,O,de,J;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal vs-code-modal" id="vs-code-modal">
      <div class="vs-code-modal-toolbar">
        <h2 class="vs-code-modal-title">Code Editor</h2>
        <div class="vs-code-select-wrap">
          <select id="vs-code-file-select" class="vs-input"></select>
        </div>
        <div class="vs-code-toolbar-actions">
          <button id="vs-code-reload-btn" type="button" class="vs-btn vs-btn-ghost vs-btn-sm">Reload</button>
          <button id="vs-code-save-btn" type="button" class="vs-btn vs-btn-primary vs-btn-sm" disabled>Save</button>
          <button id="vs-code-close-btn" type="button" class="vs-btn vs-btn-secondary vs-btn-sm">Close</button>
        </div>
      </div>
      <div class="vs-code-editor-shell">
        <div id="vs-code-editor-host" class="vs-code-editor-host">
          <div class="text-sm text-vs-text-ghost py-12 text-center">Loading editor\u2026</div>
        </div>
      </div>
      <div class="vs-code-modal-footer">
        <div id="vs-code-meta" class="vs-code-meta">Loading files\u2026</div>
        <div id="vs-code-status" class="vs-code-status">Initializing\u2026</div>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),r=s.querySelector("#vs-code-meta"),l=s.querySelector("#vs-code-status"),d=s.querySelector("#vs-code-editor-host"),u={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},p=(H,L="muted")=>{l&&(l.textContent=H,l.dataset.state=L)},c=()=>u.files.find(H=>H.path===u.path)||null,v=()=>!!u.editor&&u.editor.getValue()!==u.baseline,m=()=>{if(!r)return;let H=c();if(!H){r.textContent="No file selected";return}let L=H.size?`${(Number(H.size)/1024).toFixed(1)} KB`:"0 KB",N=H.modified?new Date(H.modified).toLocaleString():"Unknown date";r.textContent=`${H.path} \u2022 ${L} \u2022 ${N}`},g=window.IS_DEMO||!((Q=window.canWrite)!=null&&Q.call(window)),y=()=>{if(g)return!0;let H=c();return(H==null?void 0:H.readonly)===!0},f=()=>{if(!o)return;if(y()){o.disabled=!0,o.textContent="Read Only",p("Read-only mode","muted");return}let L=v();o.disabled=!L,o.textContent=L?"Save Changes":"Saved",L?p("Unsaved changes","warning"):u.path&&p(u.path||"Ready","muted")},h=async()=>{var H;u.closed||v()&&!await Ce({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(u.closed=!0,(H=u.editorCleanup)!=null&&H.dispose&&(u.editorCleanup.dispose(),u.editorCleanup=null),u.editor&&(u.editor.dispose(),u.editor=null),we(s))},$=(H,L=null)=>{if(!u.editor)return;u.editor.setValue(H),u.baseline=H;let N=(L==null?void 0:L.language)||In(u.path);u.editor.setLanguage&&u.editor.setLanguage(N),u.editor.setReadOnly&&u.editor.setReadOnly(y()),m(),f()},w=async(H,{silent:L=!1}={})=>{if(!H||!u.editor)return!1;u.path=H,L||p("Loading file\u2026");let{ok:N,data:F,error:V}=await E.get(`/files/content?path=${encodeURIComponent(H)}`);if(!N)return I((V==null?void 0:V.message)||"Could not load file.","error"),p("Load failed","error"),!1;let te=typeof(F==null?void 0:F.content)=="string"?F.content:"";return $(te,(F==null?void 0:F.file)||c()),!0},k=async()=>v()?await Ce({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,T=async H=>{if(!H||H===u.path)return;if(!await k()){n&&(n.value=u.path);return}await w(H)},_=async()=>{var F,V,te;if(!u.editor||!u.path||!o)return;let H=u.editor.getValue();if(H===u.baseline){f();return}o.disabled=!0,o.textContent="Saving\u2026",p("Saving\u2026");let{ok:L,error:N}=await E.put("/files/content",{path:u.path,content:H});if(!L){o.disabled=!1,o.textContent="Save Changes",I((N==null?void 0:N.message)||"Could not save file.","error"),p("Save failed","error");return}u.baseline=H,f(),p(u.path||"Ready","muted"),u.path.toLowerCase().endsWith(".css")?(F=window.sendPreviewMessage)==null||F.call(window,"voxelsite:reload-css"):(V=window.sendPreviewMessage)==null||V.call(window,"voxelsite:reload"),setTimeout(()=>{var ee;return(ee=window.refreshPreview)==null?void 0:ee.call(window)},400),(te=window.refreshPublishState)==null||te.call(window,{silent:!0})},D=H=>{H.key==="Escape"&&(H.preventDefault(),h())};a==null||a.addEventListener("click",()=>h()),i==null||i.addEventListener("click",async()=>{!u.path||!await k()||await w(u.path)}),o==null||o.addEventListener("click",()=>_()),n==null||n.addEventListener("change",H=>{T(H.target.value)}),s.addEventListener("click",H=>{H.target===s&&h()}),document.addEventListener("keydown",D);let q=()=>document.removeEventListener("keydown",D);s.addEventListener("transitionend",()=>{document.body.contains(s)||q()});try{let H=await E.get("/files");if(!H.ok||!((O=(X=H.data)==null?void 0:X.files)!=null&&O.length)){let V=((de=H.error)==null?void 0:de.message)||"No editable files found.";I(V,"error"),h();return}let L=H.data.files;u.files=L,n&&(n.innerHTML=L.map(V=>{let te=V.group?`${String(V.group).toUpperCase()} \xB7 `:"";return`<option value="${b(V.path)}">${b(te+V.path)}</option>`}).join(""));let N=((J=L.find(V=>V.path===e))==null?void 0:J.path)||L[0].path;u.path=N,n&&(n.value=N),d.innerHTML="";let F=null;try{F=await Oo()}catch{I("Monaco is not available yet. Using fallback editor.","warning"),p("Fallback editor active","warning")}if(F!=null&&F.editor){let V=js();F.editor.setTheme(V);let te=F.editor.create(d,{value:"",language:In(N),theme:V,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",readOnly:y(),fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});u.editor={getValue:()=>te.getValue(),setValue:ee=>te.setValue(ee),setLanguage:ee=>{let j=te.getModel();j&&F.editor.setModelLanguage(j,ee)},setReadOnly:ee=>te.updateOptions({readOnly:ee}),dispose:()=>te.dispose()},u.editorCleanup=te.onDidChangeModelContent(()=>{f()})}else{d.innerHTML=`<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"${y()?" readonly":""}></textarea>`;let V=d.querySelector("#vs-code-editor-fallback"),te=()=>f();V==null||V.addEventListener("input",te),u.editor={getValue:()=>(V==null?void 0:V.value)||"",setValue:ee=>{V&&(V.value=ee)},setLanguage:()=>{},setReadOnly:ee=>{V&&(V.readOnly=ee)},dispose:()=>{V==null||V.removeEventListener("input",te)}}}await w(N,{silent:!0}),p("Ready")}catch(H){I((H==null?void 0:H.message)||"Could not initialize code editor.","error"),h()}finally{let H=new MutationObserver(()=>{document.body.contains(s)||(q(),H.disconnect())});H.observe(document.body,{childList:!0,subtree:!0})}}var ce=Object.freeze({SET_TEXT:"set_text",SET_ATTRIBUTE:"set_attribute",ADD_CLASS_TOKEN:"add_class_token",REMOVE_CLASS_TOKEN:"remove_class_token",SET_CLASS_LIST:"set_class_list",MOVE_BEFORE:"move_before",MOVE_AFTER:"move_after",INSERT_NODE:"insert_node",DELETE_NODE:"delete_node",REPLACE_HTML:"replace_html",FALLBACK:"fallback"}),hr=0;function mt(){hr++;let e=Math.random().toString(36).substring(2,6);return`op_${Date.now()}_${hr}_${e}`}function Ki(e,t,s,n){return{id:mt(),type:ce.SET_TEXT,address:e,payload:{oldText:t,newText:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function jn(e,t,s,n,o){return{id:mt(),type:ce.SET_ATTRIBUTE,address:e,payload:{attrName:t,oldValue:s,newValue:n},filePath:o||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function yr(e,t,s,n,o,i){return{id:mt(),type:ce.SET_CLASS_LIST,address:e,payload:{oldClassStr:t,newClassStr:s,additions:n,removals:o},filePath:i||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function xr(e,t,s,n,o){return{id:mt(),type:ce.DELETE_NODE,address:e,payload:{outerHTML:t,parentAddress:n||null,siblingIndex:typeof o=="number"?o:-1},filePath:s||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function wr(e,t,s,n){return{id:mt(),type:ce.REPLACE_HTML,address:e,payload:{oldHTML:t,newHTML:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function kr(e){if(!e||!e.type)return null;switch(e.type){case ce.SET_TEXT:return{...e,id:mt(),payload:{oldText:e.payload.newText,newText:e.payload.oldText}};case ce.SET_ATTRIBUTE:return{...e,id:mt(),payload:{attrName:e.payload.attrName,oldValue:e.payload.newValue,newValue:e.payload.oldValue}};case ce.ADD_CLASS_TOKEN:return{...e,id:mt(),type:ce.REMOVE_CLASS_TOKEN};case ce.REMOVE_CLASS_TOKEN:return{...e,id:mt(),type:ce.ADD_CLASS_TOKEN};case ce.SET_CLASS_LIST:return{...e,id:mt(),payload:{oldClassStr:e.payload.newClassStr,newClassStr:e.payload.oldClassStr,additions:e.payload.removals,removals:e.payload.additions}};case ce.DELETE_NODE:return{...e,id:mt(),type:ce.INSERT_NODE,payload:{html:e.payload.outerHTML,parentAddress:e.payload.parentAddress||null,siblingIndex:e.payload.siblingIndex??-1}};case ce.REPLACE_HTML:return{...e,id:mt(),payload:{oldHTML:e.payload.newHTML,newHTML:e.payload.oldHTML}};case ce.MOVE_BEFORE:case ce.MOVE_AFTER:return{...e,id:mt(),payload:{fromIndex:e.payload.toIndex,toIndex:e.payload.fromIndex}};case ce.FALLBACK:return null;default:return null}}function Xi(e){var t,s,n,o,i,a,r,l,d,u,p,c,v;if(!e)return{valid:!1,reason:"Operation is null"};if(!e.type)return{valid:!1,reason:"Missing operation type"};if(!e.id)return{valid:!1,reason:"Missing operation ID"};if(e.type===ce.FALLBACK)return{valid:!0};if(!e.address)return{valid:!1,reason:"Missing source address"};switch(e.type){case ce.SET_TEXT:if(typeof((t=e.payload)==null?void 0:t.newText)!="string")return{valid:!1,reason:"SET_TEXT requires payload.newText"};break;case ce.SET_ATTRIBUTE:if(!((s=e.payload)!=null&&s.attrName))return{valid:!1,reason:"SET_ATTRIBUTE requires payload.attrName"};break;case ce.ADD_CLASS_TOKEN:case ce.REMOVE_CLASS_TOKEN:if(!((n=e.payload)!=null&&n.token))return{valid:!1,reason:`${e.type} requires payload.token`};break;case ce.SET_CLASS_LIST:if(!Array.isArray((o=e.payload)==null?void 0:o.additions)||!Array.isArray((i=e.payload)==null?void 0:i.removals))return{valid:!1,reason:"SET_CLASS_LIST requires payload.additions and payload.removals arrays"};break;case ce.DELETE_NODE:if(!((a=e.payload)!=null&&a.outerHTML))return{valid:!1,reason:"DELETE_NODE requires payload.outerHTML"};break;case ce.INSERT_NODE:if(!((r=e.payload)!=null&&r.html))return{valid:!1,reason:"INSERT_NODE requires payload.html"};if(typeof((l=e.payload)==null?void 0:l.siblingIndex)!="number"||e.payload.siblingIndex<0)return{valid:!1,reason:"INSERT_NODE requires payload.siblingIndex (>= 0) for deterministic reinsertion"};if(!((d=e.payload)!=null&&d.parentAddress))return{valid:!1,reason:"INSERT_NODE requires payload.parentAddress for reinsertion target"};break;case ce.REPLACE_HTML:if(!((u=e.payload)!=null&&u.oldHTML)||!((p=e.payload)!=null&&p.newHTML))return{valid:!1,reason:"REPLACE_HTML requires payload.oldHTML and payload.newHTML"};break;case ce.MOVE_BEFORE:case ce.MOVE_AFTER:if(typeof((c=e.payload)==null?void 0:c.fromIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.fromIndex`};if(typeof((v=e.payload)==null?void 0:v.toIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.toIndex`};break}return{valid:!0}}function Yi(e){return{[ce.SET_TEXT]:"Text edit",[ce.SET_ATTRIBUTE]:"Attribute change",[ce.ADD_CLASS_TOKEN]:"Add class",[ce.REMOVE_CLASS_TOKEN]:"Remove class",[ce.SET_CLASS_LIST]:"Style change",[ce.MOVE_BEFORE]:"Move element",[ce.MOVE_AFTER]:"Move element",[ce.INSERT_NODE]:"Insert element",[ce.DELETE_NODE]:"Delete element",[ce.REPLACE_HTML]:"Source edit",[ce.FALLBACK]:"Legacy edit"}[e]||e}var Er=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),$r=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]);function On(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function Cr(e,t,s){let n=On(e,t);if(!n)return null;if($r.has(s)||n.trimEnd().endsWith("/>"))return{element:n,startIndex:t,endIndex:t+n.length};let o=t+n.length,i=new RegExp(`<${s}[\\s>]`,"gi"),a=new RegExp(`</${s}\\s*>`,"gi"),r=1,l=o,d=Math.min(e.length,t+5e4);for(;l<d&&r>0;){i.lastIndex=l,a.lastIndex=l;let u=i.exec(e),p=a.exec(e);if(!p)return null;let c=u?u.index:1/0,v=p.index;c<v&&c<d?(r++,l=c+u[0].length):(r--,l=v+p[0].length)}return r!==0?null:{element:e.substring(t,l),startIndex:t,endIndex:l}}function qn(e,t){if(!t)return null;let s=t.lastIndexOf(":");if(s===-1)return null;let n=parseInt(t.substring(s+1),10);if(isNaN(n)||n<0)return null;let o=/<([a-z][a-z0-9]*)[\s>]/gi,i,a=0;for(;(i=o.exec(e))!==null;){let r=i[1].toLowerCase();if(!(Er.has(r)||e.substring(i.index,i.index+500).includes("data-vx-source"))){if(a===n){let d=Cr(e,i.index,r);return d?{...d,tag:r}:null}a++}}return null}function Gi(e,t,s,n){if(n==null){let a=new RegExp(`\\s+${t}=["'][^"']*["']`,"i");return a.test(e)?e.replace(a,""):null}let o=new RegExp(`(${t}=["'])([^"']*)(["'])`,"i");return e.match(o)?e.replace(o,`$1${n}$3`):s==null?e.replace(/>$/,` ${t}="${n}">`):null}function Fo(e,t){if(!e||!e.type)return{content:t,applied:!1,reason:"null or untyped operation"};let s=Xi(e);if(!s.valid)return{content:t,applied:!1,reason:`validation failed: ${s.reason}`};if(e.type===ce.FALLBACK)return{content:t,applied:!1,reason:"fallback ops are not persistable via applyOp"};switch(e.type){case ce.SET_TEXT:return hc(e,t);case ce.SET_ATTRIBUTE:return bc(e,t);case ce.SET_CLASS_LIST:return yc(e,t);case ce.REPLACE_HTML:return xc(e,t);case ce.DELETE_NODE:return wc(e,t);case ce.INSERT_NODE:return kc(e,t);default:return{content:t,applied:!1,reason:`unsupported op type: ${e.type}`}}}function hc(e,t){var i;let{oldText:s,newText:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=qn(t,o);if(a){let r=On(t,a.startIndex);if(r&&!$r.has(a.tag)){let l=a.element.lastIndexOf("</");if(l>r.length){let d=a.element.substring(r.length,l);if(!(s&&qo(d)!==qo(s))){let u=a.element.substring(l),p=r+n+u;return{content:t.substring(0,a.startIndex)+p+t.substring(a.endIndex),applied:!0,strategy:"nodeKey"}}}}}}if(s){let a=t.split(s).length-1;return a===0?{content:t,applied:!1,reason:"oldText not found in source"}:a>1?{content:t,applied:!1,reason:"ambiguous: oldText appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data (no nodeKey, no oldText)"}}function bc(e,t){var a;let{attrName:s,oldValue:n,newValue:o}=e.payload,i=(a=e.address)==null?void 0:a.nodeKey;if(i){let r=qn(t,i);if(r){let l=On(t,r.startIndex);if(l)if(n!=null){let d=l.includes(`${s}="${n}"`),u=l.includes(`${s}='${n}'`);if(!(!d&&!u)){let p=Gi(l,s,n,o);if(p!==null)return{content:t.substring(0,r.startIndex)+p+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}else{let d=Gi(l,s,n,o);if(d!==null)return{content:t.substring(0,r.startIndex)+d+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}}if(n!=null){let r=`${s}="${n}"`,l=t.split(r).length-1;if(l===0){let d=`${s}='${n}'`,u=t.split(d).length-1;return u===0?{content:t,applied:!1,reason:`attribute ${s}="${n}" not found`}:u>1?{content:t,applied:!1,reason:`ambiguous: ${s}='${n}' appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}='${br(n)}'`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(d,`${s}='${o}'`),applied:!0,strategy:"contentMatch"}}return l>1?{content:t,applied:!1,reason:`ambiguous: ${s}="${n}" appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}="${br(n)}"`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(r,`${s}="${o}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_attribute"}}function yc(e,t){var i;let{oldClassStr:s,newClassStr:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=qn(t,o);if(a){let r=On(t,a.startIndex);if(r&&!(s&&!r.includes(`class="${s}"`)&&!r.includes(`class='${s}'`))){let l=Gi(r,"class",s,n);if(l!==null)return{content:t.substring(0,a.startIndex)+l+t.substring(a.startIndex+r.length),applied:!0,strategy:"nodeKey"}}}}if(s){let a=`class="${s}"`,r=t.split(a).length-1;return r===0?{content:t,applied:!1,reason:`class="${s}" not found in source`}:r>1?{content:t,applied:!1,reason:`ambiguous: class="${s}" appears multiple times`}:{content:t.replace(a,`class="${n}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_class_list"}}function xc(e,t){let{oldHTML:s,newHTML:n}=e.payload,o=t.split(s).length-1;return o===0?{content:t,applied:!1,reason:"oldHTML not found in source"}:o>1?{content:t,applied:!1,reason:"ambiguous: oldHTML appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}function wc(e,t){var o;let{outerHTML:s}=e.payload,n=(o=e.address)==null?void 0:o.nodeKey;if(n){let i=qn(t,n);if(i&&!(s&&qo(i.element)!==qo(s)))return{content:t.substring(0,i.startIndex)+t.substring(i.endIndex),applied:!0,strategy:"nodeKey"}}if(s){let i=t.split(s).length-1;return i===0?{content:t,applied:!1,reason:"element outerHTML not found in source"}:i>1?{content:t,applied:!1,reason:"ambiguous: element outerHTML appears multiple times"}:{content:t.replace(s,""),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for delete_node"}}function kc(e,t){let{html:s,parentAddress:n,siblingIndex:o}=e.payload;if(!(n!=null&&n.nodeKey))return{content:t,applied:!1,reason:"insert_node requires parentAddress.nodeKey"};let i=qn(t,n.nodeKey);if(!i)return{content:t,applied:!1,reason:"parent element not found by nodeKey"};let a=On(t,i.startIndex);if(!a)return{content:t,applied:!1,reason:"cannot parse parent opening tag"};let r=i.startIndex+a.length,l=i.element.lastIndexOf("</");if(l<=a.length)return{content:t,applied:!1,reason:"cannot determine parent inner content"};let d=i.element.substring(a.length,l),u=i.startIndex+a.length,p=/<([a-z][a-z0-9]*)[\s>]/gi,c,v=0,m=0;for(;(c=p.exec(d))!==null;){let f=c[1].toLowerCase();if(Er.has(f))continue;if(v===o){m=c.index;break}let h=Cr(d,c.index,f);h&&(p.lastIndex=h.endIndex),v++}v<o&&(m=d.length);let g=u+m;return{content:t.substring(0,g)+s+t.substring(g),applied:!0,strategy:"nodeKey"}}function br(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function qo(e){return(e||"").replace(/\s+/g," ").trim()}var Lr=50,gt=[],Xt=[],Ec=new Set;function Fn(e,t){if(!e)return!1;let s=kr(e);if(!s)return console.warn("[VX History] Op is not invertible \u2014 skipping history entry:",e.type,e.id),!1;let n=Xi(s);return n.valid?(gt.push({forwardOp:e,inverseOp:s,timestamp:Date.now(),filePath:t||e.filePath||""}),gt.length>Lr&&(gt=gt.slice(gt.length-Lr)),Xt=[],zo(),!0):(console.warn("[VX History] Inverse op failed validation \u2014 skipping:",n.reason),!1)}function Sr(){return gt.length===0?null:gt[gt.length-1]}function Tr(){if(gt.length===0)return null;let e=gt.pop();return Xt.push(e),zo(),e}function Mr(){return Xt.length===0?null:Xt[Xt.length-1]}function Ir(){if(Xt.length===0)return null;let e=Xt.pop();return gt.push(e),zo(),e}function Ji(e){let t=gt.length>0||Xt.length>0;gt=[],Xt=[],t&&console.info("[VX History] Cleared:",e),zo()}function zo(){for(let e of Ec)try{e()}catch(t){console.error("[VX History] Listener error:",t)}}var st=!1,Ye=null,nt=null,Os=[],Uo=!1,Zi=[],$c=200,Br=!1,rn=0,Pe={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function aa(){st=!st,tl(),fe({type:"vx-editor:toggle",active:st}),st||(at(),Ko(),ft(),Bt(),Ye=null,es=!1)}function Un(){return st}function Or(){return st&&Ye!==null}function ra(){return!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")}function Ve(){let e=!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")||!!document.querySelector(".vx-modal-overlay")||!!document.querySelector(".vx-source-editor")||es;fe({type:"vx-editor:set-panel-lock",locked:e})}function la(){ft(),Bt()}function Go(){return Je?(Je.abort(),Je=null,vs(),wt&&(E.post("/ai/cancel-generation",{prompt_id:wt}).catch(()=>{}),wt=null),!0):!1}var Vo=null;function qr(e){var o;vs();let t=document.createElement("div");t.className="vs-inline-ai-overlay",t.id="vx-ai-gen-overlay",t.innerHTML=`
    <div class="vs-inline-ai-card">
      <div class="vs-inline-ai-spinner"></div>
      <div class="vs-inline-ai-status">
        <span class="vs-inline-ai-timer" id="vx-ai-gen-timer">0s</span>
        <span class="vs-inline-ai-dot">\xB7</span>
        <span class="vs-inline-ai-step" id="vx-ai-gen-step">${e||"Reading your site\u2026"}</span>
        <span class="vs-inline-ai-dot" id="vx-ai-gen-token-dot" style="display:none;">\xB7</span>
        <span class="vs-inline-ai-tokens" id="vx-ai-gen-tokens"></span>
      </div>
      <button class="vs-inline-ai-stop" id="vx-ai-gen-stop">Stop</button>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=Date.now(),n=t.querySelector("#vx-ai-gen-timer");Vo=setInterval(()=>{let i=Math.floor((Date.now()-s)/1e3);n&&(n.textContent=i<60?`${i}s`:`${Math.floor(i/60)}m ${i%60}s`)},1e3),(o=t.querySelector("#vx-ai-gen-stop"))==null||o.addEventListener("click",()=>{Go()}),fe({type:"vx-editor:show-ai-overlay"})}function an(e,t){let s=document.getElementById("vx-ai-gen-step");if(s&&e&&(s.textContent=e),t!==void 0&&t>0){let n=document.getElementById("vx-ai-gen-token-dot"),o=document.getElementById("vx-ai-gen-tokens");n&&(n.style.display=""),o&&(o.textContent=`${t.toLocaleString()} tokens`)}}function vs(){Vo&&(clearInterval(Vo),Vo=null);let e=document.getElementById("vx-ai-gen-overlay");e&&(e.classList.remove("is-visible"),setTimeout(()=>e.remove(),250)),fe({type:"vx-editor:hide-ai-overlay"})}function cn(){st&&(st=!1,tl(),fe({type:"vx-editor:toggle",active:!1}),at(),Ko(),ft(),Bt(),Ye=null,es=!1)}function Vn(){at(),Ko(),ft(),Bt(),Ye=null,nt=null,es=!1,fe({type:"vx-editor:deselect-from-parent"})}function Fr(){if(Br)return;Br=!0,window.addEventListener("message",Cc),document.addEventListener("keydown",t=>{if(st&&(t.metaKey||t.ctrlKey)&&t.key==="e"){let s=document.activeElement;if(s){let o=s.tagName;if(o==="INPUT"||o==="TEXTAREA"||o==="SELECT"||o==="BUTTON"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor"))return}let n=nt;n&&!jo(n)&&n.sourceFile&&(t.preventDefault(),Nn(n.sourceFile),at())}}),document.addEventListener("keydown",t=>{if(!st||!(t.metaKey||t.ctrlKey)||t.key!=="z")return;let s=document.activeElement;if(s){let n=s.tagName;if(n==="INPUT"||n==="TEXTAREA"||n==="SELECT"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor, .monaco-editor"))return}t.preventDefault(),t.shiftKey?yp():bp()});let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{es&&zr(),rn>0?rn--:Ji("preview iframe reloaded"),st&&setTimeout(()=>fe({type:"vx-editor:toggle",active:!0}),200)})}function Cc(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":Ye=e.data,nt=Ns(e.data.sourceAddress),ft(),Bt(),Kr(e.data);break;case"vx-editor:text-changed":Wo(e.data),e.data.changeKind||(clearTimeout(Wo._timer),(async()=>{for(;Uo;)await new Promise(t=>setTimeout(t,50));await Promise.all([dn(),new Promise(t=>setTimeout(t,400))]),fe({type:"vx-editor:text-save-complete"})})());break;case"vx-editor:source-edit-changed":el(e.data);break;case"vx-editor:element-deleted":oa(e.data);break;case"vx-editor:deselect":at(),Ko(),ft(),Bt(),Ye=null,nt=null;break;case"vx-editor:save-request":dn();break;case"vx-editor:editing-started":Lc(e.data);break;case"vx-editor:editing-ended":zr();break;case"vx-editor:selection-state":Sc(e.data);break;case"vx-editor:element-rect":Tc(e.data);break;case"vx-editor:richtext-link-request":Gr();break;case"vx-editor:add-section-request":ip(e.data);break;case"vx-editor:section-moved":mp(e.data);break;case"vx-editor:bridge-ready":rn>0?rn--:Ji("bridge re-initialized"),st&&fe({type:"vx-editor:toggle",active:!0});break;case"vx-editor:source-edit-ready":Rc(e.data);break;case"vx-editor:escape-pressed":if(Go())break;if(ra()){la();break}cn();break}}var es=!1,da=!1,us=null,ln={},ps=null,on=[],ta=null;function Lc(e){es=!0,da=!!e.hasPhp,us=e.rect||null,ln={},ta=e.tagName||"P",at(),Mc(),Ve()}function zr(){es=!1,da=!1,us=null,ln={},Wr(),Ve()}function Sc(e){if(es){if(e.elementRect&&(us=e.elementRect,Ur()),!e.hasSelection){ln={},ps=null,on=[],_r();return}ln=e.formatting||{},ta=e.blockTag||ta,ps=e.link||null,on=e.linkClasses||[],_r()}}function Tc(e){es&&e.rect&&(us=e.rect,Ur())}function Ur(){let e=document.getElementById("vx-richtext-toolbar");e&&Vr(e)}function Mc(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),Vr(e),Ic(e),e.classList.add("vx-rt-visible")}function Vr(e){if(!us)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+us.left,o=s.top+us.top,i=us.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function Ic(e){var i;let t=ln,s=da;e.innerHTML=`<div class="vx-rt-actions">
    ${s?`<span class="vx-rt-php-hint" title="This element contains PHP code. Use the Code Editor for full control.">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      PHP detected
    </span>`:`
    <button class="vx-rt-btn${t.bold?" vx-rt-active":""}" data-cmd="bold" title="Bold (\u2318B)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
    </button>
    <button class="vx-rt-btn${t.italic?" vx-rt-active":""}" data-cmd="italic" title="Italic (\u2318I)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
    </button>
    <div class="vx-rt-divider"></div>
    <button class="vx-rt-btn" data-cmd="insertLink" title="Link (\u2318K)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
    </button>
    `}
    <div class="vx-rt-divider"></div>
    <button class="vx-rt-btn vx-rt-btn-cancel" data-action="cancel" title="Cancel (Esc)">
      Cancel <kbd>Esc</kbd>
    </button>
    <button class="vx-rt-btn vx-rt-btn-save" data-action="save" title="Apply (\u2318\u21B5)">
      Apply <kbd>${(i=navigator.platform)!=null&&i.includes("Mac")?"\u2318\u21B5":"Ctrl+\u21B5"}</kbd>
    </button>
  </div>`,e.querySelectorAll("[data-cmd]").forEach(a=>{a.addEventListener("click",r=>{r.stopPropagation();let l=a.dataset.cmd;if(l==="insertLink"){Gr();return}fe({type:"vx-editor:richtext-command",command:l})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",a=>{a.stopPropagation(),fe({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",a=>{a.stopPropagation(),fe({type:"vx-editor:save-edit"})})}function _r(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=ln,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function Wr(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function Ko(){Wr()}function Gr(){let e=ps?ps.href:"",t=ps?ps.target:"",s=ps&&ps.className||"",n=on.length>0||!!s,o=`<option value=""${s?"":" selected"}>No class</option>`;if(on.length>0){let p=on.includes(s);o+=on.map(c=>`<option value="${kt(c)}"${s===c?" selected":""}>${Ze(c)}</option>`).join(""),s&&!p&&(o+=`<option value="${kt(s)}" selected>${Ze(s)}</option>`)}else s&&(o+=`<option value="${kt(s)}" selected>${Ze(s)}</option>`);let i=document.createElement("div");i.className="vx-modal-overlay",i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>${e?"Edit":"Insert"} Link</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <div class="vx-form-group"><label class="vx-form-label">URL</label>
          <input type="url" id="vx-link-url" class="vx-form-input" value="${kt(e)}" placeholder="https://" autocomplete="off" spellcheck="false">
        </div>
        ${n?`<div class="vx-form-group"><label class="vx-form-label">Link Style</label>
          <select class="vx-form-input" id="vx-link-class">${o}</select>
        </div>`:""}
        <div class="vx-form-group" style="margin-bottom:0;">
          <label class="vs-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; position: relative;">
            <input type="checkbox" id="vx-link-blank" class="vs-checkbox" ${t==="_blank"?"checked":""}>
            <span class="vs-checkbox-box"></span>
            <span style="font: 400 13px/1.4 var(--font-sans); color: var(--vs-text-primary);">Open in new window</span>
          </label>
        </div>
      </div>
      <div class="vx-modal-footer">
        ${e?'<button class="vx-btn-danger" data-remove style="margin-right: auto;">Remove</button>':""}
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-primary" data-confirm>Apply</button>
      </div>
    </div>
  `,document.body.appendChild(i),i.offsetHeight,i.classList.add("vx-modal-visible"),Ve(),Qr(i);let a=i.querySelector("#vx-link-url");setTimeout(()=>{a.focus(),a.select()},50);let r=()=>{i.classList.remove("vx-modal-visible"),i.__vxDestroyDrag&&i.__vxDestroyDrag(),setTimeout(()=>{i.remove(),Ve()},200)};i.addEventListener("click",p=>{p.target===i&&r()}),i.querySelectorAll("[data-close]").forEach(p=>p.addEventListener("click",r));let l=i.querySelector("[data-remove]");l&&l.addEventListener("click",()=>{fe({type:"vx-editor:richtext-command",command:"removeLink"}),r()});let d=i.querySelector("[data-confirm]"),u=()=>{let p=a.value.trim();if(p){let c=i.querySelector("#vx-link-blank").checked,v=i.querySelector("#vx-link-class"),m=v?v.value:"";fe({type:"vx-editor:richtext-command",command:"insertLink",value:{url:p,targetBlank:c,linkClass:m}})}else fe({type:"vx-editor:richtext-command",command:"removeLink"});r()};d.addEventListener("click",u),a.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),u()),p.key==="Escape"&&(p.preventDefault(),r())})}function Kr(e){var $,w;let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,canInlineEdit:i,hasImage:a}=e,r=document.getElementById("preview-iframe");if(!r)return;let l=r.getBoundingClientRect(),d=l.left+n.left+n.width/2,u=l.top+n.top-8,p=l.top+n.top+n.height+8;t.style.left=`${d}px`,u<120?(t.style.top=`${p}px`,t.classList.add("vx-tb-below")):(t.style.top=`${u}px`,t.classList.remove("vx-tb-below")),t.style.transform="";let v=nt,m=jo(v),g=cr(v),y=dr(v);if(!m){let k=(v==null?void 0:v.sourceFile)||"",T=k.length>0,_=(v==null?void 0:v.sourceKind)==="loop"?"Loop":"Dynamic PHP",q=(($=navigator.platform)==null?void 0:$.includes("Mac"))?"\u2318E":"Ctrl+E",Q=T?`<span class="vx-tb-readonly-sep"></span><span class="vx-tb-readonly-file">${Ze(k)}</span>`:"",X=T?`<div class="vx-tb-readonly-actions">
          <button class="vx-tb-btn-primary" data-action="open-code-editor" data-file="${Ze(k)}" title="Open in Code Editor (${q})">
            Open in Code Editor
            <kbd>${q}</kbd>
          </button>
        </div>`:"";t.innerHTML=`
      <div class="vx-tb-readonly">
        <div class="vx-tb-readonly-header">
          <svg class="vx-tb-readonly-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="vx-tb-readonly-kind">${Ze(_)}</span>
          ${Q}
        </div>
        <p class="vx-tb-readonly-msg">${Ze(y)}</p>
        ${X}
      </div>`,t.classList.add("vx-tb-visible"),T&&((w=t.querySelector('[data-action="open-code-editor"]'))==null||w.addEventListener("click",O=>{O.stopPropagation();let de=O.currentTarget.dataset.file;Nn(de),at()}));return}let f="";g&&(v!=null&&v.sourceFile)&&(f+=`<div class="vx-tb-global-cue" title="Changes affect all pages that include this file">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span>Global \u2014 ${Ze(v.sourceFile)}</span>
    </div>`),i&&s!=="IMG"&&(f+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"/><path d="M7 22h1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H7"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
      <span>Edit</span></button>`),a&&(f+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),f+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(f+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),v!=null&&v.sourceFile&&(f+=`<button class="vx-tb-btn" data-action="open-source" title="Edit source code" data-file="${Ze(v.sourceFile)}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      <span>Source</span></button>`),f+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,f+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let h=Xo(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${h}</div><div class="vx-tb-actions">${f}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(k=>{k.addEventListener("click",T=>{T.stopPropagation(),Bc(k.dataset.action,e)})})}function at(){let e=document.getElementById("vx-context-toolbar");e&&(e.classList.remove("vx-tb-visible"),e.classList.remove("vx-tb-below"))}function Xo(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function Bc(e,t){switch(e){case"edit-text":fe({type:"vx-editor:start-edit",mode:"text"}),at();break;case"swap-image":rp(t);break;case"edit-style":Hc(t);break;case"edit-link":dp(t);break;case"open-source":{at(),fe({type:"vx-editor:start-source-edit"});break}case"delete":Dc(t);break;case"ask-ai":op(t);break}}var Fs=null;function _c(e){let t=e.replace(/>\s+</g,"><").trim();t=t.replace(/(<\/[^>]+>)(<)/g,`$1
$2`),t=t.replace(/(\/?>)(<[^/])/g,`$1
$2`);let s=t.split(`
`),n=0,o=[];for(let i of s){let a=i.trim();a&&(/^<\//.test(a)&&n>0&&n--,o.push("  ".repeat(n)+a),/^<[^/!][^>]*[^/]>$/.test(a)&&!/^<(br|hr|img|input|meta|link)/i.test(a)&&n++)}return o.join(`
`)}function Ac(e,t,s){let n=t.lastIndexOf(":");if(n===-1)return null;let o=parseInt(t.substring(n+1),10);if(isNaN(o)||o<0)return null;let i=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),a=/<([a-z][a-z0-9]*)[\s>]/gi,r,l=0;for(;(r=a.exec(e))!==null;){let d=r[1].toLowerCase();if(!(i.has(d)||e.substring(r.index,r.index+500).includes("data-vx-source"))){if(l===o){let p=Yr(e,r.index,d);return p&&d===s.toLowerCase()?p:null}l++}}return null}function Pc(e,t){if(t<0)return null;let s=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),n=/<([a-z][a-z0-9]*)[\s>]/gi,o,i=0;for(;(o=n.exec(e))!==null;){let a=o[1].toLowerCase();if(!(s.has(a)||e.substring(o.index,o.index+500).includes("data-vx-source"))){if(i===t)return Yr(e,o.index,a);i++}}return null}function Xr(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function Yr(e,t,s){let n=Xr(e,t);if(!n)return null;if(new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]).has(s)||n.trimEnd().endsWith("/>"))return n;let i=t+n.length,a=new RegExp(`<${s}[\\s>]`,"gi"),r=new RegExp(`</${s}\\s*>`,"gi"),l=1,d=i,u=Math.min(e.length,t+5e4);for(;d<u&&l>0;){a.lastIndex=d,r.lastIndex=d;let p=a.exec(e),c=r.exec(e);if(!c)return null;let v=p?p.index:1/0,m=c.index;v<m&&v<u?(l++,d=v+p[0].length):(l--,d=m+c[0].length)}return l!==0?null:e.substring(t,d)}async function Rc(e){var V,te;zn(!1);let{html:t,tagName:s,rect:n,filePath:o,sourceAddress:i}=e,a=document.getElementById("preview-iframe");if(!a||!t)return;let r=a.getBoundingClientRect(),l=450,d=180,u=r.width-40,p=Math.max(l,Math.min(n.width+40,u)),c=Math.max(d,Math.min(n.height+60,400)),v=r.left+n.left+n.width/2-p/2,m=r.top+n.top;v=Math.max(r.left+10,Math.min(v,r.right-p-10)),m=Math.max(r.top+10,Math.min(m,r.bottom-c-10));let g=document.createElement("div");g.className="vx-source-editor",g.style.left=`${v}px`,g.style.top=`${m}px`,g.style.width=`${p}px`,g.style.height=`${c}px`;let f=((V=navigator.platform)==null?void 0:V.includes("Mac"))?"\u2318S":"Ctrl+S";g.innerHTML=`
    <div class="vx-source-header">
      <div class="vx-source-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>Source</span>
      </div>
      <div class="vx-source-actions">
        <button class="vx-source-btn vx-source-btn-cancel" data-action="cancel">Cancel <kbd>Esc</kbd></button>
        <button class="vx-source-btn vx-source-btn-apply" data-action="apply">Apply <kbd>${f}</kbd></button>
      </div>
    </div>
    <div class="vx-source-warn" hidden></div>
    <div class="vx-source-body"></div>
  `,document.body.appendChild(g),Ve();let h=g.querySelector(".vx-source-header"),$=null;h.addEventListener("mousedown",ee=>{ee.target.closest("button")||($={x:ee.clientX-g.offsetLeft,y:ee.clientY-g.offsetTop},ee.preventDefault())});let w=ee=>{$&&(g.style.left=`${ee.clientX-$.x}px`,g.style.top=`${ee.clientY-$.y}px`)},k=()=>{$=null};document.addEventListener("mousemove",w),document.addEventListener("mouseup",k);let T=g.querySelector(".vx-source-body"),_=(i==null?void 0:i.sourceFile)||o||Nt(),D=(i==null?void 0:i.nodeKey)||"",q=null;if(D)try{let ee=await E.get(`/files/content?path=${encodeURIComponent(_)}`);ee.ok&&((te=ee.data)!=null&&te.content)&&(q=Ac(ee.data.content,D,s))}catch{}let Q=!q,X=q||t,O=_c(X),de=g.querySelector('[data-action="apply"]'),J=g.querySelector(".vx-source-warn"),H=!0,L=null;Q&&(J.textContent="\u2139 Live HTML \u2014 save may not work for this element",J.hidden=!1,J.style.color="var(--vs-text-ghost)",J.style.background="transparent");function N(ee){let j=Jr(ee,s);if(j){if(J.style.color="",J.style.background="",J.textContent=`\u26A0 ${j.message}`,J.hidden=!1,de.disabled=!0,de.classList.add("vx-source-btn-disabled"),H=!1,L&&j.line)try{let oe=L.getModel();if(oe){let me=window.monaco||globalThis.monaco;me!=null&&me.editor&&me.editor.setModelMarkers(oe,"preflight",[{startLineNumber:j.line,startColumn:1,endLineNumber:j.line,endColumn:oe.getLineMaxColumn(j.line),message:j.message,severity:me.MarkerSeverity.Error}])}}catch{}}else if(Q?(J.textContent="\u2139 Live HTML \u2014 save may not work for this element",J.hidden=!1,J.style.color="var(--vs-text-ghost)",J.style.background="transparent"):(J.hidden=!0,J.style.color="",J.style.background=""),de.disabled=!1,de.classList.remove("vx-source-btn-disabled"),H=!0,L)try{let oe=L.getModel(),me=window.monaco||globalThis.monaco;oe&&(me!=null&&me.editor)&&me.editor.setModelMarkers(oe,"preflight",[])}catch{}return H}let F=null;try{let ee=await Oo();if(!(ee!=null&&ee.editor))throw new Error("Monaco unavailable");let j=js();ee.editor.setTheme(j),F=ee.editor.create(T,{value:O,language:"html",theme:j,automaticLayout:!0,minimap:{enabled:!1},fontSize:12,lineHeight:18,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",lineNumbers:"off",glyphMargin:!1,folding:!1,renderLineHighlight:"none",overviewRulerLanes:0,hideCursorInOverviewRuler:!0,overviewRulerBorder:!1,scrollbar:{verticalScrollbarSize:6,horizontalScrollbarSize:6},padding:{top:8,bottom:8},fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"}),L=F,F.addCommand(ee.KeyMod.CtrlCmd|ee.KeyCode.KeyS,()=>{H&&Qi()}),F.addCommand(ee.KeyCode.Escape,()=>{zn(!1)});let oe=null;F.onDidChangeModelContent(()=>{clearTimeout(oe),oe=setTimeout(()=>{N(F.getValue())},400)}),setTimeout(()=>{F.focus(),fe({type:"vx-editor:source-editor-mounted"})},100)}catch{T.innerHTML=`<textarea class="vx-source-fallback" spellcheck="false">${Ze(O)}</textarea>`;let ee=T.querySelector("textarea");ee.addEventListener("keydown",oe=>{oe.key==="Escape"&&(oe.preventDefault(),zn(!1)),(oe.metaKey||oe.ctrlKey)&&oe.key==="s"&&(oe.preventDefault(),H&&Qi())});let j=null;ee.addEventListener("input",()=>{clearTimeout(j),j=setTimeout(()=>N(ee.value),400)}),setTimeout(()=>{ee.focus(),fe({type:"vx-editor:source-editor-mounted"})},100)}de.addEventListener("click",()=>{H&&Qi()}),g.querySelector('[data-action="cancel"]').addEventListener("click",()=>zn(!1)),Fs={container:g,monacoInstance:F,originalHTML:X,formattedHTML:O,tagName:s,sourceFile:_,cleanupDrag:()=>{document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",k)}},requestAnimationFrame(()=>g.classList.add("vx-source-visible"))}async function Qi(){var p,c;if(!Fs||(p=window.demoGuard)!=null&&p.call(window))return;let{monacoInstance:e,container:t,tagName:s,originalHTML:n,formattedHTML:o,sourceFile:i,cleanupDrag:a}=Fs,r;if(e)r=e.getValue().trim();else{let v=t.querySelector("textarea");r=((c=v==null?void 0:v.value)==null?void 0:c.trim())||""}let l=Jr(r,s);if(l){let v=t.querySelector(".vx-source-warn");v&&(v.textContent=`\u26A0 ${l.message}`,v.hidden=!1);return}if(r===o){zn(!1);return}if(e)try{e.dispose()}catch{}a(),t.classList.remove("vx-source-visible"),setTimeout(()=>t.remove(),200),Fs=null;let d=wr(nt,n,r,i);ue(d,"created"),fe({type:"vx-editor:source-edit-saving"});let[u]=await Promise.all([el({filePath:i,originalHTML:n,newHTML:r}),new Promise(v=>setTimeout(v,500))]);if(ue(d,u?"persisted":"failed"),u)if(/\<\?(?:php\b|=)/.test(r)){fe({type:"vx-editor:end-source-edit",apply:!1});let m=document.getElementById("preview-iframe");m&&m.contentWindow.location.reload()}else fe({type:"vx-editor:end-source-edit",apply:!0,html:r});else fe({type:"vx-editor:end-source-edit",apply:!1})}function Jr(e,t){if(!e||!e.trim())return{message:"HTML is empty"};let s=e.trim();if(/<script\b/i.test(s))return{message:"<script> elements are not allowed"};if(/<iframe\b/i.test(s))return{message:"<iframe> elements are not allowed"};if(/\bon[a-z]+\s*=/i.test(s))return{message:"Inline event handlers (on*=) are not allowed"};let n=document.createElement("template");n.innerHTML=s;let o=n.content,i=Array.from(o.childNodes).filter(c=>c.nodeType===Node.ELEMENT_NODE);if(i.length===0)return{message:"No HTML element found"};if(i.length>1)return{message:`Expected 1 root element, found ${i.length}`};for(let c of o.childNodes)if(c.nodeType===Node.TEXT_NODE&&c.textContent.trim())return{message:"Text found outside root element \u2014 check for broken tags"};let a=i[0],r=(t||"").toUpperCase();if(r&&a.tagName!==r)return{message:`Root changed: <${r.toLowerCase()}> \u2192 <${a.tagName.toLowerCase()}>`,line:1};if(/\<\?(?:php\s+)?(?:foreach|for|while|if|else|elseif|switch)\b/.test(s)||/\<\?(?:php\s+)?(?:endforeach|endfor|endwhile|endif|endswitch)\b/.test(s))return null;let d=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]),u=s.split(`
`),p=[];for(let c=0;c<u.length;c++){let v=u[c],m=/<([a-z][a-z0-9]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*(\/?)\s*>/gi,g;for(;(g=m.exec(v))!==null;){let f=g[1].toLowerCase(),h=g[2]==="/";d.has(f)||h||p.push({tag:f,line:c+1})}let y=/<\/([a-z][a-z0-9]*)\s*>/gi;for(;(g=y.exec(v))!==null;){let f=g[1].toLowerCase();if(d.has(f))continue;if(p.length===0)return{message:`Extra </${f}> \u2014 no matching opening tag`,line:c+1,tag:f};let h=p[p.length-1];if(h.tag!==f)return{message:`Misnested: </${f}> but <${h.tag}> is still open (line ${h.line})`,line:c+1,tag:f};p.pop()}}if(p.length>0){let c=p[p.length-1];return{message:`Unclosed <${c.tag}> (line ${c.line})`,line:c.line,tag:c.tag}}return null}function zn(e,t){if(!Fs)return;let{container:s,monacoInstance:n,cleanupDrag:o}=Fs;if(fe({type:"vx-editor:end-source-edit",apply:!!e,html:e?t:void 0}),n)try{n.dispose()}catch{}o(),s.classList.remove("vx-source-visible"),setTimeout(()=>{s.remove(),Ve()},200),Fs=null}function Dc(e){at();let t=Xo(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${Ze(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible")),Ve();let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>{n.remove(),Ve()},200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),ke(n,o),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{var a;(a=window.demoGuard)!=null&&a.call(window)||(fe({type:"vx-editor:delete-element"}),o())})}var Oe=new Set,Qt="",qs=null,Yo="text",Yt="padding",Zt="all",zs="all",Jt="tl",Us="",ms=!1;function ft({revertUnsaved:e=!0}={}){e&&ms&&Qt&&(fe({type:"vx-editor:update-classes",classes:Qt.split(" ").filter(Boolean),silent:!0}),Oe=new Set(Qt.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>{t.remove(),Ve()},200)),ms=!1,qs=null,Yo="text",Yt="padding",Zt="all",zs="all",Jt="tl",Us=""}function Hc(e){at(),ft();let t=(e.classList||[]).filter(o=>o.trim());Oe=new Set(t),Qt=t.join(" "),ms=!1,qs=null,Yo=hp(t),Yt="padding",Zt="all",zs="all",Jt="tl",Us="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${Xo(e.tagName,t)}</span>
      <div class="vx-sp-header-actions">
        <span class="vx-sp-drag-hint">\u22EE\u22EE</span>
        <button class="vx-sp-close" id="vx-style-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="vx-sp-nav" id="vx-sp-nav">
      ${n.map((o,i)=>`<button class="vx-sp-seg${i===0?" vx-sp-seg-active":""}" data-tab="${o.id}" title="${o.tip}" aria-label="${o.tip}">${o.icon}</button>`).join("")}
    </div>
    <div class="vx-sp-breakpoints" id="vx-sp-breakpoints">
      ${sa()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),ia(s),s.__vxOnResize=()=>ia(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=ca(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),qs=null,ct(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>ft()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),ft())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{Oe=new Set(Qt.split(" ").filter(Boolean)),ms=!1,fe({type:"vx-editor:update-classes",classes:[...Oe],silent:!0}),ct(na())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>np(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(Us=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=sa(),ct(na()))}),ct("typography"),Ve()}function sa(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=Us===t.id,n=t.id?[...Oe].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function na(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function ct(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:Nc,spacing:jc,colors:Oc,layout:qc,borders:Fc,effects:zc,classes:Uc};t.innerHTML=(s[e]||s.classes)(),sp(t);let n=t.querySelector(".vx-cm-active");n&&n.scrollIntoView({block:"nearest"})}function Nc(){let e=Be(/^font-(sans|serif|mono)$/)||"",t=Be(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=Be(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=Be(/^text-(left|center|right|justify)$/)||"text-left",o=Be(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=Be(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=Be(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",r=Be(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${je("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${je("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,Pe.sizes.map(l=>({label:l,value:`text-${l}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${je("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,Pe.weights.map(l=>({label:l,value:`font-${l}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${Vc(Pe.aligns.map(l=>({value:`text-${l}`,label:l,icon:Zc(l)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${je("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,Pe.leadings.map(l=>({label:l,value:`leading-${l}`})))}
        ${je("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,Pe.trackings.map(l=>({label:l,value:`tracking-${l}`})))}
        ${je("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,Pe.transforms.map(l=>({label:l,value:l})))}
        ${je("Decoration","^(no-underline|underline|line-through)$",r,Pe.decorations.map(l=>({label:l,value:l})))}
      </div>
    </div>
  `}function jc(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[Yt]||(Yt="padding"),e[Yt].prefixes[Zt]||(Zt="all");let t=e[Yt],s=t.prefixes[Zt],n=Kc(s),o=Yc(s)||"",i=Yt==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${Zr(Object.keys(e).map(a=>({value:a,label:e[a].label})),Yt,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${Zt===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Ar(a)}">
            ${Jc(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${Ar(Zt)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${Pe.compactSpacings.map(a=>{let r=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Vs(r)?" vx-sp-pill-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${Vs(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function Oc(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=Yo||"text",s=t,n=Xc(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${Pe.specialColors.map(a=>{let r=`${s}-${a.name}`,l=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,d=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${Vs(r)?" vx-sp-dot-active":""}" data-set="${r}" data-pattern="${n}" style="${l}${d}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=["50","100","200","300","400","500","600","700","800","900","950"];return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-matrix">
      ${Pe.colors.map(a=>`
        <div class="vx-cm-row" title="${a.name}">
          ${i.map(r=>{let l=`${s}-${a.name}-${r}`;return`<button class="vx-cm-cell${Vs(l)?" vx-cm-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false" style="background:${a.shades[r]}" title="${a.name}-${r}"></button>`}).join("")}
        </div>
      `).join("")}
    </div>
  </div>`,o}function qc(){let e=Gc(),t=Be(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=Be(/^gap(?:-[xy])?-/)||"",a=Be(/^grid-cols-\d+$/)||"",r=Be(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${Wc(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${je("Direction","^flex-(row|col|row-reverse|col-reverse)$",Be(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${je("Justify","^justify-(start|center|end|between|around|evenly)$",Be(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${je("Align","^items-(start|center|end|stretch|baseline)$",Be(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${je("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...Pe.gaps.map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${je("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...Pe.gridCols.map(l=>({label:l,value:`grid-cols-${l}`}))])}
          ${je("Rows","^grid-rows-\\d+$",r,[{label:"Auto",value:""},...Pe.gridRows.map(l=>({label:l,value:`grid-rows-${l}`}))])}
          ${je("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...Pe.gaps.slice(1).map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${je("Position","^(static|relative|absolute|fixed|sticky)$",t,Pe.positions.map(l=>({label:l,value:l})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${je("Top","^top-",Be(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Pe.coordinates.map(l=>({label:l,value:`top-${l}`})))}
          ${je("Right","^right-",Be(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Pe.coordinates.map(l=>({label:l,value:`right-${l}`})))}
          ${je("Bottom","^bottom-",Be(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Pe.coordinates.map(l=>({label:l,value:`bottom-${l}`})))}
          ${je("Left","^left-",Be(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Pe.coordinates.map(l=>({label:l,value:`left-${l}`})))}
        </div>
      </div>
    `:""}
  `}function Fc(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=zs==="all"?"all":Jt;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${Pe.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Vs(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${je("Style","^border-(solid|dashed|dotted|double|none)$",Be(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...Pe.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${Zr([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],zs==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${Jt==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${Jt==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${Jt==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${Jt==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${zs==="all"?"ALL":Jt.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${Pe.radii.map(s=>{let n=Qc(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${Vs(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${ep(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function zc(){let e=tp();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${Vs(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
          <span class="vx-shadow-preview" style="${s.style}"></span>
          <span class="vx-shadow-label">${s.label}</span>
        </button>`).join("")}</div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Opacity</span>
        <span class="vx-sp-value-readout"><span id="vx-opacity-val">${e}</span>%</span>
      </div>
      <input id="vx-opacity-slider" class="vx-opacity-slider" type="range" min="0" max="100" step="5" value="${e}" />
    </div>
  `}function Uc(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...Oe].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function je(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${kt(o.value)}"${s===o.value?" selected":""}>${Ze(o.label)}</option>`).join("")}
    </select>
  </div>`}function Zr(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${Ze(i.label)}</button>`).join("")}
  </div>`}function Vc(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${kt(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function Wc(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function Gc(){let e=Be(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function Kc(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function Xc(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function Yc(e){let t=Be(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function Ar(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function Jc(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function Zc(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function Qc(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function ep(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function tp(){let e=Be(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function Vs(e){let t=Us;return Oe.has(t?t+":"+e:e)}function ea(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=Us,i=o?o+":":"",a=t?new RegExp(t):null,r=e?i+e:"",l=!!r&&Oe.has(r);if(a)for(let u of[...Oe])if(o){if(u.startsWith(i)){let p=u.slice(i.length);a.test(p)&&Oe.delete(u)}}else!/^(sm|md|lg|xl|2xl):/.test(u)&&a.test(u)&&Oe.delete(u);r&&(!s||!l)&&Oe.add(r),ms=!0,fe({type:"vx-editor:update-classes",classes:[...Oe],silent:!0});let d=document.getElementById("vx-sp-breakpoints");if(d&&(d.innerHTML=sa()),n){let u=document.querySelector(".vx-color-matrix"),p=u?u.scrollTop:0;if(ct(na()),p){let c=document.querySelector(".vx-color-matrix");c&&(c.scrollTop=p)}}}function Be(e){let t=Us;for(let s of Oe)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function sp(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";ea(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";ea(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{qs=qs===n.dataset.family?null:n.dataset.family,ct("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{qs=null,ct("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{Yo=n.dataset.cprop||"text",qs=null,ct("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Yt=n.dataset.spaceMode||"padding",Zt="all",ct("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{Zt=n.dataset.spaceSide||"all",ct("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{zs=n.dataset.radiusMode==="corners"?"corners":"all",ct("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{Jt=n.dataset.radiusCorner||"tl",zs="corners",ct("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");ea(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>ct("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{Oe.add(i)}),ms=!0,fe({type:"vx-editor:update-classes",classes:[...Oe],silent:!0}),s.value="",ct("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;Oe.delete(i),ms=!0,fe({type:"vx-editor:update-classes",classes:[...Oe],silent:!0}),o.remove()}}})}async function np(e){let t=[...Oe].join(" ");if(t===Qt){ft({revertUnsaved:!1});return}let s=new Set(Qt.split(" ").filter(Boolean)),n=new Set(t.split(" ").filter(Boolean)),o=[...n].filter(l=>!s.has(l)),i=[...s].filter(l=>!n.has(l)),a=Ns(e.sourceAddress||nt),r=yr(a,Qt,t,o,i,e.filePath);ue(r,"created"),Os.push({type:"class-change",filePath:e.filePath,originalHTML:`class="${Qt}"`,newHTML:`class="${t}"`,additions:o,removals:i,timestamp:Date.now(),_op:r}),ms=!1,ft({revertUnsaved:!1}),K("Saving & compiling\u2026"),await dn(),fe({type:"vx-editor:update-classes",classes:[...Oe],silent:!0}),setTimeout(()=>{let l=document.getElementById("preview-iframe");l&&l.contentWindow&&l.contentWindow.postMessage("voxelsite:reload","*")},500)}function ca(e,t){let s=!1,n,o,i,a,r=!1,l=p=>{if(p.target.closest("button, input, select"))return;s=!0;let c=p.touches?p.touches[0]:p;n=c.clientX,o=c.clientY;let v=e.getBoundingClientRect();i=v.left,a=v.top,t.style.cursor="grabbing",p.preventDefault(),r||(r=!0,document.addEventListener("mousemove",d),document.addEventListener("touchmove",d,{passive:!1}),document.addEventListener("mouseup",u),document.addEventListener("touchend",u))},d=p=>{if(!s)return;let c=p.touches?p.touches[0]:p,v=12,m=e.getBoundingClientRect(),g=m.width||300,y=m.height||500,f=i+c.clientX-n,h=a+c.clientY-o,$=v,w=Math.max(v,window.innerWidth-g-v),k=52,T=Math.max(k,window.innerHeight-y-v),_=Math.min(Math.max(f,$),w),D=Math.min(Math.max(h,k),T);e.style.left=`${_}px`,e.style.top=`${D}px`,e.style.right="auto"},u=()=>{s&&(s=!1,t.style.cursor="",r&&(r=!1,document.removeEventListener("mousemove",d),document.removeEventListener("touchmove",d),document.removeEventListener("mouseup",u),document.removeEventListener("touchend",u)))};return t.addEventListener("mousedown",l),t.addEventListener("touchstart",l,{passive:!1}),()=>{t.removeEventListener("mousedown",l),t.removeEventListener("touchstart",l),r&&(document.removeEventListener("mousemove",d),document.removeEventListener("touchmove",d),document.removeEventListener("mouseup",u),document.removeEventListener("touchend",u))}}function Qr(e){let t=e.querySelector(".vx-modal"),s=e.querySelector(".vx-modal-header");if(!t||!s)return;s.style.cursor="grab";let n=!1,o=()=>{if(n)return;n=!0;let r=t.getBoundingClientRect();e.style.display="block",t.style.position="fixed",t.style.left=`${r.left}px`,t.style.top=`${r.top}px`,t.style.margin="0"},i=r=>{r.target.closest("button, input, select")||o()};s.addEventListener("mousedown",i,{capture:!0}),s.addEventListener("touchstart",i,{capture:!0,passive:!0});let a=ca(t,s);e.__vxDestroyDrag=()=>{s.removeEventListener("mousedown",i,{capture:!0}),s.removeEventListener("touchstart",i,{capture:!0}),a()}}var Je=null,wt=null;function Bt(){let e=document.getElementById("vx-ai-panel");e&&(Je&&(Je.abort(),Je=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>{e.remove(),Ve()},180))}function op(e){at(),ft(),Bt();let t=Xo(e.tagName,e.classList),s=document.createElement("div");s.id="vx-ai-panel",s.className="vx-ai-panel",s.tabIndex=-1,s.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${Ze(t)}</span>
      </div>
      <div class="vx-ai-header-right">
        <span class="vx-sp-drag-hint">\u22EE\u22EE</span>
        <button class="vx-sp-close" id="vx-ai-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="vx-ai-body">
      <div class="vx-ai-input-wrap">
        <textarea class="vx-ai-input" id="vx-ai-input" rows="1" placeholder="Describe your changes\u2026" spellcheck="false"></textarea>
        <button class="vx-ai-send" id="vx-ai-send" title="Generate (\u2318\u21B5)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
        </button>
        <button class="vx-ai-cancel" id="vx-ai-cancel-btn" hidden title="Cancel generation">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        </button>
      </div>
      <div class="vx-ai-status" id="vx-ai-status" hidden>
        <div class="vx-ai-spinner"><i></i><i></i><i></i></div>
        <span id="vx-ai-status-text">Thinking\u2026</span>
      </div>
    </div>`,document.body.appendChild(s),jr(s,null,e.rect),s.__vxOnResize=()=>jr(s,null,e.rect),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-ai-visible")),s.__vxDestroyDrag=ca(s,s.querySelector("#vx-ai-drag-handle"));let n=s.querySelector("#vx-ai-input"),o=s.querySelector("#vx-ai-send"),i=s.querySelector("#vx-ai-cancel-btn"),a=s.querySelector("#vx-ai-status"),r=s.querySelector("#vx-ai-status-text"),l=s.querySelector("#vx-ai-close");setTimeout(()=>n==null?void 0:n.focus(),200),Ve(),l.addEventListener("click",()=>Bt()),s.addEventListener("keydown",v=>{v.key==="Escape"&&(v.preventDefault(),v.stopPropagation(),Bt())});let d=()=>{n.style.height="auto";let v=parseFloat(getComputedStyle(n).lineHeight||"20")*6+28;n.style.height=Math.min(n.scrollHeight,v)+"px"};n.addEventListener("input",d),n.addEventListener("keydown",v=>{v.key==="Enter"&&(v.metaKey||v.ctrlKey)&&(v.preventDefault(),c())}),o.addEventListener("click",c),i.addEventListener("click",()=>{Je&&(Je.abort(),Je=null),p()});function u(){n.disabled=!0,o.hidden=!0,i.hidden=!1,a.hidden=!1,r.textContent="Reading your site\u2026"}function p(){n.disabled=!1,o.hidden=!1,i.hidden=!0,a.hidden=!0,n.focus()}async function c(){let v=n.value.trim();if(!v)return;Bt(),qr("AI is editing\u2026"),Je=new AbortController,wt=null;let m=e.outerHTML||"",g=e.filePath||Nt(),y=0;try{await Hs("/ai/prompt",{user_prompt:v,action_type:"section_edit",page_scope:g,action_data:{path:g,sectionHtml:m.substring(0,15e3)}},{signal:Je.signal,onPromptId(f){wt=f},onStatus(f){let h=typeof f=="string"?f:f.message||"Working\u2026";an(h,y)},onFile(){an("Applying changes\u2026",y)},onToken(){y++,an("Generating\u2026",y)},onError(f){wt=null,vs(),K(f.message||"AI edit failed",!0)},onDone(f){if(Je=null,wt=null,vs(),f.cancelled){K("Generation cancelled",!1);return}(f.files_modified||[]).length>0?(K("Section updated \u2713"),setTimeout(()=>{let $=document.getElementById("preview-iframe");$!=null&&$.contentWindow&&$.contentWindow.postMessage("voxelsite:reload","*")},400)):f.partial||K("No changes made",!1)},onWarning(f){typeof window.showToast=="function"&&window.showToast(f,"warning")}})}catch(f){f.name!=="AbortError"&&K("AI edit failed",!0),vs()}}}var Pr=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function ip(e){at(),ft(),Bt();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let f of Pr)(t.includes(f.id)||t.includes(f.label.toLowerCase()))&&s.add(f.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${Ze(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${Pr.map(f=>{let h=s.has(f.id);return`
            <button class="vx-section-card${h?" vx-section-card-exists":""}" data-section-type="${f.id}" data-section-label="${kt(f.label)}" data-section-desc="${kt(f.description)}">
              <div class="vx-section-card-icon">${f.icon}</div>
              <div class="vx-section-card-label">${f.label}</div>
              <div class="vx-section-card-desc">${f.description}</div>
              ${h?'<div class="vx-section-card-badge">On page</div>':""}
            </button>`}).join("")}
      </div>
      <div class="vx-section-picker-footer" id="vx-section-footer" hidden>
        <div class="vx-section-footer-selected">
          <span class="vx-section-footer-type" id="vx-section-footer-type"></span>
          <button class="vx-section-footer-change" id="vx-section-change">Change</button>
        </div>
        <div class="vx-section-footer-input-row">
          <input type="text" class="vx-section-footer-input" id="vx-section-instruction" placeholder="Optional: describe what you want\u2026" spellcheck="false" />
          <button class="vx-section-footer-generate" id="vx-section-generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Generate
          </button>
        </div>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible")),Ve();let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>{n.remove(),Ve()},200)},a=f=>{f.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),ke(n,i),n.tabIndex=-1,n.focus();let r=null,l=null,d=n.querySelector("#vx-section-footer"),u=n.querySelector("#vx-section-footer-type"),p=n.querySelector("#vx-section-instruction"),c=n.querySelector("#vx-section-generate"),v=n.querySelector("#vx-section-change"),m=n.querySelector(".vx-section-picker-grid"),g={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(f=>{f.addEventListener("click",()=>{r=f.dataset.sectionLabel,l=f.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(h=>h.classList.remove("vx-section-card-selected")),f.classList.add("vx-section-card-selected"),u.textContent=r,p.placeholder=g[r]||"Optional: describe what you want\u2026",p.value="",d.hidden=!1,m.classList.add("vx-section-grid-collapsed"),setTimeout(()=>p.focus(),100)})}),v.addEventListener("click",()=>{r=null,l=null,d.hidden=!0,m.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(f=>f.classList.remove("vx-section-card-selected"))});let y=()=>{if(!r)return;let f=p.value.trim();i(),ap(e,r,l,f)};c.addEventListener("click",y),p.addEventListener("keydown",f=>{f.key==="Enter"&&(f.preventDefault(),y())})}async function ap(e,t,s,n=""){qr(`Adding ${t}\u2026`);let o=e.filePath||Nt();Je=new AbortController,wt=null;let i=Je,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let r=0,l=0,d=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await Hs("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onPromptId(u){wt=u},onStatus(u){let p=typeof u=="string"?u:u.message||`Adding ${t}\u2026`;an(p,r)},onFile(){an("Writing files\u2026",r)},onToken(){r++;let u=Date.now();u-l>500&&(l=u,an(`Generating ${t}\u2026`,r))},onError(u){Je=null,wt=null,vs(),K(u.message||"Failed to add section",!0)},onDone(u){if(Je=null,wt=null,vs(),u.cancelled){K("Generation cancelled",!1);return}(u.files_modified||[]).length>0?(K(`${t} added \u2713`),setTimeout(()=>{let c=document.getElementById("preview-iframe");c!=null&&c.contentWindow&&c.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{fe({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{fe({type:"vx-editor:scroll-to-section",sectionIndex:d}),fe({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):u.partial||K("No changes made",!1)},onWarning(u){typeof window.showToast=="function"&&window.showToast(u,"warning")}})}catch(u){Je=null,wt=null,u.name!=="AbortError"&&K("Failed to add section",!0),vs()}}function rp(e){at();let t=!1,s=document.createElement("div");s.className="vx-modal-overlay",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("vx-modal-visible")),Ve();let n=()=>{s.classList.remove("vx-modal-visible"),s.removeEventListener("keydown",o),setTimeout(()=>{s.remove(),Ve(),!t&&Ye&&Kr(Ye)},200)},o=i=>{i.key==="Escape"&&(i.stopPropagation(),i.preventDefault(),n())};s.addEventListener("keydown",o),s.querySelector("[data-close]").addEventListener("click",n),ke(s,n),s.tabIndex=-1,s.focus(),lp(s)}async function lp(e){let t=e.querySelector("#vx-img-grid");try{let s=await E.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",async()=>{var d,u;let i=o.dataset.path,a=(Ye==null?void 0:Ye.src)||"",r=(nt==null?void 0:nt.sourceFile)||(Ye==null?void 0:Ye.filePath)||Nt();await pp({filePath:r,oldSrc:a,newSrc:i,alt:((u=(d=Ye==null?void 0:Ye.outerHTML)==null?void 0:d.match(/alt="([^"]*)"/))==null?void 0:u[1])||"",sourceAddress:nt})&&fe({type:"vx-editor:swap-image",src:i}),Vn(),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function dp(e){at();let t=e.href||"",s=e.text||"",n=e.target||"",o=e.linkClass||"",i=e.linkClasses||[],a=(nt==null?void 0:nt.sourceFile)||e.filePath||Nt(),r=`<option value=""${o?"":" selected"}>No class</option>`,l=i.includes(o);i.forEach(c=>{r+=`<option value="${kt(c)}"${o===c?" selected":""}>${Ze(c)}</option>`}),o&&!l&&(r+=`<option value="${kt(o)}" selected>${Ze(o)}</option>`);let d=document.createElement("div");d.className="vx-modal-overlay",d.setAttribute("role","dialog"),d.setAttribute("aria-modal","true"),d.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${kt(t)}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${kt(s)}" placeholder="Link text"></div>
      ${i.length>0||o?`<div class="vx-form-group"><label class="vx-form-label">Link Style</label>
        <select class="vx-form-input" id="vx-link-style">${r}</select>
      </div>`:""}
      <div class="vx-form-group" style="margin-bottom:0;">
        <label class="vs-checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; position: relative;">
          <input type="checkbox" id="vx-link-target" class="vs-checkbox" ${n==="_blank"?"checked":""}>
          <span class="vs-checkbox-box"></span>
          <span style="font: 400 13px/1.4 var(--font-sans); color: var(--vs-text-primary);">Open in new window</span>
        </label>
      </div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(d),requestAnimationFrame(()=>d.classList.add("vx-modal-visible")),Ve(),Qr(d);let u=()=>{d.classList.remove("vx-modal-visible"),d.removeEventListener("keydown",p),d.__vxDestroyDrag&&d.__vxDestroyDrag(),setTimeout(()=>{d.remove(),Ve()},200)},p=c=>{c.key==="Escape"&&u()};d.addEventListener("keydown",p),d.querySelectorAll("[data-close]").forEach(c=>c.addEventListener("click",u)),ke(d,u),document.getElementById("vx-link-save").addEventListener("click",async()=>{var w;if((w=window.demoGuard)!=null&&w.call(window)){u();return}let c=document.getElementById("vx-link-href").value.trim(),v=document.getElementById("vx-link-text").value.trim(),m=document.getElementById("vx-link-target").checked?"_blank":"",g=document.getElementById("vx-link-style"),y=g?g.value:"",f=nt,h=[];c!==t&&h.push(jn(f,"href",t,c,a)),m!==n&&h.push(jn(f,"target",n||null,m||null,a)),y!==o&&h.push(jn(f,"class",o||null,y||null,a)),v!==s&&h.push(Ki(f,s,v,a)),h.forEach(k=>ue(k,"created")),await cp(a,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:c,newText:v,newTarget:m,newClass:y},h)&&(fe({type:"vx-editor:update-link",href:c,text:v,target:m,className:y}),setTimeout(()=>fe({type:"vx-editor:refresh-highlight"}),100)),u()}),setTimeout(()=>{var c;return(c=document.getElementById("vx-link-href"))==null?void 0:c.focus()},100)}function Rr(e,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:i,newText:a,newTarget:r,newClass:l}){let d=$=>$.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),u=d(t),p=new RegExp(`(<a\\s[^>]*?href=["']${u}["'][^>]*>)([\\s\\S]*?)(</a>)`,"gi"),c=[...e.matchAll(p)];if(c.length===0)return null;if(c.length>1)return"ambiguous";let v=c[0],m=v[1],g=v[2],y=v[3];i!==t&&(m=m.replace(new RegExp(`href=["']${d(t)}["']`),`href="${i}"`)),r!==n&&(r&&m.includes("target=")?m=m.replace(/target=["'][^"']*["']/,`target="${r}"`):r&&!m.includes("target=")?m=m.replace(/>$/,` target="${r}" rel="noopener">`):!r&&m.includes("target=")&&(m=m.replace(/\s*target=["'][^"']*["']/,""),m=m.replace(/\s*rel=["'][^"']*["']/,""))),l!==o&&(l&&m.includes("class=")?m=m.replace(/class=["'][^"']*["']/,`class="${l}"`):l&&!m.includes("class=")?m=m.replace(/>$/,` class="${l}">`):!l&&m.includes("class=")&&(m=m.replace(/\s*class=["'][^"']*["']/,""))),a!==s&&!g.includes("<")&&(g=a);let f=m+g+y,h=e.replace(v[0],f);return h!==e?h:e}async function cp(e,t,s){var o;let n=e||Nt();try{let i=await E.get(`/files/content?path=${encodeURIComponent(n)}`);if(!i.ok)return s&&s.forEach(d=>ue(d,"failed",{reason:"cannot read file"})),K("Cannot read source file",!0),!1;let a=i.data.content,r=Rr(a,t);if(r==="ambiguous")return s&&s.forEach(d=>ue(d,"failed",{reason:"ambiguous match \u2014 multiple links share this href"})),K("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(r!==null)return(await E.put("/files/content",{path:n,content:r})).ok?(s&&s.forEach(u=>ue(u,"persisted",{strategy:"contentMatch"})),K(`Saved \u2192 ${n.split("/").pop()}`),!0):(s&&s.forEach(u=>ue(u,"failed",{reason:"API write failed"})),K("Save failed",!0),!1);let l=await E.get("/files");if(l.ok){let d=(l.data.files||[]).filter(u=>u.path.endsWith(".php")&&u.path!==n);for(let u of d){let p=await E.get(`/files/content?path=${encodeURIComponent(u.path)}`);if(!p.ok||!((o=p.data)!=null&&o.content))continue;let c=Rr(p.data.content,t);if(c==="ambiguous")return s&&s.forEach(v=>ue(v,"failed",{reason:"ambiguous match in partial",file:u.path})),K("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(c!==null)return(await E.put("/files/content",{path:u.path,content:c})).ok?(s&&s.forEach(m=>ue(m,"persisted",{strategy:"partialSearch"})),K(`Saved \u2192 ${u.path.split("/").pop()}`),!0):(s&&s.forEach(m=>ue(m,"failed",{reason:"API write failed in partial",file:u.path})),K("Save failed",!0),!1)}}return s&&s.forEach(d=>ue(d,"failed",{reason:"link not found in source"})),K("Save failed \u2014 link not found in source",!0),!1}catch(i){return console.error("[VX] saveLinkToSource error:",i),s&&s.forEach(a=>ue(a,"failed",{reason:"exception",error:i.message})),K("Save failed \u2014 unexpected error",!0),!1}}async function pp(e){var l;if((l=window.demoGuard)!=null&&l.call(window))return!1;let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||Nt(),a=Ns(e.sourceAddress||nt),r=jn(a,"src",s,n,i);ue(r,"created");try{let d=await E.get(`/files/content?path=${encodeURIComponent(i)}`);if(!d.ok)return console.warn("[VX] Cannot read file for image save:",i),ue(r,"failed",{reason:"cannot read file"}),K("Save failed",!0),!1;let u=d.data.content,p=!1,c=`src="${s}"`,v=u.split(c).length-1;if(v>1)return ue(r,"failed",{reason:"ambiguous match \u2014 multiple elements share this src"}),K("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(v===1&&(u=u.replace(c,`src="${n}"`),p=!0),!p&&u.includes(s)){if(u.split(s).length-1>1)return ue(r,"failed",{reason:"ambiguous match \u2014 image path appears multiple times in source"}),K("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1;u=u.replace(s,n),p=!0}if(!p&&o){let g=Dr(u,o,n);if(g==="ambiguous")return ue(r,"failed",{reason:"ambiguous alt-anchor match \u2014 multiple images share this alt text"}),K("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;g!==!1&&(u=g,p=!0)}if(p)return(await E.put("/files/content",{path:i,content:u})).ok?(ue(r,"persisted",{strategy:"contentMatch"}),K(`Saved \u2192 ${i.split("/").pop()}`),!0):(ue(r,"failed",{reason:"API write failed"}),K("Save failed",!0),!1);let m=await E.get("/files");if(m.ok){let g=(m.data.files||[]).filter(y=>y.path.endsWith(".php")&&y.path!==i);for(let y of g){let f=await E.get(`/files/content?path=${encodeURIComponent(y.path)}`);if(!f.ok||!f.data.content)continue;let h=f.data.content,$=h.split(c).length-1;if($>1)return ue(r,"failed",{reason:"ambiguous match in partial",file:y.path}),K("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if($===1)return h=h.replace(c,`src="${n}"`),(await E.put("/files/content",{path:y.path,content:h})).ok?(ue(r,"persisted",{strategy:"partialSearch"}),K(`Saved \u2192 ${y.path.split("/").pop()}`),!0):(ue(r,"failed",{reason:"API write failed in partial",file:y.path}),K("Save failed",!0),!1);if(h.includes(s))return h.split(s).length-1>1?(ue(r,"failed",{reason:"ambiguous match in partial",file:y.path}),K("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1):(h=h.replace(s,n),(await E.put("/files/content",{path:y.path,content:h})).ok?(ue(r,"persisted",{strategy:"partialSearch"}),K(`Saved \u2192 ${y.path.split("/").pop()}`),!0):(ue(r,"failed",{reason:"API write failed in partial",file:y.path}),K("Save failed",!0),!1));if(o){let w=Dr(h,o,n);if(w==="ambiguous")return ue(r,"failed",{reason:"ambiguous alt-anchor match in partial",file:y.path}),K("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;if(w!==!1)return(await E.put("/files/content",{path:y.path,content:w})).ok?(ue(r,"persisted",{strategy:"altAnchor"}),K(`Saved \u2192 ${y.path.split("/").pop()}`),!0):(ue(r,"failed",{reason:"API write failed in partial",file:y.path}),K("Save failed",!0),!1)}}}return console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),ue(r,"failed",{reason:"source not found"}),K("Save failed \u2014 source not found",!0),!1}catch(d){return console.error("[VX] Image save error:",d),ue(r,"failed",{reason:"exception",error:d.message}),K("Save failed",!0),!1}}function Dr(e,t,s){let n=e.split("<img"),o=[];for(let p=1;p<n.length;p++){let c=n[p];if(c.includes(`alt="${t}"`)||c.includes(`alt='${t}'`)){let v=c.indexOf("src=");if(v!==-1){let m=c[v+4];(m==='"'||m==="'")&&c.indexOf(m,v+5)!==-1&&o.push(p)}}}if(o.length===0)return!1;if(o.length>1)return"ambiguous";let i=o[0],a=n[i],r=a.indexOf("src="),l=a[r+4],d=r+5,u=a.indexOf(l,d);return n[i]=a.substring(0,d)+s+a.substring(u),n.join("<img")}function Wo(e){var n;if((n=window.demoGuard)!=null&&n.call(window))return;let t=Ns(e.sourceAddress),s=Ki(t,e.originalHTML,e.newHTML,e.filePath);ue(s,"created"),Os.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:s}),clearTimeout(Wo._timer),Wo._timer=setTimeout(()=>dn(),800)}async function el(e){let{filePath:t,originalHTML:s,newHTML:n}=e;if(!s||!n)return K("Source edit failed \u2014 missing data",!0),!1;let o=t||Nt();try{let i=await E.get(`/files/content?path=${encodeURIComponent(o)}`);if(!i.ok)return K("Cannot read source file",!0),!1;let a=i.data.content,r=await Hr(o,a,s,n);if(r==="saved")return!0;if(r==="ambiguous")return!1;let l=await E.get("/files");if(!l.ok)return K("Save failed \u2014 source not found in file",!0),!1;let d=(l.data.files||[]).filter(u=>u.path.endsWith(".php")&&u.path!==o);for(let u of d){let p=await E.get(`/files/content?path=${encodeURIComponent(u.path)}`);if(!p.ok||!p.data.content)continue;let c=await Hr(u.path,p.data.content,s,n);if(c==="saved")return!0;if(c==="ambiguous")return!1}return console.warn("[VX] Source edit needle not found in any file:",s.substring(0,100)),K("Save failed \u2014 source not found. The file may have changed.",!0),!1}catch(i){return console.error("[VX] Source edit save error:",i),K("Save failed",!0),!1}}async function Hr(e,t,s,n){var l;let o=0,i=0;for(;;){let d=t.indexOf(s,i);if(d===-1||(o++,i=d+s.length,o>1))break}if(o===0)return"not_found";if(o>1)return K("Save failed \u2014 source fragment appears multiple times. Edit in the Code Editor instead.",!0),"ambiguous";let a=t.replace(s,n),r=await E.put("/files/content",{path:e,content:a});if(r.ok){let d=e.split("/").pop();return K(`Saved \u2192 ${d}`),(l=r.data)!=null&&l.tailwindCompiled&&setTimeout(()=>{let u=document.getElementById("preview-iframe");u!=null&&u.contentWindow&&u.contentWindow.postMessage("voxelsite:reload-css","*")},300),"saved"}else return K("Save failed",!0),"not_found"}function oa(e){var i;if((i=window.demoGuard)!=null&&i.call(window))return;let t=Ns(e.sourceAddress),s=e.parentAddress?Ns(e.parentAddress):null,n=typeof e.siblingIndex=="number"?e.siblingIndex:-1,o=xr(t,e.outerHTML,e.filePath,s,n);ue(o,"created"),Os.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:o}),clearTimeout(oa._timer),oa._timer=setTimeout(()=>dn(),300)}function up(e){let t=e.match(/class="([^"]*)"/);return t?t[1].split(/\s+/).filter(Boolean):[]}function vp(e,t,s,n){let o=new Set(["is-visible","is-active","is-open","active","open","show","shown","visible","in","entered","transitioning"]),i=/class="([^"]*)"/g,a;for(;(a=i.exec(e))!==null;){let r=a[1].split(/\s+/).filter(Boolean);if(r.length===0||!r.every(m=>t.has(m))||![...t].filter(m=>!r.includes(m)).every(m=>o.has(m)||s.includes(m)||n.includes(m)))continue;let p=r.filter(m=>!n.includes(m));for(let m of s)!o.has(m)&&!p.includes(m)&&p.push(m);let c=a[0],v=`class="${p.join(" ")}"`;return e.substring(0,a.index)+v+e.substring(a.index+c.length)}return null}async function dn(){var t,s,n,o,i,a,r;if(Uo||Os.length===0)return;Uo=!0;let e=[...Os];Os=[];try{let l={};for(let p of e){let c=((s=(t=p._op)==null?void 0:t.address)==null?void 0:s.sourceFile)||((n=p.sourceAddress)==null?void 0:n.sourceFile)||p.filePath||Nt();l[c]||(l[c]=[]),l[c].push(p)}let d=!1,u={filesByMain:new Map,contentByPath:new Map};for(let[p,c]of Object.entries(l))try{let v=await E.get(`/files/content?path=${encodeURIComponent(p)}`);if(!v.ok){console.error("[VX] Cannot read:",p);continue}let m=v.data.content,g=!1,y=[];for(let f of c){if(f._op&&f._op.type!==ce.FALLBACK){let $=Fo(f._op,m);if($.applied){m=$.content,g=!0,y.push({op:f._op,strategy:$.strategy});continue}console.warn("[VX] applyOp failed:",$.reason,"\u2014 falling back to legacy for",f._op.type),ue(f._op,"fallback",{fallbackReason:$.reason,via:"applyOp"})}let h=f.type==="delete"?f.outerHTML:f.originalHTML;if(h){if((o=f.sourceAddress)!=null&&o.nodeKey&&f.type==="text"){let $=f.sourceAddress,w=$.sourceFile||p,k=m;if(w!==p)try{let D=await E.get(`/files/content?path=${encodeURIComponent(w)}`);D.ok&&((i=D.data)!=null&&i.content)&&(k=D.data.content)}catch{}let T=$.nodeKey.lastIndexOf(":"),_=!1;if(T!==-1){let D=parseInt($.nodeKey.substring(T+1),10);if(!isNaN(D)){let q=Pc(k,D);if(q){let Q=Xr(k,k.indexOf(q));if(Q){let X=Q.length,O=q.lastIndexOf("</");if(O>X){let de=q.substring(O),J=Q+f.newHTML+de;if(w!==p){let H=k.replace(q,J),L=await E.put("/files/content",{path:w,content:H});L.ok&&(K(`Saved \u2192 ${w.split("/").pop()}`),(a=L.data)!=null&&a.tailwindCompiled&&(d=!0),_=!0,f._op&&(ue(f._op,"persisted",{strategy:"nodeKey",via:"legacy"}),Fn(f._op,w)))}else m=m.replace(q,J),g=!0,_=!0,f._op&&y.push({op:f._op,strategy:"nodeKey",via:"legacy"})}}}}}if(_)continue;console.warn("[VX] Legacy nodeKey extraction failed for",$.nodeKey,"\u2014 trying content match"),f._op&&ue(f._op,"fallback",{fallbackReason:"legacy nodeKey extraction failed",nodeKey:$.nodeKey})}if(m.includes(h))m=f.type==="delete"?m.replace(h,""):m.replace(h,f.newHTML),g=!0,f._op&&y.push({op:f._op,strategy:"contentMatch",via:"legacy"});else if(f.type==="class-change"&&f.additions){let $=new Set(up(h)),w=vp(m,$,f.additions,f.removals);if(w)m=w,g=!0,f._op&&y.push({op:f._op,strategy:"subsetMatch",via:"legacy"});else{let k=await Nr(p,f,u);if(k.status==="saved"){f._op&&(ue(f._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:k.path}),Fn(f._op,k.path)),d=!0;continue}k.status==="write_failed"?f._op&&ue(f._op,"failed",{reason:"partial write failed",file:k.path}):(console.warn("[VX] Not found in source:",h.substring(0,80)),f._op&&ue(f._op,"failed",{reason:"source not found"}),K("Save failed \u2014 source not found",!0))}}else{let $=await Nr(p,f,u);if($.status==="saved"){f._op&&(ue(f._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:$.path}),Fn(f._op,$.path)),d=!0;continue}$.status==="write_failed"?f._op&&ue(f._op,"failed",{reason:"partial write failed",file:$.path}):(console.warn("[VX] Not found in source:",h.substring(0,80)),f._op&&ue(f._op,"failed",{reason:"source not found"}),K("Save failed \u2014 source not found",!0))}}}if(g){let f=await E.put("/files/content",{path:p,content:m});if(f.ok){K(`Saved \u2192 ${p.split("/").pop()}`),(r=f.data)!=null&&r.tailwindCompiled&&(d=!0);for(let{op:h,strategy:$,via:w}of y)ue(h,"persisted",{strategy:$,via:w||"applyOp"}),Fn(h,p)}else{K("Save failed",!0);for(let{op:h,via:$}of y)ue(h,"failed",{reason:"file write failed",via:$||"applyOp"})}}}catch(v){console.error("[VX] Save error:",v),K("Save failed",!0)}d&&setTimeout(()=>{let p=document.getElementById("preview-iframe");p!=null&&p.contentWindow&&p.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{Uo=!1,Os.length>0?setTimeout(()=>dn(),0):fe({type:"vx-editor:save-feedback"})}}async function Nr(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let r=await E.get("/files");if(!r.ok)return{status:"not_found"};a=(r.data.files||[]).filter(l=>l.path.endsWith(".php")&&l.path!==e).filter(l=>o.some(d=>l.path.includes(d+"/"))||l.path.includes("partial")||l.path.includes("header")||l.path.includes("footer")||l.path.includes("nav")),i.filesByMain.set(e,a)}for(let r of a){let l=i.contentByPath.get(r.path);if(l==null){let d=await E.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!d.ok||!d.data.content)continue;l=d.data.content,i.contentByPath.set(r.path,l)}if(l.includes(n)){let d=t.type==="delete"?l.replace(n,""):l.replace(n,t.newHTML);return(await E.put("/files/content",{path:r.path,content:d})).ok?(i.contentByPath.set(r.path,d),K(`Saved \u2192 ${r.path.split("/").pop()}`),{status:"saved",path:r.path}):(K("Save failed",!0),{status:"write_failed",path:r.path})}}}catch(a){console.error("[VX] Partial search error:",a)}return{status:"not_found"}}async function mp(e){var i;let{filePath:t,sectionIndex:s,neighborIndex:n}=e,o=t||Nt();try{let a=await E.get(`/files/content?path=${encodeURIComponent(o)}`);if(!a.ok){K("Could not read file",!0);return}let r=a.data.content,l=gp(r);if(s>=l.length||n>=l.length){K("Section not found in source. Try asking the AI to move it.",!0);return}let d=fp(r,l,s,n);if(!d){K("Could not swap sections in source",!0);return}let u=await E.put("/files/content",{path:o,content:d});u.ok?(K("Section moved"),(i=u.data)!=null&&i.tailwindCompiled&&setTimeout(()=>{let p=document.getElementById("preview-iframe");p!=null&&p.contentWindow&&p.contentWindow.postMessage("voxelsite:reload-css","*")},300)):K("Save failed",!0)}catch(a){console.error("[VX] Section move error:",a),K("Section move failed",!0)}}function gp(e){let t=[],s=/<section\b/gi,n;for(;(n=s.exec(e))!==null;){let o=n.index,a=e.substring(Math.max(0,o-500),o).match(/(<!--[\s\S]*?-->\s*)$/);a&&(o-=a[0].length);let r="</section>",l=1,d=n.index+n[0].length;for(;l>0&&d<e.length;){let u=e.indexOf("<section",d),p=e.indexOf(r,d);if(p===-1)break;if(u!==-1&&u<p){let c=e[u+8];(c===" "||c===">"||c===`
`||c==="\r"||c==="	"||c==="/")&&l++,d=u+9}else{if(l--,l===0){let c=p+r.length;t.push({start:o,end:c,content:e.substring(o,c)})}d=p+r.length}}}return t}function fp(e,t,s,n){if(s===n)return e;let o=Math.min(s,n),i=Math.max(s,n),a=t[o],r=t[i];if(!a||!r||a.end>r.start)return null;let l=e.substring(0,a.start),d=e.substring(a.end,r.start),u=e.substring(r.end);return l+r.content+d+a.content+u}function tl(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",st),e.title=st?"Exit visual editor (V)":"Enter visual editor (V)",e.setAttribute("aria-pressed",String(st))),document.body.classList.toggle("vx-editing",st)}function K(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(K._timer),K._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function fe(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function Nt(){return window.__vsCurrentPreviewPath||"index.php"}function ia(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),r=a.right-s-o,l=Math.max(o,a.left+10),d=Math.max(o,window.innerWidth-s-o),u=Math.min(Math.max(r,l),d),p=Math.max(a.top+12,i),c=Math.max(i,window.innerHeight-n-o),v=Math.min(p,c);e.style.left=`${u}px`,e.style.top=`${v}px`,e.style.right="auto"}function jr(e,t,s){let n=e.offsetWidth||380,o=e.offsetHeight||180,i=16,a=56,r=document.getElementById("preview-iframe");if(!r||!s){ia(e);return}let l=r.getBoundingClientRect(),d=l.top+s.top,u=l.top+s.top+s.height,c=l.left+s.left+s.width/2-n/2,v,m=d-o-4;m>=a?v=m:v=u+8;let g=Math.max(i,window.innerWidth-n-i),f=Math.min(Math.max(c,i),g),h=Math.max(a,window.innerHeight-o-i),$=Math.min(Math.max(v,a),h);e.style.left=`${f}px`,e.style.top=`${$}px`,e.style.right="auto"}function hp(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function kt(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Ze(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ue(e,t,s={}){var o,i;let n={opId:(e==null?void 0:e.id)||"unknown",type:(e==null?void 0:e.type)||"unknown",event:t,sourceKind:((o=e==null?void 0:e.address)==null?void 0:o.sourceKind)||"unknown",sourceFile:((i=e==null?void 0:e.address)==null?void 0:i.sourceFile)||(e==null?void 0:e.filePath)||"unknown",timestamp:Date.now(),...s};Zi.push(n),Zi.length>$c&&Zi.shift(),t==="failed"||t==="fallback"?console.warn(`[VX-OPS] ${t}:`,Yi(e==null?void 0:e.type),n):console.debug(`[VX-OPS] ${t}:`,Yi(e==null?void 0:e.type),n.sourceFile)}async function bp(){var s;let e=Sr();if(!e){K("Nothing to undo");return}let t=e.filePath;if(!t){K("Undo failed \u2014 no file path",!0);return}try{let n=await E.get(`/files/content?path=${encodeURIComponent(t)}`);if(!n.ok){K("Undo failed \u2014 cannot read file",!0);return}let o=Fo(e.inverseOp,n.data.content);if(!o.applied){console.warn("[VX History] Undo applyOp failed:",o.reason),K("Undo failed \u2014 source has changed",!0);return}let i=await E.put("/files/content",{path:t,content:o.content});if(!i.ok){K("Undo failed \u2014 save error",!0);return}Tr(),ue(e.inverseOp,"persisted",{strategy:o.strategy,via:"undo"}),K("Undone"),rn+=2,fe({type:"vx-editor:replay-op",op:e.inverseOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Undo error:",n),K("Undo failed",!0)}}async function yp(){var s;let e=Mr();if(!e){K("Nothing to redo");return}let t=e.filePath;if(!t){K("Redo failed \u2014 no file path",!0);return}try{let n=await E.get(`/files/content?path=${encodeURIComponent(t)}`);if(!n.ok){K("Redo failed \u2014 cannot read file",!0);return}let o=Fo(e.forwardOp,n.data.content);if(!o.applied){console.warn("[VX History] Redo applyOp failed:",o.reason),K("Redo failed \u2014 source has changed",!0);return}let i=await E.put("/files/content",{path:t,content:o.content});if(!i.ok){K("Redo failed \u2014 save error",!0);return}Ir(),ue(e.forwardOp,"persisted",{strategy:o.strategy,via:"redo"}),K("Redone"),rn+=2,fe({type:"vx-editor:replay-op",op:e.forwardOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Redo error:",n),K("Redo failed",!0)}}function rl(){return setTimeout(()=>gs(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function gs(){var H,L,N,F,V,te,ee;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,r]=await Promise.all([E.get("/settings"),E.get("/settings/system"),E.get("/settings/mail"),E.get("/settings/usage"),E.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),E.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),E.get("/settings/logs")]),l=((H=r.data)==null?void 0:H.logs)||[],d=((L=t.data)==null?void 0:L.settings)||{},u=((N=s.data)==null?void 0:N.system)||{},p=d.site_favicon||null,c=p?`/${p}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),v=null,m=null;try{i.ok&&((F=i.data)!=null&&F.content)&&(v=JSON.parse(i.data.content))}catch{}try{a.ok&&((V=a.data)!=null&&V.content)&&(m=JSON.parse(a.data.content))}catch{}let g=v||m,y=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},f=d.available_providers||{},h=((te=n.data)==null?void 0:te.config)||{},$=((ee=n.data)==null?void 0:ee.presets)||{},w=Object.keys(f),k=d.ai_provider||"claude",_=(f[k]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],D=d[`ai_${k}_model`]||"",q=d[`ai_${k}_api_key_set`]||!1,Q=w.map(j=>{let oe=f[j];return`<option value="${b(j)}" ${j===k?"selected":""}>${b(oe.name)}</option>`}).join(""),X="";for(let j of _)j.key==="api_key"?X+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${b(j.label)}${j.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${q?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${b(j.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${q?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':j.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${b(j.help_text||"Optional for local servers")}</p>`}
          ${j.help_url?`<a href="${j.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${b(j.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:j.key==="base_url"&&(X+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${b(j.label)}${j.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${b(d.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${b(j.placeholder)}" />
          ${j.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${b(j.help_text)}</p>`:""}
        </div>`);e.innerHTML=`
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${b(d.site_name||"")}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${b(d.site_tagline||"")}"
            class="vs-input"
            placeholder="A short description of your site" />
        </div>

        <!-- Favicon -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-2">Favicon</label>
          <div class="vs-favicon-zone" id="vs-favicon-zone">
            <div class="vs-favicon-preview" id="vs-favicon-preview">
              <img src="${c}" alt="Current favicon" class="vs-favicon-img" id="vs-favicon-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML = '<div class=\\'vs-favicon-placeholder\\'><svg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'m21 15-5-5L5 21\\'/></svg></div>';" />
            </div>
            <div class="vs-favicon-info">
              <div class="vs-favicon-actions">
                <button type="button" class="vs-btn vs-btn-secondary vs-btn-xs" id="btn-favicon-upload">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                </button>
                ${p?`
                <button type="button" class="vs-btn vs-btn-ghost vs-btn-xs vs-favicon-remove" id="btn-favicon-remove" title="Remove favicon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                `:""}
              </div>
              <p class="vs-favicon-hint">.ico format \u2014 max 512 KB</p>
            </div>
            <input type="file" id="vs-favicon-file" accept=".ico,image/x-icon,image/vnd.microsoft.icon" class="hidden" />
          </div>
        </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-identity-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-identity" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Identity
        </button>
      </div>
    </div>

    <!-- Card: AI Engine -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Provider</h2>
      <p class="vs-settings-card-subtitle">Configure the AI engine that powers your website generation.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-ai-provider" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
          <select id="set-ai-provider" class="vs-input">
            ${Q}
          </select>
        </div>

        <div id="settings-config-fields">
          ${X}
        </div>

        <div>
          <label for="set-ai-model" class="block text-sm font-medium text-vs-text-secondary mb-1">Model</label>
          <select id="set-ai-model" class="vs-input">
            <option value="">Loading models\u2026</option>
          </select>
        </div>

        <div>
          <label for="set-max-tokens" class="block text-sm font-medium text-vs-text-secondary mb-1">Max Output Tokens</label>
          <input id="set-max-tokens" type="number" value="${d.ai_max_tokens||32e3}" min="1000" max="128000" step="1000"
            class="vs-input" />
          <p class="text-xs text-vs-text-ghost mt-1">Higher values allow larger website generations but cost more.</p>
        </div>

        <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
              <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                <input type="checkbox" id="set-evaluator-enabled" ${d.evaluator_enabled?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span class="vs-toggle-track" style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${d.evaluator_enabled?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span class="vs-toggle-thumb" style="
                  position: absolute; left: ${d.evaluator_enabled?"18px":"2px"}; top: 2px;
                  width: 16px; height: 16px; border-radius: 50%;
                  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  transition: left 0.2s ease;
                "></span>
              </span>
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-secondary);">
                  Expert review after generation
                </span>
                <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.4;">Surfaces heuristic HTML, accessibility, and SEO suggestions after each generation. Does not auto-fix issues \u2014 results are advisory for users comfortable reviewing web-design advice. Adds a few seconds and extra tokens per generation.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-settings" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Settings
        </button>
      </div>
    </div>

    <!-- Card: Email & Notifications -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Email & Notifications</h2>
      <p class="vs-settings-card-subtitle">Configure how VoxelSite sends transactional emails.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-driver" class="block text-sm font-medium text-vs-text-secondary mb-1">Delivery Method</label>
          <select id="set-mail-driver" class="vs-input">
            <option value="none" ${h.driver==="none"?"selected":""}>Not configured</option>
            <option value="php_mail" ${h.driver==="php_mail"?"selected":""}>PHP mail()</option>
            <option value="smtp" ${h.driver==="smtp"?"selected":""}>SMTP</option>
            <option value="mailpit" ${h.driver==="mailpit"?"selected":""}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${h.driver==="smtp"?"block":"none"};">
          <div class="flex flex-col gap-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries($).map(([j,oe])=>`<option value="${b(j)}">${b(oe.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${b(h.smtp_host||"")}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${h.smtp_port||587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${h.smtp_encryption==="tls"?"selected":""}>TLS (STARTTLS)</option>
                  <option value="ssl" ${h.smtp_encryption==="ssl"?"selected":""}>SSL</option>
                  <option value="none" ${h.smtp_encryption==="none"?"selected":""}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${b(h.smtp_username||"")}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${h.smtp_password||""}"
                  class="vs-input font-mono"
                  style="padding-right: 40px;"
                  placeholder="Enter SMTP password" />
                <button id="btn-toggle-smtp-pass" type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-vs-text-ghost hover:text-vs-text-secondary transition-colors cursor-pointer" tabindex="-1" style="background:none;border:none;padding:4px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mailpit Fields -->
        <div id="mail-mailpit-fields" style="display: ${h.driver==="mailpit"?"block":"none"};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${b(h.mailpit_host||"localhost")}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${h.mailpit_port||1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${h.driver==="none"?"none":"block"};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${b(h.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${b(h.from_name||"")}"
            class="vs-input"
            placeholder="Your Site Name" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender name on notification emails.</p>
        </div>

        <div class="border-t border-vs-border-subtle"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${b(d.user_email||"")}"
              class="vs-input" style="flex: 1;"
              placeholder="your@email.com" />
            <button id="btn-mail-test"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Send Test
            </button>
          </div>
          <p id="mail-test-status" class="text-xs mt-1.5 hidden"></p>
        </div>
        </div>
      </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-mail-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-mail" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Email Settings
        </button>
      </div>
    </div>

    ${g?`
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${v?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${x.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(v).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${x.chevronRight}</div>
        </button>
        `:""}
        ${m?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${x.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(m).length} design decisions</span>
          </div>
          <div class="vs-knowledge-card-arrow">${x.chevronRight}</div>
        </button>
        `:""}
      </div>
      <p class="vs-knowledge-hint">
        ${x.info}
        You can't edit these values directly \u2014 ask VoxelSite in chat to update them.
      </p>
    </div>
    `:""}

    <!-- Card: AI Usage -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Usage</h2>
      <p class="vs-settings-card-subtitle">Token consumption and cost tracking across models.</p>
      ${y.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${ht("Total Requests",Number(y.totals.request_count).toLocaleString())}
          ${ht("Input Tokens",Number(y.totals.total_input_tokens).toLocaleString())}
          ${ht("Output Tokens",Number(y.totals.total_output_tokens).toLocaleString())}

        </div>
        ${y.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${y.models.map(j=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${ht(j.ai_model||"Unknown",Number(j.request_count).toLocaleString()+" requests")}
                ${ht("Tokens",Number(j.total_input_tokens).toLocaleString()+" in / "+Number(j.total_output_tokens).toLocaleString()+" out")}

              </div>
            `).join("")}
          </div>
        `:""}
      `}
    </div>

    <!-- Card: System Status -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">System Status</h2>
      <p class="vs-settings-card-subtitle">Runtime environment and resource usage.</p>
      <div class="vs-sys-grid">
        ${ht("VoxelSite",u.version||"1.0.0")}
        ${ht("PHP",u.php_version||"?")}
        ${ht("SQLite",u.sqlite_version||"?")}
        ${ht("Database",pa(u.database_size))}
        ${ht("Preview Files",pa(u.preview_size))}
        ${ht("Assets",pa(u.assets_size))}
        ${ht("Upload Limit",u.max_upload||"?")}
        ${ht("Memory Limit",u.memory_limit||"?")}
      </div>
    </div>

    <!-- Card: Update -->
    <div class="vs-settings-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Update</h2>
        <span class="vs-pill vs-pill-subtle">v${b(u.version||"1.0.0")}</span>
      </div>
      <p class="vs-settings-card-subtitle">Upload a VoxelSite update package (.zip) to update to the latest version. Your pages, settings, database, and uploaded files are preserved.</p>

      <!-- Detected dist packages (populated dynamically) -->
      <div id="vs-dist-packages"></div>

      <div class="vs-update-zone" id="vs-update-zone">
        <div class="vs-update-zone-idle" id="vs-update-idle">
          <div class="vs-update-zone-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div class="vs-update-zone-text">
            <span class="vs-update-zone-label">Drop update .zip here or click to browse</span>
            <span class="vs-update-zone-hint">Only system files are updated \u2014 your content stays safe</span>
            <span class="vs-update-zone-hint" style="margin-top: 4px; opacity: 0.6;">Upload limit too low? Upload the .zip to <code>/dist/</code> via FTP and it will appear above.</span>
          </div>
          <input type="file" id="vs-update-file" accept=".zip" class="hidden" />
        </div>

        <div class="vs-update-zone-progress hidden" id="vs-update-progress">
          <div class="vs-update-spinner"></div>
          <span id="vs-update-status">Uploading...</span>
        </div>

        <div class="vs-update-zone-result hidden" id="vs-update-result">
          <div id="vs-update-result-icon"></div>
          <div id="vs-update-result-message"></div>
        </div>
      </div>
    </div>

    <!-- Server Logs -->
    <div class="vs-settings-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${l.length>0?"16px":"0"};">
        <div>
          <h3 class="vs-settings-card-title">Server Logs</h3>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Download log files for debugging.</p>
        </div>
        ${l.length>0?`<button id="btn-delete-all-logs" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete all
        </button>`:""}
      </div>
      <div id="log-files-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${l.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':l.map(j=>{let oe=(j.size/1024).toFixed(1),me=new Date(j.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${j.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${j.lines} lines \xB7 ${oe} KB \xB7 ${me}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(j.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${j.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            </div>`}).join("")}
      </div>
    </div>

    <!-- Card: API Access -->
    <div class="vs-settings-card" id="api-access-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <h2 class="vs-settings-card-title" style="display: flex; align-items: center; gap: 8px;">API Access <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; background: color-mix(in srgb, var(--vs-accent) 12%, transparent); color: var(--vs-accent); border: 1px solid color-mix(in srgb, var(--vs-accent) 25%, transparent);">Beta</span></h2>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Manage Agent API keys for external integrations and automations.</p>
        </div>
        <a href="/_studio/api/agent/v1/schema" target="_blank" rel="noopener" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap; text-decoration: none;">
          ${x.externalLink} View API schema
        </a>
      </div>
      <div class="flex flex-col gap-4">
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="set-api-enabled" ${d.agent_api_enabled?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span class="vs-toggle-track" style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${d.agent_api_enabled?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span class="vs-toggle-thumb" style="
                position: absolute; left: ${d.agent_api_enabled?"18px":"2px"}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <div style="display: flex; flex-direction: column; gap: 1px;">
              <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-secondary);">
                Enable Agent API
              </span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.4;">Allow external applications to manage your site via authenticated REST API.</span>
            </div>
          </label>
        </div>

        <div id="api-access-body" style="${d.agent_api_enabled?"":"opacity: 0.4; pointer-events: none;"}">
          <div style="margin-bottom: 16px;">
            <label for="set-api-origins" style="display: block; font-size: 13px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;">Allowed Origins</label>
            <textarea id="set-api-origins"
              class="vs-input" rows="3"
              style="resize: vertical; font-family: var(--font-mono); font-size: 12px; height: auto; padding: 10px 14px; line-height: 1.5;"
              placeholder="*">${b(d.agent_api_allowed_origins||"*")}</textarea>
            <p style="font-size: 11px; color: var(--vs-text-ghost); margin: 6px 0 0;">Enter <code>*</code> to allow all origins, or one origin per line (e.g. <code>https://example.com</code>).</p>
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-secondary);">API Keys</span>
              <button id="btn-generate-api-key" class="vs-btn vs-btn-secondary vs-btn-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Generate Key
              </button>
            </div>
            <div id="api-keys-list">
              <div class="text-xs text-vs-text-ghost text-center py-4">Loading keys...</div>
            </div>
          </div>
        </div>
      </div>
      <div class="vs-settings-card-footer">
        <span id="save-api-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-api-settings" class="vs-btn vs-btn-primary vs-btn-sm">
          Save API Settings
        </button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="vs-danger-zone">
      <h3 class="vs-danger-zone-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Danger Zone
      </h3>

      <p class="vs-danger-zone-desc">
        Clear the entire website and start fresh. This removes all pages, styles, scripts,
        conversation history, forms, and revisions. Your settings, API keys, and uploaded images are preserved.
      </p>
      <button id="btn-reset-site" class="vs-btn vs-btn-danger vs-btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Website
      </button>

      <div style="border-top: 1px solid var(--vs-border-subtle); margin: 16px 0;"></div>

      <p class="vs-danger-zone-desc">
        Completely wipe the installation \u2014 database, config, uploaded files, and all generated content.
        The installation wizard will appear so you can start from scratch.
      </p>
      <button id="btn-reset-install" class="vs-btn vs-btn-danger vs-btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        Reset Installation
      </button>
    </div>
  `,Tp(d,f),Mp(h,$),Ep(),$p(),Ip(d),document.querySelectorAll(".btn-delete-log").forEach(j=>{j.addEventListener("click",async()=>{var ye;if((ye=window.demoGuard)!=null&&ye.call(window))return;if(j.dataset.confirm!=="true"){j.dataset.confirm="true",j.innerHTML='<span style="font-size: 11px;">Sure?</span>',j.style.color="var(--vs-error)",setTimeout(()=>{j.dataset.confirm==="true"&&(j.dataset.confirm="",j.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',j.style.color="")},3e3);return}let oe=j.dataset.file,me=j.closest(".vs-log-row");me&&(me.style.opacity="0.4"),await E.delete("/settings/logs",{file:oe}),gs()})});let O=document.getElementById("btn-delete-all-logs");O&&O.addEventListener("click",async()=>{var j;if(!((j=window.demoGuard)!=null&&j.call(window))){if(O.dataset.confirm!=="true"){O.dataset.confirm="true",O.textContent="Sure?",O.style.color="var(--vs-error)",setTimeout(()=>{O.dataset.confirm==="true"&&(O.dataset.confirm="",O.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',O.style.color="")},3e3);return}O.disabled=!0,O.textContent="Deleting...",await E.delete("/settings/logs",{file:"*"}),gs()}});let de=document.getElementById("btn-view-memory");de&&v&&de.addEventListener("click",()=>sl("Site Memory",v,"memory"));let J=document.getElementById("btn-view-design");J&&m&&J.addEventListener("click",()=>sl("Design Intelligence",m,"design")),wp(),kp(),Sp(D)}function xp(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function wp(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;r();async function r(){var c;if(a)try{let{ok:v,data:m}=await E.get("/update/dist-packages");if(!v||!((c=m==null?void 0:m.packages)!=null&&c.length)){a.innerHTML="";return}let g=m.current_version||"0.0.0",y=m.packages.map(f=>{let h=(f.size/1024/1024).toFixed(1),$=xp(f.version,g)>0,w=f.version===g,k=$?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':w?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${b(f.filename)}</strong>
                ${k}
              </div>
              <div class="vs-dist-pkg-meta">v${b(f.version)} \xB7 ${h} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${b(f.filename)}" data-version="${b(f.version)}">
              Apply Update
            </button>
          </div>
        `}).join("");a.innerHTML=`
        <div class="vs-dist-packages-section">
          <div class="vs-dist-packages-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Update packages found in <code>/dist/</code></span>
          </div>
          ${y}
        </div>
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(f=>{f.addEventListener("click",()=>l(f.dataset.filename,f.dataset.version))})}catch{}}async function l(c,v){var g,y;if(!((g=window.demoGuard)!=null&&g.call(window)||!confirm(`Apply update from "${c}" (v${v})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${c}...`,a&&(a.innerHTML="");try{let{ok:f,data:h,error:$}=await E.post("/update/apply-local",{filename:c});s.classList.add("hidden"),n.classList.remove("hidden");let w=document.getElementById("vs-update-result-icon"),k=document.getElementById("vs-update-result-message");if(f){let T=h;w.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',k.innerHTML=`
          <div class="vs-update-result-title">${b(T.message)}</div>
          <div class="vs-update-result-meta">
            ${T.files_updated} files updated \xB7 ${T.files_skipped} preserved
            ${(y=T.errors)!=null&&y.length?` \xB7 ${T.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else u("Update Failed",($==null?void 0:$.message)||"Unknown error")}catch(f){u("Update Failed",b(f.message||"Network error."))}}}e.addEventListener("click",c=>{var v;(v=window.demoGuard)!=null&&v.call(window)||c.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",c=>{c.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",c=>{var m,g,y;if(c.preventDefault(),e.classList.remove("is-dragover"),(m=window.demoGuard)!=null&&m.call(window))return;let v=(y=(g=c.dataTransfer)==null?void 0:g.files)==null?void 0:y[0];v&&v.name.endsWith(".zip")&&d(v)}),o.addEventListener("change",()=>{var v;let c=(v=o.files)==null?void 0:v[0];c&&d(c),o.value=""});async function d(c){var g,y;let v=document.querySelector(".vs-sys-grid");if(v){let f=v.querySelectorAll(".vs-sys-value"),h="";if(v.querySelectorAll(".vs-sys-label").forEach(($,w)=>{var k,T;$.textContent.trim()==="Upload Limit"&&(h=((T=(k=f[w])==null?void 0:k.textContent)==null?void 0:T.trim())||"")}),h){let $=p(h);if($>0&&c.size>$){let w=(c.size/1024/1024).toFixed(1);u("File Too Large",`The update file is ${w} MB but your server's upload limit is ${h}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${w} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${c.name}" (${(c.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${c.name}...`;try{let f=new FormData;f.append("update_zip",c);let h=P.get("sessionToken"),$=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:h?{"X-VS-Token":h}:{},body:f}),w=$.headers.get("content-type")||"",k;if(!w.includes("application/json")){let D=await $.text();if(D.includes("POST Content-Length")||D.includes("upload_max_filesize")||D.includes("exceeds")){u("Server Upload Limit Exceeded",`The file (${(c.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}u("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}k=await $.json(),s.classList.add("hidden"),n.classList.remove("hidden");let T=document.getElementById("vs-update-result-icon"),_=document.getElementById("vs-update-result-message");if(k.ok){let D=k.data;T.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',_.innerHTML=`
          <div class="vs-update-result-title">${b(D.message)}</div>
          <div class="vs-update-result-meta">
            ${D.files_updated} files updated \xB7 ${D.files_skipped} preserved
            ${(g=D.errors)!=null&&g.length?` \xB7 ${D.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else u("Update Failed",((y=k.error)==null?void 0:y.message)||"Unknown error")}catch(f){let h=f.message||"Network error. Check your connection.";h.includes("Unexpected token")||h.includes("not valid JSON")?u("Server Upload Limit Exceeded",`The file (${(c.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):u("Upload Failed",b(h))}}}function u(c,v){s.classList.add("hidden"),n.classList.remove("hidden");let m=document.getElementById("vs-update-result-icon"),g=document.getElementById("vs-update-result-message");m.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',g.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${b(c)}</div>
      <div class="vs-update-result-meta">${v}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function p(c){let v=c.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!v)return 0;let m=parseFloat(v[1]),g=v[2].toUpperCase();return g==="GB"||g==="G"?m*1024*1024*1024:g==="MB"||g==="M"?m*1024*1024:g==="KB"||g==="K"?m*1024:0}}function kp(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var r,l,d;if(i.preventDefault(),e.classList.remove("is-dragover"),(r=window.demoGuard)!=null&&r.call(window))return;let a=(d=(l=i.dataTransfer)==null?void 0:l.files)==null?void 0:d[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,r;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let l=await E.delete("/settings/favicon");l.ok?(I("Favicon removed.","success"),gs()):I(((r=l.error)==null?void 0:r.message)||"Could not remove favicon.","error")}catch{I("Could not remove favicon.","error")}}});async function o(i){var u;if(i.size>524288){I("Favicon must be under 512 KB.","error");return}let r=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!r.includes(i.type)){I("Favicon must be a .ico file.","error");return}let d=document.getElementById("vs-favicon-preview");d&&(d.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let p=new FormData;p.append("favicon",i);let c=P.get("sessionToken"),m=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:c?{"X-VS-Token":c}:{},body:p})).json();m.ok?(I("Favicon updated.","success"),gs()):(I(((u=m.error)==null?void 0:u.message)||"Upload failed.","error"),gs())}catch{I("Upload failed. Check your connection.","error"),gs()}}}function sl(e,t,s){var l,d,u;(l=document.getElementById("vs-knowledge-overlay"))==null||l.remove();let n=p=>p.replace(/[_-]/g," ").replace(/\b\w/g,c=>c.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([p,c])=>{let v=typeof c=="object"?c.value||JSON.stringify(c):String(c),m=typeof c=="object"?c.confidence:null,g=m==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${b(n(p))}</div>
          <div class="vs-kv-value">
            <span>${b(v)}</span>
            ${m?`<span class="vs-kv-badge ${g}">${b(m)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(t).map(([p,c])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${b(n(p))}</div>
        <div class="vs-kv-section-body">${b(String(c))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?x.book:x.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${b(e)}</h2>
            <p class="vs-knowledge-modal-subtitle">${s==="memory"?"Facts the AI has learned about your business from conversations.":"Design decisions the AI uses to maintain visual consistency."}</p>
          </div>
        </div>
        <button id="vs-knowledge-close" class="vs-btn vs-btn-ghost vs-btn-icon" title="Close">${x.x}</button>
      </div>
      <div class="vs-knowledge-modal-body">
        ${o}
      </div>
      <div class="vs-knowledge-modal-footer">
        <span class="vs-knowledge-modal-hint">
          ${x.info}
          These values are managed by VoxelSite. Ask in chat to update them.
        </span>
        <button id="vs-knowledge-done" class="vs-btn vs-btn-primary vs-btn-sm">Done</button>
      </div>
    </div>
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",r)},r=p=>{p.key==="Escape"&&a()};document.addEventListener("keydown",r),(d=i.querySelector("#vs-knowledge-close"))==null||d.addEventListener("click",a),(u=i.querySelector("#vs-knowledge-done"))==null||u.addEventListener("click",a),ke(i,a)}function Ep(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Lp()})}function $p(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Cp()})}function Cp(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" id="reset-install-modal">
      <div class="vs-modal-header">
        <div class="vs-modal-icon vs-modal-icon-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </div>
        <h2 class="vs-modal-title">Reset Installation</h2>
        <p class="vs-modal-desc">This will erase <strong>everything</strong> \u2014 your database, config, account, uploaded files, and all generated content. The installation wizard will appear so you can start completely from scratch.</p>
      </div>

      <div class="vs-modal-body">
        <ul class="vs-modal-checklist">
          <li class="will-delete"><span class="check-icon">\u2715</span> Database (settings, conversations, revisions)</li>
          <li class="will-delete"><span class="check-icon">\u2715</span> Your account, API keys, and config</li>
          <li class="will-delete"><span class="check-icon">\u2715</span> All uploaded images, files, and fonts</li>
          <li class="will-delete"><span class="check-icon">\u2715</span> All generated pages, styles, and scripts</li>
          <li class="will-delete"><span class="check-icon">\u2715</span> Snapshots and backups</li>
        </ul>

        <label class="vs-modal-confirm-label">
          Type <code>RESET INSTALLATION</code> to confirm
        </label>
        <input
          type="text"
          id="reset-install-confirm-input"
          class="vs-modal-confirm-input"
          placeholder="Type RESET INSTALLATION here"
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="vs-modal-footer">
        <button id="reset-install-cancel-btn" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="reset-install-confirm-btn" class="vs-btn vs-btn-confirm-danger vs-btn-sm" style="position: relative; overflow: hidden;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Erase Everything
        </button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-install-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let l=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()===a?nl(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?nl(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>we(t)),t.addEventListener("click",l=>{l.target===t&&we(t)});let r=l=>{l.key==="Escape"&&(we(t),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)}async function nl(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await E.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let r=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=r,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function ll(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
      <div class="vs-modal" id="unsaved-modal">
        <div class="vs-modal-header">
          <div class="vs-modal-icon vs-modal-icon-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h2 class="vs-modal-title">Unsaved Changes</h2>
          <p class="vs-modal-desc">You have unsaved changes in the Code Editor. If you leave now, these changes will be permanently lost.</p>
        </div>
        <div class="vs-modal-body" style="padding-top: 12px; padding-bottom: 24px;"></div>
        <div class="vs-modal-footer">
          <button id="unsaved-cancel-btn" class="vs-btn vs-btn-secondary vs-btn-sm">Stay to Save</button>
          <button id="unsaved-discard-btn" class="vs-btn vs-btn-primary vs-btn-sm" style="background: var(--vs-error); border-color: var(--vs-error);">Discard Changes</button>
        </div>
      </div>
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function Lp(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" id="reset-modal">
      <div class="vs-modal-header">
        <div class="vs-modal-icon vs-modal-icon-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </div>
        <h2 class="vs-modal-title">Reset Website</h2>
        <p class="vs-modal-desc">This will permanently remove your generated website and all associated data. This action cannot be undone.</p>
      </div>

      <div class="vs-modal-body">
        <ul class="vs-modal-checklist">
          <li class="will-delete"><span class="check-icon">\u2715</span> All generated pages and partials</li>
          <li class="will-delete"><span class="check-icon">\u2715</span> CSS styles, Tailwind output, and JavaScript</li>
          <li class="will-delete"><span class="check-icon">\u2715</span> Conversation history and AI logs</li>
          <li class="will-delete"><span class="check-icon">\u2715</span> All revisions (undo history)</li>
          <li class="will-keep"><span class="check-icon">\u2713</span> Settings, API keys, and account</li>
          <li class="will-keep"><span class="check-icon">\u2713</span> Uploaded images and files</li>
        </ul>

        <label class="vs-modal-confirm-label">
          Type <code>RESET</code> to confirm
        </label>
        <input
          type="text"
          id="reset-confirm-input"
          class="vs-modal-confirm-input"
          placeholder="Type RESET here"
          autocomplete="off"
          spellcheck="false"
        />
      </div>

      <div class="vs-modal-footer">
        <button id="reset-cancel-btn" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="reset-confirm-btn" class="vs-btn vs-btn-confirm-danger vs-btn-sm" style="position: relative; overflow: hidden;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Reset Everything
        </button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let r=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()==="RESET"?ol(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?ol(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>we(t)),t.addEventListener("click",r=>{r.target===t&&we(t)});let a=r=>{r.key==="Escape"&&(we(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function ol(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:r}=await E.post("/site/reset",{confirm:"RESET"});if(i){P.set("pages",[]),P.set("hasFormSchemas",!1),P.set("conversations",null),P.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{we(e),window.location.hash!=="#/chat"?dt.navigate("chat"):dt.refresh()},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let l=e.querySelector(".vs-modal-desc");if(l){let d=l.textContent;l.textContent=(r==null?void 0:r.message)||"Reset failed. Please try again.",l.style.color="var(--vs-error)",setTimeout(()=>{l.textContent=d,l.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function Sp(e){var s;let t=document.getElementById("set-ai-model");if(t)try{let{ok:n,data:o}=await E.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?t.innerHTML=o.models.map(i=>`<option value="${b(i.id)}" ${i.id===e?"selected":""}>${b(i.name||i.id)}</option>`).join(""):t.innerHTML='<option value="">Test your connection to load available models</option>'}catch{t.innerHTML='<option value="">Test your connection to load available models</option>'}}function ht(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function pa(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function Tp(e,t){let s=e.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async p=>{var c;if((c=window.demoGuard)!=null&&c.call(window)){p.target.value=s;return}s=p.target.value,await E.put("/settings",{ai_provider:s}),gs()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var y,f,h,$,w;if((y=window.demoGuard)!=null&&y.call(window))return;let p=((f=i==null?void 0:i.value)==null?void 0:f.trim())||"",c=(($=(h=document.getElementById("set-base-url"))==null?void 0:h.value)==null?void 0:$.trim())||"";if(s!=="openai_compatible"&&(!p||p.startsWith("\u2022\u2022"))){va("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:v,data:m,error:g}=await E.post("/settings/test-api",{provider:s,api_key:p.startsWith("\u2022\u2022")?"":p,base_url:c});if(o.textContent="Test Connection",o.disabled=!1,v){if(va("\u2713 Connected successfully!","success"),(w=m==null?void 0:m.models)!=null&&w.length){let k=document.getElementById("set-ai-model");if(k){let T=e[`ai_${s}_model`]||"";k.innerHTML=m.models.map(_=>`<option value="${b(_.id)}" ${_.id===T?"selected":""}>${b(_.name||_.id)}</option>`).join("")}}}else va("\u2717 "+((g==null?void 0:g.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),r=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var m,g,y,f,h;if((m=window.demoGuard)!=null&&m.call(window))return;a.textContent="Saving...",a.disabled=!0;let p={site_name:((y=(g=document.getElementById("set-site-name"))==null?void 0:g.value)==null?void 0:y.trim())||"",site_tagline:((h=(f=document.getElementById("set-site-tagline"))==null?void 0:f.value)==null?void 0:h.trim())||""},{ok:c,error:v}=await E.put("/settings",p);if(a.textContent="Save Identity",a.disabled=!1,r){if(r.classList.remove("hidden"),c){r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3",P.set("siteName",p.site_name),document.title=p.site_name?`Studio \u2014 ${p.site_name}`:"Studio \u2014 VoxelSite";let $=document.querySelector(".vs-logo-text");$&&($.textContent=p.site_name||"VoxelSite")}else r.textContent="\u2717 "+((v==null?void 0:v.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3";setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3)}});let l=document.getElementById("btn-save-settings"),d=document.getElementById("save-status");l&&l.addEventListener("click",async()=>{var y,f,h,$,w;if((y=window.demoGuard)!=null&&y.call(window))return;l.textContent="Saving...",l.disabled=!0;let p={ai_provider:s,[`ai_${s}_model`]:((f=document.getElementById("set-ai-model"))==null?void 0:f.value)||"",ai_max_tokens:parseInt(((h=document.getElementById("set-max-tokens"))==null?void 0:h.value)||"32000",10),evaluator_enabled:($=document.getElementById("set-evaluator-enabled"))!=null&&$.checked?1:0},c=document.getElementById("set-base-url");c&&(p.ai_openai_compatible_base_url=c.value.trim());let v=(w=i==null?void 0:i.value)==null?void 0:w.trim();v&&!v.startsWith("\u2022\u2022")&&(p[`ai_${s}_api_key`]=v);let{ok:m,error:g}=await E.put("/settings",p);l.textContent="Save Settings",l.disabled=!1,d&&(d.classList.remove("hidden"),m?(d.textContent="\u2713 Saved",d.className="text-xs text-vs-success ml-3"):(d.textContent="\u2717 "+((g==null?void 0:g.message)||"Failed to save."),d.className="text-xs text-vs-error ml-3"),setTimeout(()=>d==null?void 0:d.classList.add("hidden"),3e3))});let u=document.getElementById("set-evaluator-enabled");if(u){let p=u.closest("label")||u.parentElement,c=p==null?void 0:p.querySelector(".vs-toggle-track"),v=p==null?void 0:p.querySelector(".vs-toggle-thumb");u.addEventListener("change",()=>{c&&(c.style.background=u.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),v&&(v.style.left=u.checked?"18px":"2px")})}}function Mp(e,t){var v;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function r(){if(!e.smtp_host)return"gmail";for(let[m,g]of Object.entries(t))if(g.host&&g.host===e.smtp_host)return m;return"custom"}if(i){let m=r();i.value=m,a&&((v=t[m])!=null&&v.help)&&(a.textContent=t[m].help)}s&&s.addEventListener("change",()=>{let m=s.value;n&&(n.style.display=m==="smtp"?"block":"none"),o&&(o.style.display=m==="mailpit"?"block":"none");let g=document.getElementById("mail-common-fields");g&&(g.style.display=m==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let m=t[i.value];if(!m)return;let g=document.getElementById("set-smtp-host"),y=document.getElementById("set-smtp-port"),f=document.getElementById("set-smtp-encryption");g&&(g.value=m.host||""),y&&(y.value=m.port||587),f&&(f.value=m.encryption||"tls"),a&&(a.textContent=m.help||"")});let l=document.getElementById("btn-toggle-smtp-pass"),d=document.getElementById("set-smtp-password");l&&d&&l.addEventListener("click",()=>{let m=d.type==="password";d.type=m?"text":"password",l.innerHTML=m?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let u=document.getElementById("btn-mail-test");u&&u.addEventListener("click",async()=>{var $,w,k;if(($=window.demoGuard)!=null&&$.call(window))return;let m=(k=(w=document.getElementById("set-mail-test-recipient"))==null?void 0:w.value)==null?void 0:k.trim();if(!m){ua("Enter an email address to send the test to.","warning");return}u.textContent="Sending...",u.disabled=!0;let g=il();g.test_recipient=m;let{ok:y,data:f,error:h}=await E.post("/settings/mail/test",g);u.textContent="Send Test",u.disabled=!1,y?ua("\u2713 "+((f==null?void 0:f.message)||"Test email sent successfully!"),"success"):ua("\u2717 "+((h==null?void 0:h.message)||"Test failed."),"error")});let p=document.getElementById("btn-save-mail"),c=document.getElementById("save-mail-status");p&&p.addEventListener("click",async()=>{var f;if((f=window.demoGuard)!=null&&f.call(window))return;p.textContent="Saving...",p.disabled=!0;let m=il(),{ok:g,error:y}=await E.post("/settings/mail",m);p.textContent="Save Email Settings",p.disabled=!1,c&&(c.classList.remove("hidden"),g?(c.textContent="\u2713 Saved",c.className="text-xs text-vs-success ml-3"):(c.textContent="\u2717 "+((y==null?void 0:y.message)||"Failed to save."),c.className="text-xs text-vs-error ml-3"),setTimeout(()=>c==null?void 0:c.classList.add("hidden"),3e3))})}function il(){var t,s,n,o,i,a,r,l,d,u,p,c,v,m,g;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((l=(r=document.getElementById("set-smtp-host"))==null?void 0:r.value)==null?void 0:l.trim())||"",smtp_port:parseInt(((d=document.getElementById("set-smtp-port"))==null?void 0:d.value)||"587",10),smtp_username:((p=(u=document.getElementById("set-smtp-username"))==null?void 0:u.value)==null?void 0:p.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((c=document.getElementById("set-smtp-encryption"))==null?void 0:c.value)||"tls",mailpit_host:((m=(v=document.getElementById("set-mailpit-host"))==null?void 0:v.value)==null?void 0:m.trim())||"localhost",mailpit_port:parseInt(((g=document.getElementById("set-mailpit-port"))==null?void 0:g.value)||"1025",10)}}function ua(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function va(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function Ip(e){let t=document.getElementById("set-api-enabled"),s=document.getElementById("api-access-body"),n=document.getElementById("btn-save-api-settings"),o=document.getElementById("btn-generate-api-key");t&&t.addEventListener("change",()=>{let i=t.checked,a=t.parentElement.querySelector(".vs-toggle-track"),r=t.parentElement.querySelector(".vs-toggle-thumb");a&&(a.style.background=i?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),r&&(r.style.left=i?"18px":"2px"),s&&(s.style.opacity=i?"":"0.4",s.style.pointerEvents=i?"":"none")}),n&&n.addEventListener("click",async()=>{var l,d,u,p,c;if((l=window.demoGuard)!=null&&l.call(window))return;let i=document.getElementById("save-api-status");n.disabled=!0,n.textContent="Saving...";let a={agent_api_enabled:((d=document.getElementById("set-api-enabled"))==null?void 0:d.checked)||!1,agent_api_allowed_origins:((p=(u=document.getElementById("set-api-origins"))==null?void 0:u.value)==null?void 0:p.trim())||"*"},r=await E.put("/settings",a);n.disabled=!1,n.textContent="Save API Settings",r.ok?(I("API settings saved","success"),i&&(i.textContent="Saved",i.className="text-xs text-vs-success",i.classList.remove("hidden"),setTimeout(()=>i.classList.add("hidden"),2e3))):I(((c=r.error)==null?void 0:c.message)||"Failed to save","error")}),ma(),o&&o.addEventListener("click",()=>{var i;(i=window.demoGuard)!=null&&i.call(window)||_p()})}var al={owner:["pages:read","pages:write","settings:read","settings:write","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],editor:["pages:read","pages:write","compile:trigger","submissions:read","assets:read","assets:write","tools:invoke"],agent:["pages:read","pages:write","settings:read","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],viewer:["pages:read","settings:read","submissions:read","assets:read"]},Bp={"prompt:execute":["owner","editor","agent"]};async function ma(){var t;let e=document.getElementById("api-keys-list");if(e)try{let n=((t=(await E.get("/settings/api-keys")).data)==null?void 0:t.keys)||[];if(n.length===0){e.innerHTML=`
        <div style="text-align: center; padding: 24px 16px; color: var(--vs-text-ghost);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 8px; opacity: 0.35;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <rect x="10" y="10" width="4" height="5" rx="1"/>
            <circle cx="12" cy="9" r="1.5"/>
          </svg>
          <p style="font-size: 13px; margin: 0 0 4px; font-weight: 500;">No API keys yet</p>
          <p style="font-size: 11px; margin: 0;">Generate a key to let external applications manage your site.</p>
        </div>`;return}e.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${n.map(o=>{let i=o.last_used_at?new Date(o.last_used_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",a=new Date(o.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),l={agent:"var(--vs-accent)",editor:"#3b82f6",viewer:"var(--vs-text-ghost)",owner:"#8b5cf6"}[o.role]||"var(--vs-text-ghost)",u=(Array.isArray(o.scopes)?o.scopes:typeof o.scopes=="string"?JSON.parse(o.scopes||"[]"):[]).includes("prompt:execute");return`
            <div class="vs-api-key-row" style="display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-lg); background: var(--vs-bg-base); transition: border-color 0.15s ease, box-shadow 0.2s ease;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: color-mix(in srgb, ${l} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${l} 18%, transparent);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${l}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.01em;">${b(o.label||"Unnamed")}</span>
                  <span style="font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: var(--radius-full); color: ${l}; background: color-mix(in srgb, ${l} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${l} 20%, transparent); text-transform: capitalize;">${b(o.role||"agent")}</span>
                  ${u?'<span style="font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-full); color: var(--vs-accent); background: color-mix(in srgb, var(--vs-accent) 8%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, var(--vs-accent) 20%, transparent); letter-spacing: 0.5px;">AI</span>':""}
                </div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <code style="font-size: 10px; font-family: var(--font-mono); background: var(--vs-bg-inset); padding: 1px 5px; border-radius: var(--radius-xs); border: 1px solid var(--vs-border-subtle);">${b(o.key_prefix||"???")}\u2026</code>
                  <span>Created ${a}</span>
                  <span>\xB7 Last used: ${i}</span>
                </div>
              </div>
              <button class="vs-btn vs-btn-ghost vs-btn-xs btn-revoke-key" data-id="${o.id}" style="color: var(--vs-text-ghost); white-space: nowrap; flex-shrink: 0;" title="Revoke">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Revoke
              </button>
            </div>`}).join("")}
      </div>`,e.querySelectorAll(".btn-revoke-key").forEach(o=>{o.addEventListener("click",async()=>{var r;if((r=window.demoGuard)!=null&&r.call(window))return;let i=o.dataset.id;if(o.dataset.confirm!=="true"){o.dataset.confirm="true",o.innerHTML='<span style="font-size: 11px; color: var(--vs-error);">Sure?</span>',setTimeout(()=>{o.dataset.confirm==="true"&&(o.dataset.confirm="",o.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Revoke')},3e3);return}let a=o.closest(".vs-api-key-row");a&&(a.style.opacity="0.4"),await E.delete(`/settings/api-keys/${i}`),I("API key revoked","success"),ma()})})}catch{e.innerHTML='<div style="font-size: 12px; color: var(--vs-text-ghost); text-align: center; padding: 16px 0;">Could not load API keys.</div>'}}function _p(){let e=document.getElementById("generate-key-modal");e&&e.remove();let t=document.createElement("div");t.className="vs-modal-overlay",t.id="generate-key-modal",t.innerHTML=`
    <div class="vs-modal" style="max-width: 440px;">
      <div class="vs-modal-header">
        <h3 class="vs-modal-title">Generate API Key</h3>
        <p class="vs-modal-desc">Create a key to let external tools and AI agents manage your site programmatically.</p>
      </div>
      <div class="vs-modal-body">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label for="gen-key-label" style="display: block; font-size: 13px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;">Label</label>
            <input id="gen-key-label" type="text" class="vs-input" placeholder="e.g. My Website Automation" autofocus />
          </div>
          <div>
            <label for="gen-key-role" style="display: block; font-size: 13px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;">Role</label>
            <select id="gen-key-role" class="vs-input">
              <option value="agent" selected>Agent \u2014 full access (pages, assets, publish, tools)</option>
              <option value="editor">Editor \u2014 pages, assets, & tools (no publish or settings)</option>
              <option value="viewer">Viewer \u2014 read-only access</option>
            </select>
          </div>
          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 14px; margin-top: 2px;">
            <div style="font-size: 11px; font-weight: 600; color: var(--vs-text-ghost); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">Optional capabilities</div>
            <label id="gen-key-prompt-toggle" class="vs-checkbox-label" style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-base); transition: border-color 0.15s ease, background 0.15s ease; position: relative;">
              <input type="checkbox" id="gen-key-prompt-execute" class="vs-checkbox" />
              <span class="vs-checkbox-box" style="margin-top: 1px;"></span>
              <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0;">
                <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-primary);">AI Prompt Execution</span>
                <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.4;">Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="cancel-generate-key">Cancel</button>
        <button class="vs-btn vs-btn-primary vs-btn-sm" id="confirm-generate-key">Generate</button>
      </div>
    </div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>we(t),n=c=>{c.key==="Escape"&&(c.preventDefault(),s())};document.addEventListener("keydown",n);let o=new MutationObserver(()=>{document.body.contains(t)||(document.removeEventListener("keydown",n),o.disconnect())});o.observe(document.body,{childList:!0}),ke(t,s),t.querySelector("#cancel-generate-key").addEventListener("click",s);let i=t.querySelector("#gen-key-label");i==null||i.addEventListener("keydown",c=>{var v;c.key==="Enter"&&(c.preventDefault(),(v=t.querySelector("#confirm-generate-key"))==null||v.click())});let a=t.querySelector("#gen-key-prompt-execute"),r=t.querySelector("#gen-key-prompt-toggle"),l=a,d=r==null?void 0:r.querySelector('span[style*="font-size: 11px"]'),u=c=>{(Bp["prompt:execute"]||[]).includes(c)?(l.disabled=!1,r.style.opacity="1",r.style.cursor="pointer",d&&(d.textContent="Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.")):(l.checked=!1,l.disabled=!0,r.style.opacity="0.45",r.style.cursor="not-allowed",r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)",d&&(d.textContent="Not available for read-only roles. Prompt execution requires write access."))},p=t.querySelector("#gen-key-role");p==null||p.addEventListener("change",()=>u(p.value)),u((p==null?void 0:p.value)||"agent"),a==null||a.addEventListener("change",()=>{a.checked?(r.style.borderColor="color-mix(in srgb, var(--vs-accent) 40%, transparent)",r.style.background="color-mix(in srgb, var(--vs-accent) 4%, var(--vs-bg-base))"):(r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)")}),t.querySelector("#confirm-generate-key").addEventListener("click",async()=>{var h,$,w,k,T,_;let c=($=(h=document.getElementById("gen-key-label"))==null?void 0:h.value)==null?void 0:$.trim(),v=((w=document.getElementById("gen-key-role"))==null?void 0:w.value)||"agent",m=(k=document.getElementById("gen-key-prompt-execute"))==null?void 0:k.checked;if(!c){I("Please enter a label for the key","error");return}let g=t.querySelector("#confirm-generate-key");g.disabled=!0,g.textContent="Generating\u2026";let y={label:c,role:v};m&&(y.scopes=[...al[v]||al.agent,"prompt:execute"]);let f=await E.post("/settings/api-keys",y);f.ok&&((T=f.data)!=null&&T.key)?(s(),Ap(f.data.key,c),ma()):(g.disabled=!1,g.textContent="Generate",I(((_=f.error)==null?void 0:_.message)||"Failed to generate key","error"))})}function Ap(e,t){let s=document.getElementById("key-reveal-modal");s&&s.remove();let n=document.createElement("div");n.className="vs-modal-overlay",n.id="key-reveal-modal",n.innerHTML=`
    <div class="vs-modal" style="max-width: 640px;">
      <div class="vs-modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, #22c55e 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, #22c55e 20%, transparent); flex-shrink: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <h3 class="vs-modal-title" style="margin: 0;">Key Generated</h3>
            <p class="vs-modal-desc" style="margin: 2px 0 0;">${b(t)}</p>
          </div>
        </div>
      </div>
      <div class="vs-modal-body">
        <div style="position: relative; margin-bottom: 16px;">
          <input type="text" readonly value="${b(e)}" id="revealed-key-input" class="vs-input" style="width: 100%; font-family: var(--font-mono); font-size: 12.5px; padding-right: 44px; letter-spacing: 0.01em; color: var(--vs-text-primary);" />
          <button id="copy-api-key" type="button" title="Copy" style="position: absolute; right: 1px; top: 1px; bottom: 1px; width: 40px; display: flex; align-items: center; justify-content: center; background: var(--vs-bg-surface); border: none; border-left: 1px solid var(--vs-border-subtle); border-radius: 0 var(--radius-md) var(--radius-md) 0; cursor: pointer; color: var(--vs-text-ghost); transition: color 0.15s ease;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
        <div style="display: flex; gap: 10px; padding: 12px 14px; background: color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, var(--vs-accent) 15%, transparent); border-radius: var(--radius-md);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--vs-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <p style="font-size: 12px; color: var(--vs-text-secondary); margin: 0; font-weight: 500;">Store this key securely</p>
            <p style="font-size: 11px; color: var(--vs-text-ghost); margin: 3px 0 0; line-height: 1.45;">This key won\u2019t be shown again. If you lose it, revoke it and generate a new one.</p>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button class="vs-btn vs-btn-primary vs-btn-sm" id="close-key-reveal">Done</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("is-visible"));let o=()=>we(n),i=l=>{l.key==="Escape"&&(l.preventDefault(),o())};document.addEventListener("keydown",i);let a=new MutationObserver(()=>{document.body.contains(n)||(document.removeEventListener("keydown",i),a.disconnect())});a.observe(document.body,{childList:!0}),ke(n,o),n.querySelector("#close-key-reveal").addEventListener("click",o);let r=n.querySelector("#revealed-key-input");r==null||r.addEventListener("focus",()=>r.select()),n.querySelector("#copy-api-key").addEventListener("click",async()=>{let l=n.querySelector("#copy-api-key");try{await navigator.clipboard.writeText(e),l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',l.style.color="#22c55e",setTimeout(()=>{l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',l.style.color=""},2e3)}catch{r==null||r.select()}})}var fs=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Ws=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},ga={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},Pp={contact:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',newsletter:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',callback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',feedback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'};function cl(){return setTimeout(()=>Rp(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="vs-page-title">Agent Actions</h1>
            <p class="vs-page-subtitle">Define what AI agents and visitors can do on your website.</p>
          </div>
          <button id="btn-new-action" class="vs-btn vs-btn-primary vs-btn-sm">New Action</button>
        </div>
      </div>
      <div id="bar-settings-card"></div>
      <div id="actions-list-container">
        <div class="flex flex-col gap-4">
          ${[1,2,3].map(()=>`
            <div class="vs-form-card" style="pointer-events: none;">
              <div class="vs-form-card-icon" style="background: var(--vs-bg-raised); color: transparent;">
                <svg width="22" height="22" viewBox="0 0 24 24"></svg>
              </div>
              <div class="vs-form-card-body">
                <div style="height: 14px; width: 140px; background: var(--vs-bg-raised); border-radius: 4px; margin-bottom: 6px; animation: vs-skeleton-pulse 1.5s ease-in-out infinite;"></div>
                <div style="height: 11px; width: 220px; background: var(--vs-bg-raised); border-radius: 4px; animation: vs-skeleton-pulse 1.5s ease-in-out 0.1s infinite;"></div>
              </div>
              <div class="vs-form-card-right" style="opacity: 0.3;">
                <svg width="16" height="16" viewBox="0 0 24 24"></svg>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `}async function Rp(){var a,r,l,d,u,p;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let c=await dl();c!=null&&c.ok&&c.actionId&&(window.location.hash=`#/actions/${c.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let w=function(k){let T=document.getElementById("bar-color-swatch"),_=document.getElementById("bar-brand-hex"),D=document.getElementById("bar-brand-color");T&&(T.style.background=k),_&&_!==document.activeElement&&(_.value=k),D&&(D.value=k),document.querySelectorAll(".bar-color-preset").forEach(q=>{q.style.borderColor=q.dataset.color.toLowerCase()===k.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:c,data:v}=await E.get("/agentic/actions/bar-settings"),m=c&&(v==null?void 0:v.settings)||{theme:"bottom-bar",visibility:"all-pages"},g=m.theme||"bottom-bar",y=m.visibility||"all-pages",f={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="0" y="56" width="120" height="16" rx="0" fill="currentColor" opacity="0.1"/>
        <circle cx="30" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
        <circle cx="52" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
        <circle cx="74" cy="64" r="3.5" fill="currentColor" opacity="0.35"/>
      </svg>`,"floating-fab":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <circle cx="100" cy="56" r="10" fill="currentColor" opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.3"/>
        <line x1="96" y1="56" x2="104" y2="56" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
        <line x1="100" y1="52" x2="100" y2="60" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
      </svg>`,"minimal-pill":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
        <rect x="1" y="1" width="118" height="70" rx="6" stroke="currentColor" stroke-width="1" opacity="0.2"/>
        <rect x="8" y="8" width="40" height="4" rx="2" fill="currentColor" opacity="0.12"/>
        <rect x="8" y="16" width="70" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="8" y="22" width="55" height="3" rx="1.5" fill="currentColor" opacity="0.08"/>
        <rect x="32" y="56" width="56" height="12" rx="6" fill="currentColor" opacity="0.12" stroke="currentColor" stroke-width="1" stroke-opacity="0.25"/>
        <circle cx="48" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
        <circle cx="60" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
        <circle cx="72" cy="62" r="2.5" fill="currentColor" opacity="0.3"/>
      </svg>`},h={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},$={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries($).map(([k,T])=>`<option value="${k}" ${y===k?"selected":""}>${T}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(f).map(([k,T])=>{let _=k===g;return`
              <button type="button" class="bar-theme-option" data-theme="${k}" style="
                border: 2px solid ${_?"var(--vs-accent)":"var(--vs-border-subtle)"};
                background: ${_?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)"};
                border-radius: var(--radius-lg, 10px);
                padding: 14px 12px 10px;
                cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 8px;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.12s;
                color: ${_?"var(--vs-accent)":"var(--vs-text-ghost)"};
                position: relative;
                outline: none;
              "
                onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-medium)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}"
                onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-subtle)';this.style.transform='';this.style.boxShadow='';}"
              >
                <div style="width: 100%; max-width: 120px;">${T}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${_?"var(--vs-accent)":"var(--vs-text-secondary)"};">${h[k]}</span>
                ${_?`<div style="
                  position: absolute; top: 8px; right: 8px; width: 16px; height: 16px;
                  background: var(--vs-accent); border-radius: 50%; display: flex;
                  align-items: center; justify-content: center;
                "><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`:""}
              </button>
            `}).join("")}
        </div>
        <div style="display: flex; gap: 20px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--vs-border-subtle); flex-wrap: wrap; align-items: flex-start;">
          <div style="min-width: 140px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Color Scheme</label>
            <div id="bar-scheme-picker" style="display: inline-flex; border: 1px solid var(--vs-border-subtle); border-radius: 8px; overflow: hidden;">
              ${["light","dark"].map(k=>{let T=k===(m.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${k}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${T?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${T?"#fff":"var(--vs-text-secondary)"};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${{light:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',dark:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}[k]} ${k.charAt(0).toUpperCase()+k.slice(1)}</button>`}).join("")}
            </div>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Brand Color</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label style="position: relative; cursor: pointer; flex-shrink: 0;">
                <input type="color" id="bar-brand-color" value="${m.brand_color||"#EA580C"}" style="
                  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
                ">
                <div id="bar-color-swatch" style="
                  width: 32px; height: 32px; border-radius: 8px;
                  background: ${m.brand_color||"#EA580C"};
                  border: 2px solid var(--vs-border-subtle);
                  transition: border-color 0.15s, box-shadow 0.15s;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                "></div>
              </label>
              <input type="text" id="bar-brand-hex" class="vs-input" value="${m.brand_color||"#EA580C"}" placeholder="#EA580C" style="
                font-size: 12px; height: 32px; padding: 4px 8px; width: 88px; font-family: var(--font-mono, monospace); letter-spacing: 0.02em;
              ">
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${["#EA580C","#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#374151"].map(k=>`
                  <button type="button" class="bar-color-preset" data-color="${k}" title="${k}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${k}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
                    flex-shrink: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
                  "
                    onmouseenter="this.style.transform='scale(1.15)';"
                    onmouseleave="this.style.transform='';"
                  ></button>
                `).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    `,document.querySelectorAll(".bar-theme-option").forEach(k=>{k.addEventListener("click",async()=>{let T=k.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(D=>{let q=D.dataset.theme===T;D.style.borderColor=q?"var(--vs-accent)":"var(--vs-border-subtle)",D.style.background=q?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",D.style.color=q?"var(--vs-accent)":"var(--vs-text-ghost)",D.classList.toggle("active",q);let Q=D.querySelector("span");Q&&(Q.style.color=q?"var(--vs-accent)":"var(--vs-text-secondary)");let X=D.querySelector('[style*="position: absolute"]');if(X&&!q&&X.remove(),q&&!D.querySelector('[style*="position: absolute"]')){let O=document.createElement("div");O.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",O.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',D.appendChild(O)}});let{ok:_}=await E.put("/agentic/actions/bar-settings",{theme:T});_&&(k.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>k.style.boxShadow="",400),I("Bar style updated","success"))})}),(r=document.getElementById("bar-visibility"))==null||r.addEventListener("change",async k=>{let{ok:T}=await E.put("/agentic/actions/bar-settings",{visibility:k.target.value});T&&I("Bar visibility updated","success")}),document.querySelectorAll(".bar-scheme-btn").forEach(k=>{k.addEventListener("click",async()=>{let T=k.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(D=>{let q=D.dataset.scheme===T;D.style.background=q?"var(--vs-accent)":"var(--vs-bg-surface)",D.style.color=q?"#fff":"var(--vs-text-secondary)"});let{ok:_}=await E.put("/agentic/actions/bar-settings",{color_scheme:T});_&&I("Color scheme updated","success")})}),(l=document.getElementById("bar-brand-color"))==null||l.addEventListener("input",k=>{w(k.target.value)}),(d=document.getElementById("bar-brand-color"))==null||d.addEventListener("change",async k=>{let{ok:T}=await E.put("/agentic/actions/bar-settings",{brand_color:k.target.value});T&&I("Brand color updated","success")}),(u=document.getElementById("bar-brand-hex"))==null||u.addEventListener("change",async k=>{let T=k.target.value.trim();if(T.startsWith("#")||(T="#"+T),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(T)){w(T);let{ok:_}=await E.put("/agentic/actions/bar-settings",{brand_color:T});_&&I("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach(k=>{k.addEventListener("click",async()=>{let T=k.dataset.color;w(T);let{ok:_}=await E.put("/agentic/actions/bar-settings",{brand_color:T});_&&I("Brand color updated","success")})}),w(m.brand_color||"#EA580C")}let{ok:s,data:n}=await E.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon" style="color: var(--vs-accent);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="vs-empty-state-title">No actions yet</p>
          <p class="vs-empty-state-desc">Create your first agent action to let AI assistants and website visitors interact with your business \u2014 reservations, appointments, quotes, and more.</p>
          <button id="btn-empty-new-action" class="vs-btn vs-btn-primary vs-btn-sm" style="margin-top: 12px;">${x.plus} New Action</button>
        </div>
      </div>
    `,(p=document.getElementById("btn-empty-new-action"))==null||p.addEventListener("click",async()=>{let c=await dl();c!=null&&c.ok&&c.actionId&&(window.location.hash=`#/actions/${c.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((c,v)=>{let m=c.active,g=c._stats||c.stats||{},y=g.total||0,f=g.last_created_at?_n(g.last_created_at):"\u2014",h={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},$=h[c.icon]||h.circle;return`
          <div class="vs-action-list-row vs-form-card" data-action-id="${b(c.id)}" style="cursor: pointer; transition: box-shadow 0.15s ease;">
            <div class="vs-action-reorder" style="
              display: flex; flex-direction: column; gap: 1px; flex-shrink: 0;
              padding-right: 10px; margin-right: 4px;
              border-right: 1px solid var(--vs-border-subtle);
            ">
              <button type="button" class="action-move-up" title="Move up" style="
                border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: 4px;
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              </button>
              <button type="button" class="action-move-down" title="Move down" style="
                border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: 4px;
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
            <div class="vs-form-card-icon" style="color: ${m?"var(--vs-success)":"var(--vs-text-ghost)"}; background: ${m?"color-mix(in srgb, var(--vs-success) 10%, transparent)":"var(--vs-bg-raised)"};">
              ${$}
            </div>
            <div class="vs-form-card-body">
              <div class="vs-form-card-name">${b(c.name||c.id)}</div>
              ${c.description?`<div class="vs-form-card-desc">${b(c.description)}</div>`:""}
              <div class="vs-form-card-meta">
                <span class="vs-status-pill" style="
                  background: ${m?"var(--vs-success-dim)":"var(--vs-bg-raised)"};
                  color: ${m?"var(--vs-success)":"var(--vs-text-ghost)"};
                  font-size: 11px; padding: 1px 8px;
                ">${m?"Active":"Draft"}</span>
                <span class="vs-form-card-dot">\xB7</span>
                <span>${y} submission${y!==1?"s":""}</span>
                ${g.today>0?`<span class="vs-form-card-dot">\xB7</span><span>+${g.today} today</span>`:""}
                <span class="vs-form-card-dot">\xB7</span>
                <span>${f}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `}).join("")}
    </div>
  `,document.querySelectorAll(".vs-action-list-row").forEach(c=>{c.addEventListener("click",v=>{if(v.target.closest(".vs-action-reorder"))return;let m=c.dataset.actionId;m&&(window.location.hash="#/actions/"+encodeURIComponent(m))})});async function i(){let c=document.querySelectorAll("#actions-list .vs-action-list-row"),v=Array.from(c).map(m=>m.dataset.actionId);await E.post("/agentic/actions/reorder",{order:v})}document.querySelectorAll(".action-move-up").forEach(c=>{c.addEventListener("click",async v=>{v.preventDefault(),v.stopPropagation();let m=c.closest(".vs-action-list-row"),g=m==null?void 0:m.previousElementSibling;g&&(m.parentNode.insertBefore(m,g),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(c=>{c.addEventListener("click",async v=>{v.preventDefault(),v.stopPropagation();let m=c.closest(".vs-action-list-row"),g=m==null?void 0:m.nextElementSibling;g&&(m.parentNode.insertBefore(g,m),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})})}async function dl(){return new Promise(async e=>{var r;let{ok:t,data:s}=await E.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 580px;">
        <div class="vs-modal-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
          <h2 class="vs-modal-title" style="margin: 0;">${x.zap} New Agent Action</h2>
          <button id="close-new-action-modal" style="background: none; border: none; cursor: pointer; color: var(--vs-text-ghost); padding: 4px; margin: -4px -4px 0 0; line-height: 0; border-radius: var(--radius-md); transition: color 0.15s ease;" onmouseenter="this.style.color='var(--vs-text-primary)'" onmouseleave="this.style.color='var(--vs-text-ghost)'">${x.x}</button>
        </div>
        <div class="vs-modal-body" style="padding: 20px;">
          <p class="text-sm text-vs-text-secondary" style="margin-bottom: 16px;">Choose a template to get started:</p>
          <div id="template-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          ">
            ${n.map(l=>`
              <button class="vs-template-card" data-template-id="${b(l.id)}" style="
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 12px; border-radius: 10px;
                border: 1.5px solid var(--vs-border);
                background: var(--vs-bg-floating);
                cursor: pointer; transition: all 0.15s ease;
                text-align: center; gap: 6px;
              ">
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${Pp[l.id]||x.zap}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary);">${b(l.name)}</span>
                <span style="font-size: 11px; color: var(--vs-text-tertiary); line-height: 1.3;">${b(l.description||"")}</span>
              </button>
            `).join("")}
            <button class="vs-template-card" data-template-id="blank" style="
              display: flex; flex-direction: column; align-items: center;
              padding: 16px 12px; border-radius: 10px;
              border: 1.5px dashed var(--vs-border);
              background: transparent;
              cursor: pointer; transition: all 0.15s ease;
              text-align: center; gap: 6px;
            ">
              <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: transparent; color: var(--vs-text-ghost);">${x.plus}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-secondary);">Blank</span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.3;">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(l=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(l)},a=l=>{l.key==="Escape"&&(l.preventDefault(),i())};document.addEventListener("keydown",a),ke(o,i),(r=document.getElementById("close-new-action-modal"))==null||r.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(l=>{l.addEventListener("mouseenter",()=>{l.style.borderColor="var(--vs-accent)",l.style.background="var(--vs-bg-raised)"}),l.addEventListener("mouseleave",()=>{l.style.borderColor=(l.dataset.templateId==="blank","var(--vs-border)"),l.style.background=l.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),l.addEventListener("click",async()=>{var u,p;let d=l.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(c=>{c.style.pointerEvents="none",c.style.opacity="0.5"}),l.style.opacity="1",l.style.borderColor="var(--vs-accent)",d==="blank"){let c={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"email",type:"email",label:"Email",placeholder:"you@example.com",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:v,data:m}=await E.post("/agentic/actions",c);v&&(m!=null&&m.action)?(I("Action created","success"),i({ok:!0,actionId:m.action.id})):(I(((u=m==null?void 0:m.error)==null?void 0:u.message)||"Failed to create action","error"),i())}else{let{ok:c,data:v}=await E.post("/agentic/actions/from-template",{template_id:d});c&&(v!=null&&v.action)?(I(`${v.action.name} created`,"success"),i({ok:!0,actionId:v.action.id})):(I(((p=v==null?void 0:v.error)==null?void 0:p.message)||"Failed to create action","error"),i())}})})})}function pl(e){return setTimeout(()=>Jo(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function Jo(e){var d,u,p,c,v,m,g,y,f,h,$,w,k,T,_,D,q,Q,X,O;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await E.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,r=i.stats||{},l=a.active;if(t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${b(a.name||e)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${b(a.name||e)}</h1>
        <div class="flex items-center gap-2">
          <button id="btn-toggle-active" class="vs-btn ${l?"vs-btn-secondary":"vs-btn-primary"} vs-btn-sm" title="${l?"Deactivate this action":"Activate this action on your website"}">
            ${l?"\u25CF Live \u2014 click to deactivate":"\u25CB Draft \u2014 click to go live"}
          </button>
          <button id="btn-duplicate-action" class="vs-btn vs-btn-ghost vs-btn-sm" title="Duplicate">
            ${x.copy} Duplicate
          </button>
          <button id="btn-delete-action" class="vs-btn vs-btn-ghost vs-btn-sm" style="color: var(--vs-error);" title="Delete">
            ${x.trash}
          </button>
        </div>
      </div>
    </div>

    <div class="vs-form-stats-row">
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${r.total||0}</span>
        <span class="vs-form-stat-label">Total</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-info)">${((d=r.by_status)==null?void 0:d.pending)||0}</span>
        <span class="vs-form-stat-label">Pending</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${((u=r.by_status)==null?void 0:u.confirmed)||0}</span>
        <span class="vs-form-stat-label">Confirmed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${((p=r.by_status)==null?void 0:p.completed)||0}</span>
        <span class="vs-form-stat-label">Completed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${r.today||0}</span>
        <span class="vs-form-stat-label">Today</span>
      </div>
    </div>
  `,s){let j=function(M){let U=M.querySelector(".field-required");if(!U)return;let ne=M.querySelectorAll("span")[0],C=M.querySelectorAll("span")[1],B=()=>{ne.style.background=U.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",C.style.left=U.checked?"18px":"2px"};U.addEventListener("change",B)},me=function(M){return M.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},ye=function(){let M=document.querySelectorAll("#action-fields-builder .vs-field-row"),U=[],ne=new Set;return M.forEach(C=>{var G,Y,z,W;let B=((Y=(G=C.querySelector(".field-label"))==null?void 0:G.value)==null?void 0:Y.trim())||"",S=((z=C.querySelector(".field-type"))==null?void 0:z.value)||"text",A=((W=C.querySelector(".field-required"))==null?void 0:W.checked)||!1,R=B?me(B):"";if(ne.has(R)){let Z=2;for(;ne.has(R+"_"+Z);)Z++;R=R+"_"+Z}if(ne.add(R),R&&B){let Z={name:R,type:S,label:B,required:A},ve=C.dataset.placeholder;ve&&(Z.placeholder=ve);let re=C.dataset.default;re&&(Z.default_value=re);let $e=C.dataset.description;$e&&(Z.description=$e);let be=C.dataset.min;be!==""&&be!==void 0&&(Z.min=Number(be));let Te=C.dataset.max;Te!==""&&Te!==void 0&&(Z.max=Number(Te));let he=C.dataset.maxlength;he&&(Z.max_length=Number(he));let Ie=C.dataset.minlength;Ie&&(Z.min_length=Number(Ie));let ie=C.dataset.options;if(ie)try{Z.options=JSON.parse(ie)}catch{Z.options=ie.split(",").map(_e=>_e.trim()).filter(Boolean)}if(S==="file"){let Me=C.dataset.allowedExtensions;if(Me)try{Z.allowed_extensions=JSON.parse(Me)}catch{Z.allowed_extensions=Me.split(",").map(le=>le.trim().toLowerCase()).filter(Boolean)}let _e=C.dataset.maxSizeMb;_e&&(Z.max_size_mb=Number(_e))}S==="checkbox"&&C.dataset.checkedDefault==="true"&&(Z.checked_default=!0),U.push(Z)}}),U},rt=function(M){var U,ne;(U=M.querySelector(".field-move-up"))==null||U.addEventListener("click",()=>{let C=M.previousElementSibling;C&&(M.parentNode.insertBefore(M,C),M.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>M.style.boxShadow="",300))}),(ne=M.querySelector(".field-move-down"))==null||ne.addEventListener("click",()=>{let C=M.nextElementSibling;C&&(M.parentNode.insertBefore(C,M),M.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>M.style.boxShadow="",300))})},Tt=function(M){M.addEventListener("click",async()=>{let U=M.closest(".vs-field-row");await Ce({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&(U.style.opacity="0",U.style.transform="translateX(20px)",U.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>U.remove(),200))})},Mt=function(M){M&&M.addEventListener("click",()=>{var B,S,A;let U=M.closest(".vs-field-row");if(!U)return;let ne=((B=U.querySelector(".field-type"))==null?void 0:B.value)||"text",C=((S=U.querySelector(".field-label"))==null?void 0:S.value)||((A=U.querySelector(".field-name"))==null?void 0:A.value)||"Field";As(U,ne,C)})},As=function(M,U,ne){var le,Ae,Ps,zt,it;(le=document.getElementById("vs-field-settings-modal"))==null||le.remove();let C=M.dataset.placeholder||"",B=M.dataset.default||"",S=M.dataset.min||"",A=M.dataset.max||"",R=M.dataset.maxlength||"",G=M.dataset.options||"[]",Y=M.dataset.description||"",z=["text","email","tel","url","textarea"].includes(U),W=U==="number",Z=["text","email","tel","url","textarea"].includes(U),ve=["select","radio","multiselect"].includes(U),re=U==="multiselect",$e=U==="file",be=U==="checkbox",Te="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",he="margin-bottom: 16px;",Ie="";if(z&&(Ie+=`<div style="${he}">
          <label style="${Te}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${ge(C)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),!$e&&!be&&(Ie+=`<div style="${he}">
          <label style="${Te}">Default Value</label>
          <input type="${W?"number":"text"}" id="fs-default" class="vs-input" value="${ge(B)}" placeholder="Pre-filled value" />
        </div>`),be&&(Ie+=`<div style="${he}">
          <label style="${Te}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked \u2014 defaults to field name if empty)</span></label>
          <input type="text" id="fs-default" class="vs-input" value="${ge(B)}" placeholder="e.g. yes, true, 1" />
        </div>
        <div style="${he}">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="fs-checked-default" ${M.dataset.checkedDefault==="true"?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${M.dataset.checkedDefault==="true"?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span style="
                position: absolute; left: ${M.dataset.checkedDefault==="true"?"18px":"2px"}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <span style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary);">Selected by default</span>
          </label>
        </div>`),W&&(Ie+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${he}">
          <div>
            <label style="${Te}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${ge(S)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${Te}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${ge(A)}" placeholder="No limit" />
          </div>
        </div>`),Z&&(Ie+=`<div style="${he}">
          <label style="${Te}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${ge(R)}" placeholder="No limit" min="1" />
        </div>`),ve){let Le;try{Le=JSON.parse(G)}catch{Le=G.split(",").map(Ue=>Ue.trim()).filter(Boolean)}let He;if(re){let Ne=(M.dataset.default||"").split(",").map(Ue=>Ue.trim()).filter(Boolean);He=Le.map(Ue=>Ne.includes(Ue)?"[x] "+Ue:Ue).join(`
`)}else He=Le.join(`
`);Ie+=`<div style="${he}">
          <label style="${Te}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${re?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${re?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${b(He)}</textarea>
        </div>`}if($e){let Le=M.dataset.allowedExtensions||"",He=M.dataset.maxSizeMb||"10",Ne;try{Ne=Le?JSON.parse(Le):[]}catch{Ne=[]}let Ue=Ne.join(", "),xt=["pdf","doc","docx","xls","xlsx","csv","txt"],Cn=["jpg","jpeg","png","gif","webp"],Ln=["zip","rar"],Bo=xt.some(ds=>Ne.includes(ds)),_o=Cn.some(ds=>Ne.includes(ds)),Ao=Ln.some(ds=>Ne.includes(ds));Ie+=`<div style="${he}">
          <label style="${Te}">Allowed File Types</label>
          <div style="display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(xt)}' ${Bo?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Documents
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Cn)}' ${_o?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Images
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Ln)}' ${Ao?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Archives
            </label>
          </div>
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${ge(Ue)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${he}">
          <label style="${Te}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${ge(He)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`}Ie+=`<div style="${he}">
        <label style="${Te}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${ge(Y)}" placeholder="Optional description or instructions" />
      </div>`;let ie=document.createElement("div");if(ie.id="vs-field-settings-modal",ie.style.cssText="position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;",ie.innerHTML=`
        <div style="
          position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
        " id="fs-backdrop"></div>
        <div style="
          position: relative; background: var(--vs-bg-floating, #fff); border-radius: var(--radius-lg, 12px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 440px; max-width: 90vw; max-height: 85vh;
          overflow: hidden; animation: vsSlideUp 200ms ease-out;
        ">
          <div style="
            padding: 20px 24px 16px; border-bottom: 1px solid var(--vs-border-subtle);
            display: flex; align-items: center; justify-content: space-between;
          ">
            <div>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--vs-text-primary);">
                ${b(ne)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${U}
              </span>
            </div>
            <button id="fs-close" style="
              border: none; background: none; cursor: pointer; padding: 6px; color: var(--vs-text-ghost);
              display: flex; border-radius: var(--radius-md); transition: all 0.12s;
            " onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
              onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style="padding: 20px 24px; overflow-y: auto; max-height: calc(85vh - 140px);">
            ${Ie}
          </div>
          <div style="
            padding: 16px 24px; border-top: 1px solid var(--vs-border-subtle);
            display: flex; justify-content: flex-end; gap: 8px;
          ">
            <button id="fs-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
            <button id="fs-save" class="vs-btn vs-btn-primary vs-btn-sm">Apply</button>
          </div>
        </div>
      `,document.body.appendChild(ie),setTimeout(()=>{var Le;return(Le=ie.querySelector("input, textarea"))==null?void 0:Le.focus()},100),$e&&ie.querySelectorAll(".fs-ext-group").forEach(Le=>{Le.addEventListener("change",()=>{let He=ie.querySelector("#fs-allowed-extensions");if(!He)return;let Ne=He.value.split(",").map(xt=>xt.trim().toLowerCase()).filter(Boolean),Ue=JSON.parse(Le.dataset.exts||"[]");Le.checked?Ue.forEach(xt=>{Ne.includes(xt)||Ne.push(xt)}):Ne=Ne.filter(xt=>!Ue.includes(xt)),He.value=Ne.join(", ")})}),be){let Le=(Ae=ie.querySelector("#fs-checked-default"))==null?void 0:Ae.closest("label");if(Le){let He=ie.querySelector("#fs-checked-default"),Ne=Le.querySelectorAll("span > span")[0],Ue=Le.querySelectorAll("span > span")[1];He==null||He.addEventListener("change",()=>{Ne&&(Ne.style.background=He.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),Ue&&(Ue.style.left=He.checked?"18px":"2px")})}}let Me=()=>ie.remove(),_e=ie.querySelector("#fs-backdrop");_e&&ke(_e,Me),(Ps=ie.querySelector("#fs-close"))==null||Ps.addEventListener("click",Me),(zt=ie.querySelector("#fs-cancel"))==null||zt.addEventListener("click",Me);let Xe=Le=>{Le.key==="Escape"&&(Me(),document.removeEventListener("keydown",Xe))};document.addEventListener("keydown",Xe),(it=ie.querySelector("#fs-save"))==null||it.addEventListener("click",()=>{var Le,He,Ne,Ue,xt,Cn,Ln,Bo,_o,Ao;if(z&&(M.dataset.placeholder=((Le=ie.querySelector("#fs-placeholder"))==null?void 0:Le.value)||""),$e||(M.dataset.default=((He=ie.querySelector("#fs-default"))==null?void 0:He.value)||""),be&&(M.dataset.checkedDefault=(Ne=ie.querySelector("#fs-checked-default"))!=null&&Ne.checked?"true":"false"),W&&(M.dataset.min=((Ue=ie.querySelector("#fs-min"))==null?void 0:Ue.value)||"",M.dataset.max=((xt=ie.querySelector("#fs-max"))==null?void 0:xt.value)||""),Z&&(M.dataset.maxlength=((Cn=ie.querySelector("#fs-maxlength"))==null?void 0:Cn.value)||""),ve){let Sn=(((Ln=ie.querySelector("#fs-options"))==null?void 0:Ln.value)||"").split(/[\n]/).map(Rs=>Rs.trim()).filter(Boolean);if(re){let Rs=[],Po=[];Sn.forEach(er=>{let Ni=er.match(/^\[x\]\s*(.+)$/i);Ni?(Rs.push(Ni[1].trim()),Po.push(Ni[1].trim())):Rs.push(er)}),M.dataset.options=JSON.stringify(Rs),M.dataset.default=Po.join(",")}else M.dataset.options=JSON.stringify(Sn)}if($e){let Sn=(((Bo=ie.querySelector("#fs-allowed-extensions"))==null?void 0:Bo.value)||"").split(",").map(Po=>Po.trim().toLowerCase()).filter(Boolean);M.dataset.allowedExtensions=Sn.length>0?JSON.stringify(Sn):"";let Rs=((_o=ie.querySelector("#fs-max-size-mb"))==null?void 0:_o.value)||"10";M.dataset.maxSizeMb=String(Math.min(Math.max(parseInt(Rs)||10,1),50))}M.dataset.description=((Ao=ie.querySelector("#fs-description"))==null?void 0:Ao.value)||"",M.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>M.style.boxShadow="",400),Me(),I("Field settings updated","success")})},de="make_"+e.replace(/-/g,"_"),J={number:"number",checkbox:"boolean",multiselect:"array"},H={},L=[];(a.fields||[]).forEach(M=>{let ne={type:J[M.type]||"string"},C=M.label||M.name;M.require_future?ne.description=C+" (must be in the future)":C&&(ne.description=C),M.min!==void 0&&M.min!==""&&(ne.minimum=M.min),M.max!==void 0&&M.max!==""&&(ne.maximum=M.max),M.min_length&&(ne.minLength=M.min_length),M.max_length&&(ne.maxLength=M.max_length),M.options&&M.options.length>0&&(M.type==="multiselect"?ne.items={type:"string",enum:M.options}:ne.enum=M.options),H[M.name]=ne,M.required&&L.push(M.name)});let N={name:de,description:a.description||a.name,inputSchema:{type:"object",properties:H,required:L}},F=JSON.stringify(N,null,2),V=b(F),te=l?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">\u25CF Discoverable by agents</span>':'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">\u25CB Draft \u2014 not visible to agents</span>',ee=['<div style="margin-bottom: 16px;">','<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">','<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',`<code style="font-size:13px;font-weight:600;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">`+b(de)+"</code>","</div>",'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">','<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'," /mcp.php","</span>",'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'," /actions/manifest.json","</span>",te,"</div>","</div>",'<div style="position: relative;">',`<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">`+V+"</code></pre>",`<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor='var(--vs-border)';this.style.color='var(--vs-text-secondary)';" onmouseleave="this.style.borderColor='var(--vs-border-subtle)';this.style.color='var(--vs-text-ghost)';">`+x.copy+"</button>","</div>",'<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',`This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site's MCP endpoint.<br>`,'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',"</p>"].join("");s.innerHTML=`
      <div class="vs-settings-card" style="margin-top: 16px;">
        <h2 class="vs-settings-card-title">Action</h2>
        <div class="flex flex-col gap-4">
          <div>
            <label for="action-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Name <span style="font-weight: 400; color: var(--vs-text-ghost);">\u2014 form title and email subject</span></label>
            <input type="text" id="action-name" class="vs-input" value="${b(a.name||"")}" />
          </div>
          <div>
            <label for="action-description" class="block text-sm font-medium text-vs-text-secondary mb-1">Description <span style="font-weight: 400; color: var(--vs-text-ghost);">\u2014 shown to visitors and AI agents</span></label>
            <input type="text" id="action-description" class="vs-input" value="${b(a.description||"")}" placeholder="e.g. Register for our quarterly workshops" />
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Actions Bar</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">How this action appears on your website.</p>
            <div style="margin-bottom: 12px;">
              <label for="action-button-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Button Label</label>
              <input type="text" id="action-button-label" class="vs-input" value="${b(a.bar_button_label||"")}" placeholder="${ge(a.name||"e.g. Register")}" />
              <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Short label for the bar button. Defaults to the action name.</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-vs-text-secondary mb-1">Icon</label>
              <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${[["calendar","Calendar"],["clock","Clock"],["utensils","Utensils"],["file-text","Document"],["list","List"],["shopping-bag","Shop"],["ticket","Ticket"],["message-square","Message"],["users","People"],["mail","Mail"],["star","Star"],["circle","Default"]].map(([M,U])=>`
                  <button type="button" class="vs-icon-pick" data-icon="${M}" title="${U}" style="
                    display: flex; align-items: center; justify-content: center;
                    width: 42px; height: 42px; border-radius: var(--radius-md);
                    border: 1.5px solid ${(a.icon||"circle")===M?"var(--vs-accent)":"var(--vs-border)"};
                    background: ${(a.icon||"circle")===M?"var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))":"var(--vs-bg-floating)"};
                    color: ${(a.icon||"circle")===M?"var(--vs-accent)":"var(--vs-text-ghost)"};
                    cursor: pointer; transition: all 0.15s ease;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',"shopping-bag":'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',circle:'<circle cx="12" cy="12" r="10"/>'}[M]}</svg></button>
                `).join("")}
              </div>
              <input type="hidden" id="action-icon" value="${b(a.icon||"circle")}" />
            </div>
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Submission Rules</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">Control how submissions are handled.</p>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                  <input type="checkbox" id="action-allow-duplicates" ${(v=(c=a.constraints)==null?void 0:c.uniqueness)!=null&&v.enabled?"":"checked"} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                  <span class="vs-toggle-track" style="
                    position: absolute; inset: 0; border-radius: 10px;
                    background: ${(g=(m=a.constraints)==null?void 0:m.uniqueness)!=null&&g.enabled?"var(--vs-border-medium, #ccc)":"var(--vs-accent)"};
                    transition: background 0.2s ease;
                  "></span>
                  <span class="vs-toggle-thumb" style="
                    position: absolute; left: ${(f=(y=a.constraints)==null?void 0:y.uniqueness)!=null&&f.enabled?"2px":"18px"}; top: 2px;
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: left 0.2s ease;
                  "></span>
                </span>
                <span style="font-size: 13px; color: var(--vs-text-secondary);">Same email can submit multiple times</span>
              </label>
            </div>
            <div id="action-duplicate-msg-wrap" style="${($=(h=a.constraints)==null?void 0:h.uniqueness)!=null&&$.enabled?"":"display: none;"}">
              <label for="action-duplicate-msg" class="block text-sm font-medium text-vs-text-secondary mb-1">Rejection message</label>
              <input type="text" id="action-duplicate-msg" class="vs-input" value="${b(((w=a.responses)==null?void 0:w.duplicate)||"")}"
                placeholder="You have already submitted this form." />
            </div>
          </div>
        </div>
        <div class="vs-settings-card-footer">
          <button id="btn-save-action" class="vs-btn vs-btn-primary vs-btn-sm">Save Changes</button>
        </div>
      </div>

      <div class="vs-settings-card" style="margin-top: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 class="vs-settings-card-title" style="margin-bottom: 0;">Fields (${(a.fields||[]).length})</h2>
          <button id="btn-add-field" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-bottom: 12px;">${x.plus||"+"} Add Field</button>
        </div>
        <div id="action-fields-builder" style="display: flex; flex-direction: column; gap: 6px;">
          ${(a.fields||[]).map((M,U)=>`
            <div class="vs-field-row" data-field-idx="${U}"
              data-field-name="${ge(M.name||"")}"
              data-placeholder="${ge(M.placeholder||"")}"
              data-default="${ge(M.default_value||M.default||"")}"
              data-min="${M.min!==void 0?M.min:""}"
              data-max="${M.max!==void 0?M.max:""}"
              data-maxlength="${M.max_length||""}"
              data-minlength="${M.min_length||""}"
              data-options="${ge(JSON.stringify(M.options||[]))}"
              data-description="${ge(M.description||"")}"
              ${M.allowed_extensions?`data-allowed-extensions="${ge(JSON.stringify(M.allowed_extensions))}"`:""}
              ${M.max_size_mb?`data-max-size-mb="${M.max_size_mb}"`:""}
              ${M.checked_default?'data-checked-default="true"':""}
              style="
              display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
              padding: 8px 10px; border-radius: var(--radius-md);
              border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
              transition: box-shadow 0.15s ease;
            ">
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <button type="button" class="field-move-up" title="Move up" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${U===0?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${U===(a.fields||[]).length-1?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${b(M.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(ne=>`<option value="${ne}" ${M.type===ne?"selected":""}>${ne==="multiselect"?"multi-select":ne}</option>`).join("")}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${M.required?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${M.required?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${M.required?"18px":"2px"}; top: 2px;
                  width: 16px; height: 16px; border-radius: 50%;
                  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  transition: left 0.2s ease;
                "></span>
              </label>
              <button type="button" class="field-settings" title="Field settings" style="
                border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md);
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button type="button" class="field-delete" title="Remove field" style="
                border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md);
                transition: color 0.12s, background 0.12s;
              "
                onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
                onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                ${x.trash}
              </button>
            </div>
          `).join("")}
        </div>
        ${(a.fields||[]).length===0?'<p class="text-sm text-vs-text-ghost" style="text-align: center; padding: 20px 0;">No fields yet. Click "Add Field" to get started.</p>':""}
        <div class="vs-settings-card-footer">
          <button id="btn-save-fields" class="vs-btn vs-btn-primary vs-btn-sm">Save Fields</button>
        </div>
      </div>

      <details id="agent-preview-section" style="margin-top: 16px;">
        <summary class="vs-settings-card" style="cursor: pointer; user-select: none; list-style: none; display: flex; align-items: center; justify-content: space-between; padding: 16px 20px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--vs-text-ghost); flex-shrink: 0;">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/>
            </svg>
            <div>
              <h2 class="vs-settings-card-title" style="margin: 0; font-size: 14px;">Agent Preview</h2>
              <p style="margin: 2px 0 0; font-size: 12px; color: var(--vs-text-ghost);">MCP tool schema \u2014 what AI agents see when they discover this action</p>
            </div>
          </div>
          <svg class="agent-preview-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--vs-text-ghost); transition: transform 0.2s ease; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <div class="vs-settings-card" style="margin-top: -1px; border-top-left-radius: 0; border-top-right-radius: 0;">
          ${ee}
        </div>
      </details>
    `,document.querySelectorAll(".field-required").forEach(M=>{j(M.closest("label"))});let oe=document.getElementById("action-allow-duplicates");if(oe){let M=oe.closest("label"),U=M==null?void 0:M.querySelector(".vs-toggle-track"),ne=M==null?void 0:M.querySelector(".vs-toggle-thumb");oe.addEventListener("change",()=>{U&&(U.style.background=oe.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),ne&&(ne.style.left=oe.checked?"18px":"2px");let C=document.getElementById("action-duplicate-msg-wrap");C&&(C.style.display=oe.checked?"none":"")})}document.querySelectorAll(".vs-icon-pick").forEach(M=>{M.addEventListener("mouseenter",()=>{var U;M.dataset.icon!==((U=document.getElementById("action-icon"))==null?void 0:U.value)&&(M.style.borderColor="var(--vs-accent)",M.style.color="var(--vs-text-secondary)")}),M.addEventListener("mouseleave",()=>{var U;M.dataset.icon!==((U=document.getElementById("action-icon"))==null?void 0:U.value)&&(M.style.borderColor="var(--vs-border)",M.style.color="var(--vs-text-ghost)")}),M.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach(U=>{U.style.borderColor="var(--vs-border)",U.style.background="var(--vs-bg-floating)",U.style.color="var(--vs-text-ghost)"}),M.style.borderColor="var(--vs-accent)",M.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",M.style.color="var(--vs-accent)",document.getElementById("action-icon").value=M.dataset.icon})}),(k=document.getElementById("btn-save-action"))==null||k.addEventListener("click",async()=>{var S,A,R,G,Y,z,W,Z,ve;if(fs()||Ws())return;let M={...a};if(M.name=((S=document.getElementById("action-name"))==null?void 0:S.value)||a.name,M.bar_button_label=((A=document.getElementById("action-button-label"))==null?void 0:A.value)||"",M.description=((R=document.getElementById("action-description"))==null?void 0:R.value)||"",M.icon=((G=document.getElementById("action-icon"))==null?void 0:G.value)||"circle",((Y=document.getElementById("action-allow-duplicates"))==null?void 0:Y.checked)??!0)(z=M.constraints)!=null&&z.uniqueness&&(M.constraints.uniqueness.enabled=!1);else{let re=(a.fields||[]).filter(be=>be.type==="email").map(be=>be.name),$e=re.length>0?re:["email"];M.constraints={...M.constraints||{},uniqueness:{enabled:!0,fields:$e,scope_statuses:["confirmed","pending"]}}}let ne=((W=document.getElementById("action-duplicate-msg"))==null?void 0:W.value)||"";ne?M.responses={...M.responses||{},duplicate:ne}:(Z=M.responses)!=null&&Z.duplicate&&delete M.responses.duplicate;let{ok:C,data:B}=await E.put(`/agentic/actions/${encodeURIComponent(e)}`,M);I(C?"Action saved":((ve=B==null?void 0:B.error)==null?void 0:ve.message)||"Failed to save",C?"success":"error"),C&&Jo(e)});async function tt(){var A;let M=document.querySelectorAll("#action-fields-builder .vs-field-row"),U=!1;if(M.forEach(R=>{var Y,z;((z=(Y=R.querySelector(".field-label"))==null?void 0:Y.value)==null?void 0:z.trim())||(U=!0,R.style.borderColor="var(--vs-error, #ef4444)",R.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{R.style.borderColor="var(--vs-border-subtle)",R.style.boxShadow=""},2e3))}),U){I("Every field needs a label","warning");return}let ne=ye();if(ne.length===0){I("At least one field is required","warning");return}let C={...a,fields:ne},{ok:B,data:S}=await E.put(`/agentic/actions/${encodeURIComponent(e)}`,C);I(B?"Fields saved":((A=S==null?void 0:S.error)==null?void 0:A.message)||"Failed to save",B?"success":"error"),B&&Jo(e)}(T=document.getElementById("btn-save-fields"))==null||T.addEventListener("click",tt),(_=document.getElementById("btn-add-field"))==null||_.addEventListener("click",()=>{var C,B;let M=document.getElementById("action-fields-builder");if(!M)return;let U=document.createElement("div");U.className="vs-field-row",U.dataset.fieldName="",U.dataset.placeholder="",U.dataset.default="",U.dataset.min="",U.dataset.max="",U.dataset.maxlength="",U.dataset.options="",U.dataset.description="",U.style.cssText=`
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;let ne='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';U.innerHTML=`
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <button type="button" class="field-move-up" title="Move up" style="border:none;background:none;cursor:pointer;padding:1px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:3px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <button type="button" class="field-move-down" title="Move down" style="border:none;background:none;cursor:pointer;padding:1px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:3px;" disabled style="opacity:0.25;cursor:default;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        <input type="text" class="vs-input field-label" value="" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
        <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
          ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(S=>`<option value="${S}">${S==="multiselect"?"multi-select":S}</option>`).join("")}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${ne}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${x.trash}
        </button>
      `,M.appendChild(U),(C=U.querySelector(".field-label"))==null||C.focus(),j((B=U.querySelector(".field-required"))==null?void 0:B.closest("label")),rt(U),Tt(U.querySelector(".field-delete")),Mt(U.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(rt),document.querySelectorAll(".field-delete").forEach(Tt),document.querySelectorAll(".field-settings").forEach(Mt),(D=document.getElementById("btn-copy-schema"))==null||D.addEventListener("click",()=>{var U;let M=((U=document.getElementById("agent-schema-json"))==null?void 0:U.textContent)||"";navigator.clipboard.writeText(M).then(()=>{I("Schema copied","success")}).catch(()=>{let ne=document.createElement("textarea");ne.value=M,ne.style.position="fixed",ne.style.opacity="0",document.body.appendChild(ne),ne.select(),document.execCommand("copy"),document.body.removeChild(ne),I("Schema copied","success")})}),(q=document.getElementById("agent-preview-section"))==null||q.addEventListener("toggle",M=>{let U=M.target.querySelector(".agent-preview-chevron");U&&(U.style.transform=M.target.open?"rotate(180deg)":"rotate(0)")}),(Q=document.getElementById("btn-toggle-active"))==null||Q.addEventListener("click",async()=>{if(fs()||Ws())return;let M={...a,active:!l},{ok:U}=await E.put(`/agentic/actions/${encodeURIComponent(e)}`,M);U?(I(M.active?"Action activated":"Action deactivated","success"),Jo(e)):I("Failed to update status","error")}),(X=document.getElementById("btn-duplicate-action"))==null||X.addEventListener("click",async()=>{var C;if(fs()||Ws()||!await Ce({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:U,data:ne}=await E.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});U&&(ne!=null&&ne.action)?(I(`"${ne.action.name}" created`,"success"),window.location.hash=`#/actions/${ne.action.id}`):I(((C=ne==null?void 0:ne.error)==null?void 0:C.message)||"Failed to duplicate","error")}),(O=document.getElementById("btn-delete-action"))==null||O.addEventListener("click",async()=>{if(fs()||Ws())return;if(await Ce({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:U}=await E.delete(`/agentic/actions/${encodeURIComponent(e)}`);U?(I("Action deleted","success"),window.location.hash="#/actions"):I("Failed to delete action","error")}})}await pn(e,1)}async function pn(e,t=1){var m,g,y,f,h,$,w,k;let s=document.getElementById("action-records");if(!s)return;let n=((m=document.getElementById("action-filter-status"))==null?void 0:m.value)||"all",o=((g=document.getElementById("action-filter-search"))==null?void 0:g.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:r}=await E.get(i);if(!a||!r){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let l=r.records||[],d=r.total||0,u=r.per_page||20,p=Math.ceil(d/u);s.innerHTML=`
    <div class="vs-settings-card" style="margin-top: 16px;">
      <h2 class="vs-settings-card-title">Submissions</h2>
      <div class="vs-form-filter-bar" style="margin-bottom: 12px;">
        <div class="flex items-center gap-2 flex-wrap">
          <select id="action-filter-status" class="vs-input vs-input-compact">
            <option value="all" ${n==="all"?"selected":""}>All statuses</option>
            <option value="pending" ${n==="pending"?"selected":""}>Pending</option>
            <option value="confirmed" ${n==="confirmed"?"selected":""}>Confirmed</option>
            <option value="completed" ${n==="completed"?"selected":""}>Completed</option>
            <option value="cancelled" ${n==="cancelled"?"selected":""}>Cancelled</option>
            <option value="no-show" ${n==="no-show"?"selected":""}>No-show</option>
          </select>
          <input type="text" id="action-filter-search" class="vs-input vs-input-compact" placeholder="Search submissions..." value="${b(o)}" style="min-width: 180px;" />
        </div>
        <div class="flex items-center gap-2">
          ${window.IS_DEMO?"":`<button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old submissions" ${d===0?'disabled style="opacity:0.4;pointer-events:none;"':""}>
            ${x.trash} Purge Old
          </button>`}

          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${d===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${d===0?"No submissions to export":"Download submissions as CSV"}">
            ${x.download} Export CSV
          </button>
        </div>
      </div>

      ${l.length===0?`
        <div style="text-align: center; padding: 32px 16px;">
          <div style="color: var(--vs-text-ghost); margin-bottom: 8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="text-sm" style="color: var(--vs-text-tertiary); font-weight: 500;">No records yet</div>
          <div style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 4px;">Test the action or wait for your first submission.</div>
        </div>
      `:`
        <div style="overflow-x: auto;">
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--vs-border);">
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500; width: 32px;"></th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Ref</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Summary</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Status</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Source</th>
                <th style="text-align: left; padding: 8px 12px; color: var(--vs-text-tertiary); font-weight: 500;">Created</th>
                <th style="width: 32px;"></th>
              </tr>
            </thead>
            <tbody>
              ${l.map(T=>{let _=typeof T.data=="string"?JSON.parse(T.data):T.data,D=Object.fromEntries(Object.entries(_||{}).filter(([H])=>!H.startsWith("_"))),q=Object.values(D).filter(H=>typeof H=="string"&&H.length>0).slice(0,2).join(" \xB7 "),Q=Object.values(D).filter(H=>H&&typeof H=="object"&&H.original_name).length,X=Q>0?`<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${q?"6px":"0"};" title="${Q} file${Q>1?"s":""} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${Q>1?'<span style="font-size: 10px;">'+Q+"</span>":""}</span>`:"",O=q||(Q>0?"":"\u2014"),de=ga[T.status]||ga.pending,J=T.source==="web"?"Website":T.source==="mcp"?"MCP":T.source==="api"?"API":T.source||"Website";return`
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${T.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${T.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${b(T.confirmation_code||"\u2014")}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${b(O)}</span>${X}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${T.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                        ${Object.entries(ga).map(([H,L])=>`<option value="${H}" ${T.status===H?"selected":""}>${L.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${J}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${_n(T.created_at)}</td>
                    ${window.IS_DEMO?'<td style="width: 32px;"></td>':`<td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${T.id}" title="Delete submission" style="
                        border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                        display: inline-flex; align-items: center; border-radius: var(--radius-md);
                        transition: color 0.12s, background 0.12s;
                      " onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';" onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>`}
                  </tr>
                  <tr class="vs-record-detail" data-detail-for="${T.id}" style="display: none;">
                    <td colspan="7" style="padding: 0 12px 12px 44px; background: var(--vs-bg-recessed, var(--vs-bg-ghost));">
                      <div style="
                        display: grid; grid-template-columns: auto 1fr; gap: 4px 16px;
                        font-size: 12px; padding: 12px 0;
                      ">
                        ${Object.entries(D).map(([H,L])=>{if(L&&typeof L=="object"&&L.path&&L.original_name){let N=L.size<1024?L.size+" B":L.size<1048576?Math.round(L.size/1024)+" KB":(L.size/1048576).toFixed(1)+" MB";return`
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${b(H.replace(/_/g," "))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="/_studio/api/router.php?_path=/agentic/actions/${encodeURIComponent(e)}/records/${T.id}/files/${encodeURIComponent(H)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${b(L.original_name)} (${N})
                                </a>
                              </div>
                            `}return`
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${b(H.replace(/_/g," "))}</div>
                            <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${b(String(L||"\u2014"))}</div>
                          `}).join("")}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>

        ${p>1?`
          <div class="flex items-center justify-between" style="padding: 12px 0; font-size: 13px;">
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-prev" ${t<=1?"disabled":""} data-page="${t-1}">\u2190 Previous</button>
            <span class="text-vs-text-tertiary">Page ${t} of ${p} \xB7 ${d} submission${d!==1?"s":""}</span>
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-next" ${t>=p?"disabled":""} data-page="${t+1}">Next \u2192</button>
          </div>
        `:`
          <div class="text-sm text-vs-text-ghost text-center" style="padding: 8px 0;">${d} submission${d!==1?"s":""}</div>
        `}
      `}
    </div>
  `;let c=null,v=()=>pn(e,1);(y=document.getElementById("action-filter-status"))==null||y.addEventListener("change",v),(f=document.getElementById("action-filter-search"))==null||f.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(v,300)}),(h=document.getElementById("action-records-prev"))==null||h.addEventListener("click",T=>{let _=parseInt(T.currentTarget.dataset.page);_>=1&&pn(e,_)}),($=document.getElementById("action-records-next"))==null||$.addEventListener("click",T=>{let _=parseInt(T.currentTarget.dataset.page);_<=p&&pn(e,_)}),s.querySelectorAll(".vs-record-toggle").forEach(T=>{T.addEventListener("click",()=>{let _=T.dataset.rid,D=s.querySelector(`.vs-record-detail[data-detail-for="${_}"]`);if(!D)return;let q=D.style.display!=="none";D.style.display=q?"none":"table-row",T.style.transform=q?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(T=>{T.addEventListener("change",async _=>{var X;if(fs()){T.value=((X=T.querySelector("[selected]"))==null?void 0:X.value)||"pending";return}if(Ws())return;let D=_.target.dataset.recordId,q=_.target.value,{ok:Q}=await E.put(`/agentic/actions/${encodeURIComponent(e)}/records/${D}`,{status:q});I(Q?"Status updated":"Failed to update",Q?"success":"error")})}),(w=document.getElementById("btn-purge-records"))==null||w.addEventListener("click",async()=>{var Q,X;if(fs()||Ws())return;let T=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],_=document.getElementById("vs-purge-overlay");_&&_.remove();let D=document.createElement("div");D.id="vs-purge-overlay",D.className="vs-modal-overlay",D.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Submissions</h2>
          <p class="vs-modal-desc">Remove submissions older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${T.map(O=>`<option value="${O.days}">${O.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(D),requestAnimationFrame(()=>D.classList.add("is-visible"));let q=()=>we(D);ke(D,q),(Q=document.getElementById("vs-purge-cancel"))==null||Q.addEventListener("click",q),(X=document.getElementById("vs-purge-ok"))==null||X.addEventListener("click",async()=>{var F;let O=document.getElementById("vs-purge-select"),de=parseInt(O==null?void 0:O.value),J=((F=O==null?void 0:O.selectedOptions[0])==null?void 0:F.textContent)||"";if(q(),await new Promise(V=>setTimeout(V,200)),!await Ce({title:"Confirm Purge",description:`This will permanently delete all records "${J.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:L,data:N}=await E.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:de});L?(I(`${(N==null?void 0:N.purged)||0} record(s) purged`,"success"),pn(e,1)):I("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(T=>{T.addEventListener("click",async()=>{if(fs()||Ws())return;let _=T.dataset.rid;if(!await Ce({title:"Delete Submission",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:q}=await E.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${_}`);q?(I("Submission deleted","success"),pn(e,t)):I("Failed to delete submission","error")})}),(k=document.getElementById("btn-export-action-csv"))==null||k.addEventListener("click",async()=>{if(fs())return;let T=document.getElementById("btn-export-action-csv"),_=T.innerHTML;T.innerHTML=`${x.loader} Exporting...`,T.disabled=!0;try{let D=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!D.ok)throw new Error("Export failed");let q=await D.blob(),Q=URL.createObjectURL(q),X=document.createElement("a");X.href=Q,X.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(X),X.click(),X.remove(),URL.revokeObjectURL(Q),I("CSV downloaded","success")}catch{I("Failed to export CSV","error")}T.innerHTML=_,T.disabled=!1})}var Wn=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Gn=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},_t={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function vl(){return setTimeout(()=>Dp(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function Dp(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await E.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>
          </div>
          <p class="vs-empty-state-title">No forms yet</p>
          <p class="vs-empty-state-desc">Form entries will appear here when forms on a published website are submitted.</p>
        </div>
      </div>
    `;return}e.innerHTML=`
    <div class="flex flex-col gap-4">
      ${n.map(o=>`
        <a href="#/forms/${encodeURIComponent(o.id)}" class="vs-form-card" data-form-id="${b(o.id)}">
          <div class="vs-form-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/><path d="M8 13h3"/><path d="M8 17h6"/></svg>
          </div>
          <div class="vs-form-card-body">
            <div class="vs-form-card-name">${b(o.name)}</div>
            ${o.description?`<div class="vs-form-card-desc">${b(o.description)}</div>`:""}
            <div class="vs-form-card-meta">
              <span>${o.fields} field${o.fields!==1?"s":""}</span>
              <span class="vs-form-card-dot">\xB7</span>
              <span>${o.total} submission${o.total!==1?"s":""}</span>
            </div>
          </div>
          <div class="vs-form-card-right">
            ${o.unread>0?`<span class="vs-form-unread-badge">${o.unread}</span>`:""}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </a>
      `).join("")}
    </div>
  `}function ml(e){return setTimeout(()=>Hp(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function Hp(e){var c,v;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await E.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/forms" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Forms</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${b(i.name||e)}</span>
      </div>
      <h1 class="vs-page-title">${b(i.name||e)}</h1>
      ${i.description?`<p class="vs-page-subtitle">${b(i.description)}</p>`:""}
    </div>

    <div class="vs-form-stats-row">
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${a.total}</span>
        <span class="vs-form-stat-label">Total</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${a.new||0}</span>
        <span class="vs-form-stat-label">New</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${a.read||0}</span>
        <span class="vs-form-stat-label">Read</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${a.replied||0}</span>
        <span class="vs-form-stat-label">Replied</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-text-ghost)">${a.archived||0}</span>
        <span class="vs-form-stat-label">Archived</span>
      </div>
    </div>

    <div class="vs-form-filter-bar">
      <div class="flex items-center gap-2 flex-wrap">
        <select id="form-filter-status" class="vs-input vs-input-compact">
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
        <select id="form-filter-source" class="vs-input vs-input-compact">
          <option value="all">All sources</option>
          <option value="web">Web</option>
          <option value="mcp">MCP / Agent</option>
        </select>
        <input type="text" id="form-filter-search" class="vs-input vs-input-compact" placeholder="Search submissions..." style="min-width: 180px;" />
      </div>
      <div class="flex items-center gap-2">
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-upgrade-to-action" title="Convert this form into an agent action">
          ${x.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${a.total===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${a.total===0?"No submissions to export":"Download submissions as CSV"}">
          ${x.download} Export CSV
        </button>
      </div>
    </div>
  `;let r=document.getElementById("form-filter-status"),l=document.getElementById("form-filter-source"),d=document.getElementById("form-filter-search"),u=null,p=()=>Zo(e,1);r==null||r.addEventListener("change",p),l==null||l.addEventListener("change",p),d==null||d.addEventListener("input",()=>{clearTimeout(u),u=setTimeout(p,300)}),(c=document.getElementById("btn-export-csv"))==null||c.addEventListener("click",async()=>{let m=document.getElementById("btn-export-csv"),g=m.innerHTML;m.innerHTML=`${x.loader} Exporting...`,m.disabled=!0;try{let y=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!y.ok)throw new Error("Export failed");let f=await y.blob(),h=URL.createObjectURL(f),$=document.createElement("a");$.href=h,$.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild($),$.click(),$.remove(),URL.revokeObjectURL(h),I("CSV downloaded","success")}catch{I("Failed to export CSV","error")}m.innerHTML=g,m.disabled=!1}),(v=document.getElementById("btn-upgrade-to-action"))==null||v.addEventListener("click",async()=>{var h,$;if(Wn()||Gn())return;let m=(i.fields||[]).length;if(!await Ce({title:"Upgrade to Agent Action",description:`This will create a new agent action with${m>0?` the ${m} field${m!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let y=document.getElementById("btn-upgrade-to-action"),f=y.innerHTML;y.innerHTML=`${x.loader} Converting...`,y.disabled=!0,y.style.opacity="0.6";try{let w={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},k=[],T=0;(i.fields||[]).forEach(O=>{let de=w[O.type];if(!de){T++;return}let J={name:O.name,label:O.label||O.name,type:de,required:O.required||!1};(de==="select"||de==="radio")&&O.options&&(J.options=O.options),O.placeholder&&(J.placeholder=O.placeholder),k.push(J)}),T>0&&I(`${T} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let _=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),D=Date.now().toString(36).slice(-4),q={id:_+"-"+D,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:k,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:Q,data:X}=await E.post("/agentic/actions",q);if(Q&&(X!=null&&X.action))I(`"${X.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${X.action.id}`;else{let de=(((h=X==null?void 0:X.error)==null?void 0:h.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":(($=X==null?void 0:X.error)==null?void 0:$.message)||"Failed to create action";I(de,"error"),y.innerHTML=f,y.disabled=!1,y.style.opacity=""}}catch{I("Failed to convert form to action","error"),y.innerHTML=f,y.disabled=!1,y.style.opacity=""}}),await Zo(e,1)}async function Zo(e,t=1){var y,f,h;let s=document.getElementById("form-submissions");if(!s)return;let n=((y=document.getElementById("form-filter-status"))==null?void 0:y.value)||"all",o=((f=document.getElementById("form-filter-source"))==null?void 0:f.value)||"all",i=((h=document.getElementById("form-filter-search"))==null?void 0:h.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:r,data:l}=await E.get(a);if(!r||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let d=l.submissions||[],u=l.total||0,p=l.per_page||20,c=Math.ceil(u/p);if(!d.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:v}=await E.get(`/forms/${encodeURIComponent(e)}`),m=v==null?void 0:v.form,g={};m!=null&&m.fields&&m.fields.forEach($=>{g[$.name]=$.label||$.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${d.map($=>{let w=_t[$.status]||_t.new,k=Object.entries($.data||{}).filter(([D])=>!D.startsWith("_")).slice(0,3).map(([D,q])=>{let Q=g[D]||D,X=Array.isArray(q)?q.join(", "):String(q);return`<span class="vs-sub-field"><strong>${b(Q)}:</strong> ${b(X.substring(0,80))}${X.length>80?"\u2026":""}</span>`}).join(""),T=_n($.created_at),_=$.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${$.id}" data-form-id="${b(e)}" style="border-left-color: ${w.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${w.bg}; color: ${w.text};">${w.label}</span>
                ${_?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${b(T)}</span>
            </div>
            <div class="vs-submission-preview">
              ${k||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${$.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${$.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                ${Object.entries(_t).map(([D,q])=>`<option value="${D}" ${$.status===D?"selected":""}>${q.label}</option>`).join("")}
              </select>
              ${window.IS_DEMO?"":`<button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${$.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>`}
            </div>
          </div>
        `}).join("")}
    </div>

    ${c>1?`
      <div class="vs-pagination">
        ${t>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t-1}" data-form-id="${b(e)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${t} of ${c} \xB7 ${u} submission${u!==1?"s":""}</span>
        ${t<c?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t+1}" data-form-id="${b(e)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${u} submission${u!==1?"s":""}</span>
      </div>
    `}
  `,Np(e,t)}function Np(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;ul(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{var i;if(Wn()){s.value=s.dataset.originalValue||((i=s.querySelector("[selected]"))==null?void 0:i.value)||"new";return}if(Gn())return;let n=s.dataset.subId,{ok:o}=await E.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){I("Status updated","success");let a=s.closest(".vs-submission-card"),r=_t[s.value];if(a&&r){a.style.borderLeftColor=r.text;let l=a.querySelector(".vs-status-pill");l&&(l.style.background=r.bg,l.style.color=r.text,l.textContent=r.label)}}else I("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{if(Wn()||Gn())return;let n=s.dataset.subId;if(!await Ce({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await E.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(I("Submission deleted","success"),Zo(e,t)):I("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);Zo(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;ul(e,o)})})}async function ul(e,t){var p,c,v,m;(p=document.getElementById("submission-detail-overlay"))==null||p.remove();let{ok:s,data:n}=await E.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(g=>String(g.id)===String(t));if(!o){I("Submission not found","error");return}let{data:i}=await E.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,r={};if(a!=null&&a.fields&&a.fields.forEach(g=>{r[g.name]=g.label||g.name}),o.status==="new"&&!window.IS_DEMO){let{ok:g}=await E.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"});if(g){o.status="read";let y=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);y&&(y.value="read");let f=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(f){f.style.borderLeftColor=_t.read.text;let h=f.querySelector(".vs-status-pill");h&&(h.style.background=_t.read.bg,h.style.color=_t.read.text,h.textContent="Read")}}}let l=_t[o.status]||_t.new,d=document.createElement("div");d.id="submission-detail-overlay",d.className="vs-slide-overlay",d.innerHTML=`
    <div class="vs-slide-panel" id="submission-detail-panel">
      <div class="vs-slide-panel-header">
        <h2 class="text-md font-semibold text-vs-text-primary">Submission #${o.id}</h2>
        <button id="close-sub-detail" class="vs-btn-ghost vs-btn-icon" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div class="vs-slide-panel-body">
        <div class="vs-sub-detail-meta">
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Status</span>
            <span class="vs-status-pill" style="background: ${l.bg}; color: ${l.text};">${l.label}</span>
          </div>
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Source</span>
            <span class="text-sm text-vs-text-primary">${o.source==="mcp"?"MCP / Agent":"Web Form"}</span>
          </div>
          <div class="vs-sub-detail-row">
            <span class="vs-sub-detail-label">Submitted</span>
            <span class="text-sm text-vs-text-primary">${new Date(o.created_at).toLocaleString()}</span>
          </div>
          ${o.ip_address?`
            <div class="vs-sub-detail-row">
              <span class="vs-sub-detail-label">IP Address</span>
              <span class="text-sm text-vs-text-tertiary font-mono">${b(o.ip_address)}</span>
            </div>
          `:""}
          ${o.referrer?`
            <div class="vs-sub-detail-row">
              <span class="vs-sub-detail-label">Referrer</span>
              <span class="text-sm text-vs-text-tertiary" style="word-break: break-all;">${b(o.referrer)}</span>
            </div>
          `:""}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Submitted Data</h3>
        <div class="vs-sub-detail-fields">
          ${Object.entries(o.data||{}).filter(([g])=>!g.startsWith("_")).map(([g,y])=>{let f=r[g]||g,h=Array.isArray(y)?y.join(", "):String(y);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${b(f)}</div>
                <div class="vs-sub-detail-field-value">${b(h)}</div>
              </div>
            `}).join("")}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Internal Notes</h3>
        <textarea id="sub-detail-notes" class="vs-input" style="min-height: 80px; resize: vertical;" placeholder="${window.IS_DEMO?"Notes are read-only in demo mode.":"Add private notes about this submission..."}" ${window.IS_DEMO?"readonly":""}>${b(o.notes||"")}</textarea>
        ${window.IS_DEMO?"":'<button id="btn-save-sub-notes" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-top: 8px;">Save Notes</button>'}

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Change Status</h3>
        <select id="sub-detail-status" class="vs-input" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
          ${Object.entries(_t).map(([g,y])=>`<option value="${g}" ${o.status===g?"selected":""}>${y.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(d),requestAnimationFrame(()=>{requestAnimationFrame(()=>d.classList.add("is-visible"))});let u=()=>{d.classList.remove("is-visible"),setTimeout(()=>d.remove(),200)};ke(d,u),(c=document.getElementById("close-sub-detail"))==null||c.addEventListener("click",u),(v=document.getElementById("btn-save-sub-notes"))==null||v.addEventListener("click",async()=>{var f;if(Wn()||Gn())return;let g=((f=document.getElementById("sub-detail-notes"))==null?void 0:f.value)||"",{ok:y}=await E.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:g});I(y?"Notes saved":"Failed to save notes",y?"success":"error")}),(m=document.getElementById("sub-detail-status"))==null||m.addEventListener("change",async g=>{if(Wn()){g.target.value=o.status;return}if(Gn())return;let y=g.target.value,{ok:f}=await E.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:y});if(f){I("Status updated","success");let h=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);h&&(h.value=y);let $=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),w=_t[y];if($&&w){$.style.borderLeftColor=w.text;let k=$.querySelector(".vs-status-pill");k&&(k.style.background=w.bg,k.style.color=w.text,k.textContent=w.label)}}else I("Failed to update status","error")})}var fa=!1;function hl(){return fa=!1,setTimeout(()=>{Op(),ba()},0),`
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 style="font-size: 20px; font-weight: 650; color: var(--vs-text-primary); letter-spacing: -0.025em; margin: 0;">Team</h1>
          <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 4px 0 0;">Manage who has access to this Studio.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-show-roles" class="vs-btn vs-btn-ghost vs-btn-sm" title="View role permissions">
            ${x.shield} Roles
          </button>
          <button id="btn-add-member" class="vs-btn vs-btn-primary vs-btn-sm">
            ${x.userPlus||x.plus} Add Member
          </button>
        </div>
      </div>

      <div class="vs-team-table">
        <div class="vs-team-table-header">
          <span>Member</span>
          <span>Role</span>
          <span>Last active</span>
          <span></span>
        </div>
        <div id="team-list">
          <div style="padding: 32px 20px; text-align: center; font-size: 13px; color: var(--vs-text-ghost);">Loading team\u2026</div>
        </div>
      </div>
    </div>
  `}function bl(){return`
    <!-- Add/Edit Member Modal -->
    <div id="team-modal" class="vs-team-modal hidden">
      <div class="vs-team-modal-backdrop" data-team-modal-overlay></div>
      <div class="vs-team-modal-card">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 id="team-modal-title" class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Add Team Member</h2>
          <p class="text-xs text-vs-text-ghost mt-1">They'll be able to sign in with these credentials.</p>
        </div>
        <div class="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" id="team-edit-id" value="" />
          <div>
            <label class="vs-input-label" for="team-member-name">Name</label>
            <input type="text" id="team-member-name" class="vs-input" placeholder="Jane Smith" />
          </div>
          <div>
            <label class="vs-input-label" for="team-member-email">Email</label>
            <input type="email" id="team-member-email" class="vs-input" placeholder="jane@example.com" />
          </div>
          <div>
            <label class="vs-input-label" for="team-member-role">Role</label>
            <select id="team-member-role" class="vs-input">
              <option value="editor">Editor \u2014 can edit and publish</option>
              <option value="viewer">Viewer \u2014 read-only access</option>
            </select>
          </div>
          <div id="team-password-section">
            <label class="vs-input-label" for="team-member-password">Temporary Password</label>
            <div class="flex gap-2">
              <input type="text" id="team-member-password" class="vs-input flex-1 font-mono" placeholder="At least 8 characters" />
              <button id="btn-generate-password" class="vs-btn vs-btn-ghost vs-btn-sm" title="Generate random password">
                ${x.rotateCcw}
              </button>
            </div>
            <p class="text-2xs text-vs-text-ghost mt-1.5">Share this password with the new team member. They can change it from their profile.</p>
          </div>
          <div id="team-modal-error" class="hidden text-sm text-vs-error"></div>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end gap-2">
          <button id="btn-team-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
          <button id="btn-team-save" class="vs-btn vs-btn-primary vs-btn-sm">Add Member</button>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div id="team-pw-modal" class="vs-team-modal hidden">
      <div class="vs-team-modal-backdrop" data-team-pw-overlay></div>
      <div class="vs-team-modal-card">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Reset Password</h2>
          <p id="team-pw-modal-subtitle" class="text-xs text-vs-text-ghost mt-1"></p>
        </div>
        <div class="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" id="team-pw-user-id" value="" />
          <div>
            <label class="vs-input-label" for="team-new-password">New Password</label>
            <div class="flex gap-2">
              <input type="text" id="team-new-password" class="vs-input flex-1 font-mono" placeholder="At least 8 characters" />
              <button id="btn-pw-generate" class="vs-btn vs-btn-ghost vs-btn-sm" title="Generate random password">
                ${x.rotateCcw}
              </button>
            </div>
          </div>
          <div id="team-pw-error" class="hidden text-sm text-vs-error"></div>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end gap-2">
          <button id="btn-pw-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
          <button id="btn-pw-save" class="vs-btn vs-btn-primary vs-btn-sm">Reset Password</button>
        </div>
      </div>
    </div>

    <!-- Role Permissions Modal -->
    <div id="team-roles-modal" class="vs-team-modal hidden">
      <div class="vs-team-modal-backdrop" data-team-roles-overlay></div>
      <div class="vs-team-modal-card" style="width: min(520px, calc(100vw - 2rem));">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Role Permissions</h2>
          <p class="text-xs text-vs-text-ghost mt-1">What each role can do in this Studio.</p>
        </div>
        <div class="px-6 py-5">
          <div class="vs-role-matrix">
            <div class="vs-role-matrix-header">
              <span class="vs-role-matrix-label"></span>
              <span class="vs-role-badge vs-role-owner">Owner</span>
              <span class="vs-role-badge vs-role-editor">Editor</span>
              <span class="vs-role-badge vs-role-viewer">Viewer</span>
            </div>
            ${[["Use AI chat",!0,!0,!1],["Edit pages & code",!0,!0,!1],["Site workspace",!0,!0,!1],["Use notes",!0,!0,!1],["View board",!0,!0,!0],["Edit board",!0,!0,!1],["Manage assets",!0,!0,!1],["Publish changes",!0,!0,!1],["View form submissions",!0,!0,!0],["Preview the site",!0,!0,!0],["Manage designs",!0,!0,!1],["Change settings",!0,!1,!1],["Manage team members",!0,!1,!1]].map(([e,t,s,n])=>`
              <div class="vs-role-matrix-row">
                <span class="vs-role-matrix-label">${e}</span>
                <span class="vs-role-matrix-cell">${t?"\u2713":"\u2014"}</span>
                <span class="vs-role-matrix-cell">${s?"\u2713":"\u2014"}</span>
                <span class="vs-role-matrix-cell">${n?"\u2713":"\u2014"}</span>
              </div>
            `).join("")}
          </div>
          <p style="font-size: 11px; color: var(--vs-text-ghost); margin: 12px 0 0; line-height: 1.45;">Notes are private \u2014 each team member has their own notes, separate from other users. Board is shared across the Studio team.</p>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end">
          <button id="btn-roles-close" class="vs-btn vs-btn-ghost vs-btn-sm">Close</button>
        </div>
      </div>
    </div>
  `}function jp(e){let t=P.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",r=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${x.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${b(e.name)}" title="Reset password">
        ${x.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${b(e.name)}" title="Remove">
        ${x.trash}
      </button>
    </div>
  `;return`
    <div class="vs-team-row">
      <div class="vs-team-row-identity">
        <div class="vs-team-avatar ${i}">
          ${b(e.name).charAt(0).toUpperCase()}
        </div>
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); letter-spacing: -0.01em;">${b(e.name)}</span>
            ${s?'<span style="font-size: 10px; color: var(--vs-text-ghost);">you</span>':""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b(e.email)}</div>
        </div>
      </div>
      <div>
        <span class="vs-role-badge ${o} vs-role-badge-clickable" data-role-info>${e.role}</span>
      </div>
      <div class="vs-team-row-meta">${a}</div>
      ${r}
    </div>
  `}async function ba(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await E.get("/team");if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${(n==null?void 0:n.message)||"Failed to load team members."}</div>`;return}let o=(s==null?void 0:s.members)||[];o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>jp(i)).join("")}function Op(){var t,s,n,o,i,a,r,l,d;if(fa)return;fa=!0,(t=document.getElementById("btn-add-member"))==null||t.addEventListener("click",()=>{fl()}),(s=document.getElementById("btn-show-roles"))==null||s.addEventListener("click",gl);let e=document.getElementById("team-list");e&&e.addEventListener("click",async u=>{let p=u.target;if(p.closest("[data-role-info]")){gl();return}let v=p.closest(".team-edit-btn");if(v){let y=v.dataset.id,{ok:f,data:h}=await E.get("/team");if(f){let $=h.members.find(w=>w.id==y);$&&fl($)}return}let m=p.closest(".team-delete-btn");if(m){let y=m.dataset.id,f=m.dataset.name;if(!await Ce({title:"Remove Team Member",description:`Remove ${f} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let{ok:$,error:w}=await E.delete(`/team/${y}`);$?(I(`${f} has been removed.`,"success"),await ba()):I((w==null?void 0:w.message)||"Failed to remove member.","error");return}let g=p.closest(".team-pw-btn");if(g){let y=g.dataset.id,f=g.dataset.name;Fp(y,f);return}}),[["[data-team-modal-overlay]",Qo],["[data-team-pw-overlay]",ei],["[data-team-roles-overlay]",ha]].forEach(([u,p])=>{let c=document.querySelector(u);if(!c)return;let v=null;c.addEventListener("mousedown",m=>{v=m.target}),c.addEventListener("click",m=>{m.target===c&&v===c&&p()})}),(n=document.getElementById("btn-team-cancel"))==null||n.addEventListener("click",Qo),(o=document.getElementById("btn-pw-cancel"))==null||o.addEventListener("click",ei),(i=document.getElementById("btn-roles-close"))==null||i.addEventListener("click",ha),(a=document.getElementById("btn-generate-password"))==null||a.addEventListener("click",()=>{let u=document.getElementById("team-member-password");u&&(u.value=An())}),(r=document.getElementById("btn-pw-generate"))==null||r.addEventListener("click",()=>{let u=document.getElementById("team-new-password");u&&(u.value=An())}),(l=document.getElementById("btn-team-save"))==null||l.addEventListener("click",zp),(d=document.getElementById("btn-pw-save"))==null||d.addEventListener("click",Up),document.addEventListener("keydown",qp)}function qp(e){if(e.key!=="Escape")return;let t=document.getElementById("team-modal"),s=document.getElementById("team-pw-modal"),n=document.getElementById("team-roles-modal");n&&!n.classList.contains("hidden")?(ha(),e.stopPropagation()):s&&!s.classList.contains("hidden")?(ei(),e.stopPropagation()):t&&!t.classList.contains("hidden")&&(Qo(),e.stopPropagation())}function gl(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden")}function ha(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden")}function fl(e=null){let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");t&&(document.getElementById("team-member-name").value=(e==null?void 0:e.name)||"",document.getElementById("team-member-email").value=(e==null?void 0:e.email)||"",document.getElementById("team-member-role").value=(e==null?void 0:e.role)||"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=An()),t.classList.remove("hidden"))}function Qo(){var e;(e=document.getElementById("team-modal"))==null||e.classList.add("hidden")}function Fp(e,t){let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");s&&(document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=An(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",s.classList.remove("hidden"))}function ei(){var e;(e=document.getElementById("team-pw-modal"))==null||e.classList.add("hidden")}async function zp(){var l,d,u,p,c,v,m,g;let e=(l=document.getElementById("team-edit-id"))==null?void 0:l.value,t=(u=(d=document.getElementById("team-member-name"))==null?void 0:d.value)==null?void 0:u.trim(),s=(c=(p=document.getElementById("team-member-email"))==null?void 0:p.value)==null?void 0:c.trim(),n=(v=document.getElementById("team-member-role"))==null?void 0:v.value,o=(m=document.getElementById("team-member-password"))==null?void 0:m.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026";let r;e?r=await E.put(`/team/${e}`,{name:t,email:s,role:n}):r=await E.post("/team",{name:t,email:s,role:n,password:o}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",r.ok?(Qo(),I(e?"Member updated.":`${t} has been added to the team.`,"success"),await ba()):(i.textContent=((g=r.error)==null?void 0:g.message)||"Something went wrong.",i.classList.remove("hidden"))}async function Up(){var a,r;let e=(a=document.getElementById("team-pw-user-id"))==null?void 0:a.value,t=(r=document.getElementById("team-new-password"))==null?void 0:r.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026";let{ok:o,error:i}=await E.post(`/team/${e}/password`,{password:t});n.disabled=!1,n.textContent="Reset Password",o?(ei(),I("Password has been reset.","success")):(s.textContent=(i==null?void 0:i.message)||"Failed to reset password.",s.classList.remove("hidden"))}var Vp=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Wp=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1};function xl(){return setTimeout(()=>Kn(),0),`
    <div>
      <div class="flex items-center justify-between mb-8">
        <div class="vs-page-header" style="margin-bottom: 0;">
          <h1 class="vs-page-title">Assets</h1>
          <p class="vs-page-subtitle">Images, documents, and files for your website.</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="file" id="asset-file-input" multiple class="hidden" />
          <button id="btn-upload-asset" class="vs-btn vs-btn-primary vs-btn-sm">
            Upload Files
          </button>
        </div>
      </div>

      <!-- Drop zone -->
      <div id="asset-dropzone" class="vs-dropzone mb-5">
        <div class="vs-dropzone-icon">${x.upload}</div>
        <p class="vs-dropzone-title">Drag & drop files here, or click to upload</p>
        <p class="vs-dropzone-hint">Images, documents, and fonts</p>
      </div>

      <!-- Filter tabs -->
      <div class="flex gap-1 mb-4" id="asset-filters">
        <button data-filter="all" class="vs-device-btn vs-device-btn-active">All</button>
        <button data-filter="images" class="vs-device-btn">Images</button>
        <button data-filter="code" class="vs-device-btn">Code</button>
        <button data-filter="files" class="vs-device-btn">Documents</button>
        <button data-filter="fonts" class="vs-device-btn">Fonts</button>
      </div>

      <!-- Asset grid -->
      <div id="assets-grid" class="flex flex-col gap-4">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading assets...</div>
      </div>
    </div>
  `}async function Kn(e="all"){var f;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await yl(n.files),n.value="",Kn(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=h=>{h.target.closest("button")||n==null||n.click()},o.ondragover=h=>{h.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async h=>{h.preventDefault(),o.classList.remove("is-dragover"),h.dataTransfer.files.length>0&&(await yl(h.dataTransfer.files),Kn(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(h=>{h.onclick=()=>{i.querySelectorAll("[data-filter]").forEach($=>{$.className="vs-device-btn"}),h.className="vs-device-btn vs-device-btn-active",Kn(h.dataset.filter)}});let a=e==="code",r=!a&&e!=="all"?`?category=${e}`:"",{ok:l,data:d}=await E.get(`/assets${r}`);if(!l||!((f=d==null?void 0:d.assets)!=null&&f.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let h=document.getElementById("btn-empty-upload"),$=document.getElementById("btn-upload-asset");h&&$&&h.addEventListener("click",()=>$.click());return}let u=d.assets;if(a&&(u=u.filter(h=>h.category==="css"||h.category==="js"),u.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${x.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let p=["jpg","jpeg","png","gif","webp","svg","ico"],c=u.filter(h=>h.category==="images"&&p.includes(h.extension)),v=u.filter(h=>!p.includes(h.extension)||h.category!=="images");function m(h,$){return h==="css"?x.fileCode:h==="js"?x.fileCode:h==="json"?x.fileJson:h==="pdf"?x.filePdf:["woff2","woff","ttf","otf"].includes(h)?x.type:["mp4","webm"].includes(h)?x.film:["mp3","wav","ogg"].includes(h)?x.music:["txt","md","csv"].includes(h)?x.fileText:["doc","docx","xls","xlsx"].includes(h)?x.fileText:$==="images"?x.image:x.fileText}let g=["css","js","json","svg"],y="";c.length>0&&(y+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',c.forEach((h,$)=>{var _;let w=Vi(h.size),k=h.width?`${h.width}\xD7${h.height}`:"",T=h.extension==="svg";y+=`
        <div class="vs-asset-card" data-lightbox-idx="${$}">
          <div class="vs-asset-card-thumb${T?" is-svg":""}" style="cursor:pointer">
            <img src="${h.thumbnail||h.path}" alt="${b(((_=h.meta)==null?void 0:_.alt)||h.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${b(h.filename)}">${b(h.filename)}</p>
            <p class="vs-asset-card-meta">${k?k+" \xB7 ":""}${w}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${h.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${x.copy}</button>
            <button data-delete-asset="${h.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${x.x}</button>
          </div>
        </div>
      `}),y+="</div>"),v.length>0&&v.forEach(h=>{let $=Vi(h.size),w=g.includes(h.extension);y+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${m(h.extension,h.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${b(h.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${h.category} \xB7 ${$}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${w?`
              <button data-edit-asset="${h.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${x.pencil}</button>
            `:""}
            <button data-copy-path="${h.path}" title="Copy web path"
              class="vs-asset-action-btn">${x.copy}</button>
            ${h.category!=="css"&&h.category!=="js"?`
              <button data-delete-asset="${h.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${x.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=y,t.querySelectorAll("[data-lightbox-idx]").forEach(h=>{let $=h.querySelector(".vs-asset-card-thumb");$&&$.addEventListener("click",()=>{let w=parseInt(h.dataset.lightboxIdx,10);Gp(c,w,e)})}),t.querySelectorAll("[data-copy-path]").forEach(h=>{h.addEventListener("click",()=>{navigator.clipboard.writeText(h.dataset.copyPath).then(()=>{let $=h.innerHTML;h.innerHTML="\u2713",h.classList.add("vs-asset-action-copied"),setTimeout(()=>{h.innerHTML=$,h.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(h=>{h.addEventListener("click",()=>{let w=h.dataset.editAsset.replace(/^\//,"");Nn(w)})}),t.querySelectorAll("[data-delete-asset]").forEach(h=>{h.addEventListener("click",async()=>{if(!await Ce({title:"Delete Asset",description:`Delete ${h.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:w}=await E.delete("/assets",{path:h.dataset.deleteAsset});w?(I("Asset deleted.","success"),Kn(e)):I("Could not delete asset.","error")})})}function Gp(e,t,s){let n=t;function o(c){if(c===0)return"0 B";let v=1024,m=["B","KB","MB","GB"],g=Math.floor(Math.log(c)/Math.log(v));return parseFloat((c/Math.pow(v,g)).toFixed(1))+" "+m[g]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var f,h;let c=e[n],v=c.width?`${c.width}\xD7${c.height}`:"",m=o(c.size),g=[v,m,(f=c.extension)==null?void 0:f.toUpperCase()].filter(Boolean),y=e.length>1;return`
      ${y?`
        <button class="vs-lightbox-nav vs-lightbox-nav--prev" id="lightbox-prev" title="Previous (\u2190)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="vs-lightbox-nav vs-lightbox-nav--next" id="lightbox-next" title="Next (\u2192)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `:""}

      <div class="vs-lightbox-stage">
        <div class="vs-lightbox-center">
          <div class="vs-lightbox-image-wrap${["svg","png"].includes(c.extension)?" is-transparent":""}">
            <img src="${c.path}" alt="${b(((h=c.meta)==null?void 0:h.alt)||c.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${b(c.filename)}</span>
            <span class="vs-lightbox-details">${g.join(" \xB7 ")}${y?` \xB7 ${n+1} / ${e.length}`:""}</span>
          </div>

          <div class="vs-lightbox-actions">
            <button class="vs-lightbox-btn" id="lightbox-copy" title="Copy web path">
              ${x.copy}<span>Copy path</span>
            </button>
          </div>
        </div>
      </div>

      <button class="vs-lightbox-close" id="lightbox-close" title="Close (Esc)">
        ${x.x}
      </button>
    `}let r=document.createElement("div");r.id="vs-lightbox",r.className="vs-lightbox",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Image preview"),r.innerHTML=a(),document.body.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add("is-visible"))});function l(){r.classList.remove("is-visible"),setTimeout(()=>r.remove(),400),document.removeEventListener("keydown",u)}function d(c){n=c,r.innerHTML=a(),p()}function u(c){if(c.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;l(),c.preventDefault()}c.key==="ArrowRight"&&e.length>1&&(d((n+1)%e.length),c.preventDefault()),c.key==="ArrowLeft"&&e.length>1&&(d((n-1+e.length)%e.length),c.preventDefault())}function p(){var m,g,y;(m=r.querySelector("#lightbox-close"))==null||m.addEventListener("click",f=>{f.stopPropagation(),l()});let c=null;r.addEventListener("mousedown",f=>{c=f.target}),r.addEventListener("click",f=>{var w;let h=f.target===r||f.target.classList.contains("vs-lightbox-stage"),$=c===r||((w=c==null?void 0:c.classList)==null?void 0:w.contains("vs-lightbox-stage"));h&&$&&l()}),(g=r.querySelector("#lightbox-prev"))==null||g.addEventListener("click",f=>{f.stopPropagation(),d((n-1+e.length)%e.length)}),(y=r.querySelector("#lightbox-next"))==null||y.addEventListener("click",f=>{f.stopPropagation(),d((n+1)%e.length)});let v=r.querySelector("#lightbox-copy");v==null||v.addEventListener("click",f=>{f.stopPropagation();let h=e[n];navigator.clipboard.writeText(h.path).then(()=>{let $=v.innerHTML;v.innerHTML=`${x.check}<span>Copied!</span>`,v.style.borderColor="var(--vs-success)",v.style.color="var(--vs-success)",setTimeout(()=>{v.innerHTML=$,v.style.borderColor="",v.style.color=""},2e3),I("Path copied!","success")})})}document.addEventListener("keydown",u),p()}async function yl(e){var i,a,r;if(Vp()||Wp())return;let t=window.__vsSetGlobalStatus;t&&t("saving",`Uploading ${e.length} file(s)\u2026`);let s=new FormData;for(let l of e)s.append("file[]",l);let n=P.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let d=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();if(d.ok){let u=((a=(i=d.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0;I(`${u} file(s) uploaded.`,"success"),t&&t("saved",`\u2713 ${u} file(s) uploaded`)}else{let u=((r=d.error)==null?void 0:r.message)||"Upload failed";I(u,"error"),t&&t("error","\u2717 "+u)}}catch{I("Upload failed.","error"),t&&t("error","\u2717 Upload failed")}}var Xn="vs-newdesign-save-pref",Yn="gallery";function El(){return setTimeout(()=>Kp(),0),`
    <div>
      <div class="flex items-center justify-between mb-6">
        <div class="vs-page-header" style="margin-bottom: 0;">
          <h1 class="vs-page-title">Designs</h1>
          <p class="vs-page-subtitle">Save, compare, and switch between different looks.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-new-design" class="vs-btn vs-btn-ghost vs-btn-sm" title="Start fresh with a new design">
            New Design
          </button>
          <button id="btn-save-design" class="vs-btn vs-btn-primary vs-btn-sm">
            Save Design
          </button>
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="vs-tab-bar" style="margin-bottom: 24px;">
        <button class="vs-tab ${Yn==="gallery"?"vs-tab-active":""}" data-tab="gallery">
          ${x.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${Yn==="history"?"vs-tab-active":""}" data-tab="history">
          ${x.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading\u2026</div>
      </div>
    </div>
  `}function Kp(){var e,t;document.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",()=>{Yn=s.dataset.tab,document.querySelectorAll(".vs-tab").forEach(n=>n.classList.remove("vs-tab-active")),s.classList.add("vs-tab-active"),wl()})}),(e=document.getElementById("btn-save-design"))==null||e.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||Jn()}),(t=document.getElementById("btn-new-design"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||ya()}),wl()}function wl(){Yn==="gallery"?si():ti()}async function si(){var i,a;let e=document.getElementById("designs-content");if(!e)return;let{ok:t,data:s}=await E.get("/designs");if(!t||!((i=s==null?void 0:s.designs)!=null&&i.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <p class="vs-empty-state-title">No saved designs</p>
          <p class="vs-empty-state-desc">Save your current design and try different looks. Switch back anytime.</p>
          <button id="btn-empty-save" class="vs-btn vs-btn-primary vs-btn-sm">${x.save} Save Current Design</button>
        </div>
      </div>
    `,(a=document.getElementById("btn-empty-save"))==null||a.addEventListener("click",()=>{var r;(r=window.demoGuard)!=null&&r.call(window)||Jn()});return}let n=s.active_id,o=s.designs;e.innerHTML=`
    <div class="vs-design-grid">
      ${o.map(r=>Yp(r,r.id===n)).join("")}
    </div>
  `,Jp(e),Xp(e)}function Xp(e){e.querySelectorAll(".vs-design-card-preview").forEach(t=>{let s=t.querySelector("iframe");s&&requestAnimationFrame(()=>{let n=t.offsetWidth;if(n>0){let o=n/1440;s.style.transform=`scale(${o})`}})})}function Yp(e,t){let s=b(e.name||"Untitled"),n=e.description?b(e.description):"",o=e.initial_prompt?b(e.initial_prompt):"",i=n||(o.length>100?o.substring(0,100)+"\u2026":o),a=b(e.site_name||""),r=e.page_count||0,l=e.created_at?Bn(e.created_at):"",d=e._corrupted,u=a&&a!==s?`${a} \xB7 ${r} ${r===1?"page":"pages"}`:`${r} ${r===1?"page":"pages"}`,p=`/_studio/api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(e.id)}%2Fpreview&path=index.php`,c=`${p}&embed=1`;return`
    <div class="vs-design-card${t?" vs-design-card-active":""}${d?" vs-design-card-corrupted":""}"
         data-design-id="${ge(e.id)}">
      <div class="vs-design-card-preview">
        ${d?'<div class="vs-design-card-empty">Preview unavailable</div>':`
          <iframe src="${c}" tabindex="-1" loading="lazy"
                  sandbox="allow-same-origin"
                  title="Preview of ${ge(e.name||"design")}"></iframe>
        `}
      </div>
      <div class="vs-design-card-info">
        <h3>${s}</h3>
        ${i?`<p class="vs-design-card-desc">${i}</p>`:""}
        <div class="vs-design-card-meta">
          <span>${u}</span>
          <span>${l}</span>
        </div>
      </div>
      <div class="vs-design-card-actions">
        ${t?'<span class="vs-design-badge-active">Active</span>':`
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-load-id="${ge(e.id)}" ${d?"disabled":""}>
            ${x.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${p}" target="_blank" rel="noopener" title="Browse this design">
          ${x.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${ge(e.id)}"
                data-edit-name="${ge(e.name||"")}"
                data-edit-desc="${ge(e.description||"")}">
          ${x.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${ge(e.id)}" style="color: var(--vs-text-ghost);">
          ${x.trash2}
        </button>
      </div>
    </div>
  `}function Jp(e){e.querySelectorAll("[data-load-id]").forEach(t=>{t.addEventListener("click",async()=>{var d,u,p,c;if((d=window.demoGuard)!=null&&d.call(window)||(u=window.viewerGuard)!=null&&u.call(window))return;let s=t.dataset.loadId,n=t.closest(".vs-design-card"),o=((p=n==null?void 0:n.querySelector("h3"))==null?void 0:p.textContent)||"this design",i=await eu(o);if(!i)return;if(t.innerHTML=`${x.rotateCcw} Loading\u2026`,t.disabled=!0,i.saveDesign){let v=P.get("siteName")||"Untitled",m=await E.post("/designs",{name:`${v}`,description:"Saved before switching designs"});if(!m.ok){I(((c=m.error)==null?void 0:c.message)||"Failed to save design.","error"),t.innerHTML=`${x.rotateCcw} Load`,t.disabled=!1;return}}let{ok:a,data:r,error:l}=await E.post(`/designs/${s}/load`,{skip_auto_save:!0});a?(I("Design loaded.","success"),await $l(),window.location.hash="#/chat"):(I((l==null?void 0:l.message)||"Failed to load design.","error"),t.innerHTML=`${x.rotateCcw} Load`,t.disabled=!1)})}),e.querySelectorAll("[data-edit-id]").forEach(t=>{t.addEventListener("click",()=>{var i,a;if((i=window.demoGuard)!=null&&i.call(window)||(a=window.viewerGuard)!=null&&a.call(window))return;let s=t.dataset.editId,n=t.dataset.editName,o=t.dataset.editDesc;Qp(s,n,o)})}),e.querySelectorAll("[data-delete-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteId;if(!await Ce({title:"Delete Design",description:"This design will be removed permanently. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await E.delete(`/designs/${s}`);o?(I("Design deleted.","success"),si()):(I((i==null?void 0:i.message)||"Failed to delete design.","error"),t.innerHTML=`${x.trash2}`,t.disabled=!1)})})}async function ti(){var i,a,r;let e=document.getElementById("designs-content");if(!e)return;e.innerHTML=`
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">
        ${x.camera} Create Snapshot
      </button>
    </div>
    <div id="snapshots-list">
      <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots\u2026</div>
    </div>
  `,(i=document.getElementById("btn-create-snapshot"))==null||i.addEventListener("click",()=>{var l,d;(l=window.demoGuard)!=null&&l.call(window)||(d=window.viewerGuard)!=null&&d.call(window)||kl()});let t=document.getElementById("snapshots-list");if(!t)return;let{ok:s,data:n}=await E.get("/snapshots");if(!s||!((a=n==null?void 0:n.snapshots)!=null&&a.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">${x.camera} Create Snapshot</button>
        </div>
      </div>
    `,(r=document.getElementById("btn-empty-create-snapshot"))==null||r.addEventListener("click",()=>{var l;(l=window.demoGuard)!=null&&l.call(window)||kl()});return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((l,d)=>{let u=Bn(l.created_at),p=new Date(l.created_at).toLocaleString(),c=l.size_bytes?(l.size_bytes/1024).toFixed(0)+" KB":"\u2014",v=d===o.length-1,m,g,y;l.snapshot_type==="pre_publish"?(m="var(--vs-success)",g="vs-snap-badge-green",y="Pre-publish"):l.snapshot_type==="manual"?(m="var(--vs-accent)",g="vs-snap-badge-amber",y="Manual"):(m="var(--vs-text-ghost)",g="vs-snap-badge-gray",y="Auto");let f=l.description?`<p class="vs-timeline-desc">${b(l.description)}</p>`:"";return`
          <div class="vs-timeline-item${v?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${m}; box-shadow: 0 0 0 3px color-mix(in srgb, ${m} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${g}">${y}</span>
                  <span class="vs-timeline-label">${b(l.label||"Snapshot #"+l.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${p}">${u}</span>
              </div>
              ${f}
              <div class="vs-timeline-meta">${l.file_count} files \xB7 ${c}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${l.id}" data-snap='${JSON.stringify({label:l.label,description:l.description,type:l.snapshot_type,files:l.file_count,size:c,date:p}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${x.eye} Preview
                </button>
                <button data-restore-id="${l.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${x.rotateCcw} Restore
                </button>
                <button data-delete-snap-id="${l.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${x.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,Zp(t)}function Zp(e){e.querySelectorAll("[data-preview-id]").forEach(t=>{t.addEventListener("click",()=>{let s=JSON.parse(t.dataset.snap);su(s)})}),e.querySelectorAll("[data-restore-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.restoreId;if(!await Ce({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;t.innerHTML=`${x.rotateCcw} Restoring\u2026`,t.disabled=!0;let{ok:o,error:i}=await E.post(`/snapshots/${s}/restore`);o?(I("Snapshot restored.","success"),ti()):(I((i==null?void 0:i.message)||"Failed to restore snapshot.","error"),t.innerHTML=`${x.rotateCcw} Restore`,t.disabled=!1)})}),e.querySelectorAll("[data-delete-snap-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteSnapId;if(!await Ce({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await E.delete(`/snapshots/${s}`);o?(I("Snapshot deleted.","success"),ti()):(I((i==null?void 0:i.message)||"Failed to delete snapshot.","error"),t.innerHTML=`${x.trash2}`,t.disabled=!1)})})}function Jn(){var u;let e=document.getElementById("vs-design-save-overlay");e&&e.remove();let t=P.get("siteName")||"",s=document.createElement("div");s.id="vs-design-save-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${x.save} Save Design</h2>
        <p class="vs-modal-desc">Save a snapshot of your current design to the library. Find and restore saved designs in the Designs tab.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="design-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${ge(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="design-desc" type="text" class="vs-input w-full" placeholder="e.g. Warm wood tones with dark greens">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="design-save-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="design-save-confirm" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${x.save} Save Design</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>we(s),o=p=>{p.key==="Escape"&&(p.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),ke(s,n),(u=document.getElementById("design-save-cancel"))==null||u.addEventListener("click",n);let a=document.getElementById("design-name"),r=document.getElementById("design-desc"),l=document.getElementById("design-save-confirm"),d=p=>{p.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",d),r==null||r.addEventListener("keydown",d),a==null||a.select(),l==null||l.addEventListener("click",async()=>{var g,y;let p=((g=a==null?void 0:a.value)==null?void 0:g.trim())||"",c=((y=r==null?void 0:r.value)==null?void 0:y.trim())||"";if(!p){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:v,error:m}=await E.post("/designs",{name:p,description:c});n(),v?(I("Design saved.","success"),Yn="gallery",document.getElementById("designs-content")&&(document.querySelectorAll(".vs-tab").forEach(h=>{h.classList.toggle("vs-tab-active",h.dataset.tab==="gallery")}),si())):I((m==null?void 0:m.message)||"Failed to save design.","error")})}function Qp(e,t,s){var u;let n=document.getElementById("vs-design-edit-overlay");n&&n.remove();let o=document.createElement("div");o.id="vs-design-edit-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${x.pencil} Edit Design</h2>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="edit-design-name" type="text" class="vs-input w-full" value="${ge(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="edit-design-desc" type="text" class="vs-input w-full" value="${ge(s)}">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="edit-design-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="edit-design-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Save</button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>we(o);ke(o,i),(u=document.getElementById("edit-design-cancel"))==null||u.addEventListener("click",i);let a=document.getElementById("edit-design-name"),r=document.getElementById("edit-design-desc"),l=document.getElementById("edit-design-save");a==null||a.select();let d=p=>{p.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",d),r==null||r.addEventListener("keydown",d),l==null||l.addEventListener("click",async()=>{var g,y;let p=((g=a==null?void 0:a.value)==null?void 0:g.trim())||"",c=((y=r==null?void 0:r.value)==null?void 0:y.trim())||"";if(!p){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:v,error:m}=await E.put(`/designs/${e}`,{name:p,description:c});i(),v?(I("Design updated.","success"),si()):I((m==null?void 0:m.message)||"Failed to update design.","error")})}function eu(e){return new Promise(t=>{var d,u;let s=document.getElementById("vs-switch-design-overlay");s&&s.remove();let n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=localStorage.getItem(Xn),i=document.createElement("div");i.id="vs-switch-design-overlay",i.className="vs-modal-overlay",i.innerHTML=`
      <div class="vs-modal" style="max-width: 480px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Switch Design</h2>
          <p class="vs-modal-desc">Switch to "${b(e)}"?</p>
          <label class="vs-modal-option" for="vs-switch-save-cb">
            <input type="checkbox" id="vs-switch-save-cb" ${o!=="false"?"checked":""}>
            <span class="vs-modal-option-check">${n}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-switch-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-switch-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Switch</button>
        </div>
      </div>
    `;let a=p=>{p.key==="Escape"&&(p.preventDefault(),r(null))},r=p=>{document.removeEventListener("keydown",a),we(i),t(p)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let l=document.getElementById("vs-switch-save-cb");ke(i,()=>r(null)),(d=document.getElementById("vs-switch-cancel"))==null||d.addEventListener("click",()=>r(null)),(u=document.getElementById("vs-switch-ok"))==null||u.addEventListener("click",()=>{let p=l?l.checked:!1;localStorage.setItem(Xn,p?"true":"false"),r({saveDesign:p})}),document.addEventListener("keydown",a),setTimeout(()=>{var p;return(p=document.getElementById("vs-switch-ok"))==null?void 0:p.focus()},220)})}async function ya(){var n;let e=await tu();if(!e)return;if(e.saveDesign&&e.designName){let o=await E.post("/designs",{name:e.designName,description:""});if(!o.ok){I(((n=o.error)==null?void 0:n.message)||"Failed to save design.","error");return}I("Design saved.","success")}let{ok:t,error:s}=await E.post("/designs/new",{skip_auto_save:!0});if(t){I("Workspace cleared. Start building.","success"),await $l(),P.set("messages",[]),P.set("activeConversationId",null),P.set("conversations",[]);try{localStorage.removeItem("vs-active-conversation")}catch{}window.location.hash!=="#/chat"?dt.navigate("chat"):dt.refresh()}else I((s==null?void 0:s.message)||"Failed to start new design.","error")}function tu(){return new Promise(e=>{var p,c;let t=document.getElementById("vs-new-design-overlay");t&&t.remove();let s=P.get("siteName")||"",n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=document.createElement("div");o.id="vs-new-design-overlay",o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Start New Design</h2>
          <p class="vs-modal-desc">This will clear your workspace for a fresh start.</p>
          <label class="vs-modal-option" for="vs-newdesign-save-cb">
            <input type="checkbox" id="vs-newdesign-save-cb" ${localStorage.getItem(Xn)!=="false"?"checked":""}>
            <span class="vs-modal-option-check">${n}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-body" id="vs-newdesign-name-row" style="${localStorage.getItem(Xn)==="false"?"display:none":""}">
          <label class="vs-input-label">Name</label>
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${ge(s)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;let i=v=>{v.key==="Escape"&&(v.preventDefault(),a(null))},a=v=>{document.removeEventListener("keydown",i),we(o),e(v)};document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let r=document.getElementById("vs-newdesign-save-cb"),l=document.getElementById("vs-newdesign-name-row"),d=document.getElementById("vs-newdesign-name"),u=()=>{r.checked?(l.style.display="",setTimeout(()=>d==null?void 0:d.focus(),80)):l.style.display="none"};r==null||r.addEventListener("change",u),d==null||d.addEventListener("keydown",v=>{var m;v.key==="Enter"&&(v.preventDefault(),(m=document.getElementById("vs-newdesign-ok"))==null||m.click())}),ke(o,()=>a(null)),(p=document.getElementById("vs-newdesign-cancel"))==null||p.addEventListener("click",()=>a(null)),(c=document.getElementById("vs-newdesign-ok"))==null||c.addEventListener("click",()=>{var g;let v=r?r.checked:!1,m=((g=d==null?void 0:d.value)==null?void 0:g.trim())||"";if(v&&!m){d==null||d.focus();return}localStorage.setItem(Xn,v?"true":"false"),a({saveDesign:v,designName:m})}),document.addEventListener("keydown",i),setTimeout(()=>{var v;r!=null&&r.checked&&d?d.select():(v=document.getElementById("vs-newdesign-ok"))==null||v.focus()},220)})}function kl(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${x.camera} Create Snapshot</h2>
        <p class="vs-modal-desc">Save a restore point of your current site state.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="snap-desc" type="text" class="vs-input w-full" placeholder="e.g. Before redesigning the header" autofocus>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="snap-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="snap-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${x.camera} Create Snapshot</button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>we(t);ke(t,s),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var d;let a=((d=n==null?void 0:n.value)==null?void 0:d.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:r,error:l}=await E.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),r?(I("Snapshot created.","success"),ti()):I((l==null?void 0:l.message)||"Failed to create snapshot.","error")})}function su(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${x.eye} Snapshot Details</h2>
      </div>
      <div class="vs-modal-body">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
          <span style="color: var(--vs-text-ghost);">Type</span>
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${n}; display: inline-block;"></span>
            ${o}
          </span>
          <span style="color: var(--vs-text-ghost);">Label</span>
          <span style="color: var(--vs-text-primary);">${b(e.label||"\u2014")}</span>
          <span style="color: var(--vs-text-ghost);">Description</span>
          <span style="color: var(--vs-text-primary);">${b(e.description||"\u2014")}</span>
          <span style="color: var(--vs-text-ghost);">Date</span>
          <span style="color: var(--vs-text-primary);">${e.date}</span>
          <span style="color: var(--vs-text-ghost);">Files</span>
          <span style="color: var(--vs-text-primary);">${e.files} files</span>
          <span style="color: var(--vs-text-ghost);">Size</span>
          <span style="color: var(--vs-text-primary);">${e.size}</span>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="snap-preview-close" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Close</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),ke(s,()=>we(s)),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>we(s))}async function $l(){var e,t;try{let s=await E.get("/pages");s.ok&&Array.isArray((e=s.data)==null?void 0:e.pages)&&P.set("pages",s.data.pages);let n=await E.get("/auth/session");n.ok&&((t=n.data)!=null&&t.site_name)&&(P.set("siteName",n.data.site_name),document.title=`Studio \u2014 ${n.data.site_name}`);let o=document.getElementById("preview-iframe");o&&(o.src=o.src)}catch(s){console.warn("[designs] Post-switch refresh failed:",s)}}var to=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},so=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},De=[],Re=null,Et=null,un=null,jt="",hs=!1,Zn="",wa="idle",Qn="list",ni=!1,Sl=800,nu=200;var Tl="vs-notes-list-width",Cl=80;function ou(){window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("notes",Gs)}async function Gs(){Et&&(clearTimeout(Et),Et=null,await Ea())}function iu(e){if(!e)return"";let t=b(e);return t=t.replace(/```(\w*)\n([\s\S]*?)```/g,(s,n,o)=>`<pre class="vs-note-code-block"><code>${o}</code></pre>`),t=t.replace(/`([^`]+)`/g,'<code class="vs-note-inline-code">$1</code>'),t=t.replace(/^### (.+)$/gm,'<h3 class="vs-note-h3">$1</h3>'),t=t.replace(/^## (.+)$/gm,'<h2 class="vs-note-h2">$1</h2>'),t=t.replace(/^# (.+)$/gm,'<h1 class="vs-note-h1">$1</h1>'),t=t.replace(/^&gt; (.+)$/gm,'<blockquote class="vs-note-blockquote">$1</blockquote>'),t=t.replace(/^---$/gm,'<hr class="vs-note-hr" />'),t=t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*(.+?)\*/g,"<em>$1</em>"),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" class="vs-note-link">$1</a>'),t=t.replace(/^- (.+)$/gm,'<li class="vs-note-li">$1</li>'),t=t.replace(/(<li class="vs-note-li">.*<\/li>\n?)+/g,'<ul class="vs-note-ul">$&</ul>'),t=t.replace(/^\d+\. (.+)$/gm,'<li class="vs-note-li-ol">$1</li>'),t=t.replace(/(<li class="vs-note-li-ol">.*<\/li>\n?)+/g,'<ol class="vs-note-ol">$&</ol>'),t=t.replace(/\n\n/g,'</p><p class="vs-note-p">'),t='<p class="vs-note-p">'+t+"</p>",t=t.replace(/<p class="vs-note-p">(<(?:h[1-3]|pre|blockquote|hr|ul|ol)[^>]*>)/g,"$1"),t=t.replace(/(<\/(?:h[1-3]|pre|blockquote|ul|ol)>)<\/p>/g,"$1"),t=t.replace(/<p class="vs-note-p"><\/p>/g,""),t}function ka(){return`
    <div class="vs-empty-state vs-empty-state--panel">
      <div class="vs-empty-state-inner">
        <div class="vs-empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <p class="vs-empty-state-title">Select a note</p>
      </div>
    </div>
  `}function Ml(){ou(),ni=!1,setTimeout(()=>au(),0);let e=parseInt(localStorage.getItem(Tl)||"320",10);return`
    <div id="vs-notes-root" class="vs-notes">
      <!-- Empty state (shown if no notes exist) -->
      <div id="vs-notes-empty" class="vs-notes-empty" style="display: none;">
        <div class="vs-empty-state vs-empty-state--inline">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <p class="vs-empty-state-title">Your thinking starts here</p>
            <p class="vs-empty-state-desc">Write ideas, draft copy, collect thoughts \u2014 then turn them into website content.</p>
            ${window.IS_DEMO?"":'<button id="btn-notes-first" class="vs-btn vs-btn-primary vs-btn-sm">Create your first note</button>'}
          </div>
        </div>
      </div>

      <!-- Split layout (shown when notes exist) -->
      <div id="vs-notes-split" class="vs-notes-split" style="display: none;">
        <!-- List Panel -->
        <div id="vs-notes-list-panel" class="vs-notes-list-panel" style="width: ${e}px;">
          <div class="vs-notes-list-header">
            <div class="vs-notes-list-title-group">
              <h2 class="vs-notes-list-title">Notes</h2>
              <span class="vs-notes-list-subtitle">Personal &amp; private</span>
            </div>
            ${window.IS_DEMO?"":`<button id="btn-note-new" class="vs-notes-new-btn" title="New note (\u2318N)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>`}
          </div>

          <div class="vs-notes-search-wrap">
            <svg class="vs-notes-search-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input id="notes-search" type="text" class="vs-notes-search" placeholder="Search notes\u2026" autocomplete="off" />
          </div>

          <div id="vs-notes-list" class="vs-notes-list">
            <div class="vs-notes-list-loading">Loading\u2026</div>
          </div>

          <!-- Resize Handle (absolutely positioned on right edge) -->
          <div id="vs-notes-resize" class="vs-notes-resize"></div>
        </div>

        <!-- Editor Panel -->
        <div id="vs-notes-editor-panel" class="vs-notes-editor-panel">
          <div id="vs-notes-editor-content" class="vs-notes-editor-content">
            ${ka()}
          </div>
        </div>
      </div>

      <!-- Mobile: Detail View (overlays list) -->
      <div id="vs-notes-mobile-detail" class="vs-notes-mobile-detail" style="display: none;"></div>
    </div>
  `}async function au(){ni||(ni=!0,await Il(),cu())}async function Il(){let e;if(jt?e=await E.get(`/notes/search?q=${encodeURIComponent(jt)}`):e=await E.get("/notes"),!e.ok){I("Could not load notes.","error");return}if(De=e.data.notes||[],ts(),oi(),Re){let t=De.find(s=>s.id===Re);t?window.matchMedia("(max-width: 767px)").matches?(Qn="detail",Al(t)):_l(t,{restoring:!0}):Re=null}}function oi(){let e=document.getElementById("vs-notes-empty"),t=document.getElementById("vs-notes-split");if(!e||!t)return;let s=window.matchMedia("(max-width: 767px)").matches;De.length===0&&!jt?(e.style.display="flex",t.style.display="none"):(e.style.display="none",t.style.display=s?"block":"flex")}function ts(){let e=document.getElementById("vs-notes-list");if(!e)return;if(De.length===0){jt?e.innerHTML=`
        <div class="vs-notes-no-results">No notes matching "${b(jt)}"</div>
      `:e.innerHTML="";return}let t=De.filter(o=>o.pinned==1),s=De.filter(o=>o.pinned!=1),n="";t.length>0&&!jt&&(n+='<div class="vs-notes-section-label">Pinned</div>',n+=t.map(o=>Ll(o)).join(""),s.length>0&&(n+='<div class="vs-notes-section-label vs-notes-section-label--rest">Notes</div>')),n+=s.map(o=>Ll(o)).join(""),e.innerHTML=n,e.querySelectorAll("[data-note-id]").forEach(o=>{o.addEventListener("click",()=>{let i=parseInt(o.dataset.noteId,10);ii(i)}),o.addEventListener("contextmenu",i=>{i.preventDefault(),du(i,parseInt(o.dataset.noteId,10))})})}function Ll(e){let t=e.id===Re,s=e.pinned==1,n=e.title||"Untitled",o=ru(e.body),i=Bn(e.updated_at);return`
    <div class="vs-note-item ${t?"vs-note-item--active":""}"
         data-note-id="${e.id}" tabindex="0" role="button">
      <div class="vs-note-item-top">
        ${s?'<span class="vs-note-pin" title="Pinned">\u{1F4CC}</span>':""}
        <span class="vs-note-item-title">${b(n)}</span>
      </div>
      ${o?`<div class="vs-note-item-preview">${lu(b(o))}</div>`:""}
      <div class="vs-note-item-time">${i}</div>
    </div>
  `}function ru(e){if(!e)return"";let t=e.replace(/^#{1,3} /gm,"").replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1").replace(/`([^`]+)`/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^[-*] /gm,"").replace(/^\d+\. /gm,"").replace(/^> /gm,"").replace(/\n/g," ").trim();return t.length>Cl?t.substring(0,Cl).trim()+"\u2026":t}function lu(e){if(!jt)return e;let t=jt.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return e.replace(new RegExp(`(${t})`,"gi"),"<mark>$1</mark>")}async function ii(e){if(e===Re)return;await Gs(),Re=e,hs=!1,wa="idle",document.querySelectorAll(".vs-note-item").forEach(n=>{n.classList.toggle("vs-note-item--active",parseInt(n.dataset.noteId,10)===e)});let t=De.find(n=>n.id===e);if(!t)return;window.matchMedia("(max-width: 767px)").matches?(Qn="detail",Al(t)):_l(t)}async function Bl(){if(await Gs(),Re=null,hs=!1,wa="idle",ts(),window.matchMedia("(max-width: 767px)").matches&&Qn==="detail"){Qn="list";let t=document.getElementById("vs-notes-mobile-detail");t&&(t.style.display="none")}else{let t=document.getElementById("vs-notes-editor-content");t&&(t.innerHTML=ka())}}function _l(e,t={}){let s=document.getElementById("vs-notes-editor-content");if(!s)return;let n=e.pinned==1;s.innerHTML=`
    <div class="vs-note-editor">
      <!-- Toolbar -->
      <div class="vs-note-toolbar">
        <div class="vs-note-toolbar-left">
          ${window.IS_DEMO?'<span class="vs-note-save-status vs-note-save-status--readonly">Read-only</span>':""}
        </div>
        <div class="vs-note-toolbar-right">
          ${window.IS_DEMO?"":`<button id="btn-note-pin" class="vs-note-toolbar-btn ${n?"vs-note-toolbar-btn--active":""}"
                  title="${n?"Unpin":"Pin"}" aria-label="${n?"Unpin note":"Pin note"}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="${n?"currentColor":"none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
          </button>`}
          <button id="btn-note-preview" class="vs-note-toolbar-btn"
                  title="Preview Markdown (\u2318\u21E7P)" aria-label="Preview Markdown">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button id="btn-note-send-chat" class="vs-note-toolbar-btn"
                  title="Send to Chat (\u2318\u21E7C)" aria-label="Send to Chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
          ${window.IS_DEMO?"":`<button id="btn-note-board" class="vs-note-toolbar-btn"
                  title="Add to Board" aria-label="Add to Board">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          </button>`}
          ${window.IS_DEMO?"":`<button id="btn-note-delete" class="vs-note-toolbar-btn vs-note-toolbar-btn--danger"
                  title="Delete note (\u2318\u232B)" aria-label="Delete note">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>`}
        </div>
      </div>

      <!-- Editor Body -->
      <div class="vs-note-editor-body">
        <input id="vs-note-title" class="vs-note-title-input" type="text"
               value="${b(e.title)}" placeholder="Untitled"
               autocomplete="off" spellcheck="true" ${window.IS_DEMO?"readonly":""} />
        <div id="vs-note-body-wrap" class="vs-note-body-wrap">
          <textarea id="vs-note-body" class="vs-note-body-textarea"
                    placeholder="${window.IS_DEMO?"Read-only in demo mode.":"Start writing\u2026"}" spellcheck="true" ${window.IS_DEMO?"readonly":""}>${b(e.body)}</textarea>
        </div>
      </div>
    </div>
  `,Pl(e);let o=document.getElementById("vs-note-body");o&&(eo(o),t.restoring||setTimeout(()=>{o.focus(),o.setSelectionRange(o.value.length,o.value.length)},50))}function Al(e){let t=document.getElementById("vs-notes-mobile-detail");if(!t)return;let s=e.pinned==1;t.style.display="flex",t.innerHTML=`
    <div class="vs-note-mobile-header">
      <button id="btn-note-back" class="vs-note-mobile-back" aria-label="Back to notes">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Notes
      </button>
      <div class="vs-note-mobile-actions">
        ${window.IS_DEMO?'<span class="vs-note-save-status vs-note-save-status--readonly">Read-only</span>':""}
        ${window.IS_DEMO?"":`<button id="btn-note-pin" class="vs-note-toolbar-btn ${s?"vs-note-toolbar-btn--active":""}">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="${s?"currentColor":"none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
        </button>`}
        ${window.IS_DEMO?"":`<button id="btn-note-delete" class="vs-note-toolbar-btn vs-note-toolbar-btn--danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>`}
      </div>
    </div>
    <div class="vs-note-editor-body">
      <input id="vs-note-title" class="vs-note-title-input" type="text"
             value="${b(e.title)}" placeholder="Untitled"
             autocomplete="off" spellcheck="true" ${window.IS_DEMO?"readonly":""} />
      <div id="vs-note-body-wrap" class="vs-note-body-wrap">
        <textarea id="vs-note-body" class="vs-note-body-textarea"
                  placeholder="${window.IS_DEMO?"Read-only in demo mode.":"Start writing\u2026"}" spellcheck="true" ${window.IS_DEMO?"readonly":""}>${b(e.body)}</textarea>
      </div>
    </div>
  `,Pl(e);let n=document.getElementById("btn-note-back");n==null||n.addEventListener("click",async()=>{await Gs(),Qn="list",t.style.display="none",Re=null,ts()});let o=document.getElementById("vs-note-body");o&&(eo(o),setTimeout(()=>o.focus(),50))}function Pl(e){let t=document.getElementById("vs-note-title"),s=document.getElementById("vs-note-body"),n=()=>{Et&&clearTimeout(Et),Et=setTimeout(()=>Ea(),Sl)};t==null||t.addEventListener("input",n),s==null||s.addEventListener("input",()=>{eo(s),n()});let o=document.getElementById("btn-note-pin");o==null||o.addEventListener("click",async()=>{if(to()||so())return;let d=e.pinned==1,{ok:u,data:p}=await E.put(`/notes/${e.id}`,{pinned:d?0:1});if(u&&p.note){e.pinned=p.note.pinned;let c=De.findIndex(m=>m.id===e.id);c>=0&&(De[c]={...De[c],...p.note}),o.classList.toggle("vs-note-toolbar-btn--active",p.note.pinned==1);let v=o.querySelector("svg");v&&v.setAttribute("fill",p.note.pinned==1?"currentColor":"none"),ts(),p.pin_limit&&I(p.pin_limit_message||"You can pin up to 5 notes.","info")}});let i=document.getElementById("btn-note-preview");i==null||i.addEventListener("click",Rl);let a=document.getElementById("btn-note-send-chat");a==null||a.addEventListener("click",()=>La());let r=document.getElementById("btn-note-board");r==null||r.addEventListener("click",()=>Dl(e));let l=document.getElementById("btn-note-delete");l==null||l.addEventListener("click",()=>$a(e.id))}async function Ea(){if(!Re||window.IS_DEMO)return;let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");if(!e&&!t)return;let s=(e==null?void 0:e.value)??"",n=(t==null?void 0:t.value)??"",{ok:o,data:i}=await E.put(`/notes/${Re}`,{title:s,body:n});if(o&&(i!=null&&i.note)){let a=De.findIndex(r=>r.id===Re);a>=0&&(De[a]={...De[a],...i.note}),ts()}}async function xa(){if(to()||so())return;let{ok:e,data:t}=await E.post("/notes",{title:"",body:""});e&&(t!=null&&t.note)&&(De.unshift(t.note),ts(),oi(),ii(t.note.id))}async function $a(e){if(to()||so())return;let{ok:t}=await E.delete(`/notes/${e}`);if(!t){I("Could not delete note.","error");return}if(De=De.filter(n=>n.id!==e),Re===e){Re=null,hs=!1,wa="idle";let n=document.getElementById("vs-notes-editor-content");n&&(n.innerHTML=ka())}ts(),oi(),Dn("Note deleted","Undo",async()=>{var o;let n=await E.post(`/notes/${e}/restore`);n.ok&&((o=n.data)!=null&&o.note)&&(De.unshift(n.data.note),ts(),oi(),ii(n.data.note.id),I("Note restored.","success"))},"info");let s=document.getElementById("vs-notes-mobile-detail");s&&(s.style.display="none")}function Rl(){let e=document.getElementById("vs-note-body-wrap"),t=document.getElementById("btn-note-preview");if(e)if(hs){hs=!1,e.innerHTML=`<textarea id="vs-note-body" class="vs-note-body-textarea"
                    placeholder="Start writing\u2026" spellcheck="true">${b(Zn)}</textarea>`;let s=document.getElementById("vs-note-body");s&&(eo(s),s.addEventListener("input",()=>{eo(s),Et&&clearTimeout(Et),Et=setTimeout(()=>Ea(),Sl)}),s.focus()),t==null||t.classList.remove("vs-note-toolbar-btn--active")}else{let s=document.getElementById("vs-note-body");if(!s)return;Zn=s.value,hs=!0;let n=iu(Zn);e.innerHTML=`<div id="vs-note-preview" class="vs-note-preview">${n}</div>`,t==null||t.classList.add("vs-note-toolbar-btn--active")}}function Ca(){let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");return{title:(e==null?void 0:e.value)??"",body:hs?Zn:(t==null?void 0:t.value)??""}}async function La(e){await Gs();let t,s;e?(t=e.title||"",s=e.body||""):{title:t,body:s}=Ca();let o=`Here is my note "${t||"Untitled"}":

${s}

`;window.location.hash="#/chat",setTimeout(()=>{let i=document.getElementById("prompt-input");i&&(i.value=o,i.focus(),i.style.height="auto",i.style.height=i.scrollHeight+"px")},150)}async function Dl(e){if(to()||so())return;await Gs();let t,s,n;e?(t=e.title||"",s=e.body||"",n=e.id):({title:t,body:s}=Ca(),n=Re);let{ok:o,error:i}=await E.post("/cards",{title:t||"Untitled",body:s,column_name:"todo",source_note_id:n});o?I("Card added to Board.","success"):I((i==null?void 0:i.message)||"Failed to add card.","error")}function du(e,t){var a;(a=document.getElementById("vs-note-ctx"))==null||a.remove();let s=De.find(r=>r.id===t);if(!s)return;let n=s.pinned==1,o=document.createElement("div");o.id="vs-note-ctx",o.className="vs-note-context-menu",o.style.left=`${e.clientX}px`,o.style.top=`${e.clientY}px`,o.innerHTML=`
    ${window.IS_DEMO?"":`<button data-action="pin" class="vs-note-ctx-item">
      ${n?"Unpin":"Pin"}
    </button>`}
    <button data-action="send" class="vs-note-ctx-item">
      Send to Chat
    </button>
    <button data-action="use" class="vs-note-ctx-item">
      Use as Prompt
    </button>
    ${window.IS_DEMO?"":`<button data-action="board" class="vs-note-ctx-item">
      Add to Board
    </button>`}
    ${window.IS_DEMO?"":`<div class="vs-note-ctx-divider"></div>
    <button data-action="delete" class="vs-note-ctx-item vs-note-ctx-item--danger">
      Delete
    </button>`}
  `,document.body.appendChild(o),requestAnimationFrame(()=>{let r=o.getBoundingClientRect();r.right>window.innerWidth&&(o.style.left=`${window.innerWidth-r.width-8}px`),r.bottom>window.innerHeight&&(o.style.top=`${window.innerHeight-r.height-8}px`)}),o.addEventListener("click",async r=>{var d;let l=(d=r.target.closest("[data-action]"))==null?void 0:d.dataset.action;if(l)switch(o.remove(),l){case"pin":{if(to()||so())return;let u=n?0:1,{ok:p,data:c}=await E.put(`/notes/${t}`,{pinned:u});if(p&&c.note){let v=De.findIndex(m=>m.id===t);v>=0&&(De[v]={...De[v],...c.note}),ts(),c.pin_limit&&I(c.pin_limit_message||"You can pin up to 5 notes.","info")}break}case"send":{La(t!==Re?s:void 0);break}case"use":{await Gs();let u=t===Re?Ca().body:s.body||"";window.location.hash="#/chat",setTimeout(()=>{let p=document.getElementById("prompt-input");p&&(p.value=u,p.focus(),p.style.height="auto",p.style.height=p.scrollHeight+"px")},150);break}case"delete":$a(t);break;case"board":Dl(s);break}});let i=r=>{o.contains(r.target)||(o.remove(),document.removeEventListener("click",i))};setTimeout(()=>document.addEventListener("click",i),0)}function cu(){let e=document.getElementById("btn-note-new");e==null||e.addEventListener("click",xa);let t=document.getElementById("btn-notes-first");t==null||t.addEventListener("click",xa);let s=document.getElementById("notes-search");s==null||s.addEventListener("input",()=>{un&&clearTimeout(un),un=setTimeout(()=>{jt=s.value.trim(),Il()},nu)});let n=document.getElementById("vs-notes-list-panel");n==null||n.addEventListener("click",o=>{o.target.closest(".vs-note-item")||o.target.closest("button")||o.target.closest("input")||o.target.closest(".vs-notes-section-label")||Re&&Bl()}),document.addEventListener("keydown",Hl),pu()}function Hl(e){var n,o,i;if(P.get("route")!=="notes")return;let s=navigator.platform.toUpperCase().includes("MAC")?e.metaKey:e.ctrlKey;if(s&&e.key==="n"){e.preventDefault(),xa();return}if(s&&e.key==="Backspace"&&Re){e.preventDefault(),$a(Re);return}if(s&&e.shiftKey&&e.key==="p"){e.preventDefault(),Re&&Rl();return}if(s&&e.shiftKey&&(e.key==="c"||e.key==="C")){e.preventDefault();let a=De.find(r=>r.id===Re);a&&La(a);return}if(e.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;Re&&Bl();return}if((e.key==="ArrowUp"||e.key==="ArrowDown")&&!e.metaKey&&!e.ctrlKey){let a=(n=document.activeElement)==null?void 0:n.closest(".vs-note-item");if(!a)return;e.preventDefault();let r=[...document.querySelectorAll(".vs-note-item")],l=r.indexOf(a),d=e.key==="ArrowDown"?Math.min(l+1,r.length-1):Math.max(l-1,0);(o=r[d])==null||o.focus()}if(e.key==="Enter"){let a=(i=document.activeElement)==null?void 0:i.closest(".vs-note-item");a&&(e.preventDefault(),ii(parseInt(a.dataset.noteId,10)))}}function pu(){let e=document.getElementById("vs-notes-resize"),t=document.getElementById("vs-notes-list-panel");if(!e||!t)return;let s,n;e.addEventListener("mousedown",o=>{o.preventDefault(),s=o.clientX,n=t.offsetWidth;let i=r=>{let l=Math.max(200,Math.min(500,n+r.clientX-s));t.style.width=`${l}px`},a=()=>{document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",a),localStorage.setItem(Tl,String(t.offsetWidth))};document.addEventListener("mousemove",i),document.addEventListener("mouseup",a)})}function eo(e){if(!e)return;e.style.height="auto";let t=window.innerHeight-200;e.style.height=Math.min(t,e.scrollHeight)+"px"}function Nl(){var e,t;document.removeEventListener("keydown",Hl),Et&&(clearTimeout(Et),Et=null),un&&(clearTimeout(un),un=null),jt="",hs=!1,Zn="",ni=!1,(e=window.__vsFlushCallbacks)==null||e.delete("notes"),(t=document.getElementById("vs-note-ctx"))==null||t.remove()}var ai=!1,bs=null,qe=null,ri=null,no=null,ys=null,ao=[{id:"todo",label:"To Do",dotColor:"var(--vs-text-ghost)"},{id:"in_progress",label:"In Progress",dotColor:"var(--vs-accent)"},{id:"done",label:"Done",dotColor:"var(--vs-success)"}];function vn(){var t;let e=(t=P.get("user"))==null?void 0:t.role;return e==="owner"||e==="editor"}function Sa(){return ai=!1,qe=null,setTimeout(()=>{hu(),pt()},0),`
    <div class="vs-board" id="board-root">
      <div class="vs-board-header">
        <h1 class="vs-board-title">Board</h1>
        ${vn()?`
          <button id="btn-board-add" class="vs-btn vs-btn-primary vs-btn-sm">
            New Card
          </button>
        `:""}
      </div>
      <div class="vs-board-columns" id="board-columns">
        ${ao.map(t=>`
          <div class="vs-board-column" data-column="${t.id}" id="col-${t.id}">
            <div class="vs-board-column-header">
              <span class="vs-board-column-label">${t.label}</span>
              <span class="vs-board-column-count" data-count="${t.id}">0</span>
            </div>
            <div class="vs-board-column-cards" data-col-cards="${t.id}">
              <div class="vs-board-loading">Loading\u2026</div>
            </div>
          </div>
        `).join("")}
      </div>
      <div id="board-archived-link" class="vs-board-archived-link hidden"></div>
    </div>
  `}async function pt(){var o;let{ok:e,data:t}=await E.get("/cards");if(!e){I("Failed to load board.","error");return}let s=(t==null?void 0:t.cards)||[];P.set("cards",s),P.set("cardsLoaded",!0),uu(s);let n=await E.get("/cards/archived");if(n.ok){let i=((o=n.data)==null?void 0:o.cards)||[];fu(i.length)}}function uu(e){let t=vn();for(let s of ao){let n=e.filter(a=>a.column_name===s.id),o=document.querySelector(`[data-col-cards="${s.id}"]`),i=document.querySelector(`[data-count="${s.id}"]`);if(i&&(i.textContent=n.length),!!o){if(n.length===0){s.id==="todo"&&e.length===0?o.innerHTML=t?`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0 0 12px;">Your board is empty</p>
              <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 16px;">Add your first task or promote a note from the Notes section.</p>
              <button class="vs-btn vs-btn-ghost vs-btn-sm board-empty-add">Add a card</button>
            </div>`:`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0;">No tasks on the board yet.</p>
            </div>`:t?o.innerHTML='<div class="vs-board-drop-zone">Drop a card here</div>':o.innerHTML="";continue}if(o.innerHTML=n.map(a=>a.id===qe?ql(a,s,t):vu(a,s,t)).join(""),qe){let a=o.querySelector(`[data-card-id="${qe}"].vs-board-card-expanded`);a&&t&&Fl(a,qe)}}}}function vu(e,t,s){let n=e.body?`<div class="vs-board-card-body">${b(e.body.substring(0,200))}</div>`:"",o=e.linked_page?`<div class="vs-board-card-footer"><span class="vs-board-card-link" data-page="${ge(e.linked_page)}"><span class="vs-board-card-link-icon">${x.link}</span>${b(Wl(e.linked_page))}</span></div>`:"";return`
    <div class="vs-board-card ${s?"vs-board-card-draggable":""}"
         data-card-id="${e.id}"
         data-column="${e.column_name}"
         ${s?'draggable="true"':""}>
      <div class="vs-board-card-title">
        <span class="vs-status-dot" style="background: ${t.dotColor};"></span>
        <span class="vs-board-card-title-text">${b(e.title||"Untitled")}</span>
        ${s?`
          <button class="vs-board-card-menu-btn" data-card-menu="${e.id}" title="Card actions">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        `:""}
      </div>
      ${n}
      ${o}
    </div>
  `}function ql(e,t,s){let n=P.get("pages")||[];return s?`
    <div class="vs-board-card vs-board-card-expanded vs-board-card-editing"
         data-card-id="${e.id}" data-column="${e.column_name}">
      <div class="vs-board-card-expand-header">
        <input type="text"
               class="vs-board-inline-title"
               data-field="title"
               data-card-id="${e.id}"
               value="${ge(e.title)}"
               placeholder="Card title" />
        <button class="vs-board-card-close-btn" data-card-close="${e.id}" title="Close (Esc)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <textarea class="vs-board-inline-body"
                data-field="body"
                data-card-id="${e.id}"
                rows="3"
                placeholder="Add details\u2026">${b(e.body||"")}</textarea>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label">Column</label>
        <select class="vs-board-inline-select" data-field="column" data-card-id="${e.id}">
          ${ao.map(o=>`<option value="${o.id}" ${o.id===e.column_name?"selected":""}>${o.label}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label">Linked page</label>
        <select class="vs-board-inline-select" data-field="linked_page" data-card-id="${e.id}">
          <option value="">None</option>
          ${n.map(o=>`<option value="${ge(o.slug)}" ${o.slug===e.linked_page?"selected":""}>${b(o.title||o.slug)}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-card-expand-footer">
        <div class="vs-board-card-actions">
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-card-archive="${e.id}" title="Archive this card">
            ${x.archive}
            Archive
          </button>
          <button class="vs-btn vs-btn-danger vs-btn-xs" data-card-delete="${e.id}" title="Permanently delete">
            ${x.trash}
            Delete
          </button>
        </div>
        <div class="vs-board-card-meta">
          Created ${io(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${io(e.updated_at)}`:""}
        </div>
      </div>
    </div>
  `:`
      <div class="vs-board-card vs-board-card-expanded"
           data-card-id="${e.id}" data-column="${e.column_name}">
        <div class="vs-board-card-expand-header">
          <div class="vs-board-card-title">
            <span class="vs-status-dot" style="background: ${t.dotColor};"></span>
            <span class="vs-board-card-title-text">${b(e.title||"Untitled")}</span>
          </div>
          <button class="vs-board-card-close-btn" data-card-close="${e.id}" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        ${e.body?`<div class="vs-board-card-body-full">${b(e.body)}</div>`:'<div class="vs-board-card-body-empty">No description.</div>'}
        ${e.linked_page?`
          <div class="vs-board-card-footer">
            <span class="vs-board-card-link" data-page="${ge(e.linked_page)}"><span class="vs-board-card-link-icon">${x.link}</span>${b(Wl(e.linked_page))}</span>
          </div>
        `:""}
        <div class="vs-board-card-meta">
          Created ${io(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${io(e.updated_at)}`:""}
        </div>
      </div>
    `}function Fl(e,t){let s=e.querySelector('[data-field="title"]'),n=e.querySelector('[data-field="body"]'),o=e.querySelector('[data-field="column"]'),i=e.querySelector('[data-field="linked_page"]');s==null||s.addEventListener("input",()=>{jl(t,{title:s.value.trim()})}),n==null||n.addEventListener("input",()=>{Ol(n),jl(t,{body:n.value})}),o==null||o.addEventListener("change",async()=>{if(window.IS_DEMO){return}let a=o.value;let{ok:r}=await E.put(`/cards/${t}/move`,{column_name:a,position:0});r?(qe=null,await pt()):void 0}),i==null||i.addEventListener("change",async()=>{if(window.IS_DEMO){return}let{ok:a}=await E.put(`/cards/${t}`,{linked_page:i.value||null});}),n&&Ol(n)}function jl(e,t){ys&&ys.cardId===e?Object.assign(ys.fields,t):ys={cardId:e,fields:{...t}},clearTimeout(ri),ri=setTimeout(()=>li(),600)}async function li(){if(clearTimeout(ri),ri=null,!ys){no&&await no;return}let{cardId:e,fields:t}=ys;if(ys=null,window.IS_DEMO){return}no=E.put(`/cards/${e}`,t);let{ok:s}=await no;no=null}function Ol(e){e.style.height="auto",e.style.height=Math.max(60,e.scrollHeight)+"px"}async function mu(e){qe&&qe!==e&&await di();let{ok:t,data:s}=await E.get(`/cards/${e}`);if(!t||!(s!=null&&s.card)){I("Card not found.","error");return}qe=e;let n=s.card,o=ao.find(d=>d.id===n.column_name)||ao[0],i=vn(),a=document.querySelector(`[data-card-id="${e}"]`);if(!a)return;let r=ql(n,o,i);a.outerHTML=r;let l=document.querySelector(`[data-card-id="${e}"]`);l&&i&&(Fl(l,e),setTimeout(()=>{var d;return(d=l.querySelector(".vs-board-inline-title"))==null?void 0:d.focus()},50)),l==null||l.scrollIntoView({behavior:"smooth",block:"nearest"})}async function di(){qe&&(await li(),qe=null,await pt())}function gu(e,t){oo();let s=document.createElement("div");s.className="vs-board-card-dropdown",s.id="vs-board-card-dropdown",s.innerHTML=`
    <button class="vs-board-card-dropdown-item" data-action="archive" data-id="${e}">
      ${x.archive}
      Archive
    </button>
    <div class="vs-board-card-dropdown-divider"></div>
    <button class="vs-board-card-dropdown-item vs-board-card-dropdown-danger" data-action="delete" data-id="${e}">
      ${x.trash}
      Delete
    </button>
  `;let n=t.getBoundingClientRect();s.style.position="fixed",s.style.top=`${n.bottom+4}px`,s.style.right=`${window.innerWidth-n.right}px`,s.style.zIndex="1000",document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let o=a=>{!s.contains(a.target)&&a.target!==t&&(oo(),document.removeEventListener("click",o))};setTimeout(()=>document.addEventListener("click",o),10);let i=a=>{a.key==="Escape"&&(oo(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i),s.addEventListener("click",async a=>{let r=a.target.closest("[data-action]");if(!r)return;let l=r.dataset.action,d=parseInt(r.dataset.id,10);if(oo(),l==="archive"){if(window.IS_DEMO){I("Demo mode \u2014 this action is disabled.","warning");return}let{ok:u}=await E.post(`/cards/${d}/archive`);u&&(qe===d&&(qe=null),Dn("Card archived.","Undo",async()=>{await E.post(`/cards/${d}/restore`),await pt()}),await pt())}else if(l==="delete"){if(window.IS_DEMO){I("Demo mode \u2014 this action is disabled.","warning");return}if(!await Ce({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:p}=await E.delete(`/cards/${d}`);p&&(qe===d&&(qe=null),I("Card deleted.","success"),await pt())}})}function oo(){let e=document.getElementById("vs-board-card-dropdown");e&&e.remove()}function fu(e){let t=document.getElementById("board-archived-link");if(t){if(e===0){t.classList.add("hidden");return}t.classList.remove("hidden"),t.innerHTML=`<button class="vs-board-show-archived">${x.archive||""} Archived (${e})</button>`}}function hu(){var s,n;if(ai)return;ai=!0;let e=vn();(s=document.getElementById("btn-board-add"))==null||s.addEventListener("click",Vl);let t=document.getElementById("board-columns");t&&(t.addEventListener("click",bu),e&&ku(t)),(n=document.getElementById("board-archived-link"))==null||n.addEventListener("click",o=>{o.target.closest(".vs-board-show-archived")&&Eu()}),document.addEventListener("keydown",zl),document.addEventListener("mousedown",Ul),wu(),window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("board",()=>li())}function bu(e){let t=e.target;if(t.closest(".board-empty-add")){Vl();return}let s=t.closest("[data-card-menu]");if(s){e.stopPropagation();let l=parseInt(s.dataset.cardMenu,10);gu(l,s);return}if(t.closest("[data-card-close]")){e.stopPropagation(),di();return}let o=t.closest("[data-card-archive]");if(o){e.stopPropagation(),yu(parseInt(o.dataset.cardArchive,10));return}let i=t.closest("[data-card-delete]");if(i){e.stopPropagation(),xu(parseInt(i.dataset.cardDelete,10));return}let a=t.closest(".vs-board-card-link");if(a){e.stopPropagation();let l=a.dataset.page;l&&$u(l);return}if(t.closest("input, textarea, select, button"))return;let r=t.closest(".vs-board-card");if(r&&!r.classList.contains("vs-board-card-expanded")){let l=parseInt(r.dataset.cardId,10);mu(l);return}}function zl(e){if(e.key==="Escape"&&qe){if(document.querySelector(".vs-modal-overlay"))return;e.preventDefault(),di()}}function Ul(e){if(!qe)return;let t=e.target,s=document.querySelector(".vs-board-card-expanded");s&&s.contains(t)||t.closest(".vs-modal-overlay")||t.closest(".vs-board-card-dropdown")||di()}async function yu(e){if(window.IS_DEMO){I("Demo mode \u2014 this action is disabled.","warning");return}let{ok:t}=await E.post(`/cards/${e}/archive`);t&&(qe=null,Dn("Card archived.","Undo",async()=>{await E.post(`/cards/${e}/restore`),await pt()}),await pt())}async function xu(e){if(window.IS_DEMO){I("Demo mode \u2014 this action is disabled.","warning");return}if(!await Ce({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:s}=await E.delete(`/cards/${e}`);s&&(qe=null,I("Card deleted.","success"),await pt())}function Vl(){var a,r,l;let e=document.getElementById("vs-board-create-overlay");e&&e.remove();let t=P.get("pages")||[],s=document.createElement("div");s.id="vs-board-create-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 440px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">New Card</h2>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1" for="card-new-title">Title</label>
            <input type="text" id="card-new-title" class="vs-input w-full" placeholder="What needs doing?" autofocus />
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1" for="card-new-column">Column</label>
            <select id="card-new-column" class="vs-input w-full">
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1" for="card-new-page">Link a page <span class="text-vs-text-ghost">(optional)</span></label>
            <select id="card-new-page" class="vs-input w-full">
              <option value="">None</option>
              ${t.map(d=>`<option value="${ge(d.slug)}">${b(d.title||d.slug)}</option>`).join("")}
            </select>
          </div>
          <div id="card-create-error" class="hidden text-sm" style="color: var(--vs-error);"></div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="btn-card-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="btn-card-create" class="vs-btn vs-btn-primary vs-btn-sm">Create</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>we(s);ke(s,n),(a=document.getElementById("btn-card-cancel"))==null||a.addEventListener("click",n);let o=d=>{d.key==="Escape"&&(d.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),(r=document.getElementById("card-new-title"))==null||r.addEventListener("keydown",d=>{var u;d.key==="Enter"&&((u=document.getElementById("btn-card-create"))==null||u.click())}),(l=document.getElementById("btn-card-create"))==null||l.addEventListener("click",async()=>{var y,f,h,$;let d=(f=(y=document.getElementById("card-new-title"))==null?void 0:y.value)==null?void 0:f.trim(),u=(h=document.getElementById("card-new-column"))==null?void 0:h.value,p=(($=document.getElementById("card-new-page"))==null?void 0:$.value)||null,c=document.getElementById("card-create-error"),v=document.getElementById("btn-card-create");if(!d){c&&(c.textContent="Please enter a card title.",c.classList.remove("hidden"));return}if(v.disabled=!0,v.textContent="Creating\u2026",window.IS_DEMO){n(),I("Demo mode \u2014 this action is disabled.","warning");return}let{ok:m,error:g}=await E.post("/cards",{title:d,column_name:u,linked_page:p});m?(n(),I("Card created.","success"),await pt()):(v.disabled=!1,v.textContent="Create",c&&(c.textContent=(g==null?void 0:g.message)||"Failed to create card.",c.classList.remove("hidden")))}),setTimeout(()=>{var d;return(d=document.getElementById("card-new-title"))==null?void 0:d.focus()},80)}async function wu(){if((P.get("pages")||[]).length>0)return;let{ok:t,data:s}=await E.get("/pages");t&&Array.isArray(s==null?void 0:s.pages)&&P.set("pages",s.pages)}function ku(e){e.addEventListener("dragstart",t=>{let s=t.target.closest(".vs-board-card");!s||s.classList.contains("vs-board-card-expanded")||(bs={cardId:parseInt(s.dataset.cardId,10),sourceColumn:s.dataset.column},s.classList.add("vs-board-card-dragging"),t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",s.dataset.cardId))}),e.addEventListener("dragend",t=>{let s=t.target.closest(".vs-board-card");s&&s.classList.remove("vs-board-card-dragging"),bs=null,e.querySelectorAll(".vs-board-drop-indicator").forEach(n=>n.remove())}),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer.dropEffect="move";let s=t.target.closest("[data-col-cards]");if(!s)return;e.querySelectorAll(".vs-board-drop-indicator").forEach(r=>r.remove());let n=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")],o=t.clientY,i=null;for(let r of n){let l=r.getBoundingClientRect();if(o<l.top+l.height/2){i=r;break}}let a=document.createElement("div");a.className="vs-board-drop-indicator",i?s.insertBefore(a,i):s.appendChild(a)}),e.addEventListener("drop",async t=>{if(t.preventDefault(),!bs)return;let s=t.target.closest("[data-col-cards]");if(!s)return;let n=s.dataset.colCards,i=(P.get("cards")||[]).filter(p=>p.column_name===n&&p.id!==bs.cardId).sort((p,c)=>p.position-c.position),a=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")].map(p=>({id:parseInt(p.dataset.cardId,10),rect:p.getBoundingClientRect()})),r=t.clientY,l=a.length;for(let p=0;p<a.length;p++)if(r<a[p].rect.top+a[p].rect.height/2){l=p;break}let d;if(i.length===0||l===0?d=0:l>=i.length?d=i[i.length-1].position+1e3:d=Math.floor((i[l-1].position+i[l].position)/2),e.querySelectorAll(".vs-board-drop-indicator").forEach(p=>p.remove()),window.IS_DEMO){await pt(),bs=null;return}let{ok:u}=await E.put(`/cards/${bs.cardId}/move`,{column_name:n,position:d});u?await pt():I("Failed to move card.","error"),bs=null})}async function Eu(){var r;let{ok:e,data:t}=await E.get("/cards/archived");if(!e){I("Failed to load archived cards.","error");return}let s=(t==null?void 0:t.cards)||[],n=vn(),o=document.getElementById("vs-board-archived-overlay");o&&o.remove();let i=document.createElement("div");i.id="vs-board-archived-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">Archived Cards</h2>
      </div>
      <div class="vs-modal-body" style="max-height: 60vh; overflow-y: auto;">
        ${s.length===0?'<p style="font-size: 13px; color: var(--vs-text-ghost);">No archived cards.</p>':s.map(l=>`
            <div class="vs-board-archived-item" data-card-id="${l.id}">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${b(l.title||"Untitled")}</div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 2px;">Archived ${io(l.updated_at)}</div>
              </div>
              ${n?`
                <div class="flex gap-2">
                  <button class="vs-btn vs-btn-ghost vs-btn-xs archived-restore-btn" data-id="${l.id}">Restore</button>
                  <button class="vs-btn vs-btn-ghost vs-btn-xs archived-delete-btn" data-id="${l.id}" style="color: var(--vs-error);">Delete</button>
                </div>
              `:""}
            </div>
          `).join("")}
      </div>
      <div class="vs-modal-footer">
        <button id="btn-archived-close" class="vs-btn vs-btn-secondary vs-btn-sm">Close</button>
      </div>
    </div>
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>we(i);if(ke(i,a),(r=document.getElementById("btn-archived-close"))==null||r.addEventListener("click",a),n){let l=i.querySelector(".vs-modal");l==null||l.addEventListener("click",async d=>{let u=d.target.closest(".archived-restore-btn");if(u){let c=u.dataset.id,{ok:v}=await E.post(`/cards/${c}/restore`);v&&(I("Card restored.","success"),a(),await pt());return}let p=d.target.closest(".archived-delete-btn");if(p){let c=p.dataset.id;if(!await Ce({title:"Delete Permanently",description:"This card will be permanently deleted. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:m}=await E.delete(`/cards/${c}`);m&&(I("Card deleted.","success"),a(),await pt())}})}}function $u(e){if(vn())P.set("activePageScope",e),window.location.hash="#/chat";else{let s=window.location.origin,n=e==="index"?"/":`/${e}`;window.open(`${s}${n}`,"_blank")}}function io(e){return e?new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""}function Wl(e){if(!e)return"";if(e==="index"||e==="index.php")return"Home";let s=(P.get("pages")||[]).find(i=>i.slug===e);return s!=null&&s.title?s.title:e.replace(/\.(php|html)$/i,"").split("/").pop().split("-").filter(Boolean).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(" ")||e}async function Gl(){await li(),bs=null,qe=null,ys=null,ai=!1,oo(),document.removeEventListener("keydown",zl),document.removeEventListener("mousedown",Ul),window.__vsFlushCallbacks&&window.__vsFlushCallbacks.delete("board")}var ae=null;function xs(e){ae=e}var pe=null;function Ot(e){pe=e}var Kl=null;function ss(e){Kl=e}var ws="";function Ma(e){ws=e}var ks=null;function ns(e){ks=e}var ro=null;function ci(e){ro=e}var Ia=!1;function Xl(e){Ia=e}var At=null;function Ks(e){At=e}var Cu=null;function Xs(e){Cu=e}var Es="";function $s(e){Es=e}var Ba=!1;function pi(e){Ba=e}var Fe="idle";function Ee(e){Fe=e}var mn=null;function Qe(e){mn=e}var We=null;function $t(e){We=e}var Lu=null;function Yl(e){Lu=e}var Ys=!1;function Jl(e){Ys=e}var ot;function _a(e){ot=e}var qt=null;function lo(e){qt=e}var co=!1;function Zl(e){co=e}var Pt=null;function Ql(e){Pt=e}var bt=null;function ed(e){bt=e}var td=!1;function sd(e){td=e}var gn=null;function Aa(e){gn=e}var ui=!1;function nd(e){ui=e}var vi=!1;function od(e){vi=e}var mi=!1;function gi(e){mi=e}function os(){Ys=!1,ot=void 0,qt=null,co=!1,Pt=null,bt=null,td=!1,gn=null,ui=!1,vi=!1,mi=!1}var Cs=!1;function id(e){Cs=e}var fi="";function ad(e){fi=e}var fn="idle";function hi(e){fn=e}var po=null;function Pa(e){po=e}var uo=null;function rd(e){uo=e}function Ls(){Cs=!1,fi="",fn="idle",po=null,uo=null}var Ss=!1;function ld(e){Ss=e}var ut="idle";function Rt(e){ut=e}var vo=null;function Ra(e){vo=e}var mo=null;function dd(e){mo=e}function is(){Ss=!1,ut="idle",vo=null,mo=null}var Ta="vs-site-selected-node";function bi(e){try{e?sessionStorage.setItem(Ta,e):sessionStorage.removeItem(Ta)}catch{}}function cd(){try{return sessionStorage.getItem(Ta)||null}catch{return null}}var vt=new Set,pd="vs-site-card-prefs",Su={"direct-includes":"open","transitive-includes":"closed","links-to":"closed","linked-from":"open","blast-radius":"closed"};function Tu(){try{let e=sessionStorage.getItem(pd);if(e)return new Map(Object.entries(JSON.parse(e)))}catch{}return new Map}var yi=Tu();function ud(){try{sessionStorage.setItem(pd,JSON.stringify(Object.fromEntries(yi)))}catch{}}function Da(e){let t=yi.get(e);return t?t==="closed":(Su[e]||"closed")==="closed"}var Ge=new Map,vd="vs-site-sidebar-widths",md="vs-site-section-state",Mu=["partial","route","asset","token"],gd=[{key:"page",label:"Pages",icon:"fileText"},{key:"partial",label:"Partials",icon:"fileCode"},{key:"route",label:"Routes",icon:"globe"},{key:"asset",label:"Assets",icon:"image"},{key:"token",label:"Tokens",icon:"palette"}];function Iu(){try{let e=sessionStorage.getItem(md);if(e)return new Set(JSON.parse(e))}catch{}return new Set(Mu)}function fd(){try{sessionStorage.setItem(md,JSON.stringify([...Ts]))}catch{}}var Ts=Iu();function hd(){try{return JSON.parse(sessionStorage.getItem(vd))||{}}catch{return{}}}function Ha(e,t){let s=hd();s[e]=t;try{sessionStorage.setItem(vd,JSON.stringify(s))}catch{}}function Na(e){let t=hd();return t[e]?` style="width: ${t[e]}px;"`:""}function Ms(e){let t=new Map,s=e.edges||[];for(let i of e.nodes||[])t.set(i.id,i);let n=new Map,o=new Map;for(let i of s)n.has(i.source)||n.set(i.source,[]),n.get(i.source).push(i),o.has(i.target)||o.set(i.target,[]),o.get(i.target).push(i);return{nodes:t,edges:s,summary:e.summary||{},builtAt:e.built_at||null,buildTimeMs:e.build_time_ms||0,edgesBySource:n,edgesByTarget:o}}function as(){var o,i,a,r,l,d,u;if(!ae)return[];let e=[];for(let[,p]of ae.nodes)p.type==="page"&&e.push(p);let t=new Map;for(let p of e)t.set(p.id,{id:p.id,label:p.label||p.id.replace("page:",""),slug:((o=p.meta)==null?void 0:o.slug)||"",level:((i=p.meta)==null?void 0:i.level)||1,childCount:((a=p.meta)==null?void 0:a.childCount)||0,parentPageId:((r=p.meta)==null?void 0:r.parentPageId)||null,hierarchySource:((l=p.meta)==null?void 0:l.hierarchySource)||null,isHomepage:((d=p.meta)==null?void 0:d.isHomepage)||!1,navOrder:((u=p.meta)==null?void 0:u.navOrder)||0,children:[]});let s=[];for(let[,p]of t)p.parentPageId&&t.has(p.parentPageId)?t.get(p.parentPageId).children.push(p):s.push(p);let n=(p,c)=>p.isHomepage!==c.isHomepage?p.isHomepage?-1:1:p.navOrder!==c.navOrder?p.navOrder-c.navOrder:p.label.localeCompare(c.label);s.sort(n);for(let[,p]of t)p.children.length>0&&p.children.sort(n);return s}function Js(e){let s=(ae.edgesByTarget.get(e)||[]).find(n=>n.type==="serves");return s?s.source:null}function yt(e){let t=ae.nodes.get(e);return t?t.label||t.id:e}function Ct(e){let t=ae.nodes.get(e);return t?t.type:"unknown"}function xi(){return pe?Kl:null}function bd(e){return`
    <div class="vs-sc-left-inner">
      <div class="vs-sc-filter">
        <input type="text" id="vs-sc-search" class="vs-input vs-input-sm"
               placeholder="Filter\u2026" autocomplete="off" value="${b(ws)}" />
      </div>
      <div class="vs-sc-left-scroll" id="vs-sc-left-scroll">
        ${Bu(e)}
        ${_u()}
      </div>
    </div>
  `}function Bu(e){let t=Ts.has("page-tree"),s=0;if(ae)for(let[,n]of ae.nodes)n.type==="page"&&s++;return`
    <div class="vs-sc-nav-section ${t?"is-collapsed":""}">
      <button class="vs-sc-nav-section-header" data-nav-section="page-tree">
        <span class="vs-sc-nav-section-chevron">${x.chevronDown}</span>
        <span class="vs-sc-nav-section-label">Pages</span>
        <span class="vs-sc-nav-section-count">${s}</span>
      </button>
      <div class="vs-sc-nav-section-body">
        ${yd(e,0)}
      </div>
    </div>
  `}function yd(e,t){if(!e||e.length===0)return"";let s=ws.toLowerCase(),n="",o=2;for(let i of e){if(s&&!hn(i,s))continue;let a=xi()===i.id,r=vt.has(i.id),l=i.children.length>0,d=Math.min(t,o),u=t>o,p=d*20;n+=`
      <div class="vs-site-tree-group ${l&&r?"is-collapsed":""}"
           data-tree-group="${b(i.id)}">
        <div class="vs-site-tree-item ${a?"is-selected":""}"
             style="padding-left: ${12+p}px"
             data-page-id="${b(i.id)}">
          ${l?`
            <button class="vs-site-tree-toggle"
                    data-toggle-page="${b(i.id)}">
              ${x.chevronDown}
            </button>
          `:'<span class="vs-site-tree-toggle-spacer"></span>'}
          ${i.isHomepage?'<span class="vs-site-tree-star">\u2605</span>':""}
          <span class="vs-site-tree-label">${b(i.label)}</span>
          ${i.hierarchySource==="inferred"?'<span class="vs-site-tree-inferred" title="Inferred from URL structure \u2014 not explicitly authored">\u2071</span>':""}
          ${u?'<span class="vs-site-tree-overdepth" title="Deeper than 3 levels, shown at Level 3">\u207A</span>':""}
          ${l?`<span class="vs-site-tree-badge">${i.childCount}</span>`:""}
        </div>
        ${l?`
          <div class="vs-site-tree-children">
            ${yd(i.children,t+1)}
          </div>
        `:""}
      </div>
    `}return n}function _u(){if(!ae)return"";let e=ws.toLowerCase(),t=new Map,s=gd.filter(o=>o.key!=="page");for(let o of s)t.set(o.key,[]);for(let[,o]of ae.nodes){let i=t.get(o.type);i&&i.push(o)}let n="";for(let o of s){let i=t.get(o.key)||[],a=e?i.filter(d=>{let u=(d.label||"").toLowerCase(),p=d.id.toLowerCase();return u.includes(e)||p.includes(e)}):i;a.sort((d,u)=>(d.label||d.id).localeCompare(u.label||u.id));let r=Ts.has(o.key),l=e?`${a.length}/${i.length}`:`${i.length}`;n+=`
      <div class="vs-sc-nav-section ${r?"is-collapsed":""}">
        <button class="vs-sc-nav-section-header" data-nav-section="${o.key}">
          <span class="vs-sc-nav-section-chevron">${x.chevronDown}</span>
          <span class="vs-sc-nav-section-label">${o.label}</span>
          <span class="vs-sc-nav-section-count">${l}</span>
        </button>
        <div class="vs-sc-nav-section-body">
          ${a.length===0?'<div class="vs-sc-nav-item-empty">No matches</div>':a.map(d=>Pu(d,o)).join("")}
        </div>
      </div>
    `}return n}function Au(e){let t=(e.split(".").pop()||"").toLowerCase();return{css:"paintbrush",scss:"paintbrush",less:"paintbrush",js:"fileCode",ts:"fileCode",mjs:"fileCode",json:"fileJson",jpg:"image",jpeg:"image",png:"image",gif:"image",webp:"image",avif:"image",ico:"image",svg:"penTool",mp4:"film",webm:"film",mov:"film",mp3:"music",wav:"music",ogg:"music",woff:"type",woff2:"type",ttf:"type",otf:"type",eot:"type",pdf:"filePdf"}[t]||"image"}function Pu(e,t){var d,u,p;let s=pe===e.id,n=b(e.label||e.id),o=((d=e.meta)==null?void 0:d.isShared)===!0,i=((u=e.meta)==null?void 0:u.isHomepage)===!0,a="";i&&(a+='<span class="vs-impact-badge vs-impact-badge-star">\u2605</span>'),o&&(a+='<span class="vs-impact-badge vs-impact-badge-shared">shared</span>');let r="";if(t.key==="token"&&((p=e.meta)!=null&&p.value)){let c=e.meta.value;/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(c)&&(r=`<span class="vs-impact-swatch" style="background:${b(c)}"></span>`)}let l=t.icon;return t.key==="asset"?l=Au(e.id):t.key==="partial"&&(l="puzzle"),`
    <button class="vs-impact-item ${s?"is-selected":""}" data-node-id="${b(e.id)}">
      <span class="vs-impact-item-icon">${x[l]||x[t.icon]||""}</span>
      <span class="vs-impact-item-label">${n}</span>
      ${r}
      ${a}
    </button>
  `}function hn(e,t){return e.label.toLowerCase().includes(t)||e.slug.toLowerCase().includes(t)?!0:e.children.some(s=>hn(s,t))}function xd(e){var i,a;if(!pe||pe!==e)return"";let t=(i=ae)==null?void 0:i.nodes.get(e),s=((a=t==null?void 0:t.meta)==null?void 0:a.isHomepage)||!1,n=s?'<button class="vs-sc-action-drop-item vs-sc-action-danger is-disabled" disabled title="The homepage cannot be deleted">Delete</button>':'<button class="vs-sc-action-drop-item vs-sc-action-danger" data-action="delete">Delete</button>',o=s?'<button class="vs-sc-action-drop-item is-disabled" disabled title="The homepage cannot be moved">Move</button>':'<button class="vs-sc-action-drop-item" data-action="reorder">Move</button>';return`
    <div class="vs-sc-action-bar" data-for-node="${b(e)}">
      <button class="vs-sc-action vs-sc-action-primary" data-action="rename" title="Rename this page"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg> Rename</button>
      <div class="vs-sc-action-overflow">
        <button class="vs-sc-action" data-action="overflow" title="More actions">\u22EF More</button>
        <div class="vs-sc-action-dropdown">
          <button class="vs-sc-action-drop-item" data-action="change-url">Change URL</button>
          ${o}
          ${n}
        </div>
      </div>
    </div>
  `}function go(e){let t=document.getElementById("vs-site-diagram");if(!t||!e||e.length===0)return;let s=t.querySelector(".vs-sc-connectors");s&&s.remove();let n=[],o=k=>{for(let T of k)if(T.children.length>0&&!vt.has(T.id)){for(let _ of T.children)n.push({parentId:T.id,childId:_.id});o(T.children)}},i=ws.toLowerCase(),a=k=>{if(!i)return k;let T=[];for(let _ of k)if(hn(_,i)){let D=a(_.children);T.push({..._,children:D})}return T},r=a(e),l=r.find(k=>k.isHomepage),d=r.filter(k=>!k.isHomepage);if(l)for(let k of d)n.push({parentId:l.id,childId:k.id});if(o(r),n.length===0)return;let u=t.getBoundingClientRect(),p=t.scrollLeft,c=t.scrollTop,v=[];for(let{parentId:k,childId:T}of n){let _=t.querySelector(`.vs-site-card[data-page-id="${CSS.escape(k)}"]`),D=t.querySelector(`.vs-site-card[data-page-id="${CSS.escape(T)}"]`);if(!_||!D)continue;let q=_.getBoundingClientRect(),Q=D.getBoundingClientRect(),X=q.left-u.left+p+q.width/2,O=q.top-u.top+c+q.height,de=Q.left-u.left+p+Q.width/2,J=Q.top-u.top+c,H=O+(J-O)/2,L=`M ${X} ${O} V ${H} H ${de} V ${J}`,N=pe&&(k===pe||T===pe);v.push({d:L,isActive:N})}if(v.length===0)return;let m=t.scrollWidth,g=t.scrollHeight,y=document.createElementNS("http://www.w3.org/2000/svg","svg");y.setAttribute("class","vs-sc-connectors"),y.setAttribute("width",m),y.setAttribute("height",g),y.setAttribute("viewBox",`0 0 ${m} ${g}`),y.setAttribute("aria-hidden","true");let f=document.createElementNS("http://www.w3.org/2000/svg","g");f.setAttribute("class","vs-sc-hierarchy-rails");let h=v.filter(k=>!k.isActive),$=v.filter(k=>k.isActive);for(let{d:k}of h){let T=document.createElementNS("http://www.w3.org/2000/svg","path");T.setAttribute("d",k),f.appendChild(T)}for(let{d:k}of $){let T=document.createElementNS("http://www.w3.org/2000/svg","path");T.setAttribute("d",k),T.classList.add("active"),f.appendChild(T)}y.appendChild(f);let w=document.createElementNS("http://www.w3.org/2000/svg","g");w.setAttribute("class","vs-sc-impact-overlays"),y.appendChild(w),t.appendChild(y)}function wd(e){if(!e||e.length===0)return'<div class="vs-site-diagram-empty">No pages found</div>';let t=ws.toLowerCase(),s=u=>{if(!t)return u;let p=[];for(let c of u)if(hn(c,t)){let v=s(c.children);p.push({...c,children:v})}return p},n=u=>{let p=[];for(let c of u.children)p.push(c),c.children.length>0&&!vt.has(c.id)&&p.push(...o(c));return p},o=u=>{let p=[];for(let c of u.children)p.push(c),c.children.length>0&&!vt.has(c.id)&&p.push(...o(c));return p},i=s(e),a=i.find(u=>u.isHomepage),r=i.filter(u=>!u.isHomepage),l=u=>{if(u.children.length===0||vt.has(u.id))return"";let p=t?u.children.filter(v=>hn(v,t)):u.children;if(p.length===0)return"";let c=`<div class="vs-site-tier-group" data-parent-id="${b(u.id)}">`;c+=`<div class="vs-site-tier-group-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>${b(u.label)}</div>`,c+='<div class="vs-site-tier-group-cards">';for(let v of p)if(c+=wi(v),v.children.length>0&&!vt.has(v.id)){let m=n(v),g=t?m.filter(y=>y.label.toLowerCase().includes(t)||y.slug.toLowerCase().includes(t)):m;if(g.length>0){c+='<div class="vs-site-tier-l3-inline">';for(let y of g)c+=wi(y);c+="</div>"}}return c+="</div></div>",c},d='<div class="vs-site-tiers">';if(a&&(d+=`
      <div class="vs-site-tier vs-site-tier-home">
        ${wi(a)}
      </div>
    `),r.length>0||a&&a.children.length>0&&!vt.has(a.id)){if(d+='<div class="vs-site-tier vs-site-tier-l1">',a&&a.children.length>0&&!vt.has(a.id)){let u=l(a);u&&(d+=`<div class="vs-site-tier-column">${u}</div>`)}for(let u of r)d+='<div class="vs-site-tier-column">',d+=wi(u),d+=l(u),d+="</div>";d+="</div>"}return d+="</div>",d}function wi(e){let t=xi()===e.id,s=e.hierarchySource==="inferred",n=Js(e.id),o="";if(n){let a=ae.nodes.get(n);a&&(o=a.label||a.id.replace("route:",""))}else e.isHomepage?o="/ \xB7 Homepage":e.slug&&(o="/"+e.slug);return`
    <div class="${["vs-site-card",e.isHomepage?"is-homepage":"",t?"is-selected":"",s?"is-inferred":""].filter(Boolean).join(" ")}"
         data-page-id="${b(e.id)}"
         title="${b(o||e.label)}">
      <div class="vs-site-card-body">
        <div class="vs-site-card-title">
          ${e.isHomepage?'<span class="vs-site-card-star">\u2605</span>':""}
          <span class="vs-site-card-label">${b(e.label)}</span>
        </div>
        ${o?`<div class="vs-site-card-route">${b(o)}</div>`:""}
      </div>
      ${e.childCount>0?`<span class="vs-site-card-count">${e.childCount}</span>`:""}
      ${xd(e.id)}
    </div>
  `}function kd(){let e=pe&&ae&&ae.nodes.get(pe),t=e?ae.nodes.get(pe):null;return`
    <div class="vs-sc-right-inner ${e?"":"vs-sc-idle"}">
      <div class="vs-sc-right-header">
        ${e?`
          <span class="vs-sc-right-title">${b(t.label||pe)}</span>
          <button class="vs-impact-close-btn" data-action="close-inspect" title="Close" aria-label="Close inspect panel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        `:`
          <span class="vs-sc-right-title vs-sc-right-title-idle">Site Control</span>
        `}
      </div>
      <div class="vs-sc-right-body" id="vs-sc-right-body">
        ${e?ja():Ru()}
      </div>
    </div>
  `}function Ru(){return ae?`
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${x.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `:bn()}function bn(){return`
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${x.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `}function ja(){var r,l;if(Ss)return Ku();if(Cs)return Gu();if(Ys)return zu();if(At)return Hu();let e=(r=ae)==null?void 0:r.nodes.get(pe);if(!e)return bn();let t="";if(e.type==="page"){let d=Js(e.id);if(d){let u=ae.nodes.get(d);t=u?u.label||d:""}}else e.type==="route"?t=e.label||e.id:t=e.id;let s="";(l=e.meta)!=null&&l.isShared&&(s+='<span class="vs-impact-header-badge vs-impact-header-shared">Shared</span>');let n=Ge.get(e.id);n!=null&&n.is_global&&(s+='<span class="vs-impact-header-badge vs-impact-header-global">Global</span>');let o=[];qu(e,o),Fu(e.id,o);let i=o.filter(d=>!d.collapsed).map(d=>d.html),a=o.filter(d=>d.collapsed).map(d=>d.html);return`
    <div class="vs-impact-detail-content">
      <div class="vs-impact-detail-header">
        ${t?`<p class="vs-impact-detail-subtitle">${b(t)}</p>`:""}
        ${s?`<div class="vs-impact-detail-badges">${s}</div>`:""}
      </div>
      ${i.join("")}
      ${a.join("")}
    </div>
  `}function Ed(e,t){var i;let s=(i=ae)==null?void 0:i.nodes.get(e);if(!s)return;Ls(),os(),is();let n=e;if(s.type==="page"&&(n=Js(e),!n)||s.type!=="page"&&s.type!=="route")return;Ks(n),Xs(e),$s(""),pi(!0),Ee("idle"),Qe(null),$t(null);let o=ae.edgesByTarget.get(n)||[];for(let a of o)if(a.type==="links_to"){let r=ae.nodes.get(a.source);(r==null?void 0:r.type)==="partial"&&!Ge.has(a.source)&&Du(a.source,t)}}function Is(){Ks(null),Xs(null),$s(""),Ee("idle"),Qe(null),$t(null)}function $d(e){var s;let t=(s=ae)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(Ls(),Is(),is(),os(),Jl(!0),gi(!0),Ee("idle"),Qe(null),$t(null))}function ho(){os(),Ee("idle"),Qe(null),$t(null)}function Cd(e){var s;let t=(s=ae)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(Is(),os(),is(),Ls(),id(!0),ad(t.label||""))}function yn(){Ls()}function Ld(e){var s,n;let t=(s=ae)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(n=t.meta)!=null&&n.isHomepage||(Is(),os(),Ls(),is(),ld(!0))}function ki(){is()}async function Du(e,t){if(Ge.has(e))return;let{ok:s,data:n}=await E.get("/site-graph/blast-radius?node="+encodeURIComponent(e));s&&n&&!Ge.has(e)&&(Ge.set(e,n),t&&t())}function Hu(){var p;let e=(p=ae)==null?void 0:p.nodes.get(At);if(!e)return Is(),pe?ja():bn();let t=e.label||e.id,s=t==="/"||e.id==="route:/";if(Fe==="success"&&We)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${x.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">URL updated</p>
            <p class="vs-sc-form-result-detail">${b(We.oldPath)} \u2192 ${b(We.newPath)}</p>
            ${We.referenceCount>0?`<p class="vs-sc-form-result-detail">${We.referenceCount} reference${We.referenceCount!==1?"s":""} updated across ${(We.updatedFiles||[]).length} file${(We.updatedFiles||[]).length!==1?"s":""}</p>`:""}
            ${We.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `;if(Fe==="error"&&mn)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${x.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${b(mn.message||"Unknown error")}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-proposal">Dismiss</button>
        </div>
      </div>
    `;if(Fe==="applying")return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Applying\u2026</span>
        </div>
      </div>
    `;let n=Oa(Es,t),i=(ae.edgesByTarget.get(At)||[]).filter(c=>c.type==="links_to"),a=new Set(i.map(c=>c.source)),r="";s?r=`
      <div class="vs-sc-form-actions">
        <div class="vs-sc-form-hint">Homepage URL cannot be renamed.</div>
      </div>
    `:Fe==="armed"?r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn is-armed" data-action="apply-proposal-confirm">
          Confirm
        </button>
      </div>
    `:n.valid?r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn" data-action="apply-proposal-arm">Apply</button>
        <button class="vs-sc-form-cancel" data-action="close-proposal">Cancel</button>
      </div>
    `:r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-cancel" data-action="close-proposal">Cancel</button>
      </div>
    `;let l=Fe==="armed"?"disabled":"",d="";n.message&&(d=`<div class="vs-sc-form-hint ${n.valid?"is-valid":"is-error"}">${n.message}</div>`);let u="";if(!s&&i.length>0){let c=i.length,v=a.size;u=`
      <div class="vs-sc-delete-section">
        <div class="vs-sc-delete-section-header">
          <span class="vs-sc-form-label" title="Links to this URL in other files will be automatically updated">References updated</span>
          <span class="vs-sc-delete-section-count">${c} across ${v} file${v!==1?"s":""}</span>
        </div>
        ${Nu(i,n)}
      </div>
    `}else!s&&i.length===0&&Es&&(u='<div class="vs-sc-form-hint">No references to update.</div>');return`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Change URL</h3>
      <p class="vs-sc-form-context">Current path: <strong>${b(t)}</strong></p>
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label" for="vs-proposal-url">New URL path</label>
        <input
          type="text"
          id="vs-proposal-url"
          class="vs-sc-form-input"
          placeholder="${b(t)}"
          autocomplete="off"
          spellcheck="false"
          value="${b(Es)}"
          ${l}
        />
        ${d}
      </div>
      ${u}
      ${r}
    </div>
  `}function Oa(e,t){if(!e||!e.trim())return{valid:!1,cleanPath:"",message:""};let s=e.trim();if(s.startsWith("/")&&(s=s.slice(1)),s.endsWith("/")&&(s=s.slice(0,-1)),s.includes("/"))return{valid:!1,cleanPath:"/"+s,message:"Nested paths (e.g. /services/web-design) are not supported yet"};s.endsWith(".php")&&(s=s.slice(0,-4));let n=s.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");if(!n)return{valid:!1,cleanPath:"/",message:"Path cannot be empty after normalization"};let o="/"+n,a=s.toLowerCase()!==n?` (normalized from "${s}")`:"",r=t.replace(/\/$/,"")||"/";if(o===r)return{valid:!1,cleanPath:o,message:"New path is the same as the current path"};if(ae){for(let[,l]of ae.nodes)if(l.type==="route"&&l.id!==At){let d=(l.label||l.id).replace(/\/$/,"")||"/";if(o===d)return{valid:!1,cleanPath:o,message:`Path conflicts with existing route: ${d}`}}}return{valid:!0,cleanPath:o,message:`\u2713 ${o}${a}`}}function Nu(e,t){let s=new Map;for(let o of e)s.has(o.source)||s.set(o.source,[]),s.get(o.source).push(o);let n='<div class="vs-proposal-groups">';for(let[o,i]of s)n+=ju(o,i,t);return n+="</div>",n}function ju(e,t,s){var l;let n=ae.nodes.get(e);if(!n)return"";let o=n.type.charAt(0).toUpperCase()+n.type.slice(1),i=t.length,a="";if(n.type==="partial"){let d=((l=n.meta)==null?void 0:l.includeCount)??0;a=`Used by ${d} file${d!==1?"s":""}`;let u=Ge.get(e);u&&(a+=` \xB7 Affects ${u.affected_count} page${u.affected_count!==1?"s":""}`)}let r=[...t].sort((d,u)=>{var p,c;return(((p=d.meta)==null?void 0:p.lineNumber)||0)-(((c=u.meta)==null?void 0:c.lineNumber)||0)});return`<div class="vs-proposal-group">
    <div class="vs-proposal-group-header">
      <span class="vs-impact-type-badge vs-impact-type-${n.type}">${o}</span>
      <span class="vs-proposal-group-label" data-navigate-node="${b(e)}">${b(n.label||n.id)}</span>
      <span class="vs-proposal-group-count">${i} ref${i!==1?"s":""}</span>
    </div>
    ${a?`<div class="vs-proposal-group-meta">${a}</div>`:""}
    <div class="vs-proposal-group-refs">
      ${r.map(d=>Ou(d,s)).join("")}
    </div>
  </div>`}function Ou(e,t){var a,r,l;let s=(a=e.meta)!=null&&a.lineNumber?`L${e.meta.lineNumber}`:"",n=((r=e.meta)==null?void 0:r.href)||"",o=((l=e.meta)==null?void 0:l.context)||"body",i="";if(t.valid){let d=n.replace(/[?#].*/,""),u=d!=="/"&&d.endsWith("/"),p=n.match(/[?#].*/),c=p?p[0]:"",v=t.cleanPath;u&&!v.endsWith("/")&&(v+="/"),v+=c,i=`<span class="vs-proposal-ref-arrow">\u2192 ${b(v)}</span>`}return`<div class="vs-proposal-ref">
    <span class="vs-proposal-ref-line">${s}</span>
    <span class="vs-proposal-ref-href">${b(n)}</span>
    <span class="vs-proposal-ref-context">${o}</span>
    ${i}
  </div>`}function qu(e,t){let s=ae.edgesBySource.get(e.id)||[],n=ae.edgesByTarget.get(e.id)||[],o=t.length;switch(e.type){case"page":{let i=s.filter(d=>d.type==="includes");i.length>0&&t.push(Dt("Direct Includes",i.map(d=>({nodeId:d.target,label:yt(d.target),type:Ct(d.target)}))));let a=[];for(let d of i){let u=ae.edgesBySource.get(d.target)||[];for(let p of u)p.type==="includes"&&a.push({nodeId:p.target,label:yt(p.target),type:Ct(p.target),via:yt(d.target)})}a.length>0&&t.push(Dt("Transitive Includes",a));let r=s.filter(d=>d.type==="links_to");r.length>0&&t.push(Dt("Links To",r.map(d=>{var u,p;return{nodeId:d.target,label:yt(d.target),type:Ct(d.target),meta:(u=d.meta)!=null&&u.href?`\u2192 ${d.meta.href}`:null,context:((p=d.meta)==null?void 0:p.context)||null}})));let l=Js(e.id);if(l){let u=(ae.edgesByTarget.get(l)||[]).filter(p=>p.type==="links_to");u.length>0&&t.push(Dt("Linked From",u.map(p=>{var c,v;return{nodeId:p.source,label:yt(p.source),type:Ct(p.source),meta:(c=p.meta)!=null&&c.href?`\u2192 ${p.meta.href}`:null,context:((v=p.meta)==null?void 0:v.context)||null}})))}break}case"partial":{let i=n.filter(l=>l.type==="includes");i.length>0&&t.push(Dt("Included By",i.map(l=>({nodeId:l.source,label:yt(l.source),type:Ct(l.source)}))));let a=s.filter(l=>l.type==="includes");a.length>0&&t.push(Dt("Includes",a.map(l=>({nodeId:l.target,label:yt(l.target),type:Ct(l.target)}))));let r=s.filter(l=>l.type==="links_to");r.length>0&&t.push(Dt("Links To",r.map(l=>{var d,u;return{nodeId:l.target,label:yt(l.target),type:Ct(l.target),meta:(d=l.meta)!=null&&d.href?`\u2192 ${l.meta.href}`:null,context:((u=l.meta)==null?void 0:u.context)||null}})));break}case"route":{let i=s.filter(r=>r.type==="serves");i.length>0&&t.push(Dt("Serves",i.map(r=>({nodeId:r.target,label:yt(r.target),type:Ct(r.target)}))));let a=n.filter(r=>r.type==="links_to");a.length>0&&t.push(Dt("Linked From",a.map(r=>{var l,d;return{nodeId:r.source,label:yt(r.source),type:Ct(r.source),meta:(l=r.meta)!=null&&l.href?`\u2192 ${r.meta.href}`:null,context:((d=r.meta)==null?void 0:d.context)||null}})));break}case"token":{let i=n.filter(a=>a.type==="consumes_token");i.length>0&&t.push(Dt("Consumed By",i.map(a=>({nodeId:a.source,label:yt(a.source),type:Ct(a.source)}))));break}case"asset":{let i=s.filter(a=>a.type==="consumes_token");i.length>0&&t.push(Dt("Consumes Tokens",i.map(a=>({nodeId:a.target,label:yt(a.target),type:Ct(a.target)}))));break}}t.length===o&&t.push({collapsed:!1,html:'<p class="vs-impact-no-relations">No relationships found.</p>'})}function Dt(e,t){let s=e.toLowerCase().replace(/\s+/g,"-"),n=Da(s),i=`
    <div class="vs-impact-card${n?" is-collapsed":""}">
      <button class="vs-impact-card-header" data-card-toggle="${s}">
        <span class="vs-impact-card-chevron">${x.chevronDown}</span>
        <span class="vs-impact-card-title">${b(e)}</span>
        <span class="vs-impact-card-count">${t.length}</span>
      </button>
      <div class="vs-impact-card-list">
        ${t.map(a=>{let r=`vs-impact-ref-type-${a.type}`;return`
            <button class="vs-impact-ref-item" data-node-id="${b(a.nodeId)}">
              <span class="vs-impact-ref-type ${r}">${a.type}</span>
              <span class="vs-impact-ref-label">${b(a.label)}</span>
              ${a.via?`<span class="vs-impact-transitive-via">(via ${b(a.via)})</span>`:""}
              ${a.meta?`<span class="vs-impact-ref-meta">${b(a.meta)}</span>`:""}
            </button>
            ${a.context?`<div class="vs-impact-ref-context">${b(a.context)}</div>`:""}
          `}).join("")}
      </div>
    </div>
  `;return{collapsed:n,html:i}}function Fu(e,t){let s="blast-radius";if(ro===e){t.push({collapsed:!1,html:`
      <div class="vs-impact-card vs-impact-blast-card">
        <button class="vs-impact-card-header" data-card-toggle="${s}">
          <span class="vs-impact-card-chevron">${x.chevronDown}</span>
          <span class="vs-impact-card-title">Blast Radius</span>
        </button>
        <div class="vs-impact-blast-loading">
          <div class="vs-site-spinner" style="width:16px;height:16px"></div>
          <span>Computing\u2026</span>
        </div>
      </div>
    `});return}let n=Ge.get(e);if(!n)return;let{affected_pages:o=[],affected_count:i=0,total_pages:a=0,is_global:r=!1}=n,l=Da(s),d=l?" is-collapsed":"";t.push({collapsed:l,html:`
    <div class="vs-impact-card vs-impact-blast-card${d}">
      <button class="vs-impact-card-header" data-card-toggle="${s}">
        <span class="vs-impact-card-chevron">${x.chevronDown}</span>
        <span class="vs-impact-card-title">Blast Radius</span>
        <span class="vs-impact-card-count">${i} / ${a}</span>
        ${r?'<span class="vs-impact-blast-global">GLOBAL</span>':""}
      </button>
      <div class="vs-impact-card-list">
        ${o.map(u=>`
          <button class="vs-impact-ref-item" data-node-id="${b(u.id)}">
            <span class="vs-impact-ref-type vs-impact-ref-type-page">page</span>
            <span class="vs-impact-ref-label">${b(u.label||u.id)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `})}function zu(){var l;let e=(l=ae)==null?void 0:l.nodes.get(pe);if(!e)return ho(),pe?ja():bn();let t=b(e.label||e.id);if(mi)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Loading navigation\u2026</span>
        </div>
      </div>
    `;if(Fe==="success"&&We){let d=!!We.movedPages,u=d?"Page moved":"Navigation updated",p="";if(d){let c=We.totalPagesMoved||1,v=We.totalAffectedReferences||0,m=[];m.push(`Moved ${c} page${c!==1?"s":""}`),v>0&&m.push(`updated ${v} reference${v!==1?"s":""}`),p=m.join(", ")}else p=b(We.message||"Page order has been changed.");return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${x.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">${u}</p>
            <p class="vs-sc-form-result-detail">${p}</p>
            ${We.normalized?'<p class="vs-sc-form-result-detail">Navigation was standardized</p>':""}
            ${We.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `}if(vi)return fo(t,"The homepage is always first and cannot be reordered.");if(gn==="nav_missing")return fo(t,"No navigation file found.");if(gn==="unsupported_layout")return fo(t,"This navigation layout doesn't support reordering yet.");if(gn==="nav_parse_error")return fo(t,"The navigation file has a problem and can't be read right now.");if(!ui)return fo(t,"This page isn't in the navigation yet.");let s=Vu(e),n=Uu(e),o=co?'<div class="vs-sc-form-hint">Navigation will be standardized first. Current links and order are preserved.</div>':"",i="";Fe==="error"&&mn&&(i=`
      <div class="vs-sc-form-result is-error">
        <div class="vs-sc-form-result-icon">${x.alertTriangle||"\u26A0"}</div>
        <div class="vs-sc-form-result-text">
          <p class="vs-sc-form-result-title">Move failed</p>
          <p class="vs-sc-form-result-detail">${b(mn.message||"Unknown error")}</p>
        </div>
      </div>
    `);let a=Wu(),r="";return Fe==="applying"?r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn is-loading" disabled>
          <span class="vs-sc-move-loading-spinner"></span>
          Applying\u2026
        </button>
      </div>
    `:Fe==="armed"?r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn is-armed" data-action="apply-move-confirm">
          Confirm
        </button>
      </div>
    `:a?a&&(r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn" disabled>Apply</button>
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Cancel</button>
      </div>
    `):r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn" data-action="apply-move-arm">${co?"Standardize & move":"Apply"}</button>
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Cancel</button>
      </div>
    `,`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Move</h3>
      ${n}
      ${s}
      ${o}
      ${i}
      ${r}
    </div>
  `}function fo(e,t){return`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Move</h3>
      <p class="vs-sc-form-context">${b(t)}</p>
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Dismiss</button>
      </div>
    </div>
  `}function Uu(e){var o,i;if(!bt||bt.length===0)return"";let t=(o=e.meta)!=null&&o.isHomepage?"/":"/"+(((i=e.meta)==null?void 0:i.slug)||""),n=`
    <button class="vs-move-parent-option ${ot===null?"is-selected":""}"
            data-action="select-move-parent" data-parent-href="__root__">
      Root
    </button>
  `;for(let a of bt){if(a.href===t)continue;let r=ot===a.href;n+=`
      <button class="vs-move-parent-option ${r?"is-selected":""}"
              data-action="select-move-parent" data-parent-href="${b(a.href)}">
        ${b(a.label)}
      </button>
    `}return`
    <div class="vs-sc-form-field">
      <label class="vs-sc-form-label">Parent page</label>
      <div class="vs-move-parent-chooser">
        ${n}
      </div>
    </div>
  `}function Vu(e){var u,p,c,v,m;if(ot===void 0||!bt)return"";let t=(u=e.meta)!=null&&u.isHomepage?"/":"/"+(((p=e.meta)==null?void 0:p.slug)||""),s=e.label||((c=e.meta)==null?void 0:c.slug)||"",n=[];if(ot===null)n=bt.filter(g=>g.href!==t);else for(let g of bt)if(g.href===ot){n=(g.children||[]).filter(y=>y.href!==t);break}if(n.length===0)return`
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label">Position</label>
        <div class="vs-move-position-strip">
          <div class="vs-move-strip-pill is-self">${b(s)}</div>
        </div>
        <div class="vs-sc-form-hint">Only page at this level</div>
      </div>
    `;let o=qt??n.length,i=[...n];i.splice(o,0,{href:t,label:s,isSelf:!0});let a=o>0,r=o<n.length,l=i.map(g=>g.isSelf?`<div class="vs-move-strip-pill is-self">${b(g.label)}</div>`:`<div class="vs-move-strip-pill">${b(g.label)}</div>`).join(""),d="";if(o===0)d="First in navigation";else if(o>=n.length)d="Last in navigation";else{let g=((v=n[o-1])==null?void 0:v.label)||"",y=((m=n[o])==null?void 0:m.label)||"";d=`After ${g}, before ${y}`}return`
    <div class="vs-sc-form-field">
      <label class="vs-sc-form-label">Position</label>
      <div class="vs-move-reorder-controls">
        <button class="vs-move-arrow-btn ${a?"":"is-disabled"}"
                ${a?`data-action="select-move-position" data-position="${o-1}"`:"disabled"}
                aria-label="Move left">
          \u2190
        </button>
        <div class="vs-move-position-strip">
          ${l}
        </div>
        <button class="vs-move-arrow-btn ${r?"":"is-disabled"}"
                ${r?`data-action="select-move-position" data-position="${o+1}"`:"disabled"}
                aria-label="Move right">
          \u2192
        </button>
      </div>
      <div class="vs-sc-form-hint">${b(d)}</div>
    </div>
  `}function Wu(){return!Pt||ot===void 0||qt===null?!1:ot===Pt.parentHref&&qt===Pt.index}function Gu(){var n;let e=(n=ae)==null?void 0:n.nodes.get(pe);if(!e)return bn();let t=b(e.label||""),s=b(fi);if(fn==="success"&&uo){let o=uo,i=o.navLabelUpdated?'<p class="vs-sc-form-result-detail">Nav label updated</p>':"";return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${x.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Page renamed</p>
            <p class="vs-sc-form-result-detail">"${b(o.oldTitle)}" \u2192 "${b(o.newTitle)}"</p>
            ${i}
          </div>
        </div>
      </div>
    `}return fn==="error"&&po?`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${x.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${b(po)}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-rename">Dismiss</button>
        </div>
      </div>
    `:fn==="applying"?`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Renaming\u2026</span>
        </div>
      </div>
    `:`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Rename</h3>
      <p class="vs-sc-form-context">Current title: <strong>${s}</strong></p>
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label" for="vs-sc-rename-input">New title</label>
        <input
          type="text"
          id="vs-sc-rename-input"
          class="vs-sc-form-input"
          value="${t}"
          autocomplete="off"
          spellcheck="false"
        />
        <div class="vs-sc-form-hint" id="vs-sc-rename-hint"></div>
      </div>
      <div class="vs-sc-form-actions">
        <button
          class="vs-sc-form-btn"
          id="vs-sc-rename-submit"
          data-action="rename-submit"
          disabled
        >Rename</button>
        <button class="vs-sc-form-cancel" data-action="close-rename">Cancel</button>
      </div>
    </div>
  `}function Ku(){var u,p;let e=(u=ae)==null?void 0:u.nodes.get(pe);if(!e)return bn();let t=b(e.label||""),s=e.id.replace("page:","");if(ut==="success"&&mo){let c=mo;return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${x.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">"${b(((p=c.deletedPage)==null?void 0:p.title)||"")}" has been removed</p>
            ${c.navEntryRemoved?'<p class="vs-sc-form-result-detail">Nav entry removed</p>':""}
            ${c.navChildrenPromoted>0?`<p class="vs-sc-form-result-detail">${c.navChildrenPromoted} child nav ${c.navChildrenPromoted===1?"entry":"entries"} promoted</p>`:""}
            ${c.referencesCleanedUp>0?`<p class="vs-sc-form-result-detail">${c.referencesCleanedUp} ${c.referencesCleanedUp===1?"file":"files"} cleaned up</p>`:""}
            ${c.totalAffectedReferences>0&&!c.referencesCleanedUp?`<p class="vs-sc-form-result-detail">${c.totalAffectedReferences} ${c.totalAffectedReferences===1?"reference":"references"} may need review</p>`:""}
            ${c.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `}if(ut==="error"&&vo)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${x.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Delete failed</p>
            <p class="vs-sc-form-result-detail">${b(vo)}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-delete">Dismiss</button>
        </div>
      </div>
    `;if(ut==="applying")return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Deleting page\u2026</span>
        </div>
      </div>
    `;let n=Js(pe),o=[];if(n){let c=ae.edgesByTarget.get(n)||[],v=new Map;for(let m of c)if(m.type==="links_to"){let g=ae.nodes.get(m.source);if(g){let y=v.get(m.source)||{id:m.source,label:g.label||m.source,type:g.type,count:0};y.count++,v.set(m.source,y)}}o=Array.from(v.values())}let i=o.reduce((c,v)=>c+v.count,0),a="";ut==="armed"?a=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn vs-sc-form-btn-danger is-armed" data-action="delete-confirm">
          Confirm
        </button>
      </div>
    `:a=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn vs-sc-form-btn-danger" data-action="delete-arm">
          Delete this page
        </button>
        <button class="vs-sc-form-cancel" data-action="close-delete">Cancel</button>
      </div>
      <p class="vs-sc-delete-warning">This action cannot be undone.</p>
    `;let l=[{label:`Page file: ${b(s)}`,icon:x.fileText},{label:"Database entry",icon:x.database}].map(c=>`
    <li class="vs-sc-delete-checklist-item">
      <span class="vs-sc-delete-checklist-icon">${c.icon}</span>
      <span>${c.label}</span>
    </li>
  `).join(""),d="";if(o.length>0){let c=o.filter(g=>g.type!=="partial"),v=o.filter(g=>g.type==="partial"),m="";if(c.length>0){let g=c.map(y=>`<span class="vs-sc-delete-ref-chip">${b(y.label)}</span>`).join("");m+=`
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Links to this page will have their href set to # \u2014 the element and its styling are preserved">Unlinked</span>
          <div class="vs-sc-delete-ref-chips">${g}</div>
        </div>
      `}if(v.length>0){let g=v.map(y=>`<span class="vs-sc-delete-ref-chip">${b(y.label)}</span>`).join("");m+=`
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Navigation and footer entries linking to this page will be fully removed">Removed</span>
          <div class="vs-sc-delete-ref-chips">${g}</div>
        </div>
      `}d=`
      <div class="vs-sc-delete-section">
        <div class="vs-sc-delete-section-header">
          <span class="vs-sc-form-label" title="Links to this page in other files will be automatically cleaned up during deletion">References cleaned</span>
          <span class="vs-sc-delete-section-count">${i}</span>
        </div>
        ${m}
      </div>
    `}return`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Delete</h3>
      <p class="vs-sc-form-context">${b(s)}</p>
      <div class="vs-sc-delete-section">
        <span class="vs-sc-form-label">Will be removed</span>
        <ul class="vs-sc-delete-checklist">
          ${l}
        </ul>
      </div>
      ${d}
      ${a}
    </div>
  `}var Ei=null;function Td(){return setTimeout(()=>Md(),0),`
    <div id="vs-site-root" style="height: 100%;">
      <div class="vs-site-loading">
        <div class="vs-site-spinner"></div>
        <span>Building site structure\u2026</span>
      </div>
    </div>
  `}async function Md(){var o;let e=document.getElementById("vs-site-root");if(!e)return;let{ok:t,data:s}=await E.get("/site-graph");if(!t||!s){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">${x.globe}</div>
          <p class="vs-empty-state-title">Could not load site graph</p>
          <p class="vs-empty-state-desc">Check that your site has pages in the preview directory.</p>
          <button id="vs-site-retry" class="vs-btn vs-btn-primary vs-btn-sm">Retry</button>
        </div>
      </div>
    `,(o=document.getElementById("vs-site-retry"))==null||o.addEventListener("click",()=>Md());return}xs(Ms(s)),Ma(""),Ge.clear(),ci(null),Ks(null),Xs(null),$s(""),ns(as());let n=cd();n&&ae.nodes.has(n)?(Ot(n),n.startsWith("page:")&&ss(n),xn(n)):(Ot(null),ss(null),bi(null)),Id(e)}function Id(e){e.innerHTML=`
    <div class="vs-site-workspace vs-sc-three-panel">
      <div class="vs-sc-left" id="vs-sc-left"${Na("left")}>
        ${bd(ks)}
        <div class="vs-editor-resize" data-resize-panel="vs-sc-left"></div>
      </div>
      <div class="vs-sc-canvas" id="vs-sc-canvas">
        <div class="vs-site-diagram" id="vs-site-diagram">
          ${wd(ks)}
        </div>
        <div class="vs-sc-status-bar" id="vs-sc-status-bar">
          ${Xu()}
        </div>
      </div>
      <div class="vs-sc-right" id="vs-sc-right"${Na("right")}>
        <div class="vs-editor-resize" data-resize-panel="vs-sc-right" data-resize-side="left"></div>
        ${kd()}
      </div>
    </div>
  `,tv(e),requestAnimationFrame(()=>requestAnimationFrame(()=>go(ks)))}function Xu(){if(!ae)return"";let e=0,t=0,s=0;for(let[,d]of ae.nodes)d.type==="page"?e++:d.type==="partial"?t++:d.type==="route"&&s++;let n=`${e} page${e!==1?"s":""} \xB7 ${t} partial${t!==1?"s":""} \xB7 ${s} route${s!==1?"s":""}`,o=0;for(let[,d]of ae.nodes)d.type==="page"&&((ae.edgesByTarget.get(d.id)||[]).some(p=>p.type==="serves")||o++);let i=o===0,a=i?"vs-sc-status-healthy":"vs-sc-status-warning",r=i?"Healthy":`${o} unlinked`,l="";if(pe){let d=ae.nodes.get(pe);d&&(l=`${b(d.label||d.id)} selected`)}else if(ae.builtAt){let d=Math.round((Date.now()-new Date(ae.builtAt).getTime())/1e3);l=d<60?`Graph built ${d}s ago`:`Graph built ${Math.round(d/60)}m ago`}else ae.buildTimeMs&&(l=`Built in ${ae.buildTimeMs}ms`);return`
    <span class="vs-sc-status-stat">
      <span class="vs-sc-status-dot ${a}"></span>
      ${n}
      <span class="vs-sc-status-sep">\xB7</span>
      <span class="${a}">${r}</span>
    </span>
    <span class="vs-sc-status-stat">${l}</span>
  `}function bo(e){At&&(Ks(null),Xs(null),$s(""),Ee("idle"),Qe(null),$t(null)),Ys&&(os(),Ee("idle"),Qe(null),$t(null)),Cs&&yn(),Ss&&ki(),Ot(e),bi(e),e&&e.startsWith("page:")&&ss(e),e&&xn(e),se()}function yo(){Ks(null),Xs(null),$s(""),Ee("idle"),Qe(null),$t(null),Ys&&os(),Cs&&Ls(),Ss&&is(),Ot(null),bi(null),se()}async function xn(e){if(Ge.has(e))return;ci(e),se();let{ok:t,data:s}=await E.get("/site-graph/blast-radius?node="+encodeURIComponent(e));ro===e&&(ci(null),t&&s&&Ge.set(e,s),se())}async function Yu(){var a,r,l,d;if((a=window.demoGuard)!=null&&a.call(window)||!At||!Es)return;let e=(r=ae)==null?void 0:r.nodes.get(At),t=(e==null?void 0:e.label)||(e==null?void 0:e.id)||"",s=Oa(Es,t);if(!s.valid){Ee("idle"),se();return}Ee("applying"),Qe(null),se();let{ok:n,data:o,error:i}=await E.post("/site-control/url-rename",{routeId:At,newPath:s.cleanPath});if(n&&o){Ee("success"),$t(o),Yl(o.suggestedPrompt||null),o.newPageId&&(Ot(o.newPageId),ss(o.newPageId));let u=await E.get("/site-graph");if(u.ok&&u.data&&(xs(Ms(u.data)),Ge.clear(),ns(as())),o.newPageId&&xn(o.newPageId),o.oldPath&&o.newPath){let p=o.oldPath.replace(/^\//,"")+".php",c=o.newPath.replace(/^\//,"")+".php";(d=(l=window.__vsEditorPage)==null?void 0:l.reconcileMove)==null||d.call(l,p,c)}se(),setTimeout(()=>{Is(),se()},1500)}else Ee("error"),Qe(i||{message:"An unknown error occurred."}),se()}async function Ju(e){$d(e),se();let{ok:t,data:s}=await E.get("/site-control/nav-preflight?pageId="+encodeURIComponent(e));if(gi(!1),!t||!s){Aa("nav_parse_error"),se();return}Aa(s.navStatus||null),nd(s.isInNav||!1),od(s.isHomepage||!1),Ql(s.currentPosition||null),ed(s.navTree||null),sd(s.hasHomeEntry||!1),Zl(s.navStatus==="needs_normalization"),s.currentPosition&&(_a(s.currentPosition.parentHref??null),lo(s.currentPosition.index??0)),se()}async function Zu(){var s,n,o,i,a,r,l,d,u;if((s=window.demoGuard)!=null&&s.call(window)||!pe||qt===null)return;let e=((n=Pt)==null?void 0:n.parentHref)??null,t=ot!==e;if(Ee("applying"),Qe(null),se(),t){let p=ot?ot.replace(/^\//,""):"",{ok:c,data:v,error:m}=await E.post("/site-control/structural-move",{pageId:pe,targetParent:p});if(c&&v){if(Ee("success"),$t(v),((o=v.movedPages)==null?void 0:o.length)>0&&window.__vsEditorPage)for(let w of v.movedPages)(a=(i=window.__vsEditorPage).reconcileMove)==null||a.call(i,w.oldFilePath,w.newFilePath);let g=await E.get("/site-graph");g.ok&&g.data&&(xs(Ms(g.data)),Ge.clear(),ns(as()));let y=pe;((r=v.movedPages)==null?void 0:r.length)>0&&(y="page:"+v.movedPages[0].newFilePath,Ot(y),ss(y),xn(y));let f=await E.post("/site-control/nav-reorder",{pageId:y,targetParentHref:ot,targetIndex:qt});if(!f.ok&&((l=f.error)==null?void 0:l.code)!=="no_change"&&((d=f.error)==null?void 0:d.code)!=="page_not_in_nav"){Ee("error"),Qe({message:"Page moved successfully, but could not set the requested position: "+(((u=f.error)==null?void 0:u.message)||"Unknown error")}),se();return}let $=await E.get("/site-graph");$.ok&&$.data&&(xs(Ms($.data)),Ge.clear(),ns(as())),se(),setTimeout(()=>{ho(),se()},1500)}else Ee("error"),Qe(m||{message:"An unknown error occurred."}),se()}else{let p={pageId:pe,targetParentHref:ot,targetIndex:qt},{ok:c,data:v,error:m}=await E.post("/site-control/nav-reorder",p);if(c&&v){Ee("success"),$t(v);let g=pe;Ot(g),ss(g);let y=await E.get("/site-graph");y.ok&&y.data&&(xs(Ms(y.data)),Ge.clear(),ns(as())),xn(g),se(),setTimeout(()=>{ho(),se()},1500)}else Ee("error"),Qe(m||{message:"An unknown error occurred."}),se()}}async function Sd(e){var i;if((i=window.demoGuard)!=null&&i.call(window)||!pe||!e)return;hi("applying"),Pa(null),se();let t={pageId:pe,newTitle:e},{ok:s,data:n,error:o}=await E.post("/site-control/page-rename",t);if(s&&n){hi("success"),rd(n);let a=pe;Ot(a),ss(a);let r=await E.get("/site-graph");r.ok&&r.data&&(xs(Ms(r.data)),Ge.clear(),ns(as())),xn(a),se(),setTimeout(()=>{yn(),se()},1500)}else hi("error"),Pa((o==null?void 0:o.message)||"An unknown error occurred."),se()}async function Qu(){var n;if((n=window.demoGuard)!=null&&n.call(window)||!pe)return;Rt("applying"),Ra(null),se();let{ok:e,data:t,error:s}=await E.post("/site-control/page-delete",{pageId:pe});e&&t?(Rt("success"),dd(t),se(),setTimeout(async()=>{var a,r,l;let o=(a=t.deletedPage)==null?void 0:a.filePath;o&&((l=(r=window.__vsEditorPage)==null?void 0:r.reconcileDelete)==null||l.call(r,o)),Ot(null),ss(null);let i=await E.get("/site-graph");i.ok&&i.data&&(xs(Ms(i.data)),Ge.clear(),ns(as())),is(),se()},1800)):(Rt("error"),Ra((s==null?void 0:s.message)||"An unknown error occurred."),se())}function ev(e){let t=document.querySelector(`.vs-site-tree-group[data-tree-group="${e}"]`);vt.has(e)?(vt.delete(e),t&&t.classList.remove("is-collapsed")):(vt.add(e),t&&t.classList.add("is-collapsed"))}function se(){var l,d,u;let e=document.getElementById("vs-site-root");if(!e)return;let t=((l=document.activeElement)==null?void 0:l.id)==="vs-proposal-url",s=t?document.activeElement.selectionStart:null,n=((d=document.activeElement)==null?void 0:d.id)==="vs-sc-rename-input",o=n?document.activeElement.value:null,i=n?document.activeElement.selectionStart:null,a=((u=document.activeElement)==null?void 0:u.id)==="vs-sc-search",r=a?document.activeElement.selectionStart:null;if(Id(e),t){let p=document.getElementById("vs-proposal-url");p&&(p.focus(),s!==null&&p.setSelectionRange(s,s))}if(n){let p=document.getElementById("vs-sc-rename-input");p&&(p.value=o,p.focus(),i!==null&&p.setSelectionRange(i,i))}if(a){let p=document.getElementById("vs-sc-search");p&&(p.focus(),r!==null&&p.setSelectionRange(r,r))}}function tv(e){let t=e.querySelector("#vs-sc-search");if(t){let r;t.addEventListener("input",()=>{clearTimeout(r),r=setTimeout(()=>{var l;Ma(t.value.trim()),ns(as()),se(),(l=document.getElementById("vs-sc-search"))==null||l.focus()},150)})}e.querySelectorAll(".vs-sc-nav-section-header[data-nav-section]").forEach(r=>{r.addEventListener("click",()=>{let l=r.dataset.navSection,d=r.closest(".vs-sc-nav-section");d&&(Ts.has(l)?(Ts.delete(l),d.classList.remove("is-collapsed")):(Ts.add(l),d.classList.add("is-collapsed")),fd())})}),e.querySelectorAll(".vs-site-tree-item[data-page-id]").forEach(r=>{r.addEventListener("click",l=>{if(l.target.closest(".vs-site-tree-toggle"))return;let d=r.dataset.pageId;d&&bo(d)})}),e.querySelectorAll(".vs-site-tree-toggle[data-toggle-page]").forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation();let d=r.dataset.togglePage;d&&ev(d)})}),e.querySelectorAll(".vs-impact-item[data-node-id]").forEach(r=>{r.addEventListener("click",()=>{let l=r.dataset.nodeId;l&&bo(l)})}),e.querySelectorAll(".vs-site-card[data-page-id]").forEach(r=>{r.addEventListener("click",()=>{let l=r.dataset.pageId;l&&bo(l)})});let s=e.querySelector("#vs-site-diagram");s&&s.addEventListener("click",r=>{if(r.target===s||r.target.classList.contains("vs-site-tiers")){if(Fe==="armed"){Ee("idle"),se();return}if(ut==="armed"){Rt("idle"),se();return}yo()}}),e.querySelectorAll('[data-action="close-inspect"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),yo()})}),e.querySelectorAll(".vs-impact-ref-item[data-node-id]").forEach(r=>{r.addEventListener("click",()=>{let l=r.dataset.nodeId;l&&bo(l)})}),e.querySelectorAll("[data-card-toggle]").forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation();let d=r.dataset.cardToggle;if(!d)return;let u=r.closest(".vs-impact-card"),p=u==null?void 0:u.classList.contains("is-collapsed");yi.set(d,p?"open":"closed"),ud(),se()})}),e.querySelectorAll('[data-action="overflow"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation();let d=r.closest(".vs-sc-action-overflow");if(!d)return;if(d.classList.toggle("is-open")){let p=v=>{d.contains(v.target)||(d.classList.remove("is-open"),document.removeEventListener("click",p,!0))},c=v=>{v.key==="Escape"&&(v.stopPropagation(),v.preventDefault(),d.classList.remove("is-open"),document.removeEventListener("keydown",c,!0),document.removeEventListener("click",p,!0))};setTimeout(()=>{document.addEventListener("click",p,!0),document.addEventListener("keydown",c,!0)},0)}})}),e.querySelectorAll(".vs-sc-action-bar [data-action]").forEach(r=>{let l=r.dataset.action;l==="change-url"||l==="move"||l==="reorder"||l==="rename"||l==="delete"||l==="overflow"||r.addEventListener("click",d=>{d.stopPropagation();let u=r.closest(".vs-sc-action-bar"),p=(u==null?void 0:u.dataset.forNode)||pe;console.log("Action stub:",l,p)})}),e.querySelectorAll('[data-action="rename"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),pe&&(Cd(pe),se(),setTimeout(()=>{let d=document.getElementById("vs-sc-rename-input");d&&(d.focus(),d.select())},50))})}),e.querySelectorAll('[data-action="close-rename"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),yn(),se()})});let n=e.querySelector("#vs-sc-rename-input");if(n){let r=()=>{var v;let l=n.value.trim(),d=document.getElementById("vs-sc-rename-submit"),u=document.getElementById("vs-sc-rename-hint"),p=(v=ae)==null?void 0:v.nodes.get(pe),c=(p==null?void 0:p.label)||"";l?l===c?(d&&(d.disabled=!0),u&&(u.textContent="Same as current title",u.className="vs-sc-form-hint is-neutral")):(d&&(d.disabled=!1),u&&(u.textContent="",u.className="vs-sc-form-hint")):(d&&(d.disabled=!0),u&&(u.textContent="Title cannot be empty",u.className="vs-sc-form-hint is-error"))};n.addEventListener("input",r),n.addEventListener("keydown",l=>{if(l.key==="Enter"){l.preventDefault();let d=document.getElementById("vs-sc-rename-submit");d&&!d.disabled&&Sd(n.value.trim())}l.key==="Escape"&&(l.stopPropagation(),yn(),se())}),r()}e.querySelectorAll('[data-action="rename-submit"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation();let d=document.getElementById("vs-sc-rename-input");d&&Sd(d.value.trim())})}),e.querySelectorAll('[data-action="delete"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),pe&&(Ld(pe),se())})}),e.querySelectorAll('[data-action="close-delete"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),ki(),se()})}),e.querySelectorAll('[data-action="delete-arm"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),Rt("armed"),se(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{ut==="armed"&&(Rt("idle"),se())},3e3)})}),e.querySelectorAll('[data-action="delete-confirm"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),Qu()})}),e.querySelectorAll('[data-action="change-url"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),pe&&(Ed(pe,se),se())})}),e.querySelectorAll('[data-action="close-proposal"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),Is(),se()})}),e.querySelectorAll('[data-action="apply-proposal-arm"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),Ee("armed"),Qe(null),se(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{Fe==="armed"&&(Ee("idle"),se())},3e3)})}),e.querySelectorAll('[data-action="apply-proposal-confirm"]').forEach(r=>{r.addEventListener("click",async l=>{l.stopPropagation(),await Yu()})}),e.querySelectorAll("[data-navigate-node]").forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation();let d=r.dataset.navigateNode;d&&bo(d)})}),e.querySelectorAll('[data-action="reorder"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation();let d=r.closest(".vs-sc-action-bar"),u=(d==null?void 0:d.dataset.forNode)||pe;u&&Ju(u)})}),e.querySelectorAll('[data-action="close-move-proposal"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),ho(),se()})}),e.querySelectorAll('[data-action="select-move-parent"]').forEach(r=>{r.addEventListener("click",l=>{var p,c,v;l.stopPropagation();let d=r.dataset.parentHref,u=d==="__root__"?null:d;if(_a(u),Pt&&u===(Pt.parentHref??null))lo(Pt.index??0);else{let m=(p=ae)==null?void 0:p.nodes.get(pe),g=(c=m==null?void 0:m.meta)!=null&&c.isHomepage?"/":"/"+(((v=m==null?void 0:m.meta)==null?void 0:v.slug)||""),y=0;if(bt){if(u===null)y=bt.filter(f=>f.href!==g).length;else for(let f of bt)if(f.href===u){y=(f.children||[]).filter(h=>h.href!==g).length;break}}lo(y)}Ee("idle"),se()})}),e.querySelectorAll('[data-action="select-move-position"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),lo(parseInt(r.dataset.position,10)),Ee("idle"),se()})}),e.querySelectorAll('[data-action="apply-move-arm"]').forEach(r=>{r.addEventListener("click",l=>{l.stopPropagation(),Ee("armed"),Qe(null),se(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{Fe==="armed"&&(Ee("idle"),se())},3e3)})}),e.querySelectorAll('[data-action="apply-move-confirm"]').forEach(r=>{r.addEventListener("click",async l=>{l.stopPropagation(),await Zu()})});let o=e.querySelector("#vs-proposal-url");if(o){let r=null;o.addEventListener("input",()=>{clearTimeout(r),r=setTimeout(()=>{$s(o.value),se()},200)}),o.addEventListener("keydown",l=>{if(l.key==="Enter"&&l.preventDefault(),l.key==="Escape"){if(l.preventDefault(),l.stopPropagation(),Fe==="armed"){Ee("idle"),se();return}Is(),se()}}),Ba&&(pi(!1),setTimeout(()=>o.focus(),0))}let i=e.querySelector("#vs-sc-right-body");i&&i.addEventListener("click",r=>{if(!(r.target.closest("button")||r.target.closest("a")||r.target.closest("input"))){if(r.target.closest(".vs-proposal-panel")||r.target.closest(".vs-sc-form")){Fe==="armed"&&(Ee("idle"),se()),ut==="armed"&&(Rt("idle"),se());return}if(!r.target.closest(".vs-impact-detail-content")&&!r.target.closest(".vs-sc-summary")){if(Fe==="armed"){Ee("idle"),se();return}if(ut==="armed"){Rt("idle"),se();return}yo()}}});let a=e.querySelector("#vs-sc-left-scroll");a&&a.addEventListener("click",r=>{if(r.target===a){if(Fe==="armed"){Ee("idle"),se();return}if(ut==="armed"){Rt("idle"),se();return}yo()}}),Ia||(Xl(!0),document.addEventListener("keydown",r=>{var l,d,u;if(r.key==="Escape"){if(Fe==="armed"){Ee("idle"),se();return}if(ut==="armed"){Rt("idle"),se();return}if(Ss&&((l=document.activeElement)==null?void 0:l.tagName)!=="INPUT"){ki(),se();return}if(Cs&&((d=document.activeElement)==null?void 0:d.tagName)!=="INPUT"){yn(),se();return}pe&&((u=document.activeElement)==null?void 0:u.tagName)!=="INPUT"&&yo()}})),Ei&&window.removeEventListener("resize",Ei);{let r;Ei=()=>{clearTimeout(r),r=setTimeout(()=>{requestAnimationFrame(()=>go(ks))},150)},window.addEventListener("resize",Ei)}e.querySelectorAll(".vs-editor-resize[data-resize-panel]").forEach(r=>{let l=r.dataset.resizePanel,d=document.getElementById(l);if(!d)return;let u=r.dataset.resizeSide==="left";r.addEventListener("mousedown",p=>{if(p.preventDefault(),r.classList.add("is-dragging"),u){let c=m=>{let g=d.parentElement.getBoundingClientRect(),y=Math.min(400,Math.max(240,g.right-m.clientX));d.style.width=y+"px"},v=()=>{r.classList.remove("is-dragging"),document.removeEventListener("mousemove",c),document.removeEventListener("mouseup",v),Ha("right",d.offsetWidth),requestAnimationFrame(()=>go(ks))};document.addEventListener("mousemove",c),document.addEventListener("mouseup",v)}else{let c=d.getBoundingClientRect(),v=g=>{let y=Math.min(360,Math.max(180,g.clientX-c.left));d.style.width=y+"px"},m=()=>{r.classList.remove("is-dragging"),document.removeEventListener("mousemove",v),document.removeEventListener("mouseup",m),Ha("left",d.offsetWidth),requestAnimationFrame(()=>go(ks))};document.addEventListener("mousemove",v),document.addEventListener("mouseup",m)}})})}var Se=null,_d=null,Ke=null,Lt=null,Ht=null,et=null,Bd=!1,sv=80;var nv=60,xo=5,wo=6;function ov(e){return e.replace(/\(([⌘⇧⌥⌃\w+↵←→↑↓⌫]+)\)/g,(t,s)=>`<kbd class="vs-tooltip-kbd">${iv(s)}</kbd>`)}function iv(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function av(){if(Se)return;let e=document.createElement("div");e.className="vs-tooltip",e.setAttribute("role","tooltip");let t=document.createElement("span");t.className="vs-tooltip-content";let s=document.createElement("span");s.className="vs-tooltip-arrow",e.appendChild(t),e.appendChild(s),document.body.appendChild(e),Se=e,_d=s}function rv(e){if(!Se)return;let t=e.getBoundingClientRect(),s=Se.getBoundingClientRect(),n,o="above",i=t.top,a=window.innerHeight-t.bottom;i>=s.height+xo+wo?n=t.top-s.height-xo:a>=s.height+xo+wo?(n=t.bottom+xo,o="below"):i>=a?n=wo:(n=t.bottom+xo,o="below");let r=t.left+t.width/2,l=r-s.width/2;l=Math.max(wo,Math.min(l,window.innerWidth-wo-s.width));let d=r-l,u=Math.max(8,Math.min(s.width-8,d));Se.style.top=`${n}px`,Se.style.left=`${l}px`,_d.style.left=`${u}px`,Se.classList.remove("vs-tooltip--above","vs-tooltip--below"),Se.classList.add(`vs-tooltip--${o}`)}function lv(e){let t=e.getAttribute("data-tooltip")||e.getAttribute("title");!t||!t.trim()||(e.hasAttribute("title")&&(e.setAttribute("data-tooltip",e.getAttribute("title")),e.removeAttribute("title")),Ht&&(clearTimeout(Ht),Ht=null),Ke=e,Lt=null,av(),Se.querySelector(".vs-tooltip-content").innerHTML=ov(t.trim()),Se.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"),Se.style.display="flex",Se.style.opacity="0",requestAnimationFrame(()=>{Ke===e&&(rv(e),Se.classList.add("vs-tooltip--visible"),Se.style.opacity="")}))}function Ad(){Se&&(Ke&&(qa(Ke),Ke=null),Se.classList.remove("vs-tooltip--visible"),Se.classList.add("vs-tooltip--hiding"),Ht=setTimeout(()=>{Se&&(Se.style.display="none",Se.classList.remove("vs-tooltip--hiding")),Ht=null},nv))}function $i(){et&&(clearTimeout(et),et=null),Lt=null,Ke&&(qa(Ke),Ke=null),Ht&&(clearTimeout(Ht),Ht=null),Se&&(Se.style.display="none",Se.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))}function qa(e){if(!e)return;let t=e.getAttribute("data-tooltip");t&&!e.hasAttribute("title")&&(e.setAttribute("title",t),e.removeAttribute("data-tooltip"))}function Pd(e){for(;e&&e!==document.body;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentElement;continue}if(e.hasAttribute("data-tooltip-skip"))return null;if(e.hasAttribute("title")||e.hasAttribute("data-tooltip"))return e;e=e.parentElement}return null}function dv(e){if(e.buttons!==0)return;let t=Pd(e.target);if(!t){et&&(clearTimeout(et),et=null),Lt=null,Ke&&Ad();return}t!==Ke&&t!==Lt&&(et&&(clearTimeout(et),et=null),Ke&&(qa(Ke),Ke=null,Ht&&(clearTimeout(Ht),Ht=null),Se&&(Se.style.display="none",Se.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))),Lt=t,et=setTimeout(()=>{et=null,Lt===t&&lv(t)},sv))}function cv(e){let t=Pd(e.target);if(t)if(t===Ke){let s=e.relatedTarget;if(s&&t.contains(s))return;et&&(clearTimeout(et),et=null),Lt=null,Ad()}else t===Lt&&(et&&(clearTimeout(et),et=null),Lt=null)}function pv(){(Ke||Lt)&&$i()}function uv(){(Ke||Lt)&&$i()}function vv(){(Ke||Lt)&&$i()}function Rd(){Bd||(Bd=!0,document.addEventListener("mouseover",dv,{passive:!0}),document.addEventListener("mouseout",cv,{passive:!0}),document.addEventListener("scroll",pv,{passive:!0,capture:!0}),document.addEventListener("keydown",uv,{passive:!0}),document.addEventListener("mousedown",vv,{passive:!0}),window.addEventListener("resize",()=>{Ke&&$i()},{passive:!0}))}var Vd=Td,So=[{id:"create",label:"Create",defaultRoute:"chat",routes:[{route:"chat",label:"Chat",roles:["owner","editor"]},{route:"site-map",label:"Site",roles:["owner","editor"],badge:"Beta"},{route:"editor",label:"Editor",roles:["owner","editor"]}]},{id:"studio",label:"Studio",defaultRoute:"notes",routes:[{route:"notes",label:"Notes",roles:["owner","editor"]},{route:"board",label:"Board"}]},{id:"manage",label:"Manage",defaultRoute:"forms",routes:[{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"designs",label:"Designs",roles:["owner","editor"]}]}],Wd="vs-nav-group-last-",Ci=(()=>{let e={};for(let t of So)for(let s of t.routes)e[s.route]=t.id;return e})();function Ri(e){if(Ci[e])return Ci[e];let t=e.split("/")[0];return Ci[t]?Ci[t]:null}function mv(e){var i;let t=(i=P.get("user"))==null?void 0:i.role,s=e.routes.filter(a=>!a.roles||a.roles.includes(t));if(s.length===0)return e.defaultRoute;let n=localStorage.getItem(Wd+e.id);return n&&s.find(r=>r.route===n)?n:s.find(a=>a.route===e.defaultRoute)?e.defaultRoute:s[0].route}function gv(e){let t=Ri(e);if(t){let s=e.split("/")[0];localStorage.setItem(Wd+t,s)}}var Fh=So.flatMap(e=>e.routes),Va=["chat","editor"],fv="vs-first-run-guide-dismissed",Gd="vs-onboarding-draft-v1",Kd="vs-prompt-recents-v1",Xd="vs-prompt-pins-v1",hv=8,bv=5,Dd=5,yv=5*1024*1024,Wa=["image/jpeg","image/png","image/gif","image/webp"],_s=[],Ft=null,Xa=document.documentElement.dataset.demo==="true",xv=document.documentElement.dataset.demoHideBanner==="true",rs=Xa&&!xv,Yd=window.matchMedia("(max-width: 767px)");function Ii(){return Yd.matches}var wv={chat:"messageCircle",editor:"pencil",notes:"fileText",board:"layoutGrid",assets:"image",forms:"inbox",actions:"zap",designs:"palette","site-map":"globe"};function kv(){var i;let e=P.get("route"),t=(i=P.get("user"))==null?void 0:i.role,s=Ri(e),n=s?So.find(a=>a.id===s):null;if(!n)return[{route:"more",label:"More",icon:"ellipsis"}];let o=n.routes.filter(a=>(!a.roles||a.roles.includes(t))&&!Ja.includes(a.route)).map(a=>({route:a.route,label:a.label,icon:wv[a.route]||"layoutGrid"}));return o.push({route:"more",label:"More",icon:"ellipsis"}),o}function Ya(){var t;return((t=P.get("user"))==null?void 0:t.role)==="viewer"?"board":"chat"}var Ja=["chat","editor","site-map"];function St(){return Xa?(I("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function Jd(){let e=P.get("user");return e&&e.role!=="viewer"}function Di(){return Jd()?!1:(I("You have read-only access.","warning"),!0)}function Ev(){let e=P.get("user");return e&&e.role==="owner"}window.IS_DEMO=Xa;window.demoGuard=St;window.canWrite=Jd;window.viewerGuard=Di;window.isOwner=Ev;var Zd=document.getElementById("app");async function Qd(){var s,n;ir(),Fr(),Rd(),window.marked&&window.marked.use({renderer:{html(o){return b(typeof o=="string"?o:o.text)}}});let e=await E.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){Ud();return}P.batch(()=>{P.set("user",e.data.user),P.set("sessionToken",e.data.token),P.set("siteName",e.data.site_name||"")});let t=e.data.site_name;if(t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",o=>{var i;(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)&&(o.preventDefault(),o.returnValue="")}),dt.beforeEach(async(o,i)=>{var a;for(let r of(window.__vsFlushCallbacks||new Map).values())await r();return i.startsWith("editor")&&!o.startsWith("editor")&&(a=window.__hasUnsavedEditorChanges)!=null&&a.call(window)?await ll():(i.startsWith("notes")&&!o.startsWith("notes")&&Nl(),i.startsWith("board")&&!o.startsWith("board")&&Gl(),!0)}).on("chat",()=>ze()).on("editor",()=>ze()).on("pages",()=>ze()).on("pages/:slug",()=>ze()).on("assets",()=>ze()).on("forms",()=>ze()).on("forms/:formId",()=>ze()).on("notes",()=>ze()).on("board",()=>ze()).on("actions",()=>ze()).on("actions/:actionId",()=>ze()).on("designs",()=>ze()).on("site-map",()=>ze()).on("settings",()=>ze()).on("team",()=>ze()).on("profile",()=>ze()).onNotFound(()=>dt.navigate(Ya())),P.on("user",o=>{o||Ud()}),ec(),Yd.addEventListener("change",()=>{ze()}),Ii()){let i=(window.location.hash||"").replace(/^#\/?/,"");if(!i||Ja.includes(i)){let a=((n=P.get("user"))==null?void 0:n.role)==="viewer"?"board":"assets";window.location.hash=`#/${a}`}}dt.start()}async function ec(){try{let{ok:e,data:t}=await E.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){P.set("pages",t.pages),cc();let s=document.getElementById("chat-messages");(s==null?void 0:s.querySelector(".vs-empty-state"))&&(s.innerHTML=En(),kn())}}catch{}}function ze(){var l;let e=P.get("route"),t=Va.includes(e);gv(e),Un()&&cn(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s=Ii()&&Ja.includes(e),o=((l=P.get("user"))==null?void 0:l.role)==="viewer",i;s?i=Lv(e):e==="editor"?i=o?ko():gr():e==="notes"?i=o?ko():`<div class="h-full overflow-hidden">${Ml()}</div>`:e==="board"?i=`<div class="h-full overflow-hidden">${Sa()}</div>`:e==="site-map"?i=o?ko():Vd():t?i=o?ko():Cv():i=ko();let a=e==="chat"&&!Ii(),r=a?"bottom-[32px]":"bottom-0";Zd.innerHTML=`
    ${$v()}
    <div class="fixed top-[48px] ${r} left-0 right-0 overflow-hidden">
      ${i}
    </div>
    ${a?Hv():""}
    ${Nv()}
    ${jv()}
    ${qv()}
    ${bl()}
    ${Gv()}
  `,Jv(),Ov(),e==="editor"&&!s&&!o&&fr()}function $v(){let e=P.get("route"),t=P.get("user"),s=P.get("theme"),n=t==null?void 0:t.role,o=Ri(e),i=So.filter(l=>l.routes.some(d=>!d.roles||d.roles.includes(n))).map(l=>{let d=l.id===o,u=mv(l);return`
        <button class="vs-nav-group ${d?"vs-nav-group-active":""}"
                data-group="${l.id}"
                data-target="${u}">${l.label}</button>
      `}).join(""),a=o?So.find(l=>l.id===o):null,r=a?a.routes.filter(l=>!l.roles||l.roles.includes(n)).map(l=>{let d=e===l.route||e.startsWith(l.route+"/");return`
            <a href="#/${l.route}"
               class="vs-nav-item ${d?"vs-nav-item-active":""}">
              ${l.label}${l.badge?`<span class="vs-nav-badge-beta">${b(l.badge)}</span>`:""}
            </a>
          `}).join(""):"";return`
    <header class="vs-topbar">
      <div class="vs-topbar-inner">
        <!-- Left: Logo + Group links (architecture) -->
        <div class="vs-topbar-left">
          <a href="#/${Ya()}" class="vs-logo" title="${b(P.get("siteName")||"VoxelSite")}">
            <span class="vs-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
                <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
                <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
              </svg>
            </span>
          </a>
          <nav class="vs-nav-groups" aria-label="Workspace">${i}</nav>
          ${rs?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${x.eye} Demo
            </span>
          `:""}
          <span id="vs-global-status" class="vs-global-status">
            <span class="vs-global-status-dot"></span>
            <span class="vs-global-status-text"></span>
          </span>
        </div>

        <!-- Center: Route tabs (contextual mode) -->
        <div class="vs-topbar-center">
          ${r?`<nav class="vs-nav-routes" aria-label="Section navigation"><div class="vs-nav-pill"></div>${r}</nav>`:""}
        </div>

        <!-- Right: Search hint + Theme + User -->
        <div class="vs-topbar-right flex items-center gap-1.5">
          <button id="btn-command-palette"
            class="vs-btn-ghost vs-btn-sm hidden sm:flex items-center gap-2"
            title="Prompt library">
            <span class="text-vs-text-ghost">Prompts...</span>
            <span class="vs-kbd">\u2318K</span>
          </button>

          <button id="btn-theme-toggle"
            class="vs-btn-ghost vs-btn-icon"
            title="${s==="dark"?"Switch to light":"Switch to dark"}">
            ${s==="dark"?x.sun:x.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${x.user}
              <span class="hidden sm:inline">${b((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${n!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${n==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${x.pencil} Edit Profile
              </a>
              ${n==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${x.users} Team Members
                </a>
              `:""}
              ${n==="owner"?`
                <a href="#/settings" id="btn-settings-nav" class="vs-dropdown-item">
                  ${x.settings} Settings
                </a>
              `:""}
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${x.logOut} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function Cv(){let e=P.get("sidebarWidth"),t=P.get("activeConversationId"),s=P.get("activePageScope"),n=tc(s),o=(()=>{if(s){let i=s;return i.endsWith(".php")||i.endsWith(".html")?i:i+".php"}return window.__vsCurrentPreviewPath||"index.php"})();return window.__vsCurrentPreviewPath=o,`
    <div class="flex h-full">
      <!-- Conversation Panel -->
      <div id="conversation-panel" class="h-full border-r border-vs-border-subtle bg-vs-bg-base flex flex-col relative"
           style="width: ${e}px; min-width: 360px; max-width: 580px;">

        <!-- Resize Handle -->
        <div id="resize-handle" class="vs-resize-handle"></div>

        <!-- Context Bar -->
        <div class="vs-panel-header">
          <div class="flex items-center gap-2">
            <button id="btn-scope-selector"
              class="vs-btn vs-btn-ghost vs-btn-sm" style="gap: 4px;">
              ${x.fileText}
              <span id="scope-label" class="text-vs-text-secondary">${b(n)}</span>
              ${x.chevronDown}
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-new-chat"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="New conversation">
              ${x.newChat}
            </button>
            <button id="btn-toggle-history"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="Conversation history">
              ${x.history}
            </button>
          </div>
        </div>

        <!-- Conversation History Panel (hidden by default) -->
        <div id="conversation-history-panel" class="hidden border-b border-vs-border-subtle bg-vs-bg-surface overflow-y-auto shrink-0" style="max-height: 280px;">
          <div id="conversation-list" class="py-1">
            <div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>
          </div>
        </div>

        <!-- Chat Messages Area -->
        <div id="chat-messages" class="flex-1 overflow-y-auto px-5 py-6">
          ${En()}
        </div>

        <!-- Prompt Bar -->
        <div class="vs-prompt-area">
          <div class="vs-prompt-container">
            <input type="file" id="image-file-input" accept="image/jpeg,image/png,image/gif,image/webp" multiple class="hidden" />
            <div id="image-attachments" class="vs-image-attachments" hidden></div>
            <div id="website-ref-chip" class="vs-website-ref-chip" hidden>
              ${x.globe}
              <span id="website-ref-chip-label">Website reference</span>
              <button id="btn-remove-website-ref" class="vs-chip-remove" title="Remove reference"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <textarea id="prompt-input"
              class="vs-prompt-input vs-textarea"
              placeholder="Describe what you want to build..."
              rows="3"
              style="max-height: 200px;"></textarea>
            <div class="vs-prompt-toolbar">
              <div class="flex items-center gap-0.5">
                <button id="btn-attach-image"
                  class="vs-prompt-attach-btn"
                  title="Attach images">
                  ${x.image}
                </button>
                <button id="btn-attach-website"
                  class="vs-prompt-attach-btn"
                  title="Use website as reference">
                  ${x.globe}
                </button>
                ${window.SpeechRecognition||window.webkitSpeechRecognition?`
                <button id="btn-voice-input"
                  class="vs-prompt-attach-btn"
                  title="Voice input">
                  ${x.mic}
                </button>`:""}
              </div>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (\u2318+Enter)">
                ${x.send}
              </button>
            </div>
            <div id="website-ref-sheet" class="vs-website-ref-sheet" hidden>
              <label class="vs-input-label">Reference URL</label>
              <input type="url" id="website-ref-url"
                class="vs-input"
                placeholder="https://example.com"
                autocomplete="off" />
              <div id="website-ref-restyle-options" hidden>
                <label class="vs-input-label" style="margin-top: 12px;">Current site content</label>
                <select id="website-ref-mode" class="vs-input">
                  <option value="keep" selected>Keep current content</option>
                  <option value="adapt">Adapt content to fit the new design</option>
                </select>
              </div>
              <p id="website-ref-helper" class="vs-website-ref-disclaimer">
                Uses an existing website as design reference.
              </p>
              <div class="flex gap-2" style="margin-top: 12px;">
                <button id="btn-website-ref-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
                <button id="btn-website-ref-confirm" class="vs-btn vs-btn-primary vs-btn-sm" style="flex: 1;">Attach</button>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between mt-2 px-1">
            <span class="text-2xs text-vs-text-ghost">\u2318+Enter to send \xB7 drop images to attach</span>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="vs-preview-panel-wrapper flex-1 h-full bg-vs-bg-well flex flex-col">
        <!-- Preview Toolbar (aligned with chat header) -->
        <div class="vs-panel-header vs-preview-toolbar">
          <div class="vs-device-toggle">
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${x.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${x.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${x.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Enter visual editor (V)">
              ${x.pencil} Edit
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${x.rotateCcw} Refresh
            </button>
            <button id="btn-save-design" class="vs-btn vs-btn-ghost vs-btn-xs" title="Save to Designs" disabled>
              ${x.save} Save
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${x.externalLink}
            </button>
          </div>
        </div>

        <!-- Preview Iframe -->
        <div id="preview-frame-container" class="vs-preview-frame" style="margin: 16px 20px 20px 20px;">
          <iframe id="preview-iframe" class="w-full h-full border-0" src="/_studio/api/router.php?_path=%2Fpreview&path=${encodeURIComponent(o)}"
            sandbox="allow-scripts allow-same-origin"
            data-voxelsite-preview
            title="Website preview"
            data-tooltip-skip></iframe>
        </div>
      </div>
    </div>
  `}function Lv(e){let t={editor:{name:"Code Editor",desc:"The code editor needs a wider screen for the file tree, editor pane, and preview."},chat:{name:"AI Chat",desc:"The AI conversation and live preview work side-by-side. That needs a wider screen."},"site-map":{name:"Site Control",desc:"The site graph and inspector panels need a wider screen to display properly."}},s=t[e]||t.chat,n=s.name,o=s.desc;return`
    <div class="h-full overflow-y-auto">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 18px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
          ${x.monitor}
        </div>
        <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 10px;">${n}</h1>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 6px; max-width: 280px; line-height: 1.6;">${o}</p>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0; max-width: 280px; line-height: 1.6;">Open Studio on a desktop or tablet to use this feature.</p>
      </div>
    </div>
  `}function ko(){let e=P.get("route"),t=P.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${Sv(e,t)}
      </div>
    </div>
  `}function Sv(e,t){let s=P.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return xl();case"forms":return vl();case"forms/:formId":return ml(t.formId);case"actions":return cl();case"actions/:actionId":return pl(t.actionId);case"designs":return n==="owner"||n==="editor"?El():Eo();case"site-map":return n==="owner"||n==="editor"?Vd():Eo();case"notes":return Eo();case"board":return Sa();case"settings":return n==="owner"?rl():Eo();case"team":return n==="owner"?hl():Eo();case"profile":return Bv();default:return Tv("Not Found","This page doesn't exist.")}}function Eo(){let e=Ya();return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/${e}" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${e==="board"?"\u2190 Back to Board":"\u2190 Back to Chat"}</a>
    </div>
  `}function Tv(e,t){return`
    <div class="vs-empty-state" style="min-height: 300px;">
      <div class="vs-empty-state-inner">
        <div class="vs-empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
            <path style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
            <path style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
            <path style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
          </svg>
        </div>
        <p class="vs-empty-state-title">${e}</p>
        <p class="vs-empty-state-desc" style="margin-bottom: 0;">${t}</p>
      </div>
    </div>
  `}function Mv(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return x[t[s]||"layoutGrid"]||x.layoutGrid}var Fa=null,Hd=null,Nd=null;function Iv(){requestAnimationFrame(()=>{var d,u;let e=document.querySelector(".vs-nav-routes"),t=e==null?void 0:e.querySelector(".vs-nav-pill"),s=e==null?void 0:e.querySelector(".vs-nav-item-active");if(!e||!t||!s)return;let n=((u=(d=document.querySelector(".vs-nav-group-active"))==null?void 0:d.dataset)==null?void 0:u.group)||"",o=e.getBoundingClientRect(),i=s.getBoundingClientRect(),a=i.left-o.left,r=i.width;Fa===null||!(Nd===n)?(t.style.transition="none",t.style.transform=`translateX(${a}px)`,t.style.width=`${r}px`,t.offsetHeight,t.style.transition=""):(t.style.transition="none",t.style.transform=`translateX(${Fa}px)`,t.style.width=`${Hd}px`,t.offsetHeight,t.style.transition="",t.style.transform=`translateX(${a}px)`,t.style.width=`${r}px`),Fa=a,Hd=r,Nd=n})}function jd(e){dt.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function Bv(){let e=P.get("user")||{};return setTimeout(()=>_v(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Edit Profile</h1>
        <p class="vs-page-subtitle">Update your account details.</p>
      </div>

      <!-- Card: Profile -->
      <div class="vs-settings-card">
        <h2 class="vs-settings-card-title">Personal Info</h2>
        <p class="vs-settings-card-subtitle">Your name and email address.</p>
        <div class="flex flex-col gap-4">
          <div>
            <label class="vs-input-label" for="profile-name">Name</label>
            <input type="text" id="profile-name" class="vs-input" value="${b(e.name||"")}" placeholder="Your name" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-email">Email</label>
            <input type="email" id="profile-email" class="vs-input" value="${b(e.email||"")}" placeholder="you@example.com" />
          </div>
        </div>
        <div class="vs-settings-card-footer">
          <span id="profile-info-feedback" class="text-sm"></span>
          <button id="btn-save-profile" class="vs-btn vs-btn-primary vs-btn-sm">
            Save Profile
          </button>
        </div>
      </div>

      <!-- Card: Password -->
      <div class="vs-settings-card">
        <h2 class="vs-settings-card-title">Change Password</h2>
        <p class="vs-settings-card-subtitle">Use a strong password with at least 8 characters.</p>
        <div class="flex flex-col gap-4">
          <div>
            <label class="vs-input-label" for="profile-current-pw">Current Password</label>
            <input type="password" id="profile-current-pw" class="vs-input" placeholder="Enter current password" autocomplete="current-password" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-new-pw">New Password</label>
            <input type="password" id="profile-new-pw" class="vs-input" placeholder="Enter new password" autocomplete="new-password" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-confirm-pw">Confirm New Password</label>
            <input type="password" id="profile-confirm-pw" class="vs-input" placeholder="Confirm new password" autocomplete="new-password" />
          </div>
        </div>
        <div class="vs-settings-card-footer">
          <span id="profile-pw-feedback" class="text-sm"></span>
          <button id="btn-save-password" class="vs-btn vs-btn-primary vs-btn-sm">
            Update Password
          </button>
        </div>
      </div>
    </div>
  `}function _v(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var d,u,p,c;let o=(u=(d=document.getElementById("profile-name"))==null?void 0:d.value)==null?void 0:u.trim(),i=(c=(p=document.getElementById("profile-email"))==null?void 0:p.value)==null?void 0:c.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:r,data:l}=await E.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(l!=null&&l.user)?(P.set("user",l.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>ze(),800)):t&&(t.textContent=(r==null?void 0:r.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var d,u,p;let o=((d=document.getElementById("profile-current-pw"))==null?void 0:d.value)||"",i=((u=document.getElementById("profile-new-pw"))==null?void 0:u.value)||"",a=((p=document.getElementById("profile-confirm-pw"))==null?void 0:p.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:r,error:l}=await E.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",r?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(l==null?void 0:l.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function Av(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),Pv()):e.classList.add("hidden")}async function Pv(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await E.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${b((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=P.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let r=a.id===i,l=a.title||"Untitled conversation",d=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${r?"vs-conv-item-active":""}"
              data-conversation-id="${b(a.id)}">
        <span class="mt-0.5 shrink-0 ${r?"text-vs-accent":"text-vs-text-ghost"}">${x.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${r?"font-medium":""}" style="font-size: var(--text-sm);">${b(l)}</div>
          <div class="vs-conv-time mt-0.5">${d}</div>
        </div>
        ${r?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let r=a.dataset.conversationId;Bi(r);let l=document.getElementById("conversation-history-panel");l&&l.classList.add("hidden")})})}async function Bi(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await E.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){P.set("activeConversationId",null),Ai(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=En(),kn();return}let i=n.conversation,a=i.prompts||[];P.set("activeConversationId",e),Ai(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=En(),kn();return}let r="",l=!1;for(let d of a){let{text:u,images:p,webRefUrl:c}=sm(d.user_prompt),v=p.length>0?`<div class="vs-msg-user-images">${p.map(g=>`<img src="${g}" class="vs-msg-user-image" />`).join("")}</div>`:"",m=c?`<div class="vs-msg-user-webref"><a href="${ge(c)}" target="_blank" rel="noopener" title="${ge(c)}">${x.globe} <span>${b(Pn(c))}</span></a></div>`:"";if(r+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${v}
        ${m}
        ${u?`<div class="text-sm text-vs-text-primary leading-relaxed">${b(u)}</div>`:""}
      </div>
    `,d.ai_response||d.files_modified){let g="",y=typeof d.ai_message=="string"&&d.ai_message.trim()!==""?d.ai_message:d.ai_response;y&&(g=Mi(y));let f="";if(d.files_modified)try{let w=JSON.parse(d.files_modified);if(Array.isArray(w)&&w.length>0){let k=w.map(_=>{let D=typeof _=="string"?_:_.path||_,q=typeof _=="object"&&_.action==="delete";return`<div class="vs-file-badge ${q?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${q?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${b(String(D))}</span>
              </div>`}).join(""),T=w.length;f=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${T} file${T!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${k}</div>
              </div>`}}catch{}let h="";if(d.evaluation_issues)try{let w=JSON.parse(d.evaluation_issues);if(Array.isArray(w)&&w.length>0){let k=O=>O==="error"?"#ef4444":O==="warning"?"#d97706":"#6b7280",T=O=>O==="error"?"rgba(239,68,68,0.1)":O==="warning"?"rgba(217,119,6,0.1)":"rgba(107,114,128,0.1)",_={error:0,warning:0,info:0};w.forEach(O=>{_[O.severity]=(_[O.severity]||0)+1});let D=[];_.error&&D.push(`${_.error} error${_.error>1?"s":""}`),_.warning&&D.push(`${_.warning} warning${_.warning>1?"s":""}`),_.info&&D.push(`${_.info} suggestion${_.info>1?"s":""}`);let q=_.error>0?"error":_.warning>0?"warning":"info",Q=q==="error"?"rgba(239,68,68,0.15)":q==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)",X=w.map(O=>`
              <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${k(O.severity)}; background: ${T(O.severity)};">${b(O.severity)}</span>
                  <span style="font-size: 11px; color: var(--vs-text-ghost);">${b(O.category||"")}</span>
                  ${O.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${b(O.file)}${O.line?":"+O.line:""}</span>`:""}
                </div>
                <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${b(O.description||"")}</div>
                ${O.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${b(O.suggested_fix)}</div>`:""}
              </div>
            `).join("");h=`
              <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${Q}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
                <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${k(q)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>Expert Review \xB7 ${D.join(", ")}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <div style="border-top: 1px solid var(--vs-border-subtle);">
                  <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
                  ${X}
                </div>
              </details>`}}catch{}let $=d.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${g}</div>
          ${f}
          ${h}
          ${$}
        </div>
      `}else if(d.status==="streaming"){l=!0;let g=d.id,y=d.status_message||"Generation in progress...";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            ${y}
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${g})"
              class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
          </div>
        </div>
      `}else d.status==="partial"?r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 text-sm rounded-lg" style="background: var(--vs-warning-dim, rgba(234,179,8,0.1)); color: var(--vs-warning, #eab308);">
            Generation was interrupted. Some files may be missing \u2014 send a follow-up prompt to complete the site.
          </div>
        </div>
      `:d.status==="error"&&(r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>
        </div>
      `)}t.innerHTML=r,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),l&&!window.__vsResumedToastByConversation[e]&&(I("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),l||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(d){try{await E.post("/ai/cancel-generation",{prompt_id:d})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",Bi(e)},l&&P.get("activeConversationId")===e&&!P.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{P.get("activeConversationId")===e&&!P.get("aiStreaming")&&Bi(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function Rv(){P.set("activeConversationId",null),Ai(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=En(),kn());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function tc(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function _i(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=tc(t)}function Ai(e){P.set("activePageScope",e||null),_i(),Un()&&cn()}async function Dv(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" style="max-width: 560px; max-height: 80vh; display: flex; flex-direction: column;">
      <div class="vs-modal-header" style="flex-shrink: 0;">
        <h2 class="vs-modal-title">Your Pages</h2>
        <p class="vs-modal-desc">All pages on your website. Files scanned from the preview directory.</p>
      </div>
      <div style="height: 6px;"></div>
      <div id="vs-pages-modal-body" style="overflow-y: auto; flex: 1; padding: 0 24px 20px; min-height: 0;">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading pages...</div>
      </div>
      <div class="vs-modal-footer" style="flex-shrink: 0;">
        <button id="vs-pages-modal-close" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Close</button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>we(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),ke(t,s),t.addEventListener("keydown",u=>{u.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await E.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${b((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let r=i.pages;if(!r.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${x.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let l='<div style="display: flex; flex-direction: column; gap: 2px;">';r.forEach(u=>{let p=!!Number(u.is_homepage),c=u.title||u.slug||u.path,v=u.path||u.slug+".php",m="/"+v.replace(/\.php$/,"").replace(/^index$/,""),g=m==="/"?"/":m,y=Mv(u.slug),h=(window.__vsCurrentPreviewPath||"index.php")===v,$=u.size?(u.size/1024).toFixed(1)+" KB":"";l+=`
      <div class="vs-pages-modal-item ${h?"is-active":""}" data-slug="${b(u.slug)}" data-path="${b(v)}" data-title="${b(c)}" data-url="${b(g)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${y}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${b(c)}${p?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${b(v)}${$?" \xB7 "+$:""}
            </div>
          </div>
        </div>
        <div class="vs-pages-modal-actions" style="display: flex; align-items: center; gap: 2px; flex-shrink: 0;">
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="edit" title="Edit in Chat" style="width:28px;height:28px;">
            ${x.messageCircle}
          </button>
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="preview" title="Open in Preview" style="width:28px;height:28px;">
            ${x.eye}
          </button>
          ${p?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${x.trash2}
          </button>
          `}
        </div>
      </div>
    `}),l+="</div>",n.innerHTML=l;let d=t.querySelector(".vs-modal-desc");d&&(d.textContent=`${r.length} page${r.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(u=>{u.addEventListener("click",p=>{p.stopPropagation();let c=u.closest(".vs-pages-modal-item"),v=c.dataset.slug,m=c.dataset.path,g=c.dataset.title,y=c.dataset.url,f=u.dataset.action;if(f==="edit")Ai(v),s(),jd(`Edit the "${g}" page (${y}): `);else if(f==="preview"){let h=document.getElementById("preview-iframe");h?(Un()&&cn(),h.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m)+"&t="+Date.now(),window.__vsCurrentPreviewPath=m,_i(),s(),I(`Preview: ${g}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m),"_blank")}else if(f==="delete"){s();let h=`Delete the "${g}" page (${y}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;jd(h)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(u=>{u.addEventListener("click",p=>{if(p.target.closest(".vs-pages-action"))return;let c=u.dataset.path,v=u.dataset.title,m=document.getElementById("preview-iframe");m?(m.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(c)+"&t="+Date.now(),window.__vsCurrentPreviewPath=c,_i(),s(),I(`Preview: ${v}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(c),"_blank")})})}function kn(){var e;document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let s=document.getElementById("prompt-input");s&&(s.value=t.dataset.quickPrompt,s.dataset.actionType=t.dataset.actionType||"free_prompt",s.focus(),s.setSelectionRange(0,s.value.length),s.dispatchEvent(new Event("input",{bubbles:!0})))})}),(e=document.getElementById("chat-new-design"))==null||e.addEventListener("click",()=>{St()||Di()||ya()})}function En(){let e=P.get("pages")||[],t=e.length>0,s=new Set(e.map(h=>h.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(h=>{let $=h.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has($)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],r=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],l=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],d=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],u=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],p,c,v;if(!t)c="What are we building?",v="Describe your website and watch it appear in the preview. Every detail is a conversation away.",p=za(n).slice(0,6);else{c="What\u2019s next?",v="Your site is live in preview. Pick a suggestion or describe any change you want.";let h=[...o,...o,...i,...a,...r,...l,...d,...u];p=za(h).slice(0,6);let $=new Set;if(p=p.filter(w=>$.has(w.label)?!1:($.add(w.label),!0)),p.length<6){let w=za(h).filter(k=>!$.has(k.label));for(let k of w){if(p.length>=6)break;p.push(k),$.add(k.label)}}}let m=p.map(h=>`<button data-quick-prompt="${b(h.prompt).replace(/"/g,"&quot;")}" data-action-type="${h.type}"
      class="vs-style-card">${b(h.label)}</button>`).join(`
        `),g=P.get("user"),f=t&&((g==null?void 0:g.role)==="owner"||(g==null?void 0:g.role)==="editor")?`
      <div class="vs-animate-in vs-stagger-5" style="margin-top: 16px; text-align: center;">
        <button id="chat-new-design" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
          ${x.filePlus} Start a new design from scratch
        </button>
      </div>
  `:"";return`
    <div class="vs-empty-state">
      <div class="vs-empty-icon vs-animate-in vs-stagger-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
          <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
          <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
        </svg>
      </div>
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${c}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${v}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${m}
      </div>
      ${f}
    </div>
  `}function za(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function Hv(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <button id="btn-undo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Undo (\u2318Z)">
          ${x.undo} Undo
        </button>
        <button id="btn-redo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Redo (\u2318\u21E7Z)">
          ${x.redo} Redo
        </button>
        <button id="btn-preview-site" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${x.externalLink} Preview
        </button>
        <button id="btn-snapshot" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${x.camera} Snapshot
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-download" class="vs-btn vs-btn-ghost vs-btn-xs" title="Download your website">
          ${x.download} Download
        </button>
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <div class="vs-publish-split">
          <button id="btn-publish"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-main">
            ${x.publish} Publish
          </button>
          <button id="btn-publish-menu"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-chevron"
            title="More publish options">
            ${x.chevronUp}
          </button>
        </div>
      </div>
    </footer>
  `}function Nv(){let e=P.get("route");return`
    <nav class="vs-mobile-nav" aria-label="Mobile navigation">
      ${kv().map(n=>{if(n.route==="more")return`
        <button class="vs-mobile-nav-item ${!Ri(e)?"vs-mobile-nav-item-active":""}" id="btn-mobile-more" aria-label="More">
          ${x[n.icon]||x.layoutGrid}
          <span>${n.label}</span>
        </button>
      `;let o=e===n.route||e.startsWith(n.route+"/");return`
      <a href="#/${n.route}"
         class="vs-mobile-nav-item ${o?"vs-mobile-nav-item-active":""}"
         aria-label="${n.label}">
        ${x[n.icon]||x.layoutGrid}
        <span>${n.label}</span>
      </a>
    `}).join("")}
    </nav>
  `}function jv(){let e=P.get("user"),t=e==null?void 0:e.role,s=P.get("theme"),n="";return t==="owner"&&(n+=`
      <a href="#/settings" class="vs-mobile-more-item" data-mobile-more-nav>
        ${x.settings} Settings
      </a>
    `),n+=`
    <a href="#/profile" class="vs-mobile-more-item" data-mobile-more-nav>
      ${x.pencil} Edit Profile
    </a>
  `,t==="owner"&&(n+=`
      <a href="#/team" class="vs-mobile-more-item" data-mobile-more-nav>
        ${x.users} Team Members
      </a>
    `),(t==="owner"||t==="editor")&&(n+=`
      <button id="btn-mobile-prompts" class="vs-mobile-more-item">
        ${x.zap} Prompts
      </button>
    `),n+=`
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-theme" class="vs-mobile-more-item">
      ${s==="dark"?x.sun:x.moon}
      ${s==="dark"?"Light mode":"Dark mode"}
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-publish" class="vs-mobile-more-item" style="color: var(--vs-accent); font-weight: 600;">
      ${x.publish} Publish
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-logout" class="vs-mobile-more-item" style="color: var(--vs-error);">
      ${x.logOut} Sign Out
    </button>
  `,`
    <div id="mobile-more-sheet" class="vs-mobile-more-sheet">
      <div class="vs-mobile-more-backdrop" id="mobile-more-backdrop"></div>
      <div class="vs-mobile-more-content">
        <div class="vs-mobile-more-header">
          <span class="vs-mobile-more-title">${b((e==null?void 0:e.name)||"Menu")}</span>
          <button id="btn-mobile-more-close" class="vs-mobile-more-close">${x.x}</button>
        </div>
        ${n}
      </div>
    </div>
  `}function Ov(){if(!Ii())return;let e=document.getElementById("btn-mobile-more"),t=document.getElementById("mobile-more-sheet"),s=document.getElementById("mobile-more-backdrop"),n=document.getElementById("btn-mobile-more-close");function o(){t==null||t.classList.add("vs-sheet-open")}function i(){t==null||t.classList.remove("vs-sheet-open")}e&&e.addEventListener("click",o),s&&s.addEventListener("click",i),n&&n.addEventListener("click",i),document.querySelectorAll("[data-mobile-more-nav]").forEach(u=>{u.addEventListener("click",i)});let a=document.getElementById("btn-mobile-prompts");a&&a.addEventListener("click",()=>{i(),Ga()});let r=document.getElementById("btn-mobile-theme");r&&r.addEventListener("click",()=>{No(),i(),ze()});let l=document.getElementById("btn-mobile-publish");l&&l.addEventListener("click",()=>{var u;i(),!St()&&((u=document.getElementById("btn-publish"))==null||u.click())});let d=document.getElementById("btn-mobile-logout");d&&d.addEventListener("click",async()=>{i(),await E.post("/auth/logout"),window.location.href="/_studio/"})}function qv(){return`
    <div id="command-palette" class="hidden fixed inset-0 z-[120]">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" data-command-overlay></div>
      <div class="absolute left-1/2 top-[12vh] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-vs-border-subtle bg-vs-bg-surface shadow-2xl overflow-hidden">
        <div class="px-3 py-3">
          <input id="command-palette-input" type="text" autocomplete="off"
            class="w-full text-sm text-vs-text-primary placeholder:text-vs-text-ghost focus:outline-none"
            style="background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); border-radius: 10px; padding: 10px 14px; transition: border-color 0.15s;"
            onfocus="this.style.borderColor='var(--vs-accent)'"
            onblur="this.style.borderColor='var(--vs-border-subtle)'"
            placeholder="Search prompts...">
        </div>
        <div id="command-palette-results" class="max-h-[56vh] overflow-y-auto p-2">
          <div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>
        </div>
        <div class="px-4 py-2 border-t border-vs-border-subtle text-[11px] text-vs-text-ghost flex items-center justify-between">
          <span>\u2191 \u2193 move</span>
          <span>Enter insert</span>
          <span>\u2318P pin</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  `}function sc(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>ac(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function nc(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function oc(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function Hi(){return nc(Xd)}function Za(){return nc(Kd)}function ic(e){let t=Hi(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];oc(Xd,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};Lo(n.query||"",n.activeIndex||0)}function Fv(e){let t=Za().filter(n=>n!==e),s=[e,...t].slice(0,8);oc(Kd,s)}function ac(e){if(P.get("route")!=="chat"){dt.navigate("chat"),setTimeout(()=>ac(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function rc(e,t="free_prompt",s=!1){if(P.get("route")!=="chat"){dt.navigate("chat"),setTimeout(()=>rc(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?Pi():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function $o(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function Ga(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),Lo(e,0))}function Co(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function zv(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function Uv(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=zv(s,n);return i===null?null:70+i}function Vv(e){let t=(e||"").trim().toLowerCase(),s=sc(),n=Hi(),o=Za();return s.map(i=>{let a=Uv(t,i);if(a===null)return null;let r=n.includes(i.id)?-12:0,l=o.includes(i.id)?-8:0;return{...i,__score:a+r+l}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function Wv(e){let t=sc(),s=Object.fromEntries(t.map(p=>[p.id,p])),n=(e||"").trim(),o=[];if(n!==""){let p=Vv(e).slice(0,18);return p.length>0&&o.push({title:"Results",commands:p}),o}let i=Za(),a=Hi(),r=new Set,l=i.map(p=>s[p]).filter(Boolean);l.length>0&&(o.push({title:"Recent",commands:l}),l.forEach(p=>r.add(p.id)));let d=a.map(p=>s[p]).filter(p=>p&&!r.has(p.id));return d.length>0&&(o.push({title:"Pinned",commands:d}),d.forEach(p=>r.add(p.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(p=>{let c=t.filter(v=>v.group===p&&!r.has(v.id));c.length>0&&(o.push({title:p,commands:c}),c.forEach(v=>r.add(v.id)))}),o}function Lo(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Wv(e),o=n.flatMap(d=>d.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=Hi();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let r="",l=0;n.forEach(d=>{r+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${b(d.title)}</div>`,d.commands.forEach(u=>{let p=l===i,c=a.includes(u.id);r+=`
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${l}"
            class="vs-cmd-item ${p?"vs-cmd-item-active":""}">
            <div class="min-w-0">
              <div class="vs-cmd-item-title">${b(u.title)}</div>
              <div class="vs-cmd-item-desc">${b(u.prompt?u.prompt.substring(0,80)+(u.prompt.length>80?"\u2026":""):u.meta)}</div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${b(u.id)}"
            class="vs-cmd-pin ${c?"vs-cmd-pin-active":""}"
            title="${c?"Unpin":"Pin"}">
            ${c?"\u2605":"\u2606"}
          </button>
        </div>
      `,l+=1})}),s.innerHTML=r,s.querySelectorAll("[data-command-index]").forEach(d=>{d.addEventListener("click",()=>{let u=parseInt(d.dataset.commandIndex||"0",10);lc(u)})}),s.querySelectorAll("[data-command-pin]").forEach(d=>{d.addEventListener("click",u=>{u.preventDefault(),u.stopPropagation();let p=d.dataset.commandPin;p&&ic(p)})})}function lc(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(Fv(n.id),Co(),Promise.resolve(n.run()).catch(()=>{}))}function Gv(){return`
    <div id="onboarding-modal" class="hidden fixed inset-0 z-[130]">
      <div class="absolute inset-0 bg-black/45 backdrop-blur-[2px]" data-onboarding-overlay></div>
      <div class="absolute left-1/2 top-[8vh] w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-vs-border-subtle bg-vs-bg-surface shadow-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-vs-border-subtle flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold text-vs-text-secondary">Guided Website Setup</h2>
            <p id="onboarding-step-label" class="text-xs text-vs-text-ghost mt-0.5">Step 1 of 3</p>
          </div>
          <button id="btn-close-onboarding" class="vs-btn vs-btn-ghost vs-btn-xs">Close</button>
        </div>
        <div class="px-5 pt-3">
          <div id="onboarding-step-indicator" class="grid grid-cols-3 gap-2"></div>
        </div>
        <div id="onboarding-step-body" class="px-5 py-4 max-h-[54vh] overflow-y-auto"></div>
        <div class="px-5 py-4 border-t border-vs-border-subtle flex items-center justify-between">
          <button id="btn-onboarding-prev" class="vs-btn vs-btn-ghost vs-btn-sm">Back</button>
          <div class="flex items-center gap-2">
            <button id="btn-onboarding-next" class="vs-btn vs-btn-secondary vs-btn-sm">Next</button>
            <button id="btn-onboarding-generate" class="vs-btn vs-btn-primary vs-btn-sm hidden">Build Website</button>
          </div>
        </div>
      </div>
    </div>
  `}function Li(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function Zs(){try{let e=localStorage.getItem(Gd);if(!e)return Li();let t=JSON.parse(e);return{...Li(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Li().pages}}catch{return Li()}}function dc(e){try{localStorage.setItem(Gd,JSON.stringify(e))}catch{}}function Ti(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function Od(){let e=window.__vsOnboarding||{step:1,draft:Zs()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||Zs(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),r=document.getElementById("btn-onboarding-next"),l=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!r||!l)return;let d=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${d[t-1]}`,n.innerHTML=d.map((u,p)=>{let c=p+1===t,v=p+1<t;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${c?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":v?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${p+1}. ${b(u)}</div>
      </div>
    `}).join(""),t===1)i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Business Name</label>
          <input id="onboard-business-name" type="text" class="vs-input w-full" value="${b(s.business_name)}" placeholder="e.g. Harbor & Pine Studio">
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Business Type</label>
          <input id="onboard-business-type" type="text" class="vs-input w-full" value="${b(s.business_type)}" placeholder="e.g. interior design studio">
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Core Offer</label>
          <textarea id="onboard-offer" class="vs-textarea w-full" rows="4" placeholder="What do you sell or provide?">${b(s.offer)}</textarea>
        </div>
      </div>
    `;else if(t===2)i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Target Audience</label>
          <textarea id="onboard-audience" class="vs-textarea w-full" rows="3" placeholder="Who should this website attract?">${b(s.audience)}</textarea>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Visual Style</label>
            <select id="onboard-style" class="vs-input w-full">
              <option value="modern-minimal" ${s.style==="modern-minimal"?"selected":""}>Modern Minimal</option>
              <option value="bold-vibrant" ${s.style==="bold-vibrant"?"selected":""}>Bold Vibrant</option>
              <option value="elegant-classic" ${s.style==="elegant-classic"?"selected":""}>Elegant Classic</option>
              <option value="playful-creative" ${s.style==="playful-creative"?"selected":""}>Playful Creative</option>
              <option value="dark-premium" ${s.style==="dark-premium"?"selected":""}>Dark Premium</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Copy Tone</label>
            <select id="onboard-tone" class="vs-input w-full">
              <option value="confident" ${s.tone==="confident"?"selected":""}>Confident</option>
              <option value="friendly" ${s.tone==="friendly"?"selected":""}>Friendly</option>
              <option value="luxury" ${s.tone==="luxury"?"selected":""}>Luxury</option>
              <option value="playful" ${s.tone==="playful"?"selected":""}>Playful</option>
            </select>
          </div>
        </div>
      </div>
    `;else{let u=[{key:"home",label:"Home"},{key:"about",label:"About"},{key:"services",label:"Services"},{key:"portfolio",label:"Portfolio"},{key:"pricing",label:"Pricing"},{key:"blog",label:"Blog"},{key:"contact",label:"Contact"}];i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-2">Pages to Create</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${u.map(p=>`
              <label class="flex items-center gap-2 text-xs text-vs-text-secondary rounded-lg border border-vs-border-subtle px-2.5 py-2">
                <input type="checkbox" class="accent-[var(--vs-accent)]" data-onboard-page="${p.key}" ${s.pages.includes(p.key)?"checked":""}>
                <span>${p.label}</span>
              </label>
            `).join("")}
          </div>
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Content Mode</label>
          <select id="onboard-content-mode" class="vs-input w-full">
            <option value="ai" ${s.content_mode==="ai"?"selected":""}>AI writes content for me</option>
            <option value="placeholder" ${s.content_mode==="placeholder"?"selected":""}>Use realistic placeholder content</option>
            <option value="guided" ${s.content_mode==="guided"?"selected":""}>Leave structured blocks for my copy</option>
          </select>
        </div>
      </div>
    `}a.disabled=t===1,r.classList.toggle("hidden",t===3),l.classList.toggle("hidden",t!==3),Kv()}function Kv(){let e=window.__vsOnboarding||{draft:Zs()},t=()=>{var n,o,i,a,r,l,d,u,p,c,v;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((l=(r=document.getElementById("onboard-offer"))==null?void 0:r.value)==null?void 0:l.trim())||e.draft.offer||"",audience:((u=(d=document.getElementById("onboard-audience"))==null?void 0:d.value)==null?void 0:u.trim())||e.draft.audience||"",style:((p=document.getElementById("onboard-style"))==null?void 0:p.value)||e.draft.style||"modern-minimal",tone:((c=document.getElementById("onboard-tone"))==null?void 0:c.value)||e.draft.tone||"confident",content_mode:((v=document.getElementById("onboard-content-mode"))==null?void 0:v.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(m=>m.checked).map(m=>m.dataset.onboardPage).filter(Boolean)),dc(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function Xv(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function Yv(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>Ti());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>Ti());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Zs()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,Od()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Zs()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,Od()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:Zs()}).draft||Zs(),r=Xv(a);try{localStorage.setItem(fv,"1")}catch{}dc(a),Ti(),rc(r,"create_site",!0)})}function Jv(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var V,te;let N=No()==="light";e.innerHTML=N?x.sun:x.moon,e.title=N?"Switch to dark":"Switch to light",window.__vsEditorPage&&((V=window.monaco)!=null&&V.editor)&&window.monaco.editor.setTheme(js()),document.getElementById("vs-code-editor-overlay")&&((te=window.monaco)!=null&&te.editor)&&window.monaco.editor.setTheme(js())}),document.querySelectorAll(".vs-nav-group").forEach(L=>{L.addEventListener("click",()=>{let N=L.dataset.target;N&&dt.navigate(N)})}),Iv();let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{Ga()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>Co());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{Lo(n.value,0)}),n.addEventListener("keydown",L=>{let N=window.__vsCommandPalette||{commands:[],activeIndex:0};if((L.metaKey||L.ctrlKey)&&L.key.toLowerCase()==="p"){L.preventDefault();let F=N.commands[N.activeIndex];F&&ic(F.id);return}if(L.key==="ArrowDown"){L.preventDefault(),Lo(n.value,N.activeIndex+1);return}if(L.key==="ArrowUp"){L.preventDefault(),Lo(n.value,N.activeIndex-1);return}if(L.key==="Enter"){L.preventDefault(),lc();return}L.key==="Escape"&&(L.preventDefault(),Co())})),Yv();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",L=>{L.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",L=>{!i.classList.contains("hidden")&&!i.contains(L.target)&&L.target!==o&&!o.contains(L.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav","btn-settings-nav"].forEach(L=>{let N=document.getElementById(L);N&&i&&N.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await E.post("/auth/logout"),window.location.href="/_studio/"});let r=document.getElementById("btn-undo-status");r&&r.addEventListener("click",()=>{St()||Fd()});let l=document.getElementById("btn-redo-status");l&&l.addEventListener("click",()=>{St()||zd()});let d=document.getElementById("btn-preview-site");d&&d.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let u=document.getElementById("btn-snapshot");u&&u.addEventListener("click",async()=>{var V;if(St())return;u.disabled=!0,Bs("Creating snapshot...");let{ok:L,data:N,error:F}=await E.post("/snapshots",{type:"manual",label:"Manual snapshot"});u.disabled=!1,Bs(L?`\u2713 Snapshot saved (${((V=N==null?void 0:N.snapshot)==null?void 0:V.file_count)||0} files)`:"\u2717 "+((F==null?void 0:F.message)||"Snapshot failed"),L?"success":"error",4e3)});let p=document.getElementById("btn-download");p&&((async()=>{var V;let{ok:L,data:N}=await E.get("/settings");((V=N==null?void 0:N.settings)==null?void 0:V.last_published_at)||(p.disabled=!0,p.title="Publish your site first to enable download.",p.classList.add("opacity-40"))})(),p.addEventListener("click",()=>{p.disabled||St()||em()}));let c=document.getElementById("btn-publish");c&&(wn(),c.addEventListener("click",async()=>{var ye,tt;let L=Io();if(L.publishing)return;if(L.hasChanges===!1){I("No unpublished changes to publish.","warning");return}let N=L.counts||{added:0,modified:0,deleted:0},F=Number(N.added||0)+Number(N.modified||0)+Number(N.deleted||0),V=localStorage.getItem("vs_publish_snapshot"),ee=await Qv({totalChanges:F,snapshotDefault:V===null?!0:V!=="false"});if(!ee||St())return;localStorage.setItem("vs_publish_snapshot",String(ee.createSnapshot)),L.publishing=!0,wn(),Bs("Publishing...");let{ok:j,data:oe,error:me}=await E.post("/publish",{create_snapshot:ee.createSnapshot});if(L.publishing=!1,j){let rt=((ye=oe==null?void 0:oe.published)==null?void 0:ye.length)||0,Tt=((tt=oe==null?void 0:oe.removed)==null?void 0:tt.length)||0,Mt=Tt>0?`Published ${rt} file(s), removed ${Tt} stale file(s).`:`Published ${rt} file(s).`;I(Mt,"success"),Bs(`\u2713 ${rt} published, ${Tt} removed`,"success",5e3),P.set("previewDirty",!1),ls({silent:!0}),window.open("/","_blank")}else I((me==null?void 0:me.message)||"Publish failed.","error"),Bs("\u2717 "+((me==null?void 0:me.message)||"Publish failed"),"error",5e3),ls({silent:!0})}));let v=document.getElementById("btn-publish-menu");v&&v.addEventListener("click",L=>{L.stopPropagation();let N=document.querySelector(".vs-publish-dropup");if(N){N.remove();return}let F=document.createElement("div");F.className="vs-publish-dropup",F.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${x.cloudOff} Unpublish
        </button>
      `;let V=v.closest(".vs-publish-split");V?V.appendChild(F):v.parentElement.appendChild(F),F.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(F.remove(),!await Ce({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0})||St())return;Bs("Unpublishing...");let{ok:oe,data:me,error:ye}=await E.post("/publish/unpublish");oe?(I("Unpublished. Default page restored.","success"),Bs("\u2713 Site unpublished","success",5e3),ls({silent:!0})):(I((ye==null?void 0:ye.message)||"Unpublish failed.","error"),Bs("\u2717 "+((ye==null?void 0:ye.message)||"Unpublish failed"),"error",5e3))});let te=j=>{!F.contains(j.target)&&j.target!==v&&(F.remove(),document.removeEventListener("click",te))};setTimeout(()=>document.addEventListener("click",te),0);let ee=j=>{j.key==="Escape"&&(F.remove(),document.removeEventListener("keydown",ee),document.removeEventListener("click",te))};document.addEventListener("keydown",ee)});let m=document.getElementById("resize-handle"),g=document.getElementById("conversation-panel");if(m&&g){let L,N;m.addEventListener("mousedown",F=>{F.preventDefault(),L=F.clientX,N=g.offsetWidth;let V=ee=>{let j=ee.clientX-L,oe=Math.min(580,Math.max(340,N+j));g.style.width=`${oe}px`,P.set("sidebarWidth",oe)},te=()=>{document.removeEventListener("mousemove",V),document.removeEventListener("mouseup",te)};document.addEventListener("mousemove",V),document.addEventListener("mouseup",te)})}let y=document.getElementById("prompt-input");y&&(y.addEventListener("input",()=>{y.style.height="auto",y.style.height=Math.min(200,y.scrollHeight)+"px"}),y.addEventListener("keydown",L=>{L.key==="Enter"&&(L.metaKey||L.ctrlKey)&&(L.preventDefault(),Pi())}));let f=document.getElementById("btn-send");f&&f.addEventListener("click",Pi);let h=document.getElementById("btn-attach-image"),$=document.getElementById("image-file-input");h&&$&&(h.addEventListener("click",()=>$.click()),$.addEventListener("change",()=>{$.files.length>0&&(Ua($.files),$.value="")})),im();let w=document.getElementById("btn-voice-input");if(w){let L=window.SpeechRecognition||window.webkitSpeechRecognition,N=null,F=!1,V=()=>{F=!1,w.classList.remove("is-recording"),w.innerHTML=x.mic};w.addEventListener("click",()=>{if(F){N&&N.stop();return}if(location.protocol!=="https:"&&location.hostname!=="localhost"&&location.hostname!=="127.0.0.1"){I("Voice input requires HTTPS","warning");return}N=new L,N.continuous=!1,N.interimResults=!1,N.lang=navigator.language||"en-US",N.onstart=()=>{F=!0,w.classList.add("is-recording")},N.onresult=te=>{var me,ye;let ee=(ye=(me=te.results[0])==null?void 0:me[0])==null?void 0:ye.transcript;if(!ee)return;let j=document.getElementById("prompt-input");if(!j)return;let oe=j.value;j.value=oe+(oe.length>0?" ":"")+ee,j.dispatchEvent(new Event("input",{bubbles:!0})),j.style.height="auto",j.style.height=j.scrollHeight+"px",j.focus()},N.onerror=te=>{if(te.error==="no-speech")return;let j={"audio-capture":"No microphone found","not-allowed":"Microphone permission denied",network:"Speech service unavailable",aborted:null}[te.error];j?I(j,"warning"):j!==null&&console.warn("[VoxelSite] Voice input error:",te.error)},N.onend=()=>{V();let te=document.getElementById("prompt-input");te&&te.focus()};try{N.start()}catch(te){console.warn("[VoxelSite] Voice input failed to start:",te.message),I("Voice input unavailable","warning"),V()}})}let k=document.querySelector(".vs-prompt-area");k&&(k.addEventListener("dragover",L=>{L.preventDefault(),L.stopPropagation(),k.classList.add("vs-drag-over")}),k.addEventListener("dragleave",L=>{L.preventDefault(),L.stopPropagation(),k.classList.remove("vs-drag-over")}),k.addEventListener("drop",L=>{L.preventDefault(),L.stopPropagation(),k.classList.remove("vs-drag-over");let N=Array.from(L.dataTransfer.files).filter(F=>Wa.includes(F.type));N.length>0&&Ua(N)})),y&&y.addEventListener("paste",L=>{var V;let F=Array.from(((V=L.clipboardData)==null?void 0:V.items)||[]).filter(te=>te.kind==="file"&&Wa.includes(te.type));if(F.length>0){L.preventDefault();let te=F.map(ee=>ee.getAsFile()).filter(Boolean);Ua(te)}}),kn();let T=document.getElementById("btn-new-chat");T&&T.addEventListener("click",Rv);let _=document.getElementById("btn-scope-selector");_&&_.addEventListener("click",()=>{Dv()});let D=document.getElementById("btn-toggle-history");D&&D.addEventListener("click",Av);let q=document.getElementById("btn-visual-editor");q&&q.addEventListener("click",()=>aa());let Q=document.getElementById("btn-refresh-preview");Q&&Q.addEventListener("click",()=>$n());let X=document.getElementById("btn-save-design");if(X){X.addEventListener("click",()=>{St()||Di()||Jn()});let L=()=>{let N=P.get("pages")||[];X.disabled=N.length===0};L(),P.on("pages",L)}let O=document.querySelectorAll("[data-device]"),de=document.getElementById("preview-frame-container");if(O.length&&de){let L={desktop:"100%",tablet:"768px",mobile:"375px"};O.forEach(N=>{N.addEventListener("click",()=>{let F=N.dataset.device,V=L[F]||"100%";F==="desktop"?(de.style.maxWidth="",de.style.width="",de.style.alignSelf=""):(de.style.maxWidth=V,de.style.width="100%",de.style.alignSelf="center"),O.forEach(te=>{te.classList.remove("vs-device-btn-active"),te.dataset.device===F&&te.classList.add("vs-device-btn-active")})})})}let J=document.getElementById("btn-external-preview");J&&J.addEventListener("click",()=>{let L=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(L),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",L=>{var F,V;let N=(V=(F=L.target)==null?void 0:F.closest)==null?void 0:V.call(F,"[data-code-toggle]");N&&(L.preventDefault(),rm(N))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",L=>{if((L.metaKey||L.ctrlKey)&&L.key==="k"){L.preventDefault(),$o()?Co():Ga();return}if(L.key==="Escape"&&$o()){L.preventDefault(),Co();return}if(L.key==="Escape"&&Si()){L.preventDefault(),Ti();return}if((L.metaKey||L.ctrlKey)&&L.key==="z"&&!L.shiftKey){if($o()||Si()||P.get("route")!=="chat")return;let N=document.activeElement;if(N&&(N.tagName==="INPUT"||N.tagName==="TEXTAREA"))return;L.preventDefault(),Fd()}if((L.metaKey||L.ctrlKey)&&L.key==="z"&&L.shiftKey){if($o()||Si()||P.get("route")!=="chat")return;let N=document.activeElement;if(N&&(N.tagName==="INPUT"||N.tagName==="TEXTAREA"))return;L.preventDefault(),zd()}if(L.key==="v"&&!L.metaKey&&!L.ctrlKey&&!L.altKey&&!L.shiftKey){if($o()||Si())return;let N=document.activeElement;if(N&&(N.tagName==="INPUT"||N.tagName==="TEXTAREA"||N.isContentEditable))return;let F=P.get("route");if(!Va.includes(F))return;L.preventDefault(),aa()}if(L.key==="Escape"&&Un()){if(L.preventDefault(),Go())return;if(ra()){la();return}if(Or()){Vn();return}cn();return}}));let H=P.get("route");if(Va.includes(H))try{let L=P.get("activeConversationId"),N=localStorage.getItem("vs-active-conversation"),F=L||N,V=document.getElementById("chat-messages"),te=V==null?void 0:V.querySelector(".vs-empty-state");F&&!P.get("aiStreaming")?(L||P.set("activeConversationId",F),te&&Bi(F)):F||V&&V.children.length===0&&(V.innerHTML=En(),kn())}catch{}Mo(),tm()}function Zv(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=P.get("pages"),s=!t||t.length===0,n=s?"Building your site":"Applying your changes",o=s?"Generating a new website can take up to 10 minutes.<br>Please be patient while the AI works.":"Small changes can take a minute, larger updates can take up to 10 minutes.",i=document.createElement("div");i.className="vs-generating-overlay",i.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">${n}</div>
    <div class="vs-gen-subtitle">${o}</div>
    <div class="vs-gen-note">Keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-metrics" id="overlay-metrics"></div>
  `,e.appendChild(i)}function qd(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function $n(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=$n;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),_i())}));function Ka(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{$n()}}window.sendPreviewMessage=Ka;async function Fd(){Vn(),(await E.post("/revisions/undo")).ok&&(setTimeout(()=>$n(),300),await Mo(),ls({silent:!0}))}async function zd(){Vn(),(await E.post("/revisions/redo")).ok&&(setTimeout(()=>$n(),300),await Mo(),ls({silent:!0}))}async function Mo(){let{ok:e,data:t}=await E.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!s,r.title=o,r.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!n,r.title=i,r.classList.toggle("opacity-40",!n))})}function Io(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function To(e,t){let s=document.getElementById("vs-global-status");if(!s)return;let n=s.querySelector(".vs-global-status-dot"),o=s.querySelector(".vs-global-status-text");if(!(!n||!o))switch(window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s.className="vs-global-status",e){case"saving":s.classList.add("vs-global-status--active","vs-global-status--saving"),o.textContent=t||"Saving\u2026";break;case"saved":s.classList.add("vs-global-status--active","vs-global-status--saved"),o.textContent=t||"Saved",window.__vsStatusResetTimer=setTimeout(()=>{To("idle")},2e3);break;case"loading":s.classList.add("vs-global-status--active","vs-global-status--loading"),o.textContent=t||"Loading\u2026";break;case"error":s.classList.add("vs-global-status--active","vs-global-status--error"),o.textContent=t||"Error",window.__vsStatusResetTimer=setTimeout(()=>{To("idle")},4e3);break;case"idle":default:o.textContent="";break}}function Bs(e,t="neutral",s=0){To(t==="success"?"saved":t==="error"?"error":"idle",e),s>0&&(window.__vsStatusResetTimer&&clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=setTimeout(()=>{To("idle")},s))}window.__vsSetGlobalStatus=To;function wn(){let e=Io(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=r=>{s&&(r?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${x.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${x.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${x.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${x.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let r=a===1?"":"s";n.textContent=`${a} unpublished change${r}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${x.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=wn;function Qv({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var l,d;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Publish Website</h2>
          <p class="vs-modal-desc">${b(o)}</p>
          <label class="vs-modal-option" for="vs-publish-snapshot-cb">
            <input type="checkbox" id="vs-publish-snapshot-cb" ${t?"checked":""}>
            <span class="vs-modal-option-check">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span class="vs-modal-option-label">Create snapshot before publishing</span>
          </label>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-confirm-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Publish</button>
        </div>
      </div>
    `;let a=u=>{u.key==="Escape"&&(u.preventDefault(),r(null))},r=u=>{document.removeEventListener("keydown",a),we(i),s(u)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),ke(i,()=>r(null)),(l=document.getElementById("vs-confirm-cancel"))==null||l.addEventListener("click",()=>r(null)),(d=document.getElementById("vs-confirm-ok"))==null||d.addEventListener("click",()=>{let u=document.getElementById("vs-publish-snapshot-cb");r({createSnapshot:u?u.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var u;return(u=document.getElementById("vs-confirm-ok"))==null?void 0:u.focus()},220)})}function em(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=Io().hasChanges===!0?`
    <div class="vs-download-warning">
      <div class="vs-download-warning-content">
        ${x.alertTriangle}
        <span>You have unpublished changes. This export reflects your last published version.</span>
      </div>
      <a href="#" id="vs-download-publish-link" class="vs-download-publish-link">Publish first \u2192</a>
    </div>
  `:"",o=document.createElement("div");o.id="vs-download-modal-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header" style="position: relative;">
        <button id="vs-download-close" class="vs-download-close-btn" type="button" title="Close">
          ${x.x}
        </button>
        <h2 class="vs-modal-title">Download Your Website</h2>
        <p class="vs-modal-desc">Take your files anywhere. No VoxelSite required to run them.</p>
      </div>
      <div class="vs-modal-body" style="padding-top: 16px;">
        ${n}
        <div class="vs-download-cards" id="vs-download-cards">
          <button type="button" class="vs-download-card is-selected" data-format="php">
            <div class="vs-download-card-icon">
              ${x.fileCode}
            </div>
            <div class="vs-download-card-body">
              <div class="vs-download-card-title">
                PHP Website
                <span class="vs-download-badge">Recommended</span>
              </div>
              <p class="vs-download-card-desc">Your complete website source. PHP pages, stylesheets, scripts, and all your assets. Upload to any shared hosting with PHP support.</p>
            </div>
          </button>
          <button type="button" class="vs-download-card" data-format="html">
            <div class="vs-download-card-icon">
              ${x.globe}
            </div>
            <div class="vs-download-card-body">
              <div class="vs-download-card-title">Static HTML</div>
              <p class="vs-download-card-desc">Every page rendered to plain HTML. Open directly in a browser, or drop on any static host or CDN. No PHP required.</p>
              <p class="vs-download-card-note">Dynamic features like contact forms require a server.</p>
            </div>
          </button>
        </div>
      </div>
      <div style="padding: 0 24px 24px;">
        <button id="vs-download-action" class="vs-btn vs-btn-primary" type="button" style="width: 100%; justify-content: center; height: 42px; font-size: 14px; font-weight: 600;">
          ${x.download} Download PHP
        </button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=c=>{c.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),we(o)};o.querySelector("#vs-download-close").addEventListener("click",a),ke(o,a),document.addEventListener("keydown",i);let r=o.querySelector("#vs-download-publish-link");r&&r.addEventListener("click",c=>{c.preventDefault(),a(),setTimeout(()=>{let v=document.getElementById("btn-publish");v&&!v.disabled&&v.click()},400)});let l=o.querySelectorAll(".vs-download-card"),d=o.querySelector("#vs-download-action"),u="php";l.forEach(c=>{c.addEventListener("click",()=>{if(c.classList.contains("is-loading"))return;l.forEach(m=>m.classList.remove("is-selected")),c.classList.add("is-selected"),u=c.dataset.format;let v=u==="php"?"Download PHP":"Download HTML";d.innerHTML=`${x.download} ${v}`})});let p=!1;d.addEventListener("click",async()=>{var c;if(!p){p=!0,d.disabled=!0,d.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',l.forEach(v=>v.style.pointerEvents="none");try{let v=P.get("sessionToken"),m={"Content-Type":"application/json",Accept:"application/zip"};v&&(m["X-VS-Token"]=v);let g=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:m,credentials:"same-origin",body:JSON.stringify({format:u})});if(!g.ok){let T="Export failed.";try{let _=await g.json();T=((c=_==null?void 0:_.error)==null?void 0:c.message)||T}catch{}I(T,"error");return}let f=(g.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),h=f?f[1]:`site-${u}-${new Date().toISOString().slice(0,10)}.zip`,$=await g.blob(),w=URL.createObjectURL($),k=document.createElement("a");k.href=w,k.download=h,k.style.display="none",document.body.appendChild(k),k.click(),setTimeout(()=>{URL.revokeObjectURL(w),k.remove()},100),I(`\u2713 ${h} downloaded`,"success")}catch{I("Download failed. Check your connection.","error")}finally{p=!1,d.disabled=!1;let v=u==="php"?"Download PHP":"Download HTML";d.innerHTML=`${x.download} ${v}`,l.forEach(m=>m.style.pointerEvents="")}}})}async function ls({silent:e=!1}={}){let t=Io();if(t.publishing){wn();return}t.checking=!0,e||wn();let{ok:s,data:n,error:o}=await E.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",wn()}window.refreshPublishState=ls;function tm(){let e=Io();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),ls({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||ls({silent:!0})},15e3)}function sm(e){if(!e)return{text:"",images:[],webRefUrl:null};let t=null,s=e;s.includes("[vx-ref:")&&(s=s.replace(/\[vx-ref:(https?:\/\/[^\]]+)\]/g,(o,i)=>(t=i,"")));let n=[];return s.includes("[vx-img:")&&(s=s.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(o,i)=>(n.push(i),""))),{text:s.trim(),images:n,webRefUrl:t}}function Ua(e){let t=Array.from(e),s=Dd-_s.length;if(s<=0){I(`Maximum ${Dd} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&I(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!Wa.includes(o.type)){I(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>yv){I(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,r=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!r)return;let l=new Image;l.onload=()=>{let d=nm(l,120);_s.push({media_type:r[1],data:r[2],name:o.name,preview:a,thumbnail:d}),Qa()},l.src=a},i.readAsDataURL(o)})}function nm(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function Qa(){let e=document.getElementById("image-attachments");if(e){if(_s.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=_s.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${b(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);_s.splice(n,1),Qa()})})}}function om(){_s=[],Qa()}function cc(){let t=(P.get("pages")||[]).length>0,s=document.getElementById("website-ref-restyle-options"),n=document.getElementById("website-ref-helper"),o=document.getElementById("btn-website-ref-confirm");s&&(s.hidden=!t),n&&(n.textContent=t?"Use another website as design reference for your site.":"Uses an existing website as design reference."),o&&(o.textContent=t?"Add":"Attach")}function pc(){Ft=null;let e=document.getElementById("website-ref-chip");e&&(e.hidden=!0);let t=document.getElementById("prompt-input");t&&(t.placeholder="Describe what you want to build...");let s=document.getElementById("btn-attach-website");s&&s.classList.remove("is-active")}function im(){let e=document.getElementById("btn-attach-website"),t=document.getElementById("website-ref-sheet"),s=document.getElementById("website-ref-url"),n=document.getElementById("website-ref-mode"),o=document.getElementById("btn-website-ref-confirm"),i=document.getElementById("btn-website-ref-cancel"),a=document.getElementById("website-ref-chip"),r=document.getElementById("website-ref-chip-label"),l=document.getElementById("btn-remove-website-ref"),d=document.getElementById("prompt-input");function u(c){if(p(),s&&s.classList.add("vs-input-error"),s){let v=document.createElement("div");v.className="vs-field-error vs-ref-url-error",v.textContent=c,s.insertAdjacentElement("afterend",v)}}function p(){s&&s.classList.remove("vs-input-error");let c=t==null?void 0:t.querySelector(".vs-ref-url-error");c&&c.remove()}e&&t&&e.addEventListener("click",()=>{Di()||(cc(),p(),t.hidden=!t.hidden,e.classList.toggle("is-active",!t.hidden||Ft!==null),!t.hidden&&s&&s.focus())}),o&&o.addEventListener("click",async()=>{var m;if(St())return;let c=(m=s==null?void 0:s.value)==null?void 0:m.trim();if(!c||!c.match(/^https?:\/\/.+/)){u("Enter a valid URL starting with http:// or https://");return}let v=o.textContent;o.disabled=!0,o.textContent="Checking\u2026",p();try{let{ok:g,data:y,error:f}=await E.post("/ai/check-url",{url:c});if(!g){u((f==null?void 0:f.message)||"Could not reach this URL.");return}let h=(y==null?void 0:y.url)||c,w=(P.get("pages")||[]).length>0;Ft={url:h,contentMode:w?(n==null?void 0:n.value)||"keep":"regenerate",restyle:w};let k="Design reference";r.textContent=`${k}: ${Pn(h)}`,r.title=h,a&&(a.hidden=!1),t&&(t.hidden=!0),e&&e.classList.add("is-active"),d&&(d.placeholder="Describe what to change (optional)...",d.focus())}catch{u("Network error \u2014 please check your connection and try again.")}finally{o.disabled=!1,o.textContent=v}}),i&&t&&i.addEventListener("click",()=>{p(),t.hidden=!0,e&&!Ft&&e.classList.remove("is-active")}),l&&l.addEventListener("click",()=>{pc()}),s&&o&&(s.addEventListener("keydown",c=>{c.key==="Enter"&&(c.preventDefault(),o.click())}),s.addEventListener("input",p))}async function Pi(){if(St())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=_s.length>0;if(!t&&!s&&!(Ft!==null)||P.get("aiStreaming"))return;if(Ft!=null&&Ft.restyle)try{let S=P.get("siteName")||"Untitled";if(!(await E.post("/designs",{name:`${S} (before restyle)`,description:`Automatic snapshot saved before restyling from ${Ft.url}`,is_system_backup:!0})).ok){I("Could not save your current design before restyling. Please try again.","error");return}}catch{I("Could not save your current design before restyling. Please try again.","error");return}e.value="",e.style.height="auto";let o=document.getElementById("chat-messages");if(!o)return;let i=[..._s];om();let a=Ft;pc();let r=i.length>0?`<div class="vs-msg-user-images">${i.map(S=>`<img src="${S.preview}" alt="${b(S.name)}" class="vs-msg-user-image" />`).join("")}</div>`:"",l=a?`<div class="vs-msg-user-webref"><a href="${ge(a.url)}" target="_blank" rel="noopener" title="${ge(a.url)}">${x.globe} <span>${b(Pn(a.url))}</span></a></div>`:"",d=`
    <div class="vs-msg-user mb-6 mt-4">
      ${r}
      ${l}
      ${t?`<div class="vs-msg-user-bubble">${b(t)}</div>`:""}
    </div>
  `,u=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,p=`
    <div class="vs-msg-ai mb-6" data-stream-id="${u}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${x.box}</span>
        <span class="text-xs text-vs-text-ghost font-medium">VoxelSite</span>
      </div>
      <div data-role="typing" class="vs-typing-indicator">
        <span class="vs-typing-dot"></span>
        <span class="vs-typing-dot"></span>
        <span class="vs-typing-dot"></span>
      </div>
      <div data-role="stream-content" hidden class="vs-msg-ai-bubble"></div>
      <div data-role="files-section" hidden class="vs-files-section">
        <div class="vs-files-header">
          <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
          <span data-role="files-label">Writing files</span>
          <span data-role="files-count" class="vs-files-count"></span>
        </div>
        <div data-role="files" class="vs-files-list"></div>
        <div data-role="files-progress" class="vs-files-progress">
          <div class="vs-files-progress-bar"></div>
        </div>
      </div>
      <div data-role="status" class="text-xs text-vs-text-tertiary mt-2 flex items-center gap-2">
        <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span data-role="status-timer" class="tabular-nums opacity-60"></span>
        <span data-role="status-step" class="opacity-75" style="margin-left: 2px;"></span>
        <span data-role="status-tokens" class="tabular-nums opacity-50" style="margin-left: 2px;"></span>
        <button data-role="stop-btn" class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
      </div>
      <div data-role="error" hidden class="mt-3 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>
    </div>
  `,c=o.querySelector(".vs-empty-state");c&&c.remove(),o.insertAdjacentHTML("beforeend",d+p),o.scrollTop=o.scrollHeight;let v=!0,m=80,g=()=>{v=o.scrollHeight-o.scrollTop-o.clientHeight<=m};o.addEventListener("scroll",g);let y=()=>{v&&(o.scrollTop=o.scrollHeight)},f=o.querySelector(`.vs-msg-ai[data-stream-id="${u}"]`);if(!f)return;let h=f.querySelector('[data-role="typing"]'),$=f.querySelector('[data-role="status"]'),w=f.querySelector('[data-role="stream-content"]'),k=f.querySelector('[data-role="files-section"]'),T=f.querySelector('[data-role="files"]'),_=f.querySelector('[data-role="files-label"]'),D=f.querySelector('[data-role="files-count"]'),q=f.querySelector('[data-role="files-progress"]'),Q=f.querySelector('[data-role="error"]'),X=f.querySelector('[data-role="status-timer"]'),O=f.querySelector('[data-role="status-step"]'),de=f.querySelector('[data-role="status-tokens"]'),J=S=>{S&&S.removeAttribute("hidden")},H=S=>{S&&S.setAttribute("hidden","")},L=Date.now(),N=0,F=Date.now(),V=!1,te=!1,ee=setInterval(()=>{let S=Math.floor((Date.now()-L)/1e3),A=Math.floor(S/60),R=S%60,G=A>0?`${A}m ${R}s`:`${R}s`;if(de&&N>0){let W=N>=1e3?`~${(N/1e3).toFixed(1)}K tokens`:`${N} tokens`;de.textContent=`\xB7 ${W}`}X&&(X.textContent=G);let Y=document.getElementById("overlay-metrics");Y&&(Y.textContent=G),Date.now()-F>3e5&&!V&&(V=!0,X&&(X.textContent=`${G} \xB7 No data for 5 min \u2014 may have stalled`,X.style.color="var(--vs-warning, #d97706)"))},1e3);P.set("aiStreaming",!0),document.body.classList.add("vs-ai-streaming");let j=document.getElementById("btn-send");j&&(j.disabled=!0,j.classList.add("opacity-50")),Zv();let oe="",me=[],ye=!1,tt=null,rt=!0,Tt=new AbortController,Mt=null,As=f.querySelector('[data-role="stop-btn"]');As&&As.addEventListener("click",()=>{Tt.abort(),Mt&&(E.post("/ai/cancel-generation",{prompt_id:Mt}).catch(()=>{}),Mt=null)});let M=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let U=e.dataset.actionData,ne=null;if(U){try{ne=JSON.parse(U)}catch{}delete e.dataset.actionData}let C=t||"";if(!C)if(a)try{let S=Pn(a.url);C=a.restyle?`(restyle from: ${S})`:`(import from: ${S})`}catch{C=`(reference: ${a.url})`}else i.length>0&&(C="(see attached images)");a&&(C=`[vx-ref:${a.url}]`+C),i.length>0&&(C=i.map(A=>`[vx-img:${A.thumbnail}]`).join("")+C);let B={user_prompt:C,action_type:M,page_scope:P.get("activePageScope"),conversation_id:P.get("activeConversationId"),action_data:ne};a&&(B.action_type=a.restyle?"restyle_site":"import_site",B.action_data={url:a.url,content_mode:a.contentMode},B.page_scope=null),i.length>0&&(B.images=i.map(S=>({data:S.data,media_type:S.media_type}))),await Hs("/ai/prompt",B,{signal:Tt.signal,onPromptId(S){Mt=S},onConversation(S){if(S){P.set("activeConversationId",S);try{localStorage.setItem("vs-active-conversation",S)}catch{}}},onStatus(S){let A=typeof S=="string"?S:S.message||"";O&&(O.textContent=`\xB7 ${A}`),!te&&k&&!k.hasAttribute("hidden")&&_&&(_.textContent=A)},onToken(S){oe+=S,N+=Math.ceil(S.length/4),F=Date.now(),V=!1,X&&(X.style.color="");let A=oe.trimStart();if(!ye&&A.length>0&&(ye=A.startsWith("{")||A.startsWith("```json")||A.startsWith("```")||A.startsWith("<|")||A.startsWith("<message>")||A.startsWith("<file ")||S.includes("<|")||A.includes("<|channel|>")||A.includes('"operations"')||A.includes('"assistant_message"'),ye&&w&&(w.innerHTML="")),H(h),w&&ye){let R=oe.match(/<message>([\s\S]*?)(<\/message>|$)/);if(R){let G=R[1].trim();G&&(J(w),w.innerHTML=Mi(G))}k&&oe.includes("<file ")&&J(k)}else w&&(J(w),w.innerHTML=Mi(oe));y()},onFile(S){if(me.push(S),k&&J(k),D){let A=me.length;D.textContent=`${A} file${A!==1?"s":""}`}if(T){let A=S.action==="delete",R=(me.length-1)*60,G=A?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';T.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${A?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${R}ms">
            <span class="vs-file-badge-icon">${G}</span>
            <span>${b(S.path)}</span>
          </div>
        `)}tt||(rt=!0),S.path.endsWith(".css")||(rt=!1),clearTimeout(tt),tt=setTimeout(()=>{Ka(rt?"voxelsite:reload-css":"voxelsite:reload"),tt=null,rt=!0},600),y()},onDone(S){te=!0,clearTimeout(tt),tt=null,clearInterval(ee),H(h),H($);let A=S.files_modified||[],R=me.length>0||A.length>0;if(k&&R){H(q),k.classList.add("vs-files-done"),_&&(_.textContent=S.partial?"Files updated (partial)":"Files updated");let z=document.createElement("div");z.className="vs-chat-action-row",z.innerHTML=`
          <button class="vs-btn vs-btn-ghost vs-btn-xs vs-chat-save-btn" title="Save current design to the library">
            ${x.save} Save to Designs
          </button>
        `,z.querySelector("button").addEventListener("click",()=>{Jn()}),k.insertAdjacentElement("afterend",z)}else k&&!k.hasAttribute("hidden")&&(H(q),H(k));if(w)if(S.message)J(w),w.innerHTML=Mi(S.message);else if(ye)H(w);else{let z=w.textContent||"";(z.includes("<|channel|>")||z.includes('"operations"')||z.includes('"assistant_message"')||z.includes("<file ")||z.includes("<message>"))&&(H(w),w.innerHTML="")}let G=S.missing_files||[];if((S.truncated||G.length>0)&&w){let z;G.length>0?z=`The following pages are linked in the navigation but were NOT created yet: ${G.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:z="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let W=document.getElementById("prompt-input");W&&!P.get("aiStreaming")&&(_&&(_.textContent="Generating remaining files..."),k&&(k.classList.remove("vs-files-done"),J(k)),W.value=z,W.dataset.actionType="free_prompt",Pi())},800)}if(S.conversation_id){P.set("activeConversationId",S.conversation_id);try{localStorage.setItem("vs-active-conversation",S.conversation_id)}catch{}}let Y=[...me,...A];if(Y.length>0){let z=Y.map($e=>$e.path||$e),W=z.some($e=>$e==="index.php"),Z=z.filter($e=>$e.endsWith(".php")&&!$e.includes("/")&&$e!=="index.php"),ve=W&&Z.length>0,re;ve?re="index.php":Z.length>0?re=Z[0]:re=W?"index.php":null,$n(re),P.set("previewDirty",!0),ls({silent:!0})}qd(),ec(),Mo(),o.removeEventListener("scroll",g),o.scrollTop=o.scrollHeight},onEvaluation(S){let A=(S==null?void 0:S.issues)||[];if(A.length===0)return;let R={error:0,warning:0,info:0};A.forEach(le=>R[le.severity]=(R[le.severity]||0)+1);let G={error:0,warning:1,info:2},Y=[...A].sort((le,Ae)=>(G[le.severity]??3)-(G[Ae.severity]??3)),z=Y.filter(le=>le.severity!=="info"),W=Y.filter(le=>le.severity==="info"),Z=[];R.error>0&&Z.push(`${R.error} error${R.error!==1?"s":""}`),R.warning>0&&Z.push(`${R.warning} warning${R.warning!==1?"s":""}`),R.info>0&&Z.push(`${R.info} suggestion${R.info!==1?"s":""}`);let ve=le=>le==="error"?"var(--vs-error, #ef4444)":le==="warning"?"var(--vs-warning, #d97706)":"var(--vs-text-ghost)",re=le=>le==="error"?"rgba(239,68,68,0.08)":le==="warning"?"rgba(217,119,6,0.08)":"var(--vs-bg-raised)",$e=le=>{let Ae=le.file?` in ${le.file}`:"",Ps=le.suggested_fix?`

Suggested approach: ${le.suggested_fix}`:"";return`Review this suggestion and apply if appropriate \u2014 ${le.severity}${Ae}: ${le.description}${Ps}`},be=(le,Ae)=>`
        <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${ve(le.severity)}; background: ${re(le.severity)};">${b(le.severity)}</span>
            <span style="font-size: 11px; color: var(--vs-text-ghost);">${b(le.category||"")}</span>
            ${le.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${b(le.file)}${le.line?":"+le.line:""}</span>`:""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${b(le.description||"")}</div>
          ${le.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${b(le.suggested_fix)}</div>`:""}
          <div style="margin-top: 4px; text-align: right;">
            <button class="vs-eval-add-to-chat" data-eval-idx="${Ae}" style="
              background: none; border: none; cursor: pointer; padding: 2px 0;
              font-size: 11px; color: var(--vs-accent); opacity: 0.7;
              transition: opacity 0.15s ease;
            " onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'">Add to chat \u2192</button>
          </div>
        </div>
      `,Te=z.map((le,Ae)=>be(le,Ae)).join(""),he=W.length>0?`
        <details style="border-top: 1px solid var(--vs-border-subtle);">
          <summary style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; cursor: pointer; user-select: none; font-size: 11px; color: var(--vs-text-ghost); list-style: none;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            ${W.length} additional suggestion${W.length!==1?"s":""}
          </summary>
          ${W.map((le,Ae)=>be(le,z.length+Ae)).join("")}
        </details>
      `:"",Ie=R.error>0?"error":R.warning>0?"warning":"info",ie=ve(Ie),_e=`
        <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${Ie==="error"?"rgba(239,68,68,0.15)":Ie==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)"}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
          <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${ie}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Expert Review \xB7 ${Z.join(", ")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div style="border-top: 1px solid var(--vs-border-subtle);">
            <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
            ${Te}
            ${he}
          </div>
        </details>
      `,Xe;k&&!k.hasAttribute("hidden")?(k.insertAdjacentHTML("afterend",_e),Xe=k.nextElementSibling):w?(w.insertAdjacentHTML("afterend",_e),Xe=w.nextElementSibling):(f.insertAdjacentHTML("beforeend",_e),Xe=f.lastElementChild),Xe&&Xe.addEventListener("click",le=>{let Ae=le.target.closest(".vs-eval-add-to-chat");if(!Ae)return;le.preventDefault();let Ps=parseInt(Ae.dataset.evalIdx,10),zt=Y[Ps];if(!zt)return;let it=document.getElementById("prompt-input");if(!it)return;let Le=$e(zt),He=it.value.trim();it.value=He?He+`

`+Le:Le,it.focus(),it.style.height="auto",it.style.height=Math.min(it.scrollHeight,200)+"px",it.selectionStart=it.selectionEnd=it.value.length,Ae.textContent="\u2713 Added",Ae.style.opacity="1",setTimeout(()=>{Ae.textContent="Add to chat \u2192",Ae.style.opacity="0.7"},1500)}),y()},onWarning(S){S.toLowerCase().includes("truncat")||T&&(T.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${b(S)}</div>
        `)},onError(S){clearTimeout(tt),tt=null,clearInterval(ee),H(h),H($),Q&&(Q.textContent=S.message||"Something went wrong.",J(Q)),qd(),q&&H(q),k&&me.length>0&&(k.classList.add("vs-files-done"),_&&(_.textContent="Files updated (partial)"))}}),P.set("aiStreaming",!1),document.body.classList.remove("vs-ai-streaming"),j&&(j.disabled=!1,j.classList.remove("opacity-50"))}function Ud(){var p;Zd.innerHTML=`
    <div class="vs-login-backdrop">
      <!-- Film grain -->
      <div class="vs-login-grain" aria-hidden="true"></div>
      <!-- Amber aura -->
      <div class="vs-login-aura" aria-hidden="true"><div class="vs-login-aura-blob"></div></div>

      <!-- Top-left logo frame -->
      <div class="vs-login-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
        <span>VoxelSite</span>
      </div>

      <!-- Login Card -->
      <div class="vs-login-card" id="login-card">

        <!-- \u2550\u2550\u2550 Login State \u2550\u2550\u2550 -->
        <div id="login-state">
          <div class="vs-login-header">
            <svg class="vs-login-logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
              <path d="m3.3 7 8.7 5 8.7-5"/>
              <path d="M12 22V12"/>
            </svg>
            <h1 class="vs-login-title">${rs?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${rs?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${rs?`
            <div class="vs-demo-login-banner">
              <strong>Demo Mode</strong>
              <span>Browse everything. Changes won\u2019t be saved.</span>
            </div>
          `:""}

          <div id="login-error" class="hidden mb-5 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>

          <form id="login-form" class="flex flex-col gap-4">
            <div>
              <label class="vs-input-label">Email</label>
              <input id="login-email" type="email" required
                class="vs-input"
                placeholder="you@example.com"
                ${rs?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${rs?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${rs?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${x.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${rs?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${rs?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
          </div>
        </div>

        <!-- \u2550\u2550\u2550 Forgot State \u2550\u2550\u2550 -->
        <div id="forgot-state" class="hidden">
          <div id="forgot-content">
            <div class="vs-login-header">
              <h1 class="vs-login-title">Reset Password</h1>
              <p class="vs-login-subtitle">Checking recovery options\u2026</p>
            </div>
          </div>

          <div class="vs-login-footer">
            <button type="button" id="btn-back-login" class="vs-login-back">\u2190 Back to login</button>
          </div>
        </div>

      </div>

      <!-- Theme toggle \u2014 subtle floating button in the corner -->
      <button id="btn-login-theme" class="vs-login-theme-toggle"
        title="Toggle light/dark mode">
        ${(P.get("theme")||"light")==="light"?x.sun:x.moon}
      </button>
    </div>
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let c=e.type==="password";e.type=c?"text":"password",t.innerHTML=c?x.eyeOff:x.eye,t.title=c?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let c=No();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=c==="light"?x.sun:x.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(c=>{c.addEventListener("click",()=>{let v=document.getElementById(c.dataset.toggleTarget);if(!v)return;let m=v.type==="password";v.type=m?"text":"password",c.innerHTML=m?x.eyeOff:x.eye,c.title=m?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),r=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var v,m,g;o.classList.add("hidden"),i.classList.remove("hidden");let c=document.getElementById("forgot-content");try{let f=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((v=f==null?void 0:f.data)==null?void 0:v.mode)||"file")==="email"?(c.innerHTML=`
            <div class="vs-login-header">
              <h1 class="vs-login-title">Reset Password</h1>
              <p class="vs-login-subtitle">Enter your email to receive a recovery link.</p>
            </div>
            <div id="forgot-message" class="hidden mb-5 px-4 py-3 text-sm rounded-xl border"></div>
            <form id="forgot-form" class="flex flex-col gap-4">
              <div>
                <label class="vs-input-label">Email</label>
                <input id="forgot-email" type="email" required class="vs-input" placeholder="you@example.com">
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Send Recovery Link</button>
            </form>
          `,(m=document.getElementById("forgot-form"))==null||m.addEventListener("submit",async $=>{var D,q,Q;$.preventDefault();let w=document.getElementById("forgot-message"),k=document.getElementById("forgot-email"),T=$.target.querySelector('button[type="submit"]'),_=(D=k==null?void 0:k.value)==null?void 0:D.trim();if(_){T&&(T.disabled=!0,T.textContent="Sending...");try{let O=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:_})})).json();w&&(O.ok?(w.textContent=((q=O.data)==null?void 0:q.message)||"Recovery link sent. Check your inbox.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",k&&(k.value="")):(w.textContent=((Q=O.error)==null?void 0:Q.message)||"Failed to send recovery email.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),w.classList.remove("hidden"))}catch{w&&(w.textContent="Network error. Please try again.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}finally{T&&(T.disabled=!1,T.textContent="Send Recovery Link")}}})):(c.innerHTML=`
            <div class="vs-login-header">
              <h1 class="vs-login-title">Reset Password</h1>
              <p class="vs-login-subtitle">Server-side recovery \u2014 no email required.</p>
            </div>
            <div class="vs-login-reset-instructions">
              <div class="vs-login-reset-step">
                <span class="vs-login-reset-num">1</span>
                <span>Create an empty file named <code>.reset</code> in your <code>_data/</code> folder</span>
              </div>
              <div class="vs-login-reset-step">
                <span class="vs-login-reset-num">2</span>
                <span>Fill in your email and new password below</span>
              </div>
            </div>
            <div id="forgot-message" class="hidden mb-5 px-4 py-3 text-sm rounded-xl border"></div>
            <form id="forgot-form" class="flex flex-col gap-4">
              <div>
                <label class="vs-input-label">Email</label>
                <input id="forgot-email" type="email" required class="vs-input" placeholder="you@example.com">
              </div>
              <div>
                <label class="vs-input-label">New Password</label>
                <div class="vs-login-password-wrap">
                  <input id="forgot-new-password" type="password" required minlength="8" class="vs-input" placeholder="Minimum 8 characters">
                  <button type="button" data-toggle-target="forgot-new-password" class="vs-login-eye" title="Show password">${x.eye}</button>
                </div>
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
            </form>
          `,n(),(g=document.getElementById("forgot-form"))==null||g.addEventListener("submit",async $=>{var D,q,Q;$.preventDefault();let w=document.getElementById("forgot-message"),k=(D=document.getElementById("forgot-email"))==null?void 0:D.value,T=(q=document.getElementById("forgot-new-password"))==null?void 0:q.value;if(!k||!T)return;let _=await E.post("/auth/reset-password",{email:k,new_password:T});_.ok?(w&&(w.textContent="Password reset. You can now sign in with your new password.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",w.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):w&&(w.textContent=((Q=_.error)==null?void 0:Q.message)||"Reset failed. Make sure the .reset file exists in _data/.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}))}catch{c.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),r&&r.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let d=new URLSearchParams(window.location.search).get("reset");if(d&&d.length===64&&i&&o){let c=window.location.pathname+window.location.hash;window.history.replaceState(null,"",c),o.classList.add("hidden"),i.classList.remove("hidden");let v=document.getElementById("forgot-content");v&&(v.innerHTML=`
        <div class="vs-login-header">
          <h1 class="vs-login-title">Set New Password</h1>
          <p class="vs-login-subtitle">Enter your new password below.</p>
        </div>
        <div id="forgot-message" class="hidden mb-5 px-4 py-3 text-sm rounded-xl border"></div>
        <form id="token-reset-form" class="flex flex-col gap-4">
          <div>
            <label class="vs-input-label">New Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-new-password" type="password" required minlength="8" class="vs-input" placeholder="Minimum 8 characters">
              <button type="button" data-toggle-target="token-new-password" class="vs-login-eye" title="Show password">${x.eye}</button>
            </div>
          </div>
          <div>
            <label class="vs-input-label">Confirm Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-confirm-password" type="password" required minlength="8" class="vs-input" placeholder="Confirm your password">
              <button type="button" data-toggle-target="token-confirm-password" class="vs-login-eye" title="Show password">${x.eye}</button>
            </div>
          </div>
          <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
        </form>
      `,n(),(p=document.getElementById("token-reset-form"))==null||p.addEventListener("submit",async m=>{var $,w,k,T;m.preventDefault();let g=document.getElementById("forgot-message"),y=($=document.getElementById("token-new-password"))==null?void 0:$.value,f=(w=document.getElementById("token-confirm-password"))==null?void 0:w.value,h=m.target.querySelector('button[type="submit"]');if(!y||y.length<8){g&&(g.textContent="Password must be at least 8 characters.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",g.classList.remove("hidden"));return}if(y!==f){g&&(g.textContent="Passwords do not match.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",g.classList.remove("hidden"));return}h&&(h.disabled=!0,h.textContent="Resetting...");try{let D=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:d,new_password:y})})).json();g&&(D.ok?(g.textContent=((k=D.data)==null?void 0:k.message)||"Password reset. You can now sign in.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",g.classList.remove("hidden"),m.target.querySelectorAll("input").forEach(q=>q.disabled=!0),h&&(h.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(g.textContent=((T=D.error)==null?void 0:T.message)||"Reset failed. The link may have expired.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",g.classList.remove("hidden")))}catch{g&&(g.textContent="Network error. Please try again.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",g.classList.remove("hidden"))}finally{h&&(h.disabled=!1,h.textContent="Reset Password")}}))}let u=document.getElementById("login-form");u&&u.addEventListener("submit",async c=>{var f,h,$,w;c.preventDefault();let v=(f=document.getElementById("login-email"))==null?void 0:f.value,m=(h=document.getElementById("login-password"))==null?void 0:h.value,g=document.getElementById("login-error");if(!v||!m)return;let y=await E.post("/auth/login",{email:v,password:m});y.ok&&(($=y.data)!=null&&$.token)?(P.batch(()=>{P.set("user",y.data.user),P.set("sessionToken",y.data.token)}),Qd()):g&&(g.textContent=((w=y.error)==null?void 0:w.message)||"Invalid email or password.",g.classList.remove("hidden"))}),Mo()}function Si(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function Mi(e){if(!e)return"";if(!window.marked)return b(e);let t=window.marked.parse(e);return am(t)}function am(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),r=a?a.split(`
`):[];if(r.length<=hv)return;let l=r.slice(0,bv).join(`
`)+`
...`,d=document.createElement("div");d.className="vs-code-collapse",d.setAttribute("data-code-collapse","1");let u=document.createElement("pre");u.className="vs-code-collapse-preview",u.setAttribute("data-code-preview","1");let p=document.createElement("code");o!=null&&o.className&&(p.className=o.className),p.textContent=l,u.appendChild(p),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let c=document.createElement("button");c.type="button",c.className="vs-code-collapse-toggle",c.setAttribute("data-code-toggle","1"),c.setAttribute("data-lines",String(r.length)),c.setAttribute("aria-expanded","false"),c.textContent=`More (${r.length} lines)`;let v=n.parentNode;v&&(v.replaceChild(d,n),d.appendChild(u),d.appendChild(n),d.appendChild(c))}),t.innerHTML}function rm(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Qd();})();
