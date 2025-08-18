"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GlobalSearch from './tablecomponents/GlobalSearch';
import Table from './tablecomponents/Table';
import Modal from './tablecomponents/Modal';

// Simplified Column interface to remove generic constraints
export interface Column {
  Header: string;
  accessor: string; // Simplified to always use string
  type?: 'text' | 'date';
  searchable?: boolean;
  sortable?: boolean;
  visible?: boolean; // Add visible property for column hiding
  // Optional custom renderer for the cell.
  renderCell?: (cellData: unknown, rowData: Record<string, unknown>) => React.ReactNode;
  // Optional cell action: either open an external link or a modal.
  cellAction?: {
    type: 'link' | 'modal';
    url?: (rowData: Record<string, unknown>) => string;
    onClick?: (rowData: Record<string, unknown>) => void;
  };
}

export type SortDirection = 'asc' | 'desc' | null;
export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export interface FetchParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  filters: Record<string, string>;
  dateFilters: Record<string, { start?: string; end?: string }>;
  sortState: SortState;
}

export type SearchMode = 'local' | 'api' | 'hybrid';

// Simplified DataTableProps to remove generic constraints
export interface DataTableProps {
  data?: Array<Record<string, unknown>>;
  columns: Column[];
  pageSize?: number;
  className?: string;
  tableName?: string;
  // If provided, enables API-based fetching.
  fetchData?: (params: FetchParams) => Promise<{ data: Array<Record<string, unknown>>; totalEntries: number }>;
  // Feature flags.
  enableGlobalSearch?: boolean;
  enableSorting?: boolean;
  enableExport?: boolean;
  // Use infinite scrolling instead of traditional pagination.
  infiniteScroll?: boolean;
  // Determines how global search is performed.
  searchMode?: SearchMode;
  // Custom modal renderer.
  modalRenderer?: (row: Record<string, unknown>) => React.ReactNode;
  actions?: Array<{ label: string; onClick: (row: Record<string, unknown>, idx: number) => void }>;
  // Enable sliding/expandable rows
  slidingRows?: boolean;
  // Expandable row props
  expandedRow?: number | null;
  onExpandRow?: (rowIdx: number, row: Record<string, unknown>) => void;
  renderExpandedContent?: (row: Record<string, unknown>) => React.ReactNode;
}

const DataTable: React.FC<DataTableProps> = ({
  data = [],
  columns,
  pageSize = 20,
  className = '',
  fetchData,
  enableGlobalSearch = true,
  enableSorting = true,
  infiniteScroll = true,
  searchMode = fetchData ? 'api' : 'local',
  modalRenderer,
  actions = [],
  slidingRows = false,
}) => {
  // For API mode and hybrid search, we load pages incrementally.
  const [localData, setLocalData] = useState<Array<Record<string, unknown>>>(data);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [filters] = useState<Record<string, string>>({});
  const [dateFilters] = useState<Record<string, { start?: string; end?: string }>>({});
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  // currentPage indicates how many pages have been loaded (in infinite scrolling, multiplied by pageSize)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalEntries, setTotalEntries] = useState<number>(data.length);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // For column customization.
  const [customColumns, setCustomColumns] = useState<Column[]>(columns);
  // ...existing code...
  // Modal state.
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Record<string, unknown> | null>(null);

  // Update customColumns if the columns prop changes.
  useEffect(() => {
    setCustomColumns(columns);
  }, [columns]);

  // Compute visible columns for the table (those that are checked in customization)
  const visibleColumns = useMemo(() =>
    customColumns.filter(col => col.visible !== false),
    [customColumns]
  );

  // Client-side filtering (if data is local) – computed using customColumns and filters.
  const computedData = useMemo(() => {
    let tempData = [...data];

    if (searchQuery) {
      if (selectedColumn) {
        tempData = tempData.filter(row =>
          String(row[selectedColumn]).toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        tempData = tempData.filter(row =>
          customColumns.filter(col => col.searchable !== false).some(col =>
            String(row[col.accessor]).toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
    }

    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];
      if (filterValue) {
        tempData = tempData.filter(row =>
          String(row[key]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    // Updated date parsing to ensure proper type casting
    Object.keys(dateFilters).forEach(key => {
      const { start, end } = dateFilters[key];
      if (start || end) {
        tempData = tempData.filter(row => {
          const rowDate = new Date(row[key] as string | number | Date);
          if (!rowDate || isNaN(rowDate.getTime())) return false;
          if (start && end) {
            return rowDate >= new Date(start) && rowDate <= new Date(end);
          } else if (start) {
            return rowDate >= new Date(start);
          } else if (end) {
            return rowDate <= new Date(end);
          }
          return true;
        });
      }
    });

    if (enableSorting && sortState.column && sortState.direction) {
      tempData.sort((a, b) => {
        const aValue = a[sortState.column!];
        const bValue = b[sortState.column!];
        const col = customColumns.find(col => col.accessor === sortState.column);
        if (col?.type === 'date') {
          const dateA = new Date(aValue as string | number | Date).getTime();
          const dateB = new Date(bValue as string | number | Date).getTime();
          return sortState.direction === 'asc' ? dateA - dateB : dateB - dateA;
        } else {
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
          } else {
            const strA = String(aValue).toLowerCase();
            const strB = String(bValue).toLowerCase();
            return sortState.direction === 'asc'
              ? strA.localeCompare(strB)
              : strB.localeCompare(strA);
          }
        }
      });
    }

    return tempData;
  }, [data, customColumns, searchQuery, selectedColumn, filters, dateFilters, sortState, enableSorting]);

  // Decide which dataset to use:
  // For 'local' or hybrid (with local results), use computedData.
  // Otherwise, use API fetched data stored in localData.
  useEffect(() => {
    if (searchMode === 'local' || (searchMode === 'hybrid' && computedData.length > 0)) {
      setTotalEntries(computedData.length);
    }
  }, [searchMode, computedData.length]);

  const allData = useMemo(() => {
    if (searchMode === 'local' || (searchMode === 'hybrid' && computedData.length > 0)) {
      return computedData;
    }
    return localData;
  }, [searchMode, computedData, localData]);

  // Displayed data is a slice of allData determined by infinite scrolling.
  const displayData = useMemo(() => {
    return allData.slice(0, currentPage * pageSize);
  }, [allData, currentPage, pageSize]);

  // Load data from API if needed.
  const loadData = useCallback(async () => {
    if ((searchMode === 'api' || (searchMode === 'hybrid' && computedData.length === 0)) && fetchData) {
      setIsLoading(true);
      try {
        const result = await fetchData({
          page: currentPage,
          pageSize,
          searchQuery,
          filters,
          dateFilters,
          sortState,
        });
        if (currentPage === 1) {
          setLocalData(result.data);
        } else {
          setLocalData(prev => [...prev, ...result.data]);
        }
        setTotalEntries(result.totalEntries);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentPage, pageSize, searchQuery, filters, dateFilters, sortState, fetchData, searchMode, computedData.length]);

  // Reset currentPage to 1 when search/filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, dateFilters, sortState]);

  // Load data when currentPage or dependencies change
  useEffect(() => {
    loadData();
  }, [currentPage, loadData]);

  // Infinite scrolling: observe a sentinel element at the bottom.
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!infiniteScroll) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && displayData.length < totalEntries) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    const currentRef = loadMoreRef.current; // Copy ref to a variable
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [displayData, isLoading, totalEntries, infiniteScroll]);

  // Handlers.
  const handleSort = useCallback((columnKey: string) => {
    if (!enableSorting) return;
    const col = customColumns.find(col => col.accessor === columnKey);
    if (col?.sortable === false) return;
    setSortState(prev => {
      if (prev.column === columnKey) {
        if (prev.direction === 'asc') return { column: columnKey, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column: columnKey, direction: 'asc' };
    });
  }, [enableSorting, customColumns]);



  // Cell click for modal actions.
  const handleCellClick = useCallback((rowData: Record<string, unknown>, column: Column) => {
    if (column.cellAction?.type === 'modal') {
      if (column.cellAction.onClick) {
        column.cellAction.onClick(rowData);
      } else {
        setModalData(rowData);
        setIsModalOpen(true);
      }
    }
  }, []);

  return (
    <div className={`p-2 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2">
          {enableGlobalSearch && (
            <GlobalSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedColumn={selectedColumn}
              setSelectedColumn={setSelectedColumn}
              columns={customColumns}
            />
          )}
      </div>

      <Table
        columns={visibleColumns}
        data={displayData}
        sortState={sortState}
        onSort={handleSort}
        onCellClick={handleCellClick}
        enableSorting={enableSorting}
        actions={actions}
        slidingRows={slidingRows}
        pageSize={pageSize} // Added pageSize prop for pagination
      />

      {infiniteScroll && (
        <div ref={loadMoreRef} className="h-4"></div>
      )}

      {isLoading && (
        <div className="text-center mt-1 text-xs text-gray-600">Loading...</div>
      )}

      {isModalOpen && modalData && (
        <Modal onClose={() => { setIsModalOpen(false); setModalData(null); }}>
          {modalRenderer ? modalRenderer(modalData) : (
            <div>
              <h2 className="text-base font-bold mb-2">Row Details</h2>
              <pre className="text-xs">{JSON.stringify(modalData, null, 2)}</pre>
            </div>
          )}
        </Modal>
      )}

        {/* Customise button and modal removed as requested */}
    </div>
  );
};

export default DataTable;
