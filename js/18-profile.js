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

  const deleteBtn = document.getElementById('delete-avatar-btn');
  if (profile.avatar) {
    avatarImg.src = profile.avatar;
    avatarImg.style.display = 'block';
    avatarEmpty.style.display = 'none';
    if (deleteBtn) deleteBtn.style.display = 'block';
  } else {
    avatarImg.style.display = 'none';
    avatarEmpty.style.display = 'flex';
    if (deleteBtn) deleteBtn.style.display = 'none';
  }
}

async function handleAvatarUpload(file) {
  if (!file || !currentUser) return;
  if (!file.type.startsWith('image/')) {
    showToast(lang === 'ko' ? '이미지 파일을 선택해주세요' : 'Please select an image file');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast(lang === 'ko' ? '파일 크기가 5MB 이하여야 합니다' : 'File size must be less than 5MB');
    return;
  }

  if (sb) {
    showToast(lang === 'ko' ? '업로드 중...' : 'Uploading...');
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${currentUser.id}/avatar.${ext}`;
    const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { showToast(lang === 'ko' ? '업로드 실패: ' + error.message : 'Upload failed: ' + error.message); return; }
    const { data: urlData } = sb.storage.from('avatars').getPublicUrl(path);
    const url = urlData.publicUrl;
    const profiles = load(KEY_PROFILE) || {};
    profiles[currentUser.id] = { ...loadProfile(), avatar: url };
    ls(KEY_PROFILE, profiles);
    sb.from('profiles').upsert([{ id: currentUser.id, avatar_url: url }]);
    renderProfile();
    showToast(t('saved'));
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      const profiles = load(KEY_PROFILE) || {};
      profiles[currentUser.id] = { ...loadProfile(), avatar: e.target.result };
      ls(KEY_PROFILE, profiles);
      renderProfile();
      showToast(t('saved'));
    };
    reader.readAsDataURL(file);
  }
}

async function deleteAvatar() {
  if (!currentUser) return;
  if (sb) {
    const profile = loadProfile();
    if (profile?.avatar) {
      const url = profile.avatar;
      const parts = url.split('/avatars/');
      if (parts[1]) await sb.storage.from('avatars').remove([decodeURIComponent(parts[1])]);
    }
    sb.from('profiles').upsert([{ id: currentUser.id, avatar_url: null }]);
  }
  const profiles = load(KEY_PROFILE) || {};
  if (profiles[currentUser.id]) profiles[currentUser.id].avatar = '';
  ls(KEY_PROFILE, profiles);
  renderProfile();
  showToast(t('deleted'));
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
