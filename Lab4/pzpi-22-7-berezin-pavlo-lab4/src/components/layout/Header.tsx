import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
	title: string;
	onMenuClick: () => void;
	sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, sidebarOpen }) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state: RootState) => state.auth.user);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const handleLogout = () => {
		dispatch(logout());
		navigate('/login');
		handleMenuClose();
	};

	return (
		<AppBar
			position="fixed"
			sx={{
				zIndex: (theme) => theme.zIndex.drawer + 1,
				width: '100%',
				transition: (theme) =>
					theme.transitions.create(['width', 'margin'], {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen
					}),
				...(sidebarOpen && {
					width: `calc(100% - ${drawerWidth}px)`,
					marginLeft: `${drawerWidth}px`,
					transition: (theme) =>
						theme.transitions.create(['width', 'margin'], {
							easing: theme.transitions.easing.sharp,
							duration: theme.transitions.duration.enteringScreen
						})
				})
			}}
		>
			<Toolbar>
				<IconButton
					color="inherit"
					aria-label="open drawer"
					onClick={onMenuClick}
					edge="start"
					sx={{
						mr: 2,
						...(sidebarOpen && { display: 'none' })
					}}
				>
					<MenuIcon />
				</IconButton>
				<Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
					{title}
				</Typography>

				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton color="inherit" aria-label="notifications">
						<NotificationsIcon />
					</IconButton>
					<LanguageSwitcher />
					<IconButton color="inherit" aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleProfileMenuOpen}>
						<Avatar sx={{ bgcolor: 'secondary.main' }}>{user?.name?.charAt(0) || 'U'}</Avatar>
					</IconButton>
					<Menu id="menu-appbar" anchorEl={anchorEl} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={Boolean(anchorEl)} onClose={handleMenuClose}>
						<MenuItem disabled>
							<Typography variant="body2">{user?.name || 'Користувач'}</Typography>
						</MenuItem>
						<MenuItem onClick={handleLogout}>
							<LogoutIcon sx={{ mr: 1 }} />
							{t('login.logout')}
						</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

const drawerWidth = 240;

export default Header;
