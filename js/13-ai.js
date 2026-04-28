/* ══ AI ══ */
function renderKPI(){
  const date=getActiveDate(), todos=getTodos(date);
  const done=todos.filter(t=>t.done).length, total=todos.length, pct=total?Math.round(done/total*100):0;
  const inprog=todos.filter(t=>t.status==='inprogress'&&!t.done).length;
  const review=todos.filter(t=>t.status==='review'&&!t.done).length;
  document.getElementById('kpi-row').innerHTML=[
    {val:done||'—',lbl:lang==='ko'?'완료':'Done'},
    {val:inprog||'—',lbl:lang==='ko'?'진행중':'In Progress'},
    {val:review||'—',lbl:lang==='ko'?'검토중':'In Review'}
  ].map(k=>`<div class="kpi"><div class="kpi-val">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div>`).join('');
}

async function generateReport(){
  const date=todayStr(), todos=getTodos(date);
  const done=todos.filter(t=>t.done), undone=todos.filter(t=>!t.done);
  const priIcon=p=>p==='high'?' ❗':p==='low'?' (낮음)':'';
  const line=item=>`- ${item.text}${priIcon(item.priority)}${item.due?' (마감:'+item.due+')':''}${item.memo?' — '+item.memo:''}`;
  const isKo=lang==='ko';
  const prompt=isKo
    ?`오늘(${date}) 업무 현황:\n\n완료 (${done.length}개):\n${done.map(line).join('\n')||'없음'}\n\n미완료 (${undone.length}개):\n${undone.map(line).join('\n')||'없음'}\n\n한국어로 간결한 일일 업무 리포트를 작성해주세요.\n구성: ✅ 잘한 점 / ⚠️ 미완료 / 🎯 내일 우선순위 3가지\n각 섹션 2~3줄.`
    :`Today's summary (${date}):\n\nDone (${done.length}):\n${done.map(line).join('\n')||'None'}\n\nPending (${undone.length}):\n${undone.map(line).join('\n')||'None'}\n\nWrite a concise daily report in English.\nFormat: ✅ Highlights / ⚠️ Incomplete / 🎯 Top 3 for tomorrow\n2-3 lines per section.`;
  const edgeUrl=localStorage.getItem('wl_edge_url')||'';
  const btn=document.getElementById('ai-btn'), res=document.getElementById('ai-result');
  if(!edgeUrl){
    res.className='ai-result';
    res.textContent=lang==='ko'?'설정 탭에서 Edge Function URL을 먼저 입력해주세요':'Please enter your Edge Function URL in Settings first';
    return;
  }
  btn.disabled=true; res.className='ai-result loading'; res.textContent=t('aiLoading');
  try{
    const r=await fetch(edgeUrl,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt})
    });
    const data=await r.json();
    if(!r.ok||data.error) throw new Error(data.error||'Error');
    const text=data.text||t('aiError');
    res.className='ai-result'; res.textContent=text;
    const ai=load(KEY_AI); ai[date]=text; ls(KEY_AI,ai);
    if(sb && currentUser) sb.from('ai_reports').upsert([{date,report:text,user_id:currentUser.id}]);
  }catch(e){ res.className='ai-result'; res.textContent=t('aiError'); }
  btn.disabled=false;
}
function copyReport(){ const txt=document.getElementById('ai-result').textContent; if(txt) navigator.clipboard.writeText(txt).then(()=>showToast(t('copied'))); }
function downloadReport(){ const txt=document.getElementById('ai-result').textContent; if(!txt) return; const a=document.createElement('a'); a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(txt); a.download=`worklog_${todayStr()}.txt`; a.click(); }
