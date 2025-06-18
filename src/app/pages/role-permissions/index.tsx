import React, { useState, useEffect, Fragment } from 'react';
import { Users, Shield, Settings, X } from 'lucide-react';
import roleService from '../../services/role.service';
import permissionService from '../../services/permission.service';
import { RolesTab } from './partials/tabs/RolesTab';
import { PermissionsTab } from './partials/tabs/PermissionsTab';
import { AssignmentsTab } from './partials/tabs/AssignmentsTab';
import { AssignPermissionsModal } from './partials/modals/AssignPermissionsModal';
import { PermissionModal } from './partials/modals/PermissionModal';
import { RoleModal } from './partials/modals/RoleModal';
import { SearchFilter } from './partials/SearchFilter';
import { LoadingSpinner } from './partials/LoadingSpinner';
import AppLayout from '../../layouts/AppLayout';

export default function RolePermissionAdmin() {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [scopes, setScopes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScope, setSelectedScope] = useState('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData, categoriesData, scopesData] = await Promise.all([
        roleService.list(),
        permissionService.list(),
        permissionService.getCategories(),
        permissionService.getScopes(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setCategories(categoriesData);
      setScopes(scopesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (roleData) => {
    try {
      await roleService.create(roleData);
      await loadData();
      setShowRoleModal(false);
      setEditingRole(null);
    } catch (err) {
      setError('Failed to create role');
    }
  };

  const handleUpdateRole = async (roleData) => {
    try {
      await roleService.update(editingRole.id, roleData);
      await loadData();
      setShowRoleModal(false);
      setEditingRole(null);
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.delete(id);
        await loadData();
      } catch (err) {
        setError('Failed to delete role');
      }
    }
  };

  const handleCreatePermission = async (permissionData) => {
    try {
      await permissionService.create(permissionData);
      await loadData();
      setShowPermissionModal(false);
      setEditingPermission(null);
    } catch (err) {
      setError('Failed to create permission');
    }
  };

  const handleUpdatePermission = async (permissionData) => {
    try {
      await permissionService.update(editingPermission.id, permissionData);
      await loadData();
      setShowPermissionModal(false);
      setEditingPermission(null);
    } catch (err) {
      setError('Failed to update permission');
    }
  };

  const handleDeletePermission = async (id) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await permissionService.delete(id);
        await loadData();
      } catch (err) {
        setError('Failed to delete permission');
      }
    }
  };

  const handleAssignPermissions = async (roleId, permissionIds) => {
    try {
      await roleService.assignPermissions(roleId, permissionIds);
      await loadData();
      setShowAssignModal(false);
      setSelectedRole(null);
    } catch (err) {
      setError('Failed to assign permissions');
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
    const matchesScope = selectedScope === 'all' || permission.scope === selectedScope;
    return matchesSearch && matchesCategory && matchesScope;
  });

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-6 max-w-full mx-auto bg-white dark:bg-gray-700">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Role & Permission Management</h1>
          <p className="mt-2 text-gray-600">Manage system roles and permissions</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <X className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'roles'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Roles
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'permissions'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Permissions
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'assignments'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Role Assignments
            </button>
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showCategoryFilter={false}
              showScopeFilter={false}
              selectedCategory={selectedCategory}
              selectedScope={selectedScope}
              categories={categories}
              scopes={scopes}
              onCategoryChange={setSelectedCategory}
              onScopeChange={setSelectedScope}
            />
          </nav>
        </div>

        {activeTab === 'roles' && (
          <RolesTab
            roles={filteredRoles}
            onCreateRole={() => setShowRoleModal(true)}
            onEditRole={(role) => {
              setEditingRole(role);
              setShowRoleModal(true);
            }}
            onDeleteRole={handleDeleteRole}
            onAssignPermissions={(role) => {
              setSelectedRole(role);
              setShowAssignModal(true);
            }}
          />
        )}

        {activeTab === 'permissions' && (
          <PermissionsTab
            permissions={filteredPermissions}
            onCreatePermission={() => setShowPermissionModal(true)}
            onEditPermission={(permission) => {
              setEditingPermission(permission);
              setShowPermissionModal(true);
            }}
            onDeletePermission={handleDeletePermission}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsTab
            roles={roles}
            permissions={permissions}
            onBulkAssign={handleAssignPermissions}
          />
        )}

        {showRoleModal && (
          <RoleModal
            role={editingRole}
            onSave={editingRole ? handleUpdateRole : handleCreateRole}
            onClose={() => {
              setShowRoleModal(false);
              setEditingRole(null);
            }}
          />
        )}

        {showPermissionModal && (
          <PermissionModal
            permission={editingPermission}
            categories={categories}
            scopes={scopes}
            onSave={editingPermission ? handleUpdatePermission : handleCreatePermission}
            onClose={() => {
              setShowPermissionModal(false);
              setEditingPermission(null);
            }}
          />
        )}

        {showAssignModal && selectedRole && (
          <AssignPermissionsModal
            role={selectedRole}
            permissions={permissions}
            onAssign={(permissionIds) => handleAssignPermissions(selectedRole.id, permissionIds)}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedRole(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
