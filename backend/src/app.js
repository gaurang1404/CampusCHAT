import express from "express";
import cors from "cors";
import openaiRoutes from "./routes/openai.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import departmentRoutes from "./routes/department.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/openai", openaiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/department", departmentRoutes);

export default app;
