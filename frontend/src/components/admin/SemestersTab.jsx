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
import { Pencil, Trash2, Plus, Filter } from 'lucide-react'
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
    }, [filterDepartment])

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
            
            setSemesters(response.data.data.semesters)
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
        console.log(formData["departmentId"]);

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
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            // Set up Axios headers with the token
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.delete(`${apiUrl}/api/semester/${currentSemester._id}`, config);

            if (response.data.status === 201) {
                toast.success("Semester deleted successfully");
                fetchSemesters()
                setIsDeleteDialogOpen(false);
            } else {
                toast.error(response.data.message || "Failed to delete semester");
            }
        } catch (err) {
            console.error("Error deleting semester:", err);
            const errorMessage = err.response?.data?.message || "Failed to delete semester. Please try again.";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

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
            departmentId: semester.departmentId,
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

    return (
        <div className="p-6 mx-auto">
            <Card className="max-w-[1200px] border-none">
                <CardHeader className="bg-[#63144c] text-white">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold">Semester Management</CardTitle>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="bg-white text-[#63144c] hover:bg-gray-100">
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
                                        <span className="hidden md:block">Add Semester</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg bg-white">
                                    <DialogHeader className="text-[#63144c]">
                                        <DialogTitle className="font-extrabold text-2xl">Add New Semester</DialogTitle>
                                    </DialogHeader>
                                    <DialogDescription>Fill in the details to create a new semester.</DialogDescription>
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
                                            <Label htmlFor="name">Semester Name</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter semester name"
                                                className={formErrors.name ? "border-red-500" : ""}
                                            />
                                            {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="semesterCode">Semester Code</Label>
                                            <Input
                                                id="semesterCode"
                                                name="semesterCode"
                                                value={formData.semesterCode}
                                                onChange={handleInputChange}
                                                placeholder="E.g., SEM1, FALL2024"
                                                className={formErrors.semesterCode ? "border-red-500" : ""}
                                            />
                                            {formErrors.semesterCode && <p className="text-sm text-red-500">{formErrors.semesterCode}</p>}
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
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="startDate">Start Date</Label>
                                                <Input
                                                    id="startDate"
                                                    name="startDate"
                                                    type="date"
                                                    value={formData.startDate}
                                                    onChange={handleInputChange}
                                                    className={formErrors.startDate ? "border-red-500" : ""}
                                                />
                                                {formErrors.startDate && <p className="text-sm text-red-500">{formErrors.startDate}</p>}
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="endDate">End Date</Label>
                                                <Input
                                                    id="endDate"
                                                    name="endDate"
                                                    type="date"
                                                    value={formData.endDate}
                                                    onChange={handleInputChange}
                                                    className={formErrors.endDate ? "border-red-500" : ""}
                                                />
                                                {formErrors.endDate && <p className="text-sm text-red-500">{formErrors.endDate}</p>}
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
                                            className="mt-3"
                                        >
                                            Cancel
                                        </Button>

                                        <Button className="bg-[#63144c] text-white mt-3 hover:bg-[#5f0a47] hover:text-white" onClick={handleAddSemester} disabled={submitting}>
                                            {submitting ? "Adding..." : "Add Semester"}
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
                    ) : semesters.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No semesters found. Add a semester to get started.</div>
                    ) : (
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
                                    {semesters.map((semester) => (
                                        <TableRow key={semester._id}>
                                            <TableCell className="font-medium">{semester.name}</TableCell>
                                            <TableCell>{semester.semesterCode}</TableCell>
                                            <TableCell>{semester.departmentId.name}</TableCell>
                                            <TableCell>{formatDate(semester.startDate)}</TableCell>
                                            <TableCell>{formatDate(semester.endDate)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(semester)}>
                                                        <Pencil size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => openDeleteDialog(semester)}
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
                    <div className="text-sm text-gray-500">Total: {semesters.length} semester(s)</div>
                    <Button variant="outline" onClick={fetchSemesters}>
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
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{serverError}</span>
                        </div>
                    )}
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Semester Name</Label>
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
                            <Label htmlFor="edit-semesterCode">Semester Code</Label>
                            <Input
                                id="edit-semesterCode"
                                name="semesterCode"
                                value={formData.semesterCode}
                                onChange={handleInputChange}
                                className={formErrors.semesterCode ? "border-red-500" : ""}
                            />
                            {formErrors.semesterCode && <p className="text-sm text-red-500">{formErrors.semesterCode}</p>}
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
                                    className={formErrors.startDate ? "border-red-500" : ""}
                                />
                                {formErrors.startDate && <p className="text-sm text-red-500">{formErrors.startDate}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-endDate">End Date</Label>
                                <Input
                                    id="edit-endDate"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className={formErrors.endDate ? "border-red-500" : ""}
                                />
                                {formErrors.endDate && <p className="text-sm text-red-500">{formErrors.endDate}</p>}
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
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateSemester} disabled={submitting} className="bg-[#63144c] text-white hover:bg-[#6c0e51] hover:text-white">
                            {submitting ? "Updating..." : "Update Semester"}
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
                            This will permanently delete the semester "{currentSemester?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSemester}
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

export default SemestersTab
