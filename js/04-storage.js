/* ══ Storage ══ */
const KEY_TODOS='wl_todos',KEY_AI='wl_ai';
function load(k){ try{ return JSON.parse(localStorage.getItem(k)||'{}') }catch(e){ return {} } }
function ls(k,v){ localStorage.setItem(k,JSON.stringify(v)) }
const todayStr=()=>new Date().toISOString().slice(0,10);
function getTodos(date){ return load(KEY_TODOS)[date]||[] }
function saveTodosLocal(date,list){ const a=load(KEY_TODOS); a[date]=list; ls(KEY_TODOS,a) }
