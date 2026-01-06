import { Confirm } from 'notiflix';
import { Printer } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus, HiOutlinePrinter } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { usePrinters } from '../../hooks/usePrinters';
import { FunctionComponent, useContext } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { getPrinterColumns } from './partials/PrinterTableColumns';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

const PrinterManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        setPage,
        setPerPage,
        getPaginatedData,
        deletePrinter,
        setDefault,
        activatePrinter,
        deactivatePrinter,
        testConnection,
        printTestPage
    } = usePrinters();

    const handleEdit = (printer: Printer) => {
        navigate(ROUTES.PRINTER_FORM, { state: { printerId: printer.printerId } });
    };

    const handleDelete = (printerId: string, printerName: string) => {
        Confirm.show(
            'Delete Printer',
            `Are you sure you want to delete the printer "${printerName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deletePrinter(printerId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleSetDefault = (printerId: string) => {
        Confirm.show(
            'Set Default Printer',
            'Are you sure you want to set this as the default printer?',
            'Yes, Set Default',
            'Cancel',
            async () => {
                await setDefault(printerId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#eab308',
                okButtonBackground: '#eab308',
            }
        );
    };

    const handleToggleActive = (printerId: string, isActive: boolean) => {
        if (isActive) {
            Confirm.show(
                'Deactivate Printer',
                'Are you sure you want to deactivate this printer?',
                'Yes, Deactivate',
                'Cancel',
                async () => {
                    await deactivatePrinter(printerId);
                },
                () => {
                    // do nothing
                },
                {
                    titleColor: '#ef4444',
                    okButtonBackground: '#ef4444',
                }
            );
        } else {
            Confirm.show(
                'Activate Printer',
                'Are you sure you want to activate this printer?',
                'Yes, Activate',
                'Cancel',
                async () => {
                    await activatePrinter(printerId);
                },
                () => {
                    // do nothing
                },
                {
                    titleColor: '#22c55e',
                    okButtonBackground: '#22c55e',
                }
            );
        }
    };

    const handleTestConnection = async (printerId: string) => {
        await testConnection(printerId);
    };

    const handlePrintTestPage = (printerId: string) => {
        Confirm.show(
            'Print Test Page',
            'Are you sure you want to print a test page?',
            'Yes, Print',
            'Cancel',
            async () => {
                await printTestPage(printerId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#8b5cf6',
                okButtonBackground: '#8b5cf6',
            }
        );
    };

    const columns = getPrinterColumns(
        handleEdit,
        handleDelete,
        handleSetDefault,
        handleToggleActive,
        handleTestConnection,
        handlePrintTestPage
    );

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title='Printers'
                    description='Manage your printer devices and print settings'
                    icon={<HiOutlinePrinter className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {
                                !isMobile && (
                                    <SearchBar
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                    />
                                )}

                            <Button
                                onClick={() => navigate(ROUTES.PRINTER_FORM)}
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                theme='primary'
                            >
                                {!isMobile && <span className='hidden md:block'>
                                    Add Printer
                                </span>}
                            </Button>
                        </div>
                    }
                >
                    {
                        isMobile && (
                            <div className='m-4 mt-0'>
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
                            </div>
                        )
                    }
                </PageHeader>
                <DataTable
                    columns={columns}
                    data={getPaginatedData()}
                    theme={mode as string}
                    progressPending={isLoading}
                    highlightOnHover
                    striped
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={(newPerPage, page) => {
                        setPage(page);
                        setPerPage(newPerPage);
                    }}
                    onChangePage={setPage}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 350px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-8">
                            <Printer className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No printer(s) found matching your search.' : 'No printers found.'}
                            </p>
                        </div>
                    }
                />
            </div>
        </AppLayout>
    );
};

export default PrinterManagement;
