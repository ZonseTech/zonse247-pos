import { type FunctionComponent, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Package, Users, Truck, ShoppingCart, ClipboardList, UserPlus, Receipt } from 'lucide-react';
import classNames from 'classnames';
import { useQuickAction } from '../../context/QuickActionContext';
import type { QuickActionType, QuickActionConfig } from '../../../types/navigation';
import { ROUTES } from '../../utils/constants';

// ─── Quick-action definitions ─────────────────────────────────────────────────
const QUICK_ACTIONS: QuickActionConfig[] = [
    {
        type: 'new-product',
        label: 'New Product',
        icon: <Package size={20} />,
        shortcut: 'Ctrl+Shift+P',
    },
    {
        type: 'new-customer',
        label: 'New Customer',
        icon: <Users size={20} />,
        shortcut: 'Ctrl+Shift+C',
    },
    {
        type: 'new-supplier',
        label: 'New Supplier',
        icon: <Truck size={20} />,
    },
    {
        type: 'new-purchase-order',
        label: 'New Purchase Order',
        icon: <ShoppingCart size={20} />,
    },
    {
        type: 'new-requisition',
        label: 'New Requisition',
        icon: <ClipboardList size={20} />,
    },
    {
        type: 'new-user',
        label: 'New User',
        icon: <UserPlus size={20} />,
    },
    {
        type: 'new-expense',
        label: 'Record Expense',
        icon: <Receipt size={20} />,
    },
];

const ACTION_ROUTES: Record<QuickActionType, string> = {
    'new-product': ROUTES.INVENTORY_FORM,
    'new-customer': ROUTES.CUSTOMERS, // customer uses in-page modal
    'new-supplier': ROUTES.SUPPLIER_FORM,
    'new-purchase-order': ROUTES.PURCHASE_ORDER_FORM,
    'new-requisition': ROUTES.PURCHASE_REQUISITION_FORM,
    'new-user': ROUTES.USER_FORM,
    'new-expense': ROUTES.EXPENSES, // expense uses in-page modal
};

/**
 * A command-palette style modal for quick creation actions.
 * Opens with a shortcut (e.g. Ctrl+K) and lets the user pick
 * which entity to create, then navigates to the relevant form page.
 */
const QuickActionModal: FunctionComponent = () => {
    const { activeAction, closeAction } = useQuickAction();
    const navigate = useNavigate();

    // When modal is in "picker" mode (activeAction === 'picker' is unused),
    // instead we open with activeAction = null but this component won't render.
    // So we use a separate prop for "picker open".
    // For now, if an action is selected directly, navigate immediately.

    const handleSelect = useCallback(
        (type: QuickActionType) => {
            closeAction();
            const route = ACTION_ROUTES[type];
            if (route) navigate(route);
        },
        [closeAction, navigate],
    );

    // If an action was dispatched directly, navigate and close
    useEffect(() => {
        if (activeAction) {
            handleSelect(activeAction);
        }
    }, [activeAction, handleSelect]);

    // This component only renders the picker palette when needed.
    // For now, actions are dispatched directly from keyboard shortcuts
    // or the sidebar. In the future, this can be enhanced with a
    // command palette search UI.
    return null;
};

/**
 * Standalone picker modal — can be opened with a keyboard shortcut.
 * Renders a grid of quick-action tiles.
 */
export const QuickActionPicker: FunctionComponent<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
    const navigate = useNavigate();

    const handleSelect = (type: QuickActionType) => {
        onOpenChange(false);
        const route = ACTION_ROUTES[type];
        if (route) navigate(route);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                <Dialog.Content
                    className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50 w-[95vw] max-w-md rounded-xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 focus:outline-none"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
                        <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                            Quick Actions
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-4">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.type}
                                onClick={() => handleSelect(action.type)}
                                className={classNames(
                                    'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-150',
                                    'text-gray-600 dark:text-gray-400 hover:bg-sky-50 dark:hover:bg-sky-500/10',
                                    'hover:text-sky-600 dark:hover:text-sky-400 active:scale-[0.97]',
                                    'border border-gray-100 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-500/30',
                                )}
                            >
                                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-sky-100">
                                    {action.icon}
                                </div>
                                <span className="text-xs font-medium text-center">
                                    {action.label}
                                </span>
                                {action.shortcut && (
                                    <kbd className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                                        {action.shortcut}
                                    </kbd>
                                )}
                            </button>
                        ))}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default QuickActionModal;

