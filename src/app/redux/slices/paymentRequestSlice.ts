import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import getAuthHeaders from '../../utils/getAuthHeaders';
import getUserData from '../../utils/getUserData';

// Define the initial state
const initialState = {
  customerReport: [],
  status: 'idle',
  error: null as unknown | null,
};

// Async thunk to fetch customer API request report
export const fetchCustomerApiRequestReport = createAsyncThunk(
  'paymentRequest/fetchCustomerApiRequestReport',
  async (_, { rejectWithValue }) => {
    try {
      const { uuid } = getUserData();
      const headers = getAuthHeaders();
      const response = await axios.get(`/api/merchant/getCustomerApiRequestReport?uuid=${uuid}`, headers);
      console.log('Response:', response);
      return response.data.extraData.customerReport;
    } catch (err) {
      const error = err as { response?: { data?: unknown }; message?: string };
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create the slice
const paymentRequestSlice = createSlice({
  name: 'paymentRequest',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerApiRequestReport.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomerApiRequestReport.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customerReport = action.payload;
      })
      .addCase(fetchCustomerApiRequestReport.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default paymentRequestSlice.reducer;
