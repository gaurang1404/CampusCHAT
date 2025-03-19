"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, isWithinInterval } from "date-fns"
import { ChevronLeft, ChevronRight, Check, X, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  fetchAttendanceData,
  fetchAttendanceByDate,
  fetchCourseWiseAttendance,
  fetchMonthlyAttendance,
} from "./student-api.js"
import { toast } from "sonner"

// Colors for charts
const COLORS = ["#4f46e5", "#f43f5e"]
const STATUS_COLORS = {
  Present: "#22c55e",
  Absent: "#ef4444",
}

const AttendanceTab = ({ studentData }) => {
  const [date, setDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [attendanceView, setAttendanceView] = useState("calendar")
  const [animateCharts, setAnimateCharts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState(null)
  const [courseWiseAttendance, setCourseWiseAttendance] = useState([])
  const [monthlyAttendance, setMonthlyAttendance] = useState([])
  const [dailyAttendance, setDailyAttendance] = useState([])
  const [selectedDateAttendance, setSelectedDateAttendance] = useState([])
  const [semesterStartDate, setSemesterStartDate] = useState(null)
  const [semesterEndDate, setSemesterEndDate] = useState(null)

  useEffect(() => {
    // Set semester date range if available    
    if (studentData?.semesterId?.startDate) {
      
      setSemesterStartDate(new Date(studentData.semesterId.startDate))
    }
    if (studentData?.semesterId?.endDate) {
      setSemesterEndDate(new Date(studentData.semesterId.endDate))
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchAttendanceData(studentData._id)
        setAttendanceData(data.overall)
        setDailyAttendance(data.daily)

        const courseWise = await fetchCourseWiseAttendance(studentData._id)
        setCourseWiseAttendance(courseWise)

        const monthly = await fetchMonthlyAttendance(studentData._id)
        setMonthlyAttendance(monthly)
      } catch (error) {
        console.error("Error fetching attendance data:", error)
        toast({
          title: "Error",
          description: "Failed to load attendance data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (studentData && studentData._id) {
      fetchData()
    }
  }, [studentData])

  useEffect(() => {
    // Trigger chart animations after component mounts
    const timer = setTimeout(() => {
      setAnimateCharts(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Fetch attendance for selected date
  useEffect(() => {
    const getAttendanceForDate = async () => {
      if (!selectedDate || !studentData) return

      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd")
        const data = await fetchAttendanceByDate(studentData._id, formattedDate)
        // Ensure data is always an array
        setSelectedDateAttendance(Array.isArray(data) ? data : [data].filter(Boolean))        
        
      } catch (error) {
        console.error("Error fetching attendance for date:", error)
        setSelectedDateAttendance([])
      }
    }

    getAttendanceForDate()
  }, [selectedDate, studentData])

  // Custom calendar day renderer to improve visibility
  const renderDay = (day, modifiers) => {
    const isPresent = modifiers.present
    const isAbsent = modifiers.absent
    const isSelected = modifiers.selected

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          className={`
          w-9 h-9 flex items-center justify-center rounded-full
          ${isPresent ? "bg-green-500 text-white font-medium" : ""}
          ${isAbsent ? "bg-red-500 text-white font-medium" : ""}
          ${isSelected ? "bg-blue-600 text-white font-medium" : ""}
          ${!isPresent && !isAbsent && !isSelected ? "hover:bg-gray-200" : ""}
        `}
        >
          {day.getDate()}
        </div>
      </div>
    )
  }

  // Prepare data for pie chart
  const pieChartData = attendanceData
    ? [
        { name: "Present", value: attendanceData.present },
        { name: "Absent", value: attendanceData.absent },
      ]
    : []

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Function to check if a date is within semester range
  const isDateInSemester = (date) => {
    if (!semesterStartDate || !semesterEndDate) return true
    return isWithinInterval(date, { start: semesterStartDate, end: semesterEndDate })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">Overall Attendance</CardTitle>
              <CardDescription>Your attendance record for this semester</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{attendanceData?.percentage || 0}%</div>
                  <p className="text-sm text-muted-foreground">
                    Present: {attendanceData?.present || 0} days | Absent: {attendanceData?.absent || 0} days
                  </p>
                </div>
                <div className="h-24 w-24 min-w-[96px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={animateCharts ? 40 : 0}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {attendanceData?.percentage < 75 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-center text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Your attendance is below the required 75% threshold.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {courseWiseAttendance.map((course, index) => (
          <motion.div key={course.name} variants={itemVariants}>
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{course.name}</CardTitle>
                <CardDescription>Course attendance</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold">{course.percentage}%</div>
                <p className="text-sm text-muted-foreground">
                  Present: {course.present} | Absent: {course.absent}
                </p>
                <div className="mt-2">
                  <Badge 
                  className={course.percentage >= 75 ? "bg-green-500" : "bg-red-600" + "border-none"}
                  variant={course.percentage >= 75 ? "success" : "destructive"}>
                    {course.percentage >= 75 ? "Good Standing" : "Attendance Warning"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Attendance View Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="calendar" value={attendanceView} onValueChange={setAttendanceView} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 overflow-x-auto">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="courses">Course-wise</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="m-0">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Attendance Calendar</CardTitle>
                <CardDescription>View your daily attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-7/12">
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous month</span>
                      </Button>
                      <h2 className="text-lg font-semibold">{format(date, "MMMM yyyy")}</h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next month</span>
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={date}
                      onMonthChange={setDate}
                      className="rounded-md border"
                      modifiers={{
                        present: dailyAttendance
                          .filter((day) => day.status === "Present")
                          .map((day) => new Date(day.date)),
                        absent: dailyAttendance
                          .filter((day) => day.status === "Absent")
                          .map((day) => new Date(day.date)),
                      }}
                      modifiersClassNames={{
                        present: "bg-green-500 hover:text-white hover:bg-green-800 text-white font-medium",
                        absent: "bg-red-500 hover:text-white hover:bg-red-800 text-white font-medium",
                        selected: "bg-yellow-600 hover:text-white hover:bg-yellow-800 text-white font-medium",
                      }}
                      disabled={(date) => !isDateInSemester(date)}
                      fromDate={semesterStartDate}
                      toDate={semesterEndDate}
                      renderDay={renderDay}
                    />
                    <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                        <span>Present</span>
                      </div>
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                        <span>Absent</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-5/12">
                    {selectedDate ? (
                      <div className="border rounded-lg p-4 h-full">
                        <h3 className="text-lg font-semibold mb-4">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
                        {selectedDateAttendance && selectedDateAttendance.length > 0 ? (
                          <div className="space-y-4">
                            {selectedDateAttendance.map((attendance, index) => (
                              <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                                <div className="flex items-center mb-2">
                                  <div className="font-medium w-24">Course:</div>
                                  <span>{attendance.course}</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="font-medium w-24">Status:</div>
                                  <Badge
                                    variant={attendance.status === "Present" ? "success" : "destructive"}
                                    className="flex items-center bg-[#63144c] text-white hover:text-white hover:bg-[#53033c]"
                                  >
                                    {attendance.status === "Present" ? (
                                      <>
                                        <Check className="h-3 w-3 mr-1" /> Present
                                      </>
                                    ) : (
                                      <>
                                        <X className="h-3 w-3 mr-1" /> Absent
                                      </>
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-32 text-muted-foreground">
                            No attendance records for this date
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 flex items-center justify-center h-full text-muted-foreground">
                        Select a date to view attendance details
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="m-0">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Course-wise Attendance</CardTitle>
                <CardDescription>Your attendance breakdown by course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseWiseAttendance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="present"
                        name="Present"
                        stackId="a"
                        fill="#4f46e5"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="absent"
                        name="Absent"
                        stackId="a"
                        fill="#f43f5e"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseWiseAttendance.map((course) => (
                    <div key={course.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{course.name}</h3>
                        <Badge variant={course.percentage >= 75 ? "success" : "destructive"}>
                          {course.percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="flex items-center mr-4">
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
                          <span>Present: {course.present}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                          <span>Absent: {course.absent}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="m-0">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Monthly Attendance Trends</CardTitle>
                <CardDescription>Track your attendance patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyAttendance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="present"
                        name="Present"
                        fill="#4f46e5"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Bar
                        dataKey="absent"
                        name="Absent"
                        fill="#f43f5e"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="font-medium text-blue-800 mb-2">Attendance Insights</h3>
                  <p className="text-sm text-blue-700">
                    {attendanceData?.percentage >= 75
                      ? "Your attendance has been consistent throughout the semester. Keep up the good work to maintain your academic standing."
                      : "Your attendance needs improvement. Please ensure you attend classes regularly to meet the minimum attendance requirements."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

export default AttendanceTab

