import { type ReactNode, useEffect, useState } from 'react';
import Modal from 'react-modal';
import classNames from 'classnames';

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    header?: ReactNode
    showCloseButton?: boolean;
    shouldCloseOnOverlayClick?: boolean;
    className?: string;
    overlayClassName?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
    isOpen,
    onClose,
    title = 'Modal Title',
    children,
    showCloseButton = true,
    shouldCloseOnOverlayClick = true,
    className = '',
    overlayClassName = '',
    header = ''
}) => {
    const [visible, setVisible] = useState(isOpen);
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            setClosing(false);
        } else if (visible) {
            setClosing(true);
            setTimeout(() => {
                setVisible(false);
                setClosing(false);
            }, 300);
        }
    }, [isOpen]);

    if (!visible) return null;

    const modalClass = classNames(
        'w-full bg-white dark:bg-gray-700 text-gray-700 rounded-sm shadow-2xl p-6 transition-all transform duration-300',
        {
            'animate-slide-down-fade-in': !closing,
            'animate-slide-up-fade-out': closing,
        },
        className
    );

    const modalOverlayClass = classNames(
        'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50',
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
            {header ? header : <div className="flex justify-between items-center mb-4">
                {title && <h2 className="text-xl font-bold text-gray-800 dark:text-gray-400">{title}</h2>}
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                )}
            </div>}

            <div>{children}</div>
        </Modal>
    );
};

export default CustomModal;
