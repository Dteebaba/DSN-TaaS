/* DSN Talent Platform: Data layer. Demo mode keeps data in the browser (localStorage); inside a Claude artifact it uses the shared artifact database. Session and access checks live here. */
"use strict";
/* ---------- storage ---------- */
function saveLocal(){if(MODE==="local")lsSet("dsn_tp_data_v1",JSON.stringify(S))}
async function seedObj(){const el=document.getElementById("seed");if(el)return JSON.parse(el.textContent);const r=await fetch(CONFIG.SEED_URL);if(!r.ok)throw new Error("Could not load sample data");return r.json()}
async function put(col,id,data){S[col]={...S[col],[id]:data};if(MODE==="db"){try{await DB.doc(col+"/"+id).set(data)}catch(e){toast("Couldn't save: "+(e.code||e.message));throw e}}else saveLocal();scheduleRender()}
async function remove(col,id){const o={...S[col]};delete o[id];S[col]=o;if(MODE==="db"){try{await DB.doc(col+"/"+id).delete()}catch(e){toast("Couldn't delete: "+(e.code||e.message))}}else saveLocal();scheduleRender()}
async function loadSample(){const s=await seedObj();for(const c of COLS){for(const[id,d]of Object.entries(s[c]||{})){if(!S[c][id])await put(c,id,d)}}toast("Sample data loaded")}
async function initStore(){
  try{DB=(window.claude&&window.claude.use)?await window.claude.use("db"):null}catch(e){DB=null}
  try{USER=(window.claude&&window.claude.use)?await window.claude.use("user"):null}catch(e){USER=null}
  try{DL=(window.claude&&window.claude.use)?await window.claude.use("downloads"):null}catch(e){DL=null}
  if(DB){
    MODE="db";
    await new Promise(res=>{let pending=COLS.length;const done=()=>{if(--pending===0)res()};
      COLS.forEach(c=>{let first=true;DB.collection(c).onSnapshot(snap=>{const o={};snap.docs.forEach(d=>{o[d.id]=d.data()});S[c]=o;if(first){first=false;done()}else scheduleRender()},err=>{console.warn(c,err);if(first){first=false;done()}})});
      setTimeout(res,9000)});
  }else{
    MODE="local";
    const raw=lsGet("dsn_tp_data_v1");let ok=false;
    if(raw){try{const o=JSON.parse(raw);COLS.forEach(c=>S[c]=o[c]||{});ok=true}catch(e){}}
    if(!ok){const s=await seedObj();COLS.forEach(c=>S[c]=clone(s[c]||{}));saveLocal()}
  }
  if(USER){try{CAN_ADMIN=!!(await USER.isOwner())||!!(await USER.canEdit())}catch(e){CAN_ADMIN=false}}else CAN_ADMIN=(MODE==="local");
  try{SESSION=JSON.parse(lsGet("dsn_tp_session")||"null")}catch(e){SESSION=null}
  if(SESSION&&!acctOf(SESSION))SESSION=null;
  READY=true;
}
function acctOf(s){if(!s)return null;if(s.kind==="member")return S.members[s.id];if(s.kind==="recruiter")return S.recruiters[s.id];if(s.kind==="reviewer")return S.reviewers[s.id];if(s.kind==="admin")return(CAN_ADMIN||CONFIG.DEMO_MODE)?{id:"admin"}:null;return null}
function setSession(s){SESSION=s;if(s)lsSet("dsn_tp_session",JSON.stringify(s));else lsDel("dsn_tp_session")}
const me=()=>acctOf(SESSION);
const isRecruiter=()=>SESSION?.kind==="recruiter";
const isSubscribed=()=>isRecruiter()&&me()?.status==="approved"&&me()?.subscribed;
const isAdmin=()=>SESSION?.kind==="admin"&&(CAN_ADMIN||CONFIG.DEMO_MODE);
const isReviewer=()=>SESSION?.kind==="reviewer";
function canSeeFull(memberId){if(isAdmin()||isReviewer())return true;if(SESSION?.kind==="member"&&SESSION.id===memberId)return true;return isSubscribed()}
