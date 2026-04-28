/* ══ Todo CRUD ══ */
async function saveTask(){
  const text=document.getElementById('m-text').value.trim(); if(!text) return;
  const date=getActiveDate(), list=getTodos(date);
  const item={text,priority:selPriVal,status:selStatusVal,due:document.getElementById('m-due').value||null,memo:document.getElementById('m-memo').value.trim()||null,done:selStatusVal==='done',date,created_at:new Date().toISOString()};
  if(editIdx!=null){ const old=list[editIdx]; item.created_at=old.created_at; list[editIdx]=item; }
  else list.push(item);
  saveTodosLocal(date,list); closeModal(); haptic(); renderTodos();
  if(sb && currentUser){ const payload={...item, user_id:currentUser.id}; sb.from('todos')[editIdx!=null?'update':'insert'](editIdx!=null?[payload]:[payload]).then(()=>{}); }
}
async function quickAdd(){
  const inp=document.getElementById('quick-input');
  if(!inp.value.trim()){ openModal(); return; }
  const date=getActiveDate(), list=getTodos(date);
  const item={text:inp.value.trim(),priority:'med',status:quickStatusVal,due:null,memo:null,done:quickStatusVal==='done',date,created_at:new Date().toISOString()};
  list.push(item); saveTodosLocal(date,list); inp.value='';
  haptic(); renderTodos();
  if(sb && currentUser) sb.from('todos').insert([{...item, user_id:currentUser.id}]);
}
async function cycleStatus(i){
  const date=getActiveDate(), list=getTodos(date);
  const cycle=['todo','inprogress','review','done'];
  const cur=list[i].status||'todo';
  const next=cycle[(cycle.indexOf(cur)+1)%cycle.length];
  list[i].status=next; list[i].done=next==='done';
  saveTodosLocal(date,list); haptic(next==='done'?'success':'light');
  renderTodos();
  if(next==='done'&&list.filter(x=>x.done).length===list.length){ fireConfetti(); showToast(t('allDone')); }
  if(sb && currentUser) sb.from('todos').update({status:next,done:list[i].done}).eq('created_at',list[i].created_at).eq('user_id',currentUser.id);
}

async function setTaskStatus(i,newStatus){
  const date=getActiveDate(), list=getTodos(date);
  list[i].status=newStatus; list[i].done=newStatus==='done';
  saveTodosLocal(date,list); haptic(newStatus==='done'?'success':'light');
  renderTodos();
  if(newStatus==='done'&&list.filter(x=>x.done).length===list.length){ fireConfetti(); showToast(t('allDone')); }
  if(sb && currentUser) sb.from('todos').update({status:newStatus,done:list[i].done}).eq('created_at',list[i].created_at).eq('user_id',currentUser.id);
}
async function toggleTodo(i){
  const date=getActiveDate(), list=getTodos(date);
  list[i].done=!list[i].done;
  list[i].status=list[i].done?'done':'todo';
  saveTodosLocal(date,list); haptic(list[i].done?'success':'light');
  renderTodos();
  if(list.filter(x=>x.done).length===list.length&&list.length>0){ fireConfetti(); showToast(t('allDone')); }
  if(sb && currentUser) sb.from('todos').update({done:list[i].done,status:list[i].status}).eq('created_at',list[i].created_at).eq('user_id',currentUser.id);
}
async function deleteTodo(i){
  const date=getActiveDate(), list=getTodos(date), item=list[i];
  list.splice(i,1); saveTodosLocal(date,list); haptic(); showToast(t('deleted')); renderTodos();
  if(sb && currentUser) sb.from('todos').delete().eq('created_at',item.created_at).eq('user_id',currentUser.id);
}
