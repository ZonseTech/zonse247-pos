import useNavItems from './partials/navItems';
import { PropsWithChildren, useState, type FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Menu, X } from 'lucide-react';

const NavBar: FunctionComponent = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navItems = useNavItems();

    const getRoutePath = (onClick: any): string => {
        for (const [key, value] of Object.entries(ROUTES)) {
            if (onClick?.toString().includes(key) || onClick?.toString().includes(value as string)) {
                return value as string;
            }
        }
        return '';
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleItemClick = (onClick: any) => {
        if (typeof onClick === 'function') {
            onClick();
        }
        setIsMenuOpen(false);
    };

    return (
        <nav className="py-2 bg-white dark:bg-gray-900 md:border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="hidden md:block overflow-x-auto overflow-y-hidden">
                <div className="flex gap-0.5 mx-2 items-center min-w-max">
                    {navItems.map((item, index) => {
                        const routePath = getRoutePath(item.onClick);
                        const isActive = location.pathname === routePath;
                        return (
                            <div key={index} className="flex items-center">
                                {item.type === 'button' && (
                                    <button
                                        onClick={(typeof item.onClick === 'function' ? item.onClick : undefined) as any}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors duration-150 whitespace-nowrap font-normal ${isActive
                                            ? 'border px-3 py-2 border-gray-700 dark:border-gray-500 text-gray-900 dark:text-gray-100 font-semibold'
                                            : 'border border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="text-sm font-semibold">{item.text}</span>
                                    </button>
                                )}
                                {index < navItems.length - 1 && (
                                    <span className="text-gray-300 dark:text-gray-700 text-xs mx-0.5 select-none">|</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="md:hidden">
                <button
                    onClick={toggleMenu}
                    className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {isMenuOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-50">
                        <div className="flex flex-col py-2">
                            {navItems.map((item, index) => {
                                const routePath = getRoutePath(item.onClick);
                                const isActive = location.pathname === routePath;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleItemClick(item.onClick)}
                                        className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${isActive
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {item.icon}
                                        <span className="text-base font-medium">{item.text}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default NavBar;