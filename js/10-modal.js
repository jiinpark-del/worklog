/* ══ Modal ══ */
let editIdx=null, selPriVal='high', selStatusVal='todo', quickStatusVal='todo';

function openModal(ei=null){
  editIdx=ei;
  document.getElementById('modal-title').textContent=t(ei!=null?'modalEdit':'modalAdd');
  document.getElementById('modal-confirm').textContent=t(ei!=null?'btnSave':'btnAdd');
  if(ei!=null){
    const item=getTodos(getActiveDate())[ei];
    document.getElementById('m-text').value=item.text;
    document.getElementById('m-due').value=item.due||'';
    document.getElementById('m-memo').value=item.memo||'';
    selPri(item.priority||'med');
    selStatus(item.status||'todo');
  } else {
    document.getElementById('m-text').value=document.getElementById('quick-input').value||'';
    document.getElementById('m-due').value='';
    document.getElementById('m-memo').value='';
    selPri('high'); selStatus('todo');
  }
  document.getElementById('modal-bg').classList.add('open');
  setTimeout(()=>document.getElementById('m-text').focus(),80);
}
function closeModal(){ document.getElementById('modal-bg').classList.remove('open'); document.getElementById('quick-input').value=''; }
function selPri(p){
  selPriVal=p;
  document.querySelectorAll('#modal-bg .pri-pill').forEach(btn=>{ const bp=btn.dataset.p; btn.className='pri-pill'+(bp===p?` sel-${p}`:''); });
}
function selStatus(s){
  selStatusVal=s;
  const styleMap={todo:'sel-high',inprogress:'sel-med',review:'sel-med',done:'sel-low'};
  document.querySelectorAll('#status-pills .pri-pill').forEach(btn=>{
    const bs=btn.dataset.s;
    btn.className='pri-pill'+(bs===s?' '+styleMap[s]:'');
  });
}
