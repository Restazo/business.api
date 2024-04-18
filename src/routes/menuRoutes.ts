import { Router } from "express";

import {
  getMenu,
  addMenuCategory,
  editMenuCategory,
  deleteMenuCategory,
  addMenuItem,
  editMenuItem,
  deleteMenuItem,
} from "../controllers/menu.js";
import protect from "../middleware/protect.js";
import { multerMemoryMiddleware } from "../middleware/multer.js";
import trimRequestMiddleware from "../middleware/trimRequest.js";

const router = Router();

router.get("/:restaurantId/menu", protect, getMenu);
router.post("/:restaurantId/menu/category", protect, addMenuCategory);

router
  .route("/:restaurantId/menu/category/:menuCategoryId")
  .put(protect, editMenuCategory)
  .delete(protect, deleteMenuCategory);

router.post(
  "/:restaurantId/menu/category/:menuCategoryId/item",
  protect,
  multerMemoryMiddleware("itemImage"),
  trimRequestMiddleware,
  addMenuItem
);

router
  .route("/:restaurantId/menu/category/:menuCategoryId/item/:menuItemId")
  .delete(protect, deleteMenuItem)
  .put(protect, multerMemoryMiddleware("itemImage"),trimRequestMiddleware, editMenuItem);
export default router;
