import { pool } from "../db/db.js";

import { TableSchema } from "../schemas/schemas.js";
import { Table } from "../schemas/types.js";

export const getTableById = async (tableId: string): Promise<Table | null> => {
  try {
    const query = `
    SELECT 
      id, label, capacity, restaurant_id, AS "restaurantId", table_hash as "tableHash"
      FROM restaurant_table
      WHERE id = $1
    `;

    const result = await pool.query(query, [tableId] as any);

    const data = result.rows[0];

    if (!data) {
      return null;
    }

    const validatedData = TableSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error from getTableById function");
    throw error;
  }
};

export const getTableByLabelAndRestaurantId = async (
  label: string,
  restaurantId: string
): Promise<Table | null> => {
  try {
    const query = `
    SELECT 
      id, label, capacity, restaurant_id AS "restaurantId", table_hash as "tableHash"
      FROM restaurant_table
      WHERE restaurant_id = $1
      AND label = $2
    `;

    const result = await pool.query(query, [restaurantId, label] as any);

    const data = result.rows[0];

    if (!data) {
      return null;
    }

    const validatedData = TableSchema.parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error from getTableByLabelAndRestaurantId function");
    throw error;
  }
};

export const getTablesByRestaurantId = async (
  restaurantId: string
): Promise<Table[] | null> => {
  try {
    const query = `
    SELECT 
      id, label, capacity, restaurant_id AS "restaurantId", table_hash as "tableHash"
      FROM restaurant_table
      WHERE restaurant_id = $1
    `;

    const result = await pool.query(query, [restaurantId] as any);

    const data = result.rows;

    if (!data) {
      return null;
    }

    const validatedData = TableSchema.array().parse(data);

    return validatedData;
  } catch (error) {
    console.error("Error from getTablesByRestaurantId function");
    throw error;
  }
};
