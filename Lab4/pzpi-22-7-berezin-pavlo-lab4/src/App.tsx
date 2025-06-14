import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/layout/MainLayout';

const theme = createTheme({
	palette: {
		primary: {
			main: '#2e7d32'
		},
		secondary: {
			main: '#ff6f00'
		},
		background: {
			default: '#f5f5f5'
		}
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		h4: {
			fontWeight: 600
		}
	}
});

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Routes>
				<Route path="/login" element={<LoginPage />} />

				<Route element={<ProtectedRoute />}>
					<Route element={<MainLayout />}>
						<Route path="/" element={<DashboardPage />} />
						<Route path="/map" element={<MapPage />} />
						<Route path="/reports" element={<ReportsPage />} />
						<Route path="/settings" element={<SettingsPage />} />
					</Route>
				</Route>

				<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
					<Route element={<MainLayout />}>
						<Route path="/admin" element={<AdminPage />} />
					</Route>
				</Route>
			</Routes>
		</ThemeProvider>
	);
}

export default App;
