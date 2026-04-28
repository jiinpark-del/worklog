/* ══ History Calendar ══ */
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth();
let selectedDate=null;

function calNav(dir){
  calMonth+=dir;
  if(calMonth>11){calMonth=0;calYear++;}
  if(calMonth<0){calMonth=11;calYear--;}
  renderCalendar();
}

function renderCalendar(){
  const DOW_KO=['일','월','화','수','목','금','토'];
  const DOW_EN=['Su','Mo','Tu','We','Th','Fr','Sa'];
  const dows=lang==='ko'?DOW_KO:DOW_EN;
  const MONTHS_KO=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const MONTHS_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];

  const label=lang==='ko'?`${calYear}년 ${MONTHS_KO[calMonth]}`:`${MONTHS_EN[calMonth]} ${calYear}`;
  document.getElementById('cal-month-label').textContent=label;

  const grid=document.getElementById('cal-grid');
  grid.innerHTML='';

  dows.forEach(d=>{
    const el=document.createElement('div'); el.className='cal-dow'; el.textContent=d; grid.appendChild(el);
  });

  const firstDay=new Date(calYear,calMonth,1).getDay();
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const daysInPrev=new Date(calYear,calMonth,0).getDate();
  const todayISO=todayStr();
  const allTodos=load(KEY_TODOS);
  const allAI=load(KEY_AI);

  for(let i=firstDay-1;i>=0;i--){
    const el=document.createElement('div'); el.className='cal-day other-month';
    el.innerHTML=`<span class="cal-day-num" style="pointer-events:none">${daysInPrev-i}</span>`;
    grid.appendChild(el);
  }

  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const todos=allTodos[dateStr]||[];
    const hasData=todos.length>0||!!allAI[dateStr];
    const done=todos.filter(x=>x.done).length, total=todos.length;
    const pct=total?Math.round(done/total*100):0;
    const isToday=dateStr===todayISO;
    const isSel=dateStr===selectedDate;

    const el=document.createElement('div');
    el.className='cal-day'+(hasData?' has-data':'')+(isToday?' today':'')+(isSel?' selected':'');

    const barColor=pct===100?'var(--green)':pct>=60?'var(--amber)':'var(--red)';
    const barFill=isSel?'#fff':barColor;
    const barHtml=hasData?`<div class="cal-pct-bar"><div class="cal-pct-fill" style="width:${pct}%;background:${barFill}"></div></div>`:'';

    el.innerHTML=`<span class="cal-day-num" style="pointer-events:none">${d}</span>${barHtml}`;
    el.addEventListener('click',()=>selectDay(dateStr,el));
    grid.appendChild(el);
  }

  const filled=firstDay+daysInMonth;
  const remaining=(7-filled%7)%7;
  for(let d=1;d<=remaining;d++){
    const el=document.createElement('div'); el.className='cal-day other-month';
    el.innerHTML=`<span class="cal-day-num" style="pointer-events:none">${d}</span>`;
    grid.appendChild(el);
  }

  if(selectedDate) renderDayDetail(selectedDate);
}

function selectDay(dateStr,el){
  if(selectedDate===dateStr){
    selectedDate=null;
    document.getElementById('day-detail-wrap').innerHTML='';
    document.querySelectorAll('.cal-day.selected').forEach(d=>{ d.classList.remove('selected'); const f=d.querySelector('.cal-pct-fill'); if(f){ const p=parseInt(f.style.width); f.style.background=p===100?'var(--green)':p>=60?'var(--amber)':'var(--red)'; } });
    return;
  }
  selectedDate=dateStr;
  document.querySelectorAll('.cal-day.selected').forEach(d=>{ d.classList.remove('selected'); const f=d.querySelector('.cal-pct-fill'); if(f){ const p=parseInt(f.style.width); f.style.background=p===100?'var(--green)':p>=60?'var(--amber)':'var(--red)'; } });
  el.classList.add('selected');
  const fill=el.querySelector('.cal-pct-fill'); if(fill) fill.style.background='#fff';
  renderDayDetail(dateStr);
  setTimeout(()=>document.getElementById('day-detail-wrap').scrollIntoView({behavior:'smooth',block:'nearest'}),60);
}

function renderDayDetail(dateStr){
  const wrap=document.getElementById('day-detail-wrap');
  const todos=getTodos(dateStr);
  const ai=load(KEY_AI)[dateStr]||'';
  const dt=new Date(dateStr+'T00:00:00');
  const DOW=lang==='ko'?['일','월','화','수','목','금','토']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dateLabel=lang==='ko'
    ?`${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 (${DOW[dt.getDay()]})`
    :`${DOW[dt.getDay()]}, ${dt.toLocaleDateString('en-AU',{month:'long',day:'numeric',year:'numeric'})}`;

  if(!todos.length&&!ai){ wrap.innerHTML=`<div class="day-detail"><div class="detail-empty">${lang==='ko'?'이 날의 기록이 없습니다':'No records for this day'}</div></div>`; return; }

  const done=todos.filter(x=>x.done).length, total=todos.length, pct=total?Math.round(done/total*100):0;
  const badgeCls=pct===100?'badge-green':pct>=60?'badge-amber':'badge-red';

  const taskRows=todos.map(item=>{
    const priLabel=t('pri'+((item.priority||'med').charAt(0).toUpperCase()+(item.priority||'med').slice(1)));
    const memoHtml=item.memo?`<div class="detail-task-memo">${escHtml(item.memo)}</div>`:'';
    return `<div class="detail-task-row${item.done?' done-task':''}">
      <span style="font-size:11px;color:${item.done?'var(--green)':'var(--red)'};flex-shrink:0;margin-top:2px">${item.done?'✓':'✗'}</span>
      <div style="flex:1;min-width:0"><div class="detail-task-text">${escHtml(item.text)}</div>${memoHtml}</div>
      <span class="detail-pri ${item.priority||'med'}">${priLabel}</span>
    </div>`;
  }).join('');

  wrap.innerHTML=`<div class="day-detail">
    <div class="day-detail-header">
      <span class="day-detail-date">${dateLabel}</span>
      <span class="badge ${badgeCls}">${pct===100?t('doneBadge'):pct+'%'}</span>
    </div>
    <div class="detail-kpi-row">
      <div class="detail-kpi"><div class="detail-kpi-val">${done}</div><div class="detail-kpi-lbl">${lang==='ko'?'완료':'Done'}</div></div>
      <div class="detail-kpi"><div class="detail-kpi-val">${total-done}</div><div class="detail-kpi-lbl">${lang==='ko'?'미완료':'Pending'}</div></div>
      <div class="detail-kpi"><div class="detail-kpi-val">${total?pct+'%':'—'}</div><div class="detail-kpi-lbl">${lang==='ko'?'달성률':'Rate'}</div></div>
    </div>
    ${todos.length?`<p class="detail-section-title">${lang==='ko'?'업무 목록':'Tasks'}</p>${taskRows}`:''}
    ${ai?`<p class="detail-section-title">${lang==='ko'?'AI 리포트':'AI Report'}</p><div class="detail-ai">${escHtml(ai)}</div>`:''}
  </div>`;
}
