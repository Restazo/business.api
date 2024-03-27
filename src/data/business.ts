import { pool } from "../db/db.js";

import { Business } from "../schemas/types.js";

export const getBusinessById = async (id: string) => {
  try {
    const existingBusiness = await pool.query(
      "SELECT * FROM business WHERE id = $1",
      [id]
    );

    if (existingBusiness.rows.length < 0) {
      return null;
    }

    const business: Business = existingBusiness.rows[0];

    return business;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getBusinessByEmail = async (email: string) => {
  try {
    const existingBusiness = await pool.query(
      "SELECT * FROM business WHERE email = $1",
      [email]
    );

    if (existingBusiness.rows.length <= 0) {
      return null;
    }

    const business: Business = existingBusiness.rows[0];

    return business;
  } catch (error) {
    console.error(error);
    return null;
  }
};
