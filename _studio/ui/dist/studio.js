(()=>{var xs=t=>{throw TypeError(t)};var Yt=(t,e,s)=>e.has(t)||xs("Cannot "+s);var K=(t,e,s)=>(Yt(t,e,"read from private field"),s?s.call(t):e.get(t)),ge=(t,e,s)=>e.has(t)?xs("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,s),ke=(t,e,s,n)=>(Yt(t,e,"write to private field"),n?n.call(t,s):e.set(t,s),s),De=(t,e,s)=>(Yt(t,e,"access private method"),s);var Se,Te,We,Be,mt,Xt,Zt=class{constructor(e={}){ge(this,mt);ge(this,Se,new Map);ge(this,Te,new Map);ge(this,We,!1);ge(this,Be,new Map);for(let[s,n]of Object.entries(e))K(this,Se).set(s,n)}get(e,s=void 0){return K(this,Se).has(e)?K(this,Se).get(e):s}set(e,s){let n=K(this,Se).get(e);n!==s&&(K(this,Se).set(e,s),K(this,We)?K(this,Be).has(e)?K(this,Be).get(e).newValue=s:K(this,Be).set(e,{newValue:s,oldValue:n}):De(this,mt,Xt).call(this,e,s,n))}update(e){this.batch(()=>{for(let[s,n]of Object.entries(e))this.set(s,n)})}on(e,s){return K(this,Te).has(e)||K(this,Te).set(e,new Set),K(this,Te).get(e).add(s),()=>{var n;(n=K(this,Te).get(e))==null||n.delete(s)}}batch(e){if(K(this,We)){e();return}ke(this,We,!0),K(this,Be).clear();try{e()}finally{ke(this,We,!1);for(let[s,{newValue:n,oldValue:o}]of K(this,Be))De(this,mt,Xt).call(this,s,n,o);K(this,Be).clear()}}toJSON(){return Object.fromEntries(K(this,Se))}};Se=new WeakMap,Te=new WeakMap,We=new WeakMap,Be=new WeakMap,mt=new WeakSet,Xt=function(e,s,n){let o=K(this,Te).get(e);if(o)for(let a of o)try{a(s,n)}catch(l){console.error(`[state] Error in "${e}" listener:`,l)}let i=K(this,Te).get("*");if(i)for(let a of i)try{a(e,s,n)}catch(l){console.error("[state] Error in wildcard listener:",l)}};var P=new Zt({user:null,sessionToken:null,route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});P.on("theme",t=>{localStorage.setItem("vs-theme",t),document.documentElement.setAttribute("data-theme",t)});P.on("sidebarWidth",t=>{localStorage.setItem("vs-sidebar-width",String(t))});var gt,tt,st,nt,ht,ot,Ne,Qt,es,Jt=class{constructor(){ge(this,Ne);ge(this,gt,[]);ge(this,tt,null);ge(this,st,!1);ge(this,nt,null);ge(this,ht,null);ge(this,ot,!1)}on(e,s){let n=[],o=e.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return K(this,gt).push({pattern:e,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(e){return ke(this,tt,e),this}beforeEach(e){return ke(this,nt,e),this}start(){K(this,st)||(ke(this,st,!0),window.addEventListener("hashchange",()=>De(this,Ne,Qt).call(this)),De(this,Ne,Qt).call(this))}navigate(e){window.location.hash=`/${e}`}get current(){return De(this,Ne,es).call(this)}};gt=new WeakMap,tt=new WeakMap,st=new WeakMap,nt=new WeakMap,ht=new WeakMap,ot=new WeakMap,Ne=new WeakSet,Qt=async function(){if(K(this,ot))return;let e=De(this,Ne,es).call(this),s=K(this,ht);if(!(e===s&&K(this,st))){if(K(this,nt)&&s!==null){ke(this,ot,!0);try{if(await K(this,nt).call(this,e,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{ke(this,ot,!1)}}ke(this,ht,e);for(let n of K(this,gt)){let o=e.match(n.regex);if(o){let i={};n.paramNames.forEach((a,l)=>{i[a]=decodeURIComponent(o[l+1])}),P.batch(()=>{P.set("route",n.pattern),P.set("routeParams",i)}),n.handler(i);return}}K(this,tt)?(P.set("route","404"),K(this,tt).call(this,e)):this.navigate("chat")}},es=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var Ge=new Jt;var Es="/_studio/api/router.php";async function It(t,e,s=null,n={}){let o={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(t)){let a=Cs();a&&(o["X-VS-Token"]=a)}s!==null&&(o["Content-Type"]="application/json");let i={method:t,headers:o,credentials:"same-origin",...n};s!==null&&(i.body=JSON.stringify(s));try{let[a,l]=e.split("?"),c=`${Es}?_path=${encodeURIComponent(a)}${l?"&"+l:""}`,p=await fetch(c,i),d=await p.json();return p.status===401?(P.get("user")&&P.set("user",null),d!=null&&d.error?{ok:!1,error:d.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!d.ok&&d.error?(d.error.code==="demo_mode"&&window.showToast&&window.showToast(d.error.message||"Demo mode \u2014 this action is disabled.","warning"),{ok:!1,error:d.error}):{ok:!0,data:d.data||d}}catch{return{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var T={get:(t,e)=>It("GET",t,null,e),post:(t,e,s)=>It("POST",t,e,s),put:(t,e,s)=>It("PUT",t,e,s),delete:(t,e,s)=>It("DELETE",t,e,s)};async function it(t,e,s={}){var w,u;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onFile:a=()=>{},onDone:l=()=>{},onWarning:c=()=>{},onError:p=()=>{},signal:d=null}=s,v=Cs(),r={"Content-Type":"application/json",Accept:"text/event-stream"};v&&(r["X-VS-Token"]=v);let h=!1,g=0,m=0,f=e.conversation_id||null;try{let Q=function(S){if(!S.trim())return;let k="";for(let _ of S.split(`
`))_.startsWith(":")||_.startsWith("data: ")&&(k+=_.slice(6));if(!k)return;let B;try{B=JSON.parse(k)}catch{return}switch(B.type||"message"){case"token":m++,n(B.content||"");break;case"status":o(B.message||"");break;case"conversation":f=B.conversation_id||f,i(B.conversation_id||"");break;case"file_complete":g++,a(B);break;case"done":h=!0,l(B);break;case"warning":c(B.message||"");break;case"error":p(B);break}},C={method:"POST",headers:r,credentials:"same-origin",body:JSON.stringify(e)};d&&(C.signal=d);let[y,H]=t.split("?"),D=`${Es}?_path=${encodeURIComponent(y)}${H?"&"+H:""}`,V=await fetch(D,C);if(!V.ok){let S=await V.json().catch(()=>null);p({code:((w=S==null?void 0:S.error)==null?void 0:w.code)||"http_error",message:((u=S==null?void 0:S.error)==null?void 0:u.message)||`Server error (${V.status})`});return}let F=V.body.getReader(),W=new TextDecoder,G="";for(;;){let{done:S,value:k}=await F.read();if(S)break;G+=W.decode(k,{stream:!0});let B=G.split(`

`);G=B.pop();for(let I of B)Q(I)}if(G.trim()&&Q(G),!h&&g>0){let S=f;S?await ks(S,{onDone:l,onError:p,onFile:a,onStatus:o}):l({files_modified:[],message:"",soft_close:!0})}}catch(C){if(C.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(g>0||m>0){let y=f;y?(o("Server is still generating \u2014 waiting for completion..."),await ks(y,{onDone:l,onError:p,onFile:a,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else p({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function ks(t,{onDone:e,onError:s,onFile:n,onStatus:o}){var l;let a=0;for(let c=0;c<120;c++){await new Promise(p=>setTimeout(p,3e3));try{let{ok:p,data:d}=await T.get(`/ai/conversations/${t}`);if(!p||!((l=d==null?void 0:d.conversation)!=null&&l.prompts))continue;let v=d.conversation.prompts,r=v[v.length-1];if(!r)continue;let h=r.files_modified?JSON.parse(r.files_modified):[];if(h.length>a){for(let g=a;g<h.length;g++)n({path:h[g],action:"write"});a=h.length}if(r.status==="streaming"){let g=Math.round((Date.now()-new Date(r.created_at).getTime())/1e3);o(`Server is still generating... (${g}s)`);continue}r.status==="success"?e({message:r.ai_message||"",files_modified:h,revision_id:r.revision_id||null,polled:!0}):r.status==="partial"?e({message:r.ai_message||"",files_modified:h,partial:!0,polled:!0}):s({code:"generation_failed",message:r.error_message||"Generation failed on the server."});return}catch{}}e({files_modified:[],message:"",partial:!0,soft_close:!0})}function Cs(){return P.get("sessionToken")}var yn="data-theme",ts="dark";function Ls(){let t=P.get("theme")||localStorage.getItem("vs-theme")||ts;return $s(t),t}function $s(t){let e=t||ts;return document.documentElement.setAttribute(yn,e),localStorage.setItem("vs-theme",e),P.set("theme",e),e}function ss(){let t=P.get("theme")||ts;return $s(t==="dark"?"light":"dark")}var Ee=!1,_t=null,Ke=[],ns=!1,Ss=!1,se={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function ds(){Ee=!Ee,As(),ce({type:"vx-editor:toggle",active:Ee}),Ee||(He(),Pe(),at(),_t=null)}function bt(){return Ee}function yt(){Ee&&(Ee=!1,As(),ce({type:"vx-editor:toggle",active:!1}),He(),Pe(),at(),_t=null)}function Ms(){Ss||(Ss=!0,window.addEventListener("message",wn))}function wn(t){if(!(!t.data||typeof t.data!="object")&&!(!t.data.type||!t.data.type.startsWith("vx-editor:"))&&t.origin===window.location.origin)switch(t.data.type){case"vx-editor:select":_t=t.data,xn(t.data);break;case"vx-editor:text-changed":rs(t.data);break;case"vx-editor:image-changed":Yn(t.data);break;case"vx-editor:element-deleted":ls(t.data);break;case"vx-editor:deselect":He(),Pe(),_t=null;break;case"vx-editor:save-request":wt();break}}function xn(t){let e=document.getElementById("vx-context-toolbar");e||(e=document.createElement("div"),e.id="vx-context-toolbar",e.className="vx-context-toolbar",document.body.appendChild(e));let{tagName:s,rect:n,hasText:o,hasImage:i}=t,a=document.getElementById("preview-iframe");if(!a)return;let l=a.getBoundingClientRect();e.style.left=`${l.left+n.left+n.width/2}px`,e.style.top=`${l.top+n.top-8}px`,e.style.transform="translate(-50%, -100%)";let c="";o&&(c+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
      <span>Edit</span></button>`),i&&(c+=`<button class="vx-tb-btn" data-action="swap-image" title="Change image">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Image</span></button>`),c+=`<button class="vx-tb-btn" data-action="edit-style" title="Edit styles">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/></svg>
    <span>Style</span></button>`,s==="A"&&(c+=`<button class="vx-tb-btn" data-action="edit-link" title="Edit link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      <span>Link</span></button>`),c+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-danger" data-action="delete" title="Delete element">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>`,c+=`<div class="vx-tb-divider"></div>
    <button class="vx-tb-btn vx-tb-btn-ai" data-action="ask-ai" title="Edit with AI">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>AI</span></button>`;let p=Ht(s,t.classList);e.innerHTML=`<div class="vx-tb-label">${p}</div><div class="vx-tb-actions">${c}</div>`,e.classList.add("vx-tb-visible"),e.querySelectorAll("[data-action]").forEach(d=>{d.addEventListener("click",v=>{v.stopPropagation(),kn(d.dataset.action,t)})})}function He(){let t=document.getElementById("vx-context-toolbar");t&&t.classList.remove("vx-tb-visible")}function Ht(t,e){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[t]||t.toLowerCase()}function kn(t,e){switch(t){case"edit-text":ce({type:"vx-editor:start-edit",mode:"text"}),He();break;case"swap-image":Wn(e);break;case"edit-style":Cn(e);break;case"edit-link":Kn(e);break;case"delete":En(e);break;case"ask-ai":Vn(e);break}}function En(t){He();let e=Ht(t.tagName,t.classList),s=(t.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${e}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${ft(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>n.remove(),200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),n.addEventListener("click",a=>{a.target===n&&o()}),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{ce({type:"vx-editor:delete-element"}),o()})}var le=new Set,Ye="",Ce=null,jt="text",Me="padding",Ae="all",Ze="all",Ie="tl",Xe="",Fe=!1;function Pe({revertUnsaved:t=!0}={}){t&&Fe&&Ye&&(ce({type:"vx-editor:update-classes",classes:Ye.split(" ").filter(Boolean),silent:!0}),le=new Set(Ye.split(" ").filter(Boolean)));let e=document.getElementById("vx-style-panel");e&&(typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),e.classList.remove("vx-sp-visible"),setTimeout(()=>e.remove(),200)),Fe=!1,Ce=null,jt="text",Me="padding",Ae="all",Ze="all",Ie="tl",Xe=""}function Cn(t){He(),Pe();let e=(t.classList||[]).filter(o=>o.trim());le=new Set(e),Ye=e.join(" "),Fe=!1,Ce=null,jt=Xn(e),Me="padding",Ae="all",Ze="all",Ie="tl",Xe="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${Ht(t.tagName,e)}</span>
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
    </div>`,document.body.appendChild(s),At(s),s.__vxOnResize=()=>At(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=_s(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),Ce=null,he(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>Pe()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),Pe())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{le=new Set(Ye.split(" ").filter(Boolean)),Fe=!1,ce({type:"vx-editor:update-classes",classes:[...le],silent:!0}),he(as())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>On(t)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(Xe=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=is(),he(as()))}),he("typography")}function is(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(e=>{let s=Xe===e.id,n=e.id?[...le].some(o=>o.startsWith(e.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${e.id}" title="${e.tip}">
      ${e.label}${n&&e.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function as(){var t;return((t=document.querySelector(".vx-sp-seg-active"))==null?void 0:t.dataset.tab)||"typography"}function he(t){let e=document.getElementById("vx-sp-body");if(!e)return;let s={typography:Ln,spacing:$n,colors:Sn,layout:Tn,borders:Bn,effects:Mn,classes:In};e.innerHTML=(s[t]||s.classes)(),zn(e)}function Ln(){let t=te(/^font-(sans|serif|mono)$/)||"",e=te(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=te(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=te(/^text-(left|center|right|justify)$/)||"text-left",o=te(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=te(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=te(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",l=te(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ae("Font","^font-(sans|serif|mono)$",t,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${ae("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",e,se.sizes.map(c=>({label:c,value:`text-${c}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ae("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,se.weights.map(c=>({label:c,value:`font-${c}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${_n(se.aligns.map(c=>({value:`text-${c}`,label:c,icon:Nn(c)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${ae("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,se.leadings.map(c=>({label:c,value:`leading-${c}`})))}
        ${ae("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,se.trackings.map(c=>({label:c,value:`tracking-${c}`})))}
        ${ae("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,se.transforms.map(c=>({label:c,value:c})))}
        ${ae("Decoration","^(no-underline|underline|line-through)$",l,se.decorations.map(c=>({label:c,value:c})))}
      </div>
    </div>
  `}function $n(){let t={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};t[Me]||(Me="padding"),t[Me].prefixes[Ae]||(Ae="all");let e=t[Me],s=e.prefixes[Ae],n=Hn(s),o=Rn(s)||"",i=Me==="margin";return`
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
        ${se.compactSpacings.map(a=>{let l=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Je(l)?" vx-sp-pill-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${Je(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function Sn(){let t=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],e=jt||"text",s=e,n=jn(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${t.map(a=>`<button class="vx-sp-cprop${a.id===e?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${se.specialColors.map(a=>{let l=`${s}-${a.name}`,c=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,p=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${Je(l)?" vx-sp-dot-active":""}" data-set="${l}" data-pattern="${n}" style="${c}${p}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=Ce?se.colors.find(a=>a.name===Ce):null;return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-stage">
      ${i?`
        <div class="vx-shade-stage-header">
          <button class="vx-shade-back" data-family-back>&larr; Colors</button>
          <span class="vx-shade-title">${i.name}</span>
        </div>
        <div class="vx-shade-grid">${Object.entries(i.shades).map(([a,l])=>{let c=`${s}-${i.name}-${a}`;return`<button class="vx-sp-shade${Je(c)?" vx-sp-shade-active":""}" data-set="${c}" data-pattern="${n}" data-toggle="false" style="background:${l}" title="${a}"><span class="vx-sp-shade-num">${a}</span></button>`}).join("")}</div>
      `:`
        <div class="vx-sp-color-families">${se.colors.map(a=>{let l=Ce===a.name,c=te(new RegExp(`^${s}-${a.name}-\\d+$`));return`<button class="vx-sp-color-family${l?" vx-sp-fam-active":""}${c?" vx-sp-fam-used":""}" data-family="${a.name}" style="background:${a.shades[500]}" title="${a.name}"></button>`}).join("")}</div>
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
          ${ae("Direction","^flex-(row|col|row-reverse|col-reverse)$",te(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${ae("Justify","^justify-(start|center|end|between|around|evenly)$",te(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${ae("Align","^items-(start|center|end|stretch|baseline)$",te(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${ae("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...se.gaps.map(c=>({label:c,value:`gap-${c}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${ae("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...se.gridCols.map(c=>({label:c,value:`grid-cols-${c}`}))])}
          ${ae("Rows","^grid-rows-\\d+$",l,[{label:"Auto",value:""},...se.gridRows.map(c=>({label:c,value:`grid-rows-${c}`}))])}
          ${ae("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...se.gaps.slice(1).map(c=>({label:c,value:`gap-${c}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${ae("Position","^(static|relative|absolute|fixed|sticky)$",e,se.positions.map(c=>({label:c,value:c})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${ae("Top","^top-",te(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",se.coordinates.map(c=>({label:c,value:`top-${c}`})))}
          ${ae("Right","^right-",te(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",se.coordinates.map(c=>({label:c,value:`right-${c}`})))}
          ${ae("Bottom","^bottom-",te(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",se.coordinates.map(c=>({label:c,value:`bottom-${c}`})))}
          ${ae("Left","^left-",te(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",se.coordinates.map(c=>({label:c,value:`left-${c}`})))}
        </div>
      </div>
    `:""}
  `}function Bn(){let t={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},e=Ze==="all"?"all":Ie;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${se.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${Je(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${ae("Style","^border-(solid|dashed|dotted|double|none)$",te(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...se.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${Is([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],Ze==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${Ie==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${Ie==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${Ie==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${Ie==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${Ze==="all"?"ALL":Ie.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${se.radii.map(s=>{let n=Fn(e,s);return`<button class="vx-sp-pill vx-sp-pill-compact${Je(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${qn(e)}" data-toggle="false">${t[s]}</button>`}).join("")}
      </div>
    </div>
  `}function Mn(){let t=Un();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${Je(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
        ${[...le].map(t=>`<span class="vx-sp-class" data-class="${t}">${t} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function ae(t,e,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${t}</label>
    <select class="vx-sp-select" data-select-pattern="${e}">
      ${n.map(o=>`<option value="${Pt(o.value)}"${s===o.value?" selected":""}>${ft(o.label)}</option>`).join("")}
    </select>
  </div>`}function Is(t,e,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${t.map(i=>`<button class="vx-sp-segment-btn${i.value===e?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${ft(i.label)}</button>`).join("")}
  </div>`}function _n(t,e,s){return`<div class="vx-icon-segment">
    ${t.map(n=>`
      <button class="vx-icon-segment-btn${n.value===e?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${Pt(n.label)}">
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
  </div>`}function Pn(){let t=te(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return t==="inline-flex"?"flex":t==="inline-grid"?"grid":t==="inline-block"?"block":t}function Hn(t){return t==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":t==="gap-x"?"^gap-x-(?:[\\d.]+)$":t==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${t}-(?:auto|[\\d.]+)$`}function jn(t){return`^${t}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function Rn(t){let e=te(new RegExp(`^${t}-(auto|[\\d.]+)$`));return e?e.replace(`${t}-`,""):""}function Ts(t){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[t]||t}function Dn(t){let e=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:e('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:e('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:e('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:e('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:e('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:e('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:e('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[t]||t}function Nn(t){let e=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:e('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[t]||t}function Fn(t,e){let s=e===""?"":`-${e}`;if(t==="all")return e===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[t]||"rounded-tl";return e===""?n:`${n}${s}`}function qn(t){return t==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[t]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function Un(){let t=te(/^opacity-(\d+)$/);if(!t)return 100;let e=parseInt(t.replace("opacity-",""),10);return Number.isNaN(e)?100:Math.min(100,Math.max(0,e))}function Je(t){let e=Xe;return le.has(e?e+":"+t:t)}function os(t,e,{toggle:s=!0,rerender:n=!0}={}){let o=Xe,i=o?o+":":"",a=e?new RegExp(e):null,l=t?i+t:"",c=!!l&&le.has(l);if(a)for(let d of[...le])if(o){if(d.startsWith(i)){let v=d.slice(i.length);a.test(v)&&le.delete(d)}}else!/^(sm|md|lg|xl|2xl):/.test(d)&&a.test(d)&&le.delete(d);l&&(!s||!c)&&le.add(l),Fe=!0,ce({type:"vx-editor:update-classes",classes:[...le],silent:!0});let p=document.getElementById("vx-sp-breakpoints");p&&(p.innerHTML=is()),n&&he(as())}function te(t){let e=Xe;for(let s of le)if(e){if(s.startsWith(e+":")){let n=s.slice(e.length+1);if(t.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&t.test(s))return s;return null}function zn(t){t.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";os(o,i,{toggle:a,rerender:!0})})}),t.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";os(i,o,{toggle:!1,rerender:!0})})}),t.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{Ce=Ce===n.dataset.family?null:n.dataset.family,he("colors")})}),t.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{Ce=null,he("colors")})}),t.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{jt=n.dataset.cprop||"text",Ce=null,he("colors")})}),t.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Me=n.dataset.spaceMode||"padding",Ae="all",he("spacing")})}),t.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{Ae=n.dataset.spaceSide||"all",he("spacing")})}),t.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{Ze=n.dataset.radiusMode==="corners"?"corners":"all",he("borders")})}),t.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{Ie=n.dataset.radiusCorner||"tl",Ze="corners",he("borders")})});let e=t.querySelector("#vx-opacity-slider");if(e){let n=()=>{let i=String(e.value||"100"),a=t.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(e.value||"100");os(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};e.addEventListener("input",o),e.addEventListener("change",()=>he("effects"))}let s=t.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{le.add(i)}),Fe=!0,ce({type:"vx-editor:update-classes",classes:[...le],silent:!0}),s.value="",he("classes"))}),t.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;le.delete(i),Fe=!0,ce({type:"vx-editor:update-classes",classes:[...le],silent:!0}),o.remove()}}})}async function On(t){let e=[...le].join(" ");if(e===Ye){Pe({revertUnsaved:!1});return}Ke.push({type:"text",filePath:t.filePath,originalHTML:`class="${Ye}"`,newHTML:`class="${e}"`,timestamp:Date.now()}),Fe=!1,Pe({revertUnsaved:!1}),re("Saving & compiling\u2026"),await wt(),ce({type:"vx-editor:update-classes",classes:[...le],silent:!0}),setTimeout(()=>{let s=document.getElementById("preview-iframe");s&&s.contentWindow&&s.contentWindow.postMessage("voxelsite:reload","*")},500)}function _s(t,e){let s=!1,n,o,i,a,l=!1,c=v=>{if(v.target.closest("button, input, select"))return;s=!0;let r=v.touches?v.touches[0]:v;n=r.clientX,o=r.clientY;let h=t.getBoundingClientRect();i=h.left,a=h.top,e.style.cursor="grabbing",v.preventDefault(),l||(l=!0,document.addEventListener("mousemove",p),document.addEventListener("touchmove",p,{passive:!1}),document.addEventListener("mouseup",d),document.addEventListener("touchend",d))},p=v=>{if(!s)return;let r=v.touches?v.touches[0]:v,h=12,g=t.getBoundingClientRect(),m=g.width||300,f=g.height||500,w=i+r.clientX-n,u=a+r.clientY-o,C=h,y=Math.max(h,window.innerWidth-m-h),H=52,D=Math.max(H,window.innerHeight-f-h),V=Math.min(Math.max(w,C),y),F=Math.min(Math.max(u,H),D);t.style.left=`${V}px`,t.style.top=`${F}px`,t.style.right="auto"},d=()=>{s&&(s=!1,e.style.cursor="",l&&(l=!1,document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",d),document.removeEventListener("touchend",d)))};return e.addEventListener("mousedown",c),e.addEventListener("touchstart",c,{passive:!1}),()=>{e.removeEventListener("mousedown",c),e.removeEventListener("touchstart",c),l&&(document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",d),document.removeEventListener("touchend",d))}}var _e=null;function at(){let t=document.getElementById("vx-ai-panel");t&&(_e&&(_e.abort(),_e=null),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),t.classList.remove("vx-ai-visible"),setTimeout(()=>t.remove(),180))}function Vn(t){He(),Pe(),at();let e=Ht(t.tagName,t.classList),s=(t.text||"").substring(0,80).replace(/\s+/g," ").trim(),n=document.createElement("div");n.id="vx-ai-panel",n.className="vx-ai-panel",n.tabIndex=-1,n.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${ft(e)}</span>
      </div>
      <div class="vx-ai-header-right">
        <span class="vx-sp-drag-hint">\u22EE\u22EE</span>
        <button class="vx-sp-close" id="vx-ai-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    ${s?`<div class="vx-ai-preview">${ft(s.length>=78?s+"\u2026":s)}</div>`:""}
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
    </div>`,document.body.appendChild(n),At(n),n.__vxOnResize=()=>At(n),window.addEventListener("resize",n.__vxOnResize),requestAnimationFrame(()=>n.classList.add("vx-ai-visible")),n.__vxDestroyDrag=_s(n,n.querySelector("#vx-ai-drag-handle"));let o=n.querySelector("#vx-ai-input"),i=n.querySelector("#vx-ai-send"),a=n.querySelector("#vx-ai-cancel-btn"),l=n.querySelector("#vx-ai-status"),c=n.querySelector("#vx-ai-status-text"),p=n.querySelector("#vx-ai-close");setTimeout(()=>o==null?void 0:o.focus(),200),p.addEventListener("click",()=>at()),n.addEventListener("keydown",h=>{h.key==="Escape"&&(h.preventDefault(),at())}),o.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),r())}),i.addEventListener("click",r),a.addEventListener("click",()=>{_e&&(_e.abort(),_e=null),v()});function d(){o.disabled=!0,i.hidden=!0,a.hidden=!1,l.hidden=!1,c.textContent="Reading your site\u2026"}function v(){o.disabled=!1,i.hidden=!1,a.hidden=!0,l.hidden=!0,o.focus()}async function r(){let h=o.value.trim();if(!h)return;at(),ce({type:"vx-editor:show-ai-overlay",status:"AI is editing\u2026"}),_e=new AbortController;let g=t.outerHTML||"",m=t.filePath||cs();try{await it("/ai/prompt",{user_prompt:h,action_type:"section_edit",page_scope:m,action_data:{path:m,sectionHtml:g.substring(0,15e3)}},{signal:_e.signal,onStatus(f){ce({type:"vx-editor:update-ai-status",status:f||"Working\u2026"})},onFile(){ce({type:"vx-editor:update-ai-status",status:"Applying changes\u2026"})},onToken(){ce({type:"vx-editor:update-ai-status",status:"Generating\u2026"})},onError(f){ce({type:"vx-editor:hide-ai-overlay"}),re(f.message||"AI edit failed",!0)},onDone(f){if(_e=null,ce({type:"vx-editor:hide-ai-overlay"}),f.cancelled){re("Generation cancelled",!1);return}(f.files_modified||[]).length>0?(re("Section updated \u2713"),setTimeout(()=>{let u=document.getElementById("preview-iframe");u!=null&&u.contentWindow&&u.contentWindow.postMessage("voxelsite:reload","*")},400)):f.partial||re("No changes made",!1)},onWarning(f){typeof window.showToast=="function"&&window.showToast(f,"warning")}})}catch(f){f.name!=="AbortError"&&re("AI edit failed",!0),ce({type:"vx-editor:hide-ai-overlay"})}}}function Wn(t){He();let e=document.createElement("div");e.className="vx-modal-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("vx-modal-visible"));let s=()=>{e.classList.remove("vx-modal-visible"),e.removeEventListener("keydown",n),setTimeout(()=>e.remove(),200)},n=o=>{o.key==="Escape"&&s()};e.addEventListener("keydown",n),e.querySelector("[data-close]").addEventListener("click",s),e.addEventListener("click",o=>{o.target===e&&s()}),e.tabIndex=-1,e.focus(),Gn(e)}async function Gn(t){let e=t.querySelector("#vx-img-grid");try{let s=await T.get("/assets");if(!s.ok){e.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){e.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}e.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),e.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",()=>{ce({type:"vx-editor:swap-image",src:o.dataset.path}),t.classList.remove("vx-modal-visible"),setTimeout(()=>t.remove(),200)})})}catch{e.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function Kn(t){He();let e=document.createElement("div");e.className="vx-modal-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${Pt(t.href||"")}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${Pt(t.text||"")}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("vx-modal-visible"));let s=()=>{e.classList.remove("vx-modal-visible"),e.removeEventListener("keydown",n),setTimeout(()=>e.remove(),200)},n=o=>{o.key==="Escape"&&s()};e.addEventListener("keydown",n),e.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",s)),e.addEventListener("click",o=>{o.target===e&&s()}),document.getElementById("vx-link-save").addEventListener("click",()=>{ce({type:"vx-editor:update-link",href:document.getElementById("vx-link-href").value.trim(),text:document.getElementById("vx-link-text").value.trim()}),s()}),setTimeout(()=>{var o;return(o=document.getElementById("vx-link-href"))==null?void 0:o.focus()},100)}async function Yn(t){let{filePath:e,oldSrc:s,newSrc:n,alt:o}=t,i=e||cs();try{let a=await T.get(`/files/content?path=${encodeURIComponent(i)}`);if(!a.ok){console.warn("[VX] Cannot read file for image save:",i),re("Save failed",!0);return}let l=a.data.content,c=!1,p=`src="${s}"`;if(l.includes(p)&&(l=l.replace(p,`src="${n}"`),c=!0),!c&&l.includes(s)&&(l=l.replace(s,n),c=!0),!c&&o){let v=Bs(l,o,n);v!==!1&&(l=v,c=!0)}if(c){(await T.put("/files/content",{path:i,content:l})).ok?re("Saved"):re("Save failed",!0);return}let d=await T.get("/files");if(d.ok){let v=(d.data.files||[]).filter(r=>r.path.endsWith(".php")&&r.path!==i);for(let r of v){let h=await T.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!h.ok||!h.data.content)continue;let g=h.data.content;if(g.includes(p)&&(g=g.replace(p,`src="${n}"`),(await T.put("/files/content",{path:r.path,content:g})).ok)){re(`Saved \u2192 ${r.path.split("/").pop()}`);return}if(g.includes(s)&&(g=g.replace(s,n),(await T.put("/files/content",{path:r.path,content:g})).ok)){re(`Saved \u2192 ${r.path.split("/").pop()}`);return}if(o){let m=Bs(g,o,n);if(m!==!1&&(await T.put("/files/content",{path:r.path,content:m})).ok){re(`Saved \u2192 ${r.path.split("/").pop()}`);return}}}}console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),re("Save failed \u2014 source not found",!0)}catch(a){console.error("[VX] Image save error:",a),re("Save failed",!0)}}function Bs(t,e,s){let n=t.split("<img");for(let o=1;o<n.length;o++){let i=n[o];if(!i.includes(`alt="${e}"`)&&!i.includes(`alt='${e}'`))continue;let a=i.indexOf("src=");if(a===-1)continue;let l=i[a+4];if(l!=='"'&&l!=="'")continue;let c=a+5,p=i.indexOf(l,c);if(p!==-1)return n[o]=i.substring(0,c)+s+i.substring(p),n.join("<img")}return!1}function rs(t){Ke.push({type:"text",filePath:t.filePath,originalHTML:t.originalHTML,newHTML:t.newHTML,timestamp:Date.now()}),clearTimeout(rs._timer),rs._timer=setTimeout(()=>wt(),800)}function ls(t){Ke.push({type:"delete",filePath:t.filePath,outerHTML:t.outerHTML,timestamp:Date.now()}),clearTimeout(ls._timer),ls._timer=setTimeout(()=>wt(),300)}async function wt(){var e;if(ns||Ke.length===0)return;ns=!0;let t=[...Ke];Ke=[];try{let s={};for(let i of t){let a=i.filePath||cs();s[a]||(s[a]=[]),s[a].push(i)}let n=!1,o={filesByMain:new Map,contentByPath:new Map};for(let[i,a]of Object.entries(s))try{let l=await T.get(`/files/content?path=${encodeURIComponent(i)}`);if(!l.ok){console.error("[VX] Cannot read:",i);continue}let c=l.data.content,p=!1;for(let d of a){let v=d.type==="delete"?d.outerHTML:d.originalHTML;if(v)if(c.includes(v))c=d.type==="delete"?c.replace(v,""):c.replace(v,d.newHTML),p=!0;else{if(await Zn(i,d,o)){n=!0;continue}console.warn("[VX] Not found in source:",v.substring(0,80))}}if(p){let d=await T.put("/files/content",{path:i,content:c});d.ok?(re("Saved"),(e=d.data)!=null&&e.tailwindCompiled&&(n=!0)):re("Save failed",!0)}}catch(l){console.error("[VX] Save error:",l),re("Save failed",!0)}n&&setTimeout(()=>{let i=document.getElementById("preview-iframe");i!=null&&i.contentWindow&&i.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{ns=!1,Ke.length>0&&setTimeout(()=>wt(),0)}}async function Zn(t,e,s=null){let n=e.type==="delete"?e.outerHTML:e.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(t);if(!a){let l=await T.get("/files");if(!l.ok)return!1;a=(l.data.files||[]).filter(c=>c.path.endsWith(".php")&&c.path!==t).filter(c=>o.some(p=>c.path.includes(p+"/"))||c.path.includes("partial")||c.path.includes("header")||c.path.includes("footer")||c.path.includes("nav")),i.filesByMain.set(t,a)}for(let l of a){let c=i.contentByPath.get(l.path);if(c==null){let p=await T.get(`/files/content?path=${encodeURIComponent(l.path)}`);if(!p.ok||!p.data.content)continue;c=p.data.content,i.contentByPath.set(l.path,c)}if(c.includes(n)){let p=e.type==="delete"?c.replace(n,""):c.replace(n,e.newHTML);if((await T.put("/files/content",{path:l.path,content:p})).ok)return i.contentByPath.set(l.path,p),re(`Saved \u2192 ${l.path.split("/").pop()}`),!0}}}catch(a){console.error("[VX] Partial search error:",a)}return!1}function As(){let t=document.getElementById("btn-visual-editor");t&&(t.classList.toggle("vx-editor-active",Ee),t.title=Ee?"Exit visual editor (V)":"Visual editor (V)"),document.body.classList.toggle("vx-editing",Ee)}function re(t,e=!1){if(typeof window.showToast=="function"){window.showToast(t,e?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=t,s.classList.toggle("vx-save-error",e),s.classList.add("vx-save-visible"),clearTimeout(re._timer),re._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function ce(t){let e=document.getElementById("preview-iframe");if(e!=null&&e.contentWindow)try{e.contentWindow.postMessage(t,"*")}catch{}}function cs(){return window.__vsCurrentPreviewPath||"index.php"}function At(t){let e=document.getElementById("preview-iframe"),s=t.offsetWidth||300,n=t.offsetHeight||520,o=32,i=56;if(!e){t.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,t.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=e.getBoundingClientRect(),l=a.right-s-o,c=Math.max(o,a.left+10),p=Math.max(o,window.innerWidth-s-o),d=Math.min(Math.max(l,c),p),v=Math.max(a.top+12,i),r=Math.max(i,window.innerHeight-n-o),h=Math.min(v,r);t.style.left=`${d}px`,t.style.top=`${h}px`,t.style.right="auto"}function Xn(t){let e=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return t.some(s=>e(s,"bg"))?"bg":t.some(s=>e(s,"border"))?"border":(t.some(s=>e(s,"text")),"text")}function Pt(t){return(t||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function ft(t){return(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var E={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'};var Ps=typeof document<"u"?document.createElement("span"):null;function b(t){return t?(Ps.textContent=t,Ps.innerHTML):""}var Jn={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function xt(t=""){let e=String(t||"").toLowerCase();for(let[s,n]of Object.entries(Jn))if(e.endsWith(s))return n;return"plaintext"}function Qn(){let t=document.getElementById("vs-toast-container");return t||(t=document.createElement("div"),t.id="vs-toast-container",t.className="vs-toast-container",document.body.appendChild(t),t)}function j(t,e="success",s=3200){if(!t)return;let n=Qn(),o=document.createElement("div"),i=["success","error","warning"].includes(e)?e:"success";o.className=`vs-toast vs-toast-${i}`,o.innerHTML=`<span>${b(String(t))}</span>`,n.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(6px)",setTimeout(()=>o.remove(),220)},s)}window.showToast=j;function pe(t){t.classList.remove("is-visible"),setTimeout(()=>t.remove(),350)}function be({title:t="Confirm Action",description:e="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var d,v;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let l=document.createElement("div");l.id="vs-confirm-overlay",l.className="vs-modal-overlay",l.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${b(t)}</h2>
          <p class="vs-modal-desc">${b(e)}</p>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">${b(n)}</button>
          <button id="vs-confirm-ok" class="vs-btn ${o?"vs-btn-danger":"vs-btn-primary"} vs-btn-sm" type="button">${b(s)}</button>
        </div>
      </div>
    `;let c=r=>{r.key==="Escape"&&(r.preventDefault(),p(!1))},p=r=>{document.removeEventListener("keydown",c),pe(l),i(r)};document.body.appendChild(l),requestAnimationFrame(()=>l.classList.add("is-visible")),l.addEventListener("click",r=>{r.target===l&&p(!1)}),(d=document.getElementById("vs-confirm-cancel"))==null||d.addEventListener("click",()=>p(!1)),(v=document.getElementById("vs-confirm-ok"))==null||v.addEventListener("click",()=>p(!0)),document.addEventListener("keydown",c),setTimeout(()=>{var r;return(r=document.getElementById("vs-confirm-ok"))==null?void 0:r.focus()},220)})}function ps({title:t="Enter Value",description:e="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text"}){return new Promise(l=>{var h,g;let c=document.getElementById("vs-prompt-overlay");c&&c.remove();let p=document.createElement("div");p.id="vs-prompt-overlay",p.className="vs-modal-overlay";let d=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${b(n)}" style="resize: vertical;">${b(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${b(n)}" value="${b(o)}">`;p.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${b(t)}</h2>
          ${e?`<p class="vs-modal-desc">${b(e)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${b(s)}</label>`:""}
          ${d}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${b(i)}</button>
        </div>
      </div>
    `;let v=m=>{pe(p),l(m)};document.body.appendChild(p),requestAnimationFrame(()=>p.classList.add("is-visible"));let r=p.querySelector("#vs-prompt-input");setTimeout(()=>r==null?void 0:r.focus(),220),p.addEventListener("click",m=>{m.target===p&&v(null)}),(h=p.querySelector("#vs-prompt-cancel"))==null||h.addEventListener("click",()=>v(null)),(g=p.querySelector("#vs-prompt-ok"))==null||g.addEventListener("click",()=>{v(((r==null?void 0:r.value)||"").trim())}),r==null||r.addEventListener("keydown",m=>{a==="textarea"?m.key==="Enter"&&(m.metaKey||m.ctrlKey)&&(m.preventDefault(),v(((r==null?void 0:r.value)||"").trim())):m.key==="Enter"&&(m.preventDefault(),v(((r==null?void 0:r.value)||"").trim())),m.key==="Escape"&&(m.preventDefault(),v(null))})})}var kt=null;function Hs(){return`
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
  `}async function js(){var ws;let t=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),e={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(t==null?void 0:t.fontSize)||13,wordWrap:(t==null?void 0:t.wordWrap)||!1,expandedFolders:new Set((t==null?void 0:t.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((t==null?void 0:t.expandedSections)||["site","config","prompts"]),_pendingRestore:t?{tabs:t.openTabs||[],active:t.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!e||!e.openTabs?!1:e.openTabs.some(x=>x.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:e.openTabs.map(x=>x.path),activeTab:e.activeTab,fontSize:e.fontSize,wordWrap:e.wordWrap,expandedFolders:[...e.expandedFolders],expandedSections:[...e.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),e.disposed=!0,e.monacoInstance&&(e.monacoInstance.dispose(),e.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),l=document.getElementById("editor-host"),c=document.getElementById("editor-empty-state"),p=document.getElementById("editor-monaco-container"),d=document.getElementById("editor-file-info"),v=document.getElementById("editor-status"),r=document.getElementById("editor-save-btn"),h=document.getElementById("editor-refresh-tree"),g=document.getElementById("editor-new-file"),m=document.getElementById("editor-sidebar"),f=document.getElementById("editor-sidebar-resize"),w=document.getElementById("editor-font-size-select"),u=document.getElementById("editor-word-wrap-btn");w&&(w.value=e.fontSize);let C=()=>{u&&(e.wordWrap?(u.style.color="var(--vs-accent)",u.style.backgroundColor="var(--vs-accent-dim)"):(u.style.color="var(--vs-text-ghost)",u.style.backgroundColor="transparent"))};C();let y=(x,$="muted")=>{v&&(v.textContent=x,v.dataset.state=$)},H=x=>{let $=e.files.find(M=>M.path===x);return($==null?void 0:$.readonly)===!0},D=x=>{let $=x.toLowerCase();return $.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':$.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':$.endsWith(".js")||$.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},V=(x,$="")=>{let M=[],A={},R=q=>{if(A[q])return A[q];let N=q.split("/"),X=N[N.length-1],Y=N.slice(0,-1).join("/"),J=$?$+q:q,me={name:X,path:J,type:"folder",children:[]};return A[q]=me,Y?R(Y).children.push(me):M.push(me),me};for(let q of x){let X=($&&q.path.startsWith($)?q.path.substring($.length):q.path).split("/");if(X.length===1)M.push({name:X[0],path:q.path,type:"file",meta:q});else{let Y=X.slice(0,-1).join("/");R(Y).children.push({name:X[X.length-1],path:q.path,type:"file",meta:q})}}let U=q=>{q.sort((N,X)=>N.type!==X.type?N.type==="folder"?-1:1:N.name.localeCompare(X.name));for(let N of q)N.type==="folder"&&U(N.children)};return U(M),M},F=()=>{if(!n)return;let x=(U,q=0)=>U.map(N=>{var et,Mt;if(N.type==="folder"){let ut=e.expandedFolders.has(N.path);return`
            <div class="vs-tree-item" data-folder="${b(N.path)}" style="--tree-indent: ${q};">
              <span class="vs-tree-folder-toggle" data-expanded="${ut}">${E.chevronRight}</span>
              <span class="vs-tree-item-icon">${ut?E.folderOpen||E.folder:E.folder}</span>
              <span class="vs-tree-item-name">${b(N.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${b(N.path)}" data-collapsed="${!ut}">
              ${x(N.children,q+1)}
            </div>
          `}let X=e.activeTab===N.path,Y=e.openTabs.find(ut=>ut.path===N.path),J=Y!=null&&Y.dirty?" \u2022":"",vt=H(N.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",$e=((et=N.meta)==null?void 0:et.custom)===!0,Oe=((Mt=N.meta)==null?void 0:Mt.protected)===!0,Ve="";return N.path==="assets/css/tailwind.css"?Ve=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:Oe?$e&&(Ve=`
            <button class="vs-tree-item-restore" data-restore-file="${b(N.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):Ve=`
            <button class="vs-tree-item-delete" data-delete-file="${b(N.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${b(N.path)}" data-active="${X}" style="--tree-indent: ${q};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${D(N.path)}</span>
            <span class="vs-tree-item-name">${b(N.name)}${vt}${J}</span>
            ${Ve}
          </div>
        `}).join(""),$=(U,q,N)=>{let X=N.querySelector(".vs-explorer-caret");e.expandedSections.has(U)?(q.style.display="block",N.classList.add("is-expanded")):(q.style.display="none",N.classList.remove("is-expanded"))},M=document.querySelector('[data-section="site"]'),A=document.querySelector('[data-section="config"]'),R=document.querySelector('[data-section="prompts"]');M&&$("site",n,M),A&&o&&$("config",o,A),R&&i&&$("prompts",i,R),n.innerHTML=x(e.treeData.site),o&&(o.innerHTML=x(e.treeData.config)),i&&(i.innerHTML=x(e.treeData.prompts)),pt()},W=()=>{if(a){if(e.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=e.openTabs.map(x=>{let $=x.path===e.activeTab,M=x.path.split("/").pop(),R=H(x.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${b(x.path)}" data-active="${$}" data-dirty="${x.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${b(M)}${R}</span>
          <button class="vs-editor-tab-close" data-close-tab="${b(x.path)}" title="Close">${E.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',Kt(),k()}},G=null,Q=x=>{if(!a)return;let $=8,M=()=>{a.scrollLeft+=x==="left"?-$:$,k()};M(),G=setInterval(M,16)},S=()=>{G&&(clearInterval(G),G=null)},k=()=>{let x=document.getElementById("editor-tab-scroll-left"),$=document.getElementById("editor-tab-scroll-right");if(!a||!x||!$)return;let M=a.scrollLeft>0,A=a.scrollLeft<a.scrollWidth-a.clientWidth-1;x.style.display=M?"flex":"none",$.style.display=A?"flex":"none"};a&&(a.addEventListener("scroll",k,{passive:!0}),window.addEventListener("resize",k,{passive:!0}));let B=document.getElementById("editor-tab-scroll-left"),I=document.getElementById("editor-tab-scroll-right");B&&(B.addEventListener("mousedown",()=>Q("left")),B.addEventListener("mouseup",S),B.addEventListener("mouseleave",S)),I&&(I.addEventListener("mousedown",()=>Q("right")),I.addEventListener("mouseup",S),I.addEventListener("mouseleave",S));let _=()=>{c&&(c.style.display="none"),p&&(p.style.display=""),e.monacoInstance&&e.monacoInstance.layout()},z=async x=>{if(e.disposed)return;let $=e.openTabs.find(q=>q.path===x);if($){await Z(x);return}y("Loading\u2026");let{ok:M,data:A,error:R}=await T.get(`/files/content?path=${encodeURIComponent(x)}`);if(!M){j((R==null?void 0:R.message)||"Could not load file.","error"),y("Load failed","error");return}let U=typeof(A==null?void 0:A.content)=="string"?A.content:"";$={path:x,baseline:U,dirty:!1},e.openTabs.push($),_(),await Z(x),L(U,x),y("Ready"),s()},Z=async x=>{if(e.disposed)return;let $=e.openTabs.find(A=>A.path===e.activeTab);$&&e.monacoInstance&&($._buffer=e.monacoInstance.getValue()),e.activeTab=x;let M=e.openTabs.find(A=>A.path===x);if(M&&e.monacoInstance){let A=M._buffer!==void 0?M._buffer:M.baseline;L(A,x)}ne(),ee(),W(),setTimeout(()=>{if(a){let A=a.querySelector('.vs-editor-tab[data-active="true"]');if(A){let R=A.getBoundingClientRect(),U=a.getBoundingClientRect();R.left<U.left?a.scrollBy({left:R.left-U.left,behavior:"smooth"}):R.right>U.right&&a.scrollBy({left:R.right-U.right,behavior:"smooth"})}}},10),F(),s()},ie=async x=>{let $=e.openTabs.find(A=>A.path===x);if($!=null&&$.dirty&&!await be({title:"Discard unsaved changes?",description:`"${x}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let M=e.openTabs.findIndex(A=>A.path===x);if(M!==-1){if(e.openTabs.splice(M,1),e.activeTab===x){let A=e.openTabs[Math.min(M,e.openTabs.length-1)];A?await Z(A.path):(e.activeTab=null,O(),ne(),ee())}W(),F(),s()}},de=async x=>{var q;if((q=window.demoGuard)!=null&&q.call(window))return;let $=x.split("/").pop();if(!await be({title:"Delete file?",description:`Are you sure you want to permanently delete "${$}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;y("Deleting\u2026");let{ok:A,error:R}=await T.delete(`/files?path=${encodeURIComponent(x)}`);if(!A){j((R==null?void 0:R.message)||"Could not delete file.","error"),y("Delete failed","error");return}let U=e.openTabs.findIndex(N=>N.path===x);if(U!==-1){if(e.openTabs.splice(U,1),e.activeTab===x){let N=e.openTabs[Math.min(U,e.openTabs.length-1)];N?await Z(N.path):(e.activeTab=null,O(),ne(),ee())}W()}await ue(),s(),j(`Deleted ${$}`,"success"),y("Ready")},ve=async x=>{var q;if((q=window.demoGuard)!=null&&q.call(window))return;let $=x.split("/").pop();if(!await be({title:"Reset system prompt?",description:`Are you sure you want to reset "${$}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;y("Resetting\u2026");let{ok:A,error:R}=await T.delete(`/files?path=${encodeURIComponent(x)}`);if(!A){j((R==null?void 0:R.message)||"Could not reset file.","error"),y("Reset failed","error");return}let U=e.openTabs.findIndex(N=>N.path===x);if(U!==-1){let{ok:N,data:X}=await T.get(`/files/content?path=${encodeURIComponent(x)}`);if(N&&typeof(X==null?void 0:X.content)=="string"){let Y=e.openTabs[U];Y.baseline=X.content,Y.dirty=!1,Y._buffer=X.content,e.activeTab===x&&L(X.content,x)}}ee(),await ue(),s(),j(`Reset ${$} to default`,"success"),y("Ready")},L=(x,$)=>{if(!e.monacoInstance||!e.monaco)return;let M=e.monacoInstance.getModel();M&&(e.monacoInstance.setValue(x),e.monaco.editor.setModelLanguage(M,xt($)),e.monacoInstance.updateOptions({readOnly:window.IS_DEMO||H($)}))},O=()=>{c&&(c.style.display=""),p&&(p.style.display="none")},ne=()=>{if(!d)return;if(!e.activeTab){d.textContent="No file open";return}let x=e.openTabs.find(R=>R.path===e.activeTab),$=e.files.find(R=>R.path===e.activeTab),M=$!=null&&$.size?`${(Number($.size)/1024).toFixed(1)} KB`:"",A=xt(e.activeTab).toUpperCase();d.textContent=[e.activeTab,A,M].filter(Boolean).join(" \u2022 ")},ee=()=>{if(!r)return;let x=e.openTabs.find(M=>M.path===e.activeTab);if(e.activeTab?H(e.activeTab):!1){r.disabled=!0,r.textContent="Read-Only",r.classList.remove("vs-btn-primary"),r.classList.add("vs-btn-ghost");return}if(!x||!x.dirty){r.disabled=!0,r.textContent="Saved",r.classList.remove("vs-btn-primary"),r.classList.add("vs-btn-ghost");return}r.disabled=!1,r.textContent="Save",r.classList.remove("vs-btn-ghost"),r.classList.add("vs-btn-primary")},oe=()=>{let x=e.openTabs.find(A=>A.path===e.activeTab);if(!x||!e.monacoInstance)return;let $=e.monacoInstance.getValue(),M=x.dirty;x.dirty=$!==x.baseline,M!==x.dirty&&(ee(),W(),x.dirty?y("Unsaved changes","warning"):y("Ready"))},Le=async()=>{var U,q,N,X;if((U=window.demoGuard)!=null&&U.call(window))return;let x=e.openTabs.find(Y=>Y.path===e.activeTab);if(!x||!x.dirty||!e.monacoInstance)return;let $=e.monacoInstance.getValue();r.disabled=!0,r.textContent="Saving\u2026",y("Saving\u2026");let{ok:M,error:A}=await T.put("/files/content",{path:x.path,content:$});if(!M){r.disabled=!1,r.textContent="Save",j((A==null?void 0:A.message)||"Could not save file.","error"),y("Save failed","error");return}x.baseline=$,x.dirty=!1,x._buffer=$,ee(),W(),F(),y("Saved","success"),j(`Saved ${x.path}`,"success"),x.path.toLowerCase().endsWith(".css")?(q=window.sendPreviewMessage)==null||q.call(window,"voxelsite:reload-css"):(N=window.sendPreviewMessage)==null||N.call(window,"voxelsite:reload"),setTimeout(()=>{var Y;return(Y=window.refreshPreview)==null?void 0:Y.call(window)},400),(X=window.refreshPublishState)==null||X.call(window,{silent:!0});let R=e.openTabs.find(Y=>Y.path==="assets/css/tailwind.css");R&&x.path!=="assets/css/tailwind.css"&&T.get("/files/content?path=assets/css/tailwind.css").then(({ok:Y,data:J})=>{Y&&typeof(J==null?void 0:J.content)=="string"&&(R.baseline=J.content,R._buffer=J.content,e.activeTab==="assets/css/tailwind.css"&&e.monacoInstance&&e.monacoInstance.setValue(J.content))})},pt=()=>{let x=$=>{$&&($.querySelectorAll("[data-file]").forEach(M=>{M.addEventListener("click",A=>{A.target.closest("[data-delete-file]")||z(M.dataset.file)})}),$.querySelectorAll("[data-delete-file]").forEach(M=>{M.addEventListener("click",A=>{A.stopPropagation(),de(M.dataset.deleteFile)})}),$.querySelectorAll("[data-restore-file]").forEach(M=>{M.addEventListener("click",A=>{A.stopPropagation(),ve(M.dataset.restoreFile)})}),$.querySelectorAll("[data-compile-tailwind]").forEach(M=>{M.addEventListener("click",async A=>{var J;if(A.stopPropagation(),(J=window.demoGuard)!=null&&J.call(window))return;M.style.opacity="0.4",M.style.pointerEvents="none",y("Compiling Tailwind\u2026");let{ok:R,data:U,error:q}=await T.post("/files/compile-tailwind");if(M.style.opacity="",M.style.pointerEvents="",!R){j((q==null?void 0:q.message)||"Tailwind compilation failed.","error"),y("Compile failed","error");return}let N="assets/css/tailwind.css",X=e.openTabs.find(me=>me.path===N);X&&(X.baseline=U.content,X.dirty=!1,e.activeTab===N&&e.monacoInstance&&e.monacoInstance.setValue(U.content));let Y=U.class_count??0;j(`Tailwind CSS recompiled \u2014 ${Y} utilities.`,"success"),y("Compiled")})}),$.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(M=>{M.addEventListener("click",A=>{A.stopPropagation();let U=M.closest(".vs-tree-item").dataset.folder;e.expandedFolders.has(U)?e.expandedFolders.delete(U):e.expandedFolders.add(U),s(),F()})}))};x(n),x(o),x(i),document.querySelectorAll(".vs-explorer-section-header").forEach($=>{$.dataset.bound||($.dataset.bound="true",$.addEventListener("click",()=>{let M=$.dataset.section;e.expandedSections.has(M)?e.expandedSections.delete(M):e.expandedSections.add(M),s(),F()}))})},Kt=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(x=>{x.addEventListener("click",$=>{$.target.closest("[data-close-tab]")||Z(x.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(x=>{x.addEventListener("click",$=>{$.stopPropagation(),ie(x.dataset.closeTab)})}))};if(f&&m){let x=!1;f.addEventListener("mousedown",$=>{$.preventDefault(),x=!0,f.classList.add("is-dragging");let M=R=>{if(!x)return;let U=Math.min(400,Math.max(200,R.clientX));m.style.width=U+"px"},A=()=>{x=!1,f.classList.remove("is-dragging"),document.removeEventListener("mousemove",M),document.removeEventListener("mouseup",A)};document.addEventListener("mousemove",M),document.addEventListener("mouseup",A)})}r==null||r.addEventListener("click",Le),w==null||w.addEventListener("change",x=>{let $=parseInt(x.target.value,10);e.fontSize=$,e.monacoInstance&&e.monacoInstance.updateOptions({fontSize:$}),s()}),u==null||u.addEventListener("click",()=>{e.wordWrap=!e.wordWrap,C(),e.monacoInstance&&e.monacoInstance.updateOptions({wordWrap:e.wordWrap?"on":"off"}),s()}),h==null||h.addEventListener("click",()=>ue()),g==null||g.addEventListener("click",async()=>{var q,N;if((q=window.demoGuard)!=null&&q.call(window))return;let x=await ps({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!x||!x.trim())return;let $=x.trim(),M=(N=$.split(".").pop())==null?void 0:N.toLowerCase(),A=["php","css","js","json"];if(!M||!A.includes(M)){j(`Only ${A.join(", ")} files can be created.`,"warning");return}y("Creating\u2026");let{ok:R,error:U}=await T.post("/files/create",{path:$});if(!R){j((U==null?void 0:U.message)||"Could not create file.","error"),y("Create failed","error");return}await ue(),await z($),j(`Created ${$}`,"success")});let ze=x=>{if(e.disposed){document.removeEventListener("keydown",ze);return}(x.metaKey||x.ctrlKey)&&x.key==="s"&&(x.preventDefault(),Le())};document.addEventListener("keydown",ze);let ue=async()=>{var A;let{ok:x,data:$,error:M}=await T.get("/files");if(!x||!((A=$==null?void 0:$.files)!=null&&A.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}e.files=$.files,e.treeData={site:V($.files.filter(R=>!R.path.startsWith("_prompts/")&&!R.path.startsWith("_root/"))),config:V($.files.filter(R=>R.path.startsWith("_root/")),"_root/"),prompts:V($.files.filter(R=>R.path.startsWith("_prompts/")),"_prompts/")},F()},fn=async()=>{if(!p)return;let x;try{x=await Rs()}catch{j("Monaco editor is not available.","warning");return}e.monaco=x;let $=Et();x.editor.setTheme($);let M=x.editor.create(p,{value:"",language:"php",theme:$,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:e.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:e.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});e.monacoInstance=M,M.onDidChangeModelContent(()=>oe()),M.addCommand(x.KeyMod.CtrlCmd|x.KeyCode.KeyK,async()=>{if(e.monacoInstance.getOption(x.editor.EditorOption.readOnly)){j("Cannot use inline AI on a read-only file.","warning");return}let A=e.activeTab;if(!A)return;let R=e.monacoInstance.getModel(),U=e.monacoInstance.getSelection(),q=R.getValueInRange(U);if(!q||q.trim()===""){let J=e.monacoInstance.getPosition(),me=R.getLineContent(J.lineNumber);if(me.trim()===""){j("Highlight a block of code to edit.","warning");return}q=me,e.monacoInstance.setSelection(new x.Range(J.lineNumber,1,J.lineNumber,R.getLineMaxColumn(J.lineNumber)))}let N=await ps({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!N)return;let X=e.monacoInstance.getValue();e.monacoInstance.updateOptions({readOnly:!0});let Y=document.createElement("div");Y.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",Y.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${E.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,p&&(p.style.position="relative",p.appendChild(Y)),y("AI is editing...","muted");try{await it("/ai/prompt",{user_prompt:N,action_type:"inline_edit",action_data:{path:A,selection:q}},{onStatus:J=>{let me=document.getElementById("ai-inline-status");me&&(me.textContent="Generating...")},onFile:()=>{let J=document.getElementById("ai-inline-status");J&&(J.textContent="Applying changes...")},onError:J=>{j(J.message||"Generation failed","error")},onDone:async J=>{var vt;if((vt=J.files_modified)==null?void 0:vt.some($e=>(typeof $e=="string"?$e:($e==null?void 0:$e.path)||"").replace(/^\//,"")===A.replace(/^\//,""))){let{ok:$e,data:Oe}=await T.get(`/files/content?path=${encodeURIComponent(A)}&_t=${Date.now()}`);if($e&&(Oe!=null&&Oe.content)){let Ve=Oe.content;await T.put("/files/content",{path:A,content:X}),e.monacoInstance.getModel().setValue(Ve);let et=e.openTabs.find(Mt=>Mt.path===A);et&&(et._buffer=Ve,et.baseline=X),oe(),j("Review changes and save.","success")}}else J.partial||j("Complete (No changes made to this file)","info")}})}finally{e.monacoInstance.updateOptions({readOnly:!1}),Y.parentNode&&Y.parentNode.removeChild(Y),y("Ready","muted")}})};if(await Promise.all([ue(),fn()]),e._pendingRestore&&e._pendingRestore.tabs.length>0){let{tabs:x,active:$}=e._pendingRestore;e._pendingRestore=null;for(let M of x){if(!e.files.some(U=>U.path===M))continue;let{ok:A,data:R}=await T.get(`/files/content?path=${encodeURIComponent(M)}`);A&&typeof(R==null?void 0:R.content)=="string"&&e.openTabs.push({path:M,baseline:R.content,dirty:!1})}if(e.openTabs.length>0){let M=$&&e.openTabs.find(A=>A.path===$)?$:e.openTabs[0].path;_(),await Z(M),L(((ws=e.openTabs.find(A=>A.path===M))==null?void 0:ws.baseline)||"",M),y("Ready")}}}function Et(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function Rs(){var t;return(t=window.monaco)!=null&&t.editor?window.monaco:kt||(kt=new Promise((e,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,l){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{e(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(e=>{throw kt=null,e}),kt)}async function vs(t=""){var F,W,G,Q;let e=document.getElementById("vs-code-editor-overlay");e&&e.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),l=s.querySelector("#vs-code-meta"),c=s.querySelector("#vs-code-status"),p=s.querySelector("#vs-code-editor-host"),d={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},v=(S,k="muted")=>{c&&(c.textContent=S,c.dataset.state=k)},r=()=>d.files.find(S=>S.path===d.path)||null,h=()=>!!d.editor&&d.editor.getValue()!==d.baseline,g=()=>{if(!l)return;let S=r();if(!S){l.textContent="No file selected";return}let k=S.size?`${(Number(S.size)/1024).toFixed(1)} KB`:"0 KB",B=S.modified?new Date(S.modified).toLocaleString():"Unknown date";l.textContent=`${S.path} \u2022 ${k} \u2022 ${B}`},m=()=>{if(!o)return;let S=h();o.disabled=!S,o.textContent=S?"Save Changes":"Saved",S?v("Unsaved changes","warning"):d.path&&v("Saved","success")},f=async()=>{var S;d.closed||h()&&!await be({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(d.closed=!0,(S=d.editorCleanup)!=null&&S.dispose&&(d.editorCleanup.dispose(),d.editorCleanup=null),d.editor&&(d.editor.dispose(),d.editor=null),pe(s))},w=(S,k=null)=>{if(!d.editor)return;d.editor.setValue(S),d.baseline=S;let B=(k==null?void 0:k.language)||xt(d.path);d.editor.setLanguage&&d.editor.setLanguage(B),g(),m()},u=async(S,{silent:k=!1}={})=>{if(!S||!d.editor)return!1;d.path=S,k||v("Loading file\u2026");let{ok:B,data:I,error:_}=await T.get(`/files/content?path=${encodeURIComponent(S)}`);if(!B)return j((_==null?void 0:_.message)||"Could not load file.","error"),v("Load failed","error"),!1;let z=typeof(I==null?void 0:I.content)=="string"?I.content:"";return w(z,(I==null?void 0:I.file)||r()),!0},C=async()=>h()?await be({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,y=async S=>{if(!S||S===d.path)return;if(!await C()){n&&(n.value=d.path);return}await u(S)},H=async()=>{var I,_,z;if(!d.editor||!d.path||!o)return;let S=d.editor.getValue();if(S===d.baseline){m();return}o.disabled=!0,o.textContent="Saving\u2026",v("Saving\u2026");let{ok:k,error:B}=await T.put("/files/content",{path:d.path,content:S});if(!k){o.disabled=!1,o.textContent="Save Changes",j((B==null?void 0:B.message)||"Could not save file.","error"),v("Save failed","error");return}d.baseline=S,m(),v("Saved","success"),j(`Saved ${d.path}`,"success"),d.path.toLowerCase().endsWith(".css")?(I=window.sendPreviewMessage)==null||I.call(window,"voxelsite:reload-css"):(_=window.sendPreviewMessage)==null||_.call(window,"voxelsite:reload"),setTimeout(()=>{var Z;return(Z=window.refreshPreview)==null?void 0:Z.call(window)},400),(z=window.refreshPublishState)==null||z.call(window,{silent:!0})},D=S=>{S.key==="Escape"&&(S.preventDefault(),f())};a==null||a.addEventListener("click",()=>f()),i==null||i.addEventListener("click",async()=>{!d.path||!await C()||await u(d.path)}),o==null||o.addEventListener("click",()=>H()),n==null||n.addEventListener("change",S=>{y(S.target.value)}),s.addEventListener("click",S=>{S.target===s&&f()}),document.addEventListener("keydown",D);let V=()=>document.removeEventListener("keydown",D);s.addEventListener("transitionend",()=>{document.body.contains(s)||V()});try{let S=await T.get("/files");if(!S.ok||!((W=(F=S.data)==null?void 0:F.files)!=null&&W.length)){let _=((G=S.error)==null?void 0:G.message)||"No editable files found.";j(_,"error"),f();return}let k=S.data.files;d.files=k,n&&(n.innerHTML=k.map(_=>{let z=_.group?`${String(_.group).toUpperCase()} \xB7 `:"";return`<option value="${b(_.path)}">${b(z+_.path)}</option>`}).join(""));let B=((Q=k.find(_=>_.path===t))==null?void 0:Q.path)||k[0].path;d.path=B,n&&(n.value=B),p.innerHTML="";let I=null;try{I=await Rs()}catch{j("Monaco is not available yet. Using fallback editor.","warning"),v("Fallback editor active","warning")}if(I!=null&&I.editor){let _=Et();I.editor.setTheme(_);let z=I.editor.create(p,{value:"",language:xt(B),theme:_,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});d.editor={getValue:()=>z.getValue(),setValue:Z=>z.setValue(Z),setLanguage:Z=>{let ie=z.getModel();ie&&I.editor.setModelLanguage(ie,Z)},dispose:()=>z.dispose()},d.editorCleanup=z.onDidChangeModelContent(()=>{m()})}else{p.innerHTML='<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"></textarea>';let _=p.querySelector("#vs-code-editor-fallback"),z=()=>m();_==null||_.addEventListener("input",z),d.editor={getValue:()=>(_==null?void 0:_.value)||"",setValue:Z=>{_&&(_.value=Z)},setLanguage:()=>{},dispose:()=>{_==null||_.removeEventListener("input",z)}}}await u(B,{silent:!0}),v("Ready")}catch(S){j((S==null?void 0:S.message)||"Could not initialize code editor.","error"),f()}finally{let S=new MutationObserver(()=>{document.body.contains(s)||(V(),S.disconnect())});S.observe(document.body,{childList:!0,subtree:!0})}}function Us(){return setTimeout(()=>qe(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function qe(){var I,_,z,Z,ie,de,ve;let t=document.getElementById("settings-content");if(!t)return;let[e,s,n,o,i,a,l]=await Promise.all([T.get("/settings"),T.get("/settings/system"),T.get("/settings/mail"),T.get("/settings/usage"),T.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),T.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),T.get("/settings/logs")]),c=((I=l.data)==null?void 0:I.logs)||[],p=((_=e.data)==null?void 0:_.settings)||{},d=((z=s.data)==null?void 0:z.system)||{},v=p.site_favicon||null,r=v?`/${v}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),h=null,g=null;try{i.ok&&((Z=i.data)!=null&&Z.content)&&(h=JSON.parse(i.data.content))}catch{}try{a.ok&&((ie=a.data)!=null&&ie.content)&&(g=JSON.parse(a.data.content))}catch{}let m=h||g,f=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},w=p.available_providers||{},u=((de=n.data)==null?void 0:de.config)||{},C=((ve=n.data)==null?void 0:ve.presets)||{},y=Object.keys(w),H=p.ai_provider||"claude",V=(w[H]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],F=p[`ai_${H}_model`]||"",W=p[`ai_${H}_api_key_set`]||!1,G=y.map(L=>{let O=w[L];return`<option value="${b(L)}" ${L===H?"selected":""}>${b(O.name)}</option>`}).join(""),Q="";for(let L of V)L.key==="api_key"?Q+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${b(L.label)}${L.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${W?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${b(L.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${W?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':L.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${b(L.help_text||"Optional for local servers")}</p>`}
          ${L.help_url?`<a href="${L.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${b(L.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:L.key==="base_url"&&(Q+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${b(L.label)}${L.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${b(p.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${b(L.placeholder)}" />
          ${L.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${b(L.help_text)}</p>`:""}
        </div>`);t.innerHTML=`
    <!-- Card: Site Identity -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">Site Identity</h2>
      <p class="vs-settings-card-subtitle">Your website name and description.</p>
      <div class="flex flex-col gap-4">
        <div>
          <label for="set-site-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Site Name</label>
          <input id="set-site-name" type="text" value="${b(p.site_name||"")}"
            class="vs-input" />
        </div>
        <div>
          <label for="set-site-tagline" class="block text-sm font-medium text-vs-text-secondary mb-1">Tagline</label>
          <input id="set-site-tagline" type="text" value="${b(p.site_tagline||"")}"
            class="vs-input"
            placeholder="A short description of your site" />
        </div>

        <!-- Favicon -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-2">Favicon</label>
          <div class="vs-favicon-zone" id="vs-favicon-zone">
            <div class="vs-favicon-preview" id="vs-favicon-preview">
              <img src="${r}" alt="Current favicon" class="vs-favicon-img" id="vs-favicon-img"
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
            ${G}
          </select>
        </div>

        <div id="settings-config-fields">
          ${Q}
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
            <option value="none" ${u.driver==="none"?"selected":""}>Not configured</option>
            <option value="php_mail" ${u.driver==="php_mail"?"selected":""}>PHP mail()</option>
            <option value="smtp" ${u.driver==="smtp"?"selected":""}>SMTP</option>
            <option value="mailpit" ${u.driver==="mailpit"?"selected":""}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${u.driver==="smtp"?"block":"none"};">
          <div class="flex flex-col gap-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(C).map(([L,O])=>`<option value="${b(L)}">${b(O.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${b(u.smtp_host||"")}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${u.smtp_port||587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${u.smtp_encryption==="tls"?"selected":""}>TLS (STARTTLS)</option>
                  <option value="ssl" ${u.smtp_encryption==="ssl"?"selected":""}>SSL</option>
                  <option value="none" ${u.smtp_encryption==="none"?"selected":""}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${b(u.smtp_username||"")}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${u.smtp_password||""}"
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
        <div id="mail-mailpit-fields" style="display: ${u.driver==="mailpit"?"block":"none"};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${b(u.mailpit_host||"localhost")}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${u.mailpit_port||1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${u.driver==="none"?"none":"block"};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${b(u.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${b(u.from_name||"")}"
            class="vs-input"
            placeholder="Your Site Name" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender name on notification emails.</p>
        </div>

        <div class="border-t border-vs-border-subtle my-2"></div>

        <!-- Test Email -->
        <div>
          <label class="block text-sm font-medium text-vs-text-secondary mb-1">Test Email</label>
          <div class="flex gap-2">
            <input id="set-mail-test-recipient" type="email" value="${b(p.user_email||"")}"
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

    ${m?`
    <!-- Card: AI Knowledge -->
    <div class="vs-settings-card">
      <h2 class="vs-settings-card-title">AI Knowledge</h2>
      <p class="vs-settings-card-subtitle">What the AI knows about your site. These values are learned from your conversations.</p>
      <div class="vs-knowledge-cards">
        ${h?`
        <button class="vs-knowledge-card" id="btn-view-memory">
          <div class="vs-knowledge-card-icon">${E.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(h).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${E.chevronRight}</div>
        </button>
        `:""}
        ${g?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${E.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(g).length} design decisions</span>
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
      ${f.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${fe("Total Requests",Number(f.totals.request_count).toLocaleString())}
          ${fe("Input Tokens",Number(f.totals.total_input_tokens).toLocaleString())}
          ${fe("Output Tokens",Number(f.totals.total_output_tokens).toLocaleString())}

        </div>
        ${f.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${f.models.map(L=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${fe(L.ai_model||"Unknown",Number(L.request_count).toLocaleString()+" requests")}
                ${fe("Tokens",Number(L.total_input_tokens).toLocaleString()+" in / "+Number(L.total_output_tokens).toLocaleString()+" out")}

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
        ${fe("VoxelSite",d.version||"1.0.0")}
        ${fe("PHP",d.php_version||"?")}
        ${fe("SQLite",d.sqlite_version||"?")}
        ${fe("Database",us(d.database_size))}
        ${fe("Preview Files",us(d.preview_size))}
        ${fe("Assets",us(d.assets_size))}
        ${fe("Upload Limit",d.max_upload||"?")}
        ${fe("Memory Limit",d.memory_limit||"?")}
      </div>
    </div>

    <!-- Card: Update -->
    <div class="vs-settings-card">
      <div class="flex items-center justify-between mb-1">
        <h2 class="vs-settings-card-title mb-0">Update</h2>
        <span class="vs-pill vs-pill-subtle">v${b(d.version||"1.0.0")}</span>
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
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: ${c.length>0?"16px":"0"};">
        <div>
          <h3 class="vs-settings-card-title">Server Logs</h3>
          <p class="vs-settings-card-subtitle" style="margin-bottom: 0;">Download log files for debugging.</p>
        </div>
        ${c.length>0?`<button id="btn-delete-all-logs" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost); white-space: nowrap;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Delete all
        </button>`:""}
      </div>
      <div id="log-files-list" style="display: flex; flex-direction: column; gap: 6px;">
        ${c.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':c.map(L=>{let O=(L.size/1024).toFixed(1),ne=new Date(L.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${L.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${L.lines} lines \xB7 ${O} KB \xB7 ${ne}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(L.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${L.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
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
  `,lo(p,w),co(u,C),no(),oo(),document.querySelectorAll(".btn-delete-log").forEach(L=>{L.addEventListener("click",async()=>{var ee;if((ee=window.demoGuard)!=null&&ee.call(window))return;if(L.dataset.confirm!=="true"){L.dataset.confirm="true",L.innerHTML='<span style="font-size: 11px;">Sure?</span>',L.style.color="var(--vs-error)",setTimeout(()=>{L.dataset.confirm==="true"&&(L.dataset.confirm="",L.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',L.style.color="")},3e3);return}let O=L.dataset.file,ne=L.closest(".vs-log-row");ne&&(ne.style.opacity="0.4"),await T.delete("/settings/logs",{file:O}),qe()})});let S=document.getElementById("btn-delete-all-logs");S&&S.addEventListener("click",async()=>{var L;if(!((L=window.demoGuard)!=null&&L.call(window))){if(S.dataset.confirm!=="true"){S.dataset.confirm="true",S.textContent="Sure?",S.style.color="var(--vs-error)",setTimeout(()=>{S.dataset.confirm==="true"&&(S.dataset.confirm="",S.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',S.style.color="")},3e3);return}S.disabled=!0,S.textContent="Deleting...",await T.delete("/settings/logs",{file:"*"}),qe()}});let k=document.getElementById("btn-view-memory");k&&h&&k.addEventListener("click",()=>Ds("Site Memory",h,"memory"));let B=document.getElementById("btn-view-design");B&&g&&B.addEventListener("click",()=>Ds("Design Intelligence",g,"design")),to(),so(),ro(F)}function eo(t,e){let s=(t||"0").split(".").map(Number),n=(e||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function to(){let t=document.getElementById("vs-update-zone"),e=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!t||!o)return;l();async function l(){var r;if(a)try{let{ok:h,data:g}=await T.get("/update/dist-packages");if(!h||!((r=g==null?void 0:g.packages)!=null&&r.length)){a.innerHTML="";return}let m=g.current_version||"0.0.0",f=g.packages.map(w=>{let u=(w.size/1024/1024).toFixed(1),C=eo(w.version,m)>0,y=w.version===m,H=C?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':y?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${b(w.filename)}</strong>
                ${H}
              </div>
              <div class="vs-dist-pkg-meta">v${b(w.version)} \xB7 ${u} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${b(w.filename)}" data-version="${b(w.version)}">
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
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(w=>{w.addEventListener("click",()=>c(w.dataset.filename,w.dataset.version))})}catch{}}async function c(r,h){var m,f;if(!((m=window.demoGuard)!=null&&m.call(window)||!confirm(`Apply update from "${r}" (v${h})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){e.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${r}...`,a&&(a.innerHTML="");try{let{ok:w,data:u,error:C}=await T.post("/update/apply-local",{filename:r});s.classList.add("hidden"),n.classList.remove("hidden");let y=document.getElementById("vs-update-result-icon"),H=document.getElementById("vs-update-result-message");if(w){let D=u;y.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',H.innerHTML=`
          <div class="vs-update-result-title">${b(D.message)}</div>
          <div class="vs-update-result-meta">
            ${D.files_updated} files updated \xB7 ${D.files_skipped} preserved
            ${(f=D.errors)!=null&&f.length?` \xB7 ${D.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else d("Update Failed",(C==null?void 0:C.message)||"Unknown error")}catch(w){d("Update Failed",b(w.message||"Network error."))}}}t.addEventListener("click",r=>{var h;(h=window.demoGuard)!=null&&h.call(window)||r.target.closest("#vs-update-result")||o.click()}),t.addEventListener("dragover",r=>{r.preventDefault(),t.classList.add("is-dragover")}),t.addEventListener("dragleave",()=>t.classList.remove("is-dragover")),t.addEventListener("drop",r=>{var g,m,f;if(r.preventDefault(),t.classList.remove("is-dragover"),(g=window.demoGuard)!=null&&g.call(window))return;let h=(f=(m=r.dataTransfer)==null?void 0:m.files)==null?void 0:f[0];h&&h.name.endsWith(".zip")&&p(h)}),o.addEventListener("change",()=>{var h;let r=(h=o.files)==null?void 0:h[0];r&&p(r),o.value=""});async function p(r){var m,f;let h=document.querySelector(".vs-sys-grid");if(h){let w=h.querySelectorAll(".vs-sys-value"),u="";if(h.querySelectorAll(".vs-sys-label").forEach((C,y)=>{var H,D;C.textContent.trim()==="Upload Limit"&&(u=((D=(H=w[y])==null?void 0:H.textContent)==null?void 0:D.trim())||"")}),u){let C=v(u);if(C>0&&r.size>C){let y=(r.size/1024/1024).toFixed(1);d("File Too Large",`The update file is ${y} MB but your server's upload limit is ${u}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${y} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${r.name}" (${(r.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){e.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${r.name}...`;try{let w=new FormData;w.append("update_zip",r);let u=P.get("sessionToken"),C=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:u?{"X-VS-Token":u}:{},body:w}),y=C.headers.get("content-type")||"",H;if(!y.includes("application/json")){let F=await C.text();if(F.includes("POST Content-Length")||F.includes("upload_max_filesize")||F.includes("exceeds")){d("Server Upload Limit Exceeded",`The file (${(r.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}d("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}H=await C.json(),s.classList.add("hidden"),n.classList.remove("hidden");let D=document.getElementById("vs-update-result-icon"),V=document.getElementById("vs-update-result-message");if(H.ok){let F=H.data;D.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',V.innerHTML=`
          <div class="vs-update-result-title">${b(F.message)}</div>
          <div class="vs-update-result-meta">
            ${F.files_updated} files updated \xB7 ${F.files_skipped} preserved
            ${(m=F.errors)!=null&&m.length?` \xB7 ${F.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else d("Update Failed",((f=H.error)==null?void 0:f.message)||"Unknown error")}catch(w){let u=w.message||"Network error. Check your connection.";u.includes("Unexpected token")||u.includes("not valid JSON")?d("Server Upload Limit Exceeded",`The file (${(r.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):d("Upload Failed",b(u))}}}function d(r,h){s.classList.add("hidden"),n.classList.remove("hidden");let g=document.getElementById("vs-update-result-icon"),m=document.getElementById("vs-update-result-message");g.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',m.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${b(r)}</div>
      <div class="vs-update-result-meta">${h}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function v(r){let h=r.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!h)return 0;let g=parseFloat(h[1]),m=h[2].toUpperCase();return m==="GB"||m==="G"?g*1024*1024*1024:m==="MB"||m==="M"?g*1024*1024:m==="KB"||m==="K"?g*1024:0}}function so(){let t=document.getElementById("vs-favicon-zone"),e=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!t||!e)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&e.click()}),t.addEventListener("dragover",i=>{i.preventDefault(),t.classList.add("is-dragover")}),t.addEventListener("dragleave",()=>t.classList.remove("is-dragover")),t.addEventListener("drop",i=>{var l,c,p;if(i.preventDefault(),t.classList.remove("is-dragover"),(l=window.demoGuard)!=null&&l.call(window))return;let a=(p=(c=i.dataTransfer)==null?void 0:c.files)==null?void 0:p[0];a&&o(a)}),e.addEventListener("change",()=>{var a;let i=(a=e.files)==null?void 0:a[0];i&&o(i),e.value=""}),n==null||n.addEventListener("click",async i=>{var a,l;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let c=await T.delete("/settings/favicon");c.ok?(j("Favicon removed.","success"),qe()):j(((l=c.error)==null?void 0:l.message)||"Could not remove favicon.","error")}catch{j("Could not remove favicon.","error")}}});async function o(i){var d;if(i.size>524288){j("Favicon must be under 512 KB.","error");return}let l=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!l.includes(i.type)){j("Favicon must be a .ico file.","error");return}let p=document.getElementById("vs-favicon-preview");p&&(p.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let v=new FormData;v.append("favicon",i);let r=P.get("sessionToken"),g=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:r?{"X-VS-Token":r}:{},body:v})).json();g.ok?(j("Favicon updated.","success"),qe()):(j(((d=g.error)==null?void 0:d.message)||"Upload failed.","error"),qe())}catch{j("Upload failed. Check your connection.","error"),qe()}}}function Ds(t,e,s){var c,p,d;(c=document.getElementById("vs-knowledge-overlay"))==null||c.remove();let n=v=>v.replace(/[_-]/g," ").replace(/\b\w/g,r=>r.toUpperCase()),o="";s==="memory"?o=Object.entries(e).map(([v,r])=>{let h=typeof r=="object"?r.value||JSON.stringify(r):String(r),g=typeof r=="object"?r.confidence:null,m=g==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${b(n(v))}</div>
          <div class="vs-kv-value">
            <span>${b(h)}</span>
            ${g?`<span class="vs-kv-badge ${m}">${b(g)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(e).map(([v,r])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${b(n(v))}</div>
        <div class="vs-kv-section-body">${b(String(r))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?E.book:E.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${b(t)}</h2>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",l)},l=v=>{v.key==="Escape"&&a()};document.addEventListener("keydown",l),(p=i.querySelector("#vs-knowledge-close"))==null||p.addEventListener("click",a),(d=i.querySelector("#vs-knowledge-done"))==null||d.addEventListener("click",a),i.addEventListener("click",v=>{v.target===i&&a()})}function no(){let t=document.getElementById("btn-reset-site");t&&t.addEventListener("click",()=>{var e;(e=window.demoGuard)!=null&&e.call(window)||ao()})}function oo(){let t=document.getElementById("btn-reset-install");t&&t.addEventListener("click",()=>{var e;(e=window.demoGuard)!=null&&e.call(window)||io()})}function io(){let t=document.getElementById("reset-install-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="reset-install-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>{requestAnimationFrame(()=>{e.classList.add("is-visible")})}),setTimeout(()=>{var c;(c=document.getElementById("reset-install-confirm-input"))==null||c.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let c=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",c),s.classList.toggle("is-matched",c)}),s==null||s.addEventListener("keydown",c=>{c.key==="Enter"&&(s.value.trim()===a?Ns(e):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?Ns(e):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>pe(e)),e.addEventListener("click",c=>{c.target===e&&pe(e)});let l=c=>{c.key==="Escape"&&(pe(e),document.removeEventListener("keydown",l))};document.addEventListener("keydown",l)}async function Ns(t){let e=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(e){e.classList.add("is-loading"),e.classList.remove("is-enabled"),e.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await T.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,e.style.background="var(--vs-success)",e.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=t.querySelector(".vs-modal-desc");if(a){let l=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=l,a.style.color=""},4e3)}}}catch{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.textContent="Erase Everything",s&&(s.disabled=!1)}}}function zs(){return new Promise(t=>{let e=document.getElementById("unsaved-modal-overlay");e&&e.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),t(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function ao(){let t=document.getElementById("reset-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="reset-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>{requestAnimationFrame(()=>{e.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let l=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()==="RESET"?Fs(e):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?Fs(e):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>pe(e)),e.addEventListener("click",l=>{l.target===e&&pe(e)});let a=l=>{l.key==="Escape"&&(pe(e),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function Fs(t){var n,o;let e=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(e){e.classList.add("is-loading"),e.classList.remove("is-enabled"),e.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:l}=await T.post("/site/reset",{confirm:"RESET"});if(i){P.set("pages",[]),P.set("hasFormSchemas",!1),P.set("conversations",null),P.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,e.style.background="var(--vs-success)",e.style.opacity="1",setTimeout(()=>{pe(t),window.location.hash!=="#/chat"?window.location.hash="#/chat":window.dispatchEvent(new HashChangeEvent("hashchange"))},800)}else{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let c=t.querySelector(".vs-modal-desc");if(c){let p=c.textContent;c.textContent=(l==null?void 0:l.message)||"Reset failed. Please try again.",c.style.color="var(--vs-error)",setTimeout(()=>{c.textContent=p,c.style.color=""},4e3)}}}catch{e.classList.remove("is-loading"),e.classList.add("is-enabled"),e.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function ro(t){var s;let e=document.getElementById("set-ai-model");if(e)try{let{ok:n,data:o}=await T.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?e.innerHTML=o.models.map(i=>`<option value="${b(i.id)}" ${i.id===t?"selected":""}>${b(i.name||i.id)}</option>`).join(""):e.innerHTML='<option value="">Test your connection to load available models</option>'}catch{e.innerHTML='<option value="">Test your connection to load available models</option>'}}function fe(t,e){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${t}</span>
      <span class="vs-sys-value">${e}</span>
    </div>
  `}function us(t){return!t&&t!==0?"?":t>=1048576?(t/1048576).toFixed(1)+" MB":t>=1024?(t/1024).toFixed(1)+" KB":t+" B"}function lo(t,e){let s=t.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async d=>{var v;if((v=window.demoGuard)!=null&&v.call(window)){d.target.value=s;return}s=d.target.value,await T.put("/settings",{ai_provider:s}),qe()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var m,f,w,u,C;if((m=window.demoGuard)!=null&&m.call(window))return;let d=((f=i==null?void 0:i.value)==null?void 0:f.trim())||"",v=((u=(w=document.getElementById("set-base-url"))==null?void 0:w.value)==null?void 0:u.trim())||"";if(s!=="openai_compatible"&&(!d||d.startsWith("\u2022\u2022"))){gs("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:r,data:h,error:g}=await T.post("/settings/test-api",{provider:s,api_key:d.startsWith("\u2022\u2022")?"":d,base_url:v});if(o.textContent="Test Connection",o.disabled=!1,r){if(gs("\u2713 Connected successfully!","success"),(C=h==null?void 0:h.models)!=null&&C.length){let y=document.getElementById("set-ai-model");if(y){let H=t[`ai_${s}_model`]||"";y.innerHTML=h.models.map(D=>`<option value="${b(D.id)}" ${D.id===H?"selected":""}>${b(D.name||D.id)}</option>`).join("")}}}else gs("\u2717 "+((g==null?void 0:g.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),l=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var h,g,m,f,w;if((h=window.demoGuard)!=null&&h.call(window))return;a.textContent="Saving...",a.disabled=!0;let d={site_name:((m=(g=document.getElementById("set-site-name"))==null?void 0:g.value)==null?void 0:m.trim())||"",site_tagline:((w=(f=document.getElementById("set-site-tagline"))==null?void 0:f.value)==null?void 0:w.trim())||""},{ok:v,error:r}=await T.put("/settings",d);a.textContent="Save Identity",a.disabled=!1,l&&(l.classList.remove("hidden"),v?(l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3"):(l.textContent="\u2717 "+((r==null?void 0:r.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3"),setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3))});let c=document.getElementById("btn-save-settings"),p=document.getElementById("save-status");c&&c.addEventListener("click",async()=>{var m,f,w,u;if((m=window.demoGuard)!=null&&m.call(window))return;c.textContent="Saving...",c.disabled=!0;let d={ai_provider:s,[`ai_${s}_model`]:((f=document.getElementById("set-ai-model"))==null?void 0:f.value)||"",ai_max_tokens:parseInt(((w=document.getElementById("set-max-tokens"))==null?void 0:w.value)||"32000",10)},v=document.getElementById("set-base-url");v&&(d.ai_openai_compatible_base_url=v.value.trim());let r=(u=i==null?void 0:i.value)==null?void 0:u.trim();r&&!r.startsWith("\u2022\u2022")&&(d[`ai_${s}_api_key`]=r);let{ok:h,error:g}=await T.put("/settings",d);c.textContent="Save Settings",c.disabled=!1,p&&(p.classList.remove("hidden"),h?(p.textContent="\u2713 Saved",p.className="text-xs text-vs-success ml-3"):(p.textContent="\u2717 "+((g==null?void 0:g.message)||"Failed to save."),p.className="text-xs text-vs-error ml-3"),setTimeout(()=>p==null?void 0:p.classList.add("hidden"),3e3))})}function co(t,e){var h;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function l(){if(!t.smtp_host)return"gmail";for(let[g,m]of Object.entries(e))if(m.host&&m.host===t.smtp_host)return g;return"custom"}if(i){let g=l();i.value=g,a&&((h=e[g])!=null&&h.help)&&(a.textContent=e[g].help)}s&&s.addEventListener("change",()=>{let g=s.value;n&&(n.style.display=g==="smtp"?"block":"none"),o&&(o.style.display=g==="mailpit"?"block":"none");let m=document.getElementById("mail-common-fields");m&&(m.style.display=g==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let g=e[i.value];if(!g)return;let m=document.getElementById("set-smtp-host"),f=document.getElementById("set-smtp-port"),w=document.getElementById("set-smtp-encryption");m&&(m.value=g.host||""),f&&(f.value=g.port||587),w&&(w.value=g.encryption||"tls"),a&&(a.textContent=g.help||"")});let c=document.getElementById("btn-toggle-smtp-pass"),p=document.getElementById("set-smtp-password");c&&p&&c.addEventListener("click",()=>{let g=p.type==="password";p.type=g?"text":"password",c.innerHTML=g?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let d=document.getElementById("btn-mail-test");d&&d.addEventListener("click",async()=>{var C,y,H;if((C=window.demoGuard)!=null&&C.call(window))return;let g=(H=(y=document.getElementById("set-mail-test-recipient"))==null?void 0:y.value)==null?void 0:H.trim();if(!g){ms("Enter an email address to send the test to.","warning");return}d.textContent="Sending...",d.disabled=!0;let m=qs();m.test_recipient=g;let{ok:f,data:w,error:u}=await T.post("/settings/mail/test",m);d.textContent="Send Test",d.disabled=!1,f?ms("\u2713 "+((w==null?void 0:w.message)||"Test email sent successfully!"),"success"):ms("\u2717 "+((u==null?void 0:u.message)||"Test failed."),"error")});let v=document.getElementById("btn-save-mail"),r=document.getElementById("save-mail-status");v&&v.addEventListener("click",async()=>{var w;if((w=window.demoGuard)!=null&&w.call(window))return;v.textContent="Saving...",v.disabled=!0;let g=qs(),{ok:m,error:f}=await T.post("/settings/mail",g);v.textContent="Save Email Settings",v.disabled=!1,r&&(r.classList.remove("hidden"),m?(r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3"):(r.textContent="\u2717 "+((f==null?void 0:f.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3"),setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3))})}function qs(){var e,s,n,o,i,a,l,c,p,d,v,r,h,g,m;let t=((e=document.getElementById("set-smtp-password"))==null?void 0:e.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((c=(l=document.getElementById("set-smtp-host"))==null?void 0:l.value)==null?void 0:c.trim())||"",smtp_port:parseInt(((p=document.getElementById("set-smtp-port"))==null?void 0:p.value)||"587",10),smtp_username:((v=(d=document.getElementById("set-smtp-username"))==null?void 0:d.value)==null?void 0:v.trim())||"",smtp_password:t.startsWith("\u2022\u2022")?"":t,smtp_encryption:((r=document.getElementById("set-smtp-encryption"))==null?void 0:r.value)||"tls",mailpit_host:((g=(h=document.getElementById("set-mailpit-host"))==null?void 0:h.value)==null?void 0:g.trim())||"localhost",mailpit_port:parseInt(((m=document.getElementById("set-mailpit-port"))==null?void 0:m.value)||"1025",10)}}function ms(t,e){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=t,s.className=`text-xs mt-1.5 ${e==="success"?"text-vs-success":e==="error"?"text-vs-error":"text-vs-warning"}`)}function gs(t,e){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=t,s.className=`text-xs mt-1.5 ${e==="success"?"text-vs-success":e==="error"?"text-vs-error":"text-vs-warning"}`)}var po=[{route:"chat",label:"Chat"},{route:"editor",label:"Editor"},{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"snapshots",label:"Snapshots"},{route:"settings",label:"Settings"}],fs=["chat","editor"],vo="vs-first-run-guide-dismissed",tn="vs-onboarding-draft-v1",sn="vs-prompt-recents-v1",nn="vs-prompt-pins-v1",uo=8,mo=5,we=document.documentElement.dataset.demo==="true";function je(){return we?(j("Demo mode \u2014 this action is disabled.","warning"),!0):!1}window.IS_DEMO=we;window.demoGuard=je;var on=document.getElementById("app");async function an(){var e;Ls(),Ms(),window.marked&&window.marked.use({renderer:{html(s){return b(typeof s=="string"?s:s.text)}}});let t=await T.get("/auth/session");if(!t.ok||!((e=t.data)!=null&&e.user)){en();return}P.batch(()=>{P.set("user",t.data.user),P.set("sessionToken",t.data.token)}),window.addEventListener("beforeunload",s=>{var n;(n=window.__hasUnsavedEditorChanges)!=null&&n.call(window)&&(s.preventDefault(),s.returnValue="")}),Ge.beforeEach(async(s,n)=>{var o;return n.startsWith("editor")&&!s.startsWith("editor")&&(o=window.__hasUnsavedEditorChanges)!=null&&o.call(window)?await zs():!0}).on("chat",()=>ye()).on("editor",()=>ye()).on("pages",()=>ye()).on("pages/:slug",()=>ye()).on("assets",()=>ye()).on("forms",()=>ye()).on("forms/:formId",()=>ye()).on("snapshots",()=>ye()).on("settings",()=>ye()).on("profile",()=>ye()).onNotFound(()=>Ge.navigate("chat")),P.on("user",s=>{s||en()}),rn(),Ge.start()}async function rn(){try{let{ok:t,data:e}=await T.get("/pages");if(t&&Array.isArray(e==null?void 0:e.pages)){P.set("pages",e.pages);let s=document.getElementById("chat-messages");s!=null&&s.querySelector(".vs-empty-state")&&(s.innerHTML=dt(),lt())}}catch{}}function ye(){let t=P.get("route"),e=fs.includes(t);bt()&&yt(),t!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s;t==="editor"?s=Hs():e?s=ho():s=fo(),on.innerHTML=`
    ${go()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${s}
    </div>
    ${Do()}
    ${No()}
    ${Vo()}
  `,Yo(),t==="editor"&&js()}function go(){let t=P.get("route"),e=P.get("user"),s=P.get("theme");return`
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
            ${po.map(o=>{let i=t===o.route||t.startsWith(o.route+"/");return`
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
              <span class="hidden sm:inline">${b((e==null?void 0:e.name)||"Admin")}</span>
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
  `}function ho(){let t=P.get("sidebarWidth"),e=P.get("activeConversationId"),s=P.get("activePageScope"),n=ln(s);return`
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
              <span id="scope-label" class="text-vs-text-secondary">${b(n)}</span>
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
          ${dt()}
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
  `}function fo(){let t=P.get("route"),e=P.get("routeParams"),s="1100px";return(t==="settings"||t==="profile")&&(s="680px"),t==="forms/:formId"&&(s="800px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${bo(t,e)}
      </div>
    </div>
  `}function bo(t,e){switch(t){case"assets":return Eo();case"forms":return To();case"forms/:formId":return Mo(e.formId);case"snapshots":return $o();case"settings":return Us();case"profile":return xo();default:return yo("Not Found","This page doesn't exist.")}}function yo(t,e){return`
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
  `}function wo(t){let e={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(t||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return E[e[s]||"layoutGrid"]||E.layoutGrid}function Os(t){Ge.navigate("chat"),setTimeout(()=>{let e=document.getElementById("prompt-input");e&&(e.value=t,e.focus(),e.style.height="auto",e.style.height=e.scrollHeight+"px")},150)}function xo(){let t=P.get("user")||{};return setTimeout(()=>ko(),0),`
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
            <input type="text" id="profile-name" class="vs-input" value="${b(t.name||"")}" placeholder="Your name" />
          </div>
          <div>
            <label class="vs-input-label" for="profile-email">Email</label>
            <input type="email" id="profile-email" class="vs-input" value="${b(t.email||"")}" placeholder="you@example.com" />
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
  `}function ko(){let t=document.getElementById("btn-save-profile"),e=document.getElementById("profile-info-feedback");t&&t.addEventListener("click",async()=>{var p,d,v,r;let o=(d=(p=document.getElementById("profile-name"))==null?void 0:p.value)==null?void 0:d.trim(),i=(r=(v=document.getElementById("profile-email"))==null?void 0:v.value)==null?void 0:r.trim();if(!o||o.length<2){e&&(e.textContent="Name must be at least 2 characters.",e.className="text-sm text-vs-error");return}t.disabled=!0,t.textContent="Saving...";let{ok:a,error:l,data:c}=await T.put("/auth/profile",{name:o,email:i});t.disabled=!1,t.textContent="Save Profile",a&&(c!=null&&c.user)?(P.set("user",c.user),e&&(e.textContent="Profile updated.",e.className="text-sm text-vs-success"),setTimeout(()=>ye(),800)):e&&(e.textContent=(l==null?void 0:l.message)||"Failed to update profile.",e.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var p,d,v;let o=((p=document.getElementById("profile-current-pw"))==null?void 0:p.value)||"",i=((d=document.getElementById("profile-new-pw"))==null?void 0:d.value)||"",a=((v=document.getElementById("profile-confirm-pw"))==null?void 0:v.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:l,error:c}=await T.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",l?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(c==null?void 0:c.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function Eo(){return setTimeout(()=>Lt(),0),`
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
  `}async function Lt(t="all"){var w;let e=document.getElementById("assets-grid");if(!e)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await Vs(n.files),n.value="",Lt(t))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=u=>{u.target.closest("button")||n==null||n.click()},o.ondragover=u=>{u.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async u=>{u.preventDefault(),o.classList.remove("is-dragover"),u.dataTransfer.files.length>0&&(await Vs(u.dataTransfer.files),Lt(t))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(u=>{u.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(C=>{C.className="vs-device-btn"}),u.className="vs-device-btn vs-device-btn-active",Lt(u.dataset.filter)}});let a=t==="code",l=!a&&t!=="all"?`?category=${t}`:"",{ok:c,data:p}=await T.get(`/assets${l}`);if(!c||!((w=p==null?void 0:p.assets)!=null&&w.length)){e.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let u=document.getElementById("btn-empty-upload"),C=document.getElementById("btn-upload-asset");u&&C&&u.addEventListener("click",()=>C.click());return}let d=p.assets;if(a&&(d=d.filter(u=>u.category==="css"||u.category==="js"),d.length===0)){e.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${E.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let v=["jpg","jpeg","png","gif","webp","svg","ico"],r=d.filter(u=>u.category==="images"&&v.includes(u.extension)),h=d.filter(u=>!v.includes(u.extension)||u.category!=="images");function g(u,C){return u==="css"?E.fileCode:u==="js"?E.fileCode:u==="json"?E.fileJson:u==="pdf"?E.filePdf:["woff2","woff","ttf","otf"].includes(u)?E.type:["mp4","webm"].includes(u)?E.film:["mp3","wav","ogg"].includes(u)?E.music:["txt","md","csv"].includes(u)?E.fileText:["doc","docx","xls","xlsx"].includes(u)?E.fileText:C==="images"?E.image:E.fileText}let m=["css","js","json","svg"],f="";r.length>0&&(f+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',r.forEach((u,C)=>{var V;let y=Ws(u.size),H=u.width?`${u.width}\xD7${u.height}`:"",D=u.extension==="svg";f+=`
        <div class="vs-asset-card" data-lightbox-idx="${C}">
          <div class="vs-asset-card-thumb${D?" is-svg":""}" style="cursor:pointer">
            <img src="${u.thumbnail||u.path}" alt="${b(((V=u.meta)==null?void 0:V.alt)||u.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${b(u.filename)}">${b(u.filename)}</p>
            <p class="vs-asset-card-meta">${H?H+" \xB7 ":""}${y}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${u.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${E.copy}</button>
            <button data-delete-asset="${u.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${E.x}</button>
          </div>
        </div>
      `}),f+="</div>"),h.length>0&&h.forEach(u=>{let C=Ws(u.size),y=m.includes(u.extension);f+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${g(u.extension,u.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${b(u.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${u.category} \xB7 ${C}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${y?`
              <button data-edit-asset="${u.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${E.pencil}</button>
            `:""}
            <button data-copy-path="${u.path}" title="Copy web path"
              class="vs-asset-action-btn">${E.copy}</button>
            ${u.category!=="css"&&u.category!=="js"?`
              <button data-delete-asset="${u.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${E.trash2}</button>
            `:""}
          </div>
        </div>
      `}),e.innerHTML=f,e.querySelectorAll("[data-lightbox-idx]").forEach(u=>{let C=u.querySelector(".vs-asset-card-thumb");C&&C.addEventListener("click",()=>{let y=parseInt(u.dataset.lightboxIdx,10);Co(r,y,t)})}),e.querySelectorAll("[data-copy-path]").forEach(u=>{u.addEventListener("click",()=>{navigator.clipboard.writeText(u.dataset.copyPath).then(()=>{let C=u.innerHTML;u.innerHTML="\u2713",u.classList.add("vs-asset-action-copied"),setTimeout(()=>{u.innerHTML=C,u.classList.remove("vs-asset-action-copied")},1200)})})}),e.querySelectorAll("[data-edit-asset]").forEach(u=>{u.addEventListener("click",()=>{let y=u.dataset.editAsset.replace(/^\//,"");vs(y)})}),e.querySelectorAll("[data-delete-asset]").forEach(u=>{u.addEventListener("click",async()=>{if(!await be({title:"Delete Asset",description:`Delete ${u.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:y}=await T.delete("/assets",{path:u.dataset.deleteAsset});y?(j("Asset deleted.","success"),Lt(t)):j("Could not delete asset.","error")})})}function Co(t,e,s){let n=e;function o(r){if(r===0)return"0 B";let h=1024,g=["B","KB","MB","GB"],m=Math.floor(Math.log(r)/Math.log(h));return parseFloat((r/Math.pow(h,m)).toFixed(1))+" "+g[m]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var w,u;let r=t[n],h=r.width?`${r.width}\xD7${r.height}`:"",g=o(r.size),m=[h,g,(w=r.extension)==null?void 0:w.toUpperCase()].filter(Boolean),f=t.length>1;return`
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
            <img src="${r.path}" alt="${b(((u=r.meta)==null?void 0:u.alt)||r.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${b(r.filename)}</span>
            <span class="vs-lightbox-details">${m.join(" \xB7 ")}${f?` \xB7 ${n+1} / ${t.length}`:""}</span>
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
    `}let l=document.createElement("div");l.id="vs-lightbox",l.className="vs-lightbox",l.setAttribute("role","dialog"),l.setAttribute("aria-label","Image preview"),l.innerHTML=a(),document.body.appendChild(l),requestAnimationFrame(()=>{requestAnimationFrame(()=>l.classList.add("is-visible"))});function c(){l.classList.remove("is-visible"),setTimeout(()=>l.remove(),400),document.removeEventListener("keydown",d)}function p(r){n=r,l.innerHTML=a(),v()}function d(r){if(r.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;c(),r.preventDefault()}r.key==="ArrowRight"&&t.length>1&&(p((n+1)%t.length),r.preventDefault()),r.key==="ArrowLeft"&&t.length>1&&(p((n-1+t.length)%t.length),r.preventDefault())}function v(){var h,g,m;(h=l.querySelector("#lightbox-close"))==null||h.addEventListener("click",f=>{f.stopPropagation(),c()}),l.addEventListener("click",f=>{(f.target===l||f.target.classList.contains("vs-lightbox-stage"))&&c()}),(g=l.querySelector("#lightbox-prev"))==null||g.addEventListener("click",f=>{f.stopPropagation(),p((n-1+t.length)%t.length)}),(m=l.querySelector("#lightbox-next"))==null||m.addEventListener("click",f=>{f.stopPropagation(),p((n+1)%t.length)});let r=l.querySelector("#lightbox-copy");r==null||r.addEventListener("click",f=>{f.stopPropagation();let w=t[n];navigator.clipboard.writeText(w.path).then(()=>{let u=r.innerHTML;r.innerHTML=`${E.check}<span>Copied!</span>`,r.style.borderColor="var(--vs-success)",r.style.color="var(--vs-success)",setTimeout(()=>{r.innerHTML=u,r.style.borderColor="",r.style.color=""},2e3),j("Path copied!","success")})})}document.addEventListener("keydown",d),v()}async function Vs(t){var i,a,l;if(je())return;let e=document.getElementById("status-text");e&&(e.textContent=`Uploading ${t.length} file(s)...`);let s=new FormData;for(let c of t)s.append("file[]",c);let n=P.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let p=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();e&&(e.textContent=p.ok?`\u2713 ${((a=(i=p.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0} file(s) uploaded`:"\u2717 "+(((l=p.error)==null?void 0:l.message)||"Upload failed"),setTimeout(()=>{e&&(e.textContent="Ready")},4e3))}catch{e&&(e.textContent="\u2717 Upload failed",setTimeout(()=>{e&&(e.textContent="Ready")},4e3))}}function Ws(t){if(t===0)return"0 B";let e=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(t)/Math.log(e));return parseFloat((t/Math.pow(e,n)).toFixed(1))+" "+s[n]}function Lo(t){let e=new Date(t),n=new Date-e,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),l=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:l===1?"Yesterday":l<30?`${l} days ago`:e.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function $o(){return setTimeout(()=>qt(),0),`
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
  `}async function qt(){var i;let t=document.getElementById("snapshots-list");if(!t)return;let e=document.getElementById("btn-create-snapshot");e&&e.addEventListener("click",()=>{Gs()});let{ok:s,data:n}=await T.get("/snapshots");if(!s||!((i=n==null?void 0:n.snapshots)!=null&&i.length)){t.innerHTML=`
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
      ${o.map((a,l)=>{let c=Lo(a.created_at),p=new Date(a.created_at).toLocaleString(),d=a.size_bytes?(a.size_bytes/1024).toFixed(0)+" KB":"\u2014",v=l===o.length-1,r,h,g;a.snapshot_type==="pre_publish"?(r="var(--vs-success)",h="vs-snap-badge-green",g="Pre-publish"):a.snapshot_type==="manual"?(r="var(--vs-accent)",h="vs-snap-badge-amber",g="Manual"):(r="var(--vs-text-ghost)",h="vs-snap-badge-gray",g="Auto");let m=a.description?`<p class="vs-timeline-desc">${b(a.description)}</p>`:"";return`
          <div class="vs-timeline-item${v?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${r}; box-shadow: 0 0 0 3px color-mix(in srgb, ${r} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${h}">${g}</span>
                  <span class="vs-timeline-label">${b(a.label||"Snapshot #"+a.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${p}">${c}</span>
              </div>
              ${m}
              <div class="vs-timeline-meta">${a.file_count} files \xB7 ${d}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${a.id}" data-snap='${JSON.stringify({label:a.label,description:a.description,type:a.snapshot_type,files:a.file_count,size:d,date:p}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
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
  `,t.querySelectorAll("[data-preview-id]").forEach(a=>{a.addEventListener("click",()=>{let l=JSON.parse(a.dataset.snap);So(l)})}),t.querySelectorAll("[data-restore-id]").forEach(a=>{a.addEventListener("click",async()=>{let l=a.dataset.restoreId;if(!await be({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;a.innerHTML=`${E.rotateCcw} Restoring\u2026`,a.disabled=!0;let{ok:p,error:d}=await T.post(`/snapshots/${l}/restore`);if(p){let v=document.getElementById("status-text");v&&(v.textContent="\u2713 Snapshot restored",setTimeout(()=>{v&&(v.textContent="Ready")},4e3)),j("Snapshot restored.","success"),qt()}else j((d==null?void 0:d.message)||"Failed to restore snapshot.","error"),a.innerHTML=`${E.rotateCcw} Restore`,a.disabled=!1})}),t.querySelectorAll("[data-delete-id]").forEach(a=>{a.addEventListener("click",async()=>{let l=a.dataset.deleteId;if(!await be({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;a.innerHTML="Deleting\u2026",a.disabled=!0;let{ok:p,error:d}=await T.delete(`/snapshots/${l}`);p?(j("Snapshot deleted.","success"),qt()):(j((d==null?void 0:d.message)||"Failed to delete snapshot.","error"),a.innerHTML=`${E.trash2}`,a.disabled=!1)})})}function Gs(){var i;let t=document.getElementById("vs-snapshot-create-overlay");t&&t.remove();let e=document.createElement("div");e.id="vs-snapshot-create-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("is-visible"));let s=()=>pe(e);e.addEventListener("click",a=>{a.target===e&&s()}),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var p;let a=((p=n==null?void 0:n.value)==null?void 0:p.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:l,error:c}=await T.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),l?(j("Snapshot created.","success"),qt()):j((c==null?void 0:c.message)||"Failed to create snapshot.","error")})}function So(t){var i;let e=document.getElementById("vs-snapshot-preview-overlay");e&&e.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;t.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):t.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
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
          <span style="color: var(--vs-text-primary);">${b(t.label||"\u2014")}</span>
          <span style="color: var(--vs-text-ghost);">Description</span>
          <span style="color: var(--vs-text-primary);">${b(t.description||"\u2014")}</span>
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),s.addEventListener("click",a=>{a.target===s&&pe(s)}),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>pe(s))}var xe={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function To(){return setTimeout(()=>Bo(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function Bo(){let t=document.getElementById("forms-list");if(!t)return;let{ok:e,data:s}=await T.get("/forms");if(!e||!s){t.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){t.innerHTML=`
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
  `}function Mo(t){return setTimeout(()=>Io(t),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function Io(t){let e=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!e)return;let{ok:n,data:o}=await T.get(`/forms/${encodeURIComponent(t)}`);if(!n||!o){e.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;e.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/forms" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Forms</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${b(i.name||t)}</span>
      </div>
      <h1 class="vs-page-title">${b(i.name||t)}</h1>
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
        <a href="/_studio/api/router.php?_path=%2Fforms%2F${encodeURIComponent(t)}%2Fsubmissions%2Fexport" target="_blank" class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </a>
      </div>
    </div>
  `;let l=document.getElementById("form-filter-status"),c=document.getElementById("form-filter-source"),p=document.getElementById("form-filter-search"),d=null,v=()=>Ut(t,1);l==null||l.addEventListener("change",v),c==null||c.addEventListener("change",v),p==null||p.addEventListener("input",()=>{clearTimeout(d),d=setTimeout(v,300)}),await Ut(t,1)}async function Ut(t,e=1){var f,w,u;let s=document.getElementById("form-submissions");if(!s)return;let n=((f=document.getElementById("form-filter-status"))==null?void 0:f.value)||"all",o=((w=document.getElementById("form-filter-source"))==null?void 0:w.value)||"all",i=((u=document.getElementById("form-filter-search"))==null?void 0:u.value)||"",a=`/forms/${encodeURIComponent(t)}/submissions?page=${e}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:l,data:c}=await T.get(a);if(!l||!c){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let p=c.submissions||[],d=c.total||0,v=c.per_page||20,r=Math.ceil(d/v);if(!p.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:h}=await T.get(`/forms/${encodeURIComponent(t)}`),g=h==null?void 0:h.form,m={};g!=null&&g.fields&&g.fields.forEach(C=>{m[C.name]=C.label||C.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${p.map(C=>{let y=xe[C.status]||xe.new,H=Object.entries(C.data||{}).filter(([F])=>!F.startsWith("_")).slice(0,3).map(([F,W])=>{let G=m[F]||F,Q=Array.isArray(W)?W.join(", "):String(W);return`<span class="vs-sub-field"><strong>${b(G)}:</strong> ${b(Q.substring(0,80))}${Q.length>80?"\u2026":""}</span>`}).join(""),D=Ao(C.created_at),V=C.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${C.id}" data-form-id="${b(t)}" style="border-left-color: ${y.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${y.bg}; color: ${y.text};">${y.label}</span>
                ${V?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${b(D)}</span>
            </div>
            <div class="vs-submission-preview">
              ${H||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${C.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${C.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;">
                ${Object.entries(xe).map(([F,W])=>`<option value="${F}" ${C.status===F?"selected":""}>${W.label}</option>`).join("")}
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
        ${e>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${e-1}" data-form-id="${b(t)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${e} of ${r} \xB7 ${d} submission${d!==1?"s":""}</span>
        ${e<r?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${e+1}" data-form-id="${b(t)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${d} submission${d!==1?"s":""}</span>
      </div>
    `}
  `,_o(t,e)}function _o(t,e){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;Ks(t,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{let n=s.dataset.subId,{ok:o}=await T.put(`/forms/${encodeURIComponent(t)}/submissions/${n}`,{status:s.value});if(o){j("Status updated","success");let i=s.closest(".vs-submission-card"),a=xe[s.value];if(i&&a){i.style.borderLeftColor=a.text;let l=i.querySelector(".vs-status-pill");l&&(l.style.background=a.bg,l.style.color=a.text,l.textContent=a.label)}}else j("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.dataset.subId;if(!await be({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await T.delete(`/forms/${encodeURIComponent(t)}/submissions/${n}`);i?(j("Submission deleted","success"),Ut(t,e)):j("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);Ut(t,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;Ks(t,o)})})}async function Ks(t,e){var v,r,h,g;(v=document.getElementById("submission-detail-overlay"))==null||v.remove();let{ok:s,data:n}=await T.get(`/forms/${encodeURIComponent(t)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(m=>String(m.id)===String(e));if(!o){j("Submission not found","error");return}let{data:i}=await T.get(`/forms/${encodeURIComponent(t)}`),a=i==null?void 0:i.form,l={};if(a!=null&&a.fields&&a.fields.forEach(m=>{l[m.name]=m.label||m.name}),o.status==="new"){await T.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{status:"read"}),o.status="read";let m=document.querySelector(`.vs-sub-status-select[data-sub-id="${e}"]`);m&&(m.value="read");let f=document.querySelector(`.vs-submission-card[data-sub-id="${e}"]`);if(f){f.style.borderLeftColor=xe.read.text;let w=f.querySelector(".vs-status-pill");w&&(w.style.background=xe.read.bg,w.style.color=xe.read.text,w.textContent="Read")}}let c=xe[o.status]||xe.new,p=document.createElement("div");p.id="submission-detail-overlay",p.className="vs-slide-overlay",p.innerHTML=`
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
            <span class="vs-status-pill" style="background: ${c.bg}; color: ${c.text};">${c.label}</span>
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
          ${Object.entries(o.data||{}).filter(([m])=>!m.startsWith("_")).map(([m,f])=>{let w=l[m]||m,u=Array.isArray(f)?f.join(", "):String(f);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${b(w)}</div>
                <div class="vs-sub-detail-field-value">${b(u)}</div>
              </div>
            `}).join("")}
        </div>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Internal Notes</h3>
        <textarea id="sub-detail-notes" class="vs-input" style="min-height: 80px; resize: vertical;" placeholder="Add private notes about this submission...">${b(o.notes||"")}</textarea>
        <button id="btn-save-sub-notes" class="vs-btn vs-btn-secondary vs-btn-sm" style="margin-top: 8px;">Save Notes</button>

        <div class="vs-sub-detail-divider"></div>

        <h3 class="text-sm font-semibold text-vs-text-secondary mb-3">Change Status</h3>
        <select id="sub-detail-status" class="vs-input">
          ${Object.entries(xe).map(([m,f])=>`<option value="${m}" ${o.status===m?"selected":""}>${f.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(p),requestAnimationFrame(()=>{requestAnimationFrame(()=>p.classList.add("is-visible"))});let d=()=>{p.classList.remove("is-visible"),setTimeout(()=>p.remove(),200)};p.addEventListener("click",m=>{m.target===p&&d()}),(r=document.getElementById("close-sub-detail"))==null||r.addEventListener("click",d),(h=document.getElementById("btn-save-sub-notes"))==null||h.addEventListener("click",async()=>{var w;let m=((w=document.getElementById("sub-detail-notes"))==null?void 0:w.value)||"",{ok:f}=await T.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{notes:m});j(f?"Notes saved":"Failed to save notes",f?"success":"error")}),(g=document.getElementById("sub-detail-status"))==null||g.addEventListener("change",async m=>{let f=m.target.value,{ok:w}=await T.put(`/forms/${encodeURIComponent(t)}/submissions/${e}`,{status:f});if(w){j("Status updated","success");let u=document.querySelector(`.vs-sub-status-select[data-sub-id="${e}"]`);u&&(u.value=f);let C=document.querySelector(`.vs-submission-card[data-sub-id="${e}"]`),y=xe[f];if(C&&y){C.style.borderLeftColor=y.text;let H=C.querySelector(".vs-status-pill");H&&(H.style.background=y.bg,H.style.color=y.text,H.textContent=y.label)}}else j("Failed to update status","error")})}function Ao(t){if(!t)return"";let e=Date.now(),s=new Date(t).getTime(),n=e-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(t).toLocaleDateString()}function Po(){let t=document.getElementById("conversation-history-panel");if(!t)return;t.classList.contains("hidden")?(t.classList.remove("hidden"),Ho()):t.classList.add("hidden")}async function Ho(){let t=document.getElementById("conversation-list");if(!t)return;t.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:e,data:s,error:n}=await T.get("/ai/conversations");if(!e||!(s!=null&&s.conversations)){t.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${b((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=P.get("activeConversationId");if(o.length===0){t.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}t.innerHTML=o.map(a=>{let l=a.id===i,c=a.title||"Untitled conversation",p=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${l?"vs-conv-item-active":""}"
              data-conversation-id="${b(a.id)}">
        <span class="mt-0.5 shrink-0 ${l?"text-vs-accent":"text-vs-text-ghost"}">${E.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${l?"font-medium":""}" style="font-size: var(--text-sm);">${b(c)}</div>
          <div class="vs-conv-time mt-0.5">${p}</div>
        </div>
        ${l?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),t.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let l=a.dataset.conversationId;zt(l);let c=document.getElementById("conversation-history-panel");c&&c.classList.add("hidden")})})}async function zt(t){let e=document.getElementById("chat-messages");if(!e)return;e.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await T.get(`/ai/conversations/${t}`);if(!s||!(n!=null&&n.conversation)){P.set("activeConversationId",null),Vt(null);try{localStorage.removeItem("vs-active-conversation")}catch{}e.innerHTML=dt(),lt();return}let i=n.conversation,a=i.prompts||[];P.set("activeConversationId",t),Vt(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",t)}catch{}if(a.length===0){e.innerHTML=dt(),lt();return}let l="",c=!1;for(let p of a)if(l+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        <div class="text-sm text-vs-text-primary leading-relaxed">${b(p.user_prompt)}</div>
      </div>
    `,p.ai_response||p.files_modified){let d="",v=typeof p.ai_message=="string"&&p.ai_message.trim()!==""?p.ai_message:p.ai_response;v&&(d=Ft(v));let r="";if(p.files_modified)try{let g=JSON.parse(p.files_modified);if(Array.isArray(g)&&g.length>0){let m=g.map(w=>{let u=typeof w=="string"?w:w.path||w,C=typeof w=="object"&&w.action==="delete";return`<div class="vs-file-badge ${C?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${C?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${b(String(u))}</span>
              </div>`}).join(""),f=g.length;r=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${f} file${f!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${m}</div>
              </div>`}}catch{}let h=p.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${d}</div>
          ${r}
          ${h}
        </div>
      `}else if(p.status==="streaming"){c=!0;let d=p.id;l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Generation in progress...
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${d})"
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
      `);e.innerHTML=l,e.scrollTop=e.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),c&&!window.__vsResumedToastByConversation[t]&&(j("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[t]=!0),c||delete window.__vsResumedToastByConversation[t],window.__vsCancelStreamingPrompt=async function(p){try{await T.post("/ai/cancel-generation",{prompt_id:p})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[t]="__cancelled__",zt(t)},c&&P.get("activeConversationId")===t&&!P.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[t]=(window.__vsPollingCount[t]||0)+1,window.__vsPollingCount[t]<=60?setTimeout(()=>{P.get("activeConversationId")===t&&!P.get("aiStreaming")&&zt(t)},2500):delete window.__vsPollingCount[t]):window.__vsPollingCount&&delete window.__vsPollingCount[t]}function jo(){P.set("activeConversationId",null),Vt(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let t=document.getElementById("chat-messages");t&&(t.innerHTML=dt(),lt());let e=document.getElementById("conversation-history-panel");e&&e.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function ln(t){if(!t)return"Pages";let e=t.replace(/\.(php|html)$/i,"");if(e==="index")return"Home Page";let s=e.split("/");e=s[s.length-1];let n=e.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):e}function Ot(){let t=document.getElementById("scope-label");if(!t)return;let e=window.__vsCurrentPreviewPath||null;t.textContent=ln(e)}function Vt(t){P.set("activePageScope",t||null),Ot(),bt()&&yt()}async function Ro(){let t=document.getElementById("vs-pages-modal-overlay");t&&t.remove();let e=document.createElement("div");e.id="vs-pages-modal-overlay",e.className="vs-modal-overlay",e.innerHTML=`
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
  `,document.body.appendChild(e),requestAnimationFrame(()=>e.classList.add("is-visible"));let s=()=>pe(e);e.querySelector("#vs-pages-modal-close").addEventListener("click",s),e.addEventListener("click",d=>{d.target===e&&s()}),e.addEventListener("keydown",d=>{d.key==="Escape"&&s()});let n=e.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await T.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${b((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let l=i.pages;if(!l.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${E.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let c='<div style="display: flex; flex-direction: column; gap: 2px;">';l.forEach(d=>{let v=!!Number(d.is_homepage),r=d.title||d.slug||d.path,h=d.path||d.slug+".php",g="/"+h.replace(/\.php$/,"").replace(/^index$/,""),m=g==="/"?"/":g,f=wo(d.slug),u=(window.__vsCurrentPreviewPath||"index.php")===h,C=d.size?(d.size/1024).toFixed(1)+" KB":"";c+=`
      <div class="vs-pages-modal-item ${u?"is-active":""}" data-slug="${b(d.slug)}" data-path="${b(h)}" data-title="${b(r)}" data-url="${b(m)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${f}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${b(r)}${v?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${b(h)}${C?" \xB7 "+C:""}
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
    `}),c+="</div>",n.innerHTML=c;let p=e.querySelector(".vs-modal-desc");p&&(p.textContent=`${l.length} page${l.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(d=>{d.addEventListener("click",v=>{v.stopPropagation();let r=d.closest(".vs-pages-modal-item"),h=r.dataset.slug,g=r.dataset.path,m=r.dataset.title,f=r.dataset.url,w=d.dataset.action;if(w==="edit")Vt(h),s(),Os(`Edit the "${m}" page (${f}): `);else if(w==="preview"){let u=document.getElementById("preview-iframe");u?(bt()&&yt(),u.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(g)+"&t="+Date.now(),window.__vsCurrentPreviewPath=g,Ot(),s(),j(`Preview: ${m}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(g),"_blank")}else if(w==="delete"){s();let u=`Delete the "${m}" page (${f}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;Os(u)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(d=>{d.addEventListener("click",v=>{if(v.target.closest(".vs-pages-action"))return;let r=d.dataset.path,h=d.dataset.title,g=document.getElementById("preview-iframe");g?(g.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(r)+"&t="+Date.now(),window.__vsCurrentPreviewPath=r,Ot(),s(),j(`Preview: ${h}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(r),"_blank")})})}function lt(){document.querySelectorAll("[data-quick-prompt]").forEach(t=>{t.addEventListener("click",()=>{let e=document.getElementById("prompt-input");e&&(e.value=t.dataset.quickPrompt,e.dataset.actionType=t.dataset.actionType||"free_prompt",e.focus(),e.setSelectionRange(0,e.value.length),e.dispatchEvent(new Event("input",{bubbles:!0})))})})}function dt(){let t=P.get("pages")||[],e=t.length>0,s=new Set(t.map(m=>m.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(m=>{let f=m.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(f)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],l=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],c=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],p=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],d=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],v,r,h;if(!e)r="What are we building?",h="Describe your website and watch it appear in the preview. Every detail is a conversation away.",v=hs(n).slice(0,6);else{r="What\u2019s next?",h="Your site is live in preview. Pick a suggestion or describe any change you want.";let m=[...o,...o,...i,...a,...l,...c,...p,...d];v=hs(m).slice(0,6);let f=new Set;if(v=v.filter(w=>f.has(w.label)?!1:(f.add(w.label),!0)),v.length<6){let w=hs(m).filter(u=>!f.has(u.label));for(let u of w){if(v.length>=6)break;v.push(u),f.add(u.label)}}}let g=v.map(m=>`<button data-quick-prompt="${b(m.prompt).replace(/"/g,"&quot;")}" data-action-type="${m.type}"
      class="vs-style-card">${b(m.label)}</button>`).join(`
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
  `}function hs(t){let e=[...t];for(let s=e.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[e[s],e[n]]=[e[n],e[s]]}return e}function Do(){return`
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
  `}function No(){return`
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
  `}function dn(){let t=(e,s,n,o,i)=>({id:e,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>un(i)});return[t("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),t("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),t("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),t("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),t("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),t("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),t("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),t("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),t("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),t("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),t("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),t("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),t("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),t("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),t("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),t("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),t("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),t("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),t("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),t("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),t("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),t("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),t("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),t("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),t("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),t("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),t("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),t("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),t("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),t("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),t("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),t("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),t("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),t("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),t("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),t("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),t("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),t("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),t("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),t("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),t("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),t("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),t("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),t("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),t("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),t("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),t("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),t("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),t("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),t("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),t("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),t("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),t("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),t("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),t("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),t("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),t("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),t("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),t("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),t("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),t("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),t("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),t("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),t("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),t("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),t("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),t("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),t("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),t("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),t("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),t("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),t("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),t("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),t("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),t("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),t("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),t("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),t("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),t("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),t("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),t("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),t("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),t("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),t("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),t("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),t("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),t("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),t("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),t("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),t("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),t("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),t("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),t("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),t("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),t("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),t("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),t("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),t("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),t("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function cn(t){try{let e=localStorage.getItem(t);if(!e)return[];let s=JSON.parse(e);return Array.isArray(s)?s:[]}catch{return[]}}function pn(t,e){try{localStorage.setItem(t,JSON.stringify(e))}catch{}}function Gt(){return cn(nn)}function ys(){return cn(sn)}function vn(t){let e=Gt(),s=e.includes(t)?e.filter(o=>o!==t):[...e,t];pn(nn,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};St(n.query||"",n.activeIndex||0)}function Fo(t){let e=ys().filter(n=>n!==t),s=[t,...e].slice(0,8);pn(sn,s)}function un(t){if(P.get("route")!=="chat"){Ge.navigate("chat"),setTimeout(()=>un(t),80);return}let e=document.getElementById("prompt-input");e&&(e.value=t,e.focus(),e.setSelectionRange(0,e.value.length),e.dispatchEvent(new Event("input",{bubbles:!0})))}function mn(t,e="free_prompt",s=!1){if(P.get("route")!=="chat"){Ge.navigate("chat"),setTimeout(()=>mn(t,e,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=t,n.dataset.actionType=e,s?Wt():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function Ct(){let t=document.getElementById("command-palette");return!!t&&!t.classList.contains("hidden")}function Ys(t=""){let e=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!e||!s||(e.classList.remove("hidden"),s.value=t,s.focus(),s.select(),St(t,0))}function $t(){let t=document.getElementById("command-palette");t&&t.classList.add("hidden")}function qo(t,e){let s=0,n=0,o=0;for(let i=0;i<e.length&&s<t.length;i++)e[i]===t[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<t.length?null:n}function Uo(t,e){let s=(t||"").trim().toLowerCase();if(!s)return 0;let n=`${e.title} ${e.meta} ${e.group} ${e.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=qo(s,n);return i===null?null:70+i}function zo(t){let e=(t||"").trim().toLowerCase(),s=dn(),n=Gt(),o=ys();return s.map(i=>{let a=Uo(e,i);if(a===null)return null;let l=n.includes(i.id)?-12:0,c=o.includes(i.id)?-8:0;return{...i,__score:a+l+c}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function Oo(t){let e=dn(),s=Object.fromEntries(e.map(v=>[v.id,v])),n=(t||"").trim(),o=[];if(n!==""){let v=zo(t).slice(0,18);return v.length>0&&o.push({title:"Results",commands:v}),o}let i=ys(),a=Gt(),l=new Set,c=i.map(v=>s[v]).filter(Boolean);c.length>0&&(o.push({title:"Recent",commands:c}),c.forEach(v=>l.add(v.id)));let p=a.map(v=>s[v]).filter(v=>v&&!l.has(v.id));return p.length>0&&(o.push({title:"Pinned",commands:p}),p.forEach(v=>l.add(v.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(v=>{let r=e.filter(h=>h.group===v&&!l.has(h.id));r.length>0&&(o.push({title:v,commands:r}),r.forEach(h=>l.add(h.id)))}),o}function St(t,e=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Oo(t),o=n.flatMap(p=>p.commands),i=Math.max(0,Math.min(e,Math.max(0,o.length-1))),a=Gt();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:t},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let l="",c=0;n.forEach(p=>{l+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${b(p.title)}</div>`,p.commands.forEach(d=>{let v=c===i,r=a.includes(d.id);l+=`
        <div class="flex items-center gap-1.5 px-1 py-0.5 rounded-xl ${v?"bg-vs-bg-inset":""}">
          <button type="button"
            data-command-index="${c}"
            class="flex-1 text-left px-2 py-2 rounded-lg transition-colors ${v?"":"hover:bg-vs-bg-inset/70"}">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm text-vs-text-secondary truncate">${b(d.title)}</div>
                <div class="text-xs text-vs-text-ghost truncate" style="max-width:420px">${b(d.prompt?d.prompt.substring(0,80)+(d.prompt.length>80?"\u2026":""):d.meta)}</div>
              </div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${b(d.id)}"
            class="w-7 h-7 inline-flex items-center justify-center rounded-md text-xs ${r?"text-vs-accent":"text-vs-text-ghost hover:text-vs-text-secondary"}"
            title="${r?"Unpin command":"Pin command"}">
            ${r?"\u2605":"\u2606"}
          </button>
        </div>
      `,c+=1})}),s.innerHTML=l,s.querySelectorAll("[data-command-index]").forEach(p=>{p.addEventListener("click",()=>{let d=parseInt(p.dataset.commandIndex||"0",10);gn(d)})}),s.querySelectorAll("[data-command-pin]").forEach(p=>{p.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation();let v=p.dataset.commandPin;v&&vn(v)})})}function gn(t=null){let e=window.__vsCommandPalette||{commands:[],activeIndex:0},s=t===null?e.activeIndex:t,n=e.commands[s];n&&(Fo(n.id),$t(),Promise.resolve(n.run()).catch(()=>{}))}function Vo(){return`
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
  `}function Rt(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function Qe(){try{let t=localStorage.getItem(tn);if(!t)return Rt();let e=JSON.parse(t);return{...Rt(),...e&&typeof e=="object"?e:{},pages:Array.isArray(e==null?void 0:e.pages)?e.pages:Rt().pages}}catch{return Rt()}}function hn(t){try{localStorage.setItem(tn,JSON.stringify(t))}catch{}}function Nt(){let t=document.getElementById("onboarding-modal");t&&t.classList.add("hidden")}function Zs(){let t=window.__vsOnboarding||{step:1,draft:Qe()},e=Math.max(1,Math.min(3,t.step||1)),s=t.draft||Qe(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),l=document.getElementById("btn-onboarding-next"),c=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!l||!c)return;let p=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${e} of 3 \xB7 ${p[e-1]}`,n.innerHTML=p.map((d,v)=>{let r=v+1===e,h=v+1<e;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${r?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":h?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${v+1}. ${b(d)}</div>
      </div>
    `}).join(""),e===1)i.innerHTML=`
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
    `;else if(e===2)i.innerHTML=`
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
    `;else{let d=[{key:"home",label:"Home"},{key:"about",label:"About"},{key:"services",label:"Services"},{key:"portfolio",label:"Portfolio"},{key:"pricing",label:"Pricing"},{key:"blog",label:"Blog"},{key:"contact",label:"Contact"}];i.innerHTML=`
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm text-vs-text-secondary mb-2">Pages to Create</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${d.map(v=>`
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
    `}a.disabled=e===1,l.classList.toggle("hidden",e===3),c.classList.toggle("hidden",e!==3),Wo()}function Wo(){let t=window.__vsOnboarding||{draft:Qe()},e=()=>{var n,o,i,a,l,c,p,d,v,r,h;t.draft={...t.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||t.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||t.draft.business_type||"",offer:((c=(l=document.getElementById("onboard-offer"))==null?void 0:l.value)==null?void 0:c.trim())||t.draft.offer||"",audience:((d=(p=document.getElementById("onboard-audience"))==null?void 0:p.value)==null?void 0:d.trim())||t.draft.audience||"",style:((v=document.getElementById("onboard-style"))==null?void 0:v.value)||t.draft.style||"modern-minimal",tone:((r=document.getElementById("onboard-tone"))==null?void 0:r.value)||t.draft.tone||"confident",content_mode:((h=document.getElementById("onboard-content-mode"))==null?void 0:h.value)||t.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(t.draft.pages=Array.from(s).filter(g=>g.checked).map(g=>g.dataset.onboardPage).filter(Boolean)),hn(t.draft),window.__vsOnboarding=t};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",e),n.addEventListener("change",e))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",e)})}function Go(t){let e={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(t.pages&&t.pages.length?t.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=t.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":t.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${t.business_name||"my business"}.`,t.business_type?`Business type: ${t.business_type}.`:"",t.offer?`Core offer: ${t.offer}.`:"",t.audience?`Target audience: ${t.audience}.`:"",`Style preference: ${e[t.style]||"Modern Minimal"}.`,`Copy tone: ${s[t.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function Ko(){let t=document.querySelector("[data-onboarding-overlay]");t&&t.addEventListener("click",()=>Nt());let e=document.getElementById("btn-close-onboarding");e&&e.addEventListener("click",()=>Nt());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Qe()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,Zs()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:Qe()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,Zs()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:Qe()}).draft||Qe(),l=Go(a);try{localStorage.setItem(vo,"1")}catch{}hn(a),Nt(),mn(l,"create_site",!0)})}function Yo(){let t=document.getElementById("btn-theme-toggle");t&&t.addEventListener("click",()=>{var _,z;let B=ss()==="light";t.innerHTML=B?E.sun:E.moon,t.title=B?"Switch to dark":"Switch to light",window.__vsEditorPage&&((_=window.monaco)!=null&&_.editor)&&window.monaco.editor.setTheme(Et()),document.getElementById("vs-code-editor-overlay")&&((z=window.monaco)!=null&&z.editor)&&window.monaco.editor.setTheme(Et())});let e=document.getElementById("btn-command-palette");e&&e.addEventListener("click",()=>{Ys()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>$t());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{St(n.value,0)}),n.addEventListener("keydown",k=>{let B=window.__vsCommandPalette||{commands:[],activeIndex:0};if((k.metaKey||k.ctrlKey)&&k.key.toLowerCase()==="p"){k.preventDefault();let I=B.commands[B.activeIndex];I&&vn(I.id);return}if(k.key==="ArrowDown"){k.preventDefault(),St(n.value,B.activeIndex+1);return}if(k.key==="ArrowUp"){k.preventDefault(),St(n.value,B.activeIndex-1);return}if(k.key==="Enter"){k.preventDefault(),gn();return}k.key==="Escape"&&(k.preventDefault(),$t())})),Ko();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",k=>{k.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",()=>i.classList.add("hidden"),{once:!0}));let a=document.getElementById("btn-edit-profile");a&&i&&a.addEventListener("click",()=>{i.classList.add("hidden")});let l=document.getElementById("btn-logout");l&&l.addEventListener("click",async()=>{await T.post("/auth/logout"),P.set("user",null),window.location.reload()});let c=document.getElementById("btn-undo-status");c&&c.addEventListener("click",()=>{je()||Js()});let p=document.getElementById("btn-redo-status");p&&p.addEventListener("click",()=>{je()||Qs()});let d=document.getElementById("btn-preview-site");d&&d.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let v=document.getElementById("btn-snapshot");v&&v.addEventListener("click",async()=>{var _;if(je())return;v.disabled=!0,Ue("Creating snapshot...");let{ok:k,data:B,error:I}=await T.post("/snapshots",{type:"manual",label:"Manual snapshot"});v.disabled=!1,Ue(k?`\u2713 Snapshot saved (${((_=B==null?void 0:B.snapshot)==null?void 0:_.file_count)||0} files)`:"\u2717 "+((I==null?void 0:I.message)||"Snapshot failed"),k?"success":"error",4e3)});let r=document.getElementById("btn-download");r&&((async()=>{var _;let{ok:k,data:B}=await T.get("/settings");(_=B==null?void 0:B.settings)!=null&&_.last_published_at||(r.disabled=!0,r.title="Publish your site first to enable download.",r.classList.add("opacity-40"))})(),r.addEventListener("click",()=>{r.disabled||je()||Jo()}));let h=document.getElementById("btn-publish");h&&(rt(),h.addEventListener("click",async()=>{var L,O;if(je())return;let k=Bt();if(k.publishing)return;if(k.hasChanges===!1){j("No unpublished changes to publish.","warning");return}let B=k.counts||{added:0,modified:0,deleted:0},I=Number(B.added||0)+Number(B.modified||0)+Number(B.deleted||0),_=localStorage.getItem("vs_publish_snapshot"),Z=await Xo({totalChanges:I,snapshotDefault:_===null?!0:_!=="false"});if(!Z)return;localStorage.setItem("vs_publish_snapshot",String(Z.createSnapshot)),k.publishing=!0,rt(),Ue("Publishing...");let{ok:ie,data:de,error:ve}=await T.post("/publish",{create_snapshot:Z.createSnapshot});if(k.publishing=!1,ie){let ne=((L=de==null?void 0:de.published)==null?void 0:L.length)||0,ee=((O=de==null?void 0:de.removed)==null?void 0:O.length)||0,oe=ee>0?`Published ${ne} file(s), removed ${ee} stale file(s).`:`Published ${ne} file(s).`;j(oe,"success"),Ue(`\u2713 ${ne} published, ${ee} removed`,"success",5e3),P.set("previewDirty",!1),Re({silent:!0}),window.open("/","_blank")}else j((ve==null?void 0:ve.message)||"Publish failed.","error"),Ue("\u2717 "+((ve==null?void 0:ve.message)||"Publish failed"),"error",5e3),Re({silent:!0})}));let g=document.getElementById("btn-publish-menu");g&&g.addEventListener("click",k=>{if(k.stopPropagation(),je())return;let B=document.querySelector(".vs-publish-dropup");if(B){B.remove();return}let I=document.createElement("div");I.className="vs-publish-dropup",I.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${E.cloudOff} Unpublish
        </button>
      `;let _=g.closest(".vs-publish-split");_?_.appendChild(I):g.parentElement.appendChild(I),I.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(I.remove(),!await be({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0}))return;Ue("Unpublishing...");let{ok:de,data:ve,error:L}=await T.post("/publish/unpublish");de?(j("Unpublished. Default page restored.","success"),Ue("\u2713 Site unpublished","success",5e3),Re({silent:!0})):(j((L==null?void 0:L.message)||"Unpublish failed.","error"),Ue("\u2717 "+((L==null?void 0:L.message)||"Unpublish failed"),"error",5e3))});let z=ie=>{!I.contains(ie.target)&&ie.target!==g&&(I.remove(),document.removeEventListener("click",z))};setTimeout(()=>document.addEventListener("click",z),0);let Z=ie=>{ie.key==="Escape"&&(I.remove(),document.removeEventListener("keydown",Z),document.removeEventListener("click",z))};document.addEventListener("keydown",Z)});let m=document.getElementById("resize-handle"),f=document.getElementById("conversation-panel");if(m&&f){let k,B;m.addEventListener("mousedown",I=>{I.preventDefault(),k=I.clientX,B=f.offsetWidth;let _=Z=>{let ie=Z.clientX-k,de=Math.min(580,Math.max(340,B+ie));f.style.width=`${de}px`,P.set("sidebarWidth",de)},z=()=>{document.removeEventListener("mousemove",_),document.removeEventListener("mouseup",z)};document.addEventListener("mousemove",_),document.addEventListener("mouseup",z)})}let w=document.getElementById("prompt-input");w&&(w.addEventListener("input",()=>{w.style.height="auto",w.style.height=Math.min(200,w.scrollHeight)+"px"}),w.addEventListener("keydown",k=>{k.key==="Enter"&&(k.metaKey||k.ctrlKey)&&(k.preventDefault(),Wt())}));let u=document.getElementById("btn-send");u&&u.addEventListener("click",Wt),lt();let C=document.getElementById("btn-new-chat");C&&C.addEventListener("click",jo);let y=document.getElementById("btn-scope-selector");y&&y.addEventListener("click",()=>{Ro()});let H=document.getElementById("btn-toggle-history");H&&H.addEventListener("click",Po);let D=document.getElementById("btn-visual-editor");D&&D.addEventListener("click",()=>ds());let V=document.getElementById("btn-edit-code");V&&V.addEventListener("click",()=>{let k=window.__vsCurrentPreviewPath||"index.php";vs(k)});let F=document.getElementById("btn-refresh-preview");F&&F.addEventListener("click",()=>ct());let W=document.querySelectorAll("[data-device]"),G=document.getElementById("preview-frame-container");if(W.length&&G){let k={desktop:"100%",tablet:"768px",mobile:"375px"};W.forEach(B=>{B.addEventListener("click",()=>{let I=B.dataset.device,_=k[I]||"100%";I==="desktop"?(G.style.maxWidth="",G.style.width="",G.style.alignSelf=""):(G.style.maxWidth=_,G.style.width="100%",G.style.alignSelf="center"),W.forEach(z=>{z.classList.remove("vs-device-btn-active"),z.dataset.device===I&&z.classList.add("vs-device-btn-active")})})})}let Q=document.getElementById("btn-external-preview");Q&&Q.addEventListener("click",()=>{let k=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(k),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",k=>{var I,_;let B=(_=(I=k.target)==null?void 0:I.closest)==null?void 0:_.call(I,"[data-code-toggle]");B&&(k.preventDefault(),ti(B))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",k=>{if((k.metaKey||k.ctrlKey)&&k.key==="k"){k.preventDefault(),Ct()?$t():Ys();return}if(k.key==="Escape"&&Ct()){k.preventDefault(),$t();return}if(k.key==="Escape"&&Dt()){k.preventDefault(),Nt();return}if((k.metaKey||k.ctrlKey)&&k.key==="z"&&!k.shiftKey){if(Ct()||Dt())return;let B=document.activeElement;if(B&&(B.tagName==="INPUT"||B.tagName==="TEXTAREA"))return;k.preventDefault(),Js()}if((k.metaKey||k.ctrlKey)&&k.key==="z"&&k.shiftKey){if(Ct()||Dt())return;let B=document.activeElement;if(B&&(B.tagName==="INPUT"||B.tagName==="TEXTAREA"))return;k.preventDefault(),Qs()}if(k.key==="v"&&!k.metaKey&&!k.ctrlKey&&!k.altKey&&!k.shiftKey){if(Ct()||Dt())return;let B=document.activeElement;if(B&&(B.tagName==="INPUT"||B.tagName==="TEXTAREA"||B.isContentEditable))return;let I=P.get("route");if(!fs.includes(I))return;k.preventDefault(),ds()}if(k.key==="Escape"&&bt()){k.preventDefault(),yt();return}}));let S=P.get("route");if(fs.includes(S))try{let k=P.get("activeConversationId"),B=localStorage.getItem("vs-active-conversation"),I=k||B,_=document.getElementById("chat-messages"),z=_==null?void 0:_.querySelector(".vs-empty-state");I&&!P.get("aiStreaming")?(k||P.set("activeConversationId",I),z&&zt(I)):I||_&&_.children.length===0&&(_.innerHTML=dt(),lt())}catch{}Tt(),Qo()}function Zo(){let t=document.getElementById("preview-frame-container");if(!t||t.querySelector(".vs-generating-overlay"))return;let e=document.createElement("div");e.className="vs-generating-overlay",e.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">Working on your site</div>
    <div class="vs-gen-subtitle">Content is being generated.<br>This may take a few minutes.</div>
    <div class="vs-gen-note">Please keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-progress"><div class="vs-gen-progress-bar"></div></div>
  `,t.appendChild(e)}function Xs(){let t=document.querySelector(".vs-generating-overlay");t&&(t.classList.add("removing"),t.addEventListener("animationend",()=>t.remove(),{once:!0}),setTimeout(()=>t==null?void 0:t.remove(),600))}function ct(t){let e=document.getElementById("preview-iframe");if(e){let s=t||window.__vsCurrentPreviewPath||"index.php";e.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=ct;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",t=>{typeof t.data=="string"&&t.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=t.data.slice(15),Ot())}));function bs(t){let e=document.getElementById("preview-iframe");if(e&&e.contentWindow)try{e.contentWindow.postMessage(t,"*")}catch{ct()}}window.sendPreviewMessage=bs;async function Js(){(await T.post("/revisions/undo")).ok&&(setTimeout(()=>ct(),300),await Tt(),Re({silent:!0}))}async function Qs(){(await T.post("/revisions/redo")).ok&&(setTimeout(()=>ct(),300),await Tt(),Re({silent:!0}))}async function Tt(){let{ok:t,data:e}=await T.get("/revisions/state");if(!t||!e)return;let s=!!e.can_undo,n=!!e.can_redo,o=e.undo_description?`Undo: ${e.undo_description}`:"Nothing to undo",i=e.redo_description?`Redo: ${e.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!s,l.title=o,l.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!n,l.title=i,l.classList.toggle("opacity-40",!n))})}function Bt(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function Ue(t,e="neutral",s=0){let n=document.getElementById("status-text");n&&(n.textContent=t,n.className=e==="success"?"text-xs text-vs-success":e==="error"?"text-xs text-vs-error":"text-xs text-vs-text-ghost",window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s>0&&(window.__vsStatusResetTimer=setTimeout(()=>{let o=document.getElementById("status-text");o&&(o.textContent="Ready",o.className="text-xs text-vs-text-ghost",window.__vsStatusResetTimer=null)},s)))}function rt(){let t=Bt(),e=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!e)return;let o=l=>{s&&(l?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=t.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(t.publishing){e.disabled=!0,e.innerHTML=`${E.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),t.checking&&t.hasChanges===null){e.disabled=!0,e.innerHTML=`${E.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(t.error){e.disabled=!1,e.innerHTML=`${E.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(t.hasChanges){if(e.disabled=!1,e.innerHTML=`${E.publish} Publish`,e.classList.remove("vs-btn-ghost"),e.classList.add("vs-btn-primary"),o(!0),n){let l=a===1?"":"s";n.textContent=`${a} unpublished change${l}`,n.className="text-2xs text-vs-accent"}return}e.disabled=!0,e.innerHTML=`${E.publish} Up to date`,e.classList.remove("vs-btn-primary"),e.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=rt;function Xo({totalChanges:t=0,snapshotDefault:e=!0}){return new Promise(s=>{var c,p;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=t>0?`${t} unpublished change${t===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Publish Website</h2>
          <p class="vs-modal-desc">${b(o)}</p>
          <label class="vs-publish-option" for="vs-publish-snapshot-cb">
            <input type="checkbox" id="vs-publish-snapshot-cb" ${e?"checked":""}>
            <span class="vs-publish-check">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span class="vs-publish-option-label">Create snapshot before publishing</span>
          </label>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-confirm-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-confirm-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">Publish</button>
        </div>
      </div>
    `;let a=d=>{d.key==="Escape"&&(d.preventDefault(),l(null))},l=d=>{document.removeEventListener("keydown",a),pe(i),s(d)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),i.addEventListener("click",d=>{d.target===i&&l(null)}),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>l(null)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>{let d=document.getElementById("vs-publish-snapshot-cb");l({createSnapshot:d?d.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var d;return(d=document.getElementById("vs-confirm-ok"))==null?void 0:d.focus()},220)})}function Jo(){let t=document.getElementById("vs-download-modal-overlay");t&&t.remove();let n=Bt().hasChanges===!0?`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=()=>pe(o);o.querySelector("#vs-download-close").addEventListener("click",i),o.addEventListener("click",v=>{v.target===o&&i()}),o.addEventListener("keydown",v=>{v.key==="Escape"&&i()});let a=o.querySelector("#vs-download-publish-link");a&&a.addEventListener("click",v=>{v.preventDefault(),i(),setTimeout(()=>{let r=document.getElementById("btn-publish");r&&!r.disabled&&r.click()},400)});let l=o.querySelectorAll(".vs-download-card"),c=o.querySelector("#vs-download-action"),p="php";l.forEach(v=>{v.addEventListener("click",()=>{if(v.classList.contains("is-loading"))return;l.forEach(h=>h.classList.remove("is-selected")),v.classList.add("is-selected"),p=v.dataset.format;let r=p==="php"?"Download PHP":"Download HTML";c.innerHTML=`${E.download} ${r}`})});let d=!1;c.addEventListener("click",async()=>{var v;if(!d){d=!0,c.disabled=!0,c.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',l.forEach(r=>r.style.pointerEvents="none");try{let r=P.get("sessionToken"),h={"Content-Type":"application/json",Accept:"application/zip"};r&&(h["X-VS-Token"]=r);let g=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:h,credentials:"same-origin",body:JSON.stringify({format:p})});if(!g.ok){let H="Export failed.";try{let D=await g.json();H=((v=D==null?void 0:D.error)==null?void 0:v.message)||H}catch{}j(H,"error");return}let f=(g.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),w=f?f[1]:`site-${p}-${new Date().toISOString().slice(0,10)}.zip`,u=await g.blob(),C=URL.createObjectURL(u),y=document.createElement("a");y.href=C,y.download=w,y.style.display="none",document.body.appendChild(y),y.click(),setTimeout(()=>{URL.revokeObjectURL(C),y.remove()},100),j(`\u2713 ${w} downloaded`,"success")}catch{j("Download failed. Check your connection.","error")}finally{d=!1,c.disabled=!1;let r=p==="php"?"Download PHP":"Download HTML";c.innerHTML=`${E.download} ${r}`,l.forEach(h=>h.style.pointerEvents="")}}})}async function Re({silent:t=!1}={}){let e=Bt();if(e.publishing){rt();return}e.checking=!0,t||rt();let{ok:s,data:n,error:o}=await T.get("/preview/diff");e.checking=!1,s&&n?(e.hasChanges=!!n.has_changes,e.counts=n.counts||{added:0,modified:0,deleted:0},e.error=null):e.error=(o==null?void 0:o.message)||"Could not check publish status.",rt()}window.refreshPublishState=Re;function Qo(){let t=Bt();t.intervalId&&(clearInterval(t.intervalId),t.intervalId=null),Re({silent:!0}),t.intervalId=window.setInterval(()=>{document.hidden||Re({silent:!0})},15e3)}async function Wt(){if(je())return;let t=document.getElementById("prompt-input");if(!t)return;let e=t.value.trim();if(!e||P.get("aiStreaming"))return;t.value="",t.style.height="auto";let s=document.getElementById("chat-messages");if(!s)return;let n=`
    <div class="vs-msg-user mb-6 mt-4">
      <div class="vs-msg-user-bubble">${b(e)}</div>
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
  `,a=s.querySelector(".vs-empty-state");a&&a.remove(),s.insertAdjacentHTML("beforeend",n+i),s.scrollTop=s.scrollHeight;let l=s.querySelector(`.vs-msg-ai[data-stream-id="${o}"]`);if(!l)return;let c=l.querySelector('[data-role="typing"]'),p=l.querySelector('[data-role="status"]'),d=l.querySelector('[data-role="status-text"]'),v=l.querySelector('[data-role="stream-content"]'),r=l.querySelector('[data-role="files-section"]'),h=l.querySelector('[data-role="files"]'),g=l.querySelector('[data-role="files-label"]'),m=l.querySelector('[data-role="files-count"]'),f=l.querySelector('[data-role="files-progress"]'),w=l.querySelector('[data-role="error"]'),u=l.querySelector('[data-role="status-timer"]'),C=L=>{L&&L.removeAttribute("hidden")},y=L=>{L&&L.setAttribute("hidden","")},H=Date.now(),D=0,V=Date.now(),F=!1,W=!1,G=setInterval(()=>{let L=Math.floor((Date.now()-H)/1e3),O=Math.floor(L/60),ne=L%60,ee=O>0?`${O}m ${ne}s`:`${ne}s`;D>0&&(ee+=` \xB7 ${D.toLocaleString()} tokens`),u&&(u.textContent=`\xB7 ${ee}`),Date.now()-V>3e5&&!F&&(F=!0,d&&(d.textContent="No data for 5 min \u2014 the model may have stalled",d.style.color="var(--vs-warning, #d97706)"))},1e3);P.set("aiStreaming",!0);let Q=document.getElementById("btn-send");Q&&(Q.disabled=!0,Q.classList.add("opacity-50")),Zo();let S="",k=[],B=!1,I=null,_=!0,z=new AbortController,Z=l.querySelector('[data-role="stop-btn"]');Z&&Z.addEventListener("click",()=>z.abort());let ie=t.dataset.actionType||"free_prompt";delete t.dataset.actionType;let de=t.dataset.actionData,ve=null;if(de){try{ve=JSON.parse(de)}catch{}delete t.dataset.actionData}await it("/ai/prompt",{user_prompt:e,action_type:ie,page_scope:P.get("activePageScope"),conversation_id:P.get("activeConversationId"),action_data:ve},{signal:z.signal,onConversation(L){if(L){P.set("activeConversationId",L);try{localStorage.setItem("vs-active-conversation",L)}catch{}}},onStatus(L){!W&&r&&!r.hasAttribute("hidden")&&g&&(g.textContent=L),p&&d&&(d.textContent=L,C(p))},onToken(L){S+=L,D+=Math.ceil(L.length/4),V=Date.now(),F=!1,d&&(d.style.color="");let O=S.trimStart();if(!B&&O.length>0&&(B=O.startsWith("{")||O.startsWith("```json")||O.startsWith("```")||O.startsWith("<|")||O.startsWith("<message>")||O.startsWith("<file ")||L.includes("<|")||O.includes("<|channel|>")||O.includes('"operations"')||O.includes('"assistant_message"'),B&&v&&(v.innerHTML="")),y(c),v&&B){let ne=S.match(/<message>([\s\S]*?)(<\/message>|$)/);if(ne){let ee=ne[1].trim();ee&&(C(v),v.innerHTML=Ft(ee))}r&&S.includes("<file ")&&C(r)}else v&&(C(v),v.innerHTML=Ft(S),p&&y(p));s.scrollTop=s.scrollHeight},onFile(L){if(k.push(L),r&&C(r),m){let O=k.length;m.textContent=`${O} file${O!==1?"s":""}`}if(h){let O=L.action==="delete",ne=(k.length-1)*60,ee=O?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';h.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${O?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${ne}ms">
            <span class="vs-file-badge-icon">${ee}</span>
            <span>${b(L.path)}</span>
          </div>
        `)}I||(_=!0),L.path.endsWith(".css")||(_=!1),clearTimeout(I),I=setTimeout(()=>{bs(_?"voxelsite:reload-css":"voxelsite:reload"),I=null,_=!0},600),s.scrollTop=s.scrollHeight},onDone(L){W=!0,clearTimeout(I),I=null,clearInterval(G),y(c),y(p);let O=L.files_modified||[],ne=k.length>0||O.length>0;if(r&&ne?(y(f),r.classList.add("vs-files-done"),g&&(g.textContent=L.partial?"Files updated (partial)":"Files updated")):r&&!r.hasAttribute("hidden")&&(y(f),y(r)),v)if(L.message)C(v),v.innerHTML=Ft(L.message);else if(B)y(v);else{let oe=v.textContent||"";(oe.includes("<|channel|>")||oe.includes('"operations"')||oe.includes('"assistant_message"')||oe.includes("<file ")||oe.includes("<message>"))&&(y(v),v.innerHTML="")}if(L.truncated&&v){let oe=document.createElement("button");oe.className="vs-btn vs-btn-primary vs-btn-sm mt-3",oe.innerHTML="\u21BB Continue generating...",oe.addEventListener("click",()=>{oe.remove();let Le=document.getElementById("prompt-input");Le&&(Le.value="Continue from where you left off. Complete any unfinished files.",Le.dataset.actionType=ie,Wt())}),v.appendChild(oe)}if(L.conversation_id){P.set("activeConversationId",L.conversation_id);try{localStorage.setItem("vs-active-conversation",L.conversation_id)}catch{}}let ee=[...k,...O];if(ee.length>0){let oe=ee.map(ue=>ue.path||ue),Le=oe.some(ue=>ue==="index.php"),pt=oe.filter(ue=>ue.endsWith(".php")&&!ue.includes("/")&&ue!=="index.php"),Kt=Le&&pt.length>0,ze;Kt?ze="index.php":pt.length>0?ze=pt[0]:ze=Le?"index.php":null,ct(ze),P.set("previewDirty",!0),Re({silent:!0})}Xs(),rn(),Tt(),s.scrollTop=s.scrollHeight},onWarning(L){h&&(h.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${b(L)}</div>
        `)},onError(L){clearTimeout(I),I=null,clearInterval(G),y(c),y(p),w&&(w.textContent=L.message||"Something went wrong.",C(w)),Xs(),f&&y(f),r&&k.length>0&&(r.classList.add("vs-files-done"),g&&(g.textContent="Files updated (partial)"))}}),P.set("aiStreaming",!1),Q&&(Q.disabled=!1,Q.classList.remove("opacity-50"))}function en(){var v;on.innerHTML=`
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
        ${(P.get("theme")||"light")==="light"?E.sun:E.moon}
      </button>
    </div>
  `;let t=document.getElementById("login-password"),e=document.getElementById("btn-toggle-pw");e&&t&&e.addEventListener("click",()=>{let r=t.type==="password";t.type=r?"text":"password",e.innerHTML=r?E.eyeOff:E.eye,e.title=r?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let r=ss();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=r==="light"?E.sun:E.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(r=>{r.addEventListener("click",()=>{let h=document.getElementById(r.dataset.toggleTarget);if(!h)return;let g=h.type==="password";h.type=g?"text":"password",r.innerHTML=g?E.eyeOff:E.eye,r.title=g?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),l=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var h,g,m;o.classList.add("hidden"),i.classList.remove("hidden");let r=document.getElementById("forgot-content");try{let w=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((h=w==null?void 0:w.data)==null?void 0:h.mode)||"file")==="email"?(r.innerHTML=`
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
          `,(g=document.getElementById("forgot-form"))==null||g.addEventListener("submit",async C=>{var F,W,G;C.preventDefault();let y=document.getElementById("forgot-message"),H=document.getElementById("forgot-email"),D=C.target.querySelector('button[type="submit"]'),V=(F=H==null?void 0:H.value)==null?void 0:F.trim();if(V){D&&(D.disabled=!0,D.textContent="Sending...");try{let S=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:V})})).json();y&&(S.ok?(y.textContent=((W=S.data)==null?void 0:W.message)||"Recovery link sent. Check your inbox.",y.className="mb-5 px-4 py-3 text-sm rounded-xl border",y.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",H&&(H.value="")):(y.textContent=((G=S.error)==null?void 0:G.message)||"Failed to send recovery email.",y.className="mb-5 px-4 py-3 text-sm rounded-xl border",y.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),y.classList.remove("hidden"))}catch{y&&(y.textContent="Network error. Please try again.",y.className="mb-5 px-4 py-3 text-sm rounded-xl border",y.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",y.classList.remove("hidden"))}finally{D&&(D.disabled=!1,D.textContent="Send Recovery Link")}}})):(r.innerHTML=`
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
          `,n(),(m=document.getElementById("forgot-form"))==null||m.addEventListener("submit",async C=>{var F,W,G;C.preventDefault();let y=document.getElementById("forgot-message"),H=(F=document.getElementById("forgot-email"))==null?void 0:F.value,D=(W=document.getElementById("forgot-new-password"))==null?void 0:W.value;if(!H||!D)return;let V=await T.post("/auth/reset-password",{email:H,new_password:D});V.ok?(y&&(y.textContent="Password reset. You can now sign in with your new password.",y.className="mb-5 px-4 py-3 text-sm rounded-xl border",y.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",y.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):y&&(y.textContent=((G=V.error)==null?void 0:G.message)||"Reset failed. Make sure the .reset file exists in _data/.",y.className="mb-5 px-4 py-3 text-sm rounded-xl border",y.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",y.classList.remove("hidden"))}))}catch{r.innerHTML=`
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
      `,n(),(v=document.getElementById("token-reset-form"))==null||v.addEventListener("submit",async g=>{var C,y,H,D;g.preventDefault();let m=document.getElementById("forgot-message"),f=(C=document.getElementById("token-new-password"))==null?void 0:C.value,w=(y=document.getElementById("token-confirm-password"))==null?void 0:y.value,u=g.target.querySelector('button[type="submit"]');if(!f||f.length<8){m&&(m.textContent="Password must be at least 8 characters.",m.className="mb-5 px-4 py-3 text-sm rounded-xl border",m.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",m.classList.remove("hidden"));return}if(f!==w){m&&(m.textContent="Passwords do not match.",m.className="mb-5 px-4 py-3 text-sm rounded-xl border",m.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",m.classList.remove("hidden"));return}u&&(u.disabled=!0,u.textContent="Resetting...");try{let F=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:p,new_password:f})})).json();m&&(F.ok?(m.textContent=((H=F.data)==null?void 0:H.message)||"Password reset. You can now sign in.",m.className="mb-5 px-4 py-3 text-sm rounded-xl border",m.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",m.classList.remove("hidden"),g.target.querySelectorAll("input").forEach(W=>W.disabled=!0),u&&(u.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(m.textContent=((D=F.error)==null?void 0:D.message)||"Reset failed. The link may have expired.",m.className="mb-5 px-4 py-3 text-sm rounded-xl border",m.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",m.classList.remove("hidden")))}catch{m&&(m.textContent="Network error. Please try again.",m.className="mb-5 px-4 py-3 text-sm rounded-xl border",m.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",m.classList.remove("hidden"))}finally{u&&(u.disabled=!1,u.textContent="Reset Password")}}))}let d=document.getElementById("login-form");d&&d.addEventListener("submit",async r=>{var w,u,C,y;r.preventDefault();let h=(w=document.getElementById("login-email"))==null?void 0:w.value,g=(u=document.getElementById("login-password"))==null?void 0:u.value,m=document.getElementById("login-error");if(!h||!g)return;let f=await T.post("/auth/login",{email:h,password:g});f.ok&&((C=f.data)!=null&&C.token)?(P.batch(()=>{P.set("user",f.data.user),P.set("sessionToken",f.data.token)}),an()):m&&(m.textContent=((y=f.error)==null?void 0:y.message)||"Invalid email or password.",m.classList.remove("hidden"))}),Tt()}function Dt(){let t=document.getElementById("onboarding-modal");return!!t&&!t.classList.contains("hidden")}function Ft(t){if(!t)return"";if(!window.marked)return b(t);let e=window.marked.parse(t);return ei(e)}function ei(t){if(!t||typeof t!="string")return"";if(!t.includes("<pre"))return t;let e=document.createElement("template");return e.innerHTML=t,e.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),l=a?a.split(`
`):[];if(l.length<=uo)return;let c=l.slice(0,mo).join(`
`)+`
...`,p=document.createElement("div");p.className="vs-code-collapse",p.setAttribute("data-code-collapse","1");let d=document.createElement("pre");d.className="vs-code-collapse-preview",d.setAttribute("data-code-preview","1");let v=document.createElement("code");o!=null&&o.className&&(v.className=o.className),v.textContent=c,d.appendChild(v),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let r=document.createElement("button");r.type="button",r.className="vs-code-collapse-toggle",r.setAttribute("data-code-toggle","1"),r.setAttribute("data-lines",String(l.length)),r.setAttribute("aria-expanded","false"),r.textContent=`More (${l.length} lines)`;let h=n.parentNode;h&&(h.replaceChild(p,n),p.appendChild(d),p.appendChild(n),p.appendChild(r))}),e.innerHTML}function ti(t){let e=t.closest("[data-code-collapse]");if(!e)return;let s=e.querySelector("[data-code-preview]"),n=e.querySelector("[data-code-full]"),o=t.dataset.lines||"",i=e.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),t.setAttribute("aria-expanded",i?"true":"false"),t.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}an();})();
