"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Edit, Trash2, ArrowLeft, Plus, FileText, X, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import axios from "axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const apiUrl = import.meta.env.VITE_API_URL

// Form schema for marks validation
const marksFormSchema = z
  .object({
    examType: z.string({
      required_error: "Please select an exam type",
    }),
    totalMarks: z.coerce.number().min(1, "Total marks must be at least 1").max(1000, "Total marks cannot exceed 1000"),
    passingMarks: z.coerce.number().min(0, "Passing marks must be at least 0"),
    remarks: z.string().optional(),
    studentMarks: z.array(
      z.object({
        studentId: z.string(),
        marksScored: z.coerce.number().min(0, "Marks scored must be at least 0"),
      }),
    ),
  })
  .refine((data) => data.passingMarks <= data.totalMarks, {
    message: "Passing marks cannot be greater than total marks",
    path: ["passingMarks"],
  })

const MarksTab = ({ facultyData, mySections }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSection, setSelectedSection] = useState({})
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingMarks, setSavingMarks] = useState(false)
  const [marksData, setMarksData] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingMarksId, setEditingMarksId] = useState(null)
  const [showMarksTable, setShowMarksTable] = useState(false)
  const [selectedExamType, setSelectedExamType] = useState(null)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [deleteExamType, setDeleteExamType] = useState(null)
  const [examTypes, setExamTypes] = useState([])

  // Initialize form
  const form = useForm({
    resolver: zodResolver(marksFormSchema),
    defaultValues: {
      examType: "",
      totalMarks: 100,
      passingMarks: 40,
      remarks: "",
      studentMarks: [],
    },
  })

  useEffect(() => {
    if (Object.keys(selectedSection).length > 0 && students.length > 0) {
      // Initialize student marks array when students are loaded
      const initialStudentMarks = students.map((student) => ({
        studentId: student._id,
        marksScored: 0,
      }))

      form.setValue("studentMarks", initialStudentMarks)
    }
  }, [students, form, selectedSection])

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
      setSelectedSection({ ...section })
      setShowMarksTable(false)
      setSelectedExamType(null)

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Fetch students in this section
      const response = await axios.get(`${apiUrl}/api/section/${section._id}/students`, config)
      setStudents(response.data.data.students)

      // Find the course that this faculty teaches in this section
      const courseFacultyMapping = section.courseFacultyMappings.find(
        (mapping) => mapping.facultyId === facultyData._id,
      )

      if (courseFacultyMapping?.courseId) {
        // Fetch exam types for this section
        const examTypesResponse = await axios.get(
          `${apiUrl}/api/marks/exam-types/${section._id}/course/${courseFacultyMapping.courseId._id}/faculty/${facultyData._id}`,
          config,
        )

        const fetchedExamTypes = examTypesResponse.data.data.examTypes || []
        setExamTypes(fetchedExamTypes)

        // If there are exam types, automatically load the first one
        if (fetchedExamTypes.length > 0) {
          setSelectedExamType(fetchedExamTypes[0])

          // Fetch marks for the first exam type
          const marksResponse = await axios.get(
            `${apiUrl}/api/marks/section/${section._id}/course/${courseFacultyMapping.courseId._id}/faculty/${facultyData._id}/exam-type/${fetchedExamTypes[0]}`,
            config,
          )

          setMarksData(marksResponse.data.data.marks || [])
          setShowMarksTable(true)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching section details:", error)
      toast.error("Failed to fetch section details. Please try again.")
      setLoading(false)
    }
  }

  // Fetch exam types for this section
  const fetchExamTypes = async (sectionId, config) => {
    try {
      // Find the course that this faculty teaches in this section
      const courseFacultyMapping =
        selectedSection.courseFacultyMappings?.find((mapping) => mapping.facultyId === facultyData._id) || {}

      if (!courseFacultyMapping.courseId) return

      const response = await axios.get(
        `${apiUrl}/api/marks/exam-types/${sectionId}/course/${courseFacultyMapping.courseId._id}/faculty/${facultyData._id}`,
        config,
      )

      setExamTypes(response.data.data.examTypes || [])
    } catch (error) {
      console.error("Error fetching exam types:", error)
      toast.error("Failed to fetch exam types. Please try again.")
    }
  }

  // Fetch marks for a specific exam type
  const fetchMarksByExamType = async (examType) => {
    try {
      setLoading(true)
      setSelectedExamType(examType)

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Find the course that this faculty teaches in this section
      const courseFacultyMapping = selectedSection.courseFacultyMappings.find(
        (mapping) => mapping.facultyId === facultyData._id,
      )

      if (!courseFacultyMapping) {
        toast.error("Could not find course mapping for this faculty.")
        setLoading(false)
        return
      }

      const courseId = courseFacultyMapping.courseId._id
      const facultyId = facultyData._id

      const response = await axios.get(
        `${apiUrl}/api/marks/section/${selectedSection._id}/course/${courseId}/faculty/${facultyId}/exam-type/${examType}`,
        config,
      )

      setMarksData(response.data.data.marks || [])
      setShowMarksTable(true)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching marks:", error)
      toast.error("Failed to fetch marks data. Please try again.")
      setLoading(false)
    }
  }

  // Handle adding new marks
  const onSubmitMarks = async (data) => {
    try {
      setSavingMarks(true)

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Find the course that this faculty teaches in this section
      const courseFacultyMapping = selectedSection.courseFacultyMappings.find(
        (mapping) => mapping.facultyId === facultyData._id,
      )

      if (!courseFacultyMapping) {
        toast.error("Could not find course mapping for this faculty.")
        setSavingMarks(false)
        return
      }

      const courseId = courseFacultyMapping.courseId._id
      const facultyId = facultyData._id

      // Prepare marks data
      const marksPayload = {
        sectionId: selectedSection._id,
        courseId: courseId,
        facultyId: facultyId,
        examType: data.examType,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        remarks: data.remarks || "",
        marksData: data.studentMarks.map((student) => ({
          studentId: student.studentId,
          marksScored: student.marksScored,
        })),
      }

      let response

      if (isEditing) {
        // Update existing marks
        response = await axios.put(`${apiUrl}/api/marks/bulk-update`, marksPayload, config)
      } else {
        // Add new marks
        response = await axios.post(`${apiUrl}/api/marks/bulk-add`, marksPayload, config)
      }

      if (response.status === 200) {
        toast.success(isEditing ? "Marks updated successfully." : "Marks added successfully.")
        setOpenAddDialog(false)

        // Refresh exam types
        await fetchExamTypes(selectedSection._id, config)

        // If we were viewing a specific exam type, refresh that data
        if (selectedExamType === data.examType) {
          await fetchMarksByExamType(data.examType)
        } else {
          setSelectedExamType(data.examType)
          await fetchMarksByExamType(data.examType)
        }

        // Reset form
        form.reset({
          examType: "",
          totalMarks: 100,
          passingMarks: 40,
          remarks: "",
          studentMarks: students.map((student) => ({
            studentId: student._id,
            marksScored: 0,
          })),
        })

        setIsEditing(false)
        setEditingMarksId(null)
      } else {
        toast.error("Failed to save marks. Please try again.")
      }

      setSavingMarks(false)
    } catch (error) {
      console.error("Error saving marks:", error)
      toast.error(error.response?.data?.message || "Failed to save marks. Please try again.")
      setSavingMarks(false)
    }
  }

  // Handle editing marks
  const handleEditMarks = async () => {
    try {
      setLoading(true)

      if (!marksData || marksData.length === 0) {
        toast.error("No marks data available to edit.")
        setLoading(false)
        return
      }

      // Get the first marks record to extract common data
      const firstRecord = marksData[0]

      // Set form values
      form.setValue("examType", firstRecord.examType)
      form.setValue("totalMarks", firstRecord.totalMarks)
      form.setValue("passingMarks", firstRecord.passingMarks)
      form.setValue("remarks", firstRecord.remarks || "")

      // Set student marks
      const studentMarksData = marksData.map((mark) => ({
        studentId: mark.studentId._id,
        marksScored: mark.marksScored,
      }))

      form.setValue("studentMarks", studentMarksData)

      setIsEditing(true)
      setEditingMarksId(firstRecord._id)
      setOpenAddDialog(true)
      setLoading(false)
    } catch (error) {
      console.error("Error preparing edit form:", error)
      toast.error("Failed to prepare edit form. Please try again.")
      setLoading(false)
    }
  }

  // Handle deleting marks for an exam type
  const handleDeleteMarks = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Find the course that this faculty teaches in this section
      const courseFacultyMapping = selectedSection.courseFacultyMappings.find(
        (mapping) => mapping.facultyId === facultyData._id,
      )

      if (!courseFacultyMapping) {
        toast.error("Could not find course mapping for this faculty.")
        setLoading(false)
        return
      }

      const courseId = courseFacultyMapping.courseId._id
      const facultyId = facultyData._id

      const response = await axios.delete(
        `${apiUrl}/api/marks/section/${selectedSection._id}/course/${courseId}/faculty/${facultyId}/exam-type/${deleteExamType}`,
        config,
      )

      if (response.status === 200) {
        toast.success("Marks deleted successfully.")

        // Refresh exam types
        await fetchExamTypes(selectedSection._id, config)

        // If we were viewing the deleted exam type, clear the view
        if (selectedExamType === deleteExamType) {
          setShowMarksTable(false)
          setSelectedExamType(null)
          setMarksData([])
        }
      } else {
        toast.error("Failed to delete marks. Please try again.")
      }

      setOpenDeleteDialog(false)
      setDeleteExamType(null)
      setLoading(false)
    } catch (error) {
      console.error("Error deleting marks:", error)
      toast.error(error.response?.data?.message || "Failed to delete marks. Please try again.")
      setLoading(false)
    }
  }

  // Back to section list
  const handleBackToSections = () => {
    setSelectedSection({})
    setStudents([])
    setShowMarksTable(false)
    setSelectedExamType(null)
    setMarksData([])
    setExamTypes([])
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
                <CardTitle>Marks Management</CardTitle>
                <CardDescription>Select a section to add or view marks</CardDescription>
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
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
            key="marks-management"
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
                  <CardDescription>Manage marks for students in this section</CardDescription>
                </div>
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
                    <div className="mb-6">
                      <Button
                        onClick={() => setOpenAddDialog(true)}
                        className="bg-[#63144c] hover:bg-[#4a0f39] text-white mb-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Marks
                      </Button>
                    </div>

                    {examTypes.length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex flex-wrap gap-3 mb-4">
                          {examTypes.map((type) => (
                            <motion.div
                              key={type}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                                selectedExamType === type
                                  ? "bg-[#63144c] text-white border-[#63144c]"
                                  : "bg-white hover:bg-gray-50"
                              }`}
                              onClick={() => fetchMarksByExamType(type)}
                            >
                              <span className="font-medium">{type.replace(/-/g, " ")}</span>
                            </motion.div>
                          ))}
                        </div>

                        {showMarksTable ? (
                          <div className="border rounded-md overflow-hidden">
                            <div className="bg-[#63144c] text-white p-3 flex justify-between items-center">
                              <h3 className="font-medium">
                                {selectedExamType?.replace(/-/g, " ")} -
                                {marksData.length > 0 && (
                                  <span className="ml-2">
                                    Total: {marksData[0]?.totalMarks}, Passing: {marksData[0]?.passingMarks}
                                  </span>
                                )}
                              </h3>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleEditMarks}
                                  disabled={!marksData.length}
                                  className="bg-white text-[#63144c] hover:bg-gray-100"
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span className="hidden sm:inline">Edit</span>
                                </Button>

                                <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDeleteExamType(selectedExamType)}
                                      disabled={!marksData.length}
                                      className="bg-white text-red-600 hover:bg-gray-100 hover:text-red-700"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span className="hidden sm:inline">Delete</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-white">
                                    <DialogHeader>
                                      <DialogTitle>Confirm Deletion</DialogTitle>
                                      <DialogDescription>
                                        Are you sure you want to delete all marks for{" "}
                                        {deleteExamType?.replace(/-/g, " ")}? This action cannot be undone.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                                        Cancel
                                      </Button>
                                      <Button variant="destructive" onClick={handleDeleteMarks} disabled={loading}>
                                        {loading ? "Deleting..." : "Delete"}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="whitespace-nowrap">Student ID</TableHead>
                                    <TableHead className="whitespace-nowrap">Name</TableHead>
                                    <TableHead className="whitespace-nowrap">Marks Scored</TableHead>
                                    <TableHead className="whitespace-nowrap">Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <AnimatePresence>
                                    {marksData.map((mark) => (
                                      <motion.tr
                                        key={mark._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <TableCell className="whitespace-nowrap">{mark.studentId.studentId}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                          {mark.studentId.firstName} {mark.studentId.lastName}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                          <span className="font-medium">{mark.marksScored}</span>
                                          <span className="text-muted-foreground text-xs ml-1">
                                            / {mark.totalMarks}
                                          </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                          {mark.marksScored >= mark.passingMarks ? (
                                            <Badge className="bg-green-100 text-green-800 flex items-center w-fit">
                                              <Check className="h-3 w-3 mr-1" /> Pass
                                            </Badge>
                                          ) : (
                                            <Badge className="bg-red-100 text-red-800 flex items-center w-fit">
                                              <X className="h-3 w-3 mr-1" /> Fail
                                            </Badge>
                                          )}
                                        </TableCell>
                                      </motion.tr>
                                    ))}
                                  </AnimatePresence>

                                  {marksData.length === 0 && (
                                    <TableRow>
                                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No marks data found for this exam type.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 border rounded-md">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">Select an Exam Type</h3>
                            <p className="text-muted-foreground mb-4">
                              Click on one of the exam types above to view marks.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 border rounded-md">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Marks Added Yet</h3>
                        <p className="text-muted-foreground mb-6">
                          No marks have been added for this section. Click 'Add New Marks' to get started.
                        </p>
                        <Button
                          onClick={() => setOpenAddDialog(true)}
                          className="bg-[#63144c] hover:bg-[#4a0f39] text-white"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Marks
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* Add Marks Dialog */}
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Update Marks" : "Add New Marks"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update marks for all students in this section"
                  : "Add marks for all students in this section"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitMarks)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="examType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="Midterm-1">Midterm 1</SelectItem>
                            <SelectItem value="Midterm-2">Midterm 2</SelectItem>
                            <SelectItem value="Midterm-3">Midterm 3</SelectItem>
                            <SelectItem value="Reattempt-Midterm-1">Reattempt Midterm 1</SelectItem>
                            <SelectItem value="Reattempt-Midterm-2">Reattempt Midterm 2</SelectItem>
                            <SelectItem value="Reattempt-Midterm-3">Reattempt Midterm 3</SelectItem>
                            <SelectItem value="Final">Final Exam</SelectItem>
                            <SelectItem value="Reattempt-Final">Reattempt Final</SelectItem>
                            <SelectItem value="Quiz">Quiz</SelectItem>
                            <SelectItem value="Reattempt-Quiz">Reattempt Quiz</SelectItem>
                            <SelectItem value="Assignment">Assignment</SelectItem>
                            <SelectItem value="Reattempt-Assignment">Reattempt Assignment</SelectItem>
                            <SelectItem value="Lab">Lab</SelectItem>
                            <SelectItem value="Reattempt-Lab">Reattempt Lab</SelectItem>
                            <SelectItem value="Final Lab">Final Lab</SelectItem>
                            <SelectItem value="Reattempt-Final-Lab">Reattempt Final Lab</SelectItem>
                            <SelectItem value="Observation">Observation</SelectItem>
                            <SelectItem value="Attendance">Attendance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Marks</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passingMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Marks</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Add any remarks about this assessment" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Student Marks</h3>

                  <div className="max-h-[40vh] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Marks Scored</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student, index) => (
                          <TableRow key={student._id}>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`studentMarks.${index}.marksScored`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="number" {...field} min={0} max={form.watch("totalMarks")} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <input
                                type="hidden"
                                {...form.register(`studentMarks.${index}.studentId`)}
                                value={student._id}
                              />
                            </TableCell>
                            <TableCell>
                              {form.watch(`studentMarks.${index}.marksScored`) >= form.watch("passingMarks") ? (
                                <Badge className="bg-green-100 text-green-800">Pass</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Fail</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpenAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-[#63144c] hover:bg-[#4a0f39] text-white" disabled={savingMarks}>
                    {savingMarks ? "Saving..." : isEditing ? "Update Marks" : "Save Marks"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </div>
  )
}

export default MarksTab

