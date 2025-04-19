
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getPlotsSoldPerLayout } from '@/data/mockData';

const PlotsSoldChart = () => {
  const data = getPlotsSoldPerLayout();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Plots Sold per Layout</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
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
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} plots`, 'Sold']}
              labelFormatter={(label) => `Layout: ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar 
              dataKey="soldCount" 
              name="Plots Sold" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlotsSoldChart;
