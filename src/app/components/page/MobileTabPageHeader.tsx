import { FunctionComponent, ReactNode, useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import { FaCaretDown } from 'react-icons/fa';
import MobilePageHeader from './MobilePageHeader';
import { useBranch } from '../../context/BranchContext';
import { useMobileNav } from '../../context/MobileNavContext';
import BranchSwitchModal from '../../navigation/components/BranchSwitchModal';
import { HelpModal } from '../modals';

interface MobileTabPageHeaderProps {
    /**
     * Right side actions/components (rendered before the help chat icon)
     */
    rightContent?: ReactNode;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Children to render below the header (e.g., search bar, filters)
     */
    children?: ReactNode;
    /**
     * Whether to hide the bottom border
     */
    noBorder?: boolean;
    /**
     * Whether to show the help chat icon (default: true)
     */
    showHelpChat?: boolean;
}

const MobileTabPageHeader: FunctionComponent<MobileTabPageHeaderProps> = ({
    rightContent,
    className = '',
    children,
    noBorder = true,
    showHelpChat = true,
}) => {
    const { currentBranch } = useBranch();
    const { openDrawer } = useMobileNav();
    const [isBranchSwitchModalOpen, setIsBranchSwitchModalOpen] = useState(false);

    return (
        <>
            <MobilePageHeader
                theme="sky"
                className={`bg-sky-500 dark:bg-sky-700 ${className}`}
                noBorder={noBorder}
                showLeftButton={false}
                title={
                    <div className="flex items-center gap-3">
                        <HiMenu
                            className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                            onClick={openDrawer}
                        />
                        <button
                            onClick={() => setIsBranchSwitchModalOpen(true)}
                            className="flex items-center gap-1 rounded-sm active:scale-95 transition-all"
                        >
                            <span className="text-base font-semibold text-white truncate max-w-[180px]">
                                {currentBranch?.branchName || 'Select Branch'}
                            </span>
                            <FaCaretDown className="w-4 h-4 text-sky-100 flex-shrink-0" />
                        </button>
                    </div>
                }
                rightContent={
                    <div className="flex gap-4 items-center">
                        {rightContent}
                        {showHelpChat && <HelpModal />}
                    </div>
                }
            >
                {children}
            </MobilePageHeader>

            <BranchSwitchModal
                isOpen={isBranchSwitchModalOpen}
                onClose={() => setIsBranchSwitchModalOpen(false)}
            />
        </>
    );
};

export default MobileTabPageHeader;
