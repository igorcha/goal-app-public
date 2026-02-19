import { Navigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const auth = useAuth();

    if (auth.isLoading) {
        return <div>Loading Authentication Status...</div>;
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}