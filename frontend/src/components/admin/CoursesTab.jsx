"use client"

import { useState, useEffect } from "react"
import axios from "axios"
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
import { Pencil, Trash2, Plus, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const apiUrl = import.meta.env.VITE_API_URL

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
  }, [filterDepartment, filterStatus])

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

      // Determine which API endpoint to use based on filters
      let url = `${apiUrl}/api/course/`

      // If both department and status filters are active
      if (filterDepartment !== "all" && filterStatus !== "all") {
        // This is a simplified approach - your actual API might need a different structure
        url = `${apiUrl}/api/course/?departmentId=${filterDepartment}&status=${filterStatus}`
      }
      // If only department filter is active
      else if (filterDepartment !== "all") {
        url = `${apiUrl}/api/course/?departmentId=${filterDepartment}`
      }
      // If only status filter is active
      else if (filterStatus !== "all") {
        if (filterStatus === "Open") {
          url = `${apiUrl}/api/course/open`
        } else if (filterStatus === "Closed") {
          url = `${apiUrl}/api/course/closed`
        } else if (filterStatus === "Waitlisted") {
          url = `${apiUrl}/api/course/waitlisted`
        }
      }

      const response = await axios.get(url, config)

      // Assuming the API returns data in a consistent format
      setCourses(response.data.data)
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
      console.log(courseId);
      
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

  return (
    <div className="p-6 mx-auto">
      <Card className="max-w-[1200px] border-none">
        <CardHeader className="bg-[#63144c] text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Course Management</CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-[#63144c] hover:bg-gray-100 hover:text-black">
                    <Filter size={16} className="md:mr-2" />
                    <span className="hidden md:block">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white">
                  <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={filterDepartment} onValueChange={setFilterDepartment}>
                    <DropdownMenuRadioItem value="all">All Departments</DropdownMenuRadioItem>
                    {departments.map((department) => (
                      <DropdownMenuRadioItem key={department._id} value={department._id}>
                        {department.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={filterStatus} onValueChange={setFilterStatus}>
                    <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Open">Open</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Closed">Closed</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Waitlisted">Waitlisted</DropdownMenuRadioItem>
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
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    <span className="hidden md:block">Add Course</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-white">
                  <DialogHeader className="text-[#63144c]">
                    <DialogTitle className="font-extrabold text-2xl">Add New Course</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>Fill in the details to create a new course.</DialogDescription>
                  {serverError && (
                    <div
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                      role="alert"
                    >
                      <span className="block sm:inline">{serverError}</span>
                    </div>
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
                          className={formErrors.courseCode ? "border-red-500" : ""}
                        />
                        {formErrors.courseCode && <p className="text-sm text-red-500">{formErrors.courseCode}</p>}
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
                          className={formErrors.credits ? "border-red-500" : ""}
                        />
                        {formErrors.credits && <p className="text-sm text-red-500">{formErrors.credits}</p>}
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
                        className={formErrors.name ? "border-red-500" : ""}
                      />
                      {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="departmentId">Department</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("departmentId", value)}
                        value={formData.departmentId}
                        key={formData.departmentId}
                      >
                        <SelectTrigger className={formErrors.departmentId ? "border-red-500" : ""}>
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
                      {formErrors.departmentId && <p className="text-sm text-red-500">{formErrors.departmentId}</p>}
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
                        className={formErrors.description ? "border-red-500" : ""}
                        rows={4}
                      />
                      {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
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
                      className="mt-3"
                    >
                      Cancel
                    </Button>

                    <Button
                      className="bg-[#63144c] text-white mt-3 hover:bg-[#5f0a47] hover:text-white"
                      onClick={handleAddCourse}
                      disabled={submitting}
                    >
                      {submitting ? "Adding..." : "Add Course"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : courses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No courses found. Add a course to get started.</div>
          ) : (
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
                  {courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">{course.courseCode}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.departmentId.name}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                            course.status === "Open"
                              ? "bg-green-100 text-green-800"
                              : course.status === "Closed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {course.status || "Open"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
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
                                >
                                  Open
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="Closed"
                                  onClick={() => handleUpdateStatus(course._id, "Closed")}
                                >
                                  Closed
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem
                                  value="Waitlisted"
                                  onClick={() => handleUpdateStatus(course._id, "Waitlisted")}
                                >
                                  Waitlisted
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(course)}>
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(course)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-gray-500">Total: {courses.length} course(s)</div>
          <Button variant="outline" onClick={fetchCourses}>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{serverError}</span>
            </div>
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
                  className={formErrors.courseCode ? "border-red-500" : ""}
                />
                {formErrors.courseCode && <p className="text-sm text-red-500">{formErrors.courseCode}</p>}
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
                  className={formErrors.credits ? "border-red-500" : ""}
                />
                {formErrors.credits && <p className="text-sm text-red-500">{formErrors.credits}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Course Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-departmentId">Department</Label>
              <Select
                onValueChange={(value) => handleSelectChange("departmentId", value)}
                value={formData.departmentId}
                key={formData.departmentId}
              >
                <SelectTrigger className={formErrors.departmentId ? "border-red-500" : ""}>
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
              {formErrors.departmentId && <p className="text-sm text-red-500">{formErrors.departmentId}</p>}
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
                className={formErrors.description ? "border-red-500" : ""}
                rows={4}
              />
              {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
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
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCourse}
              disabled={submitting}
              className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white"
            >
              {submitting ? "Updating..." : "Update Course"}
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
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CoursesTab

