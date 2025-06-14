import api from './api';

export const login = async (email: string, password: string): Promise<{ token: string; user: any }> => {
	try {
		const response = await api.post('/admins/login', { email, password });
		return {
			token: response.data.access_token,
			user: {
				id: response.data.user.id,
				name: response.data.user.username || response.data.user.name,
				role: 'admin' // or get from response if available
			}
		};
	} catch (error) {
		throw new Error('Помилка авторизації');
	}
};

export const logout = async (): Promise<void> => {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
};
