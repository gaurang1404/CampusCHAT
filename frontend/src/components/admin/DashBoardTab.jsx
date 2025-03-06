import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CollegeOverview } from './CollegeOverview';
import { StudentDistribution } from './StudentDistribution';
import { FacultyDistribution } from './FacultyDistribution';
import { EnrollmentDetails } from './EnrollmentDetails';

// Import API URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL;

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  }
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: i => ({ 
    opacity: 1, 
    x: 0,
    transition: { 
      delay: i * 0.05,
      duration: 0.3
    }
  })
};

// Component for the dashboard tab
const DashboardTab = () => {
  const [dashboardData, setDashboardData] = useState({
    students: [],
    faculty: [],
    courses: [],
    departments: [],
    studentDistribution: [],
    facultyDistribution: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get token from localStorage or sessionStorage
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        // Set up Axios headers with the token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch data from multiple endpoints with Authorization
        let [studentsRes, facultyRes, coursesRes, departmentsRes] = await Promise.all([
          axios.get(`${apiUrl}/api/student/`, config),
          axios.get(`${apiUrl}/api/faculty/`, config),
          axios.get(`${apiUrl}/api/course/`, config),
          axios.get(`${apiUrl}/api/department/`, config)
        ]);
        
        studentsRes = studentsRes.data.data.students
        facultyRes = facultyRes.data.data.faculties;
        coursesRes = coursesRes.data.data
        departmentsRes = departmentsRes.data.data.departments
                
        // Process the data for student distribution by department
        const studentsByDepartment = {};
        studentsRes.forEach(student => {
          if (student.departmentId.name) {
            studentsByDepartment[student.departmentId.name] = (studentsByDepartment[student.departmentId.name] || 0) + 1;
          }
        });
        
        const studentDistribution = Object.keys(studentsByDepartment).map(department => ({
          department,
          count: studentsByDepartment[department]
        }));
        
        // Process the data for faculty distribution by department
        const facultyByDepartment = {};
        facultyRes.forEach(faculty => {
          if (faculty.departmentId.name) {
            facultyByDepartment[faculty.departmentId.name] = (facultyByDepartment[faculty.departmentId.name] || 0) + 1;
          }
        });
        
        const facultyDistribution = Object.keys(facultyByDepartment).map(department => ({
          department,
          count: facultyByDepartment[department]
        }));
        
        // Update state with fetched data
        setDashboardData({
          students: studentsRes,
          faculty: facultyRes,
          courses: coursesRes,
          departments: departmentsRes,
          studentDistribution,
          facultyDistribution
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const enrollmentTrend = [
    // { semester: 'Fall 2023', students: 1500 },
    // { semester: 'Spring 2024', students: 1620 },
    // { semester: 'Summer 2024', students: 980 },
    // { semester: 'Fall 2024', students: 1640 },
    // { semester: 'Spring 2025', students: 1710 },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg text-red-800">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <CollegeOverview 
        cardVariants={cardVariants} 
        containerVariants={containerVariants}
        itemVariants={itemVariants}
        students={dashboardData.students}
        faculty={dashboardData.faculty}
        courses={dashboardData.courses}
        departments={dashboardData.departments}        
      />      

      <StudentDistribution
        cardVariants={cardVariants} 
        containerVariants={containerVariants}
        itemVariants={itemVariants}
        studentDistribution={dashboardData.studentDistribution}
      />

      <FacultyDistribution
        cardVariants={cardVariants} 
        containerVariants={containerVariants}
        itemVariants={itemVariants}
        faculty={dashboardData.facultyDistribution}
      />      

      <EnrollmentDetails
        cardVariants={cardVariants} 
        enrollmentTrend={enrollmentTrend}
      />      
    </motion.div>
  );
};

export default DashboardTab;