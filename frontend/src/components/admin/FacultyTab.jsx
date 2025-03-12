"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, Filter, Eye, Search, Users, Loader2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const FacultyTab = () => {
    const [faculties, setFaculties] = useState([])
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [currentFaculty, setCurrentFaculty] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [filterDepartment, setFilterDepartment] = useState("all")
    const [filterDesignation, setFilterDesignation] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        facultyId: "",
        departmentId: "",
        designation: "",
        joiningDate: "",
    })

    const designations = [
        "Professor",
        "Associate Professor",
        "Assistant Professor",
        "Lecturer"
    ]

    // Fetch data on component mount
    useEffect(() => {
        fetchDepartments()
        fetchFaculties()
    }, [])

    // Fetch faculties with filters
    useEffect(() => {
        fetchFaculties()
    }, [filterDepartment, filterDesignation, searchQuery])

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.get(`${apiUrl}/api/department/`, config)
            setDepartments(response.data.data.departments)
        } catch (err) {
            console.error("Error fetching departments:", err)
            toast.error("Failed to load departments")
        }
    }

    const fetchFaculties = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }
            
            const response = await axios.get(`${apiUrl}/api/faculty/`, config)
            
            // Apply filters client-side
            let filteredFaculties = response.data.data.faculties
            
            if (filterDepartment !== "all") {
                filteredFaculties = filteredFaculties.filter(faculty => 
                    faculty.departmentId && faculty.departmentId._id === filterDepartment
                )
            }
            
            if (filterDesignation !== "all") {
                filteredFaculties = filteredFaculties.filter(faculty => 
                    faculty.designation === filterDesignation
                )
            }
            
            // Apply search query if present
            if (searchQuery.trim() !== "") {
                const query = searchQuery.toLowerCase()
                filteredFaculties = filteredFaculties.filter(faculty => 
                    faculty.firstName.toLowerCase().includes(query) ||
                    faculty.lastName.toLowerCase().includes(query) ||
                    faculty.email.toLowerCase().includes(query) ||
                    faculty.facultyId.toLowerCase().includes(query) ||
                    (faculty.phone && faculty.phone.includes(query))
                )
            }
            
            setFaculties(filteredFaculties)
            setError(null)
        } catch (err) {
            setError("Failed to fetch faculties. Please try again later.")
            console.error("Error fetching faculties:", err)
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
        
        // If changing department, update email domain
        if (name === "departmentId" && value) {
            const department = departments.find(dept => dept._id === value)
            if (department && department.institutionDomain) {
                // Update email if first name exists
                if (formData.firstName) {
                    const emailPrefix = formData.firstName.toLowerCase().replace(/\s+/g, "")
                    setFormData(prev => ({
                        ...prev,
                        email: `${emailPrefix}@${department.institutionDomain}`
                    }))
                }
            }
        }
    }

    const validateForm = () => {
        const errors = {}
        const requiredFields = [
            "firstName", "lastName", "email", "phone", 
            "facultyId", "departmentId", "designation", "joiningDate"
        ]
        
        // Add password to required fields only when adding a new faculty
        if (!currentFaculty) {
            requiredFields.push("password")
        }

        requiredFields.forEach((field) => {
            if (!formData[field] || (typeof formData[field] === "string" && formData[field].trim() === "")) {
                errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`
            }
        })

        // Email validation
        if (formData.email && !formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            errors.email = "Please enter a valid email address"
        }

        // Phone validation
        if (formData.phone && formData.phone.length !== 10) {
            errors.phone = "Phone number must be 10 digits"
        }

        // Password validation (only for new faculty)
        if (!currentFaculty && formData.password && formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters long"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleAddFaculty = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly")
            return
        }

        setSubmitting(true)
        setServerError(null)

        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }
            
            // Get institution domain from the selected department
            const department = departments.find(dept => dept._id === formData.departmentId)
            const institutionDomain = department ? department.institutionDomain : ""
            
            const facultyData = {
                ...formData,
                institutionDomain
            }
            
            const response = await axios.post(`${apiUrl}/api/faculty/add`, facultyData, config)

            if (response.data.code === 201) {
                fetchFaculties()
                setIsAddDialogOpen(false)
                resetForm()
                toast.success("Faculty added successfully")
            } else {
                setServerError(response.data.message || "Failed to add faculty. Please try again.")
            }
        } catch (err) {
            console.error("Error adding faculty:", err)
            const errorMessage = err.response?.data?.message || 
                "Failed to add faculty. Please check your connection and try again."
            setServerError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateFaculty = async () => {
        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly")
            return
        }

        setSubmitting(true)
        setServerError(null)

        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }

            // Remove password if it's empty (to avoid overwriting with empty password)
            const updateData = { ...formData }
            if (!updateData.password) {
                delete updateData.password
            }
            
            const response = await axios.put(
                `${apiUrl}/api/faculty/${currentFaculty._id}`, 
                updateData, 
                config
            )
                      
            if (response.data.code === 200) {                              
                fetchFaculties()
                setIsEditDialogOpen(false)
                resetForm()
                toast.success("Faculty updated successfully")
            } else {
                setServerError(response.data.message || "Failed to update faculty. Please try again.")
            }
        } catch (err) {
            console.log(err);
            
            console.error("Error updating faculty:", err)
            const errorMessage = err.response?.data?.message || 
                "Failed to update faculty. Please check your connection and try again."
            setServerError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteFaculty = async () => {
        setSubmitting(true)
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }

            const response = await axios.delete(`${apiUrl}/api/faculty/${currentFaculty._id}`, config)

            if (response.data.code === 200) {
                toast.success("Faculty deleted successfully")
                fetchFaculties()
                setIsDeleteDialogOpen(false)
            } else {
                toast.error(response.data.message || "Failed to delete faculty")
            }
        } catch (err) {
            console.error("Error deleting faculty:", err)
            const errorMessage = err.response?.data?.message || "Failed to delete faculty. Please try again."
            toast.error(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            facultyId: "",
            departmentId: "",
            designation: "",
            joiningDate: "",
        })
        setFormErrors({})
        setServerError(null)
    }

    const openEditDialog = (faculty) => {
        setCurrentFaculty(faculty)
        setFormData({
            firstName: faculty.firstName,
            lastName: faculty.lastName,
            email: faculty.email,
            password: "", // Don't populate password for security
            phone: faculty.phone,
            facultyId: faculty.facultyId,
            departmentId: faculty.departmentId._id,
            designation: faculty.designation,
            joiningDate: faculty.joiningDate ? faculty.joiningDate.split("T")[0] : "",
        })
        setFormErrors({})
        setServerError(null)
        setIsEditDialogOpen(true)        
    }

    const openDeleteDialog = (faculty) => {
        setCurrentFaculty(faculty)
        setIsDeleteDialogOpen(true)
    }
    
    const openViewDialog = (faculty) => {
        setCurrentFaculty(faculty)
        setIsViewDialogOpen(true)
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        // Debounce search to avoid too many re-renders
        const timeoutId = setTimeout(() => {
            fetchFaculties()
        }, 300)
        return () => clearTimeout(timeoutId)
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString()
        } catch (e) {
            return dateString
        }
    }

    return (
        <motion.div className="p-6 mx-auto" initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="max-w-[1200px] border shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#63144c] to-[#8a1a68] text-white">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <CardTitle className="text-2xl font-bold flex items-center">
                            <Users className="mr-2 h-6 w-6" />
                            Faculty Management
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white opacity-70" />
                                <Input
                                    placeholder="Search faculty..."
                                    className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/70 w-full"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white text-[#63144c] hover:bg-gray-100 hover:text-[#63144c] transition-colors duration-300 shadow-md">
                                        <Filter size={16} className="md:mr-2" />
                                        <span className="hidden md:block">Filter</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-white shadow-lg border-none">
                                    <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">Department</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={filterDepartment} onValueChange={setFilterDepartment}>
                                        <DropdownMenuRadioItem value="all" className="cursor-pointer transition-colors">
                                            All Departments
                                        </DropdownMenuRadioItem>
                                        {departments.map((department) => (
                                            <DropdownMenuRadioItem key={department._id} value={department._id} className="cursor-pointer transition-colors">
                                                {department.name}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Designation</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={filterDesignation} onValueChange={setFilterDesignation}>
                                        <DropdownMenuRadioItem value="all" className="cursor-pointer transition-colors">
                                            All Designations
                                        </DropdownMenuRadioItem>
                                        {designations.map((designation) => (
                                            <DropdownMenuRadioItem key={designation} value={designation} className="cursor-pointer transition-colors">
                                                {designation}
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
                                        <span className="hidden md:block">Add Faculty</span>
                                        <span className="md:hidden">Add</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg bg-white">
                                    <DialogHeader className="text-[#63144c]">
                                        <DialogTitle className="font-extrabold text-2xl">Add New Faculty</DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>Fill in the faculty details below.</DialogDescription>
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
                                    
                                    <Tabs defaultValue="basic" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                            <TabsTrigger value="professional">Professional Info</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="basic" className="mt-4">
                                            <div className="grid gap-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="firstName">First Name</Label>
                                                        <Input
                                                            id="firstName"
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="Enter first name"
                                                            className={`${formErrors.firstName ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                        />
                                                        {formErrors.firstName && (
                                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                                {formErrors.firstName}
                                                            </motion.p>
                                                        )}
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="lastName">Last Name</Label>
                                                        <Input
                                                            id="lastName"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="Enter last name"
                                                            className={`${formErrors.lastName ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                        />
                                                        {formErrors.lastName && (
                                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                                {formErrors.lastName}
                                                            </motion.p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="facultyId">Faculty ID</Label>
                                                    <Input
                                                        id="facultyId"
                                                        name="facultyId"
                                                        value={formData.facultyId}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Enter faculty ID"
                                                        className={`${formErrors.facultyId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                    />
                                                    {formErrors.facultyId && (
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                            {formErrors.facultyId}
                                                        </motion.p>
                                                    )}
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Enter email"
                                                        className={`${formErrors.email ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                    />
                                                    {formErrors.email && (
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                            {formErrors.email}
                                                        </motion.p>
                                                    )}
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="phone">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Enter 10-digit phone number"
                                                        className={`${formErrors.phone ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                    />
                                                    {formErrors.phone && (
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                            {formErrors.phone}
                                                        </motion.p>
                                                    )}
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Enter password (min. 8 characters)"
                                                        className={`${formErrors.password ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                    />
                                                    {formErrors.password && (
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                            {formErrors.password}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="professional" className="mt-4">
                                            <div className="grid gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="departmentId">Department</Label>
                                                    <Select 
                                                        onValueChange={(value) => handleSelectChange("departmentId", value)}
                                                        value={formData.departmentId}
                                                        key={`dept-${formData.departmentId}`}
                                                    >
                                                        <SelectTrigger className={`${formErrors.departmentId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}>
                                                            <SelectValue placeholder="Select a department" />
                                                        </SelectTrigger>
                                                        <SelectContent className='bg-white'>
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
                                                    <Label htmlFor="designation">Designation</Label>
                                                    <Select 
                                                        onValueChange={(value) => handleSelectChange("designation", value)}
                                                        value={formData.designation}
                                                        key={`desig-${formData.designation}`}
                                                    >
                                                        <SelectTrigger className={`${formErrors.designation ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}>
                                                            <SelectValue placeholder="Select a designation" />
                                                        </SelectTrigger>
                                                        <SelectContent className='bg-white'>
                                                            {designations.map((designation) => (
                                                                <SelectItem key={designation} value={designation}>
                                                                    {designation}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {formErrors.designation && (
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                            {formErrors.designation}
                                                        </motion.p>
                                                    )}
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="joiningDate">Joining Date</Label>
                                                    <Input
                                                        id="joiningDate"
                                                        name="joiningDate"
                                                        type="date"
                                                        value={formData.joiningDate}
                                                        onChange={handleInputChange}
                                                        required
                                                        className={`${formErrors.joiningDate ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                                    />
                                                    {formErrors.joiningDate && (
                                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                            {formErrors.joiningDate}
                                                        </motion.p>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                    
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
                                            onClick={handleAddFaculty} 
                                            disabled={submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Adding...
                                                </>
                                            ) : (
                                                "Add Faculty"
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
                    ) : faculties.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-12 text-center text-gray-500 flex flex-col items-center justify-center"
                        >
                            <Users className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg">No faculty members found. Add a faculty member to get started.</p>
                        </motion.div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Faculty ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {faculties.map((faculty, index) => (
                                            <motion.tr
                                                key={faculty._id}
                                                custom={index}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                variants={tableRowVariants}
                                                className="border-b transition-colors hover:bg-gray-50/50"
                                            >
                                                <TableCell className="font-medium">{faculty.facultyId}</TableCell>
                                                <TableCell>{`${faculty.firstName} ${faculty.lastName}`}</TableCell>
                                                <TableCell>{faculty.email}</TableCell>
                                                <TableCell>{faculty.departmentId ? faculty.departmentId.name : "N/A"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-[#63144c]/10 text-[#63144c] border-[#63144c]/20">
                                                        {faculty.designation}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                                            onClick={() => openViewDialog(faculty)}
                                                        >
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                                            onClick={() => openEditDialog(faculty)}
                                                        >
                                                            <Pencil size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                            onClick={() => openDeleteDialog(faculty)}
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
                    <div className="text-sm text-gray-500">Total: {faculties.length} faculty member(s)</div>
                    <Button variant="outline" onClick={fetchFaculties} className="transition-all duration-200 hover:bg-gray-100">
                        Refresh
                    </Button>
                </CardFooter>
            </Card>

            {/* View Faculty Dialog */}
            <Dialog
                open={isViewDialogOpen}
                onOpenChange={(open) => setIsViewDialogOpen(open)}
            >
                <DialogContent className="sm:max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle>Faculty Details</DialogTitle>
                    </DialogHeader>
                    {currentFaculty && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid gap-4 py-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Faculty ID</h3>
                                    <p className="mt-1">{currentFaculty.facultyId}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                                    <p className="mt-1">{`${currentFaculty.firstName} ${currentFaculty.lastName}`}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="mt-1">{currentFaculty.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                                    <p className="mt-1">{currentFaculty.phone}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                                    <p className="mt-1">{currentFaculty.departmentId ? currentFaculty.departmentId.name : "N/A"}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Designation</h3>
                                    <p className="mt-1">{currentFaculty.designation}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Joining Date</h3>
                                    <p className="mt-1">{formatDate(currentFaculty.joiningDate)}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Assigned Sections</h3>
                                <p className="mt-1">
                                    {currentFaculty.sections && currentFaculty.sections.length > 0 
                                        ? currentFaculty.sections.length 
                                        : "No sections assigned"}
                                </p>
                            </div>
                        </motion.div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewDialogOpen(false)} className="transition-all duration-200">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Faculty Dialog */}
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
                        <DialogTitle>Edit Faculty</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Make changes to the faculty information below.</DialogDescription>
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
                    
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="professional">Professional Info</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="basic" className="mt-4">
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-firstName">First Name</Label>
                                        <Input
                                            id="edit-firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`${formErrors.firstName ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                        />
                                        {formErrors.firstName && (
                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                {formErrors.firstName}
                                            </motion.p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-lastName">Last Name</Label>
                                        <Input
                                            id="edit-lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`${formErrors.lastName ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                        />
                                        {formErrors.lastName && (
                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                                {formErrors.lastName}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-facultyId">Faculty ID</Label>
                                    <Input
                                        id="edit-facultyId"
                                        name="facultyId"
                                        value={formData.facultyId}
                                        onChange={handleInputChange}
                                        className={`${formErrors.facultyId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                    />
                                    {formErrors.facultyId && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                            {formErrors.facultyId}
                                        </motion.p>
                                    )}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`${formErrors.email ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                    />
                                    {formErrors.email && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                            {formErrors.email}
                                        </motion.p>
                                    )}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-phone">Phone</Label>
                                    <Input
                                        id="edit-phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`${formErrors.phone ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                    />
                                    {formErrors.phone && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                            {formErrors.phone}
                                        </motion.p>
                                    )}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                                    <Input
                                        id="edit-password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter new password or leave blank"
                                        className={`${formErrors.password ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                    />
                                    {formErrors.password && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                            {formErrors.password}
                                        </motion.p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="professional" className="mt-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-departmentId">Department</Label>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange("departmentId", value)}
                                        value={formData.departmentId}
                                        key={`edit-dept-${formData.departmentId}`}
                                    >
                                        <SelectTrigger className={`${formErrors.departmentId ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}>
                                            <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
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
                                    <Label htmlFor="edit-designation">Designation</Label>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange("designation", value)}
                                        value={formData.designation}
                                        key={`edit-desig-${formData.designation}`}
                                    >
                                        <SelectTrigger className={`${formErrors.designation ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}>
                                            <SelectValue placeholder="Select a designation" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
                                            {designations.map((designation) => (
                                                <SelectItem key={designation} value={designation}>
                                                    {designation}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.designation && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                            {formErrors.designation}
                                        </motion.p>
                                    )}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-joiningDate">Joining Date</Label>
                                    <Input
                                        id="edit-joiningDate"
                                        name="joiningDate"
                                        type="date"
                                        value={formData.joiningDate}
                                        onChange={handleInputChange}
                                        className={`${formErrors.joiningDate ? "border-red-500 ring-red-200" : ""} transition-all duration-200`}
                                    />
                                    {formErrors.joiningDate && (
                                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                                            {formErrors.joiningDate}
                                        </motion.p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                    
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
                            onClick={handleUpdateFaculty} 
                            disabled={submitting} 
                            className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white transition-all duration-200 shadow-md"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Faculty"
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
                            This will permanently delete the faculty member "{currentFaculty?.firstName} {currentFaculty?.lastName}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting} className="transition-all duration-200">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteFaculty}
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

export default FacultyTab
