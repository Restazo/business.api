import { Router } from "express";

import { getMenu } from "../controllers/menu.js";
import protect from "../middleware/protect.js";

const router = Router();

router.get("/:restaurantId/menu", protect, getMenu);

export default router;
