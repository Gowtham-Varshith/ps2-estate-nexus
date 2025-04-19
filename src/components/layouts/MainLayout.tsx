
import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import { 
  Menu, 
  Bell, 
  ChevronDown,
  LogOut
} from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format current time (updating every minute)
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  );
  
  // Update time every minute
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    }, 60000);
    
    return () => clearInterval(interval);
  });
  
  // Get role style
  const getRoleStyle = () => {
    switch (currentUser?.role) {
      case "admin":
        return "bg-ps2-admin text-white";
      case "black":
        return "bg-ps2-black text-white";
      case "staff":
        return "bg-ps2-white text-ps2-black border border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-ps2-primary"
              >
                <Menu size={24} />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">PS2 Estate Nexus</h1>
            </div>
            
            <div className="flex items-center">
              {/* Date and Time */}
              <div className="hidden md:flex flex-col items-end mr-6">
                <span className="text-sm font-medium text-gray-600">{currentDate}</span>
                <span className="text-sm text-gray-500">{currentTime}</span>
              </div>
              
              {/* Notifications */}
              <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ps2-primary relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ps2-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-ps2-danger"></span>
                </span>
              </button>
              
              {/* User Profile */}
              <div className="relative ml-3">
                <div className="flex items-center">
                  <div className="hidden md:block mr-3">
                    <div className="text-sm font-medium text-gray-800">{currentUser?.name}</div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleStyle()}`}>
                      {currentUser?.role.charAt(0).toUpperCase() + currentUser?.role.slice(1)}
                    </div>
                  </div>
                  <button className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                      src={currentUser?.avatar || "https://ui-avatars.com/api/?name=User"}
                      alt="User avatar"
                    />
                    <ChevronDown size={16} className="ml-1 text-gray-500" />
                  </button>
                  <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
