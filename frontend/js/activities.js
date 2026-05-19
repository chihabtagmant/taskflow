const token = localStorage.getItem('token');

// Redirect to login if not logged in
if (!token) {
  window.location.href = '../pages/Login.html';
}

// ── HELPER: "il y a 2 heures" ─────────────────────────────────
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'à l\'instant';
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} heures`;
  return `il y a ${Math.floor(seconds / 86400)} jours`;
}

// ── HELPER: human readable activity text ──────────────────────
function formatActivity(activity) {
  const who = activity.user?.name || 'Quelqu\'un';
  const when = timeAgo(activity.createdAt);
  const d = activity.details || {};

  switch (activity.actionType) {
    case 'task_created':
      return `${who} a créé la tâche "${d.taskTitle || ''}" — ${when}`;
    case 'task_deleted':
      return `${who} a supprimé la tâche "${d.taskTitle || ''}" — ${when}`;
    case 'status_changed':
      return `${who} a changé le statut de "${d.taskTitle || ''}" à ${d.newStatus || ''} — ${when}`;
    case 'member_added':
      return `${who} a ajouté un membre au projet — ${when}`;
    case 'member_removed':
      return `${who} a retiré un membre du projet — ${when}`;
    case 'project_updated':
      return `${who} a modifié le projet — ${when}`;
    default:
      return `${who} a effectué une action — ${when}`;
  }
}

// ── LOAD PROJECTS into the dropdown ───────────────────────────
async function loadProjects() {
  try {
    const res = await axios.get('/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const select = document.getElementById('project-select');
    const projects = res.data.data || res.data;

    projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project._id;
      option.textContent = project.title;
      select.appendChild(option);
    });

  } catch (err) {
    console.error('Erreur chargement projets:', err);
  }
}

// ── LOAD ACTIVITIES for selected project ──────────────────────
async function loadActivities() {
  const projectId = document.getElementById('project-select').value;
  const list = document.getElementById('activity-list');

  if (!projectId) {
    list.innerHTML = '<li style="color:gray;">Sélectionnez un projet pour voir ses activités.</li>';
    return;
  }

  list.innerHTML = '<li style="color:gray;">Chargement...</li>';

  try {
    const res = await axios.get(`/api/projects/${projectId}/activities`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const activities = res.data;

    if (activities.length === 0) {
      list.innerHTML = '<li style="color:gray;">Aucune activité pour ce projet.</li>';
      return;
    }

    list.innerHTML = activities.map(a => `
      <li style="
        padding:14px;
        border-bottom:1px solid #eee;
        display:flex;
        align-items:center;
        gap:12px;
      ">
        <span style="font-size:20px;">📌</span>
        <span>${formatActivity(a)}</span>
      </li>
    `).join('');

  } catch (err) {
    list.innerHTML = '<li style="color:red;">Erreur lors du chargement des activités.</li>';
    console.error(err);
  }
}

// ── LOGOUT ────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../index.html';
}

// ── NOTIFICATION BELL ─────────────────────────────────────────
function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// ── START ──────────────────────────────────────────────────────
loadProjects();