/* ══ Theme / Accent ══ */
const PRESETS=['#4f7cff','#7c5cff','#ff5c8d','#ff7c3f','#25c17a','#00bcd4','#ff4d4d','#e91e63','#9c27b0','#ff9800','#8bc34a','#607d8b'];
function buildPresets(){
  const g=document.getElementById('preset-row');
  PRESETS.forEach(c=>{ const d=document.createElement('div'); d.className='swatch'; d.style.background=c; d.onclick=()=>{ setAccent(c); document.getElementById('custom-color').value=c; }; g.appendChild(d); });
}
function setTheme(th){
  document.documentElement.setAttribute('data-theme',th==='light'?'light':'');
  localStorage.setItem('wl_theme',th);
  document.getElementById('btn-dark').classList.toggle('active',th==='dark');
  document.getElementById('btn-light').classList.toggle('active',th==='light');
}
function setAccent(hex){
  document.documentElement.style.setProperty('--accent',hex);
  localStorage.setItem('wl_accent',hex);
  document.getElementById('custom-color').value=hex;
  document.getElementById('color-trigger').style.background=hex;
}
function toggleCPanel(e){ e.stopPropagation(); document.getElementById('cpanel').classList.toggle('open'); }
document.addEventListener('click',()=>document.getElementById('cpanel').classList.remove('open'));
