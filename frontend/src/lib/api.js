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
  addTyreStock: async (stock, token) => { return request('/tyre-stocks', 'POST', stock, token);},
  buyTyreStock: async (id, quantity, token) => request(`/tyre-stocks/buy/${id}`, 'POST', { quantity }, token),
  deleteTyreStock: async (id, token) => request(`/tyre-stocks/${id}`, 'DELETE', null, token),
  getDealerStock: async (token) => request('/dealer/stock', 'GET', null, token),
  addToDealerStock: async (stockId, quantity, token) => { return request('/dealer/stock/add', 'POST', { stockId, quantity }, token);},
  updateTyreStock: async (id, data, token) =>request(`/tyre-stocks/${id}`, 'PATCH', data, token)
};

export const analyticsApi = {
  fetchAdminAnalytics: async (token) => request('/admin/analytics', 'GET', null, token),
  fetchDealerAnalytics: async (token) => {
    return await request('/dealer/analytics', 'GET', null, token);
  },
};

export const tyresApi = {
  getAllTyres: async (token) => { return await request('/customer/tyres', 'GET', null, token); },
  getTyreDetails: async (tyreModel, tyreSize, token) => { return await request(`/customer/tyres/${encodeURIComponent(tyreModel)}/${tyreSize}`, 'GET', null, token); },
  buyTyre: async (dealerId, tyreId, quantity, token) => { return await request('/customer/buy', 'POST', { dealerId, tyreId, quantity }, token); },
  getPurchaseHistory: async (token) => { return await request('/customer/purchase-history', 'GET', null, token); },
  updateDealerRating: async (token, orderId, { dealerRating }) => {
    return await request('/customer/update-dealer-rating', 'POST', { orderId, dealerRating }, token);
  },
  updateTyreRating: async (token, orderId, { tyreRating }) => {
    return await request('/customer/update-tyre-rating', 'POST', { orderId, tyreRating }, token);
  },
};