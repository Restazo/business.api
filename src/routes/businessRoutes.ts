import { Router } from "express";

import { deleteBusiness } from "../controllers/business.js";
import protect from "../middleware/protect.js";

const router = Router();

router.delete("/delete", protect, deleteBusiness);

export default router;
