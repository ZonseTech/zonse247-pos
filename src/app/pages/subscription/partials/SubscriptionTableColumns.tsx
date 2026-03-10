import { CreditCard } from 'lucide-react';
import { TableColumn } from 'react-data-table-component';

const getStatusColor = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'active':
			return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
		case 'inactive':
		case 'cancelled':
			return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
		case 'past_due':
			return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
		case 'expired':
			return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
		default:
			return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
	}
};

const formatStatus = (status: string) => {
	if (!status) return 'N/A';
	return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const getSubscriptionColumns = (
	handleStatusToggle: (subscriptionId: string, currentStatus: string) => void,
): Array<TableColumn<BranchSubscription>> => [
		{
			name: "Branch & Plan",
			minWidth: "280px",
			cell: (row) => (
				<div className="flex items-center gap-3 py-2">
					<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 transition-all duration-200">
						<CreditCard className="h-5 w-5 text-sky-500 dark:text-sky-400" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
								{row?.branchDetails?.branchName || 'N/A'}
							</div>
						</div>
						<div className="flex items-center gap-2 mt-0.5">
							<span className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
								{row?.planName || row?.subscriptionPlan?.name || 'N/A'}
							</span>
							{row?.branchDetails?.tenantName && (
								<span className="text-xs text-gray-500 dark:text-gray-500">
									{row?.branchDetails?.tenantName}
								</span>
							)}
						</div>
					</div>
				</div>
			),
		},
		{
			name: 'Branch Code',
			minWidth: "140px",
			cell: (row) => (
				<div>
					<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
						{row?.branchDetails?.branchCode || 'N/A'}
					</div>
					<div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 font-mono">
						{row?.branchSubscriptionId?.slice(0, 8) || 'N/A'}
					</div>
				</div>
			)
		},
		{
			name: 'Status',
			minWidth: "130px",
			cell: (row) => (
				<span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 shadow-sm ${getStatusColor(row?.status)}`}>
					<span className="relative flex h-2 w-2">
						<span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${row?.status === 'active' ? 'bg-emerald-400' : row?.status === 'cancelled' ? 'bg-red-400' : 'bg-gray-400'}`}></span>
						<span className={`relative inline-flex h-2 w-2 rounded-full ${row?.status === 'active' ? 'bg-emerald-500' : row?.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
					</span>
					{formatStatus(row?.status)}
				</span>
			)
		},
		{
			name: 'Subscription Period',
			minWidth: "180px",
			cell: (row) => (
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-xs">
						<span className="text-gray-500 dark:text-gray-500">From:</span>
						<span className="font-medium text-gray-900 dark:text-gray-100">
							{row?.startsAt ? new Date(row.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
						</span>
					</div>
					{row?.endsAt && (
						<div className="flex items-center gap-2 text-xs">
							<span className="text-gray-500 dark:text-gray-500">To:</span>
							<span className="font-medium text-gray-900 dark:text-gray-100">
								{new Date(row.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
							</span>
						</div>
					)}
				</div>
			)
		},
		{
			name: 'Next Payment',
			minWidth: "140px",
			cell: (row) => (
				<div className="flex flex-col gap-1">
					<div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
						{row?.nextPaymentDate ? new Date(row.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
					</div>
					{row?.lastPaymentDate && (
						<div className="text-xs text-gray-500 dark:text-gray-500">
							Last: {new Date(row.lastPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
						</div>
					)}
				</div>
			)
		},
		{
			name: 'Auto Renew',
			minWidth: "100px",
			cell: (row) => (
				<div className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold ${row?.autoRenew
					? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
					: 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
					}`}>
					{row?.autoRenew ? 'Yes' : 'No'}
				</div>
			)
		},
		{
			name: 'Actions',
			minWidth: "120px",
			cell: (row) => (
				<div className="flex items-center gap-2">
					<button
						onClick={() => handleStatusToggle(row?.branchSubscriptionId, row?.status)}
						className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow ${row?.status === 'active'
							? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
							: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
							}`}
						title={row?.status === 'active' ? 'Cancel subscription' : 'Activate subscription'}
					>
						{row?.status === 'active' ? 'Cancel' : 'Activate'}
					</button>
				</div>
			)
		}
	];