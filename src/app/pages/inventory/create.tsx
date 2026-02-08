import { Notify, Report, Confirm } from 'notiflix';
import { useState, useEffect, FunctionComponent } from 'react';
import inventoryService from '../../services/inventory.service';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useInventory } from '../../hooks/useInventory';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { FormikHelpers } from 'formik';
import {
    InventoryErrorMessages,
} from '../../utils/api-error-handler';
import DesktopInventoryForm from './forms/DesktopInventoryForm';
import MobileInventoryForm from './forms/MobileInventoryForm';

const InventoryForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState<InventoryItem | null>(null);
    const { reloadInventory } = useInventory();
    const isMobile = useIsMobile();

    const { productId } = location.state || {};

    useEffect(() => {
        const fetchItem = async () => {
            if (productId) {
                setLoading(true);
                try {
                    const itemData = await inventoryService.show(productId);
                    setItem(itemData);
                } catch (error: any) {
                    console.error('Error fetching inventory item:', error);

                    const responseData = error?.error?.response?.data || error?.response?.data;
                    const statusCode = error?.error?.response?.status || error?.response?.status;
                    const mainMessage = responseData?.message || 'Failed to fetch inventory item';
                    const detailedError = responseData?.error;

                    if (statusCode === 404) {
                        Report.failure(
                            'Item Not Found',
                            'The inventory item you are trying to edit was not found.',
                            'Go Back',
                            () => navigate(isMobile ? ROUTES.MOBILE_INVENTORY : ROUTES.INVENTORY)
                        );
                    } else {
                        const fullErrorMessage = detailedError
                            ? `${mainMessage}:\n${detailedError}`
                            : mainMessage;
                        Notify.failure(fullErrorMessage);
                    }
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchItem();
    }, [productId, isMobile, navigate]);

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Discontinued', value: 'discontinued' },
        { label: 'Out of Stock', value: 'out_of_stock' }
    ];

    const unitOptions = [
        { label: 'Piece (pc)', value: 'pc' },
        { label: 'Pack', value: 'pack' },
        { label: 'Box', value: 'box' },
        { label: 'Carton', value: 'carton' },
        { label: 'Kilogram (kg)', value: 'kg' },
        { label: 'Gram (g)', value: 'g' },
        { label: 'Liter (L)', value: 'L' },
        { label: 'Milliliter (ml)', value: 'ml' },
        { label: 'Meter (m)', value: 'm' },
        { label: 'Centimeter (cm)', value: 'cm' }
    ];

    const handleSubmit = async (
        values: Partial<InventoryItem>,
        { resetForm, setErrors, setFieldError }: FormikHelpers<Partial<InventoryItem>>
    ) => {
        setLoading(true);
        try {
            const minStock = Number(values.minStock) || 0;
            const maxStock = Number(values.maxStock) || 1000;
            const reorderLevel = Number(values.reorderLevel) || 5;

            if (minStock > maxStock) {
                setFieldError('minStock', InventoryErrorMessages.MIN_EXCEEDS_MAX(minStock, maxStock));
                setLoading(false);
                return;
            }

            if (reorderLevel > maxStock) {
                setFieldError('reorderLevel', InventoryErrorMessages.REORDER_EXCEEDS_MAX(reorderLevel, maxStock));
                setLoading(false);
                return;
            }

            const data = {
                ...values,
                costPrice: Number(values.costPrice),
                sellPrice: Number(values.sellPrice),
                promoPrice: Number(values.promoPrice) || 0,
                weight: Number(values.weight) || 0,
                minStock: minStock,
                maxStock: maxStock,
                reorderLevel: reorderLevel,
                reservedQuantity: Number(values.reservedQuantity) || 0,
                quantity: values.quantity?.toString() || '0',
                originalQuantity: values.originalQuantity?.toString() || values.quantity?.toString() || '0',
            } as InventoryItem;

            const inventoryRoute = isMobile ? ROUTES.MOBILE_INVENTORY : ROUTES.INVENTORY;

            if (productId) {
                await inventoryService.update(productId, data);
                await reloadInventory();
                Report.success('Success', 'Inventory item updated successfully', 'Okay', () => {
                    navigate(inventoryRoute);
                });
            } else {
                await inventoryService.store(data);
                await reloadInventory();
                Confirm.show(
                    'Item Saved',
                    'Inventory item created successfully. What would you like to do?',
                    'Add Another',
                    'Go to Inventory',
                    () => {
                        resetForm();
                    },
                    () => {
                        navigate(inventoryRoute);
                    }
                );
            }
        } catch (error: any) {
            console.error('Error saving inventory item:', error);

            const responseData = error?.error?.response?.data || error?.response?.data;
            const mainMessage = responseData?.message || 'Failed to save inventory item';
            const detailedError = responseData?.error;
            const fieldErrors = responseData?.data;

            let fieldErrorsMessage = '';
            if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
                fieldErrorsMessage = Object.entries(fieldErrors)
                    .map(([field, message]) => `• ${field}: ${message}`)
                    .join('\n');
                setErrors(fieldErrors as Record<string, string>);
            }

            let fullErrorMessage = mainMessage;
            if (detailedError) {
                fullErrorMessage += `:\n${detailedError}`;
            } else if (fieldErrorsMessage) {
                fullErrorMessage += `:\n${fieldErrorsMessage}`;
            } else if (!responseData) {
                fullErrorMessage = error?.message || 'An unknown error occurred';
            }

            Report.failure(
                'Error',
                fullErrorMessage,
                'Okay'
            );
        } finally {
            setLoading(false);
        }
    };

    if (isMobile) {
        return (
            <MobileInventoryForm
                productId={productId}
                item={item}
                loading={loading}
                statusOptions={statusOptions}
                unitOptions={unitOptions}
                onSubmit={handleSubmit}
            />
        );
    }

    return (
        <DesktopInventoryForm
            productId={productId}
            item={item}
            loading={loading}
            statusOptions={statusOptions}
            unitOptions={unitOptions}
            onSubmit={handleSubmit}
        />
    );
};

export default InventoryForm;