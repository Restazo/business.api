import { Request, Response } from "express";

import sendResponse from "../lib/api-response.js";

import { getRestaurantById } from "../data/restaurant.js";
import { getRestaurantMenuByRestaurantId } from "../data/menu.js";

import { UUIDSchema, MenuSchema } from "../schemas/schemas.js";

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

    const menu = await getRestaurantMenuByRestaurantId(restaurantId);

    const validatedMenu = MenuSchema.parse(menu);

    sendResponse(res, 200, "menu fetched succesfully", validatedMenu);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
