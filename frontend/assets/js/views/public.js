/* DSN Talent Platform: Public screens: welcome, talent directory, talent profile, CV document and PDF, apply, log in (with test access), recruiter registration. */
"use strict";
/* ---------- PUBLIC: home ---------- */
VIEWS.home=()=>{
  const ms=Object.values(S.members).filter(m=>m.visible!==false);
  const vr=ms.reduce((a,m)=>a+verifiedRoles(m).length,0);
  const partners=Object.values(S.recruiters).filter(r=>r.status==="approved").length;
  const featured=ms.slice().sort((a,b)=>(verifiedRoles(b).length>0)-(verifiedRoles(a).length>0)||total(b)-total(a)).slice(0,3);
  after(startWelcome);
  return`<section class="welcome"><canvas id="net" aria-hidden="true"></canvas><div class="inner">
   <span class="kicker rise"><img src="${LOGO}" alt="">Data Science Nigeria</span>
   <h1 class="rise d1">Welcome to the <span class="g">DSN</span> <span class="u">Talent Platform</span></h1>
   <p class="tag rise d2">Verified data and AI talent from the Data Science Nigeria community.</p>
   <div class="cta rise d3"><button class="btn primary" data-go="directory">Find talent</button><button class="btn blue" data-go="apply">Join as a member</button><button class="btn" data-go="login">Log in</button></div>${CONFIG.DEMO_MODE?`<button class="test-pill rise d4" data-go="login">Testing the platform? Use one-click test access →</button>`:""}</div></section>
  <div class="doors rise d4">
   <button class="door g" data-go="apply"><b>Members</b><span>Build your profile and get verified.</span><span class="arr">Apply <i>→</i></span></button>
   <button class="door b" data-go="login" data-p='{"kind":"reviewer"}'><b>Reviewers</b><span>Rate and verify DSN talent.</span><span class="arr">Reviewer log in <i>→</i></span></button>
   <button class="door r" data-go="rc-register"><b>Partners</b><span>Hire through DSN.</span><span class="arr">Get access <i>→</i></span></button></div>
  <div class="numbers"><div><b data-count="${ms.length}">${ms.length}</b><span>Members</span></div><div><b data-count="${vr}">${vr}</b><span>Verified roles</span></div><div><b data-count="${partners}">${partners}</b><span>Hiring partners</span></div></div>
  ${featured.length?`<section class="meet"><div class="section-h"><h2>Meet the talent</h2><button class="btn sm" data-go="directory">See all</button></div><div class="tgrid">${featured.map(talentCard).join("")}</div></section>`:`<div style="height:64px"></div>`}`;
};
let netRAF=0;
function startWelcome(){
  cancelAnimationFrame(netRAF);
  const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-count]").forEach(el=>{const n=+el.dataset.count;if(reduce||!n)return;const t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/1200);el.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)};el.textContent="0";requestAnimationFrame(step)});
  const c=$("#net");if(!c)return;const ctx=c.getContext("2d");const COLS=["#0F9B4A","#0F9B4A","#0F9B4A","#DE0728","#212E81","#212E81"];
  let W=0,H=0,dpr=Math.min(2,window.devicePixelRatio||1),pts=[];
  const size=()=>{const r=c.getBoundingClientRect();W=r.width;H=r.height;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);const n=Math.round(Math.min(90,W*H/14000));pts=Array.from({length:n},()=>({x:W*.35+Math.random()*W*.65,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:2+Math.random()*3,c:COLS[Math.floor(Math.random()*COLS.length)],sq:Math.random()<.45}))};
  size();window.onresize=()=>{if($("#net"))size()};
  const draw=()=>{ctx.clearRect(0,0,W,H);
    for(let i=0;i<pts.length;i++){const p=pts[i];for(let j=i+1;j<pts.length;j++){const q=pts[j];const dx=p.x-q.x,dy=p.y-q.y,d=dx*dx+dy*dy;if(d<13000){ctx.strokeStyle="rgba(15,155,74,"+(0.16*(1-d/13000))+")";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}}}
    pts.forEach(p=>{const fade=Math.min(1,Math.max(0,(p.x-W*.25)/(W*.2)));ctx.globalAlpha=.25+.6*fade;ctx.fillStyle=p.c;if(p.sq)ctx.fillRect(p.x-p.r,p.y-p.r,p.r*2,p.r*2);else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill()}ctx.globalAlpha=1});};
  const tick=()=>{if(!document.body.contains(c))return;pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<W*.2||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1});draw();netRAF=requestAnimationFrame(tick)};
  if(reduce)draw();else tick();
}

/* ---------- directory ---------- */
VIEWS.directory=()=>{
  const f=UI.dirFilter;const full=isSubscribed()||isAdmin();
  let ms=Object.values(S.members).filter(m=>m.visible!==false);
  const q=f.q.trim().toLowerCase();
  if(q)ms=ms.filter(m=>[m.dsnId,m.headline,(m.skills||[]).join(" "),(m.roles||[]).map(r=>r.role).join(" "),full?m.name:""].join(" ").toLowerCase().includes(q));
  if(f.role)ms=ms.filter(m=>(m.roles||[]).some(r=>r.role===f.role&&(!f.verified||r.status==="verified")&&(!f.level||r.level===f.level)));
  else{if(f.verified)ms=ms.filter(m=>verifiedRoles(m).length);if(f.level)ms=ms.filter(m=>verifiedRoles(m).some(r=>r.level===f.level))}
  if(f.min)ms=ms.filter(m=>total(m)>=f.min);
  const vmatch=m=>f.role?(m.roles||[]).some(r=>r.role===f.role&&r.status==="verified"):verifiedRoles(m).length>0;
  ms.sort(f.sort==="score"?(a,b)=>total(b)-total(a):f.sort==="new"?(a,b)=>String(b.createdAt).localeCompare(a.createdAt):(a,b)=>(vmatch(b)-vmatch(a))||total(b)-total(a));
  const lockNote=!full?`<div class="note ${isRecruiter()?"warn":""}">${isRecruiter()?`Your company is on the free plan. You can see DSN IDs, roles and ratings. <b>Subscribe</b> to see names, full CVs and to request specific talent. <button class="btn sm" data-go="rc-plan" style="margin-left:6px">View subscription</button>`:`Names are hidden to protect members. Subscribed recruiters see full profiles. <button class="btn sm" data-go="login" data-p='{"kind":"recruiter"}' style="margin-left:6px">Recruiter log in</button>`}</div>`:"";
  return`<div class="section-h"><div><div class="eyebrow">Talent directory</div><h1 style="font-size:32px">Find DSN talent</h1></div><span class="muted">${ms.length} profile${ms.length===1?"":"s"}</span></div>
  <div class="stack">${lockNote}
  <div class="card" style="padding:14px"><div class="row" style="gap:10px">
   <input type="search" id="f-q" placeholder="${full?"Name, DSN ID, skill or role":"DSN ID, skill or role"}" value="${esc(f.q)}" style="flex:2;min-width:200px" aria-label="Search">
   <select id="f-role" style="flex:1;min-width:170px" aria-label="Role"><option value="">All roles</option>${rolesList().map(r=>`<option ${r===f.role?"selected":""}>${esc(r)}</option>`).join("")}</select>
   <select id="f-level" style="flex:0 1 150px" aria-label="Level"><option value="">Any level</option>${LEVELS.map(l=>`<option ${l===f.level?"selected":""}>${l}</option>`).join("")}</select>
   <select id="f-min" style="flex:0 1 150px" aria-label="Minimum rating">${[0,40,50,60,70,80].map(v=>`<option value="${v}" ${+f.min===v?"selected":""}>${v?"Rating "+v+"+":"Any rating"}</option>`).join("")}</select>
   <select id="f-sort" style="flex:0 1 170px" aria-label="Sort"><option value="best" ${f.sort==="best"?"selected":""}>Verified first</option><option value="score" ${f.sort==="score"?"selected":""}>Highest rating</option><option value="new" ${f.sort==="new"?"selected":""}>Newest</option></select>
   <label class="check"><input type="checkbox" id="f-ver" ${f.verified?"checked":""}> Verified roles only</label></div></div>
  ${ms.length?`<div class="tgrid">${ms.map(talentCard).join("")}</div>`:`<div class="empty">No profiles match these filters.</div>`}</div>`;
};
function bindDir(){const set=()=>{UI.dirFilter={q:$("#f-q").value,role:$("#f-role").value,level:$("#f-level").value,min:+$("#f-min").value,sort:$("#f-sort").value,verified:$("#f-ver").checked};const pos=$("#f-q").selectionStart;const focusQ=document.activeElement===$("#f-q");render();if(focusQ){const i=$("#f-q");i.focus();try{i.setSelectionRange(pos,pos)}catch(e){}}};
 ["#f-role","#f-level","#f-min","#f-sort","#f-ver"].forEach(s=>$(s)?.addEventListener("change",set));let t;$("#f-q")?.addEventListener("input",()=>{clearTimeout(t);t=setTimeout(set,250)})}

/* ---------- talent profile ---------- */
VIEWS.talent=({id})=>{
  const m=S.members[id];if(!m||(m.visible===false&&!canSeeFull(id)))return`<div class="empty">This profile isn't available.</div>`;
  const full=canSeeFull(id);const self=SESSION?.kind==="member"&&SESSION.id===id;
  if(isSubscribed()&&!viewedOnce.has(id)){viewedOnce.add(id);after(()=>logView(id))}
  const vr=(m.roles||[]).filter(r=>r.status==="verified"),cr=(m.roles||[]).filter(r=>r.status!=="verified");
  let actions="";
  if(self)actions=`<button class="btn primary" data-go="m-edit">Edit my CV</button><button class="btn" data-go="cv" data-p='${esc(JSON.stringify({id}))}'>View CV</button>`;
  else if(isSubscribed())actions=`<button class="btn primary" data-act="request-talent" data-id="${esc(id)}">Request this talent</button><button class="btn" data-go="cv" data-p='${esc(JSON.stringify({id}))}'>View full CV</button><button class="btn" data-act="download-cv" data-id="${esc(id)}">Download CV (PDF)</button>`;
  else if(isAdmin()||isReviewer())actions=`<button class="btn" data-go="cv" data-p='${esc(JSON.stringify({id}))}'>View full CV</button><button class="btn" data-act="download-cv" data-id="${esc(id)}">Download CV (PDF)</button>`;
  const locked=!full?`<div class="lock"><span class="muted">${ICON.lock}</span><div class="stack" style="gap:8px"><b>Full CV is for subscribed recruiters</b><p class="small muted">Subscribers see the member's name, work history, projects, education and certifications, and can download the CV. Members are never contacted directly. DSN handles every talent request.</p><div class="row">${isRecruiter()?`<button class="btn sm primary" data-go="rc-plan">Subscribe</button>`:`<button class="btn sm" data-go="login" data-p='{"kind":"recruiter"}'>Recruiter log in</button><button class="btn sm ghost" data-go="rc-register">Register your company</button>`}</div></div></div>`:"";
  const counts=`${(m.experience||[]).length} roles held · ${(m.projects||[]).length} projects · ${(m.education||[]).length} qualifications · ${(m.certifications||[]).length} certifications`;
  return`<button class="btn sm ghost" data-act="back" style="margin-bottom:12px">← Back</button>
  <div class="split"><div class="stack">
   <div class="card"><div class="row" style="gap:16px;align-items:flex-start;flex-wrap:nowrap"><span class="av lg ${full?"":"masked"}">${full?esc(initials(m.name)):"•"}</span><div class="stack" style="gap:6px;flex:1;min-width:0"><h2>${esc(displayName(m))}</h2><div class="row small" style="gap:8px"><span class="mono">${esc(m.dsnId)}</span>${m.location?`<span class="muted">· ${esc(m.location)}</span>`:""}${m.openToWork!==false?`<span class="badge blue">Open to opportunities</span>`:""}</div><p class="muted">${esc(m.headline||"")}</p></div></div>
    ${actions?`<div class="row" style="margin-top:16px">${actions}</div>`:""}</div>
   <div class="card stack" style="gap:10px"><div class="row between"><h3>Roles</h3><button class="btn sm ghost" data-go="roles">What the levels mean</button></div>${rolesBlock(m)}</div>
   <div class="card stack" style="gap:10px"><h3>Summary</h3>${full?`<p>${esc(m.summary||"No summary yet.")}</p>`:`<p class="muted small">${esc(counts)}</p>`}
    <div class="eyebrow" style="margin-top:6px">Skills</div><div class="chips">${(m.skills||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join("")||'<span class="muted small">None listed</span>'}</div></div>
   ${full?cvSections(m,{compact:true}):locked}
  </div>
  <div class="stack"><div class="card">${scorePanel(m)}</div>
   <div class="card small"><div class="eyebrow" style="margin-bottom:8px">What the categories mean</div>${CATS.map(c=>`<p style="margin-bottom:6px"><b>${esc(c.label)}.</b> <span class="muted">${esc(c.bands[2][1])} scores 11–15.</span></p>`).join("")}<button class="btn sm ghost" data-act="show-rubric">See full rubric</button></div></div></div>`;
};
function cvSections(m,{compact=false}={}){
  const sec=(t,items)=>items?`<div class="card stack" style="gap:12px"><h3>${t}</h3>${items}</div>`:"";
  const exp=(m.experience||[]).map(e=>`<div><div class="row between"><b>${esc(e.role)}</b><span class="small muted">${fmtYM(e.start)} – ${e.current?"Present":fmtYM(e.end)}</span></div><div class="muted small">${esc(e.company)}</div>${e.description?`<p class="small" style="margin-top:4px">${esc(e.description)}</p>`:""}</div>`).join("<hr>");
  const pr=(m.projects||[]).map(p=>`<div><div class="row between"><b>${esc(p.title)}</b>${p.link?`<a class="small" href="${esc(p.link)}" target="_blank" rel="noopener">Open link ↗</a>`:""}</div>${p.tools?`<div class="small muted">${esc(p.tools)}</div>`:""}<p class="small" style="margin-top:4px">${esc(p.description||"")}${p.outcome?` <b>Outcome:</b> ${esc(p.outcome)}`:""}</p></div>`).join("<hr>");
  const ed=(m.education||[]).map(e=>`<div class="row between"><div><b>${esc(e.degree)} ${esc(e.field)}</b><div class="small muted">${esc(e.school)}</div></div><span class="small muted">${esc(e.year)}</span></div>`).join("");
  const ce=(m.certifications||[]).map(c=>`<div class="row between"><div><b>${esc(c.name)}</b><div class="small muted">${esc(c.issuer)}</div></div><span class="small muted">${esc(c.year)}</span></div>`).join("");
  const ac=(m.achievements||[]).filter(Boolean).map(a=>`<li>${esc(a)}</li>`).join("");
  return sec("Work experience",exp)+sec("Projects",pr)+sec("Education",ed)+sec("Certifications",ce)+(ac?sec("Achievements",`<ul style="margin:0;padding-left:18px">${ac}</ul>`):"");
}
async function logView(memberId){const r=me();if(!r)return;const id=memberId+"__"+r.id;const cur=S.views[id];await put("views",id,{memberId,recruiterId:r.id,company:r.company,count:(cur?.count||0)+1,lastAt:now()}).catch(()=>{})}

/* ---------- CV document ---------- */
VIEWS.cv=({id})=>{
  const m=S.members[id];if(!m)return`<div class="empty">CV not found.</div>`;
  if(!canSeeFull(id))return`<div class="lock"><span class="muted">${ICON.lock}</span><div><b>Full CVs are for subscribed recruiters.</b><p class="small muted">You can still see this member's DSN ID, roles and rating on their profile.</p><div class="row" style="margin-top:10px"><button class="btn sm" data-go="talent" data-p='${esc(JSON.stringify({id}))}'>Back to profile</button></div></div></div>`;
  if(isSubscribed()&&!viewedOnce.has(id)){viewedOnce.add(id);after(()=>logView(id))}
  return`<div class="row between" style="margin-bottom:16px"><button class="btn sm ghost" data-act="back">← Back</button><div class="row"><span class="small muted">Standard DSN CV format</span><button class="btn primary" data-act="download-cv" data-id="${esc(id)}">Download CV (PDF)</button></div></div>${cvDoc(m)}`;
};
function cvDoc(m){
  const vr=verifiedRoles(m);const roleTag=r=>r.status==="verified"?`<span class="vtag">DSN VERIFIED · ${esc(r.level.toUpperCase())}</span>`:`<span class="ctag">CLAIMED</span>`;
  return`<article class="cv"><div class="row between" style="align-items:flex-start"><div><h1>${esc(m.name)}</h1><div class="cv-sub">${esc(m.headline||"")}</div><div class="cv-sub mono" style="font-size:12.5px;margin-top:6px">DSN ID ${esc(m.dsnId)}${m.location?" · "+esc(m.location):""}</div></div><div style="text-align:right"><div style="font-family:var(--display);font-size:34px;font-weight:700;color:#0A7338;line-height:1">${total(m)}<span style="font-size:14px;color:#6b747c">/100</span></div><div style="font-size:11px;color:#6b747c">DSN Rating${m.scoreStatus==="reviewed"?" · reviewed "+fmtD(m.reviewedAt):" · not yet reviewed"}</div></div></div>
  <div class="cv-bar"></div>
  <h4 style="margin-top:0">Profile</h4><p>${esc(m.summary||"")}</p>
  <h4>DSN verified roles</h4>${vr.length?vr.map(r=>`<div>${esc(r.role)} · <b>${esc(r.level)}</b> <span class="vtag">DSN VERIFIED ${fmtD(r.verifiedAt).toUpperCase()}</span></div>`).join(""):"<p style='color:#6b747c'>None yet</p>"}
  ${(m.roles||[]).some(r=>r.status!=="verified")?`<h4>Claimed roles (not verified)</h4>${(m.roles||[]).filter(r=>r.status!=="verified").map(r=>`<div style="color:#4a545d">${esc(r.role)} · ${esc(r.level||"")} <span class="ctag">CLAIMED</span></div>`).join("")}`:""}
  <h4>DSN Rating breakdown</h4><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px 14px;font-size:13px">${CATS.map(c=>`<div>${esc(c.label)}: <b>${(m.scores||{})[c.k]||0}/20</b></div>`).join("")}</div>
  <h4>Skills</h4><p>${esc((m.skills||[]).join(" · "))}</p>
  <h4>Work experience</h4>${(m.experience||[]).map(e=>`<div class="it"><div class="it-h"><span>${esc(e.role)}, ${esc(e.company)}${vr.some(r=>r.role===e.role)?'<span class="vtag">ROLE VERIFIED</span>':""}</span><span class="it-m">${fmtYM(e.start)} – ${e.current?"Present":fmtYM(e.end)}</span></div><div>${esc(e.description||"")}</div></div>`).join("")||"<p>—</p>"}
  <h4>Projects</h4>${(m.projects||[]).map(p=>`<div class="it"><div class="it-h"><span>${esc(p.title)}</span><span class="it-m">${esc(p.tools||"")}</span></div><div>${esc(p.description||"")}${p.outcome?" Outcome: "+esc(p.outcome)+".":""}</div>${p.link?`<div class="it-m">${esc(p.link)}</div>`:""}</div>`).join("")||"<p>—</p>"}
  <h4>Education</h4>${(m.education||[]).map(e=>`<div class="it"><div class="it-h"><span>${esc(e.degree)} ${esc(e.field)}</span><span class="it-m">${esc(e.year)}</span></div><div class="it-m">${esc(e.school)}</div></div>`).join("")||"<p>—</p>"}
  <h4>Certifications</h4>${(m.certifications||[]).map(c=>`<div class="it"><div class="it-h"><span>${esc(c.name)}</span><span class="it-m">${esc(c.year)}</span></div><div class="it-m">${esc(c.issuer)}</div></div>`).join("")||"<p>—</p>"}
  ${(m.achievements||[]).filter(Boolean).length?`<h4>Achievements</h4><ul style="margin:0;padding-left:18px">${m.achievements.filter(Boolean).map(a=>`<li>${esc(a)}</li>`).join("")}</ul>`:""}
  <div class="foot">Generated from the DSN Talent Platform on ${fmtD(now())}. Items marked DSN VERIFIED were checked by a DSN peer reviewer; items marked CLAIMED are the member's own statement. To engage this member, send a talent request through DSN.</div></article>`;
}
async function downloadCV(id){
  const m=S.members[id];if(!m||!canSeeFull(id))return;
  if(!window.jspdf){toast("PDF tool didn't load. Check your connection and try again.");return}
  const{jsPDF}=window.jspdf;const doc=new jsPDF({unit:"pt",format:"a4"});const W=595,L=48,R=W-48;let y=56;
  const need=h=>{if(y+h>790){doc.addPage();y=56}};
  const txt=(s,{size=10,bold=false,color=[27,31,35],indent=0,gap=4}={})=>{doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);doc.setTextColor(...color);const lines=doc.splitTextToSize(String(s||""),R-L-indent);lines.forEach(l=>{need(size+2);doc.text(l,L+indent,y);y+=size+3});y+=gap};
  const head=t=>{y+=6;need(24);doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(15,155,74);doc.text(t.toUpperCase(),L,y);y+=5;doc.setDrawColor(220,226,222);doc.line(L,y,R,y);y+=14};
  const clean=s=>String(s||"").replace(/[–—]/g,"-").replace(/₦/g,"NGN ").replace(/[^\x00-\xFF]/g,"");
  doc.setFont("helvetica","bold");doc.setFontSize(22);doc.setTextColor(27,31,35);doc.text(clean(m.name),L,y);
  doc.setFontSize(24);doc.setTextColor(15,155,74);doc.text(String(total(m)),R-34,y,{align:"right"});doc.setFontSize(10);doc.setTextColor(107,116,124);doc.text("/100",R,y,{align:"right"});y+=16;
  txt(clean(m.headline),{size:11,color:[74,84,93],gap:0});txt("DSN ID "+m.dsnId+(m.location?"  |  "+clean(m.location):"")+"  |  DSN Rating "+(m.scoreStatus==="reviewed"?"reviewed "+fmtD(m.reviewedAt):"not yet reviewed"),{size:9,color:[107,116,124]});
  doc.setFillColor(15,155,74);doc.rect(L,y,(R-L)*.7,3,"F");doc.setFillColor(222,7,40);doc.rect(L+(R-L)*.7,y,(R-L)*.15,3,"F");doc.setFillColor(33,46,129);doc.rect(L+(R-L)*.85,y,(R-L)*.15,3,"F");y+=16;
  head("Profile");txt(clean(m.summary));
  head("DSN verified roles");const vrs=verifiedRoles(m);if(vrs.length)vrs.forEach(r=>txt(clean(r.role)+"  -  "+r.level+"  (verified "+fmtD(r.verifiedAt)+")",{bold:true,gap:1}));else txt("None yet",{color:[107,116,124],gap:1});y+=3;
  const crs=(m.roles||[]).filter(r=>r.status!=="verified");if(crs.length){head("Claimed roles (not verified)");crs.forEach(r=>txt(clean(r.role)+"  -  "+(r.level||"")+"  (self-declared)",{color:[74,84,93],gap:1}));y+=3}
  head("DSN Rating breakdown");CATS.forEach(c=>txt(c.label+": "+((m.scores||{})[c.k]||0)+"/20",{gap:0}));y+=4;
  head("Skills");txt(clean((m.skills||[]).join("  |  ")));
  head("Work experience");(m.experience||[]).forEach(e=>{txt(clean(e.role+", "+e.company),{bold:true,gap:0});txt(fmtYM(e.start)+" - "+(e.current?"Present":fmtYM(e.end)),{size:9,color:[107,116,124],gap:1});txt(clean(e.description),{gap:8})});
  head("Projects");(m.projects||[]).forEach(p=>{txt(clean(p.title),{bold:true,gap:0});if(p.tools)txt(clean(p.tools),{size:9,color:[107,116,124],gap:1});txt(clean((p.description||"")+(p.outcome?" Outcome: "+p.outcome+".":"")),{gap:p.link?0:8});if(p.link)txt(clean(p.link),{size:9,color:[47,60,145],gap:8})});
  head("Education");(m.education||[]).forEach(e=>{txt(clean(e.degree+" "+e.field+" ("+e.year+")"),{bold:true,gap:0});txt(clean(e.school),{size:9,color:[107,116,124],gap:6})});
  head("Certifications");(m.certifications||[]).forEach(c=>{txt(clean(c.name+" ("+c.year+")"),{bold:true,gap:0});txt(clean(c.issuer),{size:9,color:[107,116,124],gap:6})});
  if((m.achievements||[]).filter(Boolean).length){head("Achievements");m.achievements.filter(Boolean).forEach(a=>txt("- "+clean(a),{gap:1}))}
  y+=10;txt("Generated from the DSN Talent Platform on "+fmtD(now())+". DSN VERIFIED items were checked by a DSN peer reviewer. To engage this member, send a talent request through DSN.",{size:8,color:[107,116,124]});
  const blob=doc.output("blob");const fname="DSN-CV-"+m.dsnId+".pdf";
  if(DL){try{await DL.save({filename:fname,data:blob});toast("CV ready")}catch(e){if(e.code!=="declined")toast("Download didn't start: "+(e.message||e.code))}}
  else{try{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=fname;document.body.appendChild(a);a.click();a.remove()}catch(e){toast("Downloads aren't available in this view")}}
}

/* ---------- apply ---------- */
VIEWS.apply=()=>{
  if(R.p.done)return`<div class="card stack" style="max-width:640px;margin:0 auto"><span class="badge verified" style="align-self:flex-start">${ICON.check}Application received</span><h2>Thank you, ${esc(R.p.name)}.</h2><p>DSN will review your application and create your profile. When it's ready, log in with your DSN ID <b class="mono">${esc(R.p.id)}</b> and create your own password.</p><div class="row"><button class="btn primary" data-go="login" data-p='{"kind":"member"}'>Go to log in</button><button class="btn" data-go="home">Back home</button></div></div>`;
  const st=settings();
  return`<div class="split"><form class="card stack" id="apply-form" novalidate><div><div class="eyebrow">Membership application</div><h1 style="font-size:30px">Join the DSN Talent Platform</h1><p class="muted" style="margin-top:6px">Use the DSN ID from your DSN programme records. Your contact details are only seen by the DSN team; recruiters never see them.</p></div>
   <h3>About you</h3><div class="fgrid">
    ${field("a-dsn","DSN ID",{req:true,ph:"e.g. DSN-2024-0187",hint:"As shown on your DSN programme records"})}
    ${field("a-name","Full name",{req:true})}
    ${field("a-email","Email",{type:"email",req:true,hint:"Only DSN sees this"})}
    ${field("a-phone","Phone number",{hint:"Only DSN sees this"})}
    ${field("a-gender","Gender",{opts:["Female","Male","Prefer not to say"]})}
    ${field("a-age","Age range",{opts:["18–24","25–34","35–44","45+"]})}
    ${field("a-state","State of residence",{req:true,ph:"e.g. Lagos"})}
    ${field("a-edu","Highest education",{opts:["Secondary school","OND / NCE","HND","Bachelor's degree","Master's degree","PhD"]})}
   </div>
   <h3>What you do now</h3><p class="small muted" style="margin-top:-8px">We use this to measure the impact of DSN programmes over time.</p><div class="fgrid">
    ${field("a-emp","Current employment status",{opts:EMP,req:true})}
    ${field("a-years","Years of relevant experience",{opts:["None yet","Less than 1 year","1–2 years","3–5 years","6–10 years","10+ years"],req:true})}
    ${field("a-title","Current job title",{ph:"Leave blank if not working"})}
    ${field("a-org","Current organisation",{ph:"Leave blank if not working"})}
    ${field("a-sector","Sector",{opts:["Fintech / Banking","Health","Education","Agriculture","Government / Public sector","Telecoms","Energy / Oil & gas","Retail / FMCG","NGO / Development","Tech / Startups","Other"]})}
    ${field("a-income","Monthly income range (optional)",{opts:["Prefer not to say","No income","Below ₦100k","₦100k–₦250k","₦250k–₦500k","₦500k–₦1m","Above ₦1m"],hint:"Used only in anonymous impact reports"})}
   </div>
   <h3>DSN programmes</h3><div class="checks">${(st.programmes||[]).map((p,i)=>`<label class="check"><input type="checkbox" name="a-prog" value="${esc(p)}"> ${esc(p)}</label>`).join("")}</div>
   <h3>Roles you want to be known for</h3><div class="fgrid">
    ${field("a-role","Main role",{opts:rolesList(),req:true})}
    ${field("a-role2","Second role (optional)",{opts:rolesList()})}
    ${field("a-impact","How has DSN training helped you so far?",{rows:3,full:true})}
    ${field("a-goals","What opportunity are you looking for?",{rows:2,full:true,ph:"e.g. a junior data analyst role in fintech"})}
   </div>
   <label class="check"><input type="checkbox" id="a-consent"> I agree that DSN may store my information, show my anonymised profile (DSN ID, roles, rating) publicly, share my full CV with subscribed recruiters, and use my answers in anonymous impact reports.</label>
   <div id="a-err" class="note warn" hidden></div>
   <div class="row"><button class="btn primary" type="submit">Submit application</button><span class="small muted">Already approved? <a href="#login" data-go="login" data-p='{"kind":"member"}'>Log in</a></span></div></form>
  <div class="stack"><div class="card stack"><h3>What happens next</h3><ol class="steps"><li><span>DSN checks your DSN ID and creates your profile.</span></li><li><span>You log in with your DSN ID and create a password.</span></li><li><span>You fill in your CV. Every profile starts at 5/20 per category.</span></li><li><span>Submit your profile for rating, and request verification for your roles.</span></li><li><span>Recruiters find you through DSN. You're never contacted directly.</span></li></ol></div></div></div>`;
};
async function submitApply(e){
  e.preventDefault();const v=id=>($("#"+id)?.value||"").trim();const err=$("#a-err");
  const dsn=cleanId(v("a-dsn"));const miss=[];
  if(!dsn)miss.push("DSN ID");if(!v("a-name"))miss.push("full name");if(!/^\S+@\S+\.\S+$/.test(v("a-email")))miss.push("a valid email");if(!v("a-state"))miss.push("state");if(!v("a-emp"))miss.push("employment status");if(!v("a-years"))miss.push("years of experience");if(!v("a-role"))miss.push("main role");
  if(!$("#a-consent").checked)miss.push("your consent");
  if(miss.length){err.hidden=false;err.textContent="Please add: "+miss.join(", ")+".";err.scrollIntoView({block:"center"});return}
  if(S.members[dsn]){err.hidden=false;err.textContent="A profile already exists for "+dsn+". Log in with your DSN ID instead.";return}
  if(S.applications[dsn]?.status==="pending"){err.hidden=false;err.textContent="We already have a pending application for "+dsn+". DSN will be in touch.";return}
  const app={dsnId:dsn,name:v("a-name"),email:v("a-email"),phone:v("a-phone"),gender:v("a-gender"),ageRange:v("a-age"),state:v("a-state"),education:v("a-edu"),employmentStatus:v("a-emp"),yearsExp:v("a-years"),currentTitle:v("a-title"),currentOrg:v("a-org"),sector:v("a-sector"),incomeBand:v("a-income"),programmes:[...document.querySelectorAll("input[name=a-prog]:checked")].map(i=>i.value),primaryRole:v("a-role"),otherRoles:v("a-role2")?[v("a-role2")]:[],dsnImpact:v("a-impact"),goals:v("a-goals"),consent:true,status:"pending",createdAt:now()};
  await put("applications",dsn,app);go("apply",{done:true,id:dsn,name:app.name.split(" ")[0]});
}

/* ---------- login ---------- */
VIEWS.login=(p)=>{
  const kind=p.kind||UI.tab.login||"member";const step=p.step||"id";
  const tabs=[["member","DSN member"],["recruiter","Recruiter"],["reviewer","Peer reviewer"]];
  const idLabel=kind==="member"?"DSN ID":kind==="recruiter"?"Recruiter ID or work email":"Reviewer ID";
  const idPh=kind==="member"?"e.g. DSN-2024-0187":kind==="recruiter"?"e.g. RC-1001":"e.g. RV-001";
  let inner="";
  if(step==="id")inner=`${field("l-id",idLabel,{req:true,ph:idPh,value:p.id||""})}<button class="btn primary" type="submit">Continue</button>`;
  else if(step==="pw")inner=`<div class="note">Logging in as <b class="mono">${esc(p.id)}</b> <button class="btn sm ghost" type="button" data-act="login-reset">Change</button></div>${field("l-pw","Password",{type:"password",req:true,attrs:'autocomplete="current-password"'})}<button class="btn primary" type="submit">Log in</button><button class="btn ghost sm" type="button" data-act="login-forgot" style="align-self:flex-start">Forgot password?</button>`;
  else if(step==="create"||step==="forgot")inner=`<div class="note ${step==="create"?"ok":""}">${step==="create"?`Welcome! Your profile <b class="mono">${esc(p.id)}</b> is ready. Create a password to finish setting up.`:`Reset the password for <b class="mono">${esc(p.id)}</b>.`}</div>${field("l-email","Email you registered with",{type:"email",req:true,hint:"We check this against DSN records"})}${field("l-pw1","New password",{type:"password",req:true,hint:"At least 8 characters",attrs:'autocomplete="new-password"'})}${field("l-pw2","Confirm password",{type:"password",req:true,attrs:'autocomplete="new-password"'})}<button class="btn primary" type="submit">${step==="create"?"Create password and log in":"Reset password and log in"}</button><button class="btn ghost sm" type="button" data-act="login-reset" style="align-self:flex-start">Start again</button>`;
  const demo=CONFIG.DEMO_MODE?`<aside class="card stack demo-panel" aria-labelledby="demo-h"><div><span class="badge pending">Test mode</span><h2 id="demo-h" style="margin-top:8px">Test access</h2><p class="small muted">Enter any view in one click. For testing only: this panel is switched off before go-live.</p></div>
   <div class="demo-grid">${CONFIG.DEMO_ACCOUNTS.map(d=>`<button class="demo-btn k-${d.kind}" data-act="demo-login" data-kind="${d.kind}" data-id="${esc(d.id)}"><b>${esc(d.label)}</b><span>${esc(d.note)}</span><code>${esc(d.kind==="admin"?"Admin":d.id)}</code></button>`).join("")}</div>
   <p class="tiny muted">To log in by hand, use the IDs above with the password <code>${esc(CONFIG.DEMO_PASSWORD)}</code>.</p></aside>`:"";
  return`<div class="${CONFIG.DEMO_MODE?"login-wrap":""}"><div style="max-width:460px;width:100%;margin:20px auto 0" class="stack"><div><div class="eyebrow">Log in</div><h1 style="font-size:30px">Welcome back</h1></div>
   <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" class="${k===kind?"on":""}" data-act="login-tab" data-kind="${k}">${l}</button>`).join("")}</div>
   <form class="card stack" id="login-form" data-kind="${kind}" data-step="${step}" data-id="${esc(p.id||"")}" novalidate>${inner}<div id="l-err" class="note warn" hidden></div></form>
   <p class="small muted">${kind==="member"?`Not on the platform yet? <a href="#apply" data-go="apply">Apply with your DSN ID</a>. Profiles are created by DSN after your application is approved.`:kind==="recruiter"?`New company? <a href="#rc-register" data-go="rc-register">Register for recruiter access</a>.`:"Reviewer accounts are created by the DSN team."}</p></div>${demo}</div>`;
};
async function submitLogin(e){
  e.preventDefault();const f=e.target;const kind=f.dataset.kind,step=f.dataset.step;const err=$("#l-err");const fail=t=>{err.hidden=false;err.textContent=t};
  const col=kind==="member"?"members":kind==="recruiter"?"recruiters":"reviewers";
  if(step==="id"){
    let raw=($("#l-id").value||"").trim();if(!raw)return fail("Enter your "+(kind==="member"?"DSN ID":"ID")+".");
    let id=cleanId(raw);
    if(kind==="recruiter"&&raw.includes("@")){const r=Object.values(S.recruiters).find(r=>(r.email||"").toLowerCase()===raw.toLowerCase());if(r)id=r.id}
    const acc=S[col][id];
    if(!acc){if(kind==="member"&&S.applications[id]?.status==="pending")return fail("Your application is still being reviewed. You can log in once DSN creates your profile.");return fail(kind==="member"?"No profile found for "+id+". Check the ID or apply first.":"No account found for that ID.")}
    if(kind==="recruiter"&&acc.status==="pending")return fail("Your company registration is awaiting DSN approval.");
    if(kind==="recruiter"&&acc.status==="rejected")return fail("This recruiter account isn't active. Contact DSN.");
    if(kind==="reviewer"&&acc.active===false)return fail("This reviewer account is inactive.");
    R.p={kind,id,step:acc.pwHash?"pw":"create"};render();return;
  }
  const id=f.dataset.id;const acc=S[col][id];if(!acc)return fail("Account not found.");
  if(step==="pw"){if(!(await checkPw(acc,$("#l-pw").value)))return fail("That password doesn't match. Try again or reset it.");setSession({kind,id});toast("Logged in");go(kind==="member"?"m-home":kind==="reviewer"?"r-queue":"directory");return}
  const email=($("#l-email").value||"").trim().toLowerCase(),p1=$("#l-pw1").value,p2=$("#l-pw2").value;
  if((acc.email||"").toLowerCase()!==email)return fail("That email doesn't match our records for "+id+". Contact DSN if it has changed.");
  if(p1.length<8)return fail("Use at least 8 characters.");if(p1!==p2)return fail("The two passwords don't match.");
  const h=await hashPw(p1);const upd={...clone(acc),...h,pwSetAt:now()};await put(col,id,upd);setSession({kind,id});toast(step==="create"?"Password created":"Password reset");go(kind==="member"?"m-home":kind==="reviewer"?"r-queue":"directory");
}

/* ---------- recruiter registration ---------- */
VIEWS["rc-register"]=(p)=>{
  if(p.done)return`<div class="card stack" style="max-width:600px;margin:0 auto"><span class="badge pending" style="align-self:flex-start">Awaiting approval</span><h2>Registration received</h2><p>Your recruiter ID is <b class="mono">${esc(p.id)}</b>. Keep it; you'll use it to log in once DSN approves your company.</p><button class="btn" data-go="home">Back home</button></div>`;
  return`<div class="split"><form class="card stack" id="rc-form" novalidate><div><div class="eyebrow">Recruiters & hiring partners</div><h1 style="font-size:30px">Register your company</h1><p class="muted" style="margin-top:6px">After DSN approves your company you can search the directory. A subscription unlocks names, full CVs and CV downloads.</p></div>
   <div class="fgrid">${field("c-company","Company name",{req:true})}${field("c-industry","Industry",{req:true,ph:"e.g. Fintech"})}${field("c-name","Your name",{req:true})}${field("c-email","Work email",{type:"email",req:true})}${field("c-phone","Phone")}${field("c-size","Company size",{opts:["1–10","11–50","51–200","201–1000","1000+"]})}${field("c-needs","What talent are you looking for?",{rows:3,full:true})}${field("c-pw1","Password",{type:"password",req:true,hint:"At least 8 characters"})}${field("c-pw2","Confirm password",{type:"password",req:true})}</div>
   <div id="c-err" class="note warn" hidden></div><button class="btn primary" type="submit" style="align-self:flex-start">Register</button></form>
   <div class="stack"><div class="card stack"><h3>What a subscription unlocks</h3>
   <table><tr><th></th><th>Free</th><th>Subscribed</th></tr>
   <tr><td>DSN ID, roles, rating</td><td>Yes</td><td>Yes</td></tr><tr><td>Rating breakdown</td><td>Yes</td><td>Yes</td></tr><tr><td>Member name</td><td>Hidden</td><td>Yes</td></tr><tr><td>Full CV & download</td><td>No</td><td>Yes</td></tr><tr><td>Request specific talent</td><td>No</td><td>Yes</td></tr><tr><td>General talent request</td><td>Yes</td><td>Yes</td></tr></table>
   <p class="small muted">Member emails and phone numbers are never shown. DSN handles introductions.</p></div></div></div>`;
};
async function submitRc(e){e.preventDefault();const v=id=>($("#"+id)?.value||"").trim();const err=$("#c-err");const fail=t=>{err.hidden=false;err.textContent=t};
  if(!v("c-company")||!v("c-industry")||!v("c-name"))return fail("Please fill in company, industry and your name.");if(!/^\S+@\S+\.\S+$/.test(v("c-email")))return fail("Enter a valid work email.");
  if(Object.values(S.recruiters).some(r=>(r.email||"").toLowerCase()===v("c-email").toLowerCase()))return fail("That email is already registered. Log in instead.");
  if(v("c-pw1").length<8)return fail("Use a password of at least 8 characters.");if(v("c-pw1")!==v("c-pw2"))return fail("The passwords don't match.");
  let n=1001;while(S.recruiters["RC-"+n])n++;const id="RC-"+n;const h=await hashPw(v("c-pw1"));
  await put("recruiters",id,{id,company:v("c-company"),industry:v("c-industry"),contactName:v("c-name"),email:v("c-email"),phone:v("c-phone"),size:v("c-size"),needs:v("c-needs"),status:"pending",subscribed:false,subscribedUntil:"",subRequested:false,createdAt:now(),...h});
  go("rc-register",{done:true,id});
}
