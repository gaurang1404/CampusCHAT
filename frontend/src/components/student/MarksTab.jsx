"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, TrendingUp, BookOpen, BarChart3 } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts"
import { fetchMarksData, fetchCourseMarks, fetchSemesterProgress } from "./student-api.js"
import { toast } from "sonner"

// Colors for charts
const COLORS = ["#4f46e5", "#3b82f6", "#8b5cf6", "#ec4899"]
const GRADE_COLORS = {
  O: "#22c55e",
  "A+": "#10b981",
  A: "#3b82f6",
  B: "#6366f1",
  "B+": "#8b5cf6",
  "C+": "#f59e0b",
  C: "#f97316",
  "D+": "#ef4444",
  D: "#dc2626",
  F: "#b91c1c",
}

const MarksTab = ({ studentData }) => {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [animateCharts, setAnimateCharts] = useState(false)
  const [loading, setLoading] = useState(true)
  const [marksData, setMarksData] = useState(null)
  const [courses, setCourses] = useState([])
  const [semesterProgress, setSemesterProgress] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchMarksData(studentData._id)
        setMarksData(data.overall)

        const coursesData = await fetchCourseMarks(studentData._id)
        setCourses(coursesData)

        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0])
        }

        const progressData = await fetchSemesterProgress(studentData._id)        

        setSemesterProgress(progressData)
      } catch (error) {
        console.error("Error fetching marks data:", error)
        toast({
          title: "Error",
          description: "Failed to load marks data. Please try again.",
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

  const transformedData = {};

  courses.forEach(course => {
    course.assessments.forEach(assessment => {
      if (!transformedData[assessment.name]) {
        transformedData[assessment.name] = { name: assessment.name };
      }
      // Normalize marks to a percentage
      transformedData[assessment.name][course.name] = (assessment.marksScored / assessment.maxMarks) * 100;
    });
  });

  const chartData = Object.values(transformedData);



  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Prepare data for radial chart
  const radialData = courses.map((course, index) => ({
    name: course.code,
    // Fix: Ensure percentage is a valid number between 0-100
    percentage: Math.min(course.totalWeightedPercentage || 0, 100),
    fill: COLORS[index % COLORS.length],
  }))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marks data...</p>
        </div>
      </div>
    )
  }

  // Check if there are no assessments
  const hasNoAssessments = courses.every((course) => course.assessments.length === 0)  


  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Award className="mr-2 h-5 w-5 text-blue-500" />
                Semester Performance
              </CardTitle>
              <CardDescription>Your current semester academic performance</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{Number(marksData?.currentSemesterAverage || 0).toFixed(1)}%</div>
                  <p className="text-sm text-muted-foreground">
                    Credits: {marksData?.totalCredits || 0}
                  </p>
                </div>
                <div className="h-24 w-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="100%"
                      data={radialData}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        minAngle={15}
                        background
                        clockWise
                        dataKey="percentage"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {courses.map((course, index) => (
          <motion.div key={course.id} variants={itemVariants}>
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{course.name}</CardTitle>
                <CardDescription>
                  {course.code} • {course.credits} credits
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  {/* Fix: Ensure percentage is a valid number between 0-100 */}
                  <div className="text-3xl font-bold">{Math.min(course.totalWeightedPercentage || 0, 100)}%</div>
                  <Badge className="text-white" style={{ backgroundColor: GRADE_COLORS[course.grade] }}>
                    Grade: {course.grade}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Grade Points: {course.gradePoints.toFixed(1)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Course Performance */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-indigo-500" />
              Course Performance
            </CardTitle>
            <CardDescription>Detailed breakdown of your performance in each course</CardDescription>
          </CardHeader>
          <CardContent>
            {hasNoAssessments ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">No assessment data available yet</div>
                <p className="text-sm">
                  Assessment data will appear here once your instructors have recorded your marks.
                </p>
              </div>
            ) : (
              <Tabs
                defaultValue={courses.length > 0 ? courses[0].id : ""}
                onValueChange={(value) => {
                  const course = courses.find((c) => c.id === value)
                  setSelectedCourse(course)
                }}
              >
                <TabsList className="mb-4 flex flex-nowrap overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  {courses.map((course) => (
                    <TabsTrigger key={course.id} value={course.id} className="flex-shrink-0">
                      {course.code}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {courses.map((course) => (
                  <TabsContent key={course.id} value={course.id} className="m-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold mb-4">
                          {course.name} ({course.code})
                        </h3>
                        {course.assessments.length === 0 ? (
                          <div className="text-center py-8 border rounded-lg">
                            <div className="text-muted-foreground">
                              No assessment data available for this course yet
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {course.assessments.map((assessment, index) => (
                              <div key={assessment.name} className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{assessment.name}</span>
                                  <div className="text-sm">
                                    <span className="font-semibold">{assessment.marksScored}</span>
                                    <span className="text-muted-foreground">/{assessment.maxMarks}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      (Weightage: {assessment.weightage}%)
                                    </span>
                                  </div>
                                </div>
                                {/* Fix: Ensure percentage calculation is valid */}
                                <Progress
                                  value={
                                    animateCharts
                                      ? Math.min((assessment.marksScored / assessment.maxMarks) * 100, 100)
                                      : 0
                                  }
                                  className="h-2"
                                  style={{
                                    transition: "all 1s ease-out",
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="border rounded-lg p-4 h-full">
                          <h3 className="text-lg font-semibold mb-4">Course Summary</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Overall Percentage:</span>
                              {/* Fix: Ensure percentage is a valid number between 0-100 */}
                              <span className="font-bold">{Math.min(course.totalWeightedPercentage || 0, 100)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Grade:</span>
                              <Badge className="text-white" style={{ backgroundColor: GRADE_COLORS[course.grade] }}>
                                {course.grade}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Grade Points:</span>
                              <span className="font-bold">{course.gradePoints.toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Credits:</span>
                              <span className="font-bold">{course.credits}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                              <div className="text-sm text-muted-foreground mb-2">Performance Rating</div>
                              <div className="flex items-center">
                                {/* Fix: Ensure percentage comparison is valid */}
                                {Math.min(course.totalWeightedPercentage || 0, 100) >= 90 ? (
                                  <Badge className="bg-green-500">Excellent</Badge>
                                ) : Math.min(course.totalWeightedPercentage || 0, 100) >= 80 ? (
                                  <Badge className="bg-blue-500">Very Good</Badge>
                                ) : Math.min(course.totalWeightedPercentage || 0, 100) >= 70 ? (
                                  <Badge className="bg-indigo-500">Good</Badge>
                                ) : Math.min(course.totalWeightedPercentage || 0, 100) >= 60 ? (
                                  <Badge className="bg-yellow-500">Satisfactory</Badge>
                                ) : (
                                  <Badge className="bg-red-500">Needs Improvement</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Semester Progress */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
              Semester Progress
            </CardTitle>
            <CardDescription>Your performance trend throughout the semester</CardDescription>
          </CardHeader>
          <CardContent>
            {semesterProgress.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">No progress data available yet</div>
                <p className="text-sm">Progress data will appear here once assessments have been recorded.</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} /> {/* Y-axis now represents percentages */}
                    <Tooltip />
                    <Legend />

                    {courses.map((course, index) => (
                      <Line
                        key={course.name}
                        type="monotone"
                        dataKey={course.name}
                        name={course.name}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>


              </div>
            )}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Performance Insights</h3>
              <p className="text-sm text-blue-700">
                {marksData?.currentSemesterAverage >= 80
                  ? "Your performance has been consistent throughout the semester. You've shown improvement in quizzes and assignments, which is a positive trend."
                  : "Your performance shows some variation across assessments. Focus on improving your weaker areas to boost your overall grade."}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grade Distribution */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-500" />
              Grade Distribution
            </CardTitle>
            <CardDescription>Your grades across all courses this semester</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-2">No grade data available yet</div>
                <p className="text-sm">Grade distribution will appear here once courses have been graded.</p>
              </div>
            ) : (
              <>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={courses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="code" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="totalWeightedPercentage"
                        name="Percentage"
                        fill="#8b5cf6"
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-3 text-center">
                      <div className="text-sm font-medium mb-1">{course.code}</div>
                      <Badge
                        className="text-white w-full justify-center py-1"
                        style={{ backgroundColor: GRADE_COLORS[course.grade] }}
                      >
                        {course.grade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default MarksTab

