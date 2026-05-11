import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import exercisesRouter from "./routes/exercises.js";
import sessionsRouter from "./routes/sessions.js";
import dailyLogsRouter from "./routes/dailyLogs.js";
import progressRouter from "./routes/progress.js";
import weightLogsRouter from "./routes/weightLogs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes
app.use("/api/exercises", exercisesRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/daily-logs", dailyLogsRouter);
app.use("/api/progress", progressRouter);
app.use("/api/weight-logs", weightLogsRouter);

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);

// Serve the built React frontend (production)
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

// SPA fallback — any non-API route serves index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Physio Tracker running on port ${PORT}`);
});
