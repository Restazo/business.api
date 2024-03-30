import { Router } from "express";

import { getRestaurants, getMenu } from "../controllers/restaurant.js";
import protect from "../middleware/protect.js";

const router = Router();

router.get("/", protect, getRestaurants);
router.get("/menu", getMenu);

export default router;
