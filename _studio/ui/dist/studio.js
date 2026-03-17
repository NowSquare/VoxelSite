(()=>{var In=e=>{throw TypeError(e)};var Us=(e,t,s)=>t.has(e)||In("Cannot "+s);var le=(e,t,s)=>(Us(e,t,"read from private field"),s?s.call(e):t.get(e)),Ae=(e,t,s)=>t.has(e)?In("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),Fe=(e,t,s,n)=>(Us(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),Ge=(e,t,s)=>(Us(e,t,"access private method"),s);var Ke,Ye,bt,Je,Gt,Ws,Vs=class{constructor(t={}){Ae(this,Gt);Ae(this,Ke,new Map);Ae(this,Ye,new Map);Ae(this,bt,!1);Ae(this,Je,new Map);for(let[s,n]of Object.entries(t))le(this,Ke).set(s,n)}get(t,s=void 0){return le(this,Ke).has(t)?le(this,Ke).get(t):s}set(t,s){let n=le(this,Ke).get(t);n!==s&&(le(this,Ke).set(t,s),le(this,bt)?le(this,Je).has(t)?le(this,Je).get(t).newValue=s:le(this,Je).set(t,{newValue:s,oldValue:n}):Ge(this,Gt,Ws).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return le(this,Ye).has(t)||le(this,Ye).set(t,new Set),le(this,Ye).get(t).add(s),()=>{var n;(n=le(this,Ye).get(t))==null||n.delete(s)}}batch(t){if(le(this,bt)){t();return}Fe(this,bt,!0),le(this,Je).clear();try{t()}finally{Fe(this,bt,!1);for(let[s,{newValue:n,oldValue:o}]of le(this,Je))Ge(this,Gt,Ws).call(this,s,n,o);le(this,Je).clear()}}toJSON(){return Object.fromEntries(le(this,Ke))}};Ke=new WeakMap,Ye=new WeakMap,bt=new WeakMap,Je=new WeakMap,Gt=new WeakSet,Ws=function(t,s,n){let o=le(this,Ye).get(t);if(o)for(let a of o)try{a(s,n)}catch(r){console.error(`[state] Error in "${t}" listener:`,r)}let i=le(this,Ye).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(r){console.error("[state] Error in wildcard listener:",r)}};var H=new Vs({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});H.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});H.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Kt,Mt,Tt,It,At,_t,Ze,xs,Ks,Gs=class{constructor(){Ae(this,Ze);Ae(this,Kt,[]);Ae(this,Mt,null);Ae(this,Tt,!1);Ae(this,It,null);Ae(this,At,null);Ae(this,_t,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return le(this,Kt).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return Fe(this,Mt,t),this}beforeEach(t){return Fe(this,It,t),this}start(){le(this,Tt)||(Fe(this,Tt,!0),window.addEventListener("hashchange",()=>Ge(this,Ze,xs).call(this)),Ge(this,Ze,xs).call(this))}navigate(t){window.location.hash=`/${t}`}refresh(){Fe(this,At,null),Ge(this,Ze,xs).call(this)}get current(){return Ge(this,Ze,Ks).call(this)}};Kt=new WeakMap,Mt=new WeakMap,Tt=new WeakMap,It=new WeakMap,At=new WeakMap,_t=new WeakMap,Ze=new WeakSet,xs=async function(){if(le(this,_t))return;let t=Ge(this,Ze,Ks).call(this),s=le(this,At);if(!(t===s&&le(this,Tt))){if(le(this,It)&&s!==null){Fe(this,_t,!0);try{if(await le(this,It).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{Fe(this,_t,!1)}}Fe(this,At,t);for(let n of le(this,Kt)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,r)=>{i[a]=decodeURIComponent(o[r+1])}),H.batch(()=>{H.set("route",n.pattern),H.set("routeParams",i)}),n.handler(i);return}}le(this,Mt)?(H.set("route","404"),le(this,Mt).call(this,t)):this.navigate("chat")}},Ks=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var je=new Gs;var _n="/_studio/api/router.php";async function ws(e,t,s=null,n={}){let o={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let a=Pn();a&&(o["X-VS-Token"]=a)}s!==null&&(o["Content-Type"]="application/json");let i={method:e,headers:o,credentials:"same-origin",...n};s!==null&&(i.body=JSON.stringify(s));try{let[a,r]=t.split("?"),l=`${_n}?_path=${encodeURIComponent(a)}${r?"&"+r:""}`,p=await fetch(l,i),c=await p.json();return p.status===401?(H.get("user")&&H.set("user",null),c!=null&&c.error?{ok:!1,error:c.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!c.ok&&c.error?(c.error.code==="demo_mode"&&window.showToast&&window.showToast(c.error.message||"Demo mode \u2014 this action is disabled.","warning"),{ok:!1,error:c.error}):{ok:!0,data:c.data||c}}catch{return{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var B={get:(e,t)=>ws("GET",e,null,t),post:(e,t,s)=>ws("POST",e,t,s),put:(e,t,s)=>ws("PUT",e,t,s),delete:(e,t,s)=>ws("DELETE",e,t,s)};async function yt(e,t,s={}){var g,S;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onFile:a=()=>{},onDone:r=()=>{},onEvaluation:l=()=>{},onWarning:p=()=>{},onError:c=()=>{},signal:v=null}=s,d=Pn(),u={"Content-Type":"application/json",Accept:"text/event-stream"};d&&(u["X-VS-Token"]=d);let m=!1,h=0,w=0,f=t.conversation_id||null;try{let q=function(Q){if(!Q.trim())return;let pe="";for(let z of Q.split(`
`))z.startsWith(":")||z.startsWith("data: ")&&(pe+=z.slice(6));if(!pe)return;let b;try{b=JSON.parse(pe)}catch{return}switch(b.type||"message"){case"token":w++,n(b.content||"");break;case"status":o(b.message||"");break;case"conversation":f=b.conversation_id||f,i(b.conversation_id||"");break;case"file_complete":h++,a(b);break;case"done":m=!0,r(b);break;case"evaluation":l(b);break;case"warning":p(b.message||"");break;case"error":c(b);break}},k={method:"POST",headers:u,credentials:"same-origin",body:JSON.stringify(t)};v&&(k.signal=v);let[C,T]=e.split("?"),A=`${_n}?_path=${encodeURIComponent(C)}${T?"&"+T:""}`,j=await fetch(A,k);if(!j.ok){let Q=await j.json().catch(()=>null);c({code:((g=Q==null?void 0:Q.error)==null?void 0:g.code)||"http_error",message:((S=Q==null?void 0:Q.error)==null?void 0:S.message)||`Server error (${j.status})`});return}let O=j.body.getReader(),X=new TextDecoder,K="";for(;;){let{done:Q,value:pe}=await O.read();if(Q)break;K+=X.decode(pe,{stream:!0});let b=K.split(`

`);K=b.pop();for(let P of b)q(P)}if(K.trim()&&q(K),!m){let Q=f;Q?(o("Waiting for server to finish..."),await An(Q,{onDone:r,onError:c,onFile:a,onStatus:o})):(h>0||w>0)&&r({files_modified:[],message:"",soft_close:!0})}}catch(k){if(k.name==="AbortError"){r({cancelled:!0,message:"Generation stopped."});return}if(h>0||w>0){let C=f;C?(o("Server is still generating \u2014 waiting for completion..."),await An(C,{onDone:r,onError:c,onFile:a,onStatus:o})):r({files_modified:[],message:"",soft_close:!0})}else c({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function An(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var r;let a=0;for(let l=0;l<120;l++){await new Promise(p=>setTimeout(p,3e3));try{let{ok:p,data:c}=await B.get(`/ai/conversations/${e}`);if(!p||!((r=c==null?void 0:c.conversation)!=null&&r.prompts))continue;let v=c.conversation.prompts,d=v[v.length-1];if(!d)continue;let u=d.files_modified?JSON.parse(d.files_modified):[];if(u.length>a){for(let m=a;m<u.length;m++)n({path:u[m],action:"write"});a=u.length}if(d.status==="streaming"){let m=Math.round((Date.now()-new Date(d.created_at).getTime())/1e3);o(`Server is still generating... (${m}s)`);continue}d.status==="success"?t({message:d.ai_message||"",files_modified:u,revision_id:d.revision_id||null,polled:!0}):d.status==="partial"?t({message:d.ai_message||"",files_modified:u,partial:!0,polled:!0}):s({code:"generation_failed",message:d.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function Pn(){return H.get("sessionToken")}var ni="data-theme",Ys="dark";function jn(){let e=H.get("theme")||localStorage.getItem("vs-theme")||Ys;return Rn(e),e}function Rn(e){let t=e||Ys;return document.documentElement.setAttribute(ni,t),localStorage.setItem("vs-theme",t),H.set("theme",t),t}function ks(){let e=H.get("theme")||Ys;return Rn(e==="dark"?"light":"dark")}var Hn=typeof document<"u"?document.createElement("span"):null;function x(e){return e?(Hn.textContent=e,Hn.innerHTML):""}function re(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var oi={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function Yt(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(oi))if(t.endsWith(s))return n;return"plaintext"}function Js(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function Zs(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),r=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:r===1?"Yesterday":r<30?`${r} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function Jt(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function Zt(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function Xt(e,t=40){if(!e)return"";let s=e.replace(/^https?:\/\//,"").replace(/^www\./,"").replace(/\/+$/,"");return s.length>t&&(s=s.substring(0,t-1)+"\u2026"),s}function me(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function ge(e,t){let s=null;e.addEventListener("mousedown",n=>{s=n.target}),e.addEventListener("click",n=>{n.target===e&&s===e&&t(n)})}function fe({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var c,v;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let r=document.createElement("div");r.id="vs-confirm-overlay",r.className="vs-modal-overlay",r.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${x(e)}</h2>
          <p class="vs-modal-desc">${x(t)}</p>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">${x(n)}</button>
          <button id="vs-confirm-ok" class="vs-btn ${o?"vs-btn-danger":"vs-btn-primary"} vs-btn-sm" type="button">${x(s)}</button>
        </div>
      </div>
    `;let l=d=>{d.key==="Escape"&&(d.preventDefault(),p(!1))},p=d=>{document.removeEventListener("keydown",l),me(r),i(d)};document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible")),ge(r,()=>p(!1)),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>p(!1)),(v=document.getElementById("vs-confirm-ok"))==null||v.addEventListener("click",()=>p(!0)),document.addEventListener("keydown",l),setTimeout(()=>{var d;return(d=document.getElementById("vs-confirm-ok"))==null?void 0:d.focus()},220)})}function Xs({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:r="",inputPattern:l=""}){return new Promise(p=>{var w,f;let c=document.getElementById("vs-prompt-overlay");c&&c.remove();let v=document.createElement("div");v.id="vs-prompt-overlay",v.className="vs-modal-overlay";let d=l?` pattern="${x(l)}"`:"",u=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${x(n)}" style="resize: vertical;">${x(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${x(n)}" value="${x(o)}"${d}>`;v.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${x(e)}</h2>
          ${t?`<p class="vs-modal-desc">${x(t)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${x(s)}</label>`:""}
          ${u}
          ${r?`<p class="text-xs text-vs-text-ghost" style="margin-top: 6px;">${x(r)}</p>`:""}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${x(i)}</button>
        </div>
      </div>
    `;let m=g=>{me(v),p(g)};document.body.appendChild(v),requestAnimationFrame(()=>v.classList.add("is-visible"));let h=v.querySelector("#vs-prompt-input");setTimeout(()=>h==null?void 0:h.focus(),220),ge(v,()=>m(null)),(w=v.querySelector("#vs-prompt-cancel"))==null||w.addEventListener("click",()=>m(null)),(f=v.querySelector("#vs-prompt-ok"))==null||f.addEventListener("click",()=>{m(((h==null?void 0:h.value)||"").trim())}),h==null||h.addEventListener("keydown",g=>{a==="textarea"?g.key==="Enter"&&(g.metaKey||g.ctrlKey)&&(g.preventDefault(),m(((h==null?void 0:h.value)||"").trim())):g.key==="Enter"&&(g.preventDefault(),m(((h==null?void 0:h.value)||"").trim())),g.key==="Escape"&&(g.preventDefault(),m(null))})})}var Re=!1,Es=null,xt=[],Qs=!1,Dn=!1,ke={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function rn(){Re=!Re,Xn(),oe({type:"vx-editor:toggle",active:Re}),Re||(Oe(),dn(),Ve(),kt(),Es=null,Lt=!1)}function Qt(){return Re}function es(){Re&&(Re=!1,Xn(),oe({type:"vx-editor:toggle",active:!1}),Oe(),dn(),Ve(),kt(),Es=null,Lt=!1)}function Un(){if(Dn)return;Dn=!0,window.addEventListener("message",ii);let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{Lt&&Vn(),Re&&setTimeout(()=>oe({type:"vx-editor:toggle",active:!0}),200)})}function ii(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":Es=e.data,pi(e.data);break;case"vx-editor:text-changed":on(e.data);break;case"vx-editor:image-changed":zi(e.data);break;case"vx-editor:element-deleted":an(e.data);break;case"vx-editor:deselect":Oe(),dn(),Ve(),Es=null;break;case"vx-editor:save-request":ts();break;case"vx-editor:editing-started":ai(e.data);break;case"vx-editor:editing-ended":Vn();break;case"vx-editor:selection-state":ri(e.data);break;case"vx-editor:element-rect":li(e.data);break;case"vx-editor:richtext-link-request":Yn();break;case"vx-editor:add-section-request":Ri(e.data);break;case"vx-editor:section-moved":Ui(e.data);break;case"vx-editor:bridge-ready":Re&&oe({type:"vx-editor:toggle",active:!0});break}}var Lt=!1,ln=!1,at=null,Pt={},tn="P";function ai(e){Lt=!0,ln=!!e.hasPhp,at=e.rect||null,Pt={},tn=e.tagName||"P",Oe(),di()}function Vn(){Lt=!1,ln=!1,at=null,Pt={},Kn()}function ri(e){if(Lt){if(e.elementRect&&(at=e.elementRect,Wn()),!e.hasSelection){Pt={},qn();return}Pt=e.formatting||{},tn=e.blockTag||tn,qn()}}function li(e){Lt&&e.rect&&(at=e.rect,Wn())}function Wn(){let e=document.getElementById("vx-richtext-toolbar");e&&Gn(e)}function di(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),Gn(e),ci(e),e.classList.add("vx-rt-visible")}function Gn(e){if(!at)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+at.left,o=s.top+at.top,i=at.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function ci(e){let t=Pt,s=ln;e.innerHTML=`<div class="vx-rt-actions">
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
  </div>`,e.querySelectorAll("[data-cmd]").forEach(i=>{i.addEventListener("click",a=>{a.stopPropagation();let r=i.dataset.cmd;if(r==="insertLink"){Yn();return}oe({type:"vx-editor:richtext-command",command:r})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",i=>{i.stopPropagation(),oe({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",i=>{i.stopPropagation(),oe({type:"vx-editor:save-edit"})})}function qn(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=Pt,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function Kn(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function dn(){Kn()}function Yn(){let e=prompt("Enter URL:");if(e!==null){let t=e.trim();oe(t?{type:"vx-editor:richtext-command",command:"insertLink",value:t}:{type:"vx-editor:richtext-command",command:"removeLink"})}}function pi(e){let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,hasImage:i}=e,a=document.getElementById("preview-iframe");if(!a)return;let r=a.getBoundingClientRect();t.style.left=`${r.left+n.left+n.width/2}px`,t.style.top=`${r.top+n.top-8}px`,t.style.transform="translate(-50%, -100%)";let l="";o&&(l+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      <span>Edit</span></button>`),i&&(l+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),l+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(l+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),l+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,l+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let p=Cs(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${p}</div><div class="vx-tb-actions">${l}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(c=>{c.addEventListener("click",v=>{v.stopPropagation(),vi(c.dataset.action,e)})})}function Oe(){let e=document.getElementById("vx-context-toolbar");e&&e.classList.remove("vx-tb-visible")}function Cs(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function vi(e,t){switch(e){case"edit-text":oe({type:"vx-editor:start-edit",mode:"text"}),Oe();break;case"swap-image":Di(t);break;case"edit-style":mi(t);break;case"edit-link":Ni(t);break;case"delete":ui(t);break;case"ask-ai":ji(t);break}}function ui(e){Oe();let t=Cs(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>n.remove(),200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),ge(n,o),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{oe({type:"vx-editor:delete-element"}),o()})}var Le=new Set,rt="",wt=null,Ls="text",Xe="padding",tt="all",Et="all",Qe="tl",$t="",lt=!1;function Ve({revertUnsaved:e=!0}={}){e&&lt&&rt&&(oe({type:"vx-editor:update-classes",classes:rt.split(" ").filter(Boolean),silent:!0}),Le=new Set(rt.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>t.remove(),200)),lt=!1,wt=null,Ls="text",Xe="padding",tt="all",Et="all",Qe="tl",$t=""}function mi(e){Oe(),Ve();let t=(e.classList||[]).filter(o=>o.trim());Le=new Set(t),rt=t.join(" "),lt=!1,wt=null,Ls=Gi(t),Xe="padding",tt="all",Et="all",Qe="tl",$t="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
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
      ${sn()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),$s(s),s.__vxOnResize=()=>$s(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=Zn(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),wt=null,_e(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>Ve()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),Ve())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{Le=new Set(rt.split(" ").filter(Boolean)),lt=!1,oe({type:"vx-editor:update-classes",classes:[...Le],silent:!0}),_e(nn())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>Pi(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&($t=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=sn(),_e(nn()))}),_e("typography")}function sn(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=$t===t.id,n=t.id?[...Le].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function nn(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function _e(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:gi,spacing:hi,colors:fi,layout:bi,borders:yi,effects:xi,classes:wi};t.innerHTML=(s[e]||s.classes)(),_i(t);let n=t.querySelector(".vx-cm-active");n&&n.scrollIntoView({block:"nearest"})}function gi(){let e=xe(/^font-(sans|serif|mono)$/)||"",t=xe(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=xe(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=xe(/^text-(left|center|right|justify)$/)||"text-left",o=xe(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=xe(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=xe(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",r=xe(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Ce("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${Ce("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,ke.sizes.map(l=>({label:l,value:`text-${l}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${Ce("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,ke.weights.map(l=>({label:l,value:`font-${l}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${ki(ke.aligns.map(l=>({value:`text-${l}`,label:l,icon:Mi(l)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${Ce("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,ke.leadings.map(l=>({label:l,value:`leading-${l}`})))}
        ${Ce("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,ke.trackings.map(l=>({label:l,value:`tracking-${l}`})))}
        ${Ce("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,ke.transforms.map(l=>({label:l,value:l})))}
        ${Ce("Decoration","^(no-underline|underline|line-through)$",r,ke.decorations.map(l=>({label:l,value:l})))}
      </div>
    </div>
  `}function hi(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[Xe]||(Xe="padding"),e[Xe].prefixes[tt]||(tt="all");let t=e[Xe],s=t.prefixes[tt],n=Ci(s),o=Si(s)||"",i=Xe==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${Jn(Object.keys(e).map(a=>({value:a,label:e[a].label})),Xe,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${tt===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Nn(a)}">
            ${Bi(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${Nn(tt)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${ke.compactSpacings.map(a=>{let r=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Ct(r)?" vx-sp-pill-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${Ct(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function fi(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=Ls||"text",s=t,n=Li(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${ke.specialColors.map(a=>{let r=`${s}-${a.name}`,l=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,p=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${Ct(r)?" vx-sp-dot-active":""}" data-set="${r}" data-pattern="${n}" style="${l}${p}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=["50","100","200","300","400","500","600","700","800","900","950"];return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-matrix">
      ${ke.colors.map(a=>`
        <div class="vx-cm-row" title="${a.name}">
          ${i.map(r=>{let l=`${s}-${a.name}-${r}`;return`<button class="vx-cm-cell${Ct(l)?" vx-cm-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false" style="background:${a.shades[r]}" title="${a.name}-${r}"></button>`}).join("")}
        </div>
      `).join("")}
    </div>
  </div>`,o}function bi(){let e=$i(),t=xe(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=xe(/^gap(?:-[xy])?-/)||"",a=xe(/^grid-cols-\d+$/)||"",r=xe(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${Ei(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${Ce("Direction","^flex-(row|col|row-reverse|col-reverse)$",xe(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${Ce("Justify","^justify-(start|center|end|between|around|evenly)$",xe(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${Ce("Align","^items-(start|center|end|stretch|baseline)$",xe(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${Ce("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...ke.gaps.map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${Ce("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...ke.gridCols.map(l=>({label:l,value:`grid-cols-${l}`}))])}
          ${Ce("Rows","^grid-rows-\\d+$",r,[{label:"Auto",value:""},...ke.gridRows.map(l=>({label:l,value:`grid-rows-${l}`}))])}
          ${Ce("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...ke.gaps.slice(1).map(l=>({label:l,value:`gap-${l}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${Ce("Position","^(static|relative|absolute|fixed|sticky)$",t,ke.positions.map(l=>({label:l,value:l})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${Ce("Top","^top-",xe(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",ke.coordinates.map(l=>({label:l,value:`top-${l}`})))}
          ${Ce("Right","^right-",xe(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",ke.coordinates.map(l=>({label:l,value:`right-${l}`})))}
          ${Ce("Bottom","^bottom-",xe(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",ke.coordinates.map(l=>({label:l,value:`bottom-${l}`})))}
          ${Ce("Left","^left-",xe(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",ke.coordinates.map(l=>({label:l,value:`left-${l}`})))}
        </div>
      </div>
    `:""}
  `}function yi(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=Et==="all"?"all":Qe;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${ke.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Ct(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${Ce("Style","^border-(solid|dashed|dotted|double|none)$",xe(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...ke.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${Jn([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],Et==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${Qe==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${Qe==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${Qe==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${Qe==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${Et==="all"?"ALL":Qe.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${ke.radii.map(s=>{let n=Ti(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${Ct(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${Ii(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function xi(){let e=Ai();return`
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
  `}function wi(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...Le].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function Ce(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${jt(o.value)}"${s===o.value?" selected":""}>${Rt(o.label)}</option>`).join("")}
    </select>
  </div>`}function Jn(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${Rt(i.label)}</button>`).join("")}
  </div>`}function ki(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${jt(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function Ei(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function $i(){let e=xe(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function Ci(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function Li(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function Si(e){let t=xe(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function Nn(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function Bi(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function Mi(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function Ti(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function Ii(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function Ai(){let e=xe(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function Ct(e){let t=$t;return Le.has(t?t+":"+e:e)}function en(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=$t,i=o?o+":":"",a=t?new RegExp(t):null,r=e?i+e:"",l=!!r&&Le.has(r);if(a)for(let c of[...Le])if(o){if(c.startsWith(i)){let v=c.slice(i.length);a.test(v)&&Le.delete(c)}}else!/^(sm|md|lg|xl|2xl):/.test(c)&&a.test(c)&&Le.delete(c);r&&(!s||!l)&&Le.add(r),lt=!0,oe({type:"vx-editor:update-classes",classes:[...Le],silent:!0});let p=document.getElementById("vx-sp-breakpoints");if(p&&(p.innerHTML=sn()),n){let c=document.querySelector(".vx-color-matrix"),v=c?c.scrollTop:0;if(_e(nn()),v){let d=document.querySelector(".vx-color-matrix");d&&(d.scrollTop=v)}}}function xe(e){let t=$t;for(let s of Le)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function _i(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";en(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";en(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{wt=wt===n.dataset.family?null:n.dataset.family,_e("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{wt=null,_e("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{Ls=n.dataset.cprop||"text",wt=null,_e("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Xe=n.dataset.spaceMode||"padding",tt="all",_e("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{tt=n.dataset.spaceSide||"all",_e("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{Et=n.dataset.radiusMode==="corners"?"corners":"all",_e("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{Qe=n.dataset.radiusCorner||"tl",Et="corners",_e("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");en(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>_e("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{Le.add(i)}),lt=!0,oe({type:"vx-editor:update-classes",classes:[...Le],silent:!0}),s.value="",_e("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;Le.delete(i),lt=!0,oe({type:"vx-editor:update-classes",classes:[...Le],silent:!0}),o.remove()}}})}async function Pi(e){let t=[...Le].join(" ");if(t===rt){Ve({revertUnsaved:!1});return}let s=new Set(rt.split(" ").filter(Boolean)),n=new Set(t.split(" ").filter(Boolean)),o=[...n].filter(a=>!s.has(a)),i=[...s].filter(a=>!n.has(a));xt.push({type:"class-change",filePath:e.filePath,originalHTML:`class="${rt}"`,newHTML:`class="${t}"`,additions:o,removals:i,timestamp:Date.now()}),lt=!1,Ve({revertUnsaved:!1}),ce("Saving & compiling\u2026"),await ts(),oe({type:"vx-editor:update-classes",classes:[...Le],silent:!0}),setTimeout(()=>{let a=document.getElementById("preview-iframe");a&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload","*")},500)}function Zn(e,t){let s=!1,n,o,i,a,r=!1,l=v=>{if(v.target.closest("button, input, select"))return;s=!0;let d=v.touches?v.touches[0]:v;n=d.clientX,o=d.clientY;let u=e.getBoundingClientRect();i=u.left,a=u.top,t.style.cursor="grabbing",v.preventDefault(),r||(r=!0,document.addEventListener("mousemove",p),document.addEventListener("touchmove",p,{passive:!1}),document.addEventListener("mouseup",c),document.addEventListener("touchend",c))},p=v=>{if(!s)return;let d=v.touches?v.touches[0]:v,u=12,m=e.getBoundingClientRect(),h=m.width||300,w=m.height||500,f=i+d.clientX-n,g=a+d.clientY-o,S=u,k=Math.max(u,window.innerWidth-h-u),C=52,T=Math.max(C,window.innerHeight-w-u),A=Math.min(Math.max(f,S),k),j=Math.min(Math.max(g,C),T);e.style.left=`${A}px`,e.style.top=`${j}px`,e.style.right="auto"},c=()=>{s&&(s=!1,t.style.cursor="",r&&(r=!1,document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c)))};return t.addEventListener("mousedown",l),t.addEventListener("touchstart",l,{passive:!1}),()=>{t.removeEventListener("mousedown",l),t.removeEventListener("touchstart",l),r&&(document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c))}}var et=null;function kt(){let e=document.getElementById("vx-ai-panel");e&&(et&&(et.abort(),et=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>e.remove(),180))}function ji(e){Oe(),Ve(),kt();let t=Cs(e.tagName,e.classList),s=(e.text||"").substring(0,80).replace(/\s+/g," ").trim(),n=document.createElement("div");n.id="vx-ai-panel",n.className="vx-ai-panel",n.tabIndex=-1,n.innerHTML=`
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
    </div>`,document.body.appendChild(n),$s(n),n.__vxOnResize=()=>$s(n),window.addEventListener("resize",n.__vxOnResize),requestAnimationFrame(()=>n.classList.add("vx-ai-visible")),n.__vxDestroyDrag=Zn(n,n.querySelector("#vx-ai-drag-handle"));let o=n.querySelector("#vx-ai-input"),i=n.querySelector("#vx-ai-send"),a=n.querySelector("#vx-ai-cancel-btn"),r=n.querySelector("#vx-ai-status"),l=n.querySelector("#vx-ai-status-text"),p=n.querySelector("#vx-ai-close");setTimeout(()=>o==null?void 0:o.focus(),200),p.addEventListener("click",()=>kt()),n.addEventListener("keydown",u=>{u.key==="Escape"&&(u.preventDefault(),kt())}),o.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),d())}),i.addEventListener("click",d),a.addEventListener("click",()=>{et&&(et.abort(),et=null),v()});function c(){o.disabled=!0,i.hidden=!0,a.hidden=!1,r.hidden=!1,l.textContent="Reading your site\u2026"}function v(){o.disabled=!1,i.hidden=!1,a.hidden=!0,r.hidden=!0,o.focus()}async function d(){let u=o.value.trim();if(!u)return;kt(),oe({type:"vx-editor:show-ai-overlay",status:"AI is editing\u2026"}),et=new AbortController;let m=e.outerHTML||"",h=e.filePath||ss();try{await yt("/ai/prompt",{user_prompt:u,action_type:"section_edit",page_scope:h,action_data:{path:h,sectionHtml:m.substring(0,15e3)}},{signal:et.signal,onStatus(w){oe({type:"vx-editor:update-ai-status",status:w||"Working\u2026"})},onFile(){oe({type:"vx-editor:update-ai-status",status:"Applying changes\u2026"})},onToken(){oe({type:"vx-editor:update-ai-status",status:"Generating\u2026"})},onError(w){oe({type:"vx-editor:hide-ai-overlay"}),ce(w.message||"AI edit failed",!0)},onDone(w){if(et=null,oe({type:"vx-editor:hide-ai-overlay"}),w.cancelled){ce("Generation cancelled",!1);return}(w.files_modified||[]).length>0?(ce("Section updated \u2713"),setTimeout(()=>{let g=document.getElementById("preview-iframe");g!=null&&g.contentWindow&&g.contentWindow.postMessage("voxelsite:reload","*")},400)):w.partial||ce("No changes made",!1)},onWarning(w){typeof window.showToast=="function"&&window.showToast(w,"warning")}})}catch(w){w.name!=="AbortError"&&ce("AI edit failed",!0),oe({type:"vx-editor:hide-ai-overlay"})}}}var zn=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function Ri(e){Oe(),Ve(),kt();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let f of zn)(t.includes(f.id)||t.includes(f.label.toLowerCase()))&&s.add(f.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
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
        ${zn.map(f=>{let g=s.has(f.id);return`
            <button class="vx-section-card${g?" vx-section-card-exists":""}" data-section-type="${f.id}" data-section-label="${jt(f.label)}" data-section-desc="${jt(f.description)}">
              <div class="vx-section-card-icon">${f.icon}</div>
              <div class="vx-section-card-label">${f.label}</div>
              <div class="vx-section-card-desc">${f.description}</div>
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>n.remove(),200)},a=f=>{f.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),ge(n,i),n.tabIndex=-1,n.focus();let r=null,l=null,p=n.querySelector("#vx-section-footer"),c=n.querySelector("#vx-section-footer-type"),v=n.querySelector("#vx-section-instruction"),d=n.querySelector("#vx-section-generate"),u=n.querySelector("#vx-section-change"),m=n.querySelector(".vx-section-picker-grid"),h={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(f=>{f.addEventListener("click",()=>{r=f.dataset.sectionLabel,l=f.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(g=>g.classList.remove("vx-section-card-selected")),f.classList.add("vx-section-card-selected"),c.textContent=r,v.placeholder=h[r]||"Optional: describe what you want\u2026",v.value="",p.hidden=!1,m.classList.add("vx-section-grid-collapsed"),setTimeout(()=>v.focus(),100)})}),u.addEventListener("click",()=>{r=null,l=null,p.hidden=!0,m.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(f=>f.classList.remove("vx-section-card-selected"))});let w=()=>{if(!r)return;let f=v.value.trim();i(),Hi(e,r,l,f)};d.addEventListener("click",w),v.addEventListener("keydown",f=>{f.key==="Enter"&&(f.preventDefault(),w())})}async function Hi(e,t,s,n=""){oe({type:"vx-editor:show-ai-overlay",status:`Adding ${t}\u2026`});let o=e.filePath||ss(),i=new AbortController,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let r=Date.now(),l=0,p=()=>{if(l>0){let u=l.toLocaleString();oe({type:"vx-editor:update-ai-status",status:`Generating ${t}\u2026 (${u} tokens)`})}else Math.round((Date.now()-r)/1e3)>=6&&oe({type:"vx-editor:update-ai-status",status:`Preparing ${t}\u2026`})},c=setInterval(p,1e3),v=0,d=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await yt("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onStatus(u){oe({type:"vx-editor:update-ai-status",status:u||`Adding ${t}\u2026`})},onFile(){oe({type:"vx-editor:update-ai-status",status:"Writing files\u2026"})},onToken(){l++;let u=Date.now();u-v>500&&(v=u,p())},onError(u){clearInterval(c),oe({type:"vx-editor:hide-ai-overlay"}),ce(u.message||"Failed to add section",!0)},onDone(u){if(clearInterval(c),oe({type:"vx-editor:hide-ai-overlay"}),u.cancelled){ce("Generation cancelled",!1);return}(u.files_modified||[]).length>0?(ce(`${t} added \u2713`),setTimeout(()=>{let h=document.getElementById("preview-iframe");h!=null&&h.contentWindow&&h.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{oe({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{oe({type:"vx-editor:scroll-to-section",sectionIndex:d}),oe({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):u.partial||ce("No changes made",!1)},onWarning(u){typeof window.showToast=="function"&&window.showToast(u,"warning")}})}catch(u){clearInterval(c),u.name!=="AbortError"&&ce("Failed to add section",!0),oe({type:"vx-editor:hide-ai-overlay"})}}function Di(e){Oe();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelector("[data-close]").addEventListener("click",s),ge(t,s),t.tabIndex=-1,t.focus(),qi(t)}async function qi(e){let t=e.querySelector("#vx-img-grid");try{let s=await B.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
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
  </div>`}}function Ni(e){Oe();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${jt(e.href||"")}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${jt(e.text||"")}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",s)),ge(t,s),document.getElementById("vx-link-save").addEventListener("click",()=>{oe({type:"vx-editor:update-link",href:document.getElementById("vx-link-href").value.trim(),text:document.getElementById("vx-link-text").value.trim()}),s()}),setTimeout(()=>{var o;return(o=document.getElementById("vx-link-href"))==null?void 0:o.focus()},100)}async function zi(e){let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||ss();try{let a=await B.get(`/files/content?path=${encodeURIComponent(i)}`);if(!a.ok){console.warn("[VX] Cannot read file for image save:",i),ce("Save failed",!0);return}let r=a.data.content,l=!1,p=`src="${s}"`;if(r.includes(p)&&(r=r.replace(p,`src="${n}"`),l=!0),!l&&r.includes(s)&&(r=r.replace(s,n),l=!0),!l&&o){let v=Fn(r,o,n);v!==!1&&(r=v,l=!0)}if(l){(await B.put("/files/content",{path:i,content:r})).ok?ce("Saved"):ce("Save failed",!0);return}let c=await B.get("/files");if(c.ok){let v=(c.data.files||[]).filter(d=>d.path.endsWith(".php")&&d.path!==i);for(let d of v){let u=await B.get(`/files/content?path=${encodeURIComponent(d.path)}`);if(!u.ok||!u.data.content)continue;let m=u.data.content;if(m.includes(p)&&(m=m.replace(p,`src="${n}"`),(await B.put("/files/content",{path:d.path,content:m})).ok)){ce(`Saved \u2192 ${d.path.split("/").pop()}`);return}if(m.includes(s)&&(m=m.replace(s,n),(await B.put("/files/content",{path:d.path,content:m})).ok)){ce(`Saved \u2192 ${d.path.split("/").pop()}`);return}if(o){let h=Fn(m,o,n);if(h!==!1&&(await B.put("/files/content",{path:d.path,content:h})).ok){ce(`Saved \u2192 ${d.path.split("/").pop()}`);return}}}}console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),ce("Save failed \u2014 source not found",!0)}catch(a){console.error("[VX] Image save error:",a),ce("Save failed",!0)}}function Fn(e,t,s){let n=e.split("<img");for(let o=1;o<n.length;o++){let i=n[o];if(!i.includes(`alt="${t}"`)&&!i.includes(`alt='${t}'`))continue;let a=i.indexOf("src=");if(a===-1)continue;let r=i[a+4];if(r!=='"'&&r!=="'")continue;let l=a+5,p=i.indexOf(r,l);if(p!==-1)return n[o]=i.substring(0,l)+s+i.substring(p),n.join("<img")}return!1}function on(e){xt.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,timestamp:Date.now()}),clearTimeout(on._timer),on._timer=setTimeout(()=>ts(),800)}function an(e){xt.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,timestamp:Date.now()}),clearTimeout(an._timer),an._timer=setTimeout(()=>ts(),300)}function Fi(e){let t=e.match(/class="([^"]*)"/);return t?t[1].split(/\s+/).filter(Boolean):[]}function Oi(e,t,s,n){let o=new Set(["is-visible","is-active","is-open","active","open","show","shown","visible","in","entered","transitioning"]),i=/class="([^"]*)"/g,a;for(;(a=i.exec(e))!==null;){let r=a[1].split(/\s+/).filter(Boolean);if(r.length===0||!r.every(m=>t.has(m))||![...t].filter(m=>!r.includes(m)).every(m=>o.has(m)||s.includes(m)||n.includes(m)))continue;let v=r.filter(m=>!n.includes(m));for(let m of s)!o.has(m)&&!v.includes(m)&&v.push(m);let d=a[0],u=`class="${v.join(" ")}"`;return e.substring(0,a.index)+u+e.substring(a.index+d.length)}return null}async function ts(){var t;if(Qs||xt.length===0)return;Qs=!0;let e=[...xt];xt=[];try{let s={};for(let i of e){let a=i.filePath||ss();s[a]||(s[a]=[]),s[a].push(i)}let n=!1,o={filesByMain:new Map,contentByPath:new Map};for(let[i,a]of Object.entries(s))try{let r=await B.get(`/files/content?path=${encodeURIComponent(i)}`);if(!r.ok){console.error("[VX] Cannot read:",i);continue}let l=r.data.content,p=!1;for(let c of a){let v=c.type==="delete"?c.outerHTML:c.originalHTML;if(v)if(l.includes(v))l=c.type==="delete"?l.replace(v,""):l.replace(v,c.newHTML),p=!0;else if(c.type==="class-change"&&c.additions){let d=new Set(Fi(v)),u=Oi(l,d,c.additions,c.removals);if(u)l=u,p=!0;else{if(await On(i,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",v.substring(0,80))}}else{if(await On(i,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",v.substring(0,80))}}if(p){let c=await B.put("/files/content",{path:i,content:l});c.ok?(ce("Saved"),(t=c.data)!=null&&t.tailwindCompiled&&(n=!0)):ce("Save failed",!0)}}catch(r){console.error("[VX] Save error:",r),ce("Save failed",!0)}n&&setTimeout(()=>{let i=document.getElementById("preview-iframe");i!=null&&i.contentWindow&&i.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{Qs=!1,xt.length>0&&setTimeout(()=>ts(),0)}}async function On(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let r=await B.get("/files");if(!r.ok)return!1;a=(r.data.files||[]).filter(l=>l.path.endsWith(".php")&&l.path!==e).filter(l=>o.some(p=>l.path.includes(p+"/"))||l.path.includes("partial")||l.path.includes("header")||l.path.includes("footer")||l.path.includes("nav")),i.filesByMain.set(e,a)}for(let r of a){let l=i.contentByPath.get(r.path);if(l==null){let p=await B.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!p.ok||!p.data.content)continue;l=p.data.content,i.contentByPath.set(r.path,l)}if(l.includes(n)){let p=t.type==="delete"?l.replace(n,""):l.replace(n,t.newHTML);if((await B.put("/files/content",{path:r.path,content:p})).ok)return i.contentByPath.set(r.path,p),ce(`Saved \u2192 ${r.path.split("/").pop()}`),!0}}}catch(a){console.error("[VX] Partial search error:",a)}return!1}async function Ui(e){var i;let{filePath:t,sectionIndex:s,neighborIndex:n}=e,o=t||ss();try{let a=await B.get(`/files/content?path=${encodeURIComponent(o)}`);if(!a.ok){ce("Could not read file",!0);return}let r=a.data.content,l=Vi(r);if(s>=l.length||n>=l.length){ce("Section not found in source. Try asking the AI to move it.",!0);return}let p=Wi(r,l,s,n);if(!p){ce("Could not swap sections in source",!0);return}let c=await B.put("/files/content",{path:o,content:p});c.ok?(ce("Section moved"),(i=c.data)!=null&&i.tailwindCompiled&&setTimeout(()=>{let v=document.getElementById("preview-iframe");v!=null&&v.contentWindow&&v.contentWindow.postMessage("voxelsite:reload-css","*")},300)):ce("Save failed",!0)}catch(a){console.error("[VX] Section move error:",a),ce("Section move failed",!0)}}function Vi(e){let t=[],s=/<section\b/gi,n;for(;(n=s.exec(e))!==null;){let o=n.index,a=e.substring(Math.max(0,o-500),o).match(/(<!--[\s\S]*?-->\s*)$/);a&&(o-=a[0].length);let r="</section>",l=1,p=n.index+n[0].length;for(;l>0&&p<e.length;){let c=e.indexOf("<section",p),v=e.indexOf(r,p);if(v===-1)break;if(c!==-1&&c<v){let d=e[c+8];(d===" "||d===">"||d===`
`||d==="\r"||d==="	"||d==="/")&&l++,p=c+9}else{if(l--,l===0){let d=v+r.length;t.push({start:o,end:d,content:e.substring(o,d)})}p=v+r.length}}}return t}function Wi(e,t,s,n){if(s===n)return e;let o=Math.min(s,n),i=Math.max(s,n),a=t[o],r=t[i];if(!a||!r||a.end>r.start)return null;let l=e.substring(0,a.start),p=e.substring(a.end,r.start),c=e.substring(r.end);return l+r.content+p+a.content+c}function Xn(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",Re),e.title=Re?"Exit visual editor (V)":"Enter visual editor (V)",e.setAttribute("aria-pressed",String(Re))),document.body.classList.toggle("vx-editing",Re)}function ce(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(ce._timer),ce._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function oe(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function ss(){return window.__vsCurrentPreviewPath||"index.php"}function $s(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),r=a.right-s-o,l=Math.max(o,a.left+10),p=Math.max(o,window.innerWidth-s-o),c=Math.min(Math.max(r,l),p),v=Math.max(a.top+12,i),d=Math.max(i,window.innerHeight-n-o),u=Math.min(v,d);e.style.left=`${c}px`,e.style.top=`${u}px`,e.style.right="auto"}function Gi(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function jt(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Rt(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var E={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',inbox:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',panelLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',palette:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>'};var Ki={success:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',error:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',warning:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'},Yi='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',Ji=["success","error","warning","info"];function Zi(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function Qn(e){e._dismissed||(e._dismissed=!0,e._autoTimer&&(clearTimeout(e._autoTimer),e._autoTimer=null),e.classList.add("vs-toast-exit"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>{e.parentNode&&e.remove()},250))}function M(e,t="success",s=3200){var a;if(!e)return;let n=Zi(),o=Ji.includes(t)?t:"success",i=document.createElement("div");i.className=`vs-toast vs-toast-${o}`,i.innerHTML=`
    <span class="vs-toast-icon">${Ki[o]}</span>
    <span class="vs-toast-message">${x(String(e))}</span>
    <button type="button" class="vs-toast-dismiss" aria-label="Dismiss">${Yi}</button>
    <div class="vs-toast-progress" style="animation-duration: ${s}ms;"></div>
  `,(a=i.querySelector(".vs-toast-dismiss"))==null||a.addEventListener("click",r=>{r.stopPropagation(),Qn(i)}),n.appendChild(i),i._autoTimer=setTimeout(()=>Qn(i),s)}window.showToast=M;var ns=null;function eo(){return`
    <div class="vs-editor-layout">
      <!-- File Tree Sidebar -->
      <div id="editor-sidebar" class="vs-editor-sidebar" style="position: relative; display: flex; flex-direction: column;">
        <div class="vs-editor-sidebar-header">
          <span class="vs-editor-sidebar-title">Explorer</span>
          <div style="display:flex;gap:2px;">
            <button id="editor-new-file" class="vs-btn vs-btn-ghost vs-btn-icon" title="New file" style="width:24px;height:24px;">
              ${E.filePlus}
            </button>
            <button id="editor-refresh-tree" class="vs-btn vs-btn-ghost vs-btn-icon" title="Refresh file list" style="width:24px;height:24px;">
              ${E.rotateCcw}
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
            <div id="editor-tab-bar" class="vs-editor-tabs" style="flex: 1; min-width: 0; scroll-behavior: auto;">
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
  `}async function to(){var _;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(y=>y.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(y=>y.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),r=document.getElementById("editor-host"),l=document.getElementById("editor-empty-state"),p=document.getElementById("editor-monaco-container"),c=document.getElementById("editor-file-info"),v=document.getElementById("editor-status"),d=document.getElementById("editor-save-btn"),u=document.getElementById("editor-refresh-tree"),m=document.getElementById("editor-new-file"),h=document.getElementById("editor-sidebar"),w=document.getElementById("editor-sidebar-resize"),f=document.getElementById("editor-font-size-select"),g=document.getElementById("editor-word-wrap-btn");f&&(f.value=t.fontSize);let S=()=>{g&&(t.wordWrap?(g.style.color="var(--vs-accent)",g.style.backgroundColor="var(--vs-accent-dim)"):(g.style.color="var(--vs-text-ghost)",g.style.backgroundColor="transparent"))};S();let k=(y,L="muted")=>{v&&(v.textContent=y,v.dataset.state=L)},C=y=>{let L=t.files.find(I=>I.path===y);return(L==null?void 0:L.readonly)===!0},T=y=>{let L=y.toLowerCase();return L.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':L.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':L.endsWith(".js")||L.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},A=(y,L="")=>{let I=[],R={},D=G=>{if(R[G])return R[G];let V=G.split("/"),ee=V[V.length-1],J=V.slice(0,-1).join("/"),te=L?L+G:G,ae={name:ee,path:te,type:"folder",children:[]};return R[G]=ae,J?D(J).children.push(ae):I.push(ae),ae};for(let G of y){let ee=(L&&G.path.startsWith(L)?G.path.substring(L.length):G.path).split("/");if(ee.length===1)I.push({name:ee[0],path:G.path,type:"file",meta:G});else{let J=ee.slice(0,-1).join("/");D(J).children.push({name:ee[ee.length-1],path:G.path,type:"file",meta:G})}}let Y=G=>{G.sort((V,ee)=>V.type!==ee.type?V.type==="folder"?-1:1:V.name.localeCompare(ee.name));for(let V of G)V.type==="folder"&&Y(V.children)};return Y(I),I},j=()=>{if(!n)return;let y=(Y,G=0)=>Y.map(V=>{var ne,Z;if(V.type==="folder"){let ve=t.expandedFolders.has(V.path);return`
            <div class="vs-tree-item" data-folder="${x(V.path)}" style="--tree-indent: ${G};">
              <span class="vs-tree-folder-toggle" data-expanded="${ve}">${E.chevronRight}</span>
              <span class="vs-tree-item-icon">${ve?E.folderOpen||E.folder:E.folder}</span>
              <span class="vs-tree-item-name">${x(V.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${x(V.path)}" data-collapsed="${!ve}">
              ${y(V.children,G+1)}
            </div>
          `}let ee=t.activeTab===V.path,J=t.openTabs.find(ve=>ve.path===V.path),te=J!=null&&J.dirty?" \u2022":"",$e=C(V.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",he=((ne=V.meta)==null?void 0:ne.custom)===!0,be=((Z=V.meta)==null?void 0:Z.protected)===!0,we="";return V.path==="assets/css/tailwind.css"?we=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:be?he&&(we=`
            <button class="vs-tree-item-restore" data-restore-file="${x(V.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):we=`
            <button class="vs-tree-item-delete" data-delete-file="${x(V.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${x(V.path)}" data-active="${ee}" style="--tree-indent: ${G};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${T(V.path)}</span>
            <span class="vs-tree-item-name">${x(V.name)}${$e}${te}</span>
            ${we}
          </div>
        `}).join(""),L=(Y,G,V)=>{let ee=V.querySelector(".vs-explorer-caret");t.expandedSections.has(Y)?(G.style.display="block",V.classList.add("is-expanded")):(G.style.display="none",V.classList.remove("is-expanded"))},I=document.querySelector('[data-section="site"]'),R=document.querySelector('[data-section="config"]'),D=document.querySelector('[data-section="prompts"]');I&&L("site",n,I),R&&o&&L("config",o,R),D&&i&&L("prompts",i,D),n.innerHTML=y(t.treeData.site),o&&(o.innerHTML=y(t.treeData.config)),i&&(i.innerHTML=y(t.treeData.prompts)),ot()},O=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(y=>{let L=y.path===t.activeTab,I=y.path.split("/").pop(),D=C(y.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${x(y.path)}" data-active="${L}" data-dirty="${y.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${x(I)}${D}</span>
          <button class="vs-editor-tab-close" data-close-tab="${x(y.path)}" title="Close">${E.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',ut(),Q()}},X=null,K=y=>{if(!a)return;let L=8,I=()=>{a.scrollLeft+=y==="left"?-L:L,Q()};I(),X=setInterval(I,16)},q=()=>{X&&(clearInterval(X),X=null)},Q=()=>{let y=document.getElementById("editor-tab-scroll-left"),L=document.getElementById("editor-tab-scroll-right");if(!a||!y||!L)return;let I=a.scrollLeft>0,R=a.scrollLeft<a.scrollWidth-a.clientWidth-1;y.style.display=I?"flex":"none",L.style.display=R?"flex":"none"};a&&(a.addEventListener("scroll",Q,{passive:!0}),window.addEventListener("resize",Q,{passive:!0}));let pe=document.getElementById("editor-tab-scroll-left"),b=document.getElementById("editor-tab-scroll-right");pe&&(pe.addEventListener("mousedown",()=>K("left")),pe.addEventListener("mouseup",q),pe.addEventListener("mouseleave",q)),b&&(b.addEventListener("mousedown",()=>K("right")),b.addEventListener("mouseup",q),b.addEventListener("mouseleave",q));let P=()=>{l&&(l.style.display="none"),p&&(p.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},z=async y=>{if(t.disposed)return;let L=t.openTabs.find(G=>G.path===y);if(L){await U(y);return}k("Loading\u2026");let{ok:I,data:R,error:D}=await B.get(`/files/content?path=${encodeURIComponent(y)}`);if(!I){M((D==null?void 0:D.message)||"Could not load file.","error"),k("Load failed","error");return}let Y=typeof(R==null?void 0:R.content)=="string"?R.content:"";L={path:y,baseline:Y,dirty:!1},t.openTabs.push(L),P(),await U(y),F(Y,y),k("Ready"),s()},U=async y=>{if(t.disposed)return;let L=t.openTabs.find(R=>R.path===t.activeTab);L&&t.monacoInstance&&(L._buffer=t.monacoInstance.getValue()),t.activeTab=y;let I=t.openTabs.find(R=>R.path===y);if(I&&t.monacoInstance){let R=I._buffer!==void 0?I._buffer:I.baseline;F(R,y)}ue(),Se(),O(),setTimeout(()=>{if(a){let R=a.querySelector('.vs-editor-tab[data-active="true"]');if(R){let D=R.getBoundingClientRect(),Y=a.getBoundingClientRect();D.left<Y.left?a.scrollBy({left:D.left-Y.left,behavior:"smooth"}):D.right>Y.right&&a.scrollBy({left:D.right-Y.right,behavior:"smooth"})}}},10),j(),s()},W=async y=>{let L=t.openTabs.find(R=>R.path===y);if(L!=null&&L.dirty&&!await fe({title:"Discard unsaved changes?",description:`"${y}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let I=t.openTabs.findIndex(R=>R.path===y);if(I!==-1){if(t.openTabs.splice(I,1),t.activeTab===y){let R=t.openTabs[Math.min(I,t.openTabs.length-1)];R?await U(R.path):(t.activeTab=null,de(),ue(),Se())}O(),j(),s()}},se=async y=>{var G,V;if((G=window.demoGuard)!=null&&G.call(window)||(V=window.viewerGuard)!=null&&V.call(window))return;let L=y.split("/").pop();if(!await fe({title:"Delete file?",description:`Are you sure you want to permanently delete "${L}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;k("Deleting\u2026");let{ok:R,error:D}=await B.delete(`/files?path=${encodeURIComponent(y)}`);if(!R){M((D==null?void 0:D.message)||"Could not delete file.","error"),k("Delete failed","error");return}let Y=t.openTabs.findIndex(ee=>ee.path===y);if(Y!==-1){if(t.openTabs.splice(Y,1),t.activeTab===y){let ee=t.openTabs[Math.min(Y,t.openTabs.length-1)];ee?await U(ee.path):(t.activeTab=null,de(),ue(),Se())}O()}await $(),s(),M(`Deleted ${L}`,"success"),k("Ready")},ie=async y=>{var G,V;if((G=window.demoGuard)!=null&&G.call(window)||(V=window.viewerGuard)!=null&&V.call(window))return;let L=y.split("/").pop();if(!await fe({title:"Reset system prompt?",description:`Are you sure you want to reset "${L}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;k("Resetting\u2026");let{ok:R,error:D}=await B.delete(`/files?path=${encodeURIComponent(y)}`);if(!R){M((D==null?void 0:D.message)||"Could not reset file.","error"),k("Reset failed","error");return}let Y=t.openTabs.findIndex(ee=>ee.path===y);if(Y!==-1){let{ok:ee,data:J}=await B.get(`/files/content?path=${encodeURIComponent(y)}`);if(ee&&typeof(J==null?void 0:J.content)=="string"){let te=t.openTabs[Y];te.baseline=J.content,te.dirty=!1,te._buffer=J.content,t.activeTab===y&&F(J.content,y)}}Se(),await $(),s(),M(`Reset ${L} to default`,"success"),k("Ready")},F=(y,L)=>{var R;if(!t.monacoInstance||!t.monaco)return;let I=t.monacoInstance.getModel();I&&(t.monacoInstance.setValue(y),t.monaco.editor.setModelLanguage(I,Yt(L)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((R=window.canWrite)!=null&&R.call(window))||C(L)}))},de=()=>{l&&(l.style.display=""),p&&(p.style.display="none")},ue=()=>{if(!c)return;if(!t.activeTab){c.textContent="No file open";return}let y=t.openTabs.find(D=>D.path===t.activeTab),L=t.files.find(D=>D.path===t.activeTab),I=L!=null&&L.size?`${(Number(L.size)/1024).toFixed(1)} KB`:"",R=Yt(t.activeTab).toUpperCase();c.textContent=[t.activeTab,R,I].filter(Boolean).join(" \u2022 ")},Se=()=>{var I;if(!d)return;let y=t.openTabs.find(R=>R.path===t.activeTab);if(t.activeTab?C(t.activeTab)||!((I=window.canWrite)!=null&&I.call(window)):!1){d.disabled=!0,d.textContent="Read-Only",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}if(!y||!y.dirty){d.disabled=!0,d.textContent="Saved",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}d.disabled=!1,d.textContent="Save",d.classList.remove("vs-btn-ghost"),d.classList.add("vs-btn-primary")},ze=()=>{let y=t.openTabs.find(R=>R.path===t.activeTab);if(!y||!t.monacoInstance)return;let L=t.monacoInstance.getValue(),I=y.dirty;y.dirty=L!==y.baseline,I!==y.dirty&&(Se(),O(),y.dirty?k("Unsaved changes","warning"):k("Ready"))},qe=async()=>{var Y,G,V,ee,J;if((Y=window.demoGuard)!=null&&Y.call(window)||(G=window.viewerGuard)!=null&&G.call(window))return;let y=t.openTabs.find(te=>te.path===t.activeTab);if(!y||!y.dirty||!t.monacoInstance)return;let L=t.monacoInstance.getValue();d.disabled=!0,d.textContent="Saving\u2026",k("Saving\u2026");let{ok:I,error:R}=await B.put("/files/content",{path:y.path,content:L});if(!I){d.disabled=!1,d.textContent="Save",M((R==null?void 0:R.message)||"Could not save file.","error"),k("Save failed","error");return}y.baseline=L,y.dirty=!1,y._buffer=L,Se(),O(),j(),k("Saved","success"),M(`Saved ${y.path}`,"success"),y.path.toLowerCase().endsWith(".css")?(V=window.sendPreviewMessage)==null||V.call(window,"voxelsite:reload-css"):(ee=window.sendPreviewMessage)==null||ee.call(window,"voxelsite:reload"),setTimeout(()=>{var te;return(te=window.refreshPreview)==null?void 0:te.call(window)},400),(J=window.refreshPublishState)==null||J.call(window,{silent:!0});let D=t.openTabs.find(te=>te.path==="assets/css/tailwind.css");D&&y.path!=="assets/css/tailwind.css"&&B.get("/files/content?path=assets/css/tailwind.css").then(({ok:te,data:ae})=>{te&&typeof(ae==null?void 0:ae.content)=="string"&&(D.baseline=ae.content,D._buffer=ae.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(ae.content))})},ot=()=>{let y=L=>{L&&(L.querySelectorAll("[data-file]").forEach(I=>{I.addEventListener("click",R=>{R.target.closest("[data-delete-file]")||z(I.dataset.file)})}),L.querySelectorAll("[data-delete-file]").forEach(I=>{I.addEventListener("click",R=>{R.stopPropagation(),se(I.dataset.deleteFile)})}),L.querySelectorAll("[data-restore-file]").forEach(I=>{I.addEventListener("click",R=>{R.stopPropagation(),ie(I.dataset.restoreFile)})}),L.querySelectorAll("[data-compile-tailwind]").forEach(I=>{I.addEventListener("click",async R=>{var te,ae;if(R.stopPropagation(),(te=window.demoGuard)!=null&&te.call(window)||(ae=window.viewerGuard)!=null&&ae.call(window))return;I.style.opacity="0.4",I.style.pointerEvents="none",k("Compiling Tailwind\u2026");let{ok:D,data:Y,error:G}=await B.post("/files/compile-tailwind");if(I.style.opacity="",I.style.pointerEvents="",!D){M((G==null?void 0:G.message)||"Tailwind compilation failed.","error"),k("Compile failed","error");return}let V="assets/css/tailwind.css",ee=t.openTabs.find($e=>$e.path===V);ee&&(ee.baseline=Y.content,ee.dirty=!1,t.activeTab===V&&t.monacoInstance&&t.monacoInstance.setValue(Y.content));let J=Y.class_count??0;M(`Tailwind CSS recompiled \u2014 ${J} utilities.`,"success"),k("Compiled")})}),L.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(I=>{I.addEventListener("click",R=>{R.stopPropagation();let Y=I.closest(".vs-tree-item").dataset.folder;t.expandedFolders.has(Y)?t.expandedFolders.delete(Y):t.expandedFolders.add(Y),s(),j()})}))};y(n),y(o),y(i),document.querySelectorAll(".vs-explorer-section-header").forEach(L=>{L.dataset.bound||(L.dataset.bound="true",L.addEventListener("click",()=>{let I=L.dataset.section;t.expandedSections.has(I)?t.expandedSections.delete(I):t.expandedSections.add(I),s(),j()}))})},ut=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(y=>{y.addEventListener("click",L=>{L.target.closest("[data-close-tab]")||U(y.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(y=>{y.addEventListener("click",L=>{L.stopPropagation(),W(y.dataset.closeTab)})}))};if(w&&h){let y=!1;w.addEventListener("mousedown",L=>{L.preventDefault(),y=!0,w.classList.add("is-dragging");let I=D=>{if(!y)return;let Y=Math.min(400,Math.max(200,D.clientX));h.style.width=Y+"px"},R=()=>{y=!1,w.classList.remove("is-dragging"),document.removeEventListener("mousemove",I),document.removeEventListener("mouseup",R)};document.addEventListener("mousemove",I),document.addEventListener("mouseup",R)})}d==null||d.addEventListener("click",qe),f==null||f.addEventListener("change",y=>{let L=parseInt(y.target.value,10);t.fontSize=L,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:L}),s()}),g==null||g.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,S(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),u==null||u.addEventListener("click",()=>$()),m==null||m.addEventListener("click",async()=>{var G,V,ee;if((G=window.demoGuard)!=null&&G.call(window)||(V=window.viewerGuard)!=null&&V.call(window))return;let y=await Xs({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!y||!y.trim())return;let L=y.trim(),I=(ee=L.split(".").pop())==null?void 0:ee.toLowerCase(),R=["php","css","js","json"];if(!I||!R.includes(I)){M(`Only ${R.join(", ")} files can be created.`,"warning");return}k("Creating\u2026");let{ok:D,error:Y}=await B.post("/files/create",{path:L});if(!D){M((Y==null?void 0:Y.message)||"Could not create file.","error"),k("Create failed","error");return}await $(),await z(L),M(`Created ${L}`,"success")});let mt=y=>{if(t.disposed){document.removeEventListener("keydown",mt);return}(y.metaKey||y.ctrlKey)&&y.key==="s"&&(y.preventDefault(),qe())};document.addEventListener("keydown",mt);let $=async()=>{var R;let{ok:y,data:L,error:I}=await B.get("/files");if(!y||!((R=L==null?void 0:L.files)!=null&&R.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=L.files,t.treeData={site:A(L.files.filter(D=>!D.path.startsWith("_prompts/")&&!D.path.startsWith("_root/"))),config:A(L.files.filter(D=>D.path.startsWith("_root/")),"_root/"),prompts:A(L.files.filter(D=>D.path.startsWith("_prompts/")),"_prompts/")},j()},N=async()=>{if(!p)return;let y;try{y=await so()}catch{M("Monaco editor is not available.","warning");return}t.monaco=y;let L=os();y.editor.setTheme(L);let I=y.editor.create(p,{value:"",language:"php",theme:L,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=I,I.onDidChangeModelContent(()=>ze()),I.addCommand(y.KeyMod.CtrlCmd|y.KeyCode.KeyK,async()=>{if(t.monacoInstance.getOption(y.editor.EditorOption.readOnly)){M("Cannot use inline AI on a read-only file.","warning");return}let R=t.activeTab;if(!R)return;let D=t.monacoInstance.getModel(),Y=t.monacoInstance.getSelection(),G=D.getValueInRange(Y);if(!G||G.trim()===""){let te=t.monacoInstance.getPosition(),ae=D.getLineContent(te.lineNumber);if(ae.trim()===""){M("Highlight a block of code to edit.","warning");return}G=ae,t.monacoInstance.setSelection(new y.Range(te.lineNumber,1,te.lineNumber,D.getLineMaxColumn(te.lineNumber)))}let V=await Xs({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!V)return;let ee=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let J=document.createElement("div");J.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",J.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${E.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,p&&(p.style.position="relative",p.appendChild(J)),k("AI is editing...","muted");try{await yt("/ai/prompt",{user_prompt:V,action_type:"inline_edit",action_data:{path:R,selection:G}},{onStatus:te=>{let ae=document.getElementById("ai-inline-status");ae&&(ae.textContent="Generating...")},onFile:()=>{let te=document.getElementById("ai-inline-status");te&&(te.textContent="Applying changes...")},onError:te=>{M(te.message||"Generation failed","error")},onDone:async te=>{var $e;if(($e=te.files_modified)==null?void 0:$e.some(he=>(typeof he=="string"?he:(he==null?void 0:he.path)||"").replace(/^\//,"")===R.replace(/^\//,""))){let{ok:he,data:be}=await B.get(`/files/content?path=${encodeURIComponent(R)}&_t=${Date.now()}`);if(he&&(be!=null&&be.content)){let we=be.content;await B.put("/files/content",{path:R,content:ee}),t.monacoInstance.getModel().setValue(we);let ne=t.openTabs.find(Z=>Z.path===R);ne&&(ne._buffer=we,ne.baseline=ee),ze(),M("Review changes and save.","success")}}else te.partial||M("Complete (No changes made to this file)","info")}})}finally{t.monacoInstance.updateOptions({readOnly:!1}),J.parentNode&&J.parentNode.removeChild(J),k("Ready","muted")}})};if(await Promise.all([$(),N()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:y,active:L}=t._pendingRestore;t._pendingRestore=null;for(let I of y){if(!t.files.some(Y=>Y.path===I))continue;let{ok:R,data:D}=await B.get(`/files/content?path=${encodeURIComponent(I)}`);R&&typeof(D==null?void 0:D.content)=="string"&&t.openTabs.push({path:I,baseline:D.content,dirty:!1})}if(t.openTabs.length>0){let I=L&&t.openTabs.find(R=>R.path===L)?L:t.openTabs[0].path;P(),await U(I),F(((_=t.openTabs.find(R=>R.path===I))==null?void 0:_.baseline)||"",I),k("Ready")}}}function os(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function so(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:ns||(ns=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,r){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw ns=null,t}),ns)}async function no(e=""){var X,K,q,Q,pe;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),r=s.querySelector("#vs-code-meta"),l=s.querySelector("#vs-code-status"),p=s.querySelector("#vs-code-editor-host"),c={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},v=(b,P="muted")=>{l&&(l.textContent=b,l.dataset.state=P)},d=()=>c.files.find(b=>b.path===c.path)||null,u=()=>!!c.editor&&c.editor.getValue()!==c.baseline,m=()=>{if(!r)return;let b=d();if(!b){r.textContent="No file selected";return}let P=b.size?`${(Number(b.size)/1024).toFixed(1)} KB`:"0 KB",z=b.modified?new Date(b.modified).toLocaleString():"Unknown date";r.textContent=`${b.path} \u2022 ${P} \u2022 ${z}`},h=window.IS_DEMO||!((X=window.canWrite)!=null&&X.call(window)),w=()=>{if(h)return!0;let b=d();return(b==null?void 0:b.readonly)===!0},f=()=>{if(!o)return;if(w()){o.disabled=!0,o.textContent="Read Only",v("Read-only mode","muted");return}let P=u();o.disabled=!P,o.textContent=P?"Save Changes":"Saved",P?v("Unsaved changes","warning"):c.path&&v("Saved","success")},g=async()=>{var b;c.closed||u()&&!await fe({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(c.closed=!0,(b=c.editorCleanup)!=null&&b.dispose&&(c.editorCleanup.dispose(),c.editorCleanup=null),c.editor&&(c.editor.dispose(),c.editor=null),me(s))},S=(b,P=null)=>{if(!c.editor)return;c.editor.setValue(b),c.baseline=b;let z=(P==null?void 0:P.language)||Yt(c.path);c.editor.setLanguage&&c.editor.setLanguage(z),c.editor.setReadOnly&&c.editor.setReadOnly(w()),m(),f()},k=async(b,{silent:P=!1}={})=>{if(!b||!c.editor)return!1;c.path=b,P||v("Loading file\u2026");let{ok:z,data:U,error:W}=await B.get(`/files/content?path=${encodeURIComponent(b)}`);if(!z)return M((W==null?void 0:W.message)||"Could not load file.","error"),v("Load failed","error"),!1;let se=typeof(U==null?void 0:U.content)=="string"?U.content:"";return S(se,(U==null?void 0:U.file)||d()),!0},C=async()=>u()?await fe({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,T=async b=>{if(!b||b===c.path)return;if(!await C()){n&&(n.value=c.path);return}await k(b)},A=async()=>{var U,W,se;if(!c.editor||!c.path||!o)return;let b=c.editor.getValue();if(b===c.baseline){f();return}o.disabled=!0,o.textContent="Saving\u2026",v("Saving\u2026");let{ok:P,error:z}=await B.put("/files/content",{path:c.path,content:b});if(!P){o.disabled=!1,o.textContent="Save Changes",M((z==null?void 0:z.message)||"Could not save file.","error"),v("Save failed","error");return}c.baseline=b,f(),v("Saved","success"),M(`Saved ${c.path}`,"success"),c.path.toLowerCase().endsWith(".css")?(U=window.sendPreviewMessage)==null||U.call(window,"voxelsite:reload-css"):(W=window.sendPreviewMessage)==null||W.call(window,"voxelsite:reload"),setTimeout(()=>{var ie;return(ie=window.refreshPreview)==null?void 0:ie.call(window)},400),(se=window.refreshPublishState)==null||se.call(window,{silent:!0})},j=b=>{b.key==="Escape"&&(b.preventDefault(),g())};a==null||a.addEventListener("click",()=>g()),i==null||i.addEventListener("click",async()=>{!c.path||!await C()||await k(c.path)}),o==null||o.addEventListener("click",()=>A()),n==null||n.addEventListener("change",b=>{T(b.target.value)}),s.addEventListener("click",b=>{b.target===s&&g()}),document.addEventListener("keydown",j);let O=()=>document.removeEventListener("keydown",j);s.addEventListener("transitionend",()=>{document.body.contains(s)||O()});try{let b=await B.get("/files");if(!b.ok||!((q=(K=b.data)==null?void 0:K.files)!=null&&q.length)){let W=((Q=b.error)==null?void 0:Q.message)||"No editable files found.";M(W,"error"),g();return}let P=b.data.files;c.files=P,n&&(n.innerHTML=P.map(W=>{let se=W.group?`${String(W.group).toUpperCase()} \xB7 `:"";return`<option value="${x(W.path)}">${x(se+W.path)}</option>`}).join(""));let z=((pe=P.find(W=>W.path===e))==null?void 0:pe.path)||P[0].path;c.path=z,n&&(n.value=z),p.innerHTML="";let U=null;try{U=await so()}catch{M("Monaco is not available yet. Using fallback editor.","warning"),v("Fallback editor active","warning")}if(U!=null&&U.editor){let W=os();U.editor.setTheme(W);let se=U.editor.create(p,{value:"",language:Yt(z),theme:W,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",readOnly:w(),fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});c.editor={getValue:()=>se.getValue(),setValue:ie=>se.setValue(ie),setLanguage:ie=>{let F=se.getModel();F&&U.editor.setModelLanguage(F,ie)},setReadOnly:ie=>se.updateOptions({readOnly:ie}),dispose:()=>se.dispose()},c.editorCleanup=se.onDidChangeModelContent(()=>{f()})}else{p.innerHTML=`<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"${w()?" readonly":""}></textarea>`;let W=p.querySelector("#vs-code-editor-fallback"),se=()=>f();W==null||W.addEventListener("input",se),c.editor={getValue:()=>(W==null?void 0:W.value)||"",setValue:ie=>{W&&(W.value=ie)},setLanguage:()=>{},setReadOnly:ie=>{W&&(W.readOnly=ie)},dispose:()=>{W==null||W.removeEventListener("input",se)}}}await k(z,{silent:!0}),v("Ready")}catch(b){M((b==null?void 0:b.message)||"Could not initialize code editor.","error"),g()}finally{let b=new MutationObserver(()=>{document.body.contains(s)||(O(),b.disconnect())});b.observe(document.body,{childList:!0,subtree:!0})}}function co(){return setTimeout(()=>dt(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function dt(){var b,P,z,U,W,se,ie;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,r]=await Promise.all([B.get("/settings"),B.get("/settings/system"),B.get("/settings/mail"),B.get("/settings/usage"),B.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),B.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),B.get("/settings/logs")]),l=((b=r.data)==null?void 0:b.logs)||[],p=((P=t.data)==null?void 0:P.settings)||{},c=((z=s.data)==null?void 0:z.system)||{},v=p.site_favicon||null,d=v?`/${v}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),u=null,m=null;try{i.ok&&((U=i.data)!=null&&U.content)&&(u=JSON.parse(i.data.content))}catch{}try{a.ok&&((W=a.data)!=null&&W.content)&&(m=JSON.parse(a.data.content))}catch{}let h=u||m,w=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},f=p.available_providers||{},g=((se=n.data)==null?void 0:se.config)||{},S=((ie=n.data)==null?void 0:ie.presets)||{},k=Object.keys(f),C=p.ai_provider||"claude",A=(f[C]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],j=p[`ai_${C}_model`]||"",O=p[`ai_${C}_api_key_set`]||!1,X=k.map(F=>{let de=f[F];return`<option value="${x(F)}" ${F===C?"selected":""}>${x(de.name)}</option>`}).join(""),K="";for(let F of A)F.key==="api_key"?K+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${x(F.label)}${F.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${O?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${x(F.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${O?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':F.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${x(F.help_text||"Optional for local servers")}</p>`}
          ${F.help_url?`<a href="${F.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${x(F.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:F.key==="base_url"&&(K+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${x(F.label)}${F.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${x(p.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${x(F.placeholder)}" />
          ${F.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${x(F.help_text)}</p>`:""}
        </div>`);e.innerHTML=`
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${x(p.site_name||"")}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${x(p.site_tagline||"")}"
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
            ${X}
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
                ${Object.entries(S).map(([F,de])=>`<option value="${x(F)}">${x(de.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${x(g.smtp_host||"")}"
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
              <input id="set-smtp-username" type="text" value="${x(g.smtp_username||"")}"
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
              <input id="set-mailpit-host" type="text" value="${x(g.mailpit_host||"localhost")}"
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
          <input id="set-mail-from-address" type="email" value="${x(g.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${x(g.from_name||"")}"
            class="vs-input"
            placeholder="Your Site Name" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender name on notification emails.</p>
        </div>

        <div class="border-t border-vs-border-subtle"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${x(p.user_email||"")}"
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

    ${h?`
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${u?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${E.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(u).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${E.chevronRight}</div>
        </button>
        `:""}
        ${m?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${E.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(m).length} design decisions</span>
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
      ${w.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${He("Total Requests",Number(w.totals.request_count).toLocaleString())}
          ${He("Input Tokens",Number(w.totals.total_input_tokens).toLocaleString())}
          ${He("Output Tokens",Number(w.totals.total_output_tokens).toLocaleString())}

        </div>
        ${w.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${w.models.map(F=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${He(F.ai_model||"Unknown",Number(F.request_count).toLocaleString()+" requests")}
                ${He("Tokens",Number(F.total_input_tokens).toLocaleString()+" in / "+Number(F.total_output_tokens).toLocaleString()+" out")}

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
        ${He("VoxelSite",c.version||"1.0.0")}
        ${He("PHP",c.php_version||"?")}
        ${He("SQLite",c.sqlite_version||"?")}
        ${He("Database",cn(c.database_size))}
        ${He("Preview Files",cn(c.preview_size))}
        ${He("Assets",cn(c.assets_size))}
        ${He("Upload Limit",c.max_upload||"?")}
        ${He("Memory Limit",c.memory_limit||"?")}
      </div>
    </div>

    <!-- Card: Update -->
    <div class="vs-settings-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Update</h2>
        <span class="vs-pill vs-pill-subtle">v${x(c.version||"1.0.0")}</span>
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
        ${l.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':l.map(F=>{let de=(F.size/1024).toFixed(1),ue=new Date(F.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${F.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${F.lines} lines \xB7 ${de} KB \xB7 ${ue}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(F.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${F.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
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
              placeholder="*">${x(p.agent_api_allowed_origins||"*")}</textarea>
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
  `,aa(p,f),ra(g,S),ta(),sa(),la(p),document.querySelectorAll(".btn-delete-log").forEach(F=>{F.addEventListener("click",async()=>{var Se;if((Se=window.demoGuard)!=null&&Se.call(window))return;if(F.dataset.confirm!=="true"){F.dataset.confirm="true",F.innerHTML='<span style="font-size: 11px;">Sure?</span>',F.style.color="var(--vs-error)",setTimeout(()=>{F.dataset.confirm==="true"&&(F.dataset.confirm="",F.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',F.style.color="")},3e3);return}let de=F.dataset.file,ue=F.closest(".vs-log-row");ue&&(ue.style.opacity="0.4"),await B.delete("/settings/logs",{file:de}),dt()})});let q=document.getElementById("btn-delete-all-logs");q&&q.addEventListener("click",async()=>{var F;if(!((F=window.demoGuard)!=null&&F.call(window))){if(q.dataset.confirm!=="true"){q.dataset.confirm="true",q.textContent="Sure?",q.style.color="var(--vs-error)",setTimeout(()=>{q.dataset.confirm==="true"&&(q.dataset.confirm="",q.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',q.style.color="")},3e3);return}q.disabled=!0,q.textContent="Deleting...",await B.delete("/settings/logs",{file:"*"}),dt()}});let Q=document.getElementById("btn-view-memory");Q&&u&&Q.addEventListener("click",()=>oo("Site Memory",u,"memory"));let pe=document.getElementById("btn-view-design");pe&&m&&pe.addEventListener("click",()=>oo("Design Intelligence",m,"design")),Qi(),ea(),ia(j)}function Xi(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function Qi(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;r();async function r(){var d;if(a)try{let{ok:u,data:m}=await B.get("/update/dist-packages");if(!u||!((d=m==null?void 0:m.packages)!=null&&d.length)){a.innerHTML="";return}let h=m.current_version||"0.0.0",w=m.packages.map(f=>{let g=(f.size/1024/1024).toFixed(1),S=Xi(f.version,h)>0,k=f.version===h,C=S?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':k?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${x(f.filename)}</strong>
                ${C}
              </div>
              <div class="vs-dist-pkg-meta">v${x(f.version)} \xB7 ${g} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${x(f.filename)}" data-version="${x(f.version)}">
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
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(f=>{f.addEventListener("click",()=>l(f.dataset.filename,f.dataset.version))})}catch{}}async function l(d,u){var h,w;if(!((h=window.demoGuard)!=null&&h.call(window)||!confirm(`Apply update from "${d}" (v${u})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${d}...`,a&&(a.innerHTML="");try{let{ok:f,data:g,error:S}=await B.post("/update/apply-local",{filename:d});s.classList.add("hidden"),n.classList.remove("hidden");let k=document.getElementById("vs-update-result-icon"),C=document.getElementById("vs-update-result-message");if(f){let T=g;k.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',C.innerHTML=`
          <div class="vs-update-result-title">${x(T.message)}</div>
          <div class="vs-update-result-meta">
            ${T.files_updated} files updated \xB7 ${T.files_skipped} preserved
            ${(w=T.errors)!=null&&w.length?` \xB7 ${T.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",(S==null?void 0:S.message)||"Unknown error")}catch(f){c("Update Failed",x(f.message||"Network error."))}}}e.addEventListener("click",d=>{var u;(u=window.demoGuard)!=null&&u.call(window)||d.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",d=>{d.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",d=>{var m,h,w;if(d.preventDefault(),e.classList.remove("is-dragover"),(m=window.demoGuard)!=null&&m.call(window))return;let u=(w=(h=d.dataTransfer)==null?void 0:h.files)==null?void 0:w[0];u&&u.name.endsWith(".zip")&&p(u)}),o.addEventListener("change",()=>{var u;let d=(u=o.files)==null?void 0:u[0];d&&p(d),o.value=""});async function p(d){var h,w;let u=document.querySelector(".vs-sys-grid");if(u){let f=u.querySelectorAll(".vs-sys-value"),g="";if(u.querySelectorAll(".vs-sys-label").forEach((S,k)=>{var C,T;S.textContent.trim()==="Upload Limit"&&(g=((T=(C=f[k])==null?void 0:C.textContent)==null?void 0:T.trim())||"")}),g){let S=v(g);if(S>0&&d.size>S){let k=(d.size/1024/1024).toFixed(1);c("File Too Large",`The update file is ${k} MB but your server's upload limit is ${g}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${k} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${d.name}" (${(d.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${d.name}...`;try{let f=new FormData;f.append("update_zip",d);let g=H.get("sessionToken"),S=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:g?{"X-VS-Token":g}:{},body:f}),k=S.headers.get("content-type")||"",C;if(!k.includes("application/json")){let j=await S.text();if(j.includes("POST Content-Length")||j.includes("upload_max_filesize")||j.includes("exceeds")){c("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}c("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}C=await S.json(),s.classList.add("hidden"),n.classList.remove("hidden");let T=document.getElementById("vs-update-result-icon"),A=document.getElementById("vs-update-result-message");if(C.ok){let j=C.data;T.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',A.innerHTML=`
          <div class="vs-update-result-title">${x(j.message)}</div>
          <div class="vs-update-result-meta">
            ${j.files_updated} files updated \xB7 ${j.files_skipped} preserved
            ${(h=j.errors)!=null&&h.length?` \xB7 ${j.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",((w=C.error)==null?void 0:w.message)||"Unknown error")}catch(f){let g=f.message||"Network error. Check your connection.";g.includes("Unexpected token")||g.includes("not valid JSON")?c("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):c("Upload Failed",x(g))}}}function c(d,u){s.classList.add("hidden"),n.classList.remove("hidden");let m=document.getElementById("vs-update-result-icon"),h=document.getElementById("vs-update-result-message");m.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',h.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${x(d)}</div>
      <div class="vs-update-result-meta">${u}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function v(d){let u=d.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!u)return 0;let m=parseFloat(u[1]),h=u[2].toUpperCase();return h==="GB"||h==="G"?m*1024*1024*1024:h==="MB"||h==="M"?m*1024*1024:h==="KB"||h==="K"?m*1024:0}}function ea(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var r,l,p;if(i.preventDefault(),e.classList.remove("is-dragover"),(r=window.demoGuard)!=null&&r.call(window))return;let a=(p=(l=i.dataTransfer)==null?void 0:l.files)==null?void 0:p[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,r;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let l=await B.delete("/settings/favicon");l.ok?(M("Favicon removed.","success"),dt()):M(((r=l.error)==null?void 0:r.message)||"Could not remove favicon.","error")}catch{M("Could not remove favicon.","error")}}});async function o(i){var c;if(i.size>524288){M("Favicon must be under 512 KB.","error");return}let r=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!r.includes(i.type)){M("Favicon must be a .ico file.","error");return}let p=document.getElementById("vs-favicon-preview");p&&(p.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let v=new FormData;v.append("favicon",i);let d=H.get("sessionToken"),m=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:d?{"X-VS-Token":d}:{},body:v})).json();m.ok?(M("Favicon updated.","success"),dt()):(M(((c=m.error)==null?void 0:c.message)||"Upload failed.","error"),dt())}catch{M("Upload failed. Check your connection.","error"),dt()}}}function oo(e,t,s){var l,p,c;(l=document.getElementById("vs-knowledge-overlay"))==null||l.remove();let n=v=>v.replace(/[_-]/g," ").replace(/\b\w/g,d=>d.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([v,d])=>{let u=typeof d=="object"?d.value||JSON.stringify(d):String(d),m=typeof d=="object"?d.confidence:null,h=m==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${x(n(v))}</div>
          <div class="vs-kv-value">
            <span>${x(u)}</span>
            ${m?`<span class="vs-kv-badge ${h}">${x(m)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(t).map(([v,d])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${x(n(v))}</div>
        <div class="vs-kv-section-body">${x(String(d))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?E.book:E.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${x(e)}</h2>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",r)},r=v=>{v.key==="Escape"&&a()};document.addEventListener("keydown",r),(p=i.querySelector("#vs-knowledge-close"))==null||p.addEventListener("click",a),(c=i.querySelector("#vs-knowledge-done"))==null||c.addEventListener("click",a),ge(i,a)}function ta(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||oa()})}function sa(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||na()})}function na(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-install-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let l=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()===a?io(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?io(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>me(t)),t.addEventListener("click",l=>{l.target===t&&me(t)});let r=l=>{l.key==="Escape"&&(me(t),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)}async function io(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await B.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let r=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=r,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function po(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function oa(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let r=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()==="RESET"?ao(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?ao(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>me(t)),t.addEventListener("click",r=>{r.target===t&&me(t)});let a=r=>{r.key==="Escape"&&(me(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function ao(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:r}=await B.post("/site/reset",{confirm:"RESET"});if(i){H.set("pages",[]),H.set("hasFormSchemas",!1),H.set("conversations",null),H.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{me(e),window.location.hash!=="#/chat"?je.navigate("chat"):je.refresh()},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let l=e.querySelector(".vs-modal-desc");if(l){let p=l.textContent;l.textContent=(r==null?void 0:r.message)||"Reset failed. Please try again.",l.style.color="var(--vs-error)",setTimeout(()=>{l.textContent=p,l.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function ia(e){var s;let t=document.getElementById("set-ai-model");if(t)try{let{ok:n,data:o}=await B.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?t.innerHTML=o.models.map(i=>`<option value="${x(i.id)}" ${i.id===e?"selected":""}>${x(i.name||i.id)}</option>`).join(""):t.innerHTML='<option value="">Test your connection to load available models</option>'}catch{t.innerHTML='<option value="">Test your connection to load available models</option>'}}function He(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function cn(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function aa(e,t){let s=e.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async v=>{var d;if((d=window.demoGuard)!=null&&d.call(window)){v.target.value=s;return}s=v.target.value,await B.put("/settings",{ai_provider:s}),dt()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var w,f,g,S,k;if((w=window.demoGuard)!=null&&w.call(window))return;let v=((f=i==null?void 0:i.value)==null?void 0:f.trim())||"",d=((S=(g=document.getElementById("set-base-url"))==null?void 0:g.value)==null?void 0:S.trim())||"";if(s!=="openai_compatible"&&(!v||v.startsWith("\u2022\u2022"))){vn("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:u,data:m,error:h}=await B.post("/settings/test-api",{provider:s,api_key:v.startsWith("\u2022\u2022")?"":v,base_url:d});if(o.textContent="Test Connection",o.disabled=!1,u){if(vn("\u2713 Connected successfully!","success"),(k=m==null?void 0:m.models)!=null&&k.length){let C=document.getElementById("set-ai-model");if(C){let T=e[`ai_${s}_model`]||"";C.innerHTML=m.models.map(A=>`<option value="${x(A.id)}" ${A.id===T?"selected":""}>${x(A.name||A.id)}</option>`).join("")}}}else vn("\u2717 "+((h==null?void 0:h.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),r=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var m,h,w,f,g;if((m=window.demoGuard)!=null&&m.call(window))return;a.textContent="Saving...",a.disabled=!0;let v={site_name:((w=(h=document.getElementById("set-site-name"))==null?void 0:h.value)==null?void 0:w.trim())||"",site_tagline:((g=(f=document.getElementById("set-site-tagline"))==null?void 0:f.value)==null?void 0:g.trim())||""},{ok:d,error:u}=await B.put("/settings",v);if(a.textContent="Save Identity",a.disabled=!1,r){if(r.classList.remove("hidden"),d){r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3",H.set("siteName",v.site_name),document.title=v.site_name?`Studio \u2014 ${v.site_name}`:"Studio \u2014 VoxelSite";let S=document.querySelector(".vs-logo-text");S&&(S.textContent=v.site_name||"VoxelSite")}else r.textContent="\u2717 "+((u==null?void 0:u.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3";setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3)}});let l=document.getElementById("btn-save-settings"),p=document.getElementById("save-status");l&&l.addEventListener("click",async()=>{var w,f,g,S,k;if((w=window.demoGuard)!=null&&w.call(window))return;l.textContent="Saving...",l.disabled=!0;let v={ai_provider:s,[`ai_${s}_model`]:((f=document.getElementById("set-ai-model"))==null?void 0:f.value)||"",ai_max_tokens:parseInt(((g=document.getElementById("set-max-tokens"))==null?void 0:g.value)||"32000",10),evaluator_enabled:(S=document.getElementById("set-evaluator-enabled"))!=null&&S.checked?1:0},d=document.getElementById("set-base-url");d&&(v.ai_openai_compatible_base_url=d.value.trim());let u=(k=i==null?void 0:i.value)==null?void 0:k.trim();u&&!u.startsWith("\u2022\u2022")&&(v[`ai_${s}_api_key`]=u);let{ok:m,error:h}=await B.put("/settings",v);l.textContent="Save Settings",l.disabled=!1,p&&(p.classList.remove("hidden"),m?(p.textContent="\u2713 Saved",p.className="text-xs text-vs-success ml-3"):(p.textContent="\u2717 "+((h==null?void 0:h.message)||"Failed to save."),p.className="text-xs text-vs-error ml-3"),setTimeout(()=>p==null?void 0:p.classList.add("hidden"),3e3))});let c=document.getElementById("set-evaluator-enabled");if(c){let v=c.closest("label")||c.parentElement,d=v==null?void 0:v.querySelector(".vs-toggle-track"),u=v==null?void 0:v.querySelector(".vs-toggle-thumb");c.addEventListener("change",()=>{d&&(d.style.background=c.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),u&&(u.style.left=c.checked?"18px":"2px")})}}function ra(e,t){var u;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function r(){if(!e.smtp_host)return"gmail";for(let[m,h]of Object.entries(t))if(h.host&&h.host===e.smtp_host)return m;return"custom"}if(i){let m=r();i.value=m,a&&((u=t[m])!=null&&u.help)&&(a.textContent=t[m].help)}s&&s.addEventListener("change",()=>{let m=s.value;n&&(n.style.display=m==="smtp"?"block":"none"),o&&(o.style.display=m==="mailpit"?"block":"none");let h=document.getElementById("mail-common-fields");h&&(h.style.display=m==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let m=t[i.value];if(!m)return;let h=document.getElementById("set-smtp-host"),w=document.getElementById("set-smtp-port"),f=document.getElementById("set-smtp-encryption");h&&(h.value=m.host||""),w&&(w.value=m.port||587),f&&(f.value=m.encryption||"tls"),a&&(a.textContent=m.help||"")});let l=document.getElementById("btn-toggle-smtp-pass"),p=document.getElementById("set-smtp-password");l&&p&&l.addEventListener("click",()=>{let m=p.type==="password";p.type=m?"text":"password",l.innerHTML=m?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let c=document.getElementById("btn-mail-test");c&&c.addEventListener("click",async()=>{var S,k,C;if((S=window.demoGuard)!=null&&S.call(window))return;let m=(C=(k=document.getElementById("set-mail-test-recipient"))==null?void 0:k.value)==null?void 0:C.trim();if(!m){pn("Enter an email address to send the test to.","warning");return}c.textContent="Sending...",c.disabled=!0;let h=ro();h.test_recipient=m;let{ok:w,data:f,error:g}=await B.post("/settings/mail/test",h);c.textContent="Send Test",c.disabled=!1,w?pn("\u2713 "+((f==null?void 0:f.message)||"Test email sent successfully!"),"success"):pn("\u2717 "+((g==null?void 0:g.message)||"Test failed."),"error")});let v=document.getElementById("btn-save-mail"),d=document.getElementById("save-mail-status");v&&v.addEventListener("click",async()=>{var f;if((f=window.demoGuard)!=null&&f.call(window))return;v.textContent="Saving...",v.disabled=!0;let m=ro(),{ok:h,error:w}=await B.post("/settings/mail",m);v.textContent="Save Email Settings",v.disabled=!1,d&&(d.classList.remove("hidden"),h?(d.textContent="\u2713 Saved",d.className="text-xs text-vs-success ml-3"):(d.textContent="\u2717 "+((w==null?void 0:w.message)||"Failed to save."),d.className="text-xs text-vs-error ml-3"),setTimeout(()=>d==null?void 0:d.classList.add("hidden"),3e3))})}function ro(){var t,s,n,o,i,a,r,l,p,c,v,d,u,m,h;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((l=(r=document.getElementById("set-smtp-host"))==null?void 0:r.value)==null?void 0:l.trim())||"",smtp_port:parseInt(((p=document.getElementById("set-smtp-port"))==null?void 0:p.value)||"587",10),smtp_username:((v=(c=document.getElementById("set-smtp-username"))==null?void 0:c.value)==null?void 0:v.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((d=document.getElementById("set-smtp-encryption"))==null?void 0:d.value)||"tls",mailpit_host:((m=(u=document.getElementById("set-mailpit-host"))==null?void 0:u.value)==null?void 0:m.trim())||"localhost",mailpit_port:parseInt(((h=document.getElementById("set-mailpit-port"))==null?void 0:h.value)||"1025",10)}}function pn(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function vn(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function la(e){let t=document.getElementById("set-api-enabled"),s=document.getElementById("api-access-body"),n=document.getElementById("btn-save-api-settings"),o=document.getElementById("btn-generate-api-key");t&&t.addEventListener("change",()=>{let i=t.checked,a=t.parentElement.querySelector(".vs-toggle-track"),r=t.parentElement.querySelector(".vs-toggle-thumb");a&&(a.style.background=i?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),r&&(r.style.left=i?"18px":"2px"),s&&(s.style.opacity=i?"":"0.4",s.style.pointerEvents=i?"":"none")}),n&&n.addEventListener("click",async()=>{var l,p,c,v,d;if((l=window.demoGuard)!=null&&l.call(window))return;let i=document.getElementById("save-api-status");n.disabled=!0,n.textContent="Saving...";let a={agent_api_enabled:((p=document.getElementById("set-api-enabled"))==null?void 0:p.checked)||!1,agent_api_allowed_origins:((v=(c=document.getElementById("set-api-origins"))==null?void 0:c.value)==null?void 0:v.trim())||"*"},r=await B.put("/settings",a);n.disabled=!1,n.textContent="Save API Settings",r.ok?(M("API settings saved","success"),i&&(i.textContent="Saved",i.className="text-xs text-vs-success",i.classList.remove("hidden"),setTimeout(()=>i.classList.add("hidden"),2e3))):M(((d=r.error)==null?void 0:d.message)||"Failed to save","error")}),un(),o&&o.addEventListener("click",()=>{var i;(i=window.demoGuard)!=null&&i.call(window)||ca()})}var lo={owner:["pages:read","pages:write","settings:read","settings:write","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],editor:["pages:read","pages:write","compile:trigger","submissions:read","assets:read","assets:write","tools:invoke"],agent:["pages:read","pages:write","settings:read","compile:trigger","publish:trigger","submissions:read","assets:read","assets:write","tools:invoke"],viewer:["pages:read","settings:read","submissions:read","assets:read"]},da={"prompt:execute":["owner","editor","agent"]};async function un(){var t;let e=document.getElementById("api-keys-list");if(e)try{let n=((t=(await B.get("/settings/api-keys")).data)==null?void 0:t.keys)||[];if(n.length===0){e.innerHTML=`
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
        ${n.map(o=>{let i=o.last_used_at?new Date(o.last_used_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",a=new Date(o.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),l={agent:"var(--vs-accent)",editor:"#3b82f6",viewer:"var(--vs-text-ghost)",owner:"#8b5cf6"}[o.role]||"var(--vs-text-ghost)",c=(Array.isArray(o.scopes)?o.scopes:typeof o.scopes=="string"?JSON.parse(o.scopes||"[]"):[]).includes("prompt:execute");return`
            <div class="vs-api-key-row" style="display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-lg); background: var(--vs-bg-base); transition: border-color 0.15s ease, box-shadow 0.2s ease;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: color-mix(in srgb, ${l} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${l} 18%, transparent);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${l}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.01em;">${x(o.label||"Unnamed")}</span>
                  <span style="font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: var(--radius-full); color: ${l}; background: color-mix(in srgb, ${l} 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, ${l} 20%, transparent); text-transform: capitalize;">${x(o.role||"agent")}</span>
                  ${c?'<span style="font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: var(--radius-full); color: var(--vs-accent); background: color-mix(in srgb, var(--vs-accent) 8%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, var(--vs-accent) 20%, transparent); letter-spacing: 0.5px;">AI</span>':""}
                </div>
                <div style="font-size: 11px; color: var(--vs-text-ghost); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <code style="font-size: 10px; font-family: var(--font-mono); background: var(--vs-bg-inset); padding: 1px 5px; border-radius: var(--radius-xs); border: 1px solid var(--vs-border-subtle);">${x(o.key_prefix||"???")}\u2026</code>
                  <span>Created ${a}</span>
                  <span>\xB7 Last used: ${i}</span>
                </div>
              </div>
              <button class="vs-btn vs-btn-ghost vs-btn-xs btn-revoke-key" data-id="${o.id}" style="color: var(--vs-text-ghost); white-space: nowrap; flex-shrink: 0;" title="Revoke">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Revoke
              </button>
            </div>`}).join("")}
      </div>`,e.querySelectorAll(".btn-revoke-key").forEach(o=>{o.addEventListener("click",async()=>{var r;if((r=window.demoGuard)!=null&&r.call(window))return;let i=o.dataset.id;if(o.dataset.confirm!=="true"){o.dataset.confirm="true",o.innerHTML='<span style="font-size: 11px; color: var(--vs-error);">Sure?</span>',setTimeout(()=>{o.dataset.confirm==="true"&&(o.dataset.confirm="",o.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Revoke')},3e3);return}let a=o.closest(".vs-api-key-row");a&&(a.style.opacity="0.4"),await B.delete(`/settings/api-keys/${i}`),M("API key revoked","success"),un()})})}catch{e.innerHTML='<div style="font-size: 12px; color: var(--vs-text-ghost); text-align: center; padding: 16px 0;">Could not load API keys.</div>'}}function ca(){let e=document.getElementById("generate-key-modal");e&&e.remove();let t=document.createElement("div");t.className="vs-modal-overlay",t.id="generate-key-modal",t.innerHTML=`
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
    </div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>me(t),n=d=>{d.key==="Escape"&&(d.preventDefault(),s())};document.addEventListener("keydown",n);let o=new MutationObserver(()=>{document.body.contains(t)||(document.removeEventListener("keydown",n),o.disconnect())});o.observe(document.body,{childList:!0}),ge(t,s),t.querySelector("#cancel-generate-key").addEventListener("click",s);let i=t.querySelector("#gen-key-label");i==null||i.addEventListener("keydown",d=>{var u;d.key==="Enter"&&(d.preventDefault(),(u=t.querySelector("#confirm-generate-key"))==null||u.click())});let a=t.querySelector("#gen-key-prompt-execute"),r=t.querySelector("#gen-key-prompt-toggle"),l=a,p=r==null?void 0:r.querySelector('span[style*="font-size: 11px"]'),c=d=>{(da["prompt:execute"]||[]).includes(d)?(l.disabled=!1,r.style.opacity="1",r.style.cursor="pointer",p&&(p.textContent="Allow this key to run AI prompts that can create pages, edit content, and modify your site. Requires exec() on the server.")):(l.checked=!1,l.disabled=!0,r.style.opacity="0.45",r.style.cursor="not-allowed",r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)",p&&(p.textContent="Not available for read-only roles. Prompt execution requires write access."))},v=t.querySelector("#gen-key-role");v==null||v.addEventListener("change",()=>c(v.value)),c((v==null?void 0:v.value)||"agent"),a==null||a.addEventListener("change",()=>{a.checked?(r.style.borderColor="color-mix(in srgb, var(--vs-accent) 40%, transparent)",r.style.background="color-mix(in srgb, var(--vs-accent) 4%, var(--vs-bg-base))"):(r.style.borderColor="var(--vs-border-subtle)",r.style.background="var(--vs-bg-base)")}),t.querySelector("#confirm-generate-key").addEventListener("click",async()=>{var g,S,k,C,T,A;let d=(S=(g=document.getElementById("gen-key-label"))==null?void 0:g.value)==null?void 0:S.trim(),u=((k=document.getElementById("gen-key-role"))==null?void 0:k.value)||"agent",m=(C=document.getElementById("gen-key-prompt-execute"))==null?void 0:C.checked;if(!d){M("Please enter a label for the key","error");return}let h=t.querySelector("#confirm-generate-key");h.disabled=!0,h.textContent="Generating\u2026";let w={label:d,role:u};m&&(w.scopes=[...lo[u]||lo.agent,"prompt:execute"]);let f=await B.post("/settings/api-keys",w);f.ok&&((T=f.data)!=null&&T.key)?(s(),pa(f.data.key,d),un()):(h.disabled=!1,h.textContent="Generate",M(((A=f.error)==null?void 0:A.message)||"Failed to generate key","error"))})}function pa(e,t){let s=document.getElementById("key-reveal-modal");s&&s.remove();let n=document.createElement("div");n.className="vs-modal-overlay",n.id="key-reveal-modal",n.innerHTML=`
    <div class="vs-modal" style="max-width: 640px;">
      <div class="vs-modal-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; background: color-mix(in srgb, #22c55e 10%, var(--vs-bg-surface)); border: 1px solid color-mix(in srgb, #22c55e 20%, transparent); flex-shrink: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <h3 class="vs-modal-title" style="margin: 0;">Key Generated</h3>
            <p class="vs-modal-desc" style="margin: 2px 0 0;">${x(t)}</p>
          </div>
        </div>
      </div>
      <div class="vs-modal-body">
        <div style="position: relative; margin-bottom: 16px;">
          <input type="text" readonly value="${x(e)}" id="revealed-key-input" class="vs-input" style="width: 100%; font-family: var(--font-mono); font-size: 12.5px; padding-right: 44px; letter-spacing: 0.01em; color: var(--vs-text-primary);" />
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("is-visible"));let o=()=>me(n),i=l=>{l.key==="Escape"&&(l.preventDefault(),o())};document.addEventListener("keydown",i);let a=new MutationObserver(()=>{document.body.contains(n)||(document.removeEventListener("keydown",i),a.disconnect())});a.observe(document.body,{childList:!0}),ge(n,o),n.querySelector("#close-key-reveal").addEventListener("click",o);let r=n.querySelector("#revealed-key-input");r==null||r.addEventListener("focus",()=>r.select()),n.querySelector("#copy-api-key").addEventListener("click",async()=>{let l=n.querySelector("#copy-api-key");try{await navigator.clipboard.writeText(e),l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',l.style.color="#22c55e",setTimeout(()=>{l.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',l.style.color=""},2e3)}catch{r==null||r.select()}})}var ct=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},St=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},mn={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},va={contact:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',newsletter:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',callback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',feedback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'};function uo(){return setTimeout(()=>ua(),0),`
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
  `}async function ua(){var a,r,l,p,c,v;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let d=await vo();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let k=function(C){let T=document.getElementById("bar-color-swatch"),A=document.getElementById("bar-brand-hex"),j=document.getElementById("bar-brand-color");T&&(T.style.background=C),A&&A!==document.activeElement&&(A.value=C),j&&(j.value=C),document.querySelectorAll(".bar-color-preset").forEach(O=>{O.style.borderColor=O.dataset.color.toLowerCase()===C.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:d,data:u}=await B.get("/agentic/actions/bar-settings"),m=d&&(u==null?void 0:u.settings)||{theme:"bottom-bar",visibility:"all-pages"},h=m.theme||"bottom-bar",w=m.visibility||"all-pages",f={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
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
      </svg>`},g={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},S={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(S).map(([C,T])=>`<option value="${C}" ${w===C?"selected":""}>${T}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(f).map(([C,T])=>{let A=C===h;return`
              <button type="button" class="bar-theme-option" data-theme="${C}" style="
                border: 2px solid ${A?"var(--vs-accent)":"var(--vs-border-subtle)"};
                background: ${A?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)"};
                border-radius: var(--radius-lg, 10px);
                padding: 14px 12px 10px;
                cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 8px;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.12s;
                color: ${A?"var(--vs-accent)":"var(--vs-text-ghost)"};
                position: relative;
                outline: none;
              "
                onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-medium)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}"
                onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-subtle)';this.style.transform='';this.style.boxShadow='';}"
              >
                <div style="width: 100%; max-width: 120px;">${T}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${A?"var(--vs-accent)":"var(--vs-text-secondary)"};">${g[C]}</span>
                ${A?`<div style="
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
              ${["light","dark"].map(C=>{let T=C===(m.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${C}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${T?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${T?"#fff":"var(--vs-text-secondary)"};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${{light:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',dark:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}[C]} ${C.charAt(0).toUpperCase()+C.slice(1)}</button>`}).join("")}
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
                ${["#EA580C","#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#374151"].map(C=>`
                  <button type="button" class="bar-color-preset" data-color="${C}" title="${C}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${C}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
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
    `,document.querySelectorAll(".bar-theme-option").forEach(C=>{C.addEventListener("click",async()=>{let T=C.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(j=>{let O=j.dataset.theme===T;j.style.borderColor=O?"var(--vs-accent)":"var(--vs-border-subtle)",j.style.background=O?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",j.style.color=O?"var(--vs-accent)":"var(--vs-text-ghost)",j.classList.toggle("active",O);let X=j.querySelector("span");X&&(X.style.color=O?"var(--vs-accent)":"var(--vs-text-secondary)");let K=j.querySelector('[style*="position: absolute"]');if(K&&!O&&K.remove(),O&&!j.querySelector('[style*="position: absolute"]')){let q=document.createElement("div");q.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",q.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',j.appendChild(q)}});let{ok:A}=await B.put("/agentic/actions/bar-settings",{theme:T});A&&(C.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>C.style.boxShadow="",400),M("Bar style updated","success"))})}),(r=document.getElementById("bar-visibility"))==null||r.addEventListener("change",async C=>{let{ok:T}=await B.put("/agentic/actions/bar-settings",{visibility:C.target.value});T&&M("Bar visibility updated","success")}),document.querySelectorAll(".bar-scheme-btn").forEach(C=>{C.addEventListener("click",async()=>{let T=C.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(j=>{let O=j.dataset.scheme===T;j.style.background=O?"var(--vs-accent)":"var(--vs-bg-surface)",j.style.color=O?"#fff":"var(--vs-text-secondary)"});let{ok:A}=await B.put("/agentic/actions/bar-settings",{color_scheme:T});A&&M("Color scheme updated","success")})}),(l=document.getElementById("bar-brand-color"))==null||l.addEventListener("input",C=>{k(C.target.value)}),(p=document.getElementById("bar-brand-color"))==null||p.addEventListener("change",async C=>{let{ok:T}=await B.put("/agentic/actions/bar-settings",{brand_color:C.target.value});T&&M("Brand color updated","success")}),(c=document.getElementById("bar-brand-hex"))==null||c.addEventListener("change",async C=>{let T=C.target.value.trim();if(T.startsWith("#")||(T="#"+T),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(T)){k(T);let{ok:A}=await B.put("/agentic/actions/bar-settings",{brand_color:T});A&&M("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach(C=>{C.addEventListener("click",async()=>{let T=C.dataset.color;k(T);let{ok:A}=await B.put("/agentic/actions/bar-settings",{brand_color:T});A&&M("Brand color updated","success")})}),k(m.brand_color||"#EA580C")}let{ok:s,data:n}=await B.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
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
    `,(v=document.getElementById("btn-empty-new-action"))==null||v.addEventListener("click",async()=>{let d=await vo();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((d,u)=>{let m=d.active,h=d._stats||d.stats||{},w=h.total||0,f=h.last_created_at?Jt(h.last_created_at):"\u2014",g={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},S=g[d.icon]||g.circle;return`
          <div class="vs-action-list-row vs-form-card" data-action-id="${x(d.id)}" style="cursor: pointer; transition: box-shadow 0.15s ease;">
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
              ${S}
            </div>
            <div class="vs-form-card-body">
              <div class="vs-form-card-name">${x(d.name||d.id)}</div>
              ${d.description?`<div class="vs-form-card-desc">${x(d.description)}</div>`:""}
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
                <span>${f}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `}).join("")}
    </div>
  `,document.querySelectorAll(".vs-action-list-row").forEach(d=>{d.addEventListener("click",u=>{if(u.target.closest(".vs-action-reorder"))return;let m=d.dataset.actionId;m&&(window.location.hash="#/actions/"+encodeURIComponent(m))})});async function i(){let d=document.querySelectorAll("#actions-list .vs-action-list-row"),u=Array.from(d).map(m=>m.dataset.actionId);await B.post("/agentic/actions/reorder",{order:u})}document.querySelectorAll(".action-move-up").forEach(d=>{d.addEventListener("click",async u=>{u.preventDefault(),u.stopPropagation();let m=d.closest(".vs-action-list-row"),h=m==null?void 0:m.previousElementSibling;h&&(m.parentNode.insertBefore(m,h),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(d=>{d.addEventListener("click",async u=>{u.preventDefault(),u.stopPropagation();let m=d.closest(".vs-action-list-row"),h=m==null?void 0:m.nextElementSibling;h&&(m.parentNode.insertBefore(h,m),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})})}async function vo(){return new Promise(async e=>{var r;let{ok:t,data:s}=await B.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
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
              <button class="vs-template-card" data-template-id="${x(l.id)}" style="
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 12px; border-radius: 10px;
                border: 1.5px solid var(--vs-border);
                background: var(--vs-bg-floating);
                cursor: pointer; transition: all 0.15s ease;
                text-align: center; gap: 6px;
              ">
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${va[l.id]||E.zap}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary);">${x(l.name)}</span>
                <span style="font-size: 11px; color: var(--vs-text-tertiary); line-height: 1.3;">${x(l.description||"")}</span>
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
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(l=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(l)},a=l=>{l.key==="Escape"&&(l.preventDefault(),i())};document.addEventListener("keydown",a),ge(o,i),(r=document.getElementById("close-new-action-modal"))==null||r.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(l=>{l.addEventListener("mouseenter",()=>{l.style.borderColor="var(--vs-accent)",l.style.background="var(--vs-bg-raised)"}),l.addEventListener("mouseleave",()=>{l.style.borderColor=(l.dataset.templateId==="blank","var(--vs-border)"),l.style.background=l.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),l.addEventListener("click",async()=>{var c,v;let p=l.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(d=>{d.style.pointerEvents="none",d.style.opacity="0.5"}),l.style.opacity="1",l.style.borderColor="var(--vs-accent)",p==="blank"){let d={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"email",type:"email",label:"Email",placeholder:"you@example.com",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:u,data:m}=await B.post("/agentic/actions",d);u&&(m!=null&&m.action)?(M("Action created","success"),i({ok:!0,actionId:m.action.id})):(M(((c=m==null?void 0:m.error)==null?void 0:c.message)||"Failed to create action","error"),i())}else{let{ok:d,data:u}=await B.post("/agentic/actions/from-template",{template_id:p});d&&(u!=null&&u.action)?(M(`${u.action.name} created`,"success"),i({ok:!0,actionId:u.action.id})):(M(((v=u==null?void 0:u.error)==null?void 0:v.message)||"Failed to create action","error"),i())}})})})}function mo(e){return setTimeout(()=>Ss(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function Ss(e){var p,c,v,d,u,m,h,w,f,g,S,k,C,T,A,j,O,X,K,q;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await B.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,r=i.stats||{},l=a.active;if(t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${x(a.name||e)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${x(a.name||e)}</h1>
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
        <span class="vs-form-stat-value" style="color: var(--vs-info)">${((p=r.by_status)==null?void 0:p.pending)||0}</span>
        <span class="vs-form-stat-label">Pending</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${((c=r.by_status)==null?void 0:c.confirmed)||0}</span>
        <span class="vs-form-stat-label">Confirmed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${((v=r.by_status)==null?void 0:v.completed)||0}</span>
        <span class="vs-form-stat-label">Completed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${r.today||0}</span>
        <span class="vs-form-stat-label">Today</span>
      </div>
    </div>
  `,s){let F=function($){let N=$.querySelector(".field-required");if(!N)return;let _=$.querySelectorAll("span")[0],y=$.querySelectorAll("span")[1],L=()=>{_.style.background=N.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",y.style.left=N.checked?"18px":"2px"};N.addEventListener("change",L)},ue=function($){return $.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},Se=function(){let $=document.querySelectorAll("#action-fields-builder .vs-field-row"),N=[],_=new Set;return $.forEach(y=>{var Y,G,V,ee;let L=((G=(Y=y.querySelector(".field-label"))==null?void 0:Y.value)==null?void 0:G.trim())||"",I=((V=y.querySelector(".field-type"))==null?void 0:V.value)||"text",R=((ee=y.querySelector(".field-required"))==null?void 0:ee.checked)||!1,D=L?ue(L):"";if(_.has(D)){let J=2;for(;_.has(D+"_"+J);)J++;D=D+"_"+J}if(_.add(D),D&&L){let J={name:D,type:I,label:L,required:R},te=y.dataset.placeholder;te&&(J.placeholder=te);let ae=y.dataset.default;ae&&(J.default_value=ae);let $e=y.dataset.description;$e&&(J.description=$e);let he=y.dataset.min;he!==""&&he!==void 0&&(J.min=Number(he));let be=y.dataset.max;be!==""&&be!==void 0&&(J.max=Number(be));let we=y.dataset.maxlength;we&&(J.max_length=Number(we));let Be=y.dataset.minlength;Be&&(J.min_length=Number(Be));let ne=y.dataset.options;if(ne)try{J.options=JSON.parse(ne)}catch{J.options=ne.split(",").map(ve=>ve.trim()).filter(Boolean)}if(I==="file"){let Z=y.dataset.allowedExtensions;if(Z)try{J.allowed_extensions=JSON.parse(Z)}catch{J.allowed_extensions=Z.split(",").map(ht=>ht.trim().toLowerCase()).filter(Boolean)}let ve=y.dataset.maxSizeMb;ve&&(J.max_size_mb=Number(ve))}I==="checkbox"&&y.dataset.checkedDefault==="true"&&(J.checked_default=!0),N.push(J)}}),N},qe=function($){var N,_;(N=$.querySelector(".field-move-up"))==null||N.addEventListener("click",()=>{let y=$.previousElementSibling;y&&($.parentNode.insertBefore($,y),$.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>$.style.boxShadow="",300))}),(_=$.querySelector(".field-move-down"))==null||_.addEventListener("click",()=>{let y=$.nextElementSibling;y&&($.parentNode.insertBefore(y,$),$.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>$.style.boxShadow="",300))})},ot=function($){$.addEventListener("click",async()=>{let N=$.closest(".vs-field-row");await fe({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&(N.style.opacity="0",N.style.transform="translateX(20px)",N.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>N.remove(),200))})},ut=function($){$&&$.addEventListener("click",()=>{var L,I,R;let N=$.closest(".vs-field-row");if(!N)return;let _=((L=N.querySelector(".field-type"))==null?void 0:L.value)||"text",y=((I=N.querySelector(".field-label"))==null?void 0:I.value)||((R=N.querySelector(".field-name"))==null?void 0:R.value)||"Field";mt(N,_,y)})},mt=function($,N,_){var ht,Pe,Ft,Ot,Mn;(ht=document.getElementById("vs-field-settings-modal"))==null||ht.remove();let y=$.dataset.placeholder||"",L=$.dataset.default||"",I=$.dataset.min||"",R=$.dataset.max||"",D=$.dataset.maxlength||"",Y=$.dataset.options||"[]",G=$.dataset.description||"",V=["text","email","tel","url","textarea"].includes(N),ee=N==="number",J=["text","email","tel","url","textarea"].includes(N),te=["select","radio","multiselect"].includes(N),ae=N==="multiselect",$e=N==="file",he=N==="checkbox",be="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",we="margin-bottom: 16px;",Be="";if(V&&(Be+=`<div style="${we}">
          <label style="${be}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${re(y)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),!$e&&!he&&(Be+=`<div style="${we}">
          <label style="${be}">Default Value</label>
          <input type="${ee?"number":"text"}" id="fs-default" class="vs-input" value="${re(L)}" placeholder="Pre-filled value" />
        </div>`),he&&(Be+=`<div style="${we}">
          <label style="${be}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked \u2014 defaults to field name if empty)</span></label>
          <input type="text" id="fs-default" class="vs-input" value="${re(L)}" placeholder="e.g. yes, true, 1" />
        </div>
        <div style="${we}">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="fs-checked-default" ${$.dataset.checkedDefault==="true"?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${$.dataset.checkedDefault==="true"?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span style="
                position: absolute; left: ${$.dataset.checkedDefault==="true"?"18px":"2px"}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <span style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary);">Selected by default</span>
          </label>
        </div>`),ee&&(Be+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${we}">
          <div>
            <label style="${be}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${re(I)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${be}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${re(R)}" placeholder="No limit" />
          </div>
        </div>`),J&&(Be+=`<div style="${we}">
          <label style="${be}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${re(D)}" placeholder="No limit" min="1" />
        </div>`),te){let ye;try{ye=JSON.parse(Y)}catch{ye=Y.split(",").map(Te=>Te.trim()).filter(Boolean)}let Me;if(ae){let Ee=($.dataset.default||"").split(",").map(Te=>Te.trim()).filter(Boolean);Me=ye.map(Te=>Ee.includes(Te)?"[x] "+Te:Te).join(`
`)}else Me=ye.join(`
`);Be+=`<div style="${we}">
          <label style="${be}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${ae?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${ae?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${x(Me)}</textarea>
        </div>`}if($e){let ye=$.dataset.allowedExtensions||"",Me=$.dataset.maxSizeMb||"10",Ee;try{Ee=ye?JSON.parse(ye):[]}catch{Ee=[]}let Te=Ee.join(", "),Ne=["pdf","doc","docx","xls","xlsx","csv","txt"],Ut=["jpg","jpeg","png","gif","webp"],Vt=["zip","rar"],hs=Ne.some(it=>Ee.includes(it)),fs=Ut.some(it=>Ee.includes(it)),bs=Vt.some(it=>Ee.includes(it));Be+=`<div style="${we}">
          <label style="${be}">Allowed File Types</label>
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
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${re(Te)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${we}">
          <label style="${be}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${re(Me)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`}Be+=`<div style="${we}">
        <label style="${be}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${re(G)}" placeholder="Optional description or instructions" />
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
                ${x(_)} Settings
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
      `,document.body.appendChild(ne),setTimeout(()=>{var ye;return(ye=ne.querySelector("input, textarea"))==null?void 0:ye.focus()},100),$e&&ne.querySelectorAll(".fs-ext-group").forEach(ye=>{ye.addEventListener("change",()=>{let Me=ne.querySelector("#fs-allowed-extensions");if(!Me)return;let Ee=Me.value.split(",").map(Ne=>Ne.trim().toLowerCase()).filter(Boolean),Te=JSON.parse(ye.dataset.exts||"[]");ye.checked?Te.forEach(Ne=>{Ee.includes(Ne)||Ee.push(Ne)}):Ee=Ee.filter(Ne=>!Te.includes(Ne)),Me.value=Ee.join(", ")})}),he){let ye=(Pe=ne.querySelector("#fs-checked-default"))==null?void 0:Pe.closest("label");if(ye){let Me=ne.querySelector("#fs-checked-default"),Ee=ye.querySelectorAll("span > span")[0],Te=ye.querySelectorAll("span > span")[1];Me==null||Me.addEventListener("change",()=>{Ee&&(Ee.style.background=Me.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),Te&&(Te.style.left=Me.checked?"18px":"2px")})}}let Z=()=>ne.remove(),ve=ne.querySelector("#fs-backdrop");ve&&ge(ve,Z),(Ft=ne.querySelector("#fs-close"))==null||Ft.addEventListener("click",Z),(Ot=ne.querySelector("#fs-cancel"))==null||Ot.addEventListener("click",Z);let gt=ye=>{ye.key==="Escape"&&(Z(),document.removeEventListener("keydown",gt))};document.addEventListener("keydown",gt),(Mn=ne.querySelector("#fs-save"))==null||Mn.addEventListener("click",()=>{var ye,Me,Ee,Te,Ne,Ut,Vt,hs,fs,bs;if(V&&($.dataset.placeholder=((ye=ne.querySelector("#fs-placeholder"))==null?void 0:ye.value)||""),$e||($.dataset.default=((Me=ne.querySelector("#fs-default"))==null?void 0:Me.value)||""),he&&($.dataset.checkedDefault=(Ee=ne.querySelector("#fs-checked-default"))!=null&&Ee.checked?"true":"false"),ee&&($.dataset.min=((Te=ne.querySelector("#fs-min"))==null?void 0:Te.value)||"",$.dataset.max=((Ne=ne.querySelector("#fs-max"))==null?void 0:Ne.value)||""),J&&($.dataset.maxlength=((Ut=ne.querySelector("#fs-maxlength"))==null?void 0:Ut.value)||""),te){let Wt=(((Vt=ne.querySelector("#fs-options"))==null?void 0:Vt.value)||"").split(/[\n]/).map(ft=>ft.trim()).filter(Boolean);if(ae){let ft=[],ys=[];Wt.forEach(Tn=>{let Os=Tn.match(/^\[x\]\s*(.+)$/i);Os?(ft.push(Os[1].trim()),ys.push(Os[1].trim())):ft.push(Tn)}),$.dataset.options=JSON.stringify(ft),$.dataset.default=ys.join(",")}else $.dataset.options=JSON.stringify(Wt)}if($e){let Wt=(((hs=ne.querySelector("#fs-allowed-extensions"))==null?void 0:hs.value)||"").split(",").map(ys=>ys.trim().toLowerCase()).filter(Boolean);$.dataset.allowedExtensions=Wt.length>0?JSON.stringify(Wt):"";let ft=((fs=ne.querySelector("#fs-max-size-mb"))==null?void 0:fs.value)||"10";$.dataset.maxSizeMb=String(Math.min(Math.max(parseInt(ft)||10,1),50))}$.dataset.description=((bs=ne.querySelector("#fs-description"))==null?void 0:bs.value)||"",$.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>$.style.boxShadow="",400),Z(),M("Field settings updated","success")})},Q="make_"+e.replace(/-/g,"_"),pe={number:"number",checkbox:"boolean",multiselect:"array"},b={},P=[];(a.fields||[]).forEach($=>{let _={type:pe[$.type]||"string"},y=$.label||$.name;$.require_future?_.description=y+" (must be in the future)":y&&(_.description=y),$.min!==void 0&&$.min!==""&&(_.minimum=$.min),$.max!==void 0&&$.max!==""&&(_.maximum=$.max),$.min_length&&(_.minLength=$.min_length),$.max_length&&(_.maxLength=$.max_length),$.options&&$.options.length>0&&($.type==="multiselect"?_.items={type:"string",enum:$.options}:_.enum=$.options),b[$.name]=_,$.required&&P.push($.name)});let z={name:Q,description:a.description||a.name,inputSchema:{type:"object",properties:b,required:P}},U=JSON.stringify(z,null,2),W=x(U),se=l?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">\u25CF Discoverable by agents</span>':'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">\u25CB Draft \u2014 not visible to agents</span>',ie=['<div style="margin-bottom: 16px;">','<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">','<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',`<code style="font-size:13px;font-weight:600;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">`+x(Q)+"</code>","</div>",'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">','<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'," /mcp.php","</span>",'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'," /actions/manifest.json","</span>",se,"</div>","</div>",'<div style="position: relative;">',`<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">`+W+"</code></pre>",`<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor='var(--vs-border)';this.style.color='var(--vs-text-secondary)';" onmouseleave="this.style.borderColor='var(--vs-border-subtle)';this.style.color='var(--vs-text-ghost)';">`+E.copy+"</button>","</div>",'<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',`This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site's MCP endpoint.<br>`,'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',"</p>"].join("");s.innerHTML=`
      <div class="vs-settings-card" style="margin-top: 16px;">
        <h2 class="vs-settings-card-title">Action</h2>
        <div class="flex flex-col gap-4">
          <div>
            <label for="action-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Name</label>
            <input type="text" id="action-name" class="vs-input" value="${x(a.name||"")}" />
          </div>
          <div>
            <label for="action-description" class="block text-sm font-medium text-vs-text-secondary mb-1">Description <span style="font-weight: 400; color: var(--vs-text-ghost);">\u2014 for your reference and AI agents, not shown to visitors</span></label>
            <input type="text" id="action-description" class="vs-input" value="${x(a.description||"")}" placeholder="e.g. Register for our quarterly workshops" />
          </div>

          <div style="border-top: 1px solid var(--vs-border-subtle); padding-top: 16px; margin-top: 4px;">
            <label style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary); margin-bottom: 4px; display: block;">Actions Bar</label>
            <p style="font-size: 12px; color: var(--vs-text-ghost); margin: 0 0 12px 0;">How this action appears on your website.</p>
            <div style="margin-bottom: 12px;">
              <label for="action-button-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Button Label</label>
              <input type="text" id="action-button-label" class="vs-input" value="${x(a.bar_button_label||"")}" placeholder="${re(a.name||"e.g. Register")}" />
              <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Short label for the bar button. Defaults to the action name.</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-vs-text-secondary mb-1">Icon</label>
              <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${[["calendar","Calendar"],["clock","Clock"],["utensils","Utensils"],["file-text","Document"],["list","List"],["shopping-bag","Shop"],["ticket","Ticket"],["message-square","Message"],["users","People"],["mail","Mail"],["star","Star"],["circle","Default"]].map(([$,N])=>`
                  <button type="button" class="vs-icon-pick" data-icon="${$}" title="${N}" style="
                    display: flex; align-items: center; justify-content: center;
                    width: 42px; height: 42px; border-radius: var(--radius-md);
                    border: 1.5px solid ${(a.icon||"circle")===$?"var(--vs-accent)":"var(--vs-border)"};
                    background: ${(a.icon||"circle")===$?"var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))":"var(--vs-bg-floating)"};
                    color: ${(a.icon||"circle")===$?"var(--vs-accent)":"var(--vs-text-ghost)"};
                    cursor: pointer; transition: all 0.15s ease;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',"shopping-bag":'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',circle:'<circle cx="12" cy="12" r="10"/>'}[$]}</svg></button>
                `).join("")}
              </div>
              <input type="hidden" id="action-icon" value="${x(a.icon||"circle")}" />
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
                    position: absolute; left: ${(f=(w=a.constraints)==null?void 0:w.uniqueness)!=null&&f.enabled?"2px":"18px"}; top: 2px;
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: left 0.2s ease;
                  "></span>
                </span>
                <span style="font-size: 13px; color: var(--vs-text-secondary);">Same email can submit multiple times</span>
              </label>
            </div>
            <div id="action-duplicate-msg-wrap" style="${(S=(g=a.constraints)==null?void 0:g.uniqueness)!=null&&S.enabled?"":"display: none;"}">
              <label for="action-duplicate-msg" class="block text-sm font-medium text-vs-text-secondary mb-1">Rejection message</label>
              <input type="text" id="action-duplicate-msg" class="vs-input" value="${x(((k=a.responses)==null?void 0:k.duplicate)||"")}"
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
          ${(a.fields||[]).map(($,N)=>`
            <div class="vs-field-row" data-field-idx="${N}"
              data-field-name="${re($.name||"")}"
              data-placeholder="${re($.placeholder||"")}"
              data-default="${re($.default_value||$.default||"")}"
              data-min="${$.min!==void 0?$.min:""}"
              data-max="${$.max!==void 0?$.max:""}"
              data-maxlength="${$.max_length||""}"
              data-minlength="${$.min_length||""}"
              data-options="${re(JSON.stringify($.options||[]))}"
              data-description="${re($.description||"")}"
              ${$.allowed_extensions?`data-allowed-extensions="${re(JSON.stringify($.allowed_extensions))}"`:""}
              ${$.max_size_mb?`data-max-size-mb="${$.max_size_mb}"`:""}
              ${$.checked_default?'data-checked-default="true"':""}
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
              <input type="text" class="vs-input field-label" value="${x($.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(_=>`<option value="${_}" ${$.type===_?"selected":""}>${_==="multiselect"?"multi-select":_}</option>`).join("")}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${$.required?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${$.required?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${$.required?"18px":"2px"}; top: 2px;
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
          ${ie}
        </div>
      </details>
    `,document.querySelectorAll(".field-required").forEach($=>{F($.closest("label"))});let de=document.getElementById("action-allow-duplicates");if(de){let $=de.closest("label"),N=$==null?void 0:$.querySelector(".vs-toggle-track"),_=$==null?void 0:$.querySelector(".vs-toggle-thumb");de.addEventListener("change",()=>{N&&(N.style.background=de.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),_&&(_.style.left=de.checked?"18px":"2px");let y=document.getElementById("action-duplicate-msg-wrap");y&&(y.style.display=de.checked?"none":"")})}document.querySelectorAll(".vs-icon-pick").forEach($=>{$.addEventListener("mouseenter",()=>{var N;$.dataset.icon!==((N=document.getElementById("action-icon"))==null?void 0:N.value)&&($.style.borderColor="var(--vs-accent)",$.style.color="var(--vs-text-secondary)")}),$.addEventListener("mouseleave",()=>{var N;$.dataset.icon!==((N=document.getElementById("action-icon"))==null?void 0:N.value)&&($.style.borderColor="var(--vs-border)",$.style.color="var(--vs-text-ghost)")}),$.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach(N=>{N.style.borderColor="var(--vs-border)",N.style.background="var(--vs-bg-floating)",N.style.color="var(--vs-text-ghost)"}),$.style.borderColor="var(--vs-accent)",$.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",$.style.color="var(--vs-accent)",document.getElementById("action-icon").value=$.dataset.icon})}),(C=document.getElementById("btn-save-action"))==null||C.addEventListener("click",async()=>{var I,R,D,Y,G,V,ee,J,te;if(ct()||St())return;let $={...a};if($.name=((I=document.getElementById("action-name"))==null?void 0:I.value)||a.name,$.bar_button_label=((R=document.getElementById("action-button-label"))==null?void 0:R.value)||"",$.description=((D=document.getElementById("action-description"))==null?void 0:D.value)||"",$.icon=((Y=document.getElementById("action-icon"))==null?void 0:Y.value)||"circle",((G=document.getElementById("action-allow-duplicates"))==null?void 0:G.checked)??!0)(V=$.constraints)!=null&&V.uniqueness&&($.constraints.uniqueness.enabled=!1);else{let ae=(a.fields||[]).filter(he=>he.type==="email").map(he=>he.name),$e=ae.length>0?ae:["email"];$.constraints={...$.constraints||{},uniqueness:{enabled:!0,fields:$e,scope_statuses:["confirmed","pending"]}}}let _=((ee=document.getElementById("action-duplicate-msg"))==null?void 0:ee.value)||"";_?$.responses={...$.responses||{},duplicate:_}:(J=$.responses)!=null&&J.duplicate&&delete $.responses.duplicate;let{ok:y,data:L}=await B.put(`/agentic/actions/${encodeURIComponent(e)}`,$);M(y?"Action saved":((te=L==null?void 0:L.error)==null?void 0:te.message)||"Failed to save",y?"success":"error"),y&&Ss(e)});async function ze(){var R;let $=document.querySelectorAll("#action-fields-builder .vs-field-row"),N=!1;if($.forEach(D=>{var G,V;((V=(G=D.querySelector(".field-label"))==null?void 0:G.value)==null?void 0:V.trim())||(N=!0,D.style.borderColor="var(--vs-error, #ef4444)",D.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{D.style.borderColor="var(--vs-border-subtle)",D.style.boxShadow=""},2e3))}),N){M("Every field needs a label","warning");return}let _=Se();if(_.length===0){M("At least one field is required","warning");return}let y={...a,fields:_},{ok:L,data:I}=await B.put(`/agentic/actions/${encodeURIComponent(e)}`,y);M(L?"Fields saved":((R=I==null?void 0:I.error)==null?void 0:R.message)||"Failed to save",L?"success":"error"),L&&Ss(e)}(T=document.getElementById("btn-save-fields"))==null||T.addEventListener("click",ze),(A=document.getElementById("btn-add-field"))==null||A.addEventListener("click",()=>{var y,L;let $=document.getElementById("action-fields-builder");if(!$)return;let N=document.createElement("div");N.className="vs-field-row",N.dataset.fieldName="",N.dataset.placeholder="",N.dataset.default="",N.dataset.min="",N.dataset.max="",N.dataset.maxlength="",N.dataset.options="",N.dataset.description="",N.style.cssText=`
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;let _='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';N.innerHTML=`
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
          ${_}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${E.trash}
        </button>
      `,$.appendChild(N),(y=N.querySelector(".field-label"))==null||y.focus(),F((L=N.querySelector(".field-required"))==null?void 0:L.closest("label")),qe(N),ot(N.querySelector(".field-delete")),ut(N.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(qe),document.querySelectorAll(".field-delete").forEach(ot),document.querySelectorAll(".field-settings").forEach(ut),(j=document.getElementById("btn-copy-schema"))==null||j.addEventListener("click",()=>{var N;let $=((N=document.getElementById("agent-schema-json"))==null?void 0:N.textContent)||"";navigator.clipboard.writeText($).then(()=>{M("Schema copied","success")}).catch(()=>{let _=document.createElement("textarea");_.value=$,_.style.position="fixed",_.style.opacity="0",document.body.appendChild(_),_.select(),document.execCommand("copy"),document.body.removeChild(_),M("Schema copied","success")})}),(O=document.getElementById("agent-preview-section"))==null||O.addEventListener("toggle",$=>{let N=$.target.querySelector(".agent-preview-chevron");N&&(N.style.transform=$.target.open?"rotate(180deg)":"rotate(0)")}),(X=document.getElementById("btn-toggle-active"))==null||X.addEventListener("click",async()=>{if(ct()||St())return;let $={...a,active:!l},{ok:N}=await B.put(`/agentic/actions/${encodeURIComponent(e)}`,$);N?(M($.active?"Action activated":"Action deactivated","success"),Ss(e)):M("Failed to update status","error")}),(K=document.getElementById("btn-duplicate-action"))==null||K.addEventListener("click",async()=>{var y;if(ct()||St()||!await fe({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:N,data:_}=await B.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});N&&(_!=null&&_.action)?(M(`"${_.action.name}" created`,"success"),window.location.hash=`#/actions/${_.action.id}`):M(((y=_==null?void 0:_.error)==null?void 0:y.message)||"Failed to duplicate","error")}),(q=document.getElementById("btn-delete-action"))==null||q.addEventListener("click",async()=>{if(ct()||St())return;if(await fe({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:N}=await B.delete(`/agentic/actions/${encodeURIComponent(e)}`);N?(M("Action deleted","success"),window.location.hash="#/actions"):M("Failed to delete action","error")}})}await Ht(e,1)}async function Ht(e,t=1){var m,h,w,f,g,S,k,C;let s=document.getElementById("action-records");if(!s)return;let n=((m=document.getElementById("action-filter-status"))==null?void 0:m.value)||"all",o=((h=document.getElementById("action-filter-search"))==null?void 0:h.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:r}=await B.get(i);if(!a||!r){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let l=r.records||[],p=r.total||0,c=r.per_page||20,v=Math.ceil(p/c);s.innerHTML=`
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
          <input type="text" id="action-filter-search" class="vs-input vs-input-compact" placeholder="Search records..." value="${x(o)}" style="min-width: 180px;" />
        </div>
        <div class="flex items-center gap-2">
          ${window.IS_DEMO?"":`<button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old records" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""}>
            ${E.trash} Purge Old
          </button>`}

          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${p===0?"No records to export":"Download records as CSV"}">
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
              ${l.map(T=>{let A=typeof T.data=="string"?JSON.parse(T.data):T.data,j=Object.fromEntries(Object.entries(A||{}).filter(([b])=>!b.startsWith("_"))),O=Object.values(j).filter(b=>typeof b=="string"&&b.length>0).slice(0,2).join(" \xB7 "),X=Object.values(j).filter(b=>b&&typeof b=="object"&&b.original_name).length,K=X>0?`<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${O?"6px":"0"};" title="${X} file${X>1?"s":""} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${X>1?'<span style="font-size: 10px;">'+X+"</span>":""}</span>`:"",q=O||(X>0?"":"\u2014"),Q=mn[T.status]||mn.pending,pe=T.source==="web"?"Website":T.source==="mcp"?"MCP":T.source==="api"?"API":T.source||"Website";return`
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${T.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${T.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${x(T.confirmation_code||"\u2014")}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${x(q)}</span>${K}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${T.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                        ${Object.entries(mn).map(([b,P])=>`<option value="${b}" ${T.status===b?"selected":""}>${P.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${pe}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${Jt(T.created_at)}</td>
                    ${window.IS_DEMO?'<td style="width: 32px;"></td>':`<td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${T.id}" title="Delete record" style="
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
                        ${Object.entries(j).map(([b,P])=>{if(P&&typeof P=="object"&&P.path&&P.original_name){let z=P.size<1024?P.size+" B":P.size<1048576?Math.round(P.size/1024)+" KB":(P.size/1048576).toFixed(1)+" MB";return`
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${x(b.replace(/_/g," "))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="/_studio/api/router.php?_path=/agentic/actions/${encodeURIComponent(e)}/records/${T.id}/files/${encodeURIComponent(b)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${x(P.original_name)} (${z})
                                </a>
                              </div>
                            `}return`
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${x(b.replace(/_/g," "))}</div>
                            <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${x(String(P||"\u2014"))}</div>
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
  `;let d=null,u=()=>Ht(e,1);(w=document.getElementById("action-filter-status"))==null||w.addEventListener("change",u),(f=document.getElementById("action-filter-search"))==null||f.addEventListener("input",()=>{clearTimeout(d),d=setTimeout(u,300)}),(g=document.getElementById("action-records-prev"))==null||g.addEventListener("click",T=>{let A=parseInt(T.currentTarget.dataset.page);A>=1&&Ht(e,A)}),(S=document.getElementById("action-records-next"))==null||S.addEventListener("click",T=>{let A=parseInt(T.currentTarget.dataset.page);A<=v&&Ht(e,A)}),s.querySelectorAll(".vs-record-toggle").forEach(T=>{T.addEventListener("click",()=>{let A=T.dataset.rid,j=s.querySelector(`.vs-record-detail[data-detail-for="${A}"]`);if(!j)return;let O=j.style.display!=="none";j.style.display=O?"none":"table-row",T.style.transform=O?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(T=>{T.addEventListener("change",async A=>{var K;if(ct()){T.value=((K=T.querySelector("[selected]"))==null?void 0:K.value)||"pending";return}if(St())return;let j=A.target.dataset.recordId,O=A.target.value,{ok:X}=await B.put(`/agentic/actions/${encodeURIComponent(e)}/records/${j}`,{status:O});M(X?"Status updated":"Failed to update",X?"success":"error")})}),(k=document.getElementById("btn-purge-records"))==null||k.addEventListener("click",async()=>{var X,K;if(ct()||St())return;let T=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],A=document.getElementById("vs-purge-overlay");A&&A.remove();let j=document.createElement("div");j.id="vs-purge-overlay",j.className="vs-modal-overlay",j.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Records</h2>
          <p class="vs-modal-desc">Remove records older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${T.map(q=>`<option value="${q.days}">${q.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(j),requestAnimationFrame(()=>j.classList.add("is-visible"));let O=()=>me(j);ge(j,O),(X=document.getElementById("vs-purge-cancel"))==null||X.addEventListener("click",O),(K=document.getElementById("vs-purge-ok"))==null||K.addEventListener("click",async()=>{var U;let q=document.getElementById("vs-purge-select"),Q=parseInt(q==null?void 0:q.value),pe=((U=q==null?void 0:q.selectedOptions[0])==null?void 0:U.textContent)||"";if(O(),await new Promise(W=>setTimeout(W,200)),!await fe({title:"Confirm Purge",description:`This will permanently delete all records "${pe.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:P,data:z}=await B.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:Q});P?(M(`${(z==null?void 0:z.purged)||0} record(s) purged`,"success"),Ht(e,1)):M("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(T=>{T.addEventListener("click",async()=>{if(ct()||St())return;let A=T.dataset.rid;if(!await fe({title:"Delete Record",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:O}=await B.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${A}`);O?(M("Record deleted","success"),Ht(e,t)):M("Failed to delete record","error")})}),(C=document.getElementById("btn-export-action-csv"))==null||C.addEventListener("click",async()=>{if(ct())return;let T=document.getElementById("btn-export-action-csv"),A=T.innerHTML;T.innerHTML=`${E.loader} Exporting...`,T.disabled=!0;try{let j=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!j.ok)throw new Error("Export failed");let O=await j.blob(),X=URL.createObjectURL(O),K=document.createElement("a");K.href=X,K.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(K),K.click(),K.remove(),URL.revokeObjectURL(X),M("CSV downloaded","success")}catch{M("Failed to export CSV","error")}T.innerHTML=A,T.disabled=!1})}var is=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},as=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Ue={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function ho(){return setTimeout(()=>ma(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function ma(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await B.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
        <a href="#/forms/${encodeURIComponent(o.id)}" class="vs-form-card" data-form-id="${x(o.id)}">
          <div class="vs-form-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/><path d="M8 13h3"/><path d="M8 17h6"/></svg>
          </div>
          <div class="vs-form-card-body">
            <div class="vs-form-card-name">${x(o.name)}</div>
            ${o.description?`<div class="vs-form-card-desc">${x(o.description)}</div>`:""}
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
  `}function fo(e){return setTimeout(()=>ga(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function ga(e){var d,u;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await B.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/forms" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Forms</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${x(i.name||e)}</span>
      </div>
      <h1 class="vs-page-title">${x(i.name||e)}</h1>
      ${i.description?`<p class="vs-page-subtitle">${x(i.description)}</p>`:""}
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
  `;let r=document.getElementById("form-filter-status"),l=document.getElementById("form-filter-source"),p=document.getElementById("form-filter-search"),c=null,v=()=>Bs(e,1);r==null||r.addEventListener("change",v),l==null||l.addEventListener("change",v),p==null||p.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(v,300)}),(d=document.getElementById("btn-export-csv"))==null||d.addEventListener("click",async()=>{let m=document.getElementById("btn-export-csv"),h=m.innerHTML;m.innerHTML=`${E.loader} Exporting...`,m.disabled=!0;try{let w=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!w.ok)throw new Error("Export failed");let f=await w.blob(),g=URL.createObjectURL(f),S=document.createElement("a");S.href=g,S.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(S),S.click(),S.remove(),URL.revokeObjectURL(g),M("CSV downloaded","success")}catch{M("Failed to export CSV","error")}m.innerHTML=h,m.disabled=!1}),(u=document.getElementById("btn-upgrade-to-action"))==null||u.addEventListener("click",async()=>{var g,S;if(is()||as())return;let m=(i.fields||[]).length;if(!await fe({title:"Upgrade to Agent Action",description:`This will create a new agent action with${m>0?` the ${m} field${m!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let w=document.getElementById("btn-upgrade-to-action"),f=w.innerHTML;w.innerHTML=`${E.loader} Converting...`,w.disabled=!0,w.style.opacity="0.6";try{let k={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},C=[],T=0;(i.fields||[]).forEach(q=>{let Q=k[q.type];if(!Q){T++;return}let pe={name:q.name,label:q.label||q.name,type:Q,required:q.required||!1};(Q==="select"||Q==="radio")&&q.options&&(pe.options=q.options),q.placeholder&&(pe.placeholder=q.placeholder),C.push(pe)}),T>0&&M(`${T} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let A=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),j=Date.now().toString(36).slice(-4),O={id:A+"-"+j,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:C,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:X,data:K}=await B.post("/agentic/actions",O);if(X&&(K!=null&&K.action))M(`"${K.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${K.action.id}`;else{let Q=(((g=K==null?void 0:K.error)==null?void 0:g.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":((S=K==null?void 0:K.error)==null?void 0:S.message)||"Failed to create action";M(Q,"error"),w.innerHTML=f,w.disabled=!1,w.style.opacity=""}}catch{M("Failed to convert form to action","error"),w.innerHTML=f,w.disabled=!1,w.style.opacity=""}}),await Bs(e,1)}async function Bs(e,t=1){var w,f,g;let s=document.getElementById("form-submissions");if(!s)return;let n=((w=document.getElementById("form-filter-status"))==null?void 0:w.value)||"all",o=((f=document.getElementById("form-filter-source"))==null?void 0:f.value)||"all",i=((g=document.getElementById("form-filter-search"))==null?void 0:g.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:r,data:l}=await B.get(a);if(!r||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let p=l.submissions||[],c=l.total||0,v=l.per_page||20,d=Math.ceil(c/v);if(!p.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:u}=await B.get(`/forms/${encodeURIComponent(e)}`),m=u==null?void 0:u.form,h={};m!=null&&m.fields&&m.fields.forEach(S=>{h[S.name]=S.label||S.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${p.map(S=>{let k=Ue[S.status]||Ue.new,C=Object.entries(S.data||{}).filter(([j])=>!j.startsWith("_")).slice(0,3).map(([j,O])=>{let X=h[j]||j,K=Array.isArray(O)?O.join(", "):String(O);return`<span class="vs-sub-field"><strong>${x(X)}:</strong> ${x(K.substring(0,80))}${K.length>80?"\u2026":""}</span>`}).join(""),T=Jt(S.created_at),A=S.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${S.id}" data-form-id="${x(e)}" style="border-left-color: ${k.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${k.bg}; color: ${k.text};">${k.label}</span>
                ${A?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${x(T)}</span>
            </div>
            <div class="vs-submission-preview">
              ${C||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${S.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${S.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
                ${Object.entries(Ue).map(([j,O])=>`<option value="${j}" ${S.status===j?"selected":""}>${O.label}</option>`).join("")}
              </select>
              ${window.IS_DEMO?"":`<button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${S.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>`}
            </div>
          </div>
        `}).join("")}
    </div>

    ${d>1?`
      <div class="vs-pagination">
        ${t>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t-1}" data-form-id="${x(e)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${t} of ${d} \xB7 ${c} submission${c!==1?"s":""}</span>
        ${t<d?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t+1}" data-form-id="${x(e)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${c} submission${c!==1?"s":""}</span>
      </div>
    `}
  `,ha(e,t)}function ha(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;go(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{var i;if(is()){s.value=s.dataset.originalValue||((i=s.querySelector("[selected]"))==null?void 0:i.value)||"new";return}if(as())return;let n=s.dataset.subId,{ok:o}=await B.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){M("Status updated","success");let a=s.closest(".vs-submission-card"),r=Ue[s.value];if(a&&r){a.style.borderLeftColor=r.text;let l=a.querySelector(".vs-status-pill");l&&(l.style.background=r.bg,l.style.color=r.text,l.textContent=r.label)}}else M("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{if(is()||as())return;let n=s.dataset.subId;if(!await fe({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await B.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(M("Submission deleted","success"),Bs(e,t)):M("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);Bs(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;go(e,o)})})}async function go(e,t){var v,d,u,m;(v=document.getElementById("submission-detail-overlay"))==null||v.remove();let{ok:s,data:n}=await B.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(h=>String(h.id)===String(t));if(!o){M("Submission not found","error");return}let{data:i}=await B.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,r={};if(a!=null&&a.fields&&a.fields.forEach(h=>{r[h.name]=h.label||h.name}),o.status==="new"&&!window.IS_DEMO){let{ok:h}=await B.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"});if(h){o.status="read";let w=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);w&&(w.value="read");let f=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(f){f.style.borderLeftColor=Ue.read.text;let g=f.querySelector(".vs-status-pill");g&&(g.style.background=Ue.read.bg,g.style.color=Ue.read.text,g.textContent="Read")}}}let l=Ue[o.status]||Ue.new,p=document.createElement("div");p.id="submission-detail-overlay",p.className="vs-slide-overlay",p.innerHTML=`
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
              <span class="text-sm text-vs-text-tertiary font-mono">${x(o.ip_address)}</span>
            </div>
          `:""}
          ${o.referrer?`
            <div class="vs-sub-detail-row">
              <span class="vs-sub-detail-label">Referrer</span>
              <span class="text-sm text-vs-text-tertiary" style="word-break: break-all;">${x(o.referrer)}</span>
            </div>
          `:""}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Submitted Data</h3>
        <div class="vs-sub-detail-fields">
          ${Object.entries(o.data||{}).filter(([h])=>!h.startsWith("_")).map(([h,w])=>{let f=r[h]||h,g=Array.isArray(w)?w.join(", "):String(w);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${x(f)}</div>
                <div class="vs-sub-detail-field-value">${x(g)}</div>
              </div>
            `}).join("")}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Internal Notes</h3>
        <textarea id="sub-detail-notes" class="vs-input" style="min-height: 80px; resize: vertical;" placeholder="${window.IS_DEMO?"Notes are read-only in demo mode.":"Add private notes about this submission..."}" ${window.IS_DEMO?"readonly":""}>${x(o.notes||"")}</textarea>
        ${window.IS_DEMO?"":'<button id="btn-save-sub-notes" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-top: 8px;">Save Notes</button>'}

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Change Status</h3>
        <select id="sub-detail-status" class="vs-input" ${window.IS_DEMO?'disabled title="Demo mode \u2014 read-only"':""}>
          ${Object.entries(Ue).map(([h,w])=>`<option value="${h}" ${o.status===h?"selected":""}>${w.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(p),requestAnimationFrame(()=>{requestAnimationFrame(()=>p.classList.add("is-visible"))});let c=()=>{p.classList.remove("is-visible"),setTimeout(()=>p.remove(),200)};ge(p,c),(d=document.getElementById("close-sub-detail"))==null||d.addEventListener("click",c),(u=document.getElementById("btn-save-sub-notes"))==null||u.addEventListener("click",async()=>{var f;if(is()||as())return;let h=((f=document.getElementById("sub-detail-notes"))==null?void 0:f.value)||"",{ok:w}=await B.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:h});M(w?"Notes saved":"Failed to save notes",w?"success":"error")}),(m=document.getElementById("sub-detail-status"))==null||m.addEventListener("change",async h=>{if(is()){h.target.value=o.status;return}if(as())return;let w=h.target.value,{ok:f}=await B.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:w});if(f){M("Status updated","success");let g=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);g&&(g.value=w);let S=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),k=Ue[w];if(S&&k){S.style.borderLeftColor=k.text;let C=S.querySelector(".vs-status-pill");C&&(C.style.background=k.bg,C.style.color=k.text,C.textContent=k.label)}}else M("Failed to update status","error")})}var gn=!1;function xo(){return gn=!1,setTimeout(()=>{ba(),fn()},0),`
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
  `}function wo(){return`
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
  `}function fa(e){let t=H.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",r=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${E.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${x(e.name)}" title="Reset password">
        ${E.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${x(e.name)}" title="Remove">
        ${E.trash}
      </button>
    </div>
  `;return`
    <div class="vs-team-row">
      <div class="vs-team-row-identity">
        <div class="vs-team-avatar ${i}">
          ${x(e.name).charAt(0).toUpperCase()}
        </div>
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); letter-spacing: -0.01em;">${x(e.name)}</span>
            ${s?'<span style="font-size: 10px; color: var(--vs-text-ghost);">you</span>':""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 1px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${x(e.email)}</div>
        </div>
      </div>
      <div>
        <span class="vs-role-badge ${o} vs-role-badge-clickable" data-role-info>${e.role}</span>
      </div>
      <div class="vs-team-row-meta">${a}</div>
      ${r}
    </div>
  `}async function fn(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await B.get("/team");if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${(n==null?void 0:n.message)||"Failed to load team members."}</div>`;return}let o=(s==null?void 0:s.members)||[];o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>fa(i)).join("")}function ba(){var t,s,n,o,i,a,r,l,p;if(gn)return;gn=!0,(t=document.getElementById("btn-add-member"))==null||t.addEventListener("click",()=>{yo()}),(s=document.getElementById("btn-show-roles"))==null||s.addEventListener("click",bo);let e=document.getElementById("team-list");e&&e.addEventListener("click",async c=>{let v=c.target;if(v.closest("[data-role-info]")){bo();return}let u=v.closest(".team-edit-btn");if(u){let w=u.dataset.id,{ok:f,data:g}=await B.get("/team");if(f){let S=g.members.find(k=>k.id==w);S&&yo(S)}return}let m=v.closest(".team-delete-btn");if(m){let w=m.dataset.id,f=m.dataset.name;if(!await fe({title:"Remove Team Member",description:`Remove ${f} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let{ok:S,error:k}=await B.delete(`/team/${w}`);S?(M(`${f} has been removed.`,"success"),await fn()):M((k==null?void 0:k.message)||"Failed to remove member.","error");return}let h=v.closest(".team-pw-btn");if(h){let w=h.dataset.id,f=h.dataset.name;xa(w,f);return}}),[["[data-team-modal-overlay]",Ms],["[data-team-pw-overlay]",Ts],["[data-team-roles-overlay]",hn]].forEach(([c,v])=>{let d=document.querySelector(c);if(!d)return;let u=null;d.addEventListener("mousedown",m=>{u=m.target}),d.addEventListener("click",m=>{m.target===d&&u===d&&v()})}),(n=document.getElementById("btn-team-cancel"))==null||n.addEventListener("click",Ms),(o=document.getElementById("btn-pw-cancel"))==null||o.addEventListener("click",Ts),(i=document.getElementById("btn-roles-close"))==null||i.addEventListener("click",hn),(a=document.getElementById("btn-generate-password"))==null||a.addEventListener("click",()=>{let c=document.getElementById("team-member-password");c&&(c.value=Zt())}),(r=document.getElementById("btn-pw-generate"))==null||r.addEventListener("click",()=>{let c=document.getElementById("team-new-password");c&&(c.value=Zt())}),(l=document.getElementById("btn-team-save"))==null||l.addEventListener("click",wa),(p=document.getElementById("btn-pw-save"))==null||p.addEventListener("click",ka),document.addEventListener("keydown",ya)}function ya(e){if(e.key!=="Escape")return;let t=document.getElementById("team-modal"),s=document.getElementById("team-pw-modal"),n=document.getElementById("team-roles-modal");n&&!n.classList.contains("hidden")?(hn(),e.stopPropagation()):s&&!s.classList.contains("hidden")?(Ts(),e.stopPropagation()):t&&!t.classList.contains("hidden")&&(Ms(),e.stopPropagation())}function bo(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden")}function hn(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden")}function yo(e=null){let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");t&&(document.getElementById("team-member-name").value=(e==null?void 0:e.name)||"",document.getElementById("team-member-email").value=(e==null?void 0:e.email)||"",document.getElementById("team-member-role").value=(e==null?void 0:e.role)||"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=Zt()),t.classList.remove("hidden"))}function Ms(){var e;(e=document.getElementById("team-modal"))==null||e.classList.add("hidden")}function xa(e,t){let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");s&&(document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=Zt(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",s.classList.remove("hidden"))}function Ts(){var e;(e=document.getElementById("team-pw-modal"))==null||e.classList.add("hidden")}async function wa(){var l,p,c,v,d,u,m,h;let e=(l=document.getElementById("team-edit-id"))==null?void 0:l.value,t=(c=(p=document.getElementById("team-member-name"))==null?void 0:p.value)==null?void 0:c.trim(),s=(d=(v=document.getElementById("team-member-email"))==null?void 0:v.value)==null?void 0:d.trim(),n=(u=document.getElementById("team-member-role"))==null?void 0:u.value,o=(m=document.getElementById("team-member-password"))==null?void 0:m.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026";let r;e?r=await B.put(`/team/${e}`,{name:t,email:s,role:n}):r=await B.post("/team",{name:t,email:s,role:n,password:o}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",r.ok?(Ms(),M(e?"Member updated.":`${t} has been added to the team.`,"success"),await fn()):(i.textContent=((h=r.error)==null?void 0:h.message)||"Something went wrong.",i.classList.remove("hidden"))}async function ka(){var a,r;let e=(a=document.getElementById("team-pw-user-id"))==null?void 0:a.value,t=(r=document.getElementById("team-new-password"))==null?void 0:r.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026";let{ok:o,error:i}=await B.post(`/team/${e}/password`,{password:t});n.disabled=!1,n.textContent="Reset Password",o?(Ts(),M("Password has been reset.","success")):(s.textContent=(i==null?void 0:i.message)||"Failed to reset password.",s.classList.remove("hidden"))}var Ea=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},$a=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1};function Eo(){return setTimeout(()=>rs(),0),`
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
  `}async function rs(e="all"){var f;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await ko(n.files),n.value="",rs(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=g=>{g.target.closest("button")||n==null||n.click()},o.ondragover=g=>{g.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async g=>{g.preventDefault(),o.classList.remove("is-dragover"),g.dataTransfer.files.length>0&&(await ko(g.dataTransfer.files),rs(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(g=>{g.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(S=>{S.className="vs-device-btn"}),g.className="vs-device-btn vs-device-btn-active",rs(g.dataset.filter)}});let a=e==="code",r=!a&&e!=="all"?`?category=${e}`:"",{ok:l,data:p}=await B.get(`/assets${r}`);if(!l||!((f=p==null?void 0:p.assets)!=null&&f.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let g=document.getElementById("btn-empty-upload"),S=document.getElementById("btn-upload-asset");g&&S&&g.addEventListener("click",()=>S.click());return}let c=p.assets;if(a&&(c=c.filter(g=>g.category==="css"||g.category==="js"),c.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${E.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let v=["jpg","jpeg","png","gif","webp","svg","ico"],d=c.filter(g=>g.category==="images"&&v.includes(g.extension)),u=c.filter(g=>!v.includes(g.extension)||g.category!=="images");function m(g,S){return g==="css"?E.fileCode:g==="js"?E.fileCode:g==="json"?E.fileJson:g==="pdf"?E.filePdf:["woff2","woff","ttf","otf"].includes(g)?E.type:["mp4","webm"].includes(g)?E.film:["mp3","wav","ogg"].includes(g)?E.music:["txt","md","csv"].includes(g)?E.fileText:["doc","docx","xls","xlsx"].includes(g)?E.fileText:S==="images"?E.image:E.fileText}let h=["css","js","json","svg"],w="";d.length>0&&(w+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',d.forEach((g,S)=>{var A;let k=Js(g.size),C=g.width?`${g.width}\xD7${g.height}`:"",T=g.extension==="svg";w+=`
        <div class="vs-asset-card" data-lightbox-idx="${S}">
          <div class="vs-asset-card-thumb${T?" is-svg":""}" style="cursor:pointer">
            <img src="${g.thumbnail||g.path}" alt="${x(((A=g.meta)==null?void 0:A.alt)||g.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${x(g.filename)}">${x(g.filename)}</p>
            <p class="vs-asset-card-meta">${C?C+" \xB7 ":""}${k}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${E.copy}</button>
            <button data-delete-asset="${g.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${E.x}</button>
          </div>
        </div>
      `}),w+="</div>"),u.length>0&&u.forEach(g=>{let S=Js(g.size),k=h.includes(g.extension);w+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${m(g.extension,g.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${x(g.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${g.category} \xB7 ${S}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${k?`
              <button data-edit-asset="${g.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${E.pencil}</button>
            `:""}
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-action-btn">${E.copy}</button>
            ${g.category!=="css"&&g.category!=="js"?`
              <button data-delete-asset="${g.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${E.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=w,t.querySelectorAll("[data-lightbox-idx]").forEach(g=>{let S=g.querySelector(".vs-asset-card-thumb");S&&S.addEventListener("click",()=>{let k=parseInt(g.dataset.lightboxIdx,10);Ca(d,k,e)})}),t.querySelectorAll("[data-copy-path]").forEach(g=>{g.addEventListener("click",()=>{navigator.clipboard.writeText(g.dataset.copyPath).then(()=>{let S=g.innerHTML;g.innerHTML="\u2713",g.classList.add("vs-asset-action-copied"),setTimeout(()=>{g.innerHTML=S,g.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(g=>{g.addEventListener("click",()=>{let k=g.dataset.editAsset.replace(/^\//,"");no(k)})}),t.querySelectorAll("[data-delete-asset]").forEach(g=>{g.addEventListener("click",async()=>{if(!await fe({title:"Delete Asset",description:`Delete ${g.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:k}=await B.delete("/assets",{path:g.dataset.deleteAsset});k?(M("Asset deleted.","success"),rs(e)):M("Could not delete asset.","error")})})}function Ca(e,t,s){let n=t;function o(d){if(d===0)return"0 B";let u=1024,m=["B","KB","MB","GB"],h=Math.floor(Math.log(d)/Math.log(u));return parseFloat((d/Math.pow(u,h)).toFixed(1))+" "+m[h]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var f,g;let d=e[n],u=d.width?`${d.width}\xD7${d.height}`:"",m=o(d.size),h=[u,m,(f=d.extension)==null?void 0:f.toUpperCase()].filter(Boolean),w=e.length>1;return`
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
            <img src="${d.path}" alt="${x(((g=d.meta)==null?void 0:g.alt)||d.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${x(d.filename)}</span>
            <span class="vs-lightbox-details">${h.join(" \xB7 ")}${w?` \xB7 ${n+1} / ${e.length}`:""}</span>
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
    `}let r=document.createElement("div");r.id="vs-lightbox",r.className="vs-lightbox",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Image preview"),r.innerHTML=a(),document.body.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add("is-visible"))});function l(){r.classList.remove("is-visible"),setTimeout(()=>r.remove(),400),document.removeEventListener("keydown",c)}function p(d){n=d,r.innerHTML=a(),v()}function c(d){if(d.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;l(),d.preventDefault()}d.key==="ArrowRight"&&e.length>1&&(p((n+1)%e.length),d.preventDefault()),d.key==="ArrowLeft"&&e.length>1&&(p((n-1+e.length)%e.length),d.preventDefault())}function v(){var m,h,w;(m=r.querySelector("#lightbox-close"))==null||m.addEventListener("click",f=>{f.stopPropagation(),l()});let d=null;r.addEventListener("mousedown",f=>{d=f.target}),r.addEventListener("click",f=>{var k;let g=f.target===r||f.target.classList.contains("vs-lightbox-stage"),S=d===r||((k=d==null?void 0:d.classList)==null?void 0:k.contains("vs-lightbox-stage"));g&&S&&l()}),(h=r.querySelector("#lightbox-prev"))==null||h.addEventListener("click",f=>{f.stopPropagation(),p((n-1+e.length)%e.length)}),(w=r.querySelector("#lightbox-next"))==null||w.addEventListener("click",f=>{f.stopPropagation(),p((n+1)%e.length)});let u=r.querySelector("#lightbox-copy");u==null||u.addEventListener("click",f=>{f.stopPropagation();let g=e[n];navigator.clipboard.writeText(g.path).then(()=>{let S=u.innerHTML;u.innerHTML=`${E.check}<span>Copied!</span>`,u.style.borderColor="var(--vs-success)",u.style.color="var(--vs-success)",setTimeout(()=>{u.innerHTML=S,u.style.borderColor="",u.style.color=""},2e3),M("Path copied!","success")})})}document.addEventListener("keydown",c),v()}async function ko(e){var i,a,r;if(Ea()||$a())return;let t=document.getElementById("status-text");t&&(t.textContent=`Uploading ${e.length} file(s)...`);let s=new FormData;for(let l of e)s.append("file[]",l);let n=H.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let p=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();if(p.ok){let c=((a=(i=p.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0;M(`${c} file(s) uploaded.`,"success"),t&&(t.textContent=`\u2713 ${c} file(s) uploaded`)}else{let c=((r=p.error)==null?void 0:r.message)||"Upload failed";M(c,"error"),t&&(t.textContent="\u2717 "+c)}t&&setTimeout(()=>{t&&(t.textContent="Ready")},4e3)}catch{M("Upload failed.","error"),t&&(t.textContent="\u2717 Upload failed",setTimeout(()=>{t&&(t.textContent="Ready")},4e3))}}var ls="vs-newdesign-save-pref",ds="gallery";function Lo(){return setTimeout(()=>La(),0),`
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
          ${E.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${ds==="history"?"vs-tab-active":""}" data-tab="history">
          ${E.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading\u2026</div>
      </div>
    </div>
  `}function La(){var e,t;document.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",()=>{ds=s.dataset.tab,document.querySelectorAll(".vs-tab").forEach(n=>n.classList.remove("vs-tab-active")),s.classList.add("vs-tab-active"),$o()})}),(e=document.getElementById("btn-save-design"))==null||e.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||cs()}),(t=document.getElementById("btn-new-design"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||bn()}),$o()}function $o(){ds==="gallery"?As():Is()}async function As(){var i,a;let e=document.getElementById("designs-content");if(!e)return;let{ok:t,data:s}=await B.get("/designs");if(!t||!((i=s==null?void 0:s.designs)!=null&&i.length)){e.innerHTML=`
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
    `,(a=document.getElementById("btn-empty-save"))==null||a.addEventListener("click",()=>{var r;(r=window.demoGuard)!=null&&r.call(window)||cs()});return}let n=s.active_id,o=s.designs;e.innerHTML=`
    <div class="vs-design-grid">
      ${o.map(r=>Ba(r,r.id===n)).join("")}
    </div>
  `,Ma(e),Sa(e)}function Sa(e){e.querySelectorAll(".vs-design-card-preview").forEach(t=>{let s=t.querySelector("iframe");s&&requestAnimationFrame(()=>{let n=t.offsetWidth;if(n>0){let o=n/1440;s.style.transform=`scale(${o})`}})})}function Ba(e,t){let s=x(e.name||"Untitled"),n=e.description?x(e.description):"",o=e.initial_prompt?x(e.initial_prompt):"",i=n||(o.length>100?o.substring(0,100)+"\u2026":o),a=x(e.site_name||""),r=e.page_count||0,l=e.created_at?Zs(e.created_at):"",p=e._corrupted,c=a&&a!==s?`${a} \xB7 ${r} ${r===1?"page":"pages"}`:`${r} ${r===1?"page":"pages"}`,v=`/_studio/api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(e.id)}%2Fpreview&path=index.php`,d=`${v}&embed=1`;return`
    <div class="vs-design-card${t?" vs-design-card-active":""}${p?" vs-design-card-corrupted":""}"
         data-design-id="${re(e.id)}">
      <div class="vs-design-card-preview">
        ${p?'<div class="vs-design-card-empty">Preview unavailable</div>':`
          <iframe src="${d}" tabindex="-1" loading="lazy"
                  sandbox="allow-same-origin"
                  title="Preview of ${re(e.name||"design")}"></iframe>
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
          <button class="vs-btn vs-btn-ghost vs-btn-xs" data-load-id="${re(e.id)}" ${p?"disabled":""}>
            ${E.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${v}" target="_blank" rel="noopener" title="Browse this design">
          ${E.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${re(e.id)}"
                data-edit-name="${re(e.name||"")}"
                data-edit-desc="${re(e.description||"")}">
          ${E.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${re(e.id)}" style="color: var(--vs-text-ghost);">
          ${E.trash2}
        </button>
      </div>
    </div>
  `}function Ma(e){e.querySelectorAll("[data-load-id]").forEach(t=>{t.addEventListener("click",async()=>{var p,c,v,d;if((p=window.demoGuard)!=null&&p.call(window)||(c=window.viewerGuard)!=null&&c.call(window))return;let s=t.dataset.loadId,n=t.closest(".vs-design-card"),o=((v=n==null?void 0:n.querySelector("h3"))==null?void 0:v.textContent)||"this design",i=await Aa(o);if(!i)return;if(t.innerHTML=`${E.rotateCcw} Loading\u2026`,t.disabled=!0,i.saveDesign){let u=H.get("siteName")||"Untitled",m=await B.post("/designs",{name:`${u}`,description:"Saved before switching designs"});if(!m.ok){M(((d=m.error)==null?void 0:d.message)||"Failed to save design.","error"),t.innerHTML=`${E.rotateCcw} Load`,t.disabled=!1;return}}let{ok:a,data:r,error:l}=await B.post(`/designs/${s}/load`,{skip_auto_save:!0});a?(M("Design loaded.","success"),await So(),window.location.hash="#/chat"):(M((l==null?void 0:l.message)||"Failed to load design.","error"),t.innerHTML=`${E.rotateCcw} Load`,t.disabled=!1)})}),e.querySelectorAll("[data-edit-id]").forEach(t=>{t.addEventListener("click",()=>{var i,a;if((i=window.demoGuard)!=null&&i.call(window)||(a=window.viewerGuard)!=null&&a.call(window))return;let s=t.dataset.editId,n=t.dataset.editName,o=t.dataset.editDesc;Ia(s,n,o)})}),e.querySelectorAll("[data-delete-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteId;if(!await fe({title:"Delete Design",description:"This design will be removed permanently. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await B.delete(`/designs/${s}`);o?(M("Design deleted.","success"),As()):(M((i==null?void 0:i.message)||"Failed to delete design.","error"),t.innerHTML=`${E.trash2}`,t.disabled=!1)})})}async function Is(){var i,a,r;let e=document.getElementById("designs-content");if(!e)return;e.innerHTML=`
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">
        ${E.camera} Create Snapshot
      </button>
    </div>
    <div id="snapshots-list">
      <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots\u2026</div>
    </div>
  `,(i=document.getElementById("btn-create-snapshot"))==null||i.addEventListener("click",()=>{var l,p;(l=window.demoGuard)!=null&&l.call(window)||(p=window.viewerGuard)!=null&&p.call(window)||Co()});let t=document.getElementById("snapshots-list");if(!t)return;let{ok:s,data:n}=await B.get("/snapshots");if(!s||!((a=n==null?void 0:n.snapshots)!=null&&a.length)){t.innerHTML=`
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
    `,(r=document.getElementById("btn-empty-create-snapshot"))==null||r.addEventListener("click",()=>{var l;(l=window.demoGuard)!=null&&l.call(window)||Co()});return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((l,p)=>{let c=Zs(l.created_at),v=new Date(l.created_at).toLocaleString(),d=l.size_bytes?(l.size_bytes/1024).toFixed(0)+" KB":"\u2014",u=p===o.length-1,m,h,w;l.snapshot_type==="pre_publish"?(m="var(--vs-success)",h="vs-snap-badge-green",w="Pre-publish"):l.snapshot_type==="manual"?(m="var(--vs-accent)",h="vs-snap-badge-amber",w="Manual"):(m="var(--vs-text-ghost)",h="vs-snap-badge-gray",w="Auto");let f=l.description?`<p class="vs-timeline-desc">${x(l.description)}</p>`:"";return`
          <div class="vs-timeline-item${u?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${m}; box-shadow: 0 0 0 3px color-mix(in srgb, ${m} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${h}">${w}</span>
                  <span class="vs-timeline-label">${x(l.label||"Snapshot #"+l.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${v}">${c}</span>
              </div>
              ${f}
              <div class="vs-timeline-meta">${l.file_count} files \xB7 ${d}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${l.id}" data-snap='${JSON.stringify({label:l.label,description:l.description,type:l.snapshot_type,files:l.file_count,size:d,date:v}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
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
  `,Ta(t)}function Ta(e){e.querySelectorAll("[data-preview-id]").forEach(t=>{t.addEventListener("click",()=>{let s=JSON.parse(t.dataset.snap);Pa(s)})}),e.querySelectorAll("[data-restore-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.restoreId;if(!await fe({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;t.innerHTML=`${E.rotateCcw} Restoring\u2026`,t.disabled=!0;let{ok:o,error:i}=await B.post(`/snapshots/${s}/restore`);if(o){let l=document.getElementById("status-text");l&&(l.textContent="\u2713 Snapshot restored",setTimeout(()=>{l&&(l.textContent="Ready")},4e3)),M("Snapshot restored.","success"),Is()}else M((i==null?void 0:i.message)||"Failed to restore snapshot.","error"),t.innerHTML=`${E.rotateCcw} Restore`,t.disabled=!1})}),e.querySelectorAll("[data-delete-snap-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,r;if((a=window.demoGuard)!=null&&a.call(window)||(r=window.viewerGuard)!=null&&r.call(window))return;let s=t.dataset.deleteSnapId;if(!await fe({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await B.delete(`/snapshots/${s}`);o?(M("Snapshot deleted.","success"),Is()):(M((i==null?void 0:i.message)||"Failed to delete snapshot.","error"),t.innerHTML=`${E.trash2}`,t.disabled=!1)})})}function cs(){var c;let e=document.getElementById("vs-design-save-overlay");e&&e.remove();let t=H.get("siteName")||"",s=document.createElement("div");s.id="vs-design-save-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${E.save} Save Design</h2>
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
        <button id="design-save-confirm" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${E.save} Save Design</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>me(s),o=v=>{v.key==="Escape"&&(v.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),ge(s,n),(c=document.getElementById("design-save-cancel"))==null||c.addEventListener("click",n);let a=document.getElementById("design-name"),r=document.getElementById("design-desc"),l=document.getElementById("design-save-confirm"),p=v=>{v.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",p),r==null||r.addEventListener("keydown",p),a==null||a.select(),l==null||l.addEventListener("click",async()=>{var h,w;let v=((h=a==null?void 0:a.value)==null?void 0:h.trim())||"",d=((w=r==null?void 0:r.value)==null?void 0:w.trim())||"";if(!v){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:u,error:m}=await B.post("/designs",{name:v,description:d});n(),u?(M("Design saved.","success"),ds="gallery",document.getElementById("designs-content")&&(document.querySelectorAll(".vs-tab").forEach(g=>{g.classList.toggle("vs-tab-active",g.dataset.tab==="gallery")}),As())):M((m==null?void 0:m.message)||"Failed to save design.","error")})}function Ia(e,t,s){var c;let n=document.getElementById("vs-design-edit-overlay");n&&n.remove();let o=document.createElement("div");o.id="vs-design-edit-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${E.pencil} Edit Design</h2>
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>me(o);ge(o,i),(c=document.getElementById("edit-design-cancel"))==null||c.addEventListener("click",i);let a=document.getElementById("edit-design-name"),r=document.getElementById("edit-design-desc"),l=document.getElementById("edit-design-save");a==null||a.select();let p=v=>{v.key==="Enter"&&(l==null||l.click())};a==null||a.addEventListener("keydown",p),r==null||r.addEventListener("keydown",p),l==null||l.addEventListener("click",async()=>{var h,w;let v=((h=a==null?void 0:a.value)==null?void 0:h.trim())||"",d=((w=r==null?void 0:r.value)==null?void 0:w.trim())||"";if(!v){a==null||a.focus();return}l.innerHTML="Saving\u2026",l.disabled=!0;let{ok:u,error:m}=await B.put(`/designs/${e}`,{name:v,description:d});i(),u?(M("Design updated.","success"),As()):M((m==null?void 0:m.message)||"Failed to update design.","error")})}function Aa(e){return new Promise(t=>{var p,c;let s=document.getElementById("vs-switch-design-overlay");s&&s.remove();let n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=localStorage.getItem(ls),i=document.createElement("div");i.id="vs-switch-design-overlay",i.className="vs-modal-overlay",i.innerHTML=`
      <div class="vs-modal" style="max-width: 480px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Switch Design</h2>
          <p class="vs-modal-desc">Switch to "${x(e)}"?</p>
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
    `;let a=v=>{v.key==="Escape"&&(v.preventDefault(),r(null))},r=v=>{document.removeEventListener("keydown",a),me(i),t(v)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let l=document.getElementById("vs-switch-save-cb");ge(i,()=>r(null)),(p=document.getElementById("vs-switch-cancel"))==null||p.addEventListener("click",()=>r(null)),(c=document.getElementById("vs-switch-ok"))==null||c.addEventListener("click",()=>{let v=l?l.checked:!1;localStorage.setItem(ls,v?"true":"false"),r({saveDesign:v})}),document.addEventListener("keydown",a),setTimeout(()=>{var v;return(v=document.getElementById("vs-switch-ok"))==null?void 0:v.focus()},220)})}async function bn(){var n;let e=await _a();if(!e)return;if(e.saveDesign&&e.designName){let o=await B.post("/designs",{name:e.designName,description:""});if(!o.ok){M(((n=o.error)==null?void 0:n.message)||"Failed to save design.","error");return}M("Design saved.","success")}let{ok:t,error:s}=await B.post("/designs/new",{skip_auto_save:!0});if(t){M("Workspace cleared. Start building.","success"),await So(),H.set("messages",[]),H.set("activeConversationId",null),H.set("conversations",[]);try{localStorage.removeItem("vs-active-conversation")}catch{}window.location.hash!=="#/chat"?je.navigate("chat"):je.refresh()}else M((s==null?void 0:s.message)||"Failed to start new design.","error")}function _a(){return new Promise(e=>{var v,d;let t=document.getElementById("vs-new-design-overlay");t&&t.remove();let s=H.get("siteName")||"",n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=document.createElement("div");o.id="vs-new-design-overlay",o.className="vs-modal-overlay",o.innerHTML=`
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
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${re(s)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;let i=u=>{u.key==="Escape"&&(u.preventDefault(),a(null))},a=u=>{document.removeEventListener("keydown",i),me(o),e(u)};document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let r=document.getElementById("vs-newdesign-save-cb"),l=document.getElementById("vs-newdesign-name-row"),p=document.getElementById("vs-newdesign-name"),c=()=>{r.checked?(l.style.display="",setTimeout(()=>p==null?void 0:p.focus(),80)):l.style.display="none"};r==null||r.addEventListener("change",c),p==null||p.addEventListener("keydown",u=>{var m;u.key==="Enter"&&(u.preventDefault(),(m=document.getElementById("vs-newdesign-ok"))==null||m.click())}),ge(o,()=>a(null)),(v=document.getElementById("vs-newdesign-cancel"))==null||v.addEventListener("click",()=>a(null)),(d=document.getElementById("vs-newdesign-ok"))==null||d.addEventListener("click",()=>{var h;let u=r?r.checked:!1,m=((h=p==null?void 0:p.value)==null?void 0:h.trim())||"";if(u&&!m){p==null||p.focus();return}localStorage.setItem(ls,u?"true":"false"),a({saveDesign:u,designName:m})}),document.addEventListener("keydown",i),setTimeout(()=>{var u;r!=null&&r.checked&&p?p.select():(u=document.getElementById("vs-newdesign-ok"))==null||u.focus()},220)})}function Co(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>me(t);ge(t,s),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var p;let a=((p=n==null?void 0:n.value)==null?void 0:p.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:r,error:l}=await B.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),r?(M("Snapshot created.","success"),Is()):M((l==null?void 0:l.message)||"Failed to create snapshot.","error")})}function Pa(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
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
          <span style="color: var(--vs-text-primary);">${x(e.label||"\u2014")}</span>
          <span style="color: var(--vs-text-ghost);">Description</span>
          <span style="color: var(--vs-text-primary);">${x(e.description||"\u2014")}</span>
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),ge(s,()=>me(s)),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>me(s))}async function So(){var e,t;try{let s=await B.get("/pages");s.ok&&Array.isArray((e=s.data)==null?void 0:e.pages)&&H.set("pages",s.data.pages);let n=await B.get("/auth/session");n.ok&&((t=n.data)!=null&&t.site_name)&&(H.set("siteName",n.data.site_name),document.title=`Studio \u2014 ${n.data.site_name}`);let o=document.getElementById("preview-iframe");o&&(o.src=o.src);let i=document.getElementById("status-text");i&&(i.textContent="\u2713 Design switched",setTimeout(()=>{i&&(i.textContent="Ready")},4e3))}catch(s){console.warn("[designs] Post-switch refresh failed:",s)}}var ja=[{route:"chat",label:"Chat"},{route:"editor",label:"Editor"},{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"designs",label:"Designs",roles:["owner","editor"]},{route:"settings",label:"Settings",roles:["owner"]}],kn=["chat","editor"],Ra="vs-first-run-guide-dismissed",Ro="vs-onboarding-draft-v1",Ho="vs-prompt-recents-v1",Do="vs-prompt-pins-v1",Ha=8,Da=5,Bo=5,qa=5*1024*1024,En=["image/jpeg","image/png","image/gif","image/webp"],vt=[],We=null,Cn=document.documentElement.dataset.demo==="true",Na=document.documentElement.dataset.demoHideBanner==="true",st=Cn&&!Na,qo=window.matchMedia("(max-width: 767px)");function Ln(){return qo.matches}var za=[{route:"assets",label:"Assets",icon:"image"},{route:"forms",label:"Forms",icon:"inbox"},{route:"actions",label:"Actions",icon:"zap"},{route:"designs",label:"Designs",icon:"palette",roles:["owner","editor"]},{route:"more",label:"More",icon:"ellipsis"}],No=["chat","editor"];function De(){return Cn?(M("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function zo(){let e=H.get("user");return e&&e.role!=="viewer"}function zs(){return zo()?!1:(M("You have read-only access.","warning"),!0)}function Fa(){let e=H.get("user");return e&&e.role==="owner"}window.IS_DEMO=Cn;window.demoGuard=De;window.canWrite=zo;window.viewerGuard=zs;window.isOwner=Fa;var Fo=document.getElementById("app");async function Oo(){var s;jn(),Un(),window.marked&&window.marked.use({renderer:{html(n){return x(typeof n=="string"?n:n.text)}}});let e=await B.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){jo();return}H.batch(()=>{H.set("user",e.data.user),H.set("sessionToken",e.data.token),H.set("siteName",e.data.site_name||"")});let t=e.data.site_name;if(t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",n=>{var o;(o=window.__hasUnsavedEditorChanges)!=null&&o.call(window)&&(n.preventDefault(),n.returnValue="")}),je.beforeEach(async(n,o)=>{var i;return o.startsWith("editor")&&!n.startsWith("editor")&&(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)?await po():!0}).on("chat",()=>Ie()).on("editor",()=>Ie()).on("pages",()=>Ie()).on("pages/:slug",()=>Ie()).on("assets",()=>Ie()).on("forms",()=>Ie()).on("forms/:formId",()=>Ie()).on("actions",()=>Ie()).on("actions/:actionId",()=>Ie()).on("designs",()=>Ie()).on("settings",()=>Ie()).on("team",()=>Ie()).on("profile",()=>Ie()).onNotFound(()=>je.navigate("chat")),H.on("user",n=>{n||jo()}),Uo(),qo.addEventListener("change",()=>{Ie()}),Ln()){let o=(window.location.hash||"").replace(/^#\/?/,"");(!o||No.includes(o))&&(window.location.hash="#/assets")}je.start()}async function Uo(){try{let{ok:e,data:t}=await B.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){H.set("pages",t.pages),ti();let s=document.getElementById("chat-messages");(s==null?void 0:s.querySelector(".vs-empty-state"))&&(s.innerHTML=Nt(),qt())}}catch{}}function Ie(){let e=H.get("route"),t=kn.includes(e);Qt()&&es(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s=Ln()&&No.includes(e),n;s?n=Va(e):e==="editor"?n=eo():t?n=Ua():n=Wa(),Fo.innerHTML=`
    ${Oa()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${n}
    </div>
    ${sr()}
    ${nr()}
    ${or()}
    ${ar()}
    ${wo()}
    ${vr()}
  `,hr(),ir(),e==="editor"&&!s&&to()}function Oa(){let e=H.get("route"),t=H.get("user"),s=H.get("theme"),n=ja.filter(o=>o.roles&&t?o.roles.includes(t.role):!0).map(o=>{let i=e===o.route||e.startsWith(o.route+"/");return`
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
            <span class="vs-logo-text hidden sm:inline">${x(H.get("siteName")||"VoxelSite")}</span>
          </a>
          <nav class="flex items-center gap-0.5" aria-label="Studio navigation">
            ${n}
          </nav>
          ${st?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${E.eye} Demo
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
            ${s==="dark"?E.sun:E.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${E.user}
              <span class="hidden sm:inline">${x((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${(t==null?void 0:t.role)!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${(t==null?void 0:t.role)==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${E.pencil} Edit Profile
              </a>
              ${(t==null?void 0:t.role)==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${E.users} Team Members
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
  `}function Ua(){let e=H.get("sidebarWidth"),t=H.get("activeConversationId"),s=H.get("activePageScope"),n=Vo(s);return`
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
              <span id="scope-label" class="text-vs-text-secondary">${x(n)}</span>
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
          ${Nt()}
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
          <iframe id="preview-iframe" class="w-full h-full border-0" src="/_studio/api/router.php?_path=%2Fpreview&path=index.php"
            sandbox="allow-scripts allow-same-origin"
            data-voxelsite-preview
            title="Website preview"></iframe>
        </div>
      </div>
    </div>
  `}function Va(e){let t=e==="editor"?"Code Editor":"AI Chat",s=e==="editor"?"The code editor needs a wider screen for the file tree, editor pane, and preview.":"The AI conversation and live preview work side-by-side. That needs a wider screen.";return`
    <div class="h-full overflow-y-auto">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 18px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
          ${E.monitor}
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
  `}function Wa(){let e=H.get("route"),t=H.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${Ga(e,t)}
      </div>
    </div>
  `}function Ga(e,t){let s=H.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return Eo();case"forms":return ho();case"forms/:formId":return fo(t.formId);case"actions":return uo();case"actions/:actionId":return mo(t.actionId);case"designs":return n==="owner"||n==="editor"?Lo():yn();case"settings":return n==="owner"?co():yn();case"team":return n==="owner"?xo():yn();case"profile":return Ja();default:return Ka("Not Found","This page doesn't exist.")}}function yn(){return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/chat" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">\u2190 Back to Chat</a>
    </div>
  `}function Ka(e,t){return`
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
  `}function Ya(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return E[t[s]||"layoutGrid"]||E.layoutGrid}function Mo(e){je.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function Ja(){let e=H.get("user")||{};return setTimeout(()=>Za(),0),`
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
            <input type="text" id="profile-name" class="vs-input" value="${x(e.name||"")}" placeholder="Your name" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-email">Email</label>
            <input type="email" id="profile-email" class="vs-input" value="${x(e.email||"")}" placeholder="you@example.com" />
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
  `}function Za(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var p,c,v,d;let o=(c=(p=document.getElementById("profile-name"))==null?void 0:p.value)==null?void 0:c.trim(),i=(d=(v=document.getElementById("profile-email"))==null?void 0:v.value)==null?void 0:d.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:r,data:l}=await B.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(l!=null&&l.user)?(H.set("user",l.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>Ie(),800)):t&&(t.textContent=(r==null?void 0:r.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var p,c,v;let o=((p=document.getElementById("profile-current-pw"))==null?void 0:p.value)||"",i=((c=document.getElementById("profile-new-pw"))==null?void 0:c.value)||"",a=((v=document.getElementById("profile-confirm-pw"))==null?void 0:v.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:r,error:l}=await B.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",r?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(l==null?void 0:l.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function Xa(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),Qa()):e.classList.add("hidden")}async function Qa(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await B.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${x((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=H.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let r=a.id===i,l=a.title||"Untitled conversation",p=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${r?"vs-conv-item-active":""}"
              data-conversation-id="${x(a.id)}">
        <span class="mt-0.5 shrink-0 ${r?"text-vs-accent":"text-vs-text-ghost"}">${E.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${r?"font-medium":""}" style="font-size: var(--text-sm);">${x(l)}</div>
          <div class="vs-conv-time mt-0.5">${p}</div>
        </div>
        ${r?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let r=a.dataset.conversationId;Hs(r);let l=document.getElementById("conversation-history-panel");l&&l.classList.add("hidden")})})}async function Hs(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await B.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){H.set("activeConversationId",null),qs(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=Nt(),qt();return}let i=n.conversation,a=i.prompts||[];H.set("activeConversationId",e),qs(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=Nt(),qt();return}let r="",l=!1;for(let p of a){let{text:c,images:v,webRefUrl:d}=xr(p.user_prompt),u=v.length>0?`<div class="vs-msg-user-images">${v.map(h=>`<img src="${h}" class="vs-msg-user-image" />`).join("")}</div>`:"",m=d?`<div class="vs-msg-user-webref"><a href="${re(d)}" target="_blank" rel="noopener" title="${re(d)}">${E.globe} <span>${x(Xt(d))}</span></a></div>`:"";if(r+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${u}
        ${m}
        ${c?`<div class="text-sm text-vs-text-primary leading-relaxed">${x(c)}</div>`:""}
      </div>
    `,p.ai_response||p.files_modified){let h="",w=typeof p.ai_message=="string"&&p.ai_message.trim()!==""?p.ai_message:p.ai_response;w&&(h=Rs(w));let f="";if(p.files_modified)try{let k=JSON.parse(p.files_modified);if(Array.isArray(k)&&k.length>0){let C=k.map(A=>{let j=typeof A=="string"?A:A.path||A,O=typeof A=="object"&&A.action==="delete";return`<div class="vs-file-badge ${O?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${O?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${x(String(j))}</span>
              </div>`}).join(""),T=k.length;f=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${T} file${T!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${C}</div>
              </div>`}}catch{}let g="";if(p.evaluation_issues)try{let k=JSON.parse(p.evaluation_issues);if(Array.isArray(k)&&k.length>0){let C=q=>q==="error"?"#ef4444":q==="warning"?"#d97706":"#6b7280",T=q=>q==="error"?"rgba(239,68,68,0.1)":q==="warning"?"rgba(217,119,6,0.1)":"rgba(107,114,128,0.1)",A={error:0,warning:0,info:0};k.forEach(q=>{A[q.severity]=(A[q.severity]||0)+1});let j=[];A.error&&j.push(`${A.error} error${A.error>1?"s":""}`),A.warning&&j.push(`${A.warning} warning${A.warning>1?"s":""}`),A.info&&j.push(`${A.info} suggestion${A.info>1?"s":""}`);let O=A.error>0?"error":A.warning>0?"warning":"info",X=O==="error"?"rgba(239,68,68,0.15)":O==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)",K=k.map(q=>`
              <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                  <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${C(q.severity)}; background: ${T(q.severity)};">${x(q.severity)}</span>
                  <span style="font-size: 11px; color: var(--vs-text-ghost);">${x(q.category||"")}</span>
                  ${q.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${x(q.file)}${q.line?":"+q.line:""}</span>`:""}
                </div>
                <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${x(q.description||"")}</div>
                ${q.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${x(q.suggested_fix)}</div>`:""}
              </div>
            `).join("");g=`
              <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${X}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
                <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${C(O)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                  <span>Expert Review \xB7 ${j.join(", ")}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
                </summary>
                <div style="border-top: 1px solid var(--vs-border-subtle);">
                  <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
                  ${K}
                </div>
              </details>`}}catch{}let S=p.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${h}</div>
          ${f}
          ${g}
          ${S}
        </div>
      `}else if(p.status==="streaming"){l=!0;let h=p.id;r+=`
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
      `)}t.innerHTML=r,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),l&&!window.__vsResumedToastByConversation[e]&&(M("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),l||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(p){try{await B.post("/ai/cancel-generation",{prompt_id:p})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",Hs(e)},l&&H.get("activeConversationId")===e&&!H.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{H.get("activeConversationId")===e&&!H.get("aiStreaming")&&Hs(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function er(){H.set("activeConversationId",null),qs(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=Nt(),qt());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function Vo(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function Ds(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=Vo(t)}function qs(e){H.set("activePageScope",e||null),Ds(),Qt()&&es()}async function tr(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>me(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),ge(t,s),t.addEventListener("keydown",c=>{c.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await B.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${x((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let r=i.pages;if(!r.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${E.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let l='<div style="display: flex; flex-direction: column; gap: 2px;">';r.forEach(c=>{let v=!!Number(c.is_homepage),d=c.title||c.slug||c.path,u=c.path||c.slug+".php",m="/"+u.replace(/\.php$/,"").replace(/^index$/,""),h=m==="/"?"/":m,w=Ya(c.slug),g=(window.__vsCurrentPreviewPath||"index.php")===u,S=c.size?(c.size/1024).toFixed(1)+" KB":"";l+=`
      <div class="vs-pages-modal-item ${g?"is-active":""}" data-slug="${x(c.slug)}" data-path="${x(u)}" data-title="${x(d)}" data-url="${x(h)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${w}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${x(d)}${v?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${x(u)}${S?" \xB7 "+S:""}
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
          ${v?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${E.trash2}
          </button>
          `}
        </div>
      </div>
    `}),l+="</div>",n.innerHTML=l;let p=t.querySelector(".vs-modal-desc");p&&(p.textContent=`${r.length} page${r.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(c=>{c.addEventListener("click",v=>{v.stopPropagation();let d=c.closest(".vs-pages-modal-item"),u=d.dataset.slug,m=d.dataset.path,h=d.dataset.title,w=d.dataset.url,f=c.dataset.action;if(f==="edit")qs(u),s(),Mo(`Edit the "${h}" page (${w}): `);else if(f==="preview"){let g=document.getElementById("preview-iframe");g?(Qt()&&es(),g.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m)+"&t="+Date.now(),window.__vsCurrentPreviewPath=m,Ds(),s(),M(`Preview: ${h}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m),"_blank")}else if(f==="delete"){s();let g=`Delete the "${h}" page (${w}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;Mo(g)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(c=>{c.addEventListener("click",v=>{if(v.target.closest(".vs-pages-action"))return;let d=c.dataset.path,u=c.dataset.title,m=document.getElementById("preview-iframe");m?(m.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d)+"&t="+Date.now(),window.__vsCurrentPreviewPath=d,Ds(),s(),M(`Preview: ${u}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d),"_blank")})})}function qt(){var e;document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let s=document.getElementById("prompt-input");s&&(s.value=t.dataset.quickPrompt,s.dataset.actionType=t.dataset.actionType||"free_prompt",s.focus(),s.setSelectionRange(0,s.value.length),s.dispatchEvent(new Event("input",{bubbles:!0})))})}),(e=document.getElementById("chat-new-design"))==null||e.addEventListener("click",()=>{De()||zs()||bn()})}function Nt(){let e=H.get("pages")||[],t=e.length>0,s=new Set(e.map(g=>g.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(g=>{let S=g.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(S)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],r=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],l=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],p=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],c=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],v,d,u;if(!t)d="What are we building?",u="Describe your website and watch it appear in the preview. Every detail is a conversation away.",v=xn(n).slice(0,6);else{d="What\u2019s next?",u="Your site is live in preview. Pick a suggestion or describe any change you want.";let g=[...o,...o,...i,...a,...r,...l,...p,...c];v=xn(g).slice(0,6);let S=new Set;if(v=v.filter(k=>S.has(k.label)?!1:(S.add(k.label),!0)),v.length<6){let k=xn(g).filter(C=>!S.has(C.label));for(let C of k){if(v.length>=6)break;v.push(C),S.add(C.label)}}}let m=v.map(g=>`<button data-quick-prompt="${x(g.prompt).replace(/"/g,"&quot;")}" data-action-type="${g.type}"
      class="vs-style-card">${x(g.label)}</button>`).join(`
        `),h=H.get("user"),f=t&&((h==null?void 0:h.role)==="owner"||(h==null?void 0:h.role)==="editor")?`
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
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${d}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${u}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${m}
      </div>
      ${f}
    </div>
  `}function xn(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function sr(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-vs-success" title="Connected"></span>
          <span id="status-text" class="text-xs text-vs-text-ghost">Ready</span>
        </div>
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
  `}function nr(){let e=H.get("route"),t=H.get("user"),s=t==null?void 0:t.role;return`
    <nav class="vs-mobile-nav" aria-label="Mobile navigation">
      ${za.filter(o=>!(o.roles&&!o.roles.includes(s))).map(o=>{if(o.route==="more")return`
        <button class="vs-mobile-nav-item" id="btn-mobile-more" aria-label="More">
          ${E[o.icon]||E.layoutGrid}
          <span>${o.label}</span>
        </button>
      `;let i=e===o.route||e.startsWith(o.route+"/");return`
      <a href="#/${o.route}"
         class="vs-mobile-nav-item ${i?"vs-mobile-nav-item-active":""}"
         aria-label="${o.label}">
        ${E[o.icon]||E.layoutGrid}
        <span>${o.label}</span>
      </a>
    `}).join("")}
    </nav>
  `}function or(){let e=H.get("user"),t=e==null?void 0:e.role,s=H.get("theme"),n="";return t==="owner"&&(n+=`
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
    <button id="btn-mobile-download" class="vs-mobile-more-item">
      ${E.download} Download
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
          <span class="vs-mobile-more-title">${x((e==null?void 0:e.name)||"Menu")}</span>
          <button id="btn-mobile-more-close" class="vs-mobile-more-close">${E.x}</button>
        </div>
        ${n}
      </div>
    </div>
  `}function ir(){if(!Ln())return;let e=document.getElementById("btn-mobile-more"),t=document.getElementById("mobile-more-sheet"),s=document.getElementById("mobile-more-backdrop"),n=document.getElementById("btn-mobile-more-close");function o(){t==null||t.classList.add("vs-sheet-open")}function i(){t==null||t.classList.remove("vs-sheet-open")}e&&e.addEventListener("click",o),s&&s.addEventListener("click",i),n&&n.addEventListener("click",i),document.querySelectorAll("[data-mobile-more-nav]").forEach(c=>{c.addEventListener("click",i)});let a=document.getElementById("btn-mobile-theme");a&&a.addEventListener("click",()=>{ks(),i(),Ie()});let r=document.getElementById("btn-mobile-publish");r&&r.addEventListener("click",()=>{var c;i(),!De()&&((c=document.getElementById("btn-publish"))==null||c.click())});let l=document.getElementById("btn-mobile-download");l&&l.addEventListener("click",()=>{i(),!De()&&ei()});let p=document.getElementById("btn-mobile-logout");p&&p.addEventListener("click",async()=>{i(),await B.post("/auth/logout"),window.location.href="/_studio/"})}function ar(){return`
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
  `}function Wo(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>Jo(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function Go(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function Ko(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function Fs(){return Go(Do)}function Sn(){return Go(Ho)}function Yo(e){let t=Fs(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];Ko(Do,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};us(n.query||"",n.activeIndex||0)}function rr(e){let t=Sn().filter(n=>n!==e),s=[e,...t].slice(0,8);Ko(Ho,s)}function Jo(e){if(H.get("route")!=="chat"){je.navigate("chat"),setTimeout(()=>Jo(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function Zo(e,t="free_prompt",s=!1){if(H.get("route")!=="chat"){je.navigate("chat"),setTimeout(()=>Zo(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?Ns():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function ps(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function To(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),us(e,0))}function vs(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function lr(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function dr(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=lr(s,n);return i===null?null:70+i}function cr(e){let t=(e||"").trim().toLowerCase(),s=Wo(),n=Fs(),o=Sn();return s.map(i=>{let a=dr(t,i);if(a===null)return null;let r=n.includes(i.id)?-12:0,l=o.includes(i.id)?-8:0;return{...i,__score:a+r+l}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function pr(e){let t=Wo(),s=Object.fromEntries(t.map(v=>[v.id,v])),n=(e||"").trim(),o=[];if(n!==""){let v=cr(e).slice(0,18);return v.length>0&&o.push({title:"Results",commands:v}),o}let i=Sn(),a=Fs(),r=new Set,l=i.map(v=>s[v]).filter(Boolean);l.length>0&&(o.push({title:"Recent",commands:l}),l.forEach(v=>r.add(v.id)));let p=a.map(v=>s[v]).filter(v=>v&&!r.has(v.id));return p.length>0&&(o.push({title:"Pinned",commands:p}),p.forEach(v=>r.add(v.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(v=>{let d=t.filter(u=>u.group===v&&!r.has(u.id));d.length>0&&(o.push({title:v,commands:d}),d.forEach(u=>r.add(u.id)))}),o}function us(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=pr(e),o=n.flatMap(p=>p.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=Fs();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let r="",l=0;n.forEach(p=>{r+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${x(p.title)}</div>`,p.commands.forEach(c=>{let v=l===i,d=a.includes(c.id);r+=`
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${l}"
            class="vs-cmd-item ${v?"vs-cmd-item-active":""}">
            <div class="min-w-0">
              <div class="vs-cmd-item-title">${x(c.title)}</div>
              <div class="vs-cmd-item-desc">${x(c.prompt?c.prompt.substring(0,80)+(c.prompt.length>80?"\u2026":""):c.meta)}</div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${x(c.id)}"
            class="vs-cmd-pin ${d?"vs-cmd-pin-active":""}"
            title="${d?"Unpin":"Pin"}">
            ${d?"\u2605":"\u2606"}
          </button>
        </div>
      `,l+=1})}),s.innerHTML=r,s.querySelectorAll("[data-command-index]").forEach(p=>{p.addEventListener("click",()=>{let c=parseInt(p.dataset.commandIndex||"0",10);Xo(c)})}),s.querySelectorAll("[data-command-pin]").forEach(p=>{p.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let v=p.dataset.commandPin;v&&Yo(v)})})}function Xo(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(rr(n.id),vs(),Promise.resolve(n.run()).catch(()=>{}))}function vr(){return`
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
  `}function _s(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function Bt(){try{let e=localStorage.getItem(Ro);if(!e)return _s();let t=JSON.parse(e);return{..._s(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:_s().pages}}catch{return _s()}}function Qo(e){try{localStorage.setItem(Ro,JSON.stringify(e))}catch{}}function js(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function Io(){let e=window.__vsOnboarding||{step:1,draft:Bt()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||Bt(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),r=document.getElementById("btn-onboarding-next"),l=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!r||!l)return;let p=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${p[t-1]}`,n.innerHTML=p.map((c,v)=>{let d=v+1===t,u=v+1<t;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${d?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":u?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${v+1}. ${x(c)}</div>
      </div>
    `}).join(""),t===1)i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Business Name</label>
          <input id="onboard-business-name" type="text" class="vs-input w-full" value="${x(s.business_name)}" placeholder="e.g. Harbor & Pine Studio">
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Business Type</label>
          <input id="onboard-business-type" type="text" class="vs-input w-full" value="${x(s.business_type)}" placeholder="e.g. interior design studio">
        </div>
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Core Offer</label>
          <textarea id="onboard-offer" class="vs-textarea w-full" rows="4" placeholder="What do you sell or provide?">${x(s.offer)}</textarea>
        </div>
      </div>
    `;else if(t===2)i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-1">Target Audience</label>
          <textarea id="onboard-audience" class="vs-textarea w-full" rows="3" placeholder="Who should this website attract?">${x(s.audience)}</textarea>
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
    `}a.disabled=t===1,r.classList.toggle("hidden",t===3),l.classList.toggle("hidden",t!==3),ur()}function ur(){let e=window.__vsOnboarding||{draft:Bt()},t=()=>{var n,o,i,a,r,l,p,c,v,d,u;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((l=(r=document.getElementById("onboard-offer"))==null?void 0:r.value)==null?void 0:l.trim())||e.draft.offer||"",audience:((c=(p=document.getElementById("onboard-audience"))==null?void 0:p.value)==null?void 0:c.trim())||e.draft.audience||"",style:((v=document.getElementById("onboard-style"))==null?void 0:v.value)||e.draft.style||"modern-minimal",tone:((d=document.getElementById("onboard-tone"))==null?void 0:d.value)||e.draft.tone||"confident",content_mode:((u=document.getElementById("onboard-content-mode"))==null?void 0:u.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(m=>m.checked).map(m=>m.dataset.onboardPage).filter(Boolean)),Qo(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function mr(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function gr(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>js());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>js());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Bt()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,Io()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Bt()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,Io()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:Bt()}).draft||Bt(),r=mr(a);try{localStorage.setItem(Ra,"1")}catch{}Qo(a),js(),Zo(r,"create_site",!0)})}function hr(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var U,W;let P=ks()==="light";e.innerHTML=P?E.sun:E.moon,e.title=P?"Switch to dark":"Switch to light",window.__vsEditorPage&&((U=window.monaco)!=null&&U.editor)&&window.monaco.editor.setTheme(os()),document.getElementById("vs-code-editor-overlay")&&((W=window.monaco)!=null&&W.editor)&&window.monaco.editor.setTheme(os())});let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{To()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>vs());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{us(n.value,0)}),n.addEventListener("keydown",b=>{let P=window.__vsCommandPalette||{commands:[],activeIndex:0};if((b.metaKey||b.ctrlKey)&&b.key.toLowerCase()==="p"){b.preventDefault();let z=P.commands[P.activeIndex];z&&Yo(z.id);return}if(b.key==="ArrowDown"){b.preventDefault(),us(n.value,P.activeIndex+1);return}if(b.key==="ArrowUp"){b.preventDefault(),us(n.value,P.activeIndex-1);return}if(b.key==="Enter"){b.preventDefault(),Xo();return}b.key==="Escape"&&(b.preventDefault(),vs())})),gr();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",b=>{b.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",b=>{!i.classList.contains("hidden")&&!i.contains(b.target)&&b.target!==o&&!o.contains(b.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav"].forEach(b=>{let P=document.getElementById(b);P&&i&&P.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await B.post("/auth/logout"),window.location.href="/_studio/"});let r=document.getElementById("btn-undo-status");r&&r.addEventListener("click",()=>{De()||_o()});let l=document.getElementById("btn-redo-status");l&&l.addEventListener("click",()=>{De()||Po()});let p=document.getElementById("btn-preview-site");p&&p.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let c=document.getElementById("btn-snapshot");c&&c.addEventListener("click",async()=>{var U;if(De())return;c.disabled=!0,pt("Creating snapshot...");let{ok:b,data:P,error:z}=await B.post("/snapshots",{type:"manual",label:"Manual snapshot"});c.disabled=!1,pt(b?`\u2713 Snapshot saved (${((U=P==null?void 0:P.snapshot)==null?void 0:U.file_count)||0} files)`:"\u2717 "+((z==null?void 0:z.message)||"Snapshot failed"),b?"success":"error",4e3)});let v=document.getElementById("btn-download");v&&((async()=>{var U;let{ok:b,data:P}=await B.get("/settings");((U=P==null?void 0:P.settings)==null?void 0:U.last_published_at)||(v.disabled=!0,v.title="Publish your site first to enable download.",v.classList.add("opacity-40"))})(),v.addEventListener("click",()=>{v.disabled||De()||ei()}));let d=document.getElementById("btn-publish");d&&(Dt(),d.addEventListener("click",async()=>{var ue,Se;let b=gs();if(b.publishing)return;if(b.hasChanges===!1){M("No unpublished changes to publish.","warning");return}let P=b.counts||{added:0,modified:0,deleted:0},z=Number(P.added||0)+Number(P.modified||0)+Number(P.deleted||0),U=localStorage.getItem("vs_publish_snapshot"),se=await br({totalChanges:z,snapshotDefault:U===null?!0:U!=="false"});if(!se||De())return;localStorage.setItem("vs_publish_snapshot",String(se.createSnapshot)),b.publishing=!0,Dt(),pt("Publishing...");let{ok:ie,data:F,error:de}=await B.post("/publish",{create_snapshot:se.createSnapshot});if(b.publishing=!1,ie){let ze=((ue=F==null?void 0:F.published)==null?void 0:ue.length)||0,qe=((Se=F==null?void 0:F.removed)==null?void 0:Se.length)||0,ot=qe>0?`Published ${ze} file(s), removed ${qe} stale file(s).`:`Published ${ze} file(s).`;M(ot,"success"),pt(`\u2713 ${ze} published, ${qe} removed`,"success",5e3),H.set("previewDirty",!1),nt({silent:!0}),window.open("/","_blank")}else M((de==null?void 0:de.message)||"Publish failed.","error"),pt("\u2717 "+((de==null?void 0:de.message)||"Publish failed"),"error",5e3),nt({silent:!0})}));let u=document.getElementById("btn-publish-menu");u&&u.addEventListener("click",b=>{b.stopPropagation();let P=document.querySelector(".vs-publish-dropup");if(P){P.remove();return}let z=document.createElement("div");z.className="vs-publish-dropup",z.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${E.cloudOff} Unpublish
        </button>
      `;let U=u.closest(".vs-publish-split");U?U.appendChild(z):u.parentElement.appendChild(z),z.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(z.remove(),!await fe({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0})||De())return;pt("Unpublishing...");let{ok:F,data:de,error:ue}=await B.post("/publish/unpublish");F?(M("Unpublished. Default page restored.","success"),pt("\u2713 Site unpublished","success",5e3),nt({silent:!0})):(M((ue==null?void 0:ue.message)||"Unpublish failed.","error"),pt("\u2717 "+((ue==null?void 0:ue.message)||"Unpublish failed"),"error",5e3))});let W=ie=>{!z.contains(ie.target)&&ie.target!==u&&(z.remove(),document.removeEventListener("click",W))};setTimeout(()=>document.addEventListener("click",W),0);let se=ie=>{ie.key==="Escape"&&(z.remove(),document.removeEventListener("keydown",se),document.removeEventListener("click",W))};document.addEventListener("keydown",se)});let m=document.getElementById("resize-handle"),h=document.getElementById("conversation-panel");if(m&&h){let b,P;m.addEventListener("mousedown",z=>{z.preventDefault(),b=z.clientX,P=h.offsetWidth;let U=se=>{let ie=se.clientX-b,F=Math.min(580,Math.max(340,P+ie));h.style.width=`${F}px`,H.set("sidebarWidth",F)},W=()=>{document.removeEventListener("mousemove",U),document.removeEventListener("mouseup",W)};document.addEventListener("mousemove",U),document.addEventListener("mouseup",W)})}let w=document.getElementById("prompt-input");w&&(w.addEventListener("input",()=>{w.style.height="auto",w.style.height=Math.min(200,w.scrollHeight)+"px"}),w.addEventListener("keydown",b=>{b.key==="Enter"&&(b.metaKey||b.ctrlKey)&&(b.preventDefault(),Ns())}));let f=document.getElementById("btn-send");f&&f.addEventListener("click",Ns);let g=document.getElementById("btn-attach-image"),S=document.getElementById("image-file-input");g&&S&&(g.addEventListener("click",()=>S.click()),S.addEventListener("change",()=>{S.files.length>0&&(wn(S.files),S.value="")})),Er();let k=document.querySelector(".vs-prompt-area");k&&(k.addEventListener("dragover",b=>{b.preventDefault(),b.stopPropagation(),k.classList.add("vs-drag-over")}),k.addEventListener("dragleave",b=>{b.preventDefault(),b.stopPropagation(),k.classList.remove("vs-drag-over")}),k.addEventListener("drop",b=>{b.preventDefault(),b.stopPropagation(),k.classList.remove("vs-drag-over");let P=Array.from(b.dataTransfer.files).filter(z=>En.includes(z.type));P.length>0&&wn(P)})),w&&w.addEventListener("paste",b=>{var U;let z=Array.from(((U=b.clipboardData)==null?void 0:U.items)||[]).filter(W=>W.kind==="file"&&En.includes(W.type));if(z.length>0){b.preventDefault();let W=z.map(se=>se.getAsFile()).filter(Boolean);wn(W)}}),qt();let C=document.getElementById("btn-new-chat");C&&C.addEventListener("click",er);let T=document.getElementById("btn-scope-selector");T&&T.addEventListener("click",()=>{tr()});let A=document.getElementById("btn-toggle-history");A&&A.addEventListener("click",Xa);let j=document.getElementById("btn-visual-editor");j&&j.addEventListener("click",()=>rn());let O=document.getElementById("btn-refresh-preview");O&&O.addEventListener("click",()=>zt());let X=document.getElementById("btn-save-design");if(X){X.addEventListener("click",()=>{De()||zs()||cs()});let b=()=>{let P=H.get("pages")||[];X.disabled=P.length===0};b(),H.on("pages",b)}let K=document.querySelectorAll("[data-device]"),q=document.getElementById("preview-frame-container");if(K.length&&q){let b={desktop:"100%",tablet:"768px",mobile:"375px"};K.forEach(P=>{P.addEventListener("click",()=>{let z=P.dataset.device,U=b[z]||"100%";z==="desktop"?(q.style.maxWidth="",q.style.width="",q.style.alignSelf=""):(q.style.maxWidth=U,q.style.width="100%",q.style.alignSelf="center"),K.forEach(W=>{W.classList.remove("vs-device-btn-active"),W.dataset.device===z&&W.classList.add("vs-device-btn-active")})})})}let Q=document.getElementById("btn-external-preview");Q&&Q.addEventListener("click",()=>{let b=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(b),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",b=>{var z,U;let P=(U=(z=b.target)==null?void 0:z.closest)==null?void 0:U.call(z,"[data-code-toggle]");P&&(b.preventDefault(),Cr(P))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",b=>{if((b.metaKey||b.ctrlKey)&&b.key==="k"){b.preventDefault(),ps()?vs():To();return}if(b.key==="Escape"&&ps()){b.preventDefault(),vs();return}if(b.key==="Escape"&&Ps()){b.preventDefault(),js();return}if((b.metaKey||b.ctrlKey)&&b.key==="z"&&!b.shiftKey){if(ps()||Ps())return;let P=document.activeElement;if(P&&(P.tagName==="INPUT"||P.tagName==="TEXTAREA"))return;b.preventDefault(),_o()}if((b.metaKey||b.ctrlKey)&&b.key==="z"&&b.shiftKey){if(ps()||Ps())return;let P=document.activeElement;if(P&&(P.tagName==="INPUT"||P.tagName==="TEXTAREA"))return;b.preventDefault(),Po()}if(b.key==="v"&&!b.metaKey&&!b.ctrlKey&&!b.altKey&&!b.shiftKey){if(ps()||Ps())return;let P=document.activeElement;if(P&&(P.tagName==="INPUT"||P.tagName==="TEXTAREA"||P.isContentEditable))return;let z=H.get("route");if(!kn.includes(z))return;b.preventDefault(),rn()}if(b.key==="Escape"&&Qt()){b.preventDefault(),es();return}}));let pe=H.get("route");if(kn.includes(pe))try{let b=H.get("activeConversationId"),P=localStorage.getItem("vs-active-conversation"),z=b||P,U=document.getElementById("chat-messages"),W=U==null?void 0:U.querySelector(".vs-empty-state");z&&!H.get("aiStreaming")?(b||H.set("activeConversationId",z),W&&Hs(z)):z||U&&U.children.length===0&&(U.innerHTML=Nt(),qt())}catch{}ms(),yr()}function fr(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=H.get("pages"),s=!t||t.length===0,n=s?"Building your site":"Applying your changes",o=s?"Generating a new website can take up to 10 minutes.<br>Please be patient while the AI works.":"Small changes can take a minute, larger updates can take up to 10 minutes.",i=document.createElement("div");i.className="vs-generating-overlay",i.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">${n}</div>
    <div class="vs-gen-subtitle">${o}</div>
    <div class="vs-gen-note">Keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-metrics" id="overlay-metrics"></div>
  `,e.appendChild(i)}function Ao(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function zt(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=zt;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),Ds())}));function $n(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{zt()}}window.sendPreviewMessage=$n;async function _o(){(await B.post("/revisions/undo")).ok&&(setTimeout(()=>zt(),300),await ms(),nt({silent:!0}))}async function Po(){(await B.post("/revisions/redo")).ok&&(setTimeout(()=>zt(),300),await ms(),nt({silent:!0}))}async function ms(){let{ok:e,data:t}=await B.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!s,r.title=o,r.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!n,r.title=i,r.classList.toggle("opacity-40",!n))})}function gs(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function pt(e,t="neutral",s=0){let n=document.getElementById("status-text");n&&(n.textContent=e,n.className=t==="success"?"text-xs text-vs-success":t==="error"?"text-xs text-vs-error":"text-xs text-vs-text-ghost",window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s>0&&(window.__vsStatusResetTimer=setTimeout(()=>{let o=document.getElementById("status-text");o&&(o.textContent="Ready",o.className="text-xs text-vs-text-ghost",window.__vsStatusResetTimer=null)},s)))}function Dt(){let e=gs(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=r=>{s&&(r?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${E.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${E.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${E.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${E.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let r=a===1?"":"s";n.textContent=`${a} unpublished change${r}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${E.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=Dt;function br({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var l,p;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Publish Website</h2>
          <p class="vs-modal-desc">${x(o)}</p>
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
    `;let a=c=>{c.key==="Escape"&&(c.preventDefault(),r(null))},r=c=>{document.removeEventListener("keydown",a),me(i),s(c)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),ge(i,()=>r(null)),(l=document.getElementById("vs-confirm-cancel"))==null||l.addEventListener("click",()=>r(null)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>{let c=document.getElementById("vs-publish-snapshot-cb");r({createSnapshot:c?c.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var c;return(c=document.getElementById("vs-confirm-ok"))==null?void 0:c.focus()},220)})}function ei(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=gs().hasChanges===!0?`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=d=>{d.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),me(o)};o.querySelector("#vs-download-close").addEventListener("click",a),ge(o,a),document.addEventListener("keydown",i);let r=o.querySelector("#vs-download-publish-link");r&&r.addEventListener("click",d=>{d.preventDefault(),a(),setTimeout(()=>{let u=document.getElementById("btn-publish");u&&!u.disabled&&u.click()},400)});let l=o.querySelectorAll(".vs-download-card"),p=o.querySelector("#vs-download-action"),c="php";l.forEach(d=>{d.addEventListener("click",()=>{if(d.classList.contains("is-loading"))return;l.forEach(m=>m.classList.remove("is-selected")),d.classList.add("is-selected"),c=d.dataset.format;let u=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${E.download} ${u}`})});let v=!1;p.addEventListener("click",async()=>{var d;if(!v){v=!0,p.disabled=!0,p.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',l.forEach(u=>u.style.pointerEvents="none");try{let u=H.get("sessionToken"),m={"Content-Type":"application/json",Accept:"application/zip"};u&&(m["X-VS-Token"]=u);let h=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:m,credentials:"same-origin",body:JSON.stringify({format:c})});if(!h.ok){let T="Export failed.";try{let A=await h.json();T=((d=A==null?void 0:A.error)==null?void 0:d.message)||T}catch{}M(T,"error");return}let f=(h.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),g=f?f[1]:`site-${c}-${new Date().toISOString().slice(0,10)}.zip`,S=await h.blob(),k=URL.createObjectURL(S),C=document.createElement("a");C.href=k,C.download=g,C.style.display="none",document.body.appendChild(C),C.click(),setTimeout(()=>{URL.revokeObjectURL(k),C.remove()},100),M(`\u2713 ${g} downloaded`,"success")}catch{M("Download failed. Check your connection.","error")}finally{v=!1,p.disabled=!1;let u=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${E.download} ${u}`,l.forEach(m=>m.style.pointerEvents="")}}})}async function nt({silent:e=!1}={}){let t=gs();if(t.publishing){Dt();return}t.checking=!0,e||Dt();let{ok:s,data:n,error:o}=await B.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",Dt()}window.refreshPublishState=nt;function yr(){let e=gs();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),nt({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||nt({silent:!0})},15e3)}function xr(e){if(!e)return{text:"",images:[],webRefUrl:null};let t=null,s=e;s.includes("[vx-ref:")&&(s=s.replace(/\[vx-ref:(https?:\/\/[^\]]+)\]/g,(o,i)=>(t=i,"")));let n=[];return s.includes("[vx-img:")&&(s=s.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(o,i)=>(n.push(i),""))),{text:s.trim(),images:n,webRefUrl:t}}function wn(e){let t=Array.from(e),s=Bo-vt.length;if(s<=0){M(`Maximum ${Bo} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&M(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!En.includes(o.type)){M(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>qa){M(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,r=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!r)return;let l=new Image;l.onload=()=>{let p=wr(l,120);vt.push({media_type:r[1],data:r[2],name:o.name,preview:a,thumbnail:p}),Bn()},l.src=a},i.readAsDataURL(o)})}function wr(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function Bn(){let e=document.getElementById("image-attachments");if(e){if(vt.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=vt.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${x(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);vt.splice(n,1),Bn()})})}}function kr(){vt=[],Bn()}function ti(){let t=(H.get("pages")||[]).length>0,s=document.getElementById("website-ref-restyle-options"),n=document.getElementById("website-ref-helper"),o=document.getElementById("btn-website-ref-confirm");s&&(s.hidden=!t),n&&(n.textContent=t?"Use another website as design reference for your site.":"Uses an existing website as design reference."),o&&(o.textContent=t?"Add":"Attach")}function si(){We=null;let e=document.getElementById("website-ref-chip");e&&(e.hidden=!0);let t=document.getElementById("prompt-input");t&&(t.placeholder="Describe what you want to build...");let s=document.getElementById("btn-attach-website");s&&s.classList.remove("is-active")}function Er(){let e=document.getElementById("btn-attach-website"),t=document.getElementById("website-ref-sheet"),s=document.getElementById("website-ref-url"),n=document.getElementById("website-ref-mode"),o=document.getElementById("btn-website-ref-confirm"),i=document.getElementById("btn-website-ref-cancel"),a=document.getElementById("website-ref-chip"),r=document.getElementById("website-ref-chip-label"),l=document.getElementById("btn-remove-website-ref"),p=document.getElementById("prompt-input");function c(d){if(v(),s&&s.classList.add("vs-input-error"),s){let u=document.createElement("div");u.className="vs-field-error vs-ref-url-error",u.textContent=d,s.insertAdjacentElement("afterend",u)}}function v(){s&&s.classList.remove("vs-input-error");let d=t==null?void 0:t.querySelector(".vs-ref-url-error");d&&d.remove()}e&&t&&e.addEventListener("click",()=>{zs()||(ti(),v(),t.hidden=!t.hidden,e.classList.toggle("is-active",!t.hidden||We!==null),!t.hidden&&s&&s.focus())}),o&&o.addEventListener("click",async()=>{var m;if(De())return;let d=(m=s==null?void 0:s.value)==null?void 0:m.trim();if(!d||!d.match(/^https?:\/\/.+/)){c("Enter a valid URL starting with http:// or https://");return}let u=o.textContent;o.disabled=!0,o.textContent="Checking\u2026",v();try{let{ok:h,data:w,error:f}=await B.post("/ai/check-url",{url:d});if(!h){c((f==null?void 0:f.message)||"Could not reach this URL.");return}let g=(w==null?void 0:w.url)||d,k=(H.get("pages")||[]).length>0;We={url:g,contentMode:k?(n==null?void 0:n.value)||"keep":"regenerate",restyle:k};let C="Design reference";r.textContent=`${C}: ${Xt(g)}`,r.title=g,a&&(a.hidden=!1),t&&(t.hidden=!0),e&&e.classList.add("is-active"),p&&(p.placeholder="Describe what to change (optional)...",p.focus())}catch{c("Network error \u2014 please check your connection and try again.")}finally{o.disabled=!1,o.textContent=u}}),i&&t&&i.addEventListener("click",()=>{v(),t.hidden=!0,e&&!We&&e.classList.remove("is-active")}),l&&l.addEventListener("click",()=>{si()}),s&&o&&(s.addEventListener("keydown",d=>{d.key==="Enter"&&(d.preventDefault(),o.click())}),s.addEventListener("input",v))}async function Ns(){if(De())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=vt.length>0;if(!t&&!s&&!(We!==null)||H.get("aiStreaming"))return;if(We!=null&&We.restyle)try{let _=H.get("siteName")||"Untitled";if(!(await B.post("/designs",{name:`${_} (before restyle)`,description:`Automatic snapshot saved before restyling from ${We.url}`,is_system_backup:!0})).ok){M("Could not save your current design before restyling. Please try again.","error");return}}catch{M("Could not save your current design before restyling. Please try again.","error");return}e.value="",e.style.height="auto";let o=document.getElementById("chat-messages");if(!o)return;let i=[...vt];kr();let a=We;si();let r=i.length>0?`<div class="vs-msg-user-images">${i.map(_=>`<img src="${_.preview}" alt="${x(_.name)}" class="vs-msg-user-image" />`).join("")}</div>`:"",l=a?`<div class="vs-msg-user-webref"><a href="${re(a.url)}" target="_blank" rel="noopener" title="${re(a.url)}">${E.globe} <span>${x(Xt(a.url))}</span></a></div>`:"",p=`
    <div class="vs-msg-user mb-6 mt-4">
      ${r}
      ${l}
      ${t?`<div class="vs-msg-user-bubble">${x(t)}</div>`:""}
    </div>
  `,c=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,v=`
    <div class="vs-msg-ai mb-6" data-stream-id="${c}">
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
        <button data-role="stop-btn" class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
      </div>
      <div data-role="error" hidden class="mt-3 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>
    </div>
  `,d=o.querySelector(".vs-empty-state");d&&d.remove(),o.insertAdjacentHTML("beforeend",p+v),o.scrollTop=o.scrollHeight;let u=!0,m=80,h=()=>{u=o.scrollHeight-o.scrollTop-o.clientHeight<=m};o.addEventListener("scroll",h);let w=()=>{u&&(o.scrollTop=o.scrollHeight)},f=o.querySelector(`.vs-msg-ai[data-stream-id="${c}"]`);if(!f)return;let g=f.querySelector('[data-role="typing"]'),S=f.querySelector('[data-role="status"]'),k=f.querySelector('[data-role="stream-content"]'),C=f.querySelector('[data-role="files-section"]'),T=f.querySelector('[data-role="files"]'),A=f.querySelector('[data-role="files-label"]'),j=f.querySelector('[data-role="files-count"]'),O=f.querySelector('[data-role="files-progress"]'),X=f.querySelector('[data-role="error"]'),K=f.querySelector('[data-role="status-timer"]'),q=_=>{_&&_.removeAttribute("hidden")},Q=_=>{_&&_.setAttribute("hidden","")},pe=Date.now(),b=0,P=Date.now(),z=!1,U=!1,W=setInterval(()=>{let _=Math.floor((Date.now()-pe)/1e3),y=Math.floor(_/60),L=_%60,I=y>0?`${y}m ${L}s`:`${L}s`;b>0&&(I+=` \xB7 ${b.toLocaleString()} tokens`),K&&(K.textContent=I);let R=document.getElementById("overlay-metrics");R&&(R.textContent=I),Date.now()-P>3e5&&!z&&(z=!0,K&&(K.textContent=`${I} \xB7 No data for 5 min \u2014 may have stalled`,K.style.color="var(--vs-warning, #d97706)"))},1e3);H.set("aiStreaming",!0),document.body.classList.add("vs-ai-streaming");let se=document.getElementById("btn-send");se&&(se.disabled=!0,se.classList.add("opacity-50")),fr();let ie="",F=[],de=!1,ue=null,Se=!0,ze=new AbortController,qe=f.querySelector('[data-role="stop-btn"]');qe&&qe.addEventListener("click",()=>ze.abort());let ot=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let ut=e.dataset.actionData,mt=null;if(ut){try{mt=JSON.parse(ut)}catch{}delete e.dataset.actionData}let $=t||"";if(!$)if(a)try{let _=Xt(a.url);$=a.restyle?`(restyle from: ${_})`:`(import from: ${_})`}catch{$=`(reference: ${a.url})`}else i.length>0&&($="(see attached images)");a&&($=`[vx-ref:${a.url}]`+$),i.length>0&&($=i.map(y=>`[vx-img:${y.thumbnail}]`).join("")+$);let N={user_prompt:$,action_type:ot,page_scope:H.get("activePageScope"),conversation_id:H.get("activeConversationId"),action_data:mt};a&&(N.action_type=a.restyle?"restyle_site":"import_site",N.action_data={url:a.url,content_mode:a.contentMode},N.page_scope=null),i.length>0&&(N.images=i.map(_=>({data:_.data,media_type:_.media_type}))),await yt("/ai/prompt",N,{signal:ze.signal,onConversation(_){if(_){H.set("activeConversationId",_);try{localStorage.setItem("vs-active-conversation",_)}catch{}}},onStatus(_){!U&&C&&!C.hasAttribute("hidden")&&A&&(A.textContent=_)},onToken(_){ie+=_,b+=Math.ceil(_.length/4),P=Date.now(),z=!1,K&&(K.style.color="");let y=ie.trimStart();if(!de&&y.length>0&&(de=y.startsWith("{")||y.startsWith("```json")||y.startsWith("```")||y.startsWith("<|")||y.startsWith("<message>")||y.startsWith("<file ")||_.includes("<|")||y.includes("<|channel|>")||y.includes('"operations"')||y.includes('"assistant_message"'),de&&k&&(k.innerHTML="")),Q(g),k&&de){let L=ie.match(/<message>([\s\S]*?)(<\/message>|$)/);if(L){let I=L[1].trim();I&&(q(k),k.innerHTML=Rs(I))}C&&ie.includes("<file ")&&q(C)}else k&&(q(k),k.innerHTML=Rs(ie));w()},onFile(_){if(F.push(_),C&&q(C),j){let y=F.length;j.textContent=`${y} file${y!==1?"s":""}`}if(T){let y=_.action==="delete",L=(F.length-1)*60,I=y?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';T.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${y?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${L}ms">
            <span class="vs-file-badge-icon">${I}</span>
            <span>${x(_.path)}</span>
          </div>
        `)}ue||(Se=!0),_.path.endsWith(".css")||(Se=!1),clearTimeout(ue),ue=setTimeout(()=>{$n(Se?"voxelsite:reload-css":"voxelsite:reload"),ue=null,Se=!0},600),w()},onDone(_){U=!0,clearTimeout(ue),ue=null,clearInterval(W),Q(g),Q(S);let y=_.files_modified||[],L=F.length>0||y.length>0;if(C&&L){Q(O),C.classList.add("vs-files-done"),A&&(A.textContent=_.partial?"Files updated (partial)":"Files updated");let D=document.createElement("div");D.className="vs-chat-action-row",D.innerHTML=`
          <button class="vs-btn vs-btn-ghost vs-btn-xs vs-chat-save-btn" title="Save current design to the library">
            ${E.save} Save to Designs
          </button>
        `,D.querySelector("button").addEventListener("click",()=>{cs()}),C.insertAdjacentElement("afterend",D)}else C&&!C.hasAttribute("hidden")&&(Q(O),Q(C));if(k)if(_.message)q(k),k.innerHTML=Rs(_.message);else if(de)Q(k);else{let D=k.textContent||"";(D.includes("<|channel|>")||D.includes('"operations"')||D.includes('"assistant_message"')||D.includes("<file ")||D.includes("<message>"))&&(Q(k),k.innerHTML="")}let I=_.missing_files||[];if((_.truncated||I.length>0)&&k){let D;I.length>0?D=`The following pages are linked in the navigation but were NOT created yet: ${I.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:D="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let Y=document.getElementById("prompt-input");Y&&!H.get("aiStreaming")&&(A&&(A.textContent="Generating remaining files..."),C&&(C.classList.remove("vs-files-done"),q(C)),Y.value=D,Y.dataset.actionType="free_prompt",Ns())},800)}if(_.conversation_id){H.set("activeConversationId",_.conversation_id);try{localStorage.setItem("vs-active-conversation",_.conversation_id)}catch{}}let R=[...F,...y];if(R.length>0){let D=R.map(J=>J.path||J),Y=D.some(J=>J==="index.php"),G=D.filter(J=>J.endsWith(".php")&&!J.includes("/")&&J!=="index.php"),V=Y&&G.length>0,ee;V?ee="index.php":G.length>0?ee=G[0]:ee=Y?"index.php":null,zt(ee),H.set("previewDirty",!0),nt({silent:!0})}Ao(),Uo(),ms(),o.removeEventListener("scroll",h),o.scrollTop=o.scrollHeight},onEvaluation(_){let y=(_==null?void 0:_.issues)||[];if(y.length===0)return;let L={error:0,warning:0,info:0};y.forEach(Z=>L[Z.severity]=(L[Z.severity]||0)+1);let I={error:0,warning:1,info:2},R=[...y].sort((Z,ve)=>(I[Z.severity]??3)-(I[ve.severity]??3)),D=R.filter(Z=>Z.severity!=="info"),Y=R.filter(Z=>Z.severity==="info"),G=[];L.error>0&&G.push(`${L.error} error${L.error!==1?"s":""}`),L.warning>0&&G.push(`${L.warning} warning${L.warning!==1?"s":""}`),L.info>0&&G.push(`${L.info} suggestion${L.info!==1?"s":""}`);let V=Z=>Z==="error"?"var(--vs-error, #ef4444)":Z==="warning"?"var(--vs-warning, #d97706)":"var(--vs-text-ghost)",ee=Z=>Z==="error"?"rgba(239,68,68,0.08)":Z==="warning"?"rgba(217,119,6,0.08)":"var(--vs-bg-raised)",J=Z=>{let ve=Z.file?` in ${Z.file}`:"",gt=Z.suggested_fix?`

Suggested approach: ${Z.suggested_fix}`:"";return`Review this suggestion and apply if appropriate \u2014 ${Z.severity}${ve}: ${Z.description}${gt}`},te=(Z,ve)=>`
        <div style="padding: 8px 12px; border-bottom: 1px solid var(--vs-border-subtle);">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 1px 5px; border-radius: 3px; color: ${V(Z.severity)}; background: ${ee(Z.severity)};">${x(Z.severity)}</span>
            <span style="font-size: 11px; color: var(--vs-text-ghost);">${x(Z.category||"")}</span>
            ${Z.file?`<span style="font-size: 11px; color: var(--vs-text-ghost); margin-left: auto; font-family: 'SF Mono', monospace; opacity: 0.7;">${x(Z.file)}${Z.line?":"+Z.line:""}</span>`:""}
          </div>
          <div style="font-size: 12px; color: var(--vs-text-secondary); line-height: 1.4;">${x(Z.description||"")}</div>
          ${Z.suggested_fix?`<div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 6px; line-height: 1.3;">\u{1F4A1} ${x(Z.suggested_fix)}</div>`:""}
          <div style="margin-top: 4px; text-align: right;">
            <button class="vs-eval-add-to-chat" data-eval-idx="${ve}" style="
              background: none; border: none; cursor: pointer; padding: 2px 0;
              font-size: 11px; color: var(--vs-accent); opacity: 0.7;
              transition: opacity 0.15s ease;
            " onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'">Add to chat \u2192</button>
          </div>
        </div>
      `,ae=D.map((Z,ve)=>te(Z,ve)).join(""),$e=Y.length>0?`
        <details style="border-top: 1px solid var(--vs-border-subtle);">
          <summary style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; cursor: pointer; user-select: none; font-size: 11px; color: var(--vs-text-ghost); list-style: none;">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            ${Y.length} additional suggestion${Y.length!==1?"s":""}
          </summary>
          ${Y.map((Z,ve)=>te(Z,D.length+ve)).join("")}
        </details>
      `:"",he=L.error>0?"error":L.warning>0?"warning":"info",be=V(he),Be=`
        <details class="vs-eval-details" style="margin-top: 8px; border: 1px solid ${he==="error"?"rgba(239,68,68,0.15)":he==="warning"?"rgba(217,119,6,0.15)":"var(--vs-border-subtle)"}; border-radius: var(--radius-md, 8px); overflow: hidden; background: var(--vs-bg-surface, var(--vs-bg-floating));">
          <summary style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; user-select: none; font-size: 12px; color: var(--vs-text-secondary); list-style: none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${be}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <span>Expert Review \xB7 ${G.join(", ")}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: auto; opacity: 0.4; flex-shrink: 0; transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>
          <div style="border-top: 1px solid var(--vs-border-subtle);">
            <div style="padding: 6px 12px; font-size: 10px; color: var(--vs-text-ghost); border-bottom: 1px solid var(--vs-border-subtle); line-height: 1.4;">These are heuristic suggestions \u2014 verify before applying.</div>
            ${ae}
            ${$e}
          </div>
        </details>
      `,ne;C&&!C.hasAttribute("hidden")?(C.insertAdjacentHTML("afterend",Be),ne=C.nextElementSibling):k?(k.insertAdjacentHTML("afterend",Be),ne=k.nextElementSibling):(f.insertAdjacentHTML("beforeend",Be),ne=f.lastElementChild),ne&&ne.addEventListener("click",Z=>{let ve=Z.target.closest(".vs-eval-add-to-chat");if(!ve)return;Z.preventDefault();let gt=parseInt(ve.dataset.evalIdx,10),ht=R[gt];if(!ht)return;let Pe=document.getElementById("prompt-input");if(!Pe)return;let Ft=J(ht),Ot=Pe.value.trim();Pe.value=Ot?Ot+`

`+Ft:Ft,Pe.focus(),Pe.style.height="auto",Pe.style.height=Math.min(Pe.scrollHeight,200)+"px",Pe.selectionStart=Pe.selectionEnd=Pe.value.length,ve.textContent="\u2713 Added",ve.style.opacity="1",setTimeout(()=>{ve.textContent="Add to chat \u2192",ve.style.opacity="0.7"},1500)}),w()},onWarning(_){_.toLowerCase().includes("truncat")||T&&(T.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${x(_)}</div>
        `)},onError(_){clearTimeout(ue),ue=null,clearInterval(W),Q(g),Q(S),X&&(X.textContent=_.message||"Something went wrong.",q(X)),Ao(),O&&Q(O),C&&F.length>0&&(C.classList.add("vs-files-done"),A&&(A.textContent="Files updated (partial)"))}}),H.set("aiStreaming",!1),document.body.classList.remove("vs-ai-streaming"),se&&(se.disabled=!1,se.classList.remove("opacity-50"))}function jo(){var v;Fo.innerHTML=`
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
            <h1 class="vs-login-title">${st?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${st?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${st?`
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
                ${st?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${st?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${st?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${E.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${st?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${st?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
        ${(H.get("theme")||"light")==="light"?E.sun:E.moon}
      </button>
    </div>
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let d=e.type==="password";e.type=d?"text":"password",t.innerHTML=d?E.eyeOff:E.eye,t.title=d?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let d=ks();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=d==="light"?E.sun:E.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(d=>{d.addEventListener("click",()=>{let u=document.getElementById(d.dataset.toggleTarget);if(!u)return;let m=u.type==="password";u.type=m?"text":"password",d.innerHTML=m?E.eyeOff:E.eye,d.title=m?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),r=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var u,m,h;o.classList.add("hidden"),i.classList.remove("hidden");let d=document.getElementById("forgot-content");try{let f=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((u=f==null?void 0:f.data)==null?void 0:u.mode)||"file")==="email"?(d.innerHTML=`
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
          `,(m=document.getElementById("forgot-form"))==null||m.addEventListener("submit",async S=>{var j,O,X;S.preventDefault();let k=document.getElementById("forgot-message"),C=document.getElementById("forgot-email"),T=S.target.querySelector('button[type="submit"]'),A=(j=C==null?void 0:C.value)==null?void 0:j.trim();if(A){T&&(T.disabled=!0,T.textContent="Sending...");try{let q=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:A})})).json();k&&(q.ok?(k.textContent=((O=q.data)==null?void 0:O.message)||"Recovery link sent. Check your inbox.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",C&&(C.value="")):(k.textContent=((X=q.error)==null?void 0:X.message)||"Failed to send recovery email.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),k.classList.remove("hidden"))}catch{k&&(k.textContent="Network error. Please try again.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",k.classList.remove("hidden"))}finally{T&&(T.disabled=!1,T.textContent="Send Recovery Link")}}})):(d.innerHTML=`
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
          `,n(),(h=document.getElementById("forgot-form"))==null||h.addEventListener("submit",async S=>{var j,O,X;S.preventDefault();let k=document.getElementById("forgot-message"),C=(j=document.getElementById("forgot-email"))==null?void 0:j.value,T=(O=document.getElementById("forgot-new-password"))==null?void 0:O.value;if(!C||!T)return;let A=await B.post("/auth/reset-password",{email:C,new_password:T});A.ok?(k&&(k.textContent="Password reset. You can now sign in with your new password.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",k.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):k&&(k.textContent=((X=A.error)==null?void 0:X.message)||"Reset failed. Make sure the .reset file exists in _data/.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",k.classList.remove("hidden"))}))}catch{d.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),r&&r.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let p=new URLSearchParams(window.location.search).get("reset");if(p&&p.length===64&&i&&o){let d=window.location.pathname+window.location.hash;window.history.replaceState(null,"",d),o.classList.add("hidden"),i.classList.remove("hidden");let u=document.getElementById("forgot-content");u&&(u.innerHTML=`
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
      `,n(),(v=document.getElementById("token-reset-form"))==null||v.addEventListener("submit",async m=>{var S,k,C,T;m.preventDefault();let h=document.getElementById("forgot-message"),w=(S=document.getElementById("token-new-password"))==null?void 0:S.value,f=(k=document.getElementById("token-confirm-password"))==null?void 0:k.value,g=m.target.querySelector('button[type="submit"]');if(!w||w.length<8){h&&(h.textContent="Password must be at least 8 characters.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"));return}if(w!==f){h&&(h.textContent="Passwords do not match.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"));return}g&&(g.disabled=!0,g.textContent="Resetting...");try{let j=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:p,new_password:w})})).json();h&&(j.ok?(h.textContent=((C=j.data)==null?void 0:C.message)||"Password reset. You can now sign in.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",h.classList.remove("hidden"),m.target.querySelectorAll("input").forEach(O=>O.disabled=!0),g&&(g.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(h.textContent=((T=j.error)==null?void 0:T.message)||"Reset failed. The link may have expired.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden")))}catch{h&&(h.textContent="Network error. Please try again.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"))}finally{g&&(g.disabled=!1,g.textContent="Reset Password")}}))}let c=document.getElementById("login-form");c&&c.addEventListener("submit",async d=>{var f,g,S,k;d.preventDefault();let u=(f=document.getElementById("login-email"))==null?void 0:f.value,m=(g=document.getElementById("login-password"))==null?void 0:g.value,h=document.getElementById("login-error");if(!u||!m)return;let w=await B.post("/auth/login",{email:u,password:m});w.ok&&((S=w.data)!=null&&S.token)?(H.batch(()=>{H.set("user",w.data.user),H.set("sessionToken",w.data.token)}),Oo()):h&&(h.textContent=((k=w.error)==null?void 0:k.message)||"Invalid email or password.",h.classList.remove("hidden"))}),ms()}function Ps(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function Rs(e){if(!e)return"";if(!window.marked)return x(e);let t=window.marked.parse(e);return $r(t)}function $r(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),r=a?a.split(`
`):[];if(r.length<=Ha)return;let l=r.slice(0,Da).join(`
`)+`
...`,p=document.createElement("div");p.className="vs-code-collapse",p.setAttribute("data-code-collapse","1");let c=document.createElement("pre");c.className="vs-code-collapse-preview",c.setAttribute("data-code-preview","1");let v=document.createElement("code");o!=null&&o.className&&(v.className=o.className),v.textContent=l,c.appendChild(v),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let d=document.createElement("button");d.type="button",d.className="vs-code-collapse-toggle",d.setAttribute("data-code-toggle","1"),d.setAttribute("data-lines",String(r.length)),d.setAttribute("aria-expanded","false"),d.textContent=`More (${r.length} lines)`;let u=n.parentNode;u&&(u.replaceChild(p,n),p.appendChild(c),p.appendChild(n),p.appendChild(d))}),t.innerHTML}function Cr(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Oo();})();
