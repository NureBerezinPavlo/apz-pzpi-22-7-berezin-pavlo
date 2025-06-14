import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
	allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
	const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		// Додаткова перевірка токена
		const token = localStorage.getItem('token');
		if (token) {
			setLoading(false);
		} else {
			setLoading(false);
		}
	}, []);

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
				<CircularProgress />
			</Box>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (allowedRoles && user && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
