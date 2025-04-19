
import { Link } from 'react-router-dom';
import { getTopPerformingLayouts } from '@/data/mockData';
import { Eye } from 'lucide-react';

const TopPerformingLayouts = () => {
  const topLayouts = getTopPerformingLayouts().slice(0, 5);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
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
            {topLayouts.map((layout) => {
              // Calculate occupancy percentage
              const occupancyPercentage = ((layout.soldPlots / layout.totalPlots) * 100).toFixed(1);
              
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
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing top {topLayouts.length} layouts by revenue
        </span>
        <Link to="/layouts" className="text-sm text-ps2-primary hover:text-ps2-secondary font-medium">
          View All Layouts →
        </Link>
      </div>
    </div>
  );
};

export default TopPerformingLayouts;
