/* DSN Talent Platform: Shared UI pieces: role blocks, badges, score panel, talent card, modal, form fields. */
"use strict";
/* ---------- shared components ---------- */
function roleBadge(r,{short=false}={}){
  if(!r)return`<span class="badge grey">No role yet</span>`;
  if(r.status==="verified")return`<span class="badge verified">${ICON.check}${esc(r.role)} · ${esc(r.level)}</span>`;
  if(r.status==="pending")return`<span class="badge pending">${esc(r.role)}${short?"":" · verification in progress"}</span>`;
  return`<span class="badge claimed">${esc(r.role)} · claimed</span>`;
}
function statusBadge(st){const m={submitted:["pending","Awaiting reviewer"],interview:["blue","Interview requested"],completed:["verified","Completed"],rejected:["rejected","Not verified"],pending:["pending","Pending"],approved:["verified","Approved"],new:["pending","New"],shortlisting:["blue","Shortlisting"],shared:["blue","Profiles shared"],interviewing:["blue","Interviewing"],placed:["verified","Placed"],closed:["grey","Closed"]};const[c,l]=m[st]||["grey",st];return`<span class="badge ${c}">${esc(l)}</span>`}
function scoreStatusText(m){if(m.scoreStatus==="reviewed")return`Reviewed by DSN on ${fmtD(m.reviewedAt)}.`;if(m.scoreStatus==="pending")return"Review in progress. Showing starting scores.";return"Starting scores (5 per category) until the profile is reviewed."}
function scorePanel(m,{compact=false}={}){
  const t=total(m);const def=m.scoreStatus!=="reviewed";
  return`<div class="stack" style="gap:14px"><div class="row between"><div><div class="eyebrow">DSN Rating</div><div class="score-big"><b>${t}</b><span>/ 100</span></div></div>${def?`<span class="badge ${m.scoreStatus==="pending"?"pending":"grey"}">${m.scoreStatus==="pending"?"Review in progress":"Not yet reviewed"}</span>`:`<span class="badge verified">${ICON.check}Reviewed</span>`}</div>
  <div class="bars">${CATS.map(c=>{const v=+(m.scores||{})[c.k]||0;return`<div class="bar-row"><span class="lbl">${esc(c.label)}</span><span class="val">${v}/20</span><div class="bar ${def?"default":""}" role="img" aria-label="${esc(c.label)} ${v} out of 20"><i style="width:${v*5}%"></i></div></div>`}).join("")}</div>
  ${compact?"":`<p class="small muted">${scoreStatusText(m)} Each category is scored out of 20 against a published rubric.</p>`}</div>`;
}
function ring(m){const t=total(m);return`<div class="ring ${m.scoreStatus!=="reviewed"?"default":""}" style="--p:${t}" aria-label="Rating ${t} out of 100"><span>${t}</span></div>`}
function miniBars(m){return`<div class="mini" aria-hidden="true">${CATS.map(c=>`<i title="${esc(c.short)} ${(m.scores||{})[c.k]||0}/20"><b style="width:${((m.scores||{})[c.k]||0)*5}%"></b></i>`).join("")}</div>`}
function displayName(m){return canSeeFull(m.dsnId)?m.name:mask(m.name)}
function talentCard(m){
  const tr=topRole(m);const full=canSeeFull(m.dsnId);
  return`<button class="tcard" data-go="talent" data-p='${esc(JSON.stringify({id:m.dsnId}))}'>
   <div class="idl"><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="av ${full?"":"masked"}">${full?esc(initials(m.name)):"•"}</span><div><div class="nm">${esc(displayName(m))}</div><div class="mono small muted">${esc(m.dsnId)}</div></div></div>${ring(m)}</div>
   <div class="hd">${esc(m.headline||"")}</div>
   <div class="roles">${(()=>{const v=verifiedRoles(m).sort((a,b)=>levelRank(b.level)-levelRank(a.level));const c=(m.roles||[]).filter(r=>r.status!=="verified");const shown=[...v.slice(0,2).map(r=>roleBadge(r)),...(v.length?[]:c.slice(0,1).map(r=>roleBadge({...r,status:"claimed"})))];const more=v.length>2?v.length-2:0;const mc=v.length?c.length:Math.max(0,c.length-1);return shown.join("")+(more?`<span class="small muted">+${more} verified</span>`:"")+(mc?`<span class="small muted">+${mc} claimed</span>`:"")||roleBadge(null)})()}</div>
   ${miniBars(m)}
  </button>`;
}
function modal(html,{wide=false}={}){const root=$("#modal-root");root.innerHTML=`<div class="scrim" data-act="close-modal-bg"><div class="modal ${wide?"wide":""}" role="dialog" aria-modal="true">${html}</div></div>`;const f=root.querySelector("input,select,textarea,button:not([data-act=close-modal])");if(f)setTimeout(()=>f.focus(),30)}
function closeModal(){$("#modal-root").innerHTML=""}
function field(id,label,{type="text",value="",hint="",req=false,opts=null,ph="",full=false,rows=0,attrs=""}={}){
  let ctl;
  if(opts)ctl=`<select id="${id}" name="${id}" ${req?"required":""} ${attrs}><option value="">Select…</option>${opts.map(o=>`<option ${o===value?"selected":""}>${esc(o)}</option>`).join("")}</select>`;
  else if(rows)ctl=`<textarea id="${id}" name="${id}" rows="${rows}" placeholder="${esc(ph)}" ${req?"required":""} ${attrs}>${esc(value)}</textarea>`;
  else ctl=`<input id="${id}" name="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(ph)}" ${req?"required":""} ${attrs}>`;
  return`<label class="f ${full?"full":""}" for="${id}"><span>${esc(label)}${req?' <span style="color:var(--red)">*</span>':""}</span>${hint?`<span class="hint">${esc(hint)}</span>`:""}${ctl}</label>`;
}
function copyRow(text){return`<div class="copyrow"><code>${esc(text)}</code><button class="btn sm" data-act="copy" data-text="${esc(text)}">Copy</button></div>`}
