import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showToast } from '@/app/redux/toastSlice';
import axios from 'axios';
import { BASE_URL } from '@/app/config';
import getAuthHeaders from '@/app/utils/getAuthHeaders';
import getUserData from '@/app/utils/getUserData';

const initialState = {
    transactions: [],
    loading: false,
    error: null as string | null,
    balance: null as number | null, // Added balance property
    walletBalance: null as string | null, // Added walletBalance property
};

interface PayoutTransactionFilters {
    dateFrom?: string;
    dateTo?: string;
    merchantOrderId?: string;
    status?: string;
    transactionType?: string;
}

interface walletReportFilters {
    dateFrom?: string;
    dateTo?: string;
    transactionType?: string;
}

interface payoutManagementFilters {
    dateFrom?: string;
    dateTo?: string;
}

export const payoutTransaction = createAsyncThunk(
    'payout/payoutTransaction',
    async (filters: PayoutTransactionFilters, { rejectWithValue }) => {
        try {
            const { uuid } = getUserData();
            const response = await axios.post(
                `${BASE_URL}/api/payout/transactionReportFilter?uuid=${uuid}`,
                {},
                {
                    headers: getAuthHeaders().headers, // Explicitly pass headers
                    params: filters,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data || 'Something went wrong');
            }
            return rejectWithValue('An unexpected error occurred');
        }
    }
);

export const walletReport = createAsyncThunk(
    'payout/walletReport',
    async (filters: walletReportFilters, { rejectWithValue, dispatch }) => {
        try {
            const { uuid } = getUserData();

            console.log('Filters:', filters); // Log the filters being sent
            const response = await axios.post(
                `${BASE_URL}/api/payout/walletReport?uuid=${uuid}&dateFrom=${filters.dateFrom}&dateTo=${filters.dateTo}&transactionType=${filters.transactionType}`,
                {},
                {
                    headers: getAuthHeaders().headers, // Explicitly pass headers
                }
            );
            console.log('Wallet Report Response:', response.data); // Log the response data

            // Handle API 404 in response body
            if (response.data && response.data.statusCode === 404) {
                dispatch(showToast({
                    message: response.data.msg?.[0] || 'User not found',
                    type: 'error',
                }));
                return rejectWithValue(response.data);
            }

            return response.data;
        } catch (error) {
            console.log('Wallet Report Error:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 404) {
                    // Dispatch toast via Redux
                    dispatch(showToast({
                        message: error.response.data?.msg?.[0] || 'User not found',
                        type: 'error',
                    }));
                }
                return rejectWithValue(error.response?.data || 'Something went wrong');
            }
            return rejectWithValue('An unexpected error occurred');
        }
    }
);

export const payoutManagement = createAsyncThunk(
    'payout/payoutManagement',
    async (filters: payoutManagementFilters, { rejectWithValue }) => {
        try {
            const { uuid } = getUserData();
            const response = await axios.post(
                `${BASE_URL}/api/payout/transactionReport?uuid=${uuid}`,
                {},
                {
                    headers: getAuthHeaders().headers, // Explicitly pass headers
                    params: filters,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data || 'Something went wrong');
            }
            return rejectWithValue('An unexpected error occurred');
        }
    }
);

export const balanceCheck = createAsyncThunk(
    'payout/balanceCheck',
    async (_, { rejectWithValue }) => {
        try {
            const { uuid } = getUserData();
            const response = await axios.get(
                `${BASE_URL}/api/payout/balanceCheck`,
                {
                    headers: {
                        ...getAuthHeaders().headers,
                        merchantId: uuid
                    }
                }
            );

            console.log('Balance Check Response:', response.data); // Log the response data
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(error.response?.data || 'Something went wrong');
            }
            return rejectWithValue('An unexpected error occurred');
        }
    }
);


const payoutSlice = createSlice({
    name: 'payout',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(payoutTransaction.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(payoutTransaction.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(payoutTransaction.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? String(action.payload) : null;
            });
        // Handle walletReport similarly if needed
        builder
            .addCase(walletReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(walletReport.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(walletReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? String(action.payload) : null;
            });

        // Handle payoutManagement similarly if needed
        builder
            .addCase(payoutManagement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(payoutManagement.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(payoutManagement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? String(action.payload) : null;
            });

        // Handle balanceCheck similarly if needed
        builder
            .addCase(balanceCheck.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(balanceCheck.fulfilled, (state, action) => {
                state.loading = false;
                state.walletBalance = action.payload.walletBalance; // Update walletBalance
            })
            .addCase(balanceCheck.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ? String(action.payload) : null;
            });
    },
});

export default payoutSlice.reducer;
