import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from "react-redux";
import store from './redux/store';
import App from './App';
import { Toaster } from 'sonner';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>  
      <App />
      <Toaster />
    </Provider>
  </React.StrictMode>
);

