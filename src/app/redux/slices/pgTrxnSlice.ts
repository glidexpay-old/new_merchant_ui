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
  orderID?: string;
  status?: string;
  pageNo?: number;
  pageRecords?: number;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

// Async thunk to send callback trigger
export const sentCallBack = createAsyncThunk(
  'pgTrxn/sentCallBack',
  async ({ transactionId }: { transactionId: string }, { rejectWithValue, dispatch }) => {
    try {
      const { uuid } = getUserData();
      const storedData = localStorage.getItem("userData");
      const userData = storedData ? JSON.parse(storedData) : null;
      const token = userData.token;

      if (!uuid) {
        throw new Error('Merchant UUID not found');
      }
      if (!transactionId) {
        throw new Error('transactionId is required');
      }

      console.log('Transaction ID:', transactionId);
      const response = await axios.put(
        `${BASE_URL}/api/merchant/callBackTrigger?uuid=${uuid}&transactionId=${transactionId}`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      console.log('Callback API Response:', response.data);
       console.log('Callback API Response:', response.data.status);
      if (response.data && response.data.status === 404) {
        dispatch(showToast({ message: response.data.msg || 'Not found (404)', type: 'error' }));
      }
      return response.data;
    } catch (error) {
      console.error('Callback API Error:', error);
      if (axios.isAxiosError(error)) {
        const errorData = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        };
        console.error('Axios Error Details:', errorData);

        return rejectWithValue(errorData.data?.message || error.message);
      }
      dispatch(showToast({ message: 'An unexpected error occurred', type: 'error' }));
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk to fetch transaction details
export const fetchTransactionDetails = createAsyncThunk(
  'pgTrxn/fetchTransactionDetails',
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const { uuid } = getUserData();
      const authHeaders = getAuthHeaders();

      if (!uuid) {
        throw new Error('Merchant UUID not found');
      }

      const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
      };

      const formattedDateFrom = filters.dateFrom ? formatDate(filters.dateFrom) : '';
      const formattedDateTo = filters.dateTo ? formatDate(filters.dateTo) : '';

      const response = await axios.get(
        `${BASE_URL}/api/merchant/transactionDetailsFilter?uuid=${uuid}&dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}&orderId=${filters.orderID || ''}&status=${filters.status || ''}&pageNo=${filters.pageNo || 1}&pageRecords=${filters.pageRecords || 10000}`,
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
        return rejectWithValue(errorData.data?.message || error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Async thunk to fetch customer-wise transactions
export const fetchCustomerWiseTransactions = createAsyncThunk(
  'pgTrxn/fetchCustomerWiseTransactions',
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const { uuid } = getUserData();
      const authHeaders = getAuthHeaders();

      if (!uuid) {
        throw new Error('Merchant UUID not found');
      }

      const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
      };

      const formattedDateFrom = filters.dateFrom ? formatDate(filters.dateFrom) : '';
      const formattedDateTo = filters.dateTo ? formatDate(filters.dateTo) : '';
      console.log('Filters:', filters);
      const response = await axios.get(
        `${BASE_URL}/api/merchant/customerWiseTransaction?uuid=${uuid}&dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}`,
        authHeaders
      );

      console.log('API Response:', response.data);
      const transactionDetails = response.data.extraData?.CustomerDetail;
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
        return rejectWithValue(errorData.data?.message || error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const fetchSeamlessTrxn = createAsyncThunk(
  'pgTrxn/fetchSeamlessTrxn',
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const { uuid } = getUserData();
      const authHeaders = getAuthHeaders();

      if (!uuid) {
        throw new Error('Merchant UUID not found');
      }

      console.log('Filters:', filters);
      const response = await axios.get(
        `${BASE_URL}/api/merchant/CustomerPgTransaction?uuid=${uuid}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}`,
        authHeaders
      );

      console.log('API Response:', response.data);
      const transactionDetails = response.data.extraData?.CustomerDetail;
      if (!Array.isArray(transactionDetails) || transactionDetails.length === 0) {
        const errorMessage = 'API response does not contain a valid CustomerDetail array or is empty';
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
        return rejectWithValue(errorData.data?.message || error.message);
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Create the slice
const pgTrxnSlice = createSlice({
  name: 'pgTrxn',
  initialState,
  reducers: {
    // Add any additional reducers if needed
    clearTransactions: (state) => {
      state.transactions = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch transactions';
        if (state.error) {
          // Use dispatch to show toast
        }
      })
      .addCase(fetchCustomerWiseTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerWiseTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchCustomerWiseTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch customer-wise transactions';
        if (state.error) {
          // Use dispatch to show toast
        }
      });

      // Add cases for seamless transactions
    builder
      .addCase(fetchSeamlessTrxn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeamlessTrxn.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchSeamlessTrxn.rejected, (state, action) => { 
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch seamless transactions';
        if (state.error) {
          // Use dispatch to show toast
        }
      });
  },
});

export const { clearTransactions } = pgTrxnSlice.actions;
export default pgTrxnSlice.reducer;