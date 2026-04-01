import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* ===== RATE LIMIT ===== */
app.use(rateLimit({
  windowMs: 1000,
  max: 10
}));

/* ===== CORS FIX (IMPORTANT 🔥) */
const allowedOrigins = [
  "https://ts-eagleai.netlify.app",
  "https://quronai.netlify.app"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

/* ===== BASIC MEMORY ===== */
const chats = {};

/* ===== CHAT ROUTE ===== */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userId = "guest" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message missing" });
    }

    if (!chats[userId]) chats[userId] = [];
    const history = chats[userId];

    const messages = [
      { role: "system", content: "You are a helpful AI. Reply in Hinglish, friendly tone." },
      ...history,
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 400
    });

    const reply = response.choices[0].message.content;

    // Save memory
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });

    res.json({ reply });

  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ reply: "⚠️ Server busy, try again 😅" });
  }
});

/* ===== HEALTH CHECK ===== */
app.get("/", (req, res) => {
  res.send("🦅 Eagle AI Chat Server Running");
});

/* ===== START SERVER ===== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});