import { FunctionComponent, useEffect, useState } from 'react';
import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import { useForceResync } from '../../../../hooks/useForceResync';
import ConfirmStep from './ConfirmStep';
import ProgressStep from './ProgressStep';

interface ForceResyncModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForceResyncModal: FunctionComponent<ForceResyncModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { progress, isRunning, bridgeAvailable, lastRunAt, start, cancel } =
        useForceResync();
    const [mode, setMode] = useState<ForceResyncMode>('pull');

    // Reset selection on close
    useEffect(() => {
        if (!isOpen) setMode('pull');
    }, [isOpen]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            if (isRunning) return; // single-flight: cannot dismiss mid-run
            onClose();
        }
    };

    const showProgress = progress.status !== 'idle';
    const isSummary =
        progress.status === 'completed' || progress.status === 'failed';

    const title = showProgress
        ? isSummary
            ? 'Force Resync Summary'
            : 'Force Resync in Progress'
        : 'Force Data Resync';

    const description = showProgress
        ? 'Track per-table progress and outcomes for the in-flight force resync.'
        : 'Re-process every record in scope. Use only for troubleshooting or after a server outage.';

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Dialog.Content
                maxWidth={showProgress ? '640px' : '520px'}
                aria-describedby={undefined}
            >
                <Dialog.Title>{title}</Dialog.Title>
                <VisuallyHidden>
                    <Dialog.Description>{description}</Dialog.Description>
                </VisuallyHidden>

                {showProgress ? (
                    <ProgressStep
                        progress={progress}
                        isRunning={isRunning}
                        onCancel={cancel}
                        onClose={onClose}
                    />
                ) : (
                    <ConfirmStep
                        mode={mode}
                        bridgeAvailable={bridgeAvailable}
                        lastRunAt={lastRunAt}
                        onModeChange={setMode}
                        onConfirm={() => start({ mode })}
                        onCancel={onClose}
                    />
                )}
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default ForceResyncModal;
