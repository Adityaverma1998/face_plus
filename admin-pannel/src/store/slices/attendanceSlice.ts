import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "@/lib/api";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  event_type: "check_in" | "check_out";
  punch_time: string;
  device_id?: string;
  match_score?: number;
  sync_idempotency_key: string;
  employees?: {
    employee_code: string;
    display_name: string;
    department?: string;
  };
}

interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  syncSuccess: boolean;
}

const initialState: AttendanceState = {
  records: [],
  loading: false,
  error: null,
  syncing: false,
  syncSuccess: false,
};

export const fetchAttendance = createAsyncThunk(
  "attendance/fetchAttendance",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<AttendanceRecord[]>("/attendance?limit=250");
      return response.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const triggerSyncBroadcast = createAsyncThunk(
  "attendance/triggerSyncBroadcast",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/sync/trigger-sync");
      // Refresh attendance logs after broadcast
      dispatch(fetchAttendance());
      return response.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    resetSyncSuccess: (state) => {
      state.syncSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch attendance logs";
      })
      .addCase(triggerSyncBroadcast.pending, (state) => {
        state.syncing = true;
        state.syncSuccess = false;
      })
      .addCase(triggerSyncBroadcast.fulfilled, (state) => {
        state.syncing = false;
        state.syncSuccess = true;
      })
      .addCase(triggerSyncBroadcast.rejected, (state, action) => {
        state.syncing = false;
        state.error = (action.payload as string) || "Failed to emit broadcast";
      });
  },
});

export const { resetSyncSuccess } = attendanceSlice.actions;
export default attendanceSlice.reducer;
