(()=>{var hi=e=>{throw TypeError(e)};var uo=(e,t,s)=>t.has(e)||hi("Cannot "+s);var me=(e,t,s)=>(uo(e,t,"read from private field"),s?s.call(e):t.get(e)),We=(e,t,s)=>t.has(e)?hi("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),rt=(e,t,s,n)=>(uo(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),ft=(e,t,s)=>(uo(e,t,"access private method"),s);var bt,yt,Gt,xt,Ts,mo,vo=class{constructor(t={}){We(this,Ts);We(this,bt,new Map);We(this,yt,new Map);We(this,Gt,!1);We(this,xt,new Map);for(let[s,n]of Object.entries(t))me(this,bt).set(s,n)}get(t,s=void 0){return me(this,bt).has(t)?me(this,bt).get(t):s}set(t,s){let n=me(this,bt).get(t);n!==s&&(me(this,bt).set(t,s),me(this,Gt)?me(this,xt).has(t)?me(this,xt).get(t).newValue=s:me(this,xt).set(t,{newValue:s,oldValue:n}):ft(this,Ts,mo).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return me(this,yt).has(t)||me(this,yt).set(t,new Set),me(this,yt).get(t).add(s),()=>{var n;(n=me(this,yt).get(t))==null||n.delete(s)}}batch(t){if(me(this,Gt)){t();return}rt(this,Gt,!0),me(this,xt).clear();try{t()}finally{rt(this,Gt,!1);for(let[s,{newValue:n,oldValue:o}]of me(this,xt))ft(this,Ts,mo).call(this,s,n,o);me(this,xt).clear()}}toJSON(){return Object.fromEntries(me(this,bt))}};bt=new WeakMap,yt=new WeakMap,Gt=new WeakMap,xt=new WeakMap,Ts=new WeakSet,mo=function(t,s,n){let o=me(this,yt).get(t);if(o)for(let a of o)try{a(s,n)}catch(r){console.error(`[state] Error in "${t}" listener:`,r)}let i=me(this,yt).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(r){console.error("[state] Error in wildcard listener:",r)}};var _=new vo({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});_.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});_.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Ms,as,rs,ls,ds,cs,wt,wn,ho,go=class{constructor(){We(this,wt);We(this,Ms,[]);We(this,as,null);We(this,rs,!1);We(this,ls,null);We(this,ds,null);We(this,cs,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return me(this,Ms).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return rt(this,as,t),this}beforeEach(t){return rt(this,ls,t),this}start(){me(this,rs)||(rt(this,rs,!0),window.addEventListener("hashchange",()=>ft(this,wt,wn).call(this)),ft(this,wt,wn).call(this))}navigate(t){window.location.hash=`/${t}`}refresh(){rt(this,ds,null),ft(this,wt,wn).call(this)}get current(){return ft(this,wt,ho).call(this)}};Ms=new WeakMap,as=new WeakMap,rs=new WeakMap,ls=new WeakMap,ds=new WeakMap,cs=new WeakMap,wt=new WeakSet,wn=async function(){if(me(this,cs))return;let t=ft(this,wt,ho).call(this),s=me(this,ds);if(!(t===s&&me(this,rs))){if(me(this,ls)&&s!==null){rt(this,cs,!0);try{if(await me(this,ls).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{rt(this,cs,!1)}}rt(this,ds,t);for(let n of me(this,Ms)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,r)=>{i[a]=decodeURIComponent(o[r+1])}),_.batch(()=>{_.set("route",n.pattern),_.set("routeParams",i)}),n.handler(i);return}}me(this,as)?(_.set("route","404"),me(this,as).call(this,t)):this.navigate("chat")}},ho=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var Ge=new go;var bi="/_studio/api/router.php",It=0;function Or(e,t){var s;t||["POST","PUT","DELETE"].includes(e)&&(It++,It===1&&((s=window.__vsSetGlobalStatus)==null||s.call(window,"saving")))}function kn(e,t,s){var n,o;s||["POST","PUT","DELETE"].includes(e)&&(It=Math.max(0,It-1),It===0&&(t?(n=window.__vsSetGlobalStatus)==null||n.call(window,"saved"):(o=window.__vsSetGlobalStatus)==null||o.call(window,"error")))}async function En(e,t,s=null,n={}){var l;let{silent:o=!1,...i}=n,a={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let c=yi();c&&(a["X-VS-Token"]=c)}s!==null&&(a["Content-Type"]="application/json");let r={method:e,headers:a,credentials:"same-origin",...i};s!==null&&(r.body=JSON.stringify(s)),Or(e,o);try{let[c,u]=t.split("?"),p=`${bi}?_path=${encodeURIComponent(c)}${u?"&"+u:""}`,d=await fetch(p,r),v=await d.json();return d.status===401?(_.get("user")&&_.set("user",null),kn(e,!1,o),v!=null&&v.error?{ok:!1,error:v.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!v.ok&&v.error?(v.error.code==="demo_mode"?(window.showToast&&window.showToast(v.error.message||"Demo mode \u2014 this action is disabled.","warning"),!o&&["POST","PUT","DELETE"].includes(e)&&(It=Math.max(0,It-1),It===0&&((l=window.__vsSetGlobalStatus)==null||l.call(window,"idle")))):kn(e,!1,o),{ok:!1,error:v.error}):(kn(e,!0,o),{ok:!0,data:v.data||v})}catch{return kn(e,!1,o),{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var $={get:(e,t)=>En("GET",e,null,t),post:(e,t,s)=>En("POST",e,t,s),put:(e,t,s)=>En("PUT",e,t,s),delete:(e,t,s)=>En("DELETE",e,t,s)};async function Kt(e,t,s={}){var g,k;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onFile:a=()=>{},onDone:r=()=>{},onEvaluation:l=()=>{},onWarning:c=()=>{},onError:u=()=>{},signal:p=null}=s,d=yi(),v={"Content-Type":"application/json",Accept:"text/event-stream"};d&&(v["X-VS-Token"]=d);let m=!1,f=0,b=0,h=t.conversation_id||null;try{let O=function(K){if(!K.trim())return;let ae="";for(let H of K.split(`
`))H.startsWith(":")||H.startsWith("data: ")&&(ae+=H.slice(6));if(!ae)return;let D;try{D=JSON.parse(ae)}catch{return}switch(D.type||"message"){case"token":b++,n(D.content||"");break;case"status":o(D.message||"");break;case"conversation":h=D.conversation_id||h,i(D.conversation_id||"");break;case"file_complete":f++,a(D);break;case"done":m=!0,r(D);break;case"evaluation":l(D);break;case"warning":c(D.message||"");break;case"error":u(D);break}},x={method:"POST",headers:v,credentials:"same-origin",body:JSON.stringify(t)};p&&(x.signal=p);let[E,M]=e.split("?"),I=`${bi}?_path=${encodeURIComponent(E)}${M?"&"+M:""}`,R=await fetch(I,x);if(!R.ok){let K=await R.json().catch(()=>null);u({code:((g=K==null?void 0:K.error)==null?void 0:g.code)||"http_error",message:((k=K==null?void 0:K.error)==null?void 0:k.message)||`Server error (${R.status})`});return}let U=R.body.getReader(),te=new TextDecoder,G="";for(;;){let{done:K,value:ae}=await U.read();if(K)break;G+=te.decode(ae,{stream:!0});let D=G.split(`

`);G=D.pop();for(let T of D)O(T)}if(G.trim()&&O(G),!m){let K=h;K?(o("Waiting for server to finish..."),await fi(K,{onDone:r,onError:u,onFile:a,onStatus:o})):(f>0||b>0)&&r({files_modified:[],message:"",soft_close:!0})}}catch(x){if(x.name==="AbortError"){r({cancelled:!0,message:"Generation stopped."});return}if(f>0||b>0){let E=h;E?(o("Server is still generating \u2014 waiting for completion..."),await fi(E,{onDone:r,onError:u,onFile:a,onStatus:o})):r({files_modified:[],message:"",soft_close:!0})}else u({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function fi(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var r;let a=0;for(let l=0;l<120;l++){await new Promise(c=>setTimeout(c,3e3));try{let{ok:c,data:u}=await $.get(`/ai/conversations/${e}`);if(!c||!((r=u==null?void 0:u.conversation)!=null&&r.prompts))continue;let p=u.conversation.prompts,d=p[p.length-1];if(!d)continue;let v=d.files_modified?JSON.parse(d.files_modified):[];if(v.length>a){for(let m=a;m<v.length;m++)n({path:v[m],action:"write"});a=v.length}if(d.status==="streaming"){let m=Math.round((Date.now()-new Date(d.created_at).getTime())/1e3);o(`Server is still generating... (${m}s)`);continue}d.status==="success"?t({message:d.ai_message||"",files_modified:v,revision_id:d.revision_id||null,polled:!0}):d.status==="partial"?t({message:d.ai_message||"",files_modified:v,partial:!0,polled:!0}):s({code:"generation_failed",message:d.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function yi(){return _.get("sessionToken")}var qr="data-theme",fo="dark";function xi(){let e=_.get("theme")||localStorage.getItem("vs-theme")||fo;return wi(e),e}function wi(e){let t=e||fo;return document.documentElement.setAttribute(qr,t),localStorage.setItem("vs-theme",t),_.set("theme",t),t}function $n(){let e=_.get("theme")||fo;return wi(e==="dark"?"light":"dark")}var ki=typeof document<"u"?document.createElement("span"):null;function y(e){return e?(ki.textContent=e,ki.innerHTML):""}function ue(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var Fr={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function Bs(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(Fr))if(t.endsWith(s))return n;return"plaintext"}function bo(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function Is(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),r=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:r===1?"Yesterday":r<30?`${r} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function _s(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function As(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function Ps(e,t=40){if(!e)return"";let s=e.replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/+$/,"");return s.length>t&&(s=s.substring(0,t-1)+"\u2026"),s}function ge(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function he(e,t){let s=null;e.addEventListener("mousedown",n=>{s=n.target}),e.addEventListener("click",n=>{n.target===e&&s===e&&t(n)})}function ye({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var u,p;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let r=document.createElement("div");r.id="vs-confirm-overlay",r.className="vs-modal-overlay",r.innerHTML=`
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
    `;let l=d=>{d.key==="Escape"&&(d.preventDefault(),c(!1))},c=d=>{document.removeEventListener("keydown",l),ge(r),i(d)};document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible")),he(r,()=>c(!1)),(u=document.getElementById("vs-confirm-cancel"))==null||u.addEventListener("click",()=>c(!1)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>c(!0)),document.addEventListener("keydown",l),setTimeout(()=>{var d;return(d=document.getElementById("vs-confirm-ok"))==null?void 0:d.focus()},220)})}function yo({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:r="",inputPattern:l=""}){return new Promise(c=>{var b,h;let u=document.getElementById("vs-prompt-overlay");u&&u.remove();let p=document.createElement("div");p.id="vs-prompt-overlay",p.className="vs-modal-overlay";let d=l?` pattern="${y(l)}"`:"",v=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${y(n)}" style="resize: vertical;">${y(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${y(n)}" value="${y(o)}"${d}>`;p.innerHTML=`
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
    `;let m=g=>{ge(p),c(g)};document.body.appendChild(p),requestAnimationFrame(()=>p.classList.add("is-visible"));let f=p.querySelector("#vs-prompt-input");setTimeout(()=>f==null?void 0:f.focus(),220),he(p,()=>m(null)),(b=p.querySelector("#vs-prompt-cancel"))==null||b.addEventListener("click",()=>m(null)),(h=p.querySelector("#vs-prompt-ok"))==null||h.addEventListener("click",()=>{m(((f==null?void 0:f.value)||"").trim())}),f==null||f.addEventListener("keydown",g=>{a==="textarea"?g.key==="Enter"&&(g.metaKey||g.ctrlKey)&&(g.preventDefault(),m(((f==null?void 0:f.value)||"").trim())):g.key==="Enter"&&(g.preventDefault(),m(((f==null?void 0:f.value)||"").trim())),g.key==="Escape"&&(g.preventDefault(),m(null))})})}var zr=new Set(["page","partial","component"]),Ur=new Set(["partial","component"]),xo={unsafe:"Contains dynamic PHP. Use the Code Editor for full control."};function Xt(e){if(!e||typeof e!="object")return{sourceFile:"",sourceKind:"unsafe",nodeKey:"",includeChain:[],instanceKey:"",editable:!1};let t=typeof e.sourceFile=="string"?e.sourceFile:"",s=typeof e.sourceKind=="string"?e.sourceKind:"unsafe",n=typeof e.nodeKey=="string"?e.nodeKey:"",o=e.editable===!0||e.editable==="true",i=[];Array.isArray(e.includeChain)?i=e.includeChain:typeof e.includeChain=="string"&&e.includeChain&&(i=e.includeChain.split(",").map(r=>r.trim()).filter(Boolean));let a=[t,s,n].filter(Boolean).join("::");return{sourceFile:t,sourceKind:s,nodeKey:n,includeChain:i,instanceKey:a,editable:o}}function Cn(e){return e?zr.has(e.sourceKind)&&e.editable:!1}function Ei(e){return e?Cn(e)?null:e.sourceKind==="unsafe"&&!e.sourceFile?"Could not determine the source file. Changes cannot be saved safely.":xo[e.sourceKind]||xo.unsafe:xo.unsafe}function $i(e){return e?Ur.has(e.sourceKind):!1}var C={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',inbox:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',panelLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',palette:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',mic:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>',micOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M16.95 16.95A7 7 0 0 1 5 12v-2"/><path d="M18.89 13.23A7 7 0 0 0 19 12v-2"/><path d="m2 2 20 20"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/></svg>'};var Ci={success:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'},Li='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Si=["success","error","warning","info"];function Ti(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function Rs(e){e._dismissed||(e._dismissed=!0,e._autoTimer&&(clearTimeout(e._autoTimer),e._autoTimer=null),e.classList.add("vs-toast-exit"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>{e.parentNode&&e.remove()},250))}function S(e,t="success",s=3200){var a;if(!e)return;let n=Ti(),o=Si.includes(t)?t:"success",i=document.createElement("div");i.className=`vs-toast vs-toast-${o}`,i.innerHTML=`
    <span class="vs-toast-icon">${Ci[o]}</span>
    <span class="vs-toast-message">${y(String(e))}</span>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${Li}</button>
    <div class="vs-toast-progress" style="animation-duration: ${s}ms;"></div>
  `,(a=i.querySelector(".vs-toast-dismiss"))==null||a.addEventListener("click",r=>{r.stopPropagation(),Rs(i)}),n.appendChild(i),i._autoTimer=setTimeout(()=>Rs(i),s)}window.showToast=S;function Ds(e,t,s,n="success"){var l,c;if(!e)return;let o=Ti(),i=Si.includes(n)?n:"success",a=8e3,r=document.createElement("div");r.className=`vs-toast vs-toast-${i}`,r.style.cursor="default",r.innerHTML=`
    <span class="vs-toast-icon">${Ci[i]}</span>
    <span class="vs-toast-message">${y(String(e))}</span>
    <button type="button" class="vs-toast-action">${y(t)}</button>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${Li}</button>
    <div class="vs-toast-progress" style="animation-duration: ${a}ms;"></div>
  `,(l=r.querySelector(".vs-toast-action"))==null||l.addEventListener("click",u=>{u.stopPropagation(),s(),Rs(r)}),(c=r.querySelector(".vs-toast-dismiss"))==null||c.addEventListener("click",u=>{u.stopPropagation(),Rs(r)}),o.appendChild(r),r._autoTimer=setTimeout(()=>Rs(r),a)}var Hs=null;function Mi(){return`
    <div class="vs-editor-layout">
      <!-- File Tree Sidebar -->
      <div id="editor-sidebar" class="vs-editor-sidebar" style="position: relative; display: flex; flex-direction: column;${(()=>{try{let e=JSON.parse(sessionStorage.getItem("vs-editor-state"));return e!=null&&e.sidebarWidth?` width: ${e.sidebarWidth}px;`:""}catch{return""}})()}">
        <div class="vs-editor-sidebar-header">
          <span class="vs-editor-sidebar-title">Explorer</span>
          <div style="display:flex;gap:2px;">
            <button id="editor-new-file" class="vs-btn vs-btn-ghost vs-btn-icon" title="New file" style="width:24px;height:24px;">
              ${C.filePlus}
            </button>
            <button id="editor-refresh-tree" class="vs-btn vs-btn-ghost vs-btn-icon" title="Refresh file list" style="width:24px;height:24px;">
              ${C.rotateCcw}
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
        <div class="vs-editor-topbar" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface); height: 44px;">
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
          <div class="vs-editor-controls" style="display: flex; align-items: center; gap: 6px; padding: 0 12px;">
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
              <div class="vs-empty-state-icon">${C.fileCode}</div>
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
  `}async function Bi(){var P;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,sidebarWidth:(e==null?void 0:e.sidebarWidth)||null,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(w=>w.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(w=>w.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,sidebarWidth:t.sidebarWidth,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),r=document.getElementById("editor-host"),l=document.getElementById("editor-empty-state"),c=document.getElementById("editor-monaco-container"),u=document.getElementById("editor-file-info"),p=document.getElementById("editor-status"),d=document.getElementById("editor-save-btn"),v=document.getElementById("editor-refresh-tree"),m=document.getElementById("editor-new-file"),f=document.getElementById("editor-sidebar"),b=document.getElementById("editor-sidebar-resize"),h=document.getElementById("editor-font-size-select"),g=document.getElementById("editor-word-wrap-btn");h&&(h.value=t.fontSize);let k=()=>{g&&(t.wordWrap?(g.style.color="var(--vs-accent)",g.style.backgroundColor="var(--vs-accent-dim)"):(g.style.color="var(--vs-text-ghost)",g.style.backgroundColor="transparent"))};k();let x=(w,B="muted")=>{p&&(p.textContent=w,p.dataset.state=B)},E=w=>{let B=t.files.find(A=>A.path===w);return(B==null?void 0:B.readonly)===!0},M=w=>{let B=w.toLowerCase();return B.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':B.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':B.endsWith(".js")||B.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},I=(w,B="")=>{let A=[],N={},q=J=>{if(N[J])return N[J];let Y=J.split("/"),ie=Y[Y.length-1],ee=Y.slice(0,-1).join("/"),le=B?B+J:J,ve={name:ie,path:le,type:"folder",children:[]};return N[J]=ve,ee?q(ee).children.push(ve):A.push(ve),ve};for(let J of w){let ie=(B&&J.path.startsWith(B)?J.path.substring(B.length):J.path).split("/");if(ie.length===1)A.push({name:ie[0],path:J.path,type:"file",meta:J});else{let ee=ie.slice(0,-1).join("/");q(ee).children.push({name:ie[ie.length-1],path:J.path,type:"file",meta:J})}}let Q=J=>{J.sort((Y,ie)=>Y.type!==ie.type?Y.type==="folder"?-1:1:Y.name.localeCompare(ie.name));for(let Y of J)Y.type==="folder"&&Q(Y.children)};return Q(A),A},R=()=>{if(!n)return;let w=(Q,J=0)=>Q.map(Y=>{var pe,se;if(Y.type==="folder"){let fe=t.expandedFolders.has(Y.path);return`
            <div class="vs-tree-item" data-folder="${y(Y.path)}" style="--tree-indent: ${J};">
              <span class="vs-tree-folder-toggle" data-expanded="${fe}">${C.chevronRight}</span>
              <span class="vs-tree-item-icon">${fe?C.folderOpen||C.folder:C.folder}</span>
              <span class="vs-tree-item-name">${y(Y.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${y(Y.path)}" data-collapsed="${!fe}">
              ${w(Y.children,J+1)}
            </div>
          `}let ie=t.activeTab===Y.path,ee=t.openTabs.find(fe=>fe.path===Y.path),le=ee!=null&&ee.dirty?" \u2022":"",Be=E(Y.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",xe=((pe=Y.meta)==null?void 0:pe.custom)===!0,ke=((se=Y.meta)==null?void 0:se.protected)===!0,Ce="";return Y.path==="assets/css/tailwind.css"?Ce=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:ke?xe&&(Ce=`
            <button class="vs-tree-item-restore" data-restore-file="${y(Y.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):Ce=`
            <button class="vs-tree-item-delete" data-delete-file="${y(Y.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${y(Y.path)}" data-active="${ie}" style="--tree-indent: ${J};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${M(Y.path)}</span>
            <span class="vs-tree-item-name">${y(Y.name)}${Be}${le}</span>
            ${Ce}
          </div>
        `}).join(""),B=(Q,J,Y)=>{let ie=Y.querySelector(".vs-explorer-caret");t.expandedSections.has(Q)?(J.style.display="block",Y.classList.add("is-expanded")):(J.style.display="none",Y.classList.remove("is-expanded"))},A=document.querySelector('[data-section="site"]'),N=document.querySelector('[data-section="config"]'),q=document.querySelector('[data-section="prompts"]');A&&B("site",n,A),N&&o&&B("config",o,N),q&&i&&B("prompts",i,q),n.innerHTML=w(t.treeData.site),o&&(o.innerHTML=w(t.treeData.config)),i&&(i.innerHTML=w(t.treeData.prompts)),ut()},U=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(w=>{let B=w.path===t.activeTab,A=w.path.split("/").pop(),q=E(w.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${y(w.path)}" data-active="${B}" data-dirty="${w.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${y(A)}${q}</span>
          <button class="vs-editor-tab-close" data-close-tab="${y(w.path)}" title="Close">${C.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',ht(),K()}},te=null,G=w=>{if(!a)return;let B=8,A=()=>{a.scrollLeft+=w==="left"?-B:B,K()};A(),te=setInterval(A,16)},O=()=>{te&&(clearInterval(te),te=null)},K=()=>{let w=document.getElementById("editor-tab-scroll-left"),B=document.getElementById("editor-tab-scroll-right");if(!a||!w||!B)return;let A=a.scrollLeft>0,N=a.scrollLeft<a.scrollWidth-a.clientWidth-1;w.style.display=A?"flex":"none",B.style.display=N?"flex":"none"};a&&(a.addEventListener("scroll",K,{passive:!0}),window.addEventListener("resize",K,{passive:!0}));let ae=document.getElementById("editor-tab-scroll-left"),D=document.getElementById("editor-tab-scroll-right");ae&&(ae.addEventListener("mousedown",()=>G("left")),ae.addEventListener("mouseup",O),ae.addEventListener("mouseleave",O)),D&&(D.addEventListener("mousedown",()=>G("right")),D.addEventListener("mouseup",O),D.addEventListener("mouseleave",O));let T=()=>{l&&(l.style.display="none"),c&&(c.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},H=async w=>{if(t.disposed)return;let B=t.openTabs.find(J=>J.path===w);if(B){await F(w);return}x("Loading\u2026");let{ok:A,data:N,error:q}=await $.get(`/files/content?path=${encodeURIComponent(w)}`);if(!A){S((q==null?void 0:q.message)||"Could not load file.","error"),x("Load failed","error");return}let Q=typeof(N==null?void 0:N.content)=="string"?N.content:"";B={path:w,baseline:Q,dirty:!1},t.openTabs.push(B),T(),await F(w),j(Q,w),x("Ready"),s()},F=async w=>{if(t.disposed)return;let B=t.openTabs.find(N=>N.path===t.activeTab);B&&t.monacoInstance&&(B._buffer=t.monacoInstance.getValue()),t.activeTab=w;let A=t.openTabs.find(N=>N.path===w);if(A&&t.monacoInstance){let N=A._buffer!==void 0?A._buffer:A.baseline;j(N,w)}ce(),be(),U(),setTimeout(()=>{if(a){let N=a.querySelector('.vs-editor-tab[data-active="true"]');if(N){let q=N.getBoundingClientRect(),Q=a.getBoundingClientRect();q.left<Q.left?a.scrollBy({left:q.left-Q.left,behavior:"smooth"}):q.right>Q.right&&a.scrollBy({left:q.right-Q.right,behavior:"smooth"})}}},10),R(),s()},V=async w=>{let B=t.openTabs.find(N=>N.path===w);if(B!=null&&B.dirty&&!await ye({title:"Discard unsaved changes?",description:`"${w}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let A=t.openTabs.findIndex(N=>N.path===w);if(A!==-1){if(t.openTabs.splice(A,1),t.activeTab===w){let N=t.openTabs[Math.min(A,t.openTabs.length-1)];N?await F(N.path):(t.activeTab=null,ne(),ce(),be())}U(),R(),s()}},Z=async w=>{var J,Y;if((J=window.demoGuard)!=null&&J.call(window)||(Y=window.viewerGuard)!=null&&Y.call(window))return;let B=w.split("/").pop();if(!await ye({title:"Delete file?",description:`Are you sure you want to permanently delete "${B}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;x("Deleting\u2026");let{ok:N,error:q}=await $.delete(`/files?path=${encodeURIComponent(w)}`);if(!N){S((q==null?void 0:q.message)||"Could not delete file.","error"),x("Delete failed","error");return}let Q=t.openTabs.findIndex(ie=>ie.path===w);if(Q!==-1){if(t.openTabs.splice(Q,1),t.activeTab===w){let ie=t.openTabs[Math.min(Q,t.openTabs.length-1)];ie?await F(ie.path):(t.activeTab=null,ne(),ce(),be())}U()}await L(),s(),S(`Deleted ${B}`,"success"),x("Ready")},X=async w=>{var J,Y;if((J=window.demoGuard)!=null&&J.call(window)||(Y=window.viewerGuard)!=null&&Y.call(window))return;let B=w.split("/").pop();if(!await ye({title:"Reset system prompt?",description:`Are you sure you want to reset "${B}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;x("Resetting\u2026");let{ok:N,error:q}=await $.delete(`/files?path=${encodeURIComponent(w)}`);if(!N){S((q==null?void 0:q.message)||"Could not reset file.","error"),x("Reset failed","error");return}let Q=t.openTabs.findIndex(ie=>ie.path===w);if(Q!==-1){let{ok:ie,data:ee}=await $.get(`/files/content?path=${encodeURIComponent(w)}`);if(ie&&typeof(ee==null?void 0:ee.content)=="string"){let le=t.openTabs[Q];le.baseline=ee.content,le.dirty=!1,le._buffer=ee.content,t.activeTab===w&&j(ee.content,w)}}be(),await L(),s(),S(`Reset ${B} to default`,"success"),x("Ready")},j=(w,B)=>{var N;if(!t.monacoInstance||!t.monaco)return;let A=t.monacoInstance.getModel();A&&(t.monacoInstance.setValue(w),t.monaco.editor.setModelLanguage(A,Bs(B)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((N=window.canWrite)!=null&&N.call(window))||E(B)}))},ne=()=>{l&&(l.style.display=""),c&&(c.style.display="none")},ce=()=>{if(!u)return;if(!t.activeTab){u.textContent="No file open";return}let w=t.openTabs.find(q=>q.path===t.activeTab),B=t.files.find(q=>q.path===t.activeTab),A=B!=null&&B.size?`${(Number(B.size)/1024).toFixed(1)} KB`:"",N=Bs(t.activeTab).toUpperCase();u.textContent=[t.activeTab,N,A].filter(Boolean).join(" \u2022 ")},be=()=>{var A;if(!d)return;let w=t.openTabs.find(N=>N.path===t.activeTab);if(t.activeTab?E(t.activeTab)||!((A=window.canWrite)!=null&&A.call(window)):!1){d.disabled=!0,d.textContent="Read-Only",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}if(!w||!w.dirty){d.disabled=!0,d.textContent="Saved",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}d.disabled=!1,d.textContent="Save",d.classList.remove("vs-btn-ghost"),d.classList.add("vs-btn-primary")},pt=()=>{let w=t.openTabs.find(N=>N.path===t.activeTab);if(!w||!t.monacoInstance)return;let B=t.monacoInstance.getValue(),A=w.dirty;w.dirty=B!==w.baseline,A!==w.dirty&&(be(),U(),w.dirty?x("Unsaved changes","warning"):x("Ready"))},tt=async()=>{var Q,J,Y,ie,ee;if((Q=window.demoGuard)!=null&&Q.call(window)||(J=window.viewerGuard)!=null&&J.call(window))return;let w=t.openTabs.find(le=>le.path===t.activeTab);if(!w||!w.dirty||!t.monacoInstance)return;let B=t.monacoInstance.getValue();d.disabled=!0,d.textContent="Saving\u2026",x("Saving\u2026");let{ok:A,error:N}=await $.put("/files/content",{path:w.path,content:B});if(!A){d.disabled=!1,d.textContent="Save",S((N==null?void 0:N.message)||"Could not save file.","error"),x("Save failed","error");return}w.baseline=B,w.dirty=!1,w._buffer=B,be(),U(),R(),x("Saved","success"),S(`Saved ${w.path}`,"success"),w.path.toLowerCase().endsWith(".css")?(Y=window.sendPreviewMessage)==null||Y.call(window,"voxelsite:reload-css"):(ie=window.sendPreviewMessage)==null||ie.call(window,"voxelsite:reload"),setTimeout(()=>{var le;return(le=window.refreshPreview)==null?void 0:le.call(window)},400),(ee=window.refreshPublishState)==null||ee.call(window,{silent:!0});let q=t.openTabs.find(le=>le.path==="assets/css/tailwind.css");q&&w.path!=="assets/css/tailwind.css"&&$.get("/files/content?path=assets/css/tailwind.css").then(({ok:le,data:ve})=>{le&&typeof(ve==null?void 0:ve.content)=="string"&&(q.baseline=ve.content,q._buffer=ve.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(ve.content))})},ut=()=>{let w=B=>{B&&(B.querySelectorAll("[data-file]").forEach(A=>{A.addEventListener("click",N=>{N.target.closest("[data-delete-file]")||H(A.dataset.file)})}),B.querySelectorAll("[data-delete-file]").forEach(A=>{A.addEventListener("click",N=>{N.stopPropagation(),Z(A.dataset.deleteFile)})}),B.querySelectorAll("[data-restore-file]").forEach(A=>{A.addEventListener("click",N=>{N.stopPropagation(),X(A.dataset.restoreFile)})}),B.querySelectorAll("[data-compile-tailwind]").forEach(A=>{A.addEventListener("click",async N=>{var le,ve;if(N.stopPropagation(),(le=window.demoGuard)!=null&&le.call(window)||(ve=window.viewerGuard)!=null&&ve.call(window))return;A.style.opacity="0.4",A.style.pointerEvents="none",x("Compiling Tailwind\u2026");let{ok:q,data:Q,error:J}=await $.post("/files/compile-tailwind");if(A.style.opacity="",A.style.pointerEvents="",!q){S((J==null?void 0:J.message)||"Tailwind compilation failed.","error"),x("Compile failed","error");return}let Y="assets/css/tailwind.css",ie=t.openTabs.find(Be=>Be.path===Y);ie&&(ie.baseline=Q.content,ie.dirty=!1,t.activeTab===Y&&t.monacoInstance&&t.monacoInstance.setValue(Q.content));let ee=Q.class_count??0;S(`Tailwind CSS recompiled \u2014 ${ee} utilities.`,"success"),x("Compiled")})}),B.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(A=>{A.addEventListener("click",N=>{N.stopPropagation();let Q=A.closest(".vs-tree-item").dataset.folder;t.expandedFolders.has(Q)?t.expandedFolders.delete(Q):t.expandedFolders.add(Q),s(),R()})}))};w(n),w(o),w(i),document.querySelectorAll(".vs-explorer-section-header").forEach(B=>{B.dataset.bound||(B.dataset.bound="true",B.addEventListener("click",()=>{let A=B.dataset.section;t.expandedSections.has(A)?t.expandedSections.delete(A):t.expandedSections.add(A),s(),R()}))})},ht=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(w=>{w.addEventListener("click",B=>{B.target.closest("[data-close-tab]")||F(w.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(w=>{w.addEventListener("click",B=>{B.stopPropagation(),V(w.dataset.closeTab)})}))};if(b&&f){let w=!1;b.addEventListener("mousedown",B=>{B.preventDefault(),w=!0,b.classList.add("is-dragging");let A=q=>{if(!w)return;let Q=Math.min(400,Math.max(200,q.clientX));f.style.width=Q+"px"},N=()=>{w=!1,b.classList.remove("is-dragging"),document.removeEventListener("mousemove",A),document.removeEventListener("mouseup",N),t.sidebarWidth=f.offsetWidth,s()};document.addEventListener("mousemove",A),document.addEventListener("mouseup",N)})}d==null||d.addEventListener("click",tt),h==null||h.addEventListener("change",w=>{let B=parseInt(w.target.value,10);t.fontSize=B,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:B}),s()}),g==null||g.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,k(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),v==null||v.addEventListener("click",()=>L()),m==null||m.addEventListener("click",async()=>{var J,Y,ie;if((J=window.demoGuard)!=null&&J.call(window)||(Y=window.viewerGuard)!=null&&Y.call(window))return;let w=await yo({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!w||!w.trim())return;let B=w.trim(),A=(ie=B.split(".").pop())==null?void 0:ie.toLowerCase(),N=["php","css","js","json"];if(!A||!N.includes(A)){S(`Only ${N.join(", ")} files can be created.`,"warning");return}x("Creating\u2026");let{ok:q,error:Q}=await $.post("/files/create",{path:B});if(!q){S((Q==null?void 0:Q.message)||"Could not create file.","error"),x("Create failed","error");return}await L(),await H(B),S(`Created ${B}`,"success")});let zt=w=>{if(t.disposed){document.removeEventListener("keydown",zt);return}(w.metaKey||w.ctrlKey)&&w.key==="s"&&(w.preventDefault(),tt())};document.addEventListener("keydown",zt);let L=async()=>{var N;let{ok:w,data:B,error:A}=await $.get("/files");if(!w||!((N=B==null?void 0:B.files)!=null&&N.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=B.files,t.treeData={site:I(B.files.filter(q=>!q.path.startsWith("_prompts/")&&!q.path.startsWith("_root/"))),config:I(B.files.filter(q=>q.path.startsWith("_root/")),"_root/"),prompts:I(B.files.filter(q=>q.path.startsWith("_prompts/")),"_prompts/")},R()},z=async()=>{if(!c)return;let w;try{w=await Ln()}catch{S("Monaco editor is not available.","warning");return}t.monaco=w;let B=Yt();w.editor.setTheme(B);let A=w.editor.create(c,{value:"",language:"php",theme:B,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=A,A.onDidChangeModelContent(()=>pt()),A.addCommand(w.KeyMod.CtrlCmd|w.KeyCode.KeyK,async()=>{if(t.monacoInstance.getOption(w.editor.EditorOption.readOnly)){S("Cannot use inline AI on a read-only file.","warning");return}let N=t.activeTab;if(!N)return;let q=t.monacoInstance.getModel(),Q=t.monacoInstance.getSelection(),J=q.getValueInRange(Q);if(!J||J.trim()===""){let le=t.monacoInstance.getPosition(),ve=q.getLineContent(le.lineNumber);if(ve.trim()===""){S("Highlight a block of code to edit.","warning");return}J=ve,t.monacoInstance.setSelection(new w.Range(le.lineNumber,1,le.lineNumber,q.getLineMaxColumn(le.lineNumber)))}let Y=await yo({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!Y)return;let ie=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let ee=document.createElement("div");ee.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",ee.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${C.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,c&&(c.style.position="relative",c.appendChild(ee)),x("AI is editing...","muted");try{await Kt("/ai/prompt",{user_prompt:Y,action_type:"inline_edit",action_data:{path:N,selection:J}},{onStatus:le=>{let ve=document.getElementById("ai-inline-status");ve&&(ve.textContent="Generating...")},onFile:()=>{let le=document.getElementById("ai-inline-status");le&&(le.textContent="Applying changes...")},onError:le=>{S(le.message||"Generation failed","error")},onDone:async le=>{var Be;if((Be=le.files_modified)==null?void 0:Be.some(xe=>(typeof xe=="string"?xe:(xe==null?void 0:xe.path)||"").replace(/^\//,"")===N.replace(/^\//,""))){let{ok:xe,data:ke}=await $.get(`/files/content?path=${encodeURIComponent(N)}&_t=${Date.now()}`);if(xe&&(ke!=null&&ke.content)){let Ce=ke.content;await $.put("/files/content",{path:N,content:ie}),t.monacoInstance.getModel().setValue(Ce);let pe=t.openTabs.find(se=>se.path===N);pe&&(pe._buffer=Ce,pe.baseline=ie),pt(),S("Review changes and save.","success")}}else le.partial||S("Complete (No changes made to this file)","info")}})}finally{t.monacoInstance.updateOptions({readOnly:!1}),ee.parentNode&&ee.parentNode.removeChild(ee),x("Ready","muted")}})};if(await Promise.all([L(),z()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:w,active:B}=t._pendingRestore;t._pendingRestore=null;for(let A of w){if(!t.files.some(Q=>Q.path===A))continue;let{ok:N,data:q}=await $.get(`/files/content?path=${encodeURIComponent(A)}`);N&&typeof(q==null?void 0:q.content)=="string"&&t.openTabs.push({path:A,baseline:q.content,dirty:!1})}if(t.openTabs.length>0){let A=B&&t.openTabs.find(N=>N.path===B)?B:t.openTabs[0].path;T(),await F(A),j(((P=t.openTabs.find(N=>N.path===A))==null?void 0:P.baseline)||"",A),x("Ready")}}}function Yt(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function Ln(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:Hs||(Hs=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,r){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw Hs=null,t}),Hs)}async function js(e=""){var te,G,O,K,ae;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),r=s.querySelector("#vs-code-meta"),l=s.querySelector("#vs-code-status"),c=s.querySelector("#vs-code-editor-host"),u={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},p=(D,T="muted")=>{l&&(l.textContent=D,l.dataset.state=T)},d=()=>u.files.find(D=>D.path===u.path)||null,v=()=>!!u.editor&&u.editor.getValue()!==u.baseline,m=()=>{if(!r)return;let D=d();if(!D){r.textContent="No file selected";return}let T=D.size?`${(Number(D.size)/1024).toFixed(1)} KB`:"0 KB",H=D.modified?new Date(D.modified).toLocaleString():"Unknown date";r.textContent=`${D.path} \u2022 ${T} \u2022 ${H}`},f=window.IS_DEMO||!((te=window.canWrite)!=null&&te.call(window)),b=()=>{if(f)return!0;let D=d();return(D==null?void 0:D.readonly)===!0},h=()=>{if(!o)return;if(b()){o.disabled=!0,o.textContent="Read Only",p("Read-only mode","muted");return}let T=v();o.disabled=!T,o.textContent=T?"Save Changes":"Saved",T?p("Unsaved changes","warning"):u.path&&p("Saved","success")},g=async()=>{var D;u.closed||v()&&!await ye({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(u.closed=!0,(D=u.editorCleanup)!=null&&D.dispose&&(u.editorCleanup.dispose(),u.editorCleanup=null),u.editor&&(u.editor.dispose(),u.editor=null),ge(s))},k=(D,T=null)=>{if(!u.editor)return;u.editor.setValue(D),u.baseline=D;let H=(T==null?void 0:T.language)||Bs(u.path);u.editor.setLanguage&&u.editor.setLanguage(H),u.editor.setReadOnly&&u.editor.setReadOnly(b()),m(),h()},x=async(D,{silent:T=!1}={})=>{if(!D||!u.editor)return!1;u.path=D,T||p("Loading file\u2026");let{ok:H,data:F,error:V}=await $.get(`/files/content?path=${encodeURIComponent(D)}`);if(!H)return S((V==null?void 0:V.message)||"Could not load file.","error"),p("Load failed","error"),!1;let Z=typeof(F==null?void 0:F.content)=="string"?F.content:"";return k(Z,(F==null?void 0:F.file)||d()),!0},E=async()=>v()?await ye({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,M=async D=>{if(!D||D===u.path)return;if(!await E()){n&&(n.value=u.path);return}await x(D)},I=async()=>{var F,V,Z;if(!u.editor||!u.path||!o)return;let D=u.editor.getValue();if(D===u.baseline){h();return}o.disabled=!0,o.textContent="Saving\u2026",p("Saving\u2026");let{ok:T,error:H}=await $.put("/files/content",{path:u.path,content:D});if(!T){o.disabled=!1,o.textContent="Save Changes",S((H==null?void 0:H.message)||"Could not save file.","error"),p("Save failed","error");return}u.baseline=D,h(),p("Saved","success"),S(`Saved ${u.path}`,"success"),u.path.toLowerCase().endsWith(".css")?(F=window.sendPreviewMessage)==null||F.call(window,"voxelsite:reload-css"):(V=window.sendPreviewMessage)==null||V.call(window,"voxelsite:reload"),setTimeout(()=>{var X;return(X=window.refreshPreview)==null?void 0:X.call(window)},400),(Z=window.refreshPublishState)==null||Z.call(window,{silent:!0})},R=D=>{D.key==="Escape"&&(D.preventDefault(),g())};a==null||a.addEventListener("click",()=>g()),i==null||i.addEventListener("click",async()=>{!u.path||!await E()||await x(u.path)}),o==null||o.addEventListener("click",()=>I()),n==null||n.addEventListener("change",D=>{M(D.target.value)}),s.addEventListener("click",D=>{D.target===s&&g()}),document.addEventListener("keydown",R);let U=()=>document.removeEventListener("keydown",R);s.addEventListener("transitionend",()=>{document.body.contains(s)||U()});try{let D=await $.get("/files");if(!D.ok||!((O=(G=D.data)==null?void 0:G.files)!=null&&O.length)){let V=((K=D.error)==null?void 0:K.message)||"No editable files found.";S(V,"error"),g();return}let T=D.data.files;u.files=T,n&&(n.innerHTML=T.map(V=>{let Z=V.group?`${String(V.group).toUpperCase()} \xB7 `:"";return`<option value="${y(V.path)}">${y(Z+V.path)}</option>`}).join(""));let H=((ae=T.find(V=>V.path===e))==null?void 0:ae.path)||T[0].path;u.path=H,n&&(n.value=H),c.innerHTML="";let F=null;try{F=await Ln()}catch{S("Monaco is not available yet. Using fallback editor.","warning"),p("Fallback editor active","warning")}if(F!=null&&F.editor){let V=Yt();F.editor.setTheme(V);let Z=F.editor.create(c,{value:"",language:Bs(H),theme:V,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",readOnly:b(),fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});u.editor={getValue:()=>Z.getValue(),setValue:X=>Z.setValue(X),setLanguage:X=>{let j=Z.getModel();j&&F.editor.setModelLanguage(j,X)},setReadOnly:X=>Z.updateOptions({readOnly:X}),dispose:()=>Z.dispose()},u.editorCleanup=Z.onDidChangeModelContent(()=>{h()})}else{c.innerHTML=`<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"${b()?" readonly":""}></textarea>`;let V=c.querySelector("#vs-code-editor-fallback"),Z=()=>h();V==null||V.addEventListener("input",Z),u.editor={getValue:()=>(V==null?void 0:V.value)||"",setValue:X=>{V&&(V.value=X)},setLanguage:()=>{},setReadOnly:X=>{V&&(V.readOnly=X)},dispose:()=>{V==null||V.removeEventListener("input",Z)}}}await x(H,{silent:!0}),p("Ready")}catch(D){S((D==null?void 0:D.message)||"Could not initialize code editor.","error"),g()}finally{let D=new MutationObserver(()=>{document.body.contains(s)||(U(),D.disconnect())});D.observe(document.body,{childList:!0,subtree:!0})}}var re=Object.freeze({SET_TEXT:"set_text",SET_ATTRIBUTE:"set_attribute",ADD_CLASS_TOKEN:"add_class_token",REMOVE_CLASS_TOKEN:"remove_class_token",SET_CLASS_LIST:"set_class_list",MOVE_BEFORE:"move_before",MOVE_AFTER:"move_after",INSERT_NODE:"insert_node",DELETE_NODE:"delete_node",REPLACE_HTML:"replace_html",FALLBACK:"fallback"}),Ii=0;function Je(){Ii++;let e=Math.random().toString(36).substring(2,6);return`op_${Date.now()}_${Ii}_${e}`}function ko(e,t,s,n){return{id:Je(),type:re.SET_TEXT,address:e,payload:{oldText:t,newText:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Ns(e,t,s,n,o){return{id:Je(),type:re.SET_ATTRIBUTE,address:e,payload:{attrName:t,oldValue:s,newValue:n},filePath:o||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Ai(e,t,s,n,o,i){return{id:Je(),type:re.SET_CLASS_LIST,address:e,payload:{oldClassStr:t,newClassStr:s,additions:n,removals:o},filePath:i||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Pi(e,t,s,n,o){return{id:Je(),type:re.DELETE_NODE,address:e,payload:{outerHTML:t,parentAddress:n||null,siblingIndex:typeof o=="number"?o:-1},filePath:s||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Ri(e,t,s,n){return{id:Je(),type:re.REPLACE_HTML,address:e,payload:{oldHTML:t,newHTML:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Di(e){if(!e||!e.type)return null;switch(e.type){case re.SET_TEXT:return{...e,id:Je(),payload:{oldText:e.payload.newText,newText:e.payload.oldText}};case re.SET_ATTRIBUTE:return{...e,id:Je(),payload:{attrName:e.payload.attrName,oldValue:e.payload.newValue,newValue:e.payload.oldValue}};case re.ADD_CLASS_TOKEN:return{...e,id:Je(),type:re.REMOVE_CLASS_TOKEN};case re.REMOVE_CLASS_TOKEN:return{...e,id:Je(),type:re.ADD_CLASS_TOKEN};case re.SET_CLASS_LIST:return{...e,id:Je(),payload:{oldClassStr:e.payload.newClassStr,newClassStr:e.payload.oldClassStr,additions:e.payload.removals,removals:e.payload.additions}};case re.DELETE_NODE:return{...e,id:Je(),type:re.INSERT_NODE,payload:{html:e.payload.outerHTML,parentAddress:e.payload.parentAddress||null,siblingIndex:e.payload.siblingIndex??-1}};case re.REPLACE_HTML:return{...e,id:Je(),payload:{oldHTML:e.payload.newHTML,newHTML:e.payload.oldHTML}};case re.MOVE_BEFORE:case re.MOVE_AFTER:return{...e,id:Je(),payload:{fromIndex:e.payload.toIndex,toIndex:e.payload.fromIndex}};case re.FALLBACK:return null;default:return null}}function Eo(e){var t,s,n,o,i,a,r,l,c,u,p,d,v;if(!e)return{valid:!1,reason:"Operation is null"};if(!e.type)return{valid:!1,reason:"Missing operation type"};if(!e.id)return{valid:!1,reason:"Missing operation ID"};if(e.type===re.FALLBACK)return{valid:!0};if(!e.address)return{valid:!1,reason:"Missing source address"};switch(e.type){case re.SET_TEXT:if(typeof((t=e.payload)==null?void 0:t.newText)!="string")return{valid:!1,reason:"SET_TEXT requires payload.newText"};break;case re.SET_ATTRIBUTE:if(!((s=e.payload)!=null&&s.attrName))return{valid:!1,reason:"SET_ATTRIBUTE requires payload.attrName"};break;case re.ADD_CLASS_TOKEN:case re.REMOVE_CLASS_TOKEN:if(!((n=e.payload)!=null&&n.token))return{valid:!1,reason:`${e.type} requires payload.token`};break;case re.SET_CLASS_LIST:if(!Array.isArray((o=e.payload)==null?void 0:o.additions)||!Array.isArray((i=e.payload)==null?void 0:i.removals))return{valid:!1,reason:"SET_CLASS_LIST requires payload.additions and payload.removals arrays"};break;case re.DELETE_NODE:if(!((a=e.payload)!=null&&a.outerHTML))return{valid:!1,reason:"DELETE_NODE requires payload.outerHTML"};break;case re.INSERT_NODE:if(!((r=e.payload)!=null&&r.html))return{valid:!1,reason:"INSERT_NODE requires payload.html"};if(typeof((l=e.payload)==null?void 0:l.siblingIndex)!="number"||e.payload.siblingIndex<0)return{valid:!1,reason:"INSERT_NODE requires payload.siblingIndex (>= 0) for deterministic reinsertion"};if(!((c=e.payload)!=null&&c.parentAddress))return{valid:!1,reason:"INSERT_NODE requires payload.parentAddress for reinsertion target"};break;case re.REPLACE_HTML:if(!((u=e.payload)!=null&&u.oldHTML)||!((p=e.payload)!=null&&p.newHTML))return{valid:!1,reason:"REPLACE_HTML requires payload.oldHTML and payload.newHTML"};break;case re.MOVE_BEFORE:case re.MOVE_AFTER:if(typeof((d=e.payload)==null?void 0:d.fromIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.fromIndex`};if(typeof((v=e.payload)==null?void 0:v.toIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.toIndex`};break}return{valid:!0}}function $o(e){return{[re.SET_TEXT]:"Text edit",[re.SET_ATTRIBUTE]:"Attribute change",[re.ADD_CLASS_TOKEN]:"Add class",[re.REMOVE_CLASS_TOKEN]:"Remove class",[re.SET_CLASS_LIST]:"Style change",[re.MOVE_BEFORE]:"Move element",[re.MOVE_AFTER]:"Move element",[re.INSERT_NODE]:"Insert element",[re.DELETE_NODE]:"Delete element",[re.REPLACE_HTML]:"Source edit",[re.FALLBACK]:"Legacy edit"}[e]||e}var Hi=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),ji=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]);function Os(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function Ni(e,t,s){let n=Os(e,t);if(!n)return null;if(ji.has(s)||n.trimEnd().endsWith("/>"))return{element:n,startIndex:t,endIndex:t+n.length};let o=t+n.length,i=new RegExp(`<${s}[\\s>]`,"gi"),a=new RegExp(`</${s}\\s*>`,"gi"),r=1,l=o,c=Math.min(e.length,t+5e4);for(;l<c&&r>0;){i.lastIndex=l,a.lastIndex=l;let u=i.exec(e),p=a.exec(e);if(!p)return null;let d=u?u.index:1/0,v=p.index;d<v&&d<c?(r++,l=d+u[0].length):(r--,l=v+p[0].length)}return r!==0?null:{element:e.substring(t,l),startIndex:t,endIndex:l}}function qs(e,t){if(!t)return null;let s=t.lastIndexOf(":");if(s===-1)return null;let n=parseInt(t.substring(s+1),10);if(isNaN(n)||n<0)return null;let o=/<([a-z][a-z0-9]*)[\s>]/gi,i,a=0;for(;(i=o.exec(e))!==null;){let r=i[1].toLowerCase();if(!(Hi.has(r)||e.substring(i.index,i.index+500).includes("data-vx-source"))){if(a===n){let c=Ni(e,i.index,r);return c?{...c,tag:r}:null}a++}}return null}function wo(e,t,s,n){if(n==null){let a=new RegExp(`\\s+${t}=["'][^"']*["']`,"i");return a.test(e)?e.replace(a,""):null}let o=new RegExp(`(${t}=["'])([^"']*)(["'])`,"i");return e.match(o)?e.replace(o,`$1${n}$3`):s==null?e.replace(/>$/,` ${t}="${n}">`):null}function Tn(e,t){if(!e||!e.type)return{content:t,applied:!1,reason:"null or untyped operation"};let s=Eo(e);if(!s.valid)return{content:t,applied:!1,reason:`validation failed: ${s.reason}`};if(e.type===re.FALLBACK)return{content:t,applied:!1,reason:"fallback ops are not persistable via applyOp"};switch(e.type){case re.SET_TEXT:return Vr(e,t);case re.SET_ATTRIBUTE:return Wr(e,t);case re.SET_CLASS_LIST:return Gr(e,t);case re.REPLACE_HTML:return Kr(e,t);case re.DELETE_NODE:return Xr(e,t);case re.INSERT_NODE:return Yr(e,t);default:return{content:t,applied:!1,reason:`unsupported op type: ${e.type}`}}}function Vr(e,t){var i;let{oldText:s,newText:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=qs(t,o);if(a){let r=Os(t,a.startIndex);if(r&&!ji.has(a.tag)){let l=a.element.lastIndexOf("</");if(l>r.length){let c=a.element.substring(r.length,l);if(!(s&&Sn(c)!==Sn(s))){let u=a.element.substring(l),p=r+n+u;return{content:t.substring(0,a.startIndex)+p+t.substring(a.endIndex),applied:!0,strategy:"nodeKey"}}}}}}if(s){let a=t.split(s).length-1;return a===0?{content:t,applied:!1,reason:"oldText not found in source"}:a>1?{content:t,applied:!1,reason:"ambiguous: oldText appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data (no nodeKey, no oldText)"}}function Wr(e,t){var a;let{attrName:s,oldValue:n,newValue:o}=e.payload,i=(a=e.address)==null?void 0:a.nodeKey;if(i){let r=qs(t,i);if(r){let l=Os(t,r.startIndex);if(l)if(n!=null){let c=l.includes(`${s}="${n}"`),u=l.includes(`${s}='${n}'`);if(!(!c&&!u)){let p=wo(l,s,n,o);if(p!==null)return{content:t.substring(0,r.startIndex)+p+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}else{let c=wo(l,s,n,o);if(c!==null)return{content:t.substring(0,r.startIndex)+c+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}}if(n!=null){let r=`${s}="${n}"`,l=t.split(r).length-1;if(l===0){let c=`${s}='${n}'`,u=t.split(c).length-1;return u===0?{content:t,applied:!1,reason:`attribute ${s}="${n}" not found`}:u>1?{content:t,applied:!1,reason:`ambiguous: ${s}='${n}' appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}='${_i(n)}'`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(c,`${s}='${o}'`),applied:!0,strategy:"contentMatch"}}return l>1?{content:t,applied:!1,reason:`ambiguous: ${s}="${n}" appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}="${_i(n)}"`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(r,`${s}="${o}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_attribute"}}function Gr(e,t){var i;let{oldClassStr:s,newClassStr:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=qs(t,o);if(a){let r=Os(t,a.startIndex);if(r&&!(s&&!r.includes(`class="${s}"`)&&!r.includes(`class='${s}'`))){let l=wo(r,"class",s,n);if(l!==null)return{content:t.substring(0,a.startIndex)+l+t.substring(a.startIndex+r.length),applied:!0,strategy:"nodeKey"}}}}if(s){let a=`class="${s}"`,r=t.split(a).length-1;return r===0?{content:t,applied:!1,reason:`class="${s}" not found in source`}:r>1?{content:t,applied:!1,reason:`ambiguous: class="${s}" appears multiple times`}:{content:t.replace(a,`class="${n}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_class_list"}}function Kr(e,t){let{oldHTML:s,newHTML:n}=e.payload,o=t.split(s).length-1;return o===0?{content:t,applied:!1,reason:"oldHTML not found in source"}:o>1?{content:t,applied:!1,reason:"ambiguous: oldHTML appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}function Xr(e,t){var o;let{outerHTML:s}=e.payload,n=(o=e.address)==null?void 0:o.nodeKey;if(n){let i=qs(t,n);if(i&&!(s&&Sn(i.element)!==Sn(s)))return{content:t.substring(0,i.startIndex)+t.substring(i.endIndex),applied:!0,strategy:"nodeKey"}}if(s){let i=t.split(s).length-1;return i===0?{content:t,applied:!1,reason:"element outerHTML not found in source"}:i>1?{content:t,applied:!1,reason:"ambiguous: element outerHTML appears multiple times"}:{content:t.replace(s,""),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for delete_node"}}function Yr(e,t){let{html:s,parentAddress:n,siblingIndex:o}=e.payload;if(!(n!=null&&n.nodeKey))return{content:t,applied:!1,reason:"insert_node requires parentAddress.nodeKey"};let i=qs(t,n.nodeKey);if(!i)return{content:t,applied:!1,reason:"parent element not found by nodeKey"};let a=Os(t,i.startIndex);if(!a)return{content:t,applied:!1,reason:"cannot parse parent opening tag"};let r=i.startIndex+a.length,l=i.element.lastIndexOf("</");if(l<=a.length)return{content:t,applied:!1,reason:"cannot determine parent inner content"};let c=i.element.substring(a.length,l),u=i.startIndex+a.length,p=/<([a-z][a-z0-9]*)[\s>]/gi,d,v=0,m=0;for(;(d=p.exec(c))!==null;){let h=d[1].toLowerCase();if(Hi.has(h))continue;if(v===o){m=d.index;break}let g=Ni(c,d.index,h);g&&(p.lastIndex=g.endIndex),v++}v<o&&(m=c.length);let f=u+m;return{content:t.substring(0,f)+s+t.substring(f),applied:!0,strategy:"nodeKey"}}function _i(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Sn(e){return(e||"").replace(/\s+/g," ").trim()}var Oi=50,Ze=[],kt=[],Jr=new Set;function Fs(e,t){if(!e)return!1;let s=Di(e);if(!s)return console.warn("[VX History] Op is not invertible \u2014 skipping history entry:",e.type,e.id),!1;let n=Eo(s);return n.valid?(Ze.push({forwardOp:e,inverseOp:s,timestamp:Date.now(),filePath:t||e.filePath||""}),Ze.length>Oi&&(Ze=Ze.slice(Ze.length-Oi)),kt=[],Mn(),!0):(console.warn("[VX History] Inverse op failed validation \u2014 skipping:",n.reason),!1)}function qi(){return Ze.length===0?null:Ze[Ze.length-1]}function Fi(){if(Ze.length===0)return null;let e=Ze.pop();return kt.push(e),Mn(),e}function zi(){return kt.length===0?null:kt[kt.length-1]}function Ui(){if(kt.length===0)return null;let e=kt.pop();return Ze.push(e),Mn(),e}function Co(e){let t=Ze.length>0||kt.length>0;Ze=[],kt=[],t&&console.info("[VX History] Cleared:",e),Mn()}function Mn(){for(let e of Jr)try{e()}catch(t){console.error("[VX History] Listener error:",t)}}var ze=!1,Ne=null,Ue=null,Jt=[],Bn=!1,Lo=[],Zr=200,Vi=!1,us=0,Le={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function Po(){ze=!ze,ma(),oe({type:"vx-editor:toggle",active:ze}),ze||(Ve(),_n(),Qe(),lt(),Ne=null,Rt=!1)}function Us(){return ze}function ea(){return ze&&Ne!==null}function Ro(){return!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")}function Do(){Qe(),lt()}function Ho(){return Oe?(Oe.abort(),Oe=null,oe({type:"vx-editor:hide-ai-overlay"}),!0):!1}function gs(){ze&&(ze=!1,ma(),oe({type:"vx-editor:toggle",active:!1}),Ve(),_n(),Qe(),lt(),Ne=null,Rt=!1)}function Vs(){Ve(),_n(),Qe(),lt(),Ne=null,Ue=null,Rt=!1,oe({type:"vx-editor:deselect-from-parent"})}function ta(){if(Vi)return;Vi=!0,window.addEventListener("message",Qr),document.addEventListener("keydown",t=>{if(ze&&(t.metaKey||t.ctrlKey)&&t.key==="e"){let s=document.activeElement;if(s){let o=s.tagName;if(o==="INPUT"||o==="TEXTAREA"||o==="SELECT"||o==="BUTTON"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor"))return}let n=Ue;n&&!Cn(n)&&n.sourceFile&&(t.preventDefault(),js(n.sourceFile),Ve())}}),document.addEventListener("keydown",t=>{if(!ze||!(t.metaKey||t.ctrlKey)||t.key!=="z")return;let s=document.activeElement;if(s){let n=s.tagName;if(n==="INPUT"||n==="TEXTAREA"||n==="SELECT"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor, .monaco-editor"))return}t.preventDefault(),t.shiftKey?Gl():Wl()});let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{Rt&&sa(),us>0?us--:Co("preview iframe reloaded"),ze&&setTimeout(()=>oe({type:"vx-editor:toggle",active:!0}),200)})}function Qr(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":Ne=e.data,Ue=Xt(e.data.sourceAddress),Qe(),lt(),ra(e.data);break;case"vx-editor:text-changed":In(e.data),e.data.changeKind||(clearTimeout(In._timer),(async()=>{for(;Bn;)await new Promise(t=>setTimeout(t,50));await Promise.all([ms(),new Promise(t=>setTimeout(t,400))]),oe({type:"vx-editor:text-save-complete"})})());break;case"vx-editor:source-edit-changed":va(e.data);break;case"vx-editor:element-deleted":_o(e.data);break;case"vx-editor:deselect":Ve(),_n(),Qe(),lt(),Ne=null,Ue=null;break;case"vx-editor:save-request":ms();break;case"vx-editor:editing-started":el(e.data);break;case"vx-editor:editing-ended":sa();break;case"vx-editor:selection-state":tl(e.data);break;case"vx-editor:element-rect":sl(e.data);break;case"vx-editor:richtext-link-request":aa();break;case"vx-editor:add-section-request":Al(e.data);break;case"vx-editor:section-moved":Fl(e.data);break;case"vx-editor:bridge-ready":us>0?us--:Co("bridge re-initialized"),ze&&oe({type:"vx-editor:toggle",active:!0});break;case"vx-editor:source-edit-ready":dl(e.data);break;case"vx-editor:escape-pressed":if(Ho())break;if(Ro()){Do();break}gs();break}}var Rt=!1,jo=!1,At=null,vs={},_t=null,ps=[],Mo=null;function el(e){Rt=!0,jo=!!e.hasPhp,At=e.rect||null,vs={},Mo=e.tagName||"P",Ve(),nl()}function sa(){Rt=!1,jo=!1,At=null,vs={},ia()}function tl(e){if(Rt){if(e.elementRect&&(At=e.elementRect,na()),!e.hasSelection){vs={},_t=null,ps=[],Wi();return}vs=e.formatting||{},Mo=e.blockTag||Mo,_t=e.link||null,ps=e.linkClasses||[],Wi()}}function sl(e){Rt&&e.rect&&(At=e.rect,na())}function na(){let e=document.getElementById("vx-richtext-toolbar");e&&oa(e)}function nl(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),oa(e),ol(e),e.classList.add("vx-rt-visible")}function oa(e){if(!At)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+At.left,o=s.top+At.top,i=At.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function ol(e){var i;let t=vs,s=jo;e.innerHTML=`<div class="vx-rt-actions">
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
  </div>`,e.querySelectorAll("[data-cmd]").forEach(a=>{a.addEventListener("click",r=>{r.stopPropagation();let l=a.dataset.cmd;if(l==="insertLink"){aa();return}oe({type:"vx-editor:richtext-command",command:l})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",a=>{a.stopPropagation(),oe({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",a=>{a.stopPropagation(),oe({type:"vx-editor:save-edit"})})}function Wi(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=vs,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function ia(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function _n(){ia()}function aa(){let e=_t?_t.href:"",t=_t?_t.target:"",s=_t&&_t.className||"",n=ps.length>0||!!s,o=`<option value=""${s?"":" selected"}>No class</option>`;if(ps.length>0){let p=ps.includes(s);o+=ps.map(d=>`<option value="${nt(d)}"${s===d?" selected":""}>${qe(d)}</option>`).join(""),s&&!p&&(o+=`<option value="${nt(s)}" selected>${qe(s)}</option>`)}else s&&(o+=`<option value="${nt(s)}" selected>${qe(s)}</option>`);let i=document.createElement("div");i.className="vx-modal-overlay",i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>${e?"Edit":"Insert"} Link</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <div class="vx-form-group"><label class="vx-form-label">URL</label>
          <input type="url" id="vx-link-url" class="vx-form-input" value="${nt(e)}" placeholder="https://" autocomplete="off" spellcheck="false">
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
  `,document.body.appendChild(i),i.offsetHeight,i.classList.add("vx-modal-visible"),ua(i);let a=i.querySelector("#vx-link-url");setTimeout(()=>{a.focus(),a.select()},50);let r=()=>{i.classList.remove("vx-modal-visible"),i.__vxDestroyDrag&&i.__vxDestroyDrag(),setTimeout(()=>i.remove(),200)};i.addEventListener("click",p=>{p.target===i&&r()}),i.querySelectorAll("[data-close]").forEach(p=>p.addEventListener("click",r));let l=i.querySelector("[data-remove]");l&&l.addEventListener("click",()=>{oe({type:"vx-editor:richtext-command",command:"removeLink"}),r()});let c=i.querySelector("[data-confirm]"),u=()=>{let p=a.value.trim();if(p){let d=i.querySelector("#vx-link-blank").checked,v=i.querySelector("#vx-link-class"),m=v?v.value:"";oe({type:"vx-editor:richtext-command",command:"insertLink",value:{url:p,targetBlank:d,linkClass:m}})}else oe({type:"vx-editor:richtext-command",command:"removeLink"});r()};c.addEventListener("click",u),a.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),u()),p.key==="Escape"&&(p.preventDefault(),r())})}function ra(e){var k,x;let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,canInlineEdit:i,hasImage:a}=e,r=document.getElementById("preview-iframe");if(!r)return;let l=r.getBoundingClientRect(),c=l.left+n.left+n.width/2,u=l.top+n.top-8,p=l.top+n.top+n.height+8;t.style.left=`${c}px`,u<120?(t.style.top=`${p}px`,t.classList.add("vx-tb-below")):(t.style.top=`${u}px`,t.classList.remove("vx-tb-below")),t.style.transform="";let v=Ue,m=Cn(v),f=$i(v),b=Ei(v);if(!m){let E=(v==null?void 0:v.sourceFile)||"",M=E.length>0,I=(v==null?void 0:v.sourceKind)==="loop"?"Loop":"Dynamic PHP",U=((k=navigator.platform)==null?void 0:k.includes("Mac"))?"\u2318E":"Ctrl+E",te=M?`<span class="vx-tb-readonly-sep"></span><span class="vx-tb-readonly-file">${qe(E)}</span>`:"",G=M?`<div class="vx-tb-readonly-actions">
          <button class="vx-tb-btn-primary" data-action="open-code-editor" data-file="${qe(E)}" title="Open in Code Editor (${U})">
            Open in Code Editor
            <kbd>${U}</kbd>
          </button>
        </div>`:"";t.innerHTML=`
      <div class="vx-tb-readonly">
        <div class="vx-tb-readonly-header">
          <svg class="vx-tb-readonly-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="vx-tb-readonly-kind">${qe(I)}</span>
          ${te}
        </div>
        <p class="vx-tb-readonly-msg">${qe(b)}</p>
        ${G}
      </div>`,t.classList.add("vx-tb-visible"),M&&((x=t.querySelector('[data-action="open-code-editor"]'))==null||x.addEventListener("click",O=>{O.stopPropagation();let K=O.currentTarget.dataset.file;js(K),Ve()}));return}let h="";f&&(v!=null&&v.sourceFile)&&(h+=`<div class="vx-tb-global-cue" title="Changes affect all pages that include this file">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span>Global \u2014 ${qe(v.sourceFile)}</span>
    </div>`),i&&s!=="IMG"&&(h+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"/><path d="M7 22h1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H7"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
      <span>Edit</span></button>`),a&&(h+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),h+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(h+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),v!=null&&v.sourceFile&&(h+=`<button class="vx-tb-btn" data-action="open-source" title="Edit source code" data-file="${qe(v.sourceFile)}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      <span>Source</span></button>`),h+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,h+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let g=An(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${g}</div><div class="vx-tb-actions">${h}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(E=>{E.addEventListener("click",M=>{M.stopPropagation(),il(E.dataset.action,e)})})}function Ve(){let e=document.getElementById("vx-context-toolbar");e&&(e.classList.remove("vx-tb-visible"),e.classList.remove("vx-tb-below"))}function An(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function il(e,t){switch(e){case"edit-text":oe({type:"vx-editor:start-edit",mode:"text"}),Ve();break;case"swap-image":Rl(t);break;case"edit-style":pl(t);break;case"edit-link":Hl(t);break;case"open-source":{Ve(),oe({type:"vx-editor:start-source-edit"});break}case"delete":cl(t);break;case"ask-ai":_l(t);break}}var Qt=null;function al(e){let t=e.replace(/>\s+</g,"><").trim();t=t.replace(/(<\/[^>]+>)(<)/g,`$1
$2`),t=t.replace(/(\/?>)(<[^/])/g,`$1
$2`);let s=t.split(`
`),n=0,o=[];for(let i of s){let a=i.trim();a&&(/^<\//.test(a)&&n>0&&n--,o.push("  ".repeat(n)+a),/^<[^/!][^>]*[^/]>$/.test(a)&&!/^<(br|hr|img|input|meta|link)/i.test(a)&&n++)}return o.join(`
`)}function rl(e,t,s){let n=t.lastIndexOf(":");if(n===-1)return null;let o=parseInt(t.substring(n+1),10);if(isNaN(o)||o<0)return null;let i=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),a=/<([a-z][a-z0-9]*)[\s>]/gi,r,l=0;for(;(r=a.exec(e))!==null;){let c=r[1].toLowerCase();if(!(i.has(c)||e.substring(r.index,r.index+500).includes("data-vx-source"))){if(l===o){let p=da(e,r.index,c);return p&&c===s.toLowerCase()?p:null}l++}}return null}function ll(e,t){if(t<0)return null;let s=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),n=/<([a-z][a-z0-9]*)[\s>]/gi,o,i=0;for(;(o=n.exec(e))!==null;){let a=o[1].toLowerCase();if(!(s.has(a)||e.substring(o.index,o.index+500).includes("data-vx-source"))){if(i===t)return da(e,o.index,a);i++}}return null}function la(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function da(e,t,s){let n=la(e,t);if(!n)return null;if(new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]).has(s)||n.trimEnd().endsWith("/>"))return n;let i=t+n.length,a=new RegExp(`<${s}[\\s>]`,"gi"),r=new RegExp(`</${s}\\s*>`,"gi"),l=1,c=i,u=Math.min(e.length,t+5e4);for(;c<u&&l>0;){a.lastIndex=c,r.lastIndex=c;let p=a.exec(e),d=r.exec(e);if(!d)return null;let v=p?p.index:1/0,m=d.index;v<m&&v<u?(l++,c=v+p[0].length):(l--,c=m+d[0].length)}return l!==0?null:e.substring(t,c)}async function dl(e){var V,Z;zs(!1);let{html:t,tagName:s,rect:n,filePath:o,sourceAddress:i}=e,a=document.getElementById("preview-iframe");if(!a||!t)return;let r=a.getBoundingClientRect(),l=450,c=180,u=r.width-40,p=Math.max(l,Math.min(n.width+40,u)),d=Math.max(c,Math.min(n.height+60,400)),v=r.left+n.left+n.width/2-p/2,m=r.top+n.top;v=Math.max(r.left+10,Math.min(v,r.right-p-10)),m=Math.max(r.top+10,Math.min(m,r.bottom-d-10));let f=document.createElement("div");f.className="vx-source-editor",f.style.left=`${v}px`,f.style.top=`${m}px`,f.style.width=`${p}px`,f.style.height=`${d}px`;let h=((V=navigator.platform)==null?void 0:V.includes("Mac"))?"\u2318S":"Ctrl+S";f.innerHTML=`
    <div class="vx-source-header">
      <div class="vx-source-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>Source</span>
      </div>
      <div class="vx-source-actions">
        <button class="vx-source-btn vx-source-btn-cancel" data-action="cancel">Cancel <kbd>Esc</kbd></button>
        <button class="vx-source-btn vx-source-btn-apply" data-action="apply">Apply <kbd>${h}</kbd></button>
      </div>
    </div>
    <div class="vx-source-warn" hidden></div>
    <div class="vx-source-body"></div>
  `,document.body.appendChild(f);let g=f.querySelector(".vx-source-header"),k=null;g.addEventListener("mousedown",X=>{X.target.closest("button")||(k={x:X.clientX-f.offsetLeft,y:X.clientY-f.offsetTop},X.preventDefault())});let x=X=>{k&&(f.style.left=`${X.clientX-k.x}px`,f.style.top=`${X.clientY-k.y}px`)},E=()=>{k=null};document.addEventListener("mousemove",x),document.addEventListener("mouseup",E);let M=f.querySelector(".vx-source-body"),I=(i==null?void 0:i.sourceFile)||o||vt(),R=(i==null?void 0:i.nodeKey)||"",U=null;if(R)try{let X=await $.get(`/files/content?path=${encodeURIComponent(I)}`);X.ok&&((Z=X.data)!=null&&Z.content)&&(U=rl(X.data.content,R,s))}catch{}let te=!U,G=U||t,O=al(G),K=f.querySelector('[data-action="apply"]'),ae=f.querySelector(".vx-source-warn"),D=!0,T=null;te&&(ae.textContent="\u2139 Live HTML \u2014 save may not work for this element",ae.hidden=!1,ae.style.color="var(--vs-text-ghost)",ae.style.background="transparent");function H(X){let j=ca(X,s);if(j){if(ae.style.color="",ae.style.background="",ae.textContent=`\u26A0 ${j.message}`,ae.hidden=!1,K.disabled=!0,K.classList.add("vx-source-btn-disabled"),D=!1,T&&j.line)try{let ne=T.getModel();if(ne){let ce=window.monaco||globalThis.monaco;ce!=null&&ce.editor&&ce.editor.setModelMarkers(ne,"preflight",[{startLineNumber:j.line,startColumn:1,endLineNumber:j.line,endColumn:ne.getLineMaxColumn(j.line),message:j.message,severity:ce.MarkerSeverity.Error}])}}catch{}}else if(te?(ae.textContent="\u2139 Live HTML \u2014 save may not work for this element",ae.hidden=!1,ae.style.color="var(--vs-text-ghost)",ae.style.background="transparent"):(ae.hidden=!0,ae.style.color="",ae.style.background=""),K.disabled=!1,K.classList.remove("vx-source-btn-disabled"),D=!0,T)try{let ne=T.getModel(),ce=window.monaco||globalThis.monaco;ne&&(ce!=null&&ce.editor)&&ce.editor.setModelMarkers(ne,"preflight",[])}catch{}return D}let F=null;try{let X=await Ln();if(!(X!=null&&X.editor))throw new Error("Monaco unavailable");let j=Yt();X.editor.setTheme(j),F=X.editor.create(M,{value:O,language:"html",theme:j,automaticLayout:!0,minimap:{enabled:!1},fontSize:12,lineHeight:18,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",lineNumbers:"off",glyphMargin:!1,folding:!1,renderLineHighlight:"none",overviewRulerLanes:0,hideCursorInOverviewRuler:!0,overviewRulerBorder:!1,scrollbar:{verticalScrollbarSize:6,horizontalScrollbarSize:6},padding:{top:8,bottom:8},fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"}),T=F,F.addCommand(X.KeyMod.CtrlCmd|X.KeyCode.KeyS,()=>{D&&So()}),F.addCommand(X.KeyCode.Escape,()=>{zs(!1)});let ne=null;F.onDidChangeModelContent(()=>{clearTimeout(ne),ne=setTimeout(()=>{H(F.getValue())},400)}),setTimeout(()=>{F.focus(),oe({type:"vx-editor:source-editor-mounted"})},100)}catch{M.innerHTML=`<textarea class="vx-source-fallback" spellcheck="false">${qe(O)}</textarea>`;let X=M.querySelector("textarea");X.addEventListener("keydown",ne=>{ne.key==="Escape"&&(ne.preventDefault(),zs(!1)),(ne.metaKey||ne.ctrlKey)&&ne.key==="s"&&(ne.preventDefault(),D&&So())});let j=null;X.addEventListener("input",()=>{clearTimeout(j),j=setTimeout(()=>H(X.value),400)}),setTimeout(()=>{X.focus(),oe({type:"vx-editor:source-editor-mounted"})},100)}K.addEventListener("click",()=>{D&&So()}),f.querySelector('[data-action="cancel"]').addEventListener("click",()=>zs(!1)),Qt={container:f,monacoInstance:F,originalHTML:G,formattedHTML:O,tagName:s,sourceFile:I,cleanupDrag:()=>{document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",E)}},requestAnimationFrame(()=>f.classList.add("vx-source-visible"))}async function So(){var p,d;if(!Qt||(p=window.demoGuard)!=null&&p.call(window))return;let{monacoInstance:e,container:t,tagName:s,originalHTML:n,formattedHTML:o,sourceFile:i,cleanupDrag:a}=Qt,r;if(e)r=e.getValue().trim();else{let v=t.querySelector("textarea");r=((d=v==null?void 0:v.value)==null?void 0:d.trim())||""}let l=ca(r,s);if(l){let v=t.querySelector(".vx-source-warn");v&&(v.textContent=`\u26A0 ${l.message}`,v.hidden=!1);return}if(r===o){zs(!1);return}if(e)try{e.dispose()}catch{}a(),t.classList.remove("vx-source-visible"),setTimeout(()=>t.remove(),200),Qt=null;let c=Ri(Ue,n,r,i);de(c,"created"),oe({type:"vx-editor:source-edit-saving"});let[u]=await Promise.all([va({filePath:i,originalHTML:n,newHTML:r}),new Promise(v=>setTimeout(v,500))]);if(de(c,u?"persisted":"failed"),u)if(/\<\?(?:php\b|=)/.test(r)){oe({type:"vx-editor:end-source-edit",apply:!1});let m=document.getElementById("preview-iframe");m&&m.contentWindow.location.reload()}else oe({type:"vx-editor:end-source-edit",apply:!0,html:r});else oe({type:"vx-editor:end-source-edit",apply:!1})}function ca(e,t){if(!e||!e.trim())return{message:"HTML is empty"};let s=e.trim();if(/<script\b/i.test(s))return{message:"<script> elements are not allowed"};if(/<iframe\b/i.test(s))return{message:"<iframe> elements are not allowed"};if(/\bon[a-z]+\s*=/i.test(s))return{message:"Inline event handlers (on*=) are not allowed"};let n=document.createElement("template");n.innerHTML=s;let o=n.content,i=Array.from(o.childNodes).filter(d=>d.nodeType===Node.ELEMENT_NODE);if(i.length===0)return{message:"No HTML element found"};if(i.length>1)return{message:`Expected 1 root element, found ${i.length}`};for(let d of o.childNodes)if(d.nodeType===Node.TEXT_NODE&&d.textContent.trim())return{message:"Text found outside root element \u2014 check for broken tags"};let a=i[0],r=(t||"").toUpperCase();if(r&&a.tagName!==r)return{message:`Root changed: <${r.toLowerCase()}> \u2192 <${a.tagName.toLowerCase()}>`,line:1};if(/\<\?(?:php\s+)?(?:foreach|for|while|if|else|elseif|switch)\b/.test(s)||/\<\?(?:php\s+)?(?:endforeach|endfor|endwhile|endif|endswitch)\b/.test(s))return null;let c=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]),u=s.split(`
`),p=[];for(let d=0;d<u.length;d++){let v=u[d],m=/<([a-z][a-z0-9]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*(\/?)\s*>/gi,f;for(;(f=m.exec(v))!==null;){let h=f[1].toLowerCase(),g=f[2]==="/";c.has(h)||g||p.push({tag:h,line:d+1})}let b=/<\/([a-z][a-z0-9]*)\s*>/gi;for(;(f=b.exec(v))!==null;){let h=f[1].toLowerCase();if(c.has(h))continue;if(p.length===0)return{message:`Extra </${h}> \u2014 no matching opening tag`,line:d+1,tag:h};let g=p[p.length-1];if(g.tag!==h)return{message:`Misnested: </${h}> but <${g.tag}> is still open (line ${g.line})`,line:d+1,tag:h};p.pop()}}if(p.length>0){let d=p[p.length-1];return{message:`Unclosed <${d.tag}> (line ${d.line})`,line:d.line,tag:d.tag}}return null}function zs(e,t){if(!Qt)return;let{container:s,monacoInstance:n,cleanupDrag:o}=Qt;if(oe({type:"vx-editor:end-source-edit",apply:!!e,html:e?t:void 0}),n)try{n.dispose()}catch{}o(),s.classList.remove("vx-source-visible"),setTimeout(()=>s.remove(),200),Qt=null}function cl(e){Ve();let t=An(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${qe(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>n.remove(),200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),he(n,o),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{var a;(a=window.demoGuard)!=null&&a.call(window)||(oe({type:"vx-editor:delete-element"}),o())})}var _e=new Set,Lt="",Zt=null,Pn="text",Et="padding",Ct="all",es="all",$t="tl",ts="",Pt=!1;function Qe({revertUnsaved:e=!0}={}){e&&Pt&&Lt&&(oe({type:"vx-editor:update-classes",classes:Lt.split(" ").filter(Boolean),silent:!0}),_e=new Set(Lt.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>t.remove(),200)),Pt=!1,Zt=null,Pn="text",Et="padding",Ct="all",es="all",$t="tl",ts=""}function pl(e){Ve(),Qe();let t=(e.classList||[]).filter(o=>o.trim());_e=new Set(t),Lt=t.join(" "),Pt=!1,Zt=null,Pn=Vl(t),Et="padding",Ct="all",es="all",$t="tl",ts="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${An(e.tagName,t)}</span>
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
      ${Bo()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),Ao(s),s.__vxOnResize=()=>Ao(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=No(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),Zt=null,Ke(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>Qe()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),Qe())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{_e=new Set(Lt.split(" ").filter(Boolean)),Pt=!1,oe({type:"vx-editor:update-classes",classes:[..._e],silent:!0}),Ke(Io())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>Il(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(ts=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=Bo(),Ke(Io()))}),Ke("typography")}function Bo(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=ts===t.id,n=t.id?[..._e].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function Io(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function Ke(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:ul,spacing:vl,colors:ml,layout:gl,borders:hl,effects:fl,classes:bl};t.innerHTML=(s[e]||s.classes)(),Bl(t);let n=t.querySelector(".vx-cm-active");n&&n.scrollIntoView({block:"nearest"})}function ul(){let e=$e(/^font-(sans|serif|mono)$/)||"",t=$e(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=$e(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=$e(/^text-(left|center|right|justify)$/)||"text-left",o=$e(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=$e(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=$e(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",r=$e(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Ie("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${Ie("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,Le.sizes.map(l=>({label:l,value:`text-${l}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Ie("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,Le.weights.map(l=>({label:l,value:`font-${l}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${yl(Le.aligns.map(l=>({value:`text-${l}`,label:l,icon:Ll(l)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${Ie("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,Le.leadings.map(l=>({label:l,value:`leading-${l}`})))}
        ${Ie("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,Le.trackings.map(l=>({label:l,value:`tracking-${l}`})))}
        ${Ie("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,Le.transforms.map(l=>({label:l,value:l})))}
        ${Ie("Decoration","^(no-underline|underline|line-through)$",r,Le.decorations.map(l=>({label:l,value:l})))}
      </div>
    </div>
  `}function vl(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[Et]||(Et="padding"),e[Et].prefixes[Ct]||(Ct="all");let t=e[Et],s=t.prefixes[Ct],n=kl(s),o=$l(s)||"",i=Et==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${pa(Object.keys(e).map(a=>({value:a,label:e[a].label})),Et,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${Ct===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Gi(a)}">
            ${Cl(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${Gi(Ct)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${Le.compactSpacings.map(a=>{let r=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${ss(r)?" vx-sp-pill-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${ss(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function ml(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=Pn||"text",s=t,n=El(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${Le.specialColors.map(a=>{let r=`${s}-${a.name}`,l=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,c=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${ss(r)?" vx-sp-dot-active":""}" data-set="${r}" data-pattern="${n}" style="${l}${c}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=["50","100","200","300","400","500","600","700","800","900","950"];return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-matrix">
      ${Le.colors.map(a=>`
        <div class="vx-cm-row" title="${a.name}">
          ${i.map(r=>{let l=`${s}-${a.name}-${r}`;return`<button class="vx-cm-cell${ss(l)?" vx-cm-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false" style="background:${a.shades[r]}" title="${a.name}-${r}"></button>`}).join("")}
        </div>
      `).join("")}
    </div>
  </div>`,o}function gl(){let e=wl(),t=$e(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=$e(/^gap(?:-[xy])?-/)||"",a=$e(/^grid-cols-\d+$/)||"",r=$e(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${xl(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${Ie("Direction","^flex-(row|col|row-reverse|col-reverse)$",$e(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${Ie("Justify","^justify-(start|center|end|between|around|evenly)$",$e(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${Ie("Align","^items-(start|center|end|stretch|baseline)$",$e(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${Ie("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...Le.gaps.map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${Ie("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...Le.gridCols.map(l=>({label:l,value:`grid-cols-${l}`}))])}
          ${Ie("Rows","^grid-rows-\\d+$",r,[{label:"Auto",value:""},...Le.gridRows.map(l=>({label:l,value:`grid-rows-${l}`}))])}
          ${Ie("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...Le.gaps.slice(1).map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${Ie("Position","^(static|relative|absolute|fixed|sticky)$",t,Le.positions.map(l=>({label:l,value:l})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${Ie("Top","^top-",$e(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Le.coordinates.map(l=>({label:l,value:`top-${l}`})))}
          ${Ie("Right","^right-",$e(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Le.coordinates.map(l=>({label:l,value:`right-${l}`})))}
          ${Ie("Bottom","^bottom-",$e(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Le.coordinates.map(l=>({label:l,value:`bottom-${l}`})))}
          ${Ie("Left","^left-",$e(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Le.coordinates.map(l=>({label:l,value:`left-${l}`})))}
        </div>
      </div>
    `:""}
  `}function hl(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=es==="all"?"all":$t;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${Le.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${ss(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${Ie("Style","^border-(solid|dashed|dotted|double|none)$",$e(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...Le.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${pa([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],es==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${$t==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${$t==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${$t==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${$t==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${es==="all"?"ALL":$t.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${Le.radii.map(s=>{let n=Sl(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${ss(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${Tl(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function fl(){let e=Ml();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${ss(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function bl(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[..._e].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function Ie(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${nt(o.value)}"${s===o.value?" selected":""}>${qe(o.label)}</option>`).join("")}
    </select>
  </div>`}function pa(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${qe(i.label)}</button>`).join("")}
  </div>`}function yl(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${nt(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function xl(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function wl(){let e=$e(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function kl(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function El(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function $l(e){let t=$e(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function Gi(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function Cl(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function Ll(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function Sl(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function Tl(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function Ml(){let e=$e(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function ss(e){let t=ts;return _e.has(t?t+":"+e:e)}function To(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=ts,i=o?o+":":"",a=t?new RegExp(t):null,r=e?i+e:"",l=!!r&&_e.has(r);if(a)for(let u of[..._e])if(o){if(u.startsWith(i)){let p=u.slice(i.length);a.test(p)&&_e.delete(u)}}else!/^(sm|md|lg|xl|2xl):/.test(u)&&a.test(u)&&_e.delete(u);r&&(!s||!l)&&_e.add(r),Pt=!0,oe({type:"vx-editor:update-classes",classes:[..._e],silent:!0});let c=document.getElementById("vx-sp-breakpoints");if(c&&(c.innerHTML=Bo()),n){let u=document.querySelector(".vx-color-matrix"),p=u?u.scrollTop:0;if(Ke(Io()),p){let d=document.querySelector(".vx-color-matrix");d&&(d.scrollTop=p)}}}function $e(e){let t=ts;for(let s of _e)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function Bl(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";To(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";To(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{Zt=Zt===n.dataset.family?null:n.dataset.family,Ke("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{Zt=null,Ke("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{Pn=n.dataset.cprop||"text",Zt=null,Ke("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Et=n.dataset.spaceMode||"padding",Ct="all",Ke("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{Ct=n.dataset.spaceSide||"all",Ke("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{es=n.dataset.radiusMode==="corners"?"corners":"all",Ke("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{$t=n.dataset.radiusCorner||"tl",es="corners",Ke("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");To(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>Ke("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{_e.add(i)}),Pt=!0,oe({type:"vx-editor:update-classes",classes:[..._e],silent:!0}),s.value="",Ke("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;_e.delete(i),Pt=!0,oe({type:"vx-editor:update-classes",classes:[..._e],silent:!0}),o.remove()}}})}async function Il(e){let t=[..._e].join(" ");if(t===Lt){Qe({revertUnsaved:!1});return}let s=new Set(Lt.split(" ").filter(Boolean)),n=new Set(t.split(" ").filter(Boolean)),o=[...n].filter(l=>!s.has(l)),i=[...s].filter(l=>!n.has(l)),a=Xt(e.sourceAddress||Ue),r=Ai(a,Lt,t,o,i,e.filePath);de(r,"created"),Jt.push({type:"class-change",filePath:e.filePath,originalHTML:`class="${Lt}"`,newHTML:`class="${t}"`,additions:o,removals:i,timestamp:Date.now(),_op:r}),Pt=!1,Qe({revertUnsaved:!1}),W("Saving & compiling\u2026"),await ms(),oe({type:"vx-editor:update-classes",classes:[..._e],silent:!0}),setTimeout(()=>{let l=document.getElementById("preview-iframe");l&&l.contentWindow&&l.contentWindow.postMessage("voxelsite:reload","*")},500)}function No(e,t){let s=!1,n,o,i,a,r=!1,l=p=>{if(p.target.closest("button, input, select"))return;s=!0;let d=p.touches?p.touches[0]:p;n=d.clientX,o=d.clientY;let v=e.getBoundingClientRect();i=v.left,a=v.top,t.style.cursor="grabbing",p.preventDefault(),r||(r=!0,document.addEventListener("mousemove",c),document.addEventListener("touchmove",c,{passive:!1}),document.addEventListener("mouseup",u),document.addEventListener("touchend",u))},c=p=>{if(!s)return;let d=p.touches?p.touches[0]:p,v=12,m=e.getBoundingClientRect(),f=m.width||300,b=m.height||500,h=i+d.clientX-n,g=a+d.clientY-o,k=v,x=Math.max(v,window.innerWidth-f-v),E=52,M=Math.max(E,window.innerHeight-b-v),I=Math.min(Math.max(h,k),x),R=Math.min(Math.max(g,E),M);e.style.left=`${I}px`,e.style.top=`${R}px`,e.style.right="auto"},u=()=>{s&&(s=!1,t.style.cursor="",r&&(r=!1,document.removeEventListener("mousemove",c),document.removeEventListener("touchmove",c),document.removeEventListener("mouseup",u),document.removeEventListener("touchend",u)))};return t.addEventListener("mousedown",l),t.addEventListener("touchstart",l,{passive:!1}),()=>{t.removeEventListener("mousedown",l),t.removeEventListener("touchstart",l),r&&(document.removeEventListener("mousemove",c),document.removeEventListener("touchmove",c),document.removeEventListener("mouseup",u),document.removeEventListener("touchend",u))}}function ua(e){let t=e.querySelector(".vx-modal"),s=e.querySelector(".vx-modal-header");if(!t||!s)return;s.style.cursor="grab";let n=!1,o=()=>{if(n)return;n=!0;let r=t.getBoundingClientRect();e.style.display="block",t.style.position="fixed",t.style.left=`${r.left}px`,t.style.top=`${r.top}px`,t.style.margin="0"},i=r=>{r.target.closest("button, input, select")||o()};s.addEventListener("mousedown",i,{capture:!0}),s.addEventListener("touchstart",i,{capture:!0,passive:!0});let a=No(t,s);e.__vxDestroyDrag=()=>{s.removeEventListener("mousedown",i,{capture:!0}),s.removeEventListener("touchstart",i,{capture:!0}),a()}}var Oe=null;function lt(){let e=document.getElementById("vx-ai-panel");e&&(Oe&&(Oe.abort(),Oe=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>e.remove(),180))}function _l(e){Ve(),Qe(),lt();let t=An(e.tagName,e.classList),s=document.createElement("div");s.id="vx-ai-panel",s.className="vx-ai-panel",s.tabIndex=-1,s.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${qe(t)}</span>
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
    </div>`,document.body.appendChild(s),Qi(s,null,e.rect),s.__vxOnResize=()=>Qi(s,null,e.rect),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-ai-visible")),s.__vxDestroyDrag=No(s,s.querySelector("#vx-ai-drag-handle"));let n=s.querySelector("#vx-ai-input"),o=s.querySelector("#vx-ai-send"),i=s.querySelector("#vx-ai-cancel-btn"),a=s.querySelector("#vx-ai-status"),r=s.querySelector("#vx-ai-status-text"),l=s.querySelector("#vx-ai-close");setTimeout(()=>n==null?void 0:n.focus(),200),l.addEventListener("click",()=>lt()),s.addEventListener("keydown",v=>{v.key==="Escape"&&(v.preventDefault(),v.stopPropagation(),lt())});let c=()=>{n.style.height="auto";let v=parseFloat(getComputedStyle(n).lineHeight||"20")*6+28;n.style.height=Math.min(n.scrollHeight,v)+"px"};n.addEventListener("input",c),n.addEventListener("keydown",v=>{v.key==="Enter"&&(v.metaKey||v.ctrlKey)&&(v.preventDefault(),d())}),o.addEventListener("click",d),i.addEventListener("click",()=>{Oe&&(Oe.abort(),Oe=null),p()});function u(){n.disabled=!0,o.hidden=!0,i.hidden=!1,a.hidden=!1,r.textContent="Reading your site\u2026"}function p(){n.disabled=!1,o.hidden=!1,i.hidden=!0,a.hidden=!0,n.focus()}async function d(){let v=n.value.trim();if(!v)return;lt(),oe({type:"vx-editor:show-ai-overlay",status:"AI is editing\u2026"}),Oe=new AbortController;let m=e.outerHTML||"",f=e.filePath||vt(),b=0;try{await Kt("/ai/prompt",{user_prompt:v,action_type:"section_edit",page_scope:f,action_data:{path:f,sectionHtml:m.substring(0,15e3)}},{signal:Oe.signal,onStatus(h){oe({type:"vx-editor:update-ai-status",status:h||"Working\u2026",tokens:b})},onFile(){oe({type:"vx-editor:update-ai-status",status:"Applying changes\u2026",tokens:b})},onToken(){b++,oe({type:"vx-editor:update-ai-status",status:"Generating\u2026",tokens:b})},onError(h){oe({type:"vx-editor:hide-ai-overlay"}),W(h.message||"AI edit failed",!0)},onDone(h){if(Oe=null,oe({type:"vx-editor:hide-ai-overlay"}),h.cancelled){W("Generation cancelled",!1);return}(h.files_modified||[]).length>0?(W("Section updated \u2713"),setTimeout(()=>{let k=document.getElementById("preview-iframe");k!=null&&k.contentWindow&&k.contentWindow.postMessage("voxelsite:reload","*")},400)):h.partial||W("No changes made",!1)},onWarning(h){typeof window.showToast=="function"&&window.showToast(h,"warning")}})}catch(h){h.name!=="AbortError"&&W("AI edit failed",!0),oe({type:"vx-editor:hide-ai-overlay"})}}}var Ki=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function Al(e){Ve(),Qe(),lt();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let h of Ki)(t.includes(h.id)||t.includes(h.label.toLowerCase()))&&s.add(h.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${qe(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${Ki.map(h=>{let g=s.has(h.id);return`
            <button class="vx-section-card${g?" vx-section-card-exists":""}" data-section-type="${h.id}" data-section-label="${nt(h.label)}" data-section-desc="${nt(h.description)}">
              <div class="vx-section-card-icon">${h.icon}</div>
              <div class="vx-section-card-label">${h.label}</div>
              <div class="vx-section-card-desc">${h.description}</div>
              ${g?'<div class="vx-section-card-badge">On page</div>':""}
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>n.remove(),200)},a=h=>{h.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),he(n,i),n.tabIndex=-1,n.focus();let r=null,l=null,c=n.querySelector("#vx-section-footer"),u=n.querySelector("#vx-section-footer-type"),p=n.querySelector("#vx-section-instruction"),d=n.querySelector("#vx-section-generate"),v=n.querySelector("#vx-section-change"),m=n.querySelector(".vx-section-picker-grid"),f={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(h=>{h.addEventListener("click",()=>{r=h.dataset.sectionLabel,l=h.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(g=>g.classList.remove("vx-section-card-selected")),h.classList.add("vx-section-card-selected"),u.textContent=r,p.placeholder=f[r]||"Optional: describe what you want\u2026",p.value="",c.hidden=!1,m.classList.add("vx-section-grid-collapsed"),setTimeout(()=>p.focus(),100)})}),v.addEventListener("click",()=>{r=null,l=null,c.hidden=!0,m.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(h=>h.classList.remove("vx-section-card-selected"))});let b=()=>{if(!r)return;let h=p.value.trim();i(),Pl(e,r,l,h)};d.addEventListener("click",b),p.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),b())})}async function Pl(e,t,s,n=""){oe({type:"vx-editor:show-ai-overlay",status:`Adding ${t}\u2026`});let o=e.filePath||vt();Oe=new AbortController;let i=Oe,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let r=Date.now(),l=0,c=()=>{l>0?oe({type:"vx-editor:update-ai-status",status:`Generating ${t}\u2026`,tokens:l}):Math.round((Date.now()-r)/1e3)>=6&&oe({type:"vx-editor:update-ai-status",status:`Preparing ${t}\u2026`})},u=setInterval(c,1e3),p=0,d=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await Kt("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onStatus(v){oe({type:"vx-editor:update-ai-status",status:v||`Adding ${t}\u2026`,tokens:l})},onFile(){oe({type:"vx-editor:update-ai-status",status:"Writing files\u2026",tokens:l})},onToken(){l++;let v=Date.now();v-p>500&&(p=v,c())},onError(v){clearInterval(u),Oe=null,oe({type:"vx-editor:hide-ai-overlay"}),W(v.message||"Failed to add section",!0)},onDone(v){if(clearInterval(u),Oe=null,oe({type:"vx-editor:hide-ai-overlay"}),v.cancelled){W("Generation cancelled",!1);return}(v.files_modified||[]).length>0?(W(`${t} added \u2713`),setTimeout(()=>{let f=document.getElementById("preview-iframe");f!=null&&f.contentWindow&&f.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{oe({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{oe({type:"vx-editor:scroll-to-section",sectionIndex:d}),oe({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):v.partial||W("No changes made",!1)},onWarning(v){typeof window.showToast=="function"&&window.showToast(v,"warning")}})}catch(v){clearInterval(u),Oe=null,v.name!=="AbortError"&&W("Failed to add section",!0),oe({type:"vx-editor:hide-ai-overlay"})}}function Rl(e){Ve();let t=!1,s=document.createElement("div");s.className="vx-modal-overlay",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("vx-modal-visible"));let n=()=>{s.classList.remove("vx-modal-visible"),s.removeEventListener("keydown",o),setTimeout(()=>{s.remove(),!t&&Ne&&ra(Ne)},200)},o=i=>{i.key==="Escape"&&(i.stopPropagation(),i.preventDefault(),n())};s.addEventListener("keydown",o),s.querySelector("[data-close]").addEventListener("click",n),he(s,n),s.tabIndex=-1,s.focus(),Dl(s)}async function Dl(e){let t=e.querySelector("#vx-img-grid");try{let s=await $.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",async()=>{var c,u;let i=o.dataset.path,a=(Ne==null?void 0:Ne.src)||"",r=(Ue==null?void 0:Ue.sourceFile)||(Ne==null?void 0:Ne.filePath)||vt();await Nl({filePath:r,oldSrc:a,newSrc:i,alt:((u=(c=Ne==null?void 0:Ne.outerHTML)==null?void 0:c.match(/alt="([^"]*)"/))==null?void 0:u[1])||"",sourceAddress:Ue})&&oe({type:"vx-editor:swap-image",src:i}),Vs(),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function Hl(e){Ve();let t=e.href||"",s=e.text||"",n=e.target||"",o=e.linkClass||"",i=e.linkClasses||[],a=(Ue==null?void 0:Ue.sourceFile)||e.filePath||vt(),r=`<option value=""${o?"":" selected"}>No class</option>`,l=i.includes(o);i.forEach(d=>{r+=`<option value="${nt(d)}"${o===d?" selected":""}>${qe(d)}</option>`}),o&&!l&&(r+=`<option value="${nt(o)}" selected>${qe(o)}</option>`);let c=document.createElement("div");c.className="vx-modal-overlay",c.setAttribute("role","dialog"),c.setAttribute("aria-modal","true"),c.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${nt(t)}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${nt(s)}" placeholder="Link text"></div>
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
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(c),requestAnimationFrame(()=>c.classList.add("vx-modal-visible")),ua(c);let u=()=>{c.classList.remove("vx-modal-visible"),c.removeEventListener("keydown",p),c.__vxDestroyDrag&&c.__vxDestroyDrag(),setTimeout(()=>c.remove(),200)},p=d=>{d.key==="Escape"&&u()};c.addEventListener("keydown",p),c.querySelectorAll("[data-close]").forEach(d=>d.addEventListener("click",u)),he(c,u),document.getElementById("vx-link-save").addEventListener("click",async()=>{var x;if((x=window.demoGuard)!=null&&x.call(window)){u();return}let d=document.getElementById("vx-link-href").value.trim(),v=document.getElementById("vx-link-text").value.trim(),m=document.getElementById("vx-link-target").checked?"_blank":"",f=document.getElementById("vx-link-style"),b=f?f.value:"",h=Ue,g=[];d!==t&&g.push(Ns(h,"href",t,d,a)),m!==n&&g.push(Ns(h,"target",n||null,m||null,a)),b!==o&&g.push(Ns(h,"class",o||null,b||null,a)),v!==s&&g.push(ko(h,s,v,a)),g.forEach(E=>de(E,"created")),await jl(a,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:d,newText:v,newTarget:m,newClass:b},g)&&(oe({type:"vx-editor:update-link",href:d,text:v,target:m,className:b}),setTimeout(()=>oe({type:"vx-editor:refresh-highlight"}),100)),u()}),setTimeout(()=>{var d;return(d=document.getElementById("vx-link-href"))==null?void 0:d.focus()},100)}function Xi(e,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:i,newText:a,newTarget:r,newClass:l}){let c=k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),u=c(t),p=new RegExp(`(<a\\s[^>]*?href=["']${u}["'][^>]*>)([\\s\\S]*?)(</a>)`,"gi"),d=[...e.matchAll(p)];if(d.length===0)return null;if(d.length>1)return"ambiguous";let v=d[0],m=v[1],f=v[2],b=v[3];i!==t&&(m=m.replace(new RegExp(`href=["']${c(t)}["']`),`href="${i}"`)),r!==n&&(r&&m.includes("target=")?m=m.replace(/target=["'][^"']*["']/,`target="${r}"`):r&&!m.includes("target=")?m=m.replace(/>$/,` target="${r}" rel="noopener">`):!r&&m.includes("target=")&&(m=m.replace(/\s*target=["'][^"']*["']/,""),m=m.replace(/\s*rel=["'][^"']*["']/,""))),l!==o&&(l&&m.includes("class=")?m=m.replace(/class=["'][^"']*["']/,`class="${l}"`):l&&!m.includes("class=")?m=m.replace(/>$/,` class="${l}">`):!l&&m.includes("class=")&&(m=m.replace(/\s*class=["'][^"']*["']/,""))),a!==s&&!f.includes("<")&&(f=a);let h=m+f+b,g=e.replace(v[0],h);return g!==e?g:e}async function jl(e,t,s){var o;let n=e||vt();try{let i=await $.get(`/files/content?path=${encodeURIComponent(n)}`);if(!i.ok)return s&&s.forEach(c=>de(c,"failed",{reason:"cannot read file"})),W("Cannot read source file",!0),!1;let a=i.data.content,r=Xi(a,t);if(r==="ambiguous")return s&&s.forEach(c=>de(c,"failed",{reason:"ambiguous match \u2014 multiple links share this href"})),W("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(r!==null)return(await $.put("/files/content",{path:n,content:r})).ok?(s&&s.forEach(u=>de(u,"persisted",{strategy:"contentMatch"})),W(`Saved \u2192 ${n.split("/").pop()}`),!0):(s&&s.forEach(u=>de(u,"failed",{reason:"API write failed"})),W("Save failed",!0),!1);let l=await $.get("/files");if(l.ok){let c=(l.data.files||[]).filter(u=>u.path.endsWith(".php")&&u.path!==n);for(let u of c){let p=await $.get(`/files/content?path=${encodeURIComponent(u.path)}`);if(!p.ok||!((o=p.data)!=null&&o.content))continue;let d=Xi(p.data.content,t);if(d==="ambiguous")return s&&s.forEach(v=>de(v,"failed",{reason:"ambiguous match in partial",file:u.path})),W("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(d!==null)return(await $.put("/files/content",{path:u.path,content:d})).ok?(s&&s.forEach(m=>de(m,"persisted",{strategy:"partialSearch"})),W(`Saved \u2192 ${u.path.split("/").pop()}`),!0):(s&&s.forEach(m=>de(m,"failed",{reason:"API write failed in partial",file:u.path})),W("Save failed",!0),!1)}}return s&&s.forEach(c=>de(c,"failed",{reason:"link not found in source"})),W("Save failed \u2014 link not found in source",!0),!1}catch(i){return console.error("[VX] saveLinkToSource error:",i),s&&s.forEach(a=>de(a,"failed",{reason:"exception",error:i.message})),W("Save failed \u2014 unexpected error",!0),!1}}async function Nl(e){var l;if((l=window.demoGuard)!=null&&l.call(window))return!1;let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||vt(),a=Xt(e.sourceAddress||Ue),r=Ns(a,"src",s,n,i);de(r,"created");try{let c=await $.get(`/files/content?path=${encodeURIComponent(i)}`);if(!c.ok)return console.warn("[VX] Cannot read file for image save:",i),de(r,"failed",{reason:"cannot read file"}),W("Save failed",!0),!1;let u=c.data.content,p=!1,d=`src="${s}"`,v=u.split(d).length-1;if(v>1)return de(r,"failed",{reason:"ambiguous match \u2014 multiple elements share this src"}),W("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(v===1&&(u=u.replace(d,`src="${n}"`),p=!0),!p&&u.includes(s)){if(u.split(s).length-1>1)return de(r,"failed",{reason:"ambiguous match \u2014 image path appears multiple times in source"}),W("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1;u=u.replace(s,n),p=!0}if(!p&&o){let f=Yi(u,o,n);if(f==="ambiguous")return de(r,"failed",{reason:"ambiguous alt-anchor match \u2014 multiple images share this alt text"}),W("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;f!==!1&&(u=f,p=!0)}if(p)return(await $.put("/files/content",{path:i,content:u})).ok?(de(r,"persisted",{strategy:"contentMatch"}),W(`Saved \u2192 ${i.split("/").pop()}`),!0):(de(r,"failed",{reason:"API write failed"}),W("Save failed",!0),!1);let m=await $.get("/files");if(m.ok){let f=(m.data.files||[]).filter(b=>b.path.endsWith(".php")&&b.path!==i);for(let b of f){let h=await $.get(`/files/content?path=${encodeURIComponent(b.path)}`);if(!h.ok||!h.data.content)continue;let g=h.data.content,k=g.split(d).length-1;if(k>1)return de(r,"failed",{reason:"ambiguous match in partial",file:b.path}),W("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(k===1)return g=g.replace(d,`src="${n}"`),(await $.put("/files/content",{path:b.path,content:g})).ok?(de(r,"persisted",{strategy:"partialSearch"}),W(`Saved \u2192 ${b.path.split("/").pop()}`),!0):(de(r,"failed",{reason:"API write failed in partial",file:b.path}),W("Save failed",!0),!1);if(g.includes(s))return g.split(s).length-1>1?(de(r,"failed",{reason:"ambiguous match in partial",file:b.path}),W("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1):(g=g.replace(s,n),(await $.put("/files/content",{path:b.path,content:g})).ok?(de(r,"persisted",{strategy:"partialSearch"}),W(`Saved \u2192 ${b.path.split("/").pop()}`),!0):(de(r,"failed",{reason:"API write failed in partial",file:b.path}),W("Save failed",!0),!1));if(o){let x=Yi(g,o,n);if(x==="ambiguous")return de(r,"failed",{reason:"ambiguous alt-anchor match in partial",file:b.path}),W("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;if(x!==!1)return(await $.put("/files/content",{path:b.path,content:x})).ok?(de(r,"persisted",{strategy:"altAnchor"}),W(`Saved \u2192 ${b.path.split("/").pop()}`),!0):(de(r,"failed",{reason:"API write failed in partial",file:b.path}),W("Save failed",!0),!1)}}}return console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),de(r,"failed",{reason:"source not found"}),W("Save failed \u2014 source not found",!0),!1}catch(c){return console.error("[VX] Image save error:",c),de(r,"failed",{reason:"exception",error:c.message}),W("Save failed",!0),!1}}function Yi(e,t,s){let n=e.split("<img"),o=[];for(let p=1;p<n.length;p++){let d=n[p];if(d.includes(`alt="${t}"`)||d.includes(`alt='${t}'`)){let v=d.indexOf("src=");if(v!==-1){let m=d[v+4];(m==='"'||m==="'")&&d.indexOf(m,v+5)!==-1&&o.push(p)}}}if(o.length===0)return!1;if(o.length>1)return"ambiguous";let i=o[0],a=n[i],r=a.indexOf("src="),l=a[r+4],c=r+5,u=a.indexOf(l,c);return n[i]=a.substring(0,c)+s+a.substring(u),n.join("<img")}function In(e){var n;if((n=window.demoGuard)!=null&&n.call(window))return;let t=Xt(e.sourceAddress),s=ko(t,e.originalHTML,e.newHTML,e.filePath);de(s,"created"),Jt.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:s}),clearTimeout(In._timer),In._timer=setTimeout(()=>ms(),800)}async function va(e){let{filePath:t,originalHTML:s,newHTML:n}=e;if(!s||!n)return W("Source edit failed \u2014 missing data",!0),!1;let o=t||vt();try{let i=await $.get(`/files/content?path=${encodeURIComponent(o)}`);if(!i.ok)return W("Cannot read source file",!0),!1;let a=i.data.content,r=await Ji(o,a,s,n);if(r==="saved")return!0;if(r==="ambiguous")return!1;let l=await $.get("/files");if(!l.ok)return W("Save failed \u2014 source not found in file",!0),!1;let c=(l.data.files||[]).filter(u=>u.path.endsWith(".php")&&u.path!==o);for(let u of c){let p=await $.get(`/files/content?path=${encodeURIComponent(u.path)}`);if(!p.ok||!p.data.content)continue;let d=await Ji(u.path,p.data.content,s,n);if(d==="saved")return!0;if(d==="ambiguous")return!1}return console.warn("[VX] Source edit needle not found in any file:",s.substring(0,100)),W("Save failed \u2014 source not found. The file may have changed.",!0),!1}catch(i){return console.error("[VX] Source edit save error:",i),W("Save failed",!0),!1}}async function Ji(e,t,s,n){var l;let o=0,i=0;for(;;){let c=t.indexOf(s,i);if(c===-1||(o++,i=c+s.length,o>1))break}if(o===0)return"not_found";if(o>1)return W("Save failed \u2014 source fragment appears multiple times. Edit in the Code Editor instead.",!0),"ambiguous";let a=t.replace(s,n),r=await $.put("/files/content",{path:e,content:a});if(r.ok){let c=e.split("/").pop();return W(`Saved \u2192 ${c}`),(l=r.data)!=null&&l.tailwindCompiled&&setTimeout(()=>{let u=document.getElementById("preview-iframe");u!=null&&u.contentWindow&&u.contentWindow.postMessage("voxelsite:reload-css","*")},300),"saved"}else return W("Save failed",!0),"not_found"}function _o(e){var i;if((i=window.demoGuard)!=null&&i.call(window))return;let t=Xt(e.sourceAddress),s=e.parentAddress?Xt(e.parentAddress):null,n=typeof e.siblingIndex=="number"?e.siblingIndex:-1,o=Pi(t,e.outerHTML,e.filePath,s,n);de(o,"created"),Jt.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:o}),clearTimeout(_o._timer),_o._timer=setTimeout(()=>ms(),300)}function Ol(e){let t=e.match(/class="([^"]*)"/);return t?t[1].split(/\s+/).filter(Boolean):[]}function ql(e,t,s,n){let o=new Set(["is-visible","is-active","is-open","active","open","show","shown","visible","in","entered","transitioning"]),i=/class="([^"]*)"/g,a;for(;(a=i.exec(e))!==null;){let r=a[1].split(/\s+/).filter(Boolean);if(r.length===0||!r.every(m=>t.has(m))||![...t].filter(m=>!r.includes(m)).every(m=>o.has(m)||s.includes(m)||n.includes(m)))continue;let p=r.filter(m=>!n.includes(m));for(let m of s)!o.has(m)&&!p.includes(m)&&p.push(m);let d=a[0],v=`class="${p.join(" ")}"`;return e.substring(0,a.index)+v+e.substring(a.index+d.length)}return null}async function ms(){var t,s,n,o,i,a,r;if(Bn||Jt.length===0)return;Bn=!0;let e=[...Jt];Jt=[];try{let l={};for(let p of e){let d=((s=(t=p._op)==null?void 0:t.address)==null?void 0:s.sourceFile)||((n=p.sourceAddress)==null?void 0:n.sourceFile)||p.filePath||vt();l[d]||(l[d]=[]),l[d].push(p)}let c=!1,u={filesByMain:new Map,contentByPath:new Map};for(let[p,d]of Object.entries(l))try{let v=await $.get(`/files/content?path=${encodeURIComponent(p)}`);if(!v.ok){console.error("[VX] Cannot read:",p);continue}let m=v.data.content,f=!1,b=[];for(let h of d){if(h._op&&h._op.type!==re.FALLBACK){let k=Tn(h._op,m);if(k.applied){m=k.content,f=!0,b.push({op:h._op,strategy:k.strategy});continue}console.warn("[VX] applyOp failed:",k.reason,"\u2014 falling back to legacy for",h._op.type),de(h._op,"fallback",{fallbackReason:k.reason,via:"applyOp"})}let g=h.type==="delete"?h.outerHTML:h.originalHTML;if(g){if((o=h.sourceAddress)!=null&&o.nodeKey&&h.type==="text"){let k=h.sourceAddress,x=k.sourceFile||p,E=m;if(x!==p)try{let R=await $.get(`/files/content?path=${encodeURIComponent(x)}`);R.ok&&((i=R.data)!=null&&i.content)&&(E=R.data.content)}catch{}let M=k.nodeKey.lastIndexOf(":"),I=!1;if(M!==-1){let R=parseInt(k.nodeKey.substring(M+1),10);if(!isNaN(R)){let U=ll(E,R);if(U){let te=la(E,E.indexOf(U));if(te){let G=te.length,O=U.lastIndexOf("</");if(O>G){let K=U.substring(O),ae=te+h.newHTML+K;if(x!==p){let D=E.replace(U,ae),T=await $.put("/files/content",{path:x,content:D});T.ok&&(W(`Saved \u2192 ${x.split("/").pop()}`),(a=T.data)!=null&&a.tailwindCompiled&&(c=!0),I=!0,h._op&&(de(h._op,"persisted",{strategy:"nodeKey",via:"legacy"}),Fs(h._op,x)))}else m=m.replace(U,ae),f=!0,I=!0,h._op&&b.push({op:h._op,strategy:"nodeKey",via:"legacy"})}}}}}if(I)continue;console.warn("[VX] Legacy nodeKey extraction failed for",k.nodeKey,"\u2014 trying content match"),h._op&&de(h._op,"fallback",{fallbackReason:"legacy nodeKey extraction failed",nodeKey:k.nodeKey})}if(m.includes(g))m=h.type==="delete"?m.replace(g,""):m.replace(g,h.newHTML),f=!0,h._op&&b.push({op:h._op,strategy:"contentMatch",via:"legacy"});else if(h.type==="class-change"&&h.additions){let k=new Set(Ol(g)),x=ql(m,k,h.additions,h.removals);if(x)m=x,f=!0,h._op&&b.push({op:h._op,strategy:"subsetMatch",via:"legacy"});else{let E=await Zi(p,h,u);if(E.status==="saved"){h._op&&(de(h._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:E.path}),Fs(h._op,E.path)),c=!0;continue}E.status==="write_failed"?h._op&&de(h._op,"failed",{reason:"partial write failed",file:E.path}):(console.warn("[VX] Not found in source:",g.substring(0,80)),h._op&&de(h._op,"failed",{reason:"source not found"}),W("Save failed \u2014 source not found",!0))}}else{let k=await Zi(p,h,u);if(k.status==="saved"){h._op&&(de(h._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:k.path}),Fs(h._op,k.path)),c=!0;continue}k.status==="write_failed"?h._op&&de(h._op,"failed",{reason:"partial write failed",file:k.path}):(console.warn("[VX] Not found in source:",g.substring(0,80)),h._op&&de(h._op,"failed",{reason:"source not found"}),W("Save failed \u2014 source not found",!0))}}}if(f){let h=await $.put("/files/content",{path:p,content:m});if(h.ok){W(`Saved \u2192 ${p.split("/").pop()}`),(r=h.data)!=null&&r.tailwindCompiled&&(c=!0);for(let{op:g,strategy:k,via:x}of b)de(g,"persisted",{strategy:k,via:x||"applyOp"}),Fs(g,p)}else{W("Save failed",!0);for(let{op:g,via:k}of b)de(g,"failed",{reason:"file write failed",via:k||"applyOp"})}}}catch(v){console.error("[VX] Save error:",v),W("Save failed",!0)}c&&setTimeout(()=>{let p=document.getElementById("preview-iframe");p!=null&&p.contentWindow&&p.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{Bn=!1,Jt.length>0?setTimeout(()=>ms(),0):oe({type:"vx-editor:save-feedback"})}}async function Zi(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let r=await $.get("/files");if(!r.ok)return{status:"not_found"};a=(r.data.files||[]).filter(l=>l.path.endsWith(".php")&&l.path!==e).filter(l=>o.some(c=>l.path.includes(c+"/"))||l.path.includes("partial")||l.path.includes("header")||l.path.includes("footer")||l.path.includes("nav")),i.filesByMain.set(e,a)}for(let r of a){let l=i.contentByPath.get(r.path);if(l==null){let c=await $.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!c.ok||!c.data.content)continue;l=c.data.content,i.contentByPath.set(r.path,l)}if(l.includes(n)){let c=t.type==="delete"?l.replace(n,""):l.replace(n,t.newHTML);return(await $.put("/files/content",{path:r.path,content:c})).ok?(i.contentByPath.set(r.path,c),W(`Saved \u2192 ${r.path.split("/").pop()}`),{status:"saved",path:r.path}):(W("Save failed",!0),{status:"write_failed",path:r.path})}}}catch(a){console.error("[VX] Partial search error:",a)}return{status:"not_found"}}async function Fl(e){var i;let{filePath:t,sectionIndex:s,neighborIndex:n}=e,o=t||vt();try{let a=await $.get(`/files/content?path=${encodeURIComponent(o)}`);if(!a.ok){W("Could not read file",!0);return}let r=a.data.content,l=zl(r);if(s>=l.length||n>=l.length){W("Section not found in source. Try asking the AI to move it.",!0);return}let c=Ul(r,l,s,n);if(!c){W("Could not swap sections in source",!0);return}let u=await $.put("/files/content",{path:o,content:c});u.ok?(W("Section moved"),(i=u.data)!=null&&i.tailwindCompiled&&setTimeout(()=>{let p=document.getElementById("preview-iframe");p!=null&&p.contentWindow&&p.contentWindow.postMessage("voxelsite:reload-css","*")},300)):W("Save failed",!0)}catch(a){console.error("[VX] Section move error:",a),W("Section move failed",!0)}}function zl(e){let t=[],s=/<section\b/gi,n;for(;(n=s.exec(e))!==null;){let o=n.index,a=e.substring(Math.max(0,o-500),o).match(/(<!--[\s\S]*?-->\s*)$/);a&&(o-=a[0].length);let r="</section>",l=1,c=n.index+n[0].length;for(;l>0&&c<e.length;){let u=e.indexOf("<section",c),p=e.indexOf(r,c);if(p===-1)break;if(u!==-1&&u<p){let d=e[u+8];(d===" "||d===">"||d===`
`||d==="\r"||d==="	"||d==="/")&&l++,c=u+9}else{if(l--,l===0){let d=p+r.length;t.push({start:o,end:d,content:e.substring(o,d)})}c=p+r.length}}}return t}function Ul(e,t,s,n){if(s===n)return e;let o=Math.min(s,n),i=Math.max(s,n),a=t[o],r=t[i];if(!a||!r||a.end>r.start)return null;let l=e.substring(0,a.start),c=e.substring(a.end,r.start),u=e.substring(r.end);return l+r.content+c+a.content+u}function ma(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",ze),e.title=ze?"Exit visual editor (V)":"Enter visual editor (V)",e.setAttribute("aria-pressed",String(ze))),document.body.classList.toggle("vx-editing",ze)}function W(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(W._timer),W._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function oe(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function vt(){return window.__vsCurrentPreviewPath||"index.php"}function Ao(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),r=a.right-s-o,l=Math.max(o,a.left+10),c=Math.max(o,window.innerWidth-s-o),u=Math.min(Math.max(r,l),c),p=Math.max(a.top+12,i),d=Math.max(i,window.innerHeight-n-o),v=Math.min(p,d);e.style.left=`${u}px`,e.style.top=`${v}px`,e.style.right="auto"}function Qi(e,t,s){let n=e.offsetWidth||380,o=e.offsetHeight||180,i=16,a=56,r=document.getElementById("preview-iframe");if(!r||!s){Ao(e);return}let l=r.getBoundingClientRect(),c=l.top+s.top,u=l.top+s.top+s.height,d=l.left+s.left+s.width/2-n/2,v,m=c-o-4;m>=a?v=m:v=u+8;let f=Math.max(i,window.innerWidth-n-i),h=Math.min(Math.max(d,i),f),g=Math.max(a,window.innerHeight-o-i),k=Math.min(Math.max(v,a),g);e.style.left=`${h}px`,e.style.top=`${k}px`,e.style.right="auto"}function Vl(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function nt(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function qe(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function de(e,t,s={}){var o,i;let n={opId:(e==null?void 0:e.id)||"unknown",type:(e==null?void 0:e.type)||"unknown",event:t,sourceKind:((o=e==null?void 0:e.address)==null?void 0:o.sourceKind)||"unknown",sourceFile:((i=e==null?void 0:e.address)==null?void 0:i.sourceFile)||(e==null?void 0:e.filePath)||"unknown",timestamp:Date.now(),...s};Lo.push(n),Lo.length>Zr&&Lo.shift(),t==="failed"||t==="fallback"?console.warn(`[VX-OPS] ${t}:`,$o(e==null?void 0:e.type),n):console.debug(`[VX-OPS] ${t}:`,$o(e==null?void 0:e.type),n.sourceFile)}async function Wl(){var s;let e=qi();if(!e){W("Nothing to undo");return}let t=e.filePath;if(!t){W("Undo failed \u2014 no file path",!0);return}try{let n=await $.get(`/files/content?path=${encodeURIComponent(t)}`);if(!n.ok){W("Undo failed \u2014 cannot read file",!0);return}let o=Tn(e.inverseOp,n.data.content);if(!o.applied){console.warn("[VX History] Undo applyOp failed:",o.reason),W("Undo failed \u2014 source has changed",!0);return}let i=await $.put("/files/content",{path:t,content:o.content});if(!i.ok){W("Undo failed \u2014 save error",!0);return}Fi(),de(e.inverseOp,"persisted",{strategy:o.strategy,via:"undo"}),W("Undone"),us+=2,oe({type:"vx-editor:replay-op",op:e.inverseOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Undo error:",n),W("Undo failed",!0)}}async function Gl(){var s;let e=zi();if(!e){W("Nothing to redo");return}let t=e.filePath;if(!t){W("Redo failed \u2014 no file path",!0);return}try{let n=await $.get(`/files/content?path=${encodeURIComponent(t)}`);if(!n.ok){W("Redo failed \u2014 cannot read file",!0);return}let o=Tn(e.forwardOp,n.data.content);if(!o.applied){console.warn("[VX History] Redo applyOp failed:",o.reason),W("Redo failed \u2014 source has changed",!0);return}let i=await $.put("/files/content",{path:t,content:o.content});if(!i.ok){W("Redo failed \u2014 save error",!0);return}Ui(),de(e.forwardOp,"persisted",{strategy:o.strategy,via:"redo"}),W("Redone"),us+=2,oe({type:"vx-editor:replay-op",op:e.forwardOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Redo error:",n),W("Redo failed",!0)}}function xa(){return setTimeout(()=>Dt(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function Dt(){var D,T,H,F,V,Z,X;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,r]=await Promise.all([$.get("/settings"),$.get("/settings/system"),$.get("/settings/mail"),$.get("/settings/usage"),$.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),$.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),$.get("/settings/logs")]),l=((D=r.data)==null?void 0:D.logs)||[],c=((T=t.data)==null?void 0:T.settings)||{},u=((H=s.data)==null?void 0:H.system)||{},p=c.site_favicon||null,d=p?`/${p}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),v=null,m=null;try{i.ok&&((F=i.data)!=null&&F.content)&&(v=JSON.parse(i.data.content))}catch{}try{a.ok&&((V=a.data)!=null&&V.content)&&(m=JSON.parse(a.data.content))}catch{}let f=v||m,b=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},h=c.available_providers||{},g=((Z=n.data)==null?void 0:Z.config)||{},k=((X=n.data)==null?void 0:X.presets)||{},x=Object.keys(h),E=c.ai_provider||"claude",I=(h[E]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],R=c[`ai_${E}_model`]||"",U=c[`ai_${E}_api_key_set`]||!1,te=x.map(j=>{let ne=h[j];return`<option value="${y(j)}" ${j===E?"selected":""}>${y(ne.name)}</option>`}).join(""),G="";for(let j of I)j.key==="api_key"?G+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(j.label)}${j.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${U?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${y(j.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${U?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':j.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${y(j.help_text||"Optional for local servers")}</p>`}
          ${j.help_url?`<a href="${j.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${y(j.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:j.key==="base_url"&&(G+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(j.label)}${j.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${y(c.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${y(j.placeholder)}" />
          ${j.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${y(j.help_text)}</p>`:""}
        </div>`);e.innerHTML=`
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${y(c.site_name||"")}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${y(c.site_tagline||"")}"
            class="vs-input"
            placeholder="A short description of your site" />
        </div>

        <!-- Favicon -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-2">Favicon</label>
          <div class="vs-favicon-zone" id="vs-favicon-zone">
            <div class="vs-favicon-preview" id="vs-favicon-preview">
              <img src="${d}" alt="Current favicon" class="vs-favicon-img" id="vs-favicon-img"
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
            ${te}
          </select>
        </div>

        <div id="settings-config-fields">
          ${G}
        </div>

        <div>
          <label for="set-ai-model" class="block text-sm font-medium text-vs-text-secondary mb-1">Model</label>
          <select id="set-ai-model" class="vs-input">
            <option value="">Loading models\u2026</option>
          </select>
        </div>

        <div>
          <label for="set-max-tokens" class="block text-sm font-medium text-vs-text-secondary mb-1">Max Output Tokens</label>
          <input id="set-max-tokens" type="number" value="${c.ai_max_tokens||32e3}" min="1000" max="128000" step="1000"
            class="vs-input" />
          <p class="text-xs text-vs-text-ghost mt-1">Higher values allow larger website generations but cost more.</p>
        </div>

        <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
              <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                <input type="checkbox" id="set-evaluator-enabled" ${c.evaluator_enabled?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span class="vs-toggle-track" style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${c.evaluator_enabled?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span class="vs-toggle-thumb" style="
                  position: absolute; left: ${c.evaluator_enabled?"18px":"2px"}; top: 2px;
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
            <option value="none" ${g.driver==="none"?"selected":""}>Not configured</option>
            <option value="php_mail" ${g.driver==="php_mail"?"selected":""}>PHP mail()</option>
            <option value="smtp" ${g.driver==="smtp"?"selected":""}>SMTP</option>
            <option value="mailpit" ${g.driver==="mailpit"?"selected":""}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${g.driver==="smtp"?"block":"none"};">
          <div class="flex flex-col gap-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(k).map(([j,ne])=>`<option value="${y(j)}">${y(ne.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${y(g.smtp_host||"")}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${g.smtp_port||587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${g.smtp_encryption==="tls"?"selected":""}>TLS (STARTTLS)</option>
                  <option value="ssl" ${g.smtp_encryption==="ssl"?"selected":""}>SSL</option>
                  <option value="none" ${g.smtp_encryption==="none"?"selected":""}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${y(g.smtp_username||"")}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${g.smtp_password||""}"
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
        <div id="mail-mailpit-fields" style="display: ${g.driver==="mailpit"?"block":"none"};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${y(g.mailpit_host||"localhost")}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${g.mailpit_port||1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${g.driver==="none"?"none":"block"};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${y(g.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${y(g.from_name||"")}"
            class="vs-input"
            placeholder="Your Site Name" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender name on notification emails.</p>
        </div>

        <div class="border-t border-vs-border-subtle"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${y(c.user_email||"")}"
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

    ${f?`
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${v?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${C.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(v).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${C.chevronRight}</div>
        </button>
        `:""}
        ${m?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${C.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(m).length} design decisions</span>
          </div>
          <div class="vs-knowledge-card-arrow">${C.chevronRight}</div>
        </button>
        `:""}
      </div>
      <p class="vs-knowledge-hint">
        ${C.info}
        You can't edit these values directly \u2014 ask VoxelSite in chat to update them.
      </p>
    </div>
    `:""}

    <!-- Card: AI Usage -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Usage</h2>
      <p class="vs-settings-card-subtitle">Token consumption and cost tracking across models.</p>
      ${b.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${et("Total Requests",Number(b.totals.request_count).toLocaleString())}
          ${et("Input Tokens",Number(b.totals.total_input_tokens).toLocaleString())}
          ${et("Output Tokens",Number(b.totals.total_output_tokens).toLocaleString())}

        </div>
        ${b.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${b.models.map(j=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${et(j.ai_model||"Unknown",Number(j.request_count).toLocaleString()+" requests")}
                ${et("Tokens",Number(j.total_input_tokens).toLocaleString()+" in / "+Number(j.total_output_tokens).toLocaleString()+" out")}

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
        ${et("VoxelSite",u.version||"1.0.0")}
        ${et("PHP",u.php_version||"?")}
        ${et("SQLite",u.sqlite_version||"?")}
        ${et("Database",Oo(u.database_size))}
        ${et("Preview Files",Oo(u.preview_size))}
        ${et("Assets",Oo(u.assets_size))}
        ${et("Upload Limit",u.max_upload||"?")}
        ${et("Memory Limit",u.memory_limit||"?")}
      </div>
    </div>

    <!-- Card: Update -->
    <div class="vs-settings-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Update</h2>
        <span class="vs-pill vs-pill-subtle">v${y(u.version||"1.0.0")}</span>
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
        ${l.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':l.map(j=>{let ne=(j.size/1024).toFixed(1),ce=new Date(j.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${j.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${j.lines} lines \xB7 ${ne} KB \xB7 ${ce}</span>
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
          ${C.externalLink} View API schema
        </a>
      </div>
      <div class="flex flex-col gap-4">
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="set-api-enabled" ${c.agent_api_enabled?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span class="vs-toggle-track" style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${c.agent_api_enabled?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span class="vs-toggle-thumb" style="
                position: absolute; left: ${c.agent_api_enabled?"18px":"2px"}; top: 2px;
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

        <div id="api-access-body" style="${c.agent_api_enabled?"":"opacity: 0.4; pointer-events: none;"}">
          <div style="margin-bottom: 16px;">
            <label for="set-api-origins" style="display: block; font-size: 13px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;">Allowed Origins</label>
            <textarea id="set-api-origins"
              class="vs-input" rows="3"
              style="resize: vertical; font-family: var(--font-mono); font-size: 12px; height: auto; padding: 10px 14px; line-height: 1.5;"
              placeholder="*">${y(c.agent_api_allowed_origins||"*")}</textarea>
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
  `,sd(c,h),nd(g,k),Jl(),Zl(),od(c),document.querySelectorAll(".btn-delete-log").forEach(j=>{j.addEventListener("click",async()=>{var be;if((be=window.demoGuard)!=null&&be.call(window))return;if(j.dataset.confirm!=="true"){j.dataset.confirm="true",j.innerHTML='<span style="font-size: 11px;">Sure?</span>',j.style.color="var(--vs-error)",setTimeout(()=>{j.dataset.confirm==="true"&&(j.dataset.confirm="",j.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',j.style.color="")},3e3);return}let ne=j.dataset.file,ce=j.closest(".vs-log-row");ce&&(ce.style.opacity="0.4"),await $.delete("/settings/logs",{file:ne}),Dt()})});let O=document.getElementById("btn-delete-all-logs");O&&O.addEventListener("click",async()=>{var j;if(!((j=window.demoGuard)!=null&&j.call(window))){if(O.dataset.confirm!=="true"){O.dataset.confirm="true",O.textContent="Sure?",O.style.color="var(--vs-error)",setTimeout(()=>{O.dataset.confirm==="true"&&(O.dataset.confirm="",O.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',O.style.color="")},3e3);return}O.disabled=!0,O.textContent="Deleting...",await $.delete("/settings/logs",{file:"*"}),Dt()}});let K=document.getElementById("btn-view-memory");K&&v&&K.addEventListener("click",()=>ga("Site Memory",v,"memory"));let ae=document.getElementById("btn-view-design");ae&&m&&ae.addEventListener("click",()=>ga("Design Intelligence",m,"design")),Xl(),Yl(),td(R)}function Kl(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function Xl(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;r();async function r(){var d;if(a)try{let{ok:v,data:m}=await $.get("/update/dist-packages");if(!v||!((d=m==null?void 0:m.packages)!=null&&d.length)){a.innerHTML="";return}let f=m.current_version||"0.0.0",b=m.packages.map(h=>{let g=(h.size/1024/1024).toFixed(1),k=Kl(h.version,f)>0,x=h.version===f,E=k?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':x?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${y(h.filename)}</strong>
                ${E}
              </div>
              <div class="vs-dist-pkg-meta">v${y(h.version)} \xB7 ${g} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${y(h.filename)}" data-version="${y(h.version)}">
              Apply Update
            </button>
          </div>
        `}).join("");a.innerHTML=`
        <div class="vs-dist-packages-section">
          <div class="vs-dist-packages-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Update packages found in <code>/dist/</code></span>
          </div>
          ${b}
        </div>
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(h=>{h.addEventListener("click",()=>l(h.dataset.filename,h.dataset.version))})}catch{}}async function l(d,v){var f,b;if(!((f=window.demoGuard)!=null&&f.call(window)||!confirm(`Apply update from "${d}" (v${v})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${d}...`,a&&(a.innerHTML="");try{let{ok:h,data:g,error:k}=await $.post("/update/apply-local",{filename:d});s.classList.add("hidden"),n.classList.remove("hidden");let x=document.getElementById("vs-update-result-icon"),E=document.getElementById("vs-update-result-message");if(h){let M=g;x.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',E.innerHTML=`
          <div class="vs-update-result-title">${y(M.message)}</div>
          <div class="vs-update-result-meta">
            ${M.files_updated} files updated \xB7 ${M.files_skipped} preserved
            ${(b=M.errors)!=null&&b.length?` \xB7 ${M.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else u("Update Failed",(k==null?void 0:k.message)||"Unknown error")}catch(h){u("Update Failed",y(h.message||"Network error."))}}}e.addEventListener("click",d=>{var v;(v=window.demoGuard)!=null&&v.call(window)||d.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",d=>{d.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",d=>{var m,f,b;if(d.preventDefault(),e.classList.remove("is-dragover"),(m=window.demoGuard)!=null&&m.call(window))return;let v=(b=(f=d.dataTransfer)==null?void 0:f.files)==null?void 0:b[0];v&&v.name.endsWith(".zip")&&c(v)}),o.addEventListener("change",()=>{var v;let d=(v=o.files)==null?void 0:v[0];d&&c(d),o.value=""});async function c(d){var f,b;let v=document.querySelector(".vs-sys-grid");if(v){let h=v.querySelectorAll(".vs-sys-value"),g="";if(v.querySelectorAll(".vs-sys-label").forEach((k,x)=>{var E,M;k.textContent.trim()==="Upload Limit"&&(g=((M=(E=h[x])==null?void 0:E.textContent)==null?void 0:M.trim())||"")}),g){let k=p(g);if(k>0&&d.size>k){let x=(d.size/1024/1024).toFixed(1);u("File Too Large",`The update file is ${x} MB but your server's upload limit is ${g}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${x} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${d.name}" (${(d.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${d.name}...`;try{let h=new FormData;h.append("update_zip",d);let g=_.get("sessionToken"),k=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:g?{"X-VS-Token":g}:{},body:h}),x=k.headers.get("content-type")||"",E;if(!x.includes("application/json")){let R=await k.text();if(R.includes("POST Content-Length")||R.includes("upload_max_filesize")||R.includes("exceeds")){u("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}u("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}E=await k.json(),s.classList.add("hidden"),n.classList.remove("hidden");let M=document.getElementById("vs-update-result-icon"),I=document.getElementById("vs-update-result-message");if(E.ok){let R=E.data;M.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',I.innerHTML=`
          <div class="vs-update-result-title">${y(R.message)}</div>
          <div class="vs-update-result-meta">
            ${R.files_updated} files updated \xB7 ${R.files_skipped} preserved
            ${(f=R.errors)!=null&&f.length?` \xB7 ${R.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else u("Update Failed",((b=E.error)==null?void 0:b.message)||"Unknown error")}catch(h){let g=h.message||"Network error. Check your connection.";g.includes("Unexpected token")||g.includes("not valid JSON")?u("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):u("Upload Failed",y(g))}}}function u(d,v){s.classList.add("hidden"),n.classList.remove("hidden");let m=document.getElementById("vs-update-result-icon"),f=document.getElementById("vs-update-result-message");m.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',f.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${y(d)}</div>
      <div class="vs-update-result-meta">${v}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function p(d){let v=d.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!v)return 0;let m=parseFloat(v[1]),f=v[2].toUpperCase();return f==="GB"||f==="G"?m*1024*1024*1024:f==="MB"||f==="M"?m*1024*1024:f==="KB"||f==="K"?m*1024:0}}function Yl(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var r,l,c;if(i.preventDefault(),e.classList.remove("is-dragover"),(r=window.demoGuard)!=null&&r.call(window))return;let a=(c=(l=i.dataTransfer)==null?void 0:l.files)==null?void 0:c[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,r;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let l=await $.delete("/settings/favicon");l.ok?(S("Favicon removed.","success"),Dt()):S(((r=l.error)==null?void 0:r.message)||"Could not remove favicon.","error")}catch{S("Could not remove favicon.","error")}}});async function o(i){var u;if(i.size>524288){S("Favicon must be under 512 KB.","error");return}let r=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!r.includes(i.type)){S("Favicon must be a .ico file.","error");return}let c=document.getElementById("vs-favicon-preview");c&&(c.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let p=new FormData;p.append("favicon",i);let d=_.get("sessionToken"),m=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:d?{"X-VS-Token":d}:{},body:p})).json();m.ok?(S("Favicon updated.","success"),Dt()):(S(((u=m.error)==null?void 0:u.message)||"Upload failed.","error"),Dt())}catch{S("Upload failed. Check your connection.","error"),Dt()}}}function ga(e,t,s){var l,c,u;(l=document.getElementById("vs-knowledge-overlay"))==null||l.remove();let n=p=>p.replace(/[_-]/g," ").replace(/\b\w/g,d=>d.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([p,d])=>{let v=typeof d=="object"?d.value||JSON.stringify(d):String(d),m=typeof d=="object"?d.confidence:null,f=m==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${y(n(p))}</div>
          <div class="vs-kv-value">
            <span>${y(v)}</span>
            ${m?`<span class="vs-kv-badge ${f}">${y(m)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(t).map(([p,d])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${y(n(p))}</div>
        <div class="vs-kv-section-body">${y(String(d))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?C.book:C.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${y(e)}</h2>
            <p class="vs-knowledge-modal-subtitle">${s==="memory"?"Facts the AI has learned about your business from conversations.":"Design decisions the AI uses to maintain visual consistency."}</p>
          </div>
        </div>
        <button id="vs-knowledge-close" class="vs-btn vs-btn-ghost vs-btn-icon" title="Close">${C.x}</button>
      </div>
      <div class="vs-knowledge-modal-body">
        ${o}
      </div>
      <div class="vs-knowledge-modal-footer">
        <span class="vs-knowledge-modal-hint">
          ${C.info}
          These values are managed by VoxelSite. Ask in chat to update them.
        </span>
        <button id="vs-knowledge-done" class="vs-btn vs-btn-primary vs-btn-sm">Done</button>
      </div>
    </div>
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",r)},r=p=>{p.key==="Escape"&&a()};document.addEventListener("keydown",r),(c=i.querySelector("#vs-knowledge-close"))==null||c.addEventListener("click",a),(u=i.querySelector("#vs-knowledge-done"))==null||u.addEventListener("click",a),he(i,a)}function Jl(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||ed()})}function Zl(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Ql()})}function Ql(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-install-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let l=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()===a?ha(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?ha(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>ge(t)),t.addEventListener("click",l=>{l.target===t&&ge(t)});let r=l=>{l.key==="Escape"&&(ge(t),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)}async function ha(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await $.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let r=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=r,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function wa(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function ed(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let r=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()==="RESET"?fa(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?fa(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>ge(t)),t.addEventListener("click",r=>{r.target===t&&ge(t)});let a=r=>{r.key==="Escape"&&(ge(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function fa(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:r}=await $.post("/site/reset",{confirm:"RESET"});if(i){_.set("pages",[]),_.set("hasFormSchemas",!1),_.set("conversations",null),_.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{ge(e),window.location.hash!=="#/chat"?Ge.navigate("chat"):Ge.refresh()},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let l=e.querySelector(".vs-modal-desc");if(l){let c=l.textContent;l.textContent=(r==null?void 0:r.message)||"Reset failed. Please try again.",l.style.color="var(--vs-error)",setTimeout(()=>{l.textContent=c,l.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function td(e){var s;let t=document.getElementById("set-ai-model");if(t)try{let{ok:n,data:o}=await $.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?t.innerHTML=o.models.map(i=>`<option value="${y(i.id)}" ${i.id===e?"selected":""}>${y(i.name||i.id)}</option>`).join(""):t.innerHTML='<option value="">Test your connection to load available models</option>'}catch{t.innerHTML='<option value="">Test your connection to load available models</option>'}}function et(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function Oo(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function sd(e,t){let s=e.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async p=>{var d;if((d=window.demoGuard)!=null&&d.call(window)){p.target.value=s;return}s=p.target.value,await $.put("/settings",{ai_provider:s}),Dt()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var b,h,g,k,x;if((b=window.demoGuard)!=null&&b.call(window))return;let p=((h=i==null?void 0:i.value)==null?void 0:h.trim())||"",d=((k=(g=document.getElementById("set-base-url"))==null?void 0:g.value)==null?void 0:k.trim())||"";if(s!=="openai_compatible"&&(!p||p.startsWith("\u2022\u2022"))){Fo("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:v,data:m,error:f}=await $.post("/settings/test-api",{provider:s,api_key:p.startsWith("\u2022\u2022")?"":p,base_url:d});if(o.textContent="Test Connection",o.disabled=!1,v){if(Fo("\u2713 Connected successfully!","success"),(x=m==null?void 0:m.models)!=null&&x.length){let E=document.getElementById("set-ai-model");if(E){let M=e[`ai_${s}_model`]||"";E.innerHTML=m.models.map(I=>`<option value="${y(I.id)}" ${I.id===M?"selected":""}>${y(I.name||I.id)}</option>`).join("")}}}else Fo("\u2717 "+((f==null?void 0:f.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),r=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var m,f,b,h,g;if((m=window.demoGuard)!=null&&m.call(window))return;a.textContent="Saving...",a.disabled=!0;let p={site_name:((b=(f=document.getElementById("set-site-name"))==null?void 0:f.value)==null?void 0:b.trim())||"",site_tagline:((g=(h=document.getElementById("set-site-tagline"))==null?void 0:h.value)==null?void 0:g.trim())||""},{ok:d,error:v}=await $.put("/settings",p);if(a.textContent="Save Identity",a.disabled=!1,r){if(r.classList.remove("hidden"),d){r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3",_.set("siteName",p.site_name),document.title=p.site_name?`Studio \u2014 ${p.site_name}`:"Studio \u2014 VoxelSite";let k=document.querySelector(".vs-logo-text");k&&(k.textContent=p.site_name||"VoxelSite")}else r.textContent="\u2717 "+((v==null?void 0:v.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3";setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3)}});let l=document.getElementById("btn-save-settings"),c=document.getElementById("save-status");l&&l.addEventListener("click",async()=>{var b,h,g,k,x;if((b=window.demoGuard)!=null&&b.call(window))return;l.textContent="Saving...",l.disabled=!0;let p={ai_provider:s,[`ai_${s}_model`]:((h=document.getElementById("set-ai-model"))==null?void 0:h.value)||"",ai_max_tokens:parseInt(((g=document.getElementById("set-max-tokens"))==null?void 0:g.value)||"32000",10),evaluator_enabled:(k=document.getElementById("set-evaluator-enabled"))!=null&&k.checked?1:0},d=document.getElementById("set-base-url");d&&(p.ai_openai_compatible_base_url=d.value.trim());let v=(x=i==null?void 0:i.value)==null?void 0:x.trim();v&&!v.startsWith("\u2022\u2022")&&(p[`ai_${s}_api_key`]=v);let{ok:m,error:f}=await $.put("/settings",p);l.textContent="Save Settings",l.disabled=!1,c&&(c.classList.remove("hidden"),m?(c.textContent="\u2713 Saved",c.className="text-xs text-vs-success ml-3"):(c.textContent="\u2717 "+((f==null?void 0:f.message)||"Failed to save."),c.className="text-xs text-vs-error ml-3"),setTimeout(()=>c==null?void 0:c.classList.add("hidden"),3e3))});let u=document.getElementById("set-evaluator-enabled");if(u){let p=u.closest("label")||u.parentElement,d=p==null?void 0:p.querySelector(".vs-toggle-track"),v=p==null?void 0:p.querySelector(".vs-toggle-thumb");u.addEventListener("change",()=>{d&&(d.style.background=u.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),v&&(v.style.left=u.checked?"18px":"2px")})}}function nd(e,t){var v;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function r(){if(!e.smtp_host)return"gmail";for(let[m,f]of Object.entries(t))if(f.host&&f.host===e.smtp_host)return m;return"custom"}if(i){let m=r();i.value=m,a&&((v=t[m])!=null&&v.help)&&(a.textContent=t[m].help)}s&&s.addEventListener("change",()=>{let m=s.value;n&&(n.style.display=m==="smtp"?"block":"none"),o&&(o.style.display=m==="mailpit"?"block":"none");let f=document.getElementById("mail-common-fields");f&&(f.style.display=m==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let m=t[i.value];if(!m)return;let f=document.getElementById("set-smtp-host"),b=document.getElementById("set-smtp-port"),h=document.getElementById("set-smtp-encryption");f&&(f.value=m.host||""),b&&(b.value=m.port||587),h&&(h.value=m.encryption||"tls"),a&&(a.textContent=m.help||"")});let l=document.getElementById("btn-toggle-smtp-pass"),c=document.getElementById("set-smtp-password");l&&c&&l.addEventListener("click",()=>{let m=c.type==="password";c.type=m?"text":"password",l.innerHTML=m?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let u=document.getElementById("btn-mail-test");u&&u.addEventListener("click",async()=>{var k,x,E;if((k=window.demoGuard)!=null&&k.call(window))return;let m=(E=(x=document.getElementById("set-mail-test-recipient"))==null?void 0:x.value)==null?void 0:E.trim();if(!m){qo("Enter an email address to send the test to.","warning");return}u.textContent="Sending...",u.disabled=!0;let f=ba();f.test_recipient=m;let{ok:b,data:h,error:g}=await $.post("/settings/mail/test",f);u.textContent="Send Test",u.disabled=!1,b?qo("\u2713 "+((h==null?void 0:h.message)||"Test email sent successfully!"),"success"):qo("\u2717 "+((g==null?void 0:g.message)||"Test failed."),"error")});let p=document.getElementById("btn-save-mail"),d=document.getElementById("save-mail-status");p&&p.addEventListener("click",async()=>{var h;if((h=window.demoGuard)!=null&&h.call(window))return;p.textContent="Saving...",p.disabled=!0;let m=ba(),{ok:f,error:b}=await $.post("/settings/mail",m);p.textContent="Save Email Settings",p.disabled=!1,d&&(d.classList.remove("hidden"),f?(d.textContent="\u2713 Saved",d.className="text-xs text-vs-success ml-3"):(d.textContent="\u2717 "+((b==null?void 0:b.message)||"Failed to save."),d.className="text-xs text-vs-error ml-3"),setTimeout(()=>d==null?void 0:d.classList.add("hidden"),3e3))})}function ba(){var t,s,n,o,i,a,r,l,c,u,p,d,v,m,f;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((l=(r=document.getElementById("set-smtp-host"))==null?void 0:r.value)==null?void 0:l.trim())||"",smtp_port:parseInt(((c=document.getElementById("set-smtp-port"))==null?void 0:c.value)||"587",10),smtp_username:((p=(u=document.getElementById("set-smtp-username"))==null?void 0:u.value)==null?void 0:p.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((d=document.getElementById("set-smtp-encryption"))==null?void 0:d.value)||"tls",mailpit_host:((m=(v=document.getElementById("set-mailpit-host"))==null?void 0:v.value)==null?void 0:m.trim())||"localhost",mailpit_port:parseInt(((f=document.getElementById("set-mailpit-port"))==null?void 0:f.value)||"1025",10)}}function qo(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function Fo(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function od(e){let t=document.getElementById("set-api-enabled"),s=document.getElementById("api-access-body"),n=document.getElementById("btn-save-api-settings"),o=document.getElementById("btn-generate-api-key");t&&t.addEventListener("change",()=>{let i=t.checked,a=t.parentElement.querySelector(".vs-toggle-track"),r=t.parentElement.querySelector(".vs-toggle-thumb");a&&(a.style.background=i?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),r&&(r.style.left=i?"18px":"2px"),s&&(s.style.opacity=i?"":"0.4",s.style.pointerEvents=i?"":"none")}),n&&n.addEventListener("click",async()=>{var l,c,u,p,d;if((l=window.demoGuard)!=null&&l.call(window))return;let i=document.getElementById("save-api-status");n.disabled=!0,n.textContent="Saving...";let a={agent_api_enabled:((c=document.getElementById("set-api-enabled"))==null?void 0:c.checked)||!1,agent_api_allowed_origins:((p=(u=document.getElementById("set-api-origins"))==null?void 0:u.value)==null?void 0:p.trim())||"*"},r=await $.put("/settings",a);n.disabled=!1,n.textContent="Save API Settings",r.ok?(S("API settings saved","success"),i&&(i.textContent="Saved",i.className="text-xs text-vs-success",i.classList.remove("hidden"),setTimeout(()=>i.classList.add("hidden"),2e3))):S(((d=r.error)==null?void 0:d.message)||"Failed to save","error")}),zo(),o&&o.addEventListener("click",()=>{var i;(i=window.demoGuard)!=null&&i.call(window)||ad()})}var ya={owner:["pages:read","pages:write","settings:read","settings:write","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],editor:["pages:read","pages:write","compile:trigger","submissions:read","assets:read","assets:write","tools:invoke"],agent:["pages:read","pages:write","settings:read","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],viewer:["pages:read","settings:read","submissions:read","assets:read"]},id={"prompt:execute":["owner","editor","agent"]};async function zo(){var t;let e=document.getElementById("api-keys-list");if(e)try{let n=((t=(await $.get("/settings/api-keys")).data)==null?void 0:t.keys)||[];if(n.length===0){e.innerHTML=`
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
                  <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.01em;">${y(o.label||"Unnamed")}</span>
                  <span style="font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: var(--radius-full); color: ${l}; background: color-mix(in srgb, ${l} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${l} 20%, transparent); text-transform: capitalize;">${y(o.role||"agent")}</span>
                  ${u?'<span style="font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-full); color: var(--vs-accent); background: color-mix(in srgb, var(--vs-accent) 8%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, var(--vs-accent) 20%, transparent); letter-spacing: 0.5px;">AI</span>':""}
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
      </div>`,e.querySelectorAll(".btn-revoke-key").forEach(o=>{o.addEventListener("click",async()=>{var r;if((r=window.demoGuard)!=null&&r.call(window))return;let i=o.dataset.id;if(o.dataset.confirm!=="true"){o.dataset.confirm="true",o.innerHTML='<span style="font-size: 11px; color: var(--vs-error);">Sure?</span>',setTimeout(()=>{o.dataset.confirm==="true"&&(o.dataset.confirm="",o.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Revoke')},3e3);return}let a=o.closest(".vs-api-key-row");a&&(a.style.opacity="0.4"),await $.delete(`/settings/api-keys/${i}`),S("API key revoked","success"),zo()})})}catch{e.innerHTML='<div style="font-size: 12px; color: var(--vs-text-ghost); text-align: center; padding: 16px 0;">Could not load API keys.</div>'}}function ad(){let e=document.getElementById("generate-key-modal");e&&e.remove();let t=document.createElement("div");t.className="vs-modal-overlay",t.id="generate-key-modal",t.innerHTML=`
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
    </div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>ge(t),n=d=>{d.key==="Escape"&&(d.preventDefault(),s())};document.addEventListener("keydown",n);let o=new MutationObserver(()=>{document.body.contains(t)||(document.removeEventListener("keydown",n),o.disconnect())});o.observe(document.body,{childList:!0}),he(t,s),t.querySelector("#cancel-generate-key").addEventListener("click",s);let i=t.querySelector("#gen-key-label");i==null||i.addEventListener("keydown",d=>{var v;d.key==="Enter"&&(d.preventDefault(),(v=t.querySelector("#confirm-generate-key"))==null||v.click())});let a=t.querySelector("#gen-key-prompt-execute"),r=t.querySelector("#gen-key-prompt-toggle"),l=a,c=r==null?void 0:r.querySelector('span[style*="font-size: 11px"]'),u=d=>{(id["prompt:execute"]||[]).includes(d)?(l.disabled=!1,r.style.opacity="1",r.style.cursor="pointer",c&&(c.textContent="Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.")):(l.checked=!1,l.disabled=!0,r.style.opacity="0.45",r.style.cursor="not-allowed",r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)",c&&(c.textContent="Not available for read-only roles. Prompt execution requires write access."))},p=t.querySelector("#gen-key-role");p==null||p.addEventListener("change",()=>u(p.value)),u((p==null?void 0:p.value)||"agent"),a==null||a.addEventListener("change",()=>{a.checked?(r.style.borderColor="color-mix(in srgb, var(--vs-accent) 40%, transparent)",r.style.background="color-mix(in srgb, var(--vs-accent) 4%, var(--vs-bg-base))"):(r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)")}),t.querySelector("#confirm-generate-key").addEventListener("click",async()=>{var g,k,x,E,M,I;let d=(k=(g=document.getElementById("gen-key-label"))==null?void 0:g.value)==null?void 0:k.trim(),v=((x=document.getElementById("gen-key-role"))==null?void 0:x.value)||"agent",m=(E=document.getElementById("gen-key-prompt-execute"))==null?void 0:E.checked;if(!d){S("Please enter a label for the key","error");return}let f=t.querySelector("#confirm-generate-key");f.disabled=!0,f.textContent="Generating\u2026";let b={label:d,role:v};m&&(b.scopes=[...ya[v]||ya.agent,"prompt:execute"]);let h=await $.post("/settings/api-keys",b);h.ok&&((M=h.data)!=null&&M.key)?(s(),rd(h.data.key,d),zo()):(f.disabled=!1,f.textContent="Generate",S(((I=h.error)==null?void 0:I.message)||"Failed to generate key","error"))})}function rd(e,t){let s=document.getElementById("key-reveal-modal");s&&s.remove();let n=document.createElement("div");n.className="vs-modal-overlay",n.id="key-reveal-modal",n.innerHTML=`
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("is-visible"));let o=()=>ge(n),i=l=>{l.key==="Escape"&&(l.preventDefault(),o())};document.addEventListener("keydown",i);let a=new MutationObserver(()=>{document.body.contains(n)||(document.removeEventListener("keydown",i),a.disconnect())});a.observe(document.body,{childList:!0}),he(n,o),n.querySelector("#close-key-reveal").addEventListener("click",o);let r=n.querySelector("#revealed-key-input");r==null||r.addEventListener("focus",()=>r.select()),n.querySelector("#copy-api-key").addEventListener("click",async()=>{let l=n.querySelector("#copy-api-key");try{await navigator.clipboard.writeText(e),l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',l.style.color="#22c55e",setTimeout(()=>{l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',l.style.color=""},2e3)}catch{r==null||r.select()}})}var Ht=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},ns=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Uo={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},ld={contact:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',newsletter:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',callback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',feedback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'};function Ea(){return setTimeout(()=>dd(),0),`
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
  `}async function dd(){var a,r,l,c,u,p;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let d=await ka();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let x=function(E){let M=document.getElementById("bar-color-swatch"),I=document.getElementById("bar-brand-hex"),R=document.getElementById("bar-brand-color");M&&(M.style.background=E),I&&I!==document.activeElement&&(I.value=E),R&&(R.value=E),document.querySelectorAll(".bar-color-preset").forEach(U=>{U.style.borderColor=U.dataset.color.toLowerCase()===E.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:d,data:v}=await $.get("/agentic/actions/bar-settings"),m=d&&(v==null?void 0:v.settings)||{theme:"bottom-bar",visibility:"all-pages"},f=m.theme||"bottom-bar",b=m.visibility||"all-pages",h={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
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
      </svg>`},g={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},k={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(k).map(([E,M])=>`<option value="${E}" ${b===E?"selected":""}>${M}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(h).map(([E,M])=>{let I=E===f;return`
              <button type="button" class="bar-theme-option" data-theme="${E}" style="
                border: 2px solid ${I?"var(--vs-accent)":"var(--vs-border-subtle)"};
                background: ${I?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)"};
                border-radius: var(--radius-lg, 10px);
                padding: 14px 12px 10px;
                cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 8px;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.12s;
                color: ${I?"var(--vs-accent)":"var(--vs-text-ghost)"};
                position: relative;
                outline: none;
              "
                onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-medium)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}"
                onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-subtle)';this.style.transform='';this.style.boxShadow='';}"
              >
                <div style="width: 100%; max-width: 120px;">${M}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${I?"var(--vs-accent)":"var(--vs-text-secondary)"};">${g[E]}</span>
                ${I?`<div style="
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
              ${["light","dark"].map(E=>{let M=E===(m.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${E}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${M?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${M?"#fff":"var(--vs-text-secondary)"};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${{light:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',dark:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}[E]} ${E.charAt(0).toUpperCase()+E.slice(1)}</button>`}).join("")}
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
                ${["#EA580C","#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#374151"].map(E=>`
                  <button type="button" class="bar-color-preset" data-color="${E}" title="${E}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${E}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
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
    `,document.querySelectorAll(".bar-theme-option").forEach(E=>{E.addEventListener("click",async()=>{let M=E.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(R=>{let U=R.dataset.theme===M;R.style.borderColor=U?"var(--vs-accent)":"var(--vs-border-subtle)",R.style.background=U?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",R.style.color=U?"var(--vs-accent)":"var(--vs-text-ghost)",R.classList.toggle("active",U);let te=R.querySelector("span");te&&(te.style.color=U?"var(--vs-accent)":"var(--vs-text-secondary)");let G=R.querySelector('[style*="position: absolute"]');if(G&&!U&&G.remove(),U&&!R.querySelector('[style*="position: absolute"]')){let O=document.createElement("div");O.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",O.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',R.appendChild(O)}});let{ok:I}=await $.put("/agentic/actions/bar-settings",{theme:M});I&&(E.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>E.style.boxShadow="",400),S("Bar style updated","success"))})}),(r=document.getElementById("bar-visibility"))==null||r.addEventListener("change",async E=>{let{ok:M}=await $.put("/agentic/actions/bar-settings",{visibility:E.target.value});M&&S("Bar visibility updated","success")}),document.querySelectorAll(".bar-scheme-btn").forEach(E=>{E.addEventListener("click",async()=>{let M=E.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(R=>{let U=R.dataset.scheme===M;R.style.background=U?"var(--vs-accent)":"var(--vs-bg-surface)",R.style.color=U?"#fff":"var(--vs-text-secondary)"});let{ok:I}=await $.put("/agentic/actions/bar-settings",{color_scheme:M});I&&S("Color scheme updated","success")})}),(l=document.getElementById("bar-brand-color"))==null||l.addEventListener("input",E=>{x(E.target.value)}),(c=document.getElementById("bar-brand-color"))==null||c.addEventListener("change",async E=>{let{ok:M}=await $.put("/agentic/actions/bar-settings",{brand_color:E.target.value});M&&S("Brand color updated","success")}),(u=document.getElementById("bar-brand-hex"))==null||u.addEventListener("change",async E=>{let M=E.target.value.trim();if(M.startsWith("#")||(M="#"+M),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(M)){x(M);let{ok:I}=await $.put("/agentic/actions/bar-settings",{brand_color:M});I&&S("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach(E=>{E.addEventListener("click",async()=>{let M=E.dataset.color;x(M);let{ok:I}=await $.put("/agentic/actions/bar-settings",{brand_color:M});I&&S("Brand color updated","success")})}),x(m.brand_color||"#EA580C")}let{ok:s,data:n}=await $.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon" style="color: var(--vs-accent);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="vs-empty-state-title">No actions yet</p>
          <p class="vs-empty-state-desc">Create your first agent action to let AI assistants and website visitors interact with your business \u2014 reservations, appointments, quotes, and more.</p>
          <button id="btn-empty-new-action" class="vs-btn vs-btn-primary vs-btn-sm" style="margin-top: 12px;">${C.plus} New Action</button>
        </div>
      </div>
    `,(p=document.getElementById("btn-empty-new-action"))==null||p.addEventListener("click",async()=>{let d=await ka();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((d,v)=>{let m=d.active,f=d._stats||d.stats||{},b=f.total||0,h=f.last_created_at?_s(f.last_created_at):"\u2014",g={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},k=g[d.icon]||g.circle;return`
          <div class="vs-action-list-row vs-form-card" data-action-id="${y(d.id)}" style="cursor: pointer; transition: box-shadow 0.15s ease;">
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
              ${k}
            </div>
            <div class="vs-form-card-body">
              <div class="vs-form-card-name">${y(d.name||d.id)}</div>
              ${d.description?`<div class="vs-form-card-desc">${y(d.description)}</div>`:""}
              <div class="vs-form-card-meta">
                <span class="vs-status-pill" style="
                  background: ${m?"var(--vs-success-dim)":"var(--vs-bg-raised)"};
                  color: ${m?"var(--vs-success)":"var(--vs-text-ghost)"};
                  font-size: 11px; padding: 1px 8px;
                ">${m?"Active":"Draft"}</span>
                <span class="vs-form-card-dot">\xB7</span>
                <span>${b} record${b!==1?"s":""}</span>
                ${f.today>0?`<span class="vs-form-card-dot">\xB7</span><span>+${f.today} today</span>`:""}
                <span class="vs-form-card-dot">\xB7</span>
                <span>${h}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `}).join("")}
    </div>
  `,document.querySelectorAll(".vs-action-list-row").forEach(d=>{d.addEventListener("click",v=>{if(v.target.closest(".vs-action-reorder"))return;let m=d.dataset.actionId;m&&(window.location.hash="#/actions/"+encodeURIComponent(m))})});async function i(){let d=document.querySelectorAll("#actions-list .vs-action-list-row"),v=Array.from(d).map(m=>m.dataset.actionId);await $.post("/agentic/actions/reorder",{order:v})}document.querySelectorAll(".action-move-up").forEach(d=>{d.addEventListener("click",async v=>{v.preventDefault(),v.stopPropagation();let m=d.closest(".vs-action-list-row"),f=m==null?void 0:m.previousElementSibling;f&&(m.parentNode.insertBefore(m,f),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(d=>{d.addEventListener("click",async v=>{v.preventDefault(),v.stopPropagation();let m=d.closest(".vs-action-list-row"),f=m==null?void 0:m.nextElementSibling;f&&(m.parentNode.insertBefore(f,m),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})})}async function ka(){return new Promise(async e=>{var r;let{ok:t,data:s}=await $.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 580px;">
        <div class="vs-modal-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
          <h2 class="vs-modal-title" style="margin: 0;">${C.zap} New Agent Action</h2>
          <button id="close-new-action-modal" style="background: none; border: none; cursor: pointer; color: var(--vs-text-ghost); padding: 4px; margin: -4px -4px 0 0; line-height: 0; border-radius: var(--radius-md); transition: color 0.15s ease;" onmouseenter="this.style.color='var(--vs-text-primary)'" onmouseleave="this.style.color='var(--vs-text-ghost)'">${C.x}</button>
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
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${ld[l.id]||C.zap}</span>
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
              <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: transparent; color: var(--vs-text-ghost);">${C.plus}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-secondary);">Blank</span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.3;">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(l=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(l)},a=l=>{l.key==="Escape"&&(l.preventDefault(),i())};document.addEventListener("keydown",a),he(o,i),(r=document.getElementById("close-new-action-modal"))==null||r.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(l=>{l.addEventListener("mouseenter",()=>{l.style.borderColor="var(--vs-accent)",l.style.background="var(--vs-bg-raised)"}),l.addEventListener("mouseleave",()=>{l.style.borderColor=(l.dataset.templateId==="blank","var(--vs-border)"),l.style.background=l.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),l.addEventListener("click",async()=>{var u,p;let c=l.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(d=>{d.style.pointerEvents="none",d.style.opacity="0.5"}),l.style.opacity="1",l.style.borderColor="var(--vs-accent)",c==="blank"){let d={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"email",type:"email",label:"Email",placeholder:"you@example.com",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:v,data:m}=await $.post("/agentic/actions",d);v&&(m!=null&&m.action)?(S("Action created","success"),i({ok:!0,actionId:m.action.id})):(S(((u=m==null?void 0:m.error)==null?void 0:u.message)||"Failed to create action","error"),i())}else{let{ok:d,data:v}=await $.post("/agentic/actions/from-template",{template_id:c});d&&(v!=null&&v.action)?(S(`${v.action.name} created`,"success"),i({ok:!0,actionId:v.action.id})):(S(((p=v==null?void 0:v.error)==null?void 0:p.message)||"Failed to create action","error"),i())}})})})}function $a(e){return setTimeout(()=>Rn(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function Rn(e){var c,u,p,d,v,m,f,b,h,g,k,x,E,M,I,R,U,te,G,O;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await $.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,r=i.stats||{},l=a.active;if(t.innerHTML=`
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
            ${C.copy} Duplicate
          </button>
          <button id="btn-delete-action" class="vs-btn vs-btn-ghost vs-btn-sm" style="color: var(--vs-error);" title="Delete">
            ${C.trash}
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
        <span class="vs-form-stat-value" style="color: var(--vs-info)">${((c=r.by_status)==null?void 0:c.pending)||0}</span>
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
  `,s){let j=function(L){let z=L.querySelector(".field-required");if(!z)return;let P=L.querySelectorAll("span")[0],w=L.querySelectorAll("span")[1],B=()=>{P.style.background=z.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",w.style.left=z.checked?"18px":"2px"};z.addEventListener("change",B)},ce=function(L){return L.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},be=function(){let L=document.querySelectorAll("#action-fields-builder .vs-field-row"),z=[],P=new Set;return L.forEach(w=>{var Q,J,Y,ie;let B=((J=(Q=w.querySelector(".field-label"))==null?void 0:Q.value)==null?void 0:J.trim())||"",A=((Y=w.querySelector(".field-type"))==null?void 0:Y.value)||"text",N=((ie=w.querySelector(".field-required"))==null?void 0:ie.checked)||!1,q=B?ce(B):"";if(P.has(q)){let ee=2;for(;P.has(q+"_"+ee);)ee++;q=q+"_"+ee}if(P.add(q),q&&B){let ee={name:q,type:A,label:B,required:N},le=w.dataset.placeholder;le&&(ee.placeholder=le);let ve=w.dataset.default;ve&&(ee.default_value=ve);let Be=w.dataset.description;Be&&(ee.description=Be);let xe=w.dataset.min;xe!==""&&xe!==void 0&&(ee.min=Number(xe));let ke=w.dataset.max;ke!==""&&ke!==void 0&&(ee.max=Number(ke));let Ce=w.dataset.maxlength;Ce&&(ee.max_length=Number(Ce));let Pe=w.dataset.minlength;Pe&&(ee.min_length=Number(Pe));let pe=w.dataset.options;if(pe)try{ee.options=JSON.parse(pe)}catch{ee.options=pe.split(",").map(fe=>fe.trim()).filter(Boolean)}if(A==="file"){let se=w.dataset.allowedExtensions;if(se)try{ee.allowed_extensions=JSON.parse(se)}catch{ee.allowed_extensions=se.split(",").map(Vt=>Vt.trim().toLowerCase()).filter(Boolean)}let fe=w.dataset.maxSizeMb;fe&&(ee.max_size_mb=Number(fe))}A==="checkbox"&&w.dataset.checkedDefault==="true"&&(ee.checked_default=!0),z.push(ee)}}),z},tt=function(L){var z,P;(z=L.querySelector(".field-move-up"))==null||z.addEventListener("click",()=>{let w=L.previousElementSibling;w&&(L.parentNode.insertBefore(L,w),L.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>L.style.boxShadow="",300))}),(P=L.querySelector(".field-move-down"))==null||P.addEventListener("click",()=>{let w=L.nextElementSibling;w&&(L.parentNode.insertBefore(w,L),L.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>L.style.boxShadow="",300))})},ut=function(L){L.addEventListener("click",async()=>{let z=L.closest(".vs-field-row");await ye({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&(z.style.opacity="0",z.style.transform="translateX(20px)",z.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>z.remove(),200))})},ht=function(L){L&&L.addEventListener("click",()=>{var B,A,N;let z=L.closest(".vs-field-row");if(!z)return;let P=((B=z.querySelector(".field-type"))==null?void 0:B.value)||"text",w=((A=z.querySelector(".field-label"))==null?void 0:A.value)||((N=z.querySelector(".field-name"))==null?void 0:N.value)||"Field";zt(z,P,w)})},zt=function(L,z,P){var Vt,Ye,Es,$s,mi;(Vt=document.getElementById("vs-field-settings-modal"))==null||Vt.remove();let w=L.dataset.placeholder||"",B=L.dataset.default||"",A=L.dataset.min||"",N=L.dataset.max||"",q=L.dataset.maxlength||"",Q=L.dataset.options||"[]",J=L.dataset.description||"",Y=["text","email","tel","url","textarea"].includes(z),ie=z==="number",ee=["text","email","tel","url","textarea"].includes(z),le=["select","radio","multiselect"].includes(z),ve=z==="multiselect",Be=z==="file",xe=z==="checkbox",ke="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",Ce="margin-bottom: 16px;",Pe="";if(Y&&(Pe+=`<div style="${Ce}">
          <label style="${ke}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${ue(w)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),!Be&&!xe&&(Pe+=`<div style="${Ce}">
          <label style="${ke}">Default Value</label>
          <input type="${ie?"number":"text"}" id="fs-default" class="vs-input" value="${ue(B)}" placeholder="Pre-filled value" />
        </div>`),xe&&(Pe+=`<div style="${Ce}">
          <label style="${ke}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked \u2014 defaults to field name if empty)</span></label>
          <input type="text" id="fs-default" class="vs-input" value="${ue(B)}" placeholder="e.g. yes, true, 1" />
        </div>
        <div style="${Ce}">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="fs-checked-default" ${L.dataset.checkedDefault==="true"?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${L.dataset.checkedDefault==="true"?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span style="
                position: absolute; left: ${L.dataset.checkedDefault==="true"?"18px":"2px"}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <span style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary);">Selected by default</span>
          </label>
        </div>`),ie&&(Pe+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${Ce}">
          <div>
            <label style="${ke}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${ue(A)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${ke}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${ue(N)}" placeholder="No limit" />
          </div>
        </div>`),ee&&(Pe+=`<div style="${Ce}">
          <label style="${ke}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${ue(q)}" placeholder="No limit" min="1" />
        </div>`),le){let Ee;try{Ee=JSON.parse(Q)}catch{Ee=Q.split(",").map(De=>De.trim()).filter(Boolean)}let Re;if(ve){let Me=(L.dataset.default||"").split(",").map(De=>De.trim()).filter(Boolean);Re=Ee.map(De=>Me.includes(De)?"[x] "+De:De).join(`
`)}else Re=Ee.join(`
`);Pe+=`<div style="${Ce}">
          <label style="${ke}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${ve?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${ve?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${y(Re)}</textarea>
        </div>`}if(Be){let Ee=L.dataset.allowedExtensions||"",Re=L.dataset.maxSizeMb||"10",Me;try{Me=Ee?JSON.parse(Ee):[]}catch{Me=[]}let De=Me.join(", "),st=["pdf","doc","docx","xls","xlsx","csv","txt"],Cs=["jpg","jpeg","png","gif","webp"],Ls=["zip","rar"],fn=st.some(Bt=>Me.includes(Bt)),bn=Cs.some(Bt=>Me.includes(Bt)),yn=Ls.some(Bt=>Me.includes(Bt));Pe+=`<div style="${Ce}">
          <label style="${ke}">Allowed File Types</label>
          <div style="display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(st)}' ${fn?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Documents
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Cs)}' ${bn?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Images
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Ls)}' ${yn?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Archives
            </label>
          </div>
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${ue(De)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${Ce}">
          <label style="${ke}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${ue(Re)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`}Pe+=`<div style="${Ce}">
        <label style="${ke}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${ue(J)}" placeholder="Optional description or instructions" />
      </div>`;let pe=document.createElement("div");if(pe.id="vs-field-settings-modal",pe.style.cssText="position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;",pe.innerHTML=`
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
                ${y(P)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${z}
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
            ${Pe}
          </div>
          <div style="
            padding: 16px 24px; border-top: 1px solid var(--vs-border-subtle);
            display: flex; justify-content: flex-end; gap: 8px;
          ">
            <button id="fs-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
            <button id="fs-save" class="vs-btn vs-btn-primary vs-btn-sm">Apply</button>
          </div>
        </div>
      `,document.body.appendChild(pe),setTimeout(()=>{var Ee;return(Ee=pe.querySelector("input, textarea"))==null?void 0:Ee.focus()},100),Be&&pe.querySelectorAll(".fs-ext-group").forEach(Ee=>{Ee.addEventListener("change",()=>{let Re=pe.querySelector("#fs-allowed-extensions");if(!Re)return;let Me=Re.value.split(",").map(st=>st.trim().toLowerCase()).filter(Boolean),De=JSON.parse(Ee.dataset.exts||"[]");Ee.checked?De.forEach(st=>{Me.includes(st)||Me.push(st)}):Me=Me.filter(st=>!De.includes(st)),Re.value=Me.join(", ")})}),xe){let Ee=(Ye=pe.querySelector("#fs-checked-default"))==null?void 0:Ye.closest("label");if(Ee){let Re=pe.querySelector("#fs-checked-default"),Me=Ee.querySelectorAll("span > span")[0],De=Ee.querySelectorAll("span > span")[1];Re==null||Re.addEventListener("change",()=>{Me&&(Me.style.background=Re.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),De&&(De.style.left=Re.checked?"18px":"2px")})}}let se=()=>pe.remove(),fe=pe.querySelector("#fs-backdrop");fe&&he(fe,se),(Es=pe.querySelector("#fs-close"))==null||Es.addEventListener("click",se),($s=pe.querySelector("#fs-cancel"))==null||$s.addEventListener("click",se);let Ut=Ee=>{Ee.key==="Escape"&&(se(),document.removeEventListener("keydown",Ut))};document.addEventListener("keydown",Ut),(mi=pe.querySelector("#fs-save"))==null||mi.addEventListener("click",()=>{var Ee,Re,Me,De,st,Cs,Ls,fn,bn,yn;if(Y&&(L.dataset.placeholder=((Ee=pe.querySelector("#fs-placeholder"))==null?void 0:Ee.value)||""),Be||(L.dataset.default=((Re=pe.querySelector("#fs-default"))==null?void 0:Re.value)||""),xe&&(L.dataset.checkedDefault=(Me=pe.querySelector("#fs-checked-default"))!=null&&Me.checked?"true":"false"),ie&&(L.dataset.min=((De=pe.querySelector("#fs-min"))==null?void 0:De.value)||"",L.dataset.max=((st=pe.querySelector("#fs-max"))==null?void 0:st.value)||""),ee&&(L.dataset.maxlength=((Cs=pe.querySelector("#fs-maxlength"))==null?void 0:Cs.value)||""),le){let Ss=(((Ls=pe.querySelector("#fs-options"))==null?void 0:Ls.value)||"").split(/[\n]/).map(Wt=>Wt.trim()).filter(Boolean);if(ve){let Wt=[],xn=[];Ss.forEach(gi=>{let po=gi.match(/^\[x\]\s*(.+)$/i);po?(Wt.push(po[1].trim()),xn.push(po[1].trim())):Wt.push(gi)}),L.dataset.options=JSON.stringify(Wt),L.dataset.default=xn.join(",")}else L.dataset.options=JSON.stringify(Ss)}if(Be){let Ss=(((fn=pe.querySelector("#fs-allowed-extensions"))==null?void 0:fn.value)||"").split(",").map(xn=>xn.trim().toLowerCase()).filter(Boolean);L.dataset.allowedExtensions=Ss.length>0?JSON.stringify(Ss):"";let Wt=((bn=pe.querySelector("#fs-max-size-mb"))==null?void 0:bn.value)||"10";L.dataset.maxSizeMb=String(Math.min(Math.max(parseInt(Wt)||10,1),50))}L.dataset.description=((yn=pe.querySelector("#fs-description"))==null?void 0:yn.value)||"",L.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>L.style.boxShadow="",400),se(),S("Field settings updated","success")})},K="make_"+e.replace(/-/g,"_"),ae={number:"number",checkbox:"boolean",multiselect:"array"},D={},T=[];(a.fields||[]).forEach(L=>{let P={type:ae[L.type]||"string"},w=L.label||L.name;L.require_future?P.description=w+" (must be in the future)":w&&(P.description=w),L.min!==void 0&&L.min!==""&&(P.minimum=L.min),L.max!==void 0&&L.max!==""&&(P.maximum=L.max),L.min_length&&(P.minLength=L.min_length),L.max_length&&(P.maxLength=L.max_length),L.options&&L.options.length>0&&(L.type==="multiselect"?P.items={type:"string",enum:L.options}:P.enum=L.options),D[L.name]=P,L.required&&T.push(L.name)});let H={name:K,description:a.description||a.name,inputSchema:{type:"object",properties:D,required:T}},F=JSON.stringify(H,null,2),V=y(F),Z=l?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">\u25CF Discoverable by agents</span>':'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">\u25CB Draft \u2014 not visible to agents</span>',X=['<div style="margin-bottom: 16px;">','<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">','<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',`<code style="font-size:13px;font-weight:600;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">`+y(K)+"</code>","</div>",'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">','<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'," /mcp.php","</span>",'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'," /actions/manifest.json","</span>",Z,"</div>","</div>",'<div style="position: relative;">',`<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">`+V+"</code></pre>",`<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor='var(--vs-border)';this.style.color='var(--vs-text-secondary)';" onmouseleave="this.style.borderColor='var(--vs-border-subtle)';this.style.color='var(--vs-text-ghost)';">`+C.copy+"</button>","</div>",'<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',`This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site's MCP endpoint.<br>`,'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',"</p>"].join("");s.innerHTML=`
      <div class="vs-settings-card" style="margin-top: 16px;">
        <h2 class="vs-settings-card-title">Action</h2>
        <div class="flex flex-col gap-4">
          <div>
            <label for="action-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Name</label>
            <input type="text" id="action-name" class="vs-input" value="${y(a.name||"")}" />
          </div>
          <div>
            <label for="action-description" class="block text-sm font-medium text-vs-text-secondary mb-1">Description <span style="font-weight: 400; color: var(--vs-text-ghost);">\u2014 for your reference and AI agents, not shown to visitors</span></label>
            <input type="text" id="action-description" class="vs-input" value="${y(a.description||"")}" placeholder="e.g. Register for our quarterly workshops" />
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Actions Bar</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">How this action appears on your website.</p>
            <div style="margin-bottom: 12px;">
              <label for="action-button-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Button Label</label>
              <input type="text" id="action-button-label" class="vs-input" value="${y(a.bar_button_label||"")}" placeholder="${ue(a.name||"e.g. Register")}" />
              <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Short label for the bar button. Defaults to the action name.</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-vs-text-secondary mb-1">Icon</label>
              <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${[["calendar","Calendar"],["clock","Clock"],["utensils","Utensils"],["file-text","Document"],["list","List"],["shopping-bag","Shop"],["ticket","Ticket"],["message-square","Message"],["users","People"],["mail","Mail"],["star","Star"],["circle","Default"]].map(([L,z])=>`
                  <button type="button" class="vs-icon-pick" data-icon="${L}" title="${z}" style="
                    display: flex; align-items: center; justify-content: center;
                    width: 42px; height: 42px; border-radius: var(--radius-md);
                    border: 1.5px solid ${(a.icon||"circle")===L?"var(--vs-accent)":"var(--vs-border)"};
                    background: ${(a.icon||"circle")===L?"var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))":"var(--vs-bg-floating)"};
                    color: ${(a.icon||"circle")===L?"var(--vs-accent)":"var(--vs-text-ghost)"};
                    cursor: pointer; transition: all 0.15s ease;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',"shopping-bag":'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',circle:'<circle cx="12" cy="12" r="10"/>'}[L]}</svg></button>
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
                  <input type="checkbox" id="action-allow-duplicates" ${(v=(d=a.constraints)==null?void 0:d.uniqueness)!=null&&v.enabled?"":"checked"} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                  <span class="vs-toggle-track" style="
                    position: absolute; inset: 0; border-radius: 10px;
                    background: ${(f=(m=a.constraints)==null?void 0:m.uniqueness)!=null&&f.enabled?"var(--vs-border-medium, #ccc)":"var(--vs-accent)"};
                    transition: background 0.2s ease;
                  "></span>
                  <span class="vs-toggle-thumb" style="
                    position: absolute; left: ${(h=(b=a.constraints)==null?void 0:b.uniqueness)!=null&&h.enabled?"2px":"18px"}; top: 2px;
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: left 0.2s ease;
                  "></span>
                </span>
                <span style="font-size: 13px; color: var(--vs-text-secondary);">Same email can submit multiple times</span>
              </label>
            </div>
            <div id="action-duplicate-msg-wrap" style="${(k=(g=a.constraints)==null?void 0:g.uniqueness)!=null&&k.enabled?"":"display: none;"}">
              <label for="action-duplicate-msg" class="block text-sm font-medium text-vs-text-secondary mb-1">Rejection message</label>
              <input type="text" id="action-duplicate-msg" class="vs-input" value="${y(((x=a.responses)==null?void 0:x.duplicate)||"")}"
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
          <button id="btn-add-field" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-bottom: 12px;">${C.plus||"+"} Add Field</button>
        </div>
        <div id="action-fields-builder" style="display: flex; flex-direction: column; gap: 6px;">
          ${(a.fields||[]).map((L,z)=>`
            <div class="vs-field-row" data-field-idx="${z}"
              data-field-name="${ue(L.name||"")}"
              data-placeholder="${ue(L.placeholder||"")}"
              data-default="${ue(L.default_value||L.default||"")}"
              data-min="${L.min!==void 0?L.min:""}"
              data-max="${L.max!==void 0?L.max:""}"
              data-maxlength="${L.max_length||""}"
              data-minlength="${L.min_length||""}"
              data-options="${ue(JSON.stringify(L.options||[]))}"
              data-description="${ue(L.description||"")}"
              ${L.allowed_extensions?`data-allowed-extensions="${ue(JSON.stringify(L.allowed_extensions))}"`:""}
              ${L.max_size_mb?`data-max-size-mb="${L.max_size_mb}"`:""}
              ${L.checked_default?'data-checked-default="true"':""}
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
                " ${z===0?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${z===(a.fields||[]).length-1?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${y(L.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(P=>`<option value="${P}" ${L.type===P?"selected":""}>${P==="multiselect"?"multi-select":P}</option>`).join("")}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${L.required?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${L.required?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${L.required?"18px":"2px"}; top: 2px;
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
                ${C.trash}
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
          ${X}
        </div>
      </details>
    `,document.querySelectorAll(".field-required").forEach(L=>{j(L.closest("label"))});let ne=document.getElementById("action-allow-duplicates");if(ne){let L=ne.closest("label"),z=L==null?void 0:L.querySelector(".vs-toggle-track"),P=L==null?void 0:L.querySelector(".vs-toggle-thumb");ne.addEventListener("change",()=>{z&&(z.style.background=ne.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),P&&(P.style.left=ne.checked?"18px":"2px");let w=document.getElementById("action-duplicate-msg-wrap");w&&(w.style.display=ne.checked?"none":"")})}document.querySelectorAll(".vs-icon-pick").forEach(L=>{L.addEventListener("mouseenter",()=>{var z;L.dataset.icon!==((z=document.getElementById("action-icon"))==null?void 0:z.value)&&(L.style.borderColor="var(--vs-accent)",L.style.color="var(--vs-text-secondary)")}),L.addEventListener("mouseleave",()=>{var z;L.dataset.icon!==((z=document.getElementById("action-icon"))==null?void 0:z.value)&&(L.style.borderColor="var(--vs-border)",L.style.color="var(--vs-text-ghost)")}),L.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach(z=>{z.style.borderColor="var(--vs-border)",z.style.background="var(--vs-bg-floating)",z.style.color="var(--vs-text-ghost)"}),L.style.borderColor="var(--vs-accent)",L.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",L.style.color="var(--vs-accent)",document.getElementById("action-icon").value=L.dataset.icon})}),(E=document.getElementById("btn-save-action"))==null||E.addEventListener("click",async()=>{var A,N,q,Q,J,Y,ie,ee,le;if(Ht()||ns())return;let L={...a};if(L.name=((A=document.getElementById("action-name"))==null?void 0:A.value)||a.name,L.bar_button_label=((N=document.getElementById("action-button-label"))==null?void 0:N.value)||"",L.description=((q=document.getElementById("action-description"))==null?void 0:q.value)||"",L.icon=((Q=document.getElementById("action-icon"))==null?void 0:Q.value)||"circle",((J=document.getElementById("action-allow-duplicates"))==null?void 0:J.checked)??!0)(Y=L.constraints)!=null&&Y.uniqueness&&(L.constraints.uniqueness.enabled=!1);else{let ve=(a.fields||[]).filter(xe=>xe.type==="email").map(xe=>xe.name),Be=ve.length>0?ve:["email"];L.constraints={...L.constraints||{},uniqueness:{enabled:!0,fields:Be,scope_statuses:["confirmed","pending"]}}}let P=((ie=document.getElementById("action-duplicate-msg"))==null?void 0:ie.value)||"";P?L.responses={...L.responses||{},duplicate:P}:(ee=L.responses)!=null&&ee.duplicate&&delete L.responses.duplicate;let{ok:w,data:B}=await $.put(`/agentic/actions/${encodeURIComponent(e)}`,L);S(w?"Action saved":((le=B==null?void 0:B.error)==null?void 0:le.message)||"Failed to save",w?"success":"error"),w&&Rn(e)});async function pt(){var N;let L=document.querySelectorAll("#action-fields-builder .vs-field-row"),z=!1;if(L.forEach(q=>{var J,Y;((Y=(J=q.querySelector(".field-label"))==null?void 0:J.value)==null?void 0:Y.trim())||(z=!0,q.style.borderColor="var(--vs-error, #ef4444)",q.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{q.style.borderColor="var(--vs-border-subtle)",q.style.boxShadow=""},2e3))}),z){S("Every field needs a label","warning");return}let P=be();if(P.length===0){S("At least one field is required","warning");return}let w={...a,fields:P},{ok:B,data:A}=await $.put(`/agentic/actions/${encodeURIComponent(e)}`,w);S(B?"Fields saved":((N=A==null?void 0:A.error)==null?void 0:N.message)||"Failed to save",B?"success":"error"),B&&Rn(e)}(M=document.getElementById("btn-save-fields"))==null||M.addEventListener("click",pt),(I=document.getElementById("btn-add-field"))==null||I.addEventListener("click",()=>{var w,B;let L=document.getElementById("action-fields-builder");if(!L)return;let z=document.createElement("div");z.className="vs-field-row",z.dataset.fieldName="",z.dataset.placeholder="",z.dataset.default="",z.dataset.min="",z.dataset.max="",z.dataset.maxlength="",z.dataset.options="",z.dataset.description="",z.style.cssText=`
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;let P='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';z.innerHTML=`
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
          ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(A=>`<option value="${A}">${A==="multiselect"?"multi-select":A}</option>`).join("")}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${P}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${C.trash}
        </button>
      `,L.appendChild(z),(w=z.querySelector(".field-label"))==null||w.focus(),j((B=z.querySelector(".field-required"))==null?void 0:B.closest("label")),tt(z),ut(z.querySelector(".field-delete")),ht(z.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(tt),document.querySelectorAll(".field-delete").forEach(ut),document.querySelectorAll(".field-settings").forEach(ht),(R=document.getElementById("btn-copy-schema"))==null||R.addEventListener("click",()=>{var z;let L=((z=document.getElementById("agent-schema-json"))==null?void 0:z.textContent)||"";navigator.clipboard.writeText(L).then(()=>{S("Schema copied","success")}).catch(()=>{let P=document.createElement("textarea");P.value=L,P.style.position="fixed",P.style.opacity="0",document.body.appendChild(P),P.select(),document.execCommand("copy"),document.body.removeChild(P),S("Schema copied","success")})}),(U=document.getElementById("agent-preview-section"))==null||U.addEventListener("toggle",L=>{let z=L.target.querySelector(".agent-preview-chevron");z&&(z.style.transform=L.target.open?"rotate(180deg)":"rotate(0)")}),(te=document.getElementById("btn-toggle-active"))==null||te.addEventListener("click",async()=>{if(Ht()||ns())return;let L={...a,active:!l},{ok:z}=await $.put(`/agentic/actions/${encodeURIComponent(e)}`,L);z?(S(L.active?"Action activated":"Action deactivated","success"),Rn(e)):S("Failed to update status","error")}),(G=document.getElementById("btn-duplicate-action"))==null||G.addEventListener("click",async()=>{var w;if(Ht()||ns()||!await ye({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:z,data:P}=await $.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});z&&(P!=null&&P.action)?(S(`"${P.action.name}" created`,"success"),window.location.hash=`#/actions/${P.action.id}`):S(((w=P==null?void 0:P.error)==null?void 0:w.message)||"Failed to duplicate","error")}),(O=document.getElementById("btn-delete-action"))==null||O.addEventListener("click",async()=>{if(Ht()||ns())return;if(await ye({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:z}=await $.delete(`/agentic/actions/${encodeURIComponent(e)}`);z?(S("Action deleted","success"),window.location.hash="#/actions"):S("Failed to delete action","error")}})}await hs(e,1)}async function hs(e,t=1){var m,f,b,h,g,k,x,E;let s=document.getElementById("action-records");if(!s)return;let n=((m=document.getElementById("action-filter-status"))==null?void 0:m.value)||"all",o=((f=document.getElementById("action-filter-search"))==null?void 0:f.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:r}=await $.get(i);if(!a||!r){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let l=r.records||[],c=r.total||0,u=r.per_page||20,p=Math.ceil(c/u);s.innerHTML=`
    <div class="vs-settings-card" style="margin-top: 16px;">
      <h2 class="vs-settings-card-title">Records</h2>
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
          <input type="text" id="action-filter-search" class="vs-input vs-input-compact" placeholder="Search records..." value="${y(o)}" style="min-width: 180px;" />
        </div>
        <div class="flex items-center gap-2">
          ${window.IS_DEMO?"":`<button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old records" ${c===0?'disabled style="opacity:0.4;pointer-events:none;"':""}>
            ${C.trash} Purge Old
          </button>`}

          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${c===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${c===0?"No records to export":"Download records as CSV"}">
            ${C.download} Export CSV
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
              ${l.map(M=>{let I=typeof M.data=="string"?JSON.parse(M.data):M.data,R=Object.fromEntries(Object.entries(I||{}).filter(([D])=>!D.startsWith("_"))),U=Object.values(R).filter(D=>typeof D=="string"&&D.length>0).slice(0,2).join(" \xB7 "),te=Object.values(R).filter(D=>D&&typeof D=="object"&&D.original_name).length,G=te>0?`<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${U?"6px":"0"};" title="${te} file${te>1?"s":""} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${te>1?'<span style="font-size: 10px;">'+te+"</span>":""}</span>`:"",O=U||(te>0?"":"\u2014"),K=Uo[M.status]||Uo.pending,ae=M.source==="web"?"Website":M.source==="mcp"?"MCP":M.source==="api"?"API":M.source||"Website";return`
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${M.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${M.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${y(M.confirmation_code||"\u2014")}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${y(O)}</span>${G}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${M.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                        ${Object.entries(Uo).map(([D,T])=>`<option value="${D}" ${M.status===D?"selected":""}>${T.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${ae}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${_s(M.created_at)}</td>
                    ${window.IS_DEMO?'<td style="width: 32px;"></td>':`<td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${M.id}" title="Delete record" style="
                        border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                        display: inline-flex; align-items: center; border-radius: var(--radius-md);
                        transition: color 0.12s, background 0.12s;
                      " onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';" onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>`}
                  </tr>
                  <tr class="vs-record-detail" data-detail-for="${M.id}" style="display: none;">
                    <td colspan="7" style="padding: 0 12px 12px 44px; background: var(--vs-bg-recessed, var(--vs-bg-ghost));">
                      <div style="
                        display: grid; grid-template-columns: auto 1fr; gap: 4px 16px;
                        font-size: 12px; padding: 12px 0;
                      ">
                        ${Object.entries(R).map(([D,T])=>{if(T&&typeof T=="object"&&T.path&&T.original_name){let H=T.size<1024?T.size+" B":T.size<1048576?Math.round(T.size/1024)+" KB":(T.size/1048576).toFixed(1)+" MB";return`
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(D.replace(/_/g," "))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="/_studio/api/router.php?_path=/agentic/actions/${encodeURIComponent(e)}/records/${M.id}/files/${encodeURIComponent(D)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${y(T.original_name)} (${H})
                                </a>
                              </div>
                            `}return`
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(D.replace(/_/g," "))}</div>
                            <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${y(String(T||"\u2014"))}</div>
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
            <span class="text-vs-text-tertiary">Page ${t} of ${p} \xB7 ${c} record${c!==1?"s":""}</span>
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-next" ${t>=p?"disabled":""} data-page="${t+1}">Next \u2192</button>
          </div>
        `:`
          <div class="text-sm text-vs-text-ghost text-center" style="padding: 8px 0;">${c} record${c!==1?"s":""}</div>
        `}
      `}
    </div>
  `;let d=null,v=()=>hs(e,1);(b=document.getElementById("action-filter-status"))==null||b.addEventListener("change",v),(h=document.getElementById("action-filter-search"))==null||h.addEventListener("input",()=>{clearTimeout(d),d=setTimeout(v,300)}),(g=document.getElementById("action-records-prev"))==null||g.addEventListener("click",M=>{let I=parseInt(M.currentTarget.dataset.page);I>=1&&hs(e,I)}),(k=document.getElementById("action-records-next"))==null||k.addEventListener("click",M=>{let I=parseInt(M.currentTarget.dataset.page);I<=p&&hs(e,I)}),s.querySelectorAll(".vs-record-toggle").forEach(M=>{M.addEventListener("click",()=>{let I=M.dataset.rid,R=s.querySelector(`.vs-record-detail[data-detail-for="${I}"]`);if(!R)return;let U=R.style.display!=="none";R.style.display=U?"none":"table-row",M.style.transform=U?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(M=>{M.addEventListener("change",async I=>{var G;if(Ht()){M.value=((G=M.querySelector("[selected]"))==null?void 0:G.value)||"pending";return}if(ns())return;let R=I.target.dataset.recordId,U=I.target.value,{ok:te}=await $.put(`/agentic/actions/${encodeURIComponent(e)}/records/${R}`,{status:U});S(te?"Status updated":"Failed to update",te?"success":"error")})}),(x=document.getElementById("btn-purge-records"))==null||x.addEventListener("click",async()=>{var te,G;if(Ht()||ns())return;let M=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],I=document.getElementById("vs-purge-overlay");I&&I.remove();let R=document.createElement("div");R.id="vs-purge-overlay",R.className="vs-modal-overlay",R.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Records</h2>
          <p class="vs-modal-desc">Remove records older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${M.map(O=>`<option value="${O.days}">${O.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(R),requestAnimationFrame(()=>R.classList.add("is-visible"));let U=()=>ge(R);he(R,U),(te=document.getElementById("vs-purge-cancel"))==null||te.addEventListener("click",U),(G=document.getElementById("vs-purge-ok"))==null||G.addEventListener("click",async()=>{var F;let O=document.getElementById("vs-purge-select"),K=parseInt(O==null?void 0:O.value),ae=((F=O==null?void 0:O.selectedOptions[0])==null?void 0:F.textContent)||"";if(U(),await new Promise(V=>setTimeout(V,200)),!await ye({title:"Confirm Purge",description:`This will permanently delete all records "${ae.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:T,data:H}=await $.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:K});T?(S(`${(H==null?void 0:H.purged)||0} record(s) purged`,"success"),hs(e,1)):S("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(M=>{M.addEventListener("click",async()=>{if(Ht()||ns())return;let I=M.dataset.rid;if(!await ye({title:"Delete Record",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:U}=await $.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${I}`);U?(S("Record deleted","success"),hs(e,t)):S("Failed to delete record","error")})}),(E=document.getElementById("btn-export-action-csv"))==null||E.addEventListener("click",async()=>{if(Ht())return;let M=document.getElementById("btn-export-action-csv"),I=M.innerHTML;M.innerHTML=`${C.loader} Exporting...`,M.disabled=!0;try{let R=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!R.ok)throw new Error("Export failed");let U=await R.blob(),te=URL.createObjectURL(U),G=document.createElement("a");G.href=te,G.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(G),G.click(),G.remove(),URL.revokeObjectURL(te),S("CSV downloaded","success")}catch{S("Failed to export CSV","error")}M.innerHTML=I,M.disabled=!1})}var Ws=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Gs=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},dt={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function La(){return setTimeout(()=>cd(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function cd(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await $.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
  `}function Sa(e){return setTimeout(()=>pd(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function pd(e){var d,v;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await $.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
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
          ${C.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${a.total===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${a.total===0?"No submissions to export":"Download submissions as CSV"}">
          ${C.download} Export CSV
        </button>
      </div>
    </div>
  `;let r=document.getElementById("form-filter-status"),l=document.getElementById("form-filter-source"),c=document.getElementById("form-filter-search"),u=null,p=()=>Dn(e,1);r==null||r.addEventListener("change",p),l==null||l.addEventListener("change",p),c==null||c.addEventListener("input",()=>{clearTimeout(u),u=setTimeout(p,300)}),(d=document.getElementById("btn-export-csv"))==null||d.addEventListener("click",async()=>{let m=document.getElementById("btn-export-csv"),f=m.innerHTML;m.innerHTML=`${C.loader} Exporting...`,m.disabled=!0;try{let b=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!b.ok)throw new Error("Export failed");let h=await b.blob(),g=URL.createObjectURL(h),k=document.createElement("a");k.href=g,k.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(k),k.click(),k.remove(),URL.revokeObjectURL(g),S("CSV downloaded","success")}catch{S("Failed to export CSV","error")}m.innerHTML=f,m.disabled=!1}),(v=document.getElementById("btn-upgrade-to-action"))==null||v.addEventListener("click",async()=>{var g,k;if(Ws()||Gs())return;let m=(i.fields||[]).length;if(!await ye({title:"Upgrade to Agent Action",description:`This will create a new agent action with${m>0?` the ${m} field${m!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let b=document.getElementById("btn-upgrade-to-action"),h=b.innerHTML;b.innerHTML=`${C.loader} Converting...`,b.disabled=!0,b.style.opacity="0.6";try{let x={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},E=[],M=0;(i.fields||[]).forEach(O=>{let K=x[O.type];if(!K){M++;return}let ae={name:O.name,label:O.label||O.name,type:K,required:O.required||!1};(K==="select"||K==="radio")&&O.options&&(ae.options=O.options),O.placeholder&&(ae.placeholder=O.placeholder),E.push(ae)}),M>0&&S(`${M} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let I=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),R=Date.now().toString(36).slice(-4),U={id:I+"-"+R,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:E,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:te,data:G}=await $.post("/agentic/actions",U);if(te&&(G!=null&&G.action))S(`"${G.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${G.action.id}`;else{let K=(((g=G==null?void 0:G.error)==null?void 0:g.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":((k=G==null?void 0:G.error)==null?void 0:k.message)||"Failed to create action";S(K,"error"),b.innerHTML=h,b.disabled=!1,b.style.opacity=""}}catch{S("Failed to convert form to action","error"),b.innerHTML=h,b.disabled=!1,b.style.opacity=""}}),await Dn(e,1)}async function Dn(e,t=1){var b,h,g;let s=document.getElementById("form-submissions");if(!s)return;let n=((b=document.getElementById("form-filter-status"))==null?void 0:b.value)||"all",o=((h=document.getElementById("form-filter-source"))==null?void 0:h.value)||"all",i=((g=document.getElementById("form-filter-search"))==null?void 0:g.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:r,data:l}=await $.get(a);if(!r||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let c=l.submissions||[],u=l.total||0,p=l.per_page||20,d=Math.ceil(u/p);if(!c.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:v}=await $.get(`/forms/${encodeURIComponent(e)}`),m=v==null?void 0:v.form,f={};m!=null&&m.fields&&m.fields.forEach(k=>{f[k.name]=k.label||k.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${c.map(k=>{let x=dt[k.status]||dt.new,E=Object.entries(k.data||{}).filter(([R])=>!R.startsWith("_")).slice(0,3).map(([R,U])=>{let te=f[R]||R,G=Array.isArray(U)?U.join(", "):String(U);return`<span class="vs-sub-field"><strong>${y(te)}:</strong> ${y(G.substring(0,80))}${G.length>80?"\u2026":""}</span>`}).join(""),M=_s(k.created_at),I=k.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${k.id}" data-form-id="${y(e)}" style="border-left-color: ${x.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${x.bg}; color: ${x.text};">${x.label}</span>
                ${I?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${y(M)}</span>
            </div>
            <div class="vs-submission-preview">
              ${E||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${k.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${k.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                ${Object.entries(dt).map(([R,U])=>`<option value="${R}" ${k.status===R?"selected":""}>${U.label}</option>`).join("")}
              </select>
              ${window.IS_DEMO?"":`<button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${k.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>`}
            </div>
          </div>
        `}).join("")}
    </div>

    ${d>1?`
      <div class="vs-pagination">
        ${t>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t-1}" data-form-id="${y(e)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${t} of ${d} \xB7 ${u} submission${u!==1?"s":""}</span>
        ${t<d?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t+1}" data-form-id="${y(e)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${u} submission${u!==1?"s":""}</span>
      </div>
    `}
  `,ud(e,t)}function ud(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;Ca(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{var i;if(Ws()){s.value=s.dataset.originalValue||((i=s.querySelector("[selected]"))==null?void 0:i.value)||"new";return}if(Gs())return;let n=s.dataset.subId,{ok:o}=await $.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){S("Status updated","success");let a=s.closest(".vs-submission-card"),r=dt[s.value];if(a&&r){a.style.borderLeftColor=r.text;let l=a.querySelector(".vs-status-pill");l&&(l.style.background=r.bg,l.style.color=r.text,l.textContent=r.label)}}else S("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{if(Ws()||Gs())return;let n=s.dataset.subId;if(!await ye({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await $.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(S("Submission deleted","success"),Dn(e,t)):S("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);Dn(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;Ca(e,o)})})}async function Ca(e,t){var p,d,v,m;(p=document.getElementById("submission-detail-overlay"))==null||p.remove();let{ok:s,data:n}=await $.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(f=>String(f.id)===String(t));if(!o){S("Submission not found","error");return}let{data:i}=await $.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,r={};if(a!=null&&a.fields&&a.fields.forEach(f=>{r[f.name]=f.label||f.name}),o.status==="new"&&!window.IS_DEMO){let{ok:f}=await $.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"});if(f){o.status="read";let b=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);b&&(b.value="read");let h=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(h){h.style.borderLeftColor=dt.read.text;let g=h.querySelector(".vs-status-pill");g&&(g.style.background=dt.read.bg,g.style.color=dt.read.text,g.textContent="Read")}}}let l=dt[o.status]||dt.new,c=document.createElement("div");c.id="submission-detail-overlay",c.className="vs-slide-overlay",c.innerHTML=`
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
          ${Object.entries(o.data||{}).filter(([f])=>!f.startsWith("_")).map(([f,b])=>{let h=r[f]||f,g=Array.isArray(b)?b.join(", "):String(b);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${y(h)}</div>
                <div class="vs-sub-detail-field-value">${y(g)}</div>
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
          ${Object.entries(dt).map(([f,b])=>`<option value="${f}" ${o.status===f?"selected":""}>${b.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(c),requestAnimationFrame(()=>{requestAnimationFrame(()=>c.classList.add("is-visible"))});let u=()=>{c.classList.remove("is-visible"),setTimeout(()=>c.remove(),200)};he(c,u),(d=document.getElementById("close-sub-detail"))==null||d.addEventListener("click",u),(v=document.getElementById("btn-save-sub-notes"))==null||v.addEventListener("click",async()=>{var h;if(Ws()||Gs())return;let f=((h=document.getElementById("sub-detail-notes"))==null?void 0:h.value)||"",{ok:b}=await $.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:f});S(b?"Notes saved":"Failed to save notes",b?"success":"error")}),(m=document.getElementById("sub-detail-status"))==null||m.addEventListener("change",async f=>{if(Ws()){f.target.value=o.status;return}if(Gs())return;let b=f.target.value,{ok:h}=await $.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:b});if(h){S("Status updated","success");let g=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);g&&(g.value=b);let k=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),x=dt[b];if(k&&x){k.style.borderLeftColor=x.text;let E=k.querySelector(".vs-status-pill");E&&(E.style.background=x.bg,E.style.color=x.text,E.textContent=x.label)}}else S("Failed to update status","error")})}var Vo=!1;function Ba(){return Vo=!1,setTimeout(()=>{md(),Go()},0),`
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 style="font-size: 20px; font-weight: 650; color: var(--vs-text-primary); letter-spacing: -0.025em; margin: 0;">Team</h1>
          <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 4px 0 0;">Manage who has access to this Studio.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-show-roles" class="vs-btn vs-btn-ghost vs-btn-sm" title="View role permissions">
            ${C.shield} Roles
          </button>
          <button id="btn-add-member" class="vs-btn vs-btn-primary vs-btn-sm">
            ${C.userPlus||C.plus} Add Member
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
  `}function Ia(){return`
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
                ${C.rotateCcw}
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
                ${C.rotateCcw}
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
            ${[["Use AI chat",!0,!0,!1],["Edit pages & code",!0,!0,!1],["Use notes",!0,!0,!1],["View board",!0,!0,!0],["Edit board",!0,!0,!1],["Manage assets",!0,!0,!1],["Publish changes",!0,!0,!1],["View form submissions",!0,!0,!0],["Preview the site",!0,!0,!0],["Manage designs",!0,!0,!1],["Change settings",!0,!1,!1],["Manage team members",!0,!1,!1]].map(([e,t,s,n])=>`
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
  `}function vd(e){let t=_.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",r=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${C.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${y(e.name)}" title="Reset password">
        ${C.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${y(e.name)}" title="Remove">
        ${C.trash}
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
  `}async function Go(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await $.get("/team");if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${(n==null?void 0:n.message)||"Failed to load team members."}</div>`;return}let o=(s==null?void 0:s.members)||[];o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>vd(i)).join("")}function md(){var t,s,n,o,i,a,r,l,c;if(Vo)return;Vo=!0,(t=document.getElementById("btn-add-member"))==null||t.addEventListener("click",()=>{Ma()}),(s=document.getElementById("btn-show-roles"))==null||s.addEventListener("click",Ta);let e=document.getElementById("team-list");e&&e.addEventListener("click",async u=>{let p=u.target;if(p.closest("[data-role-info]")){Ta();return}let v=p.closest(".team-edit-btn");if(v){let b=v.dataset.id,{ok:h,data:g}=await $.get("/team");if(h){let k=g.members.find(x=>x.id==b);k&&Ma(k)}return}let m=p.closest(".team-delete-btn");if(m){let b=m.dataset.id,h=m.dataset.name;if(!await ye({title:"Remove Team Member",description:`Remove ${h} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let{ok:k,error:x}=await $.delete(`/team/${b}`);k?(S(`${h} has been removed.`,"success"),await Go()):S((x==null?void 0:x.message)||"Failed to remove member.","error");return}let f=p.closest(".team-pw-btn");if(f){let b=f.dataset.id,h=f.dataset.name;hd(b,h);return}}),[["[data-team-modal-overlay]",Hn],["[data-team-pw-overlay]",jn],["[data-team-roles-overlay]",Wo]].forEach(([u,p])=>{let d=document.querySelector(u);if(!d)return;let v=null;d.addEventListener("mousedown",m=>{v=m.target}),d.addEventListener("click",m=>{m.target===d&&v===d&&p()})}),(n=document.getElementById("btn-team-cancel"))==null||n.addEventListener("click",Hn),(o=document.getElementById("btn-pw-cancel"))==null||o.addEventListener("click",jn),(i=document.getElementById("btn-roles-close"))==null||i.addEventListener("click",Wo),(a=document.getElementById("btn-generate-password"))==null||a.addEventListener("click",()=>{let u=document.getElementById("team-member-password");u&&(u.value=As())}),(r=document.getElementById("btn-pw-generate"))==null||r.addEventListener("click",()=>{let u=document.getElementById("team-new-password");u&&(u.value=As())}),(l=document.getElementById("btn-team-save"))==null||l.addEventListener("click",fd),(c=document.getElementById("btn-pw-save"))==null||c.addEventListener("click",bd),document.addEventListener("keydown",gd)}function gd(e){if(e.key!=="Escape")return;let t=document.getElementById("team-modal"),s=document.getElementById("team-pw-modal"),n=document.getElementById("team-roles-modal");n&&!n.classList.contains("hidden")?(Wo(),e.stopPropagation()):s&&!s.classList.contains("hidden")?(jn(),e.stopPropagation()):t&&!t.classList.contains("hidden")&&(Hn(),e.stopPropagation())}function Ta(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden")}function Wo(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden")}function Ma(e=null){let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");t&&(document.getElementById("team-member-name").value=(e==null?void 0:e.name)||"",document.getElementById("team-member-email").value=(e==null?void 0:e.email)||"",document.getElementById("team-member-role").value=(e==null?void 0:e.role)||"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=As()),t.classList.remove("hidden"))}function Hn(){var e;(e=document.getElementById("team-modal"))==null||e.classList.add("hidden")}function hd(e,t){let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");s&&(document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=As(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",s.classList.remove("hidden"))}function jn(){var e;(e=document.getElementById("team-pw-modal"))==null||e.classList.add("hidden")}async function fd(){var l,c,u,p,d,v,m,f;let e=(l=document.getElementById("team-edit-id"))==null?void 0:l.value,t=(u=(c=document.getElementById("team-member-name"))==null?void 0:c.value)==null?void 0:u.trim(),s=(d=(p=document.getElementById("team-member-email"))==null?void 0:p.value)==null?void 0:d.trim(),n=(v=document.getElementById("team-member-role"))==null?void 0:v.value,o=(m=document.getElementById("team-member-password"))==null?void 0:m.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026";let r;e?r=await $.put(`/team/${e}`,{name:t,email:s,role:n}):r=await $.post("/team",{name:t,email:s,role:n,password:o}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",r.ok?(Hn(),S(e?"Member updated.":`${t} has been added to the team.`,"success"),await Go()):(i.textContent=((f=r.error)==null?void 0:f.message)||"Something went wrong.",i.classList.remove("hidden"))}async function bd(){var a,r;let e=(a=document.getElementById("team-pw-user-id"))==null?void 0:a.value,t=(r=document.getElementById("team-new-password"))==null?void 0:r.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026";let{ok:o,error:i}=await $.post(`/team/${e}/password`,{password:t});n.disabled=!1,n.textContent="Reset Password",o?(jn(),S("Password has been reset.","success")):(s.textContent=(i==null?void 0:i.message)||"Failed to reset password.",s.classList.remove("hidden"))}var yd=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},xd=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1};function Aa(){return setTimeout(()=>Ks(),0),`
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
        <div class="vs-dropzone-icon">${C.upload}</div>
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
  `}async function Ks(e="all"){var h;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await _a(n.files),n.value="",Ks(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=g=>{g.target.closest("button")||n==null||n.click()},o.ondragover=g=>{g.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async g=>{g.preventDefault(),o.classList.remove("is-dragover"),g.dataTransfer.files.length>0&&(await _a(g.dataTransfer.files),Ks(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(g=>{g.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(k=>{k.className="vs-device-btn"}),g.className="vs-device-btn vs-device-btn-active",Ks(g.dataset.filter)}});let a=e==="code",r=!a&&e!=="all"?`?category=${e}`:"",{ok:l,data:c}=await $.get(`/assets${r}`);if(!l||!((h=c==null?void 0:c.assets)!=null&&h.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let g=document.getElementById("btn-empty-upload"),k=document.getElementById("btn-upload-asset");g&&k&&g.addEventListener("click",()=>k.click());return}let u=c.assets;if(a&&(u=u.filter(g=>g.category==="css"||g.category==="js"),u.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${C.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let p=["jpg","jpeg","png","gif","webp","svg","ico"],d=u.filter(g=>g.category==="images"&&p.includes(g.extension)),v=u.filter(g=>!p.includes(g.extension)||g.category!=="images");function m(g,k){return g==="css"?C.fileCode:g==="js"?C.fileCode:g==="json"?C.fileJson:g==="pdf"?C.filePdf:["woff2","woff","ttf","otf"].includes(g)?C.type:["mp4","webm"].includes(g)?C.film:["mp3","wav","ogg"].includes(g)?C.music:["txt","md","csv"].includes(g)?C.fileText:["doc","docx","xls","xlsx"].includes(g)?C.fileText:k==="images"?C.image:C.fileText}let f=["css","js","json","svg"],b="";d.length>0&&(b+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',d.forEach((g,k)=>{var I;let x=bo(g.size),E=g.width?`${g.width}\xD7${g.height}`:"",M=g.extension==="svg";b+=`
        <div class="vs-asset-card" data-lightbox-idx="${k}">
          <div class="vs-asset-card-thumb${M?" is-svg":""}" style="cursor:pointer">
            <img src="${g.thumbnail||g.path}" alt="${y(((I=g.meta)==null?void 0:I.alt)||g.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${y(g.filename)}">${y(g.filename)}</p>
            <p class="vs-asset-card-meta">${E?E+" \xB7 ":""}${x}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${C.copy}</button>
            <button data-delete-asset="${g.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${C.x}</button>
          </div>
        </div>
      `}),b+="</div>"),v.length>0&&v.forEach(g=>{let k=bo(g.size),x=f.includes(g.extension);b+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${m(g.extension,g.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${y(g.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${g.category} \xB7 ${k}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${x?`
              <button data-edit-asset="${g.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${C.pencil}</button>
            `:""}
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-action-btn">${C.copy}</button>
            ${g.category!=="css"&&g.category!=="js"?`
              <button data-delete-asset="${g.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${C.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=b,t.querySelectorAll("[data-lightbox-idx]").forEach(g=>{let k=g.querySelector(".vs-asset-card-thumb");k&&k.addEventListener("click",()=>{let x=parseInt(g.dataset.lightboxIdx,10);wd(d,x,e)})}),t.querySelectorAll("[data-copy-path]").forEach(g=>{g.addEventListener("click",()=>{navigator.clipboard.writeText(g.dataset.copyPath).then(()=>{let k=g.innerHTML;g.innerHTML="\u2713",g.classList.add("vs-asset-action-copied"),setTimeout(()=>{g.innerHTML=k,g.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(g=>{g.addEventListener("click",()=>{let x=g.dataset.editAsset.replace(/^\//,"");js(x)})}),t.querySelectorAll("[data-delete-asset]").forEach(g=>{g.addEventListener("click",async()=>{if(!await ye({title:"Delete Asset",description:`Delete ${g.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:x}=await $.delete("/assets",{path:g.dataset.deleteAsset});x?(S("Asset deleted.","success"),Ks(e)):S("Could not delete asset.","error")})})}function wd(e,t,s){let n=t;function o(d){if(d===0)return"0 B";let v=1024,m=["B","KB","MB","GB"],f=Math.floor(Math.log(d)/Math.log(v));return parseFloat((d/Math.pow(v,f)).toFixed(1))+" "+m[f]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var h,g;let d=e[n],v=d.width?`${d.width}\xD7${d.height}`:"",m=o(d.size),f=[v,m,(h=d.extension)==null?void 0:h.toUpperCase()].filter(Boolean),b=e.length>1;return`
      ${b?`
        <button class="vs-lightbox-nav vs-lightbox-nav--prev" id="lightbox-prev" title="Previous (\u2190)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="vs-lightbox-nav vs-lightbox-nav--next" id="lightbox-next" title="Next (\u2192)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `:""}

      <div class="vs-lightbox-stage">
        <div class="vs-lightbox-center">
          <div class="vs-lightbox-image-wrap${["svg","png"].includes(d.extension)?" is-transparent":""}">
            <img src="${d.path}" alt="${y(((g=d.meta)==null?void 0:g.alt)||d.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${y(d.filename)}</span>
            <span class="vs-lightbox-details">${f.join(" \xB7 ")}${b?` \xB7 ${n+1} / ${e.length}`:""}</span>
          </div>

          <div class="vs-lightbox-actions">
            <button class="vs-lightbox-btn" id="lightbox-copy" title="Copy web path">
              ${C.copy}<span>Copy path</span>
            </button>
          </div>
        </div>
      </div>

      <button class="vs-lightbox-close" id="lightbox-close" title="Close (Esc)">
        ${C.x}
      </button>
    `}let r=document.createElement("div");r.id="vs-lightbox",r.className="vs-lightbox",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Image preview"),r.innerHTML=a(),document.body.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add("is-visible"))});function l(){r.classList.remove("is-visible"),setTimeout(()=>r.remove(),400),document.removeEventListener("keydown",u)}function c(d){n=d,r.innerHTML=a(),p()}function u(d){if(d.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;l(),d.preventDefault()}d.key==="ArrowRight"&&e.length>1&&(c((n+1)%e.length),d.preventDefault()),d.key==="ArrowLeft"&&e.length>1&&(c((n-1+e.length)%e.length),d.preventDefault())}function p(){var m,f,b;(m=r.querySelector("#lightbox-close"))==null||m.addEventListener("click",h=>{h.stopPropagation(),l()});let d=null;r.addEventListener("mousedown",h=>{d=h.target}),r.addEventListener("click",h=>{var x;let g=h.target===r||h.target.classList.contains("vs-lightbox-stage"),k=d===r||((x=d==null?void 0:d.classList)==null?void 0:x.contains("vs-lightbox-stage"));g&&k&&l()}),(f=r.querySelector("#lightbox-prev"))==null||f.addEventListener("click",h=>{h.stopPropagation(),c((n-1+e.length)%e.length)}),(b=r.querySelector("#lightbox-next"))==null||b.addEventListener("click",h=>{h.stopPropagation(),c((n+1)%e.length)});let v=r.querySelector("#lightbox-copy");v==null||v.addEventListener("click",h=>{h.stopPropagation();let g=e[n];navigator.clipboard.writeText(g.path).then(()=>{let k=v.innerHTML;v.innerHTML=`${C.check}<span>Copied!</span>`,v.style.borderColor="var(--vs-success)",v.style.color="var(--vs-success)",setTimeout(()=>{v.innerHTML=k,v.style.borderColor="",v.style.color=""},2e3),S("Path copied!","success")})})}document.addEventListener("keydown",u),p()}async function _a(e){var i,a,r;if(yd()||xd())return;let t=window.__vsSetGlobalStatus;t&&t("saving",`Uploading ${e.length} file(s)\u2026`);let s=new FormData;for(let l of e)s.append("file[]",l);let n=_.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let c=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();if(c.ok){let u=((a=(i=c.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0;S(`${u} file(s) uploaded.`,"success"),t&&t("saved",`\u2713 ${u} file(s) uploaded`)}else{let u=((r=c.error)==null?void 0:r.message)||"Upload failed";S(u,"error"),t&&t("error","\u2717 "+u)}}catch{S("Upload failed.","error"),t&&t("error","\u2717 Upload failed")}}var Xs="vs-newdesign-save-pref",Ys="gallery";function Da(){return setTimeout(()=>kd(),0),`
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
        <button class="vs-tab ${Ys==="gallery"?"vs-tab-active":""}" data-tab="gallery">
          ${C.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${Ys==="history"?"vs-tab-active":""}" data-tab="history">
          ${C.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading\u2026</div>
      </div>
    </div>
  `}function kd(){var e,t;document.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",()=>{Ys=s.dataset.tab,document.querySelectorAll(".vs-tab").forEach(n=>n.classList.remove("vs-tab-active")),s.classList.add("vs-tab-active"),Pa()})}),(e=document.getElementById("btn-save-design"))==null||e.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||Js()}),(t=document.getElementById("btn-new-design"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||Ko()}),Pa()}function Pa(){Ys==="gallery"?On():Nn()}async function On(){var i,a;let e=document.getElementById("designs-content");if(!e)return;let{ok:t,data:s}=await $.get("/designs");if(!t||!((i=s==null?void 0:s.designs)!=null&&i.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <p class="vs-empty-state-title">No saved designs</p>
          <p class="vs-empty-state-desc">Save your current design and try different looks. Switch back anytime.</p>
          <button id="btn-empty-save" class="vs-btn vs-btn-primary vs-btn-sm">${C.save} Save Current Design</button>
        </div>
      </div>
    `,(a=document.getElementById("btn-empty-save"))==null||a.addEventListener("click",()=>{var r;(r=window.demoGuard)!=null&&r.call(window)||Js()});return}let n=s.active_id,o=s.designs;e.innerHTML=`
    <div class="vs-design-grid">
      ${o.map(r=>$d(r,r.id===n)).join("")}
    </div>
  `,Cd(e),Ed(e)}function Ed(e){e.querySelectorAll(".vs-design-card-preview").forEach(t=>{let s=t.querySelector("iframe");s&&requestAnimationFrame(()=>{let n=t.offsetWidth;if(n>0){let o=n/1440;s.style.transform=`scale(${o})`}})})}function $d(e,t){let s=y(e.name||"Untitled"),n=e.description?y(e.description):"",o=e.initial_prompt?y(e.initial_prompt):"",i=n||(o.length>100?o.substring(0,100)+"\u2026":o),a=y(e.site_name||""),r=e.page_count||0,l=e.created_at?Is(e.created_at):"",c=e._corrupted,u=a&&a!==s?`${a} \xB7 ${r} ${r===1?"page":"pages"}`:`${r} ${r===1?"page":"pages"}`,p=`/_studio/api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(e.id)}%2Fpreview&path=index.php`,d=`${p}&embed=1`;return`
    <div class="vs-design-card${t?" vs-design-card-active":""}${c?" vs-design-card-corrupted":""}"
         data-design-id="${ue(e.id)}">
      <div class="vs-design-card-preview">
        ${c?'<div class="vs-design-card-empty">Preview unavailable</div>':`
          <iframe src="${d}" tabindex="-1" loading="lazy"
                  sandbox="allow-same-origin"
                  title="Preview of ${ue(e.name||"design")}"></iframe>
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
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-load-id="${ue(e.id)}" ${c?"disabled":""}>
            ${C.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${p}" target="_blank" rel="noopener" title="Browse this design">
          ${C.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${ue(e.id)}"
                data-edit-name="${ue(e.name||"")}"
                data-edit-desc="${ue(e.description||"")}">
          ${C.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${ue(e.id)}" style="color: var(--vs-text-ghost);">
          ${C.trash2}
        </button>
      </div>
    </div>
  `}function Cd(e){e.querySelectorAll("[data-load-id]").forEach(t=>{t.addEventListener("click",async()=>{var c,u,p,d;if((c=window.demoGuard)!=null&&c.call(window)||(u=window.viewerGuard)!=null&&u.call(window))return;let s=t.dataset.loadId,n=t.closest(".vs-design-card"),o=((p=n==null?void 0:n.querySelector("h3"))==null?void 0:p.textContent)||"this design",i=await Td(o);if(!i)return;if(t.innerHTML=`${C.rotateCcw} Loading\u2026`,t.disabled=!0,i.saveDesign){let v=_.get("siteName")||"Untitled",m=await $.post("/designs",{name:`${v}`,description:"Saved before switching designs"});if(!m.ok){S(((d=m.error)==null?void 0:d.message)||"Failed to save design.","error"),t.innerHTML=`${C.rotateCcw} Load`,t.disabled=!1;return}}let{ok:a,data:r,error:l}=await $.post(`/designs/${s}/load`,{skip_auto_save:!0});a?(S("Design loaded.","success"),await Ha(),window.location.hash="#/chat"):(S((l==null?void 0:l.message)||"Failed to load design.","error"),t.innerHTML=`${C.rotateCcw} Load`,t.disabled=!1)})}),e.querySelectorAll("[data-edit-id]").forEach(t=>{t.addEventListener("click",()=>{var i,a;if((i=window.demoGuard)!=null&&i.call(window)||(a=window.viewerGuard)!=null&&a.call(window))return;let s=t.dataset.editId,n=t.dataset.editName,o=t.dataset.editDesc;Sd(s,n,o)})}),e.querySelectorAll("[data-delete-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteId;if(!await ye({title:"Delete Design",description:"This design will be removed permanently. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await $.delete(`/designs/${s}`);o?(S("Design deleted.","success"),On()):(S((i==null?void 0:i.message)||"Failed to delete design.","error"),t.innerHTML=`${C.trash2}`,t.disabled=!1)})})}async function Nn(){var i,a,r;let e=document.getElementById("designs-content");if(!e)return;e.innerHTML=`
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">
        ${C.camera} Create Snapshot
      </button>
    </div>
    <div id="snapshots-list">
      <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots\u2026</div>
    </div>
  `,(i=document.getElementById("btn-create-snapshot"))==null||i.addEventListener("click",()=>{var l,c;(l=window.demoGuard)!=null&&l.call(window)||(c=window.viewerGuard)!=null&&c.call(window)||Ra()});let t=document.getElementById("snapshots-list");if(!t)return;let{ok:s,data:n}=await $.get("/snapshots");if(!s||!((a=n==null?void 0:n.snapshots)!=null&&a.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">${C.camera} Create Snapshot</button>
        </div>
      </div>
    `,(r=document.getElementById("btn-empty-create-snapshot"))==null||r.addEventListener("click",()=>{var l;(l=window.demoGuard)!=null&&l.call(window)||Ra()});return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((l,c)=>{let u=Is(l.created_at),p=new Date(l.created_at).toLocaleString(),d=l.size_bytes?(l.size_bytes/1024).toFixed(0)+" KB":"\u2014",v=c===o.length-1,m,f,b;l.snapshot_type==="pre_publish"?(m="var(--vs-success)",f="vs-snap-badge-green",b="Pre-publish"):l.snapshot_type==="manual"?(m="var(--vs-accent)",f="vs-snap-badge-amber",b="Manual"):(m="var(--vs-text-ghost)",f="vs-snap-badge-gray",b="Auto");let h=l.description?`<p class="vs-timeline-desc">${y(l.description)}</p>`:"";return`
          <div class="vs-timeline-item${v?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${m}; box-shadow: 0 0 0 3px color-mix(in srgb, ${m} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${f}">${b}</span>
                  <span class="vs-timeline-label">${y(l.label||"Snapshot #"+l.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${p}">${u}</span>
              </div>
              ${h}
              <div class="vs-timeline-meta">${l.file_count} files \xB7 ${d}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${l.id}" data-snap='${JSON.stringify({label:l.label,description:l.description,type:l.snapshot_type,files:l.file_count,size:d,date:p}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${C.eye} Preview
                </button>
                <button data-restore-id="${l.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${C.rotateCcw} Restore
                </button>
                <button data-delete-snap-id="${l.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${C.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,Ld(t)}function Ld(e){e.querySelectorAll("[data-preview-id]").forEach(t=>{t.addEventListener("click",()=>{let s=JSON.parse(t.dataset.snap);Bd(s)})}),e.querySelectorAll("[data-restore-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.restoreId;if(!await ye({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;t.innerHTML=`${C.rotateCcw} Restoring\u2026`,t.disabled=!0;let{ok:o,error:i}=await $.post(`/snapshots/${s}/restore`);o?(S("Snapshot restored.","success"),Nn()):(S((i==null?void 0:i.message)||"Failed to restore snapshot.","error"),t.innerHTML=`${C.rotateCcw} Restore`,t.disabled=!1)})}),e.querySelectorAll("[data-delete-snap-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteSnapId;if(!await ye({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await $.delete(`/snapshots/${s}`);o?(S("Snapshot deleted.","success"),Nn()):(S((i==null?void 0:i.message)||"Failed to delete snapshot.","error"),t.innerHTML=`${C.trash2}`,t.disabled=!1)})})}function Js(){var u;let e=document.getElementById("vs-design-save-overlay");e&&e.remove();let t=_.get("siteName")||"",s=document.createElement("div");s.id="vs-design-save-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${C.save} Save Design</h2>
        <p class="vs-modal-desc">Save a snapshot of your current design to the library. Find and restore saved designs in the Designs tab.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="design-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${ue(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="design-desc" type="text" class="vs-input w-full" placeholder="e.g. Warm wood tones with dark greens">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="design-save-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="design-save-confirm" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${C.save} Save Design</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>ge(s),o=p=>{p.key==="Escape"&&(p.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),he(s,n),(u=document.getElementById("design-save-cancel"))==null||u.addEventListener("click",n);let a=document.getElementById("design-name"),r=document.getElementById("design-desc"),l=document.getElementById("design-save-confirm"),c=p=>{p.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",c),r==null||r.addEventListener("keydown",c),a==null||a.select(),l==null||l.addEventListener("click",async()=>{var f,b;let p=((f=a==null?void 0:a.value)==null?void 0:f.trim())||"",d=((b=r==null?void 0:r.value)==null?void 0:b.trim())||"";if(!p){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:v,error:m}=await $.post("/designs",{name:p,description:d});n(),v?(S("Design saved.","success"),Ys="gallery",document.getElementById("designs-content")&&(document.querySelectorAll(".vs-tab").forEach(g=>{g.classList.toggle("vs-tab-active",g.dataset.tab==="gallery")}),On())):S((m==null?void 0:m.message)||"Failed to save design.","error")})}function Sd(e,t,s){var u;let n=document.getElementById("vs-design-edit-overlay");n&&n.remove();let o=document.createElement("div");o.id="vs-design-edit-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${C.pencil} Edit Design</h2>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="edit-design-name" type="text" class="vs-input w-full" value="${ue(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="edit-design-desc" type="text" class="vs-input w-full" value="${ue(s)}">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="edit-design-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="edit-design-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Save</button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>ge(o);he(o,i),(u=document.getElementById("edit-design-cancel"))==null||u.addEventListener("click",i);let a=document.getElementById("edit-design-name"),r=document.getElementById("edit-design-desc"),l=document.getElementById("edit-design-save");a==null||a.select();let c=p=>{p.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",c),r==null||r.addEventListener("keydown",c),l==null||l.addEventListener("click",async()=>{var f,b;let p=((f=a==null?void 0:a.value)==null?void 0:f.trim())||"",d=((b=r==null?void 0:r.value)==null?void 0:b.trim())||"";if(!p){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:v,error:m}=await $.put(`/designs/${e}`,{name:p,description:d});i(),v?(S("Design updated.","success"),On()):S((m==null?void 0:m.message)||"Failed to update design.","error")})}function Td(e){return new Promise(t=>{var c,u;let s=document.getElementById("vs-switch-design-overlay");s&&s.remove();let n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=localStorage.getItem(Xs),i=document.createElement("div");i.id="vs-switch-design-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=p=>{p.key==="Escape"&&(p.preventDefault(),r(null))},r=p=>{document.removeEventListener("keydown",a),ge(i),t(p)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let l=document.getElementById("vs-switch-save-cb");he(i,()=>r(null)),(c=document.getElementById("vs-switch-cancel"))==null||c.addEventListener("click",()=>r(null)),(u=document.getElementById("vs-switch-ok"))==null||u.addEventListener("click",()=>{let p=l?l.checked:!1;localStorage.setItem(Xs,p?"true":"false"),r({saveDesign:p})}),document.addEventListener("keydown",a),setTimeout(()=>{var p;return(p=document.getElementById("vs-switch-ok"))==null?void 0:p.focus()},220)})}async function Ko(){var n;let e=await Md();if(!e)return;if(e.saveDesign&&e.designName){let o=await $.post("/designs",{name:e.designName,description:""});if(!o.ok){S(((n=o.error)==null?void 0:n.message)||"Failed to save design.","error");return}S("Design saved.","success")}let{ok:t,error:s}=await $.post("/designs/new",{skip_auto_save:!0});if(t){S("Workspace cleared. Start building.","success"),await Ha(),_.set("messages",[]),_.set("activeConversationId",null),_.set("conversations",[]);try{localStorage.removeItem("vs-active-conversation")}catch{}window.location.hash!=="#/chat"?Ge.navigate("chat"):Ge.refresh()}else S((s==null?void 0:s.message)||"Failed to start new design.","error")}function Md(){return new Promise(e=>{var p,d;let t=document.getElementById("vs-new-design-overlay");t&&t.remove();let s=_.get("siteName")||"",n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=document.createElement("div");o.id="vs-new-design-overlay",o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Start New Design</h2>
          <p class="vs-modal-desc">This will clear your workspace for a fresh start.</p>
          <label class="vs-modal-option" for="vs-newdesign-save-cb">
            <input type="checkbox" id="vs-newdesign-save-cb" ${localStorage.getItem(Xs)!=="false"?"checked":""}>
            <span class="vs-modal-option-check">${n}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-body" id="vs-newdesign-name-row" style="${localStorage.getItem(Xs)==="false"?"display:none":""}">
          <label class="vs-input-label">Name</label>
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${ue(s)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;let i=v=>{v.key==="Escape"&&(v.preventDefault(),a(null))},a=v=>{document.removeEventListener("keydown",i),ge(o),e(v)};document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let r=document.getElementById("vs-newdesign-save-cb"),l=document.getElementById("vs-newdesign-name-row"),c=document.getElementById("vs-newdesign-name"),u=()=>{r.checked?(l.style.display="",setTimeout(()=>c==null?void 0:c.focus(),80)):l.style.display="none"};r==null||r.addEventListener("change",u),c==null||c.addEventListener("keydown",v=>{var m;v.key==="Enter"&&(v.preventDefault(),(m=document.getElementById("vs-newdesign-ok"))==null||m.click())}),he(o,()=>a(null)),(p=document.getElementById("vs-newdesign-cancel"))==null||p.addEventListener("click",()=>a(null)),(d=document.getElementById("vs-newdesign-ok"))==null||d.addEventListener("click",()=>{var f;let v=r?r.checked:!1,m=((f=c==null?void 0:c.value)==null?void 0:f.trim())||"";if(v&&!m){c==null||c.focus();return}localStorage.setItem(Xs,v?"true":"false"),a({saveDesign:v,designName:m})}),document.addEventListener("keydown",i),setTimeout(()=>{var v;r!=null&&r.checked&&c?c.select():(v=document.getElementById("vs-newdesign-ok"))==null||v.focus()},220)})}function Ra(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${C.camera} Create Snapshot</h2>
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
        <button id="snap-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${C.camera} Create Snapshot</button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>ge(t);he(t,s),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var c;let a=((c=n==null?void 0:n.value)==null?void 0:c.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:r,error:l}=await $.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),r?(S("Snapshot created.","success"),Nn()):S((l==null?void 0:l.message)||"Failed to create snapshot.","error")})}function Bd(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${C.eye} Snapshot Details</h2>
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),he(s,()=>ge(s)),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>ge(s))}async function Ha(){var e,t;try{let s=await $.get("/pages");s.ok&&Array.isArray((e=s.data)==null?void 0:e.pages)&&_.set("pages",s.data.pages);let n=await $.get("/auth/session");n.ok&&((t=n.data)!=null&&t.site_name)&&(_.set("siteName",n.data.site_name),document.title=`Studio \u2014 ${n.data.site_name}`);let o=document.getElementById("preview-iframe");o&&(o.src=o.src)}catch(s){console.warn("[designs] Post-switch refresh failed:",s)}}var tn=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},sn=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Te=[],Se=null,ot=null,fs=null,mt="",jt=!1,Zs="",Yo="idle",Qs="list",qn=!1,Oa=800,Id=200;var qa="vs-notes-list-width",ja=80;function _d(){window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("notes",os)}async function os(){ot&&(clearTimeout(ot),ot=null,await Zo())}function Ad(e){if(!e)return"";let t=y(e);return t=t.replace(/```(\w*)\n([\s\S]*?)```/g,(s,n,o)=>`<pre class="vs-note-code-block"><code>${o}</code></pre>`),t=t.replace(/`([^`]+)`/g,'<code class="vs-note-inline-code">$1</code>'),t=t.replace(/^### (.+)$/gm,'<h3 class="vs-note-h3">$1</h3>'),t=t.replace(/^## (.+)$/gm,'<h2 class="vs-note-h2">$1</h2>'),t=t.replace(/^# (.+)$/gm,'<h1 class="vs-note-h1">$1</h1>'),t=t.replace(/^&gt; (.+)$/gm,'<blockquote class="vs-note-blockquote">$1</blockquote>'),t=t.replace(/^---$/gm,'<hr class="vs-note-hr" />'),t=t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*(.+?)\*/g,"<em>$1</em>"),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" class="vs-note-link">$1</a>'),t=t.replace(/^- (.+)$/gm,'<li class="vs-note-li">$1</li>'),t=t.replace(/(<li class="vs-note-li">.*<\/li>\n?)+/g,'<ul class="vs-note-ul">$&</ul>'),t=t.replace(/^\d+\. (.+)$/gm,'<li class="vs-note-li-ol">$1</li>'),t=t.replace(/(<li class="vs-note-li-ol">.*<\/li>\n?)+/g,'<ol class="vs-note-ol">$&</ol>'),t=t.replace(/\n\n/g,'</p><p class="vs-note-p">'),t='<p class="vs-note-p">'+t+"</p>",t=t.replace(/<p class="vs-note-p">(<(?:h[1-3]|pre|blockquote|hr|ul|ol)[^>]*>)/g,"$1"),t=t.replace(/(<\/(?:h[1-3]|pre|blockquote|ul|ol)>)<\/p>/g,"$1"),t=t.replace(/<p class="vs-note-p"><\/p>/g,""),t}function Jo(){return`
    <div class="vs-empty-state" style="border: none; background: transparent; min-height: auto; height: 100%;">
      <div class="vs-empty-state-inner" style="max-width: 280px;">
        <div class="vs-empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <p class="vs-empty-state-title">Select a note</p>
        <p class="vs-empty-state-desc">Choose a note from the list or create a new one to start writing.</p>
      </div>
    </div>
  `}function Fa(){_d(),qn=!1,setTimeout(()=>Pd(),0);let e=parseInt(localStorage.getItem(qa)||"320",10);return`
    <div id="vs-notes-root" class="vs-notes">
      <!-- Empty state (shown if no notes exist) -->
      <div id="vs-notes-empty" class="vs-notes-empty" style="display: none;">
        <div class="vs-empty-state" style="border: none; background: transparent; min-height: auto;">
          <div class="vs-empty-state-inner" style="max-width: 280px;">
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
            ${Jo()}
          </div>
        </div>
      </div>

      <!-- Mobile: Detail View (overlays list) -->
      <div id="vs-notes-mobile-detail" class="vs-notes-mobile-detail" style="display: none;"></div>
    </div>
  `}async function Pd(){qn||(qn=!0,await za(),jd())}async function za(){let e;if(mt?e=await $.get(`/notes/search?q=${encodeURIComponent(mt)}`):e=await $.get("/notes"),!e.ok){S("Could not load notes.","error");return}if(Te=e.data.notes||[],St(),Fn(),Se){let t=Te.find(s=>s.id===Se);t?window.matchMedia("(max-width: 767px)").matches?(Qs="detail",Wa(t)):Va(t,{restoring:!0}):Se=null}}function Fn(){let e=document.getElementById("vs-notes-empty"),t=document.getElementById("vs-notes-split");if(!e||!t)return;let s=window.matchMedia("(max-width: 767px)").matches;Te.length===0&&!mt?(e.style.display="flex",t.style.display="none"):(e.style.display="none",t.style.display=s?"block":"flex")}function St(){let e=document.getElementById("vs-notes-list");if(!e)return;if(Te.length===0){mt?e.innerHTML=`
        <div class="vs-notes-no-results">No notes matching "${y(mt)}"</div>
      `:e.innerHTML="";return}let t=Te.filter(o=>o.pinned==1),s=Te.filter(o=>o.pinned!=1),n="";t.length>0&&!mt&&(n+='<div class="vs-notes-section-label">Pinned</div>',n+=t.map(o=>Na(o)).join(""),s.length>0&&(n+='<div class="vs-notes-section-label vs-notes-section-label--rest">Notes</div>')),n+=s.map(o=>Na(o)).join(""),e.innerHTML=n,e.querySelectorAll("[data-note-id]").forEach(o=>{o.addEventListener("click",()=>{let i=parseInt(o.dataset.noteId,10);zn(i)}),o.addEventListener("contextmenu",i=>{i.preventDefault(),Hd(i,parseInt(o.dataset.noteId,10))})})}function Na(e){let t=e.id===Se,s=e.pinned==1,n=e.title||"Untitled",o=Rd(e.body),i=Is(e.updated_at);return`
    <div class="vs-note-item ${t?"vs-note-item--active":""}"
         data-note-id="${e.id}" tabindex="0" role="button">
      <div class="vs-note-item-top">
        ${s?'<span class="vs-note-pin" title="Pinned">\u{1F4CC}</span>':""}
        <span class="vs-note-item-title">${y(n)}</span>
      </div>
      ${o?`<div class="vs-note-item-preview">${Dd(y(o))}</div>`:""}
      <div class="vs-note-item-time">${i}</div>
    </div>
  `}function Rd(e){if(!e)return"";let t=e.replace(/^#{1,3} /gm,"").replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1").replace(/`([^`]+)`/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^[-*] /gm,"").replace(/^\d+\. /gm,"").replace(/^> /gm,"").replace(/\n/g," ").trim();return t.length>ja?t.substring(0,ja).trim()+"\u2026":t}function Dd(e){if(!mt)return e;let t=mt.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return e.replace(new RegExp(`(${t})`,"gi"),"<mark>$1</mark>")}async function zn(e){if(e===Se)return;await os(),Se=e,jt=!1,Yo="idle",document.querySelectorAll(".vs-note-item").forEach(n=>{n.classList.toggle("vs-note-item--active",parseInt(n.dataset.noteId,10)===e)});let t=Te.find(n=>n.id===e);if(!t)return;window.matchMedia("(max-width: 767px)").matches?(Qs="detail",Wa(t)):Va(t)}async function Ua(){if(await os(),Se=null,jt=!1,Yo="idle",St(),window.matchMedia("(max-width: 767px)").matches&&Qs==="detail"){Qs="list";let t=document.getElementById("vs-notes-mobile-detail");t&&(t.style.display="none")}else{let t=document.getElementById("vs-notes-editor-content");t&&(t.innerHTML=Jo())}}function Va(e,t={}){let s=document.getElementById("vs-notes-editor-content");if(!s)return;let n=e.pinned==1;s.innerHTML=`
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
  `,Ga(e);let o=document.getElementById("vs-note-body");o&&(en(o),t.restoring||setTimeout(()=>{o.focus(),o.setSelectionRange(o.value.length,o.value.length)},50))}function Wa(e){let t=document.getElementById("vs-notes-mobile-detail");if(!t)return;let s=e.pinned==1;t.style.display="flex",t.innerHTML=`
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
  `,Ga(e);let n=document.getElementById("btn-note-back");n==null||n.addEventListener("click",async()=>{await os(),Qs="list",t.style.display="none",Se=null,St()});let o=document.getElementById("vs-note-body");o&&(en(o),setTimeout(()=>o.focus(),50))}function Ga(e){let t=document.getElementById("vs-note-title"),s=document.getElementById("vs-note-body"),n=()=>{ot&&clearTimeout(ot),ot=setTimeout(()=>Zo(),Oa)};t==null||t.addEventListener("input",n),s==null||s.addEventListener("input",()=>{en(s),n()});let o=document.getElementById("btn-note-pin");o==null||o.addEventListener("click",async()=>{if(tn()||sn())return;let c=e.pinned==1,{ok:u,data:p}=await $.put(`/notes/${e.id}`,{pinned:c?0:1});if(u&&p.note){e.pinned=p.note.pinned;let d=Te.findIndex(m=>m.id===e.id);d>=0&&(Te[d]={...Te[d],...p.note}),o.classList.toggle("vs-note-toolbar-btn--active",p.note.pinned==1);let v=o.querySelector("svg");v&&v.setAttribute("fill",p.note.pinned==1?"currentColor":"none"),St(),p.pin_limit&&S(p.pin_limit_message||"You can pin up to 5 notes.","info")}});let i=document.getElementById("btn-note-preview");i==null||i.addEventListener("click",Ka);let a=document.getElementById("btn-note-send-chat");a==null||a.addEventListener("click",()=>ti());let r=document.getElementById("btn-note-board");r==null||r.addEventListener("click",()=>Xa(e));let l=document.getElementById("btn-note-delete");l==null||l.addEventListener("click",()=>Qo(e.id))}async function Zo(){if(!Se||window.IS_DEMO)return;let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");if(!e&&!t)return;let s=(e==null?void 0:e.value)??"",n=(t==null?void 0:t.value)??"",{ok:o,data:i}=await $.put(`/notes/${Se}`,{title:s,body:n});if(o&&(i!=null&&i.note)){let a=Te.findIndex(r=>r.id===Se);a>=0&&(Te[a]={...Te[a],...i.note}),St()}}async function Xo(){if(tn()||sn())return;let{ok:e,data:t}=await $.post("/notes",{title:"",body:""});e&&(t!=null&&t.note)&&(Te.unshift(t.note),St(),Fn(),zn(t.note.id))}async function Qo(e){if(tn()||sn())return;let{ok:t}=await $.delete(`/notes/${e}`);if(!t){S("Could not delete note.","error");return}if(Te=Te.filter(n=>n.id!==e),Se===e){Se=null,jt=!1,Yo="idle";let n=document.getElementById("vs-notes-editor-content");n&&(n.innerHTML=Jo())}St(),Fn(),Ds("Note deleted","Undo",async()=>{var o;let n=await $.post(`/notes/${e}/restore`);n.ok&&((o=n.data)!=null&&o.note)&&(Te.unshift(n.data.note),St(),Fn(),zn(n.data.note.id),S("Note restored.","success"))},"info");let s=document.getElementById("vs-notes-mobile-detail");s&&(s.style.display="none")}function Ka(){let e=document.getElementById("vs-note-body-wrap"),t=document.getElementById("btn-note-preview");if(e)if(jt){jt=!1,e.innerHTML=`<textarea id="vs-note-body" class="vs-note-body-textarea"
                    placeholder="Start writing\u2026" spellcheck="true">${y(Zs)}</textarea>`;let s=document.getElementById("vs-note-body");s&&(en(s),s.addEventListener("input",()=>{en(s),ot&&clearTimeout(ot),ot=setTimeout(()=>Zo(),Oa)}),s.focus()),t==null||t.classList.remove("vs-note-toolbar-btn--active")}else{let s=document.getElementById("vs-note-body");if(!s)return;Zs=s.value,jt=!0;let n=Ad(Zs);e.innerHTML=`<div id="vs-note-preview" class="vs-note-preview">${n}</div>`,t==null||t.classList.add("vs-note-toolbar-btn--active")}}function ei(){let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");return{title:(e==null?void 0:e.value)??"",body:jt?Zs:(t==null?void 0:t.value)??""}}async function ti(e){await os();let t,s;e?(t=e.title||"",s=e.body||""):{title:t,body:s}=ei();let o=`Here is my note "${t||"Untitled"}":

${s}

`;window.location.hash="#/chat",setTimeout(()=>{let i=document.getElementById("prompt-input");i&&(i.value=o,i.focus(),i.style.height="auto",i.style.height=i.scrollHeight+"px")},150)}async function Xa(e){if(tn()||sn())return;await os();let t,s,n;e?(t=e.title||"",s=e.body||"",n=e.id):({title:t,body:s}=ei(),n=Se);let{ok:o,error:i}=await $.post("/cards",{title:t||"Untitled",body:s,column_name:"todo",source_note_id:n});o?S("Card added to Board.","success"):S((i==null?void 0:i.message)||"Failed to add card.","error")}function Hd(e,t){var a;(a=document.getElementById("vs-note-ctx"))==null||a.remove();let s=Te.find(r=>r.id===t);if(!s)return;let n=s.pinned==1,o=document.createElement("div");o.id="vs-note-ctx",o.className="vs-note-context-menu",o.style.left=`${e.clientX}px`,o.style.top=`${e.clientY}px`,o.innerHTML=`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>{let r=o.getBoundingClientRect();r.right>window.innerWidth&&(o.style.left=`${window.innerWidth-r.width-8}px`),r.bottom>window.innerHeight&&(o.style.top=`${window.innerHeight-r.height-8}px`)}),o.addEventListener("click",async r=>{var c;let l=(c=r.target.closest("[data-action]"))==null?void 0:c.dataset.action;if(l)switch(o.remove(),l){case"pin":{if(tn()||sn())return;let u=n?0:1,{ok:p,data:d}=await $.put(`/notes/${t}`,{pinned:u});if(p&&d.note){let v=Te.findIndex(m=>m.id===t);v>=0&&(Te[v]={...Te[v],...d.note}),St(),d.pin_limit&&S(d.pin_limit_message||"You can pin up to 5 notes.","info")}break}case"send":{ti(t!==Se?s:void 0);break}case"use":{await os();let u=t===Se?ei().body:s.body||"";window.location.hash="#/chat",setTimeout(()=>{let p=document.getElementById("prompt-input");p&&(p.value=u,p.focus(),p.style.height="auto",p.style.height=p.scrollHeight+"px")},150);break}case"delete":Qo(t);break;case"board":Xa(s);break}});let i=r=>{o.contains(r.target)||(o.remove(),document.removeEventListener("click",i))};setTimeout(()=>document.addEventListener("click",i),0)}function jd(){let e=document.getElementById("btn-note-new");e==null||e.addEventListener("click",Xo);let t=document.getElementById("btn-notes-first");t==null||t.addEventListener("click",Xo);let s=document.getElementById("notes-search");s==null||s.addEventListener("input",()=>{fs&&clearTimeout(fs),fs=setTimeout(()=>{mt=s.value.trim(),za()},Id)});let n=document.getElementById("vs-notes-list-panel");n==null||n.addEventListener("click",o=>{o.target.closest(".vs-note-item")||o.target.closest("button")||o.target.closest("input")||o.target.closest(".vs-notes-section-label")||Se&&Ua()}),document.addEventListener("keydown",Ya),Nd()}function Ya(e){var n,o,i;if(_.get("route")!=="notes")return;let s=navigator.platform.toUpperCase().includes("MAC")?e.metaKey:e.ctrlKey;if(s&&e.key==="n"){e.preventDefault(),Xo();return}if(s&&e.key==="Backspace"&&Se){e.preventDefault(),Qo(Se);return}if(s&&e.shiftKey&&e.key==="p"){e.preventDefault(),Se&&Ka();return}if(s&&e.shiftKey&&(e.key==="c"||e.key==="C")){e.preventDefault();let a=Te.find(r=>r.id===Se);a&&ti(a);return}if(e.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;Se&&Ua();return}if((e.key==="ArrowUp"||e.key==="ArrowDown")&&!e.metaKey&&!e.ctrlKey){let a=(n=document.activeElement)==null?void 0:n.closest(".vs-note-item");if(!a)return;e.preventDefault();let r=[...document.querySelectorAll(".vs-note-item")],l=r.indexOf(a),c=e.key==="ArrowDown"?Math.min(l+1,r.length-1):Math.max(l-1,0);(o=r[c])==null||o.focus()}if(e.key==="Enter"){let a=(i=document.activeElement)==null?void 0:i.closest(".vs-note-item");a&&(e.preventDefault(),zn(parseInt(a.dataset.noteId,10)))}}function Nd(){let e=document.getElementById("vs-notes-resize"),t=document.getElementById("vs-notes-list-panel");if(!e||!t)return;let s,n;e.addEventListener("mousedown",o=>{o.preventDefault(),s=o.clientX,n=t.offsetWidth;let i=r=>{let l=Math.max(200,Math.min(500,n+r.clientX-s));t.style.width=`${l}px`},a=()=>{document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",a),localStorage.setItem(qa,String(t.offsetWidth))};document.addEventListener("mousemove",i),document.addEventListener("mouseup",a)})}function en(e){if(!e)return;e.style.height="auto";let t=window.innerHeight-200;e.style.height=Math.min(t,e.scrollHeight)+"px"}function Ja(){var e,t;document.removeEventListener("keydown",Ya),ot&&(clearTimeout(ot),ot=null),fs&&(clearTimeout(fs),fs=null),mt="",jt=!1,Zs="",qn=!1,(e=window.__vsFlushCallbacks)==null||e.delete("notes"),(t=document.getElementById("vs-note-ctx"))==null||t.remove()}var Un=!1,Nt=null,Ae=null,Vn=null,nn=null,Ot=null,rn=[{id:"todo",label:"To Do",dotColor:"var(--vs-text-ghost)"},{id:"in_progress",label:"In Progress",dotColor:"var(--vs-accent)"},{id:"done",label:"Done",dotColor:"var(--vs-success)"}];function bs(){var t;let e=(t=_.get("user"))==null?void 0:t.role;return e==="owner"||e==="editor"}function si(){return Un=!1,Ae=null,setTimeout(()=>{Vd(),Xe()},0),`
    <div class="vs-board" id="board-root">
      <div class="vs-board-header">
        <h1 class="vs-board-title">Board</h1>
        ${bs()?`
          <button id="btn-board-add" class="vs-btn vs-btn-primary vs-btn-sm">
            New Card
          </button>
        `:""}
      </div>
      <div class="vs-board-columns" id="board-columns">
        ${rn.map(t=>`
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
  `}async function Xe(){var o;let{ok:e,data:t}=await $.get("/cards");if(!e){S("Failed to load board.","error");return}let s=(t==null?void 0:t.cards)||[];_.set("cards",s),_.set("cardsLoaded",!0),Od(s);let n=await $.get("/cards/archived");if(n.ok){let i=((o=n.data)==null?void 0:o.cards)||[];Ud(i.length)}}function Od(e){let t=bs();for(let s of rn){let n=e.filter(a=>a.column_name===s.id),o=document.querySelector(`[data-col-cards="${s.id}"]`),i=document.querySelector(`[data-count="${s.id}"]`);if(i&&(i.textContent=n.length),!!o){if(n.length===0){s.id==="todo"&&e.length===0?o.innerHTML=t?`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0 0 12px;">Your board is empty</p>
              <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 16px;">Add your first task or promote a note from the Notes section.</p>
              <button class="vs-btn vs-btn-ghost vs-btn-sm board-empty-add">Add a card</button>
            </div>`:`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0;">No tasks on the board yet.</p>
            </div>`:t?o.innerHTML='<div class="vs-board-drop-zone">Drop a card here</div>':o.innerHTML="";continue}if(o.innerHTML=n.map(a=>a.id===Ae?er(a,s,t):qd(a,s,t)).join(""),Ae){let a=o.querySelector(`[data-card-id="${Ae}"].vs-board-card-expanded`);a&&t&&tr(a,Ae)}}}}function qd(e,t,s){let n=e.body?`<div class="vs-board-card-body">${y(e.body.substring(0,200))}</div>`:"",o=e.linked_page?`<div class="vs-board-card-footer"><span class="vs-board-card-link" data-page="${ue(e.linked_page)}"><span class="vs-board-card-link-icon">${C.link}</span>${y(ir(e.linked_page))}</span></div>`:"";return`
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
  `}function er(e,t,s){let n=_.get("pages")||[];return s?`
    <div class="vs-board-card vs-board-card-expanded vs-board-card-editing"
         data-card-id="${e.id}" data-column="${e.column_name}">
      <div class="vs-board-card-expand-header">
        <input type="text"
               class="vs-board-inline-title"
               data-field="title"
               data-card-id="${e.id}"
               value="${ue(e.title)}"
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
          ${rn.map(o=>`<option value="${o.id}" ${o.id===e.column_name?"selected":""}>${o.label}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label">Linked page</label>
        <select class="vs-board-inline-select" data-field="linked_page" data-card-id="${e.id}">
          <option value="">None</option>
          ${n.map(o=>`<option value="${ue(o.slug)}" ${o.slug===e.linked_page?"selected":""}>${y(o.title||o.slug)}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-card-expand-footer">
        <div class="vs-board-card-actions">
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-card-archive="${e.id}">Archive</button>
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-card-delete="${e.id}" style="color: var(--vs-error);">Delete</button>
        </div>
      </div>
      <div class="vs-board-card-meta">
        Created ${an(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${an(e.updated_at)}`:""}
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
            <span class="vs-board-card-link" data-page="${ue(e.linked_page)}"><span class="vs-board-card-link-icon">${C.link}</span>${y(ir(e.linked_page))}</span>
          </div>
        `:""}
        <div class="vs-board-card-meta">
          Created ${an(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${an(e.updated_at)}`:""}
        </div>
      </div>
    `}function tr(e,t){let s=e.querySelector('[data-field="title"]'),n=e.querySelector('[data-field="body"]'),o=e.querySelector('[data-field="column"]'),i=e.querySelector('[data-field="linked_page"]');s==null||s.addEventListener("input",()=>{Za(t,{title:s.value.trim()})}),n==null||n.addEventListener("input",()=>{Qa(n),Za(t,{body:n.value})}),o==null||o.addEventListener("change",async()=>{if(window.IS_DEMO){return}let a=o.value;let{ok:r}=await $.put(`/cards/${t}/move`,{column_name:a,position:0});r?(Ae=null,await Xe()):void 0}),i==null||i.addEventListener("change",async()=>{if(window.IS_DEMO){return}let{ok:a}=await $.put(`/cards/${t}`,{linked_page:i.value||null});}),n&&Qa(n)}function Za(e,t){Ot&&Ot.cardId===e?Object.assign(Ot.fields,t):Ot={cardId:e,fields:{...t}},clearTimeout(Vn),Vn=setTimeout(()=>Wn(),600)}async function Wn(){if(clearTimeout(Vn),Vn=null,!Ot){nn&&await nn;return}let{cardId:e,fields:t}=Ot;if(Ot=null,window.IS_DEMO){return}nn=$.put(`/cards/${e}`,t);let{ok:s}=await nn;nn=null}function Qa(e){e.style.height="auto",e.style.height=Math.max(60,e.scrollHeight)+"px"}async function Fd(e){Ae&&Ae!==e&&await Gn();let{ok:t,data:s}=await $.get(`/cards/${e}`);if(!t||!(s!=null&&s.card)){S("Card not found.","error");return}Ae=e;let n=s.card,o=rn.find(c=>c.id===n.column_name)||rn[0],i=bs(),a=document.querySelector(`[data-card-id="${e}"]`);if(!a)return;let r=er(n,o,i);a.outerHTML=r;let l=document.querySelector(`[data-card-id="${e}"]`);l&&i&&(tr(l,e),setTimeout(()=>{var c;return(c=l.querySelector(".vs-board-inline-title"))==null?void 0:c.focus()},50)),l==null||l.scrollIntoView({behavior:"smooth",block:"nearest"})}async function Gn(){Ae&&(await Wn(),Ae=null,await Xe())}function zd(e,t){on();let s=document.createElement("div");s.className="vs-board-card-dropdown",s.id="vs-board-card-dropdown",s.innerHTML=`
    <button class="vs-board-card-dropdown-item" data-action="archive" data-id="${e}">
      Archive
    </button>
    <button class="vs-board-card-dropdown-item vs-board-card-dropdown-danger" data-action="delete" data-id="${e}">
      Delete
    </button>
  `;let n=t.getBoundingClientRect();s.style.position="fixed",s.style.top=`${n.bottom+4}px`,s.style.right=`${window.innerWidth-n.right}px`,s.style.zIndex="1000",document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let o=a=>{!s.contains(a.target)&&a.target!==t&&(on(),document.removeEventListener("click",o))};setTimeout(()=>document.addEventListener("click",o),10);let i=a=>{a.key==="Escape"&&(on(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i),s.addEventListener("click",async a=>{let r=a.target.closest("[data-action]");if(!r)return;let l=r.dataset.action,c=parseInt(r.dataset.id,10);if(on(),l==="archive"){if(window.IS_DEMO){S("Demo mode \u2014 this action is disabled.","warning");return}let{ok:u}=await $.post(`/cards/${c}/archive`);u&&(Ae===c&&(Ae=null),Ds("Card archived.","Undo",async()=>{await $.post(`/cards/${c}/restore`),await Xe()}),await Xe())}else if(l==="delete"){if(window.IS_DEMO){S("Demo mode \u2014 this action is disabled.","warning");return}if(!await ye({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:p}=await $.delete(`/cards/${c}`);p&&(Ae===c&&(Ae=null),S("Card deleted.","success"),await Xe())}})}function on(){let e=document.getElementById("vs-board-card-dropdown");e&&e.remove()}function Ud(e){let t=document.getElementById("board-archived-link");if(t){if(e===0){t.classList.add("hidden");return}t.classList.remove("hidden"),t.innerHTML=`<button class="vs-board-show-archived">${C.archive||""} Archived (${e})</button>`}}function Vd(){var s,n;if(Un)return;Un=!0;let e=bs();(s=document.getElementById("btn-board-add"))==null||s.addEventListener("click",or);let t=document.getElementById("board-columns");t&&(t.addEventListener("click",Wd),e&&Yd(t)),(n=document.getElementById("board-archived-link"))==null||n.addEventListener("click",o=>{o.target.closest(".vs-board-show-archived")&&Jd()}),document.addEventListener("keydown",sr),document.addEventListener("mousedown",nr),Xd(),window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("board",()=>Wn())}function Wd(e){let t=e.target;if(t.closest(".board-empty-add")){or();return}let s=t.closest("[data-card-menu]");if(s){e.stopPropagation();let l=parseInt(s.dataset.cardMenu,10);zd(l,s);return}if(t.closest("[data-card-close]")){e.stopPropagation(),Gn();return}let o=t.closest("[data-card-archive]");if(o){e.stopPropagation(),Gd(parseInt(o.dataset.cardArchive,10));return}let i=t.closest("[data-card-delete]");if(i){e.stopPropagation(),Kd(parseInt(i.dataset.cardDelete,10));return}let a=t.closest(".vs-board-card-link");if(a){e.stopPropagation();let l=a.dataset.page;l&&Zd(l);return}if(t.closest("input, textarea, select, button"))return;let r=t.closest(".vs-board-card");if(r&&!r.classList.contains("vs-board-card-expanded")){let l=parseInt(r.dataset.cardId,10);Fd(l);return}}function sr(e){if(e.key==="Escape"&&Ae){if(document.querySelector(".vs-modal-overlay"))return;e.preventDefault(),Gn()}}function nr(e){if(!Ae)return;let t=e.target,s=document.querySelector(".vs-board-card-expanded");s&&s.contains(t)||t.closest(".vs-modal-overlay")||t.closest(".vs-board-card-dropdown")||Gn()}async function Gd(e){if(window.IS_DEMO){S("Demo mode \u2014 this action is disabled.","warning");return}let{ok:t}=await $.post(`/cards/${e}/archive`);t&&(Ae=null,Ds("Card archived.","Undo",async()=>{await $.post(`/cards/${e}/restore`),await Xe()}),await Xe())}async function Kd(e){if(window.IS_DEMO){S("Demo mode \u2014 this action is disabled.","warning");return}if(!await ye({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:s}=await $.delete(`/cards/${e}`);s&&(Ae=null,S("Card deleted.","success"),await Xe())}function or(){var a,r,l;let e=document.getElementById("vs-board-create-overlay");e&&e.remove();let t=_.get("pages")||[],s=document.createElement("div");s.id="vs-board-create-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
              ${t.map(c=>`<option value="${ue(c.slug)}">${y(c.title||c.slug)}</option>`).join("")}
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>ge(s);he(s,n),(a=document.getElementById("btn-card-cancel"))==null||a.addEventListener("click",n);let o=c=>{c.key==="Escape"&&(c.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),(r=document.getElementById("card-new-title"))==null||r.addEventListener("keydown",c=>{var u;c.key==="Enter"&&((u=document.getElementById("btn-card-create"))==null||u.click())}),(l=document.getElementById("btn-card-create"))==null||l.addEventListener("click",async()=>{var b,h,g,k;let c=(h=(b=document.getElementById("card-new-title"))==null?void 0:b.value)==null?void 0:h.trim(),u=(g=document.getElementById("card-new-column"))==null?void 0:g.value,p=((k=document.getElementById("card-new-page"))==null?void 0:k.value)||null,d=document.getElementById("card-create-error"),v=document.getElementById("btn-card-create");if(!c){d&&(d.textContent="Please enter a card title.",d.classList.remove("hidden"));return}if(v.disabled=!0,v.textContent="Creating\u2026",window.IS_DEMO){n(),S("Demo mode \u2014 this action is disabled.","warning");return}let{ok:m,error:f}=await $.post("/cards",{title:c,column_name:u,linked_page:p});m?(n(),S("Card created.","success"),await Xe()):(v.disabled=!1,v.textContent="Create",d&&(d.textContent=(f==null?void 0:f.message)||"Failed to create card.",d.classList.remove("hidden")))}),setTimeout(()=>{var c;return(c=document.getElementById("card-new-title"))==null?void 0:c.focus()},80)}async function Xd(){if((_.get("pages")||[]).length>0)return;let{ok:t,data:s}=await $.get("/pages");t&&Array.isArray(s==null?void 0:s.pages)&&_.set("pages",s.pages)}function Yd(e){e.addEventListener("dragstart",t=>{let s=t.target.closest(".vs-board-card");!s||s.classList.contains("vs-board-card-expanded")||(Nt={cardId:parseInt(s.dataset.cardId,10),sourceColumn:s.dataset.column},s.classList.add("vs-board-card-dragging"),t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",s.dataset.cardId))}),e.addEventListener("dragend",t=>{let s=t.target.closest(".vs-board-card");s&&s.classList.remove("vs-board-card-dragging"),Nt=null,e.querySelectorAll(".vs-board-drop-indicator").forEach(n=>n.remove())}),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer.dropEffect="move";let s=t.target.closest("[data-col-cards]");if(!s)return;e.querySelectorAll(".vs-board-drop-indicator").forEach(r=>r.remove());let n=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")],o=t.clientY,i=null;for(let r of n){let l=r.getBoundingClientRect();if(o<l.top+l.height/2){i=r;break}}let a=document.createElement("div");a.className="vs-board-drop-indicator",i?s.insertBefore(a,i):s.appendChild(a)}),e.addEventListener("drop",async t=>{if(t.preventDefault(),!Nt)return;let s=t.target.closest("[data-col-cards]");if(!s)return;let n=s.dataset.colCards,i=(_.get("cards")||[]).filter(p=>p.column_name===n&&p.id!==Nt.cardId).sort((p,d)=>p.position-d.position),a=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")].map(p=>({id:parseInt(p.dataset.cardId,10),rect:p.getBoundingClientRect()})),r=t.clientY,l=a.length;for(let p=0;p<a.length;p++)if(r<a[p].rect.top+a[p].rect.height/2){l=p;break}let c;if(i.length===0||l===0?c=0:l>=i.length?c=i[i.length-1].position+1e3:c=Math.floor((i[l-1].position+i[l].position)/2),e.querySelectorAll(".vs-board-drop-indicator").forEach(p=>p.remove()),window.IS_DEMO){await Xe(),Nt=null;return}let{ok:u}=await $.put(`/cards/${Nt.cardId}/move`,{column_name:n,position:c});u?await Xe():S("Failed to move card.","error"),Nt=null})}async function Jd(){var r;let{ok:e,data:t}=await $.get("/cards/archived");if(!e){S("Failed to load archived cards.","error");return}let s=(t==null?void 0:t.cards)||[],n=bs(),o=document.getElementById("vs-board-archived-overlay");o&&o.remove();let i=document.createElement("div");i.id="vs-board-archived-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">Archived Cards</h2>
      </div>
      <div class="vs-modal-body" style="max-height: 60vh; overflow-y: auto;">
        ${s.length===0?'<p style="font-size: 13px; color: var(--vs-text-ghost);">No archived cards.</p>':s.map(l=>`
            <div class="vs-board-archived-item" data-card-id="${l.id}">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${y(l.title||"Untitled")}</div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 2px;">Archived ${an(l.updated_at)}</div>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>ge(i);if(he(i,a),(r=document.getElementById("btn-archived-close"))==null||r.addEventListener("click",a),n){let l=i.querySelector(".vs-modal");l==null||l.addEventListener("click",async c=>{let u=c.target.closest(".archived-restore-btn");if(u){let d=u.dataset.id,{ok:v}=await $.post(`/cards/${d}/restore`);v&&(S("Card restored.","success"),a(),await Xe());return}let p=c.target.closest(".archived-delete-btn");if(p){let d=p.dataset.id;if(!await ye({title:"Delete Permanently",description:"This card will be permanently deleted. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:m}=await $.delete(`/cards/${d}`);m&&(S("Card deleted.","success"),a(),await Xe())}})}}function Zd(e){if(bs())_.set("activePageScope",e),window.location.hash="#/chat";else{let s=window.location.origin,n=e==="index"?"/":`/${e}`;window.open(`${s}${n}`,"_blank")}}function an(e){return e?new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""}function ir(e){if(!e)return"";if(e==="index"||e==="index.php")return"Home";let s=(_.get("pages")||[]).find(i=>i.slug===e);return s!=null&&s.title?s.title:e.replace(/\.(php|html)$/i,"").split("/").pop().split("-").filter(Boolean).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(" ")||e}async function ar(){await Wn(),Nt=null,Ae=null,Ot=null,Un=!1,on(),document.removeEventListener("keydown",sr),document.removeEventListener("mousedown",nr),window.__vsFlushCallbacks&&window.__vsFlushCallbacks.delete("board")}var we=null,lr=null,He=null,it=null,ct=null,Fe=null,rr=!1,Qd=80;var ec=60,ln=5,dn=6;function tc(e){return e.replace(/\(([⌘⇧⌥⌃\w+↵←→↑↓⌫]+)\)/g,(t,s)=>`<kbd class="vs-tooltip-kbd">${sc(s)}</kbd>`)}function sc(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function nc(){if(we)return;let e=document.createElement("div");e.className="vs-tooltip",e.setAttribute("role","tooltip");let t=document.createElement("span");t.className="vs-tooltip-content";let s=document.createElement("span");s.className="vs-tooltip-arrow",e.appendChild(t),e.appendChild(s),document.body.appendChild(e),we=e,lr=s}function oc(e){if(!we)return;let t=e.getBoundingClientRect(),s=we.getBoundingClientRect(),n,o="above",i=t.top,a=window.innerHeight-t.bottom;i>=s.height+ln+dn?n=t.top-s.height-ln:a>=s.height+ln+dn?(n=t.bottom+ln,o="below"):i>=a?n=dn:(n=t.bottom+ln,o="below");let r=t.left+t.width/2,l=r-s.width/2;l=Math.max(dn,Math.min(l,window.innerWidth-dn-s.width));let c=r-l,u=Math.max(8,Math.min(s.width-8,c));we.style.top=`${n}px`,we.style.left=`${l}px`,lr.style.left=`${u}px`,we.classList.remove("vs-tooltip--above","vs-tooltip--below"),we.classList.add(`vs-tooltip--${o}`)}function ic(e){let t=e.getAttribute("data-tooltip")||e.getAttribute("title");!t||!t.trim()||(e.hasAttribute("title")&&(e.setAttribute("data-tooltip",e.getAttribute("title")),e.removeAttribute("title")),ct&&(clearTimeout(ct),ct=null),He=e,it=null,nc(),we.querySelector(".vs-tooltip-content").innerHTML=tc(t.trim()),we.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"),we.style.display="flex",we.style.opacity="0",requestAnimationFrame(()=>{He===e&&(oc(e),we.classList.add("vs-tooltip--visible"),we.style.opacity="")}))}function dr(){we&&(He&&(ni(He),He=null),we.classList.remove("vs-tooltip--visible"),we.classList.add("vs-tooltip--hiding"),ct=setTimeout(()=>{we&&(we.style.display="none",we.classList.remove("vs-tooltip--hiding")),ct=null},ec))}function Kn(){Fe&&(clearTimeout(Fe),Fe=null),it=null,He&&(ni(He),He=null),ct&&(clearTimeout(ct),ct=null),we&&(we.style.display="none",we.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))}function ni(e){if(!e)return;let t=e.getAttribute("data-tooltip");t&&!e.hasAttribute("title")&&(e.setAttribute("title",t),e.removeAttribute("data-tooltip"))}function cr(e){for(;e&&e!==document.body;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentElement;continue}if(e.hasAttribute("data-tooltip-skip"))return null;if(e.hasAttribute("title")||e.hasAttribute("data-tooltip"))return e;e=e.parentElement}return null}function ac(e){if(e.buttons!==0)return;let t=cr(e.target);if(!t){Fe&&(clearTimeout(Fe),Fe=null),it=null,He&&dr();return}t!==He&&t!==it&&(Fe&&(clearTimeout(Fe),Fe=null),He&&(ni(He),He=null,ct&&(clearTimeout(ct),ct=null),we&&(we.style.display="none",we.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))),it=t,Fe=setTimeout(()=>{Fe=null,it===t&&ic(t)},Qd))}function rc(e){let t=cr(e.target);if(t)if(t===He){let s=e.relatedTarget;if(s&&t.contains(s))return;Fe&&(clearTimeout(Fe),Fe=null),it=null,dr()}else t===it&&(Fe&&(clearTimeout(Fe),Fe=null),it=null)}function lc(){(He||it)&&Kn()}function dc(){(He||it)&&Kn()}function cc(){(He||it)&&Kn()}function pr(){rr||(rr=!0,document.addEventListener("mouseover",ac,{passive:!0}),document.addEventListener("mouseout",rc,{passive:!0}),document.addEventListener("scroll",lc,{passive:!0,capture:!0}),document.addEventListener("keydown",dc,{passive:!0}),document.addEventListener("mousedown",cc,{passive:!0}),window.addEventListener("resize",()=>{He&&Kn()},{passive:!0}))}var vn=[{id:"create",label:"Create",defaultRoute:"chat",routes:[{route:"chat",label:"Chat",roles:["owner","editor"]},{route:"editor",label:"Editor",roles:["owner","editor"]}]},{id:"studio",label:"Studio",defaultRoute:"notes",routes:[{route:"notes",label:"Notes",roles:["owner","editor"]},{route:"board",label:"Board"}]},{id:"manage",label:"Manage",defaultRoute:"forms",routes:[{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"designs",label:"Designs",roles:["owner","editor"]}]}],yr="vs-nav-group-last-",Xn=(()=>{let e={};for(let t of vn)for(let s of t.routes)e[s.route]=t.id;return e})();function ro(e){if(Xn[e])return Xn[e];let t=e.split("/")[0];return Xn[t]?Xn[t]:null}function pc(e){var i;let t=(i=_.get("user"))==null?void 0:i.role,s=e.routes.filter(a=>!a.roles||a.roles.includes(t));if(s.length===0)return e.defaultRoute;let n=localStorage.getItem(yr+e.id);return n&&s.find(r=>r.route===n)?n:s.find(a=>a.route===e.defaultRoute)?e.defaultRoute:s[0].route}function uc(e){let t=ro(e);if(t){let s=e.split("/")[0];localStorage.setItem(yr+t,s)}}var Mv=vn.flatMap(e=>e.routes),ai=["chat","editor"],vc="vs-first-run-guide-dismissed",xr="vs-onboarding-draft-v1",wr="vs-prompt-recents-v1",kr="vs-prompt-pins-v1",mc=8,gc=5,ur=5,hc=5*1024*1024,ri=["image/jpeg","image/png","image/gif","image/webp"],Ft=[],gt=null,ci=document.documentElement.dataset.demo==="true",fc=document.documentElement.dataset.demoHideBanner==="true",Tt=ci&&!fc,Er=window.matchMedia("(max-width: 767px)");function so(){return Er.matches}var bc={chat:"messageCircle",editor:"pencil",notes:"fileText",board:"layoutGrid",assets:"image",forms:"inbox",actions:"zap",designs:"palette"};function yc(){var i;let e=_.get("route"),t=(i=_.get("user"))==null?void 0:i.role,s=ro(e),n=s?vn.find(a=>a.id===s):null;if(!n)return[{route:"more",label:"More",icon:"ellipsis"}];let o=n.routes.filter(a=>!a.roles||a.roles.includes(t)).map(a=>({route:a.route,label:a.label,icon:bc[a.route]||"layoutGrid"}));return o.push({route:"more",label:"More",icon:"ellipsis"}),o}function pi(){var t;return((t=_.get("user"))==null?void 0:t.role)==="viewer"?"board":"chat"}var $r=["chat","editor"];function at(){return ci?(S("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function Cr(){let e=_.get("user");return e&&e.role!=="viewer"}function lo(){return Cr()?!1:(S("You have read-only access.","warning"),!0)}function xc(){let e=_.get("user");return e&&e.role==="owner"}window.IS_DEMO=ci;window.demoGuard=at;window.canWrite=Cr;window.viewerGuard=lo;window.isOwner=xc;var Lr=document.getElementById("app");async function Sr(){var s,n;xi(),ta(),pr(),window.marked&&window.marked.use({renderer:{html(o){return y(typeof o=="string"?o:o.text)}}});let e=await $.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){br();return}_.batch(()=>{_.set("user",e.data.user),_.set("sessionToken",e.data.token),_.set("siteName",e.data.site_name||"")});let t=e.data.site_name;if(t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",o=>{var i;(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)&&(o.preventDefault(),o.returnValue="")}),Ge.beforeEach(async(o,i)=>{var a;for(let r of(window.__vsFlushCallbacks||new Map).values())await r();return i.startsWith("editor")&&!o.startsWith("editor")&&(a=window.__hasUnsavedEditorChanges)!=null&&a.call(window)?await wa():(i.startsWith("notes")&&!o.startsWith("notes")&&Ja(),i.startsWith("board")&&!o.startsWith("board")&&ar(),!0)}).on("chat",()=>je()).on("editor",()=>je()).on("pages",()=>je()).on("pages/:slug",()=>je()).on("assets",()=>je()).on("forms",()=>je()).on("forms/:formId",()=>je()).on("notes",()=>je()).on("board",()=>je()).on("actions",()=>je()).on("actions/:actionId",()=>je()).on("designs",()=>je()).on("settings",()=>je()).on("team",()=>je()).on("profile",()=>je()).onNotFound(()=>Ge.navigate(pi())),_.on("user",o=>{o||br()}),Tr(),Er.addEventListener("change",()=>{je()}),so()){let i=(window.location.hash||"").replace(/^#\/?/,"");if(!i||$r.includes(i)){let a=((n=_.get("user"))==null?void 0:n.role)==="viewer"?"board":"assets";window.location.hash=`#/${a}`}}Ge.start()}async function Tr(){try{let{ok:e,data:t}=await $.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){_.set("pages",t.pages),jr();let s=document.getElementById("chat-messages");(s==null?void 0:s.querySelector(".vs-empty-state"))&&(s.innerHTML=ws(),xs())}}catch{}}function je(){var l;let e=_.get("route"),t=ai.includes(e);uc(e),Us()&&gs(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s=so()&&$r.includes(e),o=((l=_.get("user"))==null?void 0:l.role)==="viewer",i;s?i=Ec(e):e==="editor"?i=o?Yn():Mi():e==="notes"?i=o?Yn():`<div class="h-full overflow-hidden">${Fa()}</div>`:e==="board"?i=`<div class="h-full overflow-hidden">${si()}</div>`:t?i=o?Yn():kc():i=Yn();let a=e==="chat"&&!so(),r=a?"bottom-[32px]":"bottom-0";Lr.innerHTML=`
    ${wc()}
    <div class="fixed top-[48px] ${r} left-0 right-0 overflow-hidden">
      ${i}
    </div>
    ${a?Ac():""}
    ${Pc()}
    ${Rc()}
    ${Hc()}
    ${Ia()}
    ${zc()}
  `,Gc(),Dc(),e==="editor"&&!s&&!o&&Bi()}function wc(){let e=_.get("route"),t=_.get("user"),s=_.get("theme"),n=t==null?void 0:t.role,o=ro(e),i=vn.filter(l=>l.routes.some(c=>!c.roles||c.roles.includes(n))).map(l=>{let c=l.id===o,u=pc(l);return`
        <button class="vs-nav-group ${c?"vs-nav-group-active":""}"
                data-group="${l.id}"
                data-target="${u}">${l.label}</button>
      `}).join(""),a=o?vn.find(l=>l.id===o):null,r=a?a.routes.filter(l=>!l.roles||l.roles.includes(n)).map(l=>{let c=e===l.route||e.startsWith(l.route+"/");return`
            <a href="#/${l.route}"
               class="vs-nav-item ${c?"vs-nav-item-active":""}">
              ${l.label}
            </a>
          `}).join(""):"";return`
    <header class="vs-topbar">
      <div class="vs-topbar-inner">
        <!-- Left: Logo + Group links (architecture) -->
        <div class="vs-topbar-left">
          <a href="#/${pi()}" class="vs-logo" title="${y(_.get("siteName")||"VoxelSite")}">
            <span class="vs-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
                <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
                <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
              </svg>
            </span>
          </a>
          <nav class="vs-nav-groups" aria-label="Workspace">${i}</nav>
          ${Tt?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${C.eye} Demo
            </span>
          `:""}
          <span id="vs-global-status" class="vs-global-status">
            <span class="vs-global-status-dot"></span>
            <span class="vs-global-status-text"></span>
          </span>
        </div>

        <!-- Center: Route tabs (contextual mode) -->
        <div class="vs-topbar-center">
          ${r?`<nav class="vs-nav-routes" aria-label="Section navigation">${r}</nav>`:""}
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
            ${s==="dark"?C.sun:C.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${C.user}
              <span class="hidden sm:inline">${y((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${n!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${n==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${C.pencil} Edit Profile
              </a>
              ${n==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${C.users} Team Members
                </a>
              `:""}
              ${n==="owner"?`
                <a href="#/settings" id="btn-settings-nav" class="vs-dropdown-item">
                  ${C.settings} Settings
                </a>
              `:""}
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${C.logOut} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function kc(){let e=_.get("sidebarWidth"),t=_.get("activeConversationId"),s=_.get("activePageScope"),n=Mr(s),o=(()=>{if(s){let i=s;return i.endsWith(".php")||i.endsWith(".html")?i:i+".php"}return window.__vsCurrentPreviewPath||"index.php"})();return window.__vsCurrentPreviewPath=o,`
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
              ${C.fileText}
              <span id="scope-label" class="text-vs-text-secondary">${y(n)}</span>
              ${C.chevronDown}
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-new-chat"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="New conversation">
              ${C.newChat}
            </button>
            <button id="btn-toggle-history"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="Conversation history">
              ${C.history}
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
          ${ws()}
        </div>

        <!-- Prompt Bar -->
        <div class="vs-prompt-area">
          <div class="vs-prompt-container">
            <input type="file" id="image-file-input" accept="image/jpeg,image/png,image/gif,image/webp" multiple class="hidden" />
            <div id="image-attachments" class="vs-image-attachments" hidden></div>
            <div id="website-ref-chip" class="vs-website-ref-chip" hidden>
              ${C.globe}
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
                  ${C.image}
                </button>
                <button id="btn-attach-website"
                  class="vs-prompt-attach-btn"
                  title="Use website as reference">
                  ${C.globe}
                </button>
                ${window.SpeechRecognition||window.webkitSpeechRecognition?`
                <button id="btn-voice-input"
                  class="vs-prompt-attach-btn"
                  title="Voice input">
                  ${C.mic}
                </button>`:""}
              </div>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (\u2318+Enter)">
                ${C.send}
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
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${C.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${C.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${C.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Enter visual editor (V)">
              ${C.pencil} Edit
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${C.rotateCcw} Refresh
            </button>
            <button id="btn-save-design" class="vs-btn vs-btn-ghost vs-btn-xs" title="Save to Designs" disabled>
              ${C.save} Save
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${C.externalLink}
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
  `}function Ec(e){let t=e==="editor"?"Code Editor":"AI Chat",s=e==="editor"?"The code editor needs a wider screen for the file tree, editor pane, and preview.":"The AI conversation and live preview work side-by-side. That needs a wider screen.";return`
    <div class="h-full overflow-y-auto">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 18px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
          ${C.monitor}
        </div>
        <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 10px;">${t}</h1>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 6px; max-width: 280px; line-height: 1.6;">${s}</p>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 28px; max-width: 280px; line-height: 1.6;">Open Studio on a desktop or tablet to use this feature.</p>
        <a href="#/assets" style="font-size: 13px; font-weight: 500; color: var(--vs-accent); text-decoration: none; padding: 8px 16px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-lg); transition: all 150ms ease;"
           onmouseover="this.style.borderColor='var(--vs-accent)'" onmouseout="this.style.borderColor='var(--vs-border-subtle)'">
          Browse Assets
        </a>
      </div>
    </div>
  `}function Yn(){let e=_.get("route"),t=_.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${$c(e,t)}
      </div>
    </div>
  `}function $c(e,t){let s=_.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return Aa();case"forms":return La();case"forms/:formId":return Sa(t.formId);case"actions":return Ea();case"actions/:actionId":return $a(t.actionId);case"designs":return n==="owner"||n==="editor"?Da():Jn();case"notes":return Jn();case"board":return si();case"settings":return n==="owner"?xa():Jn();case"team":return n==="owner"?Ba():Jn();case"profile":return Sc();default:return Cc("Not Found","This page doesn't exist.")}}function Jn(){let e=pi();return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/${e}" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${e==="board"?"\u2190 Back to Board":"\u2190 Back to Chat"}</a>
    </div>
  `}function Cc(e,t){return`
    <div class="vs-empty-state" style="min-height: 300px;">
      <div class="vs-empty-icon" style="animation: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
          <path style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
          <path style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
        </svg>
      </div>
      <h1 class="vs-empty-title">${e}</h1>
      <p class="vs-empty-description" style="margin-bottom: 0;">${t}</p>
    </div>
  `}function Lc(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return C[t[s]||"layoutGrid"]||C.layoutGrid}function vr(e){Ge.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function Sc(){let e=_.get("user")||{};return setTimeout(()=>Tc(),0),`
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
  `}function Tc(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var c,u,p,d;let o=(u=(c=document.getElementById("profile-name"))==null?void 0:c.value)==null?void 0:u.trim(),i=(d=(p=document.getElementById("profile-email"))==null?void 0:p.value)==null?void 0:d.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:r,data:l}=await $.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(l!=null&&l.user)?(_.set("user",l.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>je(),800)):t&&(t.textContent=(r==null?void 0:r.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var c,u,p;let o=((c=document.getElementById("profile-current-pw"))==null?void 0:c.value)||"",i=((u=document.getElementById("profile-new-pw"))==null?void 0:u.value)||"",a=((p=document.getElementById("profile-confirm-pw"))==null?void 0:p.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:r,error:l}=await $.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",r?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(l==null?void 0:l.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function Mc(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),Bc()):e.classList.add("hidden")}async function Bc(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await $.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${y((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=_.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let r=a.id===i,l=a.title||"Untitled conversation",c=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${r?"vs-conv-item-active":""}"
              data-conversation-id="${y(a.id)}">
        <span class="mt-0.5 shrink-0 ${r?"text-vs-accent":"text-vs-text-ghost"}">${C.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${r?"font-medium":""}" style="font-size: var(--text-sm);">${y(l)}</div>
          <div class="vs-conv-time mt-0.5">${c}</div>
        </div>
        ${r?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let r=a.dataset.conversationId;no(r);let l=document.getElementById("conversation-history-panel");l&&l.classList.add("hidden")})})}async function no(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await $.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){_.set("activeConversationId",null),io(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=ws(),xs();return}let i=n.conversation,a=i.prompts||[];_.set("activeConversationId",e),io(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=ws(),xs();return}let r="",l=!1;for(let c of a){let{text:u,images:p,webRefUrl:d}=Zc(c.user_prompt),v=p.length>0?`<div class="vs-msg-user-images">${p.map(f=>`<img src="${f}" class="vs-msg-user-image" />`).join("")}</div>`:"",m=d?`<div class="vs-msg-user-webref"><a href="${ue(d)}" target="_blank" rel="noopener" title="${ue(d)}">${C.globe} <span>${y(Ps(d))}</span></a></div>`:"";if(r+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${v}
        ${m}
        ${u?`<div class="text-sm text-vs-text-primary leading-relaxed">${y(u)}</div>`:""}
      </div>
    `,c.ai_response||c.files_modified){let f="",b=typeof c.ai_message=="string"&&c.ai_message.trim()!==""?c.ai_message:c.ai_response;b&&(f=to(b));let h="";if(c.files_modified)try{let x=JSON.parse(c.files_modified);if(Array.isArray(x)&&x.length>0){let E=x.map(I=>{let R=typeof I=="string"?I:I.path||I,U=typeof I=="object"&&I.action==="delete";return`<div class="vs-file-badge ${U?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${U?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${y(String(R))}</span>
              </div>`}).join(""),M=x.length;h=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${M} file${M!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${E}</div>
              </div>`}}catch{}let g="";if(c.evaluation_issues)try{let x=JSON.parse(c.evaluation_issues);if(Array.isArray(x)&&x.length>0){let E=O=>O==="error"?"#ef4444":O==="warning"?"#d97706":"#6b7280",M=O=>O==="error"?"rgba(239,68,68,0.1)":O==="warning"?"rgba(217,119,6,0.1)":"rgba(107,114,128,0.1)",I={error:0,warning:0,info:0};x.forEach(O=>{I[O.severity]=(I[O.severity]||0)+1});let R=[];I.error&&R.push(`${I.error} error${I.error>1?"s":""}`),I.warning&&R.push(`${I.warning} warning${I.warning>1?"s":""}`),I.info&&R.push(`${I.info} suggestion${I.info>1?"s":""}`);let U=I.error>0?"error":I.warning>0?"warning":"info",te=U==="error"?"rgba(239,68,68,0.15)":U==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)",G=x.map(O=>`
              <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${E(O.severity)}; background: ${M(O.severity)};">${y(O.severity)}</span>
                  <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(O.category||"")}</span>
                  ${O.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(O.file)}${O.line?":"+O.line:""}</span>`:""}
                </div>
                <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(O.description||"")}</div>
                ${O.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(O.suggested_fix)}</div>`:""}
              </div>
            `).join("");g=`
              <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${te}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
                <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${E(U)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>Expert Review \xB7 ${R.join(", ")}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <div style="border-top: 1px solid var(--vs-border-subtle);">
                  <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
                  ${G}
                </div>
              </details>`}}catch{}let k=c.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${f}</div>
          ${h}
          ${g}
          ${k}
        </div>
      `}else if(c.status==="streaming"){l=!0;let f=c.id;r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Generation in progress...
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${f})"
              class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
          </div>
        </div>
      `}else c.status==="partial"?r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 text-sm rounded-lg" style="background: var(--vs-warning-dim, rgba(234,179,8,0.1)); color: var(--vs-warning, #eab308);">
            Generation was interrupted. Some files may be missing \u2014 send a follow-up prompt to complete the site.
          </div>
        </div>
      `:c.status==="error"&&(r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>
        </div>
      `)}t.innerHTML=r,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),l&&!window.__vsResumedToastByConversation[e]&&(S("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),l||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(c){try{await $.post("/ai/cancel-generation",{prompt_id:c})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",no(e)},l&&_.get("activeConversationId")===e&&!_.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{_.get("activeConversationId")===e&&!_.get("aiStreaming")&&no(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function Ic(){_.set("activeConversationId",null),io(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=ws(),xs());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function Mr(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function oo(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=Mr(t)}function io(e){_.set("activePageScope",e||null),oo(),Us()&&gs()}async function _c(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>ge(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),he(t,s),t.addEventListener("keydown",u=>{u.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await $.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${y((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let r=i.pages;if(!r.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${C.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let l='<div style="display: flex; flex-direction: column; gap: 2px;">';r.forEach(u=>{let p=!!Number(u.is_homepage),d=u.title||u.slug||u.path,v=u.path||u.slug+".php",m="/"+v.replace(/\.php$/,"").replace(/^index$/,""),f=m==="/"?"/":m,b=Lc(u.slug),g=(window.__vsCurrentPreviewPath||"index.php")===v,k=u.size?(u.size/1024).toFixed(1)+" KB":"";l+=`
      <div class="vs-pages-modal-item ${g?"is-active":""}" data-slug="${y(u.slug)}" data-path="${y(v)}" data-title="${y(d)}" data-url="${y(f)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${b}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(d)}${p?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(v)}${k?" \xB7 "+k:""}
            </div>
          </div>
        </div>
        <div class="vs-pages-modal-actions" style="display: flex; align-items: center; gap: 2px; flex-shrink: 0;">
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="edit" title="Edit in Chat" style="width:28px;height:28px;">
            ${C.messageCircle}
          </button>
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="preview" title="Open in Preview" style="width:28px;height:28px;">
            ${C.eye}
          </button>
          ${p?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${C.trash2}
          </button>
          `}
        </div>
      </div>
    `}),l+="</div>",n.innerHTML=l;let c=t.querySelector(".vs-modal-desc");c&&(c.textContent=`${r.length} page${r.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(u=>{u.addEventListener("click",p=>{p.stopPropagation();let d=u.closest(".vs-pages-modal-item"),v=d.dataset.slug,m=d.dataset.path,f=d.dataset.title,b=d.dataset.url,h=u.dataset.action;if(h==="edit")io(v),s(),vr(`Edit the "${f}" page (${b}): `);else if(h==="preview"){let g=document.getElementById("preview-iframe");g?(Us()&&gs(),g.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m)+"&t="+Date.now(),window.__vsCurrentPreviewPath=m,oo(),s(),S(`Preview: ${f}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m),"_blank")}else if(h==="delete"){s();let g=`Delete the "${f}" page (${b}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;vr(g)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(u=>{u.addEventListener("click",p=>{if(p.target.closest(".vs-pages-action"))return;let d=u.dataset.path,v=u.dataset.title,m=document.getElementById("preview-iframe");m?(m.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d)+"&t="+Date.now(),window.__vsCurrentPreviewPath=d,oo(),s(),S(`Preview: ${v}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d),"_blank")})})}function xs(){var e;document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let s=document.getElementById("prompt-input");s&&(s.value=t.dataset.quickPrompt,s.dataset.actionType=t.dataset.actionType||"free_prompt",s.focus(),s.setSelectionRange(0,s.value.length),s.dispatchEvent(new Event("input",{bubbles:!0})))})}),(e=document.getElementById("chat-new-design"))==null||e.addEventListener("click",()=>{at()||lo()||Ko()})}function ws(){let e=_.get("pages")||[],t=e.length>0,s=new Set(e.map(g=>g.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(g=>{let k=g.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(k)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],r=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],l=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],c=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],u=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],p,d,v;if(!t)d="What are we building?",v="Describe your website and watch it appear in the preview. Every detail is a conversation away.",p=oi(n).slice(0,6);else{d="What\u2019s next?",v="Your site is live in preview. Pick a suggestion or describe any change you want.";let g=[...o,...o,...i,...a,...r,...l,...c,...u];p=oi(g).slice(0,6);let k=new Set;if(p=p.filter(x=>k.has(x.label)?!1:(k.add(x.label),!0)),p.length<6){let x=oi(g).filter(E=>!k.has(E.label));for(let E of x){if(p.length>=6)break;p.push(E),k.add(E.label)}}}let m=p.map(g=>`<button data-quick-prompt="${y(g.prompt).replace(/"/g,"&quot;")}" data-action-type="${g.type}"
      class="vs-style-card">${y(g.label)}</button>`).join(`
        `),f=_.get("user"),h=t&&((f==null?void 0:f.role)==="owner"||(f==null?void 0:f.role)==="editor")?`
      <div class="vs-animate-in vs-stagger-5" style="margin-top: 16px; text-align: center;">
        <button id="chat-new-design" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
          ${C.filePlus} Start a new design from scratch
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
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${d}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${v}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${m}
      </div>
      ${h}
    </div>
  `}function oi(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function Ac(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <button id="btn-undo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Undo (\u2318Z)">
          ${C.undo} Undo
        </button>
        <button id="btn-redo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Redo (\u2318\u21E7Z)">
          ${C.redo} Redo
        </button>
        <button id="btn-preview-site" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${C.externalLink} Preview
        </button>
        <button id="btn-snapshot" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${C.camera} Snapshot
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-download" class="vs-btn vs-btn-ghost vs-btn-xs" title="Download your website">
          ${C.download} Download
        </button>
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <div class="vs-publish-split">
          <button id="btn-publish"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-main">
            ${C.publish} Publish
          </button>
          <button id="btn-publish-menu"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-chevron"
            title="More publish options">
            ${C.chevronUp}
          </button>
        </div>
      </div>
    </footer>
  `}function Pc(){let e=_.get("route");return`
    <nav class="vs-mobile-nav" aria-label="Mobile navigation">
      ${yc().map(n=>{if(n.route==="more")return`
        <button class="vs-mobile-nav-item ${!ro(e)?"vs-mobile-nav-item-active":""}" id="btn-mobile-more" aria-label="More">
          ${C[n.icon]||C.layoutGrid}
          <span>${n.label}</span>
        </button>
      `;let o=e===n.route||e.startsWith(n.route+"/");return`
      <a href="#/${n.route}"
         class="vs-mobile-nav-item ${o?"vs-mobile-nav-item-active":""}"
         aria-label="${n.label}">
        ${C[n.icon]||C.layoutGrid}
        <span>${n.label}</span>
      </a>
    `}).join("")}
    </nav>
  `}function Rc(){let e=_.get("user"),t=e==null?void 0:e.role,s=_.get("theme"),n="";return t==="owner"&&(n+=`
      <a href="#/settings" class="vs-mobile-more-item" data-mobile-more-nav>
        ${C.settings} Settings
      </a>
    `),n+=`
    <a href="#/profile" class="vs-mobile-more-item" data-mobile-more-nav>
      ${C.pencil} Edit Profile
    </a>
  `,t==="owner"&&(n+=`
      <a href="#/team" class="vs-mobile-more-item" data-mobile-more-nav>
        ${C.users} Team Members
      </a>
    `),(t==="owner"||t==="editor")&&(n+=`
      <button id="btn-mobile-prompts" class="vs-mobile-more-item">
        ${C.zap} Prompts
      </button>
    `),n+=`
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-theme" class="vs-mobile-more-item">
      ${s==="dark"?C.sun:C.moon}
      ${s==="dark"?"Light mode":"Dark mode"}
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-publish" class="vs-mobile-more-item" style="color: var(--vs-accent); font-weight: 600;">
      ${C.publish} Publish
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-logout" class="vs-mobile-more-item" style="color: var(--vs-error);">
      ${C.logOut} Sign Out
    </button>
  `,`
    <div id="mobile-more-sheet" class="vs-mobile-more-sheet">
      <div class="vs-mobile-more-backdrop" id="mobile-more-backdrop"></div>
      <div class="vs-mobile-more-content">
        <div class="vs-mobile-more-header">
          <span class="vs-mobile-more-title">${y((e==null?void 0:e.name)||"Menu")}</span>
          <button id="btn-mobile-more-close" class="vs-mobile-more-close">${C.x}</button>
        </div>
        ${n}
      </div>
    </div>
  `}function Dc(){if(!so())return;let e=document.getElementById("btn-mobile-more"),t=document.getElementById("mobile-more-sheet"),s=document.getElementById("mobile-more-backdrop"),n=document.getElementById("btn-mobile-more-close");function o(){t==null||t.classList.add("vs-sheet-open")}function i(){t==null||t.classList.remove("vs-sheet-open")}e&&e.addEventListener("click",o),s&&s.addEventListener("click",i),n&&n.addEventListener("click",i),document.querySelectorAll("[data-mobile-more-nav]").forEach(u=>{u.addEventListener("click",i)});let a=document.getElementById("btn-mobile-prompts");a&&a.addEventListener("click",()=>{i(),li()});let r=document.getElementById("btn-mobile-theme");r&&r.addEventListener("click",()=>{$n(),i(),je()});let l=document.getElementById("btn-mobile-publish");l&&l.addEventListener("click",()=>{var u;i(),!at()&&((u=document.getElementById("btn-publish"))==null||u.click())});let c=document.getElementById("btn-mobile-logout");c&&c.addEventListener("click",async()=>{i(),await $.post("/auth/logout"),window.location.href="/_studio/"})}function Hc(){return`
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
  `}function Br(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>Pr(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function Ir(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function _r(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function co(){return Ir(kr)}function ui(){return Ir(wr)}function Ar(e){let t=co(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];_r(kr,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};un(n.query||"",n.activeIndex||0)}function jc(e){let t=ui().filter(n=>n!==e),s=[e,...t].slice(0,8);_r(wr,s)}function Pr(e){if(_.get("route")!=="chat"){Ge.navigate("chat"),setTimeout(()=>Pr(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function Rr(e,t="free_prompt",s=!1){if(_.get("route")!=="chat"){Ge.navigate("chat"),setTimeout(()=>Rr(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?ao():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function cn(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function li(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),un(e,0))}function pn(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function Nc(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function Oc(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=Nc(s,n);return i===null?null:70+i}function qc(e){let t=(e||"").trim().toLowerCase(),s=Br(),n=co(),o=ui();return s.map(i=>{let a=Oc(t,i);if(a===null)return null;let r=n.includes(i.id)?-12:0,l=o.includes(i.id)?-8:0;return{...i,__score:a+r+l}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function Fc(e){let t=Br(),s=Object.fromEntries(t.map(p=>[p.id,p])),n=(e||"").trim(),o=[];if(n!==""){let p=qc(e).slice(0,18);return p.length>0&&o.push({title:"Results",commands:p}),o}let i=ui(),a=co(),r=new Set,l=i.map(p=>s[p]).filter(Boolean);l.length>0&&(o.push({title:"Recent",commands:l}),l.forEach(p=>r.add(p.id)));let c=a.map(p=>s[p]).filter(p=>p&&!r.has(p.id));return c.length>0&&(o.push({title:"Pinned",commands:c}),c.forEach(p=>r.add(p.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(p=>{let d=t.filter(v=>v.group===p&&!r.has(v.id));d.length>0&&(o.push({title:p,commands:d}),d.forEach(v=>r.add(v.id)))}),o}function un(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Fc(e),o=n.flatMap(c=>c.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=co();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let r="",l=0;n.forEach(c=>{r+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${y(c.title)}</div>`,c.commands.forEach(u=>{let p=l===i,d=a.includes(u.id);r+=`
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${l}"
            class="vs-cmd-item ${p?"vs-cmd-item-active":""}">
            <div class="min-w-0">
              <div class="vs-cmd-item-title">${y(u.title)}</div>
              <div class="vs-cmd-item-desc">${y(u.prompt?u.prompt.substring(0,80)+(u.prompt.length>80?"\u2026":""):u.meta)}</div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${y(u.id)}"
            class="vs-cmd-pin ${d?"vs-cmd-pin-active":""}"
            title="${d?"Unpin":"Pin"}">
            ${d?"\u2605":"\u2606"}
          </button>
        </div>
      `,l+=1})}),s.innerHTML=r,s.querySelectorAll("[data-command-index]").forEach(c=>{c.addEventListener("click",()=>{let u=parseInt(c.dataset.commandIndex||"0",10);Dr(u)})}),s.querySelectorAll("[data-command-pin]").forEach(c=>{c.addEventListener("click",u=>{u.preventDefault(),u.stopPropagation();let p=c.dataset.commandPin;p&&Ar(p)})})}function Dr(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(jc(n.id),pn(),Promise.resolve(n.run()).catch(()=>{}))}function zc(){return`
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
  `}function Zn(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function is(){try{let e=localStorage.getItem(xr);if(!e)return Zn();let t=JSON.parse(e);return{...Zn(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Zn().pages}}catch{return Zn()}}function Hr(e){try{localStorage.setItem(xr,JSON.stringify(e))}catch{}}function eo(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function mr(){let e=window.__vsOnboarding||{step:1,draft:is()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||is(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),r=document.getElementById("btn-onboarding-next"),l=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!r||!l)return;let c=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${c[t-1]}`,n.innerHTML=c.map((u,p)=>{let d=p+1===t,v=p+1<t;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${d?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":v?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${p+1}. ${y(u)}</div>
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
    `}a.disabled=t===1,r.classList.toggle("hidden",t===3),l.classList.toggle("hidden",t!==3),Uc()}function Uc(){let e=window.__vsOnboarding||{draft:is()},t=()=>{var n,o,i,a,r,l,c,u,p,d,v;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((l=(r=document.getElementById("onboard-offer"))==null?void 0:r.value)==null?void 0:l.trim())||e.draft.offer||"",audience:((u=(c=document.getElementById("onboard-audience"))==null?void 0:c.value)==null?void 0:u.trim())||e.draft.audience||"",style:((p=document.getElementById("onboard-style"))==null?void 0:p.value)||e.draft.style||"modern-minimal",tone:((d=document.getElementById("onboard-tone"))==null?void 0:d.value)||e.draft.tone||"confident",content_mode:((v=document.getElementById("onboard-content-mode"))==null?void 0:v.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(m=>m.checked).map(m=>m.dataset.onboardPage).filter(Boolean)),Hr(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function Vc(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function Wc(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>eo());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>eo());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:is()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,mr()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:is()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,mr()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:is()}).draft||is(),r=Vc(a);try{localStorage.setItem(vc,"1")}catch{}Hr(a),eo(),Rr(r,"create_site",!0)})}function Gc(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var V,Z;let H=$n()==="light";e.innerHTML=H?C.sun:C.moon,e.title=H?"Switch to dark":"Switch to light",window.__vsEditorPage&&((V=window.monaco)!=null&&V.editor)&&window.monaco.editor.setTheme(Yt()),document.getElementById("vs-code-editor-overlay")&&((Z=window.monaco)!=null&&Z.editor)&&window.monaco.editor.setTheme(Yt())}),document.querySelectorAll(".vs-nav-group").forEach(T=>{T.addEventListener("click",()=>{let H=T.dataset.target;H&&Ge.navigate(H)})});let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{li()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>pn());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{un(n.value,0)}),n.addEventListener("keydown",T=>{let H=window.__vsCommandPalette||{commands:[],activeIndex:0};if((T.metaKey||T.ctrlKey)&&T.key.toLowerCase()==="p"){T.preventDefault();let F=H.commands[H.activeIndex];F&&Ar(F.id);return}if(T.key==="ArrowDown"){T.preventDefault(),un(n.value,H.activeIndex+1);return}if(T.key==="ArrowUp"){T.preventDefault(),un(n.value,H.activeIndex-1);return}if(T.key==="Enter"){T.preventDefault(),Dr();return}T.key==="Escape"&&(T.preventDefault(),pn())})),Wc();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",T=>{T.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",T=>{!i.classList.contains("hidden")&&!i.contains(T.target)&&T.target!==o&&!o.contains(T.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav","btn-settings-nav"].forEach(T=>{let H=document.getElementById(T);H&&i&&H.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await $.post("/auth/logout"),window.location.href="/_studio/"});let r=document.getElementById("btn-undo-status");r&&r.addEventListener("click",()=>{at()||hr()});let l=document.getElementById("btn-redo-status");l&&l.addEventListener("click",()=>{at()||fr()});let c=document.getElementById("btn-preview-site");c&&c.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let u=document.getElementById("btn-snapshot");u&&u.addEventListener("click",async()=>{var V;if(at())return;u.disabled=!0,qt("Creating snapshot...");let{ok:T,data:H,error:F}=await $.post("/snapshots",{type:"manual",label:"Manual snapshot"});u.disabled=!1,qt(T?`\u2713 Snapshot saved (${((V=H==null?void 0:H.snapshot)==null?void 0:V.file_count)||0} files)`:"\u2717 "+((F==null?void 0:F.message)||"Snapshot failed"),T?"success":"error",4e3)});let p=document.getElementById("btn-download");p&&((async()=>{var V;let{ok:T,data:H}=await $.get("/settings");((V=H==null?void 0:H.settings)==null?void 0:V.last_published_at)||(p.disabled=!0,p.title="Publish your site first to enable download.",p.classList.add("opacity-40"))})(),p.addEventListener("click",()=>{p.disabled||at()||Yc()}));let d=document.getElementById("btn-publish");d&&(ys(),d.addEventListener("click",async()=>{var be,pt;let T=hn();if(T.publishing)return;if(T.hasChanges===!1){S("No unpublished changes to publish.","warning");return}let H=T.counts||{added:0,modified:0,deleted:0},F=Number(H.added||0)+Number(H.modified||0)+Number(H.deleted||0),V=localStorage.getItem("vs_publish_snapshot"),X=await Xc({totalChanges:F,snapshotDefault:V===null?!0:V!=="false"});if(!X||at())return;localStorage.setItem("vs_publish_snapshot",String(X.createSnapshot)),T.publishing=!0,ys(),qt("Publishing...");let{ok:j,data:ne,error:ce}=await $.post("/publish",{create_snapshot:X.createSnapshot});if(T.publishing=!1,j){let tt=((be=ne==null?void 0:ne.published)==null?void 0:be.length)||0,ut=((pt=ne==null?void 0:ne.removed)==null?void 0:pt.length)||0,ht=ut>0?`Published ${tt} file(s), removed ${ut} stale file(s).`:`Published ${tt} file(s).`;S(ht,"success"),qt(`\u2713 ${tt} published, ${ut} removed`,"success",5e3),_.set("previewDirty",!1),Mt({silent:!0}),window.open("/","_blank")}else S((ce==null?void 0:ce.message)||"Publish failed.","error"),qt("\u2717 "+((ce==null?void 0:ce.message)||"Publish failed"),"error",5e3),Mt({silent:!0})}));let v=document.getElementById("btn-publish-menu");v&&v.addEventListener("click",T=>{T.stopPropagation();let H=document.querySelector(".vs-publish-dropup");if(H){H.remove();return}let F=document.createElement("div");F.className="vs-publish-dropup",F.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${C.cloudOff} Unpublish
        </button>
      `;let V=v.closest(".vs-publish-split");V?V.appendChild(F):v.parentElement.appendChild(F),F.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(F.remove(),!await ye({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0})||at())return;qt("Unpublishing...");let{ok:ne,data:ce,error:be}=await $.post("/publish/unpublish");ne?(S("Unpublished. Default page restored.","success"),qt("\u2713 Site unpublished","success",5e3),Mt({silent:!0})):(S((be==null?void 0:be.message)||"Unpublish failed.","error"),qt("\u2717 "+((be==null?void 0:be.message)||"Unpublish failed"),"error",5e3))});let Z=j=>{!F.contains(j.target)&&j.target!==v&&(F.remove(),document.removeEventListener("click",Z))};setTimeout(()=>document.addEventListener("click",Z),0);let X=j=>{j.key==="Escape"&&(F.remove(),document.removeEventListener("keydown",X),document.removeEventListener("click",Z))};document.addEventListener("keydown",X)});let m=document.getElementById("resize-handle"),f=document.getElementById("conversation-panel");if(m&&f){let T,H;m.addEventListener("mousedown",F=>{F.preventDefault(),T=F.clientX,H=f.offsetWidth;let V=X=>{let j=X.clientX-T,ne=Math.min(580,Math.max(340,H+j));f.style.width=`${ne}px`,_.set("sidebarWidth",ne)},Z=()=>{document.removeEventListener("mousemove",V),document.removeEventListener("mouseup",Z)};document.addEventListener("mousemove",V),document.addEventListener("mouseup",Z)})}let b=document.getElementById("prompt-input");b&&(b.addEventListener("input",()=>{b.style.height="auto",b.style.height=Math.min(200,b.scrollHeight)+"px"}),b.addEventListener("keydown",T=>{T.key==="Enter"&&(T.metaKey||T.ctrlKey)&&(T.preventDefault(),ao())}));let h=document.getElementById("btn-send");h&&h.addEventListener("click",ao);let g=document.getElementById("btn-attach-image"),k=document.getElementById("image-file-input");g&&k&&(g.addEventListener("click",()=>k.click()),k.addEventListener("change",()=>{k.files.length>0&&(ii(k.files),k.value="")})),tp();let x=document.getElementById("btn-voice-input");if(x){let T=window.SpeechRecognition||window.webkitSpeechRecognition,H=null,F=!1,V=()=>{F=!1,x.classList.remove("is-recording"),x.innerHTML=C.mic};x.addEventListener("click",()=>{if(F){H&&H.stop();return}if(location.protocol!=="https:"&&location.hostname!=="localhost"&&location.hostname!=="127.0.0.1"){S("Voice input requires HTTPS","warning");return}H=new T,H.continuous=!1,H.interimResults=!1,H.lang=navigator.language||"en-US",H.onstart=()=>{F=!0,x.classList.add("is-recording")},H.onresult=Z=>{var ce,be;let X=(be=(ce=Z.results[0])==null?void 0:ce[0])==null?void 0:be.transcript;if(!X)return;let j=document.getElementById("prompt-input");if(!j)return;let ne=j.value;j.value=ne+(ne.length>0?" ":"")+X,j.dispatchEvent(new Event("input",{bubbles:!0})),j.style.height="auto",j.style.height=j.scrollHeight+"px",j.focus()},H.onerror=Z=>{if(Z.error==="no-speech")return;let j={"audio-capture":"No microphone found","not-allowed":"Microphone permission denied",network:"Speech service unavailable",aborted:null}[Z.error];j?S(j,"warning"):j!==null&&console.warn("[VoxelSite] Voice input error:",Z.error)},H.onend=()=>{V();let Z=document.getElementById("prompt-input");Z&&Z.focus()};try{H.start()}catch(Z){console.warn("[VoxelSite] Voice input failed to start:",Z.message),S("Voice input unavailable","warning"),V()}})}let E=document.querySelector(".vs-prompt-area");E&&(E.addEventListener("dragover",T=>{T.preventDefault(),T.stopPropagation(),E.classList.add("vs-drag-over")}),E.addEventListener("dragleave",T=>{T.preventDefault(),T.stopPropagation(),E.classList.remove("vs-drag-over")}),E.addEventListener("drop",T=>{T.preventDefault(),T.stopPropagation(),E.classList.remove("vs-drag-over");let H=Array.from(T.dataTransfer.files).filter(F=>ri.includes(F.type));H.length>0&&ii(H)})),b&&b.addEventListener("paste",T=>{var V;let F=Array.from(((V=T.clipboardData)==null?void 0:V.items)||[]).filter(Z=>Z.kind==="file"&&ri.includes(Z.type));if(F.length>0){T.preventDefault();let Z=F.map(X=>X.getAsFile()).filter(Boolean);ii(Z)}}),xs();let M=document.getElementById("btn-new-chat");M&&M.addEventListener("click",Ic);let I=document.getElementById("btn-scope-selector");I&&I.addEventListener("click",()=>{_c()});let R=document.getElementById("btn-toggle-history");R&&R.addEventListener("click",Mc);let U=document.getElementById("btn-visual-editor");U&&U.addEventListener("click",()=>Po());let te=document.getElementById("btn-refresh-preview");te&&te.addEventListener("click",()=>ks());let G=document.getElementById("btn-save-design");if(G){G.addEventListener("click",()=>{at()||lo()||Js()});let T=()=>{let H=_.get("pages")||[];G.disabled=H.length===0};T(),_.on("pages",T)}let O=document.querySelectorAll("[data-device]"),K=document.getElementById("preview-frame-container");if(O.length&&K){let T={desktop:"100%",tablet:"768px",mobile:"375px"};O.forEach(H=>{H.addEventListener("click",()=>{let F=H.dataset.device,V=T[F]||"100%";F==="desktop"?(K.style.maxWidth="",K.style.width="",K.style.alignSelf=""):(K.style.maxWidth=V,K.style.width="100%",K.style.alignSelf="center"),O.forEach(Z=>{Z.classList.remove("vs-device-btn-active"),Z.dataset.device===F&&Z.classList.add("vs-device-btn-active")})})})}let ae=document.getElementById("btn-external-preview");ae&&ae.addEventListener("click",()=>{let T=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(T),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",T=>{var F,V;let H=(V=(F=T.target)==null?void 0:F.closest)==null?void 0:V.call(F,"[data-code-toggle]");H&&(T.preventDefault(),np(H))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",T=>{if((T.metaKey||T.ctrlKey)&&T.key==="k"){T.preventDefault(),cn()?pn():li();return}if(T.key==="Escape"&&cn()){T.preventDefault(),pn();return}if(T.key==="Escape"&&Qn()){T.preventDefault(),eo();return}if((T.metaKey||T.ctrlKey)&&T.key==="z"&&!T.shiftKey){if(cn()||Qn()||_.get("route")!=="chat")return;let H=document.activeElement;if(H&&(H.tagName==="INPUT"||H.tagName==="TEXTAREA"))return;T.preventDefault(),hr()}if((T.metaKey||T.ctrlKey)&&T.key==="z"&&T.shiftKey){if(cn()||Qn()||_.get("route")!=="chat")return;let H=document.activeElement;if(H&&(H.tagName==="INPUT"||H.tagName==="TEXTAREA"))return;T.preventDefault(),fr()}if(T.key==="v"&&!T.metaKey&&!T.ctrlKey&&!T.altKey&&!T.shiftKey){if(cn()||Qn())return;let H=document.activeElement;if(H&&(H.tagName==="INPUT"||H.tagName==="TEXTAREA"||H.isContentEditable))return;let F=_.get("route");if(!ai.includes(F))return;T.preventDefault(),Po()}if(T.key==="Escape"&&Us()){if(T.preventDefault(),Ho())return;if(Ro()){Do();return}if(ea()){Vs();return}gs();return}}));let D=_.get("route");if(ai.includes(D))try{let T=_.get("activeConversationId"),H=localStorage.getItem("vs-active-conversation"),F=T||H,V=document.getElementById("chat-messages"),Z=V==null?void 0:V.querySelector(".vs-empty-state");F&&!_.get("aiStreaming")?(T||_.set("activeConversationId",F),Z&&no(F)):F||V&&V.children.length===0&&(V.innerHTML=ws(),xs())}catch{}gn(),Jc()}function Kc(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=_.get("pages"),s=!t||t.length===0,n=s?"Building your site":"Applying your changes",o=s?"Generating a new website can take up to 10 minutes.<br>Please be patient while the AI works.":"Small changes can take a minute, larger updates can take up to 10 minutes.",i=document.createElement("div");i.className="vs-generating-overlay",i.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">${n}</div>
    <div class="vs-gen-subtitle">${o}</div>
    <div class="vs-gen-note">Keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-metrics" id="overlay-metrics"></div>
  `,e.appendChild(i)}function gr(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function ks(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=ks;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),oo())}));function di(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{ks()}}window.sendPreviewMessage=di;async function hr(){Vs(),(await $.post("/revisions/undo")).ok&&(setTimeout(()=>ks(),300),await gn(),Mt({silent:!0}))}async function fr(){Vs(),(await $.post("/revisions/redo")).ok&&(setTimeout(()=>ks(),300),await gn(),Mt({silent:!0}))}async function gn(){let{ok:e,data:t}=await $.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!s,r.title=o,r.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!n,r.title=i,r.classList.toggle("opacity-40",!n))})}function hn(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function mn(e,t){let s=document.getElementById("vs-global-status");if(!s)return;let n=s.querySelector(".vs-global-status-dot"),o=s.querySelector(".vs-global-status-text");if(!(!n||!o))switch(window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s.className="vs-global-status",e){case"saving":s.classList.add("vs-global-status--active","vs-global-status--saving"),o.textContent=t||"Saving\u2026";break;case"saved":s.classList.add("vs-global-status--active","vs-global-status--saved"),o.textContent=t||"Saved",window.__vsStatusResetTimer=setTimeout(()=>{mn("idle")},2e3);break;case"loading":s.classList.add("vs-global-status--active","vs-global-status--loading"),o.textContent=t||"Loading\u2026";break;case"error":s.classList.add("vs-global-status--active","vs-global-status--error"),o.textContent=t||"Error",window.__vsStatusResetTimer=setTimeout(()=>{mn("idle")},4e3);break;case"idle":default:o.textContent="";break}}function qt(e,t="neutral",s=0){mn(t==="success"?"saved":t==="error"?"error":"idle",e),s>0&&(window.__vsStatusResetTimer&&clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=setTimeout(()=>{mn("idle")},s))}window.__vsSetGlobalStatus=mn;function ys(){let e=hn(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=r=>{s&&(r?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${C.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${C.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${C.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${C.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let r=a===1?"":"s";n.textContent=`${a} unpublished change${r}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${C.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=ys;function Xc({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var l,c;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=u=>{u.key==="Escape"&&(u.preventDefault(),r(null))},r=u=>{document.removeEventListener("keydown",a),ge(i),s(u)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),he(i,()=>r(null)),(l=document.getElementById("vs-confirm-cancel"))==null||l.addEventListener("click",()=>r(null)),(c=document.getElementById("vs-confirm-ok"))==null||c.addEventListener("click",()=>{let u=document.getElementById("vs-publish-snapshot-cb");r({createSnapshot:u?u.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var u;return(u=document.getElementById("vs-confirm-ok"))==null?void 0:u.focus()},220)})}function Yc(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=hn().hasChanges===!0?`
    <div class="vs-download-warning">
      <div class="vs-download-warning-content">
        ${C.alertTriangle}
        <span>You have unpublished changes. This export reflects your last published version.</span>
      </div>
      <a href="#" id="vs-download-publish-link" class="vs-download-publish-link">Publish first \u2192</a>
    </div>
  `:"",o=document.createElement("div");o.id="vs-download-modal-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header" style="position: relative;">
        <button id="vs-download-close" class="vs-download-close-btn" type="button" title="Close">
          ${C.x}
        </button>
        <h2 class="vs-modal-title">Download Your Website</h2>
        <p class="vs-modal-desc">Take your files anywhere. No VoxelSite required to run them.</p>
      </div>
      <div class="vs-modal-body" style="padding-top: 16px;">
        ${n}
        <div class="vs-download-cards" id="vs-download-cards">
          <button type="button" class="vs-download-card is-selected" data-format="php">
            <div class="vs-download-card-icon">
              ${C.fileCode}
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
              ${C.globe}
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
          ${C.download} Download PHP
        </button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=d=>{d.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),ge(o)};o.querySelector("#vs-download-close").addEventListener("click",a),he(o,a),document.addEventListener("keydown",i);let r=o.querySelector("#vs-download-publish-link");r&&r.addEventListener("click",d=>{d.preventDefault(),a(),setTimeout(()=>{let v=document.getElementById("btn-publish");v&&!v.disabled&&v.click()},400)});let l=o.querySelectorAll(".vs-download-card"),c=o.querySelector("#vs-download-action"),u="php";l.forEach(d=>{d.addEventListener("click",()=>{if(d.classList.contains("is-loading"))return;l.forEach(m=>m.classList.remove("is-selected")),d.classList.add("is-selected"),u=d.dataset.format;let v=u==="php"?"Download PHP":"Download HTML";c.innerHTML=`${C.download} ${v}`})});let p=!1;c.addEventListener("click",async()=>{var d;if(!p){p=!0,c.disabled=!0,c.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',l.forEach(v=>v.style.pointerEvents="none");try{let v=_.get("sessionToken"),m={"Content-Type":"application/json",Accept:"application/zip"};v&&(m["X-VS-Token"]=v);let f=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:m,credentials:"same-origin",body:JSON.stringify({format:u})});if(!f.ok){let M="Export failed.";try{let I=await f.json();M=((d=I==null?void 0:I.error)==null?void 0:d.message)||M}catch{}S(M,"error");return}let h=(f.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),g=h?h[1]:`site-${u}-${new Date().toISOString().slice(0,10)}.zip`,k=await f.blob(),x=URL.createObjectURL(k),E=document.createElement("a");E.href=x,E.download=g,E.style.display="none",document.body.appendChild(E),E.click(),setTimeout(()=>{URL.revokeObjectURL(x),E.remove()},100),S(`\u2713 ${g} downloaded`,"success")}catch{S("Download failed. Check your connection.","error")}finally{p=!1,c.disabled=!1;let v=u==="php"?"Download PHP":"Download HTML";c.innerHTML=`${C.download} ${v}`,l.forEach(m=>m.style.pointerEvents="")}}})}async function Mt({silent:e=!1}={}){let t=hn();if(t.publishing){ys();return}t.checking=!0,e||ys();let{ok:s,data:n,error:o}=await $.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",ys()}window.refreshPublishState=Mt;function Jc(){let e=hn();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),Mt({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||Mt({silent:!0})},15e3)}function Zc(e){if(!e)return{text:"",images:[],webRefUrl:null};let t=null,s=e;s.includes("[vx-ref:")&&(s=s.replace(/\[vx-ref:(https?:\/\/[^\]]+)\]/g,(o,i)=>(t=i,"")));let n=[];return s.includes("[vx-img:")&&(s=s.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(o,i)=>(n.push(i),""))),{text:s.trim(),images:n,webRefUrl:t}}function ii(e){let t=Array.from(e),s=ur-Ft.length;if(s<=0){S(`Maximum ${ur} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&S(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!ri.includes(o.type)){S(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>hc){S(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,r=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!r)return;let l=new Image;l.onload=()=>{let c=Qc(l,120);Ft.push({media_type:r[1],data:r[2],name:o.name,preview:a,thumbnail:c}),vi()},l.src=a},i.readAsDataURL(o)})}function Qc(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function vi(){let e=document.getElementById("image-attachments");if(e){if(Ft.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=Ft.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${y(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);Ft.splice(n,1),vi()})})}}function ep(){Ft=[],vi()}function jr(){let t=(_.get("pages")||[]).length>0,s=document.getElementById("website-ref-restyle-options"),n=document.getElementById("website-ref-helper"),o=document.getElementById("btn-website-ref-confirm");s&&(s.hidden=!t),n&&(n.textContent=t?"Use another website as design reference for your site.":"Uses an existing website as design reference."),o&&(o.textContent=t?"Add":"Attach")}function Nr(){gt=null;let e=document.getElementById("website-ref-chip");e&&(e.hidden=!0);let t=document.getElementById("prompt-input");t&&(t.placeholder="Describe what you want to build...");let s=document.getElementById("btn-attach-website");s&&s.classList.remove("is-active")}function tp(){let e=document.getElementById("btn-attach-website"),t=document.getElementById("website-ref-sheet"),s=document.getElementById("website-ref-url"),n=document.getElementById("website-ref-mode"),o=document.getElementById("btn-website-ref-confirm"),i=document.getElementById("btn-website-ref-cancel"),a=document.getElementById("website-ref-chip"),r=document.getElementById("website-ref-chip-label"),l=document.getElementById("btn-remove-website-ref"),c=document.getElementById("prompt-input");function u(d){if(p(),s&&s.classList.add("vs-input-error"),s){let v=document.createElement("div");v.className="vs-field-error vs-ref-url-error",v.textContent=d,s.insertAdjacentElement("afterend",v)}}function p(){s&&s.classList.remove("vs-input-error");let d=t==null?void 0:t.querySelector(".vs-ref-url-error");d&&d.remove()}e&&t&&e.addEventListener("click",()=>{lo()||(jr(),p(),t.hidden=!t.hidden,e.classList.toggle("is-active",!t.hidden||gt!==null),!t.hidden&&s&&s.focus())}),o&&o.addEventListener("click",async()=>{var m;if(at())return;let d=(m=s==null?void 0:s.value)==null?void 0:m.trim();if(!d||!d.match(/^https?:\/\/.+/)){u("Enter a valid URL starting with http:// or https://");return}let v=o.textContent;o.disabled=!0,o.textContent="Checking\u2026",p();try{let{ok:f,data:b,error:h}=await $.post("/ai/check-url",{url:d});if(!f){u((h==null?void 0:h.message)||"Could not reach this URL.");return}let g=(b==null?void 0:b.url)||d,x=(_.get("pages")||[]).length>0;gt={url:g,contentMode:x?(n==null?void 0:n.value)||"keep":"regenerate",restyle:x};let E="Design reference";r.textContent=`${E}: ${Ps(g)}`,r.title=g,a&&(a.hidden=!1),t&&(t.hidden=!0),e&&e.classList.add("is-active"),c&&(c.placeholder="Describe what to change (optional)...",c.focus())}catch{u("Network error \u2014 please check your connection and try again.")}finally{o.disabled=!1,o.textContent=v}}),i&&t&&i.addEventListener("click",()=>{p(),t.hidden=!0,e&&!gt&&e.classList.remove("is-active")}),l&&l.addEventListener("click",()=>{Nr()}),s&&o&&(s.addEventListener("keydown",d=>{d.key==="Enter"&&(d.preventDefault(),o.click())}),s.addEventListener("input",p))}async function ao(){if(at())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=Ft.length>0;if(!t&&!s&&!(gt!==null)||_.get("aiStreaming"))return;if(gt!=null&&gt.restyle)try{let P=_.get("siteName")||"Untitled";if(!(await $.post("/designs",{name:`${P} (before restyle)`,description:`Automatic snapshot saved before restyling from ${gt.url}`,is_system_backup:!0})).ok){S("Could not save your current design before restyling. Please try again.","error");return}}catch{S("Could not save your current design before restyling. Please try again.","error");return}e.value="",e.style.height="auto";let o=document.getElementById("chat-messages");if(!o)return;let i=[...Ft];ep();let a=gt;Nr();let r=i.length>0?`<div class="vs-msg-user-images">${i.map(P=>`<img src="${P.preview}" alt="${y(P.name)}" class="vs-msg-user-image" />`).join("")}</div>`:"",l=a?`<div class="vs-msg-user-webref"><a href="${ue(a.url)}" target="_blank" rel="noopener" title="${ue(a.url)}">${C.globe} <span>${y(Ps(a.url))}</span></a></div>`:"",c=`
    <div class="vs-msg-user mb-6 mt-4">
      ${r}
      ${l}
      ${t?`<div class="vs-msg-user-bubble">${y(t)}</div>`:""}
    </div>
  `,u=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,p=`
    <div class="vs-msg-ai mb-6" data-stream-id="${u}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${C.box}</span>
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
        <button data-role="stop-btn" class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
      </div>
      <div data-role="error" hidden class="mt-3 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>
    </div>
  `,d=o.querySelector(".vs-empty-state");d&&d.remove(),o.insertAdjacentHTML("beforeend",c+p),o.scrollTop=o.scrollHeight;let v=!0,m=80,f=()=>{v=o.scrollHeight-o.scrollTop-o.clientHeight<=m};o.addEventListener("scroll",f);let b=()=>{v&&(o.scrollTop=o.scrollHeight)},h=o.querySelector(`.vs-msg-ai[data-stream-id="${u}"]`);if(!h)return;let g=h.querySelector('[data-role="typing"]'),k=h.querySelector('[data-role="status"]'),x=h.querySelector('[data-role="stream-content"]'),E=h.querySelector('[data-role="files-section"]'),M=h.querySelector('[data-role="files"]'),I=h.querySelector('[data-role="files-label"]'),R=h.querySelector('[data-role="files-count"]'),U=h.querySelector('[data-role="files-progress"]'),te=h.querySelector('[data-role="error"]'),G=h.querySelector('[data-role="status-timer"]'),O=P=>{P&&P.removeAttribute("hidden")},K=P=>{P&&P.setAttribute("hidden","")},ae=Date.now(),D=0,T=Date.now(),H=!1,F=!1,V=setInterval(()=>{let P=Math.floor((Date.now()-ae)/1e3),w=Math.floor(P/60),B=P%60,A=w>0?`${w}m ${B}s`:`${B}s`;D>0&&(A+=` \xB7 ${D.toLocaleString()} tokens`),G&&(G.textContent=A);let N=document.getElementById("overlay-metrics");N&&(N.textContent=A),Date.now()-T>3e5&&!H&&(H=!0,G&&(G.textContent=`${A} \xB7 No data for 5 min \u2014 may have stalled`,G.style.color="var(--vs-warning, #d97706)"))},1e3);_.set("aiStreaming",!0),document.body.classList.add("vs-ai-streaming");let Z=document.getElementById("btn-send");Z&&(Z.disabled=!0,Z.classList.add("opacity-50")),Kc();let X="",j=[],ne=!1,ce=null,be=!0,pt=new AbortController,tt=h.querySelector('[data-role="stop-btn"]');tt&&tt.addEventListener("click",()=>pt.abort());let ut=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let ht=e.dataset.actionData,zt=null;if(ht){try{zt=JSON.parse(ht)}catch{}delete e.dataset.actionData}let L=t||"";if(!L)if(a)try{let P=Ps(a.url);L=a.restyle?`(restyle from: ${P})`:`(import from: ${P})`}catch{L=`(reference: ${a.url})`}else i.length>0&&(L="(see attached images)");a&&(L=`[vx-ref:${a.url}]`+L),i.length>0&&(L=i.map(w=>`[vx-img:${w.thumbnail}]`).join("")+L);let z={user_prompt:L,action_type:ut,page_scope:_.get("activePageScope"),conversation_id:_.get("activeConversationId"),action_data:zt};a&&(z.action_type=a.restyle?"restyle_site":"import_site",z.action_data={url:a.url,content_mode:a.contentMode},z.page_scope=null),i.length>0&&(z.images=i.map(P=>({data:P.data,media_type:P.media_type}))),await Kt("/ai/prompt",z,{signal:pt.signal,onConversation(P){if(P){_.set("activeConversationId",P);try{localStorage.setItem("vs-active-conversation",P)}catch{}}},onStatus(P){!F&&E&&!E.hasAttribute("hidden")&&I&&(I.textContent=P)},onToken(P){X+=P,D+=Math.ceil(P.length/4),T=Date.now(),H=!1,G&&(G.style.color="");let w=X.trimStart();if(!ne&&w.length>0&&(ne=w.startsWith("{")||w.startsWith("```json")||w.startsWith("```")||w.startsWith("<|")||w.startsWith("<message>")||w.startsWith("<file ")||P.includes("<|")||w.includes("<|channel|>")||w.includes('"operations"')||w.includes('"assistant_message"'),ne&&x&&(x.innerHTML="")),K(g),x&&ne){let B=X.match(/<message>([\s\S]*?)(<\/message>|$)/);if(B){let A=B[1].trim();A&&(O(x),x.innerHTML=to(A))}E&&X.includes("<file ")&&O(E)}else x&&(O(x),x.innerHTML=to(X));b()},onFile(P){if(j.push(P),E&&O(E),R){let w=j.length;R.textContent=`${w} file${w!==1?"s":""}`}if(M){let w=P.action==="delete",B=(j.length-1)*60,A=w?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';M.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${w?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${B}ms">
            <span class="vs-file-badge-icon">${A}</span>
            <span>${y(P.path)}</span>
          </div>
        `)}ce||(be=!0),P.path.endsWith(".css")||(be=!1),clearTimeout(ce),ce=setTimeout(()=>{di(be?"voxelsite:reload-css":"voxelsite:reload"),ce=null,be=!0},600),b()},onDone(P){F=!0,clearTimeout(ce),ce=null,clearInterval(V),K(g),K(k);let w=P.files_modified||[],B=j.length>0||w.length>0;if(E&&B){K(U),E.classList.add("vs-files-done"),I&&(I.textContent=P.partial?"Files updated (partial)":"Files updated");let q=document.createElement("div");q.className="vs-chat-action-row",q.innerHTML=`
          <button class="vs-btn vs-btn-ghost vs-btn-xs vs-chat-save-btn" title="Save current design to the library">
            ${C.save} Save to Designs
          </button>
        `,q.querySelector("button").addEventListener("click",()=>{Js()}),E.insertAdjacentElement("afterend",q)}else E&&!E.hasAttribute("hidden")&&(K(U),K(E));if(x)if(P.message)O(x),x.innerHTML=to(P.message);else if(ne)K(x);else{let q=x.textContent||"";(q.includes("<|channel|>")||q.includes('"operations"')||q.includes('"assistant_message"')||q.includes("<file ")||q.includes("<message>"))&&(K(x),x.innerHTML="")}let A=P.missing_files||[];if((P.truncated||A.length>0)&&x){let q;A.length>0?q=`The following pages are linked in the navigation but were NOT created yet: ${A.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:q="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let Q=document.getElementById("prompt-input");Q&&!_.get("aiStreaming")&&(I&&(I.textContent="Generating remaining files..."),E&&(E.classList.remove("vs-files-done"),O(E)),Q.value=q,Q.dataset.actionType="free_prompt",ao())},800)}if(P.conversation_id){_.set("activeConversationId",P.conversation_id);try{localStorage.setItem("vs-active-conversation",P.conversation_id)}catch{}}let N=[...j,...w];if(N.length>0){let q=N.map(ee=>ee.path||ee),Q=q.some(ee=>ee==="index.php"),J=q.filter(ee=>ee.endsWith(".php")&&!ee.includes("/")&&ee!=="index.php"),Y=Q&&J.length>0,ie;Y?ie="index.php":J.length>0?ie=J[0]:ie=Q?"index.php":null,ks(ie),_.set("previewDirty",!0),Mt({silent:!0})}gr(),Tr(),gn(),o.removeEventListener("scroll",f),o.scrollTop=o.scrollHeight},onEvaluation(P){let w=(P==null?void 0:P.issues)||[];if(w.length===0)return;let B={error:0,warning:0,info:0};w.forEach(se=>B[se.severity]=(B[se.severity]||0)+1);let A={error:0,warning:1,info:2},N=[...w].sort((se,fe)=>(A[se.severity]??3)-(A[fe.severity]??3)),q=N.filter(se=>se.severity!=="info"),Q=N.filter(se=>se.severity==="info"),J=[];B.error>0&&J.push(`${B.error} error${B.error!==1?"s":""}`),B.warning>0&&J.push(`${B.warning} warning${B.warning!==1?"s":""}`),B.info>0&&J.push(`${B.info} suggestion${B.info!==1?"s":""}`);let Y=se=>se==="error"?"var(--vs-error, #ef4444)":se==="warning"?"var(--vs-warning, #d97706)":"var(--vs-text-ghost)",ie=se=>se==="error"?"rgba(239,68,68,0.08)":se==="warning"?"rgba(217,119,6,0.08)":"var(--vs-bg-raised)",ee=se=>{let fe=se.file?` in ${se.file}`:"",Ut=se.suggested_fix?`

Suggested approach: ${se.suggested_fix}`:"";return`Review this suggestion and apply if appropriate \u2014 ${se.severity}${fe}: ${se.description}${Ut}`},le=(se,fe)=>`
        <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${Y(se.severity)}; background: ${ie(se.severity)};">${y(se.severity)}</span>
            <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(se.category||"")}</span>
            ${se.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(se.file)}${se.line?":"+se.line:""}</span>`:""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(se.description||"")}</div>
          ${se.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(se.suggested_fix)}</div>`:""}
          <div style="margin-top: 4px; text-align: right;">
            <button class="vs-eval-add-to-chat" data-eval-idx="${fe}" style="
              background: none; border: none; cursor: pointer; padding: 2px 0;
              font-size: 11px; color: var(--vs-accent); opacity: 0.7;
              transition: opacity 0.15s ease;
            " onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'">Add to chat \u2192</button>
          </div>
        </div>
      `,ve=q.map((se,fe)=>le(se,fe)).join(""),Be=Q.length>0?`
        <details style="border-top: 1px solid var(--vs-border-subtle);">
          <summary style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; cursor: pointer; user-select: none; font-size: 11px; color: var(--vs-text-ghost); list-style: none;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            ${Q.length} additional suggestion${Q.length!==1?"s":""}
          </summary>
          ${Q.map((se,fe)=>le(se,q.length+fe)).join("")}
        </details>
      `:"",xe=B.error>0?"error":B.warning>0?"warning":"info",ke=Y(xe),Pe=`
        <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${xe==="error"?"rgba(239,68,68,0.15)":xe==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)"}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
          <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${ke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Expert Review \xB7 ${J.join(", ")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div style="border-top: 1px solid var(--vs-border-subtle);">
            <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
            ${ve}
            ${Be}
          </div>
        </details>
      `,pe;E&&!E.hasAttribute("hidden")?(E.insertAdjacentHTML("afterend",Pe),pe=E.nextElementSibling):x?(x.insertAdjacentHTML("afterend",Pe),pe=x.nextElementSibling):(h.insertAdjacentHTML("beforeend",Pe),pe=h.lastElementChild),pe&&pe.addEventListener("click",se=>{let fe=se.target.closest(".vs-eval-add-to-chat");if(!fe)return;se.preventDefault();let Ut=parseInt(fe.dataset.evalIdx,10),Vt=N[Ut];if(!Vt)return;let Ye=document.getElementById("prompt-input");if(!Ye)return;let Es=ee(Vt),$s=Ye.value.trim();Ye.value=$s?$s+`

`+Es:Es,Ye.focus(),Ye.style.height="auto",Ye.style.height=Math.min(Ye.scrollHeight,200)+"px",Ye.selectionStart=Ye.selectionEnd=Ye.value.length,fe.textContent="\u2713 Added",fe.style.opacity="1",setTimeout(()=>{fe.textContent="Add to chat \u2192",fe.style.opacity="0.7"},1500)}),b()},onWarning(P){P.toLowerCase().includes("truncat")||M&&(M.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${y(P)}</div>
        `)},onError(P){clearTimeout(ce),ce=null,clearInterval(V),K(g),K(k),te&&(te.textContent=P.message||"Something went wrong.",O(te)),gr(),U&&K(U),E&&j.length>0&&(E.classList.add("vs-files-done"),I&&(I.textContent="Files updated (partial)"))}}),_.set("aiStreaming",!1),document.body.classList.remove("vs-ai-streaming"),Z&&(Z.disabled=!1,Z.classList.remove("opacity-50"))}function br(){var p;Lr.innerHTML=`
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
            <h1 class="vs-login-title">${Tt?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${Tt?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${Tt?`
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
                ${Tt?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${Tt?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${Tt?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${C.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${Tt?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${Tt?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
        ${(_.get("theme")||"light")==="light"?C.sun:C.moon}
      </button>
    </div>
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let d=e.type==="password";e.type=d?"text":"password",t.innerHTML=d?C.eyeOff:C.eye,t.title=d?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let d=$n();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=d==="light"?C.sun:C.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(d=>{d.addEventListener("click",()=>{let v=document.getElementById(d.dataset.toggleTarget);if(!v)return;let m=v.type==="password";v.type=m?"text":"password",d.innerHTML=m?C.eyeOff:C.eye,d.title=m?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),r=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var v,m,f;o.classList.add("hidden"),i.classList.remove("hidden");let d=document.getElementById("forgot-content");try{let h=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((v=h==null?void 0:h.data)==null?void 0:v.mode)||"file")==="email"?(d.innerHTML=`
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
          `,(m=document.getElementById("forgot-form"))==null||m.addEventListener("submit",async k=>{var R,U,te;k.preventDefault();let x=document.getElementById("forgot-message"),E=document.getElementById("forgot-email"),M=k.target.querySelector('button[type="submit"]'),I=(R=E==null?void 0:E.value)==null?void 0:R.trim();if(I){M&&(M.disabled=!0,M.textContent="Sending...");try{let O=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:I})})).json();x&&(O.ok?(x.textContent=((U=O.data)==null?void 0:U.message)||"Recovery link sent. Check your inbox.",x.className="mb-5 px-4 py-3 text-sm rounded-xl border",x.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",E&&(E.value="")):(x.textContent=((te=O.error)==null?void 0:te.message)||"Failed to send recovery email.",x.className="mb-5 px-4 py-3 text-sm rounded-xl border",x.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),x.classList.remove("hidden"))}catch{x&&(x.textContent="Network error. Please try again.",x.className="mb-5 px-4 py-3 text-sm rounded-xl border",x.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",x.classList.remove("hidden"))}finally{M&&(M.disabled=!1,M.textContent="Send Recovery Link")}}})):(d.innerHTML=`
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
                  <button type="button" data-toggle-target="forgot-new-password" class="vs-login-eye" title="Show password">${C.eye}</button>
                </div>
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
            </form>
          `,n(),(f=document.getElementById("forgot-form"))==null||f.addEventListener("submit",async k=>{var R,U,te;k.preventDefault();let x=document.getElementById("forgot-message"),E=(R=document.getElementById("forgot-email"))==null?void 0:R.value,M=(U=document.getElementById("forgot-new-password"))==null?void 0:U.value;if(!E||!M)return;let I=await $.post("/auth/reset-password",{email:E,new_password:M});I.ok?(x&&(x.textContent="Password reset. You can now sign in with your new password.",x.className="mb-5 px-4 py-3 text-sm rounded-xl border",x.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",x.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):x&&(x.textContent=((te=I.error)==null?void 0:te.message)||"Reset failed. Make sure the .reset file exists in _data/.",x.className="mb-5 px-4 py-3 text-sm rounded-xl border",x.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",x.classList.remove("hidden"))}))}catch{d.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),r&&r.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let c=new URLSearchParams(window.location.search).get("reset");if(c&&c.length===64&&i&&o){let d=window.location.pathname+window.location.hash;window.history.replaceState(null,"",d),o.classList.add("hidden"),i.classList.remove("hidden");let v=document.getElementById("forgot-content");v&&(v.innerHTML=`
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
              <button type="button" data-toggle-target="token-new-password" class="vs-login-eye" title="Show password">${C.eye}</button>
            </div>
          </div>
          <div>
            <label class="vs-input-label">Confirm Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-confirm-password" type="password" required minlength="8" class="vs-input" placeholder="Confirm your password">
              <button type="button" data-toggle-target="token-confirm-password" class="vs-login-eye" title="Show password">${C.eye}</button>
            </div>
          </div>
          <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
        </form>
      `,n(),(p=document.getElementById("token-reset-form"))==null||p.addEventListener("submit",async m=>{var k,x,E,M;m.preventDefault();let f=document.getElementById("forgot-message"),b=(k=document.getElementById("token-new-password"))==null?void 0:k.value,h=(x=document.getElementById("token-confirm-password"))==null?void 0:x.value,g=m.target.querySelector('button[type="submit"]');if(!b||b.length<8){f&&(f.textContent="Password must be at least 8 characters.",f.className="mb-5 px-4 py-3 text-sm rounded-xl border",f.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",f.classList.remove("hidden"));return}if(b!==h){f&&(f.textContent="Passwords do not match.",f.className="mb-5 px-4 py-3 text-sm rounded-xl border",f.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",f.classList.remove("hidden"));return}g&&(g.disabled=!0,g.textContent="Resetting...");try{let R=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:c,new_password:b})})).json();f&&(R.ok?(f.textContent=((E=R.data)==null?void 0:E.message)||"Password reset. You can now sign in.",f.className="mb-5 px-4 py-3 text-sm rounded-xl border",f.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",f.classList.remove("hidden"),m.target.querySelectorAll("input").forEach(U=>U.disabled=!0),g&&(g.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(f.textContent=((M=R.error)==null?void 0:M.message)||"Reset failed. The link may have expired.",f.className="mb-5 px-4 py-3 text-sm rounded-xl border",f.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",f.classList.remove("hidden")))}catch{f&&(f.textContent="Network error. Please try again.",f.className="mb-5 px-4 py-3 text-sm rounded-xl border",f.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",f.classList.remove("hidden"))}finally{g&&(g.disabled=!1,g.textContent="Reset Password")}}))}let u=document.getElementById("login-form");u&&u.addEventListener("submit",async d=>{var h,g,k,x;d.preventDefault();let v=(h=document.getElementById("login-email"))==null?void 0:h.value,m=(g=document.getElementById("login-password"))==null?void 0:g.value,f=document.getElementById("login-error");if(!v||!m)return;let b=await $.post("/auth/login",{email:v,password:m});b.ok&&((k=b.data)!=null&&k.token)?(_.batch(()=>{_.set("user",b.data.user),_.set("sessionToken",b.data.token)}),Sr()):f&&(f.textContent=((x=b.error)==null?void 0:x.message)||"Invalid email or password.",f.classList.remove("hidden"))}),gn()}function Qn(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function to(e){if(!e)return"";if(!window.marked)return y(e);let t=window.marked.parse(e);return sp(t)}function sp(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),r=a?a.split(`
`):[];if(r.length<=mc)return;let l=r.slice(0,gc).join(`
`)+`
...`,c=document.createElement("div");c.className="vs-code-collapse",c.setAttribute("data-code-collapse","1");let u=document.createElement("pre");u.className="vs-code-collapse-preview",u.setAttribute("data-code-preview","1");let p=document.createElement("code");o!=null&&o.className&&(p.className=o.className),p.textContent=l,u.appendChild(p),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let d=document.createElement("button");d.type="button",d.className="vs-code-collapse-toggle",d.setAttribute("data-code-toggle","1"),d.setAttribute("data-lines",String(r.length)),d.setAttribute("aria-expanded","false"),d.textContent=`More (${r.length} lines)`;let v=n.parentNode;v&&(v.replaceChild(c,n),c.appendChild(u),c.appendChild(n),c.appendChild(d))}),t.innerHTML}function np(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Sr();})();
