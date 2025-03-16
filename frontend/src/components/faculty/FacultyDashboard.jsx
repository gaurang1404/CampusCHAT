"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Calendar, Home, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { logout } from "@/redux/authSlice"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import FacultyOverview from "./FacultyOverview"
import AttendanceTab from "./AttendanceTab"

const apiUrl = import.meta.env.VITE_API_URL

// Main component
const FacultyDashboard = () => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [facultyData, setFacultyData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mySections, setMySections] = useState([])
  const [mySemesters, setMySemesters] = useState([])
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  // Header animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  // Button animation variants
  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  }

  // Fetch faculty data
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true)

        const token = localStorage.getItem("token") || sessionStorage.getItem("token")

        // Set up Axios headers with the token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

        // Get faculty data
        const response = await axios.get(`${apiUrl}/api/faculty/${user._id}`, config)
        // Expected response: { faculty: { _id, firstName, lastName, email, facultyId, departmentId, sections, etc. } }

        setFacultyData(response.data.data.faculty)

        // Get faculty sections
        const sectionsResponse = await axios.get(`${apiUrl}/api/faculty/${user._id}/sections`, config)
        // Expected response: { sections: [{ _id, name, semesterId, students, courseFacultyMappings }] }

        setMySections(sectionsResponse.data.data.sections)

        // Get faculty semesters
        const semestersResponse = await axios.get(`${apiUrl}/api/faculty/${user._id}/semesters`, config)
        // Expected response: { semesters: [{ _id, name, semesterCode, startDate, endDate, isActive }] }

        setMySemesters(semestersResponse.data.data.semesters)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching faculty data:", error)
        setLoading(false)
      }
    }

    if (user && user._id) {
      fetchFacultyData()
    }
  }, [user])

  // Handle navigation functions
  const handleHomeClick = () => {
    navigate("/")
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate("/")
  }

  return (
    <div>
      <div className="bg-[#63144c]">
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
              Faculty Dashboard
            </motion.h1>
            <motion.p
              className="text-white mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Manage your courses, students, and attendance
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
                  <DialogDescription>You will be logged out and redirected to the home page.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLogout} className="bg-red-600 text-white hover:bg-red-800">
                    Logout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.header>
      </div>

      <div className="p-4 max-w-[1200px] mx-auto">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <TabsList className="grid grid-cols-2 mb-4">
              {[
                { value: "dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Dashboard" },
                { value: "attendance", icon: <Calendar className="h-4 w-4" />, label: "Attendance" },
              ].map((tab, index) => (
                <motion.div
                  key={tab.value}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex justify-center"
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
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Loading dashboard data...</p>
                  </div>
                ) : (
                  <FacultyOverview
                    facultyData={facultyData}
                    mySemesters={mySemesters}
                    mySections={mySections}
                    cardVariants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                    containerVariants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.2,
                        },
                      },
                    }}
                    itemVariants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="attendance">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Loading attendance data...</p>
                  </div>
                ) : (
                  <AttendanceTab facultyData={facultyData} mySections={mySections} />
                )}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}

export default FacultyDashboard

