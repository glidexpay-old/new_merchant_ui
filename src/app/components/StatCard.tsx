import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-1 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        {change !== undefined && (
          <div className="mt-2">
            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        )}
      </div>
      {icon && (
        <div className="p-2 bg-indigo-50 rounded-md">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
