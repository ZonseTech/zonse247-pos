import { FC } from "react";
import { Dialog, Flex, Button, Text, TextField, IconButton, Select, SegmentedControl } from "@radix-ui/themes";
import { Wallet, Check, X, Trash2 } from "lucide-react";
import { Notify } from "notiflix";
import { formatCurrency } from "../../../utils";
import { usePaymentServiceProviders } from "../../../hooks/usePaymentServiceProviders";
import {
    usePayments,
    PAYMENT_METHODS,
    getPaymentMethodIcon,
    getPaymentMethodLabel,
    getPaymentMethodColor,
    type PaymentEntryState,
    type PaymentMethodType,
} from "../../pos/partials/multiple-payment";

interface BalanceCashModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalSalesValue: number;
}

interface PaymentRowProps {
    payment: PaymentEntryState;
    onUpdate: (id: string, field: keyof PaymentEntryState, value: string) => void;
    onRemove: (id: string) => void;
}

const CashPaymentRow: FC<PaymentRowProps> = ({ payment, onUpdate, onRemove }) => (
    <Flex align="center" gap="3" className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className={`p-2 rounded-lg text-white flex-shrink-0 ${getPaymentMethodColor(payment.paymentMethodId)}`}>
            {getPaymentMethodIcon(payment.paymentMethodId)}
        </div>
        <Text size="2" weight="medium" className="w-28 flex-shrink-0 truncate">
            {getPaymentMethodLabel(payment.paymentMethodId)}
        </Text>
        <TextField.Root
            type="number"
            min={0}
            step="any"
            size="2"
            placeholder="0.00"
            value={payment.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(payment.id, "amount", e.target.value)}
            className="flex-1"
        />
        <IconButton variant="ghost" color="red" size="1" onClick={() => onRemove(payment.id)} aria-label="Remove Cash">
            <Trash2 className="w-4 h-4" />
        </IconButton>
    </Flex>
);

const NonCashPaymentRow: FC<PaymentRowProps> = ({ payment, onUpdate, onRemove }) => {
    const isMobileMoney = payment.paymentMethodId === PAYMENT_METHODS.MOBILE_MONEY;
    const { providers } = usePaymentServiceProviders(payment.paymentMethodId);

    return (
        <div className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
            <Flex align="center" gap="3">
                <div className={`p-2 rounded-lg text-white flex-shrink-0 ${getPaymentMethodColor(payment.paymentMethodId)}`}>
                    {getPaymentMethodIcon(payment.paymentMethodId)}
                </div>
                <Text size="2" weight="medium" className="flex-1 truncate">
                    {getPaymentMethodLabel(payment.paymentMethodId)}
                </Text>
                <IconButton
                    variant="ghost"
                    color="red"
                    size="1"
                    onClick={() => onRemove(payment.id)}
                    aria-label={`Remove ${getPaymentMethodLabel(payment.paymentMethodId)}`}
                >
                    <Trash2 className="w-4 h-4" />
                </IconButton>
            </Flex>

            <Flex gap="3">
                <Select.Root value={payment.providerId || ""} onValueChange={(value) => onUpdate(payment.id, "providerId", value)}>
                    <Select.Trigger
                        variant="surface"
                        placeholder={isMobileMoney ? "Select network..." : "Select bank..."}
                        className="flex-1"
                    />
                    <Select.Content position="popper">
                        {providers.map((provider) => (
                            <Select.Item key={provider.providerId} value={provider.providerId}>
                                {provider.name}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>

                {isMobileMoney ? (
                    <TextField.Root
                        type="tel"
                        size="2"
                        placeholder="Phone Number"
                        value={payment.phoneNumber || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(payment.id, "phoneNumber", e.target.value)}
                        className="flex-1"
                    />
                ) : (
                    <TextField.Root
                        size="2"
                        placeholder="Reference / Auth Code"
                        value={payment.reference || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(payment.id, "reference", e.target.value)}
                        className="flex-1"
                    />
                )}

                <TextField.Root
                    type="number"
                    min={0}
                    step="any"
                    size="2"
                    placeholder="Amount"
                    value={payment.amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate(payment.id, "amount", e.target.value)}
                    className="flex-1"
                />
            </Flex>
        </div>
    );
};

const BalanceCashModal: FC<BalanceCashModalProps> = ({ isOpen, onClose, totalSalesValue }) => {
    const {
        payments,
        totalPaid,
        remaining,
        isFullyPaid,
        addPayment,
        removePayment,
        updatePayment,
    } = usePayments(totalSalesValue, isOpen);

    const canConfirm = isFullyPaid && payments.length > 0;

    const handleConfirm = () => {
        if (!canConfirm) return;
        // TODO: persist this breakdown once day-end close posting is wired up.
        Notify.success("Cash balance recorded for this trading day.");
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Content maxWidth="720px">
                <Dialog.Title>
                    <Flex align="center" gap="3">
                        <div className="p-2 bg-sky-50 dark:bg-sky-900/30 rounded-lg">
                            <Wallet className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                        Balance Cash
                    </Flex>
                </Dialog.Title>

                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                            <Text as="p" size="1" color="gray">Total Sales</Text>
                            <Text as="p" size="4" weight="bold" className="text-gray-900 dark:text-white">
                                {formatCurrency(totalSalesValue)}
                            </Text>
                        </div>
                        <div>
                            <Text as="p" size="1" color="gray">Entered</Text>
                            <Text as="p" size="4" weight="bold" className="text-sky-600 dark:text-sky-400">
                                {formatCurrency(totalPaid)}
                            </Text>
                        </div>
                        <div>
                            <Text as="p" size="1" color="gray">Remaining</Text>
                            <Text
                                as="p"
                                size="4"
                                weight="bold"
                                className={remaining > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}
                            >
                                {formatCurrency(remaining)}
                            </Text>
                        </div>
                    </div>

                    <Flex align="center" gap="3" wrap="nowrap" className="overflow-x-auto">
                        <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            Add Payment
                        </Text>
                        <SegmentedControl.Root
                            size="2"
                            onValueChange={(value) => addPayment(value as PaymentMethodType)}
                        >
                            <SegmentedControl.Item value={PAYMENT_METHODS.CASH}>Cash</SegmentedControl.Item>
                            <SegmentedControl.Item value={PAYMENT_METHODS.POS}>POS</SegmentedControl.Item>
                            <SegmentedControl.Item value={PAYMENT_METHODS.MOBILE_MONEY}>Mobile Money</SegmentedControl.Item>
                            <SegmentedControl.Item value={PAYMENT_METHODS.BANK_TRANSFER}>Bank Transfer</SegmentedControl.Item>
                        </SegmentedControl.Root>
                    </Flex>

                    <div className="space-y-2">
                        {payments.length === 0 ? (
                            <Text size="2" color="gray" className="block text-center py-6">
                                No payment methods added yet — select one above.
                            </Text>
                        ) : (
                            payments.map((payment) =>
                                payment.paymentMethodId === PAYMENT_METHODS.CASH ? (
                                    <CashPaymentRow
                                        key={payment.id}
                                        payment={payment}
                                        onUpdate={updatePayment}
                                        onRemove={removePayment}
                                    />
                                ) : (
                                    <NonCashPaymentRow
                                        key={payment.id}
                                        payment={payment}
                                        onUpdate={updatePayment}
                                        onRemove={removePayment}
                                    />
                                )
                            )
                        )}
                    </div>
                </div>

                <Flex gap="3" mt="4" justify="end">
                    <Button color="gray" variant="soft" onClick={onClose}>
                        <X className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!canConfirm}>
                        <Check className="w-4 h-4" />
                        Confirm Balance
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default BalanceCashModal;
