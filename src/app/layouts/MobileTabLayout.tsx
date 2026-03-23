import { FunctionComponent, ReactNode, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import MobileBottomNav from '../components/navigation/MobileBottomNav';
import { MobileDrawer } from '../navigation/components';
import useNavGroups from '../navigation/partials/useNavGroups';
import type { NavItemBase } from '../../types/navigation';
import { MobileNavProvider, useMobileNav } from '../context/MobileNavContext';
import { useMobileBottomNav } from '../hooks/useMobileBottomNav';

interface MobileTabLayoutProps {
    children?: ReactNode;
}

const MobileTabLayout: FunctionComponent<MobileTabLayoutProps> = ({ children }) => {
    const { groups } = useNavGroups();
    const { isDrawerOpen: isNavDrawerOpen, closeDrawer } = useMobileNav();
    const { bottomNavItems, activeTabId } = useMobileBottomNav();

    useEffect(() => {
        if (isNavDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isNavDrawerOpen]);

    const handleNavItemClick = (_item: NavItemBase) => {
        closeDrawer();
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-100 dark:bg-gray-900">

            <div className="flex-1 min-h-0 overflow-hidden pb-[52px]">
                {children || <Outlet />}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40">
                <MobileBottomNav items={bottomNavItems} activeId={activeTabId} />
            </div>

            <MobileDrawer
                isOpen={isNavDrawerOpen}
                onClose={closeDrawer}
                navGroups={groups}
                onNavItemClick={handleNavItemClick}
            />
        </div>
    );
};

const MobileTabLayoutWithProvider: FunctionComponent<MobileTabLayoutProps> = (props) => {
    return (
        <MobileNavProvider>
            <MobileTabLayout {...props} />
        </MobileNavProvider>
    );
};

export default MobileTabLayoutWithProvider;
