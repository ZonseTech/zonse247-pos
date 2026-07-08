import { TableStyles } from 'react-data-table-component';

export const getTableStyles = (mode: Mode): TableStyles => ({
	table: {
		style: {
			backgroundColor: 'transparent',
			overflow: 'hidden',
			boxShadow:
				mode === 'dark'
					? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
					: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
		},
	},
	headRow: {
		style: {
			borderBottomColor: mode === 'dark' ? '#4b5563' : '#e2e8f0',
			borderBottomWidth: '2px',
			minHeight: '56px',
			transition: 'all 0.2s ease',
		},
	},
	headCells: {
		style: {
			color: mode === 'dark' ? '#f3f4f6' : '#1e293b',
			fontSize: '14px',
			fontWeight: '600',
			letterSpacing: '0.025em',
			padding: '16px',
			textTransform: 'uppercase',
		},
	},
	rows: {
		style: {
			backgroundColor: 'transparent',
			borderBottomColor: mode === 'dark' ? '#374151' : '#e2e8f0',
			minHeight: '20px',
			'&:hover': {
				backgroundColor: mode === 'dark' ? '#1f2937' : '#f1f5f9',
				transform: 'translateY(-1px)',
				transition: 'all 0.2s ease',
			},
		},
		stripedStyle: {
			backgroundColor: mode === 'dark' ? '#1f2937' : '#f8fafc',
		},
	},
	cells: {
		style: {
			color: mode === 'dark' ? '#e5e7eb' : '#334155',
			fontSize: '14px',
			padding: '8px',
			transition: 'color 0.2s ease',
		},
	},
	pagination: {
		style: {
			borderTopColor: mode === 'dark' ? '#374151' : '#e2e8f0',
			color: mode === 'dark' ? '#e5e7eb' : '#334155',
			minHeight: '56px',
			fontSize: '14px',
			fontWeight: '500',
		},
		pageButtonsStyle: {
			borderRadius: '0.17rem',
			height: '32px',
			minWidth: '32px',
			padding: '0 6px',
			margin: '0 4px',
			cursor: 'pointer',
			transition: 'all 0.2s ease',
			'&:disabled': {
				backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff',
				cursor: 'not-allowed',
			},
			'&:hover:not(:disabled)': {
				backgroundColor: mode === 'dark' ? '#4b5563' : '#e2e8f0',
			},
		},
	},
});

export const getCompactTableStyles = (mode: Mode): TableStyles => ({
	table: {
		style: {
			backgroundColor: 'transparent',
			overflow: 'hidden',
		},
	},
	headRow: {
		style: {
			borderBottomColor: mode === 'dark' ? '#4b5563' : '#e2e8f0',
			borderBottomWidth: '1px',
			minHeight: '32px',
		},
	},
	headCells: {
		style: {
			color: mode === 'dark' ? '#f3f4f6' : '#1e293b',
			fontSize: '10px',
			fontWeight: '600',
			letterSpacing: '0.025em',
			padding: '4px 8px',
			textTransform: 'uppercase',
		},
	},
	rows: {
		style: {
			backgroundColor: 'transparent',
			borderBottomColor: mode === 'dark' ? '#374151' : '#e2e8f0',
			minHeight: '32px',
			'&:hover': {
				backgroundColor: mode === 'dark' ? '#1f2937' : '#f1f5f9',
			},
		},
		stripedStyle: {
			backgroundColor: mode === 'dark' ? '#1f2937' : '#f8fafc',
		},
	},
	cells: {
		style: {
			color: mode === 'dark' ? '#e5e7eb' : '#334155',
			fontSize: '11px',
			padding: '4px 8px',
		},
	},
	pagination: {
		style: {
			borderTopColor: mode === 'dark' ? '#374151' : '#e2e8f0',
			color: mode === 'dark' ? '#e5e7eb' : '#334155',
			minHeight: '36px',
			fontSize: '11px',
			fontWeight: '500',
		},
		pageButtonsStyle: {
			borderRadius: '0.17rem',
			height: '24px',
			minWidth: '24px',
			padding: '0 4px',
			margin: '0 2px',
			cursor: 'pointer',
			'&:disabled': {
				backgroundColor: mode === 'dark' ? '#1f2937' : '#ffffff',
				cursor: 'not-allowed',
			},
			'&:hover:not(:disabled)': {
				backgroundColor: mode === 'dark' ? '#4b5563' : '#e2e8f0',
			},
		},
	},
});
