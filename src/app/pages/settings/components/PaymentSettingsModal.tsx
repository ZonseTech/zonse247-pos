import { FunctionComponent } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { BottomSheet, FormSwitch } from '../../../components';
import { usePaymentMethods } from '../../../hooks/usePaymentMethods';

interface PaymentSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface PaymentOptionProps {
    letter: string;
    label: string;
    description: string;
    fieldName: string;
}

const PaymentOption: FunctionComponent<PaymentOptionProps> = ({
    letter,
    label,
    description,
    fieldName,
}) => {
    return (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{letter}</span>
            </div>
            <div className="flex-1">
                <FormSwitch
                    name={fieldName}
                    label={label}
                    description={description}
                />
            </div>
        </div>
    );
};

const PaymentSettingsModal: FunctionComponent<PaymentSettingsModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { paymentMethods, isLoading, error } = usePaymentMethods();

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Payment Settings"
        >
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-500 dark:text-red-400">
                        Failed to load payment methods
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {error.message}
                    </p>
                </div>
            ) : paymentMethods.length === 0 ? (
                <div className="text-center py-12">
                    <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                        No payment methods configured
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Add payment methods from your admin panel
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {paymentMethods.map((method) => (
                        <PaymentOption
                            key={method.methodId}
                            letter={method.name.charAt(0).toUpperCase()}
                            label={method.name}
                            description={`Accept ${method.name.toLowerCase()} payments`}
                            fieldName={`paymentMethod_${method.methodId}`}
                        />
                    ))}
                </div>
            )}
        </BottomSheet>
    );
};

export default PaymentSettingsModal;
