import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Lazy loading components
const Landing = lazy(() => import("./components/home/Landing"));
const AdminRegistrationForm = lazy(() => import("./components/auth/AdminRegistrationForm"));
const AdminLoginForm = lazy(() => import("./components/auth/AdminLoginForm"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const StudentLoginForm = lazy(() => import("./components/auth/StudentLoginForm"));
const FacultyLoginForm = lazy(() => import("./components/auth/FacultyLoginForm"));
const FacultyDashboard = lazy(() => import("./components/faculty/FacultyDashboard"));

const About = () => <h1>About Page</h1>;
const Contact = () => <h1>Contact Page</h1>;
const NotFound = () => <h1>404 - Not Found</h1>;

const App = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin-register" element={<AdminRegistrationForm />} />        
          <Route path="/admin-login" element={<AdminLoginForm />} />        
          <Route path="/admin-dashboard" element={<AdminDashboard />} />     
          <Route path="/faculty-login" element={<FacultyLoginForm />} />        
          <Route path="/faculty-dashboard" element={<FacultyDashboard />} />     
          <Route path="/student-login" element={<StudentLoginForm />} />        
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
