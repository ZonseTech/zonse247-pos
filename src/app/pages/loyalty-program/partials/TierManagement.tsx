import { FC, useCallback, useEffect, useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Notify, Confirm } from 'notiflix';
import { Plus } from 'lucide-react';
import { Text, Flex, Button as RadixButton } from '@radix-ui/themes';
import { Button, Modal } from '../../../components';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import { ComponentLoader } from '../../../components';
import loyaltyService from '../../../services/loyalty.service';
import TierCard from './TierCard';

interface TierManagementProps {
    program: LoyaltyProgram;
}

const tierSchema = Yup.object().shape({
    name: Yup.string().required('Tier name is required').max(50),
    minPoints: Yup.number().required('Min points is required').integer().min(0),
    pointsMultiplier: Yup.number().min(0.1, 'Must be at least 0.1'),
    discountPercentage: Yup.number().min(0).max(100, 'Max 100%'),
    benefits: Yup.string().nullable().max(500),
    sortOrder: Yup.number().integer().min(0),
});

const emptyTier = {
    name: '',
    minPoints: 0,
    pointsMultiplier: 1.0,
    discountPercentage: 0,
    benefits: '',
    sortOrder: 0,
};

const TierManagement: FC<TierManagementProps> = ({ program }) => {
    const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);

    const loadTiers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await loyaltyService.listTiers(program.loyaltyProgramId);
            setTiers(data);
        } catch {
            Notify.failure('Failed to load tiers');
        } finally {
            setIsLoading(false);
        }
    }, [program.loyaltyProgramId]);

    useEffect(() => { loadTiers(); }, [loadTiers]);

    const openCreate = () => { setEditingTier(null); setModalOpen(true); };
    const openEdit = (tier: LoyaltyTier) => { setEditingTier(tier); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditingTier(null); };

    const handleSubmit = async (values: typeof emptyTier, helpers: FormikHelpers<typeof emptyTier>) => {
        try {
            if (editingTier) {
                await loyaltyService.updateTier(editingTier.loyaltyTierId, values);
                Notify.success('Tier updated');
            } else {
                await loyaltyService.createTier(program.loyaltyProgramId, values);
                Notify.success('Tier created');
            }
            closeModal();
            loadTiers();
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to save tier');
        } finally {
            helpers.setSubmitting(false);
        }
    };

    const handleDelete = (tier: LoyaltyTier) => {
        Confirm.show(
            'Delete Tier',
            `Are you sure you want to delete "${tier.name}"?`,
            'Delete',
            'Cancel',
            async () => {
                try {
                    await loyaltyService.deleteTier(tier.loyaltyTierId);
                    Notify.success('Tier deleted');
                    loadTiers();
                } catch {
                    Notify.failure('Failed to delete tier');
                }
            },
        );
    };

    if (isLoading) return <ComponentLoader loading />;

    const initialValues = editingTier
        ? {
            name: editingTier.name,
            minPoints: editingTier.minPoints,
            pointsMultiplier: editingTier.pointsMultiplier,
            discountPercentage: editingTier.discountPercentage,
            benefits: editingTier.benefits || '',
            sortOrder: editingTier.sortOrder,
        }
        : emptyTier;

    return (
        <>
            <Flex justify="between" align="center" mb="4">
                <Text size="3" weight="bold" className="text-gray-800 dark:text-gray-200">
                    Tiers ({tiers.length})
                </Text>
                <RadixButton size="2" onClick={openCreate}>
                    <Plus className="w-4 h-4" /> Add Tier
                </RadixButton>
            </Flex>

            {tiers.length === 0 ? (
                <Flex align="center" justify="center" py="8">
                    <Text size="2" color="gray">
                        No tiers configured. Add tiers like Bronze, Silver, Gold to reward loyal customers.
                    </Text>
                </Flex>
            ) : (
                <div className="space-y-3">
                    {tiers.map((tier) => (
                        <TierCard
                            key={tier.loyaltyTierId}
                            tier={tier}
                            onEdit={() => openEdit(tier)}
                            onDelete={() => handleDelete(tier)}
                        />
                    ))}
                </div>
            )}

            <Modal
                title={editingTier ? 'Edit Tier' : 'New Tier'}
                isOpen={modalOpen}
                onClose={closeModal}
                className="max-w-md bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300"
            >
                <Formik
                    initialValues={initialValues}
                    validationSchema={tierSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput type="text" name="name" label="Tier Name*" placeholder="e.g. Gold" required />
                                <FormInput type="number" name="minPoints" label="Min Lifetime Points*" placeholder="0" required />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput type="number" name="pointsMultiplier" label="Points Multiplier" placeholder="1.0" step="0.1" />
                                    <FormInput type="number" name="discountPercentage" label="Discount %" placeholder="0" step="0.5" />
                                </div>

                                <FormInput type="text" name="benefits" label="Benefits" placeholder="e.g. Free gift wrapping, priority support" />
                                <FormInput type="number" name="sortOrder" label="Sort Order" placeholder="0" />

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" theme="neutral" onClick={closeModal} className="flex-1">Cancel</Button>
                                    <Button type="submit" theme="primary" loading={isSubmitting} className="flex-1">
                                        {editingTier ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    );
};

export default TierManagement;
