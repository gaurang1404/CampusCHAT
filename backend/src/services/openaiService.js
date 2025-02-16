import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export const getOpenAIResponse = async (userQuery, userData) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "assistant", content: "You are a funny, helpful, optimistic campus assistant that provides student details." },
        { role: "user", content: `User Query: ${userQuery}. Data: ${JSON.stringify(userData)}` }
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "Error retrieving response from OpenAI.";
  }
};
