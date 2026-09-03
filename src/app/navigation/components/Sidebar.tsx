import { useEffect, useRef, type FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';
import BranchSwitcher from '../../components/BranchSwitcher';
import logo from '../../assets/images/logo.png';
import CollapsibleNavGroup from './CollapsibleNavGroup';
import SidebarFooter from './SidebarFooter';
import type { SidebarProps } from './types';
import type { NavItemBase } from '../../../types/navigation';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Separator from '@radix-ui/react-separator';
import { version as appVersion } from '../../../../package.json';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || appVersion || '1.3.9';

const Sidebar: FunctionComponent<SidebarProps> = ({
    navGroups,
    onNavItemClick,
}) => {
    const { pathname } = useLocation();
    const viewportRef = useRef<HTMLDivElement>(null);

    const handleNavItemClick = (item: NavItemBase) => {
        if (item.onClick) {
            item.onClick();
        }
        onNavItemClick?.(item);
    };

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const activeEl = viewportRef.current?.querySelector('[data-nav-active="true"]');
            activeEl?.scrollIntoView({ block: 'nearest' });
        });
        return () => cancelAnimationFrame(frame);
    }, [pathname, navGroups]);

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
                                Point of Sale {' '}
                                <span className="text-[8px] font-thin lowercase">
                                    v{APP_VERSION}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <Separator.Root className="mt-4 mb-0 h-px bg-gray-200/60 dark:bg-gray-800/60" decorative />

                <div className="mt-3">
                    <BranchSwitcher compact />
                </div>
            </div>

            {/* Navigation Items — Radix ScrollArea */}
            <ScrollArea.Root className="flex-1 overflow-hidden">
                <ScrollArea.Viewport ref={viewportRef} className="h-full w-full py-2">
                    <div className="flex flex-col gap-4 px-3">
                        {navGroups?.map((group) => (
                            <CollapsibleNavGroup
                                key={group.key}
                                group={group}
                                onItemClick={handleNavItemClick}
                            />
                        ))}
                    </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                    className="flex select-none touch-none p-0.5 bg-transparent transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800 data-[orientation=vertical]:w-2"
                    orientation="vertical"
                >
                    <ScrollArea.Thumb className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            {/* Footer */}
            <SidebarFooter />
        </aside>
    );
};

export default Sidebar;
