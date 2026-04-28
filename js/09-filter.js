/* ══ Filter ══ */
let activeFilter='all';
function renderFilterTabs(){
  const tabs=[['all','tabAll'],['high','tabHigh'],['med','tabMed'],['low','tabLow']];
  const el=document.getElementById('filter-tabs'); el.innerHTML='';
  tabs.forEach(([val,key])=>{
    const btn=document.createElement('button'); btn.className='filter-tab'+(activeFilter===val?' active':'');
    btn.textContent=t(key); btn.onclick=()=>{ activeFilter=val; renderFilterTabs(); renderTodos(); };
    el.appendChild(btn);
  });
}
