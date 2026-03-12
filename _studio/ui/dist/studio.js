(()=>{var wn=e=>{throw TypeError(e)};var Ps=(e,t,s)=>t.has(e)||wn("Cannot "+s);var ie=(e,t,s)=>(Ps(e,t,"read from private field"),s?s.call(e):t.get(e)),Ie=(e,t,s)=>t.has(e)?wn("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),qe=(e,t,s,n)=>(Ps(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),Ke=(e,t,s)=>(Ps(e,t,"access private method"),s);var Ye,Ze,ut,Je,qt,Hs,js=class{constructor(t={}){Ie(this,qt);Ie(this,Ye,new Map);Ie(this,Ze,new Map);Ie(this,ut,!1);Ie(this,Je,new Map);for(let[s,n]of Object.entries(t))ie(this,Ye).set(s,n)}get(t,s=void 0){return ie(this,Ye).has(t)?ie(this,Ye).get(t):s}set(t,s){let n=ie(this,Ye).get(t);n!==s&&(ie(this,Ye).set(t,s),ie(this,ut)?ie(this,Je).has(t)?ie(this,Je).get(t).newValue=s:ie(this,Je).set(t,{newValue:s,oldValue:n}):Ke(this,qt,Hs).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return ie(this,Ze).has(t)||ie(this,Ze).set(t,new Set),ie(this,Ze).get(t).add(s),()=>{var n;(n=ie(this,Ze).get(t))==null||n.delete(s)}}batch(t){if(ie(this,ut)){t();return}qe(this,ut,!0),ie(this,Je).clear();try{t()}finally{qe(this,ut,!1);for(let[s,{newValue:n,oldValue:o}]of ie(this,Je))Ke(this,qt,Hs).call(this,s,n,o);ie(this,Je).clear()}}toJSON(){return Object.fromEntries(ie(this,Ye))}};Ye=new WeakMap,Ze=new WeakMap,ut=new WeakMap,Je=new WeakMap,qt=new WeakSet,Hs=function(t,s,n){let o=ie(this,Ze).get(t);if(o)for(let a of o)try{a(s,n)}catch(l){console.error(`[state] Error in "${t}" listener:`,l)}let i=ie(this,Ze).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(l){console.error("[state] Error in wildcard listener:",l)}};var H=new js({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});H.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});H.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Nt,Et,$t,Ct,Lt,St,Xe,ds,Ds,Rs=class{constructor(){Ie(this,Xe);Ie(this,Nt,[]);Ie(this,Et,null);Ie(this,$t,!1);Ie(this,Ct,null);Ie(this,Lt,null);Ie(this,St,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return ie(this,Nt).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return qe(this,Et,t),this}beforeEach(t){return qe(this,Ct,t),this}start(){ie(this,$t)||(qe(this,$t,!0),window.addEventListener("hashchange",()=>Ke(this,Xe,ds).call(this)),Ke(this,Xe,ds).call(this))}navigate(t){window.location.hash=`/${t}`}refresh(){qe(this,Lt,null),Ke(this,Xe,ds).call(this)}get current(){return Ke(this,Xe,Ds).call(this)}};Nt=new WeakMap,Et=new WeakMap,$t=new WeakMap,Ct=new WeakMap,Lt=new WeakMap,St=new WeakMap,Xe=new WeakSet,ds=async function(){if(ie(this,St))return;let t=Ke(this,Xe,Ds).call(this),s=ie(this,Lt);if(!(t===s&&ie(this,$t))){if(ie(this,Ct)&&s!==null){qe(this,St,!0);try{if(await ie(this,Ct).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{qe(this,St,!1)}}qe(this,Lt,t);for(let n of ie(this,Nt)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,l)=>{i[a]=decodeURIComponent(o[l+1])}),H.batch(()=>{H.set("route",n.pattern),H.set("routeParams",i)}),n.handler(i);return}}ie(this,Et)?(H.set("route","404"),ie(this,Et).call(this,t)):this.navigate("chat")}},Ds=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var Pe=new Rs;var En="/_studio/api/router.php";async function cs(e,t,s=null,n={}){let o={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let a=$n();a&&(o["X-VS-Token"]=a)}s!==null&&(o["Content-Type"]="application/json");let i={method:e,headers:o,credentials:"same-origin",...n};s!==null&&(i.body=JSON.stringify(s));try{let[a,l]=t.split("?"),r=`${En}?_path=${encodeURIComponent(a)}${l?"&"+l:""}`,p=await fetch(r,i),c=await p.json();return p.status===401?(H.get("user")&&H.set("user",null),c!=null&&c.error?{ok:!1,error:c.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!c.ok&&c.error?(c.error.code==="demo_mode"&&window.showToast&&window.showToast(c.error.message||"Demo mode \u2014 this action is disabled.","warning"),{ok:!1,error:c.error}):{ok:!0,data:c.data||c}}catch{return{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var L={get:(e,t)=>cs("GET",e,null,t),post:(e,t,s)=>cs("POST",e,t,s),put:(e,t,s)=>cs("PUT",e,t,s),delete:(e,t,s)=>cs("DELETE",e,t,s)};async function mt(e,t,s={}){var y,g;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onFile:a=()=>{},onDone:l=()=>{},onWarning:r=()=>{},onError:p=()=>{},signal:c=null}=s,v=$n(),d={"Content-Type":"application/json",Accept:"text/event-stream"};v&&(d["X-VS-Token"]=v);let u=!1,m=0,h=0,b=t.conversation_id||null;try{let V=function(T){if(!T.trim())return;let J="";for(let A of T.split(`
`))A.startsWith(":")||A.startsWith("data: ")&&(J+=A.slice(6));if(!J)return;let X;try{X=JSON.parse(J)}catch{return}switch(X.type||"message"){case"token":h++,n(X.content||"");break;case"status":o(X.message||"");break;case"conversation":b=X.conversation_id||b,i(X.conversation_id||"");break;case"file_complete":m++,a(X);break;case"done":u=!0,l(X);break;case"warning":r(X.message||"");break;case"error":p(X);break}},C={method:"POST",headers:d,credentials:"same-origin",body:JSON.stringify(t)};c&&(C.signal=c);let[$,S]=e.split("?"),B=`${En}?_path=${encodeURIComponent($)}${S?"&"+S:""}`,D=await fetch(B,C);if(!D.ok){let T=await D.json().catch(()=>null);p({code:((y=T==null?void 0:T.error)==null?void 0:y.code)||"http_error",message:((g=T==null?void 0:T.error)==null?void 0:g.message)||`Server error (${D.status})`});return}let R=D.body.getReader(),O=new TextDecoder,K="";for(;;){let{done:T,value:J}=await R.read();if(T)break;K+=O.decode(J,{stream:!0});let X=K.split(`

`);K=X.pop();for(let E of X)V(E)}if(K.trim()&&V(K),!u){let T=b;T?(o("Waiting for server to finish..."),await kn(T,{onDone:l,onError:p,onFile:a,onStatus:o})):(m>0||h>0)&&l({files_modified:[],message:"",soft_close:!0})}}catch(C){if(C.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(m>0||h>0){let $=b;$?(o("Server is still generating \u2014 waiting for completion..."),await kn($,{onDone:l,onError:p,onFile:a,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else p({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function kn(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var l;let a=0;for(let r=0;r<120;r++){await new Promise(p=>setTimeout(p,3e3));try{let{ok:p,data:c}=await L.get(`/ai/conversations/${e}`);if(!p||!((l=c==null?void 0:c.conversation)!=null&&l.prompts))continue;let v=c.conversation.prompts,d=v[v.length-1];if(!d)continue;let u=d.files_modified?JSON.parse(d.files_modified):[];if(u.length>a){for(let m=a;m<u.length;m++)n({path:u[m],action:"write"});a=u.length}if(d.status==="streaming"){let m=Math.round((Date.now()-new Date(d.created_at).getTime())/1e3);o(`Server is still generating... (${m}s)`);continue}d.status==="success"?t({message:d.ai_message||"",files_modified:u,revision_id:d.revision_id||null,polled:!0}):d.status==="partial"?t({message:d.ai_message||"",files_modified:u,partial:!0,polled:!0}):s({code:"generation_failed",message:d.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function $n(){return H.get("sessionToken")}var Oo="data-theme",qs="dark";function Cn(){let e=H.get("theme")||localStorage.getItem("vs-theme")||qs;return Ln(e),e}function Ln(e){let t=e||qs;return document.documentElement.setAttribute(Oo,t),localStorage.setItem("vs-theme",t),H.set("theme",t),t}function ps(){let e=H.get("theme")||qs;return Ln(e==="dark"?"light":"dark")}var Sn=typeof document<"u"?document.createElement("span"):null;function x(e){return e?(Sn.textContent=e,Sn.innerHTML):""}function le(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var Uo={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function Ft(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(Uo))if(t.endsWith(s))return n;return"plaintext"}function Ns(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function Fs(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),l=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:l===1?"Yesterday":l<30?`${l} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function zt(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function Ot(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function de(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function ce(e,t){let s=null;e.addEventListener("mousedown",n=>{s=n.target}),e.addEventListener("click",n=>{n.target===e&&s===e&&t(n)})}function pe({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var c,v;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let l=document.createElement("div");l.id="vs-confirm-overlay",l.className="vs-modal-overlay",l.innerHTML=`
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
    `;let r=d=>{d.key==="Escape"&&(d.preventDefault(),p(!1))},p=d=>{document.removeEventListener("keydown",r),de(l),i(d)};document.body.appendChild(l),requestAnimationFrame(()=>l.classList.add("is-visible")),ce(l,()=>p(!1)),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>p(!1)),(v=document.getElementById("vs-confirm-ok"))==null||v.addEventListener("click",()=>p(!0)),document.addEventListener("keydown",r),setTimeout(()=>{var d;return(d=document.getElementById("vs-confirm-ok"))==null?void 0:d.focus()},220)})}function zs({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:l="",inputPattern:r=""}){return new Promise(p=>{var b,y;let c=document.getElementById("vs-prompt-overlay");c&&c.remove();let v=document.createElement("div");v.id="vs-prompt-overlay",v.className="vs-modal-overlay";let d=r?` pattern="${x(r)}"`:"",u=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${x(n)}" style="resize: vertical;">${x(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${x(n)}" value="${x(o)}"${d}>`;v.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${x(e)}</h2>
          ${t?`<p class="vs-modal-desc">${x(t)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${x(s)}</label>`:""}
          ${u}
          ${l?`<p class="text-xs text-vs-text-ghost" style="margin-top: 6px;">${x(l)}</p>`:""}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${x(i)}</button>
        </div>
      </div>
    `;let m=g=>{de(v),p(g)};document.body.appendChild(v),requestAnimationFrame(()=>v.classList.add("is-visible"));let h=v.querySelector("#vs-prompt-input");setTimeout(()=>h==null?void 0:h.focus(),220),ce(v,()=>m(null)),(b=v.querySelector("#vs-prompt-cancel"))==null||b.addEventListener("click",()=>m(null)),(y=v.querySelector("#vs-prompt-ok"))==null||y.addEventListener("click",()=>{m(((h==null?void 0:h.value)||"").trim())}),h==null||h.addEventListener("keydown",g=>{a==="textarea"?g.key==="Enter"&&(g.metaKey||g.ctrlKey)&&(g.preventDefault(),m(((h==null?void 0:h.value)||"").trim())):g.key==="Enter"&&(g.preventDefault(),m(((h==null?void 0:h.value)||"").trim())),g.key==="Escape"&&(g.preventDefault(),m(null))})})}var Ue=!1,vs=null,gt=[],Os=!1,Bn=!1,he={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function Zs(){Ue=!Ue,Fn(),ne({type:"vx-editor:toggle",active:Ue}),Ue||(Ne(),Xs(),We(),ht(),vs=null,wt=!1)}function Ut(){return Ue}function Vt(){Ue&&(Ue=!1,Fn(),ne({type:"vx-editor:toggle",active:!1}),Ne(),Xs(),We(),ht(),vs=null,wt=!1)}function _n(){if(Bn)return;Bn=!0,window.addEventListener("message",Vo);let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{wt&&Pn()})}function Vo(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":vs=e.data,Jo(e.data);break;case"vx-editor:text-changed":Ks(e.data);break;case"vx-editor:image-changed":Si(e.data);break;case"vx-editor:element-deleted":Ys(e.data);break;case"vx-editor:deselect":Ne(),Xs(),We(),vs=null;break;case"vx-editor:save-request":Wt();break;case"vx-editor:editing-started":Wo(e.data);break;case"vx-editor:editing-ended":Pn();break;case"vx-editor:selection-state":Go(e.data);break;case"vx-editor:element-rect":Ko(e.data);break;case"vx-editor:richtext-link-request":Dn();break;case"vx-editor:add-section-request":ki(e.data);break;case"vx-editor:section-moved":Mi(e.data);break}}var wt=!1,Js=!1,at=null,Bt={},Vs="P";function Wo(e){wt=!0,Js=!!e.hasPhp,at=e.rect||null,Bt={},Vs=e.tagName||"P",Ne(),Yo()}function Pn(){wt=!1,Js=!1,at=null,Bt={},Rn()}function Go(e){if(wt){if(e.elementRect&&(at=e.elementRect,jn()),!e.hasSelection){Bt={},Mn();return}Bt=e.formatting||{},Vs=e.blockTag||Vs,Mn()}}function Ko(e){wt&&e.rect&&(at=e.rect,jn())}function jn(){let e=document.getElementById("vx-richtext-toolbar");e&&Hn(e)}function Yo(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),Hn(e),Zo(e),e.classList.add("vx-rt-visible")}function Hn(e){if(!at)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+at.left,o=s.top+at.top,i=at.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function Zo(e){let t=Bt,s=Js;e.innerHTML=`<div class="vx-rt-actions">
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
  </div>`,e.querySelectorAll("[data-cmd]").forEach(i=>{i.addEventListener("click",a=>{a.stopPropagation();let l=i.dataset.cmd;if(l==="insertLink"){Dn();return}ne({type:"vx-editor:richtext-command",command:l})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",i=>{i.stopPropagation(),ne({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",i=>{i.stopPropagation(),ne({type:"vx-editor:save-edit"})})}function Mn(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=Bt,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function Rn(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function Xs(){Rn()}function Dn(){let e=prompt("Enter URL:");if(e!==null){let t=e.trim();ne(t?{type:"vx-editor:richtext-command",command:"insertLink",value:t}:{type:"vx-editor:richtext-command",command:"removeLink"})}}function Jo(e){let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,hasImage:i}=e,a=document.getElementById("preview-iframe");if(!a)return;let l=a.getBoundingClientRect();t.style.left=`${l.left+n.left+n.width/2}px`,t.style.top=`${l.top+n.top-8}px`,t.style.transform="translate(-50%, -100%)";let r="";o&&(r+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
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
      <span>AI</span></button>`;let p=ms(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${p}</div><div class="vx-tb-actions">${r}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(c=>{c.addEventListener("click",v=>{v.stopPropagation(),Xo(c.dataset.action,e)})})}function Ne(){let e=document.getElementById("vx-context-toolbar");e&&e.classList.remove("vx-tb-visible")}function ms(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function Xo(e,t){switch(e){case"edit-text":ne({type:"vx-editor:start-edit",mode:"text"}),Ne();break;case"swap-image":$i(t);break;case"edit-style":ei(t);break;case"edit-link":Li(t);break;case"delete":Qo(t);break;case"ask-ai":wi(t);break}}function Qo(e){Ne();let t=ms(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${Tt(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>n.remove(),200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),ce(n,o),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{ne({type:"vx-editor:delete-element"}),o()})}var Ee=new Set,ft="",Ve=null,gs="text",Qe="padding",st="all",bt="all",et="tl",yt="",rt=!1;function We({revertUnsaved:e=!0}={}){e&&rt&&ft&&(ne({type:"vx-editor:update-classes",classes:ft.split(" ").filter(Boolean),silent:!0}),Ee=new Set(ft.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>t.remove(),200)),rt=!1,Ve=null,gs="text",Qe="padding",st="all",bt="all",et="tl",yt=""}function ei(e){Ne(),We();let t=(e.classList||[]).filter(o=>o.trim());Ee=new Set(t),ft=t.join(" "),rt=!1,Ve=null,gs=Ai(t),Qe="padding",st="all",bt="all",et="tl",yt="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${ms(e.tagName,t)}</span>
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
      ${Ws()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),us(s),s.__vxOnResize=()=>us(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=Nn(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),Ve=null,Ae(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>We()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),We())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{Ee=new Set(ft.split(" ").filter(Boolean)),rt=!1,ne({type:"vx-editor:update-classes",classes:[...Ee],silent:!0}),Ae(Gs())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>xi(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(yt=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=Ws(),Ae(Gs()))}),Ae("typography")}function Ws(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=yt===t.id,n=t.id?[...Ee].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function Gs(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function Ae(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:ti,spacing:si,colors:ni,layout:oi,borders:ii,effects:ai,classes:ri};t.innerHTML=(s[e]||s.classes)(),yi(t)}function ti(){let e=ue(/^font-(sans|serif|mono)$/)||"",t=ue(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=ue(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=ue(/^text-(left|center|right|justify)$/)||"text-left",o=ue(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=ue(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=ue(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",l=ue(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ke("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${ke("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,he.sizes.map(r=>({label:r,value:`text-${r}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ke("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,he.weights.map(r=>({label:r,value:`font-${r}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${li(he.aligns.map(r=>({value:`text-${r}`,label:r,icon:gi(r)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${ke("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,he.leadings.map(r=>({label:r,value:`leading-${r}`})))}
        ${ke("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,he.trackings.map(r=>({label:r,value:`tracking-${r}`})))}
        ${ke("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,he.transforms.map(r=>({label:r,value:r})))}
        ${ke("Decoration","^(no-underline|underline|line-through)$",l,he.decorations.map(r=>({label:r,value:r})))}
      </div>
    </div>
  `}function si(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[Qe]||(Qe="padding"),e[Qe].prefixes[st]||(st="all");let t=e[Qe],s=t.prefixes[st],n=pi(s),o=ui(s)||"",i=Qe==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${qn(Object.keys(e).map(a=>({value:a,label:e[a].label})),Qe,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${st===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Tn(a)}">
            ${mi(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${Tn(st)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${he.compactSpacings.map(a=>{let l=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${xt(l)?" vx-sp-pill-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${xt(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function ni(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=gs||"text",s=t,n=vi(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${he.specialColors.map(a=>{let l=`${s}-${a.name}`,r=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,p=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${xt(l)?" vx-sp-dot-active":""}" data-set="${l}" data-pattern="${n}" style="${r}${p}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=Ve?he.colors.find(a=>a.name===Ve):null;return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-stage">
      ${i?`
        <div class="vx-shade-stage-header">
          <button class="vx-shade-back" data-family-back>&larr; Colors</button>
          <span class="vx-shade-title">${i.name}</span>
        </div>
        <div class="vx-shade-grid">${Object.entries(i.shades).map(([a,l])=>{let r=`${s}-${i.name}-${a}`;return`<button class="vx-sp-shade${xt(r)?" vx-sp-shade-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false" style="background:${l}" title="${a}"><span class="vx-sp-shade-num">${a}</span></button>`}).join("")}</div>
      `:`
        <div class="vx-sp-color-families">${he.colors.map(a=>{let l=Ve===a.name,r=ue(new RegExp(`^${s}-${a.name}-\\d+$`));return`<button class="vx-sp-color-family${l?" vx-sp-fam-active":""}${r?" vx-sp-fam-used":""}" data-family="${a.name}" style="background:${a.shades[500]}" title="${a.name}"></button>`}).join("")}</div>
      `}
    </div>
  </div>`,o}function oi(){let e=ci(),t=ue(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=ue(/^gap(?:-[xy])?-/)||"",a=ue(/^grid-cols-\d+$/)||"",l=ue(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${di(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${ke("Direction","^flex-(row|col|row-reverse|col-reverse)$",ue(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${ke("Justify","^justify-(start|center|end|between|around|evenly)$",ue(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${ke("Align","^items-(start|center|end|stretch|baseline)$",ue(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${ke("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...he.gaps.map(r=>({label:r,value:`gap-${r}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${ke("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...he.gridCols.map(r=>({label:r,value:`grid-cols-${r}`}))])}
          ${ke("Rows","^grid-rows-\\d+$",l,[{label:"Auto",value:""},...he.gridRows.map(r=>({label:r,value:`grid-rows-${r}`}))])}
          ${ke("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...he.gaps.slice(1).map(r=>({label:r,value:`gap-${r}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${ke("Position","^(static|relative|absolute|fixed|sticky)$",t,he.positions.map(r=>({label:r,value:r})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${ke("Top","^top-",ue(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",he.coordinates.map(r=>({label:r,value:`top-${r}`})))}
          ${ke("Right","^right-",ue(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",he.coordinates.map(r=>({label:r,value:`right-${r}`})))}
          ${ke("Bottom","^bottom-",ue(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",he.coordinates.map(r=>({label:r,value:`bottom-${r}`})))}
          ${ke("Left","^left-",ue(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",he.coordinates.map(r=>({label:r,value:`left-${r}`})))}
        </div>
      </div>
    `:""}
  `}function ii(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=bt==="all"?"all":et;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${he.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${xt(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${ke("Style","^border-(solid|dashed|dotted|double|none)$",ue(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...he.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${qn([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],bt==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${et==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${et==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${et==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${et==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${bt==="all"?"ALL":et.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${he.radii.map(s=>{let n=hi(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${xt(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${fi(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function ai(){let e=bi();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${xt(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function ri(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...Ee].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function ke(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${Mt(o.value)}"${s===o.value?" selected":""}>${Tt(o.label)}</option>`).join("")}
    </select>
  </div>`}function qn(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${Tt(i.label)}</button>`).join("")}
  </div>`}function li(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${Mt(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function di(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function ci(){let e=ue(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function pi(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function vi(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function ui(e){let t=ue(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function Tn(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function mi(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function gi(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function hi(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function fi(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function bi(){let e=ue(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function xt(e){let t=yt;return Ee.has(t?t+":"+e:e)}function Us(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=yt,i=o?o+":":"",a=t?new RegExp(t):null,l=e?i+e:"",r=!!l&&Ee.has(l);if(a)for(let c of[...Ee])if(o){if(c.startsWith(i)){let v=c.slice(i.length);a.test(v)&&Ee.delete(c)}}else!/^(sm|md|lg|xl|2xl):/.test(c)&&a.test(c)&&Ee.delete(c);l&&(!s||!r)&&Ee.add(l),rt=!0,ne({type:"vx-editor:update-classes",classes:[...Ee],silent:!0});let p=document.getElementById("vx-sp-breakpoints");p&&(p.innerHTML=Ws()),n&&Ae(Gs())}function ue(e){let t=yt;for(let s of Ee)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function yi(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";Us(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";Us(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{Ve=Ve===n.dataset.family?null:n.dataset.family,Ae("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{Ve=null,Ae("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{gs=n.dataset.cprop||"text",Ve=null,Ae("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Qe=n.dataset.spaceMode||"padding",st="all",Ae("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{st=n.dataset.spaceSide||"all",Ae("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{bt=n.dataset.radiusMode==="corners"?"corners":"all",Ae("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{et=n.dataset.radiusCorner||"tl",bt="corners",Ae("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");Us(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>Ae("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{Ee.add(i)}),rt=!0,ne({type:"vx-editor:update-classes",classes:[...Ee],silent:!0}),s.value="",Ae("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;Ee.delete(i),rt=!0,ne({type:"vx-editor:update-classes",classes:[...Ee],silent:!0}),o.remove()}}})}async function xi(e){let t=[...Ee].join(" ");if(t===ft){We({revertUnsaved:!1});return}gt.push({type:"text",filePath:e.filePath,originalHTML:`class="${ft}"`,newHTML:`class="${t}"`,timestamp:Date.now()}),rt=!1,We({revertUnsaved:!1}),ae("Saving & compiling\u2026"),await Wt(),ne({type:"vx-editor:update-classes",classes:[...Ee],silent:!0}),setTimeout(()=>{let s=document.getElementById("preview-iframe");s&&s.contentWindow&&s.contentWindow.postMessage("voxelsite:reload","*")},500)}function Nn(e,t){let s=!1,n,o,i,a,l=!1,r=v=>{if(v.target.closest("button, input, select"))return;s=!0;let d=v.touches?v.touches[0]:v;n=d.clientX,o=d.clientY;let u=e.getBoundingClientRect();i=u.left,a=u.top,t.style.cursor="grabbing",v.preventDefault(),l||(l=!0,document.addEventListener("mousemove",p),document.addEventListener("touchmove",p,{passive:!1}),document.addEventListener("mouseup",c),document.addEventListener("touchend",c))},p=v=>{if(!s)return;let d=v.touches?v.touches[0]:v,u=12,m=e.getBoundingClientRect(),h=m.width||300,b=m.height||500,y=i+d.clientX-n,g=a+d.clientY-o,C=u,$=Math.max(u,window.innerWidth-h-u),S=52,B=Math.max(S,window.innerHeight-b-u),D=Math.min(Math.max(y,C),$),R=Math.min(Math.max(g,S),B);e.style.left=`${D}px`,e.style.top=`${R}px`,e.style.right="auto"},c=()=>{s&&(s=!1,t.style.cursor="",l&&(l=!1,document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c)))};return t.addEventListener("mousedown",r),t.addEventListener("touchstart",r,{passive:!1}),()=>{t.removeEventListener("mousedown",r),t.removeEventListener("touchstart",r),l&&(document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c))}}var tt=null;function ht(){let e=document.getElementById("vx-ai-panel");e&&(tt&&(tt.abort(),tt=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>e.remove(),180))}function wi(e){Ne(),We(),ht();let t=ms(e.tagName,e.classList),s=(e.text||"").substring(0,80).replace(/\s+/g," ").trim(),n=document.createElement("div");n.id="vx-ai-panel",n.className="vx-ai-panel",n.tabIndex=-1,n.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${Tt(t)}</span>
      </div>
      <div class="vx-ai-header-right">
        <span class="vx-sp-drag-hint">\u22EE\u22EE</span>
        <button class="vx-sp-close" id="vx-ai-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    ${s?`<div class="vx-ai-preview">${Tt(s.length>=78?s+"\u2026":s)}</div>`:""}
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
    </div>`,document.body.appendChild(n),us(n),n.__vxOnResize=()=>us(n),window.addEventListener("resize",n.__vxOnResize),requestAnimationFrame(()=>n.classList.add("vx-ai-visible")),n.__vxDestroyDrag=Nn(n,n.querySelector("#vx-ai-drag-handle"));let o=n.querySelector("#vx-ai-input"),i=n.querySelector("#vx-ai-send"),a=n.querySelector("#vx-ai-cancel-btn"),l=n.querySelector("#vx-ai-status"),r=n.querySelector("#vx-ai-status-text"),p=n.querySelector("#vx-ai-close");setTimeout(()=>o==null?void 0:o.focus(),200),p.addEventListener("click",()=>ht()),n.addEventListener("keydown",u=>{u.key==="Escape"&&(u.preventDefault(),ht())}),o.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),d())}),i.addEventListener("click",d),a.addEventListener("click",()=>{tt&&(tt.abort(),tt=null),v()});function c(){o.disabled=!0,i.hidden=!0,a.hidden=!1,l.hidden=!1,r.textContent="Reading your site\u2026"}function v(){o.disabled=!1,i.hidden=!1,a.hidden=!0,l.hidden=!0,o.focus()}async function d(){let u=o.value.trim();if(!u)return;ht(),ne({type:"vx-editor:show-ai-overlay",status:"AI is editing\u2026"}),tt=new AbortController;let m=e.outerHTML||"",h=e.filePath||Gt();try{await mt("/ai/prompt",{user_prompt:u,action_type:"section_edit",page_scope:h,action_data:{path:h,sectionHtml:m.substring(0,15e3)}},{signal:tt.signal,onStatus(b){ne({type:"vx-editor:update-ai-status",status:b||"Working\u2026"})},onFile(){ne({type:"vx-editor:update-ai-status",status:"Applying changes\u2026"})},onToken(){ne({type:"vx-editor:update-ai-status",status:"Generating\u2026"})},onError(b){ne({type:"vx-editor:hide-ai-overlay"}),ae(b.message||"AI edit failed",!0)},onDone(b){if(tt=null,ne({type:"vx-editor:hide-ai-overlay"}),b.cancelled){ae("Generation cancelled",!1);return}(b.files_modified||[]).length>0?(ae("Section updated \u2713"),setTimeout(()=>{let g=document.getElementById("preview-iframe");g!=null&&g.contentWindow&&g.contentWindow.postMessage("voxelsite:reload","*")},400)):b.partial||ae("No changes made",!1)},onWarning(b){typeof window.showToast=="function"&&window.showToast(b,"warning")}})}catch(b){b.name!=="AbortError"&&ae("AI edit failed",!0),ne({type:"vx-editor:hide-ai-overlay"})}}}var In=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function ki(e){Ne(),We(),ht();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let y of In)(t.includes(y.id)||t.includes(y.label.toLowerCase()))&&s.add(y.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${Tt(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${In.map(y=>{let g=s.has(y.id);return`
            <button class="vx-section-card${g?" vx-section-card-exists":""}" data-section-type="${y.id}" data-section-label="${Mt(y.label)}" data-section-desc="${Mt(y.description)}">
              <div class="vx-section-card-icon">${y.icon}</div>
              <div class="vx-section-card-label">${y.label}</div>
              <div class="vx-section-card-desc">${y.description}</div>
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>n.remove(),200)},a=y=>{y.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),ce(n,i),n.tabIndex=-1,n.focus();let l=null,r=null,p=n.querySelector("#vx-section-footer"),c=n.querySelector("#vx-section-footer-type"),v=n.querySelector("#vx-section-instruction"),d=n.querySelector("#vx-section-generate"),u=n.querySelector("#vx-section-change"),m=n.querySelector(".vx-section-picker-grid"),h={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(y=>{y.addEventListener("click",()=>{l=y.dataset.sectionLabel,r=y.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(g=>g.classList.remove("vx-section-card-selected")),y.classList.add("vx-section-card-selected"),c.textContent=l,v.placeholder=h[l]||"Optional: describe what you want\u2026",v.value="",p.hidden=!1,m.classList.add("vx-section-grid-collapsed"),setTimeout(()=>v.focus(),100)})}),u.addEventListener("click",()=>{l=null,r=null,p.hidden=!0,m.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(y=>y.classList.remove("vx-section-card-selected"))});let b=()=>{if(!l)return;let y=v.value.trim();i(),Ei(e,l,r,y)};d.addEventListener("click",b),v.addEventListener("keydown",y=>{y.key==="Enter"&&(y.preventDefault(),b())})}async function Ei(e,t,s,n=""){ne({type:"vx-editor:show-ai-overlay",status:`Adding ${t}\u2026`});let o=e.filePath||Gt(),i=new AbortController,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let l=Date.now(),r=0,p=()=>{if(r>0){let u=r.toLocaleString();ne({type:"vx-editor:update-ai-status",status:`Generating ${t}\u2026 (${u} tokens)`})}else Math.round((Date.now()-l)/1e3)>=6&&ne({type:"vx-editor:update-ai-status",status:`Preparing ${t}\u2026`})},c=setInterval(p,1e3),v=0,d=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await mt("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onStatus(u){ne({type:"vx-editor:update-ai-status",status:u||`Adding ${t}\u2026`})},onFile(){ne({type:"vx-editor:update-ai-status",status:"Writing files\u2026"})},onToken(){r++;let u=Date.now();u-v>500&&(v=u,p())},onError(u){clearInterval(c),ne({type:"vx-editor:hide-ai-overlay"}),ae(u.message||"Failed to add section",!0)},onDone(u){if(clearInterval(c),ne({type:"vx-editor:hide-ai-overlay"}),u.cancelled){ae("Generation cancelled",!1);return}(u.files_modified||[]).length>0?(ae(`${t} added \u2713`),setTimeout(()=>{let h=document.getElementById("preview-iframe");h!=null&&h.contentWindow&&h.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{ne({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{ne({type:"vx-editor:scroll-to-section",sectionIndex:d}),ne({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):u.partial||ae("No changes made",!1)},onWarning(u){typeof window.showToast=="function"&&window.showToast(u,"warning")}})}catch(u){clearInterval(c),u.name!=="AbortError"&&ae("Failed to add section",!0),ne({type:"vx-editor:hide-ai-overlay"})}}function $i(e){Ne();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelector("[data-close]").addEventListener("click",s),ce(t,s),t.tabIndex=-1,t.focus(),Ci(t)}async function Ci(e){let t=e.querySelector("#vx-img-grid");try{let s=await L.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",()=>{ne({type:"vx-editor:swap-image",src:o.dataset.path}),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function Li(e){Ne();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${Mt(e.href||"")}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${Mt(e.text||"")}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",s)),ce(t,s),document.getElementById("vx-link-save").addEventListener("click",()=>{ne({type:"vx-editor:update-link",href:document.getElementById("vx-link-href").value.trim(),text:document.getElementById("vx-link-text").value.trim()}),s()}),setTimeout(()=>{var o;return(o=document.getElementById("vx-link-href"))==null?void 0:o.focus()},100)}async function Si(e){let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||Gt();try{let a=await L.get(`/files/content?path=${encodeURIComponent(i)}`);if(!a.ok){console.warn("[VX] Cannot read file for image save:",i),ae("Save failed",!0);return}let l=a.data.content,r=!1,p=`src="${s}"`;if(l.includes(p)&&(l=l.replace(p,`src="${n}"`),r=!0),!r&&l.includes(s)&&(l=l.replace(s,n),r=!0),!r&&o){let v=An(l,o,n);v!==!1&&(l=v,r=!0)}if(r){(await L.put("/files/content",{path:i,content:l})).ok?ae("Saved"):ae("Save failed",!0);return}let c=await L.get("/files");if(c.ok){let v=(c.data.files||[]).filter(d=>d.path.endsWith(".php")&&d.path!==i);for(let d of v){let u=await L.get(`/files/content?path=${encodeURIComponent(d.path)}`);if(!u.ok||!u.data.content)continue;let m=u.data.content;if(m.includes(p)&&(m=m.replace(p,`src="${n}"`),(await L.put("/files/content",{path:d.path,content:m})).ok)){ae(`Saved \u2192 ${d.path.split("/").pop()}`);return}if(m.includes(s)&&(m=m.replace(s,n),(await L.put("/files/content",{path:d.path,content:m})).ok)){ae(`Saved \u2192 ${d.path.split("/").pop()}`);return}if(o){let h=An(m,o,n);if(h!==!1&&(await L.put("/files/content",{path:d.path,content:h})).ok){ae(`Saved \u2192 ${d.path.split("/").pop()}`);return}}}}console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),ae("Save failed \u2014 source not found",!0)}catch(a){console.error("[VX] Image save error:",a),ae("Save failed",!0)}}function An(e,t,s){let n=e.split("<img");for(let o=1;o<n.length;o++){let i=n[o];if(!i.includes(`alt="${t}"`)&&!i.includes(`alt='${t}'`))continue;let a=i.indexOf("src=");if(a===-1)continue;let l=i[a+4];if(l!=='"'&&l!=="'")continue;let r=a+5,p=i.indexOf(l,r);if(p!==-1)return n[o]=i.substring(0,r)+s+i.substring(p),n.join("<img")}return!1}function Ks(e){gt.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,timestamp:Date.now()}),clearTimeout(Ks._timer),Ks._timer=setTimeout(()=>Wt(),800)}function Ys(e){gt.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,timestamp:Date.now()}),clearTimeout(Ys._timer),Ys._timer=setTimeout(()=>Wt(),300)}async function Wt(){var t;if(Os||gt.length===0)return;Os=!0;let e=[...gt];gt=[];try{let s={};for(let i of e){let a=i.filePath||Gt();s[a]||(s[a]=[]),s[a].push(i)}let n=!1,o={filesByMain:new Map,contentByPath:new Map};for(let[i,a]of Object.entries(s))try{let l=await L.get(`/files/content?path=${encodeURIComponent(i)}`);if(!l.ok){console.error("[VX] Cannot read:",i);continue}let r=l.data.content,p=!1;for(let c of a){let v=c.type==="delete"?c.outerHTML:c.originalHTML;if(v)if(r.includes(v))r=c.type==="delete"?r.replace(v,""):r.replace(v,c.newHTML),p=!0;else{if(await Bi(i,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",v.substring(0,80))}}if(p){let c=await L.put("/files/content",{path:i,content:r});c.ok?(ae("Saved"),(t=c.data)!=null&&t.tailwindCompiled&&(n=!0)):ae("Save failed",!0)}}catch(l){console.error("[VX] Save error:",l),ae("Save failed",!0)}n&&setTimeout(()=>{let i=document.getElementById("preview-iframe");i!=null&&i.contentWindow&&i.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{Os=!1,gt.length>0&&setTimeout(()=>Wt(),0)}}async function Bi(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let l=await L.get("/files");if(!l.ok)return!1;a=(l.data.files||[]).filter(r=>r.path.endsWith(".php")&&r.path!==e).filter(r=>o.some(p=>r.path.includes(p+"/"))||r.path.includes("partial")||r.path.includes("header")||r.path.includes("footer")||r.path.includes("nav")),i.filesByMain.set(e,a)}for(let l of a){let r=i.contentByPath.get(l.path);if(r==null){let p=await L.get(`/files/content?path=${encodeURIComponent(l.path)}`);if(!p.ok||!p.data.content)continue;r=p.data.content,i.contentByPath.set(l.path,r)}if(r.includes(n)){let p=t.type==="delete"?r.replace(n,""):r.replace(n,t.newHTML);if((await L.put("/files/content",{path:l.path,content:p})).ok)return i.contentByPath.set(l.path,p),ae(`Saved \u2192 ${l.path.split("/").pop()}`),!0}}}catch(a){console.error("[VX] Partial search error:",a)}return!1}async function Mi(e){var i;let{filePath:t,sectionIndex:s,neighborIndex:n}=e,o=t||Gt();try{let a=await L.get(`/files/content?path=${encodeURIComponent(o)}`);if(!a.ok){ae("Could not read file",!0);return}let l=a.data.content,r=Ti(l);if(s>=r.length||n>=r.length){ae("Section not found in source. Try asking the AI to move it.",!0);return}let p=Ii(l,r,s,n);if(!p){ae("Could not swap sections in source",!0);return}let c=await L.put("/files/content",{path:o,content:p});c.ok?(ae("Section moved"),(i=c.data)!=null&&i.tailwindCompiled&&setTimeout(()=>{let v=document.getElementById("preview-iframe");v!=null&&v.contentWindow&&v.contentWindow.postMessage("voxelsite:reload-css","*")},300)):ae("Save failed",!0)}catch(a){console.error("[VX] Section move error:",a),ae("Section move failed",!0)}}function Ti(e){let t=[],s=/<section\b/gi,n;for(;(n=s.exec(e))!==null;){let o=n.index,a=e.substring(Math.max(0,o-500),o).match(/(<!--[\s\S]*?-->\s*)$/);a&&(o-=a[0].length);let l="</section>",r=1,p=n.index+n[0].length;for(;r>0&&p<e.length;){let c=e.indexOf("<section",p),v=e.indexOf(l,p);if(v===-1)break;if(c!==-1&&c<v){let d=e[c+8];(d===" "||d===">"||d===`
`||d==="\r"||d==="	"||d==="/")&&r++,p=c+9}else{if(r--,r===0){let d=v+l.length;t.push({start:o,end:d,content:e.substring(o,d)})}p=v+l.length}}}return t}function Ii(e,t,s,n){if(s===n)return e;let o=Math.min(s,n),i=Math.max(s,n),a=t[o],l=t[i];if(!a||!l||a.end>l.start)return null;let r=e.substring(0,a.start),p=e.substring(a.end,l.start),c=e.substring(l.end);return r+l.content+p+a.content+c}function Fn(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",Ue),e.title=Ue?"Exit visual editor (V)":"Visual editor (V)"),document.body.classList.toggle("vx-editing",Ue)}function ae(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(ae._timer),ae._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function ne(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function Gt(){return window.__vsCurrentPreviewPath||"index.php"}function us(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),l=a.right-s-o,r=Math.max(o,a.left+10),p=Math.max(o,window.innerWidth-s-o),c=Math.min(Math.max(l,r),p),v=Math.max(a.top+12,i),d=Math.max(i,window.innerHeight-n-o),u=Math.min(v,d);e.style.left=`${c}px`,e.style.top=`${u}px`,e.style.right="auto"}function Ai(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function Mt(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Tt(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var k={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',ellipsis:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',inbox:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',panelLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>',settings:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',save:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',palette:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>'};function _i(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function M(e,t="success",s=3200){if(!e)return;let n=_i(),o=document.createElement("div"),i=["success","error","warning"].includes(t)?t:"success";o.className=`vs-toast vs-toast-${i}`,o.innerHTML=`<span>${x(String(e))}</span>`,n.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(-6px)",setTimeout(()=>o.remove(),220)},s)}window.showToast=M;var Kt=null;function zn(){return`
    <div class="vs-editor-layout">
      <!-- File Tree Sidebar -->
      <div id="editor-sidebar" class="vs-editor-sidebar" style="position: relative; display: flex; flex-direction: column;">
        <div class="vs-editor-sidebar-header">
          <span class="vs-editor-sidebar-title">Explorer</span>
          <div style="display:flex;gap:2px;">
            <button id="editor-new-file" class="vs-btn vs-btn-ghost vs-btn-icon" title="New file" style="width:24px;height:24px;">
              ${k.filePlus}
            </button>
            <button id="editor-refresh-tree" class="vs-btn vs-btn-ghost vs-btn-icon" title="Refresh file list" style="width:24px;height:24px;">
              ${k.rotateCcw}
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
              <div class="vs-empty-state-icon">${k.fileCode}</div>
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
  `}async function On(){var U;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(w=>w.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(w=>w.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),l=document.getElementById("editor-host"),r=document.getElementById("editor-empty-state"),p=document.getElementById("editor-monaco-container"),c=document.getElementById("editor-file-info"),v=document.getElementById("editor-status"),d=document.getElementById("editor-save-btn"),u=document.getElementById("editor-refresh-tree"),m=document.getElementById("editor-new-file"),h=document.getElementById("editor-sidebar"),b=document.getElementById("editor-sidebar-resize"),y=document.getElementById("editor-font-size-select"),g=document.getElementById("editor-word-wrap-btn");y&&(y.value=t.fontSize);let C=()=>{g&&(t.wordWrap?(g.style.color="var(--vs-accent)",g.style.backgroundColor="var(--vs-accent-dim)"):(g.style.color="var(--vs-text-ghost)",g.style.backgroundColor="transparent"))};C();let $=(w,I="muted")=>{v&&(v.textContent=w,v.dataset.state=I)},S=w=>{let I=t.files.find(_=>_.path===w);return(I==null?void 0:I.readonly)===!0},B=w=>{let I=w.toLowerCase();return I.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':I.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':I.endsWith(".js")||I.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},D=(w,I="")=>{let _=[],j={},q=G=>{if(j[G])return j[G];let z=G.split("/"),Q=z[z.length-1],Z=z.slice(0,-1).join("/"),ee=I?I+G:G,oe={name:Q,path:ee,type:"folder",children:[]};return j[G]=oe,Z?q(Z).children.push(oe):_.push(oe),oe};for(let G of w){let Q=(I&&G.path.startsWith(I)?G.path.substring(I.length):G.path).split("/");if(Q.length===1)_.push({name:Q[0],path:G.path,type:"file",meta:G});else{let Z=Q.slice(0,-1).join("/");q(Z).children.push({name:Q[Q.length-1],path:G.path,type:"file",meta:G})}}let Y=G=>{G.sort((z,Q)=>z.type!==Q.type?z.type==="folder"?-1:1:z.name.localeCompare(Q.name));for(let z of G)z.type==="folder"&&Y(z.children)};return Y(_),_},R=()=>{if(!n)return;let w=(Y,G=0)=>Y.map(z=>{var se,Me;if(z.type==="folder"){let _e=t.expandedFolders.has(z.path);return`
            <div class="vs-tree-item" data-folder="${x(z.path)}" style="--tree-indent: ${G};">
              <span class="vs-tree-folder-toggle" data-expanded="${_e}">${k.chevronRight}</span>
              <span class="vs-tree-item-icon">${_e?k.folderOpen||k.folder:k.folder}</span>
              <span class="vs-tree-item-name">${x(z.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${x(z.path)}" data-collapsed="${!_e}">
              ${w(z.children,G+1)}
            </div>
          `}let Q=t.activeTab===z.path,Z=t.openTabs.find(_e=>_e.path===z.path),ee=Z!=null&&Z.dirty?" \u2022":"",$e=S(z.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",be=((se=z.meta)==null?void 0:se.custom)===!0,ye=((Me=z.meta)==null?void 0:Me.protected)===!0,xe="";return z.path==="assets/css/tailwind.css"?xe=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:ye?be&&(xe=`
            <button class="vs-tree-item-restore" data-restore-file="${x(z.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):xe=`
            <button class="vs-tree-item-delete" data-delete-file="${x(z.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${x(z.path)}" data-active="${Q}" style="--tree-indent: ${G};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${B(z.path)}</span>
            <span class="vs-tree-item-name">${x(z.name)}${$e}${ee}</span>
            ${xe}
          </div>
        `}).join(""),I=(Y,G,z)=>{let Q=z.querySelector(".vs-explorer-caret");t.expandedSections.has(Y)?(G.style.display="block",z.classList.add("is-expanded")):(G.style.display="none",z.classList.remove("is-expanded"))},_=document.querySelector('[data-section="site"]'),j=document.querySelector('[data-section="config"]'),q=document.querySelector('[data-section="prompts"]');_&&I("site",n,_),j&&o&&I("config",o,j),q&&i&&I("prompts",i,q),n.innerHTML=w(t.treeData.site),o&&(o.innerHTML=w(t.treeData.config)),i&&(i.innerHTML=w(t.treeData.prompts)),Ge()},O=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(w=>{let I=w.path===t.activeTab,_=w.path.split("/").pop(),q=S(w.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${x(w.path)}" data-active="${I}" data-dirty="${w.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${x(_)}${q}</span>
          <button class="vs-editor-tab-close" data-close-tab="${x(w.path)}" title="Close">${k.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',ot(),J()}},K=null,V=w=>{if(!a)return;let I=8,_=()=>{a.scrollLeft+=w==="left"?-I:I,J()};_(),K=setInterval(_,16)},T=()=>{K&&(clearInterval(K),K=null)},J=()=>{let w=document.getElementById("editor-tab-scroll-left"),I=document.getElementById("editor-tab-scroll-right");if(!a||!w||!I)return;let _=a.scrollLeft>0,j=a.scrollLeft<a.scrollWidth-a.clientWidth-1;w.style.display=_?"flex":"none",I.style.display=j?"flex":"none"};a&&(a.addEventListener("scroll",J,{passive:!0}),window.addEventListener("resize",J,{passive:!0}));let X=document.getElementById("editor-tab-scroll-left"),E=document.getElementById("editor-tab-scroll-right");X&&(X.addEventListener("mousedown",()=>V("left")),X.addEventListener("mouseup",T),X.addEventListener("mouseleave",T)),E&&(E.addEventListener("mousedown",()=>V("right")),E.addEventListener("mouseup",T),E.addEventListener("mouseleave",T));let A=()=>{r&&(r.style.display="none"),p&&(p.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},N=async w=>{if(t.disposed)return;let I=t.openTabs.find(G=>G.path===w);if(I){await W(w);return}$("Loading\u2026");let{ok:_,data:j,error:q}=await L.get(`/files/content?path=${encodeURIComponent(w)}`);if(!_){M((q==null?void 0:q.message)||"Could not load file.","error"),$("Load failed","error");return}let Y=typeof(j==null?void 0:j.content)=="string"?j.content:"";I={path:w,baseline:Y,dirty:!1},t.openTabs.push(I),A(),await W(w),F(Y,w),$("Ready"),s()},W=async w=>{if(t.disposed)return;let I=t.openTabs.find(j=>j.path===t.activeTab);I&&t.monacoInstance&&(I._buffer=t.monacoInstance.getValue()),t.activeTab=w;let _=t.openTabs.find(j=>j.path===w);if(_&&t.monacoInstance){let j=_._buffer!==void 0?_._buffer:_.baseline;F(j,w)}me(),Se(),O(),setTimeout(()=>{if(a){let j=a.querySelector('.vs-editor-tab[data-active="true"]');if(j){let q=j.getBoundingClientRect(),Y=a.getBoundingClientRect();q.left<Y.left?a.scrollBy({left:q.left-Y.left,behavior:"smooth"}):q.right>Y.right&&a.scrollBy({left:q.right-Y.right,behavior:"smooth"})}}},10),R(),s()},te=async w=>{let I=t.openTabs.find(j=>j.path===w);if(I!=null&&I.dirty&&!await pe({title:"Discard unsaved changes?",description:`"${w}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let _=t.openTabs.findIndex(j=>j.path===w);if(_!==-1){if(t.openTabs.splice(_,1),t.activeTab===w){let j=t.openTabs[Math.min(_,t.openTabs.length-1)];j?await W(j.path):(t.activeTab=null,re(),me(),Se())}O(),R(),s()}},ve=async w=>{var G,z;if((G=window.demoGuard)!=null&&G.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let I=w.split("/").pop();if(!await pe({title:"Delete file?",description:`Are you sure you want to permanently delete "${I}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;$("Deleting\u2026");let{ok:j,error:q}=await L.delete(`/files?path=${encodeURIComponent(w)}`);if(!j){M((q==null?void 0:q.message)||"Could not delete file.","error"),$("Delete failed","error");return}let Y=t.openTabs.findIndex(Q=>Q.path===w);if(Y!==-1){if(t.openTabs.splice(Y,1),t.activeTab===w){let Q=t.openTabs[Math.min(Y,t.openTabs.length-1)];Q?await W(Q.path):(t.activeTab=null,re(),me(),Se())}O()}await f(),s(),M(`Deleted ${I}`,"success"),$("Ready")},fe=async w=>{var G,z;if((G=window.demoGuard)!=null&&G.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let I=w.split("/").pop();if(!await pe({title:"Reset system prompt?",description:`Are you sure you want to reset "${I}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;$("Resetting\u2026");let{ok:j,error:q}=await L.delete(`/files?path=${encodeURIComponent(w)}`);if(!j){M((q==null?void 0:q.message)||"Could not reset file.","error"),$("Reset failed","error");return}let Y=t.openTabs.findIndex(Q=>Q.path===w);if(Y!==-1){let{ok:Q,data:Z}=await L.get(`/files/content?path=${encodeURIComponent(w)}`);if(Q&&typeof(Z==null?void 0:Z.content)=="string"){let ee=t.openTabs[Y];ee.baseline=Z.content,ee.dirty=!1,ee._buffer=Z.content,t.activeTab===w&&F(Z.content,w)}}Se(),await f(),s(),M(`Reset ${I} to default`,"success"),$("Ready")},F=(w,I)=>{var j;if(!t.monacoInstance||!t.monaco)return;let _=t.monacoInstance.getModel();_&&(t.monacoInstance.setValue(w),t.monaco.editor.setModelLanguage(_,Ft(I)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((j=window.canWrite)!=null&&j.call(window))||S(I)}))},re=()=>{r&&(r.style.display=""),p&&(p.style.display="none")},me=()=>{if(!c)return;if(!t.activeTab){c.textContent="No file open";return}let w=t.openTabs.find(q=>q.path===t.activeTab),I=t.files.find(q=>q.path===t.activeTab),_=I!=null&&I.size?`${(Number(I.size)/1024).toFixed(1)} KB`:"",j=Ft(t.activeTab).toUpperCase();c.textContent=[t.activeTab,j,_].filter(Boolean).join(" \u2022 ")},Se=()=>{var _;if(!d)return;let w=t.openTabs.find(j=>j.path===t.activeTab);if(t.activeTab?S(t.activeTab)||!((_=window.canWrite)!=null&&_.call(window)):!1){d.disabled=!0,d.textContent="Read-Only",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}if(!w||!w.dirty){d.disabled=!0,d.textContent="Saved",d.classList.remove("vs-btn-primary"),d.classList.add("vs-btn-ghost");return}d.disabled=!1,d.textContent="Save",d.classList.remove("vs-btn-ghost"),d.classList.add("vs-btn-primary")},De=()=>{let w=t.openTabs.find(j=>j.path===t.activeTab);if(!w||!t.monacoInstance)return;let I=t.monacoInstance.getValue(),_=w.dirty;w.dirty=I!==w.baseline,_!==w.dirty&&(Se(),O(),w.dirty?$("Unsaved changes","warning"):$("Ready"))},He=async()=>{var Y,G,z,Q,Z;if((Y=window.demoGuard)!=null&&Y.call(window)||(G=window.viewerGuard)!=null&&G.call(window))return;let w=t.openTabs.find(ee=>ee.path===t.activeTab);if(!w||!w.dirty||!t.monacoInstance)return;let I=t.monacoInstance.getValue();d.disabled=!0,d.textContent="Saving\u2026",$("Saving\u2026");let{ok:_,error:j}=await L.put("/files/content",{path:w.path,content:I});if(!_){d.disabled=!1,d.textContent="Save",M((j==null?void 0:j.message)||"Could not save file.","error"),$("Save failed","error");return}w.baseline=I,w.dirty=!1,w._buffer=I,Se(),O(),R(),$("Saved","success"),M(`Saved ${w.path}`,"success"),w.path.toLowerCase().endsWith(".css")?(z=window.sendPreviewMessage)==null||z.call(window,"voxelsite:reload-css"):(Q=window.sendPreviewMessage)==null||Q.call(window,"voxelsite:reload"),setTimeout(()=>{var ee;return(ee=window.refreshPreview)==null?void 0:ee.call(window)},400),(Z=window.refreshPublishState)==null||Z.call(window,{silent:!0});let q=t.openTabs.find(ee=>ee.path==="assets/css/tailwind.css");q&&w.path!=="assets/css/tailwind.css"&&L.get("/files/content?path=assets/css/tailwind.css").then(({ok:ee,data:oe})=>{ee&&typeof(oe==null?void 0:oe.content)=="string"&&(q.baseline=oe.content,q._buffer=oe.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(oe.content))})},Ge=()=>{let w=I=>{I&&(I.querySelectorAll("[data-file]").forEach(_=>{_.addEventListener("click",j=>{j.target.closest("[data-delete-file]")||N(_.dataset.file)})}),I.querySelectorAll("[data-delete-file]").forEach(_=>{_.addEventListener("click",j=>{j.stopPropagation(),ve(_.dataset.deleteFile)})}),I.querySelectorAll("[data-restore-file]").forEach(_=>{_.addEventListener("click",j=>{j.stopPropagation(),fe(_.dataset.restoreFile)})}),I.querySelectorAll("[data-compile-tailwind]").forEach(_=>{_.addEventListener("click",async j=>{var ee,oe;if(j.stopPropagation(),(ee=window.demoGuard)!=null&&ee.call(window)||(oe=window.viewerGuard)!=null&&oe.call(window))return;_.style.opacity="0.4",_.style.pointerEvents="none",$("Compiling Tailwind\u2026");let{ok:q,data:Y,error:G}=await L.post("/files/compile-tailwind");if(_.style.opacity="",_.style.pointerEvents="",!q){M((G==null?void 0:G.message)||"Tailwind compilation failed.","error"),$("Compile failed","error");return}let z="assets/css/tailwind.css",Q=t.openTabs.find($e=>$e.path===z);Q&&(Q.baseline=Y.content,Q.dirty=!1,t.activeTab===z&&t.monacoInstance&&t.monacoInstance.setValue(Y.content));let Z=Y.class_count??0;M(`Tailwind CSS recompiled \u2014 ${Z} utilities.`,"success"),$("Compiled")})}),I.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(_=>{_.addEventListener("click",j=>{j.stopPropagation();let Y=_.closest(".vs-tree-item").dataset.folder;t.expandedFolders.has(Y)?t.expandedFolders.delete(Y):t.expandedFolders.add(Y),s(),R()})}))};w(n),w(o),w(i),document.querySelectorAll(".vs-explorer-section-header").forEach(I=>{I.dataset.bound||(I.dataset.bound="true",I.addEventListener("click",()=>{let _=I.dataset.section;t.expandedSections.has(_)?t.expandedSections.delete(_):t.expandedSections.add(_),s(),R()}))})},ot=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(w=>{w.addEventListener("click",I=>{I.target.closest("[data-close-tab]")||W(w.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(w=>{w.addEventListener("click",I=>{I.stopPropagation(),te(w.dataset.closeTab)})}))};if(b&&h){let w=!1;b.addEventListener("mousedown",I=>{I.preventDefault(),w=!0,b.classList.add("is-dragging");let _=q=>{if(!w)return;let Y=Math.min(400,Math.max(200,q.clientX));h.style.width=Y+"px"},j=()=>{w=!1,b.classList.remove("is-dragging"),document.removeEventListener("mousemove",_),document.removeEventListener("mouseup",j)};document.addEventListener("mousemove",_),document.addEventListener("mouseup",j)})}d==null||d.addEventListener("click",He),y==null||y.addEventListener("change",w=>{let I=parseInt(w.target.value,10);t.fontSize=I,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:I}),s()}),g==null||g.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,C(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),u==null||u.addEventListener("click",()=>f()),m==null||m.addEventListener("click",async()=>{var G,z,Q;if((G=window.demoGuard)!=null&&G.call(window)||(z=window.viewerGuard)!=null&&z.call(window))return;let w=await zs({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!w||!w.trim())return;let I=w.trim(),_=(Q=I.split(".").pop())==null?void 0:Q.toLowerCase(),j=["php","css","js","json"];if(!_||!j.includes(_)){M(`Only ${j.join(", ")} files can be created.`,"warning");return}$("Creating\u2026");let{ok:q,error:Y}=await L.post("/files/create",{path:I});if(!q){M((Y==null?void 0:Y.message)||"Could not create file.","error"),$("Create failed","error");return}await f(),await N(I),M(`Created ${I}`,"success")});let pt=w=>{if(t.disposed){document.removeEventListener("keydown",pt);return}(w.metaKey||w.ctrlKey)&&w.key==="s"&&(w.preventDefault(),He())};document.addEventListener("keydown",pt);let f=async()=>{var j;let{ok:w,data:I,error:_}=await L.get("/files");if(!w||!((j=I==null?void 0:I.files)!=null&&j.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=I.files,t.treeData={site:D(I.files.filter(q=>!q.path.startsWith("_prompts/")&&!q.path.startsWith("_root/"))),config:D(I.files.filter(q=>q.path.startsWith("_root/")),"_root/"),prompts:D(I.files.filter(q=>q.path.startsWith("_prompts/")),"_prompts/")},R()},P=async()=>{if(!p)return;let w;try{w=await Un()}catch{M("Monaco editor is not available.","warning");return}t.monaco=w;let I=Yt();w.editor.setTheme(I);let _=w.editor.create(p,{value:"",language:"php",theme:I,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=_,_.onDidChangeModelContent(()=>De()),_.addCommand(w.KeyMod.CtrlCmd|w.KeyCode.KeyK,async()=>{if(t.monacoInstance.getOption(w.editor.EditorOption.readOnly)){M("Cannot use inline AI on a read-only file.","warning");return}let j=t.activeTab;if(!j)return;let q=t.monacoInstance.getModel(),Y=t.monacoInstance.getSelection(),G=q.getValueInRange(Y);if(!G||G.trim()===""){let ee=t.monacoInstance.getPosition(),oe=q.getLineContent(ee.lineNumber);if(oe.trim()===""){M("Highlight a block of code to edit.","warning");return}G=oe,t.monacoInstance.setSelection(new w.Range(ee.lineNumber,1,ee.lineNumber,q.getLineMaxColumn(ee.lineNumber)))}let z=await zs({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!z)return;let Q=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let Z=document.createElement("div");Z.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",Z.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${k.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,p&&(p.style.position="relative",p.appendChild(Z)),$("AI is editing...","muted");try{await mt("/ai/prompt",{user_prompt:z,action_type:"inline_edit",action_data:{path:j,selection:G}},{onStatus:ee=>{let oe=document.getElementById("ai-inline-status");oe&&(oe.textContent="Generating...")},onFile:()=>{let ee=document.getElementById("ai-inline-status");ee&&(ee.textContent="Applying changes...")},onError:ee=>{M(ee.message||"Generation failed","error")},onDone:async ee=>{var $e;if(($e=ee.files_modified)==null?void 0:$e.some(be=>(typeof be=="string"?be:(be==null?void 0:be.path)||"").replace(/^\//,"")===j.replace(/^\//,""))){let{ok:be,data:ye}=await L.get(`/files/content?path=${encodeURIComponent(j)}&_t=${Date.now()}`);if(be&&(ye!=null&&ye.content)){let xe=ye.content;await L.put("/files/content",{path:j,content:Q}),t.monacoInstance.getModel().setValue(xe);let se=t.openTabs.find(Me=>Me.path===j);se&&(se._buffer=xe,se.baseline=Q),De(),M("Review changes and save.","success")}}else ee.partial||M("Complete (No changes made to this file)","info")}})}finally{t.monacoInstance.updateOptions({readOnly:!1}),Z.parentNode&&Z.parentNode.removeChild(Z),$("Ready","muted")}})};if(await Promise.all([f(),P()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:w,active:I}=t._pendingRestore;t._pendingRestore=null;for(let _ of w){if(!t.files.some(Y=>Y.path===_))continue;let{ok:j,data:q}=await L.get(`/files/content?path=${encodeURIComponent(_)}`);j&&typeof(q==null?void 0:q.content)=="string"&&t.openTabs.push({path:_,baseline:q.content,dirty:!1})}if(t.openTabs.length>0){let _=I&&t.openTabs.find(j=>j.path===I)?I:t.openTabs[0].path;A(),await W(_),F(((U=t.openTabs.find(j=>j.path===_))==null?void 0:U.baseline)||"",_),$("Ready")}}}function Yt(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function Un(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:Kt||(Kt=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,l){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw Kt=null,t}),Kt)}async function hs(e=""){var R,O,K,V;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),l=s.querySelector("#vs-code-meta"),r=s.querySelector("#vs-code-status"),p=s.querySelector("#vs-code-editor-host"),c={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},v=(T,J="muted")=>{r&&(r.textContent=T,r.dataset.state=J)},d=()=>c.files.find(T=>T.path===c.path)||null,u=()=>!!c.editor&&c.editor.getValue()!==c.baseline,m=()=>{if(!l)return;let T=d();if(!T){l.textContent="No file selected";return}let J=T.size?`${(Number(T.size)/1024).toFixed(1)} KB`:"0 KB",X=T.modified?new Date(T.modified).toLocaleString():"Unknown date";l.textContent=`${T.path} \u2022 ${J} \u2022 ${X}`},h=()=>{if(!o)return;let T=u();o.disabled=!T,o.textContent=T?"Save Changes":"Saved",T?v("Unsaved changes","warning"):c.path&&v("Saved","success")},b=async()=>{var T;c.closed||u()&&!await pe({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(c.closed=!0,(T=c.editorCleanup)!=null&&T.dispose&&(c.editorCleanup.dispose(),c.editorCleanup=null),c.editor&&(c.editor.dispose(),c.editor=null),de(s))},y=(T,J=null)=>{if(!c.editor)return;c.editor.setValue(T),c.baseline=T;let X=(J==null?void 0:J.language)||Ft(c.path);c.editor.setLanguage&&c.editor.setLanguage(X),m(),h()},g=async(T,{silent:J=!1}={})=>{if(!T||!c.editor)return!1;c.path=T,J||v("Loading file\u2026");let{ok:X,data:E,error:A}=await L.get(`/files/content?path=${encodeURIComponent(T)}`);if(!X)return M((A==null?void 0:A.message)||"Could not load file.","error"),v("Load failed","error"),!1;let N=typeof(E==null?void 0:E.content)=="string"?E.content:"";return y(N,(E==null?void 0:E.file)||d()),!0},C=async()=>u()?await pe({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,$=async T=>{if(!T||T===c.path)return;if(!await C()){n&&(n.value=c.path);return}await g(T)},S=async()=>{var E,A,N;if(!c.editor||!c.path||!o)return;let T=c.editor.getValue();if(T===c.baseline){h();return}o.disabled=!0,o.textContent="Saving\u2026",v("Saving\u2026");let{ok:J,error:X}=await L.put("/files/content",{path:c.path,content:T});if(!J){o.disabled=!1,o.textContent="Save Changes",M((X==null?void 0:X.message)||"Could not save file.","error"),v("Save failed","error");return}c.baseline=T,h(),v("Saved","success"),M(`Saved ${c.path}`,"success"),c.path.toLowerCase().endsWith(".css")?(E=window.sendPreviewMessage)==null||E.call(window,"voxelsite:reload-css"):(A=window.sendPreviewMessage)==null||A.call(window,"voxelsite:reload"),setTimeout(()=>{var W;return(W=window.refreshPreview)==null?void 0:W.call(window)},400),(N=window.refreshPublishState)==null||N.call(window,{silent:!0})},B=T=>{T.key==="Escape"&&(T.preventDefault(),b())};a==null||a.addEventListener("click",()=>b()),i==null||i.addEventListener("click",async()=>{!c.path||!await C()||await g(c.path)}),o==null||o.addEventListener("click",()=>S()),n==null||n.addEventListener("change",T=>{$(T.target.value)}),s.addEventListener("click",T=>{T.target===s&&b()}),document.addEventListener("keydown",B);let D=()=>document.removeEventListener("keydown",B);s.addEventListener("transitionend",()=>{document.body.contains(s)||D()});try{let T=await L.get("/files");if(!T.ok||!((O=(R=T.data)==null?void 0:R.files)!=null&&O.length)){let A=((K=T.error)==null?void 0:K.message)||"No editable files found.";M(A,"error"),b();return}let J=T.data.files;c.files=J,n&&(n.innerHTML=J.map(A=>{let N=A.group?`${String(A.group).toUpperCase()} \xB7 `:"";return`<option value="${x(A.path)}">${x(N+A.path)}</option>`}).join(""));let X=((V=J.find(A=>A.path===e))==null?void 0:V.path)||J[0].path;c.path=X,n&&(n.value=X),p.innerHTML="";let E=null;try{E=await Un()}catch{M("Monaco is not available yet. Using fallback editor.","warning"),v("Fallback editor active","warning")}if(E!=null&&E.editor){let A=Yt();E.editor.setTheme(A);let N=E.editor.create(p,{value:"",language:Ft(X),theme:A,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});c.editor={getValue:()=>N.getValue(),setValue:W=>N.setValue(W),setLanguage:W=>{let te=N.getModel();te&&E.editor.setModelLanguage(te,W)},dispose:()=>N.dispose()},c.editorCleanup=N.onDidChangeModelContent(()=>{h()})}else{p.innerHTML='<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"></textarea>';let A=p.querySelector("#vs-code-editor-fallback"),N=()=>h();A==null||A.addEventListener("input",N),c.editor={getValue:()=>(A==null?void 0:A.value)||"",setValue:W=>{A&&(A.value=W)},setLanguage:()=>{},dispose:()=>{A==null||A.removeEventListener("input",N)}}}await g(X,{silent:!0}),v("Ready")}catch(T){M((T==null?void 0:T.message)||"Could not initialize code editor.","error"),b()}finally{let T=new MutationObserver(()=>{document.body.contains(s)||(D(),T.disconnect())});T.observe(document.body,{childList:!0,subtree:!0})}}function Yn(){return setTimeout(()=>lt(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function lt(){var E,A,N,W,te,ve,fe;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,l]=await Promise.all([L.get("/settings"),L.get("/settings/system"),L.get("/settings/mail"),L.get("/settings/usage"),L.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),L.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),L.get("/settings/logs")]),r=((E=l.data)==null?void 0:E.logs)||[],p=((A=t.data)==null?void 0:A.settings)||{},c=((N=s.data)==null?void 0:N.system)||{},v=p.site_favicon||null,d=v?`/${v}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),u=null,m=null;try{i.ok&&((W=i.data)!=null&&W.content)&&(u=JSON.parse(i.data.content))}catch{}try{a.ok&&((te=a.data)!=null&&te.content)&&(m=JSON.parse(a.data.content))}catch{}let h=u||m,b=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},y=p.available_providers||{},g=((ve=n.data)==null?void 0:ve.config)||{},C=((fe=n.data)==null?void 0:fe.presets)||{},$=Object.keys(y),S=p.ai_provider||"claude",D=(y[S]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],R=p[`ai_${S}_model`]||"",O=p[`ai_${S}_api_key_set`]||!1,K=$.map(F=>{let re=y[F];return`<option value="${x(F)}" ${F===S?"selected":""}>${x(re.name)}</option>`}).join(""),V="";for(let F of D)F.key==="api_key"?V+=`
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
        </div>`:F.key==="base_url"&&(V+=`
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
            ${K}
          </select>
        </div>

        <div id="settings-config-fields">
          ${V}
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
                ${Object.entries(C).map(([F,re])=>`<option value="${x(F)}">${x(re.label)}</option>`).join("")}
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

        <div class="border-t border-vs-border-subtle my-2"></div>

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
          <div class="vs-knowledge-card-icon">${k.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(u).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${k.chevronRight}</div>
        </button>
        `:""}
        ${m?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${k.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(m).length} design decisions</span>
          </div>
          <div class="vs-knowledge-card-arrow">${k.chevronRight}</div>
        </button>
        `:""}
      </div>
      <p class="vs-knowledge-hint">
        ${k.info}
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
          ${je("Total Requests",Number(b.totals.request_count).toLocaleString())}
          ${je("Input Tokens",Number(b.totals.total_input_tokens).toLocaleString())}
          ${je("Output Tokens",Number(b.totals.total_output_tokens).toLocaleString())}

        </div>
        ${b.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${b.models.map(F=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${je(F.ai_model||"Unknown",Number(F.request_count).toLocaleString()+" requests")}
                ${je("Tokens",Number(F.total_input_tokens).toLocaleString()+" in / "+Number(F.total_output_tokens).toLocaleString()+" out")}

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
        ${je("VoxelSite",c.version||"1.0.0")}
        ${je("PHP",c.php_version||"?")}
        ${je("SQLite",c.sqlite_version||"?")}
        ${je("Database",Qs(c.database_size))}
        ${je("Preview Files",Qs(c.preview_size))}
        ${je("Assets",Qs(c.assets_size))}
        ${je("Upload Limit",c.max_upload||"?")}
        ${je("Memory Limit",c.memory_limit||"?")}
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
        ${r.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':r.map(F=>{let re=(F.size/1024).toFixed(1),me=new Date(F.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${F.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${F.lines} lines \xB7 ${re} KB \xB7 ${me}</span>
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
  `,zi(p,y),Oi(g,C),Ri(),Di(),document.querySelectorAll(".btn-delete-log").forEach(F=>{F.addEventListener("click",async()=>{var Se;if((Se=window.demoGuard)!=null&&Se.call(window))return;if(F.dataset.confirm!=="true"){F.dataset.confirm="true",F.innerHTML='<span style="font-size: 11px;">Sure?</span>',F.style.color="var(--vs-error)",setTimeout(()=>{F.dataset.confirm==="true"&&(F.dataset.confirm="",F.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',F.style.color="")},3e3);return}let re=F.dataset.file,me=F.closest(".vs-log-row");me&&(me.style.opacity="0.4"),await L.delete("/settings/logs",{file:re}),lt()})});let T=document.getElementById("btn-delete-all-logs");T&&T.addEventListener("click",async()=>{var F;if(!((F=window.demoGuard)!=null&&F.call(window))){if(T.dataset.confirm!=="true"){T.dataset.confirm="true",T.textContent="Sure?",T.style.color="var(--vs-error)",setTimeout(()=>{T.dataset.confirm==="true"&&(T.dataset.confirm="",T.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',T.style.color="")},3e3);return}T.disabled=!0,T.textContent="Deleting...",await L.delete("/settings/logs",{file:"*"}),lt()}});let J=document.getElementById("btn-view-memory");J&&u&&J.addEventListener("click",()=>Vn("Site Memory",u,"memory"));let X=document.getElementById("btn-view-design");X&&m&&X.addEventListener("click",()=>Vn("Design Intelligence",m,"design")),ji(),Hi(),Fi(R)}function Pi(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function ji(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;l();async function l(){var d;if(a)try{let{ok:u,data:m}=await L.get("/update/dist-packages");if(!u||!((d=m==null?void 0:m.packages)!=null&&d.length)){a.innerHTML="";return}let h=m.current_version||"0.0.0",b=m.packages.map(y=>{let g=(y.size/1024/1024).toFixed(1),C=Pi(y.version,h)>0,$=y.version===h,S=C?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':$?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${x(y.filename)}</strong>
                ${S}
              </div>
              <div class="vs-dist-pkg-meta">v${x(y.version)} \xB7 ${g} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${x(y.filename)}" data-version="${x(y.version)}">
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
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(y=>{y.addEventListener("click",()=>r(y.dataset.filename,y.dataset.version))})}catch{}}async function r(d,u){var h,b;if(!((h=window.demoGuard)!=null&&h.call(window)||!confirm(`Apply update from "${d}" (v${u})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${d}...`,a&&(a.innerHTML="");try{let{ok:y,data:g,error:C}=await L.post("/update/apply-local",{filename:d});s.classList.add("hidden"),n.classList.remove("hidden");let $=document.getElementById("vs-update-result-icon"),S=document.getElementById("vs-update-result-message");if(y){let B=g;$.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',S.innerHTML=`
          <div class="vs-update-result-title">${x(B.message)}</div>
          <div class="vs-update-result-meta">
            ${B.files_updated} files updated \xB7 ${B.files_skipped} preserved
            ${(b=B.errors)!=null&&b.length?` \xB7 ${B.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",(C==null?void 0:C.message)||"Unknown error")}catch(y){c("Update Failed",x(y.message||"Network error."))}}}e.addEventListener("click",d=>{var u;(u=window.demoGuard)!=null&&u.call(window)||d.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",d=>{d.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",d=>{var m,h,b;if(d.preventDefault(),e.classList.remove("is-dragover"),(m=window.demoGuard)!=null&&m.call(window))return;let u=(b=(h=d.dataTransfer)==null?void 0:h.files)==null?void 0:b[0];u&&u.name.endsWith(".zip")&&p(u)}),o.addEventListener("change",()=>{var u;let d=(u=o.files)==null?void 0:u[0];d&&p(d),o.value=""});async function p(d){var h,b;let u=document.querySelector(".vs-sys-grid");if(u){let y=u.querySelectorAll(".vs-sys-value"),g="";if(u.querySelectorAll(".vs-sys-label").forEach((C,$)=>{var S,B;C.textContent.trim()==="Upload Limit"&&(g=((B=(S=y[$])==null?void 0:S.textContent)==null?void 0:B.trim())||"")}),g){let C=v(g);if(C>0&&d.size>C){let $=(d.size/1024/1024).toFixed(1);c("File Too Large",`The update file is ${$} MB but your server's upload limit is ${g}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${$} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${d.name}" (${(d.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${d.name}...`;try{let y=new FormData;y.append("update_zip",d);let g=H.get("sessionToken"),C=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:g?{"X-VS-Token":g}:{},body:y}),$=C.headers.get("content-type")||"",S;if(!$.includes("application/json")){let R=await C.text();if(R.includes("POST Content-Length")||R.includes("upload_max_filesize")||R.includes("exceeds")){c("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}c("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}S=await C.json(),s.classList.add("hidden"),n.classList.remove("hidden");let B=document.getElementById("vs-update-result-icon"),D=document.getElementById("vs-update-result-message");if(S.ok){let R=S.data;B.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',D.innerHTML=`
          <div class="vs-update-result-title">${x(R.message)}</div>
          <div class="vs-update-result-meta">
            ${R.files_updated} files updated \xB7 ${R.files_skipped} preserved
            ${(h=R.errors)!=null&&h.length?` \xB7 ${R.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",((b=S.error)==null?void 0:b.message)||"Unknown error")}catch(y){let g=y.message||"Network error. Check your connection.";g.includes("Unexpected token")||g.includes("not valid JSON")?c("Server Upload Limit Exceeded",`The file (${(d.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):c("Upload Failed",x(g))}}}function c(d,u){s.classList.add("hidden"),n.classList.remove("hidden");let m=document.getElementById("vs-update-result-icon"),h=document.getElementById("vs-update-result-message");m.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',h.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${x(d)}</div>
      <div class="vs-update-result-meta">${u}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function v(d){let u=d.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!u)return 0;let m=parseFloat(u[1]),h=u[2].toUpperCase();return h==="GB"||h==="G"?m*1024*1024*1024:h==="MB"||h==="M"?m*1024*1024:h==="KB"||h==="K"?m*1024:0}}function Hi(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var l,r,p;if(i.preventDefault(),e.classList.remove("is-dragover"),(l=window.demoGuard)!=null&&l.call(window))return;let a=(p=(r=i.dataTransfer)==null?void 0:r.files)==null?void 0:p[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,l;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let r=await L.delete("/settings/favicon");r.ok?(M("Favicon removed.","success"),lt()):M(((l=r.error)==null?void 0:l.message)||"Could not remove favicon.","error")}catch{M("Could not remove favicon.","error")}}});async function o(i){var c;if(i.size>524288){M("Favicon must be under 512 KB.","error");return}let l=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!l.includes(i.type)){M("Favicon must be a .ico file.","error");return}let p=document.getElementById("vs-favicon-preview");p&&(p.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let v=new FormData;v.append("favicon",i);let d=H.get("sessionToken"),m=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:d?{"X-VS-Token":d}:{},body:v})).json();m.ok?(M("Favicon updated.","success"),lt()):(M(((c=m.error)==null?void 0:c.message)||"Upload failed.","error"),lt())}catch{M("Upload failed. Check your connection.","error"),lt()}}}function Vn(e,t,s){var r,p,c;(r=document.getElementById("vs-knowledge-overlay"))==null||r.remove();let n=v=>v.replace(/[_-]/g," ").replace(/\b\w/g,d=>d.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([v,d])=>{let u=typeof d=="object"?d.value||JSON.stringify(d):String(d),m=typeof d=="object"?d.confidence:null,h=m==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
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
          <div class="vs-knowledge-modal-icon">${s==="memory"?k.book:k.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${x(e)}</h2>
            <p class="vs-knowledge-modal-subtitle">${s==="memory"?"Facts the AI has learned about your business from conversations.":"Design decisions the AI uses to maintain visual consistency."}</p>
          </div>
        </div>
        <button id="vs-knowledge-close" class="vs-btn vs-btn-ghost vs-btn-icon" title="Close">${k.x}</button>
      </div>
      <div class="vs-knowledge-modal-body">
        ${o}
      </div>
      <div class="vs-knowledge-modal-footer">
        <span class="vs-knowledge-modal-hint">
          ${k.info}
          These values are managed by VoxelSite. Ask in chat to update them.
        </span>
        <button id="vs-knowledge-done" class="vs-btn vs-btn-primary vs-btn-sm">Done</button>
      </div>
    </div>
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",l)},l=v=>{v.key==="Escape"&&a()};document.addEventListener("keydown",l),(p=i.querySelector("#vs-knowledge-close"))==null||p.addEventListener("click",a),(c=i.querySelector("#vs-knowledge-done"))==null||c.addEventListener("click",a),ce(i,a)}function Ri(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Ni()})}function Di(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||qi()})}function qi(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-install-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let r=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()===a?Wn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?Wn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>de(t)),t.addEventListener("click",r=>{r.target===t&&de(t)});let l=r=>{r.key==="Escape"&&(de(t),document.removeEventListener("keydown",l))};document.addEventListener("keydown",l)}async function Wn(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await L.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let l=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=l,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function Zn(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function Ni(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let l=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()==="RESET"?Gn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?Gn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>de(t)),t.addEventListener("click",l=>{l.target===t&&de(t)});let a=l=>{l.key==="Escape"&&(de(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function Gn(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:l}=await L.post("/site/reset",{confirm:"RESET"});if(i){H.set("pages",[]),H.set("hasFormSchemas",!1),H.set("conversations",null),H.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{de(e),window.location.hash!=="#/chat"?Pe.navigate("chat"):Pe.refresh()},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let r=e.querySelector(".vs-modal-desc");if(r){let p=r.textContent;r.textContent=(l==null?void 0:l.message)||"Reset failed. Please try again.",r.style.color="var(--vs-error)",setTimeout(()=>{r.textContent=p,r.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function Fi(e){var s;let t=document.getElementById("set-ai-model");if(t)try{let{ok:n,data:o}=await L.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?t.innerHTML=o.models.map(i=>`<option value="${x(i.id)}" ${i.id===e?"selected":""}>${x(i.name||i.id)}</option>`).join(""):t.innerHTML='<option value="">Test your connection to load available models</option>'}catch{t.innerHTML='<option value="">Test your connection to load available models</option>'}}function je(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function Qs(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function zi(e,t){let s=e.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async c=>{var v;if((v=window.demoGuard)!=null&&v.call(window)){c.target.value=s;return}s=c.target.value,await L.put("/settings",{ai_provider:s}),lt()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var h,b,y,g,C;if((h=window.demoGuard)!=null&&h.call(window))return;let c=((b=i==null?void 0:i.value)==null?void 0:b.trim())||"",v=((g=(y=document.getElementById("set-base-url"))==null?void 0:y.value)==null?void 0:g.trim())||"";if(s!=="openai_compatible"&&(!c||c.startsWith("\u2022\u2022"))){tn("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:d,data:u,error:m}=await L.post("/settings/test-api",{provider:s,api_key:c.startsWith("\u2022\u2022")?"":c,base_url:v});if(o.textContent="Test Connection",o.disabled=!1,d){if(tn("\u2713 Connected successfully!","success"),(C=u==null?void 0:u.models)!=null&&C.length){let $=document.getElementById("set-ai-model");if($){let S=e[`ai_${s}_model`]||"";$.innerHTML=u.models.map(B=>`<option value="${x(B.id)}" ${B.id===S?"selected":""}>${x(B.name||B.id)}</option>`).join("")}}}else tn("\u2717 "+((m==null?void 0:m.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),l=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var u,m,h,b,y;if((u=window.demoGuard)!=null&&u.call(window))return;a.textContent="Saving...",a.disabled=!0;let c={site_name:((h=(m=document.getElementById("set-site-name"))==null?void 0:m.value)==null?void 0:h.trim())||"",site_tagline:((y=(b=document.getElementById("set-site-tagline"))==null?void 0:b.value)==null?void 0:y.trim())||""},{ok:v,error:d}=await L.put("/settings",c);if(a.textContent="Save Identity",a.disabled=!1,l){if(l.classList.remove("hidden"),v){l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3",H.set("siteName",c.site_name),document.title=c.site_name?`Studio \u2014 ${c.site_name}`:"Studio \u2014 VoxelSite";let g=document.querySelector(".vs-logo-text");g&&(g.textContent=c.site_name||"VoxelSite")}else l.textContent="\u2717 "+((d==null?void 0:d.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3";setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3)}});let r=document.getElementById("btn-save-settings"),p=document.getElementById("save-status");r&&r.addEventListener("click",async()=>{var h,b,y,g;if((h=window.demoGuard)!=null&&h.call(window))return;r.textContent="Saving...",r.disabled=!0;let c={ai_provider:s,[`ai_${s}_model`]:((b=document.getElementById("set-ai-model"))==null?void 0:b.value)||"",ai_max_tokens:parseInt(((y=document.getElementById("set-max-tokens"))==null?void 0:y.value)||"32000",10)},v=document.getElementById("set-base-url");v&&(c.ai_openai_compatible_base_url=v.value.trim());let d=(g=i==null?void 0:i.value)==null?void 0:g.trim();d&&!d.startsWith("\u2022\u2022")&&(c[`ai_${s}_api_key`]=d);let{ok:u,error:m}=await L.put("/settings",c);r.textContent="Save Settings",r.disabled=!1,p&&(p.classList.remove("hidden"),u?(p.textContent="\u2713 Saved",p.className="text-xs text-vs-success ml-3"):(p.textContent="\u2717 "+((m==null?void 0:m.message)||"Failed to save."),p.className="text-xs text-vs-error ml-3"),setTimeout(()=>p==null?void 0:p.classList.add("hidden"),3e3))})}function Oi(e,t){var u;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function l(){if(!e.smtp_host)return"gmail";for(let[m,h]of Object.entries(t))if(h.host&&h.host===e.smtp_host)return m;return"custom"}if(i){let m=l();i.value=m,a&&((u=t[m])!=null&&u.help)&&(a.textContent=t[m].help)}s&&s.addEventListener("change",()=>{let m=s.value;n&&(n.style.display=m==="smtp"?"block":"none"),o&&(o.style.display=m==="mailpit"?"block":"none");let h=document.getElementById("mail-common-fields");h&&(h.style.display=m==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let m=t[i.value];if(!m)return;let h=document.getElementById("set-smtp-host"),b=document.getElementById("set-smtp-port"),y=document.getElementById("set-smtp-encryption");h&&(h.value=m.host||""),b&&(b.value=m.port||587),y&&(y.value=m.encryption||"tls"),a&&(a.textContent=m.help||"")});let r=document.getElementById("btn-toggle-smtp-pass"),p=document.getElementById("set-smtp-password");r&&p&&r.addEventListener("click",()=>{let m=p.type==="password";p.type=m?"text":"password",r.innerHTML=m?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let c=document.getElementById("btn-mail-test");c&&c.addEventListener("click",async()=>{var C,$,S;if((C=window.demoGuard)!=null&&C.call(window))return;let m=(S=($=document.getElementById("set-mail-test-recipient"))==null?void 0:$.value)==null?void 0:S.trim();if(!m){en("Enter an email address to send the test to.","warning");return}c.textContent="Sending...",c.disabled=!0;let h=Kn();h.test_recipient=m;let{ok:b,data:y,error:g}=await L.post("/settings/mail/test",h);c.textContent="Send Test",c.disabled=!1,b?en("\u2713 "+((y==null?void 0:y.message)||"Test email sent successfully!"),"success"):en("\u2717 "+((g==null?void 0:g.message)||"Test failed."),"error")});let v=document.getElementById("btn-save-mail"),d=document.getElementById("save-mail-status");v&&v.addEventListener("click",async()=>{var y;if((y=window.demoGuard)!=null&&y.call(window))return;v.textContent="Saving...",v.disabled=!0;let m=Kn(),{ok:h,error:b}=await L.post("/settings/mail",m);v.textContent="Save Email Settings",v.disabled=!1,d&&(d.classList.remove("hidden"),h?(d.textContent="\u2713 Saved",d.className="text-xs text-vs-success ml-3"):(d.textContent="\u2717 "+((b==null?void 0:b.message)||"Failed to save."),d.className="text-xs text-vs-error ml-3"),setTimeout(()=>d==null?void 0:d.classList.add("hidden"),3e3))})}function Kn(){var t,s,n,o,i,a,l,r,p,c,v,d,u,m,h;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((r=(l=document.getElementById("set-smtp-host"))==null?void 0:l.value)==null?void 0:r.trim())||"",smtp_port:parseInt(((p=document.getElementById("set-smtp-port"))==null?void 0:p.value)||"587",10),smtp_username:((v=(c=document.getElementById("set-smtp-username"))==null?void 0:c.value)==null?void 0:v.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((d=document.getElementById("set-smtp-encryption"))==null?void 0:d.value)||"tls",mailpit_host:((m=(u=document.getElementById("set-mailpit-host"))==null?void 0:u.value)==null?void 0:m.trim())||"localhost",mailpit_port:parseInt(((h=document.getElementById("set-mailpit-port"))==null?void 0:h.value)||"1025",10)}}function en(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function tn(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}var sn={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},Ui={contact:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',newsletter:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',callback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',feedback:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>'};function Xn(){return setTimeout(()=>Vi(),0),`
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
  `}async function Vi(){var a,l,r,p,c,v;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let d=await Jn();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let $=function(S){let B=document.getElementById("bar-color-swatch"),D=document.getElementById("bar-brand-hex"),R=document.getElementById("bar-brand-color");B&&(B.style.background=S),D&&D!==document.activeElement&&(D.value=S),R&&(R.value=S),document.querySelectorAll(".bar-color-preset").forEach(O=>{O.style.borderColor=O.dataset.color.toLowerCase()===S.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:d,data:u}=await L.get("/agentic/actions/bar-settings"),m=d&&(u==null?void 0:u.settings)||{theme:"bottom-bar",visibility:"all-pages"},h=m.theme||"bottom-bar",b=m.visibility||"all-pages",y={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
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
      </svg>`},g={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},C={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(C).map(([S,B])=>`<option value="${S}" ${b===S?"selected":""}>${B}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(y).map(([S,B])=>{let D=S===h;return`
              <button type="button" class="bar-theme-option" data-theme="${S}" style="
                border: 2px solid ${D?"var(--vs-accent)":"var(--vs-border-subtle)"};
                background: ${D?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)"};
                border-radius: var(--radius-lg, 10px);
                padding: 14px 12px 10px;
                cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 8px;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.12s;
                color: ${D?"var(--vs-accent)":"var(--vs-text-ghost)"};
                position: relative;
                outline: none;
              "
                onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-medium)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}"
                onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-subtle)';this.style.transform='';this.style.boxShadow='';}"
              >
                <div style="width: 100%; max-width: 120px;">${B}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${D?"var(--vs-accent)":"var(--vs-text-secondary)"};">${g[S]}</span>
                ${D?`<div style="
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
              ${["light","dark"].map(S=>{let B=S===(m.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${S}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${B?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${B?"#fff":"var(--vs-text-secondary)"};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${{light:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',dark:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}[S]} ${S.charAt(0).toUpperCase()+S.slice(1)}</button>`}).join("")}
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
                ${["#EA580C","#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#374151"].map(S=>`
                  <button type="button" class="bar-color-preset" data-color="${S}" title="${S}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${S}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
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
    `,document.querySelectorAll(".bar-theme-option").forEach(S=>{S.addEventListener("click",async()=>{let B=S.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(R=>{let O=R.dataset.theme===B;R.style.borderColor=O?"var(--vs-accent)":"var(--vs-border-subtle)",R.style.background=O?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",R.style.color=O?"var(--vs-accent)":"var(--vs-text-ghost)",R.classList.toggle("active",O);let K=R.querySelector("span");K&&(K.style.color=O?"var(--vs-accent)":"var(--vs-text-secondary)");let V=R.querySelector('[style*="position: absolute"]');if(V&&!O&&V.remove(),O&&!R.querySelector('[style*="position: absolute"]')){let T=document.createElement("div");T.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",T.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',R.appendChild(T)}});let{ok:D}=await L.put("/agentic/actions/bar-settings",{theme:B});D&&(S.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>S.style.boxShadow="",400),M("Bar style updated","success"))})}),(l=document.getElementById("bar-visibility"))==null||l.addEventListener("change",async S=>{let{ok:B}=await L.put("/agentic/actions/bar-settings",{visibility:S.target.value});B&&M("Bar visibility updated","success")}),document.querySelectorAll(".bar-scheme-btn").forEach(S=>{S.addEventListener("click",async()=>{let B=S.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(R=>{let O=R.dataset.scheme===B;R.style.background=O?"var(--vs-accent)":"var(--vs-bg-surface)",R.style.color=O?"#fff":"var(--vs-text-secondary)"});let{ok:D}=await L.put("/agentic/actions/bar-settings",{color_scheme:B});D&&M("Color scheme updated","success")})}),(r=document.getElementById("bar-brand-color"))==null||r.addEventListener("input",S=>{$(S.target.value)}),(p=document.getElementById("bar-brand-color"))==null||p.addEventListener("change",async S=>{let{ok:B}=await L.put("/agentic/actions/bar-settings",{brand_color:S.target.value});B&&M("Brand color updated","success")}),(c=document.getElementById("bar-brand-hex"))==null||c.addEventListener("change",async S=>{let B=S.target.value.trim();if(B.startsWith("#")||(B="#"+B),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(B)){$(B);let{ok:D}=await L.put("/agentic/actions/bar-settings",{brand_color:B});D&&M("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach(S=>{S.addEventListener("click",async()=>{let B=S.dataset.color;$(B);let{ok:D}=await L.put("/agentic/actions/bar-settings",{brand_color:B});D&&M("Brand color updated","success")})}),$(m.brand_color||"#EA580C")}let{ok:s,data:n}=await L.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon" style="color: var(--vs-accent);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p class="vs-empty-state-title">No actions yet</p>
          <p class="vs-empty-state-desc">Create your first agent action to let AI assistants and website visitors interact with your business \u2014 reservations, appointments, quotes, and more.</p>
          <button id="btn-empty-new-action" class="vs-btn vs-btn-primary vs-btn-sm" style="margin-top: 12px;">${k.plus} New Action</button>
        </div>
      </div>
    `,(v=document.getElementById("btn-empty-new-action"))==null||v.addEventListener("click",async()=>{let d=await Jn();d!=null&&d.ok&&d.actionId&&(window.location.hash=`#/actions/${d.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((d,u)=>{let m=d.active,h=d._stats||d.stats||{},b=h.total||0,y=h.last_created_at?zt(h.last_created_at):"\u2014",g={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},C=g[d.icon]||g.circle;return`
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
              ${C}
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
                <span>${b} record${b!==1?"s":""}</span>
                ${h.today>0?`<span class="vs-form-card-dot">\xB7</span><span>+${h.today} today</span>`:""}
                <span class="vs-form-card-dot">\xB7</span>
                <span>${y}</span>
              </div>
            </div>
            <div class="vs-form-card-right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="vs-form-card-chevron"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        `}).join("")}
    </div>
  `,document.querySelectorAll(".vs-action-list-row").forEach(d=>{d.addEventListener("click",u=>{if(u.target.closest(".vs-action-reorder"))return;let m=d.dataset.actionId;m&&(window.location.hash="#/actions/"+encodeURIComponent(m))})});async function i(){let d=document.querySelectorAll("#actions-list .vs-action-list-row"),u=Array.from(d).map(m=>m.dataset.actionId);await L.post("/agentic/actions/reorder",{order:u})}document.querySelectorAll(".action-move-up").forEach(d=>{d.addEventListener("click",async u=>{u.preventDefault(),u.stopPropagation();let m=d.closest(".vs-action-list-row"),h=m==null?void 0:m.previousElementSibling;h&&(m.parentNode.insertBefore(m,h),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(d=>{d.addEventListener("click",async u=>{u.preventDefault(),u.stopPropagation();let m=d.closest(".vs-action-list-row"),h=m==null?void 0:m.nextElementSibling;h&&(m.parentNode.insertBefore(h,m),m.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>m.style.boxShadow="",300),await i())})})}async function Jn(){return new Promise(async e=>{var l;let{ok:t,data:s}=await L.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 580px;">
        <div class="vs-modal-header" style="display: flex; align-items: flex-start; justify-content: space-between;">
          <h2 class="vs-modal-title" style="margin: 0;">${k.zap} New Agent Action</h2>
          <button id="close-new-action-modal" style="background: none; border: none; cursor: pointer; color: var(--vs-text-ghost); padding: 4px; margin: -4px -4px 0 0; line-height: 0; border-radius: var(--radius-md); transition: color 0.15s ease;" onmouseenter="this.style.color='var(--vs-text-primary)'" onmouseleave="this.style.color='var(--vs-text-ghost)'">${k.x}</button>
        </div>
        <div class="vs-modal-body" style="padding: 20px;">
          <p class="text-sm text-vs-text-secondary" style="margin-bottom: 16px;">Choose a template to get started:</p>
          <div id="template-grid" style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          ">
            ${n.map(r=>`
              <button class="vs-template-card" data-template-id="${x(r.id)}" style="
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 12px; border-radius: 10px;
                border: 1.5px solid var(--vs-border);
                background: var(--vs-bg-floating);
                cursor: pointer; transition: all 0.15s ease;
                text-align: center; gap: 6px;
              ">
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${Ui[r.id]||k.zap}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary);">${x(r.name)}</span>
                <span style="font-size: 11px; color: var(--vs-text-tertiary); line-height: 1.3;">${x(r.description||"")}</span>
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
              <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: transparent; color: var(--vs-text-ghost);">${k.plus}</span>
              <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-secondary);">Blank</span>
              <span style="font-size: 11px; color: var(--vs-text-ghost); line-height: 1.3;">Start from scratch</span>
            </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(r=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(r)},a=r=>{r.key==="Escape"&&(r.preventDefault(),i())};document.addEventListener("keydown",a),ce(o,i),(l=document.getElementById("close-new-action-modal"))==null||l.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(r=>{r.addEventListener("mouseenter",()=>{r.style.borderColor="var(--vs-accent)",r.style.background="var(--vs-bg-raised)"}),r.addEventListener("mouseleave",()=>{r.style.borderColor=(r.dataset.templateId==="blank","var(--vs-border)"),r.style.background=r.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),r.addEventListener("click",async()=>{var c,v;let p=r.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(d=>{d.style.pointerEvents="none",d.style.opacity="0.5"}),r.style.opacity="1",r.style.borderColor="var(--vs-accent)",p==="blank"){let d={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"email",type:"email",label:"Email",placeholder:"you@example.com",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:u,data:m}=await L.post("/agentic/actions",d);u&&(m!=null&&m.action)?(M("Action created","success"),i({ok:!0,actionId:m.action.id})):(M(((c=m==null?void 0:m.error)==null?void 0:c.message)||"Failed to create action","error"),i())}else{let{ok:d,data:u}=await L.post("/agentic/actions/from-template",{template_id:p});d&&(u!=null&&u.action)?(M(`${u.action.name} created`,"success"),i({ok:!0,actionId:u.action.id})):(M(((v=u==null?void 0:u.error)==null?void 0:v.message)||"Failed to create action","error"),i())}})})})}function Qn(e){return setTimeout(()=>fs(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function fs(e){var p,c,v,d,u,m,h,b,y,g,C,$,S,B,D,R,O,K,V,T;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await L.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,l=i.stats||{},r=a.active;if(t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${x(a.name||e)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${x(a.name||e)}</h1>
        <div class="flex items-center gap-2">
          <button id="btn-toggle-active" class="vs-btn ${r?"vs-btn-secondary":"vs-btn-primary"} vs-btn-sm" title="${r?"Deactivate this action":"Activate this action on your website"}">
            ${r?"\u25CF Live \u2014 click to deactivate":"\u25CB Draft \u2014 click to go live"}
          </button>
          <button id="btn-duplicate-action" class="vs-btn vs-btn-ghost vs-btn-sm" title="Duplicate">
            ${k.copy} Duplicate
          </button>
          <button id="btn-delete-action" class="vs-btn vs-btn-ghost vs-btn-sm" style="color: var(--vs-error);" title="Delete">
            ${k.trash}
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
  `,s){let F=function(f){let P=f.querySelector(".field-required");if(!P)return;let U=f.querySelectorAll("span")[0],w=f.querySelectorAll("span")[1],I=()=>{U.style.background=P.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",w.style.left=P.checked?"18px":"2px"};P.addEventListener("change",I)},me=function(f){return f.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},Se=function(){let f=document.querySelectorAll("#action-fields-builder .vs-field-row"),P=[],U=new Set;return f.forEach(w=>{var Y,G,z,Q;let I=((G=(Y=w.querySelector(".field-label"))==null?void 0:Y.value)==null?void 0:G.trim())||"",_=((z=w.querySelector(".field-type"))==null?void 0:z.value)||"text",j=((Q=w.querySelector(".field-required"))==null?void 0:Q.checked)||!1,q=I?me(I):"";if(U.has(q)){let Z=2;for(;U.has(q+"_"+Z);)Z++;q=q+"_"+Z}if(U.add(q),q&&I){let Z={name:q,type:_,label:I,required:j},ee=w.dataset.placeholder;ee&&(Z.placeholder=ee);let oe=w.dataset.default;oe&&(Z.default_value=oe);let $e=w.dataset.description;$e&&(Z.description=$e);let be=w.dataset.min;be!==""&&be!==void 0&&(Z.min=Number(be));let ye=w.dataset.max;ye!==""&&ye!==void 0&&(Z.max=Number(ye));let xe=w.dataset.maxlength;xe&&(Z.max_length=Number(xe));let Te=w.dataset.minlength;Te&&(Z.min_length=Number(Te));let se=w.dataset.options;if(se)try{Z.options=JSON.parse(se)}catch{Z.options=se.split(",").map(_e=>_e.trim()).filter(Boolean)}if(_==="file"){let Me=w.dataset.allowedExtensions;if(Me)try{Z.allowed_extensions=JSON.parse(Me)}catch{Z.allowed_extensions=Me.split(",").map(os=>os.trim().toLowerCase()).filter(Boolean)}let _e=w.dataset.maxSizeMb;_e&&(Z.max_size_mb=Number(_e))}_==="checkbox"&&w.dataset.checkedDefault==="true"&&(Z.checked_default=!0),P.push(Z)}}),P},He=function(f){var P,U;(P=f.querySelector(".field-move-up"))==null||P.addEventListener("click",()=>{let w=f.previousElementSibling;w&&(f.parentNode.insertBefore(f,w),f.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>f.style.boxShadow="",300))}),(U=f.querySelector(".field-move-down"))==null||U.addEventListener("click",()=>{let w=f.nextElementSibling;w&&(f.parentNode.insertBefore(w,f),f.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>f.style.boxShadow="",300))})},Ge=function(f){f.addEventListener("click",async()=>{let P=f.closest(".vs-field-row");await pe({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&(P.style.opacity="0",P.style.transform="translateX(20px)",P.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>P.remove(),200))})},ot=function(f){f&&f.addEventListener("click",()=>{var I,_,j;let P=f.closest(".vs-field-row");if(!P)return;let U=((I=P.querySelector(".field-type"))==null?void 0:I.value)||"text",w=((_=P.querySelector(".field-label"))==null?void 0:_.value)||((j=P.querySelector(".field-name"))==null?void 0:j.value)||"Field";pt(P,U,w)})},pt=function(f,P,U){var os,hn,fn,bn,yn;(os=document.getElementById("vs-field-settings-modal"))==null||os.remove();let w=f.dataset.placeholder||"",I=f.dataset.default||"",_=f.dataset.min||"",j=f.dataset.max||"",q=f.dataset.maxlength||"",Y=f.dataset.options||"[]",G=f.dataset.description||"",z=["text","email","tel","url","textarea"].includes(P),Q=P==="number",Z=["text","email","tel","url","textarea"].includes(P),ee=["select","radio","multiselect"].includes(P),oe=P==="multiselect",$e=P==="file",be=P==="checkbox",ye="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",xe="margin-bottom: 16px;",Te="";if(z&&(Te+=`<div style="${xe}">
          <label style="${ye}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${le(w)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),!$e&&!be&&(Te+=`<div style="${xe}">
          <label style="${ye}">Default Value</label>
          <input type="${Q?"number":"text"}" id="fs-default" class="vs-input" value="${le(I)}" placeholder="Pre-filled value" />
        </div>`),be&&(Te+=`<div style="${xe}">
          <label style="${ye}">Value <span style="color: var(--vs-text-ghost); font-weight: 400;">(sent when checked \u2014 defaults to field name if empty)</span></label>
          <input type="text" id="fs-default" class="vs-input" value="${le(I)}" placeholder="e.g. yes, true, 1" />
        </div>
        <div style="${xe}">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <span style="position: relative; display: inline-flex; align-items: center; width: 36px; height: 20px; flex-shrink: 0;">
              <input type="checkbox" id="fs-checked-default" ${f.dataset.checkedDefault==="true"?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; inset: 0; border-radius: 10px;
                background: ${f.dataset.checkedDefault==="true"?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                transition: background 0.2s ease;
              "></span>
              <span style="
                position: absolute; left: ${f.dataset.checkedDefault==="true"?"18px":"2px"}; top: 2px;
                width: 16px; height: 16px; border-radius: 50%;
                background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: left 0.2s ease;
              "></span>
            </span>
            <span style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary);">Selected by default</span>
          </label>
        </div>`),Q&&(Te+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${xe}">
          <div>
            <label style="${ye}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${le(_)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${ye}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${le(j)}" placeholder="No limit" />
          </div>
        </div>`),Z&&(Te+=`<div style="${xe}">
          <label style="${ye}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${le(q)}" placeholder="No limit" min="1" />
        </div>`),ee){let ge;try{ge=JSON.parse(Y)}catch{ge=Y.split(",").map(Le=>Le.trim()).filter(Boolean)}let Ce;if(oe){let we=(f.dataset.default||"").split(",").map(Le=>Le.trim()).filter(Boolean);Ce=ge.map(Le=>we.includes(Le)?"[x] "+Le:Le).join(`
`)}else Ce=ge.join(`
`);Te+=`<div style="${xe}">
          <label style="${ye}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${oe?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${oe?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${x(Ce)}</textarea>
        </div>`}if($e){let ge=f.dataset.allowedExtensions||"",Ce=f.dataset.maxSizeMb||"10",we;try{we=ge?JSON.parse(ge):[]}catch{we=[]}let Le=we.join(", "),Re=["pdf","doc","docx","xls","xlsx","csv","txt"],Ht=["jpg","jpeg","png","gif","webp"],Rt=["zip","rar"],is=Re.some(it=>we.includes(it)),as=Ht.some(it=>we.includes(it)),rs=Rt.some(it=>we.includes(it));Te+=`<div style="${xe}">
          <label style="${ye}">Allowed File Types</label>
          <div style="display: flex; gap: 12px; margin-bottom: 8px; flex-wrap: wrap;">
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Re)}' ${is?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Documents
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Ht)}' ${as?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Images
            </label>
            <label class="vs-checkbox-label" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; position: relative;">
              <input type="checkbox" class="vs-checkbox fs-ext-group" data-exts='${JSON.stringify(Rt)}' ${rs?"checked":""} />
              <span class="vs-checkbox-box"></span>
              Archives
            </label>
          </div>
          <input type="text" id="fs-allowed-extensions" class="vs-input" value="${le(Le)}" placeholder="pdf, jpg, png, doc, docx" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Comma-separated extensions. Leave empty for default set.</div>
        </div>
        <div style="${xe}">
          <label style="${ye}">Max File Size (MB)</label>
          <input type="number" id="fs-max-size-mb" class="vs-input" value="${le(Ce)}" placeholder="10" min="1" max="50" />
          <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Maximum: 50 MB</div>
        </div>`}Te+=`<div style="${xe}">
        <label style="${ye}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${le(G)}" placeholder="Optional description or instructions" />
      </div>`;let se=document.createElement("div");if(se.id="vs-field-settings-modal",se.style.cssText="position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;",se.innerHTML=`
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
                ${x(U)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${P}
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
            ${Te}
          </div>
          <div style="
            padding: 16px 24px; border-top: 1px solid var(--vs-border-subtle);
            display: flex; justify-content: flex-end; gap: 8px;
          ">
            <button id="fs-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
            <button id="fs-save" class="vs-btn vs-btn-primary vs-btn-sm">Apply</button>
          </div>
        </div>
      `,document.body.appendChild(se),setTimeout(()=>{var ge;return(ge=se.querySelector("input, textarea"))==null?void 0:ge.focus()},100),$e&&se.querySelectorAll(".fs-ext-group").forEach(ge=>{ge.addEventListener("change",()=>{let Ce=se.querySelector("#fs-allowed-extensions");if(!Ce)return;let we=Ce.value.split(",").map(Re=>Re.trim().toLowerCase()).filter(Boolean),Le=JSON.parse(ge.dataset.exts||"[]");ge.checked?Le.forEach(Re=>{we.includes(Re)||we.push(Re)}):we=we.filter(Re=>!Le.includes(Re)),Ce.value=we.join(", ")})}),be){let ge=(hn=se.querySelector("#fs-checked-default"))==null?void 0:hn.closest("label");if(ge){let Ce=se.querySelector("#fs-checked-default"),we=ge.querySelectorAll("span > span")[0],Le=ge.querySelectorAll("span > span")[1];Ce==null||Ce.addEventListener("change",()=>{we&&(we.style.background=Ce.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),Le&&(Le.style.left=Ce.checked?"18px":"2px")})}}let Me=()=>se.remove(),_e=se.querySelector("#fs-backdrop");_e&&ce(_e,Me),(fn=se.querySelector("#fs-close"))==null||fn.addEventListener("click",Me),(bn=se.querySelector("#fs-cancel"))==null||bn.addEventListener("click",Me);let As=ge=>{ge.key==="Escape"&&(Me(),document.removeEventListener("keydown",As))};document.addEventListener("keydown",As),(yn=se.querySelector("#fs-save"))==null||yn.addEventListener("click",()=>{var ge,Ce,we,Le,Re,Ht,Rt,is,as,rs;if(z&&(f.dataset.placeholder=((ge=se.querySelector("#fs-placeholder"))==null?void 0:ge.value)||""),$e||(f.dataset.default=((Ce=se.querySelector("#fs-default"))==null?void 0:Ce.value)||""),be&&(f.dataset.checkedDefault=(we=se.querySelector("#fs-checked-default"))!=null&&we.checked?"true":"false"),Q&&(f.dataset.min=((Le=se.querySelector("#fs-min"))==null?void 0:Le.value)||"",f.dataset.max=((Re=se.querySelector("#fs-max"))==null?void 0:Re.value)||""),Z&&(f.dataset.maxlength=((Ht=se.querySelector("#fs-maxlength"))==null?void 0:Ht.value)||""),ee){let Dt=(((Rt=se.querySelector("#fs-options"))==null?void 0:Rt.value)||"").split(/[\n]/).map(vt=>vt.trim()).filter(Boolean);if(oe){let vt=[],ls=[];Dt.forEach(xn=>{let _s=xn.match(/^\[x\]\s*(.+)$/i);_s?(vt.push(_s[1].trim()),ls.push(_s[1].trim())):vt.push(xn)}),f.dataset.options=JSON.stringify(vt),f.dataset.default=ls.join(",")}else f.dataset.options=JSON.stringify(Dt)}if($e){let Dt=(((is=se.querySelector("#fs-allowed-extensions"))==null?void 0:is.value)||"").split(",").map(ls=>ls.trim().toLowerCase()).filter(Boolean);f.dataset.allowedExtensions=Dt.length>0?JSON.stringify(Dt):"";let vt=((as=se.querySelector("#fs-max-size-mb"))==null?void 0:as.value)||"10";f.dataset.maxSizeMb=String(Math.min(Math.max(parseInt(vt)||10,1),50))}f.dataset.description=((rs=se.querySelector("#fs-description"))==null?void 0:rs.value)||"",f.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>f.style.boxShadow="",400),Me(),M("Field settings updated","success")})},J="make_"+e.replace(/-/g,"_"),X={number:"number",checkbox:"boolean",multiselect:"array"},E={},A=[];(a.fields||[]).forEach(f=>{let U={type:X[f.type]||"string"},w=f.label||f.name;f.require_future?U.description=w+" (must be in the future)":w&&(U.description=w),f.min!==void 0&&f.min!==""&&(U.minimum=f.min),f.max!==void 0&&f.max!==""&&(U.maximum=f.max),f.min_length&&(U.minLength=f.min_length),f.max_length&&(U.maxLength=f.max_length),f.options&&f.options.length>0&&(f.type==="multiselect"?U.items={type:"string",enum:f.options}:U.enum=f.options),E[f.name]=U,f.required&&A.push(f.name)});let N={name:J,description:a.description||a.name,inputSchema:{type:"object",properties:E,required:A}},W=JSON.stringify(N,null,2),te=x(W),ve=r?'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-success);background:rgba(34,197,94,0.06);">\u25CF Discoverable by agents</span>':'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:3px 8px;border-radius:4px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);">\u25CB Draft \u2014 not visible to agents</span>',fe=['<div style="margin-bottom: 16px;">','<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">','<span style="font-size: 12px; color: var(--vs-text-ghost);">Tool name</span>',`<code style="font-size:13px;font-weight:600;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-accent);background:var(--vs-bg-raised);padding:3px 10px;border-radius:var(--radius-sm);letter-spacing:-0.01em;">`+x(J)+"</code>","</div>",'<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">','<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'," /mcp.php","</span>",'<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--vs-text-ghost);background:var(--vs-bg-raised);padding:3px 8px;border-radius:4px;">','<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'," /actions/manifest.json","</span>",ve,"</div>","</div>",'<div style="position: relative;">',`<pre style="margin:0;padding:16px;border-radius:var(--radius-md);background:var(--vs-bg-surface);border:1px solid var(--vs-border-subtle);font-size:12px;line-height:1.6;overflow-x:auto;font-family:'SF Mono','Fira Code','Cascadia Code',monospace;color:var(--vs-text-secondary);-webkit-overflow-scrolling:touch;"><code id="agent-schema-json">`+te+"</code></pre>",`<button id="btn-copy-schema" title="Copy schema" style="position:absolute;top:8px;right:8px;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-md);border:1px solid var(--vs-border-subtle);background:var(--vs-bg-floating);color:var(--vs-text-ghost);cursor:pointer;transition:all 0.15s ease;" onmouseenter="this.style.borderColor='var(--vs-border)';this.style.color='var(--vs-text-secondary)';" onmouseleave="this.style.borderColor='var(--vs-border-subtle)';this.style.color='var(--vs-text-ghost)';">`+k.copy+"</button>","</div>",'<p style="margin:12px 0 0;font-size:11px;color:var(--vs-text-ghost);line-height:1.5;">',`This schema is generated from your fields above. AI agents receive it when they call <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">tools/list</code> on your site's MCP endpoint.<br>`,'Open <code style="font-size:10px;background:var(--vs-bg-raised);padding:1px 5px;border-radius:3px;">/actions/manifest.json</code> in a browser to see the full manifest.',"</p>"].join("");s.innerHTML=`
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
              <input type="text" id="action-button-label" class="vs-input" value="${x(a.bar_button_label||"")}" placeholder="${le(a.name||"e.g. Register")}" />
              <div style="font-size: 11px; color: var(--vs-text-ghost); margin-top: 4px;">Short label for the bar button. Defaults to the action name.</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-vs-text-secondary mb-1">Icon</label>
              <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${[["calendar","Calendar"],["clock","Clock"],["utensils","Utensils"],["file-text","Document"],["list","List"],["shopping-bag","Shop"],["ticket","Ticket"],["message-square","Message"],["users","People"],["mail","Mail"],["star","Star"],["circle","Default"]].map(([f,P])=>`
                  <button type="button" class="vs-icon-pick" data-icon="${f}" title="${P}" style="
                    display: flex; align-items: center; justify-content: center;
                    width: 42px; height: 42px; border-radius: var(--radius-md);
                    border: 1.5px solid ${(a.icon||"circle")===f?"var(--vs-accent)":"var(--vs-border)"};
                    background: ${(a.icon||"circle")===f?"var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))":"var(--vs-bg-floating)"};
                    color: ${(a.icon||"circle")===f?"var(--vs-accent)":"var(--vs-text-ghost)"};
                    cursor: pointer; transition: all 0.15s ease;
                  "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',"shopping-bag":'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',circle:'<circle cx="12" cy="12" r="10"/>'}[f]}</svg></button>
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
                    position: absolute; left: ${(y=(b=a.constraints)==null?void 0:b.uniqueness)!=null&&y.enabled?"2px":"18px"}; top: 2px;
                    width: 16px; height: 16px; border-radius: 50%;
                    background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: left 0.2s ease;
                  "></span>
                </span>
                <span style="font-size: 13px; color: var(--vs-text-secondary);">Same email can submit multiple times</span>
              </label>
            </div>
            <div id="action-duplicate-msg-wrap" style="${(C=(g=a.constraints)==null?void 0:g.uniqueness)!=null&&C.enabled?"":"display: none;"}">
              <label for="action-duplicate-msg" class="block text-sm font-medium text-vs-text-secondary mb-1">Rejection message</label>
              <input type="text" id="action-duplicate-msg" class="vs-input" value="${x((($=a.responses)==null?void 0:$.duplicate)||"")}"
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
          <button id="btn-add-field" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-bottom: 12px;">${k.plus||"+"} Add Field</button>
        </div>
        <div id="action-fields-builder" style="display: flex; flex-direction: column; gap: 6px;">
          ${(a.fields||[]).map((f,P)=>`
            <div class="vs-field-row" data-field-idx="${P}"
              data-field-name="${le(f.name||"")}"
              data-placeholder="${le(f.placeholder||"")}"
              data-default="${le(f.default_value||f.default||"")}"
              data-min="${f.min!==void 0?f.min:""}"
              data-max="${f.max!==void 0?f.max:""}"
              data-maxlength="${f.max_length||""}"
              data-minlength="${f.min_length||""}"
              data-options="${le(JSON.stringify(f.options||[]))}"
              data-description="${le(f.description||"")}"
              ${f.allowed_extensions?`data-allowed-extensions="${le(JSON.stringify(f.allowed_extensions))}"`:""}
              ${f.max_size_mb?`data-max-size-mb="${f.max_size_mb}"`:""}
              ${f.checked_default?'data-checked-default="true"':""}
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
                " ${P===0?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${P===(a.fields||[]).length-1?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${x(f.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(U=>`<option value="${U}" ${f.type===U?"selected":""}>${U==="multiselect"?"multi-select":U}</option>`).join("")}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${f.required?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${f.required?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${f.required?"18px":"2px"}; top: 2px;
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
                ${k.trash}
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
          ${fe}
        </div>
      </details>
    `,document.querySelectorAll(".field-required").forEach(f=>{F(f.closest("label"))});let re=document.getElementById("action-allow-duplicates");if(re){let f=re.closest("label"),P=f==null?void 0:f.querySelector(".vs-toggle-track"),U=f==null?void 0:f.querySelector(".vs-toggle-thumb");re.addEventListener("change",()=>{P&&(P.style.background=re.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"),U&&(U.style.left=re.checked?"18px":"2px");let w=document.getElementById("action-duplicate-msg-wrap");w&&(w.style.display=re.checked?"none":"")})}document.querySelectorAll(".vs-icon-pick").forEach(f=>{f.addEventListener("mouseenter",()=>{var P;f.dataset.icon!==((P=document.getElementById("action-icon"))==null?void 0:P.value)&&(f.style.borderColor="var(--vs-accent)",f.style.color="var(--vs-text-secondary)")}),f.addEventListener("mouseleave",()=>{var P;f.dataset.icon!==((P=document.getElementById("action-icon"))==null?void 0:P.value)&&(f.style.borderColor="var(--vs-border)",f.style.color="var(--vs-text-ghost)")}),f.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach(P=>{P.style.borderColor="var(--vs-border)",P.style.background="var(--vs-bg-floating)",P.style.color="var(--vs-text-ghost)"}),f.style.borderColor="var(--vs-accent)",f.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",f.style.color="var(--vs-accent)",document.getElementById("action-icon").value=f.dataset.icon})}),(S=document.getElementById("btn-save-action"))==null||S.addEventListener("click",async()=>{var _,j,q,Y,G,z,Q,Z,ee;let f={...a};if(f.name=((_=document.getElementById("action-name"))==null?void 0:_.value)||a.name,f.bar_button_label=((j=document.getElementById("action-button-label"))==null?void 0:j.value)||"",f.description=((q=document.getElementById("action-description"))==null?void 0:q.value)||"",f.icon=((Y=document.getElementById("action-icon"))==null?void 0:Y.value)||"circle",((G=document.getElementById("action-allow-duplicates"))==null?void 0:G.checked)??!0)(z=f.constraints)!=null&&z.uniqueness&&(f.constraints.uniqueness.enabled=!1);else{let oe=(a.fields||[]).filter(be=>be.type==="email").map(be=>be.name),$e=oe.length>0?oe:["email"];f.constraints={...f.constraints||{},uniqueness:{enabled:!0,fields:$e,scope_statuses:["confirmed","pending"]}}}let U=((Q=document.getElementById("action-duplicate-msg"))==null?void 0:Q.value)||"";U?f.responses={...f.responses||{},duplicate:U}:(Z=f.responses)!=null&&Z.duplicate&&delete f.responses.duplicate;let{ok:w,data:I}=await L.put(`/agentic/actions/${encodeURIComponent(e)}`,f);M(w?"Action saved":((ee=I==null?void 0:I.error)==null?void 0:ee.message)||"Failed to save",w?"success":"error"),w&&fs(e)});async function De(){var j;let f=document.querySelectorAll("#action-fields-builder .vs-field-row"),P=!1;if(f.forEach(q=>{var G,z;(z=(G=q.querySelector(".field-label"))==null?void 0:G.value)!=null&&z.trim()||(P=!0,q.style.borderColor="var(--vs-error, #ef4444)",q.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{q.style.borderColor="var(--vs-border-subtle)",q.style.boxShadow=""},2e3))}),P){M("Every field needs a label","warning");return}let U=Se();if(U.length===0){M("At least one field is required","warning");return}let w={...a,fields:U},{ok:I,data:_}=await L.put(`/agentic/actions/${encodeURIComponent(e)}`,w);M(I?"Fields saved":((j=_==null?void 0:_.error)==null?void 0:j.message)||"Failed to save",I?"success":"error"),I&&fs(e)}(B=document.getElementById("btn-save-fields"))==null||B.addEventListener("click",De),(D=document.getElementById("btn-add-field"))==null||D.addEventListener("click",()=>{var w,I;let f=document.getElementById("action-fields-builder");if(!f)return;let P=document.createElement("div");P.className="vs-field-row",P.dataset.fieldName="",P.dataset.placeholder="",P.dataset.default="",P.dataset.min="",P.dataset.max="",P.dataset.maxlength="",P.dataset.options="",P.dataset.description="",P.style.cssText=`
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;let U='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';P.innerHTML=`
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
          ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","file","hidden"].map(_=>`<option value="${_}">${_==="multiselect"?"multi-select":_}</option>`).join("")}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${U}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${k.trash}
        </button>
      `,f.appendChild(P),(w=P.querySelector(".field-label"))==null||w.focus(),F((I=P.querySelector(".field-required"))==null?void 0:I.closest("label")),He(P),Ge(P.querySelector(".field-delete")),ot(P.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(He),document.querySelectorAll(".field-delete").forEach(Ge),document.querySelectorAll(".field-settings").forEach(ot),(R=document.getElementById("btn-copy-schema"))==null||R.addEventListener("click",()=>{var P;let f=((P=document.getElementById("agent-schema-json"))==null?void 0:P.textContent)||"";navigator.clipboard.writeText(f).then(()=>{M("Schema copied","success")}).catch(()=>{let U=document.createElement("textarea");U.value=f,U.style.position="fixed",U.style.opacity="0",document.body.appendChild(U),U.select(),document.execCommand("copy"),document.body.removeChild(U),M("Schema copied","success")})}),(O=document.getElementById("agent-preview-section"))==null||O.addEventListener("toggle",f=>{let P=f.target.querySelector(".agent-preview-chevron");P&&(P.style.transform=f.target.open?"rotate(180deg)":"rotate(0)")}),(K=document.getElementById("btn-toggle-active"))==null||K.addEventListener("click",async()=>{let f={...a,active:!r},{ok:P}=await L.put(`/agentic/actions/${encodeURIComponent(e)}`,f);P?(M(f.active?"Action activated":"Action deactivated","success"),fs(e)):M("Failed to update status","error")}),(V=document.getElementById("btn-duplicate-action"))==null||V.addEventListener("click",async()=>{var w;if(!await pe({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:P,data:U}=await L.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});P&&(U!=null&&U.action)?(M(`"${U.action.name}" created`,"success"),window.location.hash=`#/actions/${U.action.id}`):M(((w=U==null?void 0:U.error)==null?void 0:w.message)||"Failed to duplicate","error")}),(T=document.getElementById("btn-delete-action"))==null||T.addEventListener("click",async()=>{if(await pe({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:P}=await L.delete(`/agentic/actions/${encodeURIComponent(e)}`);P?(M("Action deleted","success"),window.location.hash="#/actions"):M("Failed to delete action","error")}})}await It(e,1)}async function It(e,t=1){var m,h,b,y,g,C,$,S;let s=document.getElementById("action-records");if(!s)return;let n=((m=document.getElementById("action-filter-status"))==null?void 0:m.value)||"all",o=((h=document.getElementById("action-filter-search"))==null?void 0:h.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:l}=await L.get(i);if(!a||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let r=l.records||[],p=l.total||0,c=l.per_page||20,v=Math.ceil(p/c);s.innerHTML=`
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
          <button id="btn-purge-records" class="vs-btn vs-btn-secondary vs-btn-sm" title="Remove old records" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""}>
            ${k.trash} Purge Old
          </button>
          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${p===0?"No records to export":"Download records as CSV"}">
            ${k.download} Export CSV
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
              ${r.map(B=>{let D=typeof B.data=="string"?JSON.parse(B.data):B.data,R=Object.fromEntries(Object.entries(D||{}).filter(([E])=>!E.startsWith("_"))),O=Object.values(R).filter(E=>typeof E=="string"&&E.length>0).slice(0,2).join(" \xB7 "),K=Object.values(R).filter(E=>E&&typeof E=="object"&&E.original_name).length,V=K>0?`<span style="display: inline-flex; align-items: center; gap: 2px; color: var(--vs-text-ghost); margin-left: ${O?"6px":"0"};" title="${K} file${K>1?"s":""} attached"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>${K>1?'<span style="font-size: 10px;">'+K+"</span>":""}</span>`:"",T=O||(K>0?"":"\u2014"),J=sn[B.status]||sn.pending,X=B.source==="web"?"Website":B.source==="mcp"?"MCP":B.source==="api"?"API":B.source||"Website";return`
                  <tr style="border-bottom: 1px solid var(--vs-border-dim);" data-record-id="${B.id}" class="vs-record-row">
                    <td style="padding: 8px 6px 8px 12px; width: 32px; vertical-align: middle;">
                      <button type="button" class="vs-record-toggle" data-rid="${B.id}" title="Show details" style="
                        border: none; background: none; cursor: pointer; padding: 2px; color: var(--vs-text-ghost);
                        display: flex; align-items: center; transition: transform 0.15s ease;
                      ">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </td>
                    <td style="padding: 8px 12px; font-family: var(--vs-font-mono); font-size: 12px; color: var(--vs-accent);">${x(B.confirmation_code||"\u2014")}</td>
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; white-space: nowrap;"><span style="display: inline-flex; align-items: center; max-width: 100%;"><span style="overflow: hidden; text-overflow: ellipsis;">${x(T)}</span>${V}</span></td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${B.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;">
                        ${Object.entries(sn).map(([E,A])=>`<option value="${E}" ${B.status===E?"selected":""}>${A.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${X}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${zt(B.created_at)}</td>
                    <td style="padding: 8px 4px; width: 32px; text-align: center;">
                      <button type="button" class="vs-record-delete" data-rid="${B.id}" title="Delete record" style="
                        border: none; background: none; cursor: pointer; padding: 4px; color: var(--vs-text-ghost);
                        display: inline-flex; align-items: center; border-radius: var(--radius-md);
                        transition: color 0.12s, background 0.12s;
                      " onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';" onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                  <tr class="vs-record-detail" data-detail-for="${B.id}" style="display: none;">
                    <td colspan="7" style="padding: 0 12px 12px 44px; background: var(--vs-bg-recessed, var(--vs-bg-ghost));">
                      <div style="
                        display: grid; grid-template-columns: auto 1fr; gap: 4px 16px;
                        font-size: 12px; padding: 12px 0;
                      ">
                        ${Object.entries(R).map(([E,A])=>{if(A&&typeof A=="object"&&A.path&&A.original_name){let N=A.size<1024?A.size+" B":A.size<1048576?Math.round(A.size/1024)+" KB":(A.size/1048576).toFixed(1)+" MB";return`
                              <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${x(E.replace(/_/g," "))}</div>
                              <div style="color: var(--vs-text-primary);">
                                <a href="/_studio/api/router.php?_path=/agentic/actions/${encodeURIComponent(e)}/records/${B.id}/files/${encodeURIComponent(E)}" target="_blank" style="
                                  color: var(--vs-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                                " title="Download file">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  ${x(A.original_name)} (${N})
                                </a>
                              </div>
                            `}return`
                            <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${x(E.replace(/_/g," "))}</div>
                            <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${x(String(A||"\u2014"))}</div>
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
  `;let d=null,u=()=>It(e,1);(b=document.getElementById("action-filter-status"))==null||b.addEventListener("change",u),(y=document.getElementById("action-filter-search"))==null||y.addEventListener("input",()=>{clearTimeout(d),d=setTimeout(u,300)}),(g=document.getElementById("action-records-prev"))==null||g.addEventListener("click",B=>{let D=parseInt(B.currentTarget.dataset.page);D>=1&&It(e,D)}),(C=document.getElementById("action-records-next"))==null||C.addEventListener("click",B=>{let D=parseInt(B.currentTarget.dataset.page);D<=v&&It(e,D)}),s.querySelectorAll(".vs-record-toggle").forEach(B=>{B.addEventListener("click",()=>{let D=B.dataset.rid,R=s.querySelector(`.vs-record-detail[data-detail-for="${D}"]`);if(!R)return;let O=R.style.display!=="none";R.style.display=O?"none":"table-row",B.style.transform=O?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(B=>{B.addEventListener("change",async D=>{let R=D.target.dataset.recordId,O=D.target.value,{ok:K}=await L.put(`/agentic/actions/${encodeURIComponent(e)}/records/${R}`,{status:O});M(K?"Status updated":"Failed to update",K?"success":"error")})}),($=document.getElementById("btn-purge-records"))==null||$.addEventListener("click",async()=>{var K,V;let B=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],D=document.getElementById("vs-purge-overlay");D&&D.remove();let R=document.createElement("div");R.id="vs-purge-overlay",R.className="vs-modal-overlay",R.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Records</h2>
          <p class="vs-modal-desc">Remove records older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${B.map(T=>`<option value="${T.days}">${T.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(R),requestAnimationFrame(()=>R.classList.add("is-visible"));let O=()=>de(R);ce(R,O),(K=document.getElementById("vs-purge-cancel"))==null||K.addEventListener("click",O),(V=document.getElementById("vs-purge-ok"))==null||V.addEventListener("click",async()=>{var W;let T=document.getElementById("vs-purge-select"),J=parseInt(T==null?void 0:T.value),X=((W=T==null?void 0:T.selectedOptions[0])==null?void 0:W.textContent)||"";if(O(),await new Promise(te=>setTimeout(te,200)),!await pe({title:"Confirm Purge",description:`This will permanently delete all records "${X.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:A,data:N}=await L.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:J});A?(M(`${(N==null?void 0:N.purged)||0} record(s) purged`,"success"),It(e,1)):M("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(B=>{B.addEventListener("click",async()=>{let D=B.dataset.rid;if(!await pe({title:"Delete Record",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:O}=await L.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${D}`);O?(M("Record deleted","success"),It(e,t)):M("Failed to delete record","error")})}),(S=document.getElementById("btn-export-action-csv"))==null||S.addEventListener("click",async()=>{let B=document.getElementById("btn-export-action-csv"),D=B.innerHTML;B.innerHTML=`${k.loader} Exporting...`,B.disabled=!0;try{let R=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!R.ok)throw new Error("Export failed");let O=await R.blob(),K=URL.createObjectURL(O),V=document.createElement("a");V.href=K,V.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(V),V.click(),V.remove(),URL.revokeObjectURL(K),M("CSV downloaded","success")}catch{M("Failed to export CSV","error")}B.innerHTML=D,B.disabled=!1})}var Wi=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},Gi=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1},Fe={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function to(){return setTimeout(()=>Ki(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function Ki(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await L.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
  `}function so(e){return setTimeout(()=>Yi(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function Yi(e){var d,u;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await L.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
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
          ${k.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${a.total===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${a.total===0?"No submissions to export":"Download submissions as CSV"}">
          ${k.download} Export CSV
        </button>
      </div>
    </div>
  `;let l=document.getElementById("form-filter-status"),r=document.getElementById("form-filter-source"),p=document.getElementById("form-filter-search"),c=null,v=()=>bs(e,1);l==null||l.addEventListener("change",v),r==null||r.addEventListener("change",v),p==null||p.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(v,300)}),(d=document.getElementById("btn-export-csv"))==null||d.addEventListener("click",async()=>{let m=document.getElementById("btn-export-csv"),h=m.innerHTML;m.innerHTML=`${k.loader} Exporting...`,m.disabled=!0;try{let b=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!b.ok)throw new Error("Export failed");let y=await b.blob(),g=URL.createObjectURL(y),C=document.createElement("a");C.href=g,C.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(C),C.click(),C.remove(),URL.revokeObjectURL(g),M("CSV downloaded","success")}catch{M("Failed to export CSV","error")}m.innerHTML=h,m.disabled=!1}),(u=document.getElementById("btn-upgrade-to-action"))==null||u.addEventListener("click",async()=>{var g,C;if(Wi()||Gi())return;let m=(i.fields||[]).length;if(!await pe({title:"Upgrade to Agent Action",description:`This will create a new agent action with${m>0?` the ${m} field${m!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let b=document.getElementById("btn-upgrade-to-action"),y=b.innerHTML;b.innerHTML=`${k.loader} Converting...`,b.disabled=!0,b.style.opacity="0.6";try{let $={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},S=[],B=0;(i.fields||[]).forEach(T=>{let J=$[T.type];if(!J){B++;return}let X={name:T.name,label:T.label||T.name,type:J,required:T.required||!1};(J==="select"||J==="radio")&&T.options&&(X.options=T.options),T.placeholder&&(X.placeholder=T.placeholder),S.push(X)}),B>0&&M(`${B} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let D=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),R=Date.now().toString(36).slice(-4),O={id:D+"-"+R,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:S,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:K,data:V}=await L.post("/agentic/actions",O);if(K&&(V!=null&&V.action))M(`"${V.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${V.action.id}`;else{let J=(((g=V==null?void 0:V.error)==null?void 0:g.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":((C=V==null?void 0:V.error)==null?void 0:C.message)||"Failed to create action";M(J,"error"),b.innerHTML=y,b.disabled=!1,b.style.opacity=""}}catch{M("Failed to convert form to action","error"),b.innerHTML=y,b.disabled=!1,b.style.opacity=""}}),await bs(e,1)}async function bs(e,t=1){var b,y,g;let s=document.getElementById("form-submissions");if(!s)return;let n=((b=document.getElementById("form-filter-status"))==null?void 0:b.value)||"all",o=((y=document.getElementById("form-filter-source"))==null?void 0:y.value)||"all",i=((g=document.getElementById("form-filter-search"))==null?void 0:g.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:l,data:r}=await L.get(a);if(!l||!r){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let p=r.submissions||[],c=r.total||0,v=r.per_page||20,d=Math.ceil(c/v);if(!p.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:u}=await L.get(`/forms/${encodeURIComponent(e)}`),m=u==null?void 0:u.form,h={};m!=null&&m.fields&&m.fields.forEach(C=>{h[C.name]=C.label||C.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${p.map(C=>{let $=Fe[C.status]||Fe.new,S=Object.entries(C.data||{}).filter(([R])=>!R.startsWith("_")).slice(0,3).map(([R,O])=>{let K=h[R]||R,V=Array.isArray(O)?O.join(", "):String(O);return`<span class="vs-sub-field"><strong>${x(K)}:</strong> ${x(V.substring(0,80))}${V.length>80?"\u2026":""}</span>`}).join(""),B=zt(C.created_at),D=C.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${C.id}" data-form-id="${x(e)}" style="border-left-color: ${$.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${$.bg}; color: ${$.text};">${$.label}</span>
                ${D?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${x(B)}</span>
            </div>
            <div class="vs-submission-preview">
              ${S||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${C.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${C.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;">
                ${Object.entries(Fe).map(([R,O])=>`<option value="${R}" ${C.status===R?"selected":""}>${O.label}</option>`).join("")}
              </select>
              <button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${C.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
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
  `,Zi(e,t)}function Zi(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;eo(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{let n=s.dataset.subId,{ok:o}=await L.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){M("Status updated","success");let i=s.closest(".vs-submission-card"),a=Fe[s.value];if(i&&a){i.style.borderLeftColor=a.text;let l=i.querySelector(".vs-status-pill");l&&(l.style.background=a.bg,l.style.color=a.text,l.textContent=a.label)}}else M("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.dataset.subId;if(!await pe({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await L.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(M("Submission deleted","success"),bs(e,t)):M("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);bs(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;eo(e,o)})})}async function eo(e,t){var v,d,u,m;(v=document.getElementById("submission-detail-overlay"))==null||v.remove();let{ok:s,data:n}=await L.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(h=>String(h.id)===String(t));if(!o){M("Submission not found","error");return}let{data:i}=await L.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,l={};if(a!=null&&a.fields&&a.fields.forEach(h=>{l[h.name]=h.label||h.name}),o.status==="new"){await L.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"}),o.status="read";let h=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);h&&(h.value="read");let b=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(b){b.style.borderLeftColor=Fe.read.text;let y=b.querySelector(".vs-status-pill");y&&(y.style.background=Fe.read.bg,y.style.color=Fe.read.text,y.textContent="Read")}}let r=Fe[o.status]||Fe.new,p=document.createElement("div");p.id="submission-detail-overlay",p.className="vs-slide-overlay",p.innerHTML=`
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
          ${Object.entries(o.data||{}).filter(([h])=>!h.startsWith("_")).map(([h,b])=>{let y=l[h]||h,g=Array.isArray(b)?b.join(", "):String(b);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${x(y)}</div>
                <div class="vs-sub-detail-field-value">${x(g)}</div>
              </div>
            `}).join("")}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Internal Notes</h3>
        <textarea id="sub-detail-notes" class="vs-input" style="min-height: 80px; resize: vertical;" placeholder="Add private notes about this submission...">${x(o.notes||"")}</textarea>
        <button id="btn-save-sub-notes" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-top: 8px;">Save Notes</button>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Change Status</h3>
        <select id="sub-detail-status" class="vs-input">
          ${Object.entries(Fe).map(([h,b])=>`<option value="${h}" ${o.status===h?"selected":""}>${b.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(p),requestAnimationFrame(()=>{requestAnimationFrame(()=>p.classList.add("is-visible"))});let c=()=>{p.classList.remove("is-visible"),setTimeout(()=>p.remove(),200)};ce(p,c),(d=document.getElementById("close-sub-detail"))==null||d.addEventListener("click",c),(u=document.getElementById("btn-save-sub-notes"))==null||u.addEventListener("click",async()=>{var y;let h=((y=document.getElementById("sub-detail-notes"))==null?void 0:y.value)||"",{ok:b}=await L.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:h});M(b?"Notes saved":"Failed to save notes",b?"success":"error")}),(m=document.getElementById("sub-detail-status"))==null||m.addEventListener("change",async h=>{let b=h.target.value,{ok:y}=await L.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:b});if(y){M("Status updated","success");let g=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);g&&(g.value=b);let C=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),$=Fe[b];if(C&&$){C.style.borderLeftColor=$.text;let S=C.querySelector(".vs-status-pill");S&&(S.style.background=$.bg,S.style.color=$.text,S.textContent=$.label)}}else M("Failed to update status","error")})}function io(){return setTimeout(()=>on(),0),`
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 style="font-size: 20px; font-weight: 650; color: var(--vs-text-primary); letter-spacing: -0.025em; margin: 0;">Team</h1>
          <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 4px 0 0;">Manage who has access to this Studio.</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-show-roles" class="vs-btn vs-btn-ghost vs-btn-sm" title="View role permissions">
            ${k.shield} Roles
          </button>
          <button id="btn-add-member" class="vs-btn vs-btn-primary vs-btn-sm">
            ${k.userPlus||k.plus} Add Member
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
  `}function ao(){return`
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
                ${k.rotateCcw}
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
                ${k.rotateCcw}
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
  `}function Ji(e){let t=H.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",l=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${k.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${x(e.name)}" title="Reset password">
        ${k.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${x(e.name)}" title="Remove">
        ${k.trash}
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
      ${l}
    </div>
  `}async function on(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await L.get("/team");if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${(n==null?void 0:n.message)||"Failed to load team members."}</div>`;return}let o=(s==null?void 0:s.members)||[];o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>Ji(i)).join(""),Xi()}function Xi(){var e,t,s,n,o,i,a,l,r;(e=document.getElementById("btn-add-member"))==null||e.addEventListener("click",()=>{oo()}),(t=document.getElementById("btn-show-roles"))==null||t.addEventListener("click",no),document.querySelectorAll("[data-role-info]").forEach(p=>{p.addEventListener("click",no)}),document.querySelectorAll(".team-edit-btn").forEach(p=>{p.addEventListener("click",async()=>{let c=p.dataset.id,{ok:v,data:d}=await L.get("/team");if(v){let u=d.members.find(m=>m.id==c);u&&oo(u)}})}),document.querySelectorAll(".team-delete-btn").forEach(p=>{p.addEventListener("click",async()=>{let c=p.dataset.id,v=p.dataset.name;if(!await pe({title:"Remove Team Member",description:`Remove ${v} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let{ok:u,error:m}=await L.delete(`/team/${c}`);u?(M(`${v} has been removed.`,"success"),on()):M((m==null?void 0:m.message)||"Failed to remove member.","error")})}),document.querySelectorAll(".team-pw-btn").forEach(p=>{p.addEventListener("click",()=>{let c=p.dataset.id,v=p.dataset.name;ea(c,v)})}),[["[data-team-modal-overlay]",ys],["[data-team-pw-overlay]",xs],["[data-team-roles-overlay]",nn]].forEach(([p,c])=>{let v=document.querySelector(p);if(!v)return;let d=null;v.addEventListener("mousedown",u=>{d=u.target}),v.addEventListener("click",u=>{u.target===v&&d===v&&c()})}),(s=document.getElementById("btn-team-cancel"))==null||s.addEventListener("click",ys),(n=document.getElementById("btn-pw-cancel"))==null||n.addEventListener("click",xs),(o=document.getElementById("btn-roles-close"))==null||o.addEventListener("click",nn),(i=document.getElementById("btn-generate-password"))==null||i.addEventListener("click",()=>{let p=document.getElementById("team-member-password");p&&(p.value=Ot())}),(a=document.getElementById("btn-pw-generate"))==null||a.addEventListener("click",()=>{let p=document.getElementById("team-new-password");p&&(p.value=Ot())}),(l=document.getElementById("btn-team-save"))==null||l.addEventListener("click",ta),(r=document.getElementById("btn-pw-save"))==null||r.addEventListener("click",sa),document.addEventListener("keydown",Qi)}function Qi(e){if(e.key!=="Escape")return;let t=document.getElementById("team-modal"),s=document.getElementById("team-pw-modal"),n=document.getElementById("team-roles-modal");n&&!n.classList.contains("hidden")?(nn(),e.stopPropagation()):s&&!s.classList.contains("hidden")?(xs(),e.stopPropagation()):t&&!t.classList.contains("hidden")&&(ys(),e.stopPropagation())}function no(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden")}function nn(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden")}function oo(e=null){let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");t&&(document.getElementById("team-member-name").value=(e==null?void 0:e.name)||"",document.getElementById("team-member-email").value=(e==null?void 0:e.email)||"",document.getElementById("team-member-role").value=(e==null?void 0:e.role)||"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=Ot()),t.classList.remove("hidden"))}function ys(){var e;(e=document.getElementById("team-modal"))==null||e.classList.add("hidden")}function ea(e,t){let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");s&&(document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=Ot(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",s.classList.remove("hidden"))}function xs(){var e;(e=document.getElementById("team-pw-modal"))==null||e.classList.add("hidden")}async function ta(){var r,p,c,v,d,u,m,h;let e=(r=document.getElementById("team-edit-id"))==null?void 0:r.value,t=(c=(p=document.getElementById("team-member-name"))==null?void 0:p.value)==null?void 0:c.trim(),s=(d=(v=document.getElementById("team-member-email"))==null?void 0:v.value)==null?void 0:d.trim(),n=(u=document.getElementById("team-member-role"))==null?void 0:u.value,o=(m=document.getElementById("team-member-password"))==null?void 0:m.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026";let l;e?l=await L.put(`/team/${e}`,{name:t,email:s,role:n}):l=await L.post("/team",{name:t,email:s,role:n,password:o}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",l.ok?(ys(),M(e?"Member updated.":`${t} has been added to the team.`,"success"),on()):(i.textContent=((h=l.error)==null?void 0:h.message)||"Something went wrong.",i.classList.remove("hidden"))}async function sa(){var a,l;let e=(a=document.getElementById("team-pw-user-id"))==null?void 0:a.value,t=(l=document.getElementById("team-new-password"))==null?void 0:l.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026";let{ok:o,error:i}=await L.post(`/team/${e}/password`,{password:t});n.disabled=!1,n.textContent="Reset Password",o?(xs(),M("Password has been reset.","success")):(s.textContent=(i==null?void 0:i.message)||"Failed to reset password.",s.classList.remove("hidden"))}var na=()=>{var e;return((e=window.demoGuard)==null?void 0:e.call(window))||!1},oa=()=>{var e;return((e=window.viewerGuard)==null?void 0:e.call(window))||!1};function lo(){return setTimeout(()=>Zt(),0),`
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
        <div class="vs-dropzone-icon">${k.upload}</div>
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
  `}async function Zt(e="all"){var y;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await ro(n.files),n.value="",Zt(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=g=>{g.target.closest("button")||n==null||n.click()},o.ondragover=g=>{g.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async g=>{g.preventDefault(),o.classList.remove("is-dragover"),g.dataTransfer.files.length>0&&(await ro(g.dataTransfer.files),Zt(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(g=>{g.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(C=>{C.className="vs-device-btn"}),g.className="vs-device-btn vs-device-btn-active",Zt(g.dataset.filter)}});let a=e==="code",l=!a&&e!=="all"?`?category=${e}`:"",{ok:r,data:p}=await L.get(`/assets${l}`);if(!r||!((y=p==null?void 0:p.assets)!=null&&y.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let g=document.getElementById("btn-empty-upload"),C=document.getElementById("btn-upload-asset");g&&C&&g.addEventListener("click",()=>C.click());return}let c=p.assets;if(a&&(c=c.filter(g=>g.category==="css"||g.category==="js"),c.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${k.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let v=["jpg","jpeg","png","gif","webp","svg","ico"],d=c.filter(g=>g.category==="images"&&v.includes(g.extension)),u=c.filter(g=>!v.includes(g.extension)||g.category!=="images");function m(g,C){return g==="css"?k.fileCode:g==="js"?k.fileCode:g==="json"?k.fileJson:g==="pdf"?k.filePdf:["woff2","woff","ttf","otf"].includes(g)?k.type:["mp4","webm"].includes(g)?k.film:["mp3","wav","ogg"].includes(g)?k.music:["txt","md","csv"].includes(g)?k.fileText:["doc","docx","xls","xlsx"].includes(g)?k.fileText:C==="images"?k.image:k.fileText}let h=["css","js","json","svg"],b="";d.length>0&&(b+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',d.forEach((g,C)=>{var D;let $=Ns(g.size),S=g.width?`${g.width}\xD7${g.height}`:"",B=g.extension==="svg";b+=`
        <div class="vs-asset-card" data-lightbox-idx="${C}">
          <div class="vs-asset-card-thumb${B?" is-svg":""}" style="cursor:pointer">
            <img src="${g.thumbnail||g.path}" alt="${x(((D=g.meta)==null?void 0:D.alt)||g.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${x(g.filename)}">${x(g.filename)}</p>
            <p class="vs-asset-card-meta">${S?S+" \xB7 ":""}${$}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${k.copy}</button>
            <button data-delete-asset="${g.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${k.x}</button>
          </div>
        </div>
      `}),b+="</div>"),u.length>0&&u.forEach(g=>{let C=Ns(g.size),$=h.includes(g.extension);b+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${m(g.extension,g.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${x(g.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${g.category} \xB7 ${C}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${$?`
              <button data-edit-asset="${g.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${k.pencil}</button>
            `:""}
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-action-btn">${k.copy}</button>
            ${g.category!=="css"&&g.category!=="js"?`
              <button data-delete-asset="${g.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${k.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=b,t.querySelectorAll("[data-lightbox-idx]").forEach(g=>{let C=g.querySelector(".vs-asset-card-thumb");C&&C.addEventListener("click",()=>{let $=parseInt(g.dataset.lightboxIdx,10);ia(d,$,e)})}),t.querySelectorAll("[data-copy-path]").forEach(g=>{g.addEventListener("click",()=>{navigator.clipboard.writeText(g.dataset.copyPath).then(()=>{let C=g.innerHTML;g.innerHTML="\u2713",g.classList.add("vs-asset-action-copied"),setTimeout(()=>{g.innerHTML=C,g.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(g=>{g.addEventListener("click",()=>{let $=g.dataset.editAsset.replace(/^\//,"");hs($)})}),t.querySelectorAll("[data-delete-asset]").forEach(g=>{g.addEventListener("click",async()=>{if(!await pe({title:"Delete Asset",description:`Delete ${g.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:$}=await L.delete("/assets",{path:g.dataset.deleteAsset});$?(M("Asset deleted.","success"),Zt(e)):M("Could not delete asset.","error")})})}function ia(e,t,s){let n=t;function o(d){if(d===0)return"0 B";let u=1024,m=["B","KB","MB","GB"],h=Math.floor(Math.log(d)/Math.log(u));return parseFloat((d/Math.pow(u,h)).toFixed(1))+" "+m[h]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var y,g;let d=e[n],u=d.width?`${d.width}\xD7${d.height}`:"",m=o(d.size),h=[u,m,(y=d.extension)==null?void 0:y.toUpperCase()].filter(Boolean),b=e.length>1;return`
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
            <img src="${d.path}" alt="${x(((g=d.meta)==null?void 0:g.alt)||d.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${x(d.filename)}</span>
            <span class="vs-lightbox-details">${h.join(" \xB7 ")}${b?` \xB7 ${n+1} / ${e.length}`:""}</span>
          </div>

          <div class="vs-lightbox-actions">
            <button class="vs-lightbox-btn" id="lightbox-copy" title="Copy web path">
              ${k.copy}<span>Copy path</span>
            </button>
          </div>
        </div>
      </div>

      <button class="vs-lightbox-close" id="lightbox-close" title="Close (Esc)">
        ${k.x}
      </button>
    `}let l=document.createElement("div");l.id="vs-lightbox",l.className="vs-lightbox",l.setAttribute("role","dialog"),l.setAttribute("aria-label","Image preview"),l.innerHTML=a(),document.body.appendChild(l),requestAnimationFrame(()=>{requestAnimationFrame(()=>l.classList.add("is-visible"))});function r(){l.classList.remove("is-visible"),setTimeout(()=>l.remove(),400),document.removeEventListener("keydown",c)}function p(d){n=d,l.innerHTML=a(),v()}function c(d){if(d.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;r(),d.preventDefault()}d.key==="ArrowRight"&&e.length>1&&(p((n+1)%e.length),d.preventDefault()),d.key==="ArrowLeft"&&e.length>1&&(p((n-1+e.length)%e.length),d.preventDefault())}function v(){var m,h,b;(m=l.querySelector("#lightbox-close"))==null||m.addEventListener("click",y=>{y.stopPropagation(),r()});let d=null;l.addEventListener("mousedown",y=>{d=y.target}),l.addEventListener("click",y=>{var $;let g=y.target===l||y.target.classList.contains("vs-lightbox-stage"),C=d===l||(($=d==null?void 0:d.classList)==null?void 0:$.contains("vs-lightbox-stage"));g&&C&&r()}),(h=l.querySelector("#lightbox-prev"))==null||h.addEventListener("click",y=>{y.stopPropagation(),p((n-1+e.length)%e.length)}),(b=l.querySelector("#lightbox-next"))==null||b.addEventListener("click",y=>{y.stopPropagation(),p((n+1)%e.length)});let u=l.querySelector("#lightbox-copy");u==null||u.addEventListener("click",y=>{y.stopPropagation();let g=e[n];navigator.clipboard.writeText(g.path).then(()=>{let C=u.innerHTML;u.innerHTML=`${k.check}<span>Copied!</span>`,u.style.borderColor="var(--vs-success)",u.style.color="var(--vs-success)",setTimeout(()=>{u.innerHTML=C,u.style.borderColor="",u.style.color=""},2e3),M("Path copied!","success")})})}document.addEventListener("keydown",c),v()}async function ro(e){var i,a,l;if(na()||oa())return;let t=document.getElementById("status-text");t&&(t.textContent=`Uploading ${e.length} file(s)...`);let s=new FormData;for(let r of e)s.append("file[]",r);let n=H.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let p=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();if(p.ok){let c=((a=(i=p.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0;M(`${c} file(s) uploaded.`,"success"),t&&(t.textContent=`\u2713 ${c} file(s) uploaded`)}else{let c=((l=p.error)==null?void 0:l.message)||"Upload failed";M(c,"error"),t&&(t.textContent="\u2717 "+c)}t&&setTimeout(()=>{t&&(t.textContent="Ready")},4e3)}catch{M("Upload failed.","error"),t&&(t.textContent="\u2717 Upload failed",setTimeout(()=>{t&&(t.textContent="Ready")},4e3))}}var Jt="vs-newdesign-save-pref",Xt="gallery";function vo(){return setTimeout(()=>aa(),0),`
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
        <button class="vs-tab ${Xt==="gallery"?"vs-tab-active":""}" data-tab="gallery">
          ${k.layoutGrid} Gallery
        </button>
        <button class="vs-tab ${Xt==="history"?"vs-tab-active":""}" data-tab="history">
          ${k.history} History
        </button>
      </div>

      <!-- Tab Content -->
      <div id="designs-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading\u2026</div>
      </div>
    </div>
  `}function aa(){var e,t;document.querySelectorAll("[data-tab]").forEach(s=>{s.addEventListener("click",()=>{Xt=s.dataset.tab,document.querySelectorAll(".vs-tab").forEach(n=>n.classList.remove("vs-tab-active")),s.classList.add("vs-tab-active"),co()})}),(e=document.getElementById("btn-save-design"))==null||e.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||uo()}),(t=document.getElementById("btn-new-design"))==null||t.addEventListener("click",()=>{var s,n;(s=window.demoGuard)!=null&&s.call(window)||(n=window.viewerGuard)!=null&&n.call(window)||an()}),co()}function co(){Xt==="gallery"?ks():ws()}async function ks(){var i,a;let e=document.getElementById("designs-content");if(!e)return;let{ok:t,data:s}=await L.get("/designs");if(!t||!((i=s==null?void 0:s.designs)!=null&&i.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <p class="vs-empty-state-title">No saved designs</p>
          <p class="vs-empty-state-desc">Save your current design and try different looks. Switch back anytime.</p>
          <button id="btn-empty-save" class="vs-btn vs-btn-primary vs-btn-sm">${k.save} Save Current Design</button>
        </div>
      </div>
    `,(a=document.getElementById("btn-empty-save"))==null||a.addEventListener("click",()=>{var l;(l=window.demoGuard)!=null&&l.call(window)||uo()});return}let n=s.active_id,o=s.designs;e.innerHTML=`
    <div class="vs-design-grid">
      ${o.map(l=>la(l,l.id===n)).join("")}
    </div>
  `,da(e),ra(e)}function ra(e){e.querySelectorAll(".vs-design-card-preview").forEach(t=>{let s=t.querySelector("iframe");s&&requestAnimationFrame(()=>{let n=t.offsetWidth;if(n>0){let o=n/1440;s.style.transform=`scale(${o})`}})})}function la(e,t){let s=x(e.name||"Untitled"),n=e.description?x(e.description):"",o=e.initial_prompt?x(e.initial_prompt):"",i=n||(o.length>100?o.substring(0,100)+"\u2026":o),a=x(e.site_name||""),l=e.page_count||0,r=e.created_at?Fs(e.created_at):"",p=e._corrupted,c=a&&a!==s?`${a} \xB7 ${l} ${l===1?"page":"pages"}`:`${l} ${l===1?"page":"pages"}`,v=`/_studio/api/router.php?_path=%2Fdesigns%2F${encodeURIComponent(e.id)}%2Fpreview&path=index.php`,d=`${v}&embed=1`;return`
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
            ${k.rotateCcw} Load
          </button>
        `}
        <a class="vs-btn vs-btn-ghost vs-btn-xs" href="${v}" target="_blank" rel="noopener" title="Browse this design">
          ${k.eye}
        </a>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-edit-id="${le(e.id)}"
                data-edit-name="${le(e.name||"")}"
                data-edit-desc="${le(e.description||"")}">
          ${k.pencil}
        </button>
        <button class="vs-btn vs-btn-ghost vs-btn-xs" data-delete-id="${le(e.id)}" style="color: var(--vs-text-ghost);">
          ${k.trash2}
        </button>
      </div>
    </div>
  `}function da(e){e.querySelectorAll("[data-load-id]").forEach(t=>{t.addEventListener("click",async()=>{var p,c,v,d;if((p=window.demoGuard)!=null&&p.call(window)||(c=window.viewerGuard)!=null&&c.call(window))return;let s=t.dataset.loadId,n=t.closest(".vs-design-card"),o=((v=n==null?void 0:n.querySelector("h3"))==null?void 0:v.textContent)||"this design",i=await va(o);if(!i)return;if(t.innerHTML=`${k.rotateCcw} Loading\u2026`,t.disabled=!0,i.saveDesign){let u=H.get("siteName")||"Untitled",m=await L.post("/designs",{name:`${u}`,description:"Saved before switching designs"});if(!m.ok){M(((d=m.error)==null?void 0:d.message)||"Failed to save design.","error"),t.innerHTML=`${k.rotateCcw} Load`,t.disabled=!1;return}}let{ok:a,data:l,error:r}=await L.post(`/designs/${s}/load`,{skip_auto_save:!0});a?(M("Design loaded.","success"),await mo(),window.location.hash="#/chat"):(M((r==null?void 0:r.message)||"Failed to load design.","error"),t.innerHTML=`${k.rotateCcw} Load`,t.disabled=!1)})}),e.querySelectorAll("[data-edit-id]").forEach(t=>{t.addEventListener("click",()=>{var i,a;if((i=window.demoGuard)!=null&&i.call(window)||(a=window.viewerGuard)!=null&&a.call(window))return;let s=t.dataset.editId,n=t.dataset.editName,o=t.dataset.editDesc;pa(s,n,o)})}),e.querySelectorAll("[data-delete-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,l;if((a=window.demoGuard)!=null&&a.call(window)||(l=window.viewerGuard)!=null&&l.call(window))return;let s=t.dataset.deleteId;if(!await pe({title:"Delete Design",description:"This design will be removed permanently. This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await L.delete(`/designs/${s}`);o?(M("Design deleted.","success"),ks()):(M((i==null?void 0:i.message)||"Failed to delete design.","error"),t.innerHTML=`${k.trash2}`,t.disabled=!1)})})}async function ws(){var i,a,l;let e=document.getElementById("designs-content");if(!e)return;e.innerHTML=`
    <div class="flex justify-end mb-4">
      <button id="btn-create-snapshot" class="vs-btn vs-btn-ghost vs-btn-sm">
        ${k.camera} Create Snapshot
      </button>
    </div>
    <div id="snapshots-list">
      <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots\u2026</div>
    </div>
  `,(i=document.getElementById("btn-create-snapshot"))==null||i.addEventListener("click",()=>{var r,p;(r=window.demoGuard)!=null&&r.call(window)||(p=window.viewerGuard)!=null&&p.call(window)||po()});let t=document.getElementById("snapshots-list");if(!t)return;let{ok:s,data:n}=await L.get("/snapshots");if(!s||!((a=n==null?void 0:n.snapshots)!=null&&a.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">${k.camera} Create Snapshot</button>
        </div>
      </div>
    `,(l=document.getElementById("btn-empty-create-snapshot"))==null||l.addEventListener("click",()=>{var r;(r=window.demoGuard)!=null&&r.call(window)||po()});return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((r,p)=>{let c=Fs(r.created_at),v=new Date(r.created_at).toLocaleString(),d=r.size_bytes?(r.size_bytes/1024).toFixed(0)+" KB":"\u2014",u=p===o.length-1,m,h,b;r.snapshot_type==="pre_publish"?(m="var(--vs-success)",h="vs-snap-badge-green",b="Pre-publish"):r.snapshot_type==="manual"?(m="var(--vs-accent)",h="vs-snap-badge-amber",b="Manual"):(m="var(--vs-text-ghost)",h="vs-snap-badge-gray",b="Auto");let y=r.description?`<p class="vs-timeline-desc">${x(r.description)}</p>`:"";return`
          <div class="vs-timeline-item${u?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${m}; box-shadow: 0 0 0 3px color-mix(in srgb, ${m} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${h}">${b}</span>
                  <span class="vs-timeline-label">${x(r.label||"Snapshot #"+r.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${v}">${c}</span>
              </div>
              ${y}
              <div class="vs-timeline-meta">${r.file_count} files \xB7 ${d}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${r.id}" data-snap='${JSON.stringify({label:r.label,description:r.description,type:r.snapshot_type,files:r.file_count,size:d,date:v}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${k.eye} Preview
                </button>
                <button data-restore-id="${r.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${k.rotateCcw} Restore
                </button>
                <button data-delete-snap-id="${r.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${k.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,ca(t)}function ca(e){e.querySelectorAll("[data-preview-id]").forEach(t=>{t.addEventListener("click",()=>{let s=JSON.parse(t.dataset.snap);ma(s)})}),e.querySelectorAll("[data-restore-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,l;if((a=window.demoGuard)!=null&&a.call(window)||(l=window.viewerGuard)!=null&&l.call(window))return;let s=t.dataset.restoreId;if(!await pe({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;t.innerHTML=`${k.rotateCcw} Restoring\u2026`,t.disabled=!0;let{ok:o,error:i}=await L.post(`/snapshots/${s}/restore`);if(o){let r=document.getElementById("status-text");r&&(r.textContent="\u2713 Snapshot restored",setTimeout(()=>{r&&(r.textContent="Ready")},4e3)),M("Snapshot restored.","success"),ws()}else M((i==null?void 0:i.message)||"Failed to restore snapshot.","error"),t.innerHTML=`${k.rotateCcw} Restore`,t.disabled=!1})}),e.querySelectorAll("[data-delete-snap-id]").forEach(t=>{t.addEventListener("click",async()=>{var a,l;if((a=window.demoGuard)!=null&&a.call(window)||(l=window.viewerGuard)!=null&&l.call(window))return;let s=t.dataset.deleteSnapId;if(!await pe({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;t.innerHTML="Deleting\u2026",t.disabled=!0;let{ok:o,error:i}=await L.delete(`/snapshots/${s}`);o?(M("Snapshot deleted.","success"),ws()):(M((i==null?void 0:i.message)||"Failed to delete snapshot.","error"),t.innerHTML=`${k.trash2}`,t.disabled=!1)})})}function uo(){var c;let e=document.getElementById("vs-design-save-overlay");e&&e.remove();let t=H.get("siteName")||"",s=document.createElement("div");s.id="vs-design-save-overlay",s.className="vs-modal-overlay",s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${k.save} Save Design</h2>
        <p class="vs-modal-desc">Save a snapshot of your current design. You can switch back to it anytime.</p>
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
        <button id="design-save-confirm" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${k.save} Save Design</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=()=>de(s),o=v=>{v.key==="Escape"&&(v.preventDefault(),n())};document.addEventListener("keydown",o);let i=new MutationObserver(()=>{document.body.contains(s)||(document.removeEventListener("keydown",o),i.disconnect())});i.observe(document.body,{childList:!0}),ce(s,n),(c=document.getElementById("design-save-cancel"))==null||c.addEventListener("click",n);let a=document.getElementById("design-name"),l=document.getElementById("design-desc"),r=document.getElementById("design-save-confirm"),p=v=>{v.key==="Enter"&&(r==null||r.click())};a==null||a.addEventListener("keydown",p),l==null||l.addEventListener("keydown",p),a==null||a.select(),r==null||r.addEventListener("click",async()=>{var h,b;let v=((h=a==null?void 0:a.value)==null?void 0:h.trim())||"",d=((b=l==null?void 0:l.value)==null?void 0:b.trim())||"";if(!v){a==null||a.focus();return}r.innerHTML="Saving\u2026",r.disabled=!0;let{ok:u,error:m}=await L.post("/designs",{name:v,description:d});n(),u?(M("Design saved.","success"),Xt="gallery",document.getElementById("designs-content")&&(document.querySelectorAll(".vs-tab").forEach(g=>{g.classList.toggle("vs-tab-active",g.dataset.tab==="gallery")}),ks())):M((m==null?void 0:m.message)||"Failed to save design.","error")})}function pa(e,t,s){var c;let n=document.getElementById("vs-design-edit-overlay");n&&n.remove();let o=document.createElement("div");o.id="vs-design-edit-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${k.pencil} Edit Design</h2>
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>de(o);ce(o,i),(c=document.getElementById("edit-design-cancel"))==null||c.addEventListener("click",i);let a=document.getElementById("edit-design-name"),l=document.getElementById("edit-design-desc"),r=document.getElementById("edit-design-save");a==null||a.select();let p=v=>{v.key==="Enter"&&(r==null||r.click())};a==null||a.addEventListener("keydown",p),l==null||l.addEventListener("keydown",p),r==null||r.addEventListener("click",async()=>{var h,b;let v=((h=a==null?void 0:a.value)==null?void 0:h.trim())||"",d=((b=l==null?void 0:l.value)==null?void 0:b.trim())||"";if(!v){a==null||a.focus();return}r.innerHTML="Saving\u2026",r.disabled=!0;let{ok:u,error:m}=await L.put(`/designs/${e}`,{name:v,description:d});i(),u?(M("Design updated.","success"),ks()):M((m==null?void 0:m.message)||"Failed to update design.","error")})}function va(e){return new Promise(t=>{var p,c;let s=document.getElementById("vs-switch-design-overlay");s&&s.remove();let n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=localStorage.getItem(Jt),i=document.createElement("div");i.id="vs-switch-design-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=v=>{v.key==="Escape"&&(v.preventDefault(),l(null))},l=v=>{document.removeEventListener("keydown",a),de(i),t(v)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let r=document.getElementById("vs-switch-save-cb");ce(i,()=>l(null)),(p=document.getElementById("vs-switch-cancel"))==null||p.addEventListener("click",()=>l(null)),(c=document.getElementById("vs-switch-ok"))==null||c.addEventListener("click",()=>{let v=r?r.checked:!1;localStorage.setItem(Jt,v?"true":"false"),l({saveDesign:v})}),document.addEventListener("keydown",a),setTimeout(()=>{var v;return(v=document.getElementById("vs-switch-ok"))==null?void 0:v.focus()},220)})}async function an(){var n;let e=await ua();if(!e)return;if(e.saveDesign&&e.designName){let o=await L.post("/designs",{name:e.designName,description:""});if(!o.ok){M(((n=o.error)==null?void 0:n.message)||"Failed to save design.","error");return}M("Design saved.","success")}let{ok:t,error:s}=await L.post("/designs/new",{skip_auto_save:!0});if(t){M("Workspace cleared. Start building.","success"),await mo(),H.set("messages",[]),H.set("activeConversationId",null),H.set("conversations",[]);try{localStorage.removeItem("vs-active-conversation")}catch{}window.location.hash!=="#/chat"?Pe.navigate("chat"):Pe.refresh()}else M((s==null?void 0:s.message)||"Failed to start new design.","error")}function ua(){return new Promise(e=>{var v,d;let t=document.getElementById("vs-new-design-overlay");t&&t.remove();let s=H.get("siteName")||"",n='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',o=document.createElement("div");o.id="vs-new-design-overlay",o.className="vs-modal-overlay",o.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Start New Design</h2>
          <p class="vs-modal-desc">This will clear your workspace for a fresh start.</p>
          <label class="vs-modal-option" for="vs-newdesign-save-cb">
            <input type="checkbox" id="vs-newdesign-save-cb" ${localStorage.getItem(Jt)!=="false"?"checked":""}>
            <span class="vs-modal-option-check">${n}</span>
            <span class="vs-modal-option-label">Save current design to the Designs library</span>
          </label>
        </div>
        <div class="vs-modal-body" id="vs-newdesign-name-row" style="${localStorage.getItem(Jt)==="false"?"display:none":""}">
          <label class="vs-input-label">Name</label>
          <input id="vs-newdesign-name" type="text" class="vs-input w-full" placeholder="e.g. Dark Forest Theme" value="${le(s)}">
        </div>
        <div class="vs-modal-footer">
          <button id="vs-newdesign-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-newdesign-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Start Fresh</button>
        </div>
      </div>
    `;let i=u=>{u.key==="Escape"&&(u.preventDefault(),a(null))},a=u=>{document.removeEventListener("keydown",i),de(o),e(u)};document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let l=document.getElementById("vs-newdesign-save-cb"),r=document.getElementById("vs-newdesign-name-row"),p=document.getElementById("vs-newdesign-name"),c=()=>{l.checked?(r.style.display="",setTimeout(()=>p==null?void 0:p.focus(),80)):r.style.display="none"};l==null||l.addEventListener("change",c),p==null||p.addEventListener("keydown",u=>{var m;u.key==="Enter"&&(u.preventDefault(),(m=document.getElementById("vs-newdesign-ok"))==null||m.click())}),ce(o,()=>a(null)),(v=document.getElementById("vs-newdesign-cancel"))==null||v.addEventListener("click",()=>a(null)),(d=document.getElementById("vs-newdesign-ok"))==null||d.addEventListener("click",()=>{var h;let u=l?l.checked:!1,m=((h=p==null?void 0:p.value)==null?void 0:h.trim())||"";if(u&&!m){p==null||p.focus();return}localStorage.setItem(Jt,u?"true":"false"),a({saveDesign:u,designName:m})}),document.addEventListener("keydown",i),setTimeout(()=>{var u;l!=null&&l.checked&&p?p.select():(u=document.getElementById("vs-newdesign-ok"))==null||u.focus()},220)})}function po(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${k.camera} Create Snapshot</h2>
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
        <button id="snap-save" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${k.camera} Create Snapshot</button>
      </div>
    </div>
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>de(t);ce(t,s),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var p;let a=((p=n==null?void 0:n.value)==null?void 0:p.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:l,error:r}=await L.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),l?(M("Snapshot created.","success"),ws()):M((r==null?void 0:r.message)||"Failed to create snapshot.","error")})}function ma(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${k.eye} Snapshot Details</h2>
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),ce(s,()=>de(s)),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>de(s))}async function mo(){var e,t;try{let s=await L.get("/pages");s.ok&&Array.isArray((e=s.data)==null?void 0:e.pages)&&H.set("pages",s.data.pages);let n=await L.get("/auth/session");n.ok&&((t=n.data)!=null&&t.site_name)&&(H.set("siteName",n.data.site_name),document.title=`Studio \u2014 ${n.data.site_name}`);let o=document.getElementById("preview-iframe");o&&(o.src=o.src);let i=document.getElementById("status-text");i&&(i.textContent="\u2713 Design switched",setTimeout(()=>{i&&(i.textContent="Ready")},4e3))}catch(s){console.warn("[designs] Post-switch refresh failed:",s)}}var ga=[{route:"chat",label:"Chat"},{route:"editor",label:"Editor"},{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"designs",label:"Designs",roles:["owner","editor"]},{route:"settings",label:"Settings",roles:["owner"]}],cn=["chat","editor"],ha="vs-first-run-guide-dismissed",Eo="vs-onboarding-draft-v1",$o="vs-prompt-recents-v1",Co="vs-prompt-pins-v1",fa=8,ba=5,go=5,ya=5*1024*1024,pn=["image/jpeg","image/png","image/gif","image/webp"],ct=[],ze=document.documentElement.dataset.demo==="true",Lo=window.matchMedia("(max-width: 767px)");function un(){return Lo.matches}var xa=[{route:"assets",label:"Assets",icon:"image"},{route:"forms",label:"Forms",icon:"inbox"},{route:"actions",label:"Actions",icon:"zap"},{route:"designs",label:"Designs",icon:"palette",roles:["owner","editor"]},{route:"more",label:"More",icon:"ellipsis"}],So=["chat","editor"];function Oe(){return ze?(M("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function Bo(){let e=H.get("user");return e&&e.role!=="viewer"}function Mo(){return Bo()?!1:(M("You have read-only access.","warning"),!0)}function wa(){let e=H.get("user");return e&&e.role==="owner"}window.IS_DEMO=ze;window.demoGuard=Oe;window.canWrite=Bo;window.viewerGuard=Mo;window.isOwner=wa;var To=document.getElementById("app");async function Io(){var s;Cn(),_n(),window.marked&&window.marked.use({renderer:{html(n){return x(typeof n=="string"?n:n.text)}}});let e=await L.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){ko();return}H.batch(()=>{H.set("user",e.data.user),H.set("sessionToken",e.data.token),H.set("siteName",e.data.site_name||"")});let t=e.data.site_name;if(t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",n=>{var o;(o=window.__hasUnsavedEditorChanges)!=null&&o.call(window)&&(n.preventDefault(),n.returnValue="")}),Pe.beforeEach(async(n,o)=>{var i;return o.startsWith("editor")&&!n.startsWith("editor")&&(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)?await Zn():!0}).on("chat",()=>Be()).on("editor",()=>Be()).on("pages",()=>Be()).on("pages/:slug",()=>Be()).on("assets",()=>Be()).on("forms",()=>Be()).on("forms/:formId",()=>Be()).on("actions",()=>Be()).on("actions/:actionId",()=>Be()).on("designs",()=>Be()).on("settings",()=>Be()).on("team",()=>Be()).on("profile",()=>Be()).onNotFound(()=>Pe.navigate("chat")),H.on("user",n=>{n||ko()}),Ao(),Lo.addEventListener("change",()=>{Be()}),un()){let o=(window.location.hash||"").replace(/^#\/?/,"");(!o||So.includes(o))&&(window.location.hash="#/assets")}Pe.start()}async function Ao(){try{let{ok:e,data:t}=await L.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){H.set("pages",t.pages);let s=document.getElementById("chat-messages");s!=null&&s.querySelector(".vs-empty-state")&&(s.innerHTML=Pt(),_t())}}catch{}}function Be(){let e=H.get("route"),t=cn.includes(e);Ut()&&Vt(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s=un()&&So.includes(e),n;s?n=$a(e):e==="editor"?n=zn():t?n=Ea():n=Ca(),To.innerHTML=`
    ${ka()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${n}
    </div>
    ${ja()}
    ${Ha()}
    ${Ra()}
    ${qa()}
    ${ao()}
    ${Va()}
  `,Ya(),Da(),e==="editor"&&!s&&On()}function ka(){let e=H.get("route"),t=H.get("user"),s=H.get("theme"),n=ga.filter(o=>o.roles&&t?o.roles.includes(t.role):!0).map(o=>{let i=e===o.route||e.startsWith(o.route+"/");return`
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
          ${ze?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${k.eye} Demo
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
            ${s==="dark"?k.sun:k.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${k.user}
              <span class="hidden sm:inline">${x((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${(t==null?void 0:t.role)!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${(t==null?void 0:t.role)==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${k.pencil} Edit Profile
              </a>
              ${(t==null?void 0:t.role)==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${k.users} Team Members
                </a>
              `:""}
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${k.logOut} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function Ea(){let e=H.get("sidebarWidth"),t=H.get("activeConversationId"),s=H.get("activePageScope"),n=_o(s);return`
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
              ${k.fileText}
              <span id="scope-label" class="text-vs-text-secondary">${x(n)}</span>
              ${k.chevronDown}
            </button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-new-chat"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="New conversation">
              ${k.newChat}
            </button>
            <button id="btn-toggle-history"
              class="vs-btn vs-btn-ghost vs-btn-icon"
              title="Conversation history">
              ${k.history}
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
          ${Pt()}
        </div>

        <!-- Prompt Bar -->
        <div class="vs-prompt-area">
          <div class="vs-prompt-container">
            <input type="file" id="image-file-input" accept="image/jpeg,image/png,image/gif,image/webp" multiple class="hidden" />
            <div id="image-attachments" class="vs-image-attachments" hidden></div>
            <textarea id="prompt-input"
              class="vs-prompt-input vs-textarea"
              placeholder="Describe what you want to build..."
              rows="3"
              style="max-height: 200px;"></textarea>
            <div class="vs-prompt-toolbar">
              <button id="btn-attach-image"
                class="vs-prompt-attach-btn"
                title="Attach images">
                ${k.image}
              </button>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (\u2318+Enter)">
                ${k.send}
              </button>
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
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${k.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${k.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${k.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Visual editor (V)">
              ${k.pencil} Visual
            </button>
            <button id="btn-edit-code" class="vs-btn vs-btn-ghost vs-btn-xs" title="Source code editor">
              ${k.fileCode} Code
            </button>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${k.rotateCcw} Refresh
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${k.externalLink}
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
  `}function $a(e){let t=e==="editor"?"Code Editor":"AI Chat",s=e==="editor"?"The code editor needs a wider screen for the file tree, editor pane, and preview.":"The AI conversation and live preview work side-by-side. That needs a wider screen.";return`
    <div class="h-full overflow-y-auto">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 40px 24px;">
        <div style="width: 64px; height: 64px; border-radius: 18px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
          ${k.monitor}
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
  `}function Ca(){let e=H.get("route"),t=H.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${La(e,t)}
      </div>
    </div>
  `}function La(e,t){let s=H.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return lo();case"forms":return to();case"forms/:formId":return so(t.formId);case"actions":return Xn();case"actions/:actionId":return Qn(t.actionId);case"designs":return n==="owner"||n==="editor"?vo():rn();case"settings":return n==="owner"?Yn():rn();case"team":return n==="owner"?io():rn();case"profile":return Ma();default:return Sa("Not Found","This page doesn't exist.")}}function rn(){return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/chat" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">\u2190 Back to Chat</a>
    </div>
  `}function Sa(e,t){return`
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
  `}function Ba(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return k[t[s]||"layoutGrid"]||k.layoutGrid}function ho(e){Pe.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function Ma(){let e=H.get("user")||{};return setTimeout(()=>Ta(),0),`
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
  `}function Ta(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var p,c,v,d;let o=(c=(p=document.getElementById("profile-name"))==null?void 0:p.value)==null?void 0:c.trim(),i=(d=(v=document.getElementById("profile-email"))==null?void 0:v.value)==null?void 0:d.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:l,data:r}=await L.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(r!=null&&r.user)?(H.set("user",r.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>Be(),800)):t&&(t.textContent=(l==null?void 0:l.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var p,c,v;let o=((p=document.getElementById("profile-current-pw"))==null?void 0:p.value)||"",i=((c=document.getElementById("profile-new-pw"))==null?void 0:c.value)||"",a=((v=document.getElementById("profile-confirm-pw"))==null?void 0:v.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:l,error:r}=await L.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",l?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(r==null?void 0:r.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function Ia(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),Aa()):e.classList.add("hidden")}async function Aa(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await L.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${x((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=H.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let l=a.id===i,r=a.title||"Untitled conversation",p=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${l?"vs-conv-item-active":""}"
              data-conversation-id="${x(a.id)}">
        <span class="mt-0.5 shrink-0 ${l?"text-vs-accent":"text-vs-text-ghost"}">${k.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${l?"font-medium":""}" style="font-size: var(--text-sm);">${x(r)}</div>
          <div class="vs-conv-time mt-0.5">${p}</div>
        </div>
        ${l?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let l=a.dataset.conversationId;Ss(l);let r=document.getElementById("conversation-history-panel");r&&r.classList.add("hidden")})})}async function Ss(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await L.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){H.set("activeConversationId",null),Ms(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=Pt(),_t();return}let i=n.conversation,a=i.prompts||[];H.set("activeConversationId",e),Ms(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=Pt(),_t();return}let l="",r=!1;for(let p of a){let{text:c,images:v}=Qa(p.user_prompt),d=v.length>0?`<div class="vs-msg-user-images">${v.map(u=>`<img src="${u}" class="vs-msg-user-image" />`).join("")}</div>`:"";if(l+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${d}
        <div class="text-sm text-vs-text-primary leading-relaxed">${x(c)}</div>
      </div>
    `,p.ai_response||p.files_modified){let u="",m=typeof p.ai_message=="string"&&p.ai_message.trim()!==""?p.ai_message:p.ai_response;m&&(u=Ls(m));let h="";if(p.files_modified)try{let y=JSON.parse(p.files_modified);if(Array.isArray(y)&&y.length>0){let g=y.map($=>{let S=typeof $=="string"?$:$.path||$,B=typeof $=="object"&&$.action==="delete";return`<div class="vs-file-badge ${B?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${B?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${x(String(S))}</span>
              </div>`}).join(""),C=y.length;h=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${C} file${C!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${g}</div>
              </div>`}}catch{}let b=p.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${u}</div>
          ${h}
          ${b}
        </div>
      `}else if(p.status==="streaming"){r=!0;let u=p.id;l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Generation in progress...
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${u})"
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
      `)}t.innerHTML=l,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),r&&!window.__vsResumedToastByConversation[e]&&(M("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),r||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(p){try{await L.post("/ai/cancel-generation",{prompt_id:p})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",Ss(e)},r&&H.get("activeConversationId")===e&&!H.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{H.get("activeConversationId")===e&&!H.get("aiStreaming")&&Ss(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function _a(){H.set("activeConversationId",null),Ms(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=Pt(),_t());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function _o(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function Bs(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=_o(t)}function Ms(e){H.set("activePageScope",e||null),Bs(),Ut()&&Vt()}async function Pa(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>de(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),ce(t,s),t.addEventListener("keydown",c=>{c.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await L.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${x((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let l=i.pages;if(!l.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${k.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let r='<div style="display: flex; flex-direction: column; gap: 2px;">';l.forEach(c=>{let v=!!Number(c.is_homepage),d=c.title||c.slug||c.path,u=c.path||c.slug+".php",m="/"+u.replace(/\.php$/,"").replace(/^index$/,""),h=m==="/"?"/":m,b=Ba(c.slug),g=(window.__vsCurrentPreviewPath||"index.php")===u,C=c.size?(c.size/1024).toFixed(1)+" KB":"";r+=`
      <div class="vs-pages-modal-item ${g?"is-active":""}" data-slug="${x(c.slug)}" data-path="${x(u)}" data-title="${x(d)}" data-url="${x(h)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${b}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${x(d)}${v?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${x(u)}${C?" \xB7 "+C:""}
            </div>
          </div>
        </div>
        <div class="vs-pages-modal-actions" style="display: flex; align-items: center; gap: 2px; flex-shrink: 0;">
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="edit" title="Edit in Chat" style="width:28px;height:28px;">
            ${k.messageCircle}
          </button>
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="preview" title="Open in Preview" style="width:28px;height:28px;">
            ${k.eye}
          </button>
          ${v?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${k.trash2}
          </button>
          `}
        </div>
      </div>
    `}),r+="</div>",n.innerHTML=r;let p=t.querySelector(".vs-modal-desc");p&&(p.textContent=`${l.length} page${l.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(c=>{c.addEventListener("click",v=>{v.stopPropagation();let d=c.closest(".vs-pages-modal-item"),u=d.dataset.slug,m=d.dataset.path,h=d.dataset.title,b=d.dataset.url,y=c.dataset.action;if(y==="edit")Ms(u),s(),ho(`Edit the "${h}" page (${b}): `);else if(y==="preview"){let g=document.getElementById("preview-iframe");g?(Ut()&&Vt(),g.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m)+"&t="+Date.now(),window.__vsCurrentPreviewPath=m,Bs(),s(),M(`Preview: ${h}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(m),"_blank")}else if(y==="delete"){s();let g=`Delete the "${h}" page (${b}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;ho(g)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(c=>{c.addEventListener("click",v=>{if(v.target.closest(".vs-pages-action"))return;let d=c.dataset.path,u=c.dataset.title,m=document.getElementById("preview-iframe");m?(m.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d)+"&t="+Date.now(),window.__vsCurrentPreviewPath=d,Bs(),s(),M(`Preview: ${u}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(d),"_blank")})})}function _t(){var e;document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let s=document.getElementById("prompt-input");s&&(s.value=t.dataset.quickPrompt,s.dataset.actionType=t.dataset.actionType||"free_prompt",s.focus(),s.setSelectionRange(0,s.value.length),s.dispatchEvent(new Event("input",{bubbles:!0})))})}),(e=document.getElementById("chat-new-design"))==null||e.addEventListener("click",()=>{Oe()||Mo()||an()})}function Pt(){let e=H.get("pages")||[],t=e.length>0,s=new Set(e.map(g=>g.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(g=>{let C=g.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(C)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],l=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],r=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],p=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],c=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],v,d,u;if(!t)d="What are we building?",u="Describe your website and watch it appear in the preview. Every detail is a conversation away.",v=ln(n).slice(0,6);else{d="What\u2019s next?",u="Your site is live in preview. Pick a suggestion or describe any change you want.";let g=[...o,...o,...i,...a,...l,...r,...p,...c];v=ln(g).slice(0,6);let C=new Set;if(v=v.filter($=>C.has($.label)?!1:(C.add($.label),!0)),v.length<6){let $=ln(g).filter(S=>!C.has(S.label));for(let S of $){if(v.length>=6)break;v.push(S),C.add(S.label)}}}let m=v.map(g=>`<button data-quick-prompt="${x(g.prompt).replace(/"/g,"&quot;")}" data-action-type="${g.type}"
      class="vs-style-card">${x(g.label)}</button>`).join(`
        `),h=H.get("user"),y=t&&((h==null?void 0:h.role)==="owner"||(h==null?void 0:h.role)==="editor")?`
      <div class="vs-animate-in vs-stagger-5" style="margin-top: 16px; text-align: center;">
        <button id="chat-new-design" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
          ${k.filePlus} Start a new design from scratch
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
      ${y}
    </div>
  `}function ln(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function ja(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-vs-success" title="Connected"></span>
          <span id="status-text" class="text-xs text-vs-text-ghost">Ready</span>
        </div>
        <button id="btn-undo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Undo (\u2318Z)">
          ${k.undo} Undo
        </button>
        <button id="btn-redo-status" class="vs-btn vs-btn-ghost vs-btn-xs" title="Redo (\u2318\u21E7Z)">
          ${k.redo} Redo
        </button>
        <button id="btn-preview-site" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${k.externalLink} Preview
        </button>
        <button id="btn-snapshot" class="vs-btn vs-btn-ghost vs-btn-xs">
          ${k.camera} Snapshot
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button id="btn-download" class="vs-btn vs-btn-ghost vs-btn-xs" title="Download your website">
          ${k.download} Download
        </button>
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <div class="vs-publish-split">
          <button id="btn-publish"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-main">
            ${k.publish} Publish
          </button>
          <button id="btn-publish-menu"
            class="vs-btn vs-btn-primary vs-btn-xs vs-publish-chevron"
            title="More publish options">
            ${k.chevronUp}
          </button>
        </div>
      </div>
    </footer>
  `}function Ha(){let e=H.get("route"),t=H.get("user"),s=t==null?void 0:t.role;return`
    <nav class="vs-mobile-nav" aria-label="Mobile navigation">
      ${xa.filter(o=>!(o.roles&&!o.roles.includes(s))).map(o=>{if(o.route==="more")return`
        <button class="vs-mobile-nav-item" id="btn-mobile-more" aria-label="More">
          ${k[o.icon]||k.layoutGrid}
          <span>${o.label}</span>
        </button>
      `;let i=e===o.route||e.startsWith(o.route+"/");return`
      <a href="#/${o.route}"
         class="vs-mobile-nav-item ${i?"vs-mobile-nav-item-active":""}"
         aria-label="${o.label}">
        ${k[o.icon]||k.layoutGrid}
        <span>${o.label}</span>
      </a>
    `}).join("")}
    </nav>
  `}function Ra(){let e=H.get("user"),t=e==null?void 0:e.role,s=H.get("theme"),n="";return t==="owner"&&(n+=`
      <a href="#/settings" class="vs-mobile-more-item" data-mobile-more-nav>
        ${k.settings} Settings
      </a>
    `),n+=`
    <a href="#/profile" class="vs-mobile-more-item" data-mobile-more-nav>
      ${k.pencil} Edit Profile
    </a>
  `,t==="owner"&&(n+=`
      <a href="#/team" class="vs-mobile-more-item" data-mobile-more-nav>
        ${k.users} Team Members
      </a>
    `),n+=`
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-theme" class="vs-mobile-more-item">
      ${s==="dark"?k.sun:k.moon}
      ${s==="dark"?"Light mode":"Dark mode"}
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-publish" class="vs-mobile-more-item" style="color: var(--vs-accent); font-weight: 600;">
      ${k.publish} Publish
    </button>
    <button id="btn-mobile-download" class="vs-mobile-more-item">
      ${k.download} Download
    </button>
    <div class="vs-mobile-more-divider"></div>
    <button id="btn-mobile-logout" class="vs-mobile-more-item" style="color: var(--vs-error);">
      ${k.logOut} Sign Out
    </button>
  `,`
    <div id="mobile-more-sheet" class="vs-mobile-more-sheet">
      <div class="vs-mobile-more-backdrop" id="mobile-more-backdrop"></div>
      <div class="vs-mobile-more-content">
        <div class="vs-mobile-more-header">
          <span class="vs-mobile-more-title">${x((e==null?void 0:e.name)||"Menu")}</span>
          <button id="btn-mobile-more-close" class="vs-mobile-more-close">${k.x}</button>
        </div>
        ${n}
      </div>
    </div>
  `}function Da(){if(!un())return;let e=document.getElementById("btn-mobile-more"),t=document.getElementById("mobile-more-sheet"),s=document.getElementById("mobile-more-backdrop"),n=document.getElementById("btn-mobile-more-close");function o(){t==null||t.classList.add("vs-sheet-open")}function i(){t==null||t.classList.remove("vs-sheet-open")}e&&e.addEventListener("click",o),s&&s.addEventListener("click",i),n&&n.addEventListener("click",i),document.querySelectorAll("[data-mobile-more-nav]").forEach(c=>{c.addEventListener("click",i)});let a=document.getElementById("btn-mobile-theme");a&&a.addEventListener("click",()=>{ps(),i(),Be()});let l=document.getElementById("btn-mobile-publish");l&&l.addEventListener("click",()=>{var c;i(),!Oe()&&((c=document.getElementById("btn-publish"))==null||c.click())});let r=document.getElementById("btn-mobile-download");r&&r.addEventListener("click",()=>{i(),!Oe()&&zo()});let p=document.getElementById("btn-mobile-logout");p&&p.addEventListener("click",async()=>{i(),await L.post("/auth/logout"),H.set("user",null),window.location.reload()})}function qa(){return`
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
  `}function Po(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>Do(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function jo(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function Ho(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function Is(){return jo(Co)}function mn(){return jo($o)}function Ro(e){let t=Is(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];Ho(Co,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};ts(n.query||"",n.activeIndex||0)}function Na(e){let t=mn().filter(n=>n!==e),s=[e,...t].slice(0,8);Ho($o,s)}function Do(e){if(H.get("route")!=="chat"){Pe.navigate("chat"),setTimeout(()=>Do(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function qo(e,t="free_prompt",s=!1){if(H.get("route")!=="chat"){Pe.navigate("chat"),setTimeout(()=>qo(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?Ts():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function Qt(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function fo(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),ts(e,0))}function es(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function Fa(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function za(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=Fa(s,n);return i===null?null:70+i}function Oa(e){let t=(e||"").trim().toLowerCase(),s=Po(),n=Is(),o=mn();return s.map(i=>{let a=za(t,i);if(a===null)return null;let l=n.includes(i.id)?-12:0,r=o.includes(i.id)?-8:0;return{...i,__score:a+l+r}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function Ua(e){let t=Po(),s=Object.fromEntries(t.map(v=>[v.id,v])),n=(e||"").trim(),o=[];if(n!==""){let v=Oa(e).slice(0,18);return v.length>0&&o.push({title:"Results",commands:v}),o}let i=mn(),a=Is(),l=new Set,r=i.map(v=>s[v]).filter(Boolean);r.length>0&&(o.push({title:"Recent",commands:r}),r.forEach(v=>l.add(v.id)));let p=a.map(v=>s[v]).filter(v=>v&&!l.has(v.id));return p.length>0&&(o.push({title:"Pinned",commands:p}),p.forEach(v=>l.add(v.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(v=>{let d=t.filter(u=>u.group===v&&!l.has(u.id));d.length>0&&(o.push({title:v,commands:d}),d.forEach(u=>l.add(u.id)))}),o}function ts(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Ua(e),o=n.flatMap(p=>p.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=Is();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let l="",r=0;n.forEach(p=>{l+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${x(p.title)}</div>`,p.commands.forEach(c=>{let v=r===i,d=a.includes(c.id);l+=`
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${r}"
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
      `,r+=1})}),s.innerHTML=l,s.querySelectorAll("[data-command-index]").forEach(p=>{p.addEventListener("click",()=>{let c=parseInt(p.dataset.commandIndex||"0",10);No(c)})}),s.querySelectorAll("[data-command-pin]").forEach(p=>{p.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let v=p.dataset.commandPin;v&&Ro(v)})})}function No(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(Na(n.id),es(),Promise.resolve(n.run()).catch(()=>{}))}function Va(){return`
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
  `}function Es(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function kt(){try{let e=localStorage.getItem(Eo);if(!e)return Es();let t=JSON.parse(e);return{...Es(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Es().pages}}catch{return Es()}}function Fo(e){try{localStorage.setItem(Eo,JSON.stringify(e))}catch{}}function Cs(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function bo(){let e=window.__vsOnboarding||{step:1,draft:kt()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||kt(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),l=document.getElementById("btn-onboarding-next"),r=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!l||!r)return;let p=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${p[t-1]}`,n.innerHTML=p.map((c,v)=>{let d=v+1===t,u=v+1<t;return`
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
    `}a.disabled=t===1,l.classList.toggle("hidden",t===3),r.classList.toggle("hidden",t!==3),Wa()}function Wa(){let e=window.__vsOnboarding||{draft:kt()},t=()=>{var n,o,i,a,l,r,p,c,v,d,u;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((r=(l=document.getElementById("onboard-offer"))==null?void 0:l.value)==null?void 0:r.trim())||e.draft.offer||"",audience:((c=(p=document.getElementById("onboard-audience"))==null?void 0:p.value)==null?void 0:c.trim())||e.draft.audience||"",style:((v=document.getElementById("onboard-style"))==null?void 0:v.value)||e.draft.style||"modern-minimal",tone:((d=document.getElementById("onboard-tone"))==null?void 0:d.value)||e.draft.tone||"confident",content_mode:((u=document.getElementById("onboard-content-mode"))==null?void 0:u.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(m=>m.checked).map(m=>m.dataset.onboardPage).filter(Boolean)),Fo(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function Ga(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function Ka(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>Cs());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>Cs());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:kt()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,bo()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:kt()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,bo()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:kt()}).draft||kt(),l=Ga(a);try{localStorage.setItem(ha,"1")}catch{}Fo(a),Cs(),qo(l,"create_site",!0)})}function Ya(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var W,te;let A=ps()==="light";e.innerHTML=A?k.sun:k.moon,e.title=A?"Switch to dark":"Switch to light",window.__vsEditorPage&&((W=window.monaco)!=null&&W.editor)&&window.monaco.editor.setTheme(Yt()),document.getElementById("vs-code-editor-overlay")&&((te=window.monaco)!=null&&te.editor)&&window.monaco.editor.setTheme(Yt())});let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{fo()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>es());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{ts(n.value,0)}),n.addEventListener("keydown",E=>{let A=window.__vsCommandPalette||{commands:[],activeIndex:0};if((E.metaKey||E.ctrlKey)&&E.key.toLowerCase()==="p"){E.preventDefault();let N=A.commands[A.activeIndex];N&&Ro(N.id);return}if(E.key==="ArrowDown"){E.preventDefault(),ts(n.value,A.activeIndex+1);return}if(E.key==="ArrowUp"){E.preventDefault(),ts(n.value,A.activeIndex-1);return}if(E.key==="Enter"){E.preventDefault(),No();return}E.key==="Escape"&&(E.preventDefault(),es())})),Ka();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",E=>{E.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",E=>{!i.classList.contains("hidden")&&!i.contains(E.target)&&E.target!==o&&!o.contains(E.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav"].forEach(E=>{let A=document.getElementById(E);A&&i&&A.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await L.post("/auth/logout"),H.set("user",null),window.location.reload()});let l=document.getElementById("btn-undo-status");l&&l.addEventListener("click",()=>{Oe()||xo()});let r=document.getElementById("btn-redo-status");r&&r.addEventListener("click",()=>{Oe()||wo()});let p=document.getElementById("btn-preview-site");p&&p.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let c=document.getElementById("btn-snapshot");c&&c.addEventListener("click",async()=>{var W;if(Oe())return;c.disabled=!0,dt("Creating snapshot...");let{ok:E,data:A,error:N}=await L.post("/snapshots",{type:"manual",label:"Manual snapshot"});c.disabled=!1,dt(E?`\u2713 Snapshot saved (${((W=A==null?void 0:A.snapshot)==null?void 0:W.file_count)||0} files)`:"\u2717 "+((N==null?void 0:N.message)||"Snapshot failed"),E?"success":"error",4e3)});let v=document.getElementById("btn-download");v&&((async()=>{var W;let{ok:E,data:A}=await L.get("/settings");(W=A==null?void 0:A.settings)!=null&&W.last_published_at||(v.disabled=!0,v.title="Publish your site first to enable download.",v.classList.add("opacity-40"))})(),v.addEventListener("click",()=>{v.disabled||Oe()||zo()}));let d=document.getElementById("btn-publish");d&&(At(),d.addEventListener("click",async()=>{var me,Se;if(Oe())return;let E=ns();if(E.publishing)return;if(E.hasChanges===!1){M("No unpublished changes to publish.","warning");return}let A=E.counts||{added:0,modified:0,deleted:0},N=Number(A.added||0)+Number(A.modified||0)+Number(A.deleted||0),W=localStorage.getItem("vs_publish_snapshot"),ve=await Ja({totalChanges:N,snapshotDefault:W===null?!0:W!=="false"});if(!ve)return;localStorage.setItem("vs_publish_snapshot",String(ve.createSnapshot)),E.publishing=!0,At(),dt("Publishing...");let{ok:fe,data:F,error:re}=await L.post("/publish",{create_snapshot:ve.createSnapshot});if(E.publishing=!1,fe){let De=((me=F==null?void 0:F.published)==null?void 0:me.length)||0,He=((Se=F==null?void 0:F.removed)==null?void 0:Se.length)||0,Ge=He>0?`Published ${De} file(s), removed ${He} stale file(s).`:`Published ${De} file(s).`;M(Ge,"success"),dt(`\u2713 ${De} published, ${He} removed`,"success",5e3),H.set("previewDirty",!1),nt({silent:!0}),window.open("/","_blank")}else M((re==null?void 0:re.message)||"Publish failed.","error"),dt("\u2717 "+((re==null?void 0:re.message)||"Publish failed"),"error",5e3),nt({silent:!0})}));let u=document.getElementById("btn-publish-menu");u&&u.addEventListener("click",E=>{if(E.stopPropagation(),Oe())return;let A=document.querySelector(".vs-publish-dropup");if(A){A.remove();return}let N=document.createElement("div");N.className="vs-publish-dropup",N.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${k.cloudOff} Unpublish
        </button>
      `;let W=u.closest(".vs-publish-split");W?W.appendChild(N):u.parentElement.appendChild(N),N.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(N.remove(),!await pe({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0}))return;dt("Unpublishing...");let{ok:F,data:re,error:me}=await L.post("/publish/unpublish");F?(M("Unpublished. Default page restored.","success"),dt("\u2713 Site unpublished","success",5e3),nt({silent:!0})):(M((me==null?void 0:me.message)||"Unpublish failed.","error"),dt("\u2717 "+((me==null?void 0:me.message)||"Unpublish failed"),"error",5e3))});let te=fe=>{!N.contains(fe.target)&&fe.target!==u&&(N.remove(),document.removeEventListener("click",te))};setTimeout(()=>document.addEventListener("click",te),0);let ve=fe=>{fe.key==="Escape"&&(N.remove(),document.removeEventListener("keydown",ve),document.removeEventListener("click",te))};document.addEventListener("keydown",ve)});let m=document.getElementById("resize-handle"),h=document.getElementById("conversation-panel");if(m&&h){let E,A;m.addEventListener("mousedown",N=>{N.preventDefault(),E=N.clientX,A=h.offsetWidth;let W=ve=>{let fe=ve.clientX-E,F=Math.min(580,Math.max(340,A+fe));h.style.width=`${F}px`,H.set("sidebarWidth",F)},te=()=>{document.removeEventListener("mousemove",W),document.removeEventListener("mouseup",te)};document.addEventListener("mousemove",W),document.addEventListener("mouseup",te)})}let b=document.getElementById("prompt-input");b&&(b.addEventListener("input",()=>{b.style.height="auto",b.style.height=Math.min(200,b.scrollHeight)+"px"}),b.addEventListener("keydown",E=>{E.key==="Enter"&&(E.metaKey||E.ctrlKey)&&(E.preventDefault(),Ts())}));let y=document.getElementById("btn-send");y&&y.addEventListener("click",Ts);let g=document.getElementById("btn-attach-image"),C=document.getElementById("image-file-input");g&&C&&(g.addEventListener("click",()=>C.click()),C.addEventListener("change",()=>{C.files.length>0&&(dn(C.files),C.value="")}));let $=document.querySelector(".vs-prompt-area");$&&($.addEventListener("dragover",E=>{E.preventDefault(),E.stopPropagation(),$.classList.add("vs-drag-over")}),$.addEventListener("dragleave",E=>{E.preventDefault(),E.stopPropagation(),$.classList.remove("vs-drag-over")}),$.addEventListener("drop",E=>{E.preventDefault(),E.stopPropagation(),$.classList.remove("vs-drag-over");let A=Array.from(E.dataTransfer.files).filter(N=>pn.includes(N.type));A.length>0&&dn(A)})),b&&b.addEventListener("paste",E=>{var W;let N=Array.from(((W=E.clipboardData)==null?void 0:W.items)||[]).filter(te=>te.kind==="file"&&pn.includes(te.type));if(N.length>0){E.preventDefault();let te=N.map(ve=>ve.getAsFile()).filter(Boolean);dn(te)}}),_t();let S=document.getElementById("btn-new-chat");S&&S.addEventListener("click",_a);let B=document.getElementById("btn-scope-selector");B&&B.addEventListener("click",()=>{Pa()});let D=document.getElementById("btn-toggle-history");D&&D.addEventListener("click",Ia);let R=document.getElementById("btn-visual-editor");R&&R.addEventListener("click",()=>Zs());let O=document.getElementById("btn-edit-code");O&&O.addEventListener("click",()=>{let E=window.__vsCurrentPreviewPath||"index.php";hs(E)});let K=document.getElementById("btn-refresh-preview");K&&K.addEventListener("click",()=>jt());let V=document.querySelectorAll("[data-device]"),T=document.getElementById("preview-frame-container");if(V.length&&T){let E={desktop:"100%",tablet:"768px",mobile:"375px"};V.forEach(A=>{A.addEventListener("click",()=>{let N=A.dataset.device,W=E[N]||"100%";N==="desktop"?(T.style.maxWidth="",T.style.width="",T.style.alignSelf=""):(T.style.maxWidth=W,T.style.width="100%",T.style.alignSelf="center"),V.forEach(te=>{te.classList.remove("vs-device-btn-active"),te.dataset.device===N&&te.classList.add("vs-device-btn-active")})})})}let J=document.getElementById("btn-external-preview");J&&J.addEventListener("click",()=>{let E=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(E),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",E=>{var N,W;let A=(W=(N=E.target)==null?void 0:N.closest)==null?void 0:W.call(N,"[data-code-toggle]");A&&(E.preventDefault(),nr(A))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",E=>{if((E.metaKey||E.ctrlKey)&&E.key==="k"){E.preventDefault(),Qt()?es():fo();return}if(E.key==="Escape"&&Qt()){E.preventDefault(),es();return}if(E.key==="Escape"&&$s()){E.preventDefault(),Cs();return}if((E.metaKey||E.ctrlKey)&&E.key==="z"&&!E.shiftKey){if(Qt()||$s())return;let A=document.activeElement;if(A&&(A.tagName==="INPUT"||A.tagName==="TEXTAREA"))return;E.preventDefault(),xo()}if((E.metaKey||E.ctrlKey)&&E.key==="z"&&E.shiftKey){if(Qt()||$s())return;let A=document.activeElement;if(A&&(A.tagName==="INPUT"||A.tagName==="TEXTAREA"))return;E.preventDefault(),wo()}if(E.key==="v"&&!E.metaKey&&!E.ctrlKey&&!E.altKey&&!E.shiftKey){if(Qt()||$s())return;let A=document.activeElement;if(A&&(A.tagName==="INPUT"||A.tagName==="TEXTAREA"||A.isContentEditable))return;let N=H.get("route");if(!cn.includes(N))return;E.preventDefault(),Zs()}if(E.key==="Escape"&&Ut()){E.preventDefault(),Vt();return}}));let X=H.get("route");if(cn.includes(X))try{let E=H.get("activeConversationId"),A=localStorage.getItem("vs-active-conversation"),N=E||A,W=document.getElementById("chat-messages"),te=W==null?void 0:W.querySelector(".vs-empty-state");N&&!H.get("aiStreaming")?(E||H.set("activeConversationId",N),te&&Ss(N)):N||W&&W.children.length===0&&(W.innerHTML=Pt(),_t())}catch{}ss(),Xa()}function Za(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=document.createElement("div");t.className="vs-generating-overlay",t.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">Working on your site</div>
    <div class="vs-gen-subtitle">Content is being generated.<br>This may take a few minutes.</div>
    <div class="vs-gen-note">Please keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-progress"><div class="vs-gen-progress-bar"></div></div>
  `,e.appendChild(t)}function yo(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function jt(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=jt;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),Bs())}));function vn(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{jt()}}window.sendPreviewMessage=vn;async function xo(){(await L.post("/revisions/undo")).ok&&(setTimeout(()=>jt(),300),await ss(),nt({silent:!0}))}async function wo(){(await L.post("/revisions/redo")).ok&&(setTimeout(()=>jt(),300),await ss(),nt({silent:!0}))}async function ss(){let{ok:e,data:t}=await L.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!s,l.title=o,l.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!n,l.title=i,l.classList.toggle("opacity-40",!n))})}function ns(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function dt(e,t="neutral",s=0){let n=document.getElementById("status-text");n&&(n.textContent=e,n.className=t==="success"?"text-xs text-vs-success":t==="error"?"text-xs text-vs-error":"text-xs text-vs-text-ghost",window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s>0&&(window.__vsStatusResetTimer=setTimeout(()=>{let o=document.getElementById("status-text");o&&(o.textContent="Ready",o.className="text-xs text-vs-text-ghost",window.__vsStatusResetTimer=null)},s)))}function At(){let e=ns(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=l=>{s&&(l?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${k.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${k.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${k.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${k.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let l=a===1?"":"s";n.textContent=`${a} unpublished change${l}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${k.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=At;function Ja({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var r,p;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=c=>{c.key==="Escape"&&(c.preventDefault(),l(null))},l=c=>{document.removeEventListener("keydown",a),de(i),s(c)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),ce(i,()=>l(null)),(r=document.getElementById("vs-confirm-cancel"))==null||r.addEventListener("click",()=>l(null)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>{let c=document.getElementById("vs-publish-snapshot-cb");l({createSnapshot:c?c.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var c;return(c=document.getElementById("vs-confirm-ok"))==null?void 0:c.focus()},220)})}function zo(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=ns().hasChanges===!0?`
    <div class="vs-download-warning">
      <div class="vs-download-warning-content">
        ${k.alertTriangle}
        <span>You have unpublished changes. This export reflects your last published version.</span>
      </div>
      <a href="#" id="vs-download-publish-link" class="vs-download-publish-link">Publish first \u2192</a>
    </div>
  `:"",o=document.createElement("div");o.id="vs-download-modal-overlay",o.className="vs-modal-overlay",o.innerHTML=`
    <div class="vs-modal" style="max-width: 520px;">
      <div class="vs-modal-header" style="position: relative;">
        <button id="vs-download-close" class="vs-download-close-btn" type="button" title="Close">
          ${k.x}
        </button>
        <h2 class="vs-modal-title">Download Your Website</h2>
        <p class="vs-modal-desc">Take your files anywhere. No VoxelSite required to run them.</p>
      </div>
      <div class="vs-modal-body" style="padding-top: 16px;">
        ${n}
        <div class="vs-download-cards" id="vs-download-cards">
          <button type="button" class="vs-download-card is-selected" data-format="php">
            <div class="vs-download-card-icon">
              ${k.fileCode}
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
              ${k.globe}
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
          ${k.download} Download PHP
        </button>
      </div>
    </div>
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=d=>{d.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),de(o)};o.querySelector("#vs-download-close").addEventListener("click",a),ce(o,a),document.addEventListener("keydown",i);let l=o.querySelector("#vs-download-publish-link");l&&l.addEventListener("click",d=>{d.preventDefault(),a(),setTimeout(()=>{let u=document.getElementById("btn-publish");u&&!u.disabled&&u.click()},400)});let r=o.querySelectorAll(".vs-download-card"),p=o.querySelector("#vs-download-action"),c="php";r.forEach(d=>{d.addEventListener("click",()=>{if(d.classList.contains("is-loading"))return;r.forEach(m=>m.classList.remove("is-selected")),d.classList.add("is-selected"),c=d.dataset.format;let u=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${k.download} ${u}`})});let v=!1;p.addEventListener("click",async()=>{var d;if(!v){v=!0,p.disabled=!0,p.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',r.forEach(u=>u.style.pointerEvents="none");try{let u=H.get("sessionToken"),m={"Content-Type":"application/json",Accept:"application/zip"};u&&(m["X-VS-Token"]=u);let h=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:m,credentials:"same-origin",body:JSON.stringify({format:c})});if(!h.ok){let B="Export failed.";try{let D=await h.json();B=((d=D==null?void 0:D.error)==null?void 0:d.message)||B}catch{}M(B,"error");return}let y=(h.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),g=y?y[1]:`site-${c}-${new Date().toISOString().slice(0,10)}.zip`,C=await h.blob(),$=URL.createObjectURL(C),S=document.createElement("a");S.href=$,S.download=g,S.style.display="none",document.body.appendChild(S),S.click(),setTimeout(()=>{URL.revokeObjectURL($),S.remove()},100),M(`\u2713 ${g} downloaded`,"success")}catch{M("Download failed. Check your connection.","error")}finally{v=!1,p.disabled=!1;let u=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${k.download} ${u}`,r.forEach(m=>m.style.pointerEvents="")}}})}async function nt({silent:e=!1}={}){let t=ns();if(t.publishing){At();return}t.checking=!0,e||At();let{ok:s,data:n,error:o}=await L.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",At()}window.refreshPublishState=nt;function Xa(){let e=ns();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),nt({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||nt({silent:!0})},15e3)}function Qa(e){if(!e||!e.includes("[vx-img:"))return{text:e||"",images:[]};let t=[];return{text:e.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(n,o)=>(t.push(o),"")).trim(),images:t}}function dn(e){let t=Array.from(e),s=go-ct.length;if(s<=0){M(`Maximum ${go} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&M(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!pn.includes(o.type)){M(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>ya){M(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,l=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!l)return;let r=new Image;r.onload=()=>{let p=er(r,120);ct.push({media_type:l[1],data:l[2],name:o.name,preview:a,thumbnail:p}),gn()},r.src=a},i.readAsDataURL(o)})}function er(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function gn(){let e=document.getElementById("image-attachments");if(e){if(ct.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=ct.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${x(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);ct.splice(n,1),gn()})})}}function tr(){ct=[],gn()}async function Ts(){if(Oe())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=ct.length>0;if(!t&&!s||H.get("aiStreaming"))return;e.value="",e.style.height="auto";let n=document.getElementById("chat-messages");if(!n)return;let o=[...ct];tr();let a=`
    <div class="vs-msg-user mb-6 mt-4">
      ${o.length>0?`<div class="vs-msg-user-images">${o.map(f=>`<img src="${f.preview}" alt="${x(f.name)}" class="vs-msg-user-image" />`).join("")}</div>`:""}
      ${t?`<div class="vs-msg-user-bubble">${x(t)}</div>`:""}
    </div>
  `,l=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,r=`
    <div class="vs-msg-ai mb-6" data-stream-id="${l}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${k.box}</span>
        <span class="text-xs text-vs-text-ghost font-medium">VoxelSite</span>
      </div>
      <div data-role="typing" class="vs-typing-indicator">
        <span class="vs-typing-dot"></span>
        <span class="vs-typing-dot"></span>
        <span class="vs-typing-dot"></span>
      </div>
      <div data-role="status" hidden class="text-xs text-vs-text-tertiary mt-2 flex items-center gap-2">
        <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        <span data-role="status-text"></span>
        <span data-role="status-timer" class="tabular-nums opacity-60"></span>
        <button data-role="stop-btn" class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
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
      <div data-role="error" hidden class="mt-3 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>
    </div>
  `,p=n.querySelector(".vs-empty-state");p&&p.remove(),n.insertAdjacentHTML("beforeend",a+r),n.scrollTop=n.scrollHeight;let c=!0,v=80,d=()=>{c=n.scrollHeight-n.scrollTop-n.clientHeight<=v};n.addEventListener("scroll",d);let u=()=>{c&&(n.scrollTop=n.scrollHeight)},m=n.querySelector(`.vs-msg-ai[data-stream-id="${l}"]`);if(!m)return;let h=m.querySelector('[data-role="typing"]'),b=m.querySelector('[data-role="status"]'),y=m.querySelector('[data-role="status-text"]'),g=m.querySelector('[data-role="stream-content"]'),C=m.querySelector('[data-role="files-section"]'),$=m.querySelector('[data-role="files"]'),S=m.querySelector('[data-role="files-label"]'),B=m.querySelector('[data-role="files-count"]'),D=m.querySelector('[data-role="files-progress"]'),R=m.querySelector('[data-role="error"]'),O=m.querySelector('[data-role="status-timer"]'),K=f=>{f&&f.removeAttribute("hidden")},V=f=>{f&&f.setAttribute("hidden","")},T=Date.now(),J=0,X=Date.now(),E=!1,A=!1,N=setInterval(()=>{let f=Math.floor((Date.now()-T)/1e3),P=Math.floor(f/60),U=f%60,w=P>0?`${P}m ${U}s`:`${U}s`;J>0&&(w+=` \xB7 ${J.toLocaleString()} tokens`),O&&(O.textContent=`\xB7 ${w}`),Date.now()-X>3e5&&!E&&(E=!0,y&&(y.textContent="No data for 5 min \u2014 the model may have stalled",y.style.color="var(--vs-warning, #d97706)"))},1e3);H.set("aiStreaming",!0),document.body.classList.add("vs-ai-streaming");let W=document.getElementById("btn-send");W&&(W.disabled=!0,W.classList.add("opacity-50")),Za();let te="",ve=[],fe=!1,F=null,re=!0,me=new AbortController,Se=m.querySelector('[data-role="stop-btn"]');Se&&Se.addEventListener("click",()=>me.abort());let De=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let He=e.dataset.actionData,Ge=null;if(He){try{Ge=JSON.parse(He)}catch{}delete e.dataset.actionData}let ot=t||"(see attached images)";o.length>0&&(ot=o.map(P=>`[vx-img:${P.thumbnail}]`).join("")+ot);let pt={user_prompt:ot,action_type:De,page_scope:H.get("activePageScope"),conversation_id:H.get("activeConversationId"),action_data:Ge};o.length>0&&(pt.images=o.map(f=>({data:f.data,media_type:f.media_type}))),await mt("/ai/prompt",pt,{signal:me.signal,onConversation(f){if(f){H.set("activeConversationId",f);try{localStorage.setItem("vs-active-conversation",f)}catch{}}},onStatus(f){!A&&C&&!C.hasAttribute("hidden")&&S&&(S.textContent=f),b&&y&&(y.textContent=f,K(b))},onToken(f){te+=f,J+=Math.ceil(f.length/4),X=Date.now(),E=!1,y&&(y.style.color="");let P=te.trimStart();if(!fe&&P.length>0&&(fe=P.startsWith("{")||P.startsWith("```json")||P.startsWith("```")||P.startsWith("<|")||P.startsWith("<message>")||P.startsWith("<file ")||f.includes("<|")||P.includes("<|channel|>")||P.includes('"operations"')||P.includes('"assistant_message"'),fe&&g&&(g.innerHTML="")),V(h),g&&fe){let U=te.match(/<message>([\s\S]*?)(<\/message>|$)/);if(U){let w=U[1].trim();w&&(K(g),g.innerHTML=Ls(w))}C&&te.includes("<file ")&&K(C)}else g&&(K(g),g.innerHTML=Ls(te),b&&V(b));u()},onFile(f){if(ve.push(f),C&&K(C),B){let P=ve.length;B.textContent=`${P} file${P!==1?"s":""}`}if($){let P=f.action==="delete",U=(ve.length-1)*60,w=P?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';$.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${P?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${U}ms">
            <span class="vs-file-badge-icon">${w}</span>
            <span>${x(f.path)}</span>
          </div>
        `)}F||(re=!0),f.path.endsWith(".css")||(re=!1),clearTimeout(F),F=setTimeout(()=>{vn(re?"voxelsite:reload-css":"voxelsite:reload"),F=null,re=!0},600),u()},onDone(f){A=!0,clearTimeout(F),F=null,clearInterval(N),V(h),V(b);let P=f.files_modified||[],U=ve.length>0||P.length>0;if(C&&U?(V(D),C.classList.add("vs-files-done"),S&&(S.textContent=f.partial?"Files updated (partial)":"Files updated")):C&&!C.hasAttribute("hidden")&&(V(D),V(C)),g)if(f.message)K(g),g.innerHTML=Ls(f.message);else if(fe)V(g);else{let _=g.textContent||"";(_.includes("<|channel|>")||_.includes('"operations"')||_.includes('"assistant_message"')||_.includes("<file ")||_.includes("<message>"))&&(V(g),g.innerHTML="")}let w=f.missing_files||[];if((f.truncated||w.length>0)&&g){let _;w.length>0?_=`The following pages are linked in the navigation but were NOT created yet: ${w.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:_="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let j=document.getElementById("prompt-input");j&&!H.get("aiStreaming")&&(S&&(S.textContent="Generating remaining files..."),C&&(C.classList.remove("vs-files-done"),K(C)),j.value=_,j.dataset.actionType=De,Ts())},800)}if(f.conversation_id){H.set("activeConversationId",f.conversation_id);try{localStorage.setItem("vs-active-conversation",f.conversation_id)}catch{}}let I=[...ve,...P];if(I.length>0){let _=I.map(z=>z.path||z),j=_.some(z=>z==="index.php"),q=_.filter(z=>z.endsWith(".php")&&!z.includes("/")&&z!=="index.php"),Y=j&&q.length>0,G;Y?G="index.php":q.length>0?G=q[0]:G=j?"index.php":null,jt(G),H.set("previewDirty",!0),nt({silent:!0})}yo(),Ao(),ss(),n.removeEventListener("scroll",d),n.scrollTop=n.scrollHeight},onWarning(f){f.toLowerCase().includes("truncat")||$&&($.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${x(f)}</div>
        `)},onError(f){clearTimeout(F),F=null,clearInterval(N),V(h),V(b),R&&(R.textContent=f.message||"Something went wrong.",K(R)),yo(),D&&V(D),C&&ve.length>0&&(C.classList.add("vs-files-done"),S&&(S.textContent="Files updated (partial)"))}}),H.set("aiStreaming",!1),document.body.classList.remove("vs-ai-streaming"),W&&(W.disabled=!1,W.classList.remove("opacity-50"))}function ko(){var v;To.innerHTML=`
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
            <h1 class="vs-login-title">${ze?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${ze?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${ze?`
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
                ${ze?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${ze?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${ze?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${k.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${ze?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${ze?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
        ${(H.get("theme")||"light")==="light"?k.sun:k.moon}
      </button>
    </div>
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let d=e.type==="password";e.type=d?"text":"password",t.innerHTML=d?k.eyeOff:k.eye,t.title=d?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let d=ps();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=d==="light"?k.sun:k.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(d=>{d.addEventListener("click",()=>{let u=document.getElementById(d.dataset.toggleTarget);if(!u)return;let m=u.type==="password";u.type=m?"text":"password",d.innerHTML=m?k.eyeOff:k.eye,d.title=m?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),l=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var u,m,h;o.classList.add("hidden"),i.classList.remove("hidden");let d=document.getElementById("forgot-content");try{let y=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((u=y==null?void 0:y.data)==null?void 0:u.mode)||"file")==="email"?(d.innerHTML=`
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
          `,(m=document.getElementById("forgot-form"))==null||m.addEventListener("submit",async C=>{var R,O,K;C.preventDefault();let $=document.getElementById("forgot-message"),S=document.getElementById("forgot-email"),B=C.target.querySelector('button[type="submit"]'),D=(R=S==null?void 0:S.value)==null?void 0:R.trim();if(D){B&&(B.disabled=!0,B.textContent="Sending...");try{let T=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:D})})).json();$&&(T.ok?($.textContent=((O=T.data)==null?void 0:O.message)||"Recovery link sent. Check your inbox.",$.className="mb-5 px-4 py-3 text-sm rounded-xl border",$.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",S&&(S.value="")):($.textContent=((K=T.error)==null?void 0:K.message)||"Failed to send recovery email.",$.className="mb-5 px-4 py-3 text-sm rounded-xl border",$.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),$.classList.remove("hidden"))}catch{$&&($.textContent="Network error. Please try again.",$.className="mb-5 px-4 py-3 text-sm rounded-xl border",$.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",$.classList.remove("hidden"))}finally{B&&(B.disabled=!1,B.textContent="Send Recovery Link")}}})):(d.innerHTML=`
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
                  <button type="button" data-toggle-target="forgot-new-password" class="vs-login-eye" title="Show password">${k.eye}</button>
                </div>
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
            </form>
          `,n(),(h=document.getElementById("forgot-form"))==null||h.addEventListener("submit",async C=>{var R,O,K;C.preventDefault();let $=document.getElementById("forgot-message"),S=(R=document.getElementById("forgot-email"))==null?void 0:R.value,B=(O=document.getElementById("forgot-new-password"))==null?void 0:O.value;if(!S||!B)return;let D=await L.post("/auth/reset-password",{email:S,new_password:B});D.ok?($&&($.textContent="Password reset. You can now sign in with your new password.",$.className="mb-5 px-4 py-3 text-sm rounded-xl border",$.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",$.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):$&&($.textContent=((K=D.error)==null?void 0:K.message)||"Reset failed. Make sure the .reset file exists in _data/.",$.className="mb-5 px-4 py-3 text-sm rounded-xl border",$.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",$.classList.remove("hidden"))}))}catch{d.innerHTML=`
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
              <button type="button" data-toggle-target="token-new-password" class="vs-login-eye" title="Show password">${k.eye}</button>
            </div>
          </div>
          <div>
            <label class="vs-input-label">Confirm Password</label>
            <div class="vs-login-password-wrap">
              <input id="token-confirm-password" type="password" required minlength="8" class="vs-input" placeholder="Confirm your password">
              <button type="button" data-toggle-target="token-confirm-password" class="vs-login-eye" title="Show password">${k.eye}</button>
            </div>
          </div>
          <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Reset Password</button>
        </form>
      `,n(),(v=document.getElementById("token-reset-form"))==null||v.addEventListener("submit",async m=>{var C,$,S,B;m.preventDefault();let h=document.getElementById("forgot-message"),b=(C=document.getElementById("token-new-password"))==null?void 0:C.value,y=($=document.getElementById("token-confirm-password"))==null?void 0:$.value,g=m.target.querySelector('button[type="submit"]');if(!b||b.length<8){h&&(h.textContent="Password must be at least 8 characters.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"));return}if(b!==y){h&&(h.textContent="Passwords do not match.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"));return}g&&(g.disabled=!0,g.textContent="Resetting...");try{let R=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:p,new_password:b})})).json();h&&(R.ok?(h.textContent=((S=R.data)==null?void 0:S.message)||"Password reset. You can now sign in.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",h.classList.remove("hidden"),m.target.querySelectorAll("input").forEach(O=>O.disabled=!0),g&&(g.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(h.textContent=((B=R.error)==null?void 0:B.message)||"Reset failed. The link may have expired.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden")))}catch{h&&(h.textContent="Network error. Please try again.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"))}finally{g&&(g.disabled=!1,g.textContent="Reset Password")}}))}let c=document.getElementById("login-form");c&&c.addEventListener("submit",async d=>{var y,g,C,$;d.preventDefault();let u=(y=document.getElementById("login-email"))==null?void 0:y.value,m=(g=document.getElementById("login-password"))==null?void 0:g.value,h=document.getElementById("login-error");if(!u||!m)return;let b=await L.post("/auth/login",{email:u,password:m});b.ok&&((C=b.data)!=null&&C.token)?(H.batch(()=>{H.set("user",b.data.user),H.set("sessionToken",b.data.token)}),Io()):h&&(h.textContent=(($=b.error)==null?void 0:$.message)||"Invalid email or password.",h.classList.remove("hidden"))}),ss()}function $s(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function Ls(e){if(!e)return"";if(!window.marked)return x(e);let t=window.marked.parse(e);return sr(t)}function sr(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),l=a?a.split(`
`):[];if(l.length<=fa)return;let r=l.slice(0,ba).join(`
`)+`
...`,p=document.createElement("div");p.className="vs-code-collapse",p.setAttribute("data-code-collapse","1");let c=document.createElement("pre");c.className="vs-code-collapse-preview",c.setAttribute("data-code-preview","1");let v=document.createElement("code");o!=null&&o.className&&(v.className=o.className),v.textContent=r,c.appendChild(v),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let d=document.createElement("button");d.type="button",d.className="vs-code-collapse-toggle",d.setAttribute("data-code-toggle","1"),d.setAttribute("data-lines",String(l.length)),d.setAttribute("aria-expanded","false"),d.textContent=`More (${l.length} lines)`;let u=n.parentNode;u&&(u.replaceChild(p,n),p.appendChild(c),p.appendChild(n),p.appendChild(d))}),t.innerHTML}function nr(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Io();})();
