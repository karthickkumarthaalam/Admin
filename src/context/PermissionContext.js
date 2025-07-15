import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const { user } = useAuth();
    const [permissions, setPermissions] = useState([]);
    const [email, setEmail] = useState("");
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);

    const fetchPermissions = async (email) => {
        if (email === "admin") {
            return [];
        }

        const storedPermissions = sessionStorage.getItem("permissions");
        return storedPermissions ? JSON.parse(storedPermissions) : [];
    };


    useEffect(() => {

        const loadPermissions = async () => {
            if (user) {
                const userPermissions = await fetchPermissions(user.email);
                setPermissions(userPermissions);
                setEmail(user.email);
                setPermissionsLoaded(true);
            } else {
                setPermissions([]);
                setEmail("");
                setPermissionsLoaded(false);
            }
        };

        loadPermissions();
    }, [user]);

    const hasPermission = (moduleName, accessType) => {
        if (!permissionsLoaded) return false;
        if (email === "admin") {
            return true;
        }
        const mod = permissions.find((p) => p.module_name === moduleName);
        return mod ? mod.access_type.includes(accessType) : false;
    };

    return (
        <PermissionContext.Provider value={{ permissions, hasPermission, permissionsLoaded }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => useContext(PermissionContext);