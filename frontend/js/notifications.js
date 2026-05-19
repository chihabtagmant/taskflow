// ── IN-MEMORY STORE ───────────────────────────────────────────
let notifications = [];

// ── TOGGLE PANEL ──────────────────────────────────────────────
function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// ── UPDATE BADGE ──────────────────────────────────────────────
function updateBadge() {
  const unread = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  if (unread > 0) {
    badge.textContent = unread;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

// ── TIME AGO ──────────────────────────────────────────────────
function timeAgoNotif(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'à l\'instant';
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  return `il y a ${Math.floor(seconds / 86400)}j`;
}

// ── RENDER NOTIFICATIONS ──────────────────────────────────────
function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;

  if (notifications.length === 0) {
    list.innerHTML = '<li style="padding:12px; color:gray;">Aucune notification.</li>';
    return;
  }

  list.innerHTML = notifications.map(n => `
    <li
      onclick="markAsRead('${n._id}')"
      style="
        padding:12px;
        border-bottom:1px solid #eee;
        cursor:pointer;
        background:${n.read ? 'white' : '#f0f7ff'};
      "
    >
      <div>${n.message}</div>
      <small style="color:gray;">${timeAgoNotif(n.createdAt)}</small>
    </li>
  `).join('');
}

// ── MARK AS READ ──────────────────────────────────────────────
async function markAsRead(notifId) {
  const token = localStorage.getItem('token');
  try {
    await axios.patch(`/api/notifications/${notifId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const notif = notifications.find(n => n._id === notifId);
    if (notif) notif.read = true;

    archiveToLocalStorage();
    updateBadge();
    renderNotifications();

  } catch (err) {
    console.error('Could not mark as read', err);
  }
}

// ── ARCHIVE TO LOCALSTORAGE ───────────────────────────────────
function archiveToLocalStorage() {
  const readNotifs = notifications.filter(n => n.read);
  localStorage.setItem('readNotifications', JSON.stringify(readNotifs));
}

// ── FETCH NOTIFICATIONS ───────────────────────────────────────
async function fetchNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const archived = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    const archivedIds = archived.map(n => n._id);

    notifications = res.data.map(n => ({
      ...n,
      read: n.read || archivedIds.includes(n._id)
    }));

    updateBadge();
    renderNotifications();

  } catch (err) {
    console.error('Could not fetch notifications', err);
  }
}

// ── START: fetch now then every 30 seconds ────────────────────
fetchNotifications();
setInterval(fetchNotifications, 30000);