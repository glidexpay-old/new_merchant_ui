import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import getAuthHeaders from '@/app/utils/getAuthHeaders';
import { BASE_URL } from '@/app/config';
import getUserData from '@/app/utils/getUserData';


// Types for transaction details filter
interface TransactionDetailsFilterParams {
  orderId?: string;
  status?: string;
  pageNo?: number;
  pageRecords?: number;
  dateTo?: string;
  dateFrom?: string;
}

interface TransactionDetail {
  // Define the properties based on expected API response
  // Example:
  id: string;
  orderId: string;
  status: string;
  amount: number;
  createdAt: string;
  // Add more fields as needed
}

interface TransactionDetailsState {
  data: TransactionDetail[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialTransactionDetailsState: TransactionDetailsState = {
  data: [],
  status: 'idle',
  error: null,
};
// Define types
interface ComplaintDetails {
  id: string;
  description: string;
  status: string;
  createdAt: string;
}

interface RefundState {
  RefundDetails: ComplaintDetails | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: RefundState = {
  RefundDetails: null,
  status: 'idle',
  error: null,
};

// Async thunk to fetch refund details
// export const fetchRefundDetails = createAsyncThunk(
//   'refund/fetchRefundDetails',
//   async (_, { rejectWithValue }) => {
//     try {
//       const { uuid } = getUserData();
//       const authHeaders = getAuthHeaders();
//       const response = await axios.get(`${BASE_URL}/api/merchant/getRefundDetails?uuid=${uuid}`, authHeaders);
//       console.log("Response for refundsssssss", response.data)
//       return response.data;
//     } catch (error) {
//       const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Something went wrong';
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

export const fetchTransactionDetailsFilter = createAsyncThunk(
  'refund/fetchTransactionDetailsFilter',
  async (params: TransactionDetailsFilterParams, { rejectWithValue }) => {
    try {
      const authHeaders = getAuthHeaders();
      const { uuid } = getUserData();

      console.log("Fetching transaction details with params:", params)
      const response = await axios.get(`${BASE_URL}/api/merchant/transactionDetailsFilter?uuid=${uuid}&orderId=${params.orderId || ''}&status=${params.status || ''}&pageNo=${params.pageNo?.toString() || '1'}&pageRecords=${params.pageRecords?.toString() || '10000'}&dateTo=${params.dateTo || ''}&dateFrom=${params.dateFrom || ''}`, authHeaders);
      console.log("Transaction details response:", response.data)
      return response.data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Something went wrong';
      return rejectWithValue(errorMessage);
    }
  }
);

const refundSlice = createSlice({
  name: 'refund',
  initialState: {
    ...initialState,
    transactionDetails: initialTransactionDetailsState,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // .addCase(fetchRefundDetails.pending, (state) => {
      //   state.status = 'loading';
      //   state.error = null;
      // })
      // .addCase(fetchRefundDetails.fulfilled, (state, action) => {
      //   state.status = 'succeeded';
      //   state.RefundDetails = action.payload;
      // })
      // .addCase(fetchRefundDetails.rejected, (state, action) => {
      //   state.status = 'failed';
      //   state.error = action.payload as string;
      // })
      // Transaction details filter cases
      .addCase(fetchTransactionDetailsFilter.pending, (state) => {
        state.transactionDetails.status = 'loading';
        state.transactionDetails.error = null;
      })
      .addCase(fetchTransactionDetailsFilter.fulfilled, (state, action) => {
        state.transactionDetails.status = 'succeeded';
        state.transactionDetails.data = action.payload;
      })
      .addCase(fetchTransactionDetailsFilter.rejected, (state, action) => {
        state.transactionDetails.status = 'failed';
        state.transactionDetails.error = action.payload as string;
      });
  },
});

export const { } = refundSlice.actions;
export default refundSlice.reducer;
