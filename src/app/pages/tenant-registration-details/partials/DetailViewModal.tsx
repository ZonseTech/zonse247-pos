import { FunctionComponent, useState } from 'react';
import { Building2, User, Mail, Key, Clock, CheckCircle, Hash, Shield, Copy, Check } from 'lucide-react';
import { Button, Modal } from '../../../components';

interface DetailViewModalProps {
    isOpen: boolean;
    detail: TenantRegistrationDetail | null;
    onClose: () => void;
    onMarkProcessed: (detailId: string) => void;
}

export const DetailViewModal: FunctionComponent<DetailViewModalProps> = ({
    isOpen,
    detail,
    onClose,
    onMarkProcessed
}) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    if (!detail) return null;

    const handleMarkProcessed = () => {
        onMarkProcessed(detail.detailId);
        onClose();
    };

    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registration Detail"
            size="lg"
        >
            <div className="max-h-[75vh] overflow-y-auto pr-2">
                <div className="space-y-4">
                        {/* Status Badge */}
                        <div className="flex justify-center">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${detail.isProcessed
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                {detail.isProcessed ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Processed
                                    </>
                                ) : (
                                    <>
                                        <Clock className="w-4 h-4 mr-2" />
                                        Pending
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Business Info */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                                <Building2 className="w-4 h-4 mr-2" />
                                Business Information
                            </h4>
                            <div className="space-y-2">
                                <InfoRow label="Business Name" value={detail.businessName} />
                                <InfoRow label="Tenant Code" value={detail.tenantCode} />
                                <InfoRow label="Tenant ID" value={detail.tenantId} />
                            </div>
                        </div>

                        {/* Owner Info */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                Owner Information
                            </h4>
                            <div className="space-y-2">
                                <InfoRow label="Owner Name" value={detail.ownerName} />
                                <InfoRow label="Email" value={detail.email} icon={<Mail className="w-3 h-3" />} />
                            </div>
                        </div>

                        {/* Credentials */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                                <Key className="w-4 h-4 mr-2" />
                                Login Credentials
                            </h4>
                            <div className="space-y-2">
                                <InfoRow label="Username" value={detail.username} />
                                <InfoRow label="Password" value="••••••••••••" />
                                <CopyableRow
                                    label="Verification Token"
                                    value={detail.verificationToken}
                                    displayValue={detail.verificationToken.substring(0, 20) + '...'}
                                    icon={<Shield className="w-3 h-3" />}
                                    onCopy={copyToClipboard}
                                    isCopied={copiedField === 'verificationToken'}
                                    fieldName="verificationToken"
                                />
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Timestamps
                            </h4>
                            <div className="space-y-2">
                                <InfoRow
                                    label="Created At"
                                    value={new Date(detail.createdAt).toLocaleString()}
                                />
                                <InfoRow
                                    label="Updated At"
                                    value={new Date(detail.updatedAt).toLocaleString()}
                                />
                                {detail.processedAt && (
                                    <InfoRow
                                        label="Processed At"
                                        value={new Date(detail.processedAt).toLocaleString()}
                                    />
                                )}
                            </div>
                        </div>

                        {/* IDs */}
                        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
                            <span className="flex items-center">
                                <Hash className="w-3 h-3 mr-1" />
                                ID: {detail.id}
                            </span>
                            <span>Detail ID: {detail.detailId}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-600 px-6 py-4 bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                <div className="flex items-center justify-end space-x-3">
                    <Button theme="neutral" onClick={onClose}>
                        Close
                    </Button>
                    {!detail.isProcessed && (
                        <Button theme="primary" onClick={handleMarkProcessed}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Processed
                        </Button>
                    )}
                </div>
            </div>
        </Modal >
    );
};

interface InfoRowProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

const InfoRow: FunctionComponent<InfoRowProps> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            {icon && <span className="mr-1">{icon}</span>}
            {label}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[200px] truncate">
            {value}
        </span>
    </div>
);

interface CopyableRowProps {
    label: string;
    value: string;
    displayValue?: string;
    icon?: React.ReactNode;
    onCopy: (text: string, fieldName: string) => void;
    isCopied: boolean;
    fieldName: string;
}

const CopyableRow: FunctionComponent<CopyableRowProps> = ({
    label,
    value,
    displayValue,
    icon,
    onCopy,
    isCopied,
    fieldName
}) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            {icon && <span className="mr-1">{icon}</span>}
            {label}
        </span>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right max-w-[160px] truncate">
                {displayValue || value}
            </span>
            <button
                onClick={() => onCopy(value, fieldName)}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={isCopied ? "Copied!" : "Copy to clipboard"}
            >
                {isCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                ) : (
                    <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
            </button>
        </div>
    </div>
);
