"use client";
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { walletReport } from '@/app/redux/slices/payoutSlice';
import DataTable from '@/app/components/Datatables';
import Loader from '@/app/components/tablecomponents/Loader';

interface Filters {
  dateFrom: string;
  dateTo: string;
  transactionType: string;
}

const TransactionsPage = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading } = useAppSelector((state) => state.payoutTrxn);

  const [filters, setFilters] = useState<Filters | null>(null);

  useEffect(() => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      transactionType: ''
    });

    // Dispatch the API call on component mount
    dispatch(walletReport({
      dateFrom: '',
      dateTo: '',
    }));
  }, [dispatch]);

  const columns = [
    { Header: 'Merchant ID', accessor: 'merchantId', type: 'text' as const },
    { Header: 'Main Wallet ID', accessor: 'mainWalletId', type: 'text' as const },
    { Header: 'Date', accessor: 'createdAt', type: 'date' as const },
    { Header: 'Amount', accessor: 'amount', type: 'text' as const },
    { Header: 'CreditOrDebit', accessor: 'credit_debit', type: 'text' as const },
    { Header: 'Closing Balance', accessor: 'closingBalance', type: 'text' as const },
    { Header: 'Opening Balance', accessor: 'openingBalance', type: 'text' as const },
    { Header: 'Purpose', accessor: 'purpose', type: 'text' as const },
    { Header: 'Status Remark', accessor: 'statusRemarks', type: 'text' as const },
    { Header: 'Reference ID', accessor: 'referenceId', type: 'text' as const },
    { Header: 'Transaction ID', accessor: 'transactionId', type: 'text' as const },
    { Header: 'Wallet ID', accessor: 'walletid', type: 'text' as const },
    { Header: 'Trxn Status', accessor: 'transactionStatus', type: 'text' as const },
  ];

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleFilterSubmit = () => {
    if (filters) {
      dispatch(walletReport({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        transactionType: filters.transactionType,
      }));
    }
  };

  return (

    <div className="main-container container mx-auto py-8 px-4">
      <h1 className='h1-text'>Wallet Report</h1>

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

        {/* Status */}
        <div style={{
          position: 'relative',
          flex: '1 1 160px',
          minWidth: '160px'
        }}>
          <label className='input-filter'>Transaction Type</label>
          <select
            value={filters?.transactionType || ''}
            onChange={e => handleFilterChange('transactionType', e.target.value)}
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
            <option value="">All Account Types</option>
            <option value="UPI">UPI</option>
            <option value="WalletTransfer">WalletTransfer</option>
            <option value="IMPS">IMPS</option>
            <option value="NEFT">NEFT</option>
            <option value="BankTransfer">BankTransfer</option>
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