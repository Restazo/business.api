import { Router } from "express";

import protect from "../middleware/protect.js";

import { createTable, deleteTable, getTables } from "../controllers/table.js";

const router = Router();

router.delete("/:restaurantId/tables/:tableId", protect, deleteTable);

router
  .route("/:restaurantId/tables")
  .post(protect, createTable)
  .get(protect, getTables);

export default router;
