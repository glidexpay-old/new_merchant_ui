'use client';

import React, { useMemo } from 'react';
import { DataTable, TableColumn, TableAction } from '@/app/components/ui/DataTable';

// Legacy column interface from old Datatables component
export interface Column {
  Header: string;
  accessor: string;
  type?: 'text' | 'date';
  searchable?: boolean;
  sortable?: boolean;
  visible?: boolean;
  renderCell?: (cellData: unknown, rowData: Record<string, unknown>) => React.ReactNode;
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

// Legacy DataTableProps interface
export interface DataTableProps {
  data?: Array<Record<string, unknown>>;
  columns: Column[];
  pageSize?: number;
  className?: string;
  tableName?: string;
  fetchData?: (params: FetchParams) => Promise<{ data: Array<Record<string, unknown>>; totalEntries: number }>;
  enableGlobalSearch?: boolean;
  enableSorting?: boolean;
  enableExport?: boolean;
  infiniteScroll?: boolean;
  searchMode?: SearchMode;
  modalRenderer?: (row: Record<string, unknown>) => React.ReactNode;
  actions?: Array<{ label: string; onClick: (row: Record<string, unknown>, idx: number) => void }>;
  slidingRows?: boolean;
  expandedRow?: number | null;
  onExpandRow?: (rowIdx: number, row: Record<string, unknown>) => void;
  renderExpandedContent?: (row: Record<string, unknown>) => React.ReactNode;
}

/**
 * Legacy DataTable wrapper that maintains backward compatibility
 * while using the new modern DataTable component internally
 */
const Datatables: React.FC<DataTableProps> = ({
  data = [],
  columns,
  pageSize = 20,
  className = '',
  enableGlobalSearch = true,
  enableExport = false,
  actions = [],
  modalRenderer,
}) => {
  // Convert legacy columns to new format
  const convertedColumns: TableColumn[] = useMemo(() => {
    return columns
      .filter(col => col.visible !== false)
      .map((col, index) => ({
        key: col.accessor,
        title: col.Header,
        dataIndex: col.accessor,
        sortable: col.sortable !== false,
        ellipsis: true,
        render: col.renderCell
          ? (value: any, record: any, index: number) => col.renderCell!(value, record)
          : col.cellAction?.type === 'link'
          ? (value: any, record: any) => (
              <a
                href={col.cellAction!.url!(record)}
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {value}
              </a>
            )
          : col.cellAction?.type === 'modal'
          ? (value: any, record: any) => (
              <button
                onClick={() => col.cellAction!.onClick!(record)}
                className="text-blue-600 hover:text-blue-800 underline bg-none border-none cursor-pointer"
              >
                {value}
              </button>
            )
          : undefined,
      }));
  }, [columns]);

  // Convert legacy actions to new format
  const convertedActions: TableAction[] = useMemo(() => {
    return actions.map((action, index) => ({
      label: action.label,
      onClick: (record: any) => action.onClick(record, 0),
      type: 'primary' as const,
    }));
  }, [actions]);

  // Simple pagination state (for demo purposes - in real app this should come from parent)
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={`p-4 ${className}`}>
      <DataTable
        columns={convertedColumns}
        dataSource={paginatedData}
        searchable={enableGlobalSearch}
        exportable={enableExport}
        actions={convertedActions.length > 0 ? convertedActions : undefined}
        pagination={{
          current: currentPage,
          total: data.length,
          pageSize: pageSize,
          onPageChange: handlePageChange,
        }}
        size="middle"
      />
    </div>
  );
};

export default Datatables;