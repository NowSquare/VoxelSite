(()=>{var Mn=e=>{throw TypeError(e)};var Vs=(e,t,s)=>t.has(e)||Mn("Cannot "+s);var de=(e,t,s)=>(Vs(e,t,"read from private field"),s?s.call(e):t.get(e)),Ae=(e,t,s)=>t.has(e)?Mn("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),Fe=(e,t,s,n)=>(Vs(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),Je=(e,t,s)=>(Vs(e,t,"access private method"),s);var Ze,Xe,bt,Qe,Gt,Gs,Ws=class{constructor(t={}){Ae(this,Gt);Ae(this,Ze,new Map);Ae(this,Xe,new Map);Ae(this,bt,!1);Ae(this,Qe,new Map);for(let[s,n]of Object.entries(t))de(this,Ze).set(s,n)}get(t,s=void 0){return de(this,Ze).has(t)?de(this,Ze).get(t):s}set(t,s){let n=de(this,Ze).get(t);n!==s&&(de(this,Ze).set(t,s),de(this,bt)?de(this,Qe).has(t)?de(this,Qe).get(t).newValue=s:de(this,Qe).set(t,{newValue:s,oldValue:n}):Je(this,Gt,Gs).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return de(this,Xe).has(t)||de(this,Xe).set(t,new Set),de(this,Xe).get(t).add(s),()=>{var n;(n=de(this,Xe).get(t))==null||n.delete(s)}}batch(t){if(de(this,bt)){t();return}Fe(this,bt,!0),de(this,Qe).clear();try{t()}finally{Fe(this,bt,!1);for(let[s,{newValue:n,oldValue:o}]of de(this,Qe))Je(this,Gt,Gs).call(this,s,n,o);de(this,Qe).clear()}}toJSON(){return Object.fromEntries(de(this,Ze))}};Ze=new WeakMap,Xe=new WeakMap,bt=new WeakMap,Qe=new WeakMap,Gt=new WeakSet,Gs=function(t,s,n){let o=de(this,Xe).get(t);if(o)for(let a of o)try{a(s,n)}catch(l){console.error(`[state] Error in "${t}" listener:`,l)}let i=de(this,Xe).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(l){console.error("[state] Error in wildcard listener:",l)}};var P=new Ws({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});P.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});P.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Kt,Mt,Tt,It,At,_t,et,xs,Ys,Ks=class{constructor(){Ae(this,et);Ae(this,Kt,[]);Ae(this,Mt,null);Ae(this,Tt,!1);Ae(this,It,null);Ae(this,At,null);Ae(this,_t,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return de(this,Kt).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return Fe(this,Mt,t),this}beforeEach(t){return Fe(this,It,t),this}start(){de(this,Tt)||(Fe(this,Tt,!0),window.addEventListener("hashchange",()=>Je(this,et,xs).call(this)),Je(this,et,xs).call(this))}navigate(t){window.location.hash=`/${t}`}refresh(){Fe(this,At,null),Je(this,et,xs).call(this)}get current(){return Je(this,et,Ys).call(this)}};Kt=new WeakMap,Mt=new WeakMap,Tt=new WeakMap,It=new WeakMap,At=new WeakMap,_t=new WeakMap,et=new WeakSet,xs=async function(){if(de(this,_t))return;let t=Je(this,et,Ys).call(this),s=de(this,At);if(!(t===s&&de(this,Tt))){if(de(this,It)&&s!==null){Fe(this,_t,!0);try{if(await de(this,It).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{Fe(this,_t,!1)}}Fe(this,At,t);for(let n of de(this,Kt)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,l)=>{i[a]=decodeURIComponent(o[l+1])}),P.batch(()=>{P.set("route",n.pattern),P.set("routeParams",i)}),n.handler(i);return}}de(this,Mt)?(P.set("route","404"),de(this,Mt).call(this,t)):this.navigate("chat")}},Ys=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var je=new Ks;var In="/_studio/api/router.php";async function ws(e,t,s=null,n={}){let o={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let a=An();a&&(o["X-VS-Token"]=a)}s!==null&&(o["Content-Type"]="application/json");let i={method:e,headers:o,credentials:"same-origin",...n};s!==null&&(i.body=JSON.stringify(s));try{let[a,l]=t.split("?"),r=`${In}?_path=${encodeURIComponent(a)}${l?"&"+l:""}`,p=await fetch(r,i),c=await p.json();return p.status===401?(P.get("user")&&P.set("user",null),c!=null&&c.error?{ok:!1,error:c.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!c.ok&&c.error?(c.error.code==="demo_mode"&&window.showToast&&window.showToast(c.error.message||"Demo mode \u2014 this action is disabled.","warning"),{ok:!1,error:c.error}):{ok:!0,data:c.data||c}}catch{return{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var S={get:(e,t)=>ws("GET",e,null,t),post:(e,t,s)=>ws("POST",e,t,s),put:(e,t,s)=>ws("PUT",e,t,s),delete:(e,t,s)=>ws("DELETE",e,t,s)};async function yt(e,t,s={}){var g,B;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onFile:a=()=>{},onDone:l=()=>{},onEvaluation:r=()=>{},onWarning:p=()=>{},onError:c=()=>{},signal:v=null}=s,d=An(),u={"Content-Type":"application/json",Accept:"text/event-stream"};d&&(u["X-VS-Token"]=d);let m=!1,h=0,w=0,b=t.conversation_id||null;try{let F=function(Z){if(!Z.trim())return;let ce="";for(let N of Z.split(`
`))N.startsWith(":")||N.startsWith("data: ")&&(ce+=N.slice(6));if(!ce)return;let R;try{R=JSON.parse(ce)}catch{return}switch(R.type||"message"){case"token":w++,n(R.content||"");break;case"status":o(R.message||"");break;case"conversation":b=R.conversation_id||b,i(R.conversation_id||"");break;case"file_complete":h++,a(R);break;case"done":m=!0,l(R);break;case"evaluation":r(R);break;case"warning":p(R.message||"");break;case"error":c(R);break}},E={method:"POST",headers:u,credentials:"same-origin",body:JSON.stringify(t)};v&&(E.signal=v);let[$,M]=e.split("?"),_=`${In}?_path=${encodeURIComponent($)}${M?"&"+M:""}`,j=await fetch(_,E);if(!j.ok){let Z=await j.json().catch(()=>null);c({code:((g=Z==null?void 0:Z.error)==null?void 0:g.code)||"http_error",message:((B=Z==null?void 0:Z.error)==null?void 0:B.message)||`Server error (${j.status})`});return}let U=j.body.getReader(),Q=new TextDecoder,K="";for(;;){let{done:Z,value:ce}=await U.read();if(Z)break;K+=Q.decode(ce,{stream:!0});let R=K.split(`

`);K=R.pop();for(let C of R)F(C)}if(K.trim()&&F(K),!m){let Z=b;Z?(o("Waiting for server to finish..."),await Tn(Z,{onDone:l,onError:c,onFile:a,onStatus:o})):(h>0||w>0)&&l({files_modified:[],message:"",soft_close:!0})}}catch(E){if(E.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(h>0||w>0){let $=b;$?(o("Server is still generating \u2014 waiting for completion..."),await Tn($,{onDone:l,onError:c,onFile:a,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else c({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function Tn(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var l;let a=0;for(let r=0;r<120;r++){await new Promise(p=>setTimeout(p,3e3));try{let{ok:p,data:c}=await S.get(`/ai/conversations/${e}`);if(!p||!((l=c==null?void 0:c.conversation)!=null&&l.prompts))continue;let v=c.conversation.prompts,d=v[v.length-1];if(!d)continue;let u=d.files_modified?JSON.parse(d.files_modified):[];if(u.length>a){for(let m=a;m<u.length;m++)n({path:u[m],action:"write"});a=u.length}if(d.status==="streaming"){let m=Math.round((Date.now()-new Date(d.created_at).getTime())/1e3);o(`Server is still generating... (${m}s)`);continue}d.status==="success"?t({message:d.ai_message||"",files_modified:u,revision_id:d.revision_id||null,polled:!0}):d.status==="partial"?t({message:d.ai_message||"",files_modified:u,partial:!0,polled:!0}):s({code:"generation_failed",message:d.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function An(){return P.get("sessionToken")}var Xo="data-theme",Js="dark";function _n(){let e=P.get("theme")||localStorage.getItem("vs-theme")||Js;return Pn(e),e}function Pn(e){let t=e||Js;return document.documentElement.setAttribute(Xo,t),localStorage.setItem("vs-theme",t),P.set("theme",t),t}function ks(){let e=P.get("theme")||Js;return Pn(e==="dark"?"light":"dark")}var jn=typeof document<"u"?document.createElement("span"):null;function y(e){return e?(jn.textContent=e,jn.innerHTML):""}function le(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var Qo={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function Yt(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(Qo))if(t.endsWith(s))return n;return"plaintext"}function Zs(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function Xs(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),l=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:l===1?"Yesterday":l<30?`${l} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function Jt(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function Zt(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function Xt(e,t=40){if(!e)return"";let s=e.replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/+$/,"");return s.length>t&&(s=s.substring(0,t-1)+"\u2026"),s}function he(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function fe(e,t){let s=null;e.addEventListener("mousedown",n=>{s=n.target}),e.addEventListener("click",n=>{n.target===e&&s===e&&t(n)})}function be({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var c,v;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let l=document.createElement("div");l.id="vs-confirm-overlay",l.className="vs-modal-overlay",l.innerHTML=`
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
    `;let r=d=>{d.key==="Escape"&&(d.preventDefault(),p(!1))},p=d=>{document.removeEventListener("keydown",r),he(l),i(d)};document.body.appendChild(l),requestAnimationFrame(()=>l.classList.add("is-visible")),fe(l,()=>p(!1)),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>p(!1)),(v=document.getElementById("vs-confirm-ok"))==null||v.addEventListener("click",()=>p(!0)),document.addEventListener("keydown",r),setTimeout(()=>{var d;return(d=document.getElementById("vs-confirm-ok"))==null?void 0:d.focus()},220)})}function Qs({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:l="",inputPattern:r=""}){return new Promise(p=>{var w,b;let c=document.getElementById("vs-prompt-overlay");c&&c.remove();let v=document.createElement("div");v.id="vs-prompt-overlay",v.className="vs-modal-overlay";let d=r?` pattern="${y(r)}"`:"",u=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${y(n)}" style="resize: vertical;">${y(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${y(n)}" value="${y(o)}"${d}>`;v.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${y(e)}</h2>
          ${t?`<p class="vs-modal-desc">${y(t)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${y(s)}</label>`:""}
          ${u}
          ${l?`<p class="text-xs text-vs-text-ghost" style="margin-top: 6px;">${y(l)}</p>`:""}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${y(i)}</button>
        </div>
      </div>
    `;let m=g=>{he(v),p(g)};document.body.appendChild(v),requestAnimationFrame(()=>v.classList.add("is-visible"));let h=v.querySelector("#vs-prompt-input");setTimeout(()=>h==null?void 0:h.focus(),220),fe(v,()=>m(null)),(w=v.querySelector("#vs-prompt-cancel"))==null||w.addEventListener("click",()=>m(null)),(b=v.querySelector("#vs-prompt-ok"))==null||b.addEventListener("click",()=>{m(((h==null?void 0:h.value)||"").trim())}),h==null||h.addEventListener("keydown",g=>{a==="textarea"?g.key==="Enter"&&(g.metaKey||g.ctrlKey)&&(g.preventDefault(),m(((h==null?void 0:h.value)||"").trim())):g.key==="Enter"&&(g.preventDefault(),m(((h==null?void 0:h.value)||"").trim())),g.key==="Escape"&&(g.preventDefault(),m(null))})})}var qe=!1,Es=null,xt=[],en=!1,Rn=!1,Ee={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function ln(){qe=!qe,Jn(),oe({type:"vx-editor:toggle",active:qe}),qe||(ze(),cn(),Ge(),kt(),Es=null,Lt=!1)}function Qt(){return qe}function es(){qe&&(qe=!1,Jn(),oe({type:"vx-editor:toggle",active:!1}),ze(),cn(),Ge(),kt(),Es=null,Lt=!1)}function zn(){if(Rn)return;Rn=!0,window.addEventListener("message",ei);let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{Lt&&On(),qe&&setTimeout(()=>oe({type:"vx-editor:toggle",active:!0}),200)})}function ei(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":Es=e.data,ai(e.data);break;case"vx-editor:text-changed":an(e.data);break;case"vx-editor:image-changed":Ri(e.data);break;case"vx-editor:element-deleted":rn(e.data);break;case"vx-editor:deselect":ze(),cn(),Ge(),Es=null;break;case"vx-editor:save-request":ts();break;case"vx-editor:editing-started":ti(e.data);break;case"vx-editor:editing-ended":On();break;case"vx-editor:selection-state":si(e.data);break;case"vx-editor:element-rect":ni(e.data);break;case"vx-editor:richtext-link-request":Gn();break;case"vx-editor:add-section-request":Ii(e.data);break;case"vx-editor:section-moved":Ni(e.data);break;case"vx-editor:bridge-ready":qe&&oe({type:"vx-editor:toggle",active:!0});break}}var Lt=!1,dn=!1,rt=null,Pt={},sn="P";function ti(e){Lt=!0,dn=!!e.hasPhp,rt=e.rect||null,Pt={},sn=e.tagName||"P",ze(),oi()}function On(){Lt=!1,dn=!1,rt=null,Pt={},Wn()}function si(e){if(Lt){if(e.elementRect&&(rt=e.elementRect,Un()),!e.hasSelection){Pt={},Hn();return}Pt=e.formatting||{},sn=e.blockTag||sn,Hn()}}function ni(e){Lt&&e.rect&&(rt=e.rect,Un())}function Un(){let e=document.getElementById("vx-richtext-toolbar");e&&Vn(e)}function oi(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),Vn(e),ii(e),e.classList.add("vx-rt-visible")}function Vn(e){if(!rt)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+rt.left,o=s.top+rt.top,i=rt.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function ii(e){let t=Pt,s=dn;e.innerHTML=`<div class="vx-rt-actions">
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
    <div class="vx-rt-divider"></div>
    <button class="vx-rt-btn vx-rt-btn-clear" data-cmd="removeFormat" title="Clear formatting">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
    </button>
    `}
    <div class="vx-rt-divider"></div>
    <button class="vx-rt-btn vx-rt-btn-cancel" data-action="cancel" title="Cancel (Esc)">
      Cancel
    </button>
    <button class="vx-rt-btn vx-rt-btn-save" data-action="save" title="Save (\u2318\u21B5)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      Save
    </button>
  </div>`,e.querySelectorAll("[data-cmd]").forEach(i=>{i.addEventListener("click",a=>{a.stopPropagation();let l=i.dataset.cmd;if(l==="insertLink"){Gn();return}oe({type:"vx-editor:richtext-command",command:l})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",i=>{i.stopPropagation(),oe({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",i=>{i.stopPropagation(),oe({type:"vx-editor:save-edit"})})}function Hn(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=Pt,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function Wn(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function cn(){Wn()}function Gn(){let e=prompt("Enter URL:");if(e!==null){let t=e.trim();oe(t?{type:"vx-editor:richtext-command",command:"insertLink",value:t}:{type:"vx-editor:richtext-command",command:"removeLink"})}}function ai(e){let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,hasImage:i}=e,a=document.getElementById("preview-iframe");if(!a)return;let l=a.getBoundingClientRect();t.style.left=`${l.left+n.left+n.width/2}px`,t.style.top=`${l.top+n.top-8}px`,t.style.transform="translate(-50%, -100%)";let r="";o&&(r+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      <span>Edit</span></button>`),i&&(r+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),r+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(r+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),r+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,r+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let p=Cs(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${p}</div><div class="vx-tb-actions">${r}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(c=>{c.addEventListener("click",v=>{v.stopPropagation(),ri(c.dataset.action,e)})})}function ze(){let e=document.getElementById("vx-context-toolbar");e&&e.classList.remove("vx-tb-visible")}function Cs(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function ri(e,t){switch(e){case"edit-text":oe({type:"vx-editor:start-edit",mode:"text"}),ze();break;case"swap-image":_i(t);break;case"edit-style":di(t);break;case"edit-link":ji(t);break;case"delete":li(t);break;case"ask-ai":Ti(t);break}}function li(e){ze();let t=Cs(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${Rt(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>n.remove(),200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),fe(n,o),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{oe({type:"vx-editor:delete-element"}),o()})}var Se=new Set,lt="",wt=null,Ls="text",tt="padding",ot="all",Et="all",st="tl",$t="",dt=!1;function Ge({revertUnsaved:e=!0}={}){e&&dt&&lt&&(oe({type:"vx-editor:update-classes",classes:lt.split(" ").filter(Boolean),silent:!0}),Se=new Set(lt.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>t.remove(),200)),dt=!1,wt=null,Ls="text",tt="padding",ot="all",Et="all",st="tl",$t=""}function di(e){ze(),Ge();let t=(e.classList||[]).filter(o=>o.trim());Se=new Set(t),lt=t.join(" "),dt=!1,wt=null,Ls=zi(t),tt="padding",ot="all",Et="all",st="tl",$t="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${Cs(e.tagName,t)}</span>
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
      ${nn()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),$s(s),s.__vxOnResize=()=>$s(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=Yn(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),wt=null,_e(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>Ge()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),Ge())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{Se=new Set(lt.split(" ").filter(Boolean)),dt=!1,oe({type:"vx-editor:update-classes",classes:[...Se],silent:!0}),_e(on())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>Mi(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&($t=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=nn(),_e(on()))}),_e("typography")}function nn(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=$t===t.id,n=t.id?[...Se].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function on(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function _e(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:ci,spacing:pi,colors:vi,layout:ui,borders:mi,effects:gi,classes:hi};t.innerHTML=(s[e]||s.classes)(),Bi(t);let n=t.querySelector(".vx-cm-active");n&&n.scrollIntoView({block:"nearest"})}function ci(){let e=we(/^font-(sans|serif|mono)$/)||"",t=we(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=we(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=we(/^text-(left|center|right|justify)$/)||"text-left",o=we(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=we(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=we(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",l=we(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Le("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${Le("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,Ee.sizes.map(r=>({label:r,value:`text-${r}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Le("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,Ee.weights.map(r=>({label:r,value:`font-${r}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${fi(Ee.aligns.map(r=>({value:`text-${r}`,label:r,icon:$i(r)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${Le("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,Ee.leadings.map(r=>({label:r,value:`leading-${r}`})))}
        ${Le("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,Ee.trackings.map(r=>({label:r,value:`tracking-${r}`})))}
        ${Le("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,Ee.transforms.map(r=>({label:r,value:r})))}
        ${Le("Decoration","^(no-underline|underline|line-through)$",l,Ee.decorations.map(r=>({label:r,value:r})))}
      </div>
    </div>
  `}function pi(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[tt]||(tt="padding"),e[tt].prefixes[ot]||(ot="all");let t=e[tt],s=t.prefixes[ot],n=xi(s),o=ki(s)||"",i=tt==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${Kn(Object.keys(e).map(a=>({value:a,label:e[a].label})),tt,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${ot===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Dn(a)}">
            ${Ei(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${Dn(ot)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${Ee.compactSpacings.map(a=>{let l=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Ct(l)?" vx-sp-pill-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${Ct(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function vi(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=Ls||"text",s=t,n=wi(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${Ee.specialColors.map(a=>{let l=`${s}-${a.name}`,r=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,p=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${Ct(l)?" vx-sp-dot-active":""}" data-set="${l}" data-pattern="${n}" style="${r}${p}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=["50","100","200","300","400","500","600","700","800","900","950"];return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-matrix">
      ${Ee.colors.map(a=>`
        <div class="vx-cm-row" title="${a.name}">
          ${i.map(l=>{let r=`${s}-${a.name}-${l}`;return`<button class="vx-cm-cell${Ct(r)?" vx-cm-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false" style="background:${a.shades[l]}" title="${a.name}-${l}"></button>`}).join("")}
        </div>
      `).join("")}
    </div>
  </div>`,o}function ui(){let e=yi(),t=we(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=we(/^gap(?:-[xy])?-/)||"",a=we(/^grid-cols-\d+$/)||"",l=we(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${bi(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${Le("Direction","^flex-(row|col|row-reverse|col-reverse)$",we(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${Le("Justify","^justify-(start|center|end|between|around|evenly)$",we(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${Le("Align","^items-(start|center|end|stretch|baseline)$",we(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${Le("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...Ee.gaps.map(r=>({label:r,value:`gap-${r}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${Le("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...Ee.gridCols.map(r=>({label:r,value:`grid-cols-${r}`}))])}
          ${Le("Rows","^grid-rows-\\d+$",l,[{label:"Auto",value:""},...Ee.gridRows.map(r=>({label:r,value:`grid-rows-${r}`}))])}
          ${Le("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...Ee.gaps.slice(1).map(r=>({label:r,value:`gap-${r}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${Le("Position","^(static|relative|absolute|fixed|sticky)$",t,Ee.positions.map(r=>({label:r,value:r})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${Le("Top","^top-",we(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Ee.coordinates.map(r=>({label:r,value:`top-${r}`})))}
          ${Le("Right","^right-",we(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Ee.coordinates.map(r=>({label:r,value:`right-${r}`})))}
          ${Le("Bottom","^bottom-",we(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Ee.coordinates.map(r=>({label:r,value:`bottom-${r}`})))}
          ${Le("Left","^left-",we(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Ee.coordinates.map(r=>({label:r,value:`left-${r}`})))}
        </div>
      </div>
    `:""}
  `}function mi(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=Et==="all"?"all":st;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${Ee.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Ct(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${Le("Style","^border-(solid|dashed|dotted|double|none)$",we(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...Ee.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${Kn([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],Et==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${st==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${st==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${st==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${st==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${Et==="all"?"ALL":st.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${Ee.radii.map(s=>{let n=Ci(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${Ct(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${Li(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function gi(){let e=Si();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${Ct(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function hi(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...Se].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function Le(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${jt(o.value)}"${s===o.value?" selected":""}>${Rt(o.label)}</option>`).join("")}
    </select>
  </div>`}function Kn(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${Rt(i.label)}</button>`).join("")}
  </div>`}function fi(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${jt(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function bi(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function yi(){let e=we(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function xi(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function wi(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function ki(e){let t=we(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function Dn(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function Ei(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function $i(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function Ci(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function Li(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function Si(){let e=we(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function Ct(e){let t=$t;return Se.has(t?t+":"+e:e)}function tn(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=$t,i=o?o+":":"",a=t?new RegExp(t):null,l=e?i+e:"",r=!!l&&Se.has(l);if(a)for(let c of[...Se])if(o){if(c.startsWith(i)){let v=c.slice(i.length);a.test(v)&&Se.delete(c)}}else!/^(sm|md|lg|xl|2xl):/.test(c)&&a.test(c)&&Se.delete(c);l&&(!s||!r)&&Se.add(l),dt=!0,oe({type:"vx-editor:update-classes",classes:[...Se],silent:!0});let p=document.getElementById("vx-sp-breakpoints");if(p&&(p.innerHTML=nn()),n){let c=document.querySelector(".vx-color-matrix"),v=c?c.scrollTop:0;if(_e(on()),v){let d=document.querySelector(".vx-color-matrix");d&&(d.scrollTop=v)}}}function we(e){let t=$t;for(let s of Se)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function Bi(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";tn(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";tn(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{wt=wt===n.dataset.family?null:n.dataset.family,_e("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{wt=null,_e("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{Ls=n.dataset.cprop||"text",wt=null,_e("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{tt=n.dataset.spaceMode||"padding",ot="all",_e("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{ot=n.dataset.spaceSide||"all",_e("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{Et=n.dataset.radiusMode==="corners"?"corners":"all",_e("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{st=n.dataset.radiusCorner||"tl",Et="corners",_e("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");tn(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>_e("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{Se.add(i)}),dt=!0,oe({type:"vx-editor:update-classes",classes:[...Se],silent:!0}),s.value="",_e("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;Se.delete(i),dt=!0,oe({type:"vx-editor:update-classes",classes:[...Se],silent:!0}),o.remove()}}})}async function Mi(e){let t=[...Se].join(" ");if(t===lt){Ge({revertUnsaved:!1});return}let s=new Set(lt.split(" ").filter(Boolean)),n=new Set(t.split(" ").filter(Boolean)),o=[...n].filter(a=>!s.has(a)),i=[...s].filter(a=>!n.has(a));xt.push({type:"class-change",filePath:e.filePath,originalHTML:`class="${lt}"`,newHTML:`class="${t}"`,additions:o,removals:i,timestamp:Date.now()}),dt=!1,Ge({revertUnsaved:!1}),pe("Saving & compiling\u2026"),await ts(),oe({type:"vx-editor:update-classes",classes:[...Se],silent:!0}),setTimeout(()=>{let a=document.getElementById("preview-iframe");a&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload","*")},500)}function Yn(e,t){let s=!1,n,o,i,a,l=!1,r=v=>{if(v.target.closest("button, input, select"))return;s=!0;let d=v.touches?v.touches[0]:v;n=d.clientX,o=d.clientY;let u=e.getBoundingClientRect();i=u.left,a=u.top,t.style.cursor="grabbing",v.preventDefault(),l||(l=!0,document.addEventListener("mousemove",p),document.addEventListener("touchmove",p,{passive:!1}),document.addEventListener("mouseup",c),document.addEventListener("touchend",c))},p=v=>{if(!s)return;let d=v.touches?v.touches[0]:v,u=12,m=e.getBoundingClientRect(),h=m.width||300,w=m.height||500,b=i+d.clientX-n,g=a+d.clientY-o,B=u,E=Math.max(u,window.innerWidth-h-u),$=52,M=Math.max($,window.innerHeight-w-u),_=Math.min(Math.max(b,B),E),j=Math.min(Math.max(g,$),M);e.style.left=`${_}px`,e.style.top=`${j}px`,e.style.right="auto"},c=()=>{s&&(s=!1,t.style.cursor="",l&&(l=!1,document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c)))};return t.addEventListener("mousedown",r),t.addEventListener("touchstart",r,{passive:!1}),()=>{t.removeEventListener("mousedown",r),t.removeEventListener("touchstart",r),l&&(document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c))}}var nt=null;function kt(){let e=document.getElementById("vx-ai-panel");e&&(nt&&(nt.abort(),nt=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>e.remove(),180))}function Ti(e){ze(),Ge(),kt();let t=Cs(e.tagName,e.classList),s=(e.text||"").substring(0,80).replace(/\s+/g," ").trim(),n=document.createElement("div");n.id="vx-ai-panel",n.className="vx-ai-panel",n.tabIndex=-1,n.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${Rt(t)}</span>
      </div>
      <div class="vx-ai-header-right">
        <span class="vx-sp-drag-hint">\u22EE\u22EE</span>
        <button class="vx-sp-close" id="vx-ai-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    ${s?`<div class="vx-ai-preview">${Rt(s.length>=78?s+"\u2026":s)}</div>`:""}
    <div class="vx-ai-body">
      <div class="vx-ai-input-wrap">
        <textarea class="vx-ai-input" id="vx-ai-input" rows="2" placeholder="Describe your changes\u2026" spellcheck="false"></textarea>
        <button class="vx-ai-send" id="vx-ai-send" title="Generate (Enter)">
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
    </div>`,document.body.appendChild(n),$s(n),n.__vxOnResize=()=>$s(n),window.addEventListener("resize",n.__vxOnResize),requestAnimationFrame(()=>n.classList.add("vx-ai-visible")),n.__vxDestroyDrag=Yn(n,n.querySelector("#vx-ai-drag-handle"));let o=n.querySelector("#vx-ai-input"),i=n.querySelector("#vx-ai-send"),a=n.querySelector("#vx-ai-cancel-btn"),l=n.querySelector("#vx-ai-status"),r=n.querySelector("#vx-ai-status-text"),p=n.querySelector("#vx-ai-close");setTimeout(()=>o==null?void 0:o.focus(),200),p.addEventListener("click",()=>kt()),n.addEventListener("keydown",u=>{u.key==="Escape"&&(u.preventDefault(),kt())}),o.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),d())}),i.addEventListener("click",d),a.addEventListener("click",()=>{nt&&(nt.abort(),nt=null),v()});function c(){o.disabled=!0,i.hidden=!0,a.hidden=!1,l.hidden=!1,r.textContent="Reading your site\u2026"}function v(){o.disabled=!1,i.hidden=!1,a.hidden=!0,l.hidden=!0,o.focus()}async function d(){let u=o.value.trim();if(!u)return;kt(),oe({type:"vx-editor:show-ai-overlay",status:"AI is editing\u2026"}),nt=new AbortController;let m=e.outerHTML||"",h=e.filePath||ss();try{await yt("/ai/prompt",{user_prompt:u,action_type:"section_edit",page_scope:h,action_data:{path:h,sectionHtml:m.substring(0,15e3)}},{signal:nt.signal,onStatus(w){oe({type:"vx-editor:update-ai-status",status:w||"Working\u2026"})},onFile(){oe({type:"vx-editor:update-ai-status",status:"Applying changes\u2026"})},onToken(){oe({type:"vx-editor:update-ai-status",status:"Generating\u2026"})},onError(w){oe({type:"vx-editor:hide-ai-overlay"}),pe(w.message||"AI edit failed",!0)},onDone(w){if(nt=null,oe({type:"vx-editor:hide-ai-overlay"}),w.cancelled){pe("Generation cancelled",!1);return}(w.files_modified||[]).length>0?(pe("Section updated \u2713"),setTimeout(()=>{let g=document.getElementById("preview-iframe");g!=null&&g.contentWindow&&g.contentWindow.postMessage("voxelsite:reload","*")},400)):w.partial||pe("No changes made",!1)},onWarning(w){typeof window.showToast=="function"&&window.showToast(w,"warning")}})}catch(w){w.name!=="AbortError"&&pe("AI edit failed",!0),oe({type:"vx-editor:hide-ai-overlay"})}}}var Nn=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function Ii(e){ze(),Ge(),kt();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let b of Nn)(t.includes(b.id)||t.includes(b.label.toLowerCase()))&&s.add(b.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${Rt(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${Nn.map(b=>{let g=s.has(b.id);return`
            <button class="vx-section-card${g?" vx-section-card-exists":""}" data-section-type="${b.id}" data-section-label="${jt(b.label)}" data-section-desc="${jt(b.description)}">
              <div class="vx-section-card-icon">${b.icon}</div>
              <div class="vx-section-card-label">${b.label}</div>
              <div class="vx-section-card-desc">${b.description}</div>
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>n.remove(),200)},a=b=>{b.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),fe(n,i),n.tabIndex=-1,n.focus();let l=null,r=null,p=n.querySelector("#vx-section-footer"),c=n.querySelector("#vx-section-footer-type"),v=n.querySelector("#vx-section-instruction"),d=n.querySelector("#vx-section-generate"),u=n.querySelector("#vx-section-change"),m=n.querySelector(".vx-section-picker-grid"),h={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(b=>{b.addEventListener("click",()=>{l=b.dataset.sectionLabel,r=b.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(g=>g.classList.remove("vx-section-card-selected")),b.classList.add("vx-section-card-selected"),c.textContent=l,v.placeholder=h[l]||"Optional: describe what you want\u2026",v.value="",p.hidden=!1,m.classList.add("vx-section-grid-collapsed"),setTimeout(()=>v.focus(),100)})}),u.addEventListener("click",()=>{l=null,r=null,p.hidden=!0,m.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(b=>b.classList.remove("vx-section-card-selected"))});let w=()=>{if(!l)return;let b=v.value.trim();i(),Ai(e,l,r,b)};d.addEventListener("click",w),v.addEventListener("keydown",b=>{b.key==="Enter"&&(b.preventDefault(),w())})}async function Ai(e,t,s,n=""){oe({type:"vx-editor:show-ai-overlay",status:`Adding ${t}\u2026`});let o=e.filePath||ss(),i=new AbortController,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let l=Date.now(),r=0,p=()=>{if(r>0){let u=r.toLocaleString();oe({type:"vx-editor:update-ai-status",status:`Generating ${t}\u2026 (${u} tokens)`})}else Math.round((Date.now()-l)/1e3)>=6&&oe({type:"vx-editor:update-ai-status",status:`Preparing ${t}\u2026`})},c=setInterval(p,1e3),v=0,d=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await yt("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onStatus(u){oe({type:"vx-editor:update-ai-status",status:u||`Adding ${t}\u2026`})},onFile(){oe({type:"vx-editor:update-ai-status",status:"Writing files\u2026"})},onToken(){r++;let u=Date.now();u-v>500&&(v=u,p())},onError(u){clearInterval(c),oe({type:"vx-editor:hide-ai-overlay"}),pe(u.message||"Failed to add section",!0)},onDone(u){if(clearInterval(c),oe({type:"vx-editor:hide-ai-overlay"}),u.cancelled){pe("Generation cancelled",!1);return}(u.files_modified||[]).length>0?(pe(`${t} added \u2713`),setTimeout(()=>{let h=document.getElementById("preview-iframe");h!=null&&h.contentWindow&&h.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{oe({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{oe({type:"vx-editor:scroll-to-section",sectionIndex:d}),oe({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):u.partial||pe("No changes made",!1)},onWarning(u){typeof window.showToast=="function"&&window.showToast(u,"warning")}})}catch(u){clearInterval(c),u.name!=="AbortError"&&pe("Failed to add section",!0),oe({type:"vx-editor:hide-ai-overlay"})}}function _i(e){ze();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelector("[data-close]").addEventListener("click",s),fe(t,s),t.tabIndex=-1,t.focus(),Pi(t)}async function Pi(e){let t=e.querySelector("#vx-img-grid");try{let s=await S.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",()=>{oe({type:"vx-editor:swap-image",src:o.dataset.path}),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function ji(e){ze();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${jt(e.href||"")}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${jt(e.text||"")}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",s)),fe(t,s),document.getElementById("vx-link-save").addEventListener("click",()=>{oe({type:"vx-editor:update-link",href:document.getElementById("vx-link-href").value.trim(),text:document.getElementById("vx-link-text").value.trim()}),s()}),setTimeout(()=>{var o;return(o=document.getElementById("vx-link-href"))==null?void 0:o.focus()},100)}async function Ri(e){let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||ss();try{let a=await S.get(`/files/content?path=${encodeURIComponent(i)}`);if(!a.ok){console.warn("[VX] Cannot read file for image save:",i),pe("Save failed",!0);return}let l=a.data.content,r=!1,p=`src="${s}"`;if(l.includes(p)&&(l=l.replace(p,`src="${n}"`),r=!0),!r&&l.includes(s)&&(l=l.replace(s,n),r=!0),!r&&o){let v=qn(l,o,n);v!==!1&&(l=v,r=!0)}if(r){(await S.put("/files/content",{path:i,content:l})).ok?pe("Saved"):pe("Save failed",!0);return}let c=await S.get("/files");if(c.ok){let v=(c.data.files||[]).filter(d=>d.path.endsWith(".php")&&d.path!==i);for(let d of v){let u=await S.get(`/files/content?path=${encodeURIComponent(d.path)}`);if(!u.ok||!u.data.content)continue;let m=u.data.content;if(m.includes(p)&&(m=m.replace(p,`src="${n}"`),(await S.put("/files/content",{path:d.path,content:m})).ok)){pe(`Saved \u2192 ${d.path.split("/").pop()}`);return}if(m.includes(s)&&(m=m.replace(s,n),(await S.put("/files/content",{path:d.path,content:m})).ok)){pe(`Saved \u2192 ${d.path.split("/").pop()}`);return}if(o){let h=qn(m,o,n);if(h!==!1&&(await S.put("/files/content",{path:d.path,content:h})).ok){pe(`Saved \u2192 ${d.path.split("/").pop()}`);return}}}}console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),pe("Save failed \u2014 source not found",!0)}catch(a){console.error("[VX] Image save error:",a),pe("Save failed",!0)}}function qn(e,t,s){let n=e.split("<img");for(let o=1;o<n.length;o++){let i=n[o];if(!i.includes(`alt="${t}"`)&&!i.includes(`alt='${t}'`))continue;let a=i.indexOf("src=");if(a===-1)continue;let l=i[a+4];if(l!=='"'&&l!=="'")continue;let r=a+5,p=i.indexOf(l,r);if(p!==-1)return n[o]=i.substring(0,r)+s+i.substring(p),n.join("<img")}return!1}function an(e){xt.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,timestamp:Date.now()}),clearTimeout(an._timer),an._timer=setTimeout(()=>ts(),800)}function rn(e){xt.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,timestamp:Date.now()}),clearTimeout(rn._timer),rn._timer=setTimeout(()=>ts(),300)}function Hi(e){let t=e.match(/class="([^"]*)"/);return t?t[1].split(/\s+/).filter(Boolean):[]}function Di(e,t,s,n){let o=new Set(["is-visible","is-active","is-open","active","open","show","shown","visible","in","entered","transitioning"]),i=/class="([^"]*)"/g,a;for(;(a=i.exec(e))!==null;){let l=a[1].split(/\s+/).filter(Boolean);if(l.length===0||!l.every(m=>t.has(m))||![...t].filter(m=>!l.includes(m)).every(m=>o.has(m)||s.includes(m)||n.includes(m)))continue;let v=l.filter(m=>!n.includes(m));for(let m of s)!o.has(m)&&!v.includes(m)&&v.push(m);let d=a[0],u=`class="${v.join(" ")}"`;return e.substring(0,a.index)+u+e.substring(a.index+d.length)}return null}async function ts(){var t;if(en||xt.length===0)return;en=!0;let e=[...xt];xt=[];try{let s={};for(let i of e){let a=i.filePath||ss();s[a]||(s[a]=[]),s[a].push(i)}let n=!1,o={filesByMain:new Map,contentByPath:new Map};for(let[i,a]of Object.entries(s))try{let l=await S.get(`/files/content?path=${encodeURIComponent(i)}`);if(!l.ok){console.error("[VX] Cannot read:",i);continue}let r=l.data.content,p=!1;for(let c of a){let v=c.type==="delete"?c.outerHTML:c.originalHTML;if(v)if(r.includes(v))r=c.type==="delete"?r.replace(v,""):r.replace(v,c.newHTML),p=!0;else if(c.type==="class-change"&&c.additions){let d=new Set(Hi(v)),u=Di(r,d,c.additions,c.removals);if(u)r=u,p=!0;else{if(await Fn(i,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",v.substring(0,80))}}else{if(await Fn(i,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",v.substring(0,80))}}if(p){let c=await S.put("/files/content",{path:i,content:r});c.ok?(pe("Saved"),(t=c.data)!=null&&t.tailwindCompiled&&(n=!0)):pe("Save failed",!0)}}catch(l){console.error("[VX] Save error:",l),pe("Save failed",!0)}n&&setTimeout(()=>{let i=document.getElementById("preview-iframe");i!=null&&i.contentWindow&&i.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{en=!1,xt.length>0&&setTimeout(()=>ts(),0)}}async function Fn(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let l=await S.get("/files");if(!l.ok)return!1;a=(l.data.files||[]).filter(r=>r.path.endsWith(".php")&&r.path!==e).filter(r=>o.some(p=>r.path.includes(p+"/"))||r.path.includes("partial")||r.path.includes("header")||r.path.includes("footer")||r.path.includes("nav")),i.filesByMain.set(e,a)}for(let l of a){let r=i.contentByPath.get(l.path);if(r==null){let p=await S.get(`/files/content?path=${encodeURIComponent(l.path)}`);if(!p.ok||!p.data.content)continue;r=p.data.content,i.contentByPath.set(l.path,r)}if(r.includes(n)){let p=t.type==="delete"?r.replace(n,""):r.replace(n,t.newHTML);if((await S.put("/files/content",{path:l.path,content:p})).ok)return i.contentByPath.set(l.path,p),pe(`Saved \u2192 ${l.path.split("/").pop()}`),!0}}}catch(a){console.error("[VX] Partial search error:",a)}return!1}async function Ni(e){var i;let{filePath:t,sectionIndex:s,neighborIndex:n}=e,o=t||ss();try{let a=await S.get(`/files/content?path=${encodeURIComponent(o)}`);if(!a.ok){pe("Could not read file",!0);return}let l=a.data.content,r=qi(l);if(s>=r.length||n>=r.length){pe("Section not found in source. Try asking the AI to move it.",!0);return}let p=Fi(l,r,s,n);if(!p){pe("Could not swap sections in source",!0);return}let c=await S.put("/files/content",{path:o,content:p});c.ok?(pe("Section moved"),(i=c.data)!=null&&i.tailwindCompiled&&setTimeout(()=>{let v=document.getElementById("preview-iframe");v!=null&&v.contentWindow&&v.contentWindow.postMessage("voxelsite:reload-css","*")},300)):pe("Save failed",!0)}catch(a){console.error("[VX] Section move error:",a),pe("Section move failed",!0)}}function qi(e){let t=[],s=/<section\b/gi,n;for(;(n=s.exec(e))!==null;){let o=n.index,a=e.substring(Math.max(0,o-500),o).match(/(<!--[\s\S]*?-->\s*)$/);a&&(o-=a[0].length);let l="</section>",r=1,p=n.index+n[0].length;for(;r>0&&p<e.length;){let c=e.indexOf("<section",p),v=e.indexOf(l,p);if(v===-1)break;if(c!==-1&&c<v){let d=e[c+8];(d===" "||d===">"||d===`
`||d==="\r"||d==="	"||d==="/")&&r++,p=c+9}else{if(r--,r===0){let d=v+l.length;t.push({start:o,end:d,content:e.substring(o,d)})}p=v+l.length}}}return t}function Fi(e,t,s,n){if(s===n)return e;let o=Math.min(s,n),i=Math.max(s,n),a=t[o],l=t[i];if(!a||!l||a.end>l.start)return null;let r=e.substring(0,a.start),p=e.substring(a.end,l.start),c=e.substring(l.end);return r+l.content+p+a.content+c}function Jn(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",qe),e.title=qe?"Exit visual editor (V)":"Visual editor (V)"),document.body.classList.toggle("vx-editing",qe)}function pe(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(pe._timer),pe._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function oe(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function ss(){return window.__vsCurrentPreviewPath||"index.php"}function $s(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),l=a.right-s-o,r=Math.max(o,a.left+10),p=Math.max(o,window.innerWidth-s-o),c=Math.min(Math.max(l,r),p),v=Math.max(a.top+12,i),d=Math.max(i,window.innerHeight-n-o),u=Math.min(v,d);e.style.left=`${c}px`,e.style.top=`${u}px`,e.style.right="auto"}function zi(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function jt(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Rt(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var x={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',inbox:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',panelLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',palette:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>'};function Oi(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function T(e,t="success",s=3200){if(!e)return;let n=Oi(),o=document.createElement("div"),i=["success","error","warning"].includes(t)?t:"success";o.className=`vs-toast vs-toast-${i}`,o.innerHTML=`<span>${y(String(e))}</span>`,n.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(-6px)",setTimeout(()=>o.remove(),220)},s)}window.showToast=T;var ns=null;function Zn(){return`
    <div class="vs-editor-layout">
      <!-- File Tree Sidebar -->
      <div id="editor-sidebar" class="vs-editor-sidebar" style="position: relative; display: flex; flex-direction: column;">
        <div class="vs-editor-sidebar-header">
          <span class="vs-editor-sidebar-title">Explorer</span>
          <div style="display:flex;gap:2px;">
            <button id="editor-new-file" class="vs-btn vs-btn-ghost vs-btn-icon" title="New file" style="width:24px;height:24px;">
              ${x.filePlus}
            </button>
            <button id="editor-refresh-tree" class="vs-btn vs-btn-ghost vs-btn-icon" title="Refresh file list" style="width:24px;height:24px;">
              ${x.rotateCcw}
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
        <div class="vs-editor-topbar" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface); height: 38px;">
          <!-- Tab Bar Wrapper -->
          <div style="flex: 1; display: flex; align-items: stretch; min-width: 0; position: relative;">
            <!-- Scroll Left Button -->
            <button id="editor-tab-scroll-left" class="vs-tab-scroll-btn" style="display: none; position: absolute; left: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(to right, var(--vs-bg-surface) 60%, transparent); border: none; align-items: center; justify-content: flex-start; padding-left: 4px; z-index: 10; cursor: pointer; color: var(--vs-text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <!-- Tab Bar -->
            <div id="editor-tab-bar" class="vs-editor-tabs" style="flex: 1; border-bottom: none; min-width: 0; scroll-behavior: auto;">
              <div class="vs-editor-tab-empty"></div>
            </div>
            <!-- Scroll Right Button -->
            <button id="editor-tab-scroll-right" class="vs-tab-scroll-btn" style="display: none; position: absolute; right: 0; top: 0; bottom: 0; width: 24px; background: linear-gradient(to left, var(--vs-bg-surface) 60%, transparent); border: none; align-items: center; justify-content: flex-end; padding-right: 4px; z-index: 10; cursor: pointer; color: var(--vs-text-secondary);">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          <!-- Editor Controls -->
          <div class="vs-editor-controls" style="display: flex; align-items: center; gap: 4px; padding: 0 12px;">
            <button id="editor-word-wrap-btn" class="vs-btn vs-btn-ghost vs-btn-icon" title="Toggle Word Wrap" style="width: 24px; height: 24px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M3 12h15a3 3 0 0 1 0 6h-4"/><path d="m11 15-3 3 3 3"/><path d="M3 18h4"/></svg>
            </button>
            <select id="editor-font-size-select" class="vs-input" title="Editor Text Size" style="height: 24px; font-size: 11px; padding: 0 24px 0 8px; width: auto; min-width: 60px; background-size: 12px; background-position: right 6px center;">
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
              <p class="vs-empty-state-desc">Select a file from the explorer to start editing, or create a new file.</p>
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
  `}async function Xn(){var A;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(f=>f.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(f=>f.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),l=document.getElementById("editor-host"),r=document.getElementById("editor-empty-state"),p=document.getElementById("editor-monaco-container"),c=document.getElementById("editor-file-info"),v=document.getElementById("editor-status"),d=document.getElementById("editor-save-btn"),u=document.getElementById("editor-refresh-tree"),m=document.getElementById("editor-new-file"),h=document.getElementById("editor-sidebar"),w=document.getElementById("editor-sidebar-resize"),b=document.getElementById("editor-font-size-select"),g=document.getElementById("editor-word-wrap-btn");b&&(b.value=t.fontSize);let B=()=>{g&&(t.wordWrap?(g.style.color="var(--vs-accent)",g.style.backgroundColor="var(--vs-accent-dim)"):(g.style.color="var(--vs-text-ghost)",g.style.backgroundColor="transparent"))};B();let E=(f,L="muted")=>{v&&(v.textContent=f,v.dataset.state=L)},$=f=>{let L=t.files.find(I=>I.path===f);return(L==null?void 0:L.readonly)===!0},M=f=>{let L=f.toLowerCase();return L.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':L.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':L.endsWith(".js")||L.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},_=(f,L="")=>{let I=[],H={},D=G=>{if(H[G])return H[G];let W=G.split("/"),te=W[W.length-1],J=W.slice(0,-1).join("/"),se=L?L+G:G,re={name:te,path:se,type:"folder",children:[]};return H[G]=re,J?D(J).children.push(re):I.push(re),re};for(let G of f){let te=(L&&G.path.startsWith(L)?G.path.substring(L.length):G.path).split("/");if(te.length===1)I.push({name:te[0],path:G.path,type:"file",meta:G});else{let J=te.slice(0,-1).join("/");D(J).children.push({name:te[te.length-1],path:G.path,type:"file",meta:G})}}let Y=G=>{G.sort((W,te)=>W.type!==te.type?W.type==="folder"?-1:1:W.name.localeCompare(te.name));for(let W of G)W.type==="folder"&&Y(W.children)};return Y(I),I},j=()=>{if(!n)return;let f=(Y,G=0)=>Y.map(W=>{var ne,X;if(W.type==="folder"){let ve=t.expandedFolders.has(W.path);return`
            <div class="vs-tree-item" data-folder="${y(W.path)}" style="--tree-indent: ${G};">
              <span class="vs-tree-folder-toggle" data-expanded="${ve}">${x.chevronRight}</span>
              <span class="vs-tree-item-icon">${ve?x.folderOpen||x.folder:x.folder}</span>
              <span class="vs-tree-item-name">${y(W.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${y(W.path)}" data-collapsed="${!ve}">
              ${f(W.children,G+1)}
            </div>
          `}let te=t.activeTab===W.path,J=t.openTabs.find(ve=>ve.path===W.path),se=J!=null&&J.dirty?" \u2022":"",Ce=$(W.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",ge=((ne=W.meta)==null?void 0:ne.custom)===!0,ye=((X=W.meta)==null?void 0:X.protected)===!0,ke="";return W.path==="assets/css/tailwind.css"?ke=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:ye?ge&&(ke=`
            <button class="vs-tree-item-restore" data-restore-file="${y(W.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):ke=`
            <button class="vs-tree-item-delete" data-delete-file="${y(W.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${y(W.path)}" data-active="${te}" style="--tree-indent: ${G};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${M(W.path)}</span>
            <span class="vs-tree-item-name">${y(W.name)}${Ce}${se}</span>
            ${ke}
          </div>
        `}).join(""),L=(Y,G,W)=>{let te=W.querySelector(".vs-explorer-caret");t.expandedSections.has(Y)?(G.style.display="block",W.classList.add("is-expanded")):(G.style.display="none",W.classList.remove("is-expanded"))},I=document.querySelector('[data-section="site"]'),H=document.querySelector('[data-section="config"]'),D=document.querySelector('[data-section="prompts"]');I&&L("site",n,I),H&&o&&L("config",o,H),D&&i&&L("prompts",i,D),n.innerHTML=f(t.treeData.site),o&&(o.innerHTML=f(t.treeData.config)),i&&(i.innerHTML=f(t.treeData.prompts)),We()},U=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(f=>{let L=f.path===t.activeTab,I=f.path.split("/").pop(),D=$(f.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${y(f.path)}" data-active="${L}" data-dirty="${f.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${y(I)}${D}</span>
          <button class="vs-editor-tab-close" data-close-tab="${y(f.path)}" title="Close">${x.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',Ye(),Z()}},Q=null,K=f=>{if(!a)return;let L=8,I=()=>{a.scrollLeft+=f==="left"?-L:L,Z()};I(),Q=setInterval(I,16)},F=()=>{Q&&(clearInterval(Q),Q=null)},Z=()=>{let f=document.getElementById("editor-tab-scroll-left"),L=document.getElementById("editor-tab-scroll-right");if(!a||!f||!L)return;let I=a.scrollLeft>0,H=a.scrollLeft<a.scrollWidth-a.clientWidth-1;f.style.display=I?"flex":"none",L.style.display=H?"flex":"none"};a&&(a.addEventListener("scroll",Z,{passive:!0}),window.addEventListener("resize",Z,{passive:!0}));let ce=document.getElementById("editor-tab-scroll-left"),R=document.getElementById("editor-tab-scroll-right");ce&&(ce.addEventListener("mousedown",()=>K("left")),ce.addEventListener("mouseup",F),ce.addEventListener("mouseleave",F)),R&&(R.addEventListener("mousedown",()=>K("right")),R.addEventListener("mouseup",F),R.addEventListener("mouseleave",F));let C=()=>{r&&(r.style.display="none"),p&&(p.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},N=async f=>{if(t.disposed)return;let L=t.openTabs.find(G=>G.path===f);if(L){await z(f);return}E("Loading\u2026");let{ok:I,data:H,error:D}=await S.get(`/files/content?path=${encodeURIComponent(f)}`);if(!I){T((D==null?void 0:D.message)||"Could not load file.","error"),E("Load failed","error");return}let Y=typeof(H==null?void 0:H.content)=="string"?H.content:"";L={path:f,baseline:Y,dirty:!1},t.openTabs.push(L),C(),await z(f),V(Y,f),E("Ready"),s()},z=async f=>{if(t.disposed)return;let L=t.openTabs.find(H=>H.path===t.activeTab);L&&t.monacoInstance&&(L._buffer=t.monacoInstance.getValue()),t.activeTab=f;let I=t.openTabs.find(H=>H.path===f);if(I&&t.monacoInstance){let H=I._buffer!==void 0?I._buffer:I.baseline;V(H,f)}ue(),me(),U(),setTimeout(()=>{if(a){let H=a.querySelector('.vs-editor-tab[data-active="true"]');if(H){let D=H.getBoundingClientRect(),Y=a.getBoundingClientRect();D.left<Y.left?a.scrollBy({left:D.left-Y.left,behavior:"smooth"}):D.right>Y.right&&a.scrollBy({left:D.right-Y.right,behavior:"smooth"})}}},10),j(),s()},O=async f=>{let L=t.openTabs.find(H=>H.path===f);if(L!=null&&L.dirty&&!await be({title:"Discard unsaved changes?",description:`"${f}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let I=t.openTabs.findIndex(H=>H.path===f);if(I!==-1){if(t.openTabs.splice(I,1),t.activeTab===f){let H=t.openTabs[Math.min(I,t.openTabs.length-1)];H?await z(H.path):(t.activeTab=null,ae(),ue(),me())}U(),j(),s()}},ee=async f=>{var G,W;if((G=window.demoGuard)!=null&&G.call(window)||(W=window.viewerGuard)!=null&&W.call(window))return;let L=f.split("/").pop();if(!await be({title:"Delete file?",description:`Are you sure you want to permanently delete "${L}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;E("Deleting\u2026");let{ok:H,error:D}=await S.delete(`/files?path=${encodeURIComponent(f)}`);if(!H){T((D==null?void 0:D.message)||"Could not delete file.","error"),E("Delete failed","error");return}let Y=t.openTabs.findIndex(te=>te.path===f);if(Y!==-1){if(t.openTabs.splice(Y,1),t.activeTab===f){let te=t.openTabs[Math.min(Y,t.openTabs.length-1)];te?await z(te.path):(t.activeTab=null,ae(),ue(),me())}U()}await k(),s(),T(`Deleted ${L}`,"success"),E("Ready")},ie=async f=>{var G,W;if((G=window.demoGuard)!=null&&G.call(window)||(W=window.viewerGuard)!=null&&W.call(window))return;let L=f.split("/").pop();if(!await be({title:"Reset system prompt?",description:`Are you sure you want to reset "${L}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;E("Resetting\u2026");let{ok:H,error:D}=await S.delete(`/files?path=${encodeURIComponent(f)}`);if(!H){T((D==null?void 0:D.message)||"Could not reset file.","error"),E("Reset failed","error");return}let Y=t.openTabs.findIndex(te=>te.path===f);if(Y!==-1){let{ok:te,data:J}=await S.get(`/files/content?path=${encodeURIComponent(f)}`);if(te&&typeof(J==null?void 0:J.content)=="string"){let se=t.openTabs[Y];se.baseline=J.content,se.dirty=!1,se._buffer=J.content,t.activeTab===f&&V(J.content,f)}}me(),await k(),s(),T(`Reset ${L} to default`,"success"),E("Ready")},V=(f,L)=>{var H;if(!t.monacoInstance||!t.monaco)return;let I=t.monacoInstance.getModel();I&&(t.monacoInstance.setValue(f),t.monaco.editor.setModelLanguage(I,Yt(L)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((H=window.canWrite)!=null&&H.call(window))||$(L)}))},ae=()=>{r&&(r.style.display=""),p&&(p.style.display="none")},ue=()=>{if(!c)return;if(!t.activeTab){c.textContent="No file open";return}let f=t.openTabs.find(D=>D.path===t.activeTab),L=t.files.find(D=>D.path===t.activeTab),I=L!=null&&L.size?`${(Number(L.size)/1024).toFixed(1)} KB`:"",H=Yt(t.activeTab).toUpperCase();c.textContent=[t.activeTab,H,I].filter(Boolean).join(" \u2022 ")},me=()=>{var I;if(!d)return;let f=t.openTabs.find(H=>H.path===t.activeTab);if(t.activeTab?$(t.activeTab)||!((I=window.canWrite)!=null&&I.call(window)):!1){d.disabled=!0,d.textContent="Read-Only",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}if(!f||!f.dirty){d.disabled=!0,d.textContent="Saved",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}d.disabled=!1,d.textContent="Save",d.classList.remove("vs-btn-ghost"),d.classList.add("vs-btn-primary")},Ve=()=>{let f=t.openTabs.find(H=>H.path===t.activeTab);if(!f||!t.monacoInstance)return;let L=t.monacoInstance.getValue(),I=f.dirty;f.dirty=L!==f.baseline,I!==f.dirty&&(me(),U(),f.dirty?E("Unsaved changes","warning"):E("Ready"))},De=async()=>{var Y,G,W,te,J;if((Y=window.demoGuard)!=null&&Y.call(window)||(G=window.viewerGuard)!=null&&G.call(window))return;let f=t.openTabs.find(se=>se.path===t.activeTab);if(!f||!f.dirty||!t.monacoInstance)return;let L=t.monacoInstance.getValue();d.disabled=!0,d.textContent="Saving\u2026",E("Saving\u2026");let{ok:I,error:H}=await S.put("/files/content",{path:f.path,content:L});if(!I){d.disabled=!1,d.textContent="Save",T((H==null?void 0:H.message)||"Could not save file.","error"),E("Save failed","error");return}f.baseline=L,f.dirty=!1,f._buffer=L,me(),U(),j(),E("Saved","success"),T(`Saved ${f.path}`,"success"),f.path.toLowerCase().endsWith(".css")?(W=window.sendPreviewMessage)==null||W.call(window,"voxelsite:reload-css"):(te=window.sendPreviewMessage)==null||te.call(window,"voxelsite:reload"),setTimeout(()=>{var se;return(se=window.refreshPreview)==null?void 0:se.call(window)},400),(J=window.refreshPublishState)==null||J.call(window,{silent:!0});let D=t.openTabs.find(se=>se.path==="assets/css/tailwind.css");D&&f.path!=="assets/css/tailwind.css"&&S.get("/files/content?path=assets/css/tailwind.css").then(({ok:se,data:re})=>{se&&typeof(re==null?void 0:re.content)=="string"&&(D.baseline=re.content,D._buffer=re.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(re.content))})},We=()=>{let f=L=>{L&&(L.querySelectorAll("[data-file]").forEach(I=>{I.addEventListener("click",H=>{H.target.closest("[data-delete-file]")||N(I.dataset.file)})}),L.querySelectorAll("[data-delete-file]").forEach(I=>{I.addEventListener("click",H=>{H.stopPropagation(),ee(I.dataset.deleteFile)})}),L.querySelectorAll("[data-restore-file]").forEach(I=>{I.addEventListener("click",H=>{H.stopPropagation(),ie(I.dataset.restoreFile)})}),L.querySelectorAll("[data-compile-tailwind]").forEach(I=>{I.addEventListener("click",async H=>{var se,re;if(H.stopPropagation(),(se=window.demoGuard)!=null&&se.call(window)||(re=window.viewerGuard)!=null&&re.call(window))return;I.style.opacity="0.4",I.style.pointerEvents="none",E("Compiling Tailwind\u2026");let{ok:D,data:Y,error:G}=await S.post("/files/compile-tailwind");if(I.style.opacity="",I.style.pointerEvents="",!D){T((G==null?void 0:G.message)||"Tailwind compilation failed.","error"),E("Compile failed","error");return}let W="assets/css/tailwind.css",te=t.openTabs.find(Ce=>Ce.path===W);te&&(te.baseline=Y.content,te.dirty=!1,t.activeTab===W&&t.monacoInstance&&t.monacoInstance.setValue(Y.content));let J=Y.class_count??0;T(`Tailwind CSS recompiled \u2014 ${J} utilities.`,"success"),E("Compiled")})}),L.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(I=>{I.addEventListener("click",H=>{H.stopPropagation();let Y=I.closest(".vs-tree-item").dataset.folder;t.expandedFolders.has(Y)?t.expandedFolders.delete(Y):t.expandedFolders.add(Y),s(),j()})}))};f(n),f(o),f(i),document.querySelectorAll(".vs-explorer-section-header").forEach(L=>{L.dataset.bound||(L.dataset.bound="true",L.addEventListener("click",()=>{let I=L.dataset.section;t.expandedSections.has(I)?t.expandedSections.delete(I):t.expandedSections.add(I),s(),j()}))})},Ye=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(f=>{f.addEventListener("click",L=>{L.target.closest("[data-close-tab]")||z(f.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(f=>{f.addEventListener("click",L=>{L.stopPropagation(),O(f.dataset.closeTab)})}))};if(w&&h){let f=!1;w.addEventListener("mousedown",L=>{L.preventDefault(),f=!0,w.classList.add("is-dragging");let I=D=>{if(!f)return;let Y=Math.min(400,Math.max(200,D.clientX));h.style.width=Y+"px"},H=()=>{f=!1,w.classList.remove("is-dragging"),document.removeEventListener("mousemove",I),document.removeEventListener("mouseup",H)};document.addEventListener("mousemove",I),document.addEventListener("mouseup",H)})}d==null||d.addEventListener("click",De),b==null||b.addEventListener("change",f=>{let L=parseInt(f.target.value,10);t.fontSize=L,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:L}),s()}),g==null||g.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,B(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),u==null||u.addEventListener("click",()=>k()),m==null||m.addEventListener("click",async()=>{var G,W,te;if((G=window.demoGuard)!=null&&G.call(window)||(W=window.viewerGuard)!=null&&W.call(window))return;let f=await Qs({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!f||!f.trim())return;let L=f.trim(),I=(te=L.split(".").pop())==null?void 0:te.toLowerCase(),H=["php","css","js","json"];if(!I||!H.includes(I)){T(`Only ${H.join(", ")} files can be created.`,"warning");return}E("Creating\u2026");let{ok:D,error:Y}=await S.post("/files/create",{path:L});if(!D){T((Y==null?void 0:Y.message)||"Could not create file.","error"),E("Create failed","error");return}await k(),await N(L),T(`Created ${L}`,"success")});let mt=f=>{if(t.disposed){document.removeEventListener("keydown",mt);return}(f.metaKey||f.ctrlKey)&&f.key==="s"&&(f.preventDefault(),De())};document.addEventListener("keydown",mt);let k=async()=>{var H;let{ok:f,data:L,error:I}=await S.get("/files");if(!f||!((H=L==null?void 0:L.files)!=null&&H.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=L.files,t.treeData={site:_(L.files.filter(D=>!D.path.startsWith("_prompts/")&&!D.path.startsWith("_root/"))),config:_(L.files.filter(D=>D.path.startsWith("_root/")),"_root/"),prompts:_(L.files.filter(D=>D.path.startsWith("_prompts/")),"_prompts/")},j()},q=async()=>{if(!p)return;let f;try{f=await Qn()}catch{T("Monaco editor is not available.","warning");return}t.monaco=f;let L=os();f.editor.setTheme(L);let I=f.editor.create(p,{value:"",language:"php",theme:L,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=I,I.onDidChangeModelContent(()=>Ve()),I.addCommand(f.KeyMod.CtrlCmd|f.KeyCode.KeyK,async()=>{if(t.monacoInstance.getOption(f.editor.EditorOption.readOnly)){T("Cannot use inline AI on a read-only file.","warning");return}let H=t.activeTab;if(!H)return;let D=t.monacoInstance.getModel(),Y=t.monacoInstance.getSelection(),G=D.getValueInRange(Y);if(!G||G.trim()===""){let se=t.monacoInstance.getPosition(),re=D.getLineContent(se.lineNumber);if(re.trim()===""){T("Highlight a block of code to edit.","warning");return}G=re,t.monacoInstance.setSelection(new f.Range(se.lineNumber,1,se.lineNumber,D.getLineMaxColumn(se.lineNumber)))}let W=await Qs({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!W)return;let te=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let J=document.createElement("div");J.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",J.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${x.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,p&&(p.style.position="relative",p.appendChild(J)),E("AI is editing...","muted");try{await yt("/ai/prompt",{user_prompt:W,action_type:"inline_edit",action_data:{path:H,selection:G}},{onStatus:se=>{let re=document.getElementById("ai-inline-status");re&&(re.textContent="Generating...")},onFile:()=>{let se=document.getElementById("ai-inline-status");se&&(se.textContent="Applying changes...")},onError:se=>{T(se.message||"Generation failed","error")},onDone:async se=>{var Ce;if((Ce=se.files_modified)==null?void 0:Ce.some(ge=>(typeof ge=="string"?ge:(ge==null?void 0:ge.path)||"").replace(/^\//,"")===H.replace(/^\//,""))){let{ok:ge,data:ye}=await S.get(`/files/content?path=${encodeURIComponent(H)}&_t=${Date.now()}`);if(ge&&(ye!=null&&ye.content)){let ke=ye.content;await S.put("/files/content",{path:H,content:te}),t.monacoInstance.getModel().setValue(ke);let ne=t.openTabs.find(X=>X.path===H);ne&&(ne._buffer=ke,ne.baseline=te),Ve(),T("Review changes and save.","success")}}else se.partial||T("Complete (No changes made to this file)","info")}})}finally{t.monacoInstance.updateOptions({readOnly:!1}),J.parentNode&&J.parentNode.removeChild(J),E("Ready","muted")}})};if(await Promise.all([k(),q()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:f,active:L}=t._pendingRestore;t._pendingRestore=null;for(let I of f){if(!t.files.some(Y=>Y.path===I))continue;let{ok:H,data:D}=await S.get(`/files/content?path=${encodeURIComponent(I)}`);H&&typeof(D==null?void 0:D.content)=="string"&&t.openTabs.push({path:I,baseline:D.content,dirty:!1})}if(t.openTabs.length>0){let I=L&&t.openTabs.find(H=>H.path===L)?L:t.openTabs[0].path;C(),await z(I),V(((A=t.openTabs.find(H=>H.path===I))==null?void 0:A.baseline)||"",I),E("Ready")}}}function os(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function Qn(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:ns||(ns=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,l){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw ns=null,t}),ns)}async function Ss(e=""){var Q,K,F,Z,ce;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),l=s.querySelector("#vs-code-meta"),r=s.querySelector("#vs-code-status"),p=s.querySelector("#vs-code-editor-host"),c={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},v=(R,C="muted")=>{r&&(r.textContent=R,r.dataset.state=C)},d=()=>c.files.find(R=>R.path===c.path)||null,u=()=>!!c.editor&&c.editor.getValue()!==c.baseline,m=()=>{if(!l)return;let R=d();if(!R){l.textContent="No file selected";return}let C=R.size?`${(Number(R.size)/1024).toFixed(1)} KB`:"0 KB",N=R.modified?new Date(R.modified).toLocaleString():"Unknown date";l.textContent=`${R.path} \u2022 ${C} \u2022 ${N}`},h=window.IS_DEMO||!((Q=window.canWrite)!=null&&Q.call(window)),w=()=>{if(h)return!0;let R=d();return(R==null?void 0:R.readonly)===!0},b=()=>{if(!o)return;if(w()){o.disabled=!0,o.textContent="Read Only",v("Read-only mode","muted");return}let C=u();o.disabled=!C,o.textContent=C?"Save Changes":"Saved",C?v("Unsaved changes","warning"):c.path&&v("Saved","success")},g=async()=>{var R;c.closed||u()&&!await be({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(c.closed=!0,(R=c.editorCleanup)!=null&&R.dispose&&(c.editorCleanup.dispose(),c.editorCleanup=null),c.editor&&(c.editor.dispose(),c.editor=null),he(s))},B=(R,C=null)=>{if(!c.editor)return;c.editor.setValue(R),c.baseline=R;let N=(C==null?void 0:C.language)||Yt(c.path);c.editor.setLanguage&&c.editor.setLanguage(N),c.editor.setReadOnly&&c.editor.setReadOnly(w()),m(),b()},E=async(R,{silent:C=!1}={})=>{if(!R||!c.editor)return!1;c.path=R,C||v("Loading file\u2026");let{ok:N,data:z,error:O}=await S.get(`/files/content?path=${encodeURIComponent(R)}`);if(!N)return T((O==null?void 0:O.message)||"Could not load file.","error"),v("Load failed","error"),!1;let ee=typeof(z==null?void 0:z.content)=="string"?z.content:"";return B(ee,(z==null?void 0:z.file)||d()),!0},$=async()=>u()?await be({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,M=async R=>{if(!R||R===c.path)return;if(!await $()){n&&(n.value=c.path);return}await E(R)},_=async()=>{var z,O,ee;if(!c.editor||!c.path||!o)return;let R=c.editor.getValue();if(R===c.baseline){b();return}o.disabled=!0,o.textContent="Saving\u2026",v("Saving\u2026");let{ok:C,error:N}=await S.put("/files/content",{path:c.path,content:R});if(!C){o.disabled=!1,o.textContent="Save Changes",T((N==null?void 0:N.message)||"Could not save file.","error"),v("Save failed","error");return}c.baseline=R,b(),v("Saved","success"),T(`Saved ${c.path}`,"success"),c.path.toLowerCase().endsWith(".css")?(z=window.sendPreviewMessage)==null||z.call(window,"voxelsite:reload-css"):(O=window.sendPreviewMessage)==null||O.call(window,"voxelsite:reload"),setTimeout(()=>{var ie;return(ie=window.refreshPreview)==null?void 0:ie.call(window)},400),(ee=window.refreshPublishState)==null||ee.call(window,{silent:!0})},j=R=>{R.key==="Escape"&&(R.preventDefault(),g())};a==null||a.addEventListener("click",()=>g()),i==null||i.addEventListener("click",async()=>{!c.path||!await $()||await E(c.path)}),o==null||o.addEventListener("click",()=>_()),n==null||n.addEventListener("change",R=>{M(R.target.value)}),s.addEventListener("click",R=>{R.target===s&&g()}),document.addEventListener("keydown",j);let U=()=>document.removeEventListener("keydown",j);s.addEventListener("transitionend",()=>{document.body.contains(s)||U()});try{let R=await S.get("/files");if(!R.ok||!((F=(K=R.data)==null?void 0:K.files)!=null&&F.length)){let O=((Z=R.error)==null?void 0:Z.message)||"No editable files found.";T(O,"error"),g();return}let C=R.data.files;c.files=C,n&&(n.innerHTML=C.map(O=>{let ee=O.group?`${String(O.group).toUpperCase()} \xB7 `:"";return`<option value="${y(O.path)}">${y(ee+O.path)}</option>`}).join(""));let N=((ce=C.find(O=>O.path===e))==null?void 0:ce.path)||C[0].path;c.path=N,n&&(n.value=N),p.innerHTML="";let z=null;try{z=await Qn()}catch{T("Monaco is not available yet. Using fallback editor.","warning"),v("Fallback editor active","warning")}if(z!=null&&z.editor){let O=os();z.editor.setTheme(O);let ee=z.editor.create(p,{value:"",language:Yt(N),theme:O,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",readOnly:w(),fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});c.editor={getValue:()=>ee.getValue(),setValue:ie=>ee.setValue(ie),setLanguage:ie=>{let V=ee.getModel();V&&z.editor.setModelLanguage(V,ie)},setReadOnly:ie=>ee.updateOptions({readOnly:ie}),dispose:()=>ee.dispose()},c.editorCleanup=ee.onDidChangeModelContent(()=>{b()})}else{p.innerHTML=`<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"${w()?" readonly":""}></textarea>`;let O=p.querySelector("#vs-code-editor-fallback"),ee=()=>b();O==null||O.addEventListener("input",ee),c.editor={getValue:()=>(O==null?void 0:O.value)||"",setValue:ie=>{O&&(O.value=ie)},setLanguage:()=>{},setReadOnly:ie=>{O&&(O.readOnly=ie)},dispose:()=>{O==null||O.removeEventListener("input",ee)}}}await E(N,{silent:!0}),v("Ready")}catch(R){T((R==null?void 0:R.message)||"Could not initialize code editor.","error"),g()}finally{let R=new MutationObserver(()=>{document.body.contains(s)||(U(),R.disconnect())});R.observe(document.body,{childList:!0,subtree:!0})}}function oo(){return setTimeout(()=>ct(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function ct(){var R,C,N,z,O,ee,ie;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,l]=await Promise.all([S.get("/settings"),S.get("/settings/system"),S.get("/settings/mail"),S.get("/settings/usage"),S.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),S.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),S.get("/settings/logs")]),r=((R=l.data)==null?void 0:R.logs)||[],p=((C=t.data)==null?void 0:C.settings)||{},c=((N=s.data)==null?void 0:N.system)||{},v=p.site_favicon||null,d=v?`/${v}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),u=null,m=null;try{i.ok&&((z=i.data)!=null&&z.content)&&(u=JSON.parse(i.data.content))}catch{}try{a.ok&&((O=a.data)!=null&&O.content)&&(m=JSON.parse(a.data.content))}catch{}let h=u||m,w=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},b=p.available_providers||{},g=((ee=n.data)==null?void 0:ee.config)||{},B=((ie=n.data)==null?void 0:ie.presets)||{},E=Object.keys(b),$=p.ai_provider||"claude",_=(b[$]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],j=p[`ai_${$}_model`]||"",U=p[`ai_${$}_api_key_set`]||!1,Q=E.map(V=>{let ae=b[V];return`<option value="${y(V)}" ${V===$?"selected":""}>${y(ae.name)}</option>`}).join(""),K="";for(let V of _)V.key==="api_key"?K+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(V.label)}${V.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${U?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${y(V.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${U?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':V.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${y(V.help_text||"Optional for local servers")}</p>`}
          ${V.help_url?`<a href="${V.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${y(V.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:V.key==="base_url"&&(K+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(V.label)}${V.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${y(p.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${y(V.placeholder)}" />
          ${V.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${y(V.help_text)}</p>`:""}
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
              <img src="${d}" alt="Current favicon" class="vs-favicon-img" id="vs-favicon-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML = '<div class=\\'vs-favicon-placeholder\\'><svg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'m21 15-5-5L5 21\\'/></svg></div>';" />
            </div>
            <div class="vs-favicon-info">
              <div class="vs-favicon-actions">
                <button type="button" class="vs-btn vs-btn-secondary vs-btn-xs" id="btn-favicon-upload">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                </button>
                ${v?`
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
          ${K}
        </div>

        <div>
          <label for="set-ai-model" class="block text-sm font-medium text-vs-text-secondary mb-1">Model</label>
          <select id="set-ai-model" class="vs-input">
            <option value="">Loading models\u2026</option>
          </select>
        </div>

        <div>
          <label for="set-max-tokens" class="block text-sm font-medium text-vs-text-secondary mb-1">Max Output Tokens</label>
          <input id="set-max-tokens" type="number" value="${p.ai_max_tokens||32e3}" min="1000" max="128000" step="1000"
            class="vs-input" />
          <p class="text-xs text-vs-text-ghost mt-1">Higher values allow larger website generations but cost more.</p>
        </div>

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
                ${Object.entries(B).map(([V,ae])=>`<option value="${y(V)}">${y(ae.label)}</option>`).join("")}
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

        <div class="border-t border-vs-border-subtle my-2"></div>

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
      <div class="vs-settings-card-footer">
        <span id="save-mail-status" class="text-xs text-vs-text-ghost hidden"></span>
        <button id="btn-save-mail" class="vs-btn vs-btn-primary vs-btn-sm">
          Save Email Settings
        </button>
      </div>
    </div>

    ${h?`
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${u?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${x.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(u).length} facts remembered</span>
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
      ${w.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${Re("Total Requests",Number(w.totals.request_count).toLocaleString())}
          ${Re("Input Tokens",Number(w.totals.total_input_tokens).toLocaleString())}
          ${Re("Output Tokens",Number(w.totals.total_output_tokens).toLocaleString())}

        </div>
        ${w.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${w.models.map(V=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${Re(V.ai_model||"Unknown",Number(V.request_count).toLocaleString()+" requests")}
                ${Re("Tokens",Number(V.total_input_tokens).toLocaleString()+" in / "+Number(V.total_output_tokens).toLocaleString()+" out")}

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
        ${Re("VoxelSite",c.version||"1.0.0")}
        ${Re("PHP",c.php_version||"?")}
        ${Re("SQLite",c.sqlite_version||"?")}
        ${Re("Database",pn(c.database_size))}
        ${Re("Preview Files",pn(c.preview_size))}
        ${Re("Assets",pn(c.assets_size))}
        ${Re("Upload Limit",c.max_upload||"?")}
        ${Re("Memory Limit",c.memory_limit||"?")}
      </div>
    </div>

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
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${r.length>0?"16px":"0"};">
        <div>
          <h3 class="vs-settings-card-title">Server Logs</h3>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Download log files for debugging.</p>
        </div>
        ${r.length>0?`<button id="btn-delete-all-logs" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete all
        </button>`:""}
      </div>
      <div id="log-files-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${r.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':r.map(V=>{let ae=(V.size/1024).toFixed(1),ue=new Date(V.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${V.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${V.lines} lines \xB7 ${ae} KB \xB7 ${ue}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(V.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${V.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            </div>`}).join("")}
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
  `,Xi(p,b),Qi(g,B),Gi(),Ki(),document.querySelectorAll(".btn-delete-log").forEach(V=>{V.addEventListener("click",async()=>{var me;if((me=window.demoGuard)!=null&&me.call(window))return;if(V.dataset.confirm!=="true"){V.dataset.confirm="true",V.innerHTML='<span style="font-size: 11px;">Sure?</span>',V.style.color="var(--vs-error)",setTimeout(()=>{V.dataset.confirm==="true"&&(V.dataset.confirm="",V.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',V.style.color="")},3e3);return}let ae=V.dataset.file,ue=V.closest(".vs-log-row");ue&&(ue.style.opacity="0.4"),await S.delete("/settings/logs",{file:ae}),ct()})});let F=document.getElementById("btn-delete-all-logs");F&&F.addEventListener("click",async()=>{var V;if(!((V=window.demoGuard)!=null&&V.call(window))){if(F.dataset.confirm!=="true"){F.dataset.confirm="true",F.textContent="Sure?",F.style.color="var(--vs-error)",setTimeout(()=>{F.dataset.confirm==="true"&&(F.dataset.confirm="",F.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',F.style.color="")},3e3);return}F.disabled=!0,F.textContent="Deleting...",await S.delete("/settings/logs",{file:"*"}),ct()}});let Z=document.getElementById("btn-view-memory");Z&&u&&Z.addEventListener("click",()=>eo("Site Memory",u,"memory"));let ce=document.getElementById("btn-view-design");ce&&m&&ce.addEventListener("click",()=>eo("Design Intelligence",m,"design")),Vi(),Wi(),Zi(j)}function Ui(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function Vi(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;l();async function l(){var d;if(a)try{let{ok:u,data:m}=await S.get("/update/dist-packages");if(!u||!((d=m==null?void 0:m.packages)!=null&&d.length)){a.innerHTML="";return}let h=m.current_version||"0.0.0",w=m.packages.map(b=>{let g=(b.size/1024/1024).toFixed(1),B=Ui(b.version,h)>0,E=b.version===h,$=B?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':E?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${y(b.filename)}</strong>
                ${$}
              </div>
              <div class="vs-dist-pkg-meta">v${y(b.version)} \xB7 ${g} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${y(b.filename)}" data-version="${y(b.version)}">
              Apply Update
            </button>
          </div>
        `}).join("");a.innerHTML=`
        <div class="vs-dist-packages-section">
          <div class="vs-dist-packages-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Update packages found in <code>/dist/</code></span>
          </div>
          ${w}
        </div>
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(b=>{b.addEventListener("click",()=>r(b.dataset.filename,b.dataset.version))})}catch{}}async function r(d,u){var h,w;if(!((h=window.demoGuard)!=null&&h.call(window)||!confirm(`Apply update from "${d}" (v${u})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${d}...`,a&&(a.innerHTML="");try{let{ok:b,data:g,error:B}=await S.post("/update/apply-local",{filename:d});s.classList.add("hidden"),n.classList.remove("hidden");let E=document.getElementById("vs-update-result-icon"),$=document.getElementById("vs-update-result-message");if(b){let M=g;E.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',$.innerHTML=`
          <div class="vs-update-result-title">${y(M.message)}</div>
          <div class="vs-update-result-meta">
            ${M.files_updated} files updated \xB7 ${M.files_skipped} preserved
            ${(w=M.errors)!=null&&w.length?` \xB7 ${M.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",(B==null?void 0:B.message)||"Unknown error")}catch(b){c("Update Failed",y(b.message||"Network error."))}}}e.addEventListener("click",d=>{var u;(u=window.demoGuard)!=null&&u.call(window)||d.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",d=>{d.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",d=>{var m,h,w;if(d.preventDefault(),e.classList.remove("is-dragover"),(m=window.demoGuard)!=null&&m.call(window))return;let u=(w=(h=d.dataTransfer)==null?void 0:h.files)==null?void 0:w[0];u&&u.name.endsWith(".zip")&&p(u)}),o.addEventListener("change",()=>{var u;let d=(u=o.files)==null?void 0:u[0];d&&p(d),o.value=""});async function p(d){var h,w;let u=document.querySelector(".vs-sys-grid");if(u){let b=u.querySelectorAll(".vs-sys-value"),g="";if(u.querySelectorAll(".vs-sys-label").forEach((B,E)=>{var $,M;B.textContent.trim()==="Upload Limit"&&(g=((M=($=b[E])==null?void 0:$.textContent)==null?void 0:M.trim())||"")}),g){let B=v(g);if(B>0&&d.size>B){let E=(d.size/1024/1024).toFixed(1);c("File Too Large",`The update file is ${E} MB but your server's upload limit is ${g}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${E} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${d.name}" (${(d.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${d.name}...`;try{let b=new FormData;b.append("update_zip",d);let g=P.get("sessionToken"),B=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:g?{"X-VS-Token":g}:{},body:b}),E=B.headers.get("content-type")||"",$;if(!E.includes("application/json")){let j=await B.text();if(j.includes("POST Content-Length")||j.includes("upload_max_filesize")||j.includes("exceeds")){c("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}c("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}$=await B.json(),s.classList.add("hidden"),n.classList.remove("hidden");let M=document.getElementById("vs-update-result-icon"),_=document.getElementById("vs-update-result-message");if($.ok){let j=$.data;M.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',_.innerHTML=`
          <div class="vs-update-result-title">${y(j.message)}</div>
          <div class="vs-update-result-meta">
            ${j.files_updated} files updated \xB7 ${j.files_skipped} preserved
            ${(h=j.errors)!=null&&h.length?` \xB7 ${j.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",((w=$.error)==null?void 0:w.message)||"Unknown error")}catch(b){let g=b.message||"Network error. Check your connection.";g.includes("Unexpected token")||g.includes("not valid JSON")?c("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):c("Upload Failed",y(g))}}}function c(d,u){s.classList.add("hidden"),n.classList.remove("hidden");let m=document.getElementById("vs-update-result-icon"),h=document.getElementById("vs-update-result-message");m.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',h.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${y(d)}</div>
      <div class="vs-update-result-meta">${u}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function v(d){let u=d.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!u)return 0;let m=parseFloat(u[1]),h=u[2].toUpperCase();return h==="GB"||h==="G"?m*1024*1024*1024:h==="MB"||h==="M"?m*1024*1024:h==="KB"||h==="K"?m*1024:0}}function Wi(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var l,r,p;if(i.preventDefault(),e.classList.remove("is-dragover"),(l=window.demoGuard)!=null&&l.call(window))return;let a=(p=(r=i.dataTransfer)==null?void 0:r.files)==null?void 0:p[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,l;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let r=await S.delete("/settings/favicon");r.ok?(T("Favicon removed.","success"),ct()):T(((l=r.error)==null?void 0:l.message)||"Could not remove favicon.","error")}catch{T("Could not remove favicon.","error")}}});async function o(i){var c;if(i.size>524288){T("Favicon must be under 512 KB.","error");return}let l=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!l.includes(i.type)){T("Favicon must be a .ico file.","error");return}let p=document.getElementById("vs-favicon-preview");p&&(p.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let v=new FormData;v.append("favicon",i);let d=P.get("sessionToken"),m=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:d?{"X-VS-Token":d}:{},body:v})).json();m.ok?(T("Favicon updated.","success"),ct()):(T(((c=m.error)==null?void 0:c.message)||"Upload failed.","error"),ct())}catch{T("Upload failed. Check your connection.","error"),ct()}}}function eo(e,t,s){var r,p,c;(r=document.getElementById("vs-knowledge-overlay"))==null||r.remove();let n=v=>v.replace(/[_-]/g," ").replace(/\b\w/g,d=>d.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([v,d])=>{let u=typeof d=="object"?d.value||JSON.stringify(d):String(d),m=typeof d=="object"?d.confidence:null,h=m==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${y(n(v))}</div>
          <div class="vs-kv-value">
            <span>${y(u)}</span>
            ${m?`<span class="vs-kv-badge ${h}">${y(m)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(t).map(([v,d])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${y(n(v))}</div>
        <div class="vs-kv-section-body">${y(String(d))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?x.book:x.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${y(e)}</h2>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",l)},l=v=>{v.key==="Escape"&&a()};document.addEventListener("keydown",l),(p=i.querySelector("#vs-knowledge-close"))==null||p.addEventListener("click",a),(c=i.querySelector("#vs-knowledge-done"))==null||c.addEventListener("click",a),fe(i,a)}function Gi(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Ji()})}function Ki(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Yi()})}function Yi(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-install-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let r=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()===a?to(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?to(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>he(t)),t.addEventListener("click",r=>{r.target===t&&he(t)});let l=r=>{r.key==="Escape"&&(he(t),document.removeEventListener("keydown",l))};document.addEventListener("keydown",l)}async function to(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await S.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let l=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=l,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function io(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function Ji(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let l=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()==="RESET"?so(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?so(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>he(t)),t.addEventListener("click",l=>{l.target===t&&he(t)});let a=l=>{l.key==="Escape"&&(he(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function so(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:l}=await S.post("/site/reset",{confirm:"RESET"});if(i){P.set("pages",[]),P.set("hasFormSchemas",!1),P.set("conversations",null),P.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{he(e),window.location.hash!=="#/chat"?je.navigate("chat"):je.refresh()},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let r=e.querySelector(".vs-modal-desc");if(r){let p=r.textContent;r.textContent=(l==null?void 0:l.message)||"Reset failed. Please try again.",r.style.color="var(--vs-error)",setTimeout(()=>{r.textContent=p,r.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function Zi(e){var s;let t=document.getElementById("set-ai-model");if(t)try{let{ok:n,data:o}=await S.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?t.innerHTML=o.models.map(i=>`<option value="${y(i.id)}" ${i.id===e?"selected":""}>${y(i.name||i.id)}</option>`).join(""):t.innerHTML='<option value="">Test your connection to load available models</option>'}catch{t.innerHTML='<option value="">Test your connection to load available models</option>'}}function Re(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function pn(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function Xi(e,t){let s=e.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async v=>{var d;if((d=window.demoGuard)!=null&&d.call(window)){v.target.value=s;return}s=v.target.value,await S.put("/settings",{ai_provider:s}),ct()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var w,b,g,B,E;if((w=window.demoGuard)!=null&&w.call(window))return;let v=((b=i==null?void 0:i.value)==null?void 0:b.trim())||"",d=((B=(g=document.getElementById("set-base-url"))==null?void 0:g.value)==null?void 0:B.trim())||"";if(s!=="openai_compatible"&&(!v||v.startsWith("\u2022\u2022"))){un("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:u,data:m,error:h}=await S.post("/settings/test-api",{provider:s,api_key:v.startsWith("\u2022\u2022")?"":v,base_url:d});if(o.textContent="Test Connection",o.disabled=!1,u){if(un("\u2713 Connected successfully!","success"),(E=m==null?void 0:m.models)!=null&&E.length){let $=document.getElementById("set-ai-model");if($){let M=e[`ai_${s}_model`]||"";$.innerHTML=m.models.map(_=>`<option value="${y(_.id)}" ${_.id===M?"selected":""}>${y(_.name||_.id)}</option>`).join("")}}}else un("\u2717 "+((h==null?void 0:h.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),l=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var m,h,w,b,g;if((m=window.demoGuard)!=null&&m.call(window))return;a.textContent="Saving...",a.disabled=!0;let v={site_name:((w=(h=document.getElementById("set-site-name"))==null?void 0:h.value)==null?void 0:w.trim())||"",site_tagline:((g=(b=document.getElementById("set-site-tagline"))==null?void 0:b.value)==null?void 0:g.trim())||""},{ok:d,error:u}=await S.put("/settings",v);if(a.textContent="Save Identity",a.disabled=!1,l){if(l.classList.remove("hidden"),d){l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3",P.set("siteName",v.site_name),document.title=v.site_name?`Studio \u2014 ${v.site_name}`:"Studio \u2014 VoxelSite";let B=document.querySelector(".vs-logo-text");B&&(B.textContent=v.site_name||"VoxelSite")}else l.textContent="\u2717 "+((u==null?void 0:u.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3";setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3)}});let r=document.getElementById("btn-save-settings"),p=document.getElementById("save-status");r&&r.addEventListener("click",async()=>{var w,b,g,B,E;if((w=window.demoGuard)!=null&&w.call(window))return;r.textContent="Saving...",r.disabled=!0;let v={ai_provider:s,[`ai_${s}_model`]:((b=document.getElementById("set-ai-model"))==null?void 0:b.value)||"",ai_max_tokens:parseInt(((g=document.getElementById("set-max-tokens"))==null?void 0:g.value)||"32000",10),evaluator_enabled:(B=document.getElementById("set-evaluator-enabled"))!=null&&B.checked?1:0},d=document.getElementById("set-base-url");d&&(v.ai_openai_compatible_base_url=d.value.trim());let u=(E=i==null?void 0:i.value)==null?void 0:E.trim();u&&!u.startsWith("\u2022\u2022")&&(v[`ai_${s}_api_key`]=u);let{ok:m,error:h}=await S.put("/settings",v);r.textContent="Save Settings",r.disabled=!1,p&&(p.classList.remove("hidden"),m?(p.textContent="\u2713 Saved",p.className="text-xs text-vs-success ml-3"):(p.textContent="\u2717 "+((h==null?void 0:h.message)||"Failed to save."),p.className="text-xs text-vs-error ml-3"),setTimeout(()=>p==null?void 0:p.classList.add("hidden"),3e3))});let c=document.getElementById("set-evaluator-enabled");if(c){let v=c.closest("label")||c.parentElement,d=v==null?void 0:v.querySelector(".vs-toggle-track"),u=v==null?void 0:v.querySelector(".vs-toggle-thumb");c.addEventListener("change",()=>{d&&(d.style.background=c.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),u&&(u.style.left=c.checked?"18px":"2px")})}}function Qi(e,t){var u;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function l(){if(!e.smtp_host)return"gmail";for(let[m,h]of Object.entries(t))if(h.host&&h.host===e.smtp_host)return m;return"custom"}if(i){let m=l();i.value=m,a&&((u=t[m])!=null&&u.help)&&(a.textContent=t[m].help)}s&&s.addEventListener("change",()=>{let m=s.value;n&&(n.style.display=m==="smtp"?"block":"none"),o&&(o.style.display=m==="mailpit"?"block":"none");let h=document.getElementById("mail-common-fields");h&&(h.style.display=m==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let m=t[i.value];if(!m)return;let h=document.getElementById("set-smtp-host"),w=document.getElementById("set-smtp-port"),b=document.getElementById("set-smtp-encryption");h&&(h.value=m.host||""),w&&(w.value=m.port||587),b&&(b.value=m.encryption||"tls"),a&&(a.textContent=m.help||"")});let r=document.getElementById("btn-toggle-smtp-pass"),p=document.getElementById("set-smtp-password");r&&p&&r.addEventListener("click",()=>{let m=p.type==="password";p.type=m?"text":"password",r.innerHTML=m?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let c=document.getElementById("btn-mail-test");c&&c.addEventListener("click",async()=>{var B,E,$;if((B=window.demoGuard)!=null&&B.call(window))return;let m=($=(E=document.getElementById("set-mail-test-recipient"))==null?void 0:E.value)==null?void 0:$.trim();if(!m){vn("Enter an email address to send the test to.","warning");return}c.textContent="Sending...",c.disabled=!0;let h=no();h.test_recipient=m;let{ok:w,data:b,error:g}=await S.post("/settings/mail/test",h);c.textContent="Send Test",c.disabled=!1,w?vn("\u2713 "+((b==null?void 0:b.message)||"Test email sent successfully!"),"success"):vn("\u2717 "+((g==null?void 0:g.message)||"Test failed."),"error")});let v=document.getElementById("btn-save-mail"),d=document.getElementById("save-mail-status");v&&v.addEventListener("click",async()=>{var b;if((b=window.demoGuard)!=null&&b.call(window))return;v.textContent="Saving...",v.disabled=!0;let m=no(),{ok:h,error:w}=await S.post("/settings/mail",m);v.textContent="Save Email Settings",v.disabled=!1,d&&(d.classList.remove("hidden"),h?(d.textContent="\u2713 Saved",d.className="text-xs text-vs-success ml-3"):(d.textContent="\u2717 "+((w==null?void 0:w.message)||"Failed to save."),d.className="text-xs text-vs-error ml-3"),setTimeout(()=>d==null?void 0:d.classList.add("hidden"),3e3))})}function no(){var t,s,n,o,i,a,l,r,p,c,v,d,u,m,h;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((r=(l=document.getElementById("set-smtp-host"))==null?void 0:l.value)==null?void 0:r.trim())||"",smtp_port:parseInt(((p=document.getElementById("set-smtp-port"))==null?void 0:p.value)||"587",10),smtp_username:((v=(c=document.getElementById("set-smtp-username"))==null?void 0:c.value)==null?void 0:v.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((d=document.getElementById("set-smtp-encryption"))==null?void 0:d.value)||"tls",mailpit_host:((m=(u=document.getElementById("set-mailpit-host"))==null?void 0:u.value)==null?void 0:m.trim())||"localhost",mailpit_port:parseInt(((h=document.getElementById("set-mailpit-port"))==null?void 0:h.value)||"1025",10)}}function vn(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function un(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}var pt=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},St=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},mn={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},ea={contact:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',newsletter:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',callback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',feedback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'};function ro(){return setTimeout(()=>ta(),0),`
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
  `}async function ta(){var a,l,r,p,c,v;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let d=await ao();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let E=function($){let M=document.getElementById("bar-color-swatch"),_=document.getElementById("bar-brand-hex"),j=document.getElementById("bar-brand-color");M&&(M.style.background=$),_&&_!==document.activeElement&&(_.value=$),j&&(j.value=$),document.querySelectorAll(".bar-color-preset").forEach(U=>{U.style.borderColor=U.dataset.color.toLowerCase()===$.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:d,data:u}=await S.get("/agentic/actions/bar-settings"),m=d&&(u==null?void 0:u.settings)||{theme:"bottom-bar",visibility:"all-pages"},h=m.theme||"bottom-bar",w=m.visibility||"all-pages",b={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
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
      </svg>`},g={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},B={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(B).map(([$,M])=>`<option value="${$}" ${w===$?"selected":""}>${M}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(b).map(([$,M])=>{let _=$===h;return`
              <button type="button" class="bar-theme-option" data-theme="${$}" style="
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
                <div style="width: 100%; max-width: 120px;">${M}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${_?"var(--vs-accent)":"var(--vs-text-secondary)"};">${g[$]}</span>
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
              ${["light","dark"].map($=>{let M=$===(m.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${$}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${M?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${M?"#fff":"var(--vs-text-secondary)"};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${{light:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',dark:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}[$]} ${$.charAt(0).toUpperCase()+$.slice(1)}</button>`}).join("")}
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
                ${["#EA580C","#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#374151"].map($=>`
                  <button type="button" class="bar-color-preset" data-color="${$}" title="${$}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${$}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
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
    `,document.querySelectorAll(".bar-theme-option").forEach($=>{$.addEventListener("click",async()=>{let M=$.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(j=>{let U=j.dataset.theme===M;j.style.borderColor=U?"var(--vs-accent)":"var(--vs-border-subtle)",j.style.background=U?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",j.style.color=U?"var(--vs-accent)":"var(--vs-text-ghost)",j.classList.toggle("active",U);let Q=j.querySelector("span");Q&&(Q.style.color=U?"var(--vs-accent)":"var(--vs-text-secondary)");let K=j.querySelector('[style*="position: absolute"]');if(K&&!U&&K.remove(),U&&!j.querySelector('[style*="position: absolute"]')){let F=document.createElement("div");F.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",F.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',j.appendChild(F)}});let{ok:_}=await S.put("/agentic/actions/bar-settings",{theme:M});_&&($.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>$.style.boxShadow="",400),T("Bar style updated","success"))})}),(l=document.getElementById("bar-visibility"))==null||l.addEventListener("change",async $=>{let{ok:M}=await S.put("/agentic/actions/bar-settings",{visibility:$.target.value});M&&T("Bar visibility updated","success")}),document.querySelectorAll(".bar-scheme-btn").forEach($=>{$.addEventListener("click",async()=>{let M=$.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(j=>{let U=j.dataset.scheme===M;j.style.background=U?"var(--vs-accent)":"var(--vs-bg-surface)",j.style.color=U?"#fff":"var(--vs-text-secondary)"});let{ok:_}=await S.put("/agentic/actions/bar-settings",{color_scheme:M});_&&T("Color scheme updated","success")})}),(r=document.getElementById("bar-brand-color"))==null||r.addEventListener("input",$=>{E($.target.value)}),(p=document.getElementById("bar-brand-color"))==null||p.addEventListener("change",async $=>{let{ok:M}=await S.put("/agentic/actions/bar-settings",{brand_color:$.target.value});M&&T("Brand color updated","success")}),(c=document.getElementById("bar-brand-hex"))==null||c.addEventListener("change",async $=>{let M=$.target.value.trim();if(M.startsWith("#")||(M="#"+M),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(M)){E(M);let{ok:_}=await S.put("/agentic/actions/bar-settings",{brand_color:M});_&&T("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach($=>{$.addEventListener("click",async()=>{let M=$.dataset.color;E(M);let{ok:_}=await S.put("/agentic/actions/bar-settings",{brand_color:M});_&&T("Brand color updated","success")})}),E(m.brand_color||"#EA580C")}let{ok:s,data:n}=await S.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
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
    `,(v=document.getElementById("btn-empty-new-action"))==null||v.addEventListener("click",async()=>{let d=await ao();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((d,u)=>{let m=d.active,h=d._stats||d.stats||{},w=h.total||0,b=h.last_created_at?Jt(h.last_created_at):"\u2014",g={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},B=g[d.icon]||g.circle;return`
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
              ${B}
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
                <span>${w} record${w!==1?"s":""}</span>
                ${h.today>0?`<span class="vs-form-card-dot">\xB7</span><span>+${h.today} today</span>`:""}
                <span class="vs-form-card-dot">\xB7</span>
                <span>${b}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `}).join("")}
    </div>
  `,document.querySelectorAll(".vs-action-list-row").forEach(d=>{d.addEventListener("click",u=>{if(u.target.closest(".vs-action-reorder"))return;let m=d.dataset.actionId;m&&(window.location.hash="#/actions/"+encodeURIComponent(m))})});async function i(){let d=document.querySelectorAll("#actions-list .vs-action-list-row"),u=Array.from(d).map(m=>m.dataset.actionId);await S.post("/agentic/actions/reorder",{order:u})}document.querySelectorAll(".action-move-up").forEach(d=>{d.addEventListener("click",async u=>{u.preventDefault(),u.stopPropagation();let m=d.closest(".vs-action-list-row"),h=m==null?void 0:m.previousElementSibling;h&&(m.parentNode.insertBefore(m,h),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(d=>{d.addEventListener("click",async u=>{u.preventDefault(),u.stopPropagation();let m=d.closest(".vs-action-list-row"),h=m==null?void 0:m.nextElementSibling;h&&(m.parentNode.insertBefore(h,m),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})})}async function ao(){return new Promise(async e=>{var l;let{ok:t,data:s}=await S.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
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
            ${n.map(r=>`
              <button class="vs-template-card" data-template-id="${y(r.id)}" style="
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 12px; border-radius: 10px;
                border: 1.5px solid var(--vs-border);
                background: var(--vs-bg-floating);
                cursor: pointer; transition: all 0.15s ease;
                text-align: center; gap: 6px;
              ">
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${ea[r.id]||x.zap}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary);">${y(r.name)}</span>
                <span style="font-size: 11px; color: var(--vs-text-tertiary); line-height: 1.3;">${y(r.description||"")}</span>
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
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(r=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(r)},a=r=>{r.key==="Escape"&&(r.preventDefault(),i())};document.addEventListener("keydown",a),fe(o,i),(l=document.getElementById("close-new-action-modal"))==null||l.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(r=>{r.addEventListener("mouseenter",()=>{r.style.borderColor="var(--vs-accent)",r.style.background="var(--vs-bg-raised)"}),r.addEventListener("mouseleave",()=>{r.style.borderColor=(r.dataset.templateId==="blank","var(--vs-border)"),r.style.background=r.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),r.addEventListener("click",async()=>{var c,v;let p=r.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(d=>{d.style.pointerEvents="none",d.style.opacity="0.5"}),r.style.opacity="1",r.style.borderColor="var(--vs-accent)",p==="blank"){let d={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"email",type:"email",label:"Email",placeholder:"you@example.com",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:u,data:m}=await S.post("/agentic/actions",d);u&&(m!=null&&m.action)?(T("Action created","success"),i({ok:!0,actionId:m.action.id})):(T(((c=m==null?void 0:m.error)==null?void 0:c.message)||"Failed to create action","error"),i())}else{let{ok:d,data:u}=await S.post("/agentic/actions/from-template",{template_id:p});d&&(u!=null&&u.action)?(T(`${u.action.name} created`,"success"),i({ok:!0,actionId:u.action.id})):(T(((v=u==null?void 0:u.error)==null?void 0:v.message)||"Failed to create action","error"),i())}})})})}function lo(e){return setTimeout(()=>Bs(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function Bs(e){var p,c,v,d,u,m,h,w,b,g,B,E,$,M,_,j,U,Q,K,F;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await S.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,l=i.stats||{},r=a.active;if(t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${y(a.name||e)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${y(a.name||e)}</h1>
        <div class="flex items-center gap-2">
          <button id="btn-toggle-active" class="vs-btn ${r?"vs-btn-secondary":"vs-btn-primary"} vs-btn-sm" title="${r?"Deactivate this action":"Activate this action on your website"}">
            ${r?"\u25CF Live \u2014 click to deactivate":"\u25CB Draft \u2014 click to go live"}
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
        <span class="vs-form-stat-value">${l.total||0}</span>
        <span class="vs-form-stat-label">Total</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-info)">${((p=l.by_status)==null?void 0:p.pending)||0}</span>
        <span class="vs-form-stat-label">Pending</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${((c=l.by_status)==null?void 0:c.confirmed)||0}</span>
        <span class="vs-form-stat-label">Confirmed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${((v=l.by_status)==null?void 0:v.completed)||0}</span>
        <span class="vs-form-stat-label">Completed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${l.today||0}</span>
        <span class="vs-form-stat-label">Today</span>
      </div>
    </div>
  `,s){let V=function(k){let q=k.querySelector(".field-required");if(!q)return;let A=k.querySelectorAll("span")[0],f=k.querySelectorAll("span")[1],L=()=>{A.style.background=q.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",f.style.left=q.checked?"18px":"2px"};q.addEventListener("change",L)},ue=function(k){return k.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},me=function(){let k=document.querySelectorAll("#action-fields-builder .vs-field-row"),q=[],A=new Set;return k.forEach(f=>{var Y,G,W,te;let L=((G=(Y=f.querySelector(".field-label"))==null?void 0:Y.value)==null?void 0:G.trim())||"",I=((W=f.querySelector(".field-type"))==null?void 0:W.value)||"text",H=((te=f.querySelector(".field-required"))==null?void 0:te.checked)||!1,D=L?ue(L):"";if(A.has(D)){let J=2;for(;A.has(D+"_"+J);)J++;D=D+"_"+J}if(A.add(D),D&&L){let J={name:D,type:I,label:L,required:H},se=f.dataset.placeholder;se&&(J.placeholder=se);let re=f.dataset.default;re&&(J.default_value=re);let Ce=f.dataset.description;Ce&&(J.description=Ce);let ge=f.dataset.min;ge!==""&&ge!==void 0&&(J.min=Number(ge));let ye=f.dataset.max;ye!==""&&ye!==void 0&&(J.max=Number(ye));let ke=f.dataset.maxlength;ke&&(J.max_length=Number(ke));let Be=f.dataset.minlength;Be&&(J.min_length=Number(Be));let ne=f.dataset.options;if(ne)try{J.options=JSON.parse(ne)}catch{J.options=ne.split(",").map(ve=>ve.trim()).filter(Boolean)}if(I==="file"){let X=f.dataset.allowedExtensions;if(X)try{J.allowed_extensions=JSON.parse(X)}catch{J.allowed_extensions=X.split(",").map(ht=>ht.trim().toLowerCase()).filter(Boolean)}let ve=f.dataset.maxSizeMb;ve&&(J.max_size_mb=Number(ve))}I==="checkbox"&&f.dataset.checkedDefault==="true"&&(J.checked_default=!0),q.push(J)}}),q},De=function(k){var q,A;(q=k.querySelector(".field-move-up"))==null||q.addEventListener("click",()=>{let f=k.previousElementSibling;f&&(k.parentNode.insertBefore(k,f),k.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>k.style.boxShadow="",300))}),(A=k.querySelector(".field-move-down"))==null||A.addEventListener("click",()=>{let f=k.nextElementSibling;f&&(k.parentNode.insertBefore(f,k),k.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>k.style.boxShadow="",300))})},We=function(k){k.addEventListener("click",async()=>{let q=k.closest(".vs-field-row");await be({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&(q.style.opacity="0",q.style.transform="translateX(20px)",q.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>q.remove(),200))})},Ye=function(k){k&&k.addEventListener("click",()=>{var L,I,H;let q=k.closest(".vs-field-row");if(!q)return;let A=((L=q.querySelector(".field-type"))==null?void 0:L.value)||"text",f=((I=q.querySelector(".field-label"))==null?void 0:I.value)||((H=q.querySelector(".field-name"))==null?void 0:H.value)||"Field";mt(q,A,f)})},mt=function(k,q,A){var ht,Pe,zt,Ot,Sn;(ht=document.getElementById("vs-field-settings-modal"))==null||ht.remove();let f=k.dataset.placeholder||"",L=k.dataset.default||"",I=k.dataset.min||"",H=k.dataset.max||"",D=k.dataset.maxlength||"",Y=k.dataset.options||"[]",G=k.dataset.description||"",W=["text","email","tel","url","textarea"].includes(q),te=q==="number",J=["text","email","tel","url","textarea"].includes(q),se=["select","radio","multiselect"].includes(q),re=q==="multiselect",Ce=q==="file",ge=q==="checkbox",ye="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",ke="margin-bottom: 16px;",Be="";if(W&&(Be+=`<div style="${ke}">
          <label style="${ye}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${le(f)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),!Ce&&!ge&&(Be+=`<div style="${ke}">
          <label style="${ye}">Default Value</label>
          <input type="${te?"number":"text"}" id="fs-default" class="vs-input" value="${le(L)}" placeholder="Pre-filled value" />
        </div>`),ge&&(Be+=`<div style="${ke}">
          <label style="${ye}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked \u2014 defaults to field name if empty)</span></label>
          <input type="text" id="fs-default" class="vs-input" value="${le(L)}" placeholder="e.g. yes, true, 1" />
        </div>
        <div style="${ke}">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="fs-checked-default" ${k.dataset.checkedDefault==="true"?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${k.dataset.checkedDefault==="true"?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span style="
                position: absolute; left: ${k.dataset.checkedDefault==="true"?"18px":"2px"}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <span style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary);">Selected by default</span>
          </label>
        </div>`),te&&(Be+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${ke}">
          <div>
            <label style="${ye}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${le(I)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${ye}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${le(H)}" placeholder="No limit" />
          </div>
        </div>`),J&&(Be+=`<div style="${ke}">
          <label style="${ye}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${le(D)}" placeholder="No limit" min="1" />
        </div>`),se){let xe;try{xe=JSON.parse(Y)}catch{xe=Y.split(",").map(Te=>Te.trim()).filter(Boolean)}let Me;if(re){let $e=(k.dataset.default||"").split(",").map(Te=>Te.trim()).filter(Boolean);Me=xe.map(Te=>$e.includes(Te)?"[x] "+Te:Te).join(`
`)}else Me=xe.join(`
`);Be+=`<div style="${ke}">
          <label style="${ye}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${re?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${re?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${y(Me)}</textarea>
        </div>`}if(Ce){let xe=k.dataset.allowedExtensions||"",Me=k.dataset.maxSizeMb||"10",$e;try{$e=xe?JSON.parse(xe):[]}catch{$e=[]}let Te=$e.join(", "),Ne=["pdf","doc","docx","xls","xlsx","csv","txt"],Ut=["jpg","jpeg","png","gif","webp"],Vt=["zip","rar"],hs=Ne.some(at=>$e.includes(at)),fs=Ut.some(at=>$e.includes(at)),bs=Vt.some(at=>$e.includes(at));Be+=`<div style="${ke}">
          <label style="${ye}">Allowed File Types</label>
          <div style="display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Ne)}' ${hs?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Documents
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Ut)}' ${fs?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Images
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Vt)}' ${bs?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Archives
            </label>
          </div>
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${le(Te)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${ke}">
          <label style="${ye}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${le(Me)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`}Be+=`<div style="${ke}">
        <label style="${ye}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${le(G)}" placeholder="Optional description or instructions" />
      </div>`;let ne=document.createElement("div");if(ne.id="vs-field-settings-modal",ne.style.cssText="position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;",ne.innerHTML=`
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
                ${y(A)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${q}
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
      `,document.body.appendChild(ne),setTimeout(()=>{var xe;return(xe=ne.querySelector("input, textarea"))==null?void 0:xe.focus()},100),Ce&&ne.querySelectorAll(".fs-ext-group").forEach(xe=>{xe.addEventListener("change",()=>{let Me=ne.querySelector("#fs-allowed-extensions");if(!Me)return;let $e=Me.value.split(",").map(Ne=>Ne.trim().toLowerCase()).filter(Boolean),Te=JSON.parse(xe.dataset.exts||"[]");xe.checked?Te.forEach(Ne=>{$e.includes(Ne)||$e.push(Ne)}):$e=$e.filter(Ne=>!Te.includes(Ne)),Me.value=$e.join(", ")})}),ge){let xe=(Pe=ne.querySelector("#fs-checked-default"))==null?void 0:Pe.closest("label");if(xe){let Me=ne.querySelector("#fs-checked-default"),$e=xe.querySelectorAll("span > span")[0],Te=xe.querySelectorAll("span > span")[1];Me==null||Me.addEventListener("change",()=>{$e&&($e.style.background=Me.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),Te&&(Te.style.left=Me.checked?"18px":"2px")})}}let X=()=>ne.remove(),ve=ne.querySelector("#fs-backdrop");ve&&fe(ve,X),(zt=ne.querySelector("#fs-close"))==null||zt.addEventListener("click",X),(Ot=ne.querySelector("#fs-cancel"))==null||Ot.addEventListener("click",X);let gt=xe=>{xe.key==="Escape"&&(X(),document.removeEventListener("keydown",gt))};document.addEventListener("keydown",gt),(Sn=ne.querySelector("#fs-save"))==null||Sn.addEventListener("click",()=>{var xe,Me,$e,Te,Ne,Ut,Vt,hs,fs,bs;if(W&&(k.dataset.placeholder=((xe=ne.querySelector("#fs-placeholder"))==null?void 0:xe.value)||""),Ce||(k.dataset.default=((Me=ne.querySelector("#fs-default"))==null?void 0:Me.value)||""),ge&&(k.dataset.checkedDefault=($e=ne.querySelector("#fs-checked-default"))!=null&&$e.checked?"true":"false"),te&&(k.dataset.min=((Te=ne.querySelector("#fs-min"))==null?void 0:Te.value)||"",k.dataset.max=((Ne=ne.querySelector("#fs-max"))==null?void 0:Ne.value)||""),J&&(k.dataset.maxlength=((Ut=ne.querySelector("#fs-maxlength"))==null?void 0:Ut.value)||""),se){let Wt=(((Vt=ne.querySelector("#fs-options"))==null?void 0:Vt.value)||"").split(/[\n]/).map(ft=>ft.trim()).filter(Boolean);if(re){let ft=[],ys=[];Wt.forEach(Bn=>{let Us=Bn.match(/^\[x\]\s*(.+)$/i);Us?(ft.push(Us[1].trim()),ys.push(Us[1].trim())):ft.push(Bn)}),k.dataset.options=JSON.stringify(ft),k.dataset.default=ys.join(",")}else k.dataset.options=JSON.stringify(Wt)}if(Ce){let Wt=(((hs=ne.querySelector("#fs-allowed-extensions"))==null?void 0:hs.value)||"").split(",").map(ys=>ys.trim().toLowerCase()).filter(Boolean);k.dataset.allowedExtensions=Wt.length>0?JSON.stringify(Wt):"";let ft=((fs=ne.querySelector("#fs-max-size-mb"))==null?void 0:fs.value)||"10";k.dataset.maxSizeMb=String(Math.min(Math.max(parseInt(ft)||10,1),50))}k.dataset.description=((bs=ne.querySelector("#fs-description"))==null?void 0:bs.value)||"",k.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>k.style.boxShadow="",400),X(),T("Field settings updated","success")})},Z="make_"+e.replace(/-/g,"_"),ce={number:"number",checkbox:"boolean",multiselect:"array"},R={},C=[];(a.fields||[]).forEach(k=>{let A={type:ce[k.type]||"string"},f=k.label||k.name;k.require_future?A.description=f+" (must be in the future)":f&&(A.description=f),k.min!==void 0&&k.min!==""&&(A.minimum=k.min),k.max!==void 0&&k.max!==""&&(A.maximum=k.max),k.min_length&&(A.minLength=k.min_length),k.max_length&&(A.maxLength=k.max_length),k.options&&k.options.length>0&&(k.type==="multiselect"?A.items={type:"string",enum:k.options}:A.enum=k.options),R[k.name]=A,k.required&&C.push(k.name)});let N={name:Z,description:a.description||a.name,inputSchema:{type:"object",properties:R,required:C}},z=JSON.stringify(N,null,2),O=y(z),ee=r?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">\u25CF Discoverable by agents</span>':'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">\u25CB Draft \u2014 not visible to agents</span>',ie=['<div style="margin-bottom: 16px;">','<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">','<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',`<code style="font-size:13px;font-weight:600;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">`+y(Z)+"</code>","</div>",'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">','<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'," /mcp.php","</span>",'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'," /actions/manifest.json","</span>",ee,"</div>","</div>",'<div style="position: relative;">',`<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">`+O+"</code></pre>",`<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor='var(--vs-border)';this.style.color='var(--vs-text-secondary)';" onmouseleave="this.style.borderColor='var(--vs-border-subtle)';this.style.color='var(--vs-text-ghost)';">`+x.copy+"</button>","</div>",'<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',`This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site's MCP endpoint.<br>`,'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',"</p>"].join("");s.innerHTML=`
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
              <input type="text" id="action-button-label" class="vs-input" value="${y(a.bar_button_label||"")}" placeholder="${le(a.name||"e.g. Register")}" />
              <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Short label for the bar button. Defaults to the action name.</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-vs-text-secondary mb-1">Icon</label>
              <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${[["calendar","Calendar"],["clock","Clock"],["utensils","Utensils"],["file-text","Document"],["list","List"],["shopping-bag","Shop"],["ticket","Ticket"],["message-square","Message"],["users","People"],["mail","Mail"],["star","Star"],["circle","Default"]].map(([k,q])=>`
                  <button type="button" class="vs-icon-pick" data-icon="${k}" title="${q}" style="
                    display: flex; align-items: center; justify-content: center;
                    width: 42px; height: 42px; border-radius: var(--radius-md);
                    border: 1.5px solid ${(a.icon||"circle")===k?"var(--vs-accent)":"var(--vs-border)"};
                    background: ${(a.icon||"circle")===k?"var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))":"var(--vs-bg-floating)"};
                    color: ${(a.icon||"circle")===k?"var(--vs-accent)":"var(--vs-text-ghost)"};
                    cursor: pointer; transition: all 0.15s ease;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',"shopping-bag":'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',circle:'<circle cx="12" cy="12" r="10"/>'}[k]}</svg></button>
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
                  <input type="checkbox" id="action-allow-duplicates" ${(u=(d=a.constraints)==null?void 0:d.uniqueness)!=null&&u.enabled?"":"checked"} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                  <span class="vs-toggle-track" style="
                    position: absolute; inset: 0; border-radius: 10px;
                    background: ${(h=(m=a.constraints)==null?void 0:m.uniqueness)!=null&&h.enabled?"var(--vs-border-medium, #ccc)":"var(--vs-accent)"};
                    transition: background 0.2s ease;
                  "></span>
                  <span class="vs-toggle-thumb" style="
                    position: absolute; left: ${(b=(w=a.constraints)==null?void 0:w.uniqueness)!=null&&b.enabled?"2px":"18px"}; top: 2px;
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: left 0.2s ease;
                  "></span>
                </span>
                <span style="font-size: 13px; color: var(--vs-text-secondary);">Same email can submit multiple times</span>
              </label>
            </div>
            <div id="action-duplicate-msg-wrap" style="${(B=(g=a.constraints)==null?void 0:g.uniqueness)!=null&&B.enabled?"":"display: none;"}">
              <label for="action-duplicate-msg" class="block text-sm font-medium text-vs-text-secondary mb-1">Rejection message</label>
              <input type="text" id="action-duplicate-msg" class="vs-input" value="${y(((E=a.responses)==null?void 0:E.duplicate)||"")}"
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
          ${(a.fields||[]).map((k,q)=>`
            <div class="vs-field-row" data-field-idx="${q}"
              data-field-name="${le(k.name||"")}"
              data-placeholder="${le(k.placeholder||"")}"
              data-default="${le(k.default_value||k.default||"")}"
              data-min="${k.min!==void 0?k.min:""}"
              data-max="${k.max!==void 0?k.max:""}"
              data-maxlength="${k.max_length||""}"
              data-minlength="${k.min_length||""}"
              data-options="${le(JSON.stringify(k.options||[]))}"
              data-description="${le(k.description||"")}"
              ${k.allowed_extensions?`data-allowed-extensions="${le(JSON.stringify(k.allowed_extensions))}"`:""}
              ${k.max_size_mb?`data-max-size-mb="${k.max_size_mb}"`:""}
              ${k.checked_default?'data-checked-default="true"':""}
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
                " ${q===0?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${q===(a.fields||[]).length-1?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${y(k.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(A=>`<option value="${A}" ${k.type===A?"selected":""}>${A==="multiselect"?"multi-select":A}</option>`).join("")}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${k.required?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${k.required?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${k.required?"18px":"2px"}; top: 2px;
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
          ${ie}
        </div>
      </details>
    `,document.querySelectorAll(".field-required").forEach(k=>{V(k.closest("label"))});let ae=document.getElementById("action-allow-duplicates");if(ae){let k=ae.closest("label"),q=k==null?void 0:k.querySelector(".vs-toggle-track"),A=k==null?void 0:k.querySelector(".vs-toggle-thumb");ae.addEventListener("change",()=>{q&&(q.style.background=ae.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),A&&(A.style.left=ae.checked?"18px":"2px");let f=document.getElementById("action-duplicate-msg-wrap");f&&(f.style.display=ae.checked?"none":"")})}document.querySelectorAll(".vs-icon-pick").forEach(k=>{k.addEventListener("mouseenter",()=>{var q;k.dataset.icon!==((q=document.getElementById("action-icon"))==null?void 0:q.value)&&(k.style.borderColor="var(--vs-accent)",k.style.color="var(--vs-text-secondary)")}),k.addEventListener("mouseleave",()=>{var q;k.dataset.icon!==((q=document.getElementById("action-icon"))==null?void 0:q.value)&&(k.style.borderColor="var(--vs-border)",k.style.color="var(--vs-text-ghost)")}),k.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach(q=>{q.style.borderColor="var(--vs-border)",q.style.background="var(--vs-bg-floating)",q.style.color="var(--vs-text-ghost)"}),k.style.borderColor="var(--vs-accent)",k.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",k.style.color="var(--vs-accent)",document.getElementById("action-icon").value=k.dataset.icon})}),($=document.getElementById("btn-save-action"))==null||$.addEventListener("click",async()=>{var I,H,D,Y,G,W,te,J,se;if(pt()||St())return;let k={...a};if(k.name=((I=document.getElementById("action-name"))==null?void 0:I.value)||a.name,k.bar_button_label=((H=document.getElementById("action-button-label"))==null?void 0:H.value)||"",k.description=((D=document.getElementById("action-description"))==null?void 0:D.value)||"",k.icon=((Y=document.getElementById("action-icon"))==null?void 0:Y.value)||"circle",((G=document.getElementById("action-allow-duplicates"))==null?void 0:G.checked)??!0)(W=k.constraints)!=null&&W.uniqueness&&(k.constraints.uniqueness.enabled=!1);else{let re=(a.fields||[]).filter(ge=>ge.type==="email").map(ge=>ge.name),Ce=re.length>0?re:["email"];k.constraints={...k.constraints||{},uniqueness:{enabled:!0,fields:Ce,scope_statuses:["confirmed","pending"]}}}let A=((te=document.getElementById("action-duplicate-msg"))==null?void 0:te.value)||"";A?k.responses={...k.responses||{},duplicate:A}:(J=k.responses)!=null&&J.duplicate&&delete k.responses.duplicate;let{ok:f,data:L}=await S.put(`/agentic/actions/${encodeURIComponent(e)}`,k);T(f?"Action saved":((se=L==null?void 0:L.error)==null?void 0:se.message)||"Failed to save",f?"success":"error"),f&&Bs(e)});async function Ve(){var H;let k=document.querySelectorAll("#action-fields-builder .vs-field-row"),q=!1;if(k.forEach(D=>{var G,W;(W=(G=D.querySelector(".field-label"))==null?void 0:G.value)!=null&&W.trim()||(q=!0,D.style.borderColor="var(--vs-error, #ef4444)",D.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{D.style.borderColor="var(--vs-border-subtle)",D.style.boxShadow=""},2e3))}),q){T("Every field needs a label","warning");return}let A=me();if(A.length===0){T("At least one field is required","warning");return}let f={...a,fields:A},{ok:L,data:I}=await S.put(`/agentic/actions/${encodeURIComponent(e)}`,f);T(L?"Fields saved":((H=I==null?void 0:I.error)==null?void 0:H.message)||"Failed to save",L?"success":"error"),L&&Bs(e)}(M=document.getElementById("btn-save-fields"))==null||M.addEventListener("click",Ve),(_=document.getElementById("btn-add-field"))==null||_.addEventListener("click",()=>{var f,L;let k=document.getElementById("action-fields-builder");if(!k)return;let q=document.createElement("div");q.className="vs-field-row",q.dataset.fieldName="",q.dataset.placeholder="",q.dataset.default="",q.dataset.min="",q.dataset.max="",q.dataset.maxlength="",q.dataset.options="",q.dataset.description="",q.style.cssText=`
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;let A='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';q.innerHTML=`
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
          ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(I=>`<option value="${I}">${I==="multiselect"?"multi-select":I}</option>`).join("")}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${A}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${x.trash}
        </button>
      `,k.appendChild(q),(f=q.querySelector(".field-label"))==null||f.focus(),V((L=q.querySelector(".field-required"))==null?void 0:L.closest("label")),De(q),We(q.querySelector(".field-delete")),Ye(q.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(De),document.querySelectorAll(".field-delete").forEach(We),document.querySelectorAll(".field-settings").forEach(Ye),(j=document.getElementById("btn-copy-schema"))==null||j.addEventListener("click",()=>{var q;let k=((q=document.getElementById("agent-schema-json"))==null?void 0:q.textContent)||"";navigator.clipboard.writeText(k).then(()=>{T("Schema copied","success")}).catch(()=>{let A=document.createElement("textarea");A.value=k,A.style.position="fixed",A.style.opacity="0",document.body.appendChild(A),A.select(),document.execCommand("copy"),document.body.removeChild(A),T("Schema copied","success")})}),(U=document.getElementById("agent-preview-section"))==null||U.addEventListener("toggle",k=>{let q=k.target.querySelector(".agent-preview-chevron");q&&(q.style.transform=k.target.open?"rotate(180deg)":"rotate(0)")}),(Q=document.getElementById("btn-toggle-active"))==null||Q.addEventListener("click",async()=>{if(pt()||St())return;let k={...a,active:!r},{ok:q}=await S.put(`/agentic/actions/${encodeURIComponent(e)}`,k);q?(T(k.active?"Action activated":"Action deactivated","success"),Bs(e)):T("Failed to update status","error")}),(K=document.getElementById("btn-duplicate-action"))==null||K.addEventListener("click",async()=>{var f;if(pt()||St()||!await be({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:q,data:A}=await S.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});q&&(A!=null&&A.action)?(T(`"${A.action.name}" created`,"success"),window.location.hash=`#/actions/${A.action.id}`):T(((f=A==null?void 0:A.error)==null?void 0:f.message)||"Failed to duplicate","error")}),(F=document.getElementById("btn-delete-action"))==null||F.addEventListener("click",async()=>{if(pt()||St())return;if(await be({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:q}=await S.delete(`/agentic/actions/${encodeURIComponent(e)}`);q?(T("Action deleted","success"),window.location.hash="#/actions"):T("Failed to delete action","error")}})}await Ht(e,1)}async function Ht(e,t=1){var m,h,w,b,g,B,E,$;let s=document.getElementById("action-records");if(!s)return;let n=((m=document.getElementById("action-filter-status"))==null?void 0:m.value)||"all",o=((h=document.getElementById("action-filter-search"))==null?void 0:h.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:l}=await S.get(i);if(!a||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let r=l.records||[],p=l.total||0,c=l.per_page||20,v=Math.ceil(p/c);s.innerHTML=`
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
          ${window.IS_DEMO?"":`<button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old records" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""}>
            ${x.trash} Purge Old
          </button>`}

          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${p===0?"No records to export":"Download records as CSV"}">
            ${x.download} Export CSV
          </button>
        </div>
      </div>

      ${r.length===0?`
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
              ${r.map(M=>{let _=typeof M.data=="string"?JSON.parse(M.data):M.data,j=Object.fromEntries(Object.entries(_||{}).filter(([R])=>!R.startsWith("_"))),U=Object.values(j).filter(R=>typeof R=="string"&&R.length>0).slice(0,2).join(" \xB7 "),Q=Object.values(j).filter(R=>R&&typeof R=="object"&&R.original_name).length,K=Q>0?`<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${U?"6px":"0"};" title="${Q} file${Q>1?"s":""} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${Q>1?'<span style="font-size: 10px;">'+Q+"</span>":""}</span>`:"",F=U||(Q>0?"":"\u2014"),Z=mn[M.status]||mn.pending,ce=M.source==="web"?"Website":M.source==="mcp"?"MCP":M.source==="api"?"API":M.source||"Website";return`
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
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${y(F)}</span>${K}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${M.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                        ${Object.entries(mn).map(([R,C])=>`<option value="${R}" ${M.status===R?"selected":""}>${C.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${ce}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${Jt(M.created_at)}</td>
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
                        ${Object.entries(j).map(([R,C])=>{if(C&&typeof C=="object"&&C.path&&C.original_name){let N=C.size<1024?C.size+" B":C.size<1048576?Math.round(C.size/1024)+" KB":(C.size/1048576).toFixed(1)+" MB";return`
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(R.replace(/_/g," "))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="/_studio/api/router.php?_path=/agentic/actions/${encodeURIComponent(e)}/records/${M.id}/files/${encodeURIComponent(R)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${y(C.original_name)} (${N})
                                </a>
                              </div>
                            `}return`
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${y(R.replace(/_/g," "))}</div>
                            <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${y(String(C||"\u2014"))}</div>
                          `}).join("")}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>

        ${v>1?`
          <div class="flex items-center justify-between" style="padding: 12px 0; font-size: 13px;">
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-prev" ${t<=1?"disabled":""} data-page="${t-1}">\u2190 Previous</button>
            <span class="text-vs-text-tertiary">Page ${t} of ${v} \xB7 ${p} record${p!==1?"s":""}</span>
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-next" ${t>=v?"disabled":""} data-page="${t+1}">Next \u2192</button>
          </div>
        `:`
          <div class="text-sm text-vs-text-ghost text-center" style="padding: 8px 0;">${p} record${p!==1?"s":""}</div>
        `}
      `}
    </div>
  `;let d=null,u=()=>Ht(e,1);(w=document.getElementById("action-filter-status"))==null||w.addEventListener("change",u),(b=document.getElementById("action-filter-search"))==null||b.addEventListener("input",()=>{clearTimeout(d),d=setTimeout(u,300)}),(g=document.getElementById("action-records-prev"))==null||g.addEventListener("click",M=>{let _=parseInt(M.currentTarget.dataset.page);_>=1&&Ht(e,_)}),(B=document.getElementById("action-records-next"))==null||B.addEventListener("click",M=>{let _=parseInt(M.currentTarget.dataset.page);_<=v&&Ht(e,_)}),s.querySelectorAll(".vs-record-toggle").forEach(M=>{M.addEventListener("click",()=>{let _=M.dataset.rid,j=s.querySelector(`.vs-record-detail[data-detail-for="${_}"]`);if(!j)return;let U=j.style.display!=="none";j.style.display=U?"none":"table-row",M.style.transform=U?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(M=>{M.addEventListener("change",async _=>{var K;if(pt()){M.value=((K=M.querySelector("[selected]"))==null?void 0:K.value)||"pending";return}if(St())return;let j=_.target.dataset.recordId,U=_.target.value,{ok:Q}=await S.put(`/agentic/actions/${encodeURIComponent(e)}/records/${j}`,{status:U});T(Q?"Status updated":"Failed to update",Q?"success":"error")})}),(E=document.getElementById("btn-purge-records"))==null||E.addEventListener("click",async()=>{var Q,K;if(pt()||St())return;let M=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],_=document.getElementById("vs-purge-overlay");_&&_.remove();let j=document.createElement("div");j.id="vs-purge-overlay",j.className="vs-modal-overlay",j.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Records</h2>
          <p class="vs-modal-desc">Remove records older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${M.map(F=>`<option value="${F.days}">${F.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(j),requestAnimationFrame(()=>j.classList.add("is-visible"));let U=()=>he(j);fe(j,U),(Q=document.getElementById("vs-purge-cancel"))==null||Q.addEventListener("click",U),(K=document.getElementById("vs-purge-ok"))==null||K.addEventListener("click",async()=>{var z;let F=document.getElementById("vs-purge-select"),Z=parseInt(F==null?void 0:F.value),ce=((z=F==null?void 0:F.selectedOptions[0])==null?void 0:z.textContent)||"";if(U(),await new Promise(O=>setTimeout(O,200)),!await be({title:"Confirm Purge",description:`This will permanently delete all records "${ce.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:C,data:N}=await S.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:Z});C?(T(`${(N==null?void 0:N.purged)||0} record(s) purged`,"success"),Ht(e,1)):T("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(M=>{M.addEventListener("click",async()=>{if(pt()||St())return;let _=M.dataset.rid;if(!await be({title:"Delete Record",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:U}=await S.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${_}`);U?(T("Record deleted","success"),Ht(e,t)):T("Failed to delete record","error")})}),($=document.getElementById("btn-export-action-csv"))==null||$.addEventListener("click",async()=>{if(pt())return;let M=document.getElementById("btn-export-action-csv"),_=M.innerHTML;M.innerHTML=`${x.loader} Exporting...`,M.disabled=!0;try{let j=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!j.ok)throw new Error("Export failed");let U=await j.blob(),Q=URL.createObjectURL(U),K=document.createElement("a");K.href=Q,K.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(K),K.click(),K.remove(),URL.revokeObjectURL(Q),T("CSV downloaded","success")}catch{T("Failed to export CSV","error")}M.innerHTML=_,M.disabled=!1})}var is=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},as=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Oe={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function po(){return setTimeout(()=>sa(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function sa(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await S.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
  `}function vo(e){return setTimeout(()=>na(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function na(e){var d,u;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await S.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
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
          ${x.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${a.total===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${a.total===0?"No submissions to export":"Download submissions as CSV"}">
          ${x.download} Export CSV
        </button>
      </div>
    </div>
  `;let l=document.getElementById("form-filter-status"),r=document.getElementById("form-filter-source"),p=document.getElementById("form-filter-search"),c=null,v=()=>Ms(e,1);l==null||l.addEventListener("change",v),r==null||r.addEventListener("change",v),p==null||p.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(v,300)}),(d=document.getElementById("btn-export-csv"))==null||d.addEventListener("click",async()=>{let m=document.getElementById("btn-export-csv"),h=m.innerHTML;m.innerHTML=`${x.loader} Exporting...`,m.disabled=!0;try{let w=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!w.ok)throw new Error("Export failed");let b=await w.blob(),g=URL.createObjectURL(b),B=document.createElement("a");B.href=g,B.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(B),B.click(),B.remove(),URL.revokeObjectURL(g),T("CSV downloaded","success")}catch{T("Failed to export CSV","error")}m.innerHTML=h,m.disabled=!1}),(u=document.getElementById("btn-upgrade-to-action"))==null||u.addEventListener("click",async()=>{var g,B;if(is()||as())return;let m=(i.fields||[]).length;if(!await be({title:"Upgrade to Agent Action",description:`This will create a new agent action with${m>0?` the ${m} field${m!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let w=document.getElementById("btn-upgrade-to-action"),b=w.innerHTML;w.innerHTML=`${x.loader} Converting...`,w.disabled=!0,w.style.opacity="0.6";try{let E={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},$=[],M=0;(i.fields||[]).forEach(F=>{let Z=E[F.type];if(!Z){M++;return}let ce={name:F.name,label:F.label||F.name,type:Z,required:F.required||!1};(Z==="select"||Z==="radio")&&F.options&&(ce.options=F.options),F.placeholder&&(ce.placeholder=F.placeholder),$.push(ce)}),M>0&&T(`${M} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let _=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),j=Date.now().toString(36).slice(-4),U={id:_+"-"+j,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:$,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:Q,data:K}=await S.post("/agentic/actions",U);if(Q&&(K!=null&&K.action))T(`"${K.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${K.action.id}`;else{let Z=(((g=K==null?void 0:K.error)==null?void 0:g.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":((B=K==null?void 0:K.error)==null?void 0:B.message)||"Failed to create action";T(Z,"error"),w.innerHTML=b,w.disabled=!1,w.style.opacity=""}}catch{T("Failed to convert form to action","error"),w.innerHTML=b,w.disabled=!1,w.style.opacity=""}}),await Ms(e,1)}async function Ms(e,t=1){var w,b,g;let s=document.getElementById("form-submissions");if(!s)return;let n=((w=document.getElementById("form-filter-status"))==null?void 0:w.value)||"all",o=((b=document.getElementById("form-filter-source"))==null?void 0:b.value)||"all",i=((g=document.getElementById("form-filter-search"))==null?void 0:g.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:l,data:r}=await S.get(a);if(!l||!r){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let p=r.submissions||[],c=r.total||0,v=r.per_page||20,d=Math.ceil(c/v);if(!p.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:u}=await S.get(`/forms/${encodeURIComponent(e)}`),m=u==null?void 0:u.form,h={};m!=null&&m.fields&&m.fields.forEach(B=>{h[B.name]=B.label||B.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${p.map(B=>{let E=Oe[B.status]||Oe.new,$=Object.entries(B.data||{}).filter(([j])=>!j.startsWith("_")).slice(0,3).map(([j,U])=>{let Q=h[j]||j,K=Array.isArray(U)?U.join(", "):String(U);return`<span class="vs-sub-field"><strong>${y(Q)}:</strong> ${y(K.substring(0,80))}${K.length>80?"\u2026":""}</span>`}).join(""),M=Jt(B.created_at),_=B.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${B.id}" data-form-id="${y(e)}" style="border-left-color: ${E.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${E.bg}; color: ${E.text};">${E.label}</span>
                ${_?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${y(M)}</span>
            </div>
            <div class="vs-submission-preview">
              ${$||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${B.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${B.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                ${Object.entries(Oe).map(([j,U])=>`<option value="${j}" ${B.status===j?"selected":""}>${U.label}</option>`).join("")}
              </select>
              ${window.IS_DEMO?"":`<button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${B.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>`}
            </div>
          </div>
        `}).join("")}
    </div>

    ${d>1?`
      <div class="vs-pagination">
        ${t>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t-1}" data-form-id="${y(e)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${t} of ${d} \xB7 ${c} submission${c!==1?"s":""}</span>
        ${t<d?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t+1}" data-form-id="${y(e)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${c} submission${c!==1?"s":""}</span>
      </div>
    `}
  `,oa(e,t)}function oa(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;co(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{var i;if(is()){s.value=s.dataset.originalValue||((i=s.querySelector("[selected]"))==null?void 0:i.value)||"new";return}if(as())return;let n=s.dataset.subId,{ok:o}=await S.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){T("Status updated","success");let a=s.closest(".vs-submission-card"),l=Oe[s.value];if(a&&l){a.style.borderLeftColor=l.text;let r=a.querySelector(".vs-status-pill");r&&(r.style.background=l.bg,r.style.color=l.text,r.textContent=l.label)}}else T("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{if(is()||as())return;let n=s.dataset.subId;if(!await be({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await S.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(T("Submission deleted","success"),Ms(e,t)):T("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);Ms(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;co(e,o)})})}async function co(e,t){var v,d,u,m;(v=document.getElementById("submission-detail-overlay"))==null||v.remove();let{ok:s,data:n}=await S.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(h=>String(h.id)===String(t));if(!o){T("Submission not found","error");return}let{data:i}=await S.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,l={};if(a!=null&&a.fields&&a.fields.forEach(h=>{l[h.name]=h.label||h.name}),o.status==="new"&&!window.IS_DEMO){let{ok:h}=await S.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"});if(h){o.status="read";let w=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);w&&(w.value="read");let b=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(b){b.style.borderLeftColor=Oe.read.text;let g=b.querySelector(".vs-status-pill");g&&(g.style.background=Oe.read.bg,g.style.color=Oe.read.text,g.textContent="Read")}}}let r=Oe[o.status]||Oe.new,p=document.createElement("div");p.id="submission-detail-overlay",p.className="vs-slide-overlay",p.innerHTML=`
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
            <span class="vs-status-pill" style="background: ${r.bg}; color: ${r.text};">${r.label}</span>
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
          ${Object.entries(o.data||{}).filter(([h])=>!h.startsWith("_")).map(([h,w])=>{let b=l[h]||h,g=Array.isArray(w)?w.join(", "):String(w);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${y(b)}</div>
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
          ${Object.entries(Oe).map(([h,w])=>`<option value="${h}" ${o.status===h?"selected":""}>${w.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(p),requestAnimationFrame(()=>{requestAnimationFrame(()=>p.classList.add("is-visible"))});let c=()=>{p.classList.remove("is-visible"),setTimeout(()=>p.remove(),200)};fe(p,c),(d=document.getElementById("close-sub-detail"))==null||d.addEventListener("click",c),(u=document.getElementById("btn-save-sub-notes"))==null||u.addEventListener("click",async()=>{var b;if(is()||as())return;let h=((b=document.getElementById("sub-detail-notes"))==null?void 0:b.value)||"",{ok:w}=await S.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:h});T(w?"Notes saved":"Failed to save notes",w?"success":"error")}),(m=document.getElementById("sub-detail-status"))==null||m.addEventListener("change",async h=>{if(is()){h.target.value=o.status;return}if(as())return;let w=h.target.value,{ok:b}=await S.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:w});if(b){T("Status updated","success");let g=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);g&&(g.value=w);let B=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),E=Oe[w];if(B&&E){B.style.borderLeftColor=E.text;let $=B.querySelector(".vs-status-pill");$&&($.style.background=E.bg,$.style.color=E.text,$.textContent=E.label)}}else T("Failed to update status","error")})}function go(){return setTimeout(()=>hn(),0),`
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
  `}function ho(){return`
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
            ${[["Use AI chat",!0,!0,!1],["Edit pages & code",!0,!0,!1],["Manage assets",!0,!0,!1],["Publish changes",!0,!0,!1],["View form submissions",!0,!0,!0],["Preview the site",!0,!0,!0],["Manage designs",!0,!0,!1],["Change settings",!0,!1,!1],["Manage team members",!0,!1,!1]].map(([e,t,s,n])=>`
              <div class="vs-role-matrix-row">
                <span class="vs-role-matrix-label">${e}</span>
                <span class="vs-role-matrix-cell">${t?"\u2713":"\u2014"}</span>
                <span class="vs-role-matrix-cell">${s?"\u2713":"\u2014"}</span>
                <span class="vs-role-matrix-cell">${n?"\u2713":"\u2014"}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="px-6 py-4 border-t border-vs-border-subtle flex justify-end">
          <button id="btn-roles-close" class="vs-btn vs-btn-ghost vs-btn-sm">Close</button>
        </div>
      </div>
    </div>
  `}function ia(e){let t=P.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",l=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${x.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${y(e.name)}" title="Reset password">
        ${x.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${y(e.name)}" title="Remove">
        ${x.trash}
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
      ${l}
    </div>
  `}async function hn(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await S.get("/team");if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${(n==null?void 0:n.message)||"Failed to load team members."}</div>`;return}let o=(s==null?void 0:s.members)||[];o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>ia(i)).join(""),aa()}function aa(){var e,t,s,n,o,i,a,l,r;(e=document.getElementById("btn-add-member"))==null||e.addEventListener("click",()=>{mo()}),(t=document.getElementById("btn-show-roles"))==null||t.addEventListener("click",uo),document.querySelectorAll("[data-role-info]").forEach(p=>{p.addEventListener("click",uo)}),document.querySelectorAll(".team-edit-btn").forEach(p=>{p.addEventListener("click",async()=>{let c=p.dataset.id,{ok:v,data:d}=await S.get("/team");if(v){let u=d.members.find(m=>m.id==c);u&&mo(u)}})}),document.querySelectorAll(".team-delete-btn").forEach(p=>{p.addEventListener("click",async()=>{let c=p.dataset.id,v=p.dataset.name;if(!await be({title:"Remove Team Member",description:`Remove ${v} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let{ok:u,error:m}=await S.delete(`/team/${c}`);u?(T(`${v} has been removed.`,"success"),hn()):T((m==null?void 0:m.message)||"Failed to remove member.","error")})}),document.querySelectorAll(".team-pw-btn").forEach(p=>{p.addEventListener("click",()=>{let c=p.dataset.id,v=p.dataset.name;la(c,v)})}),[["[data-team-modal-overlay]",Ts],["[data-team-pw-overlay]",Is],["[data-team-roles-overlay]",gn]].forEach(([p,c])=>{let v=document.querySelector(p);if(!v)return;let d=null;v.addEventListener("mousedown",u=>{d=u.target}),v.addEventListener("click",u=>{u.target===v&&d===v&&c()})}),(s=document.getElementById("btn-team-cancel"))==null||s.addEventListener("click",Ts),(n=document.getElementById("btn-pw-cancel"))==null||n.addEventListener("click",Is),(o=document.getElementById("btn-roles-close"))==null||o.addEventListener("click",gn),(i=document.getElementById("btn-generate-password"))==null||i.addEventListener("click",()=>{let p=document.getElementById("team-member-password");p&&(p.value=Zt())}),(a=document.getElementById("btn-pw-generate"))==null||a.addEventListener("click",()=>{let p=document.getElementById("team-new-password");p&&(p.value=Zt())}),(l=document.getElementById("btn-team-save"))==null||l.addEventListener("click",da),(r=document.getElementById("btn-pw-save"))==null||r.addEventListener("click",ca),document.addEventListener("keydown",ra)}function ra(e){if(e.key!=="Escape")return;let t=document.getElementById("team-modal"),s=document.getElementById("team-pw-modal"),n=document.getElementById("team-roles-modal");n&&!n.classList.contains("hidden")?(gn(),e.stopPropagation()):s&&!s.classList.contains("hidden")?(Is(),e.stopPropagation()):t&&!t.classList.contains("hidden")&&(Ts(),e.stopPropagation())}function uo(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden")}function gn(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden")}function mo(e=null){let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");t&&(document.getElementById("team-member-name").value=(e==null?void 0:e.name)||"",document.getElementById("team-member-email").value=(e==null?void 0:e.email)||"",document.getElementById("team-member-role").value=(e==null?void 0:e.role)||"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=Zt()),t.classList.remove("hidden"))}function Ts(){var e;(e=document.getElementById("team-modal"))==null||e.classList.add("hidden")}function la(e,t){let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");s&&(document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=Zt(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",s.classList.remove("hidden"))}function Is(){var e;(e=document.getElementById("team-pw-modal"))==null||e.classList.add("hidden")}async function da(){var r,p,c,v,d,u,m,h;let e=(r=document.getElementById("team-edit-id"))==null?void 0:r.value,t=(c=(p=document.getElementById("team-member-name"))==null?void 0:p.value)==null?void 0:c.trim(),s=(d=(v=document.getElementById("team-member-email"))==null?void 0:v.value)==null?void 0:d.trim(),n=(u=document.getElementById("team-member-role"))==null?void 0:u.value,o=(m=document.getElementById("team-member-password"))==null?void 0:m.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026";let l;e?l=await S.put(`/team/${e}`,{name:t,email:s,role:n}):l=await S.post("/team",{name:t,email:s,role:n,password:o}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",l.ok?(Ts(),T(e?"Member updated.":`${t} has been added to the team.`,"success"),hn()):(i.textContent=((h=l.error)==null?void 0:h.message)||"Something went wrong.",i.classList.remove("hidden"))}async function ca(){var a,l;let e=(a=document.getElementById("team-pw-user-id"))==null?void 0:a.value,t=(l=document.getElementById("team-new-password"))==null?void 0:l.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026";let{ok:o,error:i}=await S.post(`/team/${e}/password`,{password:t});n.disabled=!1,n.textContent="Reset Password",o?(Is(),T("Password has been reset.","success")):(s.textContent=(i==null?void 0:i.message)||"Failed to reset password.",s.classList.remove("hidden"))}var pa=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},va=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1};function bo(){return setTimeout(()=>rs(),0),`
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
  `}async function rs(e="all"){var b;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await fo(n.files),n.value="",rs(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=g=>{g.target.closest("button")||n==null||n.click()},o.ondragover=g=>{g.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async g=>{g.preventDefault(),o.classList.remove("is-dragover"),g.dataTransfer.files.length>0&&(await fo(g.dataTransfer.files),rs(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(g=>{g.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(B=>{B.className="vs-device-btn"}),g.className="vs-device-btn vs-device-btn-active",rs(g.dataset.filter)}});let a=e==="code",l=!a&&e!=="all"?`?category=${e}`:"",{ok:r,data:p}=await S.get(`/assets${l}`);if(!r||!((b=p==null?void 0:p.assets)!=null&&b.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let g=document.getElementById("btn-empty-upload"),B=document.getElementById("btn-upload-asset");g&&B&&g.addEventListener("click",()=>B.click());return}let c=p.assets;if(a&&(c=c.filter(g=>g.category==="css"||g.category==="js"),c.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${x.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let v=["jpg","jpeg","png","gif","webp","svg","ico"],d=c.filter(g=>g.category==="images"&&v.includes(g.extension)),u=c.filter(g=>!v.includes(g.extension)||g.category!=="images");function m(g,B){return g==="css"?x.fileCode:g==="js"?x.fileCode:g==="json"?x.fileJson:g==="pdf"?x.filePdf:["woff2","woff","ttf","otf"].includes(g)?x.type:["mp4","webm"].includes(g)?x.film:["mp3","wav","ogg"].includes(g)?x.music:["txt","md","csv"].includes(g)?x.fileText:["doc","docx","xls","xlsx"].includes(g)?x.fileText:B==="images"?x.image:x.fileText}let h=["css","js","json","svg"],w="";d.length>0&&(w+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',d.forEach((g,B)=>{var _;let E=Zs(g.size),$=g.width?`${g.width}\xD7${g.height}`:"",M=g.extension==="svg";w+=`
        <div class="vs-asset-card" data-lightbox-idx="${B}">
          <div class="vs-asset-card-thumb${M?" is-svg":""}" style="cursor:pointer">
            <img src="${g.thumbnail||g.path}" alt="${y(((_=g.meta)==null?void 0:_.alt)||g.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${y(g.filename)}">${y(g.filename)}</p>
            <p class="vs-asset-card-meta">${$?$+" \xB7 ":""}${E}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${x.copy}</button>
            <button data-delete-asset="${g.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${x.x}</button>
          </div>
        </div>
      `}),w+="</div>"),u.length>0&&u.forEach(g=>{let B=Zs(g.size),E=h.includes(g.extension);w+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${m(g.extension,g.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${y(g.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${g.category} \xB7 ${B}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${E?`
              <button data-edit-asset="${g.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${x.pencil}</button>
            `:""}
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-action-btn">${x.copy}</button>
            ${g.category!=="css"&&g.category!=="js"?`
              <button data-delete-asset="${g.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${x.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=w,t.querySelectorAll("[data-lightbox-idx]").forEach(g=>{let B=g.querySelector(".vs-asset-card-thumb");B&&B.addEventListener("click",()=>{let E=parseInt(g.dataset.lightboxIdx,10);ua(d,E,e)})}),t.querySelectorAll("[data-copy-path]").forEach(g=>{g.addEventListener("click",()=>{navigator.clipboard.writeText(g.dataset.copyPath).then(()=>{let B=g.innerHTML;g.innerHTML="\u2713",g.classList.add("vs-asset-action-copied"),setTimeout(()=>{g.innerHTML=B,g.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(g=>{g.addEventListener("click",()=>{let E=g.dataset.editAsset.replace(/^\//,"");Ss(E)})}),t.querySelectorAll("[data-delete-asset]").forEach(g=>{g.addEventListener("click",async()=>{if(!await be({title:"Delete Asset",description:`Delete ${g.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:E}=await S.delete("/assets",{path:g.dataset.deleteAsset});E?(T("Asset deleted.","success"),rs(e)):T("Could not delete asset.","error")})})}function ua(e,t,s){let n=t;function o(d){if(d===0)return"0 B";let u=1024,m=["B","KB","MB","GB"],h=Math.floor(Math.log(d)/Math.log(u));return parseFloat((d/Math.pow(u,h)).toFixed(1))+" "+m[h]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var b,g;let d=e[n],u=d.width?`${d.width}\xD7${d.height}`:"",m=o(d.size),h=[u,m,(b=d.extension)==null?void 0:b.toUpperCase()].filter(Boolean),w=e.length>1;return`
      ${w?`
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
            <span class="vs-lightbox-details">${h.join(" \xB7 ")}${w?` \xB7 ${n+1} / ${e.length}`:""}</span>
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
    `}let l=document.createElement("div");l.id="vs-lightbox",l.className="vs-lightbox",l.setAttribute("role","dialog"),l.setAttribute("aria-label","Image preview"),l.innerHTML=a(),document.body.appendChild(l),requestAnimationFrame(()=>{requestAnimationFrame(()=>l.classList.add("is-visible"))});function r(){l.classList.remove("is-visible"),setTimeout(()=>l.remove(),400),document.removeEventListener("keydown",c)}function p(d){n=d,l.innerHTML=a(),v()}function c(d){if(d.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;r(),d.preventDefault()}d.key==="ArrowRight"&&e.length>1&&(p((n+1)%e.length),d.preventDefault()),d.key==="ArrowLeft"&&e.length>1&&(p((n-1+e.length)%e.length),d.preventDefault())}function v(){var m,h,w;(m=l.querySelector("#lightbox-close"))==null||m.addEventListener("click",b=>{b.stopPropagation(),r()});let d=null;l.addEventListener("mousedown",b=>{d=b.target}),l.addEventListener("click",b=>{var E;let g=b.target===l||b.target.classList.contains("vs-lightbox-stage"),B=d===l||((E=d==null?void 0:d.classList)==null?void 0:E.contains("vs-lightbox-stage"));g&&B&&r()}),(h=l.querySelector("#lightbox-prev"))==null||h.addEventListener("click",b=>{b.stopPropagation(),p((n-1+e.length)%e.length)}),(w=l.querySelector("#lightbox-next"))==null||w.addEventListener("click",b=>{b.stopPropagation(),p((n+1)%e.length)});let u=l.querySelector("#lightbox-copy");u==null||u.addEventListener("click",b=>{b.stopPropagation();let g=e[n];navigator.clipboard.writeText(g.path).then(()=>{let B=u.innerHTML;u.innerHTML=`${x.check}<span>Copied!</span>`,u.style.borderColor="var(--vs-success)",u.style.color="var(--vs-success)",setTimeout(()=>{u.innerHTML=B,u.style.borderColor="",u.style.color=""},2e3),T("Path copied!","success")})})}document.addEventListener("keydown",c),v()}async function fo(e){var i,a,l;if(pa()||va())return;let t=document.getElementById("status-text");t&&(t.textContent=`Uploading ${e.length} file(s)...`);let s=new FormData;for(let r of e)s.append("file[]",r);let n=P.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let p=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();if(p.ok){let c=((a=(i=p.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0;T(`${c} file(s) uploaded.`,"success"),t&&(t.textContent=`\u2713 ${c} file(s) uploaded`)}else{let c=((l=p.error)==null?void 0:l.message)||"Upload failed";T(c,"error"),t&&(t.textContent="\u2717 "+c)}t&&setTimeout(()=>{t&&(t.textContent="Ready")},4e3)}catch{T("Upload failed.","error"),t&&(t.textContent="\u2717 Upload failed",setTimeout(()=>{t&&(t.textContent="Ready")},4e3))}}var ls="vs-newdesign-save-pref",ds="gallery";function wo(){return setTimeout(()=>ma(),0),`
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
        <button class="vs-tab ${ds==="gallery"?"vs-tab-active":""}" data-tab="gallery">
          ${x.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${ds==="history"?"vs-tab-active":""}" data-tab="history">
          ${x.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading\u2026</div>
      </div>
    </div>
  `}function ma(){var e,t;document.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",()=>{ds=s.dataset.tab,document.querySelectorAll(".vs-tab").forEach(n=>n.classList.remove("vs-tab-active")),s.classList.add("vs-tab-active"),yo()})}),(e=document.getElementById("btn-save-design"))==null||e.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||cs()}),(t=document.getElementById("btn-new-design"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||fn()}),yo()}function yo(){ds==="gallery"?_s():As()}async function _s(){var i,a;let e=document.getElementById("designs-content");if(!e)return;let{ok:t,data:s}=await S.get("/designs");if(!t||!((i=s==null?void 0:s.designs)!=null&&i.length)){e.innerHTML=`
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
    `,(a=document.getElementById("btn-empty-save"))==null||a.addEventListener("click",()=>{var l;(l=window.demoGuard)!=null&&l.call(window)||cs()});return}let n=s.active_id,o=s.designs;e.innerHTML=`
    <div class="vs-design-grid">
      ${o.map(l=>ha(l,l.id===n)).join("")}
    </div>
  `,fa(e),ga(e)}function ga(e){e.querySelectorAll(".vs-design-card-preview").forEach(t=>{let s=t.querySelector("iframe");s&&requestAnimationFrame(()=>{let n=t.offsetWidth;if(n>0){let o=n/1440;s.style.transform=`scale(${o})`}})})}function ha(e,t){let s=y(e.name||"Untitled"),n=e.description?y(e.description):"",o=e.initial_prompt?y(e.initial_prompt):"",i=n||(o.length>100?o.substring(0,100)+"\u2026":o),a=y(e.site_name||""),l=e.page_count||0,r=e.created_at?Xs(e.created_at):"",p=e._corrupted,c=a&&a!==s?`${a} \xB7 ${l} ${l===1?"page":"pages"}`:`${l} ${l===1?"page":"pages"}`,v=`/_studio/api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(e.id)}%2Fpreview&path=index.php`,d=`${v}&embed=1`;return`
    <div class="vs-design-card${t?" vs-design-card-active":""}${p?" vs-design-card-corrupted":""}"
         data-design-id="${le(e.id)}">
      <div class="vs-design-card-preview">
        ${p?'<div class="vs-design-card-empty">Preview unavailable</div>':`
          <iframe src="${d}" tabindex="-1" loading="lazy"
                  sandbox="allow-same-origin"
                  title="Preview of ${le(e.name||"design")}"></iframe>
        `}
      </div>
      <div class="vs-design-card-info">
        <h3>${s}</h3>
        ${i?`<p class="vs-design-card-desc">${i}</p>`:""}
        <div class="vs-design-card-meta">
          <span>${c}</span>
          <span>${r}</span>
        </div>
      </div>
      <div class="vs-design-card-actions">
        ${t?'<span class="vs-design-badge-active">Active</span>':`
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-load-id="${le(e.id)}" ${p?"disabled":""}>
            ${x.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${v}" target="_blank" rel="noopener" title="Browse this design">
          ${x.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${le(e.id)}"
                data-edit-name="${le(e.name||"")}"
                data-edit-desc="${le(e.description||"")}">
          ${x.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${le(e.id)}" style="color: var(--vs-text-ghost);">
          ${x.trash2}
        </button>
      </div>
    </div>
  `}function fa(e){e.querySelectorAll("[data-load-id]").forEach(t=>{t.addEventListener("click",async()=>{var p,c,v,d;if((p=window.demoGuard)!=null&&p.call(window)||(c=window.viewerGuard)!=null&&c.call(window))return;let s=t.dataset.loadId,n=t.closest(".vs-design-card"),o=((v=n==null?void 0:n.querySelector("h3"))==null?void 0:v.textContent)||"this design",i=await xa(o);if(!i)return;if(t.innerHTML=`${x.rotateCcw} Loading\u2026`,t.disabled=!0,i.saveDesign){let u=P.get("siteName")||"Untitled",m=await S.post("/designs",{name:`${u}`,description:"Saved before switching designs"});if(!m.ok){T(((d=m.error)==null?void 0:d.message)||"Failed to save design.","error"),t.innerHTML=`${x.rotateCcw} Load`,t.disabled=!1;return}}let{ok:a,data:l,error:r}=await S.post(`/designs/${s}/load`,{skip_auto_save:!0});a?(T("Design loaded.","success"),await ko(),window.location.hash="#/chat"):(T((r==null?void 0:r.message)||"Failed to load design.","error"),t.innerHTML=`${x.rotateCcw} Load`,t.disabled=!1)})}),e.querySelectorAll("[data-edit-id]").forEach(t=>{t.addEventListener("click",()=>{var i,a;if((i=window.demoGuard)!=null&&i.call(window)||(a=window.viewerGuard)!=null&&a.call(window))return;let s=t.dataset.editId,n=t.dataset.editName,o=t.dataset.editDesc;ya(s,n,o)})}),e.querySelectorAll("[data-delete-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,l;if((a=window.demoGuard)!=null&&a.call(window)||(l=window.viewerGuard)!=null&&l.call(window))return;let s=t.dataset.deleteId;if(!await be({title:"Delete Design",description:"This design will be removed permanently. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await S.delete(`/designs/${s}`);o?(T("Design deleted.","success"),_s()):(T((i==null?void 0:i.message)||"Failed to delete design.","error"),t.innerHTML=`${x.trash2}`,t.disabled=!1)})})}async function As(){var i,a,l;let e=document.getElementById("designs-content");if(!e)return;e.innerHTML=`
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">
        ${x.camera} Create Snapshot
      </button>
    </div>
    <div id="snapshots-list">
      <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots\u2026</div>
    </div>
  `,(i=document.getElementById("btn-create-snapshot"))==null||i.addEventListener("click",()=>{var r,p;(r=window.demoGuard)!=null&&r.call(window)||(p=window.viewerGuard)!=null&&p.call(window)||xo()});let t=document.getElementById("snapshots-list");if(!t)return;let{ok:s,data:n}=await S.get("/snapshots");if(!s||!((a=n==null?void 0:n.snapshots)!=null&&a.length)){t.innerHTML=`
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
    `,(l=document.getElementById("btn-empty-create-snapshot"))==null||l.addEventListener("click",()=>{var r;(r=window.demoGuard)!=null&&r.call(window)||xo()});return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((r,p)=>{let c=Xs(r.created_at),v=new Date(r.created_at).toLocaleString(),d=r.size_bytes?(r.size_bytes/1024).toFixed(0)+" KB":"\u2014",u=p===o.length-1,m,h,w;r.snapshot_type==="pre_publish"?(m="var(--vs-success)",h="vs-snap-badge-green",w="Pre-publish"):r.snapshot_type==="manual"?(m="var(--vs-accent)",h="vs-snap-badge-amber",w="Manual"):(m="var(--vs-text-ghost)",h="vs-snap-badge-gray",w="Auto");let b=r.description?`<p class="vs-timeline-desc">${y(r.description)}</p>`:"";return`
          <div class="vs-timeline-item${u?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${m}; box-shadow: 0 0 0 3px color-mix(in srgb, ${m} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${h}">${w}</span>
                  <span class="vs-timeline-label">${y(r.label||"Snapshot #"+r.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${v}">${c}</span>
              </div>
              ${b}
              <div class="vs-timeline-meta">${r.file_count} files \xB7 ${d}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${r.id}" data-snap='${JSON.stringify({label:r.label,description:r.description,type:r.snapshot_type,files:r.file_count,size:d,date:v}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${x.eye} Preview
                </button>
                <button data-restore-id="${r.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${x.rotateCcw} Restore
                </button>
                <button data-delete-snap-id="${r.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${x.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,ba(t)}function ba(e){e.querySelectorAll("[data-preview-id]").forEach(t=>{t.addEventListener("click",()=>{let s=JSON.parse(t.dataset.snap);ka(s)})}),e.querySelectorAll("[data-restore-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,l;if((a=window.demoGuard)!=null&&a.call(window)||(l=window.viewerGuard)!=null&&l.call(window))return;let s=t.dataset.restoreId;if(!await be({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;t.innerHTML=`${x.rotateCcw} Restoring\u2026`,t.disabled=!0;let{ok:o,error:i}=await S.post(`/snapshots/${s}/restore`);if(o){let r=document.getElementById("status-text");r&&(r.textContent="\u2713 Snapshot restored",setTimeout(()=>{r&&(r.textContent="Ready")},4e3)),T("Snapshot restored.","success"),As()}else T((i==null?void 0:i.message)||"Failed to restore snapshot.","error"),t.innerHTML=`${x.rotateCcw} Restore`,t.disabled=!1})}),e.querySelectorAll("[data-delete-snap-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,l;if((a=window.demoGuard)!=null&&a.call(window)||(l=window.viewerGuard)!=null&&l.call(window))return;let s=t.dataset.deleteSnapId;if(!await be({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await S.delete(`/snapshots/${s}`);o?(T("Snapshot deleted.","success"),As()):(T((i==null?void 0:i.message)||"Failed to delete snapshot.","error"),t.innerHTML=`${x.trash2}`,t.disabled=!1)})})}function cs(){var c;let e=document.getElementById("vs-design-save-overlay");e&&e.remove();let t=P.get("siteName")||"",s=document.createElement("div");s.id="vs-design-save-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${x.save} Save Design</h2>
        <p class="vs-modal-desc">Save a snapshot of your current design to the library. Find and restore saved designs in the Designs tab.</p>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="design-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${le(t)}" autofocus>
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>he(s),o=v=>{v.key==="Escape"&&(v.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),fe(s,n),(c=document.getElementById("design-save-cancel"))==null||c.addEventListener("click",n);let a=document.getElementById("design-name"),l=document.getElementById("design-desc"),r=document.getElementById("design-save-confirm"),p=v=>{v.key==="Enter"&&(r==null||r.click())};a==null||a.addEventListener("keydown",p),l==null||l.addEventListener("keydown",p),a==null||a.select(),r==null||r.addEventListener("click",async()=>{var h,w;let v=((h=a==null?void 0:a.value)==null?void 0:h.trim())||"",d=((w=l==null?void 0:l.value)==null?void 0:w.trim())||"";if(!v){a==null||a.focus();return}r.innerHTML="Saving\u2026",r.disabled=!0;let{ok:u,error:m}=await S.post("/designs",{name:v,description:d});n(),u?(T("Design saved.","success"),ds="gallery",document.getElementById("designs-content")&&(document.querySelectorAll(".vs-tab").forEach(g=>{g.classList.toggle("vs-tab-active",g.dataset.tab==="gallery")}),_s())):T((m==null?void 0:m.message)||"Failed to save design.","error")})}function ya(e,t,s){var c;let n=document.getElementById("vs-design-edit-overlay");n&&n.remove();let o=document.createElement("div");o.id="vs-design-edit-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${x.pencil} Edit Design</h2>
      </div>
      <div class="vs-modal-body">
        <div class="flex flex-col gap-4">
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Name</label>
            <input id="edit-design-name" type="text" class="vs-input w-full" value="${le(t)}" autofocus>
          </div>
          <div>
            <label class="block text-sm text-vs-text-secondary mb-1">Description <span class="text-vs-text-ghost">(optional)</span></label>
            <input id="edit-design-desc" type="text" class="vs-input w-full" value="${le(s)}">
          </div>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="edit-design-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
        <button id="edit-design-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Save</button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>he(o);fe(o,i),(c=document.getElementById("edit-design-cancel"))==null||c.addEventListener("click",i);let a=document.getElementById("edit-design-name"),l=document.getElementById("edit-design-desc"),r=document.getElementById("edit-design-save");a==null||a.select();let p=v=>{v.key==="Enter"&&(r==null||r.click())};a==null||a.addEventListener("keydown",p),l==null||l.addEventListener("keydown",p),r==null||r.addEventListener("click",async()=>{var h,w;let v=((h=a==null?void 0:a.value)==null?void 0:h.trim())||"",d=((w=l==null?void 0:l.value)==null?void 0:w.trim())||"";if(!v){a==null||a.focus();return}r.innerHTML="Saving\u2026",r.disabled=!0;let{ok:u,error:m}=await S.put(`/designs/${e}`,{name:v,description:d});i(),u?(T("Design updated.","success"),_s()):T((m==null?void 0:m.message)||"Failed to update design.","error")})}function xa(e){return new Promise(t=>{var p,c;let s=document.getElementById("vs-switch-design-overlay");s&&s.remove();let n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=localStorage.getItem(ls),i=document.createElement("div");i.id="vs-switch-design-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=v=>{v.key==="Escape"&&(v.preventDefault(),l(null))},l=v=>{document.removeEventListener("keydown",a),he(i),t(v)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let r=document.getElementById("vs-switch-save-cb");fe(i,()=>l(null)),(p=document.getElementById("vs-switch-cancel"))==null||p.addEventListener("click",()=>l(null)),(c=document.getElementById("vs-switch-ok"))==null||c.addEventListener("click",()=>{let v=r?r.checked:!1;localStorage.setItem(ls,v?"true":"false"),l({saveDesign:v})}),document.addEventListener("keydown",a),setTimeout(()=>{var v;return(v=document.getElementById("vs-switch-ok"))==null?void 0:v.focus()},220)})}async function fn(){var n;let e=await wa();if(!e)return;if(e.saveDesign&&e.designName){let o=await S.post("/designs",{name:e.designName,description:""});if(!o.ok){T(((n=o.error)==null?void 0:n.message)||"Failed to save design.","error");return}T("Design saved.","success")}let{ok:t,error:s}=await S.post("/designs/new",{skip_auto_save:!0});if(t){T("Workspace cleared. Start building.","success"),await ko(),P.set("messages",[]),P.set("activeConversationId",null),P.set("conversations",[]);try{localStorage.removeItem("vs-active-conversation")}catch{}window.location.hash!=="#/chat"?je.navigate("chat"):je.refresh()}else T((s==null?void 0:s.message)||"Failed to start new design.","error")}function wa(){return new Promise(e=>{var v,d;let t=document.getElementById("vs-new-design-overlay");t&&t.remove();let s=P.get("siteName")||"",n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=document.createElement("div");o.id="vs-new-design-overlay",o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Start New Design</h2>
          <p class="vs-modal-desc">This will clear your workspace for a fresh start.</p>
          <label class="vs-modal-option" for="vs-newdesign-save-cb">
            <input type="checkbox" id="vs-newdesign-save-cb" ${localStorage.getItem(ls)!=="false"?"checked":""}>
            <span class="vs-modal-option-check">${n}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-body" id="vs-newdesign-name-row" style="${localStorage.getItem(ls)==="false"?"display:none":""}">
          <label class="vs-input-label">Name</label>
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${le(s)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;let i=u=>{u.key==="Escape"&&(u.preventDefault(),a(null))},a=u=>{document.removeEventListener("keydown",i),he(o),e(u)};document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let l=document.getElementById("vs-newdesign-save-cb"),r=document.getElementById("vs-newdesign-name-row"),p=document.getElementById("vs-newdesign-name"),c=()=>{l.checked?(r.style.display="",setTimeout(()=>p==null?void 0:p.focus(),80)):r.style.display="none"};l==null||l.addEventListener("change",c),p==null||p.addEventListener("keydown",u=>{var m;u.key==="Enter"&&(u.preventDefault(),(m=document.getElementById("vs-newdesign-ok"))==null||m.click())}),fe(o,()=>a(null)),(v=document.getElementById("vs-newdesign-cancel"))==null||v.addEventListener("click",()=>a(null)),(d=document.getElementById("vs-newdesign-ok"))==null||d.addEventListener("click",()=>{var h;let u=l?l.checked:!1,m=((h=p==null?void 0:p.value)==null?void 0:h.trim())||"";if(u&&!m){p==null||p.focus();return}localStorage.setItem(ls,u?"true":"false"),a({saveDesign:u,designName:m})}),document.addEventListener("keydown",i),setTimeout(()=>{var u;l!=null&&l.checked&&p?p.select():(u=document.getElementById("vs-newdesign-ok"))==null||u.focus()},220)})}function xo(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>he(t);fe(t,s),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var p;let a=((p=n==null?void 0:n.value)==null?void 0:p.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:l,error:r}=await S.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),l?(T("Snapshot created.","success"),As()):T((r==null?void 0:r.message)||"Failed to create snapshot.","error")})}function ka(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),fe(s,()=>he(s)),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>he(s))}async function ko(){var e,t;try{let s=await S.get("/pages");s.ok&&Array.isArray((e=s.data)==null?void 0:e.pages)&&P.set("pages",s.data.pages);let n=await S.get("/auth/session");n.ok&&((t=n.data)!=null&&t.site_name)&&(P.set("siteName",n.data.site_name),document.title=`Studio \u2014 ${n.data.site_name}`);let o=document.getElementById("preview-iframe");o&&(o.src=o.src);let i=document.getElementById("status-text");i&&(i.textContent="\u2713 Design switched",setTimeout(()=>{i&&(i.textContent="Ready")},4e3))}catch(s){console.warn("[designs] Post-switch refresh failed:",s)}}var Ea=[{route:"chat",label:"Chat"},{route:"editor",label:"Editor"},{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"designs",label:"Designs",roles:["owner","editor"]},{route:"settings",label:"Settings",roles:["owner"]}],wn=["chat","editor"],$a="vs-first-run-guide-dismissed",Io="vs-onboarding-draft-v1",Ao="vs-prompt-recents-v1",_o="vs-prompt-pins-v1",Ca=8,La=5,Eo=5,Sa=5*1024*1024,kn=["image/jpeg","image/png","image/gif","image/webp"],ut=[],Ke=null,Ue=document.documentElement.dataset.demo==="true",Po=window.matchMedia("(max-width: 767px)");function $n(){return Po.matches}var Ba=[{route:"assets",label:"Assets",icon:"image"},{route:"forms",label:"Forms",icon:"inbox"},{route:"actions",label:"Actions",icon:"zap"},{route:"designs",label:"Designs",icon:"palette",roles:["owner","editor"]},{route:"more",label:"More",icon:"ellipsis"}],jo=["chat","editor"];function He(){return Ue?(T("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function Ro(){let e=P.get("user");return e&&e.role!=="viewer"}function zs(){return Ro()?!1:(T("You have read-only access.","warning"),!0)}function Ma(){let e=P.get("user");return e&&e.role==="owner"}window.IS_DEMO=Ue;window.demoGuard=He;window.canWrite=Ro;window.viewerGuard=zs;window.isOwner=Ma;var Ho=document.getElementById("app");async function Do(){var s;_n(),zn(),window.marked&&window.marked.use({renderer:{html(n){return y(typeof n=="string"?n:n.text)}}});let e=await S.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){To();return}P.batch(()=>{P.set("user",e.data.user),P.set("sessionToken",e.data.token),P.set("siteName",e.data.site_name||"")});let t=e.data.site_name;if(t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",n=>{var o;(o=window.__hasUnsavedEditorChanges)!=null&&o.call(window)&&(n.preventDefault(),n.returnValue="")}),je.beforeEach(async(n,o)=>{var i;return o.startsWith("editor")&&!n.startsWith("editor")&&(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)?await io():!0}).on("chat",()=>Ie()).on("editor",()=>Ie()).on("pages",()=>Ie()).on("pages/:slug",()=>Ie()).on("assets",()=>Ie()).on("forms",()=>Ie()).on("forms/:formId",()=>Ie()).on("actions",()=>Ie()).on("actions/:actionId",()=>Ie()).on("designs",()=>Ie()).on("settings",()=>Ie()).on("team",()=>Ie()).on("profile",()=>Ie()).onNotFound(()=>je.navigate("chat")),P.on("user",n=>{n||To()}),No(),Po.addEventListener("change",()=>{Ie()}),$n()){let o=(window.location.hash||"").replace(/^#\/?/,"");(!o||jo.includes(o))&&(window.location.hash="#/assets")}je.start()}async function No(){try{let{ok:e,data:t}=await S.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){P.set("pages",t.pages),Jo();let s=document.getElementById("chat-messages");s!=null&&s.querySelector(".vs-empty-state")&&(s.innerHTML=qt(),Nt())}}catch{}}function Ie(){let e=P.get("route"),t=wn.includes(e);Qt()&&es(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s=$n()&&jo.includes(e),n;s?n=Aa(e):e==="editor"?n=Zn():t?n=Ia():n=_a(),Ho.innerHTML=`
    ${Ta()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${n}
    </div>
    ${Oa()}
    ${Ua()}
    ${Va()}
    ${Ga()}
    ${ho()}
    ${Qa()}
  `,nr(),Wa(),e==="editor"&&!s&&Xn()}function Ta(){let e=P.get("route"),t=P.get("user"),s=P.get("theme"),n=Ea.filter(o=>o.roles&&t?o.roles.includes(t.role):!0).map(o=>{let i=e===o.route||e.startsWith(o.route+"/");return`
      <a href="#/${o.route}"
         class="vs-nav-item ${i?"vs-nav-item-active":""}">
        ${o.label}
      </a>
    `}).join("");return`
    <header class="vs-topbar">
      <div class="vs-topbar-inner">
        <!-- Logo + Nav -->
        <div class="flex items-center gap-1">
          <a href="#/chat" class="vs-logo">
            <span class="vs-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
                <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
                <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
              </svg>
            </span>
            <span class="vs-logo-text hidden sm:inline">${y(P.get("siteName")||"VoxelSite")}</span>
          </a>
          <nav class="flex items-center gap-0.5" aria-label="Studio navigation">
            ${n}
          </nav>
          ${Ue?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${x.eye} Demo
            </span>
          `:""}
        </div>

        <!-- Right: Search hint + Theme + User -->
        <div class="flex items-center gap-1.5">
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
              <span class="hidden sm:inline">${y((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${(t==null?void 0:t.role)!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${(t==null?void 0:t.role)==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${x.pencil} Edit Profile
              </a>
              ${(t==null?void 0:t.role)==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${x.users} Team Members
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
  `}function Ia(){let e=P.get("sidebarWidth"),t=P.get("activeConversationId"),s=P.get("activePageScope"),n=qo(s);return`
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
              <span id="scope-label" class="text-vs-text-secondary">${y(n)}</span>
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
          ${qt()}
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
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Visual editor (V)">
              ${x.pencil} Visual
            </button>
            <button id="btn-edit-code" class="vs-btn vs-btn-ghost vs-btn-xs" title="Source code editor">
              ${x.fileCode} Code
            </button>
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
          <iframe id="preview-iframe" class="w-full h-full border-0" src="/_studio/api/router.php?_path=%2Fpreview&path=index.php"
            sandbox="allow-scripts allow-same-origin"
            data-voxelsite-preview
            title="Website preview"></iframe>
        </div>
      </div>
    </div>
  `}function Aa(e){let t=e==="editor"?"Code Editor":"AI Chat",s=e==="editor"?"The code editor needs a wider screen for the file tree, editor pane, and preview.":"The AI conversation and live preview work side-by-side. That needs a wider screen.";return`
    <div class="h-full overflow-y-auto">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 18px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
          ${x.monitor}
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
  `}function _a(){let e=P.get("route"),t=P.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${Pa(e,t)}
      </div>
    </div>
  `}function Pa(e,t){let s=P.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return bo();case"forms":return po();case"forms/:formId":return vo(t.formId);case"actions":return ro();case"actions/:actionId":return lo(t.actionId);case"designs":return n==="owner"||n==="editor"?wo():bn();case"settings":return n==="owner"?oo():bn();case"team":return n==="owner"?go():bn();case"profile":return Ha();default:return ja("Not Found","This page doesn't exist.")}}function bn(){return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/chat" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">\u2190 Back to Chat</a>
    </div>
  `}function ja(e,t){return`
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
  `}function Ra(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return x[t[s]||"layoutGrid"]||x.layoutGrid}function $o(e){je.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function Ha(){let e=P.get("user")||{};return setTimeout(()=>Da(),0),`
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
  `}function Da(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var p,c,v,d;let o=(c=(p=document.getElementById("profile-name"))==null?void 0:p.value)==null?void 0:c.trim(),i=(d=(v=document.getElementById("profile-email"))==null?void 0:v.value)==null?void 0:d.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:l,data:r}=await S.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(r!=null&&r.user)?(P.set("user",r.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>Ie(),800)):t&&(t.textContent=(l==null?void 0:l.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var p,c,v;let o=((p=document.getElementById("profile-current-pw"))==null?void 0:p.value)||"",i=((c=document.getElementById("profile-new-pw"))==null?void 0:c.value)||"",a=((v=document.getElementById("profile-confirm-pw"))==null?void 0:v.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:l,error:r}=await S.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",l?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(r==null?void 0:r.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function Na(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),qa()):e.classList.add("hidden")}async function qa(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await S.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${y((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=P.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let l=a.id===i,r=a.title||"Untitled conversation",p=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${l?"vs-conv-item-active":""}"
              data-conversation-id="${y(a.id)}">
        <span class="mt-0.5 shrink-0 ${l?"text-vs-accent":"text-vs-text-ghost"}">${x.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${l?"font-medium":""}" style="font-size: var(--text-sm);">${y(r)}</div>
          <div class="vs-conv-time mt-0.5">${p}</div>
        </div>
        ${l?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let l=a.dataset.conversationId;Ds(l);let r=document.getElementById("conversation-history-panel");r&&r.classList.add("hidden")})})}async function Ds(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await S.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){P.set("activeConversationId",null),qs(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=qt(),Nt();return}let i=n.conversation,a=i.prompts||[];P.set("activeConversationId",e),qs(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=qt(),Nt();return}let l="",r=!1;for(let p of a){let{text:c,images:v,webRefUrl:d}=rr(p.user_prompt),u=v.length>0?`<div class="vs-msg-user-images">${v.map(h=>`<img src="${h}" class="vs-msg-user-image" />`).join("")}</div>`:"",m=d?`<div class="vs-msg-user-webref"><a href="${le(d)}" target="_blank" rel="noopener" title="${le(d)}">${x.globe} <span>${y(Xt(d))}</span></a></div>`:"";if(l+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${u}
        ${m}
        ${c?`<div class="text-sm text-vs-text-primary leading-relaxed">${y(c)}</div>`:""}
      </div>
    `,p.ai_response||p.files_modified){let h="",w=typeof p.ai_message=="string"&&p.ai_message.trim()!==""?p.ai_message:p.ai_response;w&&(h=Hs(w));let b="";if(p.files_modified)try{let E=JSON.parse(p.files_modified);if(Array.isArray(E)&&E.length>0){let $=E.map(_=>{let j=typeof _=="string"?_:_.path||_,U=typeof _=="object"&&_.action==="delete";return`<div class="vs-file-badge ${U?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${U?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${y(String(j))}</span>
              </div>`}).join(""),M=E.length;b=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${M} file${M!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${$}</div>
              </div>`}}catch{}let g="";if(p.evaluation_issues)try{let E=JSON.parse(p.evaluation_issues);if(Array.isArray(E)&&E.length>0){let $=F=>F==="error"?"#ef4444":F==="warning"?"#d97706":"#6b7280",M=F=>F==="error"?"rgba(239,68,68,0.1)":F==="warning"?"rgba(217,119,6,0.1)":"rgba(107,114,128,0.1)",_={error:0,warning:0,info:0};E.forEach(F=>{_[F.severity]=(_[F.severity]||0)+1});let j=[];_.error&&j.push(`${_.error} error${_.error>1?"s":""}`),_.warning&&j.push(`${_.warning} warning${_.warning>1?"s":""}`),_.info&&j.push(`${_.info} suggestion${_.info>1?"s":""}`);let U=_.error>0?"error":_.warning>0?"warning":"info",Q=U==="error"?"rgba(239,68,68,0.15)":U==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)",K=E.map(F=>`
              <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${$(F.severity)}; background: ${M(F.severity)};">${y(F.severity)}</span>
                  <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(F.category||"")}</span>
                  ${F.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(F.file)}${F.line?":"+F.line:""}</span>`:""}
                </div>
                <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(F.description||"")}</div>
                ${F.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(F.suggested_fix)}</div>`:""}
              </div>
            `).join("");g=`
              <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${Q}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
                <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${$(U)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>Expert Review \xB7 ${j.join(", ")}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <div style="border-top: 1px solid var(--vs-border-subtle);">
                  <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
                  ${K}
                </div>
              </details>`}}catch{}let B=p.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${h}</div>
          ${b}
          ${g}
          ${B}
        </div>
      `}else if(p.status==="streaming"){r=!0;let h=p.id;l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Generation in progress...
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${h})"
              class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
          </div>
        </div>
      `}else p.status==="partial"?l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 text-sm rounded-lg" style="background: var(--vs-warning-dim, rgba(234,179,8,0.1)); color: var(--vs-warning, #eab308);">
            Generation was interrupted. Some files may be missing \u2014 send a follow-up prompt to complete the site.
          </div>
        </div>
      `:p.status==="error"&&(l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>
        </div>
      `)}t.innerHTML=l,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),r&&!window.__vsResumedToastByConversation[e]&&(T("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),r||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(p){try{await S.post("/ai/cancel-generation",{prompt_id:p})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",Ds(e)},r&&P.get("activeConversationId")===e&&!P.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{P.get("activeConversationId")===e&&!P.get("aiStreaming")&&Ds(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function Fa(){P.set("activeConversationId",null),qs(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=qt(),Nt());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function qo(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function Ns(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=qo(t)}function qs(e){P.set("activePageScope",e||null),Ns(),Qt()&&es()}async function za(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>he(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),fe(t,s),t.addEventListener("keydown",c=>{c.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await S.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${y((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let l=i.pages;if(!l.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${x.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let r='<div style="display: flex; flex-direction: column; gap: 2px;">';l.forEach(c=>{let v=!!Number(c.is_homepage),d=c.title||c.slug||c.path,u=c.path||c.slug+".php",m="/"+u.replace(/\.php$/,"").replace(/^index$/,""),h=m==="/"?"/":m,w=Ra(c.slug),g=(window.__vsCurrentPreviewPath||"index.php")===u,B=c.size?(c.size/1024).toFixed(1)+" KB":"";r+=`
      <div class="vs-pages-modal-item ${g?"is-active":""}" data-slug="${y(c.slug)}" data-path="${y(u)}" data-title="${y(d)}" data-url="${y(h)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${w}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(d)}${v?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(u)}${B?" \xB7 "+B:""}
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
          ${v?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${x.trash2}
          </button>
          `}
        </div>
      </div>
    `}),r+="</div>",n.innerHTML=r;let p=t.querySelector(".vs-modal-desc");p&&(p.textContent=`${l.length} page${l.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(c=>{c.addEventListener("click",v=>{v.stopPropagation();let d=c.closest(".vs-pages-modal-item"),u=d.dataset.slug,m=d.dataset.path,h=d.dataset.title,w=d.dataset.url,b=c.dataset.action;if(b==="edit")qs(u),s(),$o(`Edit the "${h}" page (${w}): `);else if(b==="preview"){let g=document.getElementById("preview-iframe");g?(Qt()&&es(),g.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m)+"&t="+Date.now(),window.__vsCurrentPreviewPath=m,Ns(),s(),T(`Preview: ${h}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m),"_blank")}else if(b==="delete"){s();let g=`Delete the "${h}" page (${w}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;$o(g)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(c=>{c.addEventListener("click",v=>{if(v.target.closest(".vs-pages-action"))return;let d=c.dataset.path,u=c.dataset.title,m=document.getElementById("preview-iframe");m?(m.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d)+"&t="+Date.now(),window.__vsCurrentPreviewPath=d,Ns(),s(),T(`Preview: ${u}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d),"_blank")})})}function Nt(){var e;document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let s=document.getElementById("prompt-input");s&&(s.value=t.dataset.quickPrompt,s.dataset.actionType=t.dataset.actionType||"free_prompt",s.focus(),s.setSelectionRange(0,s.value.length),s.dispatchEvent(new Event("input",{bubbles:!0})))})}),(e=document.getElementById("chat-new-design"))==null||e.addEventListener("click",()=>{He()||zs()||fn()})}function qt(){let e=P.get("pages")||[],t=e.length>0,s=new Set(e.map(g=>g.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(g=>{let B=g.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(B)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],l=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],r=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],p=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],c=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],v,d,u;if(!t)d="What are we building?",u="Describe your website and watch it appear in the preview. Every detail is a conversation away.",v=yn(n).slice(0,6);else{d="What\u2019s next?",u="Your site is live in preview. Pick a suggestion or describe any change you want.";let g=[...o,...o,...i,...a,...l,...r,...p,...c];v=yn(g).slice(0,6);let B=new Set;if(v=v.filter(E=>B.has(E.label)?!1:(B.add(E.label),!0)),v.length<6){let E=yn(g).filter($=>!B.has($.label));for(let $ of E){if(v.length>=6)break;v.push($),B.add($.label)}}}let m=v.map(g=>`<button data-quick-prompt="${y(g.prompt).replace(/"/g,"&quot;")}" data-action-type="${g.type}"
      class="vs-style-card">${y(g.label)}</button>`).join(`
        `),h=P.get("user"),b=t&&((h==null?void 0:h.role)==="owner"||(h==null?void 0:h.role)==="editor")?`
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
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${d}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${u}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${m}
      </div>
      ${b}
    </div>
  `}function yn(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function Oa(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-vs-success" title="Connected"></span>
          <span id="status-text" class="text-xs text-vs-text-ghost">Ready</span>
        </div>
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
  `}function Ua(){let e=P.get("route"),t=P.get("user"),s=t==null?void 0:t.role;return`
    <nav class="vs-mobile-nav" aria-label="Mobile navigation">
      ${Ba.filter(o=>!(o.roles&&!o.roles.includes(s))).map(o=>{if(o.route==="more")return`
        <button class="vs-mobile-nav-item" id="btn-mobile-more" aria-label="More">
          ${x[o.icon]||x.layoutGrid}
          <span>${o.label}</span>
        </button>
      `;let i=e===o.route||e.startsWith(o.route+"/");return`
      <a href="#/${o.route}"
         class="vs-mobile-nav-item ${i?"vs-mobile-nav-item-active":""}"
         aria-label="${o.label}">
        ${x[o.icon]||x.layoutGrid}
        <span>${o.label}</span>
      </a>
    `}).join("")}
    </nav>
  `}function Va(){let e=P.get("user"),t=e==null?void 0:e.role,s=P.get("theme"),n="";return t==="owner"&&(n+=`
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
    <button id="btn-mobile-download" class="vs-mobile-more-item">
      ${x.download} Download
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
          <span class="vs-mobile-more-title">${y((e==null?void 0:e.name)||"Menu")}</span>
          <button id="btn-mobile-more-close" class="vs-mobile-more-close">${x.x}</button>
        </div>
        ${n}
      </div>
    </div>
  `}function Wa(){if(!$n())return;let e=document.getElementById("btn-mobile-more"),t=document.getElementById("mobile-more-sheet"),s=document.getElementById("mobile-more-backdrop"),n=document.getElementById("btn-mobile-more-close");function o(){t==null||t.classList.add("vs-sheet-open")}function i(){t==null||t.classList.remove("vs-sheet-open")}e&&e.addEventListener("click",o),s&&s.addEventListener("click",i),n&&n.addEventListener("click",i),document.querySelectorAll("[data-mobile-more-nav]").forEach(c=>{c.addEventListener("click",i)});let a=document.getElementById("btn-mobile-theme");a&&a.addEventListener("click",()=>{ks(),i(),Ie()});let l=document.getElementById("btn-mobile-publish");l&&l.addEventListener("click",()=>{var c;i(),!He()&&((c=document.getElementById("btn-publish"))==null||c.click())});let r=document.getElementById("btn-mobile-download");r&&r.addEventListener("click",()=>{i(),!He()&&Yo()});let p=document.getElementById("btn-mobile-logout");p&&p.addEventListener("click",async()=>{i(),await S.post("/auth/logout"),P.set("user",null),window.location.reload()})}function Ga(){return`
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
  `}function Fo(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>Vo(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function zo(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function Oo(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function Os(){return zo(_o)}function Cn(){return zo(Ao)}function Uo(e){let t=Os(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];Oo(_o,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};us(n.query||"",n.activeIndex||0)}function Ka(e){let t=Cn().filter(n=>n!==e),s=[e,...t].slice(0,8);Oo(Ao,s)}function Vo(e){if(P.get("route")!=="chat"){je.navigate("chat"),setTimeout(()=>Vo(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function Wo(e,t="free_prompt",s=!1){if(P.get("route")!=="chat"){je.navigate("chat"),setTimeout(()=>Wo(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?Fs():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function ps(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function Co(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),us(e,0))}function vs(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function Ya(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function Ja(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=Ya(s,n);return i===null?null:70+i}function Za(e){let t=(e||"").trim().toLowerCase(),s=Fo(),n=Os(),o=Cn();return s.map(i=>{let a=Ja(t,i);if(a===null)return null;let l=n.includes(i.id)?-12:0,r=o.includes(i.id)?-8:0;return{...i,__score:a+l+r}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function Xa(e){let t=Fo(),s=Object.fromEntries(t.map(v=>[v.id,v])),n=(e||"").trim(),o=[];if(n!==""){let v=Za(e).slice(0,18);return v.length>0&&o.push({title:"Results",commands:v}),o}let i=Cn(),a=Os(),l=new Set,r=i.map(v=>s[v]).filter(Boolean);r.length>0&&(o.push({title:"Recent",commands:r}),r.forEach(v=>l.add(v.id)));let p=a.map(v=>s[v]).filter(v=>v&&!l.has(v.id));return p.length>0&&(o.push({title:"Pinned",commands:p}),p.forEach(v=>l.add(v.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(v=>{let d=t.filter(u=>u.group===v&&!l.has(u.id));d.length>0&&(o.push({title:v,commands:d}),d.forEach(u=>l.add(u.id)))}),o}function us(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Xa(e),o=n.flatMap(p=>p.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=Os();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let l="",r=0;n.forEach(p=>{l+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${y(p.title)}</div>`,p.commands.forEach(c=>{let v=r===i,d=a.includes(c.id);l+=`
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${r}"
            class="vs-cmd-item ${v?"vs-cmd-item-active":""}">
            <div class="min-w-0">
              <div class="vs-cmd-item-title">${y(c.title)}</div>
              <div class="vs-cmd-item-desc">${y(c.prompt?c.prompt.substring(0,80)+(c.prompt.length>80?"\u2026":""):c.meta)}</div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${y(c.id)}"
            class="vs-cmd-pin ${d?"vs-cmd-pin-active":""}"
            title="${d?"Unpin":"Pin"}">
            ${d?"\u2605":"\u2606"}
          </button>
        </div>
      `,r+=1})}),s.innerHTML=l,s.querySelectorAll("[data-command-index]").forEach(p=>{p.addEventListener("click",()=>{let c=parseInt(p.dataset.commandIndex||"0",10);Go(c)})}),s.querySelectorAll("[data-command-pin]").forEach(p=>{p.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let v=p.dataset.commandPin;v&&Uo(v)})})}function Go(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(Ka(n.id),vs(),Promise.resolve(n.run()).catch(()=>{}))}function Qa(){return`
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
  `}function Ps(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function Bt(){try{let e=localStorage.getItem(Io);if(!e)return Ps();let t=JSON.parse(e);return{...Ps(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Ps().pages}}catch{return Ps()}}function Ko(e){try{localStorage.setItem(Io,JSON.stringify(e))}catch{}}function Rs(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function Lo(){let e=window.__vsOnboarding||{step:1,draft:Bt()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||Bt(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),l=document.getElementById("btn-onboarding-next"),r=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!l||!r)return;let p=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${p[t-1]}`,n.innerHTML=p.map((c,v)=>{let d=v+1===t,u=v+1<t;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${d?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":u?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${v+1}. ${y(c)}</div>
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
            ${c.map(v=>`
              <label class="flex items-center gap-2 text-xs text-vs-text-secondary rounded-lg border border-vs-border-subtle px-2.5 py-2">
                <input type="checkbox" class="accent-[var(--vs-accent)]" data-onboard-page="${v.key}" ${s.pages.includes(v.key)?"checked":""}>
                <span>${v.label}</span>
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
    `}a.disabled=t===1,l.classList.toggle("hidden",t===3),r.classList.toggle("hidden",t!==3),er()}function er(){let e=window.__vsOnboarding||{draft:Bt()},t=()=>{var n,o,i,a,l,r,p,c,v,d,u;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((r=(l=document.getElementById("onboard-offer"))==null?void 0:l.value)==null?void 0:r.trim())||e.draft.offer||"",audience:((c=(p=document.getElementById("onboard-audience"))==null?void 0:p.value)==null?void 0:c.trim())||e.draft.audience||"",style:((v=document.getElementById("onboard-style"))==null?void 0:v.value)||e.draft.style||"modern-minimal",tone:((d=document.getElementById("onboard-tone"))==null?void 0:d.value)||e.draft.tone||"confident",content_mode:((u=document.getElementById("onboard-content-mode"))==null?void 0:u.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(m=>m.checked).map(m=>m.dataset.onboardPage).filter(Boolean)),Ko(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function tr(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function sr(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>Rs());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>Rs());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Bt()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,Lo()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Bt()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,Lo()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:Bt()}).draft||Bt(),l=tr(a);try{localStorage.setItem($a,"1")}catch{}Ko(a),Rs(),Wo(l,"create_site",!0)})}function nr(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var O,ee;let N=ks()==="light";e.innerHTML=N?x.sun:x.moon,e.title=N?"Switch to dark":"Switch to light",window.__vsEditorPage&&((O=window.monaco)!=null&&O.editor)&&window.monaco.editor.setTheme(os()),document.getElementById("vs-code-editor-overlay")&&((ee=window.monaco)!=null&&ee.editor)&&window.monaco.editor.setTheme(os())});let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{Co()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>vs());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{us(n.value,0)}),n.addEventListener("keydown",C=>{let N=window.__vsCommandPalette||{commands:[],activeIndex:0};if((C.metaKey||C.ctrlKey)&&C.key.toLowerCase()==="p"){C.preventDefault();let z=N.commands[N.activeIndex];z&&Uo(z.id);return}if(C.key==="ArrowDown"){C.preventDefault(),us(n.value,N.activeIndex+1);return}if(C.key==="ArrowUp"){C.preventDefault(),us(n.value,N.activeIndex-1);return}if(C.key==="Enter"){C.preventDefault(),Go();return}C.key==="Escape"&&(C.preventDefault(),vs())})),sr();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",C=>{C.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",C=>{!i.classList.contains("hidden")&&!i.contains(C.target)&&C.target!==o&&!o.contains(C.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav"].forEach(C=>{let N=document.getElementById(C);N&&i&&N.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await S.post("/auth/logout"),P.set("user",null),window.location.reload()});let l=document.getElementById("btn-undo-status");l&&l.addEventListener("click",()=>{He()||Bo()});let r=document.getElementById("btn-redo-status");r&&r.addEventListener("click",()=>{He()||Mo()});let p=document.getElementById("btn-preview-site");p&&p.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let c=document.getElementById("btn-snapshot");c&&c.addEventListener("click",async()=>{var O;if(He())return;c.disabled=!0,vt("Creating snapshot...");let{ok:C,data:N,error:z}=await S.post("/snapshots",{type:"manual",label:"Manual snapshot"});c.disabled=!1,vt(C?`\u2713 Snapshot saved (${((O=N==null?void 0:N.snapshot)==null?void 0:O.file_count)||0} files)`:"\u2717 "+((z==null?void 0:z.message)||"Snapshot failed"),C?"success":"error",4e3)});let v=document.getElementById("btn-download");v&&((async()=>{var O;let{ok:C,data:N}=await S.get("/settings");(O=N==null?void 0:N.settings)!=null&&O.last_published_at||(v.disabled=!0,v.title="Publish your site first to enable download.",v.classList.add("opacity-40"))})(),v.addEventListener("click",()=>{v.disabled||He()||Yo()}));let d=document.getElementById("btn-publish");d&&(Dt(),d.addEventListener("click",async()=>{var me,Ve;let C=gs();if(C.publishing)return;if(C.hasChanges===!1){T("No unpublished changes to publish.","warning");return}let N=C.counts||{added:0,modified:0,deleted:0},z=Number(N.added||0)+Number(N.modified||0)+Number(N.deleted||0),O=localStorage.getItem("vs_publish_snapshot"),ie=await ir({totalChanges:z,snapshotDefault:O===null?!0:O!=="false"});if(!ie||He())return;localStorage.setItem("vs_publish_snapshot",String(ie.createSnapshot)),C.publishing=!0,Dt(),vt("Publishing...");let{ok:V,data:ae,error:ue}=await S.post("/publish",{create_snapshot:ie.createSnapshot});if(C.publishing=!1,V){let De=((me=ae==null?void 0:ae.published)==null?void 0:me.length)||0,We=((Ve=ae==null?void 0:ae.removed)==null?void 0:Ve.length)||0,Ye=We>0?`Published ${De} file(s), removed ${We} stale file(s).`:`Published ${De} file(s).`;T(Ye,"success"),vt(`\u2713 ${De} published, ${We} removed`,"success",5e3),P.set("previewDirty",!1),it({silent:!0}),window.open("/","_blank")}else T((ue==null?void 0:ue.message)||"Publish failed.","error"),vt("\u2717 "+((ue==null?void 0:ue.message)||"Publish failed"),"error",5e3),it({silent:!0})}));let u=document.getElementById("btn-publish-menu");u&&u.addEventListener("click",C=>{C.stopPropagation();let N=document.querySelector(".vs-publish-dropup");if(N){N.remove();return}let z=document.createElement("div");z.className="vs-publish-dropup",z.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${x.cloudOff} Unpublish
        </button>
      `;let O=u.closest(".vs-publish-split");O?O.appendChild(z):u.parentElement.appendChild(z),z.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(z.remove(),!await be({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0})||He())return;vt("Unpublishing...");let{ok:ae,data:ue,error:me}=await S.post("/publish/unpublish");ae?(T("Unpublished. Default page restored.","success"),vt("\u2713 Site unpublished","success",5e3),it({silent:!0})):(T((me==null?void 0:me.message)||"Unpublish failed.","error"),vt("\u2717 "+((me==null?void 0:me.message)||"Unpublish failed"),"error",5e3))});let ee=V=>{!z.contains(V.target)&&V.target!==u&&(z.remove(),document.removeEventListener("click",ee))};setTimeout(()=>document.addEventListener("click",ee),0);let ie=V=>{V.key==="Escape"&&(z.remove(),document.removeEventListener("keydown",ie),document.removeEventListener("click",ee))};document.addEventListener("keydown",ie)});let m=document.getElementById("resize-handle"),h=document.getElementById("conversation-panel");if(m&&h){let C,N;m.addEventListener("mousedown",z=>{z.preventDefault(),C=z.clientX,N=h.offsetWidth;let O=ie=>{let V=ie.clientX-C,ae=Math.min(580,Math.max(340,N+V));h.style.width=`${ae}px`,P.set("sidebarWidth",ae)},ee=()=>{document.removeEventListener("mousemove",O),document.removeEventListener("mouseup",ee)};document.addEventListener("mousemove",O),document.addEventListener("mouseup",ee)})}let w=document.getElementById("prompt-input");w&&(w.addEventListener("input",()=>{w.style.height="auto",w.style.height=Math.min(200,w.scrollHeight)+"px"}),w.addEventListener("keydown",C=>{C.key==="Enter"&&(C.metaKey||C.ctrlKey)&&(C.preventDefault(),Fs())}));let b=document.getElementById("btn-send");b&&b.addEventListener("click",Fs);let g=document.getElementById("btn-attach-image"),B=document.getElementById("image-file-input");g&&B&&(g.addEventListener("click",()=>B.click()),B.addEventListener("change",()=>{B.files.length>0&&(xn(B.files),B.value="")})),cr();let E=document.querySelector(".vs-prompt-area");E&&(E.addEventListener("dragover",C=>{C.preventDefault(),C.stopPropagation(),E.classList.add("vs-drag-over")}),E.addEventListener("dragleave",C=>{C.preventDefault(),C.stopPropagation(),E.classList.remove("vs-drag-over")}),E.addEventListener("drop",C=>{C.preventDefault(),C.stopPropagation(),E.classList.remove("vs-drag-over");let N=Array.from(C.dataTransfer.files).filter(z=>kn.includes(z.type));N.length>0&&xn(N)})),w&&w.addEventListener("paste",C=>{var O;let z=Array.from(((O=C.clipboardData)==null?void 0:O.items)||[]).filter(ee=>ee.kind==="file"&&kn.includes(ee.type));if(z.length>0){C.preventDefault();let ee=z.map(ie=>ie.getAsFile()).filter(Boolean);xn(ee)}}),Nt();let $=document.getElementById("btn-new-chat");$&&$.addEventListener("click",Fa);let M=document.getElementById("btn-scope-selector");M&&M.addEventListener("click",()=>{za()});let _=document.getElementById("btn-toggle-history");_&&_.addEventListener("click",Na);let j=document.getElementById("btn-visual-editor");j&&j.addEventListener("click",()=>ln());let U=document.getElementById("btn-edit-code");U&&U.addEventListener("click",()=>{let C=window.__vsCurrentPreviewPath||"index.php";Ss(C)});let Q=document.getElementById("btn-refresh-preview");Q&&Q.addEventListener("click",()=>Ft());let K=document.getElementById("btn-save-design");if(K){K.addEventListener("click",()=>{He()||zs()||cs()});let C=()=>{let N=P.get("pages")||[];K.disabled=N.length===0};C(),P.on("pages",C)}let F=document.querySelectorAll("[data-device]"),Z=document.getElementById("preview-frame-container");if(F.length&&Z){let C={desktop:"100%",tablet:"768px",mobile:"375px"};F.forEach(N=>{N.addEventListener("click",()=>{let z=N.dataset.device,O=C[z]||"100%";z==="desktop"?(Z.style.maxWidth="",Z.style.width="",Z.style.alignSelf=""):(Z.style.maxWidth=O,Z.style.width="100%",Z.style.alignSelf="center"),F.forEach(ee=>{ee.classList.remove("vs-device-btn-active"),ee.dataset.device===z&&ee.classList.add("vs-device-btn-active")})})})}let ce=document.getElementById("btn-external-preview");ce&&ce.addEventListener("click",()=>{let C=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(C),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",C=>{var z,O;let N=(O=(z=C.target)==null?void 0:z.closest)==null?void 0:O.call(z,"[data-code-toggle]");N&&(C.preventDefault(),vr(N))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",C=>{if((C.metaKey||C.ctrlKey)&&C.key==="k"){C.preventDefault(),ps()?vs():Co();return}if(C.key==="Escape"&&ps()){C.preventDefault(),vs();return}if(C.key==="Escape"&&js()){C.preventDefault(),Rs();return}if((C.metaKey||C.ctrlKey)&&C.key==="z"&&!C.shiftKey){if(ps()||js())return;let N=document.activeElement;if(N&&(N.tagName==="INPUT"||N.tagName==="TEXTAREA"))return;C.preventDefault(),Bo()}if((C.metaKey||C.ctrlKey)&&C.key==="z"&&C.shiftKey){if(ps()||js())return;let N=document.activeElement;if(N&&(N.tagName==="INPUT"||N.tagName==="TEXTAREA"))return;C.preventDefault(),Mo()}if(C.key==="v"&&!C.metaKey&&!C.ctrlKey&&!C.altKey&&!C.shiftKey){if(ps()||js())return;let N=document.activeElement;if(N&&(N.tagName==="INPUT"||N.tagName==="TEXTAREA"||N.isContentEditable))return;let z=P.get("route");if(!wn.includes(z))return;C.preventDefault(),ln()}if(C.key==="Escape"&&Qt()){C.preventDefault(),es();return}}));let R=P.get("route");if(wn.includes(R))try{let C=P.get("activeConversationId"),N=localStorage.getItem("vs-active-conversation"),z=C||N,O=document.getElementById("chat-messages"),ee=O==null?void 0:O.querySelector(".vs-empty-state");z&&!P.get("aiStreaming")?(C||P.set("activeConversationId",z),ee&&Ds(z)):z||O&&O.children.length===0&&(O.innerHTML=qt(),Nt())}catch{}ms(),ar()}function or(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=P.get("pages"),s=!t||t.length===0,n=s?"Building your site":"Applying your changes",o=s?"Generating a new website can take up to 10 minutes.<br>Please be patient while the AI works.":"Small changes can take a minute, larger updates can take up to 10 minutes.",i=document.createElement("div");i.className="vs-generating-overlay",i.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">${n}</div>
    <div class="vs-gen-subtitle">${o}</div>
    <div class="vs-gen-note">Keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-metrics" id="overlay-metrics"></div>
  `,e.appendChild(i)}function So(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function Ft(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=Ft;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),Ns())}));function En(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{Ft()}}window.sendPreviewMessage=En;async function Bo(){(await S.post("/revisions/undo")).ok&&(setTimeout(()=>Ft(),300),await ms(),it({silent:!0}))}async function Mo(){(await S.post("/revisions/redo")).ok&&(setTimeout(()=>Ft(),300),await ms(),it({silent:!0}))}async function ms(){let{ok:e,data:t}=await S.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!s,l.title=o,l.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!n,l.title=i,l.classList.toggle("opacity-40",!n))})}function gs(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function vt(e,t="neutral",s=0){let n=document.getElementById("status-text");n&&(n.textContent=e,n.className=t==="success"?"text-xs text-vs-success":t==="error"?"text-xs text-vs-error":"text-xs text-vs-text-ghost",window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s>0&&(window.__vsStatusResetTimer=setTimeout(()=>{let o=document.getElementById("status-text");o&&(o.textContent="Ready",o.className="text-xs text-vs-text-ghost",window.__vsStatusResetTimer=null)},s)))}function Dt(){let e=gs(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=l=>{s&&(l?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${x.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${x.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${x.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${x.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let l=a===1?"":"s";n.textContent=`${a} unpublished change${l}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${x.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=Dt;function ir({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var r,p;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=c=>{c.key==="Escape"&&(c.preventDefault(),l(null))},l=c=>{document.removeEventListener("keydown",a),he(i),s(c)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),fe(i,()=>l(null)),(r=document.getElementById("vs-confirm-cancel"))==null||r.addEventListener("click",()=>l(null)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>{let c=document.getElementById("vs-publish-snapshot-cb");l({createSnapshot:c?c.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var c;return(c=document.getElementById("vs-confirm-ok"))==null?void 0:c.focus()},220)})}function Yo(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=gs().hasChanges===!0?`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=d=>{d.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),he(o)};o.querySelector("#vs-download-close").addEventListener("click",a),fe(o,a),document.addEventListener("keydown",i);let l=o.querySelector("#vs-download-publish-link");l&&l.addEventListener("click",d=>{d.preventDefault(),a(),setTimeout(()=>{let u=document.getElementById("btn-publish");u&&!u.disabled&&u.click()},400)});let r=o.querySelectorAll(".vs-download-card"),p=o.querySelector("#vs-download-action"),c="php";r.forEach(d=>{d.addEventListener("click",()=>{if(d.classList.contains("is-loading"))return;r.forEach(m=>m.classList.remove("is-selected")),d.classList.add("is-selected"),c=d.dataset.format;let u=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${x.download} ${u}`})});let v=!1;p.addEventListener("click",async()=>{var d;if(!v){v=!0,p.disabled=!0,p.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',r.forEach(u=>u.style.pointerEvents="none");try{let u=P.get("sessionToken"),m={"Content-Type":"application/json",Accept:"application/zip"};u&&(m["X-VS-Token"]=u);let h=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:m,credentials:"same-origin",body:JSON.stringify({format:c})});if(!h.ok){let M="Export failed.";try{let _=await h.json();M=((d=_==null?void 0:_.error)==null?void 0:d.message)||M}catch{}T(M,"error");return}let b=(h.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),g=b?b[1]:`site-${c}-${new Date().toISOString().slice(0,10)}.zip`,B=await h.blob(),E=URL.createObjectURL(B),$=document.createElement("a");$.href=E,$.download=g,$.style.display="none",document.body.appendChild($),$.click(),setTimeout(()=>{URL.revokeObjectURL(E),$.remove()},100),T(`\u2713 ${g} downloaded`,"success")}catch{T("Download failed. Check your connection.","error")}finally{v=!1,p.disabled=!1;let u=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${x.download} ${u}`,r.forEach(m=>m.style.pointerEvents="")}}})}async function it({silent:e=!1}={}){let t=gs();if(t.publishing){Dt();return}t.checking=!0,e||Dt();let{ok:s,data:n,error:o}=await S.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",Dt()}window.refreshPublishState=it;function ar(){let e=gs();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),it({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||it({silent:!0})},15e3)}function rr(e){if(!e)return{text:"",images:[],webRefUrl:null};let t=null,s=e;s.includes("[vx-ref:")&&(s=s.replace(/\[vx-ref:(https?:\/\/[^\]]+)\]/g,(o,i)=>(t=i,"")));let n=[];return s.includes("[vx-img:")&&(s=s.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(o,i)=>(n.push(i),""))),{text:s.trim(),images:n,webRefUrl:t}}function xn(e){let t=Array.from(e),s=Eo-ut.length;if(s<=0){T(`Maximum ${Eo} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&T(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!kn.includes(o.type)){T(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>Sa){T(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,l=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!l)return;let r=new Image;r.onload=()=>{let p=lr(r,120);ut.push({media_type:l[1],data:l[2],name:o.name,preview:a,thumbnail:p}),Ln()},r.src=a},i.readAsDataURL(o)})}function lr(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function Ln(){let e=document.getElementById("image-attachments");if(e){if(ut.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=ut.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${y(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);ut.splice(n,1),Ln()})})}}function dr(){ut=[],Ln()}function Jo(){let t=(P.get("pages")||[]).length>0,s=document.getElementById("website-ref-restyle-options"),n=document.getElementById("website-ref-helper"),o=document.getElementById("btn-website-ref-confirm");s&&(s.hidden=!t),n&&(n.textContent=t?"Use another website as design reference for your site.":"Uses an existing website as design reference."),o&&(o.textContent=t?"Add":"Attach")}function Zo(){Ke=null;let e=document.getElementById("website-ref-chip");e&&(e.hidden=!0);let t=document.getElementById("prompt-input");t&&(t.placeholder="Describe what you want to build...");let s=document.getElementById("btn-attach-website");s&&s.classList.remove("is-active")}function cr(){let e=document.getElementById("btn-attach-website"),t=document.getElementById("website-ref-sheet"),s=document.getElementById("website-ref-url"),n=document.getElementById("website-ref-mode"),o=document.getElementById("btn-website-ref-confirm"),i=document.getElementById("btn-website-ref-cancel"),a=document.getElementById("website-ref-chip"),l=document.getElementById("website-ref-chip-label"),r=document.getElementById("btn-remove-website-ref"),p=document.getElementById("prompt-input");function c(d){if(v(),s&&s.classList.add("vs-input-error"),s){let u=document.createElement("div");u.className="vs-field-error vs-ref-url-error",u.textContent=d,s.insertAdjacentElement("afterend",u)}}function v(){s&&s.classList.remove("vs-input-error");let d=t==null?void 0:t.querySelector(".vs-ref-url-error");d&&d.remove()}e&&t&&e.addEventListener("click",()=>{zs()||(Jo(),v(),t.hidden=!t.hidden,e.classList.toggle("is-active",!t.hidden||Ke!==null),!t.hidden&&s&&s.focus())}),o&&o.addEventListener("click",async()=>{var m;if(He())return;let d=(m=s==null?void 0:s.value)==null?void 0:m.trim();if(!d||!d.match(/^https?:\/\/.+/)){c("Enter a valid URL starting with http:// or https://");return}let u=o.textContent;o.disabled=!0,o.textContent="Checking\u2026",v();try{let{ok:h,data:w,error:b}=await S.post("/ai/check-url",{url:d});if(!h){c((b==null?void 0:b.message)||"Could not reach this URL.");return}let g=(w==null?void 0:w.url)||d,E=(P.get("pages")||[]).length>0;Ke={url:g,contentMode:E?(n==null?void 0:n.value)||"keep":"regenerate",restyle:E};let $="Design reference";l.textContent=`${$}: ${Xt(g)}`,l.title=g,a&&(a.hidden=!1),t&&(t.hidden=!0),e&&e.classList.add("is-active"),p&&(p.placeholder="Describe what to change (optional)...",p.focus())}catch{c("Network error \u2014 please check your connection and try again.")}finally{o.disabled=!1,o.textContent=u}}),i&&t&&i.addEventListener("click",()=>{v(),t.hidden=!0,e&&!Ke&&e.classList.remove("is-active")}),r&&r.addEventListener("click",()=>{Zo()}),s&&o&&(s.addEventListener("keydown",d=>{d.key==="Enter"&&(d.preventDefault(),o.click())}),s.addEventListener("input",v))}async function Fs(){if(He())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=ut.length>0;if(!t&&!s&&!(Ke!==null)||P.get("aiStreaming"))return;if(Ke!=null&&Ke.restyle)try{let A=P.get("siteName")||"Untitled";if(!(await S.post("/designs",{name:`${A} (before restyle)`,description:`Automatic snapshot saved before restyling from ${Ke.url}`,is_system_backup:!0})).ok){T("Could not save your current design before restyling. Please try again.","error");return}}catch{T("Could not save your current design before restyling. Please try again.","error");return}e.value="",e.style.height="auto";let o=document.getElementById("chat-messages");if(!o)return;let i=[...ut];dr();let a=Ke;Zo();let l=i.length>0?`<div class="vs-msg-user-images">${i.map(A=>`<img src="${A.preview}" alt="${y(A.name)}" class="vs-msg-user-image" />`).join("")}</div>`:"",r=a?`<div class="vs-msg-user-webref"><a href="${le(a.url)}" target="_blank" rel="noopener" title="${le(a.url)}">${x.globe} <span>${y(Xt(a.url))}</span></a></div>`:"",p=`
    <div class="vs-msg-user mb-6 mt-4">
      ${l}
      ${r}
      ${t?`<div class="vs-msg-user-bubble">${y(t)}</div>`:""}
    </div>
  `,c=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,v=`
    <div class="vs-msg-ai mb-6" data-stream-id="${c}">
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
        <button data-role="stop-btn" class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
      </div>
      <div data-role="error" hidden class="mt-3 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>
    </div>
  `,d=o.querySelector(".vs-empty-state");d&&d.remove(),o.insertAdjacentHTML("beforeend",p+v),o.scrollTop=o.scrollHeight;let u=!0,m=80,h=()=>{u=o.scrollHeight-o.scrollTop-o.clientHeight<=m};o.addEventListener("scroll",h);let w=()=>{u&&(o.scrollTop=o.scrollHeight)},b=o.querySelector(`.vs-msg-ai[data-stream-id="${c}"]`);if(!b)return;let g=b.querySelector('[data-role="typing"]'),B=b.querySelector('[data-role="status"]'),E=b.querySelector('[data-role="stream-content"]'),$=b.querySelector('[data-role="files-section"]'),M=b.querySelector('[data-role="files"]'),_=b.querySelector('[data-role="files-label"]'),j=b.querySelector('[data-role="files-count"]'),U=b.querySelector('[data-role="files-progress"]'),Q=b.querySelector('[data-role="error"]'),K=b.querySelector('[data-role="status-timer"]'),F=A=>{A&&A.removeAttribute("hidden")},Z=A=>{A&&A.setAttribute("hidden","")},ce=Date.now(),R=0,C=Date.now(),N=!1,z=!1,O=setInterval(()=>{let A=Math.floor((Date.now()-ce)/1e3),f=Math.floor(A/60),L=A%60,I=f>0?`${f}m ${L}s`:`${L}s`;R>0&&(I+=` \xB7 ${R.toLocaleString()} tokens`),K&&(K.textContent=I);let H=document.getElementById("overlay-metrics");H&&(H.textContent=I),Date.now()-C>3e5&&!N&&(N=!0,K&&(K.textContent=`${I} \xB7 No data for 5 min \u2014 may have stalled`,K.style.color="var(--vs-warning, #d97706)"))},1e3);P.set("aiStreaming",!0),document.body.classList.add("vs-ai-streaming");let ee=document.getElementById("btn-send");ee&&(ee.disabled=!0,ee.classList.add("opacity-50")),or();let ie="",V=[],ae=!1,ue=null,me=!0,Ve=new AbortController,De=b.querySelector('[data-role="stop-btn"]');De&&De.addEventListener("click",()=>Ve.abort());let We=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let Ye=e.dataset.actionData,mt=null;if(Ye){try{mt=JSON.parse(Ye)}catch{}delete e.dataset.actionData}let k=t||"";if(!k)if(a)try{let A=Xt(a.url);k=a.restyle?`(restyle from: ${A})`:`(import from: ${A})`}catch{k=`(reference: ${a.url})`}else i.length>0&&(k="(see attached images)");a&&(k=`[vx-ref:${a.url}]`+k),i.length>0&&(k=i.map(f=>`[vx-img:${f.thumbnail}]`).join("")+k);let q={user_prompt:k,action_type:We,page_scope:P.get("activePageScope"),conversation_id:P.get("activeConversationId"),action_data:mt};a&&(q.action_type=a.restyle?"restyle_site":"import_site",q.action_data={url:a.url,content_mode:a.contentMode},q.page_scope=null),i.length>0&&(q.images=i.map(A=>({data:A.data,media_type:A.media_type}))),await yt("/ai/prompt",q,{signal:Ve.signal,onConversation(A){if(A){P.set("activeConversationId",A);try{localStorage.setItem("vs-active-conversation",A)}catch{}}},onStatus(A){!z&&$&&!$.hasAttribute("hidden")&&_&&(_.textContent=A)},onToken(A){ie+=A,R+=Math.ceil(A.length/4),C=Date.now(),N=!1,K&&(K.style.color="");let f=ie.trimStart();if(!ae&&f.length>0&&(ae=f.startsWith("{")||f.startsWith("```json")||f.startsWith("```")||f.startsWith("<|")||f.startsWith("<message>")||f.startsWith("<file ")||A.includes("<|")||f.includes("<|channel|>")||f.includes('"operations"')||f.includes('"assistant_message"'),ae&&E&&(E.innerHTML="")),Z(g),E&&ae){let L=ie.match(/<message>([\s\S]*?)(<\/message>|$)/);if(L){let I=L[1].trim();I&&(F(E),E.innerHTML=Hs(I))}$&&ie.includes("<file ")&&F($)}else E&&(F(E),E.innerHTML=Hs(ie));w()},onFile(A){if(V.push(A),$&&F($),j){let f=V.length;j.textContent=`${f} file${f!==1?"s":""}`}if(M){let f=A.action==="delete",L=(V.length-1)*60,I=f?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';M.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${f?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${L}ms">
            <span class="vs-file-badge-icon">${I}</span>
            <span>${y(A.path)}</span>
          </div>
        `)}ue||(me=!0),A.path.endsWith(".css")||(me=!1),clearTimeout(ue),ue=setTimeout(()=>{En(me?"voxelsite:reload-css":"voxelsite:reload"),ue=null,me=!0},600),w()},onDone(A){z=!0,clearTimeout(ue),ue=null,clearInterval(O),Z(g),Z(B);let f=A.files_modified||[],L=V.length>0||f.length>0;if($&&L){Z(U),$.classList.add("vs-files-done"),_&&(_.textContent=A.partial?"Files updated (partial)":"Files updated");let D=document.createElement("div");D.className="vs-chat-action-row",D.innerHTML=`
          <button class="vs-btn vs-btn-ghost vs-btn-xs vs-chat-save-btn" title="Save current design to the library">
            ${x.save} Save to Designs
          </button>
        `,D.querySelector("button").addEventListener("click",()=>{cs()}),$.insertAdjacentElement("afterend",D)}else $&&!$.hasAttribute("hidden")&&(Z(U),Z($));if(E)if(A.message)F(E),E.innerHTML=Hs(A.message);else if(ae)Z(E);else{let D=E.textContent||"";(D.includes("<|channel|>")||D.includes('"operations"')||D.includes('"assistant_message"')||D.includes("<file ")||D.includes("<message>"))&&(Z(E),E.innerHTML="")}let I=A.missing_files||[];if((A.truncated||I.length>0)&&E){let D;I.length>0?D=`The following pages are linked in the navigation but were NOT created yet: ${I.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:D="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let Y=document.getElementById("prompt-input");Y&&!P.get("aiStreaming")&&(_&&(_.textContent="Generating remaining files..."),$&&($.classList.remove("vs-files-done"),F($)),Y.value=D,Y.dataset.actionType="free_prompt",Fs())},800)}if(A.conversation_id){P.set("activeConversationId",A.conversation_id);try{localStorage.setItem("vs-active-conversation",A.conversation_id)}catch{}}let H=[...V,...f];if(H.length>0){let D=H.map(J=>J.path||J),Y=D.some(J=>J==="index.php"),G=D.filter(J=>J.endsWith(".php")&&!J.includes("/")&&J!=="index.php"),W=Y&&G.length>0,te;W?te="index.php":G.length>0?te=G[0]:te=Y?"index.php":null,Ft(te),P.set("previewDirty",!0),it({silent:!0})}So(),No(),ms(),o.removeEventListener("scroll",h),o.scrollTop=o.scrollHeight},onEvaluation(A){let f=(A==null?void 0:A.issues)||[];if(f.length===0)return;let L={error:0,warning:0,info:0};f.forEach(X=>L[X.severity]=(L[X.severity]||0)+1);let I={error:0,warning:1,info:2},H=[...f].sort((X,ve)=>(I[X.severity]??3)-(I[ve.severity]??3)),D=H.filter(X=>X.severity!=="info"),Y=H.filter(X=>X.severity==="info"),G=[];L.error>0&&G.push(`${L.error} error${L.error!==1?"s":""}`),L.warning>0&&G.push(`${L.warning} warning${L.warning!==1?"s":""}`),L.info>0&&G.push(`${L.info} suggestion${L.info!==1?"s":""}`);let W=X=>X==="error"?"var(--vs-error, #ef4444)":X==="warning"?"var(--vs-warning, #d97706)":"var(--vs-text-ghost)",te=X=>X==="error"?"rgba(239,68,68,0.08)":X==="warning"?"rgba(217,119,6,0.08)":"var(--vs-bg-raised)",J=X=>{let ve=X.file?` in ${X.file}`:"",gt=X.suggested_fix?`

Suggested approach: ${X.suggested_fix}`:"";return`Review this suggestion and apply if appropriate \u2014 ${X.severity}${ve}: ${X.description}${gt}`},se=(X,ve)=>`
        <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${W(X.severity)}; background: ${te(X.severity)};">${y(X.severity)}</span>
            <span style="font-size: 11px; color: var(--vs-text-ghost);">${y(X.category||"")}</span>
            ${X.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${y(X.file)}${X.line?":"+X.line:""}</span>`:""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${y(X.description||"")}</div>
          ${X.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${y(X.suggested_fix)}</div>`:""}
          <div style="margin-top: 4px; text-align: right;">
            <button class="vs-eval-add-to-chat" data-eval-idx="${ve}" style="
              background: none; border: none; cursor: pointer; padding: 2px 0;
              font-size: 11px; color: var(--vs-accent); opacity: 0.7;
              transition: opacity 0.15s ease;
            " onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'">Add to chat \u2192</button>
          </div>
        </div>
      `,re=D.map((X,ve)=>se(X,ve)).join(""),Ce=Y.length>0?`
        <details style="border-top: 1px solid var(--vs-border-subtle);">
          <summary style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; cursor: pointer; user-select: none; font-size: 11px; color: var(--vs-text-ghost); list-style: none;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            ${Y.length} additional suggestion${Y.length!==1?"s":""}
          </summary>
          ${Y.map((X,ve)=>se(X,D.length+ve)).join("")}
        </details>
      `:"",ge=L.error>0?"error":L.warning>0?"warning":"info",ye=W(ge),Be=`
        <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${ge==="error"?"rgba(239,68,68,0.15)":ge==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)"}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
          <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${ye}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Expert Review \xB7 ${G.join(", ")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div style="border-top: 1px solid var(--vs-border-subtle);">
            <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
            ${re}
            ${Ce}
          </div>
        </details>
      `,ne;$&&!$.hasAttribute("hidden")?($.insertAdjacentHTML("afterend",Be),ne=$.nextElementSibling):E?(E.insertAdjacentHTML("afterend",Be),ne=E.nextElementSibling):(b.insertAdjacentHTML("beforeend",Be),ne=b.lastElementChild),ne&&ne.addEventListener("click",X=>{let ve=X.target.closest(".vs-eval-add-to-chat");if(!ve)return;X.preventDefault();let gt=parseInt(ve.dataset.evalIdx,10),ht=H[gt];if(!ht)return;let Pe=document.getElementById("prompt-input");if(!Pe)return;let zt=J(ht),Ot=Pe.value.trim();Pe.value=Ot?Ot+`

`+zt:zt,Pe.focus(),Pe.style.height="auto",Pe.style.height=Math.min(Pe.scrollHeight,200)+"px",Pe.selectionStart=Pe.selectionEnd=Pe.value.length,ve.textContent="\u2713 Added",ve.style.opacity="1",setTimeout(()=>{ve.textContent="Add to chat \u2192",ve.style.opacity="0.7"},1500)}),w()},onWarning(A){A.toLowerCase().includes("truncat")||M&&(M.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${y(A)}</div>
        `)},onError(A){clearTimeout(ue),ue=null,clearInterval(O),Z(g),Z(B),Q&&(Q.textContent=A.message||"Something went wrong.",F(Q)),So(),U&&Z(U),$&&V.length>0&&($.classList.add("vs-files-done"),_&&(_.textContent="Files updated (partial)"))}}),P.set("aiStreaming",!1),document.body.classList.remove("vs-ai-streaming"),ee&&(ee.disabled=!1,ee.classList.remove("opacity-50"))}function To(){var v;Ho.innerHTML=`
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
            <h1 class="vs-login-title">${Ue?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${Ue?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${Ue?`
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
                ${Ue?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${Ue?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${Ue?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${x.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${Ue?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${Ue?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let d=e.type==="password";e.type=d?"text":"password",t.innerHTML=d?x.eyeOff:x.eye,t.title=d?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let d=ks();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=d==="light"?x.sun:x.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(d=>{d.addEventListener("click",()=>{let u=document.getElementById(d.dataset.toggleTarget);if(!u)return;let m=u.type==="password";u.type=m?"text":"password",d.innerHTML=m?x.eyeOff:x.eye,d.title=m?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),l=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var u,m,h;o.classList.add("hidden"),i.classList.remove("hidden");let d=document.getElementById("forgot-content");try{let b=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((u=b==null?void 0:b.data)==null?void 0:u.mode)||"file")==="email"?(d.innerHTML=`
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
          `,(m=document.getElementById("forgot-form"))==null||m.addEventListener("submit",async B=>{var j,U,Q;B.preventDefault();let E=document.getElementById("forgot-message"),$=document.getElementById("forgot-email"),M=B.target.querySelector('button[type="submit"]'),_=(j=$==null?void 0:$.value)==null?void 0:j.trim();if(_){M&&(M.disabled=!0,M.textContent="Sending...");try{let F=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:_})})).json();E&&(F.ok?(E.textContent=((U=F.data)==null?void 0:U.message)||"Recovery link sent. Check your inbox.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",$&&($.value="")):(E.textContent=((Q=F.error)==null?void 0:Q.message)||"Failed to send recovery email.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),E.classList.remove("hidden"))}catch{E&&(E.textContent="Network error. Please try again.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",E.classList.remove("hidden"))}finally{M&&(M.disabled=!1,M.textContent="Send Recovery Link")}}})):(d.innerHTML=`
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
          `,n(),(h=document.getElementById("forgot-form"))==null||h.addEventListener("submit",async B=>{var j,U,Q;B.preventDefault();let E=document.getElementById("forgot-message"),$=(j=document.getElementById("forgot-email"))==null?void 0:j.value,M=(U=document.getElementById("forgot-new-password"))==null?void 0:U.value;if(!$||!M)return;let _=await S.post("/auth/reset-password",{email:$,new_password:M});_.ok?(E&&(E.textContent="Password reset. You can now sign in with your new password.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",E.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):E&&(E.textContent=((Q=_.error)==null?void 0:Q.message)||"Reset failed. Make sure the .reset file exists in _data/.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",E.classList.remove("hidden"))}))}catch{d.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),l&&l.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let p=new URLSearchParams(window.location.search).get("reset");if(p&&p.length===64&&i&&o){let d=window.location.pathname+window.location.hash;window.history.replaceState(null,"",d),o.classList.add("hidden"),i.classList.remove("hidden");let u=document.getElementById("forgot-content");u&&(u.innerHTML=`
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
      `,n(),(v=document.getElementById("token-reset-form"))==null||v.addEventListener("submit",async m=>{var B,E,$,M;m.preventDefault();let h=document.getElementById("forgot-message"),w=(B=document.getElementById("token-new-password"))==null?void 0:B.value,b=(E=document.getElementById("token-confirm-password"))==null?void 0:E.value,g=m.target.querySelector('button[type="submit"]');if(!w||w.length<8){h&&(h.textContent="Password must be at least 8 characters.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"));return}if(w!==b){h&&(h.textContent="Passwords do not match.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"));return}g&&(g.disabled=!0,g.textContent="Resetting...");try{let j=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:p,new_password:w})})).json();h&&(j.ok?(h.textContent=(($=j.data)==null?void 0:$.message)||"Password reset. You can now sign in.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",h.classList.remove("hidden"),m.target.querySelectorAll("input").forEach(U=>U.disabled=!0),g&&(g.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(h.textContent=((M=j.error)==null?void 0:M.message)||"Reset failed. The link may have expired.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden")))}catch{h&&(h.textContent="Network error. Please try again.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"))}finally{g&&(g.disabled=!1,g.textContent="Reset Password")}}))}let c=document.getElementById("login-form");c&&c.addEventListener("submit",async d=>{var b,g,B,E;d.preventDefault();let u=(b=document.getElementById("login-email"))==null?void 0:b.value,m=(g=document.getElementById("login-password"))==null?void 0:g.value,h=document.getElementById("login-error");if(!u||!m)return;let w=await S.post("/auth/login",{email:u,password:m});w.ok&&((B=w.data)!=null&&B.token)?(P.batch(()=>{P.set("user",w.data.user),P.set("sessionToken",w.data.token)}),Do()):h&&(h.textContent=((E=w.error)==null?void 0:E.message)||"Invalid email or password.",h.classList.remove("hidden"))}),ms()}function js(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function Hs(e){if(!e)return"";if(!window.marked)return y(e);let t=window.marked.parse(e);return pr(t)}function pr(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),l=a?a.split(`
`):[];if(l.length<=Ca)return;let r=l.slice(0,La).join(`
`)+`
...`,p=document.createElement("div");p.className="vs-code-collapse",p.setAttribute("data-code-collapse","1");let c=document.createElement("pre");c.className="vs-code-collapse-preview",c.setAttribute("data-code-preview","1");let v=document.createElement("code");o!=null&&o.className&&(v.className=o.className),v.textContent=r,c.appendChild(v),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let d=document.createElement("button");d.type="button",d.className="vs-code-collapse-toggle",d.setAttribute("data-code-toggle","1"),d.setAttribute("data-lines",String(l.length)),d.setAttribute("aria-expanded","false"),d.textContent=`More (${l.length} lines)`;let u=n.parentNode;u&&(u.replaceChild(p,n),p.appendChild(c),p.appendChild(n),p.appendChild(d))}),t.innerHTML}function vr(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Do();})();
