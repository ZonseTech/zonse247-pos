import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
    const hasToken = sessionStorage.getItem('token');

    return hasToken ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
