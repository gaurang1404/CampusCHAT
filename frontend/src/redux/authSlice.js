import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: false,
        user: null,
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            console.log("user set");
        },        
        logout: (state) => {            
            state.loading = false;
            state.user = false;
            console.log("auth state reset");
        },
    },
});

export const { setLoading, setUser, setCollege, logout } = authSlice.actions;
export default authSlice.reducer;
