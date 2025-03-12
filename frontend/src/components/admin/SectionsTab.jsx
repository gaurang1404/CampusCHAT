"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Filter, BookOpen, Loader2, Search, List, Grid, ChevronRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const apiUrl = import.meta.env.VITE_API_URL

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const tableRowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
}

const SectionsTab = () => {
  const [sections, setSections] = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterSemester, setFilterSemester] = useState("all")
  const [viewMode, setViewMode] = useState("list") // "list" or "grid"
  const [expandedSemester, setExpandedSemester] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    semesterId: "",
  })

  const [isCourseFacultyDialogOpen, setIsCourseFacultyDialogOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [faculties, setFaculties] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [filteredFaculties, setFilteredFaculties] = useState([])
  const [courseSearch, setCourseSearch] = useState("")
  const [facultySearch, setFacultySearch] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [mappingFormData, setMappingFormData] = useState({
    sectionId: "",
    courseId: "",
    facultyId: "",
  })
  const [mappingFormErrors, setMappingFormErrors] = useState({})

  // Add a new state for the view mappings dialog
  const [isViewMappingsDialogOpen, setIsViewMappingsDialogOpen] = useState(false)
  const [selectedSectionMappings, setSelectedSectionMappings] = useState([])
  const [selectedSectionName, setSelectedSectionName] = useState("")
  const [isDeleteMappingDialogOpen, setIsDeleteMappingDialogOpen] = useState(false)
  const [currentMapping, setCurrentMapping] = useState(null)
  const [deletingMapping, setDeletingMapping] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchSemesters()
    fetchSections()
  }, [])

  useEffect(() => {
    if (isCourseFacultyDialogOpen) {
      fetchCourses()
      fetchFaculties()
    }
  }, [isCourseFacultyDialogOpen])

  useEffect(() => {
    fetchSections()
  }, [filterSemester, searchQuery])

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const response = await axios.get(`${apiUrl}/api/semester/`, config)
      setSemesters(response.data.data.semesters)
    } catch (err) {
      console.error("Error fetching semesters:", err)
      toast.error("Failed to load semesters")
    }
  }

  const fetchSections = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const url = `${apiUrl}/api/section/`
      const response = await axios.get(url, config)
      let filteredSections = response.data.data.sections
      if (filterSemester !== "all") {
        filteredSections = filteredSections.filter(
          (section) => section.semesterId && section.semesterId._id === filterSemester,
        )
      }

      // Apply search filter if present
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredSections = filteredSections.filter(
          (section) =>
            section.name.toLowerCase().includes(query) ||
            (section.semesterId && section.semesterId.name.toLowerCase().includes(query)),
        )
      }

      setSections(filteredSections)
      setError(null)
    } catch (err) {
      setError("Failed to fetch sections. Please try again later.")
      console.error("Error fetching sections:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async (departmentId) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const response = await axios.get(`${apiUrl}/api/course/`, config)
      const allCourses = response.data.data
      const filteredCourses = departmentId
        ? allCourses.filter((course) => course.departmentId._id === departmentId)
        : allCourses
      setCourses(filteredCourses)
      setFilteredCourses(filteredCourses)
    } catch (err) {
      console.error("Error fetching courses:", err)
      toast.error("Failed to load courses")
    }
  }

  const fetchFaculties = async (departmentId) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const response = await axios.get(`${apiUrl}/api/faculty/`, config)
      const allFaculties = response.data.data.faculties
      const filteredFaculties = departmentId
        ? allFaculties.filter((faculty) => faculty.departmentId._id === departmentId)
        : allFaculties
      setFaculties(filteredFaculties)
      setFilteredFaculties(filteredFaculties)
    } catch (err) {
      console.error("Error fetching faculties:", err)
      toast.error("Failed to load faculties")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" })
    }
    if (serverError) {
      setServerError(null)
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value })
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" })
    }
  }

  const validateForm = () => {
    const errors = {}
    const requiredFields = ["name", "semesterId"]
    requiredFields.forEach((field) => {
      if (!formData[field] || (typeof formData[field] === "string" && formData[field].trim() === "")) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`
      }
    })
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSection = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const response = await axios.post(`${apiUrl}/api/section/add`, formData, config)
      if (response.data.code === 201) {
        fetchSections()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("Section added successfully")
      } else {
        setServerError(response.data.message || "Failed to add section. Please try again.")
      }
    } catch (err) {
      console.error("Error adding section:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to add section. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSection = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const response = await axios.put(`${apiUrl}/api/section/${currentSection._id}`, formData, config)
      if (response.data.code === 200) {
        fetchSections()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("Section updated successfully")
      } else {
        setServerError(response.data.message || "Failed to update section. Please try again.")
      }
    } catch (err) {
      console.error("Error updating section:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to update section. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSection = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const response = await axios.delete(`${apiUrl}/api/section/${currentSection._id}`, config)
      if (response.data.code === 200) {
        toast.success("Section deleted successfully")
        fetchSections()
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(response.data.message || "Failed to delete section")
      }
    } catch (err) {
      console.error("Error deleting section:", err)
      const errorMessage = err.response?.data?.message || "Failed to delete section. Please try again."
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMappingInputChange = async (name, value) => {
    setMappingFormData({ ...mappingFormData, [name]: value })
    if (mappingFormErrors[name]) {
      setMappingFormErrors({ ...mappingFormErrors, [name]: "" })
    }

    if (name === "sectionId") {
      const selectedSection = sections.find((section) => section._id === value)
      if (selectedSection && selectedSection.semesterId) {
        try {
          const token = localStorage.getItem("token") || sessionStorage.getItem("token")
          const config = { headers: { Authorization: `Bearer ${token}` } }
          const response = await axios.get(`${apiUrl}/api/semester/${selectedSection.semesterId._id}`, config)
          console.log(response)

          const semesterDepartmentId = response.data.data.semester.departmentId
          console.log(semesterDepartmentId._id)
          fetchCourses(semesterDepartmentId._id)
          fetchFaculties(semesterDepartmentId._id)
        } catch (err) {
          console.error("Error fetching semester details:", err)
          toast.error("Failed to load courses and faculties for the selected section")
        }
      }
    }
  }

  const handleCourseSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    setCourseSearch(searchTerm)
    if (searchTerm.trim() === "") {
      setFilteredCourses(courses)
    } else {
      const filtered = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm) || course.courseCode.toLowerCase().includes(searchTerm),
      )
      setFilteredCourses(filtered)
    }
  }

  const handleFacultySearch = (e) => {
    const searchTerm = e.target.value.toLowerCase()
    setFacultySearch(searchTerm)
    if (searchTerm.trim() === "") {
      setFilteredFaculties(faculties)
    } else {
      const filtered = faculties.filter(
        (faculty) =>
          `${faculty.firstName} ${faculty.lastName}`.toLowerCase().includes(searchTerm) ||
          faculty.facultyId.toLowerCase().includes(searchTerm),
      )
      setFilteredFaculties(filtered)
    }
  }

  const validateMappingForm = () => {
    const errors = {}
    const requiredFields = ["sectionId", "courseId", "facultyId"]
    requiredFields.forEach((field) => {
      if (
        !mappingFormData[field] ||
        (typeof mappingFormData[field] === "string" && mappingFormData[field].trim() === "")
      ) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`
      }
    })
    setMappingFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddCourseFacultyMapping = async () => {
    if (!validateMappingForm()) {
      toast.error("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }
      console.log(mappingFormData)
      const response = await axios.post(`${apiUrl}/api/section/mapping`, mappingFormData, config)

      if (response.data.code === 200) {
        fetchSections()
        setIsCourseFacultyDialogOpen(false)
        resetMappingForm()
        toast.success("Course-Faculty mapping added successfully")
      } else {
        setServerError(response.data.message || "Failed to add mapping. Please try again.")
      }
    } catch (err) {
      console.log(err)
      console.error("Error adding course-faculty mapping:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to add mapping. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const resetMappingForm = () => {
    setMappingFormData({ sectionId: "", courseId: "", facultyId: "" })
    setMappingFormErrors({})
    setServerError(null)
    setCourseSearch("")
    setFacultySearch("")
    setFilteredCourses([])
    setFilteredFaculties([])
  }

  const resetForm = () => {
    setFormData({ name: "", semesterId: "" })
    setFormErrors({})
    setServerError(null)
  }

  const openEditDialog = (section) => {
    setCurrentSection(section)
    setFormData({
      name: section.name,
      semesterId: section.semesterId._id,
    })
    setFormErrors({})
    setServerError(null)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (section) => {
    setCurrentSection(section)
    setIsDeleteDialogOpen(true)
  }

  // Add this function to open the view mappings dialog
  const openViewMappingsDialog = (section) => {
    setCurrentSection(section) // Store the current section for use in deletion
    setSelectedSectionMappings(section.courseFacultyMappings || [])
    setSelectedSectionName(section.name)
    setIsViewMappingsDialogOpen(true)
  }

  // Add this function to handle mapping deletion
  const handleDeleteMapping = async () => {
    if (!currentMapping) return

    setDeletingMapping(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Create the request body with both sectionId and mappingId
      const requestBody = {
        sectionId: currentSection._id,
        mappingId: currentMapping._id,
      }
      console.log(config)

      // Send the request with the proper body
      const response = await axios.delete(`${apiUrl}/api/section/mapping/`, {
        ...config,
        data: requestBody, // Move requestBody inside config
      })

      if (response.data.code === 200) {
        // Update the local state to remove the deleted mapping
        setSelectedSectionMappings(selectedSectionMappings.filter((mapping) => mapping._id !== currentMapping._id))
        toast.success("Mapping deleted successfully")
        setIsDeleteMappingDialogOpen(false)
        fetchSections() // Refresh the sections data
      } else {
        toast.error(response.data.message || "Failed to delete mapping")
      }
    } catch (err) {
      console.error("Error deleting mapping:", err)
      const errorMessage = err.response?.data?.message || "Failed to delete mapping. Please try again."
      toast.error(errorMessage)
    } finally {
      setDeletingMapping(false)
    }
  }

  // Add this function to open the delete mapping dialog
  const openDeleteMappingDialog = (mapping) => {
    setCurrentMapping(mapping)
    setIsDeleteMappingDialogOpen(true)
  }

  const getSemesterName = (semesterId) => {
    const semester = semesters.find((sem) => sem._id === semesterId)
    return semester ? semester.name : "Unknown Semester"
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    // Debounce search to avoid too many re-renders
    const timeoutId = setTimeout(() => {
      fetchSections()
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Group sections by semester for grid view
  const getSectionsBySemester = () => {
    const grouped = {}

    // Initialize with all semesters (even empty ones)
    semesters.forEach((sem) => {
      grouped[sem._id] = {
        semester: sem,
        sections: [],
      }
    })

    // Add sections to their semesters
    sections.forEach((section) => {
      if (section.semesterId) {
        const semId = section.semesterId._id
        if (grouped[semId]) {
          grouped[semId].sections.push(section)
        } else {
          // In case there's a section with a semester not in our list
          grouped[semId] = {
            semester: section.semesterId,
            sections: [section],
          }
        }
      }
    })

    // Convert to array and sort
    return Object.values(grouped).sort((a, b) => a.semester.name.localeCompare(b.semester.name))
  }

  const toggleSemesterExpansion = (semId) => {
    if (expandedSemester === semId) {
      setExpandedSemester(null)
    } else {
      setExpandedSemester(semId)
    }
  }

  return (
    <motion.div className="p-6 mx-auto" initial="hidden" animate="visible" variants={fadeIn}>
      <Card className="max-w-[1200px] border shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#63144c] to-[#8a1a68] text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle className="text-2xl font-bold flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              Section Management
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white opacity-70" />
                <Input
                  placeholder="Search sections..."
                  className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/70 w-full"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                <TabsList className="bg-white/10 border-white/20">
                  <TabsTrigger
                    value="list"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#63144c] text-white"
                  >
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                  <TabsTrigger
                    value="grid"
                    className="data-[state=active]:bg-white data-[state=active]:text-[#63144c] text-white"
                  >
                    <Grid className="h-4 w-4 mr-2" />
                    Grid
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Dialog
                open={isCourseFacultyDialogOpen}
                onOpenChange={(open) => {
                  setIsCourseFacultyDialogOpen(open)
                  if (!open && !submitting) resetMappingForm()
                }}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-colors duration-300 shadow-md">
                    <Plus size={16} />
                    <span className="hidden md:block">Add Course-Faculty</span>
                    <span className="md:hidden">Add C-F</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-white">
                  <DialogHeader className="text-[#63144c]">
                    <DialogTitle className="font-extrabold text-2xl">Add Course-Faculty Mapping</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    Associate a course with a faculty member for a specific section.
                  </DialogDescription>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                      role="alert"
                    >
                      <span className="block sm:inline">{serverError}</span>
                    </motion.div>
                  )}
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="sectionId">Section</Label>
                      <Select
                        onValueChange={(value) => handleMappingInputChange("sectionId", value)}
                        value={mappingFormData.sectionId}
                      >
                        <SelectTrigger
                          className={`${mappingFormErrors.sectionId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        >
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {sections.map((section) => (
                            <SelectItem key={section._id} value={section._id}>
                              {section.name} ({section.semesterId ? section.semesterId.name : "N/A"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {mappingFormErrors.sectionId && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {mappingFormErrors.sectionId}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="courseId">Course</Label>
                      <Select
                        onValueChange={(value) => handleMappingInputChange("courseId", value)}
                        value={mappingFormData.courseId}
                      >
                        <SelectTrigger
                          className={`${mappingFormErrors.courseId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        >
                          <SelectValue placeholder="Search and select a course" />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                          <div className="px-3 py-2">
                            <Input
                              placeholder="Search courses..."
                              value={courseSearch}
                              onChange={handleCourseSearch}
                              className="mb-2"
                            />
                          </div>
                          {filteredCourses.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">No courses found</div>
                          ) : (
                            filteredCourses.map((course) => (
                              <SelectItem key={course._id} value={course._id}>
                                {course.courseCode}: {course.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {mappingFormErrors.courseId && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {mappingFormErrors.courseId}
                        </motion.p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="facultyId">Faculty</Label>
                      <Select
                        onValueChange={(value) => handleMappingInputChange("facultyId", value)}
                        value={mappingFormData.facultyId}
                      >
                        <SelectTrigger
                          className={`${mappingFormErrors.facultyId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        >
                          <SelectValue placeholder="Search and select a faculty member" />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                          <div className="px-3 py-2">
                            <Input
                              placeholder="Search faculty..."
                              value={facultySearch}
                              onChange={handleFacultySearch}
                              className="mb-2"
                            />
                          </div>
                          {filteredFaculties.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">No faculty members found</div>
                          ) : (
                            filteredFaculties.map((faculty) => (
                              <SelectItem key={faculty._id} value={faculty._id}>
                                {faculty.firstName} {faculty.lastName} ({faculty.facultyId})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {mappingFormErrors.facultyId && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {mappingFormErrors.facultyId}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!submitting) {
                          setIsCourseFacultyDialogOpen(false)
                          resetMappingForm()
                        }
                      }}
                      disabled={submitting}
                      className="mt-3 transition-all duration-200"
                    >
                      Cancel
                    </Button>

                    <Button
                      className="bg-[#63144c] text-white mt-3 hover:bg-[#5f0a47] hover:text-white transition-all duration-200 shadow-md"
                      onClick={handleAddCourseFacultyMapping}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Mapping"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white text-[#63144c] hover:bg-gray-100 hover:text-[#63144c] transition-colors duration-300 shadow-md"
                  >
                    <Filter size={16} className="md:mr-2" />
                    <span className="hidden md:block">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white shadow-lg border-none">
                  <DropdownMenuLabel>Filter by Semester</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={filterSemester} onValueChange={setFilterSemester}>
                    <DropdownMenuRadioItem value="all" className="cursor-pointer transition-colors">
                      All Semesters
                    </DropdownMenuRadioItem>
                    {semesters.map((semester) => (
                      <DropdownMenuRadioItem
                        key={semester._id}
                        value={semester._id}
                        className="cursor-pointer transition-colors"
                      >
                        {semester.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog
                open={isAddDialogOpen}
                onOpenChange={(open) => {
                  setIsAddDialogOpen(open)
                  if (!open && !submitting) resetForm()
                }}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 transition-colors duration-300 shadow-md">
                    <Plus size={16} />
                    <span className="hidden md:block">Add Section</span>
                    <span className="md:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-white">
                  <DialogHeader className="text-[#63144c]">
                    <DialogTitle className="font-extrabold text-2xl">Add New Section</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>Fill in the details to create a new section.</DialogDescription>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                      role="alert"
                    >
                      <span className="block sm:inline">{serverError}</span>
                    </motion.div>
                  )}
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Section Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter section name"
                        className={`${formErrors.name ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                      />
                      {formErrors.name && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {formErrors.name}
                        </motion.p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="semesterId">Semester</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("semesterId", value)}
                        value={formData.semesterId}
                        key={formData.semesterId}
                      >
                        <SelectTrigger
                          className={`${formErrors.semesterId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        >
                          <SelectValue placeholder="Select a semester" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {semesters.map((semester) => (
                            <SelectItem key={semester._id} value={semester._id}>
                              {semester.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.semesterId && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {formErrors.semesterId}
                        </motion.p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!submitting) {
                          setIsAddDialogOpen(false)
                          resetForm()
                        }
                      }}
                      disabled={submitting}
                      className="mt-3 transition-all duration-200"
                    >
                      Cancel
                    </Button>

                    <Button
                      className="bg-[#63144c] text-white mt-3 hover:bg-[#5f0a47] hover:text-white transition-all duration-200 shadow-md"
                      onClick={handleAddSection}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Section"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 text-center text-red-500">
              {error}
            </motion.div>
          ) : sections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center text-gray-500 flex flex-col items-center justify-center"
            >
              <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg">No sections found. Add a section to get started.</p>
            </motion.div>
          ) : viewMode === "list" ? (
            // List View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sections.map((section, index) => (
                      <motion.tr
                        key={section._id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tableRowVariants}
                        className="border-b transition-colors hover:bg-gray-50/50"
                      >
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>
                          {section.semesterId ? (
                            <Badge variant="outline" className="bg-[#63144c]/10 text-[#63144c] border-[#63144c]/20">
                              {section.semesterId.name}
                            </Badge>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {section.students ? section.students.length : 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                            {section.courseFacultyMappings ? section.courseFacultyMappings.length : 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              onClick={() => openViewMappingsDialog(section)}
                              title="View Mappings"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              onClick={() => openEditDialog(section)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              onClick={() => openDeleteDialog(section)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          ) : (
            // Grid View - Grouped by Semester
            <div className="p-4">
              <AnimatePresence>
                {getSectionsBySemester().map((group, groupIndex) => (
                  <motion.div
                    key={group.semester._id}
                    custom={groupIndex}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={cardVariants}
                    className="mb-6"
                  >
                    <Card className="border shadow-sm overflow-hidden">
                      <CardHeader
                        className="bg-gradient-to-r from-[#63144c]/5 to-[#8a1a68]/5 p-4 cursor-pointer"
                        onClick={() => toggleSemesterExpansion(group.semester._id)}
                      >
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-medium flex items-center">
                            <BookOpen className="mr-2 h-5 w-5 text-[#63144c]" />
                            {group.semester.name}
                            <Badge className="ml-3 bg-[#63144c]/10 text-[#63144c] hover:bg-[#63144c]/20 border-[#63144c]/20">
                              {group.sections.length} {group.sections.length === 1 ? "section" : "sections"}
                            </Badge>
                          </CardTitle>
                          <ChevronRight
                            className={`h-5 w-5 text-[#63144c] transition-transform duration-200 ${
                              expandedSemester === group.semester._id ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </CardHeader>

                      {expandedSemester === group.semester._id && (
                        <CardContent className="p-4">
                          {group.sections.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">No sections found for this semester</div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <AnimatePresence>
                                {group.sections.map((section, secIndex) => (
                                  <motion.div
                                    key={section._id}
                                    custom={secIndex}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={cardVariants}
                                  >
                                    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="font-medium text-lg">{section.name}</div>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-3">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                              {section.students ? section.students.length : 0} Students
                                            </Badge>
                                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                              {section.courseFacultyMappings ? section.courseFacultyMappings.length : 0}{" "}
                                              Courses
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                            onClick={() => openViewMappingsDialog(section)}
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              className="mr-1"
                                            >
                                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                            </svg>
                                            Mappings
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                            onClick={() => openEditDialog(section)}
                                          >
                                            <Pencil size={14} className="mr-1" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                            onClick={() => openDeleteDialog(section)}
                                          >
                                            <Trash2 size={14} className="mr-1" />
                                            Delete
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4 bg-gray-50/50">
          <div className="text-sm text-gray-500">Total: {sections.length} section(s)</div>
          <Button variant="outline" onClick={fetchSections} className="transition-all duration-200 hover:bg-gray-100">
            Refresh
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Section Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!submitting) {
            setIsEditDialogOpen(open)
            if (!open) resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <DialogDescription>Make changes to the section information below.</DialogDescription>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{serverError}</span>
            </motion.div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Section Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${formErrors.name ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
              />
              {formErrors.name && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                  {formErrors.name}
                </motion.p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-semesterId">Semester</Label>
              <Select
                onValueChange={(value) => handleSelectChange("semesterId", value)}
                value={formData.semesterId}
                key={formData.semesterId}
              >
                <SelectTrigger
                  className={`${formErrors.semesterId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                >
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {semesters.map((semester) => (
                    <SelectItem key={semester._id} value={semester._id}>
                      {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.semesterId && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                  {formErrors.semesterId}
                </motion.p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!submitting) {
                  setIsEditDialogOpen(false)
                  resetForm()
                }
              }}
              disabled={submitting}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSection}
              disabled={submitting}
              className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white transition-all duration-200 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Section"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!submitting) setIsDeleteDialogOpen(open)
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the section "{currentSection?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting} className="transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              className="bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Mappings Dialog */}
      <Dialog open={isViewMappingsDialogOpen} onOpenChange={(open) => setIsViewMappingsDialogOpen(open)}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Course-Faculty Mappings for {selectedSectionName}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {selectedSectionMappings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center text-gray-500 flex flex-col items-center"
              >
                <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
                <p>No mappings found for this section.</p>
              </motion.div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {selectedSectionMappings.map((mapping, index) => (
                      <motion.tr
                        key={mapping._id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tableRowVariants}
                        className="border-b transition-colors hover:bg-gray-50/50"
                      >
                        <TableCell>
                          <div className="font-medium">{mapping.courseId ? mapping.courseId.courseCode : "N/A"}</div>
                          <div className="text-sm text-gray-500">{mapping.courseId ? mapping.courseId.name : ""}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {mapping.facultyId ? `${mapping.facultyId.firstName} ${mapping.facultyId.lastName}` : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {mapping.facultyId ? mapping.facultyId.facultyId : ""}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            onClick={() => openDeleteMappingDialog(mapping)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsViewMappingsDialogOpen(false)}
              className="transition-all duration-200 shadow-md"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Mapping Confirmation Dialog */}
      <AlertDialog
        open={isDeleteMappingDialogOpen}
        onOpenChange={(open) => {
          if (!deletingMapping) setIsDeleteMappingDialogOpen(open)
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the mapping between
              {currentMapping?.courseId ? ` "${currentMapping.courseId.name}"` : ""} and
              {currentMapping?.facultyId
                ? ` "${currentMapping.facultyId.firstName} ${currentMapping.facultyId.lastName}"`
                : ""}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingMapping} className="transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMapping}
              className="bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md"
              disabled={deletingMapping}
            >
              {deletingMapping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

export default SectionsTab

