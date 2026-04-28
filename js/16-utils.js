/* ══ Utils ══ */
function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
function exportData(){ const a=document.createElement('a'); a.href='data:application/json,'+encodeURIComponent(JSON.stringify({todos:load(KEY_TODOS),ai:load(KEY_AI),routines:getRoutines()},null,2)); a.download=`worklog_${todayStr()}.json`; a.click(); }
function clearLocal(){ if(confirm(t('confirmClear'))){ [KEY_TODOS,KEY_AI,KEY_ROUTINES,KEY_ROUTINE_APPLIED].forEach(k=>localStorage.removeItem(k)); renderTodos(); renderRoutines(); showToast('Done'); } }
