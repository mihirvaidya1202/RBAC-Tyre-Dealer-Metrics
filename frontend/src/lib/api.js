const API_BASE_URL = 'http://localhost:8000/api';

const request = async (url, method, body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    let responseData;
    const contentType = response.headers.get("Content-Type");

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      console.warn('Non-JSON response received.');
      responseData = null;
    }

    if (!response.ok) {
      console.error('API Request Error:', responseData?.message || response.statusText);
      throw new Error(responseData?.message || `Error ${response.status}: ${response.statusText}`);
    }

    return responseData;
  } catch (error) {
    console.error('API Fetch Error:', error.message);
    throw new Error(error.message || 'Failed to fetch data');
  }
};

export const authApi = {
  login: async (credentials) => request('/auth/login', 'POST', credentials),
  register: async (userData) => request('/auth/register', 'POST', userData),
  refreshToken: async (refreshToken) => request('/auth/refresh-token', 'POST', { refreshToken }),
  logout: async (token) => request('/auth/logout', 'POST', null, token),
};

export const tyreStockApi = {
  fetchTyreStocks: async (token) => request('/tyre-stocks', 'GET', null, token),
  addTyreStock: async (stock, token) => request('/tyre-stocks', 'POST', stock, token),
  buyTyreStock: async (id, quantity, token) => request(`/tyre-stocks/buy/${id}`, 'POST', { quantity }, token),
  deleteTyreStock: async (id, token) => request(`/tyre-stocks/${id}`, 'DELETE', null, token),
  removeFromDealerStock: async (id, token) => request(`/dealer-stock/${id}`, 'DELETE', null, token),
  getDealerStock: async (token) => request('/dealer/stock', 'GET', null, token),
  addToDealerStock: async (stockId, quantity, token) => request('/dealer/stock/add', 'POST', { stockId, quantity }, token),
};

export const analyticsApi = {
  fetchAdminAnalytics: async (token) => request('/admin/analytics', 'GET', null, token),
  fetchDealerAnalytics: async (token) => request('/dealer/analytics', 'GET', null, token),
};

export const tyresApi = {
  getAllTyres: async (token) => request('/tyres', 'GET', null, token),
  getTyreDetails: async (tyreModel, token) => {
    if (!tyreModel) {
      console.error("Tyre model is undefined");
      return null;
    }
    return request(`/tyres/${encodeURIComponent(tyreModel)}`, 'GET', null, token);
  },
  buyTyre: async (dealerId, tyreModel, quantity, token) => request('/buy', 'POST', { dealerId, tyreModel, quantity }, token),
};