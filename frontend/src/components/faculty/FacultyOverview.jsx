"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const apiUrl = import.meta.env.VITE_API_URL

export const FacultyOverview = (props) => {
  const { facultyData, mySemesters, mySections } = props
  const [selectedSection, setSelectedSection] = useState(null)
  const [sectionStudents, setSectionStudents] = useState([])
  const [sectionCourse, setSectionCourse] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

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

  // Handle section click
  const handleSectionClick = async (section) => {
    try {
      setLoading(true)
      setSelectedSection(section)

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
      console.log(section._id);
      
      // Fetch students in this section
      const response = await axios.get(`${apiUrl}/api/section/${section._id}/students`, config)
      // Expected response: { students: [{ _id, firstName, lastName, email, studentId }] }
      console.log(response);
      
      setSectionStudents(response.data.data.students)

      // Find the course that this faculty teaches in this section
      const courseFacultyMapping = section.courseFacultyMappings.find(
        (mapping) => mapping.facultyId === facultyData._id,
      )

      if (courseFacultyMapping) {
        const courseResponse = await axios.get(`/api/courses/${courseFacultyMapping.courseId}`)
        // Expected response: { course: { _id, name, courseCode, credits, description } }
        setSectionCourse(courseResponse.data.course)
      }

      setDialogOpen(true)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching section details:", error)
      setLoading(false)
    }
  }

  // Get active semesters (where faculty is teaching)
  const activeSemesters = mySemesters.filter((semester) => semester.isActive)

  return (
    <>
      <motion.div className="col-span-1 md:col-span-2" variants={props.cardVariants}>
        <Card className="border-none shadow-xl mb-6">
          <CardHeader>
            <CardTitle>Faculty Overview</CardTitle>
            <CardDescription>Your current teaching schedule and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Ongoing Semesters</h3>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" variants={props.containerVariants}>
              {activeSemesters.length > 0 ? (
                activeSemesters.map((semester) => {
                  const completionPercentage = calculateSemesterCompletion(semester.startDate, semester.endDate)

                  return (
                    <motion.div
                      key={semester._id}
                      className="bg-blue-50 p-4 rounded-lg"
                      variants={props.itemVariants}
                      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    >
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                        <h4 className="text-md font-semibold">{semester.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Code: {semester.semesterCode}</p>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress:</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2 bg-white [&>*]:bg-blue-500" />


                      <div className="flex justify-between text-xs text-gray-500 mt-2 ">
                        <span>{new Date(semester.startDate).toLocaleDateString()}</span>
                        <span>{new Date(semester.endDate).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <p className="text-gray-500">No active semesters found.</p>
              )}
            </motion.div>

            <h3 className="text-lg font-semibold mb-4">Your Teaching Sections</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              variants={props.containerVariants}
            >
              {mySections.length > 0 ? (
                mySections.map((section) => (
                  <motion.div
                    key={section._id}
                    className="bg-green-50 p-4 rounded-lg cursor-pointer"
                    variants={props.itemVariants}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => handleSectionClick(section)}
                  >
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-green-500 mr-2" />
                      <h4 className="text-md font-semibold">{section.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">{section.students.length}</span> Students
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{section.courseFacultyMappings.length}</span> Courses
                    </p>
                    <p className="text-xs text-blue-500 mt-2">Click to view details</p>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500">No teaching sections assigned.</p>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Section Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle>{selectedSection ? selectedSection.name : "Section Details"}</DialogTitle>
            <DialogDescription>
              {sectionCourse
                ? `Course: ${sectionCourse.name} (${sectionCourse.courseCode})`
                : "Loading course details..."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading section details...</p>
            </div>
          ) : (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Students in this Section
              </h3>

              {sectionStudents.length > 0 ? (
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
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sectionStudents.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.collegeEmail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No students enrolled in this section.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FacultyOverview

