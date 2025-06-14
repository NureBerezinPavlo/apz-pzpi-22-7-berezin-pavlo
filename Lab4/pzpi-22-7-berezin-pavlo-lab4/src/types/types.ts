export interface User {
	id: number;
	name: string;
	email: string;
	role: 'admin' | 'technician' | 'resident';
}

export interface Building {
	id: number;
	name: string;
	address: string;
	num_floors: number;
}

export interface Elevator {
	id: number;
	serial_number: string;
	status: 'active' | 'maintenance' | 'critical';
	last_update: string;
	building_id: number;
	install_date: string;
	building?: Building;
	lastReading?: {
		temperature: number;
		humidity: number;
		weight: number;
	};
	latitude?: number;
	longitude?: number;
}

export interface FullElevator extends Elevator {
	building?: Building;
}

export interface SensorLog {
	id: string;
	elevator_id: string;
	timestamp: string;
	temperature: number;
	humidity: number;
	weight: number;
	event_type: string;
	message: string | null;
	is_power_on: boolean;
	is_moving: boolean;
	is_stuck: boolean;
}
