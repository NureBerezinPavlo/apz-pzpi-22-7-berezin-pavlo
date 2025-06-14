import api from './api';

export const fetchThresholds = async () => {
	const response = await api.get('/thresholds/');
	return response.data;
};

export const updateThreshold = async (parameter: string, value: number) => {
	await api.put(`/thresholds/${parameter}`, { value });
};

export const createThreshold = async (parameter: string, value: number) => {
	await api.post('/thresholds/', { parameter, value });
};

export const deleteThreshold = async (parameter: string) => {
	await api.delete(`/thresholds/${parameter}`);
};
