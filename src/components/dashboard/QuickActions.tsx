
import { Link } from "react-router-dom";
import { 
  FileText, 
  DollarSign,
  Map,
  FileClock,
  Database,
  Search,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const QuickActions = () => {
  const { currentUser } = useAuth();

  const actions = [
    {
      title: "Generate Bill",
      icon: <FileText size={20} />,
      path: "/billing/new",
      color: "bg-ps2-primary text-white",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Add Expense",
      icon: <DollarSign size={20} />,
      path: "/expenses/new",
      color: "bg-ps2-secondary text-white",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Create Layout",
      icon: <Map size={20} />,
      path: "/layouts/new",
      color: "bg-ps2-success text-white",
      roles: ["black", "admin"],
    },
    {
      title: "View Bills",
      icon: <FileClock size={20} />,
      path: "/billing",
      color: "bg-ps2-warning text-white",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "Backup Now",
      icon: <Database size={20} />,
      path: "/backup",
      color: "bg-ps2-danger text-white",
      roles: ["staff", "black", "admin"],
    },
    {
      title: "AI Smart Search",
      icon: <Search size={20} />,
      path: "/ai-search",
      color: "bg-ps2-admin text-white",
      roles: ["staff", "black", "admin"],
    },
  ];

  // Filter actions based on user role
  const filteredActions = actions.filter(
    (action) => currentUser && action.roles.includes(currentUser.role as "staff" | "black" | "admin")
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {filteredActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform hover:scale-105 ${action.color}`}
          >
            <div className="mb-2 p-2 bg-white/20 rounded-full">
              {action.icon}
            </div>
            <span className="text-sm font-medium text-center">{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
