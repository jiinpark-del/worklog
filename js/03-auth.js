/* ══ Auth ══ */
let currentUser=null;
let authMode='login';

function showAuthModal(mode){
  authMode=mode;
  const title=document.getElementById('auth-modal-title');
  const btn=document.getElementById('auth-submit-btn');
  const toggleBtn=document.getElementById('auth-toggle-btn');
  const tabs=document.querySelectorAll('.auth-tab-btn');

  tabs.forEach((tab,i)=>{
    tab.classList.toggle('active',i===(mode==='signup'?1:0));
  });

  if(mode==='signup'){
    title.textContent=t('btnSignup');
    btn.textContent=t('btnSignup');
    toggleBtn.textContent=lang==='ko'?'이미 계정이 있으신가요? 로그인':'Already have an account? Login';
  }else{
    title.textContent=t('btnLogin');
    btn.textContent=t('btnLogin');
    toggleBtn.textContent=lang==='ko'?'계정이 없으신가요? 회원가입':'Don\'t have an account? Sign up';
  }
  document.getElementById('auth-email').value='';
  document.getElementById('auth-password').value='';
  document.getElementById('auth-error').style.display='none';
  document.getElementById('auth-modal-overlay').style.display='flex';
}

function closeAuthModal(){
  document.getElementById('auth-modal-overlay').style.display='none';
}

function toggleAuthMode(){
  authMode=authMode==='login'?'signup':'login';
  showAuthModal(authMode);
}

async function authSubmit(){
  const email=document.getElementById('auth-email').value.trim();
  const password=document.getElementById('auth-password').value.trim();
  const errDiv=document.getElementById('auth-error');

  if(!email||!password){
    errDiv.textContent=t('authEmailPassword');
    errDiv.style.display='block';
    return;
  }

  try{
    if(!sb){
      errDiv.textContent=t('authSupabaseError');
      errDiv.style.display='block';
      return;
    }

    if(authMode==='signup'){
      const {data,error}=await sb.auth.signUp({email,password});
      if(error) throw error;
      errDiv.textContent=t('authSignupSuccess');
      errDiv.style.color='var(--green)';
      errDiv.style.background='rgba(37,193,122,.15)';
      errDiv.style.borderColor='rgba(37,193,122,.3)';
      errDiv.style.display='block';
      setTimeout(()=>{ closeAuthModal(); checkAuthStatus(); },2000);
    }else{
      const {data,error}=await sb.auth.signInWithPassword({email,password});
      if(error) throw error;
      closeAuthModal();
      checkAuthStatus();
      switchTab('todo',document.querySelector('[data-tab="todo"]'));
      showToast(t('authLoggedIn'));
    }
  }catch(e){
    errDiv.textContent=t('authError')+(e.message||t('authUnknownError'));
    errDiv.style.display='block';
  }
}

async function logoutUser(){
  if(!sb) return;
  try{
    await sb.auth.signOut();
    currentUser=null;
    updateAuthUI();
    showToast(t('authLoggedOut'));
  }catch(e){
    console.warn('Logout error',e);
  }
}

async function checkAuthStatus(){
  if(!sb) return;
  try{
    const {data:{user}}=await sb.auth.getUser();
    if(user){
      currentUser=user;
      updateAuthUI();
      syncFromSupabase();
    }else{
      currentUser=null;
      updateAuthUI();
    }
  }catch(e){
    console.warn('Auth check error',e);
  }
}

function updateAuthUI(){
  const loggedOut=document.getElementById('auth-logged-out');
  const loggedIn=document.getElementById('auth-logged-in');

  if(currentUser){
    loggedOut.style.display='none';
    loggedIn.style.display='block';
    closeAuthModal();
    document.getElementById('user-email').textContent=currentUser.email;
    updateProfileUI();
  }else{
    loggedOut.style.display='block';
    loggedIn.style.display='none';
    showAuthModal('login');
    updateProfileUI();
  }
}

async function signInWithGoogle(){
  if(!sb) return;
  try{
    const {data,error}=await sb.auth.signInWithOAuth({provider:'google'});
    if(error) throw error;
  }catch(e){
    document.getElementById('auth-error').textContent='Google 로그인 오류: '+(e.message||'알 수 없는 오류');
    document.getElementById('auth-error').style.display='block';
  }
}

