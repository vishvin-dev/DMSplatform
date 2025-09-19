import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postMisReport } from '../../helpers/fakebackend_helper'; // Adjust the import path as needed

// Async thunk for generating report
export const generateReport = createAsyncThunk(
  'misReport/generateReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await postMisReport(payload);
      if (response.status === 'success') {
        return response;
      } else {
        return rejectWithValue(response.displayMessage || "Failed to generate report");
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.displayMessage ||
        error.message ||
        "An error occurred while generating the report"
      );
    }
  }
);

const initialState = {
  reportData: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

const misReportSlice = createSlice({
  name: 'misReport',
  initialState,
  reducers: {
    clearReportData: (state) => {
      state.reportData = null;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reportData = action.payload.data;
        state.successMessage = action.payload.displayMessage || "Report generated successfully";
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReportData } = misReportSlice.actions;
export default misReportSlice.reducer;