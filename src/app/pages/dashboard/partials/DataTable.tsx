import React, { Fragment, PropsWithChildren } from 'react';

interface TableHeader {
    name: string;
    align: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
    title: string;
    headers: TableHeader[];
    data: T[];
    renderRow: (row: T) => React.ReactNode;
    icon?: React.ReactNode;
    emptyPlaceholder?: React.ReactNode;
}

const DataTable = <T,>({
    title,
    headers,
    data,
    renderRow,
    icon,
    children,
    emptyPlaceholder = 'No data available'
}: PropsWithChildren<DataTableProps<T>>) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            {icon && (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    {icon}
                </div>
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-white dark:bg-gray-700/50">
                    <tr>
                        {headers.map((header, idx) => (
                            <th
                                key={idx}
                                className={`
                                    px-6 py-3 
                                    text-xs font-medium 
                                    text-gray-500 dark:text-gray-400 
                                    uppercase tracking-wider
                                    bg-white dark:bg-gray-700/50
                                    ${header.align === 'left' ? 'text-left' :
                                        header.align === 'center' ? 'text-center' : 'text-right'}
                                `}
                            >
                                {header.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.length > 0 ? (
                        data.map((row, index) => (
                            <Fragment key={index}>
                                {renderRow(row)}
                            </Fragment>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={headers.length}
                                className="text-center py-12 text-gray-500 dark:text-gray-400"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V9a2 2 0 01-2 2H9a2 2 0 01-2-2V5" />
                                        </svg>
                                    </div>
                                    <div className="text-sm font-medium">{emptyPlaceholder}</div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {children && (
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/30">
                {children}
            </div>
        )}
    </div>
);

export default DataTable;