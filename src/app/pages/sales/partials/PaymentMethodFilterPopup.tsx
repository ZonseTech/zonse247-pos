import { FunctionComponent, useMemo } from 'react';
import { Filter, Banknote, Smartphone, CreditCard, Wallet, Check, X } from 'lucide-react';
import { Text, IconButton, Theme } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import FloatingFilterButton from '../../../components/buttons/FloatingFilterButton';
import { usePaymentMethods } from '../../../hooks/usePaymentMethods';
import { getLeafPaymentMethods } from '../../../utils/paymentMethod.helper';

interface PaymentMethodFilterPopupProps {
    isOpen: boolean;
    selectedPaymentMethod: string | null;
    onToggle: () => void;
    onSelect: (methodId: string | null) => void; fabClassName?: string;
}

const getMethodIcon = (name: string): { icon: typeof Banknote; color: string } => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('cash')) return { icon: Banknote, color: 'text-green-500' };
    if (lowerName.includes('mobile')) return { icon: Smartphone, color: 'text-orange-600' };
    if (lowerName.includes('bank') || lowerName.includes('pos')) return { icon: CreditCard, color: 'text-blue-600' };
    return { icon: Wallet, color: 'text-gray-500' };
};

const PaymentMethodFilterPopup: FunctionComponent<PaymentMethodFilterPopupProps> = ({
    isOpen,
    selectedPaymentMethod,
    onToggle,
    onSelect,
    fabClassName,
}) => {
    const { paymentMethods: allPaymentMethods } = usePaymentMethods();
    const paymentMethods = useMemo(() => getLeafPaymentMethods(allPaymentMethods), [allPaymentMethods]);
    const selectedMethod = paymentMethods.find(m => m.methodId === selectedPaymentMethod);

    return (
        <>
            <FloatingFilterButton
                onClick={onToggle}
                isActive={!!selectedPaymentMethod}
                label={'Filter: ' + selectedMethod?.name}
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

                                    {paymentMethods.map((method) => {
                                        const { icon: Icon, color } = getMethodIcon(method.name);
                                        return (
                                            <button
                                                key={method.methodId}
                                                onClick={() => onSelect(method.methodId)}
                                                className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors ${
                                                    selectedPaymentMethod === method.methodId
                                                        ? 'bg-sky-50 dark:bg-sky-900/30 border-2 border-sky-500'
                                                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                                        <Icon className={`w-5 h-5 ${color}`} />
                                                    </div>
                                                    <Text weight="medium">{method.name}</Text>
                                                </div>
                                                {selectedPaymentMethod === method.methodId && (
                                                    <Check className="w-5 h-5 text-sky-500" />
                                                )}
                                            </button>
                                        );
                                    })}
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
