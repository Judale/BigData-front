import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

type PrivateRouteProps = {
    children: ReactNode;
};

export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { token } = useAuth();
    const location = useLocation();

    return token
        ? <>{children}</>
        : <Navigate to="/login" replace state={{ from: location }}/>;
}
