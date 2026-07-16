import express from "express";
import { verifyToken, checkRole } from "../middleware/auth.js";
import { getAllUsers } from "../data/users.js";

const adminRouter = express.Router();

adminRouter.get("/users", verifyToken, checkRole("admin"), (req, res) => {
  res.json({ users: getAllUsers() });
});

export { adminRouter };
