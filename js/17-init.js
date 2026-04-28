/* ══ Init ══ */
buildPresets();
setTheme(localStorage.getItem('wl_theme')||'dark');
const acc=localStorage.getItem('wl_accent'); if(acc) setAccent(acc);
initDates(); initSupabase();
updateAuthUI();
checkAuthStatus();
applyLang(); renderFilterTabs(); renderTodos(); updateDateNavLabel();
applyRoutinesToday(false);
const {url,key}=getConfig();
if(url) document.getElementById('cfg-url').value=url;
if(key) document.getElementById('cfg-key').value=key;
