import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";
import { registerBusiness } from "../lib/register-business.js";
import { validateAddress } from "../lib/validate-address.js";

import { RegisterSchema } from "../schemas/schemas.js";
import { AddressValidationResult, ExtendedAddress } from "../schemas/types.js";

/* *********************** Register Controller *********************** */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validatedFields = RegisterSchema.safeParse(req.body);

    if (!validatedFields.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const { email, password, confirm_password, business_name, card, address } =
      validatedFields.data;

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
      return sendResponse(res, 409, "email already registered");
    }

    // Check if address is valid

    const addressValidationResult: AddressValidationResult = await validateAddress(address);

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
      card,
      validatedAddress
    );

    if (!registrationSuccesful) {
      console.log("Registration function failed")
      return sendResponse(res, 500, "error registering business");
    }

    return sendResponse(res, 200, "registration successful");
  } catch (error: any) {
    console.log(error);
    return sendResponse(res, 500, "internal server error");
  }
};
