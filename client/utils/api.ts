// client/utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',  // ← server is on 3000
  withCredentials: true,                // to send/receive cookies
});

export default api;
