
import * as React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  className?: string;
  height?: number;
  width?: number;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showTooltip?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

interface PieChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  className?: string;
  height?: number;
  width?: number;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showTooltip?: boolean;
  showLegend?: boolean;
}

export const BarChart: React.FC<ChartProps> = ({
  data,
  xKey,
  yKey,
  className,
  height = 300,
  width,
  colors = ["#3b82f6", "#10b981", "#f97316", "#f59e0b"],
  valueFormatter = (value: number) => value.toString(),
  showTooltip = true,
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
}) => {
  return (
    <div className={className} style={{ width: width || "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
          {showXAxis && <XAxis dataKey={xKey} />}
          {showYAxis && <YAxis />}
          {showTooltip && (
            <Tooltip
              formatter={(value: number) => [valueFormatter(value)]}
              contentStyle={{ background: "white", borderRadius: "8px" }}
            />
          )}
          {showLegend && <Legend />}
          <Bar dataKey={yKey}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LineChart: React.FC<ChartProps> = ({
  data,
  xKey,
  yKey,
  className,
  height = 300,
  width,
  colors = ["#3b82f6"],
  valueFormatter = (value: number) => value.toString(),
  showTooltip = true,
  showLegend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
}) => {
  return (
    <div className={className} style={{ width: width || "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.2} />}
          {showXAxis && <XAxis dataKey={xKey} />}
          {showYAxis && <YAxis />}
          {showTooltip && (
            <Tooltip
              formatter={(value: number) => [valueFormatter(value)]}
              contentStyle={{ background: "white", borderRadius: "8px" }}
            />
          )}
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={colors[0]}
            strokeWidth={2}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  nameKey,
  dataKey,
  className,
  height = 300,
  width,
  colors = ["#3b82f6", "#10b981", "#f97316", "#f59e0b", "#a855f7", "#ec4899"],
  valueFormatter = (value: number) => value.toString(),
  showTooltip = true,
  showLegend = true,
}) => {
  return (
    <div className={className} style={{ width: width || "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          {showTooltip && (
            <Tooltip
              formatter={(value: number) => [valueFormatter(value)]}
              contentStyle={{ background: "white", borderRadius: "8px" }}
            />
          )}
          {showLegend && <Legend />}
          <Pie
            data={data}
            nameKey={nameKey}
            dataKey={dataKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={(entry) => entry[nameKey]}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Custom tooltip component for charts
export function CustomTooltip({ active, payload, label }: { active: any; payload: any; label: any }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-sm">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }

  return null;
}
