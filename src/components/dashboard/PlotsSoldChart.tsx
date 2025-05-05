
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyticsApi } from '@/api/apiClient';

interface PlotSoldData {
  layoutId: number;
  layoutName: string;
  soldCount: number;
  totalPlots: number;
}

const PlotsSoldChart = () => {
  const [plotsData, setPlotsData] = useState<PlotSoldData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const fetchPlotsSold = async () => {
      try {
        setIsLoading(true);
        const dashboardData = await analyticsApi.getDashboardData();
        setPlotsData(dashboardData.plotsSold);
        setError("");
      } catch (err) {
        console.error("Failed to load plots sold data", err);
        setError("Failed to load chart data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlotsSold();
  }, []);

  // Custom tooltip to display available plots as well
  // @ts-ignore (to handle Recharts typing issues)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const availablePlots = data.totalPlots - data.soldCount;
      
      return (
        <div className="bg-white p-4 border rounded shadow-md">
          <p className="font-semibold">{label}</p>
          <p className="text-green-600">Sold: {data.soldCount}</p>
          <p className="text-blue-600">Available: {availablePlots}</p>
          <p className="text-gray-600">Total: {data.totalPlots}</p>
        </div>
      );
    }
  
    return null;
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Plots Sold per Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ps2-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Plots Sold per Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (plotsData.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Plots Sold per Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80 flex items-center justify-center text-gray-500">
            <p>No plot data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Plots Sold per Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={plotsData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 70,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="layoutName" 
                angle={-45} 
                textAnchor="end"
                tick={{ fontSize: 12 }}
                height={70}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="soldCount" name="Plots Sold" fill="#16a34a" />
              <Bar 
                dataKey={(data) => data.totalPlots - data.soldCount} 
                name="Available Plots" 
                fill="#3b82f6" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlotsSoldChart;
