"use client";

import React, { useState } from "react";

export interface Column<T> {
  accessor: keyof T;
  Header: string;
  renderCell?: (value: T[keyof T], row: T) => React.ReactNode;
  cellAction?: {
    type: "link" | "modal";
    url?: (row: T) => string;
    onClick?: (row: T) => void;
  };
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  expandedContent?: (row: T) => React.ReactNode;
  className?: string;
  pageSize?: number;
  sortState?: { column: keyof T | null; direction: "asc" | "desc" | null };
  onSort?: (columnKey: keyof T) => void;
  onCellClick?: (rowData: T, column: Column<T>) => void;
  enableSorting?: boolean;
  actions?: Array<{ label: string; onClick: (row: T, idx: number) => void }>;
  slidingRows?: boolean;
}

const Table = <T,>({
  columns,
  data,
  expandedContent,
  className = "",
  sortState,
  onSort,
  onCellClick,
  enableSorting = false,
  actions = [],
  slidingRows = false,
}: TableProps<T>) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortClick = (columnKey: keyof T) => {
    if (enableSorting && onSort) {
      onSort(columnKey);
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="w-full overflow-x-auto rounded shadow relative">
        <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor as string}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortClick(column.accessor)}
                >
                  {column.Header}
                  {sortState?.column === column.accessor && (
                    <span>
                      {sortState.direction === "asc" ? " 🔼" : " 🔽"}
                    </span>
                  )}
                </th>
              ))}
              {actions.length > 0 && <th className="px-6 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <React.Fragment key={index}>
                  <tr
                    onClick={() => toggleRow(index)}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.accessor as string}
                        className="px-6 py-4 table-text whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onCellClick) onCellClick(row, column);
                        }}
                      >
                        {column.renderCell ? (
                          column.renderCell(row[column.accessor], row)
                        ) : column.cellAction && column.cellAction.type === "link" ? (
                          column.cellAction.url && (
                            <a
                              href={column.cellAction.url(row)}
                              className="text-blue-500  hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {String(row[column.accessor])}
                            </a>
                          )
                        ) : (
                          String(row[column.accessor])
                        )}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {actions.map((action, actionIdx) => (
                          <button
                            key={actionIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row, index);
                            }}
                            className="text-blue-500 hover:underline"
                          >
                            {action.label}
                          </button>
                        ))}
                      </td>
                    )}
                  </tr>
                  {slidingRows && expandedRow === index && (
                    <tr className="bg-gray-50">
                      <td
                        colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                        className="px-6 py-4"
                      >
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          {expandedContent ? (
                            expandedContent(row)
                          ) : (
                            <div className="text-sm text-gray-500">
                              No additional details available
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 hidden sm:inline">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setCurrentPage(1);
              setRowsPerPage(Number(e.target.value));
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hidden sm:block"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600 hidden sm:block">
          {`${(currentPage - 1) * rowsPerPage + 1}-${Math.min(
            currentPage * rowsPerPage,
            data.length
          )} of ${data.length}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            ⏮
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            ◀
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            ▶
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;
