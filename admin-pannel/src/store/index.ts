import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import companiesReducer from "./slices/companiesSlice";
import attendanceReducer from "./slices/attendanceSlice";
import employeesReducer from "./slices/employeesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companiesReducer,
    attendance: attendanceReducer,
    employees: employeesReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
