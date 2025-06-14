import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography } from '@mui/material';

interface SensorChartProps {
  title: string;
  data: { name: string; value: number }[];
}

const SensorChart: React.FC<SensorChartProps> = ({ title, data }) => {
  return (
    <div style={{ height: 300, backgroundColor: '#fff', padding: '16px', borderRadius: '8px' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;