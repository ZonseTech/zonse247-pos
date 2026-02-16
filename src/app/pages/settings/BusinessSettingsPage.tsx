import { FunctionComponent, useState } from 'react';
import FormWrapper from '../../components/FormWrapper';
import FormInput from '../../components/FormInput';
import { FormFieldCard, FormSwitch, NavigationCard } from '../../components';
import PaymentSettingsModal from './components/PaymentSettingsModal';
import TaxSettingsModal from './components/TaxSettingsModal';
import DiscountSettingsModal from './components/DiscountSettingsModal';

const BusinessSettingsPage: FunctionComponent = () => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

    return (
        <FormWrapper>
            <FormFieldCard>
                <FormInput
                    type="text"
                    name="receiptNumberPrefix"
                    label="Receipt ID Prefix"
                    placeholder="e.g., INV, REC, SALE"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    This prefix will appear before all receipt numbers (e.g., INV-00001)
                </p>
            </FormFieldCard>

            <NavigationCard
                title="Tax Settings"
                description="Configure tax calculation and display options"
                onClick={() => setIsTaxModalOpen(true)}
            />

            <NavigationCard
                title="Discount Settings"
                description="Configure discount options and limits"
                onClick={() => setIsDiscountModalOpen(true)}
            />

            <FormFieldCard>
                <FormSwitch
                    name="roundingEnabled"
                    label="Round Off"
                    description="Round transaction totals to the nearest value"
                />
            </FormFieldCard>

            <FormFieldCard>
                <FormSwitch
                    name="tableManagementEnabled"
                    label="Table Management"
                    description="Enable table management for restaurant operations"
                />
            </FormFieldCard>

            <FormFieldCard>
                <FormSwitch
                    name="inventoryHealthScoreEnabled"
                    label="Inventory Health Score"
                    description="Show inventory health metrics and alerts"
                />
            </FormFieldCard>

            <NavigationCard
                title="Payment Mode Settings"
                description="Configure available payment methods"
                onClick={() => setIsPaymentModalOpen(true)}
            />

            <PaymentSettingsModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />

            <TaxSettingsModal
                isOpen={isTaxModalOpen}
                onClose={() => setIsTaxModalOpen(false)}
            />

            <DiscountSettingsModal
                isOpen={isDiscountModalOpen}
                onClose={() => setIsDiscountModalOpen(false)}
            />
        </FormWrapper>
    );
};

export default BusinessSettingsPage;
