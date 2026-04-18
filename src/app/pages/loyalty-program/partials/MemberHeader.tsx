import { FC } from 'react';
import { Phone, Mail, Award } from 'lucide-react';
import { Text, Flex, Badge, Button as RadixButton } from '@radix-ui/themes';
import * as Avatar from '@radix-ui/react-avatar';
import StatCard from './StatCard';

interface MemberHeaderProps {
    member: LoyaltyMember;
    dashboard: LoyaltyMemberDashboard | null;
    onAdjustPoints: () => void;
}

const MemberHeader: FC<MemberHeaderProps> = ({ member, dashboard, onAdjustPoints }) => {
    const m = dashboard?.member || member;

    return (
        <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <Flex gap="3" align="start">
                <Avatar.Root className="flex-shrink-0 w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center overflow-hidden">
                    <Avatar.Fallback className="text-white font-bold text-lg">
                        {m.customer.name.charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                </Avatar.Root>

                <div className="min-w-0 flex-1">
                    <Flex align="center" gap="2">
                        <Text size="4" weight="bold" truncate>{m.customer.name}</Text>
                        <Badge variant="soft" color="blue" size="1">{m.tier.name}</Badge>
                        {!m.isActive && <Badge variant="soft" color="red" size="1">Inactive</Badge>}
                    </Flex>

                    <Flex wrap="wrap" gap="3" mt="1">
                        <Text size="2" color="gray" className="inline-flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> {m.membershipNumber}
                        </Text>
                        {m.customer.phone && (
                            <Text size="2" color="gray" className="inline-flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {m.customer.phone}
                            </Text>
                        )}
                        {m.customer.email && (
                            <Text size="2" color="gray" className="inline-flex items-center gap-1 truncate max-w-[200px]">
                                <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {m.customer.email}
                            </Text>
                        )}
                    </Flex>
                </div>

                <div className="flex-shrink-0">
                    <RadixButton size="2" onClick={onAdjustPoints}>
                        Adjust Points
                    </RadixButton>
                </div>
            </Flex>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <StatCard label="Available" value={m.availablePoints.toLocaleString()} sublabel="pts" color="sky" />
                <StatCard label="Lifetime" value={m.lifetimePoints.toLocaleString()} sublabel="pts" color="emerald" />
                <StatCard label="Redeemed" value={m.redeemedPoints.toLocaleString()} sublabel="pts" color="amber" />
                {dashboard && (
                    <StatCard
                        label="Points Value"
                        value={dashboard.pointsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        sublabel=""
                        color="violet"
                    />
                )}
            </div>

            {/* Next tier progress */}
            {dashboard?.nextTier && (
                <div className="mt-3 p-2.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg">
                    <Text size="1" className="text-sky-700 dark:text-sky-300">
                        <strong>{dashboard.pointsToNextTier.toLocaleString()}</strong> lifetime pts to reach{' '}
                        <strong>{dashboard.nextTier.name}</strong>{' '}
                        (requires {dashboard.nextTier.minPoints.toLocaleString()} pts)
                    </Text>
                </div>
            )}
        </div>
    );
};

export default MemberHeader;
