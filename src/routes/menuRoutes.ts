import { Router } from "express";

import {
  getMenu,
  addMenuCategory,
  editMenuCategory,
} from "../controllers/menu.js";
import protect from "../middleware/protect.js";

const router = Router();

router.get("/:restaurantId/menu", protect, getMenu);
router.post("/:restaurantId/menu/category", protect, addMenuCategory);
router.put(
  "/:restaurantId/menu/category/:menuCategoryId",
  protect,
  editMenuCategory
);

export default router;
