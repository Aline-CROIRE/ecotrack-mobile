import axios from 'axios';

const apiClient = axios.create({
  // REPLACE THIS with your actual Render URL (ensure it ends with /api)
  baseURL: 'https://ecotrack-backend-xksj.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;