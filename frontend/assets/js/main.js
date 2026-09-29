/* DSN Talent Platform: Event handling and app start-up. */
"use strict";
/* ---------- events ---------- */
document.addEventListener("click",async e=>{
  const g=e.target.closest("[data-go]");
  if(g){e.preventDefault();let p={};try{p=g.dataset.p?JSON.parse(g.dataset.p):{}}catch(x){}closeModal();go(g.dataset.go,p);return}
  const a=e.target.closest("[data-act]");if(!a)return;const act=a.dataset.act,id=a.dataset.id;
  if(a.tagName==="SELECT"||(a.tagName==="INPUT"&&a.type!=="button"))return;
  switch(act){
   case"close-modal":closeModal();break;
   case"close-modal-bg":if(e.target===a)closeModal();break;
   case"logout":setSession(null);DRAFT=null;go("home");toast("Logged out");break;
   case"demo-login":{if(!CONFIG.DEMO_MODE)break;const k=a.dataset.kind,i=a.dataset.id;if(k!=="admin"&&!acctOf({kind:k,id:i})){toast("That test account isn't in the data. Load sample data from Admin → Settings.");break}setSession({kind:k,id:i});DRAFT=null;toast("Signed in for testing");go(k==="member"?"m-home":k==="reviewer"?"r-queue":k==="admin"?"a-home":"directory");break}
   case"enter-admin":setSession({kind:"admin",id:"admin"});go("a-home");break;
   case"back":history.length>1&&R.name!=="home"?go(SESSION?.kind==="member"?"m-home":SESSION?.kind==="reviewer"?"r-queue":SESSION?.kind==="admin"?"a-members":"directory"):go("home");break;
   case"copy":{const t=a.dataset.text;try{await navigator.clipboard.writeText(t);toast("Copied")}catch(x){const c=a.previousElementSibling;const rg=document.createRange();rg.selectNodeContents(c);const s=getSelection();s.removeAllRanges();s.addRange(rg);toast("Selected. Press Ctrl+C to copy")}break}
   case"show-rubric":modal(`<div class="stack"><div class="row between"><h2>DSN Rating rubric</h2><button class="btn sm ghost" data-act="close-modal">Close</button></div><p class="small muted">Five categories × 20 points. New profiles start at 5 per category until reviewed.</p>${rubricHTML()}</div>`,{wide:true});break;
   case"tab":UI.tab[a.dataset.tab]=a.dataset.val;render();break;
   case"login-tab":UI.tab.login=a.dataset.kind;R.p={kind:a.dataset.kind};render();break;
   case"login-reset":R.p={kind:R.p.kind};render();break;
   case"login-forgot":R.p={...R.p,step:"forgot"};render();break;
   case"download-cv":downloadCV(id);break;
   case"request-talent":if(!isRecruiter()){go("login",{kind:"recruiter"});break}if(id&&!isSubscribed()){go("rc-plan");break}talentRequestModal(id);break;
   case"req-rating":processModal("rating");break;
   case"req-role":processModal("role",a.dataset.role);break;
   case"confirm-process":confirmProcess(a.dataset.kind);break;
   case"rv-manual":{UI.manualRole=a.dataset.role;const p=$("#manual-panel");if(p){p.innerHTML=manualPanel(a.dataset.role);p.scrollIntoView({block:"nearest",behavior:"smooth"})}break}
   case"rv-add-row":{const c=$("#rv-added");c.insertAdjacentHTML("beforeend",addedRowHTML(c.children.length));break}
   case"rv-del-row":a.closest("[data-added]").remove();break;
   case"add-role":addRoleModal();break;
   case"update-status":statusModal();break;
   case"cv-add":DRAFT[a.dataset.sec]=[...(DRAFT[a.dataset.sec]||[]),clone(SECTIONS[a.dataset.sec].blank)];render();break;
   case"cv-del":DRAFT[a.dataset.sec].splice(+a.dataset.i,1);render();break;
   case"cv-move":{const arr=DRAFT[a.dataset.sec],i=+a.dataset.i,j=i+ +a.dataset.dir;[arr[i],arr[j]]=[arr[j],arr[i]];render();break}
   case"cv-discard":DRAFT=null;render();toast("Changes discarded");break;
   case"cv-save":{const cur=me();const d=clone(DRAFT);const keep=["roles","scores","scoreStatus","reviewedAt","premium","pwHash","salt","impact","employmentStatus","currentTitle","currentOrg","visible","openToWork","email","phone","name","dsnId","createdAt"];keep.forEach(k=>d[k]=cur[k]);d.updatedAt=now();await put("members",cur.dsnId,d);DRAFT=null;toast("CV saved");go("m-home");break}
   case"rv-interview":rvInterview(id);break;
   case"rv-submit-role":rvSubmitRole(id);break;
   case"rv-submit-rating":rvSubmitRating(id);break;
   case"req-sub":{const r=clone(me());r.subRequested=true;r.subRequestedAt=now();await put("recruiters",r.id,r);toast("Request sent to DSN");break}
   case"load-sample":await loadSample();break;
   case"view-app":appModal(id);break;
   case"approve-app":approveApp(id);break;
   case"reject-app":rejectApp(id);break;
   case"new-member":newMemberModal();break;
   case"admin-member":adminMemberModal(id);break;
   case"save-override":{const m=clone(S.members[id]);CATS.forEach(c=>{m.scores[c.k]=Math.max(0,Math.min(20,Math.round(+$("#ov-"+c.k).value||0)))});m.scoreStatus=$("#ov-status").value||m.scoreStatus;if(m.scoreStatus==="reviewed"&&!m.reviewedAt)m.reviewedAt=now();(m.adminLog=m.adminLog||[]).push({at:now(),text:"Scores overridden to "+total(m)});await put("members",id,m);closeModal();toast("Scores updated");break}
   case"reset-pw":{const col=a.dataset.kind;const o=clone(S[col][id]);o.pwHash="";o.salt="";await put(col,id,o);toast("Password cleared. They'll create a new one at next log in.");break}
   case"toggle-hide":{const m=clone(S.members[id]);m.visible=m.visible===false;await put("members",id,m);closeModal();toast(m.visible?"Shown in directory":"Hidden from directory");break}
   case"new-reviewer":newReviewerModal();break;
   case"rv-active":{const r=clone(S.reviewers[id]);r.active=r.active===false;await put("reviewers",id,r);break}
   case"rc-approve":case"rc-reject":{const r=clone(S.recruiters[id]);r.status=act==="rc-approve"?"approved":"rejected";await put("recruiters",id,r);toast("Recruiter "+r.status);break}
   case"rc-sub":subModal(id);break;
   case"sub-save":{const r=clone(S.recruiters[id]);r.subscribed=true;r.subRequested=false;r.subscribedUntil=$("#sub-until").value;await put("recruiters",id,r);closeModal();toast("Subscription active");break}
   case"sub-end":{const r=clone(S.recruiters[id]);r.subscribed=false;await put("recruiters",id,r);closeModal();toast("Subscription ended");break}
   case"tr-save":{const t=clone(S.talentRequests[id]);t.shortlist=$("#tr-sl-"+id).value.split(",").map(cleanId).filter(Boolean);const bad=t.shortlist.filter(x=>!S.members[x]);if(bad.length){toast("Unknown DSN ID: "+bad.join(", "));return}t.adminNote=$("#tr-note-"+id).value.trim();if(t.status==="new"&&t.shortlist.length)t.status="shared";await put("talentRequests",id,t);toast("Saved. The partner can see this now.");break}
   case"tr-suggest":{const t=S.talentRequests[id];const ms=Object.values(S.members).filter(m=>m.visible!==false&&m.openToWork!==false).map(m=>({m,v:(m.roles||[]).some(r=>r.role===t.roleNeeded&&r.status==="verified"),c:(m.roles||[]).some(r=>r.role===t.roleNeeded)})).filter(x=>x.c).sort((a,b)=>(b.v-a.v)||total(b.m)-total(a.m)).slice(0,6);$("#sugg-"+id).innerHTML=ms.length?`<div class="small muted" style="margin-bottom:6px">Members with this role, verified first:</div><div class="chips">${ms.map(x=>`<span class="chip"><span class="mono">${esc(x.m.dsnId)}</span> ${esc(x.m.name)} · ${total(x.m)} ${x.v?"✓":"(claimed)"}</span>`).join("")}</div>`:`<p class="small muted">No members list this role yet.</p>`;break}
   case"export-csv":exportCSV();break;
  }
});
document.addEventListener("change",async e=>{
  const a=e.target.closest("[data-act]");if(!a)return;const act=a.dataset.act,id=a.dataset.id;
  if(act==="toggle-vis"||act==="toggle-otw"){const m=clone(me());if(act==="toggle-vis")m.visible=a.checked;else m.openToWork=a.checked;await put("members",m.dsnId,m);toast("Saved")}
  if(act==="toggle-premium"){const m=clone(S.members[id]);m.premium=a.checked;await put("members",id,m);toast(m.premium?"Premium on":"Premium off")}
  if(act==="rv-perm"){const r=clone(S.reviewers[id]);r[a.dataset.f]=a.checked;await put("reviewers",id,r)}
  if(act==="assign"){const r=clone(S.requests[id]);r.reviewerId=a.value;(r.history=r.history||[]).push({at:now(),by:"admin",text:a.value?"Assigned to "+a.value+".":"Unassigned."});await put("requests",id,r);toast("Assigned")}
  if(act==="rv-manual-sel"){UI.manualRole=a.value;const p=$("#manual-panel");if(p)p.innerHTML=manualPanel(a.value)}
  if(act==="arole-pick"){UI.tab.arole=a.value;render()}
  if(a.id==="ar-role"||e.target.id==="ar-role"){}
  if(act==="tr-status"){const t=clone(S.talentRequests[id]);t.status=a.value;await put("talentRequests",id,t);toast("Status updated")}
  if(e.target.name==="rv-dec"){}
});
document.addEventListener("change",e=>{if(e.target.id==="ar-role"){const d=$("#ar-desc");const r=e.target.value;if(d)d.innerHTML=r?`<b>${esc(r)}</b>: ${esc(manualFor(r).summary||"")}<div class="manual-lv" style="margin-top:8px">${LEVELS.map(l=>`<b>${l}</b><span>${esc(levelDesc(r,l))}</span>`).join("")}</div>`:"Pick a role to see what DSN expects at each level."}});
document.addEventListener("input",e=>{if(e.target.id==="mq"){UI.tab.mq=e.target.value;clearTimeout(window.__mq);window.__mq=setTimeout(()=>{render();const i=$("#mq");if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},300)}});
document.addEventListener("submit",async e=>{
  const f=e.target;e.preventDefault();
  if(f.id==="apply-form")return submitApply(e);
  if(f.id==="login-form")return submitLogin(e);
  if(f.id==="rc-form")return submitRc(e);
  if(f.id==="tr-form")return submitTR(e);
  if(f.id==="addrole-form"){const role=$("#ar-role").value,level=$("#ar-level").value;if(!role||!level){toast("Choose a role and level");return}const m=clone(me());if((m.roles||[]).some(r=>r.role===role)){toast("That role is already on your profile");return}(m.roles=m.roles||[]).push({role,level,status:"claimed",note:""});await put("members",m.dsnId,m);closeModal();toast("Role added");return}
  if(f.id==="status-form"){const m=clone(me());const st=$("#us-emp").value;if(!st){toast("Choose a status");return}m.employmentStatus=st;m.currentTitle=$("#us-title").value.trim();m.currentOrg=$("#us-org").value.trim();(m.impact=m.impact||[]).push({date:now(),status:st,title:m.currentTitle,org:m.currentOrg,source:"Member update"});await put("members",m.dsnId,m);closeModal();toast("Status updated");return}
  if(f.id==="nm-form"){const v=i=>($("#"+i).value||"").trim();const id=cleanId(v("nm-id"));const err=$("#nm-err");if(!id||!v("nm-name")||!/^\S+@\S+\.\S+$/.test(v("nm-email"))||!v("nm-emp")||!v("nm-role")){err.hidden=false;err.textContent="Fill in every required field.";return}if(S.members[id]){err.hidden=false;err.textContent="A profile with that DSN ID already exists.";return}
    await put("applications",id,{dsnId:id,name:v("nm-name"),email:v("nm-email"),state:v("nm-state"),employmentStatus:v("nm-emp"),primaryRole:v("nm-role"),otherRoles:[],programmes:[],status:"pending",createdAt:now(),source:"Admin"});await approveApp(id);return}
  if(f.id==="nr-form"){const name=$("#nr-name").value.trim(),email=$("#nr-email").value.trim();const err=$("#nr-err");if(!name||!/^\S+@\S+\.\S+$/.test(email)){err.hidden=false;err.textContent="Add a name and valid email.";return}let n=1;while(S.reviewers["RV-"+String(n).padStart(3,"0")])n++;const id="RV-"+String(n).padStart(3,"0");await put("reviewers",id,{id,name,email,expertise:$("#nr-exp").value.trim(),canRole:$("#nr-role").checked,canRating:$("#nr-rate").checked,active:true,createdAt:now(),salt:"",pwHash:""});closeModal();toast("Reviewer "+id+" created. They log in with this ID and set a password.");return}
  if(f.id==="role-form"){const role=f.dataset.role;const man=clone(roleManual());man[role]={summary:$("#rm-sum").value.trim(),levels:Object.fromEntries(LEVELS.map((l,i)=>[l,$("#rm-l"+i).value.trim()]).filter(([,v])=>v))};const st={...clone(settings()),roleManual:man,updatedAt:now()};await put("settings","main",st);toast("Saved "+role);return}
  if(f.id==="set-form"){const lines=i=>$("#"+i).value.split("\n").map(s=>s.trim()).filter(Boolean);const st={...clone(settings()),verifyEmail:$("#st-email").value.trim(),roleDocs:lines("st-roledocs"),ratingDocs:lines("st-ratedocs"),processNote:$("#st-note").value.trim(),premiumNote:$("#st-prem").value.trim(),roles:lines("st-roles"),programmes:lines("st-progs"),updatedAt:now()};await put("settings","main",st);toast("Settings saved");return}
});
function wire(){if(R.name==="directory")bindDir();if(R.name==="m-edit")bindCV()}
const _render=render;render=function(){_render();wire()};
(async()=>{render();await initStore();const h=(location.hash||"").slice(1);if(h&&VIEWS[h]&&!/^(talent|cv|r-task)$/.test(h))R={name:h,p:{}};else if(SESSION)R={name:SESSION.kind==="member"?"m-home":SESSION.kind==="reviewer"?"r-queue":SESSION.kind==="admin"?"a-home":"directory",p:{}};render()})();
