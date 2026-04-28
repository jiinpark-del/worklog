/* ══ ROUTINE ══ */
const KEY_ROUTINES='wl_routines';
const KEY_ROUTINE_APPLIED='wl_routine_applied';
const WEEKDAYS=[1,2,3,4,5];
function getRoutines(){ return JSON.parse(localStorage.getItem(KEY_ROUTINES)||'[]') }
function saveRoutines(list){ localStorage.setItem(KEY_ROUTINES,JSON.stringify(list)) }

let rEditIdx=null, selRPriVal='med';

function openRModal(ei=null){
  rEditIdx=ei;
  document.getElementById('rmodal-title').textContent=t(ei!=null?'rmodalEdit':'rmodalAdd');
  document.getElementById('rmodal-confirm').textContent=t(ei!=null?'btnSave':'btnAdd');
  if(ei!=null){
    const r=getRoutines()[ei];
    document.getElementById('r-name').value=r.name;
    document.getElementById('r-memo').value=r.memo||'';
    selRPri(r.priority||'med');
  } else {
    document.getElementById('r-name').value=document.getElementById('r-quick').value||'';
    document.getElementById('r-memo').value='';
    selRPri('med');
  }
  document.getElementById('rmodal-bg').classList.add('open');
  setTimeout(()=>document.getElementById('r-name').focus(),80);
}
function closeRModal(){ document.getElementById('rmodal-bg').classList.remove('open'); document.getElementById('r-quick').value=''; }
function selRPri(p){
  selRPriVal=p;
  document.querySelectorAll('#rmodal-bg .pri-pill').forEach(btn=>{ const bp=btn.dataset.p; btn.className='pri-pill'+(bp===p?` sel-${p}`:''); });
}

function saveRoutine(){
  const name=document.getElementById('r-name').value.trim(); if(!name) return;
  const list=getRoutines();
  const item={id:rEditIdx!=null?list[rEditIdx].id:Date.now().toString(),name,priority:selRPriVal,days:WEEKDAYS,memo:document.getElementById('r-memo').value.trim()||null,active:true,created:new Date().toISOString()};
  if(rEditIdx!=null) list[rEditIdx]=item; else list.push(item);
  saveRoutines(list); closeRModal(); haptic(); renderRoutines(); showToast(t('saved'));
  if(sb && currentUser) sb.from('routines').upsert([{id:item.id,name:item.name,priority:item.priority,memo:item.memo,active:item.active,created:item.created,user_id:currentUser.id}]);
}

function quickRoutine(){
  const inp=document.getElementById('r-quick');
  if(!inp.value.trim()){ openRModal(); return; }
  const list=getRoutines();
  const item={id:Date.now().toString(),name:inp.value.trim(),priority:'med',days:WEEKDAYS,memo:null,active:true,created:new Date().toISOString()};
  list.push(item); saveRoutines(list); inp.value=''; haptic(); renderRoutines(); showToast(t('saved'));
  if(sb && currentUser) sb.from('routines').upsert([{id:item.id,name:item.name,priority:item.priority,memo:item.memo,active:item.active,created:item.created,user_id:currentUser.id}]);
}

function toggleRoutineActive(i){
  const list=getRoutines(); list[i].active=!list[i].active; saveRoutines(list); haptic(); renderRoutines();
  if(sb) sb.from('routines').update({active:list[i].active}).eq('id',list[i].id);
}
function deleteRoutine(i){
  const list=getRoutines(); const item=list[i]; list.splice(i,1); saveRoutines(list); haptic(); renderRoutines(); showToast(t('deleted'));
  if(sb) sb.from('routines').delete().eq('id',item.id);
}

function renderRoutines(){
  const list=getRoutines(), el=document.getElementById('routine-cards');
  const todayDow=new Date().getDay();
  const isWeekday=todayDow>=1&&todayDow<=5;
  const activeCount=list.filter(r=>r.active).length;
  const count=document.getElementById('routine-count');
  count.textContent=lang==='ko'?`총 ${list.length}개 · 활성 ${activeCount}개`:`${list.length} total · ${activeCount} active`;
  el.innerHTML='';
  if(!list.length){ el.innerHTML=`<div class="empty">${t('emptyRoutine')}</div>`; return; }
  list.forEach((r,i)=>{
    const card=document.createElement('div');
    card.className='routine-card'+(r.active?'':' inactive');
    const priLabel=t('pri'+((r.priority||'med').charAt(0).toUpperCase()+(r.priority||'med').slice(1)));
    const memoHtml=r.memo?`<div class="todo-memo" style="margin-top:6px">${escHtml(r.memo)}</div>`:'';
    const showToday=r.active&&isWeekday;
    card.innerHTML=`
      <div class="routine-card-top">
        <div class="routine-toggle${r.active?' on':''}" onclick="toggleRoutineActive(${i})"></div>
        <div class="routine-body">
          <div class="routine-name">${escHtml(r.name)}</div>
          ${memoHtml}
          <div class="routine-meta" style="margin-top:8px">
            <span style="font-size:10px;font-family:var(--font-mono);color:var(--text3)">${lang==='ko'?'월–금':'Mon–Fri'}</span>
            <span class="pri-badge-sm ${r.priority||'med'}">${priLabel}</span>
            ${showToday?`<span class="routine-today-badge">${t('todayRoutine')}</span>`:''}
          </div>
        </div>
        <div class="routine-actions">
          <button class="icon-btn" onclick="openRModal(${i})" title="Edit">✎</button>
          <button class="icon-btn" onclick="deleteRoutine(${i})" title="Delete">×</button>
        </div>
      </div>`;
    el.appendChild(card);
  });
}

function applyRoutinesToday(manual=false){
  const date=getActiveDate(), dow=new Date(date+'T00:00:00').getDay();
  const isWeekday=dow>=1&&dow<=5;
  if(!isWeekday){ if(manual) showToast(lang==='ko'?'오늘은 주말이라 루틴이 적용되지 않아요':'No routines on weekends'); return; }

  const applied=JSON.parse(localStorage.getItem(KEY_ROUTINE_APPLIED)||'[]');
  if(!manual&&applied.includes(date)) return;

  const routines=getRoutines().filter(r=>r.active);
  if(!routines.length){ if(manual) showToast(t('routineAlready')); return; }

  const existing=getTodos(date);
  const existingKeys=new Set(existing.map(t=>t.routineId||''));
  let added=0;
  routines.forEach(r=>{
    if(existingKeys.has(r.id)) return;
    existing.push({text:r.name,priority:r.priority,due:null,memo:r.memo||null,done:false,date,routineId:r.id,created_at:new Date().toISOString()});
    added++;
  });
  if(added>0){
    saveTodosLocal(date,existing);
    if(!applied.includes(date)){ applied.push(date); localStorage.setItem(KEY_ROUTINE_APPLIED,JSON.stringify(applied.slice(-30))); }
    renderTodos();
    const msg=added+t('routineApplied');
    if(manual){ showToast(msg); }
    else { const b=document.getElementById('routine-sync-banner'),m=document.getElementById('routine-sync-msg'); if(b&&m){ m.textContent=msg; b.classList.add('show'); setTimeout(()=>b.classList.remove('show'),4000); } }
  } else if(manual){
    showToast(t('routineAlready'));
  }
}
