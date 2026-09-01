/**
 * Settings configuration and metadata
 * Defines tabs, categories, and their properties
 */

import {
    HiOutlineCog,
    HiOutlineCheck,
    HiOutlineShieldCheck,
    HiOutlineDocumentText,
    HiOutlineBars3,
} from 'react-icons/hi2';

export type SettingsTabId = 'general' | 'sales' | 'receipt' | 'security' | 'navigation';

export interface SettingsTab {
    id: SettingsTabId;
    label: string;
    icon: any;
    description: string;
}

export const SETTINGS_TABS: SettingsTab[] = [
    {
        id: 'general',
        label: 'General',
        icon: HiOutlineCog,
        description: 'Appearance, localization, and display preferences',
    },
    {
        id: 'sales',
        label: 'Business',
        icon: HiOutlineCheck,
        description: 'Transactions, compliance, and payment configuration',
    },
    {
        id: 'receipt',
        label: 'Receipt',
        icon: HiOutlineDocumentText,
        description: 'Receipt format, printing, and display options',
    },
    {
        id: 'security',
        label: 'Security',
        icon: HiOutlineShieldCheck,
        description: 'Access control, sync, and backup',
    },
    {
        id: 'navigation',
        label: 'Navigation',
        icon: HiOutlineBars3,
        description: 'Menu structure and navigation preferences',
    },
];

/**
 * Settings categories - useful for grouping and validation
 */
export const SETTINGS_CATEGORIES = {
    GENERAL: 'general',
    LOCALIZATION: 'localization',
    TRANSACTION: 'transaction',
    CUSTOMER: 'customer',
    RECEIPT: 'receipt',
    PAYMENT: 'payment',
    MRA: 'mra',
    INVENTORY: 'inventory',
    OFFLINE: 'offline',
    SECURITY: 'security',
    PERFORMANCE: 'performance',
    HARDWARE: 'hardware',
    INTEGRATION: 'integration',
    BUSINESS_RULES: 'business_rules',
    BACKUP: 'backup',
    DISPLAY: 'display',
    TAX: 'tax',
    CUSTOMER_MANAGEMENT: 'customer_management',
    REPORTING: 'reporting',
    AUDIT: 'audit',
} as const;

/**
 * Feature flags - enable/disable features based on environment
 */
export const FEATURE_FLAGS = {
    ENABLE_MRA_COMPLIANCE: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_CLOUD_SYNC: true,
    ENABLE_ADVANCED_INVENTORY: false,
    ENABLE_LOYALTY_PROGRAM: false,
    ENABLE_MULTI_CURRENCY: false,
    ENABLE_WEBHOOKS: true,
    ENABLE_API_ACCESS: true,
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_LIMITS = {
    MAX_CACHE_SIZE_MB: 500,
    MIN_CACHE_SIZE_MB: 10,
    MAX_TRANSACTION_HISTORY_DAYS: 365,
    MIN_TRANSACTION_HISTORY_DAYS: 7,
    MAX_SYNC_BATCH_SIZE: 1000,
    MIN_SYNC_BATCH_SIZE: 10,
    MAX_BACKUP_FILES: 30,
    MIN_BACKUP_FILES: 1,
} as const;
