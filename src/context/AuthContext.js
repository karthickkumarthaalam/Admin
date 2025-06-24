import React, { createContext, useEffect, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setuser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            const loginTime = parsedUser.loginTime;
            const currentTime = new Date().getTime();

            if (currentTime - loginTime > 60 * 60 * 1000) {
                logout();
            } else {
                setuser(parsedUser);
            }

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