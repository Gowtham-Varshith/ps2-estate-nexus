
import { useEffect, useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, FileText, Filter } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import SalesReportView from "@/components/reports/SalesReportView";
import RevenueReportView from "@/components/reports/RevenueReportView";
import InventoryReportView from "@/components/reports/InventoryReportView";
import ClientAnalyticsView from "@/components/reports/ClientAnalyticsView";
import { reportService } from "@/api/backendService";
import { addDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  const [reports, setReports] = useState({
    sales: null,
    revenue: null,
    inventory: null,
    clients: null
  });

  useEffect(() => {
    document.title = "Reports | PS2 Estate Nexus";
  }, []);

  const generateReport = async (type: string) => {
    setIsGenerating(true);
    
    try {
      let result;
      const filters = {
        startDate: dateRange.from?.toISOString().split('T')[0],
        endDate: dateRange.to?.toISOString().split('T')[0]
      };
      
      switch (type) {
        case 'sales':
          result = await reportService.getSalesReport(filters);
          setReports(prev => ({ ...prev, sales: result }));
          break;
        case 'revenue':
          result = await reportService.getRevenueReport(filters);
          setReports(prev => ({ ...prev, revenue: result }));
          break;
        case 'inventory':
          result = await reportService.getInventoryReport(filters);
          setReports(prev => ({ ...prev, inventory: result }));
          break;
        case 'clients':
          result = await reportService.getClientAnalytics(filters);
          setReports(prev => ({ ...prev, clients: result }));
          break;
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`);
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      toast.error(`Failed to generate ${type} report`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (type: string) => {
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded`);
  };

  return (
    <MainLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-gray-500">Generate and view comprehensive reports</p>
          </div>
          <div className="flex items-center space-x-2">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Options</h4>
                  {/* Additional filter options would go here */}
                  <div className="flex justify-end">
                    <Button size="sm">Apply</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Tabs
          defaultValue="sales"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            if (!reports[value]) {
              generateReport(value);
            }
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales Reports</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Reports</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
            <TabsTrigger value="clients">Client Analytics</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={() => generateReport(activeTab)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button
              disabled={!reports[activeTab]}
              onClick={() => downloadReport(activeTab)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <TabsContent value="sales" className="mt-2">
            <SalesReportView data={reports.sales} isLoading={isGenerating && activeTab === 'sales'} />
          </TabsContent>
          
          <TabsContent value="revenue" className="mt-2">
            <RevenueReportView data={reports.revenue} isLoading={isGenerating && activeTab === 'revenue'} />
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-2">
            <InventoryReportView data={reports.inventory} isLoading={isGenerating && activeTab === 'inventory'} />
          </TabsContent>
          
          <TabsContent value="clients" className="mt-2">
            <ClientAnalyticsView data={reports.clients} isLoading={isGenerating && activeTab === 'clients'} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
