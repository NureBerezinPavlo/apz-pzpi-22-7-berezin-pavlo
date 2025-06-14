import React from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { Download, PictureAsPdf, GridOn } from '@mui/icons-material';
import { exportReport } from '../../services/reportService';
import { useTranslation } from 'react-i18next';

interface ExportButtonProps {
	reportType: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ reportType }) => {
	const { t } = useTranslation();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleExport = (format: 'pdf' | 'excel') => {
		exportReport(reportType, format);
		handleClose();
	};

	return (
		<div>
			<Button variant="contained" startIcon={<Download />} onClick={handleClick} disabled={!reportType}>
				{t('common.export')}
			</Button>
			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
				<MenuItem onClick={() => handleExport('pdf')}>
					<PictureAsPdf sx={{ mr: 1 }} />
					{t('export.pdf')}
				</MenuItem>
				<MenuItem onClick={() => handleExport('excel')}>
					<GridOn sx={{ mr: 1 }} />
					{t('export.excel')}
				</MenuItem>
			</Menu>
		</div>
	);
};

export default ExportButton;
