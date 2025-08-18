import React from 'react';

interface GlobalSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedColumn: string;
  setSelectedColumn: (col: string) => void;
  columns: { accessor: string; Header: string; searchable?: boolean }[];
}

const GlobalSearch: React.FC<GlobalSearchProps> = React.memo(({ searchQuery, setSearchQuery, selectedColumn, setSelectedColumn, columns }) => {
  // Find the selected column's Header for placeholder
  const selectedColObj = columns.find(col => col.accessor === selectedColumn);
  const placeholder = selectedColObj ? `Search ${selectedColObj.Header}` : 'Search...';

  return (
    <div className="flex gap-2 w-full sm:w-1/2">
      <select
        value={selectedColumn}
        onChange={e => setSelectedColumn(e.target.value)}
        className="p-2 border border-gray-300 rounded text-xs shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-label="Select column to search"
      >
        <option className="text-black" value="">All Columns</option>
        {columns.filter(col => col.searchable !== false).map(col => (
          <option className="text-black" key={col.accessor} value={col.accessor}>{col.Header}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 p-2 border border-gray-300 rounded text-xs shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
});

GlobalSearch.displayName = 'GlobalSearch';

export default GlobalSearch;
