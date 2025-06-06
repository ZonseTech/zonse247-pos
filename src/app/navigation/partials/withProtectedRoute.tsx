import ProtectedRoute from '../ProtectedRoute';

const withProtectedRoute = (Component: React.ComponentType) => {
    return () => (
        <ProtectedRoute>
            <Component />
        </ProtectedRoute>
    );
};

export default withProtectedRoute