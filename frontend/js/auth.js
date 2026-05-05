const API_URL = 'http://localhost:5000/api';

// Set auth token for all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Check if user is logged in on page load
const checkAuth = () => {
  const token = localStorage.getItem('token');
  if (token && window.location.pathname.includes('login') || 
      window.location.pathname.includes('register')) {
    window.location.href = 'dashboard.html';
  }
};

// Register
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  try {
    const res = await axios.post(`${API_URL}/auth/register`, data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert(err.response?.data?.message || 'Registration failed');
  }
});

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  try {
    const res = await axios.post(`${API_URL}/auth/login`, data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data));
    window.location.href = 'dashboard.html';
  } catch (err) {
    alert(err.response?.data?.message || 'Login failed');
  }
});

// Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};