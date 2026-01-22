import { Fragment } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Building2, Mail, User, Eye, Trash2, CheckCircle, Clock, Key } from 'lucide-react';

interface DetailActionsProps {
    detail: TenantRegistrationDetail;
    onView: (id: string) => void;
    onMarkProcessed: (id: string) => void;
    onDelete: (id: string, name: string) => void;
}

export const DetailActions: React.FC<DetailActionsProps> = ({
    detail,
    onView,
    onMarkProcessed,
    onDelete
}) => (
    <div className="flex items-center space-x-2">
        <button
            onClick={() => onView(detail.detailId)}
            className="p-1 rounded transition-colors text-sky-600 hover:text-sky-800"
            title="View details"
        >
            <Eye className="w-4 h-4" />
        </button>

        {!detail.isProcessed && (
            <button
                onClick={() => onMarkProcessed(detail.detailId)}
                className="text-xs px-2 py-1 rounded transition-colors text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100"
                title="Mark as processed"
            >
                <CheckCircle className="w-4 h-4" />
            </button>
        )}

        <button
            onClick={() => onDelete(detail.detailId, detail.businessName)}
            className="p-1 rounded transition-colors text-red-600 hover:text-red-800"
            title="Delete"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    </div>
);

export const getDetailColumns = (
    onView: (id: string) => void,
    onMarkProcessed: (id: string) => void,
    onDelete: (id: string, name: string) => void
): TableColumn<TenantRegistrationDetail>[] => [
        {
            name: "Business",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-sky-600" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {row?.businessName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Code: {row?.tenantCode}
                            </div>
                        </div>
                    </div>
                </Fragment>
            ),
            sortable: true,
            sortField: 'businessName',
        },
        {
            name: 'Owner & Contact',
            cell: (row) => (
                <Fragment>
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {row?.ownerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {row?.email}
                        </div>
                    </div>
                </Fragment>
            ),
            sortable: true,
            sortField: 'ownerName',
        },
        {
            name: 'Credentials',
            cell: (row) => (
                <Fragment>
                    <div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {row?.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Key className="w-3 h-3 mr-1" />
                            ••••••••
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <div className="flex flex-col">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row?.isProcessed
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                            {row?.isProcessed ? (
                                <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Processed
                                </>
                            ) : (
                                <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                </>
                            )}
                        </span>
                        {row?.isProcessed && row?.processedAt && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(row.processedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </Fragment>
            ),
            sortable: true,
            sortField: 'isProcessed',
        },
        {
            name: 'Created At',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                        {row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {row?.createdAt ? new Date(row.createdAt).toLocaleTimeString() : ''}
                    </div>
                </Fragment>
            ),
            sortable: true,
            sortField: 'createdAt',
        },
        {
            name: 'Actions',
            cell: (row) => (
                <DetailActions
                    detail={row}
                    onView={onView}
                    onMarkProcessed={onMarkProcessed}
                    onDelete={onDelete}
                />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];
