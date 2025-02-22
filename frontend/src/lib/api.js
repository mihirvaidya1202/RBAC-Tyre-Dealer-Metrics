const API_BASE_URL = 'http://localhost:8000/api';
const request = async (url, method, body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

export const authApi = {
  login: async (username, password) => {
    return request('/auth/login', 'POST', { username, password });
  },

  register: async (username, password, role) => {
    return request('/auth/register', 'POST', { username, password, role });
  },
};

export const userApi = {
  getAllUsers: async (token) => {
    return request('/users', 'GET', null, token);
  },
};