
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ClientAnalyticsProps {
  data: any;
  isLoading: boolean;
}

const ClientAnalyticsView = ({ data, isLoading }: ClientAnalyticsProps) => {
  if (isLoading) {
    return <ClientAnalyticsSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-muted-foreground">Generate a client analytics report to view data</p>
      </div>
    );
  }

  // Prepare data for charts
  const acquisitionData = {
    labels: data.acquisition.map((item) => item.source),
    datasets: [
      {
        label: "Client Acquisition Sources",
        data: data.acquisition.map((item) => item.count),
        backgroundColor: [
          "#3b82f6",
          "#22c55e",
          "#eab308",
          "#ef4444",
        ],
      },
    ],
  };

  const demographicsData = {
    labels: data.demographics.map((item) => item.location),
    datasets: [
      {
        label: "Client Demographics by Location",
        data: data.demographics.map((item) => item.count),
        backgroundColor: [
          "#60a5fa",
          "#34d399",
          "#fbbf24",
          "#a78bfa",
        ],
      },
    ],
  };

  const monthlyAcquisitionData = {
    labels: data.monthlyAcquisition.map((item) => item.month),
    datasets: [
      {
        label: "New Clients",
        data: data.monthlyAcquisition.map((item) => item.clients),
        backgroundColor: "#60a5fa",
        borderColor: "#3b82f6",
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalClients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Clients (Last Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.newClientsLastMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Repeat Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.repeatClients}</div>
            <p className="text-xs text-muted-foreground">
              {((data.summary.repeatClients / data.summary.totalClients) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Purchase Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.averagePurchaseValue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Client Acquisition Sources</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-xs">
              <PieChart data={acquisitionData} className="aspect-square" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Client Demographics by Location</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-full max-w-xs">
              <PieChart data={demographicsData} className="aspect-square" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Client Acquisition</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart 
            data={monthlyAcquisitionData} 
            className="aspect-[16/9]"
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Number of New Clients"
                  }
                }
              }
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Source Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.acquisition.map((source) => (
                  <TableRow key={source.source}>
                    <TableCell className="font-medium">{source.source}</TableCell>
                    <TableCell className="text-right">{source.count}</TableCell>
                    <TableCell className="text-right">{source.percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Location Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.demographics.map((location) => (
                  <TableRow key={location.location}>
                    <TableCell className="font-medium">{location.location}</TableCell>
                    <TableCell className="text-right">{location.count}</TableCell>
                    <TableCell className="text-right">{location.percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ClientAnalyticsSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            {i === 3 && <Skeleton className="h-3 w-20 mt-1" />}
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-52" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default ClientAnalyticsView;
