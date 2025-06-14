import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
	token: string | null;
	user: {
		id: number;
		role: 'admin' | 'technician' | 'resident';
		name: string;
	} | null;
	isAuthenticated: boolean;
}

const initialState: AuthState = {
	token: localStorage.getItem('token') || null,
	user: JSON.parse(localStorage.getItem('user') || 'null'),
	isAuthenticated: !!localStorage.getItem('token')
};

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		loginSuccess(state, action: PayloadAction<{ token: string; user: any }>) {
			state.token = action.payload.token;
			state.user = {
				id: action.payload.user.id,
				name: action.payload.user.name,
				role: action.payload.user.role || 'technician'
			};
			state.isAuthenticated = true;
			localStorage.setItem('token', action.payload.token);
			localStorage.setItem('user', JSON.stringify(state.user));
		},
		logout(state) {
			state.token = null;
			state.user = null;
			state.isAuthenticated = false;
			localStorage.removeItem('token');
			localStorage.removeItem('user');
		}
	}
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
