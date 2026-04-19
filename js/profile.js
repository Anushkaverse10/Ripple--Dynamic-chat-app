const me = requireAuth();
let viewingUser     = null;
let editChosenAvatar = null;

window.addEventListener('DOMContentLoaded', () => {
  const username = new URLSearchParams(window.location.search).get('user') || me.username;
  loadProfile(username);
});

function loadProfile(username) {
  const user = getUsers().find(u => u.username === username);
  if (!user) {
    document.getElementById('profileCard').innerHTML =
      '<p style="text-align:center;color:var(--gray-400);padding:20px">User not found.</p>';
    return;
  }
  viewingUser = user;

  document.getElementById('profAv').textContent     = user.avatar;
  document.getElementById('profName').textContent   = user.name;
  document.getElementById('profUser').textContent   = '@' + user.username;
  document.getElementById('profBio').textContent    = user.bio || 'No bio yet.';
  document.getElementById('profJoined').textContent =
    'Joined ' + new Date(user.joinedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  if (username === me.username) {
    document.getElementById('editSection').style.display = 'block';
    document.getElementById('msgSection').style.display  = 'none';
    document.title = 'My Profile — Ripple';
    prefillEdit(user);
  } else {
    document.getElementById('editSection').style.display = 'none';
    document.getElementById('msgSection').style.display  = 'block';
  }
}

function prefillEdit(user) {
  document.getElementById('editName').value = user.name;
  document.getElementById('editBio').value  = user.bio || '';
  editChosenAvatar = user.avatar;
  document.querySelectorAll('#editAvatarGrid .av-btn').forEach(btn => {
    if (btn.getAttribute('data-av') === user.avatar) btn.classList.add('selected');
  });
}

function pickEditAvatar(btn) {
  document.querySelectorAll('#editAvatarGrid .av-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  editChosenAvatar = btn.getAttribute('data-av');
}

function saveProfile() {
  const newName = document.getElementById('editName').value.trim();
  const newBio  = document.getElementById('editBio').value.trim();
  const errEl   = document.getElementById('editErr');
  const okEl    = document.getElementById('saveOk');

  errEl.textContent = '';
  okEl.classList.add('hidden');

  if (!newName) { errEl.textContent = 'Name cannot be empty.'; return; }

  const users = getUsers();
  const idx   = users.findIndex(u => u.username === me.username);
  if (idx === -1) return;

  users[idx].name   = newName;
  users[idx].bio    = newBio;
  users[idx].avatar = editChosenAvatar || users[idx].avatar;
  saveUsers(users);

  document.getElementById('profName').textContent = newName;
  document.getElementById('profBio').textContent  = newBio || 'No bio yet.';
  document.getElementById('profAv').textContent   = users[idx].avatar;

  okEl.classList.remove('hidden');
  setTimeout(() => okEl.classList.add('hidden'), 3000);
}

function goChat() {
  if (viewingUser) window.location.href = '../chat.html?with=' + viewingUser.username;
}
