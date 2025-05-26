import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type AuthContextType = {
    token: string | null;
    login: (t: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    const login = (t: string) => {
        localStorage.setItem('token', t);
        setToken(t);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('Auth context missing');
    return context;
};
