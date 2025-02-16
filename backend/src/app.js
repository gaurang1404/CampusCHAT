import express from "express";
import cors from "cors";
import openaiRoutes from "./routes/openaiRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/openai", openaiRoutes);

export default app;
