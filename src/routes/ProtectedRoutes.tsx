import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = {
    children: JSX.Element;
    redirectPath?: string;
    checkAuthAsync?: () => Promise<boolean>;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    redirectPath = '/home',
    checkAuthAsync,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const syncAuthCheck = () => {
            const authToken = localStorage.getItem('user');
            setIsAuthenticated(!!authToken);
        };

        if (!checkAuthAsync) {
            syncAuthCheck();
        }
    }, [checkAuthAsync]);

    useEffect(() => {
        if (checkAuthAsync) {
            const asyncAuthCheck = async () => {
                try {
                    const authenticated = await checkAuthAsync();
                    setIsAuthenticated(authenticated);
                } catch (error) {
                    setIsAuthenticated(false);
                }
            };
            asyncAuthCheck();
        }
    }, [checkAuthAsync]);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;