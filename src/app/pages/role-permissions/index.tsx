import { useState, useEffect } from 'react';
import { Notify, Confirm } from 'notiflix';
import { Plus } from 'lucide-react';
import { HiOutlineShieldCheck } from 'react-icons/hi2';
import { Flex, Spinner, Button } from '@radix-ui/themes';
import roleService from '../../services/role.service';
import permissionService from '../../services/permission.service';
import { RolesTable } from './partials/RolesTable';
import RoleModal from './partials/RoleModal';
import { SearchBar } from '../../components/SearchBar';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { getErrorMessage } from '../../utils/api-error-handler';

export default function RolesPage() {
  const [roles, setRoles] = useState<Array<Role>>([]);
  const [permissions, setPermissions] = useState<Array<Permission>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        roleService.list(),
        permissionService.list(),
      ]);
      setRoles(Array.isArray(rolesData.data) ? rolesData.data : []);
      setPermissions(Array.isArray(permissionsData.data) ? permissionsData.data : []);
    } catch (err) {
      console.error(err);
      Notify.failure('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (roleData) => {
    await roleService.create(roleData);
    await loadData();
    setShowRoleModal(false);
    setEditingRole(null);
  };

  const handleUpdateRole = async (roleData: Role) => {
    if (!editingRole) return;
    const result = await roleService.update(editingRole.roleId, roleData);
    await loadData();
    setShowRoleModal(false);
    setEditingRole(null);
    Notify.success(result.message);
  };

  const handleDeleteRole = (id: string) => {
    Confirm.show(
      'Delete Role',
      'Are you sure you want to delete this role? This action cannot be undone.',
      'Yes, Delete',
      'Cancel',
      async () => {
        try {
          await roleService.delete(id);
          await loadData();
        } catch (err) {
          Notify.failure(getErrorMessage(err, 'Failed to delete role'));
        }
      },
      () => { },
      {
        titleColor: '#ef4444',
        okButtonBackground: '#ef4444',
      }
    );
  };

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setShowRoleModal(true);
  };

  const filteredRoles = roles.filter(role =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <PageHeader
        title="Roles"
        description="Manage system roles and their assigned permissions"
        icon={<HiOutlineShieldCheck className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
        action={
          <Flex align="center" gap="3">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search roles..."
            />
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4" />
              Create Role
            </Button>
          </Flex>
        }
      />

      {loading ? (
        <Flex align="center" justify="center" py="9">
          <Spinner size="3" />
        </Flex>
      ) : (
        <>
          <RolesTable
            roles={filteredRoles}
            onCreateRole={handleOpenCreateModal}
            onEditRole={(role) => {
              setEditingRole(role);
              setShowRoleModal(true);
            }}
            onDeleteRole={handleDeleteRole}
          />
        </>
      )}

      <RoleModal
        isOpen={showRoleModal}
        role={editingRole ?? undefined}
        permissions={permissions}
        onSave={editingRole ? handleUpdateRole : handleCreateRole}
        onClose={() => {
          setShowRoleModal(false);
          setEditingRole(null);
        }}
      />
    </AppLayout>
  );
}
