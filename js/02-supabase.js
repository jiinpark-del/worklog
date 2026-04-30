/* ══ Supabase ══ */
const SUPABASE_URL = 'https://lmgeckzwefrxovowwkxj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtZ2Vja3p3ZWZyeG92b3d3a3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjgzOTQsImV4cCI6MjA5MjU0NDM5NH0.DIO1K4U6TCapXSorEiUnKonpemvdGG0U-mmH4lPNLp4';
const EDGE_FUNCTION_URL = 'https://lmgeckzwefrxovowwkxj.supabase.co/functions/v1/ai-report';

const SB_URL_KEY='wl_sb_url',SB_KEY_KEY='wl_sb_key';
let sb=null;
function getConfig(){
  return {
    url: localStorage.getItem(SB_URL_KEY) || SUPABASE_URL,
    key: localStorage.getItem(SB_KEY_KEY) || SUPABASE_ANON_KEY
  };
}
function initSupabase(){
  const {url,key}=getConfig();
  if(url&&key){
    try{
      sb=supabase.createClient(url,key);
      setSS('syncing');
      sb.from('todos').select('id').limit(1).then(({error})=>{
        if(error){ setSS('offline'); sb=null; }
        else{ setSS('online'); syncFromSupabase(); }
      });
    }catch(e){ sb=null; setSS('offline'); }
  } else { setSS('offline'); console.warn('Supabase URL/Key가 필요합니다. Settings 탭에서 입력해주세요.'); }
}

async function syncFromSupabase(){
  if(!sb) return;
  try{
    const since=new Date(); since.setDate(since.getDate()-60);
    const sinceStr=since.toISOString().slice(0,10);
    const {data:todos,error:e1}=await sb.from('todos').select('*').gte('date',sinceStr);
    if(!e1&&todos&&todos.length){
      const grouped={};
      todos.forEach(item=>{ if(!grouped[item.date]) grouped[item.date]=[]; grouped[item.date].push(item); });
      const local=load(KEY_TODOS);
      Object.keys(grouped).forEach(date=>{ local[date]=grouped[date]; });
      ls(KEY_TODOS,local);
    }
    const {data:reports,error:e2}=await sb.from('ai_reports').select('*').gte('date',sinceStr);
    if(!e2&&reports&&reports.length){
      const aiLocal=load(KEY_AI);
      reports.forEach(r=>{ aiLocal[r.date]=r.report; });
      ls(KEY_AI,aiLocal);
    }
    const {data:routines,error:e3}=await sb.from('routines').select('*');
    if(!e3&&routines&&routines.length){
      const mapped=routines.map(r=>({...r,days:[1,2,3,4,5]}));
      saveRoutines(mapped);
    }
    renderTodos(); renderFilterTabs(); renderRoutines();
    showToast(lang==='ko'?'☁️ 데이터 동기화 완료':'☁️ Synced from cloud');
  }catch(e){ console.warn('Sync error',e); }
}
function setSS(s){
  ['sync-dot','sync-dot2'].forEach(id=>{ const d=document.getElementById(id); if(d) d.className='sync-dot'+(s==='syncing'?' syncing':s==='online'?'':' offline'); });
  const cl=document.getElementById('conn-label'); if(cl) cl.textContent=t(s==='online'?'connected':s==='syncing'?'checking':'disconnected');
}
function saveEdgeUrl(){
  const url=document.getElementById('cfg-edge').value.trim();
  if(!url) return;
  localStorage.setItem('wl_edge_url',url);
  showToast(t('saved'));
}
function saveConfig(){
  const url=document.getElementById('cfg-url').value.trim(),key=document.getElementById('cfg-key').value.trim();
  if(!url||!key) return;
  localStorage.setItem(SB_URL_KEY,url); localStorage.setItem(SB_KEY_KEY,key);
  initSupabase(); showToast(t('configSaved'));
}
