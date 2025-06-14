import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';

const api = axios.create({
	baseURL: '/api',
	withCredentials: true,
	maxRedirects: 0 // disable automatic redirects to preserve Authorization header
});

// Attach JWT to all requests
api.interceptors.request.use((config) => {
	const token = store.getState().auth.token;
	if (token) {
		// AxiosRequestHeaders is a class; we can set Authorization this way:
		if (config.headers) {
			// @ts-ignore
			config.headers['Authorization'] = `Bearer ${token}`;
		} else {
			// @ts-ignore
			config.headers = { Authorization: `Bearer ${token}` };
		}
	}
	return config;
});

// Handle redirects and unauthorized responses
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		// Manually follow 308 redirect to preserve headers
		if (error.response?.status === 308) {
			const location = error.response.headers.location;
			if (location) {
				return api.request({
					...error.config,
					url: location,
					method: 'get'
				});
			}
		}
		// On 401, logout and redirect to login page
		if (error.response?.status === 401) {
			store.dispatch(logout());
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default api;
