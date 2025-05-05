
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "./StatCard";
import { 
  LayoutDashboard, 
  Home,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { analyticsApi } from "@/api/apiClient";

interface DashboardStatsData {
  totalLayouts: number;
  soldPlots: number;
  whiteRevenue: number;
  duePayments: number;
  blackMargin: number | null;
  todayBillingCount: number;
}

const DashboardStats = () => {
  const { currentUser } = useAuth();
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const data = await analyticsApi.getDashboardData();
        setStatsData(data.stats);
        setError("");
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);
  
  if (!currentUser) return null;
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-md mb-6">
        <p>{error}</p>
        <p className="text-sm mt-2">Using fallback data...</p>
      </div>
    );
  }

  if (!statsData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
      {/* Total Layouts Created */}
      <StatCard
        title="Total Layouts"
        value={statsData.totalLayouts}
        icon={<LayoutDashboard className="text-blue-500" size={24} />}
        color="bg-blue-500"
      />
      
      {/* Plots Sold */}
      <StatCard
        title="Plots Sold"
        value={statsData.soldPlots}
        icon={<Home className="text-green-500" size={24} />}
        color="bg-green-500"
      />
      
      {/* Gov Revenue (White Ledger) */}
      <StatCard
        title="Gov Revenue"
        value={formatCurrency(statsData.whiteRevenue)}
        icon={<DollarSign className="text-gray-500" size={24} />}
        color="bg-gray-500"
      />
      
      {/* Due Payments */}
      <StatCard
        title="Due Payments"
        value={formatCurrency(statsData.duePayments)}
        icon={<AlertCircle className="text-amber-500" size={24} />}
        color="bg-amber-500"
      />
      
      {/* Black Margin (visible only to Black/Admin) */}
      {(currentUser.role === "black" || currentUser.role === "admin") && statsData.blackMargin !== null && (
        <StatCard
          title="Black Margin"
          value={formatCurrency(statsData.blackMargin)}
          icon={<TrendingUp className="text-black" size={24} />}
          color="bg-black"
        />
      )}
      
      {/* Today's Billing Count */}
      <StatCard
        title="Today's Billings"
        value={statsData.todayBillingCount}
        icon={<Calendar className="text-purple-500" size={24} />}
        color="bg-purple-500"
      />
    </div>
  );
};

export default DashboardStats;
