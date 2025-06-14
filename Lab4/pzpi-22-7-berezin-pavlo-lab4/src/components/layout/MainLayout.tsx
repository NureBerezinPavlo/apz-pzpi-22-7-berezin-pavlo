import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Toolbar from '@mui/material/Toolbar';
import { useTranslation } from 'react-i18next';

const MainLayout: React.FC = () => {
	const { t } = useTranslation();

	const pageTitles: Record<string, string> = {
		'/': t('sidebar.controlPanel'),
		'/map': t('sidebar.map'),
		'/reports': t('sidebar.reports'),
		'/admin': t('sidebar.admin'),
		'/settings': t('sidebar.settings')
	};

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
	const location = useLocation();
	const title = pageTitles[location.pathname] || t('common.title');

	const handleDrawerToggle = () => {
		setSidebarOpen(!sidebarOpen);
	};

	return (
		<Box sx={{ display: 'flex', minHeight: '100vh' }}>
			<Header title={title} onMenuClick={handleDrawerToggle} sidebarOpen={sidebarOpen} />
			<Sidebar open={sidebarOpen} onClose={handleDrawerToggle} isMobile={isMobile} />
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					width: '100%',
					marginTop: '64px',
					backgroundColor: '#f5f5f5',
					minHeight: 'calc(100vh - 64px)',
					transition: theme.transitions.create('margin', {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen
					}),
					marginLeft: sidebarOpen && !isMobile ? `${drawerWidth}px` : 0
				}}
			>
				<Toolbar /> {/* Додатковий Toolbar для компенсації висоти AppBar */}
				<Outlet />
			</Box>
		</Box>
	);
};

const drawerWidth = 240;

export default MainLayout;
