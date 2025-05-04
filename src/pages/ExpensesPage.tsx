
import React, { useState, useEffect } from 'react';
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, FileText, Plus, Search, Filter, Calendar, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Expense, ExpenseFilterOptions } from "@/types/expenseTypes";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

const ExpensesPage = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ExpenseFilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const dummyExpenses: Expense[] = [
    {
      id: 1,
      description: "Daily Tea Expenses",
      category: "Tea",
      vendor: "HTGTA",
      amount: 1200,
      date: "2023-04-21",
      notes: "Regular tea expense for staff",
      status: 'approved'
    },
    {
      id: 2,
      description: "Labour Payment",
      category: "Labour",
      vendor: "Ganesh Construction",
      amount: 12000,
      date: "2023-04-20",
      layoutName: "PS2 Layout",
      layoutId: 1,
      notes: "Payment for site preparation",
      status: 'approved'
    },
    {
      id: 3,
      description: "Marketing Materials",
      category: "Marketing",
      vendor: "Print Solutions",
      amount: 7500,
      date: "2023-04-19",
      layoutName: "PS3 Layout",
      layoutId: 2,
      notes: "Brochures and banners",
      status: 'approved'
    },
    {
      id: 4,
      description: "Transportation",
      category: "Transport",
      vendor: "City Cabs",
      amount: 2500,
      date: "2023-04-18",
      notes: "Site visits with clients",
      status: 'approved'
    },
    {
      id: 5,
      description: "Office Supplies",
      category: "Office",
      vendor: "Stationery World",
      amount: 3200,
      date: "2023-04-17",
      notes: "Monthly office supplies",
      status: 'pending'
    },
    {
      id: 6,
      description: "Legal Consultation",
      category: "Legal",
      vendor: "Kumar Associates",
      amount: 15000,
      date: "2023-04-16",
      layoutName: "PS2 Layout",
      layoutId: 1,
      notes: "Document verification",
      status: 'pending'
    },
    {
      id: 7,
      description: "Site Cleaning",
      category: "Maintenance",
      vendor: "Clean Solutions",
      amount: 5000,
      date: "2023-04-15",
      layoutName: "PS3 Layout",
      layoutId: 2,
      notes: "Monthly maintenance",
      status: 'approved'
    },
    {
      id: 8,
      description: "Petrol Reimbursement",
      category: "Transport",
      vendor: "Suresh",
      amount: 1800,
      date: "2023-04-14",
      notes: "Staff reimbursement",
      status: 'approved'
    }
  ];

  useEffect(() => {
    document.title = "Expenses | PS2 Estate Nexus";

    // Simulate API call
    const timeout = setTimeout(() => {
      setExpenses(dummyExpenses);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  const getTodaysExpense = () => {
    const todayExpense = dummyExpenses.slice(0, 2);
    return todayExpense.reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalExpense = () => {
    return dummyExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = Array.from(new Set(dummyExpenses.map(e => e.category)));
  const statuses = ['approved', 'pending', 'rejected'];

  const filteredExpenses = expenses
    .filter(expense => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          expense.description.toLowerCase().includes(query) ||
          expense.vendor.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query) ||
          (expense.layoutName && expense.layoutName.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(expense => {
      if (selectedCategory) {
        return expense.category === selectedCategory;
      }
      return true;
    })
    .filter(expense => {
      if (selectedStatus) {
        return expense.status === selectedStatus;
      }
      return true;
    });

  const handleExportReport = () => {
    toast({
      title: "Report Generated",
      description: "Expense report has been exported to PDF",
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage all your expenses</p>
        </div>
        
        <Link to="/expenses/new">
          <Button className="gap-2">
            <Plus size={16} />
            Add Expense
          </Button>
        </Link>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today's Expenses</CardDescription>
            <CardTitle className="text-2xl">₹{getTodaysExpense().toLocaleString('en-IN')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">2 transactions today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-2xl">₹{getTotalExpense().toLocaleString('en-IN')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{expenses.length} transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Category</CardDescription>
            <CardTitle className="text-2xl">Labour</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">₹12,000 (25% of total)</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter size={16} />
                Filters
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportReport}
                className="gap-2"
              >
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium block mb-2">Category</label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => setSelectedCategory(value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Status</label>
                <Select 
                  value={selectedStatus} 
                  onValueChange={(value) => setSelectedStatus(value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Date Range</label>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <Calendar size={14} />
                    Select Range
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Expenses Listing */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Expenses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="p-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No expenses found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{expense.description}</div>
                                {expense.layoutName && (
                                  <div className="text-xs text-gray-500">Layout: {expense.layoutName}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{expense.category}</Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{expense.vendor}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(expense.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            ₹{expense.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Badge className={getStatusBadgeColor(expense.status)}>
                              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {filteredExpenses.length} of {expenses.length} expenses
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="p-0">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Pending expenses will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="p-0">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Approved expenses will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default ExpensesPage;
