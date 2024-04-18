import { pool } from "../db/db.js";

import { Waiter } from "../schemas/types.js";
import { WaiterSchema } from "../schemas/schemas.js";

export const getWaiterByEmailAndRestaurantId = async (
  email: string,
  restaurantId: string
): Promise<Waiter | null> => {
  try {
    const query = `
      SELECT id, email, name, restaurant_id AS "restaurantId"
      FROM waiter 
      WHERE email = $1
      AND restaurant_id = $2
    `;

    const queryResult = await pool.query(query, [email, restaurantId]);

    const data = queryResult.rows[0];

    if (!data) {
      return null;
    }

    const validatedData = WaiterSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error from getWaiterByEmail function");
    throw error;
  }
};

export const getWaiterById = async (
  waiterId: string
): Promise<Waiter | null> => {
  try {
    const query = `
      SELECT id, email, name, restaurant_id AS "restaurantId"
      FROM waiter 
      WHERE id = $1
    `;

    const queryResult = await pool.query(query, [waiterId]);

    const data = queryResult.rows[0];

    if (!data) {
      return null;
    }

    const validatedData = WaiterSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error from getWaiterById function");
    throw error;
  }
};

export const getWaitersByRestaurantId = async (
  restaurantId: string
): Promise<Omit<Waiter, "restaurantId">[] | []> => {
  try {
    const query = `
      SELECT id, email, name
      FROM waiter 
      WHERE restaurant_id = $1
    `;

    const queryResult = await pool.query(query, [restaurantId]);

    if (queryResult.rows.length === 0) {
      return [];
    }

    const data = queryResult.rows.map((waiter) => ({
      ...waiter,
    }));

    const validatedData = WaiterSchema.omit({ restaurantId: true })
      .array()
      .parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error from getWaitersByRestaurantId  function");
    throw error;
  }
};
