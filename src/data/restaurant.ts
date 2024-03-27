import { pool } from "../db/db.js";

import { Restaurant, ExtendedAddress } from "../schemas/types.js";

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

    const restaurant: Restaurant = existingRestaurant.rows[0];

    return restaurant;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getRestaurantAddressById = async (
  id: string
): Promise<ExtendedAddress | null> => {
  try {
    const existingAddress = await pool.query(
      "SELECT * FROM restaurant_address WHERE id = $1",
      [id]
    );

    if (existingAddress.rows.length === 0) {
      return null;
    }

    const address: ExtendedAddress = existingAddress.rows[0];

    return address;
  } catch (error) {
    console.error(error);
    return null;
  }
};
