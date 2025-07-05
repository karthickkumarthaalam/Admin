import React, { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setuser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setuser(parsedUser);
        }
        setLoading(false);

    }, []);

    const logout = () => {
        setuser(null);
        sessionStorage.removeItem("user");
    };

    return <AuthContext.Provider value={{ user, setuser, logout, loading, setLoading }}>
        {children}
    </AuthContext.Provider>;
};


export const useAuth = () => useContext(AuthContext);