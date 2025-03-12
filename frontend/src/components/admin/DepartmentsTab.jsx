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
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Building, Loader2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

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

const DepartmentsTab = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    departmentCode: "",
    dateEstablished: "",
  })

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments()
  }, [searchQuery])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Replace with your actual API endpoint
      const response = await axios.get(`${apiUrl}/api/department/`, config)
      let departmentsData = response.data.data.departments

      // Apply search filter if present
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        departmentsData = departmentsData.filter(
          (department) =>
            department.name.toLowerCase().includes(query) ||
            department.departmentCode.toLowerCase().includes(query) ||
            department.location.toLowerCase().includes(query),
        )
      }

      setDepartments(departmentsData)
      setError(null)
    } catch (err) {
      setError("Failed to fetch departments. Please try again later.")
      console.error("Error fetching departments:", err)
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

  const validateForm = () => {
    const errors = {}
    const requiredFields = ["name", "description", "location", "departmentCode", "dateEstablished"]

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddDepartment = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
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
      // Replace with your actual API endpoint
      const response = await axios.post(`${apiUrl}/api/department/add`, formData, config)

      if (response.data.status === 201) {
        fetchDepartments()
        setIsAddDialogOpen(false)
        resetForm()
        toast.success("Department added successfully")
      } else {
        // Handle API success: false response
        setServerError(response.data.message || "Failed to add department. Please try again.")
      }
    } catch (err) {
      console.error("Error adding department:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to add department. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateDepartment = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields")
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

      // Replace with your actual API endpoint
      const response = await axios.put(`${apiUrl}/api/department/${currentDepartment._id}`, formData, config)

      if (response.data.code === 200) {
        fetchDepartments()
        setIsEditDialogOpen(false)
        resetForm()
        toast.success("Department updated successfully")
      } else {
        // Handle API success: false response
        setServerError(response.data.message || "Failed to update department. Please try again.")
      }
    } catch (err) {
      console.error("Error updating department:", err)
      const errorMessage =
        err.response?.data?.message || "Failed to update department. Please check your connection and try again."
      setServerError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDepartment = async () => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token")

      // Set up Axios headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Replace with your actual API endpoint
      const response = await axios.delete(`${apiUrl}/api/department/${currentDepartment._id}`, config)

      if (response.data.status === 201) {
        toast.success("Department deleted successfully")
        fetchDepartments()
        setIsDeleteDialogOpen(false)
      } else {
        toast.error(response.data.message || "Failed to delete department")
      }
    } catch (err) {
      console.error("Error deleting department:", err)
      const errorMessage = err.response?.data?.message || "Failed to delete department. Please try again."
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      departmentCode: "",
      dateEstablished: "",
    })
    setFormErrors({})
    setServerError(null)
  }

  const openEditDialog = (department) => {
    setCurrentDepartment(department)
    setFormData({
      name: department.name,
      description: department.description,
      location: department.location,
      departmentCode: department.departmentCode,
      dateEstablished: department.dateEstablished ? department.dateEstablished.split("T")[0] : "",
    })
    setFormErrors({})
    setServerError(null)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (department) => {
    setCurrentDepartment(department)
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
      fetchDepartments()
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  return (
    <motion.div 
            className="p-6 mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
        >
            <Card className="max-w-[1200px] border shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#63144c] to-[#8a1a68] text-white">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <Building className="mr-2 h-6 w-6" />
                            Department Management
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white opacity-70" />
                                <Input
                                    placeholder="Search departments..."
                                    className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/70 w-full"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
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
                                        <span className="hidden md:block">Add Department</span>
                                        <span className="md:hidden">Add</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg bg-white">
                                    <DialogHeader className="text-[#63144c]">
                                        <DialogTitle className="font-extrabold text-2xl">Add New Department</DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>Fill in the details to create a new department.</DialogDescription>
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
                                            <Label htmlFor="name">Department Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter department name"
                                                className={`${formErrors.name ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                            />
                                            {formErrors.name && (
                                                <motion.p 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-sm text-red-500"
                                                >
                                                    {formErrors.name}
                                                </motion.p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Enter department description"
                                                rows={3}
                                                className={`${formErrors.description ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                            />
                                            {formErrors.description && (
                                                <motion.p 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-sm text-red-500"
                                                >
                                                    {formErrors.description}
                                                </motion.p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="location">Location</Label>
                                                <Input
                                                    id="location"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    placeholder="Building & Floor"
                                                    className={`${formErrors.location ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                />
                                                {formErrors.location && (
                                                    <motion.p 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-sm text-red-500"
                                                    >
                                                        {formErrors.location}
                                                    </motion.p>
                                                )}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="departmentCode">Department Code</Label>
                                                <Input
                                                    id="departmentCode"
                                                    name="departmentCode"
                                                    value={formData.departmentCode}
                                                    onChange={handleInputChange}
                                                    placeholder="E.g., EEE, CSE"
                                                    className={`${formErrors.departmentCode ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                />
                                                {formErrors.departmentCode && (
                                                    <motion.p 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-sm text-red-500"
                                                    >
                                                        {formErrors.departmentCode}
                                                    </motion.p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="dateEstablished">Date Established</Label>
                                            <Input
                                                id="dateEstablished"
                                                name="dateEstablished"
                                                type="date"
                                                value={formData.dateEstablished}
                                                onChange={handleInputChange}
                                                className={`${formErrors.dateEstablished ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                            />
                                            {formErrors.dateEstablished && (
                                                <motion.p 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-sm text-red-500"
                                                >
                                                    {formErrors.dateEstablished}
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
                                            onClick={handleAddDepartment} 
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Adding...
                                                </>
                                            ) : (
                                                "Add Department"
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
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6 text-center text-red-500"
                        >
                            {error}
                        </motion.div>
                    ) : departments.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-12 text-center text-gray-500 flex flex-col items-center justify-center"
                        >
                            <Building className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg">No departments found. Add a department to get started.</p>
                        </motion.div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Established</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {departments.map((department, index) => (
                                            <motion.tr
                                                key={department._id || department.id}
                                                custom={index}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={tableRowVariants}
                                                className="border-b transition-colors hover:bg-gray-50/50"
                                            >
                                                <TableCell className="font-medium">
                                                    <div>{department.name}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-2">{department.description}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-[#63144c]/10 text-[#63144c] border-[#63144c]/20">
                                                        {department.departmentCode}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{department.location}</TableCell>
                                                <TableCell>{formatDate(department.dateEstablished)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                                            onClick={() => openEditDialog(department)}
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                            onClick={() => openDeleteDialog(department)}
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
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4 bg-gray-50/50">
                    <div className="text-sm text-gray-500">Total: {departments.length} department(s)</div>
                    <Button 
                        variant="outline" 
                        onClick={fetchDepartments}
                        className="transition-all duration-200 hover:bg-gray-100"
                    >
                        Refresh
                    </Button>
                </CardFooter>
            </Card>

            {/* Edit Department Dialog */}
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
                        <DialogTitle>Edit Department</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Make changes to the department information below.</DialogDescription>
                    {serverError && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" 
                            role="alert"
                        >
                            <span className="block sm:inline">{serverError}</span>
                        </motion.div>
                    )}
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Department Name</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`${formErrors.name ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                            />
                            {formErrors.name && (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-red-500"
                                >
                                    {formErrors.name}
                                </motion.p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className={`${formErrors.description ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                            />
                            {formErrors.description && (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-red-500"
                                >
                                    {formErrors.description}
                                </motion.p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-location">Location</Label>
                                <Input
                                    id="edit-location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={`${formErrors.location ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                />
                                {formErrors.location && (
                                    <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-red-500"
                                    >
                                        {formErrors.location}
                                    </motion.p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-departmentCode">Department Code</Label>
                                <Input
                                    id="edit-departmentCode"
                                    name="departmentCode"
                                    value={formData.departmentCode}
                                    onChange={handleInputChange}
                                    className={`${formErrors.departmentCode ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                />
                                {formErrors.departmentCode && (
                                    <motion.p 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-red-500"
                                    >
                                        {formErrors.departmentCode}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-dateEstablished">Date Established</Label>
                            <Input
                                id="edit-dateEstablished"
                                name="dateEstablished"
                                type="date"
                                value={formData.dateEstablished}
                                onChange={handleInputChange}
                                className={`${formErrors.dateEstablished ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                            />
                            {formErrors.dateEstablished && (
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-red-500"
                                >
                                    {formErrors.dateEstablished}
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
                            onClick={handleUpdateDepartment} 
                            disabled={submitting} 
                            className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white transition-all duration-200 shadow-md"                          
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Department"
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
                <AlertDialogContent className='bg-white'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the department "{currentDepartment?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting} className="transition-all duration-200">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {handleDeleteDepartment(); fetchDepartments();}}
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

export default DepartmentsTab

