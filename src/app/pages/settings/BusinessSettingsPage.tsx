import { FunctionComponent, useState, useEffect, useCallback } from 'react';
import FormWrapper from '../../components/FormWrapper';
import FormInput from '../../components/FormInput';
import { FormFieldCard, FormSwitch, NavigationCard } from '../../components';
import PaymentSettingsModal from './components/PaymentSettingsModal';
import TaxSettingsModal from './components/TaxSettingsModal';
import DiscountSettingsModal from './components/DiscountSettingsModal';
import MraSettingsModal from './components/MraSettingsModal';
import mraComplianceService from '../../services/mra-compliance.service';
import { HiOutlineShieldCheck, HiOutlineArrowPath } from 'react-icons/hi2';
import classNames from 'classnames';

const BusinessSettingsPage: FunctionComponent = () => {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [isMraModalOpen, setIsMraModalOpen] = useState(false);
    const [mraEnabled, setMraEnabled] = useState(false);
    const [mraLoading, setMraLoading] = useState(true);
    const [mraToggling, setMraToggling] = useState(false);

    const fetchMraStatus = useCallback(async () => {
        try {
            setMraLoading(true);
            const status = await mraComplianceService.getComplianceStatus();
            setMraEnabled(status?.isMraEnabled || false);
        } catch (error) {
            console.error('Failed to fetch MRA status:', error);
            setMraEnabled(false);
        } finally {
            setMraLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMraStatus();
    }, [fetchMraStatus]);

    const handleMraToggle = async () => {
        if (mraToggling) return;

        if (!mraEnabled) {
            setIsMraModalOpen(true);
            return;
        }

        setMraToggling(true);
        try {
            const response = await mraComplianceService.disableCompliance();
            if (response.success) {
                setMraEnabled(false);
            }
        } catch (error) {
            console.error('Failed to disable MRA:', error);
        } finally {
            setMraToggling(false);
        }
    };

    const handleMraModalClose = () => {
        setIsMraModalOpen(false);
        fetchMraStatus();
    };

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

            <FormFieldCard>
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2">
                            <HiOutlineShieldCheck className={classNames(
                                'w-5 h-5',
                                mraEnabled ? 'text-green-600' : 'text-gray-400'
                            )} />
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                MRA Compliance
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                            {mraEnabled
                                ? 'Enabled - Sales are submitted to MRA'
                                : 'Enable to submit sales to Malawi Revenue Authority'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleMraToggle}
                        disabled={mraLoading || mraToggling}
                        className={classNames(
                            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                            mraEnabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600',
                            (mraLoading || mraToggling) && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        <span
                            className={classNames(
                                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                mraEnabled ? 'translate-x-5' : 'translate-x-0'
                            )}
                        >
                            {(mraLoading || mraToggling) && (
                                <HiOutlineArrowPath className="w-4 h-4 m-0.5 animate-spin text-gray-400" />
                            )}
                        </span>
                    </button>
                </div>
            </FormFieldCard>

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

            <MraSettingsModal
                isOpen={isMraModalOpen}
                onClose={handleMraModalClose}
            />
        </FormWrapper>
    );
};

export default BusinessSettingsPage;
