
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Plus, Search, FilterX, Download } from "lucide-react";
import { getBillings, getLayouts } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const BillingTablePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const layouts = getLayouts();
  const [billings, setBillings] = useState(getBillings());
  
  const [searchQuery, setSearchQuery] = useState("");
  const [layoutFilter, setLayoutFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  
  useEffect(() => {
    document.title = "Billing Records | PS2 Estate Nexus";
  }, []);

  const handleAddBill = () => {
    navigate("/billing/new");
  };
  
  const handleViewBill = (id: string) => {
    navigate(`/billing/${id}`);
  };

  const filteredBillings = billings.filter(bill => {
    // Filter by search query (client name, plot, etc.)
    const matchesSearch = 
      bill.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      bill.plotNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by layout
    const matchesLayout = layoutFilter === "all" || bill.layoutId.toString() === layoutFilter;
    
    // Filter by visibility
    const matchesVisibility = 
      visibilityFilter === "all" || 
      (visibilityFilter === "white" && !bill.isBlackEntry) ||
      (visibilityFilter === "black" && bill.isBlackEntry);
    
    // Hide black entries from staff
    if (bill.isBlackEntry && currentUser?.role === "staff") {
      return false;
    }
    
    return matchesSearch && matchesLayout && matchesVisibility;
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Billing Records</h1>
        <p className="text-gray-600">View and manage all property billing records</p>
      </div>
      
      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search by client or plot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Select 
              value={layoutFilter} 
              onValueChange={setLayoutFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Layouts</SelectItem>
                {layouts.map(layout => (
                  <SelectItem key={layout.id} value={layout.id.toString()}>
                    {layout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(currentUser?.role === "black" || currentUser?.role === "admin") && (
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
                  <SelectItem value="black">Black Ledger</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setLayoutFilter("all");
                setVisibilityFilter("all");
              }}
            >
              <FilterX size={18} />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download size={18} className="mr-2" />
              Export
            </Button>
            <Button onClick={handleAddBill} className="bg-ps2-primary hover:bg-ps2-secondary">
              <Plus size={18} className="mr-2" />
              New Bill
            </Button>
          </div>
        </div>
      </div>
      
      {/* Billings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Plot</TableHead>
                <TableHead>Area (sqft)</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBillings.length > 0 ? (
                filteredBillings.map((bill) => {
                  const layout = layouts.find(l => l.id === bill.layoutId);
                  
                  return (
                    <TableRow key={bill.id} className={bill.isBlackEntry ? "bg-gray-50" : ""}>
                      <TableCell>{format(new Date(bill.date), "dd MMM yyyy")}</TableCell>
                      <TableCell className="font-medium">{bill.invoiceNumber}</TableCell>
                      <TableCell>{bill.clientName}</TableCell>
                      <TableCell>{layout ? layout.name : "Unknown"}</TableCell>
                      <TableCell>{bill.plotNumber}</TableCell>
                      <TableCell>{bill.areaSqft}</TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0
                        }).format(bill.amount)}
                        {bill.isBlackEntry && (
                          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-black text-white">
                            B
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.isPaid 
                            ? "bg-green-100 text-green-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {bill.isPaid ? "Paid" : "Due"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewBill(bill.id.toString())}
                        >
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-gray-500">
                    No billing records found matching the current filters
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

export default BillingTablePage;
