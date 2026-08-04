import { FunctionComponent } from 'react';
import classNames from 'classnames';

type ButtonColorType = 'red' | 'blue' | 'green' | 'orange';

interface FunctionButtonConfig {
    label: string;
    compactLabel: string;
    ebnLabel: string;
    colorType: ButtonColorType;
    action: string;
    shortcut?: string;
    hiddenOnMobile?: boolean;
    priority?: 'high' | 'normal'; // For EBN layout - high priority buttons are larger
}

interface FunctionButtonsProps {
    onVoidSale?: () => void;
    onParkSale?: () => void;
    onParkedSales?: () => void;
    onOpenDrawer?: () => void;
    onItemLookup?: () => void;
    onReprint?: () => void;
    onDiscount?: () => void;
    onBankTransfer?: () => void;
    onEPayment?: () => void;
    onPayCash?: () => void;
    onMultiplePayment?: () => void;
    compact?: boolean;
    serviceMode?: boolean;
    hasActiveOrder?: boolean;
    canVoidSale?: boolean;
    canParkSale?: boolean;
    canViewParkedSales?: boolean;
    canOpenDrawer?: boolean;
    canLookupItems?: boolean;
    canReprint?: boolean;
    canDiscount?: boolean;
    canSplitPayment?: boolean;
    canProcessPayments?: boolean;
}

const colorClasses: Record<ButtonColorType, { base: string; hover: string; active: string }> = {
    red: {
        base: 'bg-red-500',
        hover: 'hover:bg-red-500',
        active: 'active:bg-red-700'
    },
    blue: {
        base: 'bg-sky-500',
        hover: 'hover:bg-sky-500',
        active: 'active:bg-sky-700'
    },
    green: {
        base: 'bg-green-500',
        hover: 'hover:bg-green-500',
        active: 'active:bg-green-700'
    },
    orange: {
        base: 'bg-orange-500',
        hover: 'hover:bg-orange-600',
        active: 'active:bg-orange-700'
    }
};

const FunctionButtons: FunctionComponent<FunctionButtonsProps> = ({
    onVoidSale,
    onParkSale,
    onParkedSales,
    onOpenDrawer,
    onItemLookup,
    onReprint,
    onDiscount,
    onBankTransfer,
    onEPayment,
    onPayCash,
    onMultiplePayment,
    compact = false,
    serviceMode = false,
    hasActiveOrder = false,
    canVoidSale = true,
    canParkSale = true,
    canViewParkedSales = true,
    canOpenDrawer = true,
    canLookupItems = true,
    canReprint = true,
    canDiscount = true,
    canSplitPayment = true,
    canProcessPayments = true,
}) => {
    const buttonConfigs: Array<FunctionButtonConfig> = [
        { label: 'VOID(F4)\nSALE', compactLabel: 'VOID\nF4', ebnLabel: 'VOID', colorType: 'red', action: 'void', shortcut: 'F4', priority: 'normal' },
        serviceMode
            ? hasActiveOrder
                ? { label: 'UPDATE(F7)\nORDER', compactLabel: 'UPDATE\nF7', ebnLabel: 'UPDATE', colorType: 'blue', action: 'park', shortcut: 'F7', priority: 'normal' }
                : { label: 'CREATE(F7)\nORDER', compactLabel: 'ORDER\nF7', ebnLabel: 'ORDER', colorType: 'blue', action: 'park', shortcut: 'F7', priority: 'normal' }
            : { label: 'PARK(F7)\nSALE', compactLabel: 'PARK\nF7', ebnLabel: 'PARK', colorType: 'red', action: 'park', shortcut: 'F7', priority: 'normal' },
        serviceMode
            ? { label: 'SERVICE(F3)\nORDERS', compactLabel: 'ORDERS\nF3', ebnLabel: 'ORDERS', colorType: 'blue', action: 'parked', shortcut: 'F3', priority: 'normal' }
            : { label: 'PARKED(F3)\nSALES', compactLabel: 'PARKED\nF3', ebnLabel: 'PARKED', colorType: 'red', action: 'parked', shortcut: 'F3', priority: 'normal' },
        { label: 'DRAWER\n(F6)', compactLabel: 'DRAWER\nF6', ebnLabel: 'DRAWER', colorType: 'blue', action: 'drawer', shortcut: 'F6', priority: 'normal' },
        ...(!serviceMode ? [{ label: 'ITEM(F2)\nLOOKUP', compactLabel: 'LOOKUP\nF2', ebnLabel: 'LOOKUP', colorType: 'blue' as ButtonColorType, action: 'lookup', shortcut: 'F2', hiddenOnMobile: true, priority: 'normal' as const }] : []),
        { label: 'REPRINT\n(F11)', compactLabel: 'REPRINT\nF11', ebnLabel: 'REPRINT', colorType: 'blue', action: 'reprint', shortcut: 'F11', priority: 'normal' },
        { label: 'DISCOUNT\n(F5)', compactLabel: 'DISC\nF5', ebnLabel: 'DISC', colorType: 'orange', action: 'discount', shortcut: 'F5', priority: 'normal' },
        { label: 'SPLIT(F9)\nPAYMENT', compactLabel: 'SPLIT\nF9', ebnLabel: 'SPLIT', colorType: 'orange', action: 'multiple-payment', shortcut: 'F9', priority: 'high' },
        { label: 'BANK(F12)\nTRASFER', compactLabel: 'BANK\nF12', ebnLabel: 'BANK', colorType: 'green', action: 'bank-transfer', shortcut: 'F12', priority: 'high' },
        { label: 'E(F8)\nPAYMENT', compactLabel: 'E-PAY\nF8', ebnLabel: 'E-PAY', colorType: 'green', action: 'e-payment', shortcut: 'F8', priority: 'high' },
        { label: 'PAY(F10)\nCASH', compactLabel: 'CASH\nF10', ebnLabel: 'CASH', colorType: 'green', action: 'pay-cash', shortcut: 'F10', priority: 'high' },
    ];

    const handleButtonClick = (action: string) => {
        switch (action) {
            case 'void':
                onVoidSale?.();
                break;
            case 'park':
                onParkSale?.();
                break;
            case 'parked':
                onParkedSales?.();
                break;
            case 'drawer':
                onOpenDrawer?.();
                break;
            case 'lookup':
                onItemLookup?.();
                break;
            case 'reprint':
                onReprint?.();
                break;
            case 'discount':
                onDiscount?.();
                break;
            case 'multiple-payment':
                onMultiplePayment?.();
                break;
            case 'bank-transfer':
                onBankTransfer?.();
                break;
            case 'e-payment':
                onEPayment?.();
                break;
            case 'pay-cash':
                onPayCash?.();
                break;
            default:
                console.log('Unknown action:', action);
        }
    };

    const getButtonClasses = (button: FunctionButtonConfig) => {
        const colors = colorClasses[button.colorType];
        return classNames(
            colors.base,
            colors.hover,
            colors.active,
            'text-white font-bold transition-all whitespace-pre-line flex-1',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white/50',
            'active:scale-[0.98]',
            button.hiddenOnMobile && 'hidden md:flex',
            'flex items-center justify-center'
        );
    };

    const isActionAllowed = (action: string): boolean => {
        switch (action) {
            case 'void':
                return canVoidSale;
            case 'park':
                return canParkSale;
            case 'parked':
                return canViewParkedSales;
            case 'drawer':
                return canOpenDrawer;
            case 'lookup':
                return canLookupItems;
            case 'reprint':
                return canReprint;
            case 'discount':
                return canDiscount;
            case 'multiple-payment':
                return canSplitPayment;
            case 'bank-transfer':
            case 'e-payment':
            case 'pay-cash':
                return canProcessPayments;
            default:
                return true;
        }
    };

    const visibleButtons = buttonConfigs.filter(button => isActionAllowed(button.action));

    // EBN compact layout - 2 rows for better touch targets
    if (compact) {
        // Split into two rows: utility functions on top, payment functions on bottom
        const topRow = visibleButtons.filter(button => ['void', 'park', 'parked', 'drawer', 'lookup', 'reprint', 'discount'].includes(button.action));
        const bottomRow = visibleButtons.filter(button => ['multiple-payment', 'bank-transfer', 'e-payment', 'pay-cash'].includes(button.action));

        return (
            <div className="flex flex-col gap-0.5">
                {/* Top row - utility functions */}
                <div className="grid grid-cols-7 gap-0.5">
                    {topRow.map((button, index) => (
                        <button
                            key={index}
                            className={classNames(
                                getButtonClasses(button),
                                'py-1.5 px-1 text-[10px] leading-tight min-h-[36px]'
                            )}
                            onClick={() => handleButtonClick(button.action)}
                            title={`${button.label.replace('\n', ' ')} (${button.shortcut})`}
                        >
                            <span className="flex flex-col items-center">
                                <span className="font-bold">{button.ebnLabel}</span>
                                <span className="text-[8px] opacity-80">{button.shortcut}</span>
                            </span>
                        </button>
                    ))}
                </div>
                {/* Bottom row - payment functions (larger touch targets) */}
                <div className="grid grid-cols-4 gap-0.5">
                    {bottomRow.map((button, index) => (
                        <button
                            key={index}
                            className={classNames(
                                getButtonClasses(button),
                                'py-2 px-2 text-xs leading-tight min-h-[44px] font-extrabold'
                            )}
                            onClick={() => handleButtonClick(button.action)}
                            title={`${button.label.replace('\n', ' ')} (${button.shortcut})`}
                        >
                            <span className="flex flex-col items-center">
                                <span className="text-sm font-bold">{button.ebnLabel}</span>
                                <span className="text-[9px] opacity-80">{button.shortcut}</span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Standard desktop layout - single row
    return (
        <div className="flex space-x-0.5 lg:space-x-1">
            {visibleButtons.map((button, index) => (
                <button
                    key={index}
                    className={classNames(
                        getButtonClasses(button),
                        'px-3 py-4 text-lg'
                    )}
                    onClick={() => handleButtonClick(button.action)}
                    title={button.shortcut}
                >
                    {button.label}
                </button>
            ))}
        </div>
    );
};

export default FunctionButtons;