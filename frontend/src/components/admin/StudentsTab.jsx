import { useState, useEffect } from "react"
import axios from "axios"
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
import { Pencil, Trash2, Plus, Filter, Eye, Search } from 'lucide-react'
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

const apiUrl = import.meta.env.VITE_API_URL

const StudentsTab = () => {
    const [students, setStudents] = useState([])
    const [departments, setDepartments] = useState([])
    const [semesters, setSemesters] = useState([])
    const [filteredSemesters, setFilteredSemesters] = useState([])
    const [sections, setSections] = useState([])
    const [filteredSections, setFilteredSections] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [currentStudent, setCurrentStudent] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [filterDepartment, setFilterDepartment] = useState("all")
    const [filterSemester, setFilterSemester] = useState("all")
    const [filterSection, setFilterSection] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        collegeEmail: "",
        password: "",
        studentId: "",
        departmentId: "",
        semesterId: "",
        sectionId: "",
    })

    // Fetch data on component mount
    useEffect(() => {
        fetchDepartments()
        fetchAllSemesters()
        fetchAllSections()
        fetchStudents()
    }, [])

    // Fetch students with filters
    useEffect(() => {
        fetchStudents()
    }, [filterDepartment, filterSemester, filterSection])

    // Update filtered semesters when department changes
    useEffect(() => {
        if (formData.departmentId) {
            fetchSemestersByDepartment(formData.departmentId)
        } else {
            setFilteredSemesters([])
        }
        // Clear semester and section when department changes
        setFormData(prev => ({
            ...prev,
            semesterId: "",
            sectionId: ""
        }))
        setFilteredSections([])
    }, [formData.departmentId])

    // Update filtered sections when semester changes
    useEffect(() => {
        if (formData.semesterId) {
            const semesterSections = sections.filter(section => 
                section.semesterId && section.semesterId._id === formData.semesterId
            )
            setFilteredSections(semesterSections)
        } else {
            setFilteredSections([])
        }
        // Clear section when semester changes
        setFormData(prev => ({
            ...prev,
            sectionId: ""
        }))
    }, [formData.semesterId, sections])

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

    const fetchAllSemesters = async () => {
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

    const fetchSemestersByDepartment = async (departmentId) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.get(`${apiUrl}/api/semester/departmentId/${departmentId}`, config)
            setFilteredSemesters(response.data.data.semesters)
        } catch (err) {
            console.error("Error fetching semesters by department:", err)
            toast.error("Failed to load semesters for this department")
            setFilteredSemesters([])
        }
    }

    const fetchAllSections = async () => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const response = await axios.get(`${apiUrl}/api/section/`, config)
            setSections(response.data.data.sections)
        } catch (err) {
            console.error("Error fetching sections:", err)
            toast.error("Failed to load sections")
        }
    }

    const fetchStudents = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }
            
            const response = await axios.get(`${apiUrl}/api/student/`, config)
            
            // Apply filters client-side
            let filteredStudents = response.data.data.students
            
            if (filterDepartment !== "all") {
                filteredStudents = filteredStudents.filter(student => 
                    student.departmentId && student.departmentId._id === filterDepartment
                )
            }
            
            if (filterSemester !== "all") {
                filteredStudents = filteredStudents.filter(student => 
                    student.semesterId === filterSemester
                )
            }
            
            if (filterSection !== "all") {
                filteredStudents = filteredStudents.filter(student => 
                    student.sectionId === filterSection
                )
            }
            
            // Apply search query if present
            if (searchQuery.trim() !== "") {
                const query = searchQuery.toLowerCase()
                filteredStudents = filteredStudents.filter(student => 
                    student.firstName.toLowerCase().includes(query) ||
                    student.lastName.toLowerCase().includes(query) ||
                    student.collegeEmail.toLowerCase().includes(query) ||
                    student.studentId.toLowerCase().includes(query)
                )
            }
            
            setStudents(filteredStudents)
            setError(null)
        } catch (err) {
            setError("Failed to fetch students. Please try again later.")
            console.error("Error fetching students:", err)
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
                        collegeEmail: `${emailPrefix}@${department.institutionDomain}`
                    }))
                }
            }
        }
    }

    const validateForm = () => {
        const errors = {}
        const requiredFields = [
            "firstName", "lastName", "collegeEmail", 
            "studentId", "departmentId", "semesterId", "sectionId"
        ]
        
        // Add password to required fields only when adding a new student
        if (!currentStudent) {
            requiredFields.push("password")
        }

        requiredFields.forEach((field) => {
            if (!formData[field] || (typeof formData[field] === "string" && formData[field].trim() === "")) {
                errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} is required`
            }
        })

        // Email validation
        if (formData.collegeEmail && !formData.collegeEmail.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            errors.collegeEmail = "Please enter a valid email address"
        }

        // Password validation (only for new students)
        if (!currentStudent && formData.password && formData.password.length < 8) {
            errors.password = "Password must be at least 8 characters long"
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleAddStudent = async () => {
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
            
            const studentData = {
                ...formData,
                institutionDomain
            }
            
            const response = await axios.post(`${apiUrl}/api/student/add`, studentData, config)

            if (response.data.code === 201) {
                fetchStudents()
                setIsAddDialogOpen(false)
                resetForm()
                toast.success("Student added successfully")
            } else {
                setServerError(response.data.message || "Failed to add student. Please try again.")
            }
        } catch (err) {
            console.error("Error adding student:", err)
            const errorMessage = err.response?.data?.message || 
                "Failed to add student. Please check your connection and try again."
            setServerError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateStudent = async () => {
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
                `${apiUrl}/api/student/${currentStudent._id}`, 
                updateData, 
                config
            )
                      
            if (response.data.code === 200) {                              
                fetchStudents()
                setIsEditDialogOpen(false)
                resetForm()
                toast.success("Student updated successfully")
            } else {
                setServerError(response.data.message || "Failed to update student. Please try again.")
            }
        } catch (err) {
            console.error("Error updating student:", err)
            const errorMessage = err.response?.data?.message || 
                "Failed to update student. Please check your connection and try again."
            setServerError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteStudent = async () => {
        setSubmitting(true)
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token")
            const config = { headers: { Authorization: `Bearer ${token}` } }

            const response = await axios.delete(`${apiUrl}/api/student/${currentStudent._id}`, config)

            if (response.data.code === 200) {
                toast.success("Student deleted successfully")
                fetchStudents()
                setIsDeleteDialogOpen(false)
            } else {
                toast.error(response.data.message || "Failed to delete student")
            }
        } catch (err) {
            console.error("Error deleting student:", err)
            const errorMessage = err.response?.data?.message || "Failed to delete student. Please try again."
            toast.error(errorMessage)
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            firstName: "",
            lastName: "",
            collegeEmail: "",
            password: "",
            studentId: "",
            departmentId: "",
            semesterId: "",
            sectionId: "",
        })
        setFormErrors({})
        setServerError(null)
        setFilteredSemesters([])
        setFilteredSections([])
    }

    const openEditDialog = (student) => {
        setCurrentStudent(student)
        
        // First set the department to trigger the useEffect for fetching semesters
        setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            collegeEmail: student.collegeEmail,
            password: "", // Don't populate password for security
            studentId: student.studentId,
            departmentId: student.departmentId._id,
            semesterId: "",
            sectionId: "",
        })
        
        // Fetch semesters for this department
        fetchSemestersByDepartment(student.departmentId._id).then(() => {
            // After semesters are loaded, set the semester and section
            setFormData(prev => ({
                ...prev,
                semesterId: student.semesterId,
                sectionId: student.sectionId,
            }))
        })
        
        setFormErrors({})
        setServerError(null)
        setIsEditDialogOpen(true)        
    }

    const openDeleteDialog = (student) => {
        setCurrentStudent(student)
        setIsDeleteDialogOpen(true)
    }
    
    const openViewDialog = (student) => {
        setCurrentStudent(student)
        setIsViewDialogOpen(true)
    }

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
        // Debounce search to avoid too many re-renders
        const timeoutId = setTimeout(() => {
            fetchStudents()
        }, 500)
        return () => clearTimeout(timeoutId)
    }

    // Get entity name by ID
    const getDepartmentName = (id) => {
        const department = departments.find(dept => dept._id === id)
        return department ? department.name : "Unknown Department"
    }
    
    const getSemesterName = (id) => {
        const semester = semesters.find(sem => sem._id === id)
        return semester ? semester.name : "Unknown Semester"
    }
    
    const getSectionName = (id) => {
        const section = sections.find(sec => sec._id === id)
        return section ? section.name : "Unknown Section"
    }

    return (
        <div className="p-6 mx-auto">
            <Card className="max-w-[1200px] border-none">
                <CardHeader className="bg-[#63144c] text-white">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold">Student Management</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative w-64 hidden md:block">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-white opacity-70" />
                                <Input
                                    placeholder="Search students..."
                                    className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white text-[#63144c] hover:bg-gray-100 hover:text-black">
                                        <Filter size={16} className="md:mr-2" />
                                        <span className="hidden md:block">Filter</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-white">
                                    <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">Department</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={filterDepartment} onValueChange={setFilterDepartment}>
                                        <DropdownMenuRadioItem value="all">All Departments</DropdownMenuRadioItem>
                                        {departments.map((department) => (
                                            <DropdownMenuRadioItem key={department._id} value={department._id}>
                                                {department.name}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Semester</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={filterSemester} onValueChange={setFilterSemester}>
                                        <DropdownMenuRadioItem value="all">All Semesters</DropdownMenuRadioItem>
                                        {semesters.map((semester) => (
                                            <DropdownMenuRadioItem key={semester._id} value={semester._id}>
                                                {semester.name}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                    
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Section</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup value={filterSection} onValueChange={setFilterSection}>
                                        <DropdownMenuRadioItem value="all">All Sections</DropdownMenuRadioItem>
                                        {sections.map((section) => (
                                            <DropdownMenuRadioItem key={section._id} value={section._id}>
                                                {section.name}
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
                                        <span className="hidden md:block">Add Student</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg bg-white">
                                    <DialogHeader className="text-[#63144c]">
                                        <DialogTitle className="font-extrabold text-2xl">Add New Student</DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>Fill in the student details below.</DialogDescription>
                                    {serverError && (
                                        <div
                                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
                                            role="alert"
                                        >
                                            <span className="block sm:inline">{serverError}</span>
                                        </div>
                                    )}
                                    
                                    <Tabs defaultValue="basic" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                            <TabsTrigger value="academic">Academic Info</TabsTrigger>
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
                                                            className={formErrors.firstName ? "border-red-500" : ""}
                                                        />
                                                        {formErrors.firstName && <p className="text-sm text-red-500">{formErrors.firstName}</p>}
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
                                                            className={formErrors.lastName ? "border-red-500" : ""}
                                                        />
                                                        {formErrors.lastName && <p className="text-sm text-red-500">{formErrors.lastName}</p>}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="studentId">Student ID</Label>
                                                    <Input
                                                        id="studentId"
                                                        name="studentId"
                                                        value={formData.studentId}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Enter student ID"
                                                        className={formErrors.studentId ? "border-red-500" : ""}
                                                    />
                                                    {formErrors.studentId && <p className="text-sm text-red-500">{formErrors.studentId}</p>}
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="collegeEmail">Email</Label>
                                                    <Input
                                                        id="collegeEmail"
                                                        name="collegeEmail"
                                                        value={formData.collegeEmail}
                                                        onChange={handleInputChange}
                                                        required
                                                        placeholder="Enter college email"
                                                        className={formErrors.collegeEmail ? "border-red-500" : ""}
                                                    />
                                                    {formErrors.collegeEmail && <p className="text-sm text-red-500">{formErrors.collegeEmail}</p>}
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
                                                        className={formErrors.password ? "border-red-500" : ""}
                                                    />
                                                    {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                                                </div>
                                            </div>
                                        </TabsContent>
                                        
                                        <TabsContent value="academic" className="mt-4">
                                            <div className="grid gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="departmentId">Department</Label>
                                                    <Select 
                                                        onValueChange={(value) => handleSelectChange("departmentId", value)}
                                                        value={formData.departmentId}
                                                        key={`dept-${formData.departmentId}`}
                                                    >
                                                        <SelectTrigger className={formErrors.departmentId ? "border-red-500" : ""}>
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
                                                    {formErrors.departmentId && <p className="text-sm text-red-500">{formErrors.departmentId}</p>}
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="semesterId">Semester</Label>
                                                    <Select 
                                                        onValueChange={(value) => handleSelectChange("semesterId", value)}
                                                        value={formData.semesterId}
                                                        key={`sem-${formData.semesterId}`}
                                                        disabled={!formData.departmentId || filteredSemesters.length === 0}
                                                    >
                                                        <SelectTrigger className={formErrors.semesterId ? "border-red-500" : ""}>
                                                            <SelectValue placeholder={
                                                                !formData.departmentId 
                                                                    ? "Select a department first" 
                                                                    : filteredSemesters.length === 0 
                                                                        ? "No semesters available" 
                                                                        : "Select a semester"
                                                            } />
                                                        </SelectTrigger>
                                                        <SelectContent className='bg-white'>
                                                            {filteredSemesters.map((semester) => (
                                                                <SelectItem key={semester._id} value={semester._id}>
                                                                    {semester.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {formErrors.semesterId && <p className="text-sm text-red-500">{formErrors.semesterId}</p>}
                                                </div>
                                                
                                                <div className="grid gap-2">
                                                    <Label htmlFor="sectionId">Section</Label>
                                                    <Select 
                                                        onValueChange={(value) => handleSelectChange("sectionId", value)}
                                                        value={formData.sectionId}
                                                        key={`sec-${formData.sectionId}`}
                                                        disabled={!formData.semesterId || filteredSections.length === 0}
                                                    >
                                                        <SelectTrigger className={formErrors.sectionId ? "border-red-500" : ""}>
                                                            <SelectValue placeholder={
                                                                !formData.semesterId 
                                                                    ? "Select a semester first" 
                                                                    : filteredSections.length === 0 
                                                                        ? "No sections available" 
                                                                        : "Select a section"
                                                            } />
                                                        </SelectTrigger>
                                                        <SelectContent className='bg-white'>
                                                            {filteredSections.map((section) => (
                                                                <SelectItem key={section._id} value={section._id}>
                                                                    {section.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {formErrors.sectionId && <p className="text-sm text-red-500">{formErrors.sectionId}</p>}
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
                                            className="mt-3"
                                        >
                                            Cancel
                                        </Button>

                                        <Button className="bg-[#63144c] text-white mt-3 hover:bg-[#5f0a47] hover:text-white" onClick={handleAddStudent} disabled={submitting}>
                                            {submitting ? "Adding..." : "Add Student"}
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
                    ) : students.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No students found. Add a student to get started.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student._id}>
                                            <TableCell className="font-medium">{student.studentId}</TableCell>
                                            <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                                            <TableCell>{student.collegeEmail}</TableCell>
                                            <TableCell>{student.departmentId ? student.departmentId.name : "N/A"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openViewDialog(student)}
                                                    >
                                                        <Eye size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => openEditDialog(student)}
                                                    >
                                                        <Pencil size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => openDeleteDialog(student)}
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
                    <div className="text-sm text-gray-500">Total: {students.length} student(s)</div>
                    <Button variant="outline" onClick={fetchStudents}>
                        Refresh
                    </Button>
                </CardFooter>
            </Card>

            {/* View Student Dialog */}
            <Dialog
                open={isViewDialogOpen}
                onOpenChange={(open) => setIsViewDialogOpen(open)}
            >
                <DialogContent className="sm:max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>
                    {currentStudent && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Student ID</h3>
                                    <p className="mt-1">{currentStudent.studentId}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                                    <p className="mt-1">{`${currentStudent.firstName} ${currentStudent.lastName}`}</p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                <p className="mt-1">{currentStudent.collegeEmail}</p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                                    <p className="mt-1">{currentStudent.departmentId ? currentStudent.departmentId.name : "N/A"}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Semester</h3>
                                    <p className="mt-1">{getSemesterName(currentStudent.semesterId)}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Section</h3>
                                    <p className="mt-1">{getSectionName(currentStudent.sectionId)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewDialogOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Student Dialog */}
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
                        <DialogTitle>Edit Student</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Make changes to the student information below.</DialogDescription>
                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{serverError}</span>
                        </div>
                    )}
                    
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="academic">Academic Info</TabsTrigger>
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
                                            className={formErrors.firstName ? "border-red-500" : ""}
                                        />
                                        {formErrors.firstName && <p className="text-sm text-red-500">{formErrors.firstName}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-lastName">Last Name</Label>
                                        <Input
                                            id="edit-lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={formErrors.lastName ? "border-red-500" : ""}
                                        />
                                        {formErrors.lastName && <p className="text-sm text-red-500">{formErrors.lastName}</p>}
                                    </div>
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-studentId">Student ID</Label>
                                    <Input
                                        id="edit-studentId"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                        className={formErrors.studentId ? "border-red-500" : ""}
                                    />
                                    {formErrors.studentId && <p className="text-sm text-red-500">{formErrors.studentId}</p>}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-collegeEmail">Email</Label>
                                    <Input
                                        id="edit-collegeEmail"
                                        name="collegeEmail"
                                        value={formData.collegeEmail}
                                        onChange={handleInputChange}
                                        className={formErrors.collegeEmail ? "border-red-500" : ""}
                                    />
                                    {formErrors.collegeEmail && <p className="text-sm text-red-500">{formErrors.collegeEmail}</p>}
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
                                        className={formErrors.password ? "border-red-500" : ""}
                                    />
                                    {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="academic" className="mt-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-departmentId">Department</Label>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange("departmentId", value)}
                                        value={formData.departmentId}
                                        key={`edit-dept-${formData.departmentId}`}
                                    >
                                        <SelectTrigger className={formErrors.departmentId ? "border-red-500" : ""}>
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
                                    {formErrors.departmentId && <p className="text-sm text-red-500">{formErrors.departmentId}</p>}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-semesterId">Semester</Label>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange("semesterId", value)}
                                        value={formData.semesterId}
                                        key={`edit-sem-${formData.semesterId}`}
                                        disabled={!formData.departmentId || filteredSemesters.length === 0}
                                    >
                                        <SelectTrigger className={formErrors.semesterId ? "border-red-500" : ""}>
                                            <SelectValue placeholder={
                                                !formData.departmentId 
                                                    ? "Select a department first" 
                                                    : filteredSemesters.length === 0 
                                                        ? "No semesters available" 
                                                        : "Select a semester"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
                                            {filteredSemesters.map((semester) => (
                                                <SelectItem key={semester._id} value={semester._id}>
                                                    {semester.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.semesterId && <p className="text-sm text-red-500">{formErrors.semesterId}</p>}
                                </div>
                                
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-sectionId">Section</Label>
                                    <Select 
                                        onValueChange={(value) => handleSelectChange("sectionId", value)}
                                        value={formData.sectionId}
                                        key={`edit-sec-${formData.sectionId}`}
                                        disabled={!formData.semesterId || filteredSections.length === 0}
                                    >
                                        <SelectTrigger className={formErrors.sectionId ? "border-red-500" : ""}>
                                            <SelectValue placeholder={
                                                !formData.semesterId 
                                                    ? "Select a semester first" 
                                                    : filteredSections.length === 0 
                                                        ? "No sections available" 
                                                        : "Select a section"
                                            } />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white'>
                                            {filteredSections.map((section) => (
                                                <SelectItem key={section._id} value={section._id}>
                                                    {section.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.sectionId && <p className="text-sm text-red-500">{formErrors.sectionId}</p>}
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
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStudent} disabled={submitting} className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white">
                            {submitting ? "Updating..." : "Update Student"}
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
                            This will permanently delete the student "{currentStudent?.firstName} {currentStudent?.lastName}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteStudent}
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

export default StudentsTab
