/**
 * Settings configuration and metadata
 * Defines tabs, categories, and their properties
 */

import {
    HiOutlineCog,
    HiOutlineCheck,
    HiOutlineShieldCheck,
    HiOutlineArrowPath,
    HiOutlineCube,
    HiOutlineComputerDesktop,
    HiOutlineViewColumns,
} from 'react-icons/hi2';

export type SettingsTabId = 'general' | 'terminal' | 'sales' | 'display' | 'hardware' | 'security' | 'backup';

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
        description: 'Store information and basic settings',
    },
    {
        id: 'terminal',
        label: 'Terminal',
        icon: HiOutlineComputerDesktop,
        description: 'Terminal operations and MRA compliance',
    },
    {
        id: 'sales',
        label: 'Sales',
        icon: HiOutlineCheck,
        description: 'Payment methods and sales configuration',
    },
    {
        id: 'display',
        label: 'Display',
        icon: HiOutlineViewColumns,
        description: 'UI, localization, and display preferences',
    },
    {
        id: 'hardware',
        label: 'Hardware',
        icon: HiOutlineCube,
        description: 'Printers, scanners, and devices',
    },
    {
        id: 'security',
        label: 'Security',
        icon: HiOutlineShieldCheck,
        description: 'Access control and API integration',
    },
    {
        id: 'backup',
        label: 'Backup',
        icon: HiOutlineArrowPath,
        description: 'Data backup and recovery',
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
