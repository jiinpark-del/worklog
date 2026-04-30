/* ══ Nav ══ */
const TAB_KEYS={todo:'tabTodo',ai:'tabAI',history:'tabHistory',settings:'tabSettings',routine:'tabRoutine'};
function switchTab(tab,btn){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
  document.getElementById('panel-'+tab).classList.add('active');
  if(btn) btn.classList.add('active');
  document.getElementById('topbar-label').textContent=t(TAB_KEYS[tab]);
  document.getElementById('prog-chip').textContent=tab==='todo'?progChip():'';
  closeSidebar();
  if(tab==='ai') renderKPI();
  if(tab==='history') renderCalendar();
  if(tab==='routine') renderRoutines();
  if(tab==='settings'){
    const {url,key}=getConfig();
    document.getElementById('cfg-url').value=url;
    document.getElementById('cfg-key').value=key;
    setSS(sb?'online':'offline');
  }
}
function progChip(){ const l=getTodos(todayStr()),d=l.filter(t=>t.done).length; return l.length?`${d}/${l.length}`:''; }
function toggleSidebar(){ document.getElementById('sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('show'); }
function closeSidebar(){ document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }
