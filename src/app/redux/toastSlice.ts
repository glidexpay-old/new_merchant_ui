import { createSlice, PayloadAction } from '@reduxjs/toolkit';



interface ToastState {
  message: string;
  show: boolean;
  errorDetails?: string | null;
  type?: 'success' | 'error';
}

const initialState: ToastState = {
  message: '',
  show: false,
  errorDetails: null,
  type: undefined,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast(
      state,
      action: PayloadAction<{ message: string; errorDetails?: string | null; type?: 'success' | 'error' } | string>
    ) {
      if (typeof action.payload === 'string') {
        state.message = action.payload;
        state.errorDetails = null;
        state.type = undefined;
      } else {
        state.message = action.payload.message;
        state.errorDetails = action.payload.errorDetails || null;
        state.type = action.payload.type;
      }
      state.show = true;
    },
    hideToast(state) {
      state.show = false;
      state.message = '';
      state.errorDetails = null;
      state.type = undefined;
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export default toastSlice.reducer;
