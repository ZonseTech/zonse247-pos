import { FunctionComponent } from 'react';
import { NavLink } from 'react-router-dom';
import { SETTINGS_TABS, SettingsTab } from '../constants/config';
import { ROUTES } from '../../../utils/constants';
import { useAuth } from '../../../context/AuthProvider';
import { hasPermission } from '../../../utils';

const SETTINGS_ROUTES: Record<string, string> = {
    general: ROUTES.SETTINGS_GENERAL,
    sales: ROUTES.SETTINGS_SALES,
    receipt: ROUTES.SETTINGS_RECEIPT,
    security: ROUTES.SETTINGS_SECURITY,
    navigation: ROUTES.SETTINGS_NAVIGATION,
};

interface SidebarItemProps {
    tab: SettingsTab;
}

const SidebarItem: FunctionComponent<SidebarItemProps> = ({ tab }) => {
    const Icon = tab.icon;
    const { user } = useAuth();

    const canManageNavigation = hasPermission(
        user,
        'settings.navigation.manage'
    );

    if (tab.id === 'navigation' && !canManageNavigation) {
        return null;
    }

    return (
        <NavLink
            to={SETTINGS_ROUTES[tab.id]}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${isActive
                    ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-l-4 border-sky-500'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`
            }
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{tab.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {tab.description}
                </p>
            </div>
        </NavLink>
    );
};

const SettingsSidebar: FunctionComponent = () => {
    return (
        <aside className="w-72 flex-shrink-0">
            <div className="sticky top-6">
                <nav className="space-y-1">
                    {SETTINGS_TABS.map((tab) => (
                        <SidebarItem key={tab.id} tab={tab} />
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default SettingsSidebar;
