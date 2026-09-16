import fs from "node:fs";
import path from "node:path";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import plansRoutes from "./routes/plans.js";
import paymentsRoutes from "./routes/payments.js";
import progressRoutes from "./routes/progress.js";
import gymRoutes from "./routes/gym.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "1mb" }));

  const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(cors(allowedOrigins?.length ? { origin: allowedOrigins } : {}));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/plans", plansRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/gym", gymRoutes);

  // Serve the built frontend when it exists, so a single process can host the
  // whole product in production.
  const clientDist = path.resolve(process.cwd(), "../fitpulse-pro/dist");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada." }));

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor." });
  });

  return app;
}
