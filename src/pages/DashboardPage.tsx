
import { useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import QuickActions from "@/components/dashboard/QuickActions";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PlotsSoldChart from "@/components/dashboard/PlotsSoldChart";
import RecentBillings from "@/components/dashboard/RecentBillings";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import TopPerformingLayouts from "@/components/dashboard/TopPerformingLayouts";

const DashboardPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "Dashboard | PS2 Estate Nexus";
  }, []);

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to PS2 Estate Nexus Management System</p>
      </div>
      
      {/* Quick Action Buttons */}
      <QuickActions />
      
      {/* Dashboard Stats Cards */}
      <DashboardStats />
      
      {/* Charts Section */}
      <PlotsSoldChart />
      
      {/* Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <RecentBillings />
        <RecentExpenses />
      </div>
      
      {/* Top Performing Layouts */}
      <TopPerformingLayouts />
    </MainLayout>
  );
};

export default DashboardPage;
