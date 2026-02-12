import { useMemo } from 'react';
import { IoBarChart } from "react-icons/io5";
import { FaCircleDollarToSlot, FaCashRegister, FaListCheck } from 'react-icons/fa6';
import { BottomNavItem } from '../components/navigation/MobileBottomNav';
import { ROUTES } from '../utils/constants';
import { useInventory } from './useInventory';
import { useLocation } from 'react-router-dom';
import { TbLayoutGridFilled } from 'react-icons/tb';

export const useMobileBottomNav = () => {
    const { cart } = useInventory();
    const location = useLocation();

    const bottomNavItems: BottomNavItem[] = useMemo(() => [
        {
            id: 'reports',
            label: 'Reports',
            icon: <IoBarChart className="w-6 h-6" />,
            route: ROUTES.MOBILE_REPORT,
        },
        {
            id: 'today',
            label: 'Today',
            icon: <FaCircleDollarToSlot className="w-6 h-6" />,
            route: ROUTES.TODAY_SALES,
        },
        {
            id: 'counter',
            label: 'Counter',
            icon: <FaCashRegister className="w-6 h-6" />,
            route: ROUTES.POS,
            badge: cart.length,
        },
        {
            id: 'items',
            label: 'Items',
            icon: <FaListCheck className="w-6 h-6" />,
            route: ROUTES.ITEMS,
        },
        {
            id: 'more',
            label: 'More',
            icon: <TbLayoutGridFilled className="w-6 h-6" />,
            route: ROUTES.MOBILE_MORE,
        },
    ], [cart.length]);

    const activeTabId = useMemo(() => {
        const path = location.pathname;
        if (path === ROUTES.MOBILE_REPORT || path.startsWith(ROUTES.MOBILE_REPORT + '/')) return 'reports';
        if (path === ROUTES.TODAY_SALES || path.startsWith(ROUTES.TODAY_SALES + '/')) return 'today';
        if (path === ROUTES.POS || path.startsWith(ROUTES.POS + '/')) return 'counter';
        if (path === ROUTES.ITEMS || path.startsWith(ROUTES.ITEMS + '/')) return 'items';
        if (path === ROUTES.MOBILE_MORE || path.startsWith(ROUTES.MOBILE_MORE + '/')) return 'more';
        return '';
    }, [location.pathname]);

    return { bottomNavItems, activeTabId };
};

export default useMobileBottomNav;
