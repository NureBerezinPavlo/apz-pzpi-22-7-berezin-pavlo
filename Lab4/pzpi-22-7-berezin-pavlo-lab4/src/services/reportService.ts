import api from './api';
import { CriticalStopReport, DowntimeReport, UsageReport } from '../types/reports';

export const fetchCriticalStops = async (): Promise<CriticalStopReport[]> => {
	try {
		const response = await api.get('/reports/critical-stops');
		console.log('Downtimes payload:', response);
		return response.data;
	} catch (error) {
		throw new Error('Failed to fetch critical stops');
	}
};

export const fetchDowntimes = async (): Promise<DowntimeReport[]> => {
	try {
		const response = await api.get('/reports/downtimes');
		console.log('Downtimes payload:', response);
		return response.data;
	} catch (error) {
		throw new Error('Failed to fetch downtimes');
	}
};

export const fetchUsageRanking = async (): Promise<UsageReport[]> => {
	try {
		// Запит до бекенду за рейтингом використання
		const response = await api.get('/reports/usage');
		console.log('Downtimes payload:', response);
		return response.data;
	} catch (error) {
		throw new Error('Failed to fetch usage ranking');
	}
};

export const exportReport = async (reportType: string, format: 'pdf' | 'excel') => {
	try {
		const response = await api.get(`/reports/export/${reportType}`, {
			responseType: 'blob',
			params: { format }
		});

		const extension = format === 'pdf' ? 'pdf' : 'xlsx';
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `report_${new Date().toISOString()}.${extension}`);
		document.body.appendChild(link);
		link.click();
		link.remove();
	} catch (error) {
		throw new Error('Export failed');
	}
};
