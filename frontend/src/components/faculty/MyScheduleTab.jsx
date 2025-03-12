import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import axios from "axios"

const apiUrl = import.meta.env.VITE_API_URL

const MyScheduleTab = ({ facultyData, mySemesters }) => {
  const [schedule, setSchedule] = useState([])
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
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token") || sessionStorage.getItem("token")

        // Set up Axios headers with the token
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        } 
        // Fetch faculty schedule
        const response = await axios.get(`${apiUrl}/api/faculty/${facultyData._id}/schedule`, config)
        // Expected response: { schedule: [{ day, startTime, endTime, courseId, sectionId }] }

        // Enhance schedule with course and section details
        const enhancedSchedule = []

        for (const slot of response.data.schedule) {
          // Fetch course details
          const courseResponse = await axios.get(`/api/courses/${slot.courseId}`)
          // Expected response: { course: { _id, name, courseCode } }

          // Fetch section details
          const sectionResponse = await axios.get(`/api/sections/${slot.sectionId}`)
          // Expected response: { section: { _id, name } }

          enhancedSchedule.push({
            ...slot,
            courseName: courseResponse.data.course.name,
            courseCode: courseResponse.data.course.courseCode,
            sectionName: sectionResponse.data.section.name,
          })
        }

        setSchedule(enhancedSchedule)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching schedule:", error)
        setLoading(false)
      }
    }

    if (facultyData) {
      fetchSchedule()
    }
  }, [facultyData])

  // Group schedule by day
  const scheduleByDay = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }

  schedule.forEach((slot) => {
    if (scheduleByDay[slot.day]) {
      scheduleByDay[slot.day].push(slot)
    }
  })

  // Sort slots by start time
  Object.keys(scheduleByDay).forEach((day) => {
    scheduleByDay[day].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })
  })

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle>My Schedule</CardTitle>
          <CardDescription>Your weekly teaching schedule</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading your schedule...</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              {Object.entries(scheduleByDay).map(([day, slots]) => (
                <motion.div key={day} variants={itemVariants}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    {day}
                  </h3>

                  {slots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {slots.map((slot, index) => (
                        <div key={index} className="bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {slot.courseCode}
                            </span>
                          </div>

                          <div className="flex items-center mb-1">
                            <BookOpen className="h-4 w-4 text-blue-500 mr-1" />
                            <h4 className="font-medium">{slot.courseName}</h4>
                          </div>

                          <p className="text-sm text-gray-600">Section: {slot.sectionName}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 ml-7">No classes scheduled.</p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MyScheduleTab

