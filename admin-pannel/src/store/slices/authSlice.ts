import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "@/lib/api";

export interface AuthUser {
  username: string;
  role: "super_admin" | "company_admin" | "terminal";
  company_id?: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Initial state hydrated from localStorage if available in browser
const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("facepulse_token");
    const userStr = localStorage.getItem("facepulse_user");
    if (token && userStr) {
      try {
        return {
          token,
          user: JSON.parse(userStr),
          loading: false,
          error: null,
          isAuthenticated: true,
        };
      } catch {
        // Fallback if parsing fails
      }
    }
  }
  return {
    token: null,
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  };
};

export interface LoginPayload {
  company_code: string | null;
  username: string;
  password: string;
}

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const data = response.data;
      const user: AuthUser = {
        username: data.username,
        role: data.role,
        company_id: data.company_id,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("facepulse_token", data.access_token);
        localStorage.setItem("facepulse_user", JSON.stringify(user));
      }

      return { token: data.access_token, user };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("facepulse_token");
        localStorage.removeItem("facepulse_user");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
