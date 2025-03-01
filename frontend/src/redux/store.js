import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage
import authSlice from "./authSlice"; // Adjust the path if needed

// Persist Config
const persistConfig = {
    key: "root",
    storage,
};

// Combine reducers
const rootReducer = combineReducers({
    auth: authSlice,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Required for Redux Persist
        }),
});

// Create persistor
export const persistor = persistStore(store);

export default store;
