import { Request, Response } from "express";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";

import { cookieConfig } from "../config.js";

/* *********************** Delete Business Controller *********************** */
export const deleteBusiness = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return sendResponse(res, 403, "invalid session");
    }

    await pool.query("DELETE FROM business WHERE id = $1", [req.user.id]);
    res.clearCookie("refreshToken", cookieConfig);
    sendResponse(res, 200, "business deleted");
  } catch (error) {
    console.log(error);
    return sendResponse(res, 500, "internal server error");
  }
};
