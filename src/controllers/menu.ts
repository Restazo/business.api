import { Request, Response } from "express";
import path from "path";

import { pool } from "../db/db.js";
import sendResponse from "../lib/api-response.js";
import { uploadFile, deleteFile } from "../lib/file-utils.js";

import { getRestaurantById } from "../data/restaurant.js";
import {
  getMenuByRestaurantId,
  getMenuCategoryByLabelAndRestaurantId,
  getMenuCategoryById,
  getMenuItemById,
} from "../data/menu.js";

import {
  UUIDSchema,
  MenuSchema,
  CreateOrEditMenuCategoryReqSchema,
  AddMenuItemReqSchema,
  EditMenuItemReqSchema,
} from "../schemas/schemas.js";

const itemUploadPath = process.env.ITEM_IMAGE_UPLOAD_PATH;

/* *********************** Get Menu Controller *********************** */
export const getMenu = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    const menu = await getMenuByRestaurantId(restaurantId);

    const validatedMenu = MenuSchema.parse(menu);

    sendResponse(res, 200, "menu fetched succesfully", validatedMenu);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Add Menu Category Controller *********************** */
export const addMenuCategory = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);

    if (!validatedParameter.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;

    // validate req body

    const validatedRequest = CreateOrEditMenuCategoryReqSchema.safeParse(
      req.body
    );

    if (!validatedRequest.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const { label } = validatedRequest.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if label already exists
    const existingCategory = await getMenuCategoryByLabelAndRestaurantId(
      label,
      restaurantId
    );

    if (existingCategory) {
      return sendResponse(res, 409, "label is already registered");
    }

    // Insert data if its not duplicate label

    const insertQuery = `
     INSERT INTO menu_category 
      (restaurant_id, label) VALUES($1, $2)
     `;

    await pool.query(insertQuery, [restaurantId, label]);

    sendResponse(res, 200, "menu category registered succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Edit Menu Category Controller *********************** */
export const editMenuCategory = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);
    const validatedParameter2 = UUIDSchema.safeParse(req.params.menuCategoryId);

    if (!validatedParameter.success || !validatedParameter2.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;
    const menuCategoryId = validatedParameter2.data;

    // validate req body

    const validatedRequest = CreateOrEditMenuCategoryReqSchema.safeParse(
      req.body
    );

    if (!validatedRequest.success) {
      return sendResponse(res, 400, "invalid input or missing fields");
    }

    const { label } = validatedRequest.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if new label already exists
    const existingCategory = await getMenuCategoryByLabelAndRestaurantId(
      label,
      restaurantId
    );

    if (existingCategory) {
      return sendResponse(res, 409, "label is already registered");
    }

    // Insert data if its not duplicate label

    const query = `
  UPDATE menu_category
    SET
      label = $1
    WHERE
      id = $2
    `;

    await pool.query(query, [label, menuCategoryId]);

    sendResponse(res, 200, "menu category updated succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Delete Menu Category Controller *********************** */
export const deleteMenuCategory = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);
    const validatedParameter2 = UUIDSchema.safeParse(req.params.menuCategoryId);

    if (!validatedParameter.success || !validatedParameter2.success) {
      return sendResponse(res, 400, "invalid parameter values");
    }
    const restaurantId = validatedParameter.data;
    const menuCategoryId = validatedParameter2.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    const existingMenuCategory = await getMenuCategoryById(menuCategoryId);

    if (
      !existingMenuCategory ||
      existingMenuCategory.restaurantId !== existingRestaurant.id
    ) {
      return sendResponse(res, 404, "no menu category found");
    }

    // delete menu category
    const query = `
      DELETE FROM
        menu_category
      WHERE
        id = $1
    `;

    await pool.query(query, [menuCategoryId]);

    sendResponse(res, 200, "menu category deleted succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};

/* *********************** Add Menu Item Controller *********************** */
export const addMenuItem = async (req: Request, res: Response) => {
  // Validate parameter
  const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);
  const validatedParameter2 = UUIDSchema.safeParse(req.params.menuCategoryId);

  if (!validatedParameter.success || !validatedParameter2.success) {
    return sendResponse(res, 400, "invalid parameter values");
  }

  // Validate body and file
  const validatedRequest = AddMenuItemReqSchema.safeParse(req.body);

  if (!validatedRequest.success) {
    return sendResponse(res, 400, "invalid input or missing fields");
  }

  const requestData = validatedRequest.data;
  const restaurantId = validatedParameter.data;
  const menuCategoryId = validatedParameter2.data;

  const client = await pool.connect();

  try {
    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if the menu category exists
    const existingMenuCategory = await getMenuCategoryById(menuCategoryId);

    if (
      !existingMenuCategory ||
      existingMenuCategory.restaurantId !== restaurantId
    ) {
      return sendResponse(res, 404, "no menu category found");
    }

    await client.query("BEGIN");

    const insertTextQuery = `
      INSERT INTO menu_item
        (category_id, name, description, ingredients, price_amount, price_currency)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        id
    `;

    const insertTextQueryResult = await client.query(insertTextQuery, [
      menuCategoryId,
      requestData.name,
      requestData.description ?? null,
      requestData.ingredients,
      requestData.priceAmount,
      requestData.priceCurrency,
    ] as any);

    // If we have a file present
    if (req.file) {
      const itemId = insertTextQueryResult.rows[0].id;
      const imageExtension = path.extname(req.file.originalname); // extracting the extension from the uploaded image, example .png
      const filename = `${itemId}${imageExtension}`;
      const itemImagePath = `${itemUploadPath}/${filename}`;

      // Upload image to storage
      await uploadFile(itemUploadPath, filename, req.file.buffer);

      const insertImagePathQuery = `
      UPDATE menu_item
      SET
        image = $1
      WHERE
        id = $2
    `;
      // Insert item image path into the database
      await client.query(insertImagePathQuery, [itemImagePath, itemId]);
    }

    await client.query("COMMIT");

    sendResponse(res, 200, "menu item added succesfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  } finally {
    client.release();
  }
};

/* *********************** Edit Menu Item Controller *********************** */
export const editMenuItem = async (req: Request, res: Response) => {
  // Validate parameters
  const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);
  const validatedParameter2 = UUIDSchema.safeParse(req.params.menuCategoryId);
  const validatedParameter3 = UUIDSchema.safeParse(req.params.menuItemId);

  if (
    !validatedParameter.success ||
    !validatedParameter2.success ||
    !validatedParameter3.success
  ) {
    return sendResponse(res, 400, "invalid parameter values");
  }

  const restaurantId = validatedParameter.data;
  const menuCategoryId = validatedParameter2.data;
  const menuItemId = validatedParameter3.data;

  // Validate body and file
  const validatedRequest = EditMenuItemReqSchema.safeParse(req.body);

  if (!validatedRequest.success) {
    return sendResponse(res, 400, "invalid input or missing fields");
  }

  const requestData = validatedRequest.data;

  // If nothing was passed on the request
  if (Object.keys(requestData).length === 0 && !req.file) {
    return sendResponse(res, 400, "invalid input or missing fields");
  }

  // If conflicting requests (delete image and a file was passed)
  if (requestData.deleteItemImage && req.file) {
    return sendResponse(res, 400, "invalid input or missing fields");
  }

  const client = await pool.connect();
  try {
    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if the menu category exists within the provided restaurant
    const existingMenuCategory = await getMenuCategoryById(menuCategoryId);

    if (
      !existingMenuCategory ||
      existingMenuCategory.restaurantId !== existingRestaurant.id
    ) {
      return sendResponse(res, 404, "no menu category found");
    }

    // Check if item exists within the provided category
    const currentItemData = await getMenuItemById(menuItemId);

    if (!currentItemData || currentItemData.categoryId !== menuCategoryId) {
      return sendResponse(res, 404, "no menu item found");
    }

    await client.query("BEGIN");

    //If we have text data in the req.body
    if (Object.keys(requestData).length > 0) {
      const { deleteItemImage, ...dataToUpdate } = requestData;

      const newItemData = {
        ...currentItemData,
        ...dataToUpdate,
      };

      // If request to delete image, and a current image exists. Delete the image
      if (deleteItemImage && currentItemData.image !== null) {
        await deleteFile(`${currentItemData.image}`);
        newItemData.image = null;
      }

      // Update the new text data in the database
      const editTextQuery = `
      UPDATE menu_item
      SET
       name = $1,
       description = $2,
       ingredients = $3,
       price_amount = $4,
       price_currency = $5,
       image = $6
      WHERE id = $7
    `;

      await client.query(editTextQuery, [
        newItemData.name,
        newItemData.description === "" ? null : newItemData.description,
        newItemData.ingredients,
        newItemData.priceAmount,
        newItemData.priceCurrency,
        newItemData.image,
        menuItemId,
      ] as any);
    }

    // If there is an image in the request
    if (req.file) {
      const itemId = menuItemId;
      const newImageExtension = path.extname(req.file.originalname); // extracting the extension from the uploaded image, example .png
      const newImageName = `${itemId}${newImageExtension}`;
      const newItemImagePath = `${itemUploadPath}/${newImageName}`;

      // If the new image is not the same format as the old image. Manually delete the old before adding new image
      if (
        currentItemData.image !== null &&
        currentItemData.image !== newItemImagePath
      ) {
        await deleteFile(`${currentItemData.image}`);
      }

      // Upload new image to storage
      await uploadFile(itemUploadPath, newImageName, req.file.buffer);

      // Store the new item image path in the database
      const insertImagePathQuery = `
      UPDATE menu_item
      SET
        image = $1
      WHERE
        id = $2
    `;

      await client.query(insertImagePathQuery, [newItemImagePath, itemId]);
    }

    await client.query("COMMIT");

    sendResponse(res, 200, "menu item succesfully updated");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  } finally {
    client.release();
  }
};

/* *********************** Delete Menu Category Controller *********************** */
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    // Validate parameter
    const validatedParameter = UUIDSchema.safeParse(req.params.restaurantId);
    const validatedParameter2 = UUIDSchema.safeParse(req.params.menuCategoryId);
    const validatedParameter3 = UUIDSchema.safeParse(req.params.menuItemId);

    if (
      !validatedParameter.success ||
      !validatedParameter2.success ||
      !validatedParameter3.success
    ) {
      return sendResponse(res, 400, "invalid parameter values");
    }

    const restaurantId = validatedParameter.data;
    const menuCategoryId = validatedParameter2.data;
    const menuItemId = validatedParameter3.data;

    // Check for existing restaurant
    const existingRestaurant = await getRestaurantById(restaurantId);

    if (!existingRestaurant) {
      return sendResponse(res, 404, "no restaurant found");
    }

    // Check if user has permission
    if (existingRestaurant.business_id !== req.user.id) {
      return sendResponse(res, 403, "invalid session");
    }

    // Check if the menu category exists within the provided restaurant
    const existingMenuCategory = await getMenuCategoryById(menuCategoryId);

    if (
      !existingMenuCategory ||
      existingMenuCategory.restaurantId !== existingRestaurant.id
    ) {
      return sendResponse(res, 404, "no menu category found");
    }

    // Check if item exists within the provided category
    const currentItemData = await getMenuItemById(menuItemId);

    if (!currentItemData || currentItemData.categoryId !== menuCategoryId) {
      return sendResponse(res, 404, "no menu item found");
    }

    // Delete image if it exists
    if (currentItemData.image !== null) {
      await deleteFile(currentItemData.image);
    }

    // delete menu item
    const query = `
      DELETE FROM
        menu_item
      WHERE
        id = $1
    `;

    await pool.query(query, [menuItemId]);

    sendResponse(res, 200, "menu item deleted succesfully");
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, "internal server error");
  }
};
