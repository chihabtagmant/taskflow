document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});

async function loadDashboard() {
  try {
    const res = await axios.get('http://localhost:5000/api/dashboard');
    const data = res.data;

    // Stats
    const statsHTML = `
      <div class="stat-card">
        <h3>${data.activeProjects}</h3>
        <p>Projets Actifs</p>
      </div>
      <div class="stat-card">
        <h3>${data.assignedTasks}</h3>
        <p>Tâches Assignées</p>
      </div>
      <div class="stat-card">
        <h3>${data.completedTasks}</h3>
        <p>Tâches Terminées</p>
      </div>
      <div class="stat-card" style="color: #dc3545;">
        <h3>${data.overdueTasks}</h3>
        <p>Tâches en Retard</p>
      </div>
    `;
    document.getElementById('statsContainer').innerHTML = statsHTML;

    // In Progress Tasks
    let tasksHTML = '';
    if (data.inProgressTasks.length === 0) {
      tasksHTML = '<p>Aucune tâche en cours.</p>';
    } else {
      data.inProgressTasks.forEach(task => {
        tasksHTML += `
          <div class="card">
            <strong>${task.title}</strong> - ${task.project?.title || 'Projet'}
            <br><small>Priorité: ${task.priority}</small>
          </div>`;
      });
    }
    document.getElementById('inProgressTasks').innerHTML = tasksHTML;

  } catch (err) {
    console.error(err);
    document.getElementById('statsContainer').innerHTML = '<p>Erreur de chargement du tableau de bord.</p>';
  }
}