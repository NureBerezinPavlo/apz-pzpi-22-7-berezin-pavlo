import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

const LanguageSwitcher: React.FC = () => {
	const { i18n } = useTranslation();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	// Перевіряємо, чи i18n ініціалізовано
	const currentLanguage = i18n.language || 'uk';

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
		handleClose();
	};

	return (
		<div>
			<Button color="inherit" startIcon={<TranslateIcon />} onClick={handleClick}>
				{currentLanguage.toUpperCase()}
			</Button>
			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
				<MenuItem onClick={() => changeLanguage('uk')}>Українська</MenuItem>
				<MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
			</Menu>
		</div>
	);
};

export default LanguageSwitcher;
