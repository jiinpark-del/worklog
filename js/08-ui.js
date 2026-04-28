/* ══ Toast ══ */
let toastT=null;
function showToast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),2400); }

/* ══ Confetti ══ */
function fireConfetti(){
  const c=document.getElementById('confetti'); c.style.display='block'; c.width=innerWidth; c.height=innerHeight;
  const ctx=c.getContext('2d');
  const P=Array.from({length:100},()=>({ x:Math.random()*c.width,y:-10,vx:(Math.random()-.5)*7,vy:Math.random()*5+2,color:['#4f7cff','#25c17a','#f0a020','#ff5c8d','#7c5cff'][Math.floor(Math.random()*5)],s:Math.random()*8+3,r:Math.random()*360,rv:(Math.random()-.5)*9 }));
  let f=0;
  (function draw(){ ctx.clearRect(0,0,c.width,c.height); P.forEach(p=>{ p.x+=p.vx;p.y+=p.vy;p.vy+=.09;p.r+=p.rv; ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r*Math.PI/180);ctx.fillStyle=p.color;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s);ctx.restore(); }); f++;if(f<115) requestAnimationFrame(draw); else c.style.display='none'; })();
}
function haptic(type='light'){ if(navigator.vibrate) navigator.vibrate(type==='success'?[20,30,50]:20); }
