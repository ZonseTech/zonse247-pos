import { FunctionComponent } from 'react';

interface FunctionButtonConfig {
    label: string;
    compactLabel: string;
    color: string;
    action: string;
    shortcut?: string;
    hiddenOnMobile?: boolean;
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
    compact?: boolean;
}

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
    compact = false,
}) => {
    const buttonConfigs: Array<FunctionButtonConfig> = [
        { label: 'VOID(F4)\nSALE', compactLabel: 'VOID\nF4', color: 'bg-red-500', action: 'void', shortcut: 'F4' },
        { label: 'PARK(F7)\nSALE', compactLabel: 'PARK\nF7', color: 'bg-red-500', action: 'park', shortcut: 'F7' },
        { label: 'PARKED(F3)\nSALES', compactLabel: 'PARKED\nF3', color: 'bg-red-500', action: 'parked', shortcut: 'F3' },
        { label: 'DRAWER\n(F6)', compactLabel: 'DRAWER\nF6', color: 'bg-blue-500', action: 'drawer', shortcut: 'F6' },
        { label: 'ITEM(F2)\nLOOKUP', compactLabel: 'LOOKUP\nF2', color: 'bg-blue-500', action: 'lookup', shortcut: 'F2', hiddenOnMobile: true },
        { label: 'REPRINT\n(F11)', compactLabel: 'REPRINT\nF11', color: 'bg-blue-500', action: 'reprint', shortcut: 'F11' },
        { label: 'DISCOUNT\n(F5)', compactLabel: 'DISC\nF5', color: 'bg-blue-500', action: 'discount', shortcut: 'F5' },
        { label: 'BANK(F12)\nTRASFER', compactLabel: 'BANK\nF12', color: 'bg-green-500', action: 'bank-transfer', shortcut: 'F12' },
        { label: 'E(F8)\nPAYMENT', compactLabel: 'E-PAY\nF8', color: 'bg-green-500', action: 'e-payment', shortcut: 'F8' },
        { label: 'PAY(F10)\nCASH', compactLabel: 'CASH\nF10', color: 'bg-green-500', action: 'pay-cash', shortcut: 'F10' },
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

    return (
        <div className="flex space-x-0.5 lg:space-x-1">
            {buttonConfigs.map((button, index) => (
                <button
                    key={index}
                    className={`${button.color} ${button.hiddenOnMobile ? 'hidden md:block' : ''} text-white font-bold hover:opacity-90 transition-opacity whitespace-pre-line flex-1 ${compact ? 'px-1.5 py-2 text-xs' : 'px-3 py-4 text-lg'}`}
                    onClick={() => handleButtonClick(button.action)}
                >
                    {compact ? button.compactLabel : button.label}
                </button>
            ))}
        </div>
    );
};

export default FunctionButtons;