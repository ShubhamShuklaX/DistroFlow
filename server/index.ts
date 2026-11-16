import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import staffRoutes from "./routes/staff";
import retailerRoutes from "./routes/retailers";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import paymentRoutes from "./routes/payments";
import analyticsRoutes from "./routes/analytics";
import notificationRoutes from "./routes/notifications";
import auditRoutes from "./routes/audit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "DistroFlow CRM Backend",
    timestamp: new Date(),
  });
});

import path from "path";
import fs from "fs";

// Serve frontend in production
const distPath = path.join(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[DistroFlow Server] Running on http://localhost:${PORT}`);
});
