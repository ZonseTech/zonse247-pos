import React, { useState } from 'react';
import { BottomSheet, Button, Alert, Input, Label } from '../../../components';
import { HiOutlineShieldCheck, HiOutlineArrowPath } from 'react-icons/hi2';
import { mraComplianceService } from '../../../services';
import { useSettings } from '../../../hooks/useSettings';

interface MraSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MraSettingsModal: React.FC<MraSettingsModalProps> = ({ isOpen, onClose }) => {
    const [tac, setTac] = useState('');
    const [activating, setActivating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const { getActiveBranch } = useSettings();

    const handleActivateTerminal = async () => {
        if (!tac.trim()) {
            setError('Please enter the Terminal Activation Code (TAC)');
            return;
        }

        setActivating(true);
        setError(null);
        setSuccess(null);

        try {
            const mraEnvironment = import.meta.env.VITE_MRA_ENVIRONMENT || 'SANDBOX';
            const activeBranch = await getActiveBranch();

            if (!activeBranch?.terminalId) {
                setError('No active terminal found. Please ensure you are properly logged in.');
                setActivating(false);
                return;
            }

            const terminalId = activeBranch.terminalId;

            const enableResponse = await mraComplianceService.enableCompliance(
                mraEnvironment,
                tac.trim(),
                terminalId
            );

            if (enableResponse.success) {
                setSuccess('Terminal activated successfully!');
                setTac('');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(enableResponse.message || 'Failed to enable MRA compliance and activate terminal');
            }
        } catch (err: any) {
            console.error('Terminal activation error:', err);
            if (err?.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to activate terminal. Please check your TAC and try again.');
            }
        } finally {
            setActivating(false);
        }
    };

    const handleClose = () => {
        setTac('');
        setError(null);
        setSuccess(null);
        onClose();
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={handleClose}
            title="MRA Terminal Activation"
        >
            <div className="space-y-6">
                {error && (
                    <Alert type="danger" className="mb-4">
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert type="success" className="mb-4">
                        {success}
                    </Alert>
                )}

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enter the Terminal Activation Code (TAC) provided by MRA to activate
                        this terminal for electronic invoicing.
                    </p>

                    <div className="mb-4">
                        <Label htmlFor="tac">Terminal Activation Code (TAC)</Label>
                        <Input
                            id="tac"
                            type="text"
                            value={tac}
                            onChange={(e) => setTac(e.target.value)}
                            placeholder="Enter your TAC"
                            className="font-mono"
                            disabled={activating}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            TAC format: 8-50 alphanumeric characters with optional dashes
                        </p>
                    </div>

                    <Button
                        type="button"
                        theme="success"
                        onClick={handleActivateTerminal}
                        disabled={activating || !tac.trim()}
                        className="w-full"
                    >
                        {activating ? (
                            <>
                                <HiOutlineArrowPath className="w-4 h-4 mr-2 animate-spin" />
                                Activating...
                            </>
                        ) : (
                            <>
                                <HiOutlineShieldCheck className="w-4 h-4 mr-2" />
                                Activate Terminal
                            </>
                        )}
                    </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        About MRA Compliance
                    </h4>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                        <li>MRA compliance ensures all sales are submitted to Malawi Revenue Authority</li>
                        <li>You need a TAC from MRA to activate your terminal</li>
                        <li>Once activated, receipts will include MRA fiscal codes</li>
                    </ul>
                </div>
            </div>
        </BottomSheet>
    );
};

export default MraSettingsModal;
