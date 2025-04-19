
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole, users } from "@/data/mockData";

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user session in local storage
    const storedUser = localStorage.getItem("ps2_user");
    
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("ps2_user");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string, role: UserRole): boolean => {
    // Find user with matching credentials and role
    const user = users.find(
      (u) => u.username === username && u.password === password && u.role === role
    );

    if (user) {
      setCurrentUser(user);
      localStorage.setItem("ps2_user", JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ps2_user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
