import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { hasAnyPermission, hasPermission } from '../utils';
import { EnhancedPageLoader } from '../components/loader/EnhancedPageLoader';

const PermissionRoute: FC<{ children: ReactNode; permission?: string; anyOf?: string[] }> = ({ children, permission, anyOf }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <EnhancedPageLoader />;
    }

    const allowed = permission
        ? hasPermission(user, permission)
        : anyOf
            ? hasAnyPermission(user, anyOf)
            : true;

    return allowed ? children : <Navigate to="/forbidden" replace />;
};

export default PermissionRoute;
