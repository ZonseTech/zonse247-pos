import { FunctionComponent } from 'react';
import ErrorAlert from '../partials/ErrorAlert';
import { Button } from '../../../../app/components';
import AuthLayout from '../../../layouts/AuthLayout';
import type { TerminalDetailsViewProps } from '../types';
import { CheckCircle2, Loader, Save } from 'lucide-react';

/**
 * Detail row component for terminal info display
 */
interface DetailRowProps {
    label: string;
    value: string;
    isLast?: boolean;
    mono?: boolean;
}

const DetailRow: FunctionComponent<DetailRowProps> = ({ label, value, isLast = false, mono = false }) => (
    <div className={`flex justify-between py-2 ${!isLast ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`text-sm ${mono ? 'font-mono text-gray-700 dark:text-gray-300' : 'font-medium text-gray-900 dark:text-gray-100'}`}>
            {value}
        </span>
    </div>
);

/**
 * Terminal details view - shows fetched terminal info with save button
 */
const TerminalDetailsView: FunctionComponent<TerminalDetailsViewProps> = ({
    terminal,
    error,
    loading,
    onSave,
    onBack,
}) => {
    return (
        <AuthLayout className="">
            <div className="space-y-6">
                <div className="text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Terminal Activated</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Review the details below and save to continue
                    </p>
                </div>

                {error && <ErrorAlert message={error} />}

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                    <div className="grid gap-3">
                        <DetailRow label="Terminal Name" value={terminal.terminalLabel} />
                        <DetailRow label="Terminal ID" value={terminal.terminalId} mono />
                        {terminal.branch && (
                            <DetailRow label="Branch" value={terminal.branch.branchName} />
                        )}
                        {terminal.tenant && (
                            <DetailRow label="Business" value={terminal.tenant.businessName} />
                        )}
                        {terminal.tenant?.country && (
                            <DetailRow label="Country" value={terminal.tenant.country} isLast />
                        )}
                    </div>
                </div>

                <Button
                    onClick={onSave}
                    disabled={loading}
                    block
                    className="py-3 px-4 disabled:bg-gray-300 text-white uppercase rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    {
                        loading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : "Save & Continue Setup"
                    }
                </Button>

                <Button
                    onClick={onBack}
                    disabled={loading}
                    layout='outline'
                    block
                    className='border-none transition-colors'
                >
                    ← Use different activation code
                </Button>
            </div>
        </AuthLayout>
    );
};

export default TerminalDetailsView;
