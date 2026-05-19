let currentProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  getProjectIdFromUrl();
  loadActivities();
});

function checkAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
  }
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('userName').textContent = user.fullName || 'Utilisateur';
}

function getProjectIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  currentProjectId = urlParams.get('projectId');
  if (!currentProjectId) {
    alert("Aucun projet sélectionné");
    window.location.href = 'projects.html';
  }
}

async function loadActivities() {
  try {
    const res = await axios.get(`http://localhost:5000/api/projects/${currentProjectId}/activities`);
    displayTimeline(res.data);
  } catch (err) {
    console.error(err);
    document.getElementById('activityFeed').innerHTML = `
      <p class="text-red-500 text-center py-10">Impossible de charger l'historique.</p>`;
  }
}

function displayTimeline(activities) {
  const container = document.getElementById('activityFeed');
  
  if (activities.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20 text-gray-500">
        <i class="fas fa-clock text-6xl mb-4"></i>
        <p>Aucune activité pour le moment</p>
      </div>`;
    return;
  }

  let html = '';

  activities.forEach((activity, index) => {
    const time = new Date(activity.createdAt).toLocaleString('fr-FR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const icon = getActivityIcon(activity.action);

    html += `
      <div class="relative flex gap-6">
        <div class="absolute left-[-2px] top-8 w-[4px] h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>
        
        <div class="w-14 h-14 flex-shrink-0 ${icon.bg} rounded-2xl flex items-center justify-center text-3xl shadow-md z-10">
          ${icon.emoji}
        </div>
        
        <div class="flex-1 bg-white rounded-3xl shadow p-6">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold">${activity.user.fullName}</p>
              <p class="text-gray-700 mt-1">${activity.description}</p>
            </div>
            <span class="text-xs text-gray-500 whitespace-nowrap">${time}</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function getActivityIcon(action) {
  switch(action) {
    case 'task_created': return { emoji: '📋', bg: 'bg-blue-500 text-white' };
    case 'task_status_changed': return { emoji: '🔄', bg: 'bg-amber-500 text-white' };
    case 'task_deleted': return { emoji: '🗑️', bg: 'bg-red-500 text-white' };
    case 'member_added': return { emoji: '👤', bg: 'bg-green-500 text-white' };
    case 'member_removed': return { emoji: '🚪', bg: 'bg-orange-500 text-white' };
    default: return { emoji: '📌', bg: 'bg-gray-500 text-white' };
  }
}

window.logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};