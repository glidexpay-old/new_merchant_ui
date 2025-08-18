import { configureStore } from '@reduxjs/toolkit';
import { startSessionTimer } from '../utils/sessionManager';

import adminReducer from './slices/adminSlice';
import adminProfileReducer from './slices/adminProfileSlice';
import toastReducer from './toastSlice';
import dashboardReducer from './slices/dashboardSlice';
import pgTrxnReducer from './slices/pgTrxnSlice';
import settlementReducer from './slices/settlementSlice';
import paymentRequestReducer from './slices/paymentRequestSlice';
import complaintReducer from './slices/complaintSlice';
import refundReducer from './slices/refundSlice';
import payoutTrxnReducer from './slices/payoutSlice';
import bulkPayoutReducer from './slices/bulkPayoutSlice';

// Initialize session timer if session data exists
if (typeof window !== 'undefined') { // Ensure this runs only on the client side
  const userData = localStorage.getItem('userData');
  if (userData) {
    const { sessionExpiryDate } = JSON.parse(userData);
    if (sessionExpiryDate) {
      startSessionTimer(sessionExpiryDate);
    }
  }
}

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    adminProfile: adminProfileReducer,
    toast: toastReducer,
    dashboard: dashboardReducer,
    pgTrxn: pgTrxnReducer,
    paymentRequest: paymentRequestReducer,
    settlement: settlementReducer,
    complaint: complaintReducer,
    refund: refundReducer,
    payoutTrxn: payoutTrxnReducer,
    bulkPayout: bulkPayoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
