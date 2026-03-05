(()=>{var Us=e=>{throw TypeError(e)};var ls=(e,t,s)=>t.has(e)||Us("Cannot "+s);var te=(e,t,s)=>(ls(e,t,"read from private field"),s?s.call(e):t.get(e)),we=(e,t,s)=>t.has(e)?Us("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),_e=(e,t,s,n)=>(ls(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),We=(e,t,s)=>(ls(e,t,"access private method"),s);var De,qe,et,Ne,$t,cs,ds=class{constructor(t={}){we(this,$t);we(this,De,new Map);we(this,qe,new Map);we(this,et,!1);we(this,Ne,new Map);for(let[s,n]of Object.entries(t))te(this,De).set(s,n)}get(t,s=void 0){return te(this,De).has(t)?te(this,De).get(t):s}set(t,s){let n=te(this,De).get(t);n!==s&&(te(this,De).set(t,s),te(this,et)?te(this,Ne).has(t)?te(this,Ne).get(t).newValue=s:te(this,Ne).set(t,{newValue:s,oldValue:n}):We(this,$t,cs).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return te(this,qe).has(t)||te(this,qe).set(t,new Set),te(this,qe).get(t).add(s),()=>{var n;(n=te(this,qe).get(t))==null||n.delete(s)}}batch(t){if(te(this,et)){t();return}_e(this,et,!0),te(this,Ne).clear();try{t()}finally{_e(this,et,!1);for(let[s,{newValue:n,oldValue:o}]of te(this,Ne))We(this,$t,cs).call(this,s,n,o);te(this,Ne).clear()}}toJSON(){return Object.fromEntries(te(this,De))}};De=new WeakMap,qe=new WeakMap,et=new WeakMap,Ne=new WeakMap,$t=new WeakSet,cs=function(t,s,n){let o=te(this,qe).get(t);if(o)for(let a of o)try{a(s,n)}catch(l){console.error(`[state] Error in "${t}" listener:`,l)}let i=te(this,qe).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(l){console.error("[state] Error in wildcard listener:",l)}};var F=new ds({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});F.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});F.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Lt,vt,ut,mt,St,gt,Ge,vs,us,ps=class{constructor(){we(this,Ge);we(this,Lt,[]);we(this,vt,null);we(this,ut,!1);we(this,mt,null);we(this,St,null);we(this,gt,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return te(this,Lt).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return _e(this,vt,t),this}beforeEach(t){return _e(this,mt,t),this}start(){te(this,ut)||(_e(this,ut,!0),window.addEventListener("hashchange",()=>We(this,Ge,vs).call(this)),We(this,Ge,vs).call(this))}navigate(t){window.location.hash=`/${t}`}get current(){return We(this,Ge,us).call(this)}};Lt=new WeakMap,vt=new WeakMap,ut=new WeakMap,mt=new WeakMap,St=new WeakMap,gt=new WeakMap,Ge=new WeakSet,vs=async function(){if(te(this,gt))return;let t=We(this,Ge,us).call(this),s=te(this,St);if(!(t===s&&te(this,ut))){if(te(this,mt)&&s!==null){_e(this,gt,!0);try{if(await te(this,mt).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{_e(this,gt,!1)}}_e(this,St,t);for(let n of te(this,Lt)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,l)=>{i[a]=decodeURIComponent(o[l+1])}),F.batch(()=>{F.set("route",n.pattern),F.set("routeParams",i)}),n.handler(i);return}}te(this,vt)?(F.set("route","404"),te(this,vt).call(this,t)):this.navigate("chat")}},us=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var tt=new ps;var Ws="/_studio/api/router.php";async function Ft(e,t,s=null,n={}){let o={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let a=Gs();a&&(o["X-VS-Token"]=a)}s!==null&&(o["Content-Type"]="application/json");let i={method:e,headers:o,credentials:"same-origin",...n};s!==null&&(i.body=JSON.stringify(s));try{let[a,l]=t.split("?"),d=`${Ws}?_path=${encodeURIComponent(a)}${l?"&"+l:""}`,p=await fetch(d,i),c=await p.json();return p.status===401?(F.get("user")&&F.set("user",null),c!=null&&c.error?{ok:!1,error:c.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!c.ok&&c.error?(c.error.code==="demo_mode"&&window.showToast&&window.showToast(c.error.message||"Demo mode \u2014 this action is disabled.","warning"),{ok:!1,error:c.error}):{ok:!0,data:c.data||c}}catch{return{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var M={get:(e,t)=>Ft("GET",e,null,t),post:(e,t,s)=>Ft("POST",e,t,s),put:(e,t,s)=>Ft("PUT",e,t,s),delete:(e,t,s)=>Ft("DELETE",e,t,s)};async function st(e,t,s={}){var b,m;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onFile:a=()=>{},onDone:l=()=>{},onWarning:d=()=>{},onError:p=()=>{},signal:c=null}=s,g=Gs(),r={"Content-Type":"application/json",Accept:"text/event-stream"};g&&(r["X-VS-Token"]=g);let u=!1,v=0,h=0,f=t.conversation_id||null;try{let $=function(y){if(!y.trim())return;let N="";for(let I of y.split(`
`))I.startsWith(":")||I.startsWith("data: ")&&(N+=I.slice(6));if(!N)return;let O;try{O=JSON.parse(N)}catch{return}switch(O.type||"message"){case"token":h++,n(O.content||"");break;case"status":o(O.message||"");break;case"conversation":f=O.conversation_id||f,i(O.conversation_id||"");break;case"file_complete":v++,a(O);break;case"done":u=!0,l(O);break;case"warning":d(O.message||"");break;case"error":p(O);break}},L={method:"POST",headers:r,credentials:"same-origin",body:JSON.stringify(t)};c&&(L.signal=c);let[E,T]=e.split("?"),B=`${Ws}?_path=${encodeURIComponent(E)}${T?"&"+T:""}`,q=await fetch(B,L);if(!q.ok){let y=await q.json().catch(()=>null);p({code:((b=y==null?void 0:y.error)==null?void 0:b.code)||"http_error",message:((m=y==null?void 0:y.error)==null?void 0:m.message)||`Server error (${q.status})`});return}let H=q.body.getReader(),U=new TextDecoder,w="";for(;;){let{done:y,value:N}=await H.read();if(y)break;w+=U.decode(N,{stream:!0});let O=w.split(`

`);w=O.pop();for(let k of O)$(k)}if(w.trim()&&$(w),!u){let y=f;y?(o("Waiting for server to finish..."),await Vs(y,{onDone:l,onError:p,onFile:a,onStatus:o})):(v>0||h>0)&&l({files_modified:[],message:"",soft_close:!0})}}catch(L){if(L.name==="AbortError"){l({cancelled:!0,message:"Generation stopped."});return}if(v>0||h>0){let E=f;E?(o("Server is still generating \u2014 waiting for completion..."),await Vs(E,{onDone:l,onError:p,onFile:a,onStatus:o})):l({files_modified:[],message:"",soft_close:!0})}else p({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function Vs(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var l;let a=0;for(let d=0;d<120;d++){await new Promise(p=>setTimeout(p,3e3));try{let{ok:p,data:c}=await M.get(`/ai/conversations/${e}`);if(!p||!((l=c==null?void 0:c.conversation)!=null&&l.prompts))continue;let g=c.conversation.prompts,r=g[g.length-1];if(!r)continue;let u=r.files_modified?JSON.parse(r.files_modified):[];if(u.length>a){for(let v=a;v<u.length;v++)n({path:u[v],action:"write"});a=u.length}if(r.status==="streaming"){let v=Math.round((Date.now()-new Date(r.created_at).getTime())/1e3);o(`Server is still generating... (${v}s)`);continue}r.status==="success"?t({message:r.ai_message||"",files_modified:u,revision_id:r.revision_id||null,polled:!0}):r.status==="partial"?t({message:r.ai_message||"",files_modified:u,partial:!0,polled:!0}):s({code:"generation_failed",message:r.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function Gs(){return F.get("sessionToken")}var Qn="data-theme",ms="dark";function Ks(){let e=F.get("theme")||localStorage.getItem("vs-theme")||ms;return Ys(e),e}function Ys(e){let t=e||ms;return document.documentElement.setAttribute(Qn,t),localStorage.setItem("vs-theme",t),F.set("theme",t),t}function gs(){let e=F.get("theme")||ms;return Ys(e==="dark"?"light":"dark")}var Pe=!1,Ot=null,nt=[],hs=!1,Zs=!1,ve={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function Es(){Pe=!Pe,cn(),Q({type:"vx-editor:toggle",active:Pe}),Pe||(Te(),$s(),He(),ot(),Ot=null,dt=!1)}function Bt(){return Pe}function Tt(){Pe&&(Pe=!1,cn(),Q({type:"vx-editor:toggle",active:!1}),Te(),$s(),He(),ot(),Ot=null,dt=!1)}function tn(){if(Zs)return;Zs=!0,window.addEventListener("message",eo);let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{dt&&sn()})}function eo(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":Ot=e.data,ao(e.data);break;case"vx-editor:text-changed":ws(e.data);break;case"vx-editor:image-changed":Ro(e.data);break;case"vx-editor:element-deleted":ks(e.data);break;case"vx-editor:deselect":Te(),$s(),He(),Ot=null;break;case"vx-editor:save-request":Mt();break;case"vx-editor:editing-started":to(e.data);break;case"vx-editor:editing-ended":sn();break;case"vx-editor:selection-state":so(e.data);break;case"vx-editor:element-rect":no(e.data);break;case"vx-editor:richtext-link-request":rn();break;case"vx-editor:add-section-request":Ao(e.data);break}}var dt=!1,Cs=!1,Ke=null,ht={},bs="P";function to(e){dt=!0,Cs=!!e.hasPhp,Ke=e.rect||null,ht={},bs=e.tagName||"P",Te(),oo()}function sn(){dt=!1,Cs=!1,Ke=null,ht={},an()}function so(e){if(dt){if(e.elementRect&&(Ke=e.elementRect,nn()),!e.hasSelection){ht={},Xs();return}ht=e.formatting||{},bs=e.blockTag||bs,Xs()}}function no(e){dt&&e.rect&&(Ke=e.rect,nn())}function nn(){let e=document.getElementById("vx-richtext-toolbar");e&&on(e)}function oo(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),on(e),io(e),e.classList.add("vx-rt-visible")}function on(e){if(!Ke)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+Ke.left,o=s.top+Ke.top,i=Ke.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function io(e){let t=ht,s=Cs;e.innerHTML=`<div class="vx-rt-actions">
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
  </div>`,e.querySelectorAll("[data-cmd]").forEach(i=>{i.addEventListener("click",a=>{a.stopPropagation();let l=i.dataset.cmd;if(l==="insertLink"){rn();return}Q({type:"vx-editor:richtext-command",command:l})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",i=>{i.stopPropagation(),Q({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",i=>{i.stopPropagation(),Q({type:"vx-editor:save-edit"})})}function Xs(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=ht,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function an(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function $s(){an()}function rn(){let e=prompt("Enter URL:");if(e!==null){let t=e.trim();Q(t?{type:"vx-editor:richtext-command",command:"insertLink",value:t}:{type:"vx-editor:richtext-command",command:"removeLink"})}}function ao(e){let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,hasImage:i}=e,a=document.getElementById("preview-iframe");if(!a)return;let l=a.getBoundingClientRect();t.style.left=`${l.left+n.left+n.width/2}px`,t.style.top=`${l.top+n.top-8}px`,t.style.transform="translate(-50%, -100%)";let d="";o&&(d+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
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
      <span>AI</span></button>`;let p=Ut(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${p}</div><div class="vx-tb-actions">${d}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(c=>{c.addEventListener("click",g=>{g.stopPropagation(),ro(c.dataset.action,e)})})}function Te(){let e=document.getElementById("vx-context-toolbar");e&&e.classList.remove("vx-tb-visible")}function Ut(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function ro(e,t){switch(e){case"edit-text":Q({type:"vx-editor:start-edit",mode:"text"}),Te();break;case"swap-image":Po(t);break;case"edit-style":co(t);break;case"edit-link":Ho(t);break;case"delete":lo(t);break;case"ask-ai":Io(t);break}}function lo(e){Te();let t=Ut(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
        <button class="vx-modal-close" data-close>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></div>
      <div class="vx-modal-body">
        <p style="margin:0;font-size:13px;color:var(--vs-text-secondary);line-height:1.5">
          This will remove the element${s?` <strong>"${bt(s)}\u2026"</strong>`:""} from the page source.
        </p>
      </div>
      <div class="vx-modal-footer">
        <button class="vx-btn-secondary" data-close>Cancel</button>
        <button class="vx-btn-danger" id="vx-delete-confirm">Delete</button>
      </div>
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>n.remove(),200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),n.addEventListener("click",a=>{a.target===n&&o()}),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{Q({type:"vx-editor:delete-element"}),o()})}var he=new Set,it="",je=null,Vt="text",Fe="padding",Ue="all",at="all",Oe="tl",rt="",Ye=!1;function He({revertUnsaved:e=!0}={}){e&&Ye&&it&&(Q({type:"vx-editor:update-classes",classes:it.split(" ").filter(Boolean),silent:!0}),he=new Set(it.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>t.remove(),200)),Ye=!1,je=null,Vt="text",Fe="padding",Ue="all",at="all",Oe="tl",rt=""}function co(e){Te(),He();let t=(e.classList||[]).filter(o=>o.trim());he=new Set(t),it=t.join(" "),Ye=!1,je=null,Vt=qo(t),Fe="padding",Ue="all",at="all",Oe="tl",rt="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
    <div class="vx-sp-header" id="vx-sp-drag-handle">
      <span class="vx-sp-title">${Ut(e.tagName,t)}</span>
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
      ${ys()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),zt(s),s.__vxOnResize=()=>zt(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=dn(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),je=null,ke(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>He()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),He())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{he=new Set(it.split(" ").filter(Boolean)),Ye=!1,Q({type:"vx-editor:update-classes",classes:[...he],silent:!0}),ke(xs())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>Mo(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(rt=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=ys(),ke(xs()))}),ke("typography")}function ys(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=rt===t.id,n=t.id?[...he].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function xs(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function ke(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:po,spacing:vo,colors:uo,layout:mo,borders:go,effects:ho,classes:fo};t.innerHTML=(s[e]||s.classes)(),To(t)}function po(){let e=pe(/^font-(sans|serif|mono)$/)||"",t=pe(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=pe(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=pe(/^text-(left|center|right|justify)$/)||"text-left",o=pe(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=pe(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=pe(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",l=pe(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ge("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${ge("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,ve.sizes.map(d=>({label:d,value:`text-${d}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ge("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,ve.weights.map(d=>({label:d,value:`font-${d}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${bo(ve.aligns.map(d=>({value:`text-${d}`,label:d,icon:$o(d)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${ge("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,ve.leadings.map(d=>({label:d,value:`leading-${d}`})))}
        ${ge("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,ve.trackings.map(d=>({label:d,value:`tracking-${d}`})))}
        ${ge("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,ve.transforms.map(d=>({label:d,value:d})))}
        ${ge("Decoration","^(no-underline|underline|line-through)$",l,ve.decorations.map(d=>({label:d,value:d})))}
      </div>
    </div>
  `}function vo(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[Fe]||(Fe="padding"),e[Fe].prefixes[Ue]||(Ue="all");let t=e[Fe],s=t.prefixes[Ue],n=wo(s),o=Eo(s)||"",i=Fe==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${ln(Object.keys(e).map(a=>({value:a,label:e[a].label})),Fe,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${Ue===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Js(a)}">
            ${Co(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${Js(Ue)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${ve.compactSpacings.map(a=>{let l=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${lt(l)?" vx-sp-pill-active":""}" data-set="${l}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${lt(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function uo(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=Vt||"text",s=t,n=ko(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${ve.specialColors.map(a=>{let l=`${s}-${a.name}`,d=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,p=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${lt(l)?" vx-sp-dot-active":""}" data-set="${l}" data-pattern="${n}" style="${d}${p}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=je?ve.colors.find(a=>a.name===je):null;return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-stage">
      ${i?`
        <div class="vx-shade-stage-header">
          <button class="vx-shade-back" data-family-back>&larr; Colors</button>
          <span class="vx-shade-title">${i.name}</span>
        </div>
        <div class="vx-shade-grid">${Object.entries(i.shades).map(([a,l])=>{let d=`${s}-${i.name}-${a}`;return`<button class="vx-sp-shade${lt(d)?" vx-sp-shade-active":""}" data-set="${d}" data-pattern="${n}" data-toggle="false" style="background:${l}" title="${a}"><span class="vx-sp-shade-num">${a}</span></button>`}).join("")}</div>
      `:`
        <div class="vx-sp-color-families">${ve.colors.map(a=>{let l=je===a.name,d=pe(new RegExp(`^${s}-${a.name}-\\d+$`));return`<button class="vx-sp-color-family${l?" vx-sp-fam-active":""}${d?" vx-sp-fam-used":""}" data-family="${a.name}" style="background:${a.shades[500]}" title="${a.name}"></button>`}).join("")}</div>
      `}
    </div>
  </div>`,o}function mo(){let e=xo(),t=pe(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=pe(/^gap(?:-[xy])?-/)||"",a=pe(/^grid-cols-\d+$/)||"",l=pe(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${yo(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${ge("Direction","^flex-(row|col|row-reverse|col-reverse)$",pe(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${ge("Justify","^justify-(start|center|end|between|around|evenly)$",pe(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${ge("Align","^items-(start|center|end|stretch|baseline)$",pe(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${ge("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...ve.gaps.map(d=>({label:d,value:`gap-${d}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${ge("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...ve.gridCols.map(d=>({label:d,value:`grid-cols-${d}`}))])}
          ${ge("Rows","^grid-rows-\\d+$",l,[{label:"Auto",value:""},...ve.gridRows.map(d=>({label:d,value:`grid-rows-${d}`}))])}
          ${ge("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...ve.gaps.slice(1).map(d=>({label:d,value:`gap-${d}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${ge("Position","^(static|relative|absolute|fixed|sticky)$",t,ve.positions.map(d=>({label:d,value:d})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${ge("Top","^top-",pe(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",ve.coordinates.map(d=>({label:d,value:`top-${d}`})))}
          ${ge("Right","^right-",pe(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",ve.coordinates.map(d=>({label:d,value:`right-${d}`})))}
          ${ge("Bottom","^bottom-",pe(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",ve.coordinates.map(d=>({label:d,value:`bottom-${d}`})))}
          ${ge("Left","^left-",pe(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",ve.coordinates.map(d=>({label:d,value:`left-${d}`})))}
        </div>
      </div>
    `:""}
  `}function go(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=at==="all"?"all":Oe;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${ve.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${lt(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${ge("Style","^border-(solid|dashed|dotted|double|none)$",pe(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...ve.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${ln([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],at==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${Oe==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${Oe==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${Oe==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${Oe==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${at==="all"?"ALL":Oe.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${ve.radii.map(s=>{let n=Lo(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${lt(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${So(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function ho(){let e=Bo();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${lt(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function fo(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...he].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function ge(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${ft(o.value)}"${s===o.value?" selected":""}>${bt(o.label)}</option>`).join("")}
    </select>
  </div>`}function ln(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${bt(i.label)}</button>`).join("")}
  </div>`}function bo(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${ft(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function yo(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function xo(){let e=pe(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function wo(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function ko(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function Eo(e){let t=pe(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function Js(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function Co(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function $o(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function Lo(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function So(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function Bo(){let e=pe(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function lt(e){let t=rt;return he.has(t?t+":"+e:e)}function fs(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=rt,i=o?o+":":"",a=t?new RegExp(t):null,l=e?i+e:"",d=!!l&&he.has(l);if(a)for(let c of[...he])if(o){if(c.startsWith(i)){let g=c.slice(i.length);a.test(g)&&he.delete(c)}}else!/^(sm|md|lg|xl|2xl):/.test(c)&&a.test(c)&&he.delete(c);l&&(!s||!d)&&he.add(l),Ye=!0,Q({type:"vx-editor:update-classes",classes:[...he],silent:!0});let p=document.getElementById("vx-sp-breakpoints");p&&(p.innerHTML=ys()),n&&ke(xs())}function pe(e){let t=rt;for(let s of he)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function To(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";fs(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";fs(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{je=je===n.dataset.family?null:n.dataset.family,ke("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{je=null,ke("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{Vt=n.dataset.cprop||"text",je=null,ke("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Fe=n.dataset.spaceMode||"padding",Ue="all",ke("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{Ue=n.dataset.spaceSide||"all",ke("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{at=n.dataset.radiusMode==="corners"?"corners":"all",ke("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{Oe=n.dataset.radiusCorner||"tl",at="corners",ke("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");fs(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>ke("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{he.add(i)}),Ye=!0,Q({type:"vx-editor:update-classes",classes:[...he],silent:!0}),s.value="",ke("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;he.delete(i),Ye=!0,Q({type:"vx-editor:update-classes",classes:[...he],silent:!0}),o.remove()}}})}async function Mo(e){let t=[...he].join(" ");if(t===it){He({revertUnsaved:!1});return}nt.push({type:"text",filePath:e.filePath,originalHTML:`class="${it}"`,newHTML:`class="${t}"`,timestamp:Date.now()}),Ye=!1,He({revertUnsaved:!1}),ce("Saving & compiling\u2026"),await Mt(),Q({type:"vx-editor:update-classes",classes:[...he],silent:!0}),setTimeout(()=>{let s=document.getElementById("preview-iframe");s&&s.contentWindow&&s.contentWindow.postMessage("voxelsite:reload","*")},500)}function dn(e,t){let s=!1,n,o,i,a,l=!1,d=g=>{if(g.target.closest("button, input, select"))return;s=!0;let r=g.touches?g.touches[0]:g;n=r.clientX,o=r.clientY;let u=e.getBoundingClientRect();i=u.left,a=u.top,t.style.cursor="grabbing",g.preventDefault(),l||(l=!0,document.addEventListener("mousemove",p),document.addEventListener("touchmove",p,{passive:!1}),document.addEventListener("mouseup",c),document.addEventListener("touchend",c))},p=g=>{if(!s)return;let r=g.touches?g.touches[0]:g,u=12,v=e.getBoundingClientRect(),h=v.width||300,f=v.height||500,b=i+r.clientX-n,m=a+r.clientY-o,L=u,E=Math.max(u,window.innerWidth-h-u),T=52,B=Math.max(T,window.innerHeight-f-u),q=Math.min(Math.max(b,L),E),H=Math.min(Math.max(m,T),B);e.style.left=`${q}px`,e.style.top=`${H}px`,e.style.right="auto"},c=()=>{s&&(s=!1,t.style.cursor="",l&&(l=!1,document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c)))};return t.addEventListener("mousedown",d),t.addEventListener("touchstart",d,{passive:!1}),()=>{t.removeEventListener("mousedown",d),t.removeEventListener("touchstart",d),l&&(document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c))}}var ze=null;function ot(){let e=document.getElementById("vx-ai-panel");e&&(ze&&(ze.abort(),ze=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>e.remove(),180))}function Io(e){Te(),He(),ot();let t=Ut(e.tagName,e.classList),s=(e.text||"").substring(0,80).replace(/\s+/g," ").trim(),n=document.createElement("div");n.id="vx-ai-panel",n.className="vx-ai-panel",n.tabIndex=-1,n.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${bt(t)}</span>
      </div>
      <div class="vx-ai-header-right">
        <span class="vx-sp-drag-hint">\u22EE\u22EE</span>
        <button class="vx-sp-close" id="vx-ai-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    ${s?`<div class="vx-ai-preview">${bt(s.length>=78?s+"\u2026":s)}</div>`:""}
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
    </div>`,document.body.appendChild(n),zt(n),n.__vxOnResize=()=>zt(n),window.addEventListener("resize",n.__vxOnResize),requestAnimationFrame(()=>n.classList.add("vx-ai-visible")),n.__vxDestroyDrag=dn(n,n.querySelector("#vx-ai-drag-handle"));let o=n.querySelector("#vx-ai-input"),i=n.querySelector("#vx-ai-send"),a=n.querySelector("#vx-ai-cancel-btn"),l=n.querySelector("#vx-ai-status"),d=n.querySelector("#vx-ai-status-text"),p=n.querySelector("#vx-ai-close");setTimeout(()=>o==null?void 0:o.focus(),200),p.addEventListener("click",()=>ot()),n.addEventListener("keydown",u=>{u.key==="Escape"&&(u.preventDefault(),ot())}),o.addEventListener("keydown",u=>{u.key==="Enter"&&!u.shiftKey&&(u.preventDefault(),r())}),i.addEventListener("click",r),a.addEventListener("click",()=>{ze&&(ze.abort(),ze=null),g()});function c(){o.disabled=!0,i.hidden=!0,a.hidden=!1,l.hidden=!1,d.textContent="Reading your site\u2026"}function g(){o.disabled=!1,i.hidden=!1,a.hidden=!0,l.hidden=!0,o.focus()}async function r(){let u=o.value.trim();if(!u)return;ot(),Q({type:"vx-editor:show-ai-overlay",status:"AI is editing\u2026"}),ze=new AbortController;let v=e.outerHTML||"",h=e.filePath||Wt();try{await st("/ai/prompt",{user_prompt:u,action_type:"section_edit",page_scope:h,action_data:{path:h,sectionHtml:v.substring(0,15e3)}},{signal:ze.signal,onStatus(f){Q({type:"vx-editor:update-ai-status",status:f||"Working\u2026"})},onFile(){Q({type:"vx-editor:update-ai-status",status:"Applying changes\u2026"})},onToken(){Q({type:"vx-editor:update-ai-status",status:"Generating\u2026"})},onError(f){Q({type:"vx-editor:hide-ai-overlay"}),ce(f.message||"AI edit failed",!0)},onDone(f){if(ze=null,Q({type:"vx-editor:hide-ai-overlay"}),f.cancelled){ce("Generation cancelled",!1);return}(f.files_modified||[]).length>0?(ce("Section updated \u2713"),setTimeout(()=>{let m=document.getElementById("preview-iframe");m!=null&&m.contentWindow&&m.contentWindow.postMessage("voxelsite:reload","*")},400)):f.partial||ce("No changes made",!1)},onWarning(f){typeof window.showToast=="function"&&window.showToast(f,"warning")}})}catch(f){f.name!=="AbortError"&&ce("AI edit failed",!0),Q({type:"vx-editor:hide-ai-overlay"})}}}var Qs=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function Ao(e){Te(),He(),ot();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let b of Qs)(t.includes(b.id)||t.includes(b.label.toLowerCase()))&&s.add(b.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${bt(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${Qs.map(b=>{let m=s.has(b.id);return`
            <button class="vx-section-card${m?" vx-section-card-exists":""}" data-section-type="${b.id}" data-section-label="${ft(b.label)}" data-section-desc="${ft(b.description)}">
              <div class="vx-section-card-icon">${b.icon}</div>
              <div class="vx-section-card-label">${b.label}</div>
              <div class="vx-section-card-desc">${b.description}</div>
              ${m?'<div class="vx-section-card-badge">On page</div>':""}
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>n.remove(),200)},a=b=>{b.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),n.addEventListener("click",b=>{b.target===n&&i()}),n.tabIndex=-1,n.focus();let l=null,d=null,p=n.querySelector("#vx-section-footer"),c=n.querySelector("#vx-section-footer-type"),g=n.querySelector("#vx-section-instruction"),r=n.querySelector("#vx-section-generate"),u=n.querySelector("#vx-section-change"),v=n.querySelector(".vx-section-picker-grid"),h={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(b=>{b.addEventListener("click",()=>{l=b.dataset.sectionLabel,d=b.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(m=>m.classList.remove("vx-section-card-selected")),b.classList.add("vx-section-card-selected"),c.textContent=l,g.placeholder=h[l]||"Optional: describe what you want\u2026",g.value="",p.hidden=!1,v.classList.add("vx-section-grid-collapsed"),setTimeout(()=>g.focus(),100)})}),u.addEventListener("click",()=>{l=null,d=null,p.hidden=!0,v.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(b=>b.classList.remove("vx-section-card-selected"))});let f=()=>{if(!l)return;let b=g.value.trim();i(),_o(e,l,d,b)};r.addEventListener("click",f),g.addEventListener("keydown",b=>{b.key==="Enter"&&(b.preventDefault(),f())})}async function _o(e,t,s,n=""){Q({type:"vx-editor:show-ai-overlay",status:`Adding ${t}\u2026`});let o=e.filePath||Wt(),i=new AbortController,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let l=Date.now(),d=0,p=()=>{if(d>0){let u=d.toLocaleString();Q({type:"vx-editor:update-ai-status",status:`Generating ${t}\u2026 (${u} tokens)`})}else Math.round((Date.now()-l)/1e3)>=6&&Q({type:"vx-editor:update-ai-status",status:`Preparing ${t}\u2026`})},c=setInterval(p,1e3),g=0,r=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await st("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onStatus(u){Q({type:"vx-editor:update-ai-status",status:u||`Adding ${t}\u2026`})},onFile(){Q({type:"vx-editor:update-ai-status",status:"Writing files\u2026"})},onToken(){d++;let u=Date.now();u-g>500&&(g=u,p())},onError(u){clearInterval(c),Q({type:"vx-editor:hide-ai-overlay"}),ce(u.message||"Failed to add section",!0)},onDone(u){if(clearInterval(c),Q({type:"vx-editor:hide-ai-overlay"}),u.cancelled){ce("Generation cancelled",!1);return}(u.files_modified||[]).length>0?(ce(`${t} added \u2713`),setTimeout(()=>{let h=document.getElementById("preview-iframe");h!=null&&h.contentWindow&&h.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{Q({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{Q({type:"vx-editor:scroll-to-section",sectionIndex:r}),Q({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):u.partial||ce("No changes made",!1)},onWarning(u){typeof window.showToast=="function"&&window.showToast(u,"warning")}})}catch(u){clearInterval(c),u.name!=="AbortError"&&ce("Failed to add section",!0),Q({type:"vx-editor:hide-ai-overlay"})}}function Po(e){Te();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelector("[data-close]").addEventListener("click",s),t.addEventListener("click",o=>{o.target===t&&s()}),t.tabIndex=-1,t.focus(),jo(t)}async function jo(e){let t=e.querySelector("#vx-img-grid");try{let s=await M.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",()=>{Q({type:"vx-editor:swap-image",src:o.dataset.path}),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function Ho(e){Te();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${ft(e.href||"")}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${ft(e.text||"")}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",s)),t.addEventListener("click",o=>{o.target===t&&s()}),document.getElementById("vx-link-save").addEventListener("click",()=>{Q({type:"vx-editor:update-link",href:document.getElementById("vx-link-href").value.trim(),text:document.getElementById("vx-link-text").value.trim()}),s()}),setTimeout(()=>{var o;return(o=document.getElementById("vx-link-href"))==null?void 0:o.focus()},100)}async function Ro(e){let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||Wt();try{let a=await M.get(`/files/content?path=${encodeURIComponent(i)}`);if(!a.ok){console.warn("[VX] Cannot read file for image save:",i),ce("Save failed",!0);return}let l=a.data.content,d=!1,p=`src="${s}"`;if(l.includes(p)&&(l=l.replace(p,`src="${n}"`),d=!0),!d&&l.includes(s)&&(l=l.replace(s,n),d=!0),!d&&o){let g=en(l,o,n);g!==!1&&(l=g,d=!0)}if(d){(await M.put("/files/content",{path:i,content:l})).ok?ce("Saved"):ce("Save failed",!0);return}let c=await M.get("/files");if(c.ok){let g=(c.data.files||[]).filter(r=>r.path.endsWith(".php")&&r.path!==i);for(let r of g){let u=await M.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!u.ok||!u.data.content)continue;let v=u.data.content;if(v.includes(p)&&(v=v.replace(p,`src="${n}"`),(await M.put("/files/content",{path:r.path,content:v})).ok)){ce(`Saved \u2192 ${r.path.split("/").pop()}`);return}if(v.includes(s)&&(v=v.replace(s,n),(await M.put("/files/content",{path:r.path,content:v})).ok)){ce(`Saved \u2192 ${r.path.split("/").pop()}`);return}if(o){let h=en(v,o,n);if(h!==!1&&(await M.put("/files/content",{path:r.path,content:h})).ok){ce(`Saved \u2192 ${r.path.split("/").pop()}`);return}}}}console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),ce("Save failed \u2014 source not found",!0)}catch(a){console.error("[VX] Image save error:",a),ce("Save failed",!0)}}function en(e,t,s){let n=e.split("<img");for(let o=1;o<n.length;o++){let i=n[o];if(!i.includes(`alt="${t}"`)&&!i.includes(`alt='${t}'`))continue;let a=i.indexOf("src=");if(a===-1)continue;let l=i[a+4];if(l!=='"'&&l!=="'")continue;let d=a+5,p=i.indexOf(l,d);if(p!==-1)return n[o]=i.substring(0,d)+s+i.substring(p),n.join("<img")}return!1}function ws(e){nt.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,timestamp:Date.now()}),clearTimeout(ws._timer),ws._timer=setTimeout(()=>Mt(),800)}function ks(e){nt.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,timestamp:Date.now()}),clearTimeout(ks._timer),ks._timer=setTimeout(()=>Mt(),300)}async function Mt(){var t;if(hs||nt.length===0)return;hs=!0;let e=[...nt];nt=[];try{let s={};for(let i of e){let a=i.filePath||Wt();s[a]||(s[a]=[]),s[a].push(i)}let n=!1,o={filesByMain:new Map,contentByPath:new Map};for(let[i,a]of Object.entries(s))try{let l=await M.get(`/files/content?path=${encodeURIComponent(i)}`);if(!l.ok){console.error("[VX] Cannot read:",i);continue}let d=l.data.content,p=!1;for(let c of a){let g=c.type==="delete"?c.outerHTML:c.originalHTML;if(g)if(d.includes(g))d=c.type==="delete"?d.replace(g,""):d.replace(g,c.newHTML),p=!0;else{if(await Do(i,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",g.substring(0,80))}}if(p){let c=await M.put("/files/content",{path:i,content:d});c.ok?(ce("Saved"),(t=c.data)!=null&&t.tailwindCompiled&&(n=!0)):ce("Save failed",!0)}}catch(l){console.error("[VX] Save error:",l),ce("Save failed",!0)}n&&setTimeout(()=>{let i=document.getElementById("preview-iframe");i!=null&&i.contentWindow&&i.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{hs=!1,nt.length>0&&setTimeout(()=>Mt(),0)}}async function Do(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let l=await M.get("/files");if(!l.ok)return!1;a=(l.data.files||[]).filter(d=>d.path.endsWith(".php")&&d.path!==e).filter(d=>o.some(p=>d.path.includes(p+"/"))||d.path.includes("partial")||d.path.includes("header")||d.path.includes("footer")||d.path.includes("nav")),i.filesByMain.set(e,a)}for(let l of a){let d=i.contentByPath.get(l.path);if(d==null){let p=await M.get(`/files/content?path=${encodeURIComponent(l.path)}`);if(!p.ok||!p.data.content)continue;d=p.data.content,i.contentByPath.set(l.path,d)}if(d.includes(n)){let p=t.type==="delete"?d.replace(n,""):d.replace(n,t.newHTML);if((await M.put("/files/content",{path:l.path,content:p})).ok)return i.contentByPath.set(l.path,p),ce(`Saved \u2192 ${l.path.split("/").pop()}`),!0}}}catch(a){console.error("[VX] Partial search error:",a)}return!1}function cn(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",Pe),e.title=Pe?"Exit visual editor (V)":"Visual editor (V)"),document.body.classList.toggle("vx-editing",Pe)}function ce(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(ce._timer),ce._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function Q(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function Wt(){return window.__vsCurrentPreviewPath||"index.php"}function zt(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),l=a.right-s-o,d=Math.max(o,a.left+10),p=Math.max(o,window.innerWidth-s-o),c=Math.min(Math.max(l,d),p),g=Math.max(a.top+12,i),r=Math.max(i,window.innerHeight-n-o),u=Math.min(g,r);e.style.left=`${c}px`,e.style.top=`${u}px`,e.style.right="auto"}function qo(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function ft(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function bt(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var C={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>',userPlus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',lock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',shield:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>',trash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',zap:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',copy2:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'};var pn=typeof document<"u"?document.createElement("span"):null;function x(e){return e?(pn.textContent=e,pn.innerHTML):""}function Ce(e){return e?String(e).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/</g,"&lt;").replace(/>/g,"&gt;"):""}var No={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function It(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(No))if(t.endsWith(s))return n;return"plaintext"}function Fo(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function A(e,t="success",s=3200){if(!e)return;let n=Fo(),o=document.createElement("div"),i=["success","error","warning"].includes(t)?t:"success";o.className=`vs-toast vs-toast-${i}`,o.innerHTML=`<span>${x(String(e))}</span>`,n.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(-6px)",setTimeout(()=>o.remove(),220)},s)}window.showToast=A;function fe(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function be({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var c,g;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let l=document.createElement("div");l.id="vs-confirm-overlay",l.className="vs-modal-overlay",l.innerHTML=`
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
    `;let d=r=>{r.key==="Escape"&&(r.preventDefault(),p(!1))},p=r=>{document.removeEventListener("keydown",d),fe(l),i(r)};document.body.appendChild(l),requestAnimationFrame(()=>l.classList.add("is-visible")),l.addEventListener("click",r=>{r.target===l&&p(!1)}),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>p(!1)),(g=document.getElementById("vs-confirm-ok"))==null||g.addEventListener("click",()=>p(!0)),document.addEventListener("keydown",d),setTimeout(()=>{var r;return(r=document.getElementById("vs-confirm-ok"))==null?void 0:r.focus()},220)})}function Ls({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text",helpText:l="",inputPattern:d=""}){return new Promise(p=>{var f,b;let c=document.getElementById("vs-prompt-overlay");c&&c.remove();let g=document.createElement("div");g.id="vs-prompt-overlay",g.className="vs-modal-overlay";let r=d?` pattern="${x(d)}"`:"",u=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${x(n)}" style="resize: vertical;">${x(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${x(n)}" value="${x(o)}"${r}>`;g.innerHTML=`
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
    `;let v=m=>{fe(g),p(m)};document.body.appendChild(g),requestAnimationFrame(()=>g.classList.add("is-visible"));let h=g.querySelector("#vs-prompt-input");setTimeout(()=>h==null?void 0:h.focus(),220),g.addEventListener("click",m=>{m.target===g&&v(null)}),(f=g.querySelector("#vs-prompt-cancel"))==null||f.addEventListener("click",()=>v(null)),(b=g.querySelector("#vs-prompt-ok"))==null||b.addEventListener("click",()=>{v(((h==null?void 0:h.value)||"").trim())}),h==null||h.addEventListener("keydown",m=>{a==="textarea"?m.key==="Enter"&&(m.metaKey||m.ctrlKey)&&(m.preventDefault(),v(((h==null?void 0:h.value)||"").trim())):m.key==="Enter"&&(m.preventDefault(),v(((h==null?void 0:h.value)||"").trim())),m.key==="Escape"&&(m.preventDefault(),v(null))})})}var At=null;function vn(){return`
    <div class="vs-editor-layout">
      <!-- File Tree Sidebar -->
      <div id="editor-sidebar" class="vs-editor-sidebar" style="position: relative; display: flex; flex-direction: column;">
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
              <div class="vs-empty-state-icon">${C.fileCode}</div>
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
  `}async function un(){var ye;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(S=>S.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(S=>S.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),l=document.getElementById("editor-host"),d=document.getElementById("editor-empty-state"),p=document.getElementById("editor-monaco-container"),c=document.getElementById("editor-file-info"),g=document.getElementById("editor-status"),r=document.getElementById("editor-save-btn"),u=document.getElementById("editor-refresh-tree"),v=document.getElementById("editor-new-file"),h=document.getElementById("editor-sidebar"),f=document.getElementById("editor-sidebar-resize"),b=document.getElementById("editor-font-size-select"),m=document.getElementById("editor-word-wrap-btn");b&&(b.value=t.fontSize);let L=()=>{m&&(t.wordWrap?(m.style.color="var(--vs-accent)",m.style.backgroundColor="var(--vs-accent-dim)"):(m.style.color="var(--vs-text-ghost)",m.style.backgroundColor="transparent"))};L();let E=(S,P="muted")=>{g&&(g.textContent=S,g.dataset.state=P)},T=S=>{let P=t.files.find(_=>_.path===S);return(P==null?void 0:P.readonly)===!0},B=S=>{let P=S.toLowerCase();return P.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':P.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':P.endsWith(".js")||P.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},q=(S,P="")=>{let _=[],j={},V=Y=>{if(j[Y])return j[Y];let W=Y.split("/"),X=W[W.length-1],ie=W.slice(0,-1).join("/"),J=P?P+Y:Y,ae={name:X,path:J,type:"folder",children:[]};return j[Y]=ae,ie?V(ie).children.push(ae):_.push(ae),ae};for(let Y of S){let X=(P&&Y.path.startsWith(P)?Y.path.substring(P.length):Y.path).split("/");if(X.length===1)_.push({name:X[0],path:Y.path,type:"file",meta:Y});else{let ie=X.slice(0,-1).join("/");V(ie).children.push({name:X[X.length-1],path:Y.path,type:"file",meta:Y})}}let K=Y=>{Y.sort((W,X)=>W.type!==X.type?W.type==="folder"?-1:1:W.name.localeCompare(X.name));for(let W of Y)W.type==="folder"&&K(W.children)};return K(_),_},H=()=>{if(!n)return;let S=(K,Y=0)=>K.map(W=>{var pt,Nt;if(W.type==="folder"){let Ct=t.expandedFolders.has(W.path);return`
            <div class="vs-tree-item" data-folder="${x(W.path)}" style="--tree-indent: ${Y};">
              <span class="vs-tree-folder-toggle" data-expanded="${Ct}">${C.chevronRight}</span>
              <span class="vs-tree-item-icon">${Ct?C.folderOpen||C.folder:C.folder}</span>
              <span class="vs-tree-item-name">${x(W.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${x(W.path)}" data-collapsed="${!Ct}">
              ${S(W.children,Y+1)}
            </div>
          `}let X=t.activeTab===W.path,ie=t.openTabs.find(Ct=>Ct.path===W.path),J=ie!=null&&ie.dirty?" \u2022":"",Ae=T(W.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",Se=((pt=W.meta)==null?void 0:pt.custom)===!0,Be=((Nt=W.meta)==null?void 0:Nt.protected)===!0,Qe="";return W.path==="assets/css/tailwind.css"?Qe=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:Be?Se&&(Qe=`
            <button class="vs-tree-item-restore" data-restore-file="${x(W.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):Qe=`
            <button class="vs-tree-item-delete" data-delete-file="${x(W.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${x(W.path)}" data-active="${X}" style="--tree-indent: ${Y};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${B(W.path)}</span>
            <span class="vs-tree-item-name">${x(W.name)}${Ae}${J}</span>
            ${Qe}
          </div>
        `}).join(""),P=(K,Y,W)=>{let X=W.querySelector(".vs-explorer-caret");t.expandedSections.has(K)?(Y.style.display="block",W.classList.add("is-expanded")):(Y.style.display="none",W.classList.remove("is-expanded"))},_=document.querySelector('[data-section="site"]'),j=document.querySelector('[data-section="config"]'),V=document.querySelector('[data-section="prompts"]');_&&P("site",n,_),j&&o&&P("config",o,j),V&&i&&P("prompts",i,V),n.innerHTML=S(t.treeData.site),o&&(o.innerHTML=S(t.treeData.config)),i&&(i.innerHTML=S(t.treeData.prompts)),le()},U=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(S=>{let P=S.path===t.activeTab,_=S.path.split("/").pop(),V=T(S.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${x(S.path)}" data-active="${P}" data-dirty="${S.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${x(_)}${V}</span>
          <button class="vs-editor-tab-close" data-close-tab="${x(S.path)}" title="Close">${C.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',xe(),N()}},w=null,$=S=>{if(!a)return;let P=8,_=()=>{a.scrollLeft+=S==="left"?-P:P,N()};_(),w=setInterval(_,16)},y=()=>{w&&(clearInterval(w),w=null)},N=()=>{let S=document.getElementById("editor-tab-scroll-left"),P=document.getElementById("editor-tab-scroll-right");if(!a||!S||!P)return;let _=a.scrollLeft>0,j=a.scrollLeft<a.scrollWidth-a.clientWidth-1;S.style.display=_?"flex":"none",P.style.display=j?"flex":"none"};a&&(a.addEventListener("scroll",N,{passive:!0}),window.addEventListener("resize",N,{passive:!0}));let O=document.getElementById("editor-tab-scroll-left"),k=document.getElementById("editor-tab-scroll-right");O&&(O.addEventListener("mousedown",()=>$("left")),O.addEventListener("mouseup",y),O.addEventListener("mouseleave",y)),k&&(k.addEventListener("mousedown",()=>$("right")),k.addEventListener("mouseup",y),k.addEventListener("mouseleave",y));let I=()=>{d&&(d.style.display="none"),p&&(p.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},R=async S=>{if(t.disposed)return;let P=t.openTabs.find(Y=>Y.path===S);if(P){await z(S);return}E("Loading\u2026");let{ok:_,data:j,error:V}=await M.get(`/files/content?path=${encodeURIComponent(S)}`);if(!_){A((V==null?void 0:V.message)||"Could not load file.","error"),E("Load failed","error");return}let K=typeof(j==null?void 0:j.content)=="string"?j.content:"";P={path:S,baseline:K,dirty:!1},t.openTabs.push(P),I(),await z(S),D(K,S),E("Ready"),s()},z=async S=>{if(t.disposed)return;let P=t.openTabs.find(j=>j.path===t.activeTab);P&&t.monacoInstance&&(P._buffer=t.monacoInstance.getValue()),t.activeTab=S;let _=t.openTabs.find(j=>j.path===S);if(_&&t.monacoInstance){let j=_._buffer!==void 0?_._buffer:_.baseline;D(j,S)}oe(),de(),U(),setTimeout(()=>{if(a){let j=a.querySelector('.vs-editor-tab[data-active="true"]');if(j){let V=j.getBoundingClientRect(),K=a.getBoundingClientRect();V.left<K.left?a.scrollBy({left:V.left-K.left,behavior:"smooth"}):V.right>K.right&&a.scrollBy({left:V.right-K.right,behavior:"smooth"})}}},10),H(),s()},Z=async S=>{let P=t.openTabs.find(j=>j.path===S);if(P!=null&&P.dirty&&!await be({title:"Discard unsaved changes?",description:`"${S}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let _=t.openTabs.findIndex(j=>j.path===S);if(_!==-1){if(t.openTabs.splice(_,1),t.activeTab===S){let j=t.openTabs[Math.min(_,t.openTabs.length-1)];j?await z(j.path):(t.activeTab=null,ne(),oe(),de())}U(),H(),s()}},se=async S=>{var Y,W;if((Y=window.demoGuard)!=null&&Y.call(window)||(W=window.viewerGuard)!=null&&W.call(window))return;let P=S.split("/").pop();if(!await be({title:"Delete file?",description:`Are you sure you want to permanently delete "${P}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;E("Deleting\u2026");let{ok:j,error:V}=await M.delete(`/files?path=${encodeURIComponent(S)}`);if(!j){A((V==null?void 0:V.message)||"Could not delete file.","error"),E("Delete failed","error");return}let K=t.openTabs.findIndex(X=>X.path===S);if(K!==-1){if(t.openTabs.splice(K,1),t.activeTab===S){let X=t.openTabs[Math.min(K,t.openTabs.length-1)];X?await z(X.path):(t.activeTab=null,ne(),oe(),de())}U()}await G(),s(),A(`Deleted ${P}`,"success"),E("Ready")},re=async S=>{var Y,W;if((Y=window.demoGuard)!=null&&Y.call(window)||(W=window.viewerGuard)!=null&&W.call(window))return;let P=S.split("/").pop();if(!await be({title:"Reset system prompt?",description:`Are you sure you want to reset "${P}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;E("Resetting\u2026");let{ok:j,error:V}=await M.delete(`/files?path=${encodeURIComponent(S)}`);if(!j){A((V==null?void 0:V.message)||"Could not reset file.","error"),E("Reset failed","error");return}let K=t.openTabs.findIndex(X=>X.path===S);if(K!==-1){let{ok:X,data:ie}=await M.get(`/files/content?path=${encodeURIComponent(S)}`);if(X&&typeof(ie==null?void 0:ie.content)=="string"){let J=t.openTabs[K];J.baseline=ie.content,J.dirty=!1,J._buffer=ie.content,t.activeTab===S&&D(ie.content,S)}}de(),await G(),s(),A(`Reset ${P} to default`,"success"),E("Ready")},D=(S,P)=>{var j;if(!t.monacoInstance||!t.monaco)return;let _=t.monacoInstance.getModel();_&&(t.monacoInstance.setValue(S),t.monaco.editor.setModelLanguage(_,It(P)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||!((j=window.canWrite)!=null&&j.call(window))||T(P)}))},ne=()=>{d&&(d.style.display=""),p&&(p.style.display="none")},oe=()=>{if(!c)return;if(!t.activeTab){c.textContent="No file open";return}let S=t.openTabs.find(V=>V.path===t.activeTab),P=t.files.find(V=>V.path===t.activeTab),_=P!=null&&P.size?`${(Number(P.size)/1024).toFixed(1)} KB`:"",j=It(t.activeTab).toUpperCase();c.textContent=[t.activeTab,j,_].filter(Boolean).join(" \u2022 ")},de=()=>{var _;if(!r)return;let S=t.openTabs.find(j=>j.path===t.activeTab);if(t.activeTab?T(t.activeTab)||!((_=window.canWrite)!=null&&_.call(window)):!1){r.disabled=!0,r.textContent="Read-Only",r.classList.remove("vs-btn-primary"),r.classList.add("vs-btn-ghost");return}if(!S||!S.dirty){r.disabled=!0,r.textContent="Saved",r.classList.remove("vs-btn-primary"),r.classList.add("vs-btn-ghost");return}r.disabled=!1,r.textContent="Save",r.classList.remove("vs-btn-ghost"),r.classList.add("vs-btn-primary")},me=()=>{let S=t.openTabs.find(j=>j.path===t.activeTab);if(!S||!t.monacoInstance)return;let P=t.monacoInstance.getValue(),_=S.dirty;S.dirty=P!==S.baseline,_!==S.dirty&&(de(),U(),S.dirty?E("Unsaved changes","warning"):E("Ready"))},ue=async()=>{var K,Y,W,X,ie;if((K=window.demoGuard)!=null&&K.call(window)||(Y=window.viewerGuard)!=null&&Y.call(window))return;let S=t.openTabs.find(J=>J.path===t.activeTab);if(!S||!S.dirty||!t.monacoInstance)return;let P=t.monacoInstance.getValue();r.disabled=!0,r.textContent="Saving\u2026",E("Saving\u2026");let{ok:_,error:j}=await M.put("/files/content",{path:S.path,content:P});if(!_){r.disabled=!1,r.textContent="Save",A((j==null?void 0:j.message)||"Could not save file.","error"),E("Save failed","error");return}S.baseline=P,S.dirty=!1,S._buffer=P,de(),U(),H(),E("Saved","success"),A(`Saved ${S.path}`,"success"),S.path.toLowerCase().endsWith(".css")?(W=window.sendPreviewMessage)==null||W.call(window,"voxelsite:reload-css"):(X=window.sendPreviewMessage)==null||X.call(window,"voxelsite:reload"),setTimeout(()=>{var J;return(J=window.refreshPreview)==null?void 0:J.call(window)},400),(ie=window.refreshPublishState)==null||ie.call(window,{silent:!0});let V=t.openTabs.find(J=>J.path==="assets/css/tailwind.css");V&&S.path!=="assets/css/tailwind.css"&&M.get("/files/content?path=assets/css/tailwind.css").then(({ok:J,data:ae})=>{J&&typeof(ae==null?void 0:ae.content)=="string"&&(V.baseline=ae.content,V._buffer=ae.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(ae.content))})},le=()=>{let S=P=>{P&&(P.querySelectorAll("[data-file]").forEach(_=>{_.addEventListener("click",j=>{j.target.closest("[data-delete-file]")||R(_.dataset.file)})}),P.querySelectorAll("[data-delete-file]").forEach(_=>{_.addEventListener("click",j=>{j.stopPropagation(),se(_.dataset.deleteFile)})}),P.querySelectorAll("[data-restore-file]").forEach(_=>{_.addEventListener("click",j=>{j.stopPropagation(),re(_.dataset.restoreFile)})}),P.querySelectorAll("[data-compile-tailwind]").forEach(_=>{_.addEventListener("click",async j=>{var J,ae;if(j.stopPropagation(),(J=window.demoGuard)!=null&&J.call(window)||(ae=window.viewerGuard)!=null&&ae.call(window))return;_.style.opacity="0.4",_.style.pointerEvents="none",E("Compiling Tailwind\u2026");let{ok:V,data:K,error:Y}=await M.post("/files/compile-tailwind");if(_.style.opacity="",_.style.pointerEvents="",!V){A((Y==null?void 0:Y.message)||"Tailwind compilation failed.","error"),E("Compile failed","error");return}let W="assets/css/tailwind.css",X=t.openTabs.find(Ae=>Ae.path===W);X&&(X.baseline=K.content,X.dirty=!1,t.activeTab===W&&t.monacoInstance&&t.monacoInstance.setValue(K.content));let ie=K.class_count??0;A(`Tailwind CSS recompiled \u2014 ${ie} utilities.`,"success"),E("Compiled")})}),P.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(_=>{_.addEventListener("click",j=>{j.stopPropagation();let K=_.closest(".vs-tree-item").dataset.folder;t.expandedFolders.has(K)?t.expandedFolders.delete(K):t.expandedFolders.add(K),s(),H()})}))};S(n),S(o),S(i),document.querySelectorAll(".vs-explorer-section-header").forEach(P=>{P.dataset.bound||(P.dataset.bound="true",P.addEventListener("click",()=>{let _=P.dataset.section;t.expandedSections.has(_)?t.expandedSections.delete(_):t.expandedSections.add(_),s(),H()}))})},xe=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(S=>{S.addEventListener("click",P=>{P.target.closest("[data-close-tab]")||z(S.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(S=>{S.addEventListener("click",P=>{P.stopPropagation(),Z(S.dataset.closeTab)})}))};if(f&&h){let S=!1;f.addEventListener("mousedown",P=>{P.preventDefault(),S=!0,f.classList.add("is-dragging");let _=V=>{if(!S)return;let K=Math.min(400,Math.max(200,V.clientX));h.style.width=K+"px"},j=()=>{S=!1,f.classList.remove("is-dragging"),document.removeEventListener("mousemove",_),document.removeEventListener("mouseup",j)};document.addEventListener("mousemove",_),document.addEventListener("mouseup",j)})}r==null||r.addEventListener("click",ue),b==null||b.addEventListener("change",S=>{let P=parseInt(S.target.value,10);t.fontSize=P,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:P}),s()}),m==null||m.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,L(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),u==null||u.addEventListener("click",()=>G()),v==null||v.addEventListener("click",async()=>{var Y,W,X;if((Y=window.demoGuard)!=null&&Y.call(window)||(W=window.viewerGuard)!=null&&W.call(window))return;let S=await Ls({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!S||!S.trim())return;let P=S.trim(),_=(X=P.split(".").pop())==null?void 0:X.toLowerCase(),j=["php","css","js","json"];if(!_||!j.includes(_)){A(`Only ${j.join(", ")} files can be created.`,"warning");return}E("Creating\u2026");let{ok:V,error:K}=await M.post("/files/create",{path:P});if(!V){A((K==null?void 0:K.message)||"Could not create file.","error"),E("Create failed","error");return}await G(),await R(P),A(`Created ${P}`,"success")});let Le=S=>{if(t.disposed){document.removeEventListener("keydown",Le);return}(S.metaKey||S.ctrlKey)&&S.key==="s"&&(S.preventDefault(),ue())};document.addEventListener("keydown",Le);let G=async()=>{var j;let{ok:S,data:P,error:_}=await M.get("/files");if(!S||!((j=P==null?void 0:P.files)!=null&&j.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=P.files,t.treeData={site:q(P.files.filter(V=>!V.path.startsWith("_prompts/")&&!V.path.startsWith("_root/"))),config:q(P.files.filter(V=>V.path.startsWith("_root/")),"_root/"),prompts:q(P.files.filter(V=>V.path.startsWith("_prompts/")),"_prompts/")},H()},ee=async()=>{if(!p)return;let S;try{S=await mn()}catch{A("Monaco editor is not available.","warning");return}t.monaco=S;let P=_t();S.editor.setTheme(P);let _=S.editor.create(p,{value:"",language:"php",theme:P,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=_,_.onDidChangeModelContent(()=>me()),_.addCommand(S.KeyMod.CtrlCmd|S.KeyCode.KeyK,async()=>{if(t.monacoInstance.getOption(S.editor.EditorOption.readOnly)){A("Cannot use inline AI on a read-only file.","warning");return}let j=t.activeTab;if(!j)return;let V=t.monacoInstance.getModel(),K=t.monacoInstance.getSelection(),Y=V.getValueInRange(K);if(!Y||Y.trim()===""){let J=t.monacoInstance.getPosition(),ae=V.getLineContent(J.lineNumber);if(ae.trim()===""){A("Highlight a block of code to edit.","warning");return}Y=ae,t.monacoInstance.setSelection(new S.Range(J.lineNumber,1,J.lineNumber,V.getLineMaxColumn(J.lineNumber)))}let W=await Ls({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!W)return;let X=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let ie=document.createElement("div");ie.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",ie.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${C.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,p&&(p.style.position="relative",p.appendChild(ie)),E("AI is editing...","muted");try{await st("/ai/prompt",{user_prompt:W,action_type:"inline_edit",action_data:{path:j,selection:Y}},{onStatus:J=>{let ae=document.getElementById("ai-inline-status");ae&&(ae.textContent="Generating...")},onFile:()=>{let J=document.getElementById("ai-inline-status");J&&(J.textContent="Applying changes...")},onError:J=>{A(J.message||"Generation failed","error")},onDone:async J=>{var Ae;if((Ae=J.files_modified)==null?void 0:Ae.some(Se=>(typeof Se=="string"?Se:(Se==null?void 0:Se.path)||"").replace(/^\//,"")===j.replace(/^\//,""))){let{ok:Se,data:Be}=await M.get(`/files/content?path=${encodeURIComponent(j)}&_t=${Date.now()}`);if(Se&&(Be!=null&&Be.content)){let Qe=Be.content;await M.put("/files/content",{path:j,content:X}),t.monacoInstance.getModel().setValue(Qe);let pt=t.openTabs.find(Nt=>Nt.path===j);pt&&(pt._buffer=Qe,pt.baseline=X),me(),A("Review changes and save.","success")}}else J.partial||A("Complete (No changes made to this file)","info")}})}finally{t.monacoInstance.updateOptions({readOnly:!1}),ie.parentNode&&ie.parentNode.removeChild(ie),E("Ready","muted")}})};if(await Promise.all([G(),ee()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:S,active:P}=t._pendingRestore;t._pendingRestore=null;for(let _ of S){if(!t.files.some(K=>K.path===_))continue;let{ok:j,data:V}=await M.get(`/files/content?path=${encodeURIComponent(_)}`);j&&typeof(V==null?void 0:V.content)=="string"&&t.openTabs.push({path:_,baseline:V.content,dirty:!1})}if(t.openTabs.length>0){let _=P&&t.openTabs.find(j=>j.path===P)?P:t.openTabs[0].path;I(),await z(_),D(((ye=t.openTabs.find(j=>j.path===_))==null?void 0:ye.baseline)||"",_),E("Ready")}}}function _t(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function mn(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:At||(At=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,l){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw At=null,t}),At)}async function Ss(e=""){var H,U,w,$;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),l=s.querySelector("#vs-code-meta"),d=s.querySelector("#vs-code-status"),p=s.querySelector("#vs-code-editor-host"),c={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},g=(y,N="muted")=>{d&&(d.textContent=y,d.dataset.state=N)},r=()=>c.files.find(y=>y.path===c.path)||null,u=()=>!!c.editor&&c.editor.getValue()!==c.baseline,v=()=>{if(!l)return;let y=r();if(!y){l.textContent="No file selected";return}let N=y.size?`${(Number(y.size)/1024).toFixed(1)} KB`:"0 KB",O=y.modified?new Date(y.modified).toLocaleString():"Unknown date";l.textContent=`${y.path} \u2022 ${N} \u2022 ${O}`},h=()=>{if(!o)return;let y=u();o.disabled=!y,o.textContent=y?"Save Changes":"Saved",y?g("Unsaved changes","warning"):c.path&&g("Saved","success")},f=async()=>{var y;c.closed||u()&&!await be({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(c.closed=!0,(y=c.editorCleanup)!=null&&y.dispose&&(c.editorCleanup.dispose(),c.editorCleanup=null),c.editor&&(c.editor.dispose(),c.editor=null),fe(s))},b=(y,N=null)=>{if(!c.editor)return;c.editor.setValue(y),c.baseline=y;let O=(N==null?void 0:N.language)||It(c.path);c.editor.setLanguage&&c.editor.setLanguage(O),v(),h()},m=async(y,{silent:N=!1}={})=>{if(!y||!c.editor)return!1;c.path=y,N||g("Loading file\u2026");let{ok:O,data:k,error:I}=await M.get(`/files/content?path=${encodeURIComponent(y)}`);if(!O)return A((I==null?void 0:I.message)||"Could not load file.","error"),g("Load failed","error"),!1;let R=typeof(k==null?void 0:k.content)=="string"?k.content:"";return b(R,(k==null?void 0:k.file)||r()),!0},L=async()=>u()?await be({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,E=async y=>{if(!y||y===c.path)return;if(!await L()){n&&(n.value=c.path);return}await m(y)},T=async()=>{var k,I,R;if(!c.editor||!c.path||!o)return;let y=c.editor.getValue();if(y===c.baseline){h();return}o.disabled=!0,o.textContent="Saving\u2026",g("Saving\u2026");let{ok:N,error:O}=await M.put("/files/content",{path:c.path,content:y});if(!N){o.disabled=!1,o.textContent="Save Changes",A((O==null?void 0:O.message)||"Could not save file.","error"),g("Save failed","error");return}c.baseline=y,h(),g("Saved","success"),A(`Saved ${c.path}`,"success"),c.path.toLowerCase().endsWith(".css")?(k=window.sendPreviewMessage)==null||k.call(window,"voxelsite:reload-css"):(I=window.sendPreviewMessage)==null||I.call(window,"voxelsite:reload"),setTimeout(()=>{var z;return(z=window.refreshPreview)==null?void 0:z.call(window)},400),(R=window.refreshPublishState)==null||R.call(window,{silent:!0})},B=y=>{y.key==="Escape"&&(y.preventDefault(),f())};a==null||a.addEventListener("click",()=>f()),i==null||i.addEventListener("click",async()=>{!c.path||!await L()||await m(c.path)}),o==null||o.addEventListener("click",()=>T()),n==null||n.addEventListener("change",y=>{E(y.target.value)}),s.addEventListener("click",y=>{y.target===s&&f()}),document.addEventListener("keydown",B);let q=()=>document.removeEventListener("keydown",B);s.addEventListener("transitionend",()=>{document.body.contains(s)||q()});try{let y=await M.get("/files");if(!y.ok||!((U=(H=y.data)==null?void 0:H.files)!=null&&U.length)){let I=((w=y.error)==null?void 0:w.message)||"No editable files found.";A(I,"error"),f();return}let N=y.data.files;c.files=N,n&&(n.innerHTML=N.map(I=>{let R=I.group?`${String(I.group).toUpperCase()} \xB7 `:"";return`<option value="${x(I.path)}">${x(R+I.path)}</option>`}).join(""));let O=(($=N.find(I=>I.path===e))==null?void 0:$.path)||N[0].path;c.path=O,n&&(n.value=O),p.innerHTML="";let k=null;try{k=await mn()}catch{A("Monaco is not available yet. Using fallback editor.","warning"),g("Fallback editor active","warning")}if(k!=null&&k.editor){let I=_t();k.editor.setTheme(I);let R=k.editor.create(p,{value:"",language:It(O),theme:I,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});c.editor={getValue:()=>R.getValue(),setValue:z=>R.setValue(z),setLanguage:z=>{let Z=R.getModel();Z&&k.editor.setModelLanguage(Z,z)},dispose:()=>R.dispose()},c.editorCleanup=R.onDidChangeModelContent(()=>{h()})}else{p.innerHTML='<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"></textarea>';let I=p.querySelector("#vs-code-editor-fallback"),R=()=>h();I==null||I.addEventListener("input",R),c.editor={getValue:()=>(I==null?void 0:I.value)||"",setValue:z=>{I&&(I.value=z)},setLanguage:()=>{},dispose:()=>{I==null||I.removeEventListener("input",R)}}}await m(O,{silent:!0}),g("Ready")}catch(y){A((y==null?void 0:y.message)||"Could not initialize code editor.","error"),f()}finally{let y=new MutationObserver(()=>{document.body.contains(s)||(q(),y.disconnect())});y.observe(document.body,{childList:!0,subtree:!0})}}function yn(){return setTimeout(()=>Ze(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function Ze(){var k,I,R,z,Z,se,re;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,l]=await Promise.all([M.get("/settings"),M.get("/settings/system"),M.get("/settings/mail"),M.get("/settings/usage"),M.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),M.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),M.get("/settings/logs")]),d=((k=l.data)==null?void 0:k.logs)||[],p=((I=t.data)==null?void 0:I.settings)||{},c=((R=s.data)==null?void 0:R.system)||{},g=p.site_favicon||null,r=g?`/${g}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),u=null,v=null;try{i.ok&&((z=i.data)!=null&&z.content)&&(u=JSON.parse(i.data.content))}catch{}try{a.ok&&((Z=a.data)!=null&&Z.content)&&(v=JSON.parse(a.data.content))}catch{}let h=u||v,f=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},b=p.available_providers||{},m=((se=n.data)==null?void 0:se.config)||{},L=((re=n.data)==null?void 0:re.presets)||{},E=Object.keys(b),T=p.ai_provider||"claude",q=(b[T]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],H=p[`ai_${T}_model`]||"",U=p[`ai_${T}_api_key_set`]||!1,w=E.map(D=>{let ne=b[D];return`<option value="${x(D)}" ${D===T?"selected":""}>${x(ne.name)}</option>`}).join(""),$="";for(let D of q)D.key==="api_key"?$+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${x(D.label)}${D.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${U?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${x(D.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${U?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':D.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${x(D.help_text||"Optional for local servers")}</p>`}
          ${D.help_url?`<a href="${D.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${x(D.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:D.key==="base_url"&&($+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${x(D.label)}${D.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${x(p.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${x(D.placeholder)}" />
          ${D.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${x(D.help_text)}</p>`:""}
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
              <img src="${r}" alt="Current favicon" class="vs-favicon-img" id="vs-favicon-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML = '<div class=\\'vs-favicon-placeholder\\'><svg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'m21 15-5-5L5 21\\'/></svg></div>';" />
            </div>
            <div class="vs-favicon-info">
              <div class="vs-favicon-actions">
                <button type="button" class="vs-btn vs-btn-secondary vs-btn-xs" id="btn-favicon-upload">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                </button>
                ${g?`
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
            ${w}
          </select>
        </div>

        <div id="settings-config-fields">
          ${$}
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
                ${Object.entries(L).map(([D,ne])=>`<option value="${x(D)}">${x(ne.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${x(m.smtp_host||"")}"
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
              <input id="set-smtp-username" type="text" value="${x(m.smtp_username||"")}"
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
              <input id="set-mailpit-host" type="text" value="${x(m.mailpit_host||"localhost")}"
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
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${x(m.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${x(m.from_name||"")}"
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
          <div class="vs-knowledge-card-icon">${C.book}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Site Memory</span>
            <span class="vs-knowledge-card-desc">${Object.keys(u).length} facts remembered</span>
          </div>
          <div class="vs-knowledge-card-arrow">${C.chevronRight}</div>
        </button>
        `:""}
        ${v?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${C.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(v).length} design decisions</span>
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
      ${f.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${$e("Total Requests",Number(f.totals.request_count).toLocaleString())}
          ${$e("Input Tokens",Number(f.totals.total_input_tokens).toLocaleString())}
          ${$e("Output Tokens",Number(f.totals.total_output_tokens).toLocaleString())}

        </div>
        ${f.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${f.models.map(D=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${$e(D.ai_model||"Unknown",Number(D.request_count).toLocaleString()+" requests")}
                ${$e("Tokens",Number(D.total_input_tokens).toLocaleString()+" in / "+Number(D.total_output_tokens).toLocaleString()+" out")}

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
        ${$e("VoxelSite",c.version||"1.0.0")}
        ${$e("PHP",c.php_version||"?")}
        ${$e("SQLite",c.sqlite_version||"?")}
        ${$e("Database",Bs(c.database_size))}
        ${$e("Preview Files",Bs(c.preview_size))}
        ${$e("Assets",Bs(c.assets_size))}
        ${$e("Upload Limit",c.max_upload||"?")}
        ${$e("Memory Limit",c.memory_limit||"?")}
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
        ${d.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':d.map(D=>{let ne=(D.size/1024).toFixed(1),oe=new Date(D.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${D.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${D.lines} lines \xB7 ${ne} KB \xB7 ${oe}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(D.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${D.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
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
  `,Zo(p,b),Xo(m,L),Vo(),Wo(),document.querySelectorAll(".btn-delete-log").forEach(D=>{D.addEventListener("click",async()=>{var de;if((de=window.demoGuard)!=null&&de.call(window))return;if(D.dataset.confirm!=="true"){D.dataset.confirm="true",D.innerHTML='<span style="font-size: 11px;">Sure?</span>',D.style.color="var(--vs-error)",setTimeout(()=>{D.dataset.confirm==="true"&&(D.dataset.confirm="",D.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',D.style.color="")},3e3);return}let ne=D.dataset.file,oe=D.closest(".vs-log-row");oe&&(oe.style.opacity="0.4"),await M.delete("/settings/logs",{file:ne}),Ze()})});let y=document.getElementById("btn-delete-all-logs");y&&y.addEventListener("click",async()=>{var D;if(!((D=window.demoGuard)!=null&&D.call(window))){if(y.dataset.confirm!=="true"){y.dataset.confirm="true",y.textContent="Sure?",y.style.color="var(--vs-error)",setTimeout(()=>{y.dataset.confirm==="true"&&(y.dataset.confirm="",y.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',y.style.color="")},3e3);return}y.disabled=!0,y.textContent="Deleting...",await M.delete("/settings/logs",{file:"*"}),Ze()}});let N=document.getElementById("btn-view-memory");N&&u&&N.addEventListener("click",()=>gn("Site Memory",u,"memory"));let O=document.getElementById("btn-view-design");O&&v&&O.addEventListener("click",()=>gn("Design Intelligence",v,"design")),zo(),Uo(),Yo(H)}function Oo(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function zo(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;l();async function l(){var r;if(a)try{let{ok:u,data:v}=await M.get("/update/dist-packages");if(!u||!((r=v==null?void 0:v.packages)!=null&&r.length)){a.innerHTML="";return}let h=v.current_version||"0.0.0",f=v.packages.map(b=>{let m=(b.size/1024/1024).toFixed(1),L=Oo(b.version,h)>0,E=b.version===h,T=L?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':E?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${x(b.filename)}</strong>
                ${T}
              </div>
              <div class="vs-dist-pkg-meta">v${x(b.version)} \xB7 ${m} MB</div>
            </div>
            <button class="vs-btn vs-btn-primary vs-btn-sm vs-dist-apply-btn" data-filename="${x(b.filename)}" data-version="${x(b.version)}">
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
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(b=>{b.addEventListener("click",()=>d(b.dataset.filename,b.dataset.version))})}catch{}}async function d(r,u){var h,f;if(!((h=window.demoGuard)!=null&&h.call(window)||!confirm(`Apply update from "${r}" (v${u})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${r}...`,a&&(a.innerHTML="");try{let{ok:b,data:m,error:L}=await M.post("/update/apply-local",{filename:r});s.classList.add("hidden"),n.classList.remove("hidden");let E=document.getElementById("vs-update-result-icon"),T=document.getElementById("vs-update-result-message");if(b){let B=m;E.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',T.innerHTML=`
          <div class="vs-update-result-title">${x(B.message)}</div>
          <div class="vs-update-result-meta">
            ${B.files_updated} files updated \xB7 ${B.files_skipped} preserved
            ${(f=B.errors)!=null&&f.length?` \xB7 ${B.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",(L==null?void 0:L.message)||"Unknown error")}catch(b){c("Update Failed",x(b.message||"Network error."))}}}e.addEventListener("click",r=>{var u;(u=window.demoGuard)!=null&&u.call(window)||r.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",r=>{r.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",r=>{var v,h,f;if(r.preventDefault(),e.classList.remove("is-dragover"),(v=window.demoGuard)!=null&&v.call(window))return;let u=(f=(h=r.dataTransfer)==null?void 0:h.files)==null?void 0:f[0];u&&u.name.endsWith(".zip")&&p(u)}),o.addEventListener("change",()=>{var u;let r=(u=o.files)==null?void 0:u[0];r&&p(r),o.value=""});async function p(r){var h,f;let u=document.querySelector(".vs-sys-grid");if(u){let b=u.querySelectorAll(".vs-sys-value"),m="";if(u.querySelectorAll(".vs-sys-label").forEach((L,E)=>{var T,B;L.textContent.trim()==="Upload Limit"&&(m=((B=(T=b[E])==null?void 0:T.textContent)==null?void 0:B.trim())||"")}),m){let L=g(m);if(L>0&&r.size>L){let E=(r.size/1024/1024).toFixed(1);c("File Too Large",`The update file is ${E} MB but your server's upload limit is ${m}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${E} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${r.name}" (${(r.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${r.name}...`;try{let b=new FormData;b.append("update_zip",r);let m=F.get("sessionToken"),L=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:m?{"X-VS-Token":m}:{},body:b}),E=L.headers.get("content-type")||"",T;if(!E.includes("application/json")){let H=await L.text();if(H.includes("POST Content-Length")||H.includes("upload_max_filesize")||H.includes("exceeds")){c("Server Upload Limit Exceeded",`The file (${(r.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}c("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}T=await L.json(),s.classList.add("hidden"),n.classList.remove("hidden");let B=document.getElementById("vs-update-result-icon"),q=document.getElementById("vs-update-result-message");if(T.ok){let H=T.data;B.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',q.innerHTML=`
          <div class="vs-update-result-title">${x(H.message)}</div>
          <div class="vs-update-result-meta">
            ${H.files_updated} files updated \xB7 ${H.files_skipped} preserved
            ${(h=H.errors)!=null&&h.length?` \xB7 ${H.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",((f=T.error)==null?void 0:f.message)||"Unknown error")}catch(b){let m=b.message||"Network error. Check your connection.";m.includes("Unexpected token")||m.includes("not valid JSON")?c("Server Upload Limit Exceeded",`The file (${(r.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):c("Upload Failed",x(m))}}}function c(r,u){s.classList.add("hidden"),n.classList.remove("hidden");let v=document.getElementById("vs-update-result-icon"),h=document.getElementById("vs-update-result-message");v.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',h.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${x(r)}</div>
      <div class="vs-update-result-meta">${u}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function g(r){let u=r.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!u)return 0;let v=parseFloat(u[1]),h=u[2].toUpperCase();return h==="GB"||h==="G"?v*1024*1024*1024:h==="MB"||h==="M"?v*1024*1024:h==="KB"||h==="K"?v*1024:0}}function Uo(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var l,d,p;if(i.preventDefault(),e.classList.remove("is-dragover"),(l=window.demoGuard)!=null&&l.call(window))return;let a=(p=(d=i.dataTransfer)==null?void 0:d.files)==null?void 0:p[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,l;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let d=await M.delete("/settings/favicon");d.ok?(A("Favicon removed.","success"),Ze()):A(((l=d.error)==null?void 0:l.message)||"Could not remove favicon.","error")}catch{A("Could not remove favicon.","error")}}});async function o(i){var c;if(i.size>524288){A("Favicon must be under 512 KB.","error");return}let l=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!l.includes(i.type)){A("Favicon must be a .ico file.","error");return}let p=document.getElementById("vs-favicon-preview");p&&(p.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let g=new FormData;g.append("favicon",i);let r=F.get("sessionToken"),v=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:r?{"X-VS-Token":r}:{},body:g})).json();v.ok?(A("Favicon updated.","success"),Ze()):(A(((c=v.error)==null?void 0:c.message)||"Upload failed.","error"),Ze())}catch{A("Upload failed. Check your connection.","error"),Ze()}}}function gn(e,t,s){var d,p,c;(d=document.getElementById("vs-knowledge-overlay"))==null||d.remove();let n=g=>g.replace(/[_-]/g," ").replace(/\b\w/g,r=>r.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([g,r])=>{let u=typeof r=="object"?r.value||JSON.stringify(r):String(r),v=typeof r=="object"?r.confidence:null,h=v==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${x(n(g))}</div>
          <div class="vs-kv-value">
            <span>${x(u)}</span>
            ${v?`<span class="vs-kv-badge ${h}">${x(v)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(t).map(([g,r])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${x(n(g))}</div>
        <div class="vs-kv-section-body">${x(String(r))}</div>
      </div>
    `).join("");let i=document.createElement("div");i.id="vs-knowledge-overlay",i.className="vs-modal-overlay",i.innerHTML=`
    <div class="vs-modal vs-knowledge-modal">
      <div class="vs-knowledge-modal-header">
        <div class="vs-knowledge-modal-title-row">
          <div class="vs-knowledge-modal-icon">${s==="memory"?C.book:C.eye}</div>
          <div>
            <h2 class="vs-knowledge-modal-title">${x(e)}</h2>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",l)},l=g=>{g.key==="Escape"&&a()};document.addEventListener("keydown",l),(p=i.querySelector("#vs-knowledge-close"))==null||p.addEventListener("click",a),(c=i.querySelector("#vs-knowledge-done"))==null||c.addEventListener("click",a),i.addEventListener("click",g=>{g.target===i&&a()})}function Vo(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Ko()})}function Wo(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Go()})}function Go(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var d;(d=document.getElementById("reset-install-confirm-input"))==null||d.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let d=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",d),s.classList.toggle("is-matched",d)}),s==null||s.addEventListener("keydown",d=>{d.key==="Enter"&&(s.value.trim()===a?hn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?hn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>fe(t)),t.addEventListener("click",d=>{d.target===t&&fe(t)});let l=d=>{d.key==="Escape"&&(fe(t),document.removeEventListener("keydown",l))};document.addEventListener("keydown",l)}async function hn(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await M.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let l=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=l,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function xn(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function Ko(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var l;(l=document.getElementById("reset-confirm-input"))==null||l.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let l=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",l),s.classList.toggle("is-matched",l)}),s==null||s.addEventListener("keydown",l=>{l.key==="Enter"&&(s.value.trim()==="RESET"?fn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?fn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>fe(t)),t.addEventListener("click",l=>{l.target===t&&fe(t)});let a=l=>{l.key==="Escape"&&(fe(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function fn(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:l}=await M.post("/site/reset",{confirm:"RESET"});if(i){F.set("pages",[]),F.set("hasFormSchemas",!1),F.set("conversations",null),F.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{fe(e),window.location.hash!=="#/chat"?window.location.hash="#/chat":window.dispatchEvent(new HashChangeEvent("hashchange"))},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let d=e.querySelector(".vs-modal-desc");if(d){let p=d.textContent;d.textContent=(l==null?void 0:l.message)||"Reset failed. Please try again.",d.style.color="var(--vs-error)",setTimeout(()=>{d.textContent=p,d.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function Yo(e){var s;let t=document.getElementById("set-ai-model");if(t)try{let{ok:n,data:o}=await M.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?t.innerHTML=o.models.map(i=>`<option value="${x(i.id)}" ${i.id===e?"selected":""}>${x(i.name||i.id)}</option>`).join(""):t.innerHTML='<option value="">Test your connection to load available models</option>'}catch{t.innerHTML='<option value="">Test your connection to load available models</option>'}}function $e(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function Bs(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function Zo(e,t){let s=e.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async c=>{var g;if((g=window.demoGuard)!=null&&g.call(window)){c.target.value=s;return}s=c.target.value,await M.put("/settings",{ai_provider:s}),Ze()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var h,f,b,m,L;if((h=window.demoGuard)!=null&&h.call(window))return;let c=((f=i==null?void 0:i.value)==null?void 0:f.trim())||"",g=((m=(b=document.getElementById("set-base-url"))==null?void 0:b.value)==null?void 0:m.trim())||"";if(s!=="openai_compatible"&&(!c||c.startsWith("\u2022\u2022"))){Ms("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:r,data:u,error:v}=await M.post("/settings/test-api",{provider:s,api_key:c.startsWith("\u2022\u2022")?"":c,base_url:g});if(o.textContent="Test Connection",o.disabled=!1,r){if(Ms("\u2713 Connected successfully!","success"),(L=u==null?void 0:u.models)!=null&&L.length){let E=document.getElementById("set-ai-model");if(E){let T=e[`ai_${s}_model`]||"";E.innerHTML=u.models.map(B=>`<option value="${x(B.id)}" ${B.id===T?"selected":""}>${x(B.name||B.id)}</option>`).join("")}}}else Ms("\u2717 "+((v==null?void 0:v.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),l=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var u,v,h,f,b;if((u=window.demoGuard)!=null&&u.call(window))return;a.textContent="Saving...",a.disabled=!0;let c={site_name:((h=(v=document.getElementById("set-site-name"))==null?void 0:v.value)==null?void 0:h.trim())||"",site_tagline:((b=(f=document.getElementById("set-site-tagline"))==null?void 0:f.value)==null?void 0:b.trim())||""},{ok:g,error:r}=await M.put("/settings",c);if(a.textContent="Save Identity",a.disabled=!1,l){if(l.classList.remove("hidden"),g){l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3",F.set("siteName",c.site_name),document.title=c.site_name?`Studio \u2014 ${c.site_name}`:"Studio \u2014 VoxelSite";let m=document.querySelector(".vs-logo-text");m&&(m.textContent=c.site_name||"VoxelSite")}else l.textContent="\u2717 "+((r==null?void 0:r.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3";setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3)}});let d=document.getElementById("btn-save-settings"),p=document.getElementById("save-status");d&&d.addEventListener("click",async()=>{var h,f,b,m;if((h=window.demoGuard)!=null&&h.call(window))return;d.textContent="Saving...",d.disabled=!0;let c={ai_provider:s,[`ai_${s}_model`]:((f=document.getElementById("set-ai-model"))==null?void 0:f.value)||"",ai_max_tokens:parseInt(((b=document.getElementById("set-max-tokens"))==null?void 0:b.value)||"32000",10)},g=document.getElementById("set-base-url");g&&(c.ai_openai_compatible_base_url=g.value.trim());let r=(m=i==null?void 0:i.value)==null?void 0:m.trim();r&&!r.startsWith("\u2022\u2022")&&(c[`ai_${s}_api_key`]=r);let{ok:u,error:v}=await M.put("/settings",c);d.textContent="Save Settings",d.disabled=!1,p&&(p.classList.remove("hidden"),u?(p.textContent="\u2713 Saved",p.className="text-xs text-vs-success ml-3"):(p.textContent="\u2717 "+((v==null?void 0:v.message)||"Failed to save."),p.className="text-xs text-vs-error ml-3"),setTimeout(()=>p==null?void 0:p.classList.add("hidden"),3e3))})}function Xo(e,t){var u;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function l(){if(!e.smtp_host)return"gmail";for(let[v,h]of Object.entries(t))if(h.host&&h.host===e.smtp_host)return v;return"custom"}if(i){let v=l();i.value=v,a&&((u=t[v])!=null&&u.help)&&(a.textContent=t[v].help)}s&&s.addEventListener("change",()=>{let v=s.value;n&&(n.style.display=v==="smtp"?"block":"none"),o&&(o.style.display=v==="mailpit"?"block":"none");let h=document.getElementById("mail-common-fields");h&&(h.style.display=v==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let v=t[i.value];if(!v)return;let h=document.getElementById("set-smtp-host"),f=document.getElementById("set-smtp-port"),b=document.getElementById("set-smtp-encryption");h&&(h.value=v.host||""),f&&(f.value=v.port||587),b&&(b.value=v.encryption||"tls"),a&&(a.textContent=v.help||"")});let d=document.getElementById("btn-toggle-smtp-pass"),p=document.getElementById("set-smtp-password");d&&p&&d.addEventListener("click",()=>{let v=p.type==="password";p.type=v?"text":"password",d.innerHTML=v?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let c=document.getElementById("btn-mail-test");c&&c.addEventListener("click",async()=>{var L,E,T;if((L=window.demoGuard)!=null&&L.call(window))return;let v=(T=(E=document.getElementById("set-mail-test-recipient"))==null?void 0:E.value)==null?void 0:T.trim();if(!v){Ts("Enter an email address to send the test to.","warning");return}c.textContent="Sending...",c.disabled=!0;let h=bn();h.test_recipient=v;let{ok:f,data:b,error:m}=await M.post("/settings/mail/test",h);c.textContent="Send Test",c.disabled=!1,f?Ts("\u2713 "+((b==null?void 0:b.message)||"Test email sent successfully!"),"success"):Ts("\u2717 "+((m==null?void 0:m.message)||"Test failed."),"error")});let g=document.getElementById("btn-save-mail"),r=document.getElementById("save-mail-status");g&&g.addEventListener("click",async()=>{var b;if((b=window.demoGuard)!=null&&b.call(window))return;g.textContent="Saving...",g.disabled=!0;let v=bn(),{ok:h,error:f}=await M.post("/settings/mail",v);g.textContent="Save Email Settings",g.disabled=!1,r&&(r.classList.remove("hidden"),h?(r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3"):(r.textContent="\u2717 "+((f==null?void 0:f.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3"),setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3))})}function bn(){var t,s,n,o,i,a,l,d,p,c,g,r,u,v,h;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((d=(l=document.getElementById("set-smtp-host"))==null?void 0:l.value)==null?void 0:d.trim())||"",smtp_port:parseInt(((p=document.getElementById("set-smtp-port"))==null?void 0:p.value)||"587",10),smtp_username:((g=(c=document.getElementById("set-smtp-username"))==null?void 0:c.value)==null?void 0:g.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((r=document.getElementById("set-smtp-encryption"))==null?void 0:r.value)||"tls",mailpit_host:((v=(u=document.getElementById("set-mailpit-host"))==null?void 0:u.value)==null?void 0:v.trim())||"localhost",mailpit_port:parseInt(((h=document.getElementById("set-mailpit-port"))==null?void 0:h.value)||"1025",10)}}function Ts(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function Ms(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}var Jo=[{route:"chat",label:"Chat"},{route:"editor",label:"Editor"},{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"actions",label:"Actions"},{route:"snapshots",label:"Snapshots",roles:["owner","editor"]},{route:"settings",label:"Settings",roles:["owner"]}],js=["chat","editor"],Qo="vs-first-run-guide-dismissed",Hn="vs-onboarding-draft-v1",Rn="vs-prompt-recents-v1",Dn="vs-prompt-pins-v1",ei=8,ti=5,wn=5,si=5*1024*1024,Hs=["image/jpeg","image/png","image/gif","image/webp"],Je=[],Me=document.documentElement.dataset.demo==="true";function Re(){return Me?(A("Demo mode \u2014 this action is disabled.","warning"),!0):!1}function qn(){let e=F.get("user");return e&&e.role!=="viewer"}function qs(){return qn()?!1:(A("You have read-only access.","warning"),!0)}function ni(){let e=F.get("user");return e&&e.role==="owner"}window.IS_DEMO=Me;window.demoGuard=Re;window.canWrite=qn;window.viewerGuard=qs;window.isOwner=ni;var Nn=document.getElementById("app");async function Fn(){var s;Ks(),tn(),window.marked&&window.marked.use({renderer:{html(n){return x(typeof n=="string"?n:n.text)}}});let e=await M.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){jn();return}F.batch(()=>{F.set("user",e.data.user),F.set("sessionToken",e.data.token),F.set("siteName",e.data.site_name||"")});let t=e.data.site_name;t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",n=>{var o;(o=window.__hasUnsavedEditorChanges)!=null&&o.call(window)&&(n.preventDefault(),n.returnValue="")}),tt.beforeEach(async(n,o)=>{var i;return o.startsWith("editor")&&!n.startsWith("editor")&&(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)?await xn():!0}).on("chat",()=>Ee()).on("editor",()=>Ee()).on("pages",()=>Ee()).on("pages/:slug",()=>Ee()).on("assets",()=>Ee()).on("forms",()=>Ee()).on("forms/:formId",()=>Ee()).on("actions",()=>Ee()).on("actions/:actionId",()=>Ee()).on("snapshots",()=>Ee()).on("settings",()=>Ee()).on("team",()=>Ee()).on("profile",()=>Ee()).onNotFound(()=>tt.navigate("chat")),F.on("user",n=>{n||jn()}),On(),tt.start()}async function On(){try{let{ok:e,data:t}=await M.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){F.set("pages",t.pages);let s=document.getElementById("chat-messages");s!=null&&s.querySelector(".vs-empty-state")&&(s.innerHTML=kt(),wt())}}catch{}}function Ee(){let e=F.get("route"),t=js.includes(e);Bt()&&Tt(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s;e==="editor"?s=vn():t?s=ii():s=ai(),Nn.innerHTML=`
    ${oi()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${s}
    </div>
    ${Di()}
    ${qi()}
    ${ui()}
    ${Vi()}
  `,Yi(),e==="editor"&&un()}function oi(){let e=F.get("route"),t=F.get("user"),s=F.get("theme"),n=Jo.filter(o=>o.roles&&t?o.roles.includes(t.role):!0).map(o=>{let i=e===o.route||e.startsWith(o.route+"/");return`
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
            <span class="vs-logo-text hidden sm:inline">${x(F.get("siteName")||"VoxelSite")}</span>
          </a>
          <nav class="flex items-center gap-0.5" aria-label="Studio navigation">
            ${n}
          </nav>
          ${Me?`
            <span class="vs-demo-badge" title="Read-only preview \u2014 install your own copy to get started.">
              ${C.eye} Demo
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
            ${s==="dark"?C.sun:C.moon}
          </button>

          <div class="relative" id="user-menu-container">
            <button id="btn-user-menu"
              class="vs-btn vs-btn-ghost vs-btn-sm vs-user-btn">
              ${C.user}
              <span class="hidden sm:inline">${x((t==null?void 0:t.name)||"Admin")}</span>
            </button>
            <div id="user-dropdown" class="hidden vs-dropdown right-0 top-full mt-1">
              ${(t==null?void 0:t.role)!=="owner"?`
                <div style="padding: 8px 12px 4px;">
                  <span style="display: inline-block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; background: var(--vs-bg-inset); color: var(--vs-text-tertiary); border: 1px solid var(--vs-border-subtle);">${(t==null?void 0:t.role)==="editor"?"Editor":"Viewer"}</span>
                </div>
              `:""}
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${C.pencil} Edit Profile
              </a>
              ${(t==null?void 0:t.role)==="owner"?`
                <a href="#/team" id="btn-team-nav" class="vs-dropdown-item">
                  ${C.users} Team Members
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
  `}function ii(){let e=F.get("sidebarWidth"),t=F.get("activeConversationId"),s=F.get("activePageScope"),n=zn(s);return`
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
              <span id="scope-label" class="text-vs-text-secondary">${x(n)}</span>
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
          ${kt()}
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
                ${C.image}
              </button>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (\u2318+Enter)">
                ${C.send}
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between mt-2 px-1">
            <span class="text-2xs text-vs-text-ghost">\u2318+Enter to send \xB7 drop images to attach</span>
          </div>
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="flex-1 h-full bg-vs-bg-well flex flex-col">
        <!-- Preview Toolbar (aligned with chat header) -->
        <div class="vs-panel-header vs-preview-toolbar">
          <div class="vs-device-toggle">
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${C.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${C.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${C.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Visual editor (V)">
              ${C.pencil} Visual
            </button>
            <button id="btn-edit-code" class="vs-btn vs-btn-ghost vs-btn-xs" title="Source code editor">
              ${C.fileCode} Code
            </button>
            <button id="btn-refresh-preview" class="vs-btn vs-btn-ghost vs-btn-xs" title="Refresh Preview">
              ${C.rotateCcw} Refresh
            </button>
            <div class="vs-topbar-divider"></div>
            <button id="btn-external-preview" class="vs-btn vs-btn-ghost vs-btn-icon" title="Open in new tab">
              ${C.externalLink}
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
  `}function ai(){let e=F.get("route"),t=F.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),e==="actions/:actionId"&&(s="900px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${ri(e,t)}
      </div>
    </div>
  `}function ri(e,t){let s=F.get("user"),n=s==null?void 0:s.role;switch(e){case"assets":return xi();case"forms":return $i();case"forms/:formId":return Si(t.formId);case"actions":return Ii();case"actions/:actionId":return _i(t.actionId);case"snapshots":return n==="owner"||n==="editor"?Ei():Is();case"settings":return n==="owner"?yn():Is();case"team":return n==="owner"?vi():Is();case"profile":return ci();default:return li("Not Found","This page doesn't exist.")}}function Is(){return`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; padding: 40px 24px;">
      <div style="width: 56px; height: 56px; border-radius: 16px; background: var(--vs-bg-inset); border: 1px solid var(--vs-border-subtle); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; color: var(--vs-text-ghost);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 style="font-size: 18px; font-weight: 600; color: var(--vs-text-primary); letter-spacing: -0.02em; margin: 0 0 8px;">Access Denied</h1>
      <p style="font-size: 13px; color: var(--vs-text-tertiary); margin: 0 0 24px; max-width: 260px; line-height: 1.5;">You don't have permission to view this page.</p>
      <a href="#/chat" style="font-size: 12px; font-weight: 500; color: var(--vs-accent); text-decoration: none; transition: opacity 0.15s;"
         onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">\u2190 Back to Chat</a>
    </div>
  `}function li(e,t){return`
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
  `}function di(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return C[t[s]||"layoutGrid"]||C.layoutGrid}function kn(e){tt.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function ci(){let e=F.get("user")||{};return setTimeout(()=>pi(),0),`
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
  `}function pi(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var p,c,g,r;let o=(c=(p=document.getElementById("profile-name"))==null?void 0:p.value)==null?void 0:c.trim(),i=(r=(g=document.getElementById("profile-email"))==null?void 0:g.value)==null?void 0:r.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:l,data:d}=await M.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(d!=null&&d.user)?(F.set("user",d.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>Ee(),800)):t&&(t.textContent=(l==null?void 0:l.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var p,c,g;let o=((p=document.getElementById("profile-current-pw"))==null?void 0:p.value)||"",i=((c=document.getElementById("profile-new-pw"))==null?void 0:c.value)||"",a=((g=document.getElementById("profile-confirm-pw"))==null?void 0:g.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:l,error:d}=await M.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",l?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(d==null?void 0:d.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function vi(){return setTimeout(()=>Ns(),0),`
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
  `}function ui(){return`
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
            ${[["Use AI chat",!0,!0,!1],["Edit pages & code",!0,!0,!1],["Manage assets",!0,!0,!1],["Publish changes",!0,!0,!1],["View form submissions",!0,!0,!0],["Preview the site",!0,!0,!0],["Manage snapshots",!0,!0,!1],["Change settings",!0,!1,!1],["Manage team members",!0,!1,!1]].map(([e,t,s,n])=>`
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
  `}function Jt(e=16){let t="abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%",s=new Uint8Array(e);return crypto.getRandomValues(s),Array.from(s,n=>t[n%t.length]).join("")}function mi(e){let t=F.get("user"),s=e.id===(t==null?void 0:t.id),n=e.role==="owner",o=e.role==="owner"?"vs-role-owner":e.role==="editor"?"vs-role-editor":"vs-role-viewer",i=e.role==="owner"?"vs-team-avatar-owner":e.role==="editor"?"vs-team-avatar-editor":"vs-team-avatar-viewer",a=e.last_login_at?new Date(e.last_login_at).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Never",l=n?"<div></div>":`
    <div class="vs-team-row-actions">
      <button class="vs-team-action team-edit-btn" data-id="${e.id}" title="Edit">
        ${C.pencil}
      </button>
      <button class="vs-team-action team-pw-btn" data-id="${e.id}" data-name="${x(e.name)}" title="Reset password">
        ${C.lock}
      </button>
      <button class="vs-team-action vs-team-action-danger team-delete-btn" data-id="${e.id}" data-name="${x(e.name)}" title="Remove">
        ${C.trash}
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
  `}async function Ns(){let e=document.getElementById("team-list");if(!e)return;let{ok:t,data:s,error:n}=await M.get("/team");if(!t){e.innerHTML=`<div class="text-sm text-vs-error py-8 text-center">${(n==null?void 0:n.message)||"Failed to load team members."}</div>`;return}let o=(s==null?void 0:s.members)||[];o.length===0?e.innerHTML='<div class="text-sm text-vs-text-ghost py-8 text-center">No team members yet.</div>':e.innerHTML=o.map(i=>mi(i)).join(""),gi()}function gi(){var e,t,s,n,o,i,a,l,d,p,c,g;(e=document.getElementById("btn-add-member"))==null||e.addEventListener("click",()=>{Cn()}),(t=document.getElementById("btn-show-roles"))==null||t.addEventListener("click",En),document.querySelectorAll("[data-role-info]").forEach(r=>{r.addEventListener("click",En)}),document.querySelectorAll(".team-edit-btn").forEach(r=>{r.addEventListener("click",async()=>{let u=r.dataset.id,{ok:v,data:h}=await M.get("/team");if(v){let f=h.members.find(b=>b.id==u);f&&Cn(f)}})}),document.querySelectorAll(".team-delete-btn").forEach(r=>{r.addEventListener("click",async()=>{let u=r.dataset.id,v=r.dataset.name;if(!await be({title:"Remove Team Member",description:`Remove ${v} from the team? They will lose access to this Studio immediately.`,confirmLabel:"Remove",danger:!0}))return;let{ok:f,error:b}=await M.delete(`/team/${u}`);f?(A(`${v} has been removed.`,"success"),Ns()):A((b==null?void 0:b.message)||"Failed to remove member.","error")})}),document.querySelectorAll(".team-pw-btn").forEach(r=>{r.addEventListener("click",()=>{let u=r.dataset.id,v=r.dataset.name;fi(u,v)})}),(s=document.querySelector("[data-team-modal-overlay]"))==null||s.addEventListener("click",Qt),(n=document.querySelector("[data-team-pw-overlay]"))==null||n.addEventListener("click",es),(o=document.querySelector("[data-team-roles-overlay]"))==null||o.addEventListener("click",Rs),(i=document.getElementById("btn-team-cancel"))==null||i.addEventListener("click",Qt),(a=document.getElementById("btn-pw-cancel"))==null||a.addEventListener("click",es),(l=document.getElementById("btn-roles-close"))==null||l.addEventListener("click",Rs),(d=document.getElementById("btn-generate-password"))==null||d.addEventListener("click",()=>{let r=document.getElementById("team-member-password");r&&(r.value=Jt())}),(p=document.getElementById("btn-pw-generate"))==null||p.addEventListener("click",()=>{let r=document.getElementById("team-new-password");r&&(r.value=Jt())}),(c=document.getElementById("btn-team-save"))==null||c.addEventListener("click",bi),(g=document.getElementById("btn-pw-save"))==null||g.addEventListener("click",yi),document.addEventListener("keydown",hi)}function hi(e){if(e.key!=="Escape")return;let t=document.getElementById("team-modal"),s=document.getElementById("team-pw-modal"),n=document.getElementById("team-roles-modal");n&&!n.classList.contains("hidden")?(Rs(),e.stopPropagation()):s&&!s.classList.contains("hidden")?(es(),e.stopPropagation()):t&&!t.classList.contains("hidden")&&(Qt(),e.stopPropagation())}function En(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.remove("hidden")}function Rs(){var e;(e=document.getElementById("team-roles-modal"))==null||e.classList.add("hidden")}function Cn(e=null){let t=document.getElementById("team-modal"),s=document.getElementById("team-modal-title"),n=document.getElementById("btn-team-save"),o=document.getElementById("team-edit-id"),i=document.getElementById("team-password-section"),a=document.getElementById("team-modal-error");t&&(document.getElementById("team-member-name").value=(e==null?void 0:e.name)||"",document.getElementById("team-member-email").value=(e==null?void 0:e.email)||"",document.getElementById("team-member-role").value=(e==null?void 0:e.role)||"editor",document.getElementById("team-member-password").value="",a.classList.add("hidden"),a.textContent="",e?(s.textContent="Edit Team Member",n.textContent="Save Changes",o.value=e.id,i.style.display="none"):(s.textContent="Add Team Member",n.textContent="Add Member",o.value="",i.style.display="",document.getElementById("team-member-password").value=Jt()),t.classList.remove("hidden"))}function Qt(){var e;(e=document.getElementById("team-modal"))==null||e.classList.add("hidden")}function fi(e,t){let s=document.getElementById("team-pw-modal"),n=document.getElementById("team-pw-modal-subtitle"),o=document.getElementById("team-pw-error");s&&(document.getElementById("team-pw-user-id").value=e,document.getElementById("team-new-password").value=Jt(),n.textContent=`Set a new password for ${t}.`,o.classList.add("hidden"),o.textContent="",s.classList.remove("hidden"))}function es(){var e;(e=document.getElementById("team-pw-modal"))==null||e.classList.add("hidden")}async function bi(){var d,p,c,g,r,u,v,h;let e=(d=document.getElementById("team-edit-id"))==null?void 0:d.value,t=(c=(p=document.getElementById("team-member-name"))==null?void 0:p.value)==null?void 0:c.trim(),s=(r=(g=document.getElementById("team-member-email"))==null?void 0:g.value)==null?void 0:r.trim(),n=(u=document.getElementById("team-member-role"))==null?void 0:u.value,o=(v=document.getElementById("team-member-password"))==null?void 0:v.value,i=document.getElementById("team-modal-error"),a=document.getElementById("btn-team-save");if(!t||t.length<2){i.textContent="Name must be at least 2 characters.",i.classList.remove("hidden");return}if(!s||!s.includes("@")){i.textContent="Please enter a valid email address.",i.classList.remove("hidden");return}if(!e&&(!o||o.length<8)){i.textContent="Password must be at least 8 characters.",i.classList.remove("hidden");return}a.disabled=!0,a.textContent=e?"Saving\u2026":"Adding\u2026";let l;e?l=await M.put(`/team/${e}`,{name:t,email:s,role:n}):l=await M.post("/team",{name:t,email:s,role:n,password:o}),a.disabled=!1,a.textContent=e?"Save Changes":"Add Member",l.ok?(Qt(),A(e?"Member updated.":`${t} has been added to the team.`,"success"),Ns()):(i.textContent=((h=l.error)==null?void 0:h.message)||"Something went wrong.",i.classList.remove("hidden"))}async function yi(){var a,l;let e=(a=document.getElementById("team-pw-user-id"))==null?void 0:a.value,t=(l=document.getElementById("team-new-password"))==null?void 0:l.value,s=document.getElementById("team-pw-error"),n=document.getElementById("btn-pw-save");if(!t||t.length<8){s.textContent="Password must be at least 8 characters.",s.classList.remove("hidden");return}n.disabled=!0,n.textContent="Resetting\u2026";let{ok:o,error:i}=await M.post(`/team/${e}/password`,{password:t});n.disabled=!1,n.textContent="Reset Password",o?(es(),A("Password has been reset.","success")):(s.textContent=(i==null?void 0:i.message)||"Failed to reset password.",s.classList.remove("hidden"))}function xi(){return setTimeout(()=>jt(),0),`
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
  `}async function jt(e="all"){var b;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await $n(n.files),n.value="",jt(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=m=>{m.target.closest("button")||n==null||n.click()},o.ondragover=m=>{m.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async m=>{m.preventDefault(),o.classList.remove("is-dragover"),m.dataTransfer.files.length>0&&(await $n(m.dataTransfer.files),jt(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(m=>{m.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(L=>{L.className="vs-device-btn"}),m.className="vs-device-btn vs-device-btn-active",jt(m.dataset.filter)}});let a=e==="code",l=!a&&e!=="all"?`?category=${e}`:"",{ok:d,data:p}=await M.get(`/assets${l}`);if(!d||!((b=p==null?void 0:p.assets)!=null&&b.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let m=document.getElementById("btn-empty-upload"),L=document.getElementById("btn-upload-asset");m&&L&&m.addEventListener("click",()=>L.click());return}let c=p.assets;if(a&&(c=c.filter(m=>m.category==="css"||m.category==="js"),c.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${C.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let g=["jpg","jpeg","png","gif","webp","svg","ico"],r=c.filter(m=>m.category==="images"&&g.includes(m.extension)),u=c.filter(m=>!g.includes(m.extension)||m.category!=="images");function v(m,L){return m==="css"?C.fileCode:m==="js"?C.fileCode:m==="json"?C.fileJson:m==="pdf"?C.filePdf:["woff2","woff","ttf","otf"].includes(m)?C.type:["mp4","webm"].includes(m)?C.film:["mp3","wav","ogg"].includes(m)?C.music:["txt","md","csv"].includes(m)?C.fileText:["doc","docx","xls","xlsx"].includes(m)?C.fileText:L==="images"?C.image:C.fileText}let h=["css","js","json","svg"],f="";r.length>0&&(f+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',r.forEach((m,L)=>{var q;let E=Ln(m.size),T=m.width?`${m.width}\xD7${m.height}`:"",B=m.extension==="svg";f+=`
        <div class="vs-asset-card" data-lightbox-idx="${L}">
          <div class="vs-asset-card-thumb${B?" is-svg":""}" style="cursor:pointer">
            <img src="${m.thumbnail||m.path}" alt="${x(((q=m.meta)==null?void 0:q.alt)||m.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${x(m.filename)}">${x(m.filename)}</p>
            <p class="vs-asset-card-meta">${T?T+" \xB7 ":""}${E}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${m.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${C.copy}</button>
            <button data-delete-asset="${m.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${C.x}</button>
          </div>
        </div>
      `}),f+="</div>"),u.length>0&&u.forEach(m=>{let L=Ln(m.size),E=h.includes(m.extension);f+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${v(m.extension,m.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${x(m.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${m.category} \xB7 ${L}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${E?`
              <button data-edit-asset="${m.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${C.pencil}</button>
            `:""}
            <button data-copy-path="${m.path}" title="Copy web path"
              class="vs-asset-action-btn">${C.copy}</button>
            ${m.category!=="css"&&m.category!=="js"?`
              <button data-delete-asset="${m.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${C.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=f,t.querySelectorAll("[data-lightbox-idx]").forEach(m=>{let L=m.querySelector(".vs-asset-card-thumb");L&&L.addEventListener("click",()=>{let E=parseInt(m.dataset.lightboxIdx,10);wi(r,E,e)})}),t.querySelectorAll("[data-copy-path]").forEach(m=>{m.addEventListener("click",()=>{navigator.clipboard.writeText(m.dataset.copyPath).then(()=>{let L=m.innerHTML;m.innerHTML="\u2713",m.classList.add("vs-asset-action-copied"),setTimeout(()=>{m.innerHTML=L,m.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(m=>{m.addEventListener("click",()=>{let E=m.dataset.editAsset.replace(/^\//,"");Ss(E)})}),t.querySelectorAll("[data-delete-asset]").forEach(m=>{m.addEventListener("click",async()=>{if(!await be({title:"Delete Asset",description:`Delete ${m.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:E}=await M.delete("/assets",{path:m.dataset.deleteAsset});E?(A("Asset deleted.","success"),jt(e)):A("Could not delete asset.","error")})})}function wi(e,t,s){let n=t;function o(r){if(r===0)return"0 B";let u=1024,v=["B","KB","MB","GB"],h=Math.floor(Math.log(r)/Math.log(u));return parseFloat((r/Math.pow(u,h)).toFixed(1))+" "+v[h]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var b,m;let r=e[n],u=r.width?`${r.width}\xD7${r.height}`:"",v=o(r.size),h=[u,v,(b=r.extension)==null?void 0:b.toUpperCase()].filter(Boolean),f=e.length>1;return`
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
            <img src="${r.path}" alt="${x(((m=r.meta)==null?void 0:m.alt)||r.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${x(r.filename)}</span>
            <span class="vs-lightbox-details">${h.join(" \xB7 ")}${f?` \xB7 ${n+1} / ${e.length}`:""}</span>
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
    `}let l=document.createElement("div");l.id="vs-lightbox",l.className="vs-lightbox",l.setAttribute("role","dialog"),l.setAttribute("aria-label","Image preview"),l.innerHTML=a(),document.body.appendChild(l),requestAnimationFrame(()=>{requestAnimationFrame(()=>l.classList.add("is-visible"))});function d(){l.classList.remove("is-visible"),setTimeout(()=>l.remove(),400),document.removeEventListener("keydown",c)}function p(r){n=r,l.innerHTML=a(),g()}function c(r){if(r.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;d(),r.preventDefault()}r.key==="ArrowRight"&&e.length>1&&(p((n+1)%e.length),r.preventDefault()),r.key==="ArrowLeft"&&e.length>1&&(p((n-1+e.length)%e.length),r.preventDefault())}function g(){var u,v,h;(u=l.querySelector("#lightbox-close"))==null||u.addEventListener("click",f=>{f.stopPropagation(),d()}),l.addEventListener("click",f=>{(f.target===l||f.target.classList.contains("vs-lightbox-stage"))&&d()}),(v=l.querySelector("#lightbox-prev"))==null||v.addEventListener("click",f=>{f.stopPropagation(),p((n-1+e.length)%e.length)}),(h=l.querySelector("#lightbox-next"))==null||h.addEventListener("click",f=>{f.stopPropagation(),p((n+1)%e.length)});let r=l.querySelector("#lightbox-copy");r==null||r.addEventListener("click",f=>{f.stopPropagation();let b=e[n];navigator.clipboard.writeText(b.path).then(()=>{let m=r.innerHTML;r.innerHTML=`${C.check}<span>Copied!</span>`,r.style.borderColor="var(--vs-success)",r.style.color="var(--vs-success)",setTimeout(()=>{r.innerHTML=m,r.style.borderColor="",r.style.color=""},2e3),A("Path copied!","success")})})}document.addEventListener("keydown",c),g()}async function $n(e){var i,a,l;if(Re()||qs())return;let t=document.getElementById("status-text");t&&(t.textContent=`Uploading ${e.length} file(s)...`);let s=new FormData;for(let d of e)s.append("file[]",d);let n=F.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let p=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();if(p.ok){let c=((a=(i=p.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0;A(`${c} file(s) uploaded.`,"success"),t&&(t.textContent=`\u2713 ${c} file(s) uploaded`)}else{let c=((l=p.error)==null?void 0:l.message)||"Upload failed";A(c,"error"),t&&(t.textContent="\u2717 "+c)}t&&setTimeout(()=>{t&&(t.textContent="Ready")},4e3)}catch{A("Upload failed.","error"),t&&(t.textContent="\u2717 Upload failed",setTimeout(()=>{t&&(t.textContent="Ready")},4e3))}}function Ln(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function ki(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),l=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:l===1?"Yesterday":l<30?`${l} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function Ei(){return setTimeout(()=>ts(),0),`
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
  `}async function ts(){var i;let e=document.getElementById("snapshots-list");if(!e)return;let t=document.getElementById("btn-create-snapshot");t&&t.addEventListener("click",()=>{Sn()});let{ok:s,data:n}=await M.get("/snapshots");if(!s||!((i=n==null?void 0:n.snapshots)!=null&&i.length)){e.innerHTML=`
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
    `;let a=document.getElementById("btn-empty-create-snapshot");a&&a.addEventListener("click",()=>Sn());return}let o=n.snapshots;e.innerHTML=`
    <div class="vs-timeline">
      ${o.map((a,l)=>{let d=ki(a.created_at),p=new Date(a.created_at).toLocaleString(),c=a.size_bytes?(a.size_bytes/1024).toFixed(0)+" KB":"\u2014",g=l===o.length-1,r,u,v;a.snapshot_type==="pre_publish"?(r="var(--vs-success)",u="vs-snap-badge-green",v="Pre-publish"):a.snapshot_type==="manual"?(r="var(--vs-accent)",u="vs-snap-badge-amber",v="Manual"):(r="var(--vs-text-ghost)",u="vs-snap-badge-gray",v="Auto");let h=a.description?`<p class="vs-timeline-desc">${x(a.description)}</p>`:"";return`
          <div class="vs-timeline-item${g?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${r}; box-shadow: 0 0 0 3px color-mix(in srgb, ${r} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${u}">${v}</span>
                  <span class="vs-timeline-label">${x(a.label||"Snapshot #"+a.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${p}">${d}</span>
              </div>
              ${h}
              <div class="vs-timeline-meta">${a.file_count} files \xB7 ${c}</div>
              <div class="vs-timeline-actions">
                <button data-preview-id="${a.id}" data-snap='${JSON.stringify({label:a.label,description:a.description,type:a.snapshot_type,files:a.file_count,size:c,date:p}).replace(/'/g,"&#39;")}' class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${C.eye} Preview
                </button>
                <button data-restore-id="${a.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-secondary);">
                  ${C.rotateCcw} Restore
                </button>
                <button data-delete-id="${a.id}" class="vs-btn vs-btn-ghost vs-btn-xs" style="color: var(--vs-text-ghost);">
                  ${C.trash2}
                </button>
              </div>
            </div>
          </div>
        `}).join("")}
    </div>
  `,e.querySelectorAll("[data-preview-id]").forEach(a=>{a.addEventListener("click",()=>{let l=JSON.parse(a.dataset.snap);Ci(l)})}),e.querySelectorAll("[data-restore-id]").forEach(a=>{a.addEventListener("click",async()=>{let l=a.dataset.restoreId;if(!await be({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;a.innerHTML=`${C.rotateCcw} Restoring\u2026`,a.disabled=!0;let{ok:p,error:c}=await M.post(`/snapshots/${l}/restore`);if(p){let g=document.getElementById("status-text");g&&(g.textContent="\u2713 Snapshot restored",setTimeout(()=>{g&&(g.textContent="Ready")},4e3)),A("Snapshot restored.","success"),ts()}else A((c==null?void 0:c.message)||"Failed to restore snapshot.","error"),a.innerHTML=`${C.rotateCcw} Restore`,a.disabled=!1})}),e.querySelectorAll("[data-delete-id]").forEach(a=>{a.addEventListener("click",async()=>{let l=a.dataset.deleteId;if(!await be({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;a.innerHTML="Deleting\u2026",a.disabled=!0;let{ok:p,error:c}=await M.delete(`/snapshots/${l}`);p?(A("Snapshot deleted.","success"),ts()):(A((c==null?void 0:c.message)||"Failed to delete snapshot.","error"),a.innerHTML=`${C.trash2}`,a.disabled=!1)})})}function Sn(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>fe(t);t.addEventListener("click",a=>{a.target===t&&s()}),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var p;let a=((p=n==null?void 0:n.value)==null?void 0:p.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:l,error:d}=await M.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),l?(A("Snapshot created.","success"),ts()):A((d==null?void 0:d.message)||"Failed to create snapshot.","error")})}function Ci(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),s.addEventListener("click",a=>{a.target===s&&fe(s)}),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>fe(s))}var Ie={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function $i(){return setTimeout(()=>Li(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function Li(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await M.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
  `}function Si(e){return setTimeout(()=>Bi(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function Bi(e){var r,u;let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await M.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
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
          ${C.zap} Upgrade to Action
        </button>
        <button class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv" ${a.total===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${a.total===0?"No submissions to export":"Download submissions as CSV"}">
          ${C.download} Export CSV
        </button>
      </div>
    </div>
  `;let l=document.getElementById("form-filter-status"),d=document.getElementById("form-filter-source"),p=document.getElementById("form-filter-search"),c=null,g=()=>ss(e,1);l==null||l.addEventListener("change",g),d==null||d.addEventListener("change",g),p==null||p.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(g,300)}),(r=document.getElementById("btn-export-csv"))==null||r.addEventListener("click",async()=>{let v=document.getElementById("btn-export-csv"),h=v.innerHTML;v.innerHTML=`${C.loader} Exporting...`,v.disabled=!0;try{let f=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/forms/"+e+"/submissions/export")}`,{credentials:"same-origin"});if(!f.ok)throw new Error("Export failed");let b=await f.blob(),m=URL.createObjectURL(b),L=document.createElement("a");L.href=m,L.download=`${e}_submissions_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(L),L.click(),L.remove(),URL.revokeObjectURL(m),A("CSV downloaded","success")}catch{A("Failed to export CSV","error")}v.innerHTML=h,v.disabled=!1}),(u=document.getElementById("btn-upgrade-to-action"))==null||u.addEventListener("click",async()=>{var m,L;if(Re()||qs())return;let v=(i.fields||[]).length;if(!await be({title:"Upgrade to Agent Action",description:`This will create a new agent action with${v>0?` the ${v} field${v!==1?"s":""} from`:""} this form. It starts as a draft so you can review before going live. Your original form stays unchanged.`,confirmLabel:"Create Action"}))return;let f=document.getElementById("btn-upgrade-to-action"),b=f.innerHTML;f.innerHTML=`${C.loader} Converting...`,f.disabled=!0,f.style.opacity="0.6";try{let E={text:"text",email:"email",number:"number",select:"select",date:"date",textarea:"textarea",tel:"tel",url:"url",checkbox:"checkbox",radio:"radio",hidden:"hidden"},T=[],B=0;(i.fields||[]).forEach(y=>{let N=E[y.type];if(!N){B++;return}let O={name:y.name,label:y.label||y.name,type:N,required:y.required||!1};(N==="select"||N==="radio")&&y.options&&(O.options=y.options),y.placeholder&&(O.placeholder=y.placeholder),T.push(O)}),B>0&&A(`${B} file upload field(s) skipped \u2014 actions don't support file uploads.`,"warning");let q=e.replace(/[^a-z0-9-]/gi,"-").replace(/-+/g,"-").replace(/^-|-$/g,""),H=Date.now().toString(36).slice(-4),U={id:q+"-"+H,name:i.name||e,description:i.description||`Converted from form: ${e}`,category:"general",icon:"circle",active:!1,fields:T,responses:{success:"Thank you! Your submission has been received. Your confirmation code is {confirmation_code}."}},{ok:w,data:$}=await M.post("/agentic/actions",U);if(w&&($!=null&&$.action))A(`"${$.action.name}" created as agent action`,"success"),window.location.hash=`#/actions/${$.action.id}`;else{let N=(((m=$==null?void 0:$.error)==null?void 0:m.code)||"")==="already_exists"?"An action based on this form already exists. Check the Actions tab.":((L=$==null?void 0:$.error)==null?void 0:L.message)||"Failed to create action";A(N,"error"),f.innerHTML=b,f.disabled=!1,f.style.opacity=""}}catch{A("Failed to convert form to action","error"),f.innerHTML=b,f.disabled=!1,f.style.opacity=""}}),await ss(e,1)}async function ss(e,t=1){var f,b,m;let s=document.getElementById("form-submissions");if(!s)return;let n=((f=document.getElementById("form-filter-status"))==null?void 0:f.value)||"all",o=((b=document.getElementById("form-filter-source"))==null?void 0:b.value)||"all",i=((m=document.getElementById("form-filter-search"))==null?void 0:m.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:l,data:d}=await M.get(a);if(!l||!d){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let p=d.submissions||[],c=d.total||0,g=d.per_page||20,r=Math.ceil(c/g);if(!p.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:u}=await M.get(`/forms/${encodeURIComponent(e)}`),v=u==null?void 0:u.form,h={};v!=null&&v.fields&&v.fields.forEach(L=>{h[L.name]=L.label||L.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${p.map(L=>{let E=Ie[L.status]||Ie.new,T=Object.entries(L.data||{}).filter(([H])=>!H.startsWith("_")).slice(0,3).map(([H,U])=>{let w=h[H]||H,$=Array.isArray(U)?U.join(", "):String(U);return`<span class="vs-sub-field"><strong>${x(w)}:</strong> ${x($.substring(0,80))}${$.length>80?"\u2026":""}</span>`}).join(""),B=Fs(L.created_at),q=L.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${L.id}" data-form-id="${x(e)}" style="border-left-color: ${E.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${E.bg}; color: ${E.text};">${E.label}</span>
                ${q?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${x(B)}</span>
            </div>
            <div class="vs-submission-preview">
              ${T||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${L.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${L.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;">
                ${Object.entries(Ie).map(([H,U])=>`<option value="${H}" ${L.status===H?"selected":""}>${U.label}</option>`).join("")}
              </select>
              <button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${L.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `}).join("")}
    </div>

    ${r>1?`
      <div class="vs-pagination">
        ${t>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t-1}" data-form-id="${x(e)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${t} of ${r} \xB7 ${c} submission${c!==1?"s":""}</span>
        ${t<r?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t+1}" data-form-id="${x(e)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${c} submission${c!==1?"s":""}</span>
      </div>
    `}
  `,Ti(e,t)}function Ti(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;Bn(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{let n=s.dataset.subId,{ok:o}=await M.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){A("Status updated","success");let i=s.closest(".vs-submission-card"),a=Ie[s.value];if(i&&a){i.style.borderLeftColor=a.text;let l=i.querySelector(".vs-status-pill");l&&(l.style.background=a.bg,l.style.color=a.text,l.textContent=a.label)}}else A("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.dataset.subId;if(!await be({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await M.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(A("Submission deleted","success"),ss(e,t)):A("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);ss(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;Bn(e,o)})})}async function Bn(e,t){var g,r,u,v;(g=document.getElementById("submission-detail-overlay"))==null||g.remove();let{ok:s,data:n}=await M.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(h=>String(h.id)===String(t));if(!o){A("Submission not found","error");return}let{data:i}=await M.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,l={};if(a!=null&&a.fields&&a.fields.forEach(h=>{l[h.name]=h.label||h.name}),o.status==="new"){await M.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"}),o.status="read";let h=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);h&&(h.value="read");let f=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(f){f.style.borderLeftColor=Ie.read.text;let b=f.querySelector(".vs-status-pill");b&&(b.style.background=Ie.read.bg,b.style.color=Ie.read.text,b.textContent="Read")}}let d=Ie[o.status]||Ie.new,p=document.createElement("div");p.id="submission-detail-overlay",p.className="vs-slide-overlay",p.innerHTML=`
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
          ${Object.entries(o.data||{}).filter(([h])=>!h.startsWith("_")).map(([h,f])=>{let b=l[h]||h,m=Array.isArray(f)?f.join(", "):String(f);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${x(b)}</div>
                <div class="vs-sub-detail-field-value">${x(m)}</div>
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
          ${Object.entries(Ie).map(([h,f])=>`<option value="${h}" ${o.status===h?"selected":""}>${f.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(p),requestAnimationFrame(()=>{requestAnimationFrame(()=>p.classList.add("is-visible"))});let c=()=>{p.classList.remove("is-visible"),setTimeout(()=>p.remove(),200)};p.addEventListener("click",h=>{h.target===p&&c()}),(r=document.getElementById("close-sub-detail"))==null||r.addEventListener("click",c),(u=document.getElementById("btn-save-sub-notes"))==null||u.addEventListener("click",async()=>{var b;let h=((b=document.getElementById("sub-detail-notes"))==null?void 0:b.value)||"",{ok:f}=await M.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:h});A(f?"Notes saved":"Failed to save notes",f?"success":"error")}),(v=document.getElementById("sub-detail-status"))==null||v.addEventListener("change",async h=>{let f=h.target.value,{ok:b}=await M.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:f});if(b){A("Status updated","success");let m=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);m&&(m.value=f);let L=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),E=Ie[f];if(L&&E){L.style.borderLeftColor=E.text;let T=L.querySelector(".vs-status-pill");T&&(T.style.background=E.bg,T.style.color=E.text,T.textContent=E.label)}}else A("Failed to update status","error")})}function Fs(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}var As={confirmed:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Confirmed"},pending:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"Pending"},cancelled:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Cancelled"},completed:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Completed"},rejected:{bg:"var(--vs-error-dim)",text:"var(--vs-error)",label:"Rejected"},"no-show":{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"No-show"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}},Mi={reservation:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',appointment:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"quote-request":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',waitlist:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',order:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',"event-registration":'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>'};function Ii(){return setTimeout(()=>Ai(),0),`
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
  `}async function Ai(){var a,l,d,p,c,g;let e=document.getElementById("actions-list-container");if(!e)return;(a=document.getElementById("btn-new-action"))==null||a.addEventListener("click",async()=>{let r=await Tn();r!=null&&r.ok&&r.actionId&&(window.location.hash=`#/actions/${r.actionId}`)});let t=document.getElementById("bar-settings-card");if(t){let E=function(T){let B=document.getElementById("bar-color-swatch"),q=document.getElementById("bar-brand-hex"),H=document.getElementById("bar-brand-color");B&&(B.style.background=T),q&&q!==document.activeElement&&(q.value=T),H&&(H.value=T),document.querySelectorAll(".bar-color-preset").forEach(U=>{U.style.borderColor=U.dataset.color.toLowerCase()===T.toLowerCase()?"var(--vs-text-primary)":"transparent"})},{ok:r,data:u}=await M.get("/agentic/actions/bar-settings"),v=r&&(u==null?void 0:u.settings)||{theme:"bottom-bar",visibility:"all-pages"},h=v.theme||"bottom-bar",f=v.visibility||"all-pages",b={"bottom-bar":`<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: auto;">
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
      </svg>`},m={"bottom-bar":"Bottom Bar","floating-fab":"Floating FAB","minimal-pill":"Minimal Pill"},L={"all-pages":"All Pages","homepage-only":"Homepage Only",hidden:"Hidden"};t.innerHTML=`
      <div class="vs-settings-card" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h2 class="vs-settings-card-title" style="margin-bottom: 2px;">Actions Bar</h2>
            <p style="font-size: 12px; color: var(--vs-text-tertiary); margin: 0;">How actions appear on your published site.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="font-size: 12px; color: var(--vs-text-secondary); white-space: nowrap;">Show on</label>
            <select id="bar-visibility" class="vs-input" style="font-size: 12px; height: 30px; padding: 4px 8px; min-width: 130px;">
              ${Object.entries(L).map(([T,B])=>`<option value="${T}" ${f===T?"selected":""}>${B}</option>`).join("")}
            </select>
          </div>
        </div>
        <div id="bar-theme-picker" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          ${Object.entries(b).map(([T,B])=>{let q=T===h;return`
              <button type="button" class="bar-theme-option" data-theme="${T}" style="
                border: 2px solid ${q?"var(--vs-accent)":"var(--vs-border-subtle)"};
                background: ${q?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)"};
                border-radius: var(--radius-lg, 10px);
                padding: 14px 12px 10px;
                cursor: pointer;
                display: flex; flex-direction: column; align-items: center; gap: 8px;
                transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.12s;
                color: ${q?"var(--vs-accent)":"var(--vs-text-ghost)"};
                position: relative;
                outline: none;
              "
                onmouseenter="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-medium)';this.style.transform='translateY(-1px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';}"
                onmouseleave="if(!this.classList.contains('active')){this.style.borderColor='var(--vs-border-subtle)';this.style.transform='';this.style.boxShadow='';}"
              >
                <div style="width: 100%; max-width: 120px;">${B}</div>
                <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
                  color: ${q?"var(--vs-accent)":"var(--vs-text-secondary)"};">${m[T]}</span>
                ${q?`<div style="
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
              ${["light","dark"].map(T=>{let B=T===(v.color_scheme||"light");return`<button type="button" class="bar-scheme-btn" data-scheme="${T}" style="
                  border: none; padding: 7px 16px; font-size: 12px; font-weight: 500; cursor: pointer;
                  background: ${B?"var(--vs-accent)":"var(--vs-bg-surface)"};
                  color: ${B?"#fff":"var(--vs-text-secondary)"};
                  transition: background 0.15s, color 0.15s;
                  display: inline-flex; align-items: center; gap: 6px;
                ">${{light:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',dark:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'}[T]} ${T.charAt(0).toUpperCase()+T.slice(1)}</button>`}).join("")}
            </div>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <label style="font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); display: block; margin-bottom: 8px;">Brand Color</label>
            <div style="display: flex; align-items: center; gap: 10px;">
              <label style="position: relative; cursor: pointer; flex-shrink: 0;">
                <input type="color" id="bar-brand-color" value="${v.brand_color||"#EA580C"}" style="
                  position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
                ">
                <div id="bar-color-swatch" style="
                  width: 32px; height: 32px; border-radius: 8px;
                  background: ${v.brand_color||"#EA580C"};
                  border: 2px solid var(--vs-border-subtle);
                  transition: border-color 0.15s, box-shadow 0.15s;
                  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                "></div>
              </label>
              <input type="text" id="bar-brand-hex" class="vs-input" value="${v.brand_color||"#EA580C"}" placeholder="#EA580C" style="
                font-size: 12px; height: 32px; padding: 4px 8px; width: 88px; font-family: var(--font-mono, monospace); letter-spacing: 0.02em;
              ">
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${["#EA580C","#2563EB","#059669","#7C3AED","#DB2777","#D97706","#0891B2","#374151"].map(T=>`
                  <button type="button" class="bar-color-preset" data-color="${T}" title="${T}" style="
                    width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid transparent;
                    background: ${T}; cursor: pointer; transition: border-color 0.12s, transform 0.12s;
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
    `,document.querySelectorAll(".bar-theme-option").forEach(T=>{T.addEventListener("click",async()=>{let B=T.dataset.theme;document.querySelectorAll(".bar-theme-option").forEach(H=>{let U=H.dataset.theme===B;H.style.borderColor=U?"var(--vs-accent)":"var(--vs-border-subtle)",H.style.background=U?"color-mix(in srgb, var(--vs-accent) 5%, var(--vs-bg-surface))":"var(--vs-bg-surface)",H.style.color=U?"var(--vs-accent)":"var(--vs-text-ghost)",H.classList.toggle("active",U);let w=H.querySelector("span");w&&(w.style.color=U?"var(--vs-accent)":"var(--vs-text-secondary)");let $=H.querySelector('[style*="position: absolute"]');if($&&!U&&$.remove(),U&&!H.querySelector('[style*="position: absolute"]')){let y=document.createElement("div");y.style.cssText="position:absolute;top:8px;right:8px;width:16px;height:16px;background:var(--vs-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;",y.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',H.appendChild(y)}});let{ok:q}=await M.put("/agentic/actions/bar-settings",{theme:B});q&&(T.style.boxShadow="0 0 0 3px var(--vs-accent-dim)",setTimeout(()=>T.style.boxShadow="",400))})}),(l=document.getElementById("bar-visibility"))==null||l.addEventListener("change",async T=>{let{ok:B}=await M.put("/agentic/actions/bar-settings",{visibility:T.target.value});B&&A("Bar visibility updated","success")}),document.querySelectorAll(".bar-scheme-btn").forEach(T=>{T.addEventListener("click",async()=>{let B=T.dataset.scheme;document.querySelectorAll(".bar-scheme-btn").forEach(H=>{let U=H.dataset.scheme===B;H.style.background=U?"var(--vs-accent)":"var(--vs-bg-surface)",H.style.color=U?"#fff":"var(--vs-text-secondary)"});let{ok:q}=await M.put("/agentic/actions/bar-settings",{color_scheme:B});q&&A("Color scheme updated","success")})}),(d=document.getElementById("bar-brand-color"))==null||d.addEventListener("input",T=>{E(T.target.value)}),(p=document.getElementById("bar-brand-color"))==null||p.addEventListener("change",async T=>{let{ok:B}=await M.put("/agentic/actions/bar-settings",{brand_color:T.target.value});B&&A("Brand color updated","success")}),(c=document.getElementById("bar-brand-hex"))==null||c.addEventListener("change",async T=>{let B=T.target.value.trim();if(B.startsWith("#")||(B="#"+B),/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(B)){E(B);let{ok:q}=await M.put("/agentic/actions/bar-settings",{brand_color:B});q&&A("Brand color updated","success")}}),document.querySelectorAll(".bar-color-preset").forEach(T=>{T.addEventListener("click",async()=>{let B=T.dataset.color;E(B);let{ok:q}=await M.put("/agentic/actions/bar-settings",{brand_color:B});q&&A("Brand color updated","success")})}),E(v.brand_color||"#EA580C")}let{ok:s,data:n}=await M.get("/agentic/actions");if(!s||!n){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load actions.</div>';return}let o=n.actions||[];if(!o.length){e.innerHTML=`
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
    `,(g=document.getElementById("btn-empty-new-action"))==null||g.addEventListener("click",async()=>{let r=await Tn();r!=null&&r.ok&&r.actionId&&(window.location.hash=`#/actions/${r.actionId}`)});return}e.innerHTML=`
    <div id="actions-list" class="flex flex-col gap-4">
      ${o.map((r,u)=>{let v=r.active,h=r._stats||r.stats||{},f=h.total||0,b=h.last_created_at?Fs(h.last_created_at):"\u2014",m={calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',utensils:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',"file-text":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',"shopping-bag":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',ticket:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',"message-square":'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',circle:'<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>'},L=m[r.icon]||m.circle;return`
          <div class="vs-action-list-row vs-form-card" data-action-id="${x(r.id)}" style="cursor: pointer; transition: box-shadow 0.15s ease;">
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
            <div class="vs-form-card-icon" style="color: ${v?"var(--vs-success)":"var(--vs-text-ghost)"}; background: ${v?"color-mix(in srgb, var(--vs-success) 10%, transparent)":"var(--vs-bg-raised)"};">
              ${L}
            </div>
            <div class="vs-form-card-body">
              <div class="vs-form-card-name">${x(r.name||r.id)}</div>
              ${r.description?`<div class="vs-form-card-desc">${x(r.description)}</div>`:""}
              <div class="vs-form-card-meta">
                <span class="vs-status-pill" style="
                  background: ${v?"var(--vs-success-dim)":"var(--vs-bg-raised)"};
                  color: ${v?"var(--vs-success)":"var(--vs-text-ghost)"};
                  font-size: 11px; padding: 1px 8px;
                ">${v?"Active":"Draft"}</span>
                <span class="vs-form-card-dot">\xB7</span>
                <span>${f} record${f!==1?"s":""}</span>
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
  `,document.querySelectorAll(".vs-action-list-row").forEach(r=>{r.addEventListener("click",u=>{if(u.target.closest(".vs-action-reorder"))return;let v=r.dataset.actionId;v&&(window.location.hash="#/actions/"+encodeURIComponent(v))})});async function i(){let r=document.querySelectorAll("#actions-list .vs-action-list-row"),u=Array.from(r).map(v=>v.dataset.actionId);await M.post("/agentic/actions/reorder",{order:u})}document.querySelectorAll(".action-move-up").forEach(r=>{r.addEventListener("click",async u=>{u.preventDefault(),u.stopPropagation();let v=r.closest(".vs-action-list-row"),h=v==null?void 0:v.previousElementSibling;h&&(v.parentNode.insertBefore(v,h),v.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>v.style.boxShadow="",300),await i())})}),document.querySelectorAll(".action-move-down").forEach(r=>{r.addEventListener("click",async u=>{u.preventDefault(),u.stopPropagation();let v=r.closest(".vs-action-list-row"),h=v==null?void 0:v.nextElementSibling;h&&(v.parentNode.insertBefore(h,v),v.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>v.style.boxShadow="",300),await i())})})}async function Tn(){return new Promise(async e=>{var l;let{ok:t,data:s}=await M.get("/agentic/actions/templates"),n=t&&(s==null?void 0:s.templates)||[],o=document.createElement("div");o.className="vs-modal-overlay",o.innerHTML=`
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
            ${n.map(d=>`
              <button class="vs-template-card" data-template-id="${x(d.id)}" style="
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 12px; border-radius: 10px;
                border: 1.5px solid var(--vs-border);
                background: var(--vs-bg-floating);
                cursor: pointer; transition: all 0.15s ease;
                text-align: center; gap: 6px;
              ">
                <span style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--vs-bg-raised); color: var(--vs-accent);">${Mi[d.id]||C.zap}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--vs-text-primary);">${x(d.name)}</span>
                <span style="font-size: 11px; color: var(--vs-text-tertiary); line-height: 1.3;">${x(d.description||"")}</span>
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
    `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=(d=null)=>{document.removeEventListener("keydown",a),o.classList.remove("is-visible"),setTimeout(()=>o.remove(),200),e(d)},a=d=>{d.key==="Escape"&&(d.preventDefault(),i())};document.addEventListener("keydown",a),o.addEventListener("click",d=>{d.target===o&&i()}),(l=document.getElementById("close-new-action-modal"))==null||l.addEventListener("click",()=>i()),o.querySelectorAll(".vs-template-card").forEach(d=>{d.addEventListener("mouseenter",()=>{d.style.borderColor="var(--vs-accent)",d.style.background="var(--vs-bg-raised)"}),d.addEventListener("mouseleave",()=>{d.style.borderColor=(d.dataset.templateId==="blank","var(--vs-border)"),d.style.background=d.dataset.templateId==="blank"?"transparent":"var(--vs-bg-floating)"}),d.addEventListener("click",async()=>{var c,g;let p=d.dataset.templateId;if(o.querySelectorAll(".vs-template-card").forEach(r=>{r.style.pointerEvents="none",r.style.opacity="0.5"}),d.style.opacity="1",d.style.borderColor="var(--vs-accent)",p==="blank"){let r={id:"new-action-"+Date.now().toString(36).slice(-4),name:"New Action",description:"",category:"general",active:!1,fields:[{name:"name",type:"text",label:"Full Name",required:!0}],responses:{success:"Submission received. Your confirmation code is {confirmation_code}."}},{ok:u,data:v}=await M.post("/agentic/actions",r);u&&(v!=null&&v.action)?(A("Action created","success"),i({ok:!0,actionId:v.action.id})):(A(((c=v==null?void 0:v.error)==null?void 0:c.message)||"Failed to create action","error"),i())}else{let{ok:r,data:u}=await M.post("/agentic/actions/from-template",{template_id:p});r&&(u!=null&&u.action)?(A(`${u.action.name} created`,"success"),i({ok:!0,actionId:u.action.id})):(A(((g=u==null?void 0:u.error)==null?void 0:g.message)||"Failed to create action","error"),i())}})})})}function _i(e){return setTimeout(()=>Yt(e),0),`
    <div>
      <div id="action-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading action...</div>
      </div>
      <div id="action-detail-body"></div>
      <div id="action-records">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading records...</div>
      </div>
    </div>
  `}async function Yt(e){var p,c,g,r,u,v,h,f,b;let t=document.getElementById("action-detail-header"),s=document.getElementById("action-detail-body"),n=document.getElementById("action-records");if(!t)return;let{ok:o,data:i}=await M.get(`/agentic/actions/${encodeURIComponent(e)}`);if(!o||!i){t.innerHTML='<div class="text-sm text-vs-error py-6">Action not found.</div>',s&&(s.innerHTML=""),n&&(n.innerHTML="");return}let a=i.action,l=i.stats||{},d=a.active;if(t.innerHTML=`
    <div class="vs-page-header" style="margin-bottom: 0;">
      <div class="flex items-center gap-2 mb-2">
        <a href="#/actions" class="text-sm text-vs-text-tertiary hover:text-vs-text-secondary transition-colors">Actions</a>
        <span class="text-sm text-vs-text-ghost">/</span>
        <span class="text-sm text-vs-text-secondary font-medium">${x(a.name||e)}</span>
      </div>
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <h1 class="vs-page-title">${x(a.name||e)}</h1>
        <div class="flex items-center gap-2">
          <button id="btn-toggle-active" class="vs-btn ${d?"vs-btn-secondary":"vs-btn-primary"} vs-btn-sm" title="${d?"Deactivate this action":"Activate this action on your website"}">
            ${d?"\u25CF Live \u2014 click to deactivate":"\u25CB Draft \u2014 click to go live"}
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
        <span class="vs-form-stat-value" style="color: var(--vs-accent)">${((g=l.by_status)==null?void 0:g.completed)||0}</span>
        <span class="vs-form-stat-label">Completed</span>
      </div>
      <div class="vs-form-stat">
        <span class="vs-form-stat-value">${l.today||0}</span>
        <span class="vs-form-stat-label">Today</span>
      </div>
    </div>
  `,s){let m=function(w){let $=w.querySelector(".field-required");if(!$)return;let y=w.querySelectorAll("span")[0],N=w.querySelectorAll("span")[1],O=()=>{y.style.background=$.checked?"var(--vs-accent)":"var(--vs-border-medium, #ccc)",N.style.left=$.checked?"18px":"2px"};$.addEventListener("change",O)},L=function(w){return w.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"").replace(/^[0-9_]+/,"").replace(/_+/g,"_").replace(/_$/,"")},E=function(){let w=document.querySelectorAll("#action-fields-builder .vs-field-row"),$=[],y=new Set;return w.forEach(N=>{var z,Z,se,re;let O=((Z=(z=N.querySelector(".field-label"))==null?void 0:z.value)==null?void 0:Z.trim())||"",k=((se=N.querySelector(".field-type"))==null?void 0:se.value)||"text",I=((re=N.querySelector(".field-required"))==null?void 0:re.checked)||!1,R=N.dataset.fieldName||"";if(!R&&O&&(R=L(O)),y.has(R)){let D=2;for(;y.has(R+"_"+D);)D++;R=R+"_"+D}if(y.add(R),R&&O){let D={name:R,type:k,label:O,required:I},ne=N.dataset.placeholder;ne&&(D.placeholder=ne);let oe=N.dataset.default;oe&&(D.default_value=oe);let de=N.dataset.description;de&&(D.description=de);let me=N.dataset.min;me!==""&&me!==void 0&&(D.min=Number(me));let ue=N.dataset.max;ue!==""&&ue!==void 0&&(D.max=Number(ue));let le=N.dataset.maxlength;le&&(D.max_length=Number(le));let xe=N.dataset.minlength;xe&&(D.min_length=Number(xe));let Le=N.dataset.options;if(Le)try{D.options=JSON.parse(Le)}catch{D.options=Le.split(",").map(ee=>ee.trim()).filter(Boolean)}$.push(D)}}),$},B=function(w){var $,y;($=w.querySelector(".field-move-up"))==null||$.addEventListener("click",()=>{let N=w.previousElementSibling;N&&(w.parentNode.insertBefore(w,N),w.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>w.style.boxShadow="",300))}),(y=w.querySelector(".field-move-down"))==null||y.addEventListener("click",()=>{let N=w.nextElementSibling;N&&(w.parentNode.insertBefore(N,w),w.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>w.style.boxShadow="",300))})},q=function(w){w.addEventListener("click",async()=>{let $=w.closest(".vs-field-row");await be({title:"Remove Field",description:"Remove this field from this action? Click Save Fields to apply the change.",confirmLabel:"Remove",danger:!0})&&($.style.opacity="0",$.style.transform="translateX(20px)",$.style.transition="opacity 0.2s, transform 0.2s",setTimeout(()=>$.remove(),200))})},H=function(w){w&&w.addEventListener("click",()=>{var O,k,I;let $=w.closest(".vs-field-row");if(!$)return;let y=((O=$.querySelector(".field-type"))==null?void 0:O.value)||"text",N=((k=$.querySelector(".field-label"))==null?void 0:k.value)||((I=$.querySelector(".field-name"))==null?void 0:I.value)||"Field";U($,y,N)})},U=function(w,$,y){var G,ee,ye,S,P;(G=document.getElementById("vs-field-settings-modal"))==null||G.remove();let N=w.dataset.placeholder||"",O=w.dataset.default||"",k=w.dataset.min||"",I=w.dataset.max||"",R=w.dataset.maxlength||"",z=w.dataset.options||"[]",Z=w.dataset.description||"",se=["text","email","tel","url","textarea"].includes($),re=$==="number",D=["text","email","tel","url","textarea"].includes($),ne=["select","radio","multiselect"].includes($),oe=$==="multiselect",de="display: block; font-size: 12px; font-weight: 500; color: var(--vs-text-secondary); margin-bottom: 6px;",me="margin-bottom: 16px;",ue="";if(se&&(ue+=`<div style="${me}">
          <label style="${de}">Placeholder</label>
          <input type="text" id="fs-placeholder" class="vs-input" value="${Ce(N)}" placeholder="e.g. Enter your email\u2026" />
        </div>`),ue+=`<div style="${me}">
        <label style="${de}">Default Value</label>
        <input type="${re?"number":"text"}" id="fs-default" class="vs-input" value="${Ce(O)}" placeholder="Pre-filled value" />
      </div>`,re&&(ue+=`<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; ${me}">
          <div>
            <label style="${de}">Minimum</label>
            <input type="number" id="fs-min" class="vs-input" value="${Ce(k)}" placeholder="No limit" />
          </div>
          <div>
            <label style="${de}">Maximum</label>
            <input type="number" id="fs-max" class="vs-input" value="${Ce(I)}" placeholder="No limit" />
          </div>
        </div>`),D&&(ue+=`<div style="${me}">
          <label style="${de}">Max Length</label>
          <input type="number" id="fs-maxlength" class="vs-input" value="${Ce(R)}" placeholder="No limit" min="1" />
        </div>`),ne){let _;try{_=JSON.parse(z)}catch{_=z.split(",").map(K=>K.trim()).filter(Boolean)}let j;if(oe){let V=(w.dataset.default||"").split(",").map(K=>K.trim()).filter(Boolean);j=_.map(K=>V.includes(K)?"[x] "+K:K).join(`
`)}else j=_.join(`
`);ue+=`<div style="${me}">
          <label style="${de}">Options <span style="color: var(--vs-text-ghost); font-weight: 400;">${oe?"(one per line, prefix [x] for default)":"(one per line)"}</span></label>
          <textarea id="fs-options" class="vs-input" rows="5" placeholder="${oe?`Option 1
[x] Option 2
[x] Option 3
Option 4`:`Option 1
Option 2
Option 3`}" style="height: auto; resize: vertical; min-height: 64px;">${x(j)}</textarea>
        </div>`}ue+=`<div style="${me}">
        <label style="${de}">Help Text <span style="color: var(--vs-text-ghost); font-weight: 400;">(shown below field)</span></label>
        <input type="text" id="fs-description" class="vs-input" value="${Ce(Z)}" placeholder="Optional description or instructions" />
      </div>`;let le=document.createElement("div");le.id="vs-field-settings-modal",le.style.cssText="position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center;",le.innerHTML=`
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
                ${x(y)} Settings
              </h3>
              <span style="font-size: 12px; color: var(--vs-text-ghost); margin-top: 2px; display: block;">
                Type: ${$}
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
            ${ue}
          </div>
          <div style="
            padding: 16px 24px; border-top: 1px solid var(--vs-border-subtle);
            display: flex; justify-content: flex-end; gap: 8px;
          ">
            <button id="fs-cancel" class="vs-btn vs-btn-secondary vs-btn-sm">Cancel</button>
            <button id="fs-save" class="vs-btn vs-btn-primary vs-btn-sm">Apply</button>
          </div>
        </div>
      `,document.body.appendChild(le),setTimeout(()=>{var _;return(_=le.querySelector("input, textarea"))==null?void 0:_.focus()},100);let xe=()=>le.remove();(ee=le.querySelector("#fs-backdrop"))==null||ee.addEventListener("click",xe),(ye=le.querySelector("#fs-close"))==null||ye.addEventListener("click",xe),(S=le.querySelector("#fs-cancel"))==null||S.addEventListener("click",xe);let Le=_=>{_.key==="Escape"&&(xe(),document.removeEventListener("keydown",Le))};document.addEventListener("keydown",Le),(P=le.querySelector("#fs-save"))==null||P.addEventListener("click",()=>{var _,j,V,K,Y,W,X;if(se&&(w.dataset.placeholder=((_=le.querySelector("#fs-placeholder"))==null?void 0:_.value)||""),w.dataset.default=((j=le.querySelector("#fs-default"))==null?void 0:j.value)||"",re&&(w.dataset.min=((V=le.querySelector("#fs-min"))==null?void 0:V.value)||"",w.dataset.max=((K=le.querySelector("#fs-max"))==null?void 0:K.value)||""),D&&(w.dataset.maxlength=((Y=le.querySelector("#fs-maxlength"))==null?void 0:Y.value)||""),ne){let J=(((W=le.querySelector("#fs-options"))==null?void 0:W.value)||"").split(/[\n]/).map(ae=>ae.trim()).filter(Boolean);if(oe){let ae=[],Ae=[];J.forEach(Se=>{let Be=Se.match(/^\[x\]\s*(.+)$/i);Be?(ae.push(Be[1].trim()),Ae.push(Be[1].trim())):ae.push(Se)}),w.dataset.options=JSON.stringify(ae),w.dataset.default=Ae.join(",")}else w.dataset.options=JSON.stringify(J)}w.dataset.description=((X=le.querySelector("#fs-description"))==null?void 0:X.value)||"",w.style.boxShadow="0 0 0 2px var(--vs-accent-dim)",setTimeout(()=>w.style.boxShadow="",400),xe(),A("Field settings updated","success")})};s.innerHTML=`
      <div class="vs-settings-card" style="margin-top: 16px;">
        <h2 class="vs-settings-card-title">Identity &amp; Config</h2>
        <div class="flex flex-col gap-4">
          <div>
            <label for="action-name" class="block text-sm font-medium text-vs-text-secondary mb-1">Name</label>
            <input type="text" id="action-name" class="vs-input" value="${x(a.name||"")}" />
          </div>
          <div>
            <label for="action-button-label" class="block text-sm font-medium text-vs-text-secondary mb-1">Bar Button Label <span style="font-weight: 400; color: var(--vs-text-ghost);">(short name for the actions bar)</span></label>
            <input type="text" id="action-button-label" class="vs-input" value="${x(a.bar_button_label||"")}" placeholder="${Ce(a.name||"e.g. Register")}" />
          </div>
          <div>
            <label for="action-description" class="block text-sm font-medium text-vs-text-secondary mb-1">Description</label>
            <input type="text" id="action-description" class="vs-input" value="${x(a.description||"")}" placeholder="What does this action do?" />
          </div>

          <div>
            <label class="block text-sm font-medium text-vs-text-secondary mb-1">Bar Icon</label>
            <p class="text-xs text-vs-text-ghost" style="margin-bottom: 8px;">Choose the icon shown in the Actions Bar on your website.</p>
            <div id="icon-picker-grid" style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${[["calendar","Calendar"],["clock","Clock"],["utensils","Utensils"],["file-text","Document"],["list","List"],["shopping-bag","Shop"],["ticket","Ticket"],["message-square","Message"],["users","People"],["mail","Mail"],["star","Star"],["circle","Default"]].map(([w,$])=>`
                <button type="button" class="vs-icon-pick" data-icon="${w}" title="${$}" style="
                  display: flex; align-items: center; justify-content: center;
                  width: 42px; height: 42px; border-radius: var(--radius-md);
                  border: 1.5px solid ${(a.icon||"circle")===w?"var(--vs-accent)":"var(--vs-border)"};
                  background: ${(a.icon||"circle")===w?"var(--vs-accent-dim, rgba(var(--vs-accent-rgb, 200,80,40), 0.08))":"var(--vs-bg-floating)"};
                  color: ${(a.icon||"circle")===w?"var(--vs-accent)":"var(--vs-text-ghost)"};
                  cursor: pointer; transition: all 0.15s ease;
                "><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${{calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',utensils:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',"file-text":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',"shopping-bag":'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',ticket:'<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',"message-square":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',circle:'<circle cx="12" cy="12" r="10"/>'}[w]}</svg></button>
              `).join("")}
            </div>
            <input type="hidden" id="action-icon" value="${x(a.icon||"circle")}" />
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
          ${(a.fields||[]).map((w,$)=>`
            <div class="vs-field-row" data-field-idx="${$}"
              data-field-name="${Ce(w.name||"")}"
              data-placeholder="${Ce(w.placeholder||"")}"
              data-default="${Ce(w.default_value||w.default||"")}"
              data-min="${w.min!==void 0?w.min:""}"
              data-max="${w.max!==void 0?w.max:""}"
              data-maxlength="${w.max_length||""}"
              data-minlength="${w.min_length||""}"
              data-options="${Ce(JSON.stringify(w.options||[]))}"
              data-description="${Ce(w.description||"")}"
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
                " ${$===0?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" class="field-move-down" title="Move down" style="
                  border: none; background: none; cursor: pointer; padding: 1px; color: var(--vs-text-ghost);
                  display: flex; align-items: center; justify-content: center; border-radius: 3px;
                  transition: color 0.12s, background 0.12s;
                " ${$===(a.fields||[]).length-1?'disabled style="opacity:0.25;cursor:default;"':""}
                  onmouseenter="if(!this.disabled){this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';}"
                  onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
              <input type="text" class="vs-input field-label" value="${x(w.label||"")}" placeholder="Label (e.g. Guest Name)" style="font-size: 13px; height: 32px; padding: 4px 10px;" />
              <select class="vs-input field-type" style="font-size: 12px; height: 32px; padding: 4px 6px;">
                ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","hidden"].map(y=>`<option value="${y}" ${w.type===y?"selected":""}>${y==="multiselect"?"multi-select":y}</option>`).join("")}
              </select>
              <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
                <input type="checkbox" class="field-required" ${w.required?"checked":""} style="position: absolute; opacity: 0; width: 0; height: 0;" />
                <span style="
                  position: absolute; inset: 0; border-radius: 10px;
                  background: ${w.required?"var(--vs-accent)":"var(--vs-border-medium, #ccc)"};
                  transition: background 0.2s ease;
                "></span>
                <span style="
                  position: absolute; left: ${w.required?"18px":"2px"}; top: 2px;
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
    `,document.querySelectorAll(".field-required").forEach(w=>{m(w.closest("label"))}),document.querySelectorAll(".vs-icon-pick").forEach(w=>{w.addEventListener("mouseenter",()=>{var $;w.dataset.icon!==(($=document.getElementById("action-icon"))==null?void 0:$.value)&&(w.style.borderColor="var(--vs-accent)",w.style.color="var(--vs-text-secondary)")}),w.addEventListener("mouseleave",()=>{var $;w.dataset.icon!==(($=document.getElementById("action-icon"))==null?void 0:$.value)&&(w.style.borderColor="var(--vs-border)",w.style.color="var(--vs-text-ghost)")}),w.addEventListener("click",()=>{document.querySelectorAll(".vs-icon-pick").forEach($=>{$.style.borderColor="var(--vs-border)",$.style.background="var(--vs-bg-floating)",$.style.color="var(--vs-text-ghost)"}),w.style.borderColor="var(--vs-accent)",w.style.background="var(--vs-accent-dim, rgba(200,80,40,0.08))",w.style.color="var(--vs-accent)",document.getElementById("action-icon").value=w.dataset.icon})}),(r=document.getElementById("btn-save-action"))==null||r.addEventListener("click",async()=>{var N,O,k,I,R;let w={...a};w.name=((N=document.getElementById("action-name"))==null?void 0:N.value)||a.name,w.bar_button_label=((O=document.getElementById("action-button-label"))==null?void 0:O.value)||"",w.description=((k=document.getElementById("action-description"))==null?void 0:k.value)||"",w.icon=((I=document.getElementById("action-icon"))==null?void 0:I.value)||"circle";let{ok:$,data:y}=await M.put(`/agentic/actions/${encodeURIComponent(e)}`,w);A($?"Action saved":((R=y==null?void 0:y.error)==null?void 0:R.message)||"Failed to save",$?"success":"error"),$&&Yt(e)});async function T(){var I;let w=document.querySelectorAll("#action-fields-builder .vs-field-row"),$=!1;if(w.forEach(R=>{var Z,se;(se=(Z=R.querySelector(".field-label"))==null?void 0:Z.value)!=null&&se.trim()||($=!0,R.style.borderColor="var(--vs-error, #ef4444)",R.style.boxShadow="0 0 0 2px rgba(239,68,68,0.15)",setTimeout(()=>{R.style.borderColor="var(--vs-border-subtle)",R.style.boxShadow=""},2e3))}),$){A("Every field needs a label","warning");return}let y=E();if(y.length===0){A("At least one field is required","warning");return}let N={...a,fields:y},{ok:O,data:k}=await M.put(`/agentic/actions/${encodeURIComponent(e)}`,N);A(O?"Fields saved":((I=k==null?void 0:k.error)==null?void 0:I.message)||"Failed to save",O?"success":"error"),O&&Yt(e)}(u=document.getElementById("btn-save-fields"))==null||u.addEventListener("click",T),(v=document.getElementById("btn-add-field"))==null||v.addEventListener("click",()=>{var N,O;let w=document.getElementById("action-fields-builder");if(!w)return;let $=document.createElement("div");$.className="vs-field-row",$.dataset.fieldName="",$.dataset.placeholder="",$.dataset.default="",$.dataset.min="",$.dataset.max="",$.dataset.maxlength="",$.dataset.options="",$.dataset.description="",$.style.cssText=`
        display: grid; grid-template-columns: 44px 1.5fr 100px 44px 32px 32px; gap: 6px; align-items: center;
        padding: 8px 10px; border-radius: var(--radius-md);
        border: 1px solid var(--vs-border-subtle); background: var(--vs-bg-surface);
        transition: box-shadow 0.15s ease;
      `;let y='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';$.innerHTML=`
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
          ${["text","email","tel","number","date","time","select","multiselect","textarea","url","checkbox","radio","hidden"].map(k=>`<option value="${k}">${k==="multiselect"?"multi-select":k}</option>`).join("")}
        </select>
        <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer; width: 36px; height: 20px; flex-shrink: 0;" title="Required">
          <input type="checkbox" class="field-required" style="position: absolute; opacity: 0; width: 0; height: 0;" />
          <span style="position: absolute; inset: 0; border-radius: 10px; background: var(--vs-border-medium, #ccc); transition: background 0.2s ease;"></span>
          <span style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: left 0.2s ease;"></span>
        </label>
        <button type="button" class="field-settings" title="Field settings" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='var(--vs-bg-raised)';this.style.color='var(--vs-text-primary)';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${y}
        </button>
        <button type="button" class="field-delete" title="Remove field" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--vs-text-ghost);display:flex;align-items:center;justify-content:center;border-radius:var(--radius-md);"
          onmouseenter="this.style.background='rgba(239,68,68,0.08)';this.style.color='#ef4444';"
          onmouseleave="this.style.background='none';this.style.color='var(--vs-text-ghost)';">
          ${C.trash}
        </button>
      `,w.appendChild($),(N=$.querySelector(".field-label"))==null||N.focus(),m((O=$.querySelector(".field-required"))==null?void 0:O.closest("label")),B($),q($.querySelector(".field-delete")),H($.querySelector(".field-settings"))}),document.querySelectorAll(".vs-field-row").forEach(B),document.querySelectorAll(".field-delete").forEach(q),document.querySelectorAll(".field-settings").forEach(H),(h=document.getElementById("btn-toggle-active"))==null||h.addEventListener("click",async()=>{let w={...a,active:!d},{ok:$}=await M.put(`/agentic/actions/${encodeURIComponent(e)}`,w);$?(A(w.active?"Action activated":"Action deactivated","success"),Yt(e)):A("Failed to update status","error")}),(f=document.getElementById("btn-duplicate-action"))==null||f.addEventListener("click",async()=>{var N;if(!await be({title:"Duplicate Action",description:`Create a copy of "${a.name}"? The copy will start as a draft.`,confirmLabel:"Duplicate"}))return;let{ok:$,data:y}=await M.post(`/agentic/actions/${encodeURIComponent(e)}/duplicate`,{});$&&(y!=null&&y.action)?(A(`"${y.action.name}" created`,"success"),window.location.hash=`#/actions/${y.action.id}`):A(((N=y==null?void 0:y.error)==null?void 0:N.message)||"Failed to duplicate","error")}),(b=document.getElementById("btn-delete-action"))==null||b.addEventListener("click",async()=>{if(await be({title:"Delete Action",description:`Delete "${a.name}"? This will permanently remove the action definition. Existing records will remain in the database but will no longer be accessible.`,confirmLabel:"Delete",danger:!0})){let{ok:$}=await M.delete(`/agentic/actions/${encodeURIComponent(e)}`);$?(A("Action deleted","success"),window.location.hash="#/actions"):A("Failed to delete action","error")}})}await yt(e,1)}async function yt(e,t=1){var v,h,f,b,m,L,E,T;let s=document.getElementById("action-records");if(!s)return;let n=((v=document.getElementById("action-filter-status"))==null?void 0:v.value)||"all",o=((h=document.getElementById("action-filter-search"))==null?void 0:h.value)||"",i=`/agentic/actions/${encodeURIComponent(e)}/records?page=${t}&per_page=20`;n!=="all"&&(i+=`&status=${encodeURIComponent(n)}`),o&&(i+=`&search=${encodeURIComponent(o)}`);let{ok:a,data:l}=await M.get(i);if(!a||!l){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load records.</div>';return}let d=l.records||[],p=l.total||0,c=l.per_page||20,g=Math.ceil(p/c);s.innerHTML=`
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
            ${C.trash} Purge Old
          </button>
          <button id="btn-export-action-csv" class="vs-btn vs-btn-secondary vs-btn-sm" ${p===0?'disabled style="opacity:0.4;pointer-events:none;"':""} title="${p===0?"No records to export":"Download records as CSV"}">
            ${C.download} Export CSV
          </button>
        </div>
      </div>

      ${d.length===0?`
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
              ${d.map(B=>{let q=typeof B.data=="string"?JSON.parse(B.data):B.data,H=Object.fromEntries(Object.entries(q||{}).filter(([y])=>!y.startsWith("_"))),U=Object.values(H).filter(y=>typeof y=="string"&&y.length>0).slice(0,2).join(" \xB7 "),w=As[B.status]||As.pending,$=B.source==="web"?"Website":B.source==="mcp"?"MCP":B.source==="api"?"API":B.source||"Website";return`
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
                    <td style="padding: 8px 12px; color: var(--vs-text-secondary); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${x(U||"\u2014")}</td>
                    <td style="padding: 8px 12px;">
                      <select class="vs-input vs-input-compact vs-action-status-select" data-record-id="${B.id}" style="font-size: 12px; padding: 2px 8px; min-width: auto;">
                        ${Object.entries(As).map(([y,N])=>`<option value="${y}" ${B.status===y?"selected":""}>${N.label}</option>`).join("")}
                      </select>
                    </td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${$}</td>
                    <td style="padding: 8px 12px; font-size: 12px; color: var(--vs-text-ghost);">${Fs(B.created_at)}</td>
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
                        ${Object.entries(H).map(([y,N])=>`
                          <div style="color: var(--vs-text-ghost); font-weight: 500; text-transform: capitalize;">${x(y.replace(/_/g," "))}</div>
                          <div style="color: var(--vs-text-primary); word-break: break-word; white-space: pre-wrap;">${x(String(N||"\u2014"))}</div>
                        `).join("")}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>

        ${g>1?`
          <div class="flex items-center justify-between" style="padding: 12px 0; font-size: 13px;">
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-prev" ${t<=1?"disabled":""} data-page="${t-1}">\u2190 Previous</button>
            <span class="text-vs-text-tertiary">Page ${t} of ${g} \xB7 ${p} record${p!==1?"s":""}</span>
            <button class="vs-btn vs-btn-ghost vs-btn-sm" id="action-records-next" ${t>=g?"disabled":""} data-page="${t+1}">Next \u2192</button>
          </div>
        `:`
          <div class="text-sm text-vs-text-ghost text-center" style="padding: 8px 0;">${p} record${p!==1?"s":""}</div>
        `}
      `}
    </div>
  `;let r=null,u=()=>yt(e,1);(f=document.getElementById("action-filter-status"))==null||f.addEventListener("change",u),(b=document.getElementById("action-filter-search"))==null||b.addEventListener("input",()=>{clearTimeout(r),r=setTimeout(u,300)}),(m=document.getElementById("action-records-prev"))==null||m.addEventListener("click",B=>{let q=parseInt(B.currentTarget.dataset.page);q>=1&&yt(e,q)}),(L=document.getElementById("action-records-next"))==null||L.addEventListener("click",B=>{let q=parseInt(B.currentTarget.dataset.page);q<=g&&yt(e,q)}),s.querySelectorAll(".vs-record-toggle").forEach(B=>{B.addEventListener("click",()=>{let q=B.dataset.rid,H=s.querySelector(`.vs-record-detail[data-detail-for="${q}"]`);if(!H)return;let U=H.style.display!=="none";H.style.display=U?"none":"table-row",B.style.transform=U?"":"rotate(90deg)"})}),s.querySelectorAll(".vs-action-status-select").forEach(B=>{B.addEventListener("change",async q=>{let H=q.target.dataset.recordId,U=q.target.value,{ok:w}=await M.put(`/agentic/actions/${encodeURIComponent(e)}/records/${H}`,{status:U});A(w?"Status updated":"Failed to update",w?"success":"error")})}),(E=document.getElementById("btn-purge-records"))==null||E.addEventListener("click",async()=>{var w,$;let B=[{label:"Older than 3 days",days:3},{label:"Older than 1 week",days:7},{label:"Older than 2 weeks",days:14},{label:"Older than 1 month",days:30},{label:"Older than 3 months",days:90},{label:"Older than 6 months",days:180},{label:"Older than 1 year",days:365}],q=document.getElementById("vs-purge-overlay");q&&q.remove();let H=document.createElement("div");H.id="vs-purge-overlay",H.className="vs-modal-overlay",H.innerHTML=`
      <div class="vs-modal" style="max-width: 400px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Purge Old Records</h2>
          <p class="vs-modal-desc">Remove records older than a chosen period. This cannot be undone.</p>
        </div>
        <div class="vs-modal-body">
          <select id="vs-purge-select" class="vs-input" style="width: 100%; font-size: 13px;">
            ${B.map(y=>`<option value="${y.days}">${y.label}</option>`).join("")}
          </select>
        </div>
        <div class="vs-modal-footer">
          <button id="vs-purge-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-purge-ok" class="vs-btn vs-btn-danger vs-btn-sm" type="button">Purge</button>
        </div>
      </div>
    `,document.body.appendChild(H),requestAnimationFrame(()=>H.classList.add("is-visible"));let U=()=>fe(H);H.addEventListener("click",y=>{y.target===H&&U()}),(w=document.getElementById("vs-purge-cancel"))==null||w.addEventListener("click",U),($=document.getElementById("vs-purge-ok"))==null||$.addEventListener("click",async()=>{var z;let y=document.getElementById("vs-purge-select"),N=parseInt(y==null?void 0:y.value),O=((z=y==null?void 0:y.selectedOptions[0])==null?void 0:z.textContent)||"";if(U(),await new Promise(Z=>setTimeout(Z,200)),!await be({title:"Confirm Purge",description:`This will permanently delete all records "${O.toLowerCase()}" for this action. This cannot be undone.`,confirmLabel:"Purge",danger:!0}))return;let{ok:I,data:R}=await M.post(`/agentic/actions/${encodeURIComponent(e)}/records/purge`,{older_than_days:N});I?(A(`${(R==null?void 0:R.purged)||0} record(s) purged`,"success"),yt(e,1)):A("Failed to purge records","error")})}),s.querySelectorAll(".vs-record-delete").forEach(B=>{B.addEventListener("click",async()=>{let q=B.dataset.rid;if(!await be({title:"Delete Record",description:"Permanently delete this record? This cannot be undone.",confirmLabel:"Delete",danger:!0}))return;let{ok:U}=await M.delete(`/agentic/actions/${encodeURIComponent(e)}/records/${q}`);U?(A("Record deleted","success"),yt(e,t)):A("Failed to delete record","error")})}),(T=document.getElementById("btn-export-action-csv"))==null||T.addEventListener("click",async()=>{let B=document.getElementById("btn-export-action-csv"),q=B.innerHTML;B.innerHTML=`${C.loader} Exporting...`,B.disabled=!0;try{let H=await fetch(`/_studio/api/router.php?_path=${encodeURIComponent("/agentic/actions/"+e+"/records/export")}`,{credentials:"same-origin"});if(!H.ok)throw new Error("Export failed");let U=await H.blob(),w=URL.createObjectURL(U),$=document.createElement("a");$.href=w,$.download=`${e}_records_${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild($),$.click(),$.remove(),URL.revokeObjectURL(w),A("CSV downloaded","success")}catch{A("Failed to export CSV","error")}B.innerHTML=q,B.disabled=!1})}function Pi(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),ji()):e.classList.add("hidden")}async function ji(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await M.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${x((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=F.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let l=a.id===i,d=a.title||"Untitled conversation",p=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${l?"vs-conv-item-active":""}"
              data-conversation-id="${x(a.id)}">
        <span class="mt-0.5 shrink-0 ${l?"text-vs-accent":"text-vs-text-ghost"}">${C.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${l?"font-medium":""}" style="font-size: var(--text-sm);">${x(d)}</div>
          <div class="vs-conv-time mt-0.5">${p}</div>
        </div>
        ${l?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let l=a.dataset.conversationId;ns(l);let d=document.getElementById("conversation-history-panel");d&&d.classList.add("hidden")})})}async function ns(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await M.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){F.set("activeConversationId",null),is(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=kt(),wt();return}let i=n.conversation,a=i.prompts||[];F.set("activeConversationId",e),is(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=kt(),wt();return}let l="",d=!1;for(let p of a){let{text:c,images:g}=ea(p.user_prompt),r=g.length>0?`<div class="vs-msg-user-images">${g.map(u=>`<img src="${u}" class="vs-msg-user-image" />`).join("")}</div>`:"";if(l+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${r}
        <div class="text-sm text-vs-text-primary leading-relaxed">${x(c)}</div>
      </div>
    `,p.ai_response||p.files_modified){let u="",v=typeof p.ai_message=="string"&&p.ai_message.trim()!==""?p.ai_message:p.ai_response;v&&(u=Xt(v));let h="";if(p.files_modified)try{let b=JSON.parse(p.files_modified);if(Array.isArray(b)&&b.length>0){let m=b.map(E=>{let T=typeof E=="string"?E:E.path||E,B=typeof E=="object"&&E.action==="delete";return`<div class="vs-file-badge ${B?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${B?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${x(String(T))}</span>
              </div>`}).join(""),L=b.length;h=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${L} file${L!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${m}</div>
              </div>`}}catch{}let f=p.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";l+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${u}</div>
          ${h}
          ${f}
        </div>
      `}else if(p.status==="streaming"){d=!0;let u=p.id;l+=`
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
      `)}t.innerHTML=l,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),d&&!window.__vsResumedToastByConversation[e]&&(A("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),d||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(p){try{await M.post("/ai/cancel-generation",{prompt_id:p})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",ns(e)},d&&F.get("activeConversationId")===e&&!F.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{F.get("activeConversationId")===e&&!F.get("aiStreaming")&&ns(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function Hi(){F.set("activeConversationId",null),is(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=kt(),wt());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function zn(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function os(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=zn(t)}function is(e){F.set("activePageScope",e||null),os(),Bt()&&Tt()}async function Ri(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>fe(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),t.addEventListener("click",c=>{c.target===t&&s()}),t.addEventListener("keydown",c=>{c.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await M.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${x((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let l=i.pages;if(!l.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${C.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let d='<div style="display: flex; flex-direction: column; gap: 2px;">';l.forEach(c=>{let g=!!Number(c.is_homepage),r=c.title||c.slug||c.path,u=c.path||c.slug+".php",v="/"+u.replace(/\.php$/,"").replace(/^index$/,""),h=v==="/"?"/":v,f=di(c.slug),m=(window.__vsCurrentPreviewPath||"index.php")===u,L=c.size?(c.size/1024).toFixed(1)+" KB":"";d+=`
      <div class="vs-pages-modal-item ${m?"is-active":""}" data-slug="${x(c.slug)}" data-path="${x(u)}" data-title="${x(r)}" data-url="${x(h)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${f}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${x(r)}${g?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${x(u)}${L?" \xB7 "+L:""}
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
          ${g?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${C.trash2}
          </button>
          `}
        </div>
      </div>
    `}),d+="</div>",n.innerHTML=d;let p=t.querySelector(".vs-modal-desc");p&&(p.textContent=`${l.length} page${l.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(c=>{c.addEventListener("click",g=>{g.stopPropagation();let r=c.closest(".vs-pages-modal-item"),u=r.dataset.slug,v=r.dataset.path,h=r.dataset.title,f=r.dataset.url,b=c.dataset.action;if(b==="edit")is(u),s(),kn(`Edit the "${h}" page (${f}): `);else if(b==="preview"){let m=document.getElementById("preview-iframe");m?(Bt()&&Tt(),m.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(v)+"&t="+Date.now(),window.__vsCurrentPreviewPath=v,os(),s(),A(`Preview: ${h}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(v),"_blank")}else if(b==="delete"){s();let m=`Delete the "${h}" page (${f}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;kn(m)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(c=>{c.addEventListener("click",g=>{if(g.target.closest(".vs-pages-action"))return;let r=c.dataset.path,u=c.dataset.title,v=document.getElementById("preview-iframe");v?(v.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(r)+"&t="+Date.now(),window.__vsCurrentPreviewPath=r,os(),s(),A(`Preview: ${u}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(r),"_blank")})})}function wt(){document.querySelectorAll("[data-quick-prompt]").forEach(e=>{e.addEventListener("click",()=>{let t=document.getElementById("prompt-input");t&&(t.value=e.dataset.quickPrompt,t.dataset.actionType=e.dataset.actionType||"free_prompt",t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))})})}function kt(){let e=F.get("pages")||[],t=e.length>0,s=new Set(e.map(h=>h.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(h=>{let f=h.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(f)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],l=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],d=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],p=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],c=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],g,r,u;if(!t)r="What are we building?",u="Describe your website and watch it appear in the preview. Every detail is a conversation away.",g=_s(n).slice(0,6);else{r="What\u2019s next?",u="Your site is live in preview. Pick a suggestion or describe any change you want.";let h=[...o,...o,...i,...a,...l,...d,...p,...c];g=_s(h).slice(0,6);let f=new Set;if(g=g.filter(b=>f.has(b.label)?!1:(f.add(b.label),!0)),g.length<6){let b=_s(h).filter(m=>!f.has(m.label));for(let m of b){if(g.length>=6)break;g.push(m),f.add(m.label)}}}let v=g.map(h=>`<button data-quick-prompt="${x(h.prompt).replace(/"/g,"&quot;")}" data-action-type="${h.type}"
      class="vs-style-card">${x(h.label)}</button>`).join(`
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
        ${u}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${v}
      </div>
    </div>
  `}function _s(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function Di(){return`
    <footer class="vs-statusbar">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-vs-success" title="Connected"></span>
          <span id="status-text" class="text-xs text-vs-text-ghost">Ready</span>
        </div>
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
  `}function qi(){return`
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
  `}function Un(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>Kn(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function Vn(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function Wn(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function rs(){return Vn(Dn)}function Os(){return Vn(Rn)}function Gn(e){let t=rs(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];Wn(Dn,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};Rt(n.query||"",n.activeIndex||0)}function Ni(e){let t=Os().filter(n=>n!==e),s=[e,...t].slice(0,8);Wn(Rn,s)}function Kn(e){if(F.get("route")!=="chat"){tt.navigate("chat"),setTimeout(()=>Kn(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function Yn(e,t="free_prompt",s=!1){if(F.get("route")!=="chat"){tt.navigate("chat"),setTimeout(()=>Yn(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?as():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function Pt(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function Mn(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),Rt(e,0))}function Ht(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function Fi(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function Oi(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=Fi(s,n);return i===null?null:70+i}function zi(e){let t=(e||"").trim().toLowerCase(),s=Un(),n=rs(),o=Os();return s.map(i=>{let a=Oi(t,i);if(a===null)return null;let l=n.includes(i.id)?-12:0,d=o.includes(i.id)?-8:0;return{...i,__score:a+l+d}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function Ui(e){let t=Un(),s=Object.fromEntries(t.map(g=>[g.id,g])),n=(e||"").trim(),o=[];if(n!==""){let g=zi(e).slice(0,18);return g.length>0&&o.push({title:"Results",commands:g}),o}let i=Os(),a=rs(),l=new Set,d=i.map(g=>s[g]).filter(Boolean);d.length>0&&(o.push({title:"Recent",commands:d}),d.forEach(g=>l.add(g.id)));let p=a.map(g=>s[g]).filter(g=>g&&!l.has(g.id));return p.length>0&&(o.push({title:"Pinned",commands:p}),p.forEach(g=>l.add(g.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(g=>{let r=t.filter(u=>u.group===g&&!l.has(u.id));r.length>0&&(o.push({title:g,commands:r}),r.forEach(u=>l.add(u.id)))}),o}function Rt(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=Ui(e),o=n.flatMap(p=>p.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=rs();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let l="",d=0;n.forEach(p=>{l+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${x(p.title)}</div>`,p.commands.forEach(c=>{let g=d===i,r=a.includes(c.id);l+=`
        <div class="flex items-center gap-1 px-1 py-0.5">
          <button type="button"
            data-command-index="${d}"
            class="vs-cmd-item ${g?"vs-cmd-item-active":""}">
            <div class="min-w-0">
              <div class="vs-cmd-item-title">${x(c.title)}</div>
              <div class="vs-cmd-item-desc">${x(c.prompt?c.prompt.substring(0,80)+(c.prompt.length>80?"\u2026":""):c.meta)}</div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${x(c.id)}"
            class="vs-cmd-pin ${r?"vs-cmd-pin-active":""}"
            title="${r?"Unpin":"Pin"}">
            ${r?"\u2605":"\u2606"}
          </button>
        </div>
      `,d+=1})}),s.innerHTML=l,s.querySelectorAll("[data-command-index]").forEach(p=>{p.addEventListener("click",()=>{let c=parseInt(p.dataset.commandIndex||"0",10);Zn(c)})}),s.querySelectorAll("[data-command-pin]").forEach(p=>{p.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let g=p.dataset.commandPin;g&&Gn(g)})})}function Zn(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(Ni(n.id),Ht(),Promise.resolve(n.run()).catch(()=>{}))}function Vi(){return`
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
  `}function Gt(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function ct(){try{let e=localStorage.getItem(Hn);if(!e)return Gt();let t=JSON.parse(e);return{...Gt(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Gt().pages}}catch{return Gt()}}function Xn(e){try{localStorage.setItem(Hn,JSON.stringify(e))}catch{}}function Zt(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function In(){let e=window.__vsOnboarding||{step:1,draft:ct()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||ct(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),l=document.getElementById("btn-onboarding-next"),d=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!l||!d)return;let p=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${p[t-1]}`,n.innerHTML=p.map((c,g)=>{let r=g+1===t,u=g+1<t;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${r?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":u?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${g+1}. ${x(c)}</div>
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
            ${c.map(g=>`
              <label class="flex items-center gap-2 text-xs text-vs-text-secondary rounded-lg border border-vs-border-subtle px-2.5 py-2">
                <input type="checkbox" class="accent-[var(--vs-accent)]" data-onboard-page="${g.key}" ${s.pages.includes(g.key)?"checked":""}>
                <span>${g.label}</span>
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
    `}a.disabled=t===1,l.classList.toggle("hidden",t===3),d.classList.toggle("hidden",t!==3),Wi()}function Wi(){let e=window.__vsOnboarding||{draft:ct()},t=()=>{var n,o,i,a,l,d,p,c,g,r,u;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((d=(l=document.getElementById("onboard-offer"))==null?void 0:l.value)==null?void 0:d.trim())||e.draft.offer||"",audience:((c=(p=document.getElementById("onboard-audience"))==null?void 0:p.value)==null?void 0:c.trim())||e.draft.audience||"",style:((g=document.getElementById("onboard-style"))==null?void 0:g.value)||e.draft.style||"modern-minimal",tone:((r=document.getElementById("onboard-tone"))==null?void 0:r.value)||e.draft.tone||"confident",content_mode:((u=document.getElementById("onboard-content-mode"))==null?void 0:u.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(v=>v.checked).map(v=>v.dataset.onboardPage).filter(Boolean)),Xn(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function Gi(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function Ki(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>Zt());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>Zt());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:ct()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,In()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:ct()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,In()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:ct()}).draft||ct(),l=Gi(a);try{localStorage.setItem(Qo,"1")}catch{}Xn(a),Zt(),Yn(l,"create_site",!0)})}function Yi(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var z,Z;let I=gs()==="light";e.innerHTML=I?C.sun:C.moon,e.title=I?"Switch to dark":"Switch to light",window.__vsEditorPage&&((z=window.monaco)!=null&&z.editor)&&window.monaco.editor.setTheme(_t()),document.getElementById("vs-code-editor-overlay")&&((Z=window.monaco)!=null&&Z.editor)&&window.monaco.editor.setTheme(_t())});let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{Mn()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>Ht());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{Rt(n.value,0)}),n.addEventListener("keydown",k=>{let I=window.__vsCommandPalette||{commands:[],activeIndex:0};if((k.metaKey||k.ctrlKey)&&k.key.toLowerCase()==="p"){k.preventDefault();let R=I.commands[I.activeIndex];R&&Gn(R.id);return}if(k.key==="ArrowDown"){k.preventDefault(),Rt(n.value,I.activeIndex+1);return}if(k.key==="ArrowUp"){k.preventDefault(),Rt(n.value,I.activeIndex-1);return}if(k.key==="Enter"){k.preventDefault(),Zn();return}k.key==="Escape"&&(k.preventDefault(),Ht())})),Ki();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",k=>{k.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",k=>{!i.classList.contains("hidden")&&!i.contains(k.target)&&k.target!==o&&!o.contains(k.target)&&i.classList.add("hidden")})),["btn-edit-profile","btn-team-nav"].forEach(k=>{let I=document.getElementById(k);I&&i&&I.addEventListener("click",()=>{i.classList.add("hidden")})});let a=document.getElementById("btn-logout");a&&a.addEventListener("click",async()=>{await M.post("/auth/logout"),F.set("user",null),window.location.reload()});let l=document.getElementById("btn-undo-status");l&&l.addEventListener("click",()=>{Re()||_n()});let d=document.getElementById("btn-redo-status");d&&d.addEventListener("click",()=>{Re()||Pn()});let p=document.getElementById("btn-preview-site");p&&p.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let c=document.getElementById("btn-snapshot");c&&c.addEventListener("click",async()=>{var z;if(Re())return;c.disabled=!0,Xe("Creating snapshot...");let{ok:k,data:I,error:R}=await M.post("/snapshots",{type:"manual",label:"Manual snapshot"});c.disabled=!1,Xe(k?`\u2713 Snapshot saved (${((z=I==null?void 0:I.snapshot)==null?void 0:z.file_count)||0} files)`:"\u2717 "+((R==null?void 0:R.message)||"Snapshot failed"),k?"success":"error",4e3)});let g=document.getElementById("btn-download");g&&((async()=>{var z;let{ok:k,data:I}=await M.get("/settings");(z=I==null?void 0:I.settings)!=null&&z.last_published_at||(g.disabled=!0,g.title="Publish your site first to enable download.",g.classList.add("opacity-40"))})(),g.addEventListener("click",()=>{g.disabled||Re()||Ji()}));let r=document.getElementById("btn-publish");r&&(xt(),r.addEventListener("click",async()=>{var oe,de;if(Re())return;let k=qt();if(k.publishing)return;if(k.hasChanges===!1){A("No unpublished changes to publish.","warning");return}let I=k.counts||{added:0,modified:0,deleted:0},R=Number(I.added||0)+Number(I.modified||0)+Number(I.deleted||0),z=localStorage.getItem("vs_publish_snapshot"),se=await Xi({totalChanges:R,snapshotDefault:z===null?!0:z!=="false"});if(!se)return;localStorage.setItem("vs_publish_snapshot",String(se.createSnapshot)),k.publishing=!0,xt(),Xe("Publishing...");let{ok:re,data:D,error:ne}=await M.post("/publish",{create_snapshot:se.createSnapshot});if(k.publishing=!1,re){let me=((oe=D==null?void 0:D.published)==null?void 0:oe.length)||0,ue=((de=D==null?void 0:D.removed)==null?void 0:de.length)||0,le=ue>0?`Published ${me} file(s), removed ${ue} stale file(s).`:`Published ${me} file(s).`;A(le,"success"),Xe(`\u2713 ${me} published, ${ue} removed`,"success",5e3),F.set("previewDirty",!1),Ve({silent:!0}),window.open("/","_blank")}else A((ne==null?void 0:ne.message)||"Publish failed.","error"),Xe("\u2717 "+((ne==null?void 0:ne.message)||"Publish failed"),"error",5e3),Ve({silent:!0})}));let u=document.getElementById("btn-publish-menu");u&&u.addEventListener("click",k=>{if(k.stopPropagation(),Re())return;let I=document.querySelector(".vs-publish-dropup");if(I){I.remove();return}let R=document.createElement("div");R.className="vs-publish-dropup",R.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${C.cloudOff} Unpublish
        </button>
      `;let z=u.closest(".vs-publish-split");z?z.appendChild(R):u.parentElement.appendChild(R),R.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(R.remove(),!await be({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0}))return;Xe("Unpublishing...");let{ok:D,data:ne,error:oe}=await M.post("/publish/unpublish");D?(A("Unpublished. Default page restored.","success"),Xe("\u2713 Site unpublished","success",5e3),Ve({silent:!0})):(A((oe==null?void 0:oe.message)||"Unpublish failed.","error"),Xe("\u2717 "+((oe==null?void 0:oe.message)||"Unpublish failed"),"error",5e3))});let Z=re=>{!R.contains(re.target)&&re.target!==u&&(R.remove(),document.removeEventListener("click",Z))};setTimeout(()=>document.addEventListener("click",Z),0);let se=re=>{re.key==="Escape"&&(R.remove(),document.removeEventListener("keydown",se),document.removeEventListener("click",Z))};document.addEventListener("keydown",se)});let v=document.getElementById("resize-handle"),h=document.getElementById("conversation-panel");if(v&&h){let k,I;v.addEventListener("mousedown",R=>{R.preventDefault(),k=R.clientX,I=h.offsetWidth;let z=se=>{let re=se.clientX-k,D=Math.min(580,Math.max(340,I+re));h.style.width=`${D}px`,F.set("sidebarWidth",D)},Z=()=>{document.removeEventListener("mousemove",z),document.removeEventListener("mouseup",Z)};document.addEventListener("mousemove",z),document.addEventListener("mouseup",Z)})}let f=document.getElementById("prompt-input");f&&(f.addEventListener("input",()=>{f.style.height="auto",f.style.height=Math.min(200,f.scrollHeight)+"px"}),f.addEventListener("keydown",k=>{k.key==="Enter"&&(k.metaKey||k.ctrlKey)&&(k.preventDefault(),as())}));let b=document.getElementById("btn-send");b&&b.addEventListener("click",as);let m=document.getElementById("btn-attach-image"),L=document.getElementById("image-file-input");m&&L&&(m.addEventListener("click",()=>L.click()),L.addEventListener("change",()=>{L.files.length>0&&(Ps(L.files),L.value="")}));let E=document.querySelector(".vs-prompt-area");E&&(E.addEventListener("dragover",k=>{k.preventDefault(),k.stopPropagation(),E.classList.add("vs-drag-over")}),E.addEventListener("dragleave",k=>{k.preventDefault(),k.stopPropagation(),E.classList.remove("vs-drag-over")}),E.addEventListener("drop",k=>{k.preventDefault(),k.stopPropagation(),E.classList.remove("vs-drag-over");let I=Array.from(k.dataTransfer.files).filter(R=>Hs.includes(R.type));I.length>0&&Ps(I)})),f&&f.addEventListener("paste",k=>{var z;let R=Array.from(((z=k.clipboardData)==null?void 0:z.items)||[]).filter(Z=>Z.kind==="file"&&Hs.includes(Z.type));if(R.length>0){k.preventDefault();let Z=R.map(se=>se.getAsFile()).filter(Boolean);Ps(Z)}}),wt();let T=document.getElementById("btn-new-chat");T&&T.addEventListener("click",Hi);let B=document.getElementById("btn-scope-selector");B&&B.addEventListener("click",()=>{Ri()});let q=document.getElementById("btn-toggle-history");q&&q.addEventListener("click",Pi);let H=document.getElementById("btn-visual-editor");H&&H.addEventListener("click",()=>Es());let U=document.getElementById("btn-edit-code");U&&U.addEventListener("click",()=>{let k=window.__vsCurrentPreviewPath||"index.php";Ss(k)});let w=document.getElementById("btn-refresh-preview");w&&w.addEventListener("click",()=>Et());let $=document.querySelectorAll("[data-device]"),y=document.getElementById("preview-frame-container");if($.length&&y){let k={desktop:"100%",tablet:"768px",mobile:"375px"};$.forEach(I=>{I.addEventListener("click",()=>{let R=I.dataset.device,z=k[R]||"100%";R==="desktop"?(y.style.maxWidth="",y.style.width="",y.style.alignSelf=""):(y.style.maxWidth=z,y.style.width="100%",y.style.alignSelf="center"),$.forEach(Z=>{Z.classList.remove("vs-device-btn-active"),Z.dataset.device===R&&Z.classList.add("vs-device-btn-active")})})})}let N=document.getElementById("btn-external-preview");N&&N.addEventListener("click",()=>{let k=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(k),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",k=>{var R,z;let I=(z=(R=k.target)==null?void 0:R.closest)==null?void 0:z.call(R,"[data-code-toggle]");I&&(k.preventDefault(),oa(I))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",k=>{if((k.metaKey||k.ctrlKey)&&k.key==="k"){k.preventDefault(),Pt()?Ht():Mn();return}if(k.key==="Escape"&&Pt()){k.preventDefault(),Ht();return}if(k.key==="Escape"&&Kt()){k.preventDefault(),Zt();return}if((k.metaKey||k.ctrlKey)&&k.key==="z"&&!k.shiftKey){if(Pt()||Kt())return;let I=document.activeElement;if(I&&(I.tagName==="INPUT"||I.tagName==="TEXTAREA"))return;k.preventDefault(),_n()}if((k.metaKey||k.ctrlKey)&&k.key==="z"&&k.shiftKey){if(Pt()||Kt())return;let I=document.activeElement;if(I&&(I.tagName==="INPUT"||I.tagName==="TEXTAREA"))return;k.preventDefault(),Pn()}if(k.key==="v"&&!k.metaKey&&!k.ctrlKey&&!k.altKey&&!k.shiftKey){if(Pt()||Kt())return;let I=document.activeElement;if(I&&(I.tagName==="INPUT"||I.tagName==="TEXTAREA"||I.isContentEditable))return;let R=F.get("route");if(!js.includes(R))return;k.preventDefault(),Es()}if(k.key==="Escape"&&Bt()){k.preventDefault(),Tt();return}}));let O=F.get("route");if(js.includes(O))try{let k=F.get("activeConversationId"),I=localStorage.getItem("vs-active-conversation"),R=k||I,z=document.getElementById("chat-messages"),Z=z==null?void 0:z.querySelector(".vs-empty-state");R&&!F.get("aiStreaming")?(k||F.set("activeConversationId",R),Z&&ns(R)):R||z&&z.children.length===0&&(z.innerHTML=kt(),wt())}catch{}Dt(),Qi()}function Zi(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=document.createElement("div");t.className="vs-generating-overlay",t.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">Working on your site</div>
    <div class="vs-gen-subtitle">Content is being generated.<br>This may take a few minutes.</div>
    <div class="vs-gen-note">Please keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-progress"><div class="vs-gen-progress-bar"></div></div>
  `,e.appendChild(t)}function An(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function Et(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=Et;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),os())}));function Ds(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{Et()}}window.sendPreviewMessage=Ds;async function _n(){(await M.post("/revisions/undo")).ok&&(setTimeout(()=>Et(),300),await Dt(),Ve({silent:!0}))}async function Pn(){(await M.post("/revisions/redo")).ok&&(setTimeout(()=>Et(),300),await Dt(),Ve({silent:!0}))}async function Dt(){let{ok:e,data:t}=await M.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!s,l.title=o,l.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let l=document.getElementById(a);l&&(l.disabled=!n,l.title=i,l.classList.toggle("opacity-40",!n))})}function qt(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function Xe(e,t="neutral",s=0){let n=document.getElementById("status-text");n&&(n.textContent=e,n.className=t==="success"?"text-xs text-vs-success":t==="error"?"text-xs text-vs-error":"text-xs text-vs-text-ghost",window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s>0&&(window.__vsStatusResetTimer=setTimeout(()=>{let o=document.getElementById("status-text");o&&(o.textContent="Ready",o.className="text-xs text-vs-text-ghost",window.__vsStatusResetTimer=null)},s)))}function xt(){let e=qt(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=l=>{s&&(l?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${C.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${C.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${C.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${C.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let l=a===1?"":"s";n.textContent=`${a} unpublished change${l}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${C.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=xt;function Xi({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var d,p;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
      <div class="vs-modal" style="max-width: 520px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">Publish Website</h2>
          <p class="vs-modal-desc">${x(o)}</p>
          <label class="vs-publish-option" for="vs-publish-snapshot-cb">
            <input type="checkbox" id="vs-publish-snapshot-cb" ${t?"checked":""}>
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
    `;let a=c=>{c.key==="Escape"&&(c.preventDefault(),l(null))},l=c=>{document.removeEventListener("keydown",a),fe(i),s(c)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),i.addEventListener("click",c=>{c.target===i&&l(null)}),(d=document.getElementById("vs-confirm-cancel"))==null||d.addEventListener("click",()=>l(null)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>{let c=document.getElementById("vs-publish-snapshot-cb");l({createSnapshot:c?c.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var c;return(c=document.getElementById("vs-confirm-ok"))==null?void 0:c.focus()},220)})}function Ji(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=qt().hasChanges===!0?`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=r=>{r.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),fe(o)};o.querySelector("#vs-download-close").addEventListener("click",a),o.addEventListener("click",r=>{r.target===o&&a()}),document.addEventListener("keydown",i);let l=o.querySelector("#vs-download-publish-link");l&&l.addEventListener("click",r=>{r.preventDefault(),a(),setTimeout(()=>{let u=document.getElementById("btn-publish");u&&!u.disabled&&u.click()},400)});let d=o.querySelectorAll(".vs-download-card"),p=o.querySelector("#vs-download-action"),c="php";d.forEach(r=>{r.addEventListener("click",()=>{if(r.classList.contains("is-loading"))return;d.forEach(v=>v.classList.remove("is-selected")),r.classList.add("is-selected"),c=r.dataset.format;let u=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${C.download} ${u}`})});let g=!1;p.addEventListener("click",async()=>{var r;if(!g){g=!0,p.disabled=!0,p.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',d.forEach(u=>u.style.pointerEvents="none");try{let u=F.get("sessionToken"),v={"Content-Type":"application/json",Accept:"application/zip"};u&&(v["X-VS-Token"]=u);let h=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:v,credentials:"same-origin",body:JSON.stringify({format:c})});if(!h.ok){let B="Export failed.";try{let q=await h.json();B=((r=q==null?void 0:q.error)==null?void 0:r.message)||B}catch{}A(B,"error");return}let b=(h.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),m=b?b[1]:`site-${c}-${new Date().toISOString().slice(0,10)}.zip`,L=await h.blob(),E=URL.createObjectURL(L),T=document.createElement("a");T.href=E,T.download=m,T.style.display="none",document.body.appendChild(T),T.click(),setTimeout(()=>{URL.revokeObjectURL(E),T.remove()},100),A(`\u2713 ${m} downloaded`,"success")}catch{A("Download failed. Check your connection.","error")}finally{g=!1,p.disabled=!1;let u=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${C.download} ${u}`,d.forEach(v=>v.style.pointerEvents="")}}})}async function Ve({silent:e=!1}={}){let t=qt();if(t.publishing){xt();return}t.checking=!0,e||xt();let{ok:s,data:n,error:o}=await M.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",xt()}window.refreshPublishState=Ve;function Qi(){let e=qt();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),Ve({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||Ve({silent:!0})},15e3)}function ea(e){if(!e||!e.includes("[vx-img:"))return{text:e||"",images:[]};let t=[];return{text:e.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(n,o)=>(t.push(o),"")).trim(),images:t}}function Ps(e){let t=Array.from(e),s=wn-Je.length;if(s<=0){A(`Maximum ${wn} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&A(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!Hs.includes(o.type)){A(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>si){A(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,l=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!l)return;let d=new Image;d.onload=()=>{let p=ta(d,120);Je.push({media_type:l[1],data:l[2],name:o.name,preview:a,thumbnail:p}),zs()},d.src=a},i.readAsDataURL(o)})}function ta(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function zs(){let e=document.getElementById("image-attachments");if(e){if(Je.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=Je.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${x(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);Je.splice(n,1),zs()})})}}function sa(){Je=[],zs()}async function as(){if(Re())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=Je.length>0;if(!t&&!s||F.get("aiStreaming"))return;e.value="",e.style.height="auto";let n=document.getElementById("chat-messages");if(!n)return;let o=[...Je];sa();let a=`
    <div class="vs-msg-user mb-6 mt-4">
      ${o.length>0?`<div class="vs-msg-user-images">${o.map(G=>`<img src="${G.preview}" alt="${x(G.name)}" class="vs-msg-user-image" />`).join("")}</div>`:""}
      ${t?`<div class="vs-msg-user-bubble">${x(t)}</div>`:""}
    </div>
  `,l=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,d=`
    <div class="vs-msg-ai mb-6" data-stream-id="${l}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-vs-accent">${C.box}</span>
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
  `,p=n.querySelector(".vs-empty-state");p&&p.remove(),n.insertAdjacentHTML("beforeend",a+d),n.scrollTop=n.scrollHeight;let c=!0,g=80,r=()=>{c=n.scrollHeight-n.scrollTop-n.clientHeight<=g};n.addEventListener("scroll",r);let u=()=>{c&&(n.scrollTop=n.scrollHeight)},v=n.querySelector(`.vs-msg-ai[data-stream-id="${l}"]`);if(!v)return;let h=v.querySelector('[data-role="typing"]'),f=v.querySelector('[data-role="status"]'),b=v.querySelector('[data-role="status-text"]'),m=v.querySelector('[data-role="stream-content"]'),L=v.querySelector('[data-role="files-section"]'),E=v.querySelector('[data-role="files"]'),T=v.querySelector('[data-role="files-label"]'),B=v.querySelector('[data-role="files-count"]'),q=v.querySelector('[data-role="files-progress"]'),H=v.querySelector('[data-role="error"]'),U=v.querySelector('[data-role="status-timer"]'),w=G=>{G&&G.removeAttribute("hidden")},$=G=>{G&&G.setAttribute("hidden","")},y=Date.now(),N=0,O=Date.now(),k=!1,I=!1,R=setInterval(()=>{let G=Math.floor((Date.now()-y)/1e3),ee=Math.floor(G/60),ye=G%60,S=ee>0?`${ee}m ${ye}s`:`${ye}s`;N>0&&(S+=` \xB7 ${N.toLocaleString()} tokens`),U&&(U.textContent=`\xB7 ${S}`),Date.now()-O>3e5&&!k&&(k=!0,b&&(b.textContent="No data for 5 min \u2014 the model may have stalled",b.style.color="var(--vs-warning, #d97706)"))},1e3);F.set("aiStreaming",!0);let z=document.getElementById("btn-send");z&&(z.disabled=!0,z.classList.add("opacity-50")),Zi();let Z="",se=[],re=!1,D=null,ne=!0,oe=new AbortController,de=v.querySelector('[data-role="stop-btn"]');de&&de.addEventListener("click",()=>oe.abort());let me=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let ue=e.dataset.actionData,le=null;if(ue){try{le=JSON.parse(ue)}catch{}delete e.dataset.actionData}let xe=t||"(see attached images)";o.length>0&&(xe=o.map(ee=>`[vx-img:${ee.thumbnail}]`).join("")+xe);let Le={user_prompt:xe,action_type:me,page_scope:F.get("activePageScope"),conversation_id:F.get("activeConversationId"),action_data:le};o.length>0&&(Le.images=o.map(G=>({data:G.data,media_type:G.media_type}))),await st("/ai/prompt",Le,{signal:oe.signal,onConversation(G){if(G){F.set("activeConversationId",G);try{localStorage.setItem("vs-active-conversation",G)}catch{}}},onStatus(G){!I&&L&&!L.hasAttribute("hidden")&&T&&(T.textContent=G),f&&b&&(b.textContent=G,w(f))},onToken(G){Z+=G,N+=Math.ceil(G.length/4),O=Date.now(),k=!1,b&&(b.style.color="");let ee=Z.trimStart();if(!re&&ee.length>0&&(re=ee.startsWith("{")||ee.startsWith("```json")||ee.startsWith("```")||ee.startsWith("<|")||ee.startsWith("<message>")||ee.startsWith("<file ")||G.includes("<|")||ee.includes("<|channel|>")||ee.includes('"operations"')||ee.includes('"assistant_message"'),re&&m&&(m.innerHTML="")),$(h),m&&re){let ye=Z.match(/<message>([\s\S]*?)(<\/message>|$)/);if(ye){let S=ye[1].trim();S&&(w(m),m.innerHTML=Xt(S))}L&&Z.includes("<file ")&&w(L)}else m&&(w(m),m.innerHTML=Xt(Z),f&&$(f));u()},onFile(G){if(se.push(G),L&&w(L),B){let ee=se.length;B.textContent=`${ee} file${ee!==1?"s":""}`}if(E){let ee=G.action==="delete",ye=(se.length-1)*60,S=ee?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';E.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${ee?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${ye}ms">
            <span class="vs-file-badge-icon">${S}</span>
            <span>${x(G.path)}</span>
          </div>
        `)}D||(ne=!0),G.path.endsWith(".css")||(ne=!1),clearTimeout(D),D=setTimeout(()=>{Ds(ne?"voxelsite:reload-css":"voxelsite:reload"),D=null,ne=!0},600),u()},onDone(G){I=!0,clearTimeout(D),D=null,clearInterval(R),$(h),$(f);let ee=G.files_modified||[],ye=se.length>0||ee.length>0;if(L&&ye?($(q),L.classList.add("vs-files-done"),T&&(T.textContent=G.partial?"Files updated (partial)":"Files updated")):L&&!L.hasAttribute("hidden")&&($(q),$(L)),m)if(G.message)w(m),m.innerHTML=Xt(G.message);else if(re)$(m);else{let _=m.textContent||"";(_.includes("<|channel|>")||_.includes('"operations"')||_.includes('"assistant_message"')||_.includes("<file ")||_.includes("<message>"))&&($(m),m.innerHTML="")}let S=G.missing_files||[];if((G.truncated||S.length>0)&&m){let _;S.length>0?_=`The following pages are linked in the navigation but were NOT created yet: ${S.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:_="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let j=document.getElementById("prompt-input");j&&!F.get("aiStreaming")&&(T&&(T.textContent="Generating remaining files..."),L&&(L.classList.remove("vs-files-done"),w(L)),j.value=_,j.dataset.actionType=me,as())},800)}if(G.conversation_id){F.set("activeConversationId",G.conversation_id);try{localStorage.setItem("vs-active-conversation",G.conversation_id)}catch{}}let P=[...se,...ee];if(P.length>0){let _=P.map(W=>W.path||W),j=_.some(W=>W==="index.php"),V=_.filter(W=>W.endsWith(".php")&&!W.includes("/")&&W!=="index.php"),K=j&&V.length>0,Y;K?Y="index.php":V.length>0?Y=V[0]:Y=j?"index.php":null,Et(Y),F.set("previewDirty",!0),Ve({silent:!0})}An(),On(),Dt(),n.removeEventListener("scroll",r),n.scrollTop=n.scrollHeight},onWarning(G){G.toLowerCase().includes("truncat")||E&&(E.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${x(G)}</div>
        `)},onError(G){clearTimeout(D),D=null,clearInterval(R),$(h),$(f),H&&(H.textContent=G.message||"Something went wrong.",w(H)),An(),q&&$(q),L&&se.length>0&&(L.classList.add("vs-files-done"),T&&(T.textContent="Files updated (partial)"))}}),F.set("aiStreaming",!1),z&&(z.disabled=!1,z.classList.remove("opacity-50"))}function jn(){var g;Nn.innerHTML=`
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
            <h1 class="vs-login-title">${Me?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${Me?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${Me?`
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
                ${Me?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${Me?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${Me?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${C.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${Me?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${Me?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
        ${(F.get("theme")||"light")==="light"?C.sun:C.moon}
      </button>
    </div>
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let r=e.type==="password";e.type=r?"text":"password",t.innerHTML=r?C.eyeOff:C.eye,t.title=r?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let r=gs();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=r==="light"?C.sun:C.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(r=>{r.addEventListener("click",()=>{let u=document.getElementById(r.dataset.toggleTarget);if(!u)return;let v=u.type==="password";u.type=v?"text":"password",r.innerHTML=v?C.eyeOff:C.eye,r.title=v?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),l=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var u,v,h;o.classList.add("hidden"),i.classList.remove("hidden");let r=document.getElementById("forgot-content");try{let b=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((u=b==null?void 0:b.data)==null?void 0:u.mode)||"file")==="email"?(r.innerHTML=`
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
          `,(v=document.getElementById("forgot-form"))==null||v.addEventListener("submit",async L=>{var H,U,w;L.preventDefault();let E=document.getElementById("forgot-message"),T=document.getElementById("forgot-email"),B=L.target.querySelector('button[type="submit"]'),q=(H=T==null?void 0:T.value)==null?void 0:H.trim();if(q){B&&(B.disabled=!0,B.textContent="Sending...");try{let y=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:q})})).json();E&&(y.ok?(E.textContent=((U=y.data)==null?void 0:U.message)||"Recovery link sent. Check your inbox.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",T&&(T.value="")):(E.textContent=((w=y.error)==null?void 0:w.message)||"Failed to send recovery email.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),E.classList.remove("hidden"))}catch{E&&(E.textContent="Network error. Please try again.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",E.classList.remove("hidden"))}finally{B&&(B.disabled=!1,B.textContent="Send Recovery Link")}}})):(r.innerHTML=`
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
          `,n(),(h=document.getElementById("forgot-form"))==null||h.addEventListener("submit",async L=>{var H,U,w;L.preventDefault();let E=document.getElementById("forgot-message"),T=(H=document.getElementById("forgot-email"))==null?void 0:H.value,B=(U=document.getElementById("forgot-new-password"))==null?void 0:U.value;if(!T||!B)return;let q=await M.post("/auth/reset-password",{email:T,new_password:B});q.ok?(E&&(E.textContent="Password reset. You can now sign in with your new password.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",E.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):E&&(E.textContent=((w=q.error)==null?void 0:w.message)||"Reset failed. Make sure the .reset file exists in _data/.",E.className="mb-5 px-4 py-3 text-sm rounded-xl border",E.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",E.classList.remove("hidden"))}))}catch{r.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),l&&l.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let p=new URLSearchParams(window.location.search).get("reset");if(p&&p.length===64&&i&&o){let r=window.location.pathname+window.location.hash;window.history.replaceState(null,"",r),o.classList.add("hidden"),i.classList.remove("hidden");let u=document.getElementById("forgot-content");u&&(u.innerHTML=`
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
      `,n(),(g=document.getElementById("token-reset-form"))==null||g.addEventListener("submit",async v=>{var L,E,T,B;v.preventDefault();let h=document.getElementById("forgot-message"),f=(L=document.getElementById("token-new-password"))==null?void 0:L.value,b=(E=document.getElementById("token-confirm-password"))==null?void 0:E.value,m=v.target.querySelector('button[type="submit"]');if(!f||f.length<8){h&&(h.textContent="Password must be at least 8 characters.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"));return}if(f!==b){h&&(h.textContent="Passwords do not match.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"));return}m&&(m.disabled=!0,m.textContent="Resetting...");try{let H=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:p,new_password:f})})).json();h&&(H.ok?(h.textContent=((T=H.data)==null?void 0:T.message)||"Password reset. You can now sign in.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",h.classList.remove("hidden"),v.target.querySelectorAll("input").forEach(U=>U.disabled=!0),m&&(m.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(h.textContent=((B=H.error)==null?void 0:B.message)||"Reset failed. The link may have expired.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden")))}catch{h&&(h.textContent="Network error. Please try again.",h.className="mb-5 px-4 py-3 text-sm rounded-xl border",h.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",h.classList.remove("hidden"))}finally{m&&(m.disabled=!1,m.textContent="Reset Password")}}))}let c=document.getElementById("login-form");c&&c.addEventListener("submit",async r=>{var b,m,L,E;r.preventDefault();let u=(b=document.getElementById("login-email"))==null?void 0:b.value,v=(m=document.getElementById("login-password"))==null?void 0:m.value,h=document.getElementById("login-error");if(!u||!v)return;let f=await M.post("/auth/login",{email:u,password:v});f.ok&&((L=f.data)!=null&&L.token)?(F.batch(()=>{F.set("user",f.data.user),F.set("sessionToken",f.data.token)}),Fn()):h&&(h.textContent=((E=f.error)==null?void 0:E.message)||"Invalid email or password.",h.classList.remove("hidden"))}),Dt()}function Kt(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function Xt(e){if(!e)return"";if(!window.marked)return x(e);let t=window.marked.parse(e);return na(t)}function na(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),l=a?a.split(`
`):[];if(l.length<=ei)return;let d=l.slice(0,ti).join(`
`)+`
...`,p=document.createElement("div");p.className="vs-code-collapse",p.setAttribute("data-code-collapse","1");let c=document.createElement("pre");c.className="vs-code-collapse-preview",c.setAttribute("data-code-preview","1");let g=document.createElement("code");o!=null&&o.className&&(g.className=o.className),g.textContent=d,c.appendChild(g),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let r=document.createElement("button");r.type="button",r.className="vs-code-collapse-toggle",r.setAttribute("data-code-toggle","1"),r.setAttribute("data-lines",String(l.length)),r.setAttribute("aria-expanded","false"),r.textContent=`More (${l.length} lines)`;let u=n.parentNode;u&&(u.replaceChild(p,n),p.appendChild(c),p.appendChild(n),p.appendChild(r))}),t.innerHTML}function oa(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Fn();})();
