
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Search, Users, ArrowRight, Phone, FileText, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Types for info management
type InfoType = "Client" | "Layout" | "Vendor" | "Staff";

interface InfoItem {
  id: number;
  name: string;
  type: InfoType;
  transactions: number;
  revenue: number;
  expenses?: number;
  lastActivity: string;
  phone?: string;
  location?: string;
  plotCount?: number;
  plotsSold?: number;
  email?: string;
  image?: string;
}

const InfoManagementPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [infoType, setInfoType] = useState<"All" | InfoType>("All");
  const [results, setResults] = useState<InfoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Info Management | PS2 Estate Nexus";
    
    // Simulate loading data from API
    setLoading(true);

    setTimeout(() => {
      // Load expanded dummy data
      setResults([
        {
          id: 1,
          name: "Ramesh Kumar",
          type: "Client",
          transactions: 12,
          revenue: 520000,
          lastActivity: "2025-04-22",
          phone: "9876543210",
          location: "Hyderabad",
          email: "ramesh@example.com",
        },
        {
          id: 2,
          name: "Suresh Reddy",
          type: "Client",
          transactions: 5,
          revenue: 320000,
          lastActivity: "2025-04-15",
          phone: "8765432109",
          location: "Bangalore",
          email: "suresh@example.com",
        },
        {
          id: 3,
          name: "PS2 Layout",
          type: "Layout",
          transactions: 25,
          revenue: 1200000,
          lastActivity: "2025-04-20",
          plotCount: 50,
          plotsSold: 15,
          location: "Shadnagar",
        },
        {
          id: 4,
          name: "Tea Supplier",
          type: "Vendor",
          transactions: 32,
          revenue: 0,
          expenses: 45000,
          lastActivity: "2025-04-24",
          phone: "7654321098",
          location: "Hyderabad",
          email: "teasupplier@example.com",
        },
        {
          id: 5,
          name: "Raju Construction",
          type: "Vendor",
          transactions: 8,
          revenue: 0,
          expenses: 250000,
          lastActivity: "2025-04-18",
          phone: "6543210987",
          location: "Hyderabad",
        },
        {
          id: 6,
          name: "PS1 Layout",
          type: "Layout",
          transactions: 40,
          revenue: 1800000,
          lastActivity: "2025-04-10",
          plotCount: 60,
          plotsSold: 40,
          location: "Maheshwaram",
        },
        {
          id: 7,
          name: "PS3 Layout",
          type: "Layout",
          transactions: 10,
          revenue: 600000,
          lastActivity: "2025-04-05",
          plotCount: 30,
          plotsSold: 8,
          location: "Adibatla",
        },
        {
          id: 8,
          name: "Venkat Rao",
          type: "Staff",
          transactions: 55,
          revenue: 2500000,
          expenses: 80000,
          lastActivity: "2025-04-23",
          phone: "9876543210",
          email: "venkat@ps2estate.com",
        },
        {
          id: 9,
          name: "Marketing Services",
          type: "Vendor",
          transactions: 15,
          revenue: 0,
          expenses: 120000,
          lastActivity: "2025-04-12",
          phone: "9876543210",
          email: "marketing@services.com",
          location: "Hyderabad",
        },
        {
          id: 10,
          name: "Lakshmi",
          type: "Client",
          transactions: 2,
          revenue: 180000,
          lastActivity: "2025-04-08",
          phone: "8765432109",
          location: "Chennai",
          email: "lakshmi@example.com",
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate API call to /api/info/search
    setTimeout(() => {
      toast({
        title: "Search Complete",
        description: `Found ${
          searchTerm ? 
            results.filter(item => 
              item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length : 
            results.length
        } results`
      });
      
      setIsSearching(false);
    }, 500);
  };
  
  // Filter results based on search term and type
  const filteredResults = results.filter(item => {
    const matchesSearch = searchTerm ? 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.phone && item.phone.includes(searchTerm)) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) :
      true;
      
    const matchesType = infoType === "All" ? true : item.type === infoType;
    
    return matchesSearch && matchesType;
  });
  
  // Summary stats
  const totalRevenue = filteredResults.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = filteredResults.reduce((sum, item) => sum + (item.expenses || 0), 0);
  const totalTransactions = filteredResults.reduce((sum, item) => sum + item.transactions, 0);

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Info Management</h1>
        <p className="text-gray-600">Search and manage all contacts, layouts, and entities</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Total Entries</p>
                <p className="text-2xl font-bold text-blue-900">{filteredResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-700">Total Expenses</p>
                <p className="text-2xl font-bold text-red-900">₹{totalExpenses.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Transactions</p>
                <p className="text-2xl font-bold text-purple-900">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="text" 
                placeholder="Search by name, phone, or location..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={infoType} onValueChange={(value) => setInfoType(value as "All" | InfoType)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Client">Clients</SelectItem>
                  <SelectItem value="Layout">Layouts</SelectItem>
                  <SelectItem value="Vendor">Vendors</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-32 animate-pulse bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 w-2/3 animate-pulse bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-1/2 animate-pulse bg-gray-200 rounded mb-3"></div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="h-8 animate-pulse bg-gray-100 rounded"></div>
                    <div className="h-8 animate-pulse bg-gray-100 rounded"></div>
                  </div>
                  <div className="h-8 w-full animate-pulse bg-gray-100 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResults.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <span className={`text-sm px-2 py-0.5 rounded-full ${
                        item.type === 'Client' ? 'bg-blue-50 text-blue-600' :
                        item.type === 'Layout' ? 'bg-green-50 text-green-600' :
                        item.type === 'Vendor' ? 'bg-orange-50 text-orange-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {item.type}
                      </span>
                      {item.location && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center">
                          <span className="mr-1">📍</span> {item.location}
                        </p>
                      )}
                    </div>
                    {item.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone size={14} className="mr-1" />
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
                    
                    {item.type === 'Layout' ? (
                      <>
                        <div>
                          <div className="text-xs text-gray-500">Total Plots</div>
                          <div className="font-semibold">{item.plotCount}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Plots Sold</div>
                          <div className="font-semibold">{item.plotsSold} / {item.plotCount}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        {item.revenue > 0 && (
                          <div>
                            <div className="text-xs text-gray-500">Total Revenue</div>
                            <div className="font-semibold text-green-600">
                              ₹{item.revenue.toLocaleString()}
                            </div>
                          </div>
                        )}
                        {item.expenses && item.expenses > 0 && (
                          <div>
                            <div className="text-xs text-gray-500">Total Expenses</div>
                            <div className="font-semibold text-red-600">
                              ₹{item.expenses.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </>
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
          
          {filteredResults.length === 0 && (
            <div className="col-span-3 text-center py-10">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-xl font-medium text-gray-700">No results found</h3>
              <p className="text-gray-500 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default InfoManagementPage;
