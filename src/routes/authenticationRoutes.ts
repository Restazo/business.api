import { Router } from "express";

import { register, logIn, getSession } from "../controllers/authentication.js";
import protect from "../middleware/protect.js";

const router = Router();

router.post("/register", register);
router.post("/login", logIn);
router.get("/session", protect, getSession);

export default router;
