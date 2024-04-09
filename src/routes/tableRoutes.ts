import { Router } from "express";

import protect from "../middleware/protect.js";

import { createTable } from "../controllers/table.js";

const router = Router();

router.post("/:restaurantId/tables", protect, createTable);

export default router;
