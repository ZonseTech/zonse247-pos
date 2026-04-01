import { FunctionComponent } from 'react';
import { Filter, Banknote, Smartphone, CreditCard, Check, X } from 'lucide-react';
import { Text, IconButton, Theme } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import FloatingFilterButton from '../../../components/buttons/FloatingFilterButton';

interface PaymentMethod {
    id: string;
    label: string;
    icon: typeof Banknote;
    color: string;
}

interface PaymentMethodFilterPopupProps {
    isOpen: boolean;
    selectedPaymentMethod: string | null;
    onToggle: () => void;
    onSelect: (methodId: string | null) => void; fabClassName?: string;
}

const paymentMethods: PaymentMethod[] = [
    { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-500' },
    { id: 'mobile-money', label: 'Mobile Money', icon: Smartphone, color: 'text-orange-600' },
    { id: 'bank-transfer', label: 'Bank Transfer', icon: CreditCard, color: 'text-blue-600' },
];

const PaymentMethodFilterPopup: FunctionComponent<PaymentMethodFilterPopupProps> = ({
    isOpen,
    selectedPaymentMethod,
    onToggle,
    onSelect,
    fabClassName,
}) => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);

    return (
        <>
            <FloatingFilterButton
                onClick={onToggle}
                isActive={!!selectedPaymentMethod}
                label={'Filter: ' + selectedMethod?.label}
                className={fabClassName}
            />

            <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onToggle()}>
                <Dialog.Portal>
                    <Theme appearance="inherit" accentColor="cyan">
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 flex justify-center outline-none">
                            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl p-4 pb-8 animate-slide-up">
                                <div className="flex items-center justify-between mb-4">
                                    <Dialog.Title asChild>
                                        <Text as="p" size="4" weight="bold">
                                            Filter by Payment Method
                                        </Text>
                                    </Dialog.Title>
                                    <Dialog.Close asChild>
                                        <IconButton variant="ghost" size="2" color="gray" radius="full">
                                            <X className="w-5 h-5" />
                                        </IconButton>
                                    </Dialog.Close>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={() => onSelect(null)}
                                        className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                                            selectedPaymentMethod === null
                                                ? 'bg-sky-50 dark:bg-sky-900/30 border-2 border-sky-500'
                                                : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                            </div>
                                            <Text weight="medium">All Methods</Text>
                                        </div>
                                        {selectedPaymentMethod === null && (
                                            <Check className="w-5 h-5 text-sky-500" />
                                        )}
                                    </button>

                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            onClick={() => onSelect(method.id)}
                                            className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                                                selectedPaymentMethod === method.id
                                                    ? 'bg-sky-50 dark:bg-sky-900/30 border-2 border-sky-500'
                                                    : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                    <method.icon className={`w-5 h-5 ${method.color}`} />
                                                </div>
                                                <Text weight="medium">{method.label}</Text>
                                            </div>
                                            {selectedPaymentMethod === method.id && (
                                                <Check className="w-5 h-5 text-sky-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Dialog.Content>
                    </Theme>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export default PaymentMethodFilterPopup;
