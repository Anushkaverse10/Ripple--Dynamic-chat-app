function getUsers() {
  return JSON.parse(localStorage.getItem('ripple_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('ripple_users', JSON.stringify(users));
}
function getCurrentUser() {
  const u = sessionStorage.getItem('ripple_session');
  if (!u) return null;
  return getUsers().find(x => x.username === u) || null;
}

function requireAuth() {
  const user = getCurrentUser();
  if (!user) window.location.href = getRoot() + 'index.html';
  return user;
}

function getRoot() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

(function () {
  const isIndex = !window.location.pathname.includes('chat.html') &&
                  !window.location.pathname.includes('profile.html');
  if (isIndex && sessionStorage.getItem('ripple_session')) {
    window.location.href = 'chat.html';
  }
})();

function switchTab(tab) {
  const loginPanel  = document.getElementById('loginPanel');
  const signupPanel = document.getElementById('signupPanel');
  const tabLogin    = document.getElementById('tab-login');
  const tabSignup   = document.getElementById('tab-signup');
  if (!loginPanel) return;

  if (tab === 'login') {
    loginPanel.classList.remove('hidden');
    signupPanel.classList.add('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    loginPanel.classList.add('hidden');
    signupPanel.classList.remove('hidden');
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
  }
}

let chosenAvatar = '🐶';

function pickAvatar(btn) {
  document.querySelectorAll('#avatarGrid .av-btn')
    .forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  chosenAvatar = btn.getAttribute('data-av');
}

function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁';
  }
}

function handleSignup() {
  const name     = document.getElementById('signupName')?.value.trim();
  const username = document.getElementById('signupUser')?.value.trim().toLowerCase();
  const bio      = document.getElementById('signupBio')?.value.trim();
  const password = document.getElementById('signupPass')?.value;
  const errEl    = document.getElementById('signupErr');

  if (errEl) errEl.textContent = '';

  // Validation
  if (!name) {
    if (errEl) errEl.textContent = 'Please enter your display name.';
    return;
  }
  if (!username) {
    if (errEl) errEl.textContent = 'Please choose a username.';
    return;
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    if (errEl) errEl.textContent = 'Username: 3-20 chars, letters/numbers/underscores only.';
    return;
  }
  if (!password || password.length < 6) {
    if (errEl) errEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  const users = getUsers();
  if (users.find(u => u.username === username)) {
    if (errEl) errEl.textContent = 'That username is already taken. Try another!';
    return;
  }

  const newUser = {
    username,
    name,
    bio:      bio || '',
    password,
    avatar:   chosenAvatar,
    joinedAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  sessionStorage.setItem('ripple_session', username);
  window.location.href = 'chat.html';
}

function handleLogin() {
  const username = document.getElementById('loginUser')?.value.trim().toLowerCase();
  const password = document.getElementById('loginPass')?.value;
  const errEl    = document.getElementById('loginErr');

  if (errEl) errEl.textContent = '';

  if (!username || !password) {
    if (errEl) errEl.textContent = 'Please fill in both fields.';
    return;
  }

  const user = getUsers().find(u => u.username === username && u.password === password);
  if (!user) {
    if (errEl) errEl.textContent = 'Incorrect username or password.';
    return;
  }

  sessionStorage.setItem('ripple_session', username);
  window.location.href = 'chat.html';
}

// ---- LOGOUT ----
function handleLogout() {
  sessionStorage.removeItem('ripple_session');
  window.location.href = getRoot() + 'index.html';
}
