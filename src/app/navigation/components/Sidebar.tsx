import type { FunctionComponent } from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import classNames from 'classnames';
import BranchSwitcher from '../../components/BranchSwitcher';
import logo from '../../assets/images/logo.png';
import NavGroup from './NavGroup';
import type { SidebarProps } from './types';
import { GROUP_ORDER } from './types';

const Sidebar: FunctionComponent<SidebarProps> = ({
    isCollapsed = false,
    onToggleCollapse,
    groupedNavItems,
    onItemClick,
    getRoutePath,
    isRouteActive,
}) => {
    return (
        <aside className={classNames(
            "h-full z-50 transition-all duration-300 flex flex-col safe-area-top",
            "bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/95",
            "border-r border-gray-200/60 dark:border-gray-800/60",
            isCollapsed ? "w-[72px]" : "w-full"
        )}>
            {/* Header */}
            <div className={classNames(
                "flex flex-col border-b border-gray-200/60 dark:border-gray-800/60",
                isCollapsed ? "py-4" : "p-4"
            )}>
                <div className={classNames(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Zonse247" className="w-10 h-10 rounded-xl object-contain" />
                            <div>
                                <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                    Zonse247
                                </h2>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">
                                    Point of Sale
                                </p>
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <img src={logo} alt="Zonse247" className="w-10 h-10 rounded-xl object-contain" />
                    )}
                    {onToggleCollapse && !isCollapsed && (
                        <button
                            onClick={onToggleCollapse}
                            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200"
                            aria-label="Collapse sidebar"
                            title="Collapse sidebar"
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="mt-4">
                        <BranchSwitcher compact />
                    </div>
                )}

                {isCollapsed && onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className="mt-3 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 mx-auto"
                        aria-label="Expand sidebar"
                        title="Expand sidebar"
                    >
                        <PanelLeft size={18} />
                    </button>
                )}
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                <div className={classNames("flex flex-col gap-4", isCollapsed ? "px-2" : "px-3")}>
                    {GROUP_ORDER.map((groupKey) => (
                        <NavGroup
                            key={groupKey}
                            groupKey={groupKey}
                            items={groupedNavItems[groupKey]}
                            isCollapsed={isCollapsed}
                            onItemClick={onItemClick}
                            getRoutePath={getRoutePath}
                            isRouteActive={isRouteActive}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
