import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import elevatorReducer from './elevatorSlice';
import reportReducer from './reportSlice';
// Додано імпорти
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		elevators: elevatorReducer,
		reports: reportReducer
	}
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// хуки для Redux Toolkit
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
