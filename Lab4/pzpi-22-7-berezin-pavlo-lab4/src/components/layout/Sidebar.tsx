import React, { useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme, ListItemButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import ReportIcon from '@mui/icons-material/Assessment';
import AdminPanelIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Toolbar from '@mui/material/Toolbar';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
	open: boolean;
	onClose: () => void;
	isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, isMobile }) => {
	const { t } = useTranslation();
	const location = useLocation();
	const user = useSelector((state: RootState) => state.auth.user);
	const theme = useTheme();

	useEffect(() => {
		if (isMobile) {
			onClose();
		}
	}, [location.pathname, isMobile, onClose]);

	const menuItems = [
		{ text: t('sidebar.controlPanel'), icon: <DashboardIcon />, path: '/', roles: ['admin', 'technician'] },
		{ text: t('sidebar.map'), icon: <MapIcon />, path: '/map', roles: ['admin', 'technician'] },
		{ text: t('sidebar.reports'), icon: <ReportIcon />, path: '/reports', roles: ['admin', 'technician'] },
		{ text: t('sidebar.admin'), icon: <AdminPanelIcon />, path: '/admin', roles: ['admin'] },
		{ text: t('sidebar.settings'), icon: <SettingsIcon />, path: '/settings', roles: ['admin'] }
	];

	const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role || ''));

	return (
		<Drawer
			variant={isMobile ? 'temporary' : 'persistent'}
			open={open}
			onClose={onClose}
			ModalProps={{ keepMounted: true }}
			sx={{
				width: drawerWidth,
				flexShrink: 0,
				'& .MuiDrawer-paper': {
					width: drawerWidth,
					boxSizing: 'border-box',
					backgroundColor: '#f5f5f5',
					borderRight: 'none',
					boxShadow: theme.shadows[3]
				}
			}}
		>
			<Toolbar />
			<List>
				{filteredMenuItems.map((item) => (
					<ListItemButton
						key={item.text}
						component={Link}
						to={item.path}
						selected={location.pathname === item.path}
						onClick={isMobile ? onClose : undefined}
						sx={{
							'&.Mui-selected': {
								backgroundColor: 'primary.main',
								color: 'white',
								'& .MuiListItemIcon-root': {
									color: 'white'
								}
							},
							'&:hover': {
								backgroundColor: 'primary.light',
								color: 'white'
							}
						}}
					>
						<ListItemIcon>{item.icon}</ListItemIcon>
						<ListItemText primary={item.text} />
					</ListItemButton>
				))}
			</List>
			<Divider />
		</Drawer>
	);
};

const drawerWidth = 240;

export default Sidebar;
