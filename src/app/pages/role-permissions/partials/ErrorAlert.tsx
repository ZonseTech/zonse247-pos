import React from 'react';
import { X } from 'lucide-react';

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
                <X className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
                <button
                    onClick={onClose}
                    className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};