
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardStats } from "@/data/mockData";
import StatCard from "./StatCard";
import { 
  LayoutDashboard, 
  Home,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const DashboardStats = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const stats = getDashboardStats(currentUser.role);
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
      {/* Total Layouts Created */}
      <StatCard
        title="Total Layouts"
        value={stats.totalLayouts}
        icon={<LayoutDashboard className="text-blue-500" size={24} />}
        color="bg-blue-500"
      />
      
      {/* Plots Sold */}
      <StatCard
        title="Plots Sold"
        value={stats.soldPlots}
        icon={<Home className="text-green-500" size={24} />}
        color="bg-green-500"
      />
      
      {/* Gov Revenue (White Ledger) */}
      <StatCard
        title="Gov Revenue"
        value={formatCurrency(stats.whiteRevenue)}
        icon={<DollarSign className="text-gray-500" size={24} />}
        color="bg-gray-500"
      />
      
      {/* Due Payments */}
      <StatCard
        title="Due Payments"
        value={formatCurrency(stats.duePayments)}
        icon={<AlertCircle className="text-amber-500" size={24} />}
        color="bg-amber-500"
      />
      
      {/* Black Margin (visible only to Black/Admin) */}
      {(currentUser.role === "black" || currentUser.role === "admin") && stats.blackMargin !== null && (
        <StatCard
          title="Black Margin"
          value={formatCurrency(stats.blackMargin)}
          icon={<TrendingUp className="text-black" size={24} />}
          color="bg-black"
        />
      )}
      
      {/* Today's Billing Count */}
      <StatCard
        title="Today's Billings"
        value={stats.todayBillingCount}
        icon={<Calendar className="text-purple-500" size={24} />}
        color="bg-purple-500"
      />
    </div>
  );
};

export default DashboardStats;
