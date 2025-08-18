"use client";
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { payoutManagement, balanceCheck } from '@/app/redux/slices/payoutSlice';
import DataTable from '@/app/components/Datatables';
import Loader from '@/app/components/tablecomponents/Loader';
import ExportDropdown from '@/app/components/Export';

interface Filters {
  dateFrom: string;
  dateTo: string;
}

const TransactionsPage = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading, walletBalance } = useAppSelector((state) => state.payoutTrxn); // Added walletBalance selector

  const [filters, setFilters] = useState<Filters | null>(null);

  useEffect(() => {
    setFilters({
      dateFrom: '',
      dateTo: '',
    });

    // Dispatch the API call on component mount
    dispatch(payoutManagement({
      dateFrom: '',
      dateTo: '',
    }));

    // Fetch balance check data
    dispatch(balanceCheck());
  }, [dispatch]);

  const columns = [
    { Header: 'Merchant ID', accessor: 'merchantId', type: 'text' as const },
    { Header: 'Utr ID', accessor: 'utrId', type: 'text' as const },
    { Header: 'Order ID', accessor: 'orderId', type: 'text' as const },
    { Header: 'Date', accessor: 'txnDate', type: 'date' as const },
    { Header: 'Trxn ID', accessor: 'txnId', type: 'text' as const },
    { Header: 'Amount', accessor: 'txnAmount', type: 'text' as const },
    { Header: 'CreditOrDebit', accessor: 'creditOrDebit', type: 'text' as const },
    { Header: 'MerchantTrxnType', accessor: 'merchantTxnType', type: 'text' as const },
    { Header: 'Transaction Status', accessor: 'txnStatus', type: 'text' as const },
    { Header: 'Beneficiary', accessor: 'beneficiary', type: 'text' as const },
  ];

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleFilterSubmit = () => {
    if (filters) {
      dispatch(payoutManagement({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }));
    }
  };

   // Pagination state for current page
    const [currentPage] = useState(1);
    const pageSize = 10;
    const transactionArray = Array.isArray(transactions)
      ? (transactions as unknown[]).filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
      : Object.values(transactions ?? {}).filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null);
    const paginatedSettlement = transactionArray.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="main-container mx-auto py-8 px-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 className="h1-text">Payout Management</h1>
      <h2 className="text-xl font-semibold mb-4">Transaction Balance: {walletBalance}</h2>
        <ExportDropdown data={paginatedSettlement} filenamePrefix="Bulk-Payout" />
      </div>

      {/* Filters UI - styled like bulk-payout/settlement page */}
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
        <DataTable
          data={Array.isArray(transactions) ? transactions.filter(transaction => typeof transaction === 'object' && transaction !== null) : []}
          columns={columns}
          pageSize={10}
          fetchData={undefined}
          enableSorting
        />
      )}
    </div>
  );
};

export default TransactionsPage;