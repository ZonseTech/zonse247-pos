import AppLayout from '../../layouts/AppLayout';
import { HiOutlineMenuAlt4, HiOutlineSearch, HiOutlinePlus } from 'react-icons/hi';
import usersService from '../../services/users.service';
import { Button, Input, ZonseThemeContext } from '../../components';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Edit2, Trash2, Shield, Users, User2, Phone, Mail, MapPin, Key, Clock } from 'lucide-react';
import { useState, useEffect, Fragment, useContext, FunctionComponent, ChangeEvent } from 'react';
import UserFormModal from './partials/UserFormModal';
import UserDetailsModal from './partials/UserDetailsModal';
import { Notify, Confirm } from 'notiflix';
import { UserStatus } from '../../utils/constants';

const UserManagement: FunctionComponent = () => {
    const columns: Array<TableColumn<User>> = [
        {
            name: "User",
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User2 className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {row?.fullname}
                            </div>
                            <div className="text-sm text-gray-500">@{row?.username}</div>
                            {row?.email && (
                                <div className="text-xs text-gray-400 flex items-center mt-1">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {row?.email}
                                </div>
                            )}
                            {row?.phone && (
                                <div className="text-xs text-gray-400 flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {row?.phone}
                                </div>
                            )}
                        </div>
                    </div>
                </Fragment>
            ),
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
            name: 'Permissions',
            cell: (row) => (
                <Fragment>
                    <div className="flex flex-col space-y-1">
                        {row?.maxDiscountPercent && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Max Discount: {row.maxDiscountPercent}%
                            </span>
                        )}
                        {row?.canOverridePrices && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Price Override
                            </span>
                        )}
                        {row?.forcePasswordChange && (
                            <span className="text-xs bg-green-100 text-yellow-800 px-2 py-1 rounded">
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
                            <div className="flex items-center text-green-600">
                                <Clock className="w-3 h-3 mr-1" />
                                <span className="text-xs">
                                    {new Date(row.lastLogin).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {!row?.lastLogin && (
                            <span className="text-xs text-gray-400">Never logged in</span>
                        )}
                    </div>
                </Fragment>
            )
        },
        {
            width: "25%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => (
                <Fragment>
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <button
                            onClick={() => handleView(row)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                            title="View details"
                        >
                            <User2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleEdit(row)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                            title="Edit user"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleResetPassword(row)}
                            className="text-orange-600 hover:text-orange-800 p-1 rounded transition-colors"
                            title="Reset password"
                        >
                            <Key className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => toggleUserStatus(row)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${row?.status === UserStatus.ACTIVE
                                ? 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100'
                                : row?.status === UserStatus.SUSPENDED
                                    ? 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100'
                                    : 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100'
                                }`}
                            title={getStatusActionTitle(row?.status as UserStatus)}
                        >
                            {getStatusActionText(row?.status as UserStatus)}
                        </button>
                        <button
                            onClick={() => handleDelete(row?.uuid, row?.username)}
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
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
            'super_admin': 'text-purple-600 bg-purple-100',
            'admin': 'text-purple-600 bg-purple-100',
            'manager': 'text-blue-600 bg-blue-100',
            'cashier': 'text-green-600 bg-green-100',
        };
        return roleMap[roleUuid] || 'text-gray-600 bg-gray-100';
    };

    const getStatusColor = (status?: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return 'text-green-800 bg-green-100';
            case UserStatus.SUSPENDED: return 'text-red-800 bg-red-100';
            case UserStatus.INACTIVE: return 'text-gray-800 dark:text-gray-400 bg-gray-100';
            default: return 'text-gray-800 dark:text-gray-400 bg-gray-100';
        }
    };

    const getStatusIcon = (status?: UserStatus) => {
        const iconClass = "w-3 h-3 mr-1";
        switch (status) {
            case UserStatus.ACTIVE: return <div className={`${iconClass} bg-green-500 rounded-full`} />;
            case UserStatus.SUSPENDED: return <div className={`${iconClass} bg-red-500 rounded-full`} />;
            case UserStatus.INACTIVE: return <div className={`${iconClass} bg-gray-500 rounded-full`} />;
            default: return <div className={`${iconClass} bg-gray-500 rounded-full`} />;
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
            <div className="min-h-screen p-6 max-w-full mx-auto bg-white dark:bg-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-400 flex items-center">
                            <Users className="w-6 h-6 mr-2" />
                            User Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage workstation users, roles, and permissions
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handleAddUserClicked}
                            className="flex items-center px-4 py-2 bg-green-600 text-white dark:text-gray-100 rounded-lg hover:bg-green-700"
                        >
                            <HiOutlinePlus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-md border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-400">
                                Users ({filteredUsers.length} of {users.length})
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex relative min-w-64">
                                <Input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="rounded-md px-3 py-2.5 pr-10"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <HiOutlineSearch className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            <select
                                value={statusFilter}
                                onChange={handleStatusFilter}
                                className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value={UserStatus.ACTIVE}>Active</option>
                                <option value={UserStatus.INACTIVE}>Inactive</option>
                                <option value={UserStatus.SUSPENDED}>Suspended</option>
                            </select>

                            <select
                                value={roleFilter}
                                onChange={handleRoleFilter}
                                className="px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Roles</option>
                                {uniqueRoles.map(role => (
                                    <option key={role} value={role}>
                                        {(role)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
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
                            noDataComponent={
                                <div className="text-center py-8">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                                            ? 'No users found matching your filters.'
                                            : 'No users found.'}
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