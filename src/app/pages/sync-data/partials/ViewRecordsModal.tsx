import { FunctionComponent, useState, useEffect } from 'react';
import {
    HiOutlineEye,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlineSearch,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineDocumentText
} from 'react-icons/hi';
import { syncService } from '../../../services/sync.service';

interface ViewRecordsModalProps {
    tableName: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const ViewRecordsModal: FunctionComponent<ViewRecordsModalProps> = ({
    tableName,
    isOpen,
    onClose
}) => {
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const pageSize = 20;

    useEffect(() => {
        if (isOpen && tableName) {
            fetchRecords();
        }
    }, [isOpen, tableName, page]);

    const fetchRecords = async () => {
        if (!tableName) return;

        setIsLoading(true);
        try {
            const response = await syncService.getAllRecords(tableName, page, pageSize);
            setRecords(response.records);
            setTotalPages(response.totalPages);
            setTotalCount(response.totalCount);
        } catch (error) {
            console.error('Error fetching records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getColumns = () => {
        if (records.length === 0) return [];
        return Object.keys(records[0]).slice(0, 6); // Show first 6 columns
    };

    const filteredRecords = searchTerm
        ? records.filter(record =>
            Object.values(record).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
        : records;

    if (!isOpen || !tableName) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-5xl transform rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transition-all max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                                <HiOutlineEye className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {tableName} Records
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {totalCount.toLocaleString()} total records
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchRecords}
                                disabled={isLoading}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <HiOutlineRefresh className={`w-5 h-5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <HiOutlineX className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <div className="relative">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <HiOutlineRefresh className="w-8 h-8 text-blue-500 animate-spin" />
                            </div>
                        ) : filteredRecords.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                                <HiOutlineDocumentText className="w-12 h-12 mb-3" />
                                <p>No records found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                            {getColumns().map((column) => (
                                                <th
                                                    key={column}
                                                    className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                                                >
                                                    {column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredRecords.map((record, index) => (
                                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                {getColumns().map((column) => (
                                                    <td
                                                        key={column}
                                                        className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate"
                                                    >
                                                        {typeof record[column] === 'object'
                                                            ? JSON.stringify(record[column])
                                                            : String(record[column] ?? '-')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer with Pagination */}
                    <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount.toLocaleString()} records
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <HiOutlineChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewRecordsModal;
