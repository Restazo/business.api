import { Request, Response } from "express";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";

import { getRestaurantById } from "../data/restaurant.js";

import { getTableById, getTableByLabelAndRestaurantId } from "../data/table.js";

import {
  UUIDSchema,
  CreateTableReqSchema,
  DeleteTableParamSchema,
} from "../schemas/schemas.js";

/* *********************** Add Table Controller *********************** */
export const createTable = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // TODO CHECK IF USER HAS PERMISSION
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    const validatedRequest = CreateTableReqSchema.safeParse(req.body);

    if (!validatedRequest.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const { label, capacity } = validatedRequest.data;

    // Check if the label is not duplicate
    const existingLabel = await getTableByLabelAndRestaurantId(
      label,
      restaurantId
    );

    if (existingLabel) {
      return sendResponse(res, 409, "label is already registered");
    }

    // Insert data if its not duplicate label

    const insertQuery = `
    INSERT INTO restaurant_table 
     (restaurant_id, label, capacity) VALUES($1, $2, $3)
    `;

    await pool.query(insertQuery, [restaurantId, label, capacity] as any);

    return sendResponse(res, 200, "table registered succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Delete Table Controller *********************** */
export const deleteTable = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameters = DeleteTableParamSchema.safeParse(req.params);

    if (!validatedParameters.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const { restaurantId, tableId } = validatedParameters.data;

    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    const existingTable = await getTableById(tableId);

    if (!existingTable) {
      return sendResponse(res, 404, "no table found");
    }

    const query = `
    DELETE FROM restaurant_table
      WHERE id = $1
    `;

    await pool.query(query, [tableId]);

    return sendResponse(res, 200, "table deleted succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
