
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  FileText, 
  PieChart, 
  DollarSign, 
  Map, 
  Users, 
  FolderArchive, 
  Search, 
  Database, 
  FileClock 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Navigation items with role-based access control
  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Layouts",
      icon: <Map size={20} />,
      path: "/layouts",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Billing",
      icon: <FileText size={20} />,
      path: "/billing",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Expenses",
      icon: <DollarSign size={20} />,
      path: "/expenses",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Reports",
      icon: <PieChart size={20} />,
      path: "/reports",
      roles: ["black", "admin"],
    },
    {
      title: "Clients",
      icon: <Users size={20} />,
      path: "/clients",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Documents",
      icon: <FolderArchive size={20} />,
      path: "/documents",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "AI Search",
      icon: <Search size={20} />,
      path: "/ai-search",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Backup",
      icon: <Database size={20} />,
      path: "/backup",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Activity Logs",
      icon: <FileClock size={20} />,
      path: "/logs",
      roles: ["admin"],
    },
  ];
  
  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(
    (item) => currentUser && item.roles.includes(currentUser.role as "staff" | "black" | "admin")
  );

  return (
    <aside
      className={`bg-white shadow-md z-20 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } border-r border-gray-200`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        {isOpen ? (
          <h1 className="text-xl font-bold text-ps2-primary">PS2 Estate</h1>
        ) : (
          <h1 className="text-xl font-bold text-ps2-primary">PS2</h1>
        )}
      </div>
      
      {/* Navigation Links */}
      <nav className="mt-6">
        <ul>
          {filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <li key={item.path} className="mb-2 px-4">
                <Link
                  to={item.path}
                  className={`flex items-center py-3 px-4 rounded-md transition-colors ${
                    isActive
                      ? "bg-ps2-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {isOpen && <span>{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
