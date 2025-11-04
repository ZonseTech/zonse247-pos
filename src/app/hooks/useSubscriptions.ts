import { Notify } from 'notiflix';
import { useState, useEffect } from 'react';
import subscriptionsService from '../services/subscriptions.service';

export const useSubscriptions = () => {
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(13);
	const [totalRows, setTotalRows] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
	const [filteredSubscriptions, setFilteredSubscriptions] = useState<
		TenantSubscription[]
	>([]);

	useEffect(() => {
		loadSubscriptions();
	}, []);

	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredSubscriptions(subscriptions);
		} else {
			const filtered = subscriptions.filter(
				(subscription) =>
					subscription.uuid.toLowerCase().includes(searchTerm.toLowerCase()) ||
					subscription.clientUuid
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					subscription.planId
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					subscription.status.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredSubscriptions(filtered);
		}
		setTotalRows(filteredSubscriptions.length);
		setPage(1);
	}, [searchTerm, subscriptions]);

	const loadSubscriptions = async () => {
		try {
			setIsLoading(true);
			const result = await subscriptionsService.list();
			const data = result.data;

			setSubscriptions(data);
			setFilteredSubscriptions(data);
			setTotalRows(data.length);
		} catch (error) {
			console.error('Error loading subscriptions:', error);
			Notify.failure('Failed to load subscriptions');
		} finally {
			setIsLoading(false);
		}
	};

	const getPaginatedData = () => {
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		return filteredSubscriptions.slice(startIndex, endIndex);
	};

	const deleteSubscription = async (subscriptionId: string) => {
		try {
			await subscriptionsService.delete(subscriptionId);

			const updatedSubscriptions = subscriptions.filter(
				(sub) => sub.uuid !== subscriptionId
			);
			setSubscriptions(updatedSubscriptions);
			setFilteredSubscriptions(updatedSubscriptions);
			setTotalRows(updatedSubscriptions.length);

			Notify.success('Subscription deleted successfully');
		} catch (error) {
			console.error('Error deleting subscription:', error);
			Notify.failure('Failed to delete subscription');
		}
	};

	const updateSubscriptionStatus = async (
		subscriptionId: string,
		newStatus: string
	) => {
		try {
			const subscription = subscriptions.find((s) => s.uuid === subscriptionId);
			const updatedSubscriptionData = {
				...subscription,
				status: newStatus,
			};

			await subscriptionsService.update(
				subscriptionId,
				updatedSubscriptionData as any
			);

			const updatedSubscriptions = subscriptions.map((sub) =>
				sub.uuid === subscriptionId
					? { ...sub, status: newStatus as TenantSubscription['status'] }
					: sub
			);

			setSubscriptions(updatedSubscriptions);
			setFilteredSubscriptions(updatedSubscriptions);
			setTotalRows(updatedSubscriptions.length);

			const action = newStatus === 'active' ? 'activated' : 'cancelled';
			Notify.success(`Subscription ${action} successfully`);
		} catch (error) {
			const action = newStatus === 'active' ? 'activate' : 'cancel';
			console.error(`Error ${action}ing subscription:`, error);
			Notify.failure(`Failed to ${action} subscription`);
		}
	};

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
		getPaginatedData,
		loadSubscriptions,
		deleteSubscription,
		updateSubscriptionStatus,
	};
};
