import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import TenantSearch from '../branch/partials/TenantSearch';
import BranchSearch from '../terminal/partials/BranchSearch';
import TerminalSearch from './partials/TerminalSearch';
import { Fragment, useState, useEffect, useMemo } from 'react';
import type { FunctionComponent } from 'react';
import printerService from '../../services/printer.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import { ROLE_IDS } from '../../constants/roles';
import * as Yup from 'yup';
import { capitalizeEachWord } from '../../utils';

const PrinterForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [printer, setPrinter] = useState<Printer | null>(null);

    const { printerId } = location.state || {};
    const { user: authUser } = useAuth();

    // Check if user can select tenant (only super admin and admin)
    const canSelectTenant = useMemo(() => {
        if (!authUser?.roleId) return false;
        const adminRoles = [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN];
        return adminRoles.includes(authUser.roleId as typeof adminRoles[number]);
    }, [authUser?.roleId]);

    useEffect(() => {
        const fetchPrinter = async () => {
            if (printerId) {
                setLoading(true);
                try {
                    const printerData = await printerService.getById(printerId);
                    setPrinter(printerData);
                } catch (error: any) {
                    console.error('Error fetching printer:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to load printer details';
                    Notify.failure(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPrinter();
    }, [printerId]);

    const printerTypeOptions = [
        { label: 'Thermal', value: 'THERMAL' },
        { label: 'Inkjet', value: 'INKJET' },
        { label: 'Laser', value: 'LASER' },
        { label: 'Dot Matrix', value: 'DOT_MATRIX' },
        { label: 'Label', value: 'LABEL' }
    ];

    const connectionTypeOptions = [
        { label: 'USB', value: 'USB' },
        { label: 'Network', value: 'NETWORK' },
        { label: 'Bluetooth', value: 'BLUETOOTH' },
        { label: 'Serial', value: 'SERIAL' },
        { label: 'WiFi', value: 'WIFI' }
    ];

    const statusOptions = [
        { label: 'Online', value: 'ONLINE' },
        { label: 'Offline', value: 'OFFLINE' },
        { label: 'Busy', value: 'BUSY' },
        { label: 'Error', value: 'ERROR' },
        { label: 'Paper Out', value: 'PAPER_OUT' },
        { label: 'Cover Open', value: 'COVER_OPEN' }
    ];

    const defaultPrinterValues: Partial<CreatePrinterRequest & { status?: PrinterStatus }> = {
        tenantId: authUser?.tenantId || '',
        branchId: '',
        terminalId: '',
        printerName: '',
        printerModel: '',
        printerType: 'THERMAL',
        connectionType: 'USB',
        connectionAddress: '',
        port: undefined,
        vendorId: '',
        productId: '',
        serialNumber: '',
        isDefault: false,
        isReceiptPrinter: true,
        isLabelPrinter: false,
        isKitchenPrinter: false,
        isReportPrinter: false,
        configuration: {
            paperWidth: 80,
            dpi: 203,
            fontSize: 12,
            encoding: 'UTF-8',
            cutPaper: true,
            openCashDrawer: false,
            printLogo: true,
            copies: 1,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            darkness: 5
        }
    };

    const initialPrinterValues = printer
        ? {
            ...printer,
            configuration: printer.configuration || defaultPrinterValues.configuration
        }
        : defaultPrinterValues;

    const printerValidationSchema = Yup.object().shape({
        printerName: Yup.string()
            .required('Printer name is required')
            .min(3, 'Name must be at least 3 characters')
            .max(100, 'Name is too long'),
        tenantId: Yup.string().required('Tenant is required'),
        branchId: Yup.string().required('Branch is required'),
        terminalId: Yup.string().nullable(),
        printerModel: Yup.string().max(100, 'Model is too long'),
        printerType: Yup.string().required('Printer type is required'),
        connectionType: Yup.string().required('Connection type is required'),
        connectionAddress: Yup.string().max(255, 'Address is too long'),
        port: Yup.number()
            .nullable()
            .min(1, 'Port must be at least 1')
            .max(65535, 'Port cannot exceed 65535'),
        vendorId: Yup.string().max(50, 'Vendor ID is too long'),
        productId: Yup.string().max(50, 'Product ID is too long'),
        serialNumber: Yup.string().max(100, 'Serial number is too long'),
        isDefault: Yup.boolean(),
        isReceiptPrinter: Yup.boolean(),
        isLabelPrinter: Yup.boolean(),
        isKitchenPrinter: Yup.boolean(),
        isReportPrinter: Yup.boolean(),
        configuration: Yup.object().shape({
            paperWidth: Yup.number().min(20, 'Min 20mm').max(300, 'Max 300mm'),
            paperHeight: Yup.number().min(10, 'Min 10mm').max(500, 'Max 500mm'),
            dpi: Yup.number().min(72, 'Min 72 DPI').max(600, 'Max 600 DPI'),
            fontSize: Yup.number().min(6, 'Min 6pt').max(72, 'Max 72pt'),
            copies: Yup.number().min(1, 'Min 1 copy').max(10, 'Max 10 copies'),
            darkness: Yup.number().min(1, 'Min 1').max(10, 'Max 10'),
            marginTop: Yup.number().min(0, 'Min 0mm').max(50, 'Max 50mm'),
            marginBottom: Yup.number().min(0, 'Min 0mm').max(50, 'Max 50mm'),
            marginLeft: Yup.number().min(0, 'Min 0mm').max(50, 'Max 50mm'),
            marginRight: Yup.number().min(0, 'Min 0mm').max(50, 'Max 50mm')
        })
    });

    const handleSubmit = async (values: any, { resetForm }: any) => {
        try {
            if (printer && printer.printerId) {
                await printerService.update(printer.printerId, values as UpdatePrinterRequest);
                Report.success("Updated!", "Printer details updated successfully!", "Ok", () => {
                    navigate(ROUTES.PRINTERS);
                });
            } else {
                await printerService.create(values as CreatePrinterRequest);
                Report.success("Great!", "Printer created successfully!", "Ok", () => {
                    resetForm();
                    navigate(ROUTES.PRINTERS);
                });
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred while saving the printer';
            Notify.failure(errorMessage);
        }
    };

    const handleNameChange = (name: string, setFieldValue: Function) => {
        const formattedName = capitalizeEachWord(name);
        setFieldValue('printerName', formattedName);
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading printer details...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <Fragment>
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className='sticky top-0 z-10 bg-white dark:bg-gray-800'>
                        <PageHeader
                            title={printer ? 'Edit Printer' : 'Add Printer'}
                            description='Required fields are marked with an asterisk (*)'
                            action={
                                <Button
                                    type="button"
                                    theme='danger'
                                    onClick={() => navigate(ROUTES.PRINTERS)}
                                >
                                    Cancel
                                </Button>
                            }
                        />
                    </div>

                    <Formik
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                        initialValues={initialPrinterValues}
                        validationSchema={printerValidationSchema}
                    >
                        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                            <Form>
                                <FormWrapper>
                                    <div className="py-6 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        {/* Section 1: Basic Information */}
                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                1
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Basic Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <div className="md:col-span-2">
                                                <TenantSearch
                                                    value={values.tenantId}
                                                    onChange={(tenantId) => {
                                                        setFieldValue('tenantId', tenantId);
                                                        setFieldValue('branchId', '');
                                                        setFieldValue('terminalId', '');
                                                    }}
                                                    error={errors.tenantId as string}
                                                    touched={touched.tenantId as boolean}
                                                    disabled={!canSelectTenant}
                                                    disabledMessage="Auto-assigned based on your account"
                                                />
                                            </div>
                                            <div>
                                                <BranchSearch
                                                    value={values.branchId}
                                                    tenantId={values.tenantId}
                                                    onChange={(branchId) => {
                                                        setFieldValue('branchId', branchId);
                                                        setFieldValue('terminalId', '');
                                                    }}
                                                    error={errors.branchId as string}
                                                    touched={touched.branchId as boolean}
                                                />
                                            </div>
                                            <div>
                                                <TerminalSearch
                                                    value={values.terminalId}
                                                    branchId={values.branchId}
                                                    tenantId={values.tenantId}
                                                    onChange={(terminalId) => setFieldValue('terminalId', terminalId)}
                                                    error={errors.terminalId as string}
                                                    touched={touched.terminalId as boolean}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="text"
                                                    name="printerName"
                                                    label="Printer Name *"
                                                    placeholder="Enter printer name"
                                                    value={values.printerName}
                                                    onChange={(e: any) => handleNameChange(e.target.value, setFieldValue)}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="text"
                                                    name="printerModel"
                                                    label="Printer Model"
                                                    placeholder="e.g., Epson TM-T88VI"
                                                    value={values.printerModel}
                                                />
                                            </div>
                                            <div>
                                                <FormSelectBox
                                                    name="printerType"
                                                    label="Printer Type *"
                                                    options={printerTypeOptions}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="text"
                                                    name="serialNumber"
                                                    label="Serial Number"
                                                    placeholder="Enter serial number"
                                                    value={values.serialNumber}
                                                />
                                            </div>
                                        </div>

                                        {/* Section 2: Connection Settings */}
                                        <div className="flex items-center gap-3 mb-6 mt-8 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                2
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Connection Settings
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <div>
                                                <FormSelectBox
                                                    name="connectionType"
                                                    label="Connection Type *"
                                                    options={connectionTypeOptions}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="text"
                                                    name="connectionAddress"
                                                    label="Connection Address"
                                                    placeholder={values.connectionType === 'NETWORK' ? 'e.g., 192.168.1.100' : 'e.g., /dev/usb/lp0'}
                                                    value={values.connectionAddress}
                                                />
                                            </div>
                                            {(values.connectionType === 'NETWORK' || values.connectionType === 'WIFI') && (
                                                <div>
                                                    <FormInput
                                                        type="number"
                                                        name="port"
                                                        label="Port"
                                                        placeholder="e.g., 9100"
                                                        value={values.port}
                                                    />
                                                </div>
                                            )}
                                            {values.connectionType === 'USB' && (
                                                <>
                                                    <div>
                                                        <FormInput
                                                            type="text"
                                                            name="vendorId"
                                                            label="Vendor ID"
                                                            placeholder="e.g., 04b8"
                                                            value={values.vendorId}
                                                        />
                                                    </div>
                                                    <div>
                                                        <FormInput
                                                            type="text"
                                                            name="productId"
                                                            label="Product ID"
                                                            placeholder="e.g., 0202"
                                                            value={values.productId}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Section 3: Printer Usage */}
                                        <div className="flex items-center gap-3 mb-6 mt-8 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                3
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Printer Usage
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="isDefault"
                                                        checked={values.isDefault}
                                                        onChange={(e) => setFieldValue('isDefault', e.target.checked)}
                                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Set as Default Printer</span>
                                                </label>
                                            </div>
                                            <div></div>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="isReceiptPrinter"
                                                        checked={values.isReceiptPrinter}
                                                        onChange={(e) => setFieldValue('isReceiptPrinter', e.target.checked)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Receipt Printer</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="isLabelPrinter"
                                                        checked={values.isLabelPrinter}
                                                        onChange={(e) => setFieldValue('isLabelPrinter', e.target.checked)}
                                                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Label Printer</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="isKitchenPrinter"
                                                        checked={values.isKitchenPrinter}
                                                        onChange={(e) => setFieldValue('isKitchenPrinter', e.target.checked)}
                                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Kitchen Printer</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="isReportPrinter"
                                                        checked={values.isReportPrinter}
                                                        onChange={(e) => setFieldValue('isReportPrinter', e.target.checked)}
                                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Report Printer</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Section 4: Configuration */}
                                        <div className="flex items-center gap-3 mb-6 mt-8 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                4
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Print Configuration
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-11">
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.paperWidth"
                                                    label="Paper Width (mm)"
                                                    placeholder="e.g., 80"
                                                    value={values.configuration?.paperWidth}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.paperHeight"
                                                    label="Paper Height (mm)"
                                                    placeholder="For labels"
                                                    value={values.configuration?.paperHeight}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.dpi"
                                                    label="DPI"
                                                    placeholder="e.g., 203"
                                                    value={values.configuration?.dpi}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.fontSize"
                                                    label="Font Size (pt)"
                                                    placeholder="e.g., 12"
                                                    value={values.configuration?.fontSize}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.copies"
                                                    label="Default Copies"
                                                    placeholder="e.g., 1"
                                                    value={values.configuration?.copies}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.darkness"
                                                    label="Print Darkness (1-10)"
                                                    placeholder="e.g., 5"
                                                    value={values.configuration?.darkness}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="text"
                                                    name="configuration.encoding"
                                                    label="Encoding"
                                                    placeholder="e.g., UTF-8"
                                                    value={values.configuration?.encoding}
                                                />
                                            </div>
                                        </div>

                                        {/* Margins */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-11 mt-4">
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.marginTop"
                                                    label="Top Margin (mm)"
                                                    placeholder="0"
                                                    value={values.configuration?.marginTop}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.marginBottom"
                                                    label="Bottom Margin (mm)"
                                                    placeholder="0"
                                                    value={values.configuration?.marginBottom}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.marginLeft"
                                                    label="Left Margin (mm)"
                                                    placeholder="0"
                                                    value={values.configuration?.marginLeft}
                                                />
                                            </div>
                                            <div>
                                                <FormInput
                                                    type="number"
                                                    name="configuration.marginRight"
                                                    label="Right Margin (mm)"
                                                    placeholder="0"
                                                    value={values.configuration?.marginRight}
                                                />
                                            </div>
                                        </div>

                                        {/* Print Options */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-11 mt-4">
                                            <div className="flex items-center space-x-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="configuration.cutPaper"
                                                        checked={values.configuration?.cutPaper}
                                                        onChange={(e) => setFieldValue('configuration.cutPaper', e.target.checked)}
                                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-cut Paper</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="configuration.openCashDrawer"
                                                        checked={values.configuration?.openCashDrawer}
                                                        onChange={(e) => setFieldValue('configuration.openCashDrawer', e.target.checked)}
                                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Open Cash Drawer</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="configuration.printLogo"
                                                        checked={values.configuration?.printLogo}
                                                        onChange={(e) => setFieldValue('configuration.printLogo', e.target.checked)}
                                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Print Logo</span>
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="configuration.beepAfterPrint"
                                                        checked={values.configuration?.beepAfterPrint}
                                                        onChange={(e) => setFieldValue('configuration.beepAfterPrint', e.target.checked)}
                                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Beep After Print</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Logo URL */}
                                        <div className="grid grid-cols-1 gap-4 ml-11 mt-4">
                                            <div>
                                                <FormInput
                                                    type="text"
                                                    name="configuration.logoUrl"
                                                    label="Logo URL/Path"
                                                    placeholder="Enter logo URL or file path"
                                                    value={values.configuration?.logoUrl}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            type="button"
                                            theme="neutral"
                                            onClick={() => navigate(ROUTES.PRINTERS)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            theme="primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Saving...' : (printer ? 'Update Printer' : 'Create Printer')}
                                        </Button>
                                    </div>
                                </FormWrapper>
                            </Form>
                        )}
                    </Formik>
                </div>
            </AppLayout>
        </Fragment>
    );
};

export default PrinterForm;
