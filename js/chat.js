const ME = requireAuth(); 

function getAllMsgs() {
  return JSON.parse(localStorage.getItem('ripple_msgs') || '{}');
}
function saveAllMsgs(data) {
  localStorage.setItem('ripple_msgs', JSON.stringify(data));
}

function convKey(a, b) {
  return [a, b].sort().join('__');
}
function getConv(other) {
  return getAllMsgs()[convKey(ME.username, other)] || [];
}
function saveConv(other, msgs) {
  const all = getAllMsgs();
  all[convKey(ME.username, other)] = msgs;
  saveAllMsgs(all);
}

let activeChatUser = null;
let selectedIds    = [];

window.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  const who = new URLSearchParams(window.location.search).get('with');
  if (who) {
    const u = getUsers().find(x => x.username === who);
    if (u && u.username !== ME.username) openChat(u);
  }
});

function renderSidebar() {
  document.getElementById('meAv').textContent   = ME.avatar;
  document.getElementById('meName').textContent = ME.name;
  document.getElementById('meUser').textContent = '@' + ME.username;

  const others = getUsers().filter(u => u.username !== ME.username);
  const list   = document.getElementById('userList');
  list.innerHTML = '';

  if (!others.length) {
    list.innerHTML = '<p style="padding:16px;font-size:0.8rem;color:rgba(255,255,255,0.35)">No other users yet.<br/>Ask a friend to sign up!</p>';
    return;
  }

  const allMsgs = getAllMsgs();
  others.sort((a, b) => {
    const la = (allMsgs[convKey(ME.username, a.username)] || []).slice(-1)[0]?.timestamp || 0;
    const lb = (allMsgs[convKey(ME.username, b.username)] || []).slice(-1)[0]?.timestamp || 0;
    return lb - la;
  });

  others.forEach(user => {
    const msgs    = allMsgs[convKey(ME.username, user.username)] || [];
    const visible = msgs.filter(m => !m.deletedForAll && !(m.deletedFor || []).includes(ME.username));
    const last    = visible.slice(-1)[0];
    const unread  = msgs.filter(m => m.to === ME.username && !(m.readBy || []).includes(ME.username) && !m.deletedForAll).length;

    const row = document.createElement('div');
    row.className = 'user-row' + (activeChatUser?.username === user.username ? ' active' : '');
    row.dataset.username = user.username;
    row.onclick = () => openChat(user);

    row.innerHTML = `
      <div class="av av-sm">${user.avatar}</div>
      <div class="user-row-info">
        <p class="user-row-name">${esc(user.name)}</p>
        <p class="user-row-preview">${last ? (last.from === ME.username ? 'You: ' : '') + esc(last.text) : '@' + user.username}</p>
      </div>
      ${unread ? '<div class="unread-dot"></div>' : ''}
    `;
    list.appendChild(row);
  });
}

function openChat(user) {
  activeChatUser = user;
  selectedIds    = [];

  document.getElementById('chatBarAv').textContent   = user.avatar;
  document.getElementById('chatBarName').textContent = user.name;
  document.getElementById('chatBarSub').textContent  = '@' + user.username;
  document.getElementById('profileBtn').style.display = 'flex';

  document.getElementById('inputBar').style.display  = 'block';
  document.getElementById('emptyChat').style.display = 'none';

  markRead(user.username);

  document.querySelectorAll('.user-row').forEach(r => {
    r.classList.toggle('active', r.dataset.username === user.username);
  });

  renderMsgs();
  updateDelBtn();

  if (window.innerWidth <= 720) closeSidebar();

  setTimeout(() => document.getElementById('msgInput').focus(), 80);
}

function markRead(other) {
  const msgs = getConv(other);
  msgs.forEach(m => {
    if (m.to === ME.username) {
      if (!m.readBy) m.readBy = [];
      if (!m.readBy.includes(ME.username)) m.readBy.push(ME.username);
    }
  });
  saveConv(other, msgs);
  renderSidebar();
}

function renderMsgs() {
  const area = document.getElementById('msgsArea');
  area.innerHTML = '';
  if (!activeChatUser) return;

  const msgs = getConv(activeChatUser.username).filter(m => {
    if (m.deletedForAll)                                    return false;
    if ((m.deletedFor || []).includes(ME.username)) return false;
    return true;
  });

  if (!msgs.length) {
    area.innerHTML = `
      <div class="empty-chat" style="flex:1">
        <div class="empty-icon">👋</div>
        <p>Start the conversation!</p>
        <span>Say hello to ${esc(activeChatUser.name)}</span>
      </div>`;
    return;
  }

  let lastDate = '';
  msgs.forEach(msg => {
    const dateStr = new Date(msg.timestamp).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
    if (dateStr !== lastDate) {
      const sep = document.createElement('div');
      sep.className = 'date-sep';
      sep.innerHTML = `<span>${dateStr}</span>`;
      area.appendChild(sep);
      lastDate = dateStr;
    }

    const isSent   = msg.from === ME.username;
    const selected = selectedIds.includes(msg.id);
    const time     = new Date(msg.timestamp).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
    const avEmoji  = isSent ? ME.avatar : activeChatUser.avatar;

    const row = document.createElement('div');
    row.className = 'msg-row ' + (isSent ? 'sent' : 'received');
    row.innerHTML = `
      <div class="msg-av">${avEmoji}</div>
      <div class="msg-group">
        <div class="bubble ${selected ? 'selected' : ''} ${msg.deletedForAll ? 'deleted' : ''}"
             data-id="${msg.id}" onclick="toggleSelect('${msg.id}')">
          ${msg.deletedForAll ? '🚫 Message deleted' : esc(msg.text)}
        </div>
        <span class="msg-time">${time}</span>
      </div>`;
    area.appendChild(row);
  });

  area.scrollTop = area.scrollHeight;
}

function sendMsg() {
  if (!activeChatUser) return;
  const input = document.getElementById('msgInput');
  const text  = input.value.trim();
  if (!text) return;

  const msgs = getConv(activeChatUser.username);
  msgs.push({
    id:           Date.now().toString(),
    from:         ME.username,
    to:           activeChatUser.username,
    text,
    timestamp:    Date.now(),
    readBy:       [ME.username],
    deletedFor:   [],
    deletedForAll: false
  });
  saveConv(activeChatUser.username, msgs);
  input.value = '';
  renderMsgs();
  renderSidebar();
}

function toggleSelect(id) {
  const idx = selectedIds.indexOf(id);
  if (idx === -1) selectedIds.push(id);
  else selectedIds.splice(idx, 1);
  renderMsgs();
  updateDelBtn();
}
function updateDelBtn() {
  const btn = document.getElementById('deleteBtn');
  if (!btn) return;
  if (selectedIds.length) {
    btn.classList.remove('hidden');
    btn.textContent = `🗑 Delete (${selectedIds.length})`;
  } else {
    btn.classList.add('hidden');
  }
}

function deleteSelected() {
  if (!selectedIds.length) return;

  const forAll = confirm(
    `Delete ${selectedIds.length} message(s)?\n\nOK → Delete for EVERYONE\nCancel → Delete only for ME`
  );
  const msgs = getConv(activeChatUser.username);
  msgs.forEach(m => {
    if (!selectedIds.includes(m.id)) return;
    if (forAll && m.from === ME.username) {
      m.deletedForAll = true;
      m.text = '';
    } else {
      if (!m.deletedFor) m.deletedFor = [];
      if (!m.deletedFor.includes(ME.username)) m.deletedFor.push(ME.username);
    }
  });
  saveConv(activeChatUser.username, msgs);
  selectedIds = [];
  renderMsgs();
  renderSidebar();
  updateDelBtn();
}

function goMyProfile() {
  window.location.href = 'profile.html?user=' + ME.username;
}
function viewChatProfile() {
  if (activeChatUser) window.location.href = 'profile.html?user=' + activeChatUser.username;
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
