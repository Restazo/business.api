import { Router } from "express";

import {
  getRestaurants,
  editProfile,
  editLogo,
  deleteLogo,
  editCover,
  deleteCover,
} from "../controllers/restaurant.js";
import protect from "../middleware/protect.js";
import { multerDiskMiddleware } from "../middleware/multer.js";

const router = Router();

router.get("/", protect, getRestaurants);
router.put("/:restaurantId/profile", protect, editProfile);

// Logo routes
router
  .route("/:restaurantId/logo")
  .post(protect, multerDiskMiddleware("logo"), editLogo)
  .delete(protect, deleteLogo);

// Cover routes
router
  .route("/:restaurantId/cover")
  .post(protect, multerDiskMiddleware("cover"), editCover)
  .delete(protect, deleteCover);

export default router;
