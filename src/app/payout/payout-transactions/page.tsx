"use client";
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { payoutTransaction } from '@/app/redux/slices/payoutSlice';
import DataTable from '@/app/components/Datatables';
import Loader from '@/app/components/tablecomponents/Loader';

interface Filters {
  dateFrom: string;
  dateTo: string;
  merchantOrderId: string;
  status: string;
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
      merchantOrderId: '',
      status: '',
      transactionType: ''
    });

    // Dispatch the API call on component mount
    dispatch(payoutTransaction({
      dateFrom: '',
      dateTo: '',
      merchantOrderId: '',
      status: '',
      transactionType: ''
    }));
  }, [dispatch]);

  const columns = [
    { Header: 'Merchant Order ID', accessor: 'merchantOrderId', type: 'text' as const },
    { Header: 'Utr ID', accessor: 'utrId', type: 'text' as const },
    { Header: 'Transaction Message', accessor: 'transactionMessage', type: 'text' as const },
     { Header: 'Transaction Type', accessor: 'transactionType', type: 'text' as const },
    { Header: 'Pg Order ID', accessor: 'pgOrderId', type: 'text' as const },
    { Header: 'Date', accessor: 'trDateTime', type: 'date' as const },
    { Header: 'Amount', accessor: 'amount', type: 'text' as const },
    { Header: 'Transaction Status', accessor: 'transactionStatus', type: 'text' as const },
    { Header: 'Beneficiary', accessor: 'beneficiaryName', type: 'text' as const },
  ];

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleFilterSubmit = () => {
    if (filters) {
      dispatch(payoutTransaction({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        merchantOrderId: filters.merchantOrderId,
        status: filters.status,
        transactionType: filters.transactionType,
      }));
    }
  };

  return (

    <div className="main-container mx-auto py-8 px-4">
      <h1 className='h1-text'>Transactions</h1>

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

        {/* Order ID */}
        <div style={{
          position: 'relative',
          flex: '1 1 160px',
          minWidth: '160px'
        }}>
          <label className='input-filter'>Merchant Order ID</label>
          <input
            type="text"
            value={filters?.merchantOrderId || ''}
            onChange={e => handleFilterChange('merchantOrderId', e.target.value)}
            placeholder="Merchant Order ID"
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
            <option value="ACCOUNT">ACCOUNT</option>
            <option value="WALLET">WALLET</option>
            <option value="UPI/VPA">UPI/VPA</option>
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