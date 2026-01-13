import { type ReactNode, useEffect, useState, useCallback } from 'react';
import Modal from 'react-modal';
import classNames from 'classnames';
import { HiX } from 'react-icons/hi';

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    header?: ReactNode;
    showCloseButton?: boolean;
    shouldCloseOnOverlayClick?: boolean;
    className?: string;
    overlayClassName?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
};

const CustomModal: React.FC<CustomModalProps> = ({
    isOpen,
    onClose,
    title = 'Modal Title',
    children,
    showCloseButton = true,
    shouldCloseOnOverlayClick = true,
    className = '',
    overlayClassName = '',
    header = '',
    size = 'md',
}) => {
    const [visible, setVisible] = useState(isOpen);
    const [closing, setClosing] = useState(false);

    // Handle escape key press
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
            onClose();
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [handleEscape]);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setClosing(false);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else if (visible) {
            setClosing(true);
            setTimeout(() => {
                setVisible(false);
                setClosing(false);
            }, 300);
            // Restore body scroll
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, visible]);

    if (!visible) return null;

    const modalClass = classNames(
        // Base styles
        'w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200',
        'rounded-t-2xl sm:rounded-2xl shadow-2xl',
        'p-4 sm:p-6',
        'transition-all transform duration-300 ease-out',
        // Mobile: bottom sheet style, Desktop: centered
        'fixed sm:relative',
        'bottom-0 sm:bottom-auto',
        'left-0 sm:left-auto right-0 sm:right-auto',
        'max-h-[90vh] sm:max-h-[85vh]',
        'overflow-y-auto',
        // Animations
        {
            'animate-slide-up sm:animate-scale-in': !closing,
            'animate-slide-down sm:animate-scale-out': closing,
        },
        // Size classes (only on desktop)
        `sm:${sizeClasses[size]}`,
        className
    );

    const modalOverlayClass = classNames(
        'fixed inset-0 z-50',
        'bg-black/60 backdrop-blur-sm',
        'flex items-end sm:items-center justify-center',
        'p-0 sm:p-4',
        'transition-opacity duration-300',
        {
            'opacity-100': !closing,
            'opacity-0': closing,
        },
        overlayClassName
    );

    return (
        <Modal
            isOpen={visible}
            onRequestClose={onClose}
            shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
            className={modalClass}
            overlayClassName={modalOverlayClass}
            ariaHideApp={false}
        >
            {/* Mobile drag handle */}
            <div className="flex justify-center sm:hidden mb-2">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {header ? header : (
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {title && (
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                    )}
                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Close modal"
                        >
                            <HiX className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-y-auto">{children}</div>
        </Modal>
    );
};

export default CustomModal;
