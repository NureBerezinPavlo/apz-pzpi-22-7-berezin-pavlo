import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DowntimeReport } from '../../types/reports';
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

interface DowntimeChartProps {
	data: DowntimeReport[];
}

const DowntimeChart: React.FC<DowntimeChartProps> = ({ data }) => {
	// Перетворюємо дані для графіка
	const chartData = data.map((item) => ({
		name: item.serial_number,
		downtime: parseFloat(item.total_downtime.replace('h', '')),
		incidents: item.incidents
	}));

	return (
		<Box sx={{ mt: 4 }}>
			<Typography variant="h5" gutterBottom>
				Графік тривалості простоїв
			</Typography>
			<Box sx={{ height: 300, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip formatter={(value) => [`${value} год`, 'Тривалість']} />
						<Legend />
						<Bar dataKey="downtime" name="Годин простою" fill="#8884d8" />
						<Bar dataKey="incidents" name="Кількість інцидентів" fill="#82ca9d" />
					</BarChart>
				</ResponsiveContainer>
			</Box>
		</Box>
	);
};

export default DowntimeChart;
