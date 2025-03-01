import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import store, {persistor} from './redux/store';
import App from './App';
import { Toaster } from 'sonner';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>        
      <PersistGate loading={null} persistor={persistor}>
            <App />
            <Toaster />
        </PersistGate>
    </Provider>
  </React.StrictMode>
);

