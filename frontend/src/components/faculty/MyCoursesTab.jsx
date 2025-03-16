"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Clock } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
const apiUrl = import.meta.env.VITE_API_URL

const MyCoursesTab = ({ facultyData, mySections }) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)

        const token = localStorage.getItem("token") || sessionStorage.getItem("token")

        // Set up Axios headers with the token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } 

        // Extract all course IDs from section mappings
        const courseIds = new Set()
        mySections.forEach((section) => {
          section.courseFacultyMappings.forEach((mapping) => {
            if (mapping.facultyId === facultyData._id) {
              courseIds.add(mapping.courseId)
            }
          })
        })
        console.log(courseIds);
        
        
        // Fetch details for each course
        const coursePromises = Array.from(courseIds).map((courseId) => axios.get(`${apiUrl}/api/course/${courseId._id}`, config))

        const courseResponses = await Promise.all(coursePromises)
        
        console.log(courseResponses);
        

        const courseData = courseResponses.map((response) => response.data.data)

        setCourses(courseData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setLoading(false)
      }
    }

    if (facultyData && mySections.length > 0) {
      fetchCourses()
    }
  }, [facultyData, mySections])

  // Count sections per course
  const getSectionsForCourse = (courseId) => {
    return mySections.filter((section) =>
      section.courseFacultyMappings.some(
        (mapping) => mapping.courseId === courseId && mapping.facultyId === facultyData._id,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Courses you are currently teaching</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading your courses...</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {courses.length > 0 ? (
                courses.map((course) => {
                  const courseSections = getSectionsForCourse(course._id)

                  return (
                    <motion.div
                      key={course._id}
                      className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
                      variants={itemVariants}
                    >
                      <div className="flex items-center mb-4">
                        <BookOpen className="h-6 w-6 text-blue-500 mr-3" />
                        <h3 className="text-lg font-semibold">{course.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{course.courseCode}</p>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-3">{course.description}</p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-500 mr-1" />
                          <span>{courseSections.length} Sections</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-500 mr-1" />
                          <span>{course.credits} Credits</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <p className="col-span-full text-center text-gray-500">No courses assigned to you.</p>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MyCoursesTab

