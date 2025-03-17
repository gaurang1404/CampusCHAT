import axios from "axios"
const apiUrl = import.meta.env.VITE_API_URL;

// Set up axios instance with auth token
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Main student data
export const fetchStudentData = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}`)
    return response.data.data.student
  } catch (error) {
    console.error("Error fetching student data:", error)
    throw error
  }
}

// Overview tab data
export const fetchOverviewData = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}/overview`)
    return response.data.data
  } catch (error) {
    console.error("Error fetching overview data:", error)
    throw error
  }
}

export const fetchCourseProgress = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}/course-progress`)
    return response.data.data.courses
  } catch (error) {
    console.error("Error fetching course progress:", error)
    throw error
  }
}

// Attendance tab data
export const fetchAttendanceData = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}/attendance`)
    return response.data.data
  } catch (error) {
    console.error("Error fetching attendance data:", error)
    throw error
  }
}

export const fetchAttendanceByDate = async (studentId, date) => {
  try {
    const response = await api.get(`/api/student/${studentId}/attendance/date/${date}`)
    return response.data.data.attendance
  } catch (error) {
    console.error("Error fetching attendance by date:", error)
    throw error
  }
}

export const fetchCourseWiseAttendance = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}/attendance/course-wise`)
    return response.data.data.courses
  } catch (error) {
    console.error("Error fetching course-wise attendance:", error)
    throw error
  }
}

export const fetchMonthlyAttendance = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}/attendance/monthly`)
    return response.data.data.months
  } catch (error) {
    console.error("Error fetching monthly attendance:", error)
    throw error
  }
}

// Marks tab data
export const fetchMarksData = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}/marks`)
    return response.data.data
  } catch (error) {
    console.error("Error fetching marks data:", error)
    throw error
  }
}

export const fetchCourseMarks = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}/marks/courses`)
    return response.data.data.courses
  } catch (error) {
    console.error("Error fetching course marks:", error)
    throw error
  }
}

export const fetchSemesterProgress = async (studentId) => {
  try {
    const response = await api.get(`/api/student/${studentId}/marks/progress`)
    return response.data.data.progress
  } catch (error) {
    console.error("Error fetching semester progress:", error)
    throw error
  }
}

