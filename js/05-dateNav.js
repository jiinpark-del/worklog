/* ══ Active date (not just today) ══ */
let activeDate=todayStr();

function getActiveDate(){ return activeDate; }

function updateDateNavLabel(){
  const el=document.getElementById('date-nav-label'); if(!el) return;
  const dt=new Date(activeDate+'T00:00:00');
  const isToday=activeDate===todayStr();
  const DOW=lang==='ko'?['일','월','화','수','목','금','토']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const label=lang==='ko'
    ?`${dt.getMonth()+1}월 ${dt.getDate()}일 (${DOW[dt.getDay()]})`
    :`${DOW[dt.getDay()]}, ${dt.toLocaleDateString('en-AU',{month:'short',day:'numeric'})}`;
  el.textContent=isToday?(lang==='ko'?`오늘 · ${label}`:`Today · ${label}`):label;
  el.className='date-nav-label'+(isToday?' is-today':'');
  const jb=document.getElementById('today-jump-btn'); if(jb) jb.style.display=isToday?'none':'flex';
}

function navDate(dir){
  const dt=new Date(activeDate+'T00:00:00'); dt.setDate(dt.getDate()+dir);
  activeDate=dt.toISOString().slice(0,10);
  updateDateNavLabel(); renderTodos();
}

function openDatePicker(){
  const inp=document.getElementById('date-picker-input');
  inp.value=activeDate; inp.showPicker?.();
  inp.style.pointerEvents='auto';
  inp.click();
  inp.style.pointerEvents='none';
}

function setActiveDate(val){ if(!val) return; activeDate=val; updateDateNavLabel(); renderTodos(); }
function jumpToToday(){ activeDate=todayStr(); updateDateNavLabel(); renderTodos(); }
function updateSidebarDate(){
  const now=new Date();
  const sdEl=document.getElementById('sidebar-date');
  if(sdEl) sdEl.textContent=now.toLocaleDateString(lang==='ko'?'ko-KR':'en-AU',{month:'long',day:'numeric',weekday:'short'});
}
function initDates(){ updateSidebarDate(); }

/* ══ Due date label ══ */
function dueDateInfo(due){
  if(!due) return null;
  const today=todayStr(),tom=new Date(); tom.setDate(tom.getDate()+1);
  const tomStr=tom.toISOString().slice(0,10);
  if(due<today) return {label:t('overdue'),cls:'overdue'};
  if(due===today) return {label:t('todayDue'),cls:'today-due'};
  if(due===tomStr) return {label:t('tomorrowDue'),cls:''};
  return {label:due,cls:''};
}
