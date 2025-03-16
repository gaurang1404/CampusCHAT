import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import openaiRoutes from "./routes/openai.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import semesterRoutes from "./routes/semester.routes.js";
import sectionRoutes from "./routes/section.routes.js";
import courseRoutes from "./routes/course.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";


const app = express();

app.use(express.json());

// Allow all origins temporarily for debugging
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello, server is running!");
});

app.use("/api/openai", openaiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/semester", semesterRoutes);
app.use("/api/section", sectionRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/student", studentRoutes);

// Connect to Database
connectDB();


export default app;
