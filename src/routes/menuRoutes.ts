import { Router } from "express";

import {
  getMenu,
  addMenuCategory,
  editMenuCategory,
  deleteMenuCategory,
} from "../controllers/menu.js";
import protect from "../middleware/protect.js";

const router = Router();

router.get("/:restaurantId/menu", protect, getMenu);
router.post("/:restaurantId/menu/category", protect, addMenuCategory);

router
  .route("/:restaurantId/menu/category/:menuCategoryId")
  .put(protect, editMenuCategory)
  .delete(protect, deleteMenuCategory);

export default router;
