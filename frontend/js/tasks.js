const token = localStorage.getItem("token");
const projectId = new URLSearchParams(window.location.search).get("projectId");
const draftKey = `taskDraft_${projectId}`;

let currentPage = 1;

// Check authentication
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
  setupAutoSave();
});

function getProjectIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  currentProjectId = urlParams.get('projectId');
  if (!currentProjectId) {
    alert("Aucun projet sélectionné !");
    window.location.href = 'projects.html';
  }
}

// ====================== LOAD PROJECT MEMBERS ======================
async function loadProjectMembers() {
  try {
    const res = await axios.get(`http://localhost:5000/api/projects/${currentProjectId}/members`);
    projectMembers = res.data;
  } catch (err) {
    console.error("Failed to load members", err);
  }
}

// ====================== LOAD TASKS WITH FILTERS ======================
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
    document.getElementById('tasksList').innerHTML = `<p class="text-red-500">Erreur de chargement des tâches.</p>`;
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
          <select onchange="assignTaskToUser('${task._id}', this.value)" class="ml-2 px-4 py-2 border rounded-xl">
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
// Sauvegarder automatiquement le brouillon
function saveDraft() {
  const draft = {
    title: document.getElementById("title").value,
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value,
    assignedTo: document.getElementById("assignedTo").value,
  };

  localStorage.setItem(draftKey, JSON.stringify(draft));
}

// Restaurer le brouillon au chargement
function restoreDraft() {
  const savedDraft = localStorage.getItem(draftKey);

  if (!savedDraft) {
    return;
  }

  const shouldRestore = confirm("Un brouillon existe. Voulez-vous le restaurer ?");

  if (!shouldRestore) {
    localStorage.removeItem(draftKey);
    return;
  }

  const draft = JSON.parse(savedDraft);

  document.getElementById("title").value = draft.title || "";
  document.getElementById("priority").value = draft.priority || "";
  document.getElementById("status").value = draft.status || "";
  document.getElementById("assignedTo").value = draft.assignedTo || "";
}

document.getElementById("taskForm").addEventListener("input", () => {
  saveDraft();
});

// ====================== FILTERS ======================
function applyFilters() {
  loadTasks(1);
}

  await axios.post(
    "http://localhost:5000/api/tasks",
    {
      title: document.getElementById("title").value,
      priority: document.getElementById("priority").value,
      status: document.getElementById("status").value,
      assignedTo: document.getElementById("assignedTo").value,
      project: projectId,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  localStorage.removeItem(draftKey);
  document.getElementById("taskForm").reset();

  ['taskTitle', 'taskDescription', 'priority', 'taskDueDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', saveDraft);
  });
  loadDraft();


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

// ====================== OTHER FUNCTIONS ======================
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
  } catch (err) {
    alert(err.response?.data?.message || 'Erreur lors de la création');
  }
});

async function updateStatus(taskId, status) {
  try {
    await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, { status });
    loadTasks(currentPage);
  } catch (err) {
    alert('Erreur lors de la mise à jour');
  }
}

// Lancer au chargement
loadMembers();
loadTasks();
restoreDraft();
