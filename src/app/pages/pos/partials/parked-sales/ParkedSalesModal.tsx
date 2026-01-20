import { useEffect, type FunctionComponent } from 'react';
import { Button, Modal } from '../../../../components';
import { useInventory } from '../../../../hooks/useInventory';
import { useAuth } from '../../../../context/AuthProvider';
import {
    ParkedSalesModalProps,
    useParkedSales,
    ModalFooter,
    EmptyState,
    LoadingState,
    ErrorState,
    ParkedSalesList,
} from './index';
import { HiOutlinePause, HiOutlineRefresh } from 'react-icons/hi';

const ParkedSalesModal: FunctionComponent<ParkedSalesModalProps> = ({
    isOpen,
    onClose,
    onResumeSuccess,
}) => {
    const { setCart, clearCart, inventory, addToCart } = useInventory();
    const { user, activeBranchId } = useAuth();

    const {
        parkedSales,
        isLoading,
        error,
        selectedSale,
        fetchParkedSales,
        handleResumeSale,
        handleDeleteSale,
        handleViewDetails,
        clearSelection,
        clearError,
    } = useParkedSales(
        user?.tenantId || '',
        activeBranchId || '',
        user?.userId?.toString()
    );

    useEffect(() => {
        if (isOpen) {
            fetchParkedSales();
        }
    }, [isOpen, fetchParkedSales]);

    const onResume = (sale: ParkedSale) => {
        handleResumeSale(sale, {
            clearCart,
            inventory,
            addToCart,
            setCart,
            onSuccess: () => {
                onClose();
                onResumeSuccess?.();
            },
        });
    };

    const handleCloseModal = () => {
        clearSelection();
        clearError();
        onClose();
    };

    const renderContent = () => {
        if (isLoading && parkedSales.length === 0) {
            return <LoadingState />;
        }

        if (error) {
            return <ErrorState error={error} onRetry={fetchParkedSales} />;
        }

        if (parkedSales.length === 0) {
            return <EmptyState />;
        }

        return (
            <ParkedSalesList
                sales={parkedSales}
                selectedSaleId={selectedSale?.id || null}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onResume={onResume}
                onDelete={handleDeleteSale}
            />
        );
    };

    return (
        <Modal
            title="Parked Sales"
            isOpen={isOpen}
            size='md'
            onClose={handleCloseModal}
            header={
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <HiOutlinePause className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Parked Sales</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {parkedSales.length} sale{parkedSales.length !== 1 ? 's' : ''} waiting
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={fetchParkedSales}
                        disabled={isLoading}
                        theme='primary'
                    >
                        <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            }
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-xl shadow-2xl"
        >
            <div className="flex flex-col gap-4 p-2">

                {renderContent()}

            </div>

            <ModalFooter onClose={handleCloseModal} />
        </Modal>
    );
};

export default ParkedSalesModal;
