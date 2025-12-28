import useNavItems from './partials/navItems';
import { useState, useEffect, type FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Menu, X } from 'lucide-react';
import classNames from 'classnames';

const NavBar: FunctionComponent = () => {
    const location = useLocation();
    const navItems = useNavItems();
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
        <nav className="bg-white dark:bg-gray-900 md:border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="hidden md:block overflow-x-auto overflow-y-hidden py-2">
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
                <div className="flex items-center justify-between px-4 pr-0 py-3">
                    <button
                        onClick={toggleMenu}
                        className="relative z-50 p-2 rounded-xl text-gray-700 dark:text-gray-300 active:scale-95 transition-all duration-200"
                        aria-label="Toggle menu"
                    >
                        <div className="relative w-6 h-6">
                            <Menu
                                size={24}
                                className={classNames(
                                    "absolute inset-0 transition-all duration-300",
                                    isMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                                )}
                            />
                        </div>
                    </button>
                </div>

                <div
                    className={classNames(
                        "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300",
                        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                />

                <div
                    className={classNames(
                        "fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 ease-out",
                        isMenuOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Zonse247 POS</h2>
                            <button
                                onClick={toggleMenu}
                                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="flex flex-col gap-1 px-3">
                                {navItems.map((item, index) => {
                                    const routePath = getRoutePath(item.onClick);
                                    const isActive = location.pathname === routePath;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleItemClick(item.onClick)}
                                            className={classNames(
                                                "flex items-center gap-4 px-0 py-2 rounded-xl text-left transition-all duration-200 active:scale-98",
                                                isActive
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            <div className={classNames(
                                                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200",
                                                isActive
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-gray-600 dark:text-gray-400"
                                            )}>
                                                {item.icon}
                                            </div>
                                            <div className="flex-1">
                                                <span className={classNames(
                                                    "text-base font-medium block",
                                                    isActive ? "font-semibold" : ""
                                                )}>
                                                    {item.text}
                                                </span>
                                            </div>
                                            {isActive && (
                                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="px-6 py-14 border-t border-gray-200 dark:border-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Tap outside to close
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;