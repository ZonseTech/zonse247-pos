import type { ReactNode, MouseEvent } from 'react';

// ─── Primitive nav‑item types ──────────────────────────────────────────────────

/** Visual variant of a navigation entry */
export type NavItemType = 'button' | 'split' | 'spacer' | 'icon';

/**
 * Top‑level group key.
 * Used to bucket items in the sidebar, mobile drawer **and** the Electron menu.
 */
export type NavGroupKey =
    | 'operations'
    | 'management'
    | 'admin'
    | 'settings'
    | 'system';

// ─── Single nav item ───────────────────────────────────────────────────────────

export interface NavItemBase {
    /** Unique, human‑readable id (e.g. "pos", "suppliers", "purchase-orders") */
    id: string;
    /** Display label */
    label: string;
    /** Icon element (lucide / heroicons) */
    icon: ReactNode;
    /** Route path this item navigates to */
    route?: string;
    /** Custom click handler (takes precedence over `route`) */
    onClick?: ((e?: MouseEvent<HTMLElement>) => void);
    /** Quick‑action callback shown as ＋ on hover / split button */
    quickAction?: () => void;
    /** Keyboard shortcut label displayed in menus / tooltips */
    shortcut?: string;
    /** Whether this item should appear on mobile */
    showOnMobile?: boolean;
    /** Whether this item should appear on desktop web / Electron */
    showOnDesktop?: boolean;
    /** Badge count (e.g. pending items) */
    badge?: number;
}

// ─── Sub‑group (collapsible section inside a top‑level group) ──────────────────

export interface NavSubGroup {
    /** Unique id, e.g. "supplier-management" */
    id: string;
    /** Section heading displayed inside the collapsible */
    label: string;
    /** Optional icon shown next to the heading */
    icon?: ReactNode;
    /** Items in this sub‑group */
    items: NavItemBase[];
    /** Whether this sub‑group starts collapsed (default: true) */
    defaultCollapsed?: boolean;
}

// ─── Top‑level navigation group ────────────────────────────────────────────────

export interface NavGroup {
    /** Group key matching `NavGroupKey` */
    key: NavGroupKey;
    /** Human‑readable label (e.g. "Procurement") */
    label: string;
    /** Optional group‑level icon */
    icon?: ReactNode;
    /** Direct child items (not nested in a sub‑group) */
    items: NavItemBase[];
    /** Optional collapsible sub‑groups */
    subGroups?: NavSubGroup[];
    /** Whether the whole group starts collapsed (default: false) */
    defaultCollapsed?: boolean;
    /** Controls group ordering; lower = higher in sidebar */
    order: number;
}

// ─── Hook return types ─────────────────────────────────────────────────────────

export interface UseNavGroupsReturn {
    /** Ordered list of top‑level navigation groups (permission‑filtered) */
    groups: NavGroup[];
    /** All items flattened (useful for search / command palette) */
    flatItems: NavItemBase[];
}

// ─── Quick‑action modal ────────────────────────────────────────────────────────

export type QuickActionType =
    | 'new-product'
    | 'new-customer'
    | 'new-supplier'
    | 'new-purchase-order'
    | 'new-requisition'
    | 'new-user';

export interface QuickActionConfig {
    type: QuickActionType;
    label: string;
    icon: ReactNode;
    shortcut?: string;
}
