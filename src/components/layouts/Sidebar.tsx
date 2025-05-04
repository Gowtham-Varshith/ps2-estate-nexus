
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
  FileClock,
  MessageSquare,
  Settings,
  Sparkles,
  BellDot
} from "lucide-react";
import MetricSelector from "@/components/common/MetricSelector";
import { Badge } from "@/components/ui/badge";

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
      title: "Info Management",
      icon: <Users size={20} />,
      path: "/info",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Documents",
      icon: <FolderArchive size={20} />,
      path: "/documents",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "AI Assistant",
      icon: <Sparkles size={20} />,
      path: "/ai-search",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Notifications",
      icon: <BellDot size={20} />,
      path: "/notifications",
      roles: ["staff", "black", "admin"],
      badge: 3,
    },
    {
      title: "Reports",
      icon: <PieChart size={20} />,
      path: "/reports",
      roles: ["black", "admin"],
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
    {
      title: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
      roles: ["black", "admin"],
    },
  ];
  
  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(
    (item) => currentUser && item.roles.includes(currentUser.role as "staff" | "black" | "admin")
  );

  return (
    <aside
      className={`bg-white shadow-md z-20 transition-all duration-300 flex flex-col h-screen ${
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
      <nav className="mt-6 flex-grow overflow-y-auto">
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
                  {isOpen && (
                    <div className="flex justify-between items-center w-full">
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge className="ml-2 bg-red-500">{item.badge}</Badge>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Metric Selector in Sidebar Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Land Measurement</p>
          <MetricSelector />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
