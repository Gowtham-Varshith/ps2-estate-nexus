
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "@/data/mockData";
import { authApi } from "@/api/apiClient";
import { toast } from "sonner";

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user session in local storage or through API
    const loadUser = async () => {
      try {
        const user = await authApi.getCurrentUser();
        
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Failed to load user", error);
        // Clear any invalid tokens
        localStorage.removeItem("ps2_tokens");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
    
    // Listen for logout events (for multi-tab support)
    const handleLogout = () => {
      setCurrentUser(null);
    };
    window.addEventListener('ps2-logout', handleLogout);
    
    return () => {
      window.removeEventListener('ps2-logout', handleLogout);
    };
  }, []);

  const login = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Call login API
      const response = await authApi.login(username, password, role);
      
      if (response.user) {
        setCurrentUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed: " + (error.message || "Invalid credentials"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setCurrentUser(null);
      setIsLoading(false);
      // Navigate after state is updated
      navigate("/login");
    }
  };
  
  // Function to refresh authentication if needed
  const refreshAuth = async (): Promise<boolean> => {
    try {
      const result = await authApi.refreshToken();
      return !!result;
    } catch (error) {
      console.error("Failed to refresh authentication", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        login, 
        logout, 
        isLoading, 
        refreshAuth 
      }}
    >
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
