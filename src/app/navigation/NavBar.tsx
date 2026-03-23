import { useState, useEffect, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import useNavGroups from './partials/useNavGroups';
import type { NavItemBase } from '../../types/navigation';
import { Sidebar, MobileDrawer } from './components';

interface NavBarProps {
    variant?: 'sidebar' | 'topbar';
}

const NavBar: FunctionComponent<NavBarProps> = ({
    variant = 'sidebar',
}) => {
    const { groups } = useNavGroups();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    /**
     * Callback when a nav item is clicked (new hierarchical items).
     * The item's own `onClick` is already invoked inside the drawer/sidebar.
     */
    const handleNavItemClick = (_item: NavItemBase) => {
        setIsMenuOpen(false);
    };

    if (variant === 'topbar') {
        return (
            <MobileDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                navGroups={groups}
                onNavItemClick={handleNavItemClick}
            />
        );
    }

    return (
        <Sidebar
            navGroups={groups}
            onNavItemClick={handleNavItemClick}
        />
    );
};

export default NavBar;