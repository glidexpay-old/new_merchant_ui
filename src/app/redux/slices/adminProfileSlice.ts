import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '@/app/config';
import getAuthHeaders from '@/app/utils/getAuthHeaders';
import getUserData from '@/app/utils/getUserData';
import { logoutAdmin } from './adminSlice';


export const fetchAdminProfile = createAsyncThunk(
  'adminProfile/fetchAdminProfile',
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Get UUID from local storage
      const { uuid } = getUserData();
      if (!uuid) {
        return rejectWithValue('UUID not found in local storage');
      }
      const res = await axios.get(`${BASE_URL}/api/getMerchantDetails?uuid=${uuid}`, getAuthHeaders());

      // ✅ FIX: Check statusCode should be 200
      if (res.data.statusCode !== 200) {
        return rejectWithValue(res.data.msg?.[0] || 'Failed to fetch admin details');
      }

      // ✅ Return only MerchantDetails
      console.log('Admin Details:', res.data.extraData?.MerchantDetails);
      return res.data.extraData?.MerchantDetails;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { msg?: string[] } }; message?: string };
      return rejectWithValue(error.response?.data?.msg?.[0] || error.message || 'Failed to fetch admin details');
    }
  }
);

interface AdminProfile {
  merchantAppId: string;
  merchantEmail: string;
  merchantPhone?: string;
  merchantSecret?: string;
  merchantKyc?: string;
  merchantOtpStatus?: string;
  merchantSaltKey?: string;
  merchantName: string;
}

const adminProfileSlice = createSlice({
  name: 'adminProfile',
  initialState: {
    profile: null as AdminProfile | null,
    status: 'idle',
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload; // ✅ Now profile is just adminDetail object
        state.error = null;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Clear profile on logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.profile = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export default adminProfileSlice.reducer;
