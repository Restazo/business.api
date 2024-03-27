import { NextFunction, Request, Response } from "express";
import sendResponse from "../lib/api-response.js";
import { signTokens, updateRefreshToken } from "../lib/jwt-utils.js";

import { cookieConfig } from "../config.js";

const protect = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendResponse(res, 403, "invalid session");
  }

  const { accessToken, refreshToken } = signTokens({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  });

  await updateRefreshToken(refreshToken, req.user.id);

  res.cookie("refreshToken", refreshToken, cookieConfig);
  res.setHeader("Authorization", `Bearer ${accessToken}`);
  return next();
};

export default protect;
