import { pool } from "../db/db.js";
import * as z from "zod";

import { Restaurant, ExtendedAddress, Menu } from "../schemas/types.js";
import {
  RestaurantSchema,
  MenuSchema,
  ExtendedAddressSchema,
} from "../schemas/schemas.js";

export const getRestaurantsByBusinessId = async (
  businessId: string
): Promise<Restaurant[] | null> => {
  try {
    const existingRestaurants = await pool.query(
      "SELECT * FROM restaurant where business_id = $1",
      [businessId]
    );

    console.log(businessId);

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

export const getRestaurantMenuByRestaurantId = async (
  id: string
): Promise<Menu | null> => {
  try {
    // Query to fetch menu categories along with their menu items for a specific restaurant
    const query = `
    SELECT
      mc.id,
      mc.label,
      mi.id AS item_id,
      mi.name AS item_name,
      mi.description AS item_description,
      mi.ingredients AS item_ingredients,
      mi.price_amount AS item_price_amount,
      mi.price_currency AS item_price_currency,
      mi.image AS item_image
    FROM
      menu_category mc
    JOIN 
      menu_item mi ON mc.id = mi.category_id
    WHERE
      mc.restaurant_id = $1
    `;

    const result = await pool.query(query, [id]);

    const menuMap = new Map();

    result.rows.forEach((row) => {
      // set category
      if (!menuMap.has(row.id)) {
        menuMap.set(row.id, {
          categoryId: row.id,
          categoryLabel: row.label,
          categoryItems: [],
        });
      }

      // add items to category
      const category = menuMap.get(row.id);
      category.categoryItems.push({
        id: row.item_id,
        name: row.item_name,
        image: `${process.env.ASSETS_URL}${row.item_image}`,
        description: row.item_description,
        ingredients: row.item_ingredients,
        priceAmount: row.item_price_amount,
        priceCurrency: row.item_price_currency,
      });
    });

    const menu = Array.from(menuMap.values());

    const validatedMenu = MenuSchema.parse(menu);

    return validatedMenu;
  } catch (error) {
    console.error("Error from getRestaurantMenuByRestaurantId function");
    throw error;
  }
};
