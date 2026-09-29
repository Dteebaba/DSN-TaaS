/* DSN Talent Platform: Routing, header, footer and the render loop. */
"use strict";
/* ---------- routing / render ---------- */
function go(name,p={}){R={name,p};if(document.activeElement)document.activeElement.blur();render();window.scrollTo(0,0);const token=name.replace(/[^a-z0-9-]/gi,"");try{history.replaceState(null,"","#"+token)}catch(e){}}
let rq=false;
function scheduleRender(){if(rq)return;rq=true;requestAnimationFrame(()=>{rq=false;const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)&&$("#app").contains(a)){UI.pendingRender=true;return}render()})}
document.addEventListener("focusout",()=>{if(UI.pendingRender){setTimeout(()=>{const a=document.activeElement;if(!(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))){UI.pendingRender=false;render()}},150)}});

function navItems(){
  const k=SESSION?.kind;
  if(k==="member")return[["m-home","Dashboard"],["m-edit","Edit my CV"],["cv","My CV",{id:SESSION.id}],["directory","Talent directory"]];
  if(k==="reviewer")return[["r-queue","Review queue"],["r-done","Completed"],["roles","Role manual"],["r-rubric","Rating rubric"]];
  if(k==="recruiter")return[["directory","Find talent"],["rc-requests","Talent requests"],["rc-plan","Subscription"]];
  if(k==="admin")return[["a-home","Overview"],["a-apps","Applications"],["a-members","Members"],["a-verify","Verifications"],["a-reviewers","Reviewers"],["a-recruiters","Recruiters"],["a-talent","Partner requests"],["a-impact","Impact"],["a-roles","Role manual"],["a-settings","Settings"]];
  return[["home","Home"],["directory","Find talent"],["apply","Join"],["rc-register","Partners"]];
}
function header(){
  const u=me();const k=SESSION?.kind;
  const label=k==="member"?u.name:k==="recruiter"?u.company:k==="reviewer"?"Reviewer "+u.id:k==="admin"?"DSN Admin":"";
  const nav=navItems().map(([n,l,p])=>`<button class="${R.name===n||(n==="cv"&&R.name==="cv"&&R.p.id===SESSION?.id)?"on":""}" data-go="${n}" ${p?`data-p='${esc(JSON.stringify(p))}'`:""}>${esc(l)}</button>`).join("");
  const right=SESSION?`<span class="chip-user"><span class="av">${esc(k==="admin"?"A":initials(label))}</span>${esc(label)}</span><button class="btn sm" data-act="logout">Log out</button>`
    :`<button class="btn sm" data-go="login">Log in</button><button class="btn sm primary" data-go="apply">Apply</button>`;
  const adminLink=(CAN_ADMIN||CONFIG.DEMO_MODE)&&k!=="admin"?`<button class="btn sm ghost" data-act="enter-admin">Admin</button>`:"";
  const modeLine=k&&k!=="admin"?`<div class="modebar"><div class="wrap"><b>${k==="member"?"Member":k==="recruiter"?"Recruiter":"Peer reviewer"}</b><span>·</span><span class="mono">${esc(SESSION.id)}</span>${k==="recruiter"?`<span>·</span><span>${isSubscribed()?"Subscribed: full talent details unlocked":"Free plan: names and full CVs are hidden"}</span>`:""}</div></div>`:
    k==="admin"?`<div class="modebar" style="background:var(--red)"><div class="wrap"><b>Admin mode</b><span>·</span><span>You can see real identities and every record.</span></div></div>`:"";
  return`<header class="top"><div class="wrap"><button class="brand" data-go="${k==="member"?"m-home":k==="reviewer"?"r-queue":k==="recruiter"?"directory":k==="admin"?"a-home":"home"}" aria-label="DSN Talent Platform home"><img src="${LOGO}" alt="Data Science Nigeria"><span>Talent Platform</span></button><nav class="nav">${nav}</nav><div class="who">${adminLink}${right}</div></div></header>${modeLine}`;
}
function footer(){return`<footer class="foot"><div class="wrap row between"><span>© Data Science Nigeria · DSN Talent Platform</span><span>${CONFIG.DEMO_MODE?"Test mode · ":""}${MODE==="db"?"Shared test data":"Test data is saved in this browser only"}</span></div></footer>`}

const VIEWS={};
function render(){
  const app=$("#app");
  if(!READY){app.innerHTML=`<div class="wrap" style="padding-block:80px"><p class="muted">Loading DSN Talent Platform…</p></div>`;return}
  const guard={member:/^m-/,reviewer:/^r-/,recruiter:/^rc-(requests|plan)$/,admin:/^a-/};
  for(const[k,re]of Object.entries(guard)){if(re.test(R.name)&&!(SESSION?.kind===k&&acctOf(SESSION))){R={name:"login",p:{kind:k==="admin"?"member":k}};if(k==="admin"){R={name:"home",p:{}}}}}
  let body="";
  try{body=(VIEWS[R.name]||VIEWS.home)(R.p)}catch(e){console.error(e);body=`<div class="card"><h2>Something went wrong</h2><p class="muted">${esc(e.message)}</p></div>`}
  app.innerHTML=header()+(R.name==="home"?`<main class="home">${body}</main>`:`<main><div class="wrap">${body}</div></main>`)+footer();
  afterRender();
}
let afterHooks=[];
function after(fn){afterHooks.push(fn)}
function afterRender(){const h=afterHooks;afterHooks=[];h.forEach(f=>{try{f()}catch(e){console.error(e)}})}
