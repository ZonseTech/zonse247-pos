import { useState, useEffect, type FunctionComponent } from 'react';
import { Flex, ScrollArea } from '@radix-ui/themes';
import { User } from 'lucide-react';
import classNames from 'classnames';
import { useInventory } from '../../../../hooks/useInventory';
import { useAppSelector } from '../../../../hooks/redux';
import { useAuth } from '../../../../context/AuthProvider';
import CartRow from './CartRow';
import EmptyCartState from './EmptyCartState';
import { getAvailableStock } from './utils';
import type { ServiceCartTableProps } from './types';

const ServiceCartTable: FunctionComponent<ServiceCartTableProps> = ({
    focusManager,
    customPriceInputs,
    onPriceChange,
    onStaffAssignmentsChange,
    compact = false,
}) => {
    const { cart, inventory, removeFromCart, updateQuantity } = useInventory();
    const { staff } = useAppSelector((state) => state.staff);
    const { user } = useAuth();

    const [staffAssignments, setStaffAssignments] = useState<Record<string, string>>({});

    useEffect(() => {
        onStaffAssignmentsChange?.(staffAssignments);
    }, [staffAssignments]);

    useEffect(() => {
        if (!staff.length || !user) return;
        const currentStaff = staff.find(s => s.userId === user.userId);
        if (!currentStaff) return;

        setStaffAssignments(prev => {
            const next = { ...prev };
            let changed = false;

            for (const item of cart) {
                if (!next[item.variantId] && item.trackInventory === false) {
                    next[item.variantId] = currentStaff.staffId;
                    changed = true;
                }
            }

            const cartIds = new Set(cart.map(i => i.variantId));
            for (const key of Object.keys(next)) {
                if (!cartIds.has(key)) {
                    delete next[key];
                    changed = true;
                }
            }

            return changed ? next : prev;
        });
    }, [cart, staff, user]);

    const handleStaffChange = (variantId: string, staffId: string) => {
        setStaffAssignments(prev => ({ ...prev, [variantId]: staffId }));
    };

    const thClass = classNames(
        "font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider",
        compact ? "text-[9px] px-1 py-1" : "text-xs px-2 py-2 lg:px-3 lg:py-3",
    );

    return (
        <ScrollArea scrollbars="both" className="h-full">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <table className="w-full border-collapse table-fixed" style={{ minWidth: compact ? 480 : 600 }}>
                    <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                        <tr>
                            <th className={classNames(thClass, "text-left")} style={{ width: '28%' }}>Service</th>
                            <th className={classNames(thClass, "text-left")} style={{ width: '18%' }}>
                                <Flex align="center" gap="1">
                                    <User size={compact ? 10 : 14} />
                                    Staff
                                </Flex>
                            </th>
                            <th className={classNames(thClass, "text-center")} style={{ width: '16%' }}>Qty</th>
                            <th className={classNames(thClass, "text-right")} style={{ width: '15%' }}>Price</th>
                            <th className={classNames(thClass, "text-right")} style={{ width: '15%' }}>Total</th>
                            <th className={classNames(thClass, "text-center")} style={{ width: '8%' }} />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {cart.length === 0 ? (
                            <EmptyCartState compact={compact} />
                        ) : (
                            cart.map(item => {
                                const isService = item.trackInventory === false;
                                return (
                                    <CartRow
                                        key={item.variantId}
                                        item={item}
                                        isService={isService}
                                        availableStock={getAvailableStock(item, inventory)}
                                        staff={staff}
                                        staffAssignment={staffAssignments[item.variantId] || ''}
                                        onStaffChange={handleStaffChange}
                                        focusManager={focusManager}
                                        customPriceInput={customPriceInputs[item.variantId] || ''}
                                        onPriceChange={onPriceChange}
                                        onRemove={removeFromCart}
                                        onUpdateQuantity={updateQuantity}
                                        compact={compact}
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </ScrollArea>
    );
};

export default ServiceCartTable;
