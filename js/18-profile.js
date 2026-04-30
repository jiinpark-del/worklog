/* ══ Profile ══ */
const KEY_PROFILE = 'wl_profile';

function loadProfile() {
  if (!currentUser) return null;
  const profiles = load(KEY_PROFILE) || {};
  return profiles[currentUser.id] || { name: '', avatar: '' };
}

function renderProfile() {
  if (!currentUser) return;
  const profile = loadProfile();
  const nameInput = document.getElementById('profile-name');
  const avatarImg = document.getElementById('profile-avatar');
  const avatarEmpty = document.getElementById('profile-avatar-empty');

  if (nameInput) nameInput.value = profile.name || '';

  if (profile.avatar) {
    avatarImg.src = profile.avatar;
    avatarImg.style.display = 'block';
    avatarEmpty.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    avatarEmpty.style.display = 'flex';
  }
}

function handleAvatarUpload(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast(lang === 'ko' ? '이미지 파일을 선택해주세요' : 'Please select an image file');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast(lang === 'ko' ? '파일 크기가 5MB 이하여야 합니다' : 'File size must be less than 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    const profiles = load(KEY_PROFILE) || {};
    profiles[currentUser.id] = { ...loadProfile(), avatar: base64 };
    ls(KEY_PROFILE, profiles);
    renderProfile();
    showToast(t('saved'));
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  if (!currentUser) return;
  const name = document.getElementById('profile-name').value.trim();
  const profiles = load(KEY_PROFILE) || {};
  const profile = loadProfile();
  profiles[currentUser.id] = { ...profile, name };
  ls(KEY_PROFILE, profiles);
  if(sb) sb.from('profiles').upsert([{id:currentUser.id,full_name:name}]);
  showToast(t('saved'));
}

function updateProfileUI() {
  const profileBlock = document.getElementById('profile-block');
  if (currentUser) {
    profileBlock.style.display = 'block';
    renderProfile();
  } else {
    profileBlock.style.display = 'none';
  }
}
