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
    <div className="bg-white rounded-sm shadow p-4">
        <div className="flex items-center gap-2 mb-2 pb-4 border-b">
            {icon}
            <h2 className="text-md font-semibold">{title}</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                    <tr>
                        {headers.map((header, idx) => (
                            <th key={idx} className={`text-${header.align} px-4 py-2 font-medium text-gray-600`}>
                                {header.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.length > 0 ? (
                        data.map((row, index) => <Fragment key={index}>{renderRow(row)}</Fragment>)
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="text-center py-4 text-gray-500">
                                {emptyPlaceholder}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        {children}
    </div>
);

export default DataTable;