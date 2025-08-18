import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '@/app/config';
import getAuthHeaders from '@/app/utils/getAuthHeaders';
import getUserData from '@/app/utils/getUserData';

const initialState = {
  bulkPayoutData: null,
  bulkPayoutStatusData: null,
  loading: false,
  error: null as string | null,
};

interface BulkPayoutParams {
  file: File;
}

interface BulkPayoutStatusParams {
  endDate?: string;
  startDate?: string;
  status?: string;
}

// Async thunk for bulk payout
// In your bulkPayoutSlice.ts, modify the bulkPayout thunk:
export const bulkPayout = createAsyncThunk(
  'bulkPayout/bulkPayout',
  async ({ file, signal }: BulkPayoutParams & { signal?: AbortSignal }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { uuid } = getUserData();
      const storedData = localStorage.getItem("userData");
      const userData = storedData ? JSON.parse(storedData) : null;
      const token = userData.token;
      console.log('Token:', token);
      console.log('UUID:', uuid); 

      const response = await axios.post(
        `${BASE_URL}/api/payout/merchant/bulkpayout?uuid=${uuid}`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          signal // Pass the abort signal to axios
        }
      );

      // If backend returns statusCode 404 in response.data, treat as error
      if (response.data && response.data.statusCode === 404) {
        // This will be caught by the catch block as a rejected value
        return rejectWithValue('file is wrong uploaded');
      }

      console.log('Bulk Payout Response:', response.data);
      // Log the response for debugging
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.name === 'CanceledError') {
          return rejectWithValue('Upload cancelled');
        }
        return rejectWithValue(error.response?.data?.msg || 'Upload failed');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);
// Async thunk for bulk payout status
export const bulkPayoutStatus = createAsyncThunk(
  'bulkPayout/bulkPayoutStatus',
  async (filters: BulkPayoutStatusParams = {}, { rejectWithValue }) => {
    try {
      const { uuid } = getUserData();
      console.log("request for filterrrrrrr", filters);
      // Build query params dynamically
      const params = [
        `uuid=${uuid}`
      ];
      if (filters.startDate) params.push(`startDate=${filters.startDate}`);
      if (filters.endDate) params.push(`endDate=${filters.endDate}`);
      if (filters.status) params.push(`status=${filters.status}`);
      const url = `${BASE_URL}/api/payout/merchant/bulkpayout/status?${params.join('&')}`;
      console.log('Final Bulk Payout Status URL:', url);
      const response = await axios.post(
        url,
        {},
        getAuthHeaders()
      );
      console.log('Bulk Payout Status Responseeeeeeeeee:', response.data);
      let data = null;
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      if (data && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.error('Bulk Payout Status Error:', error);
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data || 'Something went wrong');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

export const bulkPayout2 = createAsyncThunk(
  'bulkPayout/bulkPayout2',
  async (_, { rejectWithValue }) => {
    try {

      const { uuid } = getUserData();
      const storedData = localStorage.getItem("userData");
      const userData = storedData ? JSON.parse(storedData) : null;
      const token = userData.token;
      console.log('Token:', token);
      console.log('UUID:', uuid); 

    
      const response = await axios.post(
        `${BASE_URL}/api/payout/merchant/bulkpayout/status?uuid=${uuid}`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // If backend returns statusCode 404 in response.data, treat as error
      if (response.data && response.data.statusCode === 404) {
        // This will be caught by the catch block as a rejected value
        return rejectWithValue('file is wrong uploaded');
      }

      console.log('Bulk Payout Response:', response.data);
      // Log the response for debugging
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.name === 'CanceledError') {
          return rejectWithValue('Upload cancelled');
        }
        return rejectWithValue(error.response?.data?.msg || 'Upload failed');
      }
      return rejectWithValue('An unexpected error occurred');
    }
  }
);

// Slice
const bulkPayoutSlice = createSlice({
  name: 'bulkPayout',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(bulkPayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkPayout.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkPayoutData = action.payload;
      })
      .addCase(bulkPayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? String(action.payload) : null;
      })
      .addCase(bulkPayoutStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkPayoutStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkPayoutStatusData = action.payload;
      })
      .addCase(bulkPayoutStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? String(action.payload) : null;
      });

      // Handle bulkPayout2 similarly if needed
      builder
      .addCase(bulkPayout2.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkPayout2.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkPayoutData = action.payload;
      })
      .addCase(bulkPayout2.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ? String(action.payload) : null;
      });
  },
});

export default bulkPayoutSlice.reducer;
