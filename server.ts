import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { authRouter } from "./src/server/authRouter";
import { bootstrapSystem } from "./src/server/authStore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());

// Mount Authentication & RBAC router
app.use("/api/auth", authRouter);

// API route for Gemini AI Copilot
app.post("/api/ai/copilot", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured in environment variables.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are "Eventos AI Copilot", an elite event management command assistant for high-stakes luxury, corporate, and large-scale entertainment events.
You specialize in risk mitigation, budget optimization, staff schedule conflict resolution, vendor negotiation, and real-time crisis management.
Provide concise, highly professional, actionable recommendations with structured bullet points or clean executive summaries.
Include specific numerical estimates, risk levels (Low, Medium, High, Critical), and immediate 1-2-3 action steps when applicable.`;

    const fullPrompt = `${systemInstruction}\n\nContext:\n${JSON.stringify(context || {})}\n\nUser Question/Command: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return res.json({ text: response.text || "No output generated." });
  } catch (error: any) {
    console.error("Gemini Copilot Error:", error);
    return res.status(500).json({ error: error?.message || "Failed to contact AI Copilot" });
  }
});

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Eventos Command Center API" });
});

// Vite middleware setup for Development / Static serving for Production
async function startServer() {
  try {
    await bootstrapSystem();
  } catch (err) {
    console.warn("Bootstrap warning:", err);
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Eventos Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
