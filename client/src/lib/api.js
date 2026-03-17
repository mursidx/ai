import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:3001/api' });
api.interceptors.request.use((cfg)=>{const t=localStorage.getItem('token');if(t) cfg.headers.Authorization=`Bearer ${t}`;return cfg;});
api.interceptors.response.use(r=>r,err=>{if(err.response?.status===401){localStorage.removeItem('token');location.href='/login';}return Promise.reject(err);});
export default api;
