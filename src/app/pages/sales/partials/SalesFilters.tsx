import { FC } from "react";
import { Flex } from "@radix-ui/themes";
import { StatusFilter } from "./StatusFilter";
import { PaymentMethodFilter } from "./PaymentMethodFilter";

interface SalesFiltersProps {
    selectedStatus: SaleStatus | TransactionStatus | "all";
    selectedPaymentMethod: string | "all";
    paymentMethods: PaymentMethod[];
    isLoadingPaymentMethods: boolean;
    onStatusChange: (status: SaleStatus | TransactionStatus | "all") => void;
    onPaymentMethodChange: (methodId: string | "all") => void;
}

const SalesFilters: FC<SalesFiltersProps> = ({
    selectedStatus,
    selectedPaymentMethod,
    paymentMethods,
    isLoadingPaymentMethods,
    onStatusChange,
    onPaymentMethodChange,
}) => {
    return (
        <Flex
            direction="column"
            gap={{ initial: "1", sm: "2" }}
            px={{ initial: "3", sm: "4" }}
            py={{ initial: "2", sm: "3" }}
            className="border-b border-gray-200 dark:border-gray-700"
            role="group"
            aria-label="Sale filters"
        >
            <StatusFilter
                selectedStatus={selectedStatus}
                onChange={onStatusChange}
            />
            <PaymentMethodFilter
                selectedPaymentMethod={selectedPaymentMethod}
                onChange={onPaymentMethodChange}
                paymentMethods={paymentMethods}
                isLoading={isLoadingPaymentMethods}
            />
        </Flex>
    );
};

export default SalesFilters;
