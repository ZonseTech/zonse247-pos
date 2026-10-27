declare module 'better-sqlite3' {
    interface DatabaseOptions {
        readonly?: boolean;
        fileMustExist?: boolean;
        timeout?: number;
    }

    interface BackupProgress {
        totalPages: number;
        remainingPages: number;
    }

    interface Database {
        backup(destination: string, options?: { progress?: (info: BackupProgress) => number | void }): Promise<BackupProgress>;
        close(): void;
    }

    const Database: new (filename: string, options?: DatabaseOptions) => Database;
    export default Database;
}
