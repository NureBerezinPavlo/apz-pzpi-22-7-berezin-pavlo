import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchElevators } from '../store/elevatorSlice';
import Grid from '@mui/material/GridLegacy';
import Header from '../components/layout/Header';
import SummaryWidget from '../components/dashboard/SummaryWidget';
import ElevatorStatusCard from '../components/dashboard/ElevatorStatusCard';
import SensorChart from '../components/dashboard/SensorChart';
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useDispatch<AppDispatch>();
	const { elevators, loading, error } = useSelector((state: RootState) => state.elevators);

	useEffect(() => {
		dispatch(fetchElevators());
	}, [dispatch]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div>
			{/* Контейнер сітки */}
			<Grid container spacing={3} sx={{ p: 3 }}>
				{/* Картки з показниками */}
				<Grid item xs={12} md={6} lg={3}>
					<SummaryWidget title={t('elevatorCard.general')} value={elevators.length} icon="elevator" />
				</Grid>
				<Grid item xs={12} md={6} lg={3}>
					<SummaryWidget title={t('elevatorCard.check')} value={elevators.filter((e) => e.status === 'active').length} icon="check" color="success" />
				</Grid>
				<Grid item xs={12} md={6} lg={3}>
					<SummaryWidget title={t('elevatorCard.repair')} value={elevators.filter((e) => e.status === 'maintenance').length} icon="build" color="warning" />
				</Grid>
				<Grid item xs={12} md={6} lg={3}>
					<SummaryWidget title={t('elevatorCard.warning')} value={elevators.filter((e) => e.status === 'critical').length} icon="warning" color="error" />
				</Grid>

				{/* Таблиця стану ліфтів */}
				<Grid item xs={12} md={8}>
					<ElevatorStatusCard elevators={elevators} />
				</Grid>

				{/* Графік сенсорних даних */}
				<Grid item xs={12} md={4}>
					<SensorChart
						title={t('elevatorCard.temperatureStatistics')}
						data={elevators.map((e) => ({
							name: e.serial_number,
							value: e.lastReading?.temperature || 0
						}))}
					/>
				</Grid>
			</Grid>
		</div>
	);
};

export default DashboardPage;
