import AppLayout from '../../layouts/AppLayout';
import { HiOutlineMenuAlt4, HiOutlineSearch } from 'react-icons/hi';
import usersService from '../../services/users.service';
import { Button, Input, ZonseThemeContext } from '../../components';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Edit2, Trash2, Shield, Users, User2 } from 'lucide-react';
import { useState, useEffect, Fragment, useContext, FunctionComponent, ChangeEvent } from 'react';
import UserFormModal from './partials/UserFormModal';
import { Notify, Confirm } from 'notiflix';
import { HiOutlinePlus } from 'react-icons/hi2';

interface WorkstationUser extends User {
    id: string;
    username: string;
    email?: string;
    role: 'admin' | 'cashier' | 'manager';
    permissions: string[];
    isActive: boolean;
    status?: string;
}

const UserManagement: FunctionComponent = () => {
    const columns: Array<TableColumn<WorkstationUser>> = [
        {
            name: "User",
            cell: (row) => (<Fragment>
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User2 className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                            {row?.fullname || row?.username}
                        </div>
                        {row?.email && (
                            <div className="text-sm text-gray-500">{row?.email}</div>
                        )}
                    </div>
                </div>
            </Fragment>),
        },
        {
            name: 'Role',
            cell: (row) => (<Fragment>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(row?.role)}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {row?.role?.charAt(0)?.toUpperCase() + row?.role?.slice(1)}
                </span>
            </Fragment>)
        },
        {
            name: 'Status',
            cell: (row) => (<Fragment>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row?.isActive ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                    }`}>
                    {row?.isActive ? 'Active' : 'Inactive'}
                </span>
            </Fragment>)
        },
        {
            width: "20%",
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => (<Fragment>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Edit user"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => toggleUserStatus(row?.uuid, row?.isActive)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${row?.isActive
                            ? 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100'
                            : 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100'
                            }`}
                        title={row?.isActive ? 'Deactivate user' : 'Activate user'}
                    >
                        {row?.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                        onClick={() => handleDelete(row?.uuid, row?.username)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Delete user"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </Fragment>)
        }
    ]

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const { mode } = useContext(ZonseThemeContext);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<WorkstationUser[]>([]);
    const [editingUser, setEditingUser] = useState<WorkstationUser | null>(null);
    const [filteredUsers, setFilteredUsers] = useState<Array<WorkstationUser>>([]);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
        setTotalRows(filteredUsers.length);
        setPage(1);
    }, [searchTerm, users]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data: Array<any> = await usersService.list();

            const transformedUsers = data.map(user => ({
                ...user,
                isActive: user.status === 'active' || user.isActive === true,
                uuid: user.uuid || user.uuid
            }));

            setUsers(transformedUsers);
            setFilteredUsers(transformedUsers);
            setTotalRows(transformedUsers.length);
        } catch (error) {
            console.error('Error loading users:', error);
            Notify.failure('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const saveUsers = (updatedUsers: WorkstationUser[]) => {
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setTotalRows(updatedUsers.length);
    };

    const handleEdit = (user: WorkstationUser) => {
        setEditingUser(user);
        setShowForm(true);
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
            () => {
                // do nothing
            },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        const user = users.find(u => u.uuid === userId);

        Confirm.show(
            `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            `Are you sure you want to ${action} the user "${user?.username}"?`,
            `Yes, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            'Cancel',
            async () => {
                try {
                    const updatedUserData = {
                        ...user,
                        isActive: !currentStatus,
                        status: !currentStatus ? 'active' : 'inactive'
                    };

                    await usersService.update(userId, updatedUserData);

                    const updatedUsers = users.map(user =>
                        user.uuid === userId
                            ? { ...user, isActive: !currentStatus, status: !currentStatus ? 'active' : 'inactive' }
                            : user
                    );
                    saveUsers(updatedUsers);

                    Notify.success(`User ${action}d successfully`);
                } catch (error) {
                    console.error(`Error ${action}ing user:`, error);
                    Notify.failure(`Failed to ${action} user`);
                }
            },
            () => {
                // do nothing
            },
            {
                titleColor: currentStatus ? '#ef4444' : '#22c55e',
                okButtonBackground: currentStatus ? '#ef4444' : '#22c55e',
            }
        );
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-purple-600 bg-purple-100';
            case 'manager': return 'text-blue-600 bg-blue-100';
            case 'cashier': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
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

    const handleAddUserClicked = () => {
        setShowForm(!showForm);
    };

    return (
        <AppLayout>
            <div className="p-6 max-w-6xl mx-auto bg-white">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <Users className="w-6 h-6 mr-2" />
                            User Management
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage workstation users and sync to cloud
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button
                            onClick={handleAddUserClicked}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <HiOutlinePlus className="w-4 h-4 mr-2" />
                            {'Add User'}
                        </Button>

                        <UserFormModal
                            user={editingUser ? {
                                uuid: editingUser.uuid || '',
                                fullname: editingUser.fullname || editingUser.username,
                                username: editingUser.username,
                                password: '',
                                status: editingUser.isActive ? 'active' : 'inactive',
                                role: editingUser.role,
                                permissions: editingUser.permissions || []
                            } : undefined}
                            isOpen={showForm}
                            onClose={handleCloseForm}
                            onUserSaved={handleUserSaved}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-md border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Workstation Users ({filteredUsers.length})
                            </h2>

                            <div className="flex relative">
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
                                        {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                                    </p>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default UserManagement;