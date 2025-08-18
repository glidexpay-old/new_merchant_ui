import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import getAuthHeaders from '@/app/utils/getAuthHeaders';
import { BASE_URL } from '@/app/config';
import getUserData from '@/app/utils/getUserData';

// Define types
interface ComplaintDetails {
  id: string;
  description: string;
  status: string;
  createdAt: string;
}

interface ComplaintState {
  complaintDetails: ComplaintDetails | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: ComplaintState = {
  complaintDetails: null,
  status: 'idle',
  error: null,
};

// Async thunk to fetch complaint details
export const fetchComplaintDetails = createAsyncThunk(
  'complaint/fetchComplaintDetails',
  async (_, { rejectWithValue }) => {
    try {
        const {uuid} = getUserData();
      const authHeaders = getAuthHeaders();
      const response = await axios.get(`${BASE_URL}/api/merchant/complaintDetails?uuid=${uuid}`, authHeaders);
      console.log("Response Data:", response.data); // Debugging line
      return response.data;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Something went wrong';
      return rejectWithValue(errorMessage);
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaintDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchComplaintDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.complaintDetails = action.payload;
      })
      .addCase(fetchComplaintDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default complaintSlice.reducer;
