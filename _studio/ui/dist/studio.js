(()=>{var Dl=e=>{throw TypeError(e)};var Ja=(e,t,s)=>t.has(e)||Dl("Cannot "+s);var Me=(e,t,s)=>(Ja(e,t,"read from private field"),s?s.call(e):t.get(e)),Tt=(e,t,s)=>t.has(e)?Dl("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),Zt=(e,t,s,n)=>(Ja(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),xs=(e,t,s)=>(Ja(e,t,"access private method"),s);var ws,ks,mn,Es,mo,Za,Xa=class{constructor(t={}){Tt(this,mo);Tt(this,ws,new Map);Tt(this,ks,new Map);Tt(this,mn,!1);Tt(this,Es,new Map);for(let[s,n]of Object.entries(t))Me(this,ws).set(s,n)}get(t,s=void 0){return Me(this,ws).has(t)?Me(this,ws).get(t):s}set(t,s){let n=Me(this,ws).get(t);n!==s&&(Me(this,ws).set(t,s),Me(this,mn)?Me(this,Es).has(t)?Me(this,Es).get(t).newValue=s:Me(this,Es).set(t,{newValue:s,oldValue:n}):xs(this,mo,Za).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return Me(this,ks).has(t)||Me(this,ks).set(t,new Set),Me(this,ks).get(t).add(s),()=>{var n;(n=Me(this,ks).get(t))==null||n.delete(s)}}batch(t){if(Me(this,mn)){t();return}Zt(this,mn,!0),Me(this,Es).clear();try{t()}finally{Zt(this,mn,!1);for(let[s,{newValue:n,oldValue:o}]of Me(this,Es))xs(this,mo,Za).call(this,s,n,o);Me(this,Es).clear()}}toJSON(){return Object.fromEntries(Me(this,ws))}};ws=new WeakMap,ks=new WeakMap,mn=new WeakMap,Es=new WeakMap,mo=new WeakSet,Za=function(t,s,n){let o=Me(this,ks).get(t);if(o)for(let a of o)try{a(s,n)}catch(r){console.error(`[state] Error in "${t}" listener:`,r)}let i=Me(this,ks).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(r){console.error("[state] Error in wildcard listener:",r)}};var D=new Xa({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});D.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});D.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var fo,qn,Nn,On,Hn,jn,$s,Mi,er,Qa=class{constructor(){Tt(this,$s);Tt(this,fo,[]);Tt(this,qn,null);Tt(this,Nn,!1);Tt(this,On,null);Tt(this,Hn,null);Tt(this,jn,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return Me(this,fo).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return Zt(this,qn,t),this}beforeEach(t){return Zt(this,On,t),this}start(){Me(this,Nn)||(Zt(this,Nn,!0),window.addEventListener("hashchange",()=>xs(this,$s,Mi).call(this)),xs(this,$s,Mi).call(this))}navigate(t){window.location.hash=`/${t}`}refresh(){Zt(this,Hn,null),xs(this,$s,Mi).call(this)}get current(){return xs(this,$s,er).call(this)}};fo=new WeakMap,qn=new WeakMap,Nn=new WeakMap,On=new WeakMap,Hn=new WeakMap,jn=new WeakMap,$s=new WeakSet,Mi=async function(){if(Me(this,jn))return;let t=xs(this,$s,er).call(this),s=Me(this,Hn);if(!(t===s&&Me(this,Nn))){if(Me(this,On)&&s!==null){Zt(this,jn,!0);try{if(await Me(this,On).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{Zt(this,jn,!1)}}Zt(this,Hn,t);for(let n of Me(this,fo)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,r)=>{i[a]=decodeURIComponent(o[r+1])}),D.batch(()=>{D.set("route",n.pattern),D.set("routeParams",i)}),n.handler(i);return}}Me(this,qn)?(D.set("route","404"),Me(this,qn).call(this,t)):this.navigate("chat")}},er=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var It=new Qa;var tr=(()=>{var s,n,o;let t=(((s=globalThis.location)==null?void 0:s.pathname)??((o=(n=globalThis.window)==null?void 0:n.location)==null?void 0:o.pathname)??"/_studio/").match(/^(\/(?:[a-zA-Z0-9._~!$&()+,;=@-]|%[a-fA-F0-9]{2}|\/)*)_studio(?:\/|$)/);if(!t)return"/_studio";try{if(decodeURIComponent(t[1]).split("/").some(i=>i==="."||i===".."||/[\\\x00-\x20\x7f]/.test(i)))return"/_studio"}catch{return"/_studio"}return`${t[1].replaceAll("&","%26")}_studio`})();function Ce(e=""){return`${tr}/${e.replace(/^\/+/,"")}`}function jt(e){return tr==="/_studio"?e:`${tr}:${e}`}var Nl=Ce("api/router.php"),Us=0;function Hu(e,t){var s;t||["POST","PUT","DELETE"].includes(e)&&(Us++,Us===1&&((s=window.__vsSetGlobalStatus)==null||s.call(window,"saving")))}function go(e,t,s){var n,o;s||["POST","PUT","DELETE"].includes(e)&&(Us=Math.max(0,Us-1),Us===0&&(t?(n=window.__vsSetGlobalStatus)==null||n.call(window,"saved"):(o=window.__vsSetGlobalStatus)==null||o.call(window,"error")))}async function Ai(e,t,s=null,n={}){var l,p;let{silent:o=!1,...i}=n,a={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let c=Hl();c&&(a["X-VS-Token"]=c)}s!==null&&(a["Content-Type"]="application/json");let r={method:e,headers:a,credentials:"same-origin",...i};s!==null&&(r.body=JSON.stringify(s)),Hu(e,o);try{let[c,d]=t.split("?"),u=`${Nl}?_path=${encodeURIComponent(c)}${d?"&"+d:""}`,v=await fetch(u,r),f=await v.json().catch(()=>null);if(v.status===401)return D.get("user")&&D.set("user",null),go(e,!1,o),f!=null&&f.error?{ok:!1,error:f.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}};if(f&&!f.ok&&f.error)return f.error.code==="demo_mode"?(window.showToast&&window.showToast(f.error.message||"Demo mode \u2014 this action is disabled.","warning"),!o&&["POST","PUT","DELETE"].includes(e)&&(Us=Math.max(0,Us-1),Us===0&&((l=window.__vsSetGlobalStatus)==null||l.call(window,"idle")))):go(e,!1,o),{ok:!1,error:f.error,...(p=f.data)!=null&&p.operation?{data:f.data}:{}};let b=v.ok===!1||v.status>=400;return b||!f||typeof f!="object"||Array.isArray(f)||f.ok===!1?(go(e,!1,o),{ok:!1,error:{code:b?"server_error":"invalid_response",message:b?`The server could not complete the request (${v.status}). Try again.`:"The server returned an unexpected response. Refresh and try again."}}):(go(e,!0,o),{ok:!0,data:f.data||f})}catch{return go(e,!1,o),{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var Y={get:(e,t)=>Ai("GET",e,null,t),post:(e,t,s)=>Ai("POST",e,t,s),put:(e,t,s)=>Ai("PUT",e,t,s),delete:(e,t,s)=>Ai("DELETE",e,t,s)},sr=new Map,ho=new Map,Bi=()=>{var e;return((e=D.get("user"))==null?void 0:e.id)??"anonymous"},nr=(e,t)=>jt(`vs_pending_website:${Bi()}:${t}:${e}`);function Xe(e,t="post"){let s=nr(e,t),n=ho.get(s);if(!n)try{n=JSON.parse(sessionStorage.getItem(s)||"null")}catch{}return n!=null&&n.body?{...n.body}:null}function Ol(e,t="post"){let s=nr(e,t),n=new Set(ho.keys());try{for(let i=0;i<sessionStorage.length;i++)n.add(sessionStorage.key(i))}catch{}let o=[];for(let i of n){if(typeof i!="string"||!i.startsWith(s))continue;let a=e+i.slice(s.length),r=Xe(a,t);r&&o.push({endpoint:a,body:r})}return o}function ye(e,t={},s="post",n={}){let o=nr(e,s),i=JSON.stringify(Object.fromEntries(Object.entries(t).sort(([l],[p])=>l.localeCompare(p)))),a=sr.get(o);if(a)return a.fingerprint===i?a.promise:Promise.resolve({ok:!1,error:{code:"operation_pending",message:"This action is still running. Wait for its result before changing the request."}});let r=ju(o,e,t,i,s,n).finally(()=>sr.delete(o));return sr.set(o,{fingerprint:i,promise:r}),r}async function ju(e,t,s,n,o,i){var v,f,b,h,g;let a=Bi();if(!["post","put","delete"].includes(o))throw new Error("Unsupported website mutation method.");let r=ho.get(e);if(!r)try{r=JSON.parse(sessionStorage.getItem(e)||"null")}catch{}if(r!=null&&r.fingerprint&&r.fingerprint!==n)return{ok:!1,error:{code:"operation_pending",message:"An earlier request for this action still needs attention. Retry that request before starting another."}};if(!r){let m=crypto.getRandomValues(new Uint8Array(16));r={id:`website_${Array.from(m,x=>x.toString(16).padStart(2,"0")).join("")}`,fingerprint:n,body:s}}r={...r,fingerprint:n,body:s},ho.set(e,r);let l=i.retainInput===!1?{id:r.id,body:i.publicInput||{},sensitive:!0}:r;try{sessionStorage.setItem(e,JSON.stringify(l))}catch{}let p={...s,operation_id:r.id},c=await Y[o](t,p),d=0;for(;c.ok&&((f=(v=c.data)==null?void 0:v.operation)==null?void 0:f.status)==="applying"&&d++<100;){if(Bi()!==a)return{ok:!1,error:{code:"permission_denied",message:"The signed-in account changed. Reopen this view before continuing."}};c=await Y[o](t,{...p,checkpoint:c.data.operation.checkpoint})}if(Bi()!==a)return{ok:!1,error:{code:"permission_denied",message:"The signed-in account changed. Reopen this view to inspect the result."}};let u=(b=c.data)==null?void 0:b.operation;if(["succeeded","failed_restored","expired","cancelled"].includes(u==null?void 0:u.status)||!u&&["invalid_schema","content_conflict","review_expired"].includes((h=c.error)==null?void 0:h.code)){ho.delete(e);try{sessionStorage.removeItem(e)}catch{}}return(u==null?void 0:u.status)==="succeeded"?c:u?{...c,ok:!1,error:((g=u.result)==null?void 0:g.error)||{code:u.status,message:u.status==="recovery_required"?"This change needs recovery. Its operation and backup are retained; do not start another website change.":"This change is still pending. Retry the same action to continue its retained operation."}}:c}async function ds(e,t,s={}){var w,E;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onPromptId:a=()=>{},onFile:r=()=>{},onDone:l=()=>{},onEvaluation:p=()=>{},onWarning:c=()=>{},onError:d=()=>{},signal:u=null,requireTerminal:v=!1}=s,f=Hl(),b={"Content-Type":"application/json",Accept:"text/event-stream"};f&&(b["X-VS-Token"]=f);let h=!1,g=0,m=0,x=t.conversation_id||null;try{let G=function(J){if(!J.trim())return;let T="";for(let B of J.split(`
`))B.startsWith(":")||B.startsWith("data: ")&&(T+=B.slice(6));if(!T)return;let C;try{C=JSON.parse(T)}catch{return}switch(C.type||"message"){case"token":m++,n(C.content||"");break;case"status":o(C);break;case"conversation":x=C.conversation_id||x,i(C.conversation_id||"");break;case"prompt_id":a(C.prompt_id||0);break;case"file_complete":g++,r(C);break;case"done":h=!0,l(C);break;case"evaluation":p(C);break;case"warning":c(C.message||"");break;case"error":h=!0,d(C);break}},k={method:"POST",headers:b,credentials:"same-origin",body:JSON.stringify(t)};u&&(k.signal=u);let[$,S]=e.split("?"),_=`${Nl}?_path=${encodeURIComponent($)}${S?"&"+S:""}`,q=await fetch(_,k);if(!q.ok){let J=await q.json().catch(()=>null);d({code:((w=J==null?void 0:J.error)==null?void 0:w.code)||"http_error",message:((E=J==null?void 0:J.error)==null?void 0:E.message)||`Server error (${q.status})`});return}let K=q.body.getReader(),O=new TextDecoder,W="";for(;;){let{done:J,value:T}=await K.read();if(J)break;W+=O.decode(T,{stream:!0});let C=W.split(`

`);W=C.pop();for(let j of C)G(j)}if(W.trim()&&G(W),!h){if(v){d({code:"stream_interrupted",message:"The connection closed before the server confirmed the result.",outcome_unknown:!0});return}let J=x;J?(o("Waiting for server to finish..."),await ql(J,{onDone:l,onError:d,onFile:r,onStatus:o})):(g>0||m>0)&&l({files_modified:[],message:"",soft_close:!0})}}catch(k){if(h)return;if(v&&!h){d({code:"stream_interrupted",message:"The connection closed before the server confirmed the result.",outcome_unknown:!0});return}if(k.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(h)return;if(g>0||m>0){let $=x;$?(o("Server is still generating \u2014 waiting for completion..."),await ql($,{onDone:l,onError:d,onFile:r,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else d({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function ql(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var r;let a=0;for(let l=0;l<120;l++){await new Promise(p=>setTimeout(p,3e3));try{let{ok:p,data:c}=await Y.get(`/ai/conversations/${e}`);if(!p||!((r=c==null?void 0:c.conversation)!=null&&r.prompts))continue;let d=c.conversation.prompts,u=d[d.length-1];if(!u)continue;let v=u.files_modified?JSON.parse(u.files_modified):[];if(v.length>a){for(let f=a;f<v.length;f++)n({path:v[f],action:"write"});a=v.length}if(u.status==="streaming"){let f=Math.round((Date.now()-new Date(u.created_at).getTime())/1e3);o(`Server is still generating... (${f}s)`);continue}u.status==="success"?t({message:u.ai_message||"",files_modified:v,revision_id:u.revision_id||null,polled:!0}):u.status==="partial"?t({message:u.ai_message||"",files_modified:v,partial:!0,polled:!0}):s({code:"generation_failed",message:u.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function Hl(){return D.get("sessionToken")}var Fu="data-theme",or="dark";function jl(){let e=D.get("theme")||localStorage.getItem("vs-theme")||or;return Fl(e),e}function Fl(e){let t=e||or;return document.documentElement.setAttribute(Fu,t),localStorage.setItem("vs-theme",t),D.set("theme",t),t}function Pi(){let e=D.get("theme")||or;return Fl(e==="dark"?"light":"dark")}var Ri=new Map,zl=new Map;async function ot(e){var s,n;let t=await Y.get(`/files/content?path=${encodeURIComponent(e)}`);if(t.ok&&((s=t.data)!=null&&s.content_sha256)&&((n=t.data)!=null&&n.draft_version)){let o=t.data;Ri.set(`${e}:${o.content_sha256}`,{hash:o.content_sha256,version:o.draft_version,content:o.content})}return t}function Ul(e){if(e!=null&&e.draft_version)for(let t of e.files||[])zl.set(t.path,{hash:t.content_sha256,version:e.draft_version})}var Di=()=>({ok:!1,error:{code:"content_conflict",message:"Read and review this source before changing it."}});async function ht(e,t=null){var i;let s;if(t!=null&&t.draft_version)s={hash:t.content_sha256,version:t.draft_version};else if(typeof t=="string"){let a=new TextEncoder().encode(t),r=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",a)),l=>l.toString(16).padStart(2,"0")).join("");s=Ri.get(`${e.path}:${r}`)}else s=Ri.get(`${e.path}:${e.expected_content_sha256}`);if(!(s!=null&&s.hash)||!(s!=null&&s.version))return Di();let n={path:e.path,content:e.content,expected_content_sha256:s.hash,base_draft_version:e.base_draft_version||s.version},o=await ye("/files/content",n,"put",{retainInput:!1,publicInput:{path:n.path,expected_content_sha256:n.expected_content_sha256,base_draft_version:n.base_draft_version}});return o.ok&&((i=o.data)!=null&&i.content_sha256)&&Ri.set(`${e.path}:${o.data.content_sha256}`,{hash:o.data.content_sha256,version:o.data.draft_version,content:e.content}),o}function Vl(e,t){return t?ye("/files/create",{path:e,base_draft_version:t,expected_content_sha256:null}):Promise.resolve(Di())}function Wl(e){let t=zl.get(e);return t!=null&&t.hash?ye(`/files?path=${encodeURIComponent(e)}`,{base_draft_version:t.version,expected_content_sha256:t.hash},"delete"):Promise.resolve(Di())}function Gl(e){return e?ye("/files/compile-tailwind",{base_draft_version:e}):Promise.resolve(Di())}var Kl=typeof document<"u"?document.createElement("span"):null;function y(e){return e?(Kl.textContent=e,Kl.innerHTML):""}function X(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var zu={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function bo(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(zu))if(t.endsWith(s))return n;return"plaintext"}function ir(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function yo(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),r=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:r===1?"Yesterday":r<30?`${r} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function xo(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function wo(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function ko(e,t=40){if(!e)return"";let s=e.replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/+$/,"");return s.length>t&&(s=s.substring(0,t-1)+"\u2026"),s}function Te(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function Ie(e,t){let s=null;e.addEventListener("mousedown",n=>{s=n.target}),e.addEventListener("click",n=>{n.target===e&&s===e&&t(n)})}function Ae({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var c,d;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let r=document.createElement("div");r.id="vs-confirm-overlay",r.className="vs-modal-overlay",r.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${y(e)}</h2>
          <p class="vs-modal-desc">${y(t)}</p>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">${y(n)}</button>
          <button id="vs-confirm-ok" class="vs-btn ${o?"vs-btn-danger":"vs-btn-primary"} vs-btn-sm" type="button">${y(s)}</button>
        </div>
      </div>
    `;let l=u=>{u.key==="Escape"&&(u.preventDefault(),p(!1))},p=u=>{document.removeEventListener("keydown",l),Te(r),i(u)};document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible")),Ie(r,()=>p(!1)),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>p(!1)),(d=document.getElementById("vs-confirm-ok"))==null||d.addEventListener("click",()=>p(!0)),document.addEventListener("keydown",l),setTimeout(()=>{var u;return(u=document.getElementById("vs-confirm-ok"))==null?void 0:u.focus()},220)})}function Yl({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:r="",inputPattern:l=""}){return new Promise(p=>{var h,g;let c=document.getElementById("vs-prompt-overlay");c&&c.remove();let d=document.createElement("div");d.id="vs-prompt-overlay",d.className="vs-modal-overlay";let u=l?` pattern="${y(l)}"`:"",v=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${y(n)}" style="resize: vertical;">${y(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${y(n)}" value="${y(o)}"${u}>`;d.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${y(e)}</h2>
          ${t?`<p class="vs-modal-desc">${y(t)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${y(s)}</label>`:""}
          ${v}
          ${r?`<p class="text-xs text-vs-text-ghost" style="margin-top: 6px;">${y(r)}</p>`:""}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${y(i)}</button>
        </div>
      </div>
    `;let f=m=>{Te(d),p(m)};document.body.appendChild(d),requestAnimationFrame(()=>d.classList.add("is-visible"));let b=d.querySelector("#vs-prompt-input");setTimeout(()=>b==null?void 0:b.focus(),220),Ie(d,()=>f(null)),(h=d.querySelector("#vs-prompt-cancel"))==null||h.addEventListener("click",()=>f(null)),(g=d.querySelector("#vs-prompt-ok"))==null||g.addEventListener("click",()=>{f(((b==null?void 0:b.value)||"").trim())}),b==null||b.addEventListener("keydown",m=>{a==="textarea"?m.key==="Enter"&&(m.metaKey||m.ctrlKey)&&(m.preventDefault(),f(((b==null?void 0:b.value)||"").trim())):m.key==="Enter"&&(m.preventDefault(),f(((b==null?void 0:b.value)||"").trim())),m.key==="Escape"&&(m.preventDefault(),f(null))})})}var Uu=new Set(["page","partial","component"]),Vu=new Set(["partial","component"]),ar={unsafe:"Contains dynamic PHP. Use the Code Editor for full control."};function fn(e){if(!e||typeof e!="object")return{sourceFile:"",sourceKind:"unsafe",nodeKey:"",includeChain:[],instanceKey:"",editable:!1};let t=typeof e.sourceFile=="string"?e.sourceFile:"",s=typeof e.sourceKind=="string"?e.sourceKind:"unsafe",n=typeof e.nodeKey=="string"?e.nodeKey:"",o=e.editable===!0||e.editable==="true",i=[];Array.isArray(e.includeChain)?i=e.includeChain:typeof e.includeChain=="string"&&e.includeChain&&(i=e.includeChain.split(",").map(r=>r.trim()).filter(Boolean));let a=[t,s,n].filter(Boolean).join("::");return{sourceFile:t,sourceKind:s,nodeKey:n,includeChain:i,instanceKey:a,editable:o}}function qi(e){return e?Uu.has(e.sourceKind)&&e.editable:!1}function Jl(e){return e?qi(e)?null:e.sourceKind==="unsafe"&&!e.sourceFile?"Could not determine the source file. Changes cannot be saved safely.":ar[e.sourceKind]||ar.unsafe:ar.unsafe}function Xl(e){return e?Vu.has(e.sourceKind):!1}var L={archive:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',database:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',inbox:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',panelLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',palette:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',mic:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>',micOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M16.95 16.95A7 7 0 0 1 5 12v-2"/><path d="M18.89 13.23A7 7 0 0 0 19 12v-2"/><path d="m2 2 20 20"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/></svg>',puzzle:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/></svg>',paintbrush:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>',penTool:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/></svg>'};var Zl={success:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'},Ql='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',ed=["success","error","warning","info"];function td(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function Eo(e){e._dismissed||(e._dismissed=!0,e._autoTimer&&(clearTimeout(e._autoTimer),e._autoTimer=null),e.classList.add("vs-toast-exit"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>{e.parentNode&&e.remove()},250))}function A(e,t="success",s=3200){var a;if(!e)return;let n=td(),o=ed.includes(t)?t:"success",i=document.createElement("div");i.className=`vs-toast vs-toast-${o}`,i.innerHTML=`
    <span class="vs-toast-icon">${Zl[o]}</span>
    <span class="vs-toast-message">${y(String(e))}</span>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${Ql}</button>
    <div class="vs-toast-progress" style="animation-duration: ${s}ms;"></div>
  `,(a=i.querySelector(".vs-toast-dismiss"))==null||a.addEventListener("click",r=>{r.stopPropagation(),Eo(i)}),n.appendChild(i),i._autoTimer=setTimeout(()=>Eo(i),s)}window.showToast=A;function cs(e,t,s,n="success"){var l,p;if(!e)return;let o=td(),i=ed.includes(n)?n:"success",a=8e3,r=document.createElement("div");r.className=`vs-toast vs-toast-${i}`,r.style.cursor="default",r.innerHTML=`
    <span class="vs-toast-icon">${Zl[i]}</span>
    <span class="vs-toast-message">${y(String(e))}</span>
    <button type="button" class="vs-toast-action">${y(t)}</button>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${Ql}</button>
    <div class="vs-toast-progress" style="animation-duration: ${a}ms;"></div>
  `,(l=r.querySelector(".vs-toast-action"))==null||l.addEventListener("click",c=>{c.stopPropagation(),s(),Eo(r)}),(p=r.querySelector(".vs-toast-dismiss"))==null||p.addEventListener("click",c=>{c.stopPropagation(),Eo(r)}),o.appendChild(r),r._autoTimer=setTimeout(()=>Eo(r),a)}function $o(e){return e.get("aiConfigured")===!0}function sd({read:e,visible:t,busy:s,initial:n,changed:o}){let i=null,a=!1;return{async refresh(){if(a||!t()||s())return!1;a=!0;try{let r=await e(),l=r!=null&&r.ok?r.data:null;return!l||!/^draft:\d+$/.test(l.draft_version)?!1:(i===null?await n(l):i!==l.draft_version&&await o(l),i=l.draft_version,!0)}catch{return!1}finally{a=!1}}}}async function rr({tabs:e,read:t,buffer:s,apply:n,alive:o=()=>!0,version:i}){var l,p,c,d,u,v,f,b,h,g;let a=[],r=[];for(let m of[...e]){if(!o())break;let x=m.baseline,w=m.path,E=await t(w);if(!o()||!e.includes(m)||m.path!==w||m.baseline!==x)continue;let k=!(E!=null&&E.ok)&&["not_found","file_not_found"].includes((l=E==null?void 0:E.error)==null?void 0:l.code);if(!(E!=null&&E.ok)&&!k){r.push(m.path);continue}let $=k?null:(p=E.data)==null?void 0:p.content;if($!==null&&typeof $!="string"){r.push(m.path);continue}if($===x){m.contentHash=((c=E.data)==null?void 0:c.content_sha256)||null,m.draftVersion=((d=E.data)==null?void 0:d.draft_version)||i,m.externalConflict=null;continue}let S=s(m);if(k||m.dirty||S!==x){let _=((u=E.data)==null?void 0:u.content_sha256)||null;(((v=m.externalConflict)==null?void 0:v.content)!==$||((f=m.externalConflict)==null?void 0:f.contentHash)!==_||((b=m.externalConflict)==null?void 0:b.missing)!==k)&&(m.externalConflict={content:$,contentHash:_,version:i,missing:k}),a.push(m.path)}else m.baseline=$,m.contentHash=((h=E.data)==null?void 0:h.content_sha256)||null,m.draftVersion=((g=E.data)==null?void 0:g.draft_version)||i,m._buffer=$,m.dirty=!1,m.externalConflict=null,n(m,$)}return{conflicts:a,failed:r}}function lr(e,t,s){let n=e.externalConflict;return!n||n.missing||!n.contentHash?!1:(e.baseline=n.content,e.contentHash=n.contentHash,e.draftVersion=n.version,e._buffer=t==="saved"?n.content:s,e.dirty=e._buffer!==e.baseline,e.externalConflict=null,!0)}function dr(e,t,s,n){e.baseline=t,e.contentHash=s||null,e._buffer=n,e.dirty=n!==t}var cr=null,So=null,Co=new Map;async function ps(e){if(!e.startsWith("_prompts/"))return ot(e);let t=await Y.get(`/settings/prompts/content?path=${encodeURIComponent(e.slice(9))}`);return t.ok&&Co.set(e,{version:t.data.prompt_version,hash:t.data.content_sha256}),t}async function pr(e){if(!e.path.startsWith("_prompts/"))return ht(e);let t=Co.get(e.path),s=t==null?void 0:t.version;if(!s||e.expected_content_sha256&&e.expected_content_sha256!==t.hash)return{ok:!1,error:{code:"content_conflict",message:"Reload this prompt before saving its override."}};let n=await ye("/settings/prompts/content",{path:e.path.slice(9),version:s,content:e.content},"put");return n.ok?ps(e.path):n}async function Wu(e){if(!Co.has(e)){let s=await ps(e);if(!s.ok)return s}let t=await ye("/settings/prompts/content",{path:e.slice(9),version:Co.get(e).version},"delete");return t.ok&&Co.delete(e),t}function nd(){return`
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

        <div id="editor-external-conflict" hidden></div>

        <!-- Editor Host -->
        <div id="editor-host" class="vs-editor-host" style="position: relative;">
          <div id="editor-empty-state" class="vs-editor-empty">
            <div class="vs-empty-state-inner">
              <div class="vs-empty-state-icon">${L.fileCode}</div>
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
  `}async function od(){var Q;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,sidebarWidth:(e==null?void 0:e.sidebarWidth)||null,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(I=>I.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(I=>I.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,sidebarWidth:t.sidebarWidth,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={reconcileExternalDraft:I=>Je(I),dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)},reconcileMove:async(I,M)=>{if(t.disposed)return;let F=t.openTabs.find(ne=>ne.path===I);if(!F)return;F.path=M,t.activeTab===I&&(t.activeTab=M);let{ok:V,data:z}=await ps(M);V&&typeof(z==null?void 0:z.content)=="string"&&(F.baseline=z.content,F.contentHash=z.content_sha256||null,F.draftVersion=z.draft_version||null,F._buffer=z.content,F.dirty=!1,t.activeTab===M&&t.monacoInstance&&U(z.content,M)),await se(),_(),S(),pe(),ze(),s()},reconcileDelete:async I=>{if(t.disposed)return;let M=t.openTabs.findIndex(F=>F.path===I);if(M!==-1){if(t.openTabs.splice(M,1),t.activeTab===I){let F=t.openTabs[Math.min(M,t.openTabs.length-1)];F?await j(F.path):(t.activeTab=null,ee(),pe(),ze())}await se(),_(),S(),s()}}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),r=document.getElementById("editor-host"),l=document.getElementById("editor-empty-state"),p=document.getElementById("editor-monaco-container"),c=document.getElementById("editor-file-info"),d=document.getElementById("editor-status"),u=document.getElementById("editor-save-btn"),v=document.getElementById("editor-refresh-tree"),f=document.getElementById("editor-new-file"),b=document.getElementById("editor-sidebar"),h=document.getElementById("editor-sidebar-resize"),g=document.getElementById("editor-font-size-select"),m=document.getElementById("editor-word-wrap-btn");g&&(g.value=t.fontSize);let x=()=>{m&&(t.wordWrap?(m.style.color="var(--vs-accent)",m.style.backgroundColor="var(--vs-accent-dim)"):(m.style.color="var(--vs-text-ghost)",m.style.backgroundColor="transparent"))};x();let w=(I,M="muted")=>{d&&(d.textContent=I,d.dataset.state=M)},E=I=>{let M=t.files.find(F=>F.path===I);return(M==null?void 0:M.readonly)===!0},k=I=>{let M=I.toLowerCase();return M.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':M.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':M.endsWith(".js")||M.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},$=(I,M="")=>{let F=[],V={},z=Z=>{if(V[Z])return V[Z];let oe=Z.split("/"),re=oe[oe.length-1],de=oe.slice(0,-1).join("/"),xe=M?M+Z:Z,me={name:re,path:xe,type:"folder",children:[]};return V[Z]=me,de?z(de).children.push(me):F.push(me),me};for(let Z of I){let re=(M&&Z.path.startsWith(M)?Z.path.substring(M.length):Z.path).split("/");if(re.length===1)F.push({name:re[0],path:Z.path,type:"file",meta:Z});else{let de=re.slice(0,-1).join("/");z(de).children.push({name:re[re.length-1],path:Z.path,type:"file",meta:Z})}}let ne=Z=>{Z.sort((oe,re)=>oe.type!==re.type?oe.type==="folder"?-1:1:oe.name.localeCompare(re.name));for(let oe of Z)oe.type==="folder"&&ne(oe.children)};return ne(F),F},S=()=>{if(!n)return;let I=(ne,Z=0)=>ne.map(oe=>{var Et,le;if(oe.type==="folder"){let Le=t.expandedFolders.has(oe.path);return`
            <div class="vs-tree-item" data-folder="${y(oe.path)}" style="--tree-indent: ${Z};">
              <span class="vs-tree-folder-toggle" data-expanded="${Le}">${L.chevronRight}</span>
              <span class="vs-tree-item-icon">${Le?L.folderOpen||L.folder:L.folder}</span>
              <span class="vs-tree-item-name">${y(oe.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${y(oe.path)}" data-collapsed="${!Le}">
              ${I(oe.children,Z+1)}
            </div>
          `}let re=t.activeTab===oe.path,de=t.openTabs.find(Le=>Le.path===oe.path),xe=de!=null&&de.dirty?" \u2022":"",qe=E(oe.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",be=((Et=oe.meta)==null?void 0:Et.custom)===!0,he=((le=oe.meta)==null?void 0:le.protected)===!0,_e="";return oe.path==="assets/css/tailwind.css"?_e=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:he?be&&(_e=`
            <button class="vs-tree-item-restore" data-restore-file="${y(oe.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):_e=`
            <button class="vs-tree-item-delete" data-delete-file="${y(oe.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${y(oe.path)}" data-active="${re}" style="--tree-indent: ${Z};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${k(oe.path)}</span>
            <span class="vs-tree-item-name">${y(oe.name)}${qe}${xe}</span>
            ${_e}
          </div>
        `}).join(""),M=(ne,Z,oe)=>{let re=oe.querySelector(".vs-explorer-caret");t.expandedSections.has(ne)?(Z.style.display="block",oe.classList.add("is-expanded")):(Z.style.display="none",oe.classList.remove("is-expanded"))},F=document.querySelector('[data-section="site"]'),V=document.querySelector('[data-section="config"]'),z=document.querySelector('[data-section="prompts"]');F&&M("site",n,F),V&&o&&M("config",o,V),z&&i&&M("prompts",i,z),n.innerHTML=I(t.treeData.site),o&&(o.innerHTML=I(t.treeData.config)),i&&(i.innerHTML=I(t.treeData.prompts)),R()},_=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(I=>{let M=I.path===t.activeTab,F=I.path.split("/").pop(),z=E(I.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${y(I.path)}" data-active="${M}" data-dirty="${I.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${y(F)}${z}</span>
          <button class="vs-editor-tab-close" data-close-tab="${y(I.path)}" title="Close">${L.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',N(),W()}},q=null,K=I=>{if(!a)return;let M=8,F=()=>{a.scrollLeft+=I==="left"?-M:M,W()};F(),q=setInterval(F,16)},O=()=>{q&&(clearInterval(q),q=null)},W=()=>{let I=document.getElementById("editor-tab-scroll-left"),M=document.getElementById("editor-tab-scroll-right");if(!a||!I||!M)return;let F=a.scrollLeft>0,V=a.scrollLeft<a.scrollWidth-a.clientWidth-1;I.style.display=F?"flex":"none",M.style.display=V?"flex":"none"};a&&(a.addEventListener("scroll",W,{passive:!0}),window.addEventListener("resize",W,{passive:!0}));let G=document.getElementById("editor-tab-scroll-left"),J=document.getElementById("editor-tab-scroll-right");G&&(G.addEventListener("mousedown",()=>K("left")),G.addEventListener("mouseup",O),G.addEventListener("mouseleave",O)),J&&(J.addEventListener("mousedown",()=>K("right")),J.addEventListener("mouseup",O),J.addEventListener("mouseleave",O));let T=()=>{l&&(l.style.display="none"),p&&(p.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},C=async I=>{if(t.disposed)return;let M=t.openTabs.find(Z=>Z.path===I);if(M){await j(I);return}w("Loading\u2026");let{ok:F,data:V,error:z}=await ps(I);if(!F){A((z==null?void 0:z.message)||"Could not load file.","error"),w("Load failed","error");return}let ne=typeof(V==null?void 0:V.content)=="string"?V.content:"";M={path:I,baseline:ne,contentHash:V.content_sha256||null,draftVersion:V.draft_version||null,dirty:!1},t.openTabs.push(M),T(),await j(I),U(ne,I),w("Ready"),s()},j=async I=>{if(t.disposed)return;let M=t.openTabs.find(V=>V.path===t.activeTab);M&&t.monacoInstance&&(M._buffer=t.monacoInstance.getValue()),t.activeTab=I;let F=t.openTabs.find(V=>V.path===I);if(F&&t.monacoInstance){let V=F._buffer!==void 0?F._buffer:F.baseline;U(V,I)}pe(),ze(),_(),setTimeout(()=>{if(a){let V=a.querySelector('.vs-editor-tab[data-active="true"]');if(V){let z=V.getBoundingClientRect(),ne=a.getBoundingClientRect();z.left<ne.left?a.scrollBy({left:z.left-ne.left,behavior:"smooth"}):z.right>ne.right&&a.scrollBy({left:z.right-ne.right,behavior:"smooth"})}}},10),S(),s()},B=async I=>{let M=t.openTabs.find(V=>V.path===I);if(M!=null&&M.dirty&&!await Ae({title:"Discard unsaved changes?",description:`"${I}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let F=t.openTabs.findIndex(V=>V.path===I);if(F!==-1){if(t.openTabs.splice(F,1),t.activeTab===I){let V=t.openTabs[Math.min(F,t.openTabs.length-1)];V?await j(V.path):(t.activeTab=null,ee(),pe(),ze())}_(),S(),s()}},P=async I=>{var Z,oe;if((Z=window.demoGuard)!=null&&Z.call(window)||(oe=window.viewerGuard)!=null&&oe.call(window))return;let M=I.split("/").pop();if(!await Ae({title:"Delete file?",description:`Are you sure you want to permanently delete "${M}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;w("Deleting\u2026");let{ok:V,error:z}=await Wl(I);if(!V){A((z==null?void 0:z.message)||"Could not delete file.","error"),w("Delete failed","error");return}let ne=t.openTabs.findIndex(re=>re.path===I);if(ne!==-1){if(t.openTabs.splice(ne,1),t.activeTab===I){let re=t.openTabs[Math.min(ne,t.openTabs.length-1)];re?await j(re.path):(t.activeTab=null,ee(),pe(),ze())}_()}await se(),s(),A(`Deleted ${M}`,"success"),w("Ready")},H=async I=>{var Z,oe;if((Z=window.demoGuard)!=null&&Z.call(window)||(oe=window.viewerGuard)!=null&&oe.call(window))return;let M=I.split("/").pop();if(!await Ae({title:"Reset system prompt?",description:`Are you sure you want to reset "${M}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;w("Resetting\u2026");let{ok:V,error:z}=await Wu(I);if(!V){A((z==null?void 0:z.message)||"Could not reset file.","error"),w("Reset failed","error");return}let ne=t.openTabs.findIndex(re=>re.path===I);if(ne!==-1){let{ok:re,data:de}=await ps(I);if(re&&typeof(de==null?void 0:de.content)=="string"){let xe=t.openTabs[ne];xe.baseline=de.content,xe.contentHash=de.content_sha256||null,xe.draftVersion=de.draft_version||null,xe.dirty=!1,xe._buffer=de.content,t.activeTab===I&&U(de.content,I)}}ze(),await se(),s(),A(`Reset ${M} to default`,"success"),w("Ready")},U=(I,M)=>{var V;if(!t.monacoInstance||!t.monaco)return;let F=t.monacoInstance.getModel();F&&(t.monacoInstance.setValue(I),t.monaco.editor.setModelLanguage(F,bo(M)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((V=window.canWrite)!=null&&V.call(window))||E(M)}))},ee=()=>{l&&(l.style.display=""),p&&(p.style.display="none")},pe=()=>{if(!c)return;if(!t.activeTab){c.textContent="No file open";return}let I=t.openTabs.find(z=>z.path===t.activeTab),M=t.files.find(z=>z.path===t.activeTab),F=M!=null&&M.size?`${(Number(M.size)/1024).toFixed(1)} KB`:"",V=bo(t.activeTab).toUpperCase();c.textContent=[t.activeTab,V,F].filter(Boolean).join(" \u2022 ")};function fe(I){return t.activeTab===I.path&&t.monacoInstance?t.monacoInstance.getValue():I._buffer??I.baseline}function Oe(){var V;let I=document.getElementById("editor-external-conflict");if(!I)return;let M=t.openTabs.find(z=>z.path===t.activeTab);if(I.hidden=!(M!=null&&M.externalConflict),!(M!=null&&M.externalConflict)){I.innerHTML="",I._conflict=null;return}if(I._conflict===M.externalConflict&&I.dataset.path===M.path)return;let F=(V=I.querySelector("details"))==null?void 0:V.open;I._conflict=M.externalConflict,I.dataset.path=M.path,I.innerHTML=id(M.externalConflict,M.path),F&&I.querySelector("details")&&(I.querySelector("details").open=!0),I.querySelectorAll("[data-external-choice]").forEach(z=>z.addEventListener("click",async()=>{var re;let ne=z.dataset.externalChoice,Z=M.externalConflict,oe=M.path;if(!(ne==="saved"&&M.dirty&&!await Ae({title:"Replace your unsaved edits?",description:"The saved version will replace this editor buffer.",confirmLabel:"Use saved version",cancelLabel:"Keep editing",danger:!0}))){if(t.disposed||!t.openTabs.includes(M)||M.path!==oe||M.externalConflict!==Z){A("The saved version changed again. Review it before choosing.","info");return}lr(M,ne,fe(M))&&(t.activeTab===M.path&&U(M._buffer,M.path),ze(),_(),S(),w(M.dirty?"Your edits are preserved. Save when ready.":"Saved version loaded",M.dirty?"warning":"muted"),(re=t.monacoInstance)==null||re.focus())}}))}async function Je(I){let M=await rr({tabs:t.openTabs,read:F=>ps(F),buffer:fe,alive:()=>!t.disposed,version:I.draft_version,apply:(F,V)=>{t.activeTab===F.path&&U(V,F.path)}});return t.disposed||(await se(),_(),pe(),ze(),M.conflicts.length&&w("Draft changed. Your unsaved edits are preserved.","warning")),M}let ze=()=>{var F;if(Oe(),!u)return;let I=t.openTabs.find(V=>V.path===t.activeTab);if(t.activeTab?E(t.activeTab)||!((F=window.canWrite)!=null&&F.call(window)):!1){u.disabled=!0,u.textContent="Read-Only",u.classList.remove("vs-btn-primary"),u.classList.add("vs-btn-ghost");return}if(I!=null&&I.externalConflict){u.disabled=!1,u.textContent="Review changes";return}if(!I||!I.dirty){u.disabled=!0,u.textContent="Saved",u.classList.remove("vs-btn-primary"),u.classList.add("vs-btn-ghost");return}u.disabled=!1,u.textContent="Save",u.classList.remove("vs-btn-ghost"),u.classList.add("vs-btn-primary")},gt=()=>{let I=t.openTabs.find(V=>V.path===t.activeTab);if(!I||!t.monacoInstance)return;let M=t.monacoInstance.getValue(),F=I.dirty;I.dirty=M!==I.baseline,F!==I.dirty&&(ze(),_(),I.dirty?w("Unsaved changes","warning"):w("Ready"))},At=async()=>{var Z,oe,re,de,xe,me,qe;if((Z=window.demoGuard)!=null&&Z.call(window)||(oe=window.viewerGuard)!=null&&oe.call(window))return;let I=t.openTabs.find(be=>be.path===t.activeTab);if(!I||!t.monacoInstance)return;if(I.externalConflict){(de=(re=document.getElementById("editor-external-conflict"))==null?void 0:re.querySelector("summary"))==null||de.focus();return}if(!I.dirty)return;if(!I.contentHash){A("Reload this file before saving so Studio can check for newer changes.","warning");return}let M=t.monacoInstance.getValue();u.disabled=!0,u.textContent="Saving\u2026",w("Saving\u2026");let{ok:F,data:V,error:z}=await pr({path:I.path,content:M,expected_content_sha256:I.contentHash,base_draft_version:I.draftVersion});if(!F){(z==null?void 0:z.code)==="content_conflict"&&await Je({draft_version:null}),u.disabled=!1,u.textContent="Save",A((z==null?void 0:z.message)||"Could not save file.","error"),w(I.externalConflict?"Draft changed. Your edits are preserved.":"Save failed","error"),ze();return}dr(I,M,V==null?void 0:V.content_sha256,fe(I)),I.draftVersion=(V==null?void 0:V.draft_version)||null,ze(),_(),S(),w(`${I.path}`,"muted"),I.path.toLowerCase().endsWith(".css")?(xe=window.sendPreviewMessage)==null||xe.call(window,"voxelsite:reload-css"):(me=window.sendPreviewMessage)==null||me.call(window,"voxelsite:reload"),setTimeout(()=>{var be;return(be=window.refreshPreview)==null?void 0:be.call(window)},400),(qe=window.refreshPublishState)==null||qe.call(window,{silent:!0});let ne=t.openTabs.find(be=>be.path==="assets/css/tailwind.css");ne&&I.path!=="assets/css/tailwind.css"&&ot("assets/css/tailwind.css").then(({ok:be,data:he})=>{be&&typeof(he==null?void 0:he.content)=="string"&&(ne.baseline=he.content,ne._buffer=he.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(he.content))})},R=()=>{let I=M=>{M&&(M.querySelectorAll("[data-file]").forEach(F=>{F.addEventListener("click",V=>{V.target.closest("[data-delete-file]")||C(F.dataset.file)})}),M.querySelectorAll("[data-delete-file]").forEach(F=>{F.addEventListener("click",V=>{V.stopPropagation(),P(F.dataset.deleteFile)})}),M.querySelectorAll("[data-restore-file]").forEach(F=>{F.addEventListener("click",V=>{V.stopPropagation(),H(F.dataset.restoreFile)})}),M.querySelectorAll("[data-compile-tailwind]").forEach(F=>{F.addEventListener("click",async V=>{var xe,me;if(V.stopPropagation(),(xe=window.demoGuard)!=null&&xe.call(window)||(me=window.viewerGuard)!=null&&me.call(window))return;F.style.opacity="0.4",F.style.pointerEvents="none",w("Compiling Tailwind\u2026");let z=await Gl(cr),{ok:ne,data:Z,error:oe}=z.ok?await ot("assets/css/tailwind.css"):z;if(ne&&await se(),F.style.opacity="",F.style.pointerEvents="",!ne){A((oe==null?void 0:oe.message)||"Tailwind compilation failed.","error"),w("Compile failed","error");return}let re="assets/css/tailwind.css",de=t.openTabs.find(qe=>qe.path===re);de&&(de.baseline=Z.content,de.contentHash=Z.content_sha256||null,de.draftVersion=Z.draft_version||null,de.dirty=!1,t.activeTab===re&&t.monacoInstance&&t.monacoInstance.setValue(Z.content)),A("Tailwind CSS is up to date.","success"),w("Compiled")})}),M.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(F=>{F.addEventListener("click",V=>{V.stopPropagation();let z=F.closest(".vs-tree-item"),ne=z.dataset.folder;if(!ne)return;let Z=t.expandedFolders.has(ne);Z?t.expandedFolders.delete(ne):t.expandedFolders.add(ne);let oe=!Z,re=z.querySelector(".vs-tree-folder-toggle");re&&re.setAttribute("data-expanded",String(oe));let de=z.nextElementSibling;de&&de.classList.contains("vs-tree-folder-children")&&(de.setAttribute("data-collapsed",String(!oe)),de.style.display=oe?"":"none");let xe=z.querySelector(".vs-tree-item-icon");xe&&(xe.innerHTML=oe?L.folderOpen||L.folder:L.folder),s()})}))};I(n),I(o),I(i),document.querySelectorAll(".vs-explorer-section-header").forEach(M=>{M.dataset.bound||(M.dataset.bound="true",M.addEventListener("click",()=>{let F=M.dataset.section,V=M.closest(".vs-explorer-section"),z=V==null?void 0:V.querySelector(".vs-editor-tree");!V||!z||(t.expandedSections.has(F)?(t.expandedSections.delete(F),M.classList.remove("is-expanded"),z.style.display="none"):(t.expandedSections.add(F),M.classList.add("is-expanded"),z.style.display="block"),s())}))})},N=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(I=>{I.addEventListener("click",M=>{M.target.closest("[data-close-tab]")||j(I.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(I=>{I.addEventListener("click",M=>{M.stopPropagation(),B(I.dataset.closeTab)})}))};if(h&&b){let I=!1;h.addEventListener("mousedown",M=>{M.preventDefault(),I=!0,h.classList.add("is-dragging");let F=z=>{if(!I)return;let ne=Math.min(400,Math.max(200,z.clientX));b.style.width=ne+"px"},V=()=>{I=!1,h.classList.remove("is-dragging"),document.removeEventListener("mousemove",F),document.removeEventListener("mouseup",V),t.sidebarWidth=b.offsetWidth,s()};document.addEventListener("mousemove",F),document.addEventListener("mouseup",V)})}u==null||u.addEventListener("click",At),g==null||g.addEventListener("change",I=>{let M=parseInt(I.target.value,10);t.fontSize=M,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:M}),s()}),m==null||m.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,x(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),v==null||v.addEventListener("click",()=>se()),f==null||f.addEventListener("click",async()=>{var Z,oe,re;if((Z=window.demoGuard)!=null&&Z.call(window)||(oe=window.viewerGuard)!=null&&oe.call(window))return;let I=await Yl({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!I||!I.trim())return;let M=I.trim(),F=(re=M.split(".").pop())==null?void 0:re.toLowerCase(),V=["php","css","js","json"];if(!F||!V.includes(F)){A(`Only ${V.join(", ")} files can be created.`,"warning");return}w("Creating\u2026");let{ok:z,error:ne}=await Vl(M,cr);if(!z){A((ne==null?void 0:ne.message)||"Could not create file.","error"),w("Create failed","error");return}await se(),await C(M),A(`Created ${M}`,"success")});let te=I=>{if(t.disposed){document.removeEventListener("keydown",te);return}(I.metaKey||I.ctrlKey)&&I.key==="s"&&(I.preventDefault(),At())};document.addEventListener("keydown",te);let se=async()=>{var V;let{ok:I,data:M,error:F}=await Y.get("/files");if(!I||!((V=M==null?void 0:M.files)!=null&&V.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}cr=M.draft_version,Ul(M),t.files=M.files,t.treeData={site:$(M.files.filter(z=>!z.path.startsWith("_prompts/")&&!z.path.startsWith("_root/"))),config:$(M.files.filter(z=>z.path.startsWith("_root/")),"_root/"),prompts:$(M.files.filter(z=>z.path.startsWith("_prompts/")),"_prompts/")},S()},Ee=async()=>{if(!p)return;let I;try{I=await Ni()}catch{A("Monaco editor is not available.","warning");return}t.monaco=I;let M=gn();I.editor.setTheme(M);let F=I.editor.create(p,{value:"",language:"php",theme:M,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=F,F.onDidChangeModelContent(()=>gt()),F.addCommand(I.KeyMod.CtrlCmd|I.KeyCode.KeyK,async()=>{var nt,Et;if((nt=window.builtInAiGuard)!=null&&nt.call(window))return;if(t.monacoInstance.getOption(I.editor.EditorOption.readOnly)){A("Cannot use inline AI on a read-only file.","warning");return}let z=t.activeTab;if(!z)return;let ne=t.monacoInstance.getModel(),Z=t.monacoInstance.getSelection(),oe=ne.getValueInRange(Z);if(!oe||oe.trim()===""){let le=t.monacoInstance.getPosition(),Le=ne.getLineContent(le.lineNumber);if(Le.trim()===""){A("Highlight a block of code to edit.","warning");return}oe=Le,t.monacoInstance.setSelection(new I.Range(le.lineNumber,1,le.lineNumber,ne.getLineMaxColumn(le.lineNumber)))}let re=await V(z);if(!re)return;let de=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let xe=new AbortController,me=0,qe=Date.now(),be=document.createElement("div");be.className="vs-inline-ai-overlay",be.innerHTML=`
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
      `,document.body.appendChild(be),requestAnimationFrame(()=>be.classList.add("is-visible"));let he=be.querySelector("#ai-gen-timer"),_e=setInterval(()=>{let le=Math.floor((Date.now()-qe)/1e3);he&&(he.textContent=`${le}s`)},1e3);(Et=be.querySelector("#ai-gen-stop"))==null||Et.addEventListener("click",()=>{xe.abort()}),w("AI is editing...","muted");try{await ds("/ai/prompt",{user_prompt:re,action_type:"inline_edit",action_data:{path:z,selection:oe}},{signal:xe.signal,onStatus:le=>{let Le=be.querySelector("#ai-gen-step"),Xt=typeof le=="string"?le:le.message||"Generating\u2026";Le&&(Le.textContent=Xt)},onToken:()=>{me++;let le=be.querySelector("#ai-gen-tokens"),Le=be.querySelector("#ai-gen-token-dot");le&&(le.textContent=`${me} tokens`),Le&&(Le.style.display="")},onFile:()=>{let le=be.querySelector("#ai-gen-step");le&&(le.textContent="Applying changes\u2026")},onError:le=>{A(le.message||"Generation failed","error")},onDone:async le=>{var Xt;if(le.cancelled){A("Generation cancelled","info");return}if((Xt=le.files_modified)==null?void 0:Xt.some(Bt=>(typeof Bt=="string"?Bt:(Bt==null?void 0:Bt.path)||"").replace(/^\//,"")===z.replace(/^\//,""))){let{ok:Bt,data:tt}=await ps(z);if(Bt&&(tt!=null&&tt.content)){let De=tt.content;await pr({path:z,content:de}),t.monacoInstance.getModel().setValue(De);let He=t.openTabs.find(Ze=>Ze.path===z);He&&(He._buffer=De,He.baseline=de),gt(),A("Review changes and save.","success")}}else le.partial||A("Complete (No changes made to this file)","info")}})}finally{clearInterval(_e),t.monacoInstance.updateOptions({readOnly:!1}),be.classList.remove("is-visible"),setTimeout(()=>be.remove(),300),w("Ready","muted")}});function V(z){return new Promise(ne=>{var he;let Z=document.getElementById("vs-inline-ai-prompt-overlay");Z&&Z.remove();let oe=z.split("/").pop(),re=document.createElement("div");re.id="vs-inline-ai-prompt-overlay",re.className="vs-modal-overlay",re.innerHTML=`
          <div class="vs-inline-ai-prompt">
            <div class="vs-inline-ai-prompt-header">
              <svg class="vs-inline-ai-prompt-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span class="vs-inline-ai-prompt-title">Edit with AI</span>
              <span class="vs-inline-ai-prompt-subtitle" title="${z}">${oe}</span>
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
        `;let de=_e=>{document.removeEventListener("keydown",xe),Te(re),ne(_e)},xe=_e=>{_e.key==="Escape"&&(_e.preventDefault(),de(null))};document.body.appendChild(re),requestAnimationFrame(()=>re.classList.add("is-visible"));let me=re.querySelector("#vs-inline-ai-input"),qe=()=>{me.style.height="auto",me.style.height=Math.min(me.scrollHeight,160)+"px"};me.addEventListener("input",qe),setTimeout(()=>me==null?void 0:me.focus(),200);let be=null;re.addEventListener("mousedown",_e=>{be=_e.target}),re.addEventListener("click",_e=>{_e.target===re&&be===re&&de(null)}),(he=re.querySelector("#vs-inline-ai-go"))==null||he.addEventListener("click",()=>{let _e=((me==null?void 0:me.value)||"").trim();_e&&de(_e)}),me==null||me.addEventListener("keydown",_e=>{if(_e.key==="Enter"&&(_e.metaKey||_e.ctrlKey)){_e.preventDefault();let nt=((me==null?void 0:me.value)||"").trim();nt&&de(nt)}}),document.addEventListener("keydown",xe)})}};if(await Promise.all([se(),Ee()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:I,active:M}=t._pendingRestore;t._pendingRestore=null;for(let F of I){if(!t.files.some(ne=>ne.path===F))continue;let{ok:V,data:z}=await ps(F);V&&typeof(z==null?void 0:z.content)=="string"&&t.openTabs.push({path:F,baseline:z.content,contentHash:z.content_sha256||null,draftVersion:z.draft_version||null,dirty:!1})}if(t.openTabs.length>0){let F=M&&t.openTabs.find(V=>V.path===M)?M:t.openTabs[0].path;T(),await j(F),U(((Q=t.openTabs.find(V=>V.path===F))==null?void 0:Q.baseline)||"",F),w("Ready")}}if(window.__vsEditorPendingFile){let I=window.__vsEditorPendingFile;window.__vsEditorPendingFile=null,t.files.some(M=>M.path===I)&&await C(I)}window.__vsEditorPage&&(window.__vsEditorPage.openFile=C)}function id(e,t){return`<div class="px-4 py-3 border-b border-vs-border-subtle bg-vs-bg-surface text-xs text-vs-text-secondary" role="status">
    <p>${e.missing?"This file was removed from the saved draft.":"This file changed in the saved draft."} Your editor buffer is preserved.</p>
    ${e.missing?'<p class="mt-2">Copy any work you want to keep before closing this file.</p>':`<details class="mt-2">
      <summary class="cursor-pointer">Review saved version of ${y(t)}</summary>
      <textarea readonly aria-label="Latest saved version" class="vs-input mt-2 w-full" rows="8" spellcheck="false">${y(e.content)}</textarea>
      <div class="flex flex-wrap gap-2 mt-2">
        <button type="button" data-external-choice="saved" class="vs-btn vs-btn-secondary vs-btn-xs">Use saved version</button>
        <button type="button" data-external-choice="local" class="vs-btn vs-btn-secondary vs-btn-xs">Keep my edits</button>
      </div><p class="mt-2 text-vs-text-tertiary">Keeping your edits does not save them. Review and save when ready.</p>
    </details>`}
  </div>`}function gn(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function Ni(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:So||(So=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,r){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}${Ce("ui/lib/monaco/")}'
            };
            importScripts('${window.location.origin}${Ce("ui/lib/monaco/")}vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:Ce("ui/lib/monaco/vs")}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src=Ce("ui/lib/monaco/vs/loader.js"),i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw So=null,t}),So)}async function _o(e=""){var O,W,G,J,T;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
      <div id="vs-code-external-conflict" hidden></div>
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),r=s.querySelector("#vs-code-meta"),l=s.querySelector("#vs-code-status"),p=s.querySelector("#vs-code-editor-host"),c={files:[],path:"",baseline:"",contentHash:null,externalConflict:null,editor:null,editorCleanup:null,closed:!1},d=(C,j="muted")=>{l&&(l.textContent=C,l.dataset.state=j)},u=()=>c.files.find(C=>C.path===c.path)||null,v=()=>!!c.editor&&c.editor.getValue()!==c.baseline,f=()=>{if(!r)return;let C=u();if(!C){r.textContent="No file selected";return}let j=C.size?`${(Number(C.size)/1024).toFixed(1)} KB`:"0 KB",B=C.modified?new Date(C.modified).toLocaleString():"Unknown date";r.textContent=`${C.path} \u2022 ${j} \u2022 ${B}`},b=window.IS_DEMO||!((O=window.canWrite)!=null&&O.call(window)),h=()=>{if(b)return!0;let C=u();return(C==null?void 0:C.readonly)===!0},g=()=>{if(S(),!o)return;if(h()){o.disabled=!0,o.textContent="Read Only",d("Read-only mode","muted");return}if(c.externalConflict){o.disabled=!1,o.textContent="Review changes";return}let j=v();o.disabled=!j,o.textContent=j?"Save Changes":"Saved",j?d("Unsaved changes","warning"):c.path&&d(c.path||"Ready","muted")},m=async()=>{var C,j;c.closed||v()&&!await Ae({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(c.closed=!0,((C=window.__vsCodeEditorModal)==null?void 0:C.state)===c&&(window.__vsCodeEditorModal=null),(j=c.editorCleanup)!=null&&j.dispose&&(c.editorCleanup.dispose(),c.editorCleanup=null),c.editor&&(c.editor.dispose(),c.editor=null),Te(s))},x=(C,j=null,B=null,P=null)=>{if(!c.editor)return;c.editor.setValue(C),c.baseline=C,c.contentHash=B,c.draftVersion=P,c.externalConflict=null;let H=(j==null?void 0:j.language)||bo(c.path);c.editor.setLanguage&&c.editor.setLanguage(H),c.editor.setReadOnly&&c.editor.setReadOnly(h()),f(),g()},w=async(C,{silent:j=!1}={})=>{if(!C||!c.editor)return!1;c.path=C,j||d("Loading file\u2026");let{ok:B,data:P,error:H}=await ps(C);if(!B)return A((H==null?void 0:H.message)||"Could not load file.","error"),d("Load failed","error"),!1;let U=typeof(P==null?void 0:P.content)=="string"?P.content:"";return x(U,(P==null?void 0:P.file)||u(),(P==null?void 0:P.content_sha256)||null,(P==null?void 0:P.draft_version)||null),!0},E=async()=>v()?await Ae({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,k=async C=>{if(!C||C===c.path)return;if(!await E()){n&&(n.value=c.path);return}await w(C)},$=async()=>{var U,ee,pe,fe;if(!c.editor||!c.path||!o)return;if(c.externalConflict){(U=s.querySelector("#vs-code-external-conflict summary"))==null||U.focus();return}if(!c.contentHash){A("Reload this file before saving so Studio can check for newer changes.","warning");return}let C=c.path,j=c.editor.getValue();if(j===c.baseline){g();return}o.disabled=!0,o.textContent="Saving\u2026",d("Saving\u2026");let{ok:B,data:P,error:H}=await pr({path:c.path,content:j,expected_content_sha256:c.contentHash,base_draft_version:c.draftVersion});if(!(c.closed||c.path!==C)){if(!B){(H==null?void 0:H.code)==="content_conflict"&&await _({draft_version:null}),o.disabled=!1,o.textContent="Save Changes",A((H==null?void 0:H.message)||"Could not save file.","error"),g(),d(c.externalConflict?"Draft changed. Your edits are preserved.":"Save failed","error");return}dr(c,j,P==null?void 0:P.content_sha256,c.editor.getValue()),c.draftVersion=(P==null?void 0:P.draft_version)||null,g(),d(c.path||"Ready","muted"),c.path.toLowerCase().endsWith(".css")?(ee=window.sendPreviewMessage)==null||ee.call(window,"voxelsite:reload-css"):(pe=window.sendPreviewMessage)==null||pe.call(window,"voxelsite:reload"),setTimeout(()=>{var Oe;return(Oe=window.refreshPreview)==null?void 0:Oe.call(window)},400),(fe=window.refreshPublishState)==null||fe.call(window,{silent:!0})}};function S(){var B;let C=s.querySelector("#vs-code-external-conflict");if(!C)return;if(C.hidden=!c.externalConflict,!c.externalConflict){C.innerHTML="",C._conflict=null;return}if(C._conflict===c.externalConflict&&C.dataset.path===c.path)return;let j=(B=C.querySelector("details"))==null?void 0:B.open;C._conflict=c.externalConflict,C.dataset.path=c.path,C.innerHTML=id(c.externalConflict,c.path),j&&C.querySelector("details")&&(C.querySelector("details").open=!0),C.querySelectorAll("[data-external-choice]").forEach(P=>P.addEventListener("click",async()=>{var ee,pe;let H=P.dataset.externalChoice,U=c.externalConflict;if(!(H==="saved"&&v()&&!await Ae({title:"Replace your unsaved edits?",description:"The saved version will replace this editor buffer.",confirmLabel:"Use saved version",cancelLabel:"Keep editing",danger:!0}))){if(c.closed||c.externalConflict!==U){A("The saved version changed again. Review it before choosing.","info");return}lr(c,H,c.editor.getValue())&&(c.editor.setValue(c._buffer),g(),(pe=(ee=c.editor).focus)==null||pe.call(ee))}}))}async function _(C){if(c.closed||!c.editor||!c.path)return;c.dirty=v();let j=await rr({tabs:[c],read:B=>ps(B),buffer:()=>c.editor.getValue(),alive:()=>!c.closed,version:C.draft_version,apply:(B,P)=>c.editor.setValue(P)});return c.closed||g(),j}window.__vsCodeEditorModal={state:c,reconcileExternalDraft:_,hasUnsavedChanges:v};let q=C=>{C.key==="Escape"&&(C.preventDefault(),m())};a==null||a.addEventListener("click",()=>m()),i==null||i.addEventListener("click",async()=>{!c.path||!await E()||await w(c.path)}),o==null||o.addEventListener("click",()=>$()),n==null||n.addEventListener("change",C=>{k(C.target.value)}),s.addEventListener("click",C=>{C.target===s&&m()}),document.addEventListener("keydown",q);let K=()=>document.removeEventListener("keydown",q);s.addEventListener("transitionend",()=>{document.body.contains(s)||K()});try{let C=await Y.get("/files");if(!C.ok||!((G=(W=C.data)==null?void 0:W.files)!=null&&G.length)){let H=((J=C.error)==null?void 0:J.message)||"No editable files found.";A(H,"error"),m();return}let j=C.data.files;c.files=j,n&&(n.innerHTML=j.map(H=>{let U=H.group?`${String(H.group).toUpperCase()} \xB7 `:"";return`<option value="${y(H.path)}">${y(U+H.path)}</option>`}).join(""));let B=((T=j.find(H=>H.path===e))==null?void 0:T.path)||j[0].path;c.path=B,n&&(n.value=B),p.innerHTML="";let P=null;try{P=await Ni()}catch{A("Monaco is not available yet. Using fallback editor.","warning"),d("Fallback editor active","warning")}if(P!=null&&P.editor){let H=gn();P.editor.setTheme(H);let U=P.editor.create(p,{value:"",language:bo(B),theme:H,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",readOnly:h(),fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});c.editor={getValue:()=>U.getValue(),setValue:ee=>U.setValue(ee),setLanguage:ee=>{let pe=U.getModel();pe&&P.editor.setModelLanguage(pe,ee)},setReadOnly:ee=>U.updateOptions({readOnly:ee}),dispose:()=>U.dispose()},c.editorCleanup=U.onDidChangeModelContent(()=>{g()})}else{p.innerHTML=`<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"${h()?" readonly":""}></textarea>`;let H=p.querySelector("#vs-code-editor-fallback"),U=()=>g();H==null||H.addEventListener("input",U),c.editor={getValue:()=>(H==null?void 0:H.value)||"",setValue:ee=>{H&&(H.value=ee)},setLanguage:()=>{},setReadOnly:ee=>{H&&(H.readOnly=ee)},dispose:()=>{H==null||H.removeEventListener("input",U)}}}await w(B,{silent:!0}),d("Ready")}catch(C){A((C==null?void 0:C.message)||"Could not initialize code editor.","error"),m()}finally{let C=new MutationObserver(()=>{document.body.contains(s)||(K(),C.disconnect())});C.observe(document.body,{childList:!0,subtree:!0})}}var ve=Object.freeze({SET_TEXT:"set_text",SET_ATTRIBUTE:"set_attribute",ADD_CLASS_TOKEN:"add_class_token",REMOVE_CLASS_TOKEN:"remove_class_token",SET_CLASS_LIST:"set_class_list",MOVE_BEFORE:"move_before",MOVE_AFTER:"move_after",INSERT_NODE:"insert_node",DELETE_NODE:"delete_node",REPLACE_HTML:"replace_html",FALLBACK:"fallback"}),ad=0;function Pt(){ad++;let e=Math.random().toString(36).substring(2,6);return`op_${Date.now()}_${ad}_${e}`}function vr(e,t,s,n){return{id:Pt(),type:ve.SET_TEXT,address:e,payload:{oldText:t,newText:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Lo(e,t,s,n,o){return{id:Pt(),type:ve.SET_ATTRIBUTE,address:e,payload:{attrName:t,oldValue:s,newValue:n},filePath:o||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function ld(e,t,s,n,o,i){return{id:Pt(),type:ve.SET_CLASS_LIST,address:e,payload:{oldClassStr:t,newClassStr:s,additions:n,removals:o},filePath:i||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function dd(e,t,s,n,o){return{id:Pt(),type:ve.DELETE_NODE,address:e,payload:{outerHTML:t,parentAddress:n||null,siblingIndex:typeof o=="number"?o:-1},filePath:s||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function cd(e,t,s,n){return{id:Pt(),type:ve.REPLACE_HTML,address:e,payload:{oldHTML:t,newHTML:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function pd(e){if(!e||!e.type)return null;switch(e.type){case ve.SET_TEXT:return{...e,id:Pt(),payload:{oldText:e.payload.newText,newText:e.payload.oldText}};case ve.SET_ATTRIBUTE:return{...e,id:Pt(),payload:{attrName:e.payload.attrName,oldValue:e.payload.newValue,newValue:e.payload.oldValue}};case ve.ADD_CLASS_TOKEN:return{...e,id:Pt(),type:ve.REMOVE_CLASS_TOKEN};case ve.REMOVE_CLASS_TOKEN:return{...e,id:Pt(),type:ve.ADD_CLASS_TOKEN};case ve.SET_CLASS_LIST:return{...e,id:Pt(),payload:{oldClassStr:e.payload.newClassStr,newClassStr:e.payload.oldClassStr,additions:e.payload.removals,removals:e.payload.additions}};case ve.DELETE_NODE:return{...e,id:Pt(),type:ve.INSERT_NODE,payload:{html:e.payload.outerHTML,parentAddress:e.payload.parentAddress||null,siblingIndex:e.payload.siblingIndex??-1}};case ve.REPLACE_HTML:return{...e,id:Pt(),payload:{oldHTML:e.payload.newHTML,newHTML:e.payload.oldHTML}};case ve.MOVE_BEFORE:case ve.MOVE_AFTER:return{...e,id:Pt(),payload:{fromIndex:e.payload.toIndex,toIndex:e.payload.fromIndex}};case ve.FALLBACK:return null;default:return null}}function mr(e){var t,s,n,o,i,a,r,l,p,c,d,u,v;if(!e)return{valid:!1,reason:"Operation is null"};if(!e.type)return{valid:!1,reason:"Missing operation type"};if(!e.id)return{valid:!1,reason:"Missing operation ID"};if(e.type===ve.FALLBACK)return{valid:!0};if(!e.address)return{valid:!1,reason:"Missing source address"};switch(e.type){case ve.SET_TEXT:if(typeof((t=e.payload)==null?void 0:t.newText)!="string")return{valid:!1,reason:"SET_TEXT requires payload.newText"};break;case ve.SET_ATTRIBUTE:if(!((s=e.payload)!=null&&s.attrName))return{valid:!1,reason:"SET_ATTRIBUTE requires payload.attrName"};break;case ve.ADD_CLASS_TOKEN:case ve.REMOVE_CLASS_TOKEN:if(!((n=e.payload)!=null&&n.token))return{valid:!1,reason:`${e.type} requires payload.token`};break;case ve.SET_CLASS_LIST:if(!Array.isArray((o=e.payload)==null?void 0:o.additions)||!Array.isArray((i=e.payload)==null?void 0:i.removals))return{valid:!1,reason:"SET_CLASS_LIST requires payload.additions and payload.removals arrays"};break;case ve.DELETE_NODE:if(!((a=e.payload)!=null&&a.outerHTML))return{valid:!1,reason:"DELETE_NODE requires payload.outerHTML"};break;case ve.INSERT_NODE:if(!((r=e.payload)!=null&&r.html))return{valid:!1,reason:"INSERT_NODE requires payload.html"};if(typeof((l=e.payload)==null?void 0:l.siblingIndex)!="number"||e.payload.siblingIndex<0)return{valid:!1,reason:"INSERT_NODE requires payload.siblingIndex (>= 0) for deterministic reinsertion"};if(!((p=e.payload)!=null&&p.parentAddress))return{valid:!1,reason:"INSERT_NODE requires payload.parentAddress for reinsertion target"};break;case ve.REPLACE_HTML:if(!((c=e.payload)!=null&&c.oldHTML)||!((d=e.payload)!=null&&d.newHTML))return{valid:!1,reason:"REPLACE_HTML requires payload.oldHTML and payload.newHTML"};break;case ve.MOVE_BEFORE:case ve.MOVE_AFTER:if(typeof((u=e.payload)==null?void 0:u.fromIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.fromIndex`};if(typeof((v=e.payload)==null?void 0:v.toIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.toIndex`};break}return{valid:!0}}function fr(e){return{[ve.SET_TEXT]:"Text edit",[ve.SET_ATTRIBUTE]:"Attribute change",[ve.ADD_CLASS_TOKEN]:"Add class",[ve.REMOVE_CLASS_TOKEN]:"Remove class",[ve.SET_CLASS_LIST]:"Style change",[ve.MOVE_BEFORE]:"Move element",[ve.MOVE_AFTER]:"Move element",[ve.INSERT_NODE]:"Insert element",[ve.DELETE_NODE]:"Delete element",[ve.REPLACE_HTML]:"Source edit",[ve.FALLBACK]:"Legacy edit"}[e]||e}var ud=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),vd=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]);function To(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function md(e,t,s){let n=To(e,t);if(!n)return null;if(vd.has(s)||n.trimEnd().endsWith("/>"))return{element:n,startIndex:t,endIndex:t+n.length};let o=t+n.length,i=new RegExp(`<${s}[\\s>]`,"gi"),a=new RegExp(`</${s}\\s*>`,"gi"),r=1,l=o,p=Math.min(e.length,t+5e4);for(;l<p&&r>0;){i.lastIndex=l,a.lastIndex=l;let c=i.exec(e),d=a.exec(e);if(!d)return null;let u=c?c.index:1/0,v=d.index;u<v&&u<p?(r++,l=u+c[0].length):(r--,l=v+d[0].length)}return r!==0?null:{element:e.substring(t,l),startIndex:t,endIndex:l}}function Io(e,t){if(!t)return null;let s=t.lastIndexOf(":");if(s===-1)return null;let n=parseInt(t.substring(s+1),10);if(isNaN(n)||n<0)return null;let o=/<([a-z][a-z0-9]*)[\s>]/gi,i,a=0;for(;(i=o.exec(e))!==null;){let r=i[1].toLowerCase();if(!(ud.has(r)||e.substring(i.index,i.index+500).includes("data-vx-source"))){if(a===n){let p=md(e,i.index,r);return p?{...p,tag:r}:null}a++}}return null}function ur(e,t,s,n){if(n==null){let a=new RegExp(`\\s+${t}=["'][^"']*["']`,"i");return a.test(e)?e.replace(a,""):null}let o=new RegExp(`(${t}=["'])([^"']*)(["'])`,"i");return e.match(o)?e.replace(o,`$1${n}$3`):s==null?e.replace(/>$/,` ${t}="${n}">`):null}function Hi(e,t){if(!e||!e.type)return{content:t,applied:!1,reason:"null or untyped operation"};let s=mr(e);if(!s.valid)return{content:t,applied:!1,reason:`validation failed: ${s.reason}`};if(e.type===ve.FALLBACK)return{content:t,applied:!1,reason:"fallback ops are not persistable via applyOp"};switch(e.type){case ve.SET_TEXT:return Gu(e,t);case ve.SET_ATTRIBUTE:return Ku(e,t);case ve.SET_CLASS_LIST:return Yu(e,t);case ve.REPLACE_HTML:return Ju(e,t);case ve.DELETE_NODE:return Xu(e,t);case ve.INSERT_NODE:return Zu(e,t);default:return{content:t,applied:!1,reason:`unsupported op type: ${e.type}`}}}function Gu(e,t){var i;let{oldText:s,newText:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=Io(t,o);if(a){let r=To(t,a.startIndex);if(r&&!vd.has(a.tag)){let l=a.element.lastIndexOf("</");if(l>r.length){let p=a.element.substring(r.length,l);if(!(s&&Oi(p)!==Oi(s))){let c=a.element.substring(l),d=r+n+c;return{content:t.substring(0,a.startIndex)+d+t.substring(a.endIndex),applied:!0,strategy:"nodeKey"}}}}}}if(s){let a=t.split(s).length-1;return a===0?{content:t,applied:!1,reason:"oldText not found in source"}:a>1?{content:t,applied:!1,reason:"ambiguous: oldText appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data (no nodeKey, no oldText)"}}function Ku(e,t){var a;let{attrName:s,oldValue:n,newValue:o}=e.payload,i=(a=e.address)==null?void 0:a.nodeKey;if(i){let r=Io(t,i);if(r){let l=To(t,r.startIndex);if(l)if(n!=null){let p=l.includes(`${s}="${n}"`),c=l.includes(`${s}='${n}'`);if(!(!p&&!c)){let d=ur(l,s,n,o);if(d!==null)return{content:t.substring(0,r.startIndex)+d+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}else{let p=ur(l,s,n,o);if(p!==null)return{content:t.substring(0,r.startIndex)+p+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}}if(n!=null){let r=`${s}="${n}"`,l=t.split(r).length-1;if(l===0){let p=`${s}='${n}'`,c=t.split(p).length-1;return c===0?{content:t,applied:!1,reason:`attribute ${s}="${n}" not found`}:c>1?{content:t,applied:!1,reason:`ambiguous: ${s}='${n}' appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}='${rd(n)}'`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(p,`${s}='${o}'`),applied:!0,strategy:"contentMatch"}}return l>1?{content:t,applied:!1,reason:`ambiguous: ${s}="${n}" appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}="${rd(n)}"`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(r,`${s}="${o}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_attribute"}}function Yu(e,t){var i;let{oldClassStr:s,newClassStr:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=Io(t,o);if(a){let r=To(t,a.startIndex);if(r&&!(s&&!r.includes(`class="${s}"`)&&!r.includes(`class='${s}'`))){let l=ur(r,"class",s,n);if(l!==null)return{content:t.substring(0,a.startIndex)+l+t.substring(a.startIndex+r.length),applied:!0,strategy:"nodeKey"}}}}if(s){let a=`class="${s}"`,r=t.split(a).length-1;return r===0?{content:t,applied:!1,reason:`class="${s}" not found in source`}:r>1?{content:t,applied:!1,reason:`ambiguous: class="${s}" appears multiple times`}:{content:t.replace(a,`class="${n}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_class_list"}}function Ju(e,t){let{oldHTML:s,newHTML:n}=e.payload,o=t.split(s).length-1;return o===0?{content:t,applied:!1,reason:"oldHTML not found in source"}:o>1?{content:t,applied:!1,reason:"ambiguous: oldHTML appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}function Xu(e,t){var o;let{outerHTML:s}=e.payload,n=(o=e.address)==null?void 0:o.nodeKey;if(n){let i=Io(t,n);if(i&&!(s&&Oi(i.element)!==Oi(s)))return{content:t.substring(0,i.startIndex)+t.substring(i.endIndex),applied:!0,strategy:"nodeKey"}}if(s){let i=t.split(s).length-1;return i===0?{content:t,applied:!1,reason:"element outerHTML not found in source"}:i>1?{content:t,applied:!1,reason:"ambiguous: element outerHTML appears multiple times"}:{content:t.replace(s,""),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for delete_node"}}function Zu(e,t){let{html:s,parentAddress:n,siblingIndex:o}=e.payload;if(!(n!=null&&n.nodeKey))return{content:t,applied:!1,reason:"insert_node requires parentAddress.nodeKey"};let i=Io(t,n.nodeKey);if(!i)return{content:t,applied:!1,reason:"parent element not found by nodeKey"};let a=To(t,i.startIndex);if(!a)return{content:t,applied:!1,reason:"cannot parse parent opening tag"};let r=i.startIndex+a.length,l=i.element.lastIndexOf("</");if(l<=a.length)return{content:t,applied:!1,reason:"cannot determine parent inner content"};let p=i.element.substring(a.length,l),c=i.startIndex+a.length,d=/<([a-z][a-z0-9]*)[\s>]/gi,u,v=0,f=0;for(;(u=d.exec(p))!==null;){let g=u[1].toLowerCase();if(ud.has(g))continue;if(v===o){f=u.index;break}let m=md(p,u.index,g);m&&(d.lastIndex=m.endIndex),v++}v<o&&(f=p.length);let b=c+f;return{content:t.substring(0,b)+s+t.substring(b),applied:!0,strategy:"nodeKey"}}function rd(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Oi(e){return(e||"").replace(/\s+/g," ").trim()}var fd=50,Rt=[],Ss=[],Qu=new Set;function Mo(e,t){if(!e)return!1;let s=pd(e);if(!s)return console.warn("[VX History] Op is not invertible \u2014 skipping history entry:",e.type,e.id),!1;let n=mr(s);return n.valid?(Rt.push({forwardOp:e,inverseOp:s,timestamp:Date.now(),filePath:t||e.filePath||""}),Rt.length>fd&&(Rt=Rt.slice(Rt.length-fd)),Ss=[],ji(),!0):(console.warn("[VX History] Inverse op failed validation \u2014 skipping:",n.reason),!1)}function gd(){return Rt.length===0?null:Rt[Rt.length-1]}function hd(){if(Rt.length===0)return null;let e=Rt.pop();return Ss.push(e),ji(),e}function bd(){return Ss.length===0?null:Ss[Ss.length-1]}function yd(){if(Ss.length===0)return null;let e=Ss.pop();return Rt.push(e),ji(),e}function gr(e){let t=Rt.length>0||Ss.length>0;Rt=[],Ss=[],t&&console.info("[VX History] Cleared:",e),ji()}function ji(){for(let e of Qu)try{e()}catch(t){console.error("[VX History] Listener error:",t)}}var bt=!1,lt=null,yt=null,hn=[],Fi=!1,hr=[],ev=200,xd=!1,Un=0,Ge={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function Sr(){bt=!bt,Ud(),ke({type:"vx-editor:toggle",active:bt}),bt||($t(),Gi(),Dt(),Qt(),lt=null,Is=!1)}function Bo(){return bt}function Td(){return bt&&lt!==null}function Vi(){return!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")}function it(){let e=!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")||!!document.querySelector(".vx-modal-overlay")||!!document.querySelector(".vx-source-editor")||Is;ke({type:"vx-editor:set-panel-lock",locked:e})}function Cr(){Dt(),Qt()}function Wi(){return dt?(dt.abort(),dt=null,Gs(),Ft&&(Y.post("/ai/cancel-generation",{prompt_id:Ft}).catch(()=>{}),Ft=null),!0):!1}var zi=null;function Id(e){var o;Gs();let t=document.createElement("div");t.className="vs-inline-ai-overlay",t.id="vx-ai-gen-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=Date.now(),n=t.querySelector("#vx-ai-gen-timer");zi=setInterval(()=>{let i=Math.floor((Date.now()-s)/1e3);n&&(n.textContent=i<60?`${i}s`:`${Math.floor(i/60)}m ${i%60}s`)},1e3),(o=t.querySelector("#vx-ai-gen-stop"))==null||o.addEventListener("click",()=>{Wi()}),ke({type:"vx-editor:show-ai-overlay"})}function zn(e,t){let s=document.getElementById("vx-ai-gen-step");if(s&&e&&(s.textContent=e),t!==void 0&&t>0){let n=document.getElementById("vx-ai-gen-token-dot"),o=document.getElementById("vx-ai-gen-tokens");n&&(n.style.display=""),o&&(o.textContent=`${t.toLocaleString()} tokens`)}}function Gs(){zi&&(clearInterval(zi),zi=null);let e=document.getElementById("vx-ai-gen-overlay");e&&(e.classList.remove("is-visible"),setTimeout(()=>e.remove(),250)),ke({type:"vx-editor:hide-ai-overlay"})}function Gn(){bt&&(bt=!1,Ud(),ke({type:"vx-editor:toggle",active:!1}),$t(),Gi(),Dt(),Qt(),lt=null,Is=!1)}function Po(){$t(),Gi(),Dt(),Qt(),lt=null,yt=null,Is=!1,ke({type:"vx-editor:deselect-from-parent"})}function Md(){if(xd)return;xd=!0,window.addEventListener("message",tv),document.addEventListener("keydown",t=>{if(bt&&(t.metaKey||t.ctrlKey)&&t.key==="e"){let s=document.activeElement;if(s){let o=s.tagName;if(o==="INPUT"||o==="TEXTAREA"||o==="SELECT"||o==="BUTTON"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor"))return}let n=yt;n&&!qi(n)&&n.sourceFile&&(t.preventDefault(),_o(n.sourceFile),$t())}}),document.addEventListener("keydown",t=>{if(!bt||!(t.metaKey||t.ctrlKey)||t.key!=="z")return;let s=document.activeElement;if(s){let n=s.tagName;if(n==="INPUT"||n==="TEXTAREA"||n==="SELECT"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor, .monaco-editor"))return}t.preventDefault(),t.shiftKey?Yv():Kv()});let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{Is&&Ad(),Un>0?Un--:gr("preview iframe reloaded"),bt&&setTimeout(()=>ke({type:"vx-editor:toggle",active:!0}),200)})}function tv(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":lt=e.data,yt=fn(e.data.sourceAddress),Dt(),Qt(),qd(e.data);break;case"vx-editor:text-changed":Ui(e.data),e.data.changeKind||(clearTimeout(Ui._timer),(async()=>{for(;Fi;)await new Promise(t=>setTimeout(t,50));await Promise.all([Wn(),new Promise(t=>setTimeout(t,400))]),ke({type:"vx-editor:text-save-complete"})})());break;case"vx-editor:source-edit-changed":zd(e.data);break;case"vx-editor:element-deleted":Er(e.data);break;case"vx-editor:deselect":$t(),Gi(),Dt(),Qt(),lt=null,yt=null;break;case"vx-editor:save-request":Wn();break;case"vx-editor:editing-started":sv(e.data);break;case"vx-editor:editing-ended":Ad();break;case"vx-editor:selection-state":nv(e.data);break;case"vx-editor:element-rect":ov(e.data);break;case"vx-editor:richtext-link-request":Dd();break;case"vx-editor:add-section-request":Rv(e.data);break;case"vx-editor:section-moved":Uv(e.data);break;case"vx-editor:bridge-ready":Un>0?Un--:gr("bridge re-initialized"),bt&&ke({type:"vx-editor:toggle",active:!0});break;case"vx-editor:source-edit-ready":pv(e.data);break;case"vx-editor:escape-pressed":if(Wi())break;if(Vi()){Cr();break}Gn();break}}var Is=!1,_r=!1,Ws=null,Vn={},Vs=null,Fn=[],xr=null;function sv(e){Is=!0,_r=!!e.hasPhp,Ws=e.rect||null,Vn={},xr=e.tagName||"P",$t(),iv(),it()}function Ad(){Is=!1,_r=!1,Ws=null,Vn={},Rd(),it()}function nv(e){if(Is){if(e.elementRect&&(Ws=e.elementRect,Bd()),!e.hasSelection){Vn={},Vs=null,Fn=[],wd();return}Vn=e.formatting||{},xr=e.blockTag||xr,Vs=e.link||null,Fn=e.linkClasses||[],wd()}}function ov(e){Is&&e.rect&&(Ws=e.rect,Bd())}function Bd(){let e=document.getElementById("vx-richtext-toolbar");e&&Pd(e)}function iv(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),Pd(e),av(e),e.classList.add("vx-rt-visible")}function Pd(e){if(!Ws)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+Ws.left,o=s.top+Ws.top,i=Ws.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function av(e){var i;let t=Vn,s=_r;e.innerHTML=`<div class="vx-rt-actions">
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
  </div>`,e.querySelectorAll("[data-cmd]").forEach(a=>{a.addEventListener("click",r=>{r.stopPropagation();let l=a.dataset.cmd;if(l==="insertLink"){Dd();return}ke({type:"vx-editor:richtext-command",command:l})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",a=>{a.stopPropagation(),ke({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",a=>{a.stopPropagation(),ke({type:"vx-editor:save-edit"})})}function wd(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=Vn,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function Rd(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function Gi(){Rd()}function Dd(){let e=Vs?Vs.href:"",t=Vs?Vs.target:"",s=Vs&&Vs.className||"",n=Fn.length>0||!!s,o=`<option value=""${s?"":" selected"}>No class</option>`;if(Fn.length>0){let d=Fn.includes(s);o+=Fn.map(u=>`<option value="${zt(u)}"${s===u?" selected":""}>${ct(u)}</option>`).join(""),s&&!d&&(o+=`<option value="${zt(s)}" selected>${ct(s)}</option>`)}else s&&(o+=`<option value="${zt(s)}" selected>${ct(s)}</option>`);let i=document.createElement("div");i.className="vx-modal-overlay",i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>${e?"Edit":"Insert"} Link</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <div class="vx-form-group"><label class="vx-form-label">URL</label>
          <input type="url" id="vx-link-url" class="vx-form-input" value="${zt(e)}" placeholder="https://" autocomplete="off" spellcheck="false">
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
  `,document.body.appendChild(i),i.offsetHeight,i.classList.add("vx-modal-visible"),it(),Fd(i);let a=i.querySelector("#vx-link-url");setTimeout(()=>{a.focus(),a.select()},50);let r=()=>{i.classList.remove("vx-modal-visible"),i.__vxDestroyDrag&&i.__vxDestroyDrag(),setTimeout(()=>{i.remove(),it()},200)};i.addEventListener("click",d=>{d.target===i&&r()}),i.querySelectorAll("[data-close]").forEach(d=>d.addEventListener("click",r));let l=i.querySelector("[data-remove]");l&&l.addEventListener("click",()=>{ke({type:"vx-editor:richtext-command",command:"removeLink"}),r()});let p=i.querySelector("[data-confirm]"),c=()=>{let d=a.value.trim();if(d){let u=i.querySelector("#vx-link-blank").checked,v=i.querySelector("#vx-link-class"),f=v?v.value:"";ke({type:"vx-editor:richtext-command",command:"insertLink",value:{url:d,targetBlank:u,linkClass:f}})}else ke({type:"vx-editor:richtext-command",command:"removeLink"});r()};p.addEventListener("click",c),a.addEventListener("keydown",d=>{d.key==="Enter"&&(d.preventDefault(),c()),d.key==="Escape"&&(d.preventDefault(),r())})}function qd(e){var x,w;let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,canInlineEdit:i,hasImage:a}=e,r=document.getElementById("preview-iframe");if(!r)return;let l=r.getBoundingClientRect(),p=l.left+n.left+n.width/2,c=l.top+n.top-8,d=l.top+n.top+n.height+8;t.style.left=`${p}px`,c<120?(t.style.top=`${d}px`,t.classList.add("vx-tb-below")):(t.style.top=`${c}px`,t.classList.remove("vx-tb-below")),t.style.transform="";let v=yt,f=qi(v),b=Xl(v),h=Jl(v);if(!f){let E=(v==null?void 0:v.sourceFile)||"",k=E.length>0,$=(v==null?void 0:v.sourceKind)==="loop"?"Loop":"Dynamic PHP",_=((x=navigator.platform)==null?void 0:x.includes("Mac"))?"\u2318E":"Ctrl+E",q=k?`<span class="vx-tb-readonly-sep"></span><span class="vx-tb-readonly-file">${ct(E)}</span>`:"",K=k?`<div class="vx-tb-readonly-actions">
          <button class="vx-tb-btn-primary" data-action="open-code-editor" data-file="${ct(E)}" title="Open in Code Editor (${_})">
            Open in Code Editor
            <kbd>${_}</kbd>
          </button>
        </div>`:"";t.innerHTML=`
      <div class="vx-tb-readonly">
        <div class="vx-tb-readonly-header">
          <svg class="vx-tb-readonly-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="vx-tb-readonly-kind">${ct($)}</span>
          ${q}
        </div>
        <p class="vx-tb-readonly-msg">${ct(h)}</p>
        ${K}
      </div>`,t.classList.add("vx-tb-visible"),k&&((w=t.querySelector('[data-action="open-code-editor"]'))==null||w.addEventListener("click",O=>{O.stopPropagation();let W=O.currentTarget.dataset.file;_o(W),$t()}));return}let g="";b&&(v!=null&&v.sourceFile)&&(g+=`<div class="vx-tb-global-cue" title="Changes affect all pages that include this file">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span>Global \u2014 ${ct(v.sourceFile)}</span>
    </div>`),i&&s!=="IMG"&&(g+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"/><path d="M7 22h1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H7"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
      <span>Edit</span></button>`),a&&(g+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),g+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(g+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),v!=null&&v.sourceFile&&(g+=`<button class="vx-tb-btn" data-action="open-source" title="Edit source code" data-file="${ct(v.sourceFile)}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      <span>Source</span></button>`),g+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,g+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let m=Ki(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${m}</div><div class="vx-tb-actions">${g}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(E=>{E.addEventListener("click",k=>{k.stopPropagation(),rv(E.dataset.action,e)})})}function $t(){let e=document.getElementById("vx-context-toolbar");e&&(e.classList.remove("vx-tb-visible"),e.classList.remove("vx-tb-below"))}function Ki(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function rv(e,t){switch(e){case"edit-text":ke({type:"vx-editor:start-edit",mode:"text"}),$t();break;case"swap-image":qv(t);break;case"edit-style":vv(t);break;case"edit-link":Ov(t);break;case"open-source":{$t(),ke({type:"vx-editor:start-source-edit"});break}case"delete":uv(t);break;case"ask-ai":Pv(t);break}}var yn=null;function lv(e){let t=e.replace(/>\s+</g,"><").trim();t=t.replace(/(<\/[^>]+>)(<)/g,`$1
$2`),t=t.replace(/(\/?>)(<[^/])/g,`$1
$2`);let s=t.split(`
`),n=0,o=[];for(let i of s){let a=i.trim();a&&(/^<\//.test(a)&&n>0&&n--,o.push("  ".repeat(n)+a),/^<[^/!][^>]*[^/]>$/.test(a)&&!/^<(br|hr|img|input|meta|link)/i.test(a)&&n++)}return o.join(`
`)}function dv(e,t,s){let n=t.lastIndexOf(":");if(n===-1)return null;let o=parseInt(t.substring(n+1),10);if(isNaN(o)||o<0)return null;let i=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),a=/<([a-z][a-z0-9]*)[\s>]/gi,r,l=0;for(;(r=a.exec(e))!==null;){let p=r[1].toLowerCase();if(!(i.has(p)||e.substring(r.index,r.index+500).includes("data-vx-source"))){if(l===o){let d=Od(e,r.index,p);return d&&p===s.toLowerCase()?d:null}l++}}return null}function cv(e,t){if(t<0)return null;let s=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),n=/<([a-z][a-z0-9]*)[\s>]/gi,o,i=0;for(;(o=n.exec(e))!==null;){let a=o[1].toLowerCase();if(!(s.has(a)||e.substring(o.index,o.index+500).includes("data-vx-source"))){if(i===t)return Od(e,o.index,a);i++}}return null}function Nd(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function Od(e,t,s){let n=Nd(e,t);if(!n)return null;if(new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]).has(s)||n.trimEnd().endsWith("/>"))return n;let i=t+n.length,a=new RegExp(`<${s}[\\s>]`,"gi"),r=new RegExp(`</${s}\\s*>`,"gi"),l=1,p=i,c=Math.min(e.length,t+5e4);for(;p<c&&l>0;){a.lastIndex=p,r.lastIndex=p;let d=a.exec(e),u=r.exec(e);if(!u)return null;let v=d?d.index:1/0,f=u.index;v<f&&v<c?(l++,p=v+d[0].length):(l--,p=f+u[0].length)}return l!==0?null:e.substring(t,p)}async function pv(e){var B,P;Ao(!1);let{html:t,tagName:s,rect:n,filePath:o,sourceAddress:i}=e,a=document.getElementById("preview-iframe");if(!a||!t)return;let r=a.getBoundingClientRect(),l=450,p=180,c=r.width-40,d=Math.max(l,Math.min(n.width+40,c)),u=Math.max(p,Math.min(n.height+60,400)),v=r.left+n.left+n.width/2-d/2,f=r.top+n.top;v=Math.max(r.left+10,Math.min(v,r.right-d-10)),f=Math.max(r.top+10,Math.min(f,r.bottom-u-10));let b=document.createElement("div");b.className="vx-source-editor",b.style.left=`${v}px`,b.style.top=`${f}px`,b.style.width=`${d}px`,b.style.height=`${u}px`;let g=((B=navigator.platform)==null?void 0:B.includes("Mac"))?"\u2318S":"Ctrl+S";b.innerHTML=`
    <div class="vx-source-header">
      <div class="vx-source-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>Source</span>
      </div>
      <div class="vx-source-actions">
        <button class="vx-source-btn vx-source-btn-cancel" data-action="cancel">Cancel <kbd>Esc</kbd></button>
        <button class="vx-source-btn vx-source-btn-apply" data-action="apply">Apply <kbd>${g}</kbd></button>
      </div>
    </div>
    <div class="vx-source-warn" hidden></div>
    <div class="vx-source-body"></div>
  `,document.body.appendChild(b),it();let m=b.querySelector(".vx-source-header"),x=null;m.addEventListener("mousedown",H=>{H.target.closest("button")||(x={x:H.clientX-b.offsetLeft,y:H.clientY-b.offsetTop},H.preventDefault())});let w=H=>{x&&(b.style.left=`${H.clientX-x.x}px`,b.style.top=`${H.clientY-x.y}px`)},E=()=>{x=null};document.addEventListener("mousemove",w),document.addEventListener("mouseup",E);let k=b.querySelector(".vx-source-body"),$=(i==null?void 0:i.sourceFile)||o||us(),S=(i==null?void 0:i.nodeKey)||"",_=null;if(S)try{let H=await ot($);H.ok&&((P=H.data)!=null&&P.content)&&(_=dv(H.data.content,S,s))}catch{}let q=!_,K=_||t,O=lv(K),W=b.querySelector('[data-action="apply"]'),G=b.querySelector(".vx-source-warn"),J=!0,T=null;q&&(G.textContent="\u2139 Live HTML \u2014 save may not work for this element",G.hidden=!1,G.style.color="var(--vs-text-ghost)",G.style.background="transparent");function C(H){let U=Hd(H,s);if(U){if(G.style.color="",G.style.background="",G.textContent=`\u26A0 ${U.message}`,G.hidden=!1,W.disabled=!0,W.classList.add("vx-source-btn-disabled"),J=!1,T&&U.line)try{let ee=T.getModel();if(ee){let pe=window.monaco||globalThis.monaco;pe!=null&&pe.editor&&pe.editor.setModelMarkers(ee,"preflight",[{startLineNumber:U.line,startColumn:1,endLineNumber:U.line,endColumn:ee.getLineMaxColumn(U.line),message:U.message,severity:pe.MarkerSeverity.Error}])}}catch{}}else if(q?(G.textContent="\u2139 Live HTML \u2014 save may not work for this element",G.hidden=!1,G.style.color="var(--vs-text-ghost)",G.style.background="transparent"):(G.hidden=!0,G.style.color="",G.style.background=""),W.disabled=!1,W.classList.remove("vx-source-btn-disabled"),J=!0,T)try{let ee=T.getModel(),pe=window.monaco||globalThis.monaco;ee&&(pe!=null&&pe.editor)&&pe.editor.setModelMarkers(ee,"preflight",[])}catch{}return J}let j=null;try{let H=await Ni();if(!(H!=null&&H.editor))throw new Error("Monaco unavailable");let U=gn();H.editor.setTheme(U),j=H.editor.create(k,{value:O,language:"html",theme:U,automaticLayout:!0,minimap:{enabled:!1},fontSize:12,lineHeight:18,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",lineNumbers:"off",glyphMargin:!1,folding:!1,renderLineHighlight:"none",overviewRulerLanes:0,hideCursorInOverviewRuler:!0,overviewRulerBorder:!1,scrollbar:{verticalScrollbarSize:6,horizontalScrollbarSize:6},padding:{top:8,bottom:8},fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"}),T=j,j.addCommand(H.KeyMod.CtrlCmd|H.KeyCode.KeyS,()=>{J&&br()}),j.addCommand(H.KeyCode.Escape,()=>{Ao(!1)});let ee=null;j.onDidChangeModelContent(()=>{clearTimeout(ee),ee=setTimeout(()=>{C(j.getValue())},400)}),setTimeout(()=>{j.focus(),ke({type:"vx-editor:source-editor-mounted"})},100)}catch{k.innerHTML=`<textarea class="vx-source-fallback" spellcheck="false">${ct(O)}</textarea>`;let H=k.querySelector("textarea");H.addEventListener("keydown",ee=>{ee.key==="Escape"&&(ee.preventDefault(),Ao(!1)),(ee.metaKey||ee.ctrlKey)&&ee.key==="s"&&(ee.preventDefault(),J&&br())});let U=null;H.addEventListener("input",()=>{clearTimeout(U),U=setTimeout(()=>C(H.value),400)}),setTimeout(()=>{H.focus(),ke({type:"vx-editor:source-editor-mounted"})},100)}W.addEventListener("click",()=>{J&&br()}),b.querySelector('[data-action="cancel"]').addEventListener("click",()=>Ao(!1)),yn={container:b,monacoInstance:j,originalHTML:K,formattedHTML:O,tagName:s,sourceFile:$,cleanupDrag:()=>{document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",E)}},requestAnimationFrame(()=>b.classList.add("vx-source-visible"))}async function br(){var d,u;if(!yn||(d=window.demoGuard)!=null&&d.call(window))return;let{monacoInstance:e,container:t,tagName:s,originalHTML:n,formattedHTML:o,sourceFile:i,cleanupDrag:a}=yn,r;if(e)r=e.getValue().trim();else{let v=t.querySelector("textarea");r=((u=v==null?void 0:v.value)==null?void 0:u.trim())||""}let l=Hd(r,s);if(l){let v=t.querySelector(".vx-source-warn");v&&(v.textContent=`\u26A0 ${l.message}`,v.hidden=!1);return}if(r===o){Ao(!1);return}if(e)try{e.dispose()}catch{}a(),t.classList.remove("vx-source-visible"),setTimeout(()=>t.remove(),200),yn=null;let p=cd(yt,n,r,i);ge(p,"created"),ke({type:"vx-editor:source-edit-saving"});let[c]=await Promise.all([zd({filePath:i,originalHTML:n,newHTML:r}),new Promise(v=>setTimeout(v,500))]);if(ge(p,c?"persisted":"failed"),c)if(/\<\?(?:php\b|=)/.test(r)){ke({type:"vx-editor:end-source-edit",apply:!1});let f=document.getElementById("preview-iframe");f&&f.contentWindow.location.reload()}else ke({type:"vx-editor:end-source-edit",apply:!0,html:r});else ke({type:"vx-editor:end-source-edit",apply:!1})}function Hd(e,t){if(!e||!e.trim())return{message:"HTML is empty"};let s=e.trim();if(/<script\b/i.test(s))return{message:"<script> elements are not allowed"};if(/<iframe\b/i.test(s))return{message:"<iframe> elements are not allowed"};if(/\bon[a-z]+\s*=/i.test(s))return{message:"Inline event handlers (on*=) are not allowed"};let n=document.createElement("template");n.innerHTML=s;let o=n.content,i=Array.from(o.childNodes).filter(u=>u.nodeType===Node.ELEMENT_NODE);if(i.length===0)return{message:"No HTML element found"};if(i.length>1)return{message:`Expected 1 root element, found ${i.length}`};for(let u of o.childNodes)if(u.nodeType===Node.TEXT_NODE&&u.textContent.trim())return{message:"Text found outside root element \u2014 check for broken tags"};let a=i[0],r=(t||"").toUpperCase();if(r&&a.tagName!==r)return{message:`Root changed: <${r.toLowerCase()}> \u2192 <${a.tagName.toLowerCase()}>`,line:1};if(/\<\?(?:php\s+)?(?:foreach|for|while|if|else|elseif|switch)\b/.test(s)||/\<\?(?:php\s+)?(?:endforeach|endfor|endwhile|endif|endswitch)\b/.test(s))return null;let p=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]),c=s.split(`
`),d=[];for(let u=0;u<c.length;u++){let v=c[u],f=/<([a-z][a-z0-9]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*(\/?)\s*>/gi,b;for(;(b=f.exec(v))!==null;){let g=b[1].toLowerCase(),m=b[2]==="/";p.has(g)||m||d.push({tag:g,line:u+1})}let h=/<\/([a-z][a-z0-9]*)\s*>/gi;for(;(b=h.exec(v))!==null;){let g=b[1].toLowerCase();if(p.has(g))continue;if(d.length===0)return{message:`Extra </${g}> \u2014 no matching opening tag`,line:u+1,tag:g};let m=d[d.length-1];if(m.tag!==g)return{message:`Misnested: </${g}> but <${m.tag}> is still open (line ${m.line})`,line:u+1,tag:g};d.pop()}}if(d.length>0){let u=d[d.length-1];return{message:`Unclosed <${u.tag}> (line ${u.line})`,line:u.line,tag:u.tag}}return null}function Ao(e,t){if(!yn)return;let{container:s,monacoInstance:n,cleanupDrag:o}=yn;if(ke({type:"vx-editor:end-source-edit",apply:!!e,html:e?t:void 0}),n)try{n.dispose()}catch{}o(),s.classList.remove("vx-source-visible"),setTimeout(()=>{s.remove(),it()},200),yn=null}function uv(e){$t();let t=Ki(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${ct(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible")),it();let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>{n.remove(),it()},200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),Ie(n,o),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{var a;(a=window.demoGuard)!=null&&a.call(window)||(ke({type:"vx-editor:delete-element"}),o())})}var et=new Set,Ts="",bn=null,Yi="text",Cs="padding",Ls="all",xn="all",_s="tl",wn="",Ks=!1;function Dt({revertUnsaved:e=!0}={}){e&&Ks&&Ts&&(ke({type:"vx-editor:update-classes",classes:Ts.split(" ").filter(Boolean),silent:!0}),et=new Set(Ts.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>{t.remove(),it()},200)),Ks=!1,bn=null,Yi="text",Cs="padding",Ls="all",xn="all",_s="tl",wn=""}function vv(e){$t(),Dt();let t=(e.classList||[]).filter(o=>o.trim());et=new Set(t),Ts=t.join(" "),Ks=!1,bn=null,Yi=Gv(t),Cs="padding",Ls="all",xn="all",_s="tl",wn="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${Ki(e.tagName,t)}</span>
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
      ${wr()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),$r(s),s.__vxOnResize=()=>$r(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=Lr(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),bn=null,Mt(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>Dt()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),Dt())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{et=new Set(Ts.split(" ").filter(Boolean)),Ks=!1,ke({type:"vx-editor:update-classes",classes:[...et],silent:!0}),Mt(kr())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>Bv(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(wn=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=wr(),Mt(kr()))}),Mt("typography"),it()}function wr(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=wn===t.id,n=t.id?[...et].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function kr(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function Mt(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:mv,spacing:fv,colors:gv,layout:hv,borders:bv,effects:yv,classes:xv};t.innerHTML=(s[e]||s.classes)(),Av(t);let n=t.querySelector(".vx-cm-active");n&&n.scrollIntoView({block:"nearest"})}function mv(){let e=Ue(/^font-(sans|serif|mono)$/)||"",t=Ue(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=Ue(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=Ue(/^text-(left|center|right|justify)$/)||"text-left",o=Ue(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=Ue(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=Ue(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",r=Ue(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Qe("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${Qe("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,Ge.sizes.map(l=>({label:l,value:`text-${l}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Qe("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,Ge.weights.map(l=>({label:l,value:`font-${l}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${wv(Ge.aligns.map(l=>({value:`text-${l}`,label:l,icon:Lv(l)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${Qe("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,Ge.leadings.map(l=>({label:l,value:`leading-${l}`})))}
        ${Qe("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,Ge.trackings.map(l=>({label:l,value:`tracking-${l}`})))}
        ${Qe("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,Ge.transforms.map(l=>({label:l,value:l})))}
        ${Qe("Decoration","^(no-underline|underline|line-through)$",r,Ge.decorations.map(l=>({label:l,value:l})))}
      </div>
    </div>
  `}function fv(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[Cs]||(Cs="padding"),e[Cs].prefixes[Ls]||(Ls="all");let t=e[Cs],s=t.prefixes[Ls],n=$v(s),o=Cv(s)||"",i=Cs==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${jd(Object.keys(e).map(a=>({value:a,label:e[a].label})),Cs,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${Ls===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${kd(a)}">
            ${_v(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${kd(Ls)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${Ge.compactSpacings.map(a=>{let r=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${kn(r)?" vx-sp-pill-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${kn(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function gv(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=Yi||"text",s=t,n=Sv(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${Ge.specialColors.map(a=>{let r=`${s}-${a.name}`,l=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,p=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${kn(r)?" vx-sp-dot-active":""}" data-set="${r}" data-pattern="${n}" style="${l}${p}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=["50","100","200","300","400","500","600","700","800","900","950"];return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-matrix">
      ${Ge.colors.map(a=>`
        <div class="vx-cm-row" title="${a.name}">
          ${i.map(r=>{let l=`${s}-${a.name}-${r}`;return`<button class="vx-cm-cell${kn(l)?" vx-cm-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false" style="background:${a.shades[r]}" title="${a.name}-${r}"></button>`}).join("")}
        </div>
      `).join("")}
    </div>
  </div>`,o}function hv(){let e=Ev(),t=Ue(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=Ue(/^gap(?:-[xy])?-/)||"",a=Ue(/^grid-cols-\d+$/)||"",r=Ue(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${kv(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${Qe("Direction","^flex-(row|col|row-reverse|col-reverse)$",Ue(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${Qe("Justify","^justify-(start|center|end|between|around|evenly)$",Ue(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${Qe("Align","^items-(start|center|end|stretch|baseline)$",Ue(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${Qe("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...Ge.gaps.map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${Qe("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...Ge.gridCols.map(l=>({label:l,value:`grid-cols-${l}`}))])}
          ${Qe("Rows","^grid-rows-\\d+$",r,[{label:"Auto",value:""},...Ge.gridRows.map(l=>({label:l,value:`grid-rows-${l}`}))])}
          ${Qe("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...Ge.gaps.slice(1).map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${Qe("Position","^(static|relative|absolute|fixed|sticky)$",t,Ge.positions.map(l=>({label:l,value:l})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${Qe("Top","^top-",Ue(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Ge.coordinates.map(l=>({label:l,value:`top-${l}`})))}
          ${Qe("Right","^right-",Ue(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Ge.coordinates.map(l=>({label:l,value:`right-${l}`})))}
          ${Qe("Bottom","^bottom-",Ue(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Ge.coordinates.map(l=>({label:l,value:`bottom-${l}`})))}
          ${Qe("Left","^left-",Ue(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Ge.coordinates.map(l=>({label:l,value:`left-${l}`})))}
        </div>
      </div>
    `:""}
  `}function bv(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=xn==="all"?"all":_s;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${Ge.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${kn(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${Qe("Style","^border-(solid|dashed|dotted|double|none)$",Ue(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...Ge.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${jd([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],xn==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${_s==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${_s==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${_s==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${_s==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${xn==="all"?"ALL":_s.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${Ge.radii.map(s=>{let n=Tv(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${kn(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${Iv(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function yv(){let e=Mv();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${kn(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function xv(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...et].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function Qe(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${zt(o.value)}"${s===o.value?" selected":""}>${ct(o.label)}</option>`).join("")}
    </select>
  </div>`}function jd(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${ct(i.label)}</button>`).join("")}
  </div>`}function wv(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${zt(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function kv(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function Ev(){let e=Ue(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function $v(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function Sv(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function Cv(e){let t=Ue(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function kd(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function _v(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function Lv(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function Tv(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function Iv(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function Mv(){let e=Ue(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function kn(e){let t=wn;return et.has(t?t+":"+e:e)}function yr(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=wn,i=o?o+":":"",a=t?new RegExp(t):null,r=e?i+e:"",l=!!r&&et.has(r);if(a)for(let c of[...et])if(o){if(c.startsWith(i)){let d=c.slice(i.length);a.test(d)&&et.delete(c)}}else!/^(sm|md|lg|xl|2xl):/.test(c)&&a.test(c)&&et.delete(c);r&&(!s||!l)&&et.add(r),Ks=!0,ke({type:"vx-editor:update-classes",classes:[...et],silent:!0});let p=document.getElementById("vx-sp-breakpoints");if(p&&(p.innerHTML=wr()),n){let c=document.querySelector(".vx-color-matrix"),d=c?c.scrollTop:0;if(Mt(kr()),d){let u=document.querySelector(".vx-color-matrix");u&&(u.scrollTop=d)}}}function Ue(e){let t=wn;for(let s of et)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function Av(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";yr(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";yr(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{bn=bn===n.dataset.family?null:n.dataset.family,Mt("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{bn=null,Mt("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{Yi=n.dataset.cprop||"text",bn=null,Mt("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Cs=n.dataset.spaceMode||"padding",Ls="all",Mt("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{Ls=n.dataset.spaceSide||"all",Mt("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{xn=n.dataset.radiusMode==="corners"?"corners":"all",Mt("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{_s=n.dataset.radiusCorner||"tl",xn="corners",Mt("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");yr(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>Mt("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{et.add(i)}),Ks=!0,ke({type:"vx-editor:update-classes",classes:[...et],silent:!0}),s.value="",Mt("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;et.delete(i),Ks=!0,ke({type:"vx-editor:update-classes",classes:[...et],silent:!0}),o.remove()}}})}async function Bv(e){let t=[...et].join(" ");if(t===Ts){Dt({revertUnsaved:!1});return}let s=new Set(Ts.split(" ").filter(Boolean)),n=new Set(t.split(" ").filter(Boolean)),o=[...n].filter(l=>!s.has(l)),i=[...s].filter(l=>!n.has(l)),a=fn(e.sourceAddress||yt),r=ld(a,Ts,t,o,i,e.filePath);ge(r,"created"),hn.push({type:"class-change",filePath:e.filePath,originalHTML:`class="${Ts}"`,newHTML:`class="${t}"`,additions:o,removals:i,timestamp:Date.now(),_op:r}),Ks=!1,Dt({revertUnsaved:!1}),ae("Saving & compiling\u2026"),await Wn(),ke({type:"vx-editor:update-classes",classes:[...et],silent:!0}),setTimeout(()=>{let l=document.getElementById("preview-iframe");l&&l.contentWindow&&l.contentWindow.postMessage("voxelsite:reload","*")},500)}function Lr(e,t){let s=!1,n,o,i,a,r=!1,l=d=>{if(d.target.closest("button, input, select"))return;s=!0;let u=d.touches?d.touches[0]:d;n=u.clientX,o=u.clientY;let v=e.getBoundingClientRect();i=v.left,a=v.top,t.style.cursor="grabbing",d.preventDefault(),r||(r=!0,document.addEventListener("mousemove",p),document.addEventListener("touchmove",p,{passive:!1}),document.addEventListener("mouseup",c),document.addEventListener("touchend",c))},p=d=>{if(!s)return;let u=d.touches?d.touches[0]:d,v=12,f=e.getBoundingClientRect(),b=f.width||300,h=f.height||500,g=i+u.clientX-n,m=a+u.clientY-o,x=v,w=Math.max(v,window.innerWidth-b-v),E=52,k=Math.max(E,window.innerHeight-h-v),$=Math.min(Math.max(g,x),w),S=Math.min(Math.max(m,E),k);e.style.left=`${$}px`,e.style.top=`${S}px`,e.style.right="auto"},c=()=>{s&&(s=!1,t.style.cursor="",r&&(r=!1,document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c)))};return t.addEventListener("mousedown",l),t.addEventListener("touchstart",l,{passive:!1}),()=>{t.removeEventListener("mousedown",l),t.removeEventListener("touchstart",l),r&&(document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c))}}function Fd(e){let t=e.querySelector(".vx-modal"),s=e.querySelector(".vx-modal-header");if(!t||!s)return;s.style.cursor="grab";let n=!1,o=()=>{if(n)return;n=!0;let r=t.getBoundingClientRect();e.style.display="block",t.style.position="fixed",t.style.left=`${r.left}px`,t.style.top=`${r.top}px`,t.style.margin="0"},i=r=>{r.target.closest("button, input, select")||o()};s.addEventListener("mousedown",i,{capture:!0}),s.addEventListener("touchstart",i,{capture:!0,passive:!0});let a=Lr(t,s);e.__vxDestroyDrag=()=>{s.removeEventListener("mousedown",i,{capture:!0}),s.removeEventListener("touchstart",i,{capture:!0}),a()}}var dt=null,Ft=null;function Qt(){let e=document.getElementById("vx-ai-panel");e&&(dt&&(dt.abort(),dt=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>{e.remove(),it()},180))}function Pv(e){var v;if((v=window.builtInAiGuard)!=null&&v.call(window))return;$t(),Dt(),Qt();let t=Ki(e.tagName,e.classList),s=document.createElement("div");s.id="vx-ai-panel",s.className="vx-ai-panel",s.tabIndex=-1,s.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${ct(t)}</span>
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
    </div>`,document.body.appendChild(s),Ld(s,null,e.rect),s.__vxOnResize=()=>Ld(s,null,e.rect),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-ai-visible")),s.__vxDestroyDrag=Lr(s,s.querySelector("#vx-ai-drag-handle"));let n=s.querySelector("#vx-ai-input"),o=s.querySelector("#vx-ai-send"),i=s.querySelector("#vx-ai-cancel-btn"),a=s.querySelector("#vx-ai-status"),r=s.querySelector("#vx-ai-status-text"),l=s.querySelector("#vx-ai-close");setTimeout(()=>n==null?void 0:n.focus(),200),it(),l.addEventListener("click",()=>Qt()),s.addEventListener("keydown",f=>{f.key==="Escape"&&(f.preventDefault(),f.stopPropagation(),Qt())});let p=()=>{n.style.height="auto";let f=parseFloat(getComputedStyle(n).lineHeight||"20")*6+28;n.style.height=Math.min(n.scrollHeight,f)+"px"};n.addEventListener("input",p),n.addEventListener("keydown",f=>{f.key==="Enter"&&(f.metaKey||f.ctrlKey)&&(f.preventDefault(),u())}),o.addEventListener("click",u),i.addEventListener("click",()=>{dt&&(dt.abort(),dt=null),d()});function c(){n.disabled=!0,o.hidden=!0,i.hidden=!1,a.hidden=!1,r.textContent="Reading your site\u2026"}function d(){n.disabled=!1,o.hidden=!1,i.hidden=!0,a.hidden=!0,n.focus()}async function u(){let f=n.value.trim();if(!f)return;Qt(),Id("AI is editing\u2026"),dt=new AbortController,Ft=null;let b=e.outerHTML||"",h=e.filePath||us(),g=0;try{await ds("/ai/prompt",{user_prompt:f,action_type:"section_edit",page_scope:h,action_data:{path:h,sectionHtml:b.substring(0,15e3)}},{signal:dt.signal,onPromptId(m){Ft=m},onStatus(m){let x=typeof m=="string"?m:m.message||"Working\u2026";zn(x,g)},onFile(){zn("Applying changes\u2026",g)},onToken(){g++,zn("Generating\u2026",g)},onError(m){Ft=null,Gs(),ae(m.message||"AI edit failed",!0)},onDone(m){if(dt=null,Ft=null,Gs(),m.cancelled){ae("Generation cancelled",!1);return}(m.files_modified||[]).length>0?(ae("Section updated \u2713"),setTimeout(()=>{let w=document.getElementById("preview-iframe");w!=null&&w.contentWindow&&w.contentWindow.postMessage("voxelsite:reload","*")},400)):m.partial||ae("No changes made",!1)},onWarning(m){typeof window.showToast=="function"&&window.showToast(m,"warning")}})}catch(m){m.name!=="AbortError"&&ae("AI edit failed",!0),Gs()}}}var Ed=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function Rv(e){var g;if((g=window.builtInAiGuard)!=null&&g.call(window))return;$t(),Dt(),Qt();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let m of Ed)(t.includes(m.id)||t.includes(m.label.toLowerCase()))&&s.add(m.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${ct(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${Ed.map(m=>{let x=s.has(m.id);return`
            <button class="vx-section-card${x?" vx-section-card-exists":""}" data-section-type="${m.id}" data-section-label="${zt(m.label)}" data-section-desc="${zt(m.description)}">
              <div class="vx-section-card-icon">${m.icon}</div>
              <div class="vx-section-card-label">${m.label}</div>
              <div class="vx-section-card-desc">${m.description}</div>
              ${x?'<div class="vx-section-card-badge">On page</div>':""}
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible")),it();let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>{n.remove(),it()},200)},a=m=>{m.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),Ie(n,i),n.tabIndex=-1,n.focus();let r=null,l=null,p=n.querySelector("#vx-section-footer"),c=n.querySelector("#vx-section-footer-type"),d=n.querySelector("#vx-section-instruction"),u=n.querySelector("#vx-section-generate"),v=n.querySelector("#vx-section-change"),f=n.querySelector(".vx-section-picker-grid"),b={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(m=>{m.addEventListener("click",()=>{r=m.dataset.sectionLabel,l=m.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(x=>x.classList.remove("vx-section-card-selected")),m.classList.add("vx-section-card-selected"),c.textContent=r,d.placeholder=b[r]||"Optional: describe what you want\u2026",d.value="",p.hidden=!1,f.classList.add("vx-section-grid-collapsed"),setTimeout(()=>d.focus(),100)})}),v.addEventListener("click",()=>{r=null,l=null,p.hidden=!0,f.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(m=>m.classList.remove("vx-section-card-selected"))});let h=()=>{if(!r)return;let m=d.value.trim();i(),Dv(e,r,l,m)};u.addEventListener("click",h),d.addEventListener("keydown",m=>{m.key==="Enter"&&(m.preventDefault(),h())})}async function Dv(e,t,s,n=""){var c;if((c=window.builtInAiGuard)!=null&&c.call(window))return;Id(`Adding ${t}\u2026`);let o=e.filePath||us();dt=new AbortController,Ft=null;let i=dt,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let r=0,l=0,p=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await ds("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onPromptId(d){Ft=d},onStatus(d){let u=typeof d=="string"?d:d.message||`Adding ${t}\u2026`;zn(u,r)},onFile(){zn("Writing files\u2026",r)},onToken(){r++;let d=Date.now();d-l>500&&(l=d,zn(`Generating ${t}\u2026`,r))},onError(d){dt=null,Ft=null,Gs(),ae(d.message||"Failed to add section",!0)},onDone(d){if(dt=null,Ft=null,Gs(),d.cancelled){ae("Generation cancelled",!1);return}(d.files_modified||[]).length>0?(ae(`${t} added \u2713`),setTimeout(()=>{let v=document.getElementById("preview-iframe");v!=null&&v.contentWindow&&v.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{ke({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{ke({type:"vx-editor:scroll-to-section",sectionIndex:p}),ke({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):d.partial||ae("No changes made",!1)},onWarning(d){typeof window.showToast=="function"&&window.showToast(d,"warning")}})}catch(d){dt=null,Ft=null,d.name!=="AbortError"&&ae("Failed to add section",!0),Gs()}}function qv(e){$t();let t=!1,s=document.createElement("div");s.className="vx-modal-overlay",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("vx-modal-visible")),it();let n=()=>{s.classList.remove("vx-modal-visible"),s.removeEventListener("keydown",o),setTimeout(()=>{s.remove(),it(),!t&&lt&&qd(lt)},200)},o=i=>{i.key==="Escape"&&(i.stopPropagation(),i.preventDefault(),n())};s.addEventListener("keydown",o),s.querySelector("[data-close]").addEventListener("click",n),Ie(s,n),s.tabIndex=-1,s.focus(),Nv(s)}async function Nv(e){let t=e.querySelector("#vx-img-grid");try{let s=await Y.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",async()=>{var p,c;let i=o.dataset.path,a=(lt==null?void 0:lt.src)||"",r=(yt==null?void 0:yt.sourceFile)||(lt==null?void 0:lt.filePath)||us();await jv({filePath:r,oldSrc:a,newSrc:i,alt:((c=(p=lt==null?void 0:lt.outerHTML)==null?void 0:p.match(/alt="([^"]*)"/))==null?void 0:c[1])||"",sourceAddress:yt})&&ke({type:"vx-editor:swap-image",src:i}),Po(),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function Ov(e){$t();let t=e.href||"",s=e.text||"",n=e.target||"",o=e.linkClass||"",i=e.linkClasses||[],a=(yt==null?void 0:yt.sourceFile)||e.filePath||us(),r=`<option value=""${o?"":" selected"}>No class</option>`,l=i.includes(o);i.forEach(u=>{r+=`<option value="${zt(u)}"${o===u?" selected":""}>${ct(u)}</option>`}),o&&!l&&(r+=`<option value="${zt(o)}" selected>${ct(o)}</option>`);let p=document.createElement("div");p.className="vx-modal-overlay",p.setAttribute("role","dialog"),p.setAttribute("aria-modal","true"),p.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${zt(t)}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${zt(s)}" placeholder="Link text"></div>
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
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(p),requestAnimationFrame(()=>p.classList.add("vx-modal-visible")),it(),Fd(p);let c=()=>{p.classList.remove("vx-modal-visible"),p.removeEventListener("keydown",d),p.__vxDestroyDrag&&p.__vxDestroyDrag(),setTimeout(()=>{p.remove(),it()},200)},d=u=>{u.key==="Escape"&&c()};p.addEventListener("keydown",d),p.querySelectorAll("[data-close]").forEach(u=>u.addEventListener("click",c)),Ie(p,c),document.getElementById("vx-link-save").addEventListener("click",async()=>{var w;if((w=window.demoGuard)!=null&&w.call(window)){c();return}let u=document.getElementById("vx-link-href").value.trim(),v=document.getElementById("vx-link-text").value.trim(),f=document.getElementById("vx-link-target").checked?"_blank":"",b=document.getElementById("vx-link-style"),h=b?b.value:"",g=yt,m=[];u!==t&&m.push(Lo(g,"href",t,u,a)),f!==n&&m.push(Lo(g,"target",n||null,f||null,a)),h!==o&&m.push(Lo(g,"class",o||null,h||null,a)),v!==s&&m.push(vr(g,s,v,a)),m.forEach(E=>ge(E,"created")),await Hv(a,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:u,newText:v,newTarget:f,newClass:h},m)&&(ke({type:"vx-editor:update-link",href:u,text:v,target:f,className:h}),setTimeout(()=>ke({type:"vx-editor:refresh-highlight"}),100)),c()}),setTimeout(()=>{var u;return(u=document.getElementById("vx-link-href"))==null?void 0:u.focus()},100)}function $d(e,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:i,newText:a,newTarget:r,newClass:l}){let p=x=>x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),c=p(t),d=new RegExp(`(<a\\s[^>]*?href=["']${c}["'][^>]*>)([\\s\\S]*?)(</a>)`,"gi"),u=[...e.matchAll(d)];if(u.length===0)return null;if(u.length>1)return"ambiguous";let v=u[0],f=v[1],b=v[2],h=v[3];i!==t&&(f=f.replace(new RegExp(`href=["']${p(t)}["']`),`href="${i}"`)),r!==n&&(r&&f.includes("target=")?f=f.replace(/target=["'][^"']*["']/,`target="${r}"`):r&&!f.includes("target=")?f=f.replace(/>$/,` target="${r}" rel="noopener">`):!r&&f.includes("target=")&&(f=f.replace(/\s*target=["'][^"']*["']/,""),f=f.replace(/\s*rel=["'][^"']*["']/,""))),l!==o&&(l&&f.includes("class=")?f=f.replace(/class=["'][^"']*["']/,`class="${l}"`):l&&!f.includes("class=")?f=f.replace(/>$/,` class="${l}">`):!l&&f.includes("class=")&&(f=f.replace(/\s*class=["'][^"']*["']/,""))),a!==s&&!b.includes("<")&&(b=a);let g=f+b+h,m=e.replace(v[0],g);return m!==e?m:e}async function Hv(e,t,s){var o;let n=e||us();try{let i=await ot(n);if(!i.ok)return s&&s.forEach(p=>ge(p,"failed",{reason:"cannot read file"})),ae("Cannot read source file",!0),!1;let a=i.data.content,r=$d(a,t);if(r==="ambiguous")return s&&s.forEach(p=>ge(p,"failed",{reason:"ambiguous match \u2014 multiple links share this href"})),ae("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(r!==null)return(await ht({path:n,content:r},i.data)).ok?(s&&s.forEach(c=>ge(c,"persisted",{strategy:"contentMatch"})),ae(`Saved \u2192 ${n.split("/").pop()}`),!0):(s&&s.forEach(c=>ge(c,"failed",{reason:"API write failed"})),ae("Save failed",!0),!1);let l=await Y.get("/files");if(l.ok){let p=(l.data.files||[]).filter(c=>c.path.endsWith(".php")&&c.path!==n);for(let c of p){let d=await ot(c.path);if(!d.ok||!((o=d.data)!=null&&o.content))continue;let u=$d(d.data.content,t);if(u==="ambiguous")return s&&s.forEach(v=>ge(v,"failed",{reason:"ambiguous match in partial",file:c.path})),ae("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(u!==null)return(await ht({path:c.path,content:u},d.data)).ok?(s&&s.forEach(f=>ge(f,"persisted",{strategy:"partialSearch"})),ae(`Saved \u2192 ${c.path.split("/").pop()}`),!0):(s&&s.forEach(f=>ge(f,"failed",{reason:"API write failed in partial",file:c.path})),ae("Save failed",!0),!1)}}return s&&s.forEach(p=>ge(p,"failed",{reason:"link not found in source"})),ae("Save failed \u2014 link not found in source",!0),!1}catch(i){return console.error("[VX] saveLinkToSource error:",i),s&&s.forEach(a=>ge(a,"failed",{reason:"exception",error:i.message})),ae("Save failed \u2014 unexpected error",!0),!1}}async function jv(e){var l;if((l=window.demoGuard)!=null&&l.call(window))return!1;let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||us(),a=fn(e.sourceAddress||yt),r=Lo(a,"src",s,n,i);ge(r,"created");try{let p=await ot(i);if(!p.ok)return console.warn("[VX] Cannot read file for image save:",i),ge(r,"failed",{reason:"cannot read file"}),ae("Save failed",!0),!1;let c=p.data.content,d=!1,u=`src="${s}"`,v=c.split(u).length-1;if(v>1)return ge(r,"failed",{reason:"ambiguous match \u2014 multiple elements share this src"}),ae("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(v===1&&(c=c.replace(u,`src="${n}"`),d=!0),!d&&c.includes(s)){if(c.split(s).length-1>1)return ge(r,"failed",{reason:"ambiguous match \u2014 image path appears multiple times in source"}),ae("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1;c=c.replace(s,n),d=!0}if(!d&&o){let b=Sd(c,o,n);if(b==="ambiguous")return ge(r,"failed",{reason:"ambiguous alt-anchor match \u2014 multiple images share this alt text"}),ae("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;b!==!1&&(c=b,d=!0)}if(d)return(await ht({path:i,content:c},p.data)).ok?(ge(r,"persisted",{strategy:"contentMatch"}),ae(`Saved \u2192 ${i.split("/").pop()}`),!0):(ge(r,"failed",{reason:"API write failed"}),ae("Save failed",!0),!1);let f=await Y.get("/files");if(f.ok){let b=(f.data.files||[]).filter(h=>h.path.endsWith(".php")&&h.path!==i);for(let h of b){let g=await ot(h.path);if(!g.ok||!g.data.content)continue;let m=g.data.content,x=m.split(u).length-1;if(x>1)return ge(r,"failed",{reason:"ambiguous match in partial",file:h.path}),ae("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(x===1)return m=m.replace(u,`src="${n}"`),(await ht({path:h.path,content:m},g.data)).ok?(ge(r,"persisted",{strategy:"partialSearch"}),ae(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(ge(r,"failed",{reason:"API write failed in partial",file:h.path}),ae("Save failed",!0),!1);if(m.includes(s))return m.split(s).length-1>1?(ge(r,"failed",{reason:"ambiguous match in partial",file:h.path}),ae("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1):(m=m.replace(s,n),(await ht({path:h.path,content:m},g.data)).ok?(ge(r,"persisted",{strategy:"partialSearch"}),ae(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(ge(r,"failed",{reason:"API write failed in partial",file:h.path}),ae("Save failed",!0),!1));if(o){let w=Sd(m,o,n);if(w==="ambiguous")return ge(r,"failed",{reason:"ambiguous alt-anchor match in partial",file:h.path}),ae("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;if(w!==!1)return(await ht({path:h.path,content:w},g.data)).ok?(ge(r,"persisted",{strategy:"altAnchor"}),ae(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(ge(r,"failed",{reason:"API write failed in partial",file:h.path}),ae("Save failed",!0),!1)}}}return console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),ge(r,"failed",{reason:"source not found"}),ae("Save failed \u2014 source not found",!0),!1}catch(p){return console.error("[VX] Image save error:",p),ge(r,"failed",{reason:"exception",error:p.message}),ae("Save failed",!0),!1}}function Sd(e,t,s){let n=e.split("<img"),o=[];for(let d=1;d<n.length;d++){let u=n[d];if(u.includes(`alt="${t}"`)||u.includes(`alt='${t}'`)){let v=u.indexOf("src=");if(v!==-1){let f=u[v+4];(f==='"'||f==="'")&&u.indexOf(f,v+5)!==-1&&o.push(d)}}}if(o.length===0)return!1;if(o.length>1)return"ambiguous";let i=o[0],a=n[i],r=a.indexOf("src="),l=a[r+4],p=r+5,c=a.indexOf(l,p);return n[i]=a.substring(0,p)+s+a.substring(c),n.join("<img")}function Ui(e){var n;if((n=window.demoGuard)!=null&&n.call(window))return;let t=fn(e.sourceAddress),s=vr(t,e.originalHTML,e.newHTML,e.filePath);ge(s,"created"),hn.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:s}),clearTimeout(Ui._timer),Ui._timer=setTimeout(()=>Wn(),800)}async function zd(e){let{filePath:t,originalHTML:s,newHTML:n}=e;if(!s||!n)return ae("Source edit failed \u2014 missing data",!0),!1;let o=t||us();try{let i=await ot(o);if(!i.ok)return ae("Cannot read source file",!0),!1;let a=i.data.content,r=await Cd(o,a,s,n);if(r==="saved")return!0;if(r==="ambiguous")return!1;let l=await Y.get("/files");if(!l.ok)return ae("Save failed \u2014 source not found in file",!0),!1;let p=(l.data.files||[]).filter(c=>c.path.endsWith(".php")&&c.path!==o);for(let c of p){let d=await ot(c.path);if(!d.ok||!d.data.content)continue;let u=await Cd(c.path,d.data.content,s,n);if(u==="saved")return!0;if(u==="ambiguous")return!1}return console.warn("[VX] Source edit needle not found in any file:",s.substring(0,100)),ae("Save failed \u2014 source not found. The file may have changed.",!0),!1}catch(i){return console.error("[VX] Source edit save error:",i),ae("Save failed",!0),!1}}async function Cd(e,t,s,n){var l;let o=0,i=0;for(;;){let p=t.indexOf(s,i);if(p===-1||(o++,i=p+s.length,o>1))break}if(o===0)return"not_found";if(o>1)return ae("Save failed \u2014 source fragment appears multiple times. Edit in the Code Editor instead.",!0),"ambiguous";let a=t.replace(s,n),r=await ht({path:e,content:a},t);if(r.ok){let p=e.split("/").pop();return ae(`Saved \u2192 ${p}`),(l=r.data)!=null&&l.tailwindCompiled&&setTimeout(()=>{let c=document.getElementById("preview-iframe");c!=null&&c.contentWindow&&c.contentWindow.postMessage("voxelsite:reload-css","*")},300),"saved"}else return ae("Save failed",!0),"not_found"}function Er(e){var i;if((i=window.demoGuard)!=null&&i.call(window))return;let t=fn(e.sourceAddress),s=e.parentAddress?fn(e.parentAddress):null,n=typeof e.siblingIndex=="number"?e.siblingIndex:-1,o=dd(t,e.outerHTML,e.filePath,s,n);ge(o,"created"),hn.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:o}),clearTimeout(Er._timer),Er._timer=setTimeout(()=>Wn(),300)}function Fv(e){let t=e.match(/class="([^"]*)"/);return t?t[1].split(/\s+/).filter(Boolean):[]}function zv(e,t,s,n){let o=new Set(["is-visible","is-active","is-open","active","open","show","shown","visible","in","entered","transitioning"]),i=/class="([^"]*)"/g,a;for(;(a=i.exec(e))!==null;){let r=a[1].split(/\s+/).filter(Boolean);if(r.length===0||!r.every(f=>t.has(f))||![...t].filter(f=>!r.includes(f)).every(f=>o.has(f)||s.includes(f)||n.includes(f)))continue;let d=r.filter(f=>!n.includes(f));for(let f of s)!o.has(f)&&!d.includes(f)&&d.push(f);let u=a[0],v=`class="${d.join(" ")}"`;return e.substring(0,a.index)+v+e.substring(a.index+u.length)}return null}async function Wn(){var t,s,n,o,i,a,r;if(Fi||hn.length===0)return;Fi=!0;let e=[...hn];hn=[];try{let l={};for(let d of e){let u=((s=(t=d._op)==null?void 0:t.address)==null?void 0:s.sourceFile)||((n=d.sourceAddress)==null?void 0:n.sourceFile)||d.filePath||us();l[u]||(l[u]=[]),l[u].push(d)}let p=!1,c={filesByMain:new Map,contentByPath:new Map};for(let[d,u]of Object.entries(l))try{let v=await ot(d);if(!v.ok){console.error("[VX] Cannot read:",d);continue}let f=v.data.content,b=!1,h=[];for(let g of u){if(g._op&&g._op.type!==ve.FALLBACK){let x=Hi(g._op,f);if(x.applied){f=x.content,b=!0,h.push({op:g._op,strategy:x.strategy});continue}console.warn("[VX] applyOp failed:",x.reason,"\u2014 falling back to legacy for",g._op.type),ge(g._op,"fallback",{fallbackReason:x.reason,via:"applyOp"})}let m=g.type==="delete"?g.outerHTML:g.originalHTML;if(m){if((o=g.sourceAddress)!=null&&o.nodeKey&&g.type==="text"){let x=g.sourceAddress,w=x.sourceFile||d,E=f;if(w!==d)try{let S=await ot(w);S.ok&&((i=S.data)!=null&&i.content)&&(E=S.data.content)}catch{}let k=x.nodeKey.lastIndexOf(":"),$=!1;if(k!==-1){let S=parseInt(x.nodeKey.substring(k+1),10);if(!isNaN(S)){let _=cv(E,S);if(_){let q=Nd(E,E.indexOf(_));if(q){let K=q.length,O=_.lastIndexOf("</");if(O>K){let W=_.substring(O),G=q+g.newHTML+W;if(w!==d){let J=E.replace(_,G),T=await ht({path:w,content:J},E);T.ok&&(ae(`Saved \u2192 ${w.split("/").pop()}`),(a=T.data)!=null&&a.tailwindCompiled&&(p=!0),$=!0,g._op&&(ge(g._op,"persisted",{strategy:"nodeKey",via:"legacy"}),Mo(g._op,w)))}else f=f.replace(_,G),b=!0,$=!0,g._op&&h.push({op:g._op,strategy:"nodeKey",via:"legacy"})}}}}}if($)continue;console.warn("[VX] Legacy nodeKey extraction failed for",x.nodeKey,"\u2014 trying content match"),g._op&&ge(g._op,"fallback",{fallbackReason:"legacy nodeKey extraction failed",nodeKey:x.nodeKey})}if(f.includes(m))f=g.type==="delete"?f.replace(m,""):f.replace(m,g.newHTML),b=!0,g._op&&h.push({op:g._op,strategy:"contentMatch",via:"legacy"});else if(g.type==="class-change"&&g.additions){let x=new Set(Fv(m)),w=zv(f,x,g.additions,g.removals);if(w)f=w,b=!0,g._op&&h.push({op:g._op,strategy:"subsetMatch",via:"legacy"});else{let E=await _d(d,g,c);if(E.status==="saved"){g._op&&(ge(g._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:E.path}),Mo(g._op,E.path)),p=!0;continue}E.status==="write_failed"?g._op&&ge(g._op,"failed",{reason:"partial write failed",file:E.path}):(console.warn("[VX] Not found in source:",m.substring(0,80)),g._op&&ge(g._op,"failed",{reason:"source not found"}),ae("Save failed \u2014 source not found",!0))}}else{let x=await _d(d,g,c);if(x.status==="saved"){g._op&&(ge(g._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:x.path}),Mo(g._op,x.path)),p=!0;continue}x.status==="write_failed"?g._op&&ge(g._op,"failed",{reason:"partial write failed",file:x.path}):(console.warn("[VX] Not found in source:",m.substring(0,80)),g._op&&ge(g._op,"failed",{reason:"source not found"}),ae("Save failed \u2014 source not found",!0))}}}if(b){let g=await ht({path:d,content:f},v.data);if(g.ok){ae(`Saved \u2192 ${d.split("/").pop()}`),(r=g.data)!=null&&r.tailwindCompiled&&(p=!0);for(let{op:m,strategy:x,via:w}of h)ge(m,"persisted",{strategy:x,via:w||"applyOp"}),Mo(m,d)}else{ae("Save failed",!0);for(let{op:m,via:x}of h)ge(m,"failed",{reason:"file write failed",via:x||"applyOp"})}}}catch(v){console.error("[VX] Save error:",v),ae("Save failed",!0)}p&&setTimeout(()=>{let d=document.getElementById("preview-iframe");d!=null&&d.contentWindow&&d.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{Fi=!1,hn.length>0?setTimeout(()=>Wn(),0):ke({type:"vx-editor:save-feedback"})}}async function _d(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let r=await Y.get("/files");if(!r.ok)return{status:"not_found"};a=(r.data.files||[]).filter(l=>l.path.endsWith(".php")&&l.path!==e).filter(l=>o.some(p=>l.path.includes(p+"/"))||l.path.includes("partial")||l.path.includes("header")||l.path.includes("footer")||l.path.includes("nav")),i.filesByMain.set(e,a)}for(let r of a){let l=i.contentByPath.get(r.path);if(l==null){let p=await ot(r.path);if(!p.ok||!p.data.content)continue;l=p.data.content,i.contentByPath.set(r.path,l)}if(l.includes(n)){let p=t.type==="delete"?l.replace(n,""):l.replace(n,t.newHTML);return(await ht({path:r.path,content:p},l)).ok?(i.contentByPath.set(r.path,p),ae(`Saved \u2192 ${r.path.split("/").pop()}`),{status:"saved",path:r.path}):(ae("Save failed",!0),{status:"write_failed",path:r.path})}}}catch(a){console.error("[VX] Partial search error:",a)}return{status:"not_found"}}async function Uv(e){var i;let{filePath:t,sectionIndex:s,neighborIndex:n}=e,o=t||us();try{let a=await ot(o);if(!a.ok){ae("Could not read file",!0);return}let r=a.data.content,l=Vv(r);if(s>=l.length||n>=l.length){ae("Section not found in source. Try asking the AI to move it.",!0);return}let p=Wv(r,l,s,n);if(!p){ae("Could not swap sections in source",!0);return}let c=await ht({path:o,content:p},a.data);c.ok?(ae("Section moved"),(i=c.data)!=null&&i.tailwindCompiled&&setTimeout(()=>{let d=document.getElementById("preview-iframe");d!=null&&d.contentWindow&&d.contentWindow.postMessage("voxelsite:reload-css","*")},300)):ae("Save failed",!0)}catch(a){console.error("[VX] Section move error:",a),ae("Section move failed",!0)}}function Vv(e){let t=[],s=/<section\b/gi,n;for(;(n=s.exec(e))!==null;){let o=n.index,a=e.substring(Math.max(0,o-500),o).match(/(<!--[\s\S]*?-->\s*)$/);a&&(o-=a[0].length);let r="</section>",l=1,p=n.index+n[0].length;for(;l>0&&p<e.length;){let c=e.indexOf("<section",p),d=e.indexOf(r,p);if(d===-1)break;if(c!==-1&&c<d){let u=e[c+8];(u===" "||u===">"||u===`
`||u==="\r"||u==="	"||u==="/")&&l++,p=c+9}else{if(l--,l===0){let u=d+r.length;t.push({start:o,end:u,content:e.substring(o,u)})}p=d+r.length}}}return t}function Wv(e,t,s,n){if(s===n)return e;let o=Math.min(s,n),i=Math.max(s,n),a=t[o],r=t[i];if(!a||!r||a.end>r.start)return null;let l=e.substring(0,a.start),p=e.substring(a.end,r.start),c=e.substring(r.end);return l+r.content+p+a.content+c}function Ud(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",bt),e.title=bt?"Exit visual editor (V)":"Enter visual editor (V)",e.setAttribute("aria-pressed",String(bt))),document.body.classList.toggle("vx-editing",bt)}function ae(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(ae._timer),ae._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function ke(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function us(){return window.__vsCurrentPreviewPath||"index.php"}function $r(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),r=a.right-s-o,l=Math.max(o,a.left+10),p=Math.max(o,window.innerWidth-s-o),c=Math.min(Math.max(r,l),p),d=Math.max(a.top+12,i),u=Math.max(i,window.innerHeight-n-o),v=Math.min(d,u);e.style.left=`${c}px`,e.style.top=`${v}px`,e.style.right="auto"}function Ld(e,t,s){let n=e.offsetWidth||380,o=e.offsetHeight||180,i=16,a=56,r=document.getElementById("preview-iframe");if(!r||!s){$r(e);return}let l=r.getBoundingClientRect(),p=l.top+s.top,c=l.top+s.top+s.height,u=l.left+s.left+s.width/2-n/2,v,f=p-o-4;f>=a?v=f:v=c+8;let b=Math.max(i,window.innerWidth-n-i),g=Math.min(Math.max(u,i),b),m=Math.max(a,window.innerHeight-o-i),x=Math.min(Math.max(v,a),m);e.style.left=`${g}px`,e.style.top=`${x}px`,e.style.right="auto"}function Gv(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function zt(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ct(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ge(e,t,s={}){var o,i;let n={opId:(e==null?void 0:e.id)||"unknown",type:(e==null?void 0:e.type)||"unknown",event:t,sourceKind:((o=e==null?void 0:e.address)==null?void 0:o.sourceKind)||"unknown",sourceFile:((i=e==null?void 0:e.address)==null?void 0:i.sourceFile)||(e==null?void 0:e.filePath)||"unknown",timestamp:Date.now(),...s};hr.push(n),hr.length>ev&&hr.shift(),t==="failed"||t==="fallback"?console.warn(`[VX-OPS] ${t}:`,fr(e==null?void 0:e.type),n):console.debug(`[VX-OPS] ${t}:`,fr(e==null?void 0:e.type),n.sourceFile)}async function Kv(){var s;let e=gd();if(!e){ae("Nothing to undo");return}let t=e.filePath;if(!t){ae("Undo failed \u2014 no file path",!0);return}try{let n=await ot(t);if(!n.ok){ae("Undo failed \u2014 cannot read file",!0);return}let o=Hi(e.inverseOp,n.data.content);if(!o.applied){console.warn("[VX History] Undo applyOp failed:",o.reason),ae("Undo failed \u2014 source has changed",!0);return}let i=await ht({path:t,content:o.content},n.data);if(!i.ok){ae("Undo failed \u2014 save error",!0);return}hd(),ge(e.inverseOp,"persisted",{strategy:o.strategy,via:"undo"}),ae("Undone"),Un+=2,ke({type:"vx-editor:replay-op",op:e.inverseOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Undo error:",n),ae("Undo failed",!0)}}async function Yv(){var s;let e=bd();if(!e){ae("Nothing to redo");return}let t=e.filePath;if(!t){ae("Redo failed \u2014 no file path",!0);return}try{let n=await ot(t);if(!n.ok){ae("Redo failed \u2014 cannot read file",!0);return}let o=Hi(e.forwardOp,n.data.content);if(!o.applied){console.warn("[VX History] Redo applyOp failed:",o.reason),ae("Redo failed \u2014 source has changed",!0);return}let i=await ht({path:t,content:o.content},n.data);if(!i.ok){ae("Redo failed \u2014 save error",!0);return}yd(),ge(e.forwardOp,"persisted",{strategy:o.strategy,via:"redo"}),ae("Redone"),Un+=2,ke({type:"vx-editor:replay-op",op:e.forwardOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Redo error:",n),ae("Redo failed",!0)}}var Vd="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",Jv=["claude","openai","gemini","deepseek","openai_compatible"],Xv={claude:"Claude",openai:"OpenAI",gemini:"Gemini",deepseek:"DeepSeek",openai_compatible:"OpenAI-Compatible"},Zv={governor_configuration:"Routing needs a TypeSafe key. Default editing remains available.",forbidden_claims:"The proposed claim is not supported by the known business facts.",gate_unavailable:"The claim check was unavailable. No candidate was approved.",gate_invalid:"The claim check returned an invalid result. No candidate was approved.",routing_unavailable:"The routing check was unavailable.",routing_invalid:"The routing check returned an invalid result.",routing_uncertain:"The router could not choose confidently.",content_changed:"The page changed during the request. Refresh before trying again.",invalid_target:"Select one plain-text heading in a registered page.",missing_address:"Select one plain-text heading in a registered page.",ambiguous_address:"The selection matched more than one heading. Select a unique heading.",explicit_replacement_required:"Provide the exact replacement heading.",repair_limit_exhausted:"Two targeted repairs were used. Revise the request before starting a new edit.",prompt_injection:"The request could expand the edit beyond its allowed scope.",ledger_unavailable:"Call accounting was unavailable. Ask the owner to check the database.",generation_failed:"Generation failed. Try the edit again.",generation_cancelled:"The request was cancelled.",identical_candidate:"The proposed heading was unchanged.",invalid_candidate:"The proposed heading did not pass validation.",unsupported_action:"This historical check did not support the requested action.",unsupported_route:"This historical check did not support the requested action.",invalid_request:"Use a text request of at most 4,000 characters."},Qv={configuration_error:"Add a TypeSafe key to enable routing.",classification_unavailable:"The router was unavailable.",low_confidence:"The router was unsure.",invalid_classification:"The router returned an invalid choice.",unsafe_classification:"The request needs default handling.",ambiguous_write:"The request needs default handling.",request_too_large:"The request needs full instructions.",routing_unavailable:"The router was unavailable.",routing_invalid:"The router returned an invalid choice.",routing_uncertain:"The router was unsure.",model_map_missing:"Choose both routing models.",model_map_invalid:"Check your routing models.",model_map_mismatch:"Models do not match your AI provider.",unsupported_action:"This request uses its normal editing path.",ledger_unavailable:"Routing could not be recorded."},em={edit_copy:"Copy edit",edit_layout:"Layout edit",add_page:"New page",new_site:"New site",theme:"Design change",restyle:"Restyle",question:"Question",noop:"No change"},tm={create_site:"Create site",import_site:"Import site",restyle_site:"Restyle site",edit_page:"Edit page",change_design:"Change design",add_page:"Add page",optimize_aeo:"Search visibility",section_edit:"Edit section",add_section:"Add section",inline_edit:"Edit selection",free_prompt:"General request",question:"Answer question",noop:"No change",replace_text:"Exact replacement"},sm={legacy:"Default",focused:"Selected content",full:"Full site context",readonly:"Relevant site details"};function nm(e){var t;return e!=null&&e.available?(t=e.items)!=null&&t.length?`<ul class="flex flex-col gap-4">${e.items.map(s=>{var a;if(s.kind==="routing"){let r=s.status==="preview"?"Preview: suggested choices only. Editing used defaults.":s.status==="routed"?"Automatic routing used.":s.status==="off"?"AI Router off. Default settings used.":"Default settings used. "+(Qv[s.reason]||"Routing was unavailable."),l=(a=s.models)!=null&&a.length?`Model: ${s.models.join(", ")}.`:"No generation model recorded.",p=s.status==="preview"?` Suggested model: ${s.proposed_model||"default"}.`:"",c=`${s.status==="preview"?"Suggested work":"Work"}: ${em[s.intent]||"Default"}; instructions: ${tm[s.recipe]||"Default"}; context: ${sm[s.context]||"Default"}.`;return`<li class="text-sm text-vs-text-secondary"><strong>Turn ${Number(s.id)}</strong><p>${X(r)}</p><p class="text-xs mt-1">${X(l+p+" "+c)}</p></li>`}let n;s.mode==="shadow"?n=`Historical preview; request ${s.status}. No edit check.`:s.status==="applied"?n=s.reason==="accepted_owner_override"?"This edit was applied with an owner override.":"Historical heading check: edit applied.":s.status==="answered"?n="Answered the question. No files changed.":s.status==="acknowledged"?n="No changes requested. No files changed.":n="This edit was not applied. "+(Zv[s.reason]||"The edit could not be completed safely.");let o=s.generation_calls>0?`${s.generation_calls} recorded generation/repair call(s) via ${s.providers.join(", ")}.`:"No generation calls recorded.",i=s.mode==="enforce"&&s.intent!=="unknown"?`Route: ${s.intent}; requested tier: ${s.requested_tier}. `:"";return`<li class="text-sm text-vs-text-secondary"><strong>Historical turn ${Number(s.id)}</strong><p>${X(n)}</p><p class="text-xs mt-1">${X(i+o)}</p></li>`}).join("")}</ul>`:'<p class="text-sm text-vs-text-secondary">No recorded requests yet.</p>':'<p class="text-sm text-vs-warning" role="status">Recorded outcomes could not be loaded. Reload Settings to try again.</p>'}function Wd(e,t,s){var u;if(!e)return'<section class="vs-settings-card"><h2 class="vs-settings-card-title">AI Router</h2><p class="text-sm text-vs-error" role="alert">AI Router settings could not be loaded. Reload Settings before making changes.</p></section>';let n=e["governor.mode"],o=e["governor.model_map"]||{},i=e["governor.configuration_error"],a=e.ai_provider??"claude",l=!(Object.keys(o).length>0)||Object.keys(o).length===2&&["cheap","frontier"].every(v=>{var f,b;return((f=o[v])==null?void 0:f.provider)===a&&typeof((b=o[v])==null?void 0:b.model)=="string"}),p=((u=e["governor.model_map_error"])==null?void 0:u.message)||(l?"":"The saved models do not match this provider. Choose two models or clear them, then click Save AI Router."),c=t==="owner",d=["cheap","frontier"].map(v=>{var f;return`
    <div class="flex flex-col gap-2"><label for="governor-${v}-model" class="block text-sm font-medium text-vs-text-secondary">${v==="cheap"?"Faster":"Stronger"} model</label>
      <select id="governor-${v}-model" class="vs-input" disabled aria-describedby="governor-model-help governor-model-save-help governor-model-status">${Gd([],p?"":((f=o[v])==null?void 0:f.model)||"","loading")}</select></div>`}).join("");return`<section id="governor-settings" class="vs-settings-card" aria-labelledby="governor-title">
    <h2 id="governor-title" class="vs-settings-card-title">AI Router</h2>
    <p class="vs-settings-card-subtitle">Automatically selects the model and instructions for each request.</p>
    <p class="text-sm text-vs-text-secondary mb-4">Powered by TypeSafe\u2019s Jev model. If routing is unavailable, editing uses your default settings.</p>
    <p class="text-sm text-vs-text-secondary mb-4">Saved setting: ${n==="off"?"Off":"On"}. TypeSafe key: ${e["governor.typesafe_configured"]?"stored":"not stored"}.</p>
    ${p?`<p class="text-sm text-vs-warning mb-4" role="alert">${X(p)}</p>`:""}
    ${i?`<p class="text-sm text-vs-error mb-4" role="alert">${X(i.message)}</p>`:""}
    ${c?`<form id="governor-form" data-provider="${X(a)}" data-key-stored="${!!e["governor.typesafe_configured"]}" data-model-state="loading" data-map-mismatch="${!!p}" class="flex flex-col gap-6">
      <label class="flex min-h-11 items-center gap-3 cursor-pointer">
        <span class="relative inline-flex h-5 w-9 shrink-0">
          <input id="governor-enabled" type="checkbox" role="switch" class="peer sr-only" ${n!=="off"?"checked":""} aria-describedby="governor-enabled-help" />
          <span aria-hidden="true" class="vs-toggle-track absolute inset-0 rounded-full bg-vs-border-medium peer-checked:bg-vs-accent peer-focus-visible:outline-2 peer-focus-visible:outline-vs-accent peer-focus-visible:outline-offset-2"></span>
          <span aria-hidden="true" class="vs-toggle-thumb pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out peer-checked:translate-x-4 motion-reduce:transition-none"></span>
        </span>
        <span class="min-w-0"><span class="block text-sm font-medium text-vs-text-primary">Enable AI Router</span><span id="governor-enabled-help" class="block text-xs text-vs-text-secondary mt-1">Off uses your default model and instructions.</span></span>
      </label>
      <p class="text-sm text-vs-text-secondary">Save to apply your choice. All editing tools remain available.</p>
      <input id="governor-remove-key" type="checkbox" hidden />
      <div id="governor-key-controls"${n==="off"&&!e["governor.typesafe_configured"]?" hidden":""}><div class="flex flex-col gap-2"><label for="governor-key" class="block text-sm font-medium text-vs-text-secondary">TypeSafe key</label>
        <div class="flex flex-wrap items-center gap-2">
          <input id="governor-key" value="${e["governor.typesafe_configured"]?Vd:""}" type="password" autocomplete="new-password" class="vs-input flex-1 min-w-0" maxlength="4096" ${n==="off"?"disabled":""} aria-describedby="governor-key-help governor-key-removal-status governor-save-status" />
          ${e["governor.typesafe_configured"]?'<button id="governor-remove-key-button" type="button" class="vs-btn vs-btn-ghost vs-btn-sm">Remove key</button>':""}
        </div>
        <p id="governor-key-help" class="text-xs text-vs-text-secondary mt-1">${e["governor.typesafe_configured"]?n==="off"?"Turn on AI Router to replace this key.":"Leave unchanged to keep your key. Enter a new key to replace it.":"Enter your TypeSafe key, then save."}</p>
        <p id="governor-key-removal-status" class="text-sm text-vs-warning empty:hidden" role="status" aria-live="polite"></p>
        <a href="https://console.typesafe.ai/keys" target="_blank" rel="noopener noreferrer" class="text-xs text-vs-accent">Get a key in the TypeSafe console</a>
      </div></div>
      <div id="governor-model-controls"${n==="off"?" hidden":""}><fieldset class="min-w-0 flex flex-col gap-4"><legend class="text-sm font-medium text-vs-text-secondary mb-2">Models</legend>
        <p id="governor-model-help" class="text-sm text-vs-text-secondary">Use the faster model for small edits and the stronger model for larger changes.</p>
        <p id="governor-model-save-help" class="text-sm text-vs-text-secondary">Choose both models for ${X(Xv[a]||"Unknown provider")}, then save. Leave both empty to use your default model.</p>
        ${d}
        <p id="governor-model-status" class="text-xs text-vs-text-secondary" role="status" aria-live="polite">Loading models\u2026</p>
        <button id="governor-clear-models" type="button" class="vs-btn vs-btn-secondary vs-btn-sm">Clear saved models</button>
      </fieldset></div>
      <p id="governor-save-status" class="text-sm text-vs-text-secondary empty:hidden" role="status" aria-live="polite"></p>
      <div class="vs-settings-card-footer"><button type="submit" class="vs-btn vs-btn-primary vs-btn-sm">Save AI Router</button></div>
    </form>`:'<p class="text-sm text-vs-text-secondary mb-4">Only the owner can change these settings.</p>'}
    <h3 class="text-sm font-medium mt-4 mb-4">Your recent requests</h3>
    ${nm(s)}
  </section>`}function Gd(e,t,s="ready"){let n=e.filter(d=>typeof(d==null?void 0:d.id)=="string"&&/^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(d.id)&&!d.id.includes("://")),o=d=>{let u=d.match(/^claude-(?:\d+(?:-\d+)?-)?([a-z]+)(?:-|$)/i);if(u)return`Claude ${u[1][0].toUpperCase()}${u[1].slice(1)}`;let v=d.match(/^(gpt-\d+(?:\.\d+)?[a-z]?)(?:-|$)/i);if(v)return v[1].toUpperCase();let f=d.match(/^(o\d+)(?:-|$)/i);if(f)return f[1];let b=d.match(/^(gemini-\d+(?:\.\d+)?)(?:-|$)/i);if(b)return b[1].replace(/^gemini-/i,"Gemini ");let h=d.match(/^deepseek-(v\d+(?:\.\d+)?|r\d+)(?:-|$)/i);return h?`DeepSeek ${h[1].toUpperCase()}`:"Other models"},i=d=>{let u=typeof d.created_at=="string"&&/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(d.created_at)?Date.parse(d.created_at):NaN;return Number.isFinite(u)&&u>0?u:-1/0},a=(d,u)=>d===u?0:d>u?-1:1,r=new Map;for(let d of n){let u=o(d.id);r.has(u)||r.set(u,{label:u,date:-1/0,models:[]});let v=r.get(u);v.models.push(d),v.date=Math.max(v.date,i(d))}let l=[...r.values()].sort((d,u)=>{if(d.label==="Other models"||u.label==="Other models")return d.label===u.label?0:d.label==="Other models"?1:-1;let v=a(d.date,u.date);if(v)return v;let f=d.label.match(/^(GPT-|Gemini |o|DeepSeek [VR])(\d+(?:\.\d+)?)$/),b=u.label.match(/^(GPT-|Gemini |o|DeepSeek [VR])(\d+(?:\.\d+)?)$/);return f&&b&&f[1]===b[1]?b[2].localeCompare(f[2],"en",{numeric:!0}):0}),p=t&&!n.some(d=>d.id===t),c=l.map(d=>{d.models.sort((v,f)=>a(i(v),i(f)));let u=d.models.map(v=>`<option value="${X(v.id)}" ${v.id===t?"selected":""}>${X(v.name||v.id)}</option>`).join("");return l.length===1&&d.label==="Other models"?u:`<optgroup label="${X(d.label)}">${u}</optgroup>`}).join("");return`<option value="" ${t?"":"selected"}>No saved model</option>`+(p?`<option value="${X(t)}" selected>${X(t)} (${s==="loading"?"saved":"saved; unavailable in model list"})</option>`:"")+c}async function om(e,t){let s=["cheap","frontier"].map(i=>e.querySelector(`#governor-${i}-model`)),n=e.querySelector("#governor-model-status"),o=e.querySelector("#governor-clear-models");for(let i of s)i.addEventListener("change",()=>{e.dataset.modelsDirty="true"});o.addEventListener("click",()=>{for(let i of s)i.value="";e.dataset.modelsDirty="true",n.textContent="Click Save AI Router to remove the saved models."});try{let{ok:i,data:a}=await t();if((a==null?void 0:a.provider)!==void 0&&a.provider!==e.dataset.provider){e.dataset.modelState="stale",o.disabled=!0,n.textContent="The AI provider changed. Reload Settings before saving AI Router.";return}if(!i||(a==null?void 0:a.provider)!==e.dataset.provider||!Array.isArray(a.models))throw new Error;let r=a.models.filter(l=>typeof(l==null?void 0:l.id)=="string"&&/^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(l.id)&&!l.id.includes("://"));e.dataset.modelState=r.length?"ready":"empty";for(let l of s)l.innerHTML=Gd(r,l.value),l.disabled=!r.length;if(e.dataset.modelsDirty==="true")return;n.textContent=r.length?e.dataset.mapMismatch==="true"?"Choose both models for this provider or clear the saved models, then click Save AI Router.":"Choose both models to replace your saved choices.":"No models available. Check AI Provider settings; saved models are kept."}catch{e.dataset.modelState="error",e.dataset.modelsDirty!=="true"&&(n.textContent="Models could not be loaded. Reload Settings to retry; saved models will be kept.")}}function im(e){let t=a=>e.querySelector("#"+a).value,s=e.querySelector("#governor-enabled").checked?"enforce":"off",n=e.querySelector("#governor-remove-key").checked;if(n&&s!=="off")throw new Error("Select Off before removing the TypeSafe key.");if(s==="off")return n?{"governor.mode":s,"governor.typesafe_api_key":null}:{"governor.mode":s};let o={};if(e.dataset.modelState==="stale")throw new Error("The AI provider changed. Reload Settings before saving AI Router.");for(let a of["cheap","frontier"]){let r=t(`governor-${a}-model`).trim();r&&(o[a]={provider:e.dataset.provider,model:r})}if(Object.keys(o).length===1)throw new Error("Choose both models, or click Clear saved models, then click Save AI Router.");if(Object.values(o).some(a=>!Jv.includes(a.provider)||a.model.includes("://")||!/^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(a.model)))throw new Error("Use a model ID without spaces, credentials or a provider URL.");let i={"governor.mode":s,"governor.model_map":Object.keys(o).length?o:[]};return e.dataset.modelState&&e.dataset.modelsDirty!=="true"&&delete i["governor.model_map"],n?i["governor.typesafe_api_key"]=null:t("governor-key")&&t("governor-key")!==Vd&&(i["governor.typesafe_api_key"]=t("governor-key")),i}function Kd(e,{getRole:t,put:s,reload:n,getModels:o,demoGuard:i=()=>!1}){let a="Could not confirm the save. Reload Settings to check the stored configuration before trying again.",r=e.querySelector("#governor-form");if(!r||t()!=="owner")return;let l=!1,p=()=>{let u=!r.querySelector("#governor-enabled").checked,v=r.dataset.keyStored==="true",f=r.querySelector("#governor-remove-key").checked;r.querySelector("#governor-key-controls").hidden=u&&!v,r.querySelector("#governor-key").disabled=u||f,r.querySelector("#governor-enabled").disabled=f;let b=r.querySelector("#governor-key-help");b&&(b.hidden=f,b.textContent=v?u?"Turn on AI Router to replace this key.":"Leave unchanged to keep your key. Enter a new key to replace it.":"Enter your TypeSafe key, then save."),r.querySelector("#governor-model-controls").hidden=u,!u&&o&&!l&&(l=!0,om(r,o))},c=r.querySelector("#governor-remove-key-button"),d=!1;c==null||c.addEventListener("click",()=>{if(i()||t()!=="owner"||r.querySelector('button[type="submit"]').disabled)return;let u=r.querySelector("#governor-remove-key"),v=r.querySelector("#governor-enabled");u.checked=!u.checked,u.checked?(d=v.checked,v.checked=!1):v.checked=d,c.textContent=u.checked?"Undo":"Remove key",r.querySelector("#governor-key-removal-status").textContent=u.checked?"Save to remove this key and turn off AI Router.":"",p()}),r.addEventListener("change",p),p(),r.addEventListener("submit",async u=>{var h,g;if(u.preventDefault(),t()!=="owner"||i())return;let v=r.querySelector('button[type="submit"]');if(v.disabled)return;let f=r.querySelector("#governor-save-status"),b;try{b=im(r)}catch(m){f.textContent=m.message;return}v.disabled=!0,f.textContent="Saving AI Router\u2026";try{let m=await s("/settings",b);r.querySelector("#governor-key").value="",delete b["governor.typesafe_api_key"],m.ok?await n():((h=m.error)==null?void 0:h.code)==="network_error"?f.textContent=a:f.textContent=((g=m.error)==null?void 0:g.code)==="governor_configuration"?"Enter a readable TypeSafe key to enable routing. Editing can still use your default settings.":"AI Router settings were not saved. Reload Settings to check the saved AI provider, then check your owner access and field values."}catch{f.textContent=a}finally{r.querySelector("#governor-key").value="",delete b["governor.typesafe_api_key"],v.disabled=!1}})}function Ji(e,t=""){let s=new Map;for(let n of Array.isArray(e)?e:[])typeof(n==null?void 0:n.id)=="string"&&n.id&&s.set(n.id,n.name||n.id);return t&&!s.has(t)&&s.set(t,t),s.size?[...s].map(([n,o])=>`<option value="${X(n)}"${n===t?" selected":""}>${X(o)}</option>`).join(""):'<option value="">Test your connection to load available models</option>'}function Yd(e){let t=(String(e||"").trim()||"http://localhost:11434").replace(/\/+$/,"");return/\/v\d+$/.test(t)?t:`${t}/v1`}function Jd(e,t){let s=Yd(t),n=e!=null&&e.base_url&&Yd(e.base_url)===s&&e.models&&typeof e.models=="object"&&!Array.isArray(e.models)?{...e.models}:{};return{base_url:s,models:n}}function am(e,t,s,n){let o=String(s).trim(),i=String(n).trim(),a={...e.models};if(!o&&!i)return delete a[t],{settings:{...e,models:a}};if(!t)return{error:"Choose a model before setting its limits."};if(!o||!i)return{error:"Enter both limits, or leave both blank to use detected limits."};let r=Number(o),l=Number(i);return!Number.isInteger(r)||r<1||r>2e6||!Number.isInteger(l)||l<1||l>1e7?{error:"Use whole numbers: output from 1 to 2,000,000 and context from 1 to 10,000,000."}:r>l?{error:"The output limit cannot exceed the context window."}:{settings:{...e,models:{...a,[t]:{max_output_tokens:r,context_window:l}}}}}function rm(e){let t=e==null?void 0:e.budget,s=e==null?void 0:e.focused_budget;if(!t||!s)return"Model limits could not be loaded. Try again after testing your connection.";let n=i=>Number(i).toLocaleString(),o={documented:"Using documented model limits.",metadata:"Using model limits reported by your endpoint.",override:"Using your limits for this endpoint and exact model ID.",fallback:t.provider==="openai_compatible"?"This model has no reported limits. Conservative defaults are in use; set limits below if your host documents different values.":"Limits are not known for this model. Conservative defaults are in use."}[e.source]||"";return`
    <dl class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      ${[["Configured ceiling",t.configured],["Full generation",t.effective],["Section edits",s.effective]].map(([i,a])=>`
        <div><dt class="text-vs-text-ghost">${i}</dt><dd class="text-vs-text-secondary font-medium">${n(a)} tokens</dd></div>
      `).join("")}
    </dl>
    <p class="mt-2">Model output limit: ${n(t.model_limit)} \xB7 Context window: ${n(t.context_window)} tokens.</p>
    <p class="mt-1">${o} Section edits use at most 16,000 tokens.</p>`}function Xd(e,{settings:t,post:s,delay:n=180,demoMode:o=!1,canEditModelLimits:i=!1}){let a=S=>e.querySelector(`#${S}`),r=a("set-ai-model"),l=a("set-max-tokens"),p=a("set-base-url"),c=a("set-model-output-limit"),d=a("set-model-context-window"),u=a("set-model-budget"),v=a("set-model-limits-error"),f=t.ai_provider==="openai_compatible",b=Jd(t.ai_openai_compatible_model_limits,p==null?void 0:p.value),h=r.value,g=0,m;function x(){if(!f)return;let S=Object.hasOwn(b.models,h)?b.models[h]:null;c.value=(S==null?void 0:S.max_output_tokens)??"",d.value=(S==null?void 0:S.context_window)??"",c.readOnly=!i,d.readOnly=!i,w("")}function w(S){f&&(v.textContent=S,v.hidden=!S,c.setCustomValidity(S),d.setCustomValidity(S))}function E(){if(!f)return;if(!i)return b;let S=am(b,h,c.value,d.value);return w(S.error||""),S.error?null:(b=S.settings,b)}async function k(S){var O,W;if(!u.isConnected||S!==g)return;let _=E();if(_===null){u.textContent="Complete both model limits to preview the generation budget.";return}let q=Number(l.value);if(!Number.isInteger(q)||q<1e3||q>128e3){u.textContent="Enter a whole-number output ceiling from 1,000 to 128,000 tokens.";return}if(!r.value){u.textContent="Choose a model to see its generation budget.";return}let K={provider:t.ai_provider||"claude",model:r.value,max_tokens:q,base_url:((O=p==null?void 0:p.value)==null?void 0:O.trim())||"",...f&&i?{model_limits:_}:{}};try{let G=await s("/settings/model-budget",K,{silent:!0});if(!u.isConnected||S!==g)return;G.ok?u.innerHTML=rm(G.data):u.textContent=((W=G.error)==null?void 0:W.message)||"Model limits could not be loaded. Try again after testing your connection."}catch{u.isConnected&&S===g&&(u.textContent="Model limits could not be loaded. Try again after testing your connection.")}}function $(){clearTimeout(m);let S=++g;if(o){u.textContent="Model limits appear after setup.";return}u.textContent="Checking model limits\u2026",m=setTimeout(()=>k(S),n)}return r.addEventListener("change",()=>{if(E()===null){r.value=h,c.reportValidity();return}h=r.value,x(),$()}),l.addEventListener("input",$),f&&(i&&(c.addEventListener("input",$),d.addEventListener("input",$)),p.addEventListener("input",()=>{b=Jd(i?b:t.ai_openai_compatible_model_limits,p.value),x(),$()})),x(),$(),{collectLimits(){if(!i)return;let S=E();return S===null&&c.reportValidity(),S},refresh:$,invalidate(){clearTimeout(m),g++}}}var lm={read:"Read website files and preview the draft.",edit:"Read and edit the draft, upload assets, and restore draft versions.",publish:"Edit the draft and publish changes to the live website."},$n={codex:"Codex",claude:"Claude Code",other:"Other MCP client"},Tr="Read the website and summarize its pages, design, and granted access. Suggest one useful draft improvement. Do not change or publish anything yet.",Zd=e=>Object.keys($n).find(t=>$n[t]===e)||"other",Ro=(e,t)=>`${$n[e]||$n.other} \xB7 ${t||"My website"}`.slice(0,100),En=e=>typeof e=="number"&&Number.isFinite(e)?new Date(e*1e3).toLocaleString():"not recorded";function Xi(e,t){return e==="codex"?{instructions:"Add this to ~/.codex/config.toml. Set VOXELSITE_MCP_TOKEN in the environment that starts Codex, then restart Codex and open /mcp.",snippet:`[mcp_servers.voxelsite]
url = ${JSON.stringify(t||"")}
bearer_token_env_var = "VOXELSITE_MCP_TOKEN"`,url:"https://developers.openai.com/codex/mcp"}:e==="claude"?{instructions:"Merge this server into .mcp.json in your project. Set VOXELSITE_MCP_TOKEN in the environment that starts Claude Code, then restart it and approve the server in /mcp.",snippet:JSON.stringify({mcpServers:{voxelsite:{type:"http",url:t||"",headers:{Authorization:"Bearer ${VOXELSITE_MCP_TOKEN}"}}}},null,2),url:"https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson"}:{instructions:"Choose a client that supports Streamable HTTP and bearer authentication. Use its secret store or documented environment-variable setting. If it cannot send an Authorization header, use Codex or Claude Code.",snippet:`Transport: Streamable HTTP
URL: ${t||"Finish private draft setup first"}
Authentication: Bearer token from your client\u2019s secret store`,url:null}}function dm(e,t){var a,r,l,p;if(t.demo)return{state:"sample",values:[`Sample last used ${En(e.last_used_at)}`,"Example activity only. No real connection or credential exists.","View sample permissions","permissions"]};let s=e.connection_state||(e.revoked_at?"revoked":t.enabled?"waiting":"disabled"),n=e.client_name||"your AI tool",o={audience_mismatch:"This credential was used with the wrong interface. Use the Studio MCP endpoint and a Studio MCP credential.",credential_revoked:"This credential has been revoked. Create a replacement.",credential_expired:"This credential has expired. Create a replacement.",account_inactive:"The account for this credential is inactive. Choose an active account."}[(a=e.last_auth_failure)==null?void 0:a.code],i={waiting:[`Waiting for ${n} to connect`,"Open the client with your credential, then check the result here.","View setup","setup"],authenticated:["Authenticated request received","Studio verified this credential. Its granted access is listed below.","Start the first task","task"],used:[`Last used ${En(e.last_used_at)}`,"This is the last successful request, not an active session.","View permissions","permissions"],authentication_failed:["Authentication failed",o||"Check the client\u2019s credential variable and whether your host forwards the Authorization header. Replace the credential if it is unavailable.","Review setup","setup"],permission_denied:["Insufficient permission",`The request${(r=e.last_permission_denial)!=null&&r.tool?` for ${e.last_permission_denial.tool}`:""} needs ${((p=(l=e.last_permission_denial)==null?void 0:l.required_scopes)==null?void 0:p.join(", "))||"access this credential does not have"}. Ask the owner for the required access or use a permitted task.`,"Choose a permitted task","task"],disabled:e.disabled_reason==="account_inactive"?["Account is inactive","This credential cannot make requests for an inactive account.","Choose an active account","account"]:["Connections are disabled",t.configuration_override?"Ask your host administrator to enable connections in the server configuration.":"Enable connections to allow requests. Your credentials are retained.",t.configuration_override?"Review setup":"Enable connections",t.configuration_override?"setup":"enable"],revoked:["Credential revoked","This credential no longer works. Remove it from your client.","Create a replacement","replace"],expired:["Credential expired","Create a replacement and update your client\u2019s secret.","Create a replacement","replace"]};return{state:s,values:i[s]||["Status unavailable","The last result could not be determined. Check the result before creating another credential.","Check result","refresh"]}}function cm(e,t,s={}){var c;let n=y,o=e.accounts||[],i=o.map(d=>`<option value="${Number(d.id)}" ${Number(d.id)===Number(t)?"selected":""}>${n(d.name)} \xB7 ${n(d.role)}</option>`).join(""),r=(e.connections||[]).map(d=>{var x;let{state:u,values:[v,f,b,h]}=dm(d,e),g=["revoked","expired"].includes(u),m=o.find(w=>Number(w.id)===Number(d.user_id));return`<li class="py-4 border-b border-vs-border-subtle">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm font-medium text-vs-text-primary break-words">${n(d.label)}</p>
          <p class="text-xs text-vs-text-tertiary mt-1">${n((m==null?void 0:m.name)||"Unavailable account")}${d.expires_at?` \xB7 Expires ${n(En(d.expires_at))}`:""}</p>
          <p class="text-sm text-vs-text-secondary mt-2">${n(v)}</p>
          <p class="text-xs text-vs-text-tertiary mt-1">${n(f)}</p>
          ${!e.demo&&d.first_authenticated_at?`<p class="text-xs text-vs-text-tertiary mt-1">First authenticated ${n(En(d.first_authenticated_at))} \xB7 Last authenticated ${n(En(d.last_authenticated_at))}</p>`:""}
          ${!e.demo&&d.last_used_at&&u!=="used"?`<p class="text-xs text-vs-text-tertiary mt-1">Last used ${n(En(d.last_used_at))}</p>`:""}
          ${u==="authentication_failed"&&((x=d.last_auth_failure)!=null&&x.at)?`<p class="text-xs text-vs-text-tertiary mt-1">Authentication failure ${n(En(d.last_auth_failure.at))}</p>`:""}
          <button type="button" class="vs-btn vs-btn-ghost vs-btn-sm mt-2" data-mcp-next="${h}" data-connection="${Number(d.id)}">${n(b)}</button>
          <details id="mcp-permissions-${Number(d.id)}" class="text-xs text-vs-text-tertiary mt-2"><summary class="cursor-pointer">View permissions</summary>
            <p class="mt-2 break-words">${(d.scopes||[]).map(n).join(", ")}</p>
          </details>
        </div>
        ${g?"":`<button type="button" class="vs-btn vs-btn-ghost vs-btn-sm shrink-0" data-mcp-revoke="${Number(d.id)}" aria-label="Revoke ${X(d.label)}" ${e.demo?"disabled":""}>Revoke</button>`}
      </div>
    </li>`}).join(""),l=(e.rest_connections||[]).filter(d=>!d.user_id),p=d=>{var f;let u=(f=e.pages)==null?void 0:f[d],v=Number(s[`${d}_offset`]||0);return!u||!v&&u.next_offset===null?"":`<div class="flex items-center gap-3 mt-3">
      <span class="text-xs text-vs-text-tertiary">${u.total} ${d==="rest"?"REST keys":"connections"}</span>
      ${v?`<button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-page="${d}" data-offset="${Math.max(0,v-50)}">Previous</button>`:""}
      ${u.next_offset!==null?`<button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-page="${d}" data-offset="${u.next_offset}">Next</button>`:""}</div>`};return`
    <div class="flex items-start justify-between gap-4">
      <div><h2 class="vs-settings-card-title">Connect your AI tool</h2>
        <p class="vs-settings-card-subtitle">Work on this website from a connected AI conversation.</p></div>
      <span class="text-xs text-vs-text-tertiary shrink-0">${e.demo?"Demo data":e.enabled?"Enabled":"Disabled"}</span>
    </div>
    ${e.demo?'<p class="text-sm text-vs-text-secondary mb-4" role="note">This is a read-only example. No real connection or credential exists. The endpoint and activity below are sample data; creating credentials and changing access are disabled.</p>':""}
    <p class="text-sm text-vs-text-secondary mb-4">Your conversation stays in your AI tool. Changes appear in Studio\u2019s draft and history. Publishing needs separate access.</p>
    <p class="text-xs text-vs-text-tertiary mb-4">${n(e.billing||"")}</p>
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <button type="button" id="mcp-toggle" class="vs-btn vs-btn-secondary vs-btn-sm" ${e.demo||e.configuration_override||!e.enabled&&(!e.workspace_ready||!e.endpoint)?"disabled":""}>${e.enabled?"Disable connections":"Enable connections"}</button>
      <button type="button" id="mcp-check-result" class="vs-btn vs-btn-ghost vs-btn-sm">Check result</button>
      ${!e.workspace_ready||!e.endpoint?'<a href="./workspace.php" class="text-sm text-vs-text-secondary underline">Finish private draft setup</a>':""}
      ${e.configuration_override?'<span class="text-xs text-vs-text-tertiary">Access is controlled by the server configuration.</span>':""}
    </div>
    ${e.endpoint?`<label for="mcp-endpoint" class="block text-sm font-medium text-vs-text-secondary mb-1">Studio MCP endpoint</label>
      <div class="flex gap-2 mb-2"><input id="mcp-endpoint" type="text" readonly class="vs-input min-w-0" value="${X(e.endpoint)}" spellcheck="false">
        <button type="button" id="mcp-copy-endpoint" class="vs-btn vs-btn-secondary vs-btn-sm shrink-0">Copy URL</button></div>
      <p class="text-xs text-vs-text-tertiary mb-4">Use remote HTTP with a bearer credential. Enter the credential in your client\u2019s secret settings. Keep it out of shared configuration.</p>`:""}
    ${e.demo?"":`<p class="text-xs text-vs-text-tertiary mb-4">${((c=e.qualification)==null?void 0:c.status)==="qualified"?`Client compatibility qualified for ${n(e.qualification.product_version||"this release")}.`:"No qualified client run is recorded for this release. Setup below follows the client\u2019s documented method."}</p>`}
    <div id="mcp-feedback" class="text-sm text-vs-text-secondary mb-4" role="status" aria-live="polite"></div>
    <form id="mcp-create" class="flex flex-col gap-4">
      <fieldset><legend class="text-sm font-medium text-vs-text-secondary mb-2">Choose your AI tool</legend>
        <div class="flex flex-wrap gap-4">${Object.entries($n).map(([d,u])=>`<label class="flex items-center gap-2 text-sm text-vs-text-secondary"><input type="radio" name="client" value="${d}" ${d==="codex"?"checked":""}>${u}</label>`).join("")}</div></fieldset>
      <details id="mcp-connection-options"><summary class="text-sm text-vs-text-secondary cursor-pointer">Connection name, account, and expiry</summary>
      <div class="mt-3 mb-3"><label for="mcp-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Connection name</label>
        <input id="mcp-label" name="label" class="vs-input" maxlength="100" value="${X(Ro("codex",e.site_name))}" autocomplete="off"></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label for="mcp-account" class="block text-sm font-medium text-vs-text-secondary mb-1">Account</label>
          <select id="mcp-account" name="user_id" class="vs-input">${i}</select></div>
        <div><label for="mcp-expiry" class="block text-sm font-medium text-vs-text-secondary mb-1">Expires after</label>
          <select id="mcp-expiry" name="expiry_days" class="vs-input"><option value="7">7 days</option><option value="30" selected>30 days</option><option value="90">90 days</option></select></div>
      </div>
      </details>
      <fieldset class="min-w-0"><legend class="text-sm font-medium text-vs-text-secondary mb-2">Access</legend>
        <div class="flex flex-col gap-3">${Object.entries(lm).map(([d,u])=>`
          <label class="flex items-start gap-3 cursor-pointer"><input type="radio" name="preset" value="${d}" ${d==="edit"?"checked":""} class="mt-1">
            <span><span class="block text-sm font-medium text-vs-text-primary">${d==="read"?"Read the site":d==="edit"?"Edit drafts":"Edit and publish"}</span>
              <span class="block text-xs text-vs-text-tertiary mt-1">${u}</span></span></label>`).join("")}</div>
      </fieldset>
      <p class="text-xs text-vs-text-tertiary">Draft editing allows trusted PHP code. Grant it only to a tool and account you trust with your server.</p>
      <label class="flex items-start gap-3 cursor-pointer"><input id="mcp-live-restore" name="live_restore" type="checkbox" class="mt-1">
        <span class="text-sm text-vs-text-secondary">Also allow restoring the live website
          <span class="block text-xs text-vs-text-tertiary mt-1">Owner accounts only. This can replace the published version while preserving the draft.</span></span></label>
      <details><summary class="text-sm text-vs-text-secondary cursor-pointer">Additional access</summary>
        <p class="text-xs text-vs-text-tertiary mt-2 mb-3">Choose only what this connection needs. Administrative approval still happens separately in Studio.</p>
        <div class="flex flex-col gap-3">${Object.entries(e.access_groups||{}).map(([d,u])=>`
          <label class="flex items-start gap-3 cursor-pointer"><input type="checkbox" name="access_groups" value="${X(d)}" class="mt-1">
            <span class="text-sm text-vs-text-secondary">${n(u.label)}
              <span class="block text-xs text-vs-text-tertiary mt-1">${n(u.description)}</span></span></label>`).join("")}</div>
      </details>
      <div><button type="submit" class="vs-btn vs-btn-primary vs-btn-sm" ${e.demo||!e.endpoint||!e.workspace_ready?"disabled":""}>Create credential</button></div>
    </form>
    <div id="mcp-secret" class="hidden mt-4" role="region" aria-label="New connection credential">
      <p class="text-sm font-medium text-vs-text-primary">Save this credential now</p>
      <p class="text-xs text-vs-text-tertiary mt-1 mb-2">It is shown once. Anyone with this credential has the access you selected.</p>
      <label class="sr-only" for="mcp-secret-value">New credential</label>
      <div class="flex gap-2"><input id="mcp-secret-value" type="password" readonly autocomplete="off" class="vs-input min-w-0" spellcheck="false">
        <button id="mcp-copy-secret" type="button" class="vs-btn vs-btn-secondary vs-btn-sm shrink-0">Copy credential</button></div>
      <div class="flex items-center gap-4 mt-2"><label class="text-xs text-vs-text-secondary"><input id="mcp-show-secret" type="checkbox"> Show credential</label>
        <button id="mcp-dismiss-secret" type="button" class="vs-btn vs-btn-ghost vs-btn-sm">I\u2019ve saved it</button></div>
    </div>
    <section id="mcp-setup" class="mt-6" aria-label="Client setup">
      <h3 class="text-sm font-medium text-vs-text-primary">Add this website to your AI tool</h3>
      <p id="mcp-setup-instructions" class="text-xs text-vs-text-secondary mt-2">${n(Xi("codex",e.endpoint).instructions)}</p>
      <label for="mcp-config" class="block text-xs text-vs-text-secondary mt-3 mb-1">Client configuration</label>
      <textarea id="mcp-config" readonly rows="6" class="vs-input w-full font-mono text-xs" spellcheck="false">${n(Xi("codex",e.endpoint).snippet)}</textarea>
      <div class="flex flex-wrap items-center gap-3 mt-2"><button id="mcp-copy-config" type="button" class="vs-btn vs-btn-secondary vs-btn-sm" ${e.endpoint?"":"disabled"}>Copy configuration</button>
        <a id="mcp-setup-docs" href="https://developers.openai.com/codex/mcp" target="_blank" rel="noopener noreferrer" class="text-xs text-vs-text-secondary underline">Official setup guide</a></div>
      <p class="text-xs text-vs-text-tertiary mt-2">Requires Streamable HTTP with bearer authentication. Copying configuration does not confirm a connection. Open your client, then choose Check result.</p>
      <details class="mt-3"><summary class="text-xs text-vs-text-secondary cursor-pointer">Set the credential without putting it in shell history</summary>
        <p class="text-xs text-vs-text-tertiary mt-2">Use your secret manager to supply VOXELSITE_MCP_TOKEN, or run this in Bash or Zsh, paste the credential at the hidden prompt, and start your client from the same terminal. Never paste the credential into chat.</p>
        <pre class="text-xs whitespace-pre-wrap break-words mt-2">printf 'Credential: '; IFS= read -r -s VOXELSITE_MCP_TOKEN; printf '\\n'; export VOXELSITE_MCP_TOKEN</pre></details>
    </section>
    <section class="mt-6" aria-label="First useful task"><h3 class="text-sm font-medium text-vs-text-primary">Try your first task</h3>
      <p id="mcp-first-task" class="text-sm text-vs-text-secondary mt-2">${Tr}</p>
      <button id="mcp-copy-task" type="button" class="vs-btn vs-btn-secondary vs-btn-sm mt-2">Copy first task</button></section>
    <div class="mt-6"><h3 class="text-sm font-medium text-vs-text-primary">Your connections</h3>
      ${r?`<ul>${r}</ul>`:'<p class="text-sm text-vs-text-tertiary mt-2">Create a credential, then add this website in your AI tool.</p>'}${p("mcp")}</div>
    ${(e.pending_secrets||[]).length?`<section class="mt-6" aria-label="Credentials ready to save">
      <h3 class="text-sm font-medium text-vs-text-primary">Credentials ready to save</h3>
      <p class="text-xs text-vs-text-tertiary mt-2">These were created from requests you approved. Claim and save each credential once within 15 minutes. If a response is lost, revoke that credential and create a replacement.</p>
      <ul>${e.pending_secrets.map(d=>`<li class="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-vs-border-subtle">
        <span class="text-sm text-vs-text-secondary break-words">${n(d.label)} \xB7 ${d.audience==="rest"?"REST API":"Studio MCP"}</span>
        <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-reveal="${X(d.plan_id)}">Claim credential</button>
      </li>`).join("")}</ul></section>`:""}
    ${l.length?`<section class="mt-6" aria-labelledby="rest-migration-heading"><h3 id="rest-migration-heading" class="text-sm font-medium text-vs-text-primary">Connect existing REST keys to an account</h3>
      <p class="text-xs text-vs-text-tertiary mt-2">These REST keys could not be connected automatically. Choose an account before they can read, edit or publish. Their API audience and granted scopes stay the same.</p>
      ${l.map(d=>`<div class="flex flex-wrap items-center gap-2 mt-3"><span class="text-sm text-vs-text-secondary">${n(d.label)}</span>
        <label class="sr-only" for="mcp-rest-${Number(d.id)}">Account for ${n(d.label)}</label>
        <select class="vs-input" id="mcp-rest-${Number(d.id)}">${i}</select>
        <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-bind="${Number(d.id)}">Connect account</button></div>`).join("")}</section>`:""}
    ${p("rest")}
    ${(e.approvals||[]).length?`<section class="mt-6" aria-label="Administrative approvals">
      <h3 class="text-sm font-medium text-vs-text-primary">Requests for your approval</h3>
      <p class="text-xs text-vs-text-tertiary mt-2">Review the exact effects below. Approval lasts five minutes and applies only to this connection and operation. The connection must then apply it.</p>
      <ul class="mt-3">${e.approvals.map(d=>`<li class="py-4 border-b border-vs-border-subtle">
        <p class="text-sm font-medium text-vs-text-primary break-words">${n(d.review.summary)}</p>
        <p class="text-xs text-vs-text-tertiary mt-1">${n(d.requested_by.connection_name)} \xB7 ${d.status==="approved"?"Approved; waiting for application":"Awaiting your review"}</p>
        <ul class="list-disc pl-5 text-sm text-vs-text-secondary mt-2">${d.review.effects.map(u=>`<li>${n(u)}</li>`).join("")}</ul>
        <p class="text-xs text-vs-text-tertiary mt-2">Preserved: ${d.review.preserved.map(n).join(", ")}.</p>
        ${(d.review.files||[]).length?`<details class="text-xs text-vs-text-secondary mt-2"><summary class="cursor-pointer">Exact file changes (${d.review.files.length})</summary>
          <ul class="max-h-64 overflow-auto mt-2">${d.review.files.map(u=>`<li class="py-1 break-all">${n(u.effect)} \xB7 ${n(u.path)}
            <span class="block text-vs-text-ghost">${n(u.before_hash||"absent")} \u2192 ${n(u.after_hash||"absent")}</span></li>`).join("")}</ul></details>`:""}
        ${(d.review.tables||[]).length?`<p class="text-xs text-vs-text-secondary mt-2">Records to clear: ${d.review.tables.map(u=>`${n(u.name)} (${Number(u.rows)})`).join(", ")}.</p>`:""}
        ${d.review.final_boundary?`<p class="text-sm text-vs-text-secondary mt-2">${n(d.review.final_boundary)}</p>`:""}
        ${d.review.secret_fields.length?`<p class="text-xs text-vs-text-tertiary mt-2">Write-only fields: ${d.review.secret_fields.map(n).join(", ")}. Their values remain hidden.</p>`:""}
        <details class="text-xs text-vs-text-tertiary mt-2"><summary class="cursor-pointer">Review identity</summary>
          <p class="break-all mt-1">${n(d.operation_id)}<br>${n(d.digest)}</p></details>
        <div class="flex flex-wrap gap-2 mt-3">
          <button type="button" class="vs-btn vs-btn-primary vs-btn-sm" data-mcp-approve="${X(d.plan_id)}" data-digest="${X(d.digest)}">Approve exact changes</button>
          <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-mcp-cancel="${X(d.plan_id)}" data-digest="${X(d.digest)}">Decline</button>
        </div></li>`).join("")}</ul></section>`:""}
  `}async function Zi(e,{api:t,user:s,clipboard:n=navigator.clipboard,page:o={},client:i="codex",operation:a=ye,pending:r=Xe}){var C,j;if(!e)return;if((s==null?void 0:s.role)!=="owner"){e.innerHTML='<h2 class="vs-settings-card-title">Connect your AI tool</h2><p class="vs-settings-card-subtitle">Ask the site owner to create a connection for your account.</p>';return}let l=new URLSearchParams(o).toString(),p;try{p=await t.get(`/settings/mcp${l?`?${l}`:""}`)}catch{p={ok:!1}}if(!e.isConnected)return;if(!p.ok){let B=e.querySelector("#mcp-feedback");if(B){B.textContent="Could not check the result. Last known states are still shown. Choose Check result to try again.",B.classList.add("text-vs-error");return}e.innerHTML='<h2 class="vs-settings-card-title">Connect your AI tool</h2><p class="text-sm text-vs-error" role="alert">Connections could not be loaded.</p><button id="mcp-load-retry" type="button" class="vs-btn vs-btn-secondary vs-btn-sm mt-3">Check result</button>',e.querySelector("#mcp-load-retry").addEventListener("click",()=>Zi(e,{api:t,user:s,clipboard:n,page:o,client:i,operation:a,pending:r}));return}let c=p.data;e.innerHTML=cm(c,s.id,o);let d=!1,u=Object.hasOwn($n,i)?i:"codex",v=B=>Zi(e,{api:t,user:s,clipboard:n,page:B||{},client:u,operation:a,pending:r});e.querySelectorAll("[data-mcp-page]").forEach(B=>B.addEventListener("click",()=>{if(h){f("Save the credential and choose \u201CI\u2019ve saved it\u201D before leaving this result.");return}let P=B.dataset.mcpPage;w({...o,[`${P}_offset`]:B.dataset.offset,[`${P}_version`]:c.pages[P].inventory_version})}));let f=(B,P=!1)=>{let H=e.querySelector("#mcp-feedback");H.textContent=B,H.classList.toggle("text-vs-error",P)},b=async(B,P)=>{try{await n.writeText(B),f(`${P} copied.`)}catch{f("Copy is unavailable. Select the field and copy it manually.",!0)}},h="",g=()=>{h="",e.querySelector("#mcp-secret-value").value="",e.querySelector("#mcp-secret").classList.add("hidden")},m=B=>{h=B.key;let P=e.querySelector("#mcp-secret-value");P.value=h,P.type="password",e.querySelector("#mcp-show-secret").checked=!1,e.querySelector("#mcp-secret").classList.remove("hidden"),e.querySelector("#mcp-create").querySelector('[type="submit"]').disabled=!0,P.focus()},x=async(B,P,H,U=!0)=>{var ee,pe;if(c.demo)return f("Demo mode \u2014 changing connections is disabled."),null;if(d)return null;if(h)return f("Save the credential and choose \u201CI\u2019ve saved it\u201D before changing connection access."),null;d=!0,B.disabled=!0;try{let fe=await P();return fe.ok?(U&&(await v(),(pe=e.querySelector(B.id==="mcp-toggle"?"#mcp-toggle":"#mcp-check-result"))==null||pe.focus()),f(H),fe.data):(f(((ee=fe.error)==null?void 0:ee.message)||"The connection could not be updated.",!0),null)}catch{return f("The request could not finish. Reload Settings to check its result.",!0),null}finally{d=!1,B.isConnected&&(B.disabled=!1)}};(C=e.querySelector("#mcp-toggle"))==null||C.addEventListener("click",B=>x(B.currentTarget,()=>a("/settings/mcp",r("/settings/mcp")||{enabled:!c.enabled,version:c.version}),"Connection access updated.")),(j=e.querySelector("#mcp-copy-endpoint"))==null||j.addEventListener("click",()=>b(c.endpoint,"Endpoint"));let w=async(B=o)=>{var P;if(!d){if(h){f("Save the credential and choose \u201CI\u2019ve saved it\u201D before checking the result.");return}d=!0;try{await v(B),(P=e.querySelector("#mcp-check-result"))==null||P.focus()}finally{d=!1}}};e.querySelector("#mcp-check-result").addEventListener("click",()=>w());let E=()=>{let B=Xi(u,c.endpoint);e.querySelector("#mcp-config").value=B.snippet,e.querySelector("#mcp-setup-instructions").textContent=B.instructions;let P=e.querySelector("#mcp-setup-docs");P.href=B.url||"#mcp-setup",P.classList.toggle("hidden",!B.url),e.querySelectorAll('[name="client"]').forEach(H=>{H.checked=H.value===u})},k=Ro("codex",c.site_name),$=B=>{let P=e.querySelector("#mcp-label");(!P.value.trim()||P.value===k)&&(P.value=Ro(B,c.site_name)),k=Ro(B,c.site_name),u=B,E()};e.querySelectorAll('[name="client"]').forEach(B=>B.addEventListener("change",()=>{B.checked&&$(B.value)})),$(u),e.querySelector("#mcp-copy-config").addEventListener("click",()=>b(Xi(u,c.endpoint).snippet,"Configuration")),e.querySelector("#mcp-copy-task").addEventListener("click",()=>b(Tr,"First task")),e.querySelectorAll("[data-mcp-next]").forEach(B=>B.addEventListener("click",()=>{let P=S(B.dataset.connection);switch(B.dataset.mcpNext){case"setup":$(Zd(P==null?void 0:P.client_name)),e.querySelector("#mcp-config").focus();break;case"replace":$(Zd(P==null?void 0:P.client_name)),e.querySelector("#mcp-create").querySelector('[type="submit"]').focus();break;case"account":e.querySelector("#mcp-connection-options").open=!0,e.querySelector("#mcp-account").focus();break;case"enable":return e.querySelector("#mcp-toggle").click();case"permissions":{let H=e.querySelector(`#mcp-permissions-${Number(B.dataset.connection)}`);H.open=!0,H.querySelector("summary").focus();break}case"task":return b(Tr,"First task");default:return w()}}));function S(B){return(c.connections||[]).find(P=>String(P.id)===B)}e.querySelector("#mcp-copy-secret").addEventListener("click",()=>{h&&b(h,"Credential")}),e.querySelector("#mcp-show-secret").addEventListener("change",B=>{e.querySelector("#mcp-secret-value").type=B.target.checked?"text":"password"}),e.querySelector("#mcp-dismiss-secret").addEventListener("click",async()=>{var B;g(),await v(),(B=e.querySelector("#mcp-check-result"))==null||B.focus()});let _=()=>{var H;let B=(H=c.accounts.find(U=>Number(U.id)===Number(e.querySelector("#mcp-account").value)))==null?void 0:H.role,P=e.querySelector("#mcp-live-restore");P.disabled=B!=="owner",P.disabled&&(P.checked=!1),e.querySelectorAll('[name="preset"]').forEach(U=>{U.disabled=B==="viewer"&&U.value!=="read"}),e.querySelectorAll('[name="access_groups"]').forEach(U=>{var ee,pe;U.disabled=!(((pe=(ee=c.access_groups)==null?void 0:ee[U.value])==null?void 0:pe.roles)||[]).includes(B),U.disabled&&(U.checked=!1)}),B==="viewer"&&(e.querySelector('[name="preset"][value="read"]').checked=!0)};e.querySelector("#mcp-account").addEventListener("change",_),_();let q=!1,K=!1,O="/settings/mcp/connections",W=e.querySelector("#mcp-create"),G=W.querySelector('[type="submit"]'),J=()=>e.isConnected&&e.querySelector("#mcp-create")===W;r(O)&&(G.textContent="Retry creation",f("A creation result is still unknown. Retry creation to check the same request before starting another."));let T=async(B,P=null)=>{var H;P&&(P.disabled=!0);try{let U=await t.post(`/settings/mcp/approvals/${encodeURIComponent(B)}/reveal`,{});if(!J())return;if(!U.ok||typeof((H=U.data)==null?void 0:H.key)!="string"||!U.data.key){f("The credential cannot be shown again. Check result, revoke that credential, and create a replacement.",!0),G.disabled=!0,e.querySelector("#mcp-check-result").focus();return}m(U.data),f("Save this credential once, then follow the client setup below. Waiting for an authenticated request."),P&&(P.textContent="Revealed")}catch{if(!J())return;f("The credential response was not received. Check result before retrying. If it is no longer ready to save, revoke it and create a replacement.",!0),G.disabled=!0,e.querySelector("#mcp-check-result").focus()}};W.addEventListener("submit",async B=>{var fe,Oe;if(B.preventDefault(),c.demo){f("Demo mode \u2014 creating credentials is disabled.");return}let P=B.currentTarget;if(d||q||K||h||!c.endpoint||!c.workspace_ready)return;let H=r(O);if(!H&&!P.reportValidity())return;q=!0,d=!0,G.disabled=!0,g();let U=new FormData(P),ee=H||{user_id:Number(U.get("user_id")),preset:U.get("preset"),label:(U.get("label")||"").trim()||Ro(u,c.site_name),client_name:$n[u],expiry_days:Number(U.get("expiry_days")),live_restore:U.get("live_restore")==="on",access_groups:U.getAll("access_groups")},pe=!1;try{let Je=await a(O,ee);if(!J())return;if(!Je.ok){f(((fe=Je.error)==null?void 0:fe.message)||"Creation could not finish. Retry the same request to check its result.",!0);return}if(pe=!0,K=!0,!((Oe=Je.data)!=null&&Oe.plan_id)){f("Creation was acknowledged. Check result to find the credential ready to save.",!0);return}await T(Je.data.plan_id)}catch{J()&&f("The creation result was not received. Retry creation to check the same request; do not create a second credential.",!0)}finally{q=!1,d=!1,J()&&(G.disabled=pe,!pe&&r(O)&&(G.textContent="Retry creation"))}}),e.querySelectorAll("[data-mcp-reveal]").forEach(B=>B.addEventListener("click",async()=>{if(c.demo){f("Demo mode \u2014 no real credential exists.");return}if(!(B.disabled||d||q||h)){d=!0,g();try{await T(B.dataset.mcpReveal,B)}finally{d=!1}}})),e.querySelectorAll("[data-mcp-revoke]").forEach(B=>B.addEventListener("click",()=>x(B,()=>{var H;let P=`/settings/mcp/connections/${B.dataset.mcpRevoke}`;return a(P,r(P,"delete")||{version:(H=c.connections.find(U=>String(U.id)===B.dataset.mcpRevoke))==null?void 0:H.version},"delete")},"Connection revoked.")));for(let B of["approve","cancel"])e.querySelectorAll(`[data-mcp-${B}]`).forEach(P=>P.addEventListener("click",()=>x(P,()=>t.post(`/settings/mcp/approvals/${P.dataset[B==="approve"?"mcpApprove":"mcpCancel"]}/${B}`,{digest:P.dataset.digest}),B==="approve"?"Exact changes approved for five minutes.":"Request declined.")));e.querySelectorAll("[data-mcp-bind]").forEach(B=>B.addEventListener("click",()=>x(B,()=>{var P;return a("/settings/mcp/rest-bind",r("/settings/mcp/rest-bind")||{credential_id:Number(B.dataset.mcpBind),version:(P=c.rest_connections.find(H=>String(H.id)===B.dataset.mcpBind))==null?void 0:P.version,user_id:Number(e.querySelector(`#mcp-rest-${B.dataset.mcpBind}`).value)})},"REST account connected.")))}function pm(e,t,s=globalThis.sessionStorage){let n=jt(`vs_owner_recovery:${t}`),o={};try{o=JSON.parse(s.getItem(n)||"{}")}catch{}let i=()=>{try{s.setItem(n,JSON.stringify(o))}catch{}};return{pending:()=>({...o}),async review(a){let r=await e.post(`/settings/recovery/${encodeURIComponent(a)}/review`,{});return r.ok&&(o[a]=r.data,i()),r},async restore(a){let r=o[a];if(!r)return{ok:!1,error:{message:"Review the affected state before restoring it."}};let l=await e.post(`/settings/recovery/${encodeURIComponent(a)}/restore`,{review_id:r.review_id,digest:r.digest});return l.ok&&["failed_restored","succeeded"].includes(l.data.status)&&(delete o[a],i()),l}}}function um(e,t={}){let s=new Map(e.map(n=>[n.recovery_id,n]));for(let[n,o]of Object.entries(t))s.has(n)||s.set(n,o);return`<h2 class="vs-settings-card-title">Interrupted changes</h2>
    <p class="vs-settings-card-subtitle">Review changes that stopped before completion. Restore their original affected files even when the requesting connection has been revoked.</p>
    <div id="recovery-feedback" class="text-sm text-vs-text-secondary mb-3" role="status" aria-live="polite" tabindex="-1"></div>
    ${s.size?`<ul>${[...s.values()].map(n=>{let o=n.recovery_id,i=t[o],a=n.original_actor||{},r=(i||n).action==="acknowledge_delivery";return`<li class="py-4 border-b border-vs-border-subtle">
        <p class="text-sm font-medium text-vs-text-primary break-words">${X(n.kind)}</p>
        <p class="text-xs text-vs-text-tertiary mt-1 break-words">${X(a.client_name||`Account ${a.user_id}`)} \xB7 ${X(n.operation_id)}</p>
        ${n.diagnostic?`<p class="text-sm text-vs-error mt-2">${X(n.diagnostic)}</p>`:""}
        ${i?`<div class="mt-3">
          <p class="text-sm text-vs-text-secondary">${r?"Acknowledge the retained email outcome. This does not send again or confirm delivery.":"Restore the exact original files below. This will not resume the interrupted request."}</p>
          ${i.delivery_intent?`<p class="text-sm text-vs-text-secondary mt-2">${X(i.delivery_intent.recipient)} \xB7 ${X(i.delivery_intent.delivery_status)}</p>`:""}
          <details class="text-xs text-vs-text-secondary mt-2" open><summary class="cursor-pointer">Affected paths (${i.paths.length})</summary>
            ${i.paths.length?`<ul class="max-h-64 overflow-auto mt-2">${i.paths.map(l=>`<li class="py-2 break-all">
              ${X(l.domain)}/${X(l.path)} \xB7 ${X(l.state)}
              <span class="block text-vs-text-tertiary">Current: ${X(l.current_hash||"absent")}</span>
              <span class="block text-vs-text-tertiary">Restore: ${X(l.before_hash||"absent")}</span>
            </li>`).join("")}</ul>`:'<p class="mt-2">No website files are replaced. Only the retained operation or private capture state is resolved.</p>'}
          </details>
          <button type="button" class="vs-btn vs-btn-primary vs-btn-sm mt-3" data-recovery-restore="${X(o)}">${r?"Acknowledge email outcome":"Restore original state"}</button>
        </div>`:""}
        <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm mt-3" data-recovery-review="${X(o)}" ${n.eligible?"":"disabled"}>${i?"Review current state again":"Review recovery"}</button>
      </li>`}).join("")}</ul>`:'<p class="text-sm text-vs-text-secondary">No retained changes need recovery.</p>'}`}async function Ir(e,{api:t,user:s,client:n=null}){var a;if(!e)return!1;if((s==null?void 0:s.role)!=="owner")return e.hidden=!0,!1;n||(n=pm(t,s.id));let o=await t.get("/settings/recovery");if(!e.isConnected)return!1;if(!o.ok)return e.innerHTML=`<h2 class="vs-settings-card-title">Interrupted changes</h2>
      <div id="recovery-feedback" class="text-sm text-vs-text-secondary mb-3" role="status" aria-live="polite" tabindex="-1"></div>
      <p class="text-sm text-vs-error" role="alert">${X(((a=o.error)==null?void 0:a.message)||"Recovery could not be loaded.")} Reload Settings to refresh the recovery list.</p>`,!1;e.innerHTML=um(o.data.items,n.pending());let i=(r,l=!1)=>{let p=e.querySelector("#recovery-feedback");!e.isConnected||!p||(p.textContent=r,p.classList.toggle("text-vs-error",l))};for(let r of e.querySelectorAll("[data-recovery-review], [data-recovery-restore]"))r.addEventListener("click",async()=>{var p,c,d,u,v,f;if((c=(p=globalThis.window)==null?void 0:p.demoGuard)!=null&&c.call(p))return;let l=document.activeElement;r.disabled=!0;try{let b=r.dataset.recoveryReview||r.dataset.recoveryRestore,h=r.dataset.recoveryReview?await n.review(b):await n.restore(b);if(!h.ok){i(((d=h.error)==null?void 0:d.message)||"The request could not finish. Retry the same review to check its result.",!0);return}let g=await Ir(e,{api:t,user:s,client:n});if(!e.isConnected)return;let m=!document.activeElement||document.activeElement===document.body||document.activeElement===l;if(r.dataset.recoveryRestore){let x=["failed_restored","succeeded"].includes(h.data.status);i(h.data.acknowledged?"Email outcome acknowledged. No message was resent.":x?"Original affected state restored. The interrupted request will not resume.":"Recovery still needs attention. Conflicting files were preserved; review the current state again.",!x),m&&((u=e.querySelector("#recovery-feedback"))==null||u.focus())}else m&&(g?(v=[...e.querySelectorAll("[data-recovery-restore]")].find(x=>x.dataset.recoveryRestore===b))==null||v.focus():(i("Recovery review saved. Reload Settings to continue from this review."),(f=e.querySelector("#recovery-feedback"))==null||f.focus()))}catch{i("The response was lost. Retry this retained review to check its result.",!0)}finally{r.isConnected&&(r.disabled=!1)}});return!0}async function Qd(e,t,s,n){var r;let o=`vs_reset_review:${e}`,i;try{i=JSON.parse(s.getItem(o)||"null")}catch{}if(i!=null&&i.plan_id)return t.get(`/site/reset?plan_id=${encodeURIComponent(i.plan_id)}`);if(!i){let l=await t.get("/site/reset");if(!l.ok)return l;if(n()!==e)return{ok:!1,error:{code:"permission_denied",message:"The signed-in account changed. Open the review again."}};i={operation_id:`reset_${crypto.randomUUID().replaceAll("-","")}`,base_draft_version:l.data.draft_version};try{s.setItem(o,JSON.stringify(i))}catch{}}let a=await t.post("/site/reset/prepare",i);if(a.ok)try{s.setItem(o,JSON.stringify({plan_id:a.data.plan_id}))}catch{}else if(["content_conflict","review_expired","invalid_schema"].includes((r=a.error)==null?void 0:r.code))try{s.removeItem(o)}catch{}return a}async function ec(e,t,s){var r,l,p;let n={plan_id:e.plan_id,digest:e.digest,confirm:"RESET"},o=await t("/site/reset",n);if(!o.ok&&((r=o.error)==null?void 0:r.code)==="network_error"&&(o=await s(`/site/reset?operation_id=${encodeURIComponent(e.operation_id)}`)),!o.ok)return o;let i=o.data,a=0;for(;["prepared","applying"].includes(i.status);){if(i.kind!=="site.reset"||i.operation_id!==e.operation_id||++a>100)return{ok:!1,error:{code:"recovery_required",message:"Inspect the retained reset operation in Connections before continuing."}};let c=i.checkpoint;if(o=await t("/site/reset/continue",{operation_id:i.operation_id,checkpoint:c}),!o.ok&&["network_error","content_conflict"].includes((l=o.error)==null?void 0:l.code)&&(o=await s(`/site/reset?operation_id=${encodeURIComponent(e.operation_id)}`)),!o.ok)return o;if(i=o.data,i.status==="applying"&&i.checkpoint<=c)return{ok:!1,data:i,error:{code:"site_busy",message:"The reset worker is still active. Retry to read its retained result."}}}return i.status!=="succeeded"?{ok:!1,data:i,error:((p=i.result)==null?void 0:p.error)||{code:"recovery_required",message:"The reset needs review in Connections."}}:{ok:!0,data:i}}function tc({api:e,runtime:t,ownerId:s,currentOwner:n,storage:o=globalThis.sessionStorage,crypto:i=globalThis.crypto}){let a=jt(`vs-reviewed-update:${s}`),r={},l=!1;try{r=JSON.parse((o==null?void 0:o.getItem(a))||"{}")}catch{}let p=()=>{if(n()!==s)throw new Error("The Studio account changed. Reopen Updates from the current account.")},c=()=>{p(),o==null||o.setItem(a,JSON.stringify(r))},d=async(g,m,x=!1)=>{var E,k;p();let w=await(x?t(m):e.post(g,m));if(p(),!(w!=null&&w.ok)){let $=new Error(((E=w==null?void 0:w.error)==null?void 0:E.message)||"The update request was not acknowledged. Retry the same step.");throw $.code=(k=w==null?void 0:w.error)==null?void 0:k.code,$}return w.data},u=async g=>{if(p(),l)throw new Error("Wait for the current update request.");l=!0;try{return await g()}finally{l=!1}},v=()=>{if(!(i!=null&&i.randomUUID))throw new Error("Secure request identities are unavailable in this browser.");return i.randomUUID()},f=g=>{if(r.source&&JSON.stringify(r.source)!==JSON.stringify(g))throw new Error("Finish the retained update or clear its completed review before selecting another package.");r.source||(r={source:g,request_id:v(),operation_id:v()},c())},b=async g=>{if(!(i!=null&&i.subtle))throw new Error("This browser cannot verify update upload hashes.");return[...new Uint8Array(await i.subtle.digest("SHA-256",g))].map(m=>m.toString(16).padStart(2,"0")).join("")},h=g=>{let m="";for(let x=0;x<g.length;x+=8192)m+=String.fromCharCode(...g.subarray(x,x+8192));return btoa(m)};return{state:()=>(p(),structuredClone(r)),stageLocal:g=>u(async()=>(f({kind:"local",filename:g}),r.package=await d("/update/apply-local",{request_id:r.request_id,filename:g}),c(),r.package)),stageGit:()=>u(async()=>(f({kind:"git"}),r.package=await d("/update/git-update",{request_id:r.request_id}),c(),r.package)),stageFile:g=>u(async()=>{if(g.size<1||g.size>134217728||!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,119}\.zip$/.test(g.name))throw new Error("Choose a ZIP package with a simple filename, up to 128 MiB.");let m=new Uint8Array(await g.arrayBuffer());p();let x=await b(m);p(),f({kind:"upload",filename:g.name,bytes:m.length,sha256:x}),r.package=await d("/update/package-begin",{request_id:r.request_id,filename:g.name,bytes:m.length,sha256:x}),c();for(let w=r.package.received_bytes;w<m.length;){let E=m.subarray(w,Math.min(w+262144,m.length)),k={package_id:r.package.package_id,request_id:`${r.request_id}_${w}`,offset:w,data_base64:h(E),sha256:await b(E)};if(r.package=await d("/update/package-chunk",k),c(),r.package.received_bytes<=w)throw new Error("The server did not acknowledge this upload chunk.");w=r.package.received_bytes}return r.package}),validate:()=>u(async()=>(r.package=await d("/update/package-finish",{package_id:r.package.package_id,expected_index:r.package.next_index}),c(),r.package)),review:()=>u(async()=>(r.review=await d("/update/prepare",{package_id:r.package.package_id,operation_id:r.operation_id}),c(),r.review)),approve:()=>u(async()=>{let g={plan_id:r.review.plan_id,digest:r.review.digest};if(r.activationRequested)try{return r.operation=await d(null,{action:"status",operation_id:r.operation_id},!0),c(),r.operation}catch{p()}return r.approved||(r.review=await d("/update/approve",g),r.approved=!0,c()),r.activationRequested=!0,c(),r.operation=await d("/update/apply",g),c(),r.operation}),status:()=>u(async()=>(r.operation=await d(null,{action:"status",operation_id:r.operation_id},!0),c(),r.operation)),continue:()=>u(async()=>(r.operation=await d(null,{action:"continue",operation_id:r.operation_id,checkpoint:r.operation.checkpoint},!0),c(),r.operation)),clear:()=>{var g;if(p(),r.activationRequested&&!["succeeded","failed_restored","expired","cancelled"].includes((g=r.operation)==null?void 0:g.status))throw new Error("Read and finish or recover the retained operation before clearing it.");r={},o==null||o.removeItem(a)}}}async function sc(){var v,f,b;let e=document.getElementById("vs-update-zone");if(!e)return;let t=(v=D.get("user"))==null?void 0:v.id;if(((f=D.get("user"))==null?void 0:f.role)!=="owner"){e.textContent="A current owner account is required to review system updates.";return}let s=document.createElement("div");s.className="mt-4 min-w-0 break-words",s.setAttribute("aria-live","polite"),s.tabIndex=-1,e.after(s);let n=Ce("update-runtime.php"),o=tc({api:Y,ownerId:t,currentOwner:()=>{var h;return(h=D.get("user"))==null?void 0:h.id},runtime:async h=>(await fetch(n,{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json","X-VS-Token":D.get("sessionToken")||""},body:JSON.stringify(h)})).json()}),i=(h,g)=>`<button type="button" class="vs-btn vs-btn-primary vs-btn-sm" data-update-action="${h}">${g}</button>`,a=(h="")=>{var x,w,E;if(((x=D.get("user"))==null?void 0:x.id)!==t){s.replaceChildren();return}let g=o.state(),m="";if(g.operation){let k=g.operation;m=`<p><strong>${y(k.status==="succeeded"?`Updated to v${k.result.to_version}`:`Update: ${k.status.replaceAll("_"," ")}`)}</strong></p><p class="text-sm">Operation ${y(k.operation_id)} \xB7 checkpoint ${k.checkpoint}</p>`,k.status==="applying"||k.status==="prepared"?m+=i("continue","Continue update")+" "+i("status","Refresh status"):(k.status==="succeeded"||k.status==="failed_restored")&&(m+=i("reload","Reload Studio")),k.status==="recovery_required"&&(m+=`<p>${y(((E=(w=k.result)==null?void 0:w.error)==null?void 0:E.message)||"The retained update needs owner recovery.")}</p><a class="vs-btn vs-btn-ghost vs-btn-sm" href="${y(n)}">Open update recovery</a>`)}else if(g.activationRequested)m="<p>The activation response was not acknowledged. Read its retained status before another step.</p>"+i("approve","Check activation");else if(g.review){let k=g.review.review;m=`<p><strong>${y(k.summary)}</strong></p><ul>${k.effects.map($=>`<li>${y($)}</li>`).join("")}</ul><p class="text-sm">${y(k.final_boundary)}</p><details class="my-3"><summary>Review exact affected files (${k.files.length})</summary><div class="max-h-64 overflow-auto"><table><thead><tr><th>File</th><th>Before \u2192 after</th></tr></thead><tbody>${k.files.map($=>`<tr><td>${y($.path)}</td><td><code>${y($.before_hash||"absent")} \u2192 ${y($.after_hash||"absent")}</code></td></tr>`).join("")}</tbody></table></div></details><p class="text-xs break-all">Review digest: ${y(g.review.digest)}</p>${i("approve",g.approved?"Start approved update":"Approve and start update")}`}else if(g.package){let k=g.package;m=`<p><strong>${y(k.filename)}</strong> \xB7 ${y(k.status)}</p><p class="text-sm">${k.next_index} of ${k.total_files||"?"} files validated. Website and private data remain preserved.</p>`+(k.status==="staged"?i("review","Review exact update"):i("validate","Continue package validation"))}g.source&&!g.activationRequested&&(m+=" "+i("clear","Choose another package")),s.innerHTML=(h?`<p role="alert" class="text-vs-error">${y(h)}</p>`:"")+m},r=async h=>{var x,w;if((x=window.demoGuard)!=null&&x.call(window))return;let g=document.activeElement,m=(w=g==null?void 0:g.dataset)==null?void 0:w.updateAction;s.querySelectorAll("button").forEach(E=>{E.disabled=!0});try{await h(),a()}catch(E){a(E.message||"The update request was not acknowledged.")}if(s.isConnected&&(!document.activeElement||document.activeElement===document.body||document.activeElement===g)){let E=[...s.querySelectorAll("button:not([disabled]),a[href]")];(E.find(k=>k.dataset.updateAction===m)||E[0]||e).focus()}};s.addEventListener("click",h=>{var m;let g=(m=h.target.closest("[data-update-action]"))==null?void 0:m.dataset.updateAction;if(g){if(g==="reload"){location.reload();return}r(()=>o[g]())}});let l=document.getElementById("vs-update-file");e.tabIndex=0,e.setAttribute("role","button"),e.setAttribute("aria-label","Choose an update ZIP package"),e.addEventListener("keydown",h=>{var g;h.target===e&&(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),(g=window.demoGuard)!=null&&g.call(window)||l==null||l.click())}),e.addEventListener("click",h=>{var g;h.target.closest("button,a")||(g=window.demoGuard)!=null&&g.call(window)||l.click()}),l==null||l.addEventListener("change",()=>{var g;let h=(g=l.files)==null?void 0:g[0];l.value="",h&&r(()=>o.stageFile(h))}),e.addEventListener("dragover",h=>h.preventDefault()),e.addEventListener("drop",h=>{var m,x;h.preventDefault();let g=(x=(m=h.dataTransfer)==null?void 0:m.files)==null?void 0:x[0];g&&r(()=>o.stageFile(g))}),a();let[p,c]=await Promise.all([Y.get("/update/inspect"),Y.get("/update/dist-packages")]);if(((b=D.get("user"))==null?void 0:b.id)!==t)return;let d=document.getElementById("vs-git-update-card");d&&p.ok&&p.data.git_supported&&(d.innerHTML='<div class="vs-settings-card"><h2 class="vs-settings-card-title">Git updates</h2><p class="vs-settings-card-subtitle">Fetch and stage the exact upstream revision for review. Activation preserves website and private files.</p><button type="button" class="vs-btn vs-btn-primary vs-btn-sm">Prepare Git update</button></div>',d.querySelector("button").addEventListener("click",()=>r(()=>o.stageGit())));let u=document.getElementById("vs-dist-packages");u&&c.ok&&(u.innerHTML=c.data.packages.map(h=>`<div class="flex items-center justify-between gap-3 py-2"><span>${y(h.filename)} \xB7 v${y(h.version)}</span><button type="button" class="vs-btn vs-btn-primary vs-btn-sm" data-package="${y(h.filename)}">Prepare review</button></div>`).join("")+'<button type="button" class="vs-btn vs-btn-ghost vs-btn-sm" data-cleanup>Clean expired staging</button>',u.addEventListener("click",h=>{var m;let g=(m=h.target.closest("[data-package]"))==null?void 0:m.dataset.package;g&&r(()=>o.stageLocal(g)),h.target.closest("[data-cleanup]")&&r(async()=>{let x=await Y.post("/update/cleanup",{});if(!x.ok)throw new Error(x.error.message)})})),p.ok&&!p.data.runtime_supported&&a(p.data.message)}var Mr=jt("vs_factory_completion_v1"),Ms=e=>String(e??"").replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]),nc=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),e=>e.toString(16).padStart(2,"0")).join(""),Ar=e=>["succeeded","failed_restored"].includes(e);function vm({api:e,endpoint:t,storage:s=sessionStorage,request:n=fetch}){let o=()=>{try{return JSON.parse(s.getItem(Mr)||"null")}catch{return null}},i=l=>(s.setItem(Mr,JSON.stringify(l)),l),a=l=>{var p,c;if(!(l!=null&&l.ok)){let d=new Error(((p=l==null?void 0:l.error)==null?void 0:p.message)||"Cleanup has not been verified. Keep this receipt and retry status.");throw d.details=(c=l==null?void 0:l.error)==null?void 0:c.details,d}return l.data},r=async(l,p)=>{let c=o();if(!(c!=null&&c.plan_id)||!(c!=null&&c.token))throw new Error("Import the saved Studio completion receipt.");let d=await n(t+(l==="GET"?`?id=${encodeURIComponent(c.plan_id)}`:""),{method:l,cache:"no-store",credentials:"omit",headers:{"X-VS-Reset-Token":c.token,...l==="POST"?{"Content-Type":"application/json"}:{}},...l==="POST"?{body:JSON.stringify({id:c.plan_id,...p})}:{}}),u=a(await d.json());return i({...c,state:u}),u};return{read:o,importReceipt(l){if(!l||!/^factory_[a-f0-9]{32}$/.test(l.plan_id)||!/^[a-f0-9]{64}$/.test(l.token))throw new Error("Choose a valid completion receipt file.");return i({plan_id:l.plan_id,token:l.token})},async prepare(){var d,u,v;let l=o();if(l!=null&&l.started&&!Ar((d=l.state)==null?void 0:d.status))throw new Error("An installation cleanup is already retained. Open its completion screen.");let p=(l==null?void 0:l.pending)||{operation_id:`factory-${nc().slice(0,32)}`,base_draft_version:a(await e.get("/site/reset-install")).draft_version};i({pending:p});let c;try{c=a(await e.post("/site/reset-install/prepare",p))}catch(f){throw(u=f.details)!=null&&u.plan_id&&((v=f.details)!=null&&v.digest)&&i({pending:p,plan_id:f.details.plan_id,digest:f.details.digest}),f}return i({pending:p,plan_id:c.plan_id,digest:c.digest,plan:c}),c},async start(){var u;let l=o();if(!(l!=null&&l.plan_id)||!(l!=null&&l.digest))throw new Error("Prepare and read the exact installation review first.");let p=i({...l,token:l.token||nc(),started:!0}),c=await e.post("/site/reset-install",{plan_id:p.plan_id,digest:p.digest,confirm:"RESET INSTALLATION",receipt_token:p.token});!(c!=null&&c.ok)&&["review_expired","invalid_schema","permission_denied","content_conflict","site_busy","not_found"].includes((u=c==null?void 0:c.error)==null?void 0:u.code)&&i({...p,started:!1});let d=a(c);return i({...p,state:d}),d},async discard(){let l=o();if(!(l!=null&&l.plan_id)||!l.digest||l.started)throw new Error("Only an unstarted review can be discarded here.");let p;for(let c=0;c<10;c++)if(p=a(await e.post("/site/reset-install/discard",{plan_id:l.plan_id,digest:l.digest})),p.complete){s.removeItem(Mr);break}return p},status:()=>r("GET"),async advance(l="continue",p=10){let c=await r("GET");for(let d=0;d<p&&(!Ar(c.status)||c.maintenance_active)&&!(c.status==="recovery_required"&&l!=="restore"||(c=await r("POST",{action:d===0?l:"continue",checkpoint:c.checkpoint}),c.error_code||c.status==="recovery_required"));d++);return c}}}function mm(e){return`<p>${Ms(e.review.summary)}</p><p>${Ms(e.review.final_boundary)}</p>
    <details><summary>${e.review.files.length} exact file changes</summary><ul>${e.review.files.map(t=>`<li><code>${Ms(t.path)}</code> \u2014 ${Ms(t.effect)}<br><small>Before: ${Ms(t.before_hash||"Reviewed by table digests / absent")}<br>After: ${Ms(t.after_hash||"absent")}</small></li>`).join("")}</ul></details>
    <details><summary>${e.review.tables.length} database tables to remove</summary><ul>${e.review.tables.map(t=>`<li>${Ms(t.name)} \u2014 ${t.rows} rows <code>${Ms(t.sha256)}</code></li>`).join("")}</ul></details>
    <details><summary>Preserved</summary><ul>${e.review.preserved.map(t=>`<li>${Ms(t)}</li>`).join("")}</ul></details>`}async function oc({api:e,completionUrl:t}){var d,u,v,f;let s=vm({api:e,endpoint:t}),n=s.read();if(n!=null&&n.started&&!Ar((d=n.state)==null?void 0:d.status)){window.location.assign(t);return}(u=document.getElementById("reset-install-modal-overlay"))==null||u.remove();let o=document.activeElement,i=document.createElement("div");i.id="reset-install-modal-overlay",i.className="vs-modal-overlay is-visible",i.innerHTML=`<div class="vs-modal" role="dialog" aria-modal="true" aria-labelledby="factory-review-title" style="width:min(680px,calc(100vw - 32px));max-width:680px"><div class="vs-modal-header"><h2 class="vs-modal-title" id="factory-review-title">Review installation removal</h2></div>
    <div class="vs-modal-body" style="max-height:60vh;overflow:auto;overflow-wrap:anywhere"><p id="factory-review-message" role="status">Preparing the exact deletion and preservation sets\u2026</p><div id="factory-review"></div>
    <label class="vs-modal-confirm-label" for="factory-confirm">Type <code>RESET INSTALLATION</code> after reviewing the changes.</label>
    <input id="factory-confirm" class="vs-modal-confirm-input" autocomplete="off" spellcheck="false"></div>
    <div class="vs-modal-footer flex-wrap"><button class="vs-btn vs-btn-secondary" id="factory-close">Cancel</button>
    <button class="vs-btn vs-btn-danger" id="factory-start" disabled>Start reviewed cleanup</button></div></div>`,document.body.appendChild(i);let a=!1,r=()=>{if(a)return;a=!0;let b=!document.activeElement||document.activeElement===document.body||i.contains(document.activeElement);i.remove();let h=o!=null&&o.isConnected?o:o!=null&&o.id?document.getElementById(o.id):null;b&&(h!=null&&h.isConnected)&&h.focus()},l=i.querySelector("#factory-review-message"),p=i.querySelector("#factory-start"),c=i.querySelector("#factory-confirm");i.querySelector("#factory-close").onclick=r,i.querySelector("#factory-close").focus(),i.addEventListener("keydown",b=>{var h;if(b.key==="Escape"&&!((h=s.read())!=null&&h.started)&&(b.preventDefault(),r()),b.key==="Tab"){let g=[...i.querySelectorAll("button:not([disabled]),input:not([disabled]),summary")],m=g[0],x=g.at(-1);b.shiftKey&&document.activeElement===m?(b.preventDefault(),x==null||x.focus()):!b.shiftKey&&document.activeElement===x&&(b.preventDefault(),m==null||m.focus())}});try{let b=await s.prepare();i.querySelector("#factory-review").innerHTML=mm(b),l.textContent=`Review expires ${new Date(b.expires_at*1e3).toLocaleTimeString()}.`,i.querySelector("#factory-close").textContent="Discard review",i.querySelector("#factory-close").onclick=async()=>{try{(await s.discard()).complete?r():l.textContent="More private staging remains. Select Discard review again to finish."}catch(h){l.textContent=h.message}},c.oninput=()=>{p.disabled=b.status!=="ready"||c.value!=="RESET INSTALLATION"},b.status==="expired"&&(l.textContent="This review expired. Discard it before preparing a new one."),p.onclick=async()=>{var h;p.disabled=!0,c.disabled=!0,l.textContent="Retaining the completion receipt and entering maintenance\u2026";try{await s.start(),window.location.assign(t)}catch(g){(h=s.read())!=null&&h.started?(l.textContent=`${g.message} The receipt is saved in this tab. Open completion to inspect the actual status.`,p.textContent="Open completion",p.disabled=!1,p.onclick=()=>window.location.assign(t)):l.textContent=`${g.message} Discard this unstarted review and prepare the current installation.`}}}catch(b){l.textContent=b.message,(v=s.read())!=null&&v.plan_id&&!((f=s.read())!=null&&f.started)&&(i.querySelector("#factory-close").textContent="Discard retained review",i.querySelector("#factory-close").onclick=async()=>{try{(await s.discard()).complete?r():l.textContent="Select Discard retained review again to finish private staging cleanup."}catch(h){l.textContent=h.message}})}}var Do=0,sa={},ea={},ta=null,St=null,Ys=null;async function Sn(e,t="/settings",s="put"){let n=Object.fromEntries(Object.entries(e).filter(([l,p])=>!(typeof p=="string"&&p.startsWith("\u2022\u2022")))),o=Object.keys(ea).filter(l=>ea[l].some(p=>Object.hasOwn(n,p))),i=Xe(t,s),a=(i==null?void 0:i.versions)||Object.fromEntries(o.map(l=>[l,sa[l]])),r=await ye(t,{values:n,versions:a},s,{retainInput:!1,publicInput:{versions:a}});if(r.ok){let l=await Y.get("/settings");l.ok&&(sa=l.data.versions,ea=l.data.group_keys)}return r}function ic(e){return Object.fromEntries(Object.entries(e).filter(([t,s])=>t!=="test_recipient"&&!(t==="smtp_password"&&!s)).map(([t,s])=>["mail."+t.replace(/^smtp_/,"smtp.").replace(/^mailpit_/,"mailpit."),s]))}async function ac(e){var o;let s=Xe("/settings/logs","delete")||{files:e,inventory_version:St==null?void 0:St.inventory_version},n=await ye("/settings/logs",s,"delete");return n.ok||A(((o=n.error)==null?void 0:o.message)||"Could not delete logs.","error"),n.ok&&(Ys=null),n}function pc(){return setTimeout(()=>es(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function es(){var T,C,j,B,P,H,U,ee,pe,fe,Oe,Je,ze,gt,At,R;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,r]=await Promise.all([Y.get("/settings"),Y.get("/settings/system"),Y.get("/settings/mail"),Y.get("/settings/usage"),Y.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),Y.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),Y.get("/settings/logs"+(Ys?`?offset=${Ys.offset}&inventory_version=${encodeURIComponent(Ys.version)}`:""))]);St=r.ok?r.data:null,sa=((T=t.data)==null?void 0:T.versions)||{},ea=((C=t.data)==null?void 0:C.group_keys)||{},ta=((B=(j=t.data)==null?void 0:j.favicon)==null?void 0:B.version)||null;let l=((P=r.data)==null?void 0:P.logs)||[],p=((H=t.data)==null?void 0:H.settings)||{};t.ok&&D.set("aiConfigured",p.ai_configured===!0);let c=((U=s.data)==null?void 0:U.system)||{},d=p.site_favicon||null,u=d?`/${d}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),v=null,f=null;try{i.ok&&((ee=i.data)!=null&&ee.content)&&(v=JSON.parse(i.data.content))}catch{}try{a.ok&&((pe=a.data)!=null&&pe.content)&&(f=JSON.parse(a.data.content))}catch{}let b=v||f,h=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},g=p.available_providers||{},m=((fe=n.data)==null?void 0:fe.config)||{},x=((Oe=n.data)==null?void 0:Oe.presets)||{},w=Object.keys(g),E=p.ai_provider||"claude",$=(g[E]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],S=p[`ai_${E}_model`]||"",_=p[`ai_${E}_api_key_set`]||!1,q=((Je=D.get("user"))==null?void 0:Je.role)==="owner",K=w.map(N=>{let te=g[N];return`<option value="${y(N)}" ${N===E?"selected":""}>${y(te.name)}</option>`}).join(""),O="";for(let N of $)N.key==="api_key"?O+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(N.label)}${N.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${_?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${y(N.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${_?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':N.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${y(N.help_text||"Optional for local servers")}</p>`}
          ${N.help_url?`<a href="${N.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-text-secondary underline mt-1 inline-block">${y(N.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:N.key==="base_url"&&(O+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(N.label)}${N.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${y(p.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${y(N.placeholder)}" />
          ${N.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${y(N.help_text)}</p>`:""}
        </div>`);e.innerHTML=`
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${y(p.site_name||"")}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${y(p.site_tagline||"")}"
            class="vs-input"
            placeholder="A short description of your site" />
        </div>

        <!-- Favicon -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-2">Favicon</label>
          <div class="vs-favicon-zone" id="vs-favicon-zone">
            <div class="vs-favicon-preview" id="vs-favicon-preview">
              <img src="${u}" alt="Current favicon" class="vs-favicon-img" id="vs-favicon-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML = '<div class=\\'vs-favicon-placeholder\\'><svg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'m21 15-5-5L5 21\\'/></svg></div>';" />
            </div>
            <div class="vs-favicon-info">
              <div class="vs-favicon-actions">
                <button type="button" class="vs-btn vs-btn-secondary vs-btn-xs" id="btn-favicon-upload">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                </button>
                ${d?`
                <button type="button" class="vs-btn vs-btn-ghost vs-btn-xs vs-favicon-remove" id="btn-favicon-remove" title="Remove favicon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
                `:""}
              </div>
              <p class="vs-favicon-hint">.ico format \u2014 max 512 KB</p>
              <p class="vs-favicon-hint">Live change: uploads and removals take effect immediately. Publishing and website restores do not change the favicon.</p>
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

    <section id="settings-mcp" class="vs-settings-card" aria-label="AI tool connections">
      <p class="text-sm text-vs-text-tertiary">Loading connections\u2026</p>
    </section>
    <section id="settings-recovery" class="vs-settings-card" aria-label="Interrupted changes">
      <p class="text-sm text-vs-text-tertiary">Loading interrupted changes\u2026</p>
    </section>

    <!-- Card: AI Engine -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Built-in AI ${p.ai_configured?"":'<span class="text-xs font-normal text-vs-text-tertiary">Unconfigured</span>'}</h2>
      <p class="vs-settings-card-subtitle">Choose the provider and default model for creating and editing your site.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-ai-provider" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
          <select id="set-ai-provider" class="vs-input">
            ${K}
          </select>
        </div>

        <div id="settings-config-fields">
          ${O}
        </div>

        <div>
          <label for="set-ai-model" class="block text-sm font-medium text-vs-text-secondary mb-1">Default model</label>
          <select id="set-ai-model" class="vs-input">
            ${S?Ji([],S):'<option value="">Loading models\u2026</option>'}
          </select>
        </div>

        <div>
          <label for="set-max-tokens" class="block text-sm font-medium text-vs-text-secondary mb-1">Max Output Tokens</label>
          <input id="set-max-tokens" type="number" value="${p.ai_max_tokens||32e3}" min="1000" max="128000" step="1"
            class="vs-input" aria-describedby="set-max-tokens-help set-model-budget" />
          <p id="set-max-tokens-help" class="text-xs text-vs-text-ghost mt-1">An output ceiling, not a target. Actual usage can be lower.</p>
          <div id="set-model-budget" class="text-xs text-vs-text-ghost mt-3" role="status" aria-live="polite">Checking model limits\u2026</div>
        </div>

        ${E==="openai_compatible"?`
        <fieldset id="set-model-limits" class="min-w-0">
          <legend class="text-sm font-medium text-vs-text-secondary">Advanced model limits <span class="text-vs-text-ghost font-normal">(optional)</span></legend>
          <p id="set-model-limits-help" class="text-xs text-vs-text-ghost mt-2">${q?"Set both limits for the selected model, or leave both blank to use detected limits.":"Only the site owner can change these limits."} Overrides apply only to this endpoint and exact model ID.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label for="set-model-output-limit" class="block text-sm font-medium text-vs-text-secondary mb-1">Model output limit</label>
              <input id="set-model-output-limit" type="number" min="1" max="2000000" step="1" class="vs-input" ${q?"":"readonly"}
                placeholder="Detected or default" aria-describedby="set-model-limits-help set-model-limits-error" />
            </div>
            <div>
              <label for="set-model-context-window" class="block text-sm font-medium text-vs-text-secondary mb-1">Context window</label>
              <input id="set-model-context-window" type="number" min="1" max="10000000" step="1" class="vs-input" ${q?"":"readonly"}
                placeholder="Detected or default" aria-describedby="set-model-limits-help set-model-limits-error" />
            </div>
          </div>
          <p id="set-model-limits-error" class="text-xs text-vs-error mt-2" role="alert" hidden></p>
        </fieldset>`:""}

        <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
              <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                <input type="checkbox" id="set-evaluator-enabled" ${p.evaluator_enabled?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span class="vs-toggle-track" style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${p.evaluator_enabled?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span class="vs-toggle-thumb" style="
                  position: absolute; left: ${p.evaluator_enabled?"18px":"2px"}; top: 2px;
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

        <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
              <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                <input type="checkbox" id="set-design-review-enabled" ${p.design_review_enabled?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span class="vs-toggle-track" style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${p.design_review_enabled?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span class="vs-toggle-thumb" style="
                  position: absolute; left: ${p.design_review_enabled?"18px":"2px"}; top: 2px;
                  width: 16px; height: 16px; border-radius: 50%;
                  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  transition: left 0.2s ease;
                "></span>
              </span>
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-size: 13px; font-weight: 500; color: var(--vs-text-secondary);">
                  Design review after generation
                </span>
                <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.4;">A second AI pass judges the page the way a design studio would: hierarchy, typography, color, spacing, distinctiveness and copy. Scored out of 10 with the three biggest gaps, shown in the Expert Review panel. Advisory only. Adds one extra AI call per generation.</span>
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

    <!-- Card: AI Router \u2014 follows its provider and default model -->
    ${Wd(t.ok?p:null,(ze=D.get("user"))==null?void 0:ze.role,(gt=t.data)==null?void 0:gt.governor_activity)}

    <!-- Card: Email & Notifications -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Email & Notifications</h2>
      <p class="vs-settings-card-subtitle">Configure how VoxelSite sends transactional emails.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-driver" class="block text-sm font-medium text-vs-text-secondary mb-1">Delivery Method</label>
          <select id="set-mail-driver" class="vs-input">
            <option value="none" ${m.driver==="none"?"selected":""}>Not configured</option>
            <option value="php_mail" ${m.driver==="php_mail"?"selected":""}>PHP mail()</option>
            <option value="smtp" ${m.driver==="smtp"?"selected":""}>SMTP</option>
            <option value="mailpit" ${m.driver==="mailpit"?"selected":""}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${m.driver==="smtp"?"block":"none"};">
          <div class="flex flex-col gap-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(x).map(([N,te])=>`<option value="${y(N)}">${y(te.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${y(m.smtp_host||"")}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${m.smtp_port||587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${m.smtp_encryption==="tls"?"selected":""}>TLS (STARTTLS)</option>
                  <option value="ssl" ${m.smtp_encryption==="ssl"?"selected":""}>SSL</option>
                  <option value="none" ${m.smtp_encryption==="none"?"selected":""}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${y(m.smtp_username||"")}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${m.smtp_password||""}"
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
        <div id="mail-mailpit-fields" style="display: ${m.driver==="mailpit"?"block":"none"};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${y(m.mailpit_host||"localhost")}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${m.mailpit_port||1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${m.driver==="none"?"none":"block"};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${y(m.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${y(m.from_name||"")}"
            class="vs-input"
            placeholder="Your Site Name" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender name on notification emails.</p>
        </div>

        <div class="border-t border-vs-border-subtle"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${y(p.user_email||"")}"
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

    ${b?`
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${v?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${L.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(v).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${L.chevronRight}</div>
        </button>
        `:""}
        ${f?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${L.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(f).length} design decisions</span>
          </div>
          <div class="vs-knowledge-card-arrow">${L.chevronRight}</div>
        </button>
        `:""}
      </div>
      <p class="vs-knowledge-hint">
        ${L.info}
        You can't edit these values directly \u2014 ask VoxelSite in chat to update them.
      </p>
    </div>
    `:""}

    <!-- Card: AI Usage -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Usage</h2>
      <p class="vs-settings-card-subtitle">Token consumption and cost tracking across models.</p>
      ${h.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${Ut("Total Requests",Number(h.totals.request_count).toLocaleString())}
          ${Ut("Input Tokens",Number(h.totals.total_input_tokens).toLocaleString())}
          ${Ut("Output Tokens",Number(h.totals.total_output_tokens).toLocaleString())}

        </div>
        ${h.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${h.models.map(N=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${Ut(N.ai_model||"Unknown",Number(N.request_count).toLocaleString()+" requests")}
                ${Ut("Tokens",Number(N.total_input_tokens).toLocaleString()+" in / "+Number(N.total_output_tokens).toLocaleString()+" out")}

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
        ${Ut("VoxelSite",c.version||"1.0.0")}
        ${Ut("PHP",c.php_version||"?")}
        ${Ut("SQLite",c.sqlite_version||"?")}
        ${Ut("Private draft",c.workspace_ready?"Ready":"Upgrade required")}
        ${Ut("Draft version",String(c.draft_version??"?"))}
        ${Ut("Upload Limit",c.max_upload||"?")}
        ${Ut("Memory Limit",c.memory_limit||"?")}
      </div>
    </div>

    <!-- Card: Git Updates (renders only when this install is a Git checkout) -->
    <div id="vs-git-update-card"></div>

    <!-- Card: Update -->
    <div class="vs-settings-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Update</h2>
        <span class="vs-pill vs-pill-subtle">v${y(c.version||"1.0.0")}</span>
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
            <span class="vs-update-zone-hint">Stage a package, review its exact changes, then approve activation</span>
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
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Download redacted log files for debugging. Showing ${l.length} of ${(St==null?void 0:St.total)||0}.</p>
        </div>
        ${l.length>0?`<button id="btn-delete-all-logs" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete listed logs
        </button>`:""}
      </div>
      <div id="log-files-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${l.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':l.map(N=>{let te=(N.size/1024).toFixed(1),se=new Date(N.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${N.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${te} KB \xB7 ${se}</span>
                <a href="${Ce("api/router.php")}?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(N.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${N.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            </div>`}).join("")}
      </div>
      ${(St==null?void 0:St.next_offset)!==null||Ys?`<div class="flex gap-2 mt-3">
        ${Ys?'<button id="logs-first-page" class="vs-btn vs-btn-ghost vs-btn-xs">First logs</button>':""}
        ${(St==null?void 0:St.next_offset)!=null?'<button id="logs-next-page" class="vs-btn vs-btn-ghost vs-btn-xs">Next logs</button>':""}
      </div>`:""}
    </div>

    <!-- Card: API Access -->
    <div class="vs-settings-card" id="api-access-card">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <div>
          <h2 class="vs-settings-card-title" style="display: flex; align-items: center; gap: 8px;">API Access <span style="font-size: 10px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 7px; border-radius: 4px; background: color-mix(in srgb, var(--vs-accent) 12%, transparent); color: var(--vs-accent); border: 1px solid color-mix(in srgb, var(--vs-accent) 25%, transparent);">Beta</span></h2>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Manage Agent API keys for external integrations and automations.</p>
        </div>
        <a href="${Ce("api/agent/v1/schema")}" target="_blank" rel="noopener" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap; text-decoration: none;">
          ${L.externalLink} View API schema
        </a>
      </div>
      <div class="flex flex-col gap-4">
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="set-api-enabled" ${p.agent_api_enabled?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span class="vs-toggle-track" style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${p.agent_api_enabled?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span class="vs-toggle-thumb" style="
                position: absolute; left: ${p.agent_api_enabled?"18px":"2px"}; top: 2px;
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

        <div id="api-access-body" style="${p.agent_api_enabled?"":"opacity: 0.4; pointer-events: none;"}">
          <div style="margin-bottom: 16px;">
            <label for="set-api-origins" style="display: block; font-size: 13px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;">Allowed Origins</label>
            <textarea id="set-api-origins"
              class="vs-input" rows="3"
              style="resize: vertical; font-family: var(--font-mono); font-size: 12px; height: auto; padding: 10px 14px; line-height: 1.5;"
              placeholder="*">${y(p.agent_api_allowed_origins||"*")}</textarea>
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
  `,km(p,g),Ir(e.querySelector("#settings-recovery"),{api:Y,user:D.get("user")}),Zi(e.querySelector("#settings-mcp"),{api:Y,user:D.get("user")}).then(()=>{var N;if(window.__vsSettingsSection==="settings-mcp"){delete window.__vsSettingsSection;let te=e.querySelector("#settings-mcp");te==null||te.scrollIntoView({block:"start"}),(N=te==null?void 0:te.querySelector("button, input, a"))==null||N.focus({preventScroll:!0})}}),Kd(e,{getRole:()=>{var N;return(N=D.get("user"))==null?void 0:N.role},getModels:()=>Y.get("/settings/models"),put:(N,te)=>N==="/settings"?Sn(te):Y.put(N,te),reload:es,demoGuard:()=>{var N;return(N=window.demoGuard)==null?void 0:N.call(window)}}),Em(m,x),gm(),hm(),$m(p),document.querySelectorAll(".btn-delete-log").forEach(N=>{N.addEventListener("click",async()=>{var Ee;if((Ee=window.demoGuard)!=null&&Ee.call(window))return;if(N.dataset.confirm!=="true"){N.dataset.confirm="true",N.innerHTML='<span style="font-size: 11px;">Sure?</span>',N.style.color="var(--vs-error)",setTimeout(()=>{N.dataset.confirm==="true"&&(N.dataset.confirm="",N.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',N.style.color="")},3e3);return}let te=N.dataset.file,se=N.closest(".vs-log-row");se&&(se.style.opacity="0.4"),await ac([te]),es()})});let W=document.getElementById("btn-delete-all-logs");(At=document.getElementById("logs-first-page"))==null||At.addEventListener("click",()=>{Ys=null,es()}),(R=document.getElementById("logs-next-page"))==null||R.addEventListener("click",()=>{Ys={offset:St.next_offset,version:St.inventory_version},es()}),W&&W.addEventListener("click",async()=>{var N;if(!((N=window.demoGuard)!=null&&N.call(window))){if(W.dataset.confirm!=="true"){W.dataset.confirm="true",W.textContent="Sure?",W.style.color="var(--vs-error)",setTimeout(()=>{W.dataset.confirm==="true"&&(W.dataset.confirm="",W.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete listed logs',W.style.color="")},3e3);return}W.disabled=!0,W.textContent="Deleting...",await ac(l.map(te=>te.name)),es()}});let G=document.getElementById("btn-view-memory");G&&v&&G.addEventListener("click",()=>rc("Site Memory",v,"memory"));let J=document.getElementById("btn-view-design");if(J&&f&&J.addEventListener("click",()=>rc("Design Intelligence",f,"design")),sc(),fm(),p.ai_configured)wm(S);else{let N=document.getElementById("set-ai-model");N&&!S&&(N.innerHTML='<option value="">Configure a provider to choose a model</option>')}}function fm(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var r,l,p;if(i.preventDefault(),e.classList.remove("is-dragover"),(r=window.demoGuard)!=null&&r.call(window))return;let a=(p=(l=i.dataTransfer)==null?void 0:l.files)==null?void 0:p[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,r;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let l=await ye("/settings/favicon",Xe("/settings/favicon","delete")||{version:ta},"delete");l.ok?(A("Favicon removed.","success"),es()):A(((r=l.error)==null?void 0:r.message)||"Could not remove favicon.","error")}catch{A("Could not remove favicon.","error")}}});async function o(i){var c;if(i.size>524288){A("Favicon must be under 512 KB.","error");return}let r=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!r.includes(i.type)){A("Favicon must be a .ico file.","error");return}let p=document.getElementById("vs-favicon-preview");p&&(p.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let d=new Uint8Array(await i.arrayBuffer()),u="";for(let b of d)u+=String.fromCharCode(b);let v=Xe("/settings/favicon"),f=await ye("/settings/favicon",{version:(v==null?void 0:v.version)||ta,content_base64:btoa(u)},"post",{retainInput:!1,publicInput:{version:(v==null?void 0:v.version)||ta}});f.ok?(A("Favicon updated.","success"),es()):(A(((c=f.error)==null?void 0:c.message)||"Upload failed.","error"),es())}catch{A("Upload failed. Check your connection.","error"),es()}}}function rc(e,t,s){var l,p,c;(l=document.getElementById("vs-knowledge-overlay"))==null||l.remove();let n=d=>d.replace(/[_-]/g," ").replace(/\b\w/g,u=>u.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([d,u])=>{let v=typeof u=="object"?u.value||JSON.stringify(u):String(u),f=typeof u=="object"?u.confidence:null,b=f==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${y(n(d))}</div>
          <div class="vs-kv-value">
            <span>${y(v)}</span>
            ${f?`<span class="vs-kv-badge ${b}">${y(f)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(t).map(([d,u])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${y(n(d))}</div>
        <div class="vs-kv-section-body">${y(String(u))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?L.book:L.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${y(e)}</h2>
            <p class="vs-knowledge-modal-subtitle">${s==="memory"?"Facts the AI has learned about your business from conversations.":"Design decisions the AI uses to maintain visual consistency."}</p>
          </div>
        </div>
        <button id="vs-knowledge-close" class="vs-btn vs-btn-ghost vs-btn-icon" title="Close">${L.x}</button>
      </div>
      <div class="vs-knowledge-modal-body">
        ${o}
      </div>
      <div class="vs-knowledge-modal-footer">
        <span class="vs-knowledge-modal-hint">
          ${L.info}
          These values are managed by VoxelSite. Ask in chat to update them.
        </span>
        <button id="vs-knowledge-done" class="vs-btn vs-btn-primary vs-btn-sm">Done</button>
      </div>
    </div>
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",r)},r=d=>{d.key==="Escape"&&a()};document.addEventListener("keydown",r),(p=i.querySelector("#vs-knowledge-close"))==null||p.addEventListener("click",a),(c=i.querySelector("#vs-knowledge-done"))==null||c.addEventListener("click",a),Ie(i,a)}function gm(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||xm()})}function hm(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||bm()})}function bm(){return oc({api:Y,completionUrl:Ce("factory-reset.php")})}function uc(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}async function ym(e){var r,l,p;let t=(r=D.get("user"))==null?void 0:r.id,s=e.querySelector("#reset-exact-review"),n=await Qd(t,Y,sessionStorage,()=>{var c;return(c=D.get("user"))==null?void 0:c.id});if(!e.isConnected||((l=D.get("user"))==null?void 0:l.id)!==t)return;if(!n.ok){s.textContent=((p=n.error)==null?void 0:p.message)||"Could not prepare the reset review.";return}let o=n.data;if(["cancelled","succeeded"].includes(o.status)||o.status!=="authorized"&&o.expires_at*1e3<=Date.now()){sessionStorage.removeItem(`vs_reset_review:${t}`),s.textContent="This review has ended. Close and open Reset Website to prepare a fresh review.";return}e.resetReview=o,s.innerHTML=`<ul class="list-disc pl-5">${o.review.effects.map(c=>`<li>${y(c)}</li>`).join("")}</ul>
    <details class="mt-3"><summary class="cursor-pointer">Exact files (${(o.review.files||[]).length})</summary>
      <ul class="max-h-48 overflow-auto mt-2">${(o.review.files||[]).map(c=>`<li class="break-all">${y(c.effect)} \xB7 ${y(c.path)}</li>`).join("")}</ul></details>
    <p class="mt-3">Records to clear: ${(o.review.tables||[]).map(c=>`${y(c.name)} (${Number(c.rows)})`).join(", ")}.</p>
    <p class="mt-3">Preserved: ${o.review.preserved.map(y).join(", ")}.</p>`;let i=e.querySelector("#reset-confirm-input"),a=e.querySelector("#reset-confirm-btn");a.disabled=i.value.trim()!=="RESET"}function xm(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" id="reset-modal" role="dialog" aria-modal="true" aria-labelledby="reset-modal-title">
      <div class="vs-modal-header">
        <div class="vs-modal-icon vs-modal-icon-danger">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </div>
        <h2 class="vs-modal-title" id="reset-modal-title">Reset Website</h2>
        <p class="vs-modal-desc">Review the exact files and records below before approving this reset.</p>
      </div>

      <div class="vs-modal-body">
        <div id="reset-exact-review" class="text-sm text-vs-text-secondary mb-4" aria-live="polite">Preparing the exact reset review\u2026</div>

        <label class="vs-modal-confirm-label" for="reset-confirm-input">
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
        <button id="reset-confirm-btn" disabled class="vs-btn vs-btn-confirm-danger vs-btn-sm" style="position: relative; overflow: hidden;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Approve and reset website
        </button>
      </div>
    </div>
  `,document.body.appendChild(t),ym(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let r=s.value.trim()==="RESET"&&!!t.resetReview;n.disabled=!r,n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()==="RESET"&&t.resetReview?lc(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"&&t.resetReview?lc(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>Te(t)),t.addEventListener("click",r=>{r.target===t&&Te(t)});let a=r=>{r.key==="Escape"&&(Te(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function lc(e){var n,o,i,a;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(!(!t||!e.resetReview||e.resetRunning)){e.resetRunning=!0,t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:r,data:l,error:p}=await ec(e.resetReview,Y.post,Y.get);if(e.resetRunning=!1,r){try{sessionStorage.removeItem(`vs_reset_review:${(n=D.get("user"))==null?void 0:n.id}`)}catch{}D.set("pages",[]),D.set("hasFormSchemas",!1),D.set("conversations",null),D.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(o=window.applyPublishStateUi)==null||o.call(window),(i=window.refreshPublishState)==null||i.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{Te(e),window.location.hash!=="#/chat"?It.navigate("chat"):It.refresh()},800)}else{if(["failed_restored","expired","cancelled"].includes(l==null?void 0:l.status)||["content_conflict","review_expired","approval_expired"].includes(p==null?void 0:p.code)){try{sessionStorage.removeItem(`vs_reset_review:${(a=D.get("user"))==null?void 0:a.id}`)}catch{}e.resetReview=null,t.disabled=!0}t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let c=e.querySelector(".vs-modal-desc");if(c){let d=c.textContent;c.textContent=(p==null?void 0:p.message)||"Reset failed. Please try again.",c.style.color="var(--vs-error)",setTimeout(()=>{c.textContent=d,c.style.color=""},4e3)}}}catch{e.resetRunning=!1,t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function wm(e){var i,a;let t=document.getElementById("set-ai-model");if(!t)return;let s=++Do,n=((i=document.getElementById("set-base-url"))==null?void 0:i.value)||"",o=[];try{let{ok:r,data:l}=await Y.get("/settings/models");r&&(o=(l==null?void 0:l.models)||[])}catch{}!t.isConnected||s!==Do||n!==(((a=document.getElementById("set-base-url"))==null?void 0:a.value)||"")||(t.innerHTML=Ji(o,t.value||e),t.dispatchEvent(new Event("change")))}function Ut(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function km(e,t){var d;let s=e.ai_provider||"claude",n=Xd(document.getElementById("settings-content"),{settings:e,post:(u,v,f)=>Y.post(u,v,f),demoMode:document.documentElement.dataset.demo==="true",canEditModelLimits:((d=D.get("user"))==null?void 0:d.role)==="owner"}),o=document.getElementById("set-ai-provider");o&&o.addEventListener("change",async u=>{var v;if((v=window.demoGuard)!=null&&v.call(window)){u.target.value=s;return}n.invalidate(),Do++,s=u.target.value,await Sn({ai_provider:s}),es()});let i=document.getElementById("btn-test-api"),a=document.getElementById("set-api-key");i&&i.addEventListener("click",async()=>{var x,w,E,k,$,S,_;if((x=window.demoGuard)!=null&&x.call(window))return;let u=((w=a==null?void 0:a.value)==null?void 0:w.trim())||"",v=((k=(E=document.getElementById("set-base-url"))==null?void 0:E.value)==null?void 0:k.trim())||"";if(s!=="openai_compatible"&&(!u||u.startsWith("\u2022\u2022"))){Pr("Enter a new API key to test.","warning");return}i.textContent="Testing...",i.disabled=!0;let f=++Do,b=document.getElementById("set-ai-model"),{ok:h,data:g,error:m}=await Y.post("/settings/test-api",{provider:s,api_key:u.startsWith("\u2022\u2022")?"":u,base_url:v});if(i.textContent="Test Connection",i.disabled=!1,!(!(b!=null&&b.isConnected)||f!==Do||v!==(((S=($=document.getElementById("set-base-url"))==null?void 0:$.value)==null?void 0:S.trim())||""))){if(h){if(Pr("\u2713 Connected successfully!","success"),(_=g==null?void 0:g.models)!=null&&_.length&&b){let q=b.value||e[`ai_${s}_model`]||"";b.innerHTML=Ji(g.models,q),b.dispatchEvent(new Event("change"))}}else Pr("\u2717 "+((m==null?void 0:m.message)||"Connection failed."),"error");n.refresh()}});let r=document.getElementById("btn-save-identity"),l=document.getElementById("save-identity-status");r&&r.addEventListener("click",async()=>{var b,h,g,m,x;if((b=window.demoGuard)!=null&&b.call(window))return;r.textContent="Saving...",r.disabled=!0;let u={site_name:((g=(h=document.getElementById("set-site-name"))==null?void 0:h.value)==null?void 0:g.trim())||"",site_tagline:((x=(m=document.getElementById("set-site-tagline"))==null?void 0:m.value)==null?void 0:x.trim())||""},{ok:v,error:f}=await Sn(u);if(r.textContent="Save Identity",r.disabled=!1,l){if(l.classList.remove("hidden"),v){l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3",D.set("siteName",u.site_name),document.title=u.site_name?`Studio \u2014 ${u.site_name}`:"Studio \u2014 VoxelSite";let w=document.querySelector(".vs-logo-text");w&&(w.textContent=u.site_name||"VoxelSite")}else l.textContent="\u2717 "+((f==null?void 0:f.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3";setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3)}});let p=document.getElementById("btn-save-settings"),c=document.getElementById("save-status");p&&p.addEventListener("click",async()=>{var m,x,w,E,k,$,S,_;if((m=window.demoGuard)!=null&&m.call(window)||!((x=document.getElementById("set-max-tokens"))!=null&&x.reportValidity()))return;let u=n.collectLimits();if(u===null)return;p.textContent="Saving...",p.disabled=!0;let v={ai_provider:s,[`ai_${s}_model`]:((w=document.getElementById("set-ai-model"))==null?void 0:w.value)||"",ai_max_tokens:parseInt(((E=document.getElementById("set-max-tokens"))==null?void 0:E.value)||"32000",10),evaluator_enabled:((k=document.getElementById("set-evaluator-enabled"))==null?void 0:k.checked)===!0,design_review_enabled:(($=document.getElementById("set-design-review-enabled"))==null?void 0:$.checked)===!0},f=document.getElementById("set-base-url");f&&(v.ai_openai_compatible_base_url=f.value.trim(),u!==void 0&&(v.ai_openai_compatible_model_limits=u));let b=(S=a==null?void 0:a.value)==null?void 0:S.trim();b&&!b.startsWith("\u2022\u2022")&&(v[`ai_${s}_api_key`]=b);let{ok:h,error:g}=await Sn(v);if(p.textContent="Save Settings",p.disabled=!1,h){let q=await Y.get("/auth/session");q.ok&&D.set("aiConfigured",((_=q.data)==null?void 0:_.ai_configured)===!0)}c&&(c.classList.remove("hidden"),h?(c.textContent="\u2713 Saved",c.className="text-xs text-vs-success ml-3"):(c.textContent="\u2717 "+((g==null?void 0:g.message)||"Failed to save."),c.className="text-xs text-vs-error ml-3"),setTimeout(()=>c==null?void 0:c.classList.add("hidden"),3e3))}),["set-evaluator-enabled","set-design-review-enabled"].forEach(u=>{let v=document.getElementById(u);if(!v)return;let f=v.closest("label")||v.parentElement,b=f==null?void 0:f.querySelector(".vs-toggle-track"),h=f==null?void 0:f.querySelector(".vs-toggle-thumb");v.addEventListener("change",()=>{b&&(b.style.background=v.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),h&&(h.style.left=v.checked?"18px":"2px")})})}function Em(e,t){var v;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function r(){if(!e.smtp_host)return"gmail";for(let[f,b]of Object.entries(t))if(b.host&&b.host===e.smtp_host)return f;return"custom"}if(i){let f=r();i.value=f,a&&((v=t[f])!=null&&v.help)&&(a.textContent=t[f].help)}s&&s.addEventListener("change",()=>{let f=s.value;n&&(n.style.display=f==="smtp"?"block":"none"),o&&(o.style.display=f==="mailpit"?"block":"none");let b=document.getElementById("mail-common-fields");b&&(b.style.display=f==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let f=t[i.value];if(!f)return;let b=document.getElementById("set-smtp-host"),h=document.getElementById("set-smtp-port"),g=document.getElementById("set-smtp-encryption");b&&(b.value=f.host||""),h&&(h.value=f.port||587),g&&(g.value=f.encryption||"tls"),a&&(a.textContent=f.help||"")});let l=document.getElementById("btn-toggle-smtp-pass"),p=document.getElementById("set-smtp-password");l&&p&&l.addEventListener("click",()=>{let f=p.type==="password";p.type=f?"text":"password",l.innerHTML=f?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let c=document.getElementById("btn-mail-test");c&&c.addEventListener("click",async()=>{var E,k,$;if((E=window.demoGuard)!=null&&E.call(window))return;let f=($=(k=document.getElementById("set-mail-test-recipient"))==null?void 0:k.value)==null?void 0:$.trim();if(!f){Br("Enter an email address to send the test to.","warning");return}c.textContent="Sending...",c.disabled=!0;let b=dc(),h=await Sn(ic(b),"/settings/mail","post"),g=Xe("/settings/mail/test")||{recipient:f,configuration_version:sa.mail},{ok:m,data:x,error:w}=h.ok?await ye("/settings/mail/test",g):h;c.textContent="Send Test",c.disabled=!1,m?Br((x==null?void 0:x.message)||"Mail test finished.",(x==null?void 0:x.delivery_status)==="accepted"?"success":"warning"):Br("\u2717 "+((w==null?void 0:w.message)||"Test failed."),"error")});let d=document.getElementById("btn-save-mail"),u=document.getElementById("save-mail-status");d&&d.addEventListener("click",async()=>{var g;if((g=window.demoGuard)!=null&&g.call(window))return;d.textContent="Saving...",d.disabled=!0;let f=dc(),{ok:b,error:h}=await Sn(ic(f),"/settings/mail","post");d.textContent="Save Email Settings",d.disabled=!1,u&&(u.classList.remove("hidden"),b?(u.textContent="\u2713 Saved",u.className="text-xs text-vs-success ml-3"):(u.textContent="\u2717 "+((h==null?void 0:h.message)||"Failed to save."),u.className="text-xs text-vs-error ml-3"),setTimeout(()=>u==null?void 0:u.classList.add("hidden"),3e3))})}function dc(){var t,s,n,o,i,a,r,l,p,c,d,u,v,f,b;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((l=(r=document.getElementById("set-smtp-host"))==null?void 0:r.value)==null?void 0:l.trim())||"",smtp_port:parseInt(((p=document.getElementById("set-smtp-port"))==null?void 0:p.value)||"587",10),smtp_username:((d=(c=document.getElementById("set-smtp-username"))==null?void 0:c.value)==null?void 0:d.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((u=document.getElementById("set-smtp-encryption"))==null?void 0:u.value)||"tls",mailpit_host:((f=(v=document.getElementById("set-mailpit-host"))==null?void 0:v.value)==null?void 0:f.trim())||"localhost",mailpit_port:parseInt(((b=document.getElementById("set-mailpit-port"))==null?void 0:b.value)||"1025",10)}}function Br(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function Pr(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function $m(e){let t=document.getElementById("set-api-enabled"),s=document.getElementById("api-access-body"),n=document.getElementById("btn-save-api-settings"),o=document.getElementById("btn-generate-api-key");t&&t.addEventListener("change",()=>{let i=t.checked,a=t.parentElement.querySelector(".vs-toggle-track"),r=t.parentElement.querySelector(".vs-toggle-thumb");a&&(a.style.background=i?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),r&&(r.style.left=i?"18px":"2px"),s&&(s.style.opacity=i?"":"0.4",s.style.pointerEvents=i?"":"none")}),n&&n.addEventListener("click",async()=>{var l,p,c,d,u;if((l=window.demoGuard)!=null&&l.call(window))return;let i=document.getElementById("save-api-status");n.disabled=!0,n.textContent="Saving...";let a={agent_api_enabled:((p=document.getElementById("set-api-enabled"))==null?void 0:p.checked)||!1,agent_api_allowed_origins:((d=(c=document.getElementById("set-api-origins"))==null?void 0:c.value)==null?void 0:d.trim())||"*"},r=await Sn(a);n.disabled=!1,n.textContent="Save API Settings",r.ok?(A("API settings saved","success"),i&&(i.textContent="Saved",i.className="text-xs text-vs-success",i.classList.remove("hidden"),setTimeout(()=>i.classList.add("hidden"),2e3))):A(((u=r.error)==null?void 0:u.message)||"Failed to save","error")}),qo(),o&&o.addEventListener("click",()=>{var i;(i=window.demoGuard)!=null&&i.call(window)||Sm()})}var Qi={owner:["pages:read","pages:write","settings:read","settings:write","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],editor:["pages:read","pages:write","compile:trigger","submissions:read","assets:read","assets:write","tools:invoke"],agent:["pages:read","pages:write","settings:read","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],viewer:["pages:read","settings:read","submissions:read","assets:read"]},cc={"prompt:execute":["owner","editor","agent"],"mail:send":["owner"]};async function qo(e={}){var s,n;let t=document.getElementById("api-keys-list");if(t)try{let o=new URLSearchParams(e).toString(),i=await Y.get(`/settings/api-keys${o?`?${o}`:""}`);if(!i.ok){A(((s=i.error)==null?void 0:s.message)||"API keys could not be loaded.","error");return}let a=((n=i.data)==null?void 0:n.keys)||[];if(a.length===0&&!(i.data.pending_secrets||[]).length&&!Number(e.offset)){t.innerHTML=`
        <div style="text-align: center; padding: 24px 16px; color: var(--vs-text-ghost);">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 8px; opacity: 0.35;">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <rect x="10" y="10" width="4" height="5" rx="1"/>
            <circle cx="12" cy="9" r="1.5"/>
          </svg>
          <p style="font-size: 13px; margin: 0 0 4px; font-weight: 500;">No API keys yet</p>
          <p style="font-size: 11px; margin: 0;">Generate a key to let external applications manage your site.</p>
        </div>`;return}t.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${a.map(l=>{let p=l.last_used_at?new Date(l.last_used_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",c=new Date(l.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),u={agent:"var(--vs-accent)",editor:"#3b82f6",viewer:"var(--vs-text-ghost)",owner:"#8b5cf6"}[l.role]||"var(--vs-text-ghost)",f=(Array.isArray(l.scopes)?l.scopes:typeof l.scopes=="string"?JSON.parse(l.scopes||"[]"):[]).includes("prompt:execute");return`
            <div class="vs-api-key-row" style="display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-lg); background: var(--vs-bg-base); transition: border-color 0.15s ease, box-shadow 0.2s ease;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: color-mix(in srgb, ${u} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${u} 18%, transparent);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${u}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.01em;">${y(l.label||"Unnamed")}</span>
                  <span style="font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: var(--radius-full); color: ${u}; background: color-mix(in srgb, ${u} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${u} 20%, transparent); text-transform: capitalize;">${y(l.role||"agent")}</span>
                  ${f?'<span style="font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-full); color: var(--vs-accent); background: color-mix(in srgb, var(--vs-accent) 8%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, var(--vs-accent) 20%, transparent); letter-spacing: 0.5px;">AI</span>':""}
                </div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <code style="font-size: 10px; font-family: var(--font-mono); background: var(--vs-bg-inset); padding: 1px 5px; border-radius: var(--radius-xs); border: 1px solid var(--vs-border-subtle);">${y(l.key_prefix||"???")}\u2026</code>
                  <span>Created ${c}</span>
                  <span>\xB7 Last used: ${p}</span>
                </div>
              </div>
              <button class="vs-btn vs-btn-ghost vs-btn-xs btn-revoke-key" data-id="${l.id}" style="color: var(--vs-text-ghost); white-space: nowrap; flex-shrink: 0;" title="Revoke">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Revoke
              </button>
            </div>`}).join("")}
      </div>`;let r=i.data.pending_secrets||[];r.length&&t.insertAdjacentHTML("beforeend",`<div class="mt-4">
      <p class="text-xs text-vs-text-tertiary">Claim each new key once within 15 minutes. If a claim response is lost, revoke the key and create a replacement.</p>
      ${r.map(l=>`<div class="flex items-center justify-between gap-3 mt-3">
        <span class="text-sm text-vs-text-secondary">${y(l.label)}</span>
        <button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-rest-claim="${y(l.plan_id)}">Claim credential</button>
      </div>`).join("")}</div>`),t.querySelectorAll("[data-rest-claim]").forEach(l=>l.addEventListener("click",async()=>{var c,d;l.disabled=!0;let p=await Y.post(`/settings/mcp/approvals/${l.dataset.restClaim}/reveal`,{});if(!p.ok){A(((c=p.error)==null?void 0:c.message)||"This key could not be claimed. Reload the list to check it.","error");return}Cm(p.data.key,((d=r.find(u=>u.plan_id===l.dataset.restClaim))==null?void 0:d.label)||"API key"),qo()})),(Number(e.offset)||i.data.next_offset!==null)&&(t.insertAdjacentHTML("beforeend",`<div class="flex gap-3 items-center mt-4">
        <span class="text-xs text-vs-text-tertiary">${i.data.total} API keys</span>
        ${Number(e.offset)?`<button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-key-page="${Math.max(0,Number(e.offset)-50)}">Previous</button>`:""}
        ${i.data.next_offset!==null?`<button type="button" class="vs-btn vs-btn-secondary vs-btn-sm" data-key-page="${i.data.next_offset}">Next</button>`:""}</div>`),t.querySelectorAll("[data-key-page]").forEach(l=>l.addEventListener("click",()=>qo({offset:l.dataset.keyPage,inventory_version:i.data.inventory_version})))),t.querySelectorAll(".btn-revoke-key").forEach(l=>{l.addEventListener("click",async()=>{var v,f,b;if((v=window.demoGuard)!=null&&v.call(window))return;let p=l.dataset.id;if(l.dataset.confirm!=="true"){l.dataset.confirm="true",l.innerHTML='<span style="font-size: 11px; color: var(--vs-error);">Sure?</span>',setTimeout(()=>{l.dataset.confirm==="true"&&(l.dataset.confirm="",l.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Revoke')},3e3);return}let c=l.closest(".vs-api-key-row");c&&(c.style.opacity="0.4");let d=`/settings/api-keys/${p}`,u=await ye(d,Xe(d,"delete")||{version:(f=a.find(h=>String(h.id)===p))==null?void 0:f.version},"delete");if(!u.ok){c&&(c.style.opacity=""),A(((b=u.error)==null?void 0:b.message)||"The key could not be revoked.","error");return}A("API key revoked","success"),qo()})})}catch{t.innerHTML='<div style="font-size: 12px; color: var(--vs-text-ghost); text-align: center; padding: 16px 0;">Could not load API keys.</div>'}}function Sm(){let e=document.getElementById("generate-key-modal");e&&e.remove();let t=document.createElement("div");t.className="vs-modal-overlay",t.id="generate-key-modal",t.innerHTML=`
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
              <option value="owner">Owner \u2014 all API settings and optional email access</option>
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
            <label id="gen-key-mail-toggle" class="vs-checkbox-label" style="display: flex; align-items: flex-start; gap: 10px; margin-top: 10px; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <input type="checkbox" id="gen-key-mail-send" class="vs-checkbox" />
              <span class="vs-checkbox-box" style="margin-top: 1px;"></span>
              <span><span style="display: block; font-size: 13px; font-weight: 500;">Send form and Action notifications</span><span style="display: block; font-size: 11px; color: var(--vs-text-ghost);">Owner access required. Real submissions may send the notifications configured for that form or Action.</span></span>
            </label>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="cancel-generate-key">Cancel</button>
        <button class="vs-btn vs-btn-primary vs-btn-sm" id="confirm-generate-key">Generate</button>
      </div>
    </div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>Te(t),n=u=>{u.key==="Escape"&&(u.preventDefault(),s())};document.addEventListener("keydown",n);let o=new MutationObserver(()=>{document.body.contains(t)||(document.removeEventListener("keydown",n),o.disconnect())});o.observe(document.body,{childList:!0}),Ie(t,s),t.querySelector("#cancel-generate-key").addEventListener("click",s);let i=t.querySelector("#gen-key-label");i==null||i.addEventListener("keydown",u=>{var v;u.key==="Enter"&&(u.preventDefault(),(v=t.querySelector("#confirm-generate-key"))==null||v.click())});let a=t.querySelector("#gen-key-prompt-execute"),r=t.querySelector("#gen-key-prompt-toggle"),l=a,p=r==null?void 0:r.querySelector('span[style*="font-size: 11px"]'),c=u=>{let v=t.querySelector("#gen-key-mail-send"),f=t.querySelector("#gen-key-mail-toggle");v&&(v.disabled=!cc["mail:send"].includes(u),v.disabled&&(v.checked=!1),f.style.opacity=v.disabled?"0.45":"1"),(cc["prompt:execute"]||[]).includes(u)?(l.disabled=!1,r.style.opacity="1",r.style.cursor="pointer",p&&(p.textContent="Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.")):(l.checked=!1,l.disabled=!0,r.style.opacity="0.45",r.style.cursor="not-allowed",r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)",p&&(p.textContent="Not available for read-only roles. Prompt execution requires write access."))},d=t.querySelector("#gen-key-role");d==null||d.addEventListener("change",()=>c(d.value)),c((d==null?void 0:d.value)||"agent"),a==null||a.addEventListener("change",()=>{a.checked?(r.style.borderColor="color-mix(in srgb, var(--vs-accent) 40%, transparent)",r.style.background="color-mix(in srgb, var(--vs-accent) 4%, var(--vs-bg-base))"):(r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)")}),t.querySelector("#confirm-generate-key").addEventListener("click",async()=>{var x,w,E,k,$,S,_;let u=(w=(x=document.getElementById("gen-key-label"))==null?void 0:x.value)==null?void 0:w.trim(),v=((E=document.getElementById("gen-key-role"))==null?void 0:E.value)||"agent",f=(k=document.getElementById("gen-key-prompt-execute"))==null?void 0:k.checked,b=($=document.getElementById("gen-key-mail-send"))==null?void 0:$.checked;if(!u){A("Please enter a label for the key","error");return}let h=t.querySelector("#confirm-generate-key");h.disabled=!0,h.textContent="Generating\u2026";let g={label:u,role:v,scopes:[...Qi[v]||Qi.agent]};f&&(g.scopes=[...Qi[v]||Qi.agent,"prompt:execute"]),b&&v==="owner"&&g.scopes.push("mail:send");let m=await ye("/settings/api-keys",Xe("/settings/api-keys")||g);m.ok&&((S=m.data)!=null&&S.plan_id)?(s(),A("API key created. Claim it from the list to save it once.","success"),qo()):(h.disabled=!1,h.textContent="Generate",A(((_=m.error)==null?void 0:_.message)||"Failed to generate key","error"))})}function Cm(e,t){let s=document.getElementById("key-reveal-modal");s&&s.remove();let n=document.createElement("div");n.className="vs-modal-overlay",n.id="key-reveal-modal",n.innerHTML=`
    <div class="vs-modal" style="max-width: 640px;">
      <div class="vs-modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, #22c55e 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, #22c55e 20%, transparent); flex-shrink: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <h3 class="vs-modal-title" style="margin: 0;">Key Generated</h3>
            <p class="vs-modal-desc" style="margin: 2px 0 0;">${y(t)}</p>
          </div>
        </div>
      </div>
      <div class="vs-modal-body">
        <div style="position: relative; margin-bottom: 16px;">
          <input type="password" readonly id="revealed-key-input" class="vs-input" autocomplete="off" style="width: 100%; font-family: var(--font-mono); font-size: 12.5px; padding-right: 44px; letter-spacing: 0.01em; color: var(--vs-text-primary);" />
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("is-visible"));let o=()=>{e="";let l=n.querySelector("#revealed-key-input");l&&(l.value="",l.removeAttribute("value")),Te(n)},i=l=>{l.key==="Escape"&&(l.preventDefault(),o())};document.addEventListener("keydown",i);let a=new MutationObserver(()=>{document.body.contains(n)||(document.removeEventListener("keydown",i),a.disconnect())});a.observe(document.body,{childList:!0}),Ie(n,o),n.querySelector("#close-key-reveal").addEventListener("click",o);let r=n.querySelector("#revealed-key-input");r.value=e,r.focus(),r==null||r.addEventListener("focus",()=>r.select()),n.querySelector("#copy-api-key").addEventListener("click",async()=>{let l=n.querySelector("#copy-api-key");try{await navigator.clipboard.writeText(e),l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',l.style.color="#22c55e",setTimeout(()=>{l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',l.style.color=""},2e3)}catch{r==null||r.select()}})}function vc(e,{actor:t=()=>null,storage:s=globalThis.sessionStorage,onError:n=()=>{}}={}){let o=new Map,i=new Map,a=new Map,r=t(),l=()=>(r!==t()&&(r=t(),o.clear(),i.clear()),r),p=async x=>[...new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256",new TextEncoder().encode(x)))].map(w=>w.toString(16).padStart(2,"0")).join(""),c=x=>typeof x=="string"&&/^[a-f0-9]{64}$/.test(x),d=(x,w,E)=>`${x}:${w}:${E}`,u=x=>{var w;return x.includes("/bar-settings")?"bar":((w=/^\/agentic\/actions\/([^/?]+)(?:\/(?:duplicate))?$/.exec(x))==null?void 0:w[1])||"inventory"},v=(x,w)=>`vs_form_action:${t()}:${x}:${w}`,f=(x,w)=>{var $,S;if(!w)return;let E=x.split("?")[0],k=w.records||w.submissions||(w.record?[w.record]:[]);for(let _ of k){let q=_.kind||(E.startsWith("/forms/")?"form":"action"),K=_.entity_id||_.form_id||_.action_id;K&&c(_.version)&&!o.has(d(q,K,_.record_id??_.id))&&o.set(d(q,K,_.record_id??_.id),_.version)}if(c(w.configuration_version)&&(i.has(u(E))||i.set(u(E),w.configuration_version),w.actions))for(let _ of w.actions)i.has(_.id)||i.set(_.id,w.configuration_version);if(E.endsWith("/bar-settings")&&c(w.version)&&!i.has("bar")&&i.set("bar",w.version),c(($=w.operation)==null?void 0:$.version)){for(let _ of i.keys())i.set(_,w.operation.version);i.set(u(E),w.operation.version)}for(let _ of[...w.changed_records||[],...(((S=w.operation)==null?void 0:S.versions)||[]).map(q=>({...q,kind:w.operation.kind,entity_id:w.operation.entity_id}))])c(_.version)&&o.set(d(_.kind,_.entity_id,_.record_id),_.version)},b=x=>({ok:!1,error:{code:"content_conflict",message:x}}),h=()=>b("The signed-in account changed. Reload before continuing."),g=async(x,w)=>{let E=l(),k=await e.get(x,w);return l()!==E?h():(k.ok&&f(x,k.data),k)},m=(x,w,E={},k)=>{let $=l(),S=w.split("?")[0];if(S.endsWith("/test")||S.endsWith("/manifest"))return e[x](w,E,k).then(O=>l()===$?O:h());let _=v(x,w),q=JSON.stringify(E??{});if(a.has(_))return a.get(_).fingerprint===q?a.get(_).promise:Promise.resolve(b("Wait for the pending change before changing its input."));let K=(async()=>{var T;let O;try{O=JSON.parse((s==null?void 0:s.getItem(_))||"null")}catch{}let W;try{W=await p(q)}catch{return b("This browser cannot retain a secure change identity. Use a secure connection and retry.")}if(l()!==$)return h();if(O&&O.inputHash!==W)return b("A previous change has no confirmed response. Retry that change before starting another.");let G=O?{...E||{},...O.metadata}:null;if(!G){if(typeof globalThis.crypto.randomUUID!="function")return b("This browser cannot create a secure change identity. Use a secure connection and retry.");G={...E||{},request_id:`studio_${globalThis.crypto.randomUUID().replaceAll("-","")}`};let C=/^\/forms\/([^/]+)\/submissions\/(\d+)$/.exec(S),j=/^\/agentic\/actions\/([^/]+)\/records\/(\d+)$/.exec(S);if(C||j){let P=C||j;if(G.version=o.get(d(C?"form":"action",decodeURIComponent(P[1]),P[2])),!G.version)return b("Reload this record before changing it. Its displayed version is unavailable.")}else if(S.endsWith("/records/bulk")){let P=decodeURIComponent(S.split("/")[3]);if(G.records=(G.record_ids||[]).map(H=>({record_id:Number(H),version:o.get(d("action",P,H))})),!G.records.length||G.records.some(H=>!H.version))return b("Reload the selected records before changing them.")}else if(S.endsWith("/records/purge")){let P=decodeURIComponent(S.split("/")[3]);G.before=new Date(Date.now()-Number(G.older_than_days??90)*864e5).toISOString();let H=await g(`/agentic/actions/${encodeURIComponent(P)}/records?date_to=${encodeURIComponent(G.before)}&per_page=100`);if(!H.ok)return H;G.records=H.data.records.map(U=>({record_id:U.id,version:U.version})),G.more=H.data.total>G.records.length}else if(G.configuration_version=i.get(u(S))||i.get("inventory"),!G.configuration_version)return b("Reload Action settings before changing them. Their displayed version is unavailable.");let B=Object.fromEntries(["request_id","version","configuration_version","records","before","more"].filter(P=>P in G).map(P=>[P,G[P]]));O={inputHash:W,metadata:B};try{s==null||s.setItem(_,JSON.stringify(O))}catch{return b("This browser cannot retain the change identity. Enable session storage and retry.")}}if(l()!==$)return h();let J=await e[x](w,G,k);if(l()!==$)return h();if(J.ok){try{s==null||s.removeItem(_)}catch{}f(w,J.data)}else if(((T=J.error)==null?void 0:T.code)!=="network_error")try{s==null||s.removeItem(_)}catch{}return J.ok||n(J,{retry:()=>t()===$?m(x,w,E,k):Promise.resolve(b("The signed-in account changed. Reload before retrying."))}),J})();return a.set(_,{fingerprint:q,promise:K}),K.finally(()=>a.delete(_)),K};return{get:g,post:(x,w,E)=>m("post",x,w,E),put:(x,w,E)=>m("put",x,w,E),delete:(x,w,E)=>m("delete",x,w,E)}}var $e=vc(Y,{actor:()=>{var e;return((e=D.get("user"))==null?void 0:e.id)??null},onError(e,{retry:t}){var s,n;((s=e.error)==null?void 0:s.code)==="network_error"?cs("Change not confirmed. The exact request is kept.","Retry change",t,"warning"):((n=e.error)==null?void 0:n.code)==="content_conflict"&&A("This information changed elsewhere. Reload and review before saving.","warning")}});var Js=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Cn=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Rr={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},_m={contact:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',newsletter:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',callback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',feedback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'};function fc(){return setTimeout(()=>gc(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <div class="flex items-center justify-between gap-3 flex-wrap">
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
  `}async function gc(){var a,r,l,p,c,d,u;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let v=await mc();v!=null&&v.ok&&v.actionId&&(window.location.hash=`#/actions/${v.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let E=function(k){let $=document.getElementById("bar-color-swatch"),S=document.getElementById("bar-brand-hex"),_=document.getElementById("bar-brand-color");$&&($.style.background=k),S&&S!==document.activeElement&&(S.value=k),_&&(_.value=k),document.querySelectorAll(".bar-color-preset").forEach(q=>{q.style.borderColor=q.dataset.color.toLowerCase()===k.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:v,data:f}=await $e.get("/agentic/actions/bar-settings"),b=v&&(f==null?void 0:f.settings)||{theme:"bottom-bar",visibility:"all-pages"},h=b.theme||"bottom-bar",g=b.visibility||"all-pages",m={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
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
      </svg>`},x={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},w={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">Bar settings are saved to your draft. Publish to update your site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(w).map(([k,$])=>`<option value="${k}" ${g===k?"selected":""}>${$}</option>`).join("")}
            </select>
          </div>
        </div>
        ${f!=null&&f.migration_required?'<p class="vs-settings-hint">Your saved bar settings need to be added to the draft before publishing.</p><button id="bar-migrate-settings" class="vs-btn vs-btn-secondary" type="button">Save these settings to draft</button>':""}
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(m).map(([k,$])=>{let S=k===h;return`
              <button type="button" class="bar-theme-option" data-theme="${k}" style="
                border: 2px solid ${S?"var(--vs-accent)":"var(--vs-border-subtle)"};
                background: ${S?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)"};
                border-radius: var(--radius-lg, 10px);
                padding: 14px 12px 10px;
                cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 8px;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.12s;
                color: ${S?"var(--vs-accent)":"var(--vs-text-ghost)"};
                position: relative;
                outline: none;
              "
                onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-medium)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}"
                onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-subtle)';this.style.transform='';this.style.boxShadow='';}"
              >
                <div style="width: 100%; max-width: 120px;">${$}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${S?"var(--vs-accent)":"var(--vs-text-secondary)"};">${x[k]}</span>
                ${S?`<div style="
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
              ${["light","dark"].map(k=>{let $=k===(b.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${k}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${$?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${$?"#fff":"var(--vs-text-secondary)"};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${{light:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',dark:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}[k]} ${k.charAt(0).toUpperCase()+k.slice(1)}</button>`}).join("")}
            </div>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Brand Color</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label style="position: relative; cursor: pointer; flex-shrink: 0;">
                <input type="color" id="bar-brand-color" value="${b.brand_color||"#EA580C"}" style="
                  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
                ">
                <div id="bar-color-swatch" style="
                  width: 32px; height: 32px; border-radius: 8px;
                  background: ${b.brand_color||"#EA580C"};
                  border: 2px solid var(--vs-border-subtle);
                  transition: border-color 0.15s, box-shadow 0.15s;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                "></div>
              </label>
              <input type="text" id="bar-brand-hex" class="vs-input" value="${b.brand_color||"#EA580C"}" placeholder="#EA580C" style="
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
    `,document.querySelectorAll(".bar-theme-option").forEach(k=>{k.addEventListener("click",async()=>{let $=k.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(_=>{let q=_.dataset.theme===$;_.style.borderColor=q?"var(--vs-accent)":"var(--vs-border-subtle)",_.style.background=q?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",_.style.color=q?"var(--vs-accent)":"var(--vs-text-ghost)",_.classList.toggle("active",q);let K=_.querySelector("span");K&&(K.style.color=q?"var(--vs-accent)":"var(--vs-text-secondary)");let O=_.querySelector('[style*="position: absolute"]');if(O&&!q&&O.remove(),q&&!_.querySelector('[style*="position: absolute"]')){let W=document.createElement("div");W.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",W.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',_.appendChild(W)}});let{ok:S}=await $e.put("/agentic/actions/bar-settings",{theme:$});S&&(k.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>k.style.boxShadow="",400),A("Bar style saved to draft","success"))})}),(r=document.getElementById("bar-migrate-settings"))==null||r.addEventListener("click",async()=>{let{ok:k,error:$}=await $e.put("/agentic/actions/bar-settings",b);k?(A("Bar settings saved to draft","success"),await gc()):A(($==null?void 0:$.message)||"Could not save bar settings.","error")}),(l=document.getElementById("bar-visibility"))==null||l.addEventListener("change",async k=>{let{ok:$}=await $e.put("/agentic/actions/bar-settings",{visibility:k.target.value});$&&A("Bar visibility saved to draft","success")}),document.querySelectorAll(".bar-scheme-btn").forEach(k=>{k.addEventListener("click",async()=>{let $=k.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(_=>{let q=_.dataset.scheme===$;_.style.background=q?"var(--vs-accent)":"var(--vs-bg-surface)",_.style.color=q?"#fff":"var(--vs-text-secondary)"});let{ok:S}=await $e.put("/agentic/actions/bar-settings",{color_scheme:$});S&&A("Color scheme updated","success")})}),(p=document.getElementById("bar-brand-color"))==null||p.addEventListener("input",k=>{E(k.target.value)}),(c=document.getElementById("bar-brand-color"))==null||c.addEventListener("change",async k=>{let{ok:$}=await $e.put("/agentic/actions/bar-settings",{brand_color:k.target.value});$&&A("Brand color updated","success")}),(d=document.getElementById("bar-brand-hex"))==null||d.addEventListener("change",async k=>{let $=k.target.value.trim();if($.startsWith("#")||($="#"+$),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test($)){E($);let{ok:S}=await $e.put("/agentic/actions/bar-settings",{brand_color:$});S&&A("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach(k=>{k.addEventListener("click",async()=>{let $=k.dataset.color;E($);let{ok:S}=await $e.put("/agentic/actions/bar-settings",{brand_color:$});S&&A("Brand color updated","success")})}),E(b.brand_color||"#EA580C")}let{ok:s,data:n}=await $e.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon" style="color: var(--vs-accent);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="vs-empty-state-title">No actions yet</p>
          <p class="vs-empty-state-desc">Create your first agent action to let AI assistants and website visitors interact with your business \u2014 reservations, appointments, quotes, and more.</p>
          <button id="btn-empty-new-action" class="vs-btn vs-btn-primary vs-btn-sm" style="margin-top: 12px;">${L.plus} New Action</button>
        </div>
      </div>
    `,(u=document.getElementById("btn-empty-new-action"))==null||u.addEventListener("click",async()=>{let v=await mc();v!=null&&v.ok&&v.actionId&&(window.location.hash=`#/actions/${v.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((v,f)=>{let b=v.active,h=v._stats||v.stats||{},g=h.total||0,m=h.last_created_at?xo(h.last_created_at):"\u2014",x={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},w=x[v.icon]||x.circle;return`
          <div class="vs-action-list-row vs-form-card" data-action-id="${y(v.id)}" style="cursor: pointer; transition: box-shadow 0.15s ease;">
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
            <div class="vs-form-card-icon" style="color: ${b?"var(--vs-success)":"var(--vs-text-ghost)"}; background: ${b?"color-mix(in srgb, var(--vs-success) 10%, transparent)":"var(--vs-bg-raised)"};">
              ${w}
            </div>
            <div class="vs-form-card-body">
              <div class="vs-form-card-name">${y(v.name||v.id)}</div>
              ${v.description?`<div class="vs-form-card-desc">${y(v.description)}</div>`:""}
              <div class="vs-form-card-meta">
                <span class="vs-status-pill" style="
                  background: ${b?"var(--vs-success-dim)":"var(--vs-bg-raised)"};
                  color: ${b?"var(--vs-success)":"var(--vs-text-ghost)"};
                  font-size: 11px; padding: 1px 8px;
                ">${b?"Active":"Draft"}</span>
                <span class="vs-form-card-dot">\xB7</span>
                <span>${g} submission${g!==1?"s":""}</span>
                ${h.today>0?`<span class="vs-form-card-dot">\xB7</span><span>+${h.today} today</span>`:""}
                <span class="vs-form-card-dot">\xB7</span>
                <span>${m}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `}).join("")}
    </div>
  `,document.querySelectorAll(".vs-action-list-row").forEach(v=>{v.addEventListener("click",f=>{if(f.target.closest(".vs-action-reorder"))return;let b=v.dataset.actionId;b&&(window.location.hash="#/actions/"+encodeURIComponent(b))})});async function i(){let v=document.querySelectorAll("#actions-list .vs-action-list-row"),f=Array.from(v).map(b=>b.dataset.actionId);await $e.post("/agentic/actions/reorder",{order:f})}document.querySelectorAll(".action-move-up").forEach(v=>{v.addEventListener("click",async f=>{f.preventDefault(),f.stopPropagation();let b=v.closest(".vs-action-list-row"),h=b==null?void 0:b.previousElementSibling;h&&(b.parentNode.insertBefore(b,h),b.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>b.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(v=>{v.addEventListener("click",async f=>{f.preventDefault(),f.stopPropagation();let b=v.closest(".vs-action-list-row"),h=b==null?void 0:b.nextElementSibling;h&&(b.parentNode.insertBefore(h,b),b.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>b.style.boxShadow="",300),await i())})})}async function mc(){return new Promise(async e=>{var r;let{ok:t,data:s}=await $e.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 580px;">
        <div class="vs-modal-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
          <h2 class="vs-modal-title" style="margin: 0;">${L.zap} New Agent Action</h2>
          <button id="close-new-action-modal" style="background: none; border: none; cursor: pointer; color: var(--vs-text-ghost); padding: 4px; margin: -4px -4px 0 0; line-height: 0; border-radius: var(--radius-md); transition: color 0.15s ease;" onmouseenter="this.style.color='var(--vs-text-primary)'" onmouseleave="this.style.color='var(--vs-text-ghost)'">${L.x}</button>
        </div>
        <div class="vs-modal-body" style="padding: 20px;">
          <p class="text-sm text-vs-text-secondary" style="margin-bottom: 16px;">Choose a template to get started:</p>
          <div id="template-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          ">
            ${n.map(l=>`
              <button class="vs-template-card" data-template-id="${y(l.id)}" style="
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 12px; border-radius: 10px;
                border: 1.5px solid var(--vs-border);
                background: var(--vs-bg-floating);
                cursor: pointer; transition: all 0.15s ease;
                text-align: center; gap: 6px;
              ">
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${_m[l.id]||L.zap}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary);">${y(l.name)}</span>
                <span style="font-size: 11px; color: var(--vs-text-tertiary); line-height: 1.3;">${y(l.description||"")}</span>
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
              <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: transparent; color: var(--vs-text-ghost);">${L.plus}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-secondary);">Blank</span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.3;">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(l=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(l)},a=l=>{l.key==="Escape"&&(l.preventDefault(),i())};document.addEventListener("keydown",a),Ie(o,i),(r=document.getElementById("close-new-action-modal"))==null||r.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(l=>{l.addEventListener("mouseenter",()=>{l.style.borderColor="var(--vs-accent)",l.style.background="var(--vs-bg-raised)"}),l.addEventListener("mouseleave",()=>{l.style.borderColor=(l.dataset.templateId==="blank","var(--vs-border)"),l.style.background=l.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),l.addEventListener("click",async()=>{var c,d;let p=l.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(u=>{u.style.pointerEvents="none",u.style.opacity="0.5"}),l.style.opacity="1",l.style.borderColor="var(--vs-accent)",p==="blank"){let u={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"email",type:"email",label:"Email",placeholder:"you@example.com",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:v,data:f}=await $e.post("/agentic/actions",u);v&&(f!=null&&f.action)?(A("Action created","success"),i({ok:!0,actionId:f.action.id})):(A(((c=f==null?void 0:f.error)==null?void 0:c.message)||"Failed to create action","error"),i())}else{let{ok:u,data:v}=await $e.post("/agentic/actions/from-template",{template_id:p});u&&(v!=null&&v.action)?(A(`${v.action.name} created`,"success"),i({ok:!0,actionId:v.action.id})):(A(((d=v==null?void 0:v.error)==null?void 0:d.message)||"Failed to create action","error"),i())}})})})}function hc(e){return setTimeout(()=>na(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function na(e){var p,c,d,u,v,f,b,h,g,m,x,w,E,k,$,S,_,q,K,O;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await $e.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,r=i.stats||{},l=a.active;if(t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${y(a.name||e)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${y(a.name||e)}</h1>
        <div class="flex items-center gap-2 flex-wrap">
          <button id="btn-toggle-active" class="vs-btn ${l?"vs-btn-secondary":"vs-btn-primary"} vs-btn-sm" title="${l?"Deactivate this action":"Activate this action on your website"}">
            ${l?"\u25CF Live \u2014 click to deactivate":"\u25CB Draft \u2014 click to go live"}
          </button>
          <button id="btn-duplicate-action" class="vs-btn vs-btn-ghost vs-btn-sm" title="Duplicate">
            ${L.copy} Duplicate
          </button>
          <button id="btn-delete-action" class="vs-btn vs-btn-ghost vs-btn-sm" style="color: var(--vs-error);" title="Delete">
            ${L.trash}
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
        <span class="vs-form-stat-value" style="color: var(--vs-info)">${((p=r.by_status)==null?void 0:p.pending)||0}</span>
        <span class="vs-form-stat-label">Pending</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${((c=r.by_status)==null?void 0:c.confirmed)||0}</span>
        <span class="vs-form-stat-label">Confirmed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${((d=r.by_status)==null?void 0:d.completed)||0}</span>
        <span class="vs-form-stat-label">Completed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${r.today||0}</span>
        <span class="vs-form-stat-label">Today</span>
      </div>
    </div>
  `,s){let U=function(R){let N=R.querySelector(".field-required");if(!N)return;let te=R.querySelectorAll("span")[0],se=R.querySelectorAll("span")[1],Ee=()=>{te.style.background=N.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",se.style.left=N.checked?"18px":"2px"};N.addEventListener("change",Ee)},pe=function(R){return R.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},fe=function(){let R=document.querySelectorAll("#action-fields-builder .vs-field-row"),N=[],te=new Set;return R.forEach(se=>{var F,V,z,ne;let Ee=((V=(F=se.querySelector(".field-label"))==null?void 0:F.value)==null?void 0:V.trim())||"",Q=((z=se.querySelector(".field-type"))==null?void 0:z.value)||"text",I=((ne=se.querySelector(".field-required"))==null?void 0:ne.checked)||!1,M=Ee?pe(Ee):"";if(te.has(M)){let Z=2;for(;te.has(M+"_"+Z);)Z++;M=M+"_"+Z}if(te.add(M),M&&Ee){let Z={name:M,type:Q,label:Ee,required:I},oe=se.dataset.placeholder;oe&&(Z.placeholder=oe);let re=se.dataset.default;re&&(Z.default_value=re);let de=se.dataset.description;de&&(Z.description=de);let xe=se.dataset.min;xe!==""&&xe!==void 0&&(Z.min=Number(xe));let me=se.dataset.max;me!==""&&me!==void 0&&(Z.max=Number(me));let qe=se.dataset.maxlength;qe&&(Z.max_length=Number(qe));let be=se.dataset.minlength;be&&(Z.min_length=Number(be));let he=se.dataset.options;if(he)try{Z.options=JSON.parse(he)}catch{Z.options=he.split(",").map(nt=>nt.trim()).filter(Boolean)}if(Q==="file"){let _e=se.dataset.allowedExtensions;if(_e)try{Z.allowed_extensions=JSON.parse(_e)}catch{Z.allowed_extensions=_e.split(",").map(le=>le.trim().toLowerCase()).filter(Boolean)}let nt=se.dataset.maxSizeMb;nt&&(Z.max_size_mb=Number(nt))}Q==="checkbox"&&se.dataset.checkedDefault==="true"&&(Z.checked_default=!0),N.push(Z)}}),N},Je=function(R){var N,te;(N=R.querySelector(".field-move-up"))==null||N.addEventListener("click",()=>{let se=R.previousElementSibling;se&&(R.parentNode.insertBefore(R,se),R.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>R.style.boxShadow="",300))}),(te=R.querySelector(".field-move-down"))==null||te.addEventListener("click",()=>{let se=R.nextElementSibling;se&&(R.parentNode.insertBefore(se,R),R.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>R.style.boxShadow="",300))})},ze=function(R){R.addEventListener("click",async()=>{let N=R.closest(".vs-field-row");await Ae({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&(N.style.opacity="0",N.style.transform="translateX(20px)",N.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>N.remove(),200))})},gt=function(R){R&&R.addEventListener("click",()=>{var Ee,Q,I;let N=R.closest(".vs-field-row");if(!N)return;let te=((Ee=N.querySelector(".field-type"))==null?void 0:Ee.value)||"text",se=((Q=N.querySelector(".field-label"))==null?void 0:Q.value)||((I=N.querySelector(".field-name"))==null?void 0:I.value)||"Field";At(N,te,se)})},At=function(R,N,te){var le,Le,Xt,Bt,tt;(le=document.getElementById("vs-field-settings-modal"))==null||le.remove();let se=R.dataset.placeholder||"",Ee=R.dataset.default||"",Q=R.dataset.min||"",I=R.dataset.max||"",M=R.dataset.maxlength||"",F=R.dataset.options||"[]",V=R.dataset.description||"",z=["text","email","tel","url","textarea"].includes(N),ne=N==="number",Z=["text","email","tel","url","textarea"].includes(N),oe=["select","radio","multiselect"].includes(N),re=N==="multiselect",de=N==="file",xe=N==="checkbox",me="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",qe="margin-bottom: 16px;",be="";if(z&&(be+=`<div style="${qe}">
          <label style="${me}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${X(se)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),!de&&!xe&&(be+=`<div style="${qe}">
          <label style="${me}">Default Value</label>
          <input type="${ne?"number":"text"}" id="fs-default" class="vs-input" value="${X(Ee)}" placeholder="Pre-filled value" />
        </div>`),xe&&(be+=`<div style="${qe}">
          <label style="${me}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked \u2014 defaults to field name if empty)</span></label>
          <input type="text" id="fs-default" class="vs-input" value="${X(Ee)}" placeholder="e.g. yes, true, 1" />
        </div>
        <div style="${qe}">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="fs-checked-default" ${R.dataset.checkedDefault==="true"?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${R.dataset.checkedDefault==="true"?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span style="
                position: absolute; left: ${R.dataset.checkedDefault==="true"?"18px":"2px"}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <span style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary);">Selected by default</span>
          </label>
        </div>`),ne&&(be+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${qe}">
          <div>
            <label style="${me}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${X(Q)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${me}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${X(I)}" placeholder="No limit" />
          </div>
        </div>`),Z&&(be+=`<div style="${qe}">
          <label style="${me}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${X(M)}" placeholder="No limit" min="1" />
        </div>`),oe){let De;try{De=JSON.parse(F)}catch{De=F.split(",").map(Ze=>Ze.trim()).filter(Boolean)}let We;if(re){let He=(R.dataset.default||"").split(",").map(Ze=>Ze.trim()).filter(Boolean);We=De.map(Ze=>He.includes(Ze)?"[x] "+Ze:Ze).join(`
`)}else We=De.join(`
`);be+=`<div style="${qe}">
          <label style="${me}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${re?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${re?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${y(We)}</textarea>
        </div>`}if(de){let De=R.dataset.allowedExtensions||"",We=R.dataset.maxSizeMb||"10",He;try{He=De?JSON.parse(De):[]}catch{He=[]}let Ze=He.join(", "),Ht=["pdf","doc","docx","xls","xlsx","csv","txt"],po=["jpg","jpeg","png","gif","webp"],uo=["zip","rar"],_i=Ht.some(zs=>He.includes(zs)),Li=po.some(zs=>He.includes(zs)),Ti=uo.some(zs=>He.includes(zs));be+=`<div style="${qe}">
          <label style="${me}">Allowed File Types</label>
          <div style="display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Ht)}' ${_i?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Documents
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(po)}' ${Li?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Images
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(uo)}' ${Ti?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Archives
            </label>
          </div>
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${X(Ze)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${qe}">
          <label style="${me}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${X(We)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`}be+=`<div style="${qe}">
        <label style="${me}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${X(V)}" placeholder="Optional description or instructions" />
      </div>`;let he=document.createElement("div");if(he.id="vs-field-settings-modal",he.style.cssText="position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;",he.innerHTML=`
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
                ${y(te)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${N}
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
            ${be}
          </div>
          <div style="
            padding: 16px 24px; border-top: 1px solid var(--vs-border-subtle);
            display: flex; justify-content: flex-end; gap: 8px;
          ">
            <button id="fs-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
            <button id="fs-save" class="vs-btn vs-btn-primary vs-btn-sm">Apply</button>
          </div>
        </div>
      `,document.body.appendChild(he),setTimeout(()=>{var De;return(De=he.querySelector("input, textarea"))==null?void 0:De.focus()},100),de&&he.querySelectorAll(".fs-ext-group").forEach(De=>{De.addEventListener("change",()=>{let We=he.querySelector("#fs-allowed-extensions");if(!We)return;let He=We.value.split(",").map(Ht=>Ht.trim().toLowerCase()).filter(Boolean),Ze=JSON.parse(De.dataset.exts||"[]");De.checked?Ze.forEach(Ht=>{He.includes(Ht)||He.push(Ht)}):He=He.filter(Ht=>!Ze.includes(Ht)),We.value=He.join(", ")})}),xe){let De=(Le=he.querySelector("#fs-checked-default"))==null?void 0:Le.closest("label");if(De){let We=he.querySelector("#fs-checked-default"),He=De.querySelectorAll("span > span")[0],Ze=De.querySelectorAll("span > span")[1];We==null||We.addEventListener("change",()=>{He&&(He.style.background=We.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),Ze&&(Ze.style.left=We.checked?"18px":"2px")})}}let _e=()=>he.remove(),nt=he.querySelector("#fs-backdrop");nt&&Ie(nt,_e),(Xt=he.querySelector("#fs-close"))==null||Xt.addEventListener("click",_e),(Bt=he.querySelector("#fs-cancel"))==null||Bt.addEventListener("click",_e);let Et=De=>{De.key==="Escape"&&(_e(),document.removeEventListener("keydown",Et))};document.addEventListener("keydown",Et),(tt=he.querySelector("#fs-save"))==null||tt.addEventListener("click",()=>{var De,We,He,Ze,Ht,po,uo,_i,Li,Ti;if(z&&(R.dataset.placeholder=((De=he.querySelector("#fs-placeholder"))==null?void 0:De.value)||""),de||(R.dataset.default=((We=he.querySelector("#fs-default"))==null?void 0:We.value)||""),xe&&(R.dataset.checkedDefault=(He=he.querySelector("#fs-checked-default"))!=null&&He.checked?"true":"false"),ne&&(R.dataset.min=((Ze=he.querySelector("#fs-min"))==null?void 0:Ze.value)||"",R.dataset.max=((Ht=he.querySelector("#fs-max"))==null?void 0:Ht.value)||""),Z&&(R.dataset.maxlength=((po=he.querySelector("#fs-maxlength"))==null?void 0:po.value)||""),oe){let vo=(((uo=he.querySelector("#fs-options"))==null?void 0:uo.value)||"").split(/[\n]/).map(vn=>vn.trim()).filter(Boolean);if(re){let vn=[],Ii=[];vo.forEach(Rl=>{let Ya=Rl.match(/^\[x\]\s*(.+)$/i);Ya?(vn.push(Ya[1].trim()),Ii.push(Ya[1].trim())):vn.push(Rl)}),R.dataset.options=JSON.stringify(vn),R.dataset.default=Ii.join(",")}else R.dataset.options=JSON.stringify(vo)}if(de){let vo=(((_i=he.querySelector("#fs-allowed-extensions"))==null?void 0:_i.value)||"").split(",").map(Ii=>Ii.trim().toLowerCase()).filter(Boolean);R.dataset.allowedExtensions=vo.length>0?JSON.stringify(vo):"";let vn=((Li=he.querySelector("#fs-max-size-mb"))==null?void 0:Li.value)||"10";R.dataset.maxSizeMb=String(Math.min(Math.max(parseInt(vn)||10,1),50))}R.dataset.description=((Ti=he.querySelector("#fs-description"))==null?void 0:Ti.value)||"",R.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>R.style.boxShadow="",400),_e(),A("Field settings updated","success")})},W="make_"+e.replace(/-/g,"_"),G={number:"number",checkbox:"boolean",multiselect:"array"},J={},T=[];(a.fields||[]).forEach(R=>{let te={type:G[R.type]||"string"},se=R.label||R.name;R.require_future?te.description=se+" (must be in the future)":se&&(te.description=se),R.min!==void 0&&R.min!==""&&(te.minimum=R.min),R.max!==void 0&&R.max!==""&&(te.maximum=R.max),R.min_length&&(te.minLength=R.min_length),R.max_length&&(te.maxLength=R.max_length),R.options&&R.options.length>0&&(R.type==="multiselect"?te.items={type:"string",enum:R.options}:te.enum=R.options),J[R.name]=te,R.required&&T.push(R.name)});let C={name:W,description:a.description||a.name,inputSchema:{type:"object",properties:J,required:T}},j=JSON.stringify(C,null,2),B=y(j),P=l?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">\u25CF Discoverable by agents</span>':'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">\u25CB Draft \u2014 not visible to agents</span>',H=['<div style="margin-bottom: 16px;">','<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">','<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',`<code style="font-size:13px;font-weight:600;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">`+y(W)+"</code>","</div>",'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">','<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'," /mcp.php","</span>",'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'," /actions/manifest.json","</span>",P,"</div>","</div>",'<div style="position: relative;">',`<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">`+B+"</code></pre>",`<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor='var(--vs-border)';this.style.color='var(--vs-text-secondary)';" onmouseleave="this.style.borderColor='var(--vs-border-subtle)';this.style.color='var(--vs-text-ghost)';">`+L.copy+"</button>","</div>",'<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',`This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site's MCP endpoint.<br>`,'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',"</p>"].join("");s.innerHTML=`
      <div class="vs-settings-card" style="margin-top: 16px;">
        <h2 class="vs-settings-card-title">Action</h2>
        <div class="flex flex-col gap-4">
          <div>
            <label for="action-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Name <span style="font-weight: 400; color: var(--vs-text-ghost);">\u2014 form title and email subject</span></label>
            <input type="text" id="action-name" class="vs-input" value="${y(a.name||"")}" />
          </div>
          <div>
            <label for="action-description" class="block text-sm font-medium text-vs-text-secondary mb-1">Description <span style="font-weight: 400; color: var(--vs-text-ghost);">\u2014 shown to visitors and AI agents</span></label>
            <input type="text" id="action-description" class="vs-input" value="${y(a.description||"")}" placeholder="e.g. Register for our quarterly workshops" />
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Actions Bar</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">How this action appears on your website.</p>
            <div style="margin-bottom: 12px;">
              <label for="action-button-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Button Label</label>
              <input type="text" id="action-button-label" class="vs-input" value="${y(a.bar_button_label||"")}" placeholder="${X(a.name||"e.g. Register")}" />
              <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Short label for the bar button. Defaults to the action name.</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-vs-text-secondary mb-1">Icon</label>
              <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${[["calendar","Calendar"],["clock","Clock"],["utensils","Utensils"],["file-text","Document"],["list","List"],["shopping-bag","Shop"],["ticket","Ticket"],["message-square","Message"],["users","People"],["mail","Mail"],["star","Star"],["circle","Default"]].map(([R,N])=>`
                  <button type="button" class="vs-icon-pick" data-icon="${R}" title="${N}" style="
                    display: flex; align-items: center; justify-content: center;
                    width: 42px; height: 42px; border-radius: var(--radius-md);
                    border: 1.5px solid ${(a.icon||"circle")===R?"var(--vs-accent)":"var(--vs-border)"};
                    background: ${(a.icon||"circle")===R?"var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))":"var(--vs-bg-floating)"};
                    color: ${(a.icon||"circle")===R?"var(--vs-accent)":"var(--vs-text-ghost)"};
                    cursor: pointer; transition: all 0.15s ease;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',"shopping-bag":'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',circle:'<circle cx="12" cy="12" r="10"/>'}[R]}</svg></button>
                `).join("")}
              </div>
              <input type="hidden" id="action-icon" value="${y(a.icon||"circle")}" />
            </div>
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Submission Rules</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">Control how submissions are handled.</p>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                  <input type="checkbox" id="action-allow-duplicates" ${(v=(u=a.constraints)==null?void 0:u.uniqueness)!=null&&v.enabled?"":"checked"} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                  <span class="vs-toggle-track" style="
                    position: absolute; inset: 0; border-radius: 10px;
                    background: ${(b=(f=a.constraints)==null?void 0:f.uniqueness)!=null&&b.enabled?"var(--vs-border-medium, #ccc)":"var(--vs-accent)"};
                    transition: background 0.2s ease;
                  "></span>
                  <span class="vs-toggle-thumb" style="
                    position: absolute; left: ${(g=(h=a.constraints)==null?void 0:h.uniqueness)!=null&&g.enabled?"2px":"18px"}; top: 2px;
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: left 0.2s ease;
                  "></span>
                </span>
                <span style="font-size: 13px; color: var(--vs-text-secondary);">Same email can submit multiple times</span>
              </label>
            </div>
            <div id="action-duplicate-msg-wrap" style="${(x=(m=a.constraints)==null?void 0:m.uniqueness)!=null&&x.enabled?"":"display: none;"}">
              <label for="action-duplicate-msg" class="block text-sm font-medium text-vs-text-secondary mb-1">Rejection message</label>
              <input type="text" id="action-duplicate-msg" class="vs-input" value="${y(((w=a.responses)==null?void 0:w.duplicate)||"")}"
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
          <button id="btn-add-field" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-bottom: 12px;">${L.plus||"+"} Add Field</button>
        </div>
        <div id="action-fields-builder" style="display: flex; flex-direction: column; gap: 6px;">
          ${(a.fields||[]).map((R,N)=>`
            <div class="vs-field-row" data-field-idx="${N}"
              data-field-name="${X(R.name||"")}"
              data-placeholder="${X(R.placeholder||"")}"
              data-default="${X(R.default_value||R.default||"")}"
              data-min="${R.min!==void 0?R.min:""}"
              data-max="${R.max!==void 0?R.max:""}"
              data-maxlength="${R.max_length||""}"
              data-minlength="${R.min_length||""}"
              data-options="${X(JSON.stringify(R.options||[]))}"
              data-description="${X(R.description||"")}"
              ${R.allowed_extensions?`data-allowed-extensions="${X(JSON.stringify(R.allowed_extensions))}"`:""}
              ${R.max_size_mb?`data-max-size-mb="${R.max_size_mb}"`:""}
              ${R.checked_default?'data-checked-default="true"':""}
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
                " ${N===0?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${N===(a.fields||[]).length-1?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${y(R.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(te=>`<option value="${te}" ${R.type===te?"selected":""}>${te==="multiselect"?"multi-select":te}</option>`).join("")}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${R.required?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${R.required?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${R.required?"18px":"2px"}; top: 2px;
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
                ${L.trash}
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
          ${H}
        </div>
      </details>
    `,document.querySelectorAll(".field-required").forEach(R=>{U(R.closest("label"))});let ee=document.getElementById("action-allow-duplicates");if(ee){let R=ee.closest("label"),N=R==null?void 0:R.querySelector(".vs-toggle-track"),te=R==null?void 0:R.querySelector(".vs-toggle-thumb");ee.addEventListener("change",()=>{N&&(N.style.background=ee.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),te&&(te.style.left=ee.checked?"18px":"2px");let se=document.getElementById("action-duplicate-msg-wrap");se&&(se.style.display=ee.checked?"none":"")})}document.querySelectorAll(".vs-icon-pick").forEach(R=>{R.addEventListener("mouseenter",()=>{var N;R.dataset.icon!==((N=document.getElementById("action-icon"))==null?void 0:N.value)&&(R.style.borderColor="var(--vs-accent)",R.style.color="var(--vs-text-secondary)")}),R.addEventListener("mouseleave",()=>{var N;R.dataset.icon!==((N=document.getElementById("action-icon"))==null?void 0:N.value)&&(R.style.borderColor="var(--vs-border)",R.style.color="var(--vs-text-ghost)")}),R.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach(N=>{N.style.borderColor="var(--vs-border)",N.style.background="var(--vs-bg-floating)",N.style.color="var(--vs-text-ghost)"}),R.style.borderColor="var(--vs-accent)",R.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",R.style.color="var(--vs-accent)",document.getElementById("action-icon").value=R.dataset.icon})}),(E=document.getElementById("btn-save-action"))==null||E.addEventListener("click",async()=>{var Q,I,M,F,V,z,ne,Z,oe;if(Js()||Cn())return;let R={...a};if(R.name=((Q=document.getElementById("action-name"))==null?void 0:Q.value)||a.name,R.bar_button_label=((I=document.getElementById("action-button-label"))==null?void 0:I.value)||"",R.description=((M=document.getElementById("action-description"))==null?void 0:M.value)||"",R.icon=((F=document.getElementById("action-icon"))==null?void 0:F.value)||"circle",((V=document.getElementById("action-allow-duplicates"))==null?void 0:V.checked)??!0)(z=R.constraints)!=null&&z.uniqueness&&(R.constraints.uniqueness.enabled=!1);else{let re=(a.fields||[]).filter(xe=>xe.type==="email").map(xe=>xe.name),de=re.length>0?re:["email"];R.constraints={...R.constraints||{},uniqueness:{enabled:!0,fields:de,scope_statuses:["confirmed","pending"]}}}let te=((ne=document.getElementById("action-duplicate-msg"))==null?void 0:ne.value)||"";te?R.responses={...R.responses||{},duplicate:te}:(Z=R.responses)!=null&&Z.duplicate&&delete R.responses.duplicate;let{ok:se,data:Ee}=await $e.put(`/agentic/actions/${encodeURIComponent(e)}`,R);A(se?"Action saved":((oe=Ee==null?void 0:Ee.error)==null?void 0:oe.message)||"Failed to save",se?"success":"error"),se&&na(e)});async function Oe(){var I;let R=document.querySelectorAll("#action-fields-builder .vs-field-row"),N=!1;if(R.forEach(M=>{var V,z;((z=(V=M.querySelector(".field-label"))==null?void 0:V.value)==null?void 0:z.trim())||(N=!0,M.style.borderColor="var(--vs-error, #ef4444)",M.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{M.style.borderColor="var(--vs-border-subtle)",M.style.boxShadow=""},2e3))}),N){A("Every field needs a label","warning");return}let te=fe();if(te.length===0){A("At least one field is required","warning");return}let se={...a,fields:te},{ok:Ee,data:Q}=await $e.put(`/agentic/actions/${encodeURIComponent(e)}`,se);A(Ee?"Fields saved":((I=Q==null?void 0:Q.error)==null?void 0:I.message)||"Failed to save",Ee?"success":"error"),Ee&&na(e)}(k=document.getElementById("btn-save-fields"))==null||k.addEventListener("click",Oe),($=document.getElementById("btn-add-field"))==null||$.addEventListener("click",()=>{var se,Ee;let R=document.getElementById("action-fields-builder");if(!R)return;let N=document.createElement("div");N.className="vs-field-row",N.dataset.fieldName="",N.dataset.placeholder="",N.dataset.default="",N.dataset.min="",N.dataset.max="",N.dataset.maxlength="",N.dataset.options="",N.dataset.description="",N.style.cssText=`
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;let te='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';N.innerHTML=`
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
          ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(Q=>`<option value="${Q}">${Q==="multiselect"?"multi-select":Q}</option>`).join("")}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${te}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${L.trash}
        </button>
      `,R.appendChild(N),(se=N.querySelector(".field-label"))==null||se.focus(),U((Ee=N.querySelector(".field-required"))==null?void 0:Ee.closest("label")),Je(N),ze(N.querySelector(".field-delete")),gt(N.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(Je),document.querySelectorAll(".field-delete").forEach(ze),document.querySelectorAll(".field-settings").forEach(gt),(S=document.getElementById("btn-copy-schema"))==null||S.addEventListener("click",()=>{var N;let R=((N=document.getElementById("agent-schema-json"))==null?void 0:N.textContent)||"";navigator.clipboard.writeText(R).then(()=>{A("Schema copied","success")}).catch(()=>{let te=document.createElement("textarea");te.value=R,te.style.position="fixed",te.style.opacity="0",document.body.appendChild(te),te.select(),document.execCommand("copy"),document.body.removeChild(te),A("Schema copied","success")})}),(_=document.getElementById("agent-preview-section"))==null||_.addEventListener("toggle",R=>{let N=R.target.querySelector(".agent-preview-chevron");N&&(N.style.transform=R.target.open?"rotate(180deg)":"rotate(0)")}),(q=document.getElementById("btn-toggle-active"))==null||q.addEventListener("click",async()=>{if(Js()||Cn())return;let R={...a,active:!l},{ok:N}=await $e.put(`/agentic/actions/${encodeURIComponent(e)}`,R);N?(A(R.active?"Action activated":"Action deactivated","success"),na(e)):A("Failed to update status","error")}),(K=document.getElementById("btn-duplicate-action"))==null||K.addEventListener("click",async()=>{var se;if(Js()||Cn()||!await Ae({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:N,data:te}=await $e.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});N&&(te!=null&&te.action)?(A(`"${te.action.name}" created`,"success"),window.location.hash=`#/actions/${te.action.id}`):A(((se=te==null?void 0:te.error)==null?void 0:se.message)||"Failed to duplicate","error")}),(O=document.getElementById("btn-delete-action"))==null||O.addEventListener("click",async()=>{if(Js()||Cn())return;if(await Ae({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:N}=await $e.delete(`/agentic/actions/${encodeURIComponent(e)}`);N?(A("Action deleted","success"),window.location.hash="#/actions"):A("Failed to delete action","error")}})}await Kn(e,1)}async function Kn(e,t=1){var f,b,h,g,m,x,w,E;let s=document.getElementById("action-records");if(!s)return;let n=((f=document.getElementById("action-filter-status"))==null?void 0:f.value)||"all",o=((b=document.getElementById("action-filter-search"))==null?void 0:b.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:r}=await $e.get(i);if(!a||!r){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let l=r.records||[],p=r.total||0,c=r.per_page||20,d=Math.ceil(p/c);s.innerHTML=`
    <div class="vs-settings-card" style="margin-top: 16px;">
      <h2 class="vs-settings-card-title">Submissions</h2>
      <div class="vs-form-filter-bar" style="margin-bottom: 12px;">
        <div class="vs-form-filter-controls">
          <select id="action-filter-status" class="vs-input vs-input-compact">
            <option value="all" ${n==="all"?"selected":""}>All statuses</option>
            <option value="pending" ${n==="pending"?"selected":""}>Pending</option>
            <option value="confirmed" ${n==="confirmed"?"selected":""}>Confirmed</option>
            <option value="completed" ${n==="completed"?"selected":""}>Completed</option>
            <option value="cancelled" ${n==="cancelled"?"selected":""}>Cancelled</option>
            <option value="no-show" ${n==="no-show"?"selected":""}>No-show</option>
          </select>
          <input type="text" id="action-filter-search" class="vs-input vs-input-compact vs-form-filter-search" placeholder="Search submissions..." value="${y(o)}" />
        </div>
        <div class="vs-form-filter-actions">
          ${window.IS_DEMO?"":`<button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old submissions" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""}>
            ${L.trash} Purge Old
          </button>`}

          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${p===0?"No submissions to export":"Download submissions as CSV"}">
            ${L.download} Export CSV
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
              ${l.map(k=>{let $=typeof k.data=="string"?JSON.parse(k.data):k.data,S=Object.fromEntries(Object.entries($||{}).filter(([J])=>!J.startsWith("_"))),_=Object.values(S).filter(J=>typeof J=="string"&&J.length>0).slice(0,2).join(" \xB7 "),q=Object.values(S).filter(J=>J&&typeof J=="object"&&J.original_name).length,K=q>0?`<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${_?"6px":"0"};" title="${q} file${q>1?"s":""} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${q>1?'<span style="font-size: 10px;">'+q+"</span>":""}</span>`:"",O=_||(q>0?"":"\u2014"),W=Rr[k.status]||Rr.pending,G=k.source==="web"?"Website":k.source==="mcp"?"MCP":k.source==="api"?"API":k.source||"Website";return`
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${k.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${k.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${y(k.confirmation_code||"\u2014")}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${y(O)}</span>${K}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${k.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                        ${Object.entries(Rr).map(([J,T])=>`<option value="${J}" ${k.status===J?"selected":""}>${T.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${G}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${xo(k.created_at)}</td>
                    ${window.IS_DEMO?'<td style="width: 32px;"></td>':`<td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${k.id}" title="Delete submission" style="
                        border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                        display: inline-flex; align-items: center; border-radius: var(--radius-md);
                        transition: color 0.12s, background 0.12s;
                      " onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';" onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>`}
                  </tr>
                  <tr class="vs-record-detail" data-detail-for="${k.id}" style="display: none;">
                    <td colspan="7" style="padding: 0 12px 12px 44px; background: var(--vs-bg-recessed, var(--vs-bg-ghost));">
                      <div style="
                        display: grid; grid-template-columns: auto 1fr; gap: 4px 16px;
                        font-size: 12px; padding: 12px 0;
                      ">
                        ${Object.entries(S).map(([J,T])=>{if(T&&typeof T=="object"&&T.path&&T.original_name){let C=T.size<1024?T.size+" B":T.size<1048576?Math.round(T.size/1024)+" KB":(T.size/1048576).toFixed(1)+" MB";return`
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(J.replace(/_/g," "))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="${Ce("api/router.php")}?_path=/agentic/actions/${encodeURIComponent(e)}/records/${k.id}/files/${encodeURIComponent(J)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${y(T.original_name)} (${C})
                                </a>
                              </div>
                            `}return`
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(J.replace(/_/g," "))}</div>
                            <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${y(String(T||"\u2014"))}</div>
                          `}).join("")}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>

        ${d>1?`
          <div class="flex items-center justify-between" style="padding: 12px 0; font-size: 13px;">
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-prev" ${t<=1?"disabled":""} data-page="${t-1}">\u2190 Previous</button>
            <span class="text-vs-text-tertiary">Page ${t} of ${d} \xB7 ${p} submission${p!==1?"s":""}</span>
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-next" ${t>=d?"disabled":""} data-page="${t+1}">Next \u2192</button>
          </div>
        `:`
          <div class="text-sm text-vs-text-ghost text-center" style="padding: 8px 0;">${p} submission${p!==1?"s":""}</div>
        `}
      `}
    </div>
  `;let u=null,v=()=>Kn(e,1);(h=document.getElementById("action-filter-status"))==null||h.addEventListener("change",v),(g=document.getElementById("action-filter-search"))==null||g.addEventListener("input",()=>{clearTimeout(u),u=setTimeout(v,300)}),(m=document.getElementById("action-records-prev"))==null||m.addEventListener("click",k=>{let $=parseInt(k.currentTarget.dataset.page);$>=1&&Kn(e,$)}),(x=document.getElementById("action-records-next"))==null||x.addEventListener("click",k=>{let $=parseInt(k.currentTarget.dataset.page);$<=d&&Kn(e,$)}),s.querySelectorAll(".vs-record-toggle").forEach(k=>{k.addEventListener("click",()=>{let $=k.dataset.rid,S=s.querySelector(`.vs-record-detail[data-detail-for="${$}"]`);if(!S)return;let _=S.style.display!=="none";S.style.display=_?"none":"table-row",k.style.transform=_?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(k=>{k.addEventListener("change",async $=>{var K;if(Js()){k.value=((K=k.querySelector("[selected]"))==null?void 0:K.value)||"pending";return}if(Cn())return;let S=$.target.dataset.recordId,_=$.target.value,{ok:q}=await $e.put(`/agentic/actions/${encodeURIComponent(e)}/records/${S}`,{status:_});A(q?"Status updated":"Failed to update",q?"success":"error")})}),(w=document.getElementById("btn-purge-records"))==null||w.addEventListener("click",async()=>{var q,K;if(Js()||Cn())return;let k=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],$=document.getElementById("vs-purge-overlay");$&&$.remove();let S=document.createElement("div");S.id="vs-purge-overlay",S.className="vs-modal-overlay",S.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Submissions</h2>
          <p class="vs-modal-desc">Remove submissions older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${k.map(O=>`<option value="${O.days}">${O.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(S),requestAnimationFrame(()=>S.classList.add("is-visible"));let _=()=>Te(S);Ie(S,_),(q=document.getElementById("vs-purge-cancel"))==null||q.addEventListener("click",_),(K=document.getElementById("vs-purge-ok"))==null||K.addEventListener("click",async()=>{var j;let O=document.getElementById("vs-purge-select"),W=parseInt(O==null?void 0:O.value),G=((j=O==null?void 0:O.selectedOptions[0])==null?void 0:j.textContent)||"";if(_(),await new Promise(B=>setTimeout(B,200)),!await Ae({title:"Confirm Purge",description:`This will permanently delete all records "${G.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:T,data:C}=await $e.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:W});T?(A(`${(C==null?void 0:C.purged)||0} record(s) purged`,"success"),Kn(e,1)):A("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(k=>{k.addEventListener("click",async()=>{if(Js()||Cn())return;let $=k.dataset.rid;if(!await Ae({title:"Delete Submission",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:_}=await $e.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${$}`);_?(A("Submission deleted","success"),Kn(e,t)):A("Failed to delete submission","error")})}),(E=document.getElementById("btn-export-action-csv"))==null||E.addEventListener("click",async()=>{if(Js())return;let k=document.getElementById("btn-export-action-csv"),$=k.innerHTML;k.innerHTML=`${L.loader} Exporting...`,k.disabled=!0;try{let S=await fetch(`${Ce("")}api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!S.ok)throw new Error("Export failed");let _=await S.blob(),q=URL.createObjectURL(_),K=document.createElement("a");K.href=q,K.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(K),K.click(),K.remove(),URL.revokeObjectURL(q),A("CSV downloaded","success")}catch{A("Failed to export CSV","error")}k.innerHTML=$,k.disabled=!1})}var No=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Oo=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},ts={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function yc(){return setTimeout(()=>Lm(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function Lm(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await $e.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
        <a href="#/forms/${encodeURIComponent(o.id)}" class="vs-form-card" data-form-id="${y(o.id)}">
          <div class="vs-form-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/><path d="M8 13h3"/><path d="M8 17h6"/></svg>
          </div>
          <div class="vs-form-card-body">
            <div class="vs-form-card-name">${y(o.name)}</div>
            ${o.description?`<div class="vs-form-card-desc">${y(o.description)}</div>`:""}
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
  `}function xc(e){return setTimeout(()=>Tm(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function Tm(e){var u,v;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await $e.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/forms" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Forms</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${y(i.name||e)}</span>
      </div>
      <h1 class="vs-page-title">${y(i.name||e)}</h1>
      ${i.description?`<p class="vs-page-subtitle">${y(i.description)}</p>`:""}
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
      <div class="vs-form-filter-controls">
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
        <input type="text" id="form-filter-search" class="vs-input vs-input-compact vs-form-filter-search" placeholder="Search submissions..." />
      </div>
      <div class="vs-form-filter-actions">
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-upgrade-to-action" title="Convert this form into an agent action">
          ${L.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${a.total===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${a.total===0?"No submissions to export":"Download submissions as CSV"}">
          ${L.download} Export CSV
        </button>
      </div>
    </div>
  `;let r=document.getElementById("form-filter-status"),l=document.getElementById("form-filter-source"),p=document.getElementById("form-filter-search"),c=null,d=()=>oa(e,1);r==null||r.addEventListener("change",d),l==null||l.addEventListener("change",d),p==null||p.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(d,300)}),(u=document.getElementById("btn-export-csv"))==null||u.addEventListener("click",async()=>{let f=document.getElementById("btn-export-csv"),b=f.innerHTML;f.innerHTML=`${L.loader} Exporting...`,f.disabled=!0;try{let h=await fetch(`${Ce("")}api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!h.ok)throw new Error("Export failed");let g=await h.blob(),m=URL.createObjectURL(g),x=document.createElement("a");x.href=m,x.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(x),x.click(),x.remove(),URL.revokeObjectURL(m),A("CSV downloaded","success")}catch{A("Failed to export CSV","error")}f.innerHTML=b,f.disabled=!1}),(v=document.getElementById("btn-upgrade-to-action"))==null||v.addEventListener("click",async()=>{var x,w;if(No()||Oo())return;if(!(await $e.get("/agentic/actions")).ok){A("Could not inspect Action settings. Try again.","error");return}let b=(i.fields||[]).length;if(!await Ae({title:"Upgrade to Agent Action",description:`This will create a new agent action with${b>0?` the ${b} field${b!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let g=document.getElementById("btn-upgrade-to-action"),m=g.innerHTML;g.innerHTML=`${L.loader} Converting...`,g.disabled=!0,g.style.opacity="0.6";try{let E={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},k=[],$=0;(i.fields||[]).forEach(W=>{let G=E[W.type];if(!G){$++;return}let J={name:W.name,label:W.label||W.name,type:G,required:W.required||!1};(G==="select"||G==="radio")&&W.options&&(J.options=W.options.map(T=>String(typeof T=="object"?T.value:T))),W.placeholder&&(J.placeholder=W.placeholder),k.push(J)}),$>0&&A(`${$} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let S=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),_=Date.now().toString(36).slice(-4),q={id:S+"-"+_,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:k,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:K,data:O}=await $e.post("/agentic/actions",q);if(K&&(O!=null&&O.action))A(`"${O.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${O.action.id}`;else{let G=(((x=O==null?void 0:O.error)==null?void 0:x.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":((w=O==null?void 0:O.error)==null?void 0:w.message)||"Failed to create action";A(G,"error"),g.innerHTML=m,g.disabled=!1,g.style.opacity=""}}catch{A("Failed to convert form to action","error"),g.innerHTML=m,g.disabled=!1,g.style.opacity=""}}),await oa(e,1)}async function oa(e,t=1){var h,g,m;let s=document.getElementById("form-submissions");if(!s)return;let n=((h=document.getElementById("form-filter-status"))==null?void 0:h.value)||"all",o=((g=document.getElementById("form-filter-source"))==null?void 0:g.value)||"all",i=((m=document.getElementById("form-filter-search"))==null?void 0:m.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:r,data:l}=await $e.get(a);if(!r||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let p=l.submissions||[],c=l.total||0,d=l.per_page||20,u=Math.ceil(c/d);if(!p.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:v}=await $e.get(`/forms/${encodeURIComponent(e)}`),f=v==null?void 0:v.form,b={};f!=null&&f.fields&&f.fields.forEach(x=>{b[x.name]=x.label||x.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${p.map(x=>{let w=ts[x.status]||ts.new,E=Object.entries(x.data||{}).filter(([S])=>!S.startsWith("_")).slice(0,3).map(([S,_])=>{let q=b[S]||S,K=Array.isArray(_)?_.join(", "):String(_);return`<span class="vs-sub-field"><strong>${y(q)}:</strong> ${y(K.substring(0,80))}${K.length>80?"\u2026":""}</span>`}).join(""),k=xo(x.created_at),$=x.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${x.id}" data-form-id="${y(e)}" style="border-left-color: ${w.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${w.bg}; color: ${w.text};">${w.label}</span>
                ${$?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${y(k)}</span>
            </div>
            <div class="vs-submission-preview">
              ${E||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${x.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${x.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                ${Object.entries(ts).map(([S,_])=>`<option value="${S}" ${x.status===S?"selected":""}>${_.label}</option>`).join("")}
              </select>
              ${window.IS_DEMO?"":`<button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${x.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>`}
            </div>
          </div>
        `}).join("")}
    </div>

    ${u>1?`
      <div class="vs-pagination">
        ${t>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t-1}" data-form-id="${y(e)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${t} of ${u} \xB7 ${c} submission${c!==1?"s":""}</span>
        ${t<u?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t+1}" data-form-id="${y(e)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${c} submission${c!==1?"s":""}</span>
      </div>
    `}
  `,Im(e,t)}function Im(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;bc(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{var i;if(No()){s.value=s.dataset.originalValue||((i=s.querySelector("[selected]"))==null?void 0:i.value)||"new";return}if(Oo())return;let n=s.dataset.subId,{ok:o}=await $e.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){A("Status updated","success");let a=s.closest(".vs-submission-card"),r=ts[s.value];if(a&&r){a.style.borderLeftColor=r.text;let l=a.querySelector(".vs-status-pill");l&&(l.style.background=r.bg,l.style.color=r.text,l.textContent=r.label)}}else A("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{if(No()||Oo())return;let n=s.dataset.subId;if(!await Ae({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await $e.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(A("Submission deleted","success"),oa(e,t)):A("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);oa(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;bc(e,o)})})}async function bc(e,t){var d,u,v,f;(d=document.getElementById("submission-detail-overlay"))==null||d.remove();let{ok:s,data:n}=await $e.get(`/forms/${encodeURIComponent(e)}/submissions?record_id=${encodeURIComponent(t)}&per_page=1`);if(!s||!n)return;let o=(n.submissions||[]).find(b=>String(b.id)===String(t));if(!o){A("Submission not found","error");return}let{data:i}=await $e.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,r={};if(a!=null&&a.fields&&a.fields.forEach(b=>{r[b.name]=b.label||b.name}),o.status==="new"&&!window.IS_DEMO){let{ok:b}=await $e.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"});if(b){o.status="read";let h=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);h&&(h.value="read");let g=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(g){g.style.borderLeftColor=ts.read.text;let m=g.querySelector(".vs-status-pill");m&&(m.style.background=ts.read.bg,m.style.color=ts.read.text,m.textContent="Read")}}}let l=ts[o.status]||ts.new,p=document.createElement("div");p.id="submission-detail-overlay",p.className="vs-slide-overlay",p.innerHTML=`
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
              <span class="text-sm text-vs-text-tertiary font-mono">${y(o.ip_address)}</span>
            </div>
          `:""}
          ${o.referrer?`
            <div class="vs-sub-detail-row">
              <span class="vs-sub-detail-label">Referrer</span>
              <span class="text-sm text-vs-text-tertiary" style="word-break: break-all;">${y(o.referrer)}</span>
            </div>
          `:""}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Submitted Data</h3>
        <div class="vs-sub-detail-fields">
          ${Object.entries(o.data||{}).filter(([b])=>!b.startsWith("_")).map(([b,h])=>{let g=r[b]||b,m=Array.isArray(h)?h.join(", "):String(h);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${y(g)}</div>
                <div class="vs-sub-detail-field-value">${y(m)}</div>
              </div>
            `}).join("")}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Internal Notes</h3>
        <textarea id="sub-detail-notes" class="vs-input" style="min-height: 80px; resize: vertical;" placeholder="${window.IS_DEMO?"Notes are read-only in demo mode.":"Add private notes about this submission..."}" ${window.IS_DEMO?"readonly":""}>${y(o.notes||"")}</textarea>
        ${window.IS_DEMO?"":'<button id="btn-save-sub-notes" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-top: 8px;">Save Notes</button>'}

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Change Status</h3>
        <select id="sub-detail-status" class="vs-input" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
          ${Object.entries(ts).map(([b,h])=>`<option value="${b}" ${o.status===b?"selected":""}>${h.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(p),requestAnimationFrame(()=>{requestAnimationFrame(()=>p.classList.add("is-visible"))});let c=()=>{p.classList.remove("is-visible"),setTimeout(()=>p.remove(),200)};Ie(p,c),(u=document.getElementById("close-sub-detail"))==null||u.addEventListener("click",c),(v=document.getElementById("btn-save-sub-notes"))==null||v.addEventListener("click",async()=>{var g;if(No()||Oo())return;let b=((g=document.getElementById("sub-detail-notes"))==null?void 0:g.value)||"",{ok:h}=await $e.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:b});A(h?"Notes saved":"Failed to save notes",h?"success":"error")}),(f=document.getElementById("sub-detail-status"))==null||f.addEventListener("change",async b=>{if(No()){b.target.value=o.status;return}if(Oo())return;let h=b.target.value,{ok:g}=await $e.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:h});if(g){A("Status updated","success");let m=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);m&&(m.value=h);let x=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),w=ts[h];if(x&&w){x.style.borderLeftColor=w.text;let E=x.querySelector(".vs-status-pill");E&&(E.style.background=w.bg,E.style.color=w.text,E.textContent=w.label)}}else A("Failed to update status","error")})}function ia(e,t,s=null){if(!["create","update","delete","password"].includes(e))throw new Error("Unknown team action.");if(e!=="create"&&(!(s!=null&&s.id)||!s.version))throw new Error("Open the current team member before making this change.");let o=e==="create"?"/team":`/team/${s.id}${e==="password"?"/password":""}`,i=e==="update"?"put":e==="delete"?"delete":"post",a={...t,...s?{version:s.version}:{}},{password:r,...l}=a;return{endpoint:o,method:i,body:a,options:{retainInput:!1,publicInput:l}}}async function Dr(e){let t=await e("/team?limit=50");if(!t.ok)return t;let s=[...t.data.members],n=t.data.inventory_version,o=t.data.next_offset,i=1;for(;o!=null;){if(++i>200||s.length>=1e4)return{ok:!1,error:{code:"size_limit",message:"The team list exceeds the supported limit."}};let a=await e(`/team?limit=50&offset=${o}&inventory_version=${encodeURIComponent(n)}`);if(!a.ok)return a;if(a.data.inventory_version!==n||a.data.next_offset!==null&&a.data.next_offset<=o)return{ok:!1,error:{code:"content_conflict",message:"The team changed while loading. Open the list again."}};s.push(...a.data.members),o=a.data.next_offset}return{...t,data:{...t.data,members:s,next_offset:null}}}var qr=!1,Ho=new Map,la=null,da=null,Vt=!1,xt=null;function Ec(){return qr=!1,setTimeout(()=>{Am(),jo()},0),`
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 style="font-size: 20px; font-weight: 650; color: var(--vs-text-primary); letter-spacing: -0.025em; margin: 0;">Team</h1>
          <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 4px 0 0;">Manage who has access to this Studio.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-show-roles" class="vs-btn vs-btn-ghost vs-btn-sm" title="View role permissions">
            ${L.shield} Roles
          </button>
          <button id="btn-add-member" class="vs-btn vs-btn-primary vs-btn-sm">
            ${L.userPlus||L.plus} Add Member
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
  `}function $c(){return`
    <!-- Add/Edit Member Modal -->
    <div id="team-modal" class="vs-team-modal hidden" role="dialog" aria-modal="true" aria-labelledby="team-modal-title">
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
                ${L.rotateCcw}
              </button>
            </div>
            <p class="text-2xs text-vs-text-ghost mt-1.5">Share this password with the new team member. They can change it from their profile.</p>
          </div>
          <div id="team-modal-error" class="hidden text-sm text-vs-error" role="alert" tabindex="-1"></div>
          <button id="btn-team-review" class="vs-btn vs-btn-ghost vs-btn-sm" style="display:none">Discard these edits and review saved account</button>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end gap-2">
          <button id="btn-team-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
          <button id="btn-team-save" class="vs-btn vs-btn-primary vs-btn-sm">Add Member</button>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div id="team-pw-modal" class="vs-team-modal hidden" role="dialog" aria-modal="true" aria-labelledby="team-pw-title">
      <div class="vs-team-modal-backdrop" data-team-pw-overlay></div>
      <div class="vs-team-modal-card">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 id="team-pw-title" class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Reset Password</h2>
          <p id="team-pw-modal-subtitle" class="text-xs text-vs-text-ghost mt-1"></p>
        </div>
        <div class="px-6 py-5 flex flex-col gap-4">
          <input type="hidden" id="team-pw-user-id" value="" />
          <div>
            <label class="vs-input-label" for="team-new-password">New Password</label>
            <div class="flex gap-2">
              <input type="text" id="team-new-password" class="vs-input flex-1 font-mono" placeholder="At least 8 characters" />
              <button id="btn-pw-generate" class="vs-btn vs-btn-ghost vs-btn-sm" title="Generate random password">
                ${L.rotateCcw}
              </button>
            </div>
          </div>
          <div id="team-pw-error" class="hidden text-sm text-vs-error" role="alert" tabindex="-1"></div>
          <button id="btn-pw-review" class="vs-btn vs-btn-ghost vs-btn-sm" style="display:none">Discard this reset and review current account</button>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end gap-2">
          <button id="btn-pw-cancel" class="vs-btn vs-btn-ghost vs-btn-sm">Cancel</button>
          <button id="btn-pw-save" class="vs-btn vs-btn-primary vs-btn-sm">Reset Password</button>
        </div>
      </div>
    </div>

    <!-- Role Permissions Modal -->
    <div id="team-roles-modal" class="vs-team-modal hidden" role="dialog" aria-modal="true" aria-labelledby="team-roles-title">
      <div class="vs-team-modal-backdrop" data-team-roles-overlay></div>
      <div class="vs-team-modal-card" style="width: min(520px, calc(100vw - 2rem));">
        <div class="px-6 py-5 border-b border-vs-border-subtle">
          <h2 id="team-roles-title" class="text-base font-semibold text-vs-text-primary" style="letter-spacing: -0.01em;">Role Permissions</h2>
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
  `}function Mm(e){let t=D.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",r=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${L.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${X(e.name)}" title="Reset password">
        ${L.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${X(e.name)}" title="Remove">
        ${L.trash}
      </button>
    </div>
  `;return`
    <div class="vs-team-row">
      <div class="vs-team-row-identity">
        <div class="vs-team-avatar ${i}">
          ${y(e.name).charAt(0).toUpperCase()}
        </div>
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); letter-spacing: -0.01em;">${y(e.name)}</span>
            ${s?'<span style="font-size: 10px; color: var(--vs-text-ghost);">you</span>':""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${y(e.email)}</div>
        </div>
      </div>
      <div>
        <span class="vs-role-badge ${o} vs-role-badge-clickable" data-role-info>${e.role}</span>
      </div>
      <div class="vs-team-row-meta">${a}</div>
      ${r}
    </div>
  `}async function jo(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await Dr(Y.get);if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${y((n==null?void 0:n.message)||"Failed to load team members.")}</div>`;return}let o=(s==null?void 0:s.members)||[];Ho=new Map(o.map(i=>[i.id,i])),o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>Mm(i)).join("")}function Am(){var t,s,n,o,i,a,r,l,p,c,d;if(qr)return;qr=!0,(t=document.getElementById("btn-add-member"))==null||t.addEventListener("click",()=>{Or()}),(s=document.getElementById("btn-show-roles"))==null||s.addEventListener("click",wc);let e=document.getElementById("team-list");e&&e.addEventListener("click",async u=>{var m;let v=u.target;if(v.closest("[data-role-info]")){wc();return}let b=v.closest(".team-edit-btn");if(b){let x=Ho.get(Number(b.dataset.id));x&&Or({...x});return}let h=v.closest(".team-delete-btn");if(h){let x=h.dataset.id,w=h.dataset.name,E=Ho.get(Number(x));if(!(E!=null&&E.version)||!await Ae({title:"Remove Team Member",description:`Remove ${w} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let $=Xe(`/team/${x}`,"delete"),S=ia("delete",{},{...E,version:($==null?void 0:$.version)||E.version}),{ok:_,error:q}=await ye(S.endpoint,S.body,S.method,S.options);_?(A(`${w} has been removed.`,"success"),await jo(),(m=document.getElementById("btn-add-member"))==null||m.focus()):((q==null?void 0:q.code)==="content_conflict"&&await jo(),A((q==null?void 0:q.message)||"Failed to remove member.","error"));return}let g=v.closest(".team-pw-btn");if(g){let x=g.dataset.id,w=g.dataset.name;Sc(x,w);return}}),[["[data-team-modal-overlay]",aa],["[data-team-pw-overlay]",ra],["[data-team-roles-overlay]",Nr]].forEach(([u,v])=>{let f=document.querySelector(u);if(!f)return;let b=null;f.addEventListener("mousedown",h=>{b=h.target}),f.addEventListener("click",h=>{h.target===f&&b===f&&v()})}),(n=document.getElementById("btn-team-cancel"))==null||n.addEventListener("click",aa),(o=document.getElementById("btn-pw-cancel"))==null||o.addEventListener("click",ra),(i=document.getElementById("btn-roles-close"))==null||i.addEventListener("click",Nr),(a=document.getElementById("btn-generate-password"))==null||a.addEventListener("click",()=>{let u=document.getElementById("team-member-password");u&&(u.value=wo())}),(r=document.getElementById("btn-pw-generate"))==null||r.addEventListener("click",()=>{let u=document.getElementById("team-new-password");u&&(u.value=wo())}),(l=document.getElementById("btn-team-save"))==null||l.addEventListener("click",Pm),(p=document.getElementById("btn-pw-save"))==null||p.addEventListener("click",Rm),(c=document.getElementById("btn-team-review"))==null||c.addEventListener("click",()=>kc(!1)),(d=document.getElementById("btn-pw-review"))==null||d.addEventListener("click",()=>kc(!0)),document.addEventListener("keydown",Bm)}function Bm(e){let t=document.querySelector(".vs-team-modal:not(.hidden)");if(e.key==="Tab"&&t){let i=[...t.querySelectorAll('input:not([type="hidden"]), select, button, [tabindex="0"]')].filter(l=>!l.disabled&&l.getClientRects().length),a=i[0],r=i.at(-1);if(!a){e.preventDefault();return}e.shiftKey&&(document.activeElement===a||!i.includes(document.activeElement))?(e.preventDefault(),r.focus()):!e.shiftKey&&(document.activeElement===r||!i.includes(document.activeElement))&&(e.preventDefault(),a.focus());return}if(e.key!=="Escape"||Vt)return;let s=document.getElementById("team-modal"),n=document.getElementById("team-pw-modal"),o=document.getElementById("team-roles-modal");o&&!o.classList.contains("hidden")?(Nr(),e.stopPropagation()):n&&!n.classList.contains("hidden")?(ra(),e.stopPropagation()):s&&!s.classList.contains("hidden")&&(aa(),e.stopPropagation())}function wc(){var e,t;xt=document.activeElement,(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden"),(t=document.querySelector("#team-roles-modal button"))==null||t.focus()}function Nr(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden"),xt!=null&&xt.isConnected&&xt.focus()}function Or(e=null){var l;let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");if(!t)return;xt=document.activeElement;let r=Xe(e?`/team/${e.id}`:"/team",e?"put":"post");la=e?{...e,version:(r==null?void 0:r.version)||e.version}:null,document.getElementById("team-member-name").value=(r==null?void 0:r.name)??(e==null?void 0:e.name)??"",document.getElementById("team-member-email").value=(r==null?void 0:r.email)??(e==null?void 0:e.email)??"",document.getElementById("team-member-role").value=(r==null?void 0:r.role)??(e==null?void 0:e.role)??"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",document.getElementById("btn-team-review").style.display="none",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=r?r.password||"":wo(),r&&!r.password&&(a.textContent="An earlier request may have completed. Enter the same password to check its result.",a.classList.remove("hidden"))),t.classList.remove("hidden"),(l=document.getElementById("team-member-name"))==null||l.focus()}function aa(){var t;if(Vt)return;(t=document.getElementById("team-modal"))==null||t.classList.add("hidden");let e=document.getElementById("team-member-password");e&&(e.value=""),la=null,xt!=null&&xt.isConnected&&xt.focus()}function Sc(e,t){var r;let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");if(!s)return;let i=Ho.get(Number(e));if(!(i!=null&&i.version))return;xt=document.activeElement;let a=Xe(`/team/${e}/password`);da={...i,version:(a==null?void 0:a.version)||i.version},document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=a?a.password||"":wo(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",document.getElementById("btn-pw-review").style.display="none",a&&!a.password&&(o.textContent="An earlier reset may have completed. Enter the same password to check its result.",o.classList.remove("hidden")),s.classList.remove("hidden"),(r=document.getElementById("team-new-password"))==null||r.focus()}function ra(){var t;if(Vt)return;(t=document.getElementById("team-pw-modal"))==null||t.classList.add("hidden");let e=document.getElementById("team-new-password");e&&(e.value=""),da=null,xt!=null&&xt.isConnected&&xt.focus()}async function kc(e){var a;if(Vt)return;let t=e?da:la;if(!t)return;let s=document.getElementById(e?"team-pw-error":"team-modal-error"),n=[...document.querySelectorAll(e?"#team-pw-modal input, #team-pw-modal button":"#team-modal input, #team-modal select, #team-modal button")];Vt=!0,n.forEach(r=>{r.disabled=!0});let o=await Dr(r=>Y.get(r));if(Vt=!1,n.forEach(r=>{r.disabled=!1}),!o.ok){s.textContent=((a=o.error)==null?void 0:a.message)||"Cannot read the current account.",s.focus();return}let i=o.data.members.find(r=>r.id===t.id);if(!i){s.textContent="This account has been removed. Close this window to return to the team.",s.focus();return}Ho.set(i.id,i),e?Sc(i.id,i.name):Or(i),xt=document.querySelector(`.team-edit-btn[data-id="${i.id}"]`)}async function Pm(){var c,d,u,v,f,b,h,g,m,x;if(Vt)return;let e=(c=document.getElementById("team-edit-id"))==null?void 0:c.value,t=(u=(d=document.getElementById("team-member-name"))==null?void 0:d.value)==null?void 0:u.trim(),s=(f=(v=document.getElementById("team-member-email"))==null?void 0:v.value)==null?void 0:f.trim(),n=(b=document.getElementById("team-member-role"))==null?void 0:b.value,o=(h=document.getElementById("team-member-password"))==null?void 0:h.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026",Vt=!0;let r=[...document.querySelectorAll("#team-modal input, #team-modal select, #team-modal button")];r.forEach(w=>{w.disabled=!0});let l=ia(e?"update":"create",e?{name:t,email:s,role:n}:{name:t,email:s,role:n,password:o},la),p=await ye(l.endpoint,l.body,l.method,l.options);Vt=!1,r.forEach(w=>{w.disabled=!1}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",p.ok?(aa(),A(e?"Member updated.":`${t} has been added to the team.`,"success"),await jo(),(g=document.querySelector(`.team-edit-btn[data-id="${p.data.member.id}"]`))==null||g.focus()):(i.textContent=((m=p.error)==null?void 0:m.message)||"Something went wrong.",i.classList.remove("hidden"),document.getElementById("btn-team-review").style.display=((x=p.error)==null?void 0:x.code)==="content_conflict"&&e?"":"none",i.focus())}async function Rm(){var l,p,c;if(Vt)return;let e=(l=document.getElementById("team-pw-user-id"))==null?void 0:l.value,t=(p=document.getElementById("team-new-password"))==null?void 0:p.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026",Vt=!0;let o=[...document.querySelectorAll("#team-pw-modal input, #team-pw-modal button")];o.forEach(d=>{d.disabled=!0});let i=ia("password",{password:t},da),{ok:a,error:r}=await ye(i.endpoint,i.body,i.method,i.options);Vt=!1,o.forEach(d=>{d.disabled=!1}),n.disabled=!1,n.textContent="Reset Password",a?(ra(),A("Password has been reset.","success"),await jo(),(c=document.querySelector(`.team-pw-btn[data-id="${e}"]`))==null||c.focus()):(s.textContent=(r==null?void 0:r.message)||"Failed to reset password.",s.classList.remove("hidden"),document.getElementById("btn-pw-review").style.display=(r==null?void 0:r.code)==="content_conflict"?"":"none",s.focus())}async function Cc(e,t,s,n,o,i){var u,v,f,b,h,g;if(!/^draft:\d+$/.test(t||""))return{ok:!1,error:{code:"content_conflict",message:"Load the asset list before uploading."}};if(!e.length||e.length>10)return{ok:!1,error:{code:"size_limit",message:"Choose between 1 and 10 files."}};let a=async m=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",m)),x=>x.toString(16).padStart(2,"0")).join(""),r=[];for(let m of e){if(m.size>10485760)return{ok:!1,error:{code:"size_limit",message:"Each asset must be at most 10 MiB."}};r.push({name:m.name,bytes:m.size,sha256:await a(await m.arrayBuffer())})}if(i()!==s)return{ok:!1,error:{code:"permission_denied",message:"The signed-in account changed. Open Assets again."}};let l=jt(`vs_asset_upload:${s}`),p=JSON.stringify(r),c;try{c=JSON.parse(o.getItem(l)||"null")}catch{}if(c&&c.fingerprint!==p)return{ok:!1,error:{code:"operation_pending",message:"Choose the same files to finish the earlier upload before starting another batch."}};c||(c={id:`assets_${crypto.randomUUID().replaceAll("-","")}`,fingerprint:p,index:0,version:t});let d=()=>{try{o.setItem(l,JSON.stringify(c))}catch{}};d();for(let m=c.index;m<e.length;m++){if(i()!==s)return{ok:!1,error:{code:"permission_denied",message:"The signed-in account changed. Open Assets again."}};let x=await n(e[m],{request_id:`${c.id}_${m}`,base_draft_version:c.version});if(!x.ok){if(["invalid_schema","content_conflict"].includes((u=x.error)==null?void 0:u.code)&&!((v=x.data)!=null&&v.operation))try{o.removeItem(l)}catch{}return x}let w=((f=x.data)==null?void 0:f.operation)||((g=(h=(b=x.data)==null?void 0:b.uploaded)==null?void 0:h[0])==null?void 0:g.operation);if((w==null?void 0:w.status)!=="succeeded"||!/^draft:\d+$/.test(w.after_version||""))return{ok:!1,error:{code:"operation_pending",message:"The upload still needs attention. Retry the same files."}};c.index=m+1,c.version=w.after_version,d()}try{o.removeItem(l)}catch{}return{ok:!0,data:{count:e.length,draft_version:c.version}}}var Dm=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},qm=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},jr=null,Hr=!1;function Lc(){return setTimeout(()=>Fo(),0),`
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
        <div class="vs-dropzone-icon">${L.upload}</div>
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
  `}async function Fo(e="all"){var g;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await _c(n.files),n.value="",Fo(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=m=>{m.target.closest("button")||n==null||n.click()},o.ondragover=m=>{m.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async m=>{m.preventDefault(),o.classList.remove("is-dragover"),m.dataTransfer.files.length>0&&(await _c(m.dataTransfer.files),Fo(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(m=>{m.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(x=>{x.className="vs-device-btn"}),m.className="vs-device-btn vs-device-btn-active",Fo(m.dataset.filter)}});let a=e==="code",r=!a&&e!=="all"?`?category=${e}`:"",{ok:l,data:p}=await Y.get(`/assets${r}`);if(jr=l?p==null?void 0:p.draft_version:null,!l||!((g=p==null?void 0:p.assets)!=null&&g.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let m=document.getElementById("btn-empty-upload"),x=document.getElementById("btn-upload-asset");m&&x&&m.addEventListener("click",()=>x.click());return}let c=p.assets;if(a&&(c=c.filter(m=>m.category==="css"||m.category==="js"),c.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${L.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let d=["jpg","jpeg","png","gif","webp","svg","ico"],u=c.filter(m=>m.category==="images"&&d.includes(m.extension)),v=c.filter(m=>!d.includes(m.extension)||m.category!=="images");function f(m,x){return m==="css"?L.fileCode:m==="js"?L.fileCode:m==="json"?L.fileJson:m==="pdf"?L.filePdf:["woff2","woff","ttf","otf"].includes(m)?L.type:["mp4","webm"].includes(m)?L.film:["mp3","wav","ogg"].includes(m)?L.music:["txt","md","csv"].includes(m)?L.fileText:["doc","docx","xls","xlsx"].includes(m)?L.fileText:x==="images"?L.image:L.fileText}let b=["css","js","json","svg"],h="";u.length>0&&(h+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',u.forEach((m,x)=>{var $;let w=ir(m.size),E=m.width?`${m.width}\xD7${m.height}`:"",k=m.extension==="svg";h+=`
        <div class="vs-asset-card" data-lightbox-idx="${x}">
          <div class="vs-asset-card-thumb${k?" is-svg":""}" style="cursor:pointer">
            <img src="${m.thumbnail||m.path}" alt="${y((($=m.meta)==null?void 0:$.alt)||m.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${y(m.filename)}">${y(m.filename)}</p>
            <p class="vs-asset-card-meta">${E?E+" \xB7 ":""}${w}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${m.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${L.copy}</button>
            <button data-delete-asset="${m.path}" data-asset-hash="${m.sha256}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${L.x}</button>
          </div>
        </div>
      `}),h+="</div>"),v.length>0&&v.forEach(m=>{let x=ir(m.size),w=b.includes(m.extension);h+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${f(m.extension,m.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${y(m.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${m.category} \xB7 ${x}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${w?`
              <button data-edit-asset="${m.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${L.pencil}</button>
            `:""}
            <button data-copy-path="${m.path}" title="Copy web path"
              class="vs-asset-action-btn">${L.copy}</button>
            ${m.category!=="css"&&m.category!=="js"?`
              <button data-delete-asset="${m.path}" data-asset-hash="${m.sha256}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${L.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=h,t.querySelectorAll("[data-lightbox-idx]").forEach(m=>{let x=m.querySelector(".vs-asset-card-thumb");x&&x.addEventListener("click",()=>{let w=parseInt(m.dataset.lightboxIdx,10);Nm(u,w,e)})}),t.querySelectorAll("[data-copy-path]").forEach(m=>{m.addEventListener("click",()=>{navigator.clipboard.writeText(m.dataset.copyPath).then(()=>{let x=m.innerHTML;m.innerHTML="\u2713",m.classList.add("vs-asset-action-copied"),setTimeout(()=>{m.innerHTML=x,m.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(m=>{m.addEventListener("click",()=>{let w=m.dataset.editAsset.replace(/^\//,"");_o(w)})}),t.querySelectorAll("[data-delete-asset]").forEach(m=>{m.addEventListener("click",async()=>{if(!await Ae({title:"Delete Asset",description:`Delete ${m.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:w,error:E}=await ye("/assets",{path:m.dataset.deleteAsset,expected_hash:m.dataset.assetHash,base_draft_version:p.draft_version},"delete");w?(A("Asset deleted.","success"),Fo(e)):A((E==null?void 0:E.message)||"Could not delete asset.","error")})})}function Nm(e,t,s){let n=t;function o(u){if(u===0)return"0 B";let v=1024,f=["B","KB","MB","GB"],b=Math.floor(Math.log(u)/Math.log(v));return parseFloat((u/Math.pow(v,b)).toFixed(1))+" "+f[b]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var g,m;let u=e[n],v=u.width?`${u.width}\xD7${u.height}`:"",f=o(u.size),b=[v,f,(g=u.extension)==null?void 0:g.toUpperCase()].filter(Boolean),h=e.length>1;return`
      ${h?`
        <button class="vs-lightbox-nav vs-lightbox-nav--prev" id="lightbox-prev" title="Previous (\u2190)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="vs-lightbox-nav vs-lightbox-nav--next" id="lightbox-next" title="Next (\u2192)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `:""}

      <div class="vs-lightbox-stage">
        <div class="vs-lightbox-center">
          <div class="vs-lightbox-image-wrap${["svg","png"].includes(u.extension)?" is-transparent":""}">
            <img src="${u.preview_url||u.path}" alt="${y(((m=u.meta)==null?void 0:m.alt)||u.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${y(u.filename)}</span>
            <span class="vs-lightbox-details">${b.join(" \xB7 ")}${h?` \xB7 ${n+1} / ${e.length}`:""}</span>
          </div>

          <div class="vs-lightbox-actions">
            <button class="vs-lightbox-btn" id="lightbox-copy" title="Copy web path">
              ${L.copy}<span>Copy path</span>
            </button>
          </div>
        </div>
      </div>

      <button class="vs-lightbox-close" id="lightbox-close" title="Close (Esc)">
        ${L.x}
      </button>
    `}let r=document.createElement("div");r.id="vs-lightbox",r.className="vs-lightbox",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Image preview"),r.innerHTML=a(),document.body.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add("is-visible"))});function l(){r.classList.remove("is-visible"),setTimeout(()=>r.remove(),400),document.removeEventListener("keydown",c)}function p(u){n=u,r.innerHTML=a(),d()}function c(u){if(u.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;l(),u.preventDefault()}u.key==="ArrowRight"&&e.length>1&&(p((n+1)%e.length),u.preventDefault()),u.key==="ArrowLeft"&&e.length>1&&(p((n-1+e.length)%e.length),u.preventDefault())}function d(){var f,b,h;(f=r.querySelector("#lightbox-close"))==null||f.addEventListener("click",g=>{g.stopPropagation(),l()});let u=null;r.addEventListener("mousedown",g=>{u=g.target}),r.addEventListener("click",g=>{var w;let m=g.target===r||g.target.classList.contains("vs-lightbox-stage"),x=u===r||((w=u==null?void 0:u.classList)==null?void 0:w.contains("vs-lightbox-stage"));m&&x&&l()}),(b=r.querySelector("#lightbox-prev"))==null||b.addEventListener("click",g=>{g.stopPropagation(),p((n-1+e.length)%e.length)}),(h=r.querySelector("#lightbox-next"))==null||h.addEventListener("click",g=>{g.stopPropagation(),p((n+1)%e.length)});let v=r.querySelector("#lightbox-copy");v==null||v.addEventListener("click",g=>{g.stopPropagation();let m=e[n];navigator.clipboard.writeText(m.path).then(()=>{let x=v.innerHTML;v.innerHTML=`${L.check}<span>Copied!</span>`,v.style.borderColor="var(--vs-success)",v.style.color="var(--vs-success)",setTimeout(()=>{v.innerHTML=x,v.style.borderColor="",v.style.color=""},2e3),A("Path copied!","success")})})}document.addEventListener("keydown",c),d()}async function _c(e){var o,i,a;if(Dm()||qm()||Hr)return;Hr=!0;let t=window.__vsSetGlobalStatus;t&&t("saving",`Uploading ${e.length} file(s)\u2026`);let s=D.get("sessionToken"),n=s?{"X-VS-Token":s}:{};try{let r=(o=D.get("user"))==null?void 0:o.id,l=await Cc(Array.from(e),jr,r,async(p,c)=>{let d=new FormData;d.append("file",p);for(let[u,v]of Object.entries(c))d.append(u,v);try{return await(await fetch(Ce("api/router.php")+"?_path=%2Fassets%2Fupload",{method:"POST",body:d,credentials:"same-origin",headers:n})).json()}catch{return{ok:!1,error:{code:"network_error",message:"The upload response was lost. Choose the same files to retry safely."}}}},sessionStorage,()=>{var p;return(p=D.get("user"))==null?void 0:p.id});if(l.ok){let p=((i=l.data)==null?void 0:i.count)||0;jr=l.data.draft_version,A(`${p} file(s) uploaded.`,"success"),t&&t("saved",`\u2713 ${p} file(s) uploaded`)}else{let p=((a=l.error)==null?void 0:a.message)||"Upload failed";A(p,"error"),t&&t("error","\u2717 "+p)}}catch{A("Upload failed.","error"),t&&t("error","\u2717 Upload failed")}finally{Hr=!1}}var zo="vs-newdesign-save-pref",Uo="gallery";function Ic(){return setTimeout(()=>Om(),0),`
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
        <button class="vs-tab ${Uo==="gallery"?"vs-tab-active":""}" data-tab="gallery">
          ${L.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${Uo==="history"?"vs-tab-active":""}" data-tab="history">
          ${L.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading\u2026</div>
      </div>
    </div>
  `}function Om(){var e,t;document.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",()=>{Uo=s.dataset.tab,document.querySelectorAll(".vs-tab").forEach(n=>n.classList.remove("vs-tab-active")),s.classList.add("vs-tab-active"),Tc()})}),(e=document.getElementById("btn-save-design"))==null||e.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||Vo()}),(t=document.getElementById("btn-new-design"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||zr()}),Tc()}function Tc(){Uo==="gallery"?ca():pa()}async function ca(){var i,a;let e=document.getElementById("designs-content");if(!e)return;let{ok:t,data:s}=await Y.get("/designs");if(!t||!((i=s==null?void 0:s.designs)!=null&&i.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <p class="vs-empty-state-title">No saved designs</p>
          <p class="vs-empty-state-desc">Save your current design and try different looks. Switch back anytime.</p>
          <button id="btn-empty-save" class="vs-btn vs-btn-primary vs-btn-sm">${L.save} Save Current Design</button>
        </div>
      </div>
    `,(a=document.getElementById("btn-empty-save"))==null||a.addEventListener("click",()=>{var r;(r=window.demoGuard)!=null&&r.call(window)||Vo()});return}let n=s.active_id,o=s.designs;e.innerHTML=`
    <div class="vs-design-grid">
      ${o.map(r=>jm(r,r.id===n)).join("")}
    </div>
  `,Fm(e),Hm(e)}function Hm(e){e.querySelectorAll(".vs-design-card-preview").forEach(t=>{let s=t.querySelector("iframe");s&&requestAnimationFrame(()=>{let n=t.offsetWidth;if(n>0){let o=n/1440;s.style.transform=`scale(${o})`}})})}function jm(e,t){let s=y(e.name||"Untitled"),n=e.description?y(e.description):"",o=e.initial_prompt?y(e.initial_prompt):"",i=n||(o.length>100?o.substring(0,100)+"\u2026":o),a=y(e.site_name||""),r=e.page_count||0,l=e.created_at?yo(e.created_at):"",p=e._corrupted,c=a&&a!==s?`${a} \xB7 ${r} ${r===1?"page":"pages"}`:`${r} ${r===1?"page":"pages"}`,d=`${Ce("")}api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(e.id)}%2Fpreview&path=index.php`,u=`${d}&embed=1`;return`
    <div class="vs-design-card${t?" vs-design-card-active":""}${p?" vs-design-card-corrupted":""}"
         data-design-id="${X(e.id)}">
      <div class="vs-design-card-preview">
        ${p?'<div class="vs-design-card-empty">Preview unavailable</div>':`
          <iframe src="${u}" tabindex="-1" loading="lazy"
                  sandbox="allow-same-origin"
                  title="Preview of ${X(e.name||"design")}"></iframe>
        `}
      </div>
      <div class="vs-design-card-info">
        <h3>${s}</h3>
        ${i?`<p class="vs-design-card-desc">${i}</p>`:""}
        <div class="vs-design-card-meta">
          <span>${c}</span>
          <span>${l}</span>
        </div>
      </div>
      <div class="vs-design-card-actions">
        ${t?'<span class="vs-design-badge-active">Active</span>':`
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-load-id="${X(e.id)}" ${p?"disabled":""}>
            ${L.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${d}" target="_blank" rel="noopener" title="Browse this design">
          ${L.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${X(e.id)}"
                data-edit-name="${X(e.name||"")}"
                data-edit-desc="${X(e.description||"")}">
          ${L.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${X(e.id)}" style="color: var(--vs-text-ghost);">
          ${L.trash2}
        </button>
      </div>
    </div>
  `}function Fm(e){e.querySelectorAll("[data-load-id]").forEach(t=>{t.addEventListener("click",async()=>{var p,c,d,u;if((p=window.demoGuard)!=null&&p.call(window)||(c=window.viewerGuard)!=null&&c.call(window))return;let s=t.dataset.loadId,n=t.closest(".vs-design-card"),o=((d=n==null?void 0:n.querySelector("h3"))==null?void 0:d.textContent)||"this design",i=await Wm(o);if(!i)return;if(t.innerHTML=`${L.rotateCcw} Loading\u2026`,t.disabled=!0,i.saveDesign){let v=D.get("siteName")||"Untitled",f=await ye("/designs",{name:`${v}`,description:"Saved before switching designs"});if(!f.ok){A(((u=f.error)==null?void 0:u.message)||"Failed to save design.","error"),t.innerHTML=`${L.rotateCcw} Load`,t.disabled=!1;return}}let{ok:a,data:r,error:l}=await ye(`/designs/${s}/load`,{skip_auto_save:!0});a?(A("Design loaded.","success"),await Ur(),window.location.hash="#/chat"):(A((l==null?void 0:l.message)||"Failed to load design.","error"),t.innerHTML=`${L.rotateCcw} Load`,t.disabled=!1)})}),e.querySelectorAll("[data-edit-id]").forEach(t=>{t.addEventListener("click",()=>{var i,a;if((i=window.demoGuard)!=null&&i.call(window)||(a=window.viewerGuard)!=null&&a.call(window))return;let s=t.dataset.editId,n=t.dataset.editName,o=t.dataset.editDesc;Vm(s,n,o)})}),e.querySelectorAll("[data-delete-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteId;if(!await Ae({title:"Delete Design",description:"Remove this design from the gallery. Retained archive bytes stay available for history.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await ye(`/designs/${s}`,{},"delete");o?(A("Design deleted.","success"),ca()):(A((i==null?void 0:i.message)||"Failed to delete design.","error"),t.innerHTML=`${L.trash2}`,t.disabled=!1)})})}async function pa(){var t;let e=document.getElementById("designs-content");e&&(e.innerHTML=`
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">${L.camera} Create Snapshot</button>
    </div>
    <p class="text-sm text-vs-text-secondary mb-4">Draft snapshots restore your private work. Published snapshots change the live website only when you select that domain.</p>
    <div id="snapshot-pending-deletions"></div>
    <div id="snapshots-list"><div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots\u2026</div></div>`,(t=document.getElementById("btn-create-snapshot"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||Km()}),await Fr())}async function Fr(e=0,t=null){var l,p;let s=document.getElementById("snapshots-list");if(!s)return;let n=document.getElementById("snapshot-pending-deletions");if(n){let c=Ol("/snapshots/","delete").filter(d=>/^\/snapshots\/(?:snapshot_[a-f0-9]{32}|legacy_[1-9][0-9]*)$/.test(d.endpoint));n.innerHTML=c.length?`<div class="vs-card mb-4"><p class="text-sm mb-2">These deletion requests still need a confirmed result.</p>${c.map(d=>`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-pending-delete="${X(d.endpoint.slice(11))}">Check ${y(d.endpoint.slice(11))}</button>`).join("")}</div>`:"",n.querySelectorAll("[data-pending-delete]").forEach(d=>d.addEventListener("click",()=>Mc(d.dataset.pendingDelete)))}let o=new URLSearchParams({history:"all",limit:"25",offset:String(e)});t&&o.set("inventory_version",t);let{ok:i,data:a,error:r}=await Y.get("/snapshots?"+o);if(!i){s.innerHTML=`<p class="text-sm text-vs-text-secondary py-8">${y((r==null?void 0:r.message)||"History could not be loaded.")}</p>`;return}if(!a.snapshots.length){s.innerHTML='<div class="vs-empty-state"><p class="vs-empty-state-title">No snapshots yet</p><p class="vs-empty-state-desc">Create a restore point before your next change.</p></div>';return}s.innerHTML=`<div class="vs-timeline">${a.snapshots.map((c,d)=>{let u=X(c.snapshot_id),v=c.domains.map(b=>b==="draft"?"Draft":"Published").join(" + "),f=c.bytes===null?"Size checked on inspection":Math.ceil(c.bytes/1024)+" KB";return`<div class="vs-timeline-item${d===a.snapshots.length-1?" vs-timeline-last":""}">
      <div class="vs-timeline-rail"><div class="vs-timeline-dot"></div><div class="vs-timeline-connector"></div></div>
      <div class="vs-timeline-card">
        <div class="vs-timeline-card-header"><div class="flex items-center gap-2"><span class="vs-snap-badge-gray">${v}</span><span class="vs-timeline-label">${y(c.label||"Website snapshot")}</span></div><span class="vs-timeline-ago">${yo(c.created_at)}</span></div>
        <div class="vs-timeline-meta break-all">${y(c.snapshot_id)} \xB7 ${c.file_count} files \xB7 ${f} \xB7 Format ${c.format}${c.protected?" \xB7 Retained for history":""}</div>
        <div class="vs-timeline-actions">
          <button data-inspect-id="${u}" class="vs-btn vs-btn-ghost vs-btn-xs">${L.eye} Details</button>
          <button data-restore-id="${u}" data-domains="${X(c.domains.join(","))}" class="vs-btn vs-btn-ghost vs-btn-xs">${L.rotateCcw} Restore\u2026</button>
          ${c.protected?"":`<button data-delete-snap-id="${u}" class="vs-btn vs-btn-ghost vs-btn-xs">${L.trash2} Delete</button>`}
        </div>
      </div></div>`}).join("")}</div>
  <div class="flex items-center justify-between mt-4"><span class="text-sm text-vs-text-secondary">${e+1}\u2013${e+a.snapshots.length} of ${a.total}</span><div class="flex gap-2">${e?'<button id="snapshot-first-page" class="vs-btn vs-btn-ghost vs-btn-sm">First page</button>':""}${a.next_offset!==null?'<button id="snapshot-next-page" class="vs-btn vs-btn-secondary vs-btn-sm">Older snapshots</button>':""}</div></div>`,(l=document.getElementById("snapshot-first-page"))==null||l.addEventListener("click",()=>Fr()),(p=document.getElementById("snapshot-next-page"))==null||p.addEventListener("click",()=>Fr(a.next_offset,a.inventory_version)),zm(s)}function zm(e){e.querySelectorAll("[data-inspect-id]").forEach(t=>t.addEventListener("click",async()=>{let{ok:s,data:n,error:o}=await Y.get(`/snapshots/${encodeURIComponent(t.dataset.inspectId)}/inspect`);if(!s){A((o==null?void 0:o.message)||"Snapshot inspection failed.","error");return}Ym(n)})),e.querySelectorAll("[data-restore-id]").forEach(t=>t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||Um(t.dataset.restoreId,t.dataset.domains.split(","))})),e.querySelectorAll("[data-delete-snap-id]").forEach(t=>t.addEventListener("click",async()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||await Mc(t.dataset.deleteSnapId)}))}async function Mc(e){var d,u,v;let t=document.activeElement,s=document.getElementById("designs-content"),n=`/snapshots/${encodeURIComponent(e)}`,o=Xe(n,"delete"),i=null;if(!o){let f=await Y.get(`${n}/delete-review`);if(!f.ok||f.data.protected){A(((d=f.error)==null?void 0:d.message)||((u=f.data)==null?void 0:u.reason)||"This snapshot is retained for recovery.","error");return}i=f.data}let a=(o==null?void 0:o.version)||i.version;(v=document.getElementById("vs-snapshot-delete-overlay"))==null||v.remove();let r=document.createElement("div");r.id="vs-snapshot-delete-overlay",r.className="vs-modal-overlay",r.innerHTML=`<div class="vs-modal" role="dialog" aria-modal="true" aria-labelledby="snapshot-delete-title" style="max-width: 600px;">
    <div class="vs-modal-header"><h2 class="vs-modal-title" id="snapshot-delete-title">${o?"Continue snapshot deletion":"Delete snapshot"}</h2>
    <p class="vs-modal-desc break-all">${y(e)}. ${o?"Inspect and continue the same retained request.":"Remove this archive permanently. Current draft and published files stay unchanged."}</p></div>
    <div class="vs-modal-body"><p style="overflow-wrap: anywhere;">Reviewed version: ${y(a)}</p>
    ${i?`<p class="mt-3">${i.files.length} files \xB7 ${(i.bytes/1024).toFixed(1)} KB</p>
    <details class="mt-3"><summary>Exact archive files</summary><ul style="max-height: 220px; overflow: auto; overflow-wrap: anywhere;">${i.files.map(f=>`<li class="mt-2">${y(f.path)}<br><small>${y(f.sha256)}</small></li>`).join("")}</ul></details>`:""}
    <p class="mt-3" data-delete-status role="status" aria-live="polite"></p></div>
    <div class="vs-modal-footer"><button class="vs-btn vs-btn-secondary vs-btn-sm" data-delete-close>Close</button>
    <button class="vs-btn vs-btn-danger vs-btn-sm" data-delete-confirm>${o?"Continue deletion":"Delete archive"}</button></div></div>`,document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible"));let l=!1,p=(f=!0)=>{if(l)return;let b=!document.activeElement||document.activeElement===document.body||r.contains(document.activeElement);if(l=!0,document.removeEventListener("keydown",c),Te(r),!f||!b)return;let h=t!=null&&t.isConnected?t:null;if(!h){let g=document.getElementById("designs-content");h=[...(g==null?void 0:g.querySelectorAll("[data-delete-snap-id], [data-pending-delete]"))||[]].find(m=>m.isConnected&&(m.dataset.deleteSnapId===e||m.dataset.pendingDelete===e))||(g==null?void 0:g.querySelector("#btn-create-snapshot"))}h!=null&&h.isConnected&&h.focus()},c=f=>{var b,h;if(f.key==="Escape"&&(f.preventDefault(),p()),f.key==="Tab"){let g=[...r.querySelectorAll("button:not(:disabled),summary")];f.shiftKey&&document.activeElement===g[0]?(f.preventDefault(),(b=g.at(-1))==null||b.focus()):!f.shiftKey&&document.activeElement===g.at(-1)&&(f.preventDefault(),(h=g[0])==null||h.focus())}};document.addEventListener("keydown",c),Ie(r,p),r.querySelector("[data-delete-close]").onclick=p,r.querySelector("[data-delete-close]").focus(),r.querySelector("[data-delete-confirm]").onclick=async f=>{var h,g;f.currentTarget.disabled=!0;let b=await ye(n,o||{version:a},"delete");if(b.ok){let m=!l&&(!document.activeElement||document.activeElement===document.body||r.contains(document.activeElement));if(p(m),A("Snapshot deleted.","success"),document.getElementById("designs-content")===s){let x=document.activeElement;await pa(),m&&(!document.activeElement||document.activeElement===document.body||document.activeElement===x)&&((h=document.getElementById("btn-create-snapshot"))==null||h.focus())}return}r.querySelector("[data-delete-status]").textContent=((g=b.error)==null?void 0:g.message)||"Deletion needs attention. The retained operation is still available.",r.querySelector("[data-delete-confirm]").disabled=!1}}function Um(e,t){var d,u;(d=document.getElementById("vs-snapshot-restore-overlay"))==null||d.remove();let s=`/snapshots/${encodeURIComponent(e)}/apply-restore`,n=Xe(s),o=[...t,...t.length===2?["both"]:[]],i={draft:"Draft only",published:"Published website only",both:"Draft and published website"},a=document.createElement("div");a.id="vs-snapshot-restore-overlay",a.className="vs-modal-overlay",a.innerHTML=`<div class="vs-modal" style="max-width: 640px;">
    <div class="vs-modal-header"><h2 class="vs-modal-title">Restore snapshot</h2><p class="vs-modal-desc">${y(e)}</p></div>
    <div class="vs-modal-body"><label class="block text-sm text-vs-text-secondary mb-1" for="snap-restore-domain">Restore</label>
      <select id="snap-restore-domain" class="vs-input w-full" ${n?"disabled":""}>${o.map(v=>`<option value="${v}">${i[v]}</option>`).join("")}</select>
      <p class="text-sm text-vs-text-secondary mt-3">Draft only preserves the live website. Published only preserves your newer draft. A verified safety archive is retained before changes begin.</p>
      <div id="snap-restore-review" class="text-sm text-vs-text-secondary mt-3">${n?"A previous restoration request is pending. Continue that same operation to see its retained result.":"Review the affected files before restoring."}</div>
    </div><div class="vs-modal-footer"><button id="snap-restore-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Close</button><button id="snap-restore-submit" class="vs-btn vs-btn-primary vs-btn-sm">${n?"Continue restoration":"Review restoration"}</button></div></div>`,document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add("is-visible")),Ie(a,()=>Te(a)),(u=document.getElementById("snap-restore-cancel"))==null||u.addEventListener("click",()=>Te(a));let r=document.getElementById("snap-restore-submit"),l=document.getElementById("snap-restore-domain"),p=document.getElementById("snap-restore-review"),c=n;n!=null&&n.domain&&l&&(l.value=n.domain),l==null||l.addEventListener("change",()=>{c=null,r.textContent="Review restoration",p.textContent="Review the affected files before restoring."}),r==null||r.addEventListener("click",async()=>{var f,b;if(r.disabled=!0,!c){let h=`review_${crypto.randomUUID().replaceAll("-","")}`,g=await Y.post(`/snapshots/${encodeURIComponent(e)}/prepare-restore`,{request_id:h,domain:l.value});if(r.disabled=!1,!g.ok){p.textContent=((f=g.error)==null?void 0:f.message)||"Restoration review failed.";return}let m=g.data;c={plan_id:m.plan_id,digest:m.digest,domain:m.domain};let x=i[m.domain];p.innerHTML=`<p><strong>${x}</strong> \xB7 ${m.files.length} file changes</p><p>Safety archive: ${y(m.safety_snapshot_id)}</p><details class="mt-3"><summary>Affected files</summary><ul style="max-height: 180px; overflow: auto;">${m.files.map(w=>`<li>${y(w.domain)} \xB7 ${y(w.action)} \xB7 ${y(w.path)}</li>`).join("")}</ul></details><p class="mt-3">Excluded: ${m.excluded_domains.map(y).join(", ")}.</p>`,r.textContent=m.domain==="draft"?"Restore draft":"Restore live website";return}let v=await ye(s,c);r.disabled=!1,v.ok?(Te(a),A("Snapshot restored.","success"),await Ur(),pa()):(p.textContent=((b=v.error)==null?void 0:b.message)||"Restoration needs attention.",r.textContent="Check retained operation")})}function Vo(){var c;let e=document.getElementById("vs-design-save-overlay");e&&e.remove();let t=D.get("siteName")||"",s=document.createElement("div");s.id="vs-design-save-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${L.save} Save Design</h2>
        <p class="vs-modal-desc">Save a snapshot of your current design to the library. Find and restore saved designs in the Designs tab.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="design-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${X(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="design-desc" type="text" class="vs-input w-full" placeholder="e.g. Warm wood tones with dark greens">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="design-save-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="design-save-confirm" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${L.save} Save Design</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>Te(s),o=d=>{d.key==="Escape"&&(d.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),Ie(s,n),(c=document.getElementById("design-save-cancel"))==null||c.addEventListener("click",n);let a=document.getElementById("design-name"),r=document.getElementById("design-desc"),l=document.getElementById("design-save-confirm"),p=d=>{d.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",p),r==null||r.addEventListener("keydown",p),a==null||a.select(),l==null||l.addEventListener("click",async()=>{var b,h;let d=((b=a==null?void 0:a.value)==null?void 0:b.trim())||"",u=((h=r==null?void 0:r.value)==null?void 0:h.trim())||"";if(!d){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:v,error:f}=await ye("/designs",{name:d,description:u});n(),v?(A("Design saved.","success"),Uo="gallery",document.getElementById("designs-content")&&(document.querySelectorAll(".vs-tab").forEach(m=>{m.classList.toggle("vs-tab-active",m.dataset.tab==="gallery")}),ca())):A((f==null?void 0:f.message)||"Failed to save design.","error")})}function Vm(e,t,s){var c;let n=document.getElementById("vs-design-edit-overlay");n&&n.remove();let o=document.createElement("div");o.id="vs-design-edit-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${L.pencil} Edit Design</h2>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="edit-design-name" type="text" class="vs-input w-full" value="${X(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="edit-design-desc" type="text" class="vs-input w-full" value="${X(s)}">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="edit-design-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="edit-design-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Save</button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>Te(o);Ie(o,i),(c=document.getElementById("edit-design-cancel"))==null||c.addEventListener("click",i);let a=document.getElementById("edit-design-name"),r=document.getElementById("edit-design-desc"),l=document.getElementById("edit-design-save");a==null||a.select();let p=d=>{d.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",p),r==null||r.addEventListener("keydown",p),l==null||l.addEventListener("click",async()=>{var b,h;let d=((b=a==null?void 0:a.value)==null?void 0:b.trim())||"",u=((h=r==null?void 0:r.value)==null?void 0:h.trim())||"";if(!d){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:v,error:f}=await ye(`/designs/${e}`,{name:d,description:u},"put");i(),v?(A("Design updated.","success"),ca()):A((f==null?void 0:f.message)||"Failed to update design.","error")})}function Wm(e){return new Promise(t=>{var p,c;let s=document.getElementById("vs-switch-design-overlay");s&&s.remove();let n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=localStorage.getItem(zo),i=document.createElement("div");i.id="vs-switch-design-overlay",i.className="vs-modal-overlay",i.innerHTML=`
      <div class="vs-modal" style="max-width: 480px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Switch Design</h2>
          <p class="vs-modal-desc">Switch to "${y(e)}"?</p>
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
    `;let a=d=>{d.key==="Escape"&&(d.preventDefault(),r(null))},r=d=>{document.removeEventListener("keydown",a),Te(i),t(d)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let l=document.getElementById("vs-switch-save-cb");Ie(i,()=>r(null)),(p=document.getElementById("vs-switch-cancel"))==null||p.addEventListener("click",()=>r(null)),(c=document.getElementById("vs-switch-ok"))==null||c.addEventListener("click",()=>{let d=l?l.checked:!1;localStorage.setItem(zo,d?"true":"false"),r({saveDesign:d})}),document.addEventListener("keydown",a),setTimeout(()=>{var d;return(d=document.getElementById("vs-switch-ok"))==null?void 0:d.focus()},220)})}async function zr(){var n;let e=await Gm();if(!e)return;if(e.saveDesign&&e.designName){let o=await ye("/designs",{name:e.designName,description:""});if(!o.ok){A(((n=o.error)==null?void 0:n.message)||"Failed to save design.","error");return}A("Design saved.","success")}let{ok:t,error:s}=await ye("/designs/new",{skip_auto_save:!0});if(t){A("Workspace cleared. Start building.","success"),await Ur(),D.set("messages",[]),D.set("activeConversationId",null),D.set("conversations",[]);try{localStorage.removeItem("vs-active-conversation")}catch{}window.location.hash!=="#/chat"?It.navigate("chat"):It.refresh()}else A((s==null?void 0:s.message)||"Failed to start new design.","error")}function Gm(){return new Promise(e=>{var d,u;let t=document.getElementById("vs-new-design-overlay");t&&t.remove();let s=D.get("siteName")||"",n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=document.createElement("div");o.id="vs-new-design-overlay",o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Start New Design</h2>
          <p class="vs-modal-desc">This will clear your workspace for a fresh start.</p>
          <label class="vs-modal-option" for="vs-newdesign-save-cb">
            <input type="checkbox" id="vs-newdesign-save-cb" ${localStorage.getItem(zo)!=="false"?"checked":""}>
            <span class="vs-modal-option-check">${n}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-body" id="vs-newdesign-name-row" style="${localStorage.getItem(zo)==="false"?"display:none":""}">
          <label class="vs-input-label">Name</label>
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${X(s)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;let i=v=>{v.key==="Escape"&&(v.preventDefault(),a(null))},a=v=>{document.removeEventListener("keydown",i),Te(o),e(v)};document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let r=document.getElementById("vs-newdesign-save-cb"),l=document.getElementById("vs-newdesign-name-row"),p=document.getElementById("vs-newdesign-name"),c=()=>{r.checked?(l.style.display="",setTimeout(()=>p==null?void 0:p.focus(),80)):l.style.display="none"};r==null||r.addEventListener("change",c),p==null||p.addEventListener("keydown",v=>{var f;v.key==="Enter"&&(v.preventDefault(),(f=document.getElementById("vs-newdesign-ok"))==null||f.click())}),Ie(o,()=>a(null)),(d=document.getElementById("vs-newdesign-cancel"))==null||d.addEventListener("click",()=>a(null)),(u=document.getElementById("vs-newdesign-ok"))==null||u.addEventListener("click",()=>{var b;let v=r?r.checked:!1,f=((b=p==null?void 0:p.value)==null?void 0:b.trim())||"";if(v&&!f){p==null||p.focus();return}localStorage.setItem(zo,v?"true":"false"),a({saveDesign:v,designName:f})}),document.addEventListener("keydown",i),setTimeout(()=>{var v;r!=null&&r.checked&&p?p.select():(v=document.getElementById("vs-newdesign-ok"))==null||v.focus()},220)})}function Km(){var r;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${L.camera} Create Snapshot</h2>
        <p class="vs-modal-desc">Save the selected website files and their domain metadata. Submissions, secrets, and Action definitions are excluded.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="snap-desc" type="text" maxlength="200" class="vs-input w-full" placeholder="e.g. Before redesigning the header" autofocus>
          </div>
          <div><label for="snap-domain" class="block text-sm text-vs-text-secondary mb-1">Capture</label>
            <select id="snap-domain" class="vs-input w-full"><option value="draft">Private draft</option><option value="published">Published website</option><option value="both">Draft and published website</option></select>
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="snap-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="snap-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${L.camera} Create Snapshot</button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>Te(t);Ie(t,s),(r=document.getElementById("snap-cancel"))==null||r.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save"),i=document.getElementById("snap-domain"),a=Xe("/snapshots/capture");a&&(n&&(n.value=a.label,n.disabled=!0),i&&(i.value=a.domain,i.disabled=!0),o&&(o.textContent="Continue snapshot")),n==null||n.addEventListener("keydown",l=>{l.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var d;let l=((d=n==null?void 0:n.value)==null?void 0:d.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:p,error:c}=await ye("/snapshots/capture",a||{domain:(i==null?void 0:i.value)||"draft",label:l||"Manual snapshot"});s(),p?(A("Snapshot created.","success"),pa()):A((c==null?void 0:c.message)||"Failed to create snapshot.","error")})}function Ym(e){var o;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n=[["Snapshot",e.snapshot_id],["Label",e.label||"\u2014"],["Domains",e.domains.map(i=>i==="draft"?"Draft":"Published").join(" + ")],["Format",String(e.format)],["Validation",e.validity],["Date",new Date(e.created_at).toLocaleString()],["Files",String(e.file_count)],["Size",e.bytes===null?"Not recorded":Math.ceil(e.bytes/1024)+" KB"],["Retention",e.protected?"Required by retained history":"Unprotected legacy archive"],["Excluded",e.excluded_domains.join(", ")]];s.innerHTML=`<div class="vs-modal" style="max-width: 560px;">
    <div class="vs-modal-header"><h2 class="vs-modal-title">${L.eye} Snapshot details</h2></div>
    <div class="vs-modal-body"><dl style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
      ${n.map(([i,a])=>`<dt class="text-vs-text-secondary">${i}</dt><dd style="overflow-wrap: anywhere;">${y(a)}</dd>`).join("")}
    </dl>${e.diagnostics.length?`<p class="text-sm text-vs-text-secondary mt-3">${e.diagnostics.map(y).join(" ")}</p>`:""}</div>
    <div class="vs-modal-footer"><button id="snap-preview-close" class="vs-btn vs-btn-secondary vs-btn-sm">Close</button></div></div>`,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),Ie(s,()=>Te(s)),(o=document.getElementById("snap-preview-close"))==null||o.addEventListener("click",()=>Te(s))}async function Ur(){var e,t;try{let s=await Y.get("/pages");s.ok&&Array.isArray((e=s.data)==null?void 0:e.pages)&&D.set("pages",s.data.pages);let n=await Y.get("/auth/session");n.ok&&((t=n.data)!=null&&t.site_name)&&(D.set("siteName",n.data.site_name),document.title=`Studio \u2014 ${n.data.site_name}`);let o=document.getElementById("preview-iframe");o&&(o.src=o.src)}catch(s){console.warn("[designs] Post-switch refresh failed:",s)}}function Ac(e,{requestId:t=()=>crypto.randomUUID(),actor:s=()=>"",onError:n=()=>{}}={}){let o=new Map,i=new Map,a=s(),r=null,l=Promise.resolve(),p=(E,k)=>`${E}/${k}`,c=E=>/^\/(notes|cards)(?:\/(\d+))?(?:\/([^?]+))?/.exec(E.split("?")[0]),d=E=>({ok:!1,error:{code:"content_conflict",message:E}});function u(){return a!==s()&&(a=s(),o.clear(),i.clear(),r=null),a}function v(E,k){let $=p(E,k);return o.has($)||o.set($,{saved:null,draft:{},generation:0}),o.get($)}function f(E,k,{mutation:$=!1,fields:S={}}={}){var q,K;if(!k)return k;let _=v(E,k.id);if($){_.saved=k,_.generation++;for(let[O,W]of Object.entries(S))_.draft[O]===W&&delete _.draft[O];_.conflict=!1}else!Object.keys(_.draft).length&&!_.conflict&&!_.uncertain&&!_.inflight&&(_.saved=k.body_truncated&&((q=_.saved)==null?void 0:q.version)===k.version&&!_.saved.body_truncated?{...k,body:_.saved.body,body_truncated:!1}:k);return{...k,..._.draft,version:((K=_.saved)==null?void 0:K.version)??k.version}}function b(E,k,$={}){if(!E.ok||!E.data)return E;let S={...E.data},_=k==="notes"?"note":"card";return S[_]&&(S[_]=f(k,S[_],$)),S[k]&&(S[k]=S[k].map(q=>f(k,q,$))),{...E,data:S}}async function h(E,k){var W,G,J;let $=u(),S=c(E);if(!S)return e.get(E,k);let _=S[1],q=!S[2],K=E;q&&!/[?&]limit=/.test(K)&&(K+=`${K.includes("?")?"&":"?"}limit=25`);let O=await e.get(K,k);if(u()!==$)return d("The signed-in account changed. Open this view again.");if(!O.ok)return O;if(q&&((W=O.data)!=null&&W[_])){let T=[...O.data[_]],C=O.data.collection_version,j=O.data.next_offset,B=1;for(;j!=null;){if(++B>200||T.length>=5e3)return d("This list is too large to load. Use a narrower search.");let P=new URLSearchParams(K.split("?")[1]||"");P.set("offset",String(j)),P.set("collection_version",C);let H=await e.get(`${E.split("?")[0]}?${P}`,k);if(u()!==$)return d("The signed-in account changed. Open this view again.");if(!H.ok)return H;if(((G=H.data)==null?void 0:G.collection_version)!==C||!Array.isArray(H.data[_])||H.data.next_offset!==null&&H.data.next_offset<=j)return d("This list changed while loading. Open it again.");T.push(...H.data[_]),j=H.data.next_offset}O={...O,data:{...O.data,[_]:T,next_offset:null}}}return E.split("?")[0]==="/cards"&&(r=((J=O.data)==null?void 0:J.board_version)??r),b(O,_)}function g(E,k,$){var _;u();let S=v(E,k);S.generation++;for(let[q,K]of Object.entries($))((_=S.saved)==null?void 0:_[q])===K?delete S.draft[q]:S.draft[q]=K}async function m(E,k,$={},S){let _=u(),q=c(k);if(!q)return e[E](k,$,S);let K=q[1],O=q[2]?Number(q[2]):null,W=E==="put"&&!q[3]?$:{};O&&Object.keys(W).length&&g(K,O,W);let G=async()=>{var H;if(u()!==_)return d("The signed-in account changed. Open this view again.");let C=O?v(K,O):null,j=`${E}:${k}`,B=JSON.stringify($),P=i.get(j);if(P&&P.fingerprint!==B){if(!O)return d("Retry the earlier create request before starting another.");let U=await J(P);if(!U.ok)return U;P=null}if(!P){if(O&&!((H=C.saved)!=null&&H.version))return d("Open this record before changing it.");let U={...$,request_id:t()};if(O&&(U.expected_version=C.saved.version),K==="cards"&&(q[3]==="move"||"column_name"in W||"archived"in W)){if(!r)return d("Open the board before changing its order.");U.expected_board_version=r}if(K==="cards"&&$.source_note_id){let ee=v("notes",$.source_note_id).saved;if(!(ee!=null&&ee.version))return d("Open this note before adding it to the board.");U.expected_source_note_version=ee.version}P={name:j,method:E,path:k,input:U,fields:W,kind:K,id:O,fingerprint:B,who:_},i.set(j,P)}return J(P)};async function J(C){var H,U,ee,pe;let j=C.id?v(C.kind,C.id):null;j&&(j.inflight=!0);let B=await e[C.method](C.path,C.input,S);if(j&&(j.inflight=!1),u()!==C.who)return d("The signed-in account changed. Open this view again.");let P=C.id?v(C.kind,C.id):null;return B.ok?(i.delete(C.name),P&&(P.uncertain=!1),(H=B.data)!=null&&H.board_version&&(r=B.data.board_version),C.kind==="cards"&&((U=B.data)!=null&&U.deleted)&&C.id&&o.delete(p(C.kind,C.id)),b(B,C.kind,{mutation:!0,fields:C.fields})):(((ee=B.error)==null?void 0:ee.code)==="network_error"?P&&(P.uncertain=!0):(i.delete(C.name),P&&(P.uncertain=!1,P.conflict=((pe=B.error)==null?void 0:pe.code)==="content_conflict")),n(B,{kind:C.kind,id:C.id,retry:()=>m(C.method,C.path,$,S)}),B)}let T=l.then(G);return l=T.catch(()=>{}),T}function x(E,k){return u(),[...o.entries()].some(([$,S])=>(!E||$.startsWith(`${E}/`))&&(!k||$===p(E,k))&&(Object.keys(S.draft).length>0||S.uncertain||S.conflict||S.inflight))}async function w(E,k,$){var W;let S=u(),_=v(E,k),q=_.generation;if(_.uncertain||_.inflight)return d("Retry the pending save before loading a saved version.");let K=await e.get(`/${E}/${k}`),O=(W=K.data)==null?void 0:W[E==="notes"?"note":"card"];return!K.ok||!O?K:await $(O)?u()!==S||_.generation!==q||_.uncertain||_.inflight?d("Your local text changed during the review. Review the saved version again."):(_.saved=O,_.draft={},_.conflict=!1,_.generation++,K):{ok:!1,cancelled:!0}}return{get:h,post:(E,k,$)=>m("post",E,k,$),put:(E,k,$)=>m("put",E,k,$),delete:(E,k,$)=>m("delete",E,k,$),markDraft:g,hasDirty:x,reviewSaved:w,draft:(E,k)=>(u(),{...v(E,k).draft})}}var we=Ac(Y,{actor:()=>{var e;return((e=D.get("user"))==null?void 0:e.id)??null},onError(e,{kind:t,id:s,retry:n}){var o,i,a;((o=e.error)==null?void 0:o.code)==="network_error"?cs("Save not confirmed. Your local text is kept.","Retry save",n,"warning"):((i=e.error)==null?void 0:i.code)==="content_conflict"&&s?cs("This record changed elsewhere. Your local text is kept.","Review saved",async()=>{var l;let r=await we.reviewSaved(t,s,p=>Ae({title:"Load the saved version?",description:`This replaces your local edits. Saved title: ${p.title||"Untitled"}

${p.body.slice(0,1500)}${p.body.length>1500?"\u2026":""}`,confirmLabel:"Use saved version",cancelLabel:"Keep local text"}));r.ok?window.dispatchEvent(new CustomEvent("vs:business-record-reloaded",{detail:{kind:t,id:s,record:r.data[t==="notes"?"note":"card"]}})):r.cancelled||A(((l=r.error)==null?void 0:l.message)||"Could not load the saved version.","error")},"warning"):A(((a=e.error)==null?void 0:a.message)||"Could not save. Your local text is kept.","error")}});window.addEventListener("beforeunload",e=>{we.hasDirty()&&(e.preventDefault(),e.returnValue="")});var Ko=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Yo=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},je=[],Be=null,qt=null,Yn=null,vs="",As=!1,Wo="",Wr="idle",Jn="list",ua=!1,Rc=800,Jm=200;var Dc="vs-notes-list-width",Bc=80;function Xm(){window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("notes",Xs)}async function Xs(){return clearTimeout(qt),qt=null,Be&&we.hasDirty("notes",Be)&&await Xr(),!we.hasDirty("notes")}function Zm(e){if(!e)return"";let t=y(e);return t=t.replace(/```(\w*)\n([\s\S]*?)```/g,(s,n,o)=>`<pre class="vs-note-code-block"><code>${o}</code></pre>`),t=t.replace(/`([^`]+)`/g,'<code class="vs-note-inline-code">$1</code>'),t=t.replace(/^### (.+)$/gm,'<h3 class="vs-note-h3">$1</h3>'),t=t.replace(/^## (.+)$/gm,'<h2 class="vs-note-h2">$1</h2>'),t=t.replace(/^# (.+)$/gm,'<h1 class="vs-note-h1">$1</h1>'),t=t.replace(/^&gt; (.+)$/gm,'<blockquote class="vs-note-blockquote">$1</blockquote>'),t=t.replace(/^---$/gm,'<hr class="vs-note-hr" />'),t=t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*(.+?)\*/g,"<em>$1</em>"),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" class="vs-note-link">$1</a>'),t=t.replace(/^- (.+)$/gm,'<li class="vs-note-li">$1</li>'),t=t.replace(/(<li class="vs-note-li">.*<\/li>\n?)+/g,'<ul class="vs-note-ul">$&</ul>'),t=t.replace(/^\d+\. (.+)$/gm,'<li class="vs-note-li-ol">$1</li>'),t=t.replace(/(<li class="vs-note-li-ol">.*<\/li>\n?)+/g,'<ol class="vs-note-ol">$&</ol>'),t=t.replace(/\n\n/g,'</p><p class="vs-note-p">'),t='<p class="vs-note-p">'+t+"</p>",t=t.replace(/<p class="vs-note-p">(<(?:h[1-3]|pre|blockquote|hr|ul|ol)[^>]*>)/g,"$1"),t=t.replace(/(<\/(?:h[1-3]|pre|blockquote|ul|ol)>)<\/p>/g,"$1"),t=t.replace(/<p class="vs-note-p"><\/p>/g,""),t}function Gr(){return`
    <div class="vs-empty-state vs-empty-state--panel">
      <div class="vs-empty-state-inner">
        <div class="vs-empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <p class="vs-empty-state-title">Select a note</p>
      </div>
    </div>
  `}function qc(){Xm(),ua=!1,setTimeout(()=>Qm(),0);let e=parseInt(localStorage.getItem(Dc)||"320",10);return`
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
            ${Gr()}
          </div>
        </div>
      </div>

      <!-- Mobile: Detail View (overlays list) -->
      <div id="vs-notes-mobile-detail" class="vs-notes-mobile-detail" style="display: none;"></div>
    </div>
  `}async function Qm(){ua||(ua=!0,await Oc(),nf())}async function Jo(e){var o,i;let t=await we.get(`/notes/${e}`);if(!t.ok||!((o=t.data)!=null&&o.note))return A(((i=t.error)==null?void 0:i.message)||"Could not load this note.","error"),null;let s=t.data.note,n=je.findIndex(a=>a.id===e);return n>=0&&(je[n]=s),s}function Nc(e){var o;if(e.detail.kind!=="notes")return;let{id:t,record:s}=e.detail,n=je.findIndex(i=>i.id===t);n>=0&&(je[n]=s),Be===t&&(clearTimeout(qt),qt=null,As=!1,Jn==="detail"?Jr(s):Yr(s,{restoring:!0}),(o=document.getElementById("vs-note-body"))==null||o.focus()),Bs()}async function Oc(){let e;if(vs?e=await we.get(`/notes/search?q=${encodeURIComponent(vs)}`):e=await we.get("/notes"),!e.ok){A("Could not load notes.","error");return}if(je=e.data.notes||[],Bs(),va(),Be&&!we.hasDirty("notes",Be)){let t=Be,s=await Jo(t);if(t!==Be)return;s?window.matchMedia("(max-width: 767px)").matches?(Jn="detail",Jr(s)):Yr(s,{restoring:!0}):Be=null}}function va(){let e=document.getElementById("vs-notes-empty"),t=document.getElementById("vs-notes-split");if(!e||!t)return;let s=window.matchMedia("(max-width: 767px)").matches;je.length===0&&!vs?(e.style.display="flex",t.style.display="none"):(e.style.display="none",t.style.display=s?"block":"flex")}function Bs(){let e=document.getElementById("vs-notes-list");if(!e)return;if(je.length===0){vs?e.innerHTML=`
        <div class="vs-notes-no-results">No notes matching "${y(vs)}"</div>
      `:e.innerHTML="";return}let t=je.filter(o=>o.pinned==1),s=je.filter(o=>o.pinned!=1),n="";t.length>0&&!vs&&(n+='<div class="vs-notes-section-label">Pinned</div>',n+=t.map(o=>Pc(o)).join(""),s.length>0&&(n+='<div class="vs-notes-section-label vs-notes-section-label--rest">Notes</div>')),n+=s.map(o=>Pc(o)).join(""),e.innerHTML=n,e.querySelectorAll("[data-note-id]").forEach(o=>{o.addEventListener("click",()=>{let i=parseInt(o.dataset.noteId,10);ma(i)}),o.addEventListener("contextmenu",i=>{i.preventDefault(),sf(i,parseInt(o.dataset.noteId,10))})})}function Pc(e){let t=e.id===Be,s=e.pinned==1,n=e.title||"Untitled",o=ef(e.body),i=yo(e.updated_at);return`
    <div class="vs-note-item ${t?"vs-note-item--active":""}"
         data-note-id="${e.id}" tabindex="0" role="button">
      <div class="vs-note-item-top">
        ${s?'<span class="vs-note-pin" title="Pinned">\u{1F4CC}</span>':""}
        <span class="vs-note-item-title">${y(n)}</span>
      </div>
      ${o?`<div class="vs-note-item-preview">${tf(y(o))}</div>`:""}
      <div class="vs-note-item-time">${i}</div>
    </div>
  `}function ef(e){if(!e)return"";let t=e.replace(/^#{1,3} /gm,"").replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1").replace(/`([^`]+)`/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^[-*] /gm,"").replace(/^\d+\. /gm,"").replace(/^> /gm,"").replace(/\n/g," ").trim();return t.length>Bc?t.substring(0,Bc).trim()+"\u2026":t}function tf(e){if(!vs)return e;let t=vs.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return e.replace(new RegExp(`(${t})`,"gi"),"<mark>$1</mark>")}async function ma(e){if(e===Be||await Xs()===!1)return;let t=await Jo(e);if(!t)return;Be=e,As=!1,Wr="idle",document.querySelectorAll(".vs-note-item").forEach(n=>{n.classList.toggle("vs-note-item--active",parseInt(n.dataset.noteId,10)===e)}),window.matchMedia("(max-width: 767px)").matches?(Jn="detail",Jr(t)):Yr(t)}async function Kr(){var n;if(await Xs()===!1)return;let e=Be;if(Be=null,As=!1,Wr="idle",Bs(),window.matchMedia("(max-width: 767px)").matches&&Jn==="detail"){Jn="list";let o=document.getElementById("vs-notes-mobile-detail");o&&(o.style.display="none")}else{let o=document.getElementById("vs-notes-editor-content");o&&(o.innerHTML=Gr())}(n=document.querySelector(`.vs-note-item[data-note-id="${e}"]`)||document.getElementById("btn-note-new"))==null||n.focus()}function Yr(e,t={}){let s=document.getElementById("vs-notes-editor-content");if(!s)return;let n=e.pinned==1;s.innerHTML=`
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
        <input id="vs-note-title" class="vs-note-title-input" type="text" aria-label="Note title"
               value="${y(e.title)}" placeholder="Untitled"
               autocomplete="off" spellcheck="true" ${window.IS_DEMO?"readonly":""} />
        <div id="vs-note-body-wrap" class="vs-note-body-wrap">
          <textarea id="vs-note-body" class="vs-note-body-textarea" aria-label="Note body"
                    placeholder="${window.IS_DEMO?"Read-only in demo mode.":"Start writing\u2026"}" spellcheck="true" ${window.IS_DEMO?"readonly":""}>${y(e.body)}</textarea>
        </div>
      </div>
    </div>
  `,Hc(e);let o=document.getElementById("vs-note-body");o&&(Go(o),t.restoring||setTimeout(()=>{Be!==e.id||!o.isConnected||(o.focus(),o.setSelectionRange(o.value.length,o.value.length))},50))}function Jr(e){let t=document.getElementById("vs-notes-mobile-detail");if(!t)return;let s=e.pinned==1;t.style.display="flex",t.innerHTML=`
    <div class="vs-note-mobile-header">
      <button id="btn-note-back" class="vs-note-mobile-back" aria-label="Back to notes">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Notes
      </button>
      <div class="vs-note-mobile-actions">
        ${window.IS_DEMO?'<span class="vs-note-save-status vs-note-save-status--readonly">Read-only</span>':""}
        ${window.IS_DEMO?"":`<button id="btn-note-pin" class="vs-note-toolbar-btn ${s?"vs-note-toolbar-btn--active":""}" aria-label="${s?"Unpin note":"Pin note"}">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="${s?"currentColor":"none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
        </button>`}
        ${window.IS_DEMO?"":`<button id="btn-note-delete" class="vs-note-toolbar-btn vs-note-toolbar-btn--danger" aria-label="Delete note">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>`}
      </div>
    </div>
    <div class="vs-note-editor-body">
      <input id="vs-note-title" class="vs-note-title-input" type="text" aria-label="Note title"
             value="${y(e.title)}" placeholder="Untitled"
             autocomplete="off" spellcheck="true" ${window.IS_DEMO?"readonly":""} />
      <div id="vs-note-body-wrap" class="vs-note-body-wrap">
        <textarea id="vs-note-body" class="vs-note-body-textarea" aria-label="Note body"
                  placeholder="${window.IS_DEMO?"Read-only in demo mode.":"Start writing\u2026"}" spellcheck="true" ${window.IS_DEMO?"readonly":""}>${y(e.body)}</textarea>
      </div>
    </div>
  `,Hc(e);let n=document.getElementById("btn-note-back");n==null||n.addEventListener("click",Kr);let o=document.getElementById("vs-note-body");o&&(Go(o),setTimeout(()=>{Be===e.id&&Jn==="detail"&&o.isConnected&&o.focus()},50))}function Hc(e){let t=document.getElementById("vs-note-title"),s=document.getElementById("vs-note-body"),n=()=>{window.IS_DEMO||we.markDraft("notes",e.id,Xn()),qt&&clearTimeout(qt),qt=setTimeout(()=>Xr(),Rc)};t==null||t.addEventListener("input",n),s==null||s.addEventListener("input",()=>{Go(s),n()});let o=document.getElementById("btn-note-pin");o==null||o.addEventListener("click",async()=>{if(Ko()||Yo())return;let p=e.pinned==1,{ok:c,data:d}=await we.put(`/notes/${e.id}`,{pinned:p?0:1});if(c&&d.note){e.pinned=d.note.pinned;let u=je.findIndex(f=>f.id===e.id);u>=0&&(je[u]={...je[u],...d.note}),o.classList.toggle("vs-note-toolbar-btn--active",d.note.pinned==1),o.setAttribute("aria-label",d.note.pinned==1?"Unpin note":"Pin note"),o.setAttribute("title",d.note.pinned==1?"Unpin":"Pin");let v=o.querySelector("svg");v&&v.setAttribute("fill",d.note.pinned==1?"currentColor":"none"),Bs(),d.pin_limit&&A(d.pin_limit_message||"You can pin up to 5 notes.","info")}});let i=document.getElementById("btn-note-preview");i==null||i.addEventListener("click",jc);let a=document.getElementById("btn-note-send-chat");a==null||a.addEventListener("click",()=>Qr());let r=document.getElementById("btn-note-board");r==null||r.addEventListener("click",()=>Fc(e));let l=document.getElementById("btn-note-delete");l==null||l.addEventListener("click",()=>Zr(e.id))}async function Xr(){if(!Be||window.IS_DEMO)return!0;let e=Be;if(!document.getElementById("vs-note-title"))return!1;let{title:t,body:s}=Xn(),{ok:n,data:o}=await we.put(`/notes/${e}`,{title:t,body:s});if(n&&(o!=null&&o.note)){let i=je.findIndex(a=>a.id===e);i>=0&&(je[i]={...je[i],...o.note}),Bs()}return n}async function Vr(){if(Ko()||Yo()||await Xs()===!1)return;let{ok:e,data:t}=await we.post("/notes",{title:"",body:""});e&&(t!=null&&t.note)&&(je.unshift(t.note),Bs(),va(),ma(t.note.id))}async function Zr(e){if(Ko()||Yo()||await Xs()===!1)return;let{ok:t}=await we.delete(`/notes/${e}`);if(!t){A("Could not delete note.","error");return}if(je=je.filter(n=>n.id!==e),Be===e){Be=null,As=!1,Wr="idle";let n=document.getElementById("vs-notes-editor-content");n&&(n.innerHTML=Gr())}Bs(),va(),cs("Note deleted","Undo",async()=>{var o;let n=await we.post(`/notes/${e}/restore`);n.ok&&((o=n.data)!=null&&o.note)&&(je.unshift(n.data.note),Bs(),va(),ma(n.data.note.id),A("Note restored.","success"))},"info");let s=document.getElementById("vs-notes-mobile-detail");s&&(s.style.display="none")}function jc(){let e=document.getElementById("vs-note-body-wrap"),t=document.getElementById("btn-note-preview");if(e)if(As){As=!1,e.innerHTML=`<textarea id="vs-note-body" class="vs-note-body-textarea" aria-label="Note body"
                    placeholder="Start writing\u2026" spellcheck="true">${y(Wo)}</textarea>`;let s=document.getElementById("vs-note-body");s&&(Go(s),s.addEventListener("input",()=>{Go(s),window.IS_DEMO||we.markDraft("notes",Be,Xn()),qt&&clearTimeout(qt),qt=setTimeout(()=>Xr(),Rc)}),s.focus()),t==null||t.classList.remove("vs-note-toolbar-btn--active")}else{let s=document.getElementById("vs-note-body");if(!s)return;Wo=s.value,As=!0;let n=Zm(Wo);e.innerHTML=`<div id="vs-note-preview" class="vs-note-preview">${n}</div>`,t==null||t.classList.add("vs-note-toolbar-btn--active")}}function Xn(){let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");return{title:(e==null?void 0:e.value)??"",body:As?Wo:(t==null?void 0:t.value)??""}}async function Qr(e){if(await Xs()===!1)return;let t,s;if(e){if(e=await Jo(e.id),!e)return;t=e.title||"",s=e.body||""}else({title:t,body:s}=Xn());let o=`Here is my note "${t||"Untitled"}":

${s}

`;window.location.hash="#/chat",setTimeout(()=>{let i=document.getElementById("prompt-input");i&&(i.value=o,i.focus(),i.style.height="auto",i.style.height=i.scrollHeight+"px")},150)}async function Fc(e){if(Ko()||Yo()||await Xs()===!1)return;let t,s,n;if(e){if(e=await Jo(e.id),!e)return;t=e.title||"",s=e.body||"",n=e.id}else({title:t,body:s}=Xn()),n=Be;let{ok:o,error:i}=await we.post("/cards",{title:t||"Untitled",body:s,column_name:"todo",source_note_id:n});o?A("Card added to Board.","success"):A((i==null?void 0:i.message)||"Failed to add card.","error")}function sf(e,t){var a;(a=document.getElementById("vs-note-ctx"))==null||a.remove();let s=je.find(r=>r.id===t);if(!s)return;let n=s.pinned==1,o=document.createElement("div");o.id="vs-note-ctx",o.className="vs-note-context-menu",o.style.left=`${e.clientX}px`,o.style.top=`${e.clientY}px`,o.innerHTML=`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>{let r=o.getBoundingClientRect();r.right>window.innerWidth&&(o.style.left=`${window.innerWidth-r.width-8}px`),r.bottom>window.innerHeight&&(o.style.top=`${window.innerHeight-r.height-8}px`)}),o.addEventListener("click",async r=>{var p;let l=(p=r.target.closest("[data-action]"))==null?void 0:p.dataset.action;if(l)switch(o.remove(),l){case"pin":{if(Ko()||Yo())return;let c=n?0:1,{ok:d,data:u}=await we.put(`/notes/${t}`,{pinned:c});if(d&&u.note){let v=je.findIndex(f=>f.id===t);v>=0&&(je[v]={...je[v],...u.note}),Bs(),u.pin_limit&&A(u.pin_limit_message||"You can pin up to 5 notes.","info")}break}case"send":{Qr(t!==Be?s:void 0);break}case"use":{if(await Xs()===!1)return;let c=t===Be?null:await Jo(t);if(t!==Be&&!c)return;let d=t===Be?Xn().body:c.body||"";window.location.hash="#/chat",setTimeout(()=>{let u=document.getElementById("prompt-input");u&&(u.value=d,u.focus(),u.style.height="auto",u.style.height=u.scrollHeight+"px")},150);break}case"delete":Zr(t);break;case"board":Fc(s);break}});let i=r=>{o.contains(r.target)||(o.remove(),document.removeEventListener("click",i))};setTimeout(()=>document.addEventListener("click",i),0)}function nf(){window.addEventListener("vs:business-record-reloaded",Nc);let e=document.getElementById("btn-note-new");e==null||e.addEventListener("click",Vr);let t=document.getElementById("btn-notes-first");t==null||t.addEventListener("click",Vr);let s=document.getElementById("notes-search");s==null||s.addEventListener("input",()=>{Yn&&clearTimeout(Yn),Yn=setTimeout(()=>{vs=s.value.trim(),Oc()},Jm)});let n=document.getElementById("vs-notes-list-panel");n==null||n.addEventListener("click",o=>{o.target.closest(".vs-note-item")||o.target.closest("button")||o.target.closest("input")||o.target.closest(".vs-notes-section-label")||Be&&Kr()}),document.addEventListener("keydown",zc),of()}function zc(e){var n,o,i;if(D.get("route")!=="notes")return;let s=navigator.platform.toUpperCase().includes("MAC")?e.metaKey:e.ctrlKey;if(s&&e.key==="n"){e.preventDefault(),Vr();return}if(s&&e.key==="Backspace"&&Be){e.preventDefault(),Zr(Be);return}if(s&&e.shiftKey&&e.key==="p"){e.preventDefault(),Be&&jc();return}if(s&&e.shiftKey&&(e.key==="c"||e.key==="C")){e.preventDefault();let a=je.find(r=>r.id===Be);a&&Qr(a);return}if(e.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;Be&&(e.preventDefault(),Kr());return}if((e.key==="ArrowUp"||e.key==="ArrowDown")&&!e.metaKey&&!e.ctrlKey){let a=(n=document.activeElement)==null?void 0:n.closest(".vs-note-item");if(!a)return;e.preventDefault();let r=[...document.querySelectorAll(".vs-note-item")],l=r.indexOf(a),p=e.key==="ArrowDown"?Math.min(l+1,r.length-1):Math.max(l-1,0);(o=r[p])==null||o.focus()}if(e.key==="Enter"){let a=(i=document.activeElement)==null?void 0:i.closest(".vs-note-item");a&&(e.preventDefault(),ma(parseInt(a.dataset.noteId,10)))}}function of(){let e=document.getElementById("vs-notes-resize"),t=document.getElementById("vs-notes-list-panel");if(!e||!t)return;let s,n;e.addEventListener("mousedown",o=>{o.preventDefault(),s=o.clientX,n=t.offsetWidth;let i=r=>{let l=Math.max(200,Math.min(500,n+r.clientX-s));t.style.width=`${l}px`},a=()=>{document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",a),localStorage.setItem(Dc,String(t.offsetWidth))};document.addEventListener("mousemove",i),document.addEventListener("mouseup",a)})}function Go(e){if(!e)return;e.style.height="auto";let t=window.innerHeight-200;e.style.height=Math.min(t,e.scrollHeight)+"px"}function Uc(){var e,t;window.removeEventListener("vs:business-record-reloaded",Nc),document.removeEventListener("keydown",zc),qt&&(clearTimeout(qt),qt=null),Yn&&(clearTimeout(Yn),Yn=null),vs="",As=!1,Wo="",ua=!1,(e=window.__vsFlushCallbacks)==null||e.delete("notes"),(t=document.getElementById("vs-note-ctx"))==null||t.remove()}function fa(e,{initialFocus:t,returnFocus:s=document.activeElement,onEscape:n}={}){let o=!0,i=v=>v&&!v.disabled&&!v.closest('[hidden], [inert], [aria-hidden="true"]')&&v.getClientRects().length>0&&getComputedStyle(v).visibility!=="hidden",a=()=>[...e.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")].filter(v=>v.tabIndex>=0&&i(v)),r=()=>{let f=[...document.querySelectorAll('[role="dialog"], .vs-modal-overlay.is-visible')].filter(i).at(-1);return!f||f===e||f.contains(e)||e.contains(f)},l=()=>{let v=typeof t=="function"?t():t;(i(v)?v:a()[0]||e).focus()},p=v=>{if(!(!o||!r())){if(v.key==="Escape"&&n)v.preventDefault(),v.stopImmediatePropagation(),n();else if(v.key==="Tab"){let f=a(),b=f[0]||e,h=f.at(-1)||e;(!e.contains(document.activeElement)||document.activeElement===e||(v.shiftKey?document.activeElement===b:document.activeElement===h))&&(v.preventDefault(),(v.shiftKey?h:b).focus())}}},c=v=>{o&&r()&&!e.contains(v.target)&&l()},d=({restoreFocus:v=!0}={})=>{if(!o)return;o=!1,document.removeEventListener("keydown",p,!0),document.removeEventListener("focusin",c,!0),u.disconnect();let f=typeof s=="function"?s():s;v&&(f!=null&&f.isConnected)&&f.focus()},u=new MutationObserver(()=>{e.isConnected||d({restoreFocus:!1})});return u.observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",p,!0),document.addEventListener("focusin",c,!0),l(),d}var ga=!1,Ps=null,Fe=null,Zn=null,Xo=null,pt=null,ei=[{id:"todo",label:"To Do",dotColor:"var(--vs-text-ghost)"},{id:"in_progress",label:"In Progress",dotColor:"var(--vs-accent)"},{id:"done",label:"Done",dotColor:"var(--vs-success)"}];function Qn(){var t;let e=(t=D.get("user"))==null?void 0:t.role;return e==="owner"||e==="editor"}function el(){return ga=!1,Fe=null,setTimeout(()=>{pf(),Ct()},0),`
    <div class="vs-board" id="board-root">
      <div class="vs-board-header">
        <h1 class="vs-board-title">Board</h1>
        ${Qn()?`
          <button id="btn-board-add" class="vs-btn vs-btn-primary vs-btn-sm">
            New Card
          </button>
        `:""}
      </div>
      <div class="vs-board-columns" id="board-columns">
        ${ei.map(t=>`
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
  `}async function Ct(){var o;let{ok:e,data:t}=await we.get("/cards");if(!e){A("Failed to load board.","error");return}let s=(t==null?void 0:t.cards)||[];if(Fe&&s.some(i=>i.id===Fe)){let i=Fe,a=await we.get(`/cards/${i}`);if(a.ok&&i===Fe)s[s.findIndex(r=>r.id===i)]=a.data.card;else if(!a.ok){A("Could not refresh the open card. Your local text is kept.","error");return}}D.set("cards",s),D.set("cardsLoaded",!0),af(s);let n=await we.get("/cards/archived");if(n.ok){let i=((o=n.data)==null?void 0:o.cards)||[];cf(i.length)}}function af(e){let t=Qn();for(let s of ei){let n=e.filter(a=>a.column_name===s.id),o=document.querySelector(`[data-col-cards="${s.id}"]`),i=document.querySelector(`[data-count="${s.id}"]`);if(i&&(i.textContent=n.length),!!o){if(n.length===0){s.id==="todo"&&e.length===0?o.innerHTML=t?`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0 0 12px;">Your board is empty</p>
              <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 16px;">Add your first task or promote a note from the Notes section.</p>
              <button class="vs-btn vs-btn-ghost vs-btn-sm board-empty-add">Add a card</button>
            </div>`:`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0;">No tasks on the board yet.</p>
            </div>`:t?o.innerHTML='<div class="vs-board-drop-zone">Drop a card here</div>':o.innerHTML="";continue}if(o.innerHTML=n.map(a=>a.id===Fe?Gc(a,s,t):rf(a,s,t)).join(""),Fe){let a=o.querySelector(`[data-card-id="${Fe}"].vs-board-card-expanded`);a&&t&&Kc(a,Fe)}}}}function rf(e,t,s){let n=e.body?`<div class="vs-board-card-body">${y(e.body.substring(0,200))}</div>`:"",o=e.linked_page?`<div class="vs-board-card-footer"><span class="vs-board-card-link" data-page="${X(e.linked_page)}"><span class="vs-board-card-link-icon">${L.link}</span>${y(Qc(e.linked_page))}</span></div>`:"";return`
    <div class="vs-board-card ${s?"vs-board-card-draggable":""}"
         data-card-id="${e.id}"
         data-column="${e.column_name}"
         ${s?'draggable="true"':""}>
      <div class="vs-board-card-title">
        <span class="vs-status-dot" style="background: ${t.dotColor};"></span>
        <span class="vs-board-card-title-text">${y(e.title||"Untitled")}</span>
        ${s?`
          <button class="vs-board-card-menu-btn" data-card-menu="${e.id}" title="Card actions">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        `:""}
      </div>
      ${n}
      ${o}
    </div>
  `}function Gc(e,t,s){let n=D.get("pages")||[];return s?`
    <div class="vs-board-card vs-board-card-expanded vs-board-card-editing"
         data-card-id="${e.id}" data-column="${e.column_name}">
      <div class="vs-board-card-expand-header">
        <input type="text"
               class="vs-board-inline-title"
               data-field="title"
               data-card-id="${e.id}"
               value="${X(e.title)}"
               placeholder="Card title" />
        <button class="vs-board-card-close-btn" data-card-close="${e.id}" title="Close (Esc)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <textarea class="vs-board-inline-body"
                data-field="body"
                data-card-id="${e.id}"
                rows="3"
                placeholder="Add details\u2026">${y(e.body||"")}</textarea>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label" for="board-column-${e.id}">Column</label>
        <select id="board-column-${e.id}" class="vs-board-inline-select" data-field="column" data-card-id="${e.id}">
          ${ei.map(o=>`<option value="${o.id}" ${o.id===e.column_name?"selected":""}>${o.label}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label" for="board-page-${e.id}">Linked page</label>
        <select id="board-page-${e.id}" class="vs-board-inline-select" data-field="linked_page" data-card-id="${e.id}">
          <option value="">None</option>
          ${n.map(o=>`<option value="${X(o.slug)}" ${o.slug===e.linked_page?"selected":""}>${y(o.title||o.slug)}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-card-expand-footer">
        <div class="vs-board-card-actions">
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-card-archive="${e.id}" title="Archive this card">
            ${L.archive}
            Archive
          </button>
          <button class="vs-btn vs-btn-danger vs-btn-xs" data-card-delete="${e.id}" title="Permanently delete">
            ${L.trash}
            Delete
          </button>
        </div>
        <div class="vs-board-card-meta">
          Created ${Qo(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${Qo(e.updated_at)}`:""}
        </div>
      </div>
    </div>
  `:`
      <div class="vs-board-card vs-board-card-expanded"
           data-card-id="${e.id}" data-column="${e.column_name}">
        <div class="vs-board-card-expand-header">
          <div class="vs-board-card-title">
            <span class="vs-status-dot" style="background: ${t.dotColor};"></span>
            <span class="vs-board-card-title-text">${y(e.title||"Untitled")}</span>
          </div>
          <button class="vs-board-card-close-btn" data-card-close="${e.id}" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        ${e.body?`<div class="vs-board-card-body-full">${y(e.body)}</div>`:'<div class="vs-board-card-body-empty">No description.</div>'}
        ${e.linked_page?`
          <div class="vs-board-card-footer">
            <span class="vs-board-card-link" data-page="${X(e.linked_page)}"><span class="vs-board-card-link-icon">${L.link}</span>${y(Qc(e.linked_page))}</span>
          </div>
        `:""}
        <div class="vs-board-card-meta">
          Created ${Qo(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${Qo(e.updated_at)}`:""}
        </div>
      </div>
    `}function Kc(e,t){let s=e.querySelector('[data-field="title"]'),n=e.querySelector('[data-field="body"]'),o=e.querySelector('[data-field="column"]'),i=e.querySelector('[data-field="linked_page"]');s==null||s.addEventListener("input",()=>{Vc(t,{title:s.value.trim()})}),n==null||n.addEventListener("input",()=>{Wc(n),Vc(t,{body:n.value})}),o==null||o.addEventListener("change",async()=>{if(window.IS_DEMO){return}let a=o.value;if(await ms()===!1)return;let{ok:r}=await we.put(`/cards/${t}/move`,{column_name:a,position:0});r?(Fe=null,await Ct()):void 0}),i==null||i.addEventListener("change",async()=>{if(window.IS_DEMO){return}let{ok:a}=await we.put(`/cards/${t}`,{linked_page:i.value||null});}),n&&Wc(n)}function Vc(e,t){window.IS_DEMO||we.markDraft("cards",e,t),pt&&pt.cardId===e?Object.assign(pt.fields,t):pt={cardId:e,fields:{...t}},clearTimeout(Zn),Zn=setTimeout(()=>ms(),600)}async function ms(){if(clearTimeout(Zn),Zn=null,Xo&&await Xo,!pt)return!we.hasDirty("cards");let{cardId:e,fields:t}=pt;if(pt=null,window.IS_DEMO)return!0;let s=we.put(`/cards/${e}`,t).then(n=>{if(!n.ok){let o=(pt==null?void 0:pt.cardId)===e?pt.fields:{};pt={cardId:e,fields:{...t,...o}}}return n.ok,n});return Xo=s,await s,Xo===s&&(Xo=null),!we.hasDirty("cards")}function Wc(e){e.style.height="auto",e.style.height=Math.max(60,e.scrollHeight)+"px"}async function lf(e){if(Fe&&Fe!==e&&await ha()===!1)return;let{ok:t,data:s}=await we.get(`/cards/${e}`);if(!t||!(s!=null&&s.card)){A("Card not found.","error");return}Fe=e;let n=s.card,o=ei.find(p=>p.id===n.column_name)||ei[0],i=Qn(),a=document.querySelector(`[data-card-id="${e}"]`);if(!a)return;let r=Gc(n,o,i);a.outerHTML=r;let l=document.querySelector(`[data-card-id="${e}"]`);l&&i&&(Kc(l,e),setTimeout(()=>{var p;return(p=l.querySelector(".vs-board-inline-title"))==null?void 0:p.focus()},50)),l==null||l.scrollIntoView({behavior:"smooth",block:"nearest"})}async function ha(){return Fe?await ms()===!1?!1:(Fe=null,await Ct(),!0):!0}async function Yc(e){var s;if(e.detail.kind!=="cards")return;let{id:t}=e.detail;(pt==null?void 0:pt.cardId)===t&&(clearTimeout(Zn),Zn=null,pt=null),await Ct(),(s=document.querySelector(`[data-card-id="${t}"] [data-field="body"]`))==null||s.focus()}function df(e,t){Zo();let s=document.createElement("div");s.className="vs-board-card-dropdown",s.id="vs-board-card-dropdown",s.innerHTML=`
    <button class="vs-board-card-dropdown-item" data-action="archive" data-id="${e}">
      ${L.archive}
      Archive
    </button>
    <div class="vs-board-card-dropdown-divider"></div>
    <button class="vs-board-card-dropdown-item vs-board-card-dropdown-danger" data-action="delete" data-id="${e}">
      ${L.trash}
      Delete
    </button>
  `;let n=t.getBoundingClientRect();s.style.position="fixed",s.style.top=`${n.bottom+4}px`,s.style.right=`${window.innerWidth-n.right}px`,s.style.zIndex="1000",document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let o=a=>{!s.contains(a.target)&&a.target!==t&&(Zo(),document.removeEventListener("click",o))};setTimeout(()=>document.addEventListener("click",o),10);let i=a=>{a.key==="Escape"&&(Zo(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i),s.addEventListener("click",async a=>{let r=a.target.closest("[data-action]");if(!r)return;let l=r.dataset.action,p=parseInt(r.dataset.id,10);if(Zo(),l==="archive"){if(window.IS_DEMO){A("Demo mode \u2014 this action is disabled.","warning");return}if(await ms()===!1)return;let{ok:c}=await we.post(`/cards/${p}/archive`);c&&(Fe===p&&(Fe=null),cs("Card archived.","Undo",async()=>{await we.post(`/cards/${p}/restore`),await Ct()}),await Ct())}else if(l==="delete"){if(window.IS_DEMO){A("Demo mode \u2014 this action is disabled.","warning");return}if(!await Ae({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0})||await ms()===!1)return;let{ok:d}=await we.delete(`/cards/${p}`);d&&(Fe===p&&(Fe=null),A("Card deleted.","success"),await Ct())}})}function Zo(){let e=document.getElementById("vs-board-card-dropdown");e&&e.remove()}function cf(e){let t=document.getElementById("board-archived-link");if(t){if(e===0){t.classList.add("hidden");return}t.classList.remove("hidden"),t.innerHTML=`<button class="vs-board-show-archived">${L.archive||""} Archived (${e})</button>`}}function pf(){var s,n;if(ga)return;ga=!0,window.addEventListener("vs:business-record-reloaded",Yc);let e=Qn();(s=document.getElementById("btn-board-add"))==null||s.addEventListener("click",Zc);let t=document.getElementById("board-columns");t&&(t.addEventListener("click",uf),e&&gf(t)),(n=document.getElementById("board-archived-link"))==null||n.addEventListener("click",o=>{o.target.closest(".vs-board-show-archived")&&hf()}),document.addEventListener("keydown",Jc),document.addEventListener("mousedown",Xc),ff(),window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("board",()=>ms())}function uf(e){let t=e.target;if(t.closest(".board-empty-add")){Zc();return}let s=t.closest("[data-card-menu]");if(s){e.stopPropagation();let l=parseInt(s.dataset.cardMenu,10);df(l,s);return}if(t.closest("[data-card-close]")){e.stopPropagation(),ha();return}let o=t.closest("[data-card-archive]");if(o){e.stopPropagation(),vf(parseInt(o.dataset.cardArchive,10));return}let i=t.closest("[data-card-delete]");if(i){e.stopPropagation(),mf(parseInt(i.dataset.cardDelete,10));return}let a=t.closest(".vs-board-card-link");if(a){e.stopPropagation();let l=a.dataset.page;l&&bf(l);return}if(t.closest("input, textarea, select, button"))return;let r=t.closest(".vs-board-card");if(r&&!r.classList.contains("vs-board-card-expanded")){let l=parseInt(r.dataset.cardId,10);lf(l);return}}function Jc(e){if(e.key==="Escape"&&Fe){if(document.querySelector(".vs-modal-overlay"))return;e.preventDefault(),ha()}}function Xc(e){if(!Fe)return;let t=e.target,s=document.querySelector(".vs-board-card-expanded");s&&s.contains(t)||t.closest(".vs-modal-overlay")||t.closest(".vs-board-card-dropdown")||ha()}async function vf(e){if(window.IS_DEMO){A("Demo mode \u2014 this action is disabled.","warning");return}if(await ms()===!1)return;let{ok:t}=await we.post(`/cards/${e}/archive`);t&&(Fe=null,cs("Card archived.","Undo",async()=>{await we.post(`/cards/${e}/restore`),await Ct()}),await Ct())}async function mf(e){if(window.IS_DEMO){A("Demo mode \u2014 this action is disabled.","warning");return}if(!await Ae({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0})||await ms()===!1)return;let{ok:s}=await we.delete(`/cards/${e}`);s&&(Fe=null,A("Card deleted.","success"),await Ct())}function Zc(){var a,r,l;let e=document.getElementById("vs-board-create-overlay");e&&e.remove();let t=D.get("pages")||[],s=document.createElement("div");s.id="vs-board-create-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" role="dialog" aria-modal="true" aria-labelledby="card-new-heading" tabindex="-1" style="max-width: 440px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title" id="card-new-heading">New Card</h2>
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
              ${t.map(p=>`<option value="${X(p.slug)}">${y(p.title||p.slug)}</option>`).join("")}
            </select>
          </div>
          <div id="card-create-error" class="hidden text-sm" role="alert" style="color: var(--vs-error);"></div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="btn-card-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
        <button id="btn-card-create" class="vs-btn vs-btn-primary vs-btn-sm">Create</button>
      </div>
    </div>
  `,document.body.appendChild(s);let n=!1;requestAnimationFrame(()=>{n||s.classList.add("is-visible")});let o=()=>{n||(n=!0,i(),s.inert=!0,s.setAttribute("aria-hidden","true"),Te(s))},i=fa(s.querySelector(".vs-modal"),{initialFocus:()=>s.querySelector("#card-new-title"),returnFocus:()=>document.getElementById("btn-board-add"),onEscape:o});Ie(s,o),(a=document.getElementById("btn-card-cancel"))==null||a.addEventListener("click",o),(r=document.getElementById("card-new-title"))==null||r.addEventListener("keydown",p=>{var c;p.key==="Enter"&&((c=document.getElementById("btn-card-create"))==null||c.click())}),(l=document.getElementById("btn-card-create"))==null||l.addEventListener("click",async()=>{var h,g,m,x;let p=(g=(h=document.getElementById("card-new-title"))==null?void 0:h.value)==null?void 0:g.trim(),c=(m=document.getElementById("card-new-column"))==null?void 0:m.value,d=((x=document.getElementById("card-new-page"))==null?void 0:x.value)||null,u=document.getElementById("card-create-error"),v=document.getElementById("btn-card-create");if(!p){u&&(u.textContent="Please enter a card title.",u.classList.remove("hidden"));return}if(v.disabled=!0,v.textContent="Creating\u2026",window.IS_DEMO){o(),A("Demo mode \u2014 this action is disabled.","warning");return}let{ok:f,error:b}=await we.post("/cards",{title:p,column_name:c,linked_page:d});f?(o(),A("Card created.","success"),await Ct()):(v.disabled=!1,v.textContent="Create",u&&(u.textContent=(b==null?void 0:b.message)||"Failed to create card.",u.classList.remove("hidden")))})}async function ff(){if((D.get("pages")||[]).length>0)return;let{ok:t,data:s}=await we.get("/pages");t&&Array.isArray(s==null?void 0:s.pages)&&D.set("pages",s.pages)}function gf(e){e.addEventListener("dragstart",t=>{let s=t.target.closest(".vs-board-card");!s||s.classList.contains("vs-board-card-expanded")||(Ps={cardId:parseInt(s.dataset.cardId,10),sourceColumn:s.dataset.column},s.classList.add("vs-board-card-dragging"),t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",s.dataset.cardId))}),e.addEventListener("dragend",t=>{let s=t.target.closest(".vs-board-card");s&&s.classList.remove("vs-board-card-dragging"),Ps=null,e.querySelectorAll(".vs-board-drop-indicator").forEach(n=>n.remove())}),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer.dropEffect="move";let s=t.target.closest("[data-col-cards]");if(!s)return;e.querySelectorAll(".vs-board-drop-indicator").forEach(r=>r.remove());let n=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")],o=t.clientY,i=null;for(let r of n){let l=r.getBoundingClientRect();if(o<l.top+l.height/2){i=r;break}}let a=document.createElement("div");a.className="vs-board-drop-indicator",i?s.insertBefore(a,i):s.appendChild(a)}),e.addEventListener("drop",async t=>{if(t.preventDefault(),!Ps)return;let s=t.target.closest("[data-col-cards]");if(!s)return;let n=s.dataset.colCards,i=(D.get("cards")||[]).filter(u=>u.column_name===n&&u.id!==Ps.cardId).sort((u,v)=>u.position-v.position),a=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")].map(u=>({id:parseInt(u.dataset.cardId,10),rect:u.getBoundingClientRect()})),r=t.clientY,l=a.length;for(let u=0;u<a.length;u++)if(r<a[u].rect.top+a[u].rect.height/2){l=u;break}let p;if(i.length===0||l===0?p=0:l>=i.length?p=i[i.length-1].position+1e3:p=Math.floor((i[l-1].position+i[l].position)/2),e.querySelectorAll(".vs-board-drop-indicator").forEach(u=>u.remove()),window.IS_DEMO){await Ct(),Ps=null;return}let c=Ps.cardId;if(await ms()===!1){Ps=null;return}let{ok:d}=await we.put(`/cards/${c}/move`,{column_name:n,position:p});d?await Ct():A("Failed to move card.","error"),Ps=null})}async function hf(){var r;let{ok:e,data:t}=await we.get("/cards/archived");if(!e){A("Failed to load archived cards.","error");return}let s=(t==null?void 0:t.cards)||[],n=Qn(),o=document.getElementById("vs-board-archived-overlay");o&&o.remove();let i=document.createElement("div");i.id="vs-board-archived-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">Archived Cards</h2>
      </div>
      <div class="vs-modal-body" style="max-height: 60vh; overflow-y: auto;">
        ${s.length===0?'<p style="font-size: 13px; color: var(--vs-text-ghost);">No archived cards.</p>':s.map(l=>`
            <div class="vs-board-archived-item" data-card-id="${l.id}">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${y(l.title||"Untitled")}</div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 2px;">Archived ${Qo(l.updated_at)}</div>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>Te(i);if(Ie(i,a),(r=document.getElementById("btn-archived-close"))==null||r.addEventListener("click",a),n){let l=i.querySelector(".vs-modal");l==null||l.addEventListener("click",async p=>{let c=p.target.closest(".archived-restore-btn");if(c){let u=c.dataset.id,{ok:v}=await we.post(`/cards/${u}/restore`);v&&(A("Card restored.","success"),a(),await Ct());return}let d=p.target.closest(".archived-delete-btn");if(d){let u=d.dataset.id;if(!await Ae({title:"Delete Permanently",description:"This card will be permanently deleted. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:f}=await we.delete(`/cards/${u}`);f&&(A("Card deleted.","success"),a(),await Ct())}})}}function bf(e){if(Qn())D.set("activePageScope",e),window.location.hash="#/chat";else{let s=window.location.origin,n=e==="index"?"/":`/${e}`;window.open(`${s}${n}`,"_blank")}}function Qo(e){return e?new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""}function Qc(e){if(!e)return"";if(e==="index"||e==="index.php")return"Home";let s=(D.get("pages")||[]).find(i=>i.slug===e);return s!=null&&s.title?s.title:e.replace(/\.(php|html)$/i,"").split("/").pop().split("-").filter(Boolean).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(" ")||e}async function ep(){if(await ms()===!1)return!1;Ps=null,Fe=null,pt=null,ga=!1,Zo(),document.removeEventListener("keydown",Jc),document.removeEventListener("mousedown",Xc),window.removeEventListener("vs:business-record-reloaded",Yc),window.__vsFlushCallbacks&&window.__vsFlushCallbacks.delete("board")}function ti(e=[],t=[]){var s,n,o,i;try{let a=JSON.parse(sessionStorage.getItem("vs-editor-state")||"null");if(a){let r=l=>{var p;return((p=e.find(c=>c.oldFilePath===l))==null?void 0:p.newFilePath)||l};a.openTabs=[...new Set((a.openTabs||[]).map(r).filter(l=>!t.includes(l)))],a.activeTab=r(a.activeTab),a.openTabs.includes(a.activeTab)||(a.activeTab=a.openTabs[0]||null),sessionStorage.setItem("vs-editor-state",JSON.stringify(a))}}catch{}for(let a of e)(n=(s=window.__vsEditorPage)==null?void 0:s.reconcileMove)==null||n.call(s,a.oldFilePath,a.newFilePath);for(let a of t)(i=(o=window.__vsEditorPage)==null?void 0:o.reconcileDelete)==null||i.call(o,a)}async function tp(e,{read:t=o=>Y.get(o,{silent:!0}),pause:s=()=>new Promise(o=>setTimeout(o,1e3)),attempts:n=15}={}){var i;let o={};for(let a=0;a<n;a++){let r=await t("/site-control/plans/"+encodeURIComponent(e));if(r.ok&&r.data){if(o=r.data,["applied","failed","ready","unknown"].includes(o.status))return o}else if(["forbidden","not_found","unauthorized"].includes((i=r.error)==null?void 0:i.code))break;a+1<n&&await s()}return{...o,status:"unknown"}}var si="vs-sc-pending-mutation";function _n(){try{let e=JSON.parse(sessionStorage.getItem(si)||"null");return e&&/^[a-f0-9]{32}$/.test(e.id)?e:null}catch{return null}}function yf(){return Array.from(crypto.getRandomValues(new Uint8Array(16)),e=>e.toString(16).padStart(2,"0")).join("")}function xf(e){if(typeof e=="string")try{e=JSON.parse(e)}catch{return null}return(e==null?void 0:e.ok)===!0?{ok:!0,data:e.data||e}:(e==null?void 0:e.ok)===!1?{ok:!1,error:e.error||{message:"The mutation failed."}}:null}async function sp(e,t,s={}){if(_n())return tl(s);let n={id:(s.createId||yf)(),kind:"shared",route:e,body:t};try{sessionStorage.setItem(si,JSON.stringify(n))}catch{return{ok:!1,error:{code:"recovery_unavailable",message:"Your browser could not save the recovery identifier. Enable session storage, then try again."}}}return np(n,s)}async function np(e,t={}){var n,o,i,a;let s=await(t.operation||ye)(e.route,e.body);return s.ok||["invalid_schema","invalid_path","content_conflict","idempotency_conflict","permission_denied","review_expired"].includes((n=s.error)==null?void 0:n.code)||["succeeded","failed_restored","expired","cancelled"].includes((i=(o=s.data)==null?void 0:o.operation)==null?void 0:i.status)?(sessionStorage.removeItem(si),s):{...s,ok:!1,error:{...s.error,outcome_unknown:!0,message:((a=s.error)==null?void 0:a.message)||"This operation is still retained. Retry to read or continue the same request."}}}async function tl({read:e=o=>Y.get(o,{silent:!0}),pause:t=()=>new Promise(o=>setTimeout(o,1e3)),attempts:s=15,operation:n=ye}={}){var r,l,p;let o=_n();if(!o)return{ok:!1,error:{code:"no_pending_mutation",message:"No Site mutation needs recovery."}};if(o.kind==="shared")return np(o,{operation:n});let i={};for(let c=0;c<s;c++){let d=await e("/site-control/mutations/"+o.id);if(d.ok&&d.data&&(i=d.data,["complete","applied","failed"].includes(i.status))){let u=xf(i.response)||{ok:!1,error:{code:"mutation_failed",message:"The mutation failed. Review the restoration details before continuing."}};return u.ok||(u.error={...u.error,restored:u.error.restored??i.restored??null,snapshotId:u.error.snapshotId||i.snapshotId||null}),(r=u.error)!=null&&r.recovery_resolved&&u.error.recovery_note&&(u.error.message=u.error.recovery_note),sessionStorage.removeItem(si),(p=(l=globalThis.window)==null?void 0:l.__vsSetGlobalStatus)==null||p.call(l,u.ok?"saved":"error"),u}c+1<s&&await t()}let a={...o,snapshotId:i.snapshotId||o.snapshotId||null};try{sessionStorage.setItem(si,JSON.stringify(a))}catch{}return{ok:!1,error:{code:"mutation_unconfirmed",message:"The server has not confirmed this change. Check the result before editing or retrying.",outcome_unknown:!0,mutation_id:o.id,snapshotId:a.snapshotId,restored:null}}}var wf=[{selector:".vs-site-tree-select[data-select-page]",attribute:"data-select-page"},{selector:".vs-site-card-body[data-select-page]",attribute:"data-select-page"},{selector:".vs-impact-item[data-node-id]",attribute:"data-node-id"},{selector:".vs-impact-ref-item[data-node-id]",attribute:"data-node-id"}];function op(e,t){if(!t||!e.contains(t))return null;for(let s of wf){if(!t.matches(s.selector))continue;let n=t.getAttribute(s.attribute),o=[...e.querySelectorAll(s.selector)].filter(i=>i.getAttribute(s.attribute)===n);return{...s,value:n,index:o.indexOf(t)}}return null}function ip(e,t){var n;if(!t)return;(n=[...e.querySelectorAll(t.selector)].filter(o=>o.getAttribute(t.attribute)===t.value)[t.index])==null||n.focus({preventScroll:!0})}var ce=null;function ap(e){ce=e}var ue=null;function fs(e){ue=e}var rp=null;function Rs(e){rp=e}var Zs="";function nl(e){Zs=e}var Ds=null;function Qs(e){Ds=e}var ni=null;function ba(e){ni=e}var ol=!1;function lp(e){ol=e}var ss=null;function en(e){ss=e}var kf=null;function tn(e){kf=e}var sn="";function qs(e){sn=e}var il=!1;function ya(e){il=e}var Ke="idle";function Pe(e){Ke=e}var nn=null;function wt(e){nn=e}var at=null;function Wt(e){at=e}var Ef=null;function dp(e){Ef=e}var Ln=!1;function cp(e){Ln=e}var _t;function al(e){_t=e}var gs=null;function oi(e){gs=e}var ii=!1;function pp(e){ii=e}var ns=null;function up(e){ns=e}var Nt=null;function vp(e){Nt=e}var mp=!1;function fp(e){mp=e}var eo=null;function rl(e){eo=e}var xa=!1;function gp(e){xa=e}var wa=!1;function hp(e){wa=e}var ka=!1;function Ea(e){ka=e}function os(){Ln=!1,_t=void 0,gs=null,ii=!1,ns=null,Nt=null,mp=!1,eo=null,xa=!1,wa=!1,ka=!1}var on=!1;function bp(e){on=e}var $a="";function yp(e){$a=e}var Ns="idle";function Sa(e){Ns=e}var Tn=null;function ll(e){Tn=e}var ai=null;function xp(e){ai=e}function hs(){on=!1,$a="",Ns="idle",Tn=null,ai=null}var an=!1;function wp(e){an=e}var kt="idle";function is(e){kt=e}var In=null;function dl(e){In=e}var ri=null;function kp(e){ri=e}function as(){an=!1,kt="idle",In=null,ri=null}var sl="vs-site-selected-node";function to(e){try{e?sessionStorage.setItem(sl,e):sessionStorage.removeItem(sl)}catch{}}function Ep(){try{return sessionStorage.getItem(sl)||null}catch{return null}}var Lt=new Set,$p="vs-site-card-prefs",$f={"direct-includes":"open","transitive-includes":"closed","links-to":"closed","linked-from":"open","blast-radius":"closed"};function Sf(){try{let e=sessionStorage.getItem($p);if(e)return new Map(Object.entries(JSON.parse(e)))}catch{}return new Map}var Ca=Sf();function Sp(){try{sessionStorage.setItem($p,JSON.stringify(Object.fromEntries(Ca)))}catch{}}function cl(e){let t=Ca.get(e);return t?t==="closed":($f[e]||"closed")==="closed"}var ut=new Map,Cp="vs-site-sidebar-widths",_p="vs-site-section-state",Cf=["partial","route","asset","token"],Lp=[{key:"page",label:"Pages",icon:"fileText"},{key:"partial",label:"Partials",icon:"fileCode"},{key:"route",label:"Routes",icon:"globe"},{key:"asset",label:"Assets",icon:"image"},{key:"token",label:"Tokens",icon:"palette"}];function _f(){try{let e=sessionStorage.getItem(_p);if(e)return new Set(JSON.parse(e))}catch{}return new Set(Cf)}function Tp(){try{sessionStorage.setItem(_p,JSON.stringify([...rn]))}catch{}}var rn=_f();function Ip(){try{return JSON.parse(sessionStorage.getItem(Cp))||{}}catch{return{}}}function pl(e,t){let s=Ip();s[e]=t;try{sessionStorage.setItem(Cp,JSON.stringify(s))}catch{}}function ul(e){let t=Ip();return t[e]?` style="width: ${t[e]}px;"`:""}function Mp(e){let t=new Map,s=e.edges||[];for(let i of e.nodes||[])t.set(i.id,i);let n=new Map,o=new Map;for(let i of s)n.has(i.source)||n.set(i.source,[]),n.get(i.source).push(i),o.has(i.target)||o.set(i.target,[]),o.get(i.target).push(i);return{nodes:t,edges:s,summary:e.summary||{},warnings:e.warnings||[],builtAt:e.built_at||null,buildTimeMs:e.build_time_ms||0,edgesBySource:n,edgesByTarget:o}}function ln(){var o,i,a,r,l,p,c;if(!ce)return[];let e=[];for(let[,d]of ce.nodes)d.type==="page"&&e.push(d);let t=new Map;for(let d of e)t.set(d.id,{id:d.id,label:d.label||d.id.replace("page:",""),slug:((o=d.meta)==null?void 0:o.slug)||"",level:((i=d.meta)==null?void 0:i.level)||1,childCount:((a=d.meta)==null?void 0:a.childCount)||0,parentPageId:((r=d.meta)==null?void 0:r.parentPageId)||null,hierarchySource:((l=d.meta)==null?void 0:l.hierarchySource)||null,isHomepage:((p=d.meta)==null?void 0:p.isHomepage)||!1,navOrder:((c=d.meta)==null?void 0:c.navOrder)||0,children:[]});let s=[];for(let[,d]of t)d.parentPageId&&t.has(d.parentPageId)?t.get(d.parentPageId).children.push(d):s.push(d);let n=(d,u)=>d.isHomepage!==u.isHomepage?d.isHomepage?-1:1:d.navOrder!==u.navOrder?d.navOrder-u.navOrder:d.label.localeCompare(u.label);s.sort(n);for(let[,d]of t)d.children.length>0&&d.children.sort(n);return s}function Mn(e){let s=(ce.edgesByTarget.get(e)||[]).find(n=>n.type==="serves");return s?s.source:null}function Ot(e){let t=ce.nodes.get(e);return t?t.label||t.id:e}function Gt(e){let t=ce.nodes.get(e);return t?t.type:"unknown"}function _a(){return ue?rp:null}function Ap(e){return`
    <div class="vs-sc-left-inner">
      <div class="vs-sc-filter">
        <input type="text" id="vs-sc-search" class="vs-input vs-input-sm"
               placeholder="Filter\u2026" autocomplete="off" value="${y(Zs)}" />
      </div>
      <div class="vs-sc-left-scroll" id="vs-sc-left-scroll">
        ${Lf(e)}
        ${Tf()}
      </div>
    </div>
  `}function Lf(e){let t=rn.has("page-tree"),s=0;if(ce)for(let[,n]of ce.nodes)n.type==="page"&&s++;return`
    <div class="vs-sc-nav-section ${t?"is-collapsed":""}">
      <button class="vs-sc-nav-section-header" data-nav-section="page-tree">
        <span class="vs-sc-nav-section-chevron">${L.chevronDown}</span>
        <span class="vs-sc-nav-section-label">Pages</span>
        <span class="vs-sc-nav-section-count">${s}</span>
      </button>
      <div class="vs-sc-nav-section-body">
        ${Bp(e,0)}
      </div>
    </div>
  `}function Bp(e,t){if(!e||e.length===0)return"";let s=Zs.toLowerCase(),n="",o=2;for(let i of e){if(s&&!so(i,s))continue;let a=_a()===i.id,r=Lt.has(i.id),l=i.children.length>0,p=Math.min(t,o),c=t>o,d=p*20;n+=`
      <div class="vs-site-tree-group ${l&&r?"is-collapsed":""}"
           data-tree-group="${y(i.id)}">
        <div class="vs-site-tree-item ${a?"is-selected":""}"
             style="padding-left: ${12+d}px"
             data-page-id="${y(i.id)}">
          ${l?`
            <button class="vs-site-tree-toggle"
                    data-toggle-page="${y(i.id)}"
                    aria-label="${r?"Expand":"Collapse"} ${y(i.label)}"
                    aria-expanded="${!r}">
              ${L.chevronDown}
            </button>
          `:'<span class="vs-site-tree-toggle-spacer"></span>'}
          <button type="button" class="vs-site-tree-select"
                  data-select-page="${y(i.id)}"
                  aria-label="Inspect ${y(i.label)}"
                  aria-pressed="${ue===i.id}">
            ${i.isHomepage?'<span class="vs-site-tree-star">\u2605</span>':""}
            <span class="vs-site-tree-label">${y(i.label)}</span>
            ${i.hierarchySource==="inferred"?'<span class="vs-site-tree-inferred" title="Inferred from URL structure \u2014 not explicitly authored">\u2071</span>':""}
            ${c?'<span class="vs-site-tree-overdepth" title="Deeper than 3 levels, shown at Level 3">\u207A</span>':""}
            ${l?`<span class="vs-site-tree-badge">${i.childCount}</span>`:""}
          </button>
        </div>
        ${l?`
          <div class="vs-site-tree-children">
            ${Bp(i.children,t+1)}
          </div>
        `:""}
      </div>
    `}return n}function Tf(){if(!ce)return"";let e=Zs.toLowerCase(),t=new Map,s=Lp.filter(o=>o.key!=="page");for(let o of s)t.set(o.key,[]);for(let[,o]of ce.nodes){let i=t.get(o.type);i&&i.push(o)}let n="";for(let o of s){let i=t.get(o.key)||[],a=e?i.filter(p=>{let c=(p.label||"").toLowerCase(),d=p.id.toLowerCase();return c.includes(e)||d.includes(e)}):i;a.sort((p,c)=>(p.label||p.id).localeCompare(c.label||c.id));let r=rn.has(o.key),l=e?`${a.length}/${i.length}`:`${i.length}`;n+=`
      <div class="vs-sc-nav-section ${r?"is-collapsed":""}">
        <button class="vs-sc-nav-section-header" data-nav-section="${o.key}">
          <span class="vs-sc-nav-section-chevron">${L.chevronDown}</span>
          <span class="vs-sc-nav-section-label">${o.label}</span>
          <span class="vs-sc-nav-section-count">${l}</span>
        </button>
        <div class="vs-sc-nav-section-body">
          ${a.length===0?'<div class="vs-sc-nav-item-empty">No matches</div>':a.map(p=>Mf(p,o)).join("")}
        </div>
      </div>
    `}return n}function If(e){let t=(e.split(".").pop()||"").toLowerCase();return{css:"paintbrush",scss:"paintbrush",less:"paintbrush",js:"fileCode",ts:"fileCode",mjs:"fileCode",json:"fileJson",jpg:"image",jpeg:"image",png:"image",gif:"image",webp:"image",avif:"image",ico:"image",svg:"penTool",mp4:"film",webm:"film",mov:"film",mp3:"music",wav:"music",ogg:"music",woff:"type",woff2:"type",ttf:"type",otf:"type",eot:"type",pdf:"filePdf"}[t]||"image"}function Mf(e,t){var p,c,d;let s=ue===e.id,n=y(e.label||e.id),o=((p=e.meta)==null?void 0:p.isShared)===!0,i=((c=e.meta)==null?void 0:c.isHomepage)===!0,a="";i&&(a+='<span class="vs-impact-badge vs-impact-badge-star">\u2605</span>'),o&&(a+='<span class="vs-impact-badge vs-impact-badge-shared">shared</span>');let r="";if(t.key==="token"&&((d=e.meta)!=null&&d.value)){let u=e.meta.value;/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(u)&&(r=`<span class="vs-impact-swatch" style="background:${y(u)}"></span>`)}let l=t.icon;return t.key==="asset"?l=If(e.id):t.key==="partial"&&(l="puzzle"),`
    <button type="button" class="vs-impact-item ${s?"is-selected":""}" data-node-id="${y(e.id)}"
            aria-label="Inspect ${y(e.type)} ${n}" aria-pressed="${s}">
      <span class="vs-impact-item-icon">${L[l]||L[t.icon]||""}</span>
      <span class="vs-impact-item-label">${n}</span>
      ${r}
      ${a}
    </button>
  `}function so(e,t){return e.label.toLowerCase().includes(t)||e.slug.toLowerCase().includes(t)?!0:e.children.some(s=>so(s,t))}function Pp(e){var i,a;if(!ue||ue!==e)return"";let t=(i=ce)==null?void 0:i.nodes.get(e),s=((a=t==null?void 0:t.meta)==null?void 0:a.isHomepage)||!1,n=s?'<button class="vs-sc-action-drop-item vs-sc-action-danger is-disabled" disabled title="The homepage cannot be deleted">Delete</button>':'<button class="vs-sc-action-drop-item vs-sc-action-danger" data-action="delete">Delete</button>',o=s?'<button class="vs-sc-action-drop-item is-disabled" disabled title="The homepage cannot be moved">Move</button>':'<button class="vs-sc-action-drop-item" data-action="reorder">Move</button>';return`
    <div class="vs-sc-action-bar" data-for-node="${y(e)}">
      <button class="vs-sc-action vs-sc-action-primary" data-action="rename" title="Rename this page"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg> Rename</button>
      <div class="vs-sc-action-overflow">
        <button class="vs-sc-action" data-action="overflow" title="More actions">\u22EF More</button>
        <div class="vs-sc-action-dropdown">
          <button class="vs-sc-action-drop-item" data-action="open-in-editor">Open in Editor</button>
          <button class="vs-sc-action-drop-item" data-action="open-in-chat">Open in Chat</button>
          <div class="vs-sc-action-drop-divider"></div>
          <button class="vs-sc-action-drop-item" data-action="change-url">Change URL</button>
          ${o}
          ${n}
        </div>
      </div>
    </div>
  `}function no(e){let t=document.getElementById("vs-site-diagram");if(!t||!e||e.length===0)return;let s=t.querySelector(".vs-sc-connectors");s&&s.remove();let n=[],o=E=>{for(let k of E)if(k.children.length>0&&!Lt.has(k.id)){for(let $ of k.children)n.push({parentId:k.id,childId:$.id});o(k.children)}},i=Zs.toLowerCase(),a=E=>{if(!i)return E;let k=[];for(let $ of E)if(so($,i)){let S=a($.children);k.push({...$,children:S})}return k},r=a(e),l=r.find(E=>E.isHomepage),p=r.filter(E=>!E.isHomepage);if(l)for(let E of p)n.push({parentId:l.id,childId:E.id});if(o(r),n.length===0)return;let c=t.getBoundingClientRect(),d=t.scrollLeft,u=t.scrollTop,v=[];for(let{parentId:E,childId:k}of n){let $=t.querySelector(`.vs-site-card[data-page-id="${CSS.escape(E)}"]`),S=t.querySelector(`.vs-site-card[data-page-id="${CSS.escape(k)}"]`);if(!$||!S)continue;let _=$.getBoundingClientRect(),q=S.getBoundingClientRect(),K=_.left-c.left+d+_.width/2,O=_.top-c.top+u+_.height,W=q.left-c.left+d+q.width/2,G=q.top-c.top+u,J=O+(G-O)/2,T=`M ${K} ${O} V ${J} H ${W} V ${G}`,C=ue&&(E===ue||k===ue);v.push({d:T,isActive:C})}if(v.length===0)return;let f=t.scrollWidth,b=t.scrollHeight,h=document.createElementNS("http://www.w3.org/2000/svg","svg");h.setAttribute("class","vs-sc-connectors"),h.setAttribute("width",f),h.setAttribute("height",b),h.setAttribute("viewBox",`0 0 ${f} ${b}`),h.setAttribute("aria-hidden","true");let g=document.createElementNS("http://www.w3.org/2000/svg","g");g.setAttribute("class","vs-sc-hierarchy-rails");let m=v.filter(E=>!E.isActive),x=v.filter(E=>E.isActive);for(let{d:E}of m){let k=document.createElementNS("http://www.w3.org/2000/svg","path");k.setAttribute("d",E),g.appendChild(k)}for(let{d:E}of x){let k=document.createElementNS("http://www.w3.org/2000/svg","path");k.setAttribute("d",E),k.classList.add("active"),g.appendChild(k)}h.appendChild(g);let w=document.createElementNS("http://www.w3.org/2000/svg","g");w.setAttribute("class","vs-sc-impact-overlays"),h.appendChild(w),t.appendChild(h)}function Rp(e){if(!e||e.length===0)return'<div class="vs-site-diagram-empty">No pages found</div>';let t=Zs.toLowerCase(),s=c=>{if(!t)return c;let d=[];for(let u of c)if(so(u,t)){let v=s(u.children);d.push({...u,children:v})}return d},n=c=>{let d=[];for(let u of c.children)d.push(u),u.children.length>0&&!Lt.has(u.id)&&d.push(...o(u));return d},o=c=>{let d=[];for(let u of c.children)d.push(u),u.children.length>0&&!Lt.has(u.id)&&d.push(...o(u));return d},i=s(e),a=i.find(c=>c.isHomepage),r=i.filter(c=>!c.isHomepage),l=c=>{if(c.children.length===0||Lt.has(c.id))return"";let d=t?c.children.filter(v=>so(v,t)):c.children;if(d.length===0)return"";let u=`<div class="vs-site-tier-group" data-parent-id="${y(c.id)}">`;u+=`<div class="vs-site-tier-group-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>${y(c.label)}</div>`,u+='<div class="vs-site-tier-group-cards">';for(let v of d)if(u+=La(v),v.children.length>0&&!Lt.has(v.id)){let f=n(v),b=t?f.filter(h=>h.label.toLowerCase().includes(t)||h.slug.toLowerCase().includes(t)):f;if(b.length>0){u+='<div class="vs-site-tier-l3-inline">';for(let h of b)u+=La(h);u+="</div>"}}return u+="</div></div>",u},p='<div class="vs-site-tiers">';if(a&&(p+=`
      <div class="vs-site-tier vs-site-tier-home">
        ${La(a)}
      </div>
    `),r.length>0||a&&a.children.length>0&&!Lt.has(a.id)){if(p+='<div class="vs-site-tier vs-site-tier-l1">',a&&a.children.length>0&&!Lt.has(a.id)){let c=l(a);c&&(p+=`<div class="vs-site-tier-column">${c}</div>`)}for(let c of r)p+='<div class="vs-site-tier-column">',p+=La(c),p+=l(c),p+="</div>";p+="</div>"}return p+="</div>",p}function La(e){let t=_a()===e.id,s=e.hierarchySource==="inferred",n=Mn(e.id),o="";if(n){let a=ce.nodes.get(n);a&&(o=a.label||a.id.replace("route:",""))}else e.isHomepage?o="/ \xB7 Homepage":e.slug&&(o="/"+e.slug);return`
    <div class="${["vs-site-card",e.isHomepage?"is-homepage":"",t?"is-selected":"",s?"is-inferred":""].filter(Boolean).join(" ")}"
         data-page-id="${y(e.id)}"
         title="${y(o||e.label)}">
      <button type="button" class="vs-site-card-body"
              data-select-page="${y(e.id)}"
              aria-label="Inspect ${y(e.label)}${o?", "+y(o):""}"
              aria-pressed="${ue===e.id}">
        <span class="vs-site-card-title">
          ${e.isHomepage?'<span class="vs-site-card-star">\u2605</span>':""}
          <span class="vs-site-card-label">${y(e.label)}</span>
        </span>
        ${o?`<span class="vs-site-card-route">${y(o)}</span>`:""}
      </button>
      ${e.childCount>0?`<span class="vs-site-card-count">${e.childCount}</span>`:""}
      ${Pp(e.id)}
    </div>
  `}var Se="idle";function Ye(e){Se=e,Ia()}function Bn(){return["running","applying","recovering"].includes(Se)}var An="";function Ta(e){An=e,Ia()}var dn=[];function Os(e){dn.push(e)}function ml(){dn=[]}var Re=null;function Kt(e){Re=e,Ia()}var Ve=null;function vt(e){Ve=e,Ia()}var vl="vs-sc-reviewed-plan";function Ia(){try{if(!(Re!=null&&Re.plan_id)){sessionStorage.removeItem(vl);return}sessionStorage.setItem(vl,JSON.stringify({state:Se,plan:Re,result:Ve,prompt:An}))}catch{}}var Dp;try{let e=JSON.parse(sessionStorage.getItem(vl)||"null");(Dp=e==null?void 0:e.plan)!=null&&Dp.plan_id&&(Re=e.plan,Ve=e.result||null,An=e.prompt||"",Se=["applying","recovering"].includes(e.state)?"recovering":e.state)}catch{}var qp="vs-sc-console-height",Np="vs-sc-console-collapsed";function Af(){try{let e=sessionStorage.getItem(qp);return e?parseInt(e,10):null}catch{return null}}function Op(e){try{sessionStorage.setItem(qp,String(e))}catch{}}function fl(){try{return sessionStorage.getItem(Np)==="1"}catch{return!1}}function Hp(e){try{sessionStorage.setItem(Np,e?"1":"0")}catch{}}function jp(){let e=fl(),t=Af();return`
    <div class="vs-sc-console ${e?"is-collapsed":""}"
         id="vs-sc-console"
         style="height: ${e?36:t||220}px;">
      <div class="vs-sc-console-resize" id="vs-sc-console-resize">
        <div class="vs-sc-console-resize-grip"></div>
      </div>
      <div class="vs-sc-console-header" id="vs-sc-console-header">
        <button class="vs-sc-console-toggle" id="vs-sc-console-toggle"
                title="${e?"Expand console":"Collapse console"}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="${e?"6 9 12 15 18 9":"18 15 12 9 6 15"}"/>
          </svg>
        </button>
        <span class="vs-sc-console-title">Orchestration</span>
        ${Se!=="idle"?`
          <span class="vs-sc-console-status is-${Se}">
            ${Rf(Se)}
          </span>
        `:""}
        ${dn.length>0?`
          <button class="vs-sc-console-clear" id="vs-sc-console-clear" title="Clear log" ${Bn()?"disabled":""}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        `:""}
      </div>
      ${e?"":`
        <div class="vs-sc-console-body">
          <div class="vs-sc-console-log" id="vs-sc-console-log">
            ${Bf()}
          </div>
          <div class="vs-sc-console-composer" id="vs-sc-console-composer">
            ${Pf()}
          </div>
        </div>
      `}
    </div>
  `}function Bf(){return dn.length===0?`
      <div class="vs-sc-console-empty">
        <span class="vs-sc-console-empty-text">
          Describe a change. Review the affected files and edits before applying them to preview.
        </span>
      </div>
    `:dn.map(e=>{if(e.phase){let n=Nf(e.phase),o=Of(e.status),i=e.file?`<span class="vs-sc-log-file">${y(e.file)}</span> `:"",a=e.ms!=null?`<span class="vs-sc-log-meta">${e.ms}ms</span>`:e.bytes!=null?`<span class="vs-sc-log-meta">${e.bytes}b</span>`:"";return`
        <div class="vs-sc-log-entry vs-sc-log-phase ${o}">
          <span class="vs-sc-log-icon">${n}</span>
          <span class="vs-sc-log-phase-name">${e.phase}</span>
          ${i}<span class="vs-sc-log-text">${y(e.message||"")}</span>
          ${a}
        </div>
      `}let t=qf(e.type),s=Df(e.type);return`
      <div class="vs-sc-log-entry ${t}">
        <span class="vs-sc-log-icon">${s}</span>
        <span class="vs-sc-log-text">${y(e.message)}</span>
      </div>
    `}).join("")}function Pf(){let e=Bn();return`
    <div class="vs-sc-composer-wrap">
      <textarea
        id="vs-sc-composer-input"
        class="vs-sc-composer-input"
        placeholder="${y(e?"Orchestrating\u2026":"Describe a change across your site\u2026")}"
        autocomplete="off"
        spellcheck="false"
        rows="1"
        ${e?"disabled":""}
      >${y(An)}</textarea>
      <div class="vs-sc-composer-actions">
        <span class="vs-sc-composer-hint">
          ${e?"":"<kbd>Enter</kbd> to run \xB7 <kbd>Shift+Enter</kbd> for newline"}
        </span>
        <button
          id="vs-sc-composer-submit"
          class="vs-sc-composer-submit"
          title="Run"
          ${e||!An.trim()?"disabled":""}
        >
          ${e?'<span class="vs-sc-command-spinner"></span>':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'}
        </button>
      </div>
    </div>
  `}function Rf(e){switch(e){case"running":return"Analyzing\u2026";case"plan":return"Plan Ready";case"plan_failed":return"Plan Failed";case"applying":return"Applying\u2026";case"recovering":return"Checking result\u2026";case"applied":return"Applied";case"apply_failed":return"Apply Failed";case"complete":return"Done";default:return""}}function Df(e){switch(e){case"running":return"\u25CF";case"done":return"\u2713";case"error":return"\u2717";case"skipped":return"\u2298";case"info":return"\u2192";case"plan":return"\u25C6";default:return"\xB7"}}function qf(e){switch(e){case"running":return"is-running";case"done":return"is-done";case"error":return"is-error";case"skipped":return"is-skipped";case"plan":return"is-plan";default:return""}}function Nf(e){return{start:"\u25B6",snapshot:"\u25CE",read:"\u2193",anchor:"\u2693",patch:"\u270E",lint:"\u2318",verify:"\u2714",reject:"\u2298",rollback:"\u21BA",done:"\u2713",failed:"\u2717",abort:"\u2298"}[e]||"\xB7"}function Of(e){return{ok:"is-ok",failed:"is-failed",error:"is-failed",skip:"is-skip",refused:"is-refused",start:"is-info",partial:"is-warning"}[e]||""}function zp(){if(Se!=="idle")return`
      <div class="vs-sc-right-inner">
        <div class="vs-sc-right-header">
          <span class="vs-sc-right-title">Review</span>
          <span class="vs-sc-right-mode-badge is-${Se}">
            ${Se==="running"?"Analyzing":Se==="plan"?"Plan Ready":Se==="plan_failed"?"Plan Failed":Se==="applying"?"Applying":Se==="recovering"?"Checking result":Se==="applied"?"Applied":Se==="apply_failed"?"Apply Failed":Se==="complete"?"Complete":Se}
          </span>
        </div>
        <div class="vs-sc-right-body" id="vs-sc-right-body">
          ${Fp()}
          ${Hf()}
        </div>
      </div>
    `;let t=ue&&ce&&ce.nodes.get(ue),s=t?ce.nodes.get(ue):null;return`
    <div class="vs-sc-right-inner ${t?"":"vs-sc-idle"}">
      <div class="vs-sc-right-header">
        ${t?`
          <span class="vs-sc-right-title">${y(s.label||ue)}</span>
          <button class="vs-impact-close-btn" data-action="close-inspect" title="Close" aria-label="Close inspect panel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        `:`
          <span class="vs-sc-right-title vs-sc-right-title-idle">Site Control</span>
        `}
      </div>
      <div class="vs-sc-right-body" id="vs-sc-right-body">
        ${Fp()}
        ${t?gl():jf()}
      </div>
    </div>
  `}function Fp(){var t;let e=((t=ce)==null?void 0:t.warnings)||[];return e.length?`<div class="vs-sc-review-section">
    <h4 class="vs-sc-review-heading">References need review</h4>
    <p class="vs-sc-review-plan-summary">Counts cover indexed references. Dynamic PHP links and includes, or relative links in shared partials, may require manual review.</p>
    ${e.slice(0,10).map(s=>`<p class="vs-sc-review-plan-summary">${y(s.file||"")}${s.line?":"+y(String(s.line)):""}: ${y(s.message||s.reason||"Reference could not be resolved.")}</p>`).join("")}
    ${e.length>10?`<p class="vs-sc-review-plan-summary">${e.length-10} more items require review.</p>`:""}
  </div>`:""}function Hf(){var e,t,s,n,o,i,a,r,l,p,c,d,u,v,f,b,h,g,m,x,w;if(Se==="plan"&&Re){let E=Re.files||[],k=Re.affected_pages||[],$=Re.skipped||[],S=Re.intent||null,_=Re.edits||[],q=Re.risk_level||"medium",K=Re.plan_summary||"",O=_.filter(T=>T.anchored!==!1),W=_.filter(T=>T.anchored===!1),G=O.length>0,J=G&&_.every(T=>T.anchored===!0)&&!!Re.plan_id;return`
      <div class="vs-sc-orch-review">
        ${S?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Intent</h4>
            <div class="vs-sc-review-intent">
              <span class="vs-impact-type-badge vs-impact-type-${S.category||"content"}">${y(S.category||"content")}</span>
              <span class="vs-sc-review-scope">${y(S.scope||"site-wide")}</span>
            </div>
            <p class="vs-sc-review-summary">${y(S.summary||"")}</p>
            ${S.keywords&&S.keywords.length>0?`
              <div class="vs-sc-review-keywords">
                ${S.keywords.map(T=>`<span class="vs-sc-review-keyword">${y(T)}</span>`).join("")}
              </div>
            `:""}
          </div>
        `:""}
        ${G?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">
              Edit Plan
              <span class="vs-sc-review-count">${O.length}</span>
              <span class="vs-sc-review-risk is-${q}">${q}</span>
            </h4>
            ${K?`<p class="vs-sc-review-plan-summary">${y(K)}</p>`:""}
            ${O.map((T,C)=>`
              <div class="vs-sc-review-edit">
                <div class="vs-sc-review-edit-header">
                  <span class="vs-sc-review-edit-num">${C+1}</span>
                  <span class="vs-sc-review-edit-strategy">${y(T.strategy||"edit")}</span>
                  <button type="button" class="vs-sc-review-file-path" data-orch-open-file="${y(T.file||"")}" title="Open in Editor">${y(T.file||"")}</button>
                </div>
                <p class="vs-sc-review-edit-desc">${y(T.description||"")}</p>
                ${T.before_snippet||T.after_snippet?`
                  <div class="vs-sc-review-diff">
                    ${T.before_snippet?`<div class="vs-sc-review-diff-before"><span class="vs-sc-diff-label">\u2212</span><code>${y(T.before_snippet)}</code></div>`:""}
                    ${T.after_snippet?`<div class="vs-sc-review-diff-after"><span class="vs-sc-diff-label">+</span><code>${y(T.after_snippet)}</code></div>`:""}
                  </div>
                `:""}
                ${T.verification?`<p class="vs-sc-review-edit-verify">Check after apply: ${y(T.verification)}</p>`:""}
              </div>
            `).join("")}
          </div>
        `:`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Candidate Files <span class="vs-sc-review-count">${E.length}</span></h4>
            ${E.length===0?'<p class="vs-sc-review-empty">No files affected</p>':E.map(T=>`
                <div class="vs-sc-review-file">
                  <div class="vs-sc-review-file-header">
                    <span class="vs-impact-type-badge vs-impact-type-${T.type||"page"}">${y(T.type||"file")}</span>
                    <span class="vs-sc-review-file-path">${y(T.path)}</span>
                  </div>
                  ${T.reason?`<span class="vs-sc-review-file-reason">${y(T.reason)}</span>`:""}
                </div>
              `).join("")}
          </div>
        `}
        ${W.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Unverified Edits <span class="vs-sc-review-count">${W.length}</span></h4>
            <p class="vs-sc-review-plan-summary">The whole plan is blocked until every edit can be verified. Describe the change again to build a new plan.</p>
            ${W.map(T=>`
              <div class="vs-sc-review-issue">
                <span class="vs-sc-review-file-path">${y(T.file||"")}</span>
                <span class="vs-sc-review-skip-reason">${y(T.anchor_issue||"Not anchored to source")}</span>
              </div>
            `).join("")}
          </div>
        `:""}
        ${k.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Affected Pages <span class="vs-sc-review-count">${k.length}</span></h4>
            <div class="vs-sc-review-pages">
              ${k.map(T=>`
                <div class="vs-sc-review-page">
                  <span class="vs-sc-review-page-label">${y(T.label)}</span>
                  ${T.slug?`<span class="vs-sc-review-page-slug">${y(T.slug)}</span>`:""}
                </div>
              `).join("")}
            </div>
          </div>
        `:""}
        ${$.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Skipped</h4>
            ${$.map(T=>`
              <div class="vs-sc-review-skip">
                <span class="vs-sc-review-file-path">${y(T.path)}</span>
                <span class="vs-sc-review-skip-reason">${y(T.reason)}</span>
              </div>
            `).join("")}
          </div>
        `:""}
        <div class="vs-sc-review-actions">
          <p class="vs-sc-review-plan-summary">Apply updates preview files. Publish is a separate step. Shared assets, including styles, can also affect the published site.</p>
          ${J?'<button class="vs-sc-review-approve" id="vs-sc-orch-apply">Approve &amp; Apply</button>':""}
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>
        </div>
      </div>
    `}if(Se==="plan_failed"){let E=((e=Re)==null?void 0:e.files)||[],k=((t=Re)==null?void 0:t.affected_pages)||[],$=((s=Re)==null?void 0:s.edits)||[],S=((n=Ve)==null?void 0:n.summary)||((o=Re)==null?void 0:o.plan_summary)||"",_=$.filter(q=>!q.anchored);return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Plan Not Ready</h4>
          <p class="vs-sc-review-plan-summary">${y(S||"The edit plan could not be verified against the source files.")}</p>
          ${_.length>0?`
            <div class="vs-sc-review-issues">
              ${_.map(q=>`
                <div class="vs-sc-review-issue">
                  <span class="vs-sc-review-file-path">${y(q.file||"")}</span>
                  <span class="vs-sc-review-skip-reason">${y(q.anchor_issue||"before_snippet not found in source")}</span>
                </div>
              `).join("")}
            </div>
          `:""}
        </div>
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Discovered Files <span class="vs-sc-review-count">${E.length}</span></h4>
          ${E.map(q=>`
            <div class="vs-sc-review-file">
              <div class="vs-sc-review-file-header">
                <span class="vs-impact-type-badge vs-impact-type-${q.type||"page"}">${y(q.type||"file")}</span>
                <span class="vs-sc-review-file-path">${y(q.path)}</span>
              </div>
            </div>
          `).join("")}
        </div>
        ${k.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Affected Pages <span class="vs-sc-review-count">${k.length}</span></h4>
            <div class="vs-sc-review-pages">
              ${k.map(q=>`
                <div class="vs-sc-review-page">
                  <span class="vs-sc-review-page-label">${y(q.label)}</span>
                  ${q.slug?`<span class="vs-sc-review-page-slug">${y(q.slug)}</span>`:""}
                </div>
              `).join("")}
            </div>
          </div>
        `:""}
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>
        </div>
      </div>
    `}if(Se==="applying"||Se==="recovering")return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-waiting">
          <div class="vs-sc-command-spinner"></div>
          <p class="vs-sc-review-waiting-text">${Se==="recovering"?"Checking the server result\u2026":"Applying edits\u2026"}</p>
          <p class="vs-sc-review-waiting-hint">${Se==="recovering"?"The request may still be running. This check does not apply the plan again.":"Each file is read, anchored, patched, and verified."}</p>
        </div>
      </div>
    `;if(Se==="applied"){let E=(i=Ve)==null?void 0:i.filesChanged,k=((a=Ve)==null?void 0:a.verification)||[],$=(r=Ve)==null?void 0:r.duration_ms,S=k.length>0,_=0,q=0;k.forEach(O=>{O.checks.forEach(W=>{_++,W.passed&&q++})});let K=k.map(O=>{let W=O.checks.map(G=>{let J=G.passed?"\u2714":"\u2717";return`<div class="vs-sc-verify-check ${G.passed?"is-passed":"is-failed"}">
          <span class="vs-sc-verify-icon">${J}</span>
          <span class="vs-sc-verify-name">${y(G.check)}</span>
          <span class="vs-sc-verify-detail">${y(G.detail)}</span>
        </div>`}).join("");return`<div class="vs-sc-verify-file">
        <div class="vs-sc-verify-file-name">${y(O.file)}</div>
        ${W}
      </div>`}).join("");return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">${S?"Verification Report":"Site Result"}</h4>
          <p class="vs-sc-review-plan-summary">Preview updated. Publish pages separately. Shared assets may already affect the published site.</p>
          ${(l=Ve)!=null&&l.summary?`<p class="vs-sc-review-plan-summary">${y(Ve.summary)}</p>`:""}
          <div class="vs-sc-verify-summary">
            ${Number.isFinite(E)?`<span class="vs-sc-verify-stat">${E} file(s) patched</span>`:""}
            ${S?`<span class="vs-sc-verify-stat">${q}/${_} checks passed</span>`:""}
            ${$?`<span class="vs-sc-verify-stat">${$}ms</span>`:""}
          </div>
          ${K}
        </div>
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Done</button>
        </div>
      </div>
    `}if(Se==="apply_failed"){let E=((p=Ve)==null?void 0:p.summary)||"Patch execution failed.",k=(c=Ve)==null?void 0:c.rollback_clean,$=((d=Ve)==null?void 0:d.recovery_resolved)===!0,S=k!==!0&&k!==!1,_=((u=Ve)==null?void 0:u.remaining_changed_files)||((v=Ve)==null?void 0:v.changed_files)||[],q=(f=Ve)==null?void 0:f.recovery_snapshot_id,K=((b=Ve)==null?void 0:b.verification)||[],O=(h=Ve)==null?void 0:h.duration_ms,W=$?`Recovery completed from snapshot #${y(String(Ve.recovery_resolved_by_snapshot))}. The original change was not retried.`:k===!0?"The attempted changes were restored and verified.":k===!1?"Some changes remain. Review the files below before continuing.":"The result is unconfirmed. Files may have changed. Check the server result before retrying or editing these files.",G=$||k===!0?"is-clean":"is-dirty",J=K.map(T=>{let C=T.checks.map(j=>{let B=j.passed?"\u2714":"\u2717";return`<div class="vs-sc-verify-check ${j.passed?"is-passed":"is-failed"}">
          <span class="vs-sc-verify-icon">${B}</span>
          <span class="vs-sc-verify-name">${y(j.check)}</span>
          <span class="vs-sc-verify-detail">${y(j.detail)}</span>
        </div>`}).join("");return`<div class="vs-sc-verify-file">
        <div class="vs-sc-verify-file-name">${y(T.file)}</div>
        ${C}
      </div>`}).join("");return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">${S?"Apply Result Unconfirmed":"Apply Failed"}</h4>
          <p class="vs-sc-review-plan-summary">${y(E)}</p>
          <div class="vs-sc-verify-rollback ${G}">
            <span class="vs-sc-verify-icon">${$||k===!0?"\u21BA":"\u26A0"}</span>
            ${W}
          </div>
          ${_.length?`<p class="vs-sc-review-plan-summary">${$?"Files reported by the failed attempt":"Files requiring review"}: ${_.map(T=>y(T)).join(", ")}</p>`:""}
          ${q&&!$?`<p class="vs-sc-review-plan-summary">Snapshots are in Designs \u2192 History. Restore snapshot #${y(String(q))} if recovery is needed. Snapshot restore replaces preview files and shared assets.</p>`:""}
          ${O?`<p class="vs-sc-verify-timing">${O}ms elapsed</p>`:""}
          ${J}
        </div>
        <div class="vs-sc-review-actions">
          ${((g=Re)!=null&&g.plan_id||(m=Ve)!=null&&m.mutation_id)&&S?'<button class="vs-sc-review-approve" id="vs-sc-orch-check">Check result</button>':""}
          ${(x=Ve)!=null&&x.mutation_id&&S?"":'<button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>'}
        </div>
      </div>
    `}return Se==="running"?`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-waiting">
          <div class="vs-sc-command-spinner"></div>
          <p class="vs-sc-review-waiting-text">Discovering affected files\u2026</p>
          <p class="vs-sc-review-waiting-hint">The results will appear here once analysis is complete.</p>
        </div>
      </div>
    `:Se==="complete"?`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Results</h4>
          <p class="vs-sc-review-summary">${y(((w=Ve)==null?void 0:w.summary)||"No edits were proposed.")}</p>
        </div>
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Done</button>
        </div>
      </div>
    `:'<div class="vs-sc-orch-review"><p class="vs-sc-review-empty">No active orchestration.</p></div>'}function jf(){return ce?`
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${L.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `:oo()}function oo(){return`
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${L.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `}function gl(){var r,l;if(an)return eg();if(on)return Qf();if(Ln)return Yf();if(ss)return zf();let e=(r=ce)==null?void 0:r.nodes.get(ue);if(!e)return oo();let t="";if(e.type==="page"){let p=Mn(e.id);if(p){let c=ce.nodes.get(p);t=c?c.label||p:""}}else e.type==="route"?t=e.label||e.id:t=e.id;let s="";(l=e.meta)!=null&&l.isShared&&(s+='<span class="vs-impact-header-badge vs-impact-header-shared">Shared</span>');let n=ut.get(e.id);n!=null&&n.is_global&&(s+='<span class="vs-impact-header-badge vs-impact-header-global">Global</span>');let o=[];Gf(e,o),Kf(e.id,o);let i=o.filter(p=>!p.collapsed).map(p=>p.html),a=o.filter(p=>p.collapsed).map(p=>p.html);return`
    <div class="vs-impact-detail-content">
      <div class="vs-impact-detail-header">
        ${t?`<p class="vs-impact-detail-subtitle">${y(t)}</p>`:""}
        ${s?`<div class="vs-impact-detail-badges">${s}</div>`:""}
      </div>
      ${i.join("")}
      ${a.join("")}
    </div>
  `}function Up(e,t){var i;if(cn())return;let s=(i=ce)==null?void 0:i.nodes.get(e);if(!s)return;hs(),os(),as(),Se!=="idle"&&(Ye("idle"),vt(null),Kt(null));let n=e;if(s.type==="page"&&(n=Mn(e),!n)||s.type!=="page"&&s.type!=="route")return;en(n),tn(e),qs(""),ya(!0),Pe("idle"),wt(null),Wt(null);let o=ce.edgesByTarget.get(n)||[];for(let a of o)if(a.type==="links_to"){let r=ce.nodes.get(a.source);(r==null?void 0:r.type)==="partial"&&!ut.has(a.source)&&Ff(a.source,t)}}function Hs(){cn()||(en(null),tn(null),qs(""),Pe("idle"),wt(null),Wt(null))}function Vp(e){var s;if(cn())return;let t=(s=ce)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(hs(),Hs(),as(),Se!=="idle"&&(Ye("idle"),vt(null),Kt(null)),os(),cp(!0),Ea(!0),Pe("idle"),wt(null),Wt(null))}function di(){cn()||(os(),Pe("idle"),wt(null),Wt(null))}function Wp(e){var s;if(cn())return;let t=(s=ce)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(Hs(),os(),as(),Se!=="idle"&&(Ye("idle"),vt(null),Kt(null)),hs(),bp(!0),yp(t.label||""))}function io(){cn()||hs()}function Gp(e){var s,n;if(cn())return;let t=(s=ce)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(n=t.meta)!=null&&n.isHomepage||(Hs(),os(),hs(),Se!=="idle"&&(Ye("idle"),vt(null),Kt(null)),as(),wp(!0))}function Ma(){cn()||as()}function cn(){return Bn()||Ke==="applying"||Ns==="applying"||kt==="applying"}function Aa(e){if(!e||typeof e!="object")return"";let t=e.recovery_resolved?`Recovery completed from snapshot #${y(String(e.recovery_resolved_by_snapshot))}. The original change was not retried.`:e.restored===!0?"The attempted changes were restored and verified.":e.restored===!1?"Restoration is incomplete. Review your files before continuing.":e.code==="network_error"?"The result is unconfirmed. Reload Site and inspect your files before retrying.":"",s=e.snapshotId&&!e.recovery_resolved?` Snapshots are in Designs \u2192 History. Recovery snapshot: #${y(String(e.snapshotId))}. Snapshot restore replaces preview files and shared assets.`:"";return t||s?`<p class="vs-sc-form-result-detail">${t}${s}</p>`:""}async function Ff(e,t){if(ut.has(e))return;let{ok:s,data:n}=await Y.get("/site-graph/blast-radius?node="+encodeURIComponent(e));s&&n&&!ut.has(e)&&(ut.set(e,n),t&&t())}function zf(){var d;let e=(d=ce)==null?void 0:d.nodes.get(ss);if(!e)return Hs(),ue?gl():oo();let t=e.label||e.id,s=t==="/"||e.id==="route:/";if(Ke==="success"&&at)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${L.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">URL updated</p>
            <p class="vs-sc-form-result-detail">${y(at.oldPath)} \u2192 ${y(at.newPath)}</p>
            ${at.referenceCount>0?`<p class="vs-sc-form-result-detail">${at.referenceCount} reference${at.referenceCount!==1?"s":""} updated across ${(at.updatedFiles||[]).length} file${(at.updatedFiles||[]).length!==1?"s":""}</p>`:""}
            ${at.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `;if(Ke==="error"&&nn)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${L.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${y(nn.message||"Unknown error")}</p>
            ${Aa(nn)}
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-proposal">Dismiss</button>
        </div>
      </div>
    `;if(Ke==="applying")return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Applying\u2026</span>
        </div>
      </div>
    `;let n=hl(sn,t),i=(ce.edgesByTarget.get(ss)||[]).filter(u=>u.type==="links_to"),a=new Set(i.map(u=>u.source)),r="";s?r=`
      <div class="vs-sc-form-actions">
        <div class="vs-sc-form-hint">Homepage URL cannot be renamed.</div>
      </div>
    `:Ke==="armed"?r=`
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
    `;let l=Ke==="armed"?"disabled":"",p="";n.message&&(p=`<div class="vs-sc-form-hint ${n.valid?"is-valid":"is-error"}">${y(n.message)}</div>`);let c="";if(!s&&i.length>0){let u=i.length,v=a.size;c=`
      <div class="vs-sc-delete-section">
        <div class="vs-sc-delete-section-header">
          <span class="vs-sc-form-label" title="Links to this URL in other files will be automatically updated">References updated</span>
          <span class="vs-sc-delete-section-count">${u} across ${v} file${v!==1?"s":""}</span>
        </div>
        ${Uf(i,n)}
      </div>
    `}else!s&&i.length===0&&sn&&(c='<div class="vs-sc-form-hint">No references to update.</div>');return`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Change URL</h3>
      <p class="vs-sc-form-context">Current path: <strong>${y(t)}</strong></p>
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label" for="vs-proposal-url">New URL path</label>
        <input
          type="text"
          id="vs-proposal-url"
          class="vs-sc-form-input"
          placeholder="${y(t)}"
          autocomplete="off"
          spellcheck="false"
          value="${y(sn)}"
          ${l}
        />
        ${p}
      </div>
      ${c}
      ${r}
    </div>
  `}function hl(e,t){if(!e||!e.trim())return{valid:!1,cleanPath:"",message:""};let s=e.trim();s.startsWith("/")&&(s=s.slice(1)),s.endsWith("/")&&(s=s.slice(0,-1)),s.endsWith(".php")&&(s=s.slice(0,-4));let n=s.split("/").map(p=>p.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,"")),o=n.join("/");if(!o||n.some(p=>!p))return{valid:!1,cleanPath:"/",message:"Path cannot be empty after normalization"};let i="/"+o,r=s.toLowerCase()!==o?` (normalized from "${s}")`:"",l=t.replace(/\/$/,"")||"/";if(i.slice(0,i.lastIndexOf("/"))!==l.slice(0,l.lastIndexOf("/")))return{valid:!1,cleanPath:i,message:"Keep the current parent path. Use Move to change the parent, then Change URL to rename the page."};if(i===l)return{valid:!1,cleanPath:i,message:"New path is the same as the current path"};if(ce){for(let[,p]of ce.nodes)if(p.type==="route"&&p.id!==ss){let c=(p.label||p.id).replace(/\/$/,"")||"/";if(i===c)return{valid:!1,cleanPath:i,message:`Path conflicts with existing route: ${c}`}}}return{valid:!0,cleanPath:i,message:`\u2713 ${i}${r}`}}function Uf(e,t){let s=new Map;for(let o of e)s.has(o.source)||s.set(o.source,[]),s.get(o.source).push(o);let n='<div class="vs-proposal-groups">';for(let[o,i]of s)n+=Vf(o,i,t);return n+="</div>",n}function Vf(e,t,s){var l;let n=ce.nodes.get(e);if(!n)return"";let o=n.type.charAt(0).toUpperCase()+n.type.slice(1),i=t.length,a="";if(n.type==="partial"){let p=((l=n.meta)==null?void 0:l.includeCount)??0;a=`Used by ${p} file${p!==1?"s":""}`;let c=ut.get(e);c&&(a+=` \xB7 Affects ${c.affected_count} page${c.affected_count!==1?"s":""}`)}let r=[...t].sort((p,c)=>{var d,u;return(((d=p.meta)==null?void 0:d.lineNumber)||0)-(((u=c.meta)==null?void 0:u.lineNumber)||0)});return`<div class="vs-proposal-group">
    <div class="vs-proposal-group-header">
      <span class="vs-impact-type-badge vs-impact-type-${n.type}">${o}</span>
      <span class="vs-proposal-group-label" data-navigate-node="${y(e)}">${y(n.label||n.id)}</span>
      <span class="vs-proposal-group-count">${i} ref${i!==1?"s":""}</span>
    </div>
    ${a?`<div class="vs-proposal-group-meta">${a}</div>`:""}
    <div class="vs-proposal-group-refs">
      ${r.map(p=>Wf(p,s)).join("")}
    </div>
  </div>`}function Wf(e,t){var a,r,l;let s=(a=e.meta)!=null&&a.lineNumber?`L${e.meta.lineNumber}`:"",n=((r=e.meta)==null?void 0:r.href)||"",o=((l=e.meta)==null?void 0:l.context)||"body",i="";if(t.valid){let p=n.replace(/[?#].*/,""),c=p!=="/"&&p.endsWith("/"),d=n.match(/[?#].*/),u=d?d[0]:"",v=t.cleanPath;c&&!v.endsWith("/")&&(v+="/"),v+=u,i=`<span class="vs-proposal-ref-arrow">\u2192 ${y(v)}</span>`}return`<div class="vs-proposal-ref">
    <span class="vs-proposal-ref-line">${s}</span>
    <span class="vs-proposal-ref-href">${y(n)}</span>
    <span class="vs-proposal-ref-context">${o}</span>
    ${i}
  </div>`}function Gf(e,t){let s=ce.edgesBySource.get(e.id)||[],n=ce.edgesByTarget.get(e.id)||[],o=t.length;switch(e.type){case"page":{let i=s.filter(p=>p.type==="includes");i.length>0&&t.push(rs("Direct Includes",i.map(p=>({nodeId:p.target,label:Ot(p.target),type:Gt(p.target)}))));let a=[];for(let p of i){let c=ce.edgesBySource.get(p.target)||[];for(let d of c)d.type==="includes"&&a.push({nodeId:d.target,label:Ot(d.target),type:Gt(d.target),via:Ot(p.target)})}a.length>0&&t.push(rs("Transitive Includes",a));let r=s.filter(p=>p.type==="links_to");r.length>0&&t.push(rs("Links To",r.map(p=>{var c,d;return{nodeId:p.target,label:Ot(p.target),type:Gt(p.target),meta:(c=p.meta)!=null&&c.href?`\u2192 ${p.meta.href}`:null,context:((d=p.meta)==null?void 0:d.context)||null}})));let l=Mn(e.id);if(l){let c=(ce.edgesByTarget.get(l)||[]).filter(d=>d.type==="links_to");c.length>0&&t.push(rs("Linked From",c.map(d=>{var u,v,f;return{nodeId:d.source,label:Ot(d.source),type:Gt(d.source),sourcePath:d.source.replace(/^[^:]+:/,""),lineNumber:((u=d.meta)==null?void 0:u.lineNumber)||null,meta:(v=d.meta)!=null&&v.href?`\u2192 ${d.meta.href}`:null,context:((f=d.meta)==null?void 0:f.context)||null}})))}break}case"partial":{let i=n.filter(l=>l.type==="includes");i.length>0&&t.push(rs("Included By",i.map(l=>({nodeId:l.source,label:Ot(l.source),type:Gt(l.source)}))));let a=s.filter(l=>l.type==="includes");a.length>0&&t.push(rs("Includes",a.map(l=>({nodeId:l.target,label:Ot(l.target),type:Gt(l.target)}))));let r=s.filter(l=>l.type==="links_to");r.length>0&&t.push(rs("Links To",r.map(l=>{var p,c;return{nodeId:l.target,label:Ot(l.target),type:Gt(l.target),meta:(p=l.meta)!=null&&p.href?`\u2192 ${l.meta.href}`:null,context:((c=l.meta)==null?void 0:c.context)||null}})));break}case"route":{let i=s.filter(r=>r.type==="serves");i.length>0&&t.push(rs("Serves",i.map(r=>({nodeId:r.target,label:Ot(r.target),type:Gt(r.target)}))));let a=n.filter(r=>r.type==="links_to");a.length>0&&t.push(rs("Linked From",a.map(r=>{var l,p,c;return{nodeId:r.source,label:Ot(r.source),type:Gt(r.source),sourcePath:r.source.replace(/^[^:]+:/,""),lineNumber:((l=r.meta)==null?void 0:l.lineNumber)||null,meta:(p=r.meta)!=null&&p.href?`\u2192 ${r.meta.href}`:null,context:((c=r.meta)==null?void 0:c.context)||null}})));break}case"token":{let i=n.filter(a=>a.type==="consumes_token");i.length>0&&t.push(rs("Consumed By",i.map(a=>({nodeId:a.source,label:Ot(a.source),type:Gt(a.source)}))));break}case"asset":{let i=s.filter(a=>a.type==="consumes_token");i.length>0&&t.push(rs("Consumes Tokens",i.map(a=>({nodeId:a.target,label:Ot(a.target),type:Gt(a.target)}))));break}}t.length===o&&t.push({collapsed:!1,html:'<p class="vs-impact-no-relations">No relationships found.</p>'})}function rs(e,t){let s=e.toLowerCase().replace(/\s+/g,"-"),n=cl(s),i=`
    <div class="vs-impact-card${n?" is-collapsed":""}">
      <button class="vs-impact-card-header" data-card-toggle="${s}">
        <span class="vs-impact-card-chevron">${L.chevronDown}</span>
        <span class="vs-impact-card-title">${y(e)}</span>
        <span class="vs-impact-card-count">${t.length}</span>
      </button>
      <div class="vs-impact-card-list">
        ${t.map(a=>{let r=`vs-impact-ref-type-${a.type}`;return`
            <button class="vs-impact-ref-item" data-node-id="${y(a.nodeId)}">
              <span class="vs-impact-ref-type ${r}">${a.type}</span>
              <span class="vs-impact-ref-label">${y(a.label)}</span>
              ${a.sourcePath?`<span class="vs-impact-ref-source">${y(a.sourcePath)}${a.lineNumber?":"+y(String(a.lineNumber)):""}</span>`:""}
              ${a.via?`<span class="vs-impact-transitive-via">(via ${y(a.via)})</span>`:""}
              ${a.meta?`<span class="vs-impact-ref-meta">${y(a.meta)}</span>`:""}
            </button>
            ${a.context?`<div class="vs-impact-ref-context">${y(a.context)}</div>`:""}
          `}).join("")}
      </div>
    </div>
  `;return{collapsed:n,html:i}}function Kf(e,t){let s="blast-radius";if(ni===e){t.push({collapsed:!1,html:`
      <div class="vs-impact-card vs-impact-blast-card">
        <button class="vs-impact-card-header" data-card-toggle="${s}">
          <span class="vs-impact-card-chevron">${L.chevronDown}</span>
          <span class="vs-impact-card-title">Blast Radius</span>
        </button>
        <div class="vs-impact-blast-loading">
          <div class="vs-site-spinner" style="width:16px;height:16px"></div>
          <span>Computing\u2026</span>
        </div>
      </div>
    `});return}let n=ut.get(e);if(!n)return;let{affected_pages:o=[],affected_count:i=0,total_pages:a=0,is_global:r=!1}=n,l=cl(s),p=l?" is-collapsed":"";t.push({collapsed:l,html:`
    <div class="vs-impact-card vs-impact-blast-card${p}">
      <button class="vs-impact-card-header" data-card-toggle="${s}">
        <span class="vs-impact-card-chevron">${L.chevronDown}</span>
        <span class="vs-impact-card-title">Blast Radius</span>
        <span class="vs-impact-card-count">${i} / ${a}</span>
        ${r?'<span class="vs-impact-blast-global">GLOBAL</span>':""}
      </button>
      <div class="vs-impact-card-list">
        ${o.map(c=>`
          <button class="vs-impact-ref-item" data-node-id="${y(c.id)}">
            <span class="vs-impact-ref-type vs-impact-ref-type-page">page</span>
            <span class="vs-impact-ref-label">${y(c.label||c.id)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `})}function Yf(){var l;let e=(l=ce)==null?void 0:l.nodes.get(ue);if(!e)return di(),ue?gl():oo();let t=y(e.label||e.id);if(ka)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Loading navigation\u2026</span>
        </div>
      </div>
    `;if(Ke==="success"&&at){let p=!!at.movedPages,c=p?"Page moved":"Navigation updated",d="";if(p){let u=at.totalPagesMoved||1,v=at.totalAffectedReferences||0,f=[];f.push(`Moved ${u} page${u!==1?"s":""}`),v>0&&f.push(`updated ${v} reference${v!==1?"s":""}`),d=f.join(", ")}else d=y(at.message||"Page order has been changed.");return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${L.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">${c}</p>
            <p class="vs-sc-form-result-detail">${d}</p>
            ${at.normalized?'<p class="vs-sc-form-result-detail">Navigation was standardized</p>':""}
            ${at.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `}if(wa)return li(t,"The homepage is always first and cannot be reordered.");if(eo==="nav_missing")return li(t,"No navigation file found.");if(eo==="unsupported_layout")return li(t,"This navigation layout doesn't support reordering yet.");if(eo==="nav_parse_error")return li(t,"The navigation file has a problem and can't be read right now.");if(!xa)return li(t,"This page isn't in the navigation yet.");let s=Xf(e),n=Jf(e),o=ii?'<div class="vs-sc-form-hint">Navigation will be standardized first. Current links and order are preserved.</div>':"",i="";Ke==="error"&&nn&&(i=`
      <div class="vs-sc-form-result is-error">
        <div class="vs-sc-form-result-icon">${L.alertTriangle||"\u26A0"}</div>
        <div class="vs-sc-form-result-text">
          <p class="vs-sc-form-result-title">Move failed</p>
          <p class="vs-sc-form-result-detail">${y(nn.message||"Unknown error")}</p>
          ${Aa(nn)}
        </div>
      </div>
    `);let a=Zf(),r="";return Ke==="applying"?r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn is-loading" disabled>
          <span class="vs-sc-move-loading-spinner"></span>
          Applying\u2026
        </button>
      </div>
    `:Ke==="armed"?r=`
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
        <button class="vs-sc-form-btn" data-action="apply-move-arm">${ii?"Standardize & move":"Apply"}</button>
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
  `}function li(e,t){return`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Move</h3>
      <p class="vs-sc-form-context">${y(t)}</p>
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Dismiss</button>
      </div>
    </div>
  `}function Jf(e){var o,i;if(!Nt||Nt.length===0)return"";let t=(o=e.meta)!=null&&o.isHomepage?"/":"/"+(((i=e.meta)==null?void 0:i.slug)||""),n=`
    <button class="vs-move-parent-option ${_t===null?"is-selected":""}"
            data-action="select-move-parent" data-parent-href="__root__">
      Root
    </button>
  `;for(let a of Nt){if(a.href===t)continue;let r=_t===a.href;n+=`
      <button class="vs-move-parent-option ${r?"is-selected":""}"
              data-action="select-move-parent" data-parent-href="${y(a.href)}">
        ${y(a.label)}
      </button>
    `}return`
    <div class="vs-sc-form-field">
      <label class="vs-sc-form-label">Parent page</label>
      <div class="vs-move-parent-chooser">
        ${n}
      </div>
    </div>
  `}function Xf(e){var c,d,u,v,f;if(_t===void 0||!Nt)return"";let t=(c=e.meta)!=null&&c.isHomepage?"/":"/"+(((d=e.meta)==null?void 0:d.slug)||""),s=e.label||((u=e.meta)==null?void 0:u.slug)||"",n=[];if(_t===null)n=Nt.filter(b=>b.href!==t);else for(let b of Nt)if(b.href===_t){n=(b.children||[]).filter(h=>h.href!==t);break}if(n.length===0)return`
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label">Position</label>
        <div class="vs-move-position-strip">
          <div class="vs-move-strip-pill is-self">${y(s)}</div>
        </div>
        <div class="vs-sc-form-hint">Only page at this level</div>
      </div>
    `;let o=gs??n.length,i=[...n];i.splice(o,0,{href:t,label:s,isSelf:!0});let a=o>0,r=o<n.length,l=i.map(b=>b.isSelf?`<div class="vs-move-strip-pill is-self">${y(b.label)}</div>`:`<div class="vs-move-strip-pill">${y(b.label)}</div>`).join(""),p="";if(o===0)p="First in navigation";else if(o>=n.length)p="Last in navigation";else{let b=((v=n[o-1])==null?void 0:v.label)||"",h=((f=n[o])==null?void 0:f.label)||"";p=`After ${b}, before ${h}`}return`
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
      <div class="vs-sc-form-hint">${y(p)}</div>
    </div>
  `}function Zf(){return!ns||_t===void 0||gs===null?!1:_t===ns.parentHref&&gs===ns.index}function Qf(){var n;let e=(n=ce)==null?void 0:n.nodes.get(ue);if(!e)return oo();let t=y(e.label||""),s=y($a);if(Ns==="success"&&ai){let o=ai,i=o.navLabelUpdated?'<p class="vs-sc-form-result-detail">Nav label updated</p>':"";return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${L.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Page renamed</p>
            <p class="vs-sc-form-result-detail">"${y(o.oldTitle)}" \u2192 "${y(o.newTitle)}"</p>
            ${i}
          </div>
        </div>
      </div>
    `}return Ns==="error"&&Tn?`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${L.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${y(Tn.message||Tn)}</p>
            ${Aa(Tn)}
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-rename">Dismiss</button>
        </div>
      </div>
    `:Ns==="applying"?`
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
  `}function eg(){var c,d;let e=(c=ce)==null?void 0:c.nodes.get(ue);if(!e)return oo();let t=y(e.label||""),s=e.id.replace("page:","");if(kt==="success"&&ri){let u=ri;return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${L.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">"${y(((d=u.deletedPage)==null?void 0:d.title)||"")}" has been removed</p>
            ${u.navEntryRemoved?'<p class="vs-sc-form-result-detail">Nav entry removed</p>':""}
            ${u.navChildrenPromoted>0?`<p class="vs-sc-form-result-detail">${u.navChildrenPromoted} child nav ${u.navChildrenPromoted===1?"entry":"entries"} promoted</p>`:""}
            ${u.referencesCleanedUp>0?`<p class="vs-sc-form-result-detail">${u.referencesCleanedUp} ${u.referencesCleanedUp===1?"file":"files"} cleaned up</p>`:""}
            ${u.totalAffectedReferences>0&&!u.referencesCleanedUp?`<p class="vs-sc-form-result-detail">${u.totalAffectedReferences} ${u.totalAffectedReferences===1?"reference":"references"} may need review</p>`:""}
            ${u.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `}if(kt==="error"&&In)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${L.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Delete failed</p>
            <p class="vs-sc-form-result-detail">${y(In.message||In)}</p>
            ${Aa(In)}
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-delete">Dismiss</button>
        </div>
      </div>
    `;if(kt==="applying")return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Deleting page\u2026</span>
        </div>
      </div>
    `;let n=Mn(ue),o=[];if(n){let u=ce.edgesByTarget.get(n)||[],v=new Map;for(let f of u)if(f.type==="links_to"){let b=ce.nodes.get(f.source);if(b){let h=v.get(f.source)||{id:f.source,label:b.label||f.source,type:b.type,count:0};h.count++,v.set(f.source,h)}}o=Array.from(v.values())}let i=o.reduce((u,v)=>u+v.count,0),a="";kt==="armed"?a=`
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
      <p class="vs-sc-delete-warning">VoxelSite saves a safety snapshot before deleting. Recover it in Designs \u2192 History. Chat Undo does not restore this deletion.</p>
    `;let l=[{label:`Page file: ${y(s)}`,icon:L.fileText},{label:"Database entry",icon:L.database}].map(u=>`
    <li class="vs-sc-delete-checklist-item">
      <span class="vs-sc-delete-checklist-icon">${u.icon}</span>
      <span>${u.label}</span>
    </li>
  `).join(""),p="";if(o.length>0){let u=o.filter(b=>b.type!=="partial"),v=o.filter(b=>b.type==="partial"),f="";if(u.length>0){let b=u.map(h=>`<span class="vs-sc-delete-ref-chip">${y(h.label)}</span>`).join("");f+=`
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Links to this page will have their href set to # \u2014 the element and its styling are preserved">Unlinked</span>
          <div class="vs-sc-delete-ref-chips">${b}</div>
        </div>
      `}if(v.length>0){let b=v.map(h=>`<span class="vs-sc-delete-ref-chip">${y(h.label)}</span>`).join("");f+=`
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Navigation and footer entries linking to this page will be fully removed">Removed</span>
          <div class="vs-sc-delete-ref-chips">${b}</div>
        </div>
      `}p=`
      <div class="vs-sc-delete-section">
        <div class="vs-sc-delete-section-header">
          <span class="vs-sc-form-label" title="Links to this page in other files will be automatically cleaned up during deletion">References cleaned</span>
          <span class="vs-sc-delete-section-count">${i}</span>
        </div>
        ${f}
      </div>
    `}return`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Delete</h3>
      <p class="vs-sc-form-context">${y(s)}</p>
      <div class="vs-sc-delete-section">
        <span class="vs-sc-form-label">Will be removed</span>
        <ul class="vs-sc-delete-checklist">
          ${l}
        </ul>
      </div>
      ${p}
      ${a}
    </div>
  `}var Ba=null,Pa=!1;function Jp(){return setTimeout(async()=>{var e;if(_n()){await Qp();return}await fi(),Se==="recovering"&&((e=Re)!=null&&e.plan_id)&&Ra(Re.plan_id)},0),`
    <div id="vs-site-root" style="height: 100%;">
      <div class="vs-site-loading">
        <div class="vs-site-spinner"></div>
        <span>Building site structure\u2026</span>
      </div>
    </div>
  `}var bl=null;function ao(e){bl=e.draft_version||null,ap(Mp(e))}async function fi(){var o;let e=document.getElementById("vs-site-root");if(!e)return;let{ok:t,data:s}=await Y.get("/site-graph");if(!t||!s){if(Se!=="idle"){Pa=!0,Os({type:"error",message:"Could not refresh site structure. Reload Site before another change.",time:Date.now()}),ie();return}e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">${L.globe}</div>
          <p class="vs-empty-state-title">Could not load site graph</p>
          <p class="vs-empty-state-desc">Check that your site has pages in the preview directory.</p>
          <button id="vs-site-retry" class="vs-btn vs-btn-primary vs-btn-sm">Retry</button>
        </div>
      </div>
    `,(o=document.getElementById("vs-site-retry"))==null||o.addEventListener("click",()=>fi());return}ao(s),Pa=!1,nl(""),ut.clear(),ba(null),en(null),tn(null),qs(""),Qs(ln());let n=Ep();n&&ce.nodes.has(n)?(fs(n),n.startsWith("page:")&&Rs(n),ro(n)):(fs(null),Rs(null),to(null)),Xp(e)}function Xp(e){e.innerHTML=`
    <div class="vs-site-workspace vs-sc-three-panel">
      <div class="vs-sc-left" id="vs-sc-left"${ul("left")}>
        ${Ap(Ds)}
        <div class="vs-editor-resize" data-resize-panel="vs-sc-left"></div>
      </div>
      <div class="vs-sc-canvas" id="vs-sc-canvas">
        <div class="vs-sc-canvas-diagram">
          <div class="vs-site-diagram" id="vs-site-diagram">
            ${ce?Rp(Ds):'<div class="vs-site-diagram-empty">Site structure is not available yet</div>'}
          </div>
          <div class="vs-sc-status-bar" id="vs-sc-status-bar">
            ${tg()}
          </div>
        </div>
        ${jp()}
      </div>
      <div class="vs-sc-right" id="vs-sc-right"${ul("right")}>
        <div class="vs-editor-resize" data-resize-panel="vs-sc-right" data-resize-side="left"></div>
        ${zp()}
      </div>
    </div>
  `,cg(e),requestAnimationFrame(()=>requestAnimationFrame(()=>no(Ds)))}function tg(){var c;if(!ce)return"";let e=0,t=0,s=0;for(let[,d]of ce.nodes)d.type==="page"?e++:d.type==="partial"?t++:d.type==="route"&&s++;let n=[`${e} page${e!==1?"s":""}`,`${t} partial${t!==1?"s":""}`,`${s} route${s!==1?"s":""}`],o=0;for(let[,d]of ce.nodes)d.type==="page"&&((ce.edgesByTarget.get(d.id)||[]).some(v=>v.type==="serves")||o++);let i=ce.summary.warnings||((c=ce.warnings)==null?void 0:c.length)||0,a=o===0&&!Pa&&i===0,r=a?"vs-sc-status-healthy":"vs-sc-status-warning",l=Pa?"Structure refresh failed":i?`${i} item${i===1?"":"s"} need review`:a?"Routes indexed":`${o} unlinked`,p="";if(!ue&&ce.builtAt){let d=Math.round((Date.now()-new Date(ce.builtAt).getTime())/1e3);p=d<60?`Graph built ${d}s ago`:`Graph built ${Math.round(d/60)}m ago`}else!ue&&ce.buildTimeMs&&(p=`Built in ${ce.buildTimeMs}ms`);return`
    <span class="vs-sc-status-stat vs-sc-status-counts">
      ${n.map(d=>`<span>${d}</span>`).join("")}
    </span>
    <span class="vs-sc-status-stat">
      <span class="vs-sc-status-dot ${r}"></span>
      <span class="${r}">${l}</span>
    </span>
    ${p?`<span class="vs-sc-status-stat">${p}</span>`:""}
  `}function ci(e){mt()||(ss&&(en(null),tn(null),qs(""),Pe("idle"),wt(null),Wt(null)),Ln&&(os(),Pe("idle"),wt(null),Wt(null)),on&&io(),an&&Ma(),fs(e),to(e),e&&e.startsWith("page:")&&Rs(e),e&&ro(e),ie())}function pi(){mt()||(en(null),tn(null),qs(""),Pe("idle"),wt(null),Wt(null),Ln&&os(),on&&hs(),an&&as(),fs(null),to(null),ie())}async function ro(e){if(ut.has(e))return;ba(e),ie();let{ok:t,data:s}=await Y.get("/site-graph/blast-radius?node="+encodeURIComponent(e));ni===e&&(ba(null),t&&s&&ut.set(e,s),ie())}async function sg(){var a,r;if(mt()||(a=window.demoGuard)!=null&&a.call(window)||!ss||!sn)return;let e=(r=ce)==null?void 0:r.nodes.get(ss),t=(e==null?void 0:e.label)||(e==null?void 0:e.id)||"",s=hl(sn,t);if(!s.valid){Pe("idle"),ie();return}Pe("applying"),wt(null),ie();let{ok:n,data:o,error:i}=await mi("/site-control/url-rename",{routeId:ss,newPath:s.cleanPath});if(n&&o){Pe("success"),Wt(o),dp(o.suggestedPrompt||null),o.newPageId&&(fs(o.newPageId),Rs(o.newPageId));let l=await Y.get("/site-graph");if(l.ok&&l.data&&(ao(l.data),ut.clear(),Qs(ln())),o.newPageId&&ro(o.newPageId),o.oldPath&&o.newPath){let p=o.oldPath.replace(/^\//,"")+".php",c=o.newPath.replace(/^\//,"")+".php";ti([{oldFilePath:p,newFilePath:c}])}ie(),setTimeout(()=>{Hs(),ie()},1500)}else Pe("error"),wt(i||{message:"An unknown error occurred."}),ie()}async function ng(e){if(mt())return;Vp(e),ie();let{ok:t,data:s}=await Y.get("/site-control/nav-preflight?pageId="+encodeURIComponent(e));if(Ea(!1),!t||!s){rl("nav_parse_error"),ie();return}rl(s.navStatus||null),gp(s.isInNav||!1),hp(s.isHomepage||!1),up(s.currentPosition||null),vp(s.navTree||null),fp(s.hasHomeEntry||!1),pp(s.navStatus==="needs_normalization"),s.currentPosition&&(al(s.currentPosition.parentHref??null),oi(s.currentPosition.index??0)),ie()}async function og(){var s,n,o,i;if(mt()||(s=window.demoGuard)!=null&&s.call(window)||!ue||gs===null)return;let e=((n=ns)==null?void 0:n.parentHref)??null,t=_t!==e;if(Pe("applying"),wt(null),ie(),t){let a=_t?_t.replace(/^\//,""):"",{ok:r,data:l,error:p}=await mi("/site-control/structural-move",{pageId:ue,targetParent:a,targetIndex:gs});if(r&&l){Pe("success"),Wt(l),((o=l.movedPages)==null?void 0:o.length)>0&&ti(l.movedPages);let c=await Y.get("/site-graph");c.ok&&c.data&&(ao(c.data),ut.clear(),Qs(ln()));let d=ue;((i=l.movedPages)==null?void 0:i.length)>0&&(d="page:"+l.movedPages[0].newFilePath,fs(d),Rs(d),ro(d)),ie(),setTimeout(()=>{di(),ie()},1500)}else Pe("error"),wt(p||{message:"An unknown error occurred."}),ie()}else{let a={pageId:ue,targetParentHref:_t,targetIndex:gs},{ok:r,data:l,error:p}=await mi("/site-control/nav-reorder",a);if(r&&l){Pe("success"),Wt(l);let c=ue;fs(c),Rs(c);let d=await Y.get("/site-graph");d.ok&&d.data&&(ao(d.data),ut.clear(),Qs(ln())),ro(c),ie(),setTimeout(()=>{di(),ie()},1500)}else Pe("error"),wt(p||{message:"An unknown error occurred."}),ie()}}async function Kp(e){var i;if(mt()||(i=window.demoGuard)!=null&&i.call(window)||!ue||!e)return;Sa("applying"),ll(null),ie();let t={pageId:ue,newTitle:e},{ok:s,data:n,error:o}=await mi("/site-control/page-rename",t);if(s&&n){Sa("success"),xp(n);let a=ue;fs(a),Rs(a);let r=await Y.get("/site-graph");r.ok&&r.data&&(ao(r.data),ut.clear(),Qs(ln())),ro(a),ie(),setTimeout(()=>{io(),ie()},1500)}else Sa("error"),ll(o||{message:"An unknown error occurred."}),ie()}async function ig(){var n;if(mt()||(n=window.demoGuard)!=null&&n.call(window)||!ue)return;is("applying"),dl(null),ie();let{ok:e,data:t,error:s}=await mi("/site-control/page-delete",{pageId:ue});e&&t?(is("success"),kp(t),ie(),setTimeout(async()=>{var a;let o=(a=t.deletedPage)==null?void 0:a.filePath;o&&ti([],[o]),fs(null),Rs(null);let i=await Y.get("/site-graph");i.ok&&i.data&&(ao(i.data),ut.clear(),Qs(ln())),as(),ie()},1800)):(is("error"),dl(s||{message:"An unknown error occurred."}),ie())}function ag(e){var i,a;let t=document.querySelector(`.vs-site-tree-group[data-tree-group="${e}"]`);Lt.has(e)?(Lt.delete(e),t&&t.classList.remove("is-collapsed")):(Lt.add(e),t&&t.classList.add("is-collapsed"));let s=t==null?void 0:t.querySelector(".vs-site-tree-toggle"),n=!Lt.has(e);s==null||s.setAttribute("aria-expanded",String(n));let o=((a=(i=ce)==null?void 0:i.nodes.get(e))==null?void 0:a.label)||e;s==null||s.setAttribute("aria-label",`${n?"Collapse":"Expand"} ${o}`)}function ie(){var p,c,d;let e=document.getElementById("vs-site-root");if(!e)return;let t=op(e,document.activeElement),s=((p=document.activeElement)==null?void 0:p.id)==="vs-proposal-url",n=s?document.activeElement.selectionStart:null,o=((c=document.activeElement)==null?void 0:c.id)==="vs-sc-rename-input",i=o?document.activeElement.value:null,a=o?document.activeElement.selectionStart:null,r=((d=document.activeElement)==null?void 0:d.id)==="vs-sc-search",l=r?document.activeElement.selectionStart:null;if(Xp(e),ip(e,t),s){let u=document.getElementById("vs-proposal-url");u&&(u.focus(),n!==null&&u.setSelectionRange(n,n))}if(o){let u=document.getElementById("vs-sc-rename-input");u&&(u.value=i,u.focus(),a!==null&&u.setSelectionRange(a,a))}if(r){let u=document.getElementById("vs-sc-search");u&&(u.focus(),l!==null&&u.setSelectionRange(l,l))}}async function Yp(e){var t;if(!(mt()||(t=window.demoGuard)!=null&&t.call(window))){Hs(),os(),hs(),as(),Ye("running"),Ta(e),ml(),vt(null),Kt(null),ie(),setTimeout(()=>{var s;return(s=document.getElementById("vs-sc-composer-input"))==null?void 0:s.focus()},0);try{await ds("/site-control/orchestrate",{prompt:e},{requireTerminal:!0,onStatus(s){Os({type:"info",message:s.message||"Processing\u2026",time:Date.now()}),eu()},onDone(s){if(Se==="running"){Os({type:"done",message:s.summary||s.message||"Done.",time:Date.now()});let n=s.discovery||null,o=s.intent||null,i=s.plan||null,a=n&&Array.isArray(n.candidates)&&n.candidates.length>0,r=i&&Array.isArray(i.edits)?i.edits:[],l=(i==null?void 0:i.plan_id)||s.plan_id,p=r.length>0&&r.every(c=>c.anchored===!0)&&!!l;a?(Kt({plan_id:l,intent:o,files:n.candidates.map(c=>({type:c.type||"file",path:c.file||c.node_id,label:c.label||"",reason:c.reason||""})),affected_pages:(n.affected_pages||[]).map(c=>({label:c.label||"",slug:c.slug||""})),skipped:(n.skipped||[]).map(c=>({path:c.path||"",reason:c.reason||""})),edits:r,risk_level:(i==null?void 0:i.risk_level)||"medium",plan_summary:(i==null?void 0:i.summary)||"",anchored_count:(i==null?void 0:i.anchored_count)||0,unanchored_count:(i==null?void 0:i.unanchored_count)||0}),p?Ye("plan"):Ye("plan_failed")):Ye("complete"),vt({filesChanged:s.filesChanged||0,summary:s.summary||s.message||"Orchestration complete."}),ie()}},onError(s){Ye("plan_failed"),vt({filesChanged:0,summary:s.message||"Orchestration failed."}),Os({type:"error",message:s.message||"Error during orchestration.",time:Date.now()}),ie()}})}catch{Ye("plan_failed"),vt({filesChanged:0,summary:"Connection error."}),Os({type:"error",message:"Connection lost during orchestration.",time:Date.now()}),ie()}}}async function rg(){var t,s,n;if(mt()||(t=window.demoGuard)!=null&&t.call(window)||!((s=Re)!=null&&s.plan_id)||!((n=Re.edits)!=null&&n.length)||!Re.edits.every(o=>o.anchored===!0))return;let e=Re.plan_id;Ye("applying"),ie();try{await ds("/site-control/apply",{plan_id:e},{requireTerminal:!0,onStatus(o){Os({phase:o.phase||"status",status:o.status||"ok",file:o.file||"",message:o.message||"",bytes:o.bytes||null,ms:o.ms||null,time:Date.now()}),eu()},onDone(o){yl(o,!0)},onError(o){typeof o.rollback_clean=="boolean"?yl(o,!1):Ra(e,o.outcome_unknown?null:o)}})}catch{Os({phase:"failed",status:"error",message:"Connection lost during apply.",time:Date.now()}),Ra(e)}}function mt(){return!!_n()||Bn()||Ke==="applying"||Ns==="applying"||kt==="applying"}async function mi(e,t){var n;if(!bl)return{ok:!1,error:{code:"content_conflict",message:"Reload the site graph before changing it."}};let s=await sp(e,{...t,base_draft_version:bl});return(n=s.error)!=null&&n.outcome_unknown&&Zp(s.error),s}function Zp(e){Kt(null),vt({summary:e.message,rollback_clean:typeof e.restored=="boolean"?e.restored:null,recovery_snapshot_id:e.snapshotId||null,mutation_id:e.mutation_id||null,outcome_unknown:e.outcome_unknown===!0,changed_files:e.changed_files||e.changedFiles||[],verification:[]}),Ye("apply_failed"),ie()}var ui=null;function Qp(){return ui||(_n()?(Kt(null),Ye("recovering"),ie(),ui=(async()=>{var s,n,o;let t=await tl();if((s=t.error)!=null&&s.outcome_unknown||(en(null),tn(null),qs(""),Pe("idle"),os(),hs(),as()),t.ok){let i=t.data||{},a=i.movedPages||[];i.oldPath&&i.newPath&&(a=[{oldFilePath:i.oldPath.replace(/^\//,"")+".php",newFilePath:i.newPath.replace(/^\//,"")+".php"}]);let r=(n=i.deletedPage)!=null&&n.filePath?[i.deletedPage.filePath]:[];ti(a,r),a.length&&to("page:"+a[0].newFilePath),r.length&&to(null),vt({summary:i.message||"The Site change completed. The result was recovered from the server.",filesChanged:((o=i.updatedFiles)==null?void 0:o.length)??null,verification:[]}),Ye("applied"),D.set("previewDirty",!0),ie()}else Zp(t.error||{message:"The mutation result could not be read."});await fi()})().finally(()=>{ui=null}),ui):Promise.resolve())}function yl(e,t){vt({...e,filesChanged:e.filesChanged??e.files_changed??0,summary:e.recovery_resolved&&e.recovery_note||e.message||e.error||e.summary||(t?"Changes applied.":"Patch execution failed."),rollback_clean:typeof e.rollback_clean=="boolean"?e.rollback_clean:null,verification:e.verification||[],changed_files:e.changed_files||[],recovery_snapshot_id:e.recovery_snapshot_id||null}),Ye(t?"applied":"apply_failed"),D.set("previewDirty",!0),ie(),fi()}var vi=null;function Ra(e,t=null){return vi||(Ye("recovering"),ie(),vi=(async()=>{var n,o;let s=await tp(e);if(s.status==="applied"||s.status==="failed"){yl(s.result||{},s.status==="applied");return}if(s.status==="ready"){Ye(t?"plan_failed":"plan");let i=(t==null?void 0:t.message)||"The apply request did not start. Review and apply the same plan when ready.";vt({summary:i}),Os({type:t?"error":"info",message:i,time:Date.now()}),ie();return}Ye("apply_failed"),vt({summary:(t==null?void 0:t.message)||"The server has not confirmed the apply result. Check again before retrying.",rollback_clean:null,outcome_unknown:!0,recovery_snapshot_id:s.recovery_snapshot_id||((n=s.result)==null?void 0:n.recovery_snapshot_id)||null,changed_files:[...new Set((((o=Re)==null?void 0:o.edits)||[]).map(i=>i.file))]}),ie(),fi()})().finally(()=>{vi=null}),vi)}var lg={start:"\u25B6",snapshot:"\u25CE",read:"\u2193",anchor:"\u2693",patch:"\u270E",lint:"\u2318",verify:"\u2714",reject:"\u2298",rollback:"\u21BA",done:"\u2713",failed:"\u2717",abort:"\u2298"},dg={ok:"is-ok",failed:"is-failed",error:"is-failed",skip:"is-skip",refused:"is-refused",start:"is-info",partial:"is-warning"};function eu(){let e=document.getElementById("vs-sc-console-log");if(!e)return;let t=dn.map(s=>{if(s.phase){let i=lg[s.phase]||"\xB7",a=dg[s.status]||"",r=s.file?`<span class="vs-sc-log-file">${s.file.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span> `:"",l=s.ms!=null?`<span class="vs-sc-log-meta">${s.ms}ms</span>`:s.bytes!=null?`<span class="vs-sc-log-meta">${s.bytes}b</span>`:"",p=(s.message||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");return`<div class="vs-sc-log-entry vs-sc-log-phase ${a}">
        <span class="vs-sc-log-icon">${i}</span>
        <span class="vs-sc-log-phase-name">${s.phase}</span>
        ${r}<span class="vs-sc-log-text">${p}</span>
        ${l}
      </div>`}let n=s.type==="running"?"is-running":s.type==="done"?"is-done":s.type==="error"?"is-error":s.type==="skipped"?"is-skipped":s.type==="plan"?"is-plan":"",o=s.type==="running"?"\u2192":s.type==="done"?"\u2713":s.type==="error"?"\u2717":s.type==="skipped"?"\u2298":s.type==="plan"?"\u25C6":s.type==="info"?"\u2192":"\xB7";return`<div class="vs-sc-log-entry ${n}">
      <span class="vs-sc-log-icon">${o}</span>
      <span class="vs-sc-log-text">${s.message.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span>
    </div>`}).join("");e.innerHTML=t,e.scrollTop=e.scrollHeight}function cg(e){var b;mt()&&e.querySelectorAll('.vs-sc-action-bar button, #vs-sc-console-clear, #vs-sc-composer-submit, #vs-sc-composer-input, [data-action^="close-"]').forEach(h=>{h.disabled=!0});let t=e.querySelector("#vs-sc-search");if(t){let h;t.addEventListener("input",()=>{clearTimeout(h),h=setTimeout(()=>{var g;nl(t.value.trim()),Qs(ln()),ie(),(g=document.getElementById("vs-sc-search"))==null||g.focus()},150)})}e.querySelectorAll(".vs-sc-nav-section-header[data-nav-section]").forEach(h=>{h.addEventListener("click",()=>{let g=h.dataset.navSection,m=h.closest(".vs-sc-nav-section");m&&(rn.has(g)?(rn.delete(g),m.classList.remove("is-collapsed")):(rn.add(g),m.classList.add("is-collapsed")),Tp())})}),e.querySelectorAll(".vs-site-tree-item[data-page-id]").forEach(h=>{h.addEventListener("click",g=>{let m=g.target.closest("button, input, textarea, select, a");if(m&&!m.matches("[data-select-page]"))return;let x=h.dataset.pageId;x&&ci(x)})}),e.querySelectorAll(".vs-site-tree-toggle[data-toggle-page]").forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let m=h.dataset.togglePage;m&&ag(m)})}),e.querySelectorAll(".vs-impact-item[data-node-id]").forEach(h=>{h.addEventListener("click",()=>{let g=h.dataset.nodeId;g&&ci(g)})}),e.querySelectorAll(".vs-site-card[data-page-id]").forEach(h=>{h.addEventListener("click",g=>{let m=g.target.closest("button, input, textarea, select, a");if(m&&!m.matches("[data-select-page]"))return;let x=h.dataset.pageId;x&&ci(x)})});let s=e.querySelector("#vs-site-diagram");s&&s.addEventListener("click",h=>{if(h.target===s||h.target.classList.contains("vs-site-tiers")){if(Ke==="armed"){Pe("idle"),ie();return}if(kt==="armed"){is("idle"),ie();return}pi()}}),e.querySelectorAll('[data-action="close-inspect"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),pi()})}),e.querySelectorAll(".vs-impact-ref-item[data-node-id]").forEach(h=>{h.addEventListener("click",()=>{let g=h.dataset.nodeId;g&&ci(g)})}),e.querySelectorAll("[data-card-toggle]").forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let m=h.dataset.cardToggle;if(!m)return;let x=h.closest(".vs-impact-card"),w=x==null?void 0:x.classList.contains("is-collapsed");Ca.set(m,w?"open":"closed"),Sp(),ie()})}),e.querySelectorAll('[data-action="overflow"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let m=h.closest(".vs-sc-action-overflow");if(!m)return;if(m.classList.toggle("is-open")){let w=k=>{m.contains(k.target)||(m.classList.remove("is-open"),document.removeEventListener("click",w,!0))},E=k=>{k.key==="Escape"&&(k.stopPropagation(),k.preventDefault(),m.classList.remove("is-open"),document.removeEventListener("keydown",E,!0),document.removeEventListener("click",w,!0))};setTimeout(()=>{document.addEventListener("click",w,!0),document.addEventListener("keydown",E,!0)},0)}})}),e.querySelectorAll(".vs-sc-action-bar [data-action]").forEach(h=>{let g=h.dataset.action;["change-url","move","reorder","rename","delete","overflow","open-in-editor","open-in-chat"].includes(g)||h.addEventListener("click",m=>{m.stopPropagation();let x=h.closest(".vs-sc-action-bar"),w=(x==null?void 0:x.dataset.forNode)||ue;console.log("Action stub:",g,w)})}),e.querySelectorAll('[data-action="open-in-editor"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let m=h.closest(".vs-sc-action-bar"),x=(m==null?void 0:m.dataset.forNode)||ue;if(!x)return;let w=x.startsWith("page:")?x.slice(5):x;window.__vsEditorPendingFile=w,window.location.hash="#/editor"})}),e.querySelectorAll('[data-action="open-in-chat"]').forEach(h=>{h.addEventListener("click",g=>{var k,$;g.stopPropagation();let m=h.closest(".vs-sc-action-bar"),x=(m==null?void 0:m.dataset.forNode)||ue;if(!x)return;let w=(k=ce)==null?void 0:k.nodes.get(x),E=(($=w==null?void 0:w.meta)==null?void 0:$.slug)||x.replace(/^page:/,"").replace(/\.php$/,"");D.set("activePageScope",E),window.location.hash="#/chat"})});let n=e.querySelector("#vs-sc-composer-input"),o=e.querySelector("#vs-sc-composer-submit");if(n){let h=()=>{n.style.height="auto",n.style.height=Math.min(n.scrollHeight,120)+"px"};n.addEventListener("input",()=>{Ta(n.value),h(),o&&(o.disabled=!n.value.trim()||mt())}),n.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&(n.value.trim()&&!mt()?(g.preventDefault(),Yp(n.value.trim())):g.preventDefault())})}o&&o.addEventListener("click",h=>{h.stopPropagation();let g=An.trim();g&&!mt()&&Yp(g)});let i=e.querySelector("#vs-sc-console-toggle");i&&i.addEventListener("click",()=>{let h=fl();Hp(!h),ie()});let a=e.querySelector("#vs-sc-console-clear");a&&a.addEventListener("click",()=>{mt()||(ml(),Ye("idle"),vt(null),Kt(null),Ta(""),ie())});let r=e.querySelector("#vs-sc-console-resize"),l=e.querySelector("#vs-sc-console");r&&l&&r.addEventListener("mousedown",h=>{h.preventDefault();let g=h.clientY,m=l.offsetHeight,x=E=>{let k=g-E.clientY,$=Math.min(500,Math.max(120,m+k));l.style.height=$+"px"},w=()=>{document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",w),Op(l.offsetHeight),requestAnimationFrame(()=>no(Ds))};document.addEventListener("mousemove",x),document.addEventListener("mouseup",w)});let p=e.querySelector("#vs-sc-orch-dismiss");p&&p.addEventListener("click",()=>{mt()||(Ye("idle"),vt(null),Kt(null),ie())}),(b=e.querySelector("#vs-sc-orch-check"))==null||b.addEventListener("click",()=>{var h;_n()&&!Bn()?Qp():(h=Re)!=null&&h.plan_id&&!mt()&&Ra(Re.plan_id)}),e.querySelectorAll("[data-orch-open-file]").forEach(h=>{h.addEventListener("click",()=>{mt()||(window.__vsEditorPendingFile=h.dataset.orchOpenFile,window.location.hash="#/editor")})});let c=e.querySelector("#vs-sc-orch-apply");c&&c.addEventListener("click",()=>{rg()}),e.querySelectorAll('[data-action="rename"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),ue&&(Wp(ue),ie(),setTimeout(()=>{let m=document.getElementById("vs-sc-rename-input");m&&(m.focus(),m.select())},50))})}),e.querySelectorAll('[data-action="close-rename"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),io(),ie()})});let d=e.querySelector("#vs-sc-rename-input");if(d){let h=()=>{var k;let g=d.value.trim(),m=document.getElementById("vs-sc-rename-submit"),x=document.getElementById("vs-sc-rename-hint"),w=(k=ce)==null?void 0:k.nodes.get(ue),E=(w==null?void 0:w.label)||"";g?g===E?(m&&(m.disabled=!0),x&&(x.textContent="Same as current title",x.className="vs-sc-form-hint is-neutral")):(m&&(m.disabled=!1),x&&(x.textContent="",x.className="vs-sc-form-hint")):(m&&(m.disabled=!0),x&&(x.textContent="Title cannot be empty",x.className="vs-sc-form-hint is-error"))};d.addEventListener("input",h),d.addEventListener("keydown",g=>{if(g.key==="Enter"){g.preventDefault();let m=document.getElementById("vs-sc-rename-submit");m&&!m.disabled&&Kp(d.value.trim())}g.key==="Escape"&&(g.stopPropagation(),io(),ie())}),h()}e.querySelectorAll('[data-action="rename-submit"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let m=document.getElementById("vs-sc-rename-input");m&&Kp(m.value.trim())})}),e.querySelectorAll('[data-action="delete"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),ue&&(Gp(ue),ie())})}),e.querySelectorAll('[data-action="close-delete"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Ma(),ie()})}),e.querySelectorAll('[data-action="delete-arm"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),is("armed"),ie(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{kt==="armed"&&(is("idle"),ie())},3e3)})}),e.querySelectorAll('[data-action="delete-confirm"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),ig()})}),e.querySelectorAll('[data-action="change-url"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),ue&&(Up(ue,ie),ie())})}),e.querySelectorAll('[data-action="close-proposal"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Hs(),ie()})}),e.querySelectorAll('[data-action="apply-proposal-arm"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Pe("armed"),wt(null),ie(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{Ke==="armed"&&(Pe("idle"),ie())},3e3)})}),e.querySelectorAll('[data-action="apply-proposal-confirm"]').forEach(h=>{h.addEventListener("click",async g=>{g.stopPropagation(),await sg()})}),e.querySelectorAll("[data-navigate-node]").forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let m=h.dataset.navigateNode;m&&ci(m)})}),e.querySelectorAll('[data-action="reorder"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let m=h.closest(".vs-sc-action-bar"),x=(m==null?void 0:m.dataset.forNode)||ue;x&&ng(x)})}),e.querySelectorAll('[data-action="close-move-proposal"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),di(),ie()})}),e.querySelectorAll('[data-action="select-move-parent"]').forEach(h=>{h.addEventListener("click",g=>{var w,E,k;g.stopPropagation();let m=h.dataset.parentHref,x=m==="__root__"?null:m;if(al(x),ns&&x===(ns.parentHref??null))oi(ns.index??0);else{let $=(w=ce)==null?void 0:w.nodes.get(ue),S=(E=$==null?void 0:$.meta)!=null&&E.isHomepage?"/":"/"+(((k=$==null?void 0:$.meta)==null?void 0:k.slug)||""),_=0;if(Nt){if(x===null)_=Nt.filter(q=>q.href!==S).length;else for(let q of Nt)if(q.href===x){_=(q.children||[]).filter(K=>K.href!==S).length;break}}oi(_)}Pe("idle"),ie()})}),e.querySelectorAll('[data-action="select-move-position"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),oi(parseInt(h.dataset.position,10)),Pe("idle"),ie()})}),e.querySelectorAll('[data-action="apply-move-arm"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Pe("armed"),wt(null),ie(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{Ke==="armed"&&(Pe("idle"),ie())},3e3)})}),e.querySelectorAll('[data-action="apply-move-confirm"]').forEach(h=>{h.addEventListener("click",async g=>{g.stopPropagation(),await og()})});let u=e.querySelector("#vs-proposal-url");if(u){let h=null;u.addEventListener("input",()=>{clearTimeout(h),h=setTimeout(()=>{qs(u.value),ie()},200)}),u.addEventListener("keydown",g=>{if(g.key==="Enter"&&g.preventDefault(),g.key==="Escape"){if(g.preventDefault(),g.stopPropagation(),Ke==="armed"){Pe("idle"),ie();return}Hs(),ie()}}),il&&(ya(!1),setTimeout(()=>u.focus(),0))}let v=e.querySelector("#vs-sc-right-body");v&&v.addEventListener("click",h=>{if(!(h.target.closest("button")||h.target.closest("a")||h.target.closest("input"))){if(h.target.closest(".vs-proposal-panel")||h.target.closest(".vs-sc-form")){Ke==="armed"&&(Pe("idle"),ie()),kt==="armed"&&(is("idle"),ie());return}if(!h.target.closest(".vs-impact-detail-content")&&!h.target.closest(".vs-sc-summary")){if(Ke==="armed"){Pe("idle"),ie();return}if(kt==="armed"){is("idle"),ie();return}pi()}}});let f=e.querySelector("#vs-sc-left-scroll");f&&f.addEventListener("click",h=>{if(h.target===f){if(Ke==="armed"){Pe("idle"),ie();return}if(kt==="armed"){is("idle"),ie();return}pi()}}),ol||(lp(!0),document.addEventListener("keydown",h=>{var g,m,x;if(h.key==="Escape"){if(Ke==="armed"){Pe("idle"),ie();return}if(kt==="armed"){is("idle"),ie();return}if(an&&((g=document.activeElement)==null?void 0:g.tagName)!=="INPUT"){Ma(),ie();return}if(on&&((m=document.activeElement)==null?void 0:m.tagName)!=="INPUT"){io(),ie();return}ue&&((x=document.activeElement)==null?void 0:x.tagName)!=="INPUT"&&pi()}})),Ba&&window.removeEventListener("resize",Ba);{let h;Ba=()=>{clearTimeout(h),h=setTimeout(()=>{requestAnimationFrame(()=>no(Ds))},150)},window.addEventListener("resize",Ba)}e.querySelectorAll(".vs-editor-resize[data-resize-panel]").forEach(h=>{let g=h.dataset.resizePanel,m=document.getElementById(g);if(!m)return;let x=h.dataset.resizeSide==="left";h.addEventListener("mousedown",w=>{if(w.preventDefault(),h.classList.add("is-dragging"),x){let E=$=>{let S=m.parentElement.getBoundingClientRect(),_=Math.min(400,Math.max(240,S.right-$.clientX));m.style.width=_+"px"},k=()=>{h.classList.remove("is-dragging"),document.removeEventListener("mousemove",E),document.removeEventListener("mouseup",k),pl("right",m.offsetWidth),requestAnimationFrame(()=>no(Ds))};document.addEventListener("mousemove",E),document.addEventListener("mouseup",k)}else{let E=m.getBoundingClientRect(),k=S=>{let _=Math.min(360,Math.max(180,S.clientX-E.left));m.style.width=_+"px"},$=()=>{h.classList.remove("is-dragging"),document.removeEventListener("mousemove",k),document.removeEventListener("mouseup",$),pl("left",m.offsetWidth),requestAnimationFrame(()=>no(Ds))};document.addEventListener("mousemove",k),document.addEventListener("mouseup",$)}})})}var Ne=null,su=null,rt=null,Yt=null,ls=null,ft=null,tu=!1,pg=80;var ug=60,gi=5,hi=6;function vg(e){return e.replace(/\(([⌘⇧⌥⌃\w+↵←→↑↓⌫]+)\)/g,(t,s)=>`<kbd class="vs-tooltip-kbd">${mg(s)}</kbd>`)}function mg(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function fg(){if(Ne)return;let e=document.createElement("div");e.className="vs-tooltip",e.setAttribute("role","tooltip");let t=document.createElement("span");t.className="vs-tooltip-content";let s=document.createElement("span");s.className="vs-tooltip-arrow",e.appendChild(t),e.appendChild(s),document.body.appendChild(e),Ne=e,su=s}function gg(e){if(!Ne)return;let t=e.getBoundingClientRect(),s=Ne.getBoundingClientRect(),n,o="above",i=t.top,a=window.innerHeight-t.bottom;i>=s.height+gi+hi?n=t.top-s.height-gi:a>=s.height+gi+hi?(n=t.bottom+gi,o="below"):i>=a?n=hi:(n=t.bottom+gi,o="below");let r=t.left+t.width/2,l=r-s.width/2;l=Math.max(hi,Math.min(l,window.innerWidth-hi-s.width));let p=r-l,c=Math.max(8,Math.min(s.width-8,p));Ne.style.top=`${n}px`,Ne.style.left=`${l}px`,su.style.left=`${c}px`,Ne.classList.remove("vs-tooltip--above","vs-tooltip--below"),Ne.classList.add(`vs-tooltip--${o}`)}function hg(e){let t=e.getAttribute("data-tooltip")||e.getAttribute("title");!t||!t.trim()||(e.hasAttribute("title")&&(e.setAttribute("data-tooltip",e.getAttribute("title")),e.removeAttribute("title")),ls&&(clearTimeout(ls),ls=null),rt=e,Yt=null,fg(),Ne.querySelector(".vs-tooltip-content").innerHTML=vg(t.trim()),Ne.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"),Ne.style.display="flex",Ne.style.opacity="0",requestAnimationFrame(()=>{rt===e&&(gg(e),Ne.classList.add("vs-tooltip--visible"),Ne.style.opacity="")}))}function nu(){Ne&&(rt&&(xl(rt),rt=null),Ne.classList.remove("vs-tooltip--visible"),Ne.classList.add("vs-tooltip--hiding"),ls=setTimeout(()=>{Ne&&(Ne.style.display="none",Ne.classList.remove("vs-tooltip--hiding")),ls=null},ug))}function Da(){ft&&(clearTimeout(ft),ft=null),Yt=null,rt&&(xl(rt),rt=null),ls&&(clearTimeout(ls),ls=null),Ne&&(Ne.style.display="none",Ne.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))}function xl(e){if(!e)return;let t=e.getAttribute("data-tooltip");t&&!e.hasAttribute("title")&&(e.setAttribute("title",t),e.removeAttribute("data-tooltip"))}function ou(e){for(;e&&e!==document.body;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentElement;continue}if(e.hasAttribute("data-tooltip-skip"))return null;if(e.hasAttribute("title")||e.hasAttribute("data-tooltip"))return e;e=e.parentElement}return null}function bg(e){if(e.buttons!==0)return;let t=ou(e.target);if(!t){ft&&(clearTimeout(ft),ft=null),Yt=null,rt&&nu();return}t!==rt&&t!==Yt&&(ft&&(clearTimeout(ft),ft=null),rt&&(xl(rt),rt=null,ls&&(clearTimeout(ls),ls=null),Ne&&(Ne.style.display="none",Ne.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))),Yt=t,ft=setTimeout(()=>{ft=null,Yt===t&&hg(t)},pg))}function yg(e){let t=ou(e.target);if(t)if(t===rt){let s=e.relatedTarget;if(s&&t.contains(s))return;ft&&(clearTimeout(ft),ft=null),Yt=null,nu()}else t===Yt&&(ft&&(clearTimeout(ft),ft=null),Yt=null)}function xg(){(rt||Yt)&&Da()}function wg(){(rt||Yt)&&Da()}function kg(){(rt||Yt)&&Da()}function iu(){tu||(tu=!0,document.addEventListener("mouseover",bg,{passive:!0}),document.addEventListener("mouseout",yg,{passive:!0}),document.addEventListener("scroll",xg,{passive:!0,capture:!0}),document.addEventListener("keydown",wg,{passive:!0}),document.addEventListener("mousedown",kg,{passive:!0}),window.addEventListener("resize",()=>{rt&&Da()},{passive:!0}))}var Eg=/^(release_[a-f0-9]{32}|legacy:[a-f0-9]{64})$/,au=(e,t)=>jt(`vs_export:${e}:${t}`);function wl(e,t,s){try{return JSON.parse(s.getItem(au(t,e))||"null")}catch{return null}}async function ru(e,t,s,n,o,i){var v;if(!["php","html"].includes(e)||!Eg.test(t||""))return{ok:!1,error:{code:"content_conflict",message:"Open Download again to review the published version."}};let a=au(s,e),r=wl(e,s,o)||{operation_id:`export_${crypto.randomUUID().replaceAll("-","")}`,version:t,format:e};if(i()!==s)return{ok:!1,error:{code:"permission_denied",message:"The signed-in account changed. Open Download again."}};try{o.setItem(a,JSON.stringify(r))}catch{}let l=await n(r);if(!l.ok){let f;try{f=(await l.json()).error}catch{}if(["content_conflict","export_expired","invalid_schema"].includes(f==null?void 0:f.code))try{o.removeItem(a)}catch{}return{ok:!1,error:f||{code:"download_failed",message:"Download failed. Retry to retrieve the same archive."}}}let p=await l.blob(),c=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",await p.arrayBuffer())),f=>f.toString(16).padStart(2,"0")).join("");if(l.headers.get("X-Content-SHA256")!==c||l.headers.get("X-VoxelSite-Export-Version")!==r.version)return{ok:!1,error:{code:"download_incomplete",message:"The download could not be verified. Retry to retrieve the same archive."}};if(i()!==s)return{ok:!1,error:{code:"permission_denied",message:"The signed-in account changed. Open Download again."}};let u=((v=(l.headers.get("Content-Disposition")||"").match(/filename="?([^";]+)"?/i))==null?void 0:v[1])||`site-${e}.zip`;try{o.removeItem(a)}catch{}return{ok:!0,data:{blob:p,filename:u,version:r.version}}}var bu=Jp,$i=[{id:"create",label:"Create",defaultRoute:"chat",routes:[{route:"chat",label:"Chat",roles:["owner","editor"]},{route:"site-map",label:"Site",roles:["owner","editor"]},{route:"editor",label:"Editor",roles:["owner","editor"]}]},{id:"studio",label:"Studio",defaultRoute:"notes",routes:[{route:"notes",label:"Notes",roles:["owner","editor"]},{route:"board",label:"Board"}]},{id:"manage",label:"Manage",defaultRoute:"forms",routes:[{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"designs",label:"Designs",roles:["owner","editor"]}]}],yu="vs-nav-group-last-",qa=(()=>{let e={};for(let t of $i)for(let s of t.routes)e[s.route]=t.id;return e})();function Wa(e){if(qa[e])return qa[e];let t=e.split("/")[0];return qa[t]?qa[t]:null}function $g(e){var i;let t=(i=D.get("user"))==null?void 0:i.role,s=e.routes.filter(a=>!a.roles||a.roles.includes(t));if(s.length===0)return e.defaultRoute;let n=localStorage.getItem(yu+e.id);return n&&s.find(r=>r.route===n)?n:s.find(a=>a.route===e.defaultRoute)?e.defaultRoute:s[0].route}function Sg(e){let t=Wa(e);if(t){let s=e.split("/")[0];localStorage.setItem(yu+t,s)}}var I0=$i.flatMap(e=>e.routes),Sl=["chat","editor"],Cg="vs-first-run-guide-dismissed",xu="vs-onboarding-draft-v1",wu="vs-prompt-recents-v1",ku="vs-prompt-pins-v1",_g=8,Lg=5,lu=5,Tg=5*1024*1024,Cl=["image/jpeg","image/png","image/gif","image/webp"],pn=[],bs=null,Tl=document.documentElement.dataset.demo==="true",Ig=document.documentElement.dataset.demoHideBanner==="true",Fs=Tl&&!Ig,Eu=window.matchMedia("(max-width: 767px)");function Fa(){return Eu.matches}var Mg={chat:"messageCircle",editor:"pencil",notes:"fileText",board:"layoutGrid",assets:"image",forms:"inbox",actions:"zap",designs:"palette","site-map":"globe"};function Ag(){var i;let e=D.get("route"),t=(i=D.get("user"))==null?void 0:i.role,s=Wa(e),n=s?$i.find(a=>a.id===s):null;if(!n)return[{route:"more",label:"More",icon:"ellipsis"}];let o=n.routes.filter(a=>(!a.roles||a.roles.includes(t))&&!Ml.includes(a.route)).map(a=>({route:a.route,label:a.label,icon:Mg[a.route]||"layoutGrid"}));return o.push({route:"more",label:"More",icon:"ellipsis"}),o}function Il(){var t;return((t=D.get("user"))==null?void 0:t.role)==="viewer"?"board":"chat"}var Ml=["chat","editor","site-map"];function Jt(){return Tl?(A("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function $u(){let e=D.get("user");return e&&e.role!=="viewer"}function Ga(){return $u()?!1:(A("You have read-only access.","warning"),!0)}function Bg(){let e=D.get("user");return e&&e.role==="owner"}window.IS_DEMO=Tl;window.demoGuard=Jt;window.canWrite=$u;window.viewerGuard=Ga;window.isOwner=Bg;var Su=document.getElementById("app");async function Cu(){var s,n;jl(),Md(),iu(),window.marked&&window.marked.use({renderer:{html(o){return y(typeof o=="string"?o:o.text)}}});let e=await Y.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){hu();return}D.batch(()=>{D.set("user",e.data.user),D.set("sessionToken",e.data.token),D.set("siteName",e.data.site_name||""),D.set("aiConfigured",e.data.ai_configured===!0)});let t=e.data.site_name;if(t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",o=>{var i;(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)&&(o.preventDefault(),o.returnValue="")}),It.beforeEach(async(o,i)=>{var a;for(let r of(window.__vsFlushCallbacks||new Map).values())if(await r()===!1)return!1;return i.startsWith("editor")&&!o.startsWith("editor")&&(a=window.__hasUnsavedEditorChanges)!=null&&a.call(window)?await uc():(i.startsWith("notes")&&!o.startsWith("notes")&&Uc(),i.startsWith("board")&&!o.startsWith("board")&&ep(),!0)}).on("chat",()=>st()).on("editor",()=>st()).on("pages",()=>st()).on("pages/:slug",()=>st()).on("assets",()=>st()).on("forms",()=>st()).on("forms/:formId",()=>st()).on("notes",()=>st()).on("board",()=>st()).on("actions",()=>st()).on("actions/:actionId",()=>st()).on("designs",()=>st()).on("site-map",()=>st()).on("settings",()=>st()).on("team",()=>st()).on("profile",()=>st()).onNotFound(()=>It.navigate(Il())),D.on("user",o=>{o||hu()}),Al(),Eu.addEventListener("change",()=>{st()}),Fa()){let i=(window.location.hash||"").replace(/^#\/?/,"");if(!i||Ml.includes(i)){let a=((n=D.get("user"))==null?void 0:n.role)==="viewer"?"board":"assets";window.location.hash=`#/${a}`}}It.start(),Kg()}async function Al(){try{let{ok:e,data:t}=await Y.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){D.set("pages",t.pages),Nu();let s=document.getElementById("chat-messages");(s==null?void 0:s.querySelector(".vs-empty-state"))&&(s.innerHTML=Dn(),Rn())}}catch{}}function st(){var l;let e=D.get("route"),t=Sl.includes(e);Sg(e),Bo()&&Gn(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s=Fa()&&Ml.includes(e),o=((l=D.get("user"))==null?void 0:l.role)==="viewer",i;s?i=Dg(e):e==="editor"?i=o?bi():nd():e==="notes"?i=o?bi():`<div class="h-full overflow-hidden">${qc()}</div>`:e==="board"?i=`<div class="h-full overflow-hidden">${el()}</div>`:e==="site-map"?i=o?bi():bu():t?i=o?bi():Rg():i=bi();let a=e==="chat"&&!Fa(),r=a?"bottom-[32px]":"bottom-0";Su.innerHTML=`
    ${Pg()}
    <div class="fixed top-[48px] ${r} left-0 right-0 overflow-hidden">
      ${i}
    </div>
    ${a?Yg():""}
    ${Jg()}
    ${Xg()}
    ${Qg()}
    ${$c()}
    ${ih()}
  `,dh(),Zg(),Lu(),e==="editor"&&!s&&!o&&od()}function Pg(){let e=D.get("route"),t=D.get("user"),s=D.get("theme"),n=t==null?void 0:t.role,o=Wa(e),i=$i.filter(l=>l.routes.some(p=>!p.roles||p.roles.includes(n))).map(l=>{let p=l.id===o,c=$g(l);return`
        <button class="vs-nav-group ${p?"vs-nav-group-active":""}"
                data-group="${l.id}"
                data-target="${c}">${l.label}</button>
      `}).join(""),a=o?$i.find(l=>l.id===o):null,r=a?a.routes.filter(l=>!l.roles||l.roles.includes(n)).map(l=>{let p=e===l.route||e.startsWith(l.route+"/");return`
            <a href="#/${l.route}"
               class="vs-nav-item ${p?"vs-nav-item-active":""}">
              ${l.label}${l.badge?`<span class="vs-nav-badge-beta">${y(l.badge)}</span>`:""}
            </a>
          `}).join(""):"";return`
    <header class="vs-topbar">
      <div class="vs-topbar-inner">
        <!-- Left: Logo + Group links (architecture) -->
        <div class="vs-topbar-left">
          <a href="#/${Il()}" class="vs-logo" title="${y(D.get("siteName")||"VoxelSite")}">
            <span class="vs-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
                <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
                <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
              </svg>
            </span>
          </a>
          <nav class="vs-nav-groups" aria-label="Workspace">${i}</nav>
          ${Fs?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${L.eye} Demo
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
            ${s==="dark"?L.sun:L.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${L.user}
              <span class="hidden sm:inline">${y((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${n!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${n==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${L.pencil} Edit Profile
              </a>
              ${n==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${L.users} Team Members
                </a>
              `:""}
              ${n==="owner"?`
                <a href="#/settings" id="btn-settings-nav" class="vs-dropdown-item">
                  ${L.settings} Settings
                </a>
              `:""}
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${L.logOut} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function Rg(){let e=D.get("sidebarWidth"),t=D.get("activeConversationId"),s=D.get("activePageScope"),n=_u(s),o=(()=>{if(s){let i=s;return i.endsWith(".php")||i.endsWith(".html")?i:i+".php"}return window.__vsCurrentPreviewPath||"index.php"})();return window.__vsCurrentPreviewPath=o,`
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
              ${L.fileText}
              <span id="scope-label" class="text-vs-text-secondary">${y(n)}</span>
              ${L.chevronDown}
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-new-chat"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="New conversation">
              ${L.newChat}
            </button>
            <button id="btn-toggle-history"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="Conversation history">
              ${L.history}
            </button>
          </div>
        </div>

        <!-- Conversation History Panel (hidden by default) -->
        <div id="conversation-history-panel" class="hidden border-b border-vs-border-subtle bg-vs-bg-surface overflow-y-auto shrink-0" style="max-height: 280px;">
          <div id="conversation-list" class="py-1">
            <div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>
          </div>
        </div>

        <div id="external-activity" aria-live="polite" class="shrink-0">${Tu()}</div>

        <!-- Chat Messages Area -->
        <div id="chat-messages" class="flex-1 overflow-y-auto px-5 py-6">
          ${Dn()}
        </div>

        <!-- Prompt Bar -->
        <div class="vs-prompt-area">
          <div class="vs-prompt-container">
            <input type="file" id="image-file-input" accept="image/jpeg,image/png,image/gif,image/webp" multiple class="hidden" />
            <div id="image-attachments" class="vs-image-attachments" hidden></div>
            <div id="website-ref-chip" class="vs-website-ref-chip" hidden>
              ${L.globe}
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
                  ${L.image}
                </button>
                <button id="btn-attach-website"
                  class="vs-prompt-attach-btn"
                  title="Use website as reference">
                  ${L.globe}
                </button>
                ${window.SpeechRecognition||window.webkitSpeechRecognition?`
                <button id="btn-voice-input"
                  class="vs-prompt-attach-btn"
                  title="Voice input">
                  ${L.mic}
                </button>`:""}
              </div>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (\u2318+Enter)">
                ${L.send}
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
            <span class="vs-prompt-hint text-2xs text-vs-text-ghost">\u2318+Enter to send \xB7 drop images to attach</span>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="vs-preview-panel-wrapper flex-1 h-full bg-vs-bg-well flex flex-col">
        <!-- Preview Toolbar (aligned with chat header) -->
        <div class="vs-panel-header vs-preview-toolbar">
          <div class="vs-device-toggle">
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${L.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${L.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${L.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Enter visual editor (V)">
              ${L.pencil} Edit
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${L.rotateCcw} Refresh
            </button>
            <button id="btn-save-design" class="vs-btn vs-btn-ghost vs-btn-xs" title="Save to Designs" disabled>
              ${L.save} Save
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${L.externalLink}
            </button>
          </div>
        </div>

        <!-- Preview Iframe -->
        <div id="preview-frame-container" class="vs-preview-frame" style="margin: 16px 20px 20px 20px;">
          <iframe id="preview-iframe" class="w-full h-full border-0" src="${Ce("api/router.php")}?_path=%2Fpreview&path=${encodeURIComponent(o)}"
            sandbox="allow-scripts allow-same-origin"
            data-voxelsite-preview
            title="Website preview"
            data-tooltip-skip></iframe>
        </div>
      </div>
    </div>
  `}function Dg(e){let t={editor:{name:"Code Editor",desc:"The code editor needs a wider screen for the file tree, editor pane, and preview."},chat:{name:"AI Chat",desc:"The AI conversation and live preview work side-by-side. That needs a wider screen."},"site-map":{name:"Site Control",desc:"The site graph and inspector panels need a wider screen to display properly."}},s=t[e]||t.chat,n=s.name,o=s.desc;return`
    <div class="h-full overflow-y-auto">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 18px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
          ${L.monitor}
        </div>
        <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 10px;">${n}</h1>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 6px; max-width: 280px; line-height: 1.6;">${o}</p>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0; max-width: 280px; line-height: 1.6;">Open Studio on a desktop or tablet to use this feature.</p>
      </div>
    </div>
  `}function bi(){let e=D.get("route"),t=D.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${qg(e,t)}
      </div>
    </div>
  `}function qg(e,t){let s=D.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return Lc();case"forms":return yc();case"forms/:formId":return xc(t.formId);case"actions":return fc();case"actions/:actionId":return hc(t.actionId);case"designs":return n==="owner"||n==="editor"?Ic():yi();case"site-map":return n==="owner"||n==="editor"?bu():yi();case"notes":return yi();case"board":return el();case"settings":return n==="owner"?pc():yi();case"team":return n==="owner"?Ec():yi();case"profile":return jg();default:return Ng("Not Found","This page doesn't exist.")}}function yi(){let e=Il();return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/${e}" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${e==="board"?"\u2190 Back to Board":"\u2190 Back to Chat"}</a>
    </div>
  `}function Ng(e,t){return`
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
  `}function Og(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return L[t[s]||"layoutGrid"]||L.layoutGrid}var kl=null,du=null,cu=null;function Hg(){requestAnimationFrame(()=>{var p,c;let e=document.querySelector(".vs-nav-routes"),t=e==null?void 0:e.querySelector(".vs-nav-pill"),s=e==null?void 0:e.querySelector(".vs-nav-item-active");if(!e||!t||!s)return;let n=((c=(p=document.querySelector(".vs-nav-group-active"))==null?void 0:p.dataset)==null?void 0:c.group)||"",o=e.getBoundingClientRect(),i=s.getBoundingClientRect(),a=i.left-o.left,r=i.width;kl===null||!(cu===n)?(t.style.transition="none",t.style.transform=`translateX(${a}px)`,t.style.width=`${r}px`,t.offsetHeight,t.style.transition=""):(t.style.transition="none",t.style.transform=`translateX(${kl}px)`,t.style.width=`${du}px`,t.offsetHeight,t.style.transition="",t.style.transform=`translateX(${a}px)`,t.style.width=`${r}px`),kl=a,du=r,cu=n})}function pu(e){It.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function jg(){let e=D.get("user")||{};return setTimeout(()=>Fg(),0),`
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
            <input type="text" id="profile-name" class="vs-input" value="${y(e.name||"")}" placeholder="Your name" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-email">Email</label>
            <input type="email" id="profile-email" class="vs-input" value="${y(e.email||"")}" placeholder="you@example.com" />
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
  `}function Fg(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var p,c,d,u;let o=(c=(p=document.getElementById("profile-name"))==null?void 0:p.value)==null?void 0:c.trim(),i=(u=(d=document.getElementById("profile-email"))==null?void 0:d.value)==null?void 0:u.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:r,data:l}=await Y.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(l!=null&&l.user)?(D.set("user",l.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>st(),800)):t&&(t.textContent=(r==null?void 0:r.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var p,c,d;let o=((p=document.getElementById("profile-current-pw"))==null?void 0:p.value)||"",i=((c=document.getElementById("profile-new-pw"))==null?void 0:c.value)||"",a=((d=document.getElementById("profile-confirm-pw"))==null?void 0:d.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:r,error:l}=await Y.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",r?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(l==null?void 0:l.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function zg(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),Ug()):e.classList.add("hidden")}async function Ug(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await Y.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${y((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=D.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let r=a.id===i,l=a.title||"Untitled conversation",p=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${r?"vs-conv-item-active":""}"
              data-conversation-id="${y(a.id)}">
        <span class="mt-0.5 shrink-0 ${r?"text-vs-accent":"text-vs-text-ghost"}">${L.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${r?"font-medium":""}" style="font-size: var(--text-sm);">${y(l)}</div>
          <div class="vs-conv-time mt-0.5">${p}</div>
        </div>
        ${r?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let r=a.dataset.conversationId;ki(r);let l=document.getElementById("conversation-history-panel");l&&l.classList.add("hidden")})})}async function ki(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await Y.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){D.set("activeConversationId",null),Ua(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=Dn(),Rn();return}let i=n.conversation,a=i.prompts||[];D.set("activeConversationId",e),Ua(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=Dn(),Rn();return}let r="",l=!1;for(let p of a){let{text:c,images:d,webRefUrl:u}=mh(p.user_prompt),v=d.length>0?`<div class="vs-msg-user-images">${d.map(b=>`<img src="${b}" class="vs-msg-user-image" />`).join("")}</div>`:"",f=u?`<div class="vs-msg-user-webref"><a href="${X(u)}" target="_blank" rel="noopener" title="${X(u)}">${L.globe} <span>${y(ko(u))}</span></a></div>`:"";if(r+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${v}
        ${f}
        ${c?`<div class="text-sm text-vs-text-primary leading-relaxed">${y(c)}</div>`:""}
      </div>
    `,p.ai_message||p.ai_response||p.files_modified){let b="",h=typeof p.ai_message=="string"&&p.ai_message.trim()!==""?p.ai_message:p.ai_response;h&&(b=ja(h));let g="";if(p.files_modified)try{let w=JSON.parse(p.files_modified);if(Array.isArray(w)&&w.length>0){let E=w.map($=>{let S=typeof $=="string"?$:$.path||$,_=typeof $=="object"&&$.action==="delete";return`<div class="vs-file-badge ${_?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${_?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${y(String(S))}</span>
              </div>`}).join(""),k=w.length;g=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${k} file${k!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${E}</div>
              </div>`}}catch{}let m="";if(p.evaluation_issues)try{let w=JSON.parse(p.evaluation_issues);if(Array.isArray(w)&&w.length>0){let E=O=>O==="error"?"#ef4444":O==="warning"?"#d97706":"#6b7280",k=O=>O==="error"?"rgba(239,68,68,0.1)":O==="warning"?"rgba(217,119,6,0.1)":"rgba(107,114,128,0.1)",$={error:0,warning:0,info:0};w.forEach(O=>{$[O.severity]=($[O.severity]||0)+1});let S=[];$.error&&S.push(`${$.error} error${$.error>1?"s":""}`),$.warning&&S.push(`${$.warning} warning${$.warning>1?"s":""}`),$.info&&S.push(`${$.info} suggestion${$.info>1?"s":""}`);let _=$.error>0?"error":$.warning>0?"warning":"info",q=_==="error"?"rgba(239,68,68,0.15)":_==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)",K=w.map(O=>`
              <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${E(O.severity)}; background: ${k(O.severity)};">${y(O.severity)}</span>
                  <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(O.category||"")}</span>
                  ${O.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(O.file)}${O.line?":"+O.line:""}</span>`:""}
                </div>
                <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(O.description||"")}</div>
                ${O.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(O.suggested_fix)}</div>`:""}
              </div>
            `).join("");m=`
              <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${q}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
                <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${E(_)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>Expert Review \xB7 ${S.join(", ")}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <div style="border-top: 1px solid var(--vs-border-subtle);">
                  <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
                  ${K}
                </div>
              </details>`}}catch{}let x=p.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${b}</div>
          ${g}
          ${m}
          ${x}
        </div>
      `}else if(p.status==="streaming"&&!p.interrupted){l=!0;let b=p.id,h=p.status_message||"Generation in progress...";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            ${y(h)}
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${b})"
              class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
          </div>
        </div>
      `}else p.status==="partial"?r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 text-sm rounded-lg" style="background: var(--vs-warning-dim, rgba(234,179,8,0.1)); color: var(--vs-warning, #eab308);">
            Generation was interrupted. Some files may be missing \u2014 send a follow-up prompt to complete the site.
          </div>
        </div>
      `:p.status==="error"&&(r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>
        </div>
      `);p.interrupted&&(r+=`
      <div class="mb-5 p-3 text-sm rounded-lg bg-vs-warning-dim text-vs-warning">
        Generation stopped before it finished. Repair the saved styles, or dismiss this interrupted request.
        <div class="flex gap-2 mt-2">
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-interrupted-action="repair" data-prompt-id="${p.id}">Repair styles</button>
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-interrupted-action="cancel" data-prompt-id="${p.id}">Dismiss</button>
        </div>
      </div>`)}t.innerHTML=r,t.querySelectorAll("[data-interrupted-action]").forEach(p=>p.addEventListener("click",async()=>{var f;let c=i.prompts.find(b=>String(b.id)===p.dataset.promptId);if(!c)return;let d=p.dataset.interruptedAction==="repair"?"/ai/repair-generation":"/ai/cancel-interrupted",u=Xe(d)||{prompt_id:c.id,version:c.version,draft_version:i.draft_version};p.disabled=!0;let v=await ye(d,u);v.ok?(p.dataset.interruptedAction==="repair"&&un(),ki(e)):(A(((f=v.error)==null?void 0:f.message)||"The interrupted request still needs attention.","error"),p.disabled=!1)})),t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),l&&!window.__vsResumedToastByConversation[e]&&(A("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),l||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(p){try{await Y.post("/ai/cancel-generation",{prompt_id:p})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",ki(e)},l&&D.get("activeConversationId")===e&&!D.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{D.get("activeConversationId")===e&&!D.get("aiStreaming")&&ki(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function Vg(){D.set("activeConversationId",null),Ua(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=Dn(),Rn());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function _u(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function za(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=_u(t)}function Ua(e){D.set("activePageScope",e||null),za(),Bo()&&Gn()}async function Wg(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>Te(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),Ie(t,s),t.addEventListener("keydown",c=>{c.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await Y.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${y((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let r=i.pages;if(!r.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${L.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let l='<div style="display: flex; flex-direction: column; gap: 2px;">';r.forEach(c=>{let d=!!Number(c.is_homepage),u=c.title||c.slug||c.path,v=c.path||c.slug+".php",f="/"+v.replace(/\.php$/,"").replace(/^index$/,""),b=f==="/"?"/":f,h=Og(c.slug),m=(window.__vsCurrentPreviewPath||"index.php")===v,x=c.size?(c.size/1024).toFixed(1)+" KB":"";l+=`
      <div class="vs-pages-modal-item ${m?"is-active":""}" data-slug="${y(c.slug)}" data-path="${y(v)}" data-title="${y(u)}" data-url="${y(b)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${h}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(u)}${d?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(v)}${x?" \xB7 "+x:""}
            </div>
          </div>
        </div>
        <div class="vs-pages-modal-actions" style="display: flex; align-items: center; gap: 2px; flex-shrink: 0;">
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="edit" title="Edit in Chat" style="width:28px;height:28px;">
            ${L.messageCircle}
          </button>
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="preview" title="Open in Preview" style="width:28px;height:28px;">
            ${L.eye}
          </button>
          ${d?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${L.trash2}
          </button>
          `}
        </div>
      </div>
    `}),l+="</div>",n.innerHTML=l;let p=t.querySelector(".vs-modal-desc");p&&(p.textContent=`${r.length} page${r.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(c=>{c.addEventListener("click",d=>{d.stopPropagation();let u=c.closest(".vs-pages-modal-item"),v=u.dataset.slug,f=u.dataset.path,b=u.dataset.title,h=u.dataset.url,g=c.dataset.action;if(g==="edit")Ua(v),s(),pu(`Edit the "${b}" page (${h}): `);else if(g==="preview"){let m=document.getElementById("preview-iframe");m?(Bo()&&Gn(),m.src=Ce("api/router.php")+"?_path=%2Fpreview&path="+encodeURIComponent(f)+"&t="+Date.now(),window.__vsCurrentPreviewPath=f,za(),s(),A(`Preview: ${b}`,"success")):window.open(Ce("api/router.php")+"?_path=%2Fpreview&path="+encodeURIComponent(f),"_blank")}else if(g==="delete"){s();let m=`Delete the "${b}" page (${h}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;pu(m)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(c=>{c.addEventListener("click",d=>{if(d.target.closest(".vs-pages-action"))return;let u=c.dataset.path,v=c.dataset.title,f=document.getElementById("preview-iframe");f?(f.src=Ce("api/router.php")+"?_path=%2Fpreview&path="+encodeURIComponent(u)+"&t="+Date.now(),window.__vsCurrentPreviewPath=u,za(),s(),A(`Preview: ${v}`,"success")):window.open(Ce("api/router.php")+"?_path=%2Fpreview&path="+encodeURIComponent(u),"_blank")})})}function Rn(){var e;document.querySelectorAll("[data-connect-ai-tool]").forEach(t=>t.addEventListener("click",()=>{window.__vsSettingsSection="settings-mcp"})),document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let s=document.getElementById("prompt-input");s&&(s.value=t.dataset.quickPrompt,s.dataset.actionType=t.dataset.actionType||"free_prompt",s.focus(),s.setSelectionRange(0,s.value.length),s.dispatchEvent(new Event("input",{bubbles:!0})))})}),(e=document.getElementById("chat-new-design"))==null||e.addEventListener("click",()=>{Jt()||Ga()||zr()})}function Gg(){var s;let e=((s=D.get("user"))==null?void 0:s.role)==="owner";return`<div class="vs-empty-state">
    <h2 class="vs-empty-title">${(D.get("pages")||[]).length>0?"Your draft is ready to work on":"Connect your AI tool"}</h2>
    <p class="vs-empty-description">Have the conversation in your AI tool. Review its website changes here in Studio.</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      ${e?'<a href="#/settings" data-connect-ai-tool class="vs-btn vs-btn-primary vs-btn-sm">Connect your AI tool</a>':'<p class="text-sm text-vs-text-secondary">Ask the owner to connect your AI tool.</p>'}
      <a href="#/editor" class="vs-btn vs-btn-secondary vs-btn-sm">Open editor</a>
    </div>
    <p class="text-xs text-vs-text-tertiary mt-6">Built-in AI is not configured.${e?' <a href="#/settings" class="underline">Configure it in Settings</a> whenever you want.':" The owner can configure it in Settings."}</p>
  </div>`}function Lu(){var o;let e=$o(D);["prompt-input","btn-send","btn-attach-image","btn-attach-website","btn-voice-input"].forEach(i=>{let a=document.getElementById(i);a&&(a.disabled=!e||i==="btn-send"&&D.get("aiStreaming"),e?a.removeAttribute("aria-describedby"):a.setAttribute("aria-describedby","built-in-ai-status"))});let t=document.getElementById("prompt-input");t&&(t.placeholder=e?"Describe what you want to build...":"Built-in AI is not configured");let s=document.querySelector(".vs-prompt-hint");s&&(s.hidden=!e);let n=document.getElementById("built-in-ai-status");!n&&t&&(n=document.createElement("p"),n.id="built-in-ai-status",n.className="text-xs text-vs-text-tertiary px-3 pb-2",(o=t.closest(".vs-prompt-container"))==null||o.appendChild(n)),n&&(n.hidden=e,n.textContent="Use your connected AI tool, or configure built-in AI in Settings.")}window.builtInAiAvailable=()=>$o(D);window.builtInAiGuard=()=>$o(D)?!1:(A("Built-in AI is not configured. Use your connected tool or open Settings.","info"),!0);D.on("aiConfigured",()=>{Lu();let e=document.getElementById("chat-messages");e!=null&&e.querySelector(".vs-empty-state")&&(e.innerHTML=Dn(),Rn())});function Tu(){let e=D.get("lastExternalRevision");if(!e)return"";let t=Array.isArray(e.affected_files)?e.affected_files:[];return`<details class="px-5 py-3 border-b border-vs-border-subtle text-xs text-vs-text-secondary">
    <summary class="cursor-pointer">Draft updated by ${y(e.source||"Connected AI tool")}</summary>
    <p class="mt-2 break-words">${y(e.description||"Saved website changes.")}</p>
    ${t.length?`<ul class="mt-2 pl-4 list-disc">${t.map(s=>`<li class="break-words">${y(s)}</li>`).join("")}</ul>`:""}
    <p class="text-vs-text-tertiary mt-2">${y(e.created_at||"")}</p>
  </details>`}function uu(e){D.set("lastExternalRevision",e.last_external_revision||null);let t=document.getElementById("external-activity");t&&(t.innerHTML=Tu())}function Kg(){window.__vsExternalActivityTimer&&clearInterval(window.__vsExternalActivityTimer);let e=sd({read:()=>Y.get("/settings/mcp/activity"),visible:()=>!document.hidden&&!!D.get("user"),busy:()=>!!D.get("aiStreaming"),initial:uu,changed:async t=>{var a,r,l,p,c,d,u;let s=(a=D.get("lastExternalRevision"))==null?void 0:a.id;uu(t);let n=await((l=(r=window.__vsEditorPage)==null?void 0:r.reconcileExternalDraft)==null?void 0:l.call(r,t)),o=await((c=(p=window.__vsCodeEditorModal)==null?void 0:p.reconcileExternalDraft)==null?void 0:c.call(p,t));if((d=n==null?void 0:n.failed)!=null&&d.length||(u=o==null?void 0:o.failed)!=null&&u.length)throw new Error("Draft files could not be refreshed.");Vi()||un(),await Promise.all([Al(),co(),ys({silent:!0})]);let i=t.last_external_revision;i&&i.id!==s&&A(`Draft updated by ${i.source||"Connected AI tool"}.`,"info")}});e.refresh(),window.__vsExternalActivityTimer=setInterval(()=>e.refresh(),15e3)}function Dn(){if(!$o(D))return Gg();let e=D.get("pages")||[],t=e.length>0,s=new Set(e.map(m=>m.slug)),n=[{label:"Quiet gallery",prompt:"Build my website so it feels like walking into a quiet gallery: lots of air, few words, one image at a time, nothing competing for attention. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Neighborhood cafe",prompt:"Build my website so it feels like a busy neighborhood cafe at nine in the morning: warm, close-up, a little imperfect, full of specific details. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Magazine spread",prompt:"Design my website like an editorial magazine spread: strong headline typography, a clear grid, generous margins, photography that gets room to breathe. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Well-run office",prompt:"Build my website so it feels like a well-run professional office: calm, precise, trustworthy, no decoration for its own sake. The kind of site a lawyer or an accountant would be proud of. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Workshop, not showroom",prompt:"Build my website so it feels like a working craft workshop rather than a showroom: honest materials, dark and warm, close-ups of the work, plain confident language. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Loud and joyful",prompt:"Build my website loud and joyful: big type, two strong colors, an energetic rhythm, a sense of humor in the copy. Confident, not corporate. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Boutique hotel",prompt:"Build my website so it feels like arriving at a small boutique hotel: unhurried, refined, warm and muted, elegant typography, a few beautiful photographs. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Product launch",prompt:"Build my website like a focused product launch page: one clear promise at the top, proof and details below, a single obvious action, dark and sharp. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Farm stand",prompt:"Build my website so it feels like a farm stand on a Saturday morning: earthy colors, natural textures, friendly hand-made character, straightforward information. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Record sleeve",prompt:"Design my website with the character of a classic record sleeve: bold retro typography, a limited palette, one strong image, nostalgia without looking dated. Decide the pages and sections from my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(m=>{let x=m.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(x)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],r=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],l=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],p=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],c=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],d,u,v;if(!t)u="What are we building?",v="Describe your website and watch it appear in the preview. Every detail is a conversation away.",d=El(n).slice(0,6);else{u="What\u2019s next?",v="Your site is live in preview. Pick a suggestion or describe any change you want.";let m=[...o,...o,...i,...a,...r,...l,...p,...c];d=El(m).slice(0,6);let x=new Set;if(d=d.filter(w=>x.has(w.label)?!1:(x.add(w.label),!0)),d.length<6){let w=El(m).filter(E=>!x.has(E.label));for(let E of w){if(d.length>=6)break;d.push(E),x.add(E.label)}}}let f=d.map(m=>`<button data-quick-prompt="${y(m.prompt).replace(/"/g,"&quot;")}" data-action-type="${m.type}"
      class="vs-style-card">${y(m.label)}</button>`).join(`
        `),b=D.get("user"),g=t&&((b==null?void 0:b.role)==="owner"||(b==null?void 0:b.role)==="editor")?`
      <div class="vs-animate-in vs-stagger-5" style="margin-top: 16px; text-align: center;">
        <button id="chat-new-design" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
          ${L.filePlus} Start a new design from scratch
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
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${u}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${v}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${f}
      </div>
      ${g}
    </div>
  `}function El(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function Yg(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <button id="btn-undo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Undo (\u2318Z)">
          ${L.undo} Undo
        </button>
        <button id="btn-redo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Redo (\u2318\u21E7Z)">
          ${L.redo} Redo
        </button>
        <button id="btn-preview-site" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${L.externalLink} Preview
        </button>
        <button id="btn-snapshot" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${L.camera} Snapshot
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-download" class="vs-btn vs-btn-ghost vs-btn-xs" title="Download your website">
          ${L.download} Download
        </button>
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <div class="vs-publish-split">
          <button id="btn-publish"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-main">
            ${L.publish} Publish
          </button>
          <button id="btn-publish-menu"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-chevron"
            title="More publish options">
            ${L.chevronUp}
          </button>
        </div>
      </div>
    </footer>
  `}function Jg(){let e=D.get("route");return`
    <nav class="vs-mobile-nav" aria-label="Mobile navigation">
      ${Ag().map(n=>{if(n.route==="more")return`
        <button class="vs-mobile-nav-item ${!Wa(e)?"vs-mobile-nav-item-active":""}" id="btn-mobile-more" aria-label="More" aria-haspopup="dialog" aria-controls="mobile-more-sheet" aria-expanded="false">
          ${L[n.icon]||L.layoutGrid}
          <span>${n.label}</span>
        </button>
      `;let o=e===n.route||e.startsWith(n.route+"/");return`
      <a href="#/${n.route}"
         class="vs-mobile-nav-item ${o?"vs-mobile-nav-item-active":""}"
         aria-label="${n.label}">
        ${L[n.icon]||L.layoutGrid}
        <span>${n.label}</span>
      </a>
    `}).join("")}
    </nav>
  `}function Xg(){let e=D.get("user"),t=e==null?void 0:e.role,s=D.get("theme"),n="";return t==="owner"&&(n+=`
      <a href="#/settings" class="vs-mobile-more-item" data-mobile-more-nav>
        ${L.settings} Settings
      </a>
    `),n+=`
    <a href="#/profile" class="vs-mobile-more-item" data-mobile-more-nav>
      ${L.pencil} Edit Profile
    </a>
  `,t==="owner"&&(n+=`
      <a href="#/team" class="vs-mobile-more-item" data-mobile-more-nav>
        ${L.users} Team Members
      </a>
    `),(t==="owner"||t==="editor")&&(n+=`
      <button id="btn-mobile-prompts" class="vs-mobile-more-item">
        ${L.zap} Prompts
      </button>
    `),n+=`
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-theme" class="vs-mobile-more-item">
      ${s==="dark"?L.sun:L.moon}
      ${s==="dark"?"Light mode":"Dark mode"}
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-publish" class="vs-mobile-more-item" style="color: var(--vs-accent-text); font-weight: 600;">
      ${L.publish} Publish
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-logout" class="vs-mobile-more-item" style="color: var(--vs-error);">
      ${L.logOut} Sign Out
    </button>
  `,`
    <div id="mobile-more-sheet" class="vs-mobile-more-sheet" aria-hidden="true" inert>
      <div class="vs-mobile-more-backdrop" id="mobile-more-backdrop"></div>
      <div class="vs-mobile-more-content" role="dialog" aria-modal="true" aria-labelledby="mobile-more-title" tabindex="-1">
        <div class="vs-mobile-more-header">
          <span id="mobile-more-title" class="vs-mobile-more-title">${y((e==null?void 0:e.name)||"Menu")}</span>
          <button id="btn-mobile-more-close" class="vs-mobile-more-close" aria-label="Close menu">${L.x}</button>
        </div>
        ${n}
      </div>
    </div>
  `}function Zg(){if(!Fa())return;let e=document.getElementById("btn-mobile-more"),t=document.getElementById("mobile-more-sheet"),s=document.getElementById("mobile-more-backdrop"),n=document.getElementById("btn-mobile-more-close"),o;function i(){!t||o||(t.inert=!1,t.removeAttribute("aria-hidden"),t.classList.add("vs-sheet-open"),e==null||e.setAttribute("aria-expanded","true"),o=fa(t.querySelector(".vs-mobile-more-content"),{initialFocus:n,returnFocus:e,onEscape:a}))}function a(){o==null||o(),o=null,e==null||e.setAttribute("aria-expanded","false"),t&&(t.inert=!0,t.setAttribute("aria-hidden","true")),t==null||t.classList.remove("vs-sheet-open")}e&&e.addEventListener("click",i),s&&s.addEventListener("click",a),n&&n.addEventListener("click",a),document.querySelectorAll("[data-mobile-more-nav]").forEach(d=>{d.addEventListener("click",a)});let r=document.getElementById("btn-mobile-prompts");r&&r.addEventListener("click",()=>{a(),_l()});let l=document.getElementById("btn-mobile-theme");l&&l.addEventListener("click",()=>{var d;Pi(),a(),st(),(d=document.getElementById("btn-mobile-more"))==null||d.focus()});let p=document.getElementById("btn-mobile-publish");p&&p.addEventListener("click",()=>{var d;a(),!Jt()&&((d=document.getElementById("btn-publish"))==null||d.click())});let c=document.getElementById("btn-mobile-logout");c&&c.addEventListener("click",async()=>{a(),await Y.post("/auth/logout"),window.location.href=Ce()})}function Qg(){return`
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
  `}function Iu(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>Pu(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function Mu(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function Au(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function Ka(){return Mu(ku)}function Bl(){return Mu(wu)}function Bu(e){let t=Ka(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];Au(ku,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};Ei(n.query||"",n.activeIndex||0)}function eh(e){let t=Bl().filter(n=>n!==e),s=[e,...t].slice(0,8);Au(wu,s)}function Pu(e){if(D.get("route")!=="chat"){It.navigate("chat"),setTimeout(()=>Pu(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function Ru(e,t="free_prompt",s=!1){if(D.get("route")!=="chat"){It.navigate("chat"),setTimeout(()=>Ru(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?Va():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function xi(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function _l(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),Ei(e,0))}function wi(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function th(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function sh(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=th(s,n);return i===null?null:70+i}function nh(e){let t=(e||"").trim().toLowerCase(),s=Iu(),n=Ka(),o=Bl();return s.map(i=>{let a=sh(t,i);if(a===null)return null;let r=n.includes(i.id)?-12:0,l=o.includes(i.id)?-8:0;return{...i,__score:a+r+l}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function oh(e){let t=Iu(),s=Object.fromEntries(t.map(d=>[d.id,d])),n=(e||"").trim(),o=[];if(n!==""){let d=nh(e).slice(0,18);return d.length>0&&o.push({title:"Results",commands:d}),o}let i=Bl(),a=Ka(),r=new Set,l=i.map(d=>s[d]).filter(Boolean);l.length>0&&(o.push({title:"Recent",commands:l}),l.forEach(d=>r.add(d.id)));let p=a.map(d=>s[d]).filter(d=>d&&!r.has(d.id));return p.length>0&&(o.push({title:"Pinned",commands:p}),p.forEach(d=>r.add(d.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(d=>{let u=t.filter(v=>v.group===d&&!r.has(v.id));u.length>0&&(o.push({title:d,commands:u}),u.forEach(v=>r.add(v.id)))}),o}function Ei(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=oh(e),o=n.flatMap(p=>p.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=Ka();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let r="",l=0;n.forEach(p=>{r+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${y(p.title)}</div>`,p.commands.forEach(c=>{let d=l===i,u=a.includes(c.id);r+=`
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${l}"
            class="vs-cmd-item ${d?"vs-cmd-item-active":""}">
            <div class="min-w-0">
              <div class="vs-cmd-item-title">${y(c.title)}</div>
              <div class="vs-cmd-item-desc">${y(c.prompt?c.prompt.substring(0,80)+(c.prompt.length>80?"\u2026":""):c.meta)}</div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${y(c.id)}"
            class="vs-cmd-pin ${u?"vs-cmd-pin-active":""}"
            title="${u?"Unpin":"Pin"}">
            ${u?"\u2605":"\u2606"}
          </button>
        </div>
      `,l+=1})}),s.innerHTML=r,s.querySelectorAll("[data-command-index]").forEach(p=>{p.addEventListener("click",()=>{let c=parseInt(p.dataset.commandIndex||"0",10);Du(c)})}),s.querySelectorAll("[data-command-pin]").forEach(p=>{p.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let d=p.dataset.commandPin;d&&Bu(d)})})}function Du(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(eh(n.id),wi(),Promise.resolve(n.run()).catch(()=>{}))}function ih(){return`
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
  `}function Na(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function Pn(){try{let e=localStorage.getItem(xu);if(!e)return Na();let t=JSON.parse(e);return{...Na(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Na().pages}}catch{return Na()}}function qu(e){try{localStorage.setItem(xu,JSON.stringify(e))}catch{}}function Ha(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function vu(){let e=window.__vsOnboarding||{step:1,draft:Pn()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||Pn(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),r=document.getElementById("btn-onboarding-next"),l=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!r||!l)return;let p=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${p[t-1]}`,n.innerHTML=p.map((c,d)=>{let u=d+1===t,v=d+1<t;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${u?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":v?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${d+1}. ${y(c)}</div>
      </div>
    `}).join(""),t===1)i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Business Name</label>
          <input id="onboard-business-name" type="text" class="vs-input w-full" value="${y(s.business_name)}" placeholder="e.g. Harbor & Pine Studio">
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Business Type</label>
          <input id="onboard-business-type" type="text" class="vs-input w-full" value="${y(s.business_type)}" placeholder="e.g. interior design studio">
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Core Offer</label>
          <textarea id="onboard-offer" class="vs-textarea w-full" rows="4" placeholder="What do you sell or provide?">${y(s.offer)}</textarea>
        </div>
      </div>
    `;else if(t===2)i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Target Audience</label>
          <textarea id="onboard-audience" class="vs-textarea w-full" rows="3" placeholder="Who should this website attract?">${y(s.audience)}</textarea>
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
    `;else{let c=[{key:"home",label:"Home"},{key:"about",label:"About"},{key:"services",label:"Services"},{key:"portfolio",label:"Portfolio"},{key:"pricing",label:"Pricing"},{key:"blog",label:"Blog"},{key:"contact",label:"Contact"}];i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-2">Pages to Create</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${c.map(d=>`
              <label class="flex items-center gap-2 text-xs text-vs-text-secondary rounded-lg border border-vs-border-subtle px-2.5 py-2">
                <input type="checkbox" class="accent-[var(--vs-accent)]" data-onboard-page="${d.key}" ${s.pages.includes(d.key)?"checked":""}>
                <span>${d.label}</span>
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
    `}a.disabled=t===1,r.classList.toggle("hidden",t===3),l.classList.toggle("hidden",t!==3),ah()}function ah(){let e=window.__vsOnboarding||{draft:Pn()},t=()=>{var n,o,i,a,r,l,p,c,d,u,v;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((l=(r=document.getElementById("onboard-offer"))==null?void 0:r.value)==null?void 0:l.trim())||e.draft.offer||"",audience:((c=(p=document.getElementById("onboard-audience"))==null?void 0:p.value)==null?void 0:c.trim())||e.draft.audience||"",style:((d=document.getElementById("onboard-style"))==null?void 0:d.value)||e.draft.style||"modern-minimal",tone:((u=document.getElementById("onboard-tone"))==null?void 0:u.value)||e.draft.tone||"confident",content_mode:((v=document.getElementById("onboard-content-mode"))==null?void 0:v.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(f=>f.checked).map(f=>f.dataset.onboardPage).filter(Boolean)),qu(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function rh(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function lh(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>Ha());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>Ha());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Pn()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,vu()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Pn()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,vu()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:Pn()}).draft||Pn(),r=rh(a);try{localStorage.setItem(Cg,"1")}catch{}qu(a),Ha(),Ru(r,"create_site",!0)})}function dh(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var B,P;let C=Pi()==="light";e.innerHTML=C?L.sun:L.moon,e.title=C?"Switch to dark":"Switch to light",window.__vsEditorPage&&((B=window.monaco)!=null&&B.editor)&&window.monaco.editor.setTheme(gn()),document.getElementById("vs-code-editor-overlay")&&((P=window.monaco)!=null&&P.editor)&&window.monaco.editor.setTheme(gn())}),document.querySelectorAll(".vs-nav-group").forEach(T=>{T.addEventListener("click",()=>{let C=T.dataset.target;C&&It.navigate(C)})}),Hg();let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{_l()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>wi());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{Ei(n.value,0)}),n.addEventListener("keydown",T=>{let C=window.__vsCommandPalette||{commands:[],activeIndex:0};if((T.metaKey||T.ctrlKey)&&T.key.toLowerCase()==="p"){T.preventDefault();let j=C.commands[C.activeIndex];j&&Bu(j.id);return}if(T.key==="ArrowDown"){T.preventDefault(),Ei(n.value,C.activeIndex+1);return}if(T.key==="ArrowUp"){T.preventDefault(),Ei(n.value,C.activeIndex-1);return}if(T.key==="Enter"){T.preventDefault(),Du();return}T.key==="Escape"&&(T.preventDefault(),wi())})),lh();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",T=>{T.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",T=>{!i.classList.contains("hidden")&&!i.contains(T.target)&&T.target!==o&&!o.contains(T.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav","btn-settings-nav"].forEach(T=>{let C=document.getElementById(T);C&&i&&C.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await Y.post("/auth/logout"),window.location.href=Ce()});let r=document.getElementById("btn-undo-status");r&&r.addEventListener("click",()=>{Jt()||fu()});let l=document.getElementById("btn-redo-status");l&&l.addEventListener("click",()=>{Jt()||gu()});let p=document.getElementById("btn-preview-site");p&&p.addEventListener("click",()=>{window.open(Ce("api/router.php")+"?_path=%2Fpreview&path=index.php","_blank")});let c=document.getElementById("btn-snapshot");c&&c.addEventListener("click",async()=>{var B;if(Jt())return;c.disabled=!0,js("Creating snapshot...");let{ok:T,data:C,error:j}=await Y.post("/snapshots",{type:"manual",label:"Manual snapshot"});c.disabled=!1,js(T?`\u2713 Snapshot saved (${((B=C==null?void 0:C.snapshot)==null?void 0:B.file_count)||0} files)`:"\u2717 "+((j==null?void 0:j.message)||"Snapshot failed"),T?"success":"error",4e3)});let d=document.getElementById("btn-download");d&&((async()=>{var B;let{ok:T,data:C}=await Y.get("/settings");((B=C==null?void 0:C.settings)==null?void 0:B.last_published_at)||(d.disabled=!0,d.title="Publish your site first to enable download.",d.classList.add("opacity-40"))})(),d.addEventListener("click",()=>{d.disabled||Jt()||uh()}));let u=document.getElementById("btn-publish");u&&(lo(),u.addEventListener("click",async()=>{var ze,gt,At,R,N,te;let T=Ci();if(T.publishing)return;if(T.hasChanges===!1){A("No unpublished changes to publish.","warning");return}let C=T.counts||{added:0,modified:0,deleted:0},j=Number(C.added||0)+Number(C.modified||0)+Number(C.deleted||0),B=localStorage.getItem("vs_publish_snapshot"),H=await ph({totalChanges:j,snapshotDefault:B===null?!0:B!=="false"});if(!H||Jt())return;localStorage.setItem("vs_publish_snapshot",String(H.createSnapshot)),T.publishing=!0,lo(),js("Publishing...");let U;try{U=sessionStorage.getItem("vs_pending_publish")}catch{}U||(U=`publish_${crypto.randomUUID().replaceAll("-","")}`);try{sessionStorage.setItem("vs_pending_publish",U)}catch{}let ee=await Y.post("/publish",{create_snapshot:H.createSnapshot,operation_id:U}),pe=0;for(;ee.ok&&((gt=(ze=ee.data)==null?void 0:ze.operation)==null?void 0:gt.status)==="applying"&&pe++<100;)js(`Publishing... checkpoint ${ee.data.operation.checkpoint}`),ee=await Y.post("/publish",{create_snapshot:H.createSnapshot,operation_id:U,checkpoint:ee.data.operation.checkpoint});let{data:fe,error:Oe}=ee,Je=ee.ok&&((At=fe==null?void 0:fe.operation)==null?void 0:At.status)==="succeeded";if(Je||["failed_restored","expired","cancelled"].includes((R=fe==null?void 0:fe.operation)==null?void 0:R.status))try{sessionStorage.removeItem("vs_pending_publish")}catch{}if(T.publishing=!1,Je){let se=((N=fe==null?void 0:fe.published)==null?void 0:N.length)||0,Ee=((te=fe==null?void 0:fe.removed)==null?void 0:te.length)||0,Q=Ee>0?`Published ${se} file(s), removed ${Ee} stale file(s).`:`Published ${se} file(s).`;A(Q,"success"),js(`\u2713 ${se} published, ${Ee} removed`,"success",5e3),D.set("previewDirty",!1),ys({silent:!0}),window.open("/","_blank")}else{let se=(Oe==null?void 0:Oe.message)||"Publication is paused. Click Publish to resume its retained progress.";A(se,"error"),js("\u2717 "+se,"error",5e3),ys({silent:!0})}}));let v=document.getElementById("btn-publish-menu");v&&v.addEventListener("click",T=>{T.stopPropagation();let C=document.querySelector(".vs-publish-dropup");if(C){C.remove();return}let j=document.createElement("div");j.className="vs-publish-dropup",j.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${L.cloudOff} Unpublish
        </button>
      `;let B=v.closest(".vs-publish-split");B?B.appendChild(j):v.parentElement.appendChild(j),j.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(j.remove(),!await Ae({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0})||Jt())return;js("Unpublishing...");let{ok:ee,data:pe,error:fe}=await ye("/publish/unpublish");ee?(A("Unpublished. Default page restored.","success"),js("\u2713 Site unpublished","success",5e3),ys({silent:!0})):(A((fe==null?void 0:fe.message)||"Unpublish failed.","error"),js("\u2717 "+((fe==null?void 0:fe.message)||"Unpublish failed"),"error",5e3))});let P=U=>{!j.contains(U.target)&&U.target!==v&&(j.remove(),document.removeEventListener("click",P))};setTimeout(()=>document.addEventListener("click",P),0);let H=U=>{U.key==="Escape"&&(j.remove(),document.removeEventListener("keydown",H),document.removeEventListener("click",P))};document.addEventListener("keydown",H)});let f=document.getElementById("resize-handle"),b=document.getElementById("conversation-panel");if(f&&b){let T,C;f.addEventListener("mousedown",j=>{j.preventDefault(),T=j.clientX,C=b.offsetWidth;let B=H=>{let U=H.clientX-T,ee=Math.min(580,Math.max(340,C+U));b.style.width=`${ee}px`,D.set("sidebarWidth",ee)},P=()=>{document.removeEventListener("mousemove",B),document.removeEventListener("mouseup",P)};document.addEventListener("mousemove",B),document.addEventListener("mouseup",P)})}let h=document.getElementById("prompt-input");h&&(h.addEventListener("input",()=>{h.style.height="auto",h.style.height=Math.min(200,h.scrollHeight)+"px"}),h.addEventListener("keydown",T=>{T.key==="Enter"&&(T.metaKey||T.ctrlKey)&&(T.preventDefault(),Va())}));let g=document.getElementById("btn-send");g&&g.addEventListener("click",Va);let m=document.getElementById("btn-attach-image"),x=document.getElementById("image-file-input");m&&x&&(m.addEventListener("click",()=>x.click()),x.addEventListener("change",()=>{x.files.length>0&&($l(x.files),x.value="")})),hh();let w=document.getElementById("btn-voice-input");if(w){let T=window.SpeechRecognition||window.webkitSpeechRecognition,C=null,j=!1,B=()=>{j=!1,w.classList.remove("is-recording"),w.innerHTML=L.mic};w.addEventListener("click",()=>{if(j){C&&C.stop();return}if(location.protocol!=="https:"&&location.hostname!=="localhost"&&location.hostname!=="127.0.0.1"){A("Voice input requires HTTPS","warning");return}C=new T,C.continuous=!1,C.interimResults=!1,C.lang=navigator.language||"en-US",C.onstart=()=>{j=!0,w.classList.add("is-recording")},C.onresult=P=>{var pe,fe;let H=(fe=(pe=P.results[0])==null?void 0:pe[0])==null?void 0:fe.transcript;if(!H)return;let U=document.getElementById("prompt-input");if(!U)return;let ee=U.value;U.value=ee+(ee.length>0?" ":"")+H,U.dispatchEvent(new Event("input",{bubbles:!0})),U.style.height="auto",U.style.height=U.scrollHeight+"px",U.focus()},C.onerror=P=>{if(P.error==="no-speech")return;let U={"audio-capture":"No microphone found","not-allowed":"Microphone permission denied",network:"Speech service unavailable",aborted:null}[P.error];U?A(U,"warning"):U!==null&&console.warn("[VoxelSite] Voice input error:",P.error)},C.onend=()=>{B();let P=document.getElementById("prompt-input");P&&P.focus()};try{C.start()}catch(P){console.warn("[VoxelSite] Voice input failed to start:",P.message),A("Voice input unavailable","warning"),B()}})}let E=document.querySelector(".vs-prompt-area");E&&(E.addEventListener("dragover",T=>{T.preventDefault(),T.stopPropagation(),E.classList.add("vs-drag-over")}),E.addEventListener("dragleave",T=>{T.preventDefault(),T.stopPropagation(),E.classList.remove("vs-drag-over")}),E.addEventListener("drop",T=>{T.preventDefault(),T.stopPropagation(),E.classList.remove("vs-drag-over");let C=Array.from(T.dataTransfer.files).filter(j=>Cl.includes(j.type));C.length>0&&$l(C)})),h&&h.addEventListener("paste",T=>{var B;let j=Array.from(((B=T.clipboardData)==null?void 0:B.items)||[]).filter(P=>P.kind==="file"&&Cl.includes(P.type));if(j.length>0){T.preventDefault();let P=j.map(H=>H.getAsFile()).filter(Boolean);$l(P)}}),Rn();let k=document.getElementById("btn-new-chat");k&&k.addEventListener("click",Vg);let $=document.getElementById("btn-scope-selector");$&&$.addEventListener("click",()=>{Wg()});let S=document.getElementById("btn-toggle-history");S&&S.addEventListener("click",zg);let _=document.getElementById("btn-visual-editor");_&&_.addEventListener("click",()=>Sr());let q=document.getElementById("btn-refresh-preview");q&&q.addEventListener("click",()=>un());let K=document.getElementById("btn-save-design");if(K){K.addEventListener("click",()=>{Jt()||Ga()||Vo()});let T=()=>{let C=D.get("pages")||[];K.disabled=C.length===0};T(),D.on("pages",T)}let O=document.querySelectorAll("[data-device]"),W=document.getElementById("preview-frame-container");if(O.length&&W){let T={desktop:"100%",tablet:"768px",mobile:"375px"};O.forEach(C=>{C.addEventListener("click",()=>{let j=C.dataset.device,B=T[j]||"100%";j==="desktop"?(W.style.maxWidth="",W.style.width="",W.style.alignSelf=""):(W.style.maxWidth=B,W.style.width="100%",W.style.alignSelf="center"),O.forEach(P=>{P.classList.remove("vs-device-btn-active"),P.dataset.device===j&&P.classList.add("vs-device-btn-active")})})})}let G=document.getElementById("btn-external-preview");G&&G.addEventListener("click",()=>{let T=window.__vsCurrentPreviewPath||"index.php";window.open(Ce("api/router.php")+"?_path=%2Fpreview&path="+encodeURIComponent(T),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",T=>{var j,B;let C=(B=(j=T.target)==null?void 0:j.closest)==null?void 0:B.call(j,"[data-code-toggle]");C&&(T.preventDefault(),yh(C))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",T=>{if((T.metaKey||T.ctrlKey)&&T.key==="k"){T.preventDefault(),xi()?wi():_l();return}if(T.key==="Escape"&&xi()){T.preventDefault(),wi();return}if(T.key==="Escape"&&Oa()){T.preventDefault(),Ha();return}if((T.metaKey||T.ctrlKey)&&T.key==="z"&&!T.shiftKey){if(xi()||Oa()||D.get("route")!=="chat")return;let C=document.activeElement;if(C&&(C.tagName==="INPUT"||C.tagName==="TEXTAREA"))return;T.preventDefault(),fu()}if((T.metaKey||T.ctrlKey)&&T.key==="z"&&T.shiftKey){if(xi()||Oa()||D.get("route")!=="chat")return;let C=document.activeElement;if(C&&(C.tagName==="INPUT"||C.tagName==="TEXTAREA"))return;T.preventDefault(),gu()}if(T.key==="v"&&!T.metaKey&&!T.ctrlKey&&!T.altKey&&!T.shiftKey){if(xi()||Oa())return;let C=document.activeElement;if(C&&(C.tagName==="INPUT"||C.tagName==="TEXTAREA"||C.isContentEditable))return;let j=D.get("route");if(!Sl.includes(j))return;T.preventDefault(),Sr()}if(T.key==="Escape"&&Bo()){if(T.preventDefault(),Wi())return;if(Vi()){Cr();return}if(Td()){Po();return}Gn();return}}));let J=D.get("route");if(Sl.includes(J))try{let T=D.get("activeConversationId"),C=localStorage.getItem("vs-active-conversation"),j=T||C,B=document.getElementById("chat-messages"),P=B==null?void 0:B.querySelector(".vs-empty-state");j&&!D.get("aiStreaming")?(T||D.set("activeConversationId",j),P&&ki(j)):j||B&&B.children.length===0&&(B.innerHTML=Dn(),Rn())}catch{}co(),vh()}function ch(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=D.get("pages"),s=!t||t.length===0,n=s?"Building your site":"Applying your changes",o=s?"Generating a new website can take up to 10 minutes.<br>Please be patient while the AI works.":"Small changes can take a minute, larger updates can take up to 10 minutes.",i=document.createElement("div");i.className="vs-generating-overlay",i.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">${n}</div>
    <div class="vs-gen-subtitle">${o}</div>
    <div class="vs-gen-note">Keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-metrics" id="overlay-metrics"></div>
  `,e.appendChild(i)}function mu(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function un(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src=Ce("api/router.php")+"?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=un;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),za())}));function Ll(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{un()}}window.sendPreviewMessage=Ll;async function fu(){var t;Po();let e=await ye("/revisions/undo");e.ok?(setTimeout(()=>un(),300),await co(),ys({silent:!0})):A(((t=e.error)==null?void 0:t.message)||"History change needs attention.","error")}async function gu(){var t;Po();let e=await ye("/revisions/redo");e.ok?(setTimeout(()=>un(),300),await co(),ys({silent:!0})):A(((t=e.error)==null?void 0:t.message)||"History change needs attention.","error")}async function co(){let{ok:e,data:t}=await Y.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!s,r.title=o,r.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!n,r.title=i,r.classList.toggle("opacity-40",!n))})}function Ci(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function Si(e,t){let s=document.getElementById("vs-global-status");if(!s)return;let n=s.querySelector(".vs-global-status-dot"),o=s.querySelector(".vs-global-status-text");if(!(!n||!o))switch(window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s.className="vs-global-status",e){case"saving":s.classList.add("vs-global-status--active","vs-global-status--saving"),o.textContent=t||"Saving\u2026";break;case"saved":s.classList.add("vs-global-status--active","vs-global-status--saved"),o.textContent=t||"Saved",window.__vsStatusResetTimer=setTimeout(()=>{Si("idle")},2e3);break;case"loading":s.classList.add("vs-global-status--active","vs-global-status--loading"),o.textContent=t||"Loading\u2026";break;case"error":s.classList.add("vs-global-status--active","vs-global-status--error"),o.textContent=t||"Error",window.__vsStatusResetTimer=setTimeout(()=>{Si("idle")},4e3);break;case"idle":default:o.textContent="";break}}function js(e,t="neutral",s=0){Si(t==="success"?"saved":t==="error"?"error":"idle",e),s>0&&(window.__vsStatusResetTimer&&clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=setTimeout(()=>{Si("idle")},s))}window.__vsSetGlobalStatus=Si;function lo(){let e=Ci(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=r=>{s&&(r?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${L.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${L.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${L.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${L.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let r=a===1?"":"s";n.textContent=`${a} unpublished change${r}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${L.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=lo;function ph({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var l,p;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Publish Website</h2>
          <p class="vs-modal-desc">${y(o)}</p>
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
    `;let a=c=>{c.key==="Escape"&&(c.preventDefault(),r(null))},r=c=>{document.removeEventListener("keydown",a),Te(i),s(c)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),Ie(i,()=>r(null)),(l=document.getElementById("vs-confirm-cancel"))==null||l.addEventListener("click",()=>r(null)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>{let c=document.getElementById("vs-publish-snapshot-cb");r({createSnapshot:c?c.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var c;return(c=document.getElementById("vs-confirm-ok"))==null?void 0:c.focus()},220)})}function uh(){var h;let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=Ci().hasChanges===!0?`
    <div class="vs-download-warning">
      <div class="vs-download-warning-content">
        ${L.alertTriangle}
        <span>You have unpublished changes. This export reflects your last published version.</span>
      </div>
      <a href="#" id="vs-download-publish-link" class="vs-download-publish-link">Publish first \u2192</a>
    </div>
  `:"",o=document.createElement("div");o.id="vs-download-modal-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header" style="position: relative;">
        <button id="vs-download-close" class="vs-download-close-btn" type="button" title="Close">
          ${L.x}
        </button>
        <h2 class="vs-modal-title">Download Your Website</h2>
        <p class="vs-modal-desc">Take your files anywhere. No VoxelSite required to run them.</p>
      </div>
      <div class="vs-modal-body" style="padding-top: 16px;">
        ${n}
        <p id="vs-download-version" class="text-xs text-vs-text-tertiary mb-3 break-all" role="status">Loading the published version\u2026</p>
        <div class="vs-download-cards" id="vs-download-cards">
          <button type="button" class="vs-download-card is-selected" data-format="php">
            <div class="vs-download-card-icon">
              ${L.fileCode}
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
              ${L.globe}
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
        <button id="vs-download-action" class="vs-btn vs-btn-primary" type="button" disabled style="width: 100%; justify-content: center; height: 42px; font-size: 14px; font-weight: 600;">
          ${L.download} Download PHP
        </button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=g=>{g.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),Te(o)};o.querySelector("#vs-download-close").addEventListener("click",a),Ie(o,a),document.addEventListener("keydown",i);let r=o.querySelector("#vs-download-publish-link");r&&r.addEventListener("click",g=>{g.preventDefault(),a(),setTimeout(()=>{let m=document.getElementById("btn-publish");m&&!m.disabled&&m.click()},400)});let l=o.querySelectorAll(".vs-download-card"),p=o.querySelector("#vs-download-action"),c="php",d=null,u=(h=D.get("user"))==null?void 0:h.id,v=o.querySelector("#vs-download-version"),f=()=>{let g=wl(c,u,sessionStorage);v.textContent=`${g?"Retrying saved download":"Published version"}: ${(g==null?void 0:g.version)||d}`};Y.get("/export").then(g=>{var m,x;if(!(!o.isConnected||((m=D.get("user"))==null?void 0:m.id)!==u)){if(!g.ok){v.textContent=((x=g.error)==null?void 0:x.message)||"The published version could not be loaded. Open Download again.";return}d=g.data.version,f(),p.disabled=!1}}).catch(()=>{v.textContent="The published version could not be loaded. Open Download again."}),l.forEach(g=>{g.addEventListener("click",()=>{if(g.classList.contains("is-loading"))return;l.forEach(x=>x.classList.remove("is-selected")),g.classList.add("is-selected"),c=g.dataset.format;let m=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${L.download} ${m}`,d&&f()})});let b=!1;p.addEventListener("click",async()=>{if(!(b||!d)){b=!0,p.disabled=!0,p.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',l.forEach(g=>g.style.pointerEvents="none");try{let g=D.get("sessionToken"),m={"Content-Type":"application/json",Accept:"application/zip"};g&&(m["X-VS-Token"]=g);let x=await ru(c,d,u,S=>fetch(Ce("api/router.php")+"?_path=%2Fexport",{method:"POST",headers:m,credentials:"same-origin",body:JSON.stringify(S)}),sessionStorage,()=>{var S;return(S=D.get("user"))==null?void 0:S.id});if(!x.ok){A(x.error.message,"error");return}let{blob:w,filename:E}=x.data,k=URL.createObjectURL(w),$=document.createElement("a");$.href=k,$.download=E,$.style.display="none",document.body.appendChild($),$.click(),setTimeout(()=>{URL.revokeObjectURL(k),$.remove()},100),A(`\u2713 ${E} downloaded`,"success")}catch{A("Download failed. Retry to retrieve the same archive.","error")}finally{b=!1,p.disabled=!1;let g=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${L.download} ${g}`,l.forEach(m=>m.style.pointerEvents=""),f()}}})}async function ys({silent:e=!1}={}){let t=Ci();if(t.publishing){lo();return}t.checking=!0,e||lo();let{ok:s,data:n,error:o}=await Y.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",lo()}window.refreshPublishState=ys;function vh(){let e=Ci();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),ys({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||ys({silent:!0})},15e3)}function mh(e){if(!e)return{text:"",images:[],webRefUrl:null};let t=null,s=e;s.includes("[vx-ref:")&&(s=s.replace(/\[vx-ref:(https?:\/\/[^\]]+)\]/g,(o,i)=>(t=i,"")));let n=[];return s.includes("[vx-img:")&&(s=s.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(o,i)=>(n.push(i),""))),{text:s.trim(),images:n,webRefUrl:t}}function $l(e){let t=Array.from(e),s=lu-pn.length;if(s<=0){A(`Maximum ${lu} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&A(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!Cl.includes(o.type)){A(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>Tg){A(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,r=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!r)return;let l=new Image;l.onload=()=>{let p=fh(l,120);pn.push({media_type:r[1],data:r[2],name:o.name,preview:a,thumbnail:p}),Pl()},l.src=a},i.readAsDataURL(o)})}function fh(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function Pl(){let e=document.getElementById("image-attachments");if(e){if(pn.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=pn.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${y(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);pn.splice(n,1),Pl()})})}}function gh(){pn=[],Pl()}function Nu(){let t=(D.get("pages")||[]).length>0,s=document.getElementById("website-ref-restyle-options"),n=document.getElementById("website-ref-helper"),o=document.getElementById("btn-website-ref-confirm");s&&(s.hidden=!t),n&&(n.textContent=t?"Use another website as design reference for your site.":"Uses an existing website as design reference."),o&&(o.textContent=t?"Add":"Attach")}function Ou(){bs=null;let e=document.getElementById("website-ref-chip");e&&(e.hidden=!0);let t=document.getElementById("prompt-input");t&&(t.placeholder="Describe what you want to build...");let s=document.getElementById("btn-attach-website");s&&s.classList.remove("is-active")}function hh(){let e=document.getElementById("btn-attach-website"),t=document.getElementById("website-ref-sheet"),s=document.getElementById("website-ref-url"),n=document.getElementById("website-ref-mode"),o=document.getElementById("btn-website-ref-confirm"),i=document.getElementById("btn-website-ref-cancel"),a=document.getElementById("website-ref-chip"),r=document.getElementById("website-ref-chip-label"),l=document.getElementById("btn-remove-website-ref"),p=document.getElementById("prompt-input");function c(u){if(d(),s&&s.classList.add("vs-input-error"),s){let v=document.createElement("div");v.className="vs-field-error vs-ref-url-error",v.textContent=u,s.insertAdjacentElement("afterend",v)}}function d(){s&&s.classList.remove("vs-input-error");let u=t==null?void 0:t.querySelector(".vs-ref-url-error");u&&u.remove()}e&&t&&e.addEventListener("click",()=>{Ga()||(Nu(),d(),t.hidden=!t.hidden,e.classList.toggle("is-active",!t.hidden||bs!==null),!t.hidden&&s&&s.focus())}),o&&o.addEventListener("click",async()=>{var f;if(Jt())return;let u=(f=s==null?void 0:s.value)==null?void 0:f.trim();if(!u||!u.match(/^https?:\/\/.+/)){c("Enter a valid URL starting with http:// or https://");return}let v=o.textContent;o.disabled=!0,o.textContent="Checking\u2026",d();try{let{ok:b,data:h,error:g}=await Y.post("/ai/check-url",{url:u});if(!b){c((g==null?void 0:g.message)||"Could not reach this URL.");return}let m=(h==null?void 0:h.url)||u,w=(D.get("pages")||[]).length>0;bs={url:m,contentMode:w?(n==null?void 0:n.value)||"keep":"regenerate",restyle:w};let E="Design reference";r.textContent=`${E}: ${ko(m)}`,r.title=m,a&&(a.hidden=!1),t&&(t.hidden=!0),e&&e.classList.add("is-active"),p&&(p.placeholder="Describe what to change (optional)...",p.focus())}catch{c("Network error \u2014 please check your connection and try again.")}finally{o.disabled=!1,o.textContent=v}}),i&&t&&i.addEventListener("click",()=>{d(),t.hidden=!0,e&&!bs&&e.classList.remove("is-active")}),l&&l.addEventListener("click",()=>{Ou()}),s&&o&&(s.addEventListener("keydown",u=>{u.key==="Enter"&&(u.preventDefault(),o.click())}),s.addEventListener("input",d))}async function Va(){if(window.builtInAiGuard()||Jt())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=pn.length>0;if(!t&&!s&&!(bs!==null)||D.get("aiStreaming"))return;if(bs!=null&&bs.restyle)try{let Q=D.get("siteName")||"Untitled";if(!(await Y.post("/designs",{name:`${Q} (before restyle)`,description:`Automatic snapshot saved before restyling from ${bs.url}`,is_system_backup:!0})).ok){A("Could not save your current design before restyling. Please try again.","error");return}}catch{A("Could not save your current design before restyling. Please try again.","error");return}e.value="",e.style.height="auto";let o=document.getElementById("chat-messages");if(!o)return;let i=[...pn];gh();let a=bs;Ou();let r=i.length>0?`<div class="vs-msg-user-images">${i.map(Q=>`<img src="${Q.preview}" alt="${y(Q.name)}" class="vs-msg-user-image" />`).join("")}</div>`:"",l=a?`<div class="vs-msg-user-webref"><a href="${X(a.url)}" target="_blank" rel="noopener" title="${X(a.url)}">${L.globe} <span>${y(ko(a.url))}</span></a></div>`:"",p=`
    <div class="vs-msg-user mb-6 mt-4">
      ${r}
      ${l}
      ${t?`<div class="vs-msg-user-bubble">${y(t)}</div>`:""}
    </div>
  `,c=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,d=`
    <div class="vs-msg-ai mb-6" data-stream-id="${c}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${L.box}</span>
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
  `,u=o.querySelector(".vs-empty-state");u&&u.remove(),o.insertAdjacentHTML("beforeend",p+d),o.scrollTop=o.scrollHeight;let v=!0,f=80,b=()=>{v=o.scrollHeight-o.scrollTop-o.clientHeight<=f};o.addEventListener("scroll",b);let h=()=>{v&&(o.scrollTop=o.scrollHeight)},g=o.querySelector(`.vs-msg-ai[data-stream-id="${c}"]`);if(!g)return;let m=g.querySelector('[data-role="typing"]'),x=g.querySelector('[data-role="status"]'),w=g.querySelector('[data-role="stream-content"]'),E=g.querySelector('[data-role="files-section"]'),k=g.querySelector('[data-role="files"]'),$=g.querySelector('[data-role="files-label"]'),S=g.querySelector('[data-role="files-count"]'),_=g.querySelector('[data-role="files-progress"]'),q=g.querySelector('[data-role="error"]'),K=g.querySelector('[data-role="status-timer"]'),O=g.querySelector('[data-role="status-step"]'),W=g.querySelector('[data-role="status-tokens"]'),G=Q=>{Q&&Q.removeAttribute("hidden")},J=Q=>{Q&&Q.setAttribute("hidden","")},T=Date.now(),C=0,j=Date.now(),B=!1,P=!1,H=setInterval(()=>{let Q=Math.floor((Date.now()-T)/1e3),I=Math.floor(Q/60),M=Q%60,F=I>0?`${I}m ${M}s`:`${M}s`;if(W&&C>0){let ne=C>=1e3?`~${(C/1e3).toFixed(1)}K tokens`:`${C} tokens`;W.textContent=`\xB7 ${ne}`}K&&(K.textContent=F);let V=document.getElementById("overlay-metrics");V&&(V.textContent=F),Date.now()-j>3e5&&!B&&(B=!0,K&&(K.textContent=`${F} \xB7 No data for 5 min \u2014 may have stalled`,K.style.color="var(--vs-warning, #d97706)"))},1e3);D.set("aiStreaming",!0),document.body.classList.add("vs-ai-streaming");let U=document.getElementById("btn-send");U&&(U.disabled=!0,U.classList.add("opacity-50")),ch();let ee="",pe=[],fe=!1,Oe=null,Je=!0,ze=new AbortController,gt=null,At=g.querySelector('[data-role="stop-btn"]');At&&At.addEventListener("click",()=>{ze.abort(),gt&&(Y.post("/ai/cancel-generation",{prompt_id:gt}).catch(()=>{}),gt=null)});let R=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let N=e.dataset.actionData,te=null;if(N){try{te=JSON.parse(N)}catch{}delete e.dataset.actionData}let se=t||"";if(!se)if(a)try{let Q=ko(a.url);se=a.restyle?`(restyle from: ${Q})`:`(import from: ${Q})`}catch{se=`(reference: ${a.url})`}else i.length>0&&(se="(see attached images)");a&&(se=`[vx-ref:${a.url}]`+se),i.length>0&&(se=i.map(I=>`[vx-img:${I.thumbnail}]`).join("")+se);let Ee={user_prompt:se,action_type:R,page_scope:D.get("activePageScope"),conversation_id:D.get("activeConversationId"),action_data:te};a&&(Ee.action_type=a.restyle?"restyle_site":"import_site",Ee.action_data={url:a.url,content_mode:a.contentMode},Ee.page_scope=null),i.length>0&&(Ee.images=i.map(Q=>({data:Q.data,media_type:Q.media_type}))),await ds("/ai/prompt",Ee,{signal:ze.signal,onPromptId(Q){gt=Q},onConversation(Q){if(Q){D.set("activeConversationId",Q);try{localStorage.setItem("vs-active-conversation",Q)}catch{}}},onStatus(Q){let I=typeof Q=="string"?Q:Q.message||"";O&&(O.textContent=`\xB7 ${I}`),!P&&E&&!E.hasAttribute("hidden")&&$&&($.textContent=I)},onToken(Q){ee+=Q,C+=Math.ceil(Q.length/4),j=Date.now(),B=!1,K&&(K.style.color="");let I=ee.trimStart();if(!fe&&I.length>0&&(fe=I.startsWith("{")||I.startsWith("```json")||I.startsWith("```")||I.startsWith("<|")||I.startsWith("<message>")||I.startsWith("<file ")||Q.includes("<|")||I.includes("<|channel|>")||I.includes('"operations"')||I.includes('"assistant_message"'),fe&&w&&(w.innerHTML="")),J(m),w&&fe){let M=ee.match(/<message>([\s\S]*?)(<\/message>|$)/);if(M){let F=M[1].trim();F&&(G(w),w.innerHTML=ja(F))}E&&ee.includes("<file ")&&G(E)}else w&&(G(w),w.innerHTML=ja(ee));h()},onFile(Q){if(pe.push(Q),E&&G(E),S){let I=pe.length;S.textContent=`${I} file${I!==1?"s":""}`}if(k){let I=Q.action==="delete",M=(pe.length-1)*60,F=I?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';k.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${I?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${M}ms">
            <span class="vs-file-badge-icon">${F}</span>
            <span>${y(Q.path)}</span>
          </div>
        `)}Oe||(Je=!0),Q.path.endsWith(".css")||(Je=!1),clearTimeout(Oe),Oe=setTimeout(()=>{Ll(Je?"voxelsite:reload-css":"voxelsite:reload"),Oe=null,Je=!0},600),h()},onDone(Q){P=!0,clearTimeout(Oe),Oe=null,clearInterval(H),J(m),J(x);let I=Q.files_modified||[],M=pe.length>0||I.length>0;if(E&&M){J(_),E.classList.add("vs-files-done"),$&&($.textContent=Q.partial?"Files updated (partial)":"Files updated");let z=document.createElement("div");z.className="vs-chat-action-row",z.innerHTML=`
          <button class="vs-btn vs-btn-ghost vs-btn-xs vs-chat-save-btn" title="Save current design to the library">
            ${L.save} Save to Designs
          </button>
        `,z.querySelector("button").addEventListener("click",()=>{Vo()}),E.insertAdjacentElement("afterend",z)}else E&&!E.hasAttribute("hidden")&&(J(_),J(E));if(w)if(Q.message)G(w),w.innerHTML=ja(Q.message);else if(fe)J(w);else{let z=w.textContent||"";(z.includes("<|channel|>")||z.includes('"operations"')||z.includes('"assistant_message"')||z.includes("<file ")||z.includes("<message>"))&&(J(w),w.innerHTML="")}let F=Q.missing_files||[];if((Q.truncated||F.length>0)&&w){let z;F.length>0?z=`The following pages are linked in the navigation but were NOT created yet: ${F.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:z="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let ne=document.getElementById("prompt-input");ne&&!D.get("aiStreaming")&&($&&($.textContent="Generating remaining files..."),E&&(E.classList.remove("vs-files-done"),G(E)),ne.value=z,ne.dataset.actionType="free_prompt",Va())},800)}if(Q.conversation_id){D.set("activeConversationId",Q.conversation_id);try{localStorage.setItem("vs-active-conversation",Q.conversation_id)}catch{}}let V=[...pe,...I];if(V.length>0){let z=V.map(de=>de.path||de),ne=z.some(de=>de==="index.php"),Z=z.filter(de=>de.endsWith(".php")&&!de.includes("/")&&de!=="index.php"),oe=ne&&Z.length>0,re;oe?re="index.php":Z.length>0?re=Z[0]:re=ne?"index.php":null,un(re),D.set("previewDirty",!0),ys({silent:!0})}mu(),Al(),co(),o.removeEventListener("scroll",b),o.scrollTop=o.scrollHeight},onEvaluation(Q){let I=(Q==null?void 0:Q.issues)||[];if(I.length===0)return;let M={error:0,warning:0,info:0};I.forEach(le=>M[le.severity]=(M[le.severity]||0)+1);let F={error:0,warning:1,info:2},V=[...I].sort((le,Le)=>(F[le.severity]??3)-(F[Le.severity]??3)),z=V.filter(le=>le.severity!=="info"),ne=V.filter(le=>le.severity==="info"),Z=[];M.error>0&&Z.push(`${M.error} error${M.error!==1?"s":""}`),M.warning>0&&Z.push(`${M.warning} warning${M.warning!==1?"s":""}`),M.info>0&&Z.push(`${M.info} suggestion${M.info!==1?"s":""}`);let oe=le=>le==="error"?"var(--vs-error, #ef4444)":le==="warning"?"var(--vs-warning, #d97706)":"var(--vs-text-ghost)",re=le=>le==="error"?"rgba(239,68,68,0.08)":le==="warning"?"rgba(217,119,6,0.08)":"var(--vs-bg-raised)",de=le=>{let Le=le.file?` in ${le.file}`:"",Xt=le.suggested_fix?`

Suggested approach: ${le.suggested_fix}`:"";return`Review this suggestion and apply if appropriate \u2014 ${le.severity}${Le}: ${le.description}${Xt}`},xe=(le,Le)=>`
        <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${oe(le.severity)}; background: ${re(le.severity)};">${y(le.severity)}</span>
            <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(le.category||"")}</span>
            ${le.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(le.file)}${le.line?":"+le.line:""}</span>`:""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(le.description||"")}</div>
          ${le.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(le.suggested_fix)}</div>`:""}
          <div style="margin-top: 4px; text-align: right;">
            <button class="vs-eval-add-to-chat" data-eval-idx="${Le}" style="
              background: none; border: none; cursor: pointer; padding: 2px 0;
              font-size: 11px; color: var(--vs-accent); opacity: 0.7;
              transition: opacity 0.15s ease;
            " onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'">Add to chat \u2192</button>
          </div>
        </div>
      `,me=z.map((le,Le)=>xe(le,Le)).join(""),qe=ne.length>0?`
        <details style="border-top: 1px solid var(--vs-border-subtle);">
          <summary style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; cursor: pointer; user-select: none; font-size: 11px; color: var(--vs-text-ghost); list-style: none;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            ${ne.length} additional suggestion${ne.length!==1?"s":""}
          </summary>
          ${ne.map((le,Le)=>xe(le,z.length+Le)).join("")}
        </details>
      `:"",be=M.error>0?"error":M.warning>0?"warning":"info",he=oe(be),nt=`
        <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${be==="error"?"rgba(239,68,68,0.15)":be==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)"}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
          <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${he}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Expert Review \xB7 ${Z.join(", ")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div style="border-top: 1px solid var(--vs-border-subtle);">
            <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
            ${me}
            ${qe}
          </div>
        </details>
      `,Et;E&&!E.hasAttribute("hidden")?(E.insertAdjacentHTML("afterend",nt),Et=E.nextElementSibling):w?(w.insertAdjacentHTML("afterend",nt),Et=w.nextElementSibling):(g.insertAdjacentHTML("beforeend",nt),Et=g.lastElementChild),Et&&Et.addEventListener("click",le=>{let Le=le.target.closest(".vs-eval-add-to-chat");if(!Le)return;le.preventDefault();let Xt=parseInt(Le.dataset.evalIdx,10),Bt=V[Xt];if(!Bt)return;let tt=document.getElementById("prompt-input");if(!tt)return;let De=de(Bt),We=tt.value.trim();tt.value=We?We+`

`+De:De,tt.focus(),tt.style.height="auto",tt.style.height=Math.min(tt.scrollHeight,200)+"px",tt.selectionStart=tt.selectionEnd=tt.value.length,Le.textContent="\u2713 Added",Le.style.opacity="1",setTimeout(()=>{Le.textContent="Add to chat \u2192",Le.style.opacity="0.7"},1500)}),h()},onWarning(Q){Q.toLowerCase().includes("truncat")||k&&(k.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${y(Q)}</div>
        `)},onError(Q){clearTimeout(Oe),Oe=null,clearInterval(H),J(m),J(x),q&&(q.textContent=Q.message||"Something went wrong.",G(q)),mu(),_&&J(_),E&&pe.length>0&&(E.classList.add("vs-files-done"),$&&($.textContent="Files updated (partial)"))}}),D.set("aiStreaming",!1),document.body.classList.remove("vs-ai-streaming"),U&&(U.disabled=!1,U.classList.remove("opacity-50"))}function hu(){var d;Su.innerHTML=`
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
            <h1 class="vs-login-title">${Fs?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${Fs?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${Fs?`
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
                ${Fs?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${Fs?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${Fs?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${L.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${Fs?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${Fs?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
        ${(D.get("theme")||"light")==="light"?L.sun:L.moon}
      </button>
    </div>
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let u=e.type==="password";e.type=u?"text":"password",t.innerHTML=u?L.eyeOff:L.eye,t.title=u?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let u=Pi();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=u==="light"?L.sun:L.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(u=>{u.addEventListener("click",()=>{let v=document.getElementById(u.dataset.toggleTarget);if(!v)return;let f=v.type==="password";v.type=f?"text":"password",u.innerHTML=f?L.eyeOff:L.eye,u.title=f?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),r=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var v,f,b;o.classList.add("hidden"),i.classList.remove("hidden");let u=document.getElementById("forgot-content");try{let g=await(await fetch(Ce("api/router.php")+"?_path=%2Fauth%2Frecovery-mode")).json();(((v=g==null?void 0:g.data)==null?void 0:v.mode)||"file")==="email"?(u.innerHTML=`
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
          `,(f=document.getElementById("forgot-form"))==null||f.addEventListener("submit",async x=>{var S,_,q;x.preventDefault();let w=document.getElementById("forgot-message"),E=document.getElementById("forgot-email"),k=x.target.querySelector('button[type="submit"]'),$=(S=E==null?void 0:E.value)==null?void 0:S.trim();if($){k&&(k.disabled=!0,k.textContent="Sending...");try{let O=await(await fetch(Ce("api/router.php")+"?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:$})})).json();w&&(O.ok?(w.textContent=((_=O.data)==null?void 0:_.message)||"Recovery link sent. Check your inbox.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",E&&(E.value="")):(w.textContent=((q=O.error)==null?void 0:q.message)||"Failed to send recovery email.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),w.classList.remove("hidden"))}catch{w&&(w.textContent="Network error. Please try again.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}finally{k&&(k.disabled=!1,k.textContent="Send Recovery Link")}}})):(u.innerHTML=`
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
                  <button type="button" data-toggle-target="forgot-new-password" class="vs-login-eye" title="Show password">${L.eye}</button>
                </div>
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
            </form>
          `,n(),(b=document.getElementById("forgot-form"))==null||b.addEventListener("submit",async x=>{var S,_,q;x.preventDefault();let w=document.getElementById("forgot-message"),E=(S=document.getElementById("forgot-email"))==null?void 0:S.value,k=(_=document.getElementById("forgot-new-password"))==null?void 0:_.value;if(!E||!k)return;let $=await Y.post("/auth/reset-password",{email:E,new_password:k});$.ok?(w&&(w.textContent="Password reset. You can now sign in with your new password.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",w.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):w&&(w.textContent=((q=$.error)==null?void 0:q.message)||"Reset failed. Make sure the .reset file exists in _data/.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}))}catch{u.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),r&&r.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let p=new URLSearchParams(window.location.search).get("reset");if(p&&p.length===64&&i&&o){let u=window.location.pathname+window.location.hash;window.history.replaceState(null,"",u),o.classList.add("hidden"),i.classList.remove("hidden");let v=document.getElementById("forgot-content");v&&(v.innerHTML=`
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
              <button type="button" data-toggle-target="token-new-password" class="vs-login-eye" title="Show password">${L.eye}</button>
            </div>
          </div>
          <div>
            <label class="vs-input-label">Confirm Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-confirm-password" type="password" required minlength="8" class="vs-input" placeholder="Confirm your password">
              <button type="button" data-toggle-target="token-confirm-password" class="vs-login-eye" title="Show password">${L.eye}</button>
            </div>
          </div>
          <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
        </form>
      `,n(),(d=document.getElementById("token-reset-form"))==null||d.addEventListener("submit",async f=>{var x,w,E,k;f.preventDefault();let b=document.getElementById("forgot-message"),h=(x=document.getElementById("token-new-password"))==null?void 0:x.value,g=(w=document.getElementById("token-confirm-password"))==null?void 0:w.value,m=f.target.querySelector('button[type="submit"]');if(!h||h.length<8){b&&(b.textContent="Password must be at least 8 characters.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden"));return}if(h!==g){b&&(b.textContent="Passwords do not match.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden"));return}m&&(m.disabled=!0,m.textContent="Resetting...");try{let S=await(await fetch(Ce("api/router.php")+"?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:p,new_password:h})})).json();b&&(S.ok?(b.textContent=((E=S.data)==null?void 0:E.message)||"Password reset. You can now sign in.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",b.classList.remove("hidden"),f.target.querySelectorAll("input").forEach(_=>_.disabled=!0),m&&(m.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(b.textContent=((k=S.error)==null?void 0:k.message)||"Reset failed. The link may have expired.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden")))}catch{b&&(b.textContent="Network error. Please try again.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden"))}finally{m&&(m.disabled=!1,m.textContent="Reset Password")}}))}let c=document.getElementById("login-form");c&&c.addEventListener("submit",async u=>{var g,m,x,w;u.preventDefault();let v=(g=document.getElementById("login-email"))==null?void 0:g.value,f=(m=document.getElementById("login-password"))==null?void 0:m.value,b=document.getElementById("login-error");if(!v||!f)return;let h=await Y.post("/auth/login",{email:v,password:f});h.ok&&((x=h.data)!=null&&x.token)?(D.batch(()=>{D.set("user",h.data.user),D.set("sessionToken",h.data.token)}),Cu()):b&&(b.textContent=((w=h.error)==null?void 0:w.message)||"Invalid email or password.",b.classList.remove("hidden"))}),co()}function Oa(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function ja(e){if(!e)return"";if(!window.marked)return y(e);let t=window.marked.parse(e);return bh(t)}function bh(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),r=a?a.split(`
`):[];if(r.length<=_g)return;let l=r.slice(0,Lg).join(`
`)+`
...`,p=document.createElement("div");p.className="vs-code-collapse",p.setAttribute("data-code-collapse","1");let c=document.createElement("pre");c.className="vs-code-collapse-preview",c.setAttribute("data-code-preview","1");let d=document.createElement("code");o!=null&&o.className&&(d.className=o.className),d.textContent=l,c.appendChild(d),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let u=document.createElement("button");u.type="button",u.className="vs-code-collapse-toggle",u.setAttribute("data-code-toggle","1"),u.setAttribute("data-lines",String(r.length)),u.setAttribute("aria-expanded","false"),u.textContent=`More (${r.length} lines)`;let v=n.parentNode;v&&(v.replaceChild(p,n),p.appendChild(c),p.appendChild(n),p.appendChild(u))}),t.innerHTML}function yh(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Cu();})();
