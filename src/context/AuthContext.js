import React, { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setuser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setuser(JSON.parse(storedUser));
        }
        setLoading(false);

    }, []);

    const logout = () => {
        setuser(null);
        localStorage.removeItem("user");
    };

    return <AuthContext.Provider value={{ user, setuser, logout, loading, setLoading }}>
        {children}
    </AuthContext.Provider>;
};


export const useAuth = () => useContext(AuthContext);