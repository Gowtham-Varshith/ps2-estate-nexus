
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { analyticsApi } from '@/api/apiClient';

interface LayoutPerformance {
  id: number;
  name: string;
  soldPlots: number;
  totalPlots: number;
  govRevenue: number;
  occupancyRate: number;
}

const TopPerformingLayouts = () => {
  const [layouts, setLayouts] = useState<LayoutPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchTopLayouts = async () => {
      try {
        setIsLoading(true);
        const dashboardData = await analyticsApi.getDashboardData();
        setLayouts(dashboardData.topLayouts.slice(0, 5));
        setError("");
      } catch (err) {
        console.error("Failed to load top layouts", err);
        setError("Failed to load layout performance data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopLayouts();
  }, []);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Top Performing Layouts</h2>
        </div>
        <div className="animate-pulse p-6">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Top Performing Layouts</h2>
        </div>
        <div className="p-6 text-center text-red-500">
          <p>{error}</p>
          <p className="text-sm mt-2 text-gray-500">Using fallback data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">Top Performing Layouts</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Layout Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plots Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Occupancy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gov Revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {layouts.map((layout) => {
              // Calculate occupancy percentage
              const occupancyPercentage = layout.occupancyRate.toFixed(1);
              
              return (
                <tr key={layout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {layout.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {layout.soldPlots} / {layout.totalPlots}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-ps2-primary h-2.5 rounded-full" 
                          style={{ width: `${occupancyPercentage}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">{occupancyPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(layout.govRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/layouts/${layout.id}`}
                      className="text-ps2-primary hover:text-ps2-secondary"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              );
            })}
            
            {layouts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No layout data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing top {layouts.length} layouts by revenue
        </span>
        <Link to="/layouts" className="text-sm text-ps2-primary hover:text-ps2-secondary font-medium">
          View All Layouts →
        </Link>
      </div>
    </div>
  );
};

export default TopPerformingLayouts;
