/* ══ Render cards ══ */
const PRI_ORDER={high:0,med:1,low:2};
let dragSrc=null;

function renderTodos(){
  const date=getActiveDate(), raw=getTodos(date);
  const el=document.getElementById('cards-grid'); el.innerHTML='';

  const STATUS_ORDER={inprogress:0,review:1,todo:2,done:3};
  const undone=raw.map((item,i)=>({...item,_i:i})).filter(x=>!x.done)
    .sort((a,b)=>{
      const so=(STATUS_ORDER[a.status||'todo']??2)-(STATUS_ORDER[b.status||'todo']??2);
      if(so!==0) return so;
      return (PRI_ORDER[a.priority]??1)-(PRI_ORDER[b.priority]??1);
    });
  const done=raw.map((item,i)=>({...item,_i:i})).filter(x=>x.done);
  let sorted=[...undone,...done];

  if(activeFilter!=='all') sorted=sorted.filter(x=>x.priority===activeFilter||x.done);

  if(!sorted.length){
    el.innerHTML=`<div class="empty">${activeFilter!=='all'?t('emptyFilter'):t('emptyTodo')}</div>`;
    updateProgress(raw); return;
  }

  const statusLabel={todo:t('statusTodo'),inprogress:t('statusInProgress'),review:t('statusReview'),done:t('statusDone')};
  const statusCls={todo:'status-todo',inprogress:'status-inprogress',review:'status-review',done:'status-done'};
  const cardStatusCls={todo:'status-todo-card',inprogress:'status-inprogress-card',review:'status-review-card',done:'status-done-card'};

  sorted.forEach(item=>{
    const i=item._i;
    const status=item.status||(item.done?'done':'todo');
    const card=document.createElement('div');
    card.className=`task-card pri-${item.priority||'med'} ${cardStatusCls[status]}${item.done?' done':''}`;
    card.draggable=true; card.dataset.idx=i;

    card.addEventListener('dragstart',e=>{ dragSrc=i; card.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; });
    card.addEventListener('dragend',()=>{ card.classList.remove('dragging'); document.querySelectorAll('.task-card').forEach(c=>c.classList.remove('drag-over')); });
    card.addEventListener('dragover',e=>{ e.preventDefault(); card.classList.add('drag-over'); });
    card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
    card.addEventListener('drop',e=>{ e.preventDefault(); card.classList.remove('drag-over'); if(dragSrc===null||dragSrc===i) return; const d=getActiveDate(),l=getTodos(d); const [mv]=l.splice(dragSrc,1); l.splice(i,0,mv); saveTodosLocal(d,l); haptic(); renderTodos(); dragSrc=null; });

    const due=dueDateInfo(item.due);
    const priLabel=t('pri'+item.priority.charAt(0).toUpperCase()+item.priority.slice(1));
    const memoHtml=item.memo?`<div class="card-memo">${escHtml(item.memo)}</div>`:'';
    const dueHtml=due?`<span class="due-chip${due.cls?' '+due.cls:''}">${due.label}</span>`:'';

    const statusMap={todo:t('statusTodo'),inprogress:t('statusInProgress'),review:t('statusReview'),done:t('statusDone')};
    const statusBtns=['todo','inprogress','review','done'].map(s=>`
      <button class="status-btn-small${s===status?' active':''}${s===status?` ${s}-sel`:''}" onclick="event.stopPropagation();setTaskStatus(${i},'${s}')" title="${statusMap[s]}">${statusMap[s]}</button>
    `).join('');

    card.innerHTML=`
      <div class="card-top">
        <div class="drag-grip"><span></span><span></span><span></span></div>
        <div class="card-cb" onclick="toggleTodo(${i})">
          <svg class="cb-svg" width="10" height="10" fill="none" stroke="#fff" stroke-width="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div class="card-content">
          <div class="card-title">
            <span class="card-title-text">${escHtml(item.text)}</span>
          </div>
          ${memoHtml}
          <div class="card-footer">
            <div class="status-buttons">${statusBtns}</div>
            <span class="pri-badge ${item.priority||'med'}">${priLabel}</span>
            ${dueHtml}
          </div>
        </div>
        <div class="card-actions">
          <button class="icon-btn" onclick="openModal(${i})" title="Edit">✎</button>
          <button class="icon-btn" onclick="deleteTodo(${i})" title="Delete">×</button>
        </div>
      </div>`;
    el.appendChild(card);
  });
  updateProgress(raw);
}

function updateProgress(raw){
  const done=raw.filter(x=>x.done).length, total=raw.length, pct=total?Math.round(done/total*100):0;
  const inprog=raw.filter(x=>!x.done&&(x.status==='inprogress')).length;
  document.getElementById('prog-text').textContent=`${done} / ${total} ${t('progLabel')}`;
  document.getElementById('prog-pct').textContent=pct+'%';
  document.getElementById('prog-fill').style.width=pct+'%';
  document.getElementById('prog-chip').textContent=total?`${done}/${total}`:'';
  const badge=document.getElementById('nav-badge'), pending=total-done;
  badge.textContent=pending||''; badge.style.display=pending?'flex':'none';
}
