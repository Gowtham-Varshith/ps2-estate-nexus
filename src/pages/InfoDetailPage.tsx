
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Calendar, Send, Download } from "lucide-react";
import { toast } from "sonner";

const InfoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call to /api/info/{id}
    setTimeout(() => {
      // Dummy data
      setInfo({
        id,
        name: "Ramesh Kumar",
        type: "Client",
        phone: "9876543210",
        email: "ramesh@example.com",
        location: "Guntur",
        language: "Telugu",
        transactions: 12,
        revenue: 520000,
        expenses: 0,
        lastActivity: "2025-04-22",
        plots: [
          { id: 1, number: "GV001", layout: "PS2", status: "Sold", area: 1200 },
          { id: 2, number: "GV010", layout: "PS2", status: "Pending", area: 1500 }
        ],
        bills: [
          { id: 1, date: "2025-04-10", amount: 250000, status: "Paid", plotNumber: "GV001" },
          { id: 2, date: "2025-04-22", amount: 270000, status: "Pending", plotNumber: "GV010" }
        ],
        activities: [
          { id: 1, date: "2025-04-22", type: "Bill", description: "Created bill for Plot GV010" },
          { id: 2, date: "2025-04-10", type: "Payment", description: "Received payment for Plot GV001" },
          { id: 3, date: "2025-04-05", type: "Visit", description: "Client visited PS2 Layout" }
        ]
      });
      
      setLoading(false);
      document.title = `Info: Ramesh Kumar | PS2 Estate Nexus`;
    }, 800);
  }, [id]);
  
  const handleSendWhatsApp = () => {
    toast.success("WhatsApp message sent in Telugu (auto-detected)");
  };
  
  const handleDownloadReport = () => {
    toast.success("Report generated and downloaded");
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{info.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {info.type}
            </span>
            {info.phone && (
              <span className="text-sm text-gray-500">
                {info.phone}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSendWhatsApp} className="gap-2">
            <Send size={16} />
            Send WhatsApp
          </Button>
          <Button onClick={handleDownloadReport} className="gap-2">
            <Download size={16} />
            Download Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Linked Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <FileText className="text-blue-500 mr-2" size={20} />
              {info.transactions}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center">
              <DollarSign className="text-green-500 mr-2" size={20} />
              ₹{info.revenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Last Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              <Calendar className="text-blue-500 mr-2" size={20} />
              {new Date(info.lastActivity).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="activities" className="w-full">
        <TabsList>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="plots">Plots</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {info.activities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start p-3 border-b border-gray-100 last:border-0">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center mr-3
                      ${activity.type === 'Bill' ? 'bg-blue-100 text-blue-600' : 
                        activity.type === 'Payment' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'}
                    `}>
                      {activity.type === 'Bill' ? <FileText size={18} /> : 
                       activity.type === 'Payment' ? <DollarSign size={18} /> :
                       <Calendar size={18} />}
                    </div>
                    <div>
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plots">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 border-b text-gray-600">Plot No</th>
                      <th className="text-left p-3 border-b text-gray-600">Layout</th>
                      <th className="text-left p-3 border-b text-gray-600">Area (sq.ft)</th>
                      <th className="text-left p-3 border-b text-gray-600">Status</th>
                      <th className="text-left p-3 border-b text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.plots.map((plot: any) => (
                      <tr key={plot.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{plot.number}</td>
                        <td className="p-3 border-b">{plot.layout}</td>
                        <td className="p-3 border-b">{plot.area}</td>
                        <td className="p-3 border-b">
                          <span className={`px-2 py-1 rounded-full text-xs
                            ${plot.status === 'Sold' ? 'bg-green-100 text-green-800' : 
                             plot.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                             'bg-blue-100 text-blue-800'}
                          `}>
                            {plot.status}
                          </span>
                        </td>
                        <td className="p-3 border-b">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bills">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 border-b text-gray-600">Date</th>
                      <th className="text-left p-3 border-b text-gray-600">Plot</th>
                      <th className="text-left p-3 border-b text-gray-600">Amount</th>
                      <th className="text-left p-3 border-b text-gray-600">Status</th>
                      <th className="text-left p-3 border-b text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.bills.map((bill: any) => (
                      <tr key={bill.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{new Date(bill.date).toLocaleDateString()}</td>
                        <td className="p-3 border-b">{bill.plotNumber}</td>
                        <td className="p-3 border-b">₹{bill.amount.toLocaleString()}</td>
                        <td className="p-3 border-b">
                          <span className={`px-2 py-1 rounded-full text-xs
                            ${bill.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                             bill.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                             'bg-red-100 text-red-800'}
                          `}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="p-3 border-b">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">View</Button>
                            <Button variant="ghost" size="sm" className="text-green-600">WhatsApp</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No documents found</h3>
              <p className="text-gray-500 mt-1 mb-4">Upload documents related to this contact</p>
              <Button>Upload Document</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default InfoDetailPage;
