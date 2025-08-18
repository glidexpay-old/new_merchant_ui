"use client";
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerApiRequestReport } from '@/app/redux/slices/paymentRequestSlice';
import DataTable, { Column } from '@/app/components/Datatables';
import { RootState, AppDispatch } from '@/app/redux/store';
import ModalForm, { ModalFormField } from '@/app/components/tablecomponents/ModalForm';

const PaymentReqPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { customerReport, status } = useSelector((state: RootState) => state.paymentRequest);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCustomerApiRequestReport());
    }
  }, [dispatch, status]);

  console.log('Customer Report:', customerReport);

  const columns: Column[] = [
    { Header: 'Created', accessor: 'created', type: 'date', sortable: true },
    { Header: 'Status', accessor: 'status', sortable: true },
    { Header: 'Amount', accessor: 'amount', sortable: true },
    { Header: 'Order ID', accessor: 'orderId', searchable: true },
    { Header: 'Order Note', accessor: 'orderNote' },
    { Header: 'Customer Name', accessor: 'custname', searchable: true },
    { Header: 'Customer Phone', accessor: 'custphone', searchable: true },
    { Header: 'Customer Email', accessor: 'custemail', searchable: true },
    { Header: 'Link Expiry Time', accessor: 'linkexpirytime', type: 'date' },
    { Header: 'Return URL', accessor: 'returnurl' },
  ];

  const handleAddPaymentRequest = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: Record<string, string | number | boolean>): Promise<void> => {
    console.log('Form Submitted:', values);
    setIsModalOpen(false);
  };

  const modalFields: ModalFormField[] = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter name' },
    { name: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: 'Enter phone number' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email' },
    { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: 'Enter amount' },
    {
      name: 'time', label: 'Choose Time', type: 'select', required: true, options: [
        { label: '1 Hour', value: '1h' },
        { label: '1 Day', value: '1d' },
        { label: '1 Week', value: '1w' },
      ], placeholder: 'Select time'
    },
    { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: 'Enter duration' },
    { name: 'note', label: 'Order Note', type: 'textarea', placeholder: 'Enter order note' },
  ];

  return (
    <div className='main-container mx-auto py-8 px-4'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Payment Request</h1>
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
            onClick={handleAddPaymentRequest}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M12 4V20M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            + Add Payment Request
          </button>
        </div>
      </div>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'failed' && <p className=''>Failed to load data.</p>}
      {status === 'succeeded' && customerReport.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#555' }}>No payment requests found. Please add a new request to get started.</h2>
        </div>
      )}
      {status === 'succeeded' && customerReport.length > 0 && (
        <DataTable
          data={customerReport}
          columns={columns}
          pageSize={10}
          tableName="Payment Requests"
          enableGlobalSearch
          enableSorting
        />
      )}
      <ModalForm
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        fields={modalFields}
        title="New Payment Request"
        submitLabel="Submit"
      />
    </div>
  );
};

export default PaymentReqPage;