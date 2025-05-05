
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SalesReportProps {
  data: any;
  isLoading: boolean;
}

const SalesReportView = ({ data, isLoading }: SalesReportProps) => {
  if (isLoading) {
    return <SalesReportSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-muted-foreground">Generate a sales report to view data</p>
      </div>
    );
  }

  // Prepare data for charts
  const monthlySalesData = {
    labels: data.monthly.map((item) => item.month),
    datasets: [
      {
        label: "Sales (₹)",
        data: data.monthly.map((item) => item.sales / 100000), // Convert to lakhs
        backgroundColor: "#818cf8",
        borderColor: "#4f46e5",
      },
      {
        label: "Plots Sold",
        data: data.monthly.map((item) => item.plots),
        backgroundColor: "#a78bfa",
        borderColor: "#7c3aed",
      },
    ],
  };

  const layoutSalesData = {
    labels: data.byLayout.map((item) => item.layout),
    datasets: [
      {
        label: "Sales by Layout (₹ in Lakhs)",
        data: data.byLayout.map((item) => item.sales / 100000), // Convert to lakhs
        backgroundColor: ["#818cf8", "#a78bfa", "#c4b5fd", "#ddd6fe"],
      },
    ],
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plots Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalPlotsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Sale Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.averageSalePrice)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.highestSale)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={monthlySalesData} 
              className="aspect-[16/9]"
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Amount (₹ in Lakhs)"
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales by Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={layoutSalesData} className="aspect-[16/9]" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layout</TableHead>
                <TableHead>Plots Sold</TableHead>
                <TableHead className="text-right">Sales Amount</TableHead>
                <TableHead className="text-right">Avg. Price per Plot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byLayout.map((layout) => (
                <TableRow key={layout.layout}>
                  <TableCell className="font-medium">{layout.layout}</TableCell>
                  <TableCell>{layout.plots}</TableCell>
                  <TableCell className="text-right">{formatCurrency(layout.sales)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(layout.sales / layout.plots)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Total</TableCell>
                <TableCell>{data.summary.totalPlotsSold}</TableCell>
                <TableCell className="text-right">{formatCurrency(data.summary.totalSales)}</TableCell>
                <TableCell className="text-right">{formatCurrency(data.summary.averageSalePrice)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const SalesReportSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default SalesReportView;
