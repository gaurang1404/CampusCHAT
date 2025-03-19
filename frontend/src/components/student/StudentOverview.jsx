"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Book, Calendar, GraduationCap, Users, Clock, Award, TrendingUp, BarChart2 } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { fetchOverviewData, fetchCourseProgress, fetchComparisonData } from "./student-api.js"
import { toast } from "sonner"
import { useSelector } from "react-redux"

// Colors for charts
const COLORS = ["#4f46e5", "#f43f5e"]

const StudentOverview = ({ studentData }) => {
  const [loading, setLoading] = useState(true)
  const [overviewData, setOverviewData] = useState(null)
  const [courseProgress, setCourseProgress] = useState([])
  const [comparisonData, setComparisonData] = useState([])
  const [animateCharts, setAnimateCharts] = useState(false)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const overview = await fetchOverviewData(studentData._id)
        setOverviewData(overview)

        const progress = await fetchCourseProgress(studentData._id)
        setCourseProgress(progress)

        // Fetch comparison data
        if (studentData.sectionId && studentData.semesterId) {
          const comparison = await fetchComparisonData(studentData._id, studentData.sectionId, studentData.semesterId)
          setComparisonData(comparison)
        }
      } catch (error) {
        console.error("Error fetching overview data:", error)
        toast({
          title: "Error",
          description: "Failed to load overview data. Please try again.",
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

  // Calculate semester completion percentage
  const calculateSemesterCompletion = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()

    // If semester hasn't started yet
    if (today < start) return 0

    // If semester has ended
    if (today > end) return 100

    // Calculate percentage
    const totalDays = (end - start) / (1000 * 60 * 60 * 24)
    const daysElapsed = (today - start) / (1000 * 60 * 60 * 24)
    return Math.round((daysElapsed / totalDays) * 100)
  }

  const semesterCompletion =
    studentData?.semesterId?.startDate && studentData?.semesterId?.endDate
      ? calculateSemesterCompletion(studentData.semesterId.startDate, studentData.semesterId.endDate)
      : 0

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading overview data...</p>
        </div>
      </div>
    )
  }

  // Prepare attendance data for pie chart
  const attendanceData = overviewData?.attendance
    ? [
        { name: "Present", value: overviewData.attendance.present },
        { name: "Absent", value: overviewData.attendance.absent },
      ]
    : []

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription>Current Semester</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                {studentData.semesterId?.name || "N/A"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress:</span>
                <span>{semesterCompletion}%</span>
              </div>
              <Progress value={semesterCompletion} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>
                  {studentData.semesterId?.startDate
                    ? new Date(studentData.semesterId.startDate).toLocaleDateString()
                    : "N/A"}
                </span>
                <span>
                  {studentData.semesterId?.endDate
                    ? new Date(studentData.semesterId.endDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription>Department</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                <GraduationCap className="mr-2 h-5 w-5 text-indigo-500" />
                {studentData.departmentId?.name || "N/A"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>Student ID: {studentData.studentId}</p>
                <p className="truncate">{studentData.collegeEmail}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription>Section</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                <Users className="mr-2 h-5 w-5 text-purple-500" />
                {studentData.sectionId?.name || "N/A"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>{studentData.sectionId?.students?.length || 0} Students</p>
                <p>{studentData.sectionId?.courseFacultyMappings?.length || 0} Courses</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription>Overall Attendance</CardDescription>
              <CardTitle className="text-2xl flex items-center">
                <Clock className="mr-2 h-5 w-5 text-green-500" />
                {overviewData?.attendance?.percentage || 0}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <p>Present: {overviewData?.attendance?.present || 0} days</p>
                <p>Absent: {overviewData?.attendance?.absent || 0} days</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Middle Row - Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-blue-500" />
                Current Semester Performance
              </CardTitle>
              <CardDescription>Overall grade distribution across courses</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={overviewData?.gradeDistribution || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Number of Tests"
                      fill="#4f46e5"
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                Attendance Overview
              </CardTitle>
              <CardDescription>Your attendance record this semester</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px] flex items-center justify-center w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={animateCharts ? 100 : 0}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* New Row - Performance Comparison */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-indigo-500" />
              Performance Comparison
            </CardTitle>
            <CardDescription>Your performance compared to section average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="courseName" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="yourScore"
                    name="Your Score"
                    fill="#4f46e5"
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                  <Bar
                    dataKey="sectionAverage"
                    name="Section Average"
                    fill="#10b981"
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Performance Insights</h3>
              <p className="text-sm text-blue-700">
                {comparisonData.filter((item) => item.yourScore > item.sectionAverage).length >
                comparisonData.filter((item) => item.yourScore < item.sectionAverage).length
                  ? "You're performing above the section average in most courses. Keep up the good work!"
                  : "You have opportunities to improve in some courses where you're below the section average."}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Row - Course Progress */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Book className="mr-2 h-5 w-5 text-purple-500" />
              Course Progress
            </CardTitle>
            <CardDescription>Your progress in current semester courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseProgress.map((course, index) => (
                <motion.div
                  key={course.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { delay: 0.2 + index * 0.1 },
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{course.name}</span>
                    <Badge variant={course.completed >= 70 ? "success" : "default"}>{course.completed}%</Badge>
                  </div>
                  <Progress
                    value={animateCharts ? course.completed : 0}
                    className="h-2"
                    style={{
                      transition: "all 1s ease-out",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trend Comparison Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-orange-500" />
              Performance Trends
            </CardTitle>
            <CardDescription>Your performance trend compared to section average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={comparisonData.length > 0 ? comparisonData[0]?.trendData || [] : []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="examName" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="yourScore"
                    name="Your Score"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={animateCharts}
                  />
                  <Line
                    type="monotone"
                    dataKey="sectionAverage"
                    name="Section Average"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={animateCharts}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default StudentOverview

