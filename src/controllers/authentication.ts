import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";
import { registerBusiness } from "../lib/register-business.js";
import { validateAddress } from "../lib/validate-address.js";
import {
  signTokens,
  deleteRefreshToken,
  updateRefreshToken,
} from "../lib/jwt-utils.js";
import { getBusinessByEmail } from "../data/business.js";

import { cookieConfig } from "../config.js";

import { RegisterSchema, LoginSchema } from "../schemas/schemas.js";
import { AddressValidationResult, ExtendedAddress } from "../schemas/types.js";

/* *********************** Register Controller *********************** */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedFields = RegisterSchema.safeParse(req.body);

    if (!validatedFields.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const {
      email,
      password,
      confirm_password,
      business_name,
      restaurant_name,
      card,
      address,
    } = validatedFields.data;

    // Check if passwords match
    if (password !== confirm_password) {
      return sendResponse(res, 400, "passwords do not match");
    }

    // Check if email is already registered
    const existingUser = await pool.query(
      "SELECT * FROM business WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return sendResponse(res, 409, "email is already registered");
    }

    // Check if address is valid
    const addressValidationResult: AddressValidationResult =
      await validateAddress(address);

    if (!addressValidationResult?.data) {
      return sendResponse(res, 400, "invalid address");
    }

    const validatedAddress = addressValidationResult.data;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register the business
    const registrationSuccesful = await registerBusiness(
      email,
      hashedPassword,
      business_name,
      restaurant_name,
      card,
      validatedAddress
    );

    if (!registrationSuccesful) {
      return sendResponse(res, 500, "error registering business");
    }

    const accessToken = registrationSuccesful.accessToken;
    const refreshToken = registrationSuccesful.refreshToken;

    // Set tokens in cookies & header
    res.setHeader("Authorization", `Bearer ${accessToken}`);

    res.cookie("refreshToken", refreshToken, cookieConfig);

    return sendResponse(res, 200, "registration successful");
  } catch (error: any) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Login Controller *********************** */
export const logIn = async (req: Request, res: Response) => {
  try {
    const validatedData = LoginSchema.safeParse(req.body);

    if (!validatedData.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const { email, password } = validatedData.data;

    // Check if user exists
    const existingUser = await getBusinessByEmail(email);

    if (!existingUser) {
      return sendResponse(res, 401, "invalid email or password");
    }

    // Check if password is correct
    const isCorrectPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isCorrectPassword) {
      return sendResponse(res, 401, "invalid email or password");
    }

    // Create JWT tokens
    const { accessToken, refreshToken } = signTokens({
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    });

    // Update refresh token in DB
    await updateRefreshToken(refreshToken, existingUser.id);

    // Set access token in cookies
    res.cookie("refreshToken", refreshToken, cookieConfig);
    res.setHeader("Authorization", `Bearer ${accessToken}`);

    return sendResponse(res, 200, "login succesful");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Get Session Controller *********************** */
export const getSession = async (req: Request, res: Response) => {
  try {
    const data = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    };
    return sendResponse(res, 200, "valid session", data);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Logout Controller *********************** */
export const logOut = async (req: Request, res: Response) => {
  try {
    await deleteRefreshToken(req.user.id);

    res.clearCookie("refreshToken", cookieConfig);
    return sendResponse(res, 200, "logout succesful");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
