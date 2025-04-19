
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, User, Phone, Mail, MapPin, FileText, Clock, Calendar } from "lucide-react";
import { getClients, getBillingsByClient, getExpensesByClient } from "@/data/mockData";
import { format } from "date-fns";

const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [billings, setBillings] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  useEffect(() => {
    if (id) {
      // Find client
      const clients = getClients();
      const foundClient = clients.find(c => c.id.toString() === id);
      
      if (foundClient) {
        setClient(foundClient);
        document.title = `${foundClient.name} | PS2 Estate Nexus`;
        
        // Get client-related billings
        const clientBillings = getBillingsByClient(parseInt(id));
        setBillings(clientBillings);
        
        // Get client-related expenses
        const clientExpenses = getExpensesByClient(parseInt(id));
        setExpenses(clientExpenses);
      }
    }
  }, [id]);
  
  if (!client) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-semibold text-gray-700">Client not found</h2>
          <p className="text-gray-500 mt-2">The requested client could not be found</p>
          <Button 
            className="mt-4"
            onClick={() => navigate("/clients")}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Clients
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2"
            onClick={() => navigate("/clients")}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Clients
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-600">Client since {format(new Date(client.createdAt), "MMMM yyyy")}</p>
        </div>
        
        <Button>
          <Edit size={18} className="mr-2" />
          Edit Client
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Client Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="font-medium">{client.name}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
            
            {client.email && (
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
            )}
            
            {client.address && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="font-medium">{client.address}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="font-medium capitalize">{client.status}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Client Since</p>
                <p className="font-medium">{format(new Date(client.createdAt), "PPP")}</p>
              </div>
            </div>
            
            {client.notes && (
              <div className="flex items-start">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700">{client.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Plots Purchased</CardTitle>
              <CardDescription>Total number of plots</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ps2-primary">{client.plotsPurchased}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Spent</CardTitle>
              <CardDescription>Official (white) ledger</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-ps2-success">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                }).format(client.totalSpent)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Due Amount</CardTitle>
              <CardDescription>Pending payments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-500">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                }).format(client.dueAmount || 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="plots">Properties</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-6">
          {/* Billings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>All billing records for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Layout / Plot</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billings.length > 0 ? (
                      billings.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{format(new Date(bill.date), "MMM d, yyyy")}</TableCell>
                          <TableCell className="font-medium">{bill.invoiceNumber}</TableCell>
                          <TableCell>{bill.layoutName} / {bill.plotNumber}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: 0
                            }).format(bill.amount)}
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
                              size="sm"
                              onClick={() => navigate(`/billing/${bill.id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          No billing records found for this client
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>All expenses related to this client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Layout</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length > 0 ? (
                      expenses.map((expense, index) => (
                        <TableRow key={index}>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{expense.layout}</TableCell>
                          <TableCell>
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
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          No expenses found for this client
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plots">
          <Card>
            <CardHeader>
              <CardTitle>Properties Owned</CardTitle>
              <CardDescription>All plots and properties purchased by this client</CardDescription>
            </CardHeader>
            <CardContent>
              {client.properties && client.properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {client.properties.map((property: any, index: number) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{property.layoutName}</h3>
                            <p className="text-sm text-gray-500">Plot {property.plotNumber}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.status === "owned" 
                              ? "bg-green-100 text-green-800" 
                              : property.status === "pending" 
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-800"
                          }`}>
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Area</span>
                            <span>{property.areaSqft} sqft</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Purchase Date</span>
                            <span>{property.purchaseDate}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Price</span>
                            <span className="font-medium">
                              {new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: 'INR',
                                maximumFractionDigits: 0
                              }).format(property.price)}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-4"
                          onClick={() => navigate(`/layouts/${property.layoutId}`)}
                        >
                          View Layout
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No properties found for this client
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Client Documents</CardTitle>
                  <CardDescription>All documents related to this client</CardDescription>
                </div>
                <Button size="sm">Upload Document</Button>
              </div>
            </CardHeader>
            <CardContent>
              {client.documents && client.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <FileText className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.type} • {doc.size} • Uploaded on {doc.uploadDate}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No documents found for this client
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default ClientDetailPage;
