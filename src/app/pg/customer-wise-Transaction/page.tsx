"use client";
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchCustomerWiseTransactions } from '@/app/redux/slices/pgTrxnSlice';
import DataTable from '@/app/components/Datatables';
import Loader from '@/app/components/tablecomponents/Loader';

interface Filters {
  dateFrom: string;
  dateTo: string;
}

const TransactionsPage = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading } = useAppSelector((state) => state.pgTrxn);

  const [filters, setFilters] = useState<Filters | null>(null);

  useEffect(() => {
    setFilters({
      dateFrom: '',
      dateTo: '',
    });
  }, []);

  useEffect(() => {
    if (filters) {
      dispatch(fetchCustomerWiseTransactions(filters));
    }
  }, [dispatch, filters]);

  const columns = [
    { Header: 'Customer Name', accessor: 'customer_name', type: 'text' as const },
    { Header: 'Email', accessor: 'email_id', type: 'text' as const },
    { Header: 'Date', accessor: 'created', type: 'date' as const },
    { Header: 'Amount', accessor: 'amount', type: 'text' as const },
    { Header: 'Order ID', accessor: 'orderid', type: 'text' as const },
    { Header: 'Merchant Order ID', accessor: 'merchant_order_id', type: 'text' as const },
    { Header: 'Payment Option', accessor: 'payment_option', type: 'text' as const },
    { Header: 'Status', accessor: 'status', type: 'text' as const },
  ];

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleFilterSubmit = () => {
    if (filters) {
      dispatch(fetchCustomerWiseTransactions({
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }));
    }
  };

  return (

    <div className="main-container mx-auto py-8 px-4">
      <h1 className='h1-text'>Customer Wise Transaction</h1>

      {/* Filters UI - styled like bulk-payout/settlement page */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ position: 'relative' }}>
    <label className='input-filter'>Start Date</label>
          <input
            type="date"
            value={filters?.dateFrom || ''}
            onChange={e => handleFilterChange('dateFrom', e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#2D3748',
              backgroundColor: '#F8FAFC',
              minWidth: '160px',
            }}
          />
        </div>

<span className='to'>to</span>

        <div style={{ position: 'relative' }}>
    <label className='input-filter'>End Date</label>
          <input
            type="date"
            value={filters?.dateTo || ''}
            onChange={e => handleFilterChange('dateTo', e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#2D3748',
              backgroundColor: '#F8FAFC',
              minWidth: '160px',
            }}
          />
        </div>

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
            marginLeft: '8px'
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
          data={transactions.map((transaction) => ({ ...transaction }))}
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