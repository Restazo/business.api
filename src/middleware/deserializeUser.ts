import { NextFunction, Request, Response } from "express";

import { verifyAccessToken, verifyRefreshToken } from "../lib/jwt-utils.js";
import { getBusinessById } from "../data/business.js";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];

    const { refreshToken } = req.cookies;

    // If no access token
    if (!accessToken) {
      return next();
    }

    const decodedAccessToken = verifyAccessToken(accessToken);

    // For expired access token, but refresh token is present
    if (!decodedAccessToken.payload && refreshToken) {
      const decodedRefreshToken = verifyRefreshToken(refreshToken);

      // If not valid refresh token
      if (!decodedRefreshToken.payload) {
        console.log("refresh token is null");
        return next();
      }

      // If valid refresh token verify if it matches DB
      try {
        const user = await getBusinessById(decodedRefreshToken.payload.id);

        // If refresh token doesnt match our DB token
        if (user?.refresh_token !== refreshToken) {
          return next();
        }

        req.user = user;
        return next();
      } catch (error) {
        console.log(error);
        return next();
      }
    }

    // For valid access token
    if (decodedAccessToken.payload) {
      try {
        const user = await getBusinessById(decodedAccessToken.payload.id);
        req.user = user;
        return next();
      } catch (error) {
        console.log(error);
        return next();
      }
    }
  } catch (error) {
    console.log(error);
    return next();
  }
};

export default deserializeUser;
