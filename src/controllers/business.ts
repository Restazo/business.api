import { Request, Response } from "express";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";

import { cookieConfig } from "../config.js";

/* *********************** Delete Business Controller *********************** */
export const deleteBusiness = async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM business WHERE id = $1", [req.user.id]);
    res.clearCookie("refreshToken", cookieConfig);
    sendResponse(res, 200, "business deleted");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
