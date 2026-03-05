import { FunctionComponent } from 'react';
import { Database } from 'lucide-react';
import type { SyncedDataPreviewProps } from '../types';

/**
 * Synced data preview component - shows success state after sync
 */
const SyncedDataPreview: FunctionComponent<SyncedDataPreviewProps> = ({ data }) => {
    if (!data) return null;

    const dataCount = Array.isArray(data)
        ? data.length
        : typeof data === 'object'
            ? Object.keys(data as object).length
            : 0;

    return (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Database className="w-5 h-5" />
                <span className="font-medium">Data Synced Successfully</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{dataCount} record(s) synchronized</p>
            </div>
            {Array.isArray(data) && data.length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                    <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        {data.slice(0, 5).map((item: Record<string, unknown>, idx: number) => (
                            <li key={idx} className="truncate">
                                • {String(item.name || item.title || item.code || JSON.stringify(item).slice(0, 50))}
                            </li>
                        ))}
                        {data.length > 5 && (
                            <li className="text-gray-400 dark:text-gray-500">... and {data.length - 5} more</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SyncedDataPreview;
