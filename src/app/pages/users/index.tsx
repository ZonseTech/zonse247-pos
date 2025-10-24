import UsersTable from './partials/UsersTable';
import AppLayout from '../../layouts/AppLayout';
import { useUsers } from '../../hooks/useUsers';
import UserFilters from './partials/UserFilters';
import UserFormModal from './partials/UserFormModal';
import UserDetailsModal from './partials/UserDetailsModal';
import { useUserActions } from '../../hooks/useUserActions';
import { useState, ChangeEvent, FunctionComponent } from 'react';

const UserManagement: FunctionComponent = () => {
    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const {
        users,
        isLoading,
        totalRows,
        page,
        perPage,
        searchTerm,
        statusFilter,
        roleFilter,
        setSearchTerm,
        setStatusFilter,
        setRoleFilter,
        getPaginatedData,
        handlePageChange,
        handlePerRowsChange,
        loadUsers,
        saveUsers,
        getFilteredUsers
    } = useUsers();

    const { handleDelete, handleResetPassword, toggleUserStatus } = useUserActions(saveUsers, users);

    const handleView = (user: User) => {
        setViewingUser(user);
        setShowDetails(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowForm(true);
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

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleStatusFilter = (event: ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(event.target.value);
    };

    const handleRoleFilter = (event: ChangeEvent<HTMLSelectElement>) => {
        setRoleFilter(event.target.value);
    };

    const uniqueRoles = [...new Set(users.map(user => user.roleUuid))];

    return (
        <AppLayout>
            <div className="">
                <div className="overflow-hidden shadow-sm dark:shadow-gray-900/20">
                    <UserFilters
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        roleFilter={roleFilter}
                        uniqueRoles={uniqueRoles}
                        totalUsers={users.length}
                        filteredCount={getFilteredUsers().length}
                        onSearchChange={handleSearch}
                        onStatusFilterChange={handleStatusFilter}
                        onRoleFilterChange={handleRoleFilter}
                        onAddUser={handleAddUserClicked}
                    />

                    <div className="overflow-x-auto bg-white dark:bg-gray-800">
                        <UsersTable
                            data={getPaginatedData()}
                            isLoading={isLoading}
                            totalRows={totalRows}
                            page={page}
                            perPage={perPage}
                            onPageChange={handlePageChange}
                            onPerRowsChange={handlePerRowsChange}
                            onView={handleView}
                            onEdit={handleEdit}
                            onResetPassword={handleResetPassword}
                            onToggleStatus={toggleUserStatus}
                            onDelete={handleDelete}
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