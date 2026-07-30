import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { hasAnyPermission, hasPermission } from '../utils';

const PermissionRoute: FC<{ children: ReactNode; permission?: string; anyOf?: string[] }> = ({ children, permission, anyOf }) => {
    const { user } = useAuth();

    const allowed = permission
        ? hasPermission(user, permission)
        : anyOf
            ? hasAnyPermission(user, anyOf)
            : true;

    return allowed ? children : <Navigate to="/not-found" replace />;
};

export default PermissionRoute;
