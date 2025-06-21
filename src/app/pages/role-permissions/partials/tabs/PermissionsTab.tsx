import React, { useState, useEffect, useContext, Fragment, ChangeEvent } from 'react';
import { Shield, Edit2, Trash2, Plus } from 'lucide-react';
import { HiOutlineMenuAlt4, HiOutlineSearch } from 'react-icons/hi';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Input, ZonseThemeContext } from '../../../../components';

export const PermissionsTab: React.FC<PermissionTabProps> = ({ permissions }) => {
    const { mode } = useContext(ZonseThemeContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPermissions, setFilteredPermissions] = useState<Array<Permission>>([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);

    const columns: Array<TableColumn<Permission>> = [
        {
            name: "Permission",
            cell: (row) => (
                <Fragment>
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {row.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {row.description || '-'}
                        </div>
                    </div>
                </Fragment>
            ),
            sortable: true,
        },
        {
            name: 'Display Name',
            selector: (row) => row.displayName,
            cell: (row) => (
                <Fragment>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                        {row.displayName}
                    </div>
                </Fragment>
            ),
            sortable: true,
        },
        {
            name: 'Category',
            selector: (row) => row.category,
            cell: (row) => (
                <Fragment>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {row.category}
                    </span>
                </Fragment>
            ),
            sortable: true,
        },
        {
            name: 'Scope',
            cell: (row) => (
                <Fragment>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        {(row.scope as string) || 'N/A'}
                    </span>
                </Fragment>
            ),
            sortable: true,
        },
        {
            name: 'Type',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.isSystemPermission
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800 dark:text-gray-400'
                        }`}>
                        {row.isSystemPermission ? 'System' : 'Custom'}
                    </span>
                </Fragment>
            ),
            sortable: true,
        },
    ];

    useEffect(() => {
        setFilteredPermissions(permissions);
        setTotalRows(permissions.length);
    }, [permissions]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredPermissions(permissions);
        } else {
            const filtered = permissions.filter(permission =>
                permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                permission.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                permission.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (permission.scope && permission.scope.toString().toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredPermissions(filtered);
        }
        setTotalRows(filteredPermissions.length);
        setPage(1);
    }, [searchTerm, permissions]);

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredPermissions.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div>
            <div className="bg-white dark:bg-gray-700 rounded-md border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            All Permissions {filteredPermissions.length}
                        </h3>

                        <div className="flex relative">
                            <Input
                                type="text"
                                placeholder="Search permissions..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="rounded-md px-3 py-2.5 pr-10"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={getPaginatedData()}
                    theme={mode as string}
                    highlightOnHover
                    striped
                    responsive
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 400px)"
                    noDataComponent={
                        <div className="text-center py-8">
                            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ? 'No permissions found matching your search.' : 'No permissions found.'}
                            </p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};