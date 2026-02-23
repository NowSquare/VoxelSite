(()=>{var xs=t=>{throw TypeError(t)};var Yt=(t,e,s)=>e.has(t)||xs("Cannot "+s);var K=(t,e,s)=>(Yt(t,e,"read from private field"),s?s.call(t):e.get(t)),me=(t,e,s)=>e.has(t)?xs("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,s),ke=(t,e,s,n)=>(Yt(t,e,"write to private field"),n?n.call(t,s):e.set(t,s),s),je=(t,e,s)=>(Yt(t,e,"access private method"),s);var Se,Te,Ue,Be,vt,Xt,Zt=class{constructor(e={}){me(this,vt);me(this,Se,new Map);me(this,Te,new Map);me(this,Ue,!1);me(this,Be,new Map);for(let[s,n]of Object.entries(e))K(this,Se).set(s,n)}get(e,s=void 0){return K(this,Se).has(e)?K(this,Se).get(e):s}set(e,s){let n=K(this,Se).get(e);n!==s&&(K(this,Se).set(e,s),K(this,Ue)?K(this,Be).has(e)?K(this,Be).get(e).newValue=s:K(this,Be).set(e,{newValue:s,oldValue:n}):je(this,vt,Xt).call(this,e,s,n))}update(e){this.batch(()=>{for(let[s,n]of Object.entries(e))this.set(s,n)})}on(e,s){return K(this,Te).has(e)||K(this,Te).set(e,new Set),K(this,Te).get(e).add(s),()=>{var n;(n=K(this,Te).get(e))==null||n.delete(s)}}batch(e){if(K(this,Ue)){e();return}ke(this,Ue,!0),K(this,Be).clear();try{e()}finally{ke(this,Ue,!1);for(let[s,{newValue:n,oldValue:o}]of K(this,Be))je(this,vt,Xt).call(this,s,n,o);K(this,Be).clear()}}toJSON(){return Object.fromEntries(K(this,Se))}};Se=new WeakMap,Te=new WeakMap,Ue=new WeakMap,Be=new WeakMap,vt=new WeakSet,Xt=function(e,s,n){let o=K(this,Te).get(e);if(o)for(let a of o)try{a(s,n)}catch(l){console.error(`[state] Error in "${e}" listener:`,l)}let i=K(this,Te).get("*");if(i)for(let a of i)try{a(e,s,n)}catch(l){console.error("[state] Error in wildcard listener:",l)}};var I=new Zt({user:null,sessionToken:null,route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});I.on("theme",t=>{localStorage.setItem("vs-theme",t),document.documentElement.setAttribute("data-theme",t)});I.on("sidebarWidth",t=>{localStorage.setItem("vs-sidebar-width",String(t))});var ut,Qe,et,tt,mt,st,Re,Qt,es,Jt=class{constructor(){me(this,Re);me(this,ut,[]);me(this,Qe,null);me(this,et,!1);me(this,tt,null);me(this,mt,null);me(this,st,!1)}on(e,s){let n=[],o=e.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return K(this,ut).push({pattern:e,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(e){return ke(this,Qe,e),this}beforeEach(e){return ke(this,tt,e),this}start(){K(this,et)||(ke(this,et,!0),window.addEventListener("hashchange",()=>je(this,Re,Qt).call(this)),je(this,Re,Qt).call(this))}navigate(e){window.location.hash=`/${e}`}get current(){return je(this,Re,es).call(this)}};ut=new WeakMap,Qe=new WeakMap,et=new WeakMap,tt=new WeakMap,mt=new WeakMap,st=new WeakMap,Re=new WeakSet,Qt=async function(){if(K(this,st))return;let e=je(this,Re,es).call(this),s=K(this,mt);if(!(e===s&&K(this,et))){if(K(this,tt)&&s!==null){ke(this,st,!0);try{if(await K(this,tt).call(this,e,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{ke(this,st,!1)}}ke(this,mt,e);for(let n of K(this,ut)){let o=e.match(n.regex);if(o){let i={};n.paramNames.forEach((a,l)=>{i[a]=decodeURIComponent(o[l+1])}),I.batch(()=>{I.set("route",n.pattern),I.set("routeParams",i)}),n.handler(i);return}}K(this,Qe)?(I.set("route","404"),K(this,Qe).call(this,e)):this.navigate("chat")}},es=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var Ve=new Jt;var Es="/_studio/api/router.php";async function Mt(t,e,s=null,n={}){let o={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(t)){let a=Cs();a&&(o["X-VS-Token"]=a)}s!==null&&(o["Content-Type"]="application/json");let i={method:t,headers:o,credentials:"same-origin",...n};s!==null&&(i.body=JSON.stringify(s));try{let[a,l]=e.split("?"),d=`${Es}?_path=${encodeURIComponent(a)}${l?"&"+l:""}`,p=await fetch(d,i),c=await p.json();return p.status===401?(I.get("user")&&I.set("user",null),c!=null&&c.error?{ok:!1,error:c.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!c.ok&&c.error?(c.error.code==="demo_mode"&&window.showToast&&window.showToast(c.error.message||"Demo mode \u2014 this action is disabled.","warning"),{ok:!1,error:c.error}):{ok:!0,data:c.data||c}}catch{return{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var L={get:(t,e)=>Mt("GET",t,null,e),post:(t,e,s)=>Mt("POST",t,e,s),put:(t,e,s)=>Mt("PUT",t,e,s),delete:(t,e,s)=>Mt("DELETE",t,e,s)};async function nt(t,e,s={}){var x,m;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onFile:a=()=>{},onDone:l=()=>{},onWarning:d=()=>{},onError:p=()=>{},signal:c=null}=s,v=Cs(),r={"Content-Type":"application/json",Accept:"text/event-stream"};v&&(r["X-VS-Token"]=v);let h=!1,g=0,u=0,f=e.conversation_id||null;try{let ee=function(b){if(!b.trim())return;let S="";for(let P of b.split(`
`))P.startsWith(":")||P.startsWith("data: ")&&(S+=P.slice(6));if(!S)return;let M;try{M=JSON.parse(S)}catch{return}switch(M.type||"message"){case"token":u++,n(M.content||"");break;case"status":o(M.message||"");break;case"conversation":f=M.conversation_id||f,i(M.conversation_id||"");break;case"file_complete":g++,a(M);break;case"done":h=!0,l(M);break;case"warning":d(M.message||"");break;case"error":p(M);break}},C={method:"POST",headers:r,credentials:"same-origin",body:JSON.stringify(e)};c&&(C.signal=c);let[w,A]=t.split("?"),j=`${Es}?_path=${encodeURIComponent(w)}${A?"&"+A:""}`,W=await fetch(j,C);if(!W.ok){let b=await W.json().catch(()=>null);p({code:((x=b==null?void 0:b.error)==null?void 0:x.code)||"http_error",message:((m=b==null?void 0:b.error)==null?void 0:m.message)||`Server error (${W.status})`});return}let q=W.body.getReader(),V=new TextDecoder,U="";for(;;){let{done:b,value:S}=await q.read();if(b)break;U+=V.decode(S,{stream:!0});let M=U.split(`

`);U=M.pop();for(let _ of M)ee(_)}if(U.trim()&&ee(U),!h&&g>0){let b=f;b?await ks(b,{onDone:l,onError:p,onFile:a,onStatus:o}):l({files_modified:[],message:"",soft_close:!0})}}catch(C){if(C.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(g>0||u>0){let w=f;w?(o("Server is still generating \u2014 waiting for completion..."),await ks(w,{onDone:l,onError:p,onFile:a,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else p({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function ks(t,{onDone:e,onError:s,onFile:n,onStatus:o}){var l;let a=0;for(let d=0;d<120;d++){await new Promise(p=>setTimeout(p,3e3));try{let{ok:p,data:c}=await L.get(`/ai/conversations/${t}`);if(!p||!((l=c==null?void 0:c.conversation)!=null&&l.prompts))continue;let v=c.conversation.prompts,r=v[v.length-1];if(!r)continue;let h=r.files_modified?JSON.parse(r.files_modified):[];if(h.length>a){for(let g=a;g<h.length;g++)n({path:h[g],action:"write"});a=h.length}if(r.status==="streaming"){let g=Math.round((Date.now()-new Date(r.created_at).getTime())/1e3);o(`Server is still generating... (${g}s)`);continue}r.status==="success"?e({message:r.ai_message||"",files_modified:h,revision_id:r.revision_id||null,polled:!0}):r.status==="partial"?e({message:r.ai_message||"",files_modified:h,partial:!0,polled:!0}):s({code:"generation_failed",message:r.error_message||"Generation failed on the server."});return}catch{}}e({files_modified:[],message:"",partial:!0,soft_close:!0})}function Cs(){return I.get("sessionToken")}var yn="data-theme",ts="dark";function $s(){let t=I.get("theme")||localStorage.getItem("vs-theme")||ts;return Ls(t),t}function Ls(t){let e=t||ts;return document.documentElement.setAttribute(yn,e),localStorage.setItem("vs-theme",e),I.set("theme",e),e}function ss(){let t=I.get("theme")||ts;return Ls(t==="dark"?"light":"dark")}var Ee=!1,It=null,We=[],ns=!1,Ss=!1,se={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function ds(){Ee=!Ee,As(),re({type:"vx-editor:toggle",active:Ee}),Ee||(He(),Pe(),ot(),It=null)}function ht(){return Ee}function ft(){Ee&&(Ee=!1,As(),re({type:"vx-editor:toggle",active:!1}),He(),Pe(),ot(),It=null)}function Ms(){Ss||(Ss=!0,window.addEventListener("message",wn))}function wn(t){if(!(!t.data||typeof t.data!="object")&&!(!t.data.type||!t.data.type.startsWith("vx-editor:"))&&t.origin===window.location.origin)switch(t.data.type){case"vx-editor:select":It=t.data,xn(t.data);break;case"vx-editor:text-changed":rs(t.data);break;case"vx-editor:image-changed":Yn(t.data);break;case"vx-editor:element-deleted":ls(t.data);break;case"vx-editor:deselect":He(),Pe(),It=null;break;case"vx-editor:save-request":bt();break}}function xn(t){let e=document.getElementById("vx-context-toolbar");e||(e=document.createElement("div"),e.id="vx-context-toolbar",e.className="vx-context-toolbar",document.body.appendChild(e));let{tagName:s,rect:n,hasText:o,hasImage:i}=t,a=document.getElementById("preview-iframe");if(!a)return;let l=a.getBoundingClientRect();e.style.left=`${l.left+n.left+n.width/2}px`,e.style.top=`${l.top+n.top-8}px`,e.style.transform="translate(-50%, -100%)";let d="";o&&(d+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      <span>Edit</span></button>`),i&&(d+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),d+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(d+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),d+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,d+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let p=Pt(s,t.classList);e.innerHTML=`<div class="vx-tb-label">${p}</div><div class="vx-tb-actions">${d}</div>`,e.classList.add("vx-tb-visible"),e.querySelectorAll("[data-action]").forEach(c=>{c.addEventListener("click",v=>{v.stopPropagation(),kn(c.dataset.action,t)})})}function He(){let t=document.getElementById("vx-context-toolbar");t&&t.classList.remove("vx-tb-visible")}function Pt(t,e){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[t]||t.toLowerCase()}function kn(t,e){switch(t){case"edit-text":re({type:"vx-editor:start-edit",mode:"text"}),He();break;case"swap-image":Wn(e);break;case"edit-style":Cn(e);break;case"edit-link":Kn(e);break;case"delete":En(e);break;case"ask-ai":Vn(e);break}}function En(t){He();let e=Pt(t.tagName,t.classList),s=(t.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${e}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${gt(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>n.remove(),200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),n.addEventListener("click",a=>{a.target===n&&o()}),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{re({type:"vx-editor:delete-element"}),o()})}var ie=new Set,Ge="",Ce=null,Ht="text",Me="padding",Ae="all",Ke="all",Ie="tl",Ye="",De=!1;function Pe({revertUnsaved:t=!0}={}){t&&De&&Ge&&(re({type:"vx-editor:update-classes",classes:Ge.split(" ").filter(Boolean),silent:!0}),ie=new Set(Ge.split(" ").filter(Boolean)));let e=document.getElementById("vx-style-panel");e&&(typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),e.classList.remove("vx-sp-visible"),setTimeout(()=>e.remove(),200)),De=!1,Ce=null,Ht="text",Me="padding",Ae="all",Ke="all",Ie="tl",Ye=""}function Cn(t){He(),Pe();let e=(t.classList||[]).filter(o=>o.trim());ie=new Set(e),Ge=e.join(" "),De=!1,Ce=null,Ht=Xn(e),Me="padding",Ae="all",Ke="all",Ie="tl",Ye="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${Pt(t.tagName,e)}</span>
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
      ${is()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),_t(s),s.__vxOnResize=()=>_t(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=_s(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),Ce=null,ge(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>Pe()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),Pe())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{ie=new Set(Ge.split(" ").filter(Boolean)),De=!1,re({type:"vx-editor:update-classes",classes:[...ie],silent:!0}),ge(as())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>Un(t)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(Ye=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=is(),ge(as()))}),ge("typography")}function is(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(e=>{let s=Ye===e.id,n=e.id?[...ie].some(o=>o.startsWith(e.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${e.id}" title="${e.tip}">
      ${e.label}${n&&e.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function as(){var t;return((t=document.querySelector(".vx-sp-seg-active"))==null?void 0:t.dataset.tab)||"typography"}function ge(t){let e=document.getElementById("vx-sp-body");if(!e)return;let s={typography:$n,spacing:Ln,colors:Sn,layout:Tn,borders:Bn,effects:Mn,classes:In};e.innerHTML=(s[t]||s.classes)(),On(e)}function $n(){let t=te(/^font-(sans|serif|mono)$/)||"",e=te(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=te(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=te(/^text-(left|center|right|justify)$/)||"text-left",o=te(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=te(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=te(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",l=te(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ne("Font","^font-(sans|serif|mono)$",t,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${ne("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",e,se.sizes.map(d=>({label:d,value:`text-${d}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ne("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,se.weights.map(d=>({label:d,value:`font-${d}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${_n(se.aligns.map(d=>({value:`text-${d}`,label:d,icon:Nn(d)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${ne("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,se.leadings.map(d=>({label:d,value:`leading-${d}`})))}
        ${ne("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,se.trackings.map(d=>({label:d,value:`tracking-${d}`})))}
        ${ne("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,se.transforms.map(d=>({label:d,value:d})))}
        ${ne("Decoration","^(no-underline|underline|line-through)$",l,se.decorations.map(d=>({label:d,value:d})))}
      </div>
    </div>
  `}function Ln(){let t={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};t[Me]||(Me="padding"),t[Me].prefixes[Ae]||(Ae="all");let e=t[Me],s=e.prefixes[Ae],n=Hn(s),o=Rn(s)||"",i=Me==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${Is(Object.keys(t).map(a=>({value:a,label:t[a].label})),Me,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${e.sides.map(a=>`
          <button class="vx-side-btn${Ae===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Ts(a)}">
            ${Dn(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${e.label} ${Ts(Ae)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${se.compactSpacings.map(a=>{let l=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Ze(l)?" vx-sp-pill-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${Ze(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function Sn(){let t=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],e=Ht||"text",s=e,n=jn(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${t.map(a=>`<button class="vx-sp-cprop${a.id===e?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${se.specialColors.map(a=>{let l=`${s}-${a.name}`,d=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,p=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${Ze(l)?" vx-sp-dot-active":""}" data-set="${l}" data-pattern="${n}" style="${d}${p}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=Ce?se.colors.find(a=>a.name===Ce):null;return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-stage">
      ${i?`
        <div class="vx-shade-stage-header">
          <button class="vx-shade-back" data-family-back>&larr; Colors</button>
          <span class="vx-shade-title">${i.name}</span>
        </div>
        <div class="vx-shade-grid">${Object.entries(i.shades).map(([a,l])=>{let d=`${s}-${i.name}-${a}`;return`<button class="vx-sp-shade${Ze(d)?" vx-sp-shade-active":""}" data-set="${d}" data-pattern="${n}" data-toggle="false" style="background:${l}" title="${a}"><span class="vx-sp-shade-num">${a}</span></button>`}).join("")}</div>
      `:`
        <div class="vx-sp-color-families">${se.colors.map(a=>{let l=Ce===a.name,d=te(new RegExp(`^${s}-${a.name}-\\d+$`));return`<button class="vx-sp-color-family${l?" vx-sp-fam-active":""}${d?" vx-sp-fam-used":""}" data-family="${a.name}" style="background:${a.shades[500]}" title="${a.name}"></button>`}).join("")}</div>
      `}
    </div>
  </div>`,o}function Tn(){let t=Pn(),e=te(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=t==="flex",n=t==="grid",o=e==="absolute"||e==="fixed",i=te(/^gap(?:-[xy])?-/)||"",a=te(/^grid-cols-\d+$/)||"",l=te(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${An(t)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${ne("Direction","^flex-(row|col|row-reverse|col-reverse)$",te(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${ne("Justify","^justify-(start|center|end|between|around|evenly)$",te(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${ne("Align","^items-(start|center|end|stretch|baseline)$",te(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${ne("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...se.gaps.map(d=>({label:d,value:`gap-${d}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${ne("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...se.gridCols.map(d=>({label:d,value:`grid-cols-${d}`}))])}
          ${ne("Rows","^grid-rows-\\d+$",l,[{label:"Auto",value:""},...se.gridRows.map(d=>({label:d,value:`grid-rows-${d}`}))])}
          ${ne("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...se.gaps.slice(1).map(d=>({label:d,value:`gap-${d}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${ne("Position","^(static|relative|absolute|fixed|sticky)$",e,se.positions.map(d=>({label:d,value:d})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${ne("Top","^top-",te(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",se.coordinates.map(d=>({label:d,value:`top-${d}`})))}
          ${ne("Right","^right-",te(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",se.coordinates.map(d=>({label:d,value:`right-${d}`})))}
          ${ne("Bottom","^bottom-",te(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",se.coordinates.map(d=>({label:d,value:`bottom-${d}`})))}
          ${ne("Left","^left-",te(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",se.coordinates.map(d=>({label:d,value:`left-${d}`})))}
        </div>
      </div>
    `:""}
  `}function Bn(){let t={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},e=Ke==="all"?"all":Ie;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${se.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Ze(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${ne("Style","^border-(solid|dashed|dotted|double|none)$",te(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...se.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${Is([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],Ke==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${Ie==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${Ie==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${Ie==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${Ie==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${Ke==="all"?"ALL":Ie.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${se.radii.map(s=>{let n=Fn(e,s);return`<button class="vx-sp-pill vx-sp-pill-compact${Ze(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${qn(e)}" data-toggle="false">${t[s]}</button>`}).join("")}
      </div>
    </div>
  `}function Mn(){let t=zn();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${Ze(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function In(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...ie].map(t=>`<span class="vx-sp-class" data-class="${t}">${t} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function ne(t,e,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${t}</label>
    <select class="vx-sp-select" data-select-pattern="${e}">
      ${n.map(o=>`<option value="${At(o.value)}"${s===o.value?" selected":""}>${gt(o.label)}</option>`).join("")}
    </select>
  </div>`}function Is(t,e,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${t.map(i=>`<button class="vx-sp-segment-btn${i.value===e?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${gt(i.label)}</button>`).join("")}
  </div>`}function _n(t,e,s){return`<div class="vx-icon-segment">
    ${t.map(n=>`
      <button class="vx-icon-segment-btn${n.value===e?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${At(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function An(t){let e=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:e('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:e('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:e('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:e('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:e('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${t===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function Pn(){let t=te(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return t==="inline-flex"?"flex":t==="inline-grid"?"grid":t==="inline-block"?"block":t}function Hn(t){return t==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":t==="gap-x"?"^gap-x-(?:[\\d.]+)$":t==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${t}-(?:auto|[\\d.]+)$`}function jn(t){return`^${t}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function Rn(t){let e=te(new RegExp(`^${t}-(auto|[\\d.]+)$`));return e?e.replace(`${t}-`,""):""}function Ts(t){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[t]||t}function Dn(t){let e=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:e('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:e('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:e('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:e('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:e('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:e('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:e('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[t]||t}function Nn(t){let e=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[t]||t}function Fn(t,e){let s=e===""?"":`-${e}`;if(t==="all")return e===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[t]||"rounded-tl";return e===""?n:`${n}${s}`}function qn(t){return t==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[t]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function zn(){let t=te(/^opacity-(\d+)$/);if(!t)return 100;let e=parseInt(t.replace("opacity-",""),10);return Number.isNaN(e)?100:Math.min(100,Math.max(0,e))}function Ze(t){let e=Ye;return ie.has(e?e+":"+t:t)}function os(t,e,{toggle:s=!0,rerender:n=!0}={}){let o=Ye,i=o?o+":":"",a=e?new RegExp(e):null,l=t?i+t:"",d=!!l&&ie.has(l);if(a)for(let c of[...ie])if(o){if(c.startsWith(i)){let v=c.slice(i.length);a.test(v)&&ie.delete(c)}}else!/^(sm|md|lg|xl|2xl):/.test(c)&&a.test(c)&&ie.delete(c);l&&(!s||!d)&&ie.add(l),De=!0,re({type:"vx-editor:update-classes",classes:[...ie],silent:!0});let p=document.getElementById("vx-sp-breakpoints");p&&(p.innerHTML=is()),n&&ge(as())}function te(t){let e=Ye;for(let s of ie)if(e){if(s.startsWith(e+":")){let n=s.slice(e.length+1);if(t.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&t.test(s))return s;return null}function On(t){t.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";os(o,i,{toggle:a,rerender:!0})})}),t.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";os(i,o,{toggle:!1,rerender:!0})})}),t.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{Ce=Ce===n.dataset.family?null:n.dataset.family,ge("colors")})}),t.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{Ce=null,ge("colors")})}),t.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{Ht=n.dataset.cprop||"text",Ce=null,ge("colors")})}),t.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Me=n.dataset.spaceMode||"padding",Ae="all",ge("spacing")})}),t.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{Ae=n.dataset.spaceSide||"all",ge("spacing")})}),t.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{Ke=n.dataset.radiusMode==="corners"?"corners":"all",ge("borders")})}),t.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{Ie=n.dataset.radiusCorner||"tl",Ke="corners",ge("borders")})});let e=t.querySelector("#vx-opacity-slider");if(e){let n=()=>{let i=String(e.value||"100"),a=t.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(e.value||"100");os(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};e.addEventListener("input",o),e.addEventListener("change",()=>ge("effects"))}let s=t.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{ie.add(i)}),De=!0,re({type:"vx-editor:update-classes",classes:[...ie],silent:!0}),s.value="",ge("classes"))}),t.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;ie.delete(i),De=!0,re({type:"vx-editor:update-classes",classes:[...ie],silent:!0}),o.remove()}}})}async function Un(t){let e=[...ie].join(" ");if(e===Ge){Pe({revertUnsaved:!1});return}We.push({type:"text",filePath:t.filePath,originalHTML:`class="${Ge}"`,newHTML:`class="${e}"`,timestamp:Date.now()}),De=!1,Pe({revertUnsaved:!1}),oe("Saving & compiling\u2026"),await bt(),re({type:"vx-editor:update-classes",classes:[...ie],silent:!0}),setTimeout(()=>{let s=document.getElementById("preview-iframe");s&&s.contentWindow&&s.contentWindow.postMessage("voxelsite:reload","*")},500)}function _s(t,e){let s=!1,n,o,i,a,l=!1,d=v=>{if(v.target.closest("button, input, select"))return;s=!0;let r=v.touches?v.touches[0]:v;n=r.clientX,o=r.clientY;let h=t.getBoundingClientRect();i=h.left,a=h.top,e.style.cursor="grabbing",v.preventDefault(),l||(l=!0,document.addEventListener("mousemove",p),document.addEventListener("touchmove",p,{passive:!1}),document.addEventListener("mouseup",c),document.addEventListener("touchend",c))},p=v=>{if(!s)return;let r=v.touches?v.touches[0]:v,h=12,g=t.getBoundingClientRect(),u=g.width||300,f=g.height||500,x=i+r.clientX-n,m=a+r.clientY-o,C=h,w=Math.max(h,window.innerWidth-u-h),A=52,j=Math.max(A,window.innerHeight-f-h),W=Math.min(Math.max(x,C),w),q=Math.min(Math.max(m,A),j);t.style.left=`${W}px`,t.style.top=`${q}px`,t.style.right="auto"},c=()=>{s&&(s=!1,e.style.cursor="",l&&(l=!1,document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c)))};return e.addEventListener("mousedown",d),e.addEventListener("touchstart",d,{passive:!1}),()=>{e.removeEventListener("mousedown",d),e.removeEventListener("touchstart",d),l&&(document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c))}}var _e=null;function ot(){let t=document.getElementById("vx-ai-panel");t&&(_e&&(_e.abort(),_e=null),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),t.classList.remove("vx-ai-visible"),setTimeout(()=>t.remove(),180))}function Vn(t){He(),Pe(),ot();let e=Pt(t.tagName,t.classList),s=(t.text||"").substring(0,80).replace(/\s+/g," ").trim(),n=document.createElement("div");n.id="vx-ai-panel",n.className="vx-ai-panel",n.tabIndex=-1,n.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${gt(e)}</span>
      </div>
      <div class="vx-ai-header-right">
        <span class="vx-sp-drag-hint">\u22EE\u22EE</span>
        <button class="vx-sp-close" id="vx-ai-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    ${s?`<div class="vx-ai-preview">${gt(s.length>=78?s+"\u2026":s)}</div>`:""}
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
    </div>`,document.body.appendChild(n),_t(n),n.__vxOnResize=()=>_t(n),window.addEventListener("resize",n.__vxOnResize),requestAnimationFrame(()=>n.classList.add("vx-ai-visible")),n.__vxDestroyDrag=_s(n,n.querySelector("#vx-ai-drag-handle"));let o=n.querySelector("#vx-ai-input"),i=n.querySelector("#vx-ai-send"),a=n.querySelector("#vx-ai-cancel-btn"),l=n.querySelector("#vx-ai-status"),d=n.querySelector("#vx-ai-status-text"),p=n.querySelector("#vx-ai-close");setTimeout(()=>o==null?void 0:o.focus(),200),p.addEventListener("click",()=>ot()),n.addEventListener("keydown",h=>{h.key==="Escape"&&(h.preventDefault(),ot())}),o.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),r())}),i.addEventListener("click",r),a.addEventListener("click",()=>{_e&&(_e.abort(),_e=null),v()});function c(){o.disabled=!0,i.hidden=!0,a.hidden=!1,l.hidden=!1,d.textContent="Reading your site\u2026"}function v(){o.disabled=!1,i.hidden=!1,a.hidden=!0,l.hidden=!0,o.focus()}async function r(){let h=o.value.trim();if(!h)return;ot(),re({type:"vx-editor:show-ai-overlay",status:"AI is editing\u2026"}),_e=new AbortController;let g=t.outerHTML||"",u=t.filePath||cs();try{await nt("/ai/prompt",{user_prompt:h,action_type:"section_edit",page_scope:u,action_data:{path:u,sectionHtml:g.substring(0,15e3)}},{signal:_e.signal,onStatus(f){re({type:"vx-editor:update-ai-status",status:f||"Working\u2026"})},onFile(){re({type:"vx-editor:update-ai-status",status:"Applying changes\u2026"})},onToken(){re({type:"vx-editor:update-ai-status",status:"Generating\u2026"})},onError(f){re({type:"vx-editor:hide-ai-overlay"}),oe(f.message||"AI edit failed",!0)},onDone(f){if(_e=null,re({type:"vx-editor:hide-ai-overlay"}),f.cancelled){oe("Generation cancelled",!1);return}(f.files_modified||[]).length>0?(oe("Section updated \u2713"),setTimeout(()=>{let m=document.getElementById("preview-iframe");m!=null&&m.contentWindow&&m.contentWindow.postMessage("voxelsite:reload","*")},400)):f.partial||oe("No changes made",!1)},onWarning(f){typeof window.showToast=="function"&&window.showToast(f,"warning")}})}catch(f){f.name!=="AbortError"&&oe("AI edit failed",!0),re({type:"vx-editor:hide-ai-overlay"})}}}function Wn(t){He();let e=document.createElement("div");e.className="vx-modal-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("vx-modal-visible"));let s=()=>{e.classList.remove("vx-modal-visible"),e.removeEventListener("keydown",n),setTimeout(()=>e.remove(),200)},n=o=>{o.key==="Escape"&&s()};e.addEventListener("keydown",n),e.querySelector("[data-close]").addEventListener("click",s),e.addEventListener("click",o=>{o.target===e&&s()}),e.tabIndex=-1,e.focus(),Gn(e)}async function Gn(t){let e=t.querySelector("#vx-img-grid");try{let s=await L.get("/assets");if(!s.ok){e.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){e.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}e.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),e.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",()=>{re({type:"vx-editor:swap-image",src:o.dataset.path}),t.classList.remove("vx-modal-visible"),setTimeout(()=>t.remove(),200)})})}catch{e.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function Kn(t){He();let e=document.createElement("div");e.className="vx-modal-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${At(t.href||"")}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${At(t.text||"")}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("vx-modal-visible"));let s=()=>{e.classList.remove("vx-modal-visible"),e.removeEventListener("keydown",n),setTimeout(()=>e.remove(),200)},n=o=>{o.key==="Escape"&&s()};e.addEventListener("keydown",n),e.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",s)),e.addEventListener("click",o=>{o.target===e&&s()}),document.getElementById("vx-link-save").addEventListener("click",()=>{re({type:"vx-editor:update-link",href:document.getElementById("vx-link-href").value.trim(),text:document.getElementById("vx-link-text").value.trim()}),s()}),setTimeout(()=>{var o;return(o=document.getElementById("vx-link-href"))==null?void 0:o.focus()},100)}async function Yn(t){let{filePath:e,oldSrc:s,newSrc:n,alt:o}=t,i=e||cs();try{let a=await L.get(`/files/content?path=${encodeURIComponent(i)}`);if(!a.ok){console.warn("[VX] Cannot read file for image save:",i),oe("Save failed",!0);return}let l=a.data.content,d=!1,p=`src="${s}"`;if(l.includes(p)&&(l=l.replace(p,`src="${n}"`),d=!0),!d&&l.includes(s)&&(l=l.replace(s,n),d=!0),!d&&o){let v=Bs(l,o,n);v!==!1&&(l=v,d=!0)}if(d){(await L.put("/files/content",{path:i,content:l})).ok?oe("Saved"):oe("Save failed",!0);return}let c=await L.get("/files");if(c.ok){let v=(c.data.files||[]).filter(r=>r.path.endsWith(".php")&&r.path!==i);for(let r of v){let h=await L.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!h.ok||!h.data.content)continue;let g=h.data.content;if(g.includes(p)&&(g=g.replace(p,`src="${n}"`),(await L.put("/files/content",{path:r.path,content:g})).ok)){oe(`Saved \u2192 ${r.path.split("/").pop()}`);return}if(g.includes(s)&&(g=g.replace(s,n),(await L.put("/files/content",{path:r.path,content:g})).ok)){oe(`Saved \u2192 ${r.path.split("/").pop()}`);return}if(o){let u=Bs(g,o,n);if(u!==!1&&(await L.put("/files/content",{path:r.path,content:u})).ok){oe(`Saved \u2192 ${r.path.split("/").pop()}`);return}}}}console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),oe("Save failed \u2014 source not found",!0)}catch(a){console.error("[VX] Image save error:",a),oe("Save failed",!0)}}function Bs(t,e,s){let n=t.split("<img");for(let o=1;o<n.length;o++){let i=n[o];if(!i.includes(`alt="${e}"`)&&!i.includes(`alt='${e}'`))continue;let a=i.indexOf("src=");if(a===-1)continue;let l=i[a+4];if(l!=='"'&&l!=="'")continue;let d=a+5,p=i.indexOf(l,d);if(p!==-1)return n[o]=i.substring(0,d)+s+i.substring(p),n.join("<img")}return!1}function rs(t){We.push({type:"text",filePath:t.filePath,originalHTML:t.originalHTML,newHTML:t.newHTML,timestamp:Date.now()}),clearTimeout(rs._timer),rs._timer=setTimeout(()=>bt(),800)}function ls(t){We.push({type:"delete",filePath:t.filePath,outerHTML:t.outerHTML,timestamp:Date.now()}),clearTimeout(ls._timer),ls._timer=setTimeout(()=>bt(),300)}async function bt(){var e;if(ns||We.length===0)return;ns=!0;let t=[...We];We=[];try{let s={};for(let i of t){let a=i.filePath||cs();s[a]||(s[a]=[]),s[a].push(i)}let n=!1,o={filesByMain:new Map,contentByPath:new Map};for(let[i,a]of Object.entries(s))try{let l=await L.get(`/files/content?path=${encodeURIComponent(i)}`);if(!l.ok){console.error("[VX] Cannot read:",i);continue}let d=l.data.content,p=!1;for(let c of a){let v=c.type==="delete"?c.outerHTML:c.originalHTML;if(v)if(d.includes(v))d=c.type==="delete"?d.replace(v,""):d.replace(v,c.newHTML),p=!0;else{if(await Zn(i,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",v.substring(0,80))}}if(p){let c=await L.put("/files/content",{path:i,content:d});c.ok?(oe("Saved"),(e=c.data)!=null&&e.tailwindCompiled&&(n=!0)):oe("Save failed",!0)}}catch(l){console.error("[VX] Save error:",l),oe("Save failed",!0)}n&&setTimeout(()=>{let i=document.getElementById("preview-iframe");i!=null&&i.contentWindow&&i.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{ns=!1,We.length>0&&setTimeout(()=>bt(),0)}}async function Zn(t,e,s=null){let n=e.type==="delete"?e.outerHTML:e.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(t);if(!a){let l=await L.get("/files");if(!l.ok)return!1;a=(l.data.files||[]).filter(d=>d.path.endsWith(".php")&&d.path!==t).filter(d=>o.some(p=>d.path.includes(p+"/"))||d.path.includes("partial")||d.path.includes("header")||d.path.includes("footer")||d.path.includes("nav")),i.filesByMain.set(t,a)}for(let l of a){let d=i.contentByPath.get(l.path);if(d==null){let p=await L.get(`/files/content?path=${encodeURIComponent(l.path)}`);if(!p.ok||!p.data.content)continue;d=p.data.content,i.contentByPath.set(l.path,d)}if(d.includes(n)){let p=e.type==="delete"?d.replace(n,""):d.replace(n,e.newHTML);if((await L.put("/files/content",{path:l.path,content:p})).ok)return i.contentByPath.set(l.path,p),oe(`Saved \u2192 ${l.path.split("/").pop()}`),!0}}}catch(a){console.error("[VX] Partial search error:",a)}return!1}function As(){let t=document.getElementById("btn-visual-editor");t&&(t.classList.toggle("vx-editor-active",Ee),t.title=Ee?"Exit visual editor (V)":"Visual editor (V)"),document.body.classList.toggle("vx-editing",Ee)}function oe(t,e=!1){if(typeof window.showToast=="function"){window.showToast(t,e?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=t,s.classList.toggle("vx-save-error",e),s.classList.add("vx-save-visible"),clearTimeout(oe._timer),oe._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function re(t){let e=document.getElementById("preview-iframe");if(e!=null&&e.contentWindow)try{e.contentWindow.postMessage(t,"*")}catch{}}function cs(){return window.__vsCurrentPreviewPath||"index.php"}function _t(t){let e=document.getElementById("preview-iframe"),s=t.offsetWidth||300,n=t.offsetHeight||520,o=32,i=56;if(!e){t.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,t.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=e.getBoundingClientRect(),l=a.right-s-o,d=Math.max(o,a.left+10),p=Math.max(o,window.innerWidth-s-o),c=Math.min(Math.max(l,d),p),v=Math.max(a.top+12,i),r=Math.max(i,window.innerHeight-n-o),h=Math.min(v,r);t.style.left=`${c}px`,t.style.top=`${h}px`,t.style.right="auto"}function Xn(t){let e=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return t.some(s=>e(s,"bg"))?"bg":t.some(s=>e(s,"border"))?"border":(t.some(s=>e(s,"text")),"text")}function At(t){return(t||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function gt(t){return(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var E={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>'};var Ps=typeof document<"u"?document.createElement("span"):null;function y(t){return t?(Ps.textContent=t,Ps.innerHTML):""}var Jn={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function yt(t=""){let e=String(t||"").toLowerCase();for(let[s,n]of Object.entries(Jn))if(e.endsWith(s))return n;return"plaintext"}function Qn(){let t=document.getElementById("vs-toast-container");return t||(t=document.createElement("div"),t.id="vs-toast-container",t.className="vs-toast-container",document.body.appendChild(t),t)}function N(t,e="success",s=3200){if(!t)return;let n=Qn(),o=document.createElement("div"),i=["success","error","warning"].includes(e)?e:"success";o.className=`vs-toast vs-toast-${i}`,o.innerHTML=`<span>${y(String(t))}</span>`,n.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(6px)",setTimeout(()=>o.remove(),220)},s)}window.showToast=N;function le(t){t.classList.remove("is-visible"),setTimeout(()=>t.remove(),350)}function be({title:t="Confirm Action",description:e="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var c,v;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let l=document.createElement("div");l.id="vs-confirm-overlay",l.className="vs-modal-overlay",l.innerHTML=`
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
    `;let d=r=>{r.key==="Escape"&&(r.preventDefault(),p(!1))},p=r=>{document.removeEventListener("keydown",d),le(l),i(r)};document.body.appendChild(l),requestAnimationFrame(()=>l.classList.add("is-visible")),l.addEventListener("click",r=>{r.target===l&&p(!1)}),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>p(!1)),(v=document.getElementById("vs-confirm-ok"))==null||v.addEventListener("click",()=>p(!0)),document.addEventListener("keydown",d),setTimeout(()=>{var r;return(r=document.getElementById("vs-confirm-ok"))==null?void 0:r.focus()},220)})}function ps({title:t="Enter Value",description:e="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text"}){return new Promise(l=>{var h,g;let d=document.getElementById("vs-prompt-overlay");d&&d.remove();let p=document.createElement("div");p.id="vs-prompt-overlay",p.className="vs-modal-overlay";let c=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${y(n)}" style="resize: vertical;">${y(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${y(n)}" value="${y(o)}">`;p.innerHTML=`
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
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${y(i)}</button>
        </div>
      </div>
    `;let v=u=>{le(p),l(u)};document.body.appendChild(p),requestAnimationFrame(()=>p.classList.add("is-visible"));let r=p.querySelector("#vs-prompt-input");setTimeout(()=>r==null?void 0:r.focus(),220),p.addEventListener("click",u=>{u.target===p&&v(null)}),(h=p.querySelector("#vs-prompt-cancel"))==null||h.addEventListener("click",()=>v(null)),(g=p.querySelector("#vs-prompt-ok"))==null||g.addEventListener("click",()=>{v(((r==null?void 0:r.value)||"").trim())}),r==null||r.addEventListener("keydown",u=>{a==="textarea"?u.key==="Enter"&&(u.metaKey||u.ctrlKey)&&(u.preventDefault(),v(((r==null?void 0:r.value)||"").trim())):u.key==="Enter"&&(u.preventDefault(),v(((r==null?void 0:r.value)||"").trim())),u.key==="Escape"&&(u.preventDefault(),v(null))})})}var wt=null;function Hs(){return`
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
              <div class="vs-empty-state-icon">${E.fileCode}</div>
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
  `}async function js(){var ws;let t=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),e={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(t==null?void 0:t.fontSize)||13,wordWrap:(t==null?void 0:t.wordWrap)||!1,expandedFolders:new Set((t==null?void 0:t.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((t==null?void 0:t.expandedSections)||["site","config","prompts"]),_pendingRestore:t?{tabs:t.openTabs||[],active:t.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!e||!e.openTabs?!1:e.openTabs.some(k=>k.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:e.openTabs.map(k=>k.path),activeTab:e.activeTab,fontSize:e.fontSize,wordWrap:e.wordWrap,expandedFolders:[...e.expandedFolders],expandedSections:[...e.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),e.disposed=!0,e.monacoInstance&&(e.monacoInstance.dispose(),e.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),l=document.getElementById("editor-host"),d=document.getElementById("editor-empty-state"),p=document.getElementById("editor-monaco-container"),c=document.getElementById("editor-file-info"),v=document.getElementById("editor-status"),r=document.getElementById("editor-save-btn"),h=document.getElementById("editor-refresh-tree"),g=document.getElementById("editor-new-file"),u=document.getElementById("editor-sidebar"),f=document.getElementById("editor-sidebar-resize"),x=document.getElementById("editor-font-size-select"),m=document.getElementById("editor-word-wrap-btn");x&&(x.value=e.fontSize);let C=()=>{m&&(e.wordWrap?(m.style.color="var(--vs-accent)",m.style.backgroundColor="var(--vs-accent-dim)"):(m.style.color="var(--vs-text-ghost)",m.style.backgroundColor="transparent"))};C();let w=(k,$="muted")=>{v&&(v.textContent=k,v.dataset.state=$)},A=k=>{let $=e.files.find(T=>T.path===k);return($==null?void 0:$.readonly)===!0},j=k=>{let $=k.toLowerCase();return $.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':$.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':$.endsWith(".js")||$.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},W=(k,$="")=>{let T=[],B={},R=z=>{if(B[z])return B[z];let D=z.split("/"),J=D[D.length-1],Z=D.slice(0,-1).join("/"),Q=$?$+z:z,ue={name:J,path:Q,type:"folder",children:[]};return B[z]=ue,Z?R(Z).children.push(ue):T.push(ue),ue};for(let z of k){let J=($&&z.path.startsWith($)?z.path.substring($.length):z.path).split("/");if(J.length===1)T.push({name:J[0],path:z.path,type:"file",meta:z});else{let Z=J.slice(0,-1).join("/");R(Z).children.push({name:J[J.length-1],path:z.path,type:"file",meta:z})}}let O=z=>{z.sort((D,J)=>D.type!==J.type?D.type==="folder"?-1:1:D.name.localeCompare(J.name));for(let D of z)D.type==="folder"&&O(D.children)};return O(T),T},q=()=>{if(!n)return;let k=(O,z=0)=>O.map(D=>{var Je,Bt;if(D.type==="folder"){let pt=e.expandedFolders.has(D.path);return`
            <div class="vs-tree-item" data-folder="${y(D.path)}" style="--tree-indent: ${z};">
              <span class="vs-tree-folder-toggle" data-expanded="${pt}">${E.chevronRight}</span>
              <span class="vs-tree-item-icon">${pt?E.folderOpen||E.folder:E.folder}</span>
              <span class="vs-tree-item-name">${y(D.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${y(D.path)}" data-collapsed="${!pt}">
              ${k(D.children,z+1)}
            </div>
          `}let J=e.activeTab===D.path,Z=e.openTabs.find(pt=>pt.path===D.path),Q=Z!=null&&Z.dirty?" \u2022":"",ct=A(D.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",Le=((Je=D.meta)==null?void 0:Je.custom)===!0,ze=((Bt=D.meta)==null?void 0:Bt.protected)===!0,Oe="";return D.path==="assets/css/tailwind.css"?Oe=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:ze?Le&&(Oe=`
            <button class="vs-tree-item-restore" data-restore-file="${y(D.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):Oe=`
            <button class="vs-tree-item-delete" data-delete-file="${y(D.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${y(D.path)}" data-active="${J}" style="--tree-indent: ${z};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${j(D.path)}</span>
            <span class="vs-tree-item-name">${y(D.name)}${ct}${Q}</span>
            ${Oe}
          </div>
        `}).join(""),$=(O,z,D)=>{let J=D.querySelector(".vs-explorer-caret");e.expandedSections.has(O)?(z.style.display="block",D.classList.add("is-expanded")):(z.style.display="none",D.classList.remove("is-expanded"))},T=document.querySelector('[data-section="site"]'),B=document.querySelector('[data-section="config"]'),R=document.querySelector('[data-section="prompts"]');T&&$("site",n,T),B&&o&&$("config",o,B),R&&i&&$("prompts",i,R),n.innerHTML=k(e.treeData.site),o&&(o.innerHTML=k(e.treeData.config)),i&&(i.innerHTML=k(e.treeData.prompts)),dt()},V=()=>{if(a){if(e.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=e.openTabs.map(k=>{let $=k.path===e.activeTab,T=k.path.split("/").pop(),R=A(k.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${y(k.path)}" data-active="${$}" data-dirty="${k.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${y(T)}${R}</span>
          <button class="vs-editor-tab-close" data-close-tab="${y(k.path)}" title="Close">${E.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',Kt(),S()}},U=null,ee=k=>{if(!a)return;let $=8,T=()=>{a.scrollLeft+=k==="left"?-$:$,S()};T(),U=setInterval(T,16)},b=()=>{U&&(clearInterval(U),U=null)},S=()=>{let k=document.getElementById("editor-tab-scroll-left"),$=document.getElementById("editor-tab-scroll-right");if(!a||!k||!$)return;let T=a.scrollLeft>0,B=a.scrollLeft<a.scrollWidth-a.clientWidth-1;k.style.display=T?"flex":"none",$.style.display=B?"flex":"none"};a&&(a.addEventListener("scroll",S,{passive:!0}),window.addEventListener("resize",S,{passive:!0}));let M=document.getElementById("editor-tab-scroll-left"),_=document.getElementById("editor-tab-scroll-right");M&&(M.addEventListener("mousedown",()=>ee("left")),M.addEventListener("mouseup",b),M.addEventListener("mouseleave",b)),_&&(_.addEventListener("mousedown",()=>ee("right")),_.addEventListener("mouseup",b),_.addEventListener("mouseleave",b));let P=()=>{d&&(d.style.display="none"),p&&(p.style.display=""),e.monacoInstance&&e.monacoInstance.layout()},G=async k=>{if(e.disposed)return;let $=e.openTabs.find(z=>z.path===k);if($){await X(k);return}w("Loading\u2026");let{ok:T,data:B,error:R}=await L.get(`/files/content?path=${encodeURIComponent(k)}`);if(!T){N((R==null?void 0:R.message)||"Could not load file.","error"),w("Load failed","error");return}let O=typeof(B==null?void 0:B.content)=="string"?B.content:"";$={path:k,baseline:O,dirty:!1},e.openTabs.push($),P(),await X(k),F(O,k),w("Ready"),s()},X=async k=>{if(e.disposed)return;let $=e.openTabs.find(B=>B.path===e.activeTab);$&&e.monacoInstance&&($._buffer=e.monacoInstance.getValue()),e.activeTab=k;let T=e.openTabs.find(B=>B.path===k);if(T&&e.monacoInstance){let B=T._buffer!==void 0?T._buffer:T.baseline;F(B,k)}he(),de(),V(),setTimeout(()=>{if(a){let B=a.querySelector('.vs-editor-tab[data-active="true"]');if(B){let R=B.getBoundingClientRect(),O=a.getBoundingClientRect();R.left<O.left?a.scrollBy({left:R.left-O.left,behavior:"smooth"}):R.right>O.right&&a.scrollBy({left:R.right-O.right,behavior:"smooth"})}}},10),q(),s()},ce=async k=>{let $=e.openTabs.find(B=>B.path===k);if($!=null&&$.dirty&&!await be({title:"Discard unsaved changes?",description:`"${k}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let T=e.openTabs.findIndex(B=>B.path===k);if(T!==-1){if(e.openTabs.splice(T,1),e.activeTab===k){let B=e.openTabs[Math.min(T,e.openTabs.length-1)];B?await X(B.path):(e.activeTab=null,Y(),he(),de())}V(),q(),s()}},H=async k=>{var z;if((z=window.demoGuard)!=null&&z.call(window))return;let $=k.split("/").pop();if(!await be({title:"Delete file?",description:`Are you sure you want to permanently delete "${$}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;w("Deleting\u2026");let{ok:B,error:R}=await L.delete(`/files?path=${encodeURIComponent(k)}`);if(!B){N((R==null?void 0:R.message)||"Could not delete file.","error"),w("Delete failed","error");return}let O=e.openTabs.findIndex(D=>D.path===k);if(O!==-1){if(e.openTabs.splice(O,1),e.activeTab===k){let D=e.openTabs[Math.min(O,e.openTabs.length-1)];D?await X(D.path):(e.activeTab=null,Y(),he(),de())}V()}await ve(),s(),N(`Deleted ${$}`,"success"),w("Ready")},pe=async k=>{var z;if((z=window.demoGuard)!=null&&z.call(window))return;let $=k.split("/").pop();if(!await be({title:"Reset system prompt?",description:`Are you sure you want to reset "${$}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;w("Resetting\u2026");let{ok:B,error:R}=await L.delete(`/files?path=${encodeURIComponent(k)}`);if(!B){N((R==null?void 0:R.message)||"Could not reset file.","error"),w("Reset failed","error");return}let O=e.openTabs.findIndex(D=>D.path===k);if(O!==-1){let{ok:D,data:J}=await L.get(`/files/content?path=${encodeURIComponent(k)}`);if(D&&typeof(J==null?void 0:J.content)=="string"){let Z=e.openTabs[O];Z.baseline=J.content,Z.dirty=!1,Z._buffer=J.content,e.activeTab===k&&F(J.content,k)}}de(),await ve(),s(),N(`Reset ${$} to default`,"success"),w("Ready")},F=(k,$)=>{if(!e.monacoInstance||!e.monaco)return;let T=e.monacoInstance.getModel();T&&(e.monacoInstance.setValue(k),e.monaco.editor.setModelLanguage(T,yt($)),e.monacoInstance.updateOptions({readOnly:window.IS_DEMO||A($)}))},Y=()=>{d&&(d.style.display=""),p&&(p.style.display="none")},he=()=>{if(!c)return;if(!e.activeTab){c.textContent="No file open";return}let k=e.openTabs.find(R=>R.path===e.activeTab),$=e.files.find(R=>R.path===e.activeTab),T=$!=null&&$.size?`${(Number($.size)/1024).toFixed(1)} KB`:"",B=yt(e.activeTab).toUpperCase();c.textContent=[e.activeTab,B,T].filter(Boolean).join(" \u2022 ")},de=()=>{if(!r)return;let k=e.openTabs.find(T=>T.path===e.activeTab);if(e.activeTab?A(e.activeTab):!1){r.disabled=!0,r.textContent="Read-Only",r.classList.remove("vs-btn-primary"),r.classList.add("vs-btn-ghost");return}if(!k||!k.dirty){r.disabled=!0,r.textContent="Saved",r.classList.remove("vs-btn-primary"),r.classList.add("vs-btn-ghost");return}r.disabled=!1,r.textContent="Save",r.classList.remove("vs-btn-ghost"),r.classList.add("vs-btn-primary")},ae=()=>{let k=e.openTabs.find(B=>B.path===e.activeTab);if(!k||!e.monacoInstance)return;let $=e.monacoInstance.getValue(),T=k.dirty;k.dirty=$!==k.baseline,T!==k.dirty&&(de(),V(),k.dirty?w("Unsaved changes","warning"):w("Ready"))},$e=async()=>{var O,z,D,J;if((O=window.demoGuard)!=null&&O.call(window))return;let k=e.openTabs.find(Z=>Z.path===e.activeTab);if(!k||!k.dirty||!e.monacoInstance)return;let $=e.monacoInstance.getValue();r.disabled=!0,r.textContent="Saving\u2026",w("Saving\u2026");let{ok:T,error:B}=await L.put("/files/content",{path:k.path,content:$});if(!T){r.disabled=!1,r.textContent="Save",N((B==null?void 0:B.message)||"Could not save file.","error"),w("Save failed","error");return}k.baseline=$,k.dirty=!1,k._buffer=$,de(),V(),q(),w("Saved","success"),N(`Saved ${k.path}`,"success"),k.path.toLowerCase().endsWith(".css")?(z=window.sendPreviewMessage)==null||z.call(window,"voxelsite:reload-css"):(D=window.sendPreviewMessage)==null||D.call(window,"voxelsite:reload"),setTimeout(()=>{var Z;return(Z=window.refreshPreview)==null?void 0:Z.call(window)},400),(J=window.refreshPublishState)==null||J.call(window,{silent:!0});let R=e.openTabs.find(Z=>Z.path==="assets/css/tailwind.css");R&&k.path!=="assets/css/tailwind.css"&&L.get("/files/content?path=assets/css/tailwind.css").then(({ok:Z,data:Q})=>{Z&&typeof(Q==null?void 0:Q.content)=="string"&&(R.baseline=Q.content,R._buffer=Q.content,e.activeTab==="assets/css/tailwind.css"&&e.monacoInstance&&e.monacoInstance.setValue(Q.content))})},dt=()=>{let k=$=>{$&&($.querySelectorAll("[data-file]").forEach(T=>{T.addEventListener("click",B=>{B.target.closest("[data-delete-file]")||G(T.dataset.file)})}),$.querySelectorAll("[data-delete-file]").forEach(T=>{T.addEventListener("click",B=>{B.stopPropagation(),H(T.dataset.deleteFile)})}),$.querySelectorAll("[data-restore-file]").forEach(T=>{T.addEventListener("click",B=>{B.stopPropagation(),pe(T.dataset.restoreFile)})}),$.querySelectorAll("[data-compile-tailwind]").forEach(T=>{T.addEventListener("click",async B=>{var Q;if(B.stopPropagation(),(Q=window.demoGuard)!=null&&Q.call(window))return;T.style.opacity="0.4",T.style.pointerEvents="none",w("Compiling Tailwind\u2026");let{ok:R,data:O,error:z}=await L.post("/files/compile-tailwind");if(T.style.opacity="",T.style.pointerEvents="",!R){N((z==null?void 0:z.message)||"Tailwind compilation failed.","error"),w("Compile failed","error");return}let D="assets/css/tailwind.css",J=e.openTabs.find(ue=>ue.path===D);J&&(J.baseline=O.content,J.dirty=!1,e.activeTab===D&&e.monacoInstance&&e.monacoInstance.setValue(O.content));let Z=O.class_count??0;N(`Tailwind CSS recompiled \u2014 ${Z} utilities.`,"success"),w("Compiled")})}),$.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(T=>{T.addEventListener("click",B=>{B.stopPropagation();let O=T.closest(".vs-tree-item").dataset.folder;e.expandedFolders.has(O)?e.expandedFolders.delete(O):e.expandedFolders.add(O),s(),q()})}))};k(n),k(o),k(i),document.querySelectorAll(".vs-explorer-section-header").forEach($=>{$.dataset.bound||($.dataset.bound="true",$.addEventListener("click",()=>{let T=$.dataset.section;e.expandedSections.has(T)?e.expandedSections.delete(T):e.expandedSections.add(T),s(),q()}))})},Kt=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(k=>{k.addEventListener("click",$=>{$.target.closest("[data-close-tab]")||X(k.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(k=>{k.addEventListener("click",$=>{$.stopPropagation(),ce(k.dataset.closeTab)})}))};if(f&&u){let k=!1;f.addEventListener("mousedown",$=>{$.preventDefault(),k=!0,f.classList.add("is-dragging");let T=R=>{if(!k)return;let O=Math.min(400,Math.max(200,R.clientX));u.style.width=O+"px"},B=()=>{k=!1,f.classList.remove("is-dragging"),document.removeEventListener("mousemove",T),document.removeEventListener("mouseup",B)};document.addEventListener("mousemove",T),document.addEventListener("mouseup",B)})}r==null||r.addEventListener("click",$e),x==null||x.addEventListener("change",k=>{let $=parseInt(k.target.value,10);e.fontSize=$,e.monacoInstance&&e.monacoInstance.updateOptions({fontSize:$}),s()}),m==null||m.addEventListener("click",()=>{e.wordWrap=!e.wordWrap,C(),e.monacoInstance&&e.monacoInstance.updateOptions({wordWrap:e.wordWrap?"on":"off"}),s()}),h==null||h.addEventListener("click",()=>ve()),g==null||g.addEventListener("click",async()=>{var z,D;if((z=window.demoGuard)!=null&&z.call(window))return;let k=await ps({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!k||!k.trim())return;let $=k.trim(),T=(D=$.split(".").pop())==null?void 0:D.toLowerCase(),B=["php","css","js","json"];if(!T||!B.includes(T)){N(`Only ${B.join(", ")} files can be created.`,"warning");return}w("Creating\u2026");let{ok:R,error:O}=await L.post("/files/create",{path:$});if(!R){N((O==null?void 0:O.message)||"Could not create file.","error"),w("Create failed","error");return}await ve(),await G($),N(`Created ${$}`,"success")});let qe=k=>{if(e.disposed){document.removeEventListener("keydown",qe);return}(k.metaKey||k.ctrlKey)&&k.key==="s"&&(k.preventDefault(),$e())};document.addEventListener("keydown",qe);let ve=async()=>{var B;let{ok:k,data:$,error:T}=await L.get("/files");if(!k||!((B=$==null?void 0:$.files)!=null&&B.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}e.files=$.files,e.treeData={site:W($.files.filter(R=>!R.path.startsWith("_prompts/")&&!R.path.startsWith("_root/"))),config:W($.files.filter(R=>R.path.startsWith("_root/")),"_root/"),prompts:W($.files.filter(R=>R.path.startsWith("_prompts/")),"_prompts/")},q()},fn=async()=>{if(!p)return;let k;try{k=await Rs()}catch{N("Monaco editor is not available.","warning");return}e.monaco=k;let $=xt();k.editor.setTheme($);let T=k.editor.create(p,{value:"",language:"php",theme:$,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:e.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:e.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});e.monacoInstance=T,T.onDidChangeModelContent(()=>ae()),T.addCommand(k.KeyMod.CtrlCmd|k.KeyCode.KeyK,async()=>{if(e.monacoInstance.getOption(k.editor.EditorOption.readOnly)){N("Cannot use inline AI on a read-only file.","warning");return}let B=e.activeTab;if(!B)return;let R=e.monacoInstance.getModel(),O=e.monacoInstance.getSelection(),z=R.getValueInRange(O);if(!z||z.trim()===""){let Q=e.monacoInstance.getPosition(),ue=R.getLineContent(Q.lineNumber);if(ue.trim()===""){N("Highlight a block of code to edit.","warning");return}z=ue,e.monacoInstance.setSelection(new k.Range(Q.lineNumber,1,Q.lineNumber,R.getLineMaxColumn(Q.lineNumber)))}let D=await ps({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!D)return;let J=e.monacoInstance.getValue();e.monacoInstance.updateOptions({readOnly:!0});let Z=document.createElement("div");Z.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",Z.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${E.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,p&&(p.style.position="relative",p.appendChild(Z)),w("AI is editing...","muted");try{await nt("/ai/prompt",{user_prompt:D,action_type:"inline_edit",action_data:{path:B,selection:z}},{onStatus:Q=>{let ue=document.getElementById("ai-inline-status");ue&&(ue.textContent="Generating...")},onFile:()=>{let Q=document.getElementById("ai-inline-status");Q&&(Q.textContent="Applying changes...")},onError:Q=>{N(Q.message||"Generation failed","error")},onDone:async Q=>{var ct;if((ct=Q.files_modified)==null?void 0:ct.some(Le=>(typeof Le=="string"?Le:(Le==null?void 0:Le.path)||"").replace(/^\//,"")===B.replace(/^\//,""))){let{ok:Le,data:ze}=await L.get(`/files/content?path=${encodeURIComponent(B)}&_t=${Date.now()}`);if(Le&&(ze!=null&&ze.content)){let Oe=ze.content;await L.put("/files/content",{path:B,content:J}),e.monacoInstance.getModel().setValue(Oe);let Je=e.openTabs.find(Bt=>Bt.path===B);Je&&(Je._buffer=Oe,Je.baseline=J),ae(),N("Review changes and save.","success")}}else Q.partial||N("Complete (No changes made to this file)","info")}})}finally{e.monacoInstance.updateOptions({readOnly:!1}),Z.parentNode&&Z.parentNode.removeChild(Z),w("Ready","muted")}})};if(await Promise.all([ve(),fn()]),e._pendingRestore&&e._pendingRestore.tabs.length>0){let{tabs:k,active:$}=e._pendingRestore;e._pendingRestore=null;for(let T of k){if(!e.files.some(O=>O.path===T))continue;let{ok:B,data:R}=await L.get(`/files/content?path=${encodeURIComponent(T)}`);B&&typeof(R==null?void 0:R.content)=="string"&&e.openTabs.push({path:T,baseline:R.content,dirty:!1})}if(e.openTabs.length>0){let T=$&&e.openTabs.find(B=>B.path===$)?$:e.openTabs[0].path;P(),await X(T),F(((ws=e.openTabs.find(B=>B.path===T))==null?void 0:ws.baseline)||"",T),w("Ready")}}}function xt(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function Rs(){var t;return(t=window.monaco)!=null&&t.editor?window.monaco:wt||(wt=new Promise((e,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,l){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{e(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(e=>{throw wt=null,e}),wt)}async function vs(t=""){var q,V,U,ee;let e=document.getElementById("vs-code-editor-overlay");e&&e.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),l=s.querySelector("#vs-code-meta"),d=s.querySelector("#vs-code-status"),p=s.querySelector("#vs-code-editor-host"),c={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},v=(b,S="muted")=>{d&&(d.textContent=b,d.dataset.state=S)},r=()=>c.files.find(b=>b.path===c.path)||null,h=()=>!!c.editor&&c.editor.getValue()!==c.baseline,g=()=>{if(!l)return;let b=r();if(!b){l.textContent="No file selected";return}let S=b.size?`${(Number(b.size)/1024).toFixed(1)} KB`:"0 KB",M=b.modified?new Date(b.modified).toLocaleString():"Unknown date";l.textContent=`${b.path} \u2022 ${S} \u2022 ${M}`},u=()=>{if(!o)return;let b=h();o.disabled=!b,o.textContent=b?"Save Changes":"Saved",b?v("Unsaved changes","warning"):c.path&&v("Saved","success")},f=async()=>{var b;c.closed||h()&&!await be({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(c.closed=!0,(b=c.editorCleanup)!=null&&b.dispose&&(c.editorCleanup.dispose(),c.editorCleanup=null),c.editor&&(c.editor.dispose(),c.editor=null),le(s))},x=(b,S=null)=>{if(!c.editor)return;c.editor.setValue(b),c.baseline=b;let M=(S==null?void 0:S.language)||yt(c.path);c.editor.setLanguage&&c.editor.setLanguage(M),g(),u()},m=async(b,{silent:S=!1}={})=>{if(!b||!c.editor)return!1;c.path=b,S||v("Loading file\u2026");let{ok:M,data:_,error:P}=await L.get(`/files/content?path=${encodeURIComponent(b)}`);if(!M)return N((P==null?void 0:P.message)||"Could not load file.","error"),v("Load failed","error"),!1;let G=typeof(_==null?void 0:_.content)=="string"?_.content:"";return x(G,(_==null?void 0:_.file)||r()),!0},C=async()=>h()?await be({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,w=async b=>{if(!b||b===c.path)return;if(!await C()){n&&(n.value=c.path);return}await m(b)},A=async()=>{var _,P,G;if(!c.editor||!c.path||!o)return;let b=c.editor.getValue();if(b===c.baseline){u();return}o.disabled=!0,o.textContent="Saving\u2026",v("Saving\u2026");let{ok:S,error:M}=await L.put("/files/content",{path:c.path,content:b});if(!S){o.disabled=!1,o.textContent="Save Changes",N((M==null?void 0:M.message)||"Could not save file.","error"),v("Save failed","error");return}c.baseline=b,u(),v("Saved","success"),N(`Saved ${c.path}`,"success"),c.path.toLowerCase().endsWith(".css")?(_=window.sendPreviewMessage)==null||_.call(window,"voxelsite:reload-css"):(P=window.sendPreviewMessage)==null||P.call(window,"voxelsite:reload"),setTimeout(()=>{var X;return(X=window.refreshPreview)==null?void 0:X.call(window)},400),(G=window.refreshPublishState)==null||G.call(window,{silent:!0})},j=b=>{b.key==="Escape"&&(b.preventDefault(),f())};a==null||a.addEventListener("click",()=>f()),i==null||i.addEventListener("click",async()=>{!c.path||!await C()||await m(c.path)}),o==null||o.addEventListener("click",()=>A()),n==null||n.addEventListener("change",b=>{w(b.target.value)}),s.addEventListener("click",b=>{b.target===s&&f()}),document.addEventListener("keydown",j);let W=()=>document.removeEventListener("keydown",j);s.addEventListener("transitionend",()=>{document.body.contains(s)||W()});try{let b=await L.get("/files");if(!b.ok||!((V=(q=b.data)==null?void 0:q.files)!=null&&V.length)){let P=((U=b.error)==null?void 0:U.message)||"No editable files found.";N(P,"error"),f();return}let S=b.data.files;c.files=S,n&&(n.innerHTML=S.map(P=>{let G=P.group?`${String(P.group).toUpperCase()} \xB7 `:"";return`<option value="${y(P.path)}">${y(G+P.path)}</option>`}).join(""));let M=((ee=S.find(P=>P.path===t))==null?void 0:ee.path)||S[0].path;c.path=M,n&&(n.value=M),p.innerHTML="";let _=null;try{_=await Rs()}catch{N("Monaco is not available yet. Using fallback editor.","warning"),v("Fallback editor active","warning")}if(_!=null&&_.editor){let P=xt();_.editor.setTheme(P);let G=_.editor.create(p,{value:"",language:yt(M),theme:P,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});c.editor={getValue:()=>G.getValue(),setValue:X=>G.setValue(X),setLanguage:X=>{let ce=G.getModel();ce&&_.editor.setModelLanguage(ce,X)},dispose:()=>G.dispose()},c.editorCleanup=G.onDidChangeModelContent(()=>{u()})}else{p.innerHTML='<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"></textarea>';let P=p.querySelector("#vs-code-editor-fallback"),G=()=>u();P==null||P.addEventListener("input",G),c.editor={getValue:()=>(P==null?void 0:P.value)||"",setValue:X=>{P&&(P.value=X)},setLanguage:()=>{},dispose:()=>{P==null||P.removeEventListener("input",G)}}}await m(M,{silent:!0}),v("Ready")}catch(b){N((b==null?void 0:b.message)||"Could not initialize code editor.","error"),f()}finally{let b=new MutationObserver(()=>{document.body.contains(s)||(W(),b.disconnect())});b.observe(document.body,{childList:!0,subtree:!0})}}function zs(){return setTimeout(()=>jt(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function jt(){var S,M,_,P,G,X,ce;let t=document.getElementById("settings-content");if(!t)return;let[e,s,n,o,i,a,l]=await Promise.all([L.get("/settings"),L.get("/settings/system"),L.get("/settings/mail"),L.get("/settings/usage"),L.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),L.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),L.get("/settings/logs")]),d=((S=l.data)==null?void 0:S.logs)||[],p=((M=e.data)==null?void 0:M.settings)||{},c=((_=s.data)==null?void 0:_.system)||{},v=null,r=null;try{i.ok&&((P=i.data)!=null&&P.content)&&(v=JSON.parse(i.data.content))}catch{}try{a.ok&&((G=a.data)!=null&&G.content)&&(r=JSON.parse(a.data.content))}catch{}let h=v||r,g=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},u=p.available_providers||{},f=((X=n.data)==null?void 0:X.config)||{},x=((ce=n.data)==null?void 0:ce.presets)||{},m=Object.keys(u),C=p.ai_provider||"claude",A=(u[C]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],j=p[`ai_${C}_model`]||"",W=p[`ai_${C}_api_key_set`]||!1,q=m.map(H=>{let pe=u[H];return`<option value="${y(H)}" ${H===C?"selected":""}>${y(pe.name)}</option>`}).join(""),V="";for(let H of A)H.key==="api_key"?V+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(H.label)}${H.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${W?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${y(H.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${W?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':H.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${y(H.help_text||"Optional for local servers")}</p>`}
          ${H.help_url?`<a href="${H.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${y(H.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:H.key==="base_url"&&(V+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${y(H.label)}${H.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${y(p.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${y(H.placeholder)}" />
          ${H.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${y(H.help_text)}</p>`:""}
        </div>`);t.innerHTML=`
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
            ${q}
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
                ${Object.entries(x).map(([H,pe])=>`<option value="${y(H)}">${y(pe.label)}</option>`).join("")}
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
        ${v?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${E.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(v).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${E.chevronRight}</div>
        </button>
        `:""}
        ${r?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${E.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(r).length} design decisions</span>
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
      ${g.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${fe("Total Requests",Number(g.totals.request_count).toLocaleString())}
          ${fe("Input Tokens",Number(g.totals.total_input_tokens).toLocaleString())}
          ${fe("Output Tokens",Number(g.totals.total_output_tokens).toLocaleString())}

        </div>
        ${g.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${g.models.map(H=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${fe(H.ai_model||"Unknown",Number(H.request_count).toLocaleString()+" requests")}
                ${fe("Tokens",Number(H.total_input_tokens).toLocaleString()+" in / "+Number(H.total_output_tokens).toLocaleString()+" out")}

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
        ${fe("VoxelSite",c.version||"1.0.0")}
        ${fe("PHP",c.php_version||"?")}
        ${fe("SQLite",c.sqlite_version||"?")}
        ${fe("Database",us(c.database_size))}
        ${fe("Preview Files",us(c.preview_size))}
        ${fe("Assets",us(c.assets_size))}
        ${fe("Upload Limit",c.max_upload||"?")}
        ${fe("Memory Limit",c.memory_limit||"?")}
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
        ${d.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':d.map(H=>{let pe=(H.size/1024).toFixed(1),F=new Date(H.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${H.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${H.lines} lines \xB7 ${pe} KB \xB7 ${F}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(H.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${H.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
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
  `,ro(p,u),lo(f,x),so(),no(),document.querySelectorAll(".btn-delete-log").forEach(H=>{H.addEventListener("click",async()=>{var Y;if((Y=window.demoGuard)!=null&&Y.call(window))return;if(H.dataset.confirm!=="true"){H.dataset.confirm="true",H.innerHTML='<span style="font-size: 11px;">Sure?</span>',H.style.color="var(--vs-error)",setTimeout(()=>{H.dataset.confirm==="true"&&(H.dataset.confirm="",H.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',H.style.color="")},3e3);return}let pe=H.dataset.file,F=H.closest(".vs-log-row");F&&(F.style.opacity="0.4"),await L.delete("/settings/logs",{file:pe}),jt()})});let U=document.getElementById("btn-delete-all-logs");U&&U.addEventListener("click",async()=>{var H;if(!((H=window.demoGuard)!=null&&H.call(window))){if(U.dataset.confirm!=="true"){U.dataset.confirm="true",U.textContent="Sure?",U.style.color="var(--vs-error)",setTimeout(()=>{U.dataset.confirm==="true"&&(U.dataset.confirm="",U.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',U.style.color="")},3e3);return}U.disabled=!0,U.textContent="Deleting...",await L.delete("/settings/logs",{file:"*"}),jt()}});let ee=document.getElementById("btn-view-memory");ee&&v&&ee.addEventListener("click",()=>Ds("Site Memory",v,"memory"));let b=document.getElementById("btn-view-design");b&&r&&b.addEventListener("click",()=>Ds("Design Intelligence",r,"design")),to(),ao(j)}function eo(t,e){let s=(t||"0").split(".").map(Number),n=(e||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function to(){let t=document.getElementById("vs-update-zone"),e=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!t||!o)return;l();async function l(){var r;if(a)try{let{ok:h,data:g}=await L.get("/update/dist-packages");if(!h||!((r=g==null?void 0:g.packages)!=null&&r.length)){a.innerHTML="";return}let u=g.current_version||"0.0.0",f=g.packages.map(x=>{let m=(x.size/1024/1024).toFixed(1),C=eo(x.version,u)>0,w=x.version===u,A=C?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':w?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${y(x.filename)}</strong>
                ${A}
              </div>
              <div class="vs-dist-pkg-meta">v${y(x.version)} \xB7 ${m} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${y(x.filename)}" data-version="${y(x.version)}">
              Apply Update
            </button>
          </div>
        `}).join("");a.innerHTML=`
        <div class="vs-dist-packages-section">
          <div class="vs-dist-packages-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <span>Update packages found in <code>/dist/</code></span>
          </div>
          ${f}
        </div>
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(x=>{x.addEventListener("click",()=>d(x.dataset.filename,x.dataset.version))})}catch{}}async function d(r,h){var u,f;if(!((u=window.demoGuard)!=null&&u.call(window)||!confirm(`Apply update from "${r}" (v${h})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){e.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${r}...`,a&&(a.innerHTML="");try{let{ok:x,data:m,error:C}=await L.post("/update/apply-local",{filename:r});s.classList.add("hidden"),n.classList.remove("hidden");let w=document.getElementById("vs-update-result-icon"),A=document.getElementById("vs-update-result-message");if(x){let j=m;w.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',A.innerHTML=`
          <div class="vs-update-result-title">${y(j.message)}</div>
          <div class="vs-update-result-meta">
            ${j.files_updated} files updated \xB7 ${j.files_skipped} preserved
            ${(f=j.errors)!=null&&f.length?` \xB7 ${j.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",(C==null?void 0:C.message)||"Unknown error")}catch(x){c("Update Failed",y(x.message||"Network error."))}}}t.addEventListener("click",r=>{var h;(h=window.demoGuard)!=null&&h.call(window)||r.target.closest("#vs-update-result")||o.click()}),t.addEventListener("dragover",r=>{r.preventDefault(),t.classList.add("is-dragover")}),t.addEventListener("dragleave",()=>t.classList.remove("is-dragover")),t.addEventListener("drop",r=>{var g,u,f;if(r.preventDefault(),t.classList.remove("is-dragover"),(g=window.demoGuard)!=null&&g.call(window))return;let h=(f=(u=r.dataTransfer)==null?void 0:u.files)==null?void 0:f[0];h&&h.name.endsWith(".zip")&&p(h)}),o.addEventListener("change",()=>{var h;let r=(h=o.files)==null?void 0:h[0];r&&p(r),o.value=""});async function p(r){var u,f;let h=document.querySelector(".vs-sys-grid");if(h){let x=h.querySelectorAll(".vs-sys-value"),m="";if(h.querySelectorAll(".vs-sys-label").forEach((C,w)=>{var A,j;C.textContent.trim()==="Upload Limit"&&(m=((j=(A=x[w])==null?void 0:A.textContent)==null?void 0:j.trim())||"")}),m){let C=v(m);if(C>0&&r.size>C){let w=(r.size/1024/1024).toFixed(1);c("File Too Large",`The update file is ${w} MB but your server's upload limit is ${m}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${w} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${r.name}" (${(r.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){e.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${r.name}...`;try{let x=new FormData;x.append("update_zip",r);let m=I.get("sessionToken"),C=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:m?{"X-VS-Token":m}:{},body:x}),w=C.headers.get("content-type")||"",A;if(!w.includes("application/json")){let q=await C.text();if(q.includes("POST Content-Length")||q.includes("upload_max_filesize")||q.includes("exceeds")){c("Server Upload Limit Exceeded",`The file (${(r.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}c("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}A=await C.json(),s.classList.add("hidden"),n.classList.remove("hidden");let j=document.getElementById("vs-update-result-icon"),W=document.getElementById("vs-update-result-message");if(A.ok){let q=A.data;j.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',W.innerHTML=`
          <div class="vs-update-result-title">${y(q.message)}</div>
          <div class="vs-update-result-meta">
            ${q.files_updated} files updated \xB7 ${q.files_skipped} preserved
            ${(u=q.errors)!=null&&u.length?` \xB7 ${q.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",((f=A.error)==null?void 0:f.message)||"Unknown error")}catch(x){let m=x.message||"Network error. Check your connection.";m.includes("Unexpected token")||m.includes("not valid JSON")?c("Server Upload Limit Exceeded",`The file (${(r.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):c("Upload Failed",y(m))}}}function c(r,h){s.classList.add("hidden"),n.classList.remove("hidden");let g=document.getElementById("vs-update-result-icon"),u=document.getElementById("vs-update-result-message");g.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',u.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${y(r)}</div>
      <div class="vs-update-result-meta">${h}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function v(r){let h=r.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!h)return 0;let g=parseFloat(h[1]),u=h[2].toUpperCase();return u==="GB"||u==="G"?g*1024*1024*1024:u==="MB"||u==="M"?g*1024*1024:u==="KB"||u==="K"?g*1024:0}}function Ds(t,e,s){var d,p,c;(d=document.getElementById("vs-knowledge-overlay"))==null||d.remove();let n=v=>v.replace(/[_-]/g," ").replace(/\b\w/g,r=>r.toUpperCase()),o="";s==="memory"?o=Object.entries(e).map(([v,r])=>{let h=typeof r=="object"?r.value||JSON.stringify(r):String(r),g=typeof r=="object"?r.confidence:null,u=g==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${y(n(v))}</div>
          <div class="vs-kv-value">
            <span>${y(h)}</span>
            ${g?`<span class="vs-kv-badge ${u}">${y(g)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(e).map(([v,r])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${y(n(v))}</div>
        <div class="vs-kv-section-body">${y(String(r))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?E.book:E.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${y(t)}</h2>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",l)},l=v=>{v.key==="Escape"&&a()};document.addEventListener("keydown",l),(p=i.querySelector("#vs-knowledge-close"))==null||p.addEventListener("click",a),(c=i.querySelector("#vs-knowledge-done"))==null||c.addEventListener("click",a),i.addEventListener("click",v=>{v.target===i&&a()})}function so(){let t=document.getElementById("btn-reset-site");t&&t.addEventListener("click",()=>{var e;(e=window.demoGuard)!=null&&e.call(window)||io()})}function no(){let t=document.getElementById("btn-reset-install");t&&t.addEventListener("click",()=>{var e;(e=window.demoGuard)!=null&&e.call(window)||oo()})}function oo(){let t=document.getElementById("reset-install-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="reset-install-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>{requestAnimationFrame(()=>{e.classList.add("is-visible")})}),setTimeout(()=>{var d;(d=document.getElementById("reset-install-confirm-input"))==null||d.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let d=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",d),s.classList.toggle("is-matched",d)}),s==null||s.addEventListener("keydown",d=>{d.key==="Enter"&&(s.value.trim()===a?Ns(e):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?Ns(e):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>le(e)),e.addEventListener("click",d=>{d.target===e&&le(e)});let l=d=>{d.key==="Escape"&&(le(e),document.removeEventListener("keydown",l))};document.addEventListener("keydown",l)}async function Ns(t){let e=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(e){e.classList.add("is-loading"),e.classList.remove("is-enabled"),e.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await L.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,e.style.background="var(--vs-success)",e.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=t.querySelector(".vs-modal-desc");if(a){let l=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=l,a.style.color=""},4e3)}}}catch{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.textContent="Erase Everything",s&&(s.disabled=!1)}}}function Os(){return new Promise(t=>{let e=document.getElementById("unsaved-modal-overlay");e&&e.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),t(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function io(){let t=document.getElementById("reset-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="reset-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>{requestAnimationFrame(()=>{e.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let l=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()==="RESET"?Fs(e):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?Fs(e):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>le(e)),e.addEventListener("click",l=>{l.target===e&&le(e)});let a=l=>{l.key==="Escape"&&(le(e),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function Fs(t){var n,o;let e=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(e){e.classList.add("is-loading"),e.classList.remove("is-enabled"),e.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:l}=await L.post("/site/reset",{confirm:"RESET"});if(i){I.set("pages",[]),I.set("hasFormSchemas",!1),I.set("conversations",null),I.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,e.style.background="var(--vs-success)",e.style.opacity="1",setTimeout(()=>{le(t),window.location.hash!=="#/chat"?window.location.hash="#/chat":window.dispatchEvent(new HashChangeEvent("hashchange"))},800)}else{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let d=t.querySelector(".vs-modal-desc");if(d){let p=d.textContent;d.textContent=(l==null?void 0:l.message)||"Reset failed. Please try again.",d.style.color="var(--vs-error)",setTimeout(()=>{d.textContent=p,d.style.color=""},4e3)}}}catch{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function ao(t){var s;let e=document.getElementById("set-ai-model");if(e)try{let{ok:n,data:o}=await L.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?e.innerHTML=o.models.map(i=>`<option value="${y(i.id)}" ${i.id===t?"selected":""}>${y(i.name||i.id)}</option>`).join(""):e.innerHTML='<option value="">Test your connection to load available models</option>'}catch{e.innerHTML='<option value="">Test your connection to load available models</option>'}}function fe(t,e){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${t}</span>
      <span class="vs-sys-value">${e}</span>
    </div>
  `}function us(t){return!t&&t!==0?"?":t>=1048576?(t/1048576).toFixed(1)+" MB":t>=1024?(t/1024).toFixed(1)+" KB":t+" B"}function ro(t,e){let s=t.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async c=>{var v;if((v=window.demoGuard)!=null&&v.call(window)){c.target.value=s;return}s=c.target.value,await L.put("/settings",{ai_provider:s}),jt()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var u,f,x,m,C;if((u=window.demoGuard)!=null&&u.call(window))return;let c=((f=i==null?void 0:i.value)==null?void 0:f.trim())||"",v=((m=(x=document.getElementById("set-base-url"))==null?void 0:x.value)==null?void 0:m.trim())||"";if(s!=="openai_compatible"&&(!c||c.startsWith("\u2022\u2022"))){gs("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:r,data:h,error:g}=await L.post("/settings/test-api",{provider:s,api_key:c.startsWith("\u2022\u2022")?"":c,base_url:v});if(o.textContent="Test Connection",o.disabled=!1,r){if(gs("\u2713 Connected successfully!","success"),(C=h==null?void 0:h.models)!=null&&C.length){let w=document.getElementById("set-ai-model");if(w){let A=t[`ai_${s}_model`]||"";w.innerHTML=h.models.map(j=>`<option value="${y(j.id)}" ${j.id===A?"selected":""}>${y(j.name||j.id)}</option>`).join("")}}}else gs("\u2717 "+((g==null?void 0:g.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),l=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var h,g,u,f,x;if((h=window.demoGuard)!=null&&h.call(window))return;a.textContent="Saving...",a.disabled=!0;let c={site_name:((u=(g=document.getElementById("set-site-name"))==null?void 0:g.value)==null?void 0:u.trim())||"",site_tagline:((x=(f=document.getElementById("set-site-tagline"))==null?void 0:f.value)==null?void 0:x.trim())||""},{ok:v,error:r}=await L.put("/settings",c);a.textContent="Save Identity",a.disabled=!1,l&&(l.classList.remove("hidden"),v?(l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3"):(l.textContent="\u2717 "+((r==null?void 0:r.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3"),setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3))});let d=document.getElementById("btn-save-settings"),p=document.getElementById("save-status");d&&d.addEventListener("click",async()=>{var u,f,x,m;if((u=window.demoGuard)!=null&&u.call(window))return;d.textContent="Saving...",d.disabled=!0;let c={ai_provider:s,[`ai_${s}_model`]:((f=document.getElementById("set-ai-model"))==null?void 0:f.value)||"",ai_max_tokens:parseInt(((x=document.getElementById("set-max-tokens"))==null?void 0:x.value)||"32000",10)},v=document.getElementById("set-base-url");v&&(c.ai_openai_compatible_base_url=v.value.trim());let r=(m=i==null?void 0:i.value)==null?void 0:m.trim();r&&!r.startsWith("\u2022\u2022")&&(c[`ai_${s}_api_key`]=r);let{ok:h,error:g}=await L.put("/settings",c);d.textContent="Save Settings",d.disabled=!1,p&&(p.classList.remove("hidden"),h?(p.textContent="\u2713 Saved",p.className="text-xs text-vs-success ml-3"):(p.textContent="\u2717 "+((g==null?void 0:g.message)||"Failed to save."),p.className="text-xs text-vs-error ml-3"),setTimeout(()=>p==null?void 0:p.classList.add("hidden"),3e3))})}function lo(t,e){var h;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function l(){if(!t.smtp_host)return"gmail";for(let[g,u]of Object.entries(e))if(u.host&&u.host===t.smtp_host)return g;return"custom"}if(i){let g=l();i.value=g,a&&((h=e[g])!=null&&h.help)&&(a.textContent=e[g].help)}s&&s.addEventListener("change",()=>{let g=s.value;n&&(n.style.display=g==="smtp"?"block":"none"),o&&(o.style.display=g==="mailpit"?"block":"none");let u=document.getElementById("mail-common-fields");u&&(u.style.display=g==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let g=e[i.value];if(!g)return;let u=document.getElementById("set-smtp-host"),f=document.getElementById("set-smtp-port"),x=document.getElementById("set-smtp-encryption");u&&(u.value=g.host||""),f&&(f.value=g.port||587),x&&(x.value=g.encryption||"tls"),a&&(a.textContent=g.help||"")});let d=document.getElementById("btn-toggle-smtp-pass"),p=document.getElementById("set-smtp-password");d&&p&&d.addEventListener("click",()=>{let g=p.type==="password";p.type=g?"text":"password",d.innerHTML=g?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let c=document.getElementById("btn-mail-test");c&&c.addEventListener("click",async()=>{var C,w,A;if((C=window.demoGuard)!=null&&C.call(window))return;let g=(A=(w=document.getElementById("set-mail-test-recipient"))==null?void 0:w.value)==null?void 0:A.trim();if(!g){ms("Enter an email address to send the test to.","warning");return}c.textContent="Sending...",c.disabled=!0;let u=qs();u.test_recipient=g;let{ok:f,data:x,error:m}=await L.post("/settings/mail/test",u);c.textContent="Send Test",c.disabled=!1,f?ms("\u2713 "+((x==null?void 0:x.message)||"Test email sent successfully!"),"success"):ms("\u2717 "+((m==null?void 0:m.message)||"Test failed."),"error")});let v=document.getElementById("btn-save-mail"),r=document.getElementById("save-mail-status");v&&v.addEventListener("click",async()=>{var x;if((x=window.demoGuard)!=null&&x.call(window))return;v.textContent="Saving...",v.disabled=!0;let g=qs(),{ok:u,error:f}=await L.post("/settings/mail",g);v.textContent="Save Email Settings",v.disabled=!1,r&&(r.classList.remove("hidden"),u?(r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3"):(r.textContent="\u2717 "+((f==null?void 0:f.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3"),setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3))})}function qs(){var e,s,n,o,i,a,l,d,p,c,v,r,h,g,u;let t=((e=document.getElementById("set-smtp-password"))==null?void 0:e.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((d=(l=document.getElementById("set-smtp-host"))==null?void 0:l.value)==null?void 0:d.trim())||"",smtp_port:parseInt(((p=document.getElementById("set-smtp-port"))==null?void 0:p.value)||"587",10),smtp_username:((v=(c=document.getElementById("set-smtp-username"))==null?void 0:c.value)==null?void 0:v.trim())||"",smtp_password:t.startsWith("\u2022\u2022")?"":t,smtp_encryption:((r=document.getElementById("set-smtp-encryption"))==null?void 0:r.value)||"tls",mailpit_host:((g=(h=document.getElementById("set-mailpit-host"))==null?void 0:h.value)==null?void 0:g.trim())||"localhost",mailpit_port:parseInt(((u=document.getElementById("set-mailpit-port"))==null?void 0:u.value)||"1025",10)}}function ms(t,e){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=t,s.className=`text-xs mt-1.5 ${e==="success"?"text-vs-success":e==="error"?"text-vs-error":"text-vs-warning"}`)}function gs(t,e){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=t,s.className=`text-xs mt-1.5 ${e==="success"?"text-vs-success":e==="error"?"text-vs-error":"text-vs-warning"}`)}var co=[{route:"chat",label:"Chat"},{route:"editor",label:"Editor"},{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"snapshots",label:"Snapshots"},{route:"settings",label:"Settings"}],fs=["chat","editor"],po="vs-first-run-guide-dismissed",tn="vs-onboarding-draft-v1",sn="vs-prompt-recents-v1",nn="vs-prompt-pins-v1",vo=8,uo=5,we=document.documentElement.dataset.demo==="true";function Ne(){return we?(N("Demo mode \u2014 this action is disabled.","warning"),!0):!1}window.IS_DEMO=we;window.demoGuard=Ne;var on=document.getElementById("app");async function an(){var e;$s(),Ms(),window.marked&&window.marked.use({renderer:{html(s){return y(typeof s=="string"?s:s.text)}}});let t=await L.get("/auth/session");if(!t.ok||!((e=t.data)!=null&&e.user)){en();return}I.batch(()=>{I.set("user",t.data.user),I.set("sessionToken",t.data.token)}),window.addEventListener("beforeunload",s=>{var n;(n=window.__hasUnsavedEditorChanges)!=null&&n.call(window)&&(s.preventDefault(),s.returnValue="")}),Ve.beforeEach(async(s,n)=>{var o;return n.startsWith("editor")&&!s.startsWith("editor")&&(o=window.__hasUnsavedEditorChanges)!=null&&o.call(window)?await Os():!0}).on("chat",()=>ye()).on("editor",()=>ye()).on("pages",()=>ye()).on("pages/:slug",()=>ye()).on("assets",()=>ye()).on("forms",()=>ye()).on("forms/:formId",()=>ye()).on("snapshots",()=>ye()).on("settings",()=>ye()).on("profile",()=>ye()).onNotFound(()=>Ve.navigate("chat")),I.on("user",s=>{s||en()}),rn(),Ve.start()}async function rn(){try{let{ok:t,data:e}=await L.get("/pages");if(t&&Array.isArray(e==null?void 0:e.pages)){I.set("pages",e.pages);let s=document.getElementById("chat-messages");s!=null&&s.querySelector(".vs-empty-state")&&(s.innerHTML=rt(),at())}}catch{}}function ye(){let t=I.get("route"),e=fs.includes(t);ht()&&ft(),t!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s;t==="editor"?s=Hs():e?s=go():s=ho(),on.innerHTML=`
    ${mo()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${s}
    </div>
    ${Ro()}
    ${Do()}
    ${Uo()}
  `,Ko(),t==="editor"&&js()}function mo(){let t=I.get("route"),e=I.get("user"),s=I.get("theme");return`
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
            <span class="vs-logo-text hidden sm:inline">VoxelSite</span>
          </a>
          <nav class="flex items-center gap-0.5" aria-label="Studio navigation">
            ${co.map(o=>{let i=t===o.route||t.startsWith(o.route+"/");return`
      <a href="#/${o.route}"
         class="vs-nav-item ${i?"vs-nav-item-active":""}">
        ${o.label}
      </a>
    `}).join("")}
          </nav>
          ${we?`
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
              <span class="hidden sm:inline">${y((e==null?void 0:e.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${E.pencil} Edit Profile
              </a>
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${E.logOut} Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function go(){let t=I.get("sidebarWidth"),e=I.get("activeConversationId"),s=I.get("activePageScope"),n=ln(s);return`
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
          ${rt()}
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
              ${E.send}
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
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${E.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${E.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${E.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Visual editor (V)">
              ${E.pencil} Visual
            </button>
            <button id="btn-edit-code" class="vs-btn vs-btn-ghost vs-btn-xs" title="Edit Code">
              ${E.fileCode} Edit
            </button>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${E.rotateCcw} Refresh
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
  `}function ho(){let t=I.get("route"),e=I.get("routeParams"),s="1100px";return(t==="settings"||t==="profile")&&(s="680px"),t==="forms/:formId"&&(s="800px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${fo(t,e)}
      </div>
    </div>
  `}function fo(t,e){switch(t){case"assets":return ko();case"forms":return So();case"forms/:formId":return Bo(e.formId);case"snapshots":return $o();case"settings":return zs();case"profile":return wo();default:return bo("Not Found","This page doesn't exist.")}}function bo(t,e){return`
    <div class="vs-empty-state" style="min-height: 300px;">
      <div class="vs-empty-icon" style="animation: none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
          <path style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
          <path style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
          <path style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
        </svg>
      </div>
      <h1 class="vs-empty-title">${t}</h1>
      <p class="vs-empty-description" style="margin-bottom: 0;">${e}</p>
      <p class="text-2xs text-vs-text-ghost mt-4">Coming in a future update.</p>
    </div>
  `}function yo(t){let e={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(t||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return E[e[s]||"layoutGrid"]||E.layoutGrid}function Us(t){Ve.navigate("chat"),setTimeout(()=>{let e=document.getElementById("prompt-input");e&&(e.value=t,e.focus(),e.style.height="auto",e.style.height=e.scrollHeight+"px")},150)}function wo(){let t=I.get("user")||{};return setTimeout(()=>xo(),0),`
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
  `}function xo(){let t=document.getElementById("btn-save-profile"),e=document.getElementById("profile-info-feedback");t&&t.addEventListener("click",async()=>{var p,c,v,r;let o=(c=(p=document.getElementById("profile-name"))==null?void 0:p.value)==null?void 0:c.trim(),i=(r=(v=document.getElementById("profile-email"))==null?void 0:v.value)==null?void 0:r.trim();if(!o||o.length<2){e&&(e.textContent="Name must be at least 2 characters.",e.className="text-sm text-vs-error");return}t.disabled=!0,t.textContent="Saving...";let{ok:a,error:l,data:d}=await L.put("/auth/profile",{name:o,email:i});t.disabled=!1,t.textContent="Save Profile",a&&(d!=null&&d.user)?(I.set("user",d.user),e&&(e.textContent="Profile updated.",e.className="text-sm text-vs-success"),setTimeout(()=>ye(),800)):e&&(e.textContent=(l==null?void 0:l.message)||"Failed to update profile.",e.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var p,c,v;let o=((p=document.getElementById("profile-current-pw"))==null?void 0:p.value)||"",i=((c=document.getElementById("profile-new-pw"))==null?void 0:c.value)||"",a=((v=document.getElementById("profile-confirm-pw"))==null?void 0:v.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:l,error:d}=await L.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",l?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(d==null?void 0:d.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function ko(){return setTimeout(()=>Ct(),0),`
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
  `}async function Ct(t="all"){var x;let e=document.getElementById("assets-grid");if(!e)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await Vs(n.files),n.value="",Ct(t))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=m=>{m.target.closest("button")||n==null||n.click()},o.ondragover=m=>{m.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async m=>{m.preventDefault(),o.classList.remove("is-dragover"),m.dataTransfer.files.length>0&&(await Vs(m.dataTransfer.files),Ct(t))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(m=>{m.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(C=>{C.className="vs-device-btn"}),m.className="vs-device-btn vs-device-btn-active",Ct(m.dataset.filter)}});let a=t==="code",l=!a&&t!=="all"?`?category=${t}`:"",{ok:d,data:p}=await L.get(`/assets${l}`);if(!d||!((x=p==null?void 0:p.assets)!=null&&x.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let m=document.getElementById("btn-empty-upload"),C=document.getElementById("btn-upload-asset");m&&C&&m.addEventListener("click",()=>C.click());return}let c=p.assets;if(a&&(c=c.filter(m=>m.category==="css"||m.category==="js"),c.length===0)){e.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${E.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let v=["jpg","jpeg","png","gif","webp","svg","ico"],r=c.filter(m=>m.category==="images"&&v.includes(m.extension)),h=c.filter(m=>!v.includes(m.extension)||m.category!=="images");function g(m,C){return m==="css"?E.fileCode:m==="js"?E.fileCode:m==="json"?E.fileJson:m==="pdf"?E.filePdf:["woff2","woff","ttf","otf"].includes(m)?E.type:["mp4","webm"].includes(m)?E.film:["mp3","wav","ogg"].includes(m)?E.music:["txt","md","csv"].includes(m)?E.fileText:["doc","docx","xls","xlsx"].includes(m)?E.fileText:C==="images"?E.image:E.fileText}let u=["css","js","json","svg"],f="";r.length>0&&(f+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',r.forEach((m,C)=>{var W;let w=Ws(m.size),A=m.width?`${m.width}\xD7${m.height}`:"",j=m.extension==="svg";f+=`
        <div class="vs-asset-card" data-lightbox-idx="${C}">
          <div class="vs-asset-card-thumb${j?" is-svg":""}" style="cursor:pointer">
            <img src="${m.thumbnail||m.path}" alt="${y(((W=m.meta)==null?void 0:W.alt)||m.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${y(m.filename)}">${y(m.filename)}</p>
            <p class="vs-asset-card-meta">${A?A+" \xB7 ":""}${w}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${m.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${E.copy}</button>
            <button data-delete-asset="${m.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${E.x}</button>
          </div>
        </div>
      `}),f+="</div>"),h.length>0&&h.forEach(m=>{let C=Ws(m.size),w=u.includes(m.extension);f+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${g(m.extension,m.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${y(m.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${m.category} \xB7 ${C}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${w?`
              <button data-edit-asset="${m.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${E.pencil}</button>
            `:""}
            <button data-copy-path="${m.path}" title="Copy web path"
              class="vs-asset-action-btn">${E.copy}</button>
            ${m.category!=="css"&&m.category!=="js"?`
              <button data-delete-asset="${m.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${E.trash2}</button>
            `:""}
          </div>
        </div>
      `}),e.innerHTML=f,e.querySelectorAll("[data-lightbox-idx]").forEach(m=>{let C=m.querySelector(".vs-asset-card-thumb");C&&C.addEventListener("click",()=>{let w=parseInt(m.dataset.lightboxIdx,10);Eo(r,w,t)})}),e.querySelectorAll("[data-copy-path]").forEach(m=>{m.addEventListener("click",()=>{navigator.clipboard.writeText(m.dataset.copyPath).then(()=>{let C=m.innerHTML;m.innerHTML="\u2713",m.classList.add("vs-asset-action-copied"),setTimeout(()=>{m.innerHTML=C,m.classList.remove("vs-asset-action-copied")},1200)})})}),e.querySelectorAll("[data-edit-asset]").forEach(m=>{m.addEventListener("click",()=>{let w=m.dataset.editAsset.replace(/^\//,"");vs(w)})}),e.querySelectorAll("[data-delete-asset]").forEach(m=>{m.addEventListener("click",async()=>{if(!await be({title:"Delete Asset",description:`Delete ${m.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:w}=await L.delete("/assets",{path:m.dataset.deleteAsset});w?(N("Asset deleted.","success"),Ct(t)):N("Could not delete asset.","error")})})}function Eo(t,e,s){let n=e;function o(r){if(r===0)return"0 B";let h=1024,g=["B","KB","MB","GB"],u=Math.floor(Math.log(r)/Math.log(h));return parseFloat((r/Math.pow(h,u)).toFixed(1))+" "+g[u]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var x,m;let r=t[n],h=r.width?`${r.width}\xD7${r.height}`:"",g=o(r.size),u=[h,g,(x=r.extension)==null?void 0:x.toUpperCase()].filter(Boolean),f=t.length>1;return`
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
          <div class="vs-lightbox-image-wrap${["svg","png"].includes(r.extension)?" is-transparent":""}">
            <img src="${r.path}" alt="${y(((m=r.meta)==null?void 0:m.alt)||r.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${y(r.filename)}</span>
            <span class="vs-lightbox-details">${u.join(" \xB7 ")}${f?` \xB7 ${n+1} / ${t.length}`:""}</span>
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
    `}let l=document.createElement("div");l.id="vs-lightbox",l.className="vs-lightbox",l.setAttribute("role","dialog"),l.setAttribute("aria-label","Image preview"),l.innerHTML=a(),document.body.appendChild(l),requestAnimationFrame(()=>{requestAnimationFrame(()=>l.classList.add("is-visible"))});function d(){l.classList.remove("is-visible"),setTimeout(()=>l.remove(),400),document.removeEventListener("keydown",c)}function p(r){n=r,l.innerHTML=a(),v()}function c(r){if(r.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;d(),r.preventDefault()}r.key==="ArrowRight"&&t.length>1&&(p((n+1)%t.length),r.preventDefault()),r.key==="ArrowLeft"&&t.length>1&&(p((n-1+t.length)%t.length),r.preventDefault())}function v(){var h,g,u;(h=l.querySelector("#lightbox-close"))==null||h.addEventListener("click",f=>{f.stopPropagation(),d()}),l.addEventListener("click",f=>{(f.target===l||f.target.classList.contains("vs-lightbox-stage"))&&d()}),(g=l.querySelector("#lightbox-prev"))==null||g.addEventListener("click",f=>{f.stopPropagation(),p((n-1+t.length)%t.length)}),(u=l.querySelector("#lightbox-next"))==null||u.addEventListener("click",f=>{f.stopPropagation(),p((n+1)%t.length)});let r=l.querySelector("#lightbox-copy");r==null||r.addEventListener("click",f=>{f.stopPropagation();let x=t[n];navigator.clipboard.writeText(x.path).then(()=>{let m=r.innerHTML;r.innerHTML=`${E.check}<span>Copied!</span>`,r.style.borderColor="var(--vs-success)",r.style.color="var(--vs-success)",setTimeout(()=>{r.innerHTML=m,r.style.borderColor="",r.style.color=""},2e3),N("Path copied!","success")})})}document.addEventListener("keydown",c),v()}async function Vs(t){var i,a,l;if(Ne())return;let e=document.getElementById("status-text");e&&(e.textContent=`Uploading ${t.length} file(s)...`);let s=new FormData;for(let d of t)s.append("file[]",d);let n=I.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let p=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();e&&(e.textContent=p.ok?`\u2713 ${((a=(i=p.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0} file(s) uploaded`:"\u2717 "+(((l=p.error)==null?void 0:l.message)||"Upload failed"),setTimeout(()=>{e&&(e.textContent="Ready")},4e3))}catch{e&&(e.textContent="\u2717 Upload failed",setTimeout(()=>{e&&(e.textContent="Ready")},4e3))}}function Ws(t){if(t===0)return"0 B";let e=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(t)/Math.log(e));return parseFloat((t/Math.pow(e,n)).toFixed(1))+" "+s[n]}function Co(t){let e=new Date(t),n=new Date-e,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),l=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:l===1?"Yesterday":l<30?`${l} days ago`:e.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function $o(){return setTimeout(()=>qt(),0),`
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
  `}async function qt(){var i;let t=document.getElementById("snapshots-list");if(!t)return;let e=document.getElementById("btn-create-snapshot");e&&e.addEventListener("click",()=>{Gs()});let{ok:s,data:n}=await L.get("/snapshots");if(!s||!((i=n==null?void 0:n.snapshots)!=null&&i.length)){t.innerHTML=`
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
    `;let a=document.getElementById("btn-empty-create-snapshot");a&&a.addEventListener("click",()=>Gs());return}let o=n.snapshots;t.innerHTML=`
    <div class="vs-timeline">
      ${o.map((a,l)=>{let d=Co(a.created_at),p=new Date(a.created_at).toLocaleString(),c=a.size_bytes?(a.size_bytes/1024).toFixed(0)+" KB":"\u2014",v=l===o.length-1,r,h,g;a.snapshot_type==="pre_publish"?(r="var(--vs-success)",h="vs-snap-badge-green",g="Pre-publish"):a.snapshot_type==="manual"?(r="var(--vs-accent)",h="vs-snap-badge-amber",g="Manual"):(r="var(--vs-text-ghost)",h="vs-snap-badge-gray",g="Auto");let u=a.description?`<p class="vs-timeline-desc">${y(a.description)}</p>`:"";return`
          <div class="vs-timeline-item${v?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${r}; box-shadow: 0 0 0 3px color-mix(in srgb, ${r} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${h}">${g}</span>
                  <span class="vs-timeline-label">${y(a.label||"Snapshot #"+a.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${p}">${d}</span>
              </div>
              ${u}
              <div class="vs-timeline-meta">${a.file_count} files \xB7 ${c}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${a.id}" data-snap='${JSON.stringify({label:a.label,description:a.description,type:a.snapshot_type,files:a.file_count,size:c,date:p}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${E.eye} Preview
                </button>
                <button data-restore-id="${a.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${E.rotateCcw} Restore
                </button>
                <button data-delete-id="${a.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${E.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,t.querySelectorAll("[data-preview-id]").forEach(a=>{a.addEventListener("click",()=>{let l=JSON.parse(a.dataset.snap);Lo(l)})}),t.querySelectorAll("[data-restore-id]").forEach(a=>{a.addEventListener("click",async()=>{let l=a.dataset.restoreId;if(!await be({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;a.innerHTML=`${E.rotateCcw} Restoring\u2026`,a.disabled=!0;let{ok:p,error:c}=await L.post(`/snapshots/${l}/restore`);if(p){let v=document.getElementById("status-text");v&&(v.textContent="\u2713 Snapshot restored",setTimeout(()=>{v&&(v.textContent="Ready")},4e3)),N("Snapshot restored.","success"),qt()}else N((c==null?void 0:c.message)||"Failed to restore snapshot.","error"),a.innerHTML=`${E.rotateCcw} Restore`,a.disabled=!1})}),t.querySelectorAll("[data-delete-id]").forEach(a=>{a.addEventListener("click",async()=>{let l=a.dataset.deleteId;if(!await be({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;a.innerHTML="Deleting\u2026",a.disabled=!0;let{ok:p,error:c}=await L.delete(`/snapshots/${l}`);p?(N("Snapshot deleted.","success"),qt()):(N((c==null?void 0:c.message)||"Failed to delete snapshot.","error"),a.innerHTML=`${E.trash2}`,a.disabled=!1)})})}function Gs(){var i;let t=document.getElementById("vs-snapshot-create-overlay");t&&t.remove();let e=document.createElement("div");e.id="vs-snapshot-create-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("is-visible"));let s=()=>le(e);e.addEventListener("click",a=>{a.target===e&&s()}),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var p;let a=((p=n==null?void 0:n.value)==null?void 0:p.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:l,error:d}=await L.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),l?(N("Snapshot created.","success"),qt()):N((d==null?void 0:d.message)||"Failed to create snapshot.","error")})}function Lo(t){var i;let e=document.getElementById("vs-snapshot-preview-overlay");e&&e.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;t.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):t.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),s.addEventListener("click",a=>{a.target===s&&le(s)}),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>le(s))}var xe={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function So(){return setTimeout(()=>To(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function To(){let t=document.getElementById("forms-list");if(!t)return;let{ok:e,data:s}=await L.get("/forms");if(!e||!s){t.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){t.innerHTML=`
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
  `}function Bo(t){return setTimeout(()=>Mo(t),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function Mo(t){let e=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!e)return;let{ok:n,data:o}=await L.get(`/forms/${encodeURIComponent(t)}`);if(!n||!o){e.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;e.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/forms" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Forms</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${y(i.name||t)}</span>
      </div>
      <h1 class="vs-page-title">${y(i.name||t)}</h1>
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
        <a href="/_studio/api/router.php?_path=%2Fforms%2F${encodeURIComponent(t)}%2Fsubmissions%2Fexport" target="_blank" class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </a>
      </div>
    </div>
  `;let l=document.getElementById("form-filter-status"),d=document.getElementById("form-filter-source"),p=document.getElementById("form-filter-search"),c=null,v=()=>zt(t,1);l==null||l.addEventListener("change",v),d==null||d.addEventListener("change",v),p==null||p.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(v,300)}),await zt(t,1)}async function zt(t,e=1){var f,x,m;let s=document.getElementById("form-submissions");if(!s)return;let n=((f=document.getElementById("form-filter-status"))==null?void 0:f.value)||"all",o=((x=document.getElementById("form-filter-source"))==null?void 0:x.value)||"all",i=((m=document.getElementById("form-filter-search"))==null?void 0:m.value)||"",a=`/forms/${encodeURIComponent(t)}/submissions?page=${e}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:l,data:d}=await L.get(a);if(!l||!d){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let p=d.submissions||[],c=d.total||0,v=d.per_page||20,r=Math.ceil(c/v);if(!p.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:h}=await L.get(`/forms/${encodeURIComponent(t)}`),g=h==null?void 0:h.form,u={};g!=null&&g.fields&&g.fields.forEach(C=>{u[C.name]=C.label||C.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${p.map(C=>{let w=xe[C.status]||xe.new,A=Object.entries(C.data||{}).filter(([q])=>!q.startsWith("_")).slice(0,3).map(([q,V])=>{let U=u[q]||q,ee=Array.isArray(V)?V.join(", "):String(V);return`<span class="vs-sub-field"><strong>${y(U)}:</strong> ${y(ee.substring(0,80))}${ee.length>80?"\u2026":""}</span>`}).join(""),j=_o(C.created_at),W=C.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${C.id}" data-form-id="${y(t)}" style="border-left-color: ${w.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${w.bg}; color: ${w.text};">${w.label}</span>
                ${W?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${y(j)}</span>
            </div>
            <div class="vs-submission-preview">
              ${A||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${C.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${C.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;">
                ${Object.entries(xe).map(([q,V])=>`<option value="${q}" ${C.status===q?"selected":""}>${V.label}</option>`).join("")}
              </select>
              <button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${C.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `}).join("")}
    </div>

    ${r>1?`
      <div class="vs-pagination">
        ${e>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${e-1}" data-form-id="${y(t)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${e} of ${r} \xB7 ${c} submission${c!==1?"s":""}</span>
        ${e<r?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${e+1}" data-form-id="${y(t)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${c} submission${c!==1?"s":""}</span>
      </div>
    `}
  `,Io(t,e)}function Io(t,e){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;Ks(t,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{let n=s.dataset.subId,{ok:o}=await L.put(`/forms/${encodeURIComponent(t)}/submissions/${n}`,{status:s.value});if(o){N("Status updated","success");let i=s.closest(".vs-submission-card"),a=xe[s.value];if(i&&a){i.style.borderLeftColor=a.text;let l=i.querySelector(".vs-status-pill");l&&(l.style.background=a.bg,l.style.color=a.text,l.textContent=a.label)}}else N("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.dataset.subId;if(!await be({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await L.delete(`/forms/${encodeURIComponent(t)}/submissions/${n}`);i?(N("Submission deleted","success"),zt(t,e)):N("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);zt(t,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;Ks(t,o)})})}async function Ks(t,e){var v,r,h,g;(v=document.getElementById("submission-detail-overlay"))==null||v.remove();let{ok:s,data:n}=await L.get(`/forms/${encodeURIComponent(t)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(u=>String(u.id)===String(e));if(!o){N("Submission not found","error");return}let{data:i}=await L.get(`/forms/${encodeURIComponent(t)}`),a=i==null?void 0:i.form,l={};if(a!=null&&a.fields&&a.fields.forEach(u=>{l[u.name]=u.label||u.name}),o.status==="new"){await L.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{status:"read"}),o.status="read";let u=document.querySelector(`.vs-sub-status-select[data-sub-id="${e}"]`);u&&(u.value="read");let f=document.querySelector(`.vs-submission-card[data-sub-id="${e}"]`);if(f){f.style.borderLeftColor=xe.read.text;let x=f.querySelector(".vs-status-pill");x&&(x.style.background=xe.read.bg,x.style.color=xe.read.text,x.textContent="Read")}}let d=xe[o.status]||xe.new,p=document.createElement("div");p.id="submission-detail-overlay",p.className="vs-slide-overlay",p.innerHTML=`
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
          ${Object.entries(o.data||{}).filter(([u])=>!u.startsWith("_")).map(([u,f])=>{let x=l[u]||u,m=Array.isArray(f)?f.join(", "):String(f);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${y(x)}</div>
                <div class="vs-sub-detail-field-value">${y(m)}</div>
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
          ${Object.entries(xe).map(([u,f])=>`<option value="${u}" ${o.status===u?"selected":""}>${f.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(p),requestAnimationFrame(()=>{requestAnimationFrame(()=>p.classList.add("is-visible"))});let c=()=>{p.classList.remove("is-visible"),setTimeout(()=>p.remove(),200)};p.addEventListener("click",u=>{u.target===p&&c()}),(r=document.getElementById("close-sub-detail"))==null||r.addEventListener("click",c),(h=document.getElementById("btn-save-sub-notes"))==null||h.addEventListener("click",async()=>{var x;let u=((x=document.getElementById("sub-detail-notes"))==null?void 0:x.value)||"",{ok:f}=await L.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{notes:u});N(f?"Notes saved":"Failed to save notes",f?"success":"error")}),(g=document.getElementById("sub-detail-status"))==null||g.addEventListener("change",async u=>{let f=u.target.value,{ok:x}=await L.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{status:f});if(x){N("Status updated","success");let m=document.querySelector(`.vs-sub-status-select[data-sub-id="${e}"]`);m&&(m.value=f);let C=document.querySelector(`.vs-submission-card[data-sub-id="${e}"]`),w=xe[f];if(C&&w){C.style.borderLeftColor=w.text;let A=C.querySelector(".vs-status-pill");A&&(A.style.background=w.bg,A.style.color=w.text,A.textContent=w.label)}}else N("Failed to update status","error")})}function _o(t){if(!t)return"";let e=Date.now(),s=new Date(t).getTime(),n=e-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(t).toLocaleDateString()}function Ao(){let t=document.getElementById("conversation-history-panel");if(!t)return;t.classList.contains("hidden")?(t.classList.remove("hidden"),Po()):t.classList.add("hidden")}async function Po(){let t=document.getElementById("conversation-list");if(!t)return;t.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:e,data:s,error:n}=await L.get("/ai/conversations");if(!e||!(s!=null&&s.conversations)){t.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${y((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=I.get("activeConversationId");if(o.length===0){t.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}t.innerHTML=o.map(a=>{let l=a.id===i,d=a.title||"Untitled conversation",p=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${l?"vs-conv-item-active":""}"
              data-conversation-id="${y(a.id)}">
        <span class="mt-0.5 shrink-0 ${l?"text-vs-accent":"text-vs-text-ghost"}">${E.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${l?"font-medium":""}" style="font-size: var(--text-sm);">${y(d)}</div>
          <div class="vs-conv-time mt-0.5">${p}</div>
        </div>
        ${l?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),t.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let l=a.dataset.conversationId;Ot(l);let d=document.getElementById("conversation-history-panel");d&&d.classList.add("hidden")})})}async function Ot(t){let e=document.getElementById("chat-messages");if(!e)return;e.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await L.get(`/ai/conversations/${t}`);if(!s||!(n!=null&&n.conversation)){I.set("activeConversationId",null),Vt(null);try{localStorage.removeItem("vs-active-conversation")}catch{}e.innerHTML=rt(),at();return}let i=n.conversation,a=i.prompts||[];I.set("activeConversationId",t),Vt(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",t)}catch{}if(a.length===0){e.innerHTML=rt(),at();return}let l="",d=!1;for(let p of a)if(l+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        <div class="text-sm text-vs-text-primary leading-relaxed">${y(p.user_prompt)}</div>
      </div>
    `,p.ai_response||p.files_modified){let c="",v=typeof p.ai_message=="string"&&p.ai_message.trim()!==""?p.ai_message:p.ai_response;v&&(c=Ft(v));let r="";if(p.files_modified)try{let g=JSON.parse(p.files_modified);if(Array.isArray(g)&&g.length>0){let u=g.map(x=>{let m=typeof x=="string"?x:x.path||x,C=typeof x=="object"&&x.action==="delete";return`<div class="vs-file-badge ${C?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${C?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${y(String(m))}</span>
              </div>`}).join(""),f=g.length;r=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${f} file${f!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${u}</div>
              </div>`}}catch{}let h=p.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${c}</div>
          ${r}
          ${h}
        </div>
      `}else if(p.status==="streaming"){d=!0;let c=p.id;l+=`
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
      `);e.innerHTML=l,e.scrollTop=e.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),d&&!window.__vsResumedToastByConversation[t]&&(N("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[t]=!0),d||delete window.__vsResumedToastByConversation[t],window.__vsCancelStreamingPrompt=async function(p){try{await L.post("/ai/cancel-generation",{prompt_id:p})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[t]="__cancelled__",Ot(t)},d&&I.get("activeConversationId")===t&&!I.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[t]=(window.__vsPollingCount[t]||0)+1,window.__vsPollingCount[t]<=60?setTimeout(()=>{I.get("activeConversationId")===t&&!I.get("aiStreaming")&&Ot(t)},2500):delete window.__vsPollingCount[t]):window.__vsPollingCount&&delete window.__vsPollingCount[t]}function Ho(){I.set("activeConversationId",null),Vt(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let t=document.getElementById("chat-messages");t&&(t.innerHTML=rt(),at());let e=document.getElementById("conversation-history-panel");e&&e.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function ln(t){if(!t)return"Pages";let e=t.replace(/\.(php|html)$/i,"");if(e==="index")return"Home Page";let s=e.split("/");e=s[s.length-1];let n=e.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):e}function Ut(){let t=document.getElementById("scope-label");if(!t)return;let e=window.__vsCurrentPreviewPath||null;t.textContent=ln(e)}function Vt(t){I.set("activePageScope",t||null),Ut(),ht()&&ft()}async function jo(){let t=document.getElementById("vs-pages-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="vs-pages-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("is-visible"));let s=()=>le(e);e.querySelector("#vs-pages-modal-close").addEventListener("click",s),e.addEventListener("click",c=>{c.target===e&&s()}),e.addEventListener("keydown",c=>{c.key==="Escape"&&s()});let n=e.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await L.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${y((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let l=i.pages;if(!l.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${E.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let d='<div style="display: flex; flex-direction: column; gap: 2px;">';l.forEach(c=>{let v=!!Number(c.is_homepage),r=c.title||c.slug||c.path,h=c.path||c.slug+".php",g="/"+h.replace(/\.php$/,"").replace(/^index$/,""),u=g==="/"?"/":g,f=yo(c.slug),m=(window.__vsCurrentPreviewPath||"index.php")===h,C=c.size?(c.size/1024).toFixed(1)+" KB":"";d+=`
      <div class="vs-pages-modal-item ${m?"is-active":""}" data-slug="${y(c.slug)}" data-path="${y(h)}" data-title="${y(r)}" data-url="${y(u)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${f}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(r)}${v?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${y(h)}${C?" \xB7 "+C:""}
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
    `}),d+="</div>",n.innerHTML=d;let p=e.querySelector(".vs-modal-desc");p&&(p.textContent=`${l.length} page${l.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(c=>{c.addEventListener("click",v=>{v.stopPropagation();let r=c.closest(".vs-pages-modal-item"),h=r.dataset.slug,g=r.dataset.path,u=r.dataset.title,f=r.dataset.url,x=c.dataset.action;if(x==="edit")Vt(h),s(),Us(`Edit the "${u}" page (${f}): `);else if(x==="preview"){let m=document.getElementById("preview-iframe");m?(ht()&&ft(),m.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(g)+"&t="+Date.now(),window.__vsCurrentPreviewPath=g,Ut(),s(),N(`Preview: ${u}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(g),"_blank")}else if(x==="delete"){s();let m=`Delete the "${u}" page (${f}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;Us(m)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(c=>{c.addEventListener("click",v=>{if(v.target.closest(".vs-pages-action"))return;let r=c.dataset.path,h=c.dataset.title,g=document.getElementById("preview-iframe");g?(g.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(r)+"&t="+Date.now(),window.__vsCurrentPreviewPath=r,Ut(),s(),N(`Preview: ${h}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(r),"_blank")})})}function at(){document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let e=document.getElementById("prompt-input");e&&(e.value=t.dataset.quickPrompt,e.dataset.actionType=t.dataset.actionType||"free_prompt",e.focus(),e.setSelectionRange(0,e.value.length),e.dispatchEvent(new Event("input",{bubbles:!0})))})})}function rt(){let t=I.get("pages")||[],e=t.length>0,s=new Set(t.map(u=>u.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(u=>{let f=u.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(f)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],l=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],d=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],p=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],c=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],v,r,h;if(!e)r="What are we building?",h="Describe your website and watch it appear in the preview. Every detail is a conversation away.",v=hs(n).slice(0,6);else{r="What\u2019s next?",h="Your site is live in preview. Pick a suggestion or describe any change you want.";let u=[...o,...o,...i,...a,...l,...d,...p,...c];v=hs(u).slice(0,6);let f=new Set;if(v=v.filter(x=>f.has(x.label)?!1:(f.add(x.label),!0)),v.length<6){let x=hs(u).filter(m=>!f.has(m.label));for(let m of x){if(v.length>=6)break;v.push(m),f.add(m.label)}}}let g=v.map(u=>`<button data-quick-prompt="${y(u.prompt).replace(/"/g,"&quot;")}" data-action-type="${u.type}"
      class="vs-style-card">${y(u.label)}</button>`).join(`
        `);return`
    <div class="vs-empty-state">
      <div class="vs-empty-icon vs-animate-in vs-stagger-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
          <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
          <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
        </svg>
      </div>
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${r}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${h}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${g}
      </div>
    </div>
  `}function hs(t){let e=[...t];for(let s=e.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[e[s],e[n]]=[e[n],e[s]]}return e}function Ro(){return`
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
        <button id="btn-publish"
          class="vs-btn vs-btn-primary vs-btn-xs">
          ${E.publish} Publish
        </button>
      </div>
    </footer>
  `}function Do(){return`
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
  `}function dn(){let t=(e,s,n,o,i)=>({id:e,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>un(i)});return[t("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),t("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),t("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),t("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),t("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),t("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),t("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),t("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),t("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),t("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),t("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),t("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),t("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),t("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),t("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),t("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),t("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),t("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),t("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),t("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),t("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),t("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),t("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),t("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),t("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),t("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),t("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),t("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),t("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),t("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),t("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),t("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),t("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),t("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),t("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),t("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),t("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),t("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),t("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),t("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),t("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),t("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),t("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),t("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),t("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),t("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),t("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),t("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),t("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),t("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),t("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),t("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),t("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),t("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),t("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),t("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),t("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),t("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),t("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),t("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),t("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),t("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),t("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),t("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),t("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),t("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),t("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),t("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),t("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),t("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),t("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),t("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),t("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),t("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),t("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),t("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),t("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),t("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),t("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),t("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),t("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),t("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),t("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),t("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),t("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),t("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),t("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),t("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),t("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),t("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),t("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),t("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),t("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),t("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),t("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),t("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),t("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),t("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),t("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function cn(t){try{let e=localStorage.getItem(t);if(!e)return[];let s=JSON.parse(e);return Array.isArray(s)?s:[]}catch{return[]}}function pn(t,e){try{localStorage.setItem(t,JSON.stringify(e))}catch{}}function Gt(){return cn(nn)}function ys(){return cn(sn)}function vn(t){let e=Gt(),s=e.includes(t)?e.filter(o=>o!==t):[...e,t];pn(nn,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};Lt(n.query||"",n.activeIndex||0)}function No(t){let e=ys().filter(n=>n!==t),s=[t,...e].slice(0,8);pn(sn,s)}function un(t){if(I.get("route")!=="chat"){Ve.navigate("chat"),setTimeout(()=>un(t),80);return}let e=document.getElementById("prompt-input");e&&(e.value=t,e.focus(),e.setSelectionRange(0,e.value.length),e.dispatchEvent(new Event("input",{bubbles:!0})))}function mn(t,e="free_prompt",s=!1){if(I.get("route")!=="chat"){Ve.navigate("chat"),setTimeout(()=>mn(t,e,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=t,n.dataset.actionType=e,s?Wt():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function kt(){let t=document.getElementById("command-palette");return!!t&&!t.classList.contains("hidden")}function Ys(t=""){let e=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!e||!s||(e.classList.remove("hidden"),s.value=t,s.focus(),s.select(),Lt(t,0))}function $t(){let t=document.getElementById("command-palette");t&&t.classList.add("hidden")}function Fo(t,e){let s=0,n=0,o=0;for(let i=0;i<e.length&&s<t.length;i++)e[i]===t[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<t.length?null:n}function qo(t,e){let s=(t||"").trim().toLowerCase();if(!s)return 0;let n=`${e.title} ${e.meta} ${e.group} ${e.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=Fo(s,n);return i===null?null:70+i}function zo(t){let e=(t||"").trim().toLowerCase(),s=dn(),n=Gt(),o=ys();return s.map(i=>{let a=qo(e,i);if(a===null)return null;let l=n.includes(i.id)?-12:0,d=o.includes(i.id)?-8:0;return{...i,__score:a+l+d}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function Oo(t){let e=dn(),s=Object.fromEntries(e.map(v=>[v.id,v])),n=(t||"").trim(),o=[];if(n!==""){let v=zo(t).slice(0,18);return v.length>0&&o.push({title:"Results",commands:v}),o}let i=ys(),a=Gt(),l=new Set,d=i.map(v=>s[v]).filter(Boolean);d.length>0&&(o.push({title:"Recent",commands:d}),d.forEach(v=>l.add(v.id)));let p=a.map(v=>s[v]).filter(v=>v&&!l.has(v.id));return p.length>0&&(o.push({title:"Pinned",commands:p}),p.forEach(v=>l.add(v.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(v=>{let r=e.filter(h=>h.group===v&&!l.has(h.id));r.length>0&&(o.push({title:v,commands:r}),r.forEach(h=>l.add(h.id)))}),o}function Lt(t,e=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Oo(t),o=n.flatMap(p=>p.commands),i=Math.max(0,Math.min(e,Math.max(0,o.length-1))),a=Gt();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:t},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let l="",d=0;n.forEach(p=>{l+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${y(p.title)}</div>`,p.commands.forEach(c=>{let v=d===i,r=a.includes(c.id);l+=`
        <div class="flex items-center gap-1.5 px-1 py-0.5 rounded-xl ${v?"bg-vs-bg-inset":""}">
          <button type="button"
            data-command-index="${d}"
            class="flex-1 text-left px-2 py-2 rounded-lg transition-colors ${v?"":"hover:bg-vs-bg-inset/70"}">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm text-vs-text-secondary truncate">${y(c.title)}</div>
                <div class="text-xs text-vs-text-ghost truncate" style="max-width:420px">${y(c.prompt?c.prompt.substring(0,80)+(c.prompt.length>80?"\u2026":""):c.meta)}</div>
              </div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${y(c.id)}"
            class="w-7 h-7 inline-flex items-center justify-center rounded-md text-xs ${r?"text-vs-accent":"text-vs-text-ghost hover:text-vs-text-secondary"}"
            title="${r?"Unpin command":"Pin command"}">
            ${r?"\u2605":"\u2606"}
          </button>
        </div>
      `,d+=1})}),s.innerHTML=l,s.querySelectorAll("[data-command-index]").forEach(p=>{p.addEventListener("click",()=>{let c=parseInt(p.dataset.commandIndex||"0",10);gn(c)})}),s.querySelectorAll("[data-command-pin]").forEach(p=>{p.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let v=p.dataset.commandPin;v&&vn(v)})})}function gn(t=null){let e=window.__vsCommandPalette||{commands:[],activeIndex:0},s=t===null?e.activeIndex:t,n=e.commands[s];n&&(No(n.id),$t(),Promise.resolve(n.run()).catch(()=>{}))}function Uo(){return`
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
  `}function Rt(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function Xe(){try{let t=localStorage.getItem(tn);if(!t)return Rt();let e=JSON.parse(t);return{...Rt(),...e&&typeof e=="object"?e:{},pages:Array.isArray(e==null?void 0:e.pages)?e.pages:Rt().pages}}catch{return Rt()}}function hn(t){try{localStorage.setItem(tn,JSON.stringify(t))}catch{}}function Nt(){let t=document.getElementById("onboarding-modal");t&&t.classList.add("hidden")}function Zs(){let t=window.__vsOnboarding||{step:1,draft:Xe()},e=Math.max(1,Math.min(3,t.step||1)),s=t.draft||Xe(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),l=document.getElementById("btn-onboarding-next"),d=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!l||!d)return;let p=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${e} of 3 \xB7 ${p[e-1]}`,n.innerHTML=p.map((c,v)=>{let r=v+1===e,h=v+1<e;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${r?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":h?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${v+1}. ${y(c)}</div>
      </div>
    `}).join(""),e===1)i.innerHTML=`
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
    `;else if(e===2)i.innerHTML=`
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
    `}a.disabled=e===1,l.classList.toggle("hidden",e===3),d.classList.toggle("hidden",e!==3),Vo()}function Vo(){let t=window.__vsOnboarding||{draft:Xe()},e=()=>{var n,o,i,a,l,d,p,c,v,r,h;t.draft={...t.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||t.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||t.draft.business_type||"",offer:((d=(l=document.getElementById("onboard-offer"))==null?void 0:l.value)==null?void 0:d.trim())||t.draft.offer||"",audience:((c=(p=document.getElementById("onboard-audience"))==null?void 0:p.value)==null?void 0:c.trim())||t.draft.audience||"",style:((v=document.getElementById("onboard-style"))==null?void 0:v.value)||t.draft.style||"modern-minimal",tone:((r=document.getElementById("onboard-tone"))==null?void 0:r.value)||t.draft.tone||"confident",content_mode:((h=document.getElementById("onboard-content-mode"))==null?void 0:h.value)||t.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(t.draft.pages=Array.from(s).filter(g=>g.checked).map(g=>g.dataset.onboardPage).filter(Boolean)),hn(t.draft),window.__vsOnboarding=t};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",e),n.addEventListener("change",e))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",e)})}function Wo(t){let e={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(t.pages&&t.pages.length?t.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=t.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":t.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${t.business_name||"my business"}.`,t.business_type?`Business type: ${t.business_type}.`:"",t.offer?`Core offer: ${t.offer}.`:"",t.audience?`Target audience: ${t.audience}.`:"",`Style preference: ${e[t.style]||"Modern Minimal"}.`,`Copy tone: ${s[t.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function Go(){let t=document.querySelector("[data-onboarding-overlay]");t&&t.addEventListener("click",()=>Nt());let e=document.getElementById("btn-close-onboarding");e&&e.addEventListener("click",()=>Nt());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Xe()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,Zs()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Xe()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,Zs()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:Xe()}).draft||Xe(),l=Wo(a);try{localStorage.setItem(po,"1")}catch{}hn(a),Nt(),mn(l,"create_site",!0)})}function Ko(){let t=document.getElementById("btn-theme-toggle");t&&t.addEventListener("click",()=>{var _,P;let S=ss()==="light";t.innerHTML=S?E.sun:E.moon,t.title=S?"Switch to dark":"Switch to light",window.__vsEditorPage&&((_=window.monaco)!=null&&_.editor)&&window.monaco.editor.setTheme(xt()),document.getElementById("vs-code-editor-overlay")&&((P=window.monaco)!=null&&P.editor)&&window.monaco.editor.setTheme(xt())});let e=document.getElementById("btn-command-palette");e&&e.addEventListener("click",()=>{Ys()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>$t());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{Lt(n.value,0)}),n.addEventListener("keydown",b=>{let S=window.__vsCommandPalette||{commands:[],activeIndex:0};if((b.metaKey||b.ctrlKey)&&b.key.toLowerCase()==="p"){b.preventDefault();let M=S.commands[S.activeIndex];M&&vn(M.id);return}if(b.key==="ArrowDown"){b.preventDefault(),Lt(n.value,S.activeIndex+1);return}if(b.key==="ArrowUp"){b.preventDefault(),Lt(n.value,S.activeIndex-1);return}if(b.key==="Enter"){b.preventDefault(),gn();return}b.key==="Escape"&&(b.preventDefault(),$t())})),Go();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",b=>{b.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",()=>i.classList.add("hidden"),{once:!0}));let a=document.getElementById("btn-edit-profile");a&&i&&a.addEventListener("click",()=>{i.classList.add("hidden")});let l=document.getElementById("btn-logout");l&&l.addEventListener("click",async()=>{await L.post("/auth/logout"),I.set("user",null),window.location.reload()});let d=document.getElementById("btn-undo-status");d&&d.addEventListener("click",()=>{Ne()||Js()});let p=document.getElementById("btn-redo-status");p&&p.addEventListener("click",()=>{Ne()||Qs()});let c=document.getElementById("btn-preview-site");c&&c.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let v=document.getElementById("btn-snapshot");v&&v.addEventListener("click",async()=>{var _;if(Ne())return;v.disabled=!0,Et("Creating snapshot...");let{ok:b,data:S,error:M}=await L.post("/snapshots",{type:"manual",label:"Manual snapshot"});v.disabled=!1,Et(b?`\u2713 Snapshot saved (${((_=S==null?void 0:S.snapshot)==null?void 0:_.file_count)||0} files)`:"\u2717 "+((M==null?void 0:M.message)||"Snapshot failed"),b?"success":"error",4e3)});let r=document.getElementById("btn-download");r&&((async()=>{var _;let{ok:b,data:S}=await L.get("/settings");(_=S==null?void 0:S.settings)!=null&&_.last_published_at||(r.disabled=!0,r.title="Publish your site first to enable download.",r.classList.add("opacity-40"))})(),r.addEventListener("click",()=>{r.disabled||Ne()||Zo()}));let h=document.getElementById("btn-publish");h&&(it(),h.addEventListener("click",async()=>{var ce,H;if(Ne())return;let b=Tt();if(b.publishing)return;if(b.hasChanges===!1){N("No unpublished changes to publish.","warning");return}let S=b.counts||{added:0,modified:0,deleted:0},M=Number(S.added||0)+Number(S.modified||0)+Number(S.deleted||0);if(!await be({title:"Publish Website",description:M>0?`A snapshot will be created automatically before publishing. ${M} unpublished change(s) will go live.`:"A snapshot will be created automatically before publishing.",confirmLabel:"Publish"}))return;b.publishing=!0,it(),Et("Publishing...");let{ok:P,data:G,error:X}=await L.post("/publish");if(b.publishing=!1,P){let pe=((ce=G==null?void 0:G.published)==null?void 0:ce.length)||0,F=((H=G==null?void 0:G.removed)==null?void 0:H.length)||0,Y=F>0?`Published ${pe} file(s), removed ${F} stale file(s).`:`Published ${pe} file(s).`;N(Y,"success"),Et(`\u2713 ${pe} published, ${F} removed`,"success",5e3),I.set("previewDirty",!1),Fe({silent:!0}),window.open("/","_blank")}else N((X==null?void 0:X.message)||"Publish failed.","error"),Et("\u2717 "+((X==null?void 0:X.message)||"Publish failed"),"error",5e3),Fe({silent:!0})}));let g=document.getElementById("resize-handle"),u=document.getElementById("conversation-panel");if(g&&u){let b,S;g.addEventListener("mousedown",M=>{M.preventDefault(),b=M.clientX,S=u.offsetWidth;let _=G=>{let X=G.clientX-b,ce=Math.min(580,Math.max(340,S+X));u.style.width=`${ce}px`,I.set("sidebarWidth",ce)},P=()=>{document.removeEventListener("mousemove",_),document.removeEventListener("mouseup",P)};document.addEventListener("mousemove",_),document.addEventListener("mouseup",P)})}let f=document.getElementById("prompt-input");f&&(f.addEventListener("input",()=>{f.style.height="auto",f.style.height=Math.min(200,f.scrollHeight)+"px"}),f.addEventListener("keydown",b=>{b.key==="Enter"&&(b.metaKey||b.ctrlKey)&&(b.preventDefault(),Wt())}));let x=document.getElementById("btn-send");x&&x.addEventListener("click",Wt),at();let m=document.getElementById("btn-new-chat");m&&m.addEventListener("click",Ho);let C=document.getElementById("btn-scope-selector");C&&C.addEventListener("click",()=>{jo()});let w=document.getElementById("btn-toggle-history");w&&w.addEventListener("click",Ao);let A=document.getElementById("btn-visual-editor");A&&A.addEventListener("click",()=>ds());let j=document.getElementById("btn-edit-code");j&&j.addEventListener("click",()=>{let b=window.__vsCurrentPreviewPath||"index.php";vs(b)});let W=document.getElementById("btn-refresh-preview");W&&W.addEventListener("click",()=>lt());let q=document.querySelectorAll("[data-device]"),V=document.getElementById("preview-frame-container");if(q.length&&V){let b={desktop:"100%",tablet:"768px",mobile:"375px"};q.forEach(S=>{S.addEventListener("click",()=>{let M=S.dataset.device,_=b[M]||"100%";M==="desktop"?(V.style.maxWidth="",V.style.width="",V.style.alignSelf=""):(V.style.maxWidth=_,V.style.width="100%",V.style.alignSelf="center"),q.forEach(P=>{P.classList.remove("vs-device-btn-active"),P.dataset.device===M&&P.classList.add("vs-device-btn-active")})})})}let U=document.getElementById("btn-external-preview");U&&U.addEventListener("click",()=>{let b=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(b),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",b=>{var M,_;let S=(_=(M=b.target)==null?void 0:M.closest)==null?void 0:_.call(M,"[data-code-toggle]");S&&(b.preventDefault(),Qo(S))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",b=>{if((b.metaKey||b.ctrlKey)&&b.key==="k"){b.preventDefault(),kt()?$t():Ys();return}if(b.key==="Escape"&&kt()){b.preventDefault(),$t();return}if(b.key==="Escape"&&Dt()){b.preventDefault(),Nt();return}if((b.metaKey||b.ctrlKey)&&b.key==="z"&&!b.shiftKey){if(kt()||Dt())return;let S=document.activeElement;if(S&&(S.tagName==="INPUT"||S.tagName==="TEXTAREA"))return;b.preventDefault(),Js()}if((b.metaKey||b.ctrlKey)&&b.key==="z"&&b.shiftKey){if(kt()||Dt())return;let S=document.activeElement;if(S&&(S.tagName==="INPUT"||S.tagName==="TEXTAREA"))return;b.preventDefault(),Qs()}if(b.key==="v"&&!b.metaKey&&!b.ctrlKey&&!b.altKey&&!b.shiftKey){if(kt()||Dt())return;let S=document.activeElement;if(S&&(S.tagName==="INPUT"||S.tagName==="TEXTAREA"||S.isContentEditable))return;let M=I.get("route");if(!fs.includes(M))return;b.preventDefault(),ds()}if(b.key==="Escape"&&ht()){b.preventDefault(),ft();return}}));let ee=I.get("route");if(fs.includes(ee))try{let b=I.get("activeConversationId"),S=localStorage.getItem("vs-active-conversation"),M=b||S,_=document.getElementById("chat-messages"),P=_==null?void 0:_.querySelector(".vs-empty-state");M&&!I.get("aiStreaming")?(b||I.set("activeConversationId",M),P&&Ot(M)):M||_&&_.children.length===0&&(_.innerHTML=rt(),at())}catch{}St(),Xo()}function Yo(){let t=document.getElementById("preview-frame-container");if(!t||t.querySelector(".vs-generating-overlay"))return;let e=document.createElement("div");e.className="vs-generating-overlay",e.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">Working on your site</div>
    <div class="vs-gen-subtitle">Content is being generated.<br>This may take a few minutes.</div>
    <div class="vs-gen-note">Please keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-progress"><div class="vs-gen-progress-bar"></div></div>
  `,t.appendChild(e)}function Xs(){let t=document.querySelector(".vs-generating-overlay");t&&(t.classList.add("removing"),t.addEventListener("animationend",()=>t.remove(),{once:!0}),setTimeout(()=>t==null?void 0:t.remove(),600))}function lt(t){let e=document.getElementById("preview-iframe");if(e){let s=t||window.__vsCurrentPreviewPath||"index.php";e.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=lt;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",t=>{typeof t.data=="string"&&t.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=t.data.slice(15),Ut())}));function bs(t){let e=document.getElementById("preview-iframe");if(e&&e.contentWindow)try{e.contentWindow.postMessage(t,"*")}catch{lt()}}window.sendPreviewMessage=bs;async function Js(){(await L.post("/revisions/undo")).ok&&(setTimeout(()=>lt(),300),await St(),Fe({silent:!0}))}async function Qs(){(await L.post("/revisions/redo")).ok&&(setTimeout(()=>lt(),300),await St(),Fe({silent:!0}))}async function St(){let{ok:t,data:e}=await L.get("/revisions/state");if(!t||!e)return;let s=!!e.can_undo,n=!!e.can_redo,o=e.undo_description?`Undo: ${e.undo_description}`:"Nothing to undo",i=e.redo_description?`Redo: ${e.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!s,l.title=o,l.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!n,l.title=i,l.classList.toggle("opacity-40",!n))})}function Tt(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function Et(t,e="neutral",s=0){let n=document.getElementById("status-text");n&&(n.textContent=t,n.className=e==="success"?"text-xs text-vs-success":e==="error"?"text-xs text-vs-error":"text-xs text-vs-text-ghost",window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s>0&&(window.__vsStatusResetTimer=setTimeout(()=>{let o=document.getElementById("status-text");o&&(o.textContent="Ready",o.className="text-xs text-vs-text-ghost",window.__vsStatusResetTimer=null)},s)))}function it(){let t=Tt(),e=document.getElementById("btn-publish"),s=document.getElementById("publish-state-label");if(!e)return;let n=t.counts||{added:0,modified:0,deleted:0},o=Number(n.added||0)+Number(n.modified||0)+Number(n.deleted||0);if(t.publishing){e.disabled=!0,e.innerHTML=`${E.publish} Publishing...`,s&&(s.textContent="Publishing changes...",s.className="text-2xs text-vs-text-tertiary");return}if(t.checking&&t.hasChanges===null){e.disabled=!0,e.innerHTML=`${E.publish} Checking...`,s&&(s.textContent="Checking publish status...",s.className="text-2xs text-vs-text-ghost");return}if(t.error){e.disabled=!1,e.innerHTML=`${E.publish} Publish`,s&&(s.textContent="Status unavailable",s.className="text-2xs text-vs-warning");return}if(t.hasChanges){if(e.disabled=!1,e.innerHTML=`${E.publish} Publish`,e.classList.remove("vs-btn-ghost"),e.classList.add("vs-btn-primary"),s){let i=o===1?"":"s";s.textContent=`${o} unpublished change${i}`,s.className="text-2xs text-vs-accent"}return}e.disabled=!0,e.innerHTML=`${E.publish} Up to date`,e.classList.remove("vs-btn-primary"),e.classList.add("vs-btn-ghost"),s&&(s.textContent="No unpublished changes",s.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=it;function Zo(){let t=document.getElementById("vs-download-modal-overlay");t&&t.remove();let n=Tt().hasChanges===!0?`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>le(o);o.querySelector("#vs-download-close").addEventListener("click",i),o.addEventListener("click",v=>{v.target===o&&i()}),o.addEventListener("keydown",v=>{v.key==="Escape"&&i()});let a=o.querySelector("#vs-download-publish-link");a&&a.addEventListener("click",v=>{v.preventDefault(),i(),setTimeout(()=>{let r=document.getElementById("btn-publish");r&&!r.disabled&&r.click()},400)});let l=o.querySelectorAll(".vs-download-card"),d=o.querySelector("#vs-download-action"),p="php";l.forEach(v=>{v.addEventListener("click",()=>{if(v.classList.contains("is-loading"))return;l.forEach(h=>h.classList.remove("is-selected")),v.classList.add("is-selected"),p=v.dataset.format;let r=p==="php"?"Download PHP":"Download HTML";d.innerHTML=`${E.download} ${r}`})});let c=!1;d.addEventListener("click",async()=>{var v;if(!c){c=!0,d.disabled=!0,d.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',l.forEach(r=>r.style.pointerEvents="none");try{let r=I.get("sessionToken"),h={"Content-Type":"application/json",Accept:"application/zip"};r&&(h["X-VS-Token"]=r);let g=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:h,credentials:"same-origin",body:JSON.stringify({format:p})});if(!g.ok){let A="Export failed.";try{let j=await g.json();A=((v=j==null?void 0:j.error)==null?void 0:v.message)||A}catch{}N(A,"error");return}let f=(g.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),x=f?f[1]:`site-${p}-${new Date().toISOString().slice(0,10)}.zip`,m=await g.blob(),C=URL.createObjectURL(m),w=document.createElement("a");w.href=C,w.download=x,w.style.display="none",document.body.appendChild(w),w.click(),setTimeout(()=>{URL.revokeObjectURL(C),w.remove()},100),N(`\u2713 ${x} downloaded`,"success")}catch{N("Download failed. Check your connection.","error")}finally{c=!1,d.disabled=!1;let r=p==="php"?"Download PHP":"Download HTML";d.innerHTML=`${E.download} ${r}`,l.forEach(h=>h.style.pointerEvents="")}}})}async function Fe({silent:t=!1}={}){let e=Tt();if(e.publishing){it();return}e.checking=!0,t||it();let{ok:s,data:n,error:o}=await L.get("/preview/diff");e.checking=!1,s&&n?(e.hasChanges=!!n.has_changes,e.counts=n.counts||{added:0,modified:0,deleted:0},e.error=null):e.error=(o==null?void 0:o.message)||"Could not check publish status.",it()}window.refreshPublishState=Fe;function Xo(){let t=Tt();t.intervalId&&(clearInterval(t.intervalId),t.intervalId=null),Fe({silent:!0}),t.intervalId=window.setInterval(()=>{document.hidden||Fe({silent:!0})},15e3)}async function Wt(){if(Ne())return;let t=document.getElementById("prompt-input");if(!t)return;let e=t.value.trim();if(!e||I.get("aiStreaming"))return;t.value="",t.style.height="auto";let s=document.getElementById("chat-messages");if(!s)return;let n=`
    <div class="vs-msg-user mb-6 mt-4">
      <div class="vs-msg-user-bubble">${y(e)}</div>
    </div>
  `,o=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,i=`
    <div class="vs-msg-ai mb-6" data-stream-id="${o}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${E.box}</span>
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
  `,a=s.querySelector(".vs-empty-state");a&&a.remove(),s.insertAdjacentHTML("beforeend",n+i),s.scrollTop=s.scrollHeight;let l=s.querySelector(`.vs-msg-ai[data-stream-id="${o}"]`);if(!l)return;let d=l.querySelector('[data-role="typing"]'),p=l.querySelector('[data-role="status"]'),c=l.querySelector('[data-role="status-text"]'),v=l.querySelector('[data-role="stream-content"]'),r=l.querySelector('[data-role="files-section"]'),h=l.querySelector('[data-role="files"]'),g=l.querySelector('[data-role="files-label"]'),u=l.querySelector('[data-role="files-count"]'),f=l.querySelector('[data-role="files-progress"]'),x=l.querySelector('[data-role="error"]'),m=l.querySelector('[data-role="status-timer"]'),C=F=>{F&&F.removeAttribute("hidden")},w=F=>{F&&F.setAttribute("hidden","")},A=Date.now(),j=0,W=Date.now(),q=!1,V=!1,U=setInterval(()=>{let F=Math.floor((Date.now()-A)/1e3),Y=Math.floor(F/60),he=F%60,de=Y>0?`${Y}m ${he}s`:`${he}s`;j>0&&(de+=` \xB7 ${j.toLocaleString()} tokens`),m&&(m.textContent=`\xB7 ${de}`),Date.now()-W>3e5&&!q&&(q=!0,c&&(c.textContent="No data for 5 min \u2014 the model may have stalled",c.style.color="var(--vs-warning, #d97706)"))},1e3);I.set("aiStreaming",!0);let ee=document.getElementById("btn-send");ee&&(ee.disabled=!0,ee.classList.add("opacity-50")),Yo();let b="",S=[],M=!1,_=null,P=!0,G=new AbortController,X=l.querySelector('[data-role="stop-btn"]');X&&X.addEventListener("click",()=>G.abort());let ce=t.dataset.actionType||"free_prompt";delete t.dataset.actionType;let H=t.dataset.actionData,pe=null;if(H){try{pe=JSON.parse(H)}catch{}delete t.dataset.actionData}await nt("/ai/prompt",{user_prompt:e,action_type:ce,page_scope:I.get("activePageScope"),conversation_id:I.get("activeConversationId"),action_data:pe},{signal:G.signal,onConversation(F){if(F){I.set("activeConversationId",F);try{localStorage.setItem("vs-active-conversation",F)}catch{}}},onStatus(F){!V&&r&&!r.hasAttribute("hidden")&&g&&(g.textContent=F),p&&c&&(c.textContent=F,C(p))},onToken(F){b+=F,j+=Math.ceil(F.length/4),W=Date.now(),q=!1,c&&(c.style.color="");let Y=b.trimStart();if(!M&&Y.length>0&&(M=Y.startsWith("{")||Y.startsWith("```json")||Y.startsWith("```")||Y.startsWith("<|")||Y.startsWith("<message>")||Y.startsWith("<file ")||F.includes("<|")||Y.includes("<|channel|>")||Y.includes('"operations"')||Y.includes('"assistant_message"'),M&&v&&(v.innerHTML="")),w(d),v&&M){let he=b.match(/<message>([\s\S]*?)(<\/message>|$)/);if(he){let de=he[1].trim();de&&(C(v),v.innerHTML=Ft(de))}r&&b.includes("<file ")&&C(r)}else v&&(C(v),v.innerHTML=Ft(b),p&&w(p));s.scrollTop=s.scrollHeight},onFile(F){if(S.push(F),r&&C(r),u){let Y=S.length;u.textContent=`${Y} file${Y!==1?"s":""}`}if(h){let Y=F.action==="delete",he=(S.length-1)*60,de=Y?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';h.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${Y?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${he}ms">
            <span class="vs-file-badge-icon">${de}</span>
            <span>${y(F.path)}</span>
          </div>
        `)}_||(P=!0),F.path.endsWith(".css")||(P=!1),clearTimeout(_),_=setTimeout(()=>{bs(P?"voxelsite:reload-css":"voxelsite:reload"),_=null,P=!0},600),s.scrollTop=s.scrollHeight},onDone(F){V=!0,clearTimeout(_),_=null,clearInterval(U),w(d),w(p);let Y=F.files_modified||[],he=S.length>0||Y.length>0;if(r&&he?(w(f),r.classList.add("vs-files-done"),g&&(g.textContent=F.partial?"Files updated (partial)":"Files updated")):r&&!r.hasAttribute("hidden")&&(w(f),w(r)),v)if(F.message)C(v),v.innerHTML=Ft(F.message);else if(M)w(v);else{let ae=v.textContent||"";(ae.includes("<|channel|>")||ae.includes('"operations"')||ae.includes('"assistant_message"')||ae.includes("<file ")||ae.includes("<message>"))&&(w(v),v.innerHTML="")}if(F.truncated&&v){let ae=document.createElement("button");ae.className="vs-btn vs-btn-primary vs-btn-sm mt-3",ae.innerHTML="\u21BB Continue generating...",ae.addEventListener("click",()=>{ae.remove();let $e=document.getElementById("prompt-input");$e&&($e.value="Continue from where you left off. Complete any unfinished files.",$e.dataset.actionType=ce,Wt())}),v.appendChild(ae)}if(F.conversation_id){I.set("activeConversationId",F.conversation_id);try{localStorage.setItem("vs-active-conversation",F.conversation_id)}catch{}}let de=[...S,...Y];if(de.length>0){let ae=de.map(ve=>ve.path||ve),$e=ae.some(ve=>ve==="index.php"),dt=ae.filter(ve=>ve.endsWith(".php")&&!ve.includes("/")&&ve!=="index.php"),Kt=$e&&dt.length>0,qe;Kt?qe="index.php":dt.length>0?qe=dt[0]:qe=$e?"index.php":null,lt(qe),I.set("previewDirty",!0),Fe({silent:!0})}Xs(),rn(),St(),s.scrollTop=s.scrollHeight},onWarning(F){h&&(h.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${y(F)}</div>
        `)},onError(F){clearTimeout(_),_=null,clearInterval(U),w(d),w(p),x&&(x.textContent=F.message||"Something went wrong.",C(x)),Xs(),f&&w(f),r&&S.length>0&&(r.classList.add("vs-files-done"),g&&(g.textContent="Files updated (partial)"))}}),I.set("aiStreaming",!1),ee&&(ee.disabled=!1,ee.classList.remove("opacity-50"))}function en(){var v;on.innerHTML=`
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
            <h1 class="vs-login-title">${we?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${we?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${we?`
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
                ${we?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${we?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${we?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${E.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${we?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${we?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
        ${(I.get("theme")||"light")==="light"?E.sun:E.moon}
      </button>
    </div>
  `;let t=document.getElementById("login-password"),e=document.getElementById("btn-toggle-pw");e&&t&&e.addEventListener("click",()=>{let r=t.type==="password";t.type=r?"text":"password",e.innerHTML=r?E.eyeOff:E.eye,e.title=r?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let r=ss();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=r==="light"?E.sun:E.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(r=>{r.addEventListener("click",()=>{let h=document.getElementById(r.dataset.toggleTarget);if(!h)return;let g=h.type==="password";h.type=g?"text":"password",r.innerHTML=g?E.eyeOff:E.eye,r.title=g?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),l=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var h,g,u;o.classList.add("hidden"),i.classList.remove("hidden");let r=document.getElementById("forgot-content");try{let x=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((h=x==null?void 0:x.data)==null?void 0:h.mode)||"file")==="email"?(r.innerHTML=`
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
          `,(g=document.getElementById("forgot-form"))==null||g.addEventListener("submit",async C=>{var q,V,U;C.preventDefault();let w=document.getElementById("forgot-message"),A=document.getElementById("forgot-email"),j=C.target.querySelector('button[type="submit"]'),W=(q=A==null?void 0:A.value)==null?void 0:q.trim();if(W){j&&(j.disabled=!0,j.textContent="Sending...");try{let b=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:W})})).json();w&&(b.ok?(w.textContent=((V=b.data)==null?void 0:V.message)||"Recovery link sent. Check your inbox.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",A&&(A.value="")):(w.textContent=((U=b.error)==null?void 0:U.message)||"Failed to send recovery email.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),w.classList.remove("hidden"))}catch{w&&(w.textContent="Network error. Please try again.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}finally{j&&(j.disabled=!1,j.textContent="Send Recovery Link")}}})):(r.innerHTML=`
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
          `,n(),(u=document.getElementById("forgot-form"))==null||u.addEventListener("submit",async C=>{var q,V,U;C.preventDefault();let w=document.getElementById("forgot-message"),A=(q=document.getElementById("forgot-email"))==null?void 0:q.value,j=(V=document.getElementById("forgot-new-password"))==null?void 0:V.value;if(!A||!j)return;let W=await L.post("/auth/reset-password",{email:A,new_password:j});W.ok?(w&&(w.textContent="Password reset. You can now sign in with your new password.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",w.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):w&&(w.textContent=((U=W.error)==null?void 0:U.message)||"Reset failed. Make sure the .reset file exists in _data/.",w.className="mb-5 px-4 py-3 text-sm rounded-xl border",w.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",w.classList.remove("hidden"))}))}catch{r.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),l&&l.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let p=new URLSearchParams(window.location.search).get("reset");if(p&&p.length===64&&i&&o){let r=window.location.pathname+window.location.hash;window.history.replaceState(null,"",r),o.classList.add("hidden"),i.classList.remove("hidden");let h=document.getElementById("forgot-content");h&&(h.innerHTML=`
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
      `,n(),(v=document.getElementById("token-reset-form"))==null||v.addEventListener("submit",async g=>{var C,w,A,j;g.preventDefault();let u=document.getElementById("forgot-message"),f=(C=document.getElementById("token-new-password"))==null?void 0:C.value,x=(w=document.getElementById("token-confirm-password"))==null?void 0:w.value,m=g.target.querySelector('button[type="submit"]');if(!f||f.length<8){u&&(u.textContent="Password must be at least 8 characters.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"));return}if(f!==x){u&&(u.textContent="Passwords do not match.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"));return}m&&(m.disabled=!0,m.textContent="Resetting...");try{let q=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:p,new_password:f})})).json();u&&(q.ok?(u.textContent=((A=q.data)==null?void 0:A.message)||"Password reset. You can now sign in.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",u.classList.remove("hidden"),g.target.querySelectorAll("input").forEach(V=>V.disabled=!0),m&&(m.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(u.textContent=((j=q.error)==null?void 0:j.message)||"Reset failed. The link may have expired.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden")))}catch{u&&(u.textContent="Network error. Please try again.",u.className="mb-5 px-4 py-3 text-sm rounded-xl border",u.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",u.classList.remove("hidden"))}finally{m&&(m.disabled=!1,m.textContent="Reset Password")}}))}let c=document.getElementById("login-form");c&&c.addEventListener("submit",async r=>{var x,m,C,w;r.preventDefault();let h=(x=document.getElementById("login-email"))==null?void 0:x.value,g=(m=document.getElementById("login-password"))==null?void 0:m.value,u=document.getElementById("login-error");if(!h||!g)return;let f=await L.post("/auth/login",{email:h,password:g});f.ok&&((C=f.data)!=null&&C.token)?(I.batch(()=>{I.set("user",f.data.user),I.set("sessionToken",f.data.token)}),an()):u&&(u.textContent=((w=f.error)==null?void 0:w.message)||"Invalid email or password.",u.classList.remove("hidden"))}),St()}function Dt(){let t=document.getElementById("onboarding-modal");return!!t&&!t.classList.contains("hidden")}function Ft(t){if(!t)return"";if(!window.marked)return y(t);let e=window.marked.parse(t);return Jo(e)}function Jo(t){if(!t||typeof t!="string")return"";if(!t.includes("<pre"))return t;let e=document.createElement("template");return e.innerHTML=t,e.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),l=a?a.split(`
`):[];if(l.length<=vo)return;let d=l.slice(0,uo).join(`
`)+`
...`,p=document.createElement("div");p.className="vs-code-collapse",p.setAttribute("data-code-collapse","1");let c=document.createElement("pre");c.className="vs-code-collapse-preview",c.setAttribute("data-code-preview","1");let v=document.createElement("code");o!=null&&o.className&&(v.className=o.className),v.textContent=d,c.appendChild(v),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let r=document.createElement("button");r.type="button",r.className="vs-code-collapse-toggle",r.setAttribute("data-code-toggle","1"),r.setAttribute("data-lines",String(l.length)),r.setAttribute("aria-expanded","false"),r.textContent=`More (${l.length} lines)`;let h=n.parentNode;h&&(h.replaceChild(p,n),p.appendChild(c),p.appendChild(n),p.appendChild(r))}),e.innerHTML}function Qo(t){let e=t.closest("[data-code-collapse]");if(!e)return;let s=e.querySelector("[data-code-preview]"),n=e.querySelector("[data-code-full]"),o=t.dataset.lines||"",i=e.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),t.setAttribute("aria-expanded",i?"true":"false"),t.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}an();})();
