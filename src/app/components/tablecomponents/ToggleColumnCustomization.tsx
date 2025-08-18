import React, { useState } from "react";
import { Column } from "../Datatables";

interface ToggleColumnCustomizationProps {
  open: boolean;
  columns: Column[];
  onSave: (newColumns: Column[]) => void;
  onClose: () => void;
}

const ToggleColumnCustomization: React.FC<ToggleColumnCustomizationProps> = ({ open, columns, onSave, onClose }) => {
  const [visibleMap, setVisibleMap] = useState<Record<string, boolean>>(() =>
    columns.reduce((acc, col) => {
      acc[col.accessor] = col.visible !== false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleColumn = (accessor: string) => {
    setVisibleMap((prev) => ({ ...prev, [accessor]: !prev[accessor] }));
  };

  const handleSave = () => {
    const newColumns = columns.map((col) => ({ ...col, visible: visibleMap[col.accessor] }));
    onSave(newColumns);
    onClose();
  };

  if (!open) return null;

  // Handler for clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/10" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg border border-gray-200 w-[20%] max-w-sm p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-zinc-700 text-xl font-bold px-1 transition-colors focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-5 text-zinc-800 text-center" style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif', letterSpacing: '-0.01em'}}>
          Customize Table Columns
        </h2>
        <div className="flex flex-col gap-3 mb-6">
          {columns.map((col) => (
            <label
              key={col.accessor}
              className="flex items-center gap-3 cursor-pointer text-base font-medium text-zinc-800 px-2 py-1 rounded-md hover:bg-zinc-50 transition"
              style={{fontFamily: 'Inter, Segoe UI, Arial, sans-serif'}}
            >
              <input
                type="checkbox"
                checked={visibleMap[col.accessor]}
                onChange={() => toggleColumn(col.accessor)}
                className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 transition-all duration-100"
              />
              <span className="select-none" style={{fontSize: '1rem'}}>{col.Header}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="w-full py-2 rounded-lg bg-zinc-700 text-white font-semibold text-base hover:bg-zinc-800 transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ToggleColumnCustomization;
