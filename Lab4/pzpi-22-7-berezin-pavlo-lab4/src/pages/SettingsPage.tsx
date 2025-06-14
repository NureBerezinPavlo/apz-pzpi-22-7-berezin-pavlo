import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Switch, FormControlLabel, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { fetchThresholds, updateThreshold, createThreshold } from '../services/thresholdService';
import { showSuccess, showError } from '../utils/notificationUtils';
import { useTranslation } from 'react-i18next';

interface Thresholds {
	temperature: number | null;
	humidity: number | null;
	weight: number | null;
}

interface NotificationSettings {
	email: boolean;
	push: boolean;
	criticalOnly: boolean;
}

const SettingsPage: React.FC = () => {
	const { t } = useTranslation();
	const [thresholds, setThresholds] = useState<Thresholds>({
		temperature: null,
		humidity: null,
		weight: null
	});

	const [notifications, setNotifications] = useState<NotificationSettings>({
		email: true,
		push: true,
		criticalOnly: false
	});

	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const loadSettings = async () => {
			try {
				setLoading(true);
				const data = await fetchThresholds();

				const thresholdsData = data.reduce((acc: Record<string, number>, item: any) => {
					acc[item.parameter] = item.value;
					return acc;
				}, {} as Record<string, number>);

				setThresholds({
					temperature: thresholdsData.temperature || 40,
					humidity: thresholdsData.humidity || 90,
					weight: thresholdsData.weight || 1000
				});

				const savedNotifications = localStorage.getItem('notificationSettings');
				if (savedNotifications) {
					setNotifications(JSON.parse(savedNotifications));
				}
			} catch (error) {
				showError('Не вдалося завантажити налаштування');
			} finally {
				setLoading(false);
			}
		};

		loadSettings();
	}, []);

	const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const numValue = parseFloat(value);

		if (!isNaN(numValue)) {
			setThresholds((prev) => ({
				...prev,
				[name]: numValue
			}));
		}
	};

	const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		const newNotifications = {
			...notifications,
			[name]: checked
		};

		setNotifications(newNotifications);
		localStorage.setItem('notificationSettings', JSON.stringify(newNotifications));
	};

	const handleSubmit = async () => {
		try {
			setLoading(true);

			await Promise.all(
				Object.entries(thresholds).map(async ([parameter, value]) => {
					if (value !== null) {
						try {
							await updateThreshold(parameter, value);
						} catch (error: any) {
							if (error.response?.status === 404) {
								await createThreshold(parameter, value);
							} else {
								throw error;
							}
						}
					}
				})
			);

			showSuccess('Налаштування успішно збережено');
		} catch (error) {
			showError('Помилка збереження налаштувань');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" height="100vh">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h4" gutterBottom>
				{t('settings.systemSettings')}
			</Typography>

			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 3,
					mb: 3
				}}
			>
				<Paper elevation={2} sx={{ p: 3, flex: 1 }}>
					<Typography variant="h6" gutterBottom>
						{t('settings.thresholds')}
					</Typography>
					<TextField label={t('settings.max_temperature')} name="temperature" type="number" value={thresholds.temperature || ''} onChange={handleThresholdChange} fullWidth margin="normal" inputProps={{ min: 0 }} />
					<TextField label={t('settings.max_humidity')} name="humidity" type="number" value={thresholds.humidity || ''} onChange={handleThresholdChange} fullWidth margin="normal" inputProps={{ min: 0, max: 100 }} />
					<TextField label={t('settings.max_weight')} name="weight" type="number" value={thresholds.weight || ''} onChange={handleThresholdChange} fullWidth margin="normal" inputProps={{ min: 0 }} />
				</Paper>

				<Paper elevation={2} sx={{ p: 3, flex: 1 }}>
					<Typography variant="h6" gutterBottom>
						{t('settings.notifications')}
					</Typography>
					<FormControlLabel control={<Switch checked={notifications.email} onChange={handleNotificationChange} name="email" />} label={t('settings.emailNotifications')} sx={{ mb: 1 }} />
					<FormControlLabel control={<Switch checked={notifications.push} onChange={handleNotificationChange} name="push" />} label={t('settings.pushNotifications')} sx={{ mb: 1 }} />
					<FormControlLabel control={<Switch checked={notifications.criticalOnly} onChange={handleNotificationChange} name="criticalOnly" />} label={t('settings.criticalEventsOnly')} />
				</Paper>
			</Box>

			<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
				<Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSubmit} sx={{ px: 4, py: 1.5 }} disabled={loading}>
					{loading ? t('settings.saving') : t('settings.saveSettings')}
				</Button>
			</Box>
		</Box>
	);
};

export default SettingsPage;
