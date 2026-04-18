import { FC } from 'react';
import { Text, Flex, Badge } from '@radix-ui/themes';

const badgeColor: Record<string, 'green' | 'red' | 'blue' | 'orange'> = {
    EARN: 'green', REDEEM: 'red', ADJUST: 'blue', EXPIRE: 'orange',
};

interface LoyaltyTxRowProps {
    tx: LoyaltyTransaction;
}

const LoyaltyTxRow: FC<LoyaltyTxRowProps> = ({ tx }) => {
    const isPositive = tx.points > 0;
    return (
        <Flex align="center" justify="between" py="2" px="2" className="rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <Flex align="center" gap="2">
                <Badge color={badgeColor[tx.type] || 'blue'} variant="soft" size="1">{tx.type}</Badge>
                <Text size="1" color="gray">{new Date(tx.createdAt).toLocaleDateString()}</Text>
            </Flex>
            <Text size="2" weight="bold" className={isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {isPositive ? '+' : ''}{tx.points.toLocaleString()}
            </Text>
        </Flex>
    );
};

export default LoyaltyTxRow;
