document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadProjects();
});

function checkAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('userName').textContent = user.fullName || 'Utilisateur';
}

async function loadProjects() {
  try {
    const res = await axios.get('http://localhost:5000/api/projects');
    displayProjects(res.data.data);
  } catch (err) {
    console.error(err);
    document.getElementById('projectsList').innerHTML = `<p class="text-red-500 text-center py-10">Erreur de chargement des projets.</p>`;
  }
}

function displayProjects(projects) {
  const container = document.getElementById('projectsList');
  if (projects.length === 0) {
    container.innerHTML = `<p class="text-center text-gray-500 py-12">Aucun projet trouvé. Créez votre premier projet !</p>`;
    return;
  }

  let html = '';

  projects.forEach(project => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwner = project.owner && project.owner._id === user._id;
    const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString('fr-FR') : 'Sans date limite';

    html += `
      <div class="card bg-white rounded-3xl shadow p-6">
        <h3 class="text-xl font-semibold">${project.title}</h3>
        <p class="text-gray-600 mt-3 line-clamp-2">${project.description || 'Aucune description'}</p>
        
        <div class="mt-6 text-sm text-gray-500">
          <p>Date limite : ${dueDate}</p>
          <p>Membres : ${project.members.length + 1}</p>
        </div>

        <div class="mt-8 grid grid-cols-3 gap-3">
          <button onclick="viewTasks('${project._id}')" 
                  class="col-span-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium text-sm">
            Tâches
          </button>
          <button onclick="viewActivities('${project._id}')" 
                  class="col-span-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium text-sm">
            Activités
          </button>
          ${isOwner ? `
            <button onclick="toggleInviteForm('${project._id}')" 
                    class="col-span-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium text-sm">
              Inviter
            </button>
          ` : ''}
        </div>

        <!-- Invite Form -->
        <div id="invite-form-${project._id}" class="hidden mt-6 pt-6 border-t">
          <div class="flex gap-3">
            <input type="email" id="email-${project._id}" class="flex-1 px-5 py-3 border rounded-2xl" placeholder="Email du membre">
            <button onclick="inviteMember('${project._id}')" class="px-8 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium">Inviter</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ====================== FUNCTIONS ======================
function toggleCreateForm() {
  const form = document.getElementById('createProjectForm');
  form.classList.toggle('hidden');
}

function toggleInviteForm(projectId) {
  const form = document.getElementById(`invite-form-${projectId}`);
  form.classList.toggle('hidden');
}

async function inviteMember(projectId) {
  const email = document.getElementById(`email-${projectId}`).value.trim();
  if (!email) return alert("Veuillez entrer un email");

  try {
    await axios.post(`http://localhost:5000/api/projects/${projectId}/invite`, { email });
    alert("✅ Membre invité avec succès !");
    document.getElementById(`email-${projectId}`).value = '';
    toggleInviteForm(projectId);
    loadProjects();
  } catch (err) {
    alert(err.response?.data?.message || "Erreur lors de l'invitation");
  }
}

function viewTasks(projectId) {
  window.location.href = `tasks.html?projectId=${projectId}`;
}

function viewActivities(projectId) {
  window.location.href = `activities.html?projectId=${projectId}`;
}

// Create Project Form
document.getElementById('createProjectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    dueDate: document.getElementById('dueDate').value || null
  };

  try {
    await axios.post('http://localhost:5000/api/projects', data);
    alert('🎉 Projet créé avec succès !');
    e.target.reset();
    toggleCreateForm();
    loadProjects();
  } catch (err) {
    alert(err.response?.data?.message || 'Erreur lors de la création');
  }
});

window.logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};