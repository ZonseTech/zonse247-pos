import { Wrench, Package, Layers, type LucideIcon } from 'lucide-react';

export type StatusFilter = 'ALL' | ServiceOrderStatus;
export type BadgeColor = 'orange' | 'blue' | 'green' | 'red' | 'amber' | 'grass' | 'violet' | 'gray';

export interface OrderTypeConfig {
    icon: LucideIcon;
    label: string;
    color: BadgeColor;
}

export const ACTIONABLE_STATUSES: ServiceOrderStatus[] = ['PENDING', 'IN_PROGRESS', 'PARTIALLY_PAID'];

export const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'PARTIALLY_PAID', label: 'Partial' },
];

export const STATUS_COLOR: Record<ServiceOrderStatus, BadgeColor> = {
    PENDING: 'orange',
    IN_PROGRESS: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
    PARTIALLY_PAID: 'amber',
    PAID: 'grass',
};

export const ORDER_TYPE_CONFIG: Record<ServiceOrderType, OrderTypeConfig> = {
    SERVICE_ONLY: { icon: Wrench, label: 'Service', color: 'blue' },
    PRODUCT_ONLY: { icon: Package, label: 'Product', color: 'amber' },
    HYBRID: { icon: Layers, label: 'Hybrid', color: 'violet' },
};

export const formatShortDate = (date: string | Date): string =>
    new Date(date).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
