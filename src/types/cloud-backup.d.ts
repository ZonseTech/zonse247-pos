// ==========================================
// CLOUD DATABASE BACKUP
// ==========================================

type CloudBackupPhase = 'preparing' | 'compressing' | 'uploading' | 'finalizing';

interface CloudBackupProgress {
    phase: CloudBackupPhase;
    percent: number;
}

interface CloudBackupInfo {
    fileName: string;
    terminalId: string;
    branchId: string;
    size: number;
    createdAt: string;
}
