import { Request, Response } from "express";
import * as z from "zod";
import sendResponse from "../lib/api-response.js";

import { ProfileResponseSchema } from "../schemas/schemas.js";

import {
  getRestaurantById,
  getRestaurantAddressById,
  getRestaurantsByBusinessId,
  getRestaurantMenuByRestaurantId,
} from "../data/restaurant.js";

/* *********************** Get Profile Controller *********************** */
export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const businessId = req.user.id;

    // Fetch all restaurants associated with the business ID
    const restaurants = await getRestaurantsByBusinessId(businessId);

    // Check for restaurant
    if (!restaurants) {
      return sendResponse(res, 404, "no restaurants found");
    }

    const data: z.infer<typeof ProfileResponseSchema>[] = [];

    // Loop through every restaurant
    for (const restaurant of restaurants) {
      const restaurantData = await getRestaurantById(restaurant.id);
      const restaurantAddress = await getRestaurantAddressById(restaurant.id);

      if (!restaurantData || !restaurantAddress) {
        return sendResponse(res, 500, "internal server error");
      }

      const { business_id, ...restaurantDataWithoutBusinessId } =
        restaurantData;

      const restaurantWithAddress = {
        restaurant: {
          ...restaurantDataWithoutBusinessId,
          address: restaurantAddress,
        },
      };

      data.push(restaurantWithAddress);
    }

    sendResponse(res, 200, "restaurants fetched succesfully", data);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Get Menu Controller *********************** */
export const getMenu = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const menu = await getRestaurantMenuByRestaurantId(id);

    sendResponse(res, 200, "restaurants fetched succesfully", menu);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
