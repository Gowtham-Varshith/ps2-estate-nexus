
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/data/mockData";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("staff");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    if (!username || !password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }
    
    try {
      const success = await login(username, password, selectedRole);
      
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials for selected role");
      }
    } catch (err) {
      setError(`Login failed: ${err.message || 'An error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-ps2-primary">PS2 Estate Nexus</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <RoleButton 
              role="staff" 
              label="Staff (White)" 
              selected={selectedRole === "staff"} 
              onClick={() => setSelectedRole("staff")} 
              className="bg-ps2-white text-ps2-black border border-gray-300"
            />
            <RoleButton 
              role="black" 
              label="Black" 
              selected={selectedRole === "black"} 
              onClick={() => setSelectedRole("black")} 
              className="bg-ps2-black text-white"
            />
            <RoleButton 
              role="admin" 
              label="Admin" 
              selected={selectedRole === "admin"} 
              onClick={() => setSelectedRole("admin")} 
              className="bg-ps2-admin text-white"
            />
          </div>
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-ps2-primary focus:border-ps2-primary focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-ps2-primary focus:border-ps2-primary focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-ps2-primary hover:bg-ps2-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ps2-primary ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              Login
            </button>
          </div>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            <p className="mb-1">For demo purposes, use:</p>
            <p>staff / staff123 (Staff role)</p>
            <p>black / black123 (Black role)</p>
            <p>admin / admin123 (Admin role)</p>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RoleButtonProps {
  role: UserRole;
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

const RoleButton = ({ role, label, selected, onClick, className = "" }: RoleButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${className} ${
        selected 
          ? "ring-2 ring-ps2-primary ring-offset-2" 
          : "opacity-60 hover:opacity-80"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default LoginPage;
