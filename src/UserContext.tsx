import React, {createContext, useContext, useState, useEffect} from "react";

export type User = {
    id: string;
    name: string;
    email: string;
    settings?: Record<string, any>;
};

export type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    updateUser: (fields: Partial<User>) => void;
    logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const DUMMY_USER = {
    id: "1",
    name: "Admin",
    email: "admin@gmail.com",
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [user, setUserState] = useState<User | null>(null);

    // On mount, check sessionStorage for token
    useEffect(() => {
        const token = sessionStorage.getItem("admin-token");
        if (token) {
            setUserState(DUMMY_USER);
        }
    }, []);

    const setUser = (user: User | null) => {
        setUserState(user);
        if (user) {
            sessionStorage.setItem("admin-token", "1");
        } else {
            sessionStorage.removeItem("admin-token");
        }
    };

    const updateUser = (fields: Partial<User>) => {
        setUserState((prev) => (prev ? {...prev, ...fields} : prev));
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{user, setUser, updateUser, logout}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUserContext must be used within a UserProvider");
    return ctx;
}; 