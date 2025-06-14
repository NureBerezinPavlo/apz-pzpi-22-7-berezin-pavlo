import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCriticalStops, fetchDowntimes, fetchUsageRanking } from '../services/reportService';

export interface ReportsState {
	criticalStops: CriticalStopReport[];
	downtimes: DowntimeReport[];
	usage: UsageReport[];
	loadingCriticalStops: boolean;
	loadingDowntimes: boolean;
	loadingUsage: boolean;
	error: string | null;
}

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
}

const initialState: ReportsState = {
	criticalStops: [],
	downtimes: [],
	usage: [],
	loadingCriticalStops: false,
	loadingDowntimes: false,
	loadingUsage: false,
	error: null
};

export const loadCriticalStops = createAsyncThunk('reports/loadCriticalStops', async () => {
	return await fetchCriticalStops();
});

export const loadDowntimes = createAsyncThunk('reports/loadDowntimes', async () => {
	return await fetchDowntimes();
});

export const loadUsageRanking = createAsyncThunk('reports/loadUsageRanking', async () => {
	return await fetchUsageRanking();
});

const reportSlice = createSlice({
	name: 'reports',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loadCriticalStops.pending, (state) => {
				state.loadingCriticalStops = true;
				state.error = null;
			})
			.addCase(loadCriticalStops.fulfilled, (state, action) => {
				state.criticalStops = action.payload;
				state.loadingCriticalStops = false;
			})
			.addCase(loadCriticalStops.rejected, (state, action) => {
				state.error = action.error.message || 'Failed to load critical stops';
				state.loadingCriticalStops = false;
			})

			.addCase(loadDowntimes.pending, (state) => {
				state.loadingDowntimes = true;
				state.error = null;
			})
			.addCase(loadDowntimes.fulfilled, (state, action) => {
				state.downtimes = action.payload;
				state.loadingDowntimes = false;
			})
			.addCase(loadDowntimes.rejected, (state, action) => {
				state.error = action.error.message || 'Failed to load downtimes';
				state.loadingDowntimes = false;
			})

			.addCase(loadUsageRanking.pending, (state) => {
				state.loadingUsage = true;
				state.error = null;
			})
			.addCase(loadUsageRanking.fulfilled, (state, action) => {
				state.usage = action.payload;
				state.loadingUsage = false;
			})
			.addCase(loadUsageRanking.rejected, (state, action) => {
				state.error = action.error.message || 'Failed to load usage ranking';
				state.loadingUsage = false;
			});
	}
});

export default reportSlice.reducer;
