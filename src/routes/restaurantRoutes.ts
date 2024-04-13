import { Router } from "express";

import {
  getRestaurants,
  getMenu,
  editProfile,
  editLogo,
  deleteLogo,
  editCover,
  deleteCover,
} from "../controllers/restaurant.js";
import protect from "../middleware/protect.js";
import { multerMiddleware } from "../middleware/multer.js";

const router = Router();

router.get("/", protect, getRestaurants);
router.put("/:restaurantId/profile", protect, editProfile);
router.get("/menu", getMenu);

// Logo routes
router
  .route("/:restaurantId/logo")
  .post(protect, multerMiddleware("logo"), editLogo)
  .delete(protect, deleteLogo);

// Cover routes
router
  .route("/:restaurantId/cover")
  .post(protect, multerMiddleware("cover"), editCover)
  .delete(protect, deleteCover);

export default router;
