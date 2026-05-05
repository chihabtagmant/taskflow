document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !user) {
    alert("Vous devez être connecté pour accéder au tableau de bord");
    window.location.href = 'login.html';
    return;
  }

  // Display user info
  document.getElementById('userName').textContent = user.fullName || 'Utilisateur';
  document.getElementById('welcomeName').textContent = user.fullName || 'Utilisateur';
  document.getElementById('welcomeMessage').textContent = 'Voici un résumé de votre activité';
});