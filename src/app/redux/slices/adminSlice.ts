// Forget Password: Change Password With OTP

export const forgetPasswordChangeWithOTP = createAsyncThunk<
  { status: boolean | string; msg: string },
  { userEmail: string; otp: string; newPassword: string },
  { rejectValue: string }
>(
  'admin/forgetPasswordChangeWithOTP',
  async ({ userEmail, otp, newPassword }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/admin/forgetPasswordChangeWithOTP`,
        { userEmail, otp, newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = res.data;
      if (!(data.status === true || data.status === '200')) {
        const errorMsg =
          data.msg?.message ||
          (Array.isArray(data.msg) ? data.msg[0] : data.msg) ||
          'Failed to change password';
        return rejectWithValue(errorMsg);
      }
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { msg?: string } }; message?: string };
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to change password');
    }
  }
);
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '@/app/config';

interface AdminState {
  user: { uuid: string } | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AdminState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
};

// Forget Password: Generate OTP

export const forgetPasswordGenerateOTP = createAsyncThunk<
  { status: boolean | string; msg: string },
  string,
  { rejectValue: string }
>(
  'admin/forgetPasswordGenerateOTP',
  async (userEmail, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/admin/forgetPasswordGenerateOTP?userEmail=${encodeURIComponent(userEmail)}`
      );
      const data = res.data;
      if (!(data.status === true || data.status === '200')) {
        const errorMsg =
          data.msg?.message ||
          (Array.isArray(data.msg) ? data.msg[0] : data.msg) ||
          'Failed to generate OTP';
        return rejectWithValue(errorMsg);
      }
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { msg?: string } }; message?: string };
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to generate OTP');
    }
  }
);

// Forget Password: Resend OTP

export const forgetPasswordResendOTP = createAsyncThunk<
  { status: boolean | string; msg: string },
  string,
  { rejectValue: string }
>(
  'admin/forgetPasswordResendOTP',
  async (userEmail, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/admin/forgetPasswordResendOTP?userEmail=${encodeURIComponent(userEmail)}`
      );
      const data = res.data;
      if (!(data.status === true || data.status === '200')) {
        const errorMsg =
          data.msg?.message ||
          (Array.isArray(data.msg) ? data.msg[0] : data.msg) ||
          'Failed to resend OTP';
        return rejectWithValue(errorMsg);
      }
      return data;
    } catch (err) {
      const error = err as { response?: { data?: { msg?: string } }; message?: string };
      return rejectWithValue(error.response?.data?.msg || error.message || 'Failed to resend OTP');
    }
  }
);

export const loginAdmin = createAsyncThunk<
  { user: { uuid: string }; token: string },
  { email: string; password: string },
  { rejectValue: string }
>(
  'admin/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/user/login`,
        {
          ipAddress: '127.0.0.1',
          password,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          userNameOrEmail: email,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const data = res.data;
      if (!(data.status === true || data.status === '200')) {
        const errorMsg =
          data.msg?.message ||
          (Array.isArray(data.msg) ? data.msg[0] : data.msg) ||
          'Login failed';
        return rejectWithValue(errorMsg);
      }
      const token = data.extraData?.loginData?.jwtToken;
      if (token) {
        localStorage.setItem(
          'userData',
          JSON.stringify({
            token: data.extraData?.loginData?.jwtToken,
            uuid: data.extraData.loginData.uuid,
          })
        );
      }
      return { user: { uuid: data.extraData.loginData.uuid }, token };
    } catch (err) {
      const error = err as { response?: { data?: { msg?: string } }; message?: string };
      return rejectWithValue(error.response?.data?.msg || error.message || 'Login failed');
    }
  }
);

export const logoutAdmin = createAsyncThunk('admin/logout', async () => {
  try {
    await axios.post(
      `${BASE_URL}/api/user/logout`,
      {},
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const error = err as { response?: { data?: { msg?: string } }; message?: string };
    console.log('Logout failed:', error);
  }
  // Always remove userData, even if API call fails
  localStorage.removeItem('userData');
  return true;
});


const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    rehydrateAdmin(state) {
      if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          const userData = JSON.parse(storedData);
          state.token = userData.token || null;
          state.user = userData.uuid ? { uuid: userData.uuid } : null;
          state.status = 'succeeded';
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action: PayloadAction<{ user: { uuid: string }; token: string }>) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error';
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Forget Password OTP
      .addCase(forgetPasswordGenerateOTP.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgetPasswordGenerateOTP.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(forgetPasswordGenerateOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(forgetPasswordResendOTP.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgetPasswordResendOTP.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(forgetPasswordResendOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Forget Password Change With OTP
      .addCase(forgetPasswordChangeWithOTP.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(forgetPasswordChangeWithOTP.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(forgetPasswordChangeWithOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { rehydrateAdmin } = adminSlice.actions;
export default adminSlice.reducer;
