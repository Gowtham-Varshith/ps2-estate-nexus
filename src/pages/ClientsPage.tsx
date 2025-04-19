
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Search, UserPlus, FilterX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getClients } from "@/data/mockData";

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState(getClients());
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    document.title = "Clients | PS2 Estate Nexus";
  }, []);
  
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
        <p className="text-gray-600">View and manage all property clients</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-ps2-primary">{clients.length}</div>
            <p className="text-gray-500">Total Clients</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-ps2-success">
              {clients.reduce((total, client) => total + client.plotsPurchased, 0)}
            </div>
            <p className="text-gray-500">Total Plots Sold</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-ps2-secondary">
              {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              }).format(clients.reduce((total, client) => total + client.totalSpent, 0))}
            </div>
            <p className="text-gray-500">Total Revenue (Official)</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSearchQuery("")}
            >
              <FilterX size={18} />
            </Button>
          </div>
          
          <Button 
            onClick={() => navigate("/clients/new")} 
            className="bg-ps2-primary hover:bg-ps2-secondary"
          >
            <UserPlus size={18} className="mr-2" />
            Add New Client
          </Button>
        </div>
      </div>
      
      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Plots Purchased</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{client.phone}</span>
                        {client.email && <span className="text-gray-500 text-sm">{client.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell>{client.plotsPurchased}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(client.totalSpent)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : client.status === "pending" 
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                      }`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No clients found matching "{searchQuery}"
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

export default ClientsPage;
