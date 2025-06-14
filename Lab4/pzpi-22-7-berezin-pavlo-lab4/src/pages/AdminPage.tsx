import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar, GridActionsCellItem, GridCellParams, GridRowParams } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { Building } from '../types/types';
import { useTranslation } from 'react-i18next';

const AdminPage: React.FC = () => {
	const { t } = useTranslation();
	const [tabValue, setTabValue] = useState(0);
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
	const [currentItem, setCurrentItem] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Дані для таблиць
	const [admins, setAdmins] = useState<any[]>([]);
	const [technicians, setTechnicians] = useState<any[]>([]);
	const [residents, setResidents] = useState<any[]>([]);
	const [buildings, setBuildings] = useState<Building[]>([]);
	const [elevators, setElevators] = useState<any[]>([]);

	// Форма для створення/редагування
	const [formData, setFormData] = useState<any>({});

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const fetchData = async () => {
		setLoading(true);
		setError(null);

		try {
			// Оновлені URL з /list
			const endpoints = ['/admins/list', '/technicians/list', '/residents/list', '/buildings/', '/elevators/'];

			const responses = await Promise.all(endpoints.map((endpoint) => api.get(endpoint)));

			setAdmins(responses[0].data);
			setTechnicians(responses[1].data);
			setResidents(responses[2].data);
			setBuildings(responses[3].data);
			setElevators(responses[4].data);
		} catch (err) {
			setError(t('admin.errors.loadData'));
			console.error('Error loading data:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleCreateClick = () => {
		setDialogMode('create');
		setFormData({});
		// Встановлюємо значення за замовчуванням для статусу
		setFormData({
			status: 'active'
		});
		setCurrentItem(null);
		setOpenDialog(true);
	};

	const handleEditClick = (item: any) => {
		setDialogMode('edit');
		setCurrentItem(item);
		setFormData({ ...item });
		setOpenDialog(true);
	};

	const handleDeleteClick = async (id: number) => {
		try {
			let endpoint = '';
			switch (tabValue) {
				case 0:
					endpoint = `/admins/${id}`;
					break;
				case 1:
					endpoint = `/technicians/${id}`;
					break;
				case 2:
					endpoint = `/residents/${id}`;
					break;
				case 3:
					endpoint = `/buildings/${id}`;
					break;
				case 4:
					endpoint = `/elevators/${id}`;
					break;
			}

			await api.delete(endpoint);
			fetchData();
		} catch (err) {
			setError(t('admin.errors.delete'));
			console.error('Помилка видалення:', err);
		}
	};

	const handleFormSubmit = async () => {
		try {
			let endpoint = '';
			let method = 'post';
			let data = formData;

			console.log('Form data before submit:', data); // Додайте цей рядок

			switch (tabValue) {
				case 0:
					endpoint = dialogMode === 'create' ? '/admins/register' : `/admins/${currentItem.id}`;
					method = dialogMode === 'create' ? 'post' : 'put';
					break;
				case 1:
					endpoint = dialogMode === 'create' ? '/technicians/register' : `/technicians/${currentItem.id}`;
					method = dialogMode === 'create' ? 'post' : 'put';
					break;
				case 2:
					endpoint = dialogMode === 'create' ? '/residents/register' : `/residents/${currentItem.id}`;
					method = dialogMode === 'create' ? 'post' : 'put';
					break;
				case 3:
					endpoint = dialogMode === 'create' ? '/buildings/' : `/buildings/${currentItem.id}`;
					method = dialogMode === 'create' ? 'post' : 'put';
					break;
				case 4:
					endpoint = dialogMode === 'create' ? '/elevators/' : `/elevators/${currentItem.id}`;
					method = dialogMode === 'create' ? 'post' : 'put';
					break;
			}

			if (method === 'post') {
				await api.post(endpoint, data);
			} else {
				await api.put(endpoint, data);
			}

			setOpenDialog(false);
			fetchData();
		} catch (err) {
			setError(t('admin.errors.save'));
			console.error('Помилка збереження:', err);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value
		});
	};

	// Колонки для кожної таблиці
	const adminColumns: GridColDef[] = [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'username', headerName: t('admin.fields.username'), width: 200 },
		{ field: 'email', headerName: t('admin.fields.email'), width: 250 },
		{
			field: 'actions',
			headerName: t('common.actions'),
			type: 'actions',
			width: 150,
			getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label={t('common.edit')} onClick={() => handleEditClick(params.row)} />, <GridActionsCellItem icon={<DeleteIcon />} label={t('common.delete')} onClick={() => handleDeleteClick(params.id as number)} />]
		}
	];

	const technicianColumns: GridColDef[] = [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'name', headerName: t('admin.fields.name'), width: 200 },
		{ field: 'phone_number', headerName: t('admin.fields.phone'), width: 150 },
		{ field: 'email', headerName: t('admin.fields.email'), width: 250 },
		{
			field: 'actions',
			headerName: t('common.actions'),
			type: 'actions',
			width: 150,
			getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label={t('common.edit')} onClick={() => handleEditClick(params.row)} />, <GridActionsCellItem icon={<DeleteIcon />} label={t('common.delete')} onClick={() => handleDeleteClick(params.id as number)} />]
		}
	];

	const residentColumns: GridColDef[] = [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'name', headerName: t('admin.fields.name'), width: 200 },
		{ field: 'email', headerName: t('admin.fields.email'), width: 250 },
		{
			field: 'building_id',
			headerName: t('admin.tabs.buildings'),
			width: 200,
			valueGetter: (params: GridCellParams) => {
				const bId = Number(params);
				const building = buildings.find((b) => b.id === bId);
				return building ? building.name : t('common.unknown');
			}
		},
		{
			field: 'actions',
			headerName: t('common.actions'),
			type: 'actions',
			width: 150,
			getActions: (params: GridRowParams) => [<GridActionsCellItem icon={<EditIcon />} label={t('common.edit')} onClick={() => handleEditClick(params.row)} />, <GridActionsCellItem icon={<DeleteIcon />} label={t('common.delete')} onClick={() => handleDeleteClick(params.id as number)} />]
		}
	];

	const buildingColumns: GridColDef[] = [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'name', headerName: t('buildings.name'), width: 200 },
		{ field: 'address', headerName: t('buildings.address'), width: 300 },
		{ field: 'num_floors', headerName: t('buildings.floors'), width: 100 },
		{
			field: 'actions',
			headerName: t('common.actions'),
			type: 'actions',
			width: 150,
			getActions: (params) => [<GridActionsCellItem icon={<EditIcon />} label={t('common.edit')} onClick={() => handleEditClick(params.row)} />, <GridActionsCellItem icon={<DeleteIcon />} label={t('common.delete')} onClick={() => handleDeleteClick(params.id as number)} />]
		}
	];

	const elevatorColumns: GridColDef[] = [
		{ field: 'id', headerName: 'ID', width: 70 },
		{ field: 'serial_number', headerName: t('elevator.serialNumber'), width: 200 },
		{
			field: 'building_id',
			headerName: t('elevator.building'),
			width: 200,
			valueGetter: (params: GridCellParams) => {
				const bId = Number(params);
				const building = buildings.find((b) => b.id === bId);
				return building ? building.name : t('common.unknown');
			}
		},
		{
			field: 'status',
			headerName: t('elevator.status'),
			width: 150,
			valueGetter: (params: GridCellParams) => {
				// це я теж нарешті виправив
				const statusString = String(params);
				switch (statusString) {
					case 'active':
						return t('elevator.statuses.active');
					case 'maintenance':
						return t('elevator.statuses.maintenance');
					case 'critical':
						return t('elevator.statuses.critical');
					default:
						return statusString;
				}
			}
		},
		{
			field: 'actions',
			headerName: t('common.actions'),
			type: 'actions',
			width: 150,
			getActions: (params: GridRowParams) => [<GridActionsCellItem icon={<EditIcon />} label={t('common.edit')} onClick={() => handleEditClick(params.row)} />, <GridActionsCellItem icon={<DeleteIcon />} label={t('common.delete')} onClick={() => handleDeleteClick(params.id as number)} />]
		}
	];

	// Визначення поточних даних і колонок
	const getCurrentData = () => {
		switch (tabValue) {
			case 0:
				return { data: admins, columns: adminColumns, title: t('admin.tabs.admins') };
			case 1:
				return { data: technicians, columns: technicianColumns, title: t('admin.tabs.technicians') };
			case 2:
				return { data: residents, columns: residentColumns, title: t('admin.tabs.residents') };
			case 3:
				return { data: buildings, columns: buildingColumns, title: t('admin.tabs.buildings') };
			case 4:
				return { data: elevators, columns: elevatorColumns, title: t('admin.tabs.elevators') };
			default:
				return { data: [], columns: [], title: '' };
		}
	};

	const { data, columns, title } = getCurrentData();

	// Рендер форми відповідно до обраної вкладки
	const renderForm = () => {
		switch (tabValue) {
			case 0: // Адміністратори
				return (
					<>
						<TextField name="username" label={t('admin.fields.username')} fullWidth margin="normal" value={formData.username || ''} onChange={handleInputChange} />
						<TextField name="email" label={t('admin.fields.email')} fullWidth margin="normal" value={formData.email || ''} onChange={handleInputChange} />
						<TextField name="password" label={t('admin.fields.password')} type="password" fullWidth margin="normal" value={formData.password || ''} onChange={handleInputChange} />
					</>
				);

			case 1: // Техніки
				return (
					<>
						<TextField name="name" label={t('admin.fields.name')} fullWidth margin="normal" value={formData.name || ''} onChange={handleInputChange} />
						<TextField name="phone_number" label="Телефон" fullWidth margin="normal" value={formData.phone_number || ''} onChange={handleInputChange} />
						<TextField name="email" label={t('admin.fields.email')} fullWidth margin="normal" value={formData.email || ''} onChange={handleInputChange} />
						<TextField name="password" label={t('admin.fields.password')} type="password" fullWidth margin="normal" value={formData.password || ''} onChange={handleInputChange} />
					</>
				);

			case 2: // Мешканці
				return (
					<>
						<TextField name="name" label={t('admin.fields.name')} fullWidth margin="normal" value={formData.name || ''} onChange={handleInputChange} />
						<TextField name="email" label={t('admin.fields.email')} fullWidth margin="normal" value={formData.email || ''} onChange={handleInputChange} />
						<TextField name="password" label={t('admin.fields.password')} type="password" fullWidth margin="normal" value={formData.password || ''} onChange={handleInputChange} />
						<TextField name="building_id" label={t('elevator.building')} select fullWidth margin="normal" value={formData.building_id || ''} onChange={handleInputChange}>
							{buildings.map((building) => (
								<MenuItem key={building.id} value={building.id}>
									{building.name}
								</MenuItem>
							))}
						</TextField>
					</>
				);

			case 3: // Будинки
				return (
					<>
						<TextField name="name" label={t('buildings.name')} fullWidth margin="normal" value={formData.name || ''} onChange={handleInputChange} />
						<TextField name="address" label={t('elevator.address')} fullWidth margin="normal" value={formData.address || ''} onChange={handleInputChange} />
						<TextField name="num_floors" label={t('buildings.floors_count')} type="number" fullWidth margin="normal" value={formData.num_floors || ''} onChange={handleInputChange} />
					</>
				);

			case 4: // Ліфти
				return (
					<>
						<TextField name="serial_number" label={t('elevator.serialNumber')} fullWidth margin="normal" value={formData.serial_number || ''} onChange={handleInputChange} required />
						<TextField name="building_id" label={t('elevator.building')} select fullWidth margin="normal" value={formData.building_id || ''} onChange={handleInputChange} required>
							{buildings.map((building) => (
								<MenuItem key={building.id} value={building.id}>
									{building.name}
								</MenuItem>
							))}
						</TextField>
						<TextField name="status" label={t('elevator.status')} select fullWidth margin="normal" value={formData.status || 'active'} onChange={handleInputChange} required>
							<MenuItem value="active">{t('admin.statusDropdown.active')}</MenuItem>
							<MenuItem value="maintenance">{t('admin.statusDropdown.maintenance')}</MenuItem>
							<MenuItem value="critical">{t('admin.statusDropdown.critical')}</MenuItem>
						</TextField>
						<TextField name="install_date" label={t('admin.fields.installDate')} type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={formData.install_date || ''} onChange={handleInputChange} />
					</>
				);

			default:
				return null;
		}
	};

	return (
		<div>
			<Box sx={{ p: 3 }}>
				<Typography variant="h4" gutterBottom>
					{t('common.adminPanel')}
				</Typography>

				<Tabs value={tabValue} onChange={handleChange} sx={{ mb: 3 }}>
					<Tab label={t('admin.tabs.admins')} />
					<Tab label={t('admin.tabs.technicians')} />
					<Tab label={t('admin.tabs.residents')} />
					<Tab label={t('admin.tabs.buildings')} />
					<Tab label={t('admin.tabs.elevators')} />
				</Tabs>

				{error && (
					<Typography color="error" sx={{ mb: 2 }}>
						{error}
					</Typography>
				)}

				<Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
					<Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
						{t('common.add')}
					</Button>
				</Box>

				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper' }}>
						<DataGrid rows={data} columns={columns} slots={{ toolbar: GridToolbar }} disableRowSelectionOnClick />
					</Box>
				)}

				<Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
					<DialogTitle>{dialogMode === 'create' ? `${t('admin.addNew')} ${title.toLowerCase()}` : `${t('admin.editTable')} ${title.toLowerCase()}`}</DialogTitle>
					<DialogContent>{renderForm()}</DialogContent>
					<DialogActions>
						<Button onClick={() => setOpenDialog(false)}>{t('common.cancel')}</Button>
						<Button onClick={handleFormSubmit} variant="contained">
							{t('common.save')}
						</Button>
					</DialogActions>
				</Dialog>
			</Box>
		</div>
	);
};

export default AdminPage;
