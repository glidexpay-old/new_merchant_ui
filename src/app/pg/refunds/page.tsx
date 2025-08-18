"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchTransactionDetailsFilter } from '@/app/redux/slices/refundSlice';
import DataTable, { Column } from '@/app/components/Datatables';
import GlobalToast from '@/app/components/GlobalToast';
import ModalForm, { ModalFormField } from '@/app/components/tablecomponents/ModalForm';
// Local type definitions (from refundSlice)
interface TransactionDetail {
  id: string;
  orderId: string;
  status: string;
  amount: number;
  createdAt: string;
  // Add more fields as needed
}
interface TransactionDetailsFilterParams {
  orderId?: string;
  status?: string;
  pageNo?: number;
  pageRecords?: number;
  dateTo?: string;
  dateFrom?: string;
}

const RefundPage = () => {
  const dispatch = useAppDispatch();
  const refundRaw = useAppSelector((state) => state.refund.transactionDetails.data) as { extraData?: { transactionDetail?: TransactionDetail[] } };
  let refundData: TransactionDetail[] = [];
  if (
    refundRaw &&
    typeof refundRaw === 'object' &&
    refundRaw.extraData &&
    Array.isArray(refundRaw.extraData.transactionDetail)
  ) {
    refundData = refundRaw.extraData.transactionDetail;
  }
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Set dateFrom to 7 days ago and dateTo to today (format: DD-MM-YYYY)
    const today = new Date();
    const priorDate = new Date();
    priorDate.setDate(today.getDate() - 7);

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const params: TransactionDetailsFilterParams = {
      orderId: '',
      status: '',
      pageNo: 1,
      pageRecords: 10,
      dateTo: formatDate(today),
      dateFrom: formatDate(priorDate),
    };
    dispatch(fetchTransactionDetailsFilter(params));
  }, [dispatch]);

  const columns: Column[] = [
    { Header: 'MerchantId', accessor: 'merchantId', searchable: true },
    { Header: 'Merchant Order Id', accessor: 'merchantOrderId', searchable: true },
    { Header: 'Order ID', accessor: 'orderID', searchable: true },
    { Header: 'Order Note', accessor: 'orderNote', searchable: true },
    { Header: 'Amount', accessor: 'amount', searchable: true },
    { Header: 'Payment Option', accessor: 'paymentOption', searchable: true },
    { Header: 'Trxn Msg', accessor: 'txtMsg', sortable: true },
    { Header: 'Trxn Time', accessor: 'transactionTime', sortable: true },
  ];

  const handleAddRefundRequest = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: Record<string, string | number | boolean>): Promise<void> => {
    // Prepare params for fetchTransactionDetailsFilter
    const params: TransactionDetailsFilterParams = {
      orderId: typeof values.merchantOrderId === 'string' ? values.merchantOrderId : '',
    };
    try {
      await dispatch(fetchTransactionDetailsFilter(params));
    } catch (error) {
      console.error('Failed to fetch transaction details:', error);
    }
    setIsModalOpen(false);
  };

  const modalFields: ModalFormField[] = [
    { name: 'merchantOrderId', label: 'Search by Merchant OrderID', type: 'text', required: true, placeholder: 'Enter complaint ID' },
  ];

  return (
    <div className='main-container'>
      <GlobalToast />
      <div className='flex justify-between items-center mb-4'>
        <h1 className='h1-text'>Refund Requests</h1>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              color: '#1a73e8',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
              height: '36px'
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M12 15V3M12 15L8 11M12 15L16 11M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export
          </button>

          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#1a73e8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px 0 rgba(26,115,232,0.3)',
              transition: 'all 0.2s ease',
              height: '36px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1765cc'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a73e8'}
            onClick={handleAddRefundRequest}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M12 4V20M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            + Add Refund Request
          </button>
        </div>
      </div>
      <DataTable columns={columns} data={refundData.map((row) => ({ ...row }))} />
      <ModalForm
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        fields={modalFields}
        title="New Refund Request"
        submitLabel="Submit"
      />
    </div>
  );
};

export default RefundPage;
