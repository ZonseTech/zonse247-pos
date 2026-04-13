import { FC } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { IconButton, Text, Flex, Badge, Card } from '@radix-ui/themes';

interface TierCardProps {
    tier: LoyaltyTier;
    onEdit: () => void;
    onDelete: () => void;
}

const TierCard: FC<TierCardProps> = ({ tier, onEdit, onDelete }) => (
    <Card variant="surface">
        <Flex align="center" justify="between">
            <div className="flex-1 min-w-0">
                <Flex align="center" gap="2" mb="1">
                    <Text size="2" weight="bold">{tier.name}</Text>
                    <Badge color="blue" variant="soft" size="1">{tier.pointsMultiplier}×</Badge>
                    {tier.discountPercentage > 0 && (
                        <Badge color="green" variant="soft" size="1">{tier.discountPercentage}% off</Badge>
                    )}
                </Flex>
                <Text size="1" color="gray">
                    {tier.minPoints.toLocaleString()} pts to qualify
                    {tier.benefits && ` · ${tier.benefits}`}
                </Text>
            </div>
            <Flex gap="1" ml="2">
                <IconButton size="1" variant="ghost" color="gray" onClick={onEdit}>
                    <Pencil className="w-3.5 h-3.5" />
                </IconButton>
                <IconButton size="1" variant="ghost" color="red" onClick={onDelete}>
                    <Trash2 className="w-3.5 h-3.5" />
                </IconButton>
            </Flex>
        </Flex>
    </Card>
);

export default TierCard;
