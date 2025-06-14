import api from './api';
import type { Elevator, Building, SensorLog } from '../types/types';

export interface FullElevator extends Elevator {
	building?: Building;
	last_update: string;
	latitude: number;
	longitude: number;
}

/**
 * Повертає масив ліфтів з «вигаданими» координатами
 */
export const fetchElevators = async (): Promise<FullElevator[]> => {
	try {
		const [elevatorsResponse, buildingsResponse] = await Promise.all([api.get<Elevator[]>('/elevators/'), api.get<Building[]>('/buildings/')]);

		const elevators = elevatorsResponse.data;
		const buildings = buildingsResponse.data;

		// Використовуємо Map для коректної типізації
		const buildingsMap = new Map<number, Building>();
		buildings.forEach((building) => {
			buildingsMap.set(building.id, building);
		});

		const CENTER_LAT = 50.005833;
		const CENTER_LNG = 36.229167;

		return elevators.map((elevator, idx) => {
			const OFFSET = 0.02;
			const angle = (idx * 137.5) % 360;
			const radius = OFFSET * ((idx % 10) / 10 + 0.5);
			const latOffset = radius * Math.cos((angle * Math.PI) / 180);
			const lngOffset = radius * Math.sin((angle * Math.PI) / 180);

			return {
				...elevator,
				building: buildings[elevator.building_id],
				latitude: CENTER_LAT + latOffset,
				longitude: CENTER_LNG + lngOffset
			};
		});
	} catch (error) {
		console.error('Помилка завантаження ліфтів:', error);
		throw new Error('Помилка завантаження ліфтів');
	}
};

export const fetchElevatorDetails = async (id: number): Promise<Elevator> => {
	try {
		const response = await api.get(`/elevators/${id}`);
		return response.data;
	} catch (error) {
		throw new Error('Помилка завантаження деталей ліфта');
	}
};

export const updateElevatorStatus = async (id: string, status: string): Promise<void> => {
	try {
		await api.put(`/elevators/${id}`, { status });
	} catch (error) {
		throw new Error('Помилка оновлення статусу ліфта');
	}
};

export const fetchSensorData = async (elevatorId: string): Promise<any> => {
	try {
		const response = await api.get(`/sensors?elevator_id=${elevatorId}`);
		return response.data;
	} catch (error) {
		throw new Error('Помилка завантаження даних сенсорів');
	}
};

export const fetchLastSensorLog = async (elevatorId: number): Promise<SensorLog | null> => {
	console.log('Запит даних для ліфта ID:', elevatorId);

	try {
		const response = await api.get(`/sensors/`, {
			params: {
				elevator_id: elevatorId,
				limit: 1,
				sort: 'timestamp.desc'
			}
		});

		// Додамо логування відповіді
		console.log('Відповідь API:', response.data);

		if (response.data && response.data.length > 0) {
			return response.data[0];
		}
		return null;
	} catch (error) {
		console.error('Помилка запиту до API:', error);
		throw new Error('Помилка завантаження даних сенсорів');
	}
};
