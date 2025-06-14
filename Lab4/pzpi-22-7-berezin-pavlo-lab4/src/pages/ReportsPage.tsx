import React, { useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '../hooks';
import { loadCriticalStops, loadDowntimes, loadUsageRanking } from '../store/reportSlice';
import ExportButton from '../components/reports/ExportButton';
import { useTranslation } from 'react-i18next';

const ReportsPage: React.FC = () => {
	const { t } = useTranslation();
	const [tabValue, setTabValue] = React.useState(0);
	const dispatch = useAppDispatch();
	const { criticalStops, downtimes, usage, loadingCriticalStops, loadingDowntimes, loadingUsage, error } = useAppSelector((state) => state.reports);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	useEffect(() => {
		switch (tabValue) {
			case 0:
				if (criticalStops.length === 0 && !loadingCriticalStops) {
					dispatch(loadCriticalStops());
				}
				break;
			case 1:
				if (downtimes.length === 0 && !loadingDowntimes) {
					dispatch(loadDowntimes());
				}
				break;
			case 2:
				if (usage.length === 0 && !loadingUsage) {
					dispatch(loadUsageRanking());
				}
				break;
			default:
				break;
		}
	}, [tabValue]);

	const criticalStopColumns: GridColDef[] = [
		{ field: 'elevator_id', headerName: t('reports.elevator'), width: 120 },
		{ field: 'building_name', headerName: t('elevator.building'), width: 180 },
		{ field: 'stop_start', headerName: t('reports.stopStart'), width: 180 },
		{ field: 'stop_end', headerName: t('reports.stopEnd'), width: 180 },
		{ field: 'duration', headerName: t('reports.duration'), width: 120 },
		{ field: 'reason', headerName: t('reports.reason'), width: 250 }
	];

	const downtimeColumns: GridColDef[] = [
		{ field: 'elevator_id', headerName: t('reports.elevator'), width: 120 },
		{ field: 'serial_number', headerName: t('elevator.serialNumber'), width: 180 },
		{ field: 'total_downtime', headerName: t('reports.totalDowntime'), width: 150 },
		{ field: 'incidents', headerName: t('reports.incidentsCount'), width: 150 }
	];

	const usageColumns: GridColDef[] = [
		{ field: 'elevator_id', headerName: t('reports.elevator'), width: 120 },
		{ field: 'serial_number', headerName: t('elevator.serialNumber'), width: 180 },
		{ field: 'usage_count', headerName: t('reports.usageCount'), width: 120 }
	];

	const getReportData = () => {
		switch (tabValue) {
			case 0:
				return criticalStops;
			case 1:
				return downtimes;
			case 2:
				return usage;
			default:
				return [];
		}
	};

	const getColumns = () => {
		switch (tabValue) {
			case 0:
				return criticalStopColumns;
			case 1:
				return downtimeColumns;
			case 2:
				return usageColumns;
			default:
				return [];
		}
	};

	const getReportType = () => {
		switch (tabValue) {
			case 0:
				return 'critical-stops';
			case 1:
				return 'downtimes';
			case 2:
				return 'usage';
			default:
				return '';
		}
	};

	const isLoading = () => {
		switch (tabValue) {
			case 0:
				return loadingCriticalStops;
			case 1:
				return loadingDowntimes;
			case 2:
				return loadingUsage;
			default:
				return false;
		}
	};

	const reportData = getReportData();

	return (
		<div>
			<Box sx={{ p: 3 }}>
				<Typography variant="h4" gutterBottom>
					{t('reports.title')}
				</Typography>

				<Tabs value={tabValue} onChange={handleChange} sx={{ mb: 3 }}>
					<Tab label={t('reports.tabs.criticalStops')} />
					<Tab label={t('reports.tabs.downtimes')} />
					<Tab label={t('reports.tabs.usage')} />
				</Tabs>

				{error && (
					<Typography color="error" sx={{ mb: 2 }}>
						{error}
					</Typography>
				)}

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
					<ExportButton reportType={getReportType()} />
				</Box>

				{isLoading() ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
						<CircularProgress />
					</Box>
				) : reportData.length === 0 ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
						<Typography variant="body1">{t('reports.noData')}</Typography>
					</Box>
				) : (
					<Paper elevation={2} sx={{ p: 2, height: 500, mb: 3 }}>
						<DataGrid
							rows={reportData}
							columns={getColumns()}
							pageSizeOptions={[5, 10, 25, 100]}
							disableRowSelectionOnClick
							getRowId={(row) => (tabValue === 0 ? row.id : `${row.elevator_id}-${row.serial_number}`)}
							pagination
							initialState={{
								pagination: {
									paginationModel: { page: 0, pageSize: 10 }
								}
							}}
						/>
					</Paper>
				)}
			</Box>
		</div>
	);
};

export default ReportsPage;
