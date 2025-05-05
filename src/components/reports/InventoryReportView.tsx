
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface InventoryReportProps {
  data: any;
  isLoading: boolean;
}

const InventoryReportView = ({ data, isLoading }: InventoryReportProps) => {
  if (isLoading) {
    return <InventoryReportSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-muted-foreground">Generate an inventory report to view data</p>
      </div>
    );
  }

  // Prepare data for charts
  const layoutData = {
    labels: data.byLayout.map((item) => item.layout),
    datasets: [
      {
        label: "Available Plots",
        data: data.byLayout.map((item) => item.available),
        backgroundColor: "#60a5fa",
      },
      {
        label: "Sold Plots",
        data: data.byLayout.map((item) => item.sold),
        backgroundColor: "#f87171",
      },
    ],
  };

  const facingData = {
    labels: data.byFacing.map((item) => item.facing),
    datasets: [
      {
        label: "Plot Distribution by Facing",
        data: data.byFacing.map((item) => item.total),
        backgroundColor: [
          "#3b82f6",
          "#ef4444",
          "#22c55e",
          "#eab308",
        ],
      },
    ],
  };

  const sizeData = {
    labels: data.bySize.map((item) => item.size),
    datasets: [
      {
        label: "Available Plots",
        data: data.bySize.map((item) => item.available),
        backgroundColor: "#60a5fa",
      },
      {
        label: "Sold Plots",
        data: data.bySize.map((item) => item.sold),
        backgroundColor: "#f87171",
      },
    ],
  };

  const formatArea = (areaInSqFt) => {
    return `${areaInSqFt.toLocaleString()} sqft`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Plots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalPlots}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sold Plots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.soldPlots}</div>
            <p className="text-xs text-muted-foreground">
              {((data.summary.soldPlots / data.summary.totalPlots) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Plots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.availablePlots}</div>
            <p className="text-xs text-muted-foreground">
              {((data.summary.availablePlots / data.summary.totalPlots) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reserved Plots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.reservedPlots}</div>
            <p className="text-xs text-muted-foreground">
              {((data.summary.reservedPlots / data.summary.totalPlots) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatArea(data.summary.totalArea)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Inventory by Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={layoutData} className="aspect-[21/9]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plot Facing Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart data={facingData} className="aspect-square" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory by Plot Size</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={sizeData} className="aspect-[16/9]" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Details by Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layout</TableHead>
                <TableHead className="text-right">Total Plots</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">% Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byLayout.map((layout) => (
                <TableRow key={layout.layout}>
                  <TableCell className="font-medium">{layout.layout}</TableCell>
                  <TableCell className="text-right">{layout.total}</TableCell>
                  <TableCell className="text-right">{layout.sold}</TableCell>
                  <TableCell className="text-right">{layout.available}</TableCell>
                  <TableCell className="text-right">{((layout.sold / layout.total) * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Total</TableCell>
                <TableCell className="text-right">{data.summary.totalPlots}</TableCell>
                <TableCell className="text-right">{data.summary.soldPlots}</TableCell>
                <TableCell className="text-right">{data.summary.availablePlots}</TableCell>
                <TableCell className="text-right">{((data.summary.soldPlots / data.summary.totalPlots) * 100).toFixed(1)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const InventoryReportSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
            {(i === 2 || i === 3 || i === 4) && <Skeleton className="h-3 w-20 mt-1" />}
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex justify-center">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-44" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-52" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default InventoryReportView;
