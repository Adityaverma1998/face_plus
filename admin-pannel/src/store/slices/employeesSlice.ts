import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "@/lib/api";

export interface Employee {
  id: string;
  company_id: string;
  employee_code: string;
  display_name: string;
  department?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

interface EmployeesState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  creating: boolean;
}

const initialState: EmployeesState = {
  employees: [],
  loading: false,
  error: null,
  creating: false,
};

export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Employee[]>("/employees?limit=250");
      return response.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (
    payload: {
      employee_code: string;
      display_name: string;
      department?: string;
      phone?: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post<Employee>("/employees", payload);
      dispatch(fetchEmployees());
      return response.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

export const updateEmployeeStatus = createAsyncThunk(
  "employees/updateEmployeeStatus",
  async (
    { id, is_active }: { id: string; is_active: boolean },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put<Employee>(`/employees/${id}`, {
        is_active,
      });
      dispatch(fetchEmployees());
      return response.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  }
);

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch employees";
      })
      .addCase(createEmployee.pending, (state) => {
        state.creating = true;
      })
      .addCase(createEmployee.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.creating = false;
        state.error = (action.payload as string) || "Failed to create employee";
      });
  },
});

export default employeesSlice.reducer;
