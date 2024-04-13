import { pool } from "../db/db.js";

import { Restaurant } from "../schemas/types.js";

export const updateProfile = async (restaurantObj: Restaurant) => {
  const client = await pool.connect();
  try {
    const query = `
  UPDATE restaurant
    SET
      description = $1,
      affordability = $2,
      logo_file_path = $3,
      cover_file_path = $4,
      listed = $5
    WHERE
      id = $6
    `;

    await client.query("BEGIN");

    const {
      description,
      affordability,
      logo_file_path,
      cover_file_path,
      listed,
      id,
    } = restaurantObj;

    await client.query(query, [
      description,
      affordability,
      logo_file_path,
      cover_file_path,
      listed,
      id,
    ] as any);

    await client.query("COMMIT");
    return;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error from updateProfileText function");
    throw error;
  } finally {
    client.release();
  }
};
