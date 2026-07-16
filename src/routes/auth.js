import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email, !password) {
        return res.status(400).json({ message: "All fields are required"});
    }

    if (findUserByEmail(email)) {
        return res.status(409).json({ message: "Email already registered"});
    }

    const validRole = ['user', 'editor', 'admin']
})