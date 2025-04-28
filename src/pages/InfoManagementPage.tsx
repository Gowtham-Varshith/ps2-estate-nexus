
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Search, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const InfoManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Info Management | PS2 Estate Nexus";
    
    // Load dummy data
    setResults([
      {
        id: 1,
        name: "Ramesh Kumar",
        type: "Client",
        transactions: 12,
        revenue: 520000,
        lastActivity: "2025-04-22",
        phone: "9876543210"
      },
      {
        id: 2,
        name: "Suresh Reddy",
        type: "Client",
        transactions: 5,
        revenue: 320000,
        lastActivity: "2025-04-15",
        phone: "8765432109"
      },
      {
        id: 3,
        name: "PS2 Layout",
        type: "Layout",
        transactions: 25,
        revenue: 1200000,
        lastActivity: "2025-04-20",
      },
      {
        id: 4,
        name: "Tea Supplier",
        type: "Vendor",
        transactions: 32,
        revenue: 0,
        expenses: 45000,
        lastActivity: "2025-04-24",
        phone: "7654321098"
      }
    ]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate API call to /api/info/search
    setTimeout(() => {
      // Filter results based on search term
      const filtered = results.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered.length > 0 ? filtered : results);
      setIsSearching(false);
    }, 500);
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Info Management</h1>
        <p className="text-gray-600">Search and manage all contacts, layouts, and entities</p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="text" 
                placeholder="Search by name, phone, or description..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {item.type}
                    </span>
                  </div>
                  {item.phone && (
                    <div className="text-sm text-gray-500">
                      {item.phone}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Linked Transactions</div>
                    <div className="font-semibold">{item.transactions}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Last Activity</div>
                    <div className="font-semibold">{new Date(item.lastActivity).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Revenue</div>
                    <div className="font-semibold text-green-600">
                      ₹{item.revenue.toLocaleString()}
                    </div>
                  </div>
                  {item.expenses && (
                    <div>
                      <div className="text-xs text-gray-500">Total Expenses</div>
                      <div className="font-semibold text-red-600">
                        ₹{item.expenses.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
                
                <Link to={`/info/${item.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    <span>View Details</span>
                    <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {results.length === 0 && (
          <div className="col-span-3 text-center py-10">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-xl font-medium text-gray-700">No results found</h3>
            <p className="text-gray-500 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InfoManagementPage;
