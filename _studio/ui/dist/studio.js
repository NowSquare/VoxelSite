(()=>{var mr=e=>{throw TypeError(e)};var Xi=(e,t,s)=>t.has(e)||mr("Cannot "+s);var xe=(e,t,s)=>(Xi(e,t,"read from private field"),s?s.call(e):t.get(e)),ct=(e,t,s)=>t.has(e)?mr("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),At=(e,t,s,n)=>(Xi(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),Yt=(e,t,s)=>(Xi(e,t,"access private method"),s);var Jt,Zt,zs,Qt,Dn,Ji,Yi=class{constructor(t={}){ct(this,Dn);ct(this,Jt,new Map);ct(this,Zt,new Map);ct(this,zs,!1);ct(this,Qt,new Map);for(let[s,n]of Object.entries(t))xe(this,Jt).set(s,n)}get(t,s=void 0){return xe(this,Jt).has(t)?xe(this,Jt).get(t):s}set(t,s){let n=xe(this,Jt).get(t);n!==s&&(xe(this,Jt).set(t,s),xe(this,zs)?xe(this,Qt).has(t)?xe(this,Qt).get(t).newValue=s:xe(this,Qt).set(t,{newValue:s,oldValue:n}):Yt(this,Dn,Ji).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return xe(this,Zt).has(t)||xe(this,Zt).set(t,new Set),xe(this,Zt).get(t).add(s),()=>{var n;(n=xe(this,Zt).get(t))==null||n.delete(s)}}batch(t){if(xe(this,zs)){t();return}At(this,zs,!0),xe(this,Qt).clear();try{t()}finally{At(this,zs,!1);for(let[s,{newValue:n,oldValue:o}]of xe(this,Qt))Yt(this,Dn,Ji).call(this,s,n,o);xe(this,Qt).clear()}}toJSON(){return Object.fromEntries(xe(this,Jt))}};Jt=new WeakMap,Zt=new WeakMap,zs=new WeakMap,Qt=new WeakMap,Dn=new WeakSet,Ji=function(t,s,n){let o=xe(this,Zt).get(t);if(o)for(let a of o)try{a(s,n)}catch(r){console.error(`[state] Error in "${t}" listener:`,r)}let i=xe(this,Zt).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(r){console.error("[state] Error in wildcard listener:",r)}};var R=new Yi({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});R.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});R.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Hn,rn,ln,dn,cn,pn,es,Uo,Qi,Zi=class{constructor(){ct(this,es);ct(this,Hn,[]);ct(this,rn,null);ct(this,ln,!1);ct(this,dn,null);ct(this,cn,null);ct(this,pn,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return xe(this,Hn).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return At(this,rn,t),this}beforeEach(t){return At(this,dn,t),this}start(){xe(this,ln)||(At(this,ln,!0),window.addEventListener("hashchange",()=>Yt(this,es,Uo).call(this)),Yt(this,es,Uo).call(this))}navigate(t){window.location.hash=`/${t}`}refresh(){At(this,cn,null),Yt(this,es,Uo).call(this)}get current(){return Yt(this,es,Qi).call(this)}};Hn=new WeakMap,rn=new WeakMap,ln=new WeakMap,dn=new WeakMap,cn=new WeakMap,pn=new WeakMap,es=new WeakSet,Uo=async function(){if(xe(this,pn))return;let t=Yt(this,es,Qi).call(this),s=xe(this,cn);if(!(t===s&&xe(this,ln))){if(xe(this,dn)&&s!==null){At(this,pn,!0);try{if(await xe(this,dn).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{At(this,pn,!1)}}At(this,cn,t);for(let n of xe(this,Hn)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,r)=>{i[a]=decodeURIComponent(o[r+1])}),R.batch(()=>{R.set("route",n.pattern),R.set("routeParams",i)}),n.handler(i);return}}xe(this,rn)?(R.set("route","404"),xe(this,rn).call(this,t)):this.navigate("chat")}},Qi=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var pt=new Zi;var fr="/_studio/api/router.php",hs=0;function Bc(e,t){var s;t||["POST","PUT","DELETE"].includes(e)&&(hs++,hs===1&&((s=window.__vsSetGlobalStatus)==null||s.call(window,"saving")))}function Vo(e,t,s){var n,o;s||["POST","PUT","DELETE"].includes(e)&&(hs=Math.max(0,hs-1),hs===0&&(t?(n=window.__vsSetGlobalStatus)==null||n.call(window,"saved"):(o=window.__vsSetGlobalStatus)==null||o.call(window,"error")))}async function Wo(e,t,s=null,n={}){var l;let{silent:o=!1,...i}=n,a={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let d=hr();d&&(a["X-VS-Token"]=d)}s!==null&&(a["Content-Type"]="application/json");let r={method:e,headers:a,credentials:"same-origin",...i};s!==null&&(r.body=JSON.stringify(s)),Bc(e,o);try{let[d,v]=t.split("?"),p=`${fr}?_path=${encodeURIComponent(d)}${v?"&"+v:""}`,c=await fetch(p,r),m=await c.json();return c.status===401?(R.get("user")&&R.set("user",null),Vo(e,!1,o),m!=null&&m.error?{ok:!1,error:m.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!m.ok&&m.error?(m.error.code==="demo_mode"?(window.showToast&&window.showToast(m.error.message||"Demo mode \u2014 this action is disabled.","warning"),!o&&["POST","PUT","DELETE"].includes(e)&&(hs=Math.max(0,hs-1),hs===0&&((l=window.__vsSetGlobalStatus)==null||l.call(window,"idle")))):Vo(e,!1,o),{ok:!1,error:m.error}):(Vo(e,!0,o),{ok:!0,data:m.data||m})}catch{return Vo(e,!1,o),{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var $={get:(e,t)=>Wo("GET",e,null,t),post:(e,t,s)=>Wo("POST",e,t,s),put:(e,t,s)=>Wo("PUT",e,t,s),delete:(e,t,s)=>Wo("DELETE",e,t,s)};async function qt(e,t,s={}){var k,w;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onPromptId:a=()=>{},onFile:r=()=>{},onDone:l=()=>{},onEvaluation:d=()=>{},onWarning:v=()=>{},onError:p=()=>{},signal:c=null}=s,m=hr(),f={"Content-Type":"application/json",Accept:"text/event-stream"};m&&(f["X-VS-Token"]=m);let u=!1,h=0,g=0,b=t.conversation_id||null;try{let de=function(Q){if(!Q.trim())return;let N="";for(let F of Q.split(`
`))F.startsWith(":")||F.startsWith("data: ")&&(N+=F.slice(6));if(!N)return;let S;try{S=JSON.parse(N)}catch{return}switch(S.type||"message"){case"token":g++,n(S.content||"");break;case"status":o(S);break;case"conversation":b=S.conversation_id||b,i(S.conversation_id||"");break;case"prompt_id":a(S.prompt_id||0);break;case"file_complete":h++,r(S);break;case"done":u=!0,l(S);break;case"evaluation":d(S);break;case"warning":v(S.message||"");break;case"error":u=!0,p(S);break}},x={method:"POST",headers:f,credentials:"same-origin",body:JSON.stringify(t)};c&&(x.signal=c);let[C,_]=e.split("?"),P=`${fr}?_path=${encodeURIComponent(C)}${_?"&"+_:""}`,j=await fetch(P,x);if(!j.ok){let Q=await j.json().catch(()=>null);p({code:((k=Q==null?void 0:Q.error)==null?void 0:k.code)||"http_error",message:((w=Q==null?void 0:Q.error)==null?void 0:w.message)||`Server error (${j.status})`});return}let Z=j.body.getReader(),Y=new TextDecoder,q="";for(;;){let{done:Q,value:N}=await Z.read();if(Q)break;q+=Y.decode(N,{stream:!0});let S=q.split(`

`);q=S.pop();for(let H of S)de(H)}if(q.trim()&&de(q),!u){let Q=b;Q?(o("Waiting for server to finish..."),await gr(Q,{onDone:l,onError:p,onFile:r,onStatus:o})):(h>0||g>0)&&l({files_modified:[],message:"",soft_close:!0})}}catch(x){if(x.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(u)return;if(h>0||g>0){let C=b;C?(o("Server is still generating \u2014 waiting for completion..."),await gr(C,{onDone:l,onError:p,onFile:r,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else p({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function gr(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var r;let a=0;for(let l=0;l<120;l++){await new Promise(d=>setTimeout(d,3e3));try{let{ok:d,data:v}=await $.get(`/ai/conversations/${e}`);if(!d||!((r=v==null?void 0:v.conversation)!=null&&r.prompts))continue;let p=v.conversation.prompts,c=p[p.length-1];if(!c)continue;let m=c.files_modified?JSON.parse(c.files_modified):[];if(m.length>a){for(let f=a;f<m.length;f++)n({path:m[f],action:"write"});a=m.length}if(c.status==="streaming"){let f=Math.round((Date.now()-new Date(c.created_at).getTime())/1e3);o(`Server is still generating... (${f}s)`);continue}c.status==="success"?t({message:c.ai_message||"",files_modified:m,revision_id:c.revision_id||null,polled:!0}):c.status==="partial"?t({message:c.ai_message||"",files_modified:m,partial:!0,polled:!0}):s({code:"generation_failed",message:c.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function hr(){return R.get("sessionToken")}var _c="data-theme",ea="dark";function br(){let e=R.get("theme")||localStorage.getItem("vs-theme")||ea;return yr(e),e}function yr(e){let t=e||ea;return document.documentElement.setAttribute(_c,t),localStorage.setItem("vs-theme",t),R.set("theme",t),t}function Go(){let e=R.get("theme")||ea;return yr(e==="dark"?"light":"dark")}var xr=typeof document<"u"?document.createElement("span"):null;function y(e){return e?(xr.textContent=e,xr.innerHTML):""}function ge(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var Ac={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function Nn(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(Ac))if(t.endsWith(s))return n;return"plaintext"}function ta(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function jn(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),r=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:r===1?"Yesterday":r<30?`${r} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function On(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function qn(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function Fn(e,t=40){if(!e)return"";let s=e.replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/+$/,"");return s.length>t&&(s=s.substring(0,t-1)+"\u2026"),s}function we(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function ke(e,t){let s=null;e.addEventListener("mousedown",n=>{s=n.target}),e.addEventListener("click",n=>{n.target===e&&s===e&&t(n)})}function Ce({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var v,p;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let r=document.createElement("div");r.id="vs-confirm-overlay",r.className="vs-modal-overlay",r.innerHTML=`
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
    `;let l=c=>{c.key==="Escape"&&(c.preventDefault(),d(!1))},d=c=>{document.removeEventListener("keydown",l),we(r),i(c)};document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible")),ke(r,()=>d(!1)),(v=document.getElementById("vs-confirm-cancel"))==null||v.addEventListener("click",()=>d(!1)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>d(!0)),document.addEventListener("keydown",l),setTimeout(()=>{var c;return(c=document.getElementById("vs-confirm-ok"))==null?void 0:c.focus()},220)})}function wr({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:r="",inputPattern:l=""}){return new Promise(d=>{var h,g;let v=document.getElementById("vs-prompt-overlay");v&&v.remove();let p=document.createElement("div");p.id="vs-prompt-overlay",p.className="vs-modal-overlay";let c=l?` pattern="${y(l)}"`:"",m=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${y(n)}" style="resize: vertical;">${y(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${y(n)}" value="${y(o)}"${c}>`;p.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${y(e)}</h2>
          ${t?`<p class="vs-modal-desc">${y(t)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${y(s)}</label>`:""}
          ${m}
          ${r?`<p class="text-xs text-vs-text-ghost" style="margin-top: 6px;">${y(r)}</p>`:""}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${y(i)}</button>
        </div>
      </div>
    `;let f=b=>{we(p),d(b)};document.body.appendChild(p),requestAnimationFrame(()=>p.classList.add("is-visible"));let u=p.querySelector("#vs-prompt-input");setTimeout(()=>u==null?void 0:u.focus(),220),ke(p,()=>f(null)),(h=p.querySelector("#vs-prompt-cancel"))==null||h.addEventListener("click",()=>f(null)),(g=p.querySelector("#vs-prompt-ok"))==null||g.addEventListener("click",()=>{f(((u==null?void 0:u.value)||"").trim())}),u==null||u.addEventListener("keydown",b=>{a==="textarea"?b.key==="Enter"&&(b.metaKey||b.ctrlKey)&&(b.preventDefault(),f(((u==null?void 0:u.value)||"").trim())):b.key==="Enter"&&(b.preventDefault(),f(((u==null?void 0:u.value)||"").trim())),b.key==="Escape"&&(b.preventDefault(),f(null))})})}var Pc=new Set(["page","partial","component"]),Rc=new Set(["partial","component"]),sa={unsafe:"Contains dynamic PHP. Use the Code Editor for full control."};function Us(e){if(!e||typeof e!="object")return{sourceFile:"",sourceKind:"unsafe",nodeKey:"",includeChain:[],instanceKey:"",editable:!1};let t=typeof e.sourceFile=="string"?e.sourceFile:"",s=typeof e.sourceKind=="string"?e.sourceKind:"unsafe",n=typeof e.nodeKey=="string"?e.nodeKey:"",o=e.editable===!0||e.editable==="true",i=[];Array.isArray(e.includeChain)?i=e.includeChain:typeof e.includeChain=="string"&&e.includeChain&&(i=e.includeChain.split(",").map(r=>r.trim()).filter(Boolean));let a=[t,s,n].filter(Boolean).join("::");return{sourceFile:t,sourceKind:s,nodeKey:n,includeChain:i,instanceKey:a,editable:o}}function Ko(e){return e?Pc.has(e.sourceKind)&&e.editable:!1}function kr(e){return e?Ko(e)?null:e.sourceKind==="unsafe"&&!e.sourceFile?"Could not determine the source file. Changes cannot be saved safely.":sa[e.sourceKind]||sa.unsafe:sa.unsafe}function Er(e){return e?Rc.has(e.sourceKind):!1}var E={archive:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',database:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',inbox:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',panelLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',palette:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',mic:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>',micOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M16.95 16.95A7 7 0 0 1 5 12v-2"/><path d="M18.89 13.23A7 7 0 0 0 19 12v-2"/><path d="m2 2 20 20"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/></svg>',puzzle:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/></svg>',paintbrush:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>',penTool:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/></svg>'};var $r={success:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'},Cr='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Lr=["success","error","warning","info"];function Sr(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function zn(e){e._dismissed||(e._dismissed=!0,e._autoTimer&&(clearTimeout(e._autoTimer),e._autoTimer=null),e.classList.add("vs-toast-exit"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>{e.parentNode&&e.remove()},250))}function I(e,t="success",s=3200){var a;if(!e)return;let n=Sr(),o=Lr.includes(t)?t:"success",i=document.createElement("div");i.className=`vs-toast vs-toast-${o}`,i.innerHTML=`
    <span class="vs-toast-icon">${$r[o]}</span>
    <span class="vs-toast-message">${y(String(e))}</span>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${Cr}</button>
    <div class="vs-toast-progress" style="animation-duration: ${s}ms;"></div>
  `,(a=i.querySelector(".vs-toast-dismiss"))==null||a.addEventListener("click",r=>{r.stopPropagation(),zn(i)}),n.appendChild(i),i._autoTimer=setTimeout(()=>zn(i),s)}window.showToast=I;function Un(e,t,s,n="success"){var l,d;if(!e)return;let o=Sr(),i=Lr.includes(n)?n:"success",a=8e3,r=document.createElement("div");r.className=`vs-toast vs-toast-${i}`,r.style.cursor="default",r.innerHTML=`
    <span class="vs-toast-icon">${$r[i]}</span>
    <span class="vs-toast-message">${y(String(e))}</span>
    <button type="button" class="vs-toast-action">${y(t)}</button>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${Cr}</button>
    <div class="vs-toast-progress" style="animation-duration: ${a}ms;"></div>
  `,(l=r.querySelector(".vs-toast-action"))==null||l.addEventListener("click",v=>{v.stopPropagation(),s(),zn(r)}),(d=r.querySelector(".vs-toast-dismiss"))==null||d.addEventListener("click",v=>{v.stopPropagation(),zn(r)}),o.appendChild(r),r._autoTimer=setTimeout(()=>zn(r),a)}var Vn=null;function Tr(){return`
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
              <div class="vs-empty-state-icon">${E.fileCode}</div>
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
  `}async function Mr(){var ne;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,sidebarWidth:(e==null?void 0:e.sidebarWidth)||null,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(L=>L.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(L=>L.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,sidebarWidth:t.sidebarWidth,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)},reconcileMove:async(L,B)=>{if(t.disposed)return;let T=t.openTabs.find(G=>G.path===L);if(!T)return;T.path=B,t.activeTab===L&&(t.activeTab=B);let{ok:A,data:D}=await $.get(`/files/content?path=${encodeURIComponent(B)}`);A&&typeof(D==null?void 0:D.content)=="string"&&(T.baseline=D.content,T._buffer=D.content,T.dirty=!1,t.activeTab===B&&t.monacoInstance&&O(D.content,B)),await M(),j(),P(),me(),ye(),s()},reconcileDelete:async L=>{if(t.disposed)return;let B=t.openTabs.findIndex(T=>T.path===L);if(B!==-1){if(t.openTabs.splice(B,1),t.activeTab===L){let T=t.openTabs[Math.min(B,t.openTabs.length-1)];T?await F(T.path):(t.activeTab=null,ie(),me(),ye())}await M(),j(),P(),s()}}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),r=document.getElementById("editor-host"),l=document.getElementById("editor-empty-state"),d=document.getElementById("editor-monaco-container"),v=document.getElementById("editor-file-info"),p=document.getElementById("editor-status"),c=document.getElementById("editor-save-btn"),m=document.getElementById("editor-refresh-tree"),f=document.getElementById("editor-new-file"),u=document.getElementById("editor-sidebar"),h=document.getElementById("editor-sidebar-resize"),g=document.getElementById("editor-font-size-select"),b=document.getElementById("editor-word-wrap-btn");g&&(g.value=t.fontSize);let k=()=>{b&&(t.wordWrap?(b.style.color="var(--vs-accent)",b.style.backgroundColor="var(--vs-accent-dim)"):(b.style.color="var(--vs-text-ghost)",b.style.backgroundColor="transparent"))};k();let w=(L,B="muted")=>{p&&(p.textContent=L,p.dataset.state=B)},x=L=>{let B=t.files.find(T=>T.path===L);return(B==null?void 0:B.readonly)===!0},C=L=>{let B=L.toLowerCase();return B.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':B.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':B.endsWith(".js")||B.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},_=(L,B="")=>{let T=[],A={},D=J=>{if(A[J])return A[J];let z=J.split("/"),W=z[z.length-1],ee=z.slice(0,-1).join("/"),ue=B?B+J:J,re={name:W,path:ue,type:"folder",children:[]};return A[J]=re,ee?D(ee).children.push(re):T.push(re),re};for(let J of L){let W=(B&&J.path.startsWith(B)?J.path.substring(B.length):J.path).split("/");if(W.length===1)T.push({name:W[0],path:J.path,type:"file",meta:J});else{let ee=W.slice(0,-1).join("/");D(ee).children.push({name:W[W.length-1],path:J.path,type:"file",meta:J})}}let G=J=>{J.sort((z,W)=>z.type!==W.type?z.type==="folder"?-1:1:z.name.localeCompare(W.name));for(let z of J)z.type==="folder"&&G(z.children)};return G(T),T},P=()=>{if(!n)return;let L=(G,J=0)=>G.map(z=>{var ae,Ie;if(z.type==="folder"){let Ae=t.expandedFolders.has(z.path);return`
            <div class="vs-tree-item" data-folder="${y(z.path)}" style="--tree-indent: ${J};">
              <span class="vs-tree-folder-toggle" data-expanded="${Ae}">${E.chevronRight}</span>
              <span class="vs-tree-item-icon">${Ae?E.folderOpen||E.folder:E.folder}</span>
              <span class="vs-tree-item-name">${y(z.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${y(z.path)}" data-collapsed="${!Ae}">
              ${L(z.children,J+1)}
            </div>
          `}let W=t.activeTab===z.path,ee=t.openTabs.find(Ae=>Ae.path===z.path),ue=ee!=null&&ee.dirty?" \u2022":"",$e=x(z.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",be=((ae=z.meta)==null?void 0:ae.custom)===!0,Me=((Ie=z.meta)==null?void 0:Ie.protected)===!0,he="";return z.path==="assets/css/tailwind.css"?he=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:Me?be&&(he=`
            <button class="vs-tree-item-restore" data-restore-file="${y(z.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):he=`
            <button class="vs-tree-item-delete" data-delete-file="${y(z.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${y(z.path)}" data-active="${W}" style="--tree-indent: ${J};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${C(z.path)}</span>
            <span class="vs-tree-item-name">${y(z.name)}${$e}${ue}</span>
            ${he}
          </div>
        `}).join(""),B=(G,J,z)=>{let W=z.querySelector(".vs-explorer-caret");t.expandedSections.has(G)?(J.style.display="block",z.classList.add("is-expanded")):(J.style.display="none",z.classList.remove("is-expanded"))},T=document.querySelector('[data-section="site"]'),A=document.querySelector('[data-section="config"]'),D=document.querySelector('[data-section="prompts"]');T&&B("site",n,T),A&&o&&B("config",o,A),D&&i&&B("prompts",i,D),n.innerHTML=L(t.treeData.site),o&&(o.innerHTML=L(t.treeData.config)),i&&(i.innerHTML=L(t.treeData.prompts)),Bt()},j=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(L=>{let B=L.path===t.activeTab,T=L.path.split("/").pop(),D=x(L.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${y(L.path)}" data-active="${B}" data-dirty="${L.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${y(T)}${D}</span>
          <button class="vs-editor-tab-close" data-close-tab="${y(L.path)}" title="Close">${E.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',_t(),de()}},Z=null,Y=L=>{if(!a)return;let B=8,T=()=>{a.scrollLeft+=L==="left"?-B:B,de()};T(),Z=setInterval(T,16)},q=()=>{Z&&(clearInterval(Z),Z=null)},de=()=>{let L=document.getElementById("editor-tab-scroll-left"),B=document.getElementById("editor-tab-scroll-right");if(!a||!L||!B)return;let T=a.scrollLeft>0,A=a.scrollLeft<a.scrollWidth-a.clientWidth-1;L.style.display=T?"flex":"none",B.style.display=A?"flex":"none"};a&&(a.addEventListener("scroll",de,{passive:!0}),window.addEventListener("resize",de,{passive:!0}));let Q=document.getElementById("editor-tab-scroll-left"),N=document.getElementById("editor-tab-scroll-right");Q&&(Q.addEventListener("mousedown",()=>Y("left")),Q.addEventListener("mouseup",q),Q.addEventListener("mouseleave",q)),N&&(N.addEventListener("mousedown",()=>Y("right")),N.addEventListener("mouseup",q),N.addEventListener("mouseleave",q));let S=()=>{l&&(l.style.display="none"),d&&(d.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},H=async L=>{if(t.disposed)return;let B=t.openTabs.find(J=>J.path===L);if(B){await F(L);return}w("Loading\u2026");let{ok:T,data:A,error:D}=await $.get(`/files/content?path=${encodeURIComponent(L)}`);if(!T){I((D==null?void 0:D.message)||"Could not load file.","error"),w("Load failed","error");return}let G=typeof(A==null?void 0:A.content)=="string"?A.content:"";B={path:L,baseline:G,dirty:!1},t.openTabs.push(B),S(),await F(L),O(G,L),w("Ready"),s()},F=async L=>{if(t.disposed)return;let B=t.openTabs.find(A=>A.path===t.activeTab);B&&t.monacoInstance&&(B._buffer=t.monacoInstance.getValue()),t.activeTab=L;let T=t.openTabs.find(A=>A.path===L);if(T&&t.monacoInstance){let A=T._buffer!==void 0?T._buffer:T.baseline;O(A,L)}me(),ye(),j(),setTimeout(()=>{if(a){let A=a.querySelector('.vs-editor-tab[data-active="true"]');if(A){let D=A.getBoundingClientRect(),G=a.getBoundingClientRect();D.left<G.left?a.scrollBy({left:D.left-G.left,behavior:"smooth"}):D.right>G.right&&a.scrollBy({left:D.right-G.right,behavior:"smooth"})}}},10),P(),s()},V=async L=>{let B=t.openTabs.find(A=>A.path===L);if(B!=null&&B.dirty&&!await Ce({title:"Discard unsaved changes?",description:`"${L}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let T=t.openTabs.findIndex(A=>A.path===L);if(T!==-1){if(t.openTabs.splice(T,1),t.activeTab===L){let A=t.openTabs[Math.min(T,t.openTabs.length-1)];A?await F(A.path):(t.activeTab=null,ie(),me(),ye())}j(),P(),s()}},se=async L=>{var J,z;if((J=window.demoGuard)!=null&&J.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let B=L.split("/").pop();if(!await Ce({title:"Delete file?",description:`Are you sure you want to permanently delete "${B}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;w("Deleting\u2026");let{ok:A,error:D}=await $.delete(`/files?path=${encodeURIComponent(L)}`);if(!A){I((D==null?void 0:D.message)||"Could not delete file.","error"),w("Delete failed","error");return}let G=t.openTabs.findIndex(W=>W.path===L);if(G!==-1){if(t.openTabs.splice(G,1),t.activeTab===L){let W=t.openTabs[Math.min(G,t.openTabs.length-1)];W?await F(W.path):(t.activeTab=null,ie(),me(),ye())}j()}await M(),s(),I(`Deleted ${B}`,"success"),w("Ready")},te=async L=>{var J,z;if((J=window.demoGuard)!=null&&J.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let B=L.split("/").pop();if(!await Ce({title:"Reset system prompt?",description:`Are you sure you want to reset "${B}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;w("Resetting\u2026");let{ok:A,error:D}=await $.delete(`/files?path=${encodeURIComponent(L)}`);if(!A){I((D==null?void 0:D.message)||"Could not reset file.","error"),w("Reset failed","error");return}let G=t.openTabs.findIndex(W=>W.path===L);if(G!==-1){let{ok:W,data:ee}=await $.get(`/files/content?path=${encodeURIComponent(L)}`);if(W&&typeof(ee==null?void 0:ee.content)=="string"){let ue=t.openTabs[G];ue.baseline=ee.content,ue.dirty=!1,ue._buffer=ee.content,t.activeTab===L&&O(ee.content,L)}}ye(),await M(),s(),I(`Reset ${B} to default`,"success"),w("Ready")},O=(L,B)=>{var A;if(!t.monacoInstance||!t.monaco)return;let T=t.monacoInstance.getModel();T&&(t.monacoInstance.setValue(L),t.monaco.editor.setModelLanguage(T,Nn(B)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((A=window.canWrite)!=null&&A.call(window))||x(B)}))},ie=()=>{l&&(l.style.display=""),d&&(d.style.display="none")},me=()=>{if(!v)return;if(!t.activeTab){v.textContent="No file open";return}let L=t.openTabs.find(D=>D.path===t.activeTab),B=t.files.find(D=>D.path===t.activeTab),T=B!=null&&B.size?`${(Number(B.size)/1024).toFixed(1)} KB`:"",A=Nn(t.activeTab).toUpperCase();v.textContent=[t.activeTab,A,T].filter(Boolean).join(" \u2022 ")},ye=()=>{var T;if(!c)return;let L=t.openTabs.find(A=>A.path===t.activeTab);if(t.activeTab?x(t.activeTab)||!((T=window.canWrite)!=null&&T.call(window)):!1){c.disabled=!0,c.textContent="Read-Only",c.classList.remove("vs-btn-primary"),c.classList.add("vs-btn-ghost");return}if(!L||!L.dirty){c.disabled=!0,c.textContent="Saved",c.classList.remove("vs-btn-primary"),c.classList.add("vs-btn-ghost");return}c.disabled=!1,c.textContent="Save",c.classList.remove("vs-btn-ghost"),c.classList.add("vs-btn-primary")},nt=()=>{let L=t.openTabs.find(A=>A.path===t.activeTab);if(!L||!t.monacoInstance)return;let B=t.monacoInstance.getValue(),T=L.dirty;L.dirty=B!==L.baseline,T!==L.dirty&&(ye(),j(),L.dirty?w("Unsaved changes","warning"):w("Ready"))},dt=async()=>{var G,J,z,W,ee;if((G=window.demoGuard)!=null&&G.call(window)||(J=window.viewerGuard)!=null&&J.call(window))return;let L=t.openTabs.find(ue=>ue.path===t.activeTab);if(!L||!L.dirty||!t.monacoInstance)return;let B=t.monacoInstance.getValue();c.disabled=!0,c.textContent="Saving\u2026",w("Saving\u2026");let{ok:T,error:A}=await $.put("/files/content",{path:L.path,content:B});if(!T){c.disabled=!1,c.textContent="Save",I((A==null?void 0:A.message)||"Could not save file.","error"),w("Save failed","error");return}L.baseline=B,L.dirty=!1,L._buffer=B,ye(),j(),P(),w(`${L.path}`,"muted"),L.path.toLowerCase().endsWith(".css")?(z=window.sendPreviewMessage)==null||z.call(window,"voxelsite:reload-css"):(W=window.sendPreviewMessage)==null||W.call(window,"voxelsite:reload"),setTimeout(()=>{var ue;return(ue=window.refreshPreview)==null?void 0:ue.call(window)},400),(ee=window.refreshPublishState)==null||ee.call(window,{silent:!0});let D=t.openTabs.find(ue=>ue.path==="assets/css/tailwind.css");D&&L.path!=="assets/css/tailwind.css"&&$.get("/files/content?path=assets/css/tailwind.css").then(({ok:ue,data:re})=>{ue&&typeof(re==null?void 0:re.content)=="string"&&(D.baseline=re.content,D._buffer=re.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(re.content))})},Bt=()=>{let L=B=>{B&&(B.querySelectorAll("[data-file]").forEach(T=>{T.addEventListener("click",A=>{A.target.closest("[data-delete-file]")||H(T.dataset.file)})}),B.querySelectorAll("[data-delete-file]").forEach(T=>{T.addEventListener("click",A=>{A.stopPropagation(),se(T.dataset.deleteFile)})}),B.querySelectorAll("[data-restore-file]").forEach(T=>{T.addEventListener("click",A=>{A.stopPropagation(),te(T.dataset.restoreFile)})}),B.querySelectorAll("[data-compile-tailwind]").forEach(T=>{T.addEventListener("click",async A=>{var ue,re;if(A.stopPropagation(),(ue=window.demoGuard)!=null&&ue.call(window)||(re=window.viewerGuard)!=null&&re.call(window))return;T.style.opacity="0.4",T.style.pointerEvents="none",w("Compiling Tailwind\u2026");let{ok:D,data:G,error:J}=await $.post("/files/compile-tailwind");if(T.style.opacity="",T.style.pointerEvents="",!D){I((J==null?void 0:J.message)||"Tailwind compilation failed.","error"),w("Compile failed","error");return}let z="assets/css/tailwind.css",W=t.openTabs.find($e=>$e.path===z);W&&(W.baseline=G.content,W.dirty=!1,t.activeTab===z&&t.monacoInstance&&t.monacoInstance.setValue(G.content));let ee=G.class_count??0;I(`Tailwind CSS recompiled \u2014 ${ee} utilities.`,"success"),w("Compiled")})}),B.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(T=>{T.addEventListener("click",A=>{A.stopPropagation();let D=T.closest(".vs-tree-item"),G=D.dataset.folder;if(!G)return;let J=t.expandedFolders.has(G);J?t.expandedFolders.delete(G):t.expandedFolders.add(G);let z=!J,W=D.querySelector(".vs-tree-folder-toggle");W&&W.setAttribute("data-expanded",String(z));let ee=D.nextElementSibling;ee&&ee.classList.contains("vs-tree-folder-children")&&(ee.setAttribute("data-collapsed",String(!z)),ee.style.display=z?"":"none");let ue=D.querySelector(".vs-tree-item-icon");ue&&(ue.innerHTML=z?E.folderOpen||E.folder:E.folder),s()})}))};L(n),L(o),L(i),document.querySelectorAll(".vs-explorer-section-header").forEach(B=>{B.dataset.bound||(B.dataset.bound="true",B.addEventListener("click",()=>{let T=B.dataset.section,A=B.closest(".vs-explorer-section"),D=A==null?void 0:A.querySelector(".vs-editor-tree");!A||!D||(t.expandedSections.has(T)?(t.expandedSections.delete(T),B.classList.remove("is-expanded"),D.style.display="none"):(t.expandedSections.add(T),B.classList.add("is-expanded"),D.style.display="block"),s())}))})},_t=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(L=>{L.addEventListener("click",B=>{B.target.closest("[data-close-tab]")||F(L.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(L=>{L.addEventListener("click",B=>{B.stopPropagation(),V(L.dataset.closeTab)})}))};if(h&&u){let L=!1;h.addEventListener("mousedown",B=>{B.preventDefault(),L=!0,h.classList.add("is-dragging");let T=D=>{if(!L)return;let G=Math.min(400,Math.max(200,D.clientX));u.style.width=G+"px"},A=()=>{L=!1,h.classList.remove("is-dragging"),document.removeEventListener("mousemove",T),document.removeEventListener("mouseup",A),t.sidebarWidth=u.offsetWidth,s()};document.addEventListener("mousemove",T),document.addEventListener("mouseup",A)})}c==null||c.addEventListener("click",dt),g==null||g.addEventListener("change",L=>{let B=parseInt(L.target.value,10);t.fontSize=B,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:B}),s()}),b==null||b.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,k(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),m==null||m.addEventListener("click",()=>M()),f==null||f.addEventListener("click",async()=>{var J,z,W;if((J=window.demoGuard)!=null&&J.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let L=await wr({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!L||!L.trim())return;let B=L.trim(),T=(W=B.split(".").pop())==null?void 0:W.toLowerCase(),A=["php","css","js","json"];if(!T||!A.includes(T)){I(`Only ${A.join(", ")} files can be created.`,"warning");return}w("Creating\u2026");let{ok:D,error:G}=await $.post("/files/create",{path:B});if(!D){I((G==null?void 0:G.message)||"Could not create file.","error"),w("Create failed","error");return}await M(),await H(B),I(`Created ${B}`,"success")});let Os=L=>{if(t.disposed){document.removeEventListener("keydown",Os);return}(L.metaKey||L.ctrlKey)&&L.key==="s"&&(L.preventDefault(),dt())};document.addEventListener("keydown",Os);let M=async()=>{var A;let{ok:L,data:B,error:T}=await $.get("/files");if(!L||!((A=B==null?void 0:B.files)!=null&&A.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=B.files,t.treeData={site:_(B.files.filter(D=>!D.path.startsWith("_prompts/")&&!D.path.startsWith("_root/"))),config:_(B.files.filter(D=>D.path.startsWith("_root/")),"_root/"),prompts:_(B.files.filter(D=>D.path.startsWith("_prompts/")),"_prompts/")},P()},U=async()=>{if(!d)return;let L;try{L=await Xo()}catch{I("Monaco editor is not available.","warning");return}t.monaco=L;let B=Vs();L.editor.setTheme(B);let T=L.editor.create(d,{value:"",language:"php",theme:B,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=T,T.onDidChangeModelContent(()=>nt()),T.addCommand(L.KeyMod.CtrlCmd|L.KeyCode.KeyK,async()=>{var Be;if(t.monacoInstance.getOption(L.editor.EditorOption.readOnly)){I("Cannot use inline AI on a read-only file.","warning");return}let D=t.activeTab;if(!D)return;let G=t.monacoInstance.getModel(),J=t.monacoInstance.getSelection(),z=G.getValueInRange(J);if(!z||z.trim()===""){let ae=t.monacoInstance.getPosition(),Ie=G.getLineContent(ae.lineNumber);if(Ie.trim()===""){I("Highlight a block of code to edit.","warning");return}z=Ie,t.monacoInstance.setSelection(new L.Range(ae.lineNumber,1,ae.lineNumber,G.getLineMaxColumn(ae.lineNumber)))}let W=await A(D);if(!W)return;let ee=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let ue=new AbortController,re=0,$e=Date.now(),be=document.createElement("div");be.className="vs-inline-ai-overlay",be.innerHTML=`
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
      `,document.body.appendChild(be),requestAnimationFrame(()=>be.classList.add("is-visible"));let Me=be.querySelector("#ai-gen-timer"),he=setInterval(()=>{let ae=Math.floor((Date.now()-$e)/1e3);Me&&(Me.textContent=`${ae}s`)},1e3);(Be=be.querySelector("#ai-gen-stop"))==null||Be.addEventListener("click",()=>{ue.abort()}),w("AI is editing...","muted");try{await qt("/ai/prompt",{user_prompt:W,action_type:"inline_edit",action_data:{path:D,selection:z}},{signal:ue.signal,onStatus:ae=>{let Ie=be.querySelector("#ai-gen-step"),Ae=typeof ae=="string"?ae:ae.message||"Generating\u2026";Ie&&(Ie.textContent=Ae)},onToken:()=>{re++;let ae=be.querySelector("#ai-gen-tokens"),Ie=be.querySelector("#ai-gen-token-dot");ae&&(ae.textContent=`${re} tokens`),Ie&&(Ie.style.display="")},onFile:()=>{let ae=be.querySelector("#ai-gen-step");ae&&(ae.textContent="Applying changes\u2026")},onError:ae=>{I(ae.message||"Generation failed","error")},onDone:async ae=>{var Ae;if(ae.cancelled){I("Generation cancelled","info");return}if((Ae=ae.files_modified)==null?void 0:Ae.some(Je=>(typeof Je=="string"?Je:(Je==null?void 0:Je.path)||"").replace(/^\//,"")===D.replace(/^\//,""))){let{ok:Je,data:le}=await $.get(`/files/content?path=${encodeURIComponent(D)}&_t=${Date.now()}`);if(Je&&(le!=null&&le.content)){let Pe=le.content;await $.put("/files/content",{path:D,content:ee}),t.monacoInstance.getModel().setValue(Pe);let Xt=t.openTabs.find(rt=>rt.path===D);Xt&&(Xt._buffer=Pe,Xt.baseline=ee),nt(),I("Review changes and save.","success")}}else ae.partial||I("Complete (No changes made to this file)","info")}})}finally{clearInterval(he),t.monacoInstance.updateOptions({readOnly:!1}),be.classList.remove("is-visible"),setTimeout(()=>be.remove(),300),w("Ready","muted")}});function A(D){return new Promise(G=>{var Me;let J=document.getElementById("vs-inline-ai-prompt-overlay");J&&J.remove();let z=D.split("/").pop(),W=document.createElement("div");W.id="vs-inline-ai-prompt-overlay",W.className="vs-modal-overlay",W.innerHTML=`
          <div class="vs-inline-ai-prompt">
            <div class="vs-inline-ai-prompt-header">
              <svg class="vs-inline-ai-prompt-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span class="vs-inline-ai-prompt-title">Edit with AI</span>
              <span class="vs-inline-ai-prompt-subtitle" title="${D}">${z}</span>
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
        `;let ee=he=>{document.removeEventListener("keydown",ue),we(W),G(he)},ue=he=>{he.key==="Escape"&&(he.preventDefault(),ee(null))};document.body.appendChild(W),requestAnimationFrame(()=>W.classList.add("is-visible"));let re=W.querySelector("#vs-inline-ai-input"),$e=()=>{re.style.height="auto",re.style.height=Math.min(re.scrollHeight,160)+"px"};re.addEventListener("input",$e),setTimeout(()=>re==null?void 0:re.focus(),200);let be=null;W.addEventListener("mousedown",he=>{be=he.target}),W.addEventListener("click",he=>{he.target===W&&be===W&&ee(null)}),(Me=W.querySelector("#vs-inline-ai-go"))==null||Me.addEventListener("click",()=>{let he=((re==null?void 0:re.value)||"").trim();he&&ee(he)}),re==null||re.addEventListener("keydown",he=>{if(he.key==="Enter"&&(he.metaKey||he.ctrlKey)){he.preventDefault();let Be=((re==null?void 0:re.value)||"").trim();Be&&ee(Be)}}),document.addEventListener("keydown",ue)})}};if(await Promise.all([M(),U()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:L,active:B}=t._pendingRestore;t._pendingRestore=null;for(let T of L){if(!t.files.some(G=>G.path===T))continue;let{ok:A,data:D}=await $.get(`/files/content?path=${encodeURIComponent(T)}`);A&&typeof(D==null?void 0:D.content)=="string"&&t.openTabs.push({path:T,baseline:D.content,dirty:!1})}if(t.openTabs.length>0){let T=B&&t.openTabs.find(A=>A.path===B)?B:t.openTabs[0].path;S(),await F(T),O(((ne=t.openTabs.find(A=>A.path===T))==null?void 0:ne.baseline)||"",T),w("Ready")}}if(window.__vsEditorPendingFile){let L=window.__vsEditorPendingFile;window.__vsEditorPendingFile=null,t.files.some(B=>B.path===L)&&await H(L)}window.__vsEditorPage&&(window.__vsEditorPage.openFile=H)}function Vs(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function Xo(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:Vn||(Vn=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,r){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw Vn=null,t}),Vn)}async function Wn(e=""){var Z,Y,q,de,Q;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),r=s.querySelector("#vs-code-meta"),l=s.querySelector("#vs-code-status"),d=s.querySelector("#vs-code-editor-host"),v={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},p=(N,S="muted")=>{l&&(l.textContent=N,l.dataset.state=S)},c=()=>v.files.find(N=>N.path===v.path)||null,m=()=>!!v.editor&&v.editor.getValue()!==v.baseline,f=()=>{if(!r)return;let N=c();if(!N){r.textContent="No file selected";return}let S=N.size?`${(Number(N.size)/1024).toFixed(1)} KB`:"0 KB",H=N.modified?new Date(N.modified).toLocaleString():"Unknown date";r.textContent=`${N.path} \u2022 ${S} \u2022 ${H}`},u=window.IS_DEMO||!((Z=window.canWrite)!=null&&Z.call(window)),h=()=>{if(u)return!0;let N=c();return(N==null?void 0:N.readonly)===!0},g=()=>{if(!o)return;if(h()){o.disabled=!0,o.textContent="Read Only",p("Read-only mode","muted");return}let S=m();o.disabled=!S,o.textContent=S?"Save Changes":"Saved",S?p("Unsaved changes","warning"):v.path&&p(v.path||"Ready","muted")},b=async()=>{var N;v.closed||m()&&!await Ce({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(v.closed=!0,(N=v.editorCleanup)!=null&&N.dispose&&(v.editorCleanup.dispose(),v.editorCleanup=null),v.editor&&(v.editor.dispose(),v.editor=null),we(s))},k=(N,S=null)=>{if(!v.editor)return;v.editor.setValue(N),v.baseline=N;let H=(S==null?void 0:S.language)||Nn(v.path);v.editor.setLanguage&&v.editor.setLanguage(H),v.editor.setReadOnly&&v.editor.setReadOnly(h()),f(),g()},w=async(N,{silent:S=!1}={})=>{if(!N||!v.editor)return!1;v.path=N,S||p("Loading file\u2026");let{ok:H,data:F,error:V}=await $.get(`/files/content?path=${encodeURIComponent(N)}`);if(!H)return I((V==null?void 0:V.message)||"Could not load file.","error"),p("Load failed","error"),!1;let se=typeof(F==null?void 0:F.content)=="string"?F.content:"";return k(se,(F==null?void 0:F.file)||c()),!0},x=async()=>m()?await Ce({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,C=async N=>{if(!N||N===v.path)return;if(!await x()){n&&(n.value=v.path);return}await w(N)},_=async()=>{var F,V,se;if(!v.editor||!v.path||!o)return;let N=v.editor.getValue();if(N===v.baseline){g();return}o.disabled=!0,o.textContent="Saving\u2026",p("Saving\u2026");let{ok:S,error:H}=await $.put("/files/content",{path:v.path,content:N});if(!S){o.disabled=!1,o.textContent="Save Changes",I((H==null?void 0:H.message)||"Could not save file.","error"),p("Save failed","error");return}v.baseline=N,g(),p(v.path||"Ready","muted"),v.path.toLowerCase().endsWith(".css")?(F=window.sendPreviewMessage)==null||F.call(window,"voxelsite:reload-css"):(V=window.sendPreviewMessage)==null||V.call(window,"voxelsite:reload"),setTimeout(()=>{var te;return(te=window.refreshPreview)==null?void 0:te.call(window)},400),(se=window.refreshPublishState)==null||se.call(window,{silent:!0})},P=N=>{N.key==="Escape"&&(N.preventDefault(),b())};a==null||a.addEventListener("click",()=>b()),i==null||i.addEventListener("click",async()=>{!v.path||!await x()||await w(v.path)}),o==null||o.addEventListener("click",()=>_()),n==null||n.addEventListener("change",N=>{C(N.target.value)}),s.addEventListener("click",N=>{N.target===s&&b()}),document.addEventListener("keydown",P);let j=()=>document.removeEventListener("keydown",P);s.addEventListener("transitionend",()=>{document.body.contains(s)||j()});try{let N=await $.get("/files");if(!N.ok||!((q=(Y=N.data)==null?void 0:Y.files)!=null&&q.length)){let V=((de=N.error)==null?void 0:de.message)||"No editable files found.";I(V,"error"),b();return}let S=N.data.files;v.files=S,n&&(n.innerHTML=S.map(V=>{let se=V.group?`${String(V.group).toUpperCase()} \xB7 `:"";return`<option value="${y(V.path)}">${y(se+V.path)}</option>`}).join(""));let H=((Q=S.find(V=>V.path===e))==null?void 0:Q.path)||S[0].path;v.path=H,n&&(n.value=H),d.innerHTML="";let F=null;try{F=await Xo()}catch{I("Monaco is not available yet. Using fallback editor.","warning"),p("Fallback editor active","warning")}if(F!=null&&F.editor){let V=Vs();F.editor.setTheme(V);let se=F.editor.create(d,{value:"",language:Nn(H),theme:V,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",readOnly:h(),fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});v.editor={getValue:()=>se.getValue(),setValue:te=>se.setValue(te),setLanguage:te=>{let O=se.getModel();O&&F.editor.setModelLanguage(O,te)},setReadOnly:te=>se.updateOptions({readOnly:te}),dispose:()=>se.dispose()},v.editorCleanup=se.onDidChangeModelContent(()=>{g()})}else{d.innerHTML=`<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"${h()?" readonly":""}></textarea>`;let V=d.querySelector("#vs-code-editor-fallback"),se=()=>g();V==null||V.addEventListener("input",se),v.editor={getValue:()=>(V==null?void 0:V.value)||"",setValue:te=>{V&&(V.value=te)},setLanguage:()=>{},setReadOnly:te=>{V&&(V.readOnly=te)},dispose:()=>{V==null||V.removeEventListener("input",se)}}}await w(H,{silent:!0}),p("Ready")}catch(N){I((N==null?void 0:N.message)||"Could not initialize code editor.","error"),b()}finally{let N=new MutationObserver(()=>{document.body.contains(s)||(j(),N.disconnect())});N.observe(document.body,{childList:!0,subtree:!0})}}var ce=Object.freeze({SET_TEXT:"set_text",SET_ATTRIBUTE:"set_attribute",ADD_CLASS_TOKEN:"add_class_token",REMOVE_CLASS_TOKEN:"remove_class_token",SET_CLASS_LIST:"set_class_list",MOVE_BEFORE:"move_before",MOVE_AFTER:"move_after",INSERT_NODE:"insert_node",DELETE_NODE:"delete_node",REPLACE_HTML:"replace_html",FALLBACK:"fallback"}),Ir=0;function ft(){Ir++;let e=Math.random().toString(36).substring(2,6);return`op_${Date.now()}_${Ir}_${e}`}function oa(e,t,s,n){return{id:ft(),type:ce.SET_TEXT,address:e,payload:{oldText:t,newText:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Gn(e,t,s,n,o){return{id:ft(),type:ce.SET_ATTRIBUTE,address:e,payload:{attrName:t,oldValue:s,newValue:n},filePath:o||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function _r(e,t,s,n,o,i){return{id:ft(),type:ce.SET_CLASS_LIST,address:e,payload:{oldClassStr:t,newClassStr:s,additions:n,removals:o},filePath:i||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Ar(e,t,s,n,o){return{id:ft(),type:ce.DELETE_NODE,address:e,payload:{outerHTML:t,parentAddress:n||null,siblingIndex:typeof o=="number"?o:-1},filePath:s||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Pr(e,t,s,n){return{id:ft(),type:ce.REPLACE_HTML,address:e,payload:{oldHTML:t,newHTML:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Rr(e){if(!e||!e.type)return null;switch(e.type){case ce.SET_TEXT:return{...e,id:ft(),payload:{oldText:e.payload.newText,newText:e.payload.oldText}};case ce.SET_ATTRIBUTE:return{...e,id:ft(),payload:{attrName:e.payload.attrName,oldValue:e.payload.newValue,newValue:e.payload.oldValue}};case ce.ADD_CLASS_TOKEN:return{...e,id:ft(),type:ce.REMOVE_CLASS_TOKEN};case ce.REMOVE_CLASS_TOKEN:return{...e,id:ft(),type:ce.ADD_CLASS_TOKEN};case ce.SET_CLASS_LIST:return{...e,id:ft(),payload:{oldClassStr:e.payload.newClassStr,newClassStr:e.payload.oldClassStr,additions:e.payload.removals,removals:e.payload.additions}};case ce.DELETE_NODE:return{...e,id:ft(),type:ce.INSERT_NODE,payload:{html:e.payload.outerHTML,parentAddress:e.payload.parentAddress||null,siblingIndex:e.payload.siblingIndex??-1}};case ce.REPLACE_HTML:return{...e,id:ft(),payload:{oldHTML:e.payload.newHTML,newHTML:e.payload.oldHTML}};case ce.MOVE_BEFORE:case ce.MOVE_AFTER:return{...e,id:ft(),payload:{fromIndex:e.payload.toIndex,toIndex:e.payload.fromIndex}};case ce.FALLBACK:return null;default:return null}}function ia(e){var t,s,n,o,i,a,r,l,d,v,p,c,m;if(!e)return{valid:!1,reason:"Operation is null"};if(!e.type)return{valid:!1,reason:"Missing operation type"};if(!e.id)return{valid:!1,reason:"Missing operation ID"};if(e.type===ce.FALLBACK)return{valid:!0};if(!e.address)return{valid:!1,reason:"Missing source address"};switch(e.type){case ce.SET_TEXT:if(typeof((t=e.payload)==null?void 0:t.newText)!="string")return{valid:!1,reason:"SET_TEXT requires payload.newText"};break;case ce.SET_ATTRIBUTE:if(!((s=e.payload)!=null&&s.attrName))return{valid:!1,reason:"SET_ATTRIBUTE requires payload.attrName"};break;case ce.ADD_CLASS_TOKEN:case ce.REMOVE_CLASS_TOKEN:if(!((n=e.payload)!=null&&n.token))return{valid:!1,reason:`${e.type} requires payload.token`};break;case ce.SET_CLASS_LIST:if(!Array.isArray((o=e.payload)==null?void 0:o.additions)||!Array.isArray((i=e.payload)==null?void 0:i.removals))return{valid:!1,reason:"SET_CLASS_LIST requires payload.additions and payload.removals arrays"};break;case ce.DELETE_NODE:if(!((a=e.payload)!=null&&a.outerHTML))return{valid:!1,reason:"DELETE_NODE requires payload.outerHTML"};break;case ce.INSERT_NODE:if(!((r=e.payload)!=null&&r.html))return{valid:!1,reason:"INSERT_NODE requires payload.html"};if(typeof((l=e.payload)==null?void 0:l.siblingIndex)!="number"||e.payload.siblingIndex<0)return{valid:!1,reason:"INSERT_NODE requires payload.siblingIndex (>= 0) for deterministic reinsertion"};if(!((d=e.payload)!=null&&d.parentAddress))return{valid:!1,reason:"INSERT_NODE requires payload.parentAddress for reinsertion target"};break;case ce.REPLACE_HTML:if(!((v=e.payload)!=null&&v.oldHTML)||!((p=e.payload)!=null&&p.newHTML))return{valid:!1,reason:"REPLACE_HTML requires payload.oldHTML and payload.newHTML"};break;case ce.MOVE_BEFORE:case ce.MOVE_AFTER:if(typeof((c=e.payload)==null?void 0:c.fromIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.fromIndex`};if(typeof((m=e.payload)==null?void 0:m.toIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.toIndex`};break}return{valid:!0}}function aa(e){return{[ce.SET_TEXT]:"Text edit",[ce.SET_ATTRIBUTE]:"Attribute change",[ce.ADD_CLASS_TOKEN]:"Add class",[ce.REMOVE_CLASS_TOKEN]:"Remove class",[ce.SET_CLASS_LIST]:"Style change",[ce.MOVE_BEFORE]:"Move element",[ce.MOVE_AFTER]:"Move element",[ce.INSERT_NODE]:"Insert element",[ce.DELETE_NODE]:"Delete element",[ce.REPLACE_HTML]:"Source edit",[ce.FALLBACK]:"Legacy edit"}[e]||e}var Dr=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),Hr=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]);function Kn(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function Nr(e,t,s){let n=Kn(e,t);if(!n)return null;if(Hr.has(s)||n.trimEnd().endsWith("/>"))return{element:n,startIndex:t,endIndex:t+n.length};let o=t+n.length,i=new RegExp(`<${s}[\\s>]`,"gi"),a=new RegExp(`</${s}\\s*>`,"gi"),r=1,l=o,d=Math.min(e.length,t+5e4);for(;l<d&&r>0;){i.lastIndex=l,a.lastIndex=l;let v=i.exec(e),p=a.exec(e);if(!p)return null;let c=v?v.index:1/0,m=p.index;c<m&&c<d?(r++,l=c+v[0].length):(r--,l=m+p[0].length)}return r!==0?null:{element:e.substring(t,l),startIndex:t,endIndex:l}}function Xn(e,t){if(!t)return null;let s=t.lastIndexOf(":");if(s===-1)return null;let n=parseInt(t.substring(s+1),10);if(isNaN(n)||n<0)return null;let o=/<([a-z][a-z0-9]*)[\s>]/gi,i,a=0;for(;(i=o.exec(e))!==null;){let r=i[1].toLowerCase();if(!(Dr.has(r)||e.substring(i.index,i.index+500).includes("data-vx-source"))){if(a===n){let d=Nr(e,i.index,r);return d?{...d,tag:r}:null}a++}}return null}function na(e,t,s,n){if(n==null){let a=new RegExp(`\\s+${t}=["'][^"']*["']`,"i");return a.test(e)?e.replace(a,""):null}let o=new RegExp(`(${t}=["'])([^"']*)(["'])`,"i");return e.match(o)?e.replace(o,`$1${n}$3`):s==null?e.replace(/>$/,` ${t}="${n}">`):null}function Jo(e,t){if(!e||!e.type)return{content:t,applied:!1,reason:"null or untyped operation"};let s=ia(e);if(!s.valid)return{content:t,applied:!1,reason:`validation failed: ${s.reason}`};if(e.type===ce.FALLBACK)return{content:t,applied:!1,reason:"fallback ops are not persistable via applyOp"};switch(e.type){case ce.SET_TEXT:return Dc(e,t);case ce.SET_ATTRIBUTE:return Hc(e,t);case ce.SET_CLASS_LIST:return Nc(e,t);case ce.REPLACE_HTML:return jc(e,t);case ce.DELETE_NODE:return Oc(e,t);case ce.INSERT_NODE:return qc(e,t);default:return{content:t,applied:!1,reason:`unsupported op type: ${e.type}`}}}function Dc(e,t){var i;let{oldText:s,newText:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=Xn(t,o);if(a){let r=Kn(t,a.startIndex);if(r&&!Hr.has(a.tag)){let l=a.element.lastIndexOf("</");if(l>r.length){let d=a.element.substring(r.length,l);if(!(s&&Yo(d)!==Yo(s))){let v=a.element.substring(l),p=r+n+v;return{content:t.substring(0,a.startIndex)+p+t.substring(a.endIndex),applied:!0,strategy:"nodeKey"}}}}}}if(s){let a=t.split(s).length-1;return a===0?{content:t,applied:!1,reason:"oldText not found in source"}:a>1?{content:t,applied:!1,reason:"ambiguous: oldText appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data (no nodeKey, no oldText)"}}function Hc(e,t){var a;let{attrName:s,oldValue:n,newValue:o}=e.payload,i=(a=e.address)==null?void 0:a.nodeKey;if(i){let r=Xn(t,i);if(r){let l=Kn(t,r.startIndex);if(l)if(n!=null){let d=l.includes(`${s}="${n}"`),v=l.includes(`${s}='${n}'`);if(!(!d&&!v)){let p=na(l,s,n,o);if(p!==null)return{content:t.substring(0,r.startIndex)+p+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}else{let d=na(l,s,n,o);if(d!==null)return{content:t.substring(0,r.startIndex)+d+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}}if(n!=null){let r=`${s}="${n}"`,l=t.split(r).length-1;if(l===0){let d=`${s}='${n}'`,v=t.split(d).length-1;return v===0?{content:t,applied:!1,reason:`attribute ${s}="${n}" not found`}:v>1?{content:t,applied:!1,reason:`ambiguous: ${s}='${n}' appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}='${Br(n)}'`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(d,`${s}='${o}'`),applied:!0,strategy:"contentMatch"}}return l>1?{content:t,applied:!1,reason:`ambiguous: ${s}="${n}" appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}="${Br(n)}"`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(r,`${s}="${o}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_attribute"}}function Nc(e,t){var i;let{oldClassStr:s,newClassStr:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=Xn(t,o);if(a){let r=Kn(t,a.startIndex);if(r&&!(s&&!r.includes(`class="${s}"`)&&!r.includes(`class='${s}'`))){let l=na(r,"class",s,n);if(l!==null)return{content:t.substring(0,a.startIndex)+l+t.substring(a.startIndex+r.length),applied:!0,strategy:"nodeKey"}}}}if(s){let a=`class="${s}"`,r=t.split(a).length-1;return r===0?{content:t,applied:!1,reason:`class="${s}" not found in source`}:r>1?{content:t,applied:!1,reason:`ambiguous: class="${s}" appears multiple times`}:{content:t.replace(a,`class="${n}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_class_list"}}function jc(e,t){let{oldHTML:s,newHTML:n}=e.payload,o=t.split(s).length-1;return o===0?{content:t,applied:!1,reason:"oldHTML not found in source"}:o>1?{content:t,applied:!1,reason:"ambiguous: oldHTML appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}function Oc(e,t){var o;let{outerHTML:s}=e.payload,n=(o=e.address)==null?void 0:o.nodeKey;if(n){let i=Xn(t,n);if(i&&!(s&&Yo(i.element)!==Yo(s)))return{content:t.substring(0,i.startIndex)+t.substring(i.endIndex),applied:!0,strategy:"nodeKey"}}if(s){let i=t.split(s).length-1;return i===0?{content:t,applied:!1,reason:"element outerHTML not found in source"}:i>1?{content:t,applied:!1,reason:"ambiguous: element outerHTML appears multiple times"}:{content:t.replace(s,""),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for delete_node"}}function qc(e,t){let{html:s,parentAddress:n,siblingIndex:o}=e.payload;if(!(n!=null&&n.nodeKey))return{content:t,applied:!1,reason:"insert_node requires parentAddress.nodeKey"};let i=Xn(t,n.nodeKey);if(!i)return{content:t,applied:!1,reason:"parent element not found by nodeKey"};let a=Kn(t,i.startIndex);if(!a)return{content:t,applied:!1,reason:"cannot parse parent opening tag"};let r=i.startIndex+a.length,l=i.element.lastIndexOf("</");if(l<=a.length)return{content:t,applied:!1,reason:"cannot determine parent inner content"};let d=i.element.substring(a.length,l),v=i.startIndex+a.length,p=/<([a-z][a-z0-9]*)[\s>]/gi,c,m=0,f=0;for(;(c=p.exec(d))!==null;){let g=c[1].toLowerCase();if(Dr.has(g))continue;if(m===o){f=c.index;break}let b=Nr(d,c.index,g);b&&(p.lastIndex=b.endIndex),m++}m<o&&(f=d.length);let u=v+f;return{content:t.substring(0,u)+s+t.substring(u),applied:!0,strategy:"nodeKey"}}function Br(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Yo(e){return(e||"").replace(/\s+/g," ").trim()}var jr=50,ht=[],ts=[],Fc=new Set;function Yn(e,t){if(!e)return!1;let s=Rr(e);if(!s)return console.warn("[VX History] Op is not invertible \u2014 skipping history entry:",e.type,e.id),!1;let n=ia(s);return n.valid?(ht.push({forwardOp:e,inverseOp:s,timestamp:Date.now(),filePath:t||e.filePath||""}),ht.length>jr&&(ht=ht.slice(ht.length-jr)),ts=[],Zo(),!0):(console.warn("[VX History] Inverse op failed validation \u2014 skipping:",n.reason),!1)}function Or(){return ht.length===0?null:ht[ht.length-1]}function qr(){if(ht.length===0)return null;let e=ht.pop();return ts.push(e),Zo(),e}function Fr(){return ts.length===0?null:ts[ts.length-1]}function zr(){if(ts.length===0)return null;let e=ts.pop();return ht.push(e),Zo(),e}function ra(e){let t=ht.length>0||ts.length>0;ht=[],ts=[],t&&console.info("[VX History] Cleared:",e),Zo()}function Zo(){for(let e of Fc)try{e()}catch(t){console.error("[VX History] Listener error:",t)}}var ot=!1,Ze=null,it=null,Ws=[],Qo=!1,la=[],zc=200,Ur=!1,mn=0,Re={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function fa(){ot=!ot,ml(),fe({type:"vx-editor:toggle",active:ot}),ot||(lt(),ni(),bt(),Pt(),Ze=null,as=!1)}function Zn(){return ot}function Qr(){return ot&&Ze!==null}function ha(){return!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")}function Ge(){let e=!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")||!!document.querySelector(".vx-modal-overlay")||!!document.querySelector(".vx-source-editor")||as;fe({type:"vx-editor:set-panel-lock",locked:e})}function ba(){bt(),Pt()}function si(){return Qe?(Qe.abort(),Qe=null,xs(),$t&&($.post("/ai/cancel-generation",{prompt_id:$t}).catch(()=>{}),$t=null),!0):!1}var ei=null;function el(e){var o;xs();let t=document.createElement("div");t.className="vs-inline-ai-overlay",t.id="vx-ai-gen-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=Date.now(),n=t.querySelector("#vx-ai-gen-timer");ei=setInterval(()=>{let i=Math.floor((Date.now()-s)/1e3);n&&(n.textContent=i<60?`${i}s`:`${Math.floor(i/60)}m ${i%60}s`)},1e3),(o=t.querySelector("#vx-ai-gen-stop"))==null||o.addEventListener("click",()=>{si()}),fe({type:"vx-editor:show-ai-overlay"})}function un(e,t){let s=document.getElementById("vx-ai-gen-step");if(s&&e&&(s.textContent=e),t!==void 0&&t>0){let n=document.getElementById("vx-ai-gen-token-dot"),o=document.getElementById("vx-ai-gen-tokens");n&&(n.style.display=""),o&&(o.textContent=`${t.toLocaleString()} tokens`)}}function xs(){ei&&(clearInterval(ei),ei=null);let e=document.getElementById("vx-ai-gen-overlay");e&&(e.classList.remove("is-visible"),setTimeout(()=>e.remove(),250)),fe({type:"vx-editor:hide-ai-overlay"})}function hn(){ot&&(ot=!1,ml(),fe({type:"vx-editor:toggle",active:!1}),lt(),ni(),bt(),Pt(),Ze=null,as=!1)}function Qn(){lt(),ni(),bt(),Pt(),Ze=null,it=null,as=!1,fe({type:"vx-editor:deselect-from-parent"})}function tl(){if(Ur)return;Ur=!0,window.addEventListener("message",Uc),document.addEventListener("keydown",t=>{if(ot&&(t.metaKey||t.ctrlKey)&&t.key==="e"){let s=document.activeElement;if(s){let o=s.tagName;if(o==="INPUT"||o==="TEXTAREA"||o==="SELECT"||o==="BUTTON"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor"))return}let n=it;n&&!Ko(n)&&n.sourceFile&&(t.preventDefault(),Wn(n.sourceFile),lt())}}),document.addEventListener("keydown",t=>{if(!ot||!(t.metaKey||t.ctrlKey)||t.key!=="z")return;let s=document.activeElement;if(s){let n=s.tagName;if(n==="INPUT"||n==="TEXTAREA"||n==="SELECT"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor, .monaco-editor"))return}t.preventDefault(),t.shiftKey?Np():Hp()});let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{as&&sl(),mn>0?mn--:ra("preview iframe reloaded"),ot&&setTimeout(()=>fe({type:"vx-editor:toggle",active:!0}),200)})}function Uc(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":Ze=e.data,it=Us(e.data.sourceAddress),bt(),Pt(),rl(e.data);break;case"vx-editor:text-changed":ti(e.data),e.data.changeKind||(clearTimeout(ti._timer),(async()=>{for(;Qo;)await new Promise(t=>setTimeout(t,50));await Promise.all([fn(),new Promise(t=>setTimeout(t,400))]),fe({type:"vx-editor:text-save-complete"})})());break;case"vx-editor:source-edit-changed":ul(e.data);break;case"vx-editor:element-deleted":ma(e.data);break;case"vx-editor:deselect":lt(),ni(),bt(),Pt(),Ze=null,it=null;break;case"vx-editor:save-request":fn();break;case"vx-editor:editing-started":Vc(e.data);break;case"vx-editor:editing-ended":sl();break;case"vx-editor:selection-state":Wc(e.data);break;case"vx-editor:element-rect":Gc(e.data);break;case"vx-editor:richtext-link-request":al();break;case"vx-editor:add-section-request":$p(e.data);break;case"vx-editor:section-moved":Ap(e.data);break;case"vx-editor:bridge-ready":mn>0?mn--:ra("bridge re-initialized"),ot&&fe({type:"vx-editor:toggle",active:!0});break;case"vx-editor:source-edit-ready":ep(e.data);break;case"vx-editor:escape-pressed":if(si())break;if(ha()){ba();break}hn();break}}var as=!1,ya=!1,ys=null,gn={},bs=null,vn=[],pa=null;function Vc(e){as=!0,ya=!!e.hasPhp,ys=e.rect||null,gn={},pa=e.tagName||"P",lt(),Kc(),Ge()}function sl(){as=!1,ya=!1,ys=null,gn={},il(),Ge()}function Wc(e){if(as){if(e.elementRect&&(ys=e.elementRect,nl()),!e.hasSelection){gn={},bs=null,vn=[],Vr();return}gn=e.formatting||{},pa=e.blockTag||pa,bs=e.link||null,vn=e.linkClasses||[],Vr()}}function Gc(e){as&&e.rect&&(ys=e.rect,nl())}function nl(){let e=document.getElementById("vx-richtext-toolbar");e&&ol(e)}function Kc(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),ol(e),Xc(e),e.classList.add("vx-rt-visible")}function ol(e){if(!ys)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+ys.left,o=s.top+ys.top,i=ys.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function Xc(e){var i;let t=gn,s=ya;e.innerHTML=`<div class="vx-rt-actions">
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
  </div>`,e.querySelectorAll("[data-cmd]").forEach(a=>{a.addEventListener("click",r=>{r.stopPropagation();let l=a.dataset.cmd;if(l==="insertLink"){al();return}fe({type:"vx-editor:richtext-command",command:l})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",a=>{a.stopPropagation(),fe({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",a=>{a.stopPropagation(),fe({type:"vx-editor:save-edit"})})}function Vr(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=gn,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function il(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function ni(){il()}function al(){let e=bs?bs.href:"",t=bs?bs.target:"",s=bs&&bs.className||"",n=vn.length>0||!!s,o=`<option value=""${s?"":" selected"}>No class</option>`;if(vn.length>0){let p=vn.includes(s);o+=vn.map(c=>`<option value="${Ct(c)}"${s===c?" selected":""}>${et(c)}</option>`).join(""),s&&!p&&(o+=`<option value="${Ct(s)}" selected>${et(s)}</option>`)}else s&&(o+=`<option value="${Ct(s)}" selected>${et(s)}</option>`);let i=document.createElement("div");i.className="vx-modal-overlay",i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>${e?"Edit":"Insert"} Link</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <div class="vx-form-group"><label class="vx-form-label">URL</label>
          <input type="url" id="vx-link-url" class="vx-form-input" value="${Ct(e)}" placeholder="https://" autocomplete="off" spellcheck="false">
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
  `,document.body.appendChild(i),i.offsetHeight,i.classList.add("vx-modal-visible"),Ge(),vl(i);let a=i.querySelector("#vx-link-url");setTimeout(()=>{a.focus(),a.select()},50);let r=()=>{i.classList.remove("vx-modal-visible"),i.__vxDestroyDrag&&i.__vxDestroyDrag(),setTimeout(()=>{i.remove(),Ge()},200)};i.addEventListener("click",p=>{p.target===i&&r()}),i.querySelectorAll("[data-close]").forEach(p=>p.addEventListener("click",r));let l=i.querySelector("[data-remove]");l&&l.addEventListener("click",()=>{fe({type:"vx-editor:richtext-command",command:"removeLink"}),r()});let d=i.querySelector("[data-confirm]"),v=()=>{let p=a.value.trim();if(p){let c=i.querySelector("#vx-link-blank").checked,m=i.querySelector("#vx-link-class"),f=m?m.value:"";fe({type:"vx-editor:richtext-command",command:"insertLink",value:{url:p,targetBlank:c,linkClass:f}})}else fe({type:"vx-editor:richtext-command",command:"removeLink"});r()};d.addEventListener("click",v),a.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),v()),p.key==="Escape"&&(p.preventDefault(),r())})}function rl(e){var k,w;let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,canInlineEdit:i,hasImage:a}=e,r=document.getElementById("preview-iframe");if(!r)return;let l=r.getBoundingClientRect(),d=l.left+n.left+n.width/2,v=l.top+n.top-8,p=l.top+n.top+n.height+8;t.style.left=`${d}px`,v<120?(t.style.top=`${p}px`,t.classList.add("vx-tb-below")):(t.style.top=`${v}px`,t.classList.remove("vx-tb-below")),t.style.transform="";let m=it,f=Ko(m),u=Er(m),h=kr(m);if(!f){let x=(m==null?void 0:m.sourceFile)||"",C=x.length>0,_=(m==null?void 0:m.sourceKind)==="loop"?"Loop":"Dynamic PHP",j=((k=navigator.platform)==null?void 0:k.includes("Mac"))?"\u2318E":"Ctrl+E",Z=C?`<span class="vx-tb-readonly-sep"></span><span class="vx-tb-readonly-file">${et(x)}</span>`:"",Y=C?`<div class="vx-tb-readonly-actions">
          <button class="vx-tb-btn-primary" data-action="open-code-editor" data-file="${et(x)}" title="Open in Code Editor (${j})">
            Open in Code Editor
            <kbd>${j}</kbd>
          </button>
        </div>`:"";t.innerHTML=`
      <div class="vx-tb-readonly">
        <div class="vx-tb-readonly-header">
          <svg class="vx-tb-readonly-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="vx-tb-readonly-kind">${et(_)}</span>
          ${Z}
        </div>
        <p class="vx-tb-readonly-msg">${et(h)}</p>
        ${Y}
      </div>`,t.classList.add("vx-tb-visible"),C&&((w=t.querySelector('[data-action="open-code-editor"]'))==null||w.addEventListener("click",q=>{q.stopPropagation();let de=q.currentTarget.dataset.file;Wn(de),lt()}));return}let g="";u&&(m!=null&&m.sourceFile)&&(g+=`<div class="vx-tb-global-cue" title="Changes affect all pages that include this file">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span>Global \u2014 ${et(m.sourceFile)}</span>
    </div>`),i&&s!=="IMG"&&(g+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"/><path d="M7 22h1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H7"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
      <span>Edit</span></button>`),a&&(g+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),g+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(g+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),m!=null&&m.sourceFile&&(g+=`<button class="vx-tb-btn" data-action="open-source" title="Edit source code" data-file="${et(m.sourceFile)}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      <span>Source</span></button>`),g+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,g+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let b=oi(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${b}</div><div class="vx-tb-actions">${g}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(x=>{x.addEventListener("click",C=>{C.stopPropagation(),Yc(x.dataset.action,e)})})}function lt(){let e=document.getElementById("vx-context-toolbar");e&&(e.classList.remove("vx-tb-visible"),e.classList.remove("vx-tb-below"))}function oi(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function Yc(e,t){switch(e){case"edit-text":fe({type:"vx-editor:start-edit",mode:"text"}),lt();break;case"swap-image":Lp(t);break;case"edit-style":sp(t);break;case"edit-link":Tp(t);break;case"open-source":{lt(),fe({type:"vx-editor:start-source-edit"});break}case"delete":tp(t);break;case"ask-ai":Ep(t);break}}var Ks=null;function Jc(e){let t=e.replace(/>\s+</g,"><").trim();t=t.replace(/(<\/[^>]+>)(<)/g,`$1
$2`),t=t.replace(/(\/?>)(<[^/])/g,`$1
$2`);let s=t.split(`
`),n=0,o=[];for(let i of s){let a=i.trim();a&&(/^<\//.test(a)&&n>0&&n--,o.push("  ".repeat(n)+a),/^<[^/!][^>]*[^/]>$/.test(a)&&!/^<(br|hr|img|input|meta|link)/i.test(a)&&n++)}return o.join(`
`)}function Zc(e,t,s){let n=t.lastIndexOf(":");if(n===-1)return null;let o=parseInt(t.substring(n+1),10);if(isNaN(o)||o<0)return null;let i=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),a=/<([a-z][a-z0-9]*)[\s>]/gi,r,l=0;for(;(r=a.exec(e))!==null;){let d=r[1].toLowerCase();if(!(i.has(d)||e.substring(r.index,r.index+500).includes("data-vx-source"))){if(l===o){let p=dl(e,r.index,d);return p&&d===s.toLowerCase()?p:null}l++}}return null}function Qc(e,t){if(t<0)return null;let s=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),n=/<([a-z][a-z0-9]*)[\s>]/gi,o,i=0;for(;(o=n.exec(e))!==null;){let a=o[1].toLowerCase();if(!(s.has(a)||e.substring(o.index,o.index+500).includes("data-vx-source"))){if(i===t)return dl(e,o.index,a);i++}}return null}function ll(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function dl(e,t,s){let n=ll(e,t);if(!n)return null;if(new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]).has(s)||n.trimEnd().endsWith("/>"))return n;let i=t+n.length,a=new RegExp(`<${s}[\\s>]`,"gi"),r=new RegExp(`</${s}\\s*>`,"gi"),l=1,d=i,v=Math.min(e.length,t+5e4);for(;d<v&&l>0;){a.lastIndex=d,r.lastIndex=d;let p=a.exec(e),c=r.exec(e);if(!c)return null;let m=p?p.index:1/0,f=c.index;m<f&&m<v?(l++,d=m+p[0].length):(l--,d=f+c[0].length)}return l!==0?null:e.substring(t,d)}async function ep(e){var V,se;Jn(!1);let{html:t,tagName:s,rect:n,filePath:o,sourceAddress:i}=e,a=document.getElementById("preview-iframe");if(!a||!t)return;let r=a.getBoundingClientRect(),l=450,d=180,v=r.width-40,p=Math.max(l,Math.min(n.width+40,v)),c=Math.max(d,Math.min(n.height+60,400)),m=r.left+n.left+n.width/2-p/2,f=r.top+n.top;m=Math.max(r.left+10,Math.min(m,r.right-p-10)),f=Math.max(r.top+10,Math.min(f,r.bottom-c-10));let u=document.createElement("div");u.className="vx-source-editor",u.style.left=`${m}px`,u.style.top=`${f}px`,u.style.width=`${p}px`,u.style.height=`${c}px`;let g=((V=navigator.platform)==null?void 0:V.includes("Mac"))?"\u2318S":"Ctrl+S";u.innerHTML=`
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
  `,document.body.appendChild(u),Ge();let b=u.querySelector(".vx-source-header"),k=null;b.addEventListener("mousedown",te=>{te.target.closest("button")||(k={x:te.clientX-u.offsetLeft,y:te.clientY-u.offsetTop},te.preventDefault())});let w=te=>{k&&(u.style.left=`${te.clientX-k.x}px`,u.style.top=`${te.clientY-k.y}px`)},x=()=>{k=null};document.addEventListener("mousemove",w),document.addEventListener("mouseup",x);let C=u.querySelector(".vx-source-body"),_=(i==null?void 0:i.sourceFile)||o||Ft(),P=(i==null?void 0:i.nodeKey)||"",j=null;if(P)try{let te=await $.get(`/files/content?path=${encodeURIComponent(_)}`);te.ok&&((se=te.data)!=null&&se.content)&&(j=Zc(te.data.content,P,s))}catch{}let Z=!j,Y=j||t,q=Jc(Y),de=u.querySelector('[data-action="apply"]'),Q=u.querySelector(".vx-source-warn"),N=!0,S=null;Z&&(Q.textContent="\u2139 Live HTML \u2014 save may not work for this element",Q.hidden=!1,Q.style.color="var(--vs-text-ghost)",Q.style.background="transparent");function H(te){let O=cl(te,s);if(O){if(Q.style.color="",Q.style.background="",Q.textContent=`\u26A0 ${O.message}`,Q.hidden=!1,de.disabled=!0,de.classList.add("vx-source-btn-disabled"),N=!1,S&&O.line)try{let ie=S.getModel();if(ie){let me=window.monaco||globalThis.monaco;me!=null&&me.editor&&me.editor.setModelMarkers(ie,"preflight",[{startLineNumber:O.line,startColumn:1,endLineNumber:O.line,endColumn:ie.getLineMaxColumn(O.line),message:O.message,severity:me.MarkerSeverity.Error}])}}catch{}}else if(Z?(Q.textContent="\u2139 Live HTML \u2014 save may not work for this element",Q.hidden=!1,Q.style.color="var(--vs-text-ghost)",Q.style.background="transparent"):(Q.hidden=!0,Q.style.color="",Q.style.background=""),de.disabled=!1,de.classList.remove("vx-source-btn-disabled"),N=!0,S)try{let ie=S.getModel(),me=window.monaco||globalThis.monaco;ie&&(me!=null&&me.editor)&&me.editor.setModelMarkers(ie,"preflight",[])}catch{}return N}let F=null;try{let te=await Xo();if(!(te!=null&&te.editor))throw new Error("Monaco unavailable");let O=Vs();te.editor.setTheme(O),F=te.editor.create(C,{value:q,language:"html",theme:O,automaticLayout:!0,minimap:{enabled:!1},fontSize:12,lineHeight:18,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",lineNumbers:"off",glyphMargin:!1,folding:!1,renderLineHighlight:"none",overviewRulerLanes:0,hideCursorInOverviewRuler:!0,overviewRulerBorder:!1,scrollbar:{verticalScrollbarSize:6,horizontalScrollbarSize:6},padding:{top:8,bottom:8},fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"}),S=F,F.addCommand(te.KeyMod.CtrlCmd|te.KeyCode.KeyS,()=>{N&&da()}),F.addCommand(te.KeyCode.Escape,()=>{Jn(!1)});let ie=null;F.onDidChangeModelContent(()=>{clearTimeout(ie),ie=setTimeout(()=>{H(F.getValue())},400)}),setTimeout(()=>{F.focus(),fe({type:"vx-editor:source-editor-mounted"})},100)}catch{C.innerHTML=`<textarea class="vx-source-fallback" spellcheck="false">${et(q)}</textarea>`;let te=C.querySelector("textarea");te.addEventListener("keydown",ie=>{ie.key==="Escape"&&(ie.preventDefault(),Jn(!1)),(ie.metaKey||ie.ctrlKey)&&ie.key==="s"&&(ie.preventDefault(),N&&da())});let O=null;te.addEventListener("input",()=>{clearTimeout(O),O=setTimeout(()=>H(te.value),400)}),setTimeout(()=>{te.focus(),fe({type:"vx-editor:source-editor-mounted"})},100)}de.addEventListener("click",()=>{N&&da()}),u.querySelector('[data-action="cancel"]').addEventListener("click",()=>Jn(!1)),Ks={container:u,monacoInstance:F,originalHTML:Y,formattedHTML:q,tagName:s,sourceFile:_,cleanupDrag:()=>{document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",x)}},requestAnimationFrame(()=>u.classList.add("vx-source-visible"))}async function da(){var p,c;if(!Ks||(p=window.demoGuard)!=null&&p.call(window))return;let{monacoInstance:e,container:t,tagName:s,originalHTML:n,formattedHTML:o,sourceFile:i,cleanupDrag:a}=Ks,r;if(e)r=e.getValue().trim();else{let m=t.querySelector("textarea");r=((c=m==null?void 0:m.value)==null?void 0:c.trim())||""}let l=cl(r,s);if(l){let m=t.querySelector(".vx-source-warn");m&&(m.textContent=`\u26A0 ${l.message}`,m.hidden=!1);return}if(r===o){Jn(!1);return}if(e)try{e.dispose()}catch{}a(),t.classList.remove("vx-source-visible"),setTimeout(()=>t.remove(),200),Ks=null;let d=Pr(it,n,r,i);ve(d,"created"),fe({type:"vx-editor:source-edit-saving"});let[v]=await Promise.all([ul({filePath:i,originalHTML:n,newHTML:r}),new Promise(m=>setTimeout(m,500))]);if(ve(d,v?"persisted":"failed"),v)if(/\<\?(?:php\b|=)/.test(r)){fe({type:"vx-editor:end-source-edit",apply:!1});let f=document.getElementById("preview-iframe");f&&f.contentWindow.location.reload()}else fe({type:"vx-editor:end-source-edit",apply:!0,html:r});else fe({type:"vx-editor:end-source-edit",apply:!1})}function cl(e,t){if(!e||!e.trim())return{message:"HTML is empty"};let s=e.trim();if(/<script\b/i.test(s))return{message:"<script> elements are not allowed"};if(/<iframe\b/i.test(s))return{message:"<iframe> elements are not allowed"};if(/\bon[a-z]+\s*=/i.test(s))return{message:"Inline event handlers (on*=) are not allowed"};let n=document.createElement("template");n.innerHTML=s;let o=n.content,i=Array.from(o.childNodes).filter(c=>c.nodeType===Node.ELEMENT_NODE);if(i.length===0)return{message:"No HTML element found"};if(i.length>1)return{message:`Expected 1 root element, found ${i.length}`};for(let c of o.childNodes)if(c.nodeType===Node.TEXT_NODE&&c.textContent.trim())return{message:"Text found outside root element \u2014 check for broken tags"};let a=i[0],r=(t||"").toUpperCase();if(r&&a.tagName!==r)return{message:`Root changed: <${r.toLowerCase()}> \u2192 <${a.tagName.toLowerCase()}>`,line:1};if(/\<\?(?:php\s+)?(?:foreach|for|while|if|else|elseif|switch)\b/.test(s)||/\<\?(?:php\s+)?(?:endforeach|endfor|endwhile|endif|endswitch)\b/.test(s))return null;let d=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]),v=s.split(`
`),p=[];for(let c=0;c<v.length;c++){let m=v[c],f=/<([a-z][a-z0-9]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*(\/?)\s*>/gi,u;for(;(u=f.exec(m))!==null;){let g=u[1].toLowerCase(),b=u[2]==="/";d.has(g)||b||p.push({tag:g,line:c+1})}let h=/<\/([a-z][a-z0-9]*)\s*>/gi;for(;(u=h.exec(m))!==null;){let g=u[1].toLowerCase();if(d.has(g))continue;if(p.length===0)return{message:`Extra </${g}> \u2014 no matching opening tag`,line:c+1,tag:g};let b=p[p.length-1];if(b.tag!==g)return{message:`Misnested: </${g}> but <${b.tag}> is still open (line ${b.line})`,line:c+1,tag:g};p.pop()}}if(p.length>0){let c=p[p.length-1];return{message:`Unclosed <${c.tag}> (line ${c.line})`,line:c.line,tag:c.tag}}return null}function Jn(e,t){if(!Ks)return;let{container:s,monacoInstance:n,cleanupDrag:o}=Ks;if(fe({type:"vx-editor:end-source-edit",apply:!!e,html:e?t:void 0}),n)try{n.dispose()}catch{}o(),s.classList.remove("vx-source-visible"),setTimeout(()=>{s.remove(),Ge()},200),Ks=null}function tp(e){lt();let t=oi(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${et(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible")),Ge();let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>{n.remove(),Ge()},200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),ke(n,o),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{var a;(a=window.demoGuard)!=null&&a.call(window)||(fe({type:"vx-editor:delete-element"}),o())})}var qe=new Set,is="",Gs=null,ii="text",ss="padding",os="all",Xs="all",ns="tl",Ys="",ws=!1;function bt({revertUnsaved:e=!0}={}){e&&ws&&is&&(fe({type:"vx-editor:update-classes",classes:is.split(" ").filter(Boolean),silent:!0}),qe=new Set(is.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>{t.remove(),Ge()},200)),ws=!1,Gs=null,ii="text",ss="padding",os="all",Xs="all",ns="tl",Ys=""}function sp(e){lt(),bt();let t=(e.classList||[]).filter(o=>o.trim());qe=new Set(t),is=t.join(" "),ws=!1,Gs=null,ii=Dp(t),ss="padding",os="all",Xs="all",ns="tl",Ys="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${oi(e.tagName,t)}</span>
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
      ${va()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),ga(s),s.__vxOnResize=()=>ga(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=xa(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),Gs=null,vt(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>bt()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),bt())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{qe=new Set(is.split(" ").filter(Boolean)),ws=!1,fe({type:"vx-editor:update-classes",classes:[...qe],silent:!0}),vt(ua())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>kp(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(Ys=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=va(),vt(ua()))}),vt("typography"),Ge()}function va(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=Ys===t.id,n=t.id?[...qe].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function ua(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function vt(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:np,spacing:op,colors:ip,layout:ap,borders:rp,effects:lp,classes:dp};t.innerHTML=(s[e]||s.classes)(),wp(t);let n=t.querySelector(".vx-cm-active");n&&n.scrollIntoView({block:"nearest"})}function np(){let e=_e(/^font-(sans|serif|mono)$/)||"",t=_e(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=_e(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=_e(/^text-(left|center|right|justify)$/)||"text-left",o=_e(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=_e(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=_e(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",r=_e(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Oe("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${Oe("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,Re.sizes.map(l=>({label:l,value:`text-${l}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Oe("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,Re.weights.map(l=>({label:l,value:`font-${l}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${cp(Re.aligns.map(l=>({value:`text-${l}`,label:l,icon:hp(l)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${Oe("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,Re.leadings.map(l=>({label:l,value:`leading-${l}`})))}
        ${Oe("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,Re.trackings.map(l=>({label:l,value:`tracking-${l}`})))}
        ${Oe("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,Re.transforms.map(l=>({label:l,value:l})))}
        ${Oe("Decoration","^(no-underline|underline|line-through)$",r,Re.decorations.map(l=>({label:l,value:l})))}
      </div>
    </div>
  `}function op(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[ss]||(ss="padding"),e[ss].prefixes[os]||(os="all");let t=e[ss],s=t.prefixes[os],n=up(s),o=gp(s)||"",i=ss==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${pl(Object.keys(e).map(a=>({value:a,label:e[a].label})),ss,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${os===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Wr(a)}">
            ${fp(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${Wr(os)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${Re.compactSpacings.map(a=>{let r=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Js(r)?" vx-sp-pill-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${Js(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function ip(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=ii||"text",s=t,n=mp(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${Re.specialColors.map(a=>{let r=`${s}-${a.name}`,l=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,d=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${Js(r)?" vx-sp-dot-active":""}" data-set="${r}" data-pattern="${n}" style="${l}${d}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=["50","100","200","300","400","500","600","700","800","900","950"];return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-matrix">
      ${Re.colors.map(a=>`
        <div class="vx-cm-row" title="${a.name}">
          ${i.map(r=>{let l=`${s}-${a.name}-${r}`;return`<button class="vx-cm-cell${Js(l)?" vx-cm-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false" style="background:${a.shades[r]}" title="${a.name}-${r}"></button>`}).join("")}
        </div>
      `).join("")}
    </div>
  </div>`,o}function ap(){let e=vp(),t=_e(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=_e(/^gap(?:-[xy])?-/)||"",a=_e(/^grid-cols-\d+$/)||"",r=_e(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${pp(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${Oe("Direction","^flex-(row|col|row-reverse|col-reverse)$",_e(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${Oe("Justify","^justify-(start|center|end|between|around|evenly)$",_e(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${Oe("Align","^items-(start|center|end|stretch|baseline)$",_e(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${Oe("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...Re.gaps.map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${Oe("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...Re.gridCols.map(l=>({label:l,value:`grid-cols-${l}`}))])}
          ${Oe("Rows","^grid-rows-\\d+$",r,[{label:"Auto",value:""},...Re.gridRows.map(l=>({label:l,value:`grid-rows-${l}`}))])}
          ${Oe("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...Re.gaps.slice(1).map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${Oe("Position","^(static|relative|absolute|fixed|sticky)$",t,Re.positions.map(l=>({label:l,value:l})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${Oe("Top","^top-",_e(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Re.coordinates.map(l=>({label:l,value:`top-${l}`})))}
          ${Oe("Right","^right-",_e(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Re.coordinates.map(l=>({label:l,value:`right-${l}`})))}
          ${Oe("Bottom","^bottom-",_e(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Re.coordinates.map(l=>({label:l,value:`bottom-${l}`})))}
          ${Oe("Left","^left-",_e(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Re.coordinates.map(l=>({label:l,value:`left-${l}`})))}
        </div>
      </div>
    `:""}
  `}function rp(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=Xs==="all"?"all":ns;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${Re.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Js(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${Oe("Style","^border-(solid|dashed|dotted|double|none)$",_e(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...Re.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${pl([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],Xs==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${ns==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${ns==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${ns==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${ns==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${Xs==="all"?"ALL":ns.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${Re.radii.map(s=>{let n=bp(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${Js(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${yp(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function lp(){let e=xp();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${Js(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function dp(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...qe].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function Oe(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${Ct(o.value)}"${s===o.value?" selected":""}>${et(o.label)}</option>`).join("")}
    </select>
  </div>`}function pl(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${et(i.label)}</button>`).join("")}
  </div>`}function cp(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${Ct(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function pp(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function vp(){let e=_e(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function up(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function mp(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function gp(e){let t=_e(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function Wr(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function fp(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function hp(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function bp(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function yp(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function xp(){let e=_e(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function Js(e){let t=Ys;return qe.has(t?t+":"+e:e)}function ca(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=Ys,i=o?o+":":"",a=t?new RegExp(t):null,r=e?i+e:"",l=!!r&&qe.has(r);if(a)for(let v of[...qe])if(o){if(v.startsWith(i)){let p=v.slice(i.length);a.test(p)&&qe.delete(v)}}else!/^(sm|md|lg|xl|2xl):/.test(v)&&a.test(v)&&qe.delete(v);r&&(!s||!l)&&qe.add(r),ws=!0,fe({type:"vx-editor:update-classes",classes:[...qe],silent:!0});let d=document.getElementById("vx-sp-breakpoints");if(d&&(d.innerHTML=va()),n){let v=document.querySelector(".vx-color-matrix"),p=v?v.scrollTop:0;if(vt(ua()),p){let c=document.querySelector(".vx-color-matrix");c&&(c.scrollTop=p)}}}function _e(e){let t=Ys;for(let s of qe)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function wp(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";ca(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";ca(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{Gs=Gs===n.dataset.family?null:n.dataset.family,vt("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{Gs=null,vt("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{ii=n.dataset.cprop||"text",Gs=null,vt("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{ss=n.dataset.spaceMode||"padding",os="all",vt("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{os=n.dataset.spaceSide||"all",vt("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{Xs=n.dataset.radiusMode==="corners"?"corners":"all",vt("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{ns=n.dataset.radiusCorner||"tl",Xs="corners",vt("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");ca(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>vt("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{qe.add(i)}),ws=!0,fe({type:"vx-editor:update-classes",classes:[...qe],silent:!0}),s.value="",vt("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;qe.delete(i),ws=!0,fe({type:"vx-editor:update-classes",classes:[...qe],silent:!0}),o.remove()}}})}async function kp(e){let t=[...qe].join(" ");if(t===is){bt({revertUnsaved:!1});return}let s=new Set(is.split(" ").filter(Boolean)),n=new Set(t.split(" ").filter(Boolean)),o=[...n].filter(l=>!s.has(l)),i=[...s].filter(l=>!n.has(l)),a=Us(e.sourceAddress||it),r=_r(a,is,t,o,i,e.filePath);ve(r,"created"),Ws.push({type:"class-change",filePath:e.filePath,originalHTML:`class="${is}"`,newHTML:`class="${t}"`,additions:o,removals:i,timestamp:Date.now(),_op:r}),ws=!1,bt({revertUnsaved:!1}),K("Saving & compiling\u2026"),await fn(),fe({type:"vx-editor:update-classes",classes:[...qe],silent:!0}),setTimeout(()=>{let l=document.getElementById("preview-iframe");l&&l.contentWindow&&l.contentWindow.postMessage("voxelsite:reload","*")},500)}function xa(e,t){let s=!1,n,o,i,a,r=!1,l=p=>{if(p.target.closest("button, input, select"))return;s=!0;let c=p.touches?p.touches[0]:p;n=c.clientX,o=c.clientY;let m=e.getBoundingClientRect();i=m.left,a=m.top,t.style.cursor="grabbing",p.preventDefault(),r||(r=!0,document.addEventListener("mousemove",d),document.addEventListener("touchmove",d,{passive:!1}),document.addEventListener("mouseup",v),document.addEventListener("touchend",v))},d=p=>{if(!s)return;let c=p.touches?p.touches[0]:p,m=12,f=e.getBoundingClientRect(),u=f.width||300,h=f.height||500,g=i+c.clientX-n,b=a+c.clientY-o,k=m,w=Math.max(m,window.innerWidth-u-m),x=52,C=Math.max(x,window.innerHeight-h-m),_=Math.min(Math.max(g,k),w),P=Math.min(Math.max(b,x),C);e.style.left=`${_}px`,e.style.top=`${P}px`,e.style.right="auto"},v=()=>{s&&(s=!1,t.style.cursor="",r&&(r=!1,document.removeEventListener("mousemove",d),document.removeEventListener("touchmove",d),document.removeEventListener("mouseup",v),document.removeEventListener("touchend",v)))};return t.addEventListener("mousedown",l),t.addEventListener("touchstart",l,{passive:!1}),()=>{t.removeEventListener("mousedown",l),t.removeEventListener("touchstart",l),r&&(document.removeEventListener("mousemove",d),document.removeEventListener("touchmove",d),document.removeEventListener("mouseup",v),document.removeEventListener("touchend",v))}}function vl(e){let t=e.querySelector(".vx-modal"),s=e.querySelector(".vx-modal-header");if(!t||!s)return;s.style.cursor="grab";let n=!1,o=()=>{if(n)return;n=!0;let r=t.getBoundingClientRect();e.style.display="block",t.style.position="fixed",t.style.left=`${r.left}px`,t.style.top=`${r.top}px`,t.style.margin="0"},i=r=>{r.target.closest("button, input, select")||o()};s.addEventListener("mousedown",i,{capture:!0}),s.addEventListener("touchstart",i,{capture:!0,passive:!0});let a=xa(t,s);e.__vxDestroyDrag=()=>{s.removeEventListener("mousedown",i,{capture:!0}),s.removeEventListener("touchstart",i,{capture:!0}),a()}}var Qe=null,$t=null;function Pt(){let e=document.getElementById("vx-ai-panel");e&&(Qe&&(Qe.abort(),Qe=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>{e.remove(),Ge()},180))}function Ep(e){lt(),bt(),Pt();let t=oi(e.tagName,e.classList),s=document.createElement("div");s.id="vx-ai-panel",s.className="vx-ai-panel",s.tabIndex=-1,s.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${et(t)}</span>
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
    </div>`,document.body.appendChild(s),Zr(s,null,e.rect),s.__vxOnResize=()=>Zr(s,null,e.rect),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-ai-visible")),s.__vxDestroyDrag=xa(s,s.querySelector("#vx-ai-drag-handle"));let n=s.querySelector("#vx-ai-input"),o=s.querySelector("#vx-ai-send"),i=s.querySelector("#vx-ai-cancel-btn"),a=s.querySelector("#vx-ai-status"),r=s.querySelector("#vx-ai-status-text"),l=s.querySelector("#vx-ai-close");setTimeout(()=>n==null?void 0:n.focus(),200),Ge(),l.addEventListener("click",()=>Pt()),s.addEventListener("keydown",m=>{m.key==="Escape"&&(m.preventDefault(),m.stopPropagation(),Pt())});let d=()=>{n.style.height="auto";let m=parseFloat(getComputedStyle(n).lineHeight||"20")*6+28;n.style.height=Math.min(n.scrollHeight,m)+"px"};n.addEventListener("input",d),n.addEventListener("keydown",m=>{m.key==="Enter"&&(m.metaKey||m.ctrlKey)&&(m.preventDefault(),c())}),o.addEventListener("click",c),i.addEventListener("click",()=>{Qe&&(Qe.abort(),Qe=null),p()});function v(){n.disabled=!0,o.hidden=!0,i.hidden=!1,a.hidden=!1,r.textContent="Reading your site\u2026"}function p(){n.disabled=!1,o.hidden=!1,i.hidden=!0,a.hidden=!0,n.focus()}async function c(){let m=n.value.trim();if(!m)return;Pt(),el("AI is editing\u2026"),Qe=new AbortController,$t=null;let f=e.outerHTML||"",u=e.filePath||Ft(),h=0;try{await qt("/ai/prompt",{user_prompt:m,action_type:"section_edit",page_scope:u,action_data:{path:u,sectionHtml:f.substring(0,15e3)}},{signal:Qe.signal,onPromptId(g){$t=g},onStatus(g){let b=typeof g=="string"?g:g.message||"Working\u2026";un(b,h)},onFile(){un("Applying changes\u2026",h)},onToken(){h++,un("Generating\u2026",h)},onError(g){$t=null,xs(),K(g.message||"AI edit failed",!0)},onDone(g){if(Qe=null,$t=null,xs(),g.cancelled){K("Generation cancelled",!1);return}(g.files_modified||[]).length>0?(K("Section updated \u2713"),setTimeout(()=>{let k=document.getElementById("preview-iframe");k!=null&&k.contentWindow&&k.contentWindow.postMessage("voxelsite:reload","*")},400)):g.partial||K("No changes made",!1)},onWarning(g){typeof window.showToast=="function"&&window.showToast(g,"warning")}})}catch(g){g.name!=="AbortError"&&K("AI edit failed",!0),xs()}}}var Gr=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function $p(e){lt(),bt(),Pt();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let g of Gr)(t.includes(g.id)||t.includes(g.label.toLowerCase()))&&s.add(g.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${et(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${Gr.map(g=>{let b=s.has(g.id);return`
            <button class="vx-section-card${b?" vx-section-card-exists":""}" data-section-type="${g.id}" data-section-label="${Ct(g.label)}" data-section-desc="${Ct(g.description)}">
              <div class="vx-section-card-icon">${g.icon}</div>
              <div class="vx-section-card-label">${g.label}</div>
              <div class="vx-section-card-desc">${g.description}</div>
              ${b?'<div class="vx-section-card-badge">On page</div>':""}
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible")),Ge();let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>{n.remove(),Ge()},200)},a=g=>{g.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),ke(n,i),n.tabIndex=-1,n.focus();let r=null,l=null,d=n.querySelector("#vx-section-footer"),v=n.querySelector("#vx-section-footer-type"),p=n.querySelector("#vx-section-instruction"),c=n.querySelector("#vx-section-generate"),m=n.querySelector("#vx-section-change"),f=n.querySelector(".vx-section-picker-grid"),u={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(g=>{g.addEventListener("click",()=>{r=g.dataset.sectionLabel,l=g.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(b=>b.classList.remove("vx-section-card-selected")),g.classList.add("vx-section-card-selected"),v.textContent=r,p.placeholder=u[r]||"Optional: describe what you want\u2026",p.value="",d.hidden=!1,f.classList.add("vx-section-grid-collapsed"),setTimeout(()=>p.focus(),100)})}),m.addEventListener("click",()=>{r=null,l=null,d.hidden=!0,f.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(g=>g.classList.remove("vx-section-card-selected"))});let h=()=>{if(!r)return;let g=p.value.trim();i(),Cp(e,r,l,g)};c.addEventListener("click",h),p.addEventListener("keydown",g=>{g.key==="Enter"&&(g.preventDefault(),h())})}async function Cp(e,t,s,n=""){el(`Adding ${t}\u2026`);let o=e.filePath||Ft();Qe=new AbortController,$t=null;let i=Qe,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let r=0,l=0,d=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await qt("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onPromptId(v){$t=v},onStatus(v){let p=typeof v=="string"?v:v.message||`Adding ${t}\u2026`;un(p,r)},onFile(){un("Writing files\u2026",r)},onToken(){r++;let v=Date.now();v-l>500&&(l=v,un(`Generating ${t}\u2026`,r))},onError(v){Qe=null,$t=null,xs(),K(v.message||"Failed to add section",!0)},onDone(v){if(Qe=null,$t=null,xs(),v.cancelled){K("Generation cancelled",!1);return}(v.files_modified||[]).length>0?(K(`${t} added \u2713`),setTimeout(()=>{let c=document.getElementById("preview-iframe");c!=null&&c.contentWindow&&c.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{fe({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{fe({type:"vx-editor:scroll-to-section",sectionIndex:d}),fe({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):v.partial||K("No changes made",!1)},onWarning(v){typeof window.showToast=="function"&&window.showToast(v,"warning")}})}catch(v){Qe=null,$t=null,v.name!=="AbortError"&&K("Failed to add section",!0),xs()}}function Lp(e){lt();let t=!1,s=document.createElement("div");s.className="vx-modal-overlay",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("vx-modal-visible")),Ge();let n=()=>{s.classList.remove("vx-modal-visible"),s.removeEventListener("keydown",o),setTimeout(()=>{s.remove(),Ge(),!t&&Ze&&rl(Ze)},200)},o=i=>{i.key==="Escape"&&(i.stopPropagation(),i.preventDefault(),n())};s.addEventListener("keydown",o),s.querySelector("[data-close]").addEventListener("click",n),ke(s,n),s.tabIndex=-1,s.focus(),Sp(s)}async function Sp(e){let t=e.querySelector("#vx-img-grid");try{let s=await $.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",async()=>{var d,v;let i=o.dataset.path,a=(Ze==null?void 0:Ze.src)||"",r=(it==null?void 0:it.sourceFile)||(Ze==null?void 0:Ze.filePath)||Ft();await Ip({filePath:r,oldSrc:a,newSrc:i,alt:((v=(d=Ze==null?void 0:Ze.outerHTML)==null?void 0:d.match(/alt="([^"]*)"/))==null?void 0:v[1])||"",sourceAddress:it})&&fe({type:"vx-editor:swap-image",src:i}),Qn(),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function Tp(e){lt();let t=e.href||"",s=e.text||"",n=e.target||"",o=e.linkClass||"",i=e.linkClasses||[],a=(it==null?void 0:it.sourceFile)||e.filePath||Ft(),r=`<option value=""${o?"":" selected"}>No class</option>`,l=i.includes(o);i.forEach(c=>{r+=`<option value="${Ct(c)}"${o===c?" selected":""}>${et(c)}</option>`}),o&&!l&&(r+=`<option value="${Ct(o)}" selected>${et(o)}</option>`);let d=document.createElement("div");d.className="vx-modal-overlay",d.setAttribute("role","dialog"),d.setAttribute("aria-modal","true"),d.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${Ct(t)}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${Ct(s)}" placeholder="Link text"></div>
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
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(d),requestAnimationFrame(()=>d.classList.add("vx-modal-visible")),Ge(),vl(d);let v=()=>{d.classList.remove("vx-modal-visible"),d.removeEventListener("keydown",p),d.__vxDestroyDrag&&d.__vxDestroyDrag(),setTimeout(()=>{d.remove(),Ge()},200)},p=c=>{c.key==="Escape"&&v()};d.addEventListener("keydown",p),d.querySelectorAll("[data-close]").forEach(c=>c.addEventListener("click",v)),ke(d,v),document.getElementById("vx-link-save").addEventListener("click",async()=>{var w;if((w=window.demoGuard)!=null&&w.call(window)){v();return}let c=document.getElementById("vx-link-href").value.trim(),m=document.getElementById("vx-link-text").value.trim(),f=document.getElementById("vx-link-target").checked?"_blank":"",u=document.getElementById("vx-link-style"),h=u?u.value:"",g=it,b=[];c!==t&&b.push(Gn(g,"href",t,c,a)),f!==n&&b.push(Gn(g,"target",n||null,f||null,a)),h!==o&&b.push(Gn(g,"class",o||null,h||null,a)),m!==s&&b.push(oa(g,s,m,a)),b.forEach(x=>ve(x,"created")),await Mp(a,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:c,newText:m,newTarget:f,newClass:h},b)&&(fe({type:"vx-editor:update-link",href:c,text:m,target:f,className:h}),setTimeout(()=>fe({type:"vx-editor:refresh-highlight"}),100)),v()}),setTimeout(()=>{var c;return(c=document.getElementById("vx-link-href"))==null?void 0:c.focus()},100)}function Kr(e,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:i,newText:a,newTarget:r,newClass:l}){let d=k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),v=d(t),p=new RegExp(`(<a\\s[^>]*?href=["']${v}["'][^>]*>)([\\s\\S]*?)(</a>)`,"gi"),c=[...e.matchAll(p)];if(c.length===0)return null;if(c.length>1)return"ambiguous";let m=c[0],f=m[1],u=m[2],h=m[3];i!==t&&(f=f.replace(new RegExp(`href=["']${d(t)}["']`),`href="${i}"`)),r!==n&&(r&&f.includes("target=")?f=f.replace(/target=["'][^"']*["']/,`target="${r}"`):r&&!f.includes("target=")?f=f.replace(/>$/,` target="${r}" rel="noopener">`):!r&&f.includes("target=")&&(f=f.replace(/\s*target=["'][^"']*["']/,""),f=f.replace(/\s*rel=["'][^"']*["']/,""))),l!==o&&(l&&f.includes("class=")?f=f.replace(/class=["'][^"']*["']/,`class="${l}"`):l&&!f.includes("class=")?f=f.replace(/>$/,` class="${l}">`):!l&&f.includes("class=")&&(f=f.replace(/\s*class=["'][^"']*["']/,""))),a!==s&&!u.includes("<")&&(u=a);let g=f+u+h,b=e.replace(m[0],g);return b!==e?b:e}async function Mp(e,t,s){var o;let n=e||Ft();try{let i=await $.get(`/files/content?path=${encodeURIComponent(n)}`);if(!i.ok)return s&&s.forEach(d=>ve(d,"failed",{reason:"cannot read file"})),K("Cannot read source file",!0),!1;let a=i.data.content,r=Kr(a,t);if(r==="ambiguous")return s&&s.forEach(d=>ve(d,"failed",{reason:"ambiguous match \u2014 multiple links share this href"})),K("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(r!==null)return(await $.put("/files/content",{path:n,content:r})).ok?(s&&s.forEach(v=>ve(v,"persisted",{strategy:"contentMatch"})),K(`Saved \u2192 ${n.split("/").pop()}`),!0):(s&&s.forEach(v=>ve(v,"failed",{reason:"API write failed"})),K("Save failed",!0),!1);let l=await $.get("/files");if(l.ok){let d=(l.data.files||[]).filter(v=>v.path.endsWith(".php")&&v.path!==n);for(let v of d){let p=await $.get(`/files/content?path=${encodeURIComponent(v.path)}`);if(!p.ok||!((o=p.data)!=null&&o.content))continue;let c=Kr(p.data.content,t);if(c==="ambiguous")return s&&s.forEach(m=>ve(m,"failed",{reason:"ambiguous match in partial",file:v.path})),K("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(c!==null)return(await $.put("/files/content",{path:v.path,content:c})).ok?(s&&s.forEach(f=>ve(f,"persisted",{strategy:"partialSearch"})),K(`Saved \u2192 ${v.path.split("/").pop()}`),!0):(s&&s.forEach(f=>ve(f,"failed",{reason:"API write failed in partial",file:v.path})),K("Save failed",!0),!1)}}return s&&s.forEach(d=>ve(d,"failed",{reason:"link not found in source"})),K("Save failed \u2014 link not found in source",!0),!1}catch(i){return console.error("[VX] saveLinkToSource error:",i),s&&s.forEach(a=>ve(a,"failed",{reason:"exception",error:i.message})),K("Save failed \u2014 unexpected error",!0),!1}}async function Ip(e){var l;if((l=window.demoGuard)!=null&&l.call(window))return!1;let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||Ft(),a=Us(e.sourceAddress||it),r=Gn(a,"src",s,n,i);ve(r,"created");try{let d=await $.get(`/files/content?path=${encodeURIComponent(i)}`);if(!d.ok)return console.warn("[VX] Cannot read file for image save:",i),ve(r,"failed",{reason:"cannot read file"}),K("Save failed",!0),!1;let v=d.data.content,p=!1,c=`src="${s}"`,m=v.split(c).length-1;if(m>1)return ve(r,"failed",{reason:"ambiguous match \u2014 multiple elements share this src"}),K("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(m===1&&(v=v.replace(c,`src="${n}"`),p=!0),!p&&v.includes(s)){if(v.split(s).length-1>1)return ve(r,"failed",{reason:"ambiguous match \u2014 image path appears multiple times in source"}),K("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1;v=v.replace(s,n),p=!0}if(!p&&o){let u=Xr(v,o,n);if(u==="ambiguous")return ve(r,"failed",{reason:"ambiguous alt-anchor match \u2014 multiple images share this alt text"}),K("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;u!==!1&&(v=u,p=!0)}if(p)return(await $.put("/files/content",{path:i,content:v})).ok?(ve(r,"persisted",{strategy:"contentMatch"}),K(`Saved \u2192 ${i.split("/").pop()}`),!0):(ve(r,"failed",{reason:"API write failed"}),K("Save failed",!0),!1);let f=await $.get("/files");if(f.ok){let u=(f.data.files||[]).filter(h=>h.path.endsWith(".php")&&h.path!==i);for(let h of u){let g=await $.get(`/files/content?path=${encodeURIComponent(h.path)}`);if(!g.ok||!g.data.content)continue;let b=g.data.content,k=b.split(c).length-1;if(k>1)return ve(r,"failed",{reason:"ambiguous match in partial",file:h.path}),K("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(k===1)return b=b.replace(c,`src="${n}"`),(await $.put("/files/content",{path:h.path,content:b})).ok?(ve(r,"persisted",{strategy:"partialSearch"}),K(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(ve(r,"failed",{reason:"API write failed in partial",file:h.path}),K("Save failed",!0),!1);if(b.includes(s))return b.split(s).length-1>1?(ve(r,"failed",{reason:"ambiguous match in partial",file:h.path}),K("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1):(b=b.replace(s,n),(await $.put("/files/content",{path:h.path,content:b})).ok?(ve(r,"persisted",{strategy:"partialSearch"}),K(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(ve(r,"failed",{reason:"API write failed in partial",file:h.path}),K("Save failed",!0),!1));if(o){let w=Xr(b,o,n);if(w==="ambiguous")return ve(r,"failed",{reason:"ambiguous alt-anchor match in partial",file:h.path}),K("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;if(w!==!1)return(await $.put("/files/content",{path:h.path,content:w})).ok?(ve(r,"persisted",{strategy:"altAnchor"}),K(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(ve(r,"failed",{reason:"API write failed in partial",file:h.path}),K("Save failed",!0),!1)}}}return console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),ve(r,"failed",{reason:"source not found"}),K("Save failed \u2014 source not found",!0),!1}catch(d){return console.error("[VX] Image save error:",d),ve(r,"failed",{reason:"exception",error:d.message}),K("Save failed",!0),!1}}function Xr(e,t,s){let n=e.split("<img"),o=[];for(let p=1;p<n.length;p++){let c=n[p];if(c.includes(`alt="${t}"`)||c.includes(`alt='${t}'`)){let m=c.indexOf("src=");if(m!==-1){let f=c[m+4];(f==='"'||f==="'")&&c.indexOf(f,m+5)!==-1&&o.push(p)}}}if(o.length===0)return!1;if(o.length>1)return"ambiguous";let i=o[0],a=n[i],r=a.indexOf("src="),l=a[r+4],d=r+5,v=a.indexOf(l,d);return n[i]=a.substring(0,d)+s+a.substring(v),n.join("<img")}function ti(e){var n;if((n=window.demoGuard)!=null&&n.call(window))return;let t=Us(e.sourceAddress),s=oa(t,e.originalHTML,e.newHTML,e.filePath);ve(s,"created"),Ws.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:s}),clearTimeout(ti._timer),ti._timer=setTimeout(()=>fn(),800)}async function ul(e){let{filePath:t,originalHTML:s,newHTML:n}=e;if(!s||!n)return K("Source edit failed \u2014 missing data",!0),!1;let o=t||Ft();try{let i=await $.get(`/files/content?path=${encodeURIComponent(o)}`);if(!i.ok)return K("Cannot read source file",!0),!1;let a=i.data.content,r=await Yr(o,a,s,n);if(r==="saved")return!0;if(r==="ambiguous")return!1;let l=await $.get("/files");if(!l.ok)return K("Save failed \u2014 source not found in file",!0),!1;let d=(l.data.files||[]).filter(v=>v.path.endsWith(".php")&&v.path!==o);for(let v of d){let p=await $.get(`/files/content?path=${encodeURIComponent(v.path)}`);if(!p.ok||!p.data.content)continue;let c=await Yr(v.path,p.data.content,s,n);if(c==="saved")return!0;if(c==="ambiguous")return!1}return console.warn("[VX] Source edit needle not found in any file:",s.substring(0,100)),K("Save failed \u2014 source not found. The file may have changed.",!0),!1}catch(i){return console.error("[VX] Source edit save error:",i),K("Save failed",!0),!1}}async function Yr(e,t,s,n){var l;let o=0,i=0;for(;;){let d=t.indexOf(s,i);if(d===-1||(o++,i=d+s.length,o>1))break}if(o===0)return"not_found";if(o>1)return K("Save failed \u2014 source fragment appears multiple times. Edit in the Code Editor instead.",!0),"ambiguous";let a=t.replace(s,n),r=await $.put("/files/content",{path:e,content:a});if(r.ok){let d=e.split("/").pop();return K(`Saved \u2192 ${d}`),(l=r.data)!=null&&l.tailwindCompiled&&setTimeout(()=>{let v=document.getElementById("preview-iframe");v!=null&&v.contentWindow&&v.contentWindow.postMessage("voxelsite:reload-css","*")},300),"saved"}else return K("Save failed",!0),"not_found"}function ma(e){var i;if((i=window.demoGuard)!=null&&i.call(window))return;let t=Us(e.sourceAddress),s=e.parentAddress?Us(e.parentAddress):null,n=typeof e.siblingIndex=="number"?e.siblingIndex:-1,o=Ar(t,e.outerHTML,e.filePath,s,n);ve(o,"created"),Ws.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:o}),clearTimeout(ma._timer),ma._timer=setTimeout(()=>fn(),300)}function Bp(e){let t=e.match(/class="([^"]*)"/);return t?t[1].split(/\s+/).filter(Boolean):[]}function _p(e,t,s,n){let o=new Set(["is-visible","is-active","is-open","active","open","show","shown","visible","in","entered","transitioning"]),i=/class="([^"]*)"/g,a;for(;(a=i.exec(e))!==null;){let r=a[1].split(/\s+/).filter(Boolean);if(r.length===0||!r.every(f=>t.has(f))||![...t].filter(f=>!r.includes(f)).every(f=>o.has(f)||s.includes(f)||n.includes(f)))continue;let p=r.filter(f=>!n.includes(f));for(let f of s)!o.has(f)&&!p.includes(f)&&p.push(f);let c=a[0],m=`class="${p.join(" ")}"`;return e.substring(0,a.index)+m+e.substring(a.index+c.length)}return null}async function fn(){var t,s,n,o,i,a,r;if(Qo||Ws.length===0)return;Qo=!0;let e=[...Ws];Ws=[];try{let l={};for(let p of e){let c=((s=(t=p._op)==null?void 0:t.address)==null?void 0:s.sourceFile)||((n=p.sourceAddress)==null?void 0:n.sourceFile)||p.filePath||Ft();l[c]||(l[c]=[]),l[c].push(p)}let d=!1,v={filesByMain:new Map,contentByPath:new Map};for(let[p,c]of Object.entries(l))try{let m=await $.get(`/files/content?path=${encodeURIComponent(p)}`);if(!m.ok){console.error("[VX] Cannot read:",p);continue}let f=m.data.content,u=!1,h=[];for(let g of c){if(g._op&&g._op.type!==ce.FALLBACK){let k=Jo(g._op,f);if(k.applied){f=k.content,u=!0,h.push({op:g._op,strategy:k.strategy});continue}console.warn("[VX] applyOp failed:",k.reason,"\u2014 falling back to legacy for",g._op.type),ve(g._op,"fallback",{fallbackReason:k.reason,via:"applyOp"})}let b=g.type==="delete"?g.outerHTML:g.originalHTML;if(b){if((o=g.sourceAddress)!=null&&o.nodeKey&&g.type==="text"){let k=g.sourceAddress,w=k.sourceFile||p,x=f;if(w!==p)try{let P=await $.get(`/files/content?path=${encodeURIComponent(w)}`);P.ok&&((i=P.data)!=null&&i.content)&&(x=P.data.content)}catch{}let C=k.nodeKey.lastIndexOf(":"),_=!1;if(C!==-1){let P=parseInt(k.nodeKey.substring(C+1),10);if(!isNaN(P)){let j=Qc(x,P);if(j){let Z=ll(x,x.indexOf(j));if(Z){let Y=Z.length,q=j.lastIndexOf("</");if(q>Y){let de=j.substring(q),Q=Z+g.newHTML+de;if(w!==p){let N=x.replace(j,Q),S=await $.put("/files/content",{path:w,content:N});S.ok&&(K(`Saved \u2192 ${w.split("/").pop()}`),(a=S.data)!=null&&a.tailwindCompiled&&(d=!0),_=!0,g._op&&(ve(g._op,"persisted",{strategy:"nodeKey",via:"legacy"}),Yn(g._op,w)))}else f=f.replace(j,Q),u=!0,_=!0,g._op&&h.push({op:g._op,strategy:"nodeKey",via:"legacy"})}}}}}if(_)continue;console.warn("[VX] Legacy nodeKey extraction failed for",k.nodeKey,"\u2014 trying content match"),g._op&&ve(g._op,"fallback",{fallbackReason:"legacy nodeKey extraction failed",nodeKey:k.nodeKey})}if(f.includes(b))f=g.type==="delete"?f.replace(b,""):f.replace(b,g.newHTML),u=!0,g._op&&h.push({op:g._op,strategy:"contentMatch",via:"legacy"});else if(g.type==="class-change"&&g.additions){let k=new Set(Bp(b)),w=_p(f,k,g.additions,g.removals);if(w)f=w,u=!0,g._op&&h.push({op:g._op,strategy:"subsetMatch",via:"legacy"});else{let x=await Jr(p,g,v);if(x.status==="saved"){g._op&&(ve(g._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:x.path}),Yn(g._op,x.path)),d=!0;continue}x.status==="write_failed"?g._op&&ve(g._op,"failed",{reason:"partial write failed",file:x.path}):(console.warn("[VX] Not found in source:",b.substring(0,80)),g._op&&ve(g._op,"failed",{reason:"source not found"}),K("Save failed \u2014 source not found",!0))}}else{let k=await Jr(p,g,v);if(k.status==="saved"){g._op&&(ve(g._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:k.path}),Yn(g._op,k.path)),d=!0;continue}k.status==="write_failed"?g._op&&ve(g._op,"failed",{reason:"partial write failed",file:k.path}):(console.warn("[VX] Not found in source:",b.substring(0,80)),g._op&&ve(g._op,"failed",{reason:"source not found"}),K("Save failed \u2014 source not found",!0))}}}if(u){let g=await $.put("/files/content",{path:p,content:f});if(g.ok){K(`Saved \u2192 ${p.split("/").pop()}`),(r=g.data)!=null&&r.tailwindCompiled&&(d=!0);for(let{op:b,strategy:k,via:w}of h)ve(b,"persisted",{strategy:k,via:w||"applyOp"}),Yn(b,p)}else{K("Save failed",!0);for(let{op:b,via:k}of h)ve(b,"failed",{reason:"file write failed",via:k||"applyOp"})}}}catch(m){console.error("[VX] Save error:",m),K("Save failed",!0)}d&&setTimeout(()=>{let p=document.getElementById("preview-iframe");p!=null&&p.contentWindow&&p.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{Qo=!1,Ws.length>0?setTimeout(()=>fn(),0):fe({type:"vx-editor:save-feedback"})}}async function Jr(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let r=await $.get("/files");if(!r.ok)return{status:"not_found"};a=(r.data.files||[]).filter(l=>l.path.endsWith(".php")&&l.path!==e).filter(l=>o.some(d=>l.path.includes(d+"/"))||l.path.includes("partial")||l.path.includes("header")||l.path.includes("footer")||l.path.includes("nav")),i.filesByMain.set(e,a)}for(let r of a){let l=i.contentByPath.get(r.path);if(l==null){let d=await $.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!d.ok||!d.data.content)continue;l=d.data.content,i.contentByPath.set(r.path,l)}if(l.includes(n)){let d=t.type==="delete"?l.replace(n,""):l.replace(n,t.newHTML);return(await $.put("/files/content",{path:r.path,content:d})).ok?(i.contentByPath.set(r.path,d),K(`Saved \u2192 ${r.path.split("/").pop()}`),{status:"saved",path:r.path}):(K("Save failed",!0),{status:"write_failed",path:r.path})}}}catch(a){console.error("[VX] Partial search error:",a)}return{status:"not_found"}}async function Ap(e){var i;let{filePath:t,sectionIndex:s,neighborIndex:n}=e,o=t||Ft();try{let a=await $.get(`/files/content?path=${encodeURIComponent(o)}`);if(!a.ok){K("Could not read file",!0);return}let r=a.data.content,l=Pp(r);if(s>=l.length||n>=l.length){K("Section not found in source. Try asking the AI to move it.",!0);return}let d=Rp(r,l,s,n);if(!d){K("Could not swap sections in source",!0);return}let v=await $.put("/files/content",{path:o,content:d});v.ok?(K("Section moved"),(i=v.data)!=null&&i.tailwindCompiled&&setTimeout(()=>{let p=document.getElementById("preview-iframe");p!=null&&p.contentWindow&&p.contentWindow.postMessage("voxelsite:reload-css","*")},300)):K("Save failed",!0)}catch(a){console.error("[VX] Section move error:",a),K("Section move failed",!0)}}function Pp(e){let t=[],s=/<section\b/gi,n;for(;(n=s.exec(e))!==null;){let o=n.index,a=e.substring(Math.max(0,o-500),o).match(/(<!--[\s\S]*?-->\s*)$/);a&&(o-=a[0].length);let r="</section>",l=1,d=n.index+n[0].length;for(;l>0&&d<e.length;){let v=e.indexOf("<section",d),p=e.indexOf(r,d);if(p===-1)break;if(v!==-1&&v<p){let c=e[v+8];(c===" "||c===">"||c===`
`||c==="\r"||c==="	"||c==="/")&&l++,d=v+9}else{if(l--,l===0){let c=p+r.length;t.push({start:o,end:c,content:e.substring(o,c)})}d=p+r.length}}}return t}function Rp(e,t,s,n){if(s===n)return e;let o=Math.min(s,n),i=Math.max(s,n),a=t[o],r=t[i];if(!a||!r||a.end>r.start)return null;let l=e.substring(0,a.start),d=e.substring(a.end,r.start),v=e.substring(r.end);return l+r.content+d+a.content+v}function ml(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",ot),e.title=ot?"Exit visual editor (V)":"Enter visual editor (V)",e.setAttribute("aria-pressed",String(ot))),document.body.classList.toggle("vx-editing",ot)}function K(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(K._timer),K._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function fe(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function Ft(){return window.__vsCurrentPreviewPath||"index.php"}function ga(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),r=a.right-s-o,l=Math.max(o,a.left+10),d=Math.max(o,window.innerWidth-s-o),v=Math.min(Math.max(r,l),d),p=Math.max(a.top+12,i),c=Math.max(i,window.innerHeight-n-o),m=Math.min(p,c);e.style.left=`${v}px`,e.style.top=`${m}px`,e.style.right="auto"}function Zr(e,t,s){let n=e.offsetWidth||380,o=e.offsetHeight||180,i=16,a=56,r=document.getElementById("preview-iframe");if(!r||!s){ga(e);return}let l=r.getBoundingClientRect(),d=l.top+s.top,v=l.top+s.top+s.height,c=l.left+s.left+s.width/2-n/2,m,f=d-o-4;f>=a?m=f:m=v+8;let u=Math.max(i,window.innerWidth-n-i),g=Math.min(Math.max(c,i),u),b=Math.max(a,window.innerHeight-o-i),k=Math.min(Math.max(m,a),b);e.style.left=`${g}px`,e.style.top=`${k}px`,e.style.right="auto"}function Dp(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function Ct(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function et(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ve(e,t,s={}){var o,i;let n={opId:(e==null?void 0:e.id)||"unknown",type:(e==null?void 0:e.type)||"unknown",event:t,sourceKind:((o=e==null?void 0:e.address)==null?void 0:o.sourceKind)||"unknown",sourceFile:((i=e==null?void 0:e.address)==null?void 0:i.sourceFile)||(e==null?void 0:e.filePath)||"unknown",timestamp:Date.now(),...s};la.push(n),la.length>zc&&la.shift(),t==="failed"||t==="fallback"?console.warn(`[VX-OPS] ${t}:`,aa(e==null?void 0:e.type),n):console.debug(`[VX-OPS] ${t}:`,aa(e==null?void 0:e.type),n.sourceFile)}async function Hp(){var s;let e=Or();if(!e){K("Nothing to undo");return}let t=e.filePath;if(!t){K("Undo failed \u2014 no file path",!0);return}try{let n=await $.get(`/files/content?path=${encodeURIComponent(t)}`);if(!n.ok){K("Undo failed \u2014 cannot read file",!0);return}let o=Jo(e.inverseOp,n.data.content);if(!o.applied){console.warn("[VX History] Undo applyOp failed:",o.reason),K("Undo failed \u2014 source has changed",!0);return}let i=await $.put("/files/content",{path:t,content:o.content});if(!i.ok){K("Undo failed \u2014 save error",!0);return}qr(),ve(e.inverseOp,"persisted",{strategy:o.strategy,via:"undo"}),K("Undone"),mn+=2,fe({type:"vx-editor:replay-op",op:e.inverseOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Undo error:",n),K("Undo failed",!0)}}async function Np(){var s;let e=Fr();if(!e){K("Nothing to redo");return}let t=e.filePath;if(!t){K("Redo failed \u2014 no file path",!0);return}try{let n=await $.get(`/files/content?path=${encodeURIComponent(t)}`);if(!n.ok){K("Redo failed \u2014 cannot read file",!0);return}let o=Jo(e.forwardOp,n.data.content);if(!o.applied){console.warn("[VX History] Redo applyOp failed:",o.reason),K("Redo failed \u2014 source has changed",!0);return}let i=await $.put("/files/content",{path:t,content:o.content});if(!i.ok){K("Redo failed \u2014 save error",!0);return}zr(),ve(e.forwardOp,"persisted",{strategy:o.strategy,via:"redo"}),K("Redone"),mn+=2,fe({type:"vx-editor:replay-op",op:e.forwardOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Redo error:",n),K("Redo failed",!0)}}function xl(){return setTimeout(()=>ks(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function ks(){var N,S,H,F,V,se,te;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,r]=await Promise.all([$.get("/settings"),$.get("/settings/system"),$.get("/settings/mail"),$.get("/settings/usage"),$.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),$.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),$.get("/settings/logs")]),l=((N=r.data)==null?void 0:N.logs)||[],d=((S=t.data)==null?void 0:S.settings)||{},v=((H=s.data)==null?void 0:H.system)||{},p=d.site_favicon||null,c=p?`/${p}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),m=null,f=null;try{i.ok&&((F=i.data)!=null&&F.content)&&(m=JSON.parse(i.data.content))}catch{}try{a.ok&&((V=a.data)!=null&&V.content)&&(f=JSON.parse(a.data.content))}catch{}let u=m||f,h=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},g=d.available_providers||{},b=((se=n.data)==null?void 0:se.config)||{},k=((te=n.data)==null?void 0:te.presets)||{},w=Object.keys(g),x=d.ai_provider||"claude",_=(g[x]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],P=d[`ai_${x}_model`]||"",j=d[`ai_${x}_api_key_set`]||!1,Z=w.map(O=>{let ie=g[O];return`<option value="${y(O)}" ${O===x?"selected":""}>${y(ie.name)}</option>`}).join(""),Y="";for(let O of _)O.key==="api_key"?Y+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(O.label)}${O.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${j?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${y(O.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${j?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':O.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${y(O.help_text||"Optional for local servers")}</p>`}
          ${O.help_url?`<a href="${O.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${y(O.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:O.key==="base_url"&&(Y+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(O.label)}${O.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${y(d.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${y(O.placeholder)}" />
          ${O.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${y(O.help_text)}</p>`:""}
        </div>`);e.innerHTML=`
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${y(d.site_name||"")}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${y(d.site_tagline||"")}"
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
            ${Z}
          </select>
        </div>

        <div id="settings-config-fields">
          ${Y}
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
            <option value="none" ${b.driver==="none"?"selected":""}>Not configured</option>
            <option value="php_mail" ${b.driver==="php_mail"?"selected":""}>PHP mail()</option>
            <option value="smtp" ${b.driver==="smtp"?"selected":""}>SMTP</option>
            <option value="mailpit" ${b.driver==="mailpit"?"selected":""}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${b.driver==="smtp"?"block":"none"};">
          <div class="flex flex-col gap-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(k).map(([O,ie])=>`<option value="${y(O)}">${y(ie.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${y(b.smtp_host||"")}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${b.smtp_port||587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${b.smtp_encryption==="tls"?"selected":""}>TLS (STARTTLS)</option>
                  <option value="ssl" ${b.smtp_encryption==="ssl"?"selected":""}>SSL</option>
                  <option value="none" ${b.smtp_encryption==="none"?"selected":""}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${y(b.smtp_username||"")}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${b.smtp_password||""}"
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
        <div id="mail-mailpit-fields" style="display: ${b.driver==="mailpit"?"block":"none"};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${y(b.mailpit_host||"localhost")}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${b.mailpit_port||1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${b.driver==="none"?"none":"block"};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${y(b.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${y(b.from_name||"")}"
            class="vs-input"
            placeholder="Your Site Name" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender name on notification emails.</p>
        </div>

        <div class="border-t border-vs-border-subtle"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${y(d.user_email||"")}"
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

    ${u?`
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${m?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${E.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(m).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${E.chevronRight}</div>
        </button>
        `:""}
        ${f?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${E.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(f).length} design decisions</span>
          </div>
          <div class="vs-knowledge-card-arrow">${E.chevronRight}</div>
        </button>
        `:""}
      </div>
      <p class="vs-knowledge-hint">
        ${E.info}
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
          ${yt("Total Requests",Number(h.totals.request_count).toLocaleString())}
          ${yt("Input Tokens",Number(h.totals.total_input_tokens).toLocaleString())}
          ${yt("Output Tokens",Number(h.totals.total_output_tokens).toLocaleString())}

        </div>
        ${h.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${h.models.map(O=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${yt(O.ai_model||"Unknown",Number(O.request_count).toLocaleString()+" requests")}
                ${yt("Tokens",Number(O.total_input_tokens).toLocaleString()+" in / "+Number(O.total_output_tokens).toLocaleString()+" out")}

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
        ${yt("VoxelSite",v.version||"1.0.0")}
        ${yt("PHP",v.php_version||"?")}
        ${yt("SQLite",v.sqlite_version||"?")}
        ${yt("Database",wa(v.database_size))}
        ${yt("Preview Files",wa(v.preview_size))}
        ${yt("Assets",wa(v.assets_size))}
        ${yt("Upload Limit",v.max_upload||"?")}
        ${yt("Memory Limit",v.memory_limit||"?")}
      </div>
    </div>

    <!-- Card: Update -->
    <div class="vs-settings-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Update</h2>
        <span class="vs-pill vs-pill-subtle">v${y(v.version||"1.0.0")}</span>
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
        ${l.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':l.map(O=>{let ie=(O.size/1024).toFixed(1),me=new Date(O.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${O.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${O.lines} lines \xB7 ${ie} KB \xB7 ${me}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(O.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${O.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
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
          ${E.externalLink} View API schema
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
              placeholder="*">${y(d.agent_api_allowed_origins||"*")}</textarea>
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
  `,Gp(d,g),Kp(b,k),Fp(),zp(),Xp(d),document.querySelectorAll(".btn-delete-log").forEach(O=>{O.addEventListener("click",async()=>{var ye;if((ye=window.demoGuard)!=null&&ye.call(window))return;if(O.dataset.confirm!=="true"){O.dataset.confirm="true",O.innerHTML='<span style="font-size: 11px;">Sure?</span>',O.style.color="var(--vs-error)",setTimeout(()=>{O.dataset.confirm==="true"&&(O.dataset.confirm="",O.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',O.style.color="")},3e3);return}let ie=O.dataset.file,me=O.closest(".vs-log-row");me&&(me.style.opacity="0.4"),await $.delete("/settings/logs",{file:ie}),ks()})});let q=document.getElementById("btn-delete-all-logs");q&&q.addEventListener("click",async()=>{var O;if(!((O=window.demoGuard)!=null&&O.call(window))){if(q.dataset.confirm!=="true"){q.dataset.confirm="true",q.textContent="Sure?",q.style.color="var(--vs-error)",setTimeout(()=>{q.dataset.confirm==="true"&&(q.dataset.confirm="",q.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',q.style.color="")},3e3);return}q.disabled=!0,q.textContent="Deleting...",await $.delete("/settings/logs",{file:"*"}),ks()}});let de=document.getElementById("btn-view-memory");de&&m&&de.addEventListener("click",()=>gl("Site Memory",m,"memory"));let Q=document.getElementById("btn-view-design");Q&&f&&Q.addEventListener("click",()=>gl("Design Intelligence",f,"design")),Op(),qp(),Wp(P)}function jp(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function Op(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;r();async function r(){var c;if(a)try{let{ok:m,data:f}=await $.get("/update/dist-packages");if(!m||!((c=f==null?void 0:f.packages)!=null&&c.length)){a.innerHTML="";return}let u=f.current_version||"0.0.0",h=f.packages.map(g=>{let b=(g.size/1024/1024).toFixed(1),k=jp(g.version,u)>0,w=g.version===u,x=k?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':w?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${y(g.filename)}</strong>
                ${x}
              </div>
              <div class="vs-dist-pkg-meta">v${y(g.version)} \xB7 ${b} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${y(g.filename)}" data-version="${y(g.version)}">
              Apply Update
            </button>
          </div>
        `}).join("");a.innerHTML=`
        <div class="vs-dist-packages-section">
          <div class="vs-dist-packages-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Update packages found in <code>/dist/</code></span>
          </div>
          ${h}
        </div>
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(g=>{g.addEventListener("click",()=>l(g.dataset.filename,g.dataset.version))})}catch{}}async function l(c,m){var u,h;if(!((u=window.demoGuard)!=null&&u.call(window)||!confirm(`Apply update from "${c}" (v${m})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${c}...`,a&&(a.innerHTML="");try{let{ok:g,data:b,error:k}=await $.post("/update/apply-local",{filename:c});s.classList.add("hidden"),n.classList.remove("hidden");let w=document.getElementById("vs-update-result-icon"),x=document.getElementById("vs-update-result-message");if(g){let C=b;w.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',x.innerHTML=`
          <div class="vs-update-result-title">${y(C.message)}</div>
          <div class="vs-update-result-meta">
            ${C.files_updated} files updated \xB7 ${C.files_skipped} preserved
            ${(h=C.errors)!=null&&h.length?` \xB7 ${C.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else v("Update Failed",(k==null?void 0:k.message)||"Unknown error")}catch(g){v("Update Failed",y(g.message||"Network error."))}}}e.addEventListener("click",c=>{var m;(m=window.demoGuard)!=null&&m.call(window)||c.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",c=>{c.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",c=>{var f,u,h;if(c.preventDefault(),e.classList.remove("is-dragover"),(f=window.demoGuard)!=null&&f.call(window))return;let m=(h=(u=c.dataTransfer)==null?void 0:u.files)==null?void 0:h[0];m&&m.name.endsWith(".zip")&&d(m)}),o.addEventListener("change",()=>{var m;let c=(m=o.files)==null?void 0:m[0];c&&d(c),o.value=""});async function d(c){var u,h;let m=document.querySelector(".vs-sys-grid");if(m){let g=m.querySelectorAll(".vs-sys-value"),b="";if(m.querySelectorAll(".vs-sys-label").forEach((k,w)=>{var x,C;k.textContent.trim()==="Upload Limit"&&(b=((C=(x=g[w])==null?void 0:x.textContent)==null?void 0:C.trim())||"")}),b){let k=p(b);if(k>0&&c.size>k){let w=(c.size/1024/1024).toFixed(1);v("File Too Large",`The update file is ${w} MB but your server's upload limit is ${b}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${w} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${c.name}" (${(c.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${c.name}...`;try{let g=new FormData;g.append("update_zip",c);let b=R.get("sessionToken"),k=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:b?{"X-VS-Token":b}:{},body:g}),w=k.headers.get("content-type")||"",x;if(!w.includes("application/json")){let P=await k.text();if(P.includes("POST Content-Length")||P.includes("upload_max_filesize")||P.includes("exceeds")){v("Server Upload Limit Exceeded",`The file (${(c.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}v("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}x=await k.json(),s.classList.add("hidden"),n.classList.remove("hidden");let C=document.getElementById("vs-update-result-icon"),_=document.getElementById("vs-update-result-message");if(x.ok){let P=x.data;C.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',_.innerHTML=`
          <div class="vs-update-result-title">${y(P.message)}</div>
          <div class="vs-update-result-meta">
            ${P.files_updated} files updated \xB7 ${P.files_skipped} preserved
            ${(u=P.errors)!=null&&u.length?` \xB7 ${P.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else v("Update Failed",((h=x.error)==null?void 0:h.message)||"Unknown error")}catch(g){let b=g.message||"Network error. Check your connection.";b.includes("Unexpected token")||b.includes("not valid JSON")?v("Server Upload Limit Exceeded",`The file (${(c.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):v("Upload Failed",y(b))}}}function v(c,m){s.classList.add("hidden"),n.classList.remove("hidden");let f=document.getElementById("vs-update-result-icon"),u=document.getElementById("vs-update-result-message");f.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',u.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${y(c)}</div>
      <div class="vs-update-result-meta">${m}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function p(c){let m=c.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!m)return 0;let f=parseFloat(m[1]),u=m[2].toUpperCase();return u==="GB"||u==="G"?f*1024*1024*1024:u==="MB"||u==="M"?f*1024*1024:u==="KB"||u==="K"?f*1024:0}}function qp(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var r,l,d;if(i.preventDefault(),e.classList.remove("is-dragover"),(r=window.demoGuard)!=null&&r.call(window))return;let a=(d=(l=i.dataTransfer)==null?void 0:l.files)==null?void 0:d[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,r;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let l=await $.delete("/settings/favicon");l.ok?(I("Favicon removed.","success"),ks()):I(((r=l.error)==null?void 0:r.message)||"Could not remove favicon.","error")}catch{I("Could not remove favicon.","error")}}});async function o(i){var v;if(i.size>524288){I("Favicon must be under 512 KB.","error");return}let r=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!r.includes(i.type)){I("Favicon must be a .ico file.","error");return}let d=document.getElementById("vs-favicon-preview");d&&(d.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let p=new FormData;p.append("favicon",i);let c=R.get("sessionToken"),f=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:c?{"X-VS-Token":c}:{},body:p})).json();f.ok?(I("Favicon updated.","success"),ks()):(I(((v=f.error)==null?void 0:v.message)||"Upload failed.","error"),ks())}catch{I("Upload failed. Check your connection.","error"),ks()}}}function gl(e,t,s){var l,d,v;(l=document.getElementById("vs-knowledge-overlay"))==null||l.remove();let n=p=>p.replace(/[_-]/g," ").replace(/\b\w/g,c=>c.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([p,c])=>{let m=typeof c=="object"?c.value||JSON.stringify(c):String(c),f=typeof c=="object"?c.confidence:null,u=f==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${y(n(p))}</div>
          <div class="vs-kv-value">
            <span>${y(m)}</span>
            ${f?`<span class="vs-kv-badge ${u}">${y(f)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(t).map(([p,c])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${y(n(p))}</div>
        <div class="vs-kv-section-body">${y(String(c))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?E.book:E.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${y(e)}</h2>
            <p class="vs-knowledge-modal-subtitle">${s==="memory"?"Facts the AI has learned about your business from conversations.":"Design decisions the AI uses to maintain visual consistency."}</p>
          </div>
        </div>
        <button id="vs-knowledge-close" class="vs-btn vs-btn-ghost vs-btn-icon" title="Close">${E.x}</button>
      </div>
      <div class="vs-knowledge-modal-body">
        ${o}
      </div>
      <div class="vs-knowledge-modal-footer">
        <span class="vs-knowledge-modal-hint">
          ${E.info}
          These values are managed by VoxelSite. Ask in chat to update them.
        </span>
        <button id="vs-knowledge-done" class="vs-btn vs-btn-primary vs-btn-sm">Done</button>
      </div>
    </div>
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",r)},r=p=>{p.key==="Escape"&&a()};document.addEventListener("keydown",r),(d=i.querySelector("#vs-knowledge-close"))==null||d.addEventListener("click",a),(v=i.querySelector("#vs-knowledge-done"))==null||v.addEventListener("click",a),ke(i,a)}function Fp(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Vp()})}function zp(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Up()})}function Up(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-install-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let l=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()===a?fl(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?fl(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>we(t)),t.addEventListener("click",l=>{l.target===t&&we(t)});let r=l=>{l.key==="Escape"&&(we(t),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)}async function fl(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await $.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let r=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=r,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function wl(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function Vp(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let r=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()==="RESET"?hl(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?hl(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>we(t)),t.addEventListener("click",r=>{r.target===t&&we(t)});let a=r=>{r.key==="Escape"&&(we(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function hl(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:r}=await $.post("/site/reset",{confirm:"RESET"});if(i){R.set("pages",[]),R.set("hasFormSchemas",!1),R.set("conversations",null),R.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{we(e),window.location.hash!=="#/chat"?pt.navigate("chat"):pt.refresh()},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let l=e.querySelector(".vs-modal-desc");if(l){let d=l.textContent;l.textContent=(r==null?void 0:r.message)||"Reset failed. Please try again.",l.style.color="var(--vs-error)",setTimeout(()=>{l.textContent=d,l.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function Wp(e){var s;let t=document.getElementById("set-ai-model");if(t)try{let{ok:n,data:o}=await $.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?t.innerHTML=o.models.map(i=>`<option value="${y(i.id)}" ${i.id===e?"selected":""}>${y(i.name||i.id)}</option>`).join(""):t.innerHTML='<option value="">Test your connection to load available models</option>'}catch{t.innerHTML='<option value="">Test your connection to load available models</option>'}}function yt(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function wa(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function Gp(e,t){let s=e.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async p=>{var c;if((c=window.demoGuard)!=null&&c.call(window)){p.target.value=s;return}s=p.target.value,await $.put("/settings",{ai_provider:s}),ks()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var h,g,b,k,w;if((h=window.demoGuard)!=null&&h.call(window))return;let p=((g=i==null?void 0:i.value)==null?void 0:g.trim())||"",c=((k=(b=document.getElementById("set-base-url"))==null?void 0:b.value)==null?void 0:k.trim())||"";if(s!=="openai_compatible"&&(!p||p.startsWith("\u2022\u2022"))){Ea("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:m,data:f,error:u}=await $.post("/settings/test-api",{provider:s,api_key:p.startsWith("\u2022\u2022")?"":p,base_url:c});if(o.textContent="Test Connection",o.disabled=!1,m){if(Ea("\u2713 Connected successfully!","success"),(w=f==null?void 0:f.models)!=null&&w.length){let x=document.getElementById("set-ai-model");if(x){let C=e[`ai_${s}_model`]||"";x.innerHTML=f.models.map(_=>`<option value="${y(_.id)}" ${_.id===C?"selected":""}>${y(_.name||_.id)}</option>`).join("")}}}else Ea("\u2717 "+((u==null?void 0:u.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),r=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var f,u,h,g,b;if((f=window.demoGuard)!=null&&f.call(window))return;a.textContent="Saving...",a.disabled=!0;let p={site_name:((h=(u=document.getElementById("set-site-name"))==null?void 0:u.value)==null?void 0:h.trim())||"",site_tagline:((b=(g=document.getElementById("set-site-tagline"))==null?void 0:g.value)==null?void 0:b.trim())||""},{ok:c,error:m}=await $.put("/settings",p);if(a.textContent="Save Identity",a.disabled=!1,r){if(r.classList.remove("hidden"),c){r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3",R.set("siteName",p.site_name),document.title=p.site_name?`Studio \u2014 ${p.site_name}`:"Studio \u2014 VoxelSite";let k=document.querySelector(".vs-logo-text");k&&(k.textContent=p.site_name||"VoxelSite")}else r.textContent="\u2717 "+((m==null?void 0:m.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3";setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3)}});let l=document.getElementById("btn-save-settings"),d=document.getElementById("save-status");l&&l.addEventListener("click",async()=>{var h,g,b,k,w;if((h=window.demoGuard)!=null&&h.call(window))return;l.textContent="Saving...",l.disabled=!0;let p={ai_provider:s,[`ai_${s}_model`]:((g=document.getElementById("set-ai-model"))==null?void 0:g.value)||"",ai_max_tokens:parseInt(((b=document.getElementById("set-max-tokens"))==null?void 0:b.value)||"32000",10),evaluator_enabled:(k=document.getElementById("set-evaluator-enabled"))!=null&&k.checked?1:0},c=document.getElementById("set-base-url");c&&(p.ai_openai_compatible_base_url=c.value.trim());let m=(w=i==null?void 0:i.value)==null?void 0:w.trim();m&&!m.startsWith("\u2022\u2022")&&(p[`ai_${s}_api_key`]=m);let{ok:f,error:u}=await $.put("/settings",p);l.textContent="Save Settings",l.disabled=!1,d&&(d.classList.remove("hidden"),f?(d.textContent="\u2713 Saved",d.className="text-xs text-vs-success ml-3"):(d.textContent="\u2717 "+((u==null?void 0:u.message)||"Failed to save."),d.className="text-xs text-vs-error ml-3"),setTimeout(()=>d==null?void 0:d.classList.add("hidden"),3e3))});let v=document.getElementById("set-evaluator-enabled");if(v){let p=v.closest("label")||v.parentElement,c=p==null?void 0:p.querySelector(".vs-toggle-track"),m=p==null?void 0:p.querySelector(".vs-toggle-thumb");v.addEventListener("change",()=>{c&&(c.style.background=v.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),m&&(m.style.left=v.checked?"18px":"2px")})}}function Kp(e,t){var m;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function r(){if(!e.smtp_host)return"gmail";for(let[f,u]of Object.entries(t))if(u.host&&u.host===e.smtp_host)return f;return"custom"}if(i){let f=r();i.value=f,a&&((m=t[f])!=null&&m.help)&&(a.textContent=t[f].help)}s&&s.addEventListener("change",()=>{let f=s.value;n&&(n.style.display=f==="smtp"?"block":"none"),o&&(o.style.display=f==="mailpit"?"block":"none");let u=document.getElementById("mail-common-fields");u&&(u.style.display=f==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let f=t[i.value];if(!f)return;let u=document.getElementById("set-smtp-host"),h=document.getElementById("set-smtp-port"),g=document.getElementById("set-smtp-encryption");u&&(u.value=f.host||""),h&&(h.value=f.port||587),g&&(g.value=f.encryption||"tls"),a&&(a.textContent=f.help||"")});let l=document.getElementById("btn-toggle-smtp-pass"),d=document.getElementById("set-smtp-password");l&&d&&l.addEventListener("click",()=>{let f=d.type==="password";d.type=f?"text":"password",l.innerHTML=f?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let v=document.getElementById("btn-mail-test");v&&v.addEventListener("click",async()=>{var k,w,x;if((k=window.demoGuard)!=null&&k.call(window))return;let f=(x=(w=document.getElementById("set-mail-test-recipient"))==null?void 0:w.value)==null?void 0:x.trim();if(!f){ka("Enter an email address to send the test to.","warning");return}v.textContent="Sending...",v.disabled=!0;let u=bl();u.test_recipient=f;let{ok:h,data:g,error:b}=await $.post("/settings/mail/test",u);v.textContent="Send Test",v.disabled=!1,h?ka("\u2713 "+((g==null?void 0:g.message)||"Test email sent successfully!"),"success"):ka("\u2717 "+((b==null?void 0:b.message)||"Test failed."),"error")});let p=document.getElementById("btn-save-mail"),c=document.getElementById("save-mail-status");p&&p.addEventListener("click",async()=>{var g;if((g=window.demoGuard)!=null&&g.call(window))return;p.textContent="Saving...",p.disabled=!0;let f=bl(),{ok:u,error:h}=await $.post("/settings/mail",f);p.textContent="Save Email Settings",p.disabled=!1,c&&(c.classList.remove("hidden"),u?(c.textContent="\u2713 Saved",c.className="text-xs text-vs-success ml-3"):(c.textContent="\u2717 "+((h==null?void 0:h.message)||"Failed to save."),c.className="text-xs text-vs-error ml-3"),setTimeout(()=>c==null?void 0:c.classList.add("hidden"),3e3))})}function bl(){var t,s,n,o,i,a,r,l,d,v,p,c,m,f,u;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((l=(r=document.getElementById("set-smtp-host"))==null?void 0:r.value)==null?void 0:l.trim())||"",smtp_port:parseInt(((d=document.getElementById("set-smtp-port"))==null?void 0:d.value)||"587",10),smtp_username:((p=(v=document.getElementById("set-smtp-username"))==null?void 0:v.value)==null?void 0:p.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((c=document.getElementById("set-smtp-encryption"))==null?void 0:c.value)||"tls",mailpit_host:((f=(m=document.getElementById("set-mailpit-host"))==null?void 0:m.value)==null?void 0:f.trim())||"localhost",mailpit_port:parseInt(((u=document.getElementById("set-mailpit-port"))==null?void 0:u.value)||"1025",10)}}function ka(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function Ea(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function Xp(e){let t=document.getElementById("set-api-enabled"),s=document.getElementById("api-access-body"),n=document.getElementById("btn-save-api-settings"),o=document.getElementById("btn-generate-api-key");t&&t.addEventListener("change",()=>{let i=t.checked,a=t.parentElement.querySelector(".vs-toggle-track"),r=t.parentElement.querySelector(".vs-toggle-thumb");a&&(a.style.background=i?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),r&&(r.style.left=i?"18px":"2px"),s&&(s.style.opacity=i?"":"0.4",s.style.pointerEvents=i?"":"none")}),n&&n.addEventListener("click",async()=>{var l,d,v,p,c;if((l=window.demoGuard)!=null&&l.call(window))return;let i=document.getElementById("save-api-status");n.disabled=!0,n.textContent="Saving...";let a={agent_api_enabled:((d=document.getElementById("set-api-enabled"))==null?void 0:d.checked)||!1,agent_api_allowed_origins:((p=(v=document.getElementById("set-api-origins"))==null?void 0:v.value)==null?void 0:p.trim())||"*"},r=await $.put("/settings",a);n.disabled=!1,n.textContent="Save API Settings",r.ok?(I("API settings saved","success"),i&&(i.textContent="Saved",i.className="text-xs text-vs-success",i.classList.remove("hidden"),setTimeout(()=>i.classList.add("hidden"),2e3))):I(((c=r.error)==null?void 0:c.message)||"Failed to save","error")}),$a(),o&&o.addEventListener("click",()=>{var i;(i=window.demoGuard)!=null&&i.call(window)||Jp()})}var yl={owner:["pages:read","pages:write","settings:read","settings:write","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],editor:["pages:read","pages:write","compile:trigger","submissions:read","assets:read","assets:write","tools:invoke"],agent:["pages:read","pages:write","settings:read","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],viewer:["pages:read","settings:read","submissions:read","assets:read"]},Yp={"prompt:execute":["owner","editor","agent"]};async function $a(){var t;let e=document.getElementById("api-keys-list");if(e)try{let n=((t=(await $.get("/settings/api-keys")).data)==null?void 0:t.keys)||[];if(n.length===0){e.innerHTML=`
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
        ${n.map(o=>{let i=o.last_used_at?new Date(o.last_used_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",a=new Date(o.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),l={agent:"var(--vs-accent)",editor:"#3b82f6",viewer:"var(--vs-text-ghost)",owner:"#8b5cf6"}[o.role]||"var(--vs-text-ghost)",v=(Array.isArray(o.scopes)?o.scopes:typeof o.scopes=="string"?JSON.parse(o.scopes||"[]"):[]).includes("prompt:execute");return`
            <div class="vs-api-key-row" style="display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-lg); background: var(--vs-bg-base); transition: border-color 0.15s ease, box-shadow 0.2s ease;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: color-mix(in srgb, ${l} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${l} 18%, transparent);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${l}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.01em;">${y(o.label||"Unnamed")}</span>
                  <span style="font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: var(--radius-full); color: ${l}; background: color-mix(in srgb, ${l} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${l} 20%, transparent); text-transform: capitalize;">${y(o.role||"agent")}</span>
                  ${v?'<span style="font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-full); color: var(--vs-accent); background: color-mix(in srgb, var(--vs-accent) 8%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, var(--vs-accent) 20%, transparent); letter-spacing: 0.5px;">AI</span>':""}
                </div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <code style="font-size: 10px; font-family: var(--font-mono); background: var(--vs-bg-inset); padding: 1px 5px; border-radius: var(--radius-xs); border: 1px solid var(--vs-border-subtle);">${y(o.key_prefix||"???")}\u2026</code>
                  <span>Created ${a}</span>
                  <span>\xB7 Last used: ${i}</span>
                </div>
              </div>
              <button class="vs-btn vs-btn-ghost vs-btn-xs btn-revoke-key" data-id="${o.id}" style="color: var(--vs-text-ghost); white-space: nowrap; flex-shrink: 0;" title="Revoke">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Revoke
              </button>
            </div>`}).join("")}
      </div>`,e.querySelectorAll(".btn-revoke-key").forEach(o=>{o.addEventListener("click",async()=>{var r;if((r=window.demoGuard)!=null&&r.call(window))return;let i=o.dataset.id;if(o.dataset.confirm!=="true"){o.dataset.confirm="true",o.innerHTML='<span style="font-size: 11px; color: var(--vs-error);">Sure?</span>',setTimeout(()=>{o.dataset.confirm==="true"&&(o.dataset.confirm="",o.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Revoke')},3e3);return}let a=o.closest(".vs-api-key-row");a&&(a.style.opacity="0.4"),await $.delete(`/settings/api-keys/${i}`),I("API key revoked","success"),$a()})})}catch{e.innerHTML='<div style="font-size: 12px; color: var(--vs-text-ghost); text-align: center; padding: 16px 0;">Could not load API keys.</div>'}}function Jp(){let e=document.getElementById("generate-key-modal");e&&e.remove();let t=document.createElement("div");t.className="vs-modal-overlay",t.id="generate-key-modal",t.innerHTML=`
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
    </div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>we(t),n=c=>{c.key==="Escape"&&(c.preventDefault(),s())};document.addEventListener("keydown",n);let o=new MutationObserver(()=>{document.body.contains(t)||(document.removeEventListener("keydown",n),o.disconnect())});o.observe(document.body,{childList:!0}),ke(t,s),t.querySelector("#cancel-generate-key").addEventListener("click",s);let i=t.querySelector("#gen-key-label");i==null||i.addEventListener("keydown",c=>{var m;c.key==="Enter"&&(c.preventDefault(),(m=t.querySelector("#confirm-generate-key"))==null||m.click())});let a=t.querySelector("#gen-key-prompt-execute"),r=t.querySelector("#gen-key-prompt-toggle"),l=a,d=r==null?void 0:r.querySelector('span[style*="font-size: 11px"]'),v=c=>{(Yp["prompt:execute"]||[]).includes(c)?(l.disabled=!1,r.style.opacity="1",r.style.cursor="pointer",d&&(d.textContent="Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.")):(l.checked=!1,l.disabled=!0,r.style.opacity="0.45",r.style.cursor="not-allowed",r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)",d&&(d.textContent="Not available for read-only roles. Prompt execution requires write access."))},p=t.querySelector("#gen-key-role");p==null||p.addEventListener("change",()=>v(p.value)),v((p==null?void 0:p.value)||"agent"),a==null||a.addEventListener("change",()=>{a.checked?(r.style.borderColor="color-mix(in srgb, var(--vs-accent) 40%, transparent)",r.style.background="color-mix(in srgb, var(--vs-accent) 4%, var(--vs-bg-base))"):(r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)")}),t.querySelector("#confirm-generate-key").addEventListener("click",async()=>{var b,k,w,x,C,_;let c=(k=(b=document.getElementById("gen-key-label"))==null?void 0:b.value)==null?void 0:k.trim(),m=((w=document.getElementById("gen-key-role"))==null?void 0:w.value)||"agent",f=(x=document.getElementById("gen-key-prompt-execute"))==null?void 0:x.checked;if(!c){I("Please enter a label for the key","error");return}let u=t.querySelector("#confirm-generate-key");u.disabled=!0,u.textContent="Generating\u2026";let h={label:c,role:m};f&&(h.scopes=[...yl[m]||yl.agent,"prompt:execute"]);let g=await $.post("/settings/api-keys",h);g.ok&&((C=g.data)!=null&&C.key)?(s(),Zp(g.data.key,c),$a()):(u.disabled=!1,u.textContent="Generate",I(((_=g.error)==null?void 0:_.message)||"Failed to generate key","error"))})}function Zp(e,t){let s=document.getElementById("key-reveal-modal");s&&s.remove();let n=document.createElement("div");n.className="vs-modal-overlay",n.id="key-reveal-modal",n.innerHTML=`
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
          <input type="text" readonly value="${y(e)}" id="revealed-key-input" class="vs-input" style="width: 100%; font-family: var(--font-mono); font-size: 12.5px; padding-right: 44px; letter-spacing: 0.01em; color: var(--vs-text-primary);" />
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("is-visible"));let o=()=>we(n),i=l=>{l.key==="Escape"&&(l.preventDefault(),o())};document.addEventListener("keydown",i);let a=new MutationObserver(()=>{document.body.contains(n)||(document.removeEventListener("keydown",i),a.disconnect())});a.observe(document.body,{childList:!0}),ke(n,o),n.querySelector("#close-key-reveal").addEventListener("click",o);let r=n.querySelector("#revealed-key-input");r==null||r.addEventListener("focus",()=>r.select()),n.querySelector("#copy-api-key").addEventListener("click",async()=>{let l=n.querySelector("#copy-api-key");try{await navigator.clipboard.writeText(e),l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',l.style.color="#22c55e",setTimeout(()=>{l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',l.style.color=""},2e3)}catch{r==null||r.select()}})}var Es=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Zs=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Ca={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},Qp={contact:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',newsletter:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',callback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',feedback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'};function El(){return setTimeout(()=>ev(),0),`
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
  `}async function ev(){var a,r,l,d,v,p;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let c=await kl();c!=null&&c.ok&&c.actionId&&(window.location.hash=`#/actions/${c.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let w=function(x){let C=document.getElementById("bar-color-swatch"),_=document.getElementById("bar-brand-hex"),P=document.getElementById("bar-brand-color");C&&(C.style.background=x),_&&_!==document.activeElement&&(_.value=x),P&&(P.value=x),document.querySelectorAll(".bar-color-preset").forEach(j=>{j.style.borderColor=j.dataset.color.toLowerCase()===x.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:c,data:m}=await $.get("/agentic/actions/bar-settings"),f=c&&(m==null?void 0:m.settings)||{theme:"bottom-bar",visibility:"all-pages"},u=f.theme||"bottom-bar",h=f.visibility||"all-pages",g={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
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
      </svg>`},b={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},k={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(k).map(([x,C])=>`<option value="${x}" ${h===x?"selected":""}>${C}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(g).map(([x,C])=>{let _=x===u;return`
              <button type="button" class="bar-theme-option" data-theme="${x}" style="
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
                <div style="width: 100%; max-width: 120px;">${C}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${_?"var(--vs-accent)":"var(--vs-text-secondary)"};">${b[x]}</span>
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
              ${["light","dark"].map(x=>{let C=x===(f.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${x}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${C?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${C?"#fff":"var(--vs-text-secondary)"};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${{light:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',dark:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}[x]} ${x.charAt(0).toUpperCase()+x.slice(1)}</button>`}).join("")}
            </div>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Brand Color</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label style="position: relative; cursor: pointer; flex-shrink: 0;">
                <input type="color" id="bar-brand-color" value="${f.brand_color||"#EA580C"}" style="
                  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
                ">
                <div id="bar-color-swatch" style="
                  width: 32px; height: 32px; border-radius: 8px;
                  background: ${f.brand_color||"#EA580C"};
                  border: 2px solid var(--vs-border-subtle);
                  transition: border-color 0.15s, box-shadow 0.15s;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                "></div>
              </label>
              <input type="text" id="bar-brand-hex" class="vs-input" value="${f.brand_color||"#EA580C"}" placeholder="#EA580C" style="
                font-size: 12px; height: 32px; padding: 4px 8px; width: 88px; font-family: var(--font-mono, monospace); letter-spacing: 0.02em;
              ">
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${["#EA580C","#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#374151"].map(x=>`
                  <button type="button" class="bar-color-preset" data-color="${x}" title="${x}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${x}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
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
    `,document.querySelectorAll(".bar-theme-option").forEach(x=>{x.addEventListener("click",async()=>{let C=x.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(P=>{let j=P.dataset.theme===C;P.style.borderColor=j?"var(--vs-accent)":"var(--vs-border-subtle)",P.style.background=j?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",P.style.color=j?"var(--vs-accent)":"var(--vs-text-ghost)",P.classList.toggle("active",j);let Z=P.querySelector("span");Z&&(Z.style.color=j?"var(--vs-accent)":"var(--vs-text-secondary)");let Y=P.querySelector('[style*="position: absolute"]');if(Y&&!j&&Y.remove(),j&&!P.querySelector('[style*="position: absolute"]')){let q=document.createElement("div");q.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",q.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',P.appendChild(q)}});let{ok:_}=await $.put("/agentic/actions/bar-settings",{theme:C});_&&(x.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>x.style.boxShadow="",400),I("Bar style updated","success"))})}),(r=document.getElementById("bar-visibility"))==null||r.addEventListener("change",async x=>{let{ok:C}=await $.put("/agentic/actions/bar-settings",{visibility:x.target.value});C&&I("Bar visibility updated","success")}),document.querySelectorAll(".bar-scheme-btn").forEach(x=>{x.addEventListener("click",async()=>{let C=x.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(P=>{let j=P.dataset.scheme===C;P.style.background=j?"var(--vs-accent)":"var(--vs-bg-surface)",P.style.color=j?"#fff":"var(--vs-text-secondary)"});let{ok:_}=await $.put("/agentic/actions/bar-settings",{color_scheme:C});_&&I("Color scheme updated","success")})}),(l=document.getElementById("bar-brand-color"))==null||l.addEventListener("input",x=>{w(x.target.value)}),(d=document.getElementById("bar-brand-color"))==null||d.addEventListener("change",async x=>{let{ok:C}=await $.put("/agentic/actions/bar-settings",{brand_color:x.target.value});C&&I("Brand color updated","success")}),(v=document.getElementById("bar-brand-hex"))==null||v.addEventListener("change",async x=>{let C=x.target.value.trim();if(C.startsWith("#")||(C="#"+C),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(C)){w(C);let{ok:_}=await $.put("/agentic/actions/bar-settings",{brand_color:C});_&&I("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach(x=>{x.addEventListener("click",async()=>{let C=x.dataset.color;w(C);let{ok:_}=await $.put("/agentic/actions/bar-settings",{brand_color:C});_&&I("Brand color updated","success")})}),w(f.brand_color||"#EA580C")}let{ok:s,data:n}=await $.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon" style="color: var(--vs-accent);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="vs-empty-state-title">No actions yet</p>
          <p class="vs-empty-state-desc">Create your first agent action to let AI assistants and website visitors interact with your business \u2014 reservations, appointments, quotes, and more.</p>
          <button id="btn-empty-new-action" class="vs-btn vs-btn-primary vs-btn-sm" style="margin-top: 12px;">${E.plus} New Action</button>
        </div>
      </div>
    `,(p=document.getElementById("btn-empty-new-action"))==null||p.addEventListener("click",async()=>{let c=await kl();c!=null&&c.ok&&c.actionId&&(window.location.hash=`#/actions/${c.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((c,m)=>{let f=c.active,u=c._stats||c.stats||{},h=u.total||0,g=u.last_created_at?On(u.last_created_at):"\u2014",b={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},k=b[c.icon]||b.circle;return`
          <div class="vs-action-list-row vs-form-card" data-action-id="${y(c.id)}" style="cursor: pointer; transition: box-shadow 0.15s ease;">
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
            <div class="vs-form-card-icon" style="color: ${f?"var(--vs-success)":"var(--vs-text-ghost)"}; background: ${f?"color-mix(in srgb, var(--vs-success) 10%, transparent)":"var(--vs-bg-raised)"};">
              ${k}
            </div>
            <div class="vs-form-card-body">
              <div class="vs-form-card-name">${y(c.name||c.id)}</div>
              ${c.description?`<div class="vs-form-card-desc">${y(c.description)}</div>`:""}
              <div class="vs-form-card-meta">
                <span class="vs-status-pill" style="
                  background: ${f?"var(--vs-success-dim)":"var(--vs-bg-raised)"};
                  color: ${f?"var(--vs-success)":"var(--vs-text-ghost)"};
                  font-size: 11px; padding: 1px 8px;
                ">${f?"Active":"Draft"}</span>
                <span class="vs-form-card-dot">\xB7</span>
                <span>${h} submission${h!==1?"s":""}</span>
                ${u.today>0?`<span class="vs-form-card-dot">\xB7</span><span>+${u.today} today</span>`:""}
                <span class="vs-form-card-dot">\xB7</span>
                <span>${g}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `}).join("")}
    </div>
  `,document.querySelectorAll(".vs-action-list-row").forEach(c=>{c.addEventListener("click",m=>{if(m.target.closest(".vs-action-reorder"))return;let f=c.dataset.actionId;f&&(window.location.hash="#/actions/"+encodeURIComponent(f))})});async function i(){let c=document.querySelectorAll("#actions-list .vs-action-list-row"),m=Array.from(c).map(f=>f.dataset.actionId);await $.post("/agentic/actions/reorder",{order:m})}document.querySelectorAll(".action-move-up").forEach(c=>{c.addEventListener("click",async m=>{m.preventDefault(),m.stopPropagation();let f=c.closest(".vs-action-list-row"),u=f==null?void 0:f.previousElementSibling;u&&(f.parentNode.insertBefore(f,u),f.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>f.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(c=>{c.addEventListener("click",async m=>{m.preventDefault(),m.stopPropagation();let f=c.closest(".vs-action-list-row"),u=f==null?void 0:f.nextElementSibling;u&&(f.parentNode.insertBefore(u,f),f.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>f.style.boxShadow="",300),await i())})})}async function kl(){return new Promise(async e=>{var r;let{ok:t,data:s}=await $.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 580px;">
        <div class="vs-modal-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
          <h2 class="vs-modal-title" style="margin: 0;">${E.zap} New Agent Action</h2>
          <button id="close-new-action-modal" style="background: none; border: none; cursor: pointer; color: var(--vs-text-ghost); padding: 4px; margin: -4px -4px 0 0; line-height: 0; border-radius: var(--radius-md); transition: color 0.15s ease;" onmouseenter="this.style.color='var(--vs-text-primary)'" onmouseleave="this.style.color='var(--vs-text-ghost)'">${E.x}</button>
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
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${Qp[l.id]||E.zap}</span>
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
              <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: transparent; color: var(--vs-text-ghost);">${E.plus}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-secondary);">Blank</span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.3;">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(l=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(l)},a=l=>{l.key==="Escape"&&(l.preventDefault(),i())};document.addEventListener("keydown",a),ke(o,i),(r=document.getElementById("close-new-action-modal"))==null||r.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(l=>{l.addEventListener("mouseenter",()=>{l.style.borderColor="var(--vs-accent)",l.style.background="var(--vs-bg-raised)"}),l.addEventListener("mouseleave",()=>{l.style.borderColor=(l.dataset.templateId==="blank","var(--vs-border)"),l.style.background=l.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),l.addEventListener("click",async()=>{var v,p;let d=l.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(c=>{c.style.pointerEvents="none",c.style.opacity="0.5"}),l.style.opacity="1",l.style.borderColor="var(--vs-accent)",d==="blank"){let c={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"email",type:"email",label:"Email",placeholder:"you@example.com",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:m,data:f}=await $.post("/agentic/actions",c);m&&(f!=null&&f.action)?(I("Action created","success"),i({ok:!0,actionId:f.action.id})):(I(((v=f==null?void 0:f.error)==null?void 0:v.message)||"Failed to create action","error"),i())}else{let{ok:c,data:m}=await $.post("/agentic/actions/from-template",{template_id:d});c&&(m!=null&&m.action)?(I(`${m.action.name} created`,"success"),i({ok:!0,actionId:m.action.id})):(I(((p=m==null?void 0:m.error)==null?void 0:p.message)||"Failed to create action","error"),i())}})})})}function $l(e){return setTimeout(()=>ai(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function ai(e){var d,v,p,c,m,f,u,h,g,b,k,w,x,C,_,P,j,Z,Y,q;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await $.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,r=i.stats||{},l=a.active;if(t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${y(a.name||e)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${y(a.name||e)}</h1>
        <div class="flex items-center gap-2">
          <button id="btn-toggle-active" class="vs-btn ${l?"vs-btn-secondary":"vs-btn-primary"} vs-btn-sm" title="${l?"Deactivate this action":"Activate this action on your website"}">
            ${l?"\u25CF Live \u2014 click to deactivate":"\u25CB Draft \u2014 click to go live"}
          </button>
          <button id="btn-duplicate-action" class="vs-btn vs-btn-ghost vs-btn-sm" title="Duplicate">
            ${E.copy} Duplicate
          </button>
          <button id="btn-delete-action" class="vs-btn vs-btn-ghost vs-btn-sm" style="color: var(--vs-error);" title="Delete">
            ${E.trash}
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
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${((v=r.by_status)==null?void 0:v.confirmed)||0}</span>
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
  `,s){let O=function(M){let U=M.querySelector(".field-required");if(!U)return;let ne=M.querySelectorAll("span")[0],L=M.querySelectorAll("span")[1],B=()=>{ne.style.background=U.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",L.style.left=U.checked?"18px":"2px"};U.addEventListener("change",B)},me=function(M){return M.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},ye=function(){let M=document.querySelectorAll("#action-fields-builder .vs-field-row"),U=[],ne=new Set;return M.forEach(L=>{var G,J,z,W;let B=((J=(G=L.querySelector(".field-label"))==null?void 0:G.value)==null?void 0:J.trim())||"",T=((z=L.querySelector(".field-type"))==null?void 0:z.value)||"text",A=((W=L.querySelector(".field-required"))==null?void 0:W.checked)||!1,D=B?me(B):"";if(ne.has(D)){let ee=2;for(;ne.has(D+"_"+ee);)ee++;D=D+"_"+ee}if(ne.add(D),D&&B){let ee={name:D,type:T,label:B,required:A},ue=L.dataset.placeholder;ue&&(ee.placeholder=ue);let re=L.dataset.default;re&&(ee.default_value=re);let $e=L.dataset.description;$e&&(ee.description=$e);let be=L.dataset.min;be!==""&&be!==void 0&&(ee.min=Number(be));let Me=L.dataset.max;Me!==""&&Me!==void 0&&(ee.max=Number(Me));let he=L.dataset.maxlength;he&&(ee.max_length=Number(he));let Be=L.dataset.minlength;Be&&(ee.min_length=Number(Be));let ae=L.dataset.options;if(ae)try{ee.options=JSON.parse(ae)}catch{ee.options=ae.split(",").map(Ae=>Ae.trim()).filter(Boolean)}if(T==="file"){let Ie=L.dataset.allowedExtensions;if(Ie)try{ee.allowed_extensions=JSON.parse(Ie)}catch{ee.allowed_extensions=Ie.split(",").map(le=>le.trim().toLowerCase()).filter(Boolean)}let Ae=L.dataset.maxSizeMb;Ae&&(ee.max_size_mb=Number(Ae))}T==="checkbox"&&L.dataset.checkedDefault==="true"&&(ee.checked_default=!0),U.push(ee)}}),U},dt=function(M){var U,ne;(U=M.querySelector(".field-move-up"))==null||U.addEventListener("click",()=>{let L=M.previousElementSibling;L&&(M.parentNode.insertBefore(M,L),M.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>M.style.boxShadow="",300))}),(ne=M.querySelector(".field-move-down"))==null||ne.addEventListener("click",()=>{let L=M.nextElementSibling;L&&(M.parentNode.insertBefore(L,M),M.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>M.style.boxShadow="",300))})},Bt=function(M){M.addEventListener("click",async()=>{let U=M.closest(".vs-field-row");await Ce({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&(U.style.opacity="0",U.style.transform="translateX(20px)",U.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>U.remove(),200))})},_t=function(M){M&&M.addEventListener("click",()=>{var B,T,A;let U=M.closest(".vs-field-row");if(!U)return;let ne=((B=U.querySelector(".field-type"))==null?void 0:B.value)||"text",L=((T=U.querySelector(".field-label"))==null?void 0:T.value)||((A=U.querySelector(".field-name"))==null?void 0:A.value)||"Field";Os(U,ne,L)})},Os=function(M,U,ne){var le,Pe,qs,Xt,rt;(le=document.getElementById("vs-field-settings-modal"))==null||le.remove();let L=M.dataset.placeholder||"",B=M.dataset.default||"",T=M.dataset.min||"",A=M.dataset.max||"",D=M.dataset.maxlength||"",G=M.dataset.options||"[]",J=M.dataset.description||"",z=["text","email","tel","url","textarea"].includes(U),W=U==="number",ee=["text","email","tel","url","textarea"].includes(U),ue=["select","radio","multiselect"].includes(U),re=U==="multiselect",$e=U==="file",be=U==="checkbox",Me="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",he="margin-bottom: 16px;",Be="";if(z&&(Be+=`<div style="${he}">
          <label style="${Me}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${ge(L)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),!$e&&!be&&(Be+=`<div style="${he}">
          <label style="${Me}">Default Value</label>
          <input type="${W?"number":"text"}" id="fs-default" class="vs-input" value="${ge(B)}" placeholder="Pre-filled value" />
        </div>`),be&&(Be+=`<div style="${he}">
          <label style="${Me}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked \u2014 defaults to field name if empty)</span></label>
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
        </div>`),W&&(Be+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${he}">
          <div>
            <label style="${Me}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${ge(T)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${Me}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${ge(A)}" placeholder="No limit" />
          </div>
        </div>`),ee&&(Be+=`<div style="${he}">
          <label style="${Me}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${ge(D)}" placeholder="No limit" min="1" />
        </div>`),ue){let Se;try{Se=JSON.parse(G)}catch{Se=G.split(",").map(We=>We.trim()).filter(Boolean)}let Ne;if(re){let je=(M.dataset.default||"").split(",").map(We=>We.trim()).filter(Boolean);Ne=Se.map(We=>je.includes(We)?"[x] "+We:We).join(`
`)}else Ne=Se.join(`
`);Be+=`<div style="${he}">
          <label style="${Me}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${re?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${re?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${y(Ne)}</textarea>
        </div>`}if($e){let Se=M.dataset.allowedExtensions||"",Ne=M.dataset.maxSizeMb||"10",je;try{je=Se?JSON.parse(Se):[]}catch{je=[]}let We=je.join(", "),Et=["pdf","doc","docx","xls","xlsx","csv","txt"],An=["jpg","jpeg","png","gif","webp"],Pn=["zip","rar"],Oo=Et.some(fs=>je.includes(fs)),qo=An.some(fs=>je.includes(fs)),Fo=Pn.some(fs=>je.includes(fs));Be+=`<div style="${he}">
          <label style="${Me}">Allowed File Types</label>
          <div style="display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Et)}' ${Oo?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Documents
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(An)}' ${qo?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Images
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Pn)}' ${Fo?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Archives
            </label>
          </div>
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${ge(We)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${he}">
          <label style="${Me}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${ge(Ne)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`}Be+=`<div style="${he}">
        <label style="${Me}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${ge(J)}" placeholder="Optional description or instructions" />
      </div>`;let ae=document.createElement("div");if(ae.id="vs-field-settings-modal",ae.style.cssText="position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;",ae.innerHTML=`
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
                ${y(ne)} Settings
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
            ${Be}
          </div>
          <div style="
            padding: 16px 24px; border-top: 1px solid var(--vs-border-subtle);
            display: flex; justify-content: flex-end; gap: 8px;
          ">
            <button id="fs-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
            <button id="fs-save" class="vs-btn vs-btn-primary vs-btn-sm">Apply</button>
          </div>
        </div>
      `,document.body.appendChild(ae),setTimeout(()=>{var Se;return(Se=ae.querySelector("input, textarea"))==null?void 0:Se.focus()},100),$e&&ae.querySelectorAll(".fs-ext-group").forEach(Se=>{Se.addEventListener("change",()=>{let Ne=ae.querySelector("#fs-allowed-extensions");if(!Ne)return;let je=Ne.value.split(",").map(Et=>Et.trim().toLowerCase()).filter(Boolean),We=JSON.parse(Se.dataset.exts||"[]");Se.checked?We.forEach(Et=>{je.includes(Et)||je.push(Et)}):je=je.filter(Et=>!We.includes(Et)),Ne.value=je.join(", ")})}),be){let Se=(Pe=ae.querySelector("#fs-checked-default"))==null?void 0:Pe.closest("label");if(Se){let Ne=ae.querySelector("#fs-checked-default"),je=Se.querySelectorAll("span > span")[0],We=Se.querySelectorAll("span > span")[1];Ne==null||Ne.addEventListener("change",()=>{je&&(je.style.background=Ne.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),We&&(We.style.left=Ne.checked?"18px":"2px")})}}let Ie=()=>ae.remove(),Ae=ae.querySelector("#fs-backdrop");Ae&&ke(Ae,Ie),(qs=ae.querySelector("#fs-close"))==null||qs.addEventListener("click",Ie),(Xt=ae.querySelector("#fs-cancel"))==null||Xt.addEventListener("click",Ie);let Je=Se=>{Se.key==="Escape"&&(Ie(),document.removeEventListener("keydown",Je))};document.addEventListener("keydown",Je),(rt=ae.querySelector("#fs-save"))==null||rt.addEventListener("click",()=>{var Se,Ne,je,We,Et,An,Pn,Oo,qo,Fo;if(z&&(M.dataset.placeholder=((Se=ae.querySelector("#fs-placeholder"))==null?void 0:Se.value)||""),$e||(M.dataset.default=((Ne=ae.querySelector("#fs-default"))==null?void 0:Ne.value)||""),be&&(M.dataset.checkedDefault=(je=ae.querySelector("#fs-checked-default"))!=null&&je.checked?"true":"false"),W&&(M.dataset.min=((We=ae.querySelector("#fs-min"))==null?void 0:We.value)||"",M.dataset.max=((Et=ae.querySelector("#fs-max"))==null?void 0:Et.value)||""),ee&&(M.dataset.maxlength=((An=ae.querySelector("#fs-maxlength"))==null?void 0:An.value)||""),ue){let Rn=(((Pn=ae.querySelector("#fs-options"))==null?void 0:Pn.value)||"").split(/[\n]/).map(Fs=>Fs.trim()).filter(Boolean);if(re){let Fs=[],zo=[];Rn.forEach(ur=>{let Ki=ur.match(/^\[x\]\s*(.+)$/i);Ki?(Fs.push(Ki[1].trim()),zo.push(Ki[1].trim())):Fs.push(ur)}),M.dataset.options=JSON.stringify(Fs),M.dataset.default=zo.join(",")}else M.dataset.options=JSON.stringify(Rn)}if($e){let Rn=(((Oo=ae.querySelector("#fs-allowed-extensions"))==null?void 0:Oo.value)||"").split(",").map(zo=>zo.trim().toLowerCase()).filter(Boolean);M.dataset.allowedExtensions=Rn.length>0?JSON.stringify(Rn):"";let Fs=((qo=ae.querySelector("#fs-max-size-mb"))==null?void 0:qo.value)||"10";M.dataset.maxSizeMb=String(Math.min(Math.max(parseInt(Fs)||10,1),50))}M.dataset.description=((Fo=ae.querySelector("#fs-description"))==null?void 0:Fo.value)||"",M.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>M.style.boxShadow="",400),Ie(),I("Field settings updated","success")})},de="make_"+e.replace(/-/g,"_"),Q={number:"number",checkbox:"boolean",multiselect:"array"},N={},S=[];(a.fields||[]).forEach(M=>{let ne={type:Q[M.type]||"string"},L=M.label||M.name;M.require_future?ne.description=L+" (must be in the future)":L&&(ne.description=L),M.min!==void 0&&M.min!==""&&(ne.minimum=M.min),M.max!==void 0&&M.max!==""&&(ne.maximum=M.max),M.min_length&&(ne.minLength=M.min_length),M.max_length&&(ne.maxLength=M.max_length),M.options&&M.options.length>0&&(M.type==="multiselect"?ne.items={type:"string",enum:M.options}:ne.enum=M.options),N[M.name]=ne,M.required&&S.push(M.name)});let H={name:de,description:a.description||a.name,inputSchema:{type:"object",properties:N,required:S}},F=JSON.stringify(H,null,2),V=y(F),se=l?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">\u25CF Discoverable by agents</span>':'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">\u25CB Draft \u2014 not visible to agents</span>',te=['<div style="margin-bottom: 16px;">','<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">','<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',`<code style="font-size:13px;font-weight:600;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">`+y(de)+"</code>","</div>",'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">','<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'," /mcp.php","</span>",'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'," /actions/manifest.json","</span>",se,"</div>","</div>",'<div style="position: relative;">',`<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">`+V+"</code></pre>",`<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor='var(--vs-border)';this.style.color='var(--vs-text-secondary)';" onmouseleave="this.style.borderColor='var(--vs-border-subtle)';this.style.color='var(--vs-text-ghost)';">`+E.copy+"</button>","</div>",'<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',`This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site's MCP endpoint.<br>`,'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',"</p>"].join("");s.innerHTML=`
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
              <input type="text" id="action-button-label" class="vs-input" value="${y(a.bar_button_label||"")}" placeholder="${ge(a.name||"e.g. Register")}" />
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
              <input type="hidden" id="action-icon" value="${y(a.icon||"circle")}" />
            </div>
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Submission Rules</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">Control how submissions are handled.</p>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                  <input type="checkbox" id="action-allow-duplicates" ${(m=(c=a.constraints)==null?void 0:c.uniqueness)!=null&&m.enabled?"":"checked"} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                  <span class="vs-toggle-track" style="
                    position: absolute; inset: 0; border-radius: 10px;
                    background: ${(u=(f=a.constraints)==null?void 0:f.uniqueness)!=null&&u.enabled?"var(--vs-border-medium, #ccc)":"var(--vs-accent)"};
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
            <div id="action-duplicate-msg-wrap" style="${(k=(b=a.constraints)==null?void 0:b.uniqueness)!=null&&k.enabled?"":"display: none;"}">
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
          <button id="btn-add-field" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-bottom: 12px;">${E.plus||"+"} Add Field</button>
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
              <input type="text" class="vs-input field-label" value="${y(M.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
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
                ${E.trash}
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
          ${te}
        </div>
      </details>
    `,document.querySelectorAll(".field-required").forEach(M=>{O(M.closest("label"))});let ie=document.getElementById("action-allow-duplicates");if(ie){let M=ie.closest("label"),U=M==null?void 0:M.querySelector(".vs-toggle-track"),ne=M==null?void 0:M.querySelector(".vs-toggle-thumb");ie.addEventListener("change",()=>{U&&(U.style.background=ie.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),ne&&(ne.style.left=ie.checked?"18px":"2px");let L=document.getElementById("action-duplicate-msg-wrap");L&&(L.style.display=ie.checked?"none":"")})}document.querySelectorAll(".vs-icon-pick").forEach(M=>{M.addEventListener("mouseenter",()=>{var U;M.dataset.icon!==((U=document.getElementById("action-icon"))==null?void 0:U.value)&&(M.style.borderColor="var(--vs-accent)",M.style.color="var(--vs-text-secondary)")}),M.addEventListener("mouseleave",()=>{var U;M.dataset.icon!==((U=document.getElementById("action-icon"))==null?void 0:U.value)&&(M.style.borderColor="var(--vs-border)",M.style.color="var(--vs-text-ghost)")}),M.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach(U=>{U.style.borderColor="var(--vs-border)",U.style.background="var(--vs-bg-floating)",U.style.color="var(--vs-text-ghost)"}),M.style.borderColor="var(--vs-accent)",M.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",M.style.color="var(--vs-accent)",document.getElementById("action-icon").value=M.dataset.icon})}),(x=document.getElementById("btn-save-action"))==null||x.addEventListener("click",async()=>{var T,A,D,G,J,z,W,ee,ue;if(Es()||Zs())return;let M={...a};if(M.name=((T=document.getElementById("action-name"))==null?void 0:T.value)||a.name,M.bar_button_label=((A=document.getElementById("action-button-label"))==null?void 0:A.value)||"",M.description=((D=document.getElementById("action-description"))==null?void 0:D.value)||"",M.icon=((G=document.getElementById("action-icon"))==null?void 0:G.value)||"circle",((J=document.getElementById("action-allow-duplicates"))==null?void 0:J.checked)??!0)(z=M.constraints)!=null&&z.uniqueness&&(M.constraints.uniqueness.enabled=!1);else{let re=(a.fields||[]).filter(be=>be.type==="email").map(be=>be.name),$e=re.length>0?re:["email"];M.constraints={...M.constraints||{},uniqueness:{enabled:!0,fields:$e,scope_statuses:["confirmed","pending"]}}}let ne=((W=document.getElementById("action-duplicate-msg"))==null?void 0:W.value)||"";ne?M.responses={...M.responses||{},duplicate:ne}:(ee=M.responses)!=null&&ee.duplicate&&delete M.responses.duplicate;let{ok:L,data:B}=await $.put(`/agentic/actions/${encodeURIComponent(e)}`,M);I(L?"Action saved":((ue=B==null?void 0:B.error)==null?void 0:ue.message)||"Failed to save",L?"success":"error"),L&&ai(e)});async function nt(){var A;let M=document.querySelectorAll("#action-fields-builder .vs-field-row"),U=!1;if(M.forEach(D=>{var J,z;((z=(J=D.querySelector(".field-label"))==null?void 0:J.value)==null?void 0:z.trim())||(U=!0,D.style.borderColor="var(--vs-error, #ef4444)",D.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{D.style.borderColor="var(--vs-border-subtle)",D.style.boxShadow=""},2e3))}),U){I("Every field needs a label","warning");return}let ne=ye();if(ne.length===0){I("At least one field is required","warning");return}let L={...a,fields:ne},{ok:B,data:T}=await $.put(`/agentic/actions/${encodeURIComponent(e)}`,L);I(B?"Fields saved":((A=T==null?void 0:T.error)==null?void 0:A.message)||"Failed to save",B?"success":"error"),B&&ai(e)}(C=document.getElementById("btn-save-fields"))==null||C.addEventListener("click",nt),(_=document.getElementById("btn-add-field"))==null||_.addEventListener("click",()=>{var L,B;let M=document.getElementById("action-fields-builder");if(!M)return;let U=document.createElement("div");U.className="vs-field-row",U.dataset.fieldName="",U.dataset.placeholder="",U.dataset.default="",U.dataset.min="",U.dataset.max="",U.dataset.maxlength="",U.dataset.options="",U.dataset.description="",U.style.cssText=`
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
          ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(T=>`<option value="${T}">${T==="multiselect"?"multi-select":T}</option>`).join("")}
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
          ${E.trash}
        </button>
      `,M.appendChild(U),(L=U.querySelector(".field-label"))==null||L.focus(),O((B=U.querySelector(".field-required"))==null?void 0:B.closest("label")),dt(U),Bt(U.querySelector(".field-delete")),_t(U.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(dt),document.querySelectorAll(".field-delete").forEach(Bt),document.querySelectorAll(".field-settings").forEach(_t),(P=document.getElementById("btn-copy-schema"))==null||P.addEventListener("click",()=>{var U;let M=((U=document.getElementById("agent-schema-json"))==null?void 0:U.textContent)||"";navigator.clipboard.writeText(M).then(()=>{I("Schema copied","success")}).catch(()=>{let ne=document.createElement("textarea");ne.value=M,ne.style.position="fixed",ne.style.opacity="0",document.body.appendChild(ne),ne.select(),document.execCommand("copy"),document.body.removeChild(ne),I("Schema copied","success")})}),(j=document.getElementById("agent-preview-section"))==null||j.addEventListener("toggle",M=>{let U=M.target.querySelector(".agent-preview-chevron");U&&(U.style.transform=M.target.open?"rotate(180deg)":"rotate(0)")}),(Z=document.getElementById("btn-toggle-active"))==null||Z.addEventListener("click",async()=>{if(Es()||Zs())return;let M={...a,active:!l},{ok:U}=await $.put(`/agentic/actions/${encodeURIComponent(e)}`,M);U?(I(M.active?"Action activated":"Action deactivated","success"),ai(e)):I("Failed to update status","error")}),(Y=document.getElementById("btn-duplicate-action"))==null||Y.addEventListener("click",async()=>{var L;if(Es()||Zs()||!await Ce({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:U,data:ne}=await $.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});U&&(ne!=null&&ne.action)?(I(`"${ne.action.name}" created`,"success"),window.location.hash=`#/actions/${ne.action.id}`):I(((L=ne==null?void 0:ne.error)==null?void 0:L.message)||"Failed to duplicate","error")}),(q=document.getElementById("btn-delete-action"))==null||q.addEventListener("click",async()=>{if(Es()||Zs())return;if(await Ce({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:U}=await $.delete(`/agentic/actions/${encodeURIComponent(e)}`);U?(I("Action deleted","success"),window.location.hash="#/actions"):I("Failed to delete action","error")}})}await bn(e,1)}async function bn(e,t=1){var f,u,h,g,b,k,w,x;let s=document.getElementById("action-records");if(!s)return;let n=((f=document.getElementById("action-filter-status"))==null?void 0:f.value)||"all",o=((u=document.getElementById("action-filter-search"))==null?void 0:u.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:r}=await $.get(i);if(!a||!r){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let l=r.records||[],d=r.total||0,v=r.per_page||20,p=Math.ceil(d/v);s.innerHTML=`
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
          <input type="text" id="action-filter-search" class="vs-input vs-input-compact" placeholder="Search submissions..." value="${y(o)}" style="min-width: 180px;" />
        </div>
        <div class="flex items-center gap-2">
          ${window.IS_DEMO?"":`<button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old submissions" ${d===0?'disabled style="opacity:0.4;pointer-events:none;"':""}>
            ${E.trash} Purge Old
          </button>`}

          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${d===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${d===0?"No submissions to export":"Download submissions as CSV"}">
            ${E.download} Export CSV
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
              ${l.map(C=>{let _=typeof C.data=="string"?JSON.parse(C.data):C.data,P=Object.fromEntries(Object.entries(_||{}).filter(([N])=>!N.startsWith("_"))),j=Object.values(P).filter(N=>typeof N=="string"&&N.length>0).slice(0,2).join(" \xB7 "),Z=Object.values(P).filter(N=>N&&typeof N=="object"&&N.original_name).length,Y=Z>0?`<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${j?"6px":"0"};" title="${Z} file${Z>1?"s":""} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${Z>1?'<span style="font-size: 10px;">'+Z+"</span>":""}</span>`:"",q=j||(Z>0?"":"\u2014"),de=Ca[C.status]||Ca.pending,Q=C.source==="web"?"Website":C.source==="mcp"?"MCP":C.source==="api"?"API":C.source||"Website";return`
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${C.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${C.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${y(C.confirmation_code||"\u2014")}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${y(q)}</span>${Y}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${C.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                        ${Object.entries(Ca).map(([N,S])=>`<option value="${N}" ${C.status===N?"selected":""}>${S.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${Q}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${On(C.created_at)}</td>
                    ${window.IS_DEMO?'<td style="width: 32px;"></td>':`<td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${C.id}" title="Delete submission" style="
                        border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                        display: inline-flex; align-items: center; border-radius: var(--radius-md);
                        transition: color 0.12s, background 0.12s;
                      " onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';" onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>`}
                  </tr>
                  <tr class="vs-record-detail" data-detail-for="${C.id}" style="display: none;">
                    <td colspan="7" style="padding: 0 12px 12px 44px; background: var(--vs-bg-recessed, var(--vs-bg-ghost));">
                      <div style="
                        display: grid; grid-template-columns: auto 1fr; gap: 4px 16px;
                        font-size: 12px; padding: 12px 0;
                      ">
                        ${Object.entries(P).map(([N,S])=>{if(S&&typeof S=="object"&&S.path&&S.original_name){let H=S.size<1024?S.size+" B":S.size<1048576?Math.round(S.size/1024)+" KB":(S.size/1048576).toFixed(1)+" MB";return`
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(N.replace(/_/g," "))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="/_studio/api/router.php?_path=/agentic/actions/${encodeURIComponent(e)}/records/${C.id}/files/${encodeURIComponent(N)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${y(S.original_name)} (${H})
                                </a>
                              </div>
                            `}return`
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(N.replace(/_/g," "))}</div>
                            <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${y(String(S||"\u2014"))}</div>
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
  `;let c=null,m=()=>bn(e,1);(h=document.getElementById("action-filter-status"))==null||h.addEventListener("change",m),(g=document.getElementById("action-filter-search"))==null||g.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(m,300)}),(b=document.getElementById("action-records-prev"))==null||b.addEventListener("click",C=>{let _=parseInt(C.currentTarget.dataset.page);_>=1&&bn(e,_)}),(k=document.getElementById("action-records-next"))==null||k.addEventListener("click",C=>{let _=parseInt(C.currentTarget.dataset.page);_<=p&&bn(e,_)}),s.querySelectorAll(".vs-record-toggle").forEach(C=>{C.addEventListener("click",()=>{let _=C.dataset.rid,P=s.querySelector(`.vs-record-detail[data-detail-for="${_}"]`);if(!P)return;let j=P.style.display!=="none";P.style.display=j?"none":"table-row",C.style.transform=j?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(C=>{C.addEventListener("change",async _=>{var Y;if(Es()){C.value=((Y=C.querySelector("[selected]"))==null?void 0:Y.value)||"pending";return}if(Zs())return;let P=_.target.dataset.recordId,j=_.target.value,{ok:Z}=await $.put(`/agentic/actions/${encodeURIComponent(e)}/records/${P}`,{status:j});I(Z?"Status updated":"Failed to update",Z?"success":"error")})}),(w=document.getElementById("btn-purge-records"))==null||w.addEventListener("click",async()=>{var Z,Y;if(Es()||Zs())return;let C=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],_=document.getElementById("vs-purge-overlay");_&&_.remove();let P=document.createElement("div");P.id="vs-purge-overlay",P.className="vs-modal-overlay",P.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Submissions</h2>
          <p class="vs-modal-desc">Remove submissions older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${C.map(q=>`<option value="${q.days}">${q.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(P),requestAnimationFrame(()=>P.classList.add("is-visible"));let j=()=>we(P);ke(P,j),(Z=document.getElementById("vs-purge-cancel"))==null||Z.addEventListener("click",j),(Y=document.getElementById("vs-purge-ok"))==null||Y.addEventListener("click",async()=>{var F;let q=document.getElementById("vs-purge-select"),de=parseInt(q==null?void 0:q.value),Q=((F=q==null?void 0:q.selectedOptions[0])==null?void 0:F.textContent)||"";if(j(),await new Promise(V=>setTimeout(V,200)),!await Ce({title:"Confirm Purge",description:`This will permanently delete all records "${Q.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:S,data:H}=await $.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:de});S?(I(`${(H==null?void 0:H.purged)||0} record(s) purged`,"success"),bn(e,1)):I("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(C=>{C.addEventListener("click",async()=>{if(Es()||Zs())return;let _=C.dataset.rid;if(!await Ce({title:"Delete Submission",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:j}=await $.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${_}`);j?(I("Submission deleted","success"),bn(e,t)):I("Failed to delete submission","error")})}),(x=document.getElementById("btn-export-action-csv"))==null||x.addEventListener("click",async()=>{if(Es())return;let C=document.getElementById("btn-export-action-csv"),_=C.innerHTML;C.innerHTML=`${E.loader} Exporting...`,C.disabled=!0;try{let P=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!P.ok)throw new Error("Export failed");let j=await P.blob(),Z=URL.createObjectURL(j),Y=document.createElement("a");Y.href=Z,Y.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(Y),Y.click(),Y.remove(),URL.revokeObjectURL(Z),I("CSV downloaded","success")}catch{I("Failed to export CSV","error")}C.innerHTML=_,C.disabled=!1})}var eo=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},to=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Rt={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function Ll(){return setTimeout(()=>tv(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function tv(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await $.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
  `}function Sl(e){return setTimeout(()=>sv(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function sv(e){var c,m;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await $.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
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
          ${E.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${a.total===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${a.total===0?"No submissions to export":"Download submissions as CSV"}">
          ${E.download} Export CSV
        </button>
      </div>
    </div>
  `;let r=document.getElementById("form-filter-status"),l=document.getElementById("form-filter-source"),d=document.getElementById("form-filter-search"),v=null,p=()=>ri(e,1);r==null||r.addEventListener("change",p),l==null||l.addEventListener("change",p),d==null||d.addEventListener("input",()=>{clearTimeout(v),v=setTimeout(p,300)}),(c=document.getElementById("btn-export-csv"))==null||c.addEventListener("click",async()=>{let f=document.getElementById("btn-export-csv"),u=f.innerHTML;f.innerHTML=`${E.loader} Exporting...`,f.disabled=!0;try{let h=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!h.ok)throw new Error("Export failed");let g=await h.blob(),b=URL.createObjectURL(g),k=document.createElement("a");k.href=b,k.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(k),k.click(),k.remove(),URL.revokeObjectURL(b),I("CSV downloaded","success")}catch{I("Failed to export CSV","error")}f.innerHTML=u,f.disabled=!1}),(m=document.getElementById("btn-upgrade-to-action"))==null||m.addEventListener("click",async()=>{var b,k;if(eo()||to())return;let f=(i.fields||[]).length;if(!await Ce({title:"Upgrade to Agent Action",description:`This will create a new agent action with${f>0?` the ${f} field${f!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let h=document.getElementById("btn-upgrade-to-action"),g=h.innerHTML;h.innerHTML=`${E.loader} Converting...`,h.disabled=!0,h.style.opacity="0.6";try{let w={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},x=[],C=0;(i.fields||[]).forEach(q=>{let de=w[q.type];if(!de){C++;return}let Q={name:q.name,label:q.label||q.name,type:de,required:q.required||!1};(de==="select"||de==="radio")&&q.options&&(Q.options=q.options),q.placeholder&&(Q.placeholder=q.placeholder),x.push(Q)}),C>0&&I(`${C} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let _=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),P=Date.now().toString(36).slice(-4),j={id:_+"-"+P,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:x,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:Z,data:Y}=await $.post("/agentic/actions",j);if(Z&&(Y!=null&&Y.action))I(`"${Y.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${Y.action.id}`;else{let de=(((b=Y==null?void 0:Y.error)==null?void 0:b.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":((k=Y==null?void 0:Y.error)==null?void 0:k.message)||"Failed to create action";I(de,"error"),h.innerHTML=g,h.disabled=!1,h.style.opacity=""}}catch{I("Failed to convert form to action","error"),h.innerHTML=g,h.disabled=!1,h.style.opacity=""}}),await ri(e,1)}async function ri(e,t=1){var h,g,b;let s=document.getElementById("form-submissions");if(!s)return;let n=((h=document.getElementById("form-filter-status"))==null?void 0:h.value)||"all",o=((g=document.getElementById("form-filter-source"))==null?void 0:g.value)||"all",i=((b=document.getElementById("form-filter-search"))==null?void 0:b.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:r,data:l}=await $.get(a);if(!r||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let d=l.submissions||[],v=l.total||0,p=l.per_page||20,c=Math.ceil(v/p);if(!d.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:m}=await $.get(`/forms/${encodeURIComponent(e)}`),f=m==null?void 0:m.form,u={};f!=null&&f.fields&&f.fields.forEach(k=>{u[k.name]=k.label||k.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${d.map(k=>{let w=Rt[k.status]||Rt.new,x=Object.entries(k.data||{}).filter(([P])=>!P.startsWith("_")).slice(0,3).map(([P,j])=>{let Z=u[P]||P,Y=Array.isArray(j)?j.join(", "):String(j);return`<span class="vs-sub-field"><strong>${y(Z)}:</strong> ${y(Y.substring(0,80))}${Y.length>80?"\u2026":""}</span>`}).join(""),C=On(k.created_at),_=k.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${k.id}" data-form-id="${y(e)}" style="border-left-color: ${w.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${w.bg}; color: ${w.text};">${w.label}</span>
                ${_?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${y(C)}</span>
            </div>
            <div class="vs-submission-preview">
              ${x||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${k.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${k.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                ${Object.entries(Rt).map(([P,j])=>`<option value="${P}" ${k.status===P?"selected":""}>${j.label}</option>`).join("")}
              </select>
              ${window.IS_DEMO?"":`<button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${k.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>`}
            </div>
          </div>
        `}).join("")}
    </div>

    ${c>1?`
      <div class="vs-pagination">
        ${t>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t-1}" data-form-id="${y(e)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${t} of ${c} \xB7 ${v} submission${v!==1?"s":""}</span>
        ${t<c?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t+1}" data-form-id="${y(e)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${v} submission${v!==1?"s":""}</span>
      </div>
    `}
  `,nv(e,t)}function nv(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;Cl(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{var i;if(eo()){s.value=s.dataset.originalValue||((i=s.querySelector("[selected]"))==null?void 0:i.value)||"new";return}if(to())return;let n=s.dataset.subId,{ok:o}=await $.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){I("Status updated","success");let a=s.closest(".vs-submission-card"),r=Rt[s.value];if(a&&r){a.style.borderLeftColor=r.text;let l=a.querySelector(".vs-status-pill");l&&(l.style.background=r.bg,l.style.color=r.text,l.textContent=r.label)}}else I("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{if(eo()||to())return;let n=s.dataset.subId;if(!await Ce({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await $.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(I("Submission deleted","success"),ri(e,t)):I("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);ri(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;Cl(e,o)})})}async function Cl(e,t){var p,c,m,f;(p=document.getElementById("submission-detail-overlay"))==null||p.remove();let{ok:s,data:n}=await $.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(u=>String(u.id)===String(t));if(!o){I("Submission not found","error");return}let{data:i}=await $.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,r={};if(a!=null&&a.fields&&a.fields.forEach(u=>{r[u.name]=u.label||u.name}),o.status==="new"&&!window.IS_DEMO){let{ok:u}=await $.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"});if(u){o.status="read";let h=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);h&&(h.value="read");let g=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(g){g.style.borderLeftColor=Rt.read.text;let b=g.querySelector(".vs-status-pill");b&&(b.style.background=Rt.read.bg,b.style.color=Rt.read.text,b.textContent="Read")}}}let l=Rt[o.status]||Rt.new,d=document.createElement("div");d.id="submission-detail-overlay",d.className="vs-slide-overlay",d.innerHTML=`
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
          ${Object.entries(o.data||{}).filter(([u])=>!u.startsWith("_")).map(([u,h])=>{let g=r[u]||u,b=Array.isArray(h)?h.join(", "):String(h);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${y(g)}</div>
                <div class="vs-sub-detail-field-value">${y(b)}</div>
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
          ${Object.entries(Rt).map(([u,h])=>`<option value="${u}" ${o.status===u?"selected":""}>${h.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(d),requestAnimationFrame(()=>{requestAnimationFrame(()=>d.classList.add("is-visible"))});let v=()=>{d.classList.remove("is-visible"),setTimeout(()=>d.remove(),200)};ke(d,v),(c=document.getElementById("close-sub-detail"))==null||c.addEventListener("click",v),(m=document.getElementById("btn-save-sub-notes"))==null||m.addEventListener("click",async()=>{var g;if(eo()||to())return;let u=((g=document.getElementById("sub-detail-notes"))==null?void 0:g.value)||"",{ok:h}=await $.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:u});I(h?"Notes saved":"Failed to save notes",h?"success":"error")}),(f=document.getElementById("sub-detail-status"))==null||f.addEventListener("change",async u=>{if(eo()){u.target.value=o.status;return}if(to())return;let h=u.target.value,{ok:g}=await $.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:h});if(g){I("Status updated","success");let b=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);b&&(b.value=h);let k=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),w=Rt[h];if(k&&w){k.style.borderLeftColor=w.text;let x=k.querySelector(".vs-status-pill");x&&(x.style.background=w.bg,x.style.color=w.text,x.textContent=w.label)}}else I("Failed to update status","error")})}var La=!1;function Il(){return La=!1,setTimeout(()=>{iv(),Ta()},0),`
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 style="font-size: 20px; font-weight: 650; color: var(--vs-text-primary); letter-spacing: -0.025em; margin: 0;">Team</h1>
          <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 4px 0 0;">Manage who has access to this Studio.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-show-roles" class="vs-btn vs-btn-ghost vs-btn-sm" title="View role permissions">
            ${E.shield} Roles
          </button>
          <button id="btn-add-member" class="vs-btn vs-btn-primary vs-btn-sm">
            ${E.userPlus||E.plus} Add Member
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
  `}function Bl(){return`
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
                ${E.rotateCcw}
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
                ${E.rotateCcw}
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
  `}function ov(e){let t=R.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",r=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${E.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${y(e.name)}" title="Reset password">
        ${E.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${y(e.name)}" title="Remove">
        ${E.trash}
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
  `}async function Ta(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await $.get("/team");if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${(n==null?void 0:n.message)||"Failed to load team members."}</div>`;return}let o=(s==null?void 0:s.members)||[];o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>ov(i)).join("")}function iv(){var t,s,n,o,i,a,r,l,d;if(La)return;La=!0,(t=document.getElementById("btn-add-member"))==null||t.addEventListener("click",()=>{Ml()}),(s=document.getElementById("btn-show-roles"))==null||s.addEventListener("click",Tl);let e=document.getElementById("team-list");e&&e.addEventListener("click",async v=>{let p=v.target;if(p.closest("[data-role-info]")){Tl();return}let m=p.closest(".team-edit-btn");if(m){let h=m.dataset.id,{ok:g,data:b}=await $.get("/team");if(g){let k=b.members.find(w=>w.id==h);k&&Ml(k)}return}let f=p.closest(".team-delete-btn");if(f){let h=f.dataset.id,g=f.dataset.name;if(!await Ce({title:"Remove Team Member",description:`Remove ${g} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let{ok:k,error:w}=await $.delete(`/team/${h}`);k?(I(`${g} has been removed.`,"success"),await Ta()):I((w==null?void 0:w.message)||"Failed to remove member.","error");return}let u=p.closest(".team-pw-btn");if(u){let h=u.dataset.id,g=u.dataset.name;rv(h,g);return}}),[["[data-team-modal-overlay]",li],["[data-team-pw-overlay]",di],["[data-team-roles-overlay]",Sa]].forEach(([v,p])=>{let c=document.querySelector(v);if(!c)return;let m=null;c.addEventListener("mousedown",f=>{m=f.target}),c.addEventListener("click",f=>{f.target===c&&m===c&&p()})}),(n=document.getElementById("btn-team-cancel"))==null||n.addEventListener("click",li),(o=document.getElementById("btn-pw-cancel"))==null||o.addEventListener("click",di),(i=document.getElementById("btn-roles-close"))==null||i.addEventListener("click",Sa),(a=document.getElementById("btn-generate-password"))==null||a.addEventListener("click",()=>{let v=document.getElementById("team-member-password");v&&(v.value=qn())}),(r=document.getElementById("btn-pw-generate"))==null||r.addEventListener("click",()=>{let v=document.getElementById("team-new-password");v&&(v.value=qn())}),(l=document.getElementById("btn-team-save"))==null||l.addEventListener("click",lv),(d=document.getElementById("btn-pw-save"))==null||d.addEventListener("click",dv),document.addEventListener("keydown",av)}function av(e){if(e.key!=="Escape")return;let t=document.getElementById("team-modal"),s=document.getElementById("team-pw-modal"),n=document.getElementById("team-roles-modal");n&&!n.classList.contains("hidden")?(Sa(),e.stopPropagation()):s&&!s.classList.contains("hidden")?(di(),e.stopPropagation()):t&&!t.classList.contains("hidden")&&(li(),e.stopPropagation())}function Tl(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden")}function Sa(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden")}function Ml(e=null){let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");t&&(document.getElementById("team-member-name").value=(e==null?void 0:e.name)||"",document.getElementById("team-member-email").value=(e==null?void 0:e.email)||"",document.getElementById("team-member-role").value=(e==null?void 0:e.role)||"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=qn()),t.classList.remove("hidden"))}function li(){var e;(e=document.getElementById("team-modal"))==null||e.classList.add("hidden")}function rv(e,t){let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");s&&(document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=qn(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",s.classList.remove("hidden"))}function di(){var e;(e=document.getElementById("team-pw-modal"))==null||e.classList.add("hidden")}async function lv(){var l,d,v,p,c,m,f,u;let e=(l=document.getElementById("team-edit-id"))==null?void 0:l.value,t=(v=(d=document.getElementById("team-member-name"))==null?void 0:d.value)==null?void 0:v.trim(),s=(c=(p=document.getElementById("team-member-email"))==null?void 0:p.value)==null?void 0:c.trim(),n=(m=document.getElementById("team-member-role"))==null?void 0:m.value,o=(f=document.getElementById("team-member-password"))==null?void 0:f.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026";let r;e?r=await $.put(`/team/${e}`,{name:t,email:s,role:n}):r=await $.post("/team",{name:t,email:s,role:n,password:o}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",r.ok?(li(),I(e?"Member updated.":`${t} has been added to the team.`,"success"),await Ta()):(i.textContent=((u=r.error)==null?void 0:u.message)||"Something went wrong.",i.classList.remove("hidden"))}async function dv(){var a,r;let e=(a=document.getElementById("team-pw-user-id"))==null?void 0:a.value,t=(r=document.getElementById("team-new-password"))==null?void 0:r.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026";let{ok:o,error:i}=await $.post(`/team/${e}/password`,{password:t});n.disabled=!1,n.textContent="Reset Password",o?(di(),I("Password has been reset.","success")):(s.textContent=(i==null?void 0:i.message)||"Failed to reset password.",s.classList.remove("hidden"))}var cv=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},pv=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1};function Al(){return setTimeout(()=>so(),0),`
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
        <div class="vs-dropzone-icon">${E.upload}</div>
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
  `}async function so(e="all"){var g;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await _l(n.files),n.value="",so(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=b=>{b.target.closest("button")||n==null||n.click()},o.ondragover=b=>{b.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async b=>{b.preventDefault(),o.classList.remove("is-dragover"),b.dataTransfer.files.length>0&&(await _l(b.dataTransfer.files),so(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(b=>{b.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(k=>{k.className="vs-device-btn"}),b.className="vs-device-btn vs-device-btn-active",so(b.dataset.filter)}});let a=e==="code",r=!a&&e!=="all"?`?category=${e}`:"",{ok:l,data:d}=await $.get(`/assets${r}`);if(!l||!((g=d==null?void 0:d.assets)!=null&&g.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let b=document.getElementById("btn-empty-upload"),k=document.getElementById("btn-upload-asset");b&&k&&b.addEventListener("click",()=>k.click());return}let v=d.assets;if(a&&(v=v.filter(b=>b.category==="css"||b.category==="js"),v.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${E.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let p=["jpg","jpeg","png","gif","webp","svg","ico"],c=v.filter(b=>b.category==="images"&&p.includes(b.extension)),m=v.filter(b=>!p.includes(b.extension)||b.category!=="images");function f(b,k){return b==="css"?E.fileCode:b==="js"?E.fileCode:b==="json"?E.fileJson:b==="pdf"?E.filePdf:["woff2","woff","ttf","otf"].includes(b)?E.type:["mp4","webm"].includes(b)?E.film:["mp3","wav","ogg"].includes(b)?E.music:["txt","md","csv"].includes(b)?E.fileText:["doc","docx","xls","xlsx"].includes(b)?E.fileText:k==="images"?E.image:E.fileText}let u=["css","js","json","svg"],h="";c.length>0&&(h+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',c.forEach((b,k)=>{var _;let w=ta(b.size),x=b.width?`${b.width}\xD7${b.height}`:"",C=b.extension==="svg";h+=`
        <div class="vs-asset-card" data-lightbox-idx="${k}">
          <div class="vs-asset-card-thumb${C?" is-svg":""}" style="cursor:pointer">
            <img src="${b.thumbnail||b.path}" alt="${y(((_=b.meta)==null?void 0:_.alt)||b.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${y(b.filename)}">${y(b.filename)}</p>
            <p class="vs-asset-card-meta">${x?x+" \xB7 ":""}${w}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${b.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${E.copy}</button>
            <button data-delete-asset="${b.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${E.x}</button>
          </div>
        </div>
      `}),h+="</div>"),m.length>0&&m.forEach(b=>{let k=ta(b.size),w=u.includes(b.extension);h+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${f(b.extension,b.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${y(b.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${b.category} \xB7 ${k}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${w?`
              <button data-edit-asset="${b.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${E.pencil}</button>
            `:""}
            <button data-copy-path="${b.path}" title="Copy web path"
              class="vs-asset-action-btn">${E.copy}</button>
            ${b.category!=="css"&&b.category!=="js"?`
              <button data-delete-asset="${b.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${E.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=h,t.querySelectorAll("[data-lightbox-idx]").forEach(b=>{let k=b.querySelector(".vs-asset-card-thumb");k&&k.addEventListener("click",()=>{let w=parseInt(b.dataset.lightboxIdx,10);vv(c,w,e)})}),t.querySelectorAll("[data-copy-path]").forEach(b=>{b.addEventListener("click",()=>{navigator.clipboard.writeText(b.dataset.copyPath).then(()=>{let k=b.innerHTML;b.innerHTML="\u2713",b.classList.add("vs-asset-action-copied"),setTimeout(()=>{b.innerHTML=k,b.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(b=>{b.addEventListener("click",()=>{let w=b.dataset.editAsset.replace(/^\//,"");Wn(w)})}),t.querySelectorAll("[data-delete-asset]").forEach(b=>{b.addEventListener("click",async()=>{if(!await Ce({title:"Delete Asset",description:`Delete ${b.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:w}=await $.delete("/assets",{path:b.dataset.deleteAsset});w?(I("Asset deleted.","success"),so(e)):I("Could not delete asset.","error")})})}function vv(e,t,s){let n=t;function o(c){if(c===0)return"0 B";let m=1024,f=["B","KB","MB","GB"],u=Math.floor(Math.log(c)/Math.log(m));return parseFloat((c/Math.pow(m,u)).toFixed(1))+" "+f[u]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var g,b;let c=e[n],m=c.width?`${c.width}\xD7${c.height}`:"",f=o(c.size),u=[m,f,(g=c.extension)==null?void 0:g.toUpperCase()].filter(Boolean),h=e.length>1;return`
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
          <div class="vs-lightbox-image-wrap${["svg","png"].includes(c.extension)?" is-transparent":""}">
            <img src="${c.path}" alt="${y(((b=c.meta)==null?void 0:b.alt)||c.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${y(c.filename)}</span>
            <span class="vs-lightbox-details">${u.join(" \xB7 ")}${h?` \xB7 ${n+1} / ${e.length}`:""}</span>
          </div>

          <div class="vs-lightbox-actions">
            <button class="vs-lightbox-btn" id="lightbox-copy" title="Copy web path">
              ${E.copy}<span>Copy path</span>
            </button>
          </div>
        </div>
      </div>

      <button class="vs-lightbox-close" id="lightbox-close" title="Close (Esc)">
        ${E.x}
      </button>
    `}let r=document.createElement("div");r.id="vs-lightbox",r.className="vs-lightbox",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Image preview"),r.innerHTML=a(),document.body.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add("is-visible"))});function l(){r.classList.remove("is-visible"),setTimeout(()=>r.remove(),400),document.removeEventListener("keydown",v)}function d(c){n=c,r.innerHTML=a(),p()}function v(c){if(c.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;l(),c.preventDefault()}c.key==="ArrowRight"&&e.length>1&&(d((n+1)%e.length),c.preventDefault()),c.key==="ArrowLeft"&&e.length>1&&(d((n-1+e.length)%e.length),c.preventDefault())}function p(){var f,u,h;(f=r.querySelector("#lightbox-close"))==null||f.addEventListener("click",g=>{g.stopPropagation(),l()});let c=null;r.addEventListener("mousedown",g=>{c=g.target}),r.addEventListener("click",g=>{var w;let b=g.target===r||g.target.classList.contains("vs-lightbox-stage"),k=c===r||((w=c==null?void 0:c.classList)==null?void 0:w.contains("vs-lightbox-stage"));b&&k&&l()}),(u=r.querySelector("#lightbox-prev"))==null||u.addEventListener("click",g=>{g.stopPropagation(),d((n-1+e.length)%e.length)}),(h=r.querySelector("#lightbox-next"))==null||h.addEventListener("click",g=>{g.stopPropagation(),d((n+1)%e.length)});let m=r.querySelector("#lightbox-copy");m==null||m.addEventListener("click",g=>{g.stopPropagation();let b=e[n];navigator.clipboard.writeText(b.path).then(()=>{let k=m.innerHTML;m.innerHTML=`${E.check}<span>Copied!</span>`,m.style.borderColor="var(--vs-success)",m.style.color="var(--vs-success)",setTimeout(()=>{m.innerHTML=k,m.style.borderColor="",m.style.color=""},2e3),I("Path copied!","success")})})}document.addEventListener("keydown",v),p()}async function _l(e){var i,a,r;if(cv()||pv())return;let t=window.__vsSetGlobalStatus;t&&t("saving",`Uploading ${e.length} file(s)\u2026`);let s=new FormData;for(let l of e)s.append("file[]",l);let n=R.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let d=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();if(d.ok){let v=((a=(i=d.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0;I(`${v} file(s) uploaded.`,"success"),t&&t("saved",`\u2713 ${v} file(s) uploaded`)}else{let v=((r=d.error)==null?void 0:r.message)||"Upload failed";I(v,"error"),t&&t("error","\u2717 "+v)}}catch{I("Upload failed.","error"),t&&t("error","\u2717 Upload failed")}}var no="vs-newdesign-save-pref",oo="gallery";function Dl(){return setTimeout(()=>uv(),0),`
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
        <button class="vs-tab ${oo==="gallery"?"vs-tab-active":""}" data-tab="gallery">
          ${E.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${oo==="history"?"vs-tab-active":""}" data-tab="history">
          ${E.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading\u2026</div>
      </div>
    </div>
  `}function uv(){var e,t;document.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",()=>{oo=s.dataset.tab,document.querySelectorAll(".vs-tab").forEach(n=>n.classList.remove("vs-tab-active")),s.classList.add("vs-tab-active"),Pl()})}),(e=document.getElementById("btn-save-design"))==null||e.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||io()}),(t=document.getElementById("btn-new-design"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||Ma()}),Pl()}function Pl(){oo==="gallery"?pi():ci()}async function pi(){var i,a;let e=document.getElementById("designs-content");if(!e)return;let{ok:t,data:s}=await $.get("/designs");if(!t||!((i=s==null?void 0:s.designs)!=null&&i.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <p class="vs-empty-state-title">No saved designs</p>
          <p class="vs-empty-state-desc">Save your current design and try different looks. Switch back anytime.</p>
          <button id="btn-empty-save" class="vs-btn vs-btn-primary vs-btn-sm">${E.save} Save Current Design</button>
        </div>
      </div>
    `,(a=document.getElementById("btn-empty-save"))==null||a.addEventListener("click",()=>{var r;(r=window.demoGuard)!=null&&r.call(window)||io()});return}let n=s.active_id,o=s.designs;e.innerHTML=`
    <div class="vs-design-grid">
      ${o.map(r=>gv(r,r.id===n)).join("")}
    </div>
  `,fv(e),mv(e)}function mv(e){e.querySelectorAll(".vs-design-card-preview").forEach(t=>{let s=t.querySelector("iframe");s&&requestAnimationFrame(()=>{let n=t.offsetWidth;if(n>0){let o=n/1440;s.style.transform=`scale(${o})`}})})}function gv(e,t){let s=y(e.name||"Untitled"),n=e.description?y(e.description):"",o=e.initial_prompt?y(e.initial_prompt):"",i=n||(o.length>100?o.substring(0,100)+"\u2026":o),a=y(e.site_name||""),r=e.page_count||0,l=e.created_at?jn(e.created_at):"",d=e._corrupted,v=a&&a!==s?`${a} \xB7 ${r} ${r===1?"page":"pages"}`:`${r} ${r===1?"page":"pages"}`,p=`/_studio/api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(e.id)}%2Fpreview&path=index.php`,c=`${p}&embed=1`;return`
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
          <span>${v}</span>
          <span>${l}</span>
        </div>
      </div>
      <div class="vs-design-card-actions">
        ${t?'<span class="vs-design-badge-active">Active</span>':`
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-load-id="${ge(e.id)}" ${d?"disabled":""}>
            ${E.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${p}" target="_blank" rel="noopener" title="Browse this design">
          ${E.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${ge(e.id)}"
                data-edit-name="${ge(e.name||"")}"
                data-edit-desc="${ge(e.description||"")}">
          ${E.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${ge(e.id)}" style="color: var(--vs-text-ghost);">
          ${E.trash2}
        </button>
      </div>
    </div>
  `}function fv(e){e.querySelectorAll("[data-load-id]").forEach(t=>{t.addEventListener("click",async()=>{var d,v,p,c;if((d=window.demoGuard)!=null&&d.call(window)||(v=window.viewerGuard)!=null&&v.call(window))return;let s=t.dataset.loadId,n=t.closest(".vs-design-card"),o=((p=n==null?void 0:n.querySelector("h3"))==null?void 0:p.textContent)||"this design",i=await yv(o);if(!i)return;if(t.innerHTML=`${E.rotateCcw} Loading\u2026`,t.disabled=!0,i.saveDesign){let m=R.get("siteName")||"Untitled",f=await $.post("/designs",{name:`${m}`,description:"Saved before switching designs"});if(!f.ok){I(((c=f.error)==null?void 0:c.message)||"Failed to save design.","error"),t.innerHTML=`${E.rotateCcw} Load`,t.disabled=!1;return}}let{ok:a,data:r,error:l}=await $.post(`/designs/${s}/load`,{skip_auto_save:!0});a?(I("Design loaded.","success"),await Hl(),window.location.hash="#/chat"):(I((l==null?void 0:l.message)||"Failed to load design.","error"),t.innerHTML=`${E.rotateCcw} Load`,t.disabled=!1)})}),e.querySelectorAll("[data-edit-id]").forEach(t=>{t.addEventListener("click",()=>{var i,a;if((i=window.demoGuard)!=null&&i.call(window)||(a=window.viewerGuard)!=null&&a.call(window))return;let s=t.dataset.editId,n=t.dataset.editName,o=t.dataset.editDesc;bv(s,n,o)})}),e.querySelectorAll("[data-delete-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteId;if(!await Ce({title:"Delete Design",description:"This design will be removed permanently. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await $.delete(`/designs/${s}`);o?(I("Design deleted.","success"),pi()):(I((i==null?void 0:i.message)||"Failed to delete design.","error"),t.innerHTML=`${E.trash2}`,t.disabled=!1)})})}async function ci(){var i,a,r;let e=document.getElementById("designs-content");if(!e)return;e.innerHTML=`
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">
        ${E.camera} Create Snapshot
      </button>
    </div>
    <div id="snapshots-list">
      <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots\u2026</div>
    </div>
  `,(i=document.getElementById("btn-create-snapshot"))==null||i.addEventListener("click",()=>{var l,d;(l=window.demoGuard)!=null&&l.call(window)||(d=window.viewerGuard)!=null&&d.call(window)||Rl()});let t=document.getElementById("snapshots-list");if(!t)return;let{ok:s,data:n}=await $.get("/snapshots");if(!s||!((a=n==null?void 0:n.snapshots)!=null&&a.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">${E.camera} Create Snapshot</button>
        </div>
      </div>
    `,(r=document.getElementById("btn-empty-create-snapshot"))==null||r.addEventListener("click",()=>{var l;(l=window.demoGuard)!=null&&l.call(window)||Rl()});return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((l,d)=>{let v=jn(l.created_at),p=new Date(l.created_at).toLocaleString(),c=l.size_bytes?(l.size_bytes/1024).toFixed(0)+" KB":"\u2014",m=d===o.length-1,f,u,h;l.snapshot_type==="pre_publish"?(f="var(--vs-success)",u="vs-snap-badge-green",h="Pre-publish"):l.snapshot_type==="manual"?(f="var(--vs-accent)",u="vs-snap-badge-amber",h="Manual"):(f="var(--vs-text-ghost)",u="vs-snap-badge-gray",h="Auto");let g=l.description?`<p class="vs-timeline-desc">${y(l.description)}</p>`:"";return`
          <div class="vs-timeline-item${m?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${f}; box-shadow: 0 0 0 3px color-mix(in srgb, ${f} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${u}">${h}</span>
                  <span class="vs-timeline-label">${y(l.label||"Snapshot #"+l.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${p}">${v}</span>
              </div>
              ${g}
              <div class="vs-timeline-meta">${l.file_count} files \xB7 ${c}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${l.id}" data-snap='${JSON.stringify({label:l.label,description:l.description,type:l.snapshot_type,files:l.file_count,size:c,date:p}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${E.eye} Preview
                </button>
                <button data-restore-id="${l.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${E.rotateCcw} Restore
                </button>
                <button data-delete-snap-id="${l.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${E.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,hv(t)}function hv(e){e.querySelectorAll("[data-preview-id]").forEach(t=>{t.addEventListener("click",()=>{let s=JSON.parse(t.dataset.snap);wv(s)})}),e.querySelectorAll("[data-restore-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.restoreId;if(!await Ce({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;t.innerHTML=`${E.rotateCcw} Restoring\u2026`,t.disabled=!0;let{ok:o,error:i}=await $.post(`/snapshots/${s}/restore`);o?(I("Snapshot restored.","success"),ci()):(I((i==null?void 0:i.message)||"Failed to restore snapshot.","error"),t.innerHTML=`${E.rotateCcw} Restore`,t.disabled=!1)})}),e.querySelectorAll("[data-delete-snap-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteSnapId;if(!await Ce({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await $.delete(`/snapshots/${s}`);o?(I("Snapshot deleted.","success"),ci()):(I((i==null?void 0:i.message)||"Failed to delete snapshot.","error"),t.innerHTML=`${E.trash2}`,t.disabled=!1)})})}function io(){var v;let e=document.getElementById("vs-design-save-overlay");e&&e.remove();let t=R.get("siteName")||"",s=document.createElement("div");s.id="vs-design-save-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${E.save} Save Design</h2>
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
        <button id="design-save-confirm" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${E.save} Save Design</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>we(s),o=p=>{p.key==="Escape"&&(p.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),ke(s,n),(v=document.getElementById("design-save-cancel"))==null||v.addEventListener("click",n);let a=document.getElementById("design-name"),r=document.getElementById("design-desc"),l=document.getElementById("design-save-confirm"),d=p=>{p.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",d),r==null||r.addEventListener("keydown",d),a==null||a.select(),l==null||l.addEventListener("click",async()=>{var u,h;let p=((u=a==null?void 0:a.value)==null?void 0:u.trim())||"",c=((h=r==null?void 0:r.value)==null?void 0:h.trim())||"";if(!p){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:m,error:f}=await $.post("/designs",{name:p,description:c});n(),m?(I("Design saved.","success"),oo="gallery",document.getElementById("designs-content")&&(document.querySelectorAll(".vs-tab").forEach(b=>{b.classList.toggle("vs-tab-active",b.dataset.tab==="gallery")}),pi())):I((f==null?void 0:f.message)||"Failed to save design.","error")})}function bv(e,t,s){var v;let n=document.getElementById("vs-design-edit-overlay");n&&n.remove();let o=document.createElement("div");o.id="vs-design-edit-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${E.pencil} Edit Design</h2>
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>we(o);ke(o,i),(v=document.getElementById("edit-design-cancel"))==null||v.addEventListener("click",i);let a=document.getElementById("edit-design-name"),r=document.getElementById("edit-design-desc"),l=document.getElementById("edit-design-save");a==null||a.select();let d=p=>{p.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",d),r==null||r.addEventListener("keydown",d),l==null||l.addEventListener("click",async()=>{var u,h;let p=((u=a==null?void 0:a.value)==null?void 0:u.trim())||"",c=((h=r==null?void 0:r.value)==null?void 0:h.trim())||"";if(!p){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:m,error:f}=await $.put(`/designs/${e}`,{name:p,description:c});i(),m?(I("Design updated.","success"),pi()):I((f==null?void 0:f.message)||"Failed to update design.","error")})}function yv(e){return new Promise(t=>{var d,v;let s=document.getElementById("vs-switch-design-overlay");s&&s.remove();let n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=localStorage.getItem(no),i=document.createElement("div");i.id="vs-switch-design-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=p=>{p.key==="Escape"&&(p.preventDefault(),r(null))},r=p=>{document.removeEventListener("keydown",a),we(i),t(p)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let l=document.getElementById("vs-switch-save-cb");ke(i,()=>r(null)),(d=document.getElementById("vs-switch-cancel"))==null||d.addEventListener("click",()=>r(null)),(v=document.getElementById("vs-switch-ok"))==null||v.addEventListener("click",()=>{let p=l?l.checked:!1;localStorage.setItem(no,p?"true":"false"),r({saveDesign:p})}),document.addEventListener("keydown",a),setTimeout(()=>{var p;return(p=document.getElementById("vs-switch-ok"))==null?void 0:p.focus()},220)})}async function Ma(){var n;let e=await xv();if(!e)return;if(e.saveDesign&&e.designName){let o=await $.post("/designs",{name:e.designName,description:""});if(!o.ok){I(((n=o.error)==null?void 0:n.message)||"Failed to save design.","error");return}I("Design saved.","success")}let{ok:t,error:s}=await $.post("/designs/new",{skip_auto_save:!0});if(t){I("Workspace cleared. Start building.","success"),await Hl(),R.set("messages",[]),R.set("activeConversationId",null),R.set("conversations",[]);try{localStorage.removeItem("vs-active-conversation")}catch{}window.location.hash!=="#/chat"?pt.navigate("chat"):pt.refresh()}else I((s==null?void 0:s.message)||"Failed to start new design.","error")}function xv(){return new Promise(e=>{var p,c;let t=document.getElementById("vs-new-design-overlay");t&&t.remove();let s=R.get("siteName")||"",n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=document.createElement("div");o.id="vs-new-design-overlay",o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Start New Design</h2>
          <p class="vs-modal-desc">This will clear your workspace for a fresh start.</p>
          <label class="vs-modal-option" for="vs-newdesign-save-cb">
            <input type="checkbox" id="vs-newdesign-save-cb" ${localStorage.getItem(no)!=="false"?"checked":""}>
            <span class="vs-modal-option-check">${n}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-body" id="vs-newdesign-name-row" style="${localStorage.getItem(no)==="false"?"display:none":""}">
          <label class="vs-input-label">Name</label>
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${ge(s)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;let i=m=>{m.key==="Escape"&&(m.preventDefault(),a(null))},a=m=>{document.removeEventListener("keydown",i),we(o),e(m)};document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let r=document.getElementById("vs-newdesign-save-cb"),l=document.getElementById("vs-newdesign-name-row"),d=document.getElementById("vs-newdesign-name"),v=()=>{r.checked?(l.style.display="",setTimeout(()=>d==null?void 0:d.focus(),80)):l.style.display="none"};r==null||r.addEventListener("change",v),d==null||d.addEventListener("keydown",m=>{var f;m.key==="Enter"&&(m.preventDefault(),(f=document.getElementById("vs-newdesign-ok"))==null||f.click())}),ke(o,()=>a(null)),(p=document.getElementById("vs-newdesign-cancel"))==null||p.addEventListener("click",()=>a(null)),(c=document.getElementById("vs-newdesign-ok"))==null||c.addEventListener("click",()=>{var u;let m=r?r.checked:!1,f=((u=d==null?void 0:d.value)==null?void 0:u.trim())||"";if(m&&!f){d==null||d.focus();return}localStorage.setItem(no,m?"true":"false"),a({saveDesign:m,designName:f})}),document.addEventListener("keydown",i),setTimeout(()=>{var m;r!=null&&r.checked&&d?d.select():(m=document.getElementById("vs-newdesign-ok"))==null||m.focus()},220)})}function Rl(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${E.camera} Create Snapshot</h2>
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
        <button id="snap-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${E.camera} Create Snapshot</button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>we(t);ke(t,s),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var d;let a=((d=n==null?void 0:n.value)==null?void 0:d.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:r,error:l}=await $.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),r?(I("Snapshot created.","success"),ci()):I((l==null?void 0:l.message)||"Failed to create snapshot.","error")})}function wv(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${E.eye} Snapshot Details</h2>
      </div>
      <div class="vs-modal-body">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
          <span style="color: var(--vs-text-ghost);">Type</span>
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${n}; display: inline-block;"></span>
            ${o}
          </span>
          <span style="color: var(--vs-text-ghost);">Label</span>
          <span style="color: var(--vs-text-primary);">${y(e.label||"\u2014")}</span>
          <span style="color: var(--vs-text-ghost);">Description</span>
          <span style="color: var(--vs-text-primary);">${y(e.description||"\u2014")}</span>
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),ke(s,()=>we(s)),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>we(s))}async function Hl(){var e,t;try{let s=await $.get("/pages");s.ok&&Array.isArray((e=s.data)==null?void 0:e.pages)&&R.set("pages",s.data.pages);let n=await $.get("/auth/session");n.ok&&((t=n.data)!=null&&t.site_name)&&(R.set("siteName",n.data.site_name),document.title=`Studio \u2014 ${n.data.site_name}`);let o=document.getElementById("preview-iframe");o&&(o.src=o.src)}catch(s){console.warn("[designs] Post-switch refresh failed:",s)}}var co=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},po=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},He=[],De=null,Lt=null,yn=null,zt="",$s=!1,ao="",Ba="idle",ro="list",vi=!1,Ol=800,kv=200;var ql="vs-notes-list-width",Nl=80;function Ev(){window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("notes",Qs)}async function Qs(){Lt&&(clearTimeout(Lt),Lt=null,await Aa())}function $v(e){if(!e)return"";let t=y(e);return t=t.replace(/```(\w*)\n([\s\S]*?)```/g,(s,n,o)=>`<pre class="vs-note-code-block"><code>${o}</code></pre>`),t=t.replace(/`([^`]+)`/g,'<code class="vs-note-inline-code">$1</code>'),t=t.replace(/^### (.+)$/gm,'<h3 class="vs-note-h3">$1</h3>'),t=t.replace(/^## (.+)$/gm,'<h2 class="vs-note-h2">$1</h2>'),t=t.replace(/^# (.+)$/gm,'<h1 class="vs-note-h1">$1</h1>'),t=t.replace(/^&gt; (.+)$/gm,'<blockquote class="vs-note-blockquote">$1</blockquote>'),t=t.replace(/^---$/gm,'<hr class="vs-note-hr" />'),t=t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*(.+?)\*/g,"<em>$1</em>"),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" class="vs-note-link">$1</a>'),t=t.replace(/^- (.+)$/gm,'<li class="vs-note-li">$1</li>'),t=t.replace(/(<li class="vs-note-li">.*<\/li>\n?)+/g,'<ul class="vs-note-ul">$&</ul>'),t=t.replace(/^\d+\. (.+)$/gm,'<li class="vs-note-li-ol">$1</li>'),t=t.replace(/(<li class="vs-note-li-ol">.*<\/li>\n?)+/g,'<ol class="vs-note-ol">$&</ol>'),t=t.replace(/\n\n/g,'</p><p class="vs-note-p">'),t='<p class="vs-note-p">'+t+"</p>",t=t.replace(/<p class="vs-note-p">(<(?:h[1-3]|pre|blockquote|hr|ul|ol)[^>]*>)/g,"$1"),t=t.replace(/(<\/(?:h[1-3]|pre|blockquote|ul|ol)>)<\/p>/g,"$1"),t=t.replace(/<p class="vs-note-p"><\/p>/g,""),t}function _a(){return`
    <div class="vs-empty-state vs-empty-state--panel">
      <div class="vs-empty-state-inner">
        <div class="vs-empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <p class="vs-empty-state-title">Select a note</p>
      </div>
    </div>
  `}function Fl(){Ev(),vi=!1,setTimeout(()=>Cv(),0);let e=parseInt(localStorage.getItem(ql)||"320",10);return`
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
            ${_a()}
          </div>
        </div>
      </div>

      <!-- Mobile: Detail View (overlays list) -->
      <div id="vs-notes-mobile-detail" class="vs-notes-mobile-detail" style="display: none;"></div>
    </div>
  `}async function Cv(){vi||(vi=!0,await zl(),Mv())}async function zl(){let e;if(zt?e=await $.get(`/notes/search?q=${encodeURIComponent(zt)}`):e=await $.get("/notes"),!e.ok){I("Could not load notes.","error");return}if(He=e.data.notes||[],rs(),ui(),De){let t=He.find(s=>s.id===De);t?window.matchMedia("(max-width: 767px)").matches?(ro="detail",Wl(t)):Vl(t,{restoring:!0}):De=null}}function ui(){let e=document.getElementById("vs-notes-empty"),t=document.getElementById("vs-notes-split");if(!e||!t)return;let s=window.matchMedia("(max-width: 767px)").matches;He.length===0&&!zt?(e.style.display="flex",t.style.display="none"):(e.style.display="none",t.style.display=s?"block":"flex")}function rs(){let e=document.getElementById("vs-notes-list");if(!e)return;if(He.length===0){zt?e.innerHTML=`
        <div class="vs-notes-no-results">No notes matching "${y(zt)}"</div>
      `:e.innerHTML="";return}let t=He.filter(o=>o.pinned==1),s=He.filter(o=>o.pinned!=1),n="";t.length>0&&!zt&&(n+='<div class="vs-notes-section-label">Pinned</div>',n+=t.map(o=>jl(o)).join(""),s.length>0&&(n+='<div class="vs-notes-section-label vs-notes-section-label--rest">Notes</div>')),n+=s.map(o=>jl(o)).join(""),e.innerHTML=n,e.querySelectorAll("[data-note-id]").forEach(o=>{o.addEventListener("click",()=>{let i=parseInt(o.dataset.noteId,10);mi(i)}),o.addEventListener("contextmenu",i=>{i.preventDefault(),Tv(i,parseInt(o.dataset.noteId,10))})})}function jl(e){let t=e.id===De,s=e.pinned==1,n=e.title||"Untitled",o=Lv(e.body),i=jn(e.updated_at);return`
    <div class="vs-note-item ${t?"vs-note-item--active":""}"
         data-note-id="${e.id}" tabindex="0" role="button">
      <div class="vs-note-item-top">
        ${s?'<span class="vs-note-pin" title="Pinned">\u{1F4CC}</span>':""}
        <span class="vs-note-item-title">${y(n)}</span>
      </div>
      ${o?`<div class="vs-note-item-preview">${Sv(y(o))}</div>`:""}
      <div class="vs-note-item-time">${i}</div>
    </div>
  `}function Lv(e){if(!e)return"";let t=e.replace(/^#{1,3} /gm,"").replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1").replace(/`([^`]+)`/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^[-*] /gm,"").replace(/^\d+\. /gm,"").replace(/^> /gm,"").replace(/\n/g," ").trim();return t.length>Nl?t.substring(0,Nl).trim()+"\u2026":t}function Sv(e){if(!zt)return e;let t=zt.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return e.replace(new RegExp(`(${t})`,"gi"),"<mark>$1</mark>")}async function mi(e){if(e===De)return;await Qs(),De=e,$s=!1,Ba="idle",document.querySelectorAll(".vs-note-item").forEach(n=>{n.classList.toggle("vs-note-item--active",parseInt(n.dataset.noteId,10)===e)});let t=He.find(n=>n.id===e);if(!t)return;window.matchMedia("(max-width: 767px)").matches?(ro="detail",Wl(t)):Vl(t)}async function Ul(){if(await Qs(),De=null,$s=!1,Ba="idle",rs(),window.matchMedia("(max-width: 767px)").matches&&ro==="detail"){ro="list";let t=document.getElementById("vs-notes-mobile-detail");t&&(t.style.display="none")}else{let t=document.getElementById("vs-notes-editor-content");t&&(t.innerHTML=_a())}}function Vl(e,t={}){let s=document.getElementById("vs-notes-editor-content");if(!s)return;let n=e.pinned==1;s.innerHTML=`
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
               value="${y(e.title)}" placeholder="Untitled"
               autocomplete="off" spellcheck="true" ${window.IS_DEMO?"readonly":""} />
        <div id="vs-note-body-wrap" class="vs-note-body-wrap">
          <textarea id="vs-note-body" class="vs-note-body-textarea"
                    placeholder="${window.IS_DEMO?"Read-only in demo mode.":"Start writing\u2026"}" spellcheck="true" ${window.IS_DEMO?"readonly":""}>${y(e.body)}</textarea>
        </div>
      </div>
    </div>
  `,Gl(e);let o=document.getElementById("vs-note-body");o&&(lo(o),t.restoring||setTimeout(()=>{o.focus(),o.setSelectionRange(o.value.length,o.value.length)},50))}function Wl(e){let t=document.getElementById("vs-notes-mobile-detail");if(!t)return;let s=e.pinned==1;t.style.display="flex",t.innerHTML=`
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
             value="${y(e.title)}" placeholder="Untitled"
             autocomplete="off" spellcheck="true" ${window.IS_DEMO?"readonly":""} />
      <div id="vs-note-body-wrap" class="vs-note-body-wrap">
        <textarea id="vs-note-body" class="vs-note-body-textarea"
                  placeholder="${window.IS_DEMO?"Read-only in demo mode.":"Start writing\u2026"}" spellcheck="true" ${window.IS_DEMO?"readonly":""}>${y(e.body)}</textarea>
      </div>
    </div>
  `,Gl(e);let n=document.getElementById("btn-note-back");n==null||n.addEventListener("click",async()=>{await Qs(),ro="list",t.style.display="none",De=null,rs()});let o=document.getElementById("vs-note-body");o&&(lo(o),setTimeout(()=>o.focus(),50))}function Gl(e){let t=document.getElementById("vs-note-title"),s=document.getElementById("vs-note-body"),n=()=>{Lt&&clearTimeout(Lt),Lt=setTimeout(()=>Aa(),Ol)};t==null||t.addEventListener("input",n),s==null||s.addEventListener("input",()=>{lo(s),n()});let o=document.getElementById("btn-note-pin");o==null||o.addEventListener("click",async()=>{if(co()||po())return;let d=e.pinned==1,{ok:v,data:p}=await $.put(`/notes/${e.id}`,{pinned:d?0:1});if(v&&p.note){e.pinned=p.note.pinned;let c=He.findIndex(f=>f.id===e.id);c>=0&&(He[c]={...He[c],...p.note}),o.classList.toggle("vs-note-toolbar-btn--active",p.note.pinned==1);let m=o.querySelector("svg");m&&m.setAttribute("fill",p.note.pinned==1?"currentColor":"none"),rs(),p.pin_limit&&I(p.pin_limit_message||"You can pin up to 5 notes.","info")}});let i=document.getElementById("btn-note-preview");i==null||i.addEventListener("click",Kl);let a=document.getElementById("btn-note-send-chat");a==null||a.addEventListener("click",()=>Da());let r=document.getElementById("btn-note-board");r==null||r.addEventListener("click",()=>Xl(e));let l=document.getElementById("btn-note-delete");l==null||l.addEventListener("click",()=>Pa(e.id))}async function Aa(){if(!De||window.IS_DEMO)return;let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");if(!e&&!t)return;let s=(e==null?void 0:e.value)??"",n=(t==null?void 0:t.value)??"",{ok:o,data:i}=await $.put(`/notes/${De}`,{title:s,body:n});if(o&&(i!=null&&i.note)){let a=He.findIndex(r=>r.id===De);a>=0&&(He[a]={...He[a],...i.note}),rs()}}async function Ia(){if(co()||po())return;let{ok:e,data:t}=await $.post("/notes",{title:"",body:""});e&&(t!=null&&t.note)&&(He.unshift(t.note),rs(),ui(),mi(t.note.id))}async function Pa(e){if(co()||po())return;let{ok:t}=await $.delete(`/notes/${e}`);if(!t){I("Could not delete note.","error");return}if(He=He.filter(n=>n.id!==e),De===e){De=null,$s=!1,Ba="idle";let n=document.getElementById("vs-notes-editor-content");n&&(n.innerHTML=_a())}rs(),ui(),Un("Note deleted","Undo",async()=>{var o;let n=await $.post(`/notes/${e}/restore`);n.ok&&((o=n.data)!=null&&o.note)&&(He.unshift(n.data.note),rs(),ui(),mi(n.data.note.id),I("Note restored.","success"))},"info");let s=document.getElementById("vs-notes-mobile-detail");s&&(s.style.display="none")}function Kl(){let e=document.getElementById("vs-note-body-wrap"),t=document.getElementById("btn-note-preview");if(e)if($s){$s=!1,e.innerHTML=`<textarea id="vs-note-body" class="vs-note-body-textarea"
                    placeholder="Start writing\u2026" spellcheck="true">${y(ao)}</textarea>`;let s=document.getElementById("vs-note-body");s&&(lo(s),s.addEventListener("input",()=>{lo(s),Lt&&clearTimeout(Lt),Lt=setTimeout(()=>Aa(),Ol)}),s.focus()),t==null||t.classList.remove("vs-note-toolbar-btn--active")}else{let s=document.getElementById("vs-note-body");if(!s)return;ao=s.value,$s=!0;let n=$v(ao);e.innerHTML=`<div id="vs-note-preview" class="vs-note-preview">${n}</div>`,t==null||t.classList.add("vs-note-toolbar-btn--active")}}function Ra(){let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");return{title:(e==null?void 0:e.value)??"",body:$s?ao:(t==null?void 0:t.value)??""}}async function Da(e){await Qs();let t,s;e?(t=e.title||"",s=e.body||""):{title:t,body:s}=Ra();let o=`Here is my note "${t||"Untitled"}":

${s}

`;window.location.hash="#/chat",setTimeout(()=>{let i=document.getElementById("prompt-input");i&&(i.value=o,i.focus(),i.style.height="auto",i.style.height=i.scrollHeight+"px")},150)}async function Xl(e){if(co()||po())return;await Qs();let t,s,n;e?(t=e.title||"",s=e.body||"",n=e.id):({title:t,body:s}=Ra(),n=De);let{ok:o,error:i}=await $.post("/cards",{title:t||"Untitled",body:s,column_name:"todo",source_note_id:n});o?I("Card added to Board.","success"):I((i==null?void 0:i.message)||"Failed to add card.","error")}function Tv(e,t){var a;(a=document.getElementById("vs-note-ctx"))==null||a.remove();let s=He.find(r=>r.id===t);if(!s)return;let n=s.pinned==1,o=document.createElement("div");o.id="vs-note-ctx",o.className="vs-note-context-menu",o.style.left=`${e.clientX}px`,o.style.top=`${e.clientY}px`,o.innerHTML=`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>{let r=o.getBoundingClientRect();r.right>window.innerWidth&&(o.style.left=`${window.innerWidth-r.width-8}px`),r.bottom>window.innerHeight&&(o.style.top=`${window.innerHeight-r.height-8}px`)}),o.addEventListener("click",async r=>{var d;let l=(d=r.target.closest("[data-action]"))==null?void 0:d.dataset.action;if(l)switch(o.remove(),l){case"pin":{if(co()||po())return;let v=n?0:1,{ok:p,data:c}=await $.put(`/notes/${t}`,{pinned:v});if(p&&c.note){let m=He.findIndex(f=>f.id===t);m>=0&&(He[m]={...He[m],...c.note}),rs(),c.pin_limit&&I(c.pin_limit_message||"You can pin up to 5 notes.","info")}break}case"send":{Da(t!==De?s:void 0);break}case"use":{await Qs();let v=t===De?Ra().body:s.body||"";window.location.hash="#/chat",setTimeout(()=>{let p=document.getElementById("prompt-input");p&&(p.value=v,p.focus(),p.style.height="auto",p.style.height=p.scrollHeight+"px")},150);break}case"delete":Pa(t);break;case"board":Xl(s);break}});let i=r=>{o.contains(r.target)||(o.remove(),document.removeEventListener("click",i))};setTimeout(()=>document.addEventListener("click",i),0)}function Mv(){let e=document.getElementById("btn-note-new");e==null||e.addEventListener("click",Ia);let t=document.getElementById("btn-notes-first");t==null||t.addEventListener("click",Ia);let s=document.getElementById("notes-search");s==null||s.addEventListener("input",()=>{yn&&clearTimeout(yn),yn=setTimeout(()=>{zt=s.value.trim(),zl()},kv)});let n=document.getElementById("vs-notes-list-panel");n==null||n.addEventListener("click",o=>{o.target.closest(".vs-note-item")||o.target.closest("button")||o.target.closest("input")||o.target.closest(".vs-notes-section-label")||De&&Ul()}),document.addEventListener("keydown",Yl),Iv()}function Yl(e){var n,o,i;if(R.get("route")!=="notes")return;let s=navigator.platform.toUpperCase().includes("MAC")?e.metaKey:e.ctrlKey;if(s&&e.key==="n"){e.preventDefault(),Ia();return}if(s&&e.key==="Backspace"&&De){e.preventDefault(),Pa(De);return}if(s&&e.shiftKey&&e.key==="p"){e.preventDefault(),De&&Kl();return}if(s&&e.shiftKey&&(e.key==="c"||e.key==="C")){e.preventDefault();let a=He.find(r=>r.id===De);a&&Da(a);return}if(e.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;De&&Ul();return}if((e.key==="ArrowUp"||e.key==="ArrowDown")&&!e.metaKey&&!e.ctrlKey){let a=(n=document.activeElement)==null?void 0:n.closest(".vs-note-item");if(!a)return;e.preventDefault();let r=[...document.querySelectorAll(".vs-note-item")],l=r.indexOf(a),d=e.key==="ArrowDown"?Math.min(l+1,r.length-1):Math.max(l-1,0);(o=r[d])==null||o.focus()}if(e.key==="Enter"){let a=(i=document.activeElement)==null?void 0:i.closest(".vs-note-item");a&&(e.preventDefault(),mi(parseInt(a.dataset.noteId,10)))}}function Iv(){let e=document.getElementById("vs-notes-resize"),t=document.getElementById("vs-notes-list-panel");if(!e||!t)return;let s,n;e.addEventListener("mousedown",o=>{o.preventDefault(),s=o.clientX,n=t.offsetWidth;let i=r=>{let l=Math.max(200,Math.min(500,n+r.clientX-s));t.style.width=`${l}px`},a=()=>{document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",a),localStorage.setItem(ql,String(t.offsetWidth))};document.addEventListener("mousemove",i),document.addEventListener("mouseup",a)})}function lo(e){if(!e)return;e.style.height="auto";let t=window.innerHeight-200;e.style.height=Math.min(t,e.scrollHeight)+"px"}function Jl(){var e,t;document.removeEventListener("keydown",Yl),Lt&&(clearTimeout(Lt),Lt=null),yn&&(clearTimeout(yn),yn=null),zt="",$s=!1,ao="",vi=!1,(e=window.__vsFlushCallbacks)==null||e.delete("notes"),(t=document.getElementById("vs-note-ctx"))==null||t.remove()}var gi=!1,Cs=null,Fe=null,fi=null,vo=null,Ls=null,go=[{id:"todo",label:"To Do",dotColor:"var(--vs-text-ghost)"},{id:"in_progress",label:"In Progress",dotColor:"var(--vs-accent)"},{id:"done",label:"Done",dotColor:"var(--vs-success)"}];function xn(){var t;let e=(t=R.get("user"))==null?void 0:t.role;return e==="owner"||e==="editor"}function Ha(){return gi=!1,Fe=null,setTimeout(()=>{Dv(),ut()},0),`
    <div class="vs-board" id="board-root">
      <div class="vs-board-header">
        <h1 class="vs-board-title">Board</h1>
        ${xn()?`
          <button id="btn-board-add" class="vs-btn vs-btn-primary vs-btn-sm">
            New Card
          </button>
        `:""}
      </div>
      <div class="vs-board-columns" id="board-columns">
        ${go.map(t=>`
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
  `}async function ut(){var o;let{ok:e,data:t}=await $.get("/cards");if(!e){I("Failed to load board.","error");return}let s=(t==null?void 0:t.cards)||[];R.set("cards",s),R.set("cardsLoaded",!0),Bv(s);let n=await $.get("/cards/archived");if(n.ok){let i=((o=n.data)==null?void 0:o.cards)||[];Rv(i.length)}}function Bv(e){let t=xn();for(let s of go){let n=e.filter(a=>a.column_name===s.id),o=document.querySelector(`[data-col-cards="${s.id}"]`),i=document.querySelector(`[data-count="${s.id}"]`);if(i&&(i.textContent=n.length),!!o){if(n.length===0){s.id==="todo"&&e.length===0?o.innerHTML=t?`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0 0 12px;">Your board is empty</p>
              <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 16px;">Add your first task or promote a note from the Notes section.</p>
              <button class="vs-btn vs-btn-ghost vs-btn-sm board-empty-add">Add a card</button>
            </div>`:`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0;">No tasks on the board yet.</p>
            </div>`:t?o.innerHTML='<div class="vs-board-drop-zone">Drop a card here</div>':o.innerHTML="";continue}if(o.innerHTML=n.map(a=>a.id===Fe?ed(a,s,t):_v(a,s,t)).join(""),Fe){let a=o.querySelector(`[data-card-id="${Fe}"].vs-board-card-expanded`);a&&t&&td(a,Fe)}}}}function _v(e,t,s){let n=e.body?`<div class="vs-board-card-body">${y(e.body.substring(0,200))}</div>`:"",o=e.linked_page?`<div class="vs-board-card-footer"><span class="vs-board-card-link" data-page="${ge(e.linked_page)}"><span class="vs-board-card-link-icon">${E.link}</span>${y(id(e.linked_page))}</span></div>`:"";return`
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
  `}function ed(e,t,s){let n=R.get("pages")||[];return s?`
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
                placeholder="Add details\u2026">${y(e.body||"")}</textarea>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label">Column</label>
        <select class="vs-board-inline-select" data-field="column" data-card-id="${e.id}">
          ${go.map(o=>`<option value="${o.id}" ${o.id===e.column_name?"selected":""}>${o.label}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label">Linked page</label>
        <select class="vs-board-inline-select" data-field="linked_page" data-card-id="${e.id}">
          <option value="">None</option>
          ${n.map(o=>`<option value="${ge(o.slug)}" ${o.slug===e.linked_page?"selected":""}>${y(o.title||o.slug)}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-card-expand-footer">
        <div class="vs-board-card-actions">
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-card-archive="${e.id}" title="Archive this card">
            ${E.archive}
            Archive
          </button>
          <button class="vs-btn vs-btn-danger vs-btn-xs" data-card-delete="${e.id}" title="Permanently delete">
            ${E.trash}
            Delete
          </button>
        </div>
        <div class="vs-board-card-meta">
          Created ${mo(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${mo(e.updated_at)}`:""}
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
            <span class="vs-board-card-link" data-page="${ge(e.linked_page)}"><span class="vs-board-card-link-icon">${E.link}</span>${y(id(e.linked_page))}</span>
          </div>
        `:""}
        <div class="vs-board-card-meta">
          Created ${mo(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${mo(e.updated_at)}`:""}
        </div>
      </div>
    `}function td(e,t){let s=e.querySelector('[data-field="title"]'),n=e.querySelector('[data-field="body"]'),o=e.querySelector('[data-field="column"]'),i=e.querySelector('[data-field="linked_page"]');s==null||s.addEventListener("input",()=>{Zl(t,{title:s.value.trim()})}),n==null||n.addEventListener("input",()=>{Ql(n),Zl(t,{body:n.value})}),o==null||o.addEventListener("change",async()=>{if(window.IS_DEMO){return}let a=o.value;let{ok:r}=await $.put(`/cards/${t}/move`,{column_name:a,position:0});r?(Fe=null,await ut()):void 0}),i==null||i.addEventListener("change",async()=>{if(window.IS_DEMO){return}let{ok:a}=await $.put(`/cards/${t}`,{linked_page:i.value||null});}),n&&Ql(n)}function Zl(e,t){Ls&&Ls.cardId===e?Object.assign(Ls.fields,t):Ls={cardId:e,fields:{...t}},clearTimeout(fi),fi=setTimeout(()=>hi(),600)}async function hi(){if(clearTimeout(fi),fi=null,!Ls){vo&&await vo;return}let{cardId:e,fields:t}=Ls;if(Ls=null,window.IS_DEMO){return}vo=$.put(`/cards/${e}`,t);let{ok:s}=await vo;vo=null}function Ql(e){e.style.height="auto",e.style.height=Math.max(60,e.scrollHeight)+"px"}async function Av(e){Fe&&Fe!==e&&await bi();let{ok:t,data:s}=await $.get(`/cards/${e}`);if(!t||!(s!=null&&s.card)){I("Card not found.","error");return}Fe=e;let n=s.card,o=go.find(d=>d.id===n.column_name)||go[0],i=xn(),a=document.querySelector(`[data-card-id="${e}"]`);if(!a)return;let r=ed(n,o,i);a.outerHTML=r;let l=document.querySelector(`[data-card-id="${e}"]`);l&&i&&(td(l,e),setTimeout(()=>{var d;return(d=l.querySelector(".vs-board-inline-title"))==null?void 0:d.focus()},50)),l==null||l.scrollIntoView({behavior:"smooth",block:"nearest"})}async function bi(){Fe&&(await hi(),Fe=null,await ut())}function Pv(e,t){uo();let s=document.createElement("div");s.className="vs-board-card-dropdown",s.id="vs-board-card-dropdown",s.innerHTML=`
    <button class="vs-board-card-dropdown-item" data-action="archive" data-id="${e}">
      ${E.archive}
      Archive
    </button>
    <div class="vs-board-card-dropdown-divider"></div>
    <button class="vs-board-card-dropdown-item vs-board-card-dropdown-danger" data-action="delete" data-id="${e}">
      ${E.trash}
      Delete
    </button>
  `;let n=t.getBoundingClientRect();s.style.position="fixed",s.style.top=`${n.bottom+4}px`,s.style.right=`${window.innerWidth-n.right}px`,s.style.zIndex="1000",document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let o=a=>{!s.contains(a.target)&&a.target!==t&&(uo(),document.removeEventListener("click",o))};setTimeout(()=>document.addEventListener("click",o),10);let i=a=>{a.key==="Escape"&&(uo(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i),s.addEventListener("click",async a=>{let r=a.target.closest("[data-action]");if(!r)return;let l=r.dataset.action,d=parseInt(r.dataset.id,10);if(uo(),l==="archive"){if(window.IS_DEMO){I("Demo mode \u2014 this action is disabled.","warning");return}let{ok:v}=await $.post(`/cards/${d}/archive`);v&&(Fe===d&&(Fe=null),Un("Card archived.","Undo",async()=>{await $.post(`/cards/${d}/restore`),await ut()}),await ut())}else if(l==="delete"){if(window.IS_DEMO){I("Demo mode \u2014 this action is disabled.","warning");return}if(!await Ce({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:p}=await $.delete(`/cards/${d}`);p&&(Fe===d&&(Fe=null),I("Card deleted.","success"),await ut())}})}function uo(){let e=document.getElementById("vs-board-card-dropdown");e&&e.remove()}function Rv(e){let t=document.getElementById("board-archived-link");if(t){if(e===0){t.classList.add("hidden");return}t.classList.remove("hidden"),t.innerHTML=`<button class="vs-board-show-archived">${E.archive||""} Archived (${e})</button>`}}function Dv(){var s,n;if(gi)return;gi=!0;let e=xn();(s=document.getElementById("btn-board-add"))==null||s.addEventListener("click",od);let t=document.getElementById("board-columns");t&&(t.addEventListener("click",Hv),e&&qv(t)),(n=document.getElementById("board-archived-link"))==null||n.addEventListener("click",o=>{o.target.closest(".vs-board-show-archived")&&Fv()}),document.addEventListener("keydown",sd),document.addEventListener("mousedown",nd),Ov(),window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("board",()=>hi())}function Hv(e){let t=e.target;if(t.closest(".board-empty-add")){od();return}let s=t.closest("[data-card-menu]");if(s){e.stopPropagation();let l=parseInt(s.dataset.cardMenu,10);Pv(l,s);return}if(t.closest("[data-card-close]")){e.stopPropagation(),bi();return}let o=t.closest("[data-card-archive]");if(o){e.stopPropagation(),Nv(parseInt(o.dataset.cardArchive,10));return}let i=t.closest("[data-card-delete]");if(i){e.stopPropagation(),jv(parseInt(i.dataset.cardDelete,10));return}let a=t.closest(".vs-board-card-link");if(a){e.stopPropagation();let l=a.dataset.page;l&&zv(l);return}if(t.closest("input, textarea, select, button"))return;let r=t.closest(".vs-board-card");if(r&&!r.classList.contains("vs-board-card-expanded")){let l=parseInt(r.dataset.cardId,10);Av(l);return}}function sd(e){if(e.key==="Escape"&&Fe){if(document.querySelector(".vs-modal-overlay"))return;e.preventDefault(),bi()}}function nd(e){if(!Fe)return;let t=e.target,s=document.querySelector(".vs-board-card-expanded");s&&s.contains(t)||t.closest(".vs-modal-overlay")||t.closest(".vs-board-card-dropdown")||bi()}async function Nv(e){if(window.IS_DEMO){I("Demo mode \u2014 this action is disabled.","warning");return}let{ok:t}=await $.post(`/cards/${e}/archive`);t&&(Fe=null,Un("Card archived.","Undo",async()=>{await $.post(`/cards/${e}/restore`),await ut()}),await ut())}async function jv(e){if(window.IS_DEMO){I("Demo mode \u2014 this action is disabled.","warning");return}if(!await Ce({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:s}=await $.delete(`/cards/${e}`);s&&(Fe=null,I("Card deleted.","success"),await ut())}function od(){var a,r,l;let e=document.getElementById("vs-board-create-overlay");e&&e.remove();let t=R.get("pages")||[],s=document.createElement("div");s.id="vs-board-create-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
              ${t.map(d=>`<option value="${ge(d.slug)}">${y(d.title||d.slug)}</option>`).join("")}
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>we(s);ke(s,n),(a=document.getElementById("btn-card-cancel"))==null||a.addEventListener("click",n);let o=d=>{d.key==="Escape"&&(d.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),(r=document.getElementById("card-new-title"))==null||r.addEventListener("keydown",d=>{var v;d.key==="Enter"&&((v=document.getElementById("btn-card-create"))==null||v.click())}),(l=document.getElementById("btn-card-create"))==null||l.addEventListener("click",async()=>{var h,g,b,k;let d=(g=(h=document.getElementById("card-new-title"))==null?void 0:h.value)==null?void 0:g.trim(),v=(b=document.getElementById("card-new-column"))==null?void 0:b.value,p=((k=document.getElementById("card-new-page"))==null?void 0:k.value)||null,c=document.getElementById("card-create-error"),m=document.getElementById("btn-card-create");if(!d){c&&(c.textContent="Please enter a card title.",c.classList.remove("hidden"));return}if(m.disabled=!0,m.textContent="Creating\u2026",window.IS_DEMO){n(),I("Demo mode \u2014 this action is disabled.","warning");return}let{ok:f,error:u}=await $.post("/cards",{title:d,column_name:v,linked_page:p});f?(n(),I("Card created.","success"),await ut()):(m.disabled=!1,m.textContent="Create",c&&(c.textContent=(u==null?void 0:u.message)||"Failed to create card.",c.classList.remove("hidden")))}),setTimeout(()=>{var d;return(d=document.getElementById("card-new-title"))==null?void 0:d.focus()},80)}async function Ov(){if((R.get("pages")||[]).length>0)return;let{ok:t,data:s}=await $.get("/pages");t&&Array.isArray(s==null?void 0:s.pages)&&R.set("pages",s.pages)}function qv(e){e.addEventListener("dragstart",t=>{let s=t.target.closest(".vs-board-card");!s||s.classList.contains("vs-board-card-expanded")||(Cs={cardId:parseInt(s.dataset.cardId,10),sourceColumn:s.dataset.column},s.classList.add("vs-board-card-dragging"),t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",s.dataset.cardId))}),e.addEventListener("dragend",t=>{let s=t.target.closest(".vs-board-card");s&&s.classList.remove("vs-board-card-dragging"),Cs=null,e.querySelectorAll(".vs-board-drop-indicator").forEach(n=>n.remove())}),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer.dropEffect="move";let s=t.target.closest("[data-col-cards]");if(!s)return;e.querySelectorAll(".vs-board-drop-indicator").forEach(r=>r.remove());let n=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")],o=t.clientY,i=null;for(let r of n){let l=r.getBoundingClientRect();if(o<l.top+l.height/2){i=r;break}}let a=document.createElement("div");a.className="vs-board-drop-indicator",i?s.insertBefore(a,i):s.appendChild(a)}),e.addEventListener("drop",async t=>{if(t.preventDefault(),!Cs)return;let s=t.target.closest("[data-col-cards]");if(!s)return;let n=s.dataset.colCards,i=(R.get("cards")||[]).filter(p=>p.column_name===n&&p.id!==Cs.cardId).sort((p,c)=>p.position-c.position),a=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")].map(p=>({id:parseInt(p.dataset.cardId,10),rect:p.getBoundingClientRect()})),r=t.clientY,l=a.length;for(let p=0;p<a.length;p++)if(r<a[p].rect.top+a[p].rect.height/2){l=p;break}let d;if(i.length===0||l===0?d=0:l>=i.length?d=i[i.length-1].position+1e3:d=Math.floor((i[l-1].position+i[l].position)/2),e.querySelectorAll(".vs-board-drop-indicator").forEach(p=>p.remove()),window.IS_DEMO){await ut(),Cs=null;return}let{ok:v}=await $.put(`/cards/${Cs.cardId}/move`,{column_name:n,position:d});v?await ut():I("Failed to move card.","error"),Cs=null})}async function Fv(){var r;let{ok:e,data:t}=await $.get("/cards/archived");if(!e){I("Failed to load archived cards.","error");return}let s=(t==null?void 0:t.cards)||[],n=xn(),o=document.getElementById("vs-board-archived-overlay");o&&o.remove();let i=document.createElement("div");i.id="vs-board-archived-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">Archived Cards</h2>
      </div>
      <div class="vs-modal-body" style="max-height: 60vh; overflow-y: auto;">
        ${s.length===0?'<p style="font-size: 13px; color: var(--vs-text-ghost);">No archived cards.</p>':s.map(l=>`
            <div class="vs-board-archived-item" data-card-id="${l.id}">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${y(l.title||"Untitled")}</div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 2px;">Archived ${mo(l.updated_at)}</div>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>we(i);if(ke(i,a),(r=document.getElementById("btn-archived-close"))==null||r.addEventListener("click",a),n){let l=i.querySelector(".vs-modal");l==null||l.addEventListener("click",async d=>{let v=d.target.closest(".archived-restore-btn");if(v){let c=v.dataset.id,{ok:m}=await $.post(`/cards/${c}/restore`);m&&(I("Card restored.","success"),a(),await ut());return}let p=d.target.closest(".archived-delete-btn");if(p){let c=p.dataset.id;if(!await Ce({title:"Delete Permanently",description:"This card will be permanently deleted. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:f}=await $.delete(`/cards/${c}`);f&&(I("Card deleted.","success"),a(),await ut())}})}}function zv(e){if(xn())R.set("activePageScope",e),window.location.hash="#/chat";else{let s=window.location.origin,n=e==="index"?"/":`/${e}`;window.open(`${s}${n}`,"_blank")}}function mo(e){return e?new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""}function id(e){if(!e)return"";if(e==="index"||e==="index.php")return"Home";let s=(R.get("pages")||[]).find(i=>i.slug===e);return s!=null&&s.title?s.title:e.replace(/\.(php|html)$/i,"").split("/").pop().split("-").filter(Boolean).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(" ")||e}async function ad(){await hi(),Cs=null,Fe=null,Ls=null,gi=!1,uo(),document.removeEventListener("keydown",sd),document.removeEventListener("mousedown",nd),window.__vsFlushCallbacks&&window.__vsFlushCallbacks.delete("board")}var oe=null;function Ss(e){oe=e}var pe=null;function Ut(e){pe=e}var rd=null;function ls(e){rd=e}var Ts="";function ja(e){Ts=e}var ds=null;function cs(e){ds=e}var fo=null;function yi(e){fo=e}var Oa=!1;function ld(e){Oa=e}var Dt=null;function en(e){Dt=e}var Uv=null;function tn(e){Uv=e}var Ms="";function Is(e){Ms=e}var qa=!1;function xi(e){qa=e}var ze="idle";function Ee(e){ze=e}var wn=null;function tt(e){wn=e}var Ke=null;function St(e){Ke=e}var Vv=null;function dd(e){Vv=e}var sn=!1;function cd(e){sn=e}var at;function Fa(e){at=e}var Vt=null;function ho(e){Vt=e}var bo=!1;function pd(e){bo=e}var Ht=null;function vd(e){Ht=e}var xt=null;function ud(e){xt=e}var md=!1;function gd(e){md=e}var kn=null;function za(e){kn=e}var wi=!1;function fd(e){wi=e}var ki=!1;function hd(e){ki=e}var Ei=!1;function $i(e){Ei=e}function ps(){sn=!1,at=void 0,Vt=null,bo=!1,Ht=null,xt=null,md=!1,kn=null,wi=!1,ki=!1,Ei=!1}var Bs=!1;function bd(e){Bs=e}var Ci="";function yd(e){Ci=e}var En="idle";function Li(e){En=e}var yo=null;function Ua(e){yo=e}var xo=null;function xd(e){xo=e}function _s(){Bs=!1,Ci="",En="idle",yo=null,xo=null}var As=!1;function wd(e){As=e}var mt="idle";function Nt(e){mt=e}var wo=null;function Va(e){wo=e}var ko=null;function kd(e){ko=e}function vs(){As=!1,mt="idle",wo=null,ko=null}var Na="vs-site-selected-node";function Si(e){try{e?sessionStorage.setItem(Na,e):sessionStorage.removeItem(Na)}catch{}}function Ed(){try{return sessionStorage.getItem(Na)||null}catch{return null}}var gt=new Set,$d="vs-site-card-prefs",Wv={"direct-includes":"open","transitive-includes":"closed","links-to":"closed","linked-from":"open","blast-radius":"closed"};function Gv(){try{let e=sessionStorage.getItem($d);if(e)return new Map(Object.entries(JSON.parse(e)))}catch{}return new Map}var Ti=Gv();function Cd(){try{sessionStorage.setItem($d,JSON.stringify(Object.fromEntries(Ti)))}catch{}}function Wa(e){let t=Ti.get(e);return t?t==="closed":(Wv[e]||"closed")==="closed"}var Xe=new Map,Ld="vs-site-sidebar-widths",Sd="vs-site-section-state",Kv=["partial","route","asset","token"],Td=[{key:"page",label:"Pages",icon:"fileText"},{key:"partial",label:"Partials",icon:"fileCode"},{key:"route",label:"Routes",icon:"globe"},{key:"asset",label:"Assets",icon:"image"},{key:"token",label:"Tokens",icon:"palette"}];function Xv(){try{let e=sessionStorage.getItem(Sd);if(e)return new Set(JSON.parse(e))}catch{}return new Set(Kv)}function Md(){try{sessionStorage.setItem(Sd,JSON.stringify([...Ps]))}catch{}}var Ps=Xv();function Id(){try{return JSON.parse(sessionStorage.getItem(Ld))||{}}catch{return{}}}function Ga(e,t){let s=Id();s[e]=t;try{sessionStorage.setItem(Ld,JSON.stringify(s))}catch{}}function Ka(e){let t=Id();return t[e]?` style="width: ${t[e]}px;"`:""}function Rs(e){let t=new Map,s=e.edges||[];for(let i of e.nodes||[])t.set(i.id,i);let n=new Map,o=new Map;for(let i of s)n.has(i.source)||n.set(i.source,[]),n.get(i.source).push(i),o.has(i.target)||o.set(i.target,[]),o.get(i.target).push(i);return{nodes:t,edges:s,summary:e.summary||{},builtAt:e.built_at||null,buildTimeMs:e.build_time_ms||0,edgesBySource:n,edgesByTarget:o}}function us(){var o,i,a,r,l,d,v;if(!oe)return[];let e=[];for(let[,p]of oe.nodes)p.type==="page"&&e.push(p);let t=new Map;for(let p of e)t.set(p.id,{id:p.id,label:p.label||p.id.replace("page:",""),slug:((o=p.meta)==null?void 0:o.slug)||"",level:((i=p.meta)==null?void 0:i.level)||1,childCount:((a=p.meta)==null?void 0:a.childCount)||0,parentPageId:((r=p.meta)==null?void 0:r.parentPageId)||null,hierarchySource:((l=p.meta)==null?void 0:l.hierarchySource)||null,isHomepage:((d=p.meta)==null?void 0:d.isHomepage)||!1,navOrder:((v=p.meta)==null?void 0:v.navOrder)||0,children:[]});let s=[];for(let[,p]of t)p.parentPageId&&t.has(p.parentPageId)?t.get(p.parentPageId).children.push(p):s.push(p);let n=(p,c)=>p.isHomepage!==c.isHomepage?p.isHomepage?-1:1:p.navOrder!==c.navOrder?p.navOrder-c.navOrder:p.label.localeCompare(c.label);s.sort(n);for(let[,p]of t)p.children.length>0&&p.children.sort(n);return s}function nn(e){let s=(oe.edgesByTarget.get(e)||[]).find(n=>n.type==="serves");return s?s.source:null}function wt(e){let t=oe.nodes.get(e);return t?t.label||t.id:e}function Tt(e){let t=oe.nodes.get(e);return t?t.type:"unknown"}function Mi(){return pe?rd:null}function Bd(e){return`
    <div class="vs-sc-left-inner">
      <div class="vs-sc-filter">
        <input type="text" id="vs-sc-search" class="vs-input vs-input-sm"
               placeholder="Filter\u2026" autocomplete="off" value="${y(Ts)}" />
      </div>
      <div class="vs-sc-left-scroll" id="vs-sc-left-scroll">
        ${Yv(e)}
        ${Jv()}
      </div>
    </div>
  `}function Yv(e){let t=Ps.has("page-tree"),s=0;if(oe)for(let[,n]of oe.nodes)n.type==="page"&&s++;return`
    <div class="vs-sc-nav-section ${t?"is-collapsed":""}">
      <button class="vs-sc-nav-section-header" data-nav-section="page-tree">
        <span class="vs-sc-nav-section-chevron">${E.chevronDown}</span>
        <span class="vs-sc-nav-section-label">Pages</span>
        <span class="vs-sc-nav-section-count">${s}</span>
      </button>
      <div class="vs-sc-nav-section-body">
        ${_d(e,0)}
      </div>
    </div>
  `}function _d(e,t){if(!e||e.length===0)return"";let s=Ts.toLowerCase(),n="",o=2;for(let i of e){if(s&&!$n(i,s))continue;let a=Mi()===i.id,r=gt.has(i.id),l=i.children.length>0,d=Math.min(t,o),v=t>o,p=d*20;n+=`
      <div class="vs-site-tree-group ${l&&r?"is-collapsed":""}"
           data-tree-group="${y(i.id)}">
        <div class="vs-site-tree-item ${a?"is-selected":""}"
             style="padding-left: ${12+p}px"
             data-page-id="${y(i.id)}">
          ${l?`
            <button class="vs-site-tree-toggle"
                    data-toggle-page="${y(i.id)}">
              ${E.chevronDown}
            </button>
          `:'<span class="vs-site-tree-toggle-spacer"></span>'}
          ${i.isHomepage?'<span class="vs-site-tree-star">\u2605</span>':""}
          <span class="vs-site-tree-label">${y(i.label)}</span>
          ${i.hierarchySource==="inferred"?'<span class="vs-site-tree-inferred" title="Inferred from URL structure \u2014 not explicitly authored">\u2071</span>':""}
          ${v?'<span class="vs-site-tree-overdepth" title="Deeper than 3 levels, shown at Level 3">\u207A</span>':""}
          ${l?`<span class="vs-site-tree-badge">${i.childCount}</span>`:""}
        </div>
        ${l?`
          <div class="vs-site-tree-children">
            ${_d(i.children,t+1)}
          </div>
        `:""}
      </div>
    `}return n}function Jv(){if(!oe)return"";let e=Ts.toLowerCase(),t=new Map,s=Td.filter(o=>o.key!=="page");for(let o of s)t.set(o.key,[]);for(let[,o]of oe.nodes){let i=t.get(o.type);i&&i.push(o)}let n="";for(let o of s){let i=t.get(o.key)||[],a=e?i.filter(d=>{let v=(d.label||"").toLowerCase(),p=d.id.toLowerCase();return v.includes(e)||p.includes(e)}):i;a.sort((d,v)=>(d.label||d.id).localeCompare(v.label||v.id));let r=Ps.has(o.key),l=e?`${a.length}/${i.length}`:`${i.length}`;n+=`
      <div class="vs-sc-nav-section ${r?"is-collapsed":""}">
        <button class="vs-sc-nav-section-header" data-nav-section="${o.key}">
          <span class="vs-sc-nav-section-chevron">${E.chevronDown}</span>
          <span class="vs-sc-nav-section-label">${o.label}</span>
          <span class="vs-sc-nav-section-count">${l}</span>
        </button>
        <div class="vs-sc-nav-section-body">
          ${a.length===0?'<div class="vs-sc-nav-item-empty">No matches</div>':a.map(d=>Qv(d,o)).join("")}
        </div>
      </div>
    `}return n}function Zv(e){let t=(e.split(".").pop()||"").toLowerCase();return{css:"paintbrush",scss:"paintbrush",less:"paintbrush",js:"fileCode",ts:"fileCode",mjs:"fileCode",json:"fileJson",jpg:"image",jpeg:"image",png:"image",gif:"image",webp:"image",avif:"image",ico:"image",svg:"penTool",mp4:"film",webm:"film",mov:"film",mp3:"music",wav:"music",ogg:"music",woff:"type",woff2:"type",ttf:"type",otf:"type",eot:"type",pdf:"filePdf"}[t]||"image"}function Qv(e,t){var d,v,p;let s=pe===e.id,n=y(e.label||e.id),o=((d=e.meta)==null?void 0:d.isShared)===!0,i=((v=e.meta)==null?void 0:v.isHomepage)===!0,a="";i&&(a+='<span class="vs-impact-badge vs-impact-badge-star">\u2605</span>'),o&&(a+='<span class="vs-impact-badge vs-impact-badge-shared">shared</span>');let r="";if(t.key==="token"&&((p=e.meta)!=null&&p.value)){let c=e.meta.value;/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(c)&&(r=`<span class="vs-impact-swatch" style="background:${y(c)}"></span>`)}let l=t.icon;return t.key==="asset"?l=Zv(e.id):t.key==="partial"&&(l="puzzle"),`
    <button class="vs-impact-item ${s?"is-selected":""}" data-node-id="${y(e.id)}">
      <span class="vs-impact-item-icon">${E[l]||E[t.icon]||""}</span>
      <span class="vs-impact-item-label">${n}</span>
      ${r}
      ${a}
    </button>
  `}function $n(e,t){return e.label.toLowerCase().includes(t)||e.slug.toLowerCase().includes(t)?!0:e.children.some(s=>$n(s,t))}function Ad(e){var i,a;if(!pe||pe!==e)return"";let t=(i=oe)==null?void 0:i.nodes.get(e),s=((a=t==null?void 0:t.meta)==null?void 0:a.isHomepage)||!1,n=s?'<button class="vs-sc-action-drop-item vs-sc-action-danger is-disabled" disabled title="The homepage cannot be deleted">Delete</button>':'<button class="vs-sc-action-drop-item vs-sc-action-danger" data-action="delete">Delete</button>',o=s?'<button class="vs-sc-action-drop-item is-disabled" disabled title="The homepage cannot be moved">Move</button>':'<button class="vs-sc-action-drop-item" data-action="reorder">Move</button>';return`
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
  `}function Cn(e){let t=document.getElementById("vs-site-diagram");if(!t||!e||e.length===0)return;let s=t.querySelector(".vs-sc-connectors");s&&s.remove();let n=[],o=x=>{for(let C of x)if(C.children.length>0&&!gt.has(C.id)){for(let _ of C.children)n.push({parentId:C.id,childId:_.id});o(C.children)}},i=Ts.toLowerCase(),a=x=>{if(!i)return x;let C=[];for(let _ of x)if($n(_,i)){let P=a(_.children);C.push({..._,children:P})}return C},r=a(e),l=r.find(x=>x.isHomepage),d=r.filter(x=>!x.isHomepage);if(l)for(let x of d)n.push({parentId:l.id,childId:x.id});if(o(r),n.length===0)return;let v=t.getBoundingClientRect(),p=t.scrollLeft,c=t.scrollTop,m=[];for(let{parentId:x,childId:C}of n){let _=t.querySelector(`.vs-site-card[data-page-id="${CSS.escape(x)}"]`),P=t.querySelector(`.vs-site-card[data-page-id="${CSS.escape(C)}"]`);if(!_||!P)continue;let j=_.getBoundingClientRect(),Z=P.getBoundingClientRect(),Y=j.left-v.left+p+j.width/2,q=j.top-v.top+c+j.height,de=Z.left-v.left+p+Z.width/2,Q=Z.top-v.top+c,N=q+(Q-q)/2,S=`M ${Y} ${q} V ${N} H ${de} V ${Q}`,H=pe&&(x===pe||C===pe);m.push({d:S,isActive:H})}if(m.length===0)return;let f=t.scrollWidth,u=t.scrollHeight,h=document.createElementNS("http://www.w3.org/2000/svg","svg");h.setAttribute("class","vs-sc-connectors"),h.setAttribute("width",f),h.setAttribute("height",u),h.setAttribute("viewBox",`0 0 ${f} ${u}`),h.setAttribute("aria-hidden","true");let g=document.createElementNS("http://www.w3.org/2000/svg","g");g.setAttribute("class","vs-sc-hierarchy-rails");let b=m.filter(x=>!x.isActive),k=m.filter(x=>x.isActive);for(let{d:x}of b){let C=document.createElementNS("http://www.w3.org/2000/svg","path");C.setAttribute("d",x),g.appendChild(C)}for(let{d:x}of k){let C=document.createElementNS("http://www.w3.org/2000/svg","path");C.setAttribute("d",x),C.classList.add("active"),g.appendChild(C)}h.appendChild(g);let w=document.createElementNS("http://www.w3.org/2000/svg","g");w.setAttribute("class","vs-sc-impact-overlays"),h.appendChild(w),t.appendChild(h)}function Pd(e){if(!e||e.length===0)return'<div class="vs-site-diagram-empty">No pages found</div>';let t=Ts.toLowerCase(),s=v=>{if(!t)return v;let p=[];for(let c of v)if($n(c,t)){let m=s(c.children);p.push({...c,children:m})}return p},n=v=>{let p=[];for(let c of v.children)p.push(c),c.children.length>0&&!gt.has(c.id)&&p.push(...o(c));return p},o=v=>{let p=[];for(let c of v.children)p.push(c),c.children.length>0&&!gt.has(c.id)&&p.push(...o(c));return p},i=s(e),a=i.find(v=>v.isHomepage),r=i.filter(v=>!v.isHomepage),l=v=>{if(v.children.length===0||gt.has(v.id))return"";let p=t?v.children.filter(m=>$n(m,t)):v.children;if(p.length===0)return"";let c=`<div class="vs-site-tier-group" data-parent-id="${y(v.id)}">`;c+=`<div class="vs-site-tier-group-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>${y(v.label)}</div>`,c+='<div class="vs-site-tier-group-cards">';for(let m of p)if(c+=Ii(m),m.children.length>0&&!gt.has(m.id)){let f=n(m),u=t?f.filter(h=>h.label.toLowerCase().includes(t)||h.slug.toLowerCase().includes(t)):f;if(u.length>0){c+='<div class="vs-site-tier-l3-inline">';for(let h of u)c+=Ii(h);c+="</div>"}}return c+="</div></div>",c},d='<div class="vs-site-tiers">';if(a&&(d+=`
      <div class="vs-site-tier vs-site-tier-home">
        ${Ii(a)}
      </div>
    `),r.length>0||a&&a.children.length>0&&!gt.has(a.id)){if(d+='<div class="vs-site-tier vs-site-tier-l1">',a&&a.children.length>0&&!gt.has(a.id)){let v=l(a);v&&(d+=`<div class="vs-site-tier-column">${v}</div>`)}for(let v of r)d+='<div class="vs-site-tier-column">',d+=Ii(v),d+=l(v),d+="</div>";d+="</div>"}return d+="</div>",d}function Ii(e){let t=Mi()===e.id,s=e.hierarchySource==="inferred",n=nn(e.id),o="";if(n){let a=oe.nodes.get(n);a&&(o=a.label||a.id.replace("route:",""))}else e.isHomepage?o="/ \xB7 Homepage":e.slug&&(o="/"+e.slug);return`
    <div class="${["vs-site-card",e.isHomepage?"is-homepage":"",t?"is-selected":"",s?"is-inferred":""].filter(Boolean).join(" ")}"
         data-page-id="${y(e.id)}"
         title="${y(o||e.label)}">
      <div class="vs-site-card-body">
        <div class="vs-site-card-title">
          ${e.isHomepage?'<span class="vs-site-card-star">\u2605</span>':""}
          <span class="vs-site-card-label">${y(e.label)}</span>
        </div>
        ${o?`<div class="vs-site-card-route">${y(o)}</div>`:""}
      </div>
      ${e.childCount>0?`<span class="vs-site-card-count">${e.childCount}</span>`:""}
      ${Ad(e.id)}
    </div>
  `}var Le="idle";function kt(e){Le=e}var Eo="";function Bi(e){Eo=e}var Ds=[];function on(e){Ds.push(e)}function Xa(){Ds=[]}var Ue=null;function $o(e){Ue=e}var Wt=null;function Gt(e){Wt=e}var Rd="vs-sc-console-height",Dd="vs-sc-console-collapsed";function eu(){try{let e=sessionStorage.getItem(Rd);return e?parseInt(e,10):null}catch{return null}}function Hd(e){try{sessionStorage.setItem(Rd,String(e))}catch{}}function Ya(){try{return sessionStorage.getItem(Dd)==="1"}catch{return!1}}function Nd(e){try{sessionStorage.setItem(Dd,e?"1":"0")}catch{}}function jd(){let e=Ya(),t=eu();return`
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
        ${Le!=="idle"?`
          <span class="vs-sc-console-status is-${Le}">
            ${nu(Le)}
          </span>
        `:""}
        ${Ds.length>0?`
          <button class="vs-sc-console-clear" id="vs-sc-console-clear" title="Clear log">
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
            ${tu()}
          </div>
          <div class="vs-sc-console-composer" id="vs-sc-console-composer">
            ${su()}
          </div>
        </div>
      `}
    </div>
  `}function tu(){return Ds.length===0?`
      <div class="vs-sc-console-empty">
        <span class="vs-sc-console-empty-text">
          Describe a change \u2014 the orchestrator will plan and execute it across your site.
        </span>
      </div>
    `:Ds.map(e=>{if(e.phase){let n=au(e.phase),o=ru(e.status),i=e.file?`<span class="vs-sc-log-file">${y(e.file)}</span> `:"",a=e.ms!=null?`<span class="vs-sc-log-meta">${e.ms}ms</span>`:e.bytes!=null?`<span class="vs-sc-log-meta">${e.bytes}b</span>`:"";return`
        <div class="vs-sc-log-entry vs-sc-log-phase ${o}">
          <span class="vs-sc-log-icon">${n}</span>
          <span class="vs-sc-log-phase-name">${e.phase}</span>
          ${i}<span class="vs-sc-log-text">${y(e.message||"")}</span>
          ${a}
        </div>
      `}let t=iu(e.type),s=ou(e.type);return`
      <div class="vs-sc-log-entry ${t}">
        <span class="vs-sc-log-icon">${s}</span>
        <span class="vs-sc-log-text">${y(e.message)}</span>
      </div>
    `}).join("")}function su(){let e=Le==="running";return`
    <div class="vs-sc-composer-wrap">
      <textarea
        id="vs-sc-composer-input"
        class="vs-sc-composer-input"
        placeholder="${y(e?"Orchestrating\u2026":"Describe a change across your site\u2026")}"
        autocomplete="off"
        spellcheck="false"
        rows="1"
        ${e?"disabled":""}
      >${y(Eo)}</textarea>
      <div class="vs-sc-composer-actions">
        <span class="vs-sc-composer-hint">
          ${e?"":"<kbd>Enter</kbd> to run \xB7 <kbd>Shift+Enter</kbd> for newline"}
        </span>
        <button
          id="vs-sc-composer-submit"
          class="vs-sc-composer-submit"
          title="Run"
          ${e||!Eo.trim()?"disabled":""}
        >
          ${e?'<span class="vs-sc-command-spinner"></span>':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'}
        </button>
      </div>
    </div>
  `}function nu(e){switch(e){case"running":return"Analyzing\u2026";case"plan":return"Plan Ready";case"plan_failed":return"Plan Failed";case"applying":return"Applying\u2026";case"applied":return"Applied";case"apply_failed":return"Apply Failed";case"complete":return"Done";default:return""}}function ou(e){switch(e){case"running":return"\u25CF";case"done":return"\u2713";case"error":return"\u2717";case"skipped":return"\u2298";case"info":return"\u2192";case"plan":return"\u25C6";default:return"\xB7"}}function iu(e){switch(e){case"running":return"is-running";case"done":return"is-done";case"error":return"is-error";case"skipped":return"is-skipped";case"plan":return"is-plan";default:return""}}function au(e){return{start:"\u25B6",snapshot:"\u25CE",read:"\u2193",anchor:"\u2693",patch:"\u270E",lint:"\u2318",verify:"\u2714",reject:"\u2298",rollback:"\u21BA",done:"\u2713",failed:"\u2717",abort:"\u2298"}[e]||"\xB7"}function ru(e){return{ok:"is-ok",failed:"is-failed",error:"is-failed",skip:"is-skip",refused:"is-refused",start:"is-info",partial:"is-warning"}[e]||""}function Od(){if(Le!=="idle")return`
      <div class="vs-sc-right-inner">
        <div class="vs-sc-right-header">
          <span class="vs-sc-right-title">Review</span>
          <span class="vs-sc-right-mode-badge is-${Le}">
            ${Le==="running"?"Analyzing":Le==="plan"?"Plan Ready":Le==="plan_failed"?"Plan Failed":Le==="applying"?"Applying":Le==="applied"?"Applied":Le==="apply_failed"?"Apply Failed":Le==="complete"?"Complete":Le}
          </span>
        </div>
        <div class="vs-sc-right-body" id="vs-sc-right-body">
          ${lu()}
        </div>
      </div>
    `;let t=pe&&oe&&oe.nodes.get(pe),s=t?oe.nodes.get(pe):null;return`
    <div class="vs-sc-right-inner ${t?"":"vs-sc-idle"}">
      <div class="vs-sc-right-header">
        ${t?`
          <span class="vs-sc-right-title">${y(s.label||pe)}</span>
          <button class="vs-impact-close-btn" data-action="close-inspect" title="Close" aria-label="Close inspect panel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        `:`
          <span class="vs-sc-right-title vs-sc-right-title-idle">Site Control</span>
        `}
      </div>
      <div class="vs-sc-right-body" id="vs-sc-right-body">
        ${t?Ja():du()}
      </div>
    </div>
  `}function lu(){var e,t,s,n,o,i,a;if(Le==="plan"&&Ue){let r=Ue.files||[],l=Ue.affected_pages||[],d=Ue.skipped||[],v=Ue.intent||null,p=Ue.edits||[],c=Ue.risk_level||"medium",m=Ue.plan_summary||"",f=p.filter(g=>g.anchored!==!1),u=p.filter(g=>g.anchored===!1),h=f.length>0;return`
      <div class="vs-sc-orch-review">
        ${v?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Intent</h4>
            <div class="vs-sc-review-intent">
              <span class="vs-impact-type-badge vs-impact-type-${v.category||"content"}">${y(v.category||"content")}</span>
              <span class="vs-sc-review-scope">${y(v.scope||"site-wide")}</span>
            </div>
            <p class="vs-sc-review-summary">${y(v.summary||"")}</p>
            ${v.keywords&&v.keywords.length>0?`
              <div class="vs-sc-review-keywords">
                ${v.keywords.map(g=>`<span class="vs-sc-review-keyword">${y(g)}</span>`).join("")}
              </div>
            `:""}
          </div>
        `:""}
        ${h?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">
              Edit Plan
              <span class="vs-sc-review-count">${f.length}</span>
              <span class="vs-sc-review-risk is-${c}">${c}</span>
            </h4>
            ${m?`<p class="vs-sc-review-plan-summary">${y(m)}</p>`:""}
            ${f.map((g,b)=>`
              <div class="vs-sc-review-edit">
                <div class="vs-sc-review-edit-header">
                  <span class="vs-sc-review-edit-num">${b+1}</span>
                  <span class="vs-sc-review-edit-strategy">${y(g.strategy||"edit")}</span>
                  <span class="vs-sc-review-file-path">${y(g.file||"")}</span>
                </div>
                <p class="vs-sc-review-edit-desc">${y(g.description||"")}</p>
                ${g.before_snippet||g.after_snippet?`
                  <div class="vs-sc-review-diff">
                    ${g.before_snippet?`<div class="vs-sc-review-diff-before"><span class="vs-sc-diff-label">\u2212</span><code>${y(g.before_snippet)}</code></div>`:""}
                    ${g.after_snippet?`<div class="vs-sc-review-diff-after"><span class="vs-sc-diff-label">+</span><code>${y(g.after_snippet)}</code></div>`:""}
                  </div>
                `:""}
                ${g.verification?`<p class="vs-sc-review-edit-verify">\u2713 ${y(g.verification)}</p>`:""}
              </div>
            `).join("")}
          </div>
        `:`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Candidate Files <span class="vs-sc-review-count">${r.length}</span></h4>
            ${r.length===0?'<p class="vs-sc-review-empty">No files affected</p>':r.map(g=>`
                <div class="vs-sc-review-file">
                  <div class="vs-sc-review-file-header">
                    <span class="vs-impact-type-badge vs-impact-type-${g.type||"page"}">${y(g.type||"file")}</span>
                    <span class="vs-sc-review-file-path">${y(g.path)}</span>
                  </div>
                  ${g.reason?`<span class="vs-sc-review-file-reason">${y(g.reason)}</span>`:""}
                </div>
              `).join("")}
          </div>
        `}
        ${u.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Unverified Edits <span class="vs-sc-review-count">${u.length}</span></h4>
            <p class="vs-sc-review-plan-summary">These edits could not be anchored to source text and will not be applied.</p>
            ${u.map(g=>`
              <div class="vs-sc-review-issue">
                <span class="vs-sc-review-file-path">${y(g.file||"")}</span>
                <span class="vs-sc-review-skip-reason">${y(g.anchor_issue||"Not anchored to source")}</span>
              </div>
            `).join("")}
          </div>
        `:""}
        ${l.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Affected Pages <span class="vs-sc-review-count">${l.length}</span></h4>
            <div class="vs-sc-review-pages">
              ${l.map(g=>`
                <div class="vs-sc-review-page">
                  <span class="vs-sc-review-page-label">${y(g.label)}</span>
                  ${g.slug?`<span class="vs-sc-review-page-slug">${y(g.slug)}</span>`:""}
                </div>
              `).join("")}
            </div>
          </div>
        `:""}
        ${d.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Skipped</h4>
            ${d.map(g=>`
              <div class="vs-sc-review-skip">
                <span class="vs-sc-review-file-path">${y(g.path)}</span>
                <span class="vs-sc-review-skip-reason">${y(g.reason)}</span>
              </div>
            `).join("")}
          </div>
        `:""}
        <div class="vs-sc-review-actions">
          ${h?'<button class="vs-sc-review-approve" id="vs-sc-orch-apply">Approve &amp; Apply</button>':""}
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>
        </div>
      </div>
    `}if(Le==="plan_failed"&&Ue){let r=Ue.files||[],l=Ue.affected_pages||[],d=Ue.edits||[],v=Ue.plan_summary||"",p=d.filter(c=>!c.anchored);return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Plan Could Not Be Anchored</h4>
          <p class="vs-sc-review-plan-summary">${y(v||"The edit plan could not be verified against the source files.")}</p>
          ${p.length>0?`
            <div class="vs-sc-review-issues">
              ${p.map(c=>`
                <div class="vs-sc-review-issue">
                  <span class="vs-sc-review-file-path">${y(c.file||"")}</span>
                  <span class="vs-sc-review-skip-reason">${y(c.anchor_issue||"before_snippet not found in source")}</span>
                </div>
              `).join("")}
            </div>
          `:""}
        </div>
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Discovered Files <span class="vs-sc-review-count">${r.length}</span></h4>
          ${r.map(c=>`
            <div class="vs-sc-review-file">
              <div class="vs-sc-review-file-header">
                <span class="vs-impact-type-badge vs-impact-type-${c.type||"page"}">${y(c.type||"file")}</span>
                <span class="vs-sc-review-file-path">${y(c.path)}</span>
              </div>
            </div>
          `).join("")}
        </div>
        ${l.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Affected Pages <span class="vs-sc-review-count">${l.length}</span></h4>
            <div class="vs-sc-review-pages">
              ${l.map(c=>`
                <div class="vs-sc-review-page">
                  <span class="vs-sc-review-page-label">${y(c.label)}</span>
                  ${c.slug?`<span class="vs-sc-review-page-slug">${y(c.slug)}</span>`:""}
                </div>
              `).join("")}
            </div>
          </div>
        `:""}
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>
        </div>
      </div>
    `}if(Le==="applying")return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-waiting">
          <div class="vs-sc-command-spinner"></div>
          <p class="vs-sc-review-waiting-text">Applying edits\u2026</p>
          <p class="vs-sc-review-waiting-hint">Each file is read, anchored, patched, and verified.</p>
        </div>
      </div>
    `;if(Le==="applied"){let r=((e=Wt)==null?void 0:e.filesChanged)||0,l=((t=Wt)==null?void 0:t.verification)||[],d=(s=Wt)==null?void 0:s.duration_ms,v=0,p=0;l.forEach(m=>{m.checks.forEach(f=>{v++,f.passed&&p++})});let c=l.map(m=>{let f=m.checks.map(u=>{let h=u.passed?"\u2714":"\u2717";return`<div class="vs-sc-verify-check ${u.passed?"is-passed":"is-failed"}">
          <span class="vs-sc-verify-icon">${h}</span>
          <span class="vs-sc-verify-name">${y(u.check)}</span>
          <span class="vs-sc-verify-detail">${y(u.detail)}</span>
        </div>`}).join("");return`<div class="vs-sc-verify-file">
        <div class="vs-sc-verify-file-name">${y(m.file)}</div>
        ${f}
      </div>`}).join("");return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Verification Report</h4>
          <div class="vs-sc-verify-summary">
            <span class="vs-sc-verify-stat">${r} file(s) patched</span>
            <span class="vs-sc-verify-stat">${p}/${v} checks passed</span>
            ${d?`<span class="vs-sc-verify-stat">${d}ms</span>`:""}
          </div>
          ${c}
        </div>
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Done</button>
        </div>
      </div>
    `}if(Le==="apply_failed"){let r=((n=Wt)==null?void 0:n.summary)||"Patch execution failed.",l=((o=Wt)==null?void 0:o.rollback_clean)!==!1,d=((i=Wt)==null?void 0:i.verification)||[],v=(a=Wt)==null?void 0:a.duration_ms,p=l?"All changes have been rolled back. No files were modified.":"Rollback was attempted but may not have fully succeeded. Check the console log.",c=l?"is-clean":"is-dirty",m=d.map(f=>{let u=f.checks.map(h=>{let g=h.passed?"\u2714":"\u2717";return`<div class="vs-sc-verify-check ${h.passed?"is-passed":"is-failed"}">
          <span class="vs-sc-verify-icon">${g}</span>
          <span class="vs-sc-verify-name">${y(h.check)}</span>
          <span class="vs-sc-verify-detail">${y(h.detail)}</span>
        </div>`}).join("");return`<div class="vs-sc-verify-file">
        <div class="vs-sc-verify-file-name">${y(f.file)}</div>
        ${u}
      </div>`}).join("");return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Apply Failed</h4>
          <p class="vs-sc-review-plan-summary">${y(r)}</p>
          <div class="vs-sc-verify-rollback ${c}">
            <span class="vs-sc-verify-icon">${l?"\u21BA":"\u26A0"}</span>
            ${p}
          </div>
          ${v?`<p class="vs-sc-verify-timing">${v}ms elapsed</p>`:""}
          ${m}
        </div>
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>
        </div>
      </div>
    `}return Le==="running"?`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-waiting">
          <div class="vs-sc-command-spinner"></div>
          <p class="vs-sc-review-waiting-text">Discovering affected files\u2026</p>
          <p class="vs-sc-review-waiting-hint">The results will appear here once analysis is complete.</p>
        </div>
      </div>
    `:Le==="complete"?`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Results</h4>
          <p class="vs-sc-review-summary">Orchestration complete.</p>
        </div>
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Done</button>
        </div>
      </div>
    `:'<div class="vs-sc-orch-review"><p class="vs-sc-review-empty">No active orchestration.</p></div>'}function du(){return oe?`
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${E.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `:Ln()}function Ln(){return`
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${E.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `}function Ja(){var r,l;if(As)return ku();if(Bs)return wu();if(sn)return hu();if(Dt)return pu();let e=(r=oe)==null?void 0:r.nodes.get(pe);if(!e)return Ln();let t="";if(e.type==="page"){let d=nn(e.id);if(d){let v=oe.nodes.get(d);t=v?v.label||d:""}}else e.type==="route"?t=e.label||e.id:t=e.id;let s="";(l=e.meta)!=null&&l.isShared&&(s+='<span class="vs-impact-header-badge vs-impact-header-shared">Shared</span>');let n=Xe.get(e.id);n!=null&&n.is_global&&(s+='<span class="vs-impact-header-badge vs-impact-header-global">Global</span>');let o=[];gu(e,o),fu(e.id,o);let i=o.filter(d=>!d.collapsed).map(d=>d.html),a=o.filter(d=>d.collapsed).map(d=>d.html);return`
    <div class="vs-impact-detail-content">
      <div class="vs-impact-detail-header">
        ${t?`<p class="vs-impact-detail-subtitle">${y(t)}</p>`:""}
        ${s?`<div class="vs-impact-detail-badges">${s}</div>`:""}
      </div>
      ${i.join("")}
      ${a.join("")}
    </div>
  `}function qd(e,t){var i;let s=(i=oe)==null?void 0:i.nodes.get(e);if(!s)return;_s(),ps(),vs();let n=e;if(s.type==="page"&&(n=nn(e),!n)||s.type!=="page"&&s.type!=="route")return;en(n),tn(e),Is(""),xi(!0),Ee("idle"),tt(null),St(null);let o=oe.edgesByTarget.get(n)||[];for(let a of o)if(a.type==="links_to"){let r=oe.nodes.get(a.source);(r==null?void 0:r.type)==="partial"&&!Xe.has(a.source)&&cu(a.source,t)}}function Hs(){en(null),tn(null),Is(""),Ee("idle"),tt(null),St(null)}function Fd(e){var s;let t=(s=oe)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(_s(),Hs(),vs(),ps(),cd(!0),$i(!0),Ee("idle"),tt(null),St(null))}function Lo(){ps(),Ee("idle"),tt(null),St(null)}function zd(e){var s;let t=(s=oe)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(Hs(),ps(),vs(),_s(),bd(!0),yd(t.label||""))}function Sn(){_s()}function Ud(e){var s,n;let t=(s=oe)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(n=t.meta)!=null&&n.isHomepage||(Hs(),ps(),_s(),vs(),wd(!0))}function _i(){vs()}async function cu(e,t){if(Xe.has(e))return;let{ok:s,data:n}=await $.get("/site-graph/blast-radius?node="+encodeURIComponent(e));s&&n&&!Xe.has(e)&&(Xe.set(e,n),t&&t())}function pu(){var p;let e=(p=oe)==null?void 0:p.nodes.get(Dt);if(!e)return Hs(),pe?Ja():Ln();let t=e.label||e.id,s=t==="/"||e.id==="route:/";if(ze==="success"&&Ke)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${E.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">URL updated</p>
            <p class="vs-sc-form-result-detail">${y(Ke.oldPath)} \u2192 ${y(Ke.newPath)}</p>
            ${Ke.referenceCount>0?`<p class="vs-sc-form-result-detail">${Ke.referenceCount} reference${Ke.referenceCount!==1?"s":""} updated across ${(Ke.updatedFiles||[]).length} file${(Ke.updatedFiles||[]).length!==1?"s":""}</p>`:""}
            ${Ke.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `;if(ze==="error"&&wn)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${E.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${y(wn.message||"Unknown error")}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-proposal">Dismiss</button>
        </div>
      </div>
    `;if(ze==="applying")return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Applying\u2026</span>
        </div>
      </div>
    `;let n=Za(Ms,t),i=(oe.edgesByTarget.get(Dt)||[]).filter(c=>c.type==="links_to"),a=new Set(i.map(c=>c.source)),r="";s?r=`
      <div class="vs-sc-form-actions">
        <div class="vs-sc-form-hint">Homepage URL cannot be renamed.</div>
      </div>
    `:ze==="armed"?r=`
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
    `;let l=ze==="armed"?"disabled":"",d="";n.message&&(d=`<div class="vs-sc-form-hint ${n.valid?"is-valid":"is-error"}">${n.message}</div>`);let v="";if(!s&&i.length>0){let c=i.length,m=a.size;v=`
      <div class="vs-sc-delete-section">
        <div class="vs-sc-delete-section-header">
          <span class="vs-sc-form-label" title="Links to this URL in other files will be automatically updated">References updated</span>
          <span class="vs-sc-delete-section-count">${c} across ${m} file${m!==1?"s":""}</span>
        </div>
        ${vu(i,n)}
      </div>
    `}else!s&&i.length===0&&Ms&&(v='<div class="vs-sc-form-hint">No references to update.</div>');return`
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
          value="${y(Ms)}"
          ${l}
        />
        ${d}
      </div>
      ${v}
      ${r}
    </div>
  `}function Za(e,t){if(!e||!e.trim())return{valid:!1,cleanPath:"",message:""};let s=e.trim();if(s.startsWith("/")&&(s=s.slice(1)),s.endsWith("/")&&(s=s.slice(0,-1)),s.includes("/"))return{valid:!1,cleanPath:"/"+s,message:"Nested paths (e.g. /services/web-design) are not supported yet"};s.endsWith(".php")&&(s=s.slice(0,-4));let n=s.toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");if(!n)return{valid:!1,cleanPath:"/",message:"Path cannot be empty after normalization"};let o="/"+n,a=s.toLowerCase()!==n?` (normalized from "${s}")`:"",r=t.replace(/\/$/,"")||"/";if(o===r)return{valid:!1,cleanPath:o,message:"New path is the same as the current path"};if(oe){for(let[,l]of oe.nodes)if(l.type==="route"&&l.id!==Dt){let d=(l.label||l.id).replace(/\/$/,"")||"/";if(o===d)return{valid:!1,cleanPath:o,message:`Path conflicts with existing route: ${d}`}}}return{valid:!0,cleanPath:o,message:`\u2713 ${o}${a}`}}function vu(e,t){let s=new Map;for(let o of e)s.has(o.source)||s.set(o.source,[]),s.get(o.source).push(o);let n='<div class="vs-proposal-groups">';for(let[o,i]of s)n+=uu(o,i,t);return n+="</div>",n}function uu(e,t,s){var l;let n=oe.nodes.get(e);if(!n)return"";let o=n.type.charAt(0).toUpperCase()+n.type.slice(1),i=t.length,a="";if(n.type==="partial"){let d=((l=n.meta)==null?void 0:l.includeCount)??0;a=`Used by ${d} file${d!==1?"s":""}`;let v=Xe.get(e);v&&(a+=` \xB7 Affects ${v.affected_count} page${v.affected_count!==1?"s":""}`)}let r=[...t].sort((d,v)=>{var p,c;return(((p=d.meta)==null?void 0:p.lineNumber)||0)-(((c=v.meta)==null?void 0:c.lineNumber)||0)});return`<div class="vs-proposal-group">
    <div class="vs-proposal-group-header">
      <span class="vs-impact-type-badge vs-impact-type-${n.type}">${o}</span>
      <span class="vs-proposal-group-label" data-navigate-node="${y(e)}">${y(n.label||n.id)}</span>
      <span class="vs-proposal-group-count">${i} ref${i!==1?"s":""}</span>
    </div>
    ${a?`<div class="vs-proposal-group-meta">${a}</div>`:""}
    <div class="vs-proposal-group-refs">
      ${r.map(d=>mu(d,s)).join("")}
    </div>
  </div>`}function mu(e,t){var a,r,l;let s=(a=e.meta)!=null&&a.lineNumber?`L${e.meta.lineNumber}`:"",n=((r=e.meta)==null?void 0:r.href)||"",o=((l=e.meta)==null?void 0:l.context)||"body",i="";if(t.valid){let d=n.replace(/[?#].*/,""),v=d!=="/"&&d.endsWith("/"),p=n.match(/[?#].*/),c=p?p[0]:"",m=t.cleanPath;v&&!m.endsWith("/")&&(m+="/"),m+=c,i=`<span class="vs-proposal-ref-arrow">\u2192 ${y(m)}</span>`}return`<div class="vs-proposal-ref">
    <span class="vs-proposal-ref-line">${s}</span>
    <span class="vs-proposal-ref-href">${y(n)}</span>
    <span class="vs-proposal-ref-context">${o}</span>
    ${i}
  </div>`}function gu(e,t){let s=oe.edgesBySource.get(e.id)||[],n=oe.edgesByTarget.get(e.id)||[],o=t.length;switch(e.type){case"page":{let i=s.filter(d=>d.type==="includes");i.length>0&&t.push(jt("Direct Includes",i.map(d=>({nodeId:d.target,label:wt(d.target),type:Tt(d.target)}))));let a=[];for(let d of i){let v=oe.edgesBySource.get(d.target)||[];for(let p of v)p.type==="includes"&&a.push({nodeId:p.target,label:wt(p.target),type:Tt(p.target),via:wt(d.target)})}a.length>0&&t.push(jt("Transitive Includes",a));let r=s.filter(d=>d.type==="links_to");r.length>0&&t.push(jt("Links To",r.map(d=>{var v,p;return{nodeId:d.target,label:wt(d.target),type:Tt(d.target),meta:(v=d.meta)!=null&&v.href?`\u2192 ${d.meta.href}`:null,context:((p=d.meta)==null?void 0:p.context)||null}})));let l=nn(e.id);if(l){let v=(oe.edgesByTarget.get(l)||[]).filter(p=>p.type==="links_to");v.length>0&&t.push(jt("Linked From",v.map(p=>{var c,m;return{nodeId:p.source,label:wt(p.source),type:Tt(p.source),meta:(c=p.meta)!=null&&c.href?`\u2192 ${p.meta.href}`:null,context:((m=p.meta)==null?void 0:m.context)||null}})))}break}case"partial":{let i=n.filter(l=>l.type==="includes");i.length>0&&t.push(jt("Included By",i.map(l=>({nodeId:l.source,label:wt(l.source),type:Tt(l.source)}))));let a=s.filter(l=>l.type==="includes");a.length>0&&t.push(jt("Includes",a.map(l=>({nodeId:l.target,label:wt(l.target),type:Tt(l.target)}))));let r=s.filter(l=>l.type==="links_to");r.length>0&&t.push(jt("Links To",r.map(l=>{var d,v;return{nodeId:l.target,label:wt(l.target),type:Tt(l.target),meta:(d=l.meta)!=null&&d.href?`\u2192 ${l.meta.href}`:null,context:((v=l.meta)==null?void 0:v.context)||null}})));break}case"route":{let i=s.filter(r=>r.type==="serves");i.length>0&&t.push(jt("Serves",i.map(r=>({nodeId:r.target,label:wt(r.target),type:Tt(r.target)}))));let a=n.filter(r=>r.type==="links_to");a.length>0&&t.push(jt("Linked From",a.map(r=>{var l,d;return{nodeId:r.source,label:wt(r.source),type:Tt(r.source),meta:(l=r.meta)!=null&&l.href?`\u2192 ${r.meta.href}`:null,context:((d=r.meta)==null?void 0:d.context)||null}})));break}case"token":{let i=n.filter(a=>a.type==="consumes_token");i.length>0&&t.push(jt("Consumed By",i.map(a=>({nodeId:a.source,label:wt(a.source),type:Tt(a.source)}))));break}case"asset":{let i=s.filter(a=>a.type==="consumes_token");i.length>0&&t.push(jt("Consumes Tokens",i.map(a=>({nodeId:a.target,label:wt(a.target),type:Tt(a.target)}))));break}}t.length===o&&t.push({collapsed:!1,html:'<p class="vs-impact-no-relations">No relationships found.</p>'})}function jt(e,t){let s=e.toLowerCase().replace(/\s+/g,"-"),n=Wa(s),i=`
    <div class="vs-impact-card${n?" is-collapsed":""}">
      <button class="vs-impact-card-header" data-card-toggle="${s}">
        <span class="vs-impact-card-chevron">${E.chevronDown}</span>
        <span class="vs-impact-card-title">${y(e)}</span>
        <span class="vs-impact-card-count">${t.length}</span>
      </button>
      <div class="vs-impact-card-list">
        ${t.map(a=>{let r=`vs-impact-ref-type-${a.type}`;return`
            <button class="vs-impact-ref-item" data-node-id="${y(a.nodeId)}">
              <span class="vs-impact-ref-type ${r}">${a.type}</span>
              <span class="vs-impact-ref-label">${y(a.label)}</span>
              ${a.via?`<span class="vs-impact-transitive-via">(via ${y(a.via)})</span>`:""}
              ${a.meta?`<span class="vs-impact-ref-meta">${y(a.meta)}</span>`:""}
            </button>
            ${a.context?`<div class="vs-impact-ref-context">${y(a.context)}</div>`:""}
          `}).join("")}
      </div>
    </div>
  `;return{collapsed:n,html:i}}function fu(e,t){let s="blast-radius";if(fo===e){t.push({collapsed:!1,html:`
      <div class="vs-impact-card vs-impact-blast-card">
        <button class="vs-impact-card-header" data-card-toggle="${s}">
          <span class="vs-impact-card-chevron">${E.chevronDown}</span>
          <span class="vs-impact-card-title">Blast Radius</span>
        </button>
        <div class="vs-impact-blast-loading">
          <div class="vs-site-spinner" style="width:16px;height:16px"></div>
          <span>Computing\u2026</span>
        </div>
      </div>
    `});return}let n=Xe.get(e);if(!n)return;let{affected_pages:o=[],affected_count:i=0,total_pages:a=0,is_global:r=!1}=n,l=Wa(s),d=l?" is-collapsed":"";t.push({collapsed:l,html:`
    <div class="vs-impact-card vs-impact-blast-card${d}">
      <button class="vs-impact-card-header" data-card-toggle="${s}">
        <span class="vs-impact-card-chevron">${E.chevronDown}</span>
        <span class="vs-impact-card-title">Blast Radius</span>
        <span class="vs-impact-card-count">${i} / ${a}</span>
        ${r?'<span class="vs-impact-blast-global">GLOBAL</span>':""}
      </button>
      <div class="vs-impact-card-list">
        ${o.map(v=>`
          <button class="vs-impact-ref-item" data-node-id="${y(v.id)}">
            <span class="vs-impact-ref-type vs-impact-ref-type-page">page</span>
            <span class="vs-impact-ref-label">${y(v.label||v.id)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `})}function hu(){var l;let e=(l=oe)==null?void 0:l.nodes.get(pe);if(!e)return Lo(),pe?Ja():Ln();let t=y(e.label||e.id);if(Ei)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Loading navigation\u2026</span>
        </div>
      </div>
    `;if(ze==="success"&&Ke){let d=!!Ke.movedPages,v=d?"Page moved":"Navigation updated",p="";if(d){let c=Ke.totalPagesMoved||1,m=Ke.totalAffectedReferences||0,f=[];f.push(`Moved ${c} page${c!==1?"s":""}`),m>0&&f.push(`updated ${m} reference${m!==1?"s":""}`),p=f.join(", ")}else p=y(Ke.message||"Page order has been changed.");return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${E.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">${v}</p>
            <p class="vs-sc-form-result-detail">${p}</p>
            ${Ke.normalized?'<p class="vs-sc-form-result-detail">Navigation was standardized</p>':""}
            ${Ke.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `}if(ki)return Co(t,"The homepage is always first and cannot be reordered.");if(kn==="nav_missing")return Co(t,"No navigation file found.");if(kn==="unsupported_layout")return Co(t,"This navigation layout doesn't support reordering yet.");if(kn==="nav_parse_error")return Co(t,"The navigation file has a problem and can't be read right now.");if(!wi)return Co(t,"This page isn't in the navigation yet.");let s=yu(e),n=bu(e),o=bo?'<div class="vs-sc-form-hint">Navigation will be standardized first. Current links and order are preserved.</div>':"",i="";ze==="error"&&wn&&(i=`
      <div class="vs-sc-form-result is-error">
        <div class="vs-sc-form-result-icon">${E.alertTriangle||"\u26A0"}</div>
        <div class="vs-sc-form-result-text">
          <p class="vs-sc-form-result-title">Move failed</p>
          <p class="vs-sc-form-result-detail">${y(wn.message||"Unknown error")}</p>
        </div>
      </div>
    `);let a=xu(),r="";return ze==="applying"?r=`
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-btn is-loading" disabled>
          <span class="vs-sc-move-loading-spinner"></span>
          Applying\u2026
        </button>
      </div>
    `:ze==="armed"?r=`
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
        <button class="vs-sc-form-btn" data-action="apply-move-arm">${bo?"Standardize & move":"Apply"}</button>
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
  `}function Co(e,t){return`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Move</h3>
      <p class="vs-sc-form-context">${y(t)}</p>
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Dismiss</button>
      </div>
    </div>
  `}function bu(e){var o,i;if(!xt||xt.length===0)return"";let t=(o=e.meta)!=null&&o.isHomepage?"/":"/"+(((i=e.meta)==null?void 0:i.slug)||""),n=`
    <button class="vs-move-parent-option ${at===null?"is-selected":""}"
            data-action="select-move-parent" data-parent-href="__root__">
      Root
    </button>
  `;for(let a of xt){if(a.href===t)continue;let r=at===a.href;n+=`
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
  `}function yu(e){var v,p,c,m,f;if(at===void 0||!xt)return"";let t=(v=e.meta)!=null&&v.isHomepage?"/":"/"+(((p=e.meta)==null?void 0:p.slug)||""),s=e.label||((c=e.meta)==null?void 0:c.slug)||"",n=[];if(at===null)n=xt.filter(u=>u.href!==t);else for(let u of xt)if(u.href===at){n=(u.children||[]).filter(h=>h.href!==t);break}if(n.length===0)return`
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label">Position</label>
        <div class="vs-move-position-strip">
          <div class="vs-move-strip-pill is-self">${y(s)}</div>
        </div>
        <div class="vs-sc-form-hint">Only page at this level</div>
      </div>
    `;let o=Vt??n.length,i=[...n];i.splice(o,0,{href:t,label:s,isSelf:!0});let a=o>0,r=o<n.length,l=i.map(u=>u.isSelf?`<div class="vs-move-strip-pill is-self">${y(u.label)}</div>`:`<div class="vs-move-strip-pill">${y(u.label)}</div>`).join(""),d="";if(o===0)d="First in navigation";else if(o>=n.length)d="Last in navigation";else{let u=((m=n[o-1])==null?void 0:m.label)||"",h=((f=n[o])==null?void 0:f.label)||"";d=`After ${u}, before ${h}`}return`
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
      <div class="vs-sc-form-hint">${y(d)}</div>
    </div>
  `}function xu(){return!Ht||at===void 0||Vt===null?!1:at===Ht.parentHref&&Vt===Ht.index}function wu(){var n;let e=(n=oe)==null?void 0:n.nodes.get(pe);if(!e)return Ln();let t=y(e.label||""),s=y(Ci);if(En==="success"&&xo){let o=xo,i=o.navLabelUpdated?'<p class="vs-sc-form-result-detail">Nav label updated</p>':"";return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${E.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Page renamed</p>
            <p class="vs-sc-form-result-detail">"${y(o.oldTitle)}" \u2192 "${y(o.newTitle)}"</p>
            ${i}
          </div>
        </div>
      </div>
    `}return En==="error"&&yo?`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${E.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${y(yo)}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-rename">Dismiss</button>
        </div>
      </div>
    `:En==="applying"?`
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
  `}function ku(){var v,p;let e=(v=oe)==null?void 0:v.nodes.get(pe);if(!e)return Ln();let t=y(e.label||""),s=e.id.replace("page:","");if(mt==="success"&&ko){let c=ko;return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${E.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">"${y(((p=c.deletedPage)==null?void 0:p.title)||"")}" has been removed</p>
            ${c.navEntryRemoved?'<p class="vs-sc-form-result-detail">Nav entry removed</p>':""}
            ${c.navChildrenPromoted>0?`<p class="vs-sc-form-result-detail">${c.navChildrenPromoted} child nav ${c.navChildrenPromoted===1?"entry":"entries"} promoted</p>`:""}
            ${c.referencesCleanedUp>0?`<p class="vs-sc-form-result-detail">${c.referencesCleanedUp} ${c.referencesCleanedUp===1?"file":"files"} cleaned up</p>`:""}
            ${c.totalAffectedReferences>0&&!c.referencesCleanedUp?`<p class="vs-sc-form-result-detail">${c.totalAffectedReferences} ${c.totalAffectedReferences===1?"reference":"references"} may need review</p>`:""}
            ${c.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `}if(mt==="error"&&wo)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${E.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Delete failed</p>
            <p class="vs-sc-form-result-detail">${y(wo)}</p>
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-delete">Dismiss</button>
        </div>
      </div>
    `;if(mt==="applying")return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Deleting page\u2026</span>
        </div>
      </div>
    `;let n=nn(pe),o=[];if(n){let c=oe.edgesByTarget.get(n)||[],m=new Map;for(let f of c)if(f.type==="links_to"){let u=oe.nodes.get(f.source);if(u){let h=m.get(f.source)||{id:f.source,label:u.label||f.source,type:u.type,count:0};h.count++,m.set(f.source,h)}}o=Array.from(m.values())}let i=o.reduce((c,m)=>c+m.count,0),a="";mt==="armed"?a=`
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
    `;let l=[{label:`Page file: ${y(s)}`,icon:E.fileText},{label:"Database entry",icon:E.database}].map(c=>`
    <li class="vs-sc-delete-checklist-item">
      <span class="vs-sc-delete-checklist-icon">${c.icon}</span>
      <span>${c.label}</span>
    </li>
  `).join(""),d="";if(o.length>0){let c=o.filter(u=>u.type!=="partial"),m=o.filter(u=>u.type==="partial"),f="";if(c.length>0){let u=c.map(h=>`<span class="vs-sc-delete-ref-chip">${y(h.label)}</span>`).join("");f+=`
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Links to this page will have their href set to # \u2014 the element and its styling are preserved">Unlinked</span>
          <div class="vs-sc-delete-ref-chips">${u}</div>
        </div>
      `}if(m.length>0){let u=m.map(h=>`<span class="vs-sc-delete-ref-chip">${y(h.label)}</span>`).join("");f+=`
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Navigation and footer entries linking to this page will be fully removed">Removed</span>
          <div class="vs-sc-delete-ref-chips">${u}</div>
        </div>
      `}d=`
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
      ${d}
      ${a}
    </div>
  `}var Ai=null;function Gd(){return setTimeout(()=>Qa(),0),`
    <div id="vs-site-root" style="height: 100%;">
      <div class="vs-site-loading">
        <div class="vs-site-spinner"></div>
        <span>Building site structure\u2026</span>
      </div>
    </div>
  `}async function Qa(){var o;let e=document.getElementById("vs-site-root");if(!e)return;let{ok:t,data:s}=await $.get("/site-graph");if(!t||!s){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">${E.globe}</div>
          <p class="vs-empty-state-title">Could not load site graph</p>
          <p class="vs-empty-state-desc">Check that your site has pages in the preview directory.</p>
          <button id="vs-site-retry" class="vs-btn vs-btn-primary vs-btn-sm">Retry</button>
        </div>
      </div>
    `,(o=document.getElementById("vs-site-retry"))==null||o.addEventListener("click",()=>Qa());return}Ss(Rs(s)),ja(""),Xe.clear(),yi(null),en(null),tn(null),Is(""),cs(us());let n=Ed();n&&oe.nodes.has(n)?(Ut(n),n.startsWith("page:")&&ls(n),Tn(n)):(Ut(null),ls(null),Si(null)),Kd(e)}function Kd(e){e.innerHTML=`
    <div class="vs-site-workspace vs-sc-three-panel">
      <div class="vs-sc-left" id="vs-sc-left"${Ka("left")}>
        ${Bd(ds)}
        <div class="vs-editor-resize" data-resize-panel="vs-sc-left"></div>
      </div>
      <div class="vs-sc-canvas" id="vs-sc-canvas">
        <div class="vs-sc-canvas-diagram">
          <div class="vs-site-diagram" id="vs-site-diagram">
            ${Pd(ds)}
          </div>
          <div class="vs-sc-status-bar" id="vs-sc-status-bar">
            ${Eu()}
          </div>
        </div>
        ${jd()}
      </div>
      <div class="vs-sc-right" id="vs-sc-right"${Ka("right")}>
        <div class="vs-editor-resize" data-resize-panel="vs-sc-right" data-resize-side="left"></div>
        ${Od()}
      </div>
    </div>
  `,_u(e),requestAnimationFrame(()=>requestAnimationFrame(()=>Cn(ds)))}function Eu(){if(!oe)return"";let e=0,t=0,s=0;for(let[,d]of oe.nodes)d.type==="page"?e++:d.type==="partial"?t++:d.type==="route"&&s++;let n=`${e} page${e!==1?"s":""} \xB7 ${t} partial${t!==1?"s":""} \xB7 ${s} route${s!==1?"s":""}`,o=0;for(let[,d]of oe.nodes)d.type==="page"&&((oe.edgesByTarget.get(d.id)||[]).some(p=>p.type==="serves")||o++);let i=o===0,a=i?"vs-sc-status-healthy":"vs-sc-status-warning",r=i?"Healthy":`${o} unlinked`,l="";if(pe){let d=oe.nodes.get(pe);d&&(l=`${y(d.label||d.id)} selected`)}else if(oe.builtAt){let d=Math.round((Date.now()-new Date(oe.builtAt).getTime())/1e3);l=d<60?`Graph built ${d}s ago`:`Graph built ${Math.round(d/60)}m ago`}else oe.buildTimeMs&&(l=`Built in ${oe.buildTimeMs}ms`);return`
    <span class="vs-sc-status-stat">
      <span class="vs-sc-status-dot ${a}"></span>
      ${n}
      <span class="vs-sc-status-sep">\xB7</span>
      <span class="${a}">${r}</span>
    </span>
    <span class="vs-sc-status-stat">${l}</span>
  `}function So(e){Dt&&(en(null),tn(null),Is(""),Ee("idle"),tt(null),St(null)),sn&&(ps(),Ee("idle"),tt(null),St(null)),Bs&&Sn(),As&&_i(),Ut(e),Si(e),e&&e.startsWith("page:")&&ls(e),e&&Tn(e),X()}function To(){en(null),tn(null),Is(""),Ee("idle"),tt(null),St(null),sn&&ps(),Bs&&_s(),As&&vs(),Ut(null),Si(null),X()}async function Tn(e){if(Xe.has(e))return;yi(e),X();let{ok:t,data:s}=await $.get("/site-graph/blast-radius?node="+encodeURIComponent(e));fo===e&&(yi(null),t&&s&&Xe.set(e,s),X())}async function $u(){var a,r,l,d;if((a=window.demoGuard)!=null&&a.call(window)||!Dt||!Ms)return;let e=(r=oe)==null?void 0:r.nodes.get(Dt),t=(e==null?void 0:e.label)||(e==null?void 0:e.id)||"",s=Za(Ms,t);if(!s.valid){Ee("idle"),X();return}Ee("applying"),tt(null),X();let{ok:n,data:o,error:i}=await $.post("/site-control/url-rename",{routeId:Dt,newPath:s.cleanPath});if(n&&o){Ee("success"),St(o),dd(o.suggestedPrompt||null),o.newPageId&&(Ut(o.newPageId),ls(o.newPageId));let v=await $.get("/site-graph");if(v.ok&&v.data&&(Ss(Rs(v.data)),Xe.clear(),cs(us())),o.newPageId&&Tn(o.newPageId),o.oldPath&&o.newPath){let p=o.oldPath.replace(/^\//,"")+".php",c=o.newPath.replace(/^\//,"")+".php";(d=(l=window.__vsEditorPage)==null?void 0:l.reconcileMove)==null||d.call(l,p,c)}X(),setTimeout(()=>{Hs(),X()},1500)}else Ee("error"),tt(i||{message:"An unknown error occurred."}),X()}async function Cu(e){Fd(e),X();let{ok:t,data:s}=await $.get("/site-control/nav-preflight?pageId="+encodeURIComponent(e));if($i(!1),!t||!s){za("nav_parse_error"),X();return}za(s.navStatus||null),fd(s.isInNav||!1),hd(s.isHomepage||!1),vd(s.currentPosition||null),ud(s.navTree||null),gd(s.hasHomeEntry||!1),pd(s.navStatus==="needs_normalization"),s.currentPosition&&(Fa(s.currentPosition.parentHref??null),ho(s.currentPosition.index??0)),X()}async function Lu(){var s,n,o,i,a,r,l,d,v;if((s=window.demoGuard)!=null&&s.call(window)||!pe||Vt===null)return;let e=((n=Ht)==null?void 0:n.parentHref)??null,t=at!==e;if(Ee("applying"),tt(null),X(),t){let p=at?at.replace(/^\//,""):"",{ok:c,data:m,error:f}=await $.post("/site-control/structural-move",{pageId:pe,targetParent:p});if(c&&m){if(Ee("success"),St(m),((o=m.movedPages)==null?void 0:o.length)>0&&window.__vsEditorPage)for(let w of m.movedPages)(a=(i=window.__vsEditorPage).reconcileMove)==null||a.call(i,w.oldFilePath,w.newFilePath);let u=await $.get("/site-graph");u.ok&&u.data&&(Ss(Rs(u.data)),Xe.clear(),cs(us()));let h=pe;((r=m.movedPages)==null?void 0:r.length)>0&&(h="page:"+m.movedPages[0].newFilePath,Ut(h),ls(h),Tn(h));let g=await $.post("/site-control/nav-reorder",{pageId:h,targetParentHref:at,targetIndex:Vt});if(!g.ok&&((l=g.error)==null?void 0:l.code)!=="no_change"&&((d=g.error)==null?void 0:d.code)!=="page_not_in_nav"){Ee("error"),tt({message:"Page moved successfully, but could not set the requested position: "+(((v=g.error)==null?void 0:v.message)||"Unknown error")}),X();return}let k=await $.get("/site-graph");k.ok&&k.data&&(Ss(Rs(k.data)),Xe.clear(),cs(us())),X(),setTimeout(()=>{Lo(),X()},1500)}else Ee("error"),tt(f||{message:"An unknown error occurred."}),X()}else{let p={pageId:pe,targetParentHref:at,targetIndex:Vt},{ok:c,data:m,error:f}=await $.post("/site-control/nav-reorder",p);if(c&&m){Ee("success"),St(m);let u=pe;Ut(u),ls(u);let h=await $.get("/site-graph");h.ok&&h.data&&(Ss(Rs(h.data)),Xe.clear(),cs(us())),Tn(u),X(),setTimeout(()=>{Lo(),X()},1500)}else Ee("error"),tt(f||{message:"An unknown error occurred."}),X()}}async function Vd(e){var i;if((i=window.demoGuard)!=null&&i.call(window)||!pe||!e)return;Li("applying"),Ua(null),X();let t={pageId:pe,newTitle:e},{ok:s,data:n,error:o}=await $.post("/site-control/page-rename",t);if(s&&n){Li("success"),xd(n);let a=pe;Ut(a),ls(a);let r=await $.get("/site-graph");r.ok&&r.data&&(Ss(Rs(r.data)),Xe.clear(),cs(us())),Tn(a),X(),setTimeout(()=>{Sn(),X()},1500)}else Li("error"),Ua((o==null?void 0:o.message)||"An unknown error occurred."),X()}async function Su(){var n;if((n=window.demoGuard)!=null&&n.call(window)||!pe)return;Nt("applying"),Va(null),X();let{ok:e,data:t,error:s}=await $.post("/site-control/page-delete",{pageId:pe});e&&t?(Nt("success"),kd(t),X(),setTimeout(async()=>{var a,r,l;let o=(a=t.deletedPage)==null?void 0:a.filePath;o&&((l=(r=window.__vsEditorPage)==null?void 0:r.reconcileDelete)==null||l.call(r,o)),Ut(null),ls(null);let i=await $.get("/site-graph");i.ok&&i.data&&(Ss(Rs(i.data)),Xe.clear(),cs(us())),vs(),X()},1800)):(Nt("error"),Va((s==null?void 0:s.message)||"An unknown error occurred."),X())}function Tu(e){let t=document.querySelector(`.vs-site-tree-group[data-tree-group="${e}"]`);gt.has(e)?(gt.delete(e),t&&t.classList.remove("is-collapsed")):(gt.add(e),t&&t.classList.add("is-collapsed"))}function X(){var l,d,v;let e=document.getElementById("vs-site-root");if(!e)return;let t=((l=document.activeElement)==null?void 0:l.id)==="vs-proposal-url",s=t?document.activeElement.selectionStart:null,n=((d=document.activeElement)==null?void 0:d.id)==="vs-sc-rename-input",o=n?document.activeElement.value:null,i=n?document.activeElement.selectionStart:null,a=((v=document.activeElement)==null?void 0:v.id)==="vs-sc-search",r=a?document.activeElement.selectionStart:null;if(Kd(e),t){let p=document.getElementById("vs-proposal-url");p&&(p.focus(),s!==null&&p.setSelectionRange(s,s))}if(n){let p=document.getElementById("vs-sc-rename-input");p&&(p.value=o,p.focus(),i!==null&&p.setSelectionRange(i,i))}if(a){let p=document.getElementById("vs-sc-search");p&&(p.focus(),r!==null&&p.setSelectionRange(r,r))}}async function Wd(e){kt("running"),Bi(e),Xa(),Gt(null),$o(null),X(),setTimeout(()=>{var t;return(t=document.getElementById("vs-sc-composer-input"))==null?void 0:t.focus()},0);try{await qt("/site-control/orchestrate",{prompt:e},{onStatus(t){on({type:"info",message:t.message||"Processing\u2026",time:Date.now()}),Xd()},onDone(t){if(Le==="running"){on({type:"done",message:t.summary||t.message||"Done.",time:Date.now()});let s=t.discovery||null,n=t.intent||null,o=t.plan||null,i=s&&Array.isArray(s.candidates)&&s.candidates.length>0,a=o&&Array.isArray(o.edits)?o.edits:[],l=a.filter(d=>d.anchored!==!1).length>0;i?($o({intent:n,files:s.candidates.map(d=>({type:d.type||"file",path:d.file||d.node_id,label:d.label||"",reason:d.reason||""})),affected_pages:(s.affected_pages||[]).map(d=>({label:d.label||"",slug:d.slug||""})),skipped:(s.skipped||[]).map(d=>({path:d.path||"",reason:d.reason||""})),edits:a,risk_level:(o==null?void 0:o.risk_level)||"medium",plan_summary:(o==null?void 0:o.summary)||"",anchored_count:(o==null?void 0:o.anchored_count)||0,unanchored_count:(o==null?void 0:o.unanchored_count)||0}),l?kt("plan"):kt("plan_failed")):kt("complete"),Gt({filesChanged:t.filesChanged||0,summary:t.summary||t.message||"Orchestration complete."}),X()}},onError(t){kt("complete"),Gt({filesChanged:0,summary:t.message||"Orchestration failed."}),on({type:"error",message:t.message||"Error during orchestration.",time:Date.now()}),X()}})}catch{kt("complete"),Gt({filesChanged:0,summary:"Connection error."}),on({type:"error",message:"Connection lost during orchestration.",time:Date.now()}),X()}}async function Mu(){if(!Ue||!Ue.edits)return;let e=Ue.edits.filter(t=>t.anchored!==!1);if(e.length!==0){kt("applying"),X();try{await qt("/site-control/apply",{edits:e},{onStatus(t){on({phase:t.phase||"status",status:t.status||"ok",file:t.file||"",message:t.message||"",bytes:t.bytes||null,ms:t.ms||null,time:Date.now()}),Xd()},onDone(t){let s=t.filesChanged||0;kt("applied"),Gt({filesChanged:s,summary:t.message||"Done.",verification:t.verification||[],duration_ms:t.duration_ms||null}),X(),Qa()},onError(t){kt("apply_failed"),Gt({filesChanged:0,summary:t.message||"Patch execution failed.",rollback_clean:t.rollback_clean!==!1,verification:t.verification||[],duration_ms:t.duration_ms||null}),X()}})}catch{kt("apply_failed"),Gt({filesChanged:0,summary:"Connection error during apply."}),on({phase:"failed",status:"error",message:"Connection lost during apply.",time:Date.now()}),X()}}}var Iu={start:"\u25B6",snapshot:"\u25CE",read:"\u2193",anchor:"\u2693",patch:"\u270E",lint:"\u2318",verify:"\u2714",reject:"\u2298",rollback:"\u21BA",done:"\u2713",failed:"\u2717",abort:"\u2298"},Bu={ok:"is-ok",failed:"is-failed",error:"is-failed",skip:"is-skip",refused:"is-refused",start:"is-info",partial:"is-warning"};function Xd(){let e=document.getElementById("vs-sc-console-log");if(!e)return;let t=Ds.map(s=>{if(s.phase){let i=Iu[s.phase]||"\xB7",a=Bu[s.status]||"",r=s.file?`<span class="vs-sc-log-file">${s.file.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span> `:"",l=s.ms!=null?`<span class="vs-sc-log-meta">${s.ms}ms</span>`:s.bytes!=null?`<span class="vs-sc-log-meta">${s.bytes}b</span>`:"",d=(s.message||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");return`<div class="vs-sc-log-entry vs-sc-log-phase ${a}">
        <span class="vs-sc-log-icon">${i}</span>
        <span class="vs-sc-log-phase-name">${s.phase}</span>
        ${r}<span class="vs-sc-log-text">${d}</span>
        ${l}
      </div>`}let n=s.type==="running"?"is-running":s.type==="done"?"is-done":s.type==="error"?"is-error":s.type==="skipped"?"is-skipped":s.type==="plan"?"is-plan":"",o=s.type==="running"?"\u2192":s.type==="done"?"\u2713":s.type==="error"?"\u2717":s.type==="skipped"?"\u2298":s.type==="plan"?"\u25C6":s.type==="info"?"\u2192":"\xB7";return`<div class="vs-sc-log-entry ${n}">
      <span class="vs-sc-log-icon">${o}</span>
      <span class="vs-sc-log-text">${s.message.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span>
    </div>`}).join("");e.innerHTML=t,e.scrollTop=e.scrollHeight}function _u(e){let t=e.querySelector("#vs-sc-search");if(t){let u;t.addEventListener("input",()=>{clearTimeout(u),u=setTimeout(()=>{var h;ja(t.value.trim()),cs(us()),X(),(h=document.getElementById("vs-sc-search"))==null||h.focus()},150)})}e.querySelectorAll(".vs-sc-nav-section-header[data-nav-section]").forEach(u=>{u.addEventListener("click",()=>{let h=u.dataset.navSection,g=u.closest(".vs-sc-nav-section");g&&(Ps.has(h)?(Ps.delete(h),g.classList.remove("is-collapsed")):(Ps.add(h),g.classList.add("is-collapsed")),Md())})}),e.querySelectorAll(".vs-site-tree-item[data-page-id]").forEach(u=>{u.addEventListener("click",h=>{if(h.target.closest(".vs-site-tree-toggle"))return;let g=u.dataset.pageId;g&&So(g)})}),e.querySelectorAll(".vs-site-tree-toggle[data-toggle-page]").forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation();let g=u.dataset.togglePage;g&&Tu(g)})}),e.querySelectorAll(".vs-impact-item[data-node-id]").forEach(u=>{u.addEventListener("click",()=>{let h=u.dataset.nodeId;h&&So(h)})}),e.querySelectorAll(".vs-site-card[data-page-id]").forEach(u=>{u.addEventListener("click",()=>{let h=u.dataset.pageId;h&&So(h)})});let s=e.querySelector("#vs-site-diagram");s&&s.addEventListener("click",u=>{if(u.target===s||u.target.classList.contains("vs-site-tiers")){if(ze==="armed"){Ee("idle"),X();return}if(mt==="armed"){Nt("idle"),X();return}To()}}),e.querySelectorAll('[data-action="close-inspect"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),To()})}),e.querySelectorAll(".vs-impact-ref-item[data-node-id]").forEach(u=>{u.addEventListener("click",()=>{let h=u.dataset.nodeId;h&&So(h)})}),e.querySelectorAll("[data-card-toggle]").forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation();let g=u.dataset.cardToggle;if(!g)return;let b=u.closest(".vs-impact-card"),k=b==null?void 0:b.classList.contains("is-collapsed");Ti.set(g,k?"open":"closed"),Cd(),X()})}),e.querySelectorAll('[data-action="overflow"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation();let g=u.closest(".vs-sc-action-overflow");if(!g)return;if(g.classList.toggle("is-open")){let k=x=>{g.contains(x.target)||(g.classList.remove("is-open"),document.removeEventListener("click",k,!0))},w=x=>{x.key==="Escape"&&(x.stopPropagation(),x.preventDefault(),g.classList.remove("is-open"),document.removeEventListener("keydown",w,!0),document.removeEventListener("click",k,!0))};setTimeout(()=>{document.addEventListener("click",k,!0),document.addEventListener("keydown",w,!0)},0)}})}),e.querySelectorAll(".vs-sc-action-bar [data-action]").forEach(u=>{let h=u.dataset.action;["change-url","move","reorder","rename","delete","overflow","open-in-editor","open-in-chat"].includes(h)||u.addEventListener("click",g=>{g.stopPropagation();let b=u.closest(".vs-sc-action-bar"),k=(b==null?void 0:b.dataset.forNode)||pe;console.log("Action stub:",h,k)})}),e.querySelectorAll('[data-action="open-in-editor"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation();let g=u.closest(".vs-sc-action-bar"),b=(g==null?void 0:g.dataset.forNode)||pe;if(!b)return;let k=b.startsWith("page:")?b.slice(5):b;window.__vsEditorPendingFile=k,window.location.hash="#/editor"})}),e.querySelectorAll('[data-action="open-in-chat"]').forEach(u=>{u.addEventListener("click",h=>{var x,C;h.stopPropagation();let g=u.closest(".vs-sc-action-bar"),b=(g==null?void 0:g.dataset.forNode)||pe;if(!b)return;let k=(x=oe)==null?void 0:x.nodes.get(b),w=((C=k==null?void 0:k.meta)==null?void 0:C.slug)||b.replace(/^page:/,"").replace(/\.php$/,"");R.set("activePageScope",w),window.location.hash="#/chat"})});let n=e.querySelector("#vs-sc-composer-input"),o=e.querySelector("#vs-sc-composer-submit");if(n){let u=()=>{n.style.height="auto",n.style.height=Math.min(n.scrollHeight,120)+"px"};n.addEventListener("input",()=>{Bi(n.value),u(),o&&(o.disabled=!n.value.trim()||Le==="running")}),n.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&(n.value.trim()&&Le!=="running"?(h.preventDefault(),Wd(n.value.trim())):h.preventDefault())})}o&&o.addEventListener("click",u=>{u.stopPropagation();let h=Eo.trim();h&&Le!=="running"&&Wd(h)});let i=e.querySelector("#vs-sc-console-toggle");i&&i.addEventListener("click",()=>{let u=Ya();Nd(!u),X()});let a=e.querySelector("#vs-sc-console-clear");a&&a.addEventListener("click",()=>{Xa(),kt("idle"),Gt(null),$o(null),Bi(""),X()});let r=e.querySelector("#vs-sc-console-resize"),l=e.querySelector("#vs-sc-console");r&&l&&r.addEventListener("mousedown",u=>{u.preventDefault();let h=u.clientY,g=l.offsetHeight,b=w=>{let x=h-w.clientY,C=Math.min(500,Math.max(120,g+x));l.style.height=C+"px"},k=()=>{document.removeEventListener("mousemove",b),document.removeEventListener("mouseup",k),Hd(l.offsetHeight),requestAnimationFrame(()=>Cn(ds))};document.addEventListener("mousemove",b),document.addEventListener("mouseup",k)});let d=e.querySelector("#vs-sc-orch-dismiss");d&&d.addEventListener("click",()=>{kt("idle"),Gt(null),$o(null),X()});let v=e.querySelector("#vs-sc-orch-apply");v&&v.addEventListener("click",()=>{Mu()}),e.querySelectorAll('[data-action="rename"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),pe&&(zd(pe),X(),setTimeout(()=>{let g=document.getElementById("vs-sc-rename-input");g&&(g.focus(),g.select())},50))})}),e.querySelectorAll('[data-action="close-rename"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),Sn(),X()})});let p=e.querySelector("#vs-sc-rename-input");if(p){let u=()=>{var x;let h=p.value.trim(),g=document.getElementById("vs-sc-rename-submit"),b=document.getElementById("vs-sc-rename-hint"),k=(x=oe)==null?void 0:x.nodes.get(pe),w=(k==null?void 0:k.label)||"";h?h===w?(g&&(g.disabled=!0),b&&(b.textContent="Same as current title",b.className="vs-sc-form-hint is-neutral")):(g&&(g.disabled=!1),b&&(b.textContent="",b.className="vs-sc-form-hint")):(g&&(g.disabled=!0),b&&(b.textContent="Title cannot be empty",b.className="vs-sc-form-hint is-error"))};p.addEventListener("input",u),p.addEventListener("keydown",h=>{if(h.key==="Enter"){h.preventDefault();let g=document.getElementById("vs-sc-rename-submit");g&&!g.disabled&&Vd(p.value.trim())}h.key==="Escape"&&(h.stopPropagation(),Sn(),X())}),u()}e.querySelectorAll('[data-action="rename-submit"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation();let g=document.getElementById("vs-sc-rename-input");g&&Vd(g.value.trim())})}),e.querySelectorAll('[data-action="delete"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),pe&&(Ud(pe),X())})}),e.querySelectorAll('[data-action="close-delete"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),_i(),X()})}),e.querySelectorAll('[data-action="delete-arm"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),Nt("armed"),X(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{mt==="armed"&&(Nt("idle"),X())},3e3)})}),e.querySelectorAll('[data-action="delete-confirm"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),Su()})}),e.querySelectorAll('[data-action="change-url"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),pe&&(qd(pe,X),X())})}),e.querySelectorAll('[data-action="close-proposal"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),Hs(),X()})}),e.querySelectorAll('[data-action="apply-proposal-arm"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),Ee("armed"),tt(null),X(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{ze==="armed"&&(Ee("idle"),X())},3e3)})}),e.querySelectorAll('[data-action="apply-proposal-confirm"]').forEach(u=>{u.addEventListener("click",async h=>{h.stopPropagation(),await $u()})}),e.querySelectorAll("[data-navigate-node]").forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation();let g=u.dataset.navigateNode;g&&So(g)})}),e.querySelectorAll('[data-action="reorder"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation();let g=u.closest(".vs-sc-action-bar"),b=(g==null?void 0:g.dataset.forNode)||pe;b&&Cu(b)})}),e.querySelectorAll('[data-action="close-move-proposal"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),Lo(),X()})}),e.querySelectorAll('[data-action="select-move-parent"]').forEach(u=>{u.addEventListener("click",h=>{var k,w,x;h.stopPropagation();let g=u.dataset.parentHref,b=g==="__root__"?null:g;if(Fa(b),Ht&&b===(Ht.parentHref??null))ho(Ht.index??0);else{let C=(k=oe)==null?void 0:k.nodes.get(pe),_=(w=C==null?void 0:C.meta)!=null&&w.isHomepage?"/":"/"+(((x=C==null?void 0:C.meta)==null?void 0:x.slug)||""),P=0;if(xt){if(b===null)P=xt.filter(j=>j.href!==_).length;else for(let j of xt)if(j.href===b){P=(j.children||[]).filter(Z=>Z.href!==_).length;break}}ho(P)}Ee("idle"),X()})}),e.querySelectorAll('[data-action="select-move-position"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),ho(parseInt(u.dataset.position,10)),Ee("idle"),X()})}),e.querySelectorAll('[data-action="apply-move-arm"]').forEach(u=>{u.addEventListener("click",h=>{h.stopPropagation(),Ee("armed"),tt(null),X(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{ze==="armed"&&(Ee("idle"),X())},3e3)})}),e.querySelectorAll('[data-action="apply-move-confirm"]').forEach(u=>{u.addEventListener("click",async h=>{h.stopPropagation(),await Lu()})});let c=e.querySelector("#vs-proposal-url");if(c){let u=null;c.addEventListener("input",()=>{clearTimeout(u),u=setTimeout(()=>{Is(c.value),X()},200)}),c.addEventListener("keydown",h=>{if(h.key==="Enter"&&h.preventDefault(),h.key==="Escape"){if(h.preventDefault(),h.stopPropagation(),ze==="armed"){Ee("idle"),X();return}Hs(),X()}}),qa&&(xi(!1),setTimeout(()=>c.focus(),0))}let m=e.querySelector("#vs-sc-right-body");m&&m.addEventListener("click",u=>{if(!(u.target.closest("button")||u.target.closest("a")||u.target.closest("input"))){if(u.target.closest(".vs-proposal-panel")||u.target.closest(".vs-sc-form")){ze==="armed"&&(Ee("idle"),X()),mt==="armed"&&(Nt("idle"),X());return}if(!u.target.closest(".vs-impact-detail-content")&&!u.target.closest(".vs-sc-summary")){if(ze==="armed"){Ee("idle"),X();return}if(mt==="armed"){Nt("idle"),X();return}To()}}});let f=e.querySelector("#vs-sc-left-scroll");f&&f.addEventListener("click",u=>{if(u.target===f){if(ze==="armed"){Ee("idle"),X();return}if(mt==="armed"){Nt("idle"),X();return}To()}}),Oa||(ld(!0),document.addEventListener("keydown",u=>{var h,g,b;if(u.key==="Escape"){if(ze==="armed"){Ee("idle"),X();return}if(mt==="armed"){Nt("idle"),X();return}if(As&&((h=document.activeElement)==null?void 0:h.tagName)!=="INPUT"){_i(),X();return}if(Bs&&((g=document.activeElement)==null?void 0:g.tagName)!=="INPUT"){Sn(),X();return}pe&&((b=document.activeElement)==null?void 0:b.tagName)!=="INPUT"&&To()}})),Ai&&window.removeEventListener("resize",Ai);{let u;Ai=()=>{clearTimeout(u),u=setTimeout(()=>{requestAnimationFrame(()=>Cn(ds))},150)},window.addEventListener("resize",Ai)}e.querySelectorAll(".vs-editor-resize[data-resize-panel]").forEach(u=>{let h=u.dataset.resizePanel,g=document.getElementById(h);if(!g)return;let b=u.dataset.resizeSide==="left";u.addEventListener("mousedown",k=>{if(k.preventDefault(),u.classList.add("is-dragging"),b){let w=C=>{let _=g.parentElement.getBoundingClientRect(),P=Math.min(400,Math.max(240,_.right-C.clientX));g.style.width=P+"px"},x=()=>{u.classList.remove("is-dragging"),document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",x),Ga("right",g.offsetWidth),requestAnimationFrame(()=>Cn(ds))};document.addEventListener("mousemove",w),document.addEventListener("mouseup",x)}else{let w=g.getBoundingClientRect(),x=_=>{let P=Math.min(360,Math.max(180,_.clientX-w.left));g.style.width=P+"px"},C=()=>{u.classList.remove("is-dragging"),document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",C),Ga("left",g.offsetWidth),requestAnimationFrame(()=>Cn(ds))};document.addEventListener("mousemove",x),document.addEventListener("mouseup",C)}})})}var Te=null,Jd=null,Ye=null,Mt=null,Ot=null,st=null,Yd=!1,Au=80;var Pu=60,Mo=5,Io=6;function Ru(e){return e.replace(/\(([⌘⇧⌥⌃\w+↵←→↑↓⌫]+)\)/g,(t,s)=>`<kbd class="vs-tooltip-kbd">${Du(s)}</kbd>`)}function Du(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Hu(){if(Te)return;let e=document.createElement("div");e.className="vs-tooltip",e.setAttribute("role","tooltip");let t=document.createElement("span");t.className="vs-tooltip-content";let s=document.createElement("span");s.className="vs-tooltip-arrow",e.appendChild(t),e.appendChild(s),document.body.appendChild(e),Te=e,Jd=s}function Nu(e){if(!Te)return;let t=e.getBoundingClientRect(),s=Te.getBoundingClientRect(),n,o="above",i=t.top,a=window.innerHeight-t.bottom;i>=s.height+Mo+Io?n=t.top-s.height-Mo:a>=s.height+Mo+Io?(n=t.bottom+Mo,o="below"):i>=a?n=Io:(n=t.bottom+Mo,o="below");let r=t.left+t.width/2,l=r-s.width/2;l=Math.max(Io,Math.min(l,window.innerWidth-Io-s.width));let d=r-l,v=Math.max(8,Math.min(s.width-8,d));Te.style.top=`${n}px`,Te.style.left=`${l}px`,Jd.style.left=`${v}px`,Te.classList.remove("vs-tooltip--above","vs-tooltip--below"),Te.classList.add(`vs-tooltip--${o}`)}function ju(e){let t=e.getAttribute("data-tooltip")||e.getAttribute("title");!t||!t.trim()||(e.hasAttribute("title")&&(e.setAttribute("data-tooltip",e.getAttribute("title")),e.removeAttribute("title")),Ot&&(clearTimeout(Ot),Ot=null),Ye=e,Mt=null,Hu(),Te.querySelector(".vs-tooltip-content").innerHTML=Ru(t.trim()),Te.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"),Te.style.display="flex",Te.style.opacity="0",requestAnimationFrame(()=>{Ye===e&&(Nu(e),Te.classList.add("vs-tooltip--visible"),Te.style.opacity="")}))}function Zd(){Te&&(Ye&&(er(Ye),Ye=null),Te.classList.remove("vs-tooltip--visible"),Te.classList.add("vs-tooltip--hiding"),Ot=setTimeout(()=>{Te&&(Te.style.display="none",Te.classList.remove("vs-tooltip--hiding")),Ot=null},Pu))}function Pi(){st&&(clearTimeout(st),st=null),Mt=null,Ye&&(er(Ye),Ye=null),Ot&&(clearTimeout(Ot),Ot=null),Te&&(Te.style.display="none",Te.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))}function er(e){if(!e)return;let t=e.getAttribute("data-tooltip");t&&!e.hasAttribute("title")&&(e.setAttribute("title",t),e.removeAttribute("data-tooltip"))}function Qd(e){for(;e&&e!==document.body;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentElement;continue}if(e.hasAttribute("data-tooltip-skip"))return null;if(e.hasAttribute("title")||e.hasAttribute("data-tooltip"))return e;e=e.parentElement}return null}function Ou(e){if(e.buttons!==0)return;let t=Qd(e.target);if(!t){st&&(clearTimeout(st),st=null),Mt=null,Ye&&Zd();return}t!==Ye&&t!==Mt&&(st&&(clearTimeout(st),st=null),Ye&&(er(Ye),Ye=null,Ot&&(clearTimeout(Ot),Ot=null),Te&&(Te.style.display="none",Te.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))),Mt=t,st=setTimeout(()=>{st=null,Mt===t&&ju(t)},Au))}function qu(e){let t=Qd(e.target);if(t)if(t===Ye){let s=e.relatedTarget;if(s&&t.contains(s))return;st&&(clearTimeout(st),st=null),Mt=null,Zd()}else t===Mt&&(st&&(clearTimeout(st),st=null),Mt=null)}function Fu(){(Ye||Mt)&&Pi()}function zu(){(Ye||Mt)&&Pi()}function Uu(){(Ye||Mt)&&Pi()}function ec(){Yd||(Yd=!0,document.addEventListener("mouseover",Ou,{passive:!0}),document.addEventListener("mouseout",qu,{passive:!0}),document.addEventListener("scroll",Fu,{passive:!0,capture:!0}),document.addEventListener("keydown",zu,{passive:!0}),document.addEventListener("mousedown",Uu,{passive:!0}),window.addEventListener("resize",()=>{Ye&&Pi()},{passive:!0}))}var cc=Gd,Do=[{id:"create",label:"Create",defaultRoute:"chat",routes:[{route:"chat",label:"Chat",roles:["owner","editor"]},{route:"site-map",label:"Site",roles:["owner","editor"],badge:"Beta"},{route:"editor",label:"Editor",roles:["owner","editor"]}]},{id:"studio",label:"Studio",defaultRoute:"notes",routes:[{route:"notes",label:"Notes",roles:["owner","editor"]},{route:"board",label:"Board"}]},{id:"manage",label:"Manage",defaultRoute:"forms",routes:[{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"designs",label:"Designs",roles:["owner","editor"]}]}],pc="vs-nav-group-last-",Ri=(()=>{let e={};for(let t of Do)for(let s of t.routes)e[s.route]=t.id;return e})();function Vi(e){if(Ri[e])return Ri[e];let t=e.split("/")[0];return Ri[t]?Ri[t]:null}function Vu(e){var i;let t=(i=R.get("user"))==null?void 0:i.role,s=e.routes.filter(a=>!a.roles||a.roles.includes(t));if(s.length===0)return e.defaultRoute;let n=localStorage.getItem(pc+e.id);return n&&s.find(r=>r.route===n)?n:s.find(a=>a.route===e.defaultRoute)?e.defaultRoute:s[0].route}function Wu(e){let t=Vi(e);if(t){let s=e.split("/")[0];localStorage.setItem(pc+t,s)}}var _b=Do.flatMap(e=>e.routes),or=["chat","editor"],Gu="vs-first-run-guide-dismissed",vc="vs-onboarding-draft-v1",uc="vs-prompt-recents-v1",mc="vs-prompt-pins-v1",Ku=8,Xu=5,tc=5,Yu=5*1024*1024,ir=["image/jpeg","image/png","image/gif","image/webp"],js=[],Kt=null,lr=document.documentElement.dataset.demo==="true",Ju=document.documentElement.dataset.demoHideBanner==="true",ms=lr&&!Ju,gc=window.matchMedia("(max-width: 767px)");function Oi(){return gc.matches}var Zu={chat:"messageCircle",editor:"pencil",notes:"fileText",board:"layoutGrid",assets:"image",forms:"inbox",actions:"zap",designs:"palette","site-map":"globe"};function Qu(){var i;let e=R.get("route"),t=(i=R.get("user"))==null?void 0:i.role,s=Vi(e),n=s?Do.find(a=>a.id===s):null;if(!n)return[{route:"more",label:"More",icon:"ellipsis"}];let o=n.routes.filter(a=>(!a.roles||a.roles.includes(t))&&!cr.includes(a.route)).map(a=>({route:a.route,label:a.label,icon:Zu[a.route]||"layoutGrid"}));return o.push({route:"more",label:"More",icon:"ellipsis"}),o}function dr(){var t;return((t=R.get("user"))==null?void 0:t.role)==="viewer"?"board":"chat"}var cr=["chat","editor","site-map"];function It(){return lr?(I("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function fc(){let e=R.get("user");return e&&e.role!=="viewer"}function Wi(){return fc()?!1:(I("You have read-only access.","warning"),!0)}function em(){let e=R.get("user");return e&&e.role==="owner"}window.IS_DEMO=lr;window.demoGuard=It;window.canWrite=fc;window.viewerGuard=Wi;window.isOwner=em;var hc=document.getElementById("app");async function bc(){var s,n;br(),tl(),ec(),window.marked&&window.marked.use({renderer:{html(o){return y(typeof o=="string"?o:o.text)}}});let e=await $.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){dc();return}R.batch(()=>{R.set("user",e.data.user),R.set("sessionToken",e.data.token),R.set("siteName",e.data.site_name||"")});let t=e.data.site_name;if(t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",o=>{var i;(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)&&(o.preventDefault(),o.returnValue="")}),pt.beforeEach(async(o,i)=>{var a;for(let r of(window.__vsFlushCallbacks||new Map).values())await r();return i.startsWith("editor")&&!o.startsWith("editor")&&(a=window.__hasUnsavedEditorChanges)!=null&&a.call(window)?await wl():(i.startsWith("notes")&&!o.startsWith("notes")&&Jl(),i.startsWith("board")&&!o.startsWith("board")&&ad(),!0)}).on("chat",()=>Ve()).on("editor",()=>Ve()).on("pages",()=>Ve()).on("pages/:slug",()=>Ve()).on("assets",()=>Ve()).on("forms",()=>Ve()).on("forms/:formId",()=>Ve()).on("notes",()=>Ve()).on("board",()=>Ve()).on("actions",()=>Ve()).on("actions/:actionId",()=>Ve()).on("designs",()=>Ve()).on("site-map",()=>Ve()).on("settings",()=>Ve()).on("team",()=>Ve()).on("profile",()=>Ve()).onNotFound(()=>pt.navigate(dr())),R.on("user",o=>{o||dc()}),yc(),gc.addEventListener("change",()=>{Ve()}),Oi()){let i=(window.location.hash||"").replace(/^#\/?/,"");if(!i||cr.includes(i)){let a=((n=R.get("user"))==null?void 0:n.role)==="viewer"?"board":"assets";window.location.hash=`#/${a}`}}pt.start()}async function yc(){try{let{ok:e,data:t}=await $.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){R.set("pages",t.pages),Mc();let s=document.getElementById("chat-messages");(s==null?void 0:s.querySelector(".vs-empty-state"))&&(s.innerHTML=Bn(),In())}}catch{}}function Ve(){var l;let e=R.get("route"),t=or.includes(e);Wu(e),Zn()&&hn(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s=Oi()&&cr.includes(e),o=((l=R.get("user"))==null?void 0:l.role)==="viewer",i;s?i=nm(e):e==="editor"?i=o?Bo():Tr():e==="notes"?i=o?Bo():`<div class="h-full overflow-hidden">${Fl()}</div>`:e==="board"?i=`<div class="h-full overflow-hidden">${Ha()}</div>`:e==="site-map"?i=o?Bo():cc():t?i=o?Bo():sm():i=Bo();let a=e==="chat"&&!Oi(),r=a?"bottom-[32px]":"bottom-0";hc.innerHTML=`
    ${tm()}
    <div class="fixed top-[48px] ${r} left-0 right-0 overflow-hidden">
      ${i}
    </div>
    ${a?mm():""}
    ${gm()}
    ${fm()}
    ${bm()}
    ${Bl()}
    ${$m()}
  `,Tm(),hm(),e==="editor"&&!s&&!o&&Mr()}function tm(){let e=R.get("route"),t=R.get("user"),s=R.get("theme"),n=t==null?void 0:t.role,o=Vi(e),i=Do.filter(l=>l.routes.some(d=>!d.roles||d.roles.includes(n))).map(l=>{let d=l.id===o,v=Vu(l);return`
        <button class="vs-nav-group ${d?"vs-nav-group-active":""}"
                data-group="${l.id}"
                data-target="${v}">${l.label}</button>
      `}).join(""),a=o?Do.find(l=>l.id===o):null,r=a?a.routes.filter(l=>!l.roles||l.roles.includes(n)).map(l=>{let d=e===l.route||e.startsWith(l.route+"/");return`
            <a href="#/${l.route}"
               class="vs-nav-item ${d?"vs-nav-item-active":""}">
              ${l.label}${l.badge?`<span class="vs-nav-badge-beta">${y(l.badge)}</span>`:""}
            </a>
          `}).join(""):"";return`
    <header class="vs-topbar">
      <div class="vs-topbar-inner">
        <!-- Left: Logo + Group links (architecture) -->
        <div class="vs-topbar-left">
          <a href="#/${dr()}" class="vs-logo" title="${y(R.get("siteName")||"VoxelSite")}">
            <span class="vs-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
                <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
                <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
              </svg>
            </span>
          </a>
          <nav class="vs-nav-groups" aria-label="Workspace">${i}</nav>
          ${ms?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${E.eye} Demo
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
            ${s==="dark"?E.sun:E.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${E.user}
              <span class="hidden sm:inline">${y((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${n!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${n==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${E.pencil} Edit Profile
              </a>
              ${n==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${E.users} Team Members
                </a>
              `:""}
              ${n==="owner"?`
                <a href="#/settings" id="btn-settings-nav" class="vs-dropdown-item">
                  ${E.settings} Settings
                </a>
              `:""}
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${E.logOut} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function sm(){let e=R.get("sidebarWidth"),t=R.get("activeConversationId"),s=R.get("activePageScope"),n=xc(s),o=(()=>{if(s){let i=s;return i.endsWith(".php")||i.endsWith(".html")?i:i+".php"}return window.__vsCurrentPreviewPath||"index.php"})();return window.__vsCurrentPreviewPath=o,`
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
              ${E.fileText}
              <span id="scope-label" class="text-vs-text-secondary">${y(n)}</span>
              ${E.chevronDown}
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-new-chat"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="New conversation">
              ${E.newChat}
            </button>
            <button id="btn-toggle-history"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="Conversation history">
              ${E.history}
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
          ${Bn()}
        </div>

        <!-- Prompt Bar -->
        <div class="vs-prompt-area">
          <div class="vs-prompt-container">
            <input type="file" id="image-file-input" accept="image/jpeg,image/png,image/gif,image/webp" multiple class="hidden" />
            <div id="image-attachments" class="vs-image-attachments" hidden></div>
            <div id="website-ref-chip" class="vs-website-ref-chip" hidden>
              ${E.globe}
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
                  ${E.image}
                </button>
                <button id="btn-attach-website"
                  class="vs-prompt-attach-btn"
                  title="Use website as reference">
                  ${E.globe}
                </button>
                ${window.SpeechRecognition||window.webkitSpeechRecognition?`
                <button id="btn-voice-input"
                  class="vs-prompt-attach-btn"
                  title="Voice input">
                  ${E.mic}
                </button>`:""}
              </div>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (\u2318+Enter)">
                ${E.send}
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
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${E.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${E.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${E.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Enter visual editor (V)">
              ${E.pencil} Edit
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${E.rotateCcw} Refresh
            </button>
            <button id="btn-save-design" class="vs-btn vs-btn-ghost vs-btn-xs" title="Save to Designs" disabled>
              ${E.save} Save
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${E.externalLink}
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
  `}function nm(e){let t={editor:{name:"Code Editor",desc:"The code editor needs a wider screen for the file tree, editor pane, and preview."},chat:{name:"AI Chat",desc:"The AI conversation and live preview work side-by-side. That needs a wider screen."},"site-map":{name:"Site Control",desc:"The site graph and inspector panels need a wider screen to display properly."}},s=t[e]||t.chat,n=s.name,o=s.desc;return`
    <div class="h-full overflow-y-auto">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 18px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
          ${E.monitor}
        </div>
        <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 10px;">${n}</h1>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 6px; max-width: 280px; line-height: 1.6;">${o}</p>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0; max-width: 280px; line-height: 1.6;">Open Studio on a desktop or tablet to use this feature.</p>
      </div>
    </div>
  `}function Bo(){let e=R.get("route"),t=R.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${om(e,t)}
      </div>
    </div>
  `}function om(e,t){let s=R.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return Al();case"forms":return Ll();case"forms/:formId":return Sl(t.formId);case"actions":return El();case"actions/:actionId":return $l(t.actionId);case"designs":return n==="owner"||n==="editor"?Dl():_o();case"site-map":return n==="owner"||n==="editor"?cc():_o();case"notes":return _o();case"board":return Ha();case"settings":return n==="owner"?xl():_o();case"team":return n==="owner"?Il():_o();case"profile":return lm();default:return im("Not Found","This page doesn't exist.")}}function _o(){let e=dr();return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/${e}" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${e==="board"?"\u2190 Back to Board":"\u2190 Back to Chat"}</a>
    </div>
  `}function im(e,t){return`
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
  `}function am(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return E[t[s]||"layoutGrid"]||E.layoutGrid}var tr=null,sc=null,nc=null;function rm(){requestAnimationFrame(()=>{var d,v;let e=document.querySelector(".vs-nav-routes"),t=e==null?void 0:e.querySelector(".vs-nav-pill"),s=e==null?void 0:e.querySelector(".vs-nav-item-active");if(!e||!t||!s)return;let n=((v=(d=document.querySelector(".vs-nav-group-active"))==null?void 0:d.dataset)==null?void 0:v.group)||"",o=e.getBoundingClientRect(),i=s.getBoundingClientRect(),a=i.left-o.left,r=i.width;tr===null||!(nc===n)?(t.style.transition="none",t.style.transform=`translateX(${a}px)`,t.style.width=`${r}px`,t.offsetHeight,t.style.transition=""):(t.style.transition="none",t.style.transform=`translateX(${tr}px)`,t.style.width=`${sc}px`,t.offsetHeight,t.style.transition="",t.style.transform=`translateX(${a}px)`,t.style.width=`${r}px`),tr=a,sc=r,nc=n})}function oc(e){pt.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function lm(){let e=R.get("user")||{};return setTimeout(()=>dm(),0),`
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
  `}function dm(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var d,v,p,c;let o=(v=(d=document.getElementById("profile-name"))==null?void 0:d.value)==null?void 0:v.trim(),i=(c=(p=document.getElementById("profile-email"))==null?void 0:p.value)==null?void 0:c.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:r,data:l}=await $.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(l!=null&&l.user)?(R.set("user",l.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>Ve(),800)):t&&(t.textContent=(r==null?void 0:r.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var d,v,p;let o=((d=document.getElementById("profile-current-pw"))==null?void 0:d.value)||"",i=((v=document.getElementById("profile-new-pw"))==null?void 0:v.value)||"",a=((p=document.getElementById("profile-confirm-pw"))==null?void 0:p.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:r,error:l}=await $.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",r?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(l==null?void 0:l.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function cm(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),pm()):e.classList.add("hidden")}async function pm(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await $.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${y((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=R.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let r=a.id===i,l=a.title||"Untitled conversation",d=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${r?"vs-conv-item-active":""}"
              data-conversation-id="${y(a.id)}">
        <span class="mt-0.5 shrink-0 ${r?"text-vs-accent":"text-vs-text-ghost"}">${E.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${r?"font-medium":""}" style="font-size: var(--text-sm);">${y(l)}</div>
          <div class="vs-conv-time mt-0.5">${d}</div>
        </div>
        ${r?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let r=a.dataset.conversationId;qi(r);let l=document.getElementById("conversation-history-panel");l&&l.classList.add("hidden")})})}async function qi(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await $.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){R.set("activeConversationId",null),zi(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=Bn(),In();return}let i=n.conversation,a=i.prompts||[];R.set("activeConversationId",e),zi(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=Bn(),In();return}let r="",l=!1;for(let d of a){let{text:v,images:p,webRefUrl:c}=Am(d.user_prompt),m=p.length>0?`<div class="vs-msg-user-images">${p.map(u=>`<img src="${u}" class="vs-msg-user-image" />`).join("")}</div>`:"",f=c?`<div class="vs-msg-user-webref"><a href="${ge(c)}" target="_blank" rel="noopener" title="${ge(c)}">${E.globe} <span>${y(Fn(c))}</span></a></div>`:"";if(r+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${m}
        ${f}
        ${v?`<div class="text-sm text-vs-text-primary leading-relaxed">${y(v)}</div>`:""}
      </div>
    `,d.ai_response||d.files_modified){let u="",h=typeof d.ai_message=="string"&&d.ai_message.trim()!==""?d.ai_message:d.ai_response;h&&(u=ji(h));let g="";if(d.files_modified)try{let w=JSON.parse(d.files_modified);if(Array.isArray(w)&&w.length>0){let x=w.map(_=>{let P=typeof _=="string"?_:_.path||_,j=typeof _=="object"&&_.action==="delete";return`<div class="vs-file-badge ${j?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${j?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${y(String(P))}</span>
              </div>`}).join(""),C=w.length;g=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${C} file${C!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${x}</div>
              </div>`}}catch{}let b="";if(d.evaluation_issues)try{let w=JSON.parse(d.evaluation_issues);if(Array.isArray(w)&&w.length>0){let x=q=>q==="error"?"#ef4444":q==="warning"?"#d97706":"#6b7280",C=q=>q==="error"?"rgba(239,68,68,0.1)":q==="warning"?"rgba(217,119,6,0.1)":"rgba(107,114,128,0.1)",_={error:0,warning:0,info:0};w.forEach(q=>{_[q.severity]=(_[q.severity]||0)+1});let P=[];_.error&&P.push(`${_.error} error${_.error>1?"s":""}`),_.warning&&P.push(`${_.warning} warning${_.warning>1?"s":""}`),_.info&&P.push(`${_.info} suggestion${_.info>1?"s":""}`);let j=_.error>0?"error":_.warning>0?"warning":"info",Z=j==="error"?"rgba(239,68,68,0.15)":j==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)",Y=w.map(q=>`
              <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${x(q.severity)}; background: ${C(q.severity)};">${y(q.severity)}</span>
                  <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(q.category||"")}</span>
                  ${q.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(q.file)}${q.line?":"+q.line:""}</span>`:""}
                </div>
                <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(q.description||"")}</div>
                ${q.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(q.suggested_fix)}</div>`:""}
              </div>
            `).join("");b=`
              <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${Z}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
                <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${x(j)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>Expert Review \xB7 ${P.join(", ")}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <div style="border-top: 1px solid var(--vs-border-subtle);">
                  <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
                  ${Y}
                </div>
              </details>`}}catch{}let k=d.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${u}</div>
          ${g}
          ${b}
          ${k}
        </div>
      `}else if(d.status==="streaming"){l=!0;let u=d.id,h=d.status_message||"Generation in progress...";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            ${h}
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${u})"
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
      `)}t.innerHTML=r,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),l&&!window.__vsResumedToastByConversation[e]&&(I("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),l||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(d){try{await $.post("/ai/cancel-generation",{prompt_id:d})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",qi(e)},l&&R.get("activeConversationId")===e&&!R.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{R.get("activeConversationId")===e&&!R.get("aiStreaming")&&qi(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function vm(){R.set("activeConversationId",null),zi(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=Bn(),In());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function xc(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function Fi(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=xc(t)}function zi(e){R.set("activePageScope",e||null),Fi(),Zn()&&hn()}async function um(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>we(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),ke(t,s),t.addEventListener("keydown",v=>{v.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await $.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${y((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let r=i.pages;if(!r.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${E.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let l='<div style="display: flex; flex-direction: column; gap: 2px;">';r.forEach(v=>{let p=!!Number(v.is_homepage),c=v.title||v.slug||v.path,m=v.path||v.slug+".php",f="/"+m.replace(/\.php$/,"").replace(/^index$/,""),u=f==="/"?"/":f,h=am(v.slug),b=(window.__vsCurrentPreviewPath||"index.php")===m,k=v.size?(v.size/1024).toFixed(1)+" KB":"";l+=`
      <div class="vs-pages-modal-item ${b?"is-active":""}" data-slug="${y(v.slug)}" data-path="${y(m)}" data-title="${y(c)}" data-url="${y(u)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${h}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(c)}${p?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(m)}${k?" \xB7 "+k:""}
            </div>
          </div>
        </div>
        <div class="vs-pages-modal-actions" style="display: flex; align-items: center; gap: 2px; flex-shrink: 0;">
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="edit" title="Edit in Chat" style="width:28px;height:28px;">
            ${E.messageCircle}
          </button>
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="preview" title="Open in Preview" style="width:28px;height:28px;">
            ${E.eye}
          </button>
          ${p?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${E.trash2}
          </button>
          `}
        </div>
      </div>
    `}),l+="</div>",n.innerHTML=l;let d=t.querySelector(".vs-modal-desc");d&&(d.textContent=`${r.length} page${r.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(v=>{v.addEventListener("click",p=>{p.stopPropagation();let c=v.closest(".vs-pages-modal-item"),m=c.dataset.slug,f=c.dataset.path,u=c.dataset.title,h=c.dataset.url,g=v.dataset.action;if(g==="edit")zi(m),s(),oc(`Edit the "${u}" page (${h}): `);else if(g==="preview"){let b=document.getElementById("preview-iframe");b?(Zn()&&hn(),b.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(f)+"&t="+Date.now(),window.__vsCurrentPreviewPath=f,Fi(),s(),I(`Preview: ${u}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(f),"_blank")}else if(g==="delete"){s();let b=`Delete the "${u}" page (${h}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;oc(b)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(v=>{v.addEventListener("click",p=>{if(p.target.closest(".vs-pages-action"))return;let c=v.dataset.path,m=v.dataset.title,f=document.getElementById("preview-iframe");f?(f.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(c)+"&t="+Date.now(),window.__vsCurrentPreviewPath=c,Fi(),s(),I(`Preview: ${m}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(c),"_blank")})})}function In(){var e;document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let s=document.getElementById("prompt-input");s&&(s.value=t.dataset.quickPrompt,s.dataset.actionType=t.dataset.actionType||"free_prompt",s.focus(),s.setSelectionRange(0,s.value.length),s.dispatchEvent(new Event("input",{bubbles:!0})))})}),(e=document.getElementById("chat-new-design"))==null||e.addEventListener("click",()=>{It()||Wi()||Ma()})}function Bn(){let e=R.get("pages")||[],t=e.length>0,s=new Set(e.map(b=>b.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(b=>{let k=b.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(k)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],r=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],l=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],d=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],v=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],p,c,m;if(!t)c="What are we building?",m="Describe your website and watch it appear in the preview. Every detail is a conversation away.",p=sr(n).slice(0,6);else{c="What\u2019s next?",m="Your site is live in preview. Pick a suggestion or describe any change you want.";let b=[...o,...o,...i,...a,...r,...l,...d,...v];p=sr(b).slice(0,6);let k=new Set;if(p=p.filter(w=>k.has(w.label)?!1:(k.add(w.label),!0)),p.length<6){let w=sr(b).filter(x=>!k.has(x.label));for(let x of w){if(p.length>=6)break;p.push(x),k.add(x.label)}}}let f=p.map(b=>`<button data-quick-prompt="${y(b.prompt).replace(/"/g,"&quot;")}" data-action-type="${b.type}"
      class="vs-style-card">${y(b.label)}</button>`).join(`
        `),u=R.get("user"),g=t&&((u==null?void 0:u.role)==="owner"||(u==null?void 0:u.role)==="editor")?`
      <div class="vs-animate-in vs-stagger-5" style="margin-top: 16px; text-align: center;">
        <button id="chat-new-design" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
          ${E.filePlus} Start a new design from scratch
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
        ${m}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${f}
      </div>
      ${g}
    </div>
  `}function sr(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function mm(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <button id="btn-undo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Undo (\u2318Z)">
          ${E.undo} Undo
        </button>
        <button id="btn-redo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Redo (\u2318\u21E7Z)">
          ${E.redo} Redo
        </button>
        <button id="btn-preview-site" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${E.externalLink} Preview
        </button>
        <button id="btn-snapshot" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${E.camera} Snapshot
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-download" class="vs-btn vs-btn-ghost vs-btn-xs" title="Download your website">
          ${E.download} Download
        </button>
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <div class="vs-publish-split">
          <button id="btn-publish"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-main">
            ${E.publish} Publish
          </button>
          <button id="btn-publish-menu"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-chevron"
            title="More publish options">
            ${E.chevronUp}
          </button>
        </div>
      </div>
    </footer>
  `}function gm(){let e=R.get("route");return`
    <nav class="vs-mobile-nav" aria-label="Mobile navigation">
      ${Qu().map(n=>{if(n.route==="more")return`
        <button class="vs-mobile-nav-item ${!Vi(e)?"vs-mobile-nav-item-active":""}" id="btn-mobile-more" aria-label="More">
          ${E[n.icon]||E.layoutGrid}
          <span>${n.label}</span>
        </button>
      `;let o=e===n.route||e.startsWith(n.route+"/");return`
      <a href="#/${n.route}"
         class="vs-mobile-nav-item ${o?"vs-mobile-nav-item-active":""}"
         aria-label="${n.label}">
        ${E[n.icon]||E.layoutGrid}
        <span>${n.label}</span>
      </a>
    `}).join("")}
    </nav>
  `}function fm(){let e=R.get("user"),t=e==null?void 0:e.role,s=R.get("theme"),n="";return t==="owner"&&(n+=`
      <a href="#/settings" class="vs-mobile-more-item" data-mobile-more-nav>
        ${E.settings} Settings
      </a>
    `),n+=`
    <a href="#/profile" class="vs-mobile-more-item" data-mobile-more-nav>
      ${E.pencil} Edit Profile
    </a>
  `,t==="owner"&&(n+=`
      <a href="#/team" class="vs-mobile-more-item" data-mobile-more-nav>
        ${E.users} Team Members
      </a>
    `),(t==="owner"||t==="editor")&&(n+=`
      <button id="btn-mobile-prompts" class="vs-mobile-more-item">
        ${E.zap} Prompts
      </button>
    `),n+=`
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-theme" class="vs-mobile-more-item">
      ${s==="dark"?E.sun:E.moon}
      ${s==="dark"?"Light mode":"Dark mode"}
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-publish" class="vs-mobile-more-item" style="color: var(--vs-accent); font-weight: 600;">
      ${E.publish} Publish
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-logout" class="vs-mobile-more-item" style="color: var(--vs-error);">
      ${E.logOut} Sign Out
    </button>
  `,`
    <div id="mobile-more-sheet" class="vs-mobile-more-sheet">
      <div class="vs-mobile-more-backdrop" id="mobile-more-backdrop"></div>
      <div class="vs-mobile-more-content">
        <div class="vs-mobile-more-header">
          <span class="vs-mobile-more-title">${y((e==null?void 0:e.name)||"Menu")}</span>
          <button id="btn-mobile-more-close" class="vs-mobile-more-close">${E.x}</button>
        </div>
        ${n}
      </div>
    </div>
  `}function hm(){if(!Oi())return;let e=document.getElementById("btn-mobile-more"),t=document.getElementById("mobile-more-sheet"),s=document.getElementById("mobile-more-backdrop"),n=document.getElementById("btn-mobile-more-close");function o(){t==null||t.classList.add("vs-sheet-open")}function i(){t==null||t.classList.remove("vs-sheet-open")}e&&e.addEventListener("click",o),s&&s.addEventListener("click",i),n&&n.addEventListener("click",i),document.querySelectorAll("[data-mobile-more-nav]").forEach(v=>{v.addEventListener("click",i)});let a=document.getElementById("btn-mobile-prompts");a&&a.addEventListener("click",()=>{i(),ar()});let r=document.getElementById("btn-mobile-theme");r&&r.addEventListener("click",()=>{Go(),i(),Ve()});let l=document.getElementById("btn-mobile-publish");l&&l.addEventListener("click",()=>{var v;i(),!It()&&((v=document.getElementById("btn-publish"))==null||v.click())});let d=document.getElementById("btn-mobile-logout");d&&d.addEventListener("click",async()=>{i(),await $.post("/auth/logout"),window.location.href="/_studio/"})}function bm(){return`
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
  `}function wc(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>Cc(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function kc(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function Ec(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function Gi(){return kc(mc)}function pr(){return kc(uc)}function $c(e){let t=Gi(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];Ec(mc,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};Ro(n.query||"",n.activeIndex||0)}function ym(e){let t=pr().filter(n=>n!==e),s=[e,...t].slice(0,8);Ec(uc,s)}function Cc(e){if(R.get("route")!=="chat"){pt.navigate("chat"),setTimeout(()=>Cc(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function Lc(e,t="free_prompt",s=!1){if(R.get("route")!=="chat"){pt.navigate("chat"),setTimeout(()=>Lc(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?Ui():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function Ao(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function ar(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),Ro(e,0))}function Po(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function xm(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function wm(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=xm(s,n);return i===null?null:70+i}function km(e){let t=(e||"").trim().toLowerCase(),s=wc(),n=Gi(),o=pr();return s.map(i=>{let a=wm(t,i);if(a===null)return null;let r=n.includes(i.id)?-12:0,l=o.includes(i.id)?-8:0;return{...i,__score:a+r+l}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function Em(e){let t=wc(),s=Object.fromEntries(t.map(p=>[p.id,p])),n=(e||"").trim(),o=[];if(n!==""){let p=km(e).slice(0,18);return p.length>0&&o.push({title:"Results",commands:p}),o}let i=pr(),a=Gi(),r=new Set,l=i.map(p=>s[p]).filter(Boolean);l.length>0&&(o.push({title:"Recent",commands:l}),l.forEach(p=>r.add(p.id)));let d=a.map(p=>s[p]).filter(p=>p&&!r.has(p.id));return d.length>0&&(o.push({title:"Pinned",commands:d}),d.forEach(p=>r.add(p.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(p=>{let c=t.filter(m=>m.group===p&&!r.has(m.id));c.length>0&&(o.push({title:p,commands:c}),c.forEach(m=>r.add(m.id)))}),o}function Ro(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Em(e),o=n.flatMap(d=>d.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=Gi();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let r="",l=0;n.forEach(d=>{r+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${y(d.title)}</div>`,d.commands.forEach(v=>{let p=l===i,c=a.includes(v.id);r+=`
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${l}"
            class="vs-cmd-item ${p?"vs-cmd-item-active":""}">
            <div class="min-w-0">
              <div class="vs-cmd-item-title">${y(v.title)}</div>
              <div class="vs-cmd-item-desc">${y(v.prompt?v.prompt.substring(0,80)+(v.prompt.length>80?"\u2026":""):v.meta)}</div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${y(v.id)}"
            class="vs-cmd-pin ${c?"vs-cmd-pin-active":""}"
            title="${c?"Unpin":"Pin"}">
            ${c?"\u2605":"\u2606"}
          </button>
        </div>
      `,l+=1})}),s.innerHTML=r,s.querySelectorAll("[data-command-index]").forEach(d=>{d.addEventListener("click",()=>{let v=parseInt(d.dataset.commandIndex||"0",10);Sc(v)})}),s.querySelectorAll("[data-command-pin]").forEach(d=>{d.addEventListener("click",v=>{v.preventDefault(),v.stopPropagation();let p=d.dataset.commandPin;p&&$c(p)})})}function Sc(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(ym(n.id),Po(),Promise.resolve(n.run()).catch(()=>{}))}function $m(){return`
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
  `}function Di(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function an(){try{let e=localStorage.getItem(vc);if(!e)return Di();let t=JSON.parse(e);return{...Di(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Di().pages}}catch{return Di()}}function Tc(e){try{localStorage.setItem(vc,JSON.stringify(e))}catch{}}function Ni(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function ic(){let e=window.__vsOnboarding||{step:1,draft:an()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||an(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),r=document.getElementById("btn-onboarding-next"),l=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!r||!l)return;let d=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${d[t-1]}`,n.innerHTML=d.map((v,p)=>{let c=p+1===t,m=p+1<t;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${c?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":m?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${p+1}. ${y(v)}</div>
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
    `;else{let v=[{key:"home",label:"Home"},{key:"about",label:"About"},{key:"services",label:"Services"},{key:"portfolio",label:"Portfolio"},{key:"pricing",label:"Pricing"},{key:"blog",label:"Blog"},{key:"contact",label:"Contact"}];i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-2">Pages to Create</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${v.map(p=>`
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
    `}a.disabled=t===1,r.classList.toggle("hidden",t===3),l.classList.toggle("hidden",t!==3),Cm()}function Cm(){let e=window.__vsOnboarding||{draft:an()},t=()=>{var n,o,i,a,r,l,d,v,p,c,m;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((l=(r=document.getElementById("onboard-offer"))==null?void 0:r.value)==null?void 0:l.trim())||e.draft.offer||"",audience:((v=(d=document.getElementById("onboard-audience"))==null?void 0:d.value)==null?void 0:v.trim())||e.draft.audience||"",style:((p=document.getElementById("onboard-style"))==null?void 0:p.value)||e.draft.style||"modern-minimal",tone:((c=document.getElementById("onboard-tone"))==null?void 0:c.value)||e.draft.tone||"confident",content_mode:((m=document.getElementById("onboard-content-mode"))==null?void 0:m.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(f=>f.checked).map(f=>f.dataset.onboardPage).filter(Boolean)),Tc(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function Lm(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function Sm(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>Ni());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>Ni());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:an()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,ic()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:an()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,ic()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:an()}).draft||an(),r=Lm(a);try{localStorage.setItem(Gu,"1")}catch{}Tc(a),Ni(),Lc(r,"create_site",!0)})}function Tm(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var V,se;let H=Go()==="light";e.innerHTML=H?E.sun:E.moon,e.title=H?"Switch to dark":"Switch to light",window.__vsEditorPage&&((V=window.monaco)!=null&&V.editor)&&window.monaco.editor.setTheme(Vs()),document.getElementById("vs-code-editor-overlay")&&((se=window.monaco)!=null&&se.editor)&&window.monaco.editor.setTheme(Vs())}),document.querySelectorAll(".vs-nav-group").forEach(S=>{S.addEventListener("click",()=>{let H=S.dataset.target;H&&pt.navigate(H)})}),rm();let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{ar()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>Po());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{Ro(n.value,0)}),n.addEventListener("keydown",S=>{let H=window.__vsCommandPalette||{commands:[],activeIndex:0};if((S.metaKey||S.ctrlKey)&&S.key.toLowerCase()==="p"){S.preventDefault();let F=H.commands[H.activeIndex];F&&$c(F.id);return}if(S.key==="ArrowDown"){S.preventDefault(),Ro(n.value,H.activeIndex+1);return}if(S.key==="ArrowUp"){S.preventDefault(),Ro(n.value,H.activeIndex-1);return}if(S.key==="Enter"){S.preventDefault(),Sc();return}S.key==="Escape"&&(S.preventDefault(),Po())})),Sm();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",S=>{S.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",S=>{!i.classList.contains("hidden")&&!i.contains(S.target)&&S.target!==o&&!o.contains(S.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav","btn-settings-nav"].forEach(S=>{let H=document.getElementById(S);H&&i&&H.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await $.post("/auth/logout"),window.location.href="/_studio/"});let r=document.getElementById("btn-undo-status");r&&r.addEventListener("click",()=>{It()||rc()});let l=document.getElementById("btn-redo-status");l&&l.addEventListener("click",()=>{It()||lc()});let d=document.getElementById("btn-preview-site");d&&d.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let v=document.getElementById("btn-snapshot");v&&v.addEventListener("click",async()=>{var V;if(It())return;v.disabled=!0,Ns("Creating snapshot...");let{ok:S,data:H,error:F}=await $.post("/snapshots",{type:"manual",label:"Manual snapshot"});v.disabled=!1,Ns(S?`\u2713 Snapshot saved (${((V=H==null?void 0:H.snapshot)==null?void 0:V.file_count)||0} files)`:"\u2717 "+((F==null?void 0:F.message)||"Snapshot failed"),S?"success":"error",4e3)});let p=document.getElementById("btn-download");p&&((async()=>{var V;let{ok:S,data:H}=await $.get("/settings");((V=H==null?void 0:H.settings)==null?void 0:V.last_published_at)||(p.disabled=!0,p.title="Publish your site first to enable download.",p.classList.add("opacity-40"))})(),p.addEventListener("click",()=>{p.disabled||It()||Bm()}));let c=document.getElementById("btn-publish");c&&(Mn(),c.addEventListener("click",async()=>{var ye,nt;let S=jo();if(S.publishing)return;if(S.hasChanges===!1){I("No unpublished changes to publish.","warning");return}let H=S.counts||{added:0,modified:0,deleted:0},F=Number(H.added||0)+Number(H.modified||0)+Number(H.deleted||0),V=localStorage.getItem("vs_publish_snapshot"),te=await Im({totalChanges:F,snapshotDefault:V===null?!0:V!=="false"});if(!te||It())return;localStorage.setItem("vs_publish_snapshot",String(te.createSnapshot)),S.publishing=!0,Mn(),Ns("Publishing...");let{ok:O,data:ie,error:me}=await $.post("/publish",{create_snapshot:te.createSnapshot});if(S.publishing=!1,O){let dt=((ye=ie==null?void 0:ie.published)==null?void 0:ye.length)||0,Bt=((nt=ie==null?void 0:ie.removed)==null?void 0:nt.length)||0,_t=Bt>0?`Published ${dt} file(s), removed ${Bt} stale file(s).`:`Published ${dt} file(s).`;I(_t,"success"),Ns(`\u2713 ${dt} published, ${Bt} removed`,"success",5e3),R.set("previewDirty",!1),gs({silent:!0}),window.open("/","_blank")}else I((me==null?void 0:me.message)||"Publish failed.","error"),Ns("\u2717 "+((me==null?void 0:me.message)||"Publish failed"),"error",5e3),gs({silent:!0})}));let m=document.getElementById("btn-publish-menu");m&&m.addEventListener("click",S=>{S.stopPropagation();let H=document.querySelector(".vs-publish-dropup");if(H){H.remove();return}let F=document.createElement("div");F.className="vs-publish-dropup",F.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${E.cloudOff} Unpublish
        </button>
      `;let V=m.closest(".vs-publish-split");V?V.appendChild(F):m.parentElement.appendChild(F),F.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(F.remove(),!await Ce({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0})||It())return;Ns("Unpublishing...");let{ok:ie,data:me,error:ye}=await $.post("/publish/unpublish");ie?(I("Unpublished. Default page restored.","success"),Ns("\u2713 Site unpublished","success",5e3),gs({silent:!0})):(I((ye==null?void 0:ye.message)||"Unpublish failed.","error"),Ns("\u2717 "+((ye==null?void 0:ye.message)||"Unpublish failed"),"error",5e3))});let se=O=>{!F.contains(O.target)&&O.target!==m&&(F.remove(),document.removeEventListener("click",se))};setTimeout(()=>document.addEventListener("click",se),0);let te=O=>{O.key==="Escape"&&(F.remove(),document.removeEventListener("keydown",te),document.removeEventListener("click",se))};document.addEventListener("keydown",te)});let f=document.getElementById("resize-handle"),u=document.getElementById("conversation-panel");if(f&&u){let S,H;f.addEventListener("mousedown",F=>{F.preventDefault(),S=F.clientX,H=u.offsetWidth;let V=te=>{let O=te.clientX-S,ie=Math.min(580,Math.max(340,H+O));u.style.width=`${ie}px`,R.set("sidebarWidth",ie)},se=()=>{document.removeEventListener("mousemove",V),document.removeEventListener("mouseup",se)};document.addEventListener("mousemove",V),document.addEventListener("mouseup",se)})}let h=document.getElementById("prompt-input");h&&(h.addEventListener("input",()=>{h.style.height="auto",h.style.height=Math.min(200,h.scrollHeight)+"px"}),h.addEventListener("keydown",S=>{S.key==="Enter"&&(S.metaKey||S.ctrlKey)&&(S.preventDefault(),Ui())}));let g=document.getElementById("btn-send");g&&g.addEventListener("click",Ui);let b=document.getElementById("btn-attach-image"),k=document.getElementById("image-file-input");b&&k&&(b.addEventListener("click",()=>k.click()),k.addEventListener("change",()=>{k.files.length>0&&(nr(k.files),k.value="")})),Dm();let w=document.getElementById("btn-voice-input");if(w){let S=window.SpeechRecognition||window.webkitSpeechRecognition,H=null,F=!1,V=()=>{F=!1,w.classList.remove("is-recording"),w.innerHTML=E.mic};w.addEventListener("click",()=>{if(F){H&&H.stop();return}if(location.protocol!=="https:"&&location.hostname!=="localhost"&&location.hostname!=="127.0.0.1"){I("Voice input requires HTTPS","warning");return}H=new S,H.continuous=!1,H.interimResults=!1,H.lang=navigator.language||"en-US",H.onstart=()=>{F=!0,w.classList.add("is-recording")},H.onresult=se=>{var me,ye;let te=(ye=(me=se.results[0])==null?void 0:me[0])==null?void 0:ye.transcript;if(!te)return;let O=document.getElementById("prompt-input");if(!O)return;let ie=O.value;O.value=ie+(ie.length>0?" ":"")+te,O.dispatchEvent(new Event("input",{bubbles:!0})),O.style.height="auto",O.style.height=O.scrollHeight+"px",O.focus()},H.onerror=se=>{if(se.error==="no-speech")return;let O={"audio-capture":"No microphone found","not-allowed":"Microphone permission denied",network:"Speech service unavailable",aborted:null}[se.error];O?I(O,"warning"):O!==null&&console.warn("[VoxelSite] Voice input error:",se.error)},H.onend=()=>{V();let se=document.getElementById("prompt-input");se&&se.focus()};try{H.start()}catch(se){console.warn("[VoxelSite] Voice input failed to start:",se.message),I("Voice input unavailable","warning"),V()}})}let x=document.querySelector(".vs-prompt-area");x&&(x.addEventListener("dragover",S=>{S.preventDefault(),S.stopPropagation(),x.classList.add("vs-drag-over")}),x.addEventListener("dragleave",S=>{S.preventDefault(),S.stopPropagation(),x.classList.remove("vs-drag-over")}),x.addEventListener("drop",S=>{S.preventDefault(),S.stopPropagation(),x.classList.remove("vs-drag-over");let H=Array.from(S.dataTransfer.files).filter(F=>ir.includes(F.type));H.length>0&&nr(H)})),h&&h.addEventListener("paste",S=>{var V;let F=Array.from(((V=S.clipboardData)==null?void 0:V.items)||[]).filter(se=>se.kind==="file"&&ir.includes(se.type));if(F.length>0){S.preventDefault();let se=F.map(te=>te.getAsFile()).filter(Boolean);nr(se)}}),In();let C=document.getElementById("btn-new-chat");C&&C.addEventListener("click",vm);let _=document.getElementById("btn-scope-selector");_&&_.addEventListener("click",()=>{um()});let P=document.getElementById("btn-toggle-history");P&&P.addEventListener("click",cm);let j=document.getElementById("btn-visual-editor");j&&j.addEventListener("click",()=>fa());let Z=document.getElementById("btn-refresh-preview");Z&&Z.addEventListener("click",()=>_n());let Y=document.getElementById("btn-save-design");if(Y){Y.addEventListener("click",()=>{It()||Wi()||io()});let S=()=>{let H=R.get("pages")||[];Y.disabled=H.length===0};S(),R.on("pages",S)}let q=document.querySelectorAll("[data-device]"),de=document.getElementById("preview-frame-container");if(q.length&&de){let S={desktop:"100%",tablet:"768px",mobile:"375px"};q.forEach(H=>{H.addEventListener("click",()=>{let F=H.dataset.device,V=S[F]||"100%";F==="desktop"?(de.style.maxWidth="",de.style.width="",de.style.alignSelf=""):(de.style.maxWidth=V,de.style.width="100%",de.style.alignSelf="center"),q.forEach(se=>{se.classList.remove("vs-device-btn-active"),se.dataset.device===F&&se.classList.add("vs-device-btn-active")})})})}let Q=document.getElementById("btn-external-preview");Q&&Q.addEventListener("click",()=>{let S=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(S),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",S=>{var F,V;let H=(V=(F=S.target)==null?void 0:F.closest)==null?void 0:V.call(F,"[data-code-toggle]");H&&(S.preventDefault(),Nm(H))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",S=>{if((S.metaKey||S.ctrlKey)&&S.key==="k"){S.preventDefault(),Ao()?Po():ar();return}if(S.key==="Escape"&&Ao()){S.preventDefault(),Po();return}if(S.key==="Escape"&&Hi()){S.preventDefault(),Ni();return}if((S.metaKey||S.ctrlKey)&&S.key==="z"&&!S.shiftKey){if(Ao()||Hi()||R.get("route")!=="chat")return;let H=document.activeElement;if(H&&(H.tagName==="INPUT"||H.tagName==="TEXTAREA"))return;S.preventDefault(),rc()}if((S.metaKey||S.ctrlKey)&&S.key==="z"&&S.shiftKey){if(Ao()||Hi()||R.get("route")!=="chat")return;let H=document.activeElement;if(H&&(H.tagName==="INPUT"||H.tagName==="TEXTAREA"))return;S.preventDefault(),lc()}if(S.key==="v"&&!S.metaKey&&!S.ctrlKey&&!S.altKey&&!S.shiftKey){if(Ao()||Hi())return;let H=document.activeElement;if(H&&(H.tagName==="INPUT"||H.tagName==="TEXTAREA"||H.isContentEditable))return;let F=R.get("route");if(!or.includes(F))return;S.preventDefault(),fa()}if(S.key==="Escape"&&Zn()){if(S.preventDefault(),si())return;if(ha()){ba();return}if(Qr()){Qn();return}hn();return}}));let N=R.get("route");if(or.includes(N))try{let S=R.get("activeConversationId"),H=localStorage.getItem("vs-active-conversation"),F=S||H,V=document.getElementById("chat-messages"),se=V==null?void 0:V.querySelector(".vs-empty-state");F&&!R.get("aiStreaming")?(S||R.set("activeConversationId",F),se&&qi(F)):F||V&&V.children.length===0&&(V.innerHTML=Bn(),In())}catch{}No(),_m()}function Mm(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=R.get("pages"),s=!t||t.length===0,n=s?"Building your site":"Applying your changes",o=s?"Generating a new website can take up to 10 minutes.<br>Please be patient while the AI works.":"Small changes can take a minute, larger updates can take up to 10 minutes.",i=document.createElement("div");i.className="vs-generating-overlay",i.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">${n}</div>
    <div class="vs-gen-subtitle">${o}</div>
    <div class="vs-gen-note">Keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-metrics" id="overlay-metrics"></div>
  `,e.appendChild(i)}function ac(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function _n(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=_n;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),Fi())}));function rr(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{_n()}}window.sendPreviewMessage=rr;async function rc(){Qn(),(await $.post("/revisions/undo")).ok&&(setTimeout(()=>_n(),300),await No(),gs({silent:!0}))}async function lc(){Qn(),(await $.post("/revisions/redo")).ok&&(setTimeout(()=>_n(),300),await No(),gs({silent:!0}))}async function No(){let{ok:e,data:t}=await $.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!s,r.title=o,r.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!n,r.title=i,r.classList.toggle("opacity-40",!n))})}function jo(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function Ho(e,t){let s=document.getElementById("vs-global-status");if(!s)return;let n=s.querySelector(".vs-global-status-dot"),o=s.querySelector(".vs-global-status-text");if(!(!n||!o))switch(window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s.className="vs-global-status",e){case"saving":s.classList.add("vs-global-status--active","vs-global-status--saving"),o.textContent=t||"Saving\u2026";break;case"saved":s.classList.add("vs-global-status--active","vs-global-status--saved"),o.textContent=t||"Saved",window.__vsStatusResetTimer=setTimeout(()=>{Ho("idle")},2e3);break;case"loading":s.classList.add("vs-global-status--active","vs-global-status--loading"),o.textContent=t||"Loading\u2026";break;case"error":s.classList.add("vs-global-status--active","vs-global-status--error"),o.textContent=t||"Error",window.__vsStatusResetTimer=setTimeout(()=>{Ho("idle")},4e3);break;case"idle":default:o.textContent="";break}}function Ns(e,t="neutral",s=0){Ho(t==="success"?"saved":t==="error"?"error":"idle",e),s>0&&(window.__vsStatusResetTimer&&clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=setTimeout(()=>{Ho("idle")},s))}window.__vsSetGlobalStatus=Ho;function Mn(){let e=jo(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=r=>{s&&(r?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${E.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${E.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${E.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${E.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let r=a===1?"":"s";n.textContent=`${a} unpublished change${r}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${E.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=Mn;function Im({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var l,d;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=v=>{v.key==="Escape"&&(v.preventDefault(),r(null))},r=v=>{document.removeEventListener("keydown",a),we(i),s(v)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),ke(i,()=>r(null)),(l=document.getElementById("vs-confirm-cancel"))==null||l.addEventListener("click",()=>r(null)),(d=document.getElementById("vs-confirm-ok"))==null||d.addEventListener("click",()=>{let v=document.getElementById("vs-publish-snapshot-cb");r({createSnapshot:v?v.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var v;return(v=document.getElementById("vs-confirm-ok"))==null?void 0:v.focus()},220)})}function Bm(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=jo().hasChanges===!0?`
    <div class="vs-download-warning">
      <div class="vs-download-warning-content">
        ${E.alertTriangle}
        <span>You have unpublished changes. This export reflects your last published version.</span>
      </div>
      <a href="#" id="vs-download-publish-link" class="vs-download-publish-link">Publish first \u2192</a>
    </div>
  `:"",o=document.createElement("div");o.id="vs-download-modal-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header" style="position: relative;">
        <button id="vs-download-close" class="vs-download-close-btn" type="button" title="Close">
          ${E.x}
        </button>
        <h2 class="vs-modal-title">Download Your Website</h2>
        <p class="vs-modal-desc">Take your files anywhere. No VoxelSite required to run them.</p>
      </div>
      <div class="vs-modal-body" style="padding-top: 16px;">
        ${n}
        <div class="vs-download-cards" id="vs-download-cards">
          <button type="button" class="vs-download-card is-selected" data-format="php">
            <div class="vs-download-card-icon">
              ${E.fileCode}
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
              ${E.globe}
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
          ${E.download} Download PHP
        </button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=c=>{c.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),we(o)};o.querySelector("#vs-download-close").addEventListener("click",a),ke(o,a),document.addEventListener("keydown",i);let r=o.querySelector("#vs-download-publish-link");r&&r.addEventListener("click",c=>{c.preventDefault(),a(),setTimeout(()=>{let m=document.getElementById("btn-publish");m&&!m.disabled&&m.click()},400)});let l=o.querySelectorAll(".vs-download-card"),d=o.querySelector("#vs-download-action"),v="php";l.forEach(c=>{c.addEventListener("click",()=>{if(c.classList.contains("is-loading"))return;l.forEach(f=>f.classList.remove("is-selected")),c.classList.add("is-selected"),v=c.dataset.format;let m=v==="php"?"Download PHP":"Download HTML";d.innerHTML=`${E.download} ${m}`})});let p=!1;d.addEventListener("click",async()=>{var c;if(!p){p=!0,d.disabled=!0,d.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',l.forEach(m=>m.style.pointerEvents="none");try{let m=R.get("sessionToken"),f={"Content-Type":"application/json",Accept:"application/zip"};m&&(f["X-VS-Token"]=m);let u=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:f,credentials:"same-origin",body:JSON.stringify({format:v})});if(!u.ok){let C="Export failed.";try{let _=await u.json();C=((c=_==null?void 0:_.error)==null?void 0:c.message)||C}catch{}I(C,"error");return}let g=(u.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),b=g?g[1]:`site-${v}-${new Date().toISOString().slice(0,10)}.zip`,k=await u.blob(),w=URL.createObjectURL(k),x=document.createElement("a");x.href=w,x.download=b,x.style.display="none",document.body.appendChild(x),x.click(),setTimeout(()=>{URL.revokeObjectURL(w),x.remove()},100),I(`\u2713 ${b} downloaded`,"success")}catch{I("Download failed. Check your connection.","error")}finally{p=!1,d.disabled=!1;let m=v==="php"?"Download PHP":"Download HTML";d.innerHTML=`${E.download} ${m}`,l.forEach(f=>f.style.pointerEvents="")}}})}async function gs({silent:e=!1}={}){let t=jo();if(t.publishing){Mn();return}t.checking=!0,e||Mn();let{ok:s,data:n,error:o}=await $.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",Mn()}window.refreshPublishState=gs;function _m(){let e=jo();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),gs({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||gs({silent:!0})},15e3)}function Am(e){if(!e)return{text:"",images:[],webRefUrl:null};let t=null,s=e;s.includes("[vx-ref:")&&(s=s.replace(/\[vx-ref:(https?:\/\/[^\]]+)\]/g,(o,i)=>(t=i,"")));let n=[];return s.includes("[vx-img:")&&(s=s.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(o,i)=>(n.push(i),""))),{text:s.trim(),images:n,webRefUrl:t}}function nr(e){let t=Array.from(e),s=tc-js.length;if(s<=0){I(`Maximum ${tc} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&I(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!ir.includes(o.type)){I(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>Yu){I(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,r=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!r)return;let l=new Image;l.onload=()=>{let d=Pm(l,120);js.push({media_type:r[1],data:r[2],name:o.name,preview:a,thumbnail:d}),vr()},l.src=a},i.readAsDataURL(o)})}function Pm(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function vr(){let e=document.getElementById("image-attachments");if(e){if(js.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=js.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${y(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);js.splice(n,1),vr()})})}}function Rm(){js=[],vr()}function Mc(){let t=(R.get("pages")||[]).length>0,s=document.getElementById("website-ref-restyle-options"),n=document.getElementById("website-ref-helper"),o=document.getElementById("btn-website-ref-confirm");s&&(s.hidden=!t),n&&(n.textContent=t?"Use another website as design reference for your site.":"Uses an existing website as design reference."),o&&(o.textContent=t?"Add":"Attach")}function Ic(){Kt=null;let e=document.getElementById("website-ref-chip");e&&(e.hidden=!0);let t=document.getElementById("prompt-input");t&&(t.placeholder="Describe what you want to build...");let s=document.getElementById("btn-attach-website");s&&s.classList.remove("is-active")}function Dm(){let e=document.getElementById("btn-attach-website"),t=document.getElementById("website-ref-sheet"),s=document.getElementById("website-ref-url"),n=document.getElementById("website-ref-mode"),o=document.getElementById("btn-website-ref-confirm"),i=document.getElementById("btn-website-ref-cancel"),a=document.getElementById("website-ref-chip"),r=document.getElementById("website-ref-chip-label"),l=document.getElementById("btn-remove-website-ref"),d=document.getElementById("prompt-input");function v(c){if(p(),s&&s.classList.add("vs-input-error"),s){let m=document.createElement("div");m.className="vs-field-error vs-ref-url-error",m.textContent=c,s.insertAdjacentElement("afterend",m)}}function p(){s&&s.classList.remove("vs-input-error");let c=t==null?void 0:t.querySelector(".vs-ref-url-error");c&&c.remove()}e&&t&&e.addEventListener("click",()=>{Wi()||(Mc(),p(),t.hidden=!t.hidden,e.classList.toggle("is-active",!t.hidden||Kt!==null),!t.hidden&&s&&s.focus())}),o&&o.addEventListener("click",async()=>{var f;if(It())return;let c=(f=s==null?void 0:s.value)==null?void 0:f.trim();if(!c||!c.match(/^https?:\/\/.+/)){v("Enter a valid URL starting with http:// or https://");return}let m=o.textContent;o.disabled=!0,o.textContent="Checking\u2026",p();try{let{ok:u,data:h,error:g}=await $.post("/ai/check-url",{url:c});if(!u){v((g==null?void 0:g.message)||"Could not reach this URL.");return}let b=(h==null?void 0:h.url)||c,w=(R.get("pages")||[]).length>0;Kt={url:b,contentMode:w?(n==null?void 0:n.value)||"keep":"regenerate",restyle:w};let x="Design reference";r.textContent=`${x}: ${Fn(b)}`,r.title=b,a&&(a.hidden=!1),t&&(t.hidden=!0),e&&e.classList.add("is-active"),d&&(d.placeholder="Describe what to change (optional)...",d.focus())}catch{v("Network error \u2014 please check your connection and try again.")}finally{o.disabled=!1,o.textContent=m}}),i&&t&&i.addEventListener("click",()=>{p(),t.hidden=!0,e&&!Kt&&e.classList.remove("is-active")}),l&&l.addEventListener("click",()=>{Ic()}),s&&o&&(s.addEventListener("keydown",c=>{c.key==="Enter"&&(c.preventDefault(),o.click())}),s.addEventListener("input",p))}async function Ui(){if(It())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=js.length>0;if(!t&&!s&&!(Kt!==null)||R.get("aiStreaming"))return;if(Kt!=null&&Kt.restyle)try{let T=R.get("siteName")||"Untitled";if(!(await $.post("/designs",{name:`${T} (before restyle)`,description:`Automatic snapshot saved before restyling from ${Kt.url}`,is_system_backup:!0})).ok){I("Could not save your current design before restyling. Please try again.","error");return}}catch{I("Could not save your current design before restyling. Please try again.","error");return}e.value="",e.style.height="auto";let o=document.getElementById("chat-messages");if(!o)return;let i=[...js];Rm();let a=Kt;Ic();let r=i.length>0?`<div class="vs-msg-user-images">${i.map(T=>`<img src="${T.preview}" alt="${y(T.name)}" class="vs-msg-user-image" />`).join("")}</div>`:"",l=a?`<div class="vs-msg-user-webref"><a href="${ge(a.url)}" target="_blank" rel="noopener" title="${ge(a.url)}">${E.globe} <span>${y(Fn(a.url))}</span></a></div>`:"",d=`
    <div class="vs-msg-user mb-6 mt-4">
      ${r}
      ${l}
      ${t?`<div class="vs-msg-user-bubble">${y(t)}</div>`:""}
    </div>
  `,v=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,p=`
    <div class="vs-msg-ai mb-6" data-stream-id="${v}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${E.box}</span>
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
  `,c=o.querySelector(".vs-empty-state");c&&c.remove(),o.insertAdjacentHTML("beforeend",d+p),o.scrollTop=o.scrollHeight;let m=!0,f=80,u=()=>{m=o.scrollHeight-o.scrollTop-o.clientHeight<=f};o.addEventListener("scroll",u);let h=()=>{m&&(o.scrollTop=o.scrollHeight)},g=o.querySelector(`.vs-msg-ai[data-stream-id="${v}"]`);if(!g)return;let b=g.querySelector('[data-role="typing"]'),k=g.querySelector('[data-role="status"]'),w=g.querySelector('[data-role="stream-content"]'),x=g.querySelector('[data-role="files-section"]'),C=g.querySelector('[data-role="files"]'),_=g.querySelector('[data-role="files-label"]'),P=g.querySelector('[data-role="files-count"]'),j=g.querySelector('[data-role="files-progress"]'),Z=g.querySelector('[data-role="error"]'),Y=g.querySelector('[data-role="status-timer"]'),q=g.querySelector('[data-role="status-step"]'),de=g.querySelector('[data-role="status-tokens"]'),Q=T=>{T&&T.removeAttribute("hidden")},N=T=>{T&&T.setAttribute("hidden","")},S=Date.now(),H=0,F=Date.now(),V=!1,se=!1,te=setInterval(()=>{let T=Math.floor((Date.now()-S)/1e3),A=Math.floor(T/60),D=T%60,G=A>0?`${A}m ${D}s`:`${D}s`;if(de&&H>0){let W=H>=1e3?`~${(H/1e3).toFixed(1)}K tokens`:`${H} tokens`;de.textContent=`\xB7 ${W}`}Y&&(Y.textContent=G);let J=document.getElementById("overlay-metrics");J&&(J.textContent=G),Date.now()-F>3e5&&!V&&(V=!0,Y&&(Y.textContent=`${G} \xB7 No data for 5 min \u2014 may have stalled`,Y.style.color="var(--vs-warning, #d97706)"))},1e3);R.set("aiStreaming",!0),document.body.classList.add("vs-ai-streaming");let O=document.getElementById("btn-send");O&&(O.disabled=!0,O.classList.add("opacity-50")),Mm();let ie="",me=[],ye=!1,nt=null,dt=!0,Bt=new AbortController,_t=null,Os=g.querySelector('[data-role="stop-btn"]');Os&&Os.addEventListener("click",()=>{Bt.abort(),_t&&($.post("/ai/cancel-generation",{prompt_id:_t}).catch(()=>{}),_t=null)});let M=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let U=e.dataset.actionData,ne=null;if(U){try{ne=JSON.parse(U)}catch{}delete e.dataset.actionData}let L=t||"";if(!L)if(a)try{let T=Fn(a.url);L=a.restyle?`(restyle from: ${T})`:`(import from: ${T})`}catch{L=`(reference: ${a.url})`}else i.length>0&&(L="(see attached images)");a&&(L=`[vx-ref:${a.url}]`+L),i.length>0&&(L=i.map(A=>`[vx-img:${A.thumbnail}]`).join("")+L);let B={user_prompt:L,action_type:M,page_scope:R.get("activePageScope"),conversation_id:R.get("activeConversationId"),action_data:ne};a&&(B.action_type=a.restyle?"restyle_site":"import_site",B.action_data={url:a.url,content_mode:a.contentMode},B.page_scope=null),i.length>0&&(B.images=i.map(T=>({data:T.data,media_type:T.media_type}))),await qt("/ai/prompt",B,{signal:Bt.signal,onPromptId(T){_t=T},onConversation(T){if(T){R.set("activeConversationId",T);try{localStorage.setItem("vs-active-conversation",T)}catch{}}},onStatus(T){let A=typeof T=="string"?T:T.message||"";q&&(q.textContent=`\xB7 ${A}`),!se&&x&&!x.hasAttribute("hidden")&&_&&(_.textContent=A)},onToken(T){ie+=T,H+=Math.ceil(T.length/4),F=Date.now(),V=!1,Y&&(Y.style.color="");let A=ie.trimStart();if(!ye&&A.length>0&&(ye=A.startsWith("{")||A.startsWith("```json")||A.startsWith("```")||A.startsWith("<|")||A.startsWith("<message>")||A.startsWith("<file ")||T.includes("<|")||A.includes("<|channel|>")||A.includes('"operations"')||A.includes('"assistant_message"'),ye&&w&&(w.innerHTML="")),N(b),w&&ye){let D=ie.match(/<message>([\s\S]*?)(<\/message>|$)/);if(D){let G=D[1].trim();G&&(Q(w),w.innerHTML=ji(G))}x&&ie.includes("<file ")&&Q(x)}else w&&(Q(w),w.innerHTML=ji(ie));h()},onFile(T){if(me.push(T),x&&Q(x),P){let A=me.length;P.textContent=`${A} file${A!==1?"s":""}`}if(C){let A=T.action==="delete",D=(me.length-1)*60,G=A?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';C.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${A?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${D}ms">
            <span class="vs-file-badge-icon">${G}</span>
            <span>${y(T.path)}</span>
          </div>
        `)}nt||(dt=!0),T.path.endsWith(".css")||(dt=!1),clearTimeout(nt),nt=setTimeout(()=>{rr(dt?"voxelsite:reload-css":"voxelsite:reload"),nt=null,dt=!0},600),h()},onDone(T){se=!0,clearTimeout(nt),nt=null,clearInterval(te),N(b),N(k);let A=T.files_modified||[],D=me.length>0||A.length>0;if(x&&D){N(j),x.classList.add("vs-files-done"),_&&(_.textContent=T.partial?"Files updated (partial)":"Files updated");let z=document.createElement("div");z.className="vs-chat-action-row",z.innerHTML=`
          <button class="vs-btn vs-btn-ghost vs-btn-xs vs-chat-save-btn" title="Save current design to the library">
            ${E.save} Save to Designs
          </button>
        `,z.querySelector("button").addEventListener("click",()=>{io()}),x.insertAdjacentElement("afterend",z)}else x&&!x.hasAttribute("hidden")&&(N(j),N(x));if(w)if(T.message)Q(w),w.innerHTML=ji(T.message);else if(ye)N(w);else{let z=w.textContent||"";(z.includes("<|channel|>")||z.includes('"operations"')||z.includes('"assistant_message"')||z.includes("<file ")||z.includes("<message>"))&&(N(w),w.innerHTML="")}let G=T.missing_files||[];if((T.truncated||G.length>0)&&w){let z;G.length>0?z=`The following pages are linked in the navigation but were NOT created yet: ${G.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:z="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let W=document.getElementById("prompt-input");W&&!R.get("aiStreaming")&&(_&&(_.textContent="Generating remaining files..."),x&&(x.classList.remove("vs-files-done"),Q(x)),W.value=z,W.dataset.actionType="free_prompt",Ui())},800)}if(T.conversation_id){R.set("activeConversationId",T.conversation_id);try{localStorage.setItem("vs-active-conversation",T.conversation_id)}catch{}}let J=[...me,...A];if(J.length>0){let z=J.map($e=>$e.path||$e),W=z.some($e=>$e==="index.php"),ee=z.filter($e=>$e.endsWith(".php")&&!$e.includes("/")&&$e!=="index.php"),ue=W&&ee.length>0,re;ue?re="index.php":ee.length>0?re=ee[0]:re=W?"index.php":null,_n(re),R.set("previewDirty",!0),gs({silent:!0})}ac(),yc(),No(),o.removeEventListener("scroll",u),o.scrollTop=o.scrollHeight},onEvaluation(T){let A=(T==null?void 0:T.issues)||[];if(A.length===0)return;let D={error:0,warning:0,info:0};A.forEach(le=>D[le.severity]=(D[le.severity]||0)+1);let G={error:0,warning:1,info:2},J=[...A].sort((le,Pe)=>(G[le.severity]??3)-(G[Pe.severity]??3)),z=J.filter(le=>le.severity!=="info"),W=J.filter(le=>le.severity==="info"),ee=[];D.error>0&&ee.push(`${D.error} error${D.error!==1?"s":""}`),D.warning>0&&ee.push(`${D.warning} warning${D.warning!==1?"s":""}`),D.info>0&&ee.push(`${D.info} suggestion${D.info!==1?"s":""}`);let ue=le=>le==="error"?"var(--vs-error, #ef4444)":le==="warning"?"var(--vs-warning, #d97706)":"var(--vs-text-ghost)",re=le=>le==="error"?"rgba(239,68,68,0.08)":le==="warning"?"rgba(217,119,6,0.08)":"var(--vs-bg-raised)",$e=le=>{let Pe=le.file?` in ${le.file}`:"",qs=le.suggested_fix?`

Suggested approach: ${le.suggested_fix}`:"";return`Review this suggestion and apply if appropriate \u2014 ${le.severity}${Pe}: ${le.description}${qs}`},be=(le,Pe)=>`
        <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${ue(le.severity)}; background: ${re(le.severity)};">${y(le.severity)}</span>
            <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(le.category||"")}</span>
            ${le.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(le.file)}${le.line?":"+le.line:""}</span>`:""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(le.description||"")}</div>
          ${le.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(le.suggested_fix)}</div>`:""}
          <div style="margin-top: 4px; text-align: right;">
            <button class="vs-eval-add-to-chat" data-eval-idx="${Pe}" style="
              background: none; border: none; cursor: pointer; padding: 2px 0;
              font-size: 11px; color: var(--vs-accent); opacity: 0.7;
              transition: opacity 0.15s ease;
            " onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'">Add to chat \u2192</button>
          </div>
        </div>
      `,Me=z.map((le,Pe)=>be(le,Pe)).join(""),he=W.length>0?`
        <details style="border-top: 1px solid var(--vs-border-subtle);">
          <summary style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; cursor: pointer; user-select: none; font-size: 11px; color: var(--vs-text-ghost); list-style: none;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            ${W.length} additional suggestion${W.length!==1?"s":""}
          </summary>
          ${W.map((le,Pe)=>be(le,z.length+Pe)).join("")}
        </details>
      `:"",Be=D.error>0?"error":D.warning>0?"warning":"info",ae=ue(Be),Ae=`
        <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${Be==="error"?"rgba(239,68,68,0.15)":Be==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)"}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
          <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${ae}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Expert Review \xB7 ${ee.join(", ")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div style="border-top: 1px solid var(--vs-border-subtle);">
            <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
            ${Me}
            ${he}
          </div>
        </details>
      `,Je;x&&!x.hasAttribute("hidden")?(x.insertAdjacentHTML("afterend",Ae),Je=x.nextElementSibling):w?(w.insertAdjacentHTML("afterend",Ae),Je=w.nextElementSibling):(g.insertAdjacentHTML("beforeend",Ae),Je=g.lastElementChild),Je&&Je.addEventListener("click",le=>{let Pe=le.target.closest(".vs-eval-add-to-chat");if(!Pe)return;le.preventDefault();let qs=parseInt(Pe.dataset.evalIdx,10),Xt=J[qs];if(!Xt)return;let rt=document.getElementById("prompt-input");if(!rt)return;let Se=$e(Xt),Ne=rt.value.trim();rt.value=Ne?Ne+`

`+Se:Se,rt.focus(),rt.style.height="auto",rt.style.height=Math.min(rt.scrollHeight,200)+"px",rt.selectionStart=rt.selectionEnd=rt.value.length,Pe.textContent="\u2713 Added",Pe.style.opacity="1",setTimeout(()=>{Pe.textContent="Add to chat \u2192",Pe.style.opacity="0.7"},1500)}),h()},onWarning(T){T.toLowerCase().includes("truncat")||C&&(C.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${y(T)}</div>
        `)},onError(T){clearTimeout(nt),nt=null,clearInterval(te),N(b),N(k),Z&&(Z.textContent=T.message||"Something went wrong.",Q(Z)),ac(),j&&N(j),x&&me.length>0&&(x.classList.add("vs-files-done"),_&&(_.textContent="Files updated (partial)"))}}),R.set("aiStreaming",!1),document.body.classList.remove("vs-ai-streaming"),O&&(O.disabled=!1,O.classList.remove("opacity-50"))}function dc(){var p;hc.innerHTML=`
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
            <h1 class="vs-login-title">${ms?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${ms?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${ms?`
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
                ${ms?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${ms?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${ms?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${E.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${ms?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${ms?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
        ${(R.get("theme")||"light")==="light"?E.sun:E.moon}
      </button>
    </div>
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let c=e.type==="password";e.type=c?"text":"password",t.innerHTML=c?E.eyeOff:E.eye,t.title=c?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let c=Go();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=c==="light"?E.sun:E.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(c=>{c.addEventListener("click",()=>{let m=document.getElementById(c.dataset.toggleTarget);if(!m)return;let f=m.type==="password";m.type=f?"text":"password",c.innerHTML=f?E.eyeOff:E.eye,c.title=f?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),r=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var m,f,u;o.classList.add("hidden"),i.classList.remove("hidden");let c=document.getElementById("forgot-content");try{let g=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((m=g==null?void 0:g.data)==null?void 0:m.mode)||"file")==="email"?(c.innerHTML=`
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
          `,(f=document.getElementById("forgot-form"))==null||f.addEventListener("submit",async k=>{var P,j,Z;k.preventDefault();let w=document.getElementById("forgot-message"),x=document.getElementById("forgot-email"),C=k.target.querySelector('button[type="submit"]'),_=(P=x==null?void 0:x.value)==null?void 0:P.trim();if(_){C&&(C.disabled=!0,C.textContent="Sending...");try{let q=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:_})})).json();w&&(q.ok?(w.textContent=((j=q.data)==null?void 0:j.message)||"Recovery link sent. Check your inbox.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",x&&(x.value="")):(w.textContent=((Z=q.error)==null?void 0:Z.message)||"Failed to send recovery email.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),w.classList.remove("hidden"))}catch{w&&(w.textContent="Network error. Please try again.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}finally{C&&(C.disabled=!1,C.textContent="Send Recovery Link")}}})):(c.innerHTML=`
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
                  <button type="button" data-toggle-target="forgot-new-password" class="vs-login-eye" title="Show password">${E.eye}</button>
                </div>
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
            </form>
          `,n(),(u=document.getElementById("forgot-form"))==null||u.addEventListener("submit",async k=>{var P,j,Z;k.preventDefault();let w=document.getElementById("forgot-message"),x=(P=document.getElementById("forgot-email"))==null?void 0:P.value,C=(j=document.getElementById("forgot-new-password"))==null?void 0:j.value;if(!x||!C)return;let _=await $.post("/auth/reset-password",{email:x,new_password:C});_.ok?(w&&(w.textContent="Password reset. You can now sign in with your new password.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",w.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):w&&(w.textContent=((Z=_.error)==null?void 0:Z.message)||"Reset failed. Make sure the .reset file exists in _data/.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}))}catch{c.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),r&&r.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let d=new URLSearchParams(window.location.search).get("reset");if(d&&d.length===64&&i&&o){let c=window.location.pathname+window.location.hash;window.history.replaceState(null,"",c),o.classList.add("hidden"),i.classList.remove("hidden");let m=document.getElementById("forgot-content");m&&(m.innerHTML=`
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
              <button type="button" data-toggle-target="token-new-password" class="vs-login-eye" title="Show password">${E.eye}</button>
            </div>
          </div>
          <div>
            <label class="vs-input-label">Confirm Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-confirm-password" type="password" required minlength="8" class="vs-input" placeholder="Confirm your password">
              <button type="button" data-toggle-target="token-confirm-password" class="vs-login-eye" title="Show password">${E.eye}</button>
            </div>
          </div>
          <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
        </form>
      `,n(),(p=document.getElementById("token-reset-form"))==null||p.addEventListener("submit",async f=>{var k,w,x,C;f.preventDefault();let u=document.getElementById("forgot-message"),h=(k=document.getElementById("token-new-password"))==null?void 0:k.value,g=(w=document.getElementById("token-confirm-password"))==null?void 0:w.value,b=f.target.querySelector('button[type="submit"]');if(!h||h.length<8){u&&(u.textContent="Password must be at least 8 characters.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"));return}if(h!==g){u&&(u.textContent="Passwords do not match.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"));return}b&&(b.disabled=!0,b.textContent="Resetting...");try{let P=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:d,new_password:h})})).json();u&&(P.ok?(u.textContent=((x=P.data)==null?void 0:x.message)||"Password reset. You can now sign in.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",u.classList.remove("hidden"),f.target.querySelectorAll("input").forEach(j=>j.disabled=!0),b&&(b.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(u.textContent=((C=P.error)==null?void 0:C.message)||"Reset failed. The link may have expired.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden")))}catch{u&&(u.textContent="Network error. Please try again.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"))}finally{b&&(b.disabled=!1,b.textContent="Reset Password")}}))}let v=document.getElementById("login-form");v&&v.addEventListener("submit",async c=>{var g,b,k,w;c.preventDefault();let m=(g=document.getElementById("login-email"))==null?void 0:g.value,f=(b=document.getElementById("login-password"))==null?void 0:b.value,u=document.getElementById("login-error");if(!m||!f)return;let h=await $.post("/auth/login",{email:m,password:f});h.ok&&((k=h.data)!=null&&k.token)?(R.batch(()=>{R.set("user",h.data.user),R.set("sessionToken",h.data.token)}),bc()):u&&(u.textContent=((w=h.error)==null?void 0:w.message)||"Invalid email or password.",u.classList.remove("hidden"))}),No()}function Hi(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function ji(e){if(!e)return"";if(!window.marked)return y(e);let t=window.marked.parse(e);return Hm(t)}function Hm(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),r=a?a.split(`
`):[];if(r.length<=Ku)return;let l=r.slice(0,Xu).join(`
`)+`
...`,d=document.createElement("div");d.className="vs-code-collapse",d.setAttribute("data-code-collapse","1");let v=document.createElement("pre");v.className="vs-code-collapse-preview",v.setAttribute("data-code-preview","1");let p=document.createElement("code");o!=null&&o.className&&(p.className=o.className),p.textContent=l,v.appendChild(p),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let c=document.createElement("button");c.type="button",c.className="vs-code-collapse-toggle",c.setAttribute("data-code-toggle","1"),c.setAttribute("data-lines",String(r.length)),c.setAttribute("aria-expanded","false"),c.textContent=`More (${r.length} lines)`;let m=n.parentNode;m&&(m.replaceChild(d,n),d.appendChild(v),d.appendChild(n),d.appendChild(c))}),t.innerHTML}function Nm(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}bc();})();
