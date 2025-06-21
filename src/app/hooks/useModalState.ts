import { useState } from 'react';

export const useModalState = () => {
    const [modalState, setModalState] = useState<ModalState>({
        showRoleModal: false,
        showPermissionModal: false,
        showAssignModal: false,
        editingRole: null,
        editingPermission: null,
        selectedRole: null,
    });

    const openRoleModal = (role?: Role): void => {
        setModalState(prev => ({
            ...prev,
            showRoleModal: true,
            editingRole: role || null,
        }));
    };

    const openPermissionModal = (permission?: Permission): void => {
        setModalState(prev => ({
            ...prev,
            showPermissionModal: true,
            editingPermission: permission || null,
        }));
    };

    const openAssignModal = (role: Role): void => {
        setModalState(prev => ({
            ...prev,
            showAssignModal: true,
            selectedRole: role,
        }));
    };

    const closeAllModals = (): void => {
        setModalState({
            showRoleModal: false,
            showPermissionModal: false,
            showAssignModal: false,
            editingRole: null,
            editingPermission: null,
            selectedRole: null,
        });
    };

    return {
        modalState,
        openRoleModal,
        openPermissionModal,
        openAssignModal,
        closeAllModals,
    };
};