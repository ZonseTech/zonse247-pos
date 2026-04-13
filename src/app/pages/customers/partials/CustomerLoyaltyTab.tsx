import { FC, useCallback, useEffect, useState } from 'react';
import { Notify } from 'notiflix';
import { Award, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { IconButton, Text, Flex, Badge, Button as RadixButton, Card } from '@radix-ui/themes';
import { ComponentLoader } from '../../../components';
import loyaltyService from '../../../services/loyalty.service';
import LoyaltyTxRow from './LoyaltyTxRow';

interface CustomerLoyaltyTabProps {
    customerId: string;
    isDefault?: boolean;
}

const CustomerLoyaltyTab: FC<CustomerLoyaltyTabProps> = ({ customerId, isDefault }) => {
    const [member, setMember] = useState<LoyaltyMember | null>(null);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notEnrolled, setNotEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(1);
    const [txTotal, setTxTotal] = useState(0);

    const loadMembership = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await loyaltyService.getMemberByCustomerId(customerId);
            setMember(data);
            setNotEnrolled(false);
        } catch (err: any) {
            if (err?.response?.status === 404) {
                setNotEnrolled(true);
                setMember(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [customerId]);

    const loadTransactions = useCallback(async (page: number) => {
        if (!member) return;
        try {
            const result = await loyaltyService.listTransactions(member.loyaltyMemberId, { page, limit: 10 });
            setTransactions(result.transactions);
            setTxPage(result.pagination.page);
            setTxTotalPages(result.pagination.totalPages);
            setTxTotal(result.pagination.total);
        } catch {
            setTransactions([]);
        }
    }, [member]);

    useEffect(() => { loadMembership(); }, [loadMembership]);
    useEffect(() => { if (member) loadTransactions(1); }, [member, loadTransactions]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            const enrolled = await loyaltyService.enrollMember(customerId);
            setMember(enrolled);
            setNotEnrolled(false);
            Notify.success('Customer enrolled in loyalty program');
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to enroll customer');
        } finally {
            setEnrolling(false);
        }
    };

    if (isDefault) {
        return (
            <Flex align="center" justify="center" py="6">
                <Text size="2" color="gray">Loyalty is not available for walk-in customers.</Text>
            </Flex>
        );
    }

    if (isLoading) return <ComponentLoader loading />;

    if (notEnrolled) {
        return (
            <Flex direction="column" align="center" py="6">
                <Award className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <Text size="2" color="gray" className="block mb-3">This customer is not enrolled in a loyalty program.</Text>
                <RadixButton size="2" onClick={handleEnroll} disabled={enrolling}>
                    <UserPlus className="w-4 h-4" />
                    {enrolling ? 'Enrolling...' : 'Enroll Customer'}
                </RadixButton>
            </Flex>
        );
    }

    if (!member) return null;

    return (
        <div className="p-3">
            {/* Membership card */}
            <Card variant="surface" className="mb-4 !bg-gradient-to-r !from-sky-50 !to-violet-50 dark:!from-sky-950/30 dark:!to-violet-950/30 !border-sky-200 dark:!border-sky-800">
                <Flex justify="between" align="start">
                    <div>
                        <Flex align="center" gap="2" mb="1">
                            <Text size="1" color="gray">{member.membershipNumber}</Text>
                            <Badge color="blue" variant="soft" size="1">{member.tier.name}</Badge>
                        </Flex>
                        <Text size="4" weight="bold" className="text-sky-600 dark:text-sky-400 block">
                            {member.availablePoints.toLocaleString()} <span className="text-sm font-normal">pts</span>
                        </Text>
                    </div>
                    <div className="text-right">
                        <Text size="1" color="gray" className="block">Lifetime: {member.lifetimePoints.toLocaleString()}</Text>
                        <Text size="1" color="gray" className="block">Redeemed: {member.redeemedPoints.toLocaleString()}</Text>
                    </div>
                </Flex>
                {member.tier.discountPercentage > 0 && (
                    <Text size="1" className="text-green-600 dark:text-green-400 mt-2 block">
                        {member.tier.discountPercentage}% tier discount · {member.tier.pointsMultiplier}× points multiplier
                    </Text>
                )}
            </Card>

            {/* Transactions */}
            <Text size="2" weight="bold" className="text-gray-800 dark:text-gray-200 mb-2 block">
                Recent Transactions ({txTotal})
            </Text>

            {transactions.length === 0 ? (
                <Flex align="center" justify="center" py="4">
                    <Text size="1" color="gray">No transactions yet.</Text>
                </Flex>
            ) : (
                <div className="space-y-1.5">
                    {transactions.map((tx) => (
                        <LoyaltyTxRow key={tx.loyaltyTransactionId} tx={tx} />
                    ))}
                </div>
            )}

            {txTotalPages > 1 && (
                <Flex justify="end" align="center" gap="2" mt="2">
                    <IconButton size="1" variant="soft" color="gray" disabled={txPage <= 1} onClick={() => loadTransactions(txPage - 1)}>
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </IconButton>
                    <Text size="1" color="gray">{txPage}/{txTotalPages}</Text>
                    <IconButton size="1" variant="soft" color="gray" disabled={txPage >= txTotalPages} onClick={() => loadTransactions(txPage + 1)}>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </IconButton>
                </Flex>
            )}
        </div>
    );
};

export default CustomerLoyaltyTab;
