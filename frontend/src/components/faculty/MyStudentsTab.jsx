import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import axios from "axios"

const apiUrl = import.meta.env.VITE_API_URL

const MyStudentsTab = ({ facultyData, mySections }) => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [studentCourses, setStudentCourses] = useState({})

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")

        // Set up Axios headers with the token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } 
        // Get all unique student IDs from all sections
        const studentIds = new Set()
        const studentCoursesMap = {}

        for (const section of mySections) {
          // Check if faculty teaches in this section
          const teachesInSection = section.courseFacultyMappings.some(
            (mapping) => mapping.facultyId === facultyData._id,
          )

          if (teachesInSection) {
            // Add students from this section
            for (const studentId of section.students) {
              studentIds.add(studentId)

              // Find course for this section
              const courseMapping = section.courseFacultyMappings.find(
                (mapping) => mapping.facultyId === facultyData._id,
              )

              if (courseMapping) {
                if (!studentCoursesMap[studentId]) {
                  studentCoursesMap[studentId] = []
                }                

                // Fetch course details
                const courseResponse = await axios.get(`${apiUrl}/api/course/${courseMapping.courseId._id}`, config)
                // Expected response: { course: { _id, name, courseCode } }                

                studentCoursesMap[studentId].push({
                  courseId: courseMapping.courseId,
                  courseName: courseResponse.data.data.name,
                  courseCode: courseResponse.data.data.courseCode,
                  sectionName: section.name,
                })
              }
            }
          }
        }

        // Fetch details for each student        
        const studentPromises = Array.from(studentIds).map((studentId) => axios.get(`${apiUrl}/api/student/${studentId._id}`, config))

        const studentResponses = await Promise.all(studentPromises)

        
        
        const studentData = studentResponses.map((response) => response.data.data.student)
        
        setStudents(studentData)
        setFilteredStudents(studentData)
        setStudentCourses(studentCoursesMap)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching students:", error)
        setLoading(false)
      }
    }

    if (facultyData && mySections.length > 0) {
      fetchStudents()
    }
  }, [facultyData, mySections])

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.collegeEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredStudents(filtered)
    }
  }, [searchTerm, students])

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle>My Students</CardTitle>
          <CardDescription>Students enrolled in your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search students by name, ID or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading your students...</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {filteredStudents.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Courses & Sections
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.collegeEmail}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {studentCourses[student._id] ? (
                              <div className="space-y-1">
                                {studentCourses[student._id].map((course, index) => (
                                  <div key={index} className="flex items-center">
                                    <BookOpen className="h-3 w-3 text-blue-500 mr-1" />
                                    <span>
                                      {course.courseCode} - {course.sectionName}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span>No courses</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500">No students found.</p>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MyStudentsTab

