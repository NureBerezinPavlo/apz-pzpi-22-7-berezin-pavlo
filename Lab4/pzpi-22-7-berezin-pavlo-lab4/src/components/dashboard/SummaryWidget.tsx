import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

interface SummaryWidgetProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
}

const WidgetPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  }
}));

const SummaryWidget: React.FC<SummaryWidgetProps> = ({ title, value, icon, color = 'primary' }) => {
  return (
    <WidgetPaper elevation={3}>
      <Box color={`${color}.main`} fontSize="2.5rem" mb={1}>
        {icon}
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {title}
      </Typography>
    </WidgetPaper>
  );
};

export default SummaryWidget;