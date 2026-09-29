/* DSN Talent Platform: Peer reviewer screens: queue, role verification and rating workspaces, completed reviews, role manual, rubric. */
"use strict";
/* ---------- REVIEWER ---------- */
function reviewerCan(rv,req){return req.type==="role"?rv.canRole:rv.canRating}
VIEWS["r-queue"]=()=>{
  const rv=me();const tab=UI.tab.rq||(rv.canRole?"role":"rating");
  const list=Object.values(S.requests).filter(r=>r.type===tab&&(r.status==="submitted"||r.status==="interview")&&(!r.reviewerId||r.reviewerId===rv.id)).sort((a,b)=>String(a.createdAt).localeCompare(b.createdAt));
  const tabs=[rv.canRole&&["role","Role verification"],rv.canRating&&["rating","Rating reviews"]].filter(Boolean);
  return`<div class="section-h"><div><div class="eyebrow">Peer reviewer · ${esc(rv.id)}</div><h1 style="font-size:32px">Review queue</h1><p class="muted">${esc(rv.expertise||"")}. Members see you as Reviewer ${esc(rv.id)}, not by name.</p></div></div>
  <div class="tabs">${tabs.map(([k,l])=>`<button class="${k===tab?"on":""}" data-act="tab" data-tab="rq" data-val="${k}">${l} (${Object.values(S.requests).filter(r=>r.type===k&&(r.status==="submitted"||r.status==="interview")&&(!r.reviewerId||r.reviewerId===rv.id)).length})</button>`).join("")}</div>
  ${list.length?`<div class="tbl-wrap"><table><thead><tr><th>DSN ID</th><th>Member</th><th>${tab==="role"?"Roles to verify":"Current rating"}</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>${list.map(r=>{const m=S.members[r.memberId]||{};return`<tr><td class="mono">${esc(r.memberId)}</td><td>${esc(m.name||"—")}</td><td>${tab==="role"?reqRoles(r).map(x=>`<div class="small">${esc(x.role)} · ${esc(x.level)}</div>`).join(""):total(m)+"/100"}</td><td>${fmtD(r.createdAt)}</td><td>${statusBadge(r.status)}${r.reviewerId===rv.id?' <span class="badge grey">Mine</span>':""}</td><td><button class="btn sm primary" data-go="r-task" data-p='${esc(JSON.stringify({id:r.id}))}'>Open</button></td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty">No open ${tab==="role"?"role verifications":"rating reviews"}. New requests appear here.</div>`}`;
};
VIEWS["r-task"]=({id})=>{
  const rv=me();const r=S.requests[id];if(!r)return`<div class="empty">Request not found.</div>`;const m=S.members[r.memberId];if(!m)return`<div class="empty">Member not found.</div>`;
  if(!reviewerCan(rv,r))return`<div class="empty">You don't have permission for this type of review.</div>`;
  const done=r.status==="completed"||r.status==="rejected";
  const interviewBox=`<details class="card" ${r.status==="interview"?"open":""}><summary style="cursor:pointer;font-weight:700">Request an interview</summary><div class="stack" style="margin-top:12px">${r.interview?`<div class="note small">Interview set for ${fmtDT(r.interview.when)}${r.interview.link?` · <span class="mono">${esc(r.interview.link)}</span>`:""}</div>`:""}<div class="fgrid">${field("iv-when","Date and time",{type:"datetime-local",value:r.interview?.when||""})}${field("iv-link","Meeting link",{type:"url",value:r.interview?.link||"",ph:"https://meet.google.com/…"})}${field("iv-note","Message to member",{rows:2,full:true,value:r.interview?.note||"",ph:"What should they prepare?"})}</div><button class="btn blue" data-act="rv-interview" data-id="${esc(id)}" style="align-self:flex-start">${r.interview?"Update interview":"Send interview request"}</button></div></details>`;
  let form;
  if(r.type==="role"){
    const req=reqRoles(r);const reqNames=new Set(req.map(x=>x.role));const others=(m.roles||[]).filter(x=>!reqNames.has(x.role));
    const opts=(sel,list)=>list.map(o=>`<option ${o===sel?"selected":""}>${esc(o)}</option>`).join("");
    const allRoles=[...new Set([...rolesList(),...req.map(x=>x.role)])];
    form=`<div class="card stack"><div><div class="eyebrow">Decide each role</div><h3>${req.length} role${req.length>1?"s":""} requested</h3><p class="small muted">Set the final role and level using the role manual. Change either one if the evidence fits a different role or level.</p></div>
     ${req.map((x,i)=>{const cur=(m.roles||[]).find(y=>y.role===x.role);return`<div class="decision"><div class="row between"><div><b>${esc(x.role)}</b> <span class="small muted">· claimed ${esc(x.level)}${cur?.status==="verified"?" · currently verified "+esc(cur.level):""}</span></div><button class="btn sm ghost" data-act="rv-manual" data-role="${esc(x.role)}">Manual</button></div>
      <div class="fgrid"><label class="f" for="d-st-${i}">Decision<select id="d-st-${i}"><option value="verified">Verify</option><option value="rejected">Not verified</option></select></label><label class="f" for="d-role-${i}">Final role<select id="d-role-${i}" data-act="rv-manual-sel">${opts(x.role,allRoles)}</select></label><label class="f" for="d-lv-${i}">Final level<select id="d-lv-${i}">${opts(x.level,LEVELS)}</select></label></div>
      <input type="text" id="d-note-${i}" placeholder="Note to member (needed if you change or don't verify)" aria-label="Note for ${esc(x.role)}"></div>`}).join("")}
     ${others.length?`<details class="stack"><summary style="cursor:pointer;font-weight:700">Other roles on this profile (${others.length})</summary><div class="stack" style="gap:8px;margin-top:10px">${others.map((x,i)=>`<div class="decision"><b>${esc(x.role)}</b><div class="fgrid"><label class="f" for="o-st-${i}">Status<select id="o-st-${i}" data-role="${esc(x.role)}" class="o-st"><option value="keep">Keep as is (${x.status==="verified"?"verified "+esc(x.level):"claimed"})</option><option value="verified">Verify</option><option value="claimed">Set as claimed, not verified</option><option value="remove">Remove from profile</option></select></label><label class="f" for="o-lv-${i}">Level<select id="o-lv-${i}">${opts(x.level,LEVELS)}</select></label></div></div>`).join("")}</div></details>`:""}
     <div class="stack" style="gap:8px"><div class="row between"><b>Add a role the member didn't claim</b><button class="btn sm" data-act="rv-add-row">Add role</button></div><div id="rv-added" class="stack" style="gap:8px"></div></div>
     ${field("rv-note","Overall note to member",{rows:2})}
     <div class="row"><button class="btn primary" data-act="rv-submit-role" data-id="${esc(id)}">Save final roles</button></div></div>`;
    UI.manualRole=UI.manualRole&&UI.manualFor===id?UI.manualRole:req[0]?.role;UI.manualFor=id;
  }else{
    form=`<div class="card"><div class="eyebrow">Score each category out of 20</div>${CATS.map(c=>`<div class="scorein"><div><b>${esc(c.label)}</b><details><summary class="small muted" style="cursor:pointer">Rubric</summary><div class="rubric">${c.bands.map(([b,t])=>`<b>${b}</b><span>${esc(t)}</span>`).join("")}</div></details></div><input type="number" min="0" max="20" step="1" id="sc-${c.k}" value="${(m.scoreStatus==="reviewed"?(m.scores||{})[c.k]:"")??""}" aria-label="${esc(c.label)} score" data-act-input="score"></div>`).join("")}
     <div class="row between" style="margin-top:14px"><span class="muted">Total</span><span class="score-big"><b id="sc-total" style="font-size:34px">—</b><span>/ 100</span></span></div>
     ${field("rv-note","Review notes",{rows:3,hint:"Shown to the member with their result"})}
     <div class="row" style="margin-top:12px"><button class="btn primary" data-act="rv-submit-rating" data-id="${esc(id)}">Submit scores</button></div></div>`;
  }
  after(()=>{const upd=()=>{let t=0,ok=true;CATS.forEach(c=>{const v=$("#sc-"+c.k)?.value;if(v===""||v==null)ok=false;t+=+v||0});if($("#sc-total"))$("#sc-total").textContent=ok?t:"—"};document.querySelectorAll("[data-act-input=score]").forEach(i=>i.addEventListener("input",upd));upd()});
  return`<button class="btn sm ghost" data-go="r-queue" style="margin-bottom:12px">← Queue</button>
  <div class="section-h"><div><div class="eyebrow">${r.type==="role"?"Role verification":"Rating review"} · ${esc(r.id)}</div><h1 style="font-size:28px">${esc(m.name)} <span class="mono muted" style="font-size:16px">${esc(m.dsnId)}</span></h1><p class="muted">Check the documents the member emailed to ${esc(settings().verifyEmail)} against the CV below.</p></div>${statusBadge(r.status)}</div>
  <div class="split wide"><div class="stack"><div class="card">${scorePanel(m,{compact:true})}</div><div class="card"><h3 style="margin-bottom:8px">Roles on profile</h3>${rolesBlock(m)}</div><div class="card stack" style="gap:8px"><h3>Summary</h3><p>${esc(m.summary||"")}</p><div class="chips">${(m.skills||[]).map(s=>`<span class="chip">${esc(s)}</span>`).join("")}</div></div>${cvSections(m)}</div>
  <div class="stack">${done?`<div class="card"><h3>Completed</h3><p class="small muted">${esc((r.history||[]).slice(-1)[0]?.text||"")}</p>${r.type==="role"?`<p class="small" style="margin-top:6px">${esc(outcomeText(r))}</p>`:""}</div>`:form+interviewBox}
   ${r.type==="role"?`<div class="card" id="manual-panel">${manualPanel(UI.manualRole||reqRoles(r)[0]?.role)}</div>`:""}
   <div class="card"><h3 style="margin-bottom:8px">History</h3><div class="timeline">${(r.history||[]).map(h=>`<div class="tl"><div class="small"><b>${esc(h.by==="member"?"Member":h.by)}</b> · ${fmtDT(h.at)}<div class="muted">${esc(h.text)}</div></div></div>`).join("")}</div></div></div></div>`;
};
async function rvInterview(id){const r=clone(S.requests[id]);const when=$("#iv-when").value;if(!when){toast("Pick a date and time");return}r.interview={when,link:$("#iv-link").value.trim(),note:$("#iv-note").value.trim()};r.status="interview";r.reviewerId=SESSION.id;(r.history=r.history||[]).push({at:now(),by:SESSION.id,text:"Interview requested for "+fmtDT(when)+"."});await put("requests",id,r);toast("Interview request sent to member")}
function manualPanel(role){const mm=manualFor(role);return`<div class="eyebrow">Role manual</div><h3 style="margin:4px 0">${esc(role||"")}</h3>${mm.summary?`<p class="small muted" style="margin-bottom:10px">${esc(mm.summary)}</p>`:""}<div class="manual-lv">${LEVELS.map(l=>`<b>${l}</b><span>${esc(levelDesc(role,l))}</span>`).join("")}</div>`}
function addedRowHTML(n){return`<div class="decision" data-added="${n}"><div class="fgrid"><label class="f">Role<select class="a-role">${rolesList().map(o=>`<option>${esc(o)}</option>`).join("")}</select></label><label class="f">Level<select class="a-lv">${LEVELS.map(o=>`<option>${o}</option>`).join("")}</select></label><div style="align-self:end"><button class="btn sm danger" data-act="rv-del-row">Remove</button></div></div></div>`}
async function rvSubmitRole(id){
  const r=clone(S.requests[id]);const m=clone(S.members[r.memberId]);const req=reqRoles(r);const overall=$("#rv-note").value.trim();
  let roles=m.roles||[];const find=n=>roles.find(x=>x.role===n);const stamp={verifiedAt:now(),verifiedBy:SESSION.id};
  const decisions=[];
  for(let i=0;i<req.length;i++){const x=req[i];const st=$("#d-st-"+i).value,fr=$("#d-role-"+i).value,fl=$("#d-lv-"+i).value,note=$("#d-note-"+i).value.trim();
    const changed=fr!==x.role||fl!==x.level;if((st==="rejected"||changed)&&!note){toast("Add a note for "+x.role+" explaining your decision");$("#d-note-"+i).focus();return}
    decisions.push({role:x.role,claimedLevel:x.level,verified:st==="verified",finalRole:fr,finalLevel:fl,note});}
  const added=[...document.querySelectorAll("#rv-added [data-added]")].map(el=>({role:el.querySelector(".a-role").value,level:el.querySelector(".a-lv").value}));
  for(const d of decisions){const orig=find(d.role);
    if(d.verified){let t=find(d.finalRole);if(!t){t={role:d.finalRole};roles.push(t)}Object.assign(t,{level:d.finalLevel,status:"verified",note:d.note,...stamp});
      if(d.finalRole!==d.role&&orig&&orig.status!=="verified"){orig.status="rejected";orig.note="Reviewer verified "+d.finalRole+" instead."+(d.note?" "+d.note:"")}}
    else if(orig&&orig.status!=="verified"){orig.status="rejected";orig.note=d.note}
    else if(orig){orig.note=d.note}}
  document.querySelectorAll(".o-st").forEach((sel,i)=>{const n=sel.dataset.role,v=sel.value,lv=$("#o-lv-"+i).value;const t=find(n);if(!t||v==="keep")return;
    if(v==="remove")roles=roles.filter(x=>x.role!==n);else if(v==="verified")Object.assign(t,{level:lv,status:"verified",note:"",...stamp});else Object.assign(t,{level:lv,status:"claimed",verifiedAt:null,verifiedBy:null});});
  for(const a of added){let t=roles.find(x=>x.role===a.role);if(!t){t={role:a.role};roles.push(t)}Object.assign(t,{level:a.level,status:"verified",note:"Added by reviewer.",...stamp})}
  m.roles=roles;const anyV=decisions.some(d=>d.verified)||added.length;
  r.status=anyV?"completed":"rejected";r.completedAt=now();r.reviewerId=SESSION.id;r.outcome={decisions,added,note:overall};
  (r.history=r.history||[]).push({at:now(),by:SESSION.id,text:"Final roles: "+outcomeText(r)});
  await put("members",m.dsnId,m);await put("requests",id,r);toast("Final roles saved to the member's profile");go("r-queue");
}
async function rvSubmitRating(id){
  const r=clone(S.requests[id]);const m=clone(S.members[r.memberId]);const sc={};
  for(const c of CATS){const v=$("#sc-"+c.k).value;if(v===""||+v<0||+v>20||!Number.isInteger(+v)){toast(c.label+" needs a whole number from 0 to 20");return}sc[c.k]=+v}
  const t=Object.values(sc).reduce((a,b)=>a+b,0);
  m.scores=sc;m.scoreStatus="reviewed";m.reviewedAt=now();m.lastReviewer=SESSION.id;
  r.status="completed";r.scores=sc;r.completedAt=now();r.reviewerId=SESSION.id;r.outcome={action:"scored",note:$("#rv-note").value.trim(),total:t};(r.history=r.history||[]).push({at:now(),by:SESSION.id,text:"Scored "+t+"/100."});
  await put("members",m.dsnId,m);await put("requests",id,r);toast("Scores published: "+t+"/100");go("r-queue");
}
VIEWS["r-done"]=()=>{const list=Object.values(S.requests).filter(r=>r.reviewerId===SESSION.id&&(r.status==="completed"||r.status==="rejected")).sort((a,b)=>String(b.completedAt).localeCompare(a.completedAt));
  return`<div class="section-h"><h1 style="font-size:32px">Completed reviews</h1></div>${list.length?`<div class="tbl-wrap"><table><thead><tr><th>DSN ID</th><th>Type</th><th>Result</th><th>Completed</th><th></th></tr></thead><tbody>${list.map(r=>`<tr><td class="mono">${esc(r.memberId)}</td><td>${r.type==="role"?"Roles":"Rating"}</td><td class="small">${esc(outcomeText(r))}</td><td>${fmtD(r.completedAt)}</td><td><button class="btn sm" data-go="r-task" data-p='${esc(JSON.stringify({id:r.id}))}'>View</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">You haven't completed any reviews yet.</div>`}`};
VIEWS["r-rubric"]=()=>`<div class="section-h"><div><h1 style="font-size:32px">Rating rubric</h1><p class="muted">Five categories × 20 points = DSN Rating out of 100. New profiles start at 5 per category.</p></div></div>${rubricHTML()}`;
function rubricHTML(){return`<div class="grid2">${CATS.map(c=>`<div class="card"><h3>${esc(c.label)} <span class="muted small">/20</span></h3><div class="rubric">${c.bands.map(([b,t])=>`<b>${b}</b><span>${esc(t)}</span>`).join("")}</div></div>`).join("")}<div class="card"><h3>Role levels</h3><div class="rubric"><b>Junior</b><span>Delivers defined tasks with guidance.</span><b>Mid</b><span>Delivers standard work independently.</span><b>Senior</b><span>Owns complex work and guides others.</span><b>Lead</b><span>Sets direction, leads teams, recognised expertise.</span></div></div></div>`}

VIEWS.roles=()=>{const man=roleManual();const list=[...new Set([...rolesList(),...Object.keys(man)])];const usingDefault=!(settings().roleManual&&Object.keys(settings().roleManual).length);
  return`<div class="section-h"><div><div class="eyebrow">Role manual</div><h1 style="font-size:32px">Roles and levels</h1><p class="muted">Reviewers verify each role against these descriptions.</p></div></div>
  ${usingDefault?`<div class="note warn small" style="margin-bottom:14px">These are starter descriptions. DSN replaces them with the official role manual.</div>`:""}
  <div class="card" style="margin-bottom:16px"><h3 style="margin-bottom:8px">Levels in general</h3><div class="manual-lv">${LEVELS.map(l=>`<b>${l}</b><span>${esc(GENERIC_LEVELS[l])}</span>`).join("")}</div></div>
  <div class="grid2">${list.map(r=>`<div class="card">${manualPanel(r).replace('<div class="eyebrow">Role manual</div>','')}</div>`).join("")}</div>`};
VIEWS["a-roles"]=()=>{const man=roleManual();const list=[...new Set([...rolesList(),...Object.keys(man)])];const cur=UI.tab.arole&&list.includes(UI.tab.arole)?UI.tab.arole:list[0];const mm=manualFor(cur);
  return`<div class="section-h"><div><h1 style="font-size:32px">Role manual</h1><p class="muted">Reviewers and members see these descriptions. Add or rename roles in Settings.</p></div><button class="btn" data-go="roles">Preview</button></div>
  <div class="split"><form class="card stack" id="role-form" data-role="${esc(cur)}"><label class="f" for="ar-pick">Role<select id="ar-pick" data-act="arole-pick">${list.map(r=>`<option ${r===cur?"selected":""}>${esc(r)}</option>`).join("")}</select></label>
   ${field("rm-sum","What this role does",{rows:2,value:mm.summary||""})}
   ${LEVELS.map((l,i)=>field("rm-l"+i,l,{rows:2,value:(mm.levels||{})[l]||"",ph:GENERIC_LEVELS[l]})).join("")}
   <div class="row"><button class="btn primary" type="submit">Save ${esc(cur)}</button></div></form>
   <div class="card stack"><h3>Using your own manual</h3><p class="small muted">Paste DSN's official description for each role and level here. Empty level boxes fall back to the general level description.</p></div></div>`};
