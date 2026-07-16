import express from "express";
import { verifyToken, checkRole } from "../middleware/auth.js";

const contentRouter = express.Router();

// In-memory content store - Use pgsql later
const content = [
  { id: "1", tile: "Getting started with Node.js", author: "admin" },
  { id: "2", title: "Express Middleware Explained", author: "editor" },
];

contentRouter.get(
  "/",
  verifyToken,
  checkRole("user", "editor", "admin"),
  (req, res) => {
    res.json({ content });
  },
);

contentRouter.post(
  "/",
  verifyToken,
  checkRole("editor", "admin"),
  (req, res) => {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required " });
    }

    const newItem = {
      id: Date.now().toString(),
      title,
      author: req.user.email,
    };

    content.push(newItem);
    res.status(201).json({ message: "Content created", item: newItem });
  },
);

contentRouter.delete("/:id", verifyToken, checkRole("admin"), (req, res) => {
  const index = content.findIndex((c) => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Content not found " });
  }

  content.splice(index, 1);
  res.json({ message: "Content deleted successfully " });
});

export { contentRouter };
