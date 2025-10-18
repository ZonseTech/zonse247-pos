import navItems from './partials/navItems';
import { type FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const NavBar: FunctionComponent = () => {
    const location = useLocation();

    const getRoutePath = (onClick: any): string => {
        for (const [key, value] of Object.entries(ROUTES)) {
            if (onClick?.toString().includes(key) || onClick?.toString().includes(value as string)) {
                return value as string;
            }
        }
        return '';
    };

    return (
        <nav className="py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="flex gap-0.5 mx-2 items-center">
                {navItems().map((item, index) => {
                    const routePath = getRoutePath(item.onClick);
                    const isActive = location.pathname === routePath;

                    return (
                        <div key={index} className="flex items-center">
                            {item.type === 'button' && (
                                <button
                                    onClick={typeof item.onClick === 'function' ? item.onClick : undefined}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors duration-150 whitespace-nowrap font-normal ${isActive
                                            ? 'border border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100 font-semibold'
                                            : 'border border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {item.icon}
                                    <span className="text-sm font-semibold">{item.text}</span>
                                </button>
                            )}
                            {index < navItems().length - 1 && (
                                <span className="text-gray-300 dark:text-gray-700 text-xs mx-0.5 select-none">|</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
};

export default NavBar;