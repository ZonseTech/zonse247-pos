import type { FunctionComponent } from 'react';
import { Text, Flex } from '@radix-ui/themes';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import classNames from 'classnames';

const EmptyCartState: FunctionComponent<{ compact?: boolean }> = ({ compact }) => (
    <tr>
        <td colSpan={6}>
            <Flex
                direction="column"
                align="center"
                justify="center"
                py={compact ? '5' : '9'}
                px="4"
            >
                <Flex
                    align="center"
                    justify="center"
                    className={classNames(
                        "rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 mb-4",
                        compact ? "w-14 h-14" : "w-20 h-20",
                    )}
                >
                    <HiOutlineShoppingCart className={classNames(
                        "text-gray-300 dark:text-gray-600",
                        compact ? "h-7 w-7" : "h-10 w-10",
                    )} />
                </Flex>
                <Text size={compact ? '1' : '3'} weight="medium" color="gray">
                    No items added
                </Text>
                <Text size="1" color="gray" align="center" style={{ maxWidth: 200 }}>
                    Select a service or product from the catalog to get started
                </Text>
            </Flex>
        </td>
    </tr>
);

export default EmptyCartState;
