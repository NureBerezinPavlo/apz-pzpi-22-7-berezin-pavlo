import React, { useEffect, useState } from 'react';
import { Typography, Button, Chip, Box, CircularProgress } from '@mui/material';
import { FullElevator } from '../../types/types';
import { fetchLastSensorLog } from '../../services/elevatorService';
import { SensorLog } from '../../types/types';
import { useTranslation } from 'react-i18next';

interface MarkerPopupProps {
	elevator: FullElevator;
}

const MarkerPopup: React.FC<MarkerPopupProps> = ({ elevator }) => {
	const { t } = useTranslation();
	const [lastLog, setLastLog] = useState<SensorLog | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'success';
			case 'maintenance':
				return 'warning';
			case 'critical':
				return 'error';
			default:
				return 'default';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'active':
				return t('elevator.statuses.active');
			case 'maintenance':
				return t('elevator.statuses.maintenance');
			case 'critical':
				return t('elevator.statuses.critical');
			default:
				return t('elevator.statuses.unknown');
		}
	};

	useEffect(() => {
		if (elevator?.id && typeof elevator.id === 'number') {
			const fetchData = async () => {
				try {
					setLoading(true);
					setError(null);
					const log = await fetchLastSensorLog(elevator.id);
					setLastLog(log);
				} catch (err) {
					console.error('Error fetching sensor data:', err);
					setError(t('errors.sensorDataLoadFailed'));
				} finally {
					setLoading(false);
				}
			};

			fetchData();
		} else {
			console.warn('Invalid elevator ID:', elevator.id);
			setError(t('errors.invalidElevatorId'));
		}
	}, [elevator.id, t]);

	return (
		<Box sx={{ minWidth: 200 }}>
			<Typography variant="h6" gutterBottom>
				{elevator.serial_number}
			</Typography>
			<Chip label={getStatusText(elevator.status)} color={getStatusColor(elevator.status)} size="small" sx={{ mb: 1 }} />

			{elevator.building && (
				<>
					<Typography variant="body2">
						<strong>{t('elevator.building')}:</strong> {elevator.building.name}
					</Typography>
					<Typography variant="body2">
						<strong>{t('elevator.address')}:</strong> {elevator.building.address}
					</Typography>
				</>
			)}

			<Typography variant="body2">
				<strong>{t('elevator.installed')}:</strong> {elevator.install_date ? new Date(elevator.install_date).toLocaleDateString() : t('common.notAvailable')}
			</Typography>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
					<CircularProgress size={20} />
				</Box>
			) : lastLog ? (
				<Typography variant="body2">
					<strong>{t('elevator.lastCheck')}:</strong> {new Date(lastLog.timestamp).toLocaleString()}
				</Typography>
			) : (
				<Typography variant="body2" color="textSecondary">
					{t('elevator.noCheckData')}
				</Typography>
			)}

			<Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
				<Button variant="outlined" size="small" onClick={() => (window.location.href = `/elevators/${elevator.id}`)}>
					{t('common.details')}
				</Button>
				<Button variant="contained" size="small" color={elevator.status === 'critical' ? 'error' : 'primary'}>
					{elevator.status === 'critical' ? t('elevator.emergency') : t('elevator.report')}
				</Button>
			</Box>
		</Box>
	);
};

export default MarkerPopup;
