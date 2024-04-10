import { Router } from "express";

import { getMenu, addMenuCategory } from "../controllers/menu.js";
import protect from "../middleware/protect.js";

const router = Router();

router.get("/:restaurantId/menu", protect, getMenu);
router.post("/:restaurantId/menu/category", protect, addMenuCategory);

export default router;
