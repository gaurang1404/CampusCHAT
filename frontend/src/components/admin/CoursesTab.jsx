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
import { Textarea } from "@/components/ui/textarea"
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

const CoursesTab = () => {
  const [courses, setCourses] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("list") // "list" or "grid"
  const [expandedDepartment, setExpandedDepartment] = useState(null)
  const [formData, setFormData] = useState({
    courseCode: "",
    name: "",
    description: "",
    departmentId: "",
    credits: 3,
    status: "Open",
  })

  // Fetch courses and departments on component mount
  useEffect(() => {
    fetchDepartments()
    fetchCourses()
  }, [])

  // Fetch courses with filter
  useEffect(() => {
    fetchCourses()
  }, [filterDepartment, filterStatus, searchQuery])

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.get(`${apiUrl}/api/department/`, config)
      setDepartments(response.data.data.departments)
    } catch (err) {
      console.error("Error fetching departments:", err)
      toast.error("Failed to load departments")
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Get all courses first
      let url = `${apiUrl}/api/course/`

      // If status filter is active, use the specific endpoint
      if (filterStatus !== "all") {
        if (filterStatus === "Open") {
          url = `${apiUrl}/api/course/open`
        } else if (filterStatus === "Closed") {
          url = `${apiUrl}/api/course/closed`
        } else if (filterStatus === "Waitlisted") {
          url = `${apiUrl}/api/course/waitlisted`
        }
      }

      const response = await axios.get(url, config)
      let coursesData = response.data.data

      // If department filter is active, filter the results client-side
      if (filterDepartment !== "all") {
        coursesData = coursesData.filter(
          (course) => course.departmentId && course.departmentId._id === filterDepartment,
        )
      }

      // Apply search filter if present
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        coursesData = coursesData.filter(
          (course) =>
            course.name.toLowerCase().includes(query) ||
            course.courseCode.toLowerCase().includes(query) ||
            (course.departmentId && course.departmentId.name.toLowerCase().includes(query)),
        )
      }

      setCourses(coursesData)
      setError(null)
    } catch (err) {
      setError("Failed to fetch courses. Please try again later.")
      console.error("Error fetching courses:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }

    // Clear server error when user makes changes
    if (serverError) {
      setServerError(null)
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    // Convert to number and ensure it's within valid range (1-6 for credits)
    const numValue = Math.min(Math.max(Number.parseInt(value) || 1, 1), 6)

    setFormData({
      ...formData,
      [name]: numValue,
    })

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    const requiredFields = ["courseCode", "name", "description", "departmentId", "credits"]

    requiredFields.forEach((field) => {
      if (!formData[field] || (typeof formData[field] === "string" && formData[field].trim() === "")) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`
      }
    })

    // Validate description length
    if (formData.description && formData.description.length > 2000) {
      errors.description = "Description must not exceed 2000 characters"
    }

    // Validate credits
    if (formData.credits < 1 || formData.credits > 6) {
      errors.credits = "Credits must be between 1 and 6"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddCourse = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    setSubmitting(true)
    setServerError(null)

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.post(`${apiUrl}/api/course/add`, formData, config)

      if (response.data.code === 201) {
        fetchCourses()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("Course added successfully")
      } else {
        // Handle API success: false response
        setServerError(response.data.message || "Failed to add course. Please try again.")
      }
    } catch (err) {
      console.error("Error adding course:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to add course. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCourse = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    setSubmitting(true)
    setServerError(null)

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.put(`${apiUrl}/api/course/${currentCourse._id}`, formData, config)

      if (response.data.code === 200) {
        fetchCourses()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("Course updated successfully")
      } else {
        // Handle API success: false response
        setServerError(response.data.message || "Failed to update course. Please try again.")
      }
    } catch (err) {
      console.error("Error updating course:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to update course. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCourse = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.delete(`${apiUrl}/api/course/${currentCourse._id}`, config)

      if (response.data.code === 200) {
        toast.success("Course deleted successfully")
        fetchCourses()
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(response.data.message || "Failed to delete course")
      }
    } catch (err) {
      console.error("Error deleting course:", err)
      const errorMessage = err.response?.data?.message || "Failed to delete course. Please try again."
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (courseId, newStatus) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.patch(`${apiUrl}/api/course/${courseId}/status`, { status: newStatus }, config)

      if (response.data.code === 200) {
        toast.success(`Course status updated to ${newStatus}`)
        fetchCourses()
      } else {
        toast.error(response.data.message || "Failed to update course status")
      }
    } catch (err) {
      console.error("Error updating course status:", err)
      toast.error(err.response?.data?.message || "Failed to update course status")
    }
  }

  const resetForm = () => {
    setFormData({
      courseCode: "",
      name: "",
      description: "",
      departmentId: "",
      credits: 3,
      status: "Open",
    })
    setFormErrors({})
    setServerError(null)
  }

  const openEditDialog = (course) => {
    setCurrentCourse(course)
    setFormData({
      courseCode: course.courseCode,
      name: course.name,
      description: course.description,
      departmentId: course.departmentId._id,
      credits: course.credits,
      status: course.status || "Open",
    })
    setFormErrors({})
    setServerError(null)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (course) => {
    setCurrentCourse(course)
    setIsDeleteDialogOpen(true)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    // Debounce search to avoid too many re-renders
    const timeoutId = setTimeout(() => {
      fetchCourses()
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Get status badge styling
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-800 border-green-200"
      case "Closed":
        return "bg-red-100 text-red-800 border-red-200"
      case "Waitlisted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Group courses by department for grid view
  const getCoursesByDepartment = () => {
    const grouped = {}

    // Initialize with all departments (even empty ones)
    departments.forEach((dept) => {
      grouped[dept._id] = {
        department: dept,
        courses: [],
      }
    })

    // Add courses to their departments
    courses.forEach((course) => {
      if (course.departmentId) {
        const deptId = course.departmentId._id
        if (grouped[deptId]) {
          grouped[deptId].courses.push(course)
        } else {
          // In case there's a course with a department not in our list
          grouped[deptId] = {
            department: course.departmentId,
            courses: [course],
          }
        }
      }
    })

    // Convert to array and sort
    return Object.values(grouped).sort((a, b) => a.department.name.localeCompare(b.department.name))
  }

  const toggleDepartmentExpansion = (deptId) => {
    if (expandedDepartment === deptId) {
      setExpandedDepartment(null)
    } else {
      setExpandedDepartment(deptId)
    }
  }

  // Truncate description for grid view
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <motion.div className="p-6 mx-auto" initial="hidden" animate="visible" variants={fadeIn}>
      <Card className="max-w-[1200px] border shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#63144c] to-[#8a1a68] text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle className="text-2xl font-bold flex items-center">
              <BookOpen className="mr-2 h-6 w-6" />
              Course Management
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white opacity-70" />
                <Input
                  placeholder="Search courses..."
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
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
                    Department
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={filterDepartment} onValueChange={setFilterDepartment}>
                    <DropdownMenuRadioItem value="all" className="cursor-pointer transition-colors">
                      All Departments
                    </DropdownMenuRadioItem>
                    {departments.map((department) => (
                      <DropdownMenuRadioItem
                        key={department._id}
                        value={department._id}
                        className="cursor-pointer transition-colors"
                      >
                        {department.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Status</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={filterStatus} onValueChange={setFilterStatus}>
                    <DropdownMenuRadioItem value="all" className="cursor-pointer transition-colors">
                      All Statuses
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Open" className="cursor-pointer transition-colors">
                      Open
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Closed" className="cursor-pointer transition-colors">
                      Closed
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Waitlisted" className="cursor-pointer transition-colors">
                      Waitlisted
                    </DropdownMenuRadioItem>
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
                    <span className="hidden md:block">Add Course</span>
                    <span className="md:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-white">
                  <DialogHeader className="text-[#63144c]">
                    <DialogTitle className="font-extrabold text-2xl">Add New Course</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>Fill in the details to create a new course.</DialogDescription>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="courseCode">Course Code</Label>
                        <Input
                          id="courseCode"
                          name="courseCode"
                          value={formData.courseCode}
                          onChange={handleInputChange}
                          required
                          placeholder="E.g., CS101"
                          className={`${formErrors.courseCode ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        />
                        {formErrors.courseCode && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                            {formErrors.courseCode}
                          </motion.p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="credits">Credits</Label>
                        <Input
                          id="credits"
                          name="credits"
                          type="number"
                          min="1"
                          max="6"
                          value={formData.credits}
                          onChange={handleNumberChange}
                          className={`${formErrors.credits ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        />
                        {formErrors.credits && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                            {formErrors.credits}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Course Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter course name"
                        className={`${formErrors.name ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                      />
                      {formErrors.name && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {formErrors.name}
                        </motion.p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="departmentId">Department</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("departmentId", value)}
                        value={formData.departmentId}
                        key={formData.departmentId}
                      >
                        <SelectTrigger
                          className={`${formErrors.departmentId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        >
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {departments.map((department) => (
                            <SelectItem key={department._id} value={department._id}>
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.departmentId && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {formErrors.departmentId}
                        </motion.p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={(value) => handleSelectChange("status", value)} value={formData.status}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                          <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter course description"
                        className={`${formErrors.description ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        rows={4}
                      />
                      {formErrors.description && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {formErrors.description}
                        </motion.p>
                      )}
                      <p className="text-xs text-gray-500">{formData.description.length}/2000 characters</p>
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
                      onClick={handleAddCourse}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Course"
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
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center text-gray-500 flex flex-col items-center justify-center"
            >
              <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg">No courses found. Add a course to get started.</p>
            </motion.div>
          ) : viewMode === "list" ? (
            // List View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {courses.map((course, index) => (
                      <motion.tr
                        key={course._id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tableRowVariants}
                        className="border-b transition-colors hover:bg-gray-50/50"
                      >
                        <TableCell className="font-medium">{course.courseCode}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.departmentId.name}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadgeClass(course.status || "Open")}>
                            {course.status || "Open"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="transition-colors">
                                  Status
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-white">
                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={course.status || "Open"}>
                                  <DropdownMenuRadioItem
                                    value="Open"
                                    onClick={() => handleUpdateStatus(course._id, "Open")}
                                    className="cursor-pointer transition-colors"
                                  >
                                    Open
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem
                                    value="Closed"
                                    onClick={() => handleUpdateStatus(course._id, "Closed")}
                                    className="cursor-pointer transition-colors"
                                  >
                                    Closed
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem
                                    value="Waitlisted"
                                    onClick={() => handleUpdateStatus(course._id, "Waitlisted")}
                                    className="cursor-pointer transition-colors"
                                  >
                                    Waitlisted
                                  </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              onClick={() => openEditDialog(course)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              onClick={() => openDeleteDialog(course)}
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
            // Grid View - Grouped by Department
            <div className="p-4">
              <AnimatePresence>
                {getCoursesByDepartment().map((group, groupIndex) => (
                  <motion.div
                    key={group.department._id}
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
                        onClick={() => toggleDepartmentExpansion(group.department._id)}
                      >
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg font-medium flex items-center">
                            <BookOpen className="mr-2 h-5 w-5 text-[#63144c]" />
                            {group.department.name}
                            <Badge className="ml-3 bg-[#63144c]/10 text-[#63144c] hover:bg-[#63144c]/20 border-[#63144c]/20">
                              {group.courses.length} {group.courses.length === 1 ? "course" : "courses"}
                            </Badge>
                          </CardTitle>
                          <ChevronRight
                            className={`h-5 w-5 text-[#63144c] transition-transform duration-200 ${
                              expandedDepartment === group.department._id ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </CardHeader>

                      {expandedDepartment === group.department._id && (
                        <CardContent className="p-4">
                          {group.courses.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">No courses found for this department</div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <AnimatePresence>
                                {group.courses.map((course, courseIndex) => (
                                  <motion.div
                                    key={course._id}
                                    custom={courseIndex}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={cardVariants}
                                  >
                                    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="font-medium text-lg">{course.name}</div>
                                          <Badge
                                            variant="outline"
                                            className={getStatusBadgeClass(course.status || "Open")}
                                          >
                                            {course.status || "Open"}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                            {course.courseCode}
                                          </Badge>
                                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                            {course.credits} {course.credits === 1 ? "credit" : "credits"}
                                          </Badge>
                                        </div>
                                        {course.description && (
                                          <div className="text-sm text-gray-600 mb-3">
                                            {truncateDescription(course.description)}
                                          </div>
                                        )}
                                        <div className="flex justify-end gap-2 mt-2">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="sm" className="transition-colors">
                                                Status
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="bg-white">
                                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuRadioGroup value={course.status || "Open"}>
                                                <DropdownMenuRadioItem
                                                  value="Open"
                                                  onClick={() => handleUpdateStatus(course._id, "Open")}
                                                  className="cursor-pointer transition-colors"
                                                >
                                                  Open
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem
                                                  value="Closed"
                                                  onClick={() => handleUpdateStatus(course._id, "Closed")}
                                                  className="cursor-pointer transition-colors"
                                                >
                                                  Closed
                                                </DropdownMenuRadioItem>
                                                <DropdownMenuRadioItem
                                                  value="Waitlisted"
                                                  onClick={() => handleUpdateStatus(course._id, "Waitlisted")}
                                                  className="cursor-pointer transition-colors"
                                                >
                                                  Waitlisted
                                                </DropdownMenuRadioItem>
                                              </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                            onClick={() => openEditDialog(course)}
                                          >
                                            <Pencil size={14} className="mr-1" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                            onClick={() => openDeleteDialog(course)}
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
          <div className="text-sm text-gray-500">Total: {courses.length} course(s)</div>
          <Button variant="outline" onClick={fetchCourses} className="transition-all duration-200 hover:bg-gray-100">
            Refresh
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Course Dialog */}
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
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <DialogDescription>Make changes to the course information below.</DialogDescription>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-courseCode">Course Code</Label>
                <Input
                  id="edit-courseCode"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  className={`${formErrors.courseCode ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                />
                {formErrors.courseCode && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                    {formErrors.courseCode}
                  </motion.p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-credits">Credits</Label>
                <Input
                  id="edit-credits"
                  name="credits"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.credits}
                  onChange={handleNumberChange}
                  className={`${formErrors.credits ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                />
                {formErrors.credits && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                    {formErrors.credits}
                  </motion.p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Course Name</Label>
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
              <Label htmlFor="edit-departmentId">Department</Label>
              <Select
                onValueChange={(value) => handleSelectChange("departmentId", value)}
                value={formData.departmentId}
                key={formData.departmentId}
              >
                <SelectTrigger
                  className={`${formErrors.departmentId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                >
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {departments.map((department) => (
                    <SelectItem key={department._id} value={department._id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.departmentId && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                  {formErrors.departmentId}
                </motion.p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select onValueChange={(value) => handleSelectChange("status", value)} value={formData.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`${formErrors.description ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                rows={4}
              />
              {formErrors.description && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                  {formErrors.description}
                </motion.p>
              )}
              <p className="text-xs text-gray-500">{formData.description.length}/2000 characters</p>
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
              onClick={handleUpdateCourse}
              disabled={submitting}
              className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white transition-all duration-200 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Course"
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
              This will permanently delete the course "{currentCourse?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting} className="transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
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
    </motion.div>
  )
}

export default CoursesTab

