import axios from 'axios';

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not defined");
  return url;
};

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiUrl();
    // Modify config before request is sent (e.g., attach auth token)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized redirect)
    return Promise.reject(error);
  }
);

export default api;
