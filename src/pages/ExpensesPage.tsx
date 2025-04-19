
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, FilterX } from "lucide-react";
import { getExpenses } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const ExpensesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState(getExpenses());
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  
  useEffect(() => {
    document.title = "Expenses | PS2 Estate Nexus";
  }, []);

  const handleAddExpense = () => {
    navigate("/expenses/new");
  };

  const filteredExpenses = expenses.filter(expense => {
    // Filter by search query
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          expense.layout.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by visibility
    const matchesVisibility = 
      visibilityFilter === "all" || 
      (visibilityFilter === "white" && expense.visibility === "white") ||
      (visibilityFilter === "black" && expense.visibility === "black");
    
    return matchesSearch && matchesVisibility;
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses Management</h1>
        <p className="text-gray-600">Track and manage all property expenses</p>
      </div>
      
      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Select 
              value={visibilityFilter} 
              onValueChange={setVisibilityFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="white">White Ledger</SelectItem>
                {(currentUser?.role === "black" || currentUser?.role === "admin") && (
                  <SelectItem value="black">Black Ledger</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setVisibilityFilter("all");
              }}
            >
              <FilterX size={18} />
            </Button>
          </div>
          
          <Button onClick={handleAddExpense} className="bg-ps2-primary hover:bg-ps2-secondary">
            <Plus size={18} className="mr-2" />
            Add Expense
          </Button>
        </div>
      </div>
      
      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Added By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense, index) => {
                  // Check if the user can see this expense based on their role
                  if (expense.visibility === "black" && currentUser?.role === "staff") {
                    return null;
                  }
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.layout}</TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0
                        }).format(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.type === "credit" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {expense.type.charAt(0).toUpperCase() + expense.type.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.visibility === "white" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-black text-white"
                        }`}>
                          {expense.visibility.charAt(0).toUpperCase() + expense.visibility.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{expense.addedBy}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    No expenses found matching the current filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExpensesPage;
