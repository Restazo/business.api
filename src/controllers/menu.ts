import { Request, Response } from "express";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";

import { getRestaurantById } from "../data/restaurant.js";
import {
  getMenuByRestaurantId,
  getMenuCategoryByLabelAndRestaurantId,
  getMenuCategoryById,
} from "../data/menu.js";

import {
  UUIDSchema,
  MenuSchema,
  CreateOrEditMenuCategoryReqSchema,
} from "../schemas/schemas.js";

/* *********************** Get Menu Controller *********************** */
export const getMenu = async (req: Request, res: Response) => {
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

    const menu = await getMenuByRestaurantId(restaurantId);

    const validatedMenu = MenuSchema.parse(menu);

    sendResponse(res, 200, "menu fetched succesfully", validatedMenu);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Add Menu Category Controller *********************** */
export const addMenuCategory = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    // validate req body

    const validatedRequest = CreateOrEditMenuCategoryReqSchema.safeParse(
      req.body
    );

    if (!validatedRequest.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const { label } = validatedRequest.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if label already exists
    const existingCategory = await getMenuCategoryByLabelAndRestaurantId(
      label,
      restaurantId
    );

    if (existingCategory) {
      return sendResponse(res, 409, "label is already registered");
    }

    // Insert data if its not duplicate label

    const insertQuery = `
     INSERT INTO menu_category 
      (restaurant_id, label) VALUES($1, $2)
     `;

    await pool.query(insertQuery, [restaurantId, label]);

    sendResponse(res, 200, "menu category registered succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Edit Menu Category Controller *********************** */
export const editMenuCategory = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);
    const validatedParameter2 = UUIDSchema.safeParse(req.params.menuCategoryId);

    if (!validatedParameter.success || !validatedParameter2.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;
    const menuCategoryId = validatedParameter2.data;

    // validate req body

    const validatedRequest = CreateOrEditMenuCategoryReqSchema.safeParse(
      req.body
    );

    if (!validatedRequest.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const { label } = validatedRequest.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if new label already exists
    const existingCategory = await getMenuCategoryByLabelAndRestaurantId(
      label,
      restaurantId
    );

    if (existingCategory) {
      return sendResponse(res, 409, "label is already registered");
    }

    // Insert data if its not duplicate label

    const query = `
  UPDATE menu_category
    SET
      label = $1
    WHERE
      id = $2
    `;

    await pool.query(query, [label, menuCategoryId]);

    sendResponse(res, 200, "menu category updated succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Delete Menu Category Controller *********************** */
export const deleteMenuCategory = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);
    const validatedParameter2 = UUIDSchema.safeParse(req.params.menuCategoryId);

    if (!validatedParameter.success || !validatedParameter2.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;
    const menuCategoryId = validatedParameter2.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    const existingMenuCategory = await getMenuCategoryById(menuCategoryId);

    if (!existingMenuCategory) {
      return sendResponse(res, 404, "no menu category found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // delete data

    const query = `
  DELETE FROM
   menu_category
  WHERE
    id = $1
    `;

    await pool.query(query, [menuCategoryId]);

    sendResponse(res, 200, "menu category deleted succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
