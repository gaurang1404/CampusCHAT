import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Calendar, Home, LogOut, FileText, User, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import OverviewTab from "./StudentOverview"
import AttendanceTab from "./AttendanceTab"
import MarksTab from "./MarksTab"
import { fetchStudentData } from "./student-api"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/redux/authSlice";

const StudentDashboard = () => {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState(null)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth)

  // Fetch student data
  useEffect(() => {
    const getStudentData = async () => {
      try {
        setLoading(true)
        // In a real app, you would get the student ID from authentication        
        const data = await fetchStudentData(user._id)
        setStudentData(data)
      } catch (error) {
        console.error("Error fetching student data:", error)
        toast({
          title: "Error",
          description: "Failed to load student data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    getStudentData()
  }, [])

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

  // Handle navigation functions
  const handleHomeClick = () => {
    navigate("/"); // Replaces router.push("/")
  };

  const handleLogout = () => {
    // Clear auth tokens
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");

    dispatch(logout());

    navigate("/student-login"); // Replaces router.push("/login")
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unable to load data</h2>
          <p className="text-gray-600 mb-4">We couldn't load your student information. Please try again or contact support.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="bg-[#63144c]">
        <div className="max-w-[1200px] m-auto">
          <motion.header
            className="w-full mb-6 pt-10 pb-6 pl-4 flex justify-between items-center"
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
                Student Dashboard
              </motion.h1>
              <motion.p
                className="text-white mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Welcome back, {studentData.firstName} {studentData.lastName}
              </motion.p>
            </div>
            <div className="flex gap-3 pr-4 flex-wrap items-center">
              <motion.button
                onClick={handleHomeClick}
                className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-md flex items-center gap-2 font-medium"
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
                    <DialogDescription>You will be logged out and redirected to the login page.</DialogDescription>
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
      </div>

      <div className="p-4 max-w-[1200px] mx-auto -mt-6">
        <motion.div
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border-b"
            >
              <TabsList className="w-full justify-start p-0 h-auto bg-transparent">
                {[
                  { value: "overview", icon: <LayoutDashboard className="h-4 w-4" />, label: "Overview" },
                  { value: "attendance", icon: <Calendar className="h-4 w-4" />, label: "Attendance" },
                  { value: "marks", icon: <FileText className="h-4 w-4" />, label: "Marks" },
                ].map((tab, index) => (
                  <motion.div
                    key={tab.value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="flex justify-center"
                  >
                    <TabsTrigger
                      value={tab.value}
                      className="flex gap-2 py-4 px-6 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none bg-transparent text-gray-600 data-[state=active]:text-blue-600 font-medium"
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
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
                className="p-6"
              >
                <TabsContent value="overview" className="m-0">
                  <OverviewTab studentData={studentData} />
                </TabsContent>

                <TabsContent value="attendance" className="m-0">
                  <AttendanceTab studentData={studentData} />
                </TabsContent>

                <TabsContent value="marks" className="m-0">
                  <MarksTab studentData={studentData} />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default StudentDashboard
