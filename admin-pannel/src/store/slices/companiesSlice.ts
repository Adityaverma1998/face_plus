import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "@/lib/api";

export interface Company {
  id: string;
  company_code: string;
  company_name: string;
  is_active: boolean;
  created_at: string;
  employee_count: number;
}

interface CompaniesState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  creating: boolean;
}

const initialState: CompaniesState = {
  companies: [],
  loading: false,
  error: null,
  creating: false,
};

export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Company[]>("/superadmin/companies");
      return response.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (
    payload: {
      company_code: string;
      company_name: string;
      admin_username: string;
      admin_password: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post("/superadmin/companies", payload);
      dispatch(fetchCompanies());
      return response.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const createTerminal = createAsyncThunk(
  "companies/createTerminal",
  async (
    payload: {
      companyId: string;
      username: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(
        `/superadmin/companies/${payload.companyId}/terminals`,
        {
          username: payload.username,
          password: payload.password,
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch companies";
      })
      .addCase(createCompany.pending, (state) => {
        state.creating = true;
      })
      .addCase(createCompany.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.creating = false;
        state.error = (action.payload as string) || "Failed to create company";
      });
  },
});

export default companiesSlice.reducer;
