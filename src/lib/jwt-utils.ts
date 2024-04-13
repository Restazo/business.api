import jwt from "jsonwebtoken";

import { pool } from "../db/db.js";

import { JwtCustomPayload } from "../schemas/types.js";

export const signTokens = (payload: object) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (
  token: string
): { payload: JwtCustomPayload | null } => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return { payload: decoded as JwtCustomPayload };
  } catch (error) {
    return { payload: null };
  }
};

export const verifyRefreshToken = (
  token: string
): { payload: JwtCustomPayload | null } => {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    return { payload: decoded as JwtCustomPayload };
  } catch (error) {
    return { payload: null };
  }
};

export const updateRefreshToken = async (
  refreshToken: string,
  businessId: string
) => {
  await pool.query("UPDATE business SET refresh_token = $1 WHERE id = $2", [
    refreshToken,
    businessId,
  ]);
};

export const deleteRefreshToken = async (businessId: string) => {
  await pool.query("UPDATE business SET refresh_token = NULL WHERE businessID = $1", [businessId]);
};
