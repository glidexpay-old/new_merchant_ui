"use client";
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchSettlementDetails } from '@/app/redux/slices/settlementSlice';
import DataTable from '@/app/components/Datatables';
import Loader from '@/app/components/tablecomponents/Loader';
import ExportDropdown from '@/app/components/Export';

interface Filters {
  dateFrom: string;
  dateTo: string;
  orderId: string;
  status: string;
  pageNo: number;
  pageRecords: number;
}

// interface Unsettlement {
//   created: string;
//   amount: string;
//   settledAmount: string | null;
//   merchant_id: string;
//   merchant_order_id: string;
//   settlement_status: string;
//   tr_type: string;
//   card_number: string | null;
//   vpaupi: string | null;
//   walletOrBankCode: string | null;
// }

const TransactionsPage = () => {
  const dispatch = useAppDispatch();
  const { settlement, loading } = useAppSelector((state) => state.settlement);
  //const [unsettlement, setUnsettlement] = useState<Unsettlement[]>([]);
  const [filters, setFilters] = useState<Filters | null>(null);

  useEffect(() => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      orderId: '',
      status: '',
      pageNo: 1,
      pageRecords: 10000,
    });
  }, []);

  useEffect(() => {
    if (filters) {
      dispatch(fetchSettlementDetails(filters));
    }
  }, [dispatch, filters]);

  // useEffect(() => {
  //   dispatch(fetchUnsettlement())
  //     .then((response) => {
  //       if (response.payload && Array.isArray(response.payload)) {
  //         setUnsettlement(response.payload);
  //       }
  //     });
  // }, [dispatch]);

  const settlementColumns = [
    { Header: 'Merchant ID', accessor: 'merchantId', type: 'text' as const },
    { Header: 'Merchant Order ID', accessor: 'merchantOrderId', type: 'text' as const },
    { Header: 'Date', accessor: 'transactionTime', type: 'date' as const },
    { Header: 'Amount', accessor: 'amount', type: 'text' as const },
    { Header: 'Order ID', accessor: 'orderID', type: 'text' as const },
    { Header: 'Status', accessor: 'status', type: 'text' as const },
  ];

  // const unsettledColumns = [
  //   { Header: 'Created', accessor: 'created', type: 'date' as const },
  //   { Header: 'Amount', accessor: 'amount', type: 'text' as const },
  //   { Header: 'Merchant ID', accessor: 'merchant_id', type: 'text' as const },
  //   { Header: 'Merchant Order ID', accessor: 'merchant_order_id', type: 'text' as const },
  //   { Header: 'Settlement Status', accessor: 'settlement_status', type: 'text' as const },
  //   { Header: 'Transaction Type', accessor: 'tr_type', type: 'text' as const },
  // ];

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleFilterSubmit = () => {
    if (filters) {
      dispatch(fetchSettlementDetails({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        orderId: filters.orderId,
        status: filters.status,
        pageNo: filters.pageNo,
        pageRecords: filters.pageRecords,
      }));
    }
  };

  // Pagination state for current page
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const paginatedSettlement = settlement.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="main-container mx-auto py-8 px-4">   
      {/* Export only the data visible on the current page */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
       <h1 className='h1-text'>Settlement</h1>
        <ExportDropdown data={paginatedSettlement as unknown as Record<string, unknown>[]} filenamePrefix="settlement" />
      </div>

     
        {/* <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
          <Tab className={({ selected }) =>
            selected
              ? 'w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg bg-white shadow'
              : 'w-full py-2.5 text-sm leading-5 font-medium text-blue-100 rounded-lg hover:bg-white/[0.12] hover:text-white'
          }>
            Settlement
          </Tab>
          <Tab className={({ selected }) =>
            selected
              ? 'w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg bg-white shadow'
              : 'w-full py-2.5 text-sm leading-5 font-medium text-blue-100 rounded-lg hover:bg-white/[0.12] hover:text-white'
          }>
            Unsettlement
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel> */}

      {/* Filters UI - styled like bulk-payout page */}
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
            value={filters?.dateFrom || ''}
            onChange={e => handleFilterChange('dateFrom', e.target.value)}
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
            value={filters?.dateTo || ''}
            onChange={e => handleFilterChange('dateTo', e.target.value)}
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

        {/* Order ID */}
        <div style={{
          position: 'relative',
          flex: '1 1 160px',
          minWidth: '160px'
        }}>
          <label className='input-filter'>Order ID</label>
          <input
            type="text"
             value={filters?.orderId || ''}
            onChange={e => handleFilterChange('orderId', e.target.value)}
            placeholder="Order ID"
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
            value={filters?.status || ''}
            onChange={e => handleFilterChange('status', e.target.value)}
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
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
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

            {loading ? (
              <Loader />
            ) : (
              <>
                <DataTable
                  data={paginatedSettlement.map((transaction) => ({ ...transaction }))}
                  columns={settlementColumns}
                  pageSize={pageSize}
                  fetchData={undefined}
                  enableSorting
                />
                {/* Pagination controls */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      marginRight: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: '1px solid #ccc',
                      background: currentPage === 1 ? '#eee' : '#fff',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ alignSelf: 'center' }}>Page {currentPage}</span>
                  <button
                    onClick={() => setCurrentPage((p) => (p * pageSize < settlement.length ? p + 1 : p))}
                    disabled={currentPage * pageSize >= settlement.length}
                    style={{
                      marginLeft: 8,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: '1px solid #ccc',
                      background: currentPage * pageSize >= settlement.length ? '#eee' : '#fff',
                      cursor: currentPage * pageSize >= settlement.length ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* <div className="flex justify-end mb-4">
              <ExportButtons data={unsettlement as unknown as object[]} fileName="unsettlement_data" />
            </div> */}
            {/* <DataTable
              data={unsettlement.map((transaction) => ({ ...transaction }))}
              columns={unsettledColumns}
              pageSize={10}
              fetchData={undefined}
              enableSorting
            /> */}
          
    </div>
  );
};

export default TransactionsPage;