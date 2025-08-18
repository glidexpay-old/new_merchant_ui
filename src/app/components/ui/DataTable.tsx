'use client';

import React, { useState, useMemo } from 'react';

export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: Record<string, unknown>, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  ellipsis?: boolean;
  textColor?: (record: any) => string;
}

export interface TableAction {
  label: string;
  onClick: (record: Record<string, unknown>) => void;
  type?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
  disabled?: (record: any) => boolean;
}

export interface DataTableProps {
  columns: TableColumn[];
  dataSource: Array<Record<string, unknown>>;
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    onPageChange?: (page: number, pageSize: number) => void;
  };
  rowSelection?: {
    type: 'checkbox' | 'radio';
    selectedRowKeys?: React.Key[];
    onChange?: (selectedRowKeys: React.Key[], selectedRows: any[]) => void;
  };
  actions?: TableAction[];
  searchable?: boolean;
  exportable?: boolean;
  onExport?: (data: any[]) => void;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  emptyText?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  dataSource,
  loading = false,
  pagination,
  rowSelection,
  actions,
  searchable = false,
  exportable = false,
  onExport,
  className = '',
  size = 'middle',
  emptyText = 'No data available',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return dataSource;
    return dataSource.filter((item) =>
      Object.values(item).some((value) =>
        String(value ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataSource, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      // Type guards for sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      // Fallback: compare as strings
      const strA = String(aValue ?? '');
      const strB = String(bValue ?? '');
      return sortConfig.direction === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === key) {
        return prevConfig.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleRowSelection = (rowKey: React.Key, checked: boolean) => {
    if (rowSelection?.type === 'radio') {
      setSelectedRows(checked ? [rowKey] : []);
    } else {
      setSelectedRows((prev) =>
        checked ? [...prev, rowKey] : prev.filter((key) => key !== rowKey)
      );
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(sortedData.map((_, index) => index));
    } else {
      setSelectedRows([]);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getPaddingClasses = () => {
    switch (size) {
      case 'small': return 'px-3 py-2';
      case 'large': return 'px-6 py-4';
      default: return 'px-4 py-3';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
   <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
  {/* Header with search and export */}
  {(searchable || exportable) && (
    <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      {searchable && (
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
          />
        </div>
      )}
      {exportable && (
        <button
          onClick={() => onExport?.(sortedData)}
          className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </button>
      )}
    </div>
  )}

  {/* Table Container */}
  <div className="overflow-x-auto">
    <table className={`min-w-full divide-y divide-gray-200 ${getSizeClasses()}`}>
      <thead className="bg-gray-50">
        <tr>
          {rowSelection && (
            <th className={`${getPaddingClasses()} text-left text-xs font-medium text-gray-500 uppercase tracking-wider`}>
              {rowSelection.type === 'checkbox' && (
                <input
                  type="checkbox"
                  checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              )}
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key}
              className={`${getPaddingClasses()} text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
              }`}
              style={{ width: column.width }}
              onClick={() => column.sortable && handleSort(column.dataIndex)}
            >
              <div className="flex items-center space-x-1.5">
                <span>{column.title}</span>
                {column.sortable && (
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                )}
              </div>
            </th>
          ))}
          {actions && actions.length > 0 && (
            <th className={`${getPaddingClasses()} text-right text-xs font-medium text-gray-500 uppercase tracking-wider`}>
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {sortedData.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length + (rowSelection ? 1 : 0) + (actions?.length ? 1 : 0)}
              className={`${getPaddingClasses()} text-center text-gray-500 py-12`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg className="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">{emptyText}</p>
              </div>
            </td>
          </tr>
        ) : (
          sortedData.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              {rowSelection && (
                <td className={`${getPaddingClasses()} whitespace-nowrap`}>
                  <input
                    type={rowSelection.type}
                    checked={selectedRows.includes(index)}
                    onChange={(e) => handleRowSelection(index, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`${getPaddingClasses()} ${column.ellipsis ? 'truncate max-w-xs' : ''}`}
                  style={{ textAlign: column.align || 'left' }}
                >
                  <div className={`text-sm ${column.textColor?.(record) || 'text-gray-900'}`}>
                    {column.render
                      ? column.render(record[column.dataIndex], record, index)
                      : String(record[column.dataIndex] ?? '')}
                  </div>
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className={`${getPaddingClasses()} text-right whitespace-nowrap`}>
                  <div className="flex items-center justify-end space-x-2">
                    {actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => action.onClick(record)}
                        disabled={action.disabled?.(record)}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          action.type === 'danger'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50'
                            : action.type === 'secondary'
                            ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50'
                        }`}
                        title={action.label}
                      >
                        {action.icon && <span className={action.label ? 'mr-1.5' : ''}>{action.icon}</span>}
                        {action.label && <span className="hidden sm:inline">{action.label}</span>}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination */}
  {pagination && (
    <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium">{(pagination.current - 1) * pagination.pageSize + 1}</span> to{' '}
        <span className="font-medium">{Math.min(pagination.current * pagination.pageSize, pagination.total)}</span> of{' '}
        <span className="font-medium">{pagination.total}</span> results
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => pagination.onPageChange?.(pagination.current - 1, pagination.pageSize)}
          disabled={pagination.current === 1}
          className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center space-x-1">
          {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => pagination.onPageChange?.(page, pagination.pageSize)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  pagination.current === page
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'text-gray-500 hover:bg-gray-100'
                } transition-colors`}
              >
                {page}
              </button>
            );
          })}
          {Math.ceil(pagination.total / pagination.pageSize) > 5 && (
            <span className="px-2 text-gray-500">...</span>
          )}
        </div>
        <button
          onClick={() => pagination.onPageChange?.(pagination.current + 1, pagination.pageSize)}
          disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
          className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )}
</div>
  );
};