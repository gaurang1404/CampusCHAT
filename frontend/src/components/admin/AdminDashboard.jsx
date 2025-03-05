import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, Building, Calendar, LayoutDashboard, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { logout } from "@/redux/authSlice";
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
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

const DataList = ({ title, description, data, columns, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-100">
                <tr>
                  {columns.map((column, index) => (
                    <th key={index} className="px-4 py-2">{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, i) => (
                    <motion.tr 
                      key={item.id || i} 
                      className="border-b hover:bg-gray-50"
                      custom={i}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ backgroundColor: "#f8f9fa", transition: { duration: 0.1 } }}
                    >
                      {columns.map((column, index) => (
                        <td key={index} className="px-4 py-2">{item[column.key]}</td>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main component
const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State for API data
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Loading and error states
  const [loadingStates, setLoadingStates] = useState({
    departments: true,
    semesters: true,
    sections: true,
    faculty: true,
    students: true,
    courses: true
  });
  
  const [errorStates, setErrorStates] = useState({
    departments: null,
    semesters: null,
    sections: null,
    faculty: null,
    students: null,
    courses: null
  });

  // Fetch data when tab changes
  useEffect(() => {
    const fetchTabData = async () => {
      // Only fetch data for the active tab to optimize performance
      switch(activeTab) {
        case "departments":
          if (departments.length === 0) {
            fetchDepartments();
          }
          break;
        case "semesters":
          if (semesters.length === 0) {
            fetchSemesters();
          }
          break;
        case "sections":
          if (sections.length === 0) {
            fetchSections();
          }
          break;
        case "faculty":
          if (faculty.length === 0) {
            fetchFaculty();
          }
          break;
        case "students":
          if (students.length === 0) {
            fetchStudents();
          }
          break;
        case "courses":
          if (courses.length === 0) {
            fetchCourses();
          }
          break;
        default:
          break;
      }
    };
    
    fetchTabData();
  }, [activeTab]);

  // Fetch functions for each data type
  const fetchDepartments = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, departments: true }));
      const response = await axios.get(`${apiUrl}/api/department/`);
      setDepartments(response.data);
      setLoadingStates(prev => ({ ...prev, departments: false }));
    } catch (err) {
      console.error("Error fetching departments:", err);
      setErrorStates(prev => ({ ...prev, departments: "Failed to load departments" }));
      setLoadingStates(prev => ({ ...prev, departments: false }));
    }
  };
  
  const fetchSemesters = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, semesters: true }));
      // This endpoint is assumed - replace with your actual semester endpoint
      const response = await axios.get(`${apiUrl}/api/semester/`);
      setSemesters(response.data);
      setLoadingStates(prev => ({ ...prev, semesters: false }));
    } catch (err) {
      console.error("Error fetching semesters:", err);
      setErrorStates(prev => ({ ...prev, semesters: "Failed to load semesters" }));
      setLoadingStates(prev => ({ ...prev, semesters: false }));
    }
  };
  
  const fetchSections = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, sections: true }));
      // This endpoint is assumed - replace with your actual section endpoint
      const response = await axios.get(`${apiUrl}/api/section/`);
      setSections(response.data);
      setLoadingStates(prev => ({ ...prev, sections: false }));
    } catch (err) {
      console.error("Error fetching sections:", err);
      setErrorStates(prev => ({ ...prev, sections: "Failed to load sections" }));
      setLoadingStates(prev => ({ ...prev, sections: false }));
    }
  };
  
  const fetchFaculty = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, faculty: true }));
      const response = await axios.get(`${apiUrl}/api/faculty/`);
      setFaculty(response.data);
      setLoadingStates(prev => ({ ...prev, faculty: false }));
    } catch (err) {
      console.error("Error fetching faculty:", err);
      setErrorStates(prev => ({ ...prev, faculty: "Failed to load faculty" }));
      setLoadingStates(prev => ({ ...prev, faculty: false }));
    }
  };
  
  const fetchStudents = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, students: true }));
      const response = await axios.get(`${apiUrl}/api/student/`);
      setStudents(response.data);
      setLoadingStates(prev => ({ ...prev, students: false }));
    } catch (err) {
      console.error("Error fetching students:", err);
      setErrorStates(prev => ({ ...prev, students: "Failed to load students" }));
      setLoadingStates(prev => ({ ...prev, students: false }));
    }
  };
  
  const fetchCourses = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, courses: true }));
      const response = await axios.get(`${apiUrl}/api/course/`);
      setCourses(response.data);
      setLoadingStates(prev => ({ ...prev, courses: false }));
    } catch (err) {
      console.error("Error fetching courses:", err);
      setErrorStates(prev => ({ ...prev, courses: "Failed to load courses" }));
      setLoadingStates(prev => ({ ...prev, courses: false }));
    }
  };

  // Handle navigation functions
  const handleHomeClick = () => {
    navigate("/");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Button animation variants
  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Define column mappings for each data type
  const departmentColumns = [
    { key: 'name', label: 'Department' },
    { key: 'courses', label: 'Courses' },
    { key: 'faculty', label: 'Faculty' },
    { key: 'students', label: 'Students' }
  ];
  
  const semesterColumns = [
    { key: 'name', label: 'Term' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'status', label: 'Status' },
    { key: 'courses', label: 'Courses' },
    { key: 'students', label: 'Students' }
  ];
  
  const sectionColumns = [
    { key: 'courseCode', label: 'Code' },
    { key: 'courseName', label: 'Course Name' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'students', label: 'Students' },
    { key: 'room', label: 'Room' }
  ];
  
  const facultyColumns = [
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'courses', label: 'Courses' },
    { key: 'students', label: 'Students' }
  ];
  
  const studentColumns = [
    { key: 'name', label: 'Name' },
    { key: 'major', label: 'Major' },
    { key: 'gpa', label: 'GPA' },
    { key: 'credits', label: 'Credits' }
  ];
  
  const courseColumns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'credits', label: 'Credits' },
    { key: 'students', label: 'Students' }
  ];

  return (
    <div>
      <div className='bg-[#63144c]'>
        <motion.header 
          className="mb-6 pt-10 pb-6 pl-4 max-w-[1200px] mx-auto flex justify-between items-center"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div>
            <motion.h1 
              className="text-4xl font-extrabold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Admin Dashboard
            </motion.h1>
            <motion.p 
              className="text-white mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Manage departments, faculty, students, and courses
            </motion.p>
          </div>
          <div className="flex gap-3 pr-4">
            <motion.button
              onClick={handleHomeClick}
              className="bg-white text-[#63144c] hover:bg-gray-100 px-4 py-2 rounded-md flex items-center gap-2 font-medium"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Home className="h-4 w-4" />
              <span className="hidden md:inline">Home</span>
            </motion.button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <motion.button                  
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md flex items-center gap-2 font-medium"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </motion.button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Are you sure you want to logout?</DialogTitle>
                  <DialogDescription>
                    You will be logged out and redirected to the home page.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-800">Logout</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.header>
      </div>

      <div className="p-4 max-w-[1200px] mx-auto">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TabsList className="grid grid-cols-7 mb-4">
              {[
                { value: "dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
                { value: "departments", icon: <Building className="h-4 w-4" />, label: "Departments" },
                { value: "semesters", icon: <Calendar className="h-4 w-4" />, label: "Semesters" },
                { value: "sections", icon: <LayoutDashboard className="h-4 w-4" />, label: "Sections" },
                { value: "faculty", icon: <GraduationCap className="h-4 w-4" />, label: "Faculty" },
                { value: "students", icon: <Users className="h-4 w-4" />, label: "Students" },
                { value: "courses", icon: <BookOpen className="h-4 w-4" />, label: "Courses" }
              ].map((tab, index) => (
                <motion.div
                  key={tab.value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <TabsTrigger value={tab.value} className="flex gap-1 items-center">
                    {tab.icon}
                    <span className="hidden md:inline">{tab.label}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="dashboard">
                <DashboardTab />
              </TabsContent>

              <TabsContent value="departments">
                <DataList
                  title="Departments"
                  description="All academic departments"
                  data={departments}
                  columns={departmentColumns}
                  isLoading={loadingStates.departments}
                  error={errorStates.departments}
                />
              </TabsContent>

              <TabsContent value="semesters">
                <DataList
                  title="Semesters"
                  description="Academic terms"
                  data={semesters}
                  columns={semesterColumns}
                  isLoading={loadingStates.semesters}
                  error={errorStates.semesters}
                />
              </TabsContent>

              <TabsContent value="sections">
                <DataList
                  title="Class Sections"
                  description="Current course sections"
                  data={sections}
                  columns={sectionColumns}
                  isLoading={loadingStates.sections}
                  error={errorStates.sections}
                />
              </TabsContent>

              <TabsContent value="faculty">
                <DataList
                  title="Faculty"
                  description="Academic staff"
                  data={faculty}
                  columns={facultyColumns}
                  isLoading={loadingStates.faculty}
                  error={errorStates.faculty}
                />
              </TabsContent>

              <TabsContent value="students">
                <DataList
                  title="Students"
                  description="Enrolled students"
                  data={students}
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'major', label: 'Major' },
                    { key: 'gpa', label: 'GPA' },
                    { key: 'credits', label: 'Credits' }
                  ]}
                />
              </TabsContent>

              <TabsContent value="courses">
                <DataList
                  title="Courses"
                  description="Available courses"
                  data={courses}
                  columns={[
                    { key: 'code', label: 'Code' },
                    { key: 'name', label: 'Name' },
                    { key: 'department', label: 'Department' },
                    { key: 'credits', label: 'Credits' },
                    { key: 'students', label: 'Students' }
                  ]}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;