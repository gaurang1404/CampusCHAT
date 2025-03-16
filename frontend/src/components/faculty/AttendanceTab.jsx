"use client"
import "react-day-picker/dist/style.css"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO, isToday, isBefore } from "date-fns"
import { Search, Save, CalendarIcon, Check, X, ArrowLeft } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import axios from "axios"

import { AttendanceStatusIndicator } from "./AttendanceStatusIndicator"
import { AttendanceCalendarView } from "./AttendanceCalendarView"
import { AttendanceStatusBanner } from "./AttendanceStatusBanner"

const apiUrl = import.meta.env.VITE_API_URL

const AttendanceTab = ({ facultyData, mySections }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSection, setSelectedSection] = useState({})
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [attendanceDate, setAttendanceDate] = useState(new Date())
  const [attendanceStatus, setAttendanceStatus] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [existingAttendance, setExistingAttendance] = useState(null)
  const [savingAttendance, setSavingAttendance] = useState(false)

  // Add a calendar view to show attendance history
  const [showCalendarView, setShowCalendarView] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (Object.keys(selectedSection).length > 0) {
    }
  }, [selectedSection])

  // Filter sections based on search term
  const filteredSections = mySections.filter((section) => {
    // Find the course that this faculty teaches in this section
    const courseFacultyMapping = section.courseFacultyMappings.find((mapping) => mapping.facultyId === facultyData._id)

    const courseName = courseFacultyMapping?.courseId?.name || "Unknown Course"

    return (
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courseName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Handle section selection
  const handleSectionSelect = async (section) => {
    try {
      setLoading(true)
      setAttendanceDate(new Date())
      setAttendanceStatus({})
      setExistingAttendance(null)
      setSelectedSection({ ...section })

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Fetch students in this section
      const response = await axios.get(`${apiUrl}/api/section/${section._id}/students`, config)

      setStudents(response.data.data.students)

      // Initialize attendance status for all students as "Absent" by default
      const initialStatus = {}
      response.data.data.students.forEach((student) => {
        initialStatus[student._id] = "Absent"
      })
      setAttendanceStatus(initialStatus)

      // Check if attendance already exists for today
      await fetchAttendanceForDate(section._id, new Date(), section)

      // Fetch attendance history for this section
      await fetchAttendanceHistory()

      setLoading(false)
    } catch (error) {
      console.error("Error fetching section details:", error)
      toast.error("Failed to fetch section details. Please try again.")
      setLoading(false)
    }
  }

  // Fetch attendance for a specific date
  const fetchAttendanceForDate = async (sectionId, date, sectionData = null) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Use sectionData if provided, otherwise use selectedSection
      const currentSection = sectionData || selectedSection

      // Find the course that this faculty teaches in this section
      const courseFacultyMapping = currentSection?.courseFacultyMappings?.find(
        (mapping) => mapping.facultyId === facultyData._id,
      )

      // if (!courseFacultyMapping) {
      //   console.log("courseFacultyMapping not found")
      //   toast.error("Could not find course mapping for this faculty.")
      //   return
      // }

      // Format date as YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd")

      // Include courseId and facultyId in the request
      const courseId = courseFacultyMapping.courseId._id
      const facultyId = facultyData._id

      const response = await axios.get(
        `${apiUrl}/api/attendance/section/${sectionId}/course/${courseId}/faculty/${facultyId}/date/${formattedDate}`,
        config,
      )

      if (response.data.data.attendance && response.data.data.attendance.length > 0) {
        const attendanceData = response.data.data.attendance
        const statusMap = {}

        attendanceData.forEach((record) => {
          statusMap[record.studentId._id] = record.status
        })

        setAttendanceStatus(statusMap)
        setExistingAttendance(attendanceData)
        setIsEditing(true)
        toast.info("Attendance records found for this date. You can update them if needed.")
      } else {
        // No attendance found for this date - set all to Absent by default
        const initialStatus = {}
        students.forEach((student) => {
          initialStatus[student._id] = "Absent"
        })

        setAttendanceStatus(initialStatus)
        setExistingAttendance([])
        setIsEditing(false)
        toast.info("No attendance records found for this date. All students marked as absent by default.")
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast.error("Failed to fetch attendance data. Please try again.")
    }
  }

  // Handle date change
  const handleDateChange = async (date) => {
    setAttendanceDate(date)
    if (selectedSection) {
      await fetchAttendanceForDate(selectedSection._id, date)
    }
  }

  // Toggle attendance status
  const toggleAttendanceStatus = (studentId) => {
    setAttendanceStatus((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "Present" ? "Absent" : "Present",
    }))
  }

  // Mark all as present
  const markAllPresent = () => {
    const newStatus = {}
    students.forEach((student) => {
      newStatus[student._id] = "Present"
    })
    setAttendanceStatus(newStatus)
  }

  const markAllAbsent = () => {
    const newStatus = {}
    students.forEach((student) => {
      newStatus[student._id] = "Absent"
    })
    setAttendanceStatus(newStatus)
  }

  // Save attendance
  const saveAttendance = async () => {
    try {
      setSavingAttendance(true)

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Find the course that this faculty teaches in this section
      const courseFacultyMapping = selectedSection?.courseFacultyMappings?.find(
        (mapping) => mapping.facultyId === facultyData._id,
      )

      // if (!courseFacultyMapping) {
      //   toast.error("Could not find course mapping for this faculty.")
      //   setSavingAttendance(false)
      //   return
      // }

      const courseId = courseFacultyMapping.courseId._id
      const facultyId = facultyData._id
      const formattedDate = format(attendanceDate, "yyyy-MM-dd")

      console.log(formattedDate);


      // If we're creating new attendance (not editing), check if attendance already exists for this day
      if (!isEditing) {
        const checkResponse = await axios.get(
          `${apiUrl}/api/attendance/check/${selectedSection._id}/course/${courseId}/faculty/${facultyId}/date/${formattedDate}`,
          config,
        )

        if (checkResponse.data.data.exists) {
          toast.info("Attendance has already been marked for this date. Switching to update mode.")
          await fetchAttendanceForDate(selectedSection._id, attendanceDate)
          setSavingAttendance(false)
          return
        }
      }

      // Prepare attendance data
      const attendanceData = students.map((student) => ({
        studentId: student._id,
        status: attendanceStatus[student._id] || "Absent", // Default to Absent if not set
        date: formattedDate,
      }))

      let payload
      let endpoint

      if (isEditing) {
        // Format for update endpoint
        payload = {
          sectionId: selectedSection._id,
          courseId: courseId,
          facultyId: facultyId,
          attendanceData: attendanceData,
          date: formattedDate,
        }
        endpoint = `${apiUrl}/api/attendance/bulk-update`
      } else {
        // Format for new attendance endpoint
        payload = {
          sectionId: selectedSection._id,
          courseId: courseId,
          facultyId: facultyId,
          attendanceData: attendanceData,
          date: formattedDate,
        }
        endpoint = `${apiUrl}/api/attendance/bulk-mark`
      }

      console.log("Sending payload:", payload)
      console.log("To endpoint:", endpoint)

      const response = await axios.post(endpoint, payload, config)

      console.log(response)

      if (response.status === 200) {
        toast.success(isEditing ? "Attendance updated successfully." : "Attendance saved successfully.")

        // Refresh attendance data and history
        await fetchAttendanceForDate(selectedSection._id, attendanceDate)
        await fetchAttendanceHistory()
      } else {
        toast.error("Failed to save attendance. Please try again.")
      }

      setSavingAttendance(false)
    } catch (error) {
      console.error("Error saving attendance:", error)
      toast.error(error.response?.data?.message || "Failed to save attendance. Please try again.")
      setSavingAttendance(false)
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      setLoadingHistory(true)

      // const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      // const config = { headers: { Authorization: `Bearer ${token}` } }

      // Find the course that this faculty teaches in this section
      // const courseFacultyMapping = selectedSection?.courseFacultyMappings?.find(
      //   (mapping) => mapping.facultyId === facultyData._id,
      // )

      // if (!courseFacultyMapping) {
      //   toast.error("Could not find course mapping for this faculty.")
      //   setLoadingHistory(false)
      //   return
      // }

      // const courseId = courseFacultyMapping.courseId._id
      // const facultyId = facultyData._id

      // Uncomment and fix the API call
      // const response = await axios.get(
      //   `${apiUrl}/api/attendance/history/${selectedSection._id}/course/${courseId}/faculty/${facultyId}`,
      //   config,
      // )

      // setAttendanceHistory(response.data.data.attendanceDates || [])
      setShowCalendarView(true)

      setLoadingHistory(false)
    } catch (error) {
      console.error("Error fetching attendance history:", error)
      toast.error("Failed to fetch attendance history. Please try again.")
      setLoadingHistory(false)
    }
  }

  // Back to section list
  const handleBackToSections = () => {
    setSelectedSection({})
    setStudents([])
    setAttendanceStatus({})
    setExistingAttendance(null)
  }

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

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {Object.keys(selectedSection).length === 0 ? (
          <motion.div
            key="section-list"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            variants={containerVariants}
          >
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
                <CardDescription>Select a section to mark or view attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search sections or courses..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 "
                  variants={containerVariants}
                >
                  {filteredSections.map((section) => {
                    // Find the course that this faculty teaches in this section
                    const courseFacultyMapping = section.courseFacultyMappings.find(
                      (mapping) => mapping.facultyId === facultyData._id,
                    )

                    const courseName = courseFacultyMapping?.courseId?.name || "Unknown Course"

                    return (
                      <motion.div
                        key={section._id}
                        className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleSectionSelect(section)}
                      >
                        <h3 className="font-semibold text-lg">{section.name}</h3>
                        <p className="text-sm text-muted-foreground">{courseName}</p>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="outline" className="bg-purple-50">
                            {section.students.length} Students
                          </Badge>
                          <span className="text-xs text-blue-500">Click to manage</span>
                        </div>
                      </motion.div>
                    )
                  })}

                  {filteredSections.length === 0 && (
                    <motion.div
                      className="col-span-full text-center py-8 text-muted-foreground"
                      variants={itemVariants}
                    >
                      No sections found matching your search.
                    </motion.div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="attendance-form"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
            variants={containerVariants}
          >
            <Card className="border-none shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <Button variant="ghost" size="sm" className="mb-2" onClick={handleBackToSections}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sections
                  </Button>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span>{selectedSection.name}</span>
                    {selectedSection.courseFacultyMappings?.find(
                      (mapping) => mapping.facultyId === facultyData._id,
                    ) && (
                        <Badge className="bg-[#63144c] text-white">
                          {selectedSection.courseFacultyMappings.find((mapping) => mapping.facultyId === facultyData._id)
                            ?.courseId?.name || "Unknown Course"}
                        </Badge>
                      )}
                  </CardTitle>
                  <CardDescription>
                    {isToday(attendanceDate)
                      ? "Mark attendance for today"
                      : `View/Edit attendance for ${format(attendanceDate, "MMMM d, yyyy")}`}
                  </CardDescription>
                  {existingAttendance !== null && (
                    <div className="mt-2">
                      <AttendanceStatusIndicator existingAttendance={existingAttendance} date={attendanceDate} />
                    </div>
                  )}
                </div>
                {/* <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">{format(attendanceDate, "MMM d, yyyy")}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={attendanceDate}
                        onSelect={(date) => {
                          if (date) handleDateChange(date)
                        }}
                        className="bg-white"
                        disabled={(date) => {
                          const startDate = selectedSection.semesterId?.startDate
                            ? parseISO(selectedSection.semesterId.startDate)
                            : null
                          return (startDate && isBefore(date, startDate)) || date > new Date()
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div> */}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-5 w-5 rounded-sm" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {existingAttendance !== null && (
                      <AttendanceStatusBanner existingAttendance={existingAttendance} date={attendanceDate} />
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-muted-foreground">{students.length} students in this section</div>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={markAllPresent} disabled={savingAttendance}>
                          Mark All Present
                        </Button>
                        <Button variant="outline" size="sm" onClick={markAllAbsent} disabled={savingAttendance}>
                          Mark All Absent
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-md overflow-hidden overflow-x-auto">
                      <div className={`w-full ${existingAttendance && existingAttendance.length > 0 ? "border-green-500 border-2" : ""}`}>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead
                            className={`${existingAttendance && existingAttendance.length > 0 ? "bg-green-50" : "bg-gray-50"}`}
                          >
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <AnimatePresence>
                              {students.map((student) => (
                                <motion.tr
                                  key={student._id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {student.studentId}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {student.firstName} {student.lastName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        id={`attendance-${student._id}`}
                                        checked={attendanceStatus[student._id] === "Present"}
                                        onCheckedChange={() => toggleAttendanceStatus(student._id)}
                                        disabled={savingAttendance}
                                      />
                                      <label
                                        htmlFor={`attendance-${student._id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                      >
                                        {attendanceStatus[student._id] === "Present" ? (
                                          <span className="flex items-center text-green-600">
                                            <Check className="h-4 w-4 mr-1" /> Present
                                          </span>
                                        ) : (
                                          <span className="flex items-center text-red-600">
                                            <X className="h-4 w-4 mr-1" /> Absent
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                  </td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>

                            {students.length === 0 && (
                              <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                                  No students found in this section.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex-col mt-6 sm:flex-row ">
                      <Button
                        variant="outline"
                        onClick={fetchAttendanceHistory}
                        disabled={loadingHistory}
                        className="mr-2 w-full sm:w-[12rem] mb-2"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {loadingHistory ? "Loading..." : "View History"}
                      </Button>
                      <Button
                        onClick={saveAttendance}
                        disabled={savingAttendance || students.length === 0}
                        className="bg-[#63144c] hover:bg-[#4a0f39] text-white w-full sm:w-[12rem]"
                      >
                        {savingAttendance ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {existingAttendance ? "Update Attendance" : "Save Attendance"}
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {showCalendarView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 " style={{ marginTop: "0px" }}>
          <div className="max-w-md w-full mt-0">
            <AttendanceCalendarView
              attendanceHistory={attendanceHistory}
              onClose={() => setShowCalendarView(false)}
              onSelectDate={(date) => {
                handleDateChange(date)
                setShowCalendarView(false)
              }}
              semesterStartDate={selectedSection.semesterId?.startDate}
              semesterEndDate={selectedSection.semesterId?.endDate}
              sectionId={selectedSection}
              facultyId={facultyData}
              className="mt-0"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceTab

