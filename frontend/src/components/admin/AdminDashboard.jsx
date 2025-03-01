import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, GraduationCap, BookOpen, Building, Calendar, User, LayoutDashboard, Home, LogOut } from 'lucide-react';
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

// Sample data - in a real application, this would come from your backend
const studentData = [
  { department: 'Computer Science', count: 450 },
  { department: 'Business', count: 380 },
  { department: 'Engineering', count: 320 },
  { department: 'Arts & Humanities', count: 280 },
  { department: 'Health Sciences', count: 210 },
];

const facultyData = [
  { department: 'Computer Science', count: 45 },
  { department: 'Business', count: 38 },
  { department: 'Engineering', count: 32 },
  { department: 'Arts & Humanities', count: 28 },
  { department: 'Health Sciences', count: 21 },
];

const enrollmentTrend = [
  { semester: 'Fall 2023', students: 1500 },
  { semester: 'Spring 2024', students: 1620 },
  { semester: 'Summer 2024', students: 980 },
  { semester: 'Fall 2024', students: 1640 },
  { semester: 'Spring 2025', students: 1710 },
];

const departments = [
  { id: 1, name: 'Computer Science', courses: 68, faculty: 45, students: 450 },
  { id: 2, name: 'Business', courses: 72, faculty: 38, students: 380 },
  { id: 3, name: 'Engineering', courses: 58, faculty: 32, students: 320 },
  { id: 4, name: 'Arts & Humanities', courses: 85, faculty: 28, students: 280 },
  { id: 5, name: 'Health Sciences', courses: 43, faculty: 21, students: 210 },
];

const semesters = [
  { id: 1, name: 'Spring 2025', startDate: 'Jan 15, 2025', endDate: 'May 10, 2025', status: 'Current', courses: 320, students: 1710 },
  { id: 2, name: 'Fall 2024', startDate: 'Aug 20, 2024', endDate: 'Dec 15, 2024', status: 'Completed', courses: 315, students: 1640 },
  { id: 3, name: 'Summer 2024', startDate: 'May 25, 2024', endDate: 'Aug 5, 2024', status: 'Completed', courses: 180, students: 980 },
  { id: 4, name: 'Spring 2024', startDate: 'Jan 15, 2024', endDate: 'May 10, 2024', status: 'Completed', courses: 310, students: 1620 },
];

const sections = [
  { id: 1, courseCode: 'CS101', courseName: 'Introduction to Programming', instructor: 'Dr. Alan Turing', students: 45, room: 'CS-201' },
  { id: 2, courseCode: 'BUS220', courseName: 'Marketing Fundamentals', instructor: 'Prof. Emily Richardson', students: 38, room: 'BUS-110' },
  { id: 3, courseCode: 'ENG150', courseName: 'Materials Science', instructor: 'Dr. Robert Chen', students: 32, room: 'ENG-305' },
  { id: 4, courseCode: 'HUM101', courseName: 'Introduction to Philosophy', instructor: 'Dr. Sarah Williams', students: 40, room: 'HUM-201' },
  { id: 5, courseCode: 'HS205', courseName: 'Anatomy & Physiology', instructor: 'Dr. Michael Brown', students: 35, room: 'HS-105' },
];

const faculty = [
  { id: 1, name: 'Dr. Alan Turing', department: 'Computer Science', position: 'Professor', courses: 3, students: 120 },
  { id: 2, name: 'Prof. Emily Richardson', department: 'Business', position: 'Associate Professor', courses: 4, students: 145 },
  { id: 3, name: 'Dr. Robert Chen', department: 'Engineering', position: 'Professor', courses: 2, students: 85 },
  { id: 4, name: 'Dr. Sarah Williams', department: 'Arts & Humanities', position: 'Assistant Professor', courses: 5, students: 175 },
  { id: 5, name: 'Dr. Michael Brown', department: 'Health Sciences', position: 'Professor', courses: 3, students: 105 },
];

const students = [
  { id: 1, name: 'John Smith', major: 'Computer Science', gpa: 3.8, credits: 78, advisorId: 1 },
  { id: 2, name: 'Maria Garcia', major: 'Business', gpa: 3.6, credits: 65, advisorId: 2 },
  { id: 3, name: 'David Wong', major: 'Engineering', gpa: 3.9, credits: 85, advisorId: 3 },
  { id: 4, name: 'Aisha Johnson', major: 'Philosophy', gpa: 3.7, credits: 72, advisorId: 4 },
  { id: 5, name: 'Raj Patel', major: 'Health Sciences', gpa: 4.0, credits: 90, advisorId: 5 },
];

const courses = [
  { id: 1, code: 'CS101', name: 'Introduction to Programming', department: 'Computer Science', credits: 3, students: 45 },
  { id: 2, code: 'BUS220', name: 'Marketing Fundamentals', department: 'Business', credits: 3, students: 38 },
  { id: 3, code: 'ENG150', name: 'Materials Science', department: 'Engineering', credits: 4, students: 32 },
  { id: 4, code: 'HUM101', name: 'Introduction to Philosophy', department: 'Arts & Humanities', credits: 3, students: 40 },
  { id: 5, code: 'HS205', name: 'Anatomy & Physiology', department: 'Health Sciences', credits: 4, students: 35 },
];

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
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="col-span-1 md:col-span-2" variants={cardVariants}>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>College Overview</CardTitle>
            <CardDescription>Key metrics for the current semester</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={containerVariants}
            >
              <motion.div 
                className="bg-blue-100 p-4 rounded-lg flex flex-col items-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="text-xl font-bold">1,710</h3>
                <p className="text-sm text-gray-600">Total Students</p>
              </motion.div>
              <motion.div 
                className="bg-green-100 p-4 rounded-lg flex flex-col items-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <GraduationCap className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="text-xl font-bold">164</h3>
                <p className="text-sm text-gray-600">Faculty Members</p>
              </motion.div>
              <motion.div 
                className="bg-yellow-100 p-4 rounded-lg flex flex-col items-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <BookOpen className="h-8 w-8 text-yellow-500 mb-2" />
                <h3 className="text-xl font-bold">320</h3>
                <p className="text-sm text-gray-600">Active Courses</p>
              </motion.div>
              <motion.div 
                className="bg-purple-100 p-4 rounded-lg flex flex-col items-center"
                variants={itemVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Building className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="text-xl font-bold">5</h3>
                <p className="text-sm text-gray-600">Departments</p>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Student Distribution</CardTitle>
            <CardDescription>By department</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  animationBegin={300}
                  animationDuration={1500}
                >
                  {studentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Faculty Distribution</CardTitle>
            <CardDescription>By department</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={facultyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" animationBegin={300} animationDuration={1500}>
                  {facultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="col-span-1 md:col-span-2" variants={cardVariants}>
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Student enrollment over recent semesters</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={enrollmentTrend}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  animationBegin={300}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Component to display a list with title and items
const DataList = ({ title, description, data, columns }) => {
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
                {data.map((item, i) => (
                  <motion.tr 
                    key={item.id} 
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
                ))}
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

  // Handle navigation functions
  const handleHomeClick = () => {
    // In a real application, this would navigate to the home page
    navigate("/")
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
                  columns={[
                    { key: 'name', label: 'Department' },
                    { key: 'courses', label: 'Courses' },
                    { key: 'faculty', label: 'Faculty' },
                    { key: 'students', label: 'Students' }
                  ]}
                />
              </TabsContent>

              <TabsContent value="semesters">
                <DataList
                  title="Semesters"
                  description="Academic terms"
                  data={semesters}
                  columns={[
                    { key: 'name', label: 'Term' },
                    { key: 'startDate', label: 'Start Date' },
                    { key: 'endDate', label: 'End Date' },
                    { key: 'status', label: 'Status' },
                    { key: 'courses', label: 'Courses' },
                    { key: 'students', label: 'Students' }
                  ]}
                />
              </TabsContent>

              <TabsContent value="sections">
                <DataList
                  title="Class Sections"
                  description="Current course sections"
                  data={sections}
                  columns={[
                    { key: 'courseCode', label: 'Code' },
                    { key: 'courseName', label: 'Course Name' },
                    { key: 'instructor', label: 'Instructor' },
                    { key: 'students', label: 'Students' },
                    { key: 'room', label: 'Room' }
                  ]}
                />
              </TabsContent>

              <TabsContent value="faculty">
                <DataList
                  title="Faculty"
                  description="Academic staff"
                  data={faculty}
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'department', label: 'Department' },
                    { key: 'position', label: 'Position' },
                    { key: 'courses', label: 'Courses' },
                    { key: 'students', label: 'Students' }
                  ]}
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