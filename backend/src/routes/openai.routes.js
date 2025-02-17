import express from "express";
import { getOpenAIResponse } from "../services/openaiService.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { query, data } = req.body;
  const response = await getOpenAIResponse(query, data);
  res.json({ response });
});

export default router;
