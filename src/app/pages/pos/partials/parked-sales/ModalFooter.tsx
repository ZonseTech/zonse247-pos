import { FunctionComponent } from 'react';
import { Button } from '../../../../components';
import { ModalFooterProps } from './types';

const ModalFooter: FunctionComponent<ModalFooterProps> = ({ onClose }) => {
    return (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
                onClick={onClose}
                theme='danger'
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 py-2 px-6 rounded-lg font-medium"
            >
                Close
            </Button>
        </div>
    );
};

export default ModalFooter;
