import {
    ArrowLeftRight,
    CloudDownload,
    CloudUpload,
} from 'lucide-react';

export const TABLE_LABELS: Record<ForceResyncTable, string> = {
    customers: 'Customers',
    sales: 'Sales',
    saleItems: 'Sale Items',
    salePayments: 'Sale Payments',
    returns: 'Returns',
    returnItems: 'Return Items',
    stockMovements: 'Stock Movements',
    orders: 'Orders',
    users: 'Users',
};

export interface ResyncModeOption {
    id: ForceResyncMode;
    label: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    description: string;
    requiresBridge: boolean;
}

export const RESYNC_MODES: ResyncModeOption[] = [
    {
        id: 'pull',
        label: 'Pull from server',
        icon: CloudDownload,
        description: 'Re-download all records from the server. Safe default.',
        requiresBridge: false,
    },
    {
        id: 'push',
        label: 'Push to server',
        icon: CloudUpload,
        description: 'Re-upload all local records (desktop only).',
        requiresBridge: true,
    },
    {
        id: 'bidirectional',
        label: 'Bidirectional',
        icon: ArrowLeftRight,
        description: 'Push local first, then pull server (desktop only).',
        requiresBridge: true,
    },
];

/** Map a per-table status to a Radix Themes Badge color. */
export const STATUS_BADGE_COLOR: Record<
    ForceResyncTableProgress['status'],
    'gray' | 'sky' | 'green' | 'amber' | 'red'
> = {
    pending: 'gray',
    running: 'sky',
    done: 'green',
    deferred: 'amber',
    failed: 'red',
};

export const STATUS_LABEL: Record<ForceResyncTableProgress['status'], string> = {
    pending: 'Pending',
    running: 'Running',
    done: 'Done',
    deferred: 'Deferred',
    failed: 'Failed',
};
