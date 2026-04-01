import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { LayoutGrid, X } from 'lucide-react';

export interface HubNavLink {
    id: string;
    label: string;
    path: string;
    icon?: React.ReactNode;
}

interface FloatingHubNavButtonProps {
    links: HubNavLink[];
    className?: string;
}

const FloatingHubNavButton: FC<FloatingHubNavButtonProps> = ({ links, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    const handleNavigate = useCallback(
        (path: string) => {
            navigate(path);
            setIsOpen(false);
        },
        [navigate],
    );

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen]);

    return (
        <div className={`fixed bottom-36 right-4 z-40 ${className}`}>
            {/* Link panel */}
            {isOpen && (
                <div
                    ref={panelRef}
                    className="absolute bottom-16 right-0 w-52 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Inventory Hub
                        </p>
                    </div>
                    <nav className="py-1">
                        {links.map((link) => {
                            const isActive = pathname.startsWith(link.path);
                            return (
                                <button
                                    key={link.id}
                                    onClick={() => handleNavigate(link.path)}
                                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2
                                        ${isActive
                                            ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    {link.icon}
                                    {link.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* FAB toggle */}
            <button
                ref={buttonRef}
                onClick={toggle}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95
                    ${isOpen
                        ? 'bg-gray-700 dark:bg-gray-600 text-white rotate-0'
                        : 'bg-indigo-500 text-white hover:bg-indigo-600'
                    }`}
                aria-label={isOpen ? 'Close hub navigation' : 'Open hub navigation'}
            >
                {isOpen ? <X className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
            </button>
        </div>
    );
};

export default FloatingHubNavButton;
