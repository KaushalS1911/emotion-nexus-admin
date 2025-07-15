import React, { createContext, useContext, useState } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  // Add more fields as needed
  settings?: Record<string, any>;
};

export type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (fields: Partial<User>) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = (fields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...fields } : prev));
  };

  const logout = () => {
    setUser(null);
    // Optionally clear localStorage or cookies here
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within a UserProvider");
  return ctx;
}; 