import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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

    // If no access token or refresh token
    if (!accessToken || !refreshToken) {
      return next();
    }

    const accessTokenPayload: any = jwt.decode(accessToken);
    const refreshTokenPayload: any = jwt.decode(refreshToken);

    // If access or refresh token doesnt have payload Or property id
    if (
      !accessTokenPayload ||
      !refreshTokenPayload ||
      !("id" in accessTokenPayload) ||
      !("id" in refreshTokenPayload)
    ) {
      return next();
    }

    // If tokens ID does not match
    if (accessTokenPayload.id !== refreshTokenPayload.id) {
      return next();
    }

    const decodedAccessToken = verifyAccessToken(accessToken);
    const decodedRefreshToken = verifyRefreshToken(refreshToken);

    // For valid access token
    if (decodedAccessToken.payload) {
      try {
        const user = await getBusinessById(decodedAccessToken.payload.id);

        if (!user) {
          return next();
        }

        req.user = user;
        return next();
      } catch (error) {
        console.error(error);
        return next();
      }
    }

    if (!decodedAccessToken && !refreshToken) {
      return next();
    }

    // For expired access token, but refresh token is present
    if (!decodedAccessToken.payload && refreshToken) {
      // If not valid refresh token
      if (!decodedRefreshToken.payload) {
        return next();
      }

      // If valid refresh token verify if it matches DB
      try {
        const user = await getBusinessById(decodedRefreshToken.payload.id);

        if (!user) {
          return next();
        }

        // If refresh token doesnt match our DB token
        if (user?.refresh_token !== refreshToken) {
          return next();
        }
        req.user = user;
        return next();
      } catch (error) {
        console.error(error);
        return next();
      }
    }
  } catch (error) {
    console.error(error);
    return next();
  }
};

export default deserializeUser;
