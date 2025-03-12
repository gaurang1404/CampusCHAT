import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./components/home/Landing";
import AdminRegistrationForm from "./components/auth/AdminRegistrationForm";
import AdminLoginForm from "./components/auth/AdminLoginForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import StudentLoginForm from "./components/auth/StudentLoginForm";
import FacultyLoginForm from "./components/auth/FacultyLoginForm";
import FacultyDashboard from "./components/faculty/FacultyDashboard";

const About = () => <h1>About Page</h1>;
const Contact = () => <h1>Contact Page</h1>;
const NotFound = () => <h1>404 - Not Found</h1>;

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin-register" element={<AdminRegistrationForm />} />        
        <Route path="/admin-login" element={<AdminLoginForm />} />        
        <Route path="/admin-dashboard" element={<AdminDashboard />} />     
        <Route path="/faculty-login" element={<FacultyLoginForm />} />        
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />     
        <Route path="/student-login" element={<StudentLoginForm />} />        
      </Routes>
    </Router>
  );
};

export default App;
