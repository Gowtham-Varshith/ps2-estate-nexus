
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RevenueReportProps {
  data: any;
  isLoading: boolean;
}

const RevenueReportView = ({ data, isLoading }: RevenueReportProps) => {
  if (isLoading) {
    return <RevenueReportSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-muted-foreground">Generate a revenue report to view data</p>
      </div>
    );
  }

  // Prepare data for charts
  const monthlyRevenueData = {
    labels: data.monthly.map((item) => item.month),
    datasets: [
      {
        label: "Revenue",
        data: data.monthly.map((item) => item.revenue / 100000), // Convert to lakhs
        backgroundColor: "#22c55e",
        borderColor: "#16a34a",
      },
      {
        label: "Expenses",
        data: data.monthly.map((item) => item.expenses / 100000), // Convert to lakhs
        backgroundColor: "#f87171",
        borderColor: "#ef4444",
      },
      {
        label: "Profit",
        data: data.monthly.map((item) => item.profit / 100000), // Convert to lakhs
        backgroundColor: "#60a5fa",
        borderColor: "#3b82f6",
      },
    ],
  };

  const expenseCategoryData = {
    labels: data.byCategory.map((item) => item.category),
    datasets: [
      {
        label: "Expenses by Category",
        data: data.byCategory.map((item) => item.amount / 100000), // Convert to lakhs
        backgroundColor: [
          "#f87171",
          "#fb923c",
          "#fbbf24",
          "#a3e635",
          "#22d3ee",
          "#a78bfa",
        ],
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

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.netProfit)}</div>
            <p className="text-sm text-muted-foreground">
              Profit Margin: {formatPercentage(data.summary.profitMargin)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={monthlyRevenueData} 
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
            <CardTitle>Expense Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-md">
              <PieChart data={expenseCategoryData} className="aspect-[16/9]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue & Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.monthly.map((month) => {
                const margin = (month.profit / month.revenue) * 100;
                return (
                  <TableRow key={month.month}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.revenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.expenses)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.profit)}</TableCell>
                    <TableCell className="text-right">{formatPercentage(margin)}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Total</TableCell>
                <TableCell className="text-right">{formatCurrency(data.summary.totalRevenue)}</TableCell>
                <TableCell className="text-right">{formatCurrency(data.summary.totalExpenses)}</TableCell>
                <TableCell className="text-right">{formatCurrency(data.summary.netProfit)}</TableCell>
                <TableCell className="text-right">{formatPercentage(data.summary.profitMargin)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const RevenueReportSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            {i === 3 && <Skeleton className="h-4 w-36 mt-1" />}
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-[350px] w-full max-w-md" />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default RevenueReportView;
