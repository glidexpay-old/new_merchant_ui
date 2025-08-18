import React from 'react';

interface ExportButtonsProps {
  data: object[];
  fileName: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = React.memo(({ data, fileName }) => {
  const exportToCSV = () => {
    const csvContent = data.map((row) => Object.values(row).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
  };

  const exportToExcel = () => {
    // Placeholder for Excel export logic
    alert("Export to Excel is not implemented yet.");
  };

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.json`;
    link.click();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToCSV}
        className="px-2 py-1 bg-green-600 text-white rounded text-xs shadow-sm hover:bg-green-700 transition-colors"
      >
        Export CSV
      </button>
      <button
        onClick={exportToExcel}
        className="px-2 py-1 bg-blue-600 text-white rounded text-xs shadow-sm hover:bg-blue-700 transition-colors"
      >
        Export Excel
      </button>
      <button
        onClick={exportToJSON}
        className="px-2 py-1 bg-gray-600 text-white rounded text-xs shadow-sm hover:bg-gray-700 transition-colors"
      >
        Export JSON
      </button>
    </div>
  );
});

ExportButtons.displayName = 'ExportButtons';

export default ExportButtons;
