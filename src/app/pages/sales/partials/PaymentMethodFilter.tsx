import { FC, useMemo, useCallback, useRef } from "react";
import { Banknote, Wallet, CreditCard, Smartphone, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';
import { Flex, Text, Button, IconButton, Select, Spinner } from '@radix-ui/themes';

interface PaymentMethodFilterProps {
    selectedPaymentMethod: string | 'all';
    onChange: (paymentMethodId: string | 'all') => void;
    paymentMethods: PaymentMethod[];
    isLoading?: boolean;
    compact?: boolean;
}

export const PaymentMethodFilter: FC<PaymentMethodFilterProps> = ({
    selectedPaymentMethod,
    onChange,
    paymentMethods,
    isLoading = false,
}) => {
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const getIcon = useCallback((name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('cash')) return Banknote;
        if (lowerName.includes('card') || lowerName.includes('credit') || lowerName.includes('debit')) return CreditCard;
        if (lowerName.includes('mobile') || lowerName.includes('m-pesa') || lowerName.includes('airtel')) return Smartphone;
        if (lowerName.includes('bank')) return Banknote;
        return Wallet;
    }, []);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 150;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    }, []);

    if (isLoading) {
        return (
            <Flex align="center" gap="2">
                <Spinner size="2" />
                <Text size="2" color="gray">Loading payment methods...</Text>
            </Flex>
        );
    }

    if (isMobile) {
        return (
            <Flex align="center" gap="2" width="100%">
                <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Payment:
                </Text>
                <Select.Root value={selectedPaymentMethod} onValueChange={onChange}>
                    <Select.Trigger
                        variant="surface"
                        placeholder="Select method"
                        className="flex-1"
                    />
                    <Select.Content position="popper">
                        <Select.Item value="all">
                            <Flex align="center" gap="2">
                                <Wallet className="w-4 h-4" />
                                All Methods
                            </Flex>
                        </Select.Item>
                        <Select.Separator />
                        {paymentMethods.map((method) => {
                            const Icon = getIcon(method.name);
                            return (
                                <Select.Item key={method.methodId} value={method.methodId}>
                                    <Flex align="center" gap="2">
                                        <Icon className="w-4 h-4" />
                                        {method.name}
                                    </Flex>
                                </Select.Item>
                            );
                        })}
                    </Select.Content>
                </Select.Root>
            </Flex>
        );
    }

    return (
        <Flex align="center" gap="2">
            <Text size={isEBN ? '1' : '2'} weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Payment:
            </Text>

            {isEBN && paymentMethods.length > 4 && (
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-4 h-4" />
                </IconButton>
            )}

            <Flex
                ref={scrollContainerRef}
                align="center"
                gap="1"
                className={`overflow-x-auto ${isEBN ? 'scrollbar-hide max-w-[400px]' : 'flex-wrap'}`}
                style={isEBN ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
            >
                <Button
                    size={isEBN ? '1' : '2'}
                    variant={selectedPaymentMethod === 'all' ? 'soft' : 'outline'}
                    color={selectedPaymentMethod === 'all' ? 'sky' : 'gray'}
                    onClick={() => onChange('all')}
                    className="whitespace-nowrap"
                >
                    <Wallet className={isEBN ? 'w-3 h-3' : 'w-4 h-4'} />
                    All
                </Button>

                {paymentMethods.map((method) => {
                    const Icon = getIcon(method.name);
                    const isSelected = selectedPaymentMethod === method.methodId;

                    return (
                        <Button
                            key={method.methodId}
                            size={isEBN ? '1' : '2'}
                            variant={isSelected ? 'soft' : 'outline'}
                            color={isSelected ? 'sky' : 'gray'}
                            onClick={() => onChange(method.methodId)}
                            className="whitespace-nowrap"
                        >
                            <Icon className={isEBN ? 'w-3 h-3' : 'w-4 h-4'} />
                            {method.name}
                        </Button>
                    );
                })}
            </Flex>

            {isEBN && paymentMethods.length > 4 && (
                <IconButton
                    size="1"
                    variant="ghost"
                    color="gray"
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-4 h-4" />
                </IconButton>
            )}
        </Flex>
    );
};
