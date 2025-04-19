
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { bills, plots, clients, layouts } from '@/data/mockData';
import { Eye } from 'lucide-react';

const RecentBillings = () => {
  const { currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  
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
  
  // Get recent billings
  const recentBills = [...bills]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, itemsPerPage);
  
  // Filter billings based on user role
  const filteredBills = currentUser?.role === 'staff' 
    ? recentBills.filter(bill => bill.ledgerType === 'white')
    : recentBills;
    
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">Recent Billings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plot
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBills.map((bill) => {
              // Find related data
              const plot = plots.find(p => p.id === bill.plotId);
              const client = clients.find(c => c.id === bill.clientId);
              const layout = plot ? layouts.find(l => l.id === plot.layoutId) : null;
              
              // Check if there's a due amount
              const hasDueAmount = bill.dueAmount > 0;
              
              return (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {plot?.plotNo} {layout ? `(${layout.name})` : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(bill.paidAmount)}
                    {hasDueAmount && (
                      <span className="ml-1 text-xs text-amber-600">
                        (+{formatCurrency(bill.dueAmount)} due)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(bill.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      bill.ledgerType === 'white' 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-black text-white'
                    }`}>
                      {bill.ledgerType.charAt(0).toUpperCase() + bill.ledgerType.slice(1)}
                    </span>
                    {' '}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      hasDueAmount 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {hasDueAmount ? 'Due' : 'Paid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/billing/${bill.id}`}
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
          Showing {filteredBills.length} of {bills.length} bills
        </span>
        <Link to="/billing" className="text-sm text-ps2-primary hover:text-ps2-secondary font-medium">
          View All Billings →
        </Link>
      </div>
    </div>
  );
};

export default RecentBillings;
