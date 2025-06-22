import { Notify, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import { UserStatus } from '../../utils/constants';
import UserFormModal from './partials/UserFormModal';
import usersService from '../../services/users.service';
import UserDetailsModal from './partials/UserDetailsModal';
import { Button, Input, ZonseThemeContext } from '../../components';
import DataTable, { TableColumn } from 'react-data-table-component';
import { HiOutlineMenuAlt4, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi';
import { Edit2, Trash2, Shield, Users, User2, Phone, Mail, Key, Clock } from 'lucide-react';
import { useState, useEffect, Fragment, useContext, FunctionComponent, ChangeEvent } from 'react';

const UserManagement: FunctionComponent = () => {
    const columns: Array<TableColumn<User>> = [
        {
            name: "User",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {row?.fullname}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">@{row?.username}</div>
                        </div>
                    </div>
                </Fragment>
            ),
        },
        {
            name: 'Contact',
            cell: (row) => (
                <Fragment>
                    <div>
                        {row?.email && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {row?.email}
                            </div>
                        )}
                        {row?.phone && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {row?.phone}
                            </div>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Role',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(row?.roleUuid)}`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {(row?.roleName || 'Unknown')}
                    </span>
                </Fragment>
            )
        },
        {
            name: 'Permissions',
            cell: (row) => (
                <Fragment>
                    <div className="flex flex-col space-y-1">
                        {row?.maxDiscountPercent > 0 && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded border dark:border-blue-800/50">
                                Max Discount: {row.maxDiscountPercent}%
                            </span>
                        )}
                        {row?.canOverridePrices && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded border dark:border-green-800/50">
                                Price Override
                            </span>
                        )}
                        {row?.forcePasswordChange && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded border dark:border-yellow-800/50">
                                Reset Password
                            </span>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Last Activity',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm">
                        {row?.lastLogin && (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="text-xs">
                                    {new Date(row.lastLogin).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {!row?.lastLogin && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">Never logged in</span>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row?.status as UserStatus)}`}>
                        {getStatusIcon(row?.status as UserStatus)}
                        {row?.status?.charAt(0)?.toUpperCase() + row?.status?.slice(1)}
                    </span>
                </Fragment>
            )
        },
        {
            width: "25%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500 dark:text-gray-400' />,
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <button
                            onClick={() => handleView(row)}
                            disabled={row?.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                            title="View details"
                        >
                            <User2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => handleEdit(row)}
                            disabled={row?.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                }`}
                            title="Edit user"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => handleResetPassword(row)}
                            disabled={row?.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                }`}
                            title="Reset password"
                        >
                            <Key className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => toggleUserStatus(row)}
                            disabled={row?.uuid === '-1'}
                            className={`text-xs px-2 py-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600 bg-gray-100 dark:bg-gray-800'
                                : row?.status === UserStatus.ACTIVE
                                    ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border dark:border-red-800/50'
                                    : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border dark:border-green-800/50'
                                }`}
                            title={getStatusActionTitle(row?.status as UserStatus)}
                        >
                            {getStatusActionText(row?.status as UserStatus)}
                        </button>

                        <button
                            onClick={() => handleDelete(row?.uuid, row?.username)}
                            disabled={row?.uuid === '-1'}
                            className={`p-1 rounded transition-colors ${row?.uuid === '-1'
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                }`}
                            title="Delete user"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </Fragment>
            )
        }
    ];

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [filteredUsers, setFilteredUsers] = useState<Array<User>>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, statusFilter, roleFilter, users]);

    const applyFilters = () => {
        let filtered = users;

        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => user.status === statusFilter);
        }

        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.roleUuid === roleFilter);
        }

        setFilteredUsers(filtered);
        setTotalRows(filtered.length);
        setPage(1);
    };

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data: Array<User> = await usersService.list();
            setUsers(data);
            setFilteredUsers(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading users:', error);
            Notify.failure('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const saveUsers = (updatedUsers: User[]) => {
        setUsers(updatedUsers);
        applyFilters();
    };

    const handleView = (user: User) => {
        setViewingUser(user);
        setShowDetails(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleResetPassword = async (user: User) => {
        Confirm.show(
            'Reset Password',
            `Are you sure you want to force a password reset for "${user.username}"? They will be required to change their password on next login.`,
            'Yes, Reset',
            'Cancel',
            async () => {
                try {
                    await usersService.update(user.uuid, {
                        forcePasswordChange: true,
                        password_changed_at: new Date()
                    });

                    const updatedUsers = users.map(u =>
                        u.uuid === user.uuid
                            ? { ...u, forcePasswordChange: true, password_changed_at: new Date() }
                            : u
                    );
                    saveUsers(updatedUsers);

                    Notify.success('Password reset flag set successfully');
                } catch (error) {
                    console.error('Error setting password reset:', error);
                    Notify.failure('Failed to set password reset');
                }
            },
            () => { },
            {
                titleColor: '#f59e0b',
                okButtonBackground: '#f59e0b',
            }
        );
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredUsers.slice(startIndex, endIndex);
    };

    const handlePageChange = (page: number) => {
        setPage(page);
    };

    const handlePerRowsChange = (newPerPage: number, page: number) => {
        setPage(page);
        setPerPage(newPerPage);
    };

    const handleDelete = async (userId: string, username: string) => {
        Confirm.show(
            'Delete User',
            `Are you sure you want to delete the user "${username}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await usersService.delete(userId);

                    const updatedUsers = users.filter(user => user.uuid !== userId);
                    saveUsers(updatedUsers);

                    Notify.success('User deleted successfully');
                } catch (error) {
                    console.error('Error deleting user:', error);
                    Notify.failure('Failed to delete user');
                }
            },
            () => { },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const toggleUserStatus = async (user: User) => {
        let newStatus: UserStatus;
        let action: string;

        switch (user.status) {
            case UserStatus.ACTIVE:
                newStatus = UserStatus.SUSPENDED;
                action = 'suspend';
                break;
            case UserStatus.SUSPENDED:
                newStatus = UserStatus.ACTIVE;
                action = 'activate';
                break;
            case UserStatus.INACTIVE:
                newStatus = UserStatus.ACTIVE;
                action = 'activate';
                break;
            default:
                newStatus = UserStatus.ACTIVE;
                action = 'activate';
        }

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            `Are you sure you want to ${action} the user "${user?.username}"?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                try {
                    await usersService.update(user.uuid, { status: newStatus });

                    const updatedUsers = users.map(u =>
                        u.uuid === user.uuid ? { ...u, status: newStatus } : u
                    );
                    saveUsers(updatedUsers);

                    Notify.success(`User ${action}d successfully`);
                } catch (error) {
                    console.error(`Error ${action}ing user:`, error);
                    Notify.failure(`Failed to ${action} user`);
                }
            },
            () => { },
            {
                titleColor: newStatus === UserStatus.SUSPENDED ? '#ef4444' : '#22c55e',
                okButtonBackground: newStatus === UserStatus.SUSPENDED ? '#ef4444' : '#22c55e',
            }
        );
    };

    const getRoleColor = (roleUuid: string) => {
        const roleMap: Record<string, string> = {
            'super_admin': 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border dark:border-purple-800/50',
            'admin': 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 border dark:border-purple-800/50',
            'manager': 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border dark:border-blue-800/50',
            'cashier': 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border dark:border-green-800/50',
        };
        return roleMap[roleUuid] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 border dark:border-gray-700/50';
    };

    const getStatusColor = (status?: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE:
                return 'text-green-800 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border dark:border-green-800/50';
            case UserStatus.SUSPENDED:
                return 'text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border dark:border-red-800/50';
            case UserStatus.INACTIVE:
                return 'text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/50 border dark:border-gray-700/50';
            default:
                return 'text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/50 border dark:border-gray-700/50';
        }
    };

    const getStatusIcon = (status?: UserStatus) => {
        const iconClass = "w-3 h-3 mr-1";
        switch (status) {
            case UserStatus.ACTIVE:
                return <div className={`${iconClass} bg-green-500 dark:bg-green-400 rounded-full shadow-sm`} />;
            case UserStatus.SUSPENDED:
                return <div className={`${iconClass} bg-red-500 dark:bg-red-400 rounded-full shadow-sm`} />;
            case UserStatus.INACTIVE:
                return <div className={`${iconClass} bg-gray-500 dark:bg-gray-400 rounded-full shadow-sm`} />;
            default:
                return <div className={`${iconClass} bg-gray-500 dark:bg-gray-400 rounded-full shadow-sm`} />;
        }
    };

    const getStatusActionText = (status?: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return 'Suspend';
            case UserStatus.SUSPENDED: return 'Activate';
            case UserStatus.INACTIVE: return 'Activate';
            default: return 'Activate';
        }
    };

    const getStatusActionTitle = (status?: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return 'Suspend user';
            case UserStatus.SUSPENDED: return 'Activate user';
            case UserStatus.INACTIVE: return 'Activate user';
            default: return 'Activate user';
        }
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleStatusFilter = (event: ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(event.target.value);
    };

    const handleRoleFilter = (event: ChangeEvent<HTMLSelectElement>) => {
        setRoleFilter(event.target.value);
    };

    const handleUserSaved = () => {
        loadUsers();
        setShowForm(false);
        setEditingUser(null);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setViewingUser(null);
    };

    const handleAddUserClicked = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const uniqueRoles = [...new Set(users.map(user => user.roleUuid))];

    return (
        <AppLayout>
            <div className="min-h-screen max-w-full mx-auto bg-white dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm dark:shadow-gray-900/20">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                        <div className="">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                                <Users className="w-6 h-6 mr-2 text-gray-700 dark:text-gray-300" />
                                Users ({filteredUsers.length} of {users.length})
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage workstation users, roles, and permissions
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex relative min-w-64">
                                <Input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="rounded-md px-3 py-2.5 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            <select
                                value={statusFilter}
                                onChange={handleStatusFilter}
                                className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value={UserStatus.ACTIVE}>Active</option>
                                <option value={UserStatus.INACTIVE}>Inactive</option>
                                <option value={UserStatus.SUSPENDED}>Suspended</option>
                            </select>

                            <select
                                value={roleFilter}
                                onChange={handleRoleFilter}
                                className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                            >
                                <option value="all">All Roles</option>
                                {uniqueRoles.map(role => (
                                    <option key={role} value={role}>
                                        {(role)}
                                    </option>
                                ))}
                            </select>

                            <Button
                                onClick={handleAddUserClicked}
                                className="flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white dark:text-gray-100 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <HiOutlinePlus className="w-4 h-4 mr-2" />
                                Add User
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto bg-white dark:bg-gray-800">
                        <DataTable
                            columns={columns}
                            data={getPaginatedData()}
                            theme={mode as string}
                            progressPending={isLoading}
                            highlightOnHover
                            striped
                            responsive
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            fixedHeader
                            fixedHeaderScrollHeight="calc(100vh - 350px)"
                            customStyles={{
                                table: {
                                    style: {
                                        backgroundColor: 'transparent',
                                    },
                                },
                                head: {
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(249 250 251)',
                                        color: mode === 'dark' ? 'rgb(243 244 246)' : 'rgb(55 65 81)',
                                        borderBottomColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                    },
                                },
                                headRow: {
                                    style: {
                                        borderBottomColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                        minHeight: '52px',
                                        backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(249 250 251)',
                                    },
                                },
                                rows: {
                                    style: {
                                        minHeight: '64px',
                                        backgroundColor: 'transparent',
                                        color: mode === 'dark' ? 'rgb(243 244 246)' : 'rgb(55 65 81)',
                                        borderBottomColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                        '&:hover': {
                                            backgroundColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(249 250 251)',
                                            cursor: 'pointer',
                                        },
                                    },
                                    stripedStyle: {
                                        backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(248 250 252)',
                                    },
                                },
                                cells: {
                                    style: {
                                        paddingLeft: '24px',
                                        paddingRight: '24px',
                                        paddingTop: '16px',
                                        paddingBottom: '16px',
                                    },
                                },
                                pagination: {
                                    style: {
                                        backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(249 250 251)',
                                        borderTopColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                        color: mode === 'dark' ? 'rgb(243 244 246)' : 'rgb(55 65 81)',
                                        fontSize: '14px',
                                        minHeight: '56px',
                                    },
                                    pageButtonsStyle: {
                                        borderRadius: '6px',
                                        height: '32px',
                                        width: '32px',
                                        padding: '4px',
                                        margin: '0 2px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        color: mode === 'dark' ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
                                        fill: mode === 'dark' ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
                                        backgroundColor: 'transparent',
                                        '&:hover:not(:disabled)': {
                                            backgroundColor: mode === 'dark' ? 'rgb(55 65 81)' : 'rgb(229 231 235)',
                                            color: mode === 'dark' ? 'rgb(243 244 246)' : 'rgb(17 24 39)',
                                        },
                                        '&:focus': {
                                            outline: 'none',
                                            boxShadow: mode === 'dark'
                                                ? '0 0 0 2px rgb(59 130 246)'
                                                : '0 0 0 2px rgb(37 99 235)',
                                        },
                                    },
                                },
                                progress: {
                                    style: {
                                        backgroundColor: mode === 'dark' ? 'rgb(31 41 55)' : 'rgb(255 255 255)',
                                    },
                                },
                            }}
                            noDataComponent={
                                <div className="text-center py-8 bg-white dark:bg-gray-800">
                                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                                            ? 'No users found matching your filters.'
                                            : 'No users found.'}
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                        {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                                            ? 'Try adjusting your search criteria or filters.'
                                            : 'Click "Add User" to create your first user.'}
                                    </p>
                                </div>
                            }
                        />
                    </div>
                </div>

                <UserFormModal
                    user={editingUser}
                    isOpen={showForm}
                    onClose={handleCloseForm}
                    onUserSaved={handleUserSaved}
                />

                <UserDetailsModal
                    user={viewingUser}
                    isOpen={showDetails}
                    onClose={handleCloseDetails}
                />
            </div>
        </AppLayout>
    );
};

export default UserManagement;