import React, { ReactNode } from "react";

interface CardProps {
  title: string;
  value?: ReactNode;
  icon?: ReactNode;
  trend?: ReactNode;
  trendValue?: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  value,
  icon,
  description,
  actions,
  className = "",
  children,
}) => {
  return (
    <div
      className={`rounded-lg pay-card shadow-md p-6 flex flex-col gap-2 ${className}`}
      
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      {value && <div className="text-3xl font-bold mb-1">{value}</div>}
      {description && <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{description}</div>}
      {children && <div>{children}</div>}
    </div>
  );
};

export default Card;
