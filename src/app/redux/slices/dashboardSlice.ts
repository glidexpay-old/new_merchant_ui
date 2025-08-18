// Types for day-wise transaction details
export interface DayWiseTransactionStatus {
  trasactionStatus: 'SUCCESS' | 'PENDING' | 'FAILED';
  totalAmount: string;
  totalPercent: string;
  totalTrcount: number;
}

export interface DayWiseTransactionDetails {
  name: string;
  id: string;
  lastSuccessTransctionTime: string;
  dayWiseTransactionStatusResponseList: DayWiseTransactionStatus[];
}
// Async thunk to fetch day-wise transaction details
export const fetchDayWiseTransactionDetails = createAsyncThunk(
  'dashboard/fetchDayWiseTransactionDetails',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Thunk entered for day-wise transaction details');
      const { uuid } = getUserData();
      console.log('UUID:', uuid);
      const res = await axios.get(`${BASE_URL}/api/merchant/daily/getDayWiseTransactionDetails?uuid=${uuid}`, getAuthHeaders());

      if (res.data.statusCode !== 200) {
        // If the data looks valid, treat as success (workaround for backend issue)
        if (res.data.dayWiseTransactionStatusResponseList) {
          console.log('Treating non-200 as success:', res.data);
          return res.data;
        }
        console.log('API returned error:', res.data);
        return rejectWithValue(res.data.msg?.[0] || 'Failed to fetch day-wise transaction details');
      }
      console.log('Day-wise transaction details response:', res.data);
      return res.data;
    } catch (err: unknown) {
      console.log('Error fetching day-wise transaction details:', err);
      const error = err as { response?: { data?: { msg?: string[] } }; message?: string };
      return rejectWithValue(error.response?.data?.msg?.[0] || error.message || 'Failed to fetch day-wise transaction details');
    }
  }
);
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '@/app/config';
import getAuthHeaders from '@/app/utils/getAuthHeaders';
import getUserData from '@/app/utils/getUserData';

// Async thunk to fetch dashboard balance
export const fetchDashboardBalance = createAsyncThunk(
  'dashboard/fetchDashboardBalance',
  async (_, { rejectWithValue }) => {
    try {
      const { uuid } = getUserData();
      const res = await axios.get(`${BASE_URL}/api/dashBoardBalance?uuid=${uuid}`, getAuthHeaders());

      if (res.data.statusCode !== 200) {
        return rejectWithValue(res.data.msg?.[0] || 'Failed to fetch dashboard balance');
      }
      console.log('Dashboard balance response:', res.data.extraData.dashboardBalance);
      return res.data.extraData.dashboardBalance;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { msg?: string[] } }; message?: string };
      return rejectWithValue(error.response?.data?.msg?.[0] || error.message || 'Failed to fetch dashboard balance');
    }
  }
);

interface DashboardBalance {
  todaysTransactions: string;
  lastSettlements: string;
  unsettledAmount: string;
}

interface DashboardState {
  balance: DashboardBalance | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}


// Extend state for day-wise transaction details
interface DashboardExtendedState extends DashboardState {
  dayWiseTransactionDetails: DayWiseTransactionDetails | null;
  dayWiseStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  dayWiseError: string | null;
}

const initialState: DashboardExtendedState = {
  balance: null,
  status: 'idle',
  error: null,
  dayWiseTransactionDetails: null,
  dayWiseStatus: 'idle',
  dayWiseError: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardBalance.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardBalance.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.balance = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardBalance.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Day-wise transaction details
      .addCase(fetchDayWiseTransactionDetails.pending, (state) => {
        state.dayWiseStatus = 'loading';
        state.dayWiseError = null;
      })
      .addCase(fetchDayWiseTransactionDetails.fulfilled, (state, action) => {
        state.dayWiseStatus = 'succeeded';
        state.dayWiseTransactionDetails = action.payload;
        state.dayWiseError = null;
      })
      .addCase(fetchDayWiseTransactionDetails.rejected, (state, action) => {
        state.dayWiseStatus = 'failed';
        state.dayWiseError = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;
