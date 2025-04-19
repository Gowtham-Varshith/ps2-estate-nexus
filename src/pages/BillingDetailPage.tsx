
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Printer, Edit, Check, Clock } from "lucide-react";
import { getBillings, getLayouts } from "@/data/mockData";
import { format } from "date-fns";

const BillingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [billing, setBilling] = useState<any>(null);
  const [layout, setLayout] = useState<any>(null);
  
  useEffect(() => {
    document.title = "Billing Details | PS2 Estate Nexus";
    
    // Find the billing record
    const billings = getBillings();
    const found = billings.find(bill => bill.id.toString() === id);
    
    if (found) {
      setBilling(found);
      
      // Find the related layout
      const layouts = getLayouts();
      const relatedLayout = layouts.find(l => l.id === found.layoutId);
      setLayout(relatedLayout);
    }
  }, [id]);
  
  if (!billing) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-semibold text-gray-700">Billing record not found</h2>
          <p className="text-gray-500 mt-2">The requested billing record could not be found</p>
          <Button 
            className="mt-4"
            onClick={() => navigate("/billing")}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Billing Records
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  // Check if this is a black entry and if user has access
  if (billing.isBlackEntry && currentUser?.role === "staff") {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500 mt-2">You don't have permission to view this billing record</p>
          <Button 
            className="mt-4"
            onClick={() => navigate("/billing")}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Billing Records
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
            onClick={() => navigate("/billing")}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Billing Records
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Invoice #{billing.invoiceNumber}</h1>
          <p className="text-gray-600">
            {layout ? layout.name : 'Unknown Layout'} - {billing.plotNumber}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer size={18} className="mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download size={18} className="mr-2" />
            Download
          </Button>
          {(currentUser?.role !== "staff" || 
            (new Date().getTime() - new Date(billing.date).getTime() < 24 * 60 * 60 * 1000)) && (
            <Button>
              <Edit size={18} className="mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>
                  Created on {format(new Date(billing.date), "PPP")}
                </CardDescription>
              </div>
              
              <div className={`px-3 py-1 rounded-full flex items-center ${
                billing.isPaid 
                  ? "bg-green-100 text-green-800" 
                  : "bg-amber-100 text-amber-800"
              }`}>
                {billing.isPaid ? (
                  <>
                    <Check size={16} className="mr-1" />
                    <span>Paid</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} className="mr-1" />
                    <span>Due</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                <p className="font-medium">PS2 Estate Nexus</p>
                <p>123 Property Lane</p>
                <p>Hyderabad, Telangana 500001</p>
                <p>GSTIN: 12ABCDE3456F7Z8</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Bill To</h3>
                <p className="font-medium">{billing.clientName}</p>
                <p>{billing.clientPhone || "Phone not provided"}</p>
                <p>{billing.clientAddress || "Address not provided"}</p>
                {billing.clientGSTIN && <p>GSTIN: {billing.clientGSTIN}</p>}
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Area (sqft)</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Rate/sqft</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <p className="font-medium">Plot {billing.plotNumber}</p>
                      <p className="text-gray-600">{layout?.name || 'Unknown Layout'}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right">
                      {billing.areaSqft}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(billing.ratePerSqft)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(billing.amount)}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }).format(billing.amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {billing.isBlackEntry && (
              <div className="bg-black bg-opacity-5 border border-black border-opacity-10 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-black mr-2"></div>
                  <p className="text-sm font-medium">Black Entry Record</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This record is part of the black ledger and is only visible to Black and Admin roles.
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {billing.notes || "No additional notes provided."}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Status</p>
              <p className="font-medium">{billing.isPaid ? "Paid" : "Due"}</p>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium text-gray-500">Payment Type</p>
              <p className="font-medium">{billing.paymentType}</p>
            </div>
            
            {billing.paymentType === "Advance" && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="font-medium">
                    {billing.dueDate ? format(new Date(billing.dueDate), "PPP") : "Not specified"}
                  </p>
                </div>
              </>
            )}
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium text-gray-500">Transactions</p>
              
              {billing.transactions && billing.transactions.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {billing.transactions.map((transaction: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                      <div className="flex justify-between">
                        <span>{format(new Date(transaction.date), "MMM d, yyyy")}</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            maximumFractionDigits: 0
                          }).format(transaction.amount)}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {transaction.method} - {transaction.reference || "No reference"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No transactions recorded</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button className="w-full">Record Payment</Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BillingDetailPage;
