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
import {
    InventoryFormValues,
    validateStockLevels,
} from './types/variant.types';

const InventoryForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState<ApiProduct | null>(null);
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
                            'Ok',
                            () => { }
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

    /**
     * Handle Mobile Form submission (with variants structure)
     * Sends the InventoryFormValues object directly - API handles field mapping
     */
    const handleMobileSubmit = async (
        values: InventoryFormValues,
        { resetForm, setErrors, setFieldError }: FormikHelpers<InventoryFormValues>
    ) => {
        setLoading(true);
        try {
            // Validate stock levels for the primary variant
            const primaryVariant = values.variants[0];
            if (primaryVariant) {
                const stockValidationError = validateStockLevels(primaryVariant);
                if (stockValidationError) {
                    setFieldError(`variants.0.${stockValidationError.field}`, stockValidationError.message);
                    setLoading(false);
                    return;
                }
            }

            const inventoryRoute = ROUTES.MOBILE_INVENTORY;

            if (productId) {
                // Update existing item - send the form values directly
                await inventoryService.update(productId, values as unknown as Partial<InventoryItem>);
                await reloadInventory();
                Report.success('Success', 'Inventory item updated successfully', 'Okay', () => {
                    navigate(inventoryRoute);
                });
            } else {
                // Create new item - send the form values directly
                await inventoryService.store(values as unknown as InventoryItem);
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
            const mainMessage = responseData?.message || error?.message || 'Failed to save inventory item';
            const detailedError = responseData?.error;
            const fieldErrors = responseData?.data;

            let fieldErrorsMessage = '';
            if (fieldErrors && typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
                fieldErrorsMessage = Object.entries(fieldErrors)
                    .map(([field, message]) => `• ${field}: ${message}`)
                    .join('\n');

                // Map API field errors to form field paths for mobile form
                const formErrors: Record<string, string> = {};
                Object.entries(fieldErrors).forEach(([field, message], index) => {
                    const fieldMapping: Record<string, string> = {
                        'sellingPrice': `variants.${index}.sellingPrice`,
                        'costPrice': `variants.${index}.costPrice`,
                        'barcode': `variants.${index}.barcode`,
                        'primaryBarcode': `variants.${index}.barcode`,
                        'sku': `variants.${index}.sku`,
                        'quantity': `variants.${index}.quantity`,
                        'minStock': `variants.${index}.minStock`,
                        'maxStock': `variants.${index}.maxStock`,
                        'reorderLevel': `variants.${index}.reorderLevel`,
                    };
                    const formField = fieldMapping[field] || field;
                    formErrors[formField] = message as string;
                });
                setErrors(formErrors);
            }

            let fullErrorMessage = mainMessage;
            if (detailedError) {
                fullErrorMessage += `:\n${detailedError}`;
            } else if (fieldErrorsMessage) {
                fullErrorMessage += `:\n${fieldErrorsMessage}`;
            }

            Report.failure('Error', fullErrorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle Desktop Form submission (flat InventoryItem structure)
     */
    const handleDesktopSubmit = async (
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

            // Transform to API format with sellingPrice
            const data = {
                ...values,
                costPrice: Number(values.costPrice),
                sellingPrice: Number(values.sellingPrice), // API expects sellingPrice
                promoPrice: Number(values.promoPrice) || 0,
                weight: Number(values.weight) || 0,
                minStock: minStock,
                maxStock: maxStock,
                reorderLevel: reorderLevel,
                reservedQuantity: Number(values.reservedQuantity) || 0,
                quantity: values.quantity?.toString() || '0',
                originalQuantity: values.originalQuantity?.toString() || values.quantity?.toString() || '0',
            } as InventoryItem;

            const inventoryRoute = ROUTES.INVENTORY;

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

            Report.failure('Error', fullErrorMessage, 'Okay');
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
                unitOptions={unitOptions}
                onSubmit={handleMobileSubmit}
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
            onSubmit={handleDesktopSubmit}
        />
    );
};

export default InventoryForm;