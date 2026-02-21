(()=>{var us=t=>{throw TypeError(t)};var qt=(t,e,s)=>e.has(t)||us("Cannot "+s);var K=(t,e,s)=>(qt(t,e,"read from private field"),s?s.call(t):e.get(t)),ce=(t,e,s)=>e.has(t)?us("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,s),ke=(t,e,s,n)=>(qt(t,e,"write to private field"),n?n.call(t,s):e.set(t,s),s),je=(t,e,s)=>(qt(t,e,"access private method"),s);var Te,Be,qe,Me,it,Ut,zt=class{constructor(e={}){ce(this,it);ce(this,Te,new Map);ce(this,Be,new Map);ce(this,qe,!1);ce(this,Me,new Map);for(let[s,n]of Object.entries(e))K(this,Te).set(s,n)}get(e,s=void 0){return K(this,Te).has(e)?K(this,Te).get(e):s}set(e,s){let n=K(this,Te).get(e);n!==s&&(K(this,Te).set(e,s),K(this,qe)?K(this,Me).has(e)?K(this,Me).get(e).newValue=s:K(this,Me).set(e,{newValue:s,oldValue:n}):je(this,it,Ut).call(this,e,s,n))}update(e){this.batch(()=>{for(let[s,n]of Object.entries(e))this.set(s,n)})}on(e,s){return K(this,Be).has(e)||K(this,Be).set(e,new Set),K(this,Be).get(e).add(s),()=>{var n;(n=K(this,Be).get(e))==null||n.delete(s)}}batch(e){if(K(this,qe)){e();return}ke(this,qe,!0),K(this,Me).clear();try{e()}finally{ke(this,qe,!1);for(let[s,{newValue:n,oldValue:o}]of K(this,Me))je(this,it,Ut).call(this,s,n,o);K(this,Me).clear()}}toJSON(){return Object.fromEntries(K(this,Te))}};Te=new WeakMap,Be=new WeakMap,qe=new WeakMap,Me=new WeakMap,it=new WeakSet,Ut=function(e,s,n){let o=K(this,Be).get(e);if(o)for(let i of o)try{i(s,n)}catch(r){console.error(`[state] Error in "${e}" listener:`,r)}let a=K(this,Be).get("*");if(a)for(let i of a)try{i(e,s,n)}catch(r){console.error("[state] Error in wildcard listener:",r)}};var M=new zt({user:null,sessionToken:null,route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});M.on("theme",t=>{localStorage.setItem("vs-theme",t),document.documentElement.setAttribute("data-theme",t)});M.on("sidebarWidth",t=>{localStorage.setItem("vs-sidebar-width",String(t))});var rt,Ye,Xe,Ze,lt,Je,Re,Vt,Wt,Ot=class{constructor(){ce(this,Re);ce(this,rt,[]);ce(this,Ye,null);ce(this,Xe,!1);ce(this,Ze,null);ce(this,lt,null);ce(this,Je,!1)}on(e,s){let n=[],o=e.replace(/:([a-zA-Z_]+)/g,(a,i)=>(n.push(i),"([^/]+)"));return K(this,rt).push({pattern:e,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(e){return ke(this,Ye,e),this}beforeEach(e){return ke(this,Ze,e),this}start(){K(this,Xe)||(ke(this,Xe,!0),window.addEventListener("hashchange",()=>je(this,Re,Vt).call(this)),je(this,Re,Vt).call(this))}navigate(e){window.location.hash=`/${e}`}get current(){return je(this,Re,Wt).call(this)}};rt=new WeakMap,Ye=new WeakMap,Xe=new WeakMap,Ze=new WeakMap,lt=new WeakMap,Je=new WeakMap,Re=new WeakSet,Vt=async function(){if(K(this,Je))return;let e=je(this,Re,Wt).call(this),s=K(this,lt);if(!(e===s&&K(this,Xe))){if(K(this,Ze)&&s!==null){ke(this,Je,!0);try{if(await K(this,Ze).call(this,e,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{ke(this,Je,!1)}}ke(this,lt,e);for(let n of K(this,rt)){let o=e.match(n.regex);if(o){let a={};n.paramNames.forEach((i,r)=>{a[i]=decodeURIComponent(o[r+1])}),M.batch(()=>{M.set("route",n.pattern),M.set("routeParams",a)}),n.handler(a);return}}K(this,Ye)?(M.set("route","404"),K(this,Ye).call(this,e)):this.navigate("chat")}},Wt=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var ze=new Ot;var gs="/_studio/api/router.php";async function kt(t,e,s=null,n={}){let o={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(t)){let i=hs();i&&(o["X-VS-Token"]=i)}s!==null&&(o["Content-Type"]="application/json");let a={method:t,headers:o,credentials:"same-origin",...n};s!==null&&(a.body=JSON.stringify(s));try{let[i,r]=e.split("?"),d=`${gs}?_path=${encodeURIComponent(i)}${r?"&"+r:""}`,v=await fetch(d,a),c=await v.json();return v.status===401?(M.get("user")&&M.set("user",null),c!=null&&c.error?{ok:!1,error:c.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!c.ok&&c.error?{ok:!1,error:c.error}:{ok:!0,data:c.data||c}}catch{return{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var L={get:(t,e)=>kt("GET",t,null,e),post:(t,e,s)=>kt("POST",t,e,s),put:(t,e,s)=>kt("PUT",t,e,s),delete:(t,e,s)=>kt("DELETE",t,e,s)};async function Et(t,e,s={}){var k,g;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:a=()=>{},onFile:i=()=>{},onDone:r=()=>{},onWarning:d=()=>{},onError:v=()=>{},signal:c=null}=s,p=hs(),l={"Content-Type":"application/json",Accept:"text/event-stream"};p&&(l["X-VS-Token"]=p);let h=!1,u=0,m=0,f=e.conversation_id||null;try{let E=function(x){if(!x.trim())return;let I="";for(let j of x.split(`
`))j.startsWith(":")||j.startsWith("data: ")&&(I+=j.slice(6));if(!I)return;let _;try{_=JSON.parse(I)}catch{return}switch(_.type||"message"){case"token":m++,n(_.content||"");break;case"status":o(_.message||"");break;case"conversation":f=_.conversation_id||f,a(_.conversation_id||"");break;case"file_complete":u++,i(_);break;case"done":h=!0,r(_);break;case"warning":d(_.message||"");break;case"error":v(_);break}},b={method:"POST",headers:l,credentials:"same-origin",body:JSON.stringify(e)};c&&(b.signal=c);let[S,A]=t.split("?"),V=`${gs}?_path=${encodeURIComponent(S)}${A?"&"+A:""}`,z=await fetch(V,b);if(!z.ok){let x=await z.json().catch(()=>null);v({code:((k=x==null?void 0:x.error)==null?void 0:k.code)||"http_error",message:((g=x==null?void 0:x.error)==null?void 0:g.message)||`Server error (${z.status})`});return}let H=z.body.getReader(),G=new TextDecoder,W="";for(;;){let{done:x,value:I}=await H.read();if(x)break;W+=G.decode(I,{stream:!0});let _=W.split(`

`);W=_.pop();for(let N of _)E(N)}if(W.trim()&&E(W),!h&&u>0){let x=f;x?await ms(x,{onDone:r,onError:v,onFile:i,onStatus:o}):r({files_modified:[],message:"",soft_close:!0})}}catch(b){if(b.name==="AbortError"){r({cancelled:!0,message:"Generation stopped."});return}if(u>0||m>0){let S=f;S?(o("Server is still generating \u2014 waiting for completion..."),await ms(S,{onDone:r,onError:v,onFile:i,onStatus:o})):r({files_modified:[],message:"",soft_close:!0})}else v({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function ms(t,{onDone:e,onError:s,onFile:n,onStatus:o}){var r;let i=0;for(let d=0;d<120;d++){await new Promise(v=>setTimeout(v,3e3));try{let{ok:v,data:c}=await L.get(`/ai/conversations/${t}`);if(!v||!((r=c==null?void 0:c.conversation)!=null&&r.prompts))continue;let p=c.conversation.prompts,l=p[p.length-1];if(!l)continue;let h=l.files_modified?JSON.parse(l.files_modified):[];if(h.length>i){for(let u=i;u<h.length;u++)n({path:h[u],action:"write"});i=h.length}if(l.status==="streaming"){let u=Math.round((Date.now()-new Date(l.created_at).getTime())/1e3);o(`Server is still generating... (${u}s)`);continue}l.status==="success"?e({message:l.ai_message||"",files_modified:h,revision_id:l.revision_id||null,polled:!0}):l.status==="partial"?e({message:l.ai_message||"",files_modified:h,partial:!0,polled:!0}):s({code:"generation_failed",message:l.error_message||"Generation failed on the server."});return}catch{}}e({files_modified:[],message:"",partial:!0,soft_close:!0})}function hs(){return M.get("sessionToken")}var vn="data-theme",Kt="forge";function fs(){let t=M.get("theme")||localStorage.getItem("vs-theme")||Kt;return bs(t),t}function bs(t){let e=t||Kt;return document.documentElement.setAttribute(vn,e),localStorage.setItem("vs-theme",e),M.set("theme",e),e}function ys(){let t=M.get("theme")||Kt;return bs(t==="forge"?"studio":"forge")}var Ee=!1,Ct=null,Ue=[],Gt=!1,xs=!1,Q={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function es(){Ee=!Ee,Ls(),he({type:"vx-editor:toggle",active:Ee}),Ee||(Ne(),He(),Ct=null)}function dt(){return Ee}function ct(){Ee&&(Ee=!1,Ls(),he({type:"vx-editor:toggle",active:!1}),Ne(),He(),Ct=null)}function Cs(){xs||(xs=!0,window.addEventListener("message",un))}function un(t){if(!(!t.data||typeof t.data!="object")&&!(!t.data.type||!t.data.type.startsWith("vx-editor:"))&&t.origin===window.location.origin)switch(t.data.type){case"vx-editor:select":Ct=t.data,mn(t.data);break;case"vx-editor:text-changed":Jt(t.data);break;case"vx-editor:image-changed":zn(t.data);break;case"vx-editor:element-deleted":Qt(t.data);break;case"vx-editor:deselect":Ne(),He(),Ct=null;break;case"vx-editor:save-request":pt();break}}function mn(t){let e=document.getElementById("vx-context-toolbar");e||(e=document.createElement("div"),e.id="vx-context-toolbar",e.className="vx-context-toolbar",document.body.appendChild(e));let{tagName:s,rect:n,hasText:o,hasImage:a}=t,i=document.getElementById("preview-iframe");if(!i)return;let r=i.getBoundingClientRect();e.style.left=`${r.left+n.left+n.width/2}px`,e.style.top=`${r.top+n.top-8}px`,e.style.transform="translate(-50%, -100%)";let d="";o&&(d+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      <span>Edit</span></button>`),a&&(d+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),d+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
    <span>Style</span></button>`,s==="A"&&(d+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),d+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`;let v=ts(s,t.classList);e.innerHTML=`<div class="vx-tb-label">${v}</div><div class="vx-tb-actions">${d}</div>`,e.classList.add("vx-tb-visible"),e.querySelectorAll("[data-action]").forEach(c=>{c.addEventListener("click",p=>{p.stopPropagation(),gn(c.dataset.action,t)})})}function Ne(){let t=document.getElementById("vx-context-toolbar");t&&t.classList.remove("vx-tb-visible")}function ts(t,e){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[t]||t.toLowerCase()}function gn(t,e){switch(t){case"edit-text":he({type:"vx-editor:start-edit",mode:"text"}),Ne();break;case"swap-image":Nn(e);break;case"edit-style":fn(e);break;case"edit-link":qn(e);break;case"delete":hn(e);break}}function hn(t){Ne();let e=ts(t.tagName,t.classList),s=(t.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${e}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${ss(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>n.remove(),200)},a=i=>{i.key==="Escape"&&(i.preventDefault(),o())};n.addEventListener("keydown",a),n.querySelectorAll("[data-close]").forEach(i=>i.addEventListener("click",o)),n.addEventListener("click",i=>{i.target===n&&o()}),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{he({type:"vx-editor:delete-element"}),o()})}var ne=new Set,Oe="",Ce=null,Lt="text",Ie="padding",Ae="all",Ve="all",_e="tl",We="",De=!1;function He({revertUnsaved:t=!0}={}){t&&De&&Oe&&(he({type:"vx-editor:update-classes",classes:Oe.split(" ").filter(Boolean),silent:!0}),ne=new Set(Oe.split(" ").filter(Boolean)));let e=document.getElementById("vx-style-panel");e&&(typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),e.classList.remove("vx-sp-visible"),setTimeout(()=>e.remove(),200)),De=!1,Ce=null,Lt="text",Ie="padding",Ae="all",Ve="all",_e="tl",We=""}function fn(t){Ne(),He();let e=(t.classList||[]).filter(o=>o.trim());ne=new Set(e),Oe=e.join(" "),De=!1,Ce=null,Lt=On(e),Ie="padding",Ae="all",Ve="all",_e="tl",We="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${ts(t.tagName,e)}</span>
      <div class="vx-sp-header-actions">
        <span class="vx-sp-drag-hint">\u22EE\u22EE</span>
        <button class="vx-sp-close" id="vx-style-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="vx-sp-nav" id="vx-sp-nav">
      ${n.map((o,a)=>`<button class="vx-sp-seg${a===0?" vx-sp-seg-active":""}" data-tab="${o.id}" title="${o.tip}" aria-label="${o.tip}">${o.icon}</button>`).join("")}
    </div>
    <div class="vx-sp-breakpoints" id="vx-sp-breakpoints">
      ${Xt()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),Es(s),s.__vxOnResize=()=>Es(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=Dn(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let a=o.target.closest("[data-tab]");a&&(s.querySelectorAll(".vx-sp-seg").forEach(i=>i.classList.remove("vx-sp-seg-active")),a.classList.add("vx-sp-seg-active"),Ce=null,pe(a.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>He()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),He())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{ne=new Set(Oe.split(" ").filter(Boolean)),De=!1,he({type:"vx-editor:update-classes",classes:[...ne],silent:!0}),pe(Zt())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>Hn(t)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let a=o.target.closest("[data-bp]");a&&(We=a.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=Xt(),pe(Zt()))}),pe("typography")}function Xt(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(e=>{let s=We===e.id,n=e.id?[...ne].some(o=>o.startsWith(e.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${e.id}" title="${e.tip}">
      ${e.label}${n&&e.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function Zt(){var t;return((t=document.querySelector(".vx-sp-seg-active"))==null?void 0:t.dataset.tab)||"typography"}function pe(t){let e=document.getElementById("vx-sp-body");if(!e)return;let s={typography:bn,spacing:yn,colors:xn,layout:wn,borders:kn,effects:En,classes:Cn};e.innerHTML=(s[t]||s.classes)(),Rn(e)}function bn(){let t=J(/^font-(sans|serif|mono)$/)||"",e=J(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=J(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=J(/^text-(left|center|right|justify)$/)||"text-left",o=J(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",a=J(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",i=J(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",r=J(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${se("Font","^font-(sans|serif|mono)$",t,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${se("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",e,Q.sizes.map(d=>({label:d,value:`text-${d}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${se("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,Q.weights.map(d=>({label:d,value:`font-${d}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${$n(Q.aligns.map(d=>({value:`text-${d}`,label:d,icon:_n(d)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${se("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,Q.leadings.map(d=>({label:d,value:`leading-${d}`})))}
        ${se("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",a,Q.trackings.map(d=>({label:d,value:`tracking-${d}`})))}
        ${se("Case","^(normal-case|uppercase|lowercase|capitalize)$",i,Q.transforms.map(d=>({label:d,value:d})))}
        ${se("Decoration","^(no-underline|underline|line-through)$",r,Q.decorations.map(d=>({label:d,value:d})))}
      </div>
    </div>
  `}function yn(){let t={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};t[Ie]||(Ie="padding"),t[Ie].prefixes[Ae]||(Ae="all");let e=t[Ie],s=e.prefixes[Ae],n=Tn(s),o=Mn(s)||"",a=Ie==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${$s(Object.keys(t).map(i=>({value:i,label:t[i].label})),Ie,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${e.sides.map(i=>`
          <button class="vx-side-btn${Ae===i?" vx-side-btn-active":""}" data-space-side="${i}" title="${ws(i)}">
            ${In(i)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${e.label} ${ws(Ae)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${Q.compactSpacings.map(i=>{let r=`${s}-${i}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Ke(r)?" vx-sp-pill-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false">${i}</button>`}).join("")}
        ${a?`<button class="vx-sp-pill vx-sp-pill-compact${Ke(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function xn(){let t=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],e=Lt||"text",s=e,n=Bn(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${t.map(i=>`<button class="vx-sp-cprop${i.id===e?" vx-sp-cprop-active":""}" data-cprop="${i.id}">${i.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${Q.specialColors.map(i=>{let r=`${s}-${i.name}`,d=i.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${i.hex}`,v=i.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${Ke(r)?" vx-sp-dot-active":""}" data-set="${r}" data-pattern="${n}" style="${d}${v}" title="${i.name}"></button>`}).join("")}</div>
  </div>`;let a=Ce?Q.colors.find(i=>i.name===Ce):null;return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-stage">
      ${a?`
        <div class="vx-shade-stage-header">
          <button class="vx-shade-back" data-family-back>&larr; Colors</button>
          <span class="vx-shade-title">${a.name}</span>
        </div>
        <div class="vx-shade-grid">${Object.entries(a.shades).map(([i,r])=>{let d=`${s}-${a.name}-${i}`;return`<button class="vx-sp-shade${Ke(d)?" vx-sp-shade-active":""}" data-set="${d}" data-pattern="${n}" data-toggle="false" style="background:${r}" title="${i}"><span class="vx-sp-shade-num">${i}</span></button>`}).join("")}</div>
      `:`
        <div class="vx-sp-color-families">${Q.colors.map(i=>{let r=Ce===i.name,d=J(new RegExp(`^${s}-${i.name}-\\d+$`));return`<button class="vx-sp-color-family${r?" vx-sp-fam-active":""}${d?" vx-sp-fam-used":""}" data-family="${i.name}" style="background:${i.shades[500]}" title="${i.name}"></button>`}).join("")}</div>
      `}
    </div>
  </div>`,o}function wn(){let t=Sn(),e=J(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=t==="flex",n=t==="grid",o=e==="absolute"||e==="fixed",a=J(/^gap(?:-[xy])?-/)||"",i=J(/^grid-cols-\d+$/)||"",r=J(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${Ln(t)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${se("Direction","^flex-(row|col|row-reverse|col-reverse)$",J(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${se("Justify","^justify-(start|center|end|between|around|evenly)$",J(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${se("Align","^items-(start|center|end|stretch|baseline)$",J(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${se("Gap","^gap(?:-[xy])?-[\\d.]+$",a,[{label:"None",value:""},...Q.gaps.map(d=>({label:d,value:`gap-${d}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${se("Cols","^grid-cols-\\d+$",i,[{label:"Auto",value:""},...Q.gridCols.map(d=>({label:d,value:`grid-cols-${d}`}))])}
          ${se("Rows","^grid-rows-\\d+$",r,[{label:"Auto",value:""},...Q.gridRows.map(d=>({label:d,value:`grid-rows-${d}`}))])}
          ${se("Gap","^gap(?:-[xy])?-[\\d.]+$",a,[{label:"0",value:"gap-0"},...Q.gaps.slice(1).map(d=>({label:d,value:`gap-${d}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${se("Position","^(static|relative|absolute|fixed|sticky)$",e,Q.positions.map(d=>({label:d,value:d})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${se("Top","^top-",J(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Q.coordinates.map(d=>({label:d,value:`top-${d}`})))}
          ${se("Right","^right-",J(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Q.coordinates.map(d=>({label:d,value:`right-${d}`})))}
          ${se("Bottom","^bottom-",J(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Q.coordinates.map(d=>({label:d,value:`bottom-${d}`})))}
          ${se("Left","^left-",J(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",Q.coordinates.map(d=>({label:d,value:`left-${d}`})))}
        </div>
      </div>
    `:""}
  `}function kn(){let t={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},e=Ve==="all"?"all":_e;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${Q.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Ke(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${se("Style","^border-(solid|dashed|dotted|double|none)$",J(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...Q.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${$s([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],Ve==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${_e==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${_e==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${_e==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${_e==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${Ve==="all"?"ALL":_e.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${Q.radii.map(s=>{let n=An(e,s);return`<button class="vx-sp-pill vx-sp-pill-compact${Ke(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${Pn(e)}" data-toggle="false">${t[s]}</button>`}).join("")}
      </div>
    </div>
  `}function En(){let t=jn();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${Ke(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
          <span class="vx-shadow-preview" style="${s.style}"></span>
          <span class="vx-shadow-label">${s.label}</span>
        </button>`).join("")}</div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Opacity</span>
        <span class="vx-sp-value-readout"><span id="vx-opacity-val">${t}</span>%</span>
      </div>
      <input id="vx-opacity-slider" class="vx-opacity-slider" type="range" min="0" max="100" step="5" value="${t}" />
    </div>
  `}function Cn(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...ne].map(t=>`<span class="vx-sp-class" data-class="${t}">${t} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function se(t,e,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${t}</label>
    <select class="vx-sp-select" data-select-pattern="${e}">
      ${n.map(o=>`<option value="${$t(o.value)}"${s===o.value?" selected":""}>${ss(o.label)}</option>`).join("")}
    </select>
  </div>`}function $s(t,e,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${t.map(a=>`<button class="vx-sp-segment-btn${a.value===e?" vx-sp-segment-btn-active":""}" ${s}="${a.value}">${ss(a.label)}</button>`).join("")}
  </div>`}function $n(t,e,s){return`<div class="vx-icon-segment">
    ${t.map(n=>`
      <button class="vx-icon-segment-btn${n.value===e?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${$t(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function Ln(t){let e=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:e('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:e('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:e('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:e('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:e('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${t===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function Sn(){let t=J(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return t==="inline-flex"?"flex":t==="inline-grid"?"grid":t==="inline-block"?"block":t}function Tn(t){return t==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":t==="gap-x"?"^gap-x-(?:[\\d.]+)$":t==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${t}-(?:auto|[\\d.]+)$`}function Bn(t){return`^${t}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function Mn(t){let e=J(new RegExp(`^${t}-(auto|[\\d.]+)$`));return e?e.replace(`${t}-`,""):""}function ws(t){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[t]||t}function In(t){let e=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:e('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:e('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:e('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:e('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:e('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:e('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:e('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[t]||t}function _n(t){let e=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[t]||t}function An(t,e){let s=e===""?"":`-${e}`;if(t==="all")return e===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[t]||"rounded-tl";return e===""?n:`${n}${s}`}function Pn(t){return t==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[t]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function jn(){let t=J(/^opacity-(\d+)$/);if(!t)return 100;let e=parseInt(t.replace("opacity-",""),10);return Number.isNaN(e)?100:Math.min(100,Math.max(0,e))}function Ke(t){let e=We;return ne.has(e?e+":"+t:t)}function Yt(t,e,{toggle:s=!0,rerender:n=!0}={}){let o=We,a=o?o+":":"",i=e?new RegExp(e):null,r=t?a+t:"",d=!!r&&ne.has(r);if(i)for(let c of[...ne])if(o){if(c.startsWith(a)){let p=c.slice(a.length);i.test(p)&&ne.delete(c)}}else!/^(sm|md|lg|xl|2xl):/.test(c)&&i.test(c)&&ne.delete(c);r&&(!s||!d)&&ne.add(r),De=!0,he({type:"vx-editor:update-classes",classes:[...ne],silent:!0});let v=document.getElementById("vx-sp-breakpoints");v&&(v.innerHTML=Xt()),n&&pe(Zt())}function J(t){let e=We;for(let s of ne)if(e){if(s.startsWith(e+":")){let n=s.slice(e.length+1);if(t.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&t.test(s))return s;return null}function Rn(t){t.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",a=n.dataset.pattern||"",i=n.dataset.toggle!=="false";Yt(o,a,{toggle:i,rerender:!0})})}),t.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",a=n.value||"";Yt(a,o,{toggle:!1,rerender:!0})})}),t.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{Ce=Ce===n.dataset.family?null:n.dataset.family,pe("colors")})}),t.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{Ce=null,pe("colors")})}),t.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{Lt=n.dataset.cprop||"text",Ce=null,pe("colors")})}),t.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Ie=n.dataset.spaceMode||"padding",Ae="all",pe("spacing")})}),t.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{Ae=n.dataset.spaceSide||"all",pe("spacing")})}),t.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{Ve=n.dataset.radiusMode==="corners"?"corners":"all",pe("borders")})}),t.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{_e=n.dataset.radiusCorner||"tl",Ve="corners",pe("borders")})});let e=t.querySelector("#vx-opacity-slider");if(e){let n=()=>{let a=String(e.value||"100"),i=t.querySelector("#vx-opacity-val");i&&(i.textContent=a)},o=()=>{let a=String(e.value||"100");Yt(`opacity-${a}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};e.addEventListener("input",o),e.addEventListener("change",()=>pe("effects"))}let s=t.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(a=>{ne.add(a)}),De=!0,he({type:"vx-editor:update-classes",classes:[...ne],silent:!0}),s.value="",pe("classes"))}),t.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let a=o.dataset.class;ne.delete(a),De=!0,he({type:"vx-editor:update-classes",classes:[...ne],silent:!0}),o.remove()}}})}async function Hn(t){let e=[...ne].join(" ");if(e===Oe){He({revertUnsaved:!1});return}Ue.push({type:"text",filePath:t.filePath,originalHTML:`class="${Oe}"`,newHTML:`class="${e}"`,timestamp:Date.now()}),De=!1,He({revertUnsaved:!1}),de("Saving & compiling\u2026"),await pt(),he({type:"vx-editor:update-classes",classes:[...ne],silent:!0}),setTimeout(()=>{let s=document.getElementById("preview-iframe");s&&s.contentWindow&&s.contentWindow.postMessage("voxelsite:reload","*")},500)}function Dn(t,e){let s=!1,n,o,a,i,r=!1,d=p=>{if(p.target.closest("button, input, select"))return;s=!0;let l=p.touches?p.touches[0]:p;n=l.clientX,o=l.clientY;let h=t.getBoundingClientRect();a=h.left,i=h.top,e.style.cursor="grabbing",p.preventDefault(),r||(r=!0,document.addEventListener("mousemove",v),document.addEventListener("touchmove",v,{passive:!1}),document.addEventListener("mouseup",c),document.addEventListener("touchend",c))},v=p=>{if(!s)return;let l=p.touches?p.touches[0]:p,h=12,u=t.getBoundingClientRect(),m=u.width||300,f=u.height||500,k=a+l.clientX-n,g=i+l.clientY-o,b=h,S=Math.max(h,window.innerWidth-m-h),A=52,V=Math.max(A,window.innerHeight-f-h),z=Math.min(Math.max(k,b),S),H=Math.min(Math.max(g,A),V);t.style.left=`${z}px`,t.style.top=`${H}px`,t.style.right="auto"},c=()=>{s&&(s=!1,e.style.cursor="",r&&(r=!1,document.removeEventListener("mousemove",v),document.removeEventListener("touchmove",v),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c)))};return e.addEventListener("mousedown",d),e.addEventListener("touchstart",d,{passive:!1}),()=>{e.removeEventListener("mousedown",d),e.removeEventListener("touchstart",d),r&&(document.removeEventListener("mousemove",v),document.removeEventListener("touchmove",v),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c))}}function Nn(t){Ne();let e=document.createElement("div");e.className="vx-modal-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("vx-modal-visible"));let s=()=>{e.classList.remove("vx-modal-visible"),e.removeEventListener("keydown",n),setTimeout(()=>e.remove(),200)},n=o=>{o.key==="Escape"&&s()};e.addEventListener("keydown",n),e.querySelector("[data-close]").addEventListener("click",s),e.addEventListener("click",o=>{o.target===e&&s()}),e.tabIndex=-1,e.focus(),Fn(e)}async function Fn(t){let e=t.querySelector("#vx-img-grid");try{let s=await L.get("/assets");if(!s.ok){e.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){e.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}e.innerHTML=n.map(o=>{let a=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${a}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),e.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",()=>{he({type:"vx-editor:swap-image",src:o.dataset.path}),t.classList.remove("vx-modal-visible"),setTimeout(()=>t.remove(),200)})})}catch{e.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function qn(t){Ne();let e=document.createElement("div");e.className="vx-modal-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${$t(t.href||"")}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${$t(t.text||"")}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("vx-modal-visible"));let s=()=>{e.classList.remove("vx-modal-visible"),e.removeEventListener("keydown",n),setTimeout(()=>e.remove(),200)},n=o=>{o.key==="Escape"&&s()};e.addEventListener("keydown",n),e.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",s)),e.addEventListener("click",o=>{o.target===e&&s()}),document.getElementById("vx-link-save").addEventListener("click",()=>{he({type:"vx-editor:update-link",href:document.getElementById("vx-link-href").value.trim(),text:document.getElementById("vx-link-text").value.trim()}),s()}),setTimeout(()=>{var o;return(o=document.getElementById("vx-link-href"))==null?void 0:o.focus()},100)}async function zn(t){let{filePath:e,oldSrc:s,newSrc:n,alt:o}=t,a=e||Ss();try{let i=await L.get(`/files/content?path=${encodeURIComponent(a)}`);if(!i.ok){console.warn("[VX] Cannot read file for image save:",a),de("Save failed",!0);return}let r=i.data.content,d=!1,v=`src="${s}"`;if(r.includes(v)&&(r=r.replace(v,`src="${n}"`),d=!0),!d&&r.includes(s)&&(r=r.replace(s,n),d=!0),!d&&o){let p=ks(r,o,n);p!==!1&&(r=p,d=!0)}if(d){(await L.put("/files/content",{path:a,content:r})).ok?de("Saved"):de("Save failed",!0);return}let c=await L.get("/files");if(c.ok){let p=(c.data.files||[]).filter(l=>l.path.endsWith(".php")&&l.path!==a);for(let l of p){let h=await L.get(`/files/content?path=${encodeURIComponent(l.path)}`);if(!h.ok||!h.data.content)continue;let u=h.data.content;if(u.includes(v)&&(u=u.replace(v,`src="${n}"`),(await L.put("/files/content",{path:l.path,content:u})).ok)){de(`Saved \u2192 ${l.path.split("/").pop()}`);return}if(u.includes(s)&&(u=u.replace(s,n),(await L.put("/files/content",{path:l.path,content:u})).ok)){de(`Saved \u2192 ${l.path.split("/").pop()}`);return}if(o){let m=ks(u,o,n);if(m!==!1&&(await L.put("/files/content",{path:l.path,content:m})).ok){de(`Saved \u2192 ${l.path.split("/").pop()}`);return}}}}console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),de("Save failed \u2014 source not found",!0)}catch(i){console.error("[VX] Image save error:",i),de("Save failed",!0)}}function ks(t,e,s){let n=t.split("<img");for(let o=1;o<n.length;o++){let a=n[o];if(!a.includes(`alt="${e}"`)&&!a.includes(`alt='${e}'`))continue;let i=a.indexOf("src=");if(i===-1)continue;let r=a[i+4];if(r!=='"'&&r!=="'")continue;let d=i+5,v=a.indexOf(r,d);if(v!==-1)return n[o]=a.substring(0,d)+s+a.substring(v),n.join("<img")}return!1}function Jt(t){Ue.push({type:"text",filePath:t.filePath,originalHTML:t.originalHTML,newHTML:t.newHTML,timestamp:Date.now()}),clearTimeout(Jt._timer),Jt._timer=setTimeout(()=>pt(),800)}function Qt(t){Ue.push({type:"delete",filePath:t.filePath,outerHTML:t.outerHTML,timestamp:Date.now()}),clearTimeout(Qt._timer),Qt._timer=setTimeout(()=>pt(),300)}async function pt(){var e;if(Gt||Ue.length===0)return;Gt=!0;let t=[...Ue];Ue=[];try{let s={};for(let a of t){let i=a.filePath||Ss();s[i]||(s[i]=[]),s[i].push(a)}let n=!1,o={filesByMain:new Map,contentByPath:new Map};for(let[a,i]of Object.entries(s))try{let r=await L.get(`/files/content?path=${encodeURIComponent(a)}`);if(!r.ok){console.error("[VX] Cannot read:",a);continue}let d=r.data.content,v=!1;for(let c of i){let p=c.type==="delete"?c.outerHTML:c.originalHTML;if(p)if(d.includes(p))d=c.type==="delete"?d.replace(p,""):d.replace(p,c.newHTML),v=!0;else{if(await Un(a,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",p.substring(0,80))}}if(v){let c=await L.put("/files/content",{path:a,content:d});c.ok?(de("Saved"),(e=c.data)!=null&&e.tailwindCompiled&&(n=!0)):de("Save failed",!0)}}catch(r){console.error("[VX] Save error:",r),de("Save failed",!0)}n&&setTimeout(()=>{let a=document.getElementById("preview-iframe");a!=null&&a.contentWindow&&a.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{Gt=!1,Ue.length>0&&setTimeout(()=>pt(),0)}}async function Un(t,e,s=null){let n=e.type==="delete"?e.outerHTML:e.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],a=s||{filesByMain:new Map,contentByPath:new Map};try{let i=a.filesByMain.get(t);if(!i){let r=await L.get("/files");if(!r.ok)return!1;i=(r.data.files||[]).filter(d=>d.path.endsWith(".php")&&d.path!==t).filter(d=>o.some(v=>d.path.includes(v+"/"))||d.path.includes("partial")||d.path.includes("header")||d.path.includes("footer")||d.path.includes("nav")),a.filesByMain.set(t,i)}for(let r of i){let d=a.contentByPath.get(r.path);if(d==null){let v=await L.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!v.ok||!v.data.content)continue;d=v.data.content,a.contentByPath.set(r.path,d)}if(d.includes(n)){let v=e.type==="delete"?d.replace(n,""):d.replace(n,e.newHTML);if((await L.put("/files/content",{path:r.path,content:v})).ok)return a.contentByPath.set(r.path,v),de(`Saved \u2192 ${r.path.split("/").pop()}`),!0}}}catch(i){console.error("[VX] Partial search error:",i)}return!1}function Ls(){let t=document.getElementById("btn-visual-editor");t&&(t.classList.toggle("vx-editor-active",Ee),t.title=Ee?"Exit visual editor (V)":"Visual editor (V)"),document.body.classList.toggle("vx-editing",Ee)}function de(t,e=!1){if(typeof window.showToast=="function"){window.showToast(t,e?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=t,s.classList.toggle("vx-save-error",e),s.classList.add("vx-save-visible"),clearTimeout(de._timer),de._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function he(t){let e=document.getElementById("preview-iframe");if(e!=null&&e.contentWindow)try{e.contentWindow.postMessage(t,"*")}catch{}}function Ss(){return window.__vsCurrentPreviewPath||"index.php"}function Es(t){let e=document.getElementById("preview-iframe"),s=t.offsetWidth||300,n=t.offsetHeight||520,o=32,a=56;if(!e){t.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,t.style.top=`${Math.min(Math.max(80,a),Math.max(a,window.innerHeight-n-o))}px`;return}let i=e.getBoundingClientRect(),r=i.right-s-o,d=Math.max(o,i.left+10),v=Math.max(o,window.innerWidth-s-o),c=Math.min(Math.max(r,d),v),p=Math.max(i.top+12,a),l=Math.max(a,window.innerHeight-n-o),h=Math.min(p,l);t.style.left=`${c}px`,t.style.top=`${h}px`,t.style.right="auto"}function On(t){let e=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return t.some(s=>e(s,"bg"))?"bg":t.some(s=>e(s,"border"))?"border":(t.some(s=>e(s,"text")),"text")}function $t(t){return(t||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ss(t){return(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var $={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>'};var Ts=typeof document<"u"?document.createElement("span"):null;function y(t){return t?(Ts.textContent=t,Ts.innerHTML):""}var Vn={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function vt(t=""){let e=String(t||"").toLowerCase();for(let[s,n]of Object.entries(Vn))if(e.endsWith(s))return n;return"plaintext"}function Wn(){let t=document.getElementById("vs-toast-container");return t||(t=document.createElement("div"),t.id="vs-toast-container",t.className="vs-toast-container",document.body.appendChild(t),t)}function q(t,e="success",s=3200){if(!t)return;let n=Wn(),o=document.createElement("div"),a=["success","error","warning"].includes(e)?e:"success";o.className=`vs-toast vs-toast-${a}`,o.innerHTML=`<span>${y(String(t))}</span>`,n.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(6px)",setTimeout(()=>o.remove(),220)},s)}window.showToast=q;function re(t){t.classList.remove("is-visible"),setTimeout(()=>t.remove(),350)}function fe({title:t="Confirm Action",description:e="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(a=>{var c,p;let i=document.getElementById("vs-confirm-overlay");i&&i.remove();let r=document.createElement("div");r.id="vs-confirm-overlay",r.className="vs-modal-overlay",r.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${y(t)}</h2>
          <p class="vs-modal-desc">${y(e)}</p>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">${y(n)}</button>
          <button id="vs-confirm-ok" class="vs-btn ${o?"vs-btn-danger":"vs-btn-primary"} vs-btn-sm" type="button">${y(s)}</button>
        </div>
      </div>
    `;let d=l=>{l.key==="Escape"&&(l.preventDefault(),v(!1))},v=l=>{document.removeEventListener("keydown",d),re(r),a(l)};document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible")),r.addEventListener("click",l=>{l.target===r&&v(!1)}),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>v(!1)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>v(!0)),document.addEventListener("keydown",d),setTimeout(()=>{var l;return(l=document.getElementById("vs-confirm-ok"))==null?void 0:l.focus()},220)})}function ns({title:t="Enter Value",description:e="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:a="Continue",inputType:i="text"}){return new Promise(r=>{var h,u;let d=document.getElementById("vs-prompt-overlay");d&&d.remove();let v=document.createElement("div");v.id="vs-prompt-overlay",v.className="vs-modal-overlay";let c=i==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${y(n)}" style="resize: vertical;">${y(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${y(n)}" value="${y(o)}">`;v.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${y(t)}</h2>
          ${e?`<p class="vs-modal-desc">${y(e)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${y(s)}</label>`:""}
          ${c}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${y(a)}</button>
        </div>
      </div>
    `;let p=m=>{re(v),r(m)};document.body.appendChild(v),requestAnimationFrame(()=>v.classList.add("is-visible"));let l=v.querySelector("#vs-prompt-input");setTimeout(()=>l==null?void 0:l.focus(),220),v.addEventListener("click",m=>{m.target===v&&p(null)}),(h=v.querySelector("#vs-prompt-cancel"))==null||h.addEventListener("click",()=>p(null)),(u=v.querySelector("#vs-prompt-ok"))==null||u.addEventListener("click",()=>{p(((l==null?void 0:l.value)||"").trim())}),l==null||l.addEventListener("keydown",m=>{i==="textarea"?m.key==="Enter"&&(m.metaKey||m.ctrlKey)&&(m.preventDefault(),p(((l==null?void 0:l.value)||"").trim())):m.key==="Enter"&&(m.preventDefault(),p(((l==null?void 0:l.value)||"").trim())),m.key==="Escape"&&(m.preventDefault(),p(null))})})}var ut=null;function Bs(){return`
    <div class="vs-editor-layout">
      <!-- File Tree Sidebar -->
      <div id="editor-sidebar" class="vs-editor-sidebar" style="position: relative; display: flex; flex-direction: column;">
        <div class="vs-editor-sidebar-header">
          <span class="vs-editor-sidebar-title">Explorer</span>
          <div style="display:flex;gap:2px;">
            <button id="editor-new-file" class="vs-btn vs-btn-ghost vs-btn-icon" title="New file" style="width:24px;height:24px;">
              ${$.filePlus}
            </button>
            <button id="editor-refresh-tree" class="vs-btn vs-btn-ghost vs-btn-icon" title="Refresh file list" style="width:24px;height:24px;">
              ${$.rotateCcw}
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
              <div class="vs-empty-state-icon">${$.fileCode}</div>
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
  `}async function Ms(){var vs;let t=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),e={files:[],treeData:{site:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(t==null?void 0:t.fontSize)||13,wordWrap:(t==null?void 0:t.wordWrap)||!1,expandedFolders:new Set((t==null?void 0:t.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((t==null?void 0:t.expandedSections)||["site","prompts"]),_pendingRestore:t?{tabs:t.openTabs||[],active:t.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!e||!e.openTabs?!1:e.openTabs.some(w=>w.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:e.openTabs.map(w=>w.path),activeTab:e.activeTab,fontSize:e.fontSize,wordWrap:e.wordWrap,expandedFolders:[...e.expandedFolders],expandedSections:[...e.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),e.disposed=!0,e.monacoInstance&&(e.monacoInstance.dispose(),e.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),i=document.getElementById("editor-host"),r=document.getElementById("editor-empty-state"),d=document.getElementById("editor-monaco-container"),v=document.getElementById("editor-file-info"),c=document.getElementById("editor-status"),p=document.getElementById("editor-save-btn"),l=document.getElementById("editor-refresh-tree"),h=document.getElementById("editor-new-file"),u=document.getElementById("editor-sidebar"),m=document.getElementById("editor-sidebar-resize"),f=document.getElementById("editor-font-size-select"),k=document.getElementById("editor-word-wrap-btn");f&&(f.value=e.fontSize);let g=()=>{k&&(e.wordWrap?(k.style.color="var(--vs-accent)",k.style.backgroundColor="var(--vs-accent-dim)"):(k.style.color="var(--vs-text-ghost)",k.style.backgroundColor="transparent"))};g();let b=(w,C="muted")=>{c&&(c.textContent=w,c.dataset.state=C)},S=w=>{let C=e.files.find(T=>T.path===w);return(C==null?void 0:C.readonly)===!0},A=w=>{let C=w.toLowerCase();return C.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':C.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':C.endsWith(".js")||C.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},V=(w,C="")=>{let T=[],B={},D=P=>{if(B[P])return B[P];let Z=P.split("/"),Y=Z[Z.length-1],te=Z.slice(0,-1).join("/"),ie=C?C+P:P,me={name:Y,path:ie,type:"folder",children:[]};return B[P]=me,te?D(te).children.push(me):T.push(me),me};for(let P of w){let Y=(C&&P.path.startsWith(C)?P.path.substring(C.length):P.path).split("/");if(Y.length===1)T.push({name:Y[0],path:P.path,type:"file",meta:P});else{let te=Y.slice(0,-1).join("/");D(te).children.push({name:Y[Y.length-1],path:P.path,type:"file",meta:P})}}let U=P=>{P.sort((Z,Y)=>Z.type!==Y.type?Z.type==="folder"?-1:1:Z.name.localeCompare(Y.name));for(let Z of P)Z.type==="folder"&&U(Z.children)};return U(T),T},z=()=>{if(!n)return;let w=(D,U=0)=>D.map(P=>{var at,Ft;if(P.type==="folder"){let Se=e.expandedFolders.has(P.path);return`
            <div class="vs-tree-item" data-folder="${y(P.path)}" style="--tree-indent: ${U};">
              <span class="vs-tree-folder-toggle" data-expanded="${Se}">${$.chevronRight}</span>
              <span class="vs-tree-item-icon">${Se?$.folderOpen||$.folder:$.folder}</span>
              <span class="vs-tree-item-name">${y(P.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${y(P.path)}" data-collapsed="${!Se}">
              ${w(P.children,U+1)}
            </div>
          `}let Z=e.activeTab===P.path,Y=e.openTabs.find(Se=>Se.path===P.path),te=Y!=null&&Y.dirty?" \u2022":"",me=S(P.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",ot=((at=P.meta)==null?void 0:at.custom)===!0,$e=((Ft=P.meta)==null?void 0:Ft.protected)===!0,Le="";return $e?ot&&(Le=`
            <button class="vs-tree-item-restore" data-restore-file="${y(P.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):Le=`
            <button class="vs-tree-item-delete" data-delete-file="${y(P.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${y(P.path)}" data-active="${Z}" style="--tree-indent: ${U};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${A(P.path)}</span>
            <span class="vs-tree-item-name">${y(P.name)}${me}${te}</span>
            ${Le}
          </div>
        `}).join(""),C=(D,U,P)=>{let Z=P.querySelector(".vs-explorer-caret");e.expandedSections.has(D)?(U.style.display="block",P.classList.add("is-expanded")):(U.style.display="none",P.classList.remove("is-expanded"))},T=document.querySelector('[data-section="site"]'),B=document.querySelector('[data-section="prompts"]');T&&C("site",n,T),B&&o&&C("prompts",o,B),n.innerHTML=w(e.treeData.site),o&&(o.innerHTML=w(e.treeData.prompts)),Pe()},H=()=>{if(a){if(e.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=e.openTabs.map(w=>{let C=w.path===e.activeTab,T=w.path.split("/").pop(),D=S(w.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${y(w.path)}" data-active="${C}" data-dirty="${w.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${y(T)}${D}</span>
          <button class="vs-editor-tab-close" data-close-tab="${y(w.path)}" title="Close">${$.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',nt(),x()}},G=null,W=w=>{if(!a)return;let C=8,T=()=>{a.scrollLeft+=w==="left"?-C:C,x()};T(),G=setInterval(T,16)},E=()=>{G&&(clearInterval(G),G=null)},x=()=>{let w=document.getElementById("editor-tab-scroll-left"),C=document.getElementById("editor-tab-scroll-right");if(!a||!w||!C)return;let T=a.scrollLeft>0,B=a.scrollLeft<a.scrollWidth-a.clientWidth-1;w.style.display=T?"flex":"none",C.style.display=B?"flex":"none"};a&&(a.addEventListener("scroll",x,{passive:!0}),window.addEventListener("resize",x,{passive:!0}));let I=document.getElementById("editor-tab-scroll-left"),_=document.getElementById("editor-tab-scroll-right");I&&(I.addEventListener("mousedown",()=>W("left")),I.addEventListener("mouseup",E),I.addEventListener("mouseleave",E)),_&&(_.addEventListener("mousedown",()=>W("right")),_.addEventListener("mouseup",E),_.addEventListener("mouseleave",E));let N=()=>{r&&(r.style.display="none"),d&&(d.style.display=""),e.monacoInstance&&e.monacoInstance.layout()},j=async w=>{if(e.disposed)return;let C=e.openTabs.find(P=>P.path===w);if(C){await O(w);return}b("Loading\u2026");let{ok:T,data:B,error:D}=await L.get(`/files/content?path=${encodeURIComponent(w)}`);if(!T){q((D==null?void 0:D.message)||"Could not load file.","error"),b("Load failed","error");return}let U=typeof(B==null?void 0:B.content)=="string"?B.content:"";C={path:w,baseline:U,dirty:!1},e.openTabs.push(C),N(),await O(w),oe(U,w),b("Ready"),s()},O=async w=>{if(e.disposed)return;let C=e.openTabs.find(B=>B.path===e.activeTab);C&&e.monacoInstance&&(C._buffer=e.monacoInstance.getValue()),e.activeTab=w;let T=e.openTabs.find(B=>B.path===w);if(T&&e.monacoInstance){let B=T._buffer!==void 0?T._buffer:T.baseline;oe(B,w)}X(),le(),H(),setTimeout(()=>{if(a){let B=a.querySelector('.vs-editor-tab[data-active="true"]');if(B){let D=B.getBoundingClientRect(),U=a.getBoundingClientRect();D.left<U.left?a.scrollBy({left:D.left-U.left,behavior:"smooth"}):D.right>U.right&&a.scrollBy({left:D.right-U.right,behavior:"smooth"})}}},10),z(),s()},ee=async w=>{let C=e.openTabs.find(B=>B.path===w);if(C!=null&&C.dirty&&!await fe({title:"Discard unsaved changes?",description:`"${w}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let T=e.openTabs.findIndex(B=>B.path===w);if(T!==-1){if(e.openTabs.splice(T,1),e.activeTab===w){let B=e.openTabs[Math.min(T,e.openTabs.length-1)];B?await O(B.path):(e.activeTab=null,F(),X(),le())}H(),z(),s()}},ve=async w=>{let C=w.split("/").pop();if(!await fe({title:"Delete file?",description:`Are you sure you want to permanently delete "${C}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;b("Deleting\u2026");let{ok:B,error:D}=await L.delete(`/files?path=${encodeURIComponent(w)}`);if(!B){q((D==null?void 0:D.message)||"Could not delete file.","error"),b("Delete failed","error");return}let U=e.openTabs.findIndex(P=>P.path===w);if(U!==-1){if(e.openTabs.splice(U,1),e.activeTab===w){let P=e.openTabs[Math.min(U,e.openTabs.length-1)];P?await O(P.path):(e.activeTab=null,F(),X(),le())}H()}await xe(),s(),q(`Deleted ${C}`,"success"),b("Ready")},R=async w=>{let C=w.split("/").pop();if(!await fe({title:"Reset system prompt?",description:`Are you sure you want to reset "${C}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;b("Resetting\u2026");let{ok:B,error:D}=await L.delete(`/files?path=${encodeURIComponent(w)}`);if(!B){q((D==null?void 0:D.message)||"Could not reset file.","error"),b("Reset failed","error");return}let U=e.openTabs.findIndex(P=>P.path===w);if(U!==-1){let{ok:P,data:Z}=await L.get(`/files/content?path=${encodeURIComponent(w)}`);if(P&&typeof(Z==null?void 0:Z.content)=="string"){let Y=e.openTabs[U];Y.baseline=Z.content,Y.dirty=!1,Y._buffer=Z.content,e.activeTab===w&&oe(Z.content,w)}}le(),await xe(),s(),q(`Reset ${C} to default`,"success"),b("Ready")},oe=(w,C)=>{if(!e.monacoInstance||!e.monaco)return;let T=e.monacoInstance.getModel();T&&(e.monacoInstance.setValue(w),e.monaco.editor.setModelLanguage(T,vt(C)),e.monacoInstance.updateOptions({readOnly:S(C)}))},F=()=>{r&&(r.style.display=""),d&&(d.style.display="none")},X=()=>{if(!v)return;if(!e.activeTab){v.textContent="No file open";return}let w=e.openTabs.find(D=>D.path===e.activeTab),C=e.files.find(D=>D.path===e.activeTab),T=C!=null&&C.size?`${(Number(C.size)/1024).toFixed(1)} KB`:"",B=vt(e.activeTab).toUpperCase();v.textContent=[e.activeTab,B,T].filter(Boolean).join(" \u2022 ")},le=()=>{if(!p)return;let w=e.openTabs.find(T=>T.path===e.activeTab);if(e.activeTab?S(e.activeTab):!1){p.disabled=!0,p.textContent="Read-Only",p.classList.remove("vs-btn-primary"),p.classList.add("vs-btn-ghost");return}if(!w||!w.dirty){p.disabled=!0,p.textContent="Saved",p.classList.remove("vs-btn-primary"),p.classList.add("vs-btn-ghost");return}p.disabled=!1,p.textContent="Save",p.classList.remove("vs-btn-ghost"),p.classList.add("vs-btn-primary")},ue=()=>{let w=e.openTabs.find(B=>B.path===e.activeTab);if(!w||!e.monacoInstance)return;let C=e.monacoInstance.getValue(),T=w.dirty;w.dirty=C!==w.baseline,T!==w.dirty&&(le(),H(),w.dirty?b("Unsaved changes","warning"):b("Ready"))},ae=async()=>{var U,P,Z;let w=e.openTabs.find(Y=>Y.path===e.activeTab);if(!w||!w.dirty||!e.monacoInstance)return;let C=e.monacoInstance.getValue();p.disabled=!0,p.textContent="Saving\u2026",b("Saving\u2026");let{ok:T,error:B}=await L.put("/files/content",{path:w.path,content:C});if(!T){p.disabled=!1,p.textContent="Save",q((B==null?void 0:B.message)||"Could not save file.","error"),b("Save failed","error");return}w.baseline=C,w.dirty=!1,w._buffer=C,le(),H(),z(),b("Saved","success"),q(`Saved ${w.path}`,"success"),w.path.toLowerCase().endsWith(".css")?(U=window.sendPreviewMessage)==null||U.call(window,"voxelsite:reload-css"):(P=window.sendPreviewMessage)==null||P.call(window,"voxelsite:reload"),setTimeout(()=>{var Y;return(Y=window.refreshPreview)==null?void 0:Y.call(window)},400),(Z=window.refreshPublishState)==null||Z.call(window,{silent:!0});let D=e.openTabs.find(Y=>Y.path==="assets/css/tailwind.css");D&&w.path!=="assets/css/tailwind.css"&&L.get("/files/content?path=assets/css/tailwind.css").then(({ok:Y,data:te})=>{Y&&typeof(te==null?void 0:te.content)=="string"&&(D.baseline=te.content,D._buffer=te.content,e.activeTab==="assets/css/tailwind.css"&&e.monacoInstance&&e.monacoInstance.setValue(te.content))})},Pe=()=>{let w=C=>{C&&(C.querySelectorAll("[data-file]").forEach(T=>{T.addEventListener("click",B=>{B.target.closest("[data-delete-file]")||j(T.dataset.file)})}),C.querySelectorAll("[data-delete-file]").forEach(T=>{T.addEventListener("click",B=>{B.stopPropagation(),ve(T.dataset.deleteFile)})}),C.querySelectorAll("[data-restore-file]").forEach(T=>{T.addEventListener("click",B=>{B.stopPropagation(),R(T.dataset.restoreFile)})}),C.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(T=>{T.addEventListener("click",B=>{B.stopPropagation();let U=T.closest(".vs-tree-item").dataset.folder;e.expandedFolders.has(U)?e.expandedFolders.delete(U):e.expandedFolders.add(U),s(),z()})}))};w(n),w(o),document.querySelectorAll(".vs-explorer-section-header").forEach(C=>{C.dataset.bound||(C.dataset.bound="true",C.addEventListener("click",()=>{let T=C.dataset.section;e.expandedSections.has(T)?e.expandedSections.delete(T):e.expandedSections.add(T),s(),z()}))})},nt=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(w=>{w.addEventListener("click",C=>{C.target.closest("[data-close-tab]")||O(w.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(w=>{w.addEventListener("click",C=>{C.stopPropagation(),ee(w.dataset.closeTab)})}))};if(m&&u){let w=!1;m.addEventListener("mousedown",C=>{C.preventDefault(),w=!0,m.classList.add("is-dragging");let T=D=>{if(!w)return;let U=Math.min(400,Math.max(200,D.clientX));u.style.width=U+"px"},B=()=>{w=!1,m.classList.remove("is-dragging"),document.removeEventListener("mousemove",T),document.removeEventListener("mouseup",B)};document.addEventListener("mousemove",T),document.addEventListener("mouseup",B)})}p==null||p.addEventListener("click",ae),f==null||f.addEventListener("change",w=>{let C=parseInt(w.target.value,10);e.fontSize=C,e.monacoInstance&&e.monacoInstance.updateOptions({fontSize:C}),s()}),k==null||k.addEventListener("click",()=>{e.wordWrap=!e.wordWrap,g(),e.monacoInstance&&e.monacoInstance.updateOptions({wordWrap:e.wordWrap?"on":"off"}),s()}),l==null||l.addEventListener("click",()=>xe()),h==null||h.addEventListener("click",async()=>{var P;let w=await ns({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!w||!w.trim())return;let C=w.trim(),T=(P=C.split(".").pop())==null?void 0:P.toLowerCase(),B=["php","css","js","json"];if(!T||!B.includes(T)){q(`Only ${B.join(", ")} files can be created.`,"warning");return}b("Creating\u2026");let{ok:D,error:U}=await L.post("/files/create",{path:C});if(!D){q((U==null?void 0:U.message)||"Could not create file.","error"),b("Create failed","error");return}await xe(),await j(C),q(`Created ${C}`,"success")});let wt=w=>{if(e.disposed){document.removeEventListener("keydown",wt);return}(w.metaKey||w.ctrlKey)&&w.key==="s"&&(w.preventDefault(),ae())};document.addEventListener("keydown",wt);let xe=async()=>{var B;let{ok:w,data:C,error:T}=await L.get("/files");if(!w||!((B=C==null?void 0:C.files)!=null&&B.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),o&&(o.innerHTML="");return}e.files=C.files,e.treeData={site:V(C.files.filter(D=>!D.path.startsWith("_prompts/"))),prompts:V(C.files.filter(D=>D.path.startsWith("_prompts/")),"_prompts/")},z()},we=async()=>{if(!d)return;let w;try{w=await Is()}catch{q("Monaco editor is not available.","warning");return}e.monaco=w;let C=mt();w.editor.setTheme(C);let T=w.editor.create(d,{value:"",language:"php",theme:C,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:e.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:e.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});e.monacoInstance=T,T.onDidChangeModelContent(()=>ue()),T.addCommand(w.KeyMod.CtrlCmd|w.KeyCode.KeyK,async()=>{if(e.monacoInstance.getOption(w.editor.EditorOption.readOnly)){q("Cannot use inline AI on a read-only file.","warning");return}let B=e.activeTab;if(!B)return;let D=e.monacoInstance.getModel(),U=e.monacoInstance.getSelection(),P=D.getValueInRange(U);if(!P||P.trim()===""){let ie=e.monacoInstance.getPosition(),me=D.getLineContent(ie.lineNumber);if(me.trim()===""){q("Highlight a block of code to edit.","warning");return}P=me,e.monacoInstance.setSelection(new w.Range(ie.lineNumber,1,ie.lineNumber,D.getLineMaxColumn(ie.lineNumber)))}let Z=await ns({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!Z)return;let Y=e.monacoInstance.getValue();e.monacoInstance.updateOptions({readOnly:!0});let te=document.createElement("div");te.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",te.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${$.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,d&&(d.style.position="relative",d.appendChild(te)),b("AI is editing...","muted");try{await Et("/ai/prompt",{user_prompt:Z,action_type:"inline_edit",action_data:{path:B,selection:P}},{onStatus:ie=>{let me=document.getElementById("ai-inline-status");me&&(me.textContent="Generating...")},onFile:()=>{let ie=document.getElementById("ai-inline-status");ie&&(ie.textContent="Applying changes...")},onError:ie=>{q(ie.message||"Generation failed","error")},onDone:async ie=>{var ot;if((ot=ie.files_modified)==null?void 0:ot.some($e=>(typeof $e=="string"?$e:($e==null?void 0:$e.path)||"").replace(/^\//,"")===B.replace(/^\//,""))){let{ok:$e,data:Le}=await L.get(`/files/content?path=${encodeURIComponent(B)}&_t=${Date.now()}`);if($e&&(Le!=null&&Le.content)){let at=Le.content;await L.put("/files/content",{path:B,content:Y}),e.monacoInstance.getModel().setValue(at);let Se=e.openTabs.find(pn=>pn.path===B);Se&&(Se._buffer=at,Se.baseline=Y),ue(),q("Review changes and save.","success")}}else ie.partial||q("Complete (No changes made to this file)","info")}})}finally{e.monacoInstance.updateOptions({readOnly:!1}),te.parentNode&&te.parentNode.removeChild(te),b("Ready","muted")}})};if(await Promise.all([xe(),we()]),e._pendingRestore&&e._pendingRestore.tabs.length>0){let{tabs:w,active:C}=e._pendingRestore;e._pendingRestore=null;for(let T of w){if(!e.files.some(U=>U.path===T))continue;let{ok:B,data:D}=await L.get(`/files/content?path=${encodeURIComponent(T)}`);B&&typeof(D==null?void 0:D.content)=="string"&&e.openTabs.push({path:T,baseline:D.content,dirty:!1})}if(e.openTabs.length>0){let T=C&&e.openTabs.find(B=>B.path===C)?C:e.openTabs[0].path;N(),await O(T),oe(((vs=e.openTabs.find(B=>B.path===T))==null?void 0:vs.baseline)||"",T),b("Ready")}}}function mt(){return document.documentElement.getAttribute("data-theme")==="studio"?"vs":"vs-dark"}async function Is(){var t;return(t=window.monaco)!=null&&t.editor?window.monaco:ut||(ut=new Promise((e,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(i,r){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{e(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let a=document.createElement("script");a.id="vs-monaco-loader-script",a.src="/_studio/ui/lib/monaco/vs/loader.js",a.async=!0,a.onload=n,a.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(a)}).catch(e=>{throw ut=null,e}),ut)}async function os(t=""){var H,G,W,E;let e=document.getElementById("vs-code-editor-overlay");e&&e.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),a=s.querySelector("#vs-code-reload-btn"),i=s.querySelector("#vs-code-close-btn"),r=s.querySelector("#vs-code-meta"),d=s.querySelector("#vs-code-status"),v=s.querySelector("#vs-code-editor-host"),c={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},p=(x,I="muted")=>{d&&(d.textContent=x,d.dataset.state=I)},l=()=>c.files.find(x=>x.path===c.path)||null,h=()=>!!c.editor&&c.editor.getValue()!==c.baseline,u=()=>{if(!r)return;let x=l();if(!x){r.textContent="No file selected";return}let I=x.size?`${(Number(x.size)/1024).toFixed(1)} KB`:"0 KB",_=x.modified?new Date(x.modified).toLocaleString():"Unknown date";r.textContent=`${x.path} \u2022 ${I} \u2022 ${_}`},m=()=>{if(!o)return;let x=h();o.disabled=!x,o.textContent=x?"Save Changes":"Saved",x?p("Unsaved changes","warning"):c.path&&p("Saved","success")},f=async()=>{var x;c.closed||h()&&!await fe({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(c.closed=!0,(x=c.editorCleanup)!=null&&x.dispose&&(c.editorCleanup.dispose(),c.editorCleanup=null),c.editor&&(c.editor.dispose(),c.editor=null),re(s))},k=(x,I=null)=>{if(!c.editor)return;c.editor.setValue(x),c.baseline=x;let _=(I==null?void 0:I.language)||vt(c.path);c.editor.setLanguage&&c.editor.setLanguage(_),u(),m()},g=async(x,{silent:I=!1}={})=>{if(!x||!c.editor)return!1;c.path=x,I||p("Loading file\u2026");let{ok:_,data:N,error:j}=await L.get(`/files/content?path=${encodeURIComponent(x)}`);if(!_)return q((j==null?void 0:j.message)||"Could not load file.","error"),p("Load failed","error"),!1;let O=typeof(N==null?void 0:N.content)=="string"?N.content:"";return k(O,(N==null?void 0:N.file)||l()),!0},b=async()=>h()?await fe({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,S=async x=>{if(!x||x===c.path)return;if(!await b()){n&&(n.value=c.path);return}await g(x)},A=async()=>{var N,j,O;if(!c.editor||!c.path||!o)return;let x=c.editor.getValue();if(x===c.baseline){m();return}o.disabled=!0,o.textContent="Saving\u2026",p("Saving\u2026");let{ok:I,error:_}=await L.put("/files/content",{path:c.path,content:x});if(!I){o.disabled=!1,o.textContent="Save Changes",q((_==null?void 0:_.message)||"Could not save file.","error"),p("Save failed","error");return}c.baseline=x,m(),p("Saved","success"),q(`Saved ${c.path}`,"success"),c.path.toLowerCase().endsWith(".css")?(N=window.sendPreviewMessage)==null||N.call(window,"voxelsite:reload-css"):(j=window.sendPreviewMessage)==null||j.call(window,"voxelsite:reload"),setTimeout(()=>{var ee;return(ee=window.refreshPreview)==null?void 0:ee.call(window)},400),(O=window.refreshPublishState)==null||O.call(window,{silent:!0})},V=x=>{x.key==="Escape"&&(x.preventDefault(),f())};i==null||i.addEventListener("click",()=>f()),a==null||a.addEventListener("click",async()=>{!c.path||!await b()||await g(c.path)}),o==null||o.addEventListener("click",()=>A()),n==null||n.addEventListener("change",x=>{S(x.target.value)}),s.addEventListener("click",x=>{x.target===s&&f()}),document.addEventListener("keydown",V);let z=()=>document.removeEventListener("keydown",V);s.addEventListener("transitionend",()=>{document.body.contains(s)||z()});try{let x=await L.get("/files");if(!x.ok||!((G=(H=x.data)==null?void 0:H.files)!=null&&G.length)){let j=((W=x.error)==null?void 0:W.message)||"No editable files found.";q(j,"error"),f();return}let I=x.data.files;c.files=I,n&&(n.innerHTML=I.map(j=>{let O=j.group?`${String(j.group).toUpperCase()} \xB7 `:"";return`<option value="${y(j.path)}">${y(O+j.path)}</option>`}).join(""));let _=((E=I.find(j=>j.path===t))==null?void 0:E.path)||I[0].path;c.path=_,n&&(n.value=_),v.innerHTML="";let N=null;try{N=await Is()}catch{q("Monaco is not available yet. Using fallback editor.","warning"),p("Fallback editor active","warning")}if(N!=null&&N.editor){let j=mt();N.editor.setTheme(j);let O=N.editor.create(v,{value:"",language:vt(_),theme:j,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});c.editor={getValue:()=>O.getValue(),setValue:ee=>O.setValue(ee),setLanguage:ee=>{let ve=O.getModel();ve&&N.editor.setModelLanguage(ve,ee)},dispose:()=>O.dispose()},c.editorCleanup=O.onDidChangeModelContent(()=>{m()})}else{v.innerHTML='<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"></textarea>';let j=v.querySelector("#vs-code-editor-fallback"),O=()=>m();j==null||j.addEventListener("input",O),c.editor={getValue:()=>(j==null?void 0:j.value)||"",setValue:ee=>{j&&(j.value=ee)},setLanguage:()=>{},dispose:()=>{j==null||j.removeEventListener("input",O)}}}await g(_,{silent:!0}),p("Ready")}catch(x){q((x==null?void 0:x.message)||"Could not initialize code editor.","error"),f()}finally{let x=new MutationObserver(()=>{document.body.contains(s)||(z(),x.disconnect())});x.observe(document.body,{childList:!0,subtree:!0})}}function Rs(){return setTimeout(()=>St(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function St(){var I,_,N,j,O,ee,ve;let t=document.getElementById("settings-content");if(!t)return;let[e,s,n,o,a,i,r]=await Promise.all([L.get("/settings"),L.get("/settings/system"),L.get("/settings/mail"),L.get("/settings/usage"),L.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),L.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),L.get("/settings/logs")]),d=((I=r.data)==null?void 0:I.logs)||[],v=((_=e.data)==null?void 0:_.settings)||{},c=((N=s.data)==null?void 0:N.system)||{},p=null,l=null;try{a.ok&&((j=a.data)!=null&&j.content)&&(p=JSON.parse(a.data.content))}catch{}try{i.ok&&((O=i.data)!=null&&O.content)&&(l=JSON.parse(i.data.content))}catch{}let h=p||l,u=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},m=v.available_providers||{},f=((ee=n.data)==null?void 0:ee.config)||{},k=((ve=n.data)==null?void 0:ve.presets)||{},g=Object.keys(m),b=v.ai_provider||"claude",A=(m[b]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],V=v[`ai_${b}_model`]||"",z=v[`ai_${b}_api_key_set`]||!1,H=g.map(R=>{let oe=m[R];return`<option value="${y(R)}" ${R===b?"selected":""}>${y(oe.name)}</option>`}).join(""),G="";for(let R of A)R.key==="api_key"?G+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(R.label)}${R.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${z?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${y(R.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${z?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':R.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${y(R.help_text||"Optional for local servers")}</p>`}
          ${R.help_url?`<a href="${R.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${y(R.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:R.key==="base_url"&&(G+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(R.label)}${R.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${y(v.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${y(R.placeholder)}" />
          ${R.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${y(R.help_text)}</p>`:""}
        </div>`);t.innerHTML=`
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="space-y-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${y(v.site_name||"")}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${y(v.site_tagline||"")}"
            class="vs-input"
            placeholder="A short description of your site" />
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
      <div class="space-y-4">
        <div>
          <label for="set-ai-provider" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
          <select id="set-ai-provider" class="vs-input">
            ${H}
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
          <input id="set-max-tokens" type="number" value="${v.ai_max_tokens||32e3}" min="1000" max="128000" step="1000"
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
      <div class="space-y-4">
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
          <div class="space-y-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(k).map(([R,oe])=>`<option value="${y(R)}">${y(oe.label)}</option>`).join("")}
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

        <div class="border-t border-vs-border-subtle my-2"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${y(v.user_email||"")}"
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
        ${p?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${$.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(p).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${$.chevronRight}</div>
        </button>
        `:""}
        ${l?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${$.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(l).length} design decisions</span>
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
      ${u.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${ge("Total Requests",Number(u.totals.request_count).toLocaleString())}
          ${ge("Input Tokens",Number(u.totals.total_input_tokens).toLocaleString())}
          ${ge("Output Tokens",Number(u.totals.total_output_tokens).toLocaleString())}

        </div>
        ${u.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${u.models.map(R=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${ge(R.ai_model||"Unknown",Number(R.request_count).toLocaleString()+" requests")}
                ${ge("Tokens",Number(R.total_input_tokens).toLocaleString()+" in / "+Number(R.total_output_tokens).toLocaleString()+" out")}

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
        ${ge("VoxelSite",c.version||"1.0.0")}
        ${ge("PHP",c.php_version||"?")}
        ${ge("SQLite",c.sqlite_version||"?")}
        ${ge("Database",as(c.database_size))}
        ${ge("Preview Files",as(c.preview_size))}
        ${ge("Assets",as(c.assets_size))}
        ${ge("Upload Limit",c.max_upload||"?")}
        ${ge("Memory Limit",c.memory_limit||"?")}
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
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${d.length>0?"16px":"0"};">
        <div>
          <h3 class="vs-settings-card-title">Server Logs</h3>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Download log files for debugging.</p>
        </div>
        ${d.length>0?`<button id="btn-delete-all-logs" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete all
        </button>`:""}
      </div>
      <div id="log-files-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${d.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':d.map(R=>{let oe=(R.size/1024).toFixed(1),F=new Date(R.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--vs-bg-raised); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--vs-text-secondary);">${R.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${R.lines} lines \xB7 ${oe} KB \xB7 ${F}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(R.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${R.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
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
  `,eo(v,m),to(f,k),Yn(),Xn(),document.querySelectorAll(".btn-delete-log").forEach(R=>{R.addEventListener("click",async()=>{if(R.dataset.confirm!=="true"){R.dataset.confirm="true",R.innerHTML='<span style="font-size: 11px;">Sure?</span>',R.style.color="var(--vs-error)",setTimeout(()=>{R.dataset.confirm==="true"&&(R.dataset.confirm="",R.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',R.style.color="")},3e3);return}let oe=R.dataset.file,F=R.closest(".vs-log-row");F&&(F.style.opacity="0.4"),await L.delete("/settings/logs",{file:oe}),St()})});let W=document.getElementById("btn-delete-all-logs");W&&W.addEventListener("click",async()=>{if(W.dataset.confirm!=="true"){W.dataset.confirm="true",W.textContent="Sure?",W.style.color="var(--vs-error)",setTimeout(()=>{W.dataset.confirm==="true"&&(W.dataset.confirm="",W.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',W.style.color="")},3e3);return}W.disabled=!0,W.textContent="Deleting...",await L.delete("/settings/logs",{file:"*"}),St()});let E=document.getElementById("btn-view-memory");E&&p&&E.addEventListener("click",()=>_s("Site Memory",p,"memory"));let x=document.getElementById("btn-view-design");x&&l&&x.addEventListener("click",()=>_s("Design Intelligence",l,"design")),Gn(),Qn(V)}function Kn(t,e){let s=(t||"0").split(".").map(Number),n=(e||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let a=s[o]||0,i=n[o]||0;if(a>i)return 1;if(a<i)return-1}return 0}function Gn(){let t=document.getElementById("vs-update-zone"),e=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),a=document.getElementById("vs-update-status"),i=document.getElementById("vs-dist-packages");if(!t||!o)return;r();async function r(){var l;if(i)try{let{ok:h,data:u}=await L.get("/update/dist-packages");if(!h||!((l=u==null?void 0:u.packages)!=null&&l.length)){i.innerHTML="";return}let m=u.current_version||"0.0.0",f=u.packages.map(k=>{let g=(k.size/1024/1024).toFixed(1),b=Kn(k.version,m)>0,S=k.version===m,A=b?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':S?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${y(k.filename)}</strong>
                ${A}
              </div>
              <div class="vs-dist-pkg-meta">v${y(k.version)} \xB7 ${g} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${y(k.filename)}" data-version="${y(k.version)}">
              Apply Update
            </button>
          </div>
        `}).join("");i.innerHTML=`
        <div class="vs-dist-packages-section">
          <div class="vs-dist-packages-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Update packages found in <code>/dist/</code></span>
          </div>
          ${f}
        </div>
      `,i.querySelectorAll(".vs-dist-apply-btn").forEach(k=>{k.addEventListener("click",()=>d(k.dataset.filename,k.dataset.version))})}catch{}}async function d(l,h){var m;if(confirm(`Apply update from "${l}" (v${h})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){e.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),a.textContent=`Applying ${l}...`,i&&(i.innerHTML="");try{let{ok:f,data:k,error:g}=await L.post("/update/apply-local",{filename:l});s.classList.add("hidden"),n.classList.remove("hidden");let b=document.getElementById("vs-update-result-icon"),S=document.getElementById("vs-update-result-message");if(f){let A=k;b.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',S.innerHTML=`
          <div class="vs-update-result-title">${y(A.message)}</div>
          <div class="vs-update-result-meta">
            ${A.files_updated} files updated \xB7 ${A.files_skipped} preserved
            ${(m=A.errors)!=null&&m.length?` \xB7 ${A.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",(g==null?void 0:g.message)||"Unknown error")}catch(f){c("Update Failed",y(f.message||"Network error."))}}}t.addEventListener("click",l=>{l.target.closest("#vs-update-result")||o.click()}),t.addEventListener("dragover",l=>{l.preventDefault(),t.classList.add("is-dragover")}),t.addEventListener("dragleave",()=>t.classList.remove("is-dragover")),t.addEventListener("drop",l=>{var u,m;l.preventDefault(),t.classList.remove("is-dragover");let h=(m=(u=l.dataTransfer)==null?void 0:u.files)==null?void 0:m[0];h&&h.name.endsWith(".zip")&&v(h)}),o.addEventListener("change",()=>{var h;let l=(h=o.files)==null?void 0:h[0];l&&v(l),o.value=""});async function v(l){var m,f;let h=document.querySelector(".vs-sys-grid");if(h){let k=h.querySelectorAll(".vs-sys-value"),g="";if(h.querySelectorAll(".vs-sys-label").forEach((b,S)=>{var A,V;b.textContent.trim()==="Upload Limit"&&(g=((V=(A=k[S])==null?void 0:A.textContent)==null?void 0:V.trim())||"")}),g){let b=p(g);if(b>0&&l.size>b){let S=(l.size/1024/1024).toFixed(1);c("File Too Large",`The update file is ${S} MB but your server's upload limit is ${g}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${S} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${l.name}" (${(l.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){e.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),a.textContent=`Uploading ${l.name}...`;try{let k=new FormData;k.append("update_zip",l);let g=M.get("sessionToken"),b=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:g?{"X-VS-Token":g}:{},body:k}),S=b.headers.get("content-type")||"",A;if(!S.includes("application/json")){let H=await b.text();if(H.includes("POST Content-Length")||H.includes("upload_max_filesize")||H.includes("exceeds")){c("Server Upload Limit Exceeded",`The file (${(l.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}c("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}A=await b.json(),s.classList.add("hidden"),n.classList.remove("hidden");let V=document.getElementById("vs-update-result-icon"),z=document.getElementById("vs-update-result-message");if(A.ok){let H=A.data;V.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',z.innerHTML=`
          <div class="vs-update-result-title">${y(H.message)}</div>
          <div class="vs-update-result-meta">
            ${H.files_updated} files updated \xB7 ${H.files_skipped} preserved
            ${(m=H.errors)!=null&&m.length?` \xB7 ${H.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",((f=A.error)==null?void 0:f.message)||"Unknown error")}catch(k){let g=k.message||"Network error. Check your connection.";g.includes("Unexpected token")||g.includes("not valid JSON")?c("Server Upload Limit Exceeded",`The file (${(l.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):c("Upload Failed",y(g))}}}function c(l,h){s.classList.add("hidden"),n.classList.remove("hidden");let u=document.getElementById("vs-update-result-icon"),m=document.getElementById("vs-update-result-message");u.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',m.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${y(l)}</div>
      <div class="vs-update-result-meta">${h}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function p(l){let h=l.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!h)return 0;let u=parseFloat(h[1]),m=h[2].toUpperCase();return m==="GB"||m==="G"?u*1024*1024*1024:m==="MB"||m==="M"?u*1024*1024:m==="KB"||m==="K"?u*1024:0}}function _s(t,e,s){var d,v,c;(d=document.getElementById("vs-knowledge-overlay"))==null||d.remove();let n=p=>p.replace(/[_-]/g," ").replace(/\b\w/g,l=>l.toUpperCase()),o="";s==="memory"?o=Object.entries(e).map(([p,l])=>{let h=typeof l=="object"?l.value||JSON.stringify(l):String(l),u=typeof l=="object"?l.confidence:null,m=u==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${y(n(p))}</div>
          <div class="vs-kv-value">
            <span>${y(h)}</span>
            ${u?`<span class="vs-kv-badge ${m}">${y(u)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(e).map(([p,l])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${y(n(p))}</div>
        <div class="vs-kv-section-body">${y(String(l))}</div>
      </div>
    `).join("");let a=document.createElement("div");a.id="vs-knowledge-overlay",a.className="vs-modal-overlay",a.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?$.book:$.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${y(t)}</h2>
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
  `,document.body.appendChild(a),requestAnimationFrame(()=>a.classList.add("is-visible"));let i=()=>{a.classList.remove("is-visible"),setTimeout(()=>a.remove(),300),document.removeEventListener("keydown",r)},r=p=>{p.key==="Escape"&&i()};document.addEventListener("keydown",r),(v=a.querySelector("#vs-knowledge-close"))==null||v.addEventListener("click",i),(c=a.querySelector("#vs-knowledge-done"))==null||c.addEventListener("click",i),a.addEventListener("click",p=>{p.target===a&&i()})}function Yn(){let t=document.getElementById("btn-reset-site");t&&t.addEventListener("click",()=>{Jn()})}function Xn(){let t=document.getElementById("btn-reset-install");t&&t.addEventListener("click",()=>{Zn()})}function Zn(){let t=document.getElementById("reset-install-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="reset-install-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>{requestAnimationFrame(()=>{e.classList.add("is-visible")})}),setTimeout(()=>{var d;(d=document.getElementById("reset-install-confirm-input"))==null||d.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),a=document.getElementById("reset-install-modal"),i="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let d=s.value.trim()===i;n==null||n.classList.toggle("is-enabled",d),s.classList.toggle("is-matched",d)}),s==null||s.addEventListener("keydown",d=>{d.key==="Enter"&&(s.value.trim()===i?As(e):(a==null||a.classList.add("shake"),setTimeout(()=>a==null?void 0:a.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===i?As(e):(a==null||a.classList.add("shake"),setTimeout(()=>a==null?void 0:a.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>re(e)),e.addEventListener("click",d=>{d.target===e&&re(e)});let r=d=>{d.key==="Escape"&&(re(e),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)}async function As(t){let e=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(e){e.classList.add("is-loading"),e.classList.remove("is-enabled"),e.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:a}=await L.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,e.style.background="var(--vs-success)",e.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let i=t.querySelector(".vs-modal-desc");if(i){let r=i.innerHTML;i.textContent=(a==null?void 0:a.message)||"Reset failed. Please try again.",i.style.color="var(--vs-error)",setTimeout(()=>{i.innerHTML=r,i.style.color=""},4e3)}}}catch{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.textContent="Erase Everything",s&&(s.disabled=!1)}}}function Hs(){return new Promise(t=>{let e=document.getElementById("unsaved-modal-overlay");e&&e.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=a=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),t(a)},300)},o=a=>{a.key==="Escape"&&(a.preventDefault(),a.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function Jn(){let t=document.getElementById("reset-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="reset-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>{requestAnimationFrame(()=>{e.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),a=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let r=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()==="RESET"?Ps(e):(a==null||a.classList.add("shake"),setTimeout(()=>a==null?void 0:a.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?Ps(e):(a==null||a.classList.add("shake"),setTimeout(()=>a==null?void 0:a.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>re(e)),e.addEventListener("click",r=>{r.target===e&&re(e)});let i=r=>{r.key==="Escape"&&(re(e),document.removeEventListener("keydown",i))};document.addEventListener("keydown",i)}async function Ps(t){var n,o;let e=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(e){e.classList.add("is-loading"),e.classList.remove("is-enabled"),e.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:a,data:i,error:r}=await L.post("/site/reset",{confirm:"RESET"});if(a){M.set("pages",[]),M.set("hasFormSchemas",!1),M.set("conversations",null),M.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,e.style.background="var(--vs-success)",e.style.opacity="1",setTimeout(()=>{re(t),window.location.hash!=="#/chat"?window.location.hash="#/chat":window.dispatchEvent(new HashChangeEvent("hashchange"))},800)}else{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let d=t.querySelector(".vs-modal-desc");if(d){let v=d.textContent;d.textContent=(r==null?void 0:r.message)||"Reset failed. Please try again.",d.style.color="var(--vs-error)",setTimeout(()=>{d.textContent=v,d.style.color=""},4e3)}}}catch{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function Qn(t){var s;let e=document.getElementById("set-ai-model");if(e)try{let{ok:n,data:o}=await L.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?e.innerHTML=o.models.map(a=>`<option value="${y(a.id)}" ${a.id===t?"selected":""}>${y(a.name||a.id)}</option>`).join(""):e.innerHTML='<option value="">Test your connection to load available models</option>'}catch{e.innerHTML='<option value="">Test your connection to load available models</option>'}}function ge(t,e){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${t}</span>
      <span class="vs-sys-value">${e}</span>
    </div>
  `}function as(t){return!t&&t!==0?"?":t>=1048576?(t/1048576).toFixed(1)+" MB":t>=1024?(t/1024).toFixed(1)+" KB":t+" B"}function eo(t,e){let s=t.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async c=>{s=c.target.value,await L.put("/settings",{ai_provider:s}),St()});let o=document.getElementById("btn-test-api"),a=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var m,f,k,g;let c=((m=a==null?void 0:a.value)==null?void 0:m.trim())||"",p=((k=(f=document.getElementById("set-base-url"))==null?void 0:f.value)==null?void 0:k.trim())||"";if(s!=="openai_compatible"&&(!c||c.startsWith("\u2022\u2022"))){rs("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:l,data:h,error:u}=await L.post("/settings/test-api",{provider:s,api_key:c.startsWith("\u2022\u2022")?"":c,base_url:p});if(o.textContent="Test Connection",o.disabled=!1,l){if(rs("\u2713 Connected successfully!","success"),(g=h==null?void 0:h.models)!=null&&g.length){let b=document.getElementById("set-ai-model");if(b){let S=t[`ai_${s}_model`]||"";b.innerHTML=h.models.map(A=>`<option value="${y(A.id)}" ${A.id===S?"selected":""}>${y(A.name||A.id)}</option>`).join("")}}}else rs("\u2717 "+((u==null?void 0:u.message)||"Connection failed."),"error")});let i=document.getElementById("btn-save-identity"),r=document.getElementById("save-identity-status");i&&i.addEventListener("click",async()=>{var h,u,m,f;i.textContent="Saving...",i.disabled=!0;let c={site_name:((u=(h=document.getElementById("set-site-name"))==null?void 0:h.value)==null?void 0:u.trim())||"",site_tagline:((f=(m=document.getElementById("set-site-tagline"))==null?void 0:m.value)==null?void 0:f.trim())||""},{ok:p,error:l}=await L.put("/settings",c);i.textContent="Save Identity",i.disabled=!1,r&&(r.classList.remove("hidden"),p?(r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3"):(r.textContent="\u2717 "+((l==null?void 0:l.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3"),setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3))});let d=document.getElementById("btn-save-settings"),v=document.getElementById("save-status");d&&d.addEventListener("click",async()=>{var m,f,k;d.textContent="Saving...",d.disabled=!0;let c={ai_provider:s,[`ai_${s}_model`]:((m=document.getElementById("set-ai-model"))==null?void 0:m.value)||"",ai_max_tokens:parseInt(((f=document.getElementById("set-max-tokens"))==null?void 0:f.value)||"32000",10)},p=document.getElementById("set-base-url");p&&(c.ai_openai_compatible_base_url=p.value.trim());let l=(k=a==null?void 0:a.value)==null?void 0:k.trim();l&&!l.startsWith("\u2022\u2022")&&(c[`ai_${s}_api_key`]=l);let{ok:h,error:u}=await L.put("/settings",c);d.textContent="Save Settings",d.disabled=!1,v&&(v.classList.remove("hidden"),h?(v.textContent="\u2713 Saved",v.className="text-xs text-vs-success ml-3"):(v.textContent="\u2717 "+((u==null?void 0:u.message)||"Failed to save."),v.className="text-xs text-vs-error ml-3"),setTimeout(()=>v==null?void 0:v.classList.add("hidden"),3e3))})}function to(t,e){var h;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),a=document.getElementById("set-smtp-preset"),i=document.getElementById("smtp-preset-help");function r(){if(!t.smtp_host)return"gmail";for(let[u,m]of Object.entries(e))if(m.host&&m.host===t.smtp_host)return u;return"custom"}if(a){let u=r();a.value=u,i&&((h=e[u])!=null&&h.help)&&(i.textContent=e[u].help)}s&&s.addEventListener("change",()=>{let u=s.value;n&&(n.style.display=u==="smtp"?"block":"none"),o&&(o.style.display=u==="mailpit"?"block":"none");let m=document.getElementById("mail-common-fields");m&&(m.style.display=u==="none"?"none":"block")}),a&&a.addEventListener("change",()=>{let u=e[a.value];if(!u)return;let m=document.getElementById("set-smtp-host"),f=document.getElementById("set-smtp-port"),k=document.getElementById("set-smtp-encryption");m&&(m.value=u.host||""),f&&(f.value=u.port||587),k&&(k.value=u.encryption||"tls"),i&&(i.textContent=u.help||"")});let d=document.getElementById("btn-toggle-smtp-pass"),v=document.getElementById("set-smtp-password");d&&v&&d.addEventListener("click",()=>{let u=v.type==="password";v.type=u?"text":"password",d.innerHTML=u?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let c=document.getElementById("btn-mail-test");c&&c.addEventListener("click",async()=>{var b,S;let u=(S=(b=document.getElementById("set-mail-test-recipient"))==null?void 0:b.value)==null?void 0:S.trim();if(!u){is("Enter an email address to send the test to.","warning");return}c.textContent="Sending...",c.disabled=!0;let m=js();m.test_recipient=u;let{ok:f,data:k,error:g}=await L.post("/settings/mail/test",m);c.textContent="Send Test",c.disabled=!1,f?is("\u2713 "+((k==null?void 0:k.message)||"Test email sent successfully!"),"success"):is("\u2717 "+((g==null?void 0:g.message)||"Test failed."),"error")});let p=document.getElementById("btn-save-mail"),l=document.getElementById("save-mail-status");p&&p.addEventListener("click",async()=>{p.textContent="Saving...",p.disabled=!0;let u=js(),{ok:m,error:f}=await L.post("/settings/mail",u);p.textContent="Save Email Settings",p.disabled=!1,l&&(l.classList.remove("hidden"),m?(l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3"):(l.textContent="\u2717 "+((f==null?void 0:f.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3"),setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3))})}function js(){var e,s,n,o,a,i,r,d,v,c,p,l,h,u,m;let t=((e=document.getElementById("set-smtp-password"))==null?void 0:e.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((i=(a=document.getElementById("set-mail-from-name"))==null?void 0:a.value)==null?void 0:i.trim())||"",smtp_host:((d=(r=document.getElementById("set-smtp-host"))==null?void 0:r.value)==null?void 0:d.trim())||"",smtp_port:parseInt(((v=document.getElementById("set-smtp-port"))==null?void 0:v.value)||"587",10),smtp_username:((p=(c=document.getElementById("set-smtp-username"))==null?void 0:c.value)==null?void 0:p.trim())||"",smtp_password:t.startsWith("\u2022\u2022")?"":t,smtp_encryption:((l=document.getElementById("set-smtp-encryption"))==null?void 0:l.value)||"tls",mailpit_host:((u=(h=document.getElementById("set-mailpit-host"))==null?void 0:h.value)==null?void 0:u.trim())||"localhost",mailpit_port:parseInt(((m=document.getElementById("set-mailpit-port"))==null?void 0:m.value)||"1025",10)}}function is(t,e){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=t,s.className=`text-xs mt-1.5 ${e==="success"?"text-vs-success":e==="error"?"text-vs-error":"text-vs-warning"}`)}function rs(t,e){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=t,s.className=`text-xs mt-1.5 ${e==="success"?"text-vs-success":e==="error"?"text-vs-error":"text-vs-warning"}`)}var so=[{route:"chat",label:"Chat"},{route:"editor",label:"Editor"},{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"snapshots",label:"Snapshots"},{route:"settings",label:"Settings"}],ds=["chat","editor"],no="vs-first-run-guide-dismissed",Ys="vs-onboarding-draft-v1",Xs="vs-prompt-recents-v1",Zs="vs-prompt-pins-v1",oo=8,ao=5,Js=document.getElementById("app");async function Qs(){var e;fs(),Cs(),window.marked&&window.marked.use({renderer:{html(s){return y(typeof s=="string"?s:s.text)}}});let t=await L.get("/auth/session");if(!t.ok||!((e=t.data)!=null&&e.user)){Gs();return}M.batch(()=>{M.set("user",t.data.user),M.set("sessionToken",t.data.token)}),window.addEventListener("beforeunload",s=>{var n;(n=window.__hasUnsavedEditorChanges)!=null&&n.call(window)&&(s.preventDefault(),s.returnValue="")}),ze.beforeEach(async(s,n)=>{var o;return n.startsWith("editor")&&!s.startsWith("editor")&&(o=window.__hasUnsavedEditorChanges)!=null&&o.call(window)?await Hs():!0}).on("chat",()=>be()).on("editor",()=>be()).on("pages",()=>be()).on("pages/:slug",()=>be()).on("assets",()=>be()).on("forms",()=>be()).on("forms/:formId",()=>be()).on("snapshots",()=>be()).on("settings",()=>be()).on("profile",()=>be()).onNotFound(()=>ze.navigate("chat")),M.on("user",s=>{s||Gs()}),en(),ze.start()}async function en(){try{let{ok:t,data:e}=await L.get("/pages");if(t&&Array.isArray(e==null?void 0:e.pages)){M.set("pages",e.pages);let s=document.getElementById("chat-messages");s!=null&&s.querySelector(".vs-empty-state")&&(s.innerHTML=tt(),et())}}catch{}}function be(){let t=M.get("route"),e=ds.includes(t);dt()&&ct(),t!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s;t==="editor"?s=Bs():e?s=ro():s=lo(),Js.innerHTML=`
    ${io()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${s}
    </div>
    ${Mo()}
    ${Io()}
    ${Ho()}
  `,qo(),t==="editor"&&Ms()}function io(){let t=M.get("route"),e=M.get("user"),s=M.get("theme"),n=so.map(o=>{let a=t===o.route||t.startsWith(o.route+"/");return`
      <a href="#/${o.route}"
         class="vs-nav-item ${a?"vs-nav-item-active":""}">
        ${o.label}
      </a>
    `}).join("");return`
    <header class="vs-topbar">
      <div class="vs-topbar-inner">
        <!-- Logo + Nav -->
        <div class="flex items-center gap-1">
          <a href="#/chat" class="vs-logo">
            <span class="vs-logo-icon">${$.box}</span>
            <span class="vs-logo-text hidden sm:inline">VoxelSite</span>
          </a>
          <nav class="flex items-center gap-0.5" aria-label="Studio navigation">
            ${n}
          </nav>
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
            title="${s==="forge"?"Switch to light":"Switch to dark"}">
            ${s==="forge"?$.sun:$.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${$.user}
              <span class="hidden sm:inline">${y((e==null?void 0:e.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${$.pencil} Edit Profile
              </a>
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${$.logOut} Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function ro(){let t=M.get("sidebarWidth"),e=M.get("activeConversationId"),s=M.get("activePageScope"),n=tn(s);return`
    <div class="flex h-full">
      <!-- Conversation Panel -->
      <div id="conversation-panel" class="h-full border-r border-vs-border-subtle bg-vs-bg-base flex flex-col relative"
           style="width: ${t}px; min-width: 360px; max-width: 580px;">

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
          ${tt()}
        </div>

        <!-- Prompt Bar -->
        <div class="vs-prompt-area">
          <div class="vs-prompt-container">
            <textarea id="prompt-input"
              class="vs-prompt-input vs-textarea"
              placeholder="Describe what you want to build..."
              rows="3"
              style="max-height: 200px;"></textarea>
            <button id="btn-send"
              class="vs-prompt-send"
              title="Send (\u2318+Enter)">
              ${$.send}
            </button>
          </div>
          <div class="flex items-center justify-between mt-2 px-1">
            <span class="text-2xs text-vs-text-ghost">\u2318+Enter to send</span>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="flex-1 h-full bg-vs-bg-well flex flex-col">
        <!-- Preview Toolbar (aligned with chat header) -->
        <div class="vs-panel-header vs-preview-toolbar">
          <div class="vs-device-toggle">
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${$.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${$.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${$.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Visual editor (V)">
              ${$.pencil} Visual
            </button>
            <button id="btn-edit-code" class="vs-btn vs-btn-ghost vs-btn-xs" title="Edit Code">
              ${$.fileCode} Edit
            </button>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${$.rotateCcw} Refresh
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${$.externalLink}
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
  `}function lo(){let t=M.get("route"),e=M.get("routeParams"),s="1100px";return(t==="settings"||t==="profile")&&(s="680px"),t==="forms/:formId"&&(s="800px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${co(t,e)}
      </div>
    </div>
  `}function co(t,e){switch(t){case"assets":return go();case"forms":return xo();case"forms/:formId":return ko(e.formId);case"snapshots":return bo();case"settings":return Rs();case"profile":return uo();default:return po("Not Found","This page doesn't exist.")}}function po(t,e){return`
    <div class="vs-empty-state" style="min-height: 300px;">
      <div class="vs-empty-icon" style="animation: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      </div>
      <h1 class="vs-empty-title">${t}</h1>
      <p class="vs-empty-description" style="margin-bottom: 0;">${e}</p>
      <p class="text-2xs text-vs-text-ghost mt-4">Coming in a future update.</p>
    </div>
  `}function vo(t){let e={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(t||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return $[e[s]||"layoutGrid"]||$.layoutGrid}function Ds(t){ze.navigate("chat"),setTimeout(()=>{let e=document.getElementById("prompt-input");e&&(e.value=t,e.focus(),e.style.height="auto",e.style.height=e.scrollHeight+"px")},150)}function uo(){let t=M.get("user")||{};return setTimeout(()=>mo(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Edit Profile</h1>
        <p class="vs-page-subtitle">Update your account details.</p>
      </div>

      <!-- Card: Profile -->
      <div class="vs-settings-card">
        <h2 class="vs-settings-card-title">Personal Info</h2>
        <p class="vs-settings-card-subtitle">Your name and email address.</p>
        <div class="space-y-4">
          <div>
            <label class="vs-input-label" for="profile-name">Name</label>
            <input type="text" id="profile-name" class="vs-input" value="${y(t.name||"")}" placeholder="Your name" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-email">Email</label>
            <input type="email" id="profile-email" class="vs-input" value="${y(t.email||"")}" placeholder="you@example.com" />
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
        <div class="space-y-4">
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
  `}function mo(){let t=document.getElementById("btn-save-profile"),e=document.getElementById("profile-info-feedback");t&&t.addEventListener("click",async()=>{var v,c,p,l;let o=(c=(v=document.getElementById("profile-name"))==null?void 0:v.value)==null?void 0:c.trim(),a=(l=(p=document.getElementById("profile-email"))==null?void 0:p.value)==null?void 0:l.trim();if(!o||o.length<2){e&&(e.textContent="Name must be at least 2 characters.",e.className="text-sm text-vs-error");return}t.disabled=!0,t.textContent="Saving...";let{ok:i,error:r,data:d}=await L.put("/auth/profile",{name:o,email:a});t.disabled=!1,t.textContent="Save Profile",i&&(d!=null&&d.user)?(M.set("user",d.user),e&&(e.textContent="Profile updated.",e.className="text-sm text-vs-success"),setTimeout(()=>be(),800)):e&&(e.textContent=(r==null?void 0:r.message)||"Failed to update profile.",e.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var v,c,p;let o=((v=document.getElementById("profile-current-pw"))==null?void 0:v.value)||"",a=((c=document.getElementById("profile-new-pw"))==null?void 0:c.value)||"",i=((p=document.getElementById("profile-confirm-pw"))==null?void 0:p.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(a.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(a!==i){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:r,error:d}=await L.put("/auth/password",{current_password:o,new_password:a});s.disabled=!1,s.textContent="Update Password",r?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(d==null?void 0:d.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function go(){return setTimeout(()=>ft(),0),`
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
      <div id="assets-grid" class="space-y-2">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading assets...</div>
      </div>
    </div>
  `}async function ft(t="all"){var k;let e=document.getElementById("assets-grid");if(!e)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await Ns(n.files),n.value="",ft(t))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=g=>{g.target.closest("button")||n==null||n.click()},o.ondragover=g=>{g.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async g=>{g.preventDefault(),o.classList.remove("is-dragover"),g.dataTransfer.files.length>0&&(await Ns(g.dataTransfer.files),ft(t))});let a=document.getElementById("asset-filters");a&&a.querySelectorAll("[data-filter]").forEach(g=>{g.onclick=()=>{a.querySelectorAll("[data-filter]").forEach(b=>{b.className="vs-device-btn"}),g.className="vs-device-btn vs-device-btn-active",ft(g.dataset.filter)}});let i=t==="code",r=!i&&t!=="all"?`?category=${t}`:"",{ok:d,data:v}=await L.get(`/assets${r}`);if(!d||!((k=v==null?void 0:v.assets)!=null&&k.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let g=document.getElementById("btn-empty-upload"),b=document.getElementById("btn-upload-asset");g&&b&&g.addEventListener("click",()=>b.click());return}let c=v.assets;if(i&&(c=c.filter(g=>g.category==="css"||g.category==="js"),c.length===0)){e.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${$.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let p=["jpg","jpeg","png","gif","webp","svg","ico"],l=c.filter(g=>g.category==="images"&&p.includes(g.extension)),h=c.filter(g=>!p.includes(g.extension)||g.category!=="images");function u(g,b){return g==="css"?$.fileCode:g==="js"?$.fileCode:g==="json"?$.fileJson:g==="pdf"?$.filePdf:["woff2","woff","ttf","otf"].includes(g)?$.type:["mp4","webm"].includes(g)?$.film:["mp3","wav","ogg"].includes(g)?$.music:["txt","md","csv"].includes(g)?$.fileText:["doc","docx","xls","xlsx"].includes(g)?$.fileText:b==="images"?$.image:$.fileText}let m=["css","js","json","svg"],f="";l.length>0&&(f+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',l.forEach((g,b)=>{var z;let S=Fs(g.size),A=g.width?`${g.width}\xD7${g.height}`:"",V=g.extension==="svg";f+=`
        <div class="vs-asset-card" data-lightbox-idx="${b}">
          <div class="vs-asset-card-thumb${V?" is-svg":""}" style="cursor:pointer">
            <img src="${g.thumbnail||g.path}" alt="${y(((z=g.meta)==null?void 0:z.alt)||g.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${y(g.filename)}">${y(g.filename)}</p>
            <p class="vs-asset-card-meta">${A?A+" \xB7 ":""}${S}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${$.copy}</button>
            <button data-delete-asset="${g.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${$.x}</button>
          </div>
        </div>
      `}),f+="</div>"),h.length>0&&h.forEach(g=>{let b=Fs(g.size),S=m.includes(g.extension);f+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${u(g.extension,g.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${y(g.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${g.category} \xB7 ${b}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${S?`
              <button data-edit-asset="${g.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${$.pencil}</button>
            `:""}
            <button data-copy-path="${g.path}" title="Copy web path"
              class="vs-asset-action-btn">${$.copy}</button>
            ${g.category!=="css"&&g.category!=="js"?`
              <button data-delete-asset="${g.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${$.trash2}</button>
            `:""}
          </div>
        </div>
      `}),e.innerHTML=f,e.querySelectorAll("[data-lightbox-idx]").forEach(g=>{let b=g.querySelector(".vs-asset-card-thumb");b&&b.addEventListener("click",()=>{let S=parseInt(g.dataset.lightboxIdx,10);ho(l,S,t)})}),e.querySelectorAll("[data-copy-path]").forEach(g=>{g.addEventListener("click",()=>{navigator.clipboard.writeText(g.dataset.copyPath).then(()=>{let b=g.innerHTML;g.innerHTML="\u2713",g.classList.add("vs-asset-action-copied"),setTimeout(()=>{g.innerHTML=b,g.classList.remove("vs-asset-action-copied")},1200)})})}),e.querySelectorAll("[data-edit-asset]").forEach(g=>{g.addEventListener("click",()=>{let S=g.dataset.editAsset.replace(/^\//,"");os(S)})}),e.querySelectorAll("[data-delete-asset]").forEach(g=>{g.addEventListener("click",async()=>{if(!await fe({title:"Delete Asset",description:`Delete ${g.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:S}=await L.delete("/assets",{path:g.dataset.deleteAsset});S?(q("Asset deleted.","success"),ft(t)):q("Could not delete asset.","error")})})}function ho(t,e,s){let n=e;function o(l){if(l===0)return"0 B";let h=1024,u=["B","KB","MB","GB"],m=Math.floor(Math.log(l)/Math.log(h));return parseFloat((l/Math.pow(h,m)).toFixed(1))+" "+u[m]}let a=document.getElementById("vs-lightbox");a&&a.remove();function i(){var k,g;let l=t[n],h=l.width?`${l.width}\xD7${l.height}`:"",u=o(l.size),m=[h,u,(k=l.extension)==null?void 0:k.toUpperCase()].filter(Boolean),f=t.length>1;return`
      ${f?`
        <button class="vs-lightbox-nav vs-lightbox-nav--prev" id="lightbox-prev" title="Previous (\u2190)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="vs-lightbox-nav vs-lightbox-nav--next" id="lightbox-next" title="Next (\u2192)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `:""}

      <div class="vs-lightbox-stage">
        <div class="vs-lightbox-center">
          <div class="vs-lightbox-image-wrap${["svg","png"].includes(l.extension)?" is-transparent":""}">
            <img src="${l.path}" alt="${y(((g=l.meta)==null?void 0:g.alt)||l.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${y(l.filename)}</span>
            <span class="vs-lightbox-details">${m.join(" \xB7 ")}${f?` \xB7 ${n+1} / ${t.length}`:""}</span>
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
    `}let r=document.createElement("div");r.id="vs-lightbox",r.className="vs-lightbox",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Image preview"),r.innerHTML=i(),document.body.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add("is-visible"))});function d(){r.classList.remove("is-visible"),setTimeout(()=>r.remove(),400),document.removeEventListener("keydown",c)}function v(l){n=l,r.innerHTML=i(),p()}function c(l){if(l.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;d(),l.preventDefault()}l.key==="ArrowRight"&&t.length>1&&(v((n+1)%t.length),l.preventDefault()),l.key==="ArrowLeft"&&t.length>1&&(v((n-1+t.length)%t.length),l.preventDefault())}function p(){var h,u,m;(h=r.querySelector("#lightbox-close"))==null||h.addEventListener("click",f=>{f.stopPropagation(),d()}),r.addEventListener("click",f=>{(f.target===r||f.target.classList.contains("vs-lightbox-stage"))&&d()}),(u=r.querySelector("#lightbox-prev"))==null||u.addEventListener("click",f=>{f.stopPropagation(),v((n-1+t.length)%t.length)}),(m=r.querySelector("#lightbox-next"))==null||m.addEventListener("click",f=>{f.stopPropagation(),v((n+1)%t.length)});let l=r.querySelector("#lightbox-copy");l==null||l.addEventListener("click",f=>{f.stopPropagation();let k=t[n];navigator.clipboard.writeText(k.path).then(()=>{let g=l.innerHTML;l.innerHTML=`${$.check}<span>Copied!</span>`,l.style.borderColor="var(--vs-success)",l.style.color="var(--vs-success)",setTimeout(()=>{l.innerHTML=g,l.style.borderColor="",l.style.color=""},2e3),q("Path copied!","success")})})}document.addEventListener("keydown",c),p()}async function Ns(t){var a,i,r;let e=document.getElementById("status-text");e&&(e.textContent=`Uploading ${t.length} file(s)...`);let s=new FormData;for(let d of t)s.append("file[]",d);let n=M.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let v=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();e&&(e.textContent=v.ok?`\u2713 ${((i=(a=v.data)==null?void 0:a.uploaded)==null?void 0:i.length)||0} file(s) uploaded`:"\u2717 "+(((r=v.error)==null?void 0:r.message)||"Upload failed"),setTimeout(()=>{e&&(e.textContent="Ready")},4e3))}catch{e&&(e.textContent="\u2717 Upload failed",setTimeout(()=>{e&&(e.textContent="Ready")},4e3))}}function Fs(t){if(t===0)return"0 B";let e=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(t)/Math.log(e));return parseFloat((t/Math.pow(e,n)).toFixed(1))+" "+s[n]}function fo(t){let e=new Date(t),n=new Date-e,o=Math.floor(n/1e3),a=Math.floor(o/60),i=Math.floor(a/60),r=Math.floor(i/24);return o<60?"Just now":a<60?`${a} min${a!==1?"s":""} ago`:i<24?`${i} hour${i!==1?"s":""} ago`:r===1?"Yesterday":r<30?`${r} days ago`:e.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function bo(){return setTimeout(()=>_t(),0),`
    <div>
      <div class="flex items-center justify-between mb-8">
        <div class="vs-page-header" style="margin-bottom: 0;">
          <h1 class="vs-page-title">Project History</h1>
          <p class="vs-page-subtitle">Restore points for your website. Experiment fearlessly.</p>
        </div>
        <button id="btn-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">Create Snapshot</button>
      </div>
      <div id="snapshots-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading snapshots...</div>
      </div>
    </div>
  `}async function _t(){var a;let t=document.getElementById("snapshots-list");if(!t)return;let e=document.getElementById("btn-create-snapshot");e&&e.addEventListener("click",()=>{qs()});let{ok:s,data:n}=await L.get("/snapshots");if(!s||!((a=n==null?void 0:n.snapshots)!=null&&a.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p class="vs-empty-state-title">No snapshots yet</p>
          <p class="vs-empty-state-desc">Create your first restore point. Experiment fearlessly.</p>
          <button id="btn-empty-create-snapshot" class="vs-btn vs-btn-primary vs-btn-sm">Create Snapshot</button>
        </div>
      </div>
    `;let i=document.getElementById("btn-empty-create-snapshot");i&&i.addEventListener("click",()=>qs());return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((i,r)=>{let d=fo(i.created_at),v=new Date(i.created_at).toLocaleString(),c=i.size_bytes?(i.size_bytes/1024).toFixed(0)+" KB":"\u2014",p=r===o.length-1,l,h,u;i.snapshot_type==="pre_publish"?(l="var(--vs-success)",h="vs-snap-badge-green",u="Pre-publish"):i.snapshot_type==="manual"?(l="var(--vs-accent)",h="vs-snap-badge-amber",u="Manual"):(l="var(--vs-text-ghost)",h="vs-snap-badge-gray",u="Auto");let m=i.description?`<p class="vs-timeline-desc">${y(i.description)}</p>`:"";return`
          <div class="vs-timeline-item${p?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${l}; box-shadow: 0 0 0 3px color-mix(in srgb, ${l} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${h}">${u}</span>
                  <span class="vs-timeline-label">${y(i.label||"Snapshot #"+i.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${v}">${d}</span>
              </div>
              ${m}
              <div class="vs-timeline-meta">${i.file_count} files \xB7 ${c}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${i.id}" data-snap='${JSON.stringify({label:i.label,description:i.description,type:i.snapshot_type,files:i.file_count,size:c,date:v}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${$.eye} Preview
                </button>
                <button data-restore-id="${i.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${$.rotateCcw} Restore
                </button>
                <button data-delete-id="${i.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${$.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,t.querySelectorAll("[data-preview-id]").forEach(i=>{i.addEventListener("click",()=>{let r=JSON.parse(i.dataset.snap);yo(r)})}),t.querySelectorAll("[data-restore-id]").forEach(i=>{i.addEventListener("click",async()=>{let r=i.dataset.restoreId;if(!await fe({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;i.innerHTML=`${$.rotateCcw} Restoring\u2026`,i.disabled=!0;let{ok:v,error:c}=await L.post(`/snapshots/${r}/restore`);if(v){let p=document.getElementById("status-text");p&&(p.textContent="\u2713 Snapshot restored",setTimeout(()=>{p&&(p.textContent="Ready")},4e3)),q("Snapshot restored.","success"),_t()}else q((c==null?void 0:c.message)||"Failed to restore snapshot.","error"),i.innerHTML=`${$.rotateCcw} Restore`,i.disabled=!1})}),t.querySelectorAll("[data-delete-id]").forEach(i=>{i.addEventListener("click",async()=>{let r=i.dataset.deleteId;if(!await fe({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;i.innerHTML="Deleting\u2026",i.disabled=!0;let{ok:v,error:c}=await L.delete(`/snapshots/${r}`);v?(q("Snapshot deleted.","success"),_t()):(q((c==null?void 0:c.message)||"Failed to delete snapshot.","error"),i.innerHTML=`${$.trash2}`,i.disabled=!1)})})}function qs(){var a;let t=document.getElementById("vs-snapshot-create-overlay");t&&t.remove();let e=document.createElement("div");e.id="vs-snapshot-create-overlay",e.className="vs-modal-overlay",e.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${$.camera} Create Snapshot</h2>
        <p class="vs-modal-desc">Save a restore point of your current site state.</p>
      </div>
      <div class="vs-modal-body">
        <div class="space-y-4">
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("is-visible"));let s=()=>re(e);e.addEventListener("click",i=>{i.target===e&&s()}),(a=document.getElementById("snap-cancel"))==null||a.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",i=>{i.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var v;let i=((v=n==null?void 0:n.value)==null?void 0:v.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:r,error:d}=await L.post("/snapshots",{type:"manual",label:"Manual snapshot",description:i});s(),r?(q("Snapshot created.","success"),_t()):q((d==null?void 0:d.message)||"Failed to create snapshot.","error")})}function yo(t){var a;let e=document.getElementById("vs-snapshot-preview-overlay");e&&e.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;t.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):t.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
    <div class="vs-modal" style="max-width: 480px;">
      <div class="vs-modal-header">
        <h2 class="vs-modal-title">${$.eye} Snapshot Details</h2>
      </div>
      <div class="vs-modal-body">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 13px;">
          <span style="color: var(--vs-text-ghost);">Type</span>
          <span style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${n}; display: inline-block;"></span>
            ${o}
          </span>
          <span style="color: var(--vs-text-ghost);">Label</span>
          <span style="color: var(--vs-text-primary);">${y(t.label||"\u2014")}</span>
          <span style="color: var(--vs-text-ghost);">Description</span>
          <span style="color: var(--vs-text-primary);">${y(t.description||"\u2014")}</span>
          <span style="color: var(--vs-text-ghost);">Date</span>
          <span style="color: var(--vs-text-primary);">${t.date}</span>
          <span style="color: var(--vs-text-ghost);">Files</span>
          <span style="color: var(--vs-text-primary);">${t.files} files</span>
          <span style="color: var(--vs-text-ghost);">Size</span>
          <span style="color: var(--vs-text-primary);">${t.size}</span>
        </div>
      </div>
      <div class="vs-modal-footer">
        <button id="snap-preview-close" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Close</button>
      </div>
    </div>
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),s.addEventListener("click",i=>{i.target===s&&re(s)}),(a=document.getElementById("snap-preview-close"))==null||a.addEventListener("click",()=>re(s))}var ye={new:{bg:"var(--vs-warning-dim)",text:"var(--vs-warning)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function xo(){return setTimeout(()=>wo(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function wo(){let t=document.getElementById("forms-list");if(!t)return;let{ok:e,data:s}=await L.get("/forms");if(!e||!s){t.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/></svg>
          </div>
          <p class="vs-empty-state-title">No forms yet</p>
          <p class="vs-empty-state-desc">Form entries will appear here when forms on a published website are submitted.</p>
        </div>
      </div>
    `;return}t.innerHTML=`
    <div class="space-y-3">
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
  `}function ko(t){return setTimeout(()=>Eo(t),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function Eo(t){let e=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!e)return;let{ok:n,data:o}=await L.get(`/forms/${encodeURIComponent(t)}`);if(!n||!o){e.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let a=o.form,i=o.stats;e.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/forms" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Forms</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${y(a.name||t)}</span>
      </div>
      <h1 class="vs-page-title">${y(a.name||t)}</h1>
      ${a.description?`<p class="vs-page-subtitle">${y(a.description)}</p>`:""}
    </div>

    <div class="vs-form-stats-row">
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${i.total}</span>
        <span class="vs-form-stat-label">Total</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-warning)">${i.new||0}</span>
        <span class="vs-form-stat-label">New</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${i.read||0}</span>
        <span class="vs-form-stat-label">Read</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-success)">${i.replied||0}</span>
        <span class="vs-form-stat-label">Replied</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value" style="color: var(--vs-text-ghost)">${i.archived||0}</span>
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
        <a href="/_studio/api/router.php?_path=%2Fforms%2F${encodeURIComponent(t)}%2Fsubmissions%2Fexport" target="_blank" class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </a>
      </div>
    </div>
  `;let r=document.getElementById("form-filter-status"),d=document.getElementById("form-filter-source"),v=document.getElementById("form-filter-search"),c=null,p=()=>At(t,1);r==null||r.addEventListener("change",p),d==null||d.addEventListener("change",p),v==null||v.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(p,300)}),await At(t,1)}async function At(t,e=1){var f,k,g;let s=document.getElementById("form-submissions");if(!s)return;let n=((f=document.getElementById("form-filter-status"))==null?void 0:f.value)||"all",o=((k=document.getElementById("form-filter-source"))==null?void 0:k.value)||"all",a=((g=document.getElementById("form-filter-search"))==null?void 0:g.value)||"",i=`/forms/${encodeURIComponent(t)}/submissions?page=${e}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(i+=`&source=${encodeURIComponent(o)}`),a&&(i+=`&search=${encodeURIComponent(a)}`);let{ok:r,data:d}=await L.get(i);if(!r||!d){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let v=d.submissions||[],c=d.total||0,p=d.per_page||20,l=Math.ceil(c/p);if(!v.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:h}=await L.get(`/forms/${encodeURIComponent(t)}`),u=h==null?void 0:h.form,m={};u!=null&&u.fields&&u.fields.forEach(b=>{m[b.name]=b.label||b.name}),s.innerHTML=`
    <div class="space-y-2" id="submissions-list">
      ${v.map(b=>{let S=ye[b.status]||ye.new,A=Object.entries(b.data||{}).filter(([H])=>!H.startsWith("_")).slice(0,3).map(([H,G])=>{let W=m[H]||H,E=Array.isArray(G)?G.join(", "):String(G);return`<span class="vs-sub-field"><strong>${y(W)}:</strong> ${y(E.substring(0,80))}${E.length>80?"\u2026":""}</span>`}).join(""),V=$o(b.created_at),z=b.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${b.id}" data-form-id="${y(t)}" style="border-left-color: ${S.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${S.bg}; color: ${S.text};">${S.label}</span>
                ${z?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${y(V)}</span>
            </div>
            <div class="vs-submission-preview">
              ${A||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${b.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${b.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;">
                ${Object.entries(ye).map(([H,G])=>`<option value="${H}" ${b.status===H?"selected":""}>${G.label}</option>`).join("")}
              </select>
              <button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${b.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `}).join("")}
    </div>

    ${l>1?`
      <div class="vs-pagination">
        ${e>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${e-1}" data-form-id="${y(t)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${e} of ${l} \xB7 ${c} submission${c!==1?"s":""}</span>
        ${e<l?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${e+1}" data-form-id="${y(t)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${c} submission${c!==1?"s":""}</span>
      </div>
    `}
  `,Co(t,e)}function Co(t,e){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;zs(t,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{let n=s.dataset.subId,{ok:o}=await L.put(`/forms/${encodeURIComponent(t)}/submissions/${n}`,{status:s.value});if(o){q("Status updated","success");let a=s.closest(".vs-submission-card"),i=ye[s.value];if(a&&i){a.style.borderLeftColor=i.text;let r=a.querySelector(".vs-status-pill");r&&(r.style.background=i.bg,r.style.color=i.text,r.textContent=i.label)}}else q("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.dataset.subId;if(!await fe({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:a}=await L.delete(`/forms/${encodeURIComponent(t)}/submissions/${n}`);a?(q("Submission deleted","success"),At(t,e)):q("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);At(t,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;zs(t,o)})})}async function zs(t,e){var p,l,h,u;(p=document.getElementById("submission-detail-overlay"))==null||p.remove();let{ok:s,data:n}=await L.get(`/forms/${encodeURIComponent(t)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(m=>String(m.id)===String(e));if(!o){q("Submission not found","error");return}let{data:a}=await L.get(`/forms/${encodeURIComponent(t)}`),i=a==null?void 0:a.form,r={};if(i!=null&&i.fields&&i.fields.forEach(m=>{r[m.name]=m.label||m.name}),o.status==="new"){await L.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{status:"read"}),o.status="read";let m=document.querySelector(`.vs-sub-status-select[data-sub-id="${e}"]`);m&&(m.value="read");let f=document.querySelector(`.vs-submission-card[data-sub-id="${e}"]`);if(f){f.style.borderLeftColor=ye.read.text;let k=f.querySelector(".vs-status-pill");k&&(k.style.background=ye.read.bg,k.style.color=ye.read.text,k.textContent="Read")}}let d=ye[o.status]||ye.new,v=document.createElement("div");v.id="submission-detail-overlay",v.className="vs-slide-overlay",v.innerHTML=`
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
            <span class="vs-status-pill" style="background: ${d.bg}; color: ${d.text};">${d.label}</span>
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
          ${Object.entries(o.data||{}).filter(([m])=>!m.startsWith("_")).map(([m,f])=>{let k=r[m]||m,g=Array.isArray(f)?f.join(", "):String(f);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${y(k)}</div>
                <div class="vs-sub-detail-field-value">${y(g)}</div>
              </div>
            `}).join("")}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Internal Notes</h3>
        <textarea id="sub-detail-notes" class="vs-input" style="min-height: 80px; resize: vertical;" placeholder="Add private notes about this submission...">${y(o.notes||"")}</textarea>
        <button id="btn-save-sub-notes" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-top: 8px;">Save Notes</button>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Change Status</h3>
        <select id="sub-detail-status" class="vs-input">
          ${Object.entries(ye).map(([m,f])=>`<option value="${m}" ${o.status===m?"selected":""}>${f.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(v),requestAnimationFrame(()=>{requestAnimationFrame(()=>v.classList.add("is-visible"))});let c=()=>{v.classList.remove("is-visible"),setTimeout(()=>v.remove(),200)};v.addEventListener("click",m=>{m.target===v&&c()}),(l=document.getElementById("close-sub-detail"))==null||l.addEventListener("click",c),(h=document.getElementById("btn-save-sub-notes"))==null||h.addEventListener("click",async()=>{var k;let m=((k=document.getElementById("sub-detail-notes"))==null?void 0:k.value)||"",{ok:f}=await L.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{notes:m});q(f?"Notes saved":"Failed to save notes",f?"success":"error")}),(u=document.getElementById("sub-detail-status"))==null||u.addEventListener("change",async m=>{let f=m.target.value,{ok:k}=await L.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{status:f});if(k){q("Status updated","success");let g=document.querySelector(`.vs-sub-status-select[data-sub-id="${e}"]`);g&&(g.value=f);let b=document.querySelector(`.vs-submission-card[data-sub-id="${e}"]`),S=ye[f];if(b&&S){b.style.borderLeftColor=S.text;let A=b.querySelector(".vs-status-pill");A&&(A.style.background=S.bg,A.style.color=S.text,A.textContent=S.label)}}else q("Failed to update status","error")})}function $o(t){if(!t)return"";let e=Date.now(),s=new Date(t).getTime(),n=e-s,o=Math.floor(n/6e4),a=Math.floor(n/36e5),i=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:a<24?`${a} hr ago`:i<7?`${i} day${i>1?"s":""} ago`:new Date(t).toLocaleDateString()}function Lo(){let t=document.getElementById("conversation-history-panel");if(!t)return;t.classList.contains("hidden")?(t.classList.remove("hidden"),So()):t.classList.add("hidden")}async function So(){let t=document.getElementById("conversation-list");if(!t)return;t.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:e,data:s,error:n}=await L.get("/ai/conversations");if(!e||!(s!=null&&s.conversations)){t.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${y((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,a=M.get("activeConversationId");if(o.length===0){t.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}t.innerHTML=o.map(i=>{let r=i.id===a,d=i.title||"Untitled conversation",v=i.updated_at?new Date(i.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${r?"vs-conv-item-active":""}"
              data-conversation-id="${y(i.id)}">
        <span class="mt-0.5 shrink-0 ${r?"text-vs-accent":"text-vs-text-ghost"}">${$.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${r?"font-medium":""}" style="font-size: var(--text-sm);">${y(d)}</div>
          <div class="vs-conv-time mt-0.5">${v}</div>
        </div>
        ${r?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),t.querySelectorAll("[data-conversation-id]").forEach(i=>{i.addEventListener("click",()=>{let r=i.dataset.conversationId;Pt(r);let d=document.getElementById("conversation-history-panel");d&&d.classList.add("hidden")})})}async function Pt(t){let e=document.getElementById("chat-messages");if(!e)return;e.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await L.get(`/ai/conversations/${t}`);if(!s||!(n!=null&&n.conversation)){M.set("activeConversationId",null),Rt(null);try{localStorage.removeItem("vs-active-conversation")}catch{}e.innerHTML=tt(),et();return}let a=n.conversation,i=a.prompts||[];M.set("activeConversationId",t),Rt(a.page_scope||null);try{localStorage.setItem("vs-active-conversation",t)}catch{}if(i.length===0){e.innerHTML=tt(),et();return}let r="",d=!1;for(let v of i)if(r+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        <div class="text-sm text-vs-text-primary leading-relaxed">${y(v.user_prompt)}</div>
      </div>
    `,v.ai_response||v.files_modified){let c="",p=typeof v.ai_message=="string"&&v.ai_message.trim()!==""?v.ai_message:v.ai_response;p&&(c=It(p));let l="";if(v.files_modified)try{let u=JSON.parse(v.files_modified);if(Array.isArray(u)&&u.length>0){let m=u.map(k=>{let g=typeof k=="string"?k:k.path||k,b=typeof k=="object"&&k.action==="delete";return`<div class="vs-file-badge ${b?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${b?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${y(String(g))}</span>
              </div>`}).join(""),f=u.length;l=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${f} file${f!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${m}</div>
              </div>`}}catch{}let h=v.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${c}</div>
          ${l}
          ${h}
        </div>
      `}else if(v.status==="streaming"){d=!0;let c=v.id;r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Generation in progress...
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${c})"
              class="vs-btn vs-btn-ghost vs-btn-xs" style="margin-left: 4px; color: var(--vs-text-tertiary);">Stop</button>
          </div>
        </div>
      `}else v.status==="partial"?r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 text-sm rounded-lg" style="background: var(--vs-warning-dim, rgba(234,179,8,0.1)); color: var(--vs-warning, #eab308);">
            Generation was interrupted. Some files may be missing \u2014 send a follow-up prompt to complete the site.
          </div>
        </div>
      `:v.status==="error"&&(r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="mt-1 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>
        </div>
      `);e.innerHTML=r,e.scrollTop=e.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),d&&!window.__vsResumedToastByConversation[t]&&(q("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[t]=!0),d||delete window.__vsResumedToastByConversation[t],window.__vsCancelStreamingPrompt=async function(v){try{await L.post("/ai/cancel-generation",{prompt_id:v})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[t]="__cancelled__",Pt(t)},d&&M.get("activeConversationId")===t&&!M.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[t]=(window.__vsPollingCount[t]||0)+1,window.__vsPollingCount[t]<=60?setTimeout(()=>{M.get("activeConversationId")===t&&!M.get("aiStreaming")&&Pt(t)},2500):delete window.__vsPollingCount[t]):window.__vsPollingCount&&delete window.__vsPollingCount[t]}function To(){M.set("activeConversationId",null),Rt(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let t=document.getElementById("chat-messages");t&&(t.innerHTML=tt(),et());let e=document.getElementById("conversation-history-panel");e&&e.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function tn(t){if(!t)return"Pages";let e=t.replace(/\.(php|html)$/i,"");if(e==="index")return"Home Page";let s=e.split("/");e=s[s.length-1];let n=e.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):e}function jt(){let t=document.getElementById("scope-label");if(!t)return;let e=window.__vsCurrentPreviewPath||null;t.textContent=tn(e)}function Rt(t){M.set("activePageScope",t||null),jt(),dt()&&ct()}async function Bo(){let t=document.getElementById("vs-pages-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="vs-pages-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("is-visible"));let s=()=>re(e);e.querySelector("#vs-pages-modal-close").addEventListener("click",s),e.addEventListener("click",c=>{c.target===e&&s()}),e.addEventListener("keydown",c=>{c.key==="Escape"&&s()});let n=e.querySelector("#vs-pages-modal-body"),{ok:o,data:a,error:i}=await L.get("/pages?flat=1");if(!o||!Array.isArray(a==null?void 0:a.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${y((i==null?void 0:i.message)||"Could not load pages.")}
      </div>
    `;return}let r=a.pages;if(!r.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${$.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let d='<div style="display: flex; flex-direction: column; gap: 2px;">';r.forEach(c=>{let p=!!Number(c.is_homepage),l=c.title||c.slug||c.path,h=c.path||c.slug+".php",u="/"+h.replace(/\.php$/,"").replace(/^index$/,""),m=u==="/"?"/":u,f=vo(c.slug),g=(window.__vsCurrentPreviewPath||"index.php")===h,b=c.size?(c.size/1024).toFixed(1)+" KB":"";d+=`
      <div class="vs-pages-modal-item ${g?"is-active":""}" data-slug="${y(c.slug)}" data-path="${y(h)}" data-title="${y(l)}" data-url="${y(m)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${f}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(l)}${p?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(h)}${b?" \xB7 "+b:""}
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
    `}),d+="</div>",n.innerHTML=d;let v=e.querySelector(".vs-modal-desc");v&&(v.textContent=`${r.length} page${r.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(c=>{c.addEventListener("click",p=>{p.stopPropagation();let l=c.closest(".vs-pages-modal-item"),h=l.dataset.slug,u=l.dataset.path,m=l.dataset.title,f=l.dataset.url,k=c.dataset.action;if(k==="edit")Rt(h),s(),Ds(`Edit the "${m}" page (${f}): `);else if(k==="preview"){let g=document.getElementById("preview-iframe");g?(dt()&&ct(),g.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(u)+"&t="+Date.now(),window.__vsCurrentPreviewPath=u,jt(),s(),q(`Preview: ${m}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(u),"_blank")}else if(k==="delete"){s();let g=`Delete the "${m}" page (${f}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;Ds(g)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(c=>{c.addEventListener("click",p=>{if(p.target.closest(".vs-pages-action"))return;let l=c.dataset.path,h=c.dataset.title,u=document.getElementById("preview-iframe");u?(u.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(l)+"&t="+Date.now(),window.__vsCurrentPreviewPath=l,jt(),s(),q(`Preview: ${h}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(l),"_blank")})})}function et(){document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let e=document.getElementById("prompt-input");e&&(e.value=t.dataset.quickPrompt,e.dataset.actionType=t.dataset.actionType||"free_prompt",e.focus(),e.setSelectionRange(0,e.value.length),e.dispatchEvent(new Event("input",{bubbles:!0})))})})}function tt(){let t=M.get("pages")||[],e=t.length>0,s=new Set(t.map(m=>m.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(m=>{let f=m.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(f)}),a=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],i=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],r=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],d=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],v=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],c=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],p,l,h;if(!e)l="What are we building?",h="Describe your website and watch it appear in the preview. Every detail is a conversation away.",p=ls(n).slice(0,6);else{l="What\u2019s next?",h="Your site is live in preview. Pick a suggestion or describe any change you want.";let m=[...o,...o,...a,...i,...r,...d,...v,...c];p=ls(m).slice(0,6);let f=new Set;if(p=p.filter(k=>f.has(k.label)?!1:(f.add(k.label),!0)),p.length<6){let k=ls(m).filter(g=>!f.has(g.label));for(let g of k){if(p.length>=6)break;p.push(g),f.add(g.label)}}}let u=p.map(m=>`<button data-quick-prompt="${y(m.prompt).replace(/"/g,"&quot;")}" data-action-type="${m.type}"
      class="vs-style-card">${y(m.label)}</button>`).join(`
        `);return`
    <div class="vs-empty-state">
      <div class="vs-empty-icon vs-animate-in vs-stagger-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      </div>
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${l}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${h}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${u}
      </div>
    </div>
  `}function ls(t){let e=[...t];for(let s=e.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[e[s],e[n]]=[e[n],e[s]]}return e}function Mo(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-vs-success" title="Connected"></span>
          <span id="status-text" class="text-xs text-vs-text-ghost">Ready</span>
        </div>
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
        <span id="publish-state-label" class="text-2xs text-vs-text-ghost">Checking changes...</span>
        <button id="btn-publish"
          class="vs-btn vs-btn-primary vs-btn-xs">
          ${$.publish} Publish
        </button>
      </div>
    </footer>
  `}function Io(){return`
    <div id="command-palette" class="hidden fixed inset-0 z-[120]">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" data-command-overlay></div>
      <div class="absolute left-1/2 top-[12vh] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-vs-border-subtle bg-vs-bg-surface shadow-2xl overflow-hidden">
        <div class="px-4 py-3 border-b border-vs-border-subtle">
          <input id="command-palette-input" type="text" autocomplete="off"
            class="w-full bg-transparent text-sm text-vs-text-primary placeholder:text-vs-text-ghost focus:outline-none"
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
  `}function sn(){let t=(e,s,n,o,a)=>({id:e,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:a,run:()=>rn(a)});return[t("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),t("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),t("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),t("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),t("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),t("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),t("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),t("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),t("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),t("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),t("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),t("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),t("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),t("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),t("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),t("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),t("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),t("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),t("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),t("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),t("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),t("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),t("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),t("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),t("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),t("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),t("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),t("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),t("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),t("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),t("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),t("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),t("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),t("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),t("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),t("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),t("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),t("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),t("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),t("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),t("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),t("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),t("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),t("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),t("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),t("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),t("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),t("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),t("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),t("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),t("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),t("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),t("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),t("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),t("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),t("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),t("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),t("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),t("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),t("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),t("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),t("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),t("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),t("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),t("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),t("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),t("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),t("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),t("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),t("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),t("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),t("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),t("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),t("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),t("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),t("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),t("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),t("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),t("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),t("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),t("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),t("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),t("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),t("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),t("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),t("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),t("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),t("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),t("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),t("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),t("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),t("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),t("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),t("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),t("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),t("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),t("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),t("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),t("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function nn(t){try{let e=localStorage.getItem(t);if(!e)return[];let s=JSON.parse(e);return Array.isArray(s)?s:[]}catch{return[]}}function on(t,e){try{localStorage.setItem(t,JSON.stringify(e))}catch{}}function Dt(){return nn(Zs)}function ps(){return nn(Xs)}function an(t){let e=Dt(),s=e.includes(t)?e.filter(o=>o!==t):[...e,t];on(Zs,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};yt(n.query||"",n.activeIndex||0)}function _o(t){let e=ps().filter(n=>n!==t),s=[t,...e].slice(0,8);on(Xs,s)}function rn(t){if(M.get("route")!=="chat"){ze.navigate("chat"),setTimeout(()=>rn(t),80);return}let e=document.getElementById("prompt-input");e&&(e.value=t,e.focus(),e.setSelectionRange(0,e.value.length),e.dispatchEvent(new Event("input",{bubbles:!0})))}function ln(t,e="free_prompt",s=!1){if(M.get("route")!=="chat"){ze.navigate("chat"),setTimeout(()=>ln(t,e,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=t,n.dataset.actionType=e,s?Ht():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function gt(){let t=document.getElementById("command-palette");return!!t&&!t.classList.contains("hidden")}function Us(t=""){let e=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!e||!s||(e.classList.remove("hidden"),s.value=t,s.focus(),s.select(),yt(t,0))}function bt(){let t=document.getElementById("command-palette");t&&t.classList.add("hidden")}function Ao(t,e){let s=0,n=0,o=0;for(let a=0;a<e.length&&s<t.length;a++)e[a]===t[s]?(n+=a,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<t.length?null:n}function Po(t,e){let s=(t||"").trim().toLowerCase();if(!s)return 0;let n=`${e.title} ${e.meta} ${e.group} ${e.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let a=Ao(s,n);return a===null?null:70+a}function jo(t){let e=(t||"").trim().toLowerCase(),s=sn(),n=Dt(),o=ps();return s.map(a=>{let i=Po(e,a);if(i===null)return null;let r=n.includes(a.id)?-12:0,d=o.includes(a.id)?-8:0;return{...a,__score:i+r+d}}).filter(Boolean).sort((a,i)=>a.__score-i.__score||a.title.localeCompare(i.title))}function Ro(t){let e=sn(),s=Object.fromEntries(e.map(p=>[p.id,p])),n=(t||"").trim(),o=[];if(n!==""){let p=jo(t).slice(0,18);return p.length>0&&o.push({title:"Results",commands:p}),o}let a=ps(),i=Dt(),r=new Set,d=a.map(p=>s[p]).filter(Boolean);d.length>0&&(o.push({title:"Recent",commands:d}),d.forEach(p=>r.add(p.id)));let v=i.map(p=>s[p]).filter(p=>p&&!r.has(p.id));return v.length>0&&(o.push({title:"Pinned",commands:v}),v.forEach(p=>r.add(p.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(p=>{let l=e.filter(h=>h.group===p&&!r.has(h.id));l.length>0&&(o.push({title:p,commands:l}),l.forEach(h=>r.add(h.id)))}),o}function yt(t,e=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Ro(t),o=n.flatMap(v=>v.commands),a=Math.max(0,Math.min(e,Math.max(0,o.length-1))),i=Dt();if(window.__vsCommandPalette={commands:o,activeIndex:a,query:t},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let r="",d=0;n.forEach(v=>{r+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${y(v.title)}</div>`,v.commands.forEach(c=>{let p=d===a,l=i.includes(c.id);r+=`
        <div class="flex items-center gap-1.5 px-1 py-0.5 rounded-xl ${p?"bg-vs-bg-inset":""}">
          <button type="button"
            data-command-index="${d}"
            class="flex-1 text-left px-2 py-2 rounded-lg transition-colors ${p?"":"hover:bg-vs-bg-inset/70"}">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm text-vs-text-secondary truncate">${y(c.title)}</div>
                <div class="text-xs text-vs-text-ghost truncate" style="max-width:420px">${y(c.prompt?c.prompt.substring(0,80)+(c.prompt.length>80?"\u2026":""):c.meta)}</div>
              </div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${y(c.id)}"
            class="w-7 h-7 inline-flex items-center justify-center rounded-md text-xs ${l?"text-vs-accent":"text-vs-text-ghost hover:text-vs-text-secondary"}"
            title="${l?"Unpin command":"Pin command"}">
            ${l?"\u2605":"\u2606"}
          </button>
        </div>
      `,d+=1})}),s.innerHTML=r,s.querySelectorAll("[data-command-index]").forEach(v=>{v.addEventListener("click",()=>{let c=parseInt(v.dataset.commandIndex||"0",10);dn(c)})}),s.querySelectorAll("[data-command-pin]").forEach(v=>{v.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let p=v.dataset.commandPin;p&&an(p)})})}function dn(t=null){let e=window.__vsCommandPalette||{commands:[],activeIndex:0},s=t===null?e.activeIndex:t,n=e.commands[s];n&&(_o(n.id),bt(),Promise.resolve(n.run()).catch(()=>{}))}function Ho(){return`
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
  `}function Tt(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function Ge(){try{let t=localStorage.getItem(Ys);if(!t)return Tt();let e=JSON.parse(t);return{...Tt(),...e&&typeof e=="object"?e:{},pages:Array.isArray(e==null?void 0:e.pages)?e.pages:Tt().pages}}catch{return Tt()}}function cn(t){try{localStorage.setItem(Ys,JSON.stringify(t))}catch{}}function Mt(){let t=document.getElementById("onboarding-modal");t&&t.classList.add("hidden")}function Os(){let t=window.__vsOnboarding||{step:1,draft:Ge()},e=Math.max(1,Math.min(3,t.step||1)),s=t.draft||Ge(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),a=document.getElementById("onboarding-step-body"),i=document.getElementById("btn-onboarding-prev"),r=document.getElementById("btn-onboarding-next"),d=document.getElementById("btn-onboarding-generate");if(!n||!o||!a||!i||!r||!d)return;let v=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${e} of 3 \xB7 ${v[e-1]}`,n.innerHTML=v.map((c,p)=>{let l=p+1===e,h=p+1<e;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${l?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":h?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${p+1}. ${y(c)}</div>
      </div>
    `}).join(""),e===1)a.innerHTML=`
      <div class="space-y-4">
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
    `;else if(e===2)a.innerHTML=`
      <div class="space-y-4">
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
    `;else{let c=[{key:"home",label:"Home"},{key:"about",label:"About"},{key:"services",label:"Services"},{key:"portfolio",label:"Portfolio"},{key:"pricing",label:"Pricing"},{key:"blog",label:"Blog"},{key:"contact",label:"Contact"}];a.innerHTML=`
      <div class="space-y-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-2">Pages to Create</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${c.map(p=>`
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
    `}i.disabled=e===1,r.classList.toggle("hidden",e===3),d.classList.toggle("hidden",e!==3),Do()}function Do(){let t=window.__vsOnboarding||{draft:Ge()},e=()=>{var n,o,a,i,r,d,v,c,p,l,h;t.draft={...t.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||t.draft.business_name||"",business_type:((i=(a=document.getElementById("onboard-business-type"))==null?void 0:a.value)==null?void 0:i.trim())||t.draft.business_type||"",offer:((d=(r=document.getElementById("onboard-offer"))==null?void 0:r.value)==null?void 0:d.trim())||t.draft.offer||"",audience:((c=(v=document.getElementById("onboard-audience"))==null?void 0:v.value)==null?void 0:c.trim())||t.draft.audience||"",style:((p=document.getElementById("onboard-style"))==null?void 0:p.value)||t.draft.style||"modern-minimal",tone:((l=document.getElementById("onboard-tone"))==null?void 0:l.value)||t.draft.tone||"confident",content_mode:((h=document.getElementById("onboard-content-mode"))==null?void 0:h.value)||t.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(t.draft.pages=Array.from(s).filter(u=>u.checked).map(u=>u.dataset.onboardPage).filter(Boolean)),cn(t.draft),window.__vsOnboarding=t};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",e),n.addEventListener("change",e))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",e)})}function No(t){let e={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(t.pages&&t.pages.length?t.pages:["home","about","services","contact"]).map(a=>a.charAt(0).toUpperCase()+a.slice(1)).join(", "),o=t.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":t.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${t.business_name||"my business"}.`,t.business_type?`Business type: ${t.business_type}.`:"",t.offer?`Core offer: ${t.offer}.`:"",t.audience?`Target audience: ${t.audience}.`:"",`Style preference: ${e[t.style]||"Modern Minimal"}.`,`Copy tone: ${s[t.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function Fo(){let t=document.querySelector("[data-onboarding-overlay]");t&&t.addEventListener("click",()=>Mt());let e=document.getElementById("btn-close-onboarding");e&&e.addEventListener("click",()=>Mt());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let a=window.__vsOnboarding||{step:1,draft:Ge()};a.step=Math.max(1,(a.step||1)-1),window.__vsOnboarding=a,Os()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let a=window.__vsOnboarding||{step:1,draft:Ge()};a.step=Math.min(3,(a.step||1)+1),window.__vsOnboarding=a,Os()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let i=(window.__vsOnboarding||{step:3,draft:Ge()}).draft||Ge(),r=No(i);try{localStorage.setItem(no,"1")}catch{}cn(i),Mt(),ln(r,"create_site",!0)})}function qo(){let t=document.getElementById("btn-theme-toggle");t&&t.addEventListener("click",()=>{var _,N;let x=ys()==="forge";t.innerHTML=x?$.sun:$.moon,t.title=x?"Switch to light":"Switch to dark",window.__vsEditorPage&&((_=window.monaco)!=null&&_.editor)&&window.monaco.editor.setTheme(mt()),document.getElementById("vs-code-editor-overlay")&&((N=window.monaco)!=null&&N.editor)&&window.monaco.editor.setTheme(mt())});let e=document.getElementById("btn-command-palette");e&&e.addEventListener("click",()=>{Us()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>bt());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{yt(n.value,0)}),n.addEventListener("keydown",E=>{let x=window.__vsCommandPalette||{commands:[],activeIndex:0};if((E.metaKey||E.ctrlKey)&&E.key.toLowerCase()==="p"){E.preventDefault();let I=x.commands[x.activeIndex];I&&an(I.id);return}if(E.key==="ArrowDown"){E.preventDefault(),yt(n.value,x.activeIndex+1);return}if(E.key==="ArrowUp"){E.preventDefault(),yt(n.value,x.activeIndex-1);return}if(E.key==="Enter"){E.preventDefault(),dn();return}E.key==="Escape"&&(E.preventDefault(),bt())})),Fo();let o=document.getElementById("btn-user-menu"),a=document.getElementById("user-dropdown");o&&a&&(o.addEventListener("click",E=>{E.stopPropagation(),a.classList.toggle("hidden")}),document.addEventListener("click",()=>a.classList.add("hidden"),{once:!0}));let i=document.getElementById("btn-edit-profile");i&&a&&i.addEventListener("click",()=>{a.classList.add("hidden")});let r=document.getElementById("btn-logout");r&&r.addEventListener("click",async()=>{await L.post("/auth/logout"),M.set("user",null),window.location.reload()});let d=document.getElementById("btn-undo-status");d&&d.addEventListener("click",()=>Ws());let v=document.getElementById("btn-redo-status");v&&v.addEventListener("click",()=>Ks());let c=document.getElementById("btn-preview-site");c&&c.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let p=document.getElementById("btn-snapshot");p&&p.addEventListener("click",async()=>{var _;p.disabled=!0,ht("Creating snapshot...");let{ok:E,data:x,error:I}=await L.post("/snapshots",{type:"manual",label:"Manual snapshot"});p.disabled=!1,ht(E?`\u2713 Snapshot saved (${((_=x==null?void 0:x.snapshot)==null?void 0:_.file_count)||0} files)`:"\u2717 "+((I==null?void 0:I.message)||"Snapshot failed"),E?"success":"error",4e3)});let l=document.getElementById("btn-publish");l&&(Qe(),l.addEventListener("click",async()=>{var ee,ve;let E=Nt();if(E.publishing)return;if(E.hasChanges===!1){q("No unpublished changes to publish.","warning");return}let x=E.counts||{added:0,modified:0,deleted:0},I=Number(x.added||0)+Number(x.modified||0)+Number(x.deleted||0);if(!await fe({title:"Publish Website",description:I>0?`A snapshot will be created automatically before publishing. ${I} unpublished change(s) will go live.`:"A snapshot will be created automatically before publishing.",confirmLabel:"Publish"}))return;E.publishing=!0,Qe(),ht("Publishing...");let{ok:N,data:j,error:O}=await L.post("/publish");if(E.publishing=!1,N){let R=((ee=j==null?void 0:j.published)==null?void 0:ee.length)||0,oe=((ve=j==null?void 0:j.removed)==null?void 0:ve.length)||0,F=oe>0?`Published ${R} file(s), removed ${oe} stale file(s).`:`Published ${R} file(s).`;q(F,"success"),ht(`\u2713 ${R} published, ${oe} removed`,"success",5e3),M.set("previewDirty",!1),Fe({silent:!0}),window.open("/","_blank")}else q((O==null?void 0:O.message)||"Publish failed.","error"),ht("\u2717 "+((O==null?void 0:O.message)||"Publish failed"),"error",5e3),Fe({silent:!0})}));let h=document.getElementById("resize-handle"),u=document.getElementById("conversation-panel");if(h&&u){let E,x;h.addEventListener("mousedown",I=>{I.preventDefault(),E=I.clientX,x=u.offsetWidth;let _=j=>{let O=j.clientX-E,ee=Math.min(580,Math.max(340,x+O));u.style.width=`${ee}px`,M.set("sidebarWidth",ee)},N=()=>{document.removeEventListener("mousemove",_),document.removeEventListener("mouseup",N)};document.addEventListener("mousemove",_),document.addEventListener("mouseup",N)})}let m=document.getElementById("prompt-input");m&&(m.addEventListener("input",()=>{m.style.height="auto",m.style.height=Math.min(200,m.scrollHeight)+"px"}),m.addEventListener("keydown",E=>{E.key==="Enter"&&(E.metaKey||E.ctrlKey)&&(E.preventDefault(),Ht())}));let f=document.getElementById("btn-send");f&&f.addEventListener("click",Ht),et();let k=document.getElementById("btn-new-chat");k&&k.addEventListener("click",To);let g=document.getElementById("btn-scope-selector");g&&g.addEventListener("click",()=>{Bo()});let b=document.getElementById("btn-toggle-history");b&&b.addEventListener("click",Lo);let S=document.getElementById("btn-visual-editor");S&&S.addEventListener("click",()=>es());let A=document.getElementById("btn-edit-code");A&&A.addEventListener("click",()=>{let E=window.__vsCurrentPreviewPath||"index.php";os(E)});let V=document.getElementById("btn-refresh-preview");V&&V.addEventListener("click",()=>st());let z=document.querySelectorAll("[data-device]"),H=document.getElementById("preview-frame-container");if(z.length&&H){let E={desktop:"100%",tablet:"768px",mobile:"375px"};z.forEach(x=>{x.addEventListener("click",()=>{let I=x.dataset.device,_=E[I]||"100%";I==="desktop"?(H.style.maxWidth="",H.style.width="",H.style.alignSelf=""):(H.style.maxWidth=_,H.style.width="100%",H.style.alignSelf="center"),z.forEach(N=>{N.classList.remove("vs-device-btn-active"),N.dataset.device===I&&N.classList.add("vs-device-btn-active")})})})}let G=document.getElementById("btn-external-preview");G&&G.addEventListener("click",()=>{let E=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(E),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",E=>{var I,_;let x=(_=(I=E.target)==null?void 0:I.closest)==null?void 0:_.call(I,"[data-code-toggle]");x&&(E.preventDefault(),Vo(x))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",E=>{if((E.metaKey||E.ctrlKey)&&E.key==="k"){E.preventDefault(),gt()?bt():Us();return}if(E.key==="Escape"&&gt()){E.preventDefault(),bt();return}if(E.key==="Escape"&&Bt()){E.preventDefault(),Mt();return}if((E.metaKey||E.ctrlKey)&&E.key==="z"&&!E.shiftKey){if(gt()||Bt())return;let x=document.activeElement;if(x&&(x.tagName==="INPUT"||x.tagName==="TEXTAREA"))return;E.preventDefault(),Ws()}if((E.metaKey||E.ctrlKey)&&E.key==="z"&&E.shiftKey){if(gt()||Bt())return;let x=document.activeElement;if(x&&(x.tagName==="INPUT"||x.tagName==="TEXTAREA"))return;E.preventDefault(),Ks()}if(E.key==="v"&&!E.metaKey&&!E.ctrlKey&&!E.altKey&&!E.shiftKey){if(gt()||Bt())return;let x=document.activeElement;if(x&&(x.tagName==="INPUT"||x.tagName==="TEXTAREA"||x.isContentEditable))return;let I=M.get("route");if(!ds.includes(I))return;E.preventDefault(),es()}if(E.key==="Escape"&&dt()){E.preventDefault(),ct();return}}));let W=M.get("route");if(ds.includes(W))try{let E=M.get("activeConversationId"),x=localStorage.getItem("vs-active-conversation"),I=E||x,_=document.getElementById("chat-messages"),N=_==null?void 0:_.querySelector(".vs-empty-state");I&&!M.get("aiStreaming")?(E||M.set("activeConversationId",I),N&&Pt(I)):I||_&&_.children.length===0&&(_.innerHTML=tt(),et())}catch{}xt(),Uo()}function zo(){let t=document.getElementById("preview-frame-container");if(!t||t.querySelector(".vs-generating-overlay"))return;let e=document.createElement("div");e.className="vs-generating-overlay",e.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">Working on your site</div>
    <div class="vs-gen-subtitle">Content is being generated.<br>This may take a few minutes.</div>
    <div class="vs-gen-note">Please keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-progress"><div class="vs-gen-progress-bar"></div></div>
  `,t.appendChild(e)}function Vs(){let t=document.querySelector(".vs-generating-overlay");t&&(t.classList.add("removing"),t.addEventListener("animationend",()=>t.remove(),{once:!0}),setTimeout(()=>t==null?void 0:t.remove(),600))}function st(t){let e=document.getElementById("preview-iframe");if(e){let s=t||window.__vsCurrentPreviewPath||"index.php";e.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=st;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",t=>{typeof t.data=="string"&&t.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=t.data.slice(15),jt())}));function cs(t){let e=document.getElementById("preview-iframe");if(e&&e.contentWindow)try{e.contentWindow.postMessage(t,"*")}catch{st()}}window.sendPreviewMessage=cs;async function Ws(){(await L.post("/revisions/undo")).ok&&(setTimeout(()=>st(),300),await xt(),Fe({silent:!0}))}async function Ks(){(await L.post("/revisions/redo")).ok&&(setTimeout(()=>st(),300),await xt(),Fe({silent:!0}))}async function xt(){let{ok:t,data:e}=await L.get("/revisions/state");if(!t||!e)return;let s=!!e.can_undo,n=!!e.can_redo,o=e.undo_description?`Undo: ${e.undo_description}`:"Nothing to undo",a=e.redo_description?`Redo: ${e.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(i=>{let r=document.getElementById(i);r&&(r.disabled=!s,r.title=o,r.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(i=>{let r=document.getElementById(i);r&&(r.disabled=!n,r.title=a,r.classList.toggle("opacity-40",!n))})}function Nt(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function ht(t,e="neutral",s=0){let n=document.getElementById("status-text");n&&(n.textContent=t,n.className=e==="success"?"text-xs text-vs-success":e==="error"?"text-xs text-vs-error":"text-xs text-vs-text-ghost",window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s>0&&(window.__vsStatusResetTimer=setTimeout(()=>{let o=document.getElementById("status-text");o&&(o.textContent="Ready",o.className="text-xs text-vs-text-ghost",window.__vsStatusResetTimer=null)},s)))}function Qe(){let t=Nt(),e=document.getElementById("btn-publish"),s=document.getElementById("publish-state-label");if(!e)return;let n=t.counts||{added:0,modified:0,deleted:0},o=Number(n.added||0)+Number(n.modified||0)+Number(n.deleted||0);if(t.publishing){e.disabled=!0,e.innerHTML=`${$.publish} Publishing...`,s&&(s.textContent="Publishing changes...",s.className="text-2xs text-vs-text-tertiary");return}if(t.checking&&t.hasChanges===null){e.disabled=!0,e.innerHTML=`${$.publish} Checking...`,s&&(s.textContent="Checking publish status...",s.className="text-2xs text-vs-text-ghost");return}if(t.error){e.disabled=!1,e.innerHTML=`${$.publish} Publish`,s&&(s.textContent="Status unavailable",s.className="text-2xs text-vs-warning");return}if(t.hasChanges){if(e.disabled=!1,e.innerHTML=`${$.publish} Publish`,e.classList.remove("vs-btn-ghost"),e.classList.add("vs-btn-primary"),s){let a=o===1?"":"s";s.textContent=`${o} unpublished change${a}`,s.className="text-2xs text-vs-warning"}return}e.disabled=!0,e.innerHTML=`${$.publish} Up to date`,e.classList.remove("vs-btn-primary"),e.classList.add("vs-btn-ghost"),s&&(s.textContent="No unpublished changes",s.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=Qe;async function Fe({silent:t=!1}={}){let e=Nt();if(e.publishing){Qe();return}e.checking=!0,t||Qe();let{ok:s,data:n,error:o}=await L.get("/preview/diff");e.checking=!1,s&&n?(e.hasChanges=!!n.has_changes,e.counts=n.counts||{added:0,modified:0,deleted:0},e.error=null):e.error=(o==null?void 0:o.message)||"Could not check publish status.",Qe()}window.refreshPublishState=Fe;function Uo(){let t=Nt();t.intervalId&&(clearInterval(t.intervalId),t.intervalId=null),Fe({silent:!0}),t.intervalId=window.setInterval(()=>{document.hidden||Fe({silent:!0})},15e3)}async function Ht(){let t=document.getElementById("prompt-input");if(!t)return;let e=t.value.trim();if(!e||M.get("aiStreaming"))return;t.value="",t.style.height="auto";let s=document.getElementById("chat-messages");if(!s)return;let n=`
    <div class="vs-msg-user mb-6 mt-4">
      <div class="vs-msg-user-bubble">${y(e)}</div>
    </div>
  `,o=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,a=`
    <div class="vs-msg-ai mb-6" data-stream-id="${o}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${$.box}</span>
        <span class="text-xs font-medium text-vs-text-tertiary">VoxelSite</span>
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
  `,i=s.querySelector(".vs-empty-state");i&&i.remove(),s.insertAdjacentHTML("beforeend",n+a),s.scrollTop=s.scrollHeight;let r=s.querySelector(`.vs-msg-ai[data-stream-id="${o}"]`);if(!r)return;let d=r.querySelector('[data-role="typing"]'),v=r.querySelector('[data-role="status"]'),c=r.querySelector('[data-role="status-text"]'),p=r.querySelector('[data-role="stream-content"]'),l=r.querySelector('[data-role="files-section"]'),h=r.querySelector('[data-role="files"]'),u=r.querySelector('[data-role="files-label"]'),m=r.querySelector('[data-role="files-count"]'),f=r.querySelector('[data-role="files-progress"]'),k=r.querySelector('[data-role="error"]'),g=r.querySelector('[data-role="status-timer"]'),b=F=>{F&&F.removeAttribute("hidden")},S=F=>{F&&F.setAttribute("hidden","")},A=Date.now(),V=0,z=Date.now(),H=!1,G=!1,W=setInterval(()=>{let F=Math.floor((Date.now()-A)/1e3),X=Math.floor(F/60),le=F%60,ue=X>0?`${X}m ${le}s`:`${le}s`;V>0&&(ue+=` \xB7 ${V.toLocaleString()} tokens`),g&&(g.textContent=`\xB7 ${ue}`),Date.now()-z>3e5&&!H&&(H=!0,c&&(c.textContent="No data for 5 min \u2014 the model may have stalled",c.style.color="var(--vs-warning, #d97706)"))},1e3);M.set("aiStreaming",!0);let E=document.getElementById("btn-send");E&&(E.disabled=!0,E.classList.add("opacity-50")),zo();let x="",I=[],_=!1,N=null,j=!0,O=new AbortController,ee=r.querySelector('[data-role="stop-btn"]');ee&&ee.addEventListener("click",()=>O.abort());let ve=t.dataset.actionType||"free_prompt";delete t.dataset.actionType;let R=t.dataset.actionData,oe=null;if(R){try{oe=JSON.parse(R)}catch{}delete t.dataset.actionData}await Et("/ai/prompt",{user_prompt:e,action_type:ve,page_scope:M.get("activePageScope"),conversation_id:M.get("activeConversationId"),action_data:oe},{signal:O.signal,onConversation(F){if(F){M.set("activeConversationId",F);try{localStorage.setItem("vs-active-conversation",F)}catch{}}},onStatus(F){!G&&l&&!l.hasAttribute("hidden")&&u&&(u.textContent=F),v&&c&&(c.textContent=F,b(v))},onToken(F){x+=F,V+=Math.ceil(F.length/4),z=Date.now(),H=!1,c&&(c.style.color="");let X=x.trimStart();if(!_&&X.length>0&&(_=X.startsWith("{")||X.startsWith("```json")||X.startsWith("```")||X.startsWith("<|")||X.startsWith("<message>")||X.startsWith("<file ")||F.includes("<|")||X.includes("<|channel|>")||X.includes('"operations"')||X.includes('"assistant_message"'),_&&p&&(p.innerHTML="")),S(d),p&&_){let le=x.match(/<message>([\s\S]*?)(<\/message>|$)/);if(le){let ue=le[1].trim();ue&&(b(p),p.innerHTML=It(ue))}l&&x.includes("<file ")&&b(l)}else p&&(b(p),p.innerHTML=It(x),v&&S(v));s.scrollTop=s.scrollHeight},onFile(F){if(I.push(F),l&&b(l),m){let X=I.length;m.textContent=`${X} file${X!==1?"s":""}`}if(h){let X=F.action==="delete",le=(I.length-1)*60,ue=X?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';h.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${X?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${le}ms">
            <span class="vs-file-badge-icon">${ue}</span>
            <span>${y(F.path)}</span>
          </div>
        `)}N||(j=!0),F.path.endsWith(".css")||(j=!1),clearTimeout(N),N=setTimeout(()=>{cs(j?"voxelsite:reload-css":"voxelsite:reload"),N=null,j=!0},600),s.scrollTop=s.scrollHeight},onDone(F){G=!0,clearTimeout(N),N=null,clearInterval(W),S(d),S(v);let X=F.files_modified||[],le=I.length>0||X.length>0;if(l&&le?(S(f),l.classList.add("vs-files-done"),u&&(u.textContent=F.partial?"Files updated (partial)":"Files updated")):l&&!l.hasAttribute("hidden")&&(S(f),S(l)),p)if(F.message)b(p),p.innerHTML=It(F.message);else if(_)S(p);else{let ae=p.textContent||"";(ae.includes("<|channel|>")||ae.includes('"operations"')||ae.includes('"assistant_message"')||ae.includes("<file ")||ae.includes("<message>"))&&(S(p),p.innerHTML="")}if(F.truncated&&p){let ae=document.createElement("button");ae.className="vs-btn vs-btn-primary vs-btn-sm mt-3",ae.innerHTML="\u21BB Continue generating...",ae.addEventListener("click",()=>{ae.remove();let Pe=document.getElementById("prompt-input");Pe&&(Pe.value="Continue from where you left off. Complete any unfinished files.",Pe.dataset.actionType=ve,Ht())}),p.appendChild(ae)}if(F.conversation_id){M.set("activeConversationId",F.conversation_id);try{localStorage.setItem("vs-active-conversation",F.conversation_id)}catch{}}let ue=[...I,...X];if(ue.length>0){let ae=ue.map(we=>we.path||we),Pe=ae.some(we=>we==="index.php"),nt=ae.filter(we=>we.endsWith(".php")&&!we.includes("/")&&we!=="index.php"),wt=Pe&&nt.length>0,xe;wt?xe="index.php":nt.length>0?xe=nt[0]:xe=Pe?"index.php":null,st(xe),M.set("previewDirty",!0),Fe({silent:!0})}Vs(),en(),xt(),s.scrollTop=s.scrollHeight},onWarning(F){h&&(h.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${y(F)}</div>
        `)},onError(F){clearTimeout(N),N=null,clearInterval(W),S(d),S(v),k&&(k.textContent=F.message||"Something went wrong.",b(k)),Vs(),f&&S(f),l&&I.length>0&&(l.classList.add("vs-files-done"),u&&(u.textContent="Files updated (partial)"))}}),M.set("aiStreaming",!1),E&&(E.disabled=!1,E.classList.remove("opacity-50"))}function Gs(){var c;Js.innerHTML=`
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
            <h1 class="vs-login-title">Enter the Studio</h1>
            <p class="vs-login-subtitle">Resume construction.</p>
          </div>

          <div id="login-error" class="hidden mb-5 px-4 py-3 bg-vs-error-dim text-vs-error text-sm rounded-xl border border-vs-error/10"></div>

          <form id="login-form" class="space-y-5">
            <div>
              <label class="vs-input-label">Email</label>
              <input id="login-email" type="email" required
                class="vs-input"
                placeholder="you@example.com">
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                <button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password">
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${$.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              Open Studio
            </button>
          </form>

          <div class="vs-login-footer">
            <p>Your files. Your server. Your website.</p>
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
    </div>
  `;let t=document.getElementById("login-password"),e=document.getElementById("btn-toggle-pw");e&&t&&e.addEventListener("click",()=>{let p=t.type==="password";t.type=p?"text":"password",e.innerHTML=p?$.eyeOff:$.eye,e.title=p?"Hide password":"Show password"});function s(){document.querySelectorAll("[data-toggle-target]").forEach(p=>{p.addEventListener("click",()=>{let l=document.getElementById(p.dataset.toggleTarget);if(!l)return;let h=l.type==="password";l.type=h?"text":"password",p.innerHTML=h?$.eyeOff:$.eye,p.title=h?"Hide password":"Show password"})})}let n=document.getElementById("login-state"),o=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),i=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var l,h,u;n.classList.add("hidden"),o.classList.remove("hidden");let p=document.getElementById("forgot-content");try{let f=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((l=f==null?void 0:f.data)==null?void 0:l.mode)||"file")==="email"?(p.innerHTML=`
            <div class="vs-login-header">
              <h1 class="vs-login-title">Reset Password</h1>
              <p class="vs-login-subtitle">Enter your email to receive a recovery link.</p>
            </div>
            <div id="forgot-message" class="hidden mb-5 px-4 py-3 text-sm rounded-xl border"></div>
            <form id="forgot-form" class="space-y-5">
              <div>
                <label class="vs-input-label">Email</label>
                <input id="forgot-email" type="email" required class="vs-input" placeholder="you@example.com">
              </div>
              <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">Send Recovery Link</button>
            </form>
          `,(h=document.getElementById("forgot-form"))==null||h.addEventListener("submit",async g=>{var z,H,G;g.preventDefault();let b=document.getElementById("forgot-message"),S=document.getElementById("forgot-email"),A=g.target.querySelector('button[type="submit"]'),V=(z=S==null?void 0:S.value)==null?void 0:z.trim();if(V){A&&(A.disabled=!0,A.textContent="Sending...");try{let E=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:V})})).json();b&&(E.ok?(b.textContent=((H=E.data)==null?void 0:H.message)||"Recovery link sent. Check your inbox.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",S&&(S.value="")):(b.textContent=((G=E.error)==null?void 0:G.message)||"Failed to send recovery email.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),b.classList.remove("hidden"))}catch{b&&(b.textContent="Network error. Please try again.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden"))}finally{A&&(A.disabled=!1,A.textContent="Send Recovery Link")}}})):(p.innerHTML=`
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
            <form id="forgot-form" class="space-y-5">
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
          `,s(),(u=document.getElementById("forgot-form"))==null||u.addEventListener("submit",async g=>{var z,H,G;g.preventDefault();let b=document.getElementById("forgot-message"),S=(z=document.getElementById("forgot-email"))==null?void 0:z.value,A=(H=document.getElementById("forgot-new-password"))==null?void 0:H.value;if(!S||!A)return;let V=await L.post("/auth/reset-password",{email:S,new_password:A});V.ok?(b&&(b.textContent="Password reset. You can now sign in with your new password.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",b.classList.remove("hidden")),setTimeout(()=>{o.classList.add("hidden"),n.classList.remove("hidden")},2500)):b&&(b.textContent=((G=V.error)==null?void 0:G.message)||"Reset failed. Make sure the .reset file exists in _data/.",b.className="mb-5 px-4 py-3 text-sm rounded-xl border",b.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",b.classList.remove("hidden"))}))}catch{p.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),i&&i.addEventListener("click",()=>{o.classList.add("hidden"),n.classList.remove("hidden")});let d=new URLSearchParams(window.location.search).get("reset");if(d&&d.length===64&&o&&n){let p=window.location.pathname+window.location.hash;window.history.replaceState(null,"",p),n.classList.add("hidden"),o.classList.remove("hidden");let l=document.getElementById("forgot-content");l&&(l.innerHTML=`
        <div class="vs-login-header">
          <h1 class="vs-login-title">Set New Password</h1>
          <p class="vs-login-subtitle">Enter your new password below.</p>
        </div>
        <div id="forgot-message" class="hidden mb-5 px-4 py-3 text-sm rounded-xl border"></div>
        <form id="token-reset-form" class="space-y-5">
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
      `,s(),(c=document.getElementById("token-reset-form"))==null||c.addEventListener("submit",async h=>{var g,b,S,A;h.preventDefault();let u=document.getElementById("forgot-message"),m=(g=document.getElementById("token-new-password"))==null?void 0:g.value,f=(b=document.getElementById("token-confirm-password"))==null?void 0:b.value,k=h.target.querySelector('button[type="submit"]');if(!m||m.length<8){u&&(u.textContent="Password must be at least 8 characters.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"));return}if(m!==f){u&&(u.textContent="Passwords do not match.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"));return}k&&(k.disabled=!0,k.textContent="Resetting...");try{let z=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:d,new_password:m})})).json();u&&(z.ok?(u.textContent=((S=z.data)==null?void 0:S.message)||"Password reset. You can now sign in.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",u.classList.remove("hidden"),h.target.querySelectorAll("input").forEach(H=>H.disabled=!0),k&&(k.style.display="none"),setTimeout(()=>{o.classList.add("hidden"),n.classList.remove("hidden")},2500)):(u.textContent=((A=z.error)==null?void 0:A.message)||"Reset failed. The link may have expired.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden")))}catch{u&&(u.textContent="Network error. Please try again.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"))}finally{k&&(k.disabled=!1,k.textContent="Reset Password")}}))}let v=document.getElementById("login-form");v&&v.addEventListener("submit",async p=>{var f,k,g,b;p.preventDefault();let l=(f=document.getElementById("login-email"))==null?void 0:f.value,h=(k=document.getElementById("login-password"))==null?void 0:k.value,u=document.getElementById("login-error");if(!l||!h)return;let m=await L.post("/auth/login",{email:l,password:h});m.ok&&((g=m.data)!=null&&g.token)?(M.batch(()=>{M.set("user",m.data.user),M.set("sessionToken",m.data.token)}),Qs()):u&&(u.textContent=((b=m.error)==null?void 0:b.message)||"Invalid email or password.",u.classList.remove("hidden"))}),xt()}function Bt(){let t=document.getElementById("onboarding-modal");return!!t&&!t.classList.contains("hidden")}function It(t){if(!t)return"";if(!window.marked)return y(t);let e=window.marked.parse(t);return Oo(e)}function Oo(t){if(!t||typeof t!="string")return"";if(!t.includes("<pre"))return t;let e=document.createElement("template");return e.innerHTML=t,e.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),i=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),r=i?i.split(`
`):[];if(r.length<=oo)return;let d=r.slice(0,ao).join(`
`)+`
...`,v=document.createElement("div");v.className="vs-code-collapse",v.setAttribute("data-code-collapse","1");let c=document.createElement("pre");c.className="vs-code-collapse-preview",c.setAttribute("data-code-preview","1");let p=document.createElement("code");o!=null&&o.className&&(p.className=o.className),p.textContent=d,c.appendChild(p),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let l=document.createElement("button");l.type="button",l.className="vs-code-collapse-toggle",l.setAttribute("data-code-toggle","1"),l.setAttribute("data-lines",String(r.length)),l.setAttribute("aria-expanded","false"),l.textContent=`More (${r.length} lines)`;let h=n.parentNode;h&&(h.replaceChild(v,n),v.appendChild(c),v.appendChild(n),v.appendChild(l))}),e.innerHTML}function Vo(t){let e=t.closest("[data-code-collapse]");if(!e)return;let s=e.querySelector("[data-code-preview]"),n=e.querySelector("[data-code-full]"),o=t.dataset.lines||"",a=e.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",a),n&&n.classList.toggle("hidden",!a),t.setAttribute("aria-expanded",a?"true":"false"),t.textContent=a?"Less":`More${o?` (${o} lines)`:""}`}Qs();})();
