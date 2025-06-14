import api from './api';
import { Building } from '../types/types';

export const fetchBuilding = async (id: string): Promise<Building> => {
	const { data } = await api.get(`/buildings/${id}/`);
	return data;
};
