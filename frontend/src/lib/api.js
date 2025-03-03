const API_BASE_URL = 'http://localhost:8000/api';

const request = async (url, method, body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log('Request URL:', `${API_BASE_URL}${url}`);
  console.log('Request Method:', method);
  console.log('Request Body:', body);

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  console.log('Response:', response);

  if (!response.ok) {
    const error = await response.json();
    console.log('Error Response:', error);
    throw new Error(error.message || 'Something went wrong');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Auth API
export const authApi = {
  login: async (username, password) => {
    return request('/auth/login', 'POST', { username, password });
  },

  register: async (email, username, password, role) => {
    return request('/auth/register', 'POST', { email, username, password, role });
  },
};

// User API
export const userApi = {
  getAllUsers: async (token) => {
    return request('/users', 'GET', null, token);
  },
};

// Tyre Stock API
export const tyreStockApi = {
  fetchTyreStocks: async () => {
    return request('/tyre-stocks', 'GET');
  },

  addTyreStock: async (stock) => {
    return request('/tyre-stocks', 'POST', stock);
  },

  updateTyreStock: async (id, quantity) => {
    return request(`/tyre-stocks/${id}`, 'PUT', { quantity });
  },

  buyTyreStock: async (id, quantity) => {
    const response = await fetch(`${API_BASE_URL}/tyre-stocks/${id}/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to buy tyre stock');
    }

    return await response.json();
  },

  deleteTyreStock: async (id) => {
    const response = await request(`/tyre-stocks/${id}`, 'DELETE');
    return response;
  },
};