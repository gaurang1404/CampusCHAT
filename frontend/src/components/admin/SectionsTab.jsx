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
  const [formData, setFormData] = useState({
    name: "",
    semesterId: "",
  })

  // Fetch sections and semesters on component mount
  useEffect(() => {
    fetchSemesters()
    fetchSections()
  }, [])

  // Fetch sections with filter
  useEffect(() => {
    fetchSections()
  }, [filterSemester])

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

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

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Use the base URL for all sections
      const url = `${apiUrl}/api/section/`

      // In a real implementation, you might want to add filtering by semester
      // This would require a backend endpoint that supports filtering

      const response = await axios.get(url, config)

      // If filtering by semester is needed, we can filter the results client-side
      let filteredSections = response.data.data.sections
      if (filterSemester !== "all") {
        filteredSections = filteredSections.filter(
          (section) => section.semesterId && section.semesterId._id === filterSemester,
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

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.post(`${apiUrl}/api/section/add`, formData, config)

      if (response.data.code === 201) {
        fetchSections()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("Section added successfully")
      } else {
        // Handle API success: false response
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

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.put(`${apiUrl}/api/section/${currentSection._id}`, formData, config)

      if (response.data.code === 200) {
        fetchSections()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("Section updated successfully")
      } else {
        // Handle API success: false response
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

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

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

  const resetForm = () => {
    setFormData({
      name: "",
      semesterId: "",
    })
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

  // Get semester name by ID
  const getSemesterName = (semesterId) => {
    const semester = semesters.find((sem) => sem._id === semesterId)
    return semester ? semester.name : "Unknown Semester"
  }

  return (
    <div className="p-6 mx-auto">
      <Card className="max-w-[1200px] border-none">
        <CardHeader className="bg-[#63144c] text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Section Management</CardTitle>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-[#63144c] hover:bg-gray-100 hover:text-black">
                    <Filter size={16} className="md:mr-2" />
                    <span className="hidden md:block ">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white">
                  <DropdownMenuLabel>Filter by Semester</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={filterSemester} onValueChange={setFilterSemester}>
                    <DropdownMenuRadioItem value="all">All Semesters</DropdownMenuRadioItem>
                    {semesters.map((semester) => (
                      <DropdownMenuRadioItem key={semester._id} value={semester._id}>
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
                  <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    <span className="hidden md:block">Add Section</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg bg-white">
                  <DialogHeader className="text-[#63144c]">
                    <DialogTitle className="font-extrabold text-2xl">Add New Section</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>Fill in the details to create a new section.</DialogDescription>
                  {serverError && (
                    <div
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                      role="alert"
                    >
                      <span className="block sm:inline">{serverError}</span>
                    </div>
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
                        className={formErrors.name ? "border-red-500" : ""}
                      />
                      {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="semesterId">Semester</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("semesterId", value)}
                        value={formData.semesterId}
                        key={formData.semesterId}
                      >
                        <SelectTrigger className={formErrors.semesterId ? "border-red-500" : ""}>
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
                      {formErrors.semesterId && <p className="text-sm text-red-500">{formErrors.semesterId}</p>}
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
                      onClick={handleAddSection}
                      disabled={submitting}
                    >
                      {submitting ? "Adding..." : "Add Section"}
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
          ) : sections.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No sections found. Add a section to get started.</div>
          ) : (
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
                  {sections.map((section) => (
                    <TableRow key={section._id}>
                      <TableCell className="font-medium">{section.name}</TableCell>
                      <TableCell>{section.semesterId ? section.semesterId.name : "N/A"}</TableCell>
                      <TableCell>{section.students ? section.students.length : 0}</TableCell>
                      <TableCell>{section.courseFacultyMappings ? section.courseFacultyMappings.length : 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => openEditDialog(section)}>
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(section)}
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
          <div className="text-sm text-gray-500">Total: {sections.length} section(s)</div>
          <Button variant="outline" onClick={fetchSections}>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{serverError}</span>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Section Name</Label>
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
              <Label htmlFor="edit-semesterId">Semester</Label>
              <Select
                onValueChange={(value) => handleSelectChange("semesterId", value)}
                value={formData.semesterId}
                key={formData.semesterId}
              >
                <SelectTrigger className={formErrors.semesterId ? "border-red-500" : ""}>
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
              {formErrors.semesterId && <p className="text-sm text-red-500">{formErrors.semesterId}</p>}
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
              onClick={handleUpdateSection}
              disabled={submitting}
              className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white"
            >
              {submitting ? "Updating..." : "Update Section"}
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
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
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

export default SectionsTab

