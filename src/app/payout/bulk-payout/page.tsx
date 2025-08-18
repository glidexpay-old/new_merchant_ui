"use client";
import React, { useState, useRef, useEffect } from 'react';
import GlobalToast from '@/app/components/GlobalToast';
import DataTable from '@/app/components/Datatables';
import { useDispatch, useSelector } from 'react-redux';
import { bulkPayout, bulkPayout2, bulkPayoutStatus } from '@/app/redux/slices/bulkPayoutSlice';
import { RootState, AppDispatch } from '@/app/redux/store';
import { showToast } from '@/app/redux/toastSlice';
import ExportDropdown from '@/app/components/Export';

interface Filters {
  dateFrom: string;
  dateTo: string;
  status: string;
}


const bulkPayoutColumns = [
  { Header: 'Order ID', accessor: 'orderId', type: 'text' as const },
  { Header: 'Beneficiary Name', accessor: 'beneficiaryName', type: 'text' as const },
  { Header: 'Bank Account', accessor: 'bankAccount', type: 'text' as const },
  { Header: 'IFSC', accessor: 'ifsc', type: 'text' as const },
  { Header: 'Amount', accessor: 'amount', type: 'text' as const },
  { Header: 'Status', accessor: 'status', type: 'text' as const },
  { Header: 'CreatedAt', accessor: 'createdAt', type: 'text' as const },
  { Header: 'Created', accessor: 'created', type: 'text' as const },
  { Header: 'updatedAt', accessor: 'updatedAt', type: 'text' as const },
];

// Helper to format ISO date string to DD-MM-YYYY
const formatDateDisplay = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const BulkPayoutPage = () => {
  const [file, setFile] = useState<File | null>(null);
  // const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null);
  const [filters, setFilters] = useState<Filters>({ dateFrom: '', dateTo: '', status: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch: AppDispatch = useDispatch();
  const { bulkPayoutStatusData, bulkPayoutData, loading } = useSelector((state: RootState) => state.bulkPayout);

  const [filterClicked, setFilterClicked] = useState(false);
  const [useFilteredData, setUseFilteredData] = useState(false);
  // Fetch bulk payout status on initial render
  // Helper to format date as YYYY-MM-DD or return null
  // Use the date string as is, since input type="date" gives YYYY-MM-DD
  const formatDate = (dateStr: string) => dateStr || "";
  // Only fetch all data on initial render, not on every filter change
  useEffect(() => {
    dispatch(bulkPayout2());
  }, [dispatch]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      alert('Please upload a CSV or Excel file');
      return;
    }
    const controller = new AbortController();
    //setUploadAbortController(controller);

    try {
      await dispatch(bulkPayout({ file, signal: controller.signal })).unwrap();
      setFile(null);
     // setUploadAbortController(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // After successful upload, fetch bulk payout status
      dispatch(bulkPayout2());
      dispatch(showToast({ message: 'File uploaded successfully!', type: 'success' }));
    } catch (error) {
      // Show toast for specific error message from thunk (e.g., 'file is wrong uploaded')
      if (typeof error === 'string' && error === 'file is wrong uploaded') {
        dispatch(showToast({ message: 'file is wrong uploaded', type: 'error' }));
        return;
      }
      if (error && typeof error === 'object' && 'name' in error && (error as { name?: string }).name !== 'AbortError') {
        console.error('Upload failed:', error);
        dispatch(showToast({ message: 'File upload failed!', errorDetails: String(error), type: 'error' }));
      }
    }
  };


  const handleFilterSubmit = () => {
    setFilterClicked(true);
    setUseFilteredData(true);
    type BulkPayoutStatusPayload = {
      endDate: string;
      startDate: string;
      status?: string;
    };
    const payload: BulkPayoutStatusPayload = {
      endDate: formatDate(filters.dateTo),
      startDate: formatDate(filters.dateFrom),
    };
    if (filters.status) {
      payload.status = filters.status;
    }
    dispatch(bulkPayoutStatus(payload));
  };

  // Optional: If you want to auto-fetch on filter change (remove if not needed)
  // useEffect(() => {
  //   if (filters.dateFrom || filters.dateTo || filters.status) {
  //     handleFilterSubmit();
  //   }
  // }, [filters]);
  useEffect(() => {
    if (filterClicked) {
      if (bulkPayoutStatusData && Array.isArray(bulkPayoutStatusData)) {
        console.log("DataTable data (should be same as above):", bulkPayoutStatusData);
      } else {
        console.log("DataTable data (Object.values):", Object.values(bulkPayoutStatusData || {}));
      }
      setFilterClicked(false);
    }
  }, [bulkPayoutStatusData, filterClicked]);

  // Pagination state for current page
  const [currentPage] = useState(1);
  const pageSize = 10;
  const paginatedSettlement = Object.values(bulkPayoutData ?? {}).slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return (
    <div className="main-container">
      <GlobalToast />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className='h1-text'>Bulk Payout Upload</h1>
        <ExportDropdown
          data={
            paginatedSettlement.filter(
              (item): item is Record<string, unknown> =>
                item !== null && typeof item === 'object'
            )
          }
          filenamePrefix="Bulk-Payout"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', fontFamily: "'Inter', sans-serif" }}>
        <button
          style={{
            backgroundColor: 'transparent',
            color: '#3182CE',
            padding: '8px 16px',
            border: '1px solid #3182CE',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            const link = document.createElement('a');
            link.href = '/SampleBulkUpload.xlsx';
            link.download = 'SampleBulkUpload.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15V3M12 15L8 11M12 15L16 11M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="#3182CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download Sample
        </button>

        <div style={{
          position: 'relative',
          flexGrow: 1
        }}>
          <label htmlFor="file-upload" style={{
            display: 'block',
            padding: '8px 16px',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            backgroundColor: '#F8FAFC',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#4A5568',
            transition: 'all 0.2s ease',
          }}>
            {file ? file.name : 'Choose file'}
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            id="file-upload"
            ref={fileInputRef}
            disabled={loading}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0, 0, 0, 0)',
              whiteSpace: 'nowrap',
              border: 0
            }}
          />
        </div>

        <button
          onClick={handleUpload}
          style={{
            backgroundColor: '#3182CE',
            color: '#fff',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          disabled={loading || !file}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 16C4.79086 16 3 14.2091 3 12C3 9.79086 4.79086 8 7 8M7 16C9.20914 16 11 14.2091 11 12C11 9.79086 9.20914 8 7 8M7 16H17C19.2091 16 21 14.2091 21 12C21 9.79086 19.2091 8 17 8M7 8H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Upload
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Date From */}
        <div style={{
          position: 'relative',
          flex: '1 1 160px',
          minWidth: '160px'
        }}>
          <label className='input-filter'>Start Date</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#2D3748',
              backgroundColor: '#F8FAFC',
            }}
          />
        </div>

        <span className='to' style={{
          display: 'inline-block',
          textAlign: 'center',
          flex: '0 0 auto',
        }}>to</span>

        {/* Date To */}
        <div style={{
          position: 'relative',
          flex: '1 1 160px',
          minWidth: '160px'
        }}>
          <label className='input-filter'>End Date</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#2D3748',
              backgroundColor: '#F8FAFC',
            }}
          />
        </div>
        {/* Status */}
        <div style={{
          position: 'relative',
          flex: '1 1 160px',
          minWidth: '160px'
        }}>
          <label className='input-filter'>Status</label>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#2D3748',
              backgroundColor: '#F8FAFC',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
            }}
          >
            <option value="">All Status</option>
            <option value="START">START</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="PROCESSED">PROCESSED</option>
            <option value="VALIDATION_ERROR">VALIDATION_ERROR</option>
          </select>
        </div>

        {/* Filter Button */}
        <button
          onClick={handleFilterSubmit}
          style={{
            backgroundColor: '#3182CE',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            flex: '1 1 auto',
            width: '60px',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 22L16.4 16.4M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Filter
        </button>
      </div>

      <DataTable
        data={
          useFilteredData
            ? (
              bulkPayoutStatusData
                ? Object.values(bulkPayoutStatusData)
                  .filter((item): item is { [key: string]: unknown } => item !== null && item !== undefined && typeof item === 'object')
                  .map(item => {
                    const created = typeof item.created === 'string' ? item.created : '';
                    const updatedAt = typeof item.updatedAt === 'string' ? item.updatedAt : '';
                    return {
                      ...item,
                      created: created ? formatDateDisplay(created) : '',
                      updatedAt: updatedAt ? formatDateDisplay(updatedAt) : '',
                    };
                  })
                : []
            )
            : (
              bulkPayoutData
                ? Object.values(bulkPayoutData)
                  .filter((item): item is { [key: string]: unknown } => item !== null && item !== undefined && typeof item === 'object')
                  .map(item => {
                    const created = typeof item.created === 'string' ? item.created : '';
                    const updatedAt = typeof item.updatedAt === 'string' ? item.updatedAt : '';
                    return {
                      ...item,
                      created: created ? formatDateDisplay(created) : '',
                      updatedAt: updatedAt ? formatDateDisplay(updatedAt) : '',
                    };
                  })
                : []
            )
        }
        fetchData={undefined}
        columns={bulkPayoutColumns}
        pageSize={10}
        enableSorting
      />
    </div>
  );
};

export default BulkPayoutPage;