
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import BillingFormModal from "@/components/billing/BillingFormModal";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import LayoutFormModal from "@/components/layouts/LayoutFormModal";
import { useToast } from "@/hooks/use-toast";

const QuickActions = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  const actions = [
    {
      title: "Generate Bill",
      icon: <FileText size={20} />,
      color: "bg-ps2-primary text-white",
      roles: ["staff", "black", "admin"],
      onClick: () => setShowBillingModal(true),
      modal: true
    },
    {
      title: "Add Expense",
      icon: <DollarSign size={20} />,
      color: "bg-ps2-secondary text-white",
      roles: ["staff", "black", "admin"],
      onClick: () => setShowExpenseModal(true),
      modal: true
    },
    {
      title: "Create Layout",
      icon: <Map size={20} />,
      color: "bg-ps2-success text-white",
      roles: ["staff", "black", "admin"],
      onClick: () => setShowLayoutModal(true),
      modal: true
    },
    {
      title: "View Bills",
      icon: <FileClock size={20} />,
      path: "/billing",
      color: "bg-ps2-warning text-white",
      roles: ["staff", "black", "admin"],
      modal: false
    },
    {
      title: "Backup Now",
      icon: <Database size={20} />,
      path: "/backup",
      color: "bg-ps2-danger text-white",
      roles: ["staff", "black", "admin"],
      modal: false
    },
    {
      title: "AI Smart Search",
      icon: <Search size={20} />,
      path: "/ai-search",
      color: "bg-ps2-admin text-white",
      roles: ["staff", "black", "admin"],
      modal: false
    },
  ];

  // Filter actions based on user role
  const filteredActions = actions.filter(
    (action) => currentUser && action.roles.includes(currentUser.role as "staff" | "black" | "admin")
  );
  
  const handleBillSubmit = (data: any) => {
    console.log('New bill data:', data);
    
    toast({
      title: "Bill Generated",
      description: `Successfully created bill for ${data.clientName}`,
    });
    
    setShowBillingModal(false);
  };
  
  const handleExpenseSubmit = (data: any) => {
    console.log('New expense data:', data);
    
    toast({
      title: "Expense Added",
      description: `Successfully added ${data.type === 'credit' ? 'income' : 'expense'} of ₹${data.amount}`,
    });
    
    setShowExpenseModal(false);
  };
  
  const handleLayoutSubmit = (data: any) => {
    console.log('New layout data:', data);
    
    toast({
      title: "Layout Created",
      description: `Successfully created ${data.name} layout with ${data.plotCount} plots`,
    });
    
    setShowLayoutModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {filteredActions.map((action, index) => (
          action.modal ? (
            <Button
              key={index}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform hover:scale-105 h-auto ${action.color}`}
            >
              <div className="mb-2 p-2 bg-white/20 rounded-full">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-center">{action.title}</span>
            </Button>
          ) : (
            <Link
              key={index}
              to={action.path || "#"}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-transform hover:scale-105 ${action.color}`}
            >
              <div className="mb-2 p-2 bg-white/20 rounded-full">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-center">{action.title}</span>
            </Link>
          )
        ))}
      </div>
      
      {/* Modals */}
      <BillingFormModal 
        isOpen={showBillingModal} 
        onClose={() => setShowBillingModal(false)} 
        onSubmit={handleBillSubmit}
      />
      
      <ExpenseFormModal 
        isOpen={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)} 
        onSubmit={handleExpenseSubmit}
      />
      
      <LayoutFormModal 
        isOpen={showLayoutModal} 
        onClose={() => setShowLayoutModal(false)} 
        onSubmit={handleLayoutSubmit}
      />
    </div>
  );
};

export default QuickActions;
