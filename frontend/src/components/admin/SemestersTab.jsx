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
import { Pencil, Trash2, Plus, Filter, Calendar, Loader2, Search, List, Grid, ChevronRight } from 'lucide-react'
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

const SemestersTab = () => {
  const [semesters, setSemesters] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSemester, setCurrentSemester] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("list") // "list" or "grid"
  const [expandedDepartment, setExpandedDepartment] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    semesterCode: "",
    departmentId: "",
    startDate: "",
    endDate: "",
  })

  // Fetch semesters and departments on component mount
  useEffect(() => {
    fetchDepartments()
    fetchSemesters()
  }, [])

  // Fetch semesters with filter
  useEffect(() => {
    fetchSemesters()
  }, [filterDepartment, searchQuery])

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

  const fetchSemesters = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Add department filter if selected
      let url = `${apiUrl}/api/semester/`
      if (filterDepartment !== "all") {
        url = `${apiUrl}/api/semester/departmentId/${filterDepartment}`
      }

      const response = await axios.get(url, config)
      let semestersData = response.data.data.semesters

      // Apply search filter if present
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        semestersData = semestersData.filter(
          (semester) =>
            semester.name.toLowerCase().includes(query) ||
            semester.semesterCode.toLowerCase().includes(query) ||
            (semester.departmentId && semester.departmentId.name.toLowerCase().includes(query)),
        )
      }

      setSemesters(semestersData)
      setError(null)
    } catch (err) {
      setError("Failed to fetch semesters. Please try again later.")
      console.error("Error fetching semesters:", err)
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

  const validateForm = () => {
    const errors = {}
    const requiredFields = ["name", "semesterCode", "departmentId", "startDate", "endDate"]

    requiredFields.forEach((field) => {
      if (!formData[field] || (typeof formData[field] === "string" && formData[field].trim() === "")) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`
      }
    })

    // Validate dates
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.endDate = "End date must be after start date"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSemester = async () => {
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

      const response = await axios.post(`${apiUrl}/api/semester/add`, formData, config)

      if (response.data.code === 201) {
        fetchSemesters()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("Semester added successfully")
      } else {
        // Handle API success: false response
        setServerError(response.data.message || "Failed to add semester. Please try again.")
      }
    } catch (err) {
      console.error("Error adding semester:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to add semester. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSemester = async () => {
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

      const response = await axios.put(`${apiUrl}/api/semester/${currentSemester._id}`, formData, config)

      if (response.data.code === 200) {
        fetchSemesters()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("Semester updated successfully")
      } else {
        // Handle API success: false response
        setServerError(response.data.message || "Failed to update semester. Please try again.")
      }
    } catch (err) {
      console.error("Error updating semester:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to update semester. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSemester = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.delete(`${apiUrl}/api/semester/${currentSemester._id}`, config)

      if (response.data.status === 201) {
        toast.success("Semester deleted successfully")
        fetchSemesters()
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(response.data.message || "Failed to delete semester")
      }
    } catch (err) {
      console.error("Error deleting semester:", err)
      const errorMessage = err.response?.data?.message || "Failed to delete semester. Please try again."
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      semesterCode: "",
      departmentId: "",
      startDate: "",
      endDate: "",
    })
    setFormErrors({})
    setServerError(null)
  }

  const openEditDialog = (semester) => {
    setCurrentSemester(semester)
    setFormData({
      name: semester.name,
      semesterCode: semester.semesterCode,
      departmentId: semester.departmentId._id,
      startDate: semester.startDate ? semester.startDate.split("T")[0] : "",
      endDate: semester.endDate ? semester.endDate.split("T")[0] : "",
    })
    setFormErrors({})
    setServerError(null)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (semester) => {
    setCurrentSemester(semester)
    setIsDeleteDialogOpen(true)
  }

  // Format the date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (e) {
      return dateString
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    // Debounce search to avoid too many re-renders
    const timeoutId = setTimeout(() => {
      fetchSemesters()
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  // Group semesters by department for grid view
  const getSemestersByDepartment = () => {
    const grouped = {}
    
    // Initialize with all departments (even empty ones)
    departments.forEach(dept => {
      grouped[dept._id] = {
        department: dept,
        semesters: []
      }
    })
    
    // Add semesters to their departments
    semesters.forEach(semester => {
      const deptId = semester.departmentId._id
      if (grouped[deptId]) {
        grouped[deptId].semesters.push(semester)
      } else {
        // In case there's a semester with a department not in our list
        grouped[deptId] = {
          department: semester.departmentId,
          semesters: [semester]
        }
      }
    })
    
    // Convert to array and sort
    return Object.values(grouped).sort((a, b) => 
      a.department.name.localeCompare(b.department.name)
    )
  }

  const toggleDepartmentExpansion = (deptId) => {
    if (expandedDepartment === deptId) {
      setExpandedDepartment(null)
    } else {
      setExpandedDepartment(deptId)
    }
  }

  return (
    <motion.div className="p-6 mx-auto" initial="hidden" animate="visible" variants={fadeIn}>
      <Card className="max-w-[1200px] border shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#63144c] to-[#8a1a68] text-white">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Calendar className="mr-2 h-6 w-6" />
              Semester Management
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white opacity-70" />
                <Input
                  placeholder="Search semesters..."
                  className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/70 w-full"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                <TabsList className="bg-white/10 border-white/20">
                  <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-[#63144c] text-white">
                    <List className="h-4 w-4 mr-2" />
                    List
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="data-[state=active]:bg-white data-[state=active]:text-[#63144c] text-white">
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
                  <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
                    <span className="hidden md:block">Add Semester</span>
                    <span className="md:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-white">
                  <DialogHeader className="text-[#63144c]">
                    <DialogTitle className="font-extrabold text-2xl">Add New Semester</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>Fill in the details to create a new semester.</DialogDescription>
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
                      <Label htmlFor="name">Semester Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter semester name"
                        className={`${formErrors.name ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                      />
                      {formErrors.name && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {formErrors.name}
                        </motion.p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="semesterCode">Semester Code</Label>
                      <Input
                        id="semesterCode"
                        name="semesterCode"
                        value={formData.semesterCode}
                        onChange={handleInputChange}
                        placeholder="E.g., SEM1, FALL2024"
                        className={`${formErrors.semesterCode ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                      />
                      {formErrors.semesterCode && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                          {formErrors.semesterCode}
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className={`${formErrors.startDate ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        />
                        {formErrors.startDate && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                            {formErrors.startDate}
                          </motion.p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          name="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className={`${formErrors.endDate ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                        />
                        {formErrors.endDate && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                            {formErrors.endDate}
                          </motion.p>
                        )}
                      </div>
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
                      onClick={handleAddSemester}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Semester"
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
          ) : semesters.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center text-gray-500 flex flex-col items-center justify-center"
            >
              <Calendar className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg">No semesters found. Add a semester to get started.</p>
            </motion.div>
          ) : viewMode === "list" ? (
            // List View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {semesters.map((semester, index) => (
                      <motion.tr
                        key={semester._id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={tableRowVariants}
                        className="border-b transition-colors hover:bg-gray-50/50"
                      >
                        <TableCell className="font-medium">{semester.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#63144c]/10 text-[#63144c] border-[#63144c]/20">
                            {semester.semesterCode}
                          </Badge>
                        </TableCell>
                        <TableCell>{semester.departmentId.name}</TableCell>
                        <TableCell>{formatDate(semester.startDate)}</TableCell>
                        <TableCell>{formatDate(semester.endDate)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                              onClick={() => openEditDialog(semester)}
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              onClick={() => openDeleteDialog(semester)}
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
                {getSemestersByDepartment().map((group, groupIndex) => (
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
                            <Calendar className="mr-2 h-5 w-5 text-[#63144c]" />
                            {group.department.name}
                            <Badge className="ml-3 bg-[#63144c]/10 text-[#63144c] hover:bg-[#63144c]/20 border-[#63144c]/20">
                              {group.semesters.length} {group.semesters.length === 1 ? 'semester' : 'semesters'}
                            </Badge>
                          </CardTitle>
                          <ChevronRight 
                            className={`h-5 w-5 text-[#63144c] transition-transform duration-200 ${
                              expandedDepartment === group.department._id ? 'rotate-90' : ''
                            }`} 
                          />
                        </div>
                      </CardHeader>
                      
                      {expandedDepartment === group.department._id && (
                        <CardContent className="p-4">
                          {group.semesters.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                              No semesters found for this department
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <AnimatePresence>
                                {group.semesters.map((semester, semIndex) => (
                                  <motion.div
                                    key={semester._id}
                                    custom={semIndex}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={cardVariants}
                                  >
                                    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="font-medium text-lg">{semester.name}</div>
                                          <Badge variant="outline" className="bg-[#63144c]/10 text-[#63144c] border-[#63144c]/20">
                                            {semester.semesterCode}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-3">
                                          <div className="flex items-center gap-1 mb-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>Start: {formatDate(semester.startDate)}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>End: {formatDate(semester.endDate)}</span>
                                          </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                            onClick={() => openEditDialog(semester)}
                                          >
                                            <Pencil size={14} className="mr-1" />
                                            Edit
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                            onClick={() => openDeleteDialog(semester)}
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
          <div className="text-sm text-gray-500">Total: {semesters.length} semester(s)</div>
          <Button variant="outline" onClick={fetchSemesters} className="transition-all duration-200 hover:bg-gray-100">
            Refresh
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Semester Dialog */}
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
            <DialogTitle>Edit Semester</DialogTitle>
          </DialogHeader>
          <DialogDescription>Make changes to the semester information below.</DialogDescription>
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
              <Label htmlFor="edit-name">Semester Name</Label>
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
              <Label htmlFor="edit-semesterCode">Semester Code</Label>
              <Input
                id="edit-semesterCode"
                name="semesterCode"
                value={formData.semesterCode}
                onChange={handleInputChange}
                className={`${formErrors.semesterCode ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
              />
              {formErrors.semesterCode && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                  {formErrors.semesterCode}
                </motion.p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`${formErrors.startDate ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                />
                {formErrors.startDate && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                    {formErrors.startDate}
                  </motion.p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`${formErrors.endDate ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                />
                {formErrors.endDate && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                    {formErrors.endDate}
                  </motion.p>
                )}
              </div>
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
              onClick={handleUpdateSemester}
              disabled={submitting}
              className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white transition-all duration-200 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Semester"
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
              This will permanently delete the semester "{currentSemester?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting} className="transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSemester}
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

export default SemestersTab
