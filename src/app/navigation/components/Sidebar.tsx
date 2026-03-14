import type { FunctionComponent } from 'react';
import BranchSwitcher from '../../components/BranchSwitcher';
import logo from '../../assets/images/logo.png';
import NavGroup from './NavGroup';
import SidebarFooter from './SidebarFooter';
import type { SidebarProps } from './types';
import { GROUP_ORDER } from './types';

const Sidebar: FunctionComponent<SidebarProps> = ({
    groupedNavItems,
    onItemClick,
    getRoutePath,
    isRouteActive,
}) => {
    return (
        <aside className="h-full flex flex-col safe-area-top w-full bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/95 border-r border-gray-200/60 dark:border-gray-800/60">
            {/* Header */}
            <div className="flex flex-col border-b border-gray-200/60 dark:border-gray-800/60 p-4">
                <div className="flex items-center">
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
                </div>

                <div className="mt-4">
                    <BranchSwitcher compact />
                </div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                <div className="flex flex-col gap-4 px-3">
                    {GROUP_ORDER.map((groupKey) => (
                        <NavGroup
                            key={groupKey}
                            groupKey={groupKey}
                            items={groupedNavItems[groupKey]}
                            onItemClick={onItemClick}
                            getRoutePath={getRoutePath}
                            isRouteActive={isRouteActive}
                        />
                    ))}
                </div>
            </div>

            {/* Footer */}
            <SidebarFooter />
        </aside>
    );
};

export default Sidebar;
