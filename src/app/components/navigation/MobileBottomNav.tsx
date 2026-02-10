import { FunctionComponent, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface BottomNavItem {
    id: string;
    label: string;
    icon: ReactNode;
    route?: string;
    onClick?: () => void;
    badge?: number;
}

interface MobileBottomNavProps {
    items: BottomNavItem[];
    activeId?: string;
}

const MobileBottomNav: FunctionComponent<MobileBottomNavProps> = ({ items, activeId }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleItemPress = (item: BottomNavItem) => {
        if (item.onClick) {
            item.onClick();
        } else if (item.route) {
            navigate(item.route);
        }
    };

    const isActive = (item: BottomNavItem): boolean => {
        if (activeId) {
            return item.id === activeId;
        }
        if (item.route) {
            return location.pathname === item.route || location.pathname.startsWith(item.route + '/');
        }
        return false;
    };

    return (
        <nav className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
            <div className="flex items-stretch justify-around p-0">
                {items.map((item) => {
                    const active = isActive(item);
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleItemPress(item)}
                            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 transition-all min-h-[52px] rounded-none mx-0.5 ${active
                                ? 'bg-sky-500 dark:bg-sky-700 text-white'
                                : 'text-sky-500 dark:text-sky-400 active:bg-sky-50 dark:active:bg-sky-900/30'
                                }`}
                        >
                            <div className={`relative mb-1 ${active ? 'scale-105' : ''} transition-transform`}>
                                {item.icon}
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className={`absolute -top-0.5 -right-5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 bg-emerald-500 text-white`}>
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
