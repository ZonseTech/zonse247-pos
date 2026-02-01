import type { FunctionComponent } from 'react';
import classNames from 'classnames';
import { NAV_GROUP_LABELS } from '../partials/navItems';
import type { NavGroupProps } from './types';

const NavGroup: FunctionComponent<NavGroupProps> = ({
    groupKey,
    items,
    isCollapsed = false,
    onItemClick,
    getRoutePath,
    isRouteActive,
}) => {
    if (items.length === 0) return null;

    return (
        <div>
            {!isCollapsed && (
                <div className="flex items-center gap-3 px-3 mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {NAV_GROUP_LABELS[groupKey]}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
                </div>
            )}
            {isCollapsed && (
                <div
                    className="w-8 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-auto my-1"
                    title={NAV_GROUP_LABELS[groupKey]}
                />
            )}
            <div className="flex flex-col gap-0.5">
                {items.map((item, index) => {
                    const routePath = getRoutePath(item.onClick);
                    const isActive = isRouteActive(routePath);
                    return (
                        <button
                            key={`${groupKey}-${index}`}
                            onClick={() => onItemClick(item.onClick)}
                            title={isCollapsed ? item.text : undefined}
                            className={classNames(
                                "flex items-center rounded-lg text-left transition-all duration-200 active:scale-[0.98] w-full group",
                                isCollapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-1.5",
                                isActive
                                    ? "bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-500/10 dark:to-indigo-500/10 text-sky-500 dark:text-sky-400"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <div className={classNames(
                                "flex items-center justify-center transition-all duration-200",
                                isActive
                                    ? "text-sky-500 dark:text-sky-400"
                                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                            )}>
                                {item.icon}
                            </div>
                            {!isCollapsed && (
                                <>
                                    <span className={classNames(
                                        "text-[13px] flex-1 transition-colors duration-200",
                                        isActive ? "font-semibold" : "font-medium"
                                    )}>
                                        {item.text}
                                    </span>
                                    {isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                    )}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default NavGroup;
