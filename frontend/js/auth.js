const API_URL = 'http://localhost:5000/api';

// Axios interceptor - adds token automatically
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Main initialization
document.addEventListener('DOMContentLoaded', () => {

  // ====================== REGISTER FORM ======================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value
      };

      try {
        const res = await axios.post(`${API_URL}/auth/register`, data);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        alert('Compte créé avec succès !');
        window.location.href = 'dashboard.html';
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Erreur lors de l\'inscription');
      }
    });
  }

  // ====================== LOGIN FORM ======================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const data = {
        email: document.getElementById('email').value.trim().toLowerCase(),
        password: document.getElementById('password').value
      };

      try {
        const res = await axios.post(`${API_URL}/auth/login`, data);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        window.location.href = 'dashboard.html';
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Email ou mot de passe incorrect');
      }
    });
  }

  // Auto redirect if already logged in
  const token = localStorage.getItem('token');
  if (token && 
      (window.location.pathname.includes('login') || 
       window.location.pathname.includes('register'))) {
    window.location.href = 'dashboard.html';
  }
});

// Global logout function
window.logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};