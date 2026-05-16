document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadProjects();
});

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  }
}

// Load all projects
async function loadProjects() {
  try {
    const res = await axios.get('http://localhost:5000/api/projects');
    displayProjects(res.data.data);
  } catch (err) {
    console.error(err);
    document.getElementById('projectsList').innerHTML = '<p>Erreur lors du chargement des projets.</p>';
  }
}

// Display projects as cards
function displayProjects(projects) {
  const container = document.getElementById('projectsList');
  
  if (projects.length === 0) {
    container.innerHTML = '<p>Aucun projet trouvé. Créez votre premier projet !</p>';
    return;
  }

  let html = '<h3>Liste des Projets</h3>';
  
  projects.forEach(project => {
    const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString('fr-FR') : 'Pas de date limite';
    
    html += `
      <div class="card">
        <h4>${project.title}</h4>
        <p>${project.description || 'Aucune description'}</p>
        <p><strong>Statut :</strong> ${project.status}</p>
        <p><strong>Date limite :</strong> ${dueDate}</p>
        <p><strong>Membres :</strong> ${project.members?.length || 1}</p>
        <button onclick="viewProject('${project._id}')">Voir Détails</button>
        <button onclick="deleteProject('${project._id}')">Supprimer</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Create new project
document.getElementById('createProjectForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    dueDate: document.getElementById('dueDate').value || null
  };

  try {
    await axios.post('http://localhost:5000/api/projects', data);
    alert('Projet créé avec succès !');
    e.target.reset();
    loadProjects(); // Refresh list
  } catch (err) {
    alert(err.response?.data?.message || 'Erreur lors de la création');
  }
});

// Placeholder functions
function viewProject(id) {
  alert(`Voir projet ${id} - (Fonctionnalité 3+ à implémenter)`);
}

async function deleteProject(id) {
  if (!confirm('Supprimer ce projet ? Toutes les tâches seront également supprimées.')) return;
  
  try {
    await axios.delete(`http://localhost:5000/api/projects/${id}`);
    alert('Projet supprimé');
    loadProjects();
  } catch (err) {
    alert('Erreur lors de la suppression');
  }
}