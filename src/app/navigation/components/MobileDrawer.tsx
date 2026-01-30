import { useState, type FunctionComponent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Building2 } from 'lucide-react';
import classNames from 'classnames';
import { version } from '../../../../package.json';
import { NAV_GROUP_LABELS } from '../partials/navItems';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useAuth } from '../../context/AuthProvider';
import { useBranch } from '../../context/BranchContext';
import Button from '../../components/Button';
import BranchSwitchModal from './BranchSwitchModal';
import { ROUTES } from '../../utils/constants';
import type { MobileDrawerProps } from './types';
import { GROUP_ORDER } from './types';
import { HiOutlineChevronUpDown } from 'react-icons/hi2';

const MobileDrawer: FunctionComponent<MobileDrawerProps> = ({
    isOpen,
    onClose,
    groupedNavItems,
    onItemClick,
    getRoutePath,
    isRouteActive,
}) => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentBranch, accessibleBranches } = useBranch();
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

    const handleItemClick = (onClick: any) => {
        onItemClick(onClick);
        onClose();
    };

    const handleEditBranch = () => {
        onClose();
        navigate(ROUTES.BRANCH_FORM, { state: { branchId: currentBranch?.branchId } });
    };

    const handleEditProfile = () => {
        onClose();
        navigate(ROUTES.MY_PROFILE);
    };

    const handleSwitchBranch = () => {
        setIsBranchModalOpen(true);
    };

    const handleCreateBranch = () => {
        onClose();
        navigate(ROUTES.BRANCH_FORM);
    };

    return (
        <>
            <div
                className={classNames(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <div
                className={classNames(
                    "fixed top-0 left-0 h-full w-[85%] max-w-sm bg-gray-100 dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 ease-out md:hidden",
                    isMobile && "safe-area-top-android",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="bg-sky-600 dark:bg-sky-700 px-5 py-4 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200"
                            aria-label="Close menu"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                            <h1 className="text-xl font-bold text-white">Zonse247 POS</h1>
                            <p className="text-sm text-white/70">v {version}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                            </div>
                            <Button
                                layout="link"
                                size="small"
                                theme='primary'
                                onClick={handleEditBranch}
                                className="underline text-xs text-sky-600 dark:text-sky-400 px-0 pr-0"
                            >
                                EDIT BRANCH
                            </Button>
                        </div>

                        <button
                            onClick={handleSwitchBranch}
                            className="flex items-center justify-between w-full text-left -mx-1 px-1 py-1 rounded-lg transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 truncate">
                                    {currentBranch?.branchName || 'No Branch'}
                                </p>
                                <p className="text-xs text-sky-500 dark:text-sky-400/80 truncate">
                                    {currentBranch?.phoneNumber || 'No phone number'}
                                </p>
                            </div>
                            <HiOutlineChevronUpDown className="w-6 h-6 flex-shrink-0 text-sky-600 dark:text-sky-400 " />
                        </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user?.fullname || 'Unknown User'}
                                        {user?.roleName && (
                                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                                                ({user.roleName})
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user?.email || 'No email'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                layout="link"
                                size="small"
                                theme='primary'
                                onClick={handleEditProfile}
                                className="underline flex-shrink-0 text-xs text-sky-600 dark:text-sky-400 px-0 pr-0"
                            >
                                EDIT PROFILE
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                            <Button
                                theme="primary"
                                layout="primary"
                                onClick={handleSwitchBranch}
                                disabled={accessibleBranches.length <= 1}
                                block
                            >
                                SWITCH BRANCH
                            </Button>
                            <Button
                                theme="success"
                                layout="primary"
                                onClick={handleCreateBranch}
                                block
                            >
                                CREATE BRANCH
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-3 px-2 bg-white dark:bg-gray-800">
                        <div className="flex flex-col gap-4">
                            {GROUP_ORDER.map((groupKey) => {
                                const items = groupedNavItems[groupKey];
                                if (items.length === 0) return null;

                                return (
                                    <div key={groupKey}>
                                        <div className="flex items-center gap-2 px-2 mb-1.5">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                {NAV_GROUP_LABELS[groupKey]}
                                            </span>
                                            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            {items.map((item, index) => {
                                                const routePath = getRoutePath(item.onClick);
                                                const isActive = isRouteActive(routePath);
                                                return (
                                                    <button
                                                        key={`${groupKey}-${index}`}
                                                        onClick={() => handleItemClick(item.onClick)}
                                                        className={classNames(
                                                            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 active:scale-[0.98] w-full group",
                                                            isActive
                                                                ? "text-sky-600 dark:text-sky-400"
                                                                : "text-gray-700 dark:text-gray-300"
                                                        )}
                                                    >
                                                        <div className={classNames(
                                                            "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150",
                                                            isActive
                                                                ? "text-sky-600 dark:text-sky-400"
                                                                : "text-gray-500 dark:text-gray-400"
                                                        )}>
                                                            {item.icon}
                                                        </div>
                                                        <span className={classNames(
                                                            "text-sm flex-1",
                                                            isActive ? "font-semibold" : "font-medium"
                                                        )}>
                                                            {item.text}
                                                        </span>
                                                        {isActive && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <BranchSwitchModal
                isOpen={isBranchModalOpen}
                onClose={() => setIsBranchModalOpen(false)}
                onBranchSwitch={onClose}
            />
        </>
    );
};

export default MobileDrawer;
