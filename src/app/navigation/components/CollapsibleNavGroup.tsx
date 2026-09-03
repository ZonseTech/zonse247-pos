import { useMemo, useState, type FunctionComponent } from 'react';
import classNames from 'classnames';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import type {
    NavGroup as NavGroupType,
    NavItemBase,
    NavSubGroup,
} from '../../../types/navigation';

/**
 * Determine whether a nav item is "active".
 * Handles both plain paths (`/suppliers`) and
 * query-param routes (`/procurement?tab=suppliers`).
 */
function isItemActive(
    item: NavItemBase,
    currentPathname: string,
    currentSearch: string,
): boolean {
    if (!item.route) return false;

    const qIdx = item.route.indexOf('?');

    if (qIdx === -1) {
        // Plain path — exact match or child route
        return (
            currentPathname === item.route ||
            currentPathname.startsWith(item.route + '/')
        );
    }

    // Route has query string, e.g. "/procurement?tab=suppliers"
    const routePath = item.route.slice(0, qIdx);
    const routeSearch = item.route.slice(qIdx); // includes '?'

    return currentPathname === routePath && currentSearch === routeSearch;
}

// ─── Shared nav-item button ───────────────────────────────────────────────────

interface NavItemButtonProps {
    item: NavItemBase;
    isActive: boolean;
    onItemClick: (item: NavItemBase) => void;
}

const NavItemButton: FunctionComponent<NavItemButtonProps> = ({
    item,
    isActive,
    onItemClick,
}) => {
    const button = (
        <button
            onClick={() => onItemClick(item)}
            data-nav-active={isActive || undefined}
            className={classNames(
                'flex items-center rounded-lg text-left transition-all duration-200 active:scale-[0.98] w-full group gap-2.5 px-2.5 py-1.5',
                isActive
                    ? 'bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-500/10 dark:to-indigo-500/10 text-sky-500 dark:text-sky-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200',
            )}
        >
            <div
                className={classNames(
                    'flex items-center justify-center transition-all duration-200',
                    isActive
                        ? 'text-sky-500 dark:text-sky-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300',
                )}
            >
                {item.icon}
            </div>
            <span
                className={classNames(
                    'text-[13px] flex-1 transition-colors duration-200',
                    isActive ? 'font-semibold' : 'font-medium',
                )}
            >
                {item.label}
            </span>
            {item.badge !== undefined && item.badge > 0 && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-sky-500 text-white text-[10px] font-bold px-1">
                    {item.badge}
                </span>
            )}
            {item.shortcut && (
                <kbd className="hidden lg:inline-flex items-center text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                    {item.shortcut}
                </kbd>
            )}
            {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            )}
        </button>
    );

    // Wrap with Radix Tooltip if shortcut exists
    if (item.shortcut) {
        return (
            <Tooltip.Provider delayDuration={400}>
                <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                        {button}
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Content
                            side="right"
                            sideOffset={8}
                            className="z-50 rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-1.5 text-xs text-white shadow-md animate-fade-in"
                        >
                            {item.label}
                            <span className="ml-2 font-mono text-gray-400">{item.shortcut}</span>
                            <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
                        </Tooltip.Content>
                    </Tooltip.Portal>
                </Tooltip.Root>
            </Tooltip.Provider>
        );
    }

    return button;
};

// ─── Collapsible sub-group ────────────────────────────────────────────────────

interface SubGroupSectionProps {
    subGroup: NavSubGroup;
    currentPath: string;
    currentSearch: string;
    onItemClick: (item: NavItemBase) => void;
}

const SubGroupSection: FunctionComponent<SubGroupSectionProps> = ({
    subGroup,
    currentPath,
    currentSearch,
    onItemClick,
}) => {
    // Auto-expand if any child is active
    const hasActiveChild = subGroup.items.some((item) =>
        isItemActive(item, currentPath, currentSearch),
    );
    const [open, setOpen] = useState(!subGroup.defaultCollapsed || hasActiveChild);

    return (
        <Collapsible.Root open={open} onOpenChange={setOpen}>
            <Collapsible.Trigger asChild>
                <button
                    className={classNames(
                        'flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left transition-all duration-200',
                        'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-700 dark:hover:text-gray-300',
                    )}
                >
                    {subGroup.icon && (
                        <div className="flex items-center justify-center text-gray-400 dark:text-gray-500">
                            {subGroup.icon}
                        </div>
                    )}
                    <span className="text-[11px] font-semibold uppercase tracking-wider flex-1">
                        {subGroup.label}
                    </span>
                    <ChevronRight
                        size={14}
                        className={classNames(
                            'transition-transform duration-200 text-gray-400',
                            open && 'rotate-90',
                        )}
                    />
                </button>
            </Collapsible.Trigger>

            <Collapsible.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="flex flex-col gap-0.5 pl-3 mt-0.5 border-l-2 border-gray-100 dark:border-gray-800 ml-3">
                    {subGroup.items.map((item) => (
                        <NavItemButton
                            key={item.id}
                            item={item}
                            isActive={isItemActive(item, currentPath, currentSearch)}
                            onItemClick={onItemClick}
                        />
                    ))}
                </div>
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

// ─── Top-level collapsible group ──────────────────────────────────────────────

export interface CollapsibleNavGroupProps {
    group: NavGroupType;
    onItemClick: (item: NavItemBase) => void;
}

const CollapsibleNavGroup: FunctionComponent<CollapsibleNavGroupProps> = ({
    group,
    onItemClick,
}) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const currentSearch = location.search;

    // Check if any item (direct or in sub-groups) is active
    const hasActiveItem = (items: NavItemBase[]): boolean =>
        items.some((item) => isItemActive(item, currentPath, currentSearch));

    const anyActive = useMemo(
        () =>
            hasActiveItem(group.items) ||
            (group.subGroups?.some((sg) => hasActiveItem(sg.items)) ?? false),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentPath, currentSearch, group],
    );

    const [open, setOpen] = useState(!group.defaultCollapsed || anyActive);

    // Skip empty groups
    const totalItems =
        group.items.length + (group.subGroups?.reduce((sum, sg) => sum + sg.items.length, 0) ?? 0);
    if (totalItems === 0) return null;

    return (
        <Collapsible.Root open={open} onOpenChange={setOpen}>
            {/* Group header / toggle */}
            <Collapsible.Trigger asChild>
                <button className="flex items-center gap-3 px-3 mb-1 w-full text-left group/header">
                    <span
                        className={classNames(
                            'text-[10px] font-semibold uppercase tracking-wider transition-colors duration-200',
                            anyActive
                                ? 'text-sky-500 dark:text-sky-400'
                                : 'text-gray-400 dark:text-gray-500 group-hover/header:text-gray-600 dark:group-hover/header:text-gray-300',
                        )}
                    >
                        {group.label}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
                    <ChevronRight
                        size={12}
                        className={classNames(
                            'transition-transform duration-200 text-gray-400 dark:text-gray-500',
                            open && 'rotate-90',
                        )}
                    />
                </button>
            </Collapsible.Trigger>

            {/* Collapsible body */}
            <Collapsible.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="flex flex-col gap-0.5">
                    {/* Direct items */}
                    {group.items.map((item) => (
                        <NavItemButton
                            key={item.id}
                            item={item}
                            isActive={isItemActive(item, currentPath, currentSearch)}
                            onItemClick={onItemClick}
                        />
                    ))}

                    {/* Nested sub-groups */}
                    {group.subGroups?.map((subGroup) => (
                        <SubGroupSection
                            key={subGroup.id}
                            subGroup={subGroup}
                            currentPath={currentPath}
                            currentSearch={currentSearch}
                            onItemClick={onItemClick}
                        />
                    ))}
                </div>
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

export default CollapsibleNavGroup;
