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
import DashboardTab from './DashBoardTab';
import DepartmentsTab from './DepartmentsTab';
import SemestersTab from './SemestersTab';


// Main component
const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  // Handle navigation functions
  const handleHomeClick = () => {
    navigate("/");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
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
                  className='flex justify-center'
                >
                  <TabsTrigger value={tab.value} className="flex gap-1">
                    <span>{tab.icon}</span>
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
                {/* Your Department component will go here */}
                <DepartmentsTab/>
              </TabsContent>

              <TabsContent value="semesters">
                {/* Your Semesters component will go here */}
                <SemestersTab/>
              </TabsContent>

              <TabsContent value="sections">
                {/* Your Sections component will go here */}
                <div className="p-4 border rounded-lg text-center">
                  <h2 className="text-xl font-semibold">Sections Tab</h2>
                  <p className="text-gray-500">Replace with your custom component</p>
                </div>
              </TabsContent>

              <TabsContent value="faculty">
                {/* Your Faculty component will go here */}
                <div className="p-4 border rounded-lg text-center">
                  <h2 className="text-xl font-semibold">Faculty Tab</h2>
                  <p className="text-gray-500">Replace with your custom component</p>
                </div>
              </TabsContent>

              <TabsContent value="students">
                {/* Your Students component will go here */}
                <div className="p-4 border rounded-lg text-center">
                  <h2 className="text-xl font-semibold">Students Tab</h2>
                  <p className="text-gray-500">Replace with your custom component</p>
                </div>
              </TabsContent>

              <TabsContent value="courses">
                {/* Your Courses component will go here */}
                <div className="p-4 border rounded-lg text-center">
                  <h2 className="text-xl font-semibold">Courses Tab</h2>
                  <p className="text-gray-500">Replace with your custom component</p>
                </div>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;