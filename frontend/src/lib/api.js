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
  fetchTyreStocks: async (token) => {
    try {
      const response = await request('/tyre-stocks', 'GET', null, token); // Pass token as the fourth argument
      return response;
    } catch (error) {
      console.error('Error fetching tyre stocks:', error);
      throw new Error('Failed to fetch tyre stocks');
    }
  },
  addTyreStock: async (stock, token) => { return request('/tyre-stocks', 'POST', stock, token);},
  buyTyreStock: async (id, quantity, token) => request(`/tyre-stocks/buy/${id}`, 'POST', { quantity }, token),
  deleteTyreStock: async (id, token) => request(`/tyre-stocks/${id}`, 'DELETE', null, token),
  removeFromDealerStock: async (id, token) => request(`/dealer-stock/${id}`, 'DELETE', null, token),
  getDealerStock: async (token) => request('/dealer/stock', 'GET', null, token),
  addToDealerStock: async (stockId, quantity, token) => { return request('/dealer/stock/add', 'POST', { stockId, quantity }, token);},
};

export const analyticsApi = {
  fetchAdminAnalytics: async (token) => request('/admin/analytics', 'GET', null, token),
  fetchDealerAnalytics: async (token) => request('/dealer/analytics', 'GET', null, token),
};

export const tyresApi = {
  getAllTyres: async () => {
    try {
        const response = await fetch('/api/customer/tyres');

        if (!response.ok) {
            console.error("API Error:", response.statusText);
            throw new Error(`Failed to fetch tyres: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("API Fetch Error:", err);
        throw err;
    }
},
  getTyreDetails: async (tyreModel, token) => request(`/customer/tyres/${encodeURIComponent(tyreModel)}`, 'GET', null, token),
  buyTyre: async (dealerId, tyreModel, quantity, token) => request('/customer/buy', 'POST', { dealerId, tyreModel, quantity }, token),
};