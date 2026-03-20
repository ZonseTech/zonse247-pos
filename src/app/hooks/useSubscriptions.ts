import { Notify } from 'notiflix';
import { useState, useEffect, useCallback, useMemo } from 'react';
import subscriptionsService from '../services/subscriptions.service';

/**
 * Hook for managing branch subscriptions
 * Aligned with zonse247-pos-api
 */
export const useSubscriptions = () => {
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(13);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [subscriptions, setSubscriptions] = useState<BranchSubscription[]>([]);
	const [filteredSubscriptions, setFilteredSubscriptions] = useState<BranchSubscription[]>([]);

	useEffect(() => {
		loadSubscriptions();
	}, []);

	useEffect(() => {
		filterSubscriptions();
	}, [searchTerm, subscriptions]);

	const filterSubscriptions = useCallback(() => {
		if (searchTerm.trim() === '') {
			setFilteredSubscriptions(subscriptions);
			setTotalRows(subscriptions.length);
		} else {
			const lowercasedTerm = searchTerm.toLowerCase();
			const filtered = subscriptions.filter((subscription) => {
				const branchName = subscription.branchDetails?.branchName?.toLowerCase() || '';
				const branchCode = subscription.branchDetails?.branchCode?.toLowerCase() || '';
				const planName = subscription.planName?.toLowerCase() || '';
				const status = subscription.status?.toLowerCase() || '';
				const subscriptionId = subscription.branchSubscriptionId?.toLowerCase() || '';

				return (
					branchName.includes(lowercasedTerm) ||
					branchCode.includes(lowercasedTerm) ||
					planName.includes(lowercasedTerm) ||
					status.includes(lowercasedTerm) ||
					subscriptionId.includes(lowercasedTerm)
				);
			});
			setFilteredSubscriptions(filtered);
			setTotalRows(filtered.length);
		}
		setPage(1);
	}, [searchTerm, subscriptions]);

	const loadSubscriptions = useCallback(async () => {
		try {
			setIsLoading(true);
			const result = await subscriptionsService.list();
			const data = result.data?.subscriptions || [];

			setSubscriptions(data);
			setFilteredSubscriptions(data);
			setTotalRows(data.length);
		} catch (error) {
			console.error('Error loading subscriptions:', error);
			Notify.failure('Failed to load subscriptions');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const getPaginatedData = useCallback(() => {
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		return filteredSubscriptions.slice(startIndex, endIndex);
	}, [page, perPage, filteredSubscriptions]);

	const deleteSubscription = useCallback(async (subscriptionId: string) => {
		try {
			await subscriptionsService.delete(subscriptionId);

			const updatedSubscriptions = subscriptions.filter(
				(sub) => sub.branchSubscriptionId !== subscriptionId
			);
			setSubscriptions(updatedSubscriptions);
			setFilteredSubscriptions(updatedSubscriptions);
			setTotalRows(updatedSubscriptions.length);

			Notify.success('Subscription deleted successfully');
		} catch (error) {
			console.error('Error deleting subscription:', error);
			Notify.failure('Failed to delete subscription');
		}
	}, [subscriptions]);

	const updateSubscriptionStatus = useCallback(async (
		subscriptionId: string,
		newStatus: BranchSubscription['status']
	) => {
		try {
			await subscriptionsService.update(subscriptionId, { status: newStatus });

			const updatedSubscriptions = subscriptions.map((sub) =>
				sub.branchSubscriptionId === subscriptionId
					? { ...sub, status: newStatus }
					: sub
			);

			setSubscriptions(updatedSubscriptions);
			setFilteredSubscriptions(updatedSubscriptions);

			const action = newStatus === 'active' ? 'activated' : 'cancelled';
			Notify.success(`Subscription ${action} successfully`);
		} catch (error) {
			const action = newStatus === 'active' ? 'activate' : 'cancel';
			console.error(`Error ${action}ing subscription:`, error);
			Notify.failure(`Failed to ${action} subscription`);
		}
	}, [subscriptions]);

	const cancelSubscription = useCallback(async (subscriptionId: string) => {
		try {
			await subscriptionsService.cancel(subscriptionId);

			const updatedSubscriptions = subscriptions.map((sub) =>
				sub.branchSubscriptionId === subscriptionId
					? { ...sub, status: 'cancelled' as const }
					: sub
			);

			setSubscriptions(updatedSubscriptions);
			setFilteredSubscriptions(updatedSubscriptions);

			Notify.success('Subscription cancelled successfully');
		} catch (error) {
			console.error('Error cancelling subscription:', error);
			Notify.failure('Failed to cancel subscription');
		}
	}, [subscriptions]);

	const reactivateSubscription = useCallback(async (subscriptionId: string) => {
		try {
			await subscriptionsService.reactivate(subscriptionId);

			const updatedSubscriptions = subscriptions.map((sub) =>
				sub.branchSubscriptionId === subscriptionId
					? { ...sub, status: 'active' as const }
					: sub
			);

			setSubscriptions(updatedSubscriptions);
			setFilteredSubscriptions(updatedSubscriptions);

			Notify.success('Subscription reactivated successfully');
		} catch (error) {
			console.error('Error reactivating subscription:', error);
			Notify.failure('Failed to reactivate subscription');
		}
	}, [subscriptions]);

	const stats = useMemo(() => {
		return {
			total: subscriptions.length,
			active: subscriptions.filter((s) => s.status === 'active').length,
			cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
			expired: subscriptions.filter((s) => s.status === 'expired').length,
			pastDue: subscriptions.filter((s) => s.status === 'past_due').length,
		};
	}, [subscriptions]);

	return {
		page,
		setPage,
		perPage,
		setPerPage,
		totalRows,
		isLoading,
		searchTerm,
		setSearchTerm,
		subscriptions,
		filteredSubscriptions,
		stats,
		getPaginatedData,
		loadSubscriptions,
		deleteSubscription,
		updateSubscriptionStatus,
		cancelSubscription,
		reactivateSubscription,
	};
};
