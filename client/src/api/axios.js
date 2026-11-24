import axios from 'axios';

// create a centralized axios instance with base backend url
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// automatically attach jwt token to every outgoing request if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// helper methods for rfq api endpoints
export const rfqAPI = {
  // fetch all rfqs or filter by target area
  getAllRFQs: async (area = '') => {
    const query = area && area !== 'all' ? `?area=${encodeURIComponent(area)}` : '';
    const response = await api.get(`/rfqs${query}`);
    return response.data;
  },

  // fetch single rfq details by uuid
  getRFQById: async (id) => {
    const response = await api.get(`/rfqs/${id}`);
    return response.data;
  },

  // create a new custom rfq order
  createRFQ: async (rfqData) => {
    const response = await api.post('/rfqs', rfqData);
    return response.data;
  },
};

export default api;