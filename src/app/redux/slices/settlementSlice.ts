import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '@/app/config';
import getAuthHeaders from '@/app/utils/getAuthHeaders';
import getUserData from '@/app/utils/getUserData';
import { showToast } from '@/app/redux/toastSlice';

// Define types
interface Transaction {
  id: string;
  amount: number;
  date: string;
  status: string;
  // Add other specific properties as needed
}

interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  orderId?: string;
  status?: string;
  pageNo?: number;
  pageRecords?: number;
}

interface TransactionState {
  settlement: Transaction[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TransactionState = {
  settlement: [],
  loading: false,
  error: null,
};

// Async thunk to fetch transaction details
export const fetchSettlementDetails = createAsyncThunk(
  'pgTrxn/fetchTransactionDetails',
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const { uuid } = getUserData();
      const authHeaders = getAuthHeaders();

      if (!uuid) {
        throw new Error('Merchant UUID not found');
      }

      const response = await axios.get(
        `${BASE_URL}/api/merchant/settlementReportFilter?uuid=${uuid}&dateFrom=${filters.dateFrom || ''}&dateTo=${filters.dateTo || ''}&orderId=${filters.orderId || ''}&status=${filters.status || ''}&pageNo=${filters.pageNo || 1}&pageRecords=${filters.pageRecords || 10000}`,
        authHeaders
      );

      console.log('API Response:', response.data);
      const transactionDetails = response.data.extraData?.transactionDetail;
      if (!Array.isArray(transactionDetails) || transactionDetails.length === 0) {
        const errorMessage = 'API response does not contain a valid transactionDetail array or is empty';
        return rejectWithValue(errorMessage);
      }
      return transactionDetails;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        const errorData = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
        console.error('Axios Error Details:', errorData);
        console.error('Network Error Details:', error.toJSON ? error.toJSON() : error);
        return rejectWithValue(errorData.data?.message || error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk to fetch unsettled details
export const fetchUnsettlement = createAsyncThunk(
  'pgTrxn/fetchUnsettlement',
  async (_, { rejectWithValue }) => {
    try {
      const authHeaders = getAuthHeaders();
      const { uuid } = getUserData();
      if (!uuid) {
        throw new Error('Merchant UUID not provided');
      }

      const response = await axios.get(
        `${BASE_URL}/api/getUnSettleDetails?uuid=${uuid}`,
        authHeaders
      );

      console.log('API Response:', response.data);
      const unsettledDetails = response.data.extraData?.UnsettledDetail;
      if (!Array.isArray(unsettledDetails) || unsettledDetails.length === 0) {
        const errorMessage = 'API response does not contain a valid UnsettledDetail array or is empty';
        return rejectWithValue(errorMessage);
      }
      return unsettledDetails;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        const errorData = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
        console.error('Axios Error Details:', errorData);
        return rejectWithValue(errorData.data?.message || error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Create the slice
const pgSettlementSlice = createSlice({
  name: 'pgTrxn',
  initialState,
  reducers: {
    // Add any additional reducers if needed
    clearTransactions: (state) => {
      state.settlement = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettlementDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettlementDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.settlement = action.payload;
      })
      .addCase(fetchSettlementDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch transactions';
        if (state.error) {
          showToast({ message: state.error });
        }
      })
      .addCase(fetchUnsettlement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnsettlement.fulfilled, (state) => {
        state.loading = false;
        // Handle unsettled details data here if needed
      })
      .addCase(fetchUnsettlement.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch unsettled details';
        if (state.error) {
          showToast({ message: state.error });
        }
      })
  },
});

export const { clearTransactions } = pgSettlementSlice.actions;
export default pgSettlementSlice.reducer;