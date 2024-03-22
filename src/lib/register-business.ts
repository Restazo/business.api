import { z } from "zod";

import { pool } from "../db/db.js";

import { ExtendedAddress } from "../schemas/types.js";

// A function to register business and restaurant data simultaneously
export const registerBusiness = async (
  email: string,
  hashedPassword: string,
  businessName: string,
  card: string,
  address: ExtendedAddress
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    // Insert data into the business table
    const businessResult = await client.query(
      "INSERT INTO business (email, password, name, card) VALUES ($1, $2, $3, $4) RETURNING id",
      [email, hashedPassword, businessName, card]
    );

    const businessId = businessResult.rows[0].id;

    // Insert data into the restaurant table

    const restaurantResult = await client.query(
      "INSERT INTO restaurant (business_id) VALUES ($1) RETURNING id",
      [businessId]
    );

    const restaurantId = restaurantResult.rows[0].id;

    const {
      latitude,
      longitude,
      address_line,
      locality,
      postal_code,
      country_code,
    } = address;

    // Insert data into restaurant_address table

    console.log(
      latitude,
      longitude,
      address_line,
      locality,
      postal_code,
      country_code,
      restaurantId
    );
    await client.query(
      "INSERT INTO restaurant_address (latitude, longitude, address_line, locality, postal_code, country_code, restaurant_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
      [
        latitude,
        longitude,
        address_line,
        locality,
        postal_code,
        country_code,
        restaurantId,
      ]
    );

    await client.query("COMMIT");

    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return false;
  } finally {
    client.release();
  }
};
