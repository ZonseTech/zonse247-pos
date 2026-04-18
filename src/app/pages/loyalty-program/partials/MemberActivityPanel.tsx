import { FC, useCallback, useEffect, useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea, Text, Flex, IconButton } from '@radix-ui/themes';
import { Button, Modal } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import loyaltyService from '../../../services/loyalty.service';
import MemberHeader from './MemberHeader';
import TransactionRow from './TransactionRow';

const TX_PER_PAGE = 15;

const adjustSchema = Yup.object().shape({
    points: Yup.number().required('Points required').integer().not([0], 'Cannot be 0'),
    description: Yup.string().required('Description is required').max(500),
});

interface MemberActivityPanelProps {
    member: LoyaltyMember | null;
    onMemberUpdated?: () => void;
}

const MemberActivityPanel: FC<MemberActivityPanelProps> = ({ member, onMemberUpdated }) => {
    const [dashboard, setDashboard] = useState<LoyaltyMemberDashboard | null>(null);
    const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(1);
    const [txTotal, setTxTotal] = useState(0);
    const [adjustModalOpen, setAdjustModalOpen] = useState(false);

    const loadDashboard = useCallback(async (memberId: string) => {
        try {
            const data = await loyaltyService.getMemberDashboard(memberId);
            setDashboard(data);
        } catch {
            Notify.failure('Failed to load member dashboard');
        }
    }, []);

    const loadTransactions = useCallback(async (memberId: string, page: number) => {
        try {
            const result = await loyaltyService.listTransactions(memberId, { page, limit: TX_PER_PAGE });
            setTransactions(result.transactions);
            setTxPage(result.pagination.page);
            setTxTotalPages(result.pagination.totalPages);
            setTxTotal(result.pagination.total);
        } catch {
            setTransactions([]);
        }
    }, []);

    useEffect(() => {
        if (!member) {
            setDashboard(null);
            setTransactions([]);
            setTxPage(1);
            setTxTotalPages(1);
            setTxTotal(0);
            return;
        }
        setIsLoading(true);
        Promise.all([
            loadDashboard(member.loyaltyMemberId),
            loadTransactions(member.loyaltyMemberId, 1),
        ]).finally(() => setIsLoading(false));
    }, [member, loadDashboard, loadTransactions]);

    const handleTxPage = useCallback((page: number) => {
        if (member) loadTransactions(member.loyaltyMemberId, page);
    }, [member, loadTransactions]);

    const handleAdjust = async (
        values: { points: number; description: string },
        helpers: FormikHelpers<{ points: number; description: string }>,
    ) => {
        if (!member) return;
        try {
            await loyaltyService.adjustPoints(member.loyaltyMemberId, values);
            Notify.success('Points adjusted');
            setAdjustModalOpen(false);
            loadDashboard(member.loyaltyMemberId);
            loadTransactions(member.loyaltyMemberId, 1);
            onMemberUpdated?.();
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to adjust points');
        } finally {
            helpers.setSubmitting(false);
        }
    };

    if (!member) {
        return (
            <Flex direction="column" align="center" justify="center" height="100%" px="6">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-gray-400" />
                </div>
                <Text size="3" weight="bold" color="gray">Select a member</Text>
                <Text size="2" color="gray" align="center" className="mt-1 max-w-xs">
                    Choose a member from the list to view their points, tier, and transaction history.
                </Text>
            </Flex>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <MemberHeader
                member={member}
                dashboard={dashboard}
                onAdjustPoints={() => setAdjustModalOpen(true)}
            />

            {/* Transactions section */}
            <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <Text size="2" weight="bold">Transactions ({txTotal})</Text>
            </div>

            <ScrollArea scrollbars="vertical" className="flex-1 min-h-0">
                <div className="px-4 py-3">
                    {isLoading ? (
                        <TxSkeleton />
                    ) : transactions.length === 0 ? (
                        <Flex direction="column" align="center" py="8">
                            <Text size="2" color="gray">No transactions yet.</Text>
                        </Flex>
                    ) : (
                        <div className="space-y-2">
                            {transactions.map((tx) => (
                                <TransactionRow key={tx.loyaltyTransactionId} tx={tx} />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Pagination */}
            {txTotalPages > 1 && (
                <Flex
                    align="center"
                    justify="between"
                    px="4"
                    py="2"
                    className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700"
                >
                    <Text size="1" color="gray">{txTotal} transactions</Text>
                    <Flex align="center" gap="2">
                        <IconButton size="1" variant="soft" color="gray" disabled={txPage <= 1} onClick={() => handleTxPage(txPage - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </IconButton>
                        <Text size="1" color="gray">Page {txPage} of {txTotalPages}</Text>
                        <IconButton size="1" variant="soft" color="gray" disabled={txPage >= txTotalPages} onClick={() => handleTxPage(txPage + 1)}>
                            <ChevronRight className="w-4 h-4" />
                        </IconButton>
                    </Flex>
                </Flex>
            )}

            {/* Adjust points modal */}
            <Modal
                title="Adjust Points"
                isOpen={adjustModalOpen}
                onClose={() => setAdjustModalOpen(false)}
                className="max-w-sm bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300"
            >
                <Formik
                    initialValues={{ points: 0, description: '' }}
                    validationSchema={adjustSchema}
                    onSubmit={handleAdjust}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput type="number" name="points" label="Points*" placeholder="Positive to add, negative to deduct" required />
                                <FormInput type="text" name="description" label="Reason*" placeholder="e.g. Birthday bonus" required />
                                <div className="flex gap-3 pt-4">
                                    <Button type="button" theme="neutral" onClick={() => setAdjustModalOpen(false)} className="flex-1">Cancel</Button>
                                    <Button type="submit" theme="primary" loading={isSubmitting} className="flex-1">Adjust</Button>
                                </div>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </div>
    );
};

/* ─── Skeleton ───────────────────────────────────────────────────── */

const TxSkeleton: FC = () => (
    <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg animate-pulse bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-1.5">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700/60 rounded w-28" />
                    </div>
                </div>
                <div className="space-y-1 text-right">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto" />
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-700/60 rounded w-16 ml-auto" />
                </div>
            </div>
        ))}
    </div>
);

export default MemberActivityPanel;
