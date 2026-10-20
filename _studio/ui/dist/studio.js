(()=>{var Br=e=>{throw TypeError(e)};var ua=(e,t,s)=>t.has(e)||Br("Cannot "+s);var ke=(e,t,s)=>(ua(e,t,"read from private field"),s?s.call(e):t.get(e)),bt=(e,t,s)=>t.has(e)?Br("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),Ht=(e,t,s,n)=>(ua(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),ts=(e,t,s)=>(ua(e,t,"access private method"),s);var ss,ns,Ys,os,Vn,ma,va=class{constructor(t={}){bt(this,Vn);bt(this,ss,new Map);bt(this,ns,new Map);bt(this,Ys,!1);bt(this,os,new Map);for(let[s,n]of Object.entries(t))ke(this,ss).set(s,n)}get(t,s=void 0){return ke(this,ss).has(t)?ke(this,ss).get(t):s}set(t,s){let n=ke(this,ss).get(t);n!==s&&(ke(this,ss).set(t,s),ke(this,Ys)?ke(this,os).has(t)?ke(this,os).get(t).newValue=s:ke(this,os).set(t,{newValue:s,oldValue:n}):ts(this,Vn,ma).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return ke(this,ns).has(t)||ke(this,ns).set(t,new Set),ke(this,ns).get(t).add(s),()=>{var n;(n=ke(this,ns).get(t))==null||n.delete(s)}}batch(t){if(ke(this,Ys)){t();return}Ht(this,Ys,!0),ke(this,os).clear();try{t()}finally{Ht(this,Ys,!1);for(let[s,{newValue:n,oldValue:o}]of ke(this,os))ts(this,Vn,ma).call(this,s,n,o);ke(this,os).clear()}}toJSON(){return Object.fromEntries(ke(this,ss))}};ss=new WeakMap,ns=new WeakMap,Ys=new WeakMap,os=new WeakMap,Vn=new WeakSet,ma=function(t,s,n){let o=ke(this,ns).get(t);if(o)for(let a of o)try{a(s,n)}catch(r){console.error(`[state] Error in "${t}" listener:`,r)}let i=ke(this,ns).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(r){console.error("[state] Error in wildcard listener:",r)}};var R=new va({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});R.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});R.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Wn,hn,bn,yn,xn,wn,is,si,fa,ga=class{constructor(){bt(this,is);bt(this,Wn,[]);bt(this,hn,null);bt(this,bn,!1);bt(this,yn,null);bt(this,xn,null);bt(this,wn,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return ke(this,Wn).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return Ht(this,hn,t),this}beforeEach(t){return Ht(this,yn,t),this}start(){ke(this,bn)||(Ht(this,bn,!0),window.addEventListener("hashchange",()=>ts(this,is,si).call(this)),ts(this,is,si).call(this))}navigate(t){window.location.hash=`/${t}`}refresh(){Ht(this,xn,null),ts(this,is,si).call(this)}get current(){return ts(this,is,fa).call(this)}};Wn=new WeakMap,hn=new WeakMap,bn=new WeakMap,yn=new WeakMap,xn=new WeakMap,wn=new WeakMap,is=new WeakSet,si=async function(){if(ke(this,wn))return;let t=ts(this,is,fa).call(this),s=ke(this,xn);if(!(t===s&&ke(this,bn))){if(ke(this,yn)&&s!==null){Ht(this,wn,!0);try{if(await ke(this,yn).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{Ht(this,wn,!1)}}Ht(this,xn,t);for(let n of ke(this,Wn)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,r)=>{i[a]=decodeURIComponent(o[r+1])}),R.batch(()=>{R.set("route",n.pattern),R.set("routeParams",i)}),n.handler(i);return}}ke(this,hn)?(R.set("route","404"),ke(this,hn).call(this,t)):this.navigate("chat")}},fa=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var yt=new ga;var Pr="/_studio/api/router.php",Es=0;function cp(e,t){var s;t||["POST","PUT","DELETE"].includes(e)&&(Es++,Es===1&&((s=window.__vsSetGlobalStatus)==null||s.call(window,"saving")))}function ni(e,t,s){var n,o;s||["POST","PUT","DELETE"].includes(e)&&(Es=Math.max(0,Es-1),Es===0&&(t?(n=window.__vsSetGlobalStatus)==null||n.call(window,"saved"):(o=window.__vsSetGlobalStatus)==null||o.call(window,"error")))}async function oi(e,t,s=null,n={}){var l;let{silent:o=!1,...i}=n,a={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let c=Rr();c&&(a["X-VS-Token"]=c)}s!==null&&(a["Content-Type"]="application/json");let r={method:e,headers:a,credentials:"same-origin",...i};s!==null&&(r.body=JSON.stringify(s)),cp(e,o);try{let[c,u]=t.split("?"),p=`${Pr}?_path=${encodeURIComponent(c)}${u?"&"+u:""}`,d=await fetch(p,r),v=await d.json();return d.status===401?(R.get("user")&&R.set("user",null),ni(e,!1,o),v!=null&&v.error?{ok:!1,error:v.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!v.ok&&v.error?(v.error.code==="demo_mode"?(window.showToast&&window.showToast(v.error.message||"Demo mode \u2014 this action is disabled.","warning"),!o&&["POST","PUT","DELETE"].includes(e)&&(Es=Math.max(0,Es-1),Es===0&&((l=window.__vsSetGlobalStatus)==null||l.call(window,"idle")))):ni(e,!1,o),{ok:!1,error:v.error}):(ni(e,!0,o),{ok:!0,data:v.data||v})}catch{return ni(e,!1,o),{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var C={get:(e,t)=>oi("GET",e,null,t),post:(e,t,s)=>oi("POST",e,t,s),put:(e,t,s)=>oi("PUT",e,t,s),delete:(e,t,s)=>oi("DELETE",e,t,s)};async function Gt(e,t,s={}){var w,k;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onPromptId:a=()=>{},onFile:r=()=>{},onDone:l=()=>{},onEvaluation:c=()=>{},onWarning:u=()=>{},onError:p=()=>{},signal:d=null,requireTerminal:v=!1}=s,m=Rr(),b={"Content-Type":"application/json",Accept:"text/event-stream"};m&&(b["X-VS-Token"]=m);let h=!1,g=0,f=0,x=t.conversation_id||null;try{let ee=function(H){if(!H.trim())return;let S="";for(let U of H.split(`
`))U.startsWith(":")||U.startsWith("data: ")&&(S+=U.slice(6));if(!S)return;let P;try{P=JSON.parse(S)}catch{return}switch(P.type||"message"){case"token":f++,n(P.content||"");break;case"status":o(P);break;case"conversation":x=P.conversation_id||x,i(P.conversation_id||"");break;case"prompt_id":a(P.prompt_id||0);break;case"file_complete":g++,r(P);break;case"done":h=!0,l(P);break;case"evaluation":c(P);break;case"warning":u(P.message||"");break;case"error":h=!0,p(P);break}},E={method:"POST",headers:b,credentials:"same-origin",body:JSON.stringify(t)};d&&(E.signal=d);let[I,T]=e.split("?"),N=`${Pr}?_path=${encodeURIComponent(I)}${T?"&"+T:""}`,j=await fetch(N,E);if(!j.ok){let H=await j.json().catch(()=>null);p({code:((w=H==null?void 0:H.error)==null?void 0:w.code)||"http_error",message:((k=H==null?void 0:H.error)==null?void 0:k.message)||`Server error (${j.status})`});return}let W=j.body.getReader(),q=new TextDecoder,Y="";for(;;){let{done:H,value:S}=await W.read();if(H)break;Y+=q.decode(S,{stream:!0});let P=Y.split(`

`);Y=P.pop();for(let F of P)ee(F)}if(Y.trim()&&ee(Y),!h){if(v){p({code:"stream_interrupted",message:"The connection closed before the server confirmed the result.",outcome_unknown:!0});return}let H=x;H?(o("Waiting for server to finish..."),await Ar(H,{onDone:l,onError:p,onFile:r,onStatus:o})):(g>0||f>0)&&l({files_modified:[],message:"",soft_close:!0})}}catch(E){if(h)return;if(v&&!h){p({code:"stream_interrupted",message:"The connection closed before the server confirmed the result.",outcome_unknown:!0});return}if(E.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(h)return;if(g>0||f>0){let I=x;I?(o("Server is still generating \u2014 waiting for completion..."),await Ar(I,{onDone:l,onError:p,onFile:r,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else p({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function Ar(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var r;let a=0;for(let l=0;l<120;l++){await new Promise(c=>setTimeout(c,3e3));try{let{ok:c,data:u}=await C.get(`/ai/conversations/${e}`);if(!c||!((r=u==null?void 0:u.conversation)!=null&&r.prompts))continue;let p=u.conversation.prompts,d=p[p.length-1];if(!d)continue;let v=d.files_modified?JSON.parse(d.files_modified):[];if(v.length>a){for(let m=a;m<v.length;m++)n({path:v[m],action:"write"});a=v.length}if(d.status==="streaming"){let m=Math.round((Date.now()-new Date(d.created_at).getTime())/1e3);o(`Server is still generating... (${m}s)`);continue}d.status==="success"?t({message:d.ai_message||"",files_modified:v,revision_id:d.revision_id||null,polled:!0}):d.status==="partial"?t({message:d.ai_message||"",files_modified:v,partial:!0,polled:!0}):s({code:"generation_failed",message:d.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function Rr(){return R.get("sessionToken")}var pp="data-theme",ha="dark";function Dr(){let e=R.get("theme")||localStorage.getItem("vs-theme")||ha;return Hr(e),e}function Hr(e){let t=e||ha;return document.documentElement.setAttribute(pp,t),localStorage.setItem("vs-theme",t),R.set("theme",t),t}function ii(){let e=R.get("theme")||ha;return Hr(e==="dark"?"light":"dark")}var Nr=typeof document<"u"?document.createElement("span"):null;function y(e){return e?(Nr.textContent=e,Nr.innerHTML):""}function re(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var up={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function Gn(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(up))if(t.endsWith(s))return n;return"plaintext"}function ba(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function Kn(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),r=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:r===1?"Yesterday":r<30?`${r} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function Yn(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function Xn(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function Jn(e,t=40){if(!e)return"";let s=e.replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/+$/,"");return s.length>t&&(s=s.substring(0,t-1)+"\u2026"),s}function Ee(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function $e(e,t){let s=null;e.addEventListener("mousedown",n=>{s=n.target}),e.addEventListener("click",n=>{n.target===e&&s===e&&t(n)})}function Te({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var u,p;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let r=document.createElement("div");r.id="vs-confirm-overlay",r.className="vs-modal-overlay",r.innerHTML=`
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
    `;let l=d=>{d.key==="Escape"&&(d.preventDefault(),c(!1))},c=d=>{document.removeEventListener("keydown",l),Ee(r),i(d)};document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible")),$e(r,()=>c(!1)),(u=document.getElementById("vs-confirm-cancel"))==null||u.addEventListener("click",()=>c(!1)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>c(!0)),document.addEventListener("keydown",l),setTimeout(()=>{var d;return(d=document.getElementById("vs-confirm-ok"))==null?void 0:d.focus()},220)})}function Or({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:r="",inputPattern:l=""}){return new Promise(c=>{var h,g;let u=document.getElementById("vs-prompt-overlay");u&&u.remove();let p=document.createElement("div");p.id="vs-prompt-overlay",p.className="vs-modal-overlay";let d=l?` pattern="${y(l)}"`:"",v=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${y(n)}" style="resize: vertical;">${y(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${y(n)}" value="${y(o)}"${d}>`;p.innerHTML=`
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
    `;let m=f=>{Ee(p),c(f)};document.body.appendChild(p),requestAnimationFrame(()=>p.classList.add("is-visible"));let b=p.querySelector("#vs-prompt-input");setTimeout(()=>b==null?void 0:b.focus(),220),$e(p,()=>m(null)),(h=p.querySelector("#vs-prompt-cancel"))==null||h.addEventListener("click",()=>m(null)),(g=p.querySelector("#vs-prompt-ok"))==null||g.addEventListener("click",()=>{m(((b==null?void 0:b.value)||"").trim())}),b==null||b.addEventListener("keydown",f=>{a==="textarea"?f.key==="Enter"&&(f.metaKey||f.ctrlKey)&&(f.preventDefault(),m(((b==null?void 0:b.value)||"").trim())):f.key==="Enter"&&(f.preventDefault(),m(((b==null?void 0:b.value)||"").trim())),f.key==="Escape"&&(f.preventDefault(),m(null))})})}var vp=new Set(["page","partial","component"]),mp=new Set(["partial","component"]),ya={unsafe:"Contains dynamic PHP. Use the Code Editor for full control."};function Xs(e){if(!e||typeof e!="object")return{sourceFile:"",sourceKind:"unsafe",nodeKey:"",includeChain:[],instanceKey:"",editable:!1};let t=typeof e.sourceFile=="string"?e.sourceFile:"",s=typeof e.sourceKind=="string"?e.sourceKind:"unsafe",n=typeof e.nodeKey=="string"?e.nodeKey:"",o=e.editable===!0||e.editable==="true",i=[];Array.isArray(e.includeChain)?i=e.includeChain:typeof e.includeChain=="string"&&e.includeChain&&(i=e.includeChain.split(",").map(r=>r.trim()).filter(Boolean));let a=[t,s,n].filter(Boolean).join("::");return{sourceFile:t,sourceKind:s,nodeKey:n,includeChain:i,instanceKey:a,editable:o}}function ai(e){return e?vp.has(e.sourceKind)&&e.editable:!1}function jr(e){return e?ai(e)?null:e.sourceKind==="unsafe"&&!e.sourceFile?"Could not determine the source file. Changes cannot be saved safely.":ya[e.sourceKind]||ya.unsafe:ya.unsafe}function qr(e){return e?mp.has(e.sourceKind):!1}var $={archive:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',database:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',inbox:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',panelLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',palette:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',mic:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>',micOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19v3"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M16.95 16.95A7 7 0 0 1 5 12v-2"/><path d="M18.89 13.23A7 7 0 0 0 19 12v-2"/><path d="m2 2 20 20"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/></svg>',puzzle:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"/></svg>',paintbrush:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z"/><path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15"/></svg>',penTool:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/></svg>'};var Fr={success:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'},zr='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Ur=["success","error","warning","info"];function Vr(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function Zn(e){e._dismissed||(e._dismissed=!0,e._autoTimer&&(clearTimeout(e._autoTimer),e._autoTimer=null),e.classList.add("vs-toast-exit"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>{e.parentNode&&e.remove()},250))}function B(e,t="success",s=3200){var a;if(!e)return;let n=Vr(),o=Ur.includes(t)?t:"success",i=document.createElement("div");i.className=`vs-toast vs-toast-${o}`,i.innerHTML=`
    <span class="vs-toast-icon">${Fr[o]}</span>
    <span class="vs-toast-message">${y(String(e))}</span>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${zr}</button>
    <div class="vs-toast-progress" style="animation-duration: ${s}ms;"></div>
  `,(a=i.querySelector(".vs-toast-dismiss"))==null||a.addEventListener("click",r=>{r.stopPropagation(),Zn(i)}),n.appendChild(i),i._autoTimer=setTimeout(()=>Zn(i),s)}window.showToast=B;function Qn(e,t,s,n="success"){var l,c;if(!e)return;let o=Vr(),i=Ur.includes(n)?n:"success",a=8e3,r=document.createElement("div");r.className=`vs-toast vs-toast-${i}`,r.style.cursor="default",r.innerHTML=`
    <span class="vs-toast-icon">${Fr[i]}</span>
    <span class="vs-toast-message">${y(String(e))}</span>
    <button type="button" class="vs-toast-action">${y(t)}</button>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${zr}</button>
    <div class="vs-toast-progress" style="animation-duration: ${a}ms;"></div>
  `,(l=r.querySelector(".vs-toast-action"))==null||l.addEventListener("click",u=>{u.stopPropagation(),s(),Zn(r)}),(c=r.querySelector(".vs-toast-dismiss"))==null||c.addEventListener("click",u=>{u.stopPropagation(),Zn(r)}),o.appendChild(r),r._autoTimer=setTimeout(()=>Zn(r),a)}var eo=null;function Wr(){return`
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
              <div class="vs-empty-state-icon">${$.fileCode}</div>
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
  `}async function Gr(){var oe;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,sidebarWidth:(e==null?void 0:e.sidebarWidth)||null,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(L=>L.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(L=>L.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,sidebarWidth:t.sidebarWidth,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)},reconcileMove:async(L,A)=>{if(t.disposed)return;let M=t.openTabs.find(X=>X.path===L);if(!M)return;M.path=A,t.activeTab===L&&(t.activeTab=A);let{ok:D,data:O}=await C.get(`/files/content?path=${encodeURIComponent(A)}`);D&&typeof(O==null?void 0:O.content)=="string"&&(M.baseline=O.content,M._buffer=O.content,M.dirty=!1,t.activeTab===A&&t.monacoInstance&&ae(O.content,A)),await _(),N(),T(),he(),we(),s()},reconcileDelete:async L=>{if(t.disposed)return;let A=t.openTabs.findIndex(M=>M.path===L);if(A!==-1){if(t.openTabs.splice(A,1),t.activeTab===L){let M=t.openTabs[Math.min(A,t.openTabs.length-1)];M?await F(M.path):(t.activeTab=null,ce(),he(),we())}await _(),N(),T(),s()}}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),r=document.getElementById("editor-host"),l=document.getElementById("editor-empty-state"),c=document.getElementById("editor-monaco-container"),u=document.getElementById("editor-file-info"),p=document.getElementById("editor-status"),d=document.getElementById("editor-save-btn"),v=document.getElementById("editor-refresh-tree"),m=document.getElementById("editor-new-file"),b=document.getElementById("editor-sidebar"),h=document.getElementById("editor-sidebar-resize"),g=document.getElementById("editor-font-size-select"),f=document.getElementById("editor-word-wrap-btn");g&&(g.value=t.fontSize);let x=()=>{f&&(t.wordWrap?(f.style.color="var(--vs-accent)",f.style.backgroundColor="var(--vs-accent-dim)"):(f.style.color="var(--vs-text-ghost)",f.style.backgroundColor="transparent"))};x();let w=(L,A="muted")=>{p&&(p.textContent=L,p.dataset.state=A)},k=L=>{let A=t.files.find(M=>M.path===L);return(A==null?void 0:A.readonly)===!0},E=L=>{let A=L.toLowerCase();return A.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':A.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':A.endsWith(".js")||A.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},I=(L,A="")=>{let M=[],D={},O=Q=>{if(D[Q])return D[Q];let z=Q.split("/"),K=z[z.length-1],te=z.slice(0,-1).join("/"),ge=A?A+Q:Q,de={name:K,path:ge,type:"folder",children:[]};return D[Q]=de,te?O(te).children.push(de):M.push(de),de};for(let Q of L){let K=(A&&Q.path.startsWith(A)?Q.path.substring(A.length):Q.path).split("/");if(K.length===1)M.push({name:K[0],path:Q.path,type:"file",meta:Q});else{let te=K.slice(0,-1).join("/");O(te).children.push({name:K[K.length-1],path:Q.path,type:"file",meta:Q})}}let X=Q=>{Q.sort((z,K)=>z.type!==K.type?z.type==="folder"?-1:1:z.name.localeCompare(K.name));for(let z of Q)z.type==="folder"&&X(z.children)};return X(M),M},T=()=>{if(!n)return;let L=(X,Q=0)=>X.map(z=>{var le,Ae;if(z.type==="folder"){let He=t.expandedFolders.has(z.path);return`
            <div class="vs-tree-item" data-folder="${y(z.path)}" style="--tree-indent: ${Q};">
              <span class="vs-tree-folder-toggle" data-expanded="${He}">${$.chevronRight}</span>
              <span class="vs-tree-item-icon">${He?$.folderOpen||$.folder:$.folder}</span>
              <span class="vs-tree-item-name">${y(z.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${y(z.path)}" data-collapsed="${!He}">
              ${L(z.children,Q+1)}
            </div>
          `}let K=t.activeTab===z.path,te=t.openTabs.find(He=>He.path===z.path),ge=te!=null&&te.dirty?" \u2022":"",Le=k(z.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",xe=((le=z.meta)==null?void 0:le.custom)===!0,Be=((Ae=z.meta)==null?void 0:Ae.protected)===!0,be="";return z.path==="assets/css/tailwind.css"?be=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:Be?xe&&(be=`
            <button class="vs-tree-item-restore" data-restore-file="${y(z.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):be=`
            <button class="vs-tree-item-delete" data-delete-file="${y(z.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${y(z.path)}" data-active="${K}" style="--tree-indent: ${Q};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${E(z.path)}</span>
            <span class="vs-tree-item-name">${y(z.name)}${Le}${ge}</span>
            ${be}
          </div>
        `}).join(""),A=(X,Q,z)=>{let K=z.querySelector(".vs-explorer-caret");t.expandedSections.has(X)?(Q.style.display="block",z.classList.add("is-expanded")):(Q.style.display="none",z.classList.remove("is-expanded"))},M=document.querySelector('[data-section="site"]'),D=document.querySelector('[data-section="config"]'),O=document.querySelector('[data-section="prompts"]');M&&A("site",n,M),D&&o&&A("config",o,D),O&&i&&A("prompts",i,O),n.innerHTML=L(t.treeData.site),o&&(o.innerHTML=L(t.treeData.config)),i&&(i.innerHTML=L(t.treeData.prompts)),lt()},N=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(L=>{let A=L.path===t.activeTab,M=L.path.split("/").pop(),O=k(L.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${y(L.path)}" data-active="${A}" data-dirty="${L.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${y(M)}${O}</span>
          <button class="vs-editor-tab-close" data-close-tab="${y(L.path)}" title="Close">${$.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',ht(),Y()}},j=null,W=L=>{if(!a)return;let A=8,M=()=>{a.scrollLeft+=L==="left"?-A:A,Y()};M(),j=setInterval(M,16)},q=()=>{j&&(clearInterval(j),j=null)},Y=()=>{let L=document.getElementById("editor-tab-scroll-left"),A=document.getElementById("editor-tab-scroll-right");if(!a||!L||!A)return;let M=a.scrollLeft>0,D=a.scrollLeft<a.scrollWidth-a.clientWidth-1;L.style.display=M?"flex":"none",A.style.display=D?"flex":"none"};a&&(a.addEventListener("scroll",Y,{passive:!0}),window.addEventListener("resize",Y,{passive:!0}));let ee=document.getElementById("editor-tab-scroll-left"),H=document.getElementById("editor-tab-scroll-right");ee&&(ee.addEventListener("mousedown",()=>W("left")),ee.addEventListener("mouseup",q),ee.addEventListener("mouseleave",q)),H&&(H.addEventListener("mousedown",()=>W("right")),H.addEventListener("mouseup",q),H.addEventListener("mouseleave",q));let S=()=>{l&&(l.style.display="none"),c&&(c.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},P=async L=>{if(t.disposed)return;let A=t.openTabs.find(Q=>Q.path===L);if(A){await F(L);return}w("Loading\u2026");let{ok:M,data:D,error:O}=await C.get(`/files/content?path=${encodeURIComponent(L)}`);if(!M){B((O==null?void 0:O.message)||"Could not load file.","error"),w("Load failed","error");return}let X=typeof(D==null?void 0:D.content)=="string"?D.content:"";A={path:L,baseline:X,dirty:!1},t.openTabs.push(A),S(),await F(L),ae(X,L),w("Ready"),s()},F=async L=>{if(t.disposed)return;let A=t.openTabs.find(D=>D.path===t.activeTab);A&&t.monacoInstance&&(A._buffer=t.monacoInstance.getValue()),t.activeTab=L;let M=t.openTabs.find(D=>D.path===L);if(M&&t.monacoInstance){let D=M._buffer!==void 0?M._buffer:M.baseline;ae(D,L)}he(),we(),N(),setTimeout(()=>{if(a){let D=a.querySelector('.vs-editor-tab[data-active="true"]');if(D){let O=D.getBoundingClientRect(),X=a.getBoundingClientRect();O.left<X.left?a.scrollBy({left:O.left-X.left,behavior:"smooth"}):O.right>X.right&&a.scrollBy({left:O.right-X.right,behavior:"smooth"})}}},10),T(),s()},U=async L=>{let A=t.openTabs.find(D=>D.path===L);if(A!=null&&A.dirty&&!await Te({title:"Discard unsaved changes?",description:`"${L}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let M=t.openTabs.findIndex(D=>D.path===L);if(M!==-1){if(t.openTabs.splice(M,1),t.activeTab===L){let D=t.openTabs[Math.min(M,t.openTabs.length-1)];D?await F(D.path):(t.activeTab=null,ce(),he(),we())}N(),T(),s()}},ne=async L=>{var Q,z;if((Q=window.demoGuard)!=null&&Q.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let A=L.split("/").pop();if(!await Te({title:"Delete file?",description:`Are you sure you want to permanently delete "${A}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;w("Deleting\u2026");let{ok:D,error:O}=await C.delete(`/files?path=${encodeURIComponent(L)}`);if(!D){B((O==null?void 0:O.message)||"Could not delete file.","error"),w("Delete failed","error");return}let X=t.openTabs.findIndex(K=>K.path===L);if(X!==-1){if(t.openTabs.splice(X,1),t.activeTab===L){let K=t.openTabs[Math.min(X,t.openTabs.length-1)];K?await F(K.path):(t.activeTab=null,ce(),he(),we())}N()}await _(),s(),B(`Deleted ${A}`,"success"),w("Ready")},se=async L=>{var Q,z;if((Q=window.demoGuard)!=null&&Q.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let A=L.split("/").pop();if(!await Te({title:"Reset system prompt?",description:`Are you sure you want to reset "${A}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;w("Resetting\u2026");let{ok:D,error:O}=await C.delete(`/files?path=${encodeURIComponent(L)}`);if(!D){B((O==null?void 0:O.message)||"Could not reset file.","error"),w("Reset failed","error");return}let X=t.openTabs.findIndex(K=>K.path===L);if(X!==-1){let{ok:K,data:te}=await C.get(`/files/content?path=${encodeURIComponent(L)}`);if(K&&typeof(te==null?void 0:te.content)=="string"){let ge=t.openTabs[X];ge.baseline=te.content,ge.dirty=!1,ge._buffer=te.content,t.activeTab===L&&ae(te.content,L)}}we(),await _(),s(),B(`Reset ${A} to default`,"success"),w("Ready")},ae=(L,A)=>{var D;if(!t.monacoInstance||!t.monaco)return;let M=t.monacoInstance.getModel();M&&(t.monacoInstance.setValue(L),t.monaco.editor.setModelLanguage(M,Gn(A)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((D=window.canWrite)!=null&&D.call(window))||k(A)}))},ce=()=>{l&&(l.style.display=""),c&&(c.style.display="none")},he=()=>{if(!u)return;if(!t.activeTab){u.textContent="No file open";return}let L=t.openTabs.find(O=>O.path===t.activeTab),A=t.files.find(O=>O.path===t.activeTab),M=A!=null&&A.size?`${(Number(A.size)/1024).toFixed(1)} KB`:"",D=Gn(t.activeTab).toUpperCase();u.textContent=[t.activeTab,D,M].filter(Boolean).join(" \u2022 ")},we=()=>{var M;if(!d)return;let L=t.openTabs.find(D=>D.path===t.activeTab);if(t.activeTab?k(t.activeTab)||!((M=window.canWrite)!=null&&M.call(window)):!1){d.disabled=!0,d.textContent="Read-Only",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}if(!L||!L.dirty){d.disabled=!0,d.textContent="Saved",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}d.disabled=!1,d.textContent="Save",d.classList.remove("vs-btn-ghost"),d.classList.add("vs-btn-primary")},Z=()=>{let L=t.openTabs.find(D=>D.path===t.activeTab);if(!L||!t.monacoInstance)return;let A=t.monacoInstance.getValue(),M=L.dirty;L.dirty=A!==L.baseline,M!==L.dirty&&(we(),N(),L.dirty?w("Unsaved changes","warning"):w("Ready"))},_e=async()=>{var X,Q,z,K,te;if((X=window.demoGuard)!=null&&X.call(window)||(Q=window.viewerGuard)!=null&&Q.call(window))return;let L=t.openTabs.find(ge=>ge.path===t.activeTab);if(!L||!L.dirty||!t.monacoInstance)return;let A=t.monacoInstance.getValue();d.disabled=!0,d.textContent="Saving\u2026",w("Saving\u2026");let{ok:M,error:D}=await C.put("/files/content",{path:L.path,content:A});if(!M){d.disabled=!1,d.textContent="Save",B((D==null?void 0:D.message)||"Could not save file.","error"),w("Save failed","error");return}L.baseline=A,L.dirty=!1,L._buffer=A,we(),N(),T(),w(`${L.path}`,"muted"),L.path.toLowerCase().endsWith(".css")?(z=window.sendPreviewMessage)==null||z.call(window,"voxelsite:reload-css"):(K=window.sendPreviewMessage)==null||K.call(window,"voxelsite:reload"),setTimeout(()=>{var ge;return(ge=window.refreshPreview)==null?void 0:ge.call(window)},400),(te=window.refreshPublishState)==null||te.call(window,{silent:!0});let O=t.openTabs.find(ge=>ge.path==="assets/css/tailwind.css");O&&L.path!=="assets/css/tailwind.css"&&C.get("/files/content?path=assets/css/tailwind.css").then(({ok:ge,data:de})=>{ge&&typeof(de==null?void 0:de.content)=="string"&&(O.baseline=de.content,O._buffer=de.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(de.content))})},lt=()=>{let L=A=>{A&&(A.querySelectorAll("[data-file]").forEach(M=>{M.addEventListener("click",D=>{D.target.closest("[data-delete-file]")||P(M.dataset.file)})}),A.querySelectorAll("[data-delete-file]").forEach(M=>{M.addEventListener("click",D=>{D.stopPropagation(),ne(M.dataset.deleteFile)})}),A.querySelectorAll("[data-restore-file]").forEach(M=>{M.addEventListener("click",D=>{D.stopPropagation(),se(M.dataset.restoreFile)})}),A.querySelectorAll("[data-compile-tailwind]").forEach(M=>{M.addEventListener("click",async D=>{var ge,de;if(D.stopPropagation(),(ge=window.demoGuard)!=null&&ge.call(window)||(de=window.viewerGuard)!=null&&de.call(window))return;M.style.opacity="0.4",M.style.pointerEvents="none",w("Compiling Tailwind\u2026");let{ok:O,data:X,error:Q}=await C.post("/files/compile-tailwind");if(M.style.opacity="",M.style.pointerEvents="",!O){B((Q==null?void 0:Q.message)||"Tailwind compilation failed.","error"),w("Compile failed","error");return}let z="assets/css/tailwind.css",K=t.openTabs.find(Le=>Le.path===z);K&&(K.baseline=X.content,K.dirty=!1,t.activeTab===z&&t.monacoInstance&&t.monacoInstance.setValue(X.content));let te=X.class_count??0;B(`Tailwind CSS recompiled \u2014 ${te} utilities.`,"success"),w("Compiled")})}),A.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(M=>{M.addEventListener("click",D=>{D.stopPropagation();let O=M.closest(".vs-tree-item"),X=O.dataset.folder;if(!X)return;let Q=t.expandedFolders.has(X);Q?t.expandedFolders.delete(X):t.expandedFolders.add(X);let z=!Q,K=O.querySelector(".vs-tree-folder-toggle");K&&K.setAttribute("data-expanded",String(z));let te=O.nextElementSibling;te&&te.classList.contains("vs-tree-folder-children")&&(te.setAttribute("data-collapsed",String(!z)),te.style.display=z?"":"none");let ge=O.querySelector(".vs-tree-item-icon");ge&&(ge.innerHTML=z?$.folderOpen||$.folder:$.folder),s()})}))};L(n),L(o),L(i),document.querySelectorAll(".vs-explorer-section-header").forEach(A=>{A.dataset.bound||(A.dataset.bound="true",A.addEventListener("click",()=>{let M=A.dataset.section,D=A.closest(".vs-explorer-section"),O=D==null?void 0:D.querySelector(".vs-editor-tree");!D||!O||(t.expandedSections.has(M)?(t.expandedSections.delete(M),A.classList.remove("is-expanded"),O.style.display="none"):(t.expandedSections.add(M),A.classList.add("is-expanded"),O.style.display="block"),s())}))})},ht=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(L=>{L.addEventListener("click",A=>{A.target.closest("[data-close-tab]")||F(L.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(L=>{L.addEventListener("click",A=>{A.stopPropagation(),U(L.dataset.closeTab)})}))};if(h&&b){let L=!1;h.addEventListener("mousedown",A=>{A.preventDefault(),L=!0,h.classList.add("is-dragging");let M=O=>{if(!L)return;let X=Math.min(400,Math.max(200,O.clientX));b.style.width=X+"px"},D=()=>{L=!1,h.classList.remove("is-dragging"),document.removeEventListener("mousemove",M),document.removeEventListener("mouseup",D),t.sidebarWidth=b.offsetWidth,s()};document.addEventListener("mousemove",M),document.addEventListener("mouseup",D)})}d==null||d.addEventListener("click",_e),g==null||g.addEventListener("change",L=>{let A=parseInt(L.target.value,10);t.fontSize=A,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:A}),s()}),f==null||f.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,x(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),v==null||v.addEventListener("click",()=>_()),m==null||m.addEventListener("click",async()=>{var Q,z,K;if((Q=window.demoGuard)!=null&&Q.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let L=await Or({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!L||!L.trim())return;let A=L.trim(),M=(K=A.split(".").pop())==null?void 0:K.toLowerCase(),D=["php","css","js","json"];if(!M||!D.includes(M)){B(`Only ${D.join(", ")} files can be created.`,"warning");return}w("Creating\u2026");let{ok:O,error:X}=await C.post("/files/create",{path:A});if(!O){B((X==null?void 0:X.message)||"Could not create file.","error"),w("Create failed","error");return}await _(),await P(A),B(`Created ${A}`,"success")});let Ws=L=>{if(t.disposed){document.removeEventListener("keydown",Ws);return}(L.metaKey||L.ctrlKey)&&L.key==="s"&&(L.preventDefault(),_e())};document.addEventListener("keydown",Ws);let _=async()=>{var D;let{ok:L,data:A,error:M}=await C.get("/files");if(!L||!((D=A==null?void 0:A.files)!=null&&D.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=A.files,t.treeData={site:I(A.files.filter(O=>!O.path.startsWith("_prompts/")&&!O.path.startsWith("_root/"))),config:I(A.files.filter(O=>O.path.startsWith("_root/")),"_root/"),prompts:I(A.files.filter(O=>O.path.startsWith("_prompts/")),"_prompts/")},T()},V=async()=>{if(!c)return;let L;try{L=await ri()}catch{B("Monaco editor is not available.","warning");return}t.monaco=L;let A=Js();L.editor.setTheme(A);let M=L.editor.create(c,{value:"",language:"php",theme:A,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=M,M.onDidChangeModelContent(()=>Z()),M.addCommand(L.KeyMod.CtrlCmd|L.KeyCode.KeyK,async()=>{var Pe;if(t.monacoInstance.getOption(L.editor.EditorOption.readOnly)){B("Cannot use inline AI on a read-only file.","warning");return}let O=t.activeTab;if(!O)return;let X=t.monacoInstance.getModel(),Q=t.monacoInstance.getSelection(),z=X.getValueInRange(Q);if(!z||z.trim()===""){let le=t.monacoInstance.getPosition(),Ae=X.getLineContent(le.lineNumber);if(Ae.trim()===""){B("Highlight a block of code to edit.","warning");return}z=Ae,t.monacoInstance.setSelection(new L.Range(le.lineNumber,1,le.lineNumber,X.getLineMaxColumn(le.lineNumber)))}let K=await D(O);if(!K)return;let te=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let ge=new AbortController,de=0,Le=Date.now(),xe=document.createElement("div");xe.className="vs-inline-ai-overlay",xe.innerHTML=`
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
      `,document.body.appendChild(xe),requestAnimationFrame(()=>xe.classList.add("is-visible"));let Be=xe.querySelector("#ai-gen-timer"),be=setInterval(()=>{let le=Math.floor((Date.now()-Le)/1e3);Be&&(Be.textContent=`${le}s`)},1e3);(Pe=xe.querySelector("#ai-gen-stop"))==null||Pe.addEventListener("click",()=>{ge.abort()}),w("AI is editing...","muted");try{await Gt("/ai/prompt",{user_prompt:K,action_type:"inline_edit",action_data:{path:O,selection:z}},{signal:ge.signal,onStatus:le=>{let Ae=xe.querySelector("#ai-gen-step"),He=typeof le=="string"?le:le.message||"Generating\u2026";Ae&&(Ae.textContent=He)},onToken:()=>{de++;let le=xe.querySelector("#ai-gen-tokens"),Ae=xe.querySelector("#ai-gen-token-dot");le&&(le.textContent=`${de} tokens`),Ae&&(Ae.style.display="")},onFile:()=>{let le=xe.querySelector("#ai-gen-step");le&&(le.textContent="Applying changes\u2026")},onError:le=>{B(le.message||"Generation failed","error")},onDone:async le=>{var He;if(le.cancelled){B("Generation cancelled","info");return}if((He=le.files_modified)==null?void 0:He.some(et=>(typeof et=="string"?et:(et==null?void 0:et.path)||"").replace(/^\//,"")===O.replace(/^\//,""))){let{ok:et,data:pe}=await C.get(`/files/content?path=${encodeURIComponent(O)}&_t=${Date.now()}`);if(et&&(pe!=null&&pe.content)){let Ne=pe.content;await C.put("/files/content",{path:O,content:te}),t.monacoInstance.getModel().setValue(Ne);let es=t.openTabs.find(vt=>vt.path===O);es&&(es._buffer=Ne,es.baseline=te),Z(),B("Review changes and save.","success")}}else le.partial||B("Complete (No changes made to this file)","info")}})}finally{clearInterval(be),t.monacoInstance.updateOptions({readOnly:!1}),xe.classList.remove("is-visible"),setTimeout(()=>xe.remove(),300),w("Ready","muted")}});function D(O){return new Promise(X=>{var Be;let Q=document.getElementById("vs-inline-ai-prompt-overlay");Q&&Q.remove();let z=O.split("/").pop(),K=document.createElement("div");K.id="vs-inline-ai-prompt-overlay",K.className="vs-modal-overlay",K.innerHTML=`
          <div class="vs-inline-ai-prompt">
            <div class="vs-inline-ai-prompt-header">
              <svg class="vs-inline-ai-prompt-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span class="vs-inline-ai-prompt-title">Edit with AI</span>
              <span class="vs-inline-ai-prompt-subtitle" title="${O}">${z}</span>
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
        `;let te=be=>{document.removeEventListener("keydown",ge),Ee(K),X(be)},ge=be=>{be.key==="Escape"&&(be.preventDefault(),te(null))};document.body.appendChild(K),requestAnimationFrame(()=>K.classList.add("is-visible"));let de=K.querySelector("#vs-inline-ai-input"),Le=()=>{de.style.height="auto",de.style.height=Math.min(de.scrollHeight,160)+"px"};de.addEventListener("input",Le),setTimeout(()=>de==null?void 0:de.focus(),200);let xe=null;K.addEventListener("mousedown",be=>{xe=be.target}),K.addEventListener("click",be=>{be.target===K&&xe===K&&te(null)}),(Be=K.querySelector("#vs-inline-ai-go"))==null||Be.addEventListener("click",()=>{let be=((de==null?void 0:de.value)||"").trim();be&&te(be)}),de==null||de.addEventListener("keydown",be=>{if(be.key==="Enter"&&(be.metaKey||be.ctrlKey)){be.preventDefault();let Pe=((de==null?void 0:de.value)||"").trim();Pe&&te(Pe)}}),document.addEventListener("keydown",ge)})}};if(await Promise.all([_(),V()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:L,active:A}=t._pendingRestore;t._pendingRestore=null;for(let M of L){if(!t.files.some(X=>X.path===M))continue;let{ok:D,data:O}=await C.get(`/files/content?path=${encodeURIComponent(M)}`);D&&typeof(O==null?void 0:O.content)=="string"&&t.openTabs.push({path:M,baseline:O.content,dirty:!1})}if(t.openTabs.length>0){let M=A&&t.openTabs.find(D=>D.path===A)?A:t.openTabs[0].path;S(),await F(M),ae(((oe=t.openTabs.find(D=>D.path===M))==null?void 0:oe.baseline)||"",M),w("Ready")}}if(window.__vsEditorPendingFile){let L=window.__vsEditorPendingFile;window.__vsEditorPendingFile=null,t.files.some(A=>A.path===L)&&await P(L)}window.__vsEditorPage&&(window.__vsEditorPage.openFile=P)}function Js(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function ri(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:eo||(eo=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,r){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw eo=null,t}),eo)}async function to(e=""){var j,W,q,Y,ee;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),r=s.querySelector("#vs-code-meta"),l=s.querySelector("#vs-code-status"),c=s.querySelector("#vs-code-editor-host"),u={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},p=(H,S="muted")=>{l&&(l.textContent=H,l.dataset.state=S)},d=()=>u.files.find(H=>H.path===u.path)||null,v=()=>!!u.editor&&u.editor.getValue()!==u.baseline,m=()=>{if(!r)return;let H=d();if(!H){r.textContent="No file selected";return}let S=H.size?`${(Number(H.size)/1024).toFixed(1)} KB`:"0 KB",P=H.modified?new Date(H.modified).toLocaleString():"Unknown date";r.textContent=`${H.path} \u2022 ${S} \u2022 ${P}`},b=window.IS_DEMO||!((j=window.canWrite)!=null&&j.call(window)),h=()=>{if(b)return!0;let H=d();return(H==null?void 0:H.readonly)===!0},g=()=>{if(!o)return;if(h()){o.disabled=!0,o.textContent="Read Only",p("Read-only mode","muted");return}let S=v();o.disabled=!S,o.textContent=S?"Save Changes":"Saved",S?p("Unsaved changes","warning"):u.path&&p(u.path||"Ready","muted")},f=async()=>{var H;u.closed||v()&&!await Te({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(u.closed=!0,(H=u.editorCleanup)!=null&&H.dispose&&(u.editorCleanup.dispose(),u.editorCleanup=null),u.editor&&(u.editor.dispose(),u.editor=null),Ee(s))},x=(H,S=null)=>{if(!u.editor)return;u.editor.setValue(H),u.baseline=H;let P=(S==null?void 0:S.language)||Gn(u.path);u.editor.setLanguage&&u.editor.setLanguage(P),u.editor.setReadOnly&&u.editor.setReadOnly(h()),m(),g()},w=async(H,{silent:S=!1}={})=>{if(!H||!u.editor)return!1;u.path=H,S||p("Loading file\u2026");let{ok:P,data:F,error:U}=await C.get(`/files/content?path=${encodeURIComponent(H)}`);if(!P)return B((U==null?void 0:U.message)||"Could not load file.","error"),p("Load failed","error"),!1;let ne=typeof(F==null?void 0:F.content)=="string"?F.content:"";return x(ne,(F==null?void 0:F.file)||d()),!0},k=async()=>v()?await Te({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,E=async H=>{if(!H||H===u.path)return;if(!await k()){n&&(n.value=u.path);return}await w(H)},I=async()=>{var F,U,ne;if(!u.editor||!u.path||!o)return;let H=u.editor.getValue();if(H===u.baseline){g();return}o.disabled=!0,o.textContent="Saving\u2026",p("Saving\u2026");let{ok:S,error:P}=await C.put("/files/content",{path:u.path,content:H});if(!S){o.disabled=!1,o.textContent="Save Changes",B((P==null?void 0:P.message)||"Could not save file.","error"),p("Save failed","error");return}u.baseline=H,g(),p(u.path||"Ready","muted"),u.path.toLowerCase().endsWith(".css")?(F=window.sendPreviewMessage)==null||F.call(window,"voxelsite:reload-css"):(U=window.sendPreviewMessage)==null||U.call(window,"voxelsite:reload"),setTimeout(()=>{var se;return(se=window.refreshPreview)==null?void 0:se.call(window)},400),(ne=window.refreshPublishState)==null||ne.call(window,{silent:!0})},T=H=>{H.key==="Escape"&&(H.preventDefault(),f())};a==null||a.addEventListener("click",()=>f()),i==null||i.addEventListener("click",async()=>{!u.path||!await k()||await w(u.path)}),o==null||o.addEventListener("click",()=>I()),n==null||n.addEventListener("change",H=>{E(H.target.value)}),s.addEventListener("click",H=>{H.target===s&&f()}),document.addEventListener("keydown",T);let N=()=>document.removeEventListener("keydown",T);s.addEventListener("transitionend",()=>{document.body.contains(s)||N()});try{let H=await C.get("/files");if(!H.ok||!((q=(W=H.data)==null?void 0:W.files)!=null&&q.length)){let U=((Y=H.error)==null?void 0:Y.message)||"No editable files found.";B(U,"error"),f();return}let S=H.data.files;u.files=S,n&&(n.innerHTML=S.map(U=>{let ne=U.group?`${String(U.group).toUpperCase()} \xB7 `:"";return`<option value="${y(U.path)}">${y(ne+U.path)}</option>`}).join(""));let P=((ee=S.find(U=>U.path===e))==null?void 0:ee.path)||S[0].path;u.path=P,n&&(n.value=P),c.innerHTML="";let F=null;try{F=await ri()}catch{B("Monaco is not available yet. Using fallback editor.","warning"),p("Fallback editor active","warning")}if(F!=null&&F.editor){let U=Js();F.editor.setTheme(U);let ne=F.editor.create(c,{value:"",language:Gn(P),theme:U,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",readOnly:h(),fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});u.editor={getValue:()=>ne.getValue(),setValue:se=>ne.setValue(se),setLanguage:se=>{let ae=ne.getModel();ae&&F.editor.setModelLanguage(ae,se)},setReadOnly:se=>ne.updateOptions({readOnly:se}),dispose:()=>ne.dispose()},u.editorCleanup=ne.onDidChangeModelContent(()=>{g()})}else{c.innerHTML=`<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"${h()?" readonly":""}></textarea>`;let U=c.querySelector("#vs-code-editor-fallback"),ne=()=>g();U==null||U.addEventListener("input",ne),u.editor={getValue:()=>(U==null?void 0:U.value)||"",setValue:se=>{U&&(U.value=se)},setLanguage:()=>{},setReadOnly:se=>{U&&(U.readOnly=se)},dispose:()=>{U==null||U.removeEventListener("input",ne)}}}await w(P,{silent:!0}),p("Ready")}catch(H){B((H==null?void 0:H.message)||"Could not initialize code editor.","error"),f()}finally{let H=new MutationObserver(()=>{document.body.contains(s)||(N(),H.disconnect())});H.observe(document.body,{childList:!0,subtree:!0})}}var ve=Object.freeze({SET_TEXT:"set_text",SET_ATTRIBUTE:"set_attribute",ADD_CLASS_TOKEN:"add_class_token",REMOVE_CLASS_TOKEN:"remove_class_token",SET_CLASS_LIST:"set_class_list",MOVE_BEFORE:"move_before",MOVE_AFTER:"move_after",INSERT_NODE:"insert_node",DELETE_NODE:"delete_node",REPLACE_HTML:"replace_html",FALLBACK:"fallback"}),Kr=0;function kt(){Kr++;let e=Math.random().toString(36).substring(2,6);return`op_${Date.now()}_${Kr}_${e}`}function wa(e,t,s,n){return{id:kt(),type:ve.SET_TEXT,address:e,payload:{oldText:t,newText:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function so(e,t,s,n,o){return{id:kt(),type:ve.SET_ATTRIBUTE,address:e,payload:{attrName:t,oldValue:s,newValue:n},filePath:o||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Xr(e,t,s,n,o,i){return{id:kt(),type:ve.SET_CLASS_LIST,address:e,payload:{oldClassStr:t,newClassStr:s,additions:n,removals:o},filePath:i||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Jr(e,t,s,n,o){return{id:kt(),type:ve.DELETE_NODE,address:e,payload:{outerHTML:t,parentAddress:n||null,siblingIndex:typeof o=="number"?o:-1},filePath:s||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Zr(e,t,s,n){return{id:kt(),type:ve.REPLACE_HTML,address:e,payload:{oldHTML:t,newHTML:s},filePath:n||(e==null?void 0:e.sourceFile)||"",timestamp:Date.now()}}function Qr(e){if(!e||!e.type)return null;switch(e.type){case ve.SET_TEXT:return{...e,id:kt(),payload:{oldText:e.payload.newText,newText:e.payload.oldText}};case ve.SET_ATTRIBUTE:return{...e,id:kt(),payload:{attrName:e.payload.attrName,oldValue:e.payload.newValue,newValue:e.payload.oldValue}};case ve.ADD_CLASS_TOKEN:return{...e,id:kt(),type:ve.REMOVE_CLASS_TOKEN};case ve.REMOVE_CLASS_TOKEN:return{...e,id:kt(),type:ve.ADD_CLASS_TOKEN};case ve.SET_CLASS_LIST:return{...e,id:kt(),payload:{oldClassStr:e.payload.newClassStr,newClassStr:e.payload.oldClassStr,additions:e.payload.removals,removals:e.payload.additions}};case ve.DELETE_NODE:return{...e,id:kt(),type:ve.INSERT_NODE,payload:{html:e.payload.outerHTML,parentAddress:e.payload.parentAddress||null,siblingIndex:e.payload.siblingIndex??-1}};case ve.REPLACE_HTML:return{...e,id:kt(),payload:{oldHTML:e.payload.newHTML,newHTML:e.payload.oldHTML}};case ve.MOVE_BEFORE:case ve.MOVE_AFTER:return{...e,id:kt(),payload:{fromIndex:e.payload.toIndex,toIndex:e.payload.fromIndex}};case ve.FALLBACK:return null;default:return null}}function ka(e){var t,s,n,o,i,a,r,l,c,u,p,d,v;if(!e)return{valid:!1,reason:"Operation is null"};if(!e.type)return{valid:!1,reason:"Missing operation type"};if(!e.id)return{valid:!1,reason:"Missing operation ID"};if(e.type===ve.FALLBACK)return{valid:!0};if(!e.address)return{valid:!1,reason:"Missing source address"};switch(e.type){case ve.SET_TEXT:if(typeof((t=e.payload)==null?void 0:t.newText)!="string")return{valid:!1,reason:"SET_TEXT requires payload.newText"};break;case ve.SET_ATTRIBUTE:if(!((s=e.payload)!=null&&s.attrName))return{valid:!1,reason:"SET_ATTRIBUTE requires payload.attrName"};break;case ve.ADD_CLASS_TOKEN:case ve.REMOVE_CLASS_TOKEN:if(!((n=e.payload)!=null&&n.token))return{valid:!1,reason:`${e.type} requires payload.token`};break;case ve.SET_CLASS_LIST:if(!Array.isArray((o=e.payload)==null?void 0:o.additions)||!Array.isArray((i=e.payload)==null?void 0:i.removals))return{valid:!1,reason:"SET_CLASS_LIST requires payload.additions and payload.removals arrays"};break;case ve.DELETE_NODE:if(!((a=e.payload)!=null&&a.outerHTML))return{valid:!1,reason:"DELETE_NODE requires payload.outerHTML"};break;case ve.INSERT_NODE:if(!((r=e.payload)!=null&&r.html))return{valid:!1,reason:"INSERT_NODE requires payload.html"};if(typeof((l=e.payload)==null?void 0:l.siblingIndex)!="number"||e.payload.siblingIndex<0)return{valid:!1,reason:"INSERT_NODE requires payload.siblingIndex (>= 0) for deterministic reinsertion"};if(!((c=e.payload)!=null&&c.parentAddress))return{valid:!1,reason:"INSERT_NODE requires payload.parentAddress for reinsertion target"};break;case ve.REPLACE_HTML:if(!((u=e.payload)!=null&&u.oldHTML)||!((p=e.payload)!=null&&p.newHTML))return{valid:!1,reason:"REPLACE_HTML requires payload.oldHTML and payload.newHTML"};break;case ve.MOVE_BEFORE:case ve.MOVE_AFTER:if(typeof((d=e.payload)==null?void 0:d.fromIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.fromIndex`};if(typeof((v=e.payload)==null?void 0:v.toIndex)!="number")return{valid:!1,reason:`${e.type} requires payload.toIndex`};break}return{valid:!0}}function Ea(e){return{[ve.SET_TEXT]:"Text edit",[ve.SET_ATTRIBUTE]:"Attribute change",[ve.ADD_CLASS_TOKEN]:"Add class",[ve.REMOVE_CLASS_TOKEN]:"Remove class",[ve.SET_CLASS_LIST]:"Style change",[ve.MOVE_BEFORE]:"Move element",[ve.MOVE_AFTER]:"Move element",[ve.INSERT_NODE]:"Insert element",[ve.DELETE_NODE]:"Delete element",[ve.REPLACE_HTML]:"Source edit",[ve.FALLBACK]:"Legacy edit"}[e]||e}var el=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),tl=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]);function no(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function sl(e,t,s){let n=no(e,t);if(!n)return null;if(tl.has(s)||n.trimEnd().endsWith("/>"))return{element:n,startIndex:t,endIndex:t+n.length};let o=t+n.length,i=new RegExp(`<${s}[\\s>]`,"gi"),a=new RegExp(`</${s}\\s*>`,"gi"),r=1,l=o,c=Math.min(e.length,t+5e4);for(;l<c&&r>0;){i.lastIndex=l,a.lastIndex=l;let u=i.exec(e),p=a.exec(e);if(!p)return null;let d=u?u.index:1/0,v=p.index;d<v&&d<c?(r++,l=d+u[0].length):(r--,l=v+p[0].length)}return r!==0?null:{element:e.substring(t,l),startIndex:t,endIndex:l}}function oo(e,t){if(!t)return null;let s=t.lastIndexOf(":");if(s===-1)return null;let n=parseInt(t.substring(s+1),10);if(isNaN(n)||n<0)return null;let o=/<([a-z][a-z0-9]*)[\s>]/gi,i,a=0;for(;(i=o.exec(e))!==null;){let r=i[1].toLowerCase();if(!(el.has(r)||e.substring(i.index,i.index+500).includes("data-vx-source"))){if(a===n){let c=sl(e,i.index,r);return c?{...c,tag:r}:null}a++}}return null}function xa(e,t,s,n){if(n==null){let a=new RegExp(`\\s+${t}=["'][^"']*["']`,"i");return a.test(e)?e.replace(a,""):null}let o=new RegExp(`(${t}=["'])([^"']*)(["'])`,"i");return e.match(o)?e.replace(o,`$1${n}$3`):s==null?e.replace(/>$/,` ${t}="${n}">`):null}function di(e,t){if(!e||!e.type)return{content:t,applied:!1,reason:"null or untyped operation"};let s=ka(e);if(!s.valid)return{content:t,applied:!1,reason:`validation failed: ${s.reason}`};if(e.type===ve.FALLBACK)return{content:t,applied:!1,reason:"fallback ops are not persistable via applyOp"};switch(e.type){case ve.SET_TEXT:return gp(e,t);case ve.SET_ATTRIBUTE:return fp(e,t);case ve.SET_CLASS_LIST:return hp(e,t);case ve.REPLACE_HTML:return bp(e,t);case ve.DELETE_NODE:return yp(e,t);case ve.INSERT_NODE:return xp(e,t);default:return{content:t,applied:!1,reason:`unsupported op type: ${e.type}`}}}function gp(e,t){var i;let{oldText:s,newText:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=oo(t,o);if(a){let r=no(t,a.startIndex);if(r&&!tl.has(a.tag)){let l=a.element.lastIndexOf("</");if(l>r.length){let c=a.element.substring(r.length,l);if(!(s&&li(c)!==li(s))){let u=a.element.substring(l),p=r+n+u;return{content:t.substring(0,a.startIndex)+p+t.substring(a.endIndex),applied:!0,strategy:"nodeKey"}}}}}}if(s){let a=t.split(s).length-1;return a===0?{content:t,applied:!1,reason:"oldText not found in source"}:a>1?{content:t,applied:!1,reason:"ambiguous: oldText appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data (no nodeKey, no oldText)"}}function fp(e,t){var a;let{attrName:s,oldValue:n,newValue:o}=e.payload,i=(a=e.address)==null?void 0:a.nodeKey;if(i){let r=oo(t,i);if(r){let l=no(t,r.startIndex);if(l)if(n!=null){let c=l.includes(`${s}="${n}"`),u=l.includes(`${s}='${n}'`);if(!(!c&&!u)){let p=xa(l,s,n,o);if(p!==null)return{content:t.substring(0,r.startIndex)+p+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}else{let c=xa(l,s,n,o);if(c!==null)return{content:t.substring(0,r.startIndex)+c+t.substring(r.startIndex+l.length),applied:!0,strategy:"nodeKey"}}}}if(n!=null){let r=`${s}="${n}"`,l=t.split(r).length-1;if(l===0){let c=`${s}='${n}'`,u=t.split(c).length-1;return u===0?{content:t,applied:!1,reason:`attribute ${s}="${n}" not found`}:u>1?{content:t,applied:!1,reason:`ambiguous: ${s}='${n}' appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}='${Yr(n)}'`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(c,`${s}='${o}'`),applied:!0,strategy:"contentMatch"}}return l>1?{content:t,applied:!1,reason:`ambiguous: ${s}="${n}" appears multiple times`}:o===null?{content:t.replace(new RegExp(`\\s*${s}="${Yr(n)}"`),""),applied:!0,strategy:"contentMatch"}:{content:t.replace(r,`${s}="${o}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_attribute"}}function hp(e,t){var i;let{oldClassStr:s,newClassStr:n}=e.payload,o=(i=e.address)==null?void 0:i.nodeKey;if(o){let a=oo(t,o);if(a){let r=no(t,a.startIndex);if(r&&!(s&&!r.includes(`class="${s}"`)&&!r.includes(`class='${s}'`))){let l=xa(r,"class",s,n);if(l!==null)return{content:t.substring(0,a.startIndex)+l+t.substring(a.startIndex+r.length),applied:!0,strategy:"nodeKey"}}}}if(s){let a=`class="${s}"`,r=t.split(a).length-1;return r===0?{content:t,applied:!1,reason:`class="${s}" not found in source`}:r>1?{content:t,applied:!1,reason:`ambiguous: class="${s}" appears multiple times`}:{content:t.replace(a,`class="${n}"`),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for set_class_list"}}function bp(e,t){let{oldHTML:s,newHTML:n}=e.payload,o=t.split(s).length-1;return o===0?{content:t,applied:!1,reason:"oldHTML not found in source"}:o>1?{content:t,applied:!1,reason:"ambiguous: oldHTML appears multiple times"}:{content:t.replace(s,n),applied:!0,strategy:"contentMatch"}}function yp(e,t){var o;let{outerHTML:s}=e.payload,n=(o=e.address)==null?void 0:o.nodeKey;if(n){let i=oo(t,n);if(i&&!(s&&li(i.element)!==li(s)))return{content:t.substring(0,i.startIndex)+t.substring(i.endIndex),applied:!0,strategy:"nodeKey"}}if(s){let i=t.split(s).length-1;return i===0?{content:t,applied:!1,reason:"element outerHTML not found in source"}:i>1?{content:t,applied:!1,reason:"ambiguous: element outerHTML appears multiple times"}:{content:t.replace(s,""),applied:!0,strategy:"contentMatch"}}return{content:t,applied:!1,reason:"no targeting data for delete_node"}}function xp(e,t){let{html:s,parentAddress:n,siblingIndex:o}=e.payload;if(!(n!=null&&n.nodeKey))return{content:t,applied:!1,reason:"insert_node requires parentAddress.nodeKey"};let i=oo(t,n.nodeKey);if(!i)return{content:t,applied:!1,reason:"parent element not found by nodeKey"};let a=no(t,i.startIndex);if(!a)return{content:t,applied:!1,reason:"cannot parse parent opening tag"};let r=i.startIndex+a.length,l=i.element.lastIndexOf("</");if(l<=a.length)return{content:t,applied:!1,reason:"cannot determine parent inner content"};let c=i.element.substring(a.length,l),u=i.startIndex+a.length,p=/<([a-z][a-z0-9]*)[\s>]/gi,d,v=0,m=0;for(;(d=p.exec(c))!==null;){let g=d[1].toLowerCase();if(el.has(g))continue;if(v===o){m=d.index;break}let f=sl(c,d.index,g);f&&(p.lastIndex=f.endIndex),v++}v<o&&(m=c.length);let b=u+m;return{content:t.substring(0,b)+s+t.substring(b),applied:!0,strategy:"nodeKey"}}function Yr(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function li(e){return(e||"").replace(/\s+/g," ").trim()}var nl=50,Et=[],as=[],wp=new Set;function io(e,t){if(!e)return!1;let s=Qr(e);if(!s)return console.warn("[VX History] Op is not invertible \u2014 skipping history entry:",e.type,e.id),!1;let n=ka(s);return n.valid?(Et.push({forwardOp:e,inverseOp:s,timestamp:Date.now(),filePath:t||e.filePath||""}),Et.length>nl&&(Et=Et.slice(Et.length-nl)),as=[],ci(),!0):(console.warn("[VX History] Inverse op failed validation \u2014 skipping:",n.reason),!1)}function ol(){return Et.length===0?null:Et[Et.length-1]}function il(){if(Et.length===0)return null;let e=Et.pop();return as.push(e),ci(),e}function al(){return as.length===0?null:as[as.length-1]}function rl(){if(as.length===0)return null;let e=as.pop();return Et.push(e),ci(),e}function $a(e){let t=Et.length>0||as.length>0;Et=[],as=[],t&&console.info("[VX History] Cleared:",e),ci()}function ci(){for(let e of wp)try{e()}catch(t){console.error("[VX History] Listener error:",t)}}var dt=!1,tt=null,ct=null,Zs=[],pi=!1,Ca=[],kp=200,ll=!1,$n=0,Oe={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function Aa(){dt=!dt,Bl(),fe({type:"vx-editor:toggle",active:dt}),dt||(mt(),gi(),$t(),Nt(),tt=null,ps=!1)}function ro(){return dt}function hl(){return dt&&tt!==null}function Pa(){return!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")}function Je(){let e=!!document.getElementById("vx-style-panel")||!!document.getElementById("vx-ai-panel")||!!document.querySelector(".vx-modal-overlay")||!!document.querySelector(".vx-source-editor")||ps;fe({type:"vx-editor:set-panel-lock",locked:e})}function Ra(){$t(),Nt()}function mi(){return st?(st.abort(),st=null,Ss(),It&&(C.post("/ai/cancel-generation",{prompt_id:It}).catch(()=>{}),It=null),!0):!1}var ui=null;function bl(e){var o;Ss();let t=document.createElement("div");t.className="vs-inline-ai-overlay",t.id="vx-ai-gen-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=Date.now(),n=t.querySelector("#vx-ai-gen-timer");ui=setInterval(()=>{let i=Math.floor((Date.now()-s)/1e3);n&&(n.textContent=i<60?`${i}s`:`${Math.floor(i/60)}m ${i%60}s`)},1e3),(o=t.querySelector("#vx-ai-gen-stop"))==null||o.addEventListener("click",()=>{mi()}),fe({type:"vx-editor:show-ai-overlay"})}function En(e,t){let s=document.getElementById("vx-ai-gen-step");if(s&&e&&(s.textContent=e),t!==void 0&&t>0){let n=document.getElementById("vx-ai-gen-token-dot"),o=document.getElementById("vx-ai-gen-tokens");n&&(n.style.display=""),o&&(o.textContent=`${t.toLocaleString()} tokens`)}}function Ss(){ui&&(clearInterval(ui),ui=null);let e=document.getElementById("vx-ai-gen-overlay");e&&(e.classList.remove("is-visible"),setTimeout(()=>e.remove(),250)),fe({type:"vx-editor:hide-ai-overlay"})}function Ln(){dt&&(dt=!1,Bl(),fe({type:"vx-editor:toggle",active:!1}),mt(),gi(),$t(),Nt(),tt=null,ps=!1)}function lo(){mt(),gi(),$t(),Nt(),tt=null,ct=null,ps=!1,fe({type:"vx-editor:deselect-from-parent"})}function yl(){if(ll)return;ll=!0,window.addEventListener("message",Ep),document.addEventListener("keydown",t=>{if(dt&&(t.metaKey||t.ctrlKey)&&t.key==="e"){let s=document.activeElement;if(s){let o=s.tagName;if(o==="INPUT"||o==="TEXTAREA"||o==="SELECT"||o==="BUTTON"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor"))return}let n=ct;n&&!ai(n)&&n.sourceFile&&(t.preventDefault(),to(n.sourceFile),mt())}}),document.addEventListener("keydown",t=>{if(!dt||!(t.metaKey||t.ctrlKey)||t.key!=="z")return;let s=document.activeElement;if(s){let n=s.tagName;if(n==="INPUT"||n==="TEXTAREA"||n==="SELECT"||s.isContentEditable||s.closest(".vs-modal, .vs-code-editor, .monaco-editor"))return}t.preventDefault(),t.shiftKey?hu():fu()});let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{ps&&xl(),$n>0?$n--:$a("preview iframe reloaded"),dt&&setTimeout(()=>fe({type:"vx-editor:toggle",active:!0}),200)})}function Ep(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":tt=e.data,ct=Xs(e.data.sourceAddress),$t(),Nt(),Cl(e.data);break;case"vx-editor:text-changed":vi(e.data),e.data.changeKind||(clearTimeout(vi._timer),(async()=>{for(;pi;)await new Promise(t=>setTimeout(t,50));await Promise.all([Sn(),new Promise(t=>setTimeout(t,400))]),fe({type:"vx-editor:text-save-complete"})})());break;case"vx-editor:source-edit-changed":_l(e.data);break;case"vx-editor:element-deleted":_a(e.data);break;case"vx-editor:deselect":mt(),gi(),$t(),Nt(),tt=null,ct=null;break;case"vx-editor:save-request":Sn();break;case"vx-editor:editing-started":$p(e.data);break;case"vx-editor:editing-ended":xl();break;case"vx-editor:selection-state":Cp(e.data);break;case"vx-editor:element-rect":Sp(e.data);break;case"vx-editor:richtext-link-request":$l();break;case"vx-editor:add-section-request":nu(e.data);break;case"vx-editor:section-moved":uu(e.data);break;case"vx-editor:bridge-ready":$n>0?$n--:$a("bridge re-initialized"),dt&&fe({type:"vx-editor:toggle",active:!0});break;case"vx-editor:source-edit-ready":Ap(e.data);break;case"vx-editor:escape-pressed":if(mi())break;if(Pa()){Ra();break}Ln();break}}var ps=!1,Da=!1,Cs=null,Cn={},$s=null,kn=[],Ta=null;function $p(e){ps=!0,Da=!!e.hasPhp,Cs=e.rect||null,Cn={},Ta=e.tagName||"P",mt(),Lp(),Je()}function xl(){ps=!1,Da=!1,Cs=null,Cn={},El(),Je()}function Cp(e){if(ps){if(e.elementRect&&(Cs=e.elementRect,wl()),!e.hasSelection){Cn={},$s=null,kn=[],dl();return}Cn=e.formatting||{},Ta=e.blockTag||Ta,$s=e.link||null,kn=e.linkClasses||[],dl()}}function Sp(e){ps&&e.rect&&(Cs=e.rect,wl())}function wl(){let e=document.getElementById("vx-richtext-toolbar");e&&kl(e)}function Lp(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),kl(e),Tp(e),e.classList.add("vx-rt-visible")}function kl(e){if(!Cs)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+Cs.left,o=s.top+Cs.top,i=Cs.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function Tp(e){var i;let t=Cn,s=Da;e.innerHTML=`<div class="vx-rt-actions">
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
  </div>`,e.querySelectorAll("[data-cmd]").forEach(a=>{a.addEventListener("click",r=>{r.stopPropagation();let l=a.dataset.cmd;if(l==="insertLink"){$l();return}fe({type:"vx-editor:richtext-command",command:l})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",a=>{a.stopPropagation(),fe({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",a=>{a.stopPropagation(),fe({type:"vx-editor:save-edit"})})}function dl(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=Cn,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function El(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function gi(){El()}function $l(){let e=$s?$s.href:"",t=$s?$s.target:"",s=$s&&$s.className||"",n=kn.length>0||!!s,o=`<option value=""${s?"":" selected"}>No class</option>`;if(kn.length>0){let p=kn.includes(s);o+=kn.map(d=>`<option value="${Mt(d)}"${s===d?" selected":""}>${nt(d)}</option>`).join(""),s&&!p&&(o+=`<option value="${Mt(s)}" selected>${nt(s)}</option>`)}else s&&(o+=`<option value="${Mt(s)}" selected>${nt(s)}</option>`);let i=document.createElement("div");i.className="vx-modal-overlay",i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>${e?"Edit":"Insert"} Link</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <div class="vx-form-group"><label class="vx-form-label">URL</label>
          <input type="url" id="vx-link-url" class="vx-form-input" value="${Mt(e)}" placeholder="https://" autocomplete="off" spellcheck="false">
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
  `,document.body.appendChild(i),i.offsetHeight,i.classList.add("vx-modal-visible"),Je(),Ml(i);let a=i.querySelector("#vx-link-url");setTimeout(()=>{a.focus(),a.select()},50);let r=()=>{i.classList.remove("vx-modal-visible"),i.__vxDestroyDrag&&i.__vxDestroyDrag(),setTimeout(()=>{i.remove(),Je()},200)};i.addEventListener("click",p=>{p.target===i&&r()}),i.querySelectorAll("[data-close]").forEach(p=>p.addEventListener("click",r));let l=i.querySelector("[data-remove]");l&&l.addEventListener("click",()=>{fe({type:"vx-editor:richtext-command",command:"removeLink"}),r()});let c=i.querySelector("[data-confirm]"),u=()=>{let p=a.value.trim();if(p){let d=i.querySelector("#vx-link-blank").checked,v=i.querySelector("#vx-link-class"),m=v?v.value:"";fe({type:"vx-editor:richtext-command",command:"insertLink",value:{url:p,targetBlank:d,linkClass:m}})}else fe({type:"vx-editor:richtext-command",command:"removeLink"});r()};c.addEventListener("click",u),a.addEventListener("keydown",p=>{p.key==="Enter"&&(p.preventDefault(),u()),p.key==="Escape"&&(p.preventDefault(),r())})}function Cl(e){var x,w;let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,canInlineEdit:i,hasImage:a}=e,r=document.getElementById("preview-iframe");if(!r)return;let l=r.getBoundingClientRect(),c=l.left+n.left+n.width/2,u=l.top+n.top-8,p=l.top+n.top+n.height+8;t.style.left=`${c}px`,u<120?(t.style.top=`${p}px`,t.classList.add("vx-tb-below")):(t.style.top=`${u}px`,t.classList.remove("vx-tb-below")),t.style.transform="";let v=ct,m=ai(v),b=qr(v),h=jr(v);if(!m){let k=(v==null?void 0:v.sourceFile)||"",E=k.length>0,I=(v==null?void 0:v.sourceKind)==="loop"?"Loop":"Dynamic PHP",N=((x=navigator.platform)==null?void 0:x.includes("Mac"))?"\u2318E":"Ctrl+E",j=E?`<span class="vx-tb-readonly-sep"></span><span class="vx-tb-readonly-file">${nt(k)}</span>`:"",W=E?`<div class="vx-tb-readonly-actions">
          <button class="vx-tb-btn-primary" data-action="open-code-editor" data-file="${nt(k)}" title="Open in Code Editor (${N})">
            Open in Code Editor
            <kbd>${N}</kbd>
          </button>
        </div>`:"";t.innerHTML=`
      <div class="vx-tb-readonly">
        <div class="vx-tb-readonly-header">
          <svg class="vx-tb-readonly-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span class="vx-tb-readonly-kind">${nt(I)}</span>
          ${j}
        </div>
        <p class="vx-tb-readonly-msg">${nt(h)}</p>
        ${W}
      </div>`,t.classList.add("vx-tb-visible"),E&&((w=t.querySelector('[data-action="open-code-editor"]'))==null||w.addEventListener("click",q=>{q.stopPropagation();let Y=q.currentTarget.dataset.file;to(Y),mt()}));return}let g="";b&&(v!=null&&v.sourceFile)&&(g+=`<div class="vx-tb-global-cue" title="Changes affect all pages that include this file">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span>Global \u2014 ${nt(v.sourceFile)}</span>
    </div>`),i&&s!=="IMG"&&(g+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"/><path d="M7 22h1a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4H7"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
      <span>Edit</span></button>`),a&&(g+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),g+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(g+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),v!=null&&v.sourceFile&&(g+=`<button class="vx-tb-btn" data-action="open-source" title="Edit source code" data-file="${nt(v.sourceFile)}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      <span>Source</span></button>`),g+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,g+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let f=fi(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${f}</div><div class="vx-tb-actions">${g}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(k=>{k.addEventListener("click",E=>{E.stopPropagation(),Ip(k.dataset.action,e)})})}function mt(){let e=document.getElementById("vx-context-toolbar");e&&(e.classList.remove("vx-tb-visible"),e.classList.remove("vx-tb-below"))}function fi(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function Ip(e,t){switch(e){case"edit-text":fe({type:"vx-editor:start-edit",mode:"text"}),mt();break;case"swap-image":iu(t);break;case"edit-style":Rp(t);break;case"edit-link":ru(t);break;case"open-source":{mt(),fe({type:"vx-editor:start-source-edit"});break}case"delete":Pp(t);break;case"ask-ai":su(t);break}}var en=null;function Mp(e){let t=e.replace(/>\s+</g,"><").trim();t=t.replace(/(<\/[^>]+>)(<)/g,`$1
$2`),t=t.replace(/(\/?>)(<[^/])/g,`$1
$2`);let s=t.split(`
`),n=0,o=[];for(let i of s){let a=i.trim();a&&(/^<\//.test(a)&&n>0&&n--,o.push("  ".repeat(n)+a),/^<[^/!][^>]*[^/]>$/.test(a)&&!/^<(br|hr|img|input|meta|link)/i.test(a)&&n++)}return o.join(`
`)}function _p(e,t,s){let n=t.lastIndexOf(":");if(n===-1)return null;let o=parseInt(t.substring(n+1),10);if(isNaN(o)||o<0)return null;let i=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),a=/<([a-z][a-z0-9]*)[\s>]/gi,r,l=0;for(;(r=a.exec(e))!==null;){let c=r[1].toLowerCase();if(!(i.has(c)||e.substring(r.index,r.index+500).includes("data-vx-source"))){if(l===o){let p=Ll(e,r.index,c);return p&&c===s.toLowerCase()?p:null}l++}}return null}function Bp(e,t){if(t<0)return null;let s=new Set(["html","head","body","script","style","link","meta","noscript","br","hr","wbr","col","colgroup","iframe","template","svg","path","circle","line","polyline","rect","ellipse","polygon","g","defs","use","symbol","clippath","mask"]),n=/<([a-z][a-z0-9]*)[\s>]/gi,o,i=0;for(;(o=n.exec(e))!==null;){let a=o[1].toLowerCase();if(!(s.has(a)||e.substring(o.index,o.index+500).includes("data-vx-source"))){if(i===t)return Ll(e,o.index,a);i++}}return null}function Sl(e,t){let s=t,n=!1,o=!1;for(;s<e.length;){let i=e[s];if(i==='"'&&!o)n=!n;else if(i==="'"&&!n)o=!o;else if(i===">"&&!n&&!o)return e.substring(t,s+1);if(s++,s-t>2e3)return null}return null}function Ll(e,t,s){let n=Sl(e,t);if(!n)return null;if(new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]).has(s)||n.trimEnd().endsWith("/>"))return n;let i=t+n.length,a=new RegExp(`<${s}[\\s>]`,"gi"),r=new RegExp(`</${s}\\s*>`,"gi"),l=1,c=i,u=Math.min(e.length,t+5e4);for(;c<u&&l>0;){a.lastIndex=c,r.lastIndex=c;let p=a.exec(e),d=r.exec(e);if(!d)return null;let v=p?p.index:1/0,m=d.index;v<m&&v<u?(l++,c=v+p[0].length):(l--,c=m+d[0].length)}return l!==0?null:e.substring(t,c)}async function Ap(e){var U,ne;ao(!1);let{html:t,tagName:s,rect:n,filePath:o,sourceAddress:i}=e,a=document.getElementById("preview-iframe");if(!a||!t)return;let r=a.getBoundingClientRect(),l=450,c=180,u=r.width-40,p=Math.max(l,Math.min(n.width+40,u)),d=Math.max(c,Math.min(n.height+60,400)),v=r.left+n.left+n.width/2-p/2,m=r.top+n.top;v=Math.max(r.left+10,Math.min(v,r.right-p-10)),m=Math.max(r.top+10,Math.min(m,r.bottom-d-10));let b=document.createElement("div");b.className="vx-source-editor",b.style.left=`${v}px`,b.style.top=`${m}px`,b.style.width=`${p}px`,b.style.height=`${d}px`;let g=((U=navigator.platform)==null?void 0:U.includes("Mac"))?"\u2318S":"Ctrl+S";b.innerHTML=`
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
  `,document.body.appendChild(b),Je();let f=b.querySelector(".vx-source-header"),x=null;f.addEventListener("mousedown",se=>{se.target.closest("button")||(x={x:se.clientX-b.offsetLeft,y:se.clientY-b.offsetTop},se.preventDefault())});let w=se=>{x&&(b.style.left=`${se.clientX-x.x}px`,b.style.top=`${se.clientY-x.y}px`)},k=()=>{x=null};document.addEventListener("mousemove",w),document.addEventListener("mouseup",k);let E=b.querySelector(".vx-source-body"),I=(i==null?void 0:i.sourceFile)||o||Kt(),T=(i==null?void 0:i.nodeKey)||"",N=null;if(T)try{let se=await C.get(`/files/content?path=${encodeURIComponent(I)}`);se.ok&&((ne=se.data)!=null&&ne.content)&&(N=_p(se.data.content,T,s))}catch{}let j=!N,W=N||t,q=Mp(W),Y=b.querySelector('[data-action="apply"]'),ee=b.querySelector(".vx-source-warn"),H=!0,S=null;j&&(ee.textContent="\u2139 Live HTML \u2014 save may not work for this element",ee.hidden=!1,ee.style.color="var(--vs-text-ghost)",ee.style.background="transparent");function P(se){let ae=Tl(se,s);if(ae){if(ee.style.color="",ee.style.background="",ee.textContent=`\u26A0 ${ae.message}`,ee.hidden=!1,Y.disabled=!0,Y.classList.add("vx-source-btn-disabled"),H=!1,S&&ae.line)try{let ce=S.getModel();if(ce){let he=window.monaco||globalThis.monaco;he!=null&&he.editor&&he.editor.setModelMarkers(ce,"preflight",[{startLineNumber:ae.line,startColumn:1,endLineNumber:ae.line,endColumn:ce.getLineMaxColumn(ae.line),message:ae.message,severity:he.MarkerSeverity.Error}])}}catch{}}else if(j?(ee.textContent="\u2139 Live HTML \u2014 save may not work for this element",ee.hidden=!1,ee.style.color="var(--vs-text-ghost)",ee.style.background="transparent"):(ee.hidden=!0,ee.style.color="",ee.style.background=""),Y.disabled=!1,Y.classList.remove("vx-source-btn-disabled"),H=!0,S)try{let ce=S.getModel(),he=window.monaco||globalThis.monaco;ce&&(he!=null&&he.editor)&&he.editor.setModelMarkers(ce,"preflight",[])}catch{}return H}let F=null;try{let se=await ri();if(!(se!=null&&se.editor))throw new Error("Monaco unavailable");let ae=Js();se.editor.setTheme(ae),F=se.editor.create(E,{value:q,language:"html",theme:ae,automaticLayout:!0,minimap:{enabled:!1},fontSize:12,lineHeight:18,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",lineNumbers:"off",glyphMargin:!1,folding:!1,renderLineHighlight:"none",overviewRulerLanes:0,hideCursorInOverviewRuler:!0,overviewRulerBorder:!1,scrollbar:{verticalScrollbarSize:6,horizontalScrollbarSize:6},padding:{top:8,bottom:8},fontFamily:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"}),S=F,F.addCommand(se.KeyMod.CtrlCmd|se.KeyCode.KeyS,()=>{H&&Sa()}),F.addCommand(se.KeyCode.Escape,()=>{ao(!1)});let ce=null;F.onDidChangeModelContent(()=>{clearTimeout(ce),ce=setTimeout(()=>{P(F.getValue())},400)}),setTimeout(()=>{F.focus(),fe({type:"vx-editor:source-editor-mounted"})},100)}catch{E.innerHTML=`<textarea class="vx-source-fallback" spellcheck="false">${nt(q)}</textarea>`;let se=E.querySelector("textarea");se.addEventListener("keydown",ce=>{ce.key==="Escape"&&(ce.preventDefault(),ao(!1)),(ce.metaKey||ce.ctrlKey)&&ce.key==="s"&&(ce.preventDefault(),H&&Sa())});let ae=null;se.addEventListener("input",()=>{clearTimeout(ae),ae=setTimeout(()=>P(se.value),400)}),setTimeout(()=>{se.focus(),fe({type:"vx-editor:source-editor-mounted"})},100)}Y.addEventListener("click",()=>{H&&Sa()}),b.querySelector('[data-action="cancel"]').addEventListener("click",()=>ao(!1)),en={container:b,monacoInstance:F,originalHTML:W,formattedHTML:q,tagName:s,sourceFile:I,cleanupDrag:()=>{document.removeEventListener("mousemove",w),document.removeEventListener("mouseup",k)}},requestAnimationFrame(()=>b.classList.add("vx-source-visible"))}async function Sa(){var p,d;if(!en||(p=window.demoGuard)!=null&&p.call(window))return;let{monacoInstance:e,container:t,tagName:s,originalHTML:n,formattedHTML:o,sourceFile:i,cleanupDrag:a}=en,r;if(e)r=e.getValue().trim();else{let v=t.querySelector("textarea");r=((d=v==null?void 0:v.value)==null?void 0:d.trim())||""}let l=Tl(r,s);if(l){let v=t.querySelector(".vx-source-warn");v&&(v.textContent=`\u26A0 ${l.message}`,v.hidden=!1);return}if(r===o){ao(!1);return}if(e)try{e.dispose()}catch{}a(),t.classList.remove("vx-source-visible"),setTimeout(()=>t.remove(),200),en=null;let c=Zr(ct,n,r,i);me(c,"created"),fe({type:"vx-editor:source-edit-saving"});let[u]=await Promise.all([_l({filePath:i,originalHTML:n,newHTML:r}),new Promise(v=>setTimeout(v,500))]);if(me(c,u?"persisted":"failed"),u)if(/\<\?(?:php\b|=)/.test(r)){fe({type:"vx-editor:end-source-edit",apply:!1});let m=document.getElementById("preview-iframe");m&&m.contentWindow.location.reload()}else fe({type:"vx-editor:end-source-edit",apply:!0,html:r});else fe({type:"vx-editor:end-source-edit",apply:!1})}function Tl(e,t){if(!e||!e.trim())return{message:"HTML is empty"};let s=e.trim();if(/<script\b/i.test(s))return{message:"<script> elements are not allowed"};if(/<iframe\b/i.test(s))return{message:"<iframe> elements are not allowed"};if(/\bon[a-z]+\s*=/i.test(s))return{message:"Inline event handlers (on*=) are not allowed"};let n=document.createElement("template");n.innerHTML=s;let o=n.content,i=Array.from(o.childNodes).filter(d=>d.nodeType===Node.ELEMENT_NODE);if(i.length===0)return{message:"No HTML element found"};if(i.length>1)return{message:`Expected 1 root element, found ${i.length}`};for(let d of o.childNodes)if(d.nodeType===Node.TEXT_NODE&&d.textContent.trim())return{message:"Text found outside root element \u2014 check for broken tags"};let a=i[0],r=(t||"").toUpperCase();if(r&&a.tagName!==r)return{message:`Root changed: <${r.toLowerCase()}> \u2192 <${a.tagName.toLowerCase()}>`,line:1};if(/\<\?(?:php\s+)?(?:foreach|for|while|if|else|elseif|switch)\b/.test(s)||/\<\?(?:php\s+)?(?:endforeach|endfor|endwhile|endif|endswitch)\b/.test(s))return null;let c=new Set(["area","base","br","col","embed","hr","img","input","link","meta","source","track","wbr"]),u=s.split(`
`),p=[];for(let d=0;d<u.length;d++){let v=u[d],m=/<([a-z][a-z0-9]*)\b(?:[^<>"']|"[^"]*"|'[^']*')*(\/?)\s*>/gi,b;for(;(b=m.exec(v))!==null;){let g=b[1].toLowerCase(),f=b[2]==="/";c.has(g)||f||p.push({tag:g,line:d+1})}let h=/<\/([a-z][a-z0-9]*)\s*>/gi;for(;(b=h.exec(v))!==null;){let g=b[1].toLowerCase();if(c.has(g))continue;if(p.length===0)return{message:`Extra </${g}> \u2014 no matching opening tag`,line:d+1,tag:g};let f=p[p.length-1];if(f.tag!==g)return{message:`Misnested: </${g}> but <${f.tag}> is still open (line ${f.line})`,line:d+1,tag:g};p.pop()}}if(p.length>0){let d=p[p.length-1];return{message:`Unclosed <${d.tag}> (line ${d.line})`,line:d.line,tag:d.tag}}return null}function ao(e,t){if(!en)return;let{container:s,monacoInstance:n,cleanupDrag:o}=en;if(fe({type:"vx-editor:end-source-edit",apply:!!e,html:e?t:void 0}),n)try{n.dispose()}catch{}o(),s.classList.remove("vx-source-visible"),setTimeout(()=>{s.remove(),Je()},200),en=null}function Pp(e){mt();let t=fi(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${nt(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible")),Je();let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>{n.remove(),Je()},200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),$e(n,o),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{var a;(a=window.demoGuard)!=null&&a.call(window)||(fe({type:"vx-editor:delete-element"}),o())})}var Ge=new Set,cs="",Qs=null,hi="text",rs="padding",ds="all",tn="all",ls="tl",sn="",Ls=!1;function $t({revertUnsaved:e=!0}={}){e&&Ls&&cs&&(fe({type:"vx-editor:update-classes",classes:cs.split(" ").filter(Boolean),silent:!0}),Ge=new Set(cs.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>{t.remove(),Je()},200)),Ls=!1,Qs=null,hi="text",rs="padding",ds="all",tn="all",ls="tl",sn=""}function Rp(e){mt(),$t();let t=(e.classList||[]).filter(o=>o.trim());Ge=new Set(t),cs=t.join(" "),Ls=!1,Qs=null,hi=gu(t),rs="padding",ds="all",tn="all",ls="tl",sn="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${fi(e.tagName,t)}</span>
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
      ${Ia()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),Ba(s),s.__vxOnResize=()=>Ba(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=Ha(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),Qs=null,xt(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>$t()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),$t())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{Ge=new Set(cs.split(" ").filter(Boolean)),Ls=!1,fe({type:"vx-editor:update-classes",classes:[...Ge],silent:!0}),xt(Ma())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>tu(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(sn=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=Ia(),xt(Ma()))}),xt("typography"),Je()}function Ia(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=sn===t.id,n=t.id?[...Ge].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function Ma(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function xt(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:Dp,spacing:Hp,colors:Np,layout:Op,borders:jp,effects:qp,classes:Fp};t.innerHTML=(s[e]||s.classes)(),eu(t);let n=t.querySelector(".vx-cm-active");n&&n.scrollIntoView({block:"nearest"})}function Dp(){let e=Re(/^font-(sans|serif|mono)$/)||"",t=Re(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=Re(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=Re(/^text-(left|center|right|justify)$/)||"text-left",o=Re(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=Re(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=Re(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",r=Re(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${We("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${We("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,Oe.sizes.map(l=>({label:l,value:`text-${l}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${We("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,Oe.weights.map(l=>({label:l,value:`font-${l}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${zp(Oe.aligns.map(l=>({value:`text-${l}`,label:l,icon:Xp(l)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${We("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,Oe.leadings.map(l=>({label:l,value:`leading-${l}`})))}
        ${We("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,Oe.trackings.map(l=>({label:l,value:`tracking-${l}`})))}
        ${We("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,Oe.transforms.map(l=>({label:l,value:l})))}
        ${We("Decoration","^(no-underline|underline|line-through)$",r,Oe.decorations.map(l=>({label:l,value:l})))}
      </div>
    </div>
  `}function Hp(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[rs]||(rs="padding"),e[rs].prefixes[ds]||(ds="all");let t=e[rs],s=t.prefixes[ds],n=Wp(s),o=Kp(s)||"",i=rs==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${Il(Object.keys(e).map(a=>({value:a,label:e[a].label})),rs,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${ds===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${cl(a)}">
            ${Yp(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${cl(ds)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${Oe.compactSpacings.map(a=>{let r=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${nn(r)?" vx-sp-pill-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${nn(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function Np(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=hi||"text",s=t,n=Gp(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${Oe.specialColors.map(a=>{let r=`${s}-${a.name}`,l=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,c=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${nn(r)?" vx-sp-dot-active":""}" data-set="${r}" data-pattern="${n}" style="${l}${c}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=["50","100","200","300","400","500","600","700","800","900","950"];return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-matrix">
      ${Oe.colors.map(a=>`
        <div class="vx-cm-row" title="${a.name}">
          ${i.map(r=>{let l=`${s}-${a.name}-${r}`;return`<button class="vx-cm-cell${nn(l)?" vx-cm-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false" style="background:${a.shades[r]}" title="${a.name}-${r}"></button>`}).join("")}
        </div>
      `).join("")}
    </div>
  </div>`,o}function Op(){let e=Vp(),t=Re(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=Re(/^gap(?:-[xy])?-/)||"",a=Re(/^grid-cols-\d+$/)||"",r=Re(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${Up(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${We("Direction","^flex-(row|col|row-reverse|col-reverse)$",Re(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${We("Justify","^justify-(start|center|end|between|around|evenly)$",Re(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${We("Align","^items-(start|center|end|stretch|baseline)$",Re(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${We("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...Oe.gaps.map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${We("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...Oe.gridCols.map(l=>({label:l,value:`grid-cols-${l}`}))])}
          ${We("Rows","^grid-rows-\\d+$",r,[{label:"Auto",value:""},...Oe.gridRows.map(l=>({label:l,value:`grid-rows-${l}`}))])}
          ${We("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...Oe.gaps.slice(1).map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${We("Position","^(static|relative|absolute|fixed|sticky)$",t,Oe.positions.map(l=>({label:l,value:l})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${We("Top","^top-",Re(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Oe.coordinates.map(l=>({label:l,value:`top-${l}`})))}
          ${We("Right","^right-",Re(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Oe.coordinates.map(l=>({label:l,value:`right-${l}`})))}
          ${We("Bottom","^bottom-",Re(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Oe.coordinates.map(l=>({label:l,value:`bottom-${l}`})))}
          ${We("Left","^left-",Re(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Oe.coordinates.map(l=>({label:l,value:`left-${l}`})))}
        </div>
      </div>
    `:""}
  `}function jp(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=tn==="all"?"all":ls;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${Oe.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${nn(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${We("Style","^border-(solid|dashed|dotted|double|none)$",Re(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...Oe.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${Il([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],tn==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${ls==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${ls==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${ls==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${ls==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${tn==="all"?"ALL":ls.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${Oe.radii.map(s=>{let n=Jp(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${nn(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${Zp(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function qp(){let e=Qp();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${nn(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function Fp(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...Ge].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function We(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${Mt(o.value)}"${s===o.value?" selected":""}>${nt(o.label)}</option>`).join("")}
    </select>
  </div>`}function Il(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${nt(i.label)}</button>`).join("")}
  </div>`}function zp(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${Mt(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function Up(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function Vp(){let e=Re(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function Wp(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function Gp(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function Kp(e){let t=Re(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function cl(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function Yp(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function Xp(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function Jp(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function Zp(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function Qp(){let e=Re(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function nn(e){let t=sn;return Ge.has(t?t+":"+e:e)}function La(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=sn,i=o?o+":":"",a=t?new RegExp(t):null,r=e?i+e:"",l=!!r&&Ge.has(r);if(a)for(let u of[...Ge])if(o){if(u.startsWith(i)){let p=u.slice(i.length);a.test(p)&&Ge.delete(u)}}else!/^(sm|md|lg|xl|2xl):/.test(u)&&a.test(u)&&Ge.delete(u);r&&(!s||!l)&&Ge.add(r),Ls=!0,fe({type:"vx-editor:update-classes",classes:[...Ge],silent:!0});let c=document.getElementById("vx-sp-breakpoints");if(c&&(c.innerHTML=Ia()),n){let u=document.querySelector(".vx-color-matrix"),p=u?u.scrollTop:0;if(xt(Ma()),p){let d=document.querySelector(".vx-color-matrix");d&&(d.scrollTop=p)}}}function Re(e){let t=sn;for(let s of Ge)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function eu(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";La(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";La(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{Qs=Qs===n.dataset.family?null:n.dataset.family,xt("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{Qs=null,xt("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{hi=n.dataset.cprop||"text",Qs=null,xt("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{rs=n.dataset.spaceMode||"padding",ds="all",xt("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{ds=n.dataset.spaceSide||"all",xt("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{tn=n.dataset.radiusMode==="corners"?"corners":"all",xt("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{ls=n.dataset.radiusCorner||"tl",tn="corners",xt("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");La(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>xt("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{Ge.add(i)}),Ls=!0,fe({type:"vx-editor:update-classes",classes:[...Ge],silent:!0}),s.value="",xt("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;Ge.delete(i),Ls=!0,fe({type:"vx-editor:update-classes",classes:[...Ge],silent:!0}),o.remove()}}})}async function tu(e){let t=[...Ge].join(" ");if(t===cs){$t({revertUnsaved:!1});return}let s=new Set(cs.split(" ").filter(Boolean)),n=new Set(t.split(" ").filter(Boolean)),o=[...n].filter(l=>!s.has(l)),i=[...s].filter(l=>!n.has(l)),a=Xs(e.sourceAddress||ct),r=Xr(a,cs,t,o,i,e.filePath);me(r,"created"),Zs.push({type:"class-change",filePath:e.filePath,originalHTML:`class="${cs}"`,newHTML:`class="${t}"`,additions:o,removals:i,timestamp:Date.now(),_op:r}),Ls=!1,$t({revertUnsaved:!1}),J("Saving & compiling\u2026"),await Sn(),fe({type:"vx-editor:update-classes",classes:[...Ge],silent:!0}),setTimeout(()=>{let l=document.getElementById("preview-iframe");l&&l.contentWindow&&l.contentWindow.postMessage("voxelsite:reload","*")},500)}function Ha(e,t){let s=!1,n,o,i,a,r=!1,l=p=>{if(p.target.closest("button, input, select"))return;s=!0;let d=p.touches?p.touches[0]:p;n=d.clientX,o=d.clientY;let v=e.getBoundingClientRect();i=v.left,a=v.top,t.style.cursor="grabbing",p.preventDefault(),r||(r=!0,document.addEventListener("mousemove",c),document.addEventListener("touchmove",c,{passive:!1}),document.addEventListener("mouseup",u),document.addEventListener("touchend",u))},c=p=>{if(!s)return;let d=p.touches?p.touches[0]:p,v=12,m=e.getBoundingClientRect(),b=m.width||300,h=m.height||500,g=i+d.clientX-n,f=a+d.clientY-o,x=v,w=Math.max(v,window.innerWidth-b-v),k=52,E=Math.max(k,window.innerHeight-h-v),I=Math.min(Math.max(g,x),w),T=Math.min(Math.max(f,k),E);e.style.left=`${I}px`,e.style.top=`${T}px`,e.style.right="auto"},u=()=>{s&&(s=!1,t.style.cursor="",r&&(r=!1,document.removeEventListener("mousemove",c),document.removeEventListener("touchmove",c),document.removeEventListener("mouseup",u),document.removeEventListener("touchend",u)))};return t.addEventListener("mousedown",l),t.addEventListener("touchstart",l,{passive:!1}),()=>{t.removeEventListener("mousedown",l),t.removeEventListener("touchstart",l),r&&(document.removeEventListener("mousemove",c),document.removeEventListener("touchmove",c),document.removeEventListener("mouseup",u),document.removeEventListener("touchend",u))}}function Ml(e){let t=e.querySelector(".vx-modal"),s=e.querySelector(".vx-modal-header");if(!t||!s)return;s.style.cursor="grab";let n=!1,o=()=>{if(n)return;n=!0;let r=t.getBoundingClientRect();e.style.display="block",t.style.position="fixed",t.style.left=`${r.left}px`,t.style.top=`${r.top}px`,t.style.margin="0"},i=r=>{r.target.closest("button, input, select")||o()};s.addEventListener("mousedown",i,{capture:!0}),s.addEventListener("touchstart",i,{capture:!0,passive:!0});let a=Ha(t,s);e.__vxDestroyDrag=()=>{s.removeEventListener("mousedown",i,{capture:!0}),s.removeEventListener("touchstart",i,{capture:!0}),a()}}var st=null,It=null;function Nt(){let e=document.getElementById("vx-ai-panel");e&&(st&&(st.abort(),st=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>{e.remove(),Je()},180))}function su(e){mt(),$t(),Nt();let t=fi(e.tagName,e.classList),s=document.createElement("div");s.id="vx-ai-panel",s.className="vx-ai-panel",s.tabIndex=-1,s.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${nt(t)}</span>
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
    </div>`,document.body.appendChild(s),fl(s,null,e.rect),s.__vxOnResize=()=>fl(s,null,e.rect),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-ai-visible")),s.__vxDestroyDrag=Ha(s,s.querySelector("#vx-ai-drag-handle"));let n=s.querySelector("#vx-ai-input"),o=s.querySelector("#vx-ai-send"),i=s.querySelector("#vx-ai-cancel-btn"),a=s.querySelector("#vx-ai-status"),r=s.querySelector("#vx-ai-status-text"),l=s.querySelector("#vx-ai-close");setTimeout(()=>n==null?void 0:n.focus(),200),Je(),l.addEventListener("click",()=>Nt()),s.addEventListener("keydown",v=>{v.key==="Escape"&&(v.preventDefault(),v.stopPropagation(),Nt())});let c=()=>{n.style.height="auto";let v=parseFloat(getComputedStyle(n).lineHeight||"20")*6+28;n.style.height=Math.min(n.scrollHeight,v)+"px"};n.addEventListener("input",c),n.addEventListener("keydown",v=>{v.key==="Enter"&&(v.metaKey||v.ctrlKey)&&(v.preventDefault(),d())}),o.addEventListener("click",d),i.addEventListener("click",()=>{st&&(st.abort(),st=null),p()});function u(){n.disabled=!0,o.hidden=!0,i.hidden=!1,a.hidden=!1,r.textContent="Reading your site\u2026"}function p(){n.disabled=!1,o.hidden=!1,i.hidden=!0,a.hidden=!0,n.focus()}async function d(){let v=n.value.trim();if(!v)return;Nt(),bl("AI is editing\u2026"),st=new AbortController,It=null;let m=e.outerHTML||"",b=e.filePath||Kt(),h=0;try{await Gt("/ai/prompt",{user_prompt:v,action_type:"section_edit",page_scope:b,action_data:{path:b,sectionHtml:m.substring(0,15e3)}},{signal:st.signal,onPromptId(g){It=g},onStatus(g){let f=typeof g=="string"?g:g.message||"Working\u2026";En(f,h)},onFile(){En("Applying changes\u2026",h)},onToken(){h++,En("Generating\u2026",h)},onError(g){It=null,Ss(),J(g.message||"AI edit failed",!0)},onDone(g){if(st=null,It=null,Ss(),g.cancelled){J("Generation cancelled",!1);return}(g.files_modified||[]).length>0?(J("Section updated \u2713"),setTimeout(()=>{let x=document.getElementById("preview-iframe");x!=null&&x.contentWindow&&x.contentWindow.postMessage("voxelsite:reload","*")},400)):g.partial||J("No changes made",!1)},onWarning(g){typeof window.showToast=="function"&&window.showToast(g,"warning")}})}catch(g){g.name!=="AbortError"&&J("AI edit failed",!0),Ss()}}}var pl=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function nu(e){mt(),$t(),Nt();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let g of pl)(t.includes(g.id)||t.includes(g.label.toLowerCase()))&&s.add(g.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${nt(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${pl.map(g=>{let f=s.has(g.id);return`
            <button class="vx-section-card${f?" vx-section-card-exists":""}" data-section-type="${g.id}" data-section-label="${Mt(g.label)}" data-section-desc="${Mt(g.description)}">
              <div class="vx-section-card-icon">${g.icon}</div>
              <div class="vx-section-card-label">${g.label}</div>
              <div class="vx-section-card-desc">${g.description}</div>
              ${f?'<div class="vx-section-card-badge">On page</div>':""}
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible")),Je();let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>{n.remove(),Je()},200)},a=g=>{g.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),$e(n,i),n.tabIndex=-1,n.focus();let r=null,l=null,c=n.querySelector("#vx-section-footer"),u=n.querySelector("#vx-section-footer-type"),p=n.querySelector("#vx-section-instruction"),d=n.querySelector("#vx-section-generate"),v=n.querySelector("#vx-section-change"),m=n.querySelector(".vx-section-picker-grid"),b={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(g=>{g.addEventListener("click",()=>{r=g.dataset.sectionLabel,l=g.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(f=>f.classList.remove("vx-section-card-selected")),g.classList.add("vx-section-card-selected"),u.textContent=r,p.placeholder=b[r]||"Optional: describe what you want\u2026",p.value="",c.hidden=!1,m.classList.add("vx-section-grid-collapsed"),setTimeout(()=>p.focus(),100)})}),v.addEventListener("click",()=>{r=null,l=null,c.hidden=!0,m.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(g=>g.classList.remove("vx-section-card-selected"))});let h=()=>{if(!r)return;let g=p.value.trim();i(),ou(e,r,l,g)};d.addEventListener("click",h),p.addEventListener("keydown",g=>{g.key==="Enter"&&(g.preventDefault(),h())})}async function ou(e,t,s,n=""){bl(`Adding ${t}\u2026`);let o=e.filePath||Kt();st=new AbortController,It=null;let i=st,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let r=0,l=0,c=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await Gt("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onPromptId(u){It=u},onStatus(u){let p=typeof u=="string"?u:u.message||`Adding ${t}\u2026`;En(p,r)},onFile(){En("Writing files\u2026",r)},onToken(){r++;let u=Date.now();u-l>500&&(l=u,En(`Generating ${t}\u2026`,r))},onError(u){st=null,It=null,Ss(),J(u.message||"Failed to add section",!0)},onDone(u){if(st=null,It=null,Ss(),u.cancelled){J("Generation cancelled",!1);return}(u.files_modified||[]).length>0?(J(`${t} added \u2713`),setTimeout(()=>{let d=document.getElementById("preview-iframe");d!=null&&d.contentWindow&&d.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{fe({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{fe({type:"vx-editor:scroll-to-section",sectionIndex:c}),fe({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):u.partial||J("No changes made",!1)},onWarning(u){typeof window.showToast=="function"&&window.showToast(u,"warning")}})}catch(u){st=null,It=null,u.name!=="AbortError"&&J("Failed to add section",!0),Ss()}}function iu(e){mt();let t=!1,s=document.createElement("div");s.className="vx-modal-overlay",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("vx-modal-visible")),Je();let n=()=>{s.classList.remove("vx-modal-visible"),s.removeEventListener("keydown",o),setTimeout(()=>{s.remove(),Je(),!t&&tt&&Cl(tt)},200)},o=i=>{i.key==="Escape"&&(i.stopPropagation(),i.preventDefault(),n())};s.addEventListener("keydown",o),s.querySelector("[data-close]").addEventListener("click",n),$e(s,n),s.tabIndex=-1,s.focus(),au(s)}async function au(e){let t=e.querySelector("#vx-img-grid");try{let s=await C.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",async()=>{var c,u;let i=o.dataset.path,a=(tt==null?void 0:tt.src)||"",r=(ct==null?void 0:ct.sourceFile)||(tt==null?void 0:tt.filePath)||Kt();await du({filePath:r,oldSrc:a,newSrc:i,alt:((u=(c=tt==null?void 0:tt.outerHTML)==null?void 0:c.match(/alt="([^"]*)"/))==null?void 0:u[1])||"",sourceAddress:ct})&&fe({type:"vx-editor:swap-image",src:i}),lo(),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function ru(e){mt();let t=e.href||"",s=e.text||"",n=e.target||"",o=e.linkClass||"",i=e.linkClasses||[],a=(ct==null?void 0:ct.sourceFile)||e.filePath||Kt(),r=`<option value=""${o?"":" selected"}>No class</option>`,l=i.includes(o);i.forEach(d=>{r+=`<option value="${Mt(d)}"${o===d?" selected":""}>${nt(d)}</option>`}),o&&!l&&(r+=`<option value="${Mt(o)}" selected>${nt(o)}</option>`);let c=document.createElement("div");c.className="vx-modal-overlay",c.setAttribute("role","dialog"),c.setAttribute("aria-modal","true"),c.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${Mt(t)}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${Mt(s)}" placeholder="Link text"></div>
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
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(c),requestAnimationFrame(()=>c.classList.add("vx-modal-visible")),Je(),Ml(c);let u=()=>{c.classList.remove("vx-modal-visible"),c.removeEventListener("keydown",p),c.__vxDestroyDrag&&c.__vxDestroyDrag(),setTimeout(()=>{c.remove(),Je()},200)},p=d=>{d.key==="Escape"&&u()};c.addEventListener("keydown",p),c.querySelectorAll("[data-close]").forEach(d=>d.addEventListener("click",u)),$e(c,u),document.getElementById("vx-link-save").addEventListener("click",async()=>{var w;if((w=window.demoGuard)!=null&&w.call(window)){u();return}let d=document.getElementById("vx-link-href").value.trim(),v=document.getElementById("vx-link-text").value.trim(),m=document.getElementById("vx-link-target").checked?"_blank":"",b=document.getElementById("vx-link-style"),h=b?b.value:"",g=ct,f=[];d!==t&&f.push(so(g,"href",t,d,a)),m!==n&&f.push(so(g,"target",n||null,m||null,a)),h!==o&&f.push(so(g,"class",o||null,h||null,a)),v!==s&&f.push(wa(g,s,v,a)),f.forEach(k=>me(k,"created")),await lu(a,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:d,newText:v,newTarget:m,newClass:h},f)&&(fe({type:"vx-editor:update-link",href:d,text:v,target:m,className:h}),setTimeout(()=>fe({type:"vx-editor:refresh-highlight"}),100)),u()}),setTimeout(()=>{var d;return(d=document.getElementById("vx-link-href"))==null?void 0:d.focus()},100)}function ul(e,{oldHref:t,oldText:s,oldTarget:n,oldClass:o,newHref:i,newText:a,newTarget:r,newClass:l}){let c=x=>x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),u=c(t),p=new RegExp(`(<a\\s[^>]*?href=["']${u}["'][^>]*>)([\\s\\S]*?)(</a>)`,"gi"),d=[...e.matchAll(p)];if(d.length===0)return null;if(d.length>1)return"ambiguous";let v=d[0],m=v[1],b=v[2],h=v[3];i!==t&&(m=m.replace(new RegExp(`href=["']${c(t)}["']`),`href="${i}"`)),r!==n&&(r&&m.includes("target=")?m=m.replace(/target=["'][^"']*["']/,`target="${r}"`):r&&!m.includes("target=")?m=m.replace(/>$/,` target="${r}" rel="noopener">`):!r&&m.includes("target=")&&(m=m.replace(/\s*target=["'][^"']*["']/,""),m=m.replace(/\s*rel=["'][^"']*["']/,""))),l!==o&&(l&&m.includes("class=")?m=m.replace(/class=["'][^"']*["']/,`class="${l}"`):l&&!m.includes("class=")?m=m.replace(/>$/,` class="${l}">`):!l&&m.includes("class=")&&(m=m.replace(/\s*class=["'][^"']*["']/,""))),a!==s&&!b.includes("<")&&(b=a);let g=m+b+h,f=e.replace(v[0],g);return f!==e?f:e}async function lu(e,t,s){var o;let n=e||Kt();try{let i=await C.get(`/files/content?path=${encodeURIComponent(n)}`);if(!i.ok)return s&&s.forEach(c=>me(c,"failed",{reason:"cannot read file"})),J("Cannot read source file",!0),!1;let a=i.data.content,r=ul(a,t);if(r==="ambiguous")return s&&s.forEach(c=>me(c,"failed",{reason:"ambiguous match \u2014 multiple links share this href"})),J("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(r!==null)return(await C.put("/files/content",{path:n,content:r})).ok?(s&&s.forEach(u=>me(u,"persisted",{strategy:"contentMatch"})),J(`Saved \u2192 ${n.split("/").pop()}`),!0):(s&&s.forEach(u=>me(u,"failed",{reason:"API write failed"})),J("Save failed",!0),!1);let l=await C.get("/files");if(l.ok){let c=(l.data.files||[]).filter(u=>u.path.endsWith(".php")&&u.path!==n);for(let u of c){let p=await C.get(`/files/content?path=${encodeURIComponent(u.path)}`);if(!p.ok||!((o=p.data)!=null&&o.content))continue;let d=ul(p.data.content,t);if(d==="ambiguous")return s&&s.forEach(v=>me(v,"failed",{reason:"ambiguous match in partial",file:u.path})),J("Save failed \u2014 link appears multiple times. Edit in the Code Editor instead.",!0),!1;if(d!==null)return(await C.put("/files/content",{path:u.path,content:d})).ok?(s&&s.forEach(m=>me(m,"persisted",{strategy:"partialSearch"})),J(`Saved \u2192 ${u.path.split("/").pop()}`),!0):(s&&s.forEach(m=>me(m,"failed",{reason:"API write failed in partial",file:u.path})),J("Save failed",!0),!1)}}return s&&s.forEach(c=>me(c,"failed",{reason:"link not found in source"})),J("Save failed \u2014 link not found in source",!0),!1}catch(i){return console.error("[VX] saveLinkToSource error:",i),s&&s.forEach(a=>me(a,"failed",{reason:"exception",error:i.message})),J("Save failed \u2014 unexpected error",!0),!1}}async function du(e){var l;if((l=window.demoGuard)!=null&&l.call(window))return!1;let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||Kt(),a=Xs(e.sourceAddress||ct),r=so(a,"src",s,n,i);me(r,"created");try{let c=await C.get(`/files/content?path=${encodeURIComponent(i)}`);if(!c.ok)return console.warn("[VX] Cannot read file for image save:",i),me(r,"failed",{reason:"cannot read file"}),J("Save failed",!0),!1;let u=c.data.content,p=!1,d=`src="${s}"`,v=u.split(d).length-1;if(v>1)return me(r,"failed",{reason:"ambiguous match \u2014 multiple elements share this src"}),J("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(v===1&&(u=u.replace(d,`src="${n}"`),p=!0),!p&&u.includes(s)){if(u.split(s).length-1>1)return me(r,"failed",{reason:"ambiguous match \u2014 image path appears multiple times in source"}),J("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1;u=u.replace(s,n),p=!0}if(!p&&o){let b=vl(u,o,n);if(b==="ambiguous")return me(r,"failed",{reason:"ambiguous alt-anchor match \u2014 multiple images share this alt text"}),J("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;b!==!1&&(u=b,p=!0)}if(p)return(await C.put("/files/content",{path:i,content:u})).ok?(me(r,"persisted",{strategy:"contentMatch"}),J(`Saved \u2192 ${i.split("/").pop()}`),!0):(me(r,"failed",{reason:"API write failed"}),J("Save failed",!0),!1);let m=await C.get("/files");if(m.ok){let b=(m.data.files||[]).filter(h=>h.path.endsWith(".php")&&h.path!==i);for(let h of b){let g=await C.get(`/files/content?path=${encodeURIComponent(h.path)}`);if(!g.ok||!g.data.content)continue;let f=g.data.content,x=f.split(d).length-1;if(x>1)return me(r,"failed",{reason:"ambiguous match in partial",file:h.path}),J("Save failed \u2014 image source appears multiple times. Edit in the Code Editor instead.",!0),!1;if(x===1)return f=f.replace(d,`src="${n}"`),(await C.put("/files/content",{path:h.path,content:f})).ok?(me(r,"persisted",{strategy:"partialSearch"}),J(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(me(r,"failed",{reason:"API write failed in partial",file:h.path}),J("Save failed",!0),!1);if(f.includes(s))return f.split(s).length-1>1?(me(r,"failed",{reason:"ambiguous match in partial",file:h.path}),J("Save failed \u2014 image path appears multiple times. Edit in the Code Editor instead.",!0),!1):(f=f.replace(s,n),(await C.put("/files/content",{path:h.path,content:f})).ok?(me(r,"persisted",{strategy:"partialSearch"}),J(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(me(r,"failed",{reason:"API write failed in partial",file:h.path}),J("Save failed",!0),!1));if(o){let w=vl(f,o,n);if(w==="ambiguous")return me(r,"failed",{reason:"ambiguous alt-anchor match in partial",file:h.path}),J("Save failed \u2014 multiple images share this alt text. Edit in the Code Editor instead.",!0),!1;if(w!==!1)return(await C.put("/files/content",{path:h.path,content:w})).ok?(me(r,"persisted",{strategy:"altAnchor"}),J(`Saved \u2192 ${h.path.split("/").pop()}`),!0):(me(r,"failed",{reason:"API write failed in partial",file:h.path}),J("Save failed",!0),!1)}}}return console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),me(r,"failed",{reason:"source not found"}),J("Save failed \u2014 source not found",!0),!1}catch(c){return console.error("[VX] Image save error:",c),me(r,"failed",{reason:"exception",error:c.message}),J("Save failed",!0),!1}}function vl(e,t,s){let n=e.split("<img"),o=[];for(let p=1;p<n.length;p++){let d=n[p];if(d.includes(`alt="${t}"`)||d.includes(`alt='${t}'`)){let v=d.indexOf("src=");if(v!==-1){let m=d[v+4];(m==='"'||m==="'")&&d.indexOf(m,v+5)!==-1&&o.push(p)}}}if(o.length===0)return!1;if(o.length>1)return"ambiguous";let i=o[0],a=n[i],r=a.indexOf("src="),l=a[r+4],c=r+5,u=a.indexOf(l,c);return n[i]=a.substring(0,c)+s+a.substring(u),n.join("<img")}function vi(e){var n;if((n=window.demoGuard)!=null&&n.call(window))return;let t=Xs(e.sourceAddress),s=wa(t,e.originalHTML,e.newHTML,e.filePath);me(s,"created"),Zs.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:s}),clearTimeout(vi._timer),vi._timer=setTimeout(()=>Sn(),800)}async function _l(e){let{filePath:t,originalHTML:s,newHTML:n}=e;if(!s||!n)return J("Source edit failed \u2014 missing data",!0),!1;let o=t||Kt();try{let i=await C.get(`/files/content?path=${encodeURIComponent(o)}`);if(!i.ok)return J("Cannot read source file",!0),!1;let a=i.data.content,r=await ml(o,a,s,n);if(r==="saved")return!0;if(r==="ambiguous")return!1;let l=await C.get("/files");if(!l.ok)return J("Save failed \u2014 source not found in file",!0),!1;let c=(l.data.files||[]).filter(u=>u.path.endsWith(".php")&&u.path!==o);for(let u of c){let p=await C.get(`/files/content?path=${encodeURIComponent(u.path)}`);if(!p.ok||!p.data.content)continue;let d=await ml(u.path,p.data.content,s,n);if(d==="saved")return!0;if(d==="ambiguous")return!1}return console.warn("[VX] Source edit needle not found in any file:",s.substring(0,100)),J("Save failed \u2014 source not found. The file may have changed.",!0),!1}catch(i){return console.error("[VX] Source edit save error:",i),J("Save failed",!0),!1}}async function ml(e,t,s,n){var l;let o=0,i=0;for(;;){let c=t.indexOf(s,i);if(c===-1||(o++,i=c+s.length,o>1))break}if(o===0)return"not_found";if(o>1)return J("Save failed \u2014 source fragment appears multiple times. Edit in the Code Editor instead.",!0),"ambiguous";let a=t.replace(s,n),r=await C.put("/files/content",{path:e,content:a});if(r.ok){let c=e.split("/").pop();return J(`Saved \u2192 ${c}`),(l=r.data)!=null&&l.tailwindCompiled&&setTimeout(()=>{let u=document.getElementById("preview-iframe");u!=null&&u.contentWindow&&u.contentWindow.postMessage("voxelsite:reload-css","*")},300),"saved"}else return J("Save failed",!0),"not_found"}function _a(e){var i;if((i=window.demoGuard)!=null&&i.call(window))return;let t=Xs(e.sourceAddress),s=e.parentAddress?Xs(e.parentAddress):null,n=typeof e.siblingIndex=="number"?e.siblingIndex:-1,o=Jr(t,e.outerHTML,e.filePath,s,n);me(o,"created"),Zs.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,sourceAddress:e.sourceAddress||null,timestamp:Date.now(),_op:o}),clearTimeout(_a._timer),_a._timer=setTimeout(()=>Sn(),300)}function cu(e){let t=e.match(/class="([^"]*)"/);return t?t[1].split(/\s+/).filter(Boolean):[]}function pu(e,t,s,n){let o=new Set(["is-visible","is-active","is-open","active","open","show","shown","visible","in","entered","transitioning"]),i=/class="([^"]*)"/g,a;for(;(a=i.exec(e))!==null;){let r=a[1].split(/\s+/).filter(Boolean);if(r.length===0||!r.every(m=>t.has(m))||![...t].filter(m=>!r.includes(m)).every(m=>o.has(m)||s.includes(m)||n.includes(m)))continue;let p=r.filter(m=>!n.includes(m));for(let m of s)!o.has(m)&&!p.includes(m)&&p.push(m);let d=a[0],v=`class="${p.join(" ")}"`;return e.substring(0,a.index)+v+e.substring(a.index+d.length)}return null}async function Sn(){var t,s,n,o,i,a,r;if(pi||Zs.length===0)return;pi=!0;let e=[...Zs];Zs=[];try{let l={};for(let p of e){let d=((s=(t=p._op)==null?void 0:t.address)==null?void 0:s.sourceFile)||((n=p.sourceAddress)==null?void 0:n.sourceFile)||p.filePath||Kt();l[d]||(l[d]=[]),l[d].push(p)}let c=!1,u={filesByMain:new Map,contentByPath:new Map};for(let[p,d]of Object.entries(l))try{let v=await C.get(`/files/content?path=${encodeURIComponent(p)}`);if(!v.ok){console.error("[VX] Cannot read:",p);continue}let m=v.data.content,b=!1,h=[];for(let g of d){if(g._op&&g._op.type!==ve.FALLBACK){let x=di(g._op,m);if(x.applied){m=x.content,b=!0,h.push({op:g._op,strategy:x.strategy});continue}console.warn("[VX] applyOp failed:",x.reason,"\u2014 falling back to legacy for",g._op.type),me(g._op,"fallback",{fallbackReason:x.reason,via:"applyOp"})}let f=g.type==="delete"?g.outerHTML:g.originalHTML;if(f){if((o=g.sourceAddress)!=null&&o.nodeKey&&g.type==="text"){let x=g.sourceAddress,w=x.sourceFile||p,k=m;if(w!==p)try{let T=await C.get(`/files/content?path=${encodeURIComponent(w)}`);T.ok&&((i=T.data)!=null&&i.content)&&(k=T.data.content)}catch{}let E=x.nodeKey.lastIndexOf(":"),I=!1;if(E!==-1){let T=parseInt(x.nodeKey.substring(E+1),10);if(!isNaN(T)){let N=Bp(k,T);if(N){let j=Sl(k,k.indexOf(N));if(j){let W=j.length,q=N.lastIndexOf("</");if(q>W){let Y=N.substring(q),ee=j+g.newHTML+Y;if(w!==p){let H=k.replace(N,ee),S=await C.put("/files/content",{path:w,content:H});S.ok&&(J(`Saved \u2192 ${w.split("/").pop()}`),(a=S.data)!=null&&a.tailwindCompiled&&(c=!0),I=!0,g._op&&(me(g._op,"persisted",{strategy:"nodeKey",via:"legacy"}),io(g._op,w)))}else m=m.replace(N,ee),b=!0,I=!0,g._op&&h.push({op:g._op,strategy:"nodeKey",via:"legacy"})}}}}}if(I)continue;console.warn("[VX] Legacy nodeKey extraction failed for",x.nodeKey,"\u2014 trying content match"),g._op&&me(g._op,"fallback",{fallbackReason:"legacy nodeKey extraction failed",nodeKey:x.nodeKey})}if(m.includes(f))m=g.type==="delete"?m.replace(f,""):m.replace(f,g.newHTML),b=!0,g._op&&h.push({op:g._op,strategy:"contentMatch",via:"legacy"});else if(g.type==="class-change"&&g.additions){let x=new Set(cu(f)),w=pu(m,x,g.additions,g.removals);if(w)m=w,b=!0,g._op&&h.push({op:g._op,strategy:"subsetMatch",via:"legacy"});else{let k=await gl(p,g,u);if(k.status==="saved"){g._op&&(me(g._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:k.path}),io(g._op,k.path)),c=!0;continue}k.status==="write_failed"?g._op&&me(g._op,"failed",{reason:"partial write failed",file:k.path}):(console.warn("[VX] Not found in source:",f.substring(0,80)),g._op&&me(g._op,"failed",{reason:"source not found"}),J("Save failed \u2014 source not found",!0))}}else{let x=await gl(p,g,u);if(x.status==="saved"){g._op&&(me(g._op,"persisted",{strategy:"partialSearch",via:"legacy",sourceFile:x.path}),io(g._op,x.path)),c=!0;continue}x.status==="write_failed"?g._op&&me(g._op,"failed",{reason:"partial write failed",file:x.path}):(console.warn("[VX] Not found in source:",f.substring(0,80)),g._op&&me(g._op,"failed",{reason:"source not found"}),J("Save failed \u2014 source not found",!0))}}}if(b){let g=await C.put("/files/content",{path:p,content:m});if(g.ok){J(`Saved \u2192 ${p.split("/").pop()}`),(r=g.data)!=null&&r.tailwindCompiled&&(c=!0);for(let{op:f,strategy:x,via:w}of h)me(f,"persisted",{strategy:x,via:w||"applyOp"}),io(f,p)}else{J("Save failed",!0);for(let{op:f,via:x}of h)me(f,"failed",{reason:"file write failed",via:x||"applyOp"})}}}catch(v){console.error("[VX] Save error:",v),J("Save failed",!0)}c&&setTimeout(()=>{let p=document.getElementById("preview-iframe");p!=null&&p.contentWindow&&p.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{pi=!1,Zs.length>0?setTimeout(()=>Sn(),0):fe({type:"vx-editor:save-feedback"})}}async function gl(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let r=await C.get("/files");if(!r.ok)return{status:"not_found"};a=(r.data.files||[]).filter(l=>l.path.endsWith(".php")&&l.path!==e).filter(l=>o.some(c=>l.path.includes(c+"/"))||l.path.includes("partial")||l.path.includes("header")||l.path.includes("footer")||l.path.includes("nav")),i.filesByMain.set(e,a)}for(let r of a){let l=i.contentByPath.get(r.path);if(l==null){let c=await C.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!c.ok||!c.data.content)continue;l=c.data.content,i.contentByPath.set(r.path,l)}if(l.includes(n)){let c=t.type==="delete"?l.replace(n,""):l.replace(n,t.newHTML);return(await C.put("/files/content",{path:r.path,content:c})).ok?(i.contentByPath.set(r.path,c),J(`Saved \u2192 ${r.path.split("/").pop()}`),{status:"saved",path:r.path}):(J("Save failed",!0),{status:"write_failed",path:r.path})}}}catch(a){console.error("[VX] Partial search error:",a)}return{status:"not_found"}}async function uu(e){var i;let{filePath:t,sectionIndex:s,neighborIndex:n}=e,o=t||Kt();try{let a=await C.get(`/files/content?path=${encodeURIComponent(o)}`);if(!a.ok){J("Could not read file",!0);return}let r=a.data.content,l=vu(r);if(s>=l.length||n>=l.length){J("Section not found in source. Try asking the AI to move it.",!0);return}let c=mu(r,l,s,n);if(!c){J("Could not swap sections in source",!0);return}let u=await C.put("/files/content",{path:o,content:c});u.ok?(J("Section moved"),(i=u.data)!=null&&i.tailwindCompiled&&setTimeout(()=>{let p=document.getElementById("preview-iframe");p!=null&&p.contentWindow&&p.contentWindow.postMessage("voxelsite:reload-css","*")},300)):J("Save failed",!0)}catch(a){console.error("[VX] Section move error:",a),J("Section move failed",!0)}}function vu(e){let t=[],s=/<section\b/gi,n;for(;(n=s.exec(e))!==null;){let o=n.index,a=e.substring(Math.max(0,o-500),o).match(/(<!--[\s\S]*?-->\s*)$/);a&&(o-=a[0].length);let r="</section>",l=1,c=n.index+n[0].length;for(;l>0&&c<e.length;){let u=e.indexOf("<section",c),p=e.indexOf(r,c);if(p===-1)break;if(u!==-1&&u<p){let d=e[u+8];(d===" "||d===">"||d===`
`||d==="\r"||d==="	"||d==="/")&&l++,c=u+9}else{if(l--,l===0){let d=p+r.length;t.push({start:o,end:d,content:e.substring(o,d)})}c=p+r.length}}}return t}function mu(e,t,s,n){if(s===n)return e;let o=Math.min(s,n),i=Math.max(s,n),a=t[o],r=t[i];if(!a||!r||a.end>r.start)return null;let l=e.substring(0,a.start),c=e.substring(a.end,r.start),u=e.substring(r.end);return l+r.content+c+a.content+u}function Bl(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",dt),e.title=dt?"Exit visual editor (V)":"Enter visual editor (V)",e.setAttribute("aria-pressed",String(dt))),document.body.classList.toggle("vx-editing",dt)}function J(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(J._timer),J._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function fe(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function Kt(){return window.__vsCurrentPreviewPath||"index.php"}function Ba(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),r=a.right-s-o,l=Math.max(o,a.left+10),c=Math.max(o,window.innerWidth-s-o),u=Math.min(Math.max(r,l),c),p=Math.max(a.top+12,i),d=Math.max(i,window.innerHeight-n-o),v=Math.min(p,d);e.style.left=`${u}px`,e.style.top=`${v}px`,e.style.right="auto"}function fl(e,t,s){let n=e.offsetWidth||380,o=e.offsetHeight||180,i=16,a=56,r=document.getElementById("preview-iframe");if(!r||!s){Ba(e);return}let l=r.getBoundingClientRect(),c=l.top+s.top,u=l.top+s.top+s.height,d=l.left+s.left+s.width/2-n/2,v,m=c-o-4;m>=a?v=m:v=u+8;let b=Math.max(i,window.innerWidth-n-i),g=Math.min(Math.max(d,i),b),f=Math.max(a,window.innerHeight-o-i),x=Math.min(Math.max(v,a),f);e.style.left=`${g}px`,e.style.top=`${x}px`,e.style.right="auto"}function gu(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function Mt(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function nt(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function me(e,t,s={}){var o,i;let n={opId:(e==null?void 0:e.id)||"unknown",type:(e==null?void 0:e.type)||"unknown",event:t,sourceKind:((o=e==null?void 0:e.address)==null?void 0:o.sourceKind)||"unknown",sourceFile:((i=e==null?void 0:e.address)==null?void 0:i.sourceFile)||(e==null?void 0:e.filePath)||"unknown",timestamp:Date.now(),...s};Ca.push(n),Ca.length>kp&&Ca.shift(),t==="failed"||t==="fallback"?console.warn(`[VX-OPS] ${t}:`,Ea(e==null?void 0:e.type),n):console.debug(`[VX-OPS] ${t}:`,Ea(e==null?void 0:e.type),n.sourceFile)}async function fu(){var s;let e=ol();if(!e){J("Nothing to undo");return}let t=e.filePath;if(!t){J("Undo failed \u2014 no file path",!0);return}try{let n=await C.get(`/files/content?path=${encodeURIComponent(t)}`);if(!n.ok){J("Undo failed \u2014 cannot read file",!0);return}let o=di(e.inverseOp,n.data.content);if(!o.applied){console.warn("[VX History] Undo applyOp failed:",o.reason),J("Undo failed \u2014 source has changed",!0);return}let i=await C.put("/files/content",{path:t,content:o.content});if(!i.ok){J("Undo failed \u2014 save error",!0);return}il(),me(e.inverseOp,"persisted",{strategy:o.strategy,via:"undo"}),J("Undone"),$n+=2,fe({type:"vx-editor:replay-op",op:e.inverseOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Undo error:",n),J("Undo failed",!0)}}async function hu(){var s;let e=al();if(!e){J("Nothing to redo");return}let t=e.filePath;if(!t){J("Redo failed \u2014 no file path",!0);return}try{let n=await C.get(`/files/content?path=${encodeURIComponent(t)}`);if(!n.ok){J("Redo failed \u2014 cannot read file",!0);return}let o=di(e.forwardOp,n.data.content);if(!o.applied){console.warn("[VX History] Redo applyOp failed:",o.reason),J("Redo failed \u2014 source has changed",!0);return}let i=await C.put("/files/content",{path:t,content:o.content});if(!i.ok){J("Redo failed \u2014 save error",!0);return}rl(),me(e.forwardOp,"persisted",{strategy:o.strategy,via:"redo"}),J("Redone"),$n+=2,fe({type:"vx-editor:replay-op",op:e.forwardOp}),(s=i.data)!=null&&s.tailwindCompiled&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}catch(n){console.error("[VX History] Redo error:",n),J("Redo failed",!0)}}var Al="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",bu=["claude","openai","gemini","deepseek","openai_compatible"],yu={claude:"Claude",openai:"OpenAI",gemini:"Gemini",deepseek:"DeepSeek",openai_compatible:"OpenAI-Compatible"},xu={governor_configuration:"Routing needs a TypeSafe key. Default editing remains available.",forbidden_claims:"The proposed claim is not supported by the known business facts.",gate_unavailable:"The claim check was unavailable. No candidate was approved.",gate_invalid:"The claim check returned an invalid result. No candidate was approved.",routing_unavailable:"The routing check was unavailable.",routing_invalid:"The routing check returned an invalid result.",routing_uncertain:"The router could not choose confidently.",content_changed:"The page changed during the request. Refresh before trying again.",invalid_target:"Select one plain-text heading in a registered page.",missing_address:"Select one plain-text heading in a registered page.",ambiguous_address:"The selection matched more than one heading. Select a unique heading.",explicit_replacement_required:"Provide the exact replacement heading.",repair_limit_exhausted:"Two targeted repairs were used. Revise the request before starting a new edit.",prompt_injection:"The request could expand the edit beyond its allowed scope.",ledger_unavailable:"Call accounting was unavailable. Ask the owner to check the database.",generation_failed:"Generation failed. Try the edit again.",generation_cancelled:"The request was cancelled.",identical_candidate:"The proposed heading was unchanged.",invalid_candidate:"The proposed heading did not pass validation.",unsupported_action:"This historical check did not support the requested action.",unsupported_route:"This historical check did not support the requested action.",invalid_request:"Use a text request of at most 4,000 characters."},wu={configuration_error:"Add a TypeSafe key to enable routing.",classification_unavailable:"The router was unavailable.",low_confidence:"The router was unsure.",invalid_classification:"The router returned an invalid choice.",unsafe_classification:"The request needs default handling.",ambiguous_write:"The request needs default handling.",request_too_large:"The request needs full instructions.",routing_unavailable:"The router was unavailable.",routing_invalid:"The router returned an invalid choice.",routing_uncertain:"The router was unsure.",model_map_missing:"Choose both routing models.",model_map_invalid:"Check your routing models.",model_map_mismatch:"Models do not match your AI provider.",unsupported_action:"This request uses its normal editing path.",ledger_unavailable:"Routing could not be recorded."},ku={edit_copy:"Copy edit",edit_layout:"Layout edit",add_page:"New page",new_site:"New site",theme:"Design change",restyle:"Restyle",question:"Question",noop:"No change"},Eu={create_site:"Create site",import_site:"Import site",restyle_site:"Restyle site",edit_page:"Edit page",change_design:"Change design",add_page:"Add page",optimize_aeo:"Search visibility",section_edit:"Edit section",add_section:"Add section",inline_edit:"Edit selection",free_prompt:"General request",question:"Answer question",noop:"No change",replace_text:"Exact replacement"},$u={legacy:"Default",focused:"Selected content",full:"Full site context",readonly:"Relevant site details"};function Cu(e){var t;return e!=null&&e.available?(t=e.items)!=null&&t.length?`<ul class="flex flex-col gap-4">${e.items.map(s=>{var a;if(s.kind==="routing"){let r=s.status==="preview"?"Preview: suggested choices only. Editing used defaults.":s.status==="routed"?"Automatic routing used.":s.status==="off"?"AI Router off. Default settings used.":"Default settings used. "+(wu[s.reason]||"Routing was unavailable."),l=(a=s.models)!=null&&a.length?`Model: ${s.models.join(", ")}.`:"No generation model recorded.",c=s.status==="preview"?` Suggested model: ${s.proposed_model||"default"}.`:"",u=`${s.status==="preview"?"Suggested work":"Work"}: ${ku[s.intent]||"Default"}; instructions: ${Eu[s.recipe]||"Default"}; context: ${$u[s.context]||"Default"}.`;return`<li class="text-sm text-vs-text-secondary"><strong>Turn ${Number(s.id)}</strong><p>${re(r)}</p><p class="text-xs mt-1">${re(l+c+" "+u)}</p></li>`}let n;s.mode==="shadow"?n=`Historical preview; request ${s.status}. No edit check.`:s.status==="applied"?n=s.reason==="accepted_owner_override"?"This edit was applied with an owner override.":"Historical heading check: edit applied.":s.status==="answered"?n="Answered the question. No files changed.":s.status==="acknowledged"?n="No changes requested. No files changed.":n="This edit was not applied. "+(xu[s.reason]||"The edit could not be completed safely.");let o=s.generation_calls>0?`${s.generation_calls} recorded generation/repair call(s) via ${s.providers.join(", ")}.`:"No generation calls recorded.",i=s.mode==="enforce"&&s.intent!=="unknown"?`Route: ${s.intent}; requested tier: ${s.requested_tier}. `:"";return`<li class="text-sm text-vs-text-secondary"><strong>Historical turn ${Number(s.id)}</strong><p>${re(n)}</p><p class="text-xs mt-1">${re(i+o)}</p></li>`}).join("")}</ul>`:'<p class="text-sm text-vs-text-secondary">No recorded requests yet.</p>':'<p class="text-sm text-vs-warning" role="status">Recorded outcomes could not be loaded. Reload Settings to try again.</p>'}function Pl(e,t,s){var d;if(!e)return'<section class="vs-settings-card"><h2 class="vs-settings-card-title">AI Router</h2><p class="text-sm text-vs-error" role="alert">AI Router settings could not be loaded. Reload Settings before making changes.</p></section>';let n=e["governor.mode"],o=e["governor.model_map"]||{},i=e["governor.configuration_error"],a=e.ai_provider??"claude",l=!(Object.keys(o).length>0)||Object.keys(o).length===2&&["cheap","frontier"].every(v=>{var m,b;return((m=o[v])==null?void 0:m.provider)===a&&typeof((b=o[v])==null?void 0:b.model)=="string"}),c=((d=e["governor.model_map_error"])==null?void 0:d.message)||(l?"":"The saved models do not match this provider. Choose two models or clear them, then click Save AI Router."),u=t==="owner",p=["cheap","frontier"].map(v=>{var m;return`
    <div class="flex flex-col gap-2"><label for="governor-${v}-model" class="block text-sm font-medium text-vs-text-secondary">${v==="cheap"?"Faster":"Stronger"} model</label>
      <select id="governor-${v}-model" class="vs-input" disabled aria-describedby="governor-model-help governor-model-save-help governor-model-status">${Rl([],c?"":((m=o[v])==null?void 0:m.model)||"","loading")}</select></div>`}).join("");return`<section id="governor-settings" class="vs-settings-card" aria-labelledby="governor-title">
    <h2 id="governor-title" class="vs-settings-card-title">AI Router</h2>
    <p class="vs-settings-card-subtitle">Automatically selects the model and instructions for each request.</p>
    <p class="text-sm text-vs-text-secondary mb-4">Powered by TypeSafe\u2019s Jev model. If routing is unavailable, editing uses your default settings.</p>
    <p class="text-sm text-vs-text-secondary mb-4">Saved setting: ${n==="off"?"Off":"On"}. TypeSafe key: ${e["governor.typesafe_configured"]?"stored":"not stored"}.</p>
    ${c?`<p class="text-sm text-vs-warning mb-4" role="alert">${re(c)}</p>`:""}
    ${i?`<p class="text-sm text-vs-error mb-4" role="alert">${re(i.message)}</p>`:""}
    ${u?`<form id="governor-form" data-provider="${re(a)}" data-key-stored="${!!e["governor.typesafe_configured"]}" data-model-state="loading" data-map-mismatch="${!!c}" class="flex flex-col gap-6">
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
          <input id="governor-key" value="${e["governor.typesafe_configured"]?Al:""}" type="password" autocomplete="new-password" class="vs-input flex-1 min-w-0" maxlength="4096" ${n==="off"?"disabled":""} aria-describedby="governor-key-help governor-key-removal-status governor-save-status" />
          ${e["governor.typesafe_configured"]?'<button id="governor-remove-key-button" type="button" class="vs-btn vs-btn-ghost vs-btn-sm">Remove key</button>':""}
        </div>
        <p id="governor-key-help" class="text-xs text-vs-text-secondary mt-1">${e["governor.typesafe_configured"]?n==="off"?"Turn on AI Router to replace this key.":"Leave unchanged to keep your key. Enter a new key to replace it.":"Enter your TypeSafe key, then save."}</p>
        <p id="governor-key-removal-status" class="text-sm text-vs-warning empty:hidden" role="status" aria-live="polite"></p>
        <a href="https://console.typesafe.ai/keys" target="_blank" rel="noopener noreferrer" class="text-xs text-vs-accent">Get a key in the TypeSafe console</a>
      </div></div>
      <div id="governor-model-controls"${n==="off"?" hidden":""}><fieldset class="min-w-0 flex flex-col gap-4"><legend class="text-sm font-medium text-vs-text-secondary mb-2">Models</legend>
        <p id="governor-model-help" class="text-sm text-vs-text-secondary">Use the faster model for small edits and the stronger model for larger changes.</p>
        <p id="governor-model-save-help" class="text-sm text-vs-text-secondary">Choose both models for ${re(yu[a]||"Unknown provider")}, then save. Leave both empty to use your default model.</p>
        ${p}
        <p id="governor-model-status" class="text-xs text-vs-text-secondary" role="status" aria-live="polite">Loading models\u2026</p>
        <button id="governor-clear-models" type="button" class="vs-btn vs-btn-secondary vs-btn-sm">Clear saved models</button>
      </fieldset></div>
      <p id="governor-save-status" class="text-sm text-vs-text-secondary empty:hidden" role="status" aria-live="polite"></p>
      <div class="vs-settings-card-footer"><button type="submit" class="vs-btn vs-btn-primary vs-btn-sm">Save AI Router</button></div>
    </form>`:'<p class="text-sm text-vs-text-secondary mb-4">Only the owner can change these settings.</p>'}
    <h3 class="text-sm font-medium mt-4 mb-4">Your recent requests</h3>
    ${Cu(s)}
  </section>`}function Rl(e,t,s="ready"){let n=e.filter(p=>typeof(p==null?void 0:p.id)=="string"&&/^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(p.id)&&!p.id.includes("://")),o=p=>{let d=p.match(/^claude-(?:\d+(?:-\d+)?-)?([a-z]+)(?:-|$)/i);if(d)return`Claude ${d[1][0].toUpperCase()}${d[1].slice(1)}`;let v=p.match(/^(gpt-\d+(?:\.\d+)?[a-z]?)(?:-|$)/i);if(v)return v[1].toUpperCase();let m=p.match(/^(o\d+)(?:-|$)/i);if(m)return m[1];let b=p.match(/^(gemini-\d+(?:\.\d+)?)(?:-|$)/i);if(b)return b[1].replace(/^gemini-/i,"Gemini ");let h=p.match(/^deepseek-(v\d+(?:\.\d+)?|r\d+)(?:-|$)/i);return h?`DeepSeek ${h[1].toUpperCase()}`:"Other models"},i=p=>{let d=typeof p.created_at=="string"&&/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(p.created_at)?Date.parse(p.created_at):NaN;return Number.isFinite(d)&&d>0?d:-1/0},a=(p,d)=>p===d?0:p>d?-1:1,r=new Map;for(let p of n){let d=o(p.id);r.has(d)||r.set(d,{label:d,date:-1/0,models:[]});let v=r.get(d);v.models.push(p),v.date=Math.max(v.date,i(p))}let l=[...r.values()].sort((p,d)=>{if(p.label==="Other models"||d.label==="Other models")return p.label===d.label?0:p.label==="Other models"?1:-1;let v=a(p.date,d.date);if(v)return v;let m=p.label.match(/^(GPT-|Gemini |o|DeepSeek [VR])(\d+(?:\.\d+)?)$/),b=d.label.match(/^(GPT-|Gemini |o|DeepSeek [VR])(\d+(?:\.\d+)?)$/);return m&&b&&m[1]===b[1]?b[2].localeCompare(m[2],"en",{numeric:!0}):0}),c=t&&!n.some(p=>p.id===t),u=l.map(p=>{p.models.sort((v,m)=>a(i(v),i(m)));let d=p.models.map(v=>`<option value="${re(v.id)}" ${v.id===t?"selected":""}>${re(v.name||v.id)}</option>`).join("");return l.length===1&&p.label==="Other models"?d:`<optgroup label="${re(p.label)}">${d}</optgroup>`}).join("");return`<option value="" ${t?"":"selected"}>No saved model</option>`+(c?`<option value="${re(t)}" selected>${re(t)} (${s==="loading"?"saved":"saved; unavailable in model list"})</option>`:"")+u}async function Su(e,t){let s=["cheap","frontier"].map(i=>e.querySelector(`#governor-${i}-model`)),n=e.querySelector("#governor-model-status"),o=e.querySelector("#governor-clear-models");for(let i of s)i.addEventListener("change",()=>{e.dataset.modelsDirty="true"});o.addEventListener("click",()=>{for(let i of s)i.value="";e.dataset.modelsDirty="true",n.textContent="Click Save AI Router to remove the saved models."});try{let{ok:i,data:a}=await t();if((a==null?void 0:a.provider)!==void 0&&a.provider!==e.dataset.provider){e.dataset.modelState="stale",o.disabled=!0,n.textContent="The AI provider changed. Reload Settings before saving AI Router.";return}if(!i||(a==null?void 0:a.provider)!==e.dataset.provider||!Array.isArray(a.models))throw new Error;let r=a.models.filter(l=>typeof(l==null?void 0:l.id)=="string"&&/^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(l.id)&&!l.id.includes("://"));e.dataset.modelState=r.length?"ready":"empty";for(let l of s)l.innerHTML=Rl(r,l.value),l.disabled=!r.length;if(e.dataset.modelsDirty==="true")return;n.textContent=r.length?e.dataset.mapMismatch==="true"?"Choose both models for this provider or clear the saved models, then click Save AI Router.":"Choose both models to replace your saved choices.":"No models available. Check AI Provider settings; saved models are kept."}catch{e.dataset.modelState="error",e.dataset.modelsDirty!=="true"&&(n.textContent="Models could not be loaded. Reload Settings to retry; saved models will be kept.")}}function Lu(e){let t=a=>e.querySelector("#"+a).value,s=e.querySelector("#governor-enabled").checked?"enforce":"off",n=e.querySelector("#governor-remove-key").checked;if(n&&s!=="off")throw new Error("Select Off before removing the TypeSafe key.");if(s==="off")return n?{"governor.mode":s,"governor.typesafe_api_key":null}:{"governor.mode":s};let o={};if(e.dataset.modelState==="stale")throw new Error("The AI provider changed. Reload Settings before saving AI Router.");for(let a of["cheap","frontier"]){let r=t(`governor-${a}-model`).trim();r&&(o[a]={provider:e.dataset.provider,model:r})}if(Object.keys(o).length===1)throw new Error("Choose both models, or click Clear saved models, then click Save AI Router.");if(Object.values(o).some(a=>!bu.includes(a.provider)||a.model.includes("://")||!/^[a-zA-Z0-9_.:/+\-]{1,200}$/.test(a.model)))throw new Error("Use a model ID without spaces, credentials or a provider URL.");let i={"governor.mode":s,"governor.model_map":Object.keys(o).length?o:[]};return e.dataset.modelState&&e.dataset.modelsDirty!=="true"&&delete i["governor.model_map"],n?i["governor.typesafe_api_key"]=null:t("governor-key")&&t("governor-key")!==Al&&(i["governor.typesafe_api_key"]=t("governor-key")),i}function Dl(e,{getRole:t,put:s,reload:n,getModels:o,demoGuard:i=()=>!1}){let a="Could not confirm the save. Reload Settings to check the stored configuration before trying again.",r=e.querySelector("#governor-form");if(!r||t()!=="owner")return;let l=!1,c=()=>{let d=!r.querySelector("#governor-enabled").checked,v=r.dataset.keyStored==="true",m=r.querySelector("#governor-remove-key").checked;r.querySelector("#governor-key-controls").hidden=d&&!v,r.querySelector("#governor-key").disabled=d||m,r.querySelector("#governor-enabled").disabled=m;let b=r.querySelector("#governor-key-help");b&&(b.hidden=m,b.textContent=v?d?"Turn on AI Router to replace this key.":"Leave unchanged to keep your key. Enter a new key to replace it.":"Enter your TypeSafe key, then save."),r.querySelector("#governor-model-controls").hidden=d,!d&&o&&!l&&(l=!0,Su(r,o))},u=r.querySelector("#governor-remove-key-button"),p=!1;u==null||u.addEventListener("click",()=>{if(i()||t()!=="owner"||r.querySelector('button[type="submit"]').disabled)return;let d=r.querySelector("#governor-remove-key"),v=r.querySelector("#governor-enabled");d.checked=!d.checked,d.checked?(p=v.checked,v.checked=!1):v.checked=p,u.textContent=d.checked?"Undo":"Remove key",r.querySelector("#governor-key-removal-status").textContent=d.checked?"Save to remove this key and turn off AI Router.":"",c()}),r.addEventListener("change",c),c(),r.addEventListener("submit",async d=>{var h,g;if(d.preventDefault(),t()!=="owner"||i())return;let v=r.querySelector('button[type="submit"]');if(v.disabled)return;let m=r.querySelector("#governor-save-status"),b;try{b=Lu(r)}catch(f){m.textContent=f.message;return}v.disabled=!0,m.textContent="Saving AI Router\u2026";try{let f=await s("/settings",b);r.querySelector("#governor-key").value="",delete b["governor.typesafe_api_key"],f.ok?await n():((h=f.error)==null?void 0:h.code)==="network_error"?m.textContent=a:m.textContent=((g=f.error)==null?void 0:g.code)==="governor_configuration"?"Enter a readable TypeSafe key to enable routing. Editing can still use your default settings.":"AI Router settings were not saved. Reload Settings to check the saved AI provider, then check your owner access and field values."}catch{m.textContent=a}finally{r.querySelector("#governor-key").value="",delete b["governor.typesafe_api_key"],v.disabled=!1}})}function bi(e,t=""){let s=new Map;for(let n of Array.isArray(e)?e:[])typeof(n==null?void 0:n.id)=="string"&&n.id&&s.set(n.id,n.name||n.id);return t&&!s.has(t)&&s.set(t,t),s.size?[...s].map(([n,o])=>`<option value="${re(n)}"${n===t?" selected":""}>${re(o)}</option>`).join(""):'<option value="">Test your connection to load available models</option>'}function Hl(e){let t=(String(e||"").trim()||"http://localhost:11434").replace(/\/+$/,"");return/\/v\d+$/.test(t)?t:`${t}/v1`}function Nl(e,t){let s=Hl(t),n=e!=null&&e.base_url&&Hl(e.base_url)===s&&e.models&&typeof e.models=="object"&&!Array.isArray(e.models)?{...e.models}:{};return{base_url:s,models:n}}function Tu(e,t,s,n){let o=String(s).trim(),i=String(n).trim(),a={...e.models};if(!o&&!i)return delete a[t],{settings:{...e,models:a}};if(!t)return{error:"Choose a model before setting its limits."};if(!o||!i)return{error:"Enter both limits, or leave both blank to use detected limits."};let r=Number(o),l=Number(i);return!Number.isInteger(r)||r<1||r>2e6||!Number.isInteger(l)||l<1||l>1e7?{error:"Use whole numbers: output from 1 to 2,000,000 and context from 1 to 10,000,000."}:r>l?{error:"The output limit cannot exceed the context window."}:{settings:{...e,models:{...a,[t]:{max_output_tokens:r,context_window:l}}}}}function Iu(e){let t=e==null?void 0:e.budget,s=e==null?void 0:e.focused_budget;if(!t||!s)return"Model limits could not be loaded. Try again after testing your connection.";let n=i=>Number(i).toLocaleString(),o={documented:"Using documented model limits.",metadata:"Using model limits reported by your endpoint.",override:"Using your limits for this endpoint and exact model ID.",fallback:t.provider==="openai_compatible"?"This model has no reported limits. Conservative defaults are in use; set limits below if your host documents different values.":"Limits are not known for this model. Conservative defaults are in use."}[e.source]||"";return`
    <dl class="grid grid-cols-1 sm:grid-cols-3 gap-2">
      ${[["Configured ceiling",t.configured],["Full generation",t.effective],["Section edits",s.effective]].map(([i,a])=>`
        <div><dt class="text-vs-text-ghost">${i}</dt><dd class="text-vs-text-secondary font-medium">${n(a)} tokens</dd></div>
      `).join("")}
    </dl>
    <p class="mt-2">Model output limit: ${n(t.model_limit)} \xB7 Context window: ${n(t.context_window)} tokens.</p>
    <p class="mt-1">${o} Section edits use at most 16,000 tokens.</p>`}function Ol(e,{settings:t,post:s,delay:n=180,demoMode:o=!1,canEditModelLimits:i=!1}){let a=T=>e.querySelector(`#${T}`),r=a("set-ai-model"),l=a("set-max-tokens"),c=a("set-base-url"),u=a("set-model-output-limit"),p=a("set-model-context-window"),d=a("set-model-budget"),v=a("set-model-limits-error"),m=t.ai_provider==="openai_compatible",b=Nl(t.ai_openai_compatible_model_limits,c==null?void 0:c.value),h=r.value,g=0,f;function x(){if(!m)return;let T=Object.hasOwn(b.models,h)?b.models[h]:null;u.value=(T==null?void 0:T.max_output_tokens)??"",p.value=(T==null?void 0:T.context_window)??"",u.readOnly=!i,p.readOnly=!i,w("")}function w(T){m&&(v.textContent=T,v.hidden=!T,u.setCustomValidity(T),p.setCustomValidity(T))}function k(){if(!m)return;if(!i)return b;let T=Tu(b,h,u.value,p.value);return w(T.error||""),T.error?null:(b=T.settings,b)}async function E(T){var q,Y;if(!d.isConnected||T!==g)return;let N=k();if(N===null){d.textContent="Complete both model limits to preview the generation budget.";return}let j=Number(l.value);if(!Number.isInteger(j)||j<1e3||j>128e3){d.textContent="Enter a whole-number output ceiling from 1,000 to 128,000 tokens.";return}if(!r.value){d.textContent="Choose a model to see its generation budget.";return}let W={provider:t.ai_provider||"claude",model:r.value,max_tokens:j,base_url:((q=c==null?void 0:c.value)==null?void 0:q.trim())||"",...m&&i?{model_limits:N}:{}};try{let ee=await s("/settings/model-budget",W,{silent:!0});if(!d.isConnected||T!==g)return;ee.ok?d.innerHTML=Iu(ee.data):d.textContent=((Y=ee.error)==null?void 0:Y.message)||"Model limits could not be loaded. Try again after testing your connection."}catch{d.isConnected&&T===g&&(d.textContent="Model limits could not be loaded. Try again after testing your connection.")}}function I(){clearTimeout(f);let T=++g;if(o){d.textContent="Model limits appear after setup.";return}d.textContent="Checking model limits\u2026",f=setTimeout(()=>E(T),n)}return r.addEventListener("change",()=>{if(k()===null){r.value=h,u.reportValidity();return}h=r.value,x(),I()}),l.addEventListener("input",I),m&&(i&&(u.addEventListener("input",I),p.addEventListener("input",I)),c.addEventListener("input",()=>{b=Nl(i?b:t.ai_openai_compatible_model_limits,c.value),x(),I()})),x(),I(),{collectLimits(){if(!i)return;let T=k();return T===null&&u.reportValidity(),T},refresh:I,invalidate(){clearTimeout(f),g++}}}var co=0;function Vl(){return setTimeout(()=>us(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function us(){var S,P,F,U,ne,se,ae,ce,he,we;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,r]=await Promise.all([C.get("/settings"),C.get("/settings/system"),C.get("/settings/mail"),C.get("/settings/usage"),C.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),C.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),C.get("/settings/logs")]),l=((S=r.data)==null?void 0:S.logs)||[],c=((P=t.data)==null?void 0:P.settings)||{},u=((F=s.data)==null?void 0:F.system)||{},p=c.site_favicon||null,d=p?`/${p}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),v=null,m=null;try{i.ok&&((U=i.data)!=null&&U.content)&&(v=JSON.parse(i.data.content))}catch{}try{a.ok&&((ne=a.data)!=null&&ne.content)&&(m=JSON.parse(a.data.content))}catch{}let b=v||m,h=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},g=c.available_providers||{},f=((se=n.data)==null?void 0:se.config)||{},x=((ae=n.data)==null?void 0:ae.presets)||{},w=Object.keys(g),k=c.ai_provider||"claude",I=(g[k]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],T=c[`ai_${k}_model`]||"",N=c[`ai_${k}_api_key_set`]||!1,j=((ce=R.get("user"))==null?void 0:ce.role)==="owner",W=w.map(Z=>{let _e=g[Z];return`<option value="${y(Z)}" ${Z===k?"selected":""}>${y(_e.name)}</option>`}).join(""),q="";for(let Z of I)Z.key==="api_key"?q+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(Z.label)}${Z.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${N?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${y(Z.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${N?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':Z.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${y(Z.help_text||"Optional for local servers")}</p>`}
          ${Z.help_url?`<a href="${Z.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${y(Z.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:Z.key==="base_url"&&(q+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(Z.label)}${Z.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${y(c.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${y(Z.placeholder)}" />
          ${Z.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${y(Z.help_text)}</p>`:""}
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
      <p class="vs-settings-card-subtitle">Choose the provider and default model for creating and editing your site.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-ai-provider" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
          <select id="set-ai-provider" class="vs-input">
            ${W}
          </select>
        </div>

        <div id="settings-config-fields">
          ${q}
        </div>

        <div>
          <label for="set-ai-model" class="block text-sm font-medium text-vs-text-secondary mb-1">Default model</label>
          <select id="set-ai-model" class="vs-input">
            ${T?bi([],T):'<option value="">Loading models\u2026</option>'}
          </select>
        </div>

        <div>
          <label for="set-max-tokens" class="block text-sm font-medium text-vs-text-secondary mb-1">Max Output Tokens</label>
          <input id="set-max-tokens" type="number" value="${c.ai_max_tokens||32e3}" min="1000" max="128000" step="1"
            class="vs-input" aria-describedby="set-max-tokens-help set-model-budget" />
          <p id="set-max-tokens-help" class="text-xs text-vs-text-ghost mt-1">An output ceiling, not a target. Actual usage can be lower.</p>
          <div id="set-model-budget" class="text-xs text-vs-text-ghost mt-3" role="status" aria-live="polite">Checking model limits\u2026</div>
        </div>

        ${k==="openai_compatible"?`
        <fieldset id="set-model-limits" class="min-w-0">
          <legend class="text-sm font-medium text-vs-text-secondary">Advanced model limits <span class="text-vs-text-ghost font-normal">(optional)</span></legend>
          <p id="set-model-limits-help" class="text-xs text-vs-text-ghost mt-2">${j?"Set both limits for the selected model, or leave both blank to use detected limits.":"Only the site owner can change these limits."} Overrides apply only to this endpoint and exact model ID.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label for="set-model-output-limit" class="block text-sm font-medium text-vs-text-secondary mb-1">Model output limit</label>
              <input id="set-model-output-limit" type="number" min="1" max="2000000" step="1" class="vs-input" ${j?"":"readonly"}
                placeholder="Detected or default" aria-describedby="set-model-limits-help set-model-limits-error" />
            </div>
            <div>
              <label for="set-model-context-window" class="block text-sm font-medium text-vs-text-secondary mb-1">Context window</label>
              <input id="set-model-context-window" type="number" min="1" max="10000000" step="1" class="vs-input" ${j?"":"readonly"}
                placeholder="Detected or default" aria-describedby="set-model-limits-help set-model-limits-error" />
            </div>
          </div>
          <p id="set-model-limits-error" class="text-xs text-vs-error mt-2" role="alert" hidden></p>
        </fieldset>`:""}

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

        <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
              <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
                <input type="checkbox" id="set-design-review-enabled" ${c.design_review_enabled?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span class="vs-toggle-track" style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${c.design_review_enabled?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span class="vs-toggle-thumb" style="
                  position: absolute; left: ${c.design_review_enabled?"18px":"2px"}; top: 2px;
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
    ${Pl(t.ok?c:null,(he=R.get("user"))==null?void 0:he.role,(we=t.data)==null?void 0:we.governor_activity)}

    <!-- Card: Email & Notifications -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Email & Notifications</h2>
      <p class="vs-settings-card-subtitle">Configure how VoxelSite sends transactional emails.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-driver" class="block text-sm font-medium text-vs-text-secondary mb-1">Delivery Method</label>
          <select id="set-mail-driver" class="vs-input">
            <option value="none" ${f.driver==="none"?"selected":""}>Not configured</option>
            <option value="php_mail" ${f.driver==="php_mail"?"selected":""}>PHP mail()</option>
            <option value="smtp" ${f.driver==="smtp"?"selected":""}>SMTP</option>
            <option value="mailpit" ${f.driver==="mailpit"?"selected":""}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${f.driver==="smtp"?"block":"none"};">
          <div class="flex flex-col gap-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(x).map(([Z,_e])=>`<option value="${y(Z)}">${y(_e.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${y(f.smtp_host||"")}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${f.smtp_port||587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${f.smtp_encryption==="tls"?"selected":""}>TLS (STARTTLS)</option>
                  <option value="ssl" ${f.smtp_encryption==="ssl"?"selected":""}>SSL</option>
                  <option value="none" ${f.smtp_encryption==="none"?"selected":""}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${y(f.smtp_username||"")}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${f.smtp_password||""}"
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
        <div id="mail-mailpit-fields" style="display: ${f.driver==="mailpit"?"block":"none"};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${y(f.mailpit_host||"localhost")}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${f.mailpit_port||1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${f.driver==="none"?"none":"block"};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div class="flex flex-col gap-4">
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${y(f.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${y(f.from_name||"")}"
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

    ${b?`
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${v?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${$.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(v).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${$.chevronRight}</div>
        </button>
        `:""}
        ${m?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${$.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(m).length} design decisions</span>
          </div>
          <div class="vs-knowledge-card-arrow">${$.chevronRight}</div>
        </button>
        `:""}
      </div>
      <p class="vs-knowledge-hint">
        ${$.info}
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
          ${Ct("Total Requests",Number(h.totals.request_count).toLocaleString())}
          ${Ct("Input Tokens",Number(h.totals.total_input_tokens).toLocaleString())}
          ${Ct("Output Tokens",Number(h.totals.total_output_tokens).toLocaleString())}

        </div>
        ${h.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${h.models.map(Z=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${Ct(Z.ai_model||"Unknown",Number(Z.request_count).toLocaleString()+" requests")}
                ${Ct("Tokens",Number(Z.total_input_tokens).toLocaleString()+" in / "+Number(Z.total_output_tokens).toLocaleString()+" out")}

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
        ${Ct("VoxelSite",u.version||"1.0.0")}
        ${Ct("PHP",u.php_version||"?")}
        ${Ct("SQLite",u.sqlite_version||"?")}
        ${Ct("Database",Na(u.database_size))}
        ${Ct("Preview Files",Na(u.preview_size))}
        ${Ct("Assets",Na(u.assets_size))}
        ${Ct("Upload Limit",u.max_upload||"?")}
        ${Ct("Memory Limit",u.memory_limit||"?")}
      </div>
    </div>

    <!-- Card: Git Updates (renders only when this install is a Git checkout) -->
    <div id="vs-git-update-card"></div>

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
        ${l.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':l.map(Z=>{let _e=(Z.size/1024).toFixed(1),lt=new Date(Z.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${Z.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${Z.lines} lines \xB7 ${_e} KB \xB7 ${lt}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(Z.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${Z.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
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
          ${$.externalLink} View API schema
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
  `,qu(c,g),Dl(e,{getRole:()=>{var Z;return(Z=R.get("user"))==null?void 0:Z.role},getModels:()=>C.get("/settings/models"),put:(Z,_e)=>C.put(Z,_e),reload:us,demoGuard:()=>{var Z;return(Z=window.demoGuard)==null?void 0:Z.call(window)}}),Fu(f,x),Du(),Hu(),zu(c),document.querySelectorAll(".btn-delete-log").forEach(Z=>{Z.addEventListener("click",async()=>{var ht;if((ht=window.demoGuard)!=null&&ht.call(window))return;if(Z.dataset.confirm!=="true"){Z.dataset.confirm="true",Z.innerHTML='<span style="font-size: 11px;">Sure?</span>',Z.style.color="var(--vs-error)",setTimeout(()=>{Z.dataset.confirm==="true"&&(Z.dataset.confirm="",Z.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',Z.style.color="")},3e3);return}let _e=Z.dataset.file,lt=Z.closest(".vs-log-row");lt&&(lt.style.opacity="0.4"),await C.delete("/settings/logs",{file:_e}),us()})});let Y=document.getElementById("btn-delete-all-logs");Y&&Y.addEventListener("click",async()=>{var Z;if(!((Z=window.demoGuard)!=null&&Z.call(window))){if(Y.dataset.confirm!=="true"){Y.dataset.confirm="true",Y.textContent="Sure?",Y.style.color="var(--vs-error)",setTimeout(()=>{Y.dataset.confirm==="true"&&(Y.dataset.confirm="",Y.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',Y.style.color="")},3e3);return}Y.disabled=!0,Y.textContent="Deleting...",await C.delete("/settings/logs",{file:"*"}),us()}});let ee=document.getElementById("btn-view-memory");ee&&v&&ee.addEventListener("click",()=>jl("Site Memory",v,"memory"));let H=document.getElementById("btn-view-design");H&&m&&H.addEventListener("click",()=>jl("Design Intelligence",m,"design")),Pu(),_u(),Ru(),ju(T)}function Mu(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}async function _u(){let e=document.getElementById("vs-git-update-card");if(e)try{let{ok:t,data:s}=await C.get("/update/git-status");if(!t||!s||!s.is_repo){e.innerHTML="";return}Bu(e,s)}catch{e.innerHTML=""}}function Bu(e,t){let s=t.state==="update_available",n=s?'<span class="vs-pill vs-pill-success">'+t.behind+" available</span>":t.state==="up_to_date"?'<span class="vs-pill vs-pill-subtle">Up to date</span>':'<span class="vs-pill vs-pill-subtle">Action needed</span>',o=[t.branch?`branch <code>${y(t.branch)}</code>`:"",t.short_sha?`at <code>${y(t.short_sha)}</code>`:"",t.upstream?`tracking <code>${y(t.upstream)}</code>`:""].filter(Boolean).join(" \xB7 ");e.innerHTML=`
    <div class="vs-settings-card" id="vs-git-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Git Updates</h2>
        ${n}
      </div>
      <p class="vs-settings-card-subtitle">${y(t.message||"")}</p>
      <div id="vs-git-body">
        ${s?`
          <button id="btn-git-update" class="vs-btn vs-btn-primary vs-btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
            Update now
          </button>`:""}
        ${o?`<p style="font-size: 11px; color: var(--vs-text-ghost); margin: 12px 0 0;">${o}</p>`:""}
      </div>
    </div>
  `;let i=document.getElementById("btn-git-update");i&&i.addEventListener("click",Au)}async function Au(){var s,n,o,i;if((s=window.demoGuard)!=null&&s.call(window))return;let e=document.getElementById("vs-git-body");if(!(!e||!confirm(`Pull the latest changes from Git?

The app resets to match the repository (system files only). Your pages, database, settings, and uploaded files are preserved. A reload is required after.`))){e.innerHTML='<div style="display: flex; align-items: center; gap: 10px;"><div class="vs-update-spinner"></div><span>Updating\u2026</span></div>';try{let{ok:a,data:r,error:l}=await C.post("/update/git-update",{});if(a){let c=((i=(o=(n=r.migrations)==null?void 0:n.result)==null?void 0:o.applied)==null?void 0:i.length)||0;e.innerHTML=`
        <div class="vs-update-result-title" style="color: var(--vs-success);">Updated to v${y(r.to_version||"")}.</div>
        <div class="vs-update-result-meta">
          ${y(r.from_sha||"?")} \u2192 ${y(r.to_sha||"?")}${c?` \xB7 ${c} migration${c===1?"":"s"} applied`:" \xB7 no migrations needed"}
        </div>
        <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">Reload Studio</button>
      `}else e.innerHTML=`
        <div class="vs-update-result-title" style="color: var(--vs-error);">${y((l==null?void 0:l.message)||"Update failed.")}</div>
        <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="location.reload()">Close</button>
      `}catch(a){e.innerHTML=`<div class="vs-update-result-title" style="color: var(--vs-error);">${y(a.message||"Network error.")}</div>`}}}function Pu(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;r();async function r(){var d;if(a)try{let{ok:v,data:m}=await C.get("/update/dist-packages");if(!v||!((d=m==null?void 0:m.packages)!=null&&d.length)){a.innerHTML="";return}let b=m.current_version||"0.0.0",h=m.packages.map(g=>{let f=(g.size/1024/1024).toFixed(1),x=Mu(g.version,b)>0,w=g.version===b,k=x?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':w?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${y(g.filename)}</strong>
                ${k}
              </div>
              <div class="vs-dist-pkg-meta">v${y(g.version)} \xB7 ${f} MB</div>
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
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(g=>{g.addEventListener("click",()=>l(g.dataset.filename,g.dataset.version))})}catch{}}async function l(d,v){var b,h;if(!((b=window.demoGuard)!=null&&b.call(window)||!confirm(`Apply update from "${d}" (v${v})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${d}...`,a&&(a.innerHTML="");try{let{ok:g,data:f,error:x}=await C.post("/update/apply-local",{filename:d});s.classList.add("hidden"),n.classList.remove("hidden");let w=document.getElementById("vs-update-result-icon"),k=document.getElementById("vs-update-result-message");if(g){let E=f;w.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',k.innerHTML=`
          <div class="vs-update-result-title">${y(E.message)}</div>
          <div class="vs-update-result-meta">
            ${E.files_updated} files updated \xB7 ${E.files_skipped} preserved
            ${E.migrations_run?` \xB7 ${E.migrations_run} migration${E.migrations_run===1?"":"s"}`:""}
            ${(h=E.errors)!=null&&h.length?` \xB7 ${E.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else u("Update Failed",(x==null?void 0:x.message)||"Unknown error")}catch(g){u("Update Failed",y(g.message||"Network error."))}}}e.addEventListener("click",d=>{var v;(v=window.demoGuard)!=null&&v.call(window)||d.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",d=>{d.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",d=>{var m,b,h;if(d.preventDefault(),e.classList.remove("is-dragover"),(m=window.demoGuard)!=null&&m.call(window))return;let v=(h=(b=d.dataTransfer)==null?void 0:b.files)==null?void 0:h[0];v&&v.name.endsWith(".zip")&&c(v)}),o.addEventListener("change",()=>{var v;let d=(v=o.files)==null?void 0:v[0];d&&c(d),o.value=""});async function c(d){var b,h;let v=document.querySelector(".vs-sys-grid");if(v){let g=v.querySelectorAll(".vs-sys-value"),f="";if(v.querySelectorAll(".vs-sys-label").forEach((x,w)=>{var k,E;x.textContent.trim()==="Upload Limit"&&(f=((E=(k=g[w])==null?void 0:k.textContent)==null?void 0:E.trim())||"")}),f){let x=p(f);if(x>0&&d.size>x){let w=(d.size/1024/1024).toFixed(1);u("File Too Large",`The update file is ${w} MB but your server's upload limit is ${f}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${w} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${d.name}" (${(d.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${d.name}...`;try{let g=new FormData;g.append("update_zip",d);let f=R.get("sessionToken"),x=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:f?{"X-VS-Token":f}:{},body:g}),w=x.headers.get("content-type")||"",k;if(!w.includes("application/json")){let T=await x.text();if(T.includes("POST Content-Length")||T.includes("upload_max_filesize")||T.includes("exceeds")){u("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}u("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}k=await x.json(),s.classList.add("hidden"),n.classList.remove("hidden");let E=document.getElementById("vs-update-result-icon"),I=document.getElementById("vs-update-result-message");if(k.ok){let T=k.data;E.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',I.innerHTML=`
          <div class="vs-update-result-title">${y(T.message)}</div>
          <div class="vs-update-result-meta">
            ${T.files_updated} files updated \xB7 ${T.files_skipped} preserved
            ${T.migrations_run?` \xB7 ${T.migrations_run} migration${T.migrations_run===1?"":"s"}`:""}
            ${(b=T.errors)!=null&&b.length?` \xB7 ${T.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else u("Update Failed",((h=k.error)==null?void 0:h.message)||"Unknown error")}catch(g){let f=g.message||"Network error. Check your connection.";f.includes("Unexpected token")||f.includes("not valid JSON")?u("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):u("Upload Failed",y(f))}}}function u(d,v){s.classList.add("hidden"),n.classList.remove("hidden");let m=document.getElementById("vs-update-result-icon"),b=document.getElementById("vs-update-result-message");m.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',b.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${y(d)}</div>
      <div class="vs-update-result-meta">${v}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function p(d){let v=d.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!v)return 0;let m=parseFloat(v[1]),b=v[2].toUpperCase();return b==="GB"||b==="G"?m*1024*1024*1024:b==="MB"||b==="M"?m*1024*1024:b==="KB"||b==="K"?m*1024:0}}function Ru(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var r,l,c;if(i.preventDefault(),e.classList.remove("is-dragover"),(r=window.demoGuard)!=null&&r.call(window))return;let a=(c=(l=i.dataTransfer)==null?void 0:l.files)==null?void 0:c[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,r;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let l=await C.delete("/settings/favicon");l.ok?(B("Favicon removed.","success"),us()):B(((r=l.error)==null?void 0:r.message)||"Could not remove favicon.","error")}catch{B("Could not remove favicon.","error")}}});async function o(i){var u;if(i.size>524288){B("Favicon must be under 512 KB.","error");return}let r=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!r.includes(i.type)){B("Favicon must be a .ico file.","error");return}let c=document.getElementById("vs-favicon-preview");c&&(c.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let p=new FormData;p.append("favicon",i);let d=R.get("sessionToken"),m=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:d?{"X-VS-Token":d}:{},body:p})).json();m.ok?(B("Favicon updated.","success"),us()):(B(((u=m.error)==null?void 0:u.message)||"Upload failed.","error"),us())}catch{B("Upload failed. Check your connection.","error"),us()}}}function jl(e,t,s){var l,c,u;(l=document.getElementById("vs-knowledge-overlay"))==null||l.remove();let n=p=>p.replace(/[_-]/g," ").replace(/\b\w/g,d=>d.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([p,d])=>{let v=typeof d=="object"?d.value||JSON.stringify(d):String(d),m=typeof d=="object"?d.confidence:null,b=m==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${y(n(p))}</div>
          <div class="vs-kv-value">
            <span>${y(v)}</span>
            ${m?`<span class="vs-kv-badge ${b}">${y(m)}</span>`:""}
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
          <div class="vs-knowledge-modal-icon">${s==="memory"?$.book:$.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${y(e)}</h2>
            <p class="vs-knowledge-modal-subtitle">${s==="memory"?"Facts the AI has learned about your business from conversations.":"Design decisions the AI uses to maintain visual consistency."}</p>
          </div>
        </div>
        <button id="vs-knowledge-close" class="vs-btn vs-btn-ghost vs-btn-icon" title="Close">${$.x}</button>
      </div>
      <div class="vs-knowledge-modal-body">
        ${o}
      </div>
      <div class="vs-knowledge-modal-footer">
        <span class="vs-knowledge-modal-hint">
          ${$.info}
          These values are managed by VoxelSite. Ask in chat to update them.
        </span>
        <button id="vs-knowledge-done" class="vs-btn vs-btn-primary vs-btn-sm">Done</button>
      </div>
    </div>
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",r)},r=p=>{p.key==="Escape"&&a()};document.addEventListener("keydown",r),(c=i.querySelector("#vs-knowledge-close"))==null||c.addEventListener("click",a),(u=i.querySelector("#vs-knowledge-done"))==null||u.addEventListener("click",a),$e(i,a)}function Du(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Ou()})}function Hu(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Nu()})}function Nu(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-install-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let l=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()===a?ql(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?ql(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>Ee(t)),t.addEventListener("click",l=>{l.target===t&&Ee(t)});let r=l=>{l.key==="Escape"&&(Ee(t),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)}async function ql(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await C.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let r=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=r,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function Wl(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function Ou(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let r=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()==="RESET"?Fl(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?Fl(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>Ee(t)),t.addEventListener("click",r=>{r.target===t&&Ee(t)});let a=r=>{r.key==="Escape"&&(Ee(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function Fl(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:r}=await C.post("/site/reset",{confirm:"RESET"});if(i){R.set("pages",[]),R.set("hasFormSchemas",!1),R.set("conversations",null),R.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{Ee(e),window.location.hash!=="#/chat"?yt.navigate("chat"):yt.refresh()},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let l=e.querySelector(".vs-modal-desc");if(l){let c=l.textContent;l.textContent=(r==null?void 0:r.message)||"Reset failed. Please try again.",l.style.color="var(--vs-error)",setTimeout(()=>{l.textContent=c,l.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function ju(e){var i,a;let t=document.getElementById("set-ai-model");if(!t)return;let s=++co,n=((i=document.getElementById("set-base-url"))==null?void 0:i.value)||"",o=[];try{let{ok:r,data:l}=await C.get("/settings/models");r&&(o=(l==null?void 0:l.models)||[])}catch{}!t.isConnected||s!==co||n!==(((a=document.getElementById("set-base-url"))==null?void 0:a.value)||"")||(t.innerHTML=bi(o,t.value||e),t.dispatchEvent(new Event("change")))}function Ct(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function Na(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function qu(e,t){var p;let s=e.ai_provider||"claude",n=Ol(document.getElementById("settings-content"),{settings:e,post:(d,v,m)=>C.post(d,v,m),demoMode:document.documentElement.dataset.demo==="true",canEditModelLimits:((p=R.get("user"))==null?void 0:p.role)==="owner"}),o=document.getElementById("set-ai-provider");o&&o.addEventListener("change",async d=>{var v;if((v=window.demoGuard)!=null&&v.call(window)){d.target.value=s;return}n.invalidate(),co++,s=d.target.value,await C.put("/settings",{ai_provider:s}),us()});let i=document.getElementById("btn-test-api"),a=document.getElementById("set-api-key");i&&i.addEventListener("click",async()=>{var x,w,k,E,I,T,N;if((x=window.demoGuard)!=null&&x.call(window))return;let d=((w=a==null?void 0:a.value)==null?void 0:w.trim())||"",v=((E=(k=document.getElementById("set-base-url"))==null?void 0:k.value)==null?void 0:E.trim())||"";if(s!=="openai_compatible"&&(!d||d.startsWith("\u2022\u2022"))){ja("Enter a new API key to test.","warning");return}i.textContent="Testing...",i.disabled=!0;let m=++co,b=document.getElementById("set-ai-model"),{ok:h,data:g,error:f}=await C.post("/settings/test-api",{provider:s,api_key:d.startsWith("\u2022\u2022")?"":d,base_url:v});if(i.textContent="Test Connection",i.disabled=!1,!(!(b!=null&&b.isConnected)||m!==co||v!==(((T=(I=document.getElementById("set-base-url"))==null?void 0:I.value)==null?void 0:T.trim())||""))){if(h){if(ja("\u2713 Connected successfully!","success"),(N=g==null?void 0:g.models)!=null&&N.length&&b){let j=b.value||e[`ai_${s}_model`]||"";b.innerHTML=bi(g.models,j),b.dispatchEvent(new Event("change"))}}else ja("\u2717 "+((f==null?void 0:f.message)||"Connection failed."),"error");n.refresh()}});let r=document.getElementById("btn-save-identity"),l=document.getElementById("save-identity-status");r&&r.addEventListener("click",async()=>{var b,h,g,f,x;if((b=window.demoGuard)!=null&&b.call(window))return;r.textContent="Saving...",r.disabled=!0;let d={site_name:((g=(h=document.getElementById("set-site-name"))==null?void 0:h.value)==null?void 0:g.trim())||"",site_tagline:((x=(f=document.getElementById("set-site-tagline"))==null?void 0:f.value)==null?void 0:x.trim())||""},{ok:v,error:m}=await C.put("/settings",d);if(r.textContent="Save Identity",r.disabled=!1,l){if(l.classList.remove("hidden"),v){l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3",R.set("siteName",d.site_name),document.title=d.site_name?`Studio \u2014 ${d.site_name}`:"Studio \u2014 VoxelSite";let w=document.querySelector(".vs-logo-text");w&&(w.textContent=d.site_name||"VoxelSite")}else l.textContent="\u2717 "+((m==null?void 0:m.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3";setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3)}});let c=document.getElementById("btn-save-settings"),u=document.getElementById("save-status");c&&c.addEventListener("click",async()=>{var f,x,w,k,E,I,T;if((f=window.demoGuard)!=null&&f.call(window)||!((x=document.getElementById("set-max-tokens"))!=null&&x.reportValidity()))return;let d=n.collectLimits();if(d===null)return;c.textContent="Saving...",c.disabled=!0;let v={ai_provider:s,[`ai_${s}_model`]:((w=document.getElementById("set-ai-model"))==null?void 0:w.value)||"",ai_max_tokens:parseInt(((k=document.getElementById("set-max-tokens"))==null?void 0:k.value)||"32000",10),evaluator_enabled:(E=document.getElementById("set-evaluator-enabled"))!=null&&E.checked?1:0,design_review_enabled:(I=document.getElementById("set-design-review-enabled"))!=null&&I.checked?1:0},m=document.getElementById("set-base-url");m&&(v.ai_openai_compatible_base_url=m.value.trim(),d!==void 0&&(v.ai_openai_compatible_model_limits=d));let b=(T=a==null?void 0:a.value)==null?void 0:T.trim();b&&!b.startsWith("\u2022\u2022")&&(v[`ai_${s}_api_key`]=b);let{ok:h,error:g}=await C.put("/settings",v);c.textContent="Save Settings",c.disabled=!1,u&&(u.classList.remove("hidden"),h?(u.textContent="\u2713 Saved",u.className="text-xs text-vs-success ml-3"):(u.textContent="\u2717 "+((g==null?void 0:g.message)||"Failed to save."),u.className="text-xs text-vs-error ml-3"),setTimeout(()=>u==null?void 0:u.classList.add("hidden"),3e3))}),["set-evaluator-enabled","set-design-review-enabled"].forEach(d=>{let v=document.getElementById(d);if(!v)return;let m=v.closest("label")||v.parentElement,b=m==null?void 0:m.querySelector(".vs-toggle-track"),h=m==null?void 0:m.querySelector(".vs-toggle-thumb");v.addEventListener("change",()=>{b&&(b.style.background=v.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),h&&(h.style.left=v.checked?"18px":"2px")})})}function Fu(e,t){var v;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function r(){if(!e.smtp_host)return"gmail";for(let[m,b]of Object.entries(t))if(b.host&&b.host===e.smtp_host)return m;return"custom"}if(i){let m=r();i.value=m,a&&((v=t[m])!=null&&v.help)&&(a.textContent=t[m].help)}s&&s.addEventListener("change",()=>{let m=s.value;n&&(n.style.display=m==="smtp"?"block":"none"),o&&(o.style.display=m==="mailpit"?"block":"none");let b=document.getElementById("mail-common-fields");b&&(b.style.display=m==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let m=t[i.value];if(!m)return;let b=document.getElementById("set-smtp-host"),h=document.getElementById("set-smtp-port"),g=document.getElementById("set-smtp-encryption");b&&(b.value=m.host||""),h&&(h.value=m.port||587),g&&(g.value=m.encryption||"tls"),a&&(a.textContent=m.help||"")});let l=document.getElementById("btn-toggle-smtp-pass"),c=document.getElementById("set-smtp-password");l&&c&&l.addEventListener("click",()=>{let m=c.type==="password";c.type=m?"text":"password",l.innerHTML=m?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let u=document.getElementById("btn-mail-test");u&&u.addEventListener("click",async()=>{var x,w,k;if((x=window.demoGuard)!=null&&x.call(window))return;let m=(k=(w=document.getElementById("set-mail-test-recipient"))==null?void 0:w.value)==null?void 0:k.trim();if(!m){Oa("Enter an email address to send the test to.","warning");return}u.textContent="Sending...",u.disabled=!0;let b=zl();b.test_recipient=m;let{ok:h,data:g,error:f}=await C.post("/settings/mail/test",b);u.textContent="Send Test",u.disabled=!1,h?Oa("\u2713 "+((g==null?void 0:g.message)||"Test email sent successfully!"),"success"):Oa("\u2717 "+((f==null?void 0:f.message)||"Test failed."),"error")});let p=document.getElementById("btn-save-mail"),d=document.getElementById("save-mail-status");p&&p.addEventListener("click",async()=>{var g;if((g=window.demoGuard)!=null&&g.call(window))return;p.textContent="Saving...",p.disabled=!0;let m=zl(),{ok:b,error:h}=await C.post("/settings/mail",m);p.textContent="Save Email Settings",p.disabled=!1,d&&(d.classList.remove("hidden"),b?(d.textContent="\u2713 Saved",d.className="text-xs text-vs-success ml-3"):(d.textContent="\u2717 "+((h==null?void 0:h.message)||"Failed to save."),d.className="text-xs text-vs-error ml-3"),setTimeout(()=>d==null?void 0:d.classList.add("hidden"),3e3))})}function zl(){var t,s,n,o,i,a,r,l,c,u,p,d,v,m,b;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((l=(r=document.getElementById("set-smtp-host"))==null?void 0:r.value)==null?void 0:l.trim())||"",smtp_port:parseInt(((c=document.getElementById("set-smtp-port"))==null?void 0:c.value)||"587",10),smtp_username:((p=(u=document.getElementById("set-smtp-username"))==null?void 0:u.value)==null?void 0:p.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((d=document.getElementById("set-smtp-encryption"))==null?void 0:d.value)||"tls",mailpit_host:((m=(v=document.getElementById("set-mailpit-host"))==null?void 0:v.value)==null?void 0:m.trim())||"localhost",mailpit_port:parseInt(((b=document.getElementById("set-mailpit-port"))==null?void 0:b.value)||"1025",10)}}function Oa(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function ja(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function zu(e){let t=document.getElementById("set-api-enabled"),s=document.getElementById("api-access-body"),n=document.getElementById("btn-save-api-settings"),o=document.getElementById("btn-generate-api-key");t&&t.addEventListener("change",()=>{let i=t.checked,a=t.parentElement.querySelector(".vs-toggle-track"),r=t.parentElement.querySelector(".vs-toggle-thumb");a&&(a.style.background=i?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),r&&(r.style.left=i?"18px":"2px"),s&&(s.style.opacity=i?"":"0.4",s.style.pointerEvents=i?"":"none")}),n&&n.addEventListener("click",async()=>{var l,c,u,p,d;if((l=window.demoGuard)!=null&&l.call(window))return;let i=document.getElementById("save-api-status");n.disabled=!0,n.textContent="Saving...";let a={agent_api_enabled:((c=document.getElementById("set-api-enabled"))==null?void 0:c.checked)||!1,agent_api_allowed_origins:((p=(u=document.getElementById("set-api-origins"))==null?void 0:u.value)==null?void 0:p.trim())||"*"},r=await C.put("/settings",a);n.disabled=!1,n.textContent="Save API Settings",r.ok?(B("API settings saved","success"),i&&(i.textContent="Saved",i.className="text-xs text-vs-success",i.classList.remove("hidden"),setTimeout(()=>i.classList.add("hidden"),2e3))):B(((d=r.error)==null?void 0:d.message)||"Failed to save","error")}),qa(),o&&o.addEventListener("click",()=>{var i;(i=window.demoGuard)!=null&&i.call(window)||Vu()})}var Ul={owner:["pages:read","pages:write","settings:read","settings:write","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],editor:["pages:read","pages:write","compile:trigger","submissions:read","assets:read","assets:write","tools:invoke"],agent:["pages:read","pages:write","settings:read","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],viewer:["pages:read","settings:read","submissions:read","assets:read"]},Uu={"prompt:execute":["owner","editor","agent"]};async function qa(){var t;let e=document.getElementById("api-keys-list");if(e)try{let n=((t=(await C.get("/settings/api-keys")).data)==null?void 0:t.keys)||[];if(n.length===0){e.innerHTML=`
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
      </div>`,e.querySelectorAll(".btn-revoke-key").forEach(o=>{o.addEventListener("click",async()=>{var r;if((r=window.demoGuard)!=null&&r.call(window))return;let i=o.dataset.id;if(o.dataset.confirm!=="true"){o.dataset.confirm="true",o.innerHTML='<span style="font-size: 11px; color: var(--vs-error);">Sure?</span>',setTimeout(()=>{o.dataset.confirm==="true"&&(o.dataset.confirm="",o.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Revoke')},3e3);return}let a=o.closest(".vs-api-key-row");a&&(a.style.opacity="0.4"),await C.delete(`/settings/api-keys/${i}`),B("API key revoked","success"),qa()})})}catch{e.innerHTML='<div style="font-size: 12px; color: var(--vs-text-ghost); text-align: center; padding: 16px 0;">Could not load API keys.</div>'}}function Vu(){let e=document.getElementById("generate-key-modal");e&&e.remove();let t=document.createElement("div");t.className="vs-modal-overlay",t.id="generate-key-modal",t.innerHTML=`
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
    </div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>Ee(t),n=d=>{d.key==="Escape"&&(d.preventDefault(),s())};document.addEventListener("keydown",n);let o=new MutationObserver(()=>{document.body.contains(t)||(document.removeEventListener("keydown",n),o.disconnect())});o.observe(document.body,{childList:!0}),$e(t,s),t.querySelector("#cancel-generate-key").addEventListener("click",s);let i=t.querySelector("#gen-key-label");i==null||i.addEventListener("keydown",d=>{var v;d.key==="Enter"&&(d.preventDefault(),(v=t.querySelector("#confirm-generate-key"))==null||v.click())});let a=t.querySelector("#gen-key-prompt-execute"),r=t.querySelector("#gen-key-prompt-toggle"),l=a,c=r==null?void 0:r.querySelector('span[style*="font-size: 11px"]'),u=d=>{(Uu["prompt:execute"]||[]).includes(d)?(l.disabled=!1,r.style.opacity="1",r.style.cursor="pointer",c&&(c.textContent="Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.")):(l.checked=!1,l.disabled=!0,r.style.opacity="0.45",r.style.cursor="not-allowed",r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)",c&&(c.textContent="Not available for read-only roles. Prompt execution requires write access."))},p=t.querySelector("#gen-key-role");p==null||p.addEventListener("change",()=>u(p.value)),u((p==null?void 0:p.value)||"agent"),a==null||a.addEventListener("change",()=>{a.checked?(r.style.borderColor="color-mix(in srgb, var(--vs-accent) 40%, transparent)",r.style.background="color-mix(in srgb, var(--vs-accent) 4%, var(--vs-bg-base))"):(r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)")}),t.querySelector("#confirm-generate-key").addEventListener("click",async()=>{var f,x,w,k,E,I;let d=(x=(f=document.getElementById("gen-key-label"))==null?void 0:f.value)==null?void 0:x.trim(),v=((w=document.getElementById("gen-key-role"))==null?void 0:w.value)||"agent",m=(k=document.getElementById("gen-key-prompt-execute"))==null?void 0:k.checked;if(!d){B("Please enter a label for the key","error");return}let b=t.querySelector("#confirm-generate-key");b.disabled=!0,b.textContent="Generating\u2026";let h={label:d,role:v};m&&(h.scopes=[...Ul[v]||Ul.agent,"prompt:execute"]);let g=await C.post("/settings/api-keys",h);g.ok&&((E=g.data)!=null&&E.key)?(s(),Wu(g.data.key,d),qa()):(b.disabled=!1,b.textContent="Generate",B(((I=g.error)==null?void 0:I.message)||"Failed to generate key","error"))})}function Wu(e,t){let s=document.getElementById("key-reveal-modal");s&&s.remove();let n=document.createElement("div");n.className="vs-modal-overlay",n.id="key-reveal-modal",n.innerHTML=`
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("is-visible"));let o=()=>Ee(n),i=l=>{l.key==="Escape"&&(l.preventDefault(),o())};document.addEventListener("keydown",i);let a=new MutationObserver(()=>{document.body.contains(n)||(document.removeEventListener("keydown",i),a.disconnect())});a.observe(document.body,{childList:!0}),$e(n,o),n.querySelector("#close-key-reveal").addEventListener("click",o);let r=n.querySelector("#revealed-key-input");r==null||r.addEventListener("focus",()=>r.select()),n.querySelector("#copy-api-key").addEventListener("click",async()=>{let l=n.querySelector("#copy-api-key");try{await navigator.clipboard.writeText(e),l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',l.style.color="#22c55e",setTimeout(()=>{l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',l.style.color=""},2e3)}catch{r==null||r.select()}})}var Ts=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},on=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Fa={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},Gu={contact:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',newsletter:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',callback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',feedback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'};function Kl(){return setTimeout(()=>Ku(),0),`
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
  `}async function Ku(){var a,r,l,c,u,p;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let d=await Gl();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let w=function(k){let E=document.getElementById("bar-color-swatch"),I=document.getElementById("bar-brand-hex"),T=document.getElementById("bar-brand-color");E&&(E.style.background=k),I&&I!==document.activeElement&&(I.value=k),T&&(T.value=k),document.querySelectorAll(".bar-color-preset").forEach(N=>{N.style.borderColor=N.dataset.color.toLowerCase()===k.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:d,data:v}=await C.get("/agentic/actions/bar-settings"),m=d&&(v==null?void 0:v.settings)||{theme:"bottom-bar",visibility:"all-pages"},b=m.theme||"bottom-bar",h=m.visibility||"all-pages",g={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
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
      </svg>`},f={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},x={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(x).map(([k,E])=>`<option value="${k}" ${h===k?"selected":""}>${E}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(g).map(([k,E])=>{let I=k===b;return`
              <button type="button" class="bar-theme-option" data-theme="${k}" style="
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
                <div style="width: 100%; max-width: 120px;">${E}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${I?"var(--vs-accent)":"var(--vs-text-secondary)"};">${f[k]}</span>
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
              ${["light","dark"].map(k=>{let E=k===(m.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${k}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${E?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${E?"#fff":"var(--vs-text-secondary)"};
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
    `,document.querySelectorAll(".bar-theme-option").forEach(k=>{k.addEventListener("click",async()=>{let E=k.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(T=>{let N=T.dataset.theme===E;T.style.borderColor=N?"var(--vs-accent)":"var(--vs-border-subtle)",T.style.background=N?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",T.style.color=N?"var(--vs-accent)":"var(--vs-text-ghost)",T.classList.toggle("active",N);let j=T.querySelector("span");j&&(j.style.color=N?"var(--vs-accent)":"var(--vs-text-secondary)");let W=T.querySelector('[style*="position: absolute"]');if(W&&!N&&W.remove(),N&&!T.querySelector('[style*="position: absolute"]')){let q=document.createElement("div");q.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",q.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',T.appendChild(q)}});let{ok:I}=await C.put("/agentic/actions/bar-settings",{theme:E});I&&(k.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>k.style.boxShadow="",400),B("Bar style updated","success"))})}),(r=document.getElementById("bar-visibility"))==null||r.addEventListener("change",async k=>{let{ok:E}=await C.put("/agentic/actions/bar-settings",{visibility:k.target.value});E&&B("Bar visibility updated","success")}),document.querySelectorAll(".bar-scheme-btn").forEach(k=>{k.addEventListener("click",async()=>{let E=k.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(T=>{let N=T.dataset.scheme===E;T.style.background=N?"var(--vs-accent)":"var(--vs-bg-surface)",T.style.color=N?"#fff":"var(--vs-text-secondary)"});let{ok:I}=await C.put("/agentic/actions/bar-settings",{color_scheme:E});I&&B("Color scheme updated","success")})}),(l=document.getElementById("bar-brand-color"))==null||l.addEventListener("input",k=>{w(k.target.value)}),(c=document.getElementById("bar-brand-color"))==null||c.addEventListener("change",async k=>{let{ok:E}=await C.put("/agentic/actions/bar-settings",{brand_color:k.target.value});E&&B("Brand color updated","success")}),(u=document.getElementById("bar-brand-hex"))==null||u.addEventListener("change",async k=>{let E=k.target.value.trim();if(E.startsWith("#")||(E="#"+E),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(E)){w(E);let{ok:I}=await C.put("/agentic/actions/bar-settings",{brand_color:E});I&&B("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach(k=>{k.addEventListener("click",async()=>{let E=k.dataset.color;w(E);let{ok:I}=await C.put("/agentic/actions/bar-settings",{brand_color:E});I&&B("Brand color updated","success")})}),w(m.brand_color||"#EA580C")}let{ok:s,data:n}=await C.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon" style="color: var(--vs-accent);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="vs-empty-state-title">No actions yet</p>
          <p class="vs-empty-state-desc">Create your first agent action to let AI assistants and website visitors interact with your business \u2014 reservations, appointments, quotes, and more.</p>
          <button id="btn-empty-new-action" class="vs-btn vs-btn-primary vs-btn-sm" style="margin-top: 12px;">${$.plus} New Action</button>
        </div>
      </div>
    `,(p=document.getElementById("btn-empty-new-action"))==null||p.addEventListener("click",async()=>{let d=await Gl();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((d,v)=>{let m=d.active,b=d._stats||d.stats||{},h=b.total||0,g=b.last_created_at?Yn(b.last_created_at):"\u2014",f={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},x=f[d.icon]||f.circle;return`
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
              ${x}
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
                <span>${h} submission${h!==1?"s":""}</span>
                ${b.today>0?`<span class="vs-form-card-dot">\xB7</span><span>+${b.today} today</span>`:""}
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
  `,document.querySelectorAll(".vs-action-list-row").forEach(d=>{d.addEventListener("click",v=>{if(v.target.closest(".vs-action-reorder"))return;let m=d.dataset.actionId;m&&(window.location.hash="#/actions/"+encodeURIComponent(m))})});async function i(){let d=document.querySelectorAll("#actions-list .vs-action-list-row"),v=Array.from(d).map(m=>m.dataset.actionId);await C.post("/agentic/actions/reorder",{order:v})}document.querySelectorAll(".action-move-up").forEach(d=>{d.addEventListener("click",async v=>{v.preventDefault(),v.stopPropagation();let m=d.closest(".vs-action-list-row"),b=m==null?void 0:m.previousElementSibling;b&&(m.parentNode.insertBefore(m,b),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(d=>{d.addEventListener("click",async v=>{v.preventDefault(),v.stopPropagation();let m=d.closest(".vs-action-list-row"),b=m==null?void 0:m.nextElementSibling;b&&(m.parentNode.insertBefore(b,m),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})})}async function Gl(){return new Promise(async e=>{var r;let{ok:t,data:s}=await C.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 580px;">
        <div class="vs-modal-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
          <h2 class="vs-modal-title" style="margin: 0;">${$.zap} New Agent Action</h2>
          <button id="close-new-action-modal" style="background: none; border: none; cursor: pointer; color: var(--vs-text-ghost); padding: 4px; margin: -4px -4px 0 0; line-height: 0; border-radius: var(--radius-md); transition: color 0.15s ease;" onmouseenter="this.style.color='var(--vs-text-primary)'" onmouseleave="this.style.color='var(--vs-text-ghost)'">${$.x}</button>
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
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${Gu[l.id]||$.zap}</span>
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
              <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: transparent; color: var(--vs-text-ghost);">${$.plus}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-secondary);">Blank</span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.3;">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(l=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(l)},a=l=>{l.key==="Escape"&&(l.preventDefault(),i())};document.addEventListener("keydown",a),$e(o,i),(r=document.getElementById("close-new-action-modal"))==null||r.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(l=>{l.addEventListener("mouseenter",()=>{l.style.borderColor="var(--vs-accent)",l.style.background="var(--vs-bg-raised)"}),l.addEventListener("mouseleave",()=>{l.style.borderColor=(l.dataset.templateId==="blank","var(--vs-border)"),l.style.background=l.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),l.addEventListener("click",async()=>{var u,p;let c=l.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(d=>{d.style.pointerEvents="none",d.style.opacity="0.5"}),l.style.opacity="1",l.style.borderColor="var(--vs-accent)",c==="blank"){let d={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"email",type:"email",label:"Email",placeholder:"you@example.com",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:v,data:m}=await C.post("/agentic/actions",d);v&&(m!=null&&m.action)?(B("Action created","success"),i({ok:!0,actionId:m.action.id})):(B(((u=m==null?void 0:m.error)==null?void 0:u.message)||"Failed to create action","error"),i())}else{let{ok:d,data:v}=await C.post("/agentic/actions/from-template",{template_id:c});d&&(v!=null&&v.action)?(B(`${v.action.name} created`,"success"),i({ok:!0,actionId:v.action.id})):(B(((p=v==null?void 0:v.error)==null?void 0:p.message)||"Failed to create action","error"),i())}})})})}function Yl(e){return setTimeout(()=>yi(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function yi(e){var c,u,p,d,v,m,b,h,g,f,x,w,k,E,I,T,N,j,W,q;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await C.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,r=i.stats||{},l=a.active;if(t.innerHTML=`
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
            ${$.copy} Duplicate
          </button>
          <button id="btn-delete-action" class="vs-btn vs-btn-ghost vs-btn-sm" style="color: var(--vs-error);" title="Delete">
            ${$.trash}
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
  `,s){let ae=function(_){let V=_.querySelector(".field-required");if(!V)return;let oe=_.querySelectorAll("span")[0],L=_.querySelectorAll("span")[1],A=()=>{oe.style.background=V.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",L.style.left=V.checked?"18px":"2px"};V.addEventListener("change",A)},he=function(_){return _.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},we=function(){let _=document.querySelectorAll("#action-fields-builder .vs-field-row"),V=[],oe=new Set;return _.forEach(L=>{var X,Q,z,K;let A=((Q=(X=L.querySelector(".field-label"))==null?void 0:X.value)==null?void 0:Q.trim())||"",M=((z=L.querySelector(".field-type"))==null?void 0:z.value)||"text",D=((K=L.querySelector(".field-required"))==null?void 0:K.checked)||!1,O=A?he(A):"";if(oe.has(O)){let te=2;for(;oe.has(O+"_"+te);)te++;O=O+"_"+te}if(oe.add(O),O&&A){let te={name:O,type:M,label:A,required:D},ge=L.dataset.placeholder;ge&&(te.placeholder=ge);let de=L.dataset.default;de&&(te.default_value=de);let Le=L.dataset.description;Le&&(te.description=Le);let xe=L.dataset.min;xe!==""&&xe!==void 0&&(te.min=Number(xe));let Be=L.dataset.max;Be!==""&&Be!==void 0&&(te.max=Number(Be));let be=L.dataset.maxlength;be&&(te.max_length=Number(be));let Pe=L.dataset.minlength;Pe&&(te.min_length=Number(Pe));let le=L.dataset.options;if(le)try{te.options=JSON.parse(le)}catch{te.options=le.split(",").map(He=>He.trim()).filter(Boolean)}if(M==="file"){let Ae=L.dataset.allowedExtensions;if(Ae)try{te.allowed_extensions=JSON.parse(Ae)}catch{te.allowed_extensions=Ae.split(",").map(pe=>pe.trim().toLowerCase()).filter(Boolean)}let He=L.dataset.maxSizeMb;He&&(te.max_size_mb=Number(He))}M==="checkbox"&&L.dataset.checkedDefault==="true"&&(te.checked_default=!0),V.push(te)}}),V},_e=function(_){var V,oe;(V=_.querySelector(".field-move-up"))==null||V.addEventListener("click",()=>{let L=_.previousElementSibling;L&&(_.parentNode.insertBefore(_,L),_.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>_.style.boxShadow="",300))}),(oe=_.querySelector(".field-move-down"))==null||oe.addEventListener("click",()=>{let L=_.nextElementSibling;L&&(_.parentNode.insertBefore(L,_),_.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>_.style.boxShadow="",300))})},lt=function(_){_.addEventListener("click",async()=>{let V=_.closest(".vs-field-row");await Te({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&(V.style.opacity="0",V.style.transform="translateX(20px)",V.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>V.remove(),200))})},ht=function(_){_&&_.addEventListener("click",()=>{var A,M,D;let V=_.closest(".vs-field-row");if(!V)return;let oe=((A=V.querySelector(".field-type"))==null?void 0:A.value)||"text",L=((M=V.querySelector(".field-label"))==null?void 0:M.value)||((D=V.querySelector(".field-name"))==null?void 0:D.value)||"Field";Ws(V,oe,L)})},Ws=function(_,V,oe){var pe,Ne,Gs,es,vt;(pe=document.getElementById("vs-field-settings-modal"))==null||pe.remove();let L=_.dataset.placeholder||"",A=_.dataset.default||"",M=_.dataset.min||"",D=_.dataset.max||"",O=_.dataset.maxlength||"",X=_.dataset.options||"[]",Q=_.dataset.description||"",z=["text","email","tel","url","textarea"].includes(V),K=V==="number",te=["text","email","tel","url","textarea"].includes(V),ge=["select","radio","multiselect"].includes(V),de=V==="multiselect",Le=V==="file",xe=V==="checkbox",Be="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",be="margin-bottom: 16px;",Pe="";if(z&&(Pe+=`<div style="${be}">
          <label style="${Be}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${re(L)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),!Le&&!xe&&(Pe+=`<div style="${be}">
          <label style="${Be}">Default Value</label>
          <input type="${K?"number":"text"}" id="fs-default" class="vs-input" value="${re(A)}" placeholder="Pre-filled value" />
        </div>`),xe&&(Pe+=`<div style="${be}">
          <label style="${Be}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked \u2014 defaults to field name if empty)</span></label>
          <input type="text" id="fs-default" class="vs-input" value="${re(A)}" placeholder="e.g. yes, true, 1" />
        </div>
        <div style="${be}">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="fs-checked-default" ${_.dataset.checkedDefault==="true"?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${_.dataset.checkedDefault==="true"?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span style="
                position: absolute; left: ${_.dataset.checkedDefault==="true"?"18px":"2px"}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <span style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary);">Selected by default</span>
          </label>
        </div>`),K&&(Pe+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${be}">
          <div>
            <label style="${Be}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${re(M)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${Be}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${re(D)}" placeholder="No limit" />
          </div>
        </div>`),te&&(Pe+=`<div style="${be}">
          <label style="${Be}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${re(O)}" placeholder="No limit" min="1" />
        </div>`),ge){let Ie;try{Ie=JSON.parse(X)}catch{Ie=X.split(",").map(Xe=>Xe.trim()).filter(Boolean)}let Ue;if(de){let Ve=(_.dataset.default||"").split(",").map(Xe=>Xe.trim()).filter(Boolean);Ue=Ie.map(Xe=>Ve.includes(Xe)?"[x] "+Xe:Xe).join(`
`)}else Ue=Ie.join(`
`);Pe+=`<div style="${be}">
          <label style="${Be}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${de?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${de?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${y(Ue)}</textarea>
        </div>`}if(Le){let Ie=_.dataset.allowedExtensions||"",Ue=_.dataset.maxSizeMb||"10",Ve;try{Ve=Ie?JSON.parse(Ie):[]}catch{Ve=[]}let Xe=Ve.join(", "),Tt=["pdf","doc","docx","xls","xlsx","csv","txt"],Fn=["jpg","jpeg","png","gif","webp"],zn=["zip","rar"],Zo=Tt.some(ks=>Ve.includes(ks)),Qo=Fn.some(ks=>Ve.includes(ks)),ei=zn.some(ks=>Ve.includes(ks));Pe+=`<div style="${be}">
          <label style="${Be}">Allowed File Types</label>
          <div style="display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Tt)}' ${Zo?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Documents
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Fn)}' ${Qo?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Images
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(zn)}' ${ei?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Archives
            </label>
          </div>
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${re(Xe)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${be}">
          <label style="${Be}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${re(Ue)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`}Pe+=`<div style="${be}">
        <label style="${Be}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${re(Q)}" placeholder="Optional description or instructions" />
      </div>`;let le=document.createElement("div");if(le.id="vs-field-settings-modal",le.style.cssText="position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;",le.innerHTML=`
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
                ${y(oe)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${V}
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
      `,document.body.appendChild(le),setTimeout(()=>{var Ie;return(Ie=le.querySelector("input, textarea"))==null?void 0:Ie.focus()},100),Le&&le.querySelectorAll(".fs-ext-group").forEach(Ie=>{Ie.addEventListener("change",()=>{let Ue=le.querySelector("#fs-allowed-extensions");if(!Ue)return;let Ve=Ue.value.split(",").map(Tt=>Tt.trim().toLowerCase()).filter(Boolean),Xe=JSON.parse(Ie.dataset.exts||"[]");Ie.checked?Xe.forEach(Tt=>{Ve.includes(Tt)||Ve.push(Tt)}):Ve=Ve.filter(Tt=>!Xe.includes(Tt)),Ue.value=Ve.join(", ")})}),xe){let Ie=(Ne=le.querySelector("#fs-checked-default"))==null?void 0:Ne.closest("label");if(Ie){let Ue=le.querySelector("#fs-checked-default"),Ve=Ie.querySelectorAll("span > span")[0],Xe=Ie.querySelectorAll("span > span")[1];Ue==null||Ue.addEventListener("change",()=>{Ve&&(Ve.style.background=Ue.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),Xe&&(Xe.style.left=Ue.checked?"18px":"2px")})}}let Ae=()=>le.remove(),He=le.querySelector("#fs-backdrop");He&&$e(He,Ae),(Gs=le.querySelector("#fs-close"))==null||Gs.addEventListener("click",Ae),(es=le.querySelector("#fs-cancel"))==null||es.addEventListener("click",Ae);let et=Ie=>{Ie.key==="Escape"&&(Ae(),document.removeEventListener("keydown",et))};document.addEventListener("keydown",et),(vt=le.querySelector("#fs-save"))==null||vt.addEventListener("click",()=>{var Ie,Ue,Ve,Xe,Tt,Fn,zn,Zo,Qo,ei;if(z&&(_.dataset.placeholder=((Ie=le.querySelector("#fs-placeholder"))==null?void 0:Ie.value)||""),Le||(_.dataset.default=((Ue=le.querySelector("#fs-default"))==null?void 0:Ue.value)||""),xe&&(_.dataset.checkedDefault=(Ve=le.querySelector("#fs-checked-default"))!=null&&Ve.checked?"true":"false"),K&&(_.dataset.min=((Xe=le.querySelector("#fs-min"))==null?void 0:Xe.value)||"",_.dataset.max=((Tt=le.querySelector("#fs-max"))==null?void 0:Tt.value)||""),te&&(_.dataset.maxlength=((Fn=le.querySelector("#fs-maxlength"))==null?void 0:Fn.value)||""),ge){let Un=(((zn=le.querySelector("#fs-options"))==null?void 0:zn.value)||"").split(/[\n]/).map(Ks=>Ks.trim()).filter(Boolean);if(de){let Ks=[],ti=[];Un.forEach(_r=>{let pa=_r.match(/^\[x\]\s*(.+)$/i);pa?(Ks.push(pa[1].trim()),ti.push(pa[1].trim())):Ks.push(_r)}),_.dataset.options=JSON.stringify(Ks),_.dataset.default=ti.join(",")}else _.dataset.options=JSON.stringify(Un)}if(Le){let Un=(((Zo=le.querySelector("#fs-allowed-extensions"))==null?void 0:Zo.value)||"").split(",").map(ti=>ti.trim().toLowerCase()).filter(Boolean);_.dataset.allowedExtensions=Un.length>0?JSON.stringify(Un):"";let Ks=((Qo=le.querySelector("#fs-max-size-mb"))==null?void 0:Qo.value)||"10";_.dataset.maxSizeMb=String(Math.min(Math.max(parseInt(Ks)||10,1),50))}_.dataset.description=((ei=le.querySelector("#fs-description"))==null?void 0:ei.value)||"",_.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>_.style.boxShadow="",400),Ae(),B("Field settings updated","success")})},Y="make_"+e.replace(/-/g,"_"),ee={number:"number",checkbox:"boolean",multiselect:"array"},H={},S=[];(a.fields||[]).forEach(_=>{let oe={type:ee[_.type]||"string"},L=_.label||_.name;_.require_future?oe.description=L+" (must be in the future)":L&&(oe.description=L),_.min!==void 0&&_.min!==""&&(oe.minimum=_.min),_.max!==void 0&&_.max!==""&&(oe.maximum=_.max),_.min_length&&(oe.minLength=_.min_length),_.max_length&&(oe.maxLength=_.max_length),_.options&&_.options.length>0&&(_.type==="multiselect"?oe.items={type:"string",enum:_.options}:oe.enum=_.options),H[_.name]=oe,_.required&&S.push(_.name)});let P={name:Y,description:a.description||a.name,inputSchema:{type:"object",properties:H,required:S}},F=JSON.stringify(P,null,2),U=y(F),ne=l?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">\u25CF Discoverable by agents</span>':'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">\u25CB Draft \u2014 not visible to agents</span>',se=['<div style="margin-bottom: 16px;">','<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">','<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',`<code style="font-size:13px;font-weight:600;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">`+y(Y)+"</code>","</div>",'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">','<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'," /mcp.php","</span>",'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'," /actions/manifest.json","</span>",ne,"</div>","</div>",'<div style="position: relative;">',`<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">`+U+"</code></pre>",`<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor='var(--vs-border)';this.style.color='var(--vs-text-secondary)';" onmouseleave="this.style.borderColor='var(--vs-border-subtle)';this.style.color='var(--vs-text-ghost)';">`+$.copy+"</button>","</div>",'<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',`This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site's MCP endpoint.<br>`,'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',"</p>"].join("");s.innerHTML=`
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
              <input type="text" id="action-button-label" class="vs-input" value="${y(a.bar_button_label||"")}" placeholder="${re(a.name||"e.g. Register")}" />
              <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Short label for the bar button. Defaults to the action name.</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-vs-text-secondary mb-1">Icon</label>
              <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${[["calendar","Calendar"],["clock","Clock"],["utensils","Utensils"],["file-text","Document"],["list","List"],["shopping-bag","Shop"],["ticket","Ticket"],["message-square","Message"],["users","People"],["mail","Mail"],["star","Star"],["circle","Default"]].map(([_,V])=>`
                  <button type="button" class="vs-icon-pick" data-icon="${_}" title="${V}" style="
                    display: flex; align-items: center; justify-content: center;
                    width: 42px; height: 42px; border-radius: var(--radius-md);
                    border: 1.5px solid ${(a.icon||"circle")===_?"var(--vs-accent)":"var(--vs-border)"};
                    background: ${(a.icon||"circle")===_?"var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))":"var(--vs-bg-floating)"};
                    color: ${(a.icon||"circle")===_?"var(--vs-accent)":"var(--vs-text-ghost)"};
                    cursor: pointer; transition: all 0.15s ease;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',"shopping-bag":'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',circle:'<circle cx="12" cy="12" r="10"/>'}[_]}</svg></button>
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
                    background: ${(b=(m=a.constraints)==null?void 0:m.uniqueness)!=null&&b.enabled?"var(--vs-border-medium, #ccc)":"var(--vs-accent)"};
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
            <div id="action-duplicate-msg-wrap" style="${(x=(f=a.constraints)==null?void 0:f.uniqueness)!=null&&x.enabled?"":"display: none;"}">
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
          <button id="btn-add-field" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-bottom: 12px;">${$.plus||"+"} Add Field</button>
        </div>
        <div id="action-fields-builder" style="display: flex; flex-direction: column; gap: 6px;">
          ${(a.fields||[]).map((_,V)=>`
            <div class="vs-field-row" data-field-idx="${V}"
              data-field-name="${re(_.name||"")}"
              data-placeholder="${re(_.placeholder||"")}"
              data-default="${re(_.default_value||_.default||"")}"
              data-min="${_.min!==void 0?_.min:""}"
              data-max="${_.max!==void 0?_.max:""}"
              data-maxlength="${_.max_length||""}"
              data-minlength="${_.min_length||""}"
              data-options="${re(JSON.stringify(_.options||[]))}"
              data-description="${re(_.description||"")}"
              ${_.allowed_extensions?`data-allowed-extensions="${re(JSON.stringify(_.allowed_extensions))}"`:""}
              ${_.max_size_mb?`data-max-size-mb="${_.max_size_mb}"`:""}
              ${_.checked_default?'data-checked-default="true"':""}
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
                " ${V===0?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${V===(a.fields||[]).length-1?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${y(_.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(oe=>`<option value="${oe}" ${_.type===oe?"selected":""}>${oe==="multiselect"?"multi-select":oe}</option>`).join("")}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${_.required?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${_.required?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${_.required?"18px":"2px"}; top: 2px;
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
                ${$.trash}
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
          ${se}
        </div>
      </details>
    `,document.querySelectorAll(".field-required").forEach(_=>{ae(_.closest("label"))});let ce=document.getElementById("action-allow-duplicates");if(ce){let _=ce.closest("label"),V=_==null?void 0:_.querySelector(".vs-toggle-track"),oe=_==null?void 0:_.querySelector(".vs-toggle-thumb");ce.addEventListener("change",()=>{V&&(V.style.background=ce.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),oe&&(oe.style.left=ce.checked?"18px":"2px");let L=document.getElementById("action-duplicate-msg-wrap");L&&(L.style.display=ce.checked?"none":"")})}document.querySelectorAll(".vs-icon-pick").forEach(_=>{_.addEventListener("mouseenter",()=>{var V;_.dataset.icon!==((V=document.getElementById("action-icon"))==null?void 0:V.value)&&(_.style.borderColor="var(--vs-accent)",_.style.color="var(--vs-text-secondary)")}),_.addEventListener("mouseleave",()=>{var V;_.dataset.icon!==((V=document.getElementById("action-icon"))==null?void 0:V.value)&&(_.style.borderColor="var(--vs-border)",_.style.color="var(--vs-text-ghost)")}),_.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach(V=>{V.style.borderColor="var(--vs-border)",V.style.background="var(--vs-bg-floating)",V.style.color="var(--vs-text-ghost)"}),_.style.borderColor="var(--vs-accent)",_.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",_.style.color="var(--vs-accent)",document.getElementById("action-icon").value=_.dataset.icon})}),(k=document.getElementById("btn-save-action"))==null||k.addEventListener("click",async()=>{var M,D,O,X,Q,z,K,te,ge;if(Ts()||on())return;let _={...a};if(_.name=((M=document.getElementById("action-name"))==null?void 0:M.value)||a.name,_.bar_button_label=((D=document.getElementById("action-button-label"))==null?void 0:D.value)||"",_.description=((O=document.getElementById("action-description"))==null?void 0:O.value)||"",_.icon=((X=document.getElementById("action-icon"))==null?void 0:X.value)||"circle",((Q=document.getElementById("action-allow-duplicates"))==null?void 0:Q.checked)??!0)(z=_.constraints)!=null&&z.uniqueness&&(_.constraints.uniqueness.enabled=!1);else{let de=(a.fields||[]).filter(xe=>xe.type==="email").map(xe=>xe.name),Le=de.length>0?de:["email"];_.constraints={..._.constraints||{},uniqueness:{enabled:!0,fields:Le,scope_statuses:["confirmed","pending"]}}}let oe=((K=document.getElementById("action-duplicate-msg"))==null?void 0:K.value)||"";oe?_.responses={..._.responses||{},duplicate:oe}:(te=_.responses)!=null&&te.duplicate&&delete _.responses.duplicate;let{ok:L,data:A}=await C.put(`/agentic/actions/${encodeURIComponent(e)}`,_);B(L?"Action saved":((ge=A==null?void 0:A.error)==null?void 0:ge.message)||"Failed to save",L?"success":"error"),L&&yi(e)});async function Z(){var D;let _=document.querySelectorAll("#action-fields-builder .vs-field-row"),V=!1;if(_.forEach(O=>{var Q,z;((z=(Q=O.querySelector(".field-label"))==null?void 0:Q.value)==null?void 0:z.trim())||(V=!0,O.style.borderColor="var(--vs-error, #ef4444)",O.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{O.style.borderColor="var(--vs-border-subtle)",O.style.boxShadow=""},2e3))}),V){B("Every field needs a label","warning");return}let oe=we();if(oe.length===0){B("At least one field is required","warning");return}let L={...a,fields:oe},{ok:A,data:M}=await C.put(`/agentic/actions/${encodeURIComponent(e)}`,L);B(A?"Fields saved":((D=M==null?void 0:M.error)==null?void 0:D.message)||"Failed to save",A?"success":"error"),A&&yi(e)}(E=document.getElementById("btn-save-fields"))==null||E.addEventListener("click",Z),(I=document.getElementById("btn-add-field"))==null||I.addEventListener("click",()=>{var L,A;let _=document.getElementById("action-fields-builder");if(!_)return;let V=document.createElement("div");V.className="vs-field-row",V.dataset.fieldName="",V.dataset.placeholder="",V.dataset.default="",V.dataset.min="",V.dataset.max="",V.dataset.maxlength="",V.dataset.options="",V.dataset.description="",V.style.cssText=`
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;let oe='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';V.innerHTML=`
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
          ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(M=>`<option value="${M}">${M==="multiselect"?"multi-select":M}</option>`).join("")}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${oe}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${$.trash}
        </button>
      `,_.appendChild(V),(L=V.querySelector(".field-label"))==null||L.focus(),ae((A=V.querySelector(".field-required"))==null?void 0:A.closest("label")),_e(V),lt(V.querySelector(".field-delete")),ht(V.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(_e),document.querySelectorAll(".field-delete").forEach(lt),document.querySelectorAll(".field-settings").forEach(ht),(T=document.getElementById("btn-copy-schema"))==null||T.addEventListener("click",()=>{var V;let _=((V=document.getElementById("agent-schema-json"))==null?void 0:V.textContent)||"";navigator.clipboard.writeText(_).then(()=>{B("Schema copied","success")}).catch(()=>{let oe=document.createElement("textarea");oe.value=_,oe.style.position="fixed",oe.style.opacity="0",document.body.appendChild(oe),oe.select(),document.execCommand("copy"),document.body.removeChild(oe),B("Schema copied","success")})}),(N=document.getElementById("agent-preview-section"))==null||N.addEventListener("toggle",_=>{let V=_.target.querySelector(".agent-preview-chevron");V&&(V.style.transform=_.target.open?"rotate(180deg)":"rotate(0)")}),(j=document.getElementById("btn-toggle-active"))==null||j.addEventListener("click",async()=>{if(Ts()||on())return;let _={...a,active:!l},{ok:V}=await C.put(`/agentic/actions/${encodeURIComponent(e)}`,_);V?(B(_.active?"Action activated":"Action deactivated","success"),yi(e)):B("Failed to update status","error")}),(W=document.getElementById("btn-duplicate-action"))==null||W.addEventListener("click",async()=>{var L;if(Ts()||on()||!await Te({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:V,data:oe}=await C.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});V&&(oe!=null&&oe.action)?(B(`"${oe.action.name}" created`,"success"),window.location.hash=`#/actions/${oe.action.id}`):B(((L=oe==null?void 0:oe.error)==null?void 0:L.message)||"Failed to duplicate","error")}),(q=document.getElementById("btn-delete-action"))==null||q.addEventListener("click",async()=>{if(Ts()||on())return;if(await Te({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:V}=await C.delete(`/agentic/actions/${encodeURIComponent(e)}`);V?(B("Action deleted","success"),window.location.hash="#/actions"):B("Failed to delete action","error")}})}await Tn(e,1)}async function Tn(e,t=1){var m,b,h,g,f,x,w,k;let s=document.getElementById("action-records");if(!s)return;let n=((m=document.getElementById("action-filter-status"))==null?void 0:m.value)||"all",o=((b=document.getElementById("action-filter-search"))==null?void 0:b.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:r}=await C.get(i);if(!a||!r){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let l=r.records||[],c=r.total||0,u=r.per_page||20,p=Math.ceil(c/u);s.innerHTML=`
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
          ${window.IS_DEMO?"":`<button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old submissions" ${c===0?'disabled style="opacity:0.4;pointer-events:none;"':""}>
            ${$.trash} Purge Old
          </button>`}

          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${c===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${c===0?"No submissions to export":"Download submissions as CSV"}">
            ${$.download} Export CSV
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
              ${l.map(E=>{let I=typeof E.data=="string"?JSON.parse(E.data):E.data,T=Object.fromEntries(Object.entries(I||{}).filter(([H])=>!H.startsWith("_"))),N=Object.values(T).filter(H=>typeof H=="string"&&H.length>0).slice(0,2).join(" \xB7 "),j=Object.values(T).filter(H=>H&&typeof H=="object"&&H.original_name).length,W=j>0?`<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${N?"6px":"0"};" title="${j} file${j>1?"s":""} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${j>1?'<span style="font-size: 10px;">'+j+"</span>":""}</span>`:"",q=N||(j>0?"":"\u2014"),Y=Fa[E.status]||Fa.pending,ee=E.source==="web"?"Website":E.source==="mcp"?"MCP":E.source==="api"?"API":E.source||"Website";return`
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${E.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${E.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${y(E.confirmation_code||"\u2014")}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${y(q)}</span>${W}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${E.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                        ${Object.entries(Fa).map(([H,S])=>`<option value="${H}" ${E.status===H?"selected":""}>${S.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${ee}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${Yn(E.created_at)}</td>
                    ${window.IS_DEMO?'<td style="width: 32px;"></td>':`<td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${E.id}" title="Delete submission" style="
                        border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                        display: inline-flex; align-items: center; border-radius: var(--radius-md);
                        transition: color 0.12s, background 0.12s;
                      " onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';" onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>`}
                  </tr>
                  <tr class="vs-record-detail" data-detail-for="${E.id}" style="display: none;">
                    <td colspan="7" style="padding: 0 12px 12px 44px; background: var(--vs-bg-recessed, var(--vs-bg-ghost));">
                      <div style="
                        display: grid; grid-template-columns: auto 1fr; gap: 4px 16px;
                        font-size: 12px; padding: 12px 0;
                      ">
                        ${Object.entries(T).map(([H,S])=>{if(S&&typeof S=="object"&&S.path&&S.original_name){let P=S.size<1024?S.size+" B":S.size<1048576?Math.round(S.size/1024)+" KB":(S.size/1048576).toFixed(1)+" MB";return`
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(H.replace(/_/g," "))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="/_studio/api/router.php?_path=/agentic/actions/${encodeURIComponent(e)}/records/${E.id}/files/${encodeURIComponent(H)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${y(S.original_name)} (${P})
                                </a>
                              </div>
                            `}return`
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(H.replace(/_/g," "))}</div>
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
            <span class="text-vs-text-tertiary">Page ${t} of ${p} \xB7 ${c} submission${c!==1?"s":""}</span>
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-next" ${t>=p?"disabled":""} data-page="${t+1}">Next \u2192</button>
          </div>
        `:`
          <div class="text-sm text-vs-text-ghost text-center" style="padding: 8px 0;">${c} submission${c!==1?"s":""}</div>
        `}
      `}
    </div>
  `;let d=null,v=()=>Tn(e,1);(h=document.getElementById("action-filter-status"))==null||h.addEventListener("change",v),(g=document.getElementById("action-filter-search"))==null||g.addEventListener("input",()=>{clearTimeout(d),d=setTimeout(v,300)}),(f=document.getElementById("action-records-prev"))==null||f.addEventListener("click",E=>{let I=parseInt(E.currentTarget.dataset.page);I>=1&&Tn(e,I)}),(x=document.getElementById("action-records-next"))==null||x.addEventListener("click",E=>{let I=parseInt(E.currentTarget.dataset.page);I<=p&&Tn(e,I)}),s.querySelectorAll(".vs-record-toggle").forEach(E=>{E.addEventListener("click",()=>{let I=E.dataset.rid,T=s.querySelector(`.vs-record-detail[data-detail-for="${I}"]`);if(!T)return;let N=T.style.display!=="none";T.style.display=N?"none":"table-row",E.style.transform=N?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(E=>{E.addEventListener("change",async I=>{var W;if(Ts()){E.value=((W=E.querySelector("[selected]"))==null?void 0:W.value)||"pending";return}if(on())return;let T=I.target.dataset.recordId,N=I.target.value,{ok:j}=await C.put(`/agentic/actions/${encodeURIComponent(e)}/records/${T}`,{status:N});B(j?"Status updated":"Failed to update",j?"success":"error")})}),(w=document.getElementById("btn-purge-records"))==null||w.addEventListener("click",async()=>{var j,W;if(Ts()||on())return;let E=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],I=document.getElementById("vs-purge-overlay");I&&I.remove();let T=document.createElement("div");T.id="vs-purge-overlay",T.className="vs-modal-overlay",T.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Submissions</h2>
          <p class="vs-modal-desc">Remove submissions older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${E.map(q=>`<option value="${q.days}">${q.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(T),requestAnimationFrame(()=>T.classList.add("is-visible"));let N=()=>Ee(T);$e(T,N),(j=document.getElementById("vs-purge-cancel"))==null||j.addEventListener("click",N),(W=document.getElementById("vs-purge-ok"))==null||W.addEventListener("click",async()=>{var F;let q=document.getElementById("vs-purge-select"),Y=parseInt(q==null?void 0:q.value),ee=((F=q==null?void 0:q.selectedOptions[0])==null?void 0:F.textContent)||"";if(N(),await new Promise(U=>setTimeout(U,200)),!await Te({title:"Confirm Purge",description:`This will permanently delete all records "${ee.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:S,data:P}=await C.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:Y});S?(B(`${(P==null?void 0:P.purged)||0} record(s) purged`,"success"),Tn(e,1)):B("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(E=>{E.addEventListener("click",async()=>{if(Ts()||on())return;let I=E.dataset.rid;if(!await Te({title:"Delete Submission",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:N}=await C.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${I}`);N?(B("Submission deleted","success"),Tn(e,t)):B("Failed to delete submission","error")})}),(k=document.getElementById("btn-export-action-csv"))==null||k.addEventListener("click",async()=>{if(Ts())return;let E=document.getElementById("btn-export-action-csv"),I=E.innerHTML;E.innerHTML=`${$.loader} Exporting...`,E.disabled=!0;try{let T=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!T.ok)throw new Error("Export failed");let N=await T.blob(),j=URL.createObjectURL(N),W=document.createElement("a");W.href=j,W.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(W),W.click(),W.remove(),URL.revokeObjectURL(j),B("CSV downloaded","success")}catch{B("Failed to export CSV","error")}E.innerHTML=I,E.disabled=!1})}var po=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},uo=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Ot={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function Jl(){return setTimeout(()=>Yu(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function Yu(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await C.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
  `}function Zl(e){return setTimeout(()=>Xu(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function Xu(e){var d,v;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await C.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
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
          ${$.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${a.total===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${a.total===0?"No submissions to export":"Download submissions as CSV"}">
          ${$.download} Export CSV
        </button>
      </div>
    </div>
  `;let r=document.getElementById("form-filter-status"),l=document.getElementById("form-filter-source"),c=document.getElementById("form-filter-search"),u=null,p=()=>xi(e,1);r==null||r.addEventListener("change",p),l==null||l.addEventListener("change",p),c==null||c.addEventListener("input",()=>{clearTimeout(u),u=setTimeout(p,300)}),(d=document.getElementById("btn-export-csv"))==null||d.addEventListener("click",async()=>{let m=document.getElementById("btn-export-csv"),b=m.innerHTML;m.innerHTML=`${$.loader} Exporting...`,m.disabled=!0;try{let h=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!h.ok)throw new Error("Export failed");let g=await h.blob(),f=URL.createObjectURL(g),x=document.createElement("a");x.href=f,x.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(x),x.click(),x.remove(),URL.revokeObjectURL(f),B("CSV downloaded","success")}catch{B("Failed to export CSV","error")}m.innerHTML=b,m.disabled=!1}),(v=document.getElementById("btn-upgrade-to-action"))==null||v.addEventListener("click",async()=>{var f,x;if(po()||uo())return;let m=(i.fields||[]).length;if(!await Te({title:"Upgrade to Agent Action",description:`This will create a new agent action with${m>0?` the ${m} field${m!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let h=document.getElementById("btn-upgrade-to-action"),g=h.innerHTML;h.innerHTML=`${$.loader} Converting...`,h.disabled=!0,h.style.opacity="0.6";try{let w={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},k=[],E=0;(i.fields||[]).forEach(q=>{let Y=w[q.type];if(!Y){E++;return}let ee={name:q.name,label:q.label||q.name,type:Y,required:q.required||!1};(Y==="select"||Y==="radio")&&q.options&&(ee.options=q.options),q.placeholder&&(ee.placeholder=q.placeholder),k.push(ee)}),E>0&&B(`${E} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let I=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),T=Date.now().toString(36).slice(-4),N={id:I+"-"+T,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:k,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:j,data:W}=await C.post("/agentic/actions",N);if(j&&(W!=null&&W.action))B(`"${W.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${W.action.id}`;else{let Y=(((f=W==null?void 0:W.error)==null?void 0:f.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":((x=W==null?void 0:W.error)==null?void 0:x.message)||"Failed to create action";B(Y,"error"),h.innerHTML=g,h.disabled=!1,h.style.opacity=""}}catch{B("Failed to convert form to action","error"),h.innerHTML=g,h.disabled=!1,h.style.opacity=""}}),await xi(e,1)}async function xi(e,t=1){var h,g,f;let s=document.getElementById("form-submissions");if(!s)return;let n=((h=document.getElementById("form-filter-status"))==null?void 0:h.value)||"all",o=((g=document.getElementById("form-filter-source"))==null?void 0:g.value)||"all",i=((f=document.getElementById("form-filter-search"))==null?void 0:f.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:r,data:l}=await C.get(a);if(!r||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let c=l.submissions||[],u=l.total||0,p=l.per_page||20,d=Math.ceil(u/p);if(!c.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:v}=await C.get(`/forms/${encodeURIComponent(e)}`),m=v==null?void 0:v.form,b={};m!=null&&m.fields&&m.fields.forEach(x=>{b[x.name]=x.label||x.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${c.map(x=>{let w=Ot[x.status]||Ot.new,k=Object.entries(x.data||{}).filter(([T])=>!T.startsWith("_")).slice(0,3).map(([T,N])=>{let j=b[T]||T,W=Array.isArray(N)?N.join(", "):String(N);return`<span class="vs-sub-field"><strong>${y(j)}:</strong> ${y(W.substring(0,80))}${W.length>80?"\u2026":""}</span>`}).join(""),E=Yn(x.created_at),I=x.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${x.id}" data-form-id="${y(e)}" style="border-left-color: ${w.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${w.bg}; color: ${w.text};">${w.label}</span>
                ${I?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${y(E)}</span>
            </div>
            <div class="vs-submission-preview">
              ${k||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${x.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${x.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                ${Object.entries(Ot).map(([T,N])=>`<option value="${T}" ${x.status===T?"selected":""}>${N.label}</option>`).join("")}
              </select>
              ${window.IS_DEMO?"":`<button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${x.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
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
  `,Ju(e,t)}function Ju(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;Xl(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{var i;if(po()){s.value=s.dataset.originalValue||((i=s.querySelector("[selected]"))==null?void 0:i.value)||"new";return}if(uo())return;let n=s.dataset.subId,{ok:o}=await C.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){B("Status updated","success");let a=s.closest(".vs-submission-card"),r=Ot[s.value];if(a&&r){a.style.borderLeftColor=r.text;let l=a.querySelector(".vs-status-pill");l&&(l.style.background=r.bg,l.style.color=r.text,l.textContent=r.label)}}else B("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{if(po()||uo())return;let n=s.dataset.subId;if(!await Te({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await C.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(B("Submission deleted","success"),xi(e,t)):B("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);xi(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;Xl(e,o)})})}async function Xl(e,t){var p,d,v,m;(p=document.getElementById("submission-detail-overlay"))==null||p.remove();let{ok:s,data:n}=await C.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(b=>String(b.id)===String(t));if(!o){B("Submission not found","error");return}let{data:i}=await C.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,r={};if(a!=null&&a.fields&&a.fields.forEach(b=>{r[b.name]=b.label||b.name}),o.status==="new"&&!window.IS_DEMO){let{ok:b}=await C.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"});if(b){o.status="read";let h=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);h&&(h.value="read");let g=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(g){g.style.borderLeftColor=Ot.read.text;let f=g.querySelector(".vs-status-pill");f&&(f.style.background=Ot.read.bg,f.style.color=Ot.read.text,f.textContent="Read")}}}let l=Ot[o.status]||Ot.new,c=document.createElement("div");c.id="submission-detail-overlay",c.className="vs-slide-overlay",c.innerHTML=`
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
          ${Object.entries(o.data||{}).filter(([b])=>!b.startsWith("_")).map(([b,h])=>{let g=r[b]||b,f=Array.isArray(h)?h.join(", "):String(h);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${y(g)}</div>
                <div class="vs-sub-detail-field-value">${y(f)}</div>
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
          ${Object.entries(Ot).map(([b,h])=>`<option value="${b}" ${o.status===b?"selected":""}>${h.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(c),requestAnimationFrame(()=>{requestAnimationFrame(()=>c.classList.add("is-visible"))});let u=()=>{c.classList.remove("is-visible"),setTimeout(()=>c.remove(),200)};$e(c,u),(d=document.getElementById("close-sub-detail"))==null||d.addEventListener("click",u),(v=document.getElementById("btn-save-sub-notes"))==null||v.addEventListener("click",async()=>{var g;if(po()||uo())return;let b=((g=document.getElementById("sub-detail-notes"))==null?void 0:g.value)||"",{ok:h}=await C.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:b});B(h?"Notes saved":"Failed to save notes",h?"success":"error")}),(m=document.getElementById("sub-detail-status"))==null||m.addEventListener("change",async b=>{if(po()){b.target.value=o.status;return}if(uo())return;let h=b.target.value,{ok:g}=await C.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:h});if(g){B("Status updated","success");let f=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);f&&(f.value=h);let x=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),w=Ot[h];if(x&&w){x.style.borderLeftColor=w.text;let k=x.querySelector(".vs-status-pill");k&&(k.style.background=w.bg,k.style.color=w.text,k.textContent=w.label)}}else B("Failed to update status","error")})}var za=!1;function td(){return za=!1,setTimeout(()=>{Qu(),Va()},0),`
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 style="font-size: 20px; font-weight: 650; color: var(--vs-text-primary); letter-spacing: -0.025em; margin: 0;">Team</h1>
          <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 4px 0 0;">Manage who has access to this Studio.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-show-roles" class="vs-btn vs-btn-ghost vs-btn-sm" title="View role permissions">
            ${$.shield} Roles
          </button>
          <button id="btn-add-member" class="vs-btn vs-btn-primary vs-btn-sm">
            ${$.userPlus||$.plus} Add Member
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
  `}function sd(){return`
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
                ${$.rotateCcw}
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
                ${$.rotateCcw}
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
  `}function Zu(e){let t=R.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",r=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${$.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${y(e.name)}" title="Reset password">
        ${$.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${y(e.name)}" title="Remove">
        ${$.trash}
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
  `}async function Va(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await C.get("/team");if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${(n==null?void 0:n.message)||"Failed to load team members."}</div>`;return}let o=(s==null?void 0:s.members)||[];o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>Zu(i)).join("")}function Qu(){var t,s,n,o,i,a,r,l,c;if(za)return;za=!0,(t=document.getElementById("btn-add-member"))==null||t.addEventListener("click",()=>{ed()}),(s=document.getElementById("btn-show-roles"))==null||s.addEventListener("click",Ql);let e=document.getElementById("team-list");e&&e.addEventListener("click",async u=>{let p=u.target;if(p.closest("[data-role-info]")){Ql();return}let v=p.closest(".team-edit-btn");if(v){let h=v.dataset.id,{ok:g,data:f}=await C.get("/team");if(g){let x=f.members.find(w=>w.id==h);x&&ed(x)}return}let m=p.closest(".team-delete-btn");if(m){let h=m.dataset.id,g=m.dataset.name;if(!await Te({title:"Remove Team Member",description:`Remove ${g} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let{ok:x,error:w}=await C.delete(`/team/${h}`);x?(B(`${g} has been removed.`,"success"),await Va()):B((w==null?void 0:w.message)||"Failed to remove member.","error");return}let b=p.closest(".team-pw-btn");if(b){let h=b.dataset.id,g=b.dataset.name;tv(h,g);return}}),[["[data-team-modal-overlay]",wi],["[data-team-pw-overlay]",ki],["[data-team-roles-overlay]",Ua]].forEach(([u,p])=>{let d=document.querySelector(u);if(!d)return;let v=null;d.addEventListener("mousedown",m=>{v=m.target}),d.addEventListener("click",m=>{m.target===d&&v===d&&p()})}),(n=document.getElementById("btn-team-cancel"))==null||n.addEventListener("click",wi),(o=document.getElementById("btn-pw-cancel"))==null||o.addEventListener("click",ki),(i=document.getElementById("btn-roles-close"))==null||i.addEventListener("click",Ua),(a=document.getElementById("btn-generate-password"))==null||a.addEventListener("click",()=>{let u=document.getElementById("team-member-password");u&&(u.value=Xn())}),(r=document.getElementById("btn-pw-generate"))==null||r.addEventListener("click",()=>{let u=document.getElementById("team-new-password");u&&(u.value=Xn())}),(l=document.getElementById("btn-team-save"))==null||l.addEventListener("click",sv),(c=document.getElementById("btn-pw-save"))==null||c.addEventListener("click",nv),document.addEventListener("keydown",ev)}function ev(e){if(e.key!=="Escape")return;let t=document.getElementById("team-modal"),s=document.getElementById("team-pw-modal"),n=document.getElementById("team-roles-modal");n&&!n.classList.contains("hidden")?(Ua(),e.stopPropagation()):s&&!s.classList.contains("hidden")?(ki(),e.stopPropagation()):t&&!t.classList.contains("hidden")&&(wi(),e.stopPropagation())}function Ql(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden")}function Ua(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden")}function ed(e=null){let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");t&&(document.getElementById("team-member-name").value=(e==null?void 0:e.name)||"",document.getElementById("team-member-email").value=(e==null?void 0:e.email)||"",document.getElementById("team-member-role").value=(e==null?void 0:e.role)||"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=Xn()),t.classList.remove("hidden"))}function wi(){var e;(e=document.getElementById("team-modal"))==null||e.classList.add("hidden")}function tv(e,t){let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");s&&(document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=Xn(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",s.classList.remove("hidden"))}function ki(){var e;(e=document.getElementById("team-pw-modal"))==null||e.classList.add("hidden")}async function sv(){var l,c,u,p,d,v,m,b;let e=(l=document.getElementById("team-edit-id"))==null?void 0:l.value,t=(u=(c=document.getElementById("team-member-name"))==null?void 0:c.value)==null?void 0:u.trim(),s=(d=(p=document.getElementById("team-member-email"))==null?void 0:p.value)==null?void 0:d.trim(),n=(v=document.getElementById("team-member-role"))==null?void 0:v.value,o=(m=document.getElementById("team-member-password"))==null?void 0:m.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026";let r;e?r=await C.put(`/team/${e}`,{name:t,email:s,role:n}):r=await C.post("/team",{name:t,email:s,role:n,password:o}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",r.ok?(wi(),B(e?"Member updated.":`${t} has been added to the team.`,"success"),await Va()):(i.textContent=((b=r.error)==null?void 0:b.message)||"Something went wrong.",i.classList.remove("hidden"))}async function nv(){var a,r;let e=(a=document.getElementById("team-pw-user-id"))==null?void 0:a.value,t=(r=document.getElementById("team-new-password"))==null?void 0:r.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026";let{ok:o,error:i}=await C.post(`/team/${e}/password`,{password:t});n.disabled=!1,n.textContent="Reset Password",o?(ki(),B("Password has been reset.","success")):(s.textContent=(i==null?void 0:i.message)||"Failed to reset password.",s.classList.remove("hidden"))}var ov=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},iv=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1};function od(){return setTimeout(()=>vo(),0),`
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
        <div class="vs-dropzone-icon">${$.upload}</div>
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
  `}async function vo(e="all"){var g;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await nd(n.files),n.value="",vo(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=f=>{f.target.closest("button")||n==null||n.click()},o.ondragover=f=>{f.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async f=>{f.preventDefault(),o.classList.remove("is-dragover"),f.dataTransfer.files.length>0&&(await nd(f.dataTransfer.files),vo(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(f=>{f.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(x=>{x.className="vs-device-btn"}),f.className="vs-device-btn vs-device-btn-active",vo(f.dataset.filter)}});let a=e==="code",r=!a&&e!=="all"?`?category=${e}`:"",{ok:l,data:c}=await C.get(`/assets${r}`);if(!l||!((g=c==null?void 0:c.assets)!=null&&g.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let f=document.getElementById("btn-empty-upload"),x=document.getElementById("btn-upload-asset");f&&x&&f.addEventListener("click",()=>x.click());return}let u=c.assets;if(a&&(u=u.filter(f=>f.category==="css"||f.category==="js"),u.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${$.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let p=["jpg","jpeg","png","gif","webp","svg","ico"],d=u.filter(f=>f.category==="images"&&p.includes(f.extension)),v=u.filter(f=>!p.includes(f.extension)||f.category!=="images");function m(f,x){return f==="css"?$.fileCode:f==="js"?$.fileCode:f==="json"?$.fileJson:f==="pdf"?$.filePdf:["woff2","woff","ttf","otf"].includes(f)?$.type:["mp4","webm"].includes(f)?$.film:["mp3","wav","ogg"].includes(f)?$.music:["txt","md","csv"].includes(f)?$.fileText:["doc","docx","xls","xlsx"].includes(f)?$.fileText:x==="images"?$.image:$.fileText}let b=["css","js","json","svg"],h="";d.length>0&&(h+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',d.forEach((f,x)=>{var I;let w=ba(f.size),k=f.width?`${f.width}\xD7${f.height}`:"",E=f.extension==="svg";h+=`
        <div class="vs-asset-card" data-lightbox-idx="${x}">
          <div class="vs-asset-card-thumb${E?" is-svg":""}" style="cursor:pointer">
            <img src="${f.thumbnail||f.path}" alt="${y(((I=f.meta)==null?void 0:I.alt)||f.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${y(f.filename)}">${y(f.filename)}</p>
            <p class="vs-asset-card-meta">${k?k+" \xB7 ":""}${w}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${f.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${$.copy}</button>
            <button data-delete-asset="${f.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${$.x}</button>
          </div>
        </div>
      `}),h+="</div>"),v.length>0&&v.forEach(f=>{let x=ba(f.size),w=b.includes(f.extension);h+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${m(f.extension,f.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${y(f.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${f.category} \xB7 ${x}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${w?`
              <button data-edit-asset="${f.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${$.pencil}</button>
            `:""}
            <button data-copy-path="${f.path}" title="Copy web path"
              class="vs-asset-action-btn">${$.copy}</button>
            ${f.category!=="css"&&f.category!=="js"?`
              <button data-delete-asset="${f.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${$.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=h,t.querySelectorAll("[data-lightbox-idx]").forEach(f=>{let x=f.querySelector(".vs-asset-card-thumb");x&&x.addEventListener("click",()=>{let w=parseInt(f.dataset.lightboxIdx,10);av(d,w,e)})}),t.querySelectorAll("[data-copy-path]").forEach(f=>{f.addEventListener("click",()=>{navigator.clipboard.writeText(f.dataset.copyPath).then(()=>{let x=f.innerHTML;f.innerHTML="\u2713",f.classList.add("vs-asset-action-copied"),setTimeout(()=>{f.innerHTML=x,f.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(f=>{f.addEventListener("click",()=>{let w=f.dataset.editAsset.replace(/^\//,"");to(w)})}),t.querySelectorAll("[data-delete-asset]").forEach(f=>{f.addEventListener("click",async()=>{if(!await Te({title:"Delete Asset",description:`Delete ${f.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:w}=await C.delete("/assets",{path:f.dataset.deleteAsset});w?(B("Asset deleted.","success"),vo(e)):B("Could not delete asset.","error")})})}function av(e,t,s){let n=t;function o(d){if(d===0)return"0 B";let v=1024,m=["B","KB","MB","GB"],b=Math.floor(Math.log(d)/Math.log(v));return parseFloat((d/Math.pow(v,b)).toFixed(1))+" "+m[b]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var g,f;let d=e[n],v=d.width?`${d.width}\xD7${d.height}`:"",m=o(d.size),b=[v,m,(g=d.extension)==null?void 0:g.toUpperCase()].filter(Boolean),h=e.length>1;return`
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
          <div class="vs-lightbox-image-wrap${["svg","png"].includes(d.extension)?" is-transparent":""}">
            <img src="${d.path}" alt="${y(((f=d.meta)==null?void 0:f.alt)||d.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${y(d.filename)}</span>
            <span class="vs-lightbox-details">${b.join(" \xB7 ")}${h?` \xB7 ${n+1} / ${e.length}`:""}</span>
          </div>

          <div class="vs-lightbox-actions">
            <button class="vs-lightbox-btn" id="lightbox-copy" title="Copy web path">
              ${$.copy}<span>Copy path</span>
            </button>
          </div>
        </div>
      </div>

      <button class="vs-lightbox-close" id="lightbox-close" title="Close (Esc)">
        ${$.x}
      </button>
    `}let r=document.createElement("div");r.id="vs-lightbox",r.className="vs-lightbox",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Image preview"),r.innerHTML=a(),document.body.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add("is-visible"))});function l(){r.classList.remove("is-visible"),setTimeout(()=>r.remove(),400),document.removeEventListener("keydown",u)}function c(d){n=d,r.innerHTML=a(),p()}function u(d){if(d.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;l(),d.preventDefault()}d.key==="ArrowRight"&&e.length>1&&(c((n+1)%e.length),d.preventDefault()),d.key==="ArrowLeft"&&e.length>1&&(c((n-1+e.length)%e.length),d.preventDefault())}function p(){var m,b,h;(m=r.querySelector("#lightbox-close"))==null||m.addEventListener("click",g=>{g.stopPropagation(),l()});let d=null;r.addEventListener("mousedown",g=>{d=g.target}),r.addEventListener("click",g=>{var w;let f=g.target===r||g.target.classList.contains("vs-lightbox-stage"),x=d===r||((w=d==null?void 0:d.classList)==null?void 0:w.contains("vs-lightbox-stage"));f&&x&&l()}),(b=r.querySelector("#lightbox-prev"))==null||b.addEventListener("click",g=>{g.stopPropagation(),c((n-1+e.length)%e.length)}),(h=r.querySelector("#lightbox-next"))==null||h.addEventListener("click",g=>{g.stopPropagation(),c((n+1)%e.length)});let v=r.querySelector("#lightbox-copy");v==null||v.addEventListener("click",g=>{g.stopPropagation();let f=e[n];navigator.clipboard.writeText(f.path).then(()=>{let x=v.innerHTML;v.innerHTML=`${$.check}<span>Copied!</span>`,v.style.borderColor="var(--vs-success)",v.style.color="var(--vs-success)",setTimeout(()=>{v.innerHTML=x,v.style.borderColor="",v.style.color=""},2e3),B("Path copied!","success")})})}document.addEventListener("keydown",u),p()}async function nd(e){var i,a,r;if(ov()||iv())return;let t=window.__vsSetGlobalStatus;t&&t("saving",`Uploading ${e.length} file(s)\u2026`);let s=new FormData;for(let l of e)s.append("file[]",l);let n=R.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let c=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();if(c.ok){let u=((a=(i=c.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0;B(`${u} file(s) uploaded.`,"success"),t&&t("saved",`\u2713 ${u} file(s) uploaded`)}else{let u=((r=c.error)==null?void 0:r.message)||"Upload failed";B(u,"error"),t&&t("error","\u2717 "+u)}}catch{B("Upload failed.","error"),t&&t("error","\u2717 Upload failed")}}var mo="vs-newdesign-save-pref",go="gallery";function rd(){return setTimeout(()=>rv(),0),`
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
        <button class="vs-tab ${go==="gallery"?"vs-tab-active":""}" data-tab="gallery">
          ${$.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${go==="history"?"vs-tab-active":""}" data-tab="history">
          ${$.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading\u2026</div>
      </div>
    </div>
  `}function rv(){var e,t;document.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",()=>{go=s.dataset.tab,document.querySelectorAll(".vs-tab").forEach(n=>n.classList.remove("vs-tab-active")),s.classList.add("vs-tab-active"),id()})}),(e=document.getElementById("btn-save-design"))==null||e.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||fo()}),(t=document.getElementById("btn-new-design"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||Wa()}),id()}function id(){go==="gallery"?$i():Ei()}async function $i(){var i,a;let e=document.getElementById("designs-content");if(!e)return;let{ok:t,data:s}=await C.get("/designs");if(!t||!((i=s==null?void 0:s.designs)!=null&&i.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <p class="vs-empty-state-title">No saved designs</p>
          <p class="vs-empty-state-desc">Save your current design and try different looks. Switch back anytime.</p>
          <button id="btn-empty-save" class="vs-btn vs-btn-primary vs-btn-sm">${$.save} Save Current Design</button>
        </div>
      </div>
    `,(a=document.getElementById("btn-empty-save"))==null||a.addEventListener("click",()=>{var r;(r=window.demoGuard)!=null&&r.call(window)||fo()});return}let n=s.active_id,o=s.designs;e.innerHTML=`
    <div class="vs-design-grid">
      ${o.map(r=>dv(r,r.id===n)).join("")}
    </div>
  `,cv(e),lv(e)}function lv(e){e.querySelectorAll(".vs-design-card-preview").forEach(t=>{let s=t.querySelector("iframe");s&&requestAnimationFrame(()=>{let n=t.offsetWidth;if(n>0){let o=n/1440;s.style.transform=`scale(${o})`}})})}function dv(e,t){let s=y(e.name||"Untitled"),n=e.description?y(e.description):"",o=e.initial_prompt?y(e.initial_prompt):"",i=n||(o.length>100?o.substring(0,100)+"\u2026":o),a=y(e.site_name||""),r=e.page_count||0,l=e.created_at?Kn(e.created_at):"",c=e._corrupted,u=a&&a!==s?`${a} \xB7 ${r} ${r===1?"page":"pages"}`:`${r} ${r===1?"page":"pages"}`,p=`/_studio/api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(e.id)}%2Fpreview&path=index.php`,d=`${p}&embed=1`;return`
    <div class="vs-design-card${t?" vs-design-card-active":""}${c?" vs-design-card-corrupted":""}"
         data-design-id="${re(e.id)}">
      <div class="vs-design-card-preview">
        ${c?'<div class="vs-design-card-empty">Preview unavailable</div>':`
          <iframe src="${d}" tabindex="-1" loading="lazy"
                  sandbox="allow-same-origin"
                  title="Preview of ${re(e.name||"design")}"></iframe>
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
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-load-id="${re(e.id)}" ${c?"disabled":""}>
            ${$.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${p}" target="_blank" rel="noopener" title="Browse this design">
          ${$.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${re(e.id)}"
                data-edit-name="${re(e.name||"")}"
                data-edit-desc="${re(e.description||"")}">
          ${$.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${re(e.id)}" style="color: var(--vs-text-ghost);">
          ${$.trash2}
        </button>
      </div>
    </div>
  `}function cv(e){e.querySelectorAll("[data-load-id]").forEach(t=>{t.addEventListener("click",async()=>{var c,u,p,d;if((c=window.demoGuard)!=null&&c.call(window)||(u=window.viewerGuard)!=null&&u.call(window))return;let s=t.dataset.loadId,n=t.closest(".vs-design-card"),o=((p=n==null?void 0:n.querySelector("h3"))==null?void 0:p.textContent)||"this design",i=await vv(o);if(!i)return;if(t.innerHTML=`${$.rotateCcw} Loading\u2026`,t.disabled=!0,i.saveDesign){let v=R.get("siteName")||"Untitled",m=await C.post("/designs",{name:`${v}`,description:"Saved before switching designs"});if(!m.ok){B(((d=m.error)==null?void 0:d.message)||"Failed to save design.","error"),t.innerHTML=`${$.rotateCcw} Load`,t.disabled=!1;return}}let{ok:a,data:r,error:l}=await C.post(`/designs/${s}/load`,{skip_auto_save:!0});a?(B("Design loaded.","success"),await ld(),window.location.hash="#/chat"):(B((l==null?void 0:l.message)||"Failed to load design.","error"),t.innerHTML=`${$.rotateCcw} Load`,t.disabled=!1)})}),e.querySelectorAll("[data-edit-id]").forEach(t=>{t.addEventListener("click",()=>{var i,a;if((i=window.demoGuard)!=null&&i.call(window)||(a=window.viewerGuard)!=null&&a.call(window))return;let s=t.dataset.editId,n=t.dataset.editName,o=t.dataset.editDesc;uv(s,n,o)})}),e.querySelectorAll("[data-delete-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteId;if(!await Te({title:"Delete Design",description:"This design will be removed permanently. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await C.delete(`/designs/${s}`);o?(B("Design deleted.","success"),$i()):(B((i==null?void 0:i.message)||"Failed to delete design.","error"),t.innerHTML=`${$.trash2}`,t.disabled=!1)})})}async function Ei(){var i,a,r;let e=document.getElementById("designs-content");if(!e)return;e.innerHTML=`
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">
        ${$.camera} Create Snapshot
      </button>
    </div>
    <div id="snapshots-list">
      <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots\u2026</div>
    </div>
  `,(i=document.getElementById("btn-create-snapshot"))==null||i.addEventListener("click",()=>{var l,c;(l=window.demoGuard)!=null&&l.call(window)||(c=window.viewerGuard)!=null&&c.call(window)||ad()});let t=document.getElementById("snapshots-list");if(!t)return;let{ok:s,data:n}=await C.get("/snapshots");if(!s||!((a=n==null?void 0:n.snapshots)!=null&&a.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">${$.camera} Create Snapshot</button>
        </div>
      </div>
    `,(r=document.getElementById("btn-empty-create-snapshot"))==null||r.addEventListener("click",()=>{var l;(l=window.demoGuard)!=null&&l.call(window)||ad()});return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((l,c)=>{let u=Kn(l.created_at),p=new Date(l.created_at).toLocaleString(),d=l.size_bytes?(l.size_bytes/1024).toFixed(0)+" KB":"\u2014",v=c===o.length-1,m,b,h;l.snapshot_type==="pre_publish"?(m="var(--vs-success)",b="vs-snap-badge-green",h="Pre-publish"):l.snapshot_type==="manual"?(m="var(--vs-accent)",b="vs-snap-badge-amber",h="Manual"):(m="var(--vs-text-ghost)",b="vs-snap-badge-gray",h="Auto");let g=l.description?`<p class="vs-timeline-desc">${y(l.description)}</p>`:"";return`
          <div class="vs-timeline-item${v?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${m}; box-shadow: 0 0 0 3px color-mix(in srgb, ${m} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${b}">${h}</span>
                  <span class="vs-timeline-label">${y(l.label||"Snapshot #"+l.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${p}">${u}</span>
              </div>
              ${g}
              <div class="vs-timeline-meta">Snapshot #${y(String(l.id))} \xB7 ${l.file_count} files \xB7 ${d}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${l.id}" data-snap='${JSON.stringify({id:l.id,label:l.label,description:l.description,type:l.snapshot_type,files:l.file_count,size:d,date:p}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${$.eye} Preview
                </button>
                <button data-restore-id="${l.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${$.rotateCcw} Restore
                </button>
                <button data-delete-snap-id="${l.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${$.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,pv(t)}function pv(e){e.querySelectorAll("[data-preview-id]").forEach(t=>{t.addEventListener("click",()=>{let s=JSON.parse(t.dataset.snap);gv(s)})}),e.querySelectorAll("[data-restore-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.restoreId;if(!await Te({title:"Restore snapshot #"+s,description:"This replaces preview files and shared assets. Asset changes can affect the live site. PHP pages still need Publish. VoxelSite saves a safety snapshot before restoring.",confirmLabel:"Restore"}))return;t.innerHTML=`${$.rotateCcw} Restoring\u2026`,t.disabled=!0;let{ok:o,error:i}=await C.post(`/snapshots/${s}/restore`);o?(B("Snapshot restored.","success"),Ei()):(B((i==null?void 0:i.message)||"Failed to restore snapshot.","error"),t.innerHTML=`${$.rotateCcw} Restore`,t.disabled=!1)})}),e.querySelectorAll("[data-delete-snap-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteSnapId;if(!await Te({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await C.delete(`/snapshots/${s}`);o?(B("Snapshot deleted.","success"),Ei()):(B((i==null?void 0:i.message)||"Failed to delete snapshot.","error"),t.innerHTML=`${$.trash2}`,t.disabled=!1)})})}function fo(){var u;let e=document.getElementById("vs-design-save-overlay");e&&e.remove();let t=R.get("siteName")||"",s=document.createElement("div");s.id="vs-design-save-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${$.save} Save Design</h2>
        <p class="vs-modal-desc">Save a snapshot of your current design to the library. Find and restore saved designs in the Designs tab.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="design-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${re(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="design-desc" type="text" class="vs-input w-full" placeholder="e.g. Warm wood tones with dark greens">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="design-save-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="design-save-confirm" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${$.save} Save Design</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>Ee(s),o=p=>{p.key==="Escape"&&(p.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),$e(s,n),(u=document.getElementById("design-save-cancel"))==null||u.addEventListener("click",n);let a=document.getElementById("design-name"),r=document.getElementById("design-desc"),l=document.getElementById("design-save-confirm"),c=p=>{p.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",c),r==null||r.addEventListener("keydown",c),a==null||a.select(),l==null||l.addEventListener("click",async()=>{var b,h;let p=((b=a==null?void 0:a.value)==null?void 0:b.trim())||"",d=((h=r==null?void 0:r.value)==null?void 0:h.trim())||"";if(!p){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:v,error:m}=await C.post("/designs",{name:p,description:d});n(),v?(B("Design saved.","success"),go="gallery",document.getElementById("designs-content")&&(document.querySelectorAll(".vs-tab").forEach(f=>{f.classList.toggle("vs-tab-active",f.dataset.tab==="gallery")}),$i())):B((m==null?void 0:m.message)||"Failed to save design.","error")})}function uv(e,t,s){var u;let n=document.getElementById("vs-design-edit-overlay");n&&n.remove();let o=document.createElement("div");o.id="vs-design-edit-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${$.pencil} Edit Design</h2>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="edit-design-name" type="text" class="vs-input w-full" value="${re(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="edit-design-desc" type="text" class="vs-input w-full" value="${re(s)}">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="edit-design-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="edit-design-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Save</button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>Ee(o);$e(o,i),(u=document.getElementById("edit-design-cancel"))==null||u.addEventListener("click",i);let a=document.getElementById("edit-design-name"),r=document.getElementById("edit-design-desc"),l=document.getElementById("edit-design-save");a==null||a.select();let c=p=>{p.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",c),r==null||r.addEventListener("keydown",c),l==null||l.addEventListener("click",async()=>{var b,h;let p=((b=a==null?void 0:a.value)==null?void 0:b.trim())||"",d=((h=r==null?void 0:r.value)==null?void 0:h.trim())||"";if(!p){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:v,error:m}=await C.put(`/designs/${e}`,{name:p,description:d});i(),v?(B("Design updated.","success"),$i()):B((m==null?void 0:m.message)||"Failed to update design.","error")})}function vv(e){return new Promise(t=>{var c,u;let s=document.getElementById("vs-switch-design-overlay");s&&s.remove();let n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=localStorage.getItem(mo),i=document.createElement("div");i.id="vs-switch-design-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=p=>{p.key==="Escape"&&(p.preventDefault(),r(null))},r=p=>{document.removeEventListener("keydown",a),Ee(i),t(p)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let l=document.getElementById("vs-switch-save-cb");$e(i,()=>r(null)),(c=document.getElementById("vs-switch-cancel"))==null||c.addEventListener("click",()=>r(null)),(u=document.getElementById("vs-switch-ok"))==null||u.addEventListener("click",()=>{let p=l?l.checked:!1;localStorage.setItem(mo,p?"true":"false"),r({saveDesign:p})}),document.addEventListener("keydown",a),setTimeout(()=>{var p;return(p=document.getElementById("vs-switch-ok"))==null?void 0:p.focus()},220)})}async function Wa(){var n;let e=await mv();if(!e)return;if(e.saveDesign&&e.designName){let o=await C.post("/designs",{name:e.designName,description:""});if(!o.ok){B(((n=o.error)==null?void 0:n.message)||"Failed to save design.","error");return}B("Design saved.","success")}let{ok:t,error:s}=await C.post("/designs/new",{skip_auto_save:!0});if(t){B("Workspace cleared. Start building.","success"),await ld(),R.set("messages",[]),R.set("activeConversationId",null),R.set("conversations",[]);try{localStorage.removeItem("vs-active-conversation")}catch{}window.location.hash!=="#/chat"?yt.navigate("chat"):yt.refresh()}else B((s==null?void 0:s.message)||"Failed to start new design.","error")}function mv(){return new Promise(e=>{var p,d;let t=document.getElementById("vs-new-design-overlay");t&&t.remove();let s=R.get("siteName")||"",n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=document.createElement("div");o.id="vs-new-design-overlay",o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Start New Design</h2>
          <p class="vs-modal-desc">This will clear your workspace for a fresh start.</p>
          <label class="vs-modal-option" for="vs-newdesign-save-cb">
            <input type="checkbox" id="vs-newdesign-save-cb" ${localStorage.getItem(mo)!=="false"?"checked":""}>
            <span class="vs-modal-option-check">${n}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-body" id="vs-newdesign-name-row" style="${localStorage.getItem(mo)==="false"?"display:none":""}">
          <label class="vs-input-label">Name</label>
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${re(s)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;let i=v=>{v.key==="Escape"&&(v.preventDefault(),a(null))},a=v=>{document.removeEventListener("keydown",i),Ee(o),e(v)};document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let r=document.getElementById("vs-newdesign-save-cb"),l=document.getElementById("vs-newdesign-name-row"),c=document.getElementById("vs-newdesign-name"),u=()=>{r.checked?(l.style.display="",setTimeout(()=>c==null?void 0:c.focus(),80)):l.style.display="none"};r==null||r.addEventListener("change",u),c==null||c.addEventListener("keydown",v=>{var m;v.key==="Enter"&&(v.preventDefault(),(m=document.getElementById("vs-newdesign-ok"))==null||m.click())}),$e(o,()=>a(null)),(p=document.getElementById("vs-newdesign-cancel"))==null||p.addEventListener("click",()=>a(null)),(d=document.getElementById("vs-newdesign-ok"))==null||d.addEventListener("click",()=>{var b;let v=r?r.checked:!1,m=((b=c==null?void 0:c.value)==null?void 0:b.trim())||"";if(v&&!m){c==null||c.focus();return}localStorage.setItem(mo,v?"true":"false"),a({saveDesign:v,designName:m})}),document.addEventListener("keydown",i),setTimeout(()=>{var v;r!=null&&r.checked&&c?c.select():(v=document.getElementById("vs-newdesign-ok"))==null||v.focus()},220)})}function ad(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${$.camera} Create Snapshot</h2>
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
        <button id="snap-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${$.camera} Create Snapshot</button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>Ee(t);$e(t,s),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var c;let a=((c=n==null?void 0:n.value)==null?void 0:c.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:r,error:l}=await C.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),r?(B("Snapshot created.","success"),Ei()):B((l==null?void 0:l.message)||"Failed to create snapshot.","error")})}function gv(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${$.eye} Snapshot #${y(String(e.id))}</h2>
      </div>
      <div class="vs-modal-body">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
          <span style="color: var(--vs-text-ghost);">Snapshot</span>
          <span style="color: var(--vs-text-primary);">#${y(String(e.id))}</span>
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),$e(s,()=>Ee(s)),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>Ee(s))}async function ld(){var e,t;try{let s=await C.get("/pages");s.ok&&Array.isArray((e=s.data)==null?void 0:e.pages)&&R.set("pages",s.data.pages);let n=await C.get("/auth/session");n.ok&&((t=n.data)!=null&&t.site_name)&&(R.set("siteName",n.data.site_name),document.title=`Studio \u2014 ${n.data.site_name}`);let o=document.getElementById("preview-iframe");o&&(o.src=o.src)}catch(s){console.warn("[designs] Post-switch refresh failed:",s)}}var xo=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},wo=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},qe=[],je=null,_t=null,In=null,Yt="",Is=!1,ho="",Ka="idle",bo="list",Ci=!1,pd=800,fv=200;var ud="vs-notes-list-width",dd=80;function hv(){window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("notes",an)}async function an(){_t&&(clearTimeout(_t),_t=null,await Xa())}function bv(e){if(!e)return"";let t=y(e);return t=t.replace(/```(\w*)\n([\s\S]*?)```/g,(s,n,o)=>`<pre class="vs-note-code-block"><code>${o}</code></pre>`),t=t.replace(/`([^`]+)`/g,'<code class="vs-note-inline-code">$1</code>'),t=t.replace(/^### (.+)$/gm,'<h3 class="vs-note-h3">$1</h3>'),t=t.replace(/^## (.+)$/gm,'<h2 class="vs-note-h2">$1</h2>'),t=t.replace(/^# (.+)$/gm,'<h1 class="vs-note-h1">$1</h1>'),t=t.replace(/^&gt; (.+)$/gm,'<blockquote class="vs-note-blockquote">$1</blockquote>'),t=t.replace(/^---$/gm,'<hr class="vs-note-hr" />'),t=t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>"),t=t.replace(/\*(.+?)\*/g,"<em>$1</em>"),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener" class="vs-note-link">$1</a>'),t=t.replace(/^- (.+)$/gm,'<li class="vs-note-li">$1</li>'),t=t.replace(/(<li class="vs-note-li">.*<\/li>\n?)+/g,'<ul class="vs-note-ul">$&</ul>'),t=t.replace(/^\d+\. (.+)$/gm,'<li class="vs-note-li-ol">$1</li>'),t=t.replace(/(<li class="vs-note-li-ol">.*<\/li>\n?)+/g,'<ol class="vs-note-ol">$&</ol>'),t=t.replace(/\n\n/g,'</p><p class="vs-note-p">'),t='<p class="vs-note-p">'+t+"</p>",t=t.replace(/<p class="vs-note-p">(<(?:h[1-3]|pre|blockquote|hr|ul|ol)[^>]*>)/g,"$1"),t=t.replace(/(<\/(?:h[1-3]|pre|blockquote|ul|ol)>)<\/p>/g,"$1"),t=t.replace(/<p class="vs-note-p"><\/p>/g,""),t}function Ya(){return`
    <div class="vs-empty-state vs-empty-state--panel">
      <div class="vs-empty-state-inner">
        <div class="vs-empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <p class="vs-empty-state-title">Select a note</p>
      </div>
    </div>
  `}function vd(){hv(),Ci=!1,setTimeout(()=>yv(),0);let e=parseInt(localStorage.getItem(ud)||"320",10);return`
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
            ${Ya()}
          </div>
        </div>
      </div>

      <!-- Mobile: Detail View (overlays list) -->
      <div id="vs-notes-mobile-detail" class="vs-notes-mobile-detail" style="display: none;"></div>
    </div>
  `}async function yv(){Ci||(Ci=!0,await md(),Ev())}async function md(){let e;if(Yt?e=await C.get(`/notes/search?q=${encodeURIComponent(Yt)}`):e=await C.get("/notes"),!e.ok){B("Could not load notes.","error");return}if(qe=e.data.notes||[],vs(),Si(),je){let t=qe.find(s=>s.id===je);t?window.matchMedia("(max-width: 767px)").matches?(bo="detail",hd(t)):fd(t,{restoring:!0}):je=null}}function Si(){let e=document.getElementById("vs-notes-empty"),t=document.getElementById("vs-notes-split");if(!e||!t)return;let s=window.matchMedia("(max-width: 767px)").matches;qe.length===0&&!Yt?(e.style.display="flex",t.style.display="none"):(e.style.display="none",t.style.display=s?"block":"flex")}function vs(){let e=document.getElementById("vs-notes-list");if(!e)return;if(qe.length===0){Yt?e.innerHTML=`
        <div class="vs-notes-no-results">No notes matching "${y(Yt)}"</div>
      `:e.innerHTML="";return}let t=qe.filter(o=>o.pinned==1),s=qe.filter(o=>o.pinned!=1),n="";t.length>0&&!Yt&&(n+='<div class="vs-notes-section-label">Pinned</div>',n+=t.map(o=>cd(o)).join(""),s.length>0&&(n+='<div class="vs-notes-section-label vs-notes-section-label--rest">Notes</div>')),n+=s.map(o=>cd(o)).join(""),e.innerHTML=n,e.querySelectorAll("[data-note-id]").forEach(o=>{o.addEventListener("click",()=>{let i=parseInt(o.dataset.noteId,10);Li(i)}),o.addEventListener("contextmenu",i=>{i.preventDefault(),kv(i,parseInt(o.dataset.noteId,10))})})}function cd(e){let t=e.id===je,s=e.pinned==1,n=e.title||"Untitled",o=xv(e.body),i=Kn(e.updated_at);return`
    <div class="vs-note-item ${t?"vs-note-item--active":""}"
         data-note-id="${e.id}" tabindex="0" role="button">
      <div class="vs-note-item-top">
        ${s?'<span class="vs-note-pin" title="Pinned">\u{1F4CC}</span>':""}
        <span class="vs-note-item-title">${y(n)}</span>
      </div>
      ${o?`<div class="vs-note-item-preview">${wv(y(o))}</div>`:""}
      <div class="vs-note-item-time">${i}</div>
    </div>
  `}function xv(e){if(!e)return"";let t=e.replace(/^#{1,3} /gm,"").replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1").replace(/`([^`]+)`/g,"$1").replace(/\[([^\]]+)\]\([^)]+\)/g,"$1").replace(/^[-*] /gm,"").replace(/^\d+\. /gm,"").replace(/^> /gm,"").replace(/\n/g," ").trim();return t.length>dd?t.substring(0,dd).trim()+"\u2026":t}function wv(e){if(!Yt)return e;let t=Yt.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return e.replace(new RegExp(`(${t})`,"gi"),"<mark>$1</mark>")}async function Li(e){if(e===je)return;await an(),je=e,Is=!1,Ka="idle",document.querySelectorAll(".vs-note-item").forEach(n=>{n.classList.toggle("vs-note-item--active",parseInt(n.dataset.noteId,10)===e)});let t=qe.find(n=>n.id===e);if(!t)return;window.matchMedia("(max-width: 767px)").matches?(bo="detail",hd(t)):fd(t)}async function gd(){if(await an(),je=null,Is=!1,Ka="idle",vs(),window.matchMedia("(max-width: 767px)").matches&&bo==="detail"){bo="list";let t=document.getElementById("vs-notes-mobile-detail");t&&(t.style.display="none")}else{let t=document.getElementById("vs-notes-editor-content");t&&(t.innerHTML=Ya())}}function fd(e,t={}){let s=document.getElementById("vs-notes-editor-content");if(!s)return;let n=e.pinned==1;s.innerHTML=`
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
  `,bd(e);let o=document.getElementById("vs-note-body");o&&(yo(o),t.restoring||setTimeout(()=>{o.focus(),o.setSelectionRange(o.value.length,o.value.length)},50))}function hd(e){let t=document.getElementById("vs-notes-mobile-detail");if(!t)return;let s=e.pinned==1;t.style.display="flex",t.innerHTML=`
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
  `,bd(e);let n=document.getElementById("btn-note-back");n==null||n.addEventListener("click",async()=>{await an(),bo="list",t.style.display="none",je=null,vs()});let o=document.getElementById("vs-note-body");o&&(yo(o),setTimeout(()=>o.focus(),50))}function bd(e){let t=document.getElementById("vs-note-title"),s=document.getElementById("vs-note-body"),n=()=>{_t&&clearTimeout(_t),_t=setTimeout(()=>Xa(),pd)};t==null||t.addEventListener("input",n),s==null||s.addEventListener("input",()=>{yo(s),n()});let o=document.getElementById("btn-note-pin");o==null||o.addEventListener("click",async()=>{if(xo()||wo())return;let c=e.pinned==1,{ok:u,data:p}=await C.put(`/notes/${e.id}`,{pinned:c?0:1});if(u&&p.note){e.pinned=p.note.pinned;let d=qe.findIndex(m=>m.id===e.id);d>=0&&(qe[d]={...qe[d],...p.note}),o.classList.toggle("vs-note-toolbar-btn--active",p.note.pinned==1);let v=o.querySelector("svg");v&&v.setAttribute("fill",p.note.pinned==1?"currentColor":"none"),vs(),p.pin_limit&&B(p.pin_limit_message||"You can pin up to 5 notes.","info")}});let i=document.getElementById("btn-note-preview");i==null||i.addEventListener("click",yd);let a=document.getElementById("btn-note-send-chat");a==null||a.addEventListener("click",()=>Qa());let r=document.getElementById("btn-note-board");r==null||r.addEventListener("click",()=>xd(e));let l=document.getElementById("btn-note-delete");l==null||l.addEventListener("click",()=>Ja(e.id))}async function Xa(){if(!je||window.IS_DEMO)return;let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");if(!e&&!t)return;let s=(e==null?void 0:e.value)??"",n=(t==null?void 0:t.value)??"",{ok:o,data:i}=await C.put(`/notes/${je}`,{title:s,body:n});if(o&&(i!=null&&i.note)){let a=qe.findIndex(r=>r.id===je);a>=0&&(qe[a]={...qe[a],...i.note}),vs()}}async function Ga(){if(xo()||wo())return;let{ok:e,data:t}=await C.post("/notes",{title:"",body:""});e&&(t!=null&&t.note)&&(qe.unshift(t.note),vs(),Si(),Li(t.note.id))}async function Ja(e){if(xo()||wo())return;let{ok:t}=await C.delete(`/notes/${e}`);if(!t){B("Could not delete note.","error");return}if(qe=qe.filter(n=>n.id!==e),je===e){je=null,Is=!1,Ka="idle";let n=document.getElementById("vs-notes-editor-content");n&&(n.innerHTML=Ya())}vs(),Si(),Qn("Note deleted","Undo",async()=>{var o;let n=await C.post(`/notes/${e}/restore`);n.ok&&((o=n.data)!=null&&o.note)&&(qe.unshift(n.data.note),vs(),Si(),Li(n.data.note.id),B("Note restored.","success"))},"info");let s=document.getElementById("vs-notes-mobile-detail");s&&(s.style.display="none")}function yd(){let e=document.getElementById("vs-note-body-wrap"),t=document.getElementById("btn-note-preview");if(e)if(Is){Is=!1,e.innerHTML=`<textarea id="vs-note-body" class="vs-note-body-textarea"
                    placeholder="Start writing\u2026" spellcheck="true">${y(ho)}</textarea>`;let s=document.getElementById("vs-note-body");s&&(yo(s),s.addEventListener("input",()=>{yo(s),_t&&clearTimeout(_t),_t=setTimeout(()=>Xa(),pd)}),s.focus()),t==null||t.classList.remove("vs-note-toolbar-btn--active")}else{let s=document.getElementById("vs-note-body");if(!s)return;ho=s.value,Is=!0;let n=bv(ho);e.innerHTML=`<div id="vs-note-preview" class="vs-note-preview">${n}</div>`,t==null||t.classList.add("vs-note-toolbar-btn--active")}}function Za(){let e=document.getElementById("vs-note-title"),t=document.getElementById("vs-note-body");return{title:(e==null?void 0:e.value)??"",body:Is?ho:(t==null?void 0:t.value)??""}}async function Qa(e){await an();let t,s;e?(t=e.title||"",s=e.body||""):{title:t,body:s}=Za();let o=`Here is my note "${t||"Untitled"}":

${s}

`;window.location.hash="#/chat",setTimeout(()=>{let i=document.getElementById("prompt-input");i&&(i.value=o,i.focus(),i.style.height="auto",i.style.height=i.scrollHeight+"px")},150)}async function xd(e){if(xo()||wo())return;await an();let t,s,n;e?(t=e.title||"",s=e.body||"",n=e.id):({title:t,body:s}=Za(),n=je);let{ok:o,error:i}=await C.post("/cards",{title:t||"Untitled",body:s,column_name:"todo",source_note_id:n});o?B("Card added to Board.","success"):B((i==null?void 0:i.message)||"Failed to add card.","error")}function kv(e,t){var a;(a=document.getElementById("vs-note-ctx"))==null||a.remove();let s=qe.find(r=>r.id===t);if(!s)return;let n=s.pinned==1,o=document.createElement("div");o.id="vs-note-ctx",o.className="vs-note-context-menu",o.style.left=`${e.clientX}px`,o.style.top=`${e.clientY}px`,o.innerHTML=`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>{let r=o.getBoundingClientRect();r.right>window.innerWidth&&(o.style.left=`${window.innerWidth-r.width-8}px`),r.bottom>window.innerHeight&&(o.style.top=`${window.innerHeight-r.height-8}px`)}),o.addEventListener("click",async r=>{var c;let l=(c=r.target.closest("[data-action]"))==null?void 0:c.dataset.action;if(l)switch(o.remove(),l){case"pin":{if(xo()||wo())return;let u=n?0:1,{ok:p,data:d}=await C.put(`/notes/${t}`,{pinned:u});if(p&&d.note){let v=qe.findIndex(m=>m.id===t);v>=0&&(qe[v]={...qe[v],...d.note}),vs(),d.pin_limit&&B(d.pin_limit_message||"You can pin up to 5 notes.","info")}break}case"send":{Qa(t!==je?s:void 0);break}case"use":{await an();let u=t===je?Za().body:s.body||"";window.location.hash="#/chat",setTimeout(()=>{let p=document.getElementById("prompt-input");p&&(p.value=u,p.focus(),p.style.height="auto",p.style.height=p.scrollHeight+"px")},150);break}case"delete":Ja(t);break;case"board":xd(s);break}});let i=r=>{o.contains(r.target)||(o.remove(),document.removeEventListener("click",i))};setTimeout(()=>document.addEventListener("click",i),0)}function Ev(){let e=document.getElementById("btn-note-new");e==null||e.addEventListener("click",Ga);let t=document.getElementById("btn-notes-first");t==null||t.addEventListener("click",Ga);let s=document.getElementById("notes-search");s==null||s.addEventListener("input",()=>{In&&clearTimeout(In),In=setTimeout(()=>{Yt=s.value.trim(),md()},fv)});let n=document.getElementById("vs-notes-list-panel");n==null||n.addEventListener("click",o=>{o.target.closest(".vs-note-item")||o.target.closest("button")||o.target.closest("input")||o.target.closest(".vs-notes-section-label")||je&&gd()}),document.addEventListener("keydown",wd),$v()}function wd(e){var n,o,i;if(R.get("route")!=="notes")return;let s=navigator.platform.toUpperCase().includes("MAC")?e.metaKey:e.ctrlKey;if(s&&e.key==="n"){e.preventDefault(),Ga();return}if(s&&e.key==="Backspace"&&je){e.preventDefault(),Ja(je);return}if(s&&e.shiftKey&&e.key==="p"){e.preventDefault(),je&&yd();return}if(s&&e.shiftKey&&(e.key==="c"||e.key==="C")){e.preventDefault();let a=qe.find(r=>r.id===je);a&&Qa(a);return}if(e.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;je&&gd();return}if((e.key==="ArrowUp"||e.key==="ArrowDown")&&!e.metaKey&&!e.ctrlKey){let a=(n=document.activeElement)==null?void 0:n.closest(".vs-note-item");if(!a)return;e.preventDefault();let r=[...document.querySelectorAll(".vs-note-item")],l=r.indexOf(a),c=e.key==="ArrowDown"?Math.min(l+1,r.length-1):Math.max(l-1,0);(o=r[c])==null||o.focus()}if(e.key==="Enter"){let a=(i=document.activeElement)==null?void 0:i.closest(".vs-note-item");a&&(e.preventDefault(),Li(parseInt(a.dataset.noteId,10)))}}function $v(){let e=document.getElementById("vs-notes-resize"),t=document.getElementById("vs-notes-list-panel");if(!e||!t)return;let s,n;e.addEventListener("mousedown",o=>{o.preventDefault(),s=o.clientX,n=t.offsetWidth;let i=r=>{let l=Math.max(200,Math.min(500,n+r.clientX-s));t.style.width=`${l}px`},a=()=>{document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",a),localStorage.setItem(ud,String(t.offsetWidth))};document.addEventListener("mousemove",i),document.addEventListener("mouseup",a)})}function yo(e){if(!e)return;e.style.height="auto";let t=window.innerHeight-200;e.style.height=Math.min(t,e.scrollHeight)+"px"}function kd(){var e,t;document.removeEventListener("keydown",wd),_t&&(clearTimeout(_t),_t=null),In&&(clearTimeout(In),In=null),Yt="",Is=!1,ho="",Ci=!1,(e=window.__vsFlushCallbacks)==null||e.delete("notes"),(t=document.getElementById("vs-note-ctx"))==null||t.remove()}var Ti=!1,Ms=null,Ke=null,Ii=null,ko=null,_s=null,Co=[{id:"todo",label:"To Do",dotColor:"var(--vs-text-ghost)"},{id:"in_progress",label:"In Progress",dotColor:"var(--vs-accent)"},{id:"done",label:"Done",dotColor:"var(--vs-success)"}];function Mn(){var t;let e=(t=R.get("user"))==null?void 0:t.role;return e==="owner"||e==="editor"}function er(){return Ti=!1,Ke=null,setTimeout(()=>{Mv(),wt()},0),`
    <div class="vs-board" id="board-root">
      <div class="vs-board-header">
        <h1 class="vs-board-title">Board</h1>
        ${Mn()?`
          <button id="btn-board-add" class="vs-btn vs-btn-primary vs-btn-sm">
            New Card
          </button>
        `:""}
      </div>
      <div class="vs-board-columns" id="board-columns">
        ${Co.map(t=>`
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
  `}async function wt(){var o;let{ok:e,data:t}=await C.get("/cards");if(!e){B("Failed to load board.","error");return}let s=(t==null?void 0:t.cards)||[];R.set("cards",s),R.set("cardsLoaded",!0),Cv(s);let n=await C.get("/cards/archived");if(n.ok){let i=((o=n.data)==null?void 0:o.cards)||[];Iv(i.length)}}function Cv(e){let t=Mn();for(let s of Co){let n=e.filter(a=>a.column_name===s.id),o=document.querySelector(`[data-col-cards="${s.id}"]`),i=document.querySelector(`[data-count="${s.id}"]`);if(i&&(i.textContent=n.length),!!o){if(n.length===0){s.id==="todo"&&e.length===0?o.innerHTML=t?`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0 0 12px;">Your board is empty</p>
              <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 16px;">Add your first task or promote a note from the Notes section.</p>
              <button class="vs-btn vs-btn-ghost vs-btn-sm board-empty-add">Add a card</button>
            </div>`:`<div class="vs-board-empty">
              <p style="font-size: 13px; color: var(--vs-text-ghost); margin: 0;">No tasks on the board yet.</p>
            </div>`:t?o.innerHTML='<div class="vs-board-drop-zone">Drop a card here</div>':o.innerHTML="";continue}if(o.innerHTML=n.map(a=>a.id===Ke?Cd(a,s,t):Sv(a,s,t)).join(""),Ke){let a=o.querySelector(`[data-card-id="${Ke}"].vs-board-card-expanded`);a&&t&&Sd(a,Ke)}}}}function Sv(e,t,s){let n=e.body?`<div class="vs-board-card-body">${y(e.body.substring(0,200))}</div>`:"",o=e.linked_page?`<div class="vs-board-card-footer"><span class="vs-board-card-link" data-page="${re(e.linked_page)}"><span class="vs-board-card-link-icon">${$.link}</span>${y(Md(e.linked_page))}</span></div>`:"";return`
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
  `}function Cd(e,t,s){let n=R.get("pages")||[];return s?`
    <div class="vs-board-card vs-board-card-expanded vs-board-card-editing"
         data-card-id="${e.id}" data-column="${e.column_name}">
      <div class="vs-board-card-expand-header">
        <input type="text"
               class="vs-board-inline-title"
               data-field="title"
               data-card-id="${e.id}"
               value="${re(e.title)}"
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
          ${Co.map(o=>`<option value="${o.id}" ${o.id===e.column_name?"selected":""}>${o.label}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-inline-row">
        <label class="vs-board-inline-label">Linked page</label>
        <select class="vs-board-inline-select" data-field="linked_page" data-card-id="${e.id}">
          <option value="">None</option>
          ${n.map(o=>`<option value="${re(o.slug)}" ${o.slug===e.linked_page?"selected":""}>${y(o.title||o.slug)}</option>`).join("")}
        </select>
      </div>
      <div class="vs-board-card-expand-footer">
        <div class="vs-board-card-actions">
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-card-archive="${e.id}" title="Archive this card">
            ${$.archive}
            Archive
          </button>
          <button class="vs-btn vs-btn-danger vs-btn-xs" data-card-delete="${e.id}" title="Permanently delete">
            ${$.trash}
            Delete
          </button>
        </div>
        <div class="vs-board-card-meta">
          Created ${$o(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${$o(e.updated_at)}`:""}
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
            <span class="vs-board-card-link" data-page="${re(e.linked_page)}"><span class="vs-board-card-link-icon">${$.link}</span>${y(Md(e.linked_page))}</span>
          </div>
        `:""}
        <div class="vs-board-card-meta">
          Created ${$o(e.created_at)}${e.updated_at!==e.created_at?` \xB7 Updated ${$o(e.updated_at)}`:""}
        </div>
      </div>
    `}function Sd(e,t){let s=e.querySelector('[data-field="title"]'),n=e.querySelector('[data-field="body"]'),o=e.querySelector('[data-field="column"]'),i=e.querySelector('[data-field="linked_page"]');s==null||s.addEventListener("input",()=>{Ed(t,{title:s.value.trim()})}),n==null||n.addEventListener("input",()=>{$d(n),Ed(t,{body:n.value})}),o==null||o.addEventListener("change",async()=>{if(window.IS_DEMO){return}let a=o.value;let{ok:r}=await C.put(`/cards/${t}/move`,{column_name:a,position:0});r?(Ke=null,await wt()):void 0}),i==null||i.addEventListener("change",async()=>{if(window.IS_DEMO){return}let{ok:a}=await C.put(`/cards/${t}`,{linked_page:i.value||null});}),n&&$d(n)}function Ed(e,t){_s&&_s.cardId===e?Object.assign(_s.fields,t):_s={cardId:e,fields:{...t}},clearTimeout(Ii),Ii=setTimeout(()=>Mi(),600)}async function Mi(){if(clearTimeout(Ii),Ii=null,!_s){ko&&await ko;return}let{cardId:e,fields:t}=_s;if(_s=null,window.IS_DEMO){return}ko=C.put(`/cards/${e}`,t);let{ok:s}=await ko;ko=null}function $d(e){e.style.height="auto",e.style.height=Math.max(60,e.scrollHeight)+"px"}async function Lv(e){Ke&&Ke!==e&&await _i();let{ok:t,data:s}=await C.get(`/cards/${e}`);if(!t||!(s!=null&&s.card)){B("Card not found.","error");return}Ke=e;let n=s.card,o=Co.find(c=>c.id===n.column_name)||Co[0],i=Mn(),a=document.querySelector(`[data-card-id="${e}"]`);if(!a)return;let r=Cd(n,o,i);a.outerHTML=r;let l=document.querySelector(`[data-card-id="${e}"]`);l&&i&&(Sd(l,e),setTimeout(()=>{var c;return(c=l.querySelector(".vs-board-inline-title"))==null?void 0:c.focus()},50)),l==null||l.scrollIntoView({behavior:"smooth",block:"nearest"})}async function _i(){Ke&&(await Mi(),Ke=null,await wt())}function Tv(e,t){Eo();let s=document.createElement("div");s.className="vs-board-card-dropdown",s.id="vs-board-card-dropdown",s.innerHTML=`
    <button class="vs-board-card-dropdown-item" data-action="archive" data-id="${e}">
      ${$.archive}
      Archive
    </button>
    <div class="vs-board-card-dropdown-divider"></div>
    <button class="vs-board-card-dropdown-item vs-board-card-dropdown-danger" data-action="delete" data-id="${e}">
      ${$.trash}
      Delete
    </button>
  `;let n=t.getBoundingClientRect();s.style.position="fixed",s.style.top=`${n.bottom+4}px`,s.style.right=`${window.innerWidth-n.right}px`,s.style.zIndex="1000",document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let o=a=>{!s.contains(a.target)&&a.target!==t&&(Eo(),document.removeEventListener("click",o))};setTimeout(()=>document.addEventListener("click",o),10);let i=a=>{a.key==="Escape"&&(Eo(),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i),s.addEventListener("click",async a=>{let r=a.target.closest("[data-action]");if(!r)return;let l=r.dataset.action,c=parseInt(r.dataset.id,10);if(Eo(),l==="archive"){if(window.IS_DEMO){B("Demo mode \u2014 this action is disabled.","warning");return}let{ok:u}=await C.post(`/cards/${c}/archive`);u&&(Ke===c&&(Ke=null),Qn("Card archived.","Undo",async()=>{await C.post(`/cards/${c}/restore`),await wt()}),await wt())}else if(l==="delete"){if(window.IS_DEMO){B("Demo mode \u2014 this action is disabled.","warning");return}if(!await Te({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:p}=await C.delete(`/cards/${c}`);p&&(Ke===c&&(Ke=null),B("Card deleted.","success"),await wt())}})}function Eo(){let e=document.getElementById("vs-board-card-dropdown");e&&e.remove()}function Iv(e){let t=document.getElementById("board-archived-link");if(t){if(e===0){t.classList.add("hidden");return}t.classList.remove("hidden"),t.innerHTML=`<button class="vs-board-show-archived">${$.archive||""} Archived (${e})</button>`}}function Mv(){var s,n;if(Ti)return;Ti=!0;let e=Mn();(s=document.getElementById("btn-board-add"))==null||s.addEventListener("click",Id);let t=document.getElementById("board-columns");t&&(t.addEventListener("click",_v),e&&Rv(t)),(n=document.getElementById("board-archived-link"))==null||n.addEventListener("click",o=>{o.target.closest(".vs-board-show-archived")&&Dv()}),document.addEventListener("keydown",Ld),document.addEventListener("mousedown",Td),Pv(),window.__vsFlushCallbacks||(window.__vsFlushCallbacks=new Map),window.__vsFlushCallbacks.set("board",()=>Mi())}function _v(e){let t=e.target;if(t.closest(".board-empty-add")){Id();return}let s=t.closest("[data-card-menu]");if(s){e.stopPropagation();let l=parseInt(s.dataset.cardMenu,10);Tv(l,s);return}if(t.closest("[data-card-close]")){e.stopPropagation(),_i();return}let o=t.closest("[data-card-archive]");if(o){e.stopPropagation(),Bv(parseInt(o.dataset.cardArchive,10));return}let i=t.closest("[data-card-delete]");if(i){e.stopPropagation(),Av(parseInt(i.dataset.cardDelete,10));return}let a=t.closest(".vs-board-card-link");if(a){e.stopPropagation();let l=a.dataset.page;l&&Hv(l);return}if(t.closest("input, textarea, select, button"))return;let r=t.closest(".vs-board-card");if(r&&!r.classList.contains("vs-board-card-expanded")){let l=parseInt(r.dataset.cardId,10);Lv(l);return}}function Ld(e){if(e.key==="Escape"&&Ke){if(document.querySelector(".vs-modal-overlay"))return;e.preventDefault(),_i()}}function Td(e){if(!Ke)return;let t=e.target,s=document.querySelector(".vs-board-card-expanded");s&&s.contains(t)||t.closest(".vs-modal-overlay")||t.closest(".vs-board-card-dropdown")||_i()}async function Bv(e){if(window.IS_DEMO){B("Demo mode \u2014 this action is disabled.","warning");return}let{ok:t}=await C.post(`/cards/${e}/archive`);t&&(Ke=null,Qn("Card archived.","Undo",async()=>{await C.post(`/cards/${e}/restore`),await wt()}),await wt())}async function Av(e){if(window.IS_DEMO){B("Demo mode \u2014 this action is disabled.","warning");return}if(!await Te({title:"Delete Card",description:"Permanently delete this card? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:s}=await C.delete(`/cards/${e}`);s&&(Ke=null,B("Card deleted.","success"),await wt())}function Id(){var a,r,l;let e=document.getElementById("vs-board-create-overlay");e&&e.remove();let t=R.get("pages")||[],s=document.createElement("div");s.id="vs-board-create-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
              ${t.map(c=>`<option value="${re(c.slug)}">${y(c.title||c.slug)}</option>`).join("")}
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>Ee(s);$e(s,n),(a=document.getElementById("btn-card-cancel"))==null||a.addEventListener("click",n);let o=c=>{c.key==="Escape"&&(c.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),(r=document.getElementById("card-new-title"))==null||r.addEventListener("keydown",c=>{var u;c.key==="Enter"&&((u=document.getElementById("btn-card-create"))==null||u.click())}),(l=document.getElementById("btn-card-create"))==null||l.addEventListener("click",async()=>{var h,g,f,x;let c=(g=(h=document.getElementById("card-new-title"))==null?void 0:h.value)==null?void 0:g.trim(),u=(f=document.getElementById("card-new-column"))==null?void 0:f.value,p=((x=document.getElementById("card-new-page"))==null?void 0:x.value)||null,d=document.getElementById("card-create-error"),v=document.getElementById("btn-card-create");if(!c){d&&(d.textContent="Please enter a card title.",d.classList.remove("hidden"));return}if(v.disabled=!0,v.textContent="Creating\u2026",window.IS_DEMO){n(),B("Demo mode \u2014 this action is disabled.","warning");return}let{ok:m,error:b}=await C.post("/cards",{title:c,column_name:u,linked_page:p});m?(n(),B("Card created.","success"),await wt()):(v.disabled=!1,v.textContent="Create",d&&(d.textContent=(b==null?void 0:b.message)||"Failed to create card.",d.classList.remove("hidden")))}),setTimeout(()=>{var c;return(c=document.getElementById("card-new-title"))==null?void 0:c.focus()},80)}async function Pv(){if((R.get("pages")||[]).length>0)return;let{ok:t,data:s}=await C.get("/pages");t&&Array.isArray(s==null?void 0:s.pages)&&R.set("pages",s.pages)}function Rv(e){e.addEventListener("dragstart",t=>{let s=t.target.closest(".vs-board-card");!s||s.classList.contains("vs-board-card-expanded")||(Ms={cardId:parseInt(s.dataset.cardId,10),sourceColumn:s.dataset.column},s.classList.add("vs-board-card-dragging"),t.dataTransfer.effectAllowed="move",t.dataTransfer.setData("text/plain",s.dataset.cardId))}),e.addEventListener("dragend",t=>{let s=t.target.closest(".vs-board-card");s&&s.classList.remove("vs-board-card-dragging"),Ms=null,e.querySelectorAll(".vs-board-drop-indicator").forEach(n=>n.remove())}),e.addEventListener("dragover",t=>{t.preventDefault(),t.dataTransfer.dropEffect="move";let s=t.target.closest("[data-col-cards]");if(!s)return;e.querySelectorAll(".vs-board-drop-indicator").forEach(r=>r.remove());let n=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")],o=t.clientY,i=null;for(let r of n){let l=r.getBoundingClientRect();if(o<l.top+l.height/2){i=r;break}}let a=document.createElement("div");a.className="vs-board-drop-indicator",i?s.insertBefore(a,i):s.appendChild(a)}),e.addEventListener("drop",async t=>{if(t.preventDefault(),!Ms)return;let s=t.target.closest("[data-col-cards]");if(!s)return;let n=s.dataset.colCards,i=(R.get("cards")||[]).filter(p=>p.column_name===n&&p.id!==Ms.cardId).sort((p,d)=>p.position-d.position),a=[...s.querySelectorAll(".vs-board-card:not(.vs-board-card-dragging)")].map(p=>({id:parseInt(p.dataset.cardId,10),rect:p.getBoundingClientRect()})),r=t.clientY,l=a.length;for(let p=0;p<a.length;p++)if(r<a[p].rect.top+a[p].rect.height/2){l=p;break}let c;if(i.length===0||l===0?c=0:l>=i.length?c=i[i.length-1].position+1e3:c=Math.floor((i[l-1].position+i[l].position)/2),e.querySelectorAll(".vs-board-drop-indicator").forEach(p=>p.remove()),window.IS_DEMO){await wt(),Ms=null;return}let{ok:u}=await C.put(`/cards/${Ms.cardId}/move`,{column_name:n,position:c});u?await wt():B("Failed to move card.","error"),Ms=null})}async function Dv(){var r;let{ok:e,data:t}=await C.get("/cards/archived");if(!e){B("Failed to load archived cards.","error");return}let s=(t==null?void 0:t.cards)||[],n=Mn(),o=document.getElementById("vs-board-archived-overlay");o&&o.remove();let i=document.createElement("div");i.id="vs-board-archived-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">Archived Cards</h2>
      </div>
      <div class="vs-modal-body" style="max-height: 60vh; overflow-y: auto;">
        ${s.length===0?'<p style="font-size: 13px; color: var(--vs-text-ghost);">No archived cards.</p>':s.map(l=>`
            <div class="vs-board-archived-item" data-card-id="${l.id}">
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${y(l.title||"Untitled")}</div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 2px;">Archived ${$o(l.updated_at)}</div>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>Ee(i);if($e(i,a),(r=document.getElementById("btn-archived-close"))==null||r.addEventListener("click",a),n){let l=i.querySelector(".vs-modal");l==null||l.addEventListener("click",async c=>{let u=c.target.closest(".archived-restore-btn");if(u){let d=u.dataset.id,{ok:v}=await C.post(`/cards/${d}/restore`);v&&(B("Card restored.","success"),a(),await wt());return}let p=c.target.closest(".archived-delete-btn");if(p){let d=p.dataset.id;if(!await Te({title:"Delete Permanently",description:"This card will be permanently deleted. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:m}=await C.delete(`/cards/${d}`);m&&(B("Card deleted.","success"),a(),await wt())}})}}function Hv(e){if(Mn())R.set("activePageScope",e),window.location.hash="#/chat";else{let s=window.location.origin,n=e==="index"?"/":`/${e}`;window.open(`${s}${n}`,"_blank")}}function $o(e){return e?new Date(e).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):""}function Md(e){if(!e)return"";if(e==="index"||e==="index.php")return"Home";let s=(R.get("pages")||[]).find(i=>i.slug===e);return s!=null&&s.title?s.title:e.replace(/\.(php|html)$/i,"").split("/").pop().split("-").filter(Boolean).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(" ")||e}async function _d(){await Mi(),Ms=null,Ke=null,_s=null,Ti=!1,Eo(),document.removeEventListener("keydown",Ld),document.removeEventListener("mousedown",Td),window.__vsFlushCallbacks&&window.__vsFlushCallbacks.delete("board")}function So(e=[],t=[]){var s,n,o,i;try{let a=JSON.parse(sessionStorage.getItem("vs-editor-state")||"null");if(a){let r=l=>{var c;return((c=e.find(u=>u.oldFilePath===l))==null?void 0:c.newFilePath)||l};a.openTabs=[...new Set((a.openTabs||[]).map(r).filter(l=>!t.includes(l)))],a.activeTab=r(a.activeTab),a.openTabs.includes(a.activeTab)||(a.activeTab=a.openTabs[0]||null),sessionStorage.setItem("vs-editor-state",JSON.stringify(a))}}catch{}for(let a of e)(n=(s=window.__vsEditorPage)==null?void 0:s.reconcileMove)==null||n.call(s,a.oldFilePath,a.newFilePath);for(let a of t)(i=(o=window.__vsEditorPage)==null?void 0:o.reconcileDelete)==null||i.call(o,a)}async function Bd(e,{read:t=o=>C.get(o,{silent:!0}),pause:s=()=>new Promise(o=>setTimeout(o,1e3)),attempts:n=15}={}){var i;let o={};for(let a=0;a<n;a++){let r=await t("/site-control/plans/"+encodeURIComponent(e));if(r.ok&&r.data){if(o=r.data,["applied","failed","ready","unknown"].includes(o.status))return o}else if(["forbidden","not_found","unauthorized"].includes((i=r.error)==null?void 0:i.code))break;a+1<n&&await s()}return{...o,status:"unknown"}}var Lo="vs-sc-pending-mutation";function rn(){try{let e=JSON.parse(sessionStorage.getItem(Lo)||"null");return e&&/^[a-f0-9]{32}$/.test(e.id)?e:null}catch{return null}}function Nv(){return Array.from(crypto.getRandomValues(new Uint8Array(16)),e=>e.toString(16).padStart(2,"0")).join("")}function Ov(e){if(typeof e=="string")try{e=JSON.parse(e)}catch{return null}return(e==null?void 0:e.ok)===!0?{ok:!0,data:e.data||e}:(e==null?void 0:e.ok)===!1?{ok:!1,error:e.error||{message:"The mutation failed."}}:null}async function Ad(e,t,s={}){var i;if(rn())return Bi(s);let n={id:(s.createId||Nv)(),route:e,body:t};try{sessionStorage.setItem(Lo,JSON.stringify(n))}catch{return{ok:!1,error:{code:"recovery_unavailable",message:"Your browser could not save the recovery identifier. Enable session storage, then try again."}}}let o;try{o=await(s.post||C.post)(e,{...t,mutation_id:n.id})}catch{o={ok:!1,error:{code:"network_error"}}}return((i=o==null?void 0:o.error)==null?void 0:i.code)==="network_error"||!o?Bi(s):(sessionStorage.removeItem(Lo),o)}async function Bi({read:e=n=>C.get(n,{silent:!0}),pause:t=()=>new Promise(n=>setTimeout(n,1e3)),attempts:s=15}={}){var a,r,l;let n=rn();if(!n)return{ok:!1,error:{code:"no_pending_mutation",message:"No Site mutation needs recovery."}};let o={};for(let c=0;c<s;c++){let u=await e("/site-control/mutations/"+n.id);if(u.ok&&u.data&&(o=u.data,["complete","applied","failed"].includes(o.status))){let p=Ov(o.response)||{ok:!1,error:{code:"mutation_failed",message:"The mutation failed. Review the restoration details before continuing."}};return p.ok||(p.error={...p.error,restored:p.error.restored??o.restored??null,snapshotId:p.error.snapshotId||o.snapshotId||null}),(a=p.error)!=null&&a.recovery_resolved&&p.error.recovery_note&&(p.error.message=p.error.recovery_note),sessionStorage.removeItem(Lo),(l=(r=globalThis.window)==null?void 0:r.__vsSetGlobalStatus)==null||l.call(r,p.ok?"saved":"error"),p}c+1<s&&await t()}let i={...n,snapshotId:o.snapshotId||n.snapshotId||null};try{sessionStorage.setItem(Lo,JSON.stringify(i))}catch{}return{ok:!1,error:{code:"mutation_unconfirmed",message:"The server has not confirmed this change. Check the result before editing or retrying.",outcome_unknown:!0,mutation_id:n.id,snapshotId:i.snapshotId,restored:null}}}var jv=[{selector:".vs-site-tree-select[data-select-page]",attribute:"data-select-page"},{selector:".vs-site-card-body[data-select-page]",attribute:"data-select-page"},{selector:".vs-impact-item[data-node-id]",attribute:"data-node-id"},{selector:".vs-impact-ref-item[data-node-id]",attribute:"data-node-id"}];function Pd(e,t){if(!t||!e.contains(t))return null;for(let s of jv){if(!t.matches(s.selector))continue;let n=t.getAttribute(s.attribute),o=[...e.querySelectorAll(s.selector)].filter(i=>i.getAttribute(s.attribute)===n);return{...s,value:n,index:o.indexOf(t)}}return null}function Rd(e,t){var n;if(!t)return;(n=[...e.querySelectorAll(t.selector)].filter(o=>o.getAttribute(t.attribute)===t.value)[t.index])==null||n.focus({preventScroll:!0})}var ie=null;function ln(e){ie=e}var ue=null;function Xt(e){ue=e}var Dd=null;function ms(e){Dd=e}var Bs="";function sr(e){Bs=e}var gs=null;function As(e){gs=e}var To=null;function Ai(e){To=e}var nr=!1;function Hd(e){nr=e}var jt=null;function Ps(e){jt=e}var qv=null;function Rs(e){qv=e}var Ds="";function fs(e){Ds=e}var or=!1;function Pi(e){or=e}var Fe="idle";function Ce(e){Fe=e}var Hs=null;function pt(e){Hs=e}var Ze=null;function Bt(e){Ze=e}var Fv=null;function Nd(e){Fv=e}var dn=!1;function Od(e){dn=e}var gt;function ir(e){gt=e}var Jt=null;function Io(e){Jt=e}var Mo=!1;function jd(e){Mo=e}var qt=null;function qd(e){qt=e}var St=null;function Fd(e){St=e}var zd=!1;function Ud(e){zd=e}var _n=null;function ar(e){_n=e}var Ri=!1;function Vd(e){Ri=e}var Di=!1;function Wd(e){Di=e}var Hi=!1;function Ni(e){Hi=e}function Ft(){dn=!1,gt=void 0,Jt=null,Mo=!1,qt=null,St=null,zd=!1,_n=null,Ri=!1,Di=!1,Hi=!1}var Ns=!1;function Gd(e){Ns=e}var Oi="";function Kd(e){Oi=e}var hs="idle";function ji(e){hs=e}var cn=null;function rr(e){cn=e}var _o=null;function Yd(e){_o=e}function Zt(){Ns=!1,Oi="",hs="idle",cn=null,_o=null}var Os=!1;function Xd(e){Os=e}var ut="idle";function zt(e){ut=e}var pn=null;function lr(e){pn=e}var Bo=null;function Jd(e){Bo=e}function Ut(){Os=!1,ut="idle",pn=null,Bo=null}var tr="vs-site-selected-node";function Bn(e){try{e?sessionStorage.setItem(tr,e):sessionStorage.removeItem(tr)}catch{}}function Zd(){try{return sessionStorage.getItem(tr)||null}catch{return null}}var ft=new Set,Qd="vs-site-card-prefs",zv={"direct-includes":"open","transitive-includes":"closed","links-to":"closed","linked-from":"open","blast-radius":"closed"};function Uv(){try{let e=sessionStorage.getItem(Qd);if(e)return new Map(Object.entries(JSON.parse(e)))}catch{}return new Map}var qi=Uv();function ec(){try{sessionStorage.setItem(Qd,JSON.stringify(Object.fromEntries(qi)))}catch{}}function dr(e){let t=qi.get(e);return t?t==="closed":(zv[e]||"closed")==="closed"}var ot=new Map,tc="vs-site-sidebar-widths",sc="vs-site-section-state",Vv=["partial","route","asset","token"],nc=[{key:"page",label:"Pages",icon:"fileText"},{key:"partial",label:"Partials",icon:"fileCode"},{key:"route",label:"Routes",icon:"globe"},{key:"asset",label:"Assets",icon:"image"},{key:"token",label:"Tokens",icon:"palette"}];function Wv(){try{let e=sessionStorage.getItem(sc);if(e)return new Set(JSON.parse(e))}catch{}return new Set(Vv)}function oc(){try{sessionStorage.setItem(sc,JSON.stringify([...js]))}catch{}}var js=Wv();function ic(){try{return JSON.parse(sessionStorage.getItem(tc))||{}}catch{return{}}}function cr(e,t){let s=ic();s[e]=t;try{sessionStorage.setItem(tc,JSON.stringify(s))}catch{}}function pr(e){let t=ic();return t[e]?` style="width: ${t[e]}px;"`:""}function un(e){let t=new Map,s=e.edges||[];for(let i of e.nodes||[])t.set(i.id,i);let n=new Map,o=new Map;for(let i of s)n.has(i.source)||n.set(i.source,[]),n.get(i.source).push(i),o.has(i.target)||o.set(i.target,[]),o.get(i.target).push(i);return{nodes:t,edges:s,summary:e.summary||{},warnings:e.warnings||[],builtAt:e.built_at||null,buildTimeMs:e.build_time_ms||0,edgesBySource:n,edgesByTarget:o}}function qs(){var o,i,a,r,l,c,u;if(!ie)return[];let e=[];for(let[,p]of ie.nodes)p.type==="page"&&e.push(p);let t=new Map;for(let p of e)t.set(p.id,{id:p.id,label:p.label||p.id.replace("page:",""),slug:((o=p.meta)==null?void 0:o.slug)||"",level:((i=p.meta)==null?void 0:i.level)||1,childCount:((a=p.meta)==null?void 0:a.childCount)||0,parentPageId:((r=p.meta)==null?void 0:r.parentPageId)||null,hierarchySource:((l=p.meta)==null?void 0:l.hierarchySource)||null,isHomepage:((c=p.meta)==null?void 0:c.isHomepage)||!1,navOrder:((u=p.meta)==null?void 0:u.navOrder)||0,children:[]});let s=[];for(let[,p]of t)p.parentPageId&&t.has(p.parentPageId)?t.get(p.parentPageId).children.push(p):s.push(p);let n=(p,d)=>p.isHomepage!==d.isHomepage?p.isHomepage?-1:1:p.navOrder!==d.navOrder?p.navOrder-d.navOrder:p.label.localeCompare(d.label);s.sort(n);for(let[,p]of t)p.children.length>0&&p.children.sort(n);return s}function vn(e){let s=(ie.edgesByTarget.get(e)||[]).find(n=>n.type==="serves");return s?s.source:null}function Lt(e){let t=ie.nodes.get(e);return t?t.label||t.id:e}function At(e){let t=ie.nodes.get(e);return t?t.type:"unknown"}function Fi(){return ue?Dd:null}function ac(e){return`
    <div class="vs-sc-left-inner">
      <div class="vs-sc-filter">
        <input type="text" id="vs-sc-search" class="vs-input vs-input-sm"
               placeholder="Filter\u2026" autocomplete="off" value="${y(Bs)}" />
      </div>
      <div class="vs-sc-left-scroll" id="vs-sc-left-scroll">
        ${Gv(e)}
        ${Kv()}
      </div>
    </div>
  `}function Gv(e){let t=js.has("page-tree"),s=0;if(ie)for(let[,n]of ie.nodes)n.type==="page"&&s++;return`
    <div class="vs-sc-nav-section ${t?"is-collapsed":""}">
      <button class="vs-sc-nav-section-header" data-nav-section="page-tree">
        <span class="vs-sc-nav-section-chevron">${$.chevronDown}</span>
        <span class="vs-sc-nav-section-label">Pages</span>
        <span class="vs-sc-nav-section-count">${s}</span>
      </button>
      <div class="vs-sc-nav-section-body">
        ${rc(e,0)}
      </div>
    </div>
  `}function rc(e,t){if(!e||e.length===0)return"";let s=Bs.toLowerCase(),n="",o=2;for(let i of e){if(s&&!An(i,s))continue;let a=Fi()===i.id,r=ft.has(i.id),l=i.children.length>0,c=Math.min(t,o),u=t>o,p=c*20;n+=`
      <div class="vs-site-tree-group ${l&&r?"is-collapsed":""}"
           data-tree-group="${y(i.id)}">
        <div class="vs-site-tree-item ${a?"is-selected":""}"
             style="padding-left: ${12+p}px"
             data-page-id="${y(i.id)}">
          ${l?`
            <button class="vs-site-tree-toggle"
                    data-toggle-page="${y(i.id)}"
                    aria-label="${r?"Expand":"Collapse"} ${y(i.label)}"
                    aria-expanded="${!r}">
              ${$.chevronDown}
            </button>
          `:'<span class="vs-site-tree-toggle-spacer"></span>'}
          <button type="button" class="vs-site-tree-select"
                  data-select-page="${y(i.id)}"
                  aria-label="Inspect ${y(i.label)}"
                  aria-pressed="${ue===i.id}">
            ${i.isHomepage?'<span class="vs-site-tree-star">\u2605</span>':""}
            <span class="vs-site-tree-label">${y(i.label)}</span>
            ${i.hierarchySource==="inferred"?'<span class="vs-site-tree-inferred" title="Inferred from URL structure \u2014 not explicitly authored">\u2071</span>':""}
            ${u?'<span class="vs-site-tree-overdepth" title="Deeper than 3 levels, shown at Level 3">\u207A</span>':""}
            ${l?`<span class="vs-site-tree-badge">${i.childCount}</span>`:""}
          </button>
        </div>
        ${l?`
          <div class="vs-site-tree-children">
            ${rc(i.children,t+1)}
          </div>
        `:""}
      </div>
    `}return n}function Kv(){if(!ie)return"";let e=Bs.toLowerCase(),t=new Map,s=nc.filter(o=>o.key!=="page");for(let o of s)t.set(o.key,[]);for(let[,o]of ie.nodes){let i=t.get(o.type);i&&i.push(o)}let n="";for(let o of s){let i=t.get(o.key)||[],a=e?i.filter(c=>{let u=(c.label||"").toLowerCase(),p=c.id.toLowerCase();return u.includes(e)||p.includes(e)}):i;a.sort((c,u)=>(c.label||c.id).localeCompare(u.label||u.id));let r=js.has(o.key),l=e?`${a.length}/${i.length}`:`${i.length}`;n+=`
      <div class="vs-sc-nav-section ${r?"is-collapsed":""}">
        <button class="vs-sc-nav-section-header" data-nav-section="${o.key}">
          <span class="vs-sc-nav-section-chevron">${$.chevronDown}</span>
          <span class="vs-sc-nav-section-label">${o.label}</span>
          <span class="vs-sc-nav-section-count">${l}</span>
        </button>
        <div class="vs-sc-nav-section-body">
          ${a.length===0?'<div class="vs-sc-nav-item-empty">No matches</div>':a.map(c=>Xv(c,o)).join("")}
        </div>
      </div>
    `}return n}function Yv(e){let t=(e.split(".").pop()||"").toLowerCase();return{css:"paintbrush",scss:"paintbrush",less:"paintbrush",js:"fileCode",ts:"fileCode",mjs:"fileCode",json:"fileJson",jpg:"image",jpeg:"image",png:"image",gif:"image",webp:"image",avif:"image",ico:"image",svg:"penTool",mp4:"film",webm:"film",mov:"film",mp3:"music",wav:"music",ogg:"music",woff:"type",woff2:"type",ttf:"type",otf:"type",eot:"type",pdf:"filePdf"}[t]||"image"}function Xv(e,t){var c,u,p;let s=ue===e.id,n=y(e.label||e.id),o=((c=e.meta)==null?void 0:c.isShared)===!0,i=((u=e.meta)==null?void 0:u.isHomepage)===!0,a="";i&&(a+='<span class="vs-impact-badge vs-impact-badge-star">\u2605</span>'),o&&(a+='<span class="vs-impact-badge vs-impact-badge-shared">shared</span>');let r="";if(t.key==="token"&&((p=e.meta)!=null&&p.value)){let d=e.meta.value;/^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(d)&&(r=`<span class="vs-impact-swatch" style="background:${y(d)}"></span>`)}let l=t.icon;return t.key==="asset"?l=Yv(e.id):t.key==="partial"&&(l="puzzle"),`
    <button type="button" class="vs-impact-item ${s?"is-selected":""}" data-node-id="${y(e.id)}"
            aria-label="Inspect ${y(e.type)} ${n}" aria-pressed="${s}">
      <span class="vs-impact-item-icon">${$[l]||$[t.icon]||""}</span>
      <span class="vs-impact-item-label">${n}</span>
      ${r}
      ${a}
    </button>
  `}function An(e,t){return e.label.toLowerCase().includes(t)||e.slug.toLowerCase().includes(t)?!0:e.children.some(s=>An(s,t))}function lc(e){var i,a;if(!ue||ue!==e)return"";let t=(i=ie)==null?void 0:i.nodes.get(e),s=((a=t==null?void 0:t.meta)==null?void 0:a.isHomepage)||!1,n=s?'<button class="vs-sc-action-drop-item vs-sc-action-danger is-disabled" disabled title="The homepage cannot be deleted">Delete</button>':'<button class="vs-sc-action-drop-item vs-sc-action-danger" data-action="delete">Delete</button>',o=s?'<button class="vs-sc-action-drop-item is-disabled" disabled title="The homepage cannot be moved">Move</button>':'<button class="vs-sc-action-drop-item" data-action="reorder">Move</button>';return`
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
  `}function Pn(e){let t=document.getElementById("vs-site-diagram");if(!t||!e||e.length===0)return;let s=t.querySelector(".vs-sc-connectors");s&&s.remove();let n=[],o=k=>{for(let E of k)if(E.children.length>0&&!ft.has(E.id)){for(let I of E.children)n.push({parentId:E.id,childId:I.id});o(E.children)}},i=Bs.toLowerCase(),a=k=>{if(!i)return k;let E=[];for(let I of k)if(An(I,i)){let T=a(I.children);E.push({...I,children:T})}return E},r=a(e),l=r.find(k=>k.isHomepage),c=r.filter(k=>!k.isHomepage);if(l)for(let k of c)n.push({parentId:l.id,childId:k.id});if(o(r),n.length===0)return;let u=t.getBoundingClientRect(),p=t.scrollLeft,d=t.scrollTop,v=[];for(let{parentId:k,childId:E}of n){let I=t.querySelector(`.vs-site-card[data-page-id="${CSS.escape(k)}"]`),T=t.querySelector(`.vs-site-card[data-page-id="${CSS.escape(E)}"]`);if(!I||!T)continue;let N=I.getBoundingClientRect(),j=T.getBoundingClientRect(),W=N.left-u.left+p+N.width/2,q=N.top-u.top+d+N.height,Y=j.left-u.left+p+j.width/2,ee=j.top-u.top+d,H=q+(ee-q)/2,S=`M ${W} ${q} V ${H} H ${Y} V ${ee}`,P=ue&&(k===ue||E===ue);v.push({d:S,isActive:P})}if(v.length===0)return;let m=t.scrollWidth,b=t.scrollHeight,h=document.createElementNS("http://www.w3.org/2000/svg","svg");h.setAttribute("class","vs-sc-connectors"),h.setAttribute("width",m),h.setAttribute("height",b),h.setAttribute("viewBox",`0 0 ${m} ${b}`),h.setAttribute("aria-hidden","true");let g=document.createElementNS("http://www.w3.org/2000/svg","g");g.setAttribute("class","vs-sc-hierarchy-rails");let f=v.filter(k=>!k.isActive),x=v.filter(k=>k.isActive);for(let{d:k}of f){let E=document.createElementNS("http://www.w3.org/2000/svg","path");E.setAttribute("d",k),g.appendChild(E)}for(let{d:k}of x){let E=document.createElementNS("http://www.w3.org/2000/svg","path");E.setAttribute("d",k),E.classList.add("active"),g.appendChild(E)}h.appendChild(g);let w=document.createElementNS("http://www.w3.org/2000/svg","g");w.setAttribute("class","vs-sc-impact-overlays"),h.appendChild(w),t.appendChild(h)}function dc(e){if(!e||e.length===0)return'<div class="vs-site-diagram-empty">No pages found</div>';let t=Bs.toLowerCase(),s=u=>{if(!t)return u;let p=[];for(let d of u)if(An(d,t)){let v=s(d.children);p.push({...d,children:v})}return p},n=u=>{let p=[];for(let d of u.children)p.push(d),d.children.length>0&&!ft.has(d.id)&&p.push(...o(d));return p},o=u=>{let p=[];for(let d of u.children)p.push(d),d.children.length>0&&!ft.has(d.id)&&p.push(...o(d));return p},i=s(e),a=i.find(u=>u.isHomepage),r=i.filter(u=>!u.isHomepage),l=u=>{if(u.children.length===0||ft.has(u.id))return"";let p=t?u.children.filter(v=>An(v,t)):u.children;if(p.length===0)return"";let d=`<div class="vs-site-tier-group" data-parent-id="${y(u.id)}">`;d+=`<div class="vs-site-tier-group-label"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>${y(u.label)}</div>`,d+='<div class="vs-site-tier-group-cards">';for(let v of p)if(d+=zi(v),v.children.length>0&&!ft.has(v.id)){let m=n(v),b=t?m.filter(h=>h.label.toLowerCase().includes(t)||h.slug.toLowerCase().includes(t)):m;if(b.length>0){d+='<div class="vs-site-tier-l3-inline">';for(let h of b)d+=zi(h);d+="</div>"}}return d+="</div></div>",d},c='<div class="vs-site-tiers">';if(a&&(c+=`
      <div class="vs-site-tier vs-site-tier-home">
        ${zi(a)}
      </div>
    `),r.length>0||a&&a.children.length>0&&!ft.has(a.id)){if(c+='<div class="vs-site-tier vs-site-tier-l1">',a&&a.children.length>0&&!ft.has(a.id)){let u=l(a);u&&(c+=`<div class="vs-site-tier-column">${u}</div>`)}for(let u of r)c+='<div class="vs-site-tier-column">',c+=zi(u),c+=l(u),c+="</div>";c+="</div>"}return c+="</div>",c}function zi(e){let t=Fi()===e.id,s=e.hierarchySource==="inferred",n=vn(e.id),o="";if(n){let a=ie.nodes.get(n);a&&(o=a.label||a.id.replace("route:",""))}else e.isHomepage?o="/ \xB7 Homepage":e.slug&&(o="/"+e.slug);return`
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
      ${lc(e.id)}
    </div>
  `}var ye="idle";function ze(e){ye=e,Vi()}function gn(){return["running","applying","recovering"].includes(ye)}var mn="";function Ui(e){mn=e,Vi()}var Fs=[];function bs(e){Fs.push(e)}function vr(){Fs=[]}var Se=null;function Pt(e){Se=e,Vi()}var De=null;function it(e){De=e,Vi()}var ur="vs-sc-reviewed-plan";function Vi(){try{if(!(Se!=null&&Se.plan_id)){sessionStorage.removeItem(ur);return}sessionStorage.setItem(ur,JSON.stringify({state:ye,plan:Se,result:De,prompt:mn}))}catch{}}var cc;try{let e=JSON.parse(sessionStorage.getItem(ur)||"null");(cc=e==null?void 0:e.plan)!=null&&cc.plan_id&&(Se=e.plan,De=e.result||null,mn=e.prompt||"",ye=["applying","recovering"].includes(e.state)?"recovering":e.state)}catch{}var pc="vs-sc-console-height",uc="vs-sc-console-collapsed";function Jv(){try{let e=sessionStorage.getItem(pc);return e?parseInt(e,10):null}catch{return null}}function vc(e){try{sessionStorage.setItem(pc,String(e))}catch{}}function mr(){try{return sessionStorage.getItem(uc)==="1"}catch{return!1}}function mc(e){try{sessionStorage.setItem(uc,e?"1":"0")}catch{}}function gc(){let e=mr(),t=Jv();return`
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
        ${ye!=="idle"?`
          <span class="vs-sc-console-status is-${ye}">
            ${em(ye)}
          </span>
        `:""}
        ${Fs.length>0?`
          <button class="vs-sc-console-clear" id="vs-sc-console-clear" title="Clear log" ${gn()?"disabled":""}>
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
            ${Zv()}
          </div>
          <div class="vs-sc-console-composer" id="vs-sc-console-composer">
            ${Qv()}
          </div>
        </div>
      `}
    </div>
  `}function Zv(){return Fs.length===0?`
      <div class="vs-sc-console-empty">
        <span class="vs-sc-console-empty-text">
          Describe a change. Review the affected files and edits before applying them to preview.
        </span>
      </div>
    `:Fs.map(e=>{if(e.phase){let n=nm(e.phase),o=om(e.status),i=e.file?`<span class="vs-sc-log-file">${y(e.file)}</span> `:"",a=e.ms!=null?`<span class="vs-sc-log-meta">${e.ms}ms</span>`:e.bytes!=null?`<span class="vs-sc-log-meta">${e.bytes}b</span>`:"";return`
        <div class="vs-sc-log-entry vs-sc-log-phase ${o}">
          <span class="vs-sc-log-icon">${n}</span>
          <span class="vs-sc-log-phase-name">${e.phase}</span>
          ${i}<span class="vs-sc-log-text">${y(e.message||"")}</span>
          ${a}
        </div>
      `}let t=sm(e.type),s=tm(e.type);return`
      <div class="vs-sc-log-entry ${t}">
        <span class="vs-sc-log-icon">${s}</span>
        <span class="vs-sc-log-text">${y(e.message)}</span>
      </div>
    `}).join("")}function Qv(){let e=gn();return`
    <div class="vs-sc-composer-wrap">
      <textarea
        id="vs-sc-composer-input"
        class="vs-sc-composer-input"
        placeholder="${y(e?"Orchestrating\u2026":"Describe a change across your site\u2026")}"
        autocomplete="off"
        spellcheck="false"
        rows="1"
        ${e?"disabled":""}
      >${y(mn)}</textarea>
      <div class="vs-sc-composer-actions">
        <span class="vs-sc-composer-hint">
          ${e?"":"<kbd>Enter</kbd> to run \xB7 <kbd>Shift+Enter</kbd> for newline"}
        </span>
        <button
          id="vs-sc-composer-submit"
          class="vs-sc-composer-submit"
          title="Run"
          ${e||!mn.trim()?"disabled":""}
        >
          ${e?'<span class="vs-sc-command-spinner"></span>':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'}
        </button>
      </div>
    </div>
  `}function em(e){switch(e){case"running":return"Analyzing\u2026";case"plan":return"Plan Ready";case"plan_failed":return"Plan Failed";case"applying":return"Applying\u2026";case"recovering":return"Checking result\u2026";case"applied":return"Applied";case"apply_failed":return"Apply Failed";case"complete":return"Done";default:return""}}function tm(e){switch(e){case"running":return"\u25CF";case"done":return"\u2713";case"error":return"\u2717";case"skipped":return"\u2298";case"info":return"\u2192";case"plan":return"\u25C6";default:return"\xB7"}}function sm(e){switch(e){case"running":return"is-running";case"done":return"is-done";case"error":return"is-error";case"skipped":return"is-skipped";case"plan":return"is-plan";default:return""}}function nm(e){return{start:"\u25B6",snapshot:"\u25CE",read:"\u2193",anchor:"\u2693",patch:"\u270E",lint:"\u2318",verify:"\u2714",reject:"\u2298",rollback:"\u21BA",done:"\u2713",failed:"\u2717",abort:"\u2298"}[e]||"\xB7"}function om(e){return{ok:"is-ok",failed:"is-failed",error:"is-failed",skip:"is-skip",refused:"is-refused",start:"is-info",partial:"is-warning"}[e]||""}function hc(){if(ye!=="idle")return`
      <div class="vs-sc-right-inner">
        <div class="vs-sc-right-header">
          <span class="vs-sc-right-title">Review</span>
          <span class="vs-sc-right-mode-badge is-${ye}">
            ${ye==="running"?"Analyzing":ye==="plan"?"Plan Ready":ye==="plan_failed"?"Plan Failed":ye==="applying"?"Applying":ye==="recovering"?"Checking result":ye==="applied"?"Applied":ye==="apply_failed"?"Apply Failed":ye==="complete"?"Complete":ye}
          </span>
        </div>
        <div class="vs-sc-right-body" id="vs-sc-right-body">
          ${fc()}
          ${im()}
        </div>
      </div>
    `;let t=ue&&ie&&ie.nodes.get(ue),s=t?ie.nodes.get(ue):null;return`
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
        ${fc()}
        ${t?gr():am()}
      </div>
    </div>
  `}function fc(){var t;let e=((t=ie)==null?void 0:t.warnings)||[];return e.length?`<div class="vs-sc-review-section">
    <h4 class="vs-sc-review-heading">References need review</h4>
    <p class="vs-sc-review-plan-summary">Counts cover indexed references. Dynamic PHP links and includes, or relative links in shared partials, may require manual review.</p>
    ${e.slice(0,10).map(s=>`<p class="vs-sc-review-plan-summary">${y(s.file||"")}${s.line?":"+y(String(s.line)):""}: ${y(s.message||s.reason||"Reference could not be resolved.")}</p>`).join("")}
    ${e.length>10?`<p class="vs-sc-review-plan-summary">${e.length-10} more items require review.</p>`:""}
  </div>`:""}function im(){var e,t,s,n,o,i,a,r,l,c,u,p,d,v,m,b,h,g,f,x,w;if(ye==="plan"&&Se){let k=Se.files||[],E=Se.affected_pages||[],I=Se.skipped||[],T=Se.intent||null,N=Se.edits||[],j=Se.risk_level||"medium",W=Se.plan_summary||"",q=N.filter(S=>S.anchored!==!1),Y=N.filter(S=>S.anchored===!1),ee=q.length>0,H=ee&&N.every(S=>S.anchored===!0)&&!!Se.plan_id;return`
      <div class="vs-sc-orch-review">
        ${T?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Intent</h4>
            <div class="vs-sc-review-intent">
              <span class="vs-impact-type-badge vs-impact-type-${T.category||"content"}">${y(T.category||"content")}</span>
              <span class="vs-sc-review-scope">${y(T.scope||"site-wide")}</span>
            </div>
            <p class="vs-sc-review-summary">${y(T.summary||"")}</p>
            ${T.keywords&&T.keywords.length>0?`
              <div class="vs-sc-review-keywords">
                ${T.keywords.map(S=>`<span class="vs-sc-review-keyword">${y(S)}</span>`).join("")}
              </div>
            `:""}
          </div>
        `:""}
        ${ee?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">
              Edit Plan
              <span class="vs-sc-review-count">${q.length}</span>
              <span class="vs-sc-review-risk is-${j}">${j}</span>
            </h4>
            ${W?`<p class="vs-sc-review-plan-summary">${y(W)}</p>`:""}
            ${q.map((S,P)=>`
              <div class="vs-sc-review-edit">
                <div class="vs-sc-review-edit-header">
                  <span class="vs-sc-review-edit-num">${P+1}</span>
                  <span class="vs-sc-review-edit-strategy">${y(S.strategy||"edit")}</span>
                  <button type="button" class="vs-sc-review-file-path" data-orch-open-file="${y(S.file||"")}" title="Open in Editor">${y(S.file||"")}</button>
                </div>
                <p class="vs-sc-review-edit-desc">${y(S.description||"")}</p>
                ${S.before_snippet||S.after_snippet?`
                  <div class="vs-sc-review-diff">
                    ${S.before_snippet?`<div class="vs-sc-review-diff-before"><span class="vs-sc-diff-label">\u2212</span><code>${y(S.before_snippet)}</code></div>`:""}
                    ${S.after_snippet?`<div class="vs-sc-review-diff-after"><span class="vs-sc-diff-label">+</span><code>${y(S.after_snippet)}</code></div>`:""}
                  </div>
                `:""}
                ${S.verification?`<p class="vs-sc-review-edit-verify">Check after apply: ${y(S.verification)}</p>`:""}
              </div>
            `).join("")}
          </div>
        `:`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Candidate Files <span class="vs-sc-review-count">${k.length}</span></h4>
            ${k.length===0?'<p class="vs-sc-review-empty">No files affected</p>':k.map(S=>`
                <div class="vs-sc-review-file">
                  <div class="vs-sc-review-file-header">
                    <span class="vs-impact-type-badge vs-impact-type-${S.type||"page"}">${y(S.type||"file")}</span>
                    <span class="vs-sc-review-file-path">${y(S.path)}</span>
                  </div>
                  ${S.reason?`<span class="vs-sc-review-file-reason">${y(S.reason)}</span>`:""}
                </div>
              `).join("")}
          </div>
        `}
        ${Y.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Unverified Edits <span class="vs-sc-review-count">${Y.length}</span></h4>
            <p class="vs-sc-review-plan-summary">The whole plan is blocked until every edit can be verified. Describe the change again to build a new plan.</p>
            ${Y.map(S=>`
              <div class="vs-sc-review-issue">
                <span class="vs-sc-review-file-path">${y(S.file||"")}</span>
                <span class="vs-sc-review-skip-reason">${y(S.anchor_issue||"Not anchored to source")}</span>
              </div>
            `).join("")}
          </div>
        `:""}
        ${E.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Affected Pages <span class="vs-sc-review-count">${E.length}</span></h4>
            <div class="vs-sc-review-pages">
              ${E.map(S=>`
                <div class="vs-sc-review-page">
                  <span class="vs-sc-review-page-label">${y(S.label)}</span>
                  ${S.slug?`<span class="vs-sc-review-page-slug">${y(S.slug)}</span>`:""}
                </div>
              `).join("")}
            </div>
          </div>
        `:""}
        ${I.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Skipped</h4>
            ${I.map(S=>`
              <div class="vs-sc-review-skip">
                <span class="vs-sc-review-file-path">${y(S.path)}</span>
                <span class="vs-sc-review-skip-reason">${y(S.reason)}</span>
              </div>
            `).join("")}
          </div>
        `:""}
        <div class="vs-sc-review-actions">
          <p class="vs-sc-review-plan-summary">Apply updates preview files. Publish is a separate step. Shared assets, including styles, can also affect the published site.</p>
          ${H?'<button class="vs-sc-review-approve" id="vs-sc-orch-apply">Approve &amp; Apply</button>':""}
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>
        </div>
      </div>
    `}if(ye==="plan_failed"){let k=((e=Se)==null?void 0:e.files)||[],E=((t=Se)==null?void 0:t.affected_pages)||[],I=((s=Se)==null?void 0:s.edits)||[],T=((n=De)==null?void 0:n.summary)||((o=Se)==null?void 0:o.plan_summary)||"",N=I.filter(j=>!j.anchored);return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Plan Not Ready</h4>
          <p class="vs-sc-review-plan-summary">${y(T||"The edit plan could not be verified against the source files.")}</p>
          ${N.length>0?`
            <div class="vs-sc-review-issues">
              ${N.map(j=>`
                <div class="vs-sc-review-issue">
                  <span class="vs-sc-review-file-path">${y(j.file||"")}</span>
                  <span class="vs-sc-review-skip-reason">${y(j.anchor_issue||"before_snippet not found in source")}</span>
                </div>
              `).join("")}
            </div>
          `:""}
        </div>
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Discovered Files <span class="vs-sc-review-count">${k.length}</span></h4>
          ${k.map(j=>`
            <div class="vs-sc-review-file">
              <div class="vs-sc-review-file-header">
                <span class="vs-impact-type-badge vs-impact-type-${j.type||"page"}">${y(j.type||"file")}</span>
                <span class="vs-sc-review-file-path">${y(j.path)}</span>
              </div>
            </div>
          `).join("")}
        </div>
        ${E.length>0?`
          <div class="vs-sc-review-section">
            <h4 class="vs-sc-review-heading">Affected Pages <span class="vs-sc-review-count">${E.length}</span></h4>
            <div class="vs-sc-review-pages">
              ${E.map(j=>`
                <div class="vs-sc-review-page">
                  <span class="vs-sc-review-page-label">${y(j.label)}</span>
                  ${j.slug?`<span class="vs-sc-review-page-slug">${y(j.slug)}</span>`:""}
                </div>
              `).join("")}
            </div>
          </div>
        `:""}
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>
        </div>
      </div>
    `}if(ye==="applying"||ye==="recovering")return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-waiting">
          <div class="vs-sc-command-spinner"></div>
          <p class="vs-sc-review-waiting-text">${ye==="recovering"?"Checking the server result\u2026":"Applying edits\u2026"}</p>
          <p class="vs-sc-review-waiting-hint">${ye==="recovering"?"The request may still be running. This check does not apply the plan again.":"Each file is read, anchored, patched, and verified."}</p>
        </div>
      </div>
    `;if(ye==="applied"){let k=(i=De)==null?void 0:i.filesChanged,E=((a=De)==null?void 0:a.verification)||[],I=(r=De)==null?void 0:r.duration_ms,T=E.length>0,N=0,j=0;E.forEach(q=>{q.checks.forEach(Y=>{N++,Y.passed&&j++})});let W=E.map(q=>{let Y=q.checks.map(ee=>{let H=ee.passed?"\u2714":"\u2717";return`<div class="vs-sc-verify-check ${ee.passed?"is-passed":"is-failed"}">
          <span class="vs-sc-verify-icon">${H}</span>
          <span class="vs-sc-verify-name">${y(ee.check)}</span>
          <span class="vs-sc-verify-detail">${y(ee.detail)}</span>
        </div>`}).join("");return`<div class="vs-sc-verify-file">
        <div class="vs-sc-verify-file-name">${y(q.file)}</div>
        ${Y}
      </div>`}).join("");return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">${T?"Verification Report":"Site Result"}</h4>
          <p class="vs-sc-review-plan-summary">Preview updated. Publish pages separately. Shared assets may already affect the published site.</p>
          ${(l=De)!=null&&l.summary?`<p class="vs-sc-review-plan-summary">${y(De.summary)}</p>`:""}
          <div class="vs-sc-verify-summary">
            ${Number.isFinite(k)?`<span class="vs-sc-verify-stat">${k} file(s) patched</span>`:""}
            ${T?`<span class="vs-sc-verify-stat">${j}/${N} checks passed</span>`:""}
            ${I?`<span class="vs-sc-verify-stat">${I}ms</span>`:""}
          </div>
          ${W}
        </div>
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Done</button>
        </div>
      </div>
    `}if(ye==="apply_failed"){let k=((c=De)==null?void 0:c.summary)||"Patch execution failed.",E=(u=De)==null?void 0:u.rollback_clean,I=((p=De)==null?void 0:p.recovery_resolved)===!0,T=E!==!0&&E!==!1,N=((d=De)==null?void 0:d.remaining_changed_files)||((v=De)==null?void 0:v.changed_files)||[],j=(m=De)==null?void 0:m.recovery_snapshot_id,W=((b=De)==null?void 0:b.verification)||[],q=(h=De)==null?void 0:h.duration_ms,Y=I?`Recovery completed from snapshot #${y(String(De.recovery_resolved_by_snapshot))}. The original change was not retried.`:E===!0?"The attempted changes were restored and verified.":E===!1?"Some changes remain. Review the files below before continuing.":"The result is unconfirmed. Files may have changed. Check the server result before retrying or editing these files.",ee=I||E===!0?"is-clean":"is-dirty",H=W.map(S=>{let P=S.checks.map(F=>{let U=F.passed?"\u2714":"\u2717";return`<div class="vs-sc-verify-check ${F.passed?"is-passed":"is-failed"}">
          <span class="vs-sc-verify-icon">${U}</span>
          <span class="vs-sc-verify-name">${y(F.check)}</span>
          <span class="vs-sc-verify-detail">${y(F.detail)}</span>
        </div>`}).join("");return`<div class="vs-sc-verify-file">
        <div class="vs-sc-verify-file-name">${y(S.file)}</div>
        ${P}
      </div>`}).join("");return`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">${T?"Apply Result Unconfirmed":"Apply Failed"}</h4>
          <p class="vs-sc-review-plan-summary">${y(k)}</p>
          <div class="vs-sc-verify-rollback ${ee}">
            <span class="vs-sc-verify-icon">${I||E===!0?"\u21BA":"\u26A0"}</span>
            ${Y}
          </div>
          ${N.length?`<p class="vs-sc-review-plan-summary">${I?"Files reported by the failed attempt":"Files requiring review"}: ${N.map(S=>y(S)).join(", ")}</p>`:""}
          ${j&&!I?`<p class="vs-sc-review-plan-summary">Snapshots are in Designs \u2192 History. Restore snapshot #${y(String(j))} if recovery is needed. Snapshot restore replaces preview files and shared assets.</p>`:""}
          ${q?`<p class="vs-sc-verify-timing">${q}ms elapsed</p>`:""}
          ${H}
        </div>
        <div class="vs-sc-review-actions">
          ${((g=Se)!=null&&g.plan_id||(f=De)!=null&&f.mutation_id)&&T?'<button class="vs-sc-review-approve" id="vs-sc-orch-check">Check result</button>':""}
          ${(x=De)!=null&&x.mutation_id&&T?"":'<button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Dismiss</button>'}
        </div>
      </div>
    `}return ye==="running"?`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-waiting">
          <div class="vs-sc-command-spinner"></div>
          <p class="vs-sc-review-waiting-text">Discovering affected files\u2026</p>
          <p class="vs-sc-review-waiting-hint">The results will appear here once analysis is complete.</p>
        </div>
      </div>
    `:ye==="complete"?`
      <div class="vs-sc-orch-review">
        <div class="vs-sc-review-section">
          <h4 class="vs-sc-review-heading">Results</h4>
          <p class="vs-sc-review-summary">${y(((w=De)==null?void 0:w.summary)||"No edits were proposed.")}</p>
        </div>
        <div class="vs-sc-review-actions">
          <button class="vs-sc-review-cancel" id="vs-sc-orch-dismiss">Done</button>
        </div>
      </div>
    `:'<div class="vs-sc-orch-review"><p class="vs-sc-review-empty">No active orchestration.</p></div>'}function am(){return ie?`
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${$.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `:Rn()}function Rn(){return`
    <div class="vs-sc-summary-empty">
      <div class="vs-empty-state vs-empty-state--panel">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            ${$.box}
          </div>
          <p class="vs-empty-state-title">Select a page</p>
        </div>
      </div>
    </div>
  `}function gr(){var r,l;if(Os)return ym();if(Ns)return bm();if(dn)return mm();if(jt)return lm();let e=(r=ie)==null?void 0:r.nodes.get(ue);if(!e)return Rn();let t="";if(e.type==="page"){let c=vn(e.id);if(c){let u=ie.nodes.get(c);t=u?u.label||c:""}}else e.type==="route"?t=e.label||e.id:t=e.id;let s="";(l=e.meta)!=null&&l.isShared&&(s+='<span class="vs-impact-header-badge vs-impact-header-shared">Shared</span>');let n=ot.get(e.id);n!=null&&n.is_global&&(s+='<span class="vs-impact-header-badge vs-impact-header-global">Global</span>');let o=[];um(e,o),vm(e.id,o);let i=o.filter(c=>!c.collapsed).map(c=>c.html),a=o.filter(c=>c.collapsed).map(c=>c.html);return`
    <div class="vs-impact-detail-content">
      <div class="vs-impact-detail-header">
        ${t?`<p class="vs-impact-detail-subtitle">${y(t)}</p>`:""}
        ${s?`<div class="vs-impact-detail-badges">${s}</div>`:""}
      </div>
      ${i.join("")}
      ${a.join("")}
    </div>
  `}function bc(e,t){var i;if(zs())return;let s=(i=ie)==null?void 0:i.nodes.get(e);if(!s)return;Zt(),Ft(),Ut(),ye!=="idle"&&(ze("idle"),it(null),Pt(null));let n=e;if(s.type==="page"&&(n=vn(e),!n)||s.type!=="page"&&s.type!=="route")return;Ps(n),Rs(e),fs(""),Pi(!0),Ce("idle"),pt(null),Bt(null);let o=ie.edgesByTarget.get(n)||[];for(let a of o)if(a.type==="links_to"){let r=ie.nodes.get(a.source);(r==null?void 0:r.type)==="partial"&&!ot.has(a.source)&&rm(a.source,t)}}function ys(){zs()||(Ps(null),Rs(null),fs(""),Ce("idle"),pt(null),Bt(null))}function yc(e){var s;if(zs())return;let t=(s=ie)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(Zt(),ys(),Ut(),ye!=="idle"&&(ze("idle"),it(null),Pt(null)),Ft(),Od(!0),Ni(!0),Ce("idle"),pt(null),Bt(null))}function Po(){zs()||(Ft(),Ce("idle"),pt(null),Bt(null))}function xc(e){var s;if(zs())return;let t=(s=ie)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(ys(),Ft(),Ut(),ye!=="idle"&&(ze("idle"),it(null),Pt(null)),Zt(),Gd(!0),Kd(t.label||""))}function Dn(){zs()||Zt()}function wc(e){var s,n;if(zs())return;let t=(s=ie)==null?void 0:s.nodes.get(e);!t||t.type!=="page"||(n=t.meta)!=null&&n.isHomepage||(ys(),Ft(),Zt(),ye!=="idle"&&(ze("idle"),it(null),Pt(null)),Ut(),Xd(!0))}function Wi(){zs()||Ut()}function zs(){return gn()||Fe==="applying"||hs==="applying"||ut==="applying"}function Gi(e){if(!e||typeof e!="object")return"";let t=e.recovery_resolved?`Recovery completed from snapshot #${y(String(e.recovery_resolved_by_snapshot))}. The original change was not retried.`:e.restored===!0?"The attempted changes were restored and verified.":e.restored===!1?"Restoration is incomplete. Review your files before continuing.":e.code==="network_error"?"The result is unconfirmed. Reload Site and inspect your files before retrying.":"",s=e.snapshotId&&!e.recovery_resolved?` Snapshots are in Designs \u2192 History. Recovery snapshot: #${y(String(e.snapshotId))}. Snapshot restore replaces preview files and shared assets.`:"";return t||s?`<p class="vs-sc-form-result-detail">${t}${s}</p>`:""}async function rm(e,t){if(ot.has(e))return;let{ok:s,data:n}=await C.get("/site-graph/blast-radius?node="+encodeURIComponent(e));s&&n&&!ot.has(e)&&(ot.set(e,n),t&&t())}function lm(){var p;let e=(p=ie)==null?void 0:p.nodes.get(jt);if(!e)return ys(),ue?gr():Rn();let t=e.label||e.id,s=t==="/"||e.id==="route:/";if(Fe==="success"&&Ze)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${$.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">URL updated</p>
            <p class="vs-sc-form-result-detail">${y(Ze.oldPath)} \u2192 ${y(Ze.newPath)}</p>
            ${Ze.referenceCount>0?`<p class="vs-sc-form-result-detail">${Ze.referenceCount} reference${Ze.referenceCount!==1?"s":""} updated across ${(Ze.updatedFiles||[]).length} file${(Ze.updatedFiles||[]).length!==1?"s":""}</p>`:""}
            ${Ze.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `;if(Fe==="error"&&Hs)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Change URL</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${$.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${y(Hs.message||"Unknown error")}</p>
            ${Gi(Hs)}
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
    `;let n=fr(Ds,t),i=(ie.edgesByTarget.get(jt)||[]).filter(d=>d.type==="links_to"),a=new Set(i.map(d=>d.source)),r="";s?r=`
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
    `;let l=Fe==="armed"?"disabled":"",c="";n.message&&(c=`<div class="vs-sc-form-hint ${n.valid?"is-valid":"is-error"}">${y(n.message)}</div>`);let u="";if(!s&&i.length>0){let d=i.length,v=a.size;u=`
      <div class="vs-sc-delete-section">
        <div class="vs-sc-delete-section-header">
          <span class="vs-sc-form-label" title="Links to this URL in other files will be automatically updated">References updated</span>
          <span class="vs-sc-delete-section-count">${d} across ${v} file${v!==1?"s":""}</span>
        </div>
        ${dm(i,n)}
      </div>
    `}else!s&&i.length===0&&Ds&&(u='<div class="vs-sc-form-hint">No references to update.</div>');return`
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
          value="${y(Ds)}"
          ${l}
        />
        ${c}
      </div>
      ${u}
      ${r}
    </div>
  `}function fr(e,t){if(!e||!e.trim())return{valid:!1,cleanPath:"",message:""};let s=e.trim();s.startsWith("/")&&(s=s.slice(1)),s.endsWith("/")&&(s=s.slice(0,-1)),s.endsWith(".php")&&(s=s.slice(0,-4));let n=s.split("/").map(c=>c.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/-+/g,"-").replace(/^-+|-+$/g,"")),o=n.join("/");if(!o||n.some(c=>!c))return{valid:!1,cleanPath:"/",message:"Path cannot be empty after normalization"};let i="/"+o,r=s.toLowerCase()!==o?` (normalized from "${s}")`:"",l=t.replace(/\/$/,"")||"/";if(i.slice(0,i.lastIndexOf("/"))!==l.slice(0,l.lastIndexOf("/")))return{valid:!1,cleanPath:i,message:"Keep the current parent path. Use Move to change the parent, then Change URL to rename the page."};if(i===l)return{valid:!1,cleanPath:i,message:"New path is the same as the current path"};if(ie){for(let[,c]of ie.nodes)if(c.type==="route"&&c.id!==jt){let u=(c.label||c.id).replace(/\/$/,"")||"/";if(i===u)return{valid:!1,cleanPath:i,message:`Path conflicts with existing route: ${u}`}}}return{valid:!0,cleanPath:i,message:`\u2713 ${i}${r}`}}function dm(e,t){let s=new Map;for(let o of e)s.has(o.source)||s.set(o.source,[]),s.get(o.source).push(o);let n='<div class="vs-proposal-groups">';for(let[o,i]of s)n+=cm(o,i,t);return n+="</div>",n}function cm(e,t,s){var l;let n=ie.nodes.get(e);if(!n)return"";let o=n.type.charAt(0).toUpperCase()+n.type.slice(1),i=t.length,a="";if(n.type==="partial"){let c=((l=n.meta)==null?void 0:l.includeCount)??0;a=`Used by ${c} file${c!==1?"s":""}`;let u=ot.get(e);u&&(a+=` \xB7 Affects ${u.affected_count} page${u.affected_count!==1?"s":""}`)}let r=[...t].sort((c,u)=>{var p,d;return(((p=c.meta)==null?void 0:p.lineNumber)||0)-(((d=u.meta)==null?void 0:d.lineNumber)||0)});return`<div class="vs-proposal-group">
    <div class="vs-proposal-group-header">
      <span class="vs-impact-type-badge vs-impact-type-${n.type}">${o}</span>
      <span class="vs-proposal-group-label" data-navigate-node="${y(e)}">${y(n.label||n.id)}</span>
      <span class="vs-proposal-group-count">${i} ref${i!==1?"s":""}</span>
    </div>
    ${a?`<div class="vs-proposal-group-meta">${a}</div>`:""}
    <div class="vs-proposal-group-refs">
      ${r.map(c=>pm(c,s)).join("")}
    </div>
  </div>`}function pm(e,t){var a,r,l;let s=(a=e.meta)!=null&&a.lineNumber?`L${e.meta.lineNumber}`:"",n=((r=e.meta)==null?void 0:r.href)||"",o=((l=e.meta)==null?void 0:l.context)||"body",i="";if(t.valid){let c=n.replace(/[?#].*/,""),u=c!=="/"&&c.endsWith("/"),p=n.match(/[?#].*/),d=p?p[0]:"",v=t.cleanPath;u&&!v.endsWith("/")&&(v+="/"),v+=d,i=`<span class="vs-proposal-ref-arrow">\u2192 ${y(v)}</span>`}return`<div class="vs-proposal-ref">
    <span class="vs-proposal-ref-line">${s}</span>
    <span class="vs-proposal-ref-href">${y(n)}</span>
    <span class="vs-proposal-ref-context">${o}</span>
    ${i}
  </div>`}function um(e,t){let s=ie.edgesBySource.get(e.id)||[],n=ie.edgesByTarget.get(e.id)||[],o=t.length;switch(e.type){case"page":{let i=s.filter(c=>c.type==="includes");i.length>0&&t.push(Vt("Direct Includes",i.map(c=>({nodeId:c.target,label:Lt(c.target),type:At(c.target)}))));let a=[];for(let c of i){let u=ie.edgesBySource.get(c.target)||[];for(let p of u)p.type==="includes"&&a.push({nodeId:p.target,label:Lt(p.target),type:At(p.target),via:Lt(c.target)})}a.length>0&&t.push(Vt("Transitive Includes",a));let r=s.filter(c=>c.type==="links_to");r.length>0&&t.push(Vt("Links To",r.map(c=>{var u,p;return{nodeId:c.target,label:Lt(c.target),type:At(c.target),meta:(u=c.meta)!=null&&u.href?`\u2192 ${c.meta.href}`:null,context:((p=c.meta)==null?void 0:p.context)||null}})));let l=vn(e.id);if(l){let u=(ie.edgesByTarget.get(l)||[]).filter(p=>p.type==="links_to");u.length>0&&t.push(Vt("Linked From",u.map(p=>{var d,v,m;return{nodeId:p.source,label:Lt(p.source),type:At(p.source),sourcePath:p.source.replace(/^[^:]+:/,""),lineNumber:((d=p.meta)==null?void 0:d.lineNumber)||null,meta:(v=p.meta)!=null&&v.href?`\u2192 ${p.meta.href}`:null,context:((m=p.meta)==null?void 0:m.context)||null}})))}break}case"partial":{let i=n.filter(l=>l.type==="includes");i.length>0&&t.push(Vt("Included By",i.map(l=>({nodeId:l.source,label:Lt(l.source),type:At(l.source)}))));let a=s.filter(l=>l.type==="includes");a.length>0&&t.push(Vt("Includes",a.map(l=>({nodeId:l.target,label:Lt(l.target),type:At(l.target)}))));let r=s.filter(l=>l.type==="links_to");r.length>0&&t.push(Vt("Links To",r.map(l=>{var c,u;return{nodeId:l.target,label:Lt(l.target),type:At(l.target),meta:(c=l.meta)!=null&&c.href?`\u2192 ${l.meta.href}`:null,context:((u=l.meta)==null?void 0:u.context)||null}})));break}case"route":{let i=s.filter(r=>r.type==="serves");i.length>0&&t.push(Vt("Serves",i.map(r=>({nodeId:r.target,label:Lt(r.target),type:At(r.target)}))));let a=n.filter(r=>r.type==="links_to");a.length>0&&t.push(Vt("Linked From",a.map(r=>{var l,c,u;return{nodeId:r.source,label:Lt(r.source),type:At(r.source),sourcePath:r.source.replace(/^[^:]+:/,""),lineNumber:((l=r.meta)==null?void 0:l.lineNumber)||null,meta:(c=r.meta)!=null&&c.href?`\u2192 ${r.meta.href}`:null,context:((u=r.meta)==null?void 0:u.context)||null}})));break}case"token":{let i=n.filter(a=>a.type==="consumes_token");i.length>0&&t.push(Vt("Consumed By",i.map(a=>({nodeId:a.source,label:Lt(a.source),type:At(a.source)}))));break}case"asset":{let i=s.filter(a=>a.type==="consumes_token");i.length>0&&t.push(Vt("Consumes Tokens",i.map(a=>({nodeId:a.target,label:Lt(a.target),type:At(a.target)}))));break}}t.length===o&&t.push({collapsed:!1,html:'<p class="vs-impact-no-relations">No relationships found.</p>'})}function Vt(e,t){let s=e.toLowerCase().replace(/\s+/g,"-"),n=dr(s),i=`
    <div class="vs-impact-card${n?" is-collapsed":""}">
      <button class="vs-impact-card-header" data-card-toggle="${s}">
        <span class="vs-impact-card-chevron">${$.chevronDown}</span>
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
  `;return{collapsed:n,html:i}}function vm(e,t){let s="blast-radius";if(To===e){t.push({collapsed:!1,html:`
      <div class="vs-impact-card vs-impact-blast-card">
        <button class="vs-impact-card-header" data-card-toggle="${s}">
          <span class="vs-impact-card-chevron">${$.chevronDown}</span>
          <span class="vs-impact-card-title">Blast Radius</span>
        </button>
        <div class="vs-impact-blast-loading">
          <div class="vs-site-spinner" style="width:16px;height:16px"></div>
          <span>Computing\u2026</span>
        </div>
      </div>
    `});return}let n=ot.get(e);if(!n)return;let{affected_pages:o=[],affected_count:i=0,total_pages:a=0,is_global:r=!1}=n,l=dr(s),c=l?" is-collapsed":"";t.push({collapsed:l,html:`
    <div class="vs-impact-card vs-impact-blast-card${c}">
      <button class="vs-impact-card-header" data-card-toggle="${s}">
        <span class="vs-impact-card-chevron">${$.chevronDown}</span>
        <span class="vs-impact-card-title">Blast Radius</span>
        <span class="vs-impact-card-count">${i} / ${a}</span>
        ${r?'<span class="vs-impact-blast-global">GLOBAL</span>':""}
      </button>
      <div class="vs-impact-card-list">
        ${o.map(u=>`
          <button class="vs-impact-ref-item" data-node-id="${y(u.id)}">
            <span class="vs-impact-ref-type vs-impact-ref-type-page">page</span>
            <span class="vs-impact-ref-label">${y(u.label||u.id)}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `})}function mm(){var l;let e=(l=ie)==null?void 0:l.nodes.get(ue);if(!e)return Po(),ue?gr():Rn();let t=y(e.label||e.id);if(Hi)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-loading">
          <div class="vs-sc-move-loading-spinner"></div>
          <span>Loading navigation\u2026</span>
        </div>
      </div>
    `;if(Fe==="success"&&Ze){let c=!!Ze.movedPages,u=c?"Page moved":"Navigation updated",p="";if(c){let d=Ze.totalPagesMoved||1,v=Ze.totalAffectedReferences||0,m=[];m.push(`Moved ${d} page${d!==1?"s":""}`),v>0&&m.push(`updated ${v} reference${v!==1?"s":""}`),p=m.join(", ")}else p=y(Ze.message||"Page order has been changed.");return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Move</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${$.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">${u}</p>
            <p class="vs-sc-form-result-detail">${p}</p>
            ${Ze.normalized?'<p class="vs-sc-form-result-detail">Navigation was standardized</p>':""}
            ${Ze.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `}if(Di)return Ao(t,"The homepage is always first and cannot be reordered.");if(_n==="nav_missing")return Ao(t,"No navigation file found.");if(_n==="unsupported_layout")return Ao(t,"This navigation layout doesn't support reordering yet.");if(_n==="nav_parse_error")return Ao(t,"The navigation file has a problem and can't be read right now.");if(!Ri)return Ao(t,"This page isn't in the navigation yet.");let s=fm(e),n=gm(e),o=Mo?'<div class="vs-sc-form-hint">Navigation will be standardized first. Current links and order are preserved.</div>':"",i="";Fe==="error"&&Hs&&(i=`
      <div class="vs-sc-form-result is-error">
        <div class="vs-sc-form-result-icon">${$.alertTriangle||"\u26A0"}</div>
        <div class="vs-sc-form-result-text">
          <p class="vs-sc-form-result-title">Move failed</p>
          <p class="vs-sc-form-result-detail">${y(Hs.message||"Unknown error")}</p>
          ${Gi(Hs)}
        </div>
      </div>
    `);let a=hm(),r="";return Fe==="applying"?r=`
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
        <button class="vs-sc-form-btn" data-action="apply-move-arm">${Mo?"Standardize & move":"Apply"}</button>
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
  `}function Ao(e,t){return`
    <div class="vs-sc-form">
      <h3 class="vs-sc-form-section">Move</h3>
      <p class="vs-sc-form-context">${y(t)}</p>
      <div class="vs-sc-form-actions">
        <button class="vs-sc-form-cancel" data-action="close-move-proposal">Dismiss</button>
      </div>
    </div>
  `}function gm(e){var o,i;if(!St||St.length===0)return"";let t=(o=e.meta)!=null&&o.isHomepage?"/":"/"+(((i=e.meta)==null?void 0:i.slug)||""),n=`
    <button class="vs-move-parent-option ${gt===null?"is-selected":""}"
            data-action="select-move-parent" data-parent-href="__root__">
      Root
    </button>
  `;for(let a of St){if(a.href===t)continue;let r=gt===a.href;n+=`
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
  `}function fm(e){var u,p,d,v,m;if(gt===void 0||!St)return"";let t=(u=e.meta)!=null&&u.isHomepage?"/":"/"+(((p=e.meta)==null?void 0:p.slug)||""),s=e.label||((d=e.meta)==null?void 0:d.slug)||"",n=[];if(gt===null)n=St.filter(b=>b.href!==t);else for(let b of St)if(b.href===gt){n=(b.children||[]).filter(h=>h.href!==t);break}if(n.length===0)return`
      <div class="vs-sc-form-field">
        <label class="vs-sc-form-label">Position</label>
        <div class="vs-move-position-strip">
          <div class="vs-move-strip-pill is-self">${y(s)}</div>
        </div>
        <div class="vs-sc-form-hint">Only page at this level</div>
      </div>
    `;let o=Jt??n.length,i=[...n];i.splice(o,0,{href:t,label:s,isSelf:!0});let a=o>0,r=o<n.length,l=i.map(b=>b.isSelf?`<div class="vs-move-strip-pill is-self">${y(b.label)}</div>`:`<div class="vs-move-strip-pill">${y(b.label)}</div>`).join(""),c="";if(o===0)c="First in navigation";else if(o>=n.length)c="Last in navigation";else{let b=((v=n[o-1])==null?void 0:v.label)||"",h=((m=n[o])==null?void 0:m.label)||"";c=`After ${b}, before ${h}`}return`
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
      <div class="vs-sc-form-hint">${y(c)}</div>
    </div>
  `}function hm(){return!qt||gt===void 0||Jt===null?!1:gt===qt.parentHref&&Jt===qt.index}function bm(){var n;let e=(n=ie)==null?void 0:n.nodes.get(ue);if(!e)return Rn();let t=y(e.label||""),s=y(Oi);if(hs==="success"&&_o){let o=_o,i=o.navLabelUpdated?'<p class="vs-sc-form-result-detail">Nav label updated</p>':"";return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${$.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Page renamed</p>
            <p class="vs-sc-form-result-detail">"${y(o.oldTitle)}" \u2192 "${y(o.newTitle)}"</p>
            ${i}
          </div>
        </div>
      </div>
    `}return hs==="error"&&cn?`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Rename</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${$.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Rename failed</p>
            <p class="vs-sc-form-result-detail">${y(cn.message||cn)}</p>
            ${Gi(cn)}
          </div>
        </div>
        <div class="vs-sc-form-actions">
          <button class="vs-sc-form-cancel" data-action="close-rename">Dismiss</button>
        </div>
      </div>
    `:hs==="applying"?`
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
  `}function ym(){var u,p;let e=(u=ie)==null?void 0:u.nodes.get(ue);if(!e)return Rn();let t=y(e.label||""),s=e.id.replace("page:","");if(ut==="success"&&Bo){let d=Bo;return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-success">
          <div class="vs-sc-form-result-icon">${$.check}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">"${y(((p=d.deletedPage)==null?void 0:p.title)||"")}" has been removed</p>
            ${d.navEntryRemoved?'<p class="vs-sc-form-result-detail">Nav entry removed</p>':""}
            ${d.navChildrenPromoted>0?`<p class="vs-sc-form-result-detail">${d.navChildrenPromoted} child nav ${d.navChildrenPromoted===1?"entry":"entries"} promoted</p>`:""}
            ${d.referencesCleanedUp>0?`<p class="vs-sc-form-result-detail">${d.referencesCleanedUp} ${d.referencesCleanedUp===1?"file":"files"} cleaned up</p>`:""}
            ${d.totalAffectedReferences>0&&!d.referencesCleanedUp?`<p class="vs-sc-form-result-detail">${d.totalAffectedReferences} ${d.totalAffectedReferences===1?"reference":"references"} may need review</p>`:""}
            ${d.snapshotId?'<p class="vs-sc-form-result-detail">Safety snapshot created</p>':""}
          </div>
        </div>
      </div>
    `}if(ut==="error"&&pn)return`
      <div class="vs-sc-form">
        <h3 class="vs-sc-form-section">Delete</h3>
        <div class="vs-sc-form-result is-error">
          <div class="vs-sc-form-result-icon">${$.alertTriangle||"\u26A0"}</div>
          <div class="vs-sc-form-result-text">
            <p class="vs-sc-form-result-title">Delete failed</p>
            <p class="vs-sc-form-result-detail">${y(pn.message||pn)}</p>
            ${Gi(pn)}
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
    `;let n=vn(ue),o=[];if(n){let d=ie.edgesByTarget.get(n)||[],v=new Map;for(let m of d)if(m.type==="links_to"){let b=ie.nodes.get(m.source);if(b){let h=v.get(m.source)||{id:m.source,label:b.label||m.source,type:b.type,count:0};h.count++,v.set(m.source,h)}}o=Array.from(v.values())}let i=o.reduce((d,v)=>d+v.count,0),a="";ut==="armed"?a=`
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
    `;let l=[{label:`Page file: ${y(s)}`,icon:$.fileText},{label:"Database entry",icon:$.database}].map(d=>`
    <li class="vs-sc-delete-checklist-item">
      <span class="vs-sc-delete-checklist-icon">${d.icon}</span>
      <span>${d.label}</span>
    </li>
  `).join(""),c="";if(o.length>0){let d=o.filter(b=>b.type!=="partial"),v=o.filter(b=>b.type==="partial"),m="";if(d.length>0){let b=d.map(h=>`<span class="vs-sc-delete-ref-chip">${y(h.label)}</span>`).join("");m+=`
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Links to this page will have their href set to # \u2014 the element and its styling are preserved">Unlinked</span>
          <div class="vs-sc-delete-ref-chips">${b}</div>
        </div>
      `}if(v.length>0){let b=v.map(h=>`<span class="vs-sc-delete-ref-chip">${y(h.label)}</span>`).join("");m+=`
        <div class="vs-sc-delete-ref-group">
          <span class="vs-sc-delete-ref-group-action" title="Navigation and footer entries linking to this page will be fully removed">Removed</span>
          <div class="vs-sc-delete-ref-chips">${b}</div>
        </div>
      `}c=`
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
      <p class="vs-sc-form-context">${y(s)}</p>
      <div class="vs-sc-delete-section">
        <span class="vs-sc-form-label">Will be removed</span>
        <ul class="vs-sc-delete-checklist">
          ${l}
        </ul>
      </div>
      ${c}
      ${a}
    </div>
  `}var Ki=null,Yi=!1;function $c(){return setTimeout(async()=>{var e;if(rn()){await Lc();return}await jo(),ye==="recovering"&&((e=Se)!=null&&e.plan_id)&&Xi(Se.plan_id)},0),`
    <div id="vs-site-root" style="height: 100%;">
      <div class="vs-site-loading">
        <div class="vs-site-spinner"></div>
        <span>Building site structure\u2026</span>
      </div>
    </div>
  `}async function jo(){var o;let e=document.getElementById("vs-site-root");if(!e)return;let{ok:t,data:s}=await C.get("/site-graph");if(!t||!s){if(ye!=="idle"){Yi=!0,bs({type:"error",message:"Could not refresh site structure. Reload Site before another change.",time:Date.now()}),G();return}e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">${$.globe}</div>
          <p class="vs-empty-state-title">Could not load site graph</p>
          <p class="vs-empty-state-desc">Check that your site has pages in the preview directory.</p>
          <button id="vs-site-retry" class="vs-btn vs-btn-primary vs-btn-sm">Retry</button>
        </div>
      </div>
    `,(o=document.getElementById("vs-site-retry"))==null||o.addEventListener("click",()=>jo());return}ln(un(s)),Yi=!1,sr(""),ot.clear(),Ai(null),Ps(null),Rs(null),fs(""),As(qs());let n=Zd();n&&ie.nodes.has(n)?(Xt(n),n.startsWith("page:")&&ms(n),Hn(n)):(Xt(null),ms(null),Bn(null)),Cc(e)}function Cc(e){e.innerHTML=`
    <div class="vs-site-workspace vs-sc-three-panel">
      <div class="vs-sc-left" id="vs-sc-left"${pr("left")}>
        ${ac(gs)}
        <div class="vs-editor-resize" data-resize-panel="vs-sc-left"></div>
      </div>
      <div class="vs-sc-canvas" id="vs-sc-canvas">
        <div class="vs-sc-canvas-diagram">
          <div class="vs-site-diagram" id="vs-site-diagram">
            ${ie?dc(gs):'<div class="vs-site-diagram-empty">Site structure is not available yet</div>'}
          </div>
          <div class="vs-sc-status-bar" id="vs-sc-status-bar">
            ${xm()}
          </div>
        </div>
        ${gc()}
      </div>
      <div class="vs-sc-right" id="vs-sc-right"${pr("right")}>
        <div class="vs-editor-resize" data-resize-panel="vs-sc-right" data-resize-side="left"></div>
        ${hc()}
      </div>
    </div>
  `,Im(e),requestAnimationFrame(()=>requestAnimationFrame(()=>Pn(gs)))}function xm(){var u;if(!ie)return"";let e=0,t=0,s=0;for(let[,p]of ie.nodes)p.type==="page"?e++:p.type==="partial"?t++:p.type==="route"&&s++;let n=[`${e} page${e!==1?"s":""}`,`${t} partial${t!==1?"s":""}`,`${s} route${s!==1?"s":""}`],o=0;for(let[,p]of ie.nodes)p.type==="page"&&((ie.edgesByTarget.get(p.id)||[]).some(v=>v.type==="serves")||o++);let i=ie.summary.warnings||((u=ie.warnings)==null?void 0:u.length)||0,a=o===0&&!Yi&&i===0,r=a?"vs-sc-status-healthy":"vs-sc-status-warning",l=Yi?"Structure refresh failed":i?`${i} item${i===1?"":"s"} need review`:a?"Routes indexed":`${o} unlinked`,c="";if(!ue&&ie.builtAt){let p=Math.round((Date.now()-new Date(ie.builtAt).getTime())/1e3);c=p<60?`Graph built ${p}s ago`:`Graph built ${Math.round(p/60)}m ago`}else!ue&&ie.buildTimeMs&&(c=`Built in ${ie.buildTimeMs}ms`);return`
    <span class="vs-sc-status-stat vs-sc-status-counts">
      ${n.map(p=>`<span>${p}</span>`).join("")}
    </span>
    <span class="vs-sc-status-stat">
      <span class="vs-sc-status-dot ${r}"></span>
      <span class="${r}">${l}</span>
    </span>
    ${c?`<span class="vs-sc-status-stat">${c}</span>`:""}
  `}function Ro(e){at()||(jt&&(Ps(null),Rs(null),fs(""),Ce("idle"),pt(null),Bt(null)),dn&&(Ft(),Ce("idle"),pt(null),Bt(null)),Ns&&Dn(),Os&&Wi(),Xt(e),Bn(e),e&&e.startsWith("page:")&&ms(e),e&&Hn(e),G())}function Do(){at()||(Ps(null),Rs(null),fs(""),Ce("idle"),pt(null),Bt(null),dn&&Ft(),Ns&&Zt(),Os&&Ut(),Xt(null),Bn(null),G())}async function Hn(e){if(ot.has(e))return;Ai(e),G();let{ok:t,data:s}=await C.get("/site-graph/blast-radius?node="+encodeURIComponent(e));To===e&&(Ai(null),t&&s&&ot.set(e,s),G())}async function wm(){var a,r;if(at()||(a=window.demoGuard)!=null&&a.call(window)||!jt||!Ds)return;let e=(r=ie)==null?void 0:r.nodes.get(jt),t=(e==null?void 0:e.label)||(e==null?void 0:e.id)||"",s=fr(Ds,t);if(!s.valid){Ce("idle"),G();return}Ce("applying"),pt(null),G();let{ok:n,data:o,error:i}=await Oo("/site-control/url-rename",{routeId:jt,newPath:s.cleanPath});if(n&&o){Ce("success"),Bt(o),Nd(o.suggestedPrompt||null),o.newPageId&&(Xt(o.newPageId),ms(o.newPageId));let l=await C.get("/site-graph");if(l.ok&&l.data&&(ln(un(l.data)),ot.clear(),As(qs())),o.newPageId&&Hn(o.newPageId),o.oldPath&&o.newPath){let c=o.oldPath.replace(/^\//,"")+".php",u=o.newPath.replace(/^\//,"")+".php";So([{oldFilePath:c,newFilePath:u}])}G(),setTimeout(()=>{ys(),G()},1500)}else Ce("error"),pt(i||{message:"An unknown error occurred."}),G()}async function km(e){if(at())return;yc(e),G();let{ok:t,data:s}=await C.get("/site-control/nav-preflight?pageId="+encodeURIComponent(e));if(Ni(!1),!t||!s){ar("nav_parse_error"),G();return}ar(s.navStatus||null),Vd(s.isInNav||!1),Wd(s.isHomepage||!1),qd(s.currentPosition||null),Fd(s.navTree||null),Ud(s.hasHomeEntry||!1),jd(s.navStatus==="needs_normalization"),s.currentPosition&&(ir(s.currentPosition.parentHref??null),Io(s.currentPosition.index??0)),G()}async function Em(){var s,n,o,i;if(at()||(s=window.demoGuard)!=null&&s.call(window)||!ue||Jt===null)return;let e=((n=qt)==null?void 0:n.parentHref)??null,t=gt!==e;if(Ce("applying"),pt(null),G(),t){let a=gt?gt.replace(/^\//,""):"",{ok:r,data:l,error:c}=await Oo("/site-control/structural-move",{pageId:ue,targetParent:a,targetIndex:Jt});if(r&&l){Ce("success"),Bt(l),((o=l.movedPages)==null?void 0:o.length)>0&&So(l.movedPages);let u=await C.get("/site-graph");u.ok&&u.data&&(ln(un(u.data)),ot.clear(),As(qs()));let p=ue;((i=l.movedPages)==null?void 0:i.length)>0&&(p="page:"+l.movedPages[0].newFilePath,Xt(p),ms(p),Hn(p)),G(),setTimeout(()=>{Po(),G()},1500)}else Ce("error"),pt(c||{message:"An unknown error occurred."}),G()}else{let a={pageId:ue,targetParentHref:gt,targetIndex:Jt},{ok:r,data:l,error:c}=await Oo("/site-control/nav-reorder",a);if(r&&l){Ce("success"),Bt(l);let u=ue;Xt(u),ms(u);let p=await C.get("/site-graph");p.ok&&p.data&&(ln(un(p.data)),ot.clear(),As(qs())),Hn(u),G(),setTimeout(()=>{Po(),G()},1500)}else Ce("error"),pt(c||{message:"An unknown error occurred."}),G()}}async function kc(e){var i;if(at()||(i=window.demoGuard)!=null&&i.call(window)||!ue||!e)return;ji("applying"),rr(null),G();let t={pageId:ue,newTitle:e},{ok:s,data:n,error:o}=await Oo("/site-control/page-rename",t);if(s&&n){ji("success"),Yd(n);let a=ue;Xt(a),ms(a);let r=await C.get("/site-graph");r.ok&&r.data&&(ln(un(r.data)),ot.clear(),As(qs())),Hn(a),G(),setTimeout(()=>{Dn(),G()},1500)}else ji("error"),rr(o||{message:"An unknown error occurred."}),G()}async function $m(){var n;if(at()||(n=window.demoGuard)!=null&&n.call(window)||!ue)return;zt("applying"),lr(null),G();let{ok:e,data:t,error:s}=await Oo("/site-control/page-delete",{pageId:ue});e&&t?(zt("success"),Jd(t),G(),setTimeout(async()=>{var a;let o=(a=t.deletedPage)==null?void 0:a.filePath;o&&So([],[o]),Xt(null),ms(null);let i=await C.get("/site-graph");i.ok&&i.data&&(ln(un(i.data)),ot.clear(),As(qs())),Ut(),G()},1800)):(zt("error"),lr(s||{message:"An unknown error occurred."}),G())}function Cm(e){var i,a;let t=document.querySelector(`.vs-site-tree-group[data-tree-group="${e}"]`);ft.has(e)?(ft.delete(e),t&&t.classList.remove("is-collapsed")):(ft.add(e),t&&t.classList.add("is-collapsed"));let s=t==null?void 0:t.querySelector(".vs-site-tree-toggle"),n=!ft.has(e);s==null||s.setAttribute("aria-expanded",String(n));let o=((a=(i=ie)==null?void 0:i.nodes.get(e))==null?void 0:a.label)||e;s==null||s.setAttribute("aria-label",`${n?"Collapse":"Expand"} ${o}`)}function G(){var c,u,p;let e=document.getElementById("vs-site-root");if(!e)return;let t=Pd(e,document.activeElement),s=((c=document.activeElement)==null?void 0:c.id)==="vs-proposal-url",n=s?document.activeElement.selectionStart:null,o=((u=document.activeElement)==null?void 0:u.id)==="vs-sc-rename-input",i=o?document.activeElement.value:null,a=o?document.activeElement.selectionStart:null,r=((p=document.activeElement)==null?void 0:p.id)==="vs-sc-search",l=r?document.activeElement.selectionStart:null;if(Cc(e),Rd(e,t),s){let d=document.getElementById("vs-proposal-url");d&&(d.focus(),n!==null&&d.setSelectionRange(n,n))}if(o){let d=document.getElementById("vs-sc-rename-input");d&&(d.value=i,d.focus(),a!==null&&d.setSelectionRange(a,a))}if(r){let d=document.getElementById("vs-sc-search");d&&(d.focus(),l!==null&&d.setSelectionRange(l,l))}}async function Ec(e){var t;if(!(at()||(t=window.demoGuard)!=null&&t.call(window))){ys(),Ft(),Zt(),Ut(),ze("running"),Ui(e),vr(),it(null),Pt(null),G(),setTimeout(()=>{var s;return(s=document.getElementById("vs-sc-composer-input"))==null?void 0:s.focus()},0);try{await Gt("/site-control/orchestrate",{prompt:e},{requireTerminal:!0,onStatus(s){bs({type:"info",message:s.message||"Processing\u2026",time:Date.now()}),Tc()},onDone(s){if(ye==="running"){bs({type:"done",message:s.summary||s.message||"Done.",time:Date.now()});let n=s.discovery||null,o=s.intent||null,i=s.plan||null,a=n&&Array.isArray(n.candidates)&&n.candidates.length>0,r=i&&Array.isArray(i.edits)?i.edits:[],l=(i==null?void 0:i.plan_id)||s.plan_id,c=r.length>0&&r.every(u=>u.anchored===!0)&&!!l;a?(Pt({plan_id:l,intent:o,files:n.candidates.map(u=>({type:u.type||"file",path:u.file||u.node_id,label:u.label||"",reason:u.reason||""})),affected_pages:(n.affected_pages||[]).map(u=>({label:u.label||"",slug:u.slug||""})),skipped:(n.skipped||[]).map(u=>({path:u.path||"",reason:u.reason||""})),edits:r,risk_level:(i==null?void 0:i.risk_level)||"medium",plan_summary:(i==null?void 0:i.summary)||"",anchored_count:(i==null?void 0:i.anchored_count)||0,unanchored_count:(i==null?void 0:i.unanchored_count)||0}),c?ze("plan"):ze("plan_failed")):ze("complete"),it({filesChanged:s.filesChanged||0,summary:s.summary||s.message||"Orchestration complete."}),G()}},onError(s){ze("plan_failed"),it({filesChanged:0,summary:s.message||"Orchestration failed."}),bs({type:"error",message:s.message||"Error during orchestration.",time:Date.now()}),G()}})}catch{ze("plan_failed"),it({filesChanged:0,summary:"Connection error."}),bs({type:"error",message:"Connection lost during orchestration.",time:Date.now()}),G()}}}async function Sm(){var t,s,n;if(at()||(t=window.demoGuard)!=null&&t.call(window)||!((s=Se)!=null&&s.plan_id)||!((n=Se.edits)!=null&&n.length)||!Se.edits.every(o=>o.anchored===!0))return;let e=Se.plan_id;ze("applying"),G();try{await Gt("/site-control/apply",{plan_id:e},{requireTerminal:!0,onStatus(o){bs({phase:o.phase||"status",status:o.status||"ok",file:o.file||"",message:o.message||"",bytes:o.bytes||null,ms:o.ms||null,time:Date.now()}),Tc()},onDone(o){hr(o,!0)},onError(o){typeof o.rollback_clean=="boolean"?hr(o,!1):Xi(e,o.outcome_unknown?null:o)}})}catch{bs({phase:"failed",status:"error",message:"Connection lost during apply.",time:Date.now()}),Xi(e)}}function at(){return!!rn()||gn()||Fe==="applying"||hs==="applying"||ut==="applying"}async function Oo(e,t){var n;let s=await Ad(e,t);return(n=s.error)!=null&&n.outcome_unknown&&Sc(s.error),s}function Sc(e){Pt(null),it({summary:e.message,rollback_clean:typeof e.restored=="boolean"?e.restored:null,recovery_snapshot_id:e.snapshotId||null,mutation_id:e.mutation_id||null,outcome_unknown:e.outcome_unknown===!0,changed_files:e.changed_files||e.changedFiles||[],verification:[]}),ze("apply_failed"),G()}var Ho=null;function Lc(){return Ho||(rn()?(Pt(null),ze("recovering"),G(),Ho=(async()=>{var s,n,o;let t=await Bi();if((s=t.error)!=null&&s.outcome_unknown||(Ps(null),Rs(null),fs(""),Ce("idle"),Ft(),Zt(),Ut()),t.ok){let i=t.data||{},a=i.movedPages||[];i.oldPath&&i.newPath&&(a=[{oldFilePath:i.oldPath.replace(/^\//,"")+".php",newFilePath:i.newPath.replace(/^\//,"")+".php"}]);let r=(n=i.deletedPage)!=null&&n.filePath?[i.deletedPage.filePath]:[];So(a,r),a.length&&Bn("page:"+a[0].newFilePath),r.length&&Bn(null),it({summary:i.message||"The Site change completed. The result was recovered from the server.",filesChanged:((o=i.updatedFiles)==null?void 0:o.length)??null,verification:[]}),ze("applied"),R.set("previewDirty",!0),G()}else Sc(t.error||{message:"The mutation result could not be read."});await jo()})().finally(()=>{Ho=null}),Ho):Promise.resolve())}function hr(e,t){it({...e,filesChanged:e.filesChanged??e.files_changed??0,summary:e.recovery_resolved&&e.recovery_note||e.message||e.error||e.summary||(t?"Changes applied.":"Patch execution failed."),rollback_clean:typeof e.rollback_clean=="boolean"?e.rollback_clean:null,verification:e.verification||[],changed_files:e.changed_files||[],recovery_snapshot_id:e.recovery_snapshot_id||null}),ze(t?"applied":"apply_failed"),R.set("previewDirty",!0),G(),jo()}var No=null;function Xi(e,t=null){return No||(ze("recovering"),G(),No=(async()=>{var n,o;let s=await Bd(e);if(s.status==="applied"||s.status==="failed"){hr(s.result||{},s.status==="applied");return}if(s.status==="ready"){ze(t?"plan_failed":"plan");let i=(t==null?void 0:t.message)||"The apply request did not start. Review and apply the same plan when ready.";it({summary:i}),bs({type:t?"error":"info",message:i,time:Date.now()}),G();return}ze("apply_failed"),it({summary:(t==null?void 0:t.message)||"The server has not confirmed the apply result. Check again before retrying.",rollback_clean:null,outcome_unknown:!0,recovery_snapshot_id:s.recovery_snapshot_id||((n=s.result)==null?void 0:n.recovery_snapshot_id)||null,changed_files:[...new Set((((o=Se)==null?void 0:o.edits)||[]).map(i=>i.file))]}),G(),jo()})().finally(()=>{No=null}),No)}var Lm={start:"\u25B6",snapshot:"\u25CE",read:"\u2193",anchor:"\u2693",patch:"\u270E",lint:"\u2318",verify:"\u2714",reject:"\u2298",rollback:"\u21BA",done:"\u2713",failed:"\u2717",abort:"\u2298"},Tm={ok:"is-ok",failed:"is-failed",error:"is-failed",skip:"is-skip",refused:"is-refused",start:"is-info",partial:"is-warning"};function Tc(){let e=document.getElementById("vs-sc-console-log");if(!e)return;let t=Fs.map(s=>{if(s.phase){let i=Lm[s.phase]||"\xB7",a=Tm[s.status]||"",r=s.file?`<span class="vs-sc-log-file">${s.file.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span> `:"",l=s.ms!=null?`<span class="vs-sc-log-meta">${s.ms}ms</span>`:s.bytes!=null?`<span class="vs-sc-log-meta">${s.bytes}b</span>`:"",c=(s.message||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");return`<div class="vs-sc-log-entry vs-sc-log-phase ${a}">
        <span class="vs-sc-log-icon">${i}</span>
        <span class="vs-sc-log-phase-name">${s.phase}</span>
        ${r}<span class="vs-sc-log-text">${c}</span>
        ${l}
      </div>`}let n=s.type==="running"?"is-running":s.type==="done"?"is-done":s.type==="error"?"is-error":s.type==="skipped"?"is-skipped":s.type==="plan"?"is-plan":"",o=s.type==="running"?"\u2192":s.type==="done"?"\u2713":s.type==="error"?"\u2717":s.type==="skipped"?"\u2298":s.type==="plan"?"\u25C6":s.type==="info"?"\u2192":"\xB7";return`<div class="vs-sc-log-entry ${n}">
      <span class="vs-sc-log-icon">${o}</span>
      <span class="vs-sc-log-text">${s.message.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span>
    </div>`}).join("");e.innerHTML=t,e.scrollTop=e.scrollHeight}function Im(e){var b;at()&&e.querySelectorAll('.vs-sc-action-bar button, #vs-sc-console-clear, #vs-sc-composer-submit, #vs-sc-composer-input, [data-action^="close-"]').forEach(h=>{h.disabled=!0});let t=e.querySelector("#vs-sc-search");if(t){let h;t.addEventListener("input",()=>{clearTimeout(h),h=setTimeout(()=>{var g;sr(t.value.trim()),As(qs()),G(),(g=document.getElementById("vs-sc-search"))==null||g.focus()},150)})}e.querySelectorAll(".vs-sc-nav-section-header[data-nav-section]").forEach(h=>{h.addEventListener("click",()=>{let g=h.dataset.navSection,f=h.closest(".vs-sc-nav-section");f&&(js.has(g)?(js.delete(g),f.classList.remove("is-collapsed")):(js.add(g),f.classList.add("is-collapsed")),oc())})}),e.querySelectorAll(".vs-site-tree-item[data-page-id]").forEach(h=>{h.addEventListener("click",g=>{let f=g.target.closest("button, input, textarea, select, a");if(f&&!f.matches("[data-select-page]"))return;let x=h.dataset.pageId;x&&Ro(x)})}),e.querySelectorAll(".vs-site-tree-toggle[data-toggle-page]").forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let f=h.dataset.togglePage;f&&Cm(f)})}),e.querySelectorAll(".vs-impact-item[data-node-id]").forEach(h=>{h.addEventListener("click",()=>{let g=h.dataset.nodeId;g&&Ro(g)})}),e.querySelectorAll(".vs-site-card[data-page-id]").forEach(h=>{h.addEventListener("click",g=>{let f=g.target.closest("button, input, textarea, select, a");if(f&&!f.matches("[data-select-page]"))return;let x=h.dataset.pageId;x&&Ro(x)})});let s=e.querySelector("#vs-site-diagram");s&&s.addEventListener("click",h=>{if(h.target===s||h.target.classList.contains("vs-site-tiers")){if(Fe==="armed"){Ce("idle"),G();return}if(ut==="armed"){zt("idle"),G();return}Do()}}),e.querySelectorAll('[data-action="close-inspect"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Do()})}),e.querySelectorAll(".vs-impact-ref-item[data-node-id]").forEach(h=>{h.addEventListener("click",()=>{let g=h.dataset.nodeId;g&&Ro(g)})}),e.querySelectorAll("[data-card-toggle]").forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let f=h.dataset.cardToggle;if(!f)return;let x=h.closest(".vs-impact-card"),w=x==null?void 0:x.classList.contains("is-collapsed");qi.set(f,w?"open":"closed"),ec(),G()})}),e.querySelectorAll('[data-action="overflow"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let f=h.closest(".vs-sc-action-overflow");if(!f)return;if(f.classList.toggle("is-open")){let w=E=>{f.contains(E.target)||(f.classList.remove("is-open"),document.removeEventListener("click",w,!0))},k=E=>{E.key==="Escape"&&(E.stopPropagation(),E.preventDefault(),f.classList.remove("is-open"),document.removeEventListener("keydown",k,!0),document.removeEventListener("click",w,!0))};setTimeout(()=>{document.addEventListener("click",w,!0),document.addEventListener("keydown",k,!0)},0)}})}),e.querySelectorAll(".vs-sc-action-bar [data-action]").forEach(h=>{let g=h.dataset.action;["change-url","move","reorder","rename","delete","overflow","open-in-editor","open-in-chat"].includes(g)||h.addEventListener("click",f=>{f.stopPropagation();let x=h.closest(".vs-sc-action-bar"),w=(x==null?void 0:x.dataset.forNode)||ue;console.log("Action stub:",g,w)})}),e.querySelectorAll('[data-action="open-in-editor"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let f=h.closest(".vs-sc-action-bar"),x=(f==null?void 0:f.dataset.forNode)||ue;if(!x)return;let w=x.startsWith("page:")?x.slice(5):x;window.__vsEditorPendingFile=w,window.location.hash="#/editor"})}),e.querySelectorAll('[data-action="open-in-chat"]').forEach(h=>{h.addEventListener("click",g=>{var E,I;g.stopPropagation();let f=h.closest(".vs-sc-action-bar"),x=(f==null?void 0:f.dataset.forNode)||ue;if(!x)return;let w=(E=ie)==null?void 0:E.nodes.get(x),k=((I=w==null?void 0:w.meta)==null?void 0:I.slug)||x.replace(/^page:/,"").replace(/\.php$/,"");R.set("activePageScope",k),window.location.hash="#/chat"})});let n=e.querySelector("#vs-sc-composer-input"),o=e.querySelector("#vs-sc-composer-submit");if(n){let h=()=>{n.style.height="auto",n.style.height=Math.min(n.scrollHeight,120)+"px"};n.addEventListener("input",()=>{Ui(n.value),h(),o&&(o.disabled=!n.value.trim()||at())}),n.addEventListener("keydown",g=>{g.key==="Enter"&&!g.shiftKey&&(n.value.trim()&&!at()?(g.preventDefault(),Ec(n.value.trim())):g.preventDefault())})}o&&o.addEventListener("click",h=>{h.stopPropagation();let g=mn.trim();g&&!at()&&Ec(g)});let i=e.querySelector("#vs-sc-console-toggle");i&&i.addEventListener("click",()=>{let h=mr();mc(!h),G()});let a=e.querySelector("#vs-sc-console-clear");a&&a.addEventListener("click",()=>{at()||(vr(),ze("idle"),it(null),Pt(null),Ui(""),G())});let r=e.querySelector("#vs-sc-console-resize"),l=e.querySelector("#vs-sc-console");r&&l&&r.addEventListener("mousedown",h=>{h.preventDefault();let g=h.clientY,f=l.offsetHeight,x=k=>{let E=g-k.clientY,I=Math.min(500,Math.max(120,f+E));l.style.height=I+"px"},w=()=>{document.removeEventListener("mousemove",x),document.removeEventListener("mouseup",w),vc(l.offsetHeight),requestAnimationFrame(()=>Pn(gs))};document.addEventListener("mousemove",x),document.addEventListener("mouseup",w)});let c=e.querySelector("#vs-sc-orch-dismiss");c&&c.addEventListener("click",()=>{at()||(ze("idle"),it(null),Pt(null),G())}),(b=e.querySelector("#vs-sc-orch-check"))==null||b.addEventListener("click",()=>{var h;rn()&&!gn()?Lc():(h=Se)!=null&&h.plan_id&&!at()&&Xi(Se.plan_id)}),e.querySelectorAll("[data-orch-open-file]").forEach(h=>{h.addEventListener("click",()=>{at()||(window.__vsEditorPendingFile=h.dataset.orchOpenFile,window.location.hash="#/editor")})});let u=e.querySelector("#vs-sc-orch-apply");u&&u.addEventListener("click",()=>{Sm()}),e.querySelectorAll('[data-action="rename"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),ue&&(xc(ue),G(),setTimeout(()=>{let f=document.getElementById("vs-sc-rename-input");f&&(f.focus(),f.select())},50))})}),e.querySelectorAll('[data-action="close-rename"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Dn(),G()})});let p=e.querySelector("#vs-sc-rename-input");if(p){let h=()=>{var E;let g=p.value.trim(),f=document.getElementById("vs-sc-rename-submit"),x=document.getElementById("vs-sc-rename-hint"),w=(E=ie)==null?void 0:E.nodes.get(ue),k=(w==null?void 0:w.label)||"";g?g===k?(f&&(f.disabled=!0),x&&(x.textContent="Same as current title",x.className="vs-sc-form-hint is-neutral")):(f&&(f.disabled=!1),x&&(x.textContent="",x.className="vs-sc-form-hint")):(f&&(f.disabled=!0),x&&(x.textContent="Title cannot be empty",x.className="vs-sc-form-hint is-error"))};p.addEventListener("input",h),p.addEventListener("keydown",g=>{if(g.key==="Enter"){g.preventDefault();let f=document.getElementById("vs-sc-rename-submit");f&&!f.disabled&&kc(p.value.trim())}g.key==="Escape"&&(g.stopPropagation(),Dn(),G())}),h()}e.querySelectorAll('[data-action="rename-submit"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let f=document.getElementById("vs-sc-rename-input");f&&kc(f.value.trim())})}),e.querySelectorAll('[data-action="delete"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),ue&&(wc(ue),G())})}),e.querySelectorAll('[data-action="close-delete"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Wi(),G()})}),e.querySelectorAll('[data-action="delete-arm"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),zt("armed"),G(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{ut==="armed"&&(zt("idle"),G())},3e3)})}),e.querySelectorAll('[data-action="delete-confirm"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),$m()})}),e.querySelectorAll('[data-action="change-url"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),ue&&(bc(ue,G),G())})}),e.querySelectorAll('[data-action="close-proposal"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),ys(),G()})}),e.querySelectorAll('[data-action="apply-proposal-arm"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Ce("armed"),pt(null),G(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{Fe==="armed"&&(Ce("idle"),G())},3e3)})}),e.querySelectorAll('[data-action="apply-proposal-confirm"]').forEach(h=>{h.addEventListener("click",async g=>{g.stopPropagation(),await wm()})}),e.querySelectorAll("[data-navigate-node]").forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let f=h.dataset.navigateNode;f&&Ro(f)})}),e.querySelectorAll('[data-action="reorder"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation();let f=h.closest(".vs-sc-action-bar"),x=(f==null?void 0:f.dataset.forNode)||ue;x&&km(x)})}),e.querySelectorAll('[data-action="close-move-proposal"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Po(),G()})}),e.querySelectorAll('[data-action="select-move-parent"]').forEach(h=>{h.addEventListener("click",g=>{var w,k,E;g.stopPropagation();let f=h.dataset.parentHref,x=f==="__root__"?null:f;if(ir(x),qt&&x===(qt.parentHref??null))Io(qt.index??0);else{let I=(w=ie)==null?void 0:w.nodes.get(ue),T=(k=I==null?void 0:I.meta)!=null&&k.isHomepage?"/":"/"+(((E=I==null?void 0:I.meta)==null?void 0:E.slug)||""),N=0;if(St){if(x===null)N=St.filter(j=>j.href!==T).length;else for(let j of St)if(j.href===x){N=(j.children||[]).filter(W=>W.href!==T).length;break}}Io(N)}Ce("idle"),G()})}),e.querySelectorAll('[data-action="select-move-position"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Io(parseInt(h.dataset.position,10)),Ce("idle"),G()})}),e.querySelectorAll('[data-action="apply-move-arm"]').forEach(h=>{h.addEventListener("click",g=>{g.stopPropagation(),Ce("armed"),pt(null),G(),clearTimeout(window._vsArmTimer),window._vsArmTimer=setTimeout(()=>{Fe==="armed"&&(Ce("idle"),G())},3e3)})}),e.querySelectorAll('[data-action="apply-move-confirm"]').forEach(h=>{h.addEventListener("click",async g=>{g.stopPropagation(),await Em()})});let d=e.querySelector("#vs-proposal-url");if(d){let h=null;d.addEventListener("input",()=>{clearTimeout(h),h=setTimeout(()=>{fs(d.value),G()},200)}),d.addEventListener("keydown",g=>{if(g.key==="Enter"&&g.preventDefault(),g.key==="Escape"){if(g.preventDefault(),g.stopPropagation(),Fe==="armed"){Ce("idle"),G();return}ys(),G()}}),or&&(Pi(!1),setTimeout(()=>d.focus(),0))}let v=e.querySelector("#vs-sc-right-body");v&&v.addEventListener("click",h=>{if(!(h.target.closest("button")||h.target.closest("a")||h.target.closest("input"))){if(h.target.closest(".vs-proposal-panel")||h.target.closest(".vs-sc-form")){Fe==="armed"&&(Ce("idle"),G()),ut==="armed"&&(zt("idle"),G());return}if(!h.target.closest(".vs-impact-detail-content")&&!h.target.closest(".vs-sc-summary")){if(Fe==="armed"){Ce("idle"),G();return}if(ut==="armed"){zt("idle"),G();return}Do()}}});let m=e.querySelector("#vs-sc-left-scroll");m&&m.addEventListener("click",h=>{if(h.target===m){if(Fe==="armed"){Ce("idle"),G();return}if(ut==="armed"){zt("idle"),G();return}Do()}}),nr||(Hd(!0),document.addEventListener("keydown",h=>{var g,f,x;if(h.key==="Escape"){if(Fe==="armed"){Ce("idle"),G();return}if(ut==="armed"){zt("idle"),G();return}if(Os&&((g=document.activeElement)==null?void 0:g.tagName)!=="INPUT"){Wi(),G();return}if(Ns&&((f=document.activeElement)==null?void 0:f.tagName)!=="INPUT"){Dn(),G();return}ue&&((x=document.activeElement)==null?void 0:x.tagName)!=="INPUT"&&Do()}})),Ki&&window.removeEventListener("resize",Ki);{let h;Ki=()=>{clearTimeout(h),h=setTimeout(()=>{requestAnimationFrame(()=>Pn(gs))},150)},window.addEventListener("resize",Ki)}e.querySelectorAll(".vs-editor-resize[data-resize-panel]").forEach(h=>{let g=h.dataset.resizePanel,f=document.getElementById(g);if(!f)return;let x=h.dataset.resizeSide==="left";h.addEventListener("mousedown",w=>{if(w.preventDefault(),h.classList.add("is-dragging"),x){let k=I=>{let T=f.parentElement.getBoundingClientRect(),N=Math.min(400,Math.max(240,T.right-I.clientX));f.style.width=N+"px"},E=()=>{h.classList.remove("is-dragging"),document.removeEventListener("mousemove",k),document.removeEventListener("mouseup",E),cr("right",f.offsetWidth),requestAnimationFrame(()=>Pn(gs))};document.addEventListener("mousemove",k),document.addEventListener("mouseup",E)}else{let k=f.getBoundingClientRect(),E=T=>{let N=Math.min(360,Math.max(180,T.clientX-k.left));f.style.width=N+"px"},I=()=>{h.classList.remove("is-dragging"),document.removeEventListener("mousemove",E),document.removeEventListener("mouseup",I),cr("left",f.offsetWidth),requestAnimationFrame(()=>Pn(gs))};document.addEventListener("mousemove",E),document.addEventListener("mouseup",I)}})})}var Me=null,Mc=null,Qe=null,Rt=null,Wt=null,rt=null,Ic=!1,Mm=80;var _m=60,qo=5,Fo=6;function Bm(e){return e.replace(/\(([⌘⇧⌥⌃\w+↵←→↑↓⌫]+)\)/g,(t,s)=>`<kbd class="vs-tooltip-kbd">${Am(s)}</kbd>`)}function Am(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Pm(){if(Me)return;let e=document.createElement("div");e.className="vs-tooltip",e.setAttribute("role","tooltip");let t=document.createElement("span");t.className="vs-tooltip-content";let s=document.createElement("span");s.className="vs-tooltip-arrow",e.appendChild(t),e.appendChild(s),document.body.appendChild(e),Me=e,Mc=s}function Rm(e){if(!Me)return;let t=e.getBoundingClientRect(),s=Me.getBoundingClientRect(),n,o="above",i=t.top,a=window.innerHeight-t.bottom;i>=s.height+qo+Fo?n=t.top-s.height-qo:a>=s.height+qo+Fo?(n=t.bottom+qo,o="below"):i>=a?n=Fo:(n=t.bottom+qo,o="below");let r=t.left+t.width/2,l=r-s.width/2;l=Math.max(Fo,Math.min(l,window.innerWidth-Fo-s.width));let c=r-l,u=Math.max(8,Math.min(s.width-8,c));Me.style.top=`${n}px`,Me.style.left=`${l}px`,Mc.style.left=`${u}px`,Me.classList.remove("vs-tooltip--above","vs-tooltip--below"),Me.classList.add(`vs-tooltip--${o}`)}function Dm(e){let t=e.getAttribute("data-tooltip")||e.getAttribute("title");!t||!t.trim()||(e.hasAttribute("title")&&(e.setAttribute("data-tooltip",e.getAttribute("title")),e.removeAttribute("title")),Wt&&(clearTimeout(Wt),Wt=null),Qe=e,Rt=null,Pm(),Me.querySelector(".vs-tooltip-content").innerHTML=Bm(t.trim()),Me.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"),Me.style.display="flex",Me.style.opacity="0",requestAnimationFrame(()=>{Qe===e&&(Rm(e),Me.classList.add("vs-tooltip--visible"),Me.style.opacity="")}))}function _c(){Me&&(Qe&&(br(Qe),Qe=null),Me.classList.remove("vs-tooltip--visible"),Me.classList.add("vs-tooltip--hiding"),Wt=setTimeout(()=>{Me&&(Me.style.display="none",Me.classList.remove("vs-tooltip--hiding")),Wt=null},_m))}function Ji(){rt&&(clearTimeout(rt),rt=null),Rt=null,Qe&&(br(Qe),Qe=null),Wt&&(clearTimeout(Wt),Wt=null),Me&&(Me.style.display="none",Me.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))}function br(e){if(!e)return;let t=e.getAttribute("data-tooltip");t&&!e.hasAttribute("title")&&(e.setAttribute("title",t),e.removeAttribute("data-tooltip"))}function Bc(e){for(;e&&e!==document.body;){if(e.nodeType!==Node.ELEMENT_NODE){e=e.parentElement;continue}if(e.hasAttribute("data-tooltip-skip"))return null;if(e.hasAttribute("title")||e.hasAttribute("data-tooltip"))return e;e=e.parentElement}return null}function Hm(e){if(e.buttons!==0)return;let t=Bc(e.target);if(!t){rt&&(clearTimeout(rt),rt=null),Rt=null,Qe&&_c();return}t!==Qe&&t!==Rt&&(rt&&(clearTimeout(rt),rt=null),Qe&&(br(Qe),Qe=null,Wt&&(clearTimeout(Wt),Wt=null),Me&&(Me.style.display="none",Me.classList.remove("vs-tooltip--visible","vs-tooltip--hiding"))),Rt=t,rt=setTimeout(()=>{rt=null,Rt===t&&Dm(t)},Mm))}function Nm(e){let t=Bc(e.target);if(t)if(t===Qe){let s=e.relatedTarget;if(s&&t.contains(s))return;rt&&(clearTimeout(rt),rt=null),Rt=null,_c()}else t===Rt&&(rt&&(clearTimeout(rt),rt=null),Rt=null)}function Om(){(Qe||Rt)&&Ji()}function jm(){(Qe||Rt)&&Ji()}function qm(){(Qe||Rt)&&Ji()}function Ac(){Ic||(Ic=!0,document.addEventListener("mouseover",Hm,{passive:!0}),document.addEventListener("mouseout",Nm,{passive:!0}),document.addEventListener("scroll",Om,{passive:!0,capture:!0}),document.addEventListener("keydown",jm,{passive:!0}),document.addEventListener("mousedown",qm,{passive:!0}),window.addEventListener("resize",()=>{Qe&&Ji()},{passive:!0}))}var zc=$c,Ko=[{id:"create",label:"Create",defaultRoute:"chat",routes:[{route:"chat",label:"Chat",roles:["owner","editor"]},{route:"site-map",label:"Site",roles:["owner","editor"]},{route:"editor",label:"Editor",roles:["owner","editor"]}]},{id:"studio",label:"Studio",defaultRoute:"notes",routes:[{route:"notes",label:"Notes",roles:["owner","editor"]},{route:"board",label:"Board"}]},{id:"manage",label:"Manage",defaultRoute:"forms",routes:[{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"designs",label:"Designs",roles:["owner","editor"]}]}],Uc="vs-nav-group-last-",Zi=(()=>{let e={};for(let t of Ko)for(let s of t.routes)e[s.route]=t.id;return e})();function la(e){if(Zi[e])return Zi[e];let t=e.split("/")[0];return Zi[t]?Zi[t]:null}function Fm(e){var i;let t=(i=R.get("user"))==null?void 0:i.role,s=e.routes.filter(a=>!a.roles||a.roles.includes(t));if(s.length===0)return e.defaultRoute;let n=localStorage.getItem(Uc+e.id);return n&&s.find(r=>r.route===n)?n:s.find(a=>a.route===e.defaultRoute)?e.defaultRoute:s[0].route}function zm(e){let t=la(e);if(t){let s=e.split("/")[0];localStorage.setItem(Uc+t,s)}}var Vy=Ko.flatMap(e=>e.routes),kr=["chat","editor"],Um="vs-first-run-guide-dismissed",Vc="vs-onboarding-draft-v1",Wc="vs-prompt-recents-v1",Gc="vs-prompt-pins-v1",Vm=8,Wm=5,Pc=5,Gm=5*1024*1024,Er=["image/jpeg","image/png","image/gif","image/webp"],Vs=[],Qt=null,Sr=document.documentElement.dataset.demo==="true",Km=document.documentElement.dataset.demoHideBanner==="true",xs=Sr&&!Km,Kc=window.matchMedia("(max-width: 767px)");function na(){return Kc.matches}var Ym={chat:"messageCircle",editor:"pencil",notes:"fileText",board:"layoutGrid",assets:"image",forms:"inbox",actions:"zap",designs:"palette","site-map":"globe"};function Xm(){var i;let e=R.get("route"),t=(i=R.get("user"))==null?void 0:i.role,s=la(e),n=s?Ko.find(a=>a.id===s):null;if(!n)return[{route:"more",label:"More",icon:"ellipsis"}];let o=n.routes.filter(a=>(!a.roles||a.roles.includes(t))&&!Tr.includes(a.route)).map(a=>({route:a.route,label:a.label,icon:Ym[a.route]||"layoutGrid"}));return o.push({route:"more",label:"More",icon:"ellipsis"}),o}function Lr(){var t;return((t=R.get("user"))==null?void 0:t.role)==="viewer"?"board":"chat"}var Tr=["chat","editor","site-map"];function Dt(){return Sr?(B("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function Yc(){let e=R.get("user");return e&&e.role!=="viewer"}function da(){return Yc()?!1:(B("You have read-only access.","warning"),!0)}function Jm(){let e=R.get("user");return e&&e.role==="owner"}window.IS_DEMO=Sr;window.demoGuard=Dt;window.canWrite=Yc;window.viewerGuard=da;window.isOwner=Jm;var Xc=document.getElementById("app");async function Jc(){var s,n;Dr(),yl(),Ac(),window.marked&&window.marked.use({renderer:{html(o){return y(typeof o=="string"?o:o.text)}}});let e=await C.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){Fc();return}R.batch(()=>{R.set("user",e.data.user),R.set("sessionToken",e.data.token),R.set("siteName",e.data.site_name||"")});let t=e.data.site_name;if(t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",o=>{var i;(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)&&(o.preventDefault(),o.returnValue="")}),yt.beforeEach(async(o,i)=>{var a;for(let r of(window.__vsFlushCallbacks||new Map).values())await r();return i.startsWith("editor")&&!o.startsWith("editor")&&(a=window.__hasUnsavedEditorChanges)!=null&&a.call(window)?await Wl():(i.startsWith("notes")&&!o.startsWith("notes")&&kd(),i.startsWith("board")&&!o.startsWith("board")&&_d(),!0)}).on("chat",()=>Ye()).on("editor",()=>Ye()).on("pages",()=>Ye()).on("pages/:slug",()=>Ye()).on("assets",()=>Ye()).on("forms",()=>Ye()).on("forms/:formId",()=>Ye()).on("notes",()=>Ye()).on("board",()=>Ye()).on("actions",()=>Ye()).on("actions/:actionId",()=>Ye()).on("designs",()=>Ye()).on("site-map",()=>Ye()).on("settings",()=>Ye()).on("team",()=>Ye()).on("profile",()=>Ye()).onNotFound(()=>yt.navigate(Lr())),R.on("user",o=>{o||Fc()}),Zc(),Kc.addEventListener("change",()=>{Ye()}),na()){let i=(window.location.hash||"").replace(/^#\/?/,"");if(!i||Tr.includes(i)){let a=((n=R.get("user"))==null?void 0:n.role)==="viewer"?"board":"assets";window.location.hash=`#/${a}`}}yt.start()}async function Zc(){try{let{ok:e,data:t}=await C.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){R.set("pages",t.pages),lp();let s=document.getElementById("chat-messages");(s==null?void 0:s.querySelector(".vs-empty-state"))&&(s.innerHTML=jn(),On())}}catch{}}function Ye(){var l;let e=R.get("route"),t=kr.includes(e);zm(e),ro()&&Ln(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s=na()&&Tr.includes(e),o=((l=R.get("user"))==null?void 0:l.role)==="viewer",i;s?i=eg(e):e==="editor"?i=o?zo():Wr():e==="notes"?i=o?zo():`<div class="h-full overflow-hidden">${vd()}</div>`:e==="board"?i=`<div class="h-full overflow-hidden">${er()}</div>`:e==="site-map"?i=o?zo():zc():t?i=o?zo():Qm():i=zo();let a=e==="chat"&&!na(),r=a?"bottom-[32px]":"bottom-0";Xc.innerHTML=`
    ${Zm()}
    <div class="fixed top-[48px] ${r} left-0 right-0 overflow-hidden">
      ${i}
    </div>
    ${a?pg():""}
    ${ug()}
    ${vg()}
    ${gg()}
    ${sd()}
    ${wg()}
  `,Cg(),mg(),e==="editor"&&!s&&!o&&Gr()}function Zm(){let e=R.get("route"),t=R.get("user"),s=R.get("theme"),n=t==null?void 0:t.role,o=la(e),i=Ko.filter(l=>l.routes.some(c=>!c.roles||c.roles.includes(n))).map(l=>{let c=l.id===o,u=Fm(l);return`
        <button class="vs-nav-group ${c?"vs-nav-group-active":""}"
                data-group="${l.id}"
                data-target="${u}">${l.label}</button>
      `}).join(""),a=o?Ko.find(l=>l.id===o):null,r=a?a.routes.filter(l=>!l.roles||l.roles.includes(n)).map(l=>{let c=e===l.route||e.startsWith(l.route+"/");return`
            <a href="#/${l.route}"
               class="vs-nav-item ${c?"vs-nav-item-active":""}">
              ${l.label}${l.badge?`<span class="vs-nav-badge-beta">${y(l.badge)}</span>`:""}
            </a>
          `}).join(""):"";return`
    <header class="vs-topbar">
      <div class="vs-topbar-inner">
        <!-- Left: Logo + Group links (architecture) -->
        <div class="vs-topbar-left">
          <a href="#/${Lr()}" class="vs-logo" title="${y(R.get("siteName")||"VoxelSite")}">
            <span class="vs-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
                <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
                <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
              </svg>
            </span>
          </a>
          <nav class="vs-nav-groups" aria-label="Workspace">${i}</nav>
          ${xs?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${$.eye} Demo
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
            ${s==="dark"?$.sun:$.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${$.user}
              <span class="hidden sm:inline">${y((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${n!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${n==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${$.pencil} Edit Profile
              </a>
              ${n==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${$.users} Team Members
                </a>
              `:""}
              ${n==="owner"?`
                <a href="#/settings" id="btn-settings-nav" class="vs-dropdown-item">
                  ${$.settings} Settings
                </a>
              `:""}
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${$.logOut} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function Qm(){let e=R.get("sidebarWidth"),t=R.get("activeConversationId"),s=R.get("activePageScope"),n=Qc(s),o=(()=>{if(s){let i=s;return i.endsWith(".php")||i.endsWith(".html")?i:i+".php"}return window.__vsCurrentPreviewPath||"index.php"})();return window.__vsCurrentPreviewPath=o,`
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
              ${$.fileText}
              <span id="scope-label" class="text-vs-text-secondary">${y(n)}</span>
              ${$.chevronDown}
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-new-chat"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="New conversation">
              ${$.newChat}
            </button>
            <button id="btn-toggle-history"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="Conversation history">
              ${$.history}
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
          ${jn()}
        </div>

        <!-- Prompt Bar -->
        <div class="vs-prompt-area">
          <div class="vs-prompt-container">
            <input type="file" id="image-file-input" accept="image/jpeg,image/png,image/gif,image/webp" multiple class="hidden" />
            <div id="image-attachments" class="vs-image-attachments" hidden></div>
            <div id="website-ref-chip" class="vs-website-ref-chip" hidden>
              ${$.globe}
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
                  ${$.image}
                </button>
                <button id="btn-attach-website"
                  class="vs-prompt-attach-btn"
                  title="Use website as reference">
                  ${$.globe}
                </button>
                ${window.SpeechRecognition||window.webkitSpeechRecognition?`
                <button id="btn-voice-input"
                  class="vs-prompt-attach-btn"
                  title="Voice input">
                  ${$.mic}
                </button>`:""}
              </div>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (\u2318+Enter)">
                ${$.send}
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
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${$.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${$.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${$.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Enter visual editor (V)">
              ${$.pencil} Edit
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${$.rotateCcw} Refresh
            </button>
            <button id="btn-save-design" class="vs-btn vs-btn-ghost vs-btn-xs" title="Save to Designs" disabled>
              ${$.save} Save
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${$.externalLink}
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
  `}function eg(e){let t={editor:{name:"Code Editor",desc:"The code editor needs a wider screen for the file tree, editor pane, and preview."},chat:{name:"AI Chat",desc:"The AI conversation and live preview work side-by-side. That needs a wider screen."},"site-map":{name:"Site Control",desc:"The site graph and inspector panels need a wider screen to display properly."}},s=t[e]||t.chat,n=s.name,o=s.desc;return`
    <div class="h-full overflow-y-auto">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 18px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
          ${$.monitor}
        </div>
        <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 10px;">${n}</h1>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 6px; max-width: 280px; line-height: 1.6;">${o}</p>
        <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0; max-width: 280px; line-height: 1.6;">Open Studio on a desktop or tablet to use this feature.</p>
      </div>
    </div>
  `}function zo(){let e=R.get("route"),t=R.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${tg(e,t)}
      </div>
    </div>
  `}function tg(e,t){let s=R.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return od();case"forms":return Jl();case"forms/:formId":return Zl(t.formId);case"actions":return Kl();case"actions/:actionId":return Yl(t.actionId);case"designs":return n==="owner"||n==="editor"?rd():Uo();case"site-map":return n==="owner"||n==="editor"?zc():Uo();case"notes":return Uo();case"board":return er();case"settings":return n==="owner"?Vl():Uo();case"team":return n==="owner"?td():Uo();case"profile":return ig();default:return sg("Not Found","This page doesn't exist.")}}function Uo(){let e=Lr();return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/${e}" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">${e==="board"?"\u2190 Back to Board":"\u2190 Back to Chat"}</a>
    </div>
  `}function sg(e,t){return`
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
  `}function ng(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return $[t[s]||"layoutGrid"]||$.layoutGrid}var yr=null,Rc=null,Dc=null;function og(){requestAnimationFrame(()=>{var c,u;let e=document.querySelector(".vs-nav-routes"),t=e==null?void 0:e.querySelector(".vs-nav-pill"),s=e==null?void 0:e.querySelector(".vs-nav-item-active");if(!e||!t||!s)return;let n=((u=(c=document.querySelector(".vs-nav-group-active"))==null?void 0:c.dataset)==null?void 0:u.group)||"",o=e.getBoundingClientRect(),i=s.getBoundingClientRect(),a=i.left-o.left,r=i.width;yr===null||!(Dc===n)?(t.style.transition="none",t.style.transform=`translateX(${a}px)`,t.style.width=`${r}px`,t.offsetHeight,t.style.transition=""):(t.style.transition="none",t.style.transform=`translateX(${yr}px)`,t.style.width=`${Rc}px`,t.offsetHeight,t.style.transition="",t.style.transform=`translateX(${a}px)`,t.style.width=`${r}px`),yr=a,Rc=r,Dc=n})}function Hc(e){yt.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function ig(){let e=R.get("user")||{};return setTimeout(()=>ag(),0),`
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
  `}function ag(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var c,u,p,d;let o=(u=(c=document.getElementById("profile-name"))==null?void 0:c.value)==null?void 0:u.trim(),i=(d=(p=document.getElementById("profile-email"))==null?void 0:p.value)==null?void 0:d.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:r,data:l}=await C.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(l!=null&&l.user)?(R.set("user",l.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>Ye(),800)):t&&(t.textContent=(r==null?void 0:r.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var c,u,p;let o=((c=document.getElementById("profile-current-pw"))==null?void 0:c.value)||"",i=((u=document.getElementById("profile-new-pw"))==null?void 0:u.value)||"",a=((p=document.getElementById("profile-confirm-pw"))==null?void 0:p.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:r,error:l}=await C.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",r?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(l==null?void 0:l.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function rg(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),lg()):e.classList.add("hidden")}async function lg(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await C.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${y((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=R.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let r=a.id===i,l=a.title||"Untitled conversation",c=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${r?"vs-conv-item-active":""}"
              data-conversation-id="${y(a.id)}">
        <span class="mt-0.5 shrink-0 ${r?"text-vs-accent":"text-vs-text-ghost"}">${$.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${r?"font-medium":""}" style="font-size: var(--text-sm);">${y(l)}</div>
          <div class="vs-conv-time mt-0.5">${c}</div>
        </div>
        ${r?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let r=a.dataset.conversationId;oa(r);let l=document.getElementById("conversation-history-panel");l&&l.classList.add("hidden")})})}async function oa(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await C.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){R.set("activeConversationId",null),aa(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=jn(),On();return}let i=n.conversation,a=i.prompts||[];R.set("activeConversationId",e),aa(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=jn(),On();return}let r="",l=!1;for(let c of a){let{text:u,images:p,webRefUrl:d}=Mg(c.user_prompt),v=p.length>0?`<div class="vs-msg-user-images">${p.map(b=>`<img src="${b}" class="vs-msg-user-image" />`).join("")}</div>`:"",m=d?`<div class="vs-msg-user-webref"><a href="${re(d)}" target="_blank" rel="noopener" title="${re(d)}">${$.globe} <span>${y(Jn(d))}</span></a></div>`:"";if(r+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${v}
        ${m}
        ${u?`<div class="text-sm text-vs-text-primary leading-relaxed">${y(u)}</div>`:""}
      </div>
    `,c.ai_response||c.files_modified){let b="",h=typeof c.ai_message=="string"&&c.ai_message.trim()!==""?c.ai_message:c.ai_response;h&&(b=sa(h));let g="";if(c.files_modified)try{let w=JSON.parse(c.files_modified);if(Array.isArray(w)&&w.length>0){let k=w.map(I=>{let T=typeof I=="string"?I:I.path||I,N=typeof I=="object"&&I.action==="delete";return`<div class="vs-file-badge ${N?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${N?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${y(String(T))}</span>
              </div>`}).join(""),E=w.length;g=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${E} file${E!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${k}</div>
              </div>`}}catch{}let f="";if(c.evaluation_issues)try{let w=JSON.parse(c.evaluation_issues);if(Array.isArray(w)&&w.length>0){let k=q=>q==="error"?"#ef4444":q==="warning"?"#d97706":"#6b7280",E=q=>q==="error"?"rgba(239,68,68,0.1)":q==="warning"?"rgba(217,119,6,0.1)":"rgba(107,114,128,0.1)",I={error:0,warning:0,info:0};w.forEach(q=>{I[q.severity]=(I[q.severity]||0)+1});let T=[];I.error&&T.push(`${I.error} error${I.error>1?"s":""}`),I.warning&&T.push(`${I.warning} warning${I.warning>1?"s":""}`),I.info&&T.push(`${I.info} suggestion${I.info>1?"s":""}`);let N=I.error>0?"error":I.warning>0?"warning":"info",j=N==="error"?"rgba(239,68,68,0.15)":N==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)",W=w.map(q=>`
              <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${k(q.severity)}; background: ${E(q.severity)};">${y(q.severity)}</span>
                  <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(q.category||"")}</span>
                  ${q.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(q.file)}${q.line?":"+q.line:""}</span>`:""}
                </div>
                <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(q.description||"")}</div>
                ${q.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(q.suggested_fix)}</div>`:""}
              </div>
            `).join("");f=`
              <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${j}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
                <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${k(N)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>Expert Review \xB7 ${T.join(", ")}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <div style="border-top: 1px solid var(--vs-border-subtle);">
                  <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
                  ${W}
                </div>
              </details>`}}catch{}let x=c.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${b}</div>
          ${g}
          ${f}
          ${x}
        </div>
      `}else if(c.status==="streaming"){l=!0;let b=c.id,h=c.status_message||"Generation in progress...";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            ${h}
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${b})"
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
      `)}t.innerHTML=r,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),l&&!window.__vsResumedToastByConversation[e]&&(B("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),l||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(c){try{await C.post("/ai/cancel-generation",{prompt_id:c})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",oa(e)},l&&R.get("activeConversationId")===e&&!R.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{R.get("activeConversationId")===e&&!R.get("aiStreaming")&&oa(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function dg(){R.set("activeConversationId",null),aa(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=jn(),On());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function Qc(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function ia(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=Qc(t)}function aa(e){R.set("activePageScope",e||null),ia(),ro()&&Ln()}async function cg(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>Ee(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),$e(t,s),t.addEventListener("keydown",u=>{u.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await C.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${y((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let r=i.pages;if(!r.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${$.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let l='<div style="display: flex; flex-direction: column; gap: 2px;">';r.forEach(u=>{let p=!!Number(u.is_homepage),d=u.title||u.slug||u.path,v=u.path||u.slug+".php",m="/"+v.replace(/\.php$/,"").replace(/^index$/,""),b=m==="/"?"/":m,h=ng(u.slug),f=(window.__vsCurrentPreviewPath||"index.php")===v,x=u.size?(u.size/1024).toFixed(1)+" KB":"";l+=`
      <div class="vs-pages-modal-item ${f?"is-active":""}" data-slug="${y(u.slug)}" data-path="${y(v)}" data-title="${y(d)}" data-url="${y(b)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${h}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(d)}${p?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(v)}${x?" \xB7 "+x:""}
            </div>
          </div>
        </div>
        <div class="vs-pages-modal-actions" style="display: flex; align-items: center; gap: 2px; flex-shrink: 0;">
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="edit" title="Edit in Chat" style="width:28px;height:28px;">
            ${$.messageCircle}
          </button>
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="preview" title="Open in Preview" style="width:28px;height:28px;">
            ${$.eye}
          </button>
          ${p?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${$.trash2}
          </button>
          `}
        </div>
      </div>
    `}),l+="</div>",n.innerHTML=l;let c=t.querySelector(".vs-modal-desc");c&&(c.textContent=`${r.length} page${r.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(u=>{u.addEventListener("click",p=>{p.stopPropagation();let d=u.closest(".vs-pages-modal-item"),v=d.dataset.slug,m=d.dataset.path,b=d.dataset.title,h=d.dataset.url,g=u.dataset.action;if(g==="edit")aa(v),s(),Hc(`Edit the "${b}" page (${h}): `);else if(g==="preview"){let f=document.getElementById("preview-iframe");f?(ro()&&Ln(),f.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m)+"&t="+Date.now(),window.__vsCurrentPreviewPath=m,ia(),s(),B(`Preview: ${b}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m),"_blank")}else if(g==="delete"){s();let f=`Delete the "${b}" page (${h}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;Hc(f)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(u=>{u.addEventListener("click",p=>{if(p.target.closest(".vs-pages-action"))return;let d=u.dataset.path,v=u.dataset.title,m=document.getElementById("preview-iframe");m?(m.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d)+"&t="+Date.now(),window.__vsCurrentPreviewPath=d,ia(),s(),B(`Preview: ${v}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d),"_blank")})})}function On(){var e;document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let s=document.getElementById("prompt-input");s&&(s.value=t.dataset.quickPrompt,s.dataset.actionType=t.dataset.actionType||"free_prompt",s.focus(),s.setSelectionRange(0,s.value.length),s.dispatchEvent(new Event("input",{bubbles:!0})))})}),(e=document.getElementById("chat-new-design"))==null||e.addEventListener("click",()=>{Dt()||da()||Wa()})}function jn(){let e=R.get("pages")||[],t=e.length>0,s=new Set(e.map(f=>f.slug)),n=[{label:"Quiet gallery",prompt:"Build my website so it feels like walking into a quiet gallery: lots of air, few words, one image at a time, nothing competing for attention. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Neighborhood cafe",prompt:"Build my website so it feels like a busy neighborhood cafe at nine in the morning: warm, close-up, a little imperfect, full of specific details. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Magazine spread",prompt:"Design my website like an editorial magazine spread: strong headline typography, a clear grid, generous margins, photography that gets room to breathe. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Well-run office",prompt:"Build my website so it feels like a well-run professional office: calm, precise, trustworthy, no decoration for its own sake. The kind of site a lawyer or an accountant would be proud of. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Workshop, not showroom",prompt:"Build my website so it feels like a working craft workshop rather than a showroom: honest materials, dark and warm, close-ups of the work, plain confident language. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Loud and joyful",prompt:"Build my website loud and joyful: big type, two strong colors, an energetic rhythm, a sense of humor in the copy. Confident, not corporate. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Boutique hotel",prompt:"Build my website so it feels like arriving at a small boutique hotel: unhurried, refined, warm and muted, elegant typography, a few beautiful photographs. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Product launch",prompt:"Build my website like a focused product launch page: one clear promise at the top, proof and details below, a single obvious action, dark and sharp. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Farm stand",prompt:"Build my website so it feels like a farm stand on a Saturday morning: earthy colors, natural textures, friendly hand-made character, straightforward information. Decide the pages and sections from my site name and tagline.",type:"create_site"},{label:"Record sleeve",prompt:"Design my website with the character of a classic record sleeve: bold retro typography, a limited palette, one strong image, nostalgia without looking dated. Decide the pages and sections from my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(f=>{let x=f.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(x)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],r=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],l=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],c=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],u=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],p,d,v;if(!t)d="What are we building?",v="Describe your website and watch it appear in the preview. Every detail is a conversation away.",p=xr(n).slice(0,6);else{d="What\u2019s next?",v="Your site is live in preview. Pick a suggestion or describe any change you want.";let f=[...o,...o,...i,...a,...r,...l,...c,...u];p=xr(f).slice(0,6);let x=new Set;if(p=p.filter(w=>x.has(w.label)?!1:(x.add(w.label),!0)),p.length<6){let w=xr(f).filter(k=>!x.has(k.label));for(let k of w){if(p.length>=6)break;p.push(k),x.add(k.label)}}}let m=p.map(f=>`<button data-quick-prompt="${y(f.prompt).replace(/"/g,"&quot;")}" data-action-type="${f.type}"
      class="vs-style-card">${y(f.label)}</button>`).join(`
        `),b=R.get("user"),g=t&&((b==null?void 0:b.role)==="owner"||(b==null?void 0:b.role)==="editor")?`
      <div class="vs-animate-in vs-stagger-5" style="margin-top: 16px; text-align: center;">
        <button id="chat-new-design" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
          ${$.filePlus} Start a new design from scratch
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
      ${g}
    </div>
  `}function xr(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function pg(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <button id="btn-undo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Undo (\u2318Z)">
          ${$.undo} Undo
        </button>
        <button id="btn-redo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Redo (\u2318\u21E7Z)">
          ${$.redo} Redo
        </button>
        <button id="btn-preview-site" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${$.externalLink} Preview
        </button>
        <button id="btn-snapshot" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${$.camera} Snapshot
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-download" class="vs-btn vs-btn-ghost vs-btn-xs" title="Download your website">
          ${$.download} Download
        </button>
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <div class="vs-publish-split">
          <button id="btn-publish"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-main">
            ${$.publish} Publish
          </button>
          <button id="btn-publish-menu"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-chevron"
            title="More publish options">
            ${$.chevronUp}
          </button>
        </div>
      </div>
    </footer>
  `}function ug(){let e=R.get("route");return`
    <nav class="vs-mobile-nav" aria-label="Mobile navigation">
      ${Xm().map(n=>{if(n.route==="more")return`
        <button class="vs-mobile-nav-item ${!la(e)?"vs-mobile-nav-item-active":""}" id="btn-mobile-more" aria-label="More">
          ${$[n.icon]||$.layoutGrid}
          <span>${n.label}</span>
        </button>
      `;let o=e===n.route||e.startsWith(n.route+"/");return`
      <a href="#/${n.route}"
         class="vs-mobile-nav-item ${o?"vs-mobile-nav-item-active":""}"
         aria-label="${n.label}">
        ${$[n.icon]||$.layoutGrid}
        <span>${n.label}</span>
      </a>
    `}).join("")}
    </nav>
  `}function vg(){let e=R.get("user"),t=e==null?void 0:e.role,s=R.get("theme"),n="";return t==="owner"&&(n+=`
      <a href="#/settings" class="vs-mobile-more-item" data-mobile-more-nav>
        ${$.settings} Settings
      </a>
    `),n+=`
    <a href="#/profile" class="vs-mobile-more-item" data-mobile-more-nav>
      ${$.pencil} Edit Profile
    </a>
  `,t==="owner"&&(n+=`
      <a href="#/team" class="vs-mobile-more-item" data-mobile-more-nav>
        ${$.users} Team Members
      </a>
    `),(t==="owner"||t==="editor")&&(n+=`
      <button id="btn-mobile-prompts" class="vs-mobile-more-item">
        ${$.zap} Prompts
      </button>
    `),n+=`
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-theme" class="vs-mobile-more-item">
      ${s==="dark"?$.sun:$.moon}
      ${s==="dark"?"Light mode":"Dark mode"}
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-publish" class="vs-mobile-more-item" style="color: var(--vs-accent); font-weight: 600;">
      ${$.publish} Publish
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-logout" class="vs-mobile-more-item" style="color: var(--vs-error);">
      ${$.logOut} Sign Out
    </button>
  `,`
    <div id="mobile-more-sheet" class="vs-mobile-more-sheet">
      <div class="vs-mobile-more-backdrop" id="mobile-more-backdrop"></div>
      <div class="vs-mobile-more-content">
        <div class="vs-mobile-more-header">
          <span class="vs-mobile-more-title">${y((e==null?void 0:e.name)||"Menu")}</span>
          <button id="btn-mobile-more-close" class="vs-mobile-more-close">${$.x}</button>
        </div>
        ${n}
      </div>
    </div>
  `}function mg(){if(!na())return;let e=document.getElementById("btn-mobile-more"),t=document.getElementById("mobile-more-sheet"),s=document.getElementById("mobile-more-backdrop"),n=document.getElementById("btn-mobile-more-close");function o(){t==null||t.classList.add("vs-sheet-open")}function i(){t==null||t.classList.remove("vs-sheet-open")}e&&e.addEventListener("click",o),s&&s.addEventListener("click",i),n&&n.addEventListener("click",i),document.querySelectorAll("[data-mobile-more-nav]").forEach(u=>{u.addEventListener("click",i)});let a=document.getElementById("btn-mobile-prompts");a&&a.addEventListener("click",()=>{i(),$r()});let r=document.getElementById("btn-mobile-theme");r&&r.addEventListener("click",()=>{ii(),i(),Ye()});let l=document.getElementById("btn-mobile-publish");l&&l.addEventListener("click",()=>{var u;i(),!Dt()&&((u=document.getElementById("btn-publish"))==null||u.click())});let c=document.getElementById("btn-mobile-logout");c&&c.addEventListener("click",async()=>{i(),await C.post("/auth/logout"),window.location.href="/_studio/"})}function gg(){return`
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
  `}function ep(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>op(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function tp(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function sp(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function ca(){return tp(Gc)}function Ir(){return tp(Wc)}function np(e){let t=ca(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];sp(Gc,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};Go(n.query||"",n.activeIndex||0)}function fg(e){let t=Ir().filter(n=>n!==e),s=[e,...t].slice(0,8);sp(Wc,s)}function op(e){if(R.get("route")!=="chat"){yt.navigate("chat"),setTimeout(()=>op(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function ip(e,t="free_prompt",s=!1){if(R.get("route")!=="chat"){yt.navigate("chat"),setTimeout(()=>ip(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?ra():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function Vo(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function $r(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),Go(e,0))}function Wo(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function hg(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function bg(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=hg(s,n);return i===null?null:70+i}function yg(e){let t=(e||"").trim().toLowerCase(),s=ep(),n=ca(),o=Ir();return s.map(i=>{let a=bg(t,i);if(a===null)return null;let r=n.includes(i.id)?-12:0,l=o.includes(i.id)?-8:0;return{...i,__score:a+r+l}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function xg(e){let t=ep(),s=Object.fromEntries(t.map(p=>[p.id,p])),n=(e||"").trim(),o=[];if(n!==""){let p=yg(e).slice(0,18);return p.length>0&&o.push({title:"Results",commands:p}),o}let i=Ir(),a=ca(),r=new Set,l=i.map(p=>s[p]).filter(Boolean);l.length>0&&(o.push({title:"Recent",commands:l}),l.forEach(p=>r.add(p.id)));let c=a.map(p=>s[p]).filter(p=>p&&!r.has(p.id));return c.length>0&&(o.push({title:"Pinned",commands:c}),c.forEach(p=>r.add(p.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(p=>{let d=t.filter(v=>v.group===p&&!r.has(v.id));d.length>0&&(o.push({title:p,commands:d}),d.forEach(v=>r.add(v.id)))}),o}function Go(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=xg(e),o=n.flatMap(c=>c.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=ca();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let r="",l=0;n.forEach(c=>{r+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${y(c.title)}</div>`,c.commands.forEach(u=>{let p=l===i,d=a.includes(u.id);r+=`
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
      `,l+=1})}),s.innerHTML=r,s.querySelectorAll("[data-command-index]").forEach(c=>{c.addEventListener("click",()=>{let u=parseInt(c.dataset.commandIndex||"0",10);ap(u)})}),s.querySelectorAll("[data-command-pin]").forEach(c=>{c.addEventListener("click",u=>{u.preventDefault(),u.stopPropagation();let p=c.dataset.commandPin;p&&np(p)})})}function ap(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(fg(n.id),Wo(),Promise.resolve(n.run()).catch(()=>{}))}function wg(){return`
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
  `}function Qi(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function fn(){try{let e=localStorage.getItem(Vc);if(!e)return Qi();let t=JSON.parse(e);return{...Qi(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Qi().pages}}catch{return Qi()}}function rp(e){try{localStorage.setItem(Vc,JSON.stringify(e))}catch{}}function ta(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function Nc(){let e=window.__vsOnboarding||{step:1,draft:fn()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||fn(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),r=document.getElementById("btn-onboarding-next"),l=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!r||!l)return;let c=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${c[t-1]}`,n.innerHTML=c.map((u,p)=>{let d=p+1===t,v=p+1<t;return`
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
    `}a.disabled=t===1,r.classList.toggle("hidden",t===3),l.classList.toggle("hidden",t!==3),kg()}function kg(){let e=window.__vsOnboarding||{draft:fn()},t=()=>{var n,o,i,a,r,l,c,u,p,d,v;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((l=(r=document.getElementById("onboard-offer"))==null?void 0:r.value)==null?void 0:l.trim())||e.draft.offer||"",audience:((u=(c=document.getElementById("onboard-audience"))==null?void 0:c.value)==null?void 0:u.trim())||e.draft.audience||"",style:((p=document.getElementById("onboard-style"))==null?void 0:p.value)||e.draft.style||"modern-minimal",tone:((d=document.getElementById("onboard-tone"))==null?void 0:d.value)||e.draft.tone||"confident",content_mode:((v=document.getElementById("onboard-content-mode"))==null?void 0:v.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(m=>m.checked).map(m=>m.dataset.onboardPage).filter(Boolean)),rp(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function Eg(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function $g(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>ta());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>ta());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:fn()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,Nc()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:fn()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,Nc()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:fn()}).draft||fn(),r=Eg(a);try{localStorage.setItem(Um,"1")}catch{}rp(a),ta(),ip(r,"create_site",!0)})}function Cg(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var U,ne;let P=ii()==="light";e.innerHTML=P?$.sun:$.moon,e.title=P?"Switch to dark":"Switch to light",window.__vsEditorPage&&((U=window.monaco)!=null&&U.editor)&&window.monaco.editor.setTheme(Js()),document.getElementById("vs-code-editor-overlay")&&((ne=window.monaco)!=null&&ne.editor)&&window.monaco.editor.setTheme(Js())}),document.querySelectorAll(".vs-nav-group").forEach(S=>{S.addEventListener("click",()=>{let P=S.dataset.target;P&&yt.navigate(P)})}),og();let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{$r()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>Wo());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{Go(n.value,0)}),n.addEventListener("keydown",S=>{let P=window.__vsCommandPalette||{commands:[],activeIndex:0};if((S.metaKey||S.ctrlKey)&&S.key.toLowerCase()==="p"){S.preventDefault();let F=P.commands[P.activeIndex];F&&np(F.id);return}if(S.key==="ArrowDown"){S.preventDefault(),Go(n.value,P.activeIndex+1);return}if(S.key==="ArrowUp"){S.preventDefault(),Go(n.value,P.activeIndex-1);return}if(S.key==="Enter"){S.preventDefault(),ap();return}S.key==="Escape"&&(S.preventDefault(),Wo())})),$g();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",S=>{S.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",S=>{!i.classList.contains("hidden")&&!i.contains(S.target)&&S.target!==o&&!o.contains(S.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav","btn-settings-nav"].forEach(S=>{let P=document.getElementById(S);P&&i&&P.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await C.post("/auth/logout"),window.location.href="/_studio/"});let r=document.getElementById("btn-undo-status");r&&r.addEventListener("click",()=>{Dt()||jc()});let l=document.getElementById("btn-redo-status");l&&l.addEventListener("click",()=>{Dt()||qc()});let c=document.getElementById("btn-preview-site");c&&c.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let u=document.getElementById("btn-snapshot");u&&u.addEventListener("click",async()=>{var U;if(Dt())return;u.disabled=!0,Us("Creating snapshot...");let{ok:S,data:P,error:F}=await C.post("/snapshots",{type:"manual",label:"Manual snapshot"});u.disabled=!1,Us(S?`\u2713 Snapshot saved (${((U=P==null?void 0:P.snapshot)==null?void 0:U.file_count)||0} files)`:"\u2717 "+((F==null?void 0:F.message)||"Snapshot failed"),S?"success":"error",4e3)});let p=document.getElementById("btn-download");p&&((async()=>{var U;let{ok:S,data:P}=await C.get("/settings");((U=P==null?void 0:P.settings)==null?void 0:U.last_published_at)||(p.disabled=!0,p.title="Publish your site first to enable download.",p.classList.add("opacity-40"))})(),p.addEventListener("click",()=>{p.disabled||Dt()||Tg()}));let d=document.getElementById("btn-publish");d&&(Nn(),d.addEventListener("click",async()=>{var we,Z;let S=Jo();if(S.publishing)return;if(S.hasChanges===!1){B("No unpublished changes to publish.","warning");return}let P=S.counts||{added:0,modified:0,deleted:0},F=Number(P.added||0)+Number(P.modified||0)+Number(P.deleted||0),U=localStorage.getItem("vs_publish_snapshot"),se=await Lg({totalChanges:F,snapshotDefault:U===null?!0:U!=="false"});if(!se||Dt())return;localStorage.setItem("vs_publish_snapshot",String(se.createSnapshot)),S.publishing=!0,Nn(),Us("Publishing...");let{ok:ae,data:ce,error:he}=await C.post("/publish",{create_snapshot:se.createSnapshot});if(S.publishing=!1,ae){let _e=((we=ce==null?void 0:ce.published)==null?void 0:we.length)||0,lt=((Z=ce==null?void 0:ce.removed)==null?void 0:Z.length)||0,ht=lt>0?`Published ${_e} file(s), removed ${lt} stale file(s).`:`Published ${_e} file(s).`;B(ht,"success"),Us(`\u2713 ${_e} published, ${lt} removed`,"success",5e3),R.set("previewDirty",!1),ws({silent:!0}),window.open("/","_blank")}else B((he==null?void 0:he.message)||"Publish failed.","error"),Us("\u2717 "+((he==null?void 0:he.message)||"Publish failed"),"error",5e3),ws({silent:!0})}));let v=document.getElementById("btn-publish-menu");v&&v.addEventListener("click",S=>{S.stopPropagation();let P=document.querySelector(".vs-publish-dropup");if(P){P.remove();return}let F=document.createElement("div");F.className="vs-publish-dropup",F.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${$.cloudOff} Unpublish
        </button>
      `;let U=v.closest(".vs-publish-split");U?U.appendChild(F):v.parentElement.appendChild(F),F.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(F.remove(),!await Te({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0})||Dt())return;Us("Unpublishing...");let{ok:ce,data:he,error:we}=await C.post("/publish/unpublish");ce?(B("Unpublished. Default page restored.","success"),Us("\u2713 Site unpublished","success",5e3),ws({silent:!0})):(B((we==null?void 0:we.message)||"Unpublish failed.","error"),Us("\u2717 "+((we==null?void 0:we.message)||"Unpublish failed"),"error",5e3))});let ne=ae=>{!F.contains(ae.target)&&ae.target!==v&&(F.remove(),document.removeEventListener("click",ne))};setTimeout(()=>document.addEventListener("click",ne),0);let se=ae=>{ae.key==="Escape"&&(F.remove(),document.removeEventListener("keydown",se),document.removeEventListener("click",ne))};document.addEventListener("keydown",se)});let m=document.getElementById("resize-handle"),b=document.getElementById("conversation-panel");if(m&&b){let S,P;m.addEventListener("mousedown",F=>{F.preventDefault(),S=F.clientX,P=b.offsetWidth;let U=se=>{let ae=se.clientX-S,ce=Math.min(580,Math.max(340,P+ae));b.style.width=`${ce}px`,R.set("sidebarWidth",ce)},ne=()=>{document.removeEventListener("mousemove",U),document.removeEventListener("mouseup",ne)};document.addEventListener("mousemove",U),document.addEventListener("mouseup",ne)})}let h=document.getElementById("prompt-input");h&&(h.addEventListener("input",()=>{h.style.height="auto",h.style.height=Math.min(200,h.scrollHeight)+"px"}),h.addEventListener("keydown",S=>{S.key==="Enter"&&(S.metaKey||S.ctrlKey)&&(S.preventDefault(),ra())}));let g=document.getElementById("btn-send");g&&g.addEventListener("click",ra);let f=document.getElementById("btn-attach-image"),x=document.getElementById("image-file-input");f&&x&&(f.addEventListener("click",()=>x.click()),x.addEventListener("change",()=>{x.files.length>0&&(wr(x.files),x.value="")})),Ag();let w=document.getElementById("btn-voice-input");if(w){let S=window.SpeechRecognition||window.webkitSpeechRecognition,P=null,F=!1,U=()=>{F=!1,w.classList.remove("is-recording"),w.innerHTML=$.mic};w.addEventListener("click",()=>{if(F){P&&P.stop();return}if(location.protocol!=="https:"&&location.hostname!=="localhost"&&location.hostname!=="127.0.0.1"){B("Voice input requires HTTPS","warning");return}P=new S,P.continuous=!1,P.interimResults=!1,P.lang=navigator.language||"en-US",P.onstart=()=>{F=!0,w.classList.add("is-recording")},P.onresult=ne=>{var he,we;let se=(we=(he=ne.results[0])==null?void 0:he[0])==null?void 0:we.transcript;if(!se)return;let ae=document.getElementById("prompt-input");if(!ae)return;let ce=ae.value;ae.value=ce+(ce.length>0?" ":"")+se,ae.dispatchEvent(new Event("input",{bubbles:!0})),ae.style.height="auto",ae.style.height=ae.scrollHeight+"px",ae.focus()},P.onerror=ne=>{if(ne.error==="no-speech")return;let ae={"audio-capture":"No microphone found","not-allowed":"Microphone permission denied",network:"Speech service unavailable",aborted:null}[ne.error];ae?B(ae,"warning"):ae!==null&&console.warn("[VoxelSite] Voice input error:",ne.error)},P.onend=()=>{U();let ne=document.getElementById("prompt-input");ne&&ne.focus()};try{P.start()}catch(ne){console.warn("[VoxelSite] Voice input failed to start:",ne.message),B("Voice input unavailable","warning"),U()}})}let k=document.querySelector(".vs-prompt-area");k&&(k.addEventListener("dragover",S=>{S.preventDefault(),S.stopPropagation(),k.classList.add("vs-drag-over")}),k.addEventListener("dragleave",S=>{S.preventDefault(),S.stopPropagation(),k.classList.remove("vs-drag-over")}),k.addEventListener("drop",S=>{S.preventDefault(),S.stopPropagation(),k.classList.remove("vs-drag-over");let P=Array.from(S.dataTransfer.files).filter(F=>Er.includes(F.type));P.length>0&&wr(P)})),h&&h.addEventListener("paste",S=>{var U;let F=Array.from(((U=S.clipboardData)==null?void 0:U.items)||[]).filter(ne=>ne.kind==="file"&&Er.includes(ne.type));if(F.length>0){S.preventDefault();let ne=F.map(se=>se.getAsFile()).filter(Boolean);wr(ne)}}),On();let E=document.getElementById("btn-new-chat");E&&E.addEventListener("click",dg);let I=document.getElementById("btn-scope-selector");I&&I.addEventListener("click",()=>{cg()});let T=document.getElementById("btn-toggle-history");T&&T.addEventListener("click",rg);let N=document.getElementById("btn-visual-editor");N&&N.addEventListener("click",()=>Aa());let j=document.getElementById("btn-refresh-preview");j&&j.addEventListener("click",()=>qn());let W=document.getElementById("btn-save-design");if(W){W.addEventListener("click",()=>{Dt()||da()||fo()});let S=()=>{let P=R.get("pages")||[];W.disabled=P.length===0};S(),R.on("pages",S)}let q=document.querySelectorAll("[data-device]"),Y=document.getElementById("preview-frame-container");if(q.length&&Y){let S={desktop:"100%",tablet:"768px",mobile:"375px"};q.forEach(P=>{P.addEventListener("click",()=>{let F=P.dataset.device,U=S[F]||"100%";F==="desktop"?(Y.style.maxWidth="",Y.style.width="",Y.style.alignSelf=""):(Y.style.maxWidth=U,Y.style.width="100%",Y.style.alignSelf="center"),q.forEach(ne=>{ne.classList.remove("vs-device-btn-active"),ne.dataset.device===F&&ne.classList.add("vs-device-btn-active")})})})}let ee=document.getElementById("btn-external-preview");ee&&ee.addEventListener("click",()=>{let S=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(S),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",S=>{var F,U;let P=(U=(F=S.target)==null?void 0:F.closest)==null?void 0:U.call(F,"[data-code-toggle]");P&&(S.preventDefault(),Rg(P))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",S=>{if((S.metaKey||S.ctrlKey)&&S.key==="k"){S.preventDefault(),Vo()?Wo():$r();return}if(S.key==="Escape"&&Vo()){S.preventDefault(),Wo();return}if(S.key==="Escape"&&ea()){S.preventDefault(),ta();return}if((S.metaKey||S.ctrlKey)&&S.key==="z"&&!S.shiftKey){if(Vo()||ea()||R.get("route")!=="chat")return;let P=document.activeElement;if(P&&(P.tagName==="INPUT"||P.tagName==="TEXTAREA"))return;S.preventDefault(),jc()}if((S.metaKey||S.ctrlKey)&&S.key==="z"&&S.shiftKey){if(Vo()||ea()||R.get("route")!=="chat")return;let P=document.activeElement;if(P&&(P.tagName==="INPUT"||P.tagName==="TEXTAREA"))return;S.preventDefault(),qc()}if(S.key==="v"&&!S.metaKey&&!S.ctrlKey&&!S.altKey&&!S.shiftKey){if(Vo()||ea())return;let P=document.activeElement;if(P&&(P.tagName==="INPUT"||P.tagName==="TEXTAREA"||P.isContentEditable))return;let F=R.get("route");if(!kr.includes(F))return;S.preventDefault(),Aa()}if(S.key==="Escape"&&ro()){if(S.preventDefault(),mi())return;if(Pa()){Ra();return}if(hl()){lo();return}Ln();return}}));let H=R.get("route");if(kr.includes(H))try{let S=R.get("activeConversationId"),P=localStorage.getItem("vs-active-conversation"),F=S||P,U=document.getElementById("chat-messages"),ne=U==null?void 0:U.querySelector(".vs-empty-state");F&&!R.get("aiStreaming")?(S||R.set("activeConversationId",F),ne&&oa(F)):F||U&&U.children.length===0&&(U.innerHTML=jn(),On())}catch{}Xo(),Ig()}function Sg(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=R.get("pages"),s=!t||t.length===0,n=s?"Building your site":"Applying your changes",o=s?"Generating a new website can take up to 10 minutes.<br>Please be patient while the AI works.":"Small changes can take a minute, larger updates can take up to 10 minutes.",i=document.createElement("div");i.className="vs-generating-overlay",i.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">${n}</div>
    <div class="vs-gen-subtitle">${o}</div>
    <div class="vs-gen-note">Keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-metrics" id="overlay-metrics"></div>
  `,e.appendChild(i)}function Oc(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function qn(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=qn;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),ia())}));function Cr(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{qn()}}window.sendPreviewMessage=Cr;async function jc(){lo(),(await C.post("/revisions/undo")).ok&&(setTimeout(()=>qn(),300),await Xo(),ws({silent:!0}))}async function qc(){lo(),(await C.post("/revisions/redo")).ok&&(setTimeout(()=>qn(),300),await Xo(),ws({silent:!0}))}async function Xo(){let{ok:e,data:t}=await C.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!s,r.title=o,r.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!n,r.title=i,r.classList.toggle("opacity-40",!n))})}function Jo(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function Yo(e,t){let s=document.getElementById("vs-global-status");if(!s)return;let n=s.querySelector(".vs-global-status-dot"),o=s.querySelector(".vs-global-status-text");if(!(!n||!o))switch(window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s.className="vs-global-status",e){case"saving":s.classList.add("vs-global-status--active","vs-global-status--saving"),o.textContent=t||"Saving\u2026";break;case"saved":s.classList.add("vs-global-status--active","vs-global-status--saved"),o.textContent=t||"Saved",window.__vsStatusResetTimer=setTimeout(()=>{Yo("idle")},2e3);break;case"loading":s.classList.add("vs-global-status--active","vs-global-status--loading"),o.textContent=t||"Loading\u2026";break;case"error":s.classList.add("vs-global-status--active","vs-global-status--error"),o.textContent=t||"Error",window.__vsStatusResetTimer=setTimeout(()=>{Yo("idle")},4e3);break;case"idle":default:o.textContent="";break}}function Us(e,t="neutral",s=0){Yo(t==="success"?"saved":t==="error"?"error":"idle",e),s>0&&(window.__vsStatusResetTimer&&clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=setTimeout(()=>{Yo("idle")},s))}window.__vsSetGlobalStatus=Yo;function Nn(){let e=Jo(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=r=>{s&&(r?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${$.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${$.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${$.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${$.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let r=a===1?"":"s";n.textContent=`${a} unpublished change${r}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${$.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=Nn;function Lg({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var l,c;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=u=>{u.key==="Escape"&&(u.preventDefault(),r(null))},r=u=>{document.removeEventListener("keydown",a),Ee(i),s(u)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),$e(i,()=>r(null)),(l=document.getElementById("vs-confirm-cancel"))==null||l.addEventListener("click",()=>r(null)),(c=document.getElementById("vs-confirm-ok"))==null||c.addEventListener("click",()=>{let u=document.getElementById("vs-publish-snapshot-cb");r({createSnapshot:u?u.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var u;return(u=document.getElementById("vs-confirm-ok"))==null?void 0:u.focus()},220)})}function Tg(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=Jo().hasChanges===!0?`
    <div class="vs-download-warning">
      <div class="vs-download-warning-content">
        ${$.alertTriangle}
        <span>You have unpublished changes. This export reflects your last published version.</span>
      </div>
      <a href="#" id="vs-download-publish-link" class="vs-download-publish-link">Publish first \u2192</a>
    </div>
  `:"",o=document.createElement("div");o.id="vs-download-modal-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header" style="position: relative;">
        <button id="vs-download-close" class="vs-download-close-btn" type="button" title="Close">
          ${$.x}
        </button>
        <h2 class="vs-modal-title">Download Your Website</h2>
        <p class="vs-modal-desc">Take your files anywhere. No VoxelSite required to run them.</p>
      </div>
      <div class="vs-modal-body" style="padding-top: 16px;">
        ${n}
        <div class="vs-download-cards" id="vs-download-cards">
          <button type="button" class="vs-download-card is-selected" data-format="php">
            <div class="vs-download-card-icon">
              ${$.fileCode}
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
              ${$.globe}
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
          ${$.download} Download PHP
        </button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=d=>{d.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),Ee(o)};o.querySelector("#vs-download-close").addEventListener("click",a),$e(o,a),document.addEventListener("keydown",i);let r=o.querySelector("#vs-download-publish-link");r&&r.addEventListener("click",d=>{d.preventDefault(),a(),setTimeout(()=>{let v=document.getElementById("btn-publish");v&&!v.disabled&&v.click()},400)});let l=o.querySelectorAll(".vs-download-card"),c=o.querySelector("#vs-download-action"),u="php";l.forEach(d=>{d.addEventListener("click",()=>{if(d.classList.contains("is-loading"))return;l.forEach(m=>m.classList.remove("is-selected")),d.classList.add("is-selected"),u=d.dataset.format;let v=u==="php"?"Download PHP":"Download HTML";c.innerHTML=`${$.download} ${v}`})});let p=!1;c.addEventListener("click",async()=>{var d;if(!p){p=!0,c.disabled=!0,c.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',l.forEach(v=>v.style.pointerEvents="none");try{let v=R.get("sessionToken"),m={"Content-Type":"application/json",Accept:"application/zip"};v&&(m["X-VS-Token"]=v);let b=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:m,credentials:"same-origin",body:JSON.stringify({format:u})});if(!b.ok){let E="Export failed.";try{let I=await b.json();E=((d=I==null?void 0:I.error)==null?void 0:d.message)||E}catch{}B(E,"error");return}let g=(b.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),f=g?g[1]:`site-${u}-${new Date().toISOString().slice(0,10)}.zip`,x=await b.blob(),w=URL.createObjectURL(x),k=document.createElement("a");k.href=w,k.download=f,k.style.display="none",document.body.appendChild(k),k.click(),setTimeout(()=>{URL.revokeObjectURL(w),k.remove()},100),B(`\u2713 ${f} downloaded`,"success")}catch{B("Download failed. Check your connection.","error")}finally{p=!1,c.disabled=!1;let v=u==="php"?"Download PHP":"Download HTML";c.innerHTML=`${$.download} ${v}`,l.forEach(m=>m.style.pointerEvents="")}}})}async function ws({silent:e=!1}={}){let t=Jo();if(t.publishing){Nn();return}t.checking=!0,e||Nn();let{ok:s,data:n,error:o}=await C.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",Nn()}window.refreshPublishState=ws;function Ig(){let e=Jo();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),ws({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||ws({silent:!0})},15e3)}function Mg(e){if(!e)return{text:"",images:[],webRefUrl:null};let t=null,s=e;s.includes("[vx-ref:")&&(s=s.replace(/\[vx-ref:(https?:\/\/[^\]]+)\]/g,(o,i)=>(t=i,"")));let n=[];return s.includes("[vx-img:")&&(s=s.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(o,i)=>(n.push(i),""))),{text:s.trim(),images:n,webRefUrl:t}}function wr(e){let t=Array.from(e),s=Pc-Vs.length;if(s<=0){B(`Maximum ${Pc} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&B(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!Er.includes(o.type)){B(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>Gm){B(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,r=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!r)return;let l=new Image;l.onload=()=>{let c=_g(l,120);Vs.push({media_type:r[1],data:r[2],name:o.name,preview:a,thumbnail:c}),Mr()},l.src=a},i.readAsDataURL(o)})}function _g(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function Mr(){let e=document.getElementById("image-attachments");if(e){if(Vs.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=Vs.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${y(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);Vs.splice(n,1),Mr()})})}}function Bg(){Vs=[],Mr()}function lp(){let t=(R.get("pages")||[]).length>0,s=document.getElementById("website-ref-restyle-options"),n=document.getElementById("website-ref-helper"),o=document.getElementById("btn-website-ref-confirm");s&&(s.hidden=!t),n&&(n.textContent=t?"Use another website as design reference for your site.":"Uses an existing website as design reference."),o&&(o.textContent=t?"Add":"Attach")}function dp(){Qt=null;let e=document.getElementById("website-ref-chip");e&&(e.hidden=!0);let t=document.getElementById("prompt-input");t&&(t.placeholder="Describe what you want to build...");let s=document.getElementById("btn-attach-website");s&&s.classList.remove("is-active")}function Ag(){let e=document.getElementById("btn-attach-website"),t=document.getElementById("website-ref-sheet"),s=document.getElementById("website-ref-url"),n=document.getElementById("website-ref-mode"),o=document.getElementById("btn-website-ref-confirm"),i=document.getElementById("btn-website-ref-cancel"),a=document.getElementById("website-ref-chip"),r=document.getElementById("website-ref-chip-label"),l=document.getElementById("btn-remove-website-ref"),c=document.getElementById("prompt-input");function u(d){if(p(),s&&s.classList.add("vs-input-error"),s){let v=document.createElement("div");v.className="vs-field-error vs-ref-url-error",v.textContent=d,s.insertAdjacentElement("afterend",v)}}function p(){s&&s.classList.remove("vs-input-error");let d=t==null?void 0:t.querySelector(".vs-ref-url-error");d&&d.remove()}e&&t&&e.addEventListener("click",()=>{da()||(lp(),p(),t.hidden=!t.hidden,e.classList.toggle("is-active",!t.hidden||Qt!==null),!t.hidden&&s&&s.focus())}),o&&o.addEventListener("click",async()=>{var m;if(Dt())return;let d=(m=s==null?void 0:s.value)==null?void 0:m.trim();if(!d||!d.match(/^https?:\/\/.+/)){u("Enter a valid URL starting with http:// or https://");return}let v=o.textContent;o.disabled=!0,o.textContent="Checking\u2026",p();try{let{ok:b,data:h,error:g}=await C.post("/ai/check-url",{url:d});if(!b){u((g==null?void 0:g.message)||"Could not reach this URL.");return}let f=(h==null?void 0:h.url)||d,w=(R.get("pages")||[]).length>0;Qt={url:f,contentMode:w?(n==null?void 0:n.value)||"keep":"regenerate",restyle:w};let k="Design reference";r.textContent=`${k}: ${Jn(f)}`,r.title=f,a&&(a.hidden=!1),t&&(t.hidden=!0),e&&e.classList.add("is-active"),c&&(c.placeholder="Describe what to change (optional)...",c.focus())}catch{u("Network error \u2014 please check your connection and try again.")}finally{o.disabled=!1,o.textContent=v}}),i&&t&&i.addEventListener("click",()=>{p(),t.hidden=!0,e&&!Qt&&e.classList.remove("is-active")}),l&&l.addEventListener("click",()=>{dp()}),s&&o&&(s.addEventListener("keydown",d=>{d.key==="Enter"&&(d.preventDefault(),o.click())}),s.addEventListener("input",p))}async function ra(){if(Dt())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=Vs.length>0;if(!t&&!s&&!(Qt!==null)||R.get("aiStreaming"))return;if(Qt!=null&&Qt.restyle)try{let M=R.get("siteName")||"Untitled";if(!(await C.post("/designs",{name:`${M} (before restyle)`,description:`Automatic snapshot saved before restyling from ${Qt.url}`,is_system_backup:!0})).ok){B("Could not save your current design before restyling. Please try again.","error");return}}catch{B("Could not save your current design before restyling. Please try again.","error");return}e.value="",e.style.height="auto";let o=document.getElementById("chat-messages");if(!o)return;let i=[...Vs];Bg();let a=Qt;dp();let r=i.length>0?`<div class="vs-msg-user-images">${i.map(M=>`<img src="${M.preview}" alt="${y(M.name)}" class="vs-msg-user-image" />`).join("")}</div>`:"",l=a?`<div class="vs-msg-user-webref"><a href="${re(a.url)}" target="_blank" rel="noopener" title="${re(a.url)}">${$.globe} <span>${y(Jn(a.url))}</span></a></div>`:"",c=`
    <div class="vs-msg-user mb-6 mt-4">
      ${r}
      ${l}
      ${t?`<div class="vs-msg-user-bubble">${y(t)}</div>`:""}
    </div>
  `,u=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,p=`
    <div class="vs-msg-ai mb-6" data-stream-id="${u}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${$.box}</span>
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
  `,d=o.querySelector(".vs-empty-state");d&&d.remove(),o.insertAdjacentHTML("beforeend",c+p),o.scrollTop=o.scrollHeight;let v=!0,m=80,b=()=>{v=o.scrollHeight-o.scrollTop-o.clientHeight<=m};o.addEventListener("scroll",b);let h=()=>{v&&(o.scrollTop=o.scrollHeight)},g=o.querySelector(`.vs-msg-ai[data-stream-id="${u}"]`);if(!g)return;let f=g.querySelector('[data-role="typing"]'),x=g.querySelector('[data-role="status"]'),w=g.querySelector('[data-role="stream-content"]'),k=g.querySelector('[data-role="files-section"]'),E=g.querySelector('[data-role="files"]'),I=g.querySelector('[data-role="files-label"]'),T=g.querySelector('[data-role="files-count"]'),N=g.querySelector('[data-role="files-progress"]'),j=g.querySelector('[data-role="error"]'),W=g.querySelector('[data-role="status-timer"]'),q=g.querySelector('[data-role="status-step"]'),Y=g.querySelector('[data-role="status-tokens"]'),ee=M=>{M&&M.removeAttribute("hidden")},H=M=>{M&&M.setAttribute("hidden","")},S=Date.now(),P=0,F=Date.now(),U=!1,ne=!1,se=setInterval(()=>{let M=Math.floor((Date.now()-S)/1e3),D=Math.floor(M/60),O=M%60,X=D>0?`${D}m ${O}s`:`${O}s`;if(Y&&P>0){let K=P>=1e3?`~${(P/1e3).toFixed(1)}K tokens`:`${P} tokens`;Y.textContent=`\xB7 ${K}`}W&&(W.textContent=X);let Q=document.getElementById("overlay-metrics");Q&&(Q.textContent=X),Date.now()-F>3e5&&!U&&(U=!0,W&&(W.textContent=`${X} \xB7 No data for 5 min \u2014 may have stalled`,W.style.color="var(--vs-warning, #d97706)"))},1e3);R.set("aiStreaming",!0),document.body.classList.add("vs-ai-streaming");let ae=document.getElementById("btn-send");ae&&(ae.disabled=!0,ae.classList.add("opacity-50")),Sg();let ce="",he=[],we=!1,Z=null,_e=!0,lt=new AbortController,ht=null,Ws=g.querySelector('[data-role="stop-btn"]');Ws&&Ws.addEventListener("click",()=>{lt.abort(),ht&&(C.post("/ai/cancel-generation",{prompt_id:ht}).catch(()=>{}),ht=null)});let _=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let V=e.dataset.actionData,oe=null;if(V){try{oe=JSON.parse(V)}catch{}delete e.dataset.actionData}let L=t||"";if(!L)if(a)try{let M=Jn(a.url);L=a.restyle?`(restyle from: ${M})`:`(import from: ${M})`}catch{L=`(reference: ${a.url})`}else i.length>0&&(L="(see attached images)");a&&(L=`[vx-ref:${a.url}]`+L),i.length>0&&(L=i.map(D=>`[vx-img:${D.thumbnail}]`).join("")+L);let A={user_prompt:L,action_type:_,page_scope:R.get("activePageScope"),conversation_id:R.get("activeConversationId"),action_data:oe};a&&(A.action_type=a.restyle?"restyle_site":"import_site",A.action_data={url:a.url,content_mode:a.contentMode},A.page_scope=null),i.length>0&&(A.images=i.map(M=>({data:M.data,media_type:M.media_type}))),await Gt("/ai/prompt",A,{signal:lt.signal,onPromptId(M){ht=M},onConversation(M){if(M){R.set("activeConversationId",M);try{localStorage.setItem("vs-active-conversation",M)}catch{}}},onStatus(M){let D=typeof M=="string"?M:M.message||"";q&&(q.textContent=`\xB7 ${D}`),!ne&&k&&!k.hasAttribute("hidden")&&I&&(I.textContent=D)},onToken(M){ce+=M,P+=Math.ceil(M.length/4),F=Date.now(),U=!1,W&&(W.style.color="");let D=ce.trimStart();if(!we&&D.length>0&&(we=D.startsWith("{")||D.startsWith("```json")||D.startsWith("```")||D.startsWith("<|")||D.startsWith("<message>")||D.startsWith("<file ")||M.includes("<|")||D.includes("<|channel|>")||D.includes('"operations"')||D.includes('"assistant_message"'),we&&w&&(w.innerHTML="")),H(f),w&&we){let O=ce.match(/<message>([\s\S]*?)(<\/message>|$)/);if(O){let X=O[1].trim();X&&(ee(w),w.innerHTML=sa(X))}k&&ce.includes("<file ")&&ee(k)}else w&&(ee(w),w.innerHTML=sa(ce));h()},onFile(M){if(he.push(M),k&&ee(k),T){let D=he.length;T.textContent=`${D} file${D!==1?"s":""}`}if(E){let D=M.action==="delete",O=(he.length-1)*60,X=D?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';E.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${D?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${O}ms">
            <span class="vs-file-badge-icon">${X}</span>
            <span>${y(M.path)}</span>
          </div>
        `)}Z||(_e=!0),M.path.endsWith(".css")||(_e=!1),clearTimeout(Z),Z=setTimeout(()=>{Cr(_e?"voxelsite:reload-css":"voxelsite:reload"),Z=null,_e=!0},600),h()},onDone(M){ne=!0,clearTimeout(Z),Z=null,clearInterval(se),H(f),H(x);let D=M.files_modified||[],O=he.length>0||D.length>0;if(k&&O){H(N),k.classList.add("vs-files-done"),I&&(I.textContent=M.partial?"Files updated (partial)":"Files updated");let z=document.createElement("div");z.className="vs-chat-action-row",z.innerHTML=`
          <button class="vs-btn vs-btn-ghost vs-btn-xs vs-chat-save-btn" title="Save current design to the library">
            ${$.save} Save to Designs
          </button>
        `,z.querySelector("button").addEventListener("click",()=>{fo()}),k.insertAdjacentElement("afterend",z)}else k&&!k.hasAttribute("hidden")&&(H(N),H(k));if(w)if(M.message)ee(w),w.innerHTML=sa(M.message);else if(we)H(w);else{let z=w.textContent||"";(z.includes("<|channel|>")||z.includes('"operations"')||z.includes('"assistant_message"')||z.includes("<file ")||z.includes("<message>"))&&(H(w),w.innerHTML="")}let X=M.missing_files||[];if((M.truncated||X.length>0)&&w){let z;X.length>0?z=`The following pages are linked in the navigation but were NOT created yet: ${X.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:z="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let K=document.getElementById("prompt-input");K&&!R.get("aiStreaming")&&(I&&(I.textContent="Generating remaining files..."),k&&(k.classList.remove("vs-files-done"),ee(k)),K.value=z,K.dataset.actionType="free_prompt",ra())},800)}if(M.conversation_id){R.set("activeConversationId",M.conversation_id);try{localStorage.setItem("vs-active-conversation",M.conversation_id)}catch{}}let Q=[...he,...D];if(Q.length>0){let z=Q.map(Le=>Le.path||Le),K=z.some(Le=>Le==="index.php"),te=z.filter(Le=>Le.endsWith(".php")&&!Le.includes("/")&&Le!=="index.php"),ge=K&&te.length>0,de;ge?de="index.php":te.length>0?de=te[0]:de=K?"index.php":null,qn(de),R.set("previewDirty",!0),ws({silent:!0})}Oc(),Zc(),Xo(),o.removeEventListener("scroll",b),o.scrollTop=o.scrollHeight},onEvaluation(M){let D=(M==null?void 0:M.issues)||[];if(D.length===0)return;let O={error:0,warning:0,info:0};D.forEach(pe=>O[pe.severity]=(O[pe.severity]||0)+1);let X={error:0,warning:1,info:2},Q=[...D].sort((pe,Ne)=>(X[pe.severity]??3)-(X[Ne.severity]??3)),z=Q.filter(pe=>pe.severity!=="info"),K=Q.filter(pe=>pe.severity==="info"),te=[];O.error>0&&te.push(`${O.error} error${O.error!==1?"s":""}`),O.warning>0&&te.push(`${O.warning} warning${O.warning!==1?"s":""}`),O.info>0&&te.push(`${O.info} suggestion${O.info!==1?"s":""}`);let ge=pe=>pe==="error"?"var(--vs-error, #ef4444)":pe==="warning"?"var(--vs-warning, #d97706)":"var(--vs-text-ghost)",de=pe=>pe==="error"?"rgba(239,68,68,0.08)":pe==="warning"?"rgba(217,119,6,0.08)":"var(--vs-bg-raised)",Le=pe=>{let Ne=pe.file?` in ${pe.file}`:"",Gs=pe.suggested_fix?`

Suggested approach: ${pe.suggested_fix}`:"";return`Review this suggestion and apply if appropriate \u2014 ${pe.severity}${Ne}: ${pe.description}${Gs}`},xe=(pe,Ne)=>`
        <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${ge(pe.severity)}; background: ${de(pe.severity)};">${y(pe.severity)}</span>
            <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(pe.category||"")}</span>
            ${pe.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(pe.file)}${pe.line?":"+pe.line:""}</span>`:""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(pe.description||"")}</div>
          ${pe.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(pe.suggested_fix)}</div>`:""}
          <div style="margin-top: 4px; text-align: right;">
            <button class="vs-eval-add-to-chat" data-eval-idx="${Ne}" style="
              background: none; border: none; cursor: pointer; padding: 2px 0;
              font-size: 11px; color: var(--vs-accent); opacity: 0.7;
              transition: opacity 0.15s ease;
            " onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'">Add to chat \u2192</button>
          </div>
        </div>
      `,Be=z.map((pe,Ne)=>xe(pe,Ne)).join(""),be=K.length>0?`
        <details style="border-top: 1px solid var(--vs-border-subtle);">
          <summary style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; cursor: pointer; user-select: none; font-size: 11px; color: var(--vs-text-ghost); list-style: none;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            ${K.length} additional suggestion${K.length!==1?"s":""}
          </summary>
          ${K.map((pe,Ne)=>xe(pe,z.length+Ne)).join("")}
        </details>
      `:"",Pe=O.error>0?"error":O.warning>0?"warning":"info",le=ge(Pe),He=`
        <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${Pe==="error"?"rgba(239,68,68,0.15)":Pe==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)"}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
          <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${le}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Expert Review \xB7 ${te.join(", ")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div style="border-top: 1px solid var(--vs-border-subtle);">
            <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
            ${Be}
            ${be}
          </div>
        </details>
      `,et;k&&!k.hasAttribute("hidden")?(k.insertAdjacentHTML("afterend",He),et=k.nextElementSibling):w?(w.insertAdjacentHTML("afterend",He),et=w.nextElementSibling):(g.insertAdjacentHTML("beforeend",He),et=g.lastElementChild),et&&et.addEventListener("click",pe=>{let Ne=pe.target.closest(".vs-eval-add-to-chat");if(!Ne)return;pe.preventDefault();let Gs=parseInt(Ne.dataset.evalIdx,10),es=Q[Gs];if(!es)return;let vt=document.getElementById("prompt-input");if(!vt)return;let Ie=Le(es),Ue=vt.value.trim();vt.value=Ue?Ue+`

`+Ie:Ie,vt.focus(),vt.style.height="auto",vt.style.height=Math.min(vt.scrollHeight,200)+"px",vt.selectionStart=vt.selectionEnd=vt.value.length,Ne.textContent="\u2713 Added",Ne.style.opacity="1",setTimeout(()=>{Ne.textContent="Add to chat \u2192",Ne.style.opacity="0.7"},1500)}),h()},onWarning(M){M.toLowerCase().includes("truncat")||E&&(E.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${y(M)}</div>
        `)},onError(M){clearTimeout(Z),Z=null,clearInterval(se),H(f),H(x),j&&(j.textContent=M.message||"Something went wrong.",ee(j)),Oc(),N&&H(N),k&&he.length>0&&(k.classList.add("vs-files-done"),I&&(I.textContent="Files updated (partial)"))}}),R.set("aiStreaming",!1),document.body.classList.remove("vs-ai-streaming"),ae&&(ae.disabled=!1,ae.classList.remove("opacity-50"))}function Fc(){var p;Xc.innerHTML=`
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
            <h1 class="vs-login-title">${xs?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${xs?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${xs?`
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
                ${xs?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${xs?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${xs?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${$.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${xs?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${xs?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
        ${(R.get("theme")||"light")==="light"?$.sun:$.moon}
      </button>
    </div>
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let d=e.type==="password";e.type=d?"text":"password",t.innerHTML=d?$.eyeOff:$.eye,t.title=d?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let d=ii();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=d==="light"?$.sun:$.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(d=>{d.addEventListener("click",()=>{let v=document.getElementById(d.dataset.toggleTarget);if(!v)return;let m=v.type==="password";v.type=m?"text":"password",d.innerHTML=m?$.eyeOff:$.eye,d.title=m?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),r=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var v,m,b;o.classList.add("hidden"),i.classList.remove("hidden");let d=document.getElementById("forgot-content");try{let g=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((v=g==null?void 0:g.data)==null?void 0:v.mode)||"file")==="email"?(d.innerHTML=`
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
          `,(m=document.getElementById("forgot-form"))==null||m.addEventListener("submit",async x=>{var T,N,j;x.preventDefault();let w=document.getElementById("forgot-message"),k=document.getElementById("forgot-email"),E=x.target.querySelector('button[type="submit"]'),I=(T=k==null?void 0:k.value)==null?void 0:T.trim();if(I){E&&(E.disabled=!0,E.textContent="Sending...");try{let q=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:I})})).json();w&&(q.ok?(w.textContent=((N=q.data)==null?void 0:N.message)||"Recovery link sent. Check your inbox.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",k&&(k.value="")):(w.textContent=((j=q.error)==null?void 0:j.message)||"Failed to send recovery email.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),w.classList.remove("hidden"))}catch{w&&(w.textContent="Network error. Please try again.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}finally{E&&(E.disabled=!1,E.textContent="Send Recovery Link")}}})):(d.innerHTML=`
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
                  <button type="button" data-toggle-target="forgot-new-password" class="vs-login-eye" title="Show password">${$.eye}</button>
                </div>
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
            </form>
          `,n(),(b=document.getElementById("forgot-form"))==null||b.addEventListener("submit",async x=>{var T,N,j;x.preventDefault();let w=document.getElementById("forgot-message"),k=(T=document.getElementById("forgot-email"))==null?void 0:T.value,E=(N=document.getElementById("forgot-new-password"))==null?void 0:N.value;if(!k||!E)return;let I=await C.post("/auth/reset-password",{email:k,new_password:E});I.ok?(w&&(w.textContent="Password reset. You can now sign in with your new password.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",w.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):w&&(w.textContent=((j=I.error)==null?void 0:j.message)||"Reset failed. Make sure the .reset file exists in _data/.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}))}catch{d.innerHTML=`
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
              <button type="button" data-toggle-target="token-new-password" class="vs-login-eye" title="Show password">${$.eye}</button>
            </div>
          </div>
          <div>
            <label class="vs-input-label">Confirm Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-confirm-password" type="password" required minlength="8" class="vs-input" placeholder="Confirm your password">
              <button type="button" data-toggle-target="token-confirm-password" class="vs-login-eye" title="Show password">${$.eye}</button>
            </div>
          </div>
          <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
        </form>
      `,n(),(p=document.getElementById("token-reset-form"))==null||p.addEventListener("submit",async m=>{var x,w,k,E;m.preventDefault();let b=document.getElementById("forgot-message"),h=(x=document.getElementById("token-new-password"))==null?void 0:x.value,g=(w=document.getElementById("token-confirm-password"))==null?void 0:w.value,f=m.target.querySelector('button[type="submit"]');if(!h||h.length<8){b&&(b.textContent="Password must be at least 8 characters.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden"));return}if(h!==g){b&&(b.textContent="Passwords do not match.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden"));return}f&&(f.disabled=!0,f.textContent="Resetting...");try{let T=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:c,new_password:h})})).json();b&&(T.ok?(b.textContent=((k=T.data)==null?void 0:k.message)||"Password reset. You can now sign in.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",b.classList.remove("hidden"),m.target.querySelectorAll("input").forEach(N=>N.disabled=!0),f&&(f.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(b.textContent=((E=T.error)==null?void 0:E.message)||"Reset failed. The link may have expired.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden")))}catch{b&&(b.textContent="Network error. Please try again.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden"))}finally{f&&(f.disabled=!1,f.textContent="Reset Password")}}))}let u=document.getElementById("login-form");u&&u.addEventListener("submit",async d=>{var g,f,x,w;d.preventDefault();let v=(g=document.getElementById("login-email"))==null?void 0:g.value,m=(f=document.getElementById("login-password"))==null?void 0:f.value,b=document.getElementById("login-error");if(!v||!m)return;let h=await C.post("/auth/login",{email:v,password:m});h.ok&&((x=h.data)!=null&&x.token)?(R.batch(()=>{R.set("user",h.data.user),R.set("sessionToken",h.data.token)}),Jc()):b&&(b.textContent=((w=h.error)==null?void 0:w.message)||"Invalid email or password.",b.classList.remove("hidden"))}),Xo()}function ea(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function sa(e){if(!e)return"";if(!window.marked)return y(e);let t=window.marked.parse(e);return Pg(t)}function Pg(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),r=a?a.split(`
`):[];if(r.length<=Vm)return;let l=r.slice(0,Wm).join(`
`)+`
...`,c=document.createElement("div");c.className="vs-code-collapse",c.setAttribute("data-code-collapse","1");let u=document.createElement("pre");u.className="vs-code-collapse-preview",u.setAttribute("data-code-preview","1");let p=document.createElement("code");o!=null&&o.className&&(p.className=o.className),p.textContent=l,u.appendChild(p),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let d=document.createElement("button");d.type="button",d.className="vs-code-collapse-toggle",d.setAttribute("data-code-toggle","1"),d.setAttribute("data-lines",String(r.length)),d.setAttribute("aria-expanded","false"),d.textContent=`More (${r.length} lines)`;let v=n.parentNode;v&&(v.replaceChild(c,n),c.appendChild(u),c.appendChild(n),c.appendChild(d))}),t.innerHTML}function Rg(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Jc();})();
