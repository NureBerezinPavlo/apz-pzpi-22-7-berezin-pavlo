import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import { FullElevator } from '../../types/types';
import { useTranslation } from 'react-i18next';

interface ElevatorStatusCardProps {
	elevators: FullElevator[];
}

const getStatusColor = (status: string) => {
	switch (status) {
		case 'active':
			return 'green';
		case 'maintenance':
			return 'orange';
		case 'critical':
			return 'red';
		default:
			return 'gray';
	}
};

const ElevatorStatusCard: React.FC<ElevatorStatusCardProps> = ({ elevators }) => {
	const { t } = useTranslation(); // Хук викликається всередині компонента
	const [paginationModel, setPaginationModel] = useState({
		pageSize: 5,
		page: 0
	});

	// Виносимо визначення колонок всередини компонента, щоб мати доступ до t()
	const columns: GridColDef[] = [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'serial_number', headerName: t('elevator.serialNumber'), width: 150 },
		{ field: 'building_name', headerName: t('elevator.building'), width: 200 },
		{
			field: 'status',
			headerName: t('elevator.status'),
			width: 150,
			renderCell: (params) => (
				<Box
					sx={{
						color: getStatusColor(params.value),
						fontWeight: 'bold'
					}}
				>
					{t(getStatusKey(params.value))}
				</Box>
			)
		},
		{ field: 'last_update', headerName: t('elevator.lastUpdate'), width: 200 }
	];

	// Функція для отримання ключів перекладів для статусів
	const getStatusKey = (status: string) => {
		switch (status) {
			case 'active':
				return 'elevator.statuses.active';
			case 'maintenance':
				return 'elevator.statuses.maintenance';
			case 'critical':
				return 'elevator.statuses.critical';
			default:
				return 'elevator.statuses.unknown';
		}
	};

	const rows = elevators.map((elevator) => ({
		id: elevator.id,
		serial_number: elevator.serial_number,
		building_name: elevator.building?.name || t('elevator.unknown'),
		status: elevator.status,
		last_update: new Date(elevator.last_update).toLocaleString()
	}));

	return (
		<Box sx={{ height: 400, width: '100%', bgcolor: 'background.paper', p: 2, borderRadius: 2 }}>
			<Typography variant="h6" gutterBottom>
				{t('elevator.statusTitle')}
			</Typography>
			<DataGrid rows={rows} columns={columns} getRowId={(row) => row.serial_number} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[5, 10, 25]} disableRowSelectionOnClick />
		</Box>
	);
};

export default ElevatorStatusCard;
