document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadProjects();
});

function checkAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
  }
}

async function loadProjects() {
  try {
    const res = await axios.get('http://localhost:5000/api/projects');
    displayProjects(res.data.data);
  } catch (err) {
    console.error(err);
    document.getElementById('projectsList').innerHTML = '<p>Erreur de chargement.</p>';
  }
}

function displayProjects(projects) {
  const container = document.getElementById('projectsList');
  if (projects.length === 0) {
    container.innerHTML = '<p>Aucun projet. Créez-en un !</p>';
    return;
  }

  let html = '';

  projects.forEach(project => {
    const isOwner = project.owner._id === JSON.parse(localStorage.getItem('user'))._id;
    const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString('fr-FR') : '—';

    html += `
      <div class="card">
        <h4>${project.title}</h4>
        <p>${project.description || 'Aucune description'}</p>
        <p><strong>Statut :</strong> ${project.status} | 
           <strong>Date limite :</strong> ${dueDate}</p>
        <p><strong>Membres :</strong> ${project.members.length + 1}</p>

        <div style="margin-top: 10px;">
          <button onclick="viewTasks('${project._id}')">Voir Tâches</button>
          
          ${isOwner ? `
            <button onclick="showInviteForm('${project._id}')">Inviter un membre</button>
            <button onclick="deleteProject('${project._id}')" style="background:#dc3545;color:white;">Supprimer</button>
          ` : ''}
        </div>

        <!-- Invite Form (hidden initially) -->
        <div id="invite-form-${project._id}" style="display:none; margin-top:10px;">
          <input type="email" id="email-${project._id}" placeholder="Email du membre" />
          <button onclick="inviteMember('${project._id}')">Inviter</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Invite Member
async function inviteMember(projectId) {
  const email = document.getElementById(`email-${projectId}`).value;
  if (!email) return alert("Veuillez entrer un email");

  try {
    await axios.post(`http://localhost:5000/api/projects/${projectId}/invite`, { email });
    alert("✅ Membre invité avec succès !");
    document.getElementById(`invite-form-${projectId}`).style.display = 'none';
    loadProjects(); // Refresh
  } catch (err) {
    alert(err.response?.data?.message || "Erreur lors de l'invitation");
  }
}

function showInviteForm(projectId) {
  const form = document.getElementById(`invite-form-${projectId}`);
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// View Tasks
function viewTasks(projectId) {
  window.location.href = `tasks.html?projectId=${projectId}`;
}

// Delete Project
async function deleteProject(projectId) {
  if (!confirm("Supprimer ce projet et toutes ses tâches ?")) return;
  try {
    await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
    loadProjects();
  } catch (err) {
    alert("Erreur lors de la suppression");
  }
}

// Create Project (same as before)
document.getElementById('createProjectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    dueDate: document.getElementById('dueDate').value || null
  };

  try {
    await axios.post('http://localhost:5000/api/projects', data);
    alert('Projet créé !');
    e.target.reset();
    loadProjects();
  } catch (err) {
    alert('Erreur lors de la création');
  }
});