import { TableColumn } from 'react-data-table-component';
import { Edit2, Trash2, CreditCard, CheckCircle } from 'lucide-react';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';

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

export const getSubscriptionColumns = (
	handleEdit: (subscription: TenantSubscription) => void,
	handleStatusToggle: (subscriptionId: string, currentStatus: string) => void,
	handleDelete: (subscriptionId: string) => void
): Array<TableColumn<TenantSubscription>> => [
		{
			name: "Subscription",
			cell: (row) => (
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 transition-colors">
						<CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
							{row?.clientDetails?.clientCode}
						</div>
						<div className="truncate text-xs text-gray-600 dark:text-gray-400">
							Plan: {row?.planId}
						</div>
					</div>
				</div>
			),
		},
		{
			name: 'Client',
			cell: (row) => (
				<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
					{row?.clientDetails?.companyName}
					<div className="truncate text-xs text-gray-600 dark:text-gray-400">
						- {row?.clientDetails?.ownerName}
					</div>
				</div>
			)
		},
		{
			name: 'Status',
			cell: (row) => (
				<span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${getStatusColor(row?.status)}`}>
					<CheckCircle className="h-3 w-3" />
					{row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
				</span>
			)
		},
		{
			name: 'Period',
			cell: (row) => (
				<div className="space-y-1 text-sm">
					<div className="font-medium text-gray-900 dark:text-gray-100">
						{new Date(row?.startsAt).toLocaleDateString()}
					</div>
					{row?.endsAt && (
						<div className="text-gray-600 dark:text-gray-400">
							to {new Date(row?.endsAt).toLocaleDateString()}
						</div>
					)}
				</div>
			)
		},
		{
			name: 'Auto Renew',
			cell: (row) => (
				<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${row?.autoRenew
					? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
					: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
					}`}>
					{row?.autoRenew ? 'Yes' : 'No'}
				</span>
			)
		},
		{
			name: 'Payment Method',
			cell: (row) => (
				<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
					{row?.paymentMethod}
				</div>
			)
		},
		{
			name: 'Next Payment',
			cell: (row) => (
				<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
					{row?.nextPaymentDate ? new Date(row?.nextPaymentDate).toLocaleDateString() : 'N/A'}
				</div>
			)
		},
		{
			width: "20%",
			name: <HiOutlineMenuAlt4 className='h-5 w-5 text-gray-500 dark:text-gray-400' />,
			cell: (row) => (
				<div className="flex items-center gap-2">
					<button
						onClick={() => handleEdit(row)}
						disabled={row.uuid === '-1'}
						className={`group rounded-lg p-2 transition-all duration-200 ${row.uuid === '-1'
							? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
							: 'text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300'
							}`}
						title="Edit subscription"
					>
						<Edit2 className="h-4 w-4 transition-transform group-hover:scale-110" />
					</button>

					<button
						onClick={() => handleStatusToggle(row?.uuid, row?.status)}
						disabled={row.uuid === '-1'}
						className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${row.uuid === '-1'
							? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
							: row?.status === 'active'
								? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300'
								: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-300'
							}`}
						title={row?.status === 'active' ? 'Cancel subscription' : 'Activate subscription'}
					>
						{row?.status === 'active' ? 'Cancel' : 'Activate'}
					</button>

					<button
						onClick={() => handleDelete(row?.uuid)}
						disabled={row.uuid === '-1'}
						className={`group rounded-lg p-2 transition-all duration-200 ${row.uuid === '-1'
							? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
							: 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300'
							}`}
						title="Delete subscription"
					>
						<Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
					</button>
				</div>
			)
		}
	];