import React from 'react';
import { Column } from '../Datatables';

interface ColumnFiltersProps {
  columns: Column[];
  filters: Record<string, string>;
  dateFilters: Record<string, { start?: string; end?: string }>;
  onFilterChange: (columnKey: string, value: string) => void;
  onDateFilterChange: (columnKey: string, type: 'start' | 'end', value: string) => void;
}

const ColumnFilters: React.FC<ColumnFiltersProps> = React.memo(({
  columns,
  filters,
  dateFilters,
  onFilterChange,
  onDateFilterChange
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {columns.filter(col => col.searchable !== false).map(col => (
        <div key={col.accessor} className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-gray-700">{col.Header}</label>
          {col.type === 'date' ? (
            <div className="flex space-x-2 items-center">
              <div className="flex items-center">
                <span className="mr-1 text-xs">From:</span>
                <input
                  type="date"
                  value={dateFilters[col.accessor]?.start || ''}
                  onChange={(e) => onDateFilterChange(col.accessor, 'start', e.target.value)}
                  className="p-1 border border-gray-300 rounded text-xs shadow-sm outline-0"
                />
              </div>
              <div className="flex items-center">
                <span className="mr-1 text-xs">To:</span>
                <input
                  type="date"
                  value={dateFilters[col.accessor]?.end || ''}
                  onChange={(e) => onDateFilterChange(col.accessor, 'end', e.target.value)}
                  className="p-1 border border-gray-300 rounded text-xs shadow-sm outline-0"
                />
              </div>
            </div>
          ) : (
            <input
              type="text"
              placeholder={`Filter ${col.Header}`}
              value={filters[col.accessor] || ''}
              onChange={(e) => onFilterChange(col.accessor, e.target.value)}
              className="p-1 border border-gray-300 rounded text-xs shadow-sm outline-0"
            />
          )}
        </div>
      ))}
    </div>
  );
});

ColumnFilters.displayName = 'ColumnFilters';

export default ColumnFilters;
