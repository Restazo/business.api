import { Router } from "express";

import protect from "../middleware/protect.js";

import { createTable, deleteTable } from "../controllers/table.js";

const router = Router();

router.post("/:restaurantId/tables", protect, createTable);
router.delete("/:restaurantId/tables/:tableId", protect, deleteTable);

export default router;
