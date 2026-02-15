import { NavLink, useLocation } from 'react-router';
import { ElementType } from 'react';
import { SETTINGS_TABS } from '../constants/config';
import { ROUTES } from '../../../utils/constants';
import PageHeader from '../../../components/page/PageHeader';
import MobilePageHeader from '../../../components/page/MobilePageHeader';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import { HiOutlineCog } from 'react-icons/hi2';

const SETTINGS_ROUTES: Record<string, string> = {
    general: ROUTES.SETTINGS_GENERAL,
    sales: ROUTES.SETTINGS_SALES,
    receipt: ROUTES.SETTINGS_RECEIPT,
    security: ROUTES.SETTINGS_SECURITY,
};

interface NavItemProps {
    id: string;
    label: string;
    icon: ElementType;
    to: string;
}

const NavItem = ({ id, label, icon: Icon, to }: NavItemProps) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `py-3 px-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${isActive
                ? 'border-sky-500 text-sky-500 dark:text-sky-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`
        }
    >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
    </NavLink>
);

const SettingsNavbar = () => {
    const location = useLocation();
    const isMobile = useIsMobile();

    const currentTab = SETTINGS_TABS.find(
        (tab) => SETTINGS_ROUTES[tab.id] === location.pathname
    ) || SETTINGS_TABS[0];

    if (isMobile) {
        return (
            <MobilePageHeader
                title={`${currentTab.label} Settings`}
            />
        );
    }

    return (
        <PageHeader
            title="Settings"
            description="Manage your application settings and preferences"
            icon={<HiOutlineCog className="w-8 h-8 text-sky-500" />}
            compact
        >
            <div className="flex gap-1 lg:gap-4 overflow-x-auto scrollbar-hide -mb-2">
                {SETTINGS_TABS.map(({ id, label, icon }) => (
                    <NavItem
                        key={id}
                        id={id}
                        label={label}
                        icon={icon}
                        to={SETTINGS_ROUTES[id]}
                    />
                ))}
            </div>
        </PageHeader>
    );
};

export default SettingsNavbar;
