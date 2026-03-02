(()=>{var _s=e=>{throw TypeError(e)};var ss=(e,t,s)=>t.has(e)||_s("Cannot "+s);var Q=(e,t,s)=>(ss(e,t,"read from private field"),s?s.call(e):t.get(e)),ge=(e,t,s)=>t.has(e)?_s("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),Ce=(e,t,s,n)=>(ss(e,t,"write to private field"),n?n.call(e,s):t.set(e,s),s),qe=(e,t,s)=>(ss(e,t,"access private method"),s);var Me,Ie,Xe,_e,Et,os,ns=class{constructor(t={}){ge(this,Et);ge(this,Me,new Map);ge(this,Ie,new Map);ge(this,Xe,!1);ge(this,_e,new Map);for(let[s,n]of Object.entries(t))Q(this,Me).set(s,n)}get(t,s=void 0){return Q(this,Me).has(t)?Q(this,Me).get(t):s}set(t,s){let n=Q(this,Me).get(t);n!==s&&(Q(this,Me).set(t,s),Q(this,Xe)?Q(this,_e).has(t)?Q(this,_e).get(t).newValue=s:Q(this,_e).set(t,{newValue:s,oldValue:n}):qe(this,Et,os).call(this,t,s,n))}update(t){this.batch(()=>{for(let[s,n]of Object.entries(t))this.set(s,n)})}on(t,s){return Q(this,Ie).has(t)||Q(this,Ie).set(t,new Set),Q(this,Ie).get(t).add(s),()=>{var n;(n=Q(this,Ie).get(t))==null||n.delete(s)}}batch(t){if(Q(this,Xe)){t();return}Ce(this,Xe,!0),Q(this,_e).clear();try{t()}finally{Ce(this,Xe,!1);for(let[s,{newValue:n,oldValue:o}]of Q(this,_e))qe(this,Et,os).call(this,s,n,o);Q(this,_e).clear()}}toJSON(){return Object.fromEntries(Q(this,Me))}};Me=new WeakMap,Ie=new WeakMap,Xe=new WeakMap,_e=new WeakMap,Et=new WeakSet,os=function(t,s,n){let o=Q(this,Ie).get(t);if(o)for(let a of o)try{a(s,n)}catch(r){console.error(`[state] Error in "${t}" listener:`,r)}let i=Q(this,Ie).get("*");if(i)for(let a of i)try{a(t,s,n)}catch(r){console.error("[state] Error in wildcard listener:",r)}};var I=new ns({user:null,sessionToken:null,siteName:"",route:"chat",routeParams:{},theme:localStorage.getItem("vs-theme")||"forge",sidebarWidth:parseInt(localStorage.getItem("vs-sidebar-width")||"440",10),mobileView:"chat",activeConversationId:null,activePageScope:null,messages:[],conversations:[],aiStreaming:!1,aiStreamContent:"",pages:[],currentPage:null,previewUrl:null,previewDirty:!1,loading:!1,error:null,toast:null});I.on("theme",e=>{localStorage.setItem("vs-theme",e),document.documentElement.setAttribute("data-theme",e)});I.on("sidebarWidth",e=>{localStorage.setItem("vs-sidebar-width",String(e))});var Ct,dt,ct,pt,Lt,vt,Ue,as,rs,is=class{constructor(){ge(this,Ue);ge(this,Ct,[]);ge(this,dt,null);ge(this,ct,!1);ge(this,pt,null);ge(this,Lt,null);ge(this,vt,!1)}on(t,s){let n=[],o=t.replace(/:([a-zA-Z_]+)/g,(i,a)=>(n.push(a),"([^/]+)"));return Q(this,Ct).push({pattern:t,regex:new RegExp(`^${o}$`),paramNames:n,handler:s}),this}onNotFound(t){return Ce(this,dt,t),this}beforeEach(t){return Ce(this,pt,t),this}start(){Q(this,ct)||(Ce(this,ct,!0),window.addEventListener("hashchange",()=>qe(this,Ue,as).call(this)),qe(this,Ue,as).call(this))}navigate(t){window.location.hash=`/${t}`}get current(){return qe(this,Ue,rs).call(this)}};Ct=new WeakMap,dt=new WeakMap,ct=new WeakMap,pt=new WeakMap,Lt=new WeakMap,vt=new WeakMap,Ue=new WeakSet,as=async function(){if(Q(this,vt))return;let t=qe(this,Ue,rs).call(this),s=Q(this,Lt);if(!(t===s&&Q(this,ct))){if(Q(this,pt)&&s!==null){Ce(this,vt,!0);try{if(await Q(this,pt).call(this,t,s)===!1){window.history.replaceState(null,"",`#/${s}`);return}}finally{Ce(this,vt,!1)}}Ce(this,Lt,t);for(let n of Q(this,Ct)){let o=t.match(n.regex);if(o){let i={};n.paramNames.forEach((a,r)=>{i[a]=decodeURIComponent(o[r+1])}),I.batch(()=>{I.set("route",n.pattern),I.set("routeParams",i)}),n.handler(i);return}}Q(this,dt)?(I.set("route","404"),Q(this,dt).call(this,t)):this.navigate("chat")}},rs=function(){return(window.location.hash||"#/chat").replace(/^#\/?/,"")};var Je=new is;var Ps="/_studio/api/router.php";async function Nt(e,t,s=null,n={}){let o={Accept:"application/json"};if(["POST","PUT","DELETE"].includes(e)){let a=js();a&&(o["X-VS-Token"]=a)}s!==null&&(o["Content-Type"]="application/json");let i={method:e,headers:o,credentials:"same-origin",...n};s!==null&&(i.body=JSON.stringify(s));try{let[a,r]=t.split("?"),d=`${Ps}?_path=${encodeURIComponent(a)}${r?"&"+r:""}`,p=await fetch(d,i),c=await p.json();return p.status===401?(I.get("user")&&I.set("user",null),c!=null&&c.error?{ok:!1,error:c.error}:{ok:!1,error:{code:"unauthorized",message:"Session expired. Please sign in again."}}):!c.ok&&c.error?(c.error.code==="demo_mode"&&window.showToast&&window.showToast(c.error.message||"Demo mode \u2014 this action is disabled.","warning"),{ok:!1,error:c.error}):{ok:!0,data:c.data||c}}catch{return{ok:!1,error:{code:"network_error",message:"Cannot reach the server. Check your connection."}}}}var T={get:(e,t)=>Nt("GET",e,null,t),post:(e,t,s)=>Nt("POST",e,t,s),put:(e,t,s)=>Nt("PUT",e,t,s),delete:(e,t,s)=>Nt("DELETE",e,t,s)};async function Qe(e,t,s={}){var f,v;let{onToken:n=()=>{},onStatus:o=()=>{},onConversation:i=()=>{},onFile:a=()=>{},onDone:r=()=>{},onWarning:d=()=>{},onError:p=()=>{},signal:c=null}=s,u=js(),l={"Content-Type":"application/json",Accept:"text/event-stream"};u&&(l["X-VS-Token"]=u);let m=!1,h=0,g=0,b=t.conversation_id||null;try{let X=function($){if(!$.trim())return;let O="";for(let y of $.split(`
`))y.startsWith(":")||y.startsWith("data: ")&&(O+=y.slice(6));if(!O)return;let W;try{W=JSON.parse(O)}catch{return}switch(W.type||"message"){case"token":g++,n(W.content||"");break;case"status":o(W.message||"");break;case"conversation":b=W.conversation_id||b,i(W.conversation_id||"");break;case"file_complete":h++,a(W);break;case"done":m=!0,r(W);break;case"warning":d(W.message||"");break;case"error":p(W);break}},C={method:"POST",headers:l,credentials:"same-origin",body:JSON.stringify(t)};c&&(C.signal=c);let[k,M]=e.split("?"),D=`${Ps}?_path=${encodeURIComponent(k)}${M?"&"+M:""}`,z=await fetch(D,C);if(!z.ok){let $=await z.json().catch(()=>null);p({code:((f=$==null?void 0:$.error)==null?void 0:f.code)||"http_error",message:((v=$==null?void 0:$.error)==null?void 0:v.message)||`Server error (${z.status})`});return}let q=z.body.getReader(),Z=new TextDecoder,G="";for(;;){let{done:$,value:O}=await q.read();if($)break;G+=Z.decode(O,{stream:!0});let W=G.split(`

`);G=W.pop();for(let K of W)X(K)}if(G.trim()&&X(G),!m){let $=b;$?(o("Waiting for server to finish..."),await As($,{onDone:r,onError:p,onFile:a,onStatus:o})):(h>0||g>0)&&r({files_modified:[],message:"",soft_close:!0})}}catch(C){if(C.name==="AbortError"){r({cancelled:!0,message:"Generation stopped."});return}if(h>0||g>0){let k=b;k?(o("Server is still generating \u2014 waiting for completion..."),await As(k,{onDone:r,onError:p,onFile:a,onStatus:o})):r({files_modified:[],message:"",soft_close:!0})}else p({code:"stream_error",message:"Could not connect to the AI. Check your internet connection and API key, then try again."})}}async function As(e,{onDone:t,onError:s,onFile:n,onStatus:o}){var r;let a=0;for(let d=0;d<120;d++){await new Promise(p=>setTimeout(p,3e3));try{let{ok:p,data:c}=await T.get(`/ai/conversations/${e}`);if(!p||!((r=c==null?void 0:c.conversation)!=null&&r.prompts))continue;let u=c.conversation.prompts,l=u[u.length-1];if(!l)continue;let m=l.files_modified?JSON.parse(l.files_modified):[];if(m.length>a){for(let h=a;h<m.length;h++)n({path:m[h],action:"write"});a=m.length}if(l.status==="streaming"){let h=Math.round((Date.now()-new Date(l.created_at).getTime())/1e3);o(`Server is still generating... (${h}s)`);continue}l.status==="success"?t({message:l.ai_message||"",files_modified:m,revision_id:l.revision_id||null,polled:!0}):l.status==="partial"?t({message:l.ai_message||"",files_modified:m,partial:!0,polled:!0}):s({code:"generation_failed",message:l.error_message||"Generation failed on the server."});return}catch{}}t({files_modified:[],message:"",partial:!0,soft_close:!0})}function js(){return I.get("sessionToken")}var Rn="data-theme",ls="dark";function Hs(){let e=I.get("theme")||localStorage.getItem("vs-theme")||ls;return Rs(e),e}function Rs(e){let t=e||ls;return document.documentElement.setAttribute(Rn,t),localStorage.setItem("vs-theme",t),I.set("theme",t),t}function ds(){let e=I.get("theme")||ls;return Rs(e==="dark"?"light":"dark")}var Le=!1,Ft=null,et=[],cs=!1,Ds=!1,re={sizes:["xs","sm","base","lg","xl","2xl","3xl","4xl","5xl","6xl","7xl","8xl","9xl"],weights:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black"],aligns:["left","center","right","justify"],trackings:["tighter","tight","normal","wide","wider","widest"],leadings:["none","tight","snug","normal","relaxed","loose","3","4","5","6","7","8","9","10"],transforms:["normal-case","uppercase","lowercase","capitalize"],decorations:["no-underline","underline","line-through"],positions:["static","relative","absolute","fixed","sticky"],flexDirs:["flex-row","flex-col","flex-row-reverse","flex-col-reverse"],justifies:["justify-start","justify-center","justify-end","justify-between","justify-around","justify-evenly"],aligns_items:["items-start","items-center","items-end","items-stretch","items-baseline"],gaps:["0","1","2","3","4","5","6","8","10","12","16","20","24","32"],gridCols:["1","2","3","4","5","6","8","10","12"],gridRows:["1","2","3","4","5","6"],coordinates:["auto","0","0.5","1","2","4","6","8","10","12","16","20","24","32","40","48","64"],spacings:["0","0.5","1","1.5","2","2.5","3","3.5","4","5","6","7","8","9","10","11","12","14","16","20","24","28","32","36","40","44","48","52","56","60","64","72","80","96"],compactSpacings:["0","0.5","1","2","3","4","5","6","8","10","12","16","20","24","32","40","48","64"],radii:["none","sm","","md","lg","xl","2xl","3xl","full"],shadows:["none","sm","","md","lg","xl","2xl","inner"],borderWidths:["0","","2","4","8"],borderStyles:["solid","dashed","dotted","double","none"],colors:[{name:"slate",shades:{50:"#f8fafc",100:"#f1f5f9",200:"#e2e8f0",300:"#cbd5e1",400:"#94a3b8",500:"#64748b",600:"#475569",700:"#334155",800:"#1e293b",900:"#0f172a",950:"#020617"}},{name:"gray",shades:{50:"#f9fafb",100:"#f3f4f6",200:"#e5e7eb",300:"#d1d5db",400:"#9ca3af",500:"#6b7280",600:"#4b5563",700:"#374151",800:"#1f2937",900:"#111827",950:"#030712"}},{name:"red",shades:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"}},{name:"orange",shades:{50:"#fff7ed",100:"#ffedd5",200:"#fed7aa",300:"#fdba74",400:"#fb923c",500:"#f97316",600:"#ea580c",700:"#c2410c",800:"#9a3412",900:"#7c2d12",950:"#431407"}},{name:"amber",shades:{50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309",800:"#92400e",900:"#78350f",950:"#451a03"}},{name:"yellow",shades:{50:"#fefce8",100:"#fef9c3",200:"#fef08a",300:"#fde047",400:"#facc15",500:"#eab308",600:"#ca8a04",700:"#a16207",800:"#854d0e",900:"#713f12",950:"#422006"}},{name:"green",shades:{50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d",950:"#052e16"}},{name:"emerald",shades:{50:"#ecfdf5",100:"#d1fae5",200:"#a7f3d0",300:"#6ee7b7",400:"#34d399",500:"#10b981",600:"#059669",700:"#047857",800:"#065f46",900:"#064e3b",950:"#022c22"}},{name:"teal",shades:{50:"#f0fdfa",100:"#ccfbf1",200:"#99f6e4",300:"#5eead4",400:"#2dd4bf",500:"#14b8a6",600:"#0d9488",700:"#0f766e",800:"#115e59",900:"#134e4a",950:"#042f2e"}},{name:"cyan",shades:{50:"#ecfeff",100:"#cffafe",200:"#a5f3fc",300:"#67e8f9",400:"#22d3ee",500:"#06b6d4",600:"#0891b2",700:"#0e7490",800:"#155e75",900:"#164e63",950:"#083344"}},{name:"sky",shades:{50:"#f0f9ff",100:"#e0f2fe",200:"#bae6fd",300:"#7dd3fc",400:"#38bdf8",500:"#0ea5e9",600:"#0284c7",700:"#0369a1",800:"#075985",900:"#0c4a6e",950:"#082f49"}},{name:"blue",shades:{50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a",950:"#172554"}},{name:"indigo",shades:{50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81",950:"#1e1b4b"}},{name:"violet",shades:{50:"#f5f3ff",100:"#ede9fe",200:"#ddd6fe",300:"#c4b5fd",400:"#a78bfa",500:"#8b5cf6",600:"#7c3aed",700:"#6d28d9",800:"#5b21b6",900:"#4c1d95",950:"#2e1065"}},{name:"purple",shades:{50:"#faf5ff",100:"#f3e8ff",200:"#e9d5ff",300:"#d8b4fe",400:"#c084fc",500:"#a855f7",600:"#9333ea",700:"#7e22ce",800:"#6b21a8",900:"#581c87",950:"#3b0764"}},{name:"pink",shades:{50:"#fdf2f8",100:"#fce7f3",200:"#fbcfe8",300:"#f9a8d4",400:"#f472b6",500:"#ec4899",600:"#db2777",700:"#be185d",800:"#9d174d",900:"#831843",950:"#500724"}},{name:"rose",shades:{50:"#fff1f2",100:"#ffe4e6",200:"#fecdd3",300:"#fda4af",400:"#fb7185",500:"#f43f5e",600:"#e11d48",700:"#be123c",800:"#9f1239",900:"#881337",950:"#4c0519"}}],specialColors:[{name:"white",hex:"#ffffff"},{name:"black",hex:"#000000"},{name:"transparent",hex:"transparent"}]};function fs(){Le=!Le,Xs(),Y({type:"vx-editor:toggle",active:Le}),Le||(xe(),ys(),Se(),tt(),Ft=null,at=!1)}function $t(){return Le}function St(){Le&&(Le=!1,Xs(),Y({type:"vx-editor:toggle",active:!1}),xe(),ys(),Se(),tt(),Ft=null,at=!1)}function zs(){if(Ds)return;Ds=!0,window.addEventListener("message",Dn);let e=document.getElementById("preview-iframe");e&&e.addEventListener("load",()=>{at&&Os()})}function Dn(e){if(!(!e.data||typeof e.data!="object")&&!(!e.data.type||!e.data.type.startsWith("vx-editor:"))&&e.origin===window.location.origin)switch(e.data.type){case"vx-editor:select":Ft=e.data,On(e.data);break;case"vx-editor:text-changed":gs(e.data);break;case"vx-editor:image-changed":wo(e.data);break;case"vx-editor:element-deleted":hs(e.data);break;case"vx-editor:deselect":xe(),ys(),Se(),Ft=null;break;case"vx-editor:save-request":Tt();break;case"vx-editor:editing-started":Nn(e.data);break;case"vx-editor:editing-ended":Os();break;case"vx-editor:selection-state":Fn(e.data);break;case"vx-editor:element-rect":qn(e.data);break;case"vx-editor:richtext-link-request":Ks();break;case"vx-editor:add-section-request":ho(e.data);break}}var at=!1,bs=!1,ze=null,ut={},vs="P";function Nn(e){at=!0,bs=!!e.hasPhp,ze=e.rect||null,ut={},vs=e.tagName||"P",xe(),Un()}function Os(){at=!1,bs=!1,ze=null,ut={},Gs()}function Fn(e){if(at){if(e.elementRect&&(ze=e.elementRect,Vs()),!e.hasSelection){ut={},Ns();return}ut=e.formatting||{},vs=e.blockTag||vs,Ns()}}function qn(e){at&&e.rect&&(ze=e.rect,Vs())}function Vs(){let e=document.getElementById("vx-richtext-toolbar");e&&Ws(e)}function Un(){let e=document.getElementById("vx-richtext-toolbar");e||(e=document.createElement("div"),e.id="vx-richtext-toolbar",e.className="vx-richtext-toolbar",e.addEventListener("mousedown",t=>t.preventDefault()),document.body.appendChild(e)),Ws(e),zn(e),e.classList.add("vx-rt-visible")}function Ws(e){if(!ze)return;let t=document.getElementById("preview-iframe");if(!t)return;let s=t.getBoundingClientRect(),n=s.left+ze.left,o=s.top+ze.top,i=ze.width;e.style.left=`${n+i/2}px`,e.style.top=`${o-6}px`}function zn(e){let t=ut,s=bs;e.innerHTML=`<div class="vx-rt-actions">
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
  </div>`,e.querySelectorAll("[data-cmd]").forEach(i=>{i.addEventListener("click",a=>{a.stopPropagation();let r=i.dataset.cmd;if(r==="insertLink"){Ks();return}Y({type:"vx-editor:richtext-command",command:r})})});let n=e.querySelector('[data-action="cancel"]'),o=e.querySelector('[data-action="save"]');n&&n.addEventListener("click",i=>{i.stopPropagation(),Y({type:"vx-editor:cancel-edit"})}),o&&o.addEventListener("click",i=>{i.stopPropagation(),Y({type:"vx-editor:save-edit"})})}function Ns(){let e=document.getElementById("vx-richtext-toolbar");if(!e)return;let t=ut,s={bold:t.bold,italic:t.italic};e.querySelectorAll("[data-cmd]").forEach(n=>{let o=n.dataset.cmd;o in s&&n.classList.toggle("vx-rt-active",!!s[o])})}function Gs(){let e=document.getElementById("vx-richtext-toolbar");e&&e.classList.remove("vx-rt-visible")}function ys(){Gs()}function Ks(){let e=prompt("Enter URL:");if(e!==null){let t=e.trim();Y(t?{type:"vx-editor:richtext-command",command:"insertLink",value:t}:{type:"vx-editor:richtext-command",command:"removeLink"})}}function On(e){let t=document.getElementById("vx-context-toolbar");t||(t=document.createElement("div"),t.id="vx-context-toolbar",t.className="vx-context-toolbar",document.body.appendChild(t));let{tagName:s,rect:n,hasText:o,hasImage:i}=e,a=document.getElementById("preview-iframe");if(!a)return;let r=a.getBoundingClientRect();t.style.left=`${r.left+n.left+n.width/2}px`,t.style.top=`${r.top+n.top-8}px`,t.style.transform="translate(-50%, -100%)";let d="";o&&(d+=`<button class="vx-tb-btn" data-action="edit-text" title="Edit text">
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
      <span>AI</span></button>`;let p=Ut(s,e.classList);t.innerHTML=`<div class="vx-tb-label">${p}</div><div class="vx-tb-actions">${d}</div>`,t.classList.add("vx-tb-visible"),t.querySelectorAll("[data-action]").forEach(c=>{c.addEventListener("click",u=>{u.stopPropagation(),Vn(c.dataset.action,e)})})}function xe(){let e=document.getElementById("vx-context-toolbar");e&&e.classList.remove("vx-tb-visible")}function Ut(e,t){return{H1:"Heading 1",H2:"Heading 2",H3:"Heading 3",H4:"Heading 4",H5:"Heading 5",H6:"Heading 6",P:"Text",SPAN:"Text",A:"Link",IMG:"Image",VIDEO:"Video",BUTTON:"Button",INPUT:"Input",UL:"List",OL:"Numbered List",LI:"List Item",NAV:"Navigation",HEADER:"Header",FOOTER:"Footer",SECTION:"Section",DIV:"Block",MAIN:"Main",ARTICLE:"Article",ASIDE:"Sidebar",FORM:"Form",TABLE:"Table",SVG:"Icon",I:"Icon",BLOCKQUOTE:"Quote"}[e]||e.toLowerCase()}function Vn(e,t){switch(e){case"edit-text":Y({type:"vx-editor:start-edit",mode:"text"}),xe();break;case"swap-image":bo(t);break;case"edit-style":Gn(t);break;case"edit-link":xo(t);break;case"delete":Wn(t);break;case"ask-ai":go(t);break}}function Wn(e){xe();let t=Ut(e.tagName,e.classList),s=(e.text||"").substring(0,60),n=document.createElement("div");n.className="vx-modal-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.innerHTML=`
    <div class="vx-modal vx-modal-sm">
      <div class="vx-modal-header"><span>Delete ${t}?</span>
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let o=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",i),setTimeout(()=>n.remove(),200)},i=a=>{a.key==="Escape"&&(a.preventDefault(),o())};n.addEventListener("keydown",i),n.querySelectorAll("[data-close]").forEach(a=>a.addEventListener("click",o)),n.addEventListener("click",a=>{a.target===n&&o()}),n.tabIndex=-1,n.focus(),document.getElementById("vx-delete-confirm").addEventListener("click",()=>{Y({type:"vx-editor:delete-element"}),o()})}var pe=new Set,st="",$e=null,zt="text",Ae="padding",He="all",nt="all",Pe="tl",ot="",Oe=!1;function Se({revertUnsaved:e=!0}={}){e&&Oe&&st&&(Y({type:"vx-editor:update-classes",classes:st.split(" ").filter(Boolean),silent:!0}),pe=new Set(st.split(" ").filter(Boolean)));let t=document.getElementById("vx-style-panel");t&&(typeof t.__vxOnResize=="function"&&window.removeEventListener("resize",t.__vxOnResize),typeof t.__vxDestroyDrag=="function"&&t.__vxDestroyDrag(),t.classList.remove("vx-sp-visible"),setTimeout(()=>t.remove(),200)),Oe=!1,$e=null,zt="text",Ae="padding",He="all",nt="all",Pe="tl",ot=""}function Gn(e){xe(),Se();let t=(e.classList||[]).filter(o=>o.trim());pe=new Set(t),st=t.join(" "),Oe=!1,$e=null,zt=Eo(t),Ae="padding",He="all",nt="all",Pe="tl",ot="";let s=document.createElement("div");s.id="vx-style-panel",s.className="vx-style-panel",s.tabIndex=-1;let n=[{id:"typography",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/></svg>',tip:"Typography"},{id:"spacing",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M19 3v18"/><path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>',tip:"Spacing"},{id:"colors",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',tip:"Colors"},{id:"layout",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',tip:"Layout"},{id:"borders",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',tip:"Borders"},{id:"effects",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m13.9 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>',tip:"Effects"},{id:"classes",icon:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',tip:"All Classes"}];s.innerHTML=`
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
      ${us()}
    </div>
    <div class="vx-sp-body" id="vx-sp-body"></div>
    <div class="vx-sp-footer">
      <button class="vx-sp-reset vx-sp-footer-btn" id="vx-style-reset">Reset</button>
      <button class="vx-sp-apply vx-sp-footer-btn" id="vx-style-apply"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Apply & Compile</button>
    </div>`,document.body.appendChild(s),qt(s),s.__vxOnResize=()=>qt(s),window.addEventListener("resize",s.__vxOnResize),requestAnimationFrame(()=>s.classList.add("vx-sp-visible")),s.__vxDestroyDrag=Zs(s,s.querySelector("#vx-sp-drag-handle")),s.focus(),s.querySelector("#vx-sp-nav").addEventListener("click",o=>{let i=o.target.closest("[data-tab]");i&&(s.querySelectorAll(".vx-sp-seg").forEach(a=>a.classList.remove("vx-sp-seg-active")),i.classList.add("vx-sp-seg-active"),$e=null,he(i.dataset.tab))}),s.querySelector("#vx-style-close").addEventListener("click",()=>Se()),s.addEventListener("keydown",o=>{o.key==="Escape"&&(o.preventDefault(),Se())}),s.querySelector("#vx-style-reset").addEventListener("click",()=>{pe=new Set(st.split(" ").filter(Boolean)),Oe=!1,Y({type:"vx-editor:update-classes",classes:[...pe],silent:!0}),he(ms())}),s.querySelector("#vx-style-apply").addEventListener("click",()=>mo(e)),s.querySelector("#vx-sp-breakpoints").addEventListener("click",o=>{let i=o.target.closest("[data-bp]");i&&(ot=i.dataset.bp||"",s.querySelector("#vx-sp-breakpoints").innerHTML=us(),he(ms()))}),he("typography")}function us(){return[{id:"",label:"Base",tip:"No breakpoint"},{id:"sm",label:"sm",tip:"\u2265640px"},{id:"md",label:"md",tip:"\u2265768px"},{id:"lg",label:"lg",tip:"\u22651024px"},{id:"xl",label:"xl",tip:"\u22651280px"},{id:"2xl",label:"2xl",tip:"\u22651536px"}].map(t=>{let s=ot===t.id,n=t.id?[...pe].some(o=>o.startsWith(t.id+":")):!0;return`<button class="vx-sp-bp${s?" vx-sp-bp-active":""}" data-bp="${t.id}" title="${t.tip}">
      ${t.label}${n&&t.id?'<span class="vx-sp-bp-dot"></span>':""}
    </button>`}).join("")}function ms(){var e;return((e=document.querySelector(".vx-sp-seg-active"))==null?void 0:e.dataset.tab)||"typography"}function he(e){let t=document.getElementById("vx-sp-body");if(!t)return;let s={typography:Kn,spacing:Yn,colors:Zn,layout:Xn,borders:Jn,effects:Qn,classes:eo};t.innerHTML=(s[e]||s.classes)(),uo(t)}function Kn(){let e=ae(/^font-(sans|serif|mono)$/)||"",t=ae(/^text-(xs|sm|base|lg|xl|[2-9]xl)$/)||"text-base",s=ae(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)||"font-normal",n=ae(/^text-(left|center|right|justify)$/)||"text-left",o=ae(/^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$/)||"leading-normal",i=ae(/^tracking-(tighter|tight|normal|wide|wider|widest)$/)||"tracking-normal",a=ae(/^(normal-case|uppercase|lowercase|capitalize)$/)||"normal-case",r=ae(/^(no-underline|underline|line-through)$/)||"no-underline";return`
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ce("Font","^font-(sans|serif|mono)$",e,[{label:"Default",value:""},{label:"Sans",value:"font-sans"},{label:"Serif",value:"font-serif"},{label:"Mono",value:"font-mono"}])}
        ${ce("Size","^text-(xs|sm|base|lg|xl|[2-9]xl)$",t,re.sizes.map(d=>({label:d,value:`text-${d}`})))}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2">
        ${ce("Weight","^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$",s,re.weights.map(d=>({label:d,value:`font-${d}`})))}
        <div class="vx-sp-control">
          <label class="vx-sp-field-label">Align</label>
          ${to(re.aligns.map(d=>({value:`text-${d}`,label:d,icon:lo(d)})),n,"^text-(left|center|right|justify)$")}
        </div>
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-grid-2 vx-sp-grid-compact">
        ${ce("Leading","^leading-(none|tight|snug|normal|relaxed|loose|3|4|5|6|7|8|9|10)$",o,re.leadings.map(d=>({label:d,value:`leading-${d}`})))}
        ${ce("Tracking","^tracking-(tighter|tight|normal|wide|wider|widest)$",i,re.trackings.map(d=>({label:d,value:`tracking-${d}`})))}
        ${ce("Case","^(normal-case|uppercase|lowercase|capitalize)$",a,re.transforms.map(d=>({label:d,value:d})))}
        ${ce("Decoration","^(no-underline|underline|line-through)$",r,re.decorations.map(d=>({label:d,value:d})))}
      </div>
    </div>
  `}function Yn(){let e={padding:{label:"Padding",sides:["all","x","y","t","r","b","l"],prefixes:{all:"p",x:"px",y:"py",t:"pt",r:"pr",b:"pb",l:"pl"}},margin:{label:"Margin",sides:["all","x","y","t","r","b","l"],prefixes:{all:"m",x:"mx",y:"my",t:"mt",r:"mr",b:"mb",l:"ml"}},gap:{label:"Gap",sides:["all","x","y"],prefixes:{all:"gap",x:"gap-x",y:"gap-y"}}};e[Ae]||(Ae="padding"),e[Ae].prefixes[He]||(He="all");let t=e[Ae],s=t.prefixes[He],n=oo(s),o=ao(s)||"",i=Ae==="margin";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Property</label>
      ${Ys(Object.keys(e).map(a=>({value:a,label:e[a].label})),Ae,"data-space-mode",3)}
    </div>
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Target Side</label>
      <div class="vx-side-picker">
        ${t.sides.map(a=>`
          <button class="vx-side-btn${He===a?" vx-side-btn-active":""}" data-space-side="${a}" title="${Fs(a)}">
            ${ro(a)}
          </button>
        `).join("")}
      </div>
    </div>
    <div class="vx-sp-section">
      <div class="vx-sp-value-header">
        <span class="vx-sp-field-label">Value</span>
        <span class="vx-sp-value-readout">${t.label} ${Fs(He)}: ${o||"none"}</span>
      </div>
      <div class="vx-value-strip">
        ${re.compactSpacings.map(a=>{let r=`${s}-${a}`;return`<button class="vx-sp-pill vx-sp-pill-compact${it(r)?" vx-sp-pill-active":""}" data-set="${r}" data-pattern="${n}" data-toggle="false">${a}</button>`}).join("")}
        ${i?`<button class="vx-sp-pill vx-sp-pill-compact${it(`${s}-auto`)?" vx-sp-pill-active":""}" data-set="${s}-auto" data-pattern="${n}" data-toggle="false">auto</button>`:""}
      </div>
    </div>
  `}function Zn(){let e=[{id:"text",label:"Text"},{id:"bg",label:"Bg"},{id:"border",label:"Border"}],t=zt||"text",s=t,n=io(s),o=`<div class="vx-sp-section">
    <div class="vx-sp-color-props">${e.map(a=>`<button class="vx-sp-cprop${a.id===t?" vx-sp-cprop-active":""}" data-cprop="${a.id}">${a.label}</button>`).join("")}</div>
  </div>`;o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Special</div>
    <div class="vx-sp-color-specials">${re.specialColors.map(a=>{let r=`${s}-${a.name}`,d=a.hex==="transparent"?"background:repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 50%/8px 8px":`background:${a.hex}`,p=a.name==="white"?";border:1px solid #e5e7eb":"";return`<button class="vx-sp-color-dot${it(r)?" vx-sp-dot-active":""}" data-set="${r}" data-pattern="${n}" style="${d}${p}" title="${a.name}"></button>`}).join("")}</div>
  </div>`;let i=$e?re.colors.find(a=>a.name===$e):null;return o+=`<div class="vx-sp-section">
    <div class="vx-sp-section-title">Palette</div>
    <div class="vx-color-stage">
      ${i?`
        <div class="vx-shade-stage-header">
          <button class="vx-shade-back" data-family-back>&larr; Colors</button>
          <span class="vx-shade-title">${i.name}</span>
        </div>
        <div class="vx-shade-grid">${Object.entries(i.shades).map(([a,r])=>{let d=`${s}-${i.name}-${a}`;return`<button class="vx-sp-shade${it(d)?" vx-sp-shade-active":""}" data-set="${d}" data-pattern="${n}" data-toggle="false" style="background:${r}" title="${a}"><span class="vx-sp-shade-num">${a}</span></button>`}).join("")}</div>
      `:`
        <div class="vx-sp-color-families">${re.colors.map(a=>{let r=$e===a.name,d=ae(new RegExp(`^${s}-${a.name}-\\d+$`));return`<button class="vx-sp-color-family${r?" vx-sp-fam-active":""}${d?" vx-sp-fam-used":""}" data-family="${a.name}" style="background:${a.shades[500]}" title="${a.name}"></button>`}).join("")}</div>
      `}
    </div>
  </div>`,o}function Xn(){let e=no(),t=ae(/^(static|relative|absolute|fixed|sticky)$/)||"static",s=e==="flex",n=e==="grid",o=t==="absolute"||t==="fixed",i=ae(/^gap(?:-[xy])?-/)||"",a=ae(/^grid-cols-\d+$/)||"",r=ae(/^grid-rows-\d+$/)||"";return`
    <div class="vx-sp-section">
      <label class="vx-sp-field-label">Display</label>
      ${so(e)}
    </div>

    ${s?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Flex Layout</div>
        <div class="vx-sp-grid-2">
          ${ce("Direction","^flex-(row|col|row-reverse|col-reverse)$",ae(/^flex-(row|col|row-reverse|col-reverse)$/)||"flex-row",[{label:"Row",value:"flex-row"},{label:"Column",value:"flex-col"},{label:"Row Rev",value:"flex-row-reverse"},{label:"Col Rev",value:"flex-col-reverse"}])}
          ${ce("Justify","^justify-(start|center|end|between|around|evenly)$",ae(/^justify-(start|center|end|between|around|evenly)$/)||"justify-start",[{label:"Start",value:"justify-start"},{label:"Center",value:"justify-center"},{label:"End",value:"justify-end"},{label:"Between",value:"justify-between"},{label:"Around",value:"justify-around"},{label:"Evenly",value:"justify-evenly"}])}
          ${ce("Align","^items-(start|center|end|stretch|baseline)$",ae(/^items-(start|center|end|stretch|baseline)$/)||"items-stretch",[{label:"Start",value:"items-start"},{label:"Center",value:"items-center"},{label:"End",value:"items-end"},{label:"Stretch",value:"items-stretch"},{label:"Baseline",value:"items-baseline"}])}
          ${ce("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"None",value:""},...re.gaps.map(d=>({label:d,value:`gap-${d}`}))])}
        </div>
      </div>
    `:""}

    ${n?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Grid Layout</div>
        <div class="vx-sp-grid-3">
          ${ce("Cols","^grid-cols-\\d+$",a,[{label:"Auto",value:""},...re.gridCols.map(d=>({label:d,value:`grid-cols-${d}`}))])}
          ${ce("Rows","^grid-rows-\\d+$",r,[{label:"Auto",value:""},...re.gridRows.map(d=>({label:d,value:`grid-rows-${d}`}))])}
          ${ce("Gap","^gap(?:-[xy])?-[\\d.]+$",i,[{label:"0",value:"gap-0"},...re.gaps.slice(1).map(d=>({label:d,value:`gap-${d}`}))])}
        </div>
      </div>
    `:""}

    <div class="vx-sp-section">
      ${ce("Position","^(static|relative|absolute|fixed|sticky)$",t,re.positions.map(d=>({label:d,value:d})))}
    </div>

    ${o?`
      <div class="vx-sp-section vx-sp-subpanel">
        <div class="vx-sp-section-title">Offset</div>
        <div class="vx-sp-grid-2">
          ${ce("Top","^top-",ae(/^top-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",re.coordinates.map(d=>({label:d,value:`top-${d}`})))}
          ${ce("Right","^right-",ae(/^right-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",re.coordinates.map(d=>({label:d,value:`right-${d}`})))}
          ${ce("Bottom","^bottom-",ae(/^bottom-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",re.coordinates.map(d=>({label:d,value:`bottom-${d}`})))}
          ${ce("Left","^left-",ae(/^left-(auto|0|0\\.5|1|2|4|6|8|10|12|16|20|24|32|40|48|64)$/)||"",re.coordinates.map(d=>({label:d,value:`left-${d}`})))}
        </div>
      </div>
    `:""}
  `}function Jn(){let e={none:"0",sm:"sm","":"base",md:"md",lg:"lg",xl:"xl","2xl":"2xl","3xl":"3xl",full:"full"},t=nt==="all"?"all":Pe;return`
    <div class="vx-sp-section vx-sp-grid-2">
      <div>
        <label class="vx-sp-field-label">Width</label>
        <div class="vx-sp-pills">${re.borderWidths.map(s=>{let n=s===""?"border":`border-${s}`;return`<button class="vx-sp-pill vx-sp-pill-compact${it(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="^border(?:-(0|2|4|8))?$" data-toggle="false">${s===""?"1":s}</button>`}).join("")}</div>
      </div>
      <div>
        ${ce("Style","^border-(solid|dashed|dotted|double|none)$",ae(/^border-(solid|dashed|dotted|double|none)$/)||"",[{label:"Default",value:""},...re.borderStyles.map(s=>({label:s,value:`border-${s}`}))])}
      </div>
    </div>
    <div class="vx-sp-section vx-sp-subpanel">
      <div class="vx-sp-section-title">Radius</div>
      ${Ys([{value:"all",label:"All corners"},{value:"corners",label:"Individual"}],nt==="all"?"all":"corners","data-radius-mode")}
      <div class="vx-radius-widget">
        <div class="vx-radius-card">
          <button class="vx-radius-corner${Pe==="tl"?" vx-radius-corner-active":""}" data-radius-corner="tl">TL</button>
          <button class="vx-radius-corner${Pe==="tr"?" vx-radius-corner-active":""}" data-radius-corner="tr">TR</button>
          <button class="vx-radius-corner${Pe==="bl"?" vx-radius-corner-active":""}" data-radius-corner="bl">BL</button>
          <button class="vx-radius-corner${Pe==="br"?" vx-radius-corner-active":""}" data-radius-corner="br">BR</button>
          <div class="vx-radius-center">${nt==="all"?"ALL":Pe.toUpperCase()}</div>
        </div>
      </div>
      <div class="vx-value-strip">
        ${re.radii.map(s=>{let n=co(t,s);return`<button class="vx-sp-pill vx-sp-pill-compact${it(n)?" vx-sp-pill-active":""}" data-set="${n}" data-pattern="${po(t)}" data-toggle="false">${e[s]}</button>`}).join("")}
      </div>
    </div>
  `}function Qn(){let e=vo();return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">Shadow</div>
      <div class="vx-shadow-list">${[{label:"Flat",value:"shadow-none",style:"box-shadow:none"},{label:"Soft",value:"shadow-sm",style:"box-shadow:0 1px 2px rgba(0,0,0,.08)"},{label:"Base",value:"shadow",style:"box-shadow:0 4px 10px rgba(0,0,0,.12)"},{label:"Lift",value:"shadow-md",style:"box-shadow:0 10px 20px rgba(0,0,0,.16)"},{label:"High",value:"shadow-xl",style:"box-shadow:0 18px 38px rgba(0,0,0,.22)"}].map(s=>`<button class="vx-shadow-card${it(s.value)?" vx-shadow-card-active":""}" data-set="${s.value}" data-pattern="^shadow(?:-(none|sm|md|lg|xl|2xl|inner))?$" data-toggle="false">
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
  `}function eo(){return`
    <div class="vx-sp-section">
      <div class="vx-sp-section-title">All Classes</div>
      <div class="vx-sp-class-editor">
        <input type="text" class="vx-sp-class-input" id="vx-add-class" placeholder="Add class\u2026" autocomplete="off" spellcheck="false">
      </div>
      <div class="vx-sp-classes" id="vx-all-classes">
        ${[...pe].map(e=>`<span class="vx-sp-class" data-class="${e}">${e} <button class="vx-sp-class-remove">\xD7</button></span>`).join("")}
      </div>
    </div>`}function ce(e,t,s,n){return`<div class="vx-sp-control">
    <label class="vx-sp-field-label">${e}</label>
    <select class="vx-sp-select" data-select-pattern="${t}">
      ${n.map(o=>`<option value="${mt(o.value)}"${s===o.value?" selected":""}>${gt(o.label)}</option>`).join("")}
    </select>
  </div>`}function Ys(e,t,s,n){return`<div class="vx-sp-segment${n===3?" vx-sp-segment-3col":""}">
    ${e.map(i=>`<button class="vx-sp-segment-btn${i.value===t?" vx-sp-segment-btn-active":""}" ${s}="${i.value}">${gt(i.label)}</button>`).join("")}
  </div>`}function to(e,t,s){return`<div class="vx-icon-segment">
    ${e.map(n=>`
      <button class="vx-icon-segment-btn${n.value===t?" vx-icon-segment-btn-active":""}" data-set="${n.value}" data-pattern="${s}" data-toggle="false" title="${mt(n.label)}">
        ${n.icon}
      </button>
    `).join("")}
  </div>`}function so(e){let t=n=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${n}</svg>`;return`<div class="vx-display-row">
    ${[{value:"block",label:"Block",icon:t('<rect x="3" y="3" width="18" height="18" rx="2"/>')},{value:"flex",label:"Flex",icon:t('<path d="M5.5 8.5 9 12l-3.5 3.5L2 12l3.5-3.5Z"/><path d="m12 2 3.5 3.5L12 9 8.5 5.5 12 2Z"/><path d="M18.5 8.5 22 12l-3.5 3.5L15 12l3.5-3.5Z"/><path d="m12 15 3.5 3.5L12 22l-3.5-3.5L12 15Z"/>')},{value:"grid",label:"Grid",icon:t('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')},{value:"inline",label:"Inline",icon:t('<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>')},{value:"hidden",label:"Hide",icon:t('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><line x1="2" y1="2" x2="22" y2="22"/>')}].map(n=>`
      <button class="vx-display-btn${e===n.value?" vx-display-btn-active":""}" data-set="${n.value}" data-pattern="^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$" data-toggle="false">
        <span class="vx-display-icon">${n.icon}</span>
        <span class="vx-display-label">${n.label}</span>
      </button>
    `).join("")}
  </div>`}function no(){let e=ae(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)||"block";return e==="inline-flex"?"flex":e==="inline-grid"?"grid":e==="inline-block"?"block":e}function oo(e){return e==="gap"?"^gap(?:-[xy])?-(?:[\\d.]+)$":e==="gap-x"?"^gap-x-(?:[\\d.]+)$":e==="gap-y"?"^gap-y-(?:[\\d.]+)$":`^${e}-(?:auto|[\\d.]+)$`}function io(e){return`^${e}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`}function ao(e){let t=ae(new RegExp(`^${e}-(auto|[\\d.]+)$`));return t?t.replace(`${e}-`,""):""}function Fs(e){return{all:"All",x:"X-Axis",y:"Y-Axis",t:"Top",r:"Right",b:"Bottom",l:"Left"}[e]||e}function ro(e){let t=s=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{all:t('<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/>'),x:t('<path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>'),y:t('<path d="M12 5v14"/><path d="m8 9 4-4 4 4"/><path d="m8 15 4 4 4-4"/>'),t:t('<path d="M12 5v14"/><path d="m18 11-6-6-6 6"/>'),r:t('<path d="M5 12h14"/><path d="m13 18 6-6-6-6"/>'),b:t('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),l:t('<path d="M5 12h14"/><path d="m11 18-6-6 6-6"/>')}[e]||e}function lo(e){let t=s=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`;return{left:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>'),center:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>'),right:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>'),justify:t('<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>')}[e]||e}function co(e,t){let s=t===""?"":`-${t}`;if(e==="all")return t===""?"rounded":`rounded${s}`;let n={tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl";return t===""?n:`${n}${s}`}function po(e){return e==="all"?"^rounded":`^${{tl:"rounded-tl",tr:"rounded-tr",br:"rounded-br",bl:"rounded-bl"}[e]||"rounded-tl"}(?:-(none|sm|md|lg|xl|2xl|3xl|full))?$`}function vo(){let e=ae(/^opacity-(\d+)$/);if(!e)return 100;let t=parseInt(e.replace("opacity-",""),10);return Number.isNaN(t)?100:Math.min(100,Math.max(0,t))}function it(e){let t=ot;return pe.has(t?t+":"+e:e)}function ps(e,t,{toggle:s=!0,rerender:n=!0}={}){let o=ot,i=o?o+":":"",a=t?new RegExp(t):null,r=e?i+e:"",d=!!r&&pe.has(r);if(a)for(let c of[...pe])if(o){if(c.startsWith(i)){let u=c.slice(i.length);a.test(u)&&pe.delete(c)}}else!/^(sm|md|lg|xl|2xl):/.test(c)&&a.test(c)&&pe.delete(c);r&&(!s||!d)&&pe.add(r),Oe=!0,Y({type:"vx-editor:update-classes",classes:[...pe],silent:!0});let p=document.getElementById("vx-sp-breakpoints");p&&(p.innerHTML=us()),n&&he(ms())}function ae(e){let t=ot;for(let s of pe)if(t){if(s.startsWith(t+":")){let n=s.slice(t.length+1);if(e.test(n))return n}}else if(!/^(sm|md|lg|xl|2xl):/.test(s)&&e.test(s))return s;return null}function uo(e){e.querySelectorAll("[data-set]").forEach(n=>{n.addEventListener("click",()=>{let o=n.dataset.set||"",i=n.dataset.pattern||"",a=n.dataset.toggle!=="false";ps(o,i,{toggle:a,rerender:!0})})}),e.querySelectorAll("[data-select-pattern]").forEach(n=>{n.addEventListener("change",()=>{let o=n.dataset.selectPattern||"",i=n.value||"";ps(i,o,{toggle:!1,rerender:!0})})}),e.querySelectorAll("[data-family]").forEach(n=>{n.addEventListener("click",()=>{$e=$e===n.dataset.family?null:n.dataset.family,he("colors")})}),e.querySelectorAll("[data-family-back]").forEach(n=>{n.addEventListener("click",()=>{$e=null,he("colors")})}),e.querySelectorAll("[data-cprop]").forEach(n=>{n.addEventListener("click",()=>{zt=n.dataset.cprop||"text",$e=null,he("colors")})}),e.querySelectorAll("[data-space-mode]").forEach(n=>{n.addEventListener("click",()=>{Ae=n.dataset.spaceMode||"padding",He="all",he("spacing")})}),e.querySelectorAll("[data-space-side]").forEach(n=>{n.addEventListener("click",()=>{He=n.dataset.spaceSide||"all",he("spacing")})}),e.querySelectorAll("[data-radius-mode]").forEach(n=>{n.addEventListener("click",()=>{nt=n.dataset.radiusMode==="corners"?"corners":"all",he("borders")})}),e.querySelectorAll("[data-radius-corner]").forEach(n=>{n.addEventListener("click",()=>{Pe=n.dataset.radiusCorner||"tl",nt="corners",he("borders")})});let t=e.querySelector("#vx-opacity-slider");if(t){let n=()=>{let i=String(t.value||"100"),a=e.querySelector("#vx-opacity-val");a&&(a.textContent=i)},o=()=>{let i=String(t.value||"100");ps(`opacity-${i}`,"^opacity-(\\d+)$",{toggle:!1,rerender:!1}),n()};t.addEventListener("input",o),t.addEventListener("change",()=>he("effects"))}let s=e.querySelector("#vx-add-class");s&&s.addEventListener("keydown",n=>{n.key==="Enter"&&s.value.trim()&&(n.preventDefault(),s.value.trim().split(/\s+/).forEach(i=>{pe.add(i)}),Oe=!0,Y({type:"vx-editor:update-classes",classes:[...pe],silent:!0}),s.value="",he("classes"))}),e.addEventListener("click",n=>{if(n.target.classList.contains("vx-sp-class-remove")){let o=n.target.closest(".vx-sp-class");if(o){let i=o.dataset.class;pe.delete(i),Oe=!0,Y({type:"vx-editor:update-classes",classes:[...pe],silent:!0}),o.remove()}}})}async function mo(e){let t=[...pe].join(" ");if(t===st){Se({revertUnsaved:!1});return}et.push({type:"text",filePath:e.filePath,originalHTML:`class="${st}"`,newHTML:`class="${t}"`,timestamp:Date.now()}),Oe=!1,Se({revertUnsaved:!1}),ie("Saving & compiling\u2026"),await Tt(),Y({type:"vx-editor:update-classes",classes:[...pe],silent:!0}),setTimeout(()=>{let s=document.getElementById("preview-iframe");s&&s.contentWindow&&s.contentWindow.postMessage("voxelsite:reload","*")},500)}function Zs(e,t){let s=!1,n,o,i,a,r=!1,d=u=>{if(u.target.closest("button, input, select"))return;s=!0;let l=u.touches?u.touches[0]:u;n=l.clientX,o=l.clientY;let m=e.getBoundingClientRect();i=m.left,a=m.top,t.style.cursor="grabbing",u.preventDefault(),r||(r=!0,document.addEventListener("mousemove",p),document.addEventListener("touchmove",p,{passive:!1}),document.addEventListener("mouseup",c),document.addEventListener("touchend",c))},p=u=>{if(!s)return;let l=u.touches?u.touches[0]:u,m=12,h=e.getBoundingClientRect(),g=h.width||300,b=h.height||500,f=i+l.clientX-n,v=a+l.clientY-o,C=m,k=Math.max(m,window.innerWidth-g-m),M=52,D=Math.max(M,window.innerHeight-b-m),z=Math.min(Math.max(f,C),k),q=Math.min(Math.max(v,M),D);e.style.left=`${z}px`,e.style.top=`${q}px`,e.style.right="auto"},c=()=>{s&&(s=!1,t.style.cursor="",r&&(r=!1,document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c)))};return t.addEventListener("mousedown",d),t.addEventListener("touchstart",d,{passive:!1}),()=>{t.removeEventListener("mousedown",d),t.removeEventListener("touchstart",d),r&&(document.removeEventListener("mousemove",p),document.removeEventListener("touchmove",p),document.removeEventListener("mouseup",c),document.removeEventListener("touchend",c))}}var je=null;function tt(){let e=document.getElementById("vx-ai-panel");e&&(je&&(je.abort(),je=null),typeof e.__vxDestroyDrag=="function"&&e.__vxDestroyDrag(),typeof e.__vxOnResize=="function"&&window.removeEventListener("resize",e.__vxOnResize),e.classList.remove("vx-ai-visible"),setTimeout(()=>e.remove(),180))}function go(e){xe(),Se(),tt();let t=Ut(e.tagName,e.classList),s=(e.text||"").substring(0,80).replace(/\s+/g," ").trim(),n=document.createElement("div");n.id="vx-ai-panel",n.className="vx-ai-panel",n.tabIndex=-1,n.innerHTML=`
    <div class="vx-ai-header" id="vx-ai-drag-handle">
      <div class="vx-ai-header-left">
        <svg class="vx-ai-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span class="vx-ai-title">Edit ${gt(t)}</span>
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
    </div>`,document.body.appendChild(n),qt(n),n.__vxOnResize=()=>qt(n),window.addEventListener("resize",n.__vxOnResize),requestAnimationFrame(()=>n.classList.add("vx-ai-visible")),n.__vxDestroyDrag=Zs(n,n.querySelector("#vx-ai-drag-handle"));let o=n.querySelector("#vx-ai-input"),i=n.querySelector("#vx-ai-send"),a=n.querySelector("#vx-ai-cancel-btn"),r=n.querySelector("#vx-ai-status"),d=n.querySelector("#vx-ai-status-text"),p=n.querySelector("#vx-ai-close");setTimeout(()=>o==null?void 0:o.focus(),200),p.addEventListener("click",()=>tt()),n.addEventListener("keydown",m=>{m.key==="Escape"&&(m.preventDefault(),tt())}),o.addEventListener("keydown",m=>{m.key==="Enter"&&!m.shiftKey&&(m.preventDefault(),l())}),i.addEventListener("click",l),a.addEventListener("click",()=>{je&&(je.abort(),je=null),u()});function c(){o.disabled=!0,i.hidden=!0,a.hidden=!1,r.hidden=!1,d.textContent="Reading your site\u2026"}function u(){o.disabled=!1,i.hidden=!1,a.hidden=!0,r.hidden=!0,o.focus()}async function l(){let m=o.value.trim();if(!m)return;tt(),Y({type:"vx-editor:show-ai-overlay",status:"AI is editing\u2026"}),je=new AbortController;let h=e.outerHTML||"",g=e.filePath||Ot();try{await Qe("/ai/prompt",{user_prompt:m,action_type:"section_edit",page_scope:g,action_data:{path:g,sectionHtml:h.substring(0,15e3)}},{signal:je.signal,onStatus(b){Y({type:"vx-editor:update-ai-status",status:b||"Working\u2026"})},onFile(){Y({type:"vx-editor:update-ai-status",status:"Applying changes\u2026"})},onToken(){Y({type:"vx-editor:update-ai-status",status:"Generating\u2026"})},onError(b){Y({type:"vx-editor:hide-ai-overlay"}),ie(b.message||"AI edit failed",!0)},onDone(b){if(je=null,Y({type:"vx-editor:hide-ai-overlay"}),b.cancelled){ie("Generation cancelled",!1);return}(b.files_modified||[]).length>0?(ie("Section updated \u2713"),setTimeout(()=>{let v=document.getElementById("preview-iframe");v!=null&&v.contentWindow&&v.contentWindow.postMessage("voxelsite:reload","*")},400)):b.partial||ie("No changes made",!1)},onWarning(b){typeof window.showToast=="function"&&window.showToast(b,"warning")}})}catch(b){b.name!=="AbortError"&&ie("AI edit failed",!0),Y({type:"vx-editor:hide-ai-overlay"})}}}var qs=[{id:"hero",label:"Hero",description:"Bold headline, subtitle, and call-to-action",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>'},{id:"features",label:"Features",description:"Feature cards with icons or images",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>'},{id:"about",label:"About",description:"Story, mission, or biography section",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'},{id:"testimonials",label:"Testimonials",description:"Customer reviews and social proof",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1"/></svg>'},{id:"team",label:"Team",description:"Team member cards with photos",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'},{id:"pricing",label:"Pricing",description:"Pricing plans, packages, or menu",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'},{id:"faq",label:"FAQ",description:"Frequently asked questions",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'},{id:"cta",label:"Call to Action",description:"Conversion-focused banner",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>'},{id:"gallery",label:"Gallery",description:"Image or project showcase",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>'},{id:"contact",label:"Contact",description:"Contact details, map, or form",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>'},{id:"stats",label:"Stats",description:"Key figures, counters, or metrics",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>'},{id:"content",label:"Content",description:"Rich text, article, or story block",icon:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'}];function ho(e){xe(),Se(),tt();let t=(e.existingSections||"").toLowerCase(),s=new Set;for(let f of qs)(t.includes(f.id)||t.includes(f.label.toLowerCase()))&&s.add(f.id);let n=document.createElement("div");n.className="vx-modal-overlay vx-section-picker-overlay",n.setAttribute("role","dialog"),n.setAttribute("aria-modal","true"),n.setAttribute("aria-label","Add section");let o=e.insertAfterIndex===-1?"at the top of the page":`after section ${e.insertAfterIndex+1} of ${e.totalSections}`;n.innerHTML=`
    <div class="vx-modal vx-section-picker">
      <div class="vx-section-picker-header">
        <div class="vx-section-picker-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Add Section</span>
        </div>
        <div class="vx-section-picker-meta">${gt(o)}</div>
        <button class="vx-modal-close" data-close aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="vx-section-picker-grid">
        ${qs.map(f=>{let v=s.has(f.id);return`
            <button class="vx-section-card${v?" vx-section-card-exists":""}" data-section-type="${f.id}" data-section-label="${mt(f.label)}" data-section-desc="${mt(f.description)}">
              <div class="vx-section-card-icon">${f.icon}</div>
              <div class="vx-section-card-label">${f.label}</div>
              <div class="vx-section-card-desc">${f.description}</div>
              ${v?'<div class="vx-section-card-badge">On page</div>':""}
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
    </div>`,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("vx-modal-visible"));let i=()=>{n.classList.remove("vx-modal-visible"),n.removeEventListener("keydown",a),setTimeout(()=>n.remove(),200)},a=f=>{f.key==="Escape"&&i()};n.addEventListener("keydown",a),n.querySelector("[data-close]").addEventListener("click",i),n.addEventListener("click",f=>{f.target===n&&i()}),n.tabIndex=-1,n.focus();let r=null,d=null,p=n.querySelector("#vx-section-footer"),c=n.querySelector("#vx-section-footer-type"),u=n.querySelector("#vx-section-instruction"),l=n.querySelector("#vx-section-generate"),m=n.querySelector("#vx-section-change"),h=n.querySelector(".vx-section-picker-grid"),g={Hero:'e.g. "with a background image and two CTAs"',Features:'e.g. "3 features with icons"',About:'e.g. "about our 20-year history in sustainable farming"',Testimonials:'e.g. "3 customer quotes with star ratings"',Team:'e.g. "4 team members with photos and roles"',Pricing:'e.g. "3 tiers: starter, pro, enterprise"',FAQ:'e.g. "5 questions about our delivery process"',"Call to Action":'e.g. "book a free consultation"',Gallery:'e.g. "6 project photos in a masonry grid"',Contact:'e.g. "with a contact form and office address"',Stats:'e.g. "4 key numbers: years, clients, projects, awards"',Content:'e.g. "about our sustainability practices"'};n.querySelectorAll(".vx-section-card").forEach(f=>{f.addEventListener("click",()=>{r=f.dataset.sectionLabel,d=f.dataset.sectionDesc,n.querySelectorAll(".vx-section-card").forEach(v=>v.classList.remove("vx-section-card-selected")),f.classList.add("vx-section-card-selected"),c.textContent=r,u.placeholder=g[r]||"Optional: describe what you want\u2026",u.value="",p.hidden=!1,h.classList.add("vx-section-grid-collapsed"),setTimeout(()=>u.focus(),100)})}),m.addEventListener("click",()=>{r=null,d=null,p.hidden=!0,h.classList.remove("vx-section-grid-collapsed"),n.querySelectorAll(".vx-section-card").forEach(f=>f.classList.remove("vx-section-card-selected"))});let b=()=>{if(!r)return;let f=u.value.trim();i(),fo(e,r,d,f)};l.addEventListener("click",b),u.addEventListener("keydown",f=>{f.key==="Enter"&&(f.preventDefault(),b())})}async function fo(e,t,s,n=""){Y({type:"vx-editor:show-ai-overlay",status:`Adding ${t}\u2026`});let o=e.filePath||Ot(),i=new AbortController,a=`Add a ${t} section to this page.`;n&&(a+=` ${n}`);let r=Date.now(),d=0,p=()=>{if(d>0){let m=d.toLocaleString();Y({type:"vx-editor:update-ai-status",status:`Generating ${t}\u2026 (${m} tokens)`})}else Math.round((Date.now()-r)/1e3)>=6&&Y({type:"vx-editor:update-ai-status",status:`Preparing ${t}\u2026`})},c=setInterval(p,1e3),u=0,l=e.insertAfterIndex===-1?0:e.insertAfterIndex+1;try{await Qe("/ai/prompt",{user_prompt:a,action_type:"add_section",page_scope:o,action_data:{path:o,sectionType:t,sectionDescription:s,insertPosition:e.insertAfterIndex===-1?"At the very beginning of the main content, before the first section":`After section ${e.insertAfterIndex+1}`,existingSections:e.existingSections||""}},{signal:i.signal,onStatus(m){Y({type:"vx-editor:update-ai-status",status:m||`Adding ${t}\u2026`})},onFile(){Y({type:"vx-editor:update-ai-status",status:"Writing files\u2026"})},onToken(){d++;let m=Date.now();m-u>500&&(u=m,p())},onError(m){clearInterval(c),Y({type:"vx-editor:hide-ai-overlay"}),ie(m.message||"Failed to add section",!0)},onDone(m){if(clearInterval(c),Y({type:"vx-editor:hide-ai-overlay"}),m.cancelled){ie("Generation cancelled",!1);return}(m.files_modified||[]).length>0?(ie(`${t} added \u2713`),setTimeout(()=>{let g=document.getElementById("preview-iframe");g!=null&&g.contentWindow&&g.contentWindow.postMessage("voxelsite:reload","*"),setTimeout(()=>{Y({type:"vx-editor:toggle",active:!0}),setTimeout(()=>{Y({type:"vx-editor:scroll-to-section",sectionIndex:l}),Y({type:"vx-editor:rebuild-section-dividers"})},200)},800)},400)):m.partial||ie("No changes made",!1)},onWarning(m){typeof window.showToast=="function"&&window.showToast(m,"warning")}})}catch(m){clearInterval(c),m.name!=="AbortError"&&ie("Failed to add section",!0),Y({type:"vx-editor:hide-ai-overlay"})}}function bo(e){xe();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal"><div class="vx-modal-header"><span>Choose Image</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body"><div class="vx-img-grid" id="vx-img-grid"><div class="vx-img-loading">Loading assets\u2026</div></div></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelector("[data-close]").addEventListener("click",s),t.addEventListener("click",o=>{o.target===t&&s()}),t.tabIndex=-1,t.focus(),yo(t)}async function yo(e){let t=e.querySelector("#vx-img-grid");try{let s=await T.get("/assets");if(!s.ok){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p class="vx-img-empty-title">Failed to load assets</p>
        <p class="vx-img-empty-desc">Check the browser console for details.</p>
      </div>`;return}let n=(s.data.assets||[]).filter(o=>/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(o.path));if(!n.length){t.innerHTML=`<div class="vx-img-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p class="vx-img-empty-title">No images yet</p>
        <p class="vx-img-empty-desc">Upload images in the Assets tab first.</p>
      </div>`;return}t.innerHTML=n.map(o=>{let i=o.thumbnail||o.path;return`<button class="vx-img-item" data-path="${o.path}"><img src="${i}" alt="" loading="lazy"><span class="vx-img-name">${(o.filename||o.path).split("/").pop()}</span></button>`}).join(""),t.querySelectorAll(".vx-img-item").forEach(o=>{o.addEventListener("click",()=>{Y({type:"vx-editor:swap-image",src:o.dataset.path}),e.classList.remove("vx-modal-visible"),setTimeout(()=>e.remove(),200)})})}catch{t.innerHTML=`<div class="vx-img-empty">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p class="vx-img-empty-title">Failed to load assets</p>
    <p class="vx-img-empty-desc">Check the browser console for details.</p>
  </div>`}}function xo(e){xe();let t=document.createElement("div");t.className="vx-modal-overlay",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.innerHTML=`<div class="vx-modal vx-modal-sm"><div class="vx-modal-header"><span>Edit Link</span>
    <button class="vx-modal-close" data-close><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
    <div class="vx-modal-body">
      <div class="vx-form-group"><label class="vx-form-label">URL</label><input type="text" class="vx-form-input" id="vx-link-href" value="${mt(e.href||"")}" placeholder="https://\u2026 or /page" spellcheck="false"></div>
      <div class="vx-form-group"><label class="vx-form-label">Text</label><input type="text" class="vx-form-input" id="vx-link-text" value="${mt(e.text||"")}" placeholder="Link text"></div>
    </div>
    <div class="vx-modal-footer"><button class="vx-btn-secondary" data-close>Cancel</button><button class="vx-btn-primary" id="vx-link-save">Save</button></div></div>`,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("vx-modal-visible"));let s=()=>{t.classList.remove("vx-modal-visible"),t.removeEventListener("keydown",n),setTimeout(()=>t.remove(),200)},n=o=>{o.key==="Escape"&&s()};t.addEventListener("keydown",n),t.querySelectorAll("[data-close]").forEach(o=>o.addEventListener("click",s)),t.addEventListener("click",o=>{o.target===t&&s()}),document.getElementById("vx-link-save").addEventListener("click",()=>{Y({type:"vx-editor:update-link",href:document.getElementById("vx-link-href").value.trim(),text:document.getElementById("vx-link-text").value.trim()}),s()}),setTimeout(()=>{var o;return(o=document.getElementById("vx-link-href"))==null?void 0:o.focus()},100)}async function wo(e){let{filePath:t,oldSrc:s,newSrc:n,alt:o}=e,i=t||Ot();try{let a=await T.get(`/files/content?path=${encodeURIComponent(i)}`);if(!a.ok){console.warn("[VX] Cannot read file for image save:",i),ie("Save failed",!0);return}let r=a.data.content,d=!1,p=`src="${s}"`;if(r.includes(p)&&(r=r.replace(p,`src="${n}"`),d=!0),!d&&r.includes(s)&&(r=r.replace(s,n),d=!0),!d&&o){let u=Us(r,o,n);u!==!1&&(r=u,d=!0)}if(d){(await T.put("/files/content",{path:i,content:r})).ok?ie("Saved"):ie("Save failed",!0);return}let c=await T.get("/files");if(c.ok){let u=(c.data.files||[]).filter(l=>l.path.endsWith(".php")&&l.path!==i);for(let l of u){let m=await T.get(`/files/content?path=${encodeURIComponent(l.path)}`);if(!m.ok||!m.data.content)continue;let h=m.data.content;if(h.includes(p)&&(h=h.replace(p,`src="${n}"`),(await T.put("/files/content",{path:l.path,content:h})).ok)){ie(`Saved \u2192 ${l.path.split("/").pop()}`);return}if(h.includes(s)&&(h=h.replace(s,n),(await T.put("/files/content",{path:l.path,content:h})).ok)){ie(`Saved \u2192 ${l.path.split("/").pop()}`);return}if(o){let g=Us(h,o,n);if(g!==!1&&(await T.put("/files/content",{path:l.path,content:g})).ok){ie(`Saved \u2192 ${l.path.split("/").pop()}`);return}}}}console.warn("[VX] Image src not found in any source file. oldSrc:",s,"alt:",o),ie("Save failed \u2014 source not found",!0)}catch(a){console.error("[VX] Image save error:",a),ie("Save failed",!0)}}function Us(e,t,s){let n=e.split("<img");for(let o=1;o<n.length;o++){let i=n[o];if(!i.includes(`alt="${t}"`)&&!i.includes(`alt='${t}'`))continue;let a=i.indexOf("src=");if(a===-1)continue;let r=i[a+4];if(r!=='"'&&r!=="'")continue;let d=a+5,p=i.indexOf(r,d);if(p!==-1)return n[o]=i.substring(0,d)+s+i.substring(p),n.join("<img")}return!1}function gs(e){et.push({type:"text",filePath:e.filePath,originalHTML:e.originalHTML,newHTML:e.newHTML,timestamp:Date.now()}),clearTimeout(gs._timer),gs._timer=setTimeout(()=>Tt(),800)}function hs(e){et.push({type:"delete",filePath:e.filePath,outerHTML:e.outerHTML,timestamp:Date.now()}),clearTimeout(hs._timer),hs._timer=setTimeout(()=>Tt(),300)}async function Tt(){var t;if(cs||et.length===0)return;cs=!0;let e=[...et];et=[];try{let s={};for(let i of e){let a=i.filePath||Ot();s[a]||(s[a]=[]),s[a].push(i)}let n=!1,o={filesByMain:new Map,contentByPath:new Map};for(let[i,a]of Object.entries(s))try{let r=await T.get(`/files/content?path=${encodeURIComponent(i)}`);if(!r.ok){console.error("[VX] Cannot read:",i);continue}let d=r.data.content,p=!1;for(let c of a){let u=c.type==="delete"?c.outerHTML:c.originalHTML;if(u)if(d.includes(u))d=c.type==="delete"?d.replace(u,""):d.replace(u,c.newHTML),p=!0;else{if(await ko(i,c,o)){n=!0;continue}console.warn("[VX] Not found in source:",u.substring(0,80))}}if(p){let c=await T.put("/files/content",{path:i,content:d});c.ok?(ie("Saved"),(t=c.data)!=null&&t.tailwindCompiled&&(n=!0)):ie("Save failed",!0)}}catch(r){console.error("[VX] Save error:",r),ie("Save failed",!0)}n&&setTimeout(()=>{let i=document.getElementById("preview-iframe");i!=null&&i.contentWindow&&i.contentWindow.postMessage("voxelsite:reload-css","*")},300)}finally{cs=!1,et.length>0&&setTimeout(()=>Tt(),0)}}async function ko(e,t,s=null){let n=t.type==="delete"?t.outerHTML:t.originalHTML,o=["partials","includes","components","layouts","sections","blocks"],i=s||{filesByMain:new Map,contentByPath:new Map};try{let a=i.filesByMain.get(e);if(!a){let r=await T.get("/files");if(!r.ok)return!1;a=(r.data.files||[]).filter(d=>d.path.endsWith(".php")&&d.path!==e).filter(d=>o.some(p=>d.path.includes(p+"/"))||d.path.includes("partial")||d.path.includes("header")||d.path.includes("footer")||d.path.includes("nav")),i.filesByMain.set(e,a)}for(let r of a){let d=i.contentByPath.get(r.path);if(d==null){let p=await T.get(`/files/content?path=${encodeURIComponent(r.path)}`);if(!p.ok||!p.data.content)continue;d=p.data.content,i.contentByPath.set(r.path,d)}if(d.includes(n)){let p=t.type==="delete"?d.replace(n,""):d.replace(n,t.newHTML);if((await T.put("/files/content",{path:r.path,content:p})).ok)return i.contentByPath.set(r.path,p),ie(`Saved \u2192 ${r.path.split("/").pop()}`),!0}}}catch(a){console.error("[VX] Partial search error:",a)}return!1}function Xs(){let e=document.getElementById("btn-visual-editor");e&&(e.classList.toggle("vx-editor-active",Le),e.title=Le?"Exit visual editor (V)":"Visual editor (V)"),document.body.classList.toggle("vx-editing",Le)}function ie(e,t=!1){if(typeof window.showToast=="function"){window.showToast(e,t?"error":"success",2e3);return}let s=document.getElementById("vx-save-indicator");s||(s=document.createElement("div"),s.id="vx-save-indicator",s.className="vx-save-indicator",document.body.appendChild(s)),s.textContent=e,s.classList.toggle("vx-save-error",t),s.classList.add("vx-save-visible"),clearTimeout(ie._timer),ie._timer=setTimeout(()=>s.classList.remove("vx-save-visible"),2e3)}function Y(e){let t=document.getElementById("preview-iframe");if(t!=null&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{}}function Ot(){return window.__vsCurrentPreviewPath||"index.php"}function qt(e){let t=document.getElementById("preview-iframe"),s=e.offsetWidth||300,n=e.offsetHeight||520,o=32,i=56;if(!t){e.style.left=`${Math.max(o,window.innerWidth-s-o)}px`,e.style.top=`${Math.min(Math.max(80,i),Math.max(i,window.innerHeight-n-o))}px`;return}let a=t.getBoundingClientRect(),r=a.right-s-o,d=Math.max(o,a.left+10),p=Math.max(o,window.innerWidth-s-o),c=Math.min(Math.max(r,d),p),u=Math.max(a.top+12,i),l=Math.max(i,window.innerHeight-n-o),m=Math.min(u,l);e.style.left=`${c}px`,e.style.top=`${m}px`,e.style.right="auto"}function Eo(e){let t=(s,n)=>new RegExp(`^${n}-(white|black|transparent|[a-z]+-(50|100|200|300|400|500|600|700|800|900|950))$`).test(s);return e.some(s=>t(s,"bg"))?"bg":e.some(s=>t(s,"border"))?"border":(e.some(s=>t(s,"text")),"text")}function mt(e){return(e||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function gt(e){return(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}var E={box:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',sun:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',moon:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',user:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',send:'<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',monitor:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',tabletSmartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',smartphone:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',fileText:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',undo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',redo:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',upload:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',publish:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>',externalLink:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',camera:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',logOut:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',newChat:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',history:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronDown:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',messageCircle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',home:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',pencil:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',trash2:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',arrowUpRight:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',gripVertical:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>',plus:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',users:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',mail:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',briefcase:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',layoutGrid:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',globe:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',shoppingBag:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',book:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',star:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',folder:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>',folderOpen:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',fileCode:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>',fileJson:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>',image:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',type:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',copy:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',film:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18"/><path d="M17 3v18"/><path d="M3 7h4"/><path d="M3 11h4"/><path d="M3 15h4"/><path d="M17 7h4"/><path d="M17 11h4"/><path d="M17 15h4"/></svg>',music:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',filePdf:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',x:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',eye:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',eyeOff:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',alignLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="10" y2="10"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="14" y2="14"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',hash:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',toggleLeft:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></svg>',calendar:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',list:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',link:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',rotateCcw:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',clock:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',chevronRight:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',info:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',check:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',filePlus:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 18v-6"/></svg>',download:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',alertTriangle:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',loader:'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>',cloudOff:'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 2 20 20"/><path d="M5.782 5.782A7 7 0 0 0 3 16.5h2.5"/><path d="M21.02 16.65A5 5 0 0 0 18 7h-1.26A8 8 0 0 0 9.4 3.7"/></svg>',chevronUp:'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>'};var Js=typeof document<"u"?document.createElement("span"):null;function x(e){return e?(Js.textContent=e,Js.innerHTML):""}var Co={".php":"php",".css":"css",".json":"json",".js":"javascript",".html":"html",".htm":"html",".md":"markdown",".xml":"xml",".svg":"xml",".txt":"plaintext"};function Bt(e=""){let t=String(e||"").toLowerCase();for(let[s,n]of Object.entries(Co))if(t.endsWith(s))return n;return"plaintext"}function Lo(){let e=document.getElementById("vs-toast-container");return e||(e=document.createElement("div"),e.id="vs-toast-container",e.className="vs-toast-container",document.body.appendChild(e),e)}function j(e,t="success",s=3200){if(!e)return;let n=Lo(),o=document.createElement("div"),i=["success","error","warning"].includes(t)?t:"success";o.className=`vs-toast vs-toast-${i}`,o.innerHTML=`<span>${x(String(e))}</span>`,n.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(6px)",setTimeout(()=>o.remove(),220)},s)}window.showToast=j;function ue(e){e.classList.remove("is-visible"),setTimeout(()=>e.remove(),350)}function ye({title:e="Confirm Action",description:t="Are you sure?",confirmLabel:s="Confirm",cancelLabel:n="Cancel",danger:o=!1}){return new Promise(i=>{var c,u;let a=document.getElementById("vs-confirm-overlay");a&&a.remove();let r=document.createElement("div");r.id="vs-confirm-overlay",r.className="vs-modal-overlay",r.innerHTML=`
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
    `;let d=l=>{l.key==="Escape"&&(l.preventDefault(),p(!1))},p=l=>{document.removeEventListener("keydown",d),ue(r),i(l)};document.body.appendChild(r),requestAnimationFrame(()=>r.classList.add("is-visible")),r.addEventListener("click",l=>{l.target===r&&p(!1)}),(c=document.getElementById("vs-confirm-cancel"))==null||c.addEventListener("click",()=>p(!1)),(u=document.getElementById("vs-confirm-ok"))==null||u.addEventListener("click",()=>p(!0)),document.addEventListener("keydown",d),setTimeout(()=>{var l;return(l=document.getElementById("vs-confirm-ok"))==null?void 0:l.focus()},220)})}function xs({title:e="Enter Value",description:t="",label:s="Value",placeholder:n="",initialValue:o="",confirmLabel:i="Continue",inputType:a="text"}){return new Promise(r=>{var m,h;let d=document.getElementById("vs-prompt-overlay");d&&d.remove();let p=document.createElement("div");p.id="vs-prompt-overlay",p.className="vs-modal-overlay";let c=a==="textarea"?`<textarea id="vs-prompt-input" class="vs-input w-full" rows="4" placeholder="${x(n)}" style="resize: vertical;">${x(o)}</textarea>`:`<input id="vs-prompt-input" type="text" class="vs-input w-full" placeholder="${x(n)}" value="${x(o)}">`;p.innerHTML=`
      <div class="vs-modal" style="max-width: 560px;">
        <div class="vs-modal-header">
          <h2 class="vs-modal-title">${x(e)}</h2>
          ${t?`<p class="vs-modal-desc">${x(t)}</p>`:""}
        </div>
        <div class="vs-modal-body">
          ${s?`<label class="block text-sm text-vs-text-secondary mb-1">${x(s)}</label>`:""}
          ${c}
        </div>
        <div class="vs-modal-footer">
          <button id="vs-prompt-cancel" class="vs-btn vs-btn-secondary vs-btn-sm" type="button">Cancel</button>
          <button id="vs-prompt-ok" class="vs-btn vs-btn-primary vs-btn-sm" type="button">${x(i)}</button>
        </div>
      </div>
    `;let u=g=>{ue(p),r(g)};document.body.appendChild(p),requestAnimationFrame(()=>p.classList.add("is-visible"));let l=p.querySelector("#vs-prompt-input");setTimeout(()=>l==null?void 0:l.focus(),220),p.addEventListener("click",g=>{g.target===p&&u(null)}),(m=p.querySelector("#vs-prompt-cancel"))==null||m.addEventListener("click",()=>u(null)),(h=p.querySelector("#vs-prompt-ok"))==null||h.addEventListener("click",()=>{u(((l==null?void 0:l.value)||"").trim())}),l==null||l.addEventListener("keydown",g=>{a==="textarea"?g.key==="Enter"&&(g.metaKey||g.ctrlKey)&&(g.preventDefault(),u(((l==null?void 0:l.value)||"").trim())):g.key==="Enter"&&(g.preventDefault(),u(((l==null?void 0:l.value)||"").trim())),g.key==="Escape"&&(g.preventDefault(),u(null))})})}var Mt=null;function Qs(){return`
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
  `}async function en(){var be;let e=(()=>{try{return JSON.parse(sessionStorage.getItem("vs-editor-state")||"null")}catch{return null}})(),t={files:[],treeData:{site:[],config:[],prompts:[]},openTabs:[],activeTab:null,monacoInstance:null,monaco:null,disposed:!1,fontSize:(e==null?void 0:e.fontSize)||13,wordWrap:(e==null?void 0:e.wordWrap)||!1,expandedFolders:new Set((e==null?void 0:e.expandedFolders)||["_partials","assets","assets/css","assets/js","assets/data","assets/forms","_prompts/actions"]),expandedSections:new Set((e==null?void 0:e.expandedSections)||["site","config","prompts"]),_pendingRestore:e?{tabs:e.openTabs||[],active:e.activeTab}:null};window.__hasUnsavedEditorChanges=()=>!t||!t.openTabs?!1:t.openTabs.some(w=>w.dirty);let s=()=>{try{sessionStorage.setItem("vs-editor-state",JSON.stringify({openTabs:t.openTabs.map(w=>w.path),activeTab:t.activeTab,fontSize:t.fontSize,wordWrap:t.wordWrap,expandedFolders:[...t.expandedFolders],expandedSections:[...t.expandedSections]}))}catch{}};window.__vsEditorPage={dispose:()=>{s(),t.disposed=!0,t.monacoInstance&&(t.monacoInstance.dispose(),t.monacoInstance=null)}};let n=document.getElementById("editor-tree"),o=document.getElementById("editor-tree-config"),i=document.getElementById("editor-tree-prompts"),a=document.getElementById("editor-tab-bar"),r=document.getElementById("editor-host"),d=document.getElementById("editor-empty-state"),p=document.getElementById("editor-monaco-container"),c=document.getElementById("editor-file-info"),u=document.getElementById("editor-status"),l=document.getElementById("editor-save-btn"),m=document.getElementById("editor-refresh-tree"),h=document.getElementById("editor-new-file"),g=document.getElementById("editor-sidebar"),b=document.getElementById("editor-sidebar-resize"),f=document.getElementById("editor-font-size-select"),v=document.getElementById("editor-word-wrap-btn");f&&(f.value=t.fontSize);let C=()=>{v&&(t.wordWrap?(v.style.color="var(--vs-accent)",v.style.backgroundColor="var(--vs-accent-dim)"):(v.style.color="var(--vs-text-ghost)",v.style.backgroundColor="transparent"))};C();let k=(w,L="muted")=>{u&&(u.textContent=w,u.dataset.state=L)},M=w=>{let L=t.files.find(S=>S.path===w);return(L==null?void 0:L.readonly)===!0},D=w=>{let L=w.toLowerCase();return L.endsWith(".php")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m10 13-2 2 2 2"/><path d="m14 17 2-2-2-2"/></svg>':L.endsWith(".css")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4"/><path d="M10 16h4"/><path d="M12 12v4"/></svg>':L.endsWith(".js")||L.endsWith(".json")?'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>'},z=(w,L="")=>{let S=[],B={},R=F=>{if(B[F])return B[F];let H=F.split("/"),te=H[H.length-1],ee=H.slice(0,-1).join("/"),se=L?L+F:F,me={name:te,path:se,type:"folder",children:[]};return B[F]=me,ee?R(ee).children.push(me):S.push(me),me};for(let F of w){let te=(L&&F.path.startsWith(L)?F.path.substring(L.length):F.path).split("/");if(te.length===1)S.push({name:te[0],path:F.path,type:"file",meta:F});else{let ee=te.slice(0,-1).join("/");R(ee).children.push({name:te[te.length-1],path:F.path,type:"file",meta:F})}}let V=F=>{F.sort((H,te)=>H.type!==te.type?H.type==="folder"?-1:1:H.name.localeCompare(te.name));for(let H of F)H.type==="folder"&&V(H.children)};return V(S),S},q=()=>{if(!n)return;let w=(V,F=0)=>V.map(H=>{var lt,Dt;if(H.type==="folder"){let kt=t.expandedFolders.has(H.path);return`
            <div class="vs-tree-item" data-folder="${x(H.path)}" style="--tree-indent: ${F};">
              <span class="vs-tree-folder-toggle" data-expanded="${kt}">${E.chevronRight}</span>
              <span class="vs-tree-item-icon">${kt?E.folderOpen||E.folder:E.folder}</span>
              <span class="vs-tree-item-name">${x(H.name)}</span>
            </div>
            <div class="vs-tree-folder-children" data-folder-children="${x(H.path)}" data-collapsed="${!kt}">
              ${w(H.children,F+1)}
            </div>
          `}let te=t.activeTab===H.path,ee=t.openTabs.find(kt=>kt.path===H.path),se=ee!=null&&ee.dirty?" \u2022":"",wt=M(H.path)?' <span style="opacity: 0.5; font-size: 0.9em; margin-left: 4px;">(read-only)</span>':"",Be=((lt=H.meta)==null?void 0:lt.custom)===!0,Ye=((Dt=H.meta)==null?void 0:Dt.protected)===!0,Ze="";return H.path==="assets/css/tailwind.css"?Ze=`
            <button class="vs-tree-item-restore" data-compile-tailwind="true" title="Recompile Tailwind CSS">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`:Ye?Be&&(Ze=`
            <button class="vs-tree-item-restore" data-restore-file="${x(H.path)}" title="Reset to default system prompt">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>`):Ze=`
            <button class="vs-tree-item-delete" data-delete-file="${x(H.path)}" title="Delete file">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>`,`
          <div class="vs-tree-item" data-file="${x(H.path)}" data-active="${te}" style="--tree-indent: ${F};">
            <span style="width: 14px; flex-shrink: 0;"></span><!-- toggle spacer for perfect vertical alignment -->
            <span class="vs-tree-item-icon">${D(H.path)}</span>
            <span class="vs-tree-item-name">${x(H.name)}${wt}${se}</span>
            ${Ze}
          </div>
        `}).join(""),L=(V,F,H)=>{let te=H.querySelector(".vs-explorer-caret");t.expandedSections.has(V)?(F.style.display="block",H.classList.add("is-expanded")):(F.style.display="none",H.classList.remove("is-expanded"))},S=document.querySelector('[data-section="site"]'),B=document.querySelector('[data-section="config"]'),R=document.querySelector('[data-section="prompts"]');S&&L("site",n,S),B&&o&&L("config",o,B),R&&i&&L("prompts",i,R),n.innerHTML=w(t.treeData.site),o&&(o.innerHTML=w(t.treeData.config)),i&&(i.innerHTML=w(t.treeData.prompts)),Fe()},Z=()=>{if(a){if(t.openTabs.length===0){a.innerHTML='<div class="vs-editor-tab-empty"></div>';return}a.innerHTML=t.openTabs.map(w=>{let L=w.path===t.activeTab,S=w.path.split("/").pop(),R=M(w.path)?' <span style="opacity:0.5; font-size:0.9em; margin-left:4px;">(read-only)</span>':"";return`
        <div class="vs-editor-tab" data-tab="${x(w.path)}" data-active="${L}" data-dirty="${w.dirty}">
          <span class="vs-editor-tab-dot"></span>
          <span class="vs-editor-tab-label">${x(S)}${R}</span>
          <button class="vs-editor-tab-close" data-close-tab="${x(w.path)}" title="Close">${E.x}</button>
        </div>
      `}).join("")+'<div class="vs-editor-tab-empty"></div>',Ke(),O()}},G=null,X=w=>{if(!a)return;let L=8,S=()=>{a.scrollLeft+=w==="left"?-L:L,O()};S(),G=setInterval(S,16)},$=()=>{G&&(clearInterval(G),G=null)},O=()=>{let w=document.getElementById("editor-tab-scroll-left"),L=document.getElementById("editor-tab-scroll-right");if(!a||!w||!L)return;let S=a.scrollLeft>0,B=a.scrollLeft<a.scrollWidth-a.clientWidth-1;w.style.display=S?"flex":"none",L.style.display=B?"flex":"none"};a&&(a.addEventListener("scroll",O,{passive:!0}),window.addEventListener("resize",O,{passive:!0}));let W=document.getElementById("editor-tab-scroll-left"),K=document.getElementById("editor-tab-scroll-right");W&&(W.addEventListener("mousedown",()=>X("left")),W.addEventListener("mouseup",$),W.addEventListener("mouseleave",$)),K&&(K.addEventListener("mousedown",()=>X("right")),K.addEventListener("mouseup",$),K.addEventListener("mouseleave",$));let y=()=>{d&&(d.style.display="none"),p&&(p.style.display=""),t.monacoInstance&&t.monacoInstance.layout()},_=async w=>{if(t.disposed)return;let L=t.openTabs.find(F=>F.path===w);if(L){await P(w);return}k("Loading\u2026");let{ok:S,data:B,error:R}=await T.get(`/files/content?path=${encodeURIComponent(w)}`);if(!S){j((R==null?void 0:R.message)||"Could not load file.","error"),k("Load failed","error");return}let V=typeof(B==null?void 0:B.content)=="string"?B.content:"";L={path:w,baseline:V,dirty:!1},t.openTabs.push(L),y(),await P(w),A(V,w),k("Ready"),s()},P=async w=>{if(t.disposed)return;let L=t.openTabs.find(B=>B.path===t.activeTab);L&&t.monacoInstance&&(L._buffer=t.monacoInstance.getValue()),t.activeTab=w;let S=t.openTabs.find(B=>B.path===w);if(S&&t.monacoInstance){let B=S._buffer!==void 0?S._buffer:S.baseline;A(B,w)}ve(),le(),Z(),setTimeout(()=>{if(a){let B=a.querySelector('.vs-editor-tab[data-active="true"]');if(B){let R=B.getBoundingClientRect(),V=a.getBoundingClientRect();R.left<V.left?a.scrollBy({left:R.left-V.left,behavior:"smooth"}):R.right>V.right&&a.scrollBy({left:R.right-V.right,behavior:"smooth"})}}},10),q(),s()},U=async w=>{let L=t.openTabs.find(B=>B.path===w);if(L!=null&&L.dirty&&!await ye({title:"Discard unsaved changes?",description:`"${w}" has unsaved edits.`,confirmLabel:"Discard",cancelLabel:"Cancel",danger:!0}))return;let S=t.openTabs.findIndex(B=>B.path===w);if(S!==-1){if(t.openTabs.splice(S,1),t.activeTab===w){let B=t.openTabs[Math.min(S,t.openTabs.length-1)];B?await P(B.path):(t.activeTab=null,ne(),ve(),le())}Z(),q(),s()}},J=async w=>{var F;if((F=window.demoGuard)!=null&&F.call(window))return;let L=w.split("/").pop();if(!await ye({title:"Delete file?",description:`Are you sure you want to permanently delete "${L}"? This cannot be undone.`,confirmLabel:"Delete",cancelLabel:"Cancel",danger:!0}))return;k("Deleting\u2026");let{ok:B,error:R}=await T.delete(`/files?path=${encodeURIComponent(w)}`);if(!B){j((R==null?void 0:R.message)||"Could not delete file.","error"),k("Delete failed","error");return}let V=t.openTabs.findIndex(H=>H.path===w);if(V!==-1){if(t.openTabs.splice(V,1),t.activeTab===w){let H=t.openTabs[Math.min(V,t.openTabs.length-1)];H?await P(H.path):(t.activeTab=null,ne(),ve(),le())}Z()}await N(),s(),j(`Deleted ${L}`,"success"),k("Ready")},de=async w=>{var F;if((F=window.demoGuard)!=null&&F.call(window))return;let L=w.split("/").pop();if(!await ye({title:"Reset system prompt?",description:`Are you sure you want to reset "${L}" to its original state? All your customizations will be lost.`,confirmLabel:"Reset to default",cancelLabel:"Cancel",danger:!0}))return;k("Resetting\u2026");let{ok:B,error:R}=await T.delete(`/files?path=${encodeURIComponent(w)}`);if(!B){j((R==null?void 0:R.message)||"Could not reset file.","error"),k("Reset failed","error");return}let V=t.openTabs.findIndex(H=>H.path===w);if(V!==-1){let{ok:H,data:te}=await T.get(`/files/content?path=${encodeURIComponent(w)}`);if(H&&typeof(te==null?void 0:te.content)=="string"){let ee=t.openTabs[V];ee.baseline=te.content,ee.dirty=!1,ee._buffer=te.content,t.activeTab===w&&A(te.content,w)}}le(),await N(),s(),j(`Reset ${L} to default`,"success"),k("Ready")},A=(w,L)=>{if(!t.monacoInstance||!t.monaco)return;let S=t.monacoInstance.getModel();S&&(t.monacoInstance.setValue(w),t.monaco.editor.setModelLanguage(S,Bt(L)),t.monacoInstance.updateOptions({readOnly:window.IS_DEMO||M(L)}))},ne=()=>{d&&(d.style.display=""),p&&(p.style.display="none")},ve=()=>{if(!c)return;if(!t.activeTab){c.textContent="No file open";return}let w=t.openTabs.find(R=>R.path===t.activeTab),L=t.files.find(R=>R.path===t.activeTab),S=L!=null&&L.size?`${(Number(L.size)/1024).toFixed(1)} KB`:"",B=Bt(t.activeTab).toUpperCase();c.textContent=[t.activeTab,B,S].filter(Boolean).join(" \u2022 ")},le=()=>{if(!l)return;let w=t.openTabs.find(S=>S.path===t.activeTab);if(t.activeTab?M(t.activeTab):!1){l.disabled=!0,l.textContent="Read-Only",l.classList.remove("vs-btn-primary"),l.classList.add("vs-btn-ghost");return}if(!w||!w.dirty){l.disabled=!0,l.textContent="Saved",l.classList.remove("vs-btn-primary"),l.classList.add("vs-btn-ghost");return}l.disabled=!1,l.textContent="Save",l.classList.remove("vs-btn-ghost"),l.classList.add("vs-btn-primary")},Ne=()=>{let w=t.openTabs.find(B=>B.path===t.activeTab);if(!w||!t.monacoInstance)return;let L=t.monacoInstance.getValue(),S=w.dirty;w.dirty=L!==w.baseline,S!==w.dirty&&(le(),Z(),w.dirty?k("Unsaved changes","warning"):k("Ready"))},Te=async()=>{var V,F,H,te;if((V=window.demoGuard)!=null&&V.call(window))return;let w=t.openTabs.find(ee=>ee.path===t.activeTab);if(!w||!w.dirty||!t.monacoInstance)return;let L=t.monacoInstance.getValue();l.disabled=!0,l.textContent="Saving\u2026",k("Saving\u2026");let{ok:S,error:B}=await T.put("/files/content",{path:w.path,content:L});if(!S){l.disabled=!1,l.textContent="Save",j((B==null?void 0:B.message)||"Could not save file.","error"),k("Save failed","error");return}w.baseline=L,w.dirty=!1,w._buffer=L,le(),Z(),q(),k("Saved","success"),j(`Saved ${w.path}`,"success"),w.path.toLowerCase().endsWith(".css")?(F=window.sendPreviewMessage)==null||F.call(window,"voxelsite:reload-css"):(H=window.sendPreviewMessage)==null||H.call(window,"voxelsite:reload"),setTimeout(()=>{var ee;return(ee=window.refreshPreview)==null?void 0:ee.call(window)},400),(te=window.refreshPublishState)==null||te.call(window,{silent:!0});let R=t.openTabs.find(ee=>ee.path==="assets/css/tailwind.css");R&&w.path!=="assets/css/tailwind.css"&&T.get("/files/content?path=assets/css/tailwind.css").then(({ok:ee,data:se})=>{ee&&typeof(se==null?void 0:se.content)=="string"&&(R.baseline=se.content,R._buffer=se.content,t.activeTab==="assets/css/tailwind.css"&&t.monacoInstance&&t.monacoInstance.setValue(se.content))})},Fe=()=>{let w=L=>{L&&(L.querySelectorAll("[data-file]").forEach(S=>{S.addEventListener("click",B=>{B.target.closest("[data-delete-file]")||_(S.dataset.file)})}),L.querySelectorAll("[data-delete-file]").forEach(S=>{S.addEventListener("click",B=>{B.stopPropagation(),J(S.dataset.deleteFile)})}),L.querySelectorAll("[data-restore-file]").forEach(S=>{S.addEventListener("click",B=>{B.stopPropagation(),de(S.dataset.restoreFile)})}),L.querySelectorAll("[data-compile-tailwind]").forEach(S=>{S.addEventListener("click",async B=>{var se;if(B.stopPropagation(),(se=window.demoGuard)!=null&&se.call(window))return;S.style.opacity="0.4",S.style.pointerEvents="none",k("Compiling Tailwind\u2026");let{ok:R,data:V,error:F}=await T.post("/files/compile-tailwind");if(S.style.opacity="",S.style.pointerEvents="",!R){j((F==null?void 0:F.message)||"Tailwind compilation failed.","error"),k("Compile failed","error");return}let H="assets/css/tailwind.css",te=t.openTabs.find(me=>me.path===H);te&&(te.baseline=V.content,te.dirty=!1,t.activeTab===H&&t.monacoInstance&&t.monacoInstance.setValue(V.content));let ee=V.class_count??0;j(`Tailwind CSS recompiled \u2014 ${ee} utilities.`,"success"),k("Compiled")})}),L.querySelectorAll(".vs-tree-folder-toggle, .vs-tree-item[data-folder]").forEach(S=>{S.addEventListener("click",B=>{B.stopPropagation();let V=S.closest(".vs-tree-item").dataset.folder;t.expandedFolders.has(V)?t.expandedFolders.delete(V):t.expandedFolders.add(V),s(),q()})}))};w(n),w(o),w(i),document.querySelectorAll(".vs-explorer-section-header").forEach(L=>{L.dataset.bound||(L.dataset.bound="true",L.addEventListener("click",()=>{let S=L.dataset.section;t.expandedSections.has(S)?t.expandedSections.delete(S):t.expandedSections.add(S),s(),q()}))})},Ke=()=>{a&&(a.querySelectorAll("[data-tab]").forEach(w=>{w.addEventListener("click",L=>{L.target.closest("[data-close-tab]")||P(w.dataset.tab)})}),a.querySelectorAll("[data-close-tab]").forEach(w=>{w.addEventListener("click",L=>{L.stopPropagation(),U(w.dataset.closeTab)})}))};if(b&&g){let w=!1;b.addEventListener("mousedown",L=>{L.preventDefault(),w=!0,b.classList.add("is-dragging");let S=R=>{if(!w)return;let V=Math.min(400,Math.max(200,R.clientX));g.style.width=V+"px"},B=()=>{w=!1,b.classList.remove("is-dragging"),document.removeEventListener("mousemove",S),document.removeEventListener("mouseup",B)};document.addEventListener("mousemove",S),document.addEventListener("mouseup",B)})}l==null||l.addEventListener("click",Te),f==null||f.addEventListener("change",w=>{let L=parseInt(w.target.value,10);t.fontSize=L,t.monacoInstance&&t.monacoInstance.updateOptions({fontSize:L}),s()}),v==null||v.addEventListener("click",()=>{t.wordWrap=!t.wordWrap,C(),t.monacoInstance&&t.monacoInstance.updateOptions({wordWrap:t.wordWrap?"on":"off"}),s()}),m==null||m.addEventListener("click",()=>N()),h==null||h.addEventListener("click",async()=>{var F,H;if((F=window.demoGuard)!=null&&F.call(window))return;let w=await xs({title:"Create New File",description:"Enter a filename (e.g. contact.php, assets/css/custom.css, assets/js/utils.js).",placeholder:"filename.php",confirmLabel:"Create"});if(!w||!w.trim())return;let L=w.trim(),S=(H=L.split(".").pop())==null?void 0:H.toLowerCase(),B=["php","css","js","json"];if(!S||!B.includes(S)){j(`Only ${B.join(", ")} files can be created.`,"warning");return}k("Creating\u2026");let{ok:R,error:V}=await T.post("/files/create",{path:L});if(!R){j((V==null?void 0:V.message)||"Could not create file.","error"),k("Create failed","error");return}await N(),await _(L),j(`Created ${L}`,"success")});let xt=w=>{if(t.disposed){document.removeEventListener("keydown",xt);return}(w.metaKey||w.ctrlKey)&&w.key==="s"&&(w.preventDefault(),Te())};document.addEventListener("keydown",xt);let N=async()=>{var B;let{ok:w,data:L,error:S}=await T.get("/files");if(!w||!((B=L==null?void 0:L.files)!=null&&B.length)){n&&(n.innerHTML='<div class="text-xs text-vs-text-ghost py-8 text-center">No files found. Generate a site first.</div>'),i&&(i.innerHTML="");return}t.files=L.files,t.treeData={site:z(L.files.filter(R=>!R.path.startsWith("_prompts/")&&!R.path.startsWith("_root/"))),config:z(L.files.filter(R=>R.path.startsWith("_root/")),"_root/"),prompts:z(L.files.filter(R=>R.path.startsWith("_prompts/")),"_prompts/")},q()},oe=async()=>{if(!p)return;let w;try{w=await tn()}catch{j("Monaco editor is not available.","warning");return}t.monaco=w;let L=It();w.editor.setTheme(L);let S=w.editor.create(p,{value:"",language:"php",theme:L,automaticLayout:!0,minimap:{enabled:!0,maxColumn:80},fontSize:t.fontSize,lineHeight:21,tabSize:2,insertSpaces:!0,wordWrap:t.wordWrap?"on":"off",scrollBeyondLastLine:!1,fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',renderLineHighlight:"line",bracketPairColorization:{enabled:!0},smoothScrolling:!0,cursorBlinking:"smooth",cursorSmoothCaretAnimation:"on",padding:{top:8}});t.monacoInstance=S,S.onDidChangeModelContent(()=>Ne()),S.addCommand(w.KeyMod.CtrlCmd|w.KeyCode.KeyK,async()=>{if(t.monacoInstance.getOption(w.editor.EditorOption.readOnly)){j("Cannot use inline AI on a read-only file.","warning");return}let B=t.activeTab;if(!B)return;let R=t.monacoInstance.getModel(),V=t.monacoInstance.getSelection(),F=R.getValueInRange(V);if(!F||F.trim()===""){let se=t.monacoInstance.getPosition(),me=R.getLineContent(se.lineNumber);if(me.trim()===""){j("Highlight a block of code to edit.","warning");return}F=me,t.monacoInstance.setSelection(new w.Range(se.lineNumber,1,se.lineNumber,R.getLineMaxColumn(se.lineNumber)))}let H=await xs({title:"Inline AI Edit",label:"Instruction",placeholder:"e.g. Turn this list into a responsive 3-column grid...",confirmLabel:"Generate",inputType:"textarea"});if(!H)return;let te=t.monacoInstance.getValue();t.monacoInstance.updateOptions({readOnly:!0});let ee=document.createElement("div");ee.className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--vs-bg)]/50 backdrop-blur-sm",ee.innerHTML=`
        <div class="flex items-center gap-4 px-6 py-4 rounded-xl" style="background: var(--vs-bg-surface); border: 1px solid var(--vs-border-medium); box-shadow: var(--vs-shadow-lg), var(--vs-cream-inset);">
          <div style="color: var(--vs-accent);">${E.box}</div>
          <div class="vs-loading gap-1.5 opacity-70"><i></i><i></i><i></i></div>
          <span class="text-sm font-medium" style="color: var(--vs-text-primary);" id="ai-inline-status">AI is writing code...</span>
        </div>
      `,p&&(p.style.position="relative",p.appendChild(ee)),k("AI is editing...","muted");try{await Qe("/ai/prompt",{user_prompt:H,action_type:"inline_edit",action_data:{path:B,selection:F}},{onStatus:se=>{let me=document.getElementById("ai-inline-status");me&&(me.textContent="Generating...")},onFile:()=>{let se=document.getElementById("ai-inline-status");se&&(se.textContent="Applying changes...")},onError:se=>{j(se.message||"Generation failed","error")},onDone:async se=>{var wt;if((wt=se.files_modified)==null?void 0:wt.some(Be=>(typeof Be=="string"?Be:(Be==null?void 0:Be.path)||"").replace(/^\//,"")===B.replace(/^\//,""))){let{ok:Be,data:Ye}=await T.get(`/files/content?path=${encodeURIComponent(B)}&_t=${Date.now()}`);if(Be&&(Ye!=null&&Ye.content)){let Ze=Ye.content;await T.put("/files/content",{path:B,content:te}),t.monacoInstance.getModel().setValue(Ze);let lt=t.openTabs.find(Dt=>Dt.path===B);lt&&(lt._buffer=Ze,lt.baseline=te),Ne(),j("Review changes and save.","success")}}else se.partial||j("Complete (No changes made to this file)","info")}})}finally{t.monacoInstance.updateOptions({readOnly:!1}),ee.parentNode&&ee.parentNode.removeChild(ee),k("Ready","muted")}})};if(await Promise.all([N(),oe()]),t._pendingRestore&&t._pendingRestore.tabs.length>0){let{tabs:w,active:L}=t._pendingRestore;t._pendingRestore=null;for(let S of w){if(!t.files.some(V=>V.path===S))continue;let{ok:B,data:R}=await T.get(`/files/content?path=${encodeURIComponent(S)}`);B&&typeof(R==null?void 0:R.content)=="string"&&t.openTabs.push({path:S,baseline:R.content,dirty:!1})}if(t.openTabs.length>0){let S=L&&t.openTabs.find(B=>B.path===L)?L:t.openTabs[0].path;y(),await P(S),A(((be=t.openTabs.find(B=>B.path===S))==null?void 0:be.baseline)||"",S),k("Ready")}}}function It(){return document.documentElement.getAttribute("data-theme")==="light"?"vs":"vs-dark"}async function tn(){var e;return(e=window.monaco)!=null&&e.editor?window.monaco:Mt||(Mt=new Promise((t,s)=>{let n=()=>{if(!window.require){s(new Error("Monaco loader is unavailable."));return}window.MonacoEnvironment={getWorkerUrl:function(a,r){return`data:text/javascript;charset=utf-8,${encodeURIComponent(`
            self.MonacoEnvironment = {
              baseUrl: '${window.location.origin}/_studio/ui/lib/monaco/'
            };
            importScripts('${window.location.origin}/_studio/ui/lib/monaco/vs/base/worker/workerMain.js');
          `)}`}},window.require.config({paths:{vs:"/_studio/ui/lib/monaco/vs"}}),window.require(["vs/editor/editor.main"],()=>{t(window.monaco)},()=>{s(new Error("Could not load Monaco editor modules."))})},o=document.getElementById("vs-monaco-loader-script");if(o){window.require?n():(o.addEventListener("load",n,{once:!0}),o.addEventListener("error",()=>s(new Error("Could not load Monaco loader.")),{once:!0}));return}let i=document.createElement("script");i.id="vs-monaco-loader-script",i.src="/_studio/ui/lib/monaco/vs/loader.js",i.async=!0,i.onload=n,i.onerror=()=>s(new Error("Could not load Monaco loader.")),document.head.appendChild(i)}).catch(t=>{throw Mt=null,t}),Mt)}async function ws(e=""){var q,Z,G,X;let t=document.getElementById("vs-code-editor-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-code-editor-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible"));let n=s.querySelector("#vs-code-file-select"),o=s.querySelector("#vs-code-save-btn"),i=s.querySelector("#vs-code-reload-btn"),a=s.querySelector("#vs-code-close-btn"),r=s.querySelector("#vs-code-meta"),d=s.querySelector("#vs-code-status"),p=s.querySelector("#vs-code-editor-host"),c={files:[],path:"",baseline:"",editor:null,editorCleanup:null,closed:!1},u=($,O="muted")=>{d&&(d.textContent=$,d.dataset.state=O)},l=()=>c.files.find($=>$.path===c.path)||null,m=()=>!!c.editor&&c.editor.getValue()!==c.baseline,h=()=>{if(!r)return;let $=l();if(!$){r.textContent="No file selected";return}let O=$.size?`${(Number($.size)/1024).toFixed(1)} KB`:"0 KB",W=$.modified?new Date($.modified).toLocaleString():"Unknown date";r.textContent=`${$.path} \u2022 ${O} \u2022 ${W}`},g=()=>{if(!o)return;let $=m();o.disabled=!$,o.textContent=$?"Save Changes":"Saved",$?u("Unsaved changes","warning"):c.path&&u("Saved","success")},b=async()=>{var $;c.closed||m()&&!await ye({title:"Discard unsaved changes?",description:"You have unsaved edits in the code editor.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0})||(c.closed=!0,($=c.editorCleanup)!=null&&$.dispose&&(c.editorCleanup.dispose(),c.editorCleanup=null),c.editor&&(c.editor.dispose(),c.editor=null),ue(s))},f=($,O=null)=>{if(!c.editor)return;c.editor.setValue($),c.baseline=$;let W=(O==null?void 0:O.language)||Bt(c.path);c.editor.setLanguage&&c.editor.setLanguage(W),h(),g()},v=async($,{silent:O=!1}={})=>{if(!$||!c.editor)return!1;c.path=$,O||u("Loading file\u2026");let{ok:W,data:K,error:y}=await T.get(`/files/content?path=${encodeURIComponent($)}`);if(!W)return j((y==null?void 0:y.message)||"Could not load file.","error"),u("Load failed","error"),!1;let _=typeof(K==null?void 0:K.content)=="string"?K.content:"";return f(_,(K==null?void 0:K.file)||l()),!0},C=async()=>m()?await ye({title:"Discard unsaved changes?",description:"Switching files will lose your unsaved edits.",confirmLabel:"Discard Changes",cancelLabel:"Keep Editing",danger:!0}):!0,k=async $=>{if(!$||$===c.path)return;if(!await C()){n&&(n.value=c.path);return}await v($)},M=async()=>{var K,y,_;if(!c.editor||!c.path||!o)return;let $=c.editor.getValue();if($===c.baseline){g();return}o.disabled=!0,o.textContent="Saving\u2026",u("Saving\u2026");let{ok:O,error:W}=await T.put("/files/content",{path:c.path,content:$});if(!O){o.disabled=!1,o.textContent="Save Changes",j((W==null?void 0:W.message)||"Could not save file.","error"),u("Save failed","error");return}c.baseline=$,g(),u("Saved","success"),j(`Saved ${c.path}`,"success"),c.path.toLowerCase().endsWith(".css")?(K=window.sendPreviewMessage)==null||K.call(window,"voxelsite:reload-css"):(y=window.sendPreviewMessage)==null||y.call(window,"voxelsite:reload"),setTimeout(()=>{var P;return(P=window.refreshPreview)==null?void 0:P.call(window)},400),(_=window.refreshPublishState)==null||_.call(window,{silent:!0})},D=$=>{$.key==="Escape"&&($.preventDefault(),b())};a==null||a.addEventListener("click",()=>b()),i==null||i.addEventListener("click",async()=>{!c.path||!await C()||await v(c.path)}),o==null||o.addEventListener("click",()=>M()),n==null||n.addEventListener("change",$=>{k($.target.value)}),s.addEventListener("click",$=>{$.target===s&&b()}),document.addEventListener("keydown",D);let z=()=>document.removeEventListener("keydown",D);s.addEventListener("transitionend",()=>{document.body.contains(s)||z()});try{let $=await T.get("/files");if(!$.ok||!((Z=(q=$.data)==null?void 0:q.files)!=null&&Z.length)){let y=((G=$.error)==null?void 0:G.message)||"No editable files found.";j(y,"error"),b();return}let O=$.data.files;c.files=O,n&&(n.innerHTML=O.map(y=>{let _=y.group?`${String(y.group).toUpperCase()} \xB7 `:"";return`<option value="${x(y.path)}">${x(_+y.path)}</option>`}).join(""));let W=((X=O.find(y=>y.path===e))==null?void 0:X.path)||O[0].path;c.path=W,n&&(n.value=W),p.innerHTML="";let K=null;try{K=await tn()}catch{j("Monaco is not available yet. Using fallback editor.","warning"),u("Fallback editor active","warning")}if(K!=null&&K.editor){let y=It();K.editor.setTheme(y);let _=K.editor.create(p,{value:"",language:Bt(W),theme:y,automaticLayout:!0,minimap:{enabled:!1},fontSize:13,lineHeight:21,tabSize:2,insertSpaces:!0,scrollBeyondLastLine:!1,wordWrap:"on",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'});c.editor={getValue:()=>_.getValue(),setValue:P=>_.setValue(P),setLanguage:P=>{let U=_.getModel();U&&K.editor.setModelLanguage(U,P)},dispose:()=>_.dispose()},c.editorCleanup=_.onDidChangeModelContent(()=>{g()})}else{p.innerHTML='<textarea id="vs-code-editor-fallback" class="vs-textarea vs-code-fallback-input" spellcheck="false"></textarea>';let y=p.querySelector("#vs-code-editor-fallback"),_=()=>g();y==null||y.addEventListener("input",_),c.editor={getValue:()=>(y==null?void 0:y.value)||"",setValue:P=>{y&&(y.value=P)},setLanguage:()=>{},dispose:()=>{y==null||y.removeEventListener("input",_)}}}await v(W,{silent:!0}),u("Ready")}catch($){j(($==null?void 0:$.message)||"Could not initialize code editor.","error"),b()}finally{let $=new MutationObserver(()=>{document.body.contains(s)||(z(),$.disconnect())});$.observe(document.body,{childList:!0,subtree:!0})}}function rn(){return setTimeout(()=>Ve(),0),`
    <div>
      <div class="vs-page-header">
        <h1 class="vs-page-title">Settings</h1>
        <p class="vs-page-subtitle">AI configuration, site settings, and system info.</p>
      </div>

      <div id="settings-content">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading settings...</div>
      </div>
    </div>
  `}async function Ve(){var K,y,_,P,U,J,de;let e=document.getElementById("settings-content");if(!e)return;let[t,s,n,o,i,a,r]=await Promise.all([T.get("/settings"),T.get("/settings/system"),T.get("/settings/mail"),T.get("/settings/usage"),T.get("/files/content?path="+encodeURIComponent("assets/data/memory.json")),T.get("/files/content?path="+encodeURIComponent("assets/data/design-intelligence.json")),T.get("/settings/logs")]),d=((K=r.data)==null?void 0:K.logs)||[],p=((y=t.data)==null?void 0:y.settings)||{},c=((_=s.data)==null?void 0:_.system)||{},u=p.site_favicon||null,l=u?`/${u}?v=${Date.now()}`:"/favicon.ico?v="+Date.now(),m=null,h=null;try{i.ok&&((P=i.data)!=null&&P.content)&&(m=JSON.parse(i.data.content))}catch{}try{a.ok&&((U=a.data)!=null&&U.content)&&(h=JSON.parse(a.data.content))}catch{}let g=m||h,b=o.data||{models:[],totals:{request_count:0,total_input_tokens:0,total_output_tokens:0}},f=p.available_providers||{},v=((J=n.data)==null?void 0:J.config)||{},C=((de=n.data)==null?void 0:de.presets)||{},k=Object.keys(f),M=p.ai_provider||"claude",z=(f[M]||{name:"Claude",models:[],config_fields:[]}).config_fields||[],q=p[`ai_${M}_model`]||"",Z=p[`ai_${M}_api_key_set`]||!1,G=k.map(A=>{let ne=f[A];return`<option value="${x(A)}" ${A===M?"selected":""}>${x(ne.name)}</option>`}).join(""),X="";for(let A of z)A.key==="api_key"?X+=`
        <div>
          <label for="set-api-key" class="block text-sm font-medium text-vs-text-secondary mb-1">${x(A.label)}${A.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <div class="flex gap-2">
            <input id="set-api-key" type="password" value="${Z?"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022":""}"
              class="vs-input font-mono" style="flex: 1;"
              placeholder="${x(A.placeholder)}" />
            <button id="btn-test-api"
              class="vs-btn vs-btn-secondary vs-btn-sm" style="white-space: nowrap;">
              Test Connection
            </button>
          </div>
          <p id="api-key-status" class="text-xs mt-1.5 hidden"></p>
          ${Z?'<p class="text-xs text-vs-text-ghost mt-1">Key is configured. Enter a new key to replace it.</p>':A.required?'<p class="text-xs text-vs-warning mt-1">No API key set. Add one to enable AI features.</p>':`<p class="text-xs text-vs-text-ghost mt-1">${x(A.help_text||"Optional for local servers")}</p>`}
          ${A.help_url?`<a href="${A.help_url}" target="_blank" rel="noopener" class="text-xs text-vs-accent hover:underline mt-1 inline-block">${x(A.help_text||"Get a key")} \u2192</a>`:""}
        </div>`:A.key==="base_url"&&(X+=`
        <div>
          <label for="set-base-url" class="block text-sm font-medium text-vs-text-secondary mb-1">${x(A.label)}${A.required?"":' <span class="text-vs-text-ghost font-normal">(optional)</span>'}</label>
          <input id="set-base-url" type="url" value="${x(p.ai_openai_compatible_base_url||"")}"
            class="vs-input"
            placeholder="${x(A.placeholder)}" />
          ${A.help_text?`<p class="text-xs text-vs-text-ghost mt-1">${x(A.help_text)}</p>`:""}
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
              <img src="${l}" alt="Current favicon" class="vs-favicon-img" id="vs-favicon-img"
                onerror="this.style.display='none'; this.parentElement.innerHTML = '<div class=\\'vs-favicon-placeholder\\'><svg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'m21 15-5-5L5 21\\'/></svg></div>';" />
            </div>
            <div class="vs-favicon-info">
              <div class="vs-favicon-actions">
                <button type="button" class="vs-btn vs-btn-secondary vs-btn-xs" id="btn-favicon-upload">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                </button>
                ${u?`
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
          ${X}
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
            <option value="none" ${v.driver==="none"?"selected":""}>Not configured</option>
            <option value="php_mail" ${v.driver==="php_mail"?"selected":""}>PHP mail()</option>
            <option value="smtp" ${v.driver==="smtp"?"selected":""}>SMTP</option>
            <option value="mailpit" ${v.driver==="mailpit"?"selected":""}>Mailpit (local dev)</option>
          </select>
        </div>

        <!-- SMTP Fields -->
        <div id="mail-smtp-fields" style="display: ${v.driver==="smtp"?"block":"none"};">
          <div class="flex flex-col gap-4">
            <div>
              <label for="set-smtp-preset" class="block text-sm font-medium text-vs-text-secondary mb-1">Provider</label>
              <select id="set-smtp-preset" class="vs-input">
                ${Object.entries(C).map(([A,ne])=>`<option value="${x(A)}">${x(ne.label)}</option>`).join("")}
              </select>
              <p id="smtp-preset-help" class="text-xs text-vs-text-ghost mt-1"></p>
            </div>

            <div>
              <label for="set-smtp-host" class="block text-sm font-medium text-vs-text-secondary mb-1">SMTP Host</label>
              <input id="set-smtp-host" type="text" value="${x(v.smtp_host||"")}"
                class="vs-input"
                placeholder="smtp.example.com" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="set-smtp-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Port</label>
                <input id="set-smtp-port" type="number" value="${v.smtp_port||587}" min="1" max="65535"
                  class="vs-input" />
              </div>
              <div>
                <label for="set-smtp-encryption" class="block text-sm font-medium text-vs-text-secondary mb-1">Encryption</label>
                <select id="set-smtp-encryption" class="vs-input">
                  <option value="tls" ${v.smtp_encryption==="tls"?"selected":""}>TLS (STARTTLS)</option>
                  <option value="ssl" ${v.smtp_encryption==="ssl"?"selected":""}>SSL</option>
                  <option value="none" ${v.smtp_encryption==="none"?"selected":""}>None</option>
                </select>
              </div>
            </div>

            <div>
              <label for="set-smtp-username" class="block text-sm font-medium text-vs-text-secondary mb-1">Username</label>
              <input id="set-smtp-username" type="text" value="${x(v.smtp_username||"")}"
                class="vs-input"
                placeholder="user@example.com" />
            </div>

            <div>
              <label for="set-smtp-password" class="block text-sm font-medium text-vs-text-secondary mb-1">Password</label>
              <div class="relative">
                <input id="set-smtp-password" type="password" value="${v.smtp_password||""}"
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
        <div id="mail-mailpit-fields" style="display: ${v.driver==="mailpit"?"block":"none"};">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="set-mailpit-host" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Host</label>
              <input id="set-mailpit-host" type="text" value="${x(v.mailpit_host||"localhost")}"
                class="vs-input" />
            </div>
            <div>
              <label for="set-mailpit-port" class="block text-sm font-medium text-vs-text-secondary mb-1">Mailpit Port</label>
              <input id="set-mailpit-port" type="number" value="${v.mailpit_port||1025}" min="1" max="65535"
                class="vs-input" />
            </div>
          </div>
        </div>

        <!-- Common Fields (From address, test) -->
        <div id="mail-common-fields" style="display: ${v.driver==="none"?"none":"block"};">
        <div class="border-t border-vs-border-subtle my-2"></div>
        <div>
          <label for="set-mail-from-address" class="block text-sm font-medium text-vs-text-secondary mb-1">From Address</label>
          <input id="set-mail-from-address" type="email" value="${x(v.from_address||"")}"
            class="vs-input"
            placeholder="noreply@yourdomain.com" />
          <p class="text-xs text-vs-text-ghost mt-1">Shown as the sender on notification emails.</p>
        </div>

        <div>
          <label for="set-mail-from-name" class="block text-sm font-medium text-vs-text-secondary mb-1">From Name</label>
          <input id="set-mail-from-name" type="text" value="${x(v.from_name||"")}"
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

    ${g?`
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
        ${h?`
        <button class="vs-knowledge-card" id="btn-view-design">
          <div class="vs-knowledge-card-icon">${E.eye}</div>
          <div class="vs-knowledge-card-info">
            <span class="vs-knowledge-card-label">Design Intelligence</span>
            <span class="vs-knowledge-card-desc">${Object.keys(h).length} design decisions</span>
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
      ${b.models.length===0?`
        <div class="text-sm text-vs-text-ghost py-4 text-center">No usage data yet. Start generating to see stats.</div>
      `:`
        <div class="vs-sys-grid">
          ${fe("Total Requests",Number(b.totals.request_count).toLocaleString())}
          ${fe("Input Tokens",Number(b.totals.total_input_tokens).toLocaleString())}
          ${fe("Output Tokens",Number(b.totals.total_output_tokens).toLocaleString())}

        </div>
        ${b.models.length>1?`
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--vs-border-subtle);">
            <div class="text-xs text-vs-text-ghost mb-2" style="text-transform: uppercase; letter-spacing: 0.05em;">Per Model</div>
            ${b.models.map(A=>`
              <div class="vs-sys-grid" style="margin-bottom: 8px;">
                ${fe(A.ai_model||"Unknown",Number(A.request_count).toLocaleString()+" requests")}
                ${fe("Tokens",Number(A.total_input_tokens).toLocaleString()+" in / "+Number(A.total_output_tokens).toLocaleString()+" out")}

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
        ${fe("Database",ks(c.database_size))}
        ${fe("Preview Files",ks(c.preview_size))}
        ${fe("Assets",ks(c.assets_size))}
        ${fe("Upload Limit",c.max_upload||"?")}
        ${fe("Memory Limit",c.memory_limit||"?")}
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
        ${d.length===0?'<p style="color: var(--vs-text-ghost); font-size: var(--text-xs); margin: 0;">No log files yet.</p>':d.map(A=>{let ne=(A.size/1024).toFixed(1),ve=new Date(A.modified*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`<div class="vs-log-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border: 1px solid var(--vs-border-subtle); border-radius: var(--radius-md);">
              <span style="font-family: var(--font-mono); font-size: 12px; color: var(--vs-text-primary);">${A.name}</span>
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 11px; color: var(--vs-text-ghost); white-space: nowrap;">${A.lines} lines \xB7 ${ne} KB \xB7 ${ve}</span>
                <a href="/_studio/api/router.php?_path=%2Fsettings%2Flogs%2Fdownload&file=${encodeURIComponent(A.name)}" download class="vs-btn vs-btn-ghost vs-btn-xs" style="text-decoration: none; padding: 2px 8px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </a>
                <button class="vs-btn vs-btn-ghost vs-btn-xs btn-delete-log" data-file="${A.name}" style="padding: 2px 8px; color: var(--vs-text-ghost);" title="Delete">
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
  `,Po(p,f),jo(v,C),Bo(),Mo(),document.querySelectorAll(".btn-delete-log").forEach(A=>{A.addEventListener("click",async()=>{var le;if((le=window.demoGuard)!=null&&le.call(window))return;if(A.dataset.confirm!=="true"){A.dataset.confirm="true",A.innerHTML='<span style="font-size: 11px;">Sure?</span>',A.style.color="var(--vs-error)",setTimeout(()=>{A.dataset.confirm==="true"&&(A.dataset.confirm="",A.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',A.style.color="")},3e3);return}let ne=A.dataset.file,ve=A.closest(".vs-log-row");ve&&(ve.style.opacity="0.4"),await T.delete("/settings/logs",{file:ne}),Ve()})});let $=document.getElementById("btn-delete-all-logs");$&&$.addEventListener("click",async()=>{var A;if(!((A=window.demoGuard)!=null&&A.call(window))){if($.dataset.confirm!=="true"){$.dataset.confirm="true",$.textContent="Sure?",$.style.color="var(--vs-error)",setTimeout(()=>{$.dataset.confirm==="true"&&($.dataset.confirm="",$.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete all',$.style.color="")},3e3);return}$.disabled=!0,$.textContent="Deleting...",await T.delete("/settings/logs",{file:"*"}),Ve()}});let O=document.getElementById("btn-view-memory");O&&m&&O.addEventListener("click",()=>sn("Site Memory",m,"memory"));let W=document.getElementById("btn-view-design");W&&h&&W.addEventListener("click",()=>sn("Design Intelligence",h,"design")),So(),To(),Ao(q)}function $o(e,t){let s=(e||"0").split(".").map(Number),n=(t||"0").split(".").map(Number);for(let o=0;o<Math.max(s.length,n.length);o++){let i=s[o]||0,a=n[o]||0;if(i>a)return 1;if(i<a)return-1}return 0}function So(){let e=document.getElementById("vs-update-zone"),t=document.getElementById("vs-update-idle"),s=document.getElementById("vs-update-progress"),n=document.getElementById("vs-update-result"),o=document.getElementById("vs-update-file"),i=document.getElementById("vs-update-status"),a=document.getElementById("vs-dist-packages");if(!e||!o)return;r();async function r(){var l;if(a)try{let{ok:m,data:h}=await T.get("/update/dist-packages");if(!m||!((l=h==null?void 0:h.packages)!=null&&l.length)){a.innerHTML="";return}let g=h.current_version||"0.0.0",b=h.packages.map(f=>{let v=(f.size/1024/1024).toFixed(1),C=$o(f.version,g)>0,k=f.version===g,M=C?'<span class="vs-pill vs-pill-success" style="font-size: 10px;">newer</span>':k?'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">current</span>':'<span class="vs-pill vs-pill-subtle" style="font-size: 10px;">older</span>';return`
          <div class="vs-dist-pkg">
            <div class="vs-dist-pkg-info">
              <div class="vs-dist-pkg-name">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                <strong>${x(f.filename)}</strong>
                ${M}
              </div>
              <div class="vs-dist-pkg-meta">v${x(f.version)} \xB7 ${v} MB</div>
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
          ${b}
        </div>
      `,a.querySelectorAll(".vs-dist-apply-btn").forEach(f=>{f.addEventListener("click",()=>d(f.dataset.filename,f.dataset.version))})}catch{}}async function d(l,m){var g,b;if(!((g=window.demoGuard)!=null&&g.call(window)||!confirm(`Apply update from "${l}" (v${m})?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`))){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Applying ${l}...`,a&&(a.innerHTML="");try{let{ok:f,data:v,error:C}=await T.post("/update/apply-local",{filename:l});s.classList.add("hidden"),n.classList.remove("hidden");let k=document.getElementById("vs-update-result-icon"),M=document.getElementById("vs-update-result-message");if(f){let D=v;k.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',M.innerHTML=`
          <div class="vs-update-result-title">${x(D.message)}</div>
          <div class="vs-update-result-meta">
            ${D.files_updated} files updated \xB7 ${D.files_skipped} preserved
            ${(b=D.errors)!=null&&b.length?` \xB7 ${D.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",(C==null?void 0:C.message)||"Unknown error")}catch(f){c("Update Failed",x(f.message||"Network error."))}}}e.addEventListener("click",l=>{var m;(m=window.demoGuard)!=null&&m.call(window)||l.target.closest("#vs-update-result")||o.click()}),e.addEventListener("dragover",l=>{l.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",l=>{var h,g,b;if(l.preventDefault(),e.classList.remove("is-dragover"),(h=window.demoGuard)!=null&&h.call(window))return;let m=(b=(g=l.dataTransfer)==null?void 0:g.files)==null?void 0:b[0];m&&m.name.endsWith(".zip")&&p(m)}),o.addEventListener("change",()=>{var m;let l=(m=o.files)==null?void 0:m[0];l&&p(l),o.value=""});async function p(l){var g,b;let m=document.querySelector(".vs-sys-grid");if(m){let f=m.querySelectorAll(".vs-sys-value"),v="";if(m.querySelectorAll(".vs-sys-label").forEach((C,k)=>{var M,D;C.textContent.trim()==="Upload Limit"&&(v=((D=(M=f[k])==null?void 0:M.textContent)==null?void 0:D.trim())||"")}),v){let C=u(v);if(C>0&&l.size>C){let k=(l.size/1024/1024).toFixed(1);c("File Too Large",`The update file is ${k} MB but your server's upload limit is ${v}. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in your php.ini to at least ${k} MB, then restart your web server.`);return}}}if(confirm(`Apply update from "${l.name}" (${(l.size/1024/1024).toFixed(1)} MB)?

This will overwrite system files. Your pages, database, settings, and uploaded files are preserved.

A page reload is required after the update completes.`)){t.classList.add("hidden"),n.classList.add("hidden"),s.classList.remove("hidden"),i.textContent=`Uploading ${l.name}...`;try{let f=new FormData;f.append("update_zip",l);let v=I.get("sessionToken"),C=await fetch("/_studio/api/router.php?_path=%2Fupdate%2Fupload",{method:"POST",credentials:"same-origin",headers:v?{"X-VS-Token":v}:{},body:f}),k=C.headers.get("content-type")||"",M;if(!k.includes("application/json")){let q=await C.text();if(q.includes("POST Content-Length")||q.includes("upload_max_filesize")||q.includes("exceeds")){c("Server Upload Limit Exceeded",`The file (${(l.size/1024/1024).toFixed(1)} MB) exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`);return}c("Upload Failed","The server returned an unexpected response. Check your PHP error log for details.");return}M=await C.json(),s.classList.add("hidden"),n.classList.remove("hidden");let D=document.getElementById("vs-update-result-icon"),z=document.getElementById("vs-update-result-message");if(M.ok){let q=M.data;D.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',z.innerHTML=`
          <div class="vs-update-result-title">${x(q.message)}</div>
          <div class="vs-update-result-meta">
            ${q.files_updated} files updated \xB7 ${q.files_skipped} preserved
            ${(g=q.errors)!=null&&g.length?` \xB7 ${q.errors.length} errors`:""}
          </div>
          <button class="vs-btn vs-btn-primary vs-btn-sm mt-3" onclick="location.reload()">
            Reload Studio
          </button>
        `}else c("Update Failed",((b=M.error)==null?void 0:b.message)||"Unknown error")}catch(f){let v=f.message||"Network error. Check your connection.";v.includes("Unexpected token")||v.includes("not valid JSON")?c("Server Upload Limit Exceeded",`The file (${(l.size/1024/1024).toFixed(1)} MB) likely exceeds your server's PHP upload limit. Increase <code>upload_max_filesize</code> and <code>post_max_size</code> in php.ini, then restart your web server.`):c("Upload Failed",x(v))}}}function c(l,m){s.classList.add("hidden"),n.classList.remove("hidden");let h=document.getElementById("vs-update-result-icon"),g=document.getElementById("vs-update-result-message");h.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--vs-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',g.innerHTML=`
      <div class="vs-update-result-title" style="color: var(--vs-error);">${x(l)}</div>
      <div class="vs-update-result-meta">${m}</div>
      <button class="vs-btn vs-btn-ghost vs-btn-sm mt-3" onclick="document.getElementById('vs-update-result').classList.add('hidden'); document.getElementById('vs-update-idle').classList.remove('hidden');">
        Try Again
      </button>
    `}function u(l){let m=l.match(/([\d.]+)\s*(MB|M|GB|G|KB|K)/i);if(!m)return 0;let h=parseFloat(m[1]),g=m[2].toUpperCase();return g==="GB"||g==="G"?h*1024*1024*1024:g==="MB"||g==="M"?h*1024*1024:g==="KB"||g==="K"?h*1024:0}}function To(){let e=document.getElementById("vs-favicon-zone"),t=document.getElementById("vs-favicon-file"),s=document.getElementById("btn-favicon-upload"),n=document.getElementById("btn-favicon-remove");if(!e||!t)return;s==null||s.addEventListener("click",i=>{var a;i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))&&t.click()}),e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("is-dragover")}),e.addEventListener("dragleave",()=>e.classList.remove("is-dragover")),e.addEventListener("drop",i=>{var r,d,p;if(i.preventDefault(),e.classList.remove("is-dragover"),(r=window.demoGuard)!=null&&r.call(window))return;let a=(p=(d=i.dataTransfer)==null?void 0:d.files)==null?void 0:p[0];a&&o(a)}),t.addEventListener("change",()=>{var a;let i=(a=t.files)==null?void 0:a[0];i&&o(i),t.value=""}),n==null||n.addEventListener("click",async i=>{var a,r;if(i.stopPropagation(),!((a=window.demoGuard)!=null&&a.call(window))){n.disabled=!0,n.style.opacity="0.5";try{let d=await T.delete("/settings/favicon");d.ok?(j("Favicon removed.","success"),Ve()):j(((r=d.error)==null?void 0:r.message)||"Could not remove favicon.","error")}catch{j("Could not remove favicon.","error")}}});async function o(i){var c;if(i.size>524288){j("Favicon must be under 512 KB.","error");return}let r=["image/x-icon","image/vnd.microsoft.icon"];if(!/\.ico$/i.test(i.name)&&!r.includes(i.type)){j("Favicon must be a .ico file.","error");return}let p=document.getElementById("vs-favicon-preview");p&&(p.innerHTML=`<div class="vs-favicon-placeholder vs-favicon-uploading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="vs-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>`);try{let u=new FormData;u.append("favicon",i);let l=I.get("sessionToken"),h=await(await fetch("/_studio/api/router.php?_path=%2Fsettings%2Ffavicon",{method:"POST",credentials:"same-origin",headers:l?{"X-VS-Token":l}:{},body:u})).json();h.ok?(j("Favicon updated.","success"),Ve()):(j(((c=h.error)==null?void 0:c.message)||"Upload failed.","error"),Ve())}catch{j("Upload failed. Check your connection.","error"),Ve()}}}function sn(e,t,s){var d,p,c;(d=document.getElementById("vs-knowledge-overlay"))==null||d.remove();let n=u=>u.replace(/[_-]/g," ").replace(/\b\w/g,l=>l.toUpperCase()),o="";s==="memory"?o=Object.entries(t).map(([u,l])=>{let m=typeof l=="object"?l.value||JSON.stringify(l):String(l),h=typeof l=="object"?l.confidence:null,g=h==="stated"?"vs-kv-badge-stated":"vs-kv-badge-inferred";return`
        <div class="vs-kv-row">
          <div class="vs-kv-label">${x(n(u))}</div>
          <div class="vs-kv-value">
            <span>${x(m)}</span>
            ${h?`<span class="vs-kv-badge ${g}">${x(h)}</span>`:""}
          </div>
        </div>`}).join(""):o=Object.entries(t).map(([u,l])=>`
      <div class="vs-kv-section">
        <div class="vs-kv-section-label">${x(n(u))}</div>
        <div class="vs-kv-section-body">${x(String(l))}</div>
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
  `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible"));let a=()=>{i.classList.remove("is-visible"),setTimeout(()=>i.remove(),300),document.removeEventListener("keydown",r)},r=u=>{u.key==="Escape"&&a()};document.addEventListener("keydown",r),(p=i.querySelector("#vs-knowledge-close"))==null||p.addEventListener("click",a),(c=i.querySelector("#vs-knowledge-done"))==null||c.addEventListener("click",a),i.addEventListener("click",u=>{u.target===i&&a()})}function Bo(){let e=document.getElementById("btn-reset-site");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||_o()})}function Mo(){let e=document.getElementById("btn-reset-install");e&&e.addEventListener("click",()=>{var t;(t=window.demoGuard)!=null&&t.call(window)||Io()})}function Io(){let e=document.getElementById("reset-install-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-install-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var d;(d=document.getElementById("reset-install-confirm-input"))==null||d.focus()},350);let s=document.getElementById("reset-install-confirm-input"),n=document.getElementById("reset-install-confirm-btn"),o=document.getElementById("reset-install-cancel-btn"),i=document.getElementById("reset-install-modal"),a="RESET INSTALLATION";s==null||s.addEventListener("input",()=>{let d=s.value.trim()===a;n==null||n.classList.toggle("is-enabled",d),s.classList.toggle("is-matched",d)}),s==null||s.addEventListener("keydown",d=>{d.key==="Enter"&&(s.value.trim()===a?nn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())===a?nn(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>ue(t)),t.addEventListener("click",d=>{d.target===t&&ue(t)});let r=d=>{d.key==="Escape"&&(ue(t),document.removeEventListener("keydown",r))};document.addEventListener("keydown",r)}async function nn(e){let t=document.getElementById("reset-install-confirm-btn"),s=document.getElementById("reset-install-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Erasing\u2026
  `,s&&(s.disabled=!0);try{let{ok:n,data:o,error:i}=await T.post("/site/reset-install",{confirm:"RESET INSTALLATION"});if(n)t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{window.location.href=(o==null?void 0:o.redirect)||"/_studio/install.php"},800);else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Erase Everything
      `,s&&(s.disabled=!1);let a=e.querySelector(".vs-modal-desc");if(a){let r=a.innerHTML;a.textContent=(i==null?void 0:i.message)||"Reset failed. Please try again.",a.style.color="var(--vs-error)",setTimeout(()=>{a.innerHTML=r,a.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Erase Everything",s&&(s.disabled=!1)}}}function ln(){return new Promise(e=>{let t=document.getElementById("unsaved-modal-overlay");t&&t.remove();let s=document.createElement("div");s.id="unsaved-modal-overlay",s.className="vs-modal-overlay",s.innerHTML=`
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
    `,document.body.appendChild(s),s.offsetHeight,s.classList.add("is-visible");let n=i=>{document.removeEventListener("keydown",o,{capture:!0}),s.classList.remove("is-visible"),setTimeout(()=>{s.remove(),e(i)},300)},o=i=>{i.key==="Escape"&&(i.preventDefault(),i.stopPropagation(),n(!1))};document.addEventListener("keydown",o,{capture:!0}),document.getElementById("unsaved-cancel-btn").addEventListener("click",()=>n(!1)),document.getElementById("unsaved-discard-btn").addEventListener("click",()=>n(!0))})}function _o(){let e=document.getElementById("reset-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="reset-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>{requestAnimationFrame(()=>{t.classList.add("is-visible")})}),setTimeout(()=>{var r;(r=document.getElementById("reset-confirm-input"))==null||r.focus()},350);let s=document.getElementById("reset-confirm-input"),n=document.getElementById("reset-confirm-btn"),o=document.getElementById("reset-cancel-btn"),i=document.getElementById("reset-modal");s==null||s.addEventListener("input",()=>{let r=s.value.trim()==="RESET";n==null||n.classList.toggle("is-enabled",r),s.classList.toggle("is-matched",r)}),s==null||s.addEventListener("keydown",r=>{r.key==="Enter"&&(s.value.trim()==="RESET"?on(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400)))}),n==null||n.addEventListener("click",()=>{(s==null?void 0:s.value.trim())==="RESET"?on(t):(i==null||i.classList.add("shake"),setTimeout(()=>i==null?void 0:i.classList.remove("shake"),400))}),o==null||o.addEventListener("click",()=>ue(t)),t.addEventListener("click",r=>{r.target===t&&ue(t)});let a=r=>{r.key==="Escape"&&(ue(t),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}async function on(e){var n,o;let t=document.getElementById("reset-confirm-btn"),s=document.getElementById("reset-confirm-input");if(t){t.classList.add("is-loading"),t.classList.remove("is-enabled"),t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Resetting\u2026
  `,s&&(s.disabled=!0);try{let{ok:i,data:a,error:r}=await T.post("/site/reset",{confirm:"RESET"});if(i){I.set("pages",[]),I.set("hasFormSchemas",!1),I.set("conversations",null),I.set("activeConversationId",null);try{localStorage.removeItem("vs-active-conversation")}catch{}window.__vsPublishState&&(window.__vsPublishState.hasChanges=!1,window.__vsPublishState.counts={added:0,modified:0,deleted:0},window.__vsPublishState.error=null),(n=window.applyPublishStateUi)==null||n.call(window),(o=window.refreshPublishState)==null||o.call(window,{silent:!0}),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        Done!
      `,t.style.background="var(--vs-success)",t.style.opacity="1",setTimeout(()=>{ue(e),window.location.hash!=="#/chat"?window.location.hash="#/chat":window.dispatchEvent(new HashChangeEvent("hashchange"))},800)}else{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.innerHTML=`
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        Reset Everything
      `,s&&(s.disabled=!1);let d=e.querySelector(".vs-modal-desc");if(d){let p=d.textContent;d.textContent=(r==null?void 0:r.message)||"Reset failed. Please try again.",d.style.color="var(--vs-error)",setTimeout(()=>{d.textContent=p,d.style.color=""},4e3)}}}catch{t.classList.remove("is-loading"),t.classList.add("is-enabled"),t.textContent="Reset Everything",s&&(s.disabled=!1)}}}async function Ao(e){var s;let t=document.getElementById("set-ai-model");if(t)try{let{ok:n,data:o}=await T.get("/settings/models");n&&((s=o==null?void 0:o.models)!=null&&s.length)?t.innerHTML=o.models.map(i=>`<option value="${x(i.id)}" ${i.id===e?"selected":""}>${x(i.name||i.id)}</option>`).join(""):t.innerHTML='<option value="">Test your connection to load available models</option>'}catch{t.innerHTML='<option value="">Test your connection to load available models</option>'}}function fe(e,t){return`
    <div class="vs-sys-item">
      <span class="vs-sys-label">${e}</span>
      <span class="vs-sys-value">${t}</span>
    </div>
  `}function ks(e){return!e&&e!==0?"?":e>=1048576?(e/1048576).toFixed(1)+" MB":e>=1024?(e/1024).toFixed(1)+" KB":e+" B"}function Po(e,t){let s=e.ai_provider||"claude",n=document.getElementById("set-ai-provider");n&&n.addEventListener("change",async c=>{var u;if((u=window.demoGuard)!=null&&u.call(window)){c.target.value=s;return}s=c.target.value,await T.put("/settings",{ai_provider:s}),Ve()});let o=document.getElementById("btn-test-api"),i=document.getElementById("set-api-key");o&&o.addEventListener("click",async()=>{var g,b,f,v,C;if((g=window.demoGuard)!=null&&g.call(window))return;let c=((b=i==null?void 0:i.value)==null?void 0:b.trim())||"",u=((v=(f=document.getElementById("set-base-url"))==null?void 0:f.value)==null?void 0:v.trim())||"";if(s!=="openai_compatible"&&(!c||c.startsWith("\u2022\u2022"))){Cs("Enter a new API key to test.","warning");return}o.textContent="Testing...",o.disabled=!0;let{ok:l,data:m,error:h}=await T.post("/settings/test-api",{provider:s,api_key:c.startsWith("\u2022\u2022")?"":c,base_url:u});if(o.textContent="Test Connection",o.disabled=!1,l){if(Cs("\u2713 Connected successfully!","success"),(C=m==null?void 0:m.models)!=null&&C.length){let k=document.getElementById("set-ai-model");if(k){let M=e[`ai_${s}_model`]||"";k.innerHTML=m.models.map(D=>`<option value="${x(D.id)}" ${D.id===M?"selected":""}>${x(D.name||D.id)}</option>`).join("")}}}else Cs("\u2717 "+((h==null?void 0:h.message)||"Connection failed."),"error")});let a=document.getElementById("btn-save-identity"),r=document.getElementById("save-identity-status");a&&a.addEventListener("click",async()=>{var m,h,g,b,f;if((m=window.demoGuard)!=null&&m.call(window))return;a.textContent="Saving...",a.disabled=!0;let c={site_name:((g=(h=document.getElementById("set-site-name"))==null?void 0:h.value)==null?void 0:g.trim())||"",site_tagline:((f=(b=document.getElementById("set-site-tagline"))==null?void 0:b.value)==null?void 0:f.trim())||""},{ok:u,error:l}=await T.put("/settings",c);if(a.textContent="Save Identity",a.disabled=!1,r){if(r.classList.remove("hidden"),u){r.textContent="\u2713 Saved",r.className="text-xs text-vs-success ml-3",I.set("siteName",c.site_name),document.title=c.site_name?`Studio \u2014 ${c.site_name}`:"Studio \u2014 VoxelSite";let v=document.querySelector(".vs-logo-text");v&&(v.textContent=c.site_name||"VoxelSite")}else r.textContent="\u2717 "+((l==null?void 0:l.message)||"Failed to save."),r.className="text-xs text-vs-error ml-3";setTimeout(()=>r==null?void 0:r.classList.add("hidden"),3e3)}});let d=document.getElementById("btn-save-settings"),p=document.getElementById("save-status");d&&d.addEventListener("click",async()=>{var g,b,f,v;if((g=window.demoGuard)!=null&&g.call(window))return;d.textContent="Saving...",d.disabled=!0;let c={ai_provider:s,[`ai_${s}_model`]:((b=document.getElementById("set-ai-model"))==null?void 0:b.value)||"",ai_max_tokens:parseInt(((f=document.getElementById("set-max-tokens"))==null?void 0:f.value)||"32000",10)},u=document.getElementById("set-base-url");u&&(c.ai_openai_compatible_base_url=u.value.trim());let l=(v=i==null?void 0:i.value)==null?void 0:v.trim();l&&!l.startsWith("\u2022\u2022")&&(c[`ai_${s}_api_key`]=l);let{ok:m,error:h}=await T.put("/settings",c);d.textContent="Save Settings",d.disabled=!1,p&&(p.classList.remove("hidden"),m?(p.textContent="\u2713 Saved",p.className="text-xs text-vs-success ml-3"):(p.textContent="\u2717 "+((h==null?void 0:h.message)||"Failed to save."),p.className="text-xs text-vs-error ml-3"),setTimeout(()=>p==null?void 0:p.classList.add("hidden"),3e3))})}function jo(e,t){var m;let s=document.getElementById("set-mail-driver"),n=document.getElementById("mail-smtp-fields"),o=document.getElementById("mail-mailpit-fields"),i=document.getElementById("set-smtp-preset"),a=document.getElementById("smtp-preset-help");function r(){if(!e.smtp_host)return"gmail";for(let[h,g]of Object.entries(t))if(g.host&&g.host===e.smtp_host)return h;return"custom"}if(i){let h=r();i.value=h,a&&((m=t[h])!=null&&m.help)&&(a.textContent=t[h].help)}s&&s.addEventListener("change",()=>{let h=s.value;n&&(n.style.display=h==="smtp"?"block":"none"),o&&(o.style.display=h==="mailpit"?"block":"none");let g=document.getElementById("mail-common-fields");g&&(g.style.display=h==="none"?"none":"block")}),i&&i.addEventListener("change",()=>{let h=t[i.value];if(!h)return;let g=document.getElementById("set-smtp-host"),b=document.getElementById("set-smtp-port"),f=document.getElementById("set-smtp-encryption");g&&(g.value=h.host||""),b&&(b.value=h.port||587),f&&(f.value=h.encryption||"tls"),a&&(a.textContent=h.help||"")});let d=document.getElementById("btn-toggle-smtp-pass"),p=document.getElementById("set-smtp-password");d&&p&&d.addEventListener("click",()=>{let h=p.type==="password";p.type=h?"text":"password",d.innerHTML=h?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'});let c=document.getElementById("btn-mail-test");c&&c.addEventListener("click",async()=>{var C,k,M;if((C=window.demoGuard)!=null&&C.call(window))return;let h=(M=(k=document.getElementById("set-mail-test-recipient"))==null?void 0:k.value)==null?void 0:M.trim();if(!h){Es("Enter an email address to send the test to.","warning");return}c.textContent="Sending...",c.disabled=!0;let g=an();g.test_recipient=h;let{ok:b,data:f,error:v}=await T.post("/settings/mail/test",g);c.textContent="Send Test",c.disabled=!1,b?Es("\u2713 "+((f==null?void 0:f.message)||"Test email sent successfully!"),"success"):Es("\u2717 "+((v==null?void 0:v.message)||"Test failed."),"error")});let u=document.getElementById("btn-save-mail"),l=document.getElementById("save-mail-status");u&&u.addEventListener("click",async()=>{var f;if((f=window.demoGuard)!=null&&f.call(window))return;u.textContent="Saving...",u.disabled=!0;let h=an(),{ok:g,error:b}=await T.post("/settings/mail",h);u.textContent="Save Email Settings",u.disabled=!1,l&&(l.classList.remove("hidden"),g?(l.textContent="\u2713 Saved",l.className="text-xs text-vs-success ml-3"):(l.textContent="\u2717 "+((b==null?void 0:b.message)||"Failed to save."),l.className="text-xs text-vs-error ml-3"),setTimeout(()=>l==null?void 0:l.classList.add("hidden"),3e3))})}function an(){var t,s,n,o,i,a,r,d,p,c,u,l,m,h,g;let e=((t=document.getElementById("set-smtp-password"))==null?void 0:t.value)||"";return{driver:((s=document.getElementById("set-mail-driver"))==null?void 0:s.value)||"none",from_address:((o=(n=document.getElementById("set-mail-from-address"))==null?void 0:n.value)==null?void 0:o.trim())||"",from_name:((a=(i=document.getElementById("set-mail-from-name"))==null?void 0:i.value)==null?void 0:a.trim())||"",smtp_host:((d=(r=document.getElementById("set-smtp-host"))==null?void 0:r.value)==null?void 0:d.trim())||"",smtp_port:parseInt(((p=document.getElementById("set-smtp-port"))==null?void 0:p.value)||"587",10),smtp_username:((u=(c=document.getElementById("set-smtp-username"))==null?void 0:c.value)==null?void 0:u.trim())||"",smtp_password:e.startsWith("\u2022\u2022")?"":e,smtp_encryption:((l=document.getElementById("set-smtp-encryption"))==null?void 0:l.value)||"tls",mailpit_host:((h=(m=document.getElementById("set-mailpit-host"))==null?void 0:m.value)==null?void 0:h.trim())||"localhost",mailpit_port:parseInt(((g=document.getElementById("set-mailpit-port"))==null?void 0:g.value)||"1025",10)}}function Es(e,t){let s=document.getElementById("mail-test-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}function Cs(e,t){let s=document.getElementById("api-key-status");s&&(s.classList.remove("hidden"),s.textContent=e,s.className=`text-xs mt-1.5 ${t==="success"?"text-vs-success":t==="error"?"text-vs-error":"text-vs-warning"}`)}var Ho=[{route:"chat",label:"Chat"},{route:"editor",label:"Editor"},{route:"assets",label:"Assets"},{route:"forms",label:"Forms"},{route:"snapshots",label:"Snapshots"},{route:"settings",label:"Settings"}],Ss=["chat","editor"],Ro="vs-first-run-guide-dismissed",wn="vs-onboarding-draft-v1",kn="vs-prompt-recents-v1",En="vs-prompt-pins-v1",Do=8,No=5,dn=5,Fo=5*1024*1024,Ts=["image/jpeg","image/png","image/gif","image/webp"],Ge=[],ke=document.documentElement.dataset.demo==="true";function Re(){return ke?(j("Demo mode \u2014 this action is disabled.","warning"),!0):!1}window.IS_DEMO=ke;window.demoGuard=Re;var Cn=document.getElementById("app");async function Ln(){var s;Hs(),zs(),window.marked&&window.marked.use({renderer:{html(n){return x(typeof n=="string"?n:n.text)}}});let e=await T.get("/auth/session");if(!e.ok||!((s=e.data)!=null&&s.user)){xn();return}I.batch(()=>{I.set("user",e.data.user),I.set("sessionToken",e.data.token),I.set("siteName",e.data.site_name||"")});let t=e.data.site_name;t&&(document.title=`Studio \u2014 ${t}`),window.addEventListener("beforeunload",n=>{var o;(o=window.__hasUnsavedEditorChanges)!=null&&o.call(window)&&(n.preventDefault(),n.returnValue="")}),Je.beforeEach(async(n,o)=>{var i;return o.startsWith("editor")&&!n.startsWith("editor")&&(i=window.__hasUnsavedEditorChanges)!=null&&i.call(window)?await ln():!0}).on("chat",()=>we()).on("editor",()=>we()).on("pages",()=>we()).on("pages/:slug",()=>we()).on("assets",()=>we()).on("forms",()=>we()).on("forms/:formId",()=>we()).on("snapshots",()=>we()).on("settings",()=>we()).on("profile",()=>we()).onNotFound(()=>Je.navigate("chat")),I.on("user",n=>{n||xn()}),$n(),Je.start()}async function $n(){try{let{ok:e,data:t}=await T.get("/pages");if(e&&Array.isArray(t==null?void 0:t.pages)){I.set("pages",t.pages);let s=document.getElementById("chat-messages");s!=null&&s.querySelector(".vs-empty-state")&&(s.innerHTML=bt(),ft())}}catch{}}function we(){let e=I.get("route"),t=Ss.includes(e);$t()&&St(),e!=="editor"&&window.__vsEditorPage&&(window.__vsEditorPage.dispose(),window.__vsEditorPage=null);let s;e==="editor"?s=Qs():t?s=Uo():s=zo(),Cn.innerHTML=`
    ${qo()}
    <div class="fixed top-[48px] bottom-[32px] left-0 right-0 overflow-hidden">
      ${s}
    </div>
    ${ci()}
    ${pi()}
    ${fi()}
  `,wi(),e==="editor"&&en()}function qo(){let e=I.get("route"),t=I.get("user"),s=I.get("theme"),n=Ho.map(o=>{let i=e===o.route||e.startsWith(o.route+"/");return`
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
            <span class="vs-logo-text hidden sm:inline">${x(I.get("siteName")||"VoxelSite")}</span>
          </a>
          <nav class="flex items-center gap-0.5" aria-label="Studio navigation">
            ${n}
          </nav>
          ${ke?`
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
              <a href="#/profile" id="btn-edit-profile" class="vs-dropdown-item">
                ${E.pencil} Edit Profile
              </a>
              <div style="border-top: 1px solid var(--vs-border-subtle); margin: 4px 0;"></div>
              <button id="btn-logout" class="vs-dropdown-item">
                ${E.logOut} Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  `}function Uo(){let e=I.get("sidebarWidth"),t=I.get("activeConversationId"),s=I.get("activePageScope"),n=Sn(s);return`
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
          ${bt()}
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
                ${E.image}
              </button>
              <button id="btn-send"
                class="vs-prompt-send"
                title="Send (\u2318+Enter)">
                ${E.send}
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
            <button class="vs-device-btn vs-device-btn-active" data-device="desktop" title="Desktop">${E.monitor}</button>
            <button class="vs-device-btn" data-device="tablet" title="Tablet">${E.tabletSmartphone}</button>
            <button class="vs-device-btn" data-device="mobile" title="Mobile">${E.smartphone}</button>
          </div>
          <div class="flex items-center gap-1">
            <button id="btn-visual-editor" class="vs-btn vs-btn-ghost vs-btn-xs" title="Visual editor (V)">
              ${E.pencil} Visual
            </button>
            <button id="btn-edit-code" class="vs-btn vs-btn-ghost vs-btn-xs" title="Source code editor">
              ${E.fileCode} Code
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
  `}function zo(){let e=I.get("route"),t=I.get("routeParams"),s="1100px";return(e==="settings"||e==="profile")&&(s="680px"),e==="forms/:formId"&&(s="800px"),`
    <div class="h-full overflow-y-auto">
      <div class="mx-auto px-6 py-8" style="max-width: ${s};">
        ${Oo(e,t)}
      </div>
    </div>
  `}function Oo(e,t){switch(e){case"assets":return Yo();case"forms":return ei();case"forms/:formId":return si(t.formId);case"snapshots":return Jo();case"settings":return rn();case"profile":return Go();default:return Vo("Not Found","This page doesn't exist.")}}function Vo(e,t){return`
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
      <p class="text-2xs text-vs-text-ghost mt-4">Coming in a future update.</p>
    </div>
  `}function Wo(e){let t={index:"home",home:"home",about:"users","about-us":"users",team:"users",contact:"mail","contact-us":"mail",services:"briefcase",work:"briefcase",portfolio:"briefcase",projects:"briefcase",blog:"book",news:"book",articles:"book",posts:"book",shop:"shoppingBag",store:"shoppingBag",products:"shoppingBag",pricing:"shoppingBag",faq:"globe",help:"globe",support:"globe"},s=(e||"").toLowerCase().replace(/[^a-z0-9-]/g,"");return E[t[s]||"layoutGrid"]||E.layoutGrid}function cn(e){Je.navigate("chat"),setTimeout(()=>{let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.style.height="auto",t.style.height=t.scrollHeight+"px")},150)}function Go(){let e=I.get("user")||{};return setTimeout(()=>Ko(),0),`
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
  `}function Ko(){let e=document.getElementById("btn-save-profile"),t=document.getElementById("profile-info-feedback");e&&e.addEventListener("click",async()=>{var p,c,u,l;let o=(c=(p=document.getElementById("profile-name"))==null?void 0:p.value)==null?void 0:c.trim(),i=(l=(u=document.getElementById("profile-email"))==null?void 0:u.value)==null?void 0:l.trim();if(!o||o.length<2){t&&(t.textContent="Name must be at least 2 characters.",t.className="text-sm text-vs-error");return}e.disabled=!0,e.textContent="Saving...";let{ok:a,error:r,data:d}=await T.put("/auth/profile",{name:o,email:i});e.disabled=!1,e.textContent="Save Profile",a&&(d!=null&&d.user)?(I.set("user",d.user),t&&(t.textContent="Profile updated.",t.className="text-sm text-vs-success"),setTimeout(()=>we(),800)):t&&(t.textContent=(r==null?void 0:r.message)||"Failed to update profile.",t.className="text-sm text-vs-error")});let s=document.getElementById("btn-save-password"),n=document.getElementById("profile-pw-feedback");s&&s.addEventListener("click",async()=>{var p,c,u;let o=((p=document.getElementById("profile-current-pw"))==null?void 0:p.value)||"",i=((c=document.getElementById("profile-new-pw"))==null?void 0:c.value)||"",a=((u=document.getElementById("profile-confirm-pw"))==null?void 0:u.value)||"";if(!o){n&&(n.textContent="Current password is required.",n.className="text-sm text-vs-error");return}if(i.length<8){n&&(n.textContent="New password must be at least 8 characters.",n.className="text-sm text-vs-error");return}if(i!==a){n&&(n.textContent="Passwords do not match.",n.className="text-sm text-vs-error");return}s.disabled=!0,s.textContent="Updating...";let{ok:r,error:d}=await T.put("/auth/password",{current_password:o,new_password:i});s.disabled=!1,s.textContent="Update Password",r?(document.getElementById("profile-current-pw").value="",document.getElementById("profile-new-pw").value="",document.getElementById("profile-confirm-pw").value="",n&&(n.textContent="Password updated.",n.className="text-sm text-vs-success")):n&&(n.textContent=(d==null?void 0:d.message)||"Failed to update password.",n.className="text-sm text-vs-error")})}function Yo(){return setTimeout(()=>At(),0),`
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
  `}async function At(e="all"){var f;let t=document.getElementById("assets-grid");if(!t)return;let s=document.getElementById("btn-upload-asset"),n=document.getElementById("asset-file-input");s&&n&&(s.onclick=()=>n.click(),n.onchange=async()=>{n.files.length!==0&&(await pn(n.files),n.value="",At(e))});let o=document.getElementById("asset-dropzone");o&&(o.onclick=v=>{v.target.closest("button")||n==null||n.click()},o.ondragover=v=>{v.preventDefault(),o.classList.add("is-dragover")},o.ondragleave=()=>{o.classList.remove("is-dragover")},o.ondrop=async v=>{v.preventDefault(),o.classList.remove("is-dragover"),v.dataTransfer.files.length>0&&(await pn(v.dataTransfer.files),At(e))});let i=document.getElementById("asset-filters");i&&i.querySelectorAll("[data-filter]").forEach(v=>{v.onclick=()=>{i.querySelectorAll("[data-filter]").forEach(C=>{C.className="vs-device-btn"}),v.className="vs-device-btn vs-device-btn-active",At(v.dataset.filter)}});let a=e==="code",r=!a&&e!=="all"?`?category=${e}`:"",{ok:d,data:p}=await T.get(`/assets${r}`);if(!d||!((f=p==null?void 0:p.assets)!=null&&f.length)){t.innerHTML=`
      <div class="vs-empty-state">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
          <p class="vs-empty-state-title">No files yet</p>
          <p class="vs-empty-state-desc">Upload images, documents, or fonts by dropping them here.</p>
          <button id="btn-empty-upload" class="vs-btn vs-btn-primary vs-btn-sm">Upload Files</button>
        </div>
      </div>
    `;let v=document.getElementById("btn-empty-upload"),C=document.getElementById("btn-upload-asset");v&&C&&v.addEventListener("click",()=>C.click());return}let c=p.assets;if(a&&(c=c.filter(v=>v.category==="css"||v.category==="js"),c.length===0)){t.innerHTML=`
        <div class="vs-empty-state">
          <div class="vs-empty-state-inner">
            <div class="vs-empty-state-icon">${E.fileCode}</div>
            <p class="vs-empty-state-title">No code files</p>
            <p class="vs-empty-state-desc">CSS and JS files will appear here.</p>
          </div>
        </div>
      `;return}let u=["jpg","jpeg","png","gif","webp","svg","ico"],l=c.filter(v=>v.category==="images"&&u.includes(v.extension)),m=c.filter(v=>!u.includes(v.extension)||v.category!=="images");function h(v,C){return v==="css"?E.fileCode:v==="js"?E.fileCode:v==="json"?E.fileJson:v==="pdf"?E.filePdf:["woff2","woff","ttf","otf"].includes(v)?E.type:["mp4","webm"].includes(v)?E.film:["mp3","wav","ogg"].includes(v)?E.music:["txt","md","csv"].includes(v)?E.fileText:["doc","docx","xls","xlsx"].includes(v)?E.fileText:C==="images"?E.image:E.fileText}let g=["css","js","json","svg"],b="";l.length>0&&(b+='<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">',l.forEach((v,C)=>{var z;let k=vn(v.size),M=v.width?`${v.width}\xD7${v.height}`:"",D=v.extension==="svg";b+=`
        <div class="vs-asset-card" data-lightbox-idx="${C}">
          <div class="vs-asset-card-thumb${D?" is-svg":""}" style="cursor:pointer">
            <img src="${v.thumbnail||v.path}" alt="${x(((z=v.meta)==null?void 0:z.alt)||v.filename)}"
              loading="lazy" />
          </div>
          <div class="vs-asset-card-info">
            <p class="vs-asset-card-name" title="${x(v.filename)}">${x(v.filename)}</p>
            <p class="vs-asset-card-meta">${M?M+" \xB7 ":""}${k}</p>
          </div>
          <div class="vs-asset-card-actions">
            <button data-copy-path="${v.path}" title="Copy web path"
              class="vs-asset-overlay-btn">${E.copy}</button>
            <button data-delete-asset="${v.path}" title="Delete"
              class="vs-asset-overlay-btn vs-asset-overlay-btn--danger">${E.x}</button>
          </div>
        </div>
      `}),b+="</div>"),m.length>0&&m.forEach(v=>{let C=vn(v.size),k=g.includes(v.extension);b+=`
        <div class="vs-asset-row group">
          <div class="flex items-center gap-3 min-w-0">
            <span class="vs-asset-row-icon">${h(v.extension,v.category)}</span>
            <div class="min-w-0">
              <p class="text-sm font-medium text-vs-text-primary truncate">${x(v.filename)}</p>
              <p class="text-xs text-vs-text-ghost">${v.category} \xB7 ${C}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            ${k?`
              <button data-edit-asset="${v.path}" title="Edit in code editor"
                class="vs-asset-action-btn">${E.pencil}</button>
            `:""}
            <button data-copy-path="${v.path}" title="Copy web path"
              class="vs-asset-action-btn">${E.copy}</button>
            ${v.category!=="css"&&v.category!=="js"?`
              <button data-delete-asset="${v.path}" title="Delete"
                class="vs-asset-action-btn vs-asset-action-btn--danger">${E.trash2}</button>
            `:""}
          </div>
        </div>
      `}),t.innerHTML=b,t.querySelectorAll("[data-lightbox-idx]").forEach(v=>{let C=v.querySelector(".vs-asset-card-thumb");C&&C.addEventListener("click",()=>{let k=parseInt(v.dataset.lightboxIdx,10);Zo(l,k,e)})}),t.querySelectorAll("[data-copy-path]").forEach(v=>{v.addEventListener("click",()=>{navigator.clipboard.writeText(v.dataset.copyPath).then(()=>{let C=v.innerHTML;v.innerHTML="\u2713",v.classList.add("vs-asset-action-copied"),setTimeout(()=>{v.innerHTML=C,v.classList.remove("vs-asset-action-copied")},1200)})})}),t.querySelectorAll("[data-edit-asset]").forEach(v=>{v.addEventListener("click",()=>{let k=v.dataset.editAsset.replace(/^\//,"");ws(k)})}),t.querySelectorAll("[data-delete-asset]").forEach(v=>{v.addEventListener("click",async()=>{if(!await ye({title:"Delete Asset",description:`Delete ${v.dataset.deleteAsset}?`,confirmLabel:"Delete",danger:!0}))return;let{ok:k}=await T.delete("/assets",{path:v.dataset.deleteAsset});k?(j("Asset deleted.","success"),At(e)):j("Could not delete asset.","error")})})}function Zo(e,t,s){let n=t;function o(l){if(l===0)return"0 B";let m=1024,h=["B","KB","MB","GB"],g=Math.floor(Math.log(l)/Math.log(m));return parseFloat((l/Math.pow(m,g)).toFixed(1))+" "+h[g]}let i=document.getElementById("vs-lightbox");i&&i.remove();function a(){var f,v;let l=e[n],m=l.width?`${l.width}\xD7${l.height}`:"",h=o(l.size),g=[m,h,(f=l.extension)==null?void 0:f.toUpperCase()].filter(Boolean),b=e.length>1;return`
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
          <div class="vs-lightbox-image-wrap${["svg","png"].includes(l.extension)?" is-transparent":""}">
            <img src="${l.path}" alt="${x(((v=l.meta)==null?void 0:v.alt)||l.filename)}" />
          </div>

          <div class="vs-lightbox-info">
            <span class="vs-lightbox-filename">${x(l.filename)}</span>
            <span class="vs-lightbox-details">${g.join(" \xB7 ")}${b?` \xB7 ${n+1} / ${e.length}`:""}</span>
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
    `}let r=document.createElement("div");r.id="vs-lightbox",r.className="vs-lightbox",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Image preview"),r.innerHTML=a(),document.body.appendChild(r),requestAnimationFrame(()=>{requestAnimationFrame(()=>r.classList.add("is-visible"))});function d(){r.classList.remove("is-visible"),setTimeout(()=>r.remove(),400),document.removeEventListener("keydown",c)}function p(l){n=l,r.innerHTML=a(),u()}function c(l){if(l.key==="Escape"){if(document.querySelector(".vs-modal-overlay.is-visible"))return;d(),l.preventDefault()}l.key==="ArrowRight"&&e.length>1&&(p((n+1)%e.length),l.preventDefault()),l.key==="ArrowLeft"&&e.length>1&&(p((n-1+e.length)%e.length),l.preventDefault())}function u(){var m,h,g;(m=r.querySelector("#lightbox-close"))==null||m.addEventListener("click",b=>{b.stopPropagation(),d()}),r.addEventListener("click",b=>{(b.target===r||b.target.classList.contains("vs-lightbox-stage"))&&d()}),(h=r.querySelector("#lightbox-prev"))==null||h.addEventListener("click",b=>{b.stopPropagation(),p((n-1+e.length)%e.length)}),(g=r.querySelector("#lightbox-next"))==null||g.addEventListener("click",b=>{b.stopPropagation(),p((n+1)%e.length)});let l=r.querySelector("#lightbox-copy");l==null||l.addEventListener("click",b=>{b.stopPropagation();let f=e[n];navigator.clipboard.writeText(f.path).then(()=>{let v=l.innerHTML;l.innerHTML=`${E.check}<span>Copied!</span>`,l.style.borderColor="var(--vs-success)",l.style.color="var(--vs-success)",setTimeout(()=>{l.innerHTML=v,l.style.borderColor="",l.style.color=""},2e3),j("Path copied!","success")})})}document.addEventListener("keydown",c),u()}async function pn(e){var i,a,r;if(Re())return;let t=document.getElementById("status-text");t&&(t.textContent=`Uploading ${e.length} file(s)...`);let s=new FormData;for(let d of e)s.append("file[]",d);let n=I.get("sessionToken"),o=n?{"X-VS-Token":n}:{};try{let p=await(await fetch("/_studio/api/router.php?_path=%2Fassets%2Fupload",{method:"POST",body:s,credentials:"same-origin",headers:o})).json();t&&(t.textContent=p.ok?`\u2713 ${((a=(i=p.data)==null?void 0:i.uploaded)==null?void 0:a.length)||0} file(s) uploaded`:"\u2717 "+(((r=p.error)==null?void 0:r.message)||"Upload failed"),setTimeout(()=>{t&&(t.textContent="Ready")},4e3))}catch{t&&(t.textContent="\u2717 Upload failed",setTimeout(()=>{t&&(t.textContent="Ready")},4e3))}}function vn(e){if(e===0)return"0 B";let t=1024,s=["B","KB","MB","GB"],n=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/Math.pow(t,n)).toFixed(1))+" "+s[n]}function Xo(e){let t=new Date(e),n=new Date-t,o=Math.floor(n/1e3),i=Math.floor(o/60),a=Math.floor(i/60),r=Math.floor(a/24);return o<60?"Just now":i<60?`${i} min${i!==1?"s":""} ago`:a<24?`${a} hour${a!==1?"s":""} ago`:r===1?"Yesterday":r<30?`${r} days ago`:t.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}function Jo(){return setTimeout(()=>Yt(),0),`
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
  `}async function Yt(){var i;let e=document.getElementById("snapshots-list");if(!e)return;let t=document.getElementById("btn-create-snapshot");t&&t.addEventListener("click",()=>{un()});let{ok:s,data:n}=await T.get("/snapshots");if(!s||!((i=n==null?void 0:n.snapshots)!=null&&i.length)){e.innerHTML=`
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
    `;let a=document.getElementById("btn-empty-create-snapshot");a&&a.addEventListener("click",()=>un());return}let o=n.snapshots;e.innerHTML=`
    <div class="vs-timeline">
      ${o.map((a,r)=>{let d=Xo(a.created_at),p=new Date(a.created_at).toLocaleString(),c=a.size_bytes?(a.size_bytes/1024).toFixed(0)+" KB":"\u2014",u=r===o.length-1,l,m,h;a.snapshot_type==="pre_publish"?(l="var(--vs-success)",m="vs-snap-badge-green",h="Pre-publish"):a.snapshot_type==="manual"?(l="var(--vs-accent)",m="vs-snap-badge-amber",h="Manual"):(l="var(--vs-text-ghost)",m="vs-snap-badge-gray",h="Auto");let g=a.description?`<p class="vs-timeline-desc">${x(a.description)}</p>`:"";return`
          <div class="vs-timeline-item${u?" vs-timeline-last":""}">
            <div class="vs-timeline-rail">
              <div class="vs-timeline-dot" style="background: ${l}; box-shadow: 0 0 0 3px color-mix(in srgb, ${l} 20%, transparent);"></div>
              <div class="vs-timeline-connector"></div>
            </div>
            <div class="vs-timeline-card">
              <div class="vs-timeline-card-header">
                <div class="flex items-center gap-2">
                  <span class="${m}">${h}</span>
                  <span class="vs-timeline-label">${x(a.label||"Snapshot #"+a.id)}</span>
                </div>
                <span class="vs-timeline-ago" title="${p}">${d}</span>
              </div>
              ${g}
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
  `,e.querySelectorAll("[data-preview-id]").forEach(a=>{a.addEventListener("click",()=>{let r=JSON.parse(a.dataset.snap);Qo(r)})}),e.querySelectorAll("[data-restore-id]").forEach(a=>{a.addEventListener("click",async()=>{let r=a.dataset.restoreId;if(!await ye({title:"Restore Snapshot",description:"This will overwrite your current preview. A safety snapshot of your current state will be created automatically.",confirmLabel:"Restore"}))return;a.innerHTML=`${E.rotateCcw} Restoring\u2026`,a.disabled=!0;let{ok:p,error:c}=await T.post(`/snapshots/${r}/restore`);if(p){let u=document.getElementById("status-text");u&&(u.textContent="\u2713 Snapshot restored",setTimeout(()=>{u&&(u.textContent="Ready")},4e3)),j("Snapshot restored.","success"),Yt()}else j((c==null?void 0:c.message)||"Failed to restore snapshot.","error"),a.innerHTML=`${E.rotateCcw} Restore`,a.disabled=!1})}),e.querySelectorAll("[data-delete-id]").forEach(a=>{a.addEventListener("click",async()=>{let r=a.dataset.deleteId;if(!await ye({title:"Delete Snapshot",description:"This snapshot will be removed permanently.",confirmLabel:"Delete",danger:!0}))return;a.innerHTML="Deleting\u2026",a.disabled=!0;let{ok:p,error:c}=await T.delete(`/snapshots/${r}`);p?(j("Snapshot deleted.","success"),Yt()):(j((c==null?void 0:c.message)||"Failed to delete snapshot.","error"),a.innerHTML=`${E.trash2}`,a.disabled=!1)})})}function un(){var i;let e=document.getElementById("vs-snapshot-create-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-snapshot-create-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>ue(t);t.addEventListener("click",a=>{a.target===t&&s()}),(i=document.getElementById("snap-cancel"))==null||i.addEventListener("click",s);let n=document.getElementById("snap-desc"),o=document.getElementById("snap-save");n==null||n.addEventListener("keydown",a=>{a.key==="Enter"&&(o==null||o.click())}),o==null||o.addEventListener("click",async()=>{var p;let a=((p=n==null?void 0:n.value)==null?void 0:p.trim())||"";o.innerHTML="Creating\u2026",o.disabled=!0;let{ok:r,error:d}=await T.post("/snapshots",{type:"manual",label:"Manual snapshot",description:a});s(),r?(j("Snapshot created.","success"),Yt()):j((d==null?void 0:d.message)||"Failed to create snapshot.","error")})}function Qo(e){var i;let t=document.getElementById("vs-snapshot-preview-overlay");t&&t.remove();let s=document.createElement("div");s.id="vs-snapshot-preview-overlay",s.className="vs-modal-overlay";let n,o;e.type==="pre_publish"?(n="var(--vs-success)",o="Pre-publish"):e.type==="manual"?(n="var(--vs-accent)",o="Manual"):(n="var(--vs-text-ghost)",o="Auto"),s.innerHTML=`
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
  `,document.body.appendChild(s),requestAnimationFrame(()=>s.classList.add("is-visible")),s.addEventListener("click",a=>{a.target===s&&ue(s)}),(i=document.getElementById("snap-preview-close"))==null||i.addEventListener("click",()=>ue(s))}var Ee={new:{bg:"var(--vs-info-dim)",text:"var(--vs-info)",label:"New"},read:{bg:"var(--vs-accent-dim)",text:"var(--vs-accent)",label:"Read"},replied:{bg:"var(--vs-success-dim)",text:"var(--vs-success)",label:"Replied"},archived:{bg:"var(--vs-bg-raised)",text:"var(--vs-text-ghost)",label:"Archived"}};function ei(){return setTimeout(()=>ti(),0),`
    <div>
      <div class="vs-page-header" style="margin-bottom: 24px;">
        <h1 class="vs-page-title">Forms</h1>
        <p class="vs-page-subtitle">View and manage submissions from your website's forms.</p>
      </div>
      <div id="forms-list">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading forms...</div>
      </div>
    </div>
  `}async function ti(){let e=document.getElementById("forms-list");if(!e)return;let{ok:t,data:s}=await T.get("/forms");if(!t||!s){e.innerHTML='<div class="text-sm text-vs-error py-6">Failed to load forms.</div>';return}let n=s.forms||[];if(!n.length){e.innerHTML=`
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
  `}function si(e){return setTimeout(()=>ni(e),0),`
    <div>
      <div id="form-detail-header">
        <div class="text-sm text-vs-text-ghost py-8 text-center">Loading form...</div>
      </div>
      <div id="form-submissions">
        <div class="text-sm text-vs-text-ghost py-4 text-center">Loading submissions...</div>
      </div>
    </div>
  `}async function ni(e){let t=document.getElementById("form-detail-header"),s=document.getElementById("form-submissions");if(!t)return;let{ok:n,data:o}=await T.get(`/forms/${encodeURIComponent(e)}`);if(!n||!o){t.innerHTML='<div class="text-sm text-vs-error py-6">Form not found.</div>',s&&(s.innerHTML="");return}let i=o.form,a=o.stats;t.innerHTML=`
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
        <a href="/_studio/api/router.php?_path=%2Fforms%2F${encodeURIComponent(e)}%2Fsubmissions%2Fexport" target="_blank" class="vs-btn vs-btn-secondary vs-btn-sm" id="btn-export-csv">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </a>
      </div>
    </div>
  `;let r=document.getElementById("form-filter-status"),d=document.getElementById("form-filter-source"),p=document.getElementById("form-filter-search"),c=null,u=()=>Zt(e,1);r==null||r.addEventListener("change",u),d==null||d.addEventListener("change",u),p==null||p.addEventListener("input",()=>{clearTimeout(c),c=setTimeout(u,300)}),await Zt(e,1)}async function Zt(e,t=1){var b,f,v;let s=document.getElementById("form-submissions");if(!s)return;let n=((b=document.getElementById("form-filter-status"))==null?void 0:b.value)||"all",o=((f=document.getElementById("form-filter-source"))==null?void 0:f.value)||"all",i=((v=document.getElementById("form-filter-search"))==null?void 0:v.value)||"",a=`/forms/${encodeURIComponent(e)}/submissions?page=${t}&per_page=20`;n!=="all"&&(a+=`&status=${encodeURIComponent(n)}`),o!=="all"&&(a+=`&source=${encodeURIComponent(o)}`),i&&(a+=`&search=${encodeURIComponent(i)}`);let{ok:r,data:d}=await T.get(a);if(!r||!d){s.innerHTML='<div class="text-sm text-vs-error py-4">Failed to load submissions.</div>';return}let p=d.submissions||[],c=d.total||0,u=d.per_page||20,l=Math.ceil(c/u);if(!p.length){s.innerHTML=`
      <div class="vs-empty-state" style="min-height: 200px;">
        <div class="vs-empty-state-inner">
          <div class="vs-empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          </div>
          <p class="vs-empty-state-title">No submissions yet</p>
          <p class="vs-empty-state-desc">Form submissions will appear here once visitors start using your forms.</p>
        </div>
      </div>
    `;return}let{data:m}=await T.get(`/forms/${encodeURIComponent(e)}`),h=m==null?void 0:m.form,g={};h!=null&&h.fields&&h.fields.forEach(C=>{g[C.name]=C.label||C.name}),s.innerHTML=`
    <div class="flex flex-col gap-4" id="submissions-list">
      ${p.map(C=>{let k=Ee[C.status]||Ee.new,M=Object.entries(C.data||{}).filter(([q])=>!q.startsWith("_")).slice(0,3).map(([q,Z])=>{let G=g[q]||q,X=Array.isArray(Z)?Z.join(", "):String(Z);return`<span class="vs-sub-field"><strong>${x(G)}:</strong> ${x(X.substring(0,80))}${X.length>80?"\u2026":""}</span>`}).join(""),D=ii(C.created_at),z=C.source==="mcp";return`
          <div class="vs-submission-card" data-sub-id="${C.id}" data-form-id="${x(e)}" style="border-left-color: ${k.text};">
            <div class="vs-submission-header">
              <div class="flex items-center gap-2">
                <span class="vs-status-pill" style="background: ${k.bg}; color: ${k.text};">${k.label}</span>
                ${z?'<span class="vs-mcp-badge">MCP</span>':""}
              </div>
              <span class="vs-submission-time">${x(D)}</span>
            </div>
            <div class="vs-submission-preview">
              ${M||'<span class="text-vs-text-ghost text-xs">No data</span>'}
            </div>
            <div class="vs-submission-actions">
              <button class="vs-btn-ghost vs-btn-sm vs-sub-view-btn" data-sub-id="${C.id}" title="View details">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                View
              </button>
              <select class="vs-sub-status-select vs-input-compact" data-sub-id="${C.id}" style="font-size: 11px; height: 26px; padding: 2px 8px;">
                ${Object.entries(Ee).map(([q,Z])=>`<option value="${q}" ${C.status===q?"selected":""}>${Z.label}</option>`).join("")}
              </select>
              <button class="vs-btn-ghost vs-btn-sm vs-sub-delete-btn" data-sub-id="${C.id}" title="Delete submission" style="color: var(--vs-text-ghost);">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        `}).join("")}
    </div>

    ${l>1?`
      <div class="vs-pagination">
        ${t>1?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t-1}" data-form-id="${x(e)}">\u2190 Previous</button>`:"<span></span>"}
        <span class="text-xs text-vs-text-ghost">Page ${t} of ${l} \xB7 ${c} submission${c!==1?"s":""}</span>
        ${t<l?`<button class="vs-btn vs-btn-secondary vs-btn-sm" data-page="${t+1}" data-form-id="${x(e)}">Next \u2192</button>`:"<span></span>"}
      </div>
    `:`
      <div class="text-center py-3">
        <span class="text-xs text-vs-text-ghost">${c} submission${c!==1?"s":""}</span>
      </div>
    `}
  `,oi(e,t)}function oi(e,t){document.querySelectorAll(".vs-sub-view-btn").forEach(s=>{s.addEventListener("click",()=>{let n=s.dataset.subId;mn(e,n)})}),document.querySelectorAll(".vs-sub-status-select").forEach(s=>{s.addEventListener("change",async()=>{let n=s.dataset.subId,{ok:o}=await T.put(`/forms/${encodeURIComponent(e)}/submissions/${n}`,{status:s.value});if(o){j("Status updated","success");let i=s.closest(".vs-submission-card"),a=Ee[s.value];if(i&&a){i.style.borderLeftColor=a.text;let r=i.querySelector(".vs-status-pill");r&&(r.style.background=a.bg,r.style.color=a.text,r.textContent=a.label)}}else j("Failed to update status","error")})}),document.querySelectorAll(".vs-sub-delete-btn").forEach(s=>{s.addEventListener("click",async()=>{let n=s.dataset.subId;if(!await ye({title:"Delete Submission",description:"This submission will be permanently deleted.",confirmLabel:"Delete",danger:!0}))return;let{ok:i}=await T.delete(`/forms/${encodeURIComponent(e)}/submissions/${n}`);i?(j("Submission deleted","success"),Zt(e,t)):j("Failed to delete submission","error")})}),document.querySelectorAll("[data-page]").forEach(s=>{s.addEventListener("click",()=>{let n=parseInt(s.dataset.page);Zt(e,n)})}),document.querySelectorAll(".vs-submission-card").forEach(s=>{s.addEventListener("click",n=>{if(n.target.closest("button")||n.target.closest("select"))return;let o=s.dataset.subId;mn(e,o)})})}async function mn(e,t){var u,l,m,h;(u=document.getElementById("submission-detail-overlay"))==null||u.remove();let{ok:s,data:n}=await T.get(`/forms/${encodeURIComponent(e)}/submissions?page=1&per_page=1000`);if(!s||!n)return;let o=(n.submissions||[]).find(g=>String(g.id)===String(t));if(!o){j("Submission not found","error");return}let{data:i}=await T.get(`/forms/${encodeURIComponent(e)}`),a=i==null?void 0:i.form,r={};if(a!=null&&a.fields&&a.fields.forEach(g=>{r[g.name]=g.label||g.name}),o.status==="new"){await T.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:"read"}),o.status="read";let g=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);g&&(g.value="read");let b=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`);if(b){b.style.borderLeftColor=Ee.read.text;let f=b.querySelector(".vs-status-pill");f&&(f.style.background=Ee.read.bg,f.style.color=Ee.read.text,f.textContent="Read")}}let d=Ee[o.status]||Ee.new,p=document.createElement("div");p.id="submission-detail-overlay",p.className="vs-slide-overlay",p.innerHTML=`
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
          ${Object.entries(o.data||{}).filter(([g])=>!g.startsWith("_")).map(([g,b])=>{let f=r[g]||g,v=Array.isArray(b)?b.join(", "):String(b);return`
              <div class="vs-sub-detail-field">
                <div class="vs-sub-detail-field-label">${x(f)}</div>
                <div class="vs-sub-detail-field-value">${x(v)}</div>
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
          ${Object.entries(Ee).map(([g,b])=>`<option value="${g}" ${o.status===g?"selected":""}>${b.label}</option>`).join("")}
        </select>
      </div>
    </div>
  `,document.body.appendChild(p),requestAnimationFrame(()=>{requestAnimationFrame(()=>p.classList.add("is-visible"))});let c=()=>{p.classList.remove("is-visible"),setTimeout(()=>p.remove(),200)};p.addEventListener("click",g=>{g.target===p&&c()}),(l=document.getElementById("close-sub-detail"))==null||l.addEventListener("click",c),(m=document.getElementById("btn-save-sub-notes"))==null||m.addEventListener("click",async()=>{var f;let g=((f=document.getElementById("sub-detail-notes"))==null?void 0:f.value)||"",{ok:b}=await T.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{notes:g});j(b?"Notes saved":"Failed to save notes",b?"success":"error")}),(h=document.getElementById("sub-detail-status"))==null||h.addEventListener("change",async g=>{let b=g.target.value,{ok:f}=await T.put(`/forms/${encodeURIComponent(e)}/submissions/${t}`,{status:b});if(f){j("Status updated","success");let v=document.querySelector(`.vs-sub-status-select[data-sub-id="${t}"]`);v&&(v.value=b);let C=document.querySelector(`.vs-submission-card[data-sub-id="${t}"]`),k=Ee[b];if(C&&k){C.style.borderLeftColor=k.text;let M=C.querySelector(".vs-status-pill");M&&(M.style.background=k.bg,M.style.color=k.text,M.textContent=k.label)}}else j("Failed to update status","error")})}function ii(e){if(!e)return"";let t=Date.now(),s=new Date(e).getTime(),n=t-s,o=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return o<1?"Just now":o<60?`${o} min ago`:i<24?`${i} hr ago`:a<7?`${a} day${a>1?"s":""} ago`:new Date(e).toLocaleDateString()}function ai(){let e=document.getElementById("conversation-history-panel");if(!e)return;e.classList.contains("hidden")?(e.classList.remove("hidden"),ri()):e.classList.add("hidden")}async function ri(){let e=document.getElementById("conversation-list");if(!e)return;e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">Loading...</div>';let{ok:t,data:s,error:n}=await T.get("/ai/conversations");if(!t||!(s!=null&&s.conversations)){e.innerHTML=`<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">${x((n==null?void 0:n.message)||"Could not load conversations.")}</div>`;return}let o=s.conversations,i=I.get("activeConversationId");if(o.length===0){e.innerHTML='<div class="px-4 py-3 text-xs text-vs-text-ghost text-center">No conversations yet. Start chatting!</div>';return}e.innerHTML=o.map(a=>{let r=a.id===i,d=a.title||"Untitled conversation",p=a.updated_at?new Date(a.updated_at).toLocaleDateString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):"";return`
      <button class="vs-conv-item w-full text-left ${r?"vs-conv-item-active":""}"
              data-conversation-id="${x(a.id)}">
        <span class="mt-0.5 shrink-0 ${r?"text-vs-accent":"text-vs-text-ghost"}">${E.messageCircle}</span>
        <div class="min-w-0 flex-1">
          <div class="text-vs-text-primary truncate ${r?"font-medium":""}" style="font-size: var(--text-sm);">${x(d)}</div>
          <div class="vs-conv-time mt-0.5">${p}</div>
        </div>
        ${r?'<span class="mt-1 w-1.5 h-1.5 rounded-full bg-vs-accent shrink-0"></span>':""}
      </button>
    `}).join(""),e.querySelectorAll("[data-conversation-id]").forEach(a=>{a.addEventListener("click",()=>{let r=a.dataset.conversationId;Xt(r);let d=document.getElementById("conversation-history-panel");d&&d.classList.add("hidden")})})}async function Xt(e){let t=document.getElementById("chat-messages");if(!t)return;t.innerHTML='<div class="flex items-center justify-center h-full text-sm text-vs-text-ghost">Loading conversation...</div>';let{ok:s,data:n,error:o}=await T.get(`/ai/conversations/${e}`);if(!s||!(n!=null&&n.conversation)){I.set("activeConversationId",null),Qt(null);try{localStorage.removeItem("vs-active-conversation")}catch{}t.innerHTML=bt(),ft();return}let i=n.conversation,a=i.prompts||[];I.set("activeConversationId",e),Qt(i.page_scope||null);try{localStorage.setItem("vs-active-conversation",e)}catch{}if(a.length===0){t.innerHTML=bt(),ft();return}let r="",d=!1;for(let p of a){let{text:c,images:u}=$i(p.user_prompt),l=u.length>0?`<div class="vs-msg-user-images">${u.map(m=>`<img src="${m}" class="vs-msg-user-image" />`).join("")}</div>`:"";if(r+=`
      <div class="mb-5">
        <div class="text-xs text-vs-text-ghost mb-1 font-medium">You</div>
        ${l}
        <div class="text-sm text-vs-text-primary leading-relaxed">${x(c)}</div>
      </div>
    `,p.ai_response||p.files_modified){let m="",h=typeof p.ai_message=="string"&&p.ai_message.trim()!==""?p.ai_message:p.ai_response;h&&(m=Kt(h));let g="";if(p.files_modified)try{let f=JSON.parse(p.files_modified);if(Array.isArray(f)&&f.length>0){let v=f.map(k=>{let M=typeof k=="string"?k:k.path||k,D=typeof k=="object"&&k.action==="delete";return`<div class="vs-file-badge ${D?"vs-file-badge-deleted":"vs-file-badge-created"}">
                <span class="vs-file-badge-icon">${D?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>'}</span>
                <span>${x(String(M))}</span>
              </div>`}).join(""),C=f.length;g=`
              <div class="vs-files-section vs-files-done" style="animation: none;">
                <div class="vs-files-header">
                  <svg class="vs-files-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H3.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V6L9 1.5Z"/><path d="M9 1.5V6h4.5"/></svg>
                  <span>Files updated</span>
                  <span class="vs-files-count">${C} file${C!==1?"s":""}</span>
                </div>
                <div class="vs-files-list">${v}</div>
              </div>`}}catch{}let b=p.status==="error"?'<div class="mt-2 px-3 py-2 bg-vs-error-dim text-vs-error text-sm rounded-lg">This response encountered an error.</div>':"";r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="vs-msg-ai-bubble">${m}</div>
          ${g}
          ${b}
        </div>
      `}else if(p.status==="streaming"){d=!0;let m=p.id;r+=`
        <div class="mb-5">
          <div class="text-xs text-vs-text-ghost mb-1 font-medium">VoxelSite</div>
          <div class="text-sm text-vs-text-tertiary leading-relaxed flex items-center gap-2">
            <svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Generation in progress...
            <button onclick="window.__vsCancelStreamingPrompt && window.__vsCancelStreamingPrompt(${m})"
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
      `)}t.innerHTML=r,t.scrollTop=t.scrollHeight,window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),d&&!window.__vsResumedToastByConversation[e]&&(j("Resumed generation. Continuing from where you left off.","warning",4200),window.__vsResumedToastByConversation[e]=!0),d||delete window.__vsResumedToastByConversation[e],window.__vsCancelStreamingPrompt=async function(p){try{await T.post("/ai/cancel-generation",{prompt_id:p})}catch{}window.__vsResumedToastByConversation||(window.__vsResumedToastByConversation={}),window.__vsResumedToastByConversation[e]="__cancelled__",Xt(e)},d&&I.get("activeConversationId")===e&&!I.get("aiStreaming")?(window.__vsPollingCount||(window.__vsPollingCount={}),window.__vsPollingCount[e]=(window.__vsPollingCount[e]||0)+1,window.__vsPollingCount[e]<=60?setTimeout(()=>{I.get("activeConversationId")===e&&!I.get("aiStreaming")&&Xt(e)},2500):delete window.__vsPollingCount[e]):window.__vsPollingCount&&delete window.__vsPollingCount[e]}function li(){I.set("activeConversationId",null),Qt(null);try{localStorage.removeItem("vs-active-conversation")}catch{}let e=document.getElementById("chat-messages");e&&(e.innerHTML=bt(),ft());let t=document.getElementById("conversation-history-panel");t&&t.classList.add("hidden");let s=document.getElementById("prompt-input");s&&s.focus()}function Sn(e){if(!e)return"Pages";let t=e.replace(/\.(php|html)$/i,"");if(t==="index")return"Home Page";let s=t.split("/");t=s[s.length-1];let n=t.split("-").filter(Boolean).map(o=>o.charAt(0).toUpperCase()+o.slice(1));return n.length?n.join(" "):t}function Jt(){let e=document.getElementById("scope-label");if(!e)return;let t=window.__vsCurrentPreviewPath||null;e.textContent=Sn(t)}function Qt(e){I.set("activePageScope",e||null),Jt(),$t()&&St()}async function di(){let e=document.getElementById("vs-pages-modal-overlay");e&&e.remove();let t=document.createElement("div");t.id="vs-pages-modal-overlay",t.className="vs-modal-overlay",t.innerHTML=`
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
  `,document.body.appendChild(t),requestAnimationFrame(()=>t.classList.add("is-visible"));let s=()=>ue(t);t.querySelector("#vs-pages-modal-close").addEventListener("click",s),t.addEventListener("click",c=>{c.target===t&&s()}),t.addEventListener("keydown",c=>{c.key==="Escape"&&s()});let n=t.querySelector("#vs-pages-modal-body"),{ok:o,data:i,error:a}=await T.get("/pages?flat=1");if(!o||!Array.isArray(i==null?void 0:i.pages)){n.innerHTML=`
      <div class="text-sm text-vs-error py-6 text-center">
        ${x((a==null?void 0:a.message)||"Could not load pages.")}
      </div>
    `;return}let r=i.pages;if(!r.length){n.innerHTML=`
      <div class="text-center py-8">
        <div class="text-vs-text-ghost mb-2" style="opacity: 0.5;">${E.fileText.replace('width="14"','width="32"').replace('height="14"','height="32"')}</div>
        <p class="text-sm font-medium text-vs-text-secondary mb-1">No pages yet</p>
        <p class="text-xs text-vs-text-ghost">Go to Chat and describe the website you want to create.</p>
      </div>
    `;return}let d='<div style="display: flex; flex-direction: column; gap: 2px;">';r.forEach(c=>{let u=!!Number(c.is_homepage),l=c.title||c.slug||c.path,m=c.path||c.slug+".php",h="/"+m.replace(/\.php$/,"").replace(/^index$/,""),g=h==="/"?"/":h,b=Wo(c.slug),v=(window.__vsCurrentPreviewPath||"index.php")===m,C=c.size?(c.size/1024).toFixed(1)+" KB":"";d+=`
      <div class="vs-pages-modal-item ${v?"is-active":""}" data-slug="${x(c.slug)}" data-path="${x(m)}" data-title="${x(l)}" data-url="${x(g)}">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
          <span style="color: var(--vs-text-ghost); flex-shrink: 0;">${b}</span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 13px; font-weight: 550; color: var(--vs-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${x(l)}${u?' <span style="font-size:10px; font-weight:600; color:var(--vs-accent); border: 1px solid var(--vs-accent); border-radius: 4px; padding: 0 4px; margin-left: 6px; vertical-align: middle;">HOME</span>':""}
            </div>
            <div style="font-size: 11px; color: var(--vs-text-ghost); font-family: var(--vs-font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${x(m)}${C?" \xB7 "+C:""}
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
          ${u?"":`
          <button class="vs-btn vs-btn-ghost vs-btn-icon vs-pages-action" data-action="delete" title="Delete in Chat" style="width:28px;height:28px;color:var(--vs-error);">
            ${E.trash2}
          </button>
          `}
        </div>
      </div>
    `}),d+="</div>",n.innerHTML=d;let p=t.querySelector(".vs-modal-desc");p&&(p.textContent=`${r.length} page${r.length!==1?"s":""} found on your website.`),n.querySelectorAll(".vs-pages-action").forEach(c=>{c.addEventListener("click",u=>{u.stopPropagation();let l=c.closest(".vs-pages-modal-item"),m=l.dataset.slug,h=l.dataset.path,g=l.dataset.title,b=l.dataset.url,f=c.dataset.action;if(f==="edit")Qt(m),s(),cn(`Edit the "${g}" page (${b}): `);else if(f==="preview"){let v=document.getElementById("preview-iframe");v?($t()&&St(),v.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(h)+"&t="+Date.now(),window.__vsCurrentPreviewPath=h,Jt(),s(),j(`Preview: ${g}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(h),"_blank")}else if(f==="delete"){s();let v=`Delete the "${g}" page (${b}). Remove it completely: delete the file, remove it from the navigation in nav.php, remove it from the footer, and update any internal links on other pages that point to it.`;cn(v)}})}),n.querySelectorAll(".vs-pages-modal-item").forEach(c=>{c.addEventListener("click",u=>{if(u.target.closest(".vs-pages-action"))return;let l=c.dataset.path,m=c.dataset.title,h=document.getElementById("preview-iframe");h?(h.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(l)+"&t="+Date.now(),window.__vsCurrentPreviewPath=l,Jt(),s(),j(`Preview: ${m}`,"success")):window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(l),"_blank")})})}function ft(){document.querySelectorAll("[data-quick-prompt]").forEach(e=>{e.addEventListener("click",()=>{let t=document.getElementById("prompt-input");t&&(t.value=e.dataset.quickPrompt,t.dataset.actionType=e.dataset.actionType||"free_prompt",t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))})})}function bt(){let e=I.get("pages")||[],t=e.length>0,s=new Set(e.map(g=>g.slug)),n=[{label:"Apply a bold, modern design",prompt:"Build my website with a bold, modern aesthetic \u2014 dark color scheme, sharp contrast, smooth scroll animations, geometric shapes, and premium typography. Make it feel cutting-edge and conversion-focused. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for soft glassmorphism",prompt:"Create my website with a soft glassmorphism aesthetic \u2014 frosted-glass overlays, gentle gradients, airy whitespace, rounded cards, and a light pastel palette. Make it feel fresh and approachable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a clean, editorial layout",prompt:"Design my website with a clean editorial aesthetic \u2014 generous whitespace, refined serif typography, muted neutral palette, and striking large imagery. Think editorial magazine meets modern web. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Make it vibrant and colorful",prompt:"Build my website with a vibrant, energetic aesthetic \u2014 bright accent colors, dynamic gradients, playful micro-interactions, and bold geometric shapes. Make it pop with personality. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Try a luxury dark aesthetic",prompt:"Create my website with a luxurious dark aesthetic \u2014 deep backgrounds, gold or champagne accents, cinematic hero imagery, and polished typography. Think premium brand experience. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Build with warm, earthy tones",prompt:"Design my website with warm, organic tones \u2014 terracotta, sage, cream, natural textures, and inviting warmth. Make it feel human and authentic. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Create a corporate look",prompt:"Build my website with a professional corporate aesthetic \u2014 structured layouts, clean navigation, blue-based professional palette, and polished typography. Make it feel trustworthy and reliable. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Design a playful, creative site",prompt:"Create my website with a fun, creative aesthetic \u2014 playful typography, bright colors, quirky layout choices, and personality-driven design. Make it memorable and unique. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Go for a tech startup vibe",prompt:"Build my website with a cutting-edge tech aesthetic \u2014 gradients, glow effects, dark or deep backgrounds, and futuristic typography. Make it feel innovative and forward-thinking. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"},{label:"Use a retro, vintage style",prompt:"Design my website with a retro-inspired aesthetic \u2014 vintage color palettes, textured backgrounds, nostalgic typography, and classic charm. Make it feel timeless. Decide what pages and sections make sense based on my site name and tagline.",type:"create_site"}],o=[{label:"Create a Contact page",prompt:"Create a compelling Contact page with the business address, phone number, email, and operating hours presented in an elegant layout. Add a warm, inviting introductory paragraph. Include a map embed placeholder and clear call-to-action. Do NOT include a contact form \u2014 keep it focused on direct contact information.",type:"create_page"},{label:"Create an About page",prompt:"Create an engaging About page that tells the company story with warmth and authenticity. Include a mission statement section, a brief history or origin story, core values displayed in an attractive grid, and a team section placeholder. Use compelling copy that builds trust and connection.",type:"create_page"},{label:"Create a Services page",prompt:'Create a professional Services page with a hero section introducing the offerings. Display 4-6 services in an attractive card grid, each with an icon, title, short description, and CTA. Include a "Why Choose Us" section with key differentiators and a final call-to-action section.',type:"create_page"},{label:"Create a Portfolio page",prompt:"Create a visually stunning Portfolio or Work page with a filterable project gallery. Display projects as image cards with titles and categories. Include a hero section introducing the work, and a CTA at the bottom encouraging visitors to get in touch about their own project.",type:"create_page"},{label:"Create a Pricing page",prompt:"Create a clear, conversion-focused Pricing page with 3 pricing tiers displayed as elegant cards. Include a popular/recommended tier highlight, feature comparison list, and clear CTAs. Add a FAQ section below the pricing cards addressing common questions about billing and plans.",type:"create_page"},{label:"Create a Blog page",prompt:'Create a Blog or News index page with an attractive grid layout for articles. Include a featured post at the top with larger imagery, followed by a 2-3 column grid of recent posts. Each post card should show an image placeholder, title, date, excerpt, and a "Read more" link.',type:"create_page"},{label:"Create a FAQ page",prompt:"Create a helpful FAQ page with an accordion-style layout. Include 8-10 common questions organized by category. Add a hero section with a search-themed headline, and a CTA at the bottom for visitors whose questions weren't answered. Use smooth expand/collapse animations.",type:"create_page"},{label:"Create a Testimonials page",prompt:"Create a dedicated Testimonials page showcasing customer reviews. Display testimonials in an attractive card layout with star ratings, customer names, and company/role. Include a hero section and a CTA encouraging visitors to become the next success story.",type:"create_page"},...s.has("contact")?[]:[]].filter(g=>{let b=g.label.replace(/^Create (a |an )?/i,"").replace(/ page$/i,"").toLowerCase().replace(/\s+/g,"-");return!s.has(b)}),i=[{label:"Add a hero section",prompt:"Add a compelling hero section to the homepage with a bold headline, supporting subtext, a primary CTA button, and a background that matches the site's design language. Make it attention-grabbing and conversion-focused.",type:"enhance"},{label:"Add a call-to-action section",prompt:"Add a strong call-to-action section to the homepage, positioned before the footer. Use a contrasting background color, a compelling headline, brief supporting text, and a prominent button. Make it impossible to scroll past without noticing.",type:"enhance"},{label:"Add a testimonial section",prompt:"Add a testimonial section to the homepage displaying 3 customer quotes in an attractive card layout. Include star ratings, customer names with roles, and styled quotation marks. Make it feel genuine and trustworthy.",type:"enhance"},{label:"Add a features section",prompt:"Add a features or benefits section to the homepage with 4-6 items displayed in a grid. Each feature should have an icon, title, and short description. Use the site's existing design language and color palette.",type:"enhance"},{label:"Add a team section",prompt:"Add a team section to the about page (or homepage if no about page exists) showing 3-4 team members in a card grid. Include image placeholders, names, roles, and short bios. Style it to match the existing design.",type:"enhance"},{label:"Add a statistics section",prompt:'Add an impressive statistics/numbers section to the homepage with 3-4 large animated counters. Include metrics like "10+ Years Experience", "500+ Clients Served", "50+ Projects Completed". Use bold typography and the accent color.',type:"enhance"},{label:"Add a newsletter signup",prompt:`Add a newsletter signup section with an email input field and subscribe button. Include a compelling headline like "Stay in the loop" and a brief privacy note. Style it as an attractive banner that fits the site's design.`,type:"enhance"},{label:"Add a client logos bar",prompt:'Add a trusted-by/client logos section to the homepage. Create 5-6 placeholder logo areas in a horizontal row with subtle grayscale styling. Include a small heading like "Trusted by" or "Our Partners". Keep it minimal and professional.',type:"enhance"}],a=[{label:"Rewrite all page copy",prompt:"Review and rewrite all text content across the website to be more engaging, professional, and conversion-focused. Improve headlines to be more compelling, tighten body copy, and ensure consistent tone of voice throughout. Keep the existing structure and design intact.",type:"enhance"},{label:"Add engaging microcopy",prompt:'Enhance the website with thoughtful microcopy throughout \u2014 improve button labels to be action-oriented (e.g., "Get Started" instead of "Submit"), add helpful placeholder text in forms, and add subtle contextual helper text. Make every word earn its place.',type:"enhance"},{label:"Improve page headings",prompt:'Review and improve all page headings and subheadings across the website. Make them more compelling, benefit-focused, and emotionally engaging. Replace generic headlines like "Our Services" with specific value propositions like "Solutions That Drive Growth".',type:"enhance"},{label:"Add detailed service descriptions",prompt:"Expand the services section with detailed, persuasive descriptions for each service. Include the problem each service solves, key benefits, and a subtle CTA. Write in a tone that demonstrates expertise while remaining accessible.",type:"enhance"}],r=[{label:"Add a contact form",prompt:"Add a well-designed contact form with fields for name, email, phone (optional), and message. Include validation styling, a clear submit button, and a brief privacy statement. Place it prominently on the contact page or add a new contact section.",type:"enhance"},{label:"Add social proof elements",prompt:'Add social proof elements across the website \u2014 star ratings near CTAs, a "trusted by X+ customers" badge in the hero, review snippets in strategic locations, and certification or award logos. Make visitors feel confident choosing this business.',type:"enhance"},{label:"Improve navigation flow",prompt:"Review and optimize the website navigation for better user flow. Ensure the nav menu is clear and logically ordered, add breadcrumbs where helpful, improve mobile navigation, and ensure every page has clear next-step CTAs. Make it effortless to find information.",type:"enhance"},{label:"Add a sticky header CTA",prompt:'Add a subtle, persistent call-to-action button in the header/navigation that stays visible while scrolling. Use the accent color and action-oriented text like "Get a Quote" or "Book Now". Make it noticeable but not intrusive.',type:"enhance"}],d=[{label:"Add a process/how-it-works",prompt:'Add a "How It Works" section to the homepage with 3-4 numbered steps explaining the process of working together. Use icons, clear titles, and brief descriptions. Include connecting lines or arrows between steps for visual flow.',type:"enhance"},{label:"Add a guarantee section",prompt:"Add a trust-building guarantee or promise section with an appropriate icon (shield, checkmark), a bold guarantee statement, and supporting details. Position it near a CTA to reduce purchase anxiety. Style it to stand out without being gaudy.",type:"enhance"},{label:"Add an awards section",prompt:"Add a professional awards, certifications, or credentials section. Display 3-5 achievement badges or logos in a clean horizontal layout with a subtle heading. This builds authority and trust with visitors.",type:"enhance"},{label:"Add a comparison table",prompt:'Add a "Why Choose Us" comparison table showing how this business compares to alternatives. Use checkmarks and X marks, highlight the business column, and include 5-7 comparison points. Make the choice feel obvious.',type:"enhance"}],p=[{label:"Make the design more vibrant",prompt:"Enhance the website's visual energy \u2014 increase color saturation, add subtle gradient accents, brighten CTA buttons, and introduce hover animations on interactive elements. Keep the same layout and structure, but make everything feel more alive and dynamic.",type:"enhance"},{label:"Make the design more premium",prompt:"Elevate the website's perceived quality \u2014 refine typography with better font sizing and spacing, add subtle shadows and depth, use more refined color transitions, and polish all micro-interactions. Make every detail feel intentional and high-end.",type:"enhance"},{label:"Improve mobile responsiveness",prompt:"Review and enhance the mobile experience across all pages. Ensure text is readable without zooming, tap targets are appropriately sized, images scale correctly, navigation is thumb-friendly, and spacing works on small screens. Test at 375px width.",type:"enhance"},{label:"Add hover animations",prompt:"Add polished hover animations throughout the website \u2014 subtle lift effects on cards, smooth color transitions on buttons, image zoom on gallery items, and underline animations on links. Keep animations under 300ms and use appropriate easing functions. Subtle is key.",type:"enhance"},{label:"Refine the color palette",prompt:"Analyze and refine the current color palette for better harmony and contrast. Ensure sufficient contrast ratios for accessibility, unify accent usage, add complementary shades for depth, and ensure colors work well together across all sections.",type:"enhance"},{label:"Improve typography",prompt:"Refine the typography across all pages \u2014 establish clear heading hierarchy, improve line heights and letter spacing, choose more distinctive font pairings, and ensure consistent sizing. Make the type system feel professional and intentional.",type:"enhance"},{label:"Add smooth scroll effects",prompt:"Add subtle scroll-triggered animations throughout the website \u2014 fade-in-up effects for content sections, staggered reveals for card grids, and parallax-lite effects on hero backgrounds. Keep animations tasteful and performant. Use CSS transitions and Intersection Observer.",type:"enhance"},{label:"Add a dark mode toggle",prompt:"Add a dark/light mode toggle to the website header. Implement a full dark color scheme with appropriate backgrounds, text colors, and adjusted shadows. Save the user's preference in localStorage. Ensure all sections look great in both modes.",type:"enhance"}],c=[{label:"Switch to a dark theme",prompt:"Transform the entire website to a sophisticated dark theme. Use deep backgrounds (#0a0a0a to #1a1a1a range), light text, adjusted image treatments, and refined shadows that work on dark surfaces. Keep the same structure and content but make everything feel cinematic and premium.",type:"enhance"},{label:"Switch to a light theme",prompt:"Transform the entire website to a clean, bright light theme. Use white and light gray backgrounds, dark text, airy whitespace, and subtle shadows. Keep the same structure and content but make everything feel fresh, open, and approachable.",type:"enhance"},{label:"Redesign with glassmorphism",prompt:"Redesign the website using glassmorphism design language \u2014 frosted glass cards, translucent overlays, soft blurred backgrounds, and subtle border highlights. Keep the existing content and layout structure but give every element the glass treatment.",type:"enhance"},{label:"Make it more minimalist",prompt:"Simplify the website's design \u2014 increase whitespace, reduce decorative elements, use a more restrained color palette (2-3 colors max), and strip away anything that doesn't serve a purpose. Less is more. Keep all content but let it breathe.",type:"enhance"}],u,l,m;if(!t)l="What are we building?",m="Describe your website and watch it appear in the preview. Every detail is a conversation away.",u=Ls(n).slice(0,6);else{l="What\u2019s next?",m="Your site is live in preview. Pick a suggestion or describe any change you want.";let g=[...o,...o,...i,...a,...r,...d,...p,...c];u=Ls(g).slice(0,6);let b=new Set;if(u=u.filter(f=>b.has(f.label)?!1:(b.add(f.label),!0)),u.length<6){let f=Ls(g).filter(v=>!b.has(v.label));for(let v of f){if(u.length>=6)break;u.push(v),b.add(v.label)}}}let h=u.map(g=>`<button data-quick-prompt="${x(g.prompt).replace(/"/g,"&quot;")}" data-action-type="${g.type}"
      class="vs-style-card">${x(g.label)}</button>`).join(`
        `);return`
    <div class="vs-empty-state">
      <div class="vs-empty-icon vs-animate-in vs-stagger-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path class="voxel-top" style="opacity:1" fill="currentColor" d="M12 3L20 7.5L12 12L4 7.5Z"/>
          <path class="voxel-left" style="opacity:0.7" fill="currentColor" d="M4 7.5L12 12L12 21L4 16.5Z"/>
          <path class="voxel-right" style="opacity:0.4" fill="currentColor" d="M20 7.5L12 12L12 21L20 16.5Z"/>
        </svg>
      </div>
      <h2 class="vs-empty-title vs-animate-in vs-stagger-2">${l}</h2>
      <p class="vs-empty-description vs-animate-in vs-stagger-3">
        ${m}
      </p>
      <div class="vs-style-grid vs-animate-in vs-stagger-4">
        ${h}
      </div>
    </div>
  `}function Ls(e){let t=[...e];for(let s=t.length-1;s>0;s--){let n=Math.floor(Math.random()*(s+1));[t[s],t[n]]=[t[n],t[s]]}return t}function ci(){return`
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
  `}function pi(){return`
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
  `}function Tn(){let e=(t,s,n,o,i)=>({id:t,title:s,meta:n,group:n,shortcut:"",keywords:o,prompt:i,run:()=>_n(i)});return[e("gs-build-site","Build a complete website","Getting Started","create site business launch","Create a complete high-conversion website for my business with Home, About, Services, and Contact pages. Write all content based on my business info."),e("gs-redesign","Redesign the entire site","Getting Started","redesign restyle brand refresh","Redesign the entire website with a premium modern visual style. Update colors, typography, spacing, and section rhythm across all pages."),e("gs-write-content","Write all page content","Getting Started","content copy text write","Write compelling, professional content for every page on the site. Use my business info and target audience to guide the tone."),e("pg-add","Add a new page","Pages","page add new create","Add a new page called [Page Name] and include it in the navigation."),e("pg-about","Create About page","Pages","about us story team","Create a compelling About page with our story, mission, values, and a team section."),e("pg-services","Create Services page","Pages","services offerings","Create a Services page showcasing the services we offer with cards, icons, descriptions, and CTAs."),e("pg-pricing","Create Pricing page","Pages","pricing plans cost","Create a Pricing page with [number] tiers, a comparison table, feature lists, and a FAQ section."),e("pg-portfolio","Create Portfolio page","Pages","portfolio work projects gallery","Create a Portfolio page with a filterable grid showing our best projects with images and descriptions."),e("pg-blog","Create Blog listing page","Pages","blog articles posts news","Create a Blog page with card-based article listing, categories, dates, and a sidebar."),e("pg-faq","Create FAQ page","Pages","faq questions answers","Create a FAQ page with accordion-style questions organized by category. Include at least 10 questions."),e("pg-testimonials","Create Testimonials page","Pages","testimonials reviews proof","Create a Testimonials page with customer reviews in card layout with names, roles, and star ratings."),e("pg-careers","Create Careers page","Pages","careers jobs hiring","Create a Careers page with open positions, company culture section, and benefits overview."),e("pg-events","Create Events page","Pages","events calendar schedule","Create an Events page listing upcoming events with dates, locations, and registration links."),e("pg-gallery","Create Photo Gallery page","Pages","gallery photos lightbox","Create a Photo Gallery page with a responsive image grid and lightbox effect."),e("pg-404","Create custom 404 page","Pages","404 not found error","Create a custom 404 error page with a friendly message and links back to key pages."),e("pg-landing","Create landing page","Pages","landing campaign conversion","Create a high-conversion landing page for [product/campaign] with hero, benefits, social proof, and CTA."),e("pg-privacy","Create Privacy Policy","Pages","privacy policy legal gdpr","Create a Privacy Policy page covering data collection, cookies, and user rights."),e("pg-terms","Create Terms of Service","Pages","terms service legal","Create a Terms of Service page covering usage terms, disclaimers, and liability."),e("pg-rename","Rename a page","Pages","rename page title slug","Rename the [old page name] page to [new page name] and update all navigation links."),e("pg-delete","Delete a page","Pages","delete remove page","Delete the [page name] page and remove it from the navigation."),e("nav-update","Update navigation menu","Navigation & Layout","nav menu links order","Update the navigation menu to include these links in this order: [Home, About, Services, Contact]."),e("nav-dropdown","Add dropdown to navigation","Navigation & Layout","dropdown submenu nested","Add a dropdown menu under [Menu Item] with sub-links: [Sub-link 1, Sub-link 2, Sub-link 3]."),e("nav-cta","Add CTA button to nav","Navigation & Layout","cta button nav header",'Add a prominent CTA button to the navigation that says "[Button Text]" and links to [page].'),e("nav-sticky","Make header sticky","Navigation & Layout","sticky fixed header","Make the header navigation sticky so it stays visible when scrolling."),e("nav-topbar","Add announcement bar","Navigation & Layout","announcement bar banner",'Add a slim announcement bar above the navigation: "[Your announcement text]".'),e("ft-update","Update the footer","Navigation & Layout","footer links columns","Update the footer with columns for Quick Links, Services, Contact Info, and Social Media."),e("ft-newsletter","Add newsletter to footer","Navigation & Layout","newsletter subscribe footer","Add a newsletter email signup form to the footer."),e("blk-hero","Add hero section","Content Blocks","hero banner headline","Add a hero section to [page name] with a bold headline, supporting text, and a CTA button."),e("blk-cta","Add call-to-action section","Content Blocks","cta call action","Add a CTA section to [page name] with headline, description, and button linking to [destination]."),e("blk-team","Add team section","Content Blocks","team members staff","Add a team section with photo cards for each member showing name, role, and bio."),e("blk-features","Add features grid","Content Blocks","features benefits cards icons","Add a features section with [number] cards using icons, headings, and descriptions."),e("blk-stats","Add statistics section","Content Blocks","stats numbers counter","Add a stats section showing: [years in business], [happy clients], [projects completed]."),e("blk-testimonials","Add testimonials section","Content Blocks","testimonials reviews quotes","Add a testimonials section with customer review cards including quotes and names."),e("blk-logos","Add client/partner logos","Content Blocks","logos clients partners trust","Add a trusted-by logo strip showing our client or partner logos."),e("blk-timeline","Add timeline section","Content Blocks","timeline history milestones","Add a visual timeline section showing our company milestones."),e("blk-process","Add how-it-works section","Content Blocks","process steps how works",'Add a "How It Works" section with [number] numbered steps explaining our process.'),e("blk-map","Add map section","Content Blocks","map location embed","Add an embedded map section showing our location at [address]."),e("blk-video","Add video section","Content Blocks","video youtube embed","Add a video section to [page name] with embedded video from [URL]."),e("blk-accordion","Add accordion/FAQ section","Content Blocks","accordion faq expand collapse","Add an accordion FAQ section to [page name] with questions: [Q1, Q2, Q3]."),e("blk-banner","Add promotional banner","Content Blocks","banner promo offer","Add a promotional banner highlighting: [your offer or promotion]."),e("blk-comparison","Add comparison table","Content Blocks","comparison table versus","Add a comparison table comparing [Plan A] vs [Plan B] vs [Plan C]."),e("ds-colors","Change brand colors","Design & Styling","colors palette brand","Change the brand colors to [primary] and [accent]. Update all buttons, headings, and accents."),e("ds-fonts","Change fonts","Design & Styling","fonts typography","Change fonts to [heading font] for headings and [body font] for body text."),e("ds-dark","Add dark mode style","Design & Styling","dark mode night","Redesign with a dark mode aesthetic \u2014 dark backgrounds, light text, accent colors."),e("ds-light","Make design light and clean","Design & Styling","light clean minimal","Make the design lighter and cleaner with whitespace, subtle shadows, minimal aesthetic."),e("ds-bold","Make design bold and vibrant","Design & Styling","bold vibrant colorful","Make the design more bold with stronger colors, larger headings, more visual impact."),e("ds-spacing","Improve section spacing","Design & Styling","spacing rhythm padding","Improve vertical rhythm and spacing between sections. Add more breathing room."),e("ds-buttons","Restyle all buttons","Design & Styling","buttons style rounded","Restyle all buttons to have [rounded/pill/square] corners with [hover effect]."),e("ds-animations","Add scroll animations","Design & Styling","animations scroll fade reveal","Add subtle scroll-reveal animations so content fades in as the user scrolls."),e("fm-contact","Add contact form","Forms","contact form email","Add a contact form with Name, Email, Phone, Subject, and Message fields with validation."),e("fm-booking","Add booking form","Forms","booking appointment","Add a booking form with Name, Email, Phone, Preferred Date, Time, and Notes."),e("fm-quote","Add quote request form","Forms","quote estimate request",'Add a "Get a Quote" form with Name, Email, Service Needed, Budget, and Details.'),e("fm-newsletter","Add newsletter signup","Forms","newsletter subscribe",'Add a newsletter signup form with email field and "Subscribe" button.'),e("fm-feedback","Add feedback form","Forms","feedback survey","Add a feedback form with Name, Email, Rating (1-5), and Comments."),e("fm-application","Add job application form","Forms","application job career","Add a job application form with Name, Email, Position, Experience, and message."),e("fm-rsvp","Add RSVP form","Forms","rsvp event register","Add an RSVP form for [event name] with Name, Email, Number of Guests, and Dietary needs."),e("fm-edit","Edit existing form","Forms","edit form update","Update the [form name] form: [describe your changes]."),e("seo-meta","Optimize page meta tags","SEO & Discovery","seo meta title description","Optimize meta title and description for every page. Make them compelling and keyword-rich."),e("seo-headings","Fix heading hierarchy","SEO & Discovery","headings h1 h2 hierarchy","Ensure every page has one H1 with properly nested H2 and H3 headings."),e("seo-alt","Add image alt text","SEO & Discovery","alt text images accessibility","Add descriptive alt text to all images for SEO and accessibility."),e("seo-schema","Improve schema markup","SEO & Discovery","schema structured data","Improve schema.org structured data to include LocalBusiness, BreadcrumbList, and FAQPage."),e("img-hero","Change hero image","Images & Media","hero image background","Replace the hero image on [page name] with [describe the image]."),e("img-gallery","Add image gallery","Images & Media","gallery photos grid","Add an image gallery to [page name] with [number] images in a responsive grid."),e("img-favicon","Update favicon","Images & Media","favicon icon tab","Update the website favicon to match our brand."),e("img-logo","Update logo","Images & Media","logo brand header","Update the website logo. [Describe your logo or instructions]."),e("mem-phone","Set phone number","Business Memory","phone number telephone","Our phone number is [insert phone number]."),e("mem-email","Set email address","Business Memory","email contact address","Our email address is [insert email address]."),e("mem-address","Set business address","Business Memory","address location office","Our business address is [insert full address]."),e("mem-hours","Set business hours","Business Memory","hours opening times","Our business hours are: [Mon-Fri: 9am-5pm, Sat: 10am-2pm, Sun: Closed]."),e("mem-name","Set business name","Business Memory","business name company","Our business name is [insert business name]."),e("mem-tagline","Set tagline/slogan","Business Memory","tagline slogan motto",'Our tagline is: "[insert tagline]".'),e("mem-about","Set business description","Business Memory","about description","We are a [type of business] that [what you do]. We serve [audience] and specialize in [specialties]."),e("mem-founded","Set founding year","Business Memory","founded year established","Our company was founded in [year]."),e("mem-team","Add team member info","Business Memory","team member person","[Name] is our [role/title]. [Short bio]."),e("mem-service","Add a service we offer","Business Memory","service offering product","We offer [service name]: [description, pricing]."),e("mem-usp","Set unique selling points","Business Memory","usp unique value differentiator","Our key differentiators are: [1. ..., 2. ..., 3. ...]."),e("soc-twitter","Set Twitter/X profile","Social & Contact","twitter x social","Our Twitter/X is [x.com/handle]."),e("soc-facebook","Set Facebook page","Social & Contact","facebook social","Our Facebook page is [facebook.com/page]."),e("soc-instagram","Set Instagram profile","Social & Contact","instagram social","Our Instagram is [instagram.com/handle]."),e("soc-linkedin","Set LinkedIn page","Social & Contact","linkedin professional","Our LinkedIn is [linkedin.com/company/name]."),e("soc-youtube","Set YouTube channel","Social & Contact","youtube video channel","Our YouTube channel is [youtube.com/@channel]."),e("soc-tiktok","Set TikTok profile","Social & Contact","tiktok social video","Our TikTok is [tiktok.com/@handle]."),e("soc-whatsapp","Set WhatsApp number","Social & Contact","whatsapp chat message","Our WhatsApp number is [insert number]."),e("soc-add-links","Add social links to site","Social & Contact","social links footer icons","Add social media icon links to the footer for all our profiles."),e("cta-buy","Add buy/order button","E-Commerce & CTA","buy order purchase",'Add a prominent "Order Now" button that links to [URL].'),e("cta-phone","Add click-to-call button","E-Commerce & CTA","phone call click",'Add a "Call Us" button that opens a phone call.'),e("cta-whatsapp","Add WhatsApp chat button","E-Commerce & CTA","whatsapp floating","Add a floating WhatsApp chat button in the bottom-right corner."),e("cta-trial","Add free trial CTA","E-Commerce & CTA","free trial signup",'Add a "Start Free Trial" section with headline, benefits, and signup button.'),e("cta-download","Add download CTA","E-Commerce & CTA","download pdf brochure","Add a download section for our [brochure/resource] with description and button."),e("mt-copyright","Update copyright year","Maintenance","copyright year footer","Update the copyright year in the footer to the current year."),e("mt-fix-links","Fix broken links","Maintenance","broken links fix","Check all links and fix any broken or dead links."),e("mt-update","Update page content","Maintenance","update change text",'On the [page name] page, change "[old text]" to "[new text]".'),e("mt-remove","Remove a section","Maintenance","remove delete section","Remove the [section name] section from the [page name] page."),e("mt-reorder","Reorder page sections","Maintenance","reorder move arrange","On [page name], reorder sections to: [Section 1, Section 2, Section 3]."),e("adv-cookie","Add cookie consent banner","Advanced","cookie consent gdpr","Add a GDPR-compliant cookie consent banner with Accept and Decline options."),e("adv-analytics","Add analytics tracking","Advanced","analytics google tracking","Add Google Analytics with measurement ID: [G-XXXXXXX]."),e("adv-custom-css","Add custom CSS","Advanced","custom css style","Add this custom CSS: [paste your CSS]."),e("adv-custom-js","Add custom JavaScript","Advanced","custom javascript code","Add this JavaScript snippet: [paste your code]."),e("adv-accessibility","Improve accessibility","Advanced","accessibility a11y wcag","Improve accessibility: add ARIA labels, ensure contrast ratios, make elements keyboard-navigable.")]}function Bn(e){try{let t=localStorage.getItem(e);if(!t)return[];let s=JSON.parse(t);return Array.isArray(s)?s:[]}catch{return[]}}function Mn(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function ts(){return Bn(En)}function Ms(){return Bn(kn)}function In(e){let t=ts(),s=t.includes(e)?t.filter(o=>o!==e):[...t,e];Mn(En,s);let n=window.__vsCommandPalette||{query:"",activeIndex:0};jt(n.query||"",n.activeIndex||0)}function vi(e){let t=Ms().filter(n=>n!==e),s=[e,...t].slice(0,8);Mn(kn,s)}function _n(e){if(I.get("route")!=="chat"){Je.navigate("chat"),setTimeout(()=>_n(e),80);return}let t=document.getElementById("prompt-input");t&&(t.value=e,t.focus(),t.setSelectionRange(0,t.value.length),t.dispatchEvent(new Event("input",{bubbles:!0})))}function An(e,t="free_prompt",s=!1){if(I.get("route")!=="chat"){Je.navigate("chat"),setTimeout(()=>An(e,t,s),80);return}let n=document.getElementById("prompt-input");n&&(n.value=e,n.dataset.actionType=t,s?es():(n.focus(),n.setSelectionRange(0,n.value.length),n.dispatchEvent(new Event("input",{bubbles:!0}))))}function _t(){let e=document.getElementById("command-palette");return!!e&&!e.classList.contains("hidden")}function gn(e=""){let t=document.getElementById("command-palette"),s=document.getElementById("command-palette-input");!t||!s||(t.classList.remove("hidden"),s.value=e,s.focus(),s.select(),jt(e,0))}function Pt(){let e=document.getElementById("command-palette");e&&e.classList.add("hidden")}function ui(e,t){let s=0,n=0,o=0;for(let i=0;i<t.length&&s<e.length;i++)t[i]===e[s]?(n+=i,o+=1,n-=Math.min(6,o),s+=1):o=0;return s<e.length?null:n}function mi(e,t){let s=(e||"").trim().toLowerCase();if(!s)return 0;let n=`${t.title} ${t.meta} ${t.group} ${t.keywords}`.toLowerCase();if(n.startsWith(s))return 1;let o=n.indexOf(s);if(o>=0)return 20+o;let i=ui(s,n);return i===null?null:70+i}function gi(e){let t=(e||"").trim().toLowerCase(),s=Tn(),n=ts(),o=Ms();return s.map(i=>{let a=mi(t,i);if(a===null)return null;let r=n.includes(i.id)?-12:0,d=o.includes(i.id)?-8:0;return{...i,__score:a+r+d}}).filter(Boolean).sort((i,a)=>i.__score-a.__score||i.title.localeCompare(a.title))}function hi(e){let t=Tn(),s=Object.fromEntries(t.map(u=>[u.id,u])),n=(e||"").trim(),o=[];if(n!==""){let u=gi(e).slice(0,18);return u.length>0&&o.push({title:"Results",commands:u}),o}let i=Ms(),a=ts(),r=new Set,d=i.map(u=>s[u]).filter(Boolean);d.length>0&&(o.push({title:"Recent",commands:d}),d.forEach(u=>r.add(u.id)));let p=a.map(u=>s[u]).filter(u=>u&&!r.has(u.id));return p.length>0&&(o.push({title:"Pinned",commands:p}),p.forEach(u=>r.add(u.id))),["Getting Started","Pages","Navigation & Layout","Content Blocks","Design & Styling","Forms","SEO & Discovery","Images & Media","Business Memory","Social & Contact","E-Commerce & CTA","Maintenance","Advanced"].forEach(u=>{let l=t.filter(m=>m.group===u&&!r.has(m.id));l.length>0&&(o.push({title:u,commands:l}),l.forEach(m=>r.add(m.id)))}),o}function jt(e,t=0){let s=document.getElementById("command-palette-results");if(!s)return;let n=hi(e),o=n.flatMap(p=>p.commands),i=Math.max(0,Math.min(t,Math.max(0,o.length-1))),a=ts();if(window.__vsCommandPalette={commands:o,activeIndex:i,query:e},!o.length){s.innerHTML='<div class="px-3 py-2 text-xs text-vs-text-ghost">No matching prompts.</div>';return}let r="",d=0;n.forEach(p=>{r+=`<div class="px-2 pt-2 pb-1 text-[11px] uppercase tracking-[0.08em] text-vs-text-ghost">${x(p.title)}</div>`,p.commands.forEach(c=>{let u=d===i,l=a.includes(c.id);r+=`
        <div class="flex items-center gap-1.5 px-1 py-0.5 rounded-xl ${u?"bg-vs-bg-inset":""}">
          <button type="button"
            data-command-index="${d}"
            class="flex-1 text-left px-2 py-2 rounded-lg transition-colors ${u?"":"hover:bg-vs-bg-inset/70"}">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="text-sm text-vs-text-secondary truncate">${x(c.title)}</div>
                <div class="text-xs text-vs-text-ghost truncate" style="max-width:420px">${x(c.prompt?c.prompt.substring(0,80)+(c.prompt.length>80?"\u2026":""):c.meta)}</div>
              </div>
            </div>
          </button>
          <button type="button"
            data-command-pin="${x(c.id)}"
            class="w-7 h-7 inline-flex items-center justify-center rounded-md text-xs ${l?"text-vs-accent":"text-vs-text-ghost hover:text-vs-text-secondary"}"
            title="${l?"Unpin command":"Pin command"}">
            ${l?"\u2605":"\u2606"}
          </button>
        </div>
      `,d+=1})}),s.innerHTML=r,s.querySelectorAll("[data-command-index]").forEach(p=>{p.addEventListener("click",()=>{let c=parseInt(p.dataset.commandIndex||"0",10);Pn(c)})}),s.querySelectorAll("[data-command-pin]").forEach(p=>{p.addEventListener("click",c=>{c.preventDefault(),c.stopPropagation();let u=p.dataset.commandPin;u&&In(u)})})}function Pn(e=null){let t=window.__vsCommandPalette||{commands:[],activeIndex:0},s=e===null?t.activeIndex:e,n=t.commands[s];n&&(vi(n.id),Pt(),Promise.resolve(n.run()).catch(()=>{}))}function fi(){return`
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
  `}function Vt(){return{business_name:"",business_type:"",offer:"",audience:"",style:"modern-minimal",tone:"confident",pages:["home","about","services","contact"],content_mode:"ai"}}function rt(){try{let e=localStorage.getItem(wn);if(!e)return Vt();let t=JSON.parse(e);return{...Vt(),...t&&typeof t=="object"?t:{},pages:Array.isArray(t==null?void 0:t.pages)?t.pages:Vt().pages}}catch{return Vt()}}function jn(e){try{localStorage.setItem(wn,JSON.stringify(e))}catch{}}function Gt(){let e=document.getElementById("onboarding-modal");e&&e.classList.add("hidden")}function hn(){let e=window.__vsOnboarding||{step:1,draft:rt()},t=Math.max(1,Math.min(3,e.step||1)),s=e.draft||rt(),n=document.getElementById("onboarding-step-indicator"),o=document.getElementById("onboarding-step-label"),i=document.getElementById("onboarding-step-body"),a=document.getElementById("btn-onboarding-prev"),r=document.getElementById("btn-onboarding-next"),d=document.getElementById("btn-onboarding-generate");if(!n||!o||!i||!a||!r||!d)return;let p=["Business Basics","Audience & Style","Pages & Content"];if(o.textContent=`Step ${t} of 3 \xB7 ${p[t-1]}`,n.innerHTML=p.map((c,u)=>{let l=u+1===t,m=u+1<t;return`
      <div class="rounded-lg border px-3 py-2 text-xs ${l?"border-vs-accent text-vs-text-secondary bg-vs-bg-inset":m?"border-vs-border-subtle text-vs-text-secondary":"border-vs-border-subtle text-vs-text-ghost"}">
        <div class="font-medium">${u+1}. ${x(c)}</div>
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
            ${c.map(u=>`
              <label class="flex items-center gap-2 text-xs text-vs-text-secondary rounded-lg border border-vs-border-subtle px-2.5 py-2">
                <input type="checkbox" class="accent-[var(--vs-accent)]" data-onboard-page="${u.key}" ${s.pages.includes(u.key)?"checked":""}>
                <span>${u.label}</span>
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
    `}a.disabled=t===1,r.classList.toggle("hidden",t===3),d.classList.toggle("hidden",t!==3),bi()}function bi(){let e=window.__vsOnboarding||{draft:rt()},t=()=>{var n,o,i,a,r,d,p,c,u,l,m;e.draft={...e.draft,business_name:((o=(n=document.getElementById("onboard-business-name"))==null?void 0:n.value)==null?void 0:o.trim())||e.draft.business_name||"",business_type:((a=(i=document.getElementById("onboard-business-type"))==null?void 0:i.value)==null?void 0:a.trim())||e.draft.business_type||"",offer:((d=(r=document.getElementById("onboard-offer"))==null?void 0:r.value)==null?void 0:d.trim())||e.draft.offer||"",audience:((c=(p=document.getElementById("onboard-audience"))==null?void 0:p.value)==null?void 0:c.trim())||e.draft.audience||"",style:((u=document.getElementById("onboard-style"))==null?void 0:u.value)||e.draft.style||"modern-minimal",tone:((l=document.getElementById("onboard-tone"))==null?void 0:l.value)||e.draft.tone||"confident",content_mode:((m=document.getElementById("onboard-content-mode"))==null?void 0:m.value)||e.draft.content_mode||"ai"};let s=document.querySelectorAll("[data-onboard-page]");s.length&&(e.draft.pages=Array.from(s).filter(h=>h.checked).map(h=>h.dataset.onboardPage).filter(Boolean)),jn(e.draft),window.__vsOnboarding=e};["onboard-business-name","onboard-business-type","onboard-offer","onboard-audience","onboard-style","onboard-tone","onboard-content-mode"].forEach(s=>{let n=document.getElementById(s);n&&(n.addEventListener("input",t),n.addEventListener("change",t))}),document.querySelectorAll("[data-onboard-page]").forEach(s=>{s.addEventListener("change",t)})}function yi(e){let t={"modern-minimal":"Modern Minimal","bold-vibrant":"Bold Vibrant","elegant-classic":"Elegant Classic","playful-creative":"Playful Creative","dark-premium":"Dark Premium"},s={confident:"confident and clear",friendly:"friendly and approachable",luxury:"refined and premium",playful:"energetic and playful"},n=(e.pages&&e.pages.length?e.pages:["home","about","services","contact"]).map(i=>i.charAt(0).toUpperCase()+i.slice(1)).join(", "),o=e.content_mode==="placeholder"?"Use realistic placeholder copy that feels context-aware.":e.content_mode==="guided"?"Use structured content blocks that clearly indicate where final copy goes.":"Write complete high-quality content for all pages.";return[`Create a complete website for ${e.business_name||"my business"}.`,e.business_type?`Business type: ${e.business_type}.`:"",e.offer?`Core offer: ${e.offer}.`:"",e.audience?`Target audience: ${e.audience}.`:"",`Style preference: ${t[e.style]||"Modern Minimal"}.`,`Copy tone: ${s[e.tone]||"confident and clear"}.`,`Build these pages: ${n}.`,o,"Use a premium visual hierarchy, strong CTA strategy, and conversion-focused section flow."].filter(Boolean).join(" ")}function xi(){let e=document.querySelector("[data-onboarding-overlay]");e&&e.addEventListener("click",()=>Gt());let t=document.getElementById("btn-close-onboarding");t&&t.addEventListener("click",()=>Gt());let s=document.getElementById("btn-onboarding-prev");s&&s.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:rt()};i.step=Math.max(1,(i.step||1)-1),window.__vsOnboarding=i,hn()});let n=document.getElementById("btn-onboarding-next");n&&n.addEventListener("click",()=>{let i=window.__vsOnboarding||{step:1,draft:rt()};i.step=Math.min(3,(i.step||1)+1),window.__vsOnboarding=i,hn()});let o=document.getElementById("btn-onboarding-generate");o&&o.addEventListener("click",()=>{let a=(window.__vsOnboarding||{step:3,draft:rt()}).draft||rt(),r=yi(a);try{localStorage.setItem(Ro,"1")}catch{}jn(a),Gt(),An(r,"create_site",!0)})}function wi(){let e=document.getElementById("btn-theme-toggle");e&&e.addEventListener("click",()=>{var U,J;let _=ds()==="light";e.innerHTML=_?E.sun:E.moon,e.title=_?"Switch to dark":"Switch to light",window.__vsEditorPage&&((U=window.monaco)!=null&&U.editor)&&window.monaco.editor.setTheme(It()),document.getElementById("vs-code-editor-overlay")&&((J=window.monaco)!=null&&J.editor)&&window.monaco.editor.setTheme(It())});let t=document.getElementById("btn-command-palette");t&&t.addEventListener("click",()=>{gn()});let s=document.querySelector("[data-command-overlay]");s&&s.addEventListener("click",()=>Pt());let n=document.getElementById("command-palette-input");n&&(n.addEventListener("input",()=>{jt(n.value,0)}),n.addEventListener("keydown",y=>{let _=window.__vsCommandPalette||{commands:[],activeIndex:0};if((y.metaKey||y.ctrlKey)&&y.key.toLowerCase()==="p"){y.preventDefault();let P=_.commands[_.activeIndex];P&&In(P.id);return}if(y.key==="ArrowDown"){y.preventDefault(),jt(n.value,_.activeIndex+1);return}if(y.key==="ArrowUp"){y.preventDefault(),jt(n.value,_.activeIndex-1);return}if(y.key==="Enter"){y.preventDefault(),Pn();return}y.key==="Escape"&&(y.preventDefault(),Pt())})),xi();let o=document.getElementById("btn-user-menu"),i=document.getElementById("user-dropdown");o&&i&&(o.addEventListener("click",y=>{y.stopPropagation(),i.classList.toggle("hidden")}),document.addEventListener("click",y=>{!i.classList.contains("hidden")&&!i.contains(y.target)&&y.target!==o&&!o.contains(y.target)&&i.classList.add("hidden")}));let a=document.getElementById("btn-edit-profile");a&&i&&a.addEventListener("click",()=>{i.classList.add("hidden")});let r=document.getElementById("btn-logout");r&&r.addEventListener("click",async()=>{await T.post("/auth/logout"),I.set("user",null),window.location.reload()});let d=document.getElementById("btn-undo-status");d&&d.addEventListener("click",()=>{Re()||bn()});let p=document.getElementById("btn-redo-status");p&&p.addEventListener("click",()=>{Re()||yn()});let c=document.getElementById("btn-preview-site");c&&c.addEventListener("click",()=>{window.open("/_studio/api/router.php?_path=%2Fpreview&path=index.php","_blank")});let u=document.getElementById("btn-snapshot");u&&u.addEventListener("click",async()=>{var U;if(Re())return;u.disabled=!0,We("Creating snapshot...");let{ok:y,data:_,error:P}=await T.post("/snapshots",{type:"manual",label:"Manual snapshot"});u.disabled=!1,We(y?`\u2713 Snapshot saved (${((U=_==null?void 0:_.snapshot)==null?void 0:U.file_count)||0} files)`:"\u2717 "+((P==null?void 0:P.message)||"Snapshot failed"),y?"success":"error",4e3)});let l=document.getElementById("btn-download");l&&((async()=>{var U;let{ok:y,data:_}=await T.get("/settings");(U=_==null?void 0:_.settings)!=null&&U.last_published_at||(l.disabled=!0,l.title="Publish your site first to enable download.",l.classList.add("opacity-40"))})(),l.addEventListener("click",()=>{l.disabled||Re()||Ci()}));let m=document.getElementById("btn-publish");m&&(ht(),m.addEventListener("click",async()=>{var le,Ne;if(Re())return;let y=Rt();if(y.publishing)return;if(y.hasChanges===!1){j("No unpublished changes to publish.","warning");return}let _=y.counts||{added:0,modified:0,deleted:0},P=Number(_.added||0)+Number(_.modified||0)+Number(_.deleted||0),U=localStorage.getItem("vs_publish_snapshot"),de=await Ei({totalChanges:P,snapshotDefault:U===null?!0:U!=="false"});if(!de)return;localStorage.setItem("vs_publish_snapshot",String(de.createSnapshot)),y.publishing=!0,ht(),We("Publishing...");let{ok:A,data:ne,error:ve}=await T.post("/publish",{create_snapshot:de.createSnapshot});if(y.publishing=!1,A){let Te=((le=ne==null?void 0:ne.published)==null?void 0:le.length)||0,Fe=((Ne=ne==null?void 0:ne.removed)==null?void 0:Ne.length)||0,Ke=Fe>0?`Published ${Te} file(s), removed ${Fe} stale file(s).`:`Published ${Te} file(s).`;j(Ke,"success"),We(`\u2713 ${Te} published, ${Fe} removed`,"success",5e3),I.set("previewDirty",!1),De({silent:!0}),window.open("/","_blank")}else j((ve==null?void 0:ve.message)||"Publish failed.","error"),We("\u2717 "+((ve==null?void 0:ve.message)||"Publish failed"),"error",5e3),De({silent:!0})}));let h=document.getElementById("btn-publish-menu");h&&h.addEventListener("click",y=>{if(y.stopPropagation(),Re())return;let _=document.querySelector(".vs-publish-dropup");if(_){_.remove();return}let P=document.createElement("div");P.className="vs-publish-dropup",P.innerHTML=`
        <button type="button" class="vs-publish-dropup-item is-danger" id="btn-unpublish">
          ${E.cloudOff} Unpublish
        </button>
      `;let U=h.closest(".vs-publish-split");U?U.appendChild(P):h.parentElement.appendChild(P),P.querySelector("#btn-unpublish").addEventListener("click",async()=>{if(P.remove(),!await ye({title:"Unpublish Website",description:"This will take your live website offline and replace it with a default placeholder page. Your preview and all your work stays intact.",confirmLabel:"Unpublish",danger:!0}))return;We("Unpublishing...");let{ok:ne,data:ve,error:le}=await T.post("/publish/unpublish");ne?(j("Unpublished. Default page restored.","success"),We("\u2713 Site unpublished","success",5e3),De({silent:!0})):(j((le==null?void 0:le.message)||"Unpublish failed.","error"),We("\u2717 "+((le==null?void 0:le.message)||"Unpublish failed"),"error",5e3))});let J=A=>{!P.contains(A.target)&&A.target!==h&&(P.remove(),document.removeEventListener("click",J))};setTimeout(()=>document.addEventListener("click",J),0);let de=A=>{A.key==="Escape"&&(P.remove(),document.removeEventListener("keydown",de),document.removeEventListener("click",J))};document.addEventListener("keydown",de)});let g=document.getElementById("resize-handle"),b=document.getElementById("conversation-panel");if(g&&b){let y,_;g.addEventListener("mousedown",P=>{P.preventDefault(),y=P.clientX,_=b.offsetWidth;let U=de=>{let A=de.clientX-y,ne=Math.min(580,Math.max(340,_+A));b.style.width=`${ne}px`,I.set("sidebarWidth",ne)},J=()=>{document.removeEventListener("mousemove",U),document.removeEventListener("mouseup",J)};document.addEventListener("mousemove",U),document.addEventListener("mouseup",J)})}let f=document.getElementById("prompt-input");f&&(f.addEventListener("input",()=>{f.style.height="auto",f.style.height=Math.min(200,f.scrollHeight)+"px"}),f.addEventListener("keydown",y=>{y.key==="Enter"&&(y.metaKey||y.ctrlKey)&&(y.preventDefault(),es())}));let v=document.getElementById("btn-send");v&&v.addEventListener("click",es);let C=document.getElementById("btn-attach-image"),k=document.getElementById("image-file-input");C&&k&&(C.addEventListener("click",()=>k.click()),k.addEventListener("change",()=>{k.files.length>0&&($s(k.files),k.value="")}));let M=document.querySelector(".vs-prompt-area");M&&(M.addEventListener("dragover",y=>{y.preventDefault(),y.stopPropagation(),M.classList.add("vs-drag-over")}),M.addEventListener("dragleave",y=>{y.preventDefault(),y.stopPropagation(),M.classList.remove("vs-drag-over")}),M.addEventListener("drop",y=>{y.preventDefault(),y.stopPropagation(),M.classList.remove("vs-drag-over");let _=Array.from(y.dataTransfer.files).filter(P=>Ts.includes(P.type));_.length>0&&$s(_)})),f&&f.addEventListener("paste",y=>{var U;let P=Array.from(((U=y.clipboardData)==null?void 0:U.items)||[]).filter(J=>J.kind==="file"&&Ts.includes(J.type));if(P.length>0){y.preventDefault();let J=P.map(de=>de.getAsFile()).filter(Boolean);$s(J)}}),ft();let D=document.getElementById("btn-new-chat");D&&D.addEventListener("click",li);let z=document.getElementById("btn-scope-selector");z&&z.addEventListener("click",()=>{di()});let q=document.getElementById("btn-toggle-history");q&&q.addEventListener("click",ai);let Z=document.getElementById("btn-visual-editor");Z&&Z.addEventListener("click",()=>fs());let G=document.getElementById("btn-edit-code");G&&G.addEventListener("click",()=>{let y=window.__vsCurrentPreviewPath||"index.php";ws(y)});let X=document.getElementById("btn-refresh-preview");X&&X.addEventListener("click",()=>yt());let $=document.querySelectorAll("[data-device]"),O=document.getElementById("preview-frame-container");if($.length&&O){let y={desktop:"100%",tablet:"768px",mobile:"375px"};$.forEach(_=>{_.addEventListener("click",()=>{let P=_.dataset.device,U=y[P]||"100%";P==="desktop"?(O.style.maxWidth="",O.style.width="",O.style.alignSelf=""):(O.style.maxWidth=U,O.style.width="100%",O.style.alignSelf="center"),$.forEach(J=>{J.classList.remove("vs-device-btn-active"),J.dataset.device===P&&J.classList.add("vs-device-btn-active")})})})}let W=document.getElementById("btn-external-preview");W&&W.addEventListener("click",()=>{let y=window.__vsCurrentPreviewPath||"index.php";window.open("/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(y),"_blank")}),window.__vsCodeCollapseBound||(window.__vsCodeCollapseBound=!0,document.addEventListener("click",y=>{var P,U;let _=(U=(P=y.target)==null?void 0:P.closest)==null?void 0:U.call(P,"[data-code-toggle]");_&&(y.preventDefault(),Mi(_))})),window.__vsKeyboardShortcutsBound||(window.__vsKeyboardShortcutsBound=!0,document.addEventListener("keydown",y=>{if((y.metaKey||y.ctrlKey)&&y.key==="k"){y.preventDefault(),_t()?Pt():gn();return}if(y.key==="Escape"&&_t()){y.preventDefault(),Pt();return}if(y.key==="Escape"&&Wt()){y.preventDefault(),Gt();return}if((y.metaKey||y.ctrlKey)&&y.key==="z"&&!y.shiftKey){if(_t()||Wt())return;let _=document.activeElement;if(_&&(_.tagName==="INPUT"||_.tagName==="TEXTAREA"))return;y.preventDefault(),bn()}if((y.metaKey||y.ctrlKey)&&y.key==="z"&&y.shiftKey){if(_t()||Wt())return;let _=document.activeElement;if(_&&(_.tagName==="INPUT"||_.tagName==="TEXTAREA"))return;y.preventDefault(),yn()}if(y.key==="v"&&!y.metaKey&&!y.ctrlKey&&!y.altKey&&!y.shiftKey){if(_t()||Wt())return;let _=document.activeElement;if(_&&(_.tagName==="INPUT"||_.tagName==="TEXTAREA"||_.isContentEditable))return;let P=I.get("route");if(!Ss.includes(P))return;y.preventDefault(),fs()}if(y.key==="Escape"&&$t()){y.preventDefault(),St();return}}));let K=I.get("route");if(Ss.includes(K))try{let y=I.get("activeConversationId"),_=localStorage.getItem("vs-active-conversation"),P=y||_,U=document.getElementById("chat-messages"),J=U==null?void 0:U.querySelector(".vs-empty-state");P&&!I.get("aiStreaming")?(y||I.set("activeConversationId",P),J&&Xt(P)):P||U&&U.children.length===0&&(U.innerHTML=bt(),ft())}catch{}Ht(),Li()}function ki(){let e=document.getElementById("preview-frame-container");if(!e||e.querySelector(".vs-generating-overlay"))return;let t=document.createElement("div");t.className="vs-generating-overlay",t.innerHTML=`
    <div class="vs-gen-dots">
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
      <span class="vs-gen-dot"></span>
    </div>
    <div class="vs-gen-title">Working on your site</div>
    <div class="vs-gen-subtitle">Content is being generated.<br>This may take a few minutes.</div>
    <div class="vs-gen-note">Please keep this page open \u2014 do not navigate away during generation.</div>
    <div class="vs-gen-progress"><div class="vs-gen-progress-bar"></div></div>
  `,e.appendChild(t)}function fn(){let e=document.querySelector(".vs-generating-overlay");e&&(e.classList.add("removing"),e.addEventListener("animationend",()=>e.remove(),{once:!0}),setTimeout(()=>e==null?void 0:e.remove(),600))}function yt(e){let t=document.getElementById("preview-iframe");if(t){let s=e||window.__vsCurrentPreviewPath||"index.php";t.src="/_studio/api/router.php?_path=%2Fpreview&path="+encodeURIComponent(s)+"&t="+Date.now()}}window.refreshPreview=yt;window.__vsPreviewPathListenerBound||(window.__vsPreviewPathListenerBound=!0,window.addEventListener("message",e=>{typeof e.data=="string"&&e.data.startsWith("voxelsite:path:")&&(window.__vsCurrentPreviewPath=e.data.slice(15),Jt())}));function Bs(e){let t=document.getElementById("preview-iframe");if(t&&t.contentWindow)try{t.contentWindow.postMessage(e,"*")}catch{yt()}}window.sendPreviewMessage=Bs;async function bn(){(await T.post("/revisions/undo")).ok&&(setTimeout(()=>yt(),300),await Ht(),De({silent:!0}))}async function yn(){(await T.post("/revisions/redo")).ok&&(setTimeout(()=>yt(),300),await Ht(),De({silent:!0}))}async function Ht(){let{ok:e,data:t}=await T.get("/revisions/state");if(!e||!t)return;let s=!!t.can_undo,n=!!t.can_redo,o=t.undo_description?`Undo: ${t.undo_description}`:"Nothing to undo",i=t.redo_description?`Redo: ${t.redo_description}`:"Nothing to redo";["btn-undo","btn-undo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!s,r.title=o,r.classList.toggle("opacity-40",!s))}),["btn-redo","btn-redo-status"].forEach(a=>{let r=document.getElementById(a);r&&(r.disabled=!n,r.title=i,r.classList.toggle("opacity-40",!n))})}function Rt(){return window.__vsPublishState||(window.__vsPublishState={hasChanges:null,counts:{added:0,modified:0,deleted:0},checking:!1,publishing:!1,error:null,intervalId:null}),window.__vsPublishState}function We(e,t="neutral",s=0){let n=document.getElementById("status-text");n&&(n.textContent=e,n.className=t==="success"?"text-xs text-vs-success":t==="error"?"text-xs text-vs-error":"text-xs text-vs-text-ghost",window.__vsStatusResetTimer&&(clearTimeout(window.__vsStatusResetTimer),window.__vsStatusResetTimer=null),s>0&&(window.__vsStatusResetTimer=setTimeout(()=>{let o=document.getElementById("status-text");o&&(o.textContent="Ready",o.className="text-xs text-vs-text-ghost",window.__vsStatusResetTimer=null)},s)))}function ht(){let e=Rt(),t=document.getElementById("btn-publish"),s=document.getElementById("btn-publish-menu"),n=document.getElementById("publish-state-label");if(!t)return;let o=r=>{s&&(r?(s.classList.remove("vs-btn-ghost"),s.classList.add("vs-btn-primary")):(s.classList.remove("vs-btn-primary"),s.classList.add("vs-btn-ghost")))},i=e.counts||{added:0,modified:0,deleted:0},a=Number(i.added||0)+Number(i.modified||0)+Number(i.deleted||0);if(e.publishing){t.disabled=!0,t.innerHTML=`${E.publish} Publishing...`,s&&(s.disabled=!0),n&&(n.textContent="Publishing changes...",n.className="text-2xs text-vs-text-tertiary");return}if(s&&(s.disabled=!1),e.checking&&e.hasChanges===null){t.disabled=!0,t.innerHTML=`${E.publish} Checking...`,n&&(n.textContent="Checking publish status...",n.className="text-2xs text-vs-text-ghost");return}if(e.error){t.disabled=!1,t.innerHTML=`${E.publish} Publish`,o(!0),n&&(n.textContent="Status unavailable",n.className="text-2xs text-vs-warning");return}if(e.hasChanges){if(t.disabled=!1,t.innerHTML=`${E.publish} Publish`,t.classList.remove("vs-btn-ghost"),t.classList.add("vs-btn-primary"),o(!0),n){let r=a===1?"":"s";n.textContent=`${a} unpublished change${r}`,n.className="text-2xs text-vs-accent"}return}t.disabled=!0,t.innerHTML=`${E.publish} Up to date`,t.classList.remove("vs-btn-primary"),t.classList.add("vs-btn-ghost"),o(!1),n&&(n.textContent="No unpublished changes",n.className="text-2xs text-vs-text-ghost")}window.applyPublishStateUi=ht;function Ei({totalChanges:e=0,snapshotDefault:t=!0}){return new Promise(s=>{var d,p;let n=document.getElementById("vs-confirm-overlay");n&&n.remove();let o=e>0?`${e} unpublished change${e===1?"":"s"} will go live.`:"Your current preview will be published.",i=document.createElement("div");i.id="vs-confirm-overlay",i.className="vs-modal-overlay",i.innerHTML=`
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
    `;let a=c=>{c.key==="Escape"&&(c.preventDefault(),r(null))},r=c=>{document.removeEventListener("keydown",a),ue(i),s(c)};document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("is-visible")),i.addEventListener("click",c=>{c.target===i&&r(null)}),(d=document.getElementById("vs-confirm-cancel"))==null||d.addEventListener("click",()=>r(null)),(p=document.getElementById("vs-confirm-ok"))==null||p.addEventListener("click",()=>{let c=document.getElementById("vs-publish-snapshot-cb");r({createSnapshot:c?c.checked:!0})}),document.addEventListener("keydown",a),setTimeout(()=>{var c;return(c=document.getElementById("vs-confirm-ok"))==null?void 0:c.focus()},220)})}function Ci(){let e=document.getElementById("vs-download-modal-overlay");e&&e.remove();let n=Rt().hasChanges===!0?`
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
  `,document.body.appendChild(o),requestAnimationFrame(()=>o.classList.add("is-visible"));let i=l=>{l.key==="Escape"&&a()},a=()=>{document.removeEventListener("keydown",i),ue(o)};o.querySelector("#vs-download-close").addEventListener("click",a),o.addEventListener("click",l=>{l.target===o&&a()}),document.addEventListener("keydown",i);let r=o.querySelector("#vs-download-publish-link");r&&r.addEventListener("click",l=>{l.preventDefault(),a(),setTimeout(()=>{let m=document.getElementById("btn-publish");m&&!m.disabled&&m.click()},400)});let d=o.querySelectorAll(".vs-download-card"),p=o.querySelector("#vs-download-action"),c="php";d.forEach(l=>{l.addEventListener("click",()=>{if(l.classList.contains("is-loading"))return;d.forEach(h=>h.classList.remove("is-selected")),l.classList.add("is-selected"),c=l.dataset.format;let m=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${E.download} ${m}`})});let u=!1;p.addEventListener("click",async()=>{var l;if(!u){u=!0,p.disabled=!0,p.innerHTML='<span class="vs-download-spinner"></span> Preparing download\u2026',d.forEach(m=>m.style.pointerEvents="none");try{let m=I.get("sessionToken"),h={"Content-Type":"application/json",Accept:"application/zip"};m&&(h["X-VS-Token"]=m);let g=await fetch("/_studio/api/router.php?_path=%2Fexport",{method:"POST",headers:h,credentials:"same-origin",body:JSON.stringify({format:c})});if(!g.ok){let D="Export failed.";try{let z=await g.json();D=((l=z==null?void 0:z.error)==null?void 0:l.message)||D}catch{}j(D,"error");return}let f=(g.headers.get("Content-Disposition")||"").match(/filename="?(.+?)"?$/i),v=f?f[1]:`site-${c}-${new Date().toISOString().slice(0,10)}.zip`,C=await g.blob(),k=URL.createObjectURL(C),M=document.createElement("a");M.href=k,M.download=v,M.style.display="none",document.body.appendChild(M),M.click(),setTimeout(()=>{URL.revokeObjectURL(k),M.remove()},100),j(`\u2713 ${v} downloaded`,"success")}catch{j("Download failed. Check your connection.","error")}finally{u=!1,p.disabled=!1;let m=c==="php"?"Download PHP":"Download HTML";p.innerHTML=`${E.download} ${m}`,d.forEach(h=>h.style.pointerEvents="")}}})}async function De({silent:e=!1}={}){let t=Rt();if(t.publishing){ht();return}t.checking=!0,e||ht();let{ok:s,data:n,error:o}=await T.get("/preview/diff");t.checking=!1,s&&n?(t.hasChanges=!!n.has_changes,t.counts=n.counts||{added:0,modified:0,deleted:0},t.error=null):t.error=(o==null?void 0:o.message)||"Could not check publish status.",ht()}window.refreshPublishState=De;function Li(){let e=Rt();e.intervalId&&(clearInterval(e.intervalId),e.intervalId=null),De({silent:!0}),e.intervalId=window.setInterval(()=>{document.hidden||De({silent:!0})},15e3)}function $i(e){if(!e||!e.includes("[vx-img:"))return{text:e||"",images:[]};let t=[];return{text:e.replace(/\[vx-img:(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)\]/g,(n,o)=>(t.push(o),"")).trim(),images:t}}function $s(e){let t=Array.from(e),s=dn-Ge.length;if(s<=0){j(`Maximum ${dn} images per message.`,"warning");return}let n=t.slice(0,s);t.length>s&&j(`Only ${s} more image${s===1?"":"s"} allowed.`,"warning"),n.forEach(o=>{if(!Ts.includes(o.type)){j(`${o.name}: unsupported format. Use JPEG, PNG, GIF, or WebP.`,"warning");return}if(o.size>Fo){j(`${o.name}: too large (max 5MB).`,"warning");return}let i=new FileReader;i.onload=()=>{let a=i.result,r=a.match(/^data:(image\/[a-z+]+);base64,(.+)$/);if(!r)return;let d=new Image;d.onload=()=>{let p=Si(d,120);Ge.push({media_type:r[1],data:r[2],name:o.name,preview:a,thumbnail:p}),Is()},d.src=a},i.readAsDataURL(o)})}function Si(e,t=120){let s=e.naturalWidth,n=e.naturalHeight;if(s>t||n>t){let a=t/Math.max(s,n);s=Math.round(s*a),n=Math.round(n*a)}let o=document.createElement("canvas");return o.width=s,o.height=n,o.getContext("2d").drawImage(e,0,0,s,n),o.toDataURL("image/jpeg",.6)}function Is(){let e=document.getElementById("image-attachments");if(e){if(Ge.length===0){e.setAttribute("hidden",""),e.innerHTML="";return}e.removeAttribute("hidden"),e.innerHTML=Ge.map((t,s)=>`
    <div class="vs-image-thumb" data-index="${s}">
      <img src="${t.preview}" alt="${x(t.name)}" />
      <button class="vs-image-thumb-remove" data-remove-index="${s}" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
  `).join(""),e.querySelectorAll("[data-remove-index]").forEach(t=>{t.addEventListener("click",s=>{let n=parseInt(s.currentTarget.dataset.removeIndex,10);Ge.splice(n,1),Is()})})}}function Ti(){Ge=[],Is()}async function es(){if(Re())return;let e=document.getElementById("prompt-input");if(!e)return;let t=e.value.trim(),s=Ge.length>0;if(!t&&!s||I.get("aiStreaming"))return;e.value="",e.style.height="auto";let n=document.getElementById("chat-messages");if(!n)return;let o=[...Ge];Ti();let a=`
    <div class="vs-msg-user mb-6 mt-4">
      ${o.length>0?`<div class="vs-msg-user-images">${o.map(N=>`<img src="${N.preview}" alt="${x(N.name)}" class="vs-msg-user-image" />`).join("")}</div>`:""}
      ${t?`<div class="vs-msg-user-bubble">${x(t)}</div>`:""}
    </div>
  `,r=`${Date.now()}-${Math.floor(Math.random()*1e6)}`,d=`
    <div class="vs-msg-ai mb-6" data-stream-id="${r}">
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
  `,p=n.querySelector(".vs-empty-state");p&&p.remove(),n.insertAdjacentHTML("beforeend",a+d),n.scrollTop=n.scrollHeight;let c=!0,u=80,l=()=>{c=n.scrollHeight-n.scrollTop-n.clientHeight<=u};n.addEventListener("scroll",l);let m=()=>{c&&(n.scrollTop=n.scrollHeight)},h=n.querySelector(`.vs-msg-ai[data-stream-id="${r}"]`);if(!h)return;let g=h.querySelector('[data-role="typing"]'),b=h.querySelector('[data-role="status"]'),f=h.querySelector('[data-role="status-text"]'),v=h.querySelector('[data-role="stream-content"]'),C=h.querySelector('[data-role="files-section"]'),k=h.querySelector('[data-role="files"]'),M=h.querySelector('[data-role="files-label"]'),D=h.querySelector('[data-role="files-count"]'),z=h.querySelector('[data-role="files-progress"]'),q=h.querySelector('[data-role="error"]'),Z=h.querySelector('[data-role="status-timer"]'),G=N=>{N&&N.removeAttribute("hidden")},X=N=>{N&&N.setAttribute("hidden","")},$=Date.now(),O=0,W=Date.now(),K=!1,y=!1,_=setInterval(()=>{let N=Math.floor((Date.now()-$)/1e3),oe=Math.floor(N/60),be=N%60,w=oe>0?`${oe}m ${be}s`:`${be}s`;O>0&&(w+=` \xB7 ${O.toLocaleString()} tokens`),Z&&(Z.textContent=`\xB7 ${w}`),Date.now()-W>3e5&&!K&&(K=!0,f&&(f.textContent="No data for 5 min \u2014 the model may have stalled",f.style.color="var(--vs-warning, #d97706)"))},1e3);I.set("aiStreaming",!0);let P=document.getElementById("btn-send");P&&(P.disabled=!0,P.classList.add("opacity-50")),ki();let U="",J=[],de=!1,A=null,ne=!0,ve=new AbortController,le=h.querySelector('[data-role="stop-btn"]');le&&le.addEventListener("click",()=>ve.abort());let Ne=e.dataset.actionType||"free_prompt";delete e.dataset.actionType;let Te=e.dataset.actionData,Fe=null;if(Te){try{Fe=JSON.parse(Te)}catch{}delete e.dataset.actionData}let Ke=t||"(see attached images)";o.length>0&&(Ke=o.map(oe=>`[vx-img:${oe.thumbnail}]`).join("")+Ke);let xt={user_prompt:Ke,action_type:Ne,page_scope:I.get("activePageScope"),conversation_id:I.get("activeConversationId"),action_data:Fe};o.length>0&&(xt.images=o.map(N=>({data:N.data,media_type:N.media_type}))),await Qe("/ai/prompt",xt,{signal:ve.signal,onConversation(N){if(N){I.set("activeConversationId",N);try{localStorage.setItem("vs-active-conversation",N)}catch{}}},onStatus(N){!y&&C&&!C.hasAttribute("hidden")&&M&&(M.textContent=N),b&&f&&(f.textContent=N,G(b))},onToken(N){U+=N,O+=Math.ceil(N.length/4),W=Date.now(),K=!1,f&&(f.style.color="");let oe=U.trimStart();if(!de&&oe.length>0&&(de=oe.startsWith("{")||oe.startsWith("```json")||oe.startsWith("```")||oe.startsWith("<|")||oe.startsWith("<message>")||oe.startsWith("<file ")||N.includes("<|")||oe.includes("<|channel|>")||oe.includes('"operations"')||oe.includes('"assistant_message"'),de&&v&&(v.innerHTML="")),X(g),v&&de){let be=U.match(/<message>([\s\S]*?)(<\/message>|$)/);if(be){let w=be[1].trim();w&&(G(v),v.innerHTML=Kt(w))}C&&U.includes("<file ")&&G(C)}else v&&(G(v),v.innerHTML=Kt(U),b&&X(b));m()},onFile(N){if(J.push(N),C&&G(C),D){let oe=J.length;D.textContent=`${oe} file${oe!==1?"s":""}`}if(k){let oe=N.action==="delete",be=(J.length-1)*60,w=oe?'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="8" x2="12" y2="8"/></svg>':'<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 8 6.5 11.5 13 5"/></svg>';k.insertAdjacentHTML("beforeend",`
          <div class="vs-file-badge ${oe?"vs-file-badge-deleted":"vs-file-badge-created"}" style="animation-delay: ${be}ms">
            <span class="vs-file-badge-icon">${w}</span>
            <span>${x(N.path)}</span>
          </div>
        `)}A||(ne=!0),N.path.endsWith(".css")||(ne=!1),clearTimeout(A),A=setTimeout(()=>{Bs(ne?"voxelsite:reload-css":"voxelsite:reload"),A=null,ne=!0},600),m()},onDone(N){y=!0,clearTimeout(A),A=null,clearInterval(_),X(g),X(b);let oe=N.files_modified||[],be=J.length>0||oe.length>0;if(C&&be?(X(z),C.classList.add("vs-files-done"),M&&(M.textContent=N.partial?"Files updated (partial)":"Files updated")):C&&!C.hasAttribute("hidden")&&(X(z),X(C)),v)if(N.message)G(v),v.innerHTML=Kt(N.message);else if(de)X(v);else{let S=v.textContent||"";(S.includes("<|channel|>")||S.includes('"operations"')||S.includes('"assistant_message"')||S.includes("<file ")||S.includes("<message>"))&&(X(v),v.innerHTML="")}let w=N.missing_files||[];if((N.truncated||w.length>0)&&v){let S;w.length>0?S=`The following pages are linked in the navigation but were NOT created yet: ${w.join(", ")}. Please generate ONLY these missing pages. Match the existing design, layout, and style exactly. Do NOT regenerate any files that already exist.`:S="The previous response was truncated. Complete any unfinished files. Do NOT regenerate files that already exist.",setTimeout(()=>{let B=document.getElementById("prompt-input");B&&!I.get("aiStreaming")&&(M&&(M.textContent="Generating remaining files..."),C&&(C.classList.remove("vs-files-done"),G(C)),B.value=S,B.dataset.actionType=Ne,es())},800)}if(N.conversation_id){I.set("activeConversationId",N.conversation_id);try{localStorage.setItem("vs-active-conversation",N.conversation_id)}catch{}}let L=[...J,...oe];if(L.length>0){let S=L.map(H=>H.path||H),B=S.some(H=>H==="index.php"),R=S.filter(H=>H.endsWith(".php")&&!H.includes("/")&&H!=="index.php"),V=B&&R.length>0,F;V?F="index.php":R.length>0?F=R[0]:F=B?"index.php":null,yt(F),I.set("previewDirty",!0),De({silent:!0})}fn(),$n(),Ht(),n.removeEventListener("scroll",l),n.scrollTop=n.scrollHeight},onWarning(N){N.toLowerCase().includes("truncat")||k&&(k.innerHTML+=`
          <div class="vs-badge vs-badge-warning mt-2">${x(N)}</div>
        `)},onError(N){clearTimeout(A),A=null,clearInterval(_),X(g),X(b),q&&(q.textContent=N.message||"Something went wrong.",G(q)),fn(),z&&X(z),C&&J.length>0&&(C.classList.add("vs-files-done"),M&&(M.textContent="Files updated (partial)"))}}),I.set("aiStreaming",!1),P&&(P.disabled=!1,P.classList.remove("opacity-50"))}function xn(){var u;Cn.innerHTML=`
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
            <h1 class="vs-login-title">${ke?"Welcome to the Demo":"Enter the Studio"}</h1>
            <p class="vs-login-subtitle">${ke?"Explore freely \u2014 this is a live preview.":"Resume construction."}</p>
          </div>

          ${ke?`
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
                ${ke?'value="demo@example.com"':""}>
            </div>

            <div>
              <div class="vs-login-field-header">
                <label class="vs-input-label">Password</label>
                ${ke?"":'<button type="button" id="btn-forgot" class="vs-login-forgot">Forgot?</button>'}
              </div>
              <div class="vs-login-password-wrap">
                <input id="login-password" type="password" required
                  class="vs-input"
                  placeholder="Your password"
                  ${ke?'value="welcome3210"':""}>
                <button type="button" id="btn-toggle-pw" class="vs-login-eye" title="Show password">
                  ${E.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="vs-btn vs-btn-primary vs-login-submit">
              ${ke?"Enter Demo":"Open Studio"}
            </button>
          </form>

          <div class="vs-login-footer">
            <p>${ke?"Read-only preview \u2014 install your own copy to get started.":"Your files. Your server. Your website."}</p>
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
  `;let e=document.getElementById("login-password"),t=document.getElementById("btn-toggle-pw");t&&e&&t.addEventListener("click",()=>{let l=e.type==="password";e.type=l?"text":"password",t.innerHTML=l?E.eyeOff:E.eye,t.title=l?"Hide password":"Show password"});let s=document.getElementById("btn-login-theme");s&&s.addEventListener("click",()=>{let l=ds();s.style.transform="rotate(180deg) scale(0.8)",s.style.opacity="0",setTimeout(()=>{s.innerHTML=l==="light"?E.sun:E.moon,s.style.transform="rotate(0deg) scale(1)",s.style.opacity="1"},150)});function n(){document.querySelectorAll("[data-toggle-target]").forEach(l=>{l.addEventListener("click",()=>{let m=document.getElementById(l.dataset.toggleTarget);if(!m)return;let h=m.type==="password";m.type=h?"text":"password",l.innerHTML=h?E.eyeOff:E.eye,l.title=h?"Hide password":"Show password"})})}let o=document.getElementById("login-state"),i=document.getElementById("forgot-state"),a=document.getElementById("btn-forgot"),r=document.getElementById("btn-back-login");a&&a.addEventListener("click",async()=>{var m,h,g;o.classList.add("hidden"),i.classList.remove("hidden");let l=document.getElementById("forgot-content");try{let f=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Frecovery-mode")).json();(((m=f==null?void 0:f.data)==null?void 0:m.mode)||"file")==="email"?(l.innerHTML=`
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
          `,(h=document.getElementById("forgot-form"))==null||h.addEventListener("submit",async C=>{var q,Z,G;C.preventDefault();let k=document.getElementById("forgot-message"),M=document.getElementById("forgot-email"),D=C.target.querySelector('button[type="submit"]'),z=(q=M==null?void 0:M.value)==null?void 0:q.trim();if(z){D&&(D.disabled=!0,D.textContent="Sending...");try{let $=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Fsend-reset",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:z})})).json();k&&($.ok?(k.textContent=((Z=$.data)==null?void 0:Z.message)||"Recovery link sent. Check your inbox.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",M&&(M.value="")):(k.textContent=((G=$.error)==null?void 0:G.message)||"Failed to send recovery email.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);"),k.classList.remove("hidden"))}catch{k&&(k.textContent="Network error. Please try again.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",k.classList.remove("hidden"))}finally{D&&(D.disabled=!1,D.textContent="Send Recovery Link")}}})):(l.innerHTML=`
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
          `,n(),(g=document.getElementById("forgot-form"))==null||g.addEventListener("submit",async C=>{var q,Z,G;C.preventDefault();let k=document.getElementById("forgot-message"),M=(q=document.getElementById("forgot-email"))==null?void 0:q.value,D=(Z=document.getElementById("forgot-new-password"))==null?void 0:Z.value;if(!M||!D)return;let z=await T.post("/auth/reset-password",{email:M,new_password:D});z.ok?(k&&(k.textContent="Password reset. You can now sign in with your new password.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",k.classList.remove("hidden")),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):k&&(k.textContent=((G=z.error)==null?void 0:G.message)||"Reset failed. Make sure the .reset file exists in _data/.",k.className="mb-5 px-4 py-3 text-sm rounded-xl border",k.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",k.classList.remove("hidden"))}))}catch{l.innerHTML=`
          <div class="vs-login-header">
            <h1 class="vs-login-title">Reset Password</h1>
            <p class="vs-login-subtitle">Could not determine recovery mode. Contact your administrator.</p>
          </div>
        `}}),r&&r.addEventListener("click",()=>{i.classList.add("hidden"),o.classList.remove("hidden")});let p=new URLSearchParams(window.location.search).get("reset");if(p&&p.length===64&&i&&o){let l=window.location.pathname+window.location.hash;window.history.replaceState(null,"",l),o.classList.add("hidden"),i.classList.remove("hidden");let m=document.getElementById("forgot-content");m&&(m.innerHTML=`
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
      `,n(),(u=document.getElementById("token-reset-form"))==null||u.addEventListener("submit",async h=>{var C,k,M,D;h.preventDefault();let g=document.getElementById("forgot-message"),b=(C=document.getElementById("token-new-password"))==null?void 0:C.value,f=(k=document.getElementById("token-confirm-password"))==null?void 0:k.value,v=h.target.querySelector('button[type="submit"]');if(!b||b.length<8){g&&(g.textContent="Password must be at least 8 characters.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",g.classList.remove("hidden"));return}if(b!==f){g&&(g.textContent="Passwords do not match.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",g.classList.remove("hidden"));return}v&&(v.disabled=!0,v.textContent="Resetting...");try{let q=await(await fetch("/_studio/api/router.php?_path=%2Fauth%2Freset-with-token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:p,new_password:b})})).json();g&&(q.ok?(g.textContent=((M=q.data)==null?void 0:M.message)||"Password reset. You can now sign in.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-success) 10%, transparent); border-color: color-mix(in srgb, var(--vs-success) 25%, transparent); color: var(--vs-success);",g.classList.remove("hidden"),h.target.querySelectorAll("input").forEach(Z=>Z.disabled=!0),v&&(v.style.display="none"),setTimeout(()=>{i.classList.add("hidden"),o.classList.remove("hidden")},2500)):(g.textContent=((D=q.error)==null?void 0:D.message)||"Reset failed. The link may have expired.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",g.classList.remove("hidden")))}catch{g&&(g.textContent="Network error. Please try again.",g.className="mb-5 px-4 py-3 text-sm rounded-xl border",g.style.cssText="background: color-mix(in srgb, var(--vs-error) 10%, transparent); border-color: color-mix(in srgb, var(--vs-error) 25%, transparent); color: var(--vs-error);",g.classList.remove("hidden"))}finally{v&&(v.disabled=!1,v.textContent="Reset Password")}}))}let c=document.getElementById("login-form");c&&c.addEventListener("submit",async l=>{var f,v,C,k;l.preventDefault();let m=(f=document.getElementById("login-email"))==null?void 0:f.value,h=(v=document.getElementById("login-password"))==null?void 0:v.value,g=document.getElementById("login-error");if(!m||!h)return;let b=await T.post("/auth/login",{email:m,password:h});b.ok&&((C=b.data)!=null&&C.token)?(I.batch(()=>{I.set("user",b.data.user),I.set("sessionToken",b.data.token)}),Ln()):g&&(g.textContent=((k=b.error)==null?void 0:k.message)||"Invalid email or password.",g.classList.remove("hidden"))}),Ht()}function Wt(){let e=document.getElementById("onboarding-modal");return!!e&&!e.classList.contains("hidden")}function Kt(e){if(!e)return"";if(!window.marked)return x(e);let t=window.marked.parse(e);return Bi(t)}function Bi(e){if(!e||typeof e!="string")return"";if(!e.includes("<pre"))return e;let t=document.createElement("template");return t.innerHTML=e,t.content.querySelectorAll("pre").forEach(n=>{let o=n.querySelector("code"),a=((o?o.textContent:n.textContent)||"").replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/\n+$/g,""),r=a?a.split(`
`):[];if(r.length<=Do)return;let d=r.slice(0,No).join(`
`)+`
...`,p=document.createElement("div");p.className="vs-code-collapse",p.setAttribute("data-code-collapse","1");let c=document.createElement("pre");c.className="vs-code-collapse-preview",c.setAttribute("data-code-preview","1");let u=document.createElement("code");o!=null&&o.className&&(u.className=o.className),u.textContent=d,c.appendChild(u),n.classList.add("vs-code-collapse-full","hidden"),n.setAttribute("data-code-full","1");let l=document.createElement("button");l.type="button",l.className="vs-code-collapse-toggle",l.setAttribute("data-code-toggle","1"),l.setAttribute("data-lines",String(r.length)),l.setAttribute("aria-expanded","false"),l.textContent=`More (${r.length} lines)`;let m=n.parentNode;m&&(m.replaceChild(p,n),p.appendChild(c),p.appendChild(n),p.appendChild(l))}),t.innerHTML}function Mi(e){let t=e.closest("[data-code-collapse]");if(!t)return;let s=t.querySelector("[data-code-preview]"),n=t.querySelector("[data-code-full]"),o=e.dataset.lines||"",i=t.classList.toggle("is-expanded");s&&s.classList.toggle("hidden",i),n&&n.classList.toggle("hidden",!i),e.setAttribute("aria-expanded",i?"true":"false"),e.textContent=i?"Less":`More${o?` (${o} lines)`:""}`}Ln();})();
