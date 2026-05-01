/* ══ AI ══ */
let aiPeriod='today', aiStyle='daily';

function buildRange(start,end){
  const dates=[], cur=new Date(start);
  while(cur<=end){ dates.push(cur.toISOString().slice(0,10)); cur.setDate(cur.getDate()+1); }
  const label=dates[0]===dates[dates.length-1]?dates[0]:`${dates[0]} ~ ${dates[dates.length-1]}`;
  return {dates,label};
}

function getDateRange(){
  const today=todayStr();
  if(aiPeriod==='today') return {dates:[today],label:today};
  if(aiPeriod==='week'){
    const dt=new Date(today+'T00:00:00');
    const dow=dt.getDay();
    const monday=new Date(dt);
    monday.setDate(dt.getDate()-(dow===0?6:dow-1));
    return buildRange(monday,dt);
  }
  if(aiPeriod==='month'){
    const dt=new Date(today+'T00:00:00');
    const first=new Date(dt.getFullYear(),dt.getMonth(),1);
    return buildRange(first,dt);
  }
  const fromVal=document.getElementById('ai-date-from').value;
  const toVal=document.getElementById('ai-date-to').value;
  if(!fromVal||!toVal||fromVal>toVal) return {dates:[today],label:today};
  return buildRange(new Date(fromVal+'T00:00:00'),new Date(toVal+'T00:00:00'));
}

function aggregateTodos(dates){
  const allTodos=load(KEY_TODOS), multiDay=dates.length>1;
  const done=[], undone=[];
  dates.forEach(d=>{
    (allTodos[d]||[]).forEach(t=>{
      const entry=multiDay?{...t,text:`[${d}] ${t.text}`}:t;
      (t.done?done:undone).push(entry);
    });
  });
  return {done,undone};
}

function buildPrompt(done,undone,label){
  const isKo=lang==='ko';
  const priIcon=p=>p==='high'?' ❗':p==='low'?' (낮음)':'';
  const line=item=>`- ${item.text}${priIcon(item.priority)}${item.due?' (마감:'+item.due+')':''}${item.memo?' — '+item.memo:''}`;
  const header=isKo
    ?`기간: ${label}\n\n완료 (${done.length}개):\n${done.map(line).join('\n')||'없음'}\n\n미완료 (${undone.length}개):\n${undone.map(line).join('\n')||'없음'}`
    :`Period: ${label}\n\nDone (${done.length}):\n${done.map(line).join('\n')||'None'}\n\nPending (${undone.length}):\n${undone.map(line).join('\n')||'None'}`;
  const instructions={
    daily:isKo
      ?'\n\n한국어로 간결한 일일 업무 리포트를 작성해주세요.\n구성: ✅ 잘한 점 / ⚠️ 미완료 / 🎯 내일 우선순위 3가지\n각 섹션 2~3줄.'
      :'\n\nWrite a concise daily report in English.\nFormat: ✅ Highlights / ⚠️ Incomplete / 🎯 Top 3 for tomorrow\n2-3 lines per section.',
    resume:isKo
      ?'\n\n위 업무들을 바탕으로 이력서에 넣을 성과 bullet points를 3~5개 작성해주세요. 수치를 포함하고 동사로 시작하세요.'
      :'\n\nWrite 3-5 resume bullet points based on these tasks. Use action verbs and quantify results.',
    business:isKo
      ?'\n\n위 업무 내용으로 업무 보고서를 작성해주세요. 형식: 1. 업무 요약 2. 완료 사항 3. 진행 중 4. 이슈 및 다음 액션'
      :'\n\nWrite a formal business report. Format: 1. Summary 2. Completed 3. In Progress 4. Issues & Next Steps',
    linkedin:isKo
      ?'\n\n위 업무를 바탕으로 LinkedIn 포스팅을 작성해주세요. 성과를 강조하고 마지막에 해시태그 3~5개를 포함하세요.'
      :'\n\nWrite a LinkedIn post based on these tasks. Highlight achievements and end with 3-5 relevant hashtags.'
  };
  return header+(instructions[aiStyle]||instructions.daily);
}

function setAIPeriod(period){
  aiPeriod=period;
  document.querySelectorAll('#ai-period-group .ai-sel-pill').forEach(b=>b.classList.toggle('active',b.dataset.period===period));
  const rangeEl=document.getElementById('ai-custom-range');
  rangeEl.style.display=period==='custom'?'flex':'none';
  if(period==='custom'){
    const today=todayStr();
    const fromEl=document.getElementById('ai-date-from');
    const toEl=document.getElementById('ai-date-to');
    if(!fromEl.value) fromEl.value=today;
    if(!toEl.value) toEl.value=today;
  }
  renderKPI();
}

function setAIStyle(style){
  aiStyle=style;
  document.querySelectorAll('#ai-style-group .ai-sel-pill').forEach(b=>b.classList.toggle('active',b.dataset.style===style));
}

function onCustomRangeChange(){
  renderKPI();
}

function renderKPI(){
  const {dates}=getDateRange();
  const {done,undone}=aggregateTodos(dates);
  const inprog=undone.filter(t=>t.status==='inprogress').length;
  const review=undone.filter(t=>t.status==='review').length;
  document.getElementById('kpi-row').innerHTML=[
    {val:done.length||'—',lbl:lang==='ko'?'완료':'Done'},
    {val:inprog||'—',lbl:lang==='ko'?'진행중':'In Progress'},
    {val:review||'—',lbl:lang==='ko'?'검토중':'In Review'}
  ].map(k=>`<div class="kpi"><div class="kpi-val">${k.val}</div><div class="kpi-lbl">${k.lbl}</div></div>`).join('');
}

async function generateReport(){
  const {dates,label}=getDateRange();
  const {done,undone}=aggregateTodos(dates);
  const prompt=buildPrompt(done,undone,label);
  const btn=document.getElementById('ai-btn'), res=document.getElementById('ai-result');
  btn.disabled=true; res.className='ai-result loading'; res.textContent=t('aiLoading');
  try{
    const r=await fetch(EDGE_FUNCTION_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt})
    });
    const data=await r.json();
    if(!r.ok||data.error) throw new Error(data.error||'Error');
    const text=data.text||t('aiError');
    res.className='ai-result'; res.textContent=text;
    if(aiPeriod==='today'){
      const date=dates[0];
      const ai=load(KEY_AI); ai[date]=text; ls(KEY_AI,ai);
      if(sb&&currentUser) sb.from('ai_reports').upsert([{date,report:text,user_id:currentUser.id}]);
    }
  }catch(e){ res.className='ai-result'; res.textContent=t('aiError'); }
  btn.disabled=false;
}

function copyReport(){ const txt=document.getElementById('ai-result').textContent; if(txt) navigator.clipboard.writeText(txt).then(()=>showToast(t('copied'))); }

function downloadReport(){
  const txt=document.getElementById('ai-result').textContent;
  if(!txt) return;
  const {dates}=getDateRange();
  const rangeStr=dates.length===1?dates[0]:`${dates[0]}_${dates[dates.length-1]}`;
  const filename=`worklog_${rangeStr}_${aiStyle}.txt`;
  const a=document.createElement('a');
  a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(txt);
  a.download=filename;
  a.click();
}
