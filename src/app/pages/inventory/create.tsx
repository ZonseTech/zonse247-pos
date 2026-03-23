import { Notify, Report, Confirm } from 'notiflix';
import { parseApiError, mapErrorToFormikErrors, formatFieldErrorsMessage } from '../../utils/api-error-handler';
import { useState, useEffect, FunctionComponent } from 'react';
import inventoryService from '../../services/inventory.service';
import { OfflinePlaceholder } from '../../components';
import { useConnectivity } from '../../hooks/useConnectivity';
import AppLayout from '../../layouts/AppLayout';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useInventory } from '../../hooks/useInventory';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { FormikHelpers } from 'formik';
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
    const { isOnline } = useConnectivity();

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

                    const parsed = parseApiError(error);

                    if (parsed.statusCode === 404) {
                        Report.failure(
                            'Item Not Found',
                            'The inventory item you are trying to edit was not found.',
                            'Ok',
                            () => { }
                        );
                    } else {
                        Notify.failure(parsed.message);
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
        values: InventoryFormValues,
        { resetForm, setErrors, setFieldError }: FormikHelpers<InventoryFormValues>
    ) => {
        setLoading(true);
        try {
            const primaryVariant = values.variants[0];
            if (primaryVariant) {
                const stockValidationError = validateStockLevels(primaryVariant);
                if (stockValidationError) {
                    setFieldError(`variants.0.${stockValidationError.field}`, stockValidationError.message);
                    setLoading(false);
                    return;
                }
            }

            const inventoryRoute = isMobile ? ROUTES.MOBILE_INVENTORY : ROUTES.INVENTORY_HUB;

            if (productId) {
                await inventoryService.update(productId, values as unknown as Partial<InventoryItem>);
                await reloadInventory();
                Report.success('Success', 'Inventory item updated successfully', 'Okay', () => {
                    navigate(inventoryRoute);
                });
            } else {
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
            const parsed = parseApiError(error);

            const formikFieldErrors = mapErrorToFormikErrors(error);
            if (Object.keys(formikFieldErrors).length > 0) {
                setErrors(formikFieldErrors);
            }

            const fieldErrorsMessage = formatFieldErrorsMessage(parsed.errors);
            let fullErrorMessage = parsed.message;
            if (fieldErrorsMessage) {
                fullErrorMessage += `:\n${fieldErrorsMessage}`;
            }

            Report.failure('Error', fullErrorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    if (!isOnline) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <OfflinePlaceholder
                        title="Inventory Management Unavailable Offline"
                        description="Creating or editing inventory items requires an internet connection to sync with the server. Please connect to the internet and try again."
                        variant="cloud"
                    />
                </div>
            </AppLayout>
        );
    }

    if (isMobile) {
        return (
            <MobileInventoryForm
                productId={productId}
                item={item}
                loading={loading}
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