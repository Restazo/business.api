import { pool } from "../db/db.js";

import { Menu } from "../schemas/types.js";
import { MenuSchema } from "../schemas/schemas.js";

export const getMenuByRestaurantId = async (id: string): Promise<Menu> => {
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
    LEFT JOIN 
      menu_item mi ON mc.id = mi.category_id
    WHERE
      mc.restaurant_id = $1
    `;

    const result = await pool.query(query, [id]);

    const existingData = result.rows[0];

    // If no data return early
    if (!existingData) {
      return [];
    }

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
      if (row.item_id !== null) {
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
      }
    });

    const menu = Array.from(menuMap.values());

    const validatedMenu = MenuSchema.parse(menu);

    return validatedMenu;
  } catch (error) {
    console.error("Error from getRestaurantMenuByRestaurantId function");
    throw error;
  }
};

export const getMenuCategoryByLabelAndRestaurantId = async (
  label: string,
  restaurantId: string
) => {
  try {
    const query = `
    SELECT
      id, label
    FROM
      menu_category
    WHERE restaurant_id = $1
    AND label = $2
    `;

    const queryResult = await pool.query(query, [restaurantId, label]);

    const data = queryResult.rows[0];

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error from getMenuCategory function");
    throw error;
  }
};

export const getMenuCategoryById = async (menuCategoryId: string) => {
  try {
    const query = `
    SELECT
      id, label
    FROM
      menu_category
    WHERE id = $1
    `;

    const queryResult = await pool.query(query, [menuCategoryId]);

    const data = queryResult.rows[0];

    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error from getMenuCategoryById  function");
    throw error;
  }
};
