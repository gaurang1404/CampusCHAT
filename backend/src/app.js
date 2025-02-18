import openaiRoutes from "./routes/openai.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import studentRoutes from "./routes/student.routes.js";

import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/openai", openaiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);

export default app;
