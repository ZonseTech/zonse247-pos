import type { FunctionComponent } from 'react';
import { Text, Flex, IconButton } from '@radix-ui/themes';
import { Trash2 } from 'lucide-react';
import classNames from 'classnames';
import { formatCurrency } from '../../../../utils';
import QuantityControl from '../../partials/QuantityControl';
import PriceControl from '../../partials/PriceControl';
import StaffPicker from './StaffPicker';
import type { CartRowProps } from './types';

const CartRow: FunctionComponent<CartRowProps> = ({
    item,
    isService,
    availableStock,
    staff,
    staffAssignment,
    onStaffChange,
    focusManager,
    customPriceInput,
    onPriceChange,
    onRemove,
    onUpdateQuantity,
    compact,
}) => {
    const cellPx = compact ? 'px-1' : 'px-2';
    const cellPy = compact ? 'py-1.5' : 'py-2.5';
    const cellClass = `${cellPx} ${cellPy}`;

    return (
        <tr className="group hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-colors">
            {/* Name + Category */}
            <td className={classNames(compact ? "px-1.5" : "px-3 lg:px-4", cellPy, "overflow-hidden")}>
                <Flex direction="column" gap="0" className="min-w-0">
                    <Flex align="center" gap="1">
                        <Text
                            size={compact ? '1' : '2'}
                            weight="medium"
                            className="text-gray-900 dark:text-gray-100"
                            truncate
                        >
                            {item.name}
                        </Text>
                        {!isService && (
                            <Text
                                size="1"
                                className="flex-shrink-0 px-1 rounded text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                            >
                                PRODUCT
                            </Text>
                        )}
                    </Flex>
                    {item.categoryDetails?.name && (
                        <Text size="1" color="gray" truncate>
                            {item.categoryDetails.name}
                        </Text>
                    )}
                </Flex>
            </td>

            {/* Staff */}
            <td className={cellClass}>
                {isService ? (
                    <StaffPicker
                        staffList={staff}
                        selectedStaffId={staffAssignment}
                        onChange={(staffId) => onStaffChange(item.variantId, staffId)}
                        compact={compact}
                    />
                ) : (
                    <Text size={compact ? '1' : '2'} color="gray" align="center" as="p">—</Text>
                )}
            </td>

            {/* Quantity */}
            <td className={classNames("text-center", cellClass)}>
                <QuantityControl
                    quantity={item.quantity}
                    onIncrease={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
                    onDecrease={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
                    onInputChange={(value) => onUpdateQuantity(item.variantId, value)}
                    itemId={item.variantId}
                    focusManager={focusManager}
                    maxStock={isService ? 999 : availableStock}
                    isDefaultItem={isService}
                    compact={compact}
                />
            </td>

            {/* Price */}
            <td className={classNames("text-right", cellClass)}>
                <PriceControl
                    sellingPrice={item.sellingPrice}
                    categoryId={item.categoryId}
                    productId={item.variantId}
                    customPriceInput={customPriceInput}
                    onPriceChange={onPriceChange}
                    focusManager={focusManager}
                    compact={compact}
                />
            </td>

            {/* Total */}
            <td className={classNames("text-right", cellClass)}>
                <Flex direction="column" align="end">
                    <Text size={compact ? '1' : '2'} weight="bold" className="text-gray-900 dark:text-white">
                        {formatCurrency(item.sellingPrice * item.quantity)}
                    </Text>
                    {item.quantity > 1 && (
                        <Text size="1" color="gray">
                            {item.quantity} × {formatCurrency(item.sellingPrice)}
                        </Text>
                    )}
                </Flex>
            </td>

            {/* Delete */}
            <td className={classNames("text-center", cellClass)}>
                <IconButton
                    size="1"
                    variant="ghost"
                    color="red"
                    onClick={() => onRemove(item.variantId)}
                    title="Remove item"
                >
                    <Trash2 size={compact ? 12 : 16} />
                </IconButton>
            </td>
        </tr>
    );
};

export default CartRow;
