import { Router } from "express";

import protect from "../middleware/protect.js";

import {
  getWaiters,
  registerWaiter,
  deleteWaiter,
} from "../controllers/waiter.js";

const router = Router();

router.delete("/:restaurantId/waiters/:waiterId", protect, deleteWaiter);

router
  .route("/:restaurantId/waiters")
  .post(protect, registerWaiter)
  .get(protect, getWaiters);

export default router;
