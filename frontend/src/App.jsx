import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store"; // Import your Redux store
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useSelector } from "react-redux";

// Lazy loading components
const Landing = lazy(() => import("./components/home/Landing"));
const AdminRegistrationForm = lazy(() => import("./components/auth/AdminRegistrationForm"));
const AdminLoginForm = lazy(() => import("./components/auth/AdminLoginForm"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const StudentLoginForm = lazy(() => import("./components/auth/StudentLoginForm"));
const FacultyLoginForm = lazy(() => import("./components/auth/FacultyLoginForm"));
const FacultyDashboard = lazy(() => import("./components/faculty/FacultyDashboard"));

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin-register" element={<AdminRegistrationForm />} />
            <Route path="/admin-login" element={<AdminLoginForm />} />
            <Route path="/faculty-login" element={<FacultyLoginForm />} />
            <Route path="/student-login" element={<StudentLoginForm />} />

            {/* Protected Routes */}
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/faculty-dashboard" element={<ProtectedRoute allowedRoles={["Faculty"]}><FacultyDashboard /></ProtectedRoute>} />

          </Routes>
        </Suspense>
      </Router>
    </Provider>
    
  );
};

export default App;
