let currentProjectId = null;
let projectMembers = [];
let currentPage = 1;
let notifications = [];

// ====================== AUTH ======================
function checkAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('userName').textContent = user.fullName || 'Utilisateur';
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  getProjectIdFromUrl();
  loadProjectMembers();
  loadTasks();
  loadActivities();
  setupAutoSave();
  startNotificationPolling();
});

function getProjectIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  currentProjectId = urlParams.get('projectId');
  if (!currentProjectId) {
    alert("Aucun projet sélectionné !");
    window.location.href = 'projects.html';
  }
}

// ====================== MEMBERS ======================
async function loadProjectMembers() {
  try {
    const res = await axios.get(`http://localhost:5000/api/projects/${currentProjectId}/members`);
    projectMembers = res.data;
  } catch (err) {
    console.error("Failed to load members", err);
  }
}

// ====================== TASKS ======================
async function loadTasks(page = 1) {
  currentPage = page;
  const search = document.getElementById('searchInput')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';
  const priority = document.getElementById('priorityFilter')?.value || '';

  try {
    let url = `http://localhost:5000/api/projects/${currentProjectId}/tasks?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;
    if (priority) url += `&priority=${priority}`;

    const res = await axios.get(url);
    displayTasks(res.data.data);
  } catch (err) {
    console.error(err);
    document.getElementById('tasksList').innerHTML = `<p class="text-red-500 text-center py-8">Erreur de chargement.</p>`;
  }
}

function displayTasks(tasks) {
  const container = document.getElementById('tasksList');
  if (tasks.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center py-8">Aucune tâche trouvée.</p>`;
    return;
  }

  let html = '';
  tasks.forEach(task => {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '—';
    const assignedName = task.assignedTo ? task.assignedTo.fullName : 'Non assigné';

    html += `
      <div class="task-card bg-white rounded-3xl shadow p-6">
        <h4 class="font-semibold text-lg">${task.title}</h4>
        <p class="text-gray-600 mt-2">${task.description || 'Aucune description'}</p>
        
        <div class="mt-4 flex flex-wrap gap-4 text-sm">
          <span class="px-4 py-1 bg-blue-100 text-blue-700 rounded-full">${task.priority}</span>
          <span class="px-4 py-1 ${task.status === 'terminé' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} rounded-full">
            ${task.status}
          </span>
          <span class="text-gray-500">Échéance: ${dueDate}</span>
        </div>

        <div class="mt-5">
          <strong class="text-sm">Assigné à :</strong>
          <select onchange="assignTaskToUser('${task._id}', this.value)" class="ml-3 px-4 py-2 border rounded-xl focus:outline-none">
            <option value="">Non assigné</option>
            ${projectMembers.map(m => `
              <option value="${m._id}" ${task.assignedTo && task.assignedTo._id === m._id ? 'selected' : ''}>
                ${m.fullName}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="mt-6 flex gap-3">
          <button onclick="updateStatus('${task._id}', 'en cours')" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm">En cours</button>
          <button onclick="updateStatus('${task._id}', 'terminé')" class="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-sm">Terminé</button>
          <button onclick="deleteTask('${task._id}')" class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm">Supprimer</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ====================== NOTIFICATIONS ======================
function toggleNotifications() {
  const panel = document.getElementById('notificationPanel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) loadNotifications();
}

async function loadNotifications() {
  try {
    const res = await axios.get('http://localhost:5000/api/notifications');
    notifications = res.data;
    displayNotifications(notifications);
    updateBadge();
  } catch (err) {
    console.error(err);
  }
}

function displayNotifications(notifs) {
  const container = document.getElementById('notificationsList');
  if (!container) return;
  if (notifs.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center py-6">Aucune notification</p>`;
    return;
  }
  let html = '';
  notifs.forEach(n => {
    html += `
      <div onclick="markAsRead('${n._id}')" class="p-4 hover:bg-gray-50 rounded-2xl cursor-pointer ${n.isRead ? 'opacity-70' : 'bg-blue-50'}">
        <p class="font-medium">${n.title}</p>
        <p class="text-sm text-gray-600">${n.message}</p>
        <p class="text-xs text-gray-500 mt-2">${new Date(n.createdAt).toLocaleString('fr-FR')}</p>
      </div>
    `;
  });
  container.innerHTML = html;
}

async function markAsRead(id) {
  try {
    await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);
    loadNotifications();
  } catch (err) {
    console.error(err);
  }
}

function updateBadge() {
  const unread = notifications.filter(n => !n.isRead).length;
  const badge = document.getElementById('notificationBadge');
  if (unread > 0) {
    badge.textContent = unread;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function startNotificationPolling() {
  setInterval(() => {
    if (localStorage.getItem('token')) loadNotifications();
  }, 30000);
}

// ====================== AUTO SAVE DRAFT ======================
function setupAutoSave() {
  const form = document.getElementById('taskForm');
  if (!form) return;

  ['taskTitle', 'taskDescription', 'priority', 'taskDueDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', saveDraft);
  });
  loadDraft();
}

function saveDraft() {
  const draft = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    priority: document.getElementById('priority').value,
    dueDate: document.getElementById('taskDueDate').value
  };
  localStorage.setItem(`draft_${currentProjectId}`, JSON.stringify(draft));
}

function loadDraft() {
  const saved = localStorage.getItem(`draft_${currentProjectId}`);
  if (!saved) return;
  const draft = JSON.parse(saved);
  if (confirm("Un brouillon a été trouvé. Restaurer ?")) {
    document.getElementById('taskTitle').value = draft.title || '';
    document.getElementById('taskDescription').value = draft.description || '';
    document.getElementById('priority').value = draft.priority || 'moyenne';
    document.getElementById('taskDueDate').value = draft.dueDate || '';
  }
}

function clearDraft() {
  localStorage.removeItem(`draft_${currentProjectId}`);
}

// ====================== FORM & ACTIONS ======================
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById('taskTitle').value.trim(),
    description: document.getElementById('taskDescription').value.trim(),
    priority: document.getElementById('priority').value,
    dueDate: document.getElementById('taskDueDate').value || null
  };

  try {
    await axios.post(`http://localhost:5000/api/projects/${currentProjectId}/tasks`, data);
    alert('✅ Tâche ajoutée avec succès !');
    e.target.reset();
    clearDraft();
    loadTasks();
    loadActivities();
  } catch (err) {
    alert(err.response?.data?.message || 'Erreur lors de la création');
  }
});

async function updateStatus(taskId, status) {
  try {
    await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, { status });
    loadTasks(currentPage);
    loadActivities();
  } catch (err) {
    alert('Erreur lors de la mise à jour');
  }
}

async function assignTaskToUser(taskId, userId) {
  try {
    await axios.patch(`http://localhost:5000/api/tasks/${taskId}/assign`, { assignedTo: userId || null });
    loadTasks(currentPage);
    loadActivities();
  } catch (err) {
    alert("Erreur lors de l'assignation");
  }
}

async function deleteTask(taskId) {
  if (!confirm('Supprimer cette tâche ?')) return;
  try {
    await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
    loadTasks(currentPage);
    loadActivities();
  } catch (err) {
    alert('Erreur lors de la suppression');
  }
}

function applyFilters() { loadTasks(1); }

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('priorityFilter').value = '';
  loadTasks(1);
}

// ====================== ACTIVITY FEED ======================
async function loadActivities() {
  try {
    const res = await axios.get(`http://localhost:5000/api/projects/${currentProjectId}/activities`);
    displayActivities(res.data);
  } catch (err) {
    console.error(err);
  }
}

function displayActivities(activities) {
  const container = document.getElementById('activityFeed');
  if (!container) return;
  if (activities.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center py-8">Aucune activité récente.</p>`;
    return;
  }

  let html = '';
  activities.forEach(activity => {
    const time = new Date(activity.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
    html += `
      <div class="bg-white p-5 rounded-2xl shadow flex gap-4">
        <div class="w-9 h-9 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
          <i class="fas fa-info"></i>
        </div>
        <div class="flex-1">
          <p class="font-medium">${activity.user.fullName} ${activity.description}</p>
          <p class="text-xs text-gray-500 mt-1">${time}</p>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

window.logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};