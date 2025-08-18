import React from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface GraphProps {
  data: DataPoint[];
  title: string;
  type: "bar" | "line";
  height?: number;
  color?: string;
}

const Graph: React.FC<GraphProps> = ({ 
  data, 
  title, 
  type, 
  height = 200, 
  color = "#4F46E5" 
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="relative" style={{ height: `${height}px` }}>
        <div className="flex items-end justify-between h-full">
          {data.map((item, index) => {
            const heightPercentage = (item.value / maxValue) * 100;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                {type === "bar" ? (
                  <div 
                    className="w-full mx-1 rounded-t-sm transition-all duration-300 hover:opacity-80"
                    style={{ 
                      height: `${heightPercentage}%`, 
                      backgroundColor: color,
                      minHeight: '4px'
                    }}
                  />
                ) : (
                  <div className="relative w-full">
                    {index > 0 && (
                      <div 
                        className="absolute bottom-0 left-0 w-full h-1 -translate-y-1/2"
                        style={{ 
                          bottom: `${heightPercentage}%`,
                          transform: 'translateY(50%)',
                          zIndex: 1
                        }}
                      >
                        <div 
                          className="absolute h-2 w-2 rounded-full -left-1"
                          style={{ backgroundColor: color }}
                        />
                        {index < data.length - 1 && (
                          <div 
                            className="absolute h-0.5 w-full"
                            style={{ backgroundColor: color }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
                <span className="text-xs text-gray-500 mt-1">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Graph;
