import { pool } from "../db/db.js";

import { ExtendedAddress } from "../schemas/types.js";
import { signTokens } from "./jwt-utils.js";

// A function to register business and restaurant data simultaneously
export const registerBusiness = async (
  email: string,
  hashedPassword: string,
  businessName: string,
  restaurantName: string,
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

    // Create JWT Tokens

    const { accessToken, refreshToken } = signTokens({
      id: businessId,
      name: businessName,
      email: email,
    });

    // Set refresh token
    await client.query("UPDATE business SET refresh_token = $1 WHERE id = $2", [
      refreshToken,
      businessId,
    ]);

    // Insert data into the restaurant table

    const restaurantResult = await client.query(
      "INSERT INTO restaurant (business_id, name) VALUES ($1, $2) RETURNING id",
      [businessId, restaurantName]
    );

    const restaurantId = restaurantResult.rows[0].id;

    const {
      latitude,
      longitude,
      address_line,
      city,
      postal_code,
      country_code,
    } = address;

    // Insert data into restaurant_address table

    await client.query(
      "INSERT INTO restaurant_address (latitude, longitude, address_line, city, postal_code, country_code, restaurant_id) VALUES($1, $2, $3, $4, $5, $6, $7)",
      [
        latitude,
        longitude,
        address_line,
        city,
        postal_code,
        country_code,
        restaurantId,
      ]
    );

    await client.query("COMMIT");

    // Return access token to be sent to client
    return { accessToken, refreshToken };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return;
  } finally {
    client.release();
  }
};
