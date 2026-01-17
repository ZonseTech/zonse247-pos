import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
    const hasToken = sessionStorage.getItem('token');

    return hasToken ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;
