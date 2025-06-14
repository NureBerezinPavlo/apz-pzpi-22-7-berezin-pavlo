export interface CriticalStopReport {
	id: number;
	elevator_id: number;
	building_id: number;
	building_name: string;
	stop_start: string;
	stop_end: string;
	duration: string;
	reason: string;
}

export interface DowntimeReport {
	elevator_id: number;
	serial_number: string;
	total_downtime: string;
	incidents: number;
}

export interface UsageReport {
	elevator_id: number;
	serial_number: string;
	usage_count: number;
	avg_trips_per_day: number;
}

export interface ReportsState {
	criticalStops: CriticalStopReport[];
	downtimes: DowntimeReport[];
	usage: UsageReport[];
	loading: boolean;
	error: string | null;
}
