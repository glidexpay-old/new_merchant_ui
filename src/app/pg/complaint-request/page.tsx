"use client";

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchComplaintDetails } from '@/app/redux/slices/complaintSlice';
import DataTable, { Column } from '@/app/components/Datatables';
import GlobalToast from '@/app/components/GlobalToast';
import ModalForm, { ModalFormField } from '@/app/components/tablecomponents/ModalForm';

const ComplaintRequestPage = () => {
  const dispatch = useAppDispatch();
  const { complaintDetails, status } = useAppSelector((state) => state.complaint);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchComplaintDetails());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (status === 'succeeded' && Array.isArray(complaintDetails) && complaintDetails.length === 0) {
      console.log("Data is Empty"); // Replace with actual toast logic
    }
  }, [status, complaintDetails]);

  const columns: Column[] = [
    { Header: 'ID', accessor: 'id', searchable: true },
    { Header: 'Description', accessor: 'description', searchable: true },
    { Header: 'Status', accessor: 'status', sortable: true },
    { Header: 'Created At', accessor: 'createdAt', type: 'date', sortable: true },
  ];

  const handleAddComplaintRequest = () => {
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
    { name: 'id', label: 'Complaint ID', type: 'text', required: true, placeholder: 'Enter complaint ID' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Enter description' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Open', value: 'open' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Closed', value: 'closed' },
    ], placeholder: 'Select status' },
  ];

  return (
    <div className='main-container mx-auto py-8 px-4'>
      <GlobalToast />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className='h1-text'>Complaint Requests</h1>
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
            onClick={handleAddComplaintRequest}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M12 4V20M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            + Add Complaint Request
          </button>
        </div>
      </div>
      <DataTable columns={columns} data={Array.isArray(complaintDetails) ? complaintDetails : []} />
      <ModalForm
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        fields={modalFields}
        title="New Complaint Request"
        submitLabel="Submit"
      />
    </div>
  );
};

export default ComplaintRequestPage;
