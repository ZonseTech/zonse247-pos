import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { HiOutlineCloudArrowUp } from 'react-icons/hi2';
import { Button, FormFieldCard } from '../../../components';
import { formatFileSize } from '../../../utils';
import { isElectron } from '../../../../helpers/index.helper';

const PHASE_LABELS: Record<CloudBackupPhase, string> = {
    preparing: 'Preparing data',
    compressing: 'Compressing',
    uploading: 'Uploading to server',
    finalizing: 'Finishing up',
};

const CloudBackupCard: React.FC = () => {
    const [latest, setLatest] = useState<CloudBackupInfo | null>(null);
    const [isLoadingLatest, setIsLoadingLatest] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState<CloudBackupProgress | null>(null);

    const loadLatest = useCallback(async () => {
        setIsLoadingLatest(true);
        try {
            const result = await window.electronAPI.backup.getLatest();
            setLatest(result.success ? result.data ?? null : null);
        } finally {
            setIsLoadingLatest(false);
        }
    }, []);

    useEffect(() => {
        if (!isElectron()) return;
        loadLatest();
        return window.electronAPI.backup.onProgress(setProgress);
    }, [loadLatest]);

    const handleBackup = async () => {
        setIsUploading(true);
        setProgress({ phase: 'preparing', percent: 0 });
        try {
            const result = await window.electronAPI.backup.uploadToCloud();
            if (result.success && result.data) {
                setLatest(result.data);
                toast.success('Backup sent to the server successfully.');
            } else {
                toast.error(result.error || 'Backup failed. Please try again.');
            }
        } finally {
            setIsUploading(false);
            setProgress(null);
        }
    };

    if (!isElectron()) return null;

    return (
        <FormFieldCard>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Back up to server</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sends a copy of this terminal's data to Zonse247 servers. You can keep selling while it runs.
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        {isLoadingLatest
                            ? 'Checking last backup...'
                            : latest
                                ? `Last backup: ${dayjs(latest.createdAt).format('DD MMM YYYY, HH:mm')} (${formatFileSize(latest.size)})`
                                : 'No backup on the server yet.'}
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={handleBackup}
                    loading={isUploading}
                    iconLeft={HiOutlineCloudArrowUp}
                >
                    {isUploading ? 'Backing up...' : 'Back up now'}
                </Button>
            </div>

            {isUploading && progress && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                        <span>{PHASE_LABELS[progress.phase]}</span>
                        <span>{progress.percent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-2 rounded-full bg-sky-500 transition-all"
                            style={{ width: `${progress.percent}%` }}
                        />
                    </div>
                </div>
            )}
        </FormFieldCard>
    );
};

export default CloudBackupCard;
