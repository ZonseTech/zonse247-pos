import { FC } from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { Text, Flex, Badge } from '@radix-ui/themes';

const txStyleMap: Record<string, { color: 'green' | 'red' | 'blue' | 'orange'; icon: typeof TrendingUp; bg: string; iconCls: string }> = {
    EARN: { color: 'green', icon: TrendingUp, bg: 'bg-green-100 dark:bg-green-900/30', iconCls: 'text-green-600 dark:text-green-400' },
    REDEEM: { color: 'red', icon: TrendingDown, bg: 'bg-red-100 dark:bg-red-900/30', iconCls: 'text-red-600 dark:text-red-400' },
    ADJUST: { color: 'blue', icon: Award, bg: 'bg-blue-100 dark:bg-blue-900/30', iconCls: 'text-blue-600 dark:text-blue-400' },
    EXPIRE: { color: 'orange', icon: TrendingDown, bg: 'bg-orange-100 dark:bg-orange-900/30', iconCls: 'text-orange-600 dark:text-orange-400' },
};

interface TransactionRowProps {
    tx: LoyaltyTransaction;
}

const TransactionRow: FC<TransactionRowProps> = ({ tx }) => {
    const config = txStyleMap[tx.type] || txStyleMap.ADJUST;
    const Icon = config.icon;
    const isPositive = tx.points > 0;

    return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Flex align="center" gap="3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}>
                    <Icon className={`w-4 h-4 ${config.iconCls}`} />
                </div>
                <div>
                    <Flex align="center" gap="2">
                        <Badge color={config.color} variant="soft" size="1">{tx.type}</Badge>
                        <Text size="1" color="gray">
                            {new Date(tx.createdAt).toLocaleDateString()}
                        </Text>
                    </Flex>
                    {tx.description && (
                        <Text size="1" color="gray" className="block mt-0.5 truncate max-w-xs">{tx.description}</Text>
                    )}
                </div>
            </Flex>
            <div className="text-right">
                <Text size="2" weight="bold" className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {isPositive ? '+' : ''}{tx.points.toLocaleString()}
                </Text>
                <Text size="1" color="gray" className="block">
                    Bal: {tx.balanceAfter.toLocaleString()}
                </Text>
            </div>
        </div>
    );
};

export default TransactionRow;
