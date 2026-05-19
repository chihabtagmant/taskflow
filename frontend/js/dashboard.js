document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('userName').textContent = user.fullName || 'Utilisateur';
  document.getElementById('welcomeName').textContent = user.fullName || 'Utilisateur';

  loadDashboard();
});

async function loadDashboard() {
  try {
    const res = await axios.get('http://localhost:5000/api/dashboard');
    const data = res.data;

    // Stats Cards
    const statsHTML = `
      <div class="stat-card bg-white p-6 rounded-3xl shadow text-center">
        <p class="text-5xl font-bold text-blue-600">${data.activeProjects}</p>
        <p class="text-gray-600 mt-2">Projets Actifs</p>
      </div>
      <div class="stat-card bg-white p-6 rounded-3xl shadow text-center">
        <p class="text-5xl font-bold text-indigo-600">${data.assignedTasks}</p>
        <p class="text-gray-600 mt-2">Tâches Assignées</p>
      </div>
      <div class="stat-card bg-white p-6 rounded-3xl shadow text-center">
        <p class="text-5xl font-bold text-green-600">${data.completedTasks}</p>
        <p class="text-gray-600 mt-2">Tâches Terminées</p>
      </div>
      <div class="stat-card bg-white p-6 rounded-3xl shadow text-center">
        <p class="text-5xl font-bold text-red-600">${data.overdueTasks}</p>
        <p class="text-gray-600 mt-2">En Retard</p>
      </div>
    `;

    document.getElementById('statsContainer').innerHTML = statsHTML;

    // In Progress Tasks
    const tasksContainer = document.getElementById('inProgressTasks');
    if (data.inProgressTasks.length === 0) {
      tasksContainer.innerHTML = `<p class="text-gray-500">Aucune tâche en cours pour le moment.</p>`;
      return;
    }

    let tasksHTML = '';
    data.inProgressTasks.forEach(task => {
      tasksHTML += `
        <div class="task-card bg-white p-6 rounded-3xl shadow">
          <h4 class="font-semibold">${task.title}</h4>
          <p class="text-gray-600 text-sm mt-1">${task.project?.title || 'Projet'}</p>
          <div class="mt-4 flex justify-between items-center">
            <span class="px-4 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
              ${task.priority}
            </span>
            <span class="text-xs text-gray-500">
              ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : ''}
            </span>
          </div>
        </div>
      `;
    });
    tasksContainer.innerHTML = tasksHTML;

  } catch (err) {
    console.error(err);
    document.getElementById('statsContainer').innerHTML = `
      <p class="text-red-500">Impossible de charger le tableau de bord.</p>`;
  }
}