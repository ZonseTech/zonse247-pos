import { FC, useRef, useState, useEffect } from "react";
import { Shield, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';
import roleService from '../../../services/role.service';

interface RoleFilterProps {
    selectedRole: string;
    onChange: (roleId: string) => void;
    isLoading?: boolean;
}

export const RoleFilter: FC<RoleFilterProps> = ({
    selectedRole,
    onChange,
    isLoading: externalLoading = false
}) => {
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadRoles = async () => {
            try {
                setIsLoading(true);
                const response = await roleService.list();
                setRoles(response.data || []);
            } catch (error) {
                console.error('Error loading roles:', error);
                setRoles([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadRoles();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 150;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (isLoading || externalLoading) {
        return (
            <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading roles...</span>
            </div>
        );
    }

    // Mobile: render as dropdown
    if (isMobile) {
        return (
            <div className="flex items-center gap-2 w-full">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Role:</span>
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <select
                        value={selectedRole}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-10 pl-10 pr-8 
                            appearance-none cursor-pointer
                            rounded-lg text-sm font-medium
                            bg-white dark:bg-gray-800 
                            text-gray-700 dark:text-gray-200
                            border border-gray-300 dark:border-gray-600
                            focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400
                            focus:border-sky-500 dark:focus:border-sky-400
                            transition-colors"
                    >
                        <option value="all" className="bg-white dark:bg-gray-800">
                            All Roles
                        </option>
                        {roles.map((role) => (
                            <option
                                key={role.roleId}
                                value={role.roleId}
                                className="bg-white dark:bg-gray-800"
                            >
                                {role.displayName || role.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    // EBN/Desktop: render as scrollable button row
    return (
        <div className="flex items-center gap-2">
            <span className={`text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap ${isEBN ? 'text-xs' : ''}`}>
                Role:
            </span>

            {/* Scroll left button */}
            {roles.length > 3 && (
                <button
                    onClick={() => scroll('left')}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
            )}

            <div
                ref={scrollContainerRef}
                className={`flex items-center gap-1.5 overflow-x-auto scrollbar-hide ${isEBN ? 'max-w-[400px]' : 'max-w-[500px]'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* All Roles button */}
                <button
                    onClick={() => onChange('all')}
                    className={`
                        flex items-center gap-1.5 
                        ${isEBN ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'}
                        rounded-lg border font-medium whitespace-nowrap
                        transition-all duration-200
                        ${selectedRole === 'all' || !selectedRole
                            ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }
                    `}
                >
                    <Shield className={`${isEBN ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
                    All Roles
                </button>

                {/* Individual role buttons */}
                {roles.map((role) => (
                    <button
                        key={role.roleId}
                        onClick={() => onChange(role.roleId)}
                        className={`
                            flex items-center gap-1.5 
                            ${isEBN ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'}
                            rounded-lg border font-medium whitespace-nowrap
                            transition-all duration-200
                            ${selectedRole === role.roleId
                                ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }
                        `}
                    >
                        {role.displayName || role.name}
                    </button>
                ))}
            </div>

            {/* Scroll right button */}
            {roles.length > 3 && (
                <button
                    onClick={() => scroll('right')}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
            )}
        </div>
    );
};

export default RoleFilter;
