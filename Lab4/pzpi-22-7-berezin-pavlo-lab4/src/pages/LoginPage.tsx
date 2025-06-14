import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Link, Paper } from '@mui/material';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { login } from '../services/authService';
import { useNavigate } from 'react-router-dom';
//import Logo from '../assets/logo.svg';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const dispatch = useDispatch();
	const navigate = useNavigate(); // хук для навігації

	const { t } = useTranslation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const { token, user } = await login(email, password);
			dispatch(loginSuccess({ token, user }));
			navigate('/'); // перенаправлення на головну сторінку
		} catch (err) {
			setError('Невірний email або пароль');
		}
	};

	return (
		<Container
			component="main"
			maxWidth="xs"
			sx={{
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<Paper
				elevation={3}
				sx={{
					p: 4,
					width: '100%',
					borderRadius: 2
				}}
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center'
					}}
				>
					{/*<img src={Logo} alt="Логотип" style={{ width: 80, marginBottom: 20 }} />*/}
					<Typography component="h1" variant="h5" sx={{ mb: 2 }}>
						{t('login.title')}
					</Typography>
					<Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
						<TextField margin="normal" required fullWidth label={t('login.emailLabel')} autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
						<TextField margin="normal" required fullWidth label={t('login.passwordLabel')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
						{/* ... */}
						<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
							{t('login.submitButton')}
						</Button>
						<Box sx={{ textAlign: 'center' }}>
							<Link href="#" variant="body2">
								{t('login.forgotPassword')}
							</Link>
						</Box>
					</Box>
				</Box>
			</Paper>
		</Container>
	);
};

export default LoginPage;
