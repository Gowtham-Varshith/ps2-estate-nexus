
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  ArrowDown, 
  ArrowUp 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for expenses
interface Expense {
  id: number;
  description: string;
  category: string;
  name: string;
  amount: number;
  date: string;
  notes: string;
  layout?: string;
}

const mockExpenses: Expense[] = [
  {
    id: 1,
    description: "Tea and Snacks",
    category: "Refreshments",
    name: "Suresh",
    amount: 1200,
    date: "2025-04-21",
    notes: "Morning meeting with clients",
    layout: "PS2 Layout"
  },
  {
    id: 2,
    description: "Labour Charges",
    category: "Labour",
    name: "HTGTA",
    amount: 12000,
    date: "2025-04-20",
    notes: "Clearing work at PS1"
  },
  {
    id: 3,
    description: "Transport",
    category: "Travel",
    name: "Ramesh Driver",
    amount: 3500,
    date: "2025-04-19",
    notes: "Site visit with clients"
  },
  {
    id: 4,
    description: "Marketing Materials",
    category: "Marketing",
    name: "ABC Printing",
    amount: 8500,
    date: "2025-04-18",
    notes: "Brochures for PS2 Layout",
    layout: "PS2 Layout"
  },
  {
    id: 5,
    description: "Tea for Staff",
    category: "Refreshments",
    name: "Local Tea Shop",
    amount: 350,
    date: "2025-04-17",
    notes: "Daily tea for 5 staff"
  }
];

// Define categories for filtering
const categories = ["All", "Refreshments", "Labour", "Travel", "Marketing", "Office", "Utilities"];

const ExpensesPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isAdmin = currentUser?.role === 'black' || currentUser?.role === 'admin';
  
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(mockExpenses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLayout, setSelectedLayout] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Mock layouts for filtering
  const layouts = ["All", "PS1 Layout", "PS2 Layout", "PS3 Layout"];
  
  // Total expenses for today
  const todayExpenses = expenses
    .filter(expense => new Date(expense.date).toDateString() === new Date().toDateString())
    .reduce((sum, expense) => sum + expense.amount, 0);
    
  // Apply filters and sorting
  useEffect(() => {
    let result = [...expenses];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.layout && expense.layout.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(expense => expense.category === selectedCategory);
    }
    
    // Filter by layout (admin only)
    if (isAdmin && selectedLayout !== 'All') {
      result = result.filter(expense => expense.layout === selectedLayout);
    }
    
    // Sort results
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime() 
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });
    
    setFilteredExpenses(result);
  }, [expenses, searchTerm, selectedCategory, selectedLayout, sortBy, sortOrder, isAdmin]);
  
  // Handle sort toggle
  const toggleSort = (column: 'date' | 'amount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  // Export expenses as CSV
  const exportExpenses = () => {
    // In a real app, this would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Expenses data is being exported to CSV format",
    });
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Expenses data has been exported successfully",
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">Track and manage all expenses</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" onClick={exportExpenses} className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
          <Button asChild className="bg-ps2-primary hover:bg-ps2-secondary flex items-center gap-2">
            <Link to="/expenses/new">
              <Plus size={16} />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Expenses</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₹{todayExpenses.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₹{expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Daily</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₹{Math.round(expenses.reduce((sum, expense) => sum + expense.amount, 0) / 5).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  className="pl-10" 
                  placeholder="Search expenses..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-1 gap-4">
              <div className="w-full md:w-1/2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {isAdmin && (
                <div className="w-full md:w-1/2">
                  <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                    <SelectTrigger>
                      <SelectValue placeholder="Layout" />
                    </SelectTrigger>
                    <SelectContent>
                      {layouts.map(layout => (
                        <SelectItem key={layout} value={layout}>
                          {layout}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer" onClick={() => toggleSort('amount')}>
                    <div className="flex items-center gap-2">
                      Amount
                      {sortBy === 'amount' && (
                        sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 cursor-pointer" onClick={() => toggleSort('date')}>
                    <div className="flex items-center gap-2">
                      Date
                      {sortBy === 'date' && (
                        sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                      )}
                    </div>
                  </th>
                  {isAdmin && <th className="text-left py-3 px-4 font-medium text-gray-600">Layout</th>}
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-xs text-gray-500">{expense.category}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{expense.name}</td>
                    <td className="py-3 px-4 font-medium">₹{expense.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">{new Date(expense.date).toLocaleDateString('en-IN')}</td>
                    {isAdmin && <td className="py-3 px-4">{expense.layout || "-"}</td>}
                    <td className="py-3 px-4 max-w-xs truncate">{expense.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses found matching your filters.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default ExpensesPage;
