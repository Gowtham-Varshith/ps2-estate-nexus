
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye } from 'lucide-react';
import { analyticsApi } from '@/api/apiClient';

interface DashboardExpense {
  id: number;
  date: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  visibility: 'white' | 'black' | 'both';
  layoutName?: string;
  plotNumber?: string;
  layoutId?: number;
  plotId?: number;
}

const RecentExpenses = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState<DashboardExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchRecentExpenses = async () => {
      try {
        setIsLoading(true);
        const dashboardData = await analyticsApi.getDashboardData();
        setExpenses(dashboardData.recentExpenses);
        setError("");
      } catch (err) {
        console.error("Failed to load recent expenses", err);
        setError("Failed to load recent expenses data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentExpenses();
  }, []);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Filter expenses based on user role and visibility
  const filteredExpenses = currentUser?.role === 'staff' 
    ? expenses.filter(expense => expense.visibility === 'white' || expense.visibility === 'both')
    : expenses;
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Latest Expenses</h2>
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
          <h2 className="text-lg font-semibold text-gray-700">Latest Expenses</h2>
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
        <h2 className="text-lg font-semibold text-gray-700">Latest Expenses</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Layout/Plot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visibility
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {expense.plotNumber ? expense.plotNumber : ''} {expense.layoutName ? `(${expense.layoutName})` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    expense.type === 'credit' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {expense.type.charAt(0).toUpperCase() + expense.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    expense.visibility === 'white' 
                      ? 'bg-gray-100 text-gray-800' 
                      : expense.visibility === 'black'
                      ? 'bg-black text-white'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {expense.visibility.charAt(0).toUpperCase() + expense.visibility.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    to={`/expenses/${expense.id}`}
                    className="text-ps2-primary hover:text-ps2-secondary"
                  >
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
            
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No expense data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Showing {filteredExpenses.length} recent expenses
        </span>
        <Link to="/expenses" className="text-sm text-ps2-primary hover:text-ps2-secondary font-medium">
          View All Expenses →
        </Link>
      </div>
    </div>
  );
};

export default RecentExpenses;
