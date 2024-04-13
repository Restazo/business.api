import { pool } from "../db/db.js";

import { Restaurant, ExtendedAddress } from "../schemas/types.js";
import { RestaurantSchema, ExtendedAddressSchema } from "../schemas/schemas.js";

export const getRestaurantsByBusinessId = async (
  businessId: string
): Promise<Restaurant[] | null> => {
  try {
    const existingRestaurants = await pool.query(
      "SELECT * FROM restaurant where business_id = $1",
      [businessId]
    );

    if (existingRestaurants.rows.length === 0) {
      return null;
    }

    // Map through the rows
    const restaurants: unknown[] = existingRestaurants.rows.map(
      (restaurant) => ({
        ...restaurant,
      })
    );

    const valdatedRestaurants = RestaurantSchema.array().parse(restaurants);

    return valdatedRestaurants;
  } catch (error) {
    console.error("Error from getRestaurantsByBusinessId function");
    throw error;
  }
};

export const getRestaurantById = async (
  id: string
): Promise<Restaurant | null> => {
  try {
    const existingRestaurant = await pool.query(
      "SELECT * FROM restaurant WHERE id = $1",
      [id]
    );

    if (existingRestaurant.rows.length === 0) {
      return null;
    }

    const restaurant = existingRestaurant.rows[0];

    if (restaurant.logoImage) {
      restaurant.logoImage = `${process.env.ASSETS_URL}${restaurant.logoImage}`;
    }
    if (restaurant.coverImage) {
      restaurant.coverImage = `${process.env.ASSETS_URL}${restaurant.coverImage}`;
    }

    const validatedRestaurant = RestaurantSchema.parse(restaurant);

    return validatedRestaurant;
  } catch (error) {
    console.error("Error from getRestaurantById function");
    throw error;
  }
};

export const getRestaurantAddressById = async (
  id: string
): Promise<ExtendedAddress | null> => {
  try {
    const existingAddress = await pool.query(
      "SELECT address_line, city, postal_code, country_code, latitude, longitude FROM restaurant_address WHERE restaurant_id = $1",
      [id]
    );

    if (existingAddress.rows.length === 0) {
      return null;
    }

    const address = existingAddress.rows[0];

    // Validate the address before returning it
    const validatedAddress = ExtendedAddressSchema.parse(address);

    return validatedAddress;
  } catch (error) {
    console.error("Error from getRestaurantAddressById function");
    throw error;
  }
};
