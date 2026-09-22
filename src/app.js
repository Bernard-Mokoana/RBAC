import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { authRouter } from "./routes/auth.js";
import { contentRouter } from "./routes/content.js";
import { adminRouter } from "./routes/admin.js";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/admin", adminRouter);

app.get("/", (req, res) => {
  res.json({ message: "RBAC API is running" });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error(`Failed to start server on port ${PORT}:`, err);
    return;
  }
  console.log(`Server running on port ${PORT}`);
});

export { app, server };
