import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchElevators as fetchElevatorsApi, fetchElevatorDetails, FullElevator } from '../services/elevatorService';
import type { RootState } from '../store';
import { Building } from '../types/types';

interface ElevatorState {
	elevators: FullElevator[];
	loading: boolean;
	error: string | null;
	selectedElevator: FullElevator | null;
	buildings: Building[];
}

const initialState: ElevatorState = {
	elevators: [],
	loading: false,
	error: null,
	selectedElevator: null,
	buildings: []
};

export const fetchElevators = createAsyncThunk('elevators/fetchAll', async (_, { rejectWithValue }) => {
	try {
		return await fetchElevatorsApi();
	} catch (error) {
		return rejectWithValue((error as Error).message);
	}
});

export const fetchElevatorById = createAsyncThunk('elevators/fetchById', async (id: number, { rejectWithValue }) => {
	try {
		const elevator = await fetchElevatorDetails(id);
		const buildingsMap = new Map<number, Building>();

		// Перетворюємо Elevator у FullElevator з дефолтними координатами
		return {
			...elevator,
			latitude: elevator.latitude || 0,
			longitude: elevator.longitude || 0,
			building: buildingsMap.get(elevator.building_id)
		} as FullElevator;
	} catch (error) {
		return rejectWithValue((error as Error).message);
	}
});

const elevatorSlice = createSlice({
	name: 'elevators',
	initialState,
	reducers: {
		selectElevator: (state, action: PayloadAction<number>) => {
			state.selectedElevator = state.elevators.find((e) => e.id === action.payload) || null;
		},
		updateElevatorStatus: (state, action: PayloadAction<{ id: number; status: 'active' | 'maintenance' | 'critical' }>) => {
			const elevator = state.elevators.find((e) => e.id === action.payload.id);
			if (elevator) {
				elevator.status = action.payload.status;
			}
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchElevators.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchElevators.fulfilled, (state, action) => {
				state.loading = false;
				state.elevators = action.payload;
			})
			.addCase(fetchElevators.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(fetchElevatorById.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchElevatorById.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedElevator = action.payload;

				// Оновлюємо ліфт у загальному списку
				const index = state.elevators.findIndex((e) => e.id === action.payload.id);
				if (index !== -1) {
					state.elevators[index] = action.payload;
				}
			})
			.addCase(fetchElevatorById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	}
});

export const { selectElevator, updateElevatorStatus } = elevatorSlice.actions;
export default elevatorSlice.reducer;
