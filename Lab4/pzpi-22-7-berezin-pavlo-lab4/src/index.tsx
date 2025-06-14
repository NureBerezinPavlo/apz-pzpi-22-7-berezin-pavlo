import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store } from './store';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import i18n from './i18n';

const theme = createTheme({
	palette: {
		primary: {
			main: '#2e7d32'
		},
		secondary: {
			main: '#ff6f00'
		},
		background: {
			default: '#f5f5f5'
		}
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		h4: {
			fontWeight: 600,
			fontSize: '1.8rem'
		},
		h5: {
			fontWeight: 500
		}
	}
});

// обробник для події ініціалізації
i18n.on('initialized', () => {
	const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

	root.render(
		<React.StrictMode>
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</ThemeProvider>
			</Provider>
		</React.StrictMode>
	);
});

// Якщо i18n вже ініціалізовано, викликаємо render негайно
if (i18n.isInitialized) {
	i18n.emit('initialized');
}

reportWebVitals();
