
import React, { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  isPositive?: boolean;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  isPositive = true,
  color = "bg-blue-500",
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <span className={`ml-2 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '↑' : '↓'} {change}
              </span>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          {icon}
        </div>
      </div>
      <div className={`h-1 ${color}`}></div>
    </div>
  );
};

export default StatCard;
