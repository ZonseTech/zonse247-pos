import { FunctionComponent, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Form, Formik } from 'formik';
import { Notify, Confirm } from 'notiflix';
import { X, Wifi, Usb, Bluetooth, Network, Star, Trash2, Power, TestTube, FileText, Printer } from 'lucide-react';
import { Button, FormSearchableSelect, FormFieldCard, TabOptionGroup, FormSwitch } from '../../../components';
import printerService from '../../../services/printer.service';
import { getErrorMessage } from '../../../utils/api-error-handler';

interface EditPrinterModalProps {
	isOpen: boolean;
	printer: Printer | null;
	onClose: () => void;
	onSave: () => void;
	onDelete?: (printerId: string) => void;
}

const PAPER_WIDTH_OPTIONS = [
	{ value: 58, label: '58mm', icon: <Printer className="w-5 h-5" /> },
	{ value: 80, label: '80mm', icon: <Printer className="w-5 h-5" /> },
	{ value: 110, label: '110mm', icon: <Printer className="w-5 h-5" /> },
];

const PRINTER_CONTENT_OPTIONS = [
	{ value: 'receipt', label: 'Receipt' },
	{ value: 'report', label: 'Report' },
	{ value: 'label', label: 'Label' },
	{ value: 'kitchen', label: 'Kitchen' },
];

const PRINT_MODE_OPTIONS = [
	{ value: 'normal', label: 'Normal' },
	{ value: 'draft', label: 'Draft' },
	{ value: 'high', label: 'High Quality' },
];

const LINE_SPACING_OPTIONS = [
	{ label: 'Compact', value: 1 },
	{ label: 'Normal', value: 1.5 },
	{ label: 'Relaxed', value: 2 },
	{ label: 'Loose', value: 2.5 },
];

const FONT_SIZE_OPTIONS = [
	{ label: 'Extra Small (8pt)', value: 8 },
	{ label: 'Small (10pt)', value: 10 },
	{ label: 'Medium (12pt)', value: 12 },
	{ label: 'Large (14pt)', value: 14 },
	{ label: 'Extra Large (16pt)', value: 16 },
];

const EditPrinterModal: FunctionComponent<EditPrinterModalProps> = ({
	isOpen,
	printer,
	onClose,
	onSave,
	onDelete
}) => {
	const [isSaving, setIsSaving] = useState(false);
	const [isTestingConnection, setIsTestingConnection] = useState(false);

	const getConnectionIcon = (type: PrinterConnectionType): ReactNode => {
		const icons: Record<PrinterConnectionType, ReactNode> = {
			'USB': <Usb className="w-5 h-5" />,
			'NETWORK': <Network className="w-5 h-5" />,
			'BLUETOOTH': <Bluetooth className="w-5 h-5" />,
			'SERIAL': <Network className="w-5 h-5" />,
			'WIFI': <Wifi className="w-5 h-5" />
		};
		return icons[type] || <Network className="w-5 h-5" />;
	};

	const handleSubmit = async (values: any) => {
		if (!printer?.printerId) return;

		setIsSaving(true);
		try {
			await printerService.update(printer.printerId, {
				...printer,
				isReceiptPrinter: values.printerContent === 'receipt',
				isReportPrinter: values.printerContent === 'report',
				isLabelPrinter: values.printerContent === 'label',
				isKitchenPrinter: values.printerContent === 'kitchen',
				configuration: {
					...printer.configuration,
					paperWidth: values.paperWidth,
					fontSize: values.fontSize,
					lineSpacing: values.lineSpacing,
					printMode: values.printMode,
					autoPrintOnSale: values.autoPrintOnSale,
				}
			});
			Notify.success('Printer updated successfully');
			onSave();
			onClose();
		} catch (e: any) {
			const errorMessage = getErrorMessage(e, 'Failed to update printer');
			Notify.failure(errorMessage);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = () => {
		if (!printer?.printerId || !onDelete) return;

		Confirm.show(
			'Delete Printer',
			`Are you sure you want to delete "${printer.printerName}"?`,
			'Delete',
			'Cancel',
			() => {
				onDelete(printer.printerId);
				onClose();
			},
			() => { },
			{ titleColor: '#ef4444', okButtonBackground: '#ef4444' }
		);
	};

	const handleSetDefault = async () => {
		if (!printer?.printerId) return;

		try {
			await printerService.setDefault(printer.printerId);
			Notify.success('Printer set as default');
			onSave();
		} catch (e: any) {
			Notify.failure('Failed to set as default');
		}
	};

	const handleToggleActive = async () => {
		if (!printer?.printerId) return;

		try {
			if (printer.isActive) {
				await printerService.deactivate(printer.printerId);
				Notify.success('Printer deactivated');
			} else {
				await printerService.activate(printer.printerId);
				Notify.success('Printer activated');
			}
			onSave();
		} catch (e: any) {
			Notify.failure('Failed to update printer status');
		}
	};

	const handleTestConnection = async () => {
		if (!printer?.printerId) return;

		setIsTestingConnection(true);
		try {
			const result = await printerService.testConnection(printer.printerId);
			if (result?.success) {
				Notify.success('Connection successful');
			} else {
				Notify.warning(result?.message || 'Connection test failed');
			}
		} catch (e: any) {
			Notify.failure('Connection test failed');
		} finally {
			setIsTestingConnection(false);
		}
	};

	const handlePrintTestPage = async () => {
		if (!printer?.printerId) return;

		try {
			await printerService.printTestPage(printer.printerId);
			Notify.success('Test page sent to printer');
		} catch (e: any) {
			Notify.failure('Failed to print test page');
		}
	};

	if (!isOpen || !printer) return null;

	const initialValues = {
		paperWidth: printer.configuration?.paperWidth || 80,
		printerContent: printer.isReceiptPrinter ? 'receipt' : printer.isReportPrinter ? 'report' : printer.isLabelPrinter ? 'label' : printer.isKitchenPrinter ? 'kitchen' : 'receipt',
		printMode: printer.configuration?.printMode || 'normal',
		autoPrintOnSale: printer.configuration?.autoPrintOnSale || false,
		lineSpacing: printer.configuration?.lineSpacing || 1.5,
		fontSize: printer.configuration?.fontSize || 12,
	};

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
				<div className="flex-shrink-0 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<div className={`p-2.5 rounded-xl ${printer.isActive ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
								{getConnectionIcon(printer.connectionType)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
										{printer.printerName}
									</h2>
									{printer.isDefault && (
										<Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
									)}
								</div>
								<p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
									{printer.connectionType} • {printer.printerType}
								</p>
							</div>
						</div>
						<button
							onClick={onClose}
							className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
						<div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${printer.isActive
							? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
							: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
							}`}>
							{printer.isActive ? 'Active' : 'Inactive'}
						</div>
						<div className="flex-1" />
						<button
							onClick={handleSetDefault}
							disabled={printer.isDefault}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
							title="Set as default"
						>
							<Star className={`w-5 h-5 ${printer.isDefault ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500 dark:text-gray-400'}`} />
						</button>
						<button
							onClick={handleToggleActive}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
							title={printer.isActive ? 'Disable printer' : 'Enable printer'}
						>
							<Power className={`w-5 h-5 ${printer.isActive ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'}`} />
						</button>
						<button
							onClick={handleTestConnection}
							disabled={isTestingConnection}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
							title="Test connection"
						>
							<TestTube className={`w-5 h-5 text-sky-500 ${isTestingConnection ? 'animate-pulse' : ''}`} />
						</button>
						{onDelete && (
							<button
								onClick={handleDelete}
								className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
								title="Delete printer"
							>
								<Trash2 className="w-5 h-5 text-red-500" />
							</button>
						)}
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-6">
					<Formik
						initialValues={initialValues}
						onSubmit={handleSubmit}
						enableReinitialize
					>
						{() => (
							<Form id="printer-edit-form" className="space-y-6">
								<FormFieldCard title="Paper Width">
									<TabOptionGroup
										name="paperWidth"
										options={PAPER_WIDTH_OPTIONS}
										size="md"
										columns={3}
									/>
								</FormFieldCard>

								<FormFieldCard title="Printer Content">
									<TabOptionGroup
										name="printerContent"
										options={PRINTER_CONTENT_OPTIONS}
										columns={4}
										size="md"
									/>
								</FormFieldCard>

								<FormFieldCard title="Print Mode">
									<TabOptionGroup
										name="printMode"
										options={PRINT_MODE_OPTIONS}
										size="md"
										columns={3}
									/>
								</FormFieldCard>

								<FormFieldCard title="Additional Options">
									<div className="space-y-4">
										<FormSwitch
											name="autoPrintOnSale"
											label="Print automatically on sale"
										/>

										<FormSearchableSelect
											label="Line Spacing"
											name="lineSpacing"
											options={LINE_SPACING_OPTIONS}
											placeholder="Select line spacing"
											isClearable={false}
										/>

										<FormSearchableSelect
											label="Font Size"
											name="fontSize"
											options={FONT_SIZE_OPTIONS}
											placeholder="Select font size"
											isClearable={false}
										/>
									</div>
								</FormFieldCard>
							</Form>
						)}
					</Formik>
				</div>

				<div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
					<div className="flex gap-3">
						<Button
							type="button"
							theme="neutral"
							layout="outline"
							onClick={onClose}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="button"
							theme="primary"
							layout="outline"
							onClick={handlePrintTestPage}
							className="flex-1"
						>
							<FileText className="w-4 h-4 mr-2" />
							Test Print
						</Button>
						<Button
							type="submit"
							form="printer-edit-form"
							theme="primary"
							className="flex-1"
							disabled={isSaving}
						>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</Button>
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default EditPrinterModal;
