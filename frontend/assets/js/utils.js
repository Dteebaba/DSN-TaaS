/* DSN Talent Platform: Small helpers: DOM, escaping, dates, IDs, masking, scores, password hashing, icons. */
"use strict";
/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=o=>JSON.parse(JSON.stringify(o??null));
const now=()=>new Date().toISOString();
const fmtD=iso=>{if(!iso)return"—";const d=new Date(iso);return isNaN(d)?esc(iso):d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})};
const fmtDT=iso=>{if(!iso)return"—";const d=new Date(iso);return isNaN(d)?esc(iso):d.toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})};
const fmtYM=ym=>{if(!ym)return"";const[y,m]=ym.split("-");if(!m)return y;return new Date(+y,+m-1,1).toLocaleDateString("en-GB",{month:"short",year:"numeric"})};
const cleanId=s=>String(s||"").trim().toUpperCase().replace(/\s+/g,"-").replace(/[^A-Z0-9_\-.:@+~]/g,"");
const rid=p=>p+"-"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();
function lsGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}
function mask(name){return String(name||"").split(/\s+/).filter(Boolean).map(w=>w[0].toUpperCase()+"*".repeat(Math.max(3,w.length-1))).join(" ")}
function initials(name){return String(name||"?").split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join("")}
function total(m){const s=m?.scores||{};return CATS.reduce((a,c)=>a+(+s[c.k]||0),0)}
function verifiedRoles(m){return(m.roles||[]).filter(r=>r.status==="verified")}
function levelRank(l){return LEVELS.indexOf(l)}
const reqRoles=r=>(r&&r.roles&&r.roles.length)?r.roles:(r&&r.role?[{role:r.role,level:r.level}]:[]);
const reqRolesText=r=>reqRoles(r).map(x=>x.role+" ("+x.level+")").join(", ");
function outcomeText(r){if(r.type==="rating")return(r.outcome?.total??"")+"/100";const d=r.outcome?.decisions;if(d)return d.map(x=>x.verified?`${x.finalRole} · ${x.finalLevel} ✓`:`${x.role} ✗`).join("; ")+((r.outcome.added||[]).length?"; added "+r.outcome.added.map(a=>a.role+" · "+a.level).join(", "):"");if(r.status==="rejected")return"Not verified";return(r.outcome?.role||"")+" · "+(r.outcome?.level||"")}
function roleManual(){const m=settings().roleManual;return m&&Object.keys(m).length?m:DEFAULT_MANUAL}
function manualFor(role){return roleManual()[role]||{summary:"",levels:{}}}
function levelDesc(role,level){return(manualFor(role).levels||{})[level]||GENERIC_LEVELS[level]||""}
function openRoleReq(memberId,role){return Object.values(S.requests).find(q=>q.memberId===memberId&&q.type==="role"&&(q.status==="submitted"||q.status==="interview")&&reqRoles(q).some(x=>x.role===role))}
function rolesBlock(m,{dates=true,empty="No roles yet."}={}){
  const vr=verifiedRoles(m).sort((a,b)=>levelRank(b.level)-levelRank(a.level));const cr=(m.roles||[]).filter(r=>r.status!=="verified");
  if(!vr.length&&!cr.length)return`<p class="muted">${empty}</p>`;
  return`<div class="rgroup">${vr.length?`<div class="rgroup-h v">${ICON.check} DSN verified</div>${vr.map(r=>`<div class="vrole"><span class="rn">${ICON.check}${esc(r.role)}</span><span class="row" style="gap:8px"><span class="lv">${esc(r.level)}</span>${dates?`<span class="dt">${fmtD(r.verifiedAt)}</span>`:""}</span></div>`).join("")}`:""}
  ${cr.length?`<div class="rgroup-h c">Claimed · not verified</div>${cr.map(r=>`<div class="crole ${r.status==="pending"?"pend":r.status==="rejected"?"rej":""}"><span class="rn">${esc(r.role)}</span><span class="lv">${r.status==="pending"?"Verification in progress":r.status==="rejected"?"Not verified by reviewer":"Self-declared"} · ${esc(r.level||"")}</span></div>`).join("")}`:""}</div>`;
}
function topRole(m){const v=verifiedRoles(m).sort((a,b)=>levelRank(b.level)-levelRank(a.level));if(v.length)return v[0];return(m.roles||[])[0]||null}
function completeness(m){let p=0;if(m.headline)p+=10;if((m.summary||"").length>40)p+=15;if((m.skills||[]).length>=3)p+=10;if((m.experience||[]).length)p+=20;if((m.projects||[]).length)p+=20;if((m.education||[]).length)p+=15;if((m.certifications||[]).length)p+=10;return p}
const settings=()=>S.settings.main||{};
const rolesList=()=>settings().roles||[];
function toast(msg){const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
async function sha(s){try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){let h=0;for(const ch of s){h=(h*31+ch.charCodeAt(0))|0}return"x"+h}}
async function hashPw(pw){const salt=Math.random().toString(36).slice(2,10);return{salt,pwHash:await sha(salt+":"+pw)}}
async function checkPw(acc,pw){return acc&&acc.pwHash&&(await sha(acc.salt+":"+pw))===acc.pwHash}
const ICON={
 check:'<svg class="tick" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor"/><path d="M4.5 8.2l2.3 2.2 4.7-4.8" stroke="var(--surface)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 lock:'<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
 dot:'<svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg>'
};
