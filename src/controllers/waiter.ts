import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";
import { generatePin } from "../lib/generate-pin.js";
import { getRestaurantById } from "../data/restaurant.js";
import {
  getWaiterByEmail,
  getWaiterById,
  getWaitersByRestaurantId,
} from "../data/waiter.js";

import {
  RegisterWaiterReqSchema,
  RegisterWaiterResSchema,
  UUIDSchema,
} from "../schemas/schemas.js";

/* *********************** Register waiter Controller *********************** */
export const registerWaiter = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    // Validate the request body
    const validatedRequest = RegisterWaiterReqSchema.safeParse(req.body);

    if (!validatedRequest.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const { email, name } = validatedRequest.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if email is already registered
    const existingWaiter = await getWaiterByEmail(email);

    if (existingWaiter) {
      return sendResponse(res, 409, "email is already registered");
    }

    const pin = generatePin().toString();

    // Hash pin
    const hashedPin = await bcrypt.hash(pin, 10);

    const insertQuery = `
      INSERT INTO waiter 
        (email, name, pin, restaurant_id) 
      VALUES
        ($1, $2, $3, $4)
    `;

    await pool.query(insertQuery, [email, name, hashedPin, restaurantId]);

    const data = RegisterWaiterResSchema.parse({
      email,
      name,
      pin,
    });

    return sendResponse(res, 200, "waiter registered succesfully", data);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Register waiter Controller *********************** */
export const deleteWaiter = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);
    const validatedParameter2 = UUIDSchema.safeParse(req.params.waiterId);

    if (!validatedParameter.success || !validatedParameter2.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;
    const waiterId = validatedParameter2.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if waiter exists within this restaurant
    const existingWaiter = await getWaiterById(waiterId);

    if (!existingWaiter || existingWaiter.restaurantId !== restaurantId) {
      return sendResponse(res, 404, "no waiter found");
    }

    const query = `
      DELETE FROM waiter
      WHERE id = $1
    `;

    await pool.query(query, [waiterId]);

    return sendResponse(res, 200, "waiter deleted succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Register waiter Controller *********************** */
export const getWaiters = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    const data = await getWaitersByRestaurantId(restaurantId);

    return sendResponse(res, 200, "waiters fetched succesfully", data);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
