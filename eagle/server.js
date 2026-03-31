import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ================= CHATBOT =================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(message);
    const response = result.response.text();

    res.json({ reply: response });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chat error" });
  }
});

// ================= IMAGE GENERATION =================
// NOTE: Gemini direct image generation limited hai
// So we simulate using prompt → image description

app.post("/image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(
      `Create a detailed image prompt for: ${prompt}`
    );

    const imagePrompt = result.response.text();

    res.json({
      prompt: imagePrompt,
      note: "Use this prompt with Stable Diffusion / DALL·E for real image"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Image error" });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});