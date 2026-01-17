import { FunctionComponent, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import classNames from 'classnames';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
    className?: string;
    showDragHandle?: boolean;
}

const BottomSheet: FunctionComponent<BottomSheetProps> = ({
    isOpen,
    onClose,
    children,
    title,
    className = '',
    showDragHandle = true,
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const sheetClass = classNames(
        'absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-50 max-h-[85%] overflow-auto safe-area-bottom',
        className
    );

    // Find the main content container to portal into
    const getPortalContainer = () => {
        // Try to find the main content area
        const mainContent = document.querySelector('main');
        return mainContent || document.body;
    };

    const content = (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-40">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/50"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className={sheetClass}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100 || info.velocity.y > 500) {
                                onClose();
                            }
                        }}
                    >
                        {showDragHandle && (
                            <div className="flex justify-center py-3">
                                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                            </div>
                        )}

                        {title && (
                            <div className="px-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    {title}
                                </h3>
                            </div>
                        )}

                        <div className="p-4">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, getPortalContainer());
};

export default BottomSheet;
