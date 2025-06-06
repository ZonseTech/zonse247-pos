import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
    const isAuthenticated = sessionStorage.getItem('token');

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
